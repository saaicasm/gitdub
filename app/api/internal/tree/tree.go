package tree

import "context"

type Entry struct {
	Path string `json:"path"`
	Name string `json:"name"`
	Type string `json:"type"`
	Size int64  `json:"size"`
	SHA  string `json:"sha"`
}

type Lister interface {
	ListTree(ctx context.Context, owner, name, path string) ([]Entry, error)
}
