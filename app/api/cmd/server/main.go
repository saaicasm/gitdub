package main

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"

	"github.com/saaicasm/gitdub/internal/github"
	handler "github.com/saaicasm/gitdub/internal/http"
	"github.com/saaicasm/gitdub/internal/stack"
)

func main() {
	godotenv.Load()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	token := os.Getenv("GITHUB_TOKEN")
	if token == "" {
		logger.Error("GITHUB_TOKEN is not set")
		os.Exit(1)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	ghClient := github.NewClient(token)
	stackSvc := stack.NewService(ghClient, ghClient)
	h := handler.NewHandler(ghClient, ghClient, ghClient, stackSvc, ghClient)

	srv := newServer(config{port: port}, registerRoutes(h), logger)
	if err := srv.Run(); err != nil {
		logger.Error("server failed", "err", err)
		os.Exit(1)
	}
}
