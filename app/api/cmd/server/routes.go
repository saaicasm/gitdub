package main

import (
	"net/http"

	handler "github.com/saaicasm/gitdub/internal/http"
)

func registerRoutes(h *handler.Handler) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/repos/{owner}/{name}/metadata", h.GetMetadata)
	mux.HandleFunc("GET /api/v1/repos/{owner}/{name}/issues", h.ListIssues)
	mux.HandleFunc("GET /api/v1/repos/{owner}/{name}/issues/{number}", h.GetIssue)
	mux.HandleFunc("GET /api/v1/repos/{owner}/{name}/tree", h.ListTree)
	mux.HandleFunc("GET /api/v1/repos/{owner}/{name}/stack", h.GetStack)
	mux.HandleFunc("GET /api/v1/repos/{owner}/{name}/blob", h.GetBlob)
	return mux
}
