package stack

import "context"

type Language struct {
	Name    string  `json:"name"`
	Bytes   int     `json:"bytes"`
	Percent float64 `json:"percent"`
}

type Tool struct {
	Name     string `json:"name"`
	Category string `json:"category"`
	Evidence string `json:"evidence"`
	IconSlug string `json:"iconSlug"`
}

type Stack struct {
	Languages []Language `json:"languages"`
	Tools     []Tool     `json:"tools"`
}

type LanguageLister interface {
	ListLanguages(ctx context.Context, owner, name string) (map[string]int, error)
}

type Analyzer interface {
	Analyze(ctx context.Context, owner, name string) (*Stack, error)
}
