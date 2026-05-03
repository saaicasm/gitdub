// Verified simple-icons slugs for languages (HTTP-probed against cdn.simpleicons.org).
// Languages not in this map fall back to a colored dot.
const LANGUAGE_ICON_SLUGS: Record<string, string> = {
  TypeScript: "typescript",
  JavaScript: "javascript",
  Python: "python",
  Go: "go",
  Rust: "rust",
  Kotlin: "kotlin",
  Swift: "swift",
  "C++": "cplusplus",
  C: "c",
  PHP: "php",
  Ruby: "ruby",
  Dart: "dart",
  Scala: "scala",
  Elixir: "elixir",
  Haskell: "haskell",
  Lua: "lua",
  Perl: "perl",
  HTML: "html5",
  CSS: "css",
  Shell: "shell",
  Markdown: "markdown",
  Vue: "vuedotjs",
  Svelte: "svelte",
  YAML: "yaml",
  JSON: "json",
  TOML: "toml",
};

export function iconSlugFor(language: string): string | null {
  return LANGUAGE_ICON_SLUGS[language] ?? null;
}
