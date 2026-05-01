package github

import (
	"context"
	"errors"
	"net/http"

	gh "github.com/google/go-github/v66/github"

	"github.com/saaicasm/gitdub/internal/issues"
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

func (c *Client) Fetch(ctx context.Context, owner, name string) (*repo.Metadata, error) {
	r, resp, err := c.client.Repositories.Get(ctx, owner, name)
	if err != nil {
		return nil, translateError(err, resp)
	}
	return &repo.Metadata{
		AvatarURL:     r.GetOwner().GetAvatarURL(),
		Owner:         r.GetOwner().GetLogin(),
		Name:          r.GetName(),
		DefaultBranch: r.GetDefaultBranch(),
		Stars:         r.GetStargazersCount(),
	}, nil
}

func (c *Client) List(ctx context.Context, owner, name string, opts issues.ListOptions) ([]issues.Issue, error) {
	ghOpts := &gh.IssueListByRepoOptions{
		State: opts.State,
		ListOptions: gh.ListOptions{
			Page:    opts.Page,
			PerPage: opts.PerPage,
		},
	}

	raw, resp, err := c.client.Issues.ListByRepo(ctx, owner, name, ghOpts)
	if err != nil {
		return nil, translateError(err, resp)
	}

	out := make([]issues.Issue, 0, len(raw))
	for _, i := range raw {
		if i.IsPullRequest() {
			continue
		}
		out = append(out, mapIssue(i))
	}
	return out, nil
}

func mapIssue(i *gh.Issue) issues.Issue {
	labels := make([]issues.Label, 0, len(i.Labels))
	for _, l := range i.Labels {
		labels = append(labels, issues.Label{Name: l.GetName(), Color: l.GetColor()})
	}
	return issues.Issue{
		Number: i.GetNumber(),
		Title:  i.GetTitle(),
		State:  i.GetState(),
		Author: issues.User{
			Login:     i.GetUser().GetLogin(),
			AvatarURL: i.GetUser().GetAvatarURL(),
		},
		Labels:    labels,
		Comments:  i.GetComments(),
		CreatedAt: i.GetCreatedAt().Time,
		UpdatedAt: i.GetUpdatedAt().Time,
		URL:       i.GetHTMLURL(),
	}
}

func translateError(err error, resp *gh.Response) error {
	var rle *gh.RateLimitError
	if errors.As(err, &rle) {
		return repo.ErrRateLimited
	}
	if resp != nil && resp.StatusCode == http.StatusNotFound {
		return repo.ErrNotFound
	}
	return err
}
