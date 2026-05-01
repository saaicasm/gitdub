package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type config struct {
	port string
}

type server struct {
	cfg     config
	handler http.Handler
	logger  *slog.Logger
}

func newServer(cfg config, h http.Handler, logger *slog.Logger) *server {
	return &server{cfg: cfg, handler: h, logger: logger}
}

func (s *server) Run() error {
	srv := &http.Server{
		Addr:              ":" + s.cfg.port,
		Handler:           s.handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	shutdownError := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		sg := <-quit

		s.logger.Info("server shutting down", "signal", sg.String())

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		shutdownError <- srv.Shutdown(ctx)
	}()

	s.logger.Info("server listening", "addr", srv.Addr)

	err := srv.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	if err := <-shutdownError; err != nil {
		return err
	}

	s.logger.Info("server stopped cleanly")
	return nil
}
