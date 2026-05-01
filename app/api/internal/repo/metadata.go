package repo

import (
	"context"
	"errors"
)

var (
	ErrNotFound    = errors.New("repo: not found")
	ErrRateLimited = errors.New("repo: rate limited")
)

type Metadata struct {
	AvatarURL     string `json:"avatarUrl"`
	Owner         string `json:"owner"`
	Name          string `json:"name"`
	DefaultBranch string `json:"defaultBranch"`
	Stars         int    `json:"stars"`
}

type Fetcher interface {
	Fetch(ctx context.Context, owner, name string) (*Metadata, error)
}
