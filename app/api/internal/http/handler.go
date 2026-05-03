package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/saaicasm/gitdub/internal/issues"
	"github.com/saaicasm/gitdub/internal/repo"
	"github.com/saaicasm/gitdub/internal/stack"
	"github.com/saaicasm/gitdub/internal/tree"
)

type Handler struct {
	fetcher    repo.Fetcher
	lister     issues.Lister
	treeLister tree.Lister
	analyzer   stack.Analyzer
}

func NewHandler(fetcher repo.Fetcher, lister issues.Lister, treeLister tree.Lister, analyzer stack.Analyzer) *Handler {
	return &Handler{fetcher: fetcher, lister: lister, treeLister: treeLister, analyzer: analyzer}
}

func (h *Handler) GetMetadata(w http.ResponseWriter, r *http.Request) {
	owner := r.PathValue("owner")
	name := r.PathValue("name")

	meta, err := h.fetcher.Fetch(r.Context(), owner, name)
	if err != nil {
		switch {
		case errors.Is(err, repo.ErrNotFound):
			writeError(w, http.StatusNotFound, "REPO_NOT_FOUND", errorItem{
				Type:    "not_found",
				Message: "Repository does not exist or is not accessible",
			})
		case errors.Is(err, repo.ErrRateLimited):
			writeError(w, http.StatusServiceUnavailable, "UPSTREAM_RATE_LIMITED", errorItem{
				Type:    "rate_limited",
				Message: "GitHub API rate limit exceeded",
			})
		default:
			writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", errorItem{
				Type:    "internal",
				Message: "Internal server error",
			})
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(metadataResponse{Data: meta})
}

func (h *Handler) ListIssues(w http.ResponseWriter, r *http.Request) {
	owner := r.PathValue("owner")
	name := r.PathValue("name")

	q := r.URL.Query()

	state := q.Get("state")
	if state != "open" && state != "closed" && state != "all" {
		state = "open"
	}

	page, _ := strconv.Atoi(q.Get("page"))
	if page < 1 {
		page = 1
	}

	perPage, _ := strconv.Atoi(q.Get("per_page"))
	if perPage < 1 {
		perPage = 30
	}
	if perPage > 100 {
		perPage = 100
	}

	list, err := h.lister.List(r.Context(), owner, name, issues.ListOptions{
		State:   state,
		Page:    page,
		PerPage: perPage,
	})
	if err != nil {
		switch {
		case errors.Is(err, repo.ErrNotFound):
			writeError(w, http.StatusNotFound, "REPO_NOT_FOUND", errorItem{
				Type:    "not_found",
				Message: "Repository does not exist or is not accessible",
			})
		case errors.Is(err, repo.ErrRateLimited):
			writeError(w, http.StatusServiceUnavailable, "UPSTREAM_RATE_LIMITED", errorItem{
				Type:    "rate_limited",
				Message: "GitHub API rate limit exceeded",
			})
		default:
			writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", errorItem{
				Type:    "internal",
				Message: "Internal server error",
			})
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(issuesResponse{Data: list})
}

func (h *Handler) ListTree(w http.ResponseWriter, r *http.Request) {
	owner := r.PathValue("owner")
	name := r.PathValue("name")
	path := r.URL.Query().Get("path")

	entries, err := h.treeLister.ListTree(r.Context(), owner, name, path)
	if err != nil {
		switch {
		case errors.Is(err, repo.ErrNotFound):
			writeError(w, http.StatusNotFound, "REPO_NOT_FOUND", errorItem{
				Type:    "not_found",
				Message: "Repository or path does not exist",
			})
		case errors.Is(err, repo.ErrRateLimited):
			writeError(w, http.StatusServiceUnavailable, "UPSTREAM_RATE_LIMITED", errorItem{
				Type:    "rate_limited",
				Message: "GitHub API rate limit exceeded",
			})
		default:
			writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", errorItem{
				Type:    "internal",
				Message: "Internal server error",
			})
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(treeResponse{Data: entries})
}

func (h *Handler) GetStack(w http.ResponseWriter, r *http.Request) {
	owner := r.PathValue("owner")
	name := r.PathValue("name")

	stk, err := h.analyzer.Analyze(r.Context(), owner, name)
	if err != nil {
		switch {
		case errors.Is(err, repo.ErrNotFound):
			writeError(w, http.StatusNotFound, "REPO_NOT_FOUND", errorItem{
				Type:    "not_found",
				Message: "Repository does not exist or is not accessible",
			})
		case errors.Is(err, repo.ErrRateLimited):
			writeError(w, http.StatusServiceUnavailable, "UPSTREAM_RATE_LIMITED", errorItem{
				Type:    "rate_limited",
				Message: "GitHub API rate limit exceeded",
			})
		default:
			writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", errorItem{
				Type:    "internal",
				Message: "Internal server error",
			})
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(stackResponse{Data: stk})
}

type stackResponse struct {
	Data *stack.Stack `json:"data"`
}

type metadataResponse struct {
	Data *repo.Metadata `json:"data"`
}

type issuesResponse struct {
	Data []issues.Issue `json:"data"`
}

type treeResponse struct {
	Data []tree.Entry `json:"data"`
}

type errorResponse struct {
	Status    int         `json:"status"`
	Code      string      `json:"code"`
	Timestamp time.Time   `json:"timestamp"`
	Errors    []errorItem `json:"errors"`
}

type errorItem struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

func writeError(w http.ResponseWriter, status int, code string, errs ...errorItem) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(errorResponse{
		Status:    status,
		Code:      code,
		Timestamp: time.Now().UTC(),
		Errors:    errs,
	})
}
