package blob

import "context"

type Blob struct {
	Path        string `json:"path"`
	Size        int    `json:"size"`
	SHA         string `json:"sha"`
	Content     string `json:"content"`
	IsBinary    bool   `json:"isBinary"`
	TooLarge    bool   `json:"tooLarge"`
	HTMLURL     string `json:"htmlUrl"`
	DownloadURL string `json:"downloadUrl"`
}

type Reader interface {
	ReadBlob(ctx context.Context, owner, name, path string) (*Blob, error)
}
