package stack

import (
	"context"
	"math"
	"sort"
	"strings"

	"github.com/saaicasm/gitdub/internal/tree"
)

type Service struct {
	langs LanguageLister
	tree  tree.Lister
}

func NewService(langs LanguageLister, t tree.Lister) *Service {
	return &Service{langs: langs, tree: t}
}

type signature struct {
	pattern  string
	isDir    bool
	prefix   bool
	tool     string
	category string
}

var signatures = []signature{
	// package / runtime
	{pattern: "package.json", tool: "Node.js", category: "package"},
	{pattern: "package-lock.json", tool: "npm", category: "package"},
	{pattern: "pnpm-lock.yaml", tool: "pnpm", category: "package"},
	{pattern: "yarn.lock", tool: "Yarn", category: "package"},
	{pattern: "go.mod", tool: "Go modules", category: "package"},
	{pattern: "Cargo.toml", tool: "Cargo", category: "package"},
	{pattern: "pyproject.toml", tool: "pyproject", category: "package"},
	{pattern: "requirements.txt", tool: "pip", category: "package"},
	{pattern: "Pipfile", tool: "Pipenv", category: "package"},
	{pattern: "Gemfile", tool: "Bundler", category: "package"},
	{pattern: "composer.json", tool: "Composer", category: "package"},

	// language tooling
	{pattern: "tsconfig.json", tool: "TypeScript", category: "lang"},

	// build
	{pattern: "Makefile", tool: "Make", category: "build"},
	{pattern: "vite.config.ts", tool: "Vite", category: "build"},
	{pattern: "vite.config.js", tool: "Vite", category: "build"},
	{pattern: "webpack.config.js", tool: "Webpack", category: "build"},
	{pattern: "rollup.config.js", tool: "Rollup", category: "build"},
	{pattern: "esbuild.config.js", tool: "esbuild", category: "build"},

	// framework
	{pattern: "next.config.js", tool: "Next.js", category: "framework"},
	{pattern: "next.config.ts", tool: "Next.js", category: "framework"},
	{pattern: "nuxt.config.ts", tool: "Nuxt", category: "framework"},
	{pattern: "tailwind.config.js", tool: "Tailwind", category: "framework"},
	{pattern: "tailwind.config.ts", tool: "Tailwind", category: "framework"},
	{pattern: "svelte.config.js", tool: "Svelte", category: "framework"},
	{pattern: "angular.json", tool: "Angular", category: "framework"},

	// lint / format
	{pattern: "eslint.config.js", tool: "ESLint", category: "lint"},
	{pattern: "eslint.config.mjs", tool: "ESLint", category: "lint"},
	{pattern: ".eslintrc", prefix: true, tool: "ESLint", category: "lint"},
	{pattern: ".prettierrc", prefix: true, tool: "Prettier", category: "lint"},
	{pattern: "prettier.config.js", tool: "Prettier", category: "lint"},
	{pattern: "ruff.toml", tool: "Ruff", category: "lint"},
	{pattern: ".golangci.yml", tool: "golangci-lint", category: "lint"},
	{pattern: ".golangci.yaml", tool: "golangci-lint", category: "lint"},

	// test
	{pattern: "jest.config.js", tool: "Jest", category: "test"},
	{pattern: "jest.config.ts", tool: "Jest", category: "test"},
	{pattern: "vitest.config.ts", tool: "Vitest", category: "test"},

	// container
	{pattern: "Dockerfile", tool: "Docker", category: "container"},
	{pattern: "docker-compose.yml", tool: "Docker Compose", category: "container"},
	{pattern: "docker-compose.yaml", tool: "Docker Compose", category: "container"},

	// ci
	{pattern: ".gitlab-ci.yml", tool: "GitLab CI", category: "ci"},
	{pattern: "circle.yml", tool: "CircleCI", category: "ci"},
	{pattern: ".circleci", isDir: true, tool: "CircleCI", category: "ci"},
}

func (s *Service) Analyze(ctx context.Context, owner, name string) (*Stack, error) {
	langMap, err := s.langs.ListLanguages(ctx, owner, name)
	if err != nil {
		return nil, err
	}

	rootEntries, err := s.tree.ListTree(ctx, owner, name, "")
	if err != nil {
		return nil, err
	}

	files := make(map[string]struct{})
	dirs := make(map[string]struct{})
	fileNames := make([]string, 0, len(rootEntries))
	for _, e := range rootEntries {
		if e.Type == "dir" {
			dirs[e.Name] = struct{}{}
			continue
		}
		files[e.Name] = struct{}{}
		fileNames = append(fileNames, e.Name)
	}

	tools := make([]Tool, 0)
	seen := make(map[string]struct{})

	for _, sig := range signatures {
		if _, dup := seen[sig.tool]; dup {
			continue
		}

		var evidence string
		switch {
		case sig.isDir:
			if _, ok := dirs[sig.pattern]; ok {
				evidence = sig.pattern + "/"
			}
		case sig.prefix:
			for _, f := range fileNames {
				if strings.HasPrefix(f, sig.pattern) {
					evidence = f
					break
				}
			}
		default:
			if _, ok := files[sig.pattern]; ok {
				evidence = sig.pattern
			}
		}

		if evidence != "" {
			tools = append(tools, Tool{Name: sig.tool, Category: sig.category, Evidence: evidence})
			seen[sig.tool] = struct{}{}
		}
	}

	if _, ok := dirs[".github"]; ok {
		if _, dup := seen["GitHub Actions"]; !dup {
			ghEntries, err := s.tree.ListTree(ctx, owner, name, ".github")
			if err == nil {
				for _, e := range ghEntries {
					if e.Type == "dir" && e.Name == "workflows" {
						tools = append(tools, Tool{Name: "GitHub Actions", Category: "ci", Evidence: ".github/workflows/"})
						break
					}
				}
			}
		}
	}

	return &Stack{
		Languages: buildLanguages(langMap),
		Tools:     tools,
	}, nil
}

func buildLanguages(m map[string]int) []Language {
	total := 0
	for _, v := range m {
		total += v
	}

	out := make([]Language, 0, len(m))
	for nm, b := range m {
		var pct float64
		if total > 0 {
			pct = math.Round(float64(b)/float64(total)*1000) / 10
		}
		out = append(out, Language{Name: nm, Bytes: b, Percent: pct})
	}

	sort.SliceStable(out, func(i, j int) bool { return out[i].Bytes > out[j].Bytes })
	return out
}
