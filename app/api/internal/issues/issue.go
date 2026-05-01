package issues

import (
	"context"
	"time"
)

type User struct {
	Login     string `json:"login"`
	AvatarURL string `json:"avatarUrl"`
}

type Label struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type Issue struct {
	Number    int       `json:"number"`
	Title     string    `json:"title"`
	State     string    `json:"state"`
	Author    User      `json:"author"`
	Labels    []Label   `json:"labels"`
	Comments  int       `json:"comments"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	URL       string    `json:"url"`
}

type ListOptions struct {
	State   string
	Page    int
	PerPage int
}

type Lister interface {
	List(ctx context.Context, owner, name string, opts ListOptions) ([]Issue, error)
}
