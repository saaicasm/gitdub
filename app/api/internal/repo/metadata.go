package repo

import (
	"context"
	"errors"
	"time"
)

var (
	ErrNotFound    = errors.New("repo: not found")
	ErrRateLimited = errors.New("repo: rate limited")
)

type Metadata struct {
	AvatarURL       string    `json:"avatarUrl"`
	Owner           string    `json:"owner"`
	Name            string    `json:"name"`
	DefaultBranch   string    `json:"defaultBranch"`
	Stars           int       `json:"stars"`
	Description     string    `json:"description"`
	Topics          []string  `json:"topics"`
	Homepage        string    `json:"homepage"`
	Forks           int       `json:"forks"`
	Watchers        int       `json:"watchers"`
	OpenIssues      int       `json:"openIssues"`
	License         string    `json:"license"`
	PrimaryLanguage string    `json:"primaryLanguage"`
	CreatedAt       time.Time `json:"createdAt"`
	PushedAt        time.Time `json:"pushedAt"`
}

type Fetcher interface {
	Fetch(ctx context.Context, owner, name string) (*Metadata, error)
}
