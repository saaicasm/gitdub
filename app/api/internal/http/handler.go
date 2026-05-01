package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/saaicasm/gitdub/internal/repo"
)

type Handler struct {
	fetcher repo.Fetcher
}

func NewHandler(fetcher repo.Fetcher) *Handler {
	return &Handler{fetcher: fetcher}
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

type metadataResponse struct {
	Data *repo.Metadata `json:"data"`
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
