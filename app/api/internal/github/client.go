package github

import (
	"context"
	"errors"
	"net/http"

	gh "github.com/google/go-github/v66/github"

	"github.com/saaicasm/gitdub/internal/repo"
)

type Client struct {
	client *gh.Client
}

func NewClient(token string) *Client {
	return &Client{
		client: gh.NewClient(nil).WithAuthToken(token),
	}
}

var _ repo.Fetcher = (*Client)(nil)

func (c *Client) Fetch(ctx context.Context, owner, name string) (*repo.Metadata, error) {
	r, resp, err := c.client.Repositories.Get(ctx, owner, name)
	if err != nil {
		var rle *gh.RateLimitError
		if errors.As(err, &rle) {
			return nil, repo.ErrRateLimited
		}
		if resp != nil && resp.StatusCode == http.StatusNotFound {
			return nil, repo.ErrNotFound
		}
		return nil, err
	}
	return &repo.Metadata{
		AvatarURL:     r.GetOwner().GetAvatarURL(),
		Owner:         r.GetOwner().GetLogin(),
		Name:          r.GetName(),
		DefaultBranch: r.GetDefaultBranch(),
		Stars:         r.GetStargazersCount(),
	}, nil
}
