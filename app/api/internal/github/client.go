package github

import (
	"context"
	"errors"
	"net/http"
	"path"
	"sort"
	"strings"
	"unicode/utf8"

	gh "github.com/google/go-github/v66/github"
	"golang.org/x/sync/errgroup"

	"github.com/saaicasm/gitdub/internal/blob"
	"github.com/saaicasm/gitdub/internal/issues"
	"github.com/saaicasm/gitdub/internal/repo"
	"github.com/saaicasm/gitdub/internal/tree"
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

	license := ""
	if r.License != nil {
		license = r.License.GetSPDXID()
	}

	homepage := ""
	if r.Homepage != nil {
		homepage = *r.Homepage
	}

	return &repo.Metadata{
		AvatarURL:       r.GetOwner().GetAvatarURL(),
		Owner:           r.GetOwner().GetLogin(),
		Name:            r.GetName(),
		DefaultBranch:   r.GetDefaultBranch(),
		Stars:           r.GetStargazersCount(),
		Description:     r.GetDescription(),
		Topics:          r.Topics,
		Homepage:        homepage,
		Forks:           r.GetForksCount(),
		Watchers:        r.GetWatchersCount(),
		OpenIssues:      r.GetOpenIssuesCount(),
		License:         license,
		PrimaryLanguage: r.GetLanguage(),
		CreatedAt:       r.GetCreatedAt().Time,
		PushedAt:        r.GetPushedAt().Time,
	}, nil
}

func (c *Client) List(ctx context.Context, owner, name string, opts issues.ListOptions) (*issues.IssueListResult, error) {
	ghOpts := &gh.IssueListByRepoOptions{
		State: opts.State,
		ListOptions: gh.ListOptions{
			Page:    opts.Page,
			PerPage: opts.PerPage,
		},
	}

	if len(opts.Labels) > 0 {
		ghOpts.Labels = opts.Labels
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

	hasNext := resp.NextPage != 0
	return &issues.IssueListResult{
		Items:   out,
		Page:    opts.Page,
		PerPage: opts.PerPage,
		HasNext: hasNext,
	}, nil
}

func (c *Client) Detail(ctx context.Context, owner, name string, number int) (*issues.IssueDetail, error) {
	var (
		rawIssue    *gh.Issue
		rawComments []*gh.IssueComment
	)

	g, gctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		i, resp, err := c.client.Issues.Get(gctx, owner, name, number)
		if err != nil {
			return translateError(err, resp)
		}
		rawIssue = i
		return nil
	})

	g.Go(func() error {
		cs, resp, err := c.client.Issues.ListComments(gctx, owner, name, number, &gh.IssueListCommentsOptions{
			ListOptions: gh.ListOptions{PerPage: 100},
		})
		if err != nil {
			return translateError(err, resp)
		}
		rawComments = cs
		return nil
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}

	detail := &issues.IssueDetail{
		Issue: mapIssue(rawIssue),
		Body:  rawIssue.GetBody(),
	}
	if rawIssue.ClosedAt != nil {
		t := rawIssue.ClosedAt.Time
		detail.ClosedAt = &t
	}

	detail.Comments = make([]issues.Comment, 0, len(rawComments))
	for _, gc := range rawComments {
		detail.Comments = append(detail.Comments, issues.Comment{
			ID: gc.GetID(),
			Author: issues.User{
				Login:     gc.GetUser().GetLogin(),
				AvatarURL: gc.GetUser().GetAvatarURL(),
			},
			Body:      gc.GetBody(),
			CreatedAt: gc.GetCreatedAt().Time,
			UpdatedAt: gc.GetUpdatedAt().Time,
		})
	}

	sort.SliceStable(detail.Comments, func(i, j int) bool {
		return detail.Comments[i].CreatedAt.Before(detail.Comments[j].CreatedAt)
	})

	return detail, nil
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

func (c *Client) ListTree(ctx context.Context, owner, name, path string) ([]tree.Entry, error) {
	_, dir, resp, err := c.client.Repositories.GetContents(ctx, owner, name, path, nil)
	if err != nil {
		return nil, translateError(err, resp)
	}

	out := make([]tree.Entry, 0, len(dir))
	for _, e := range dir {
		out = append(out, tree.Entry{
			Path: e.GetPath(),
			Name: e.GetName(),
			Type: e.GetType(),
			Size: int64(e.GetSize()),
			SHA:  e.GetSHA(),
		})
	}

	sort.SliceStable(out, func(i, j int) bool {
		a, b := out[i], out[j]
		if (a.Type == "dir") != (b.Type == "dir") {
			return a.Type == "dir"
		}
		return strings.ToLower(a.Name) < strings.ToLower(b.Name)
	})

	return out, nil
}

const maxBlobSize = 1024 * 1024 // 1 MB

var binaryExts = map[string]struct{}{
	".png": {}, ".jpg": {}, ".jpeg": {}, ".gif": {}, ".webp": {}, ".ico": {},
	".pdf": {}, ".zip": {}, ".tar": {}, ".gz": {}, ".tgz": {}, ".bz2": {}, ".7z": {},
	".exe": {}, ".dll": {}, ".so": {}, ".dylib": {}, ".bin": {},
	".woff": {}, ".woff2": {}, ".ttf": {}, ".otf": {}, ".eot": {},
	".mp3": {}, ".mp4": {}, ".mov": {}, ".avi": {}, ".webm": {}, ".wav": {}, ".flac": {},
	".class": {}, ".pyc": {}, ".o": {}, ".a": {}, ".jar": {}, ".war": {},
}

func (c *Client) ReadBlob(ctx context.Context, owner, name, filePath string) (*blob.Blob, error) {
	file, _, resp, err := c.client.Repositories.GetContents(ctx, owner, name, filePath, nil)
	if err != nil {
		return nil, translateError(err, resp)
	}
	if file == nil {
		return nil, repo.ErrNotFound
	}

	out := &blob.Blob{
		Path:        file.GetPath(),
		Size:        file.GetSize(),
		SHA:         file.GetSHA(),
		HTMLURL:     file.GetHTMLURL(),
		DownloadURL: file.GetDownloadURL(),
	}

	if file.GetSize() > maxBlobSize {
		out.TooLarge = true
		return out, nil
	}

	ext := strings.ToLower(path.Ext(file.GetName()))
	if _, isBin := binaryExts[ext]; isBin {
		out.IsBinary = true
		return out, nil
	}

	decoded, err := file.GetContent()
	if err != nil {
		out.IsBinary = true
		return out, nil
	}

	if strings.ContainsRune(decoded, 0) || !utf8.ValidString(decoded) {
		out.IsBinary = true
		return out, nil
	}

	out.Content = decoded
	return out, nil
}

func (c *Client) ListLanguages(ctx context.Context, owner, name string) (map[string]int, error) {
	m, resp, err := c.client.Repositories.ListLanguages(ctx, owner, name)
	if err != nil {
		return nil, translateError(err, resp)
	}
	return m, nil
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
