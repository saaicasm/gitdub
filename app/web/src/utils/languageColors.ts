// Subset of GitHub linguist colors (linguist/lib/linguist/languages.yml).
// Languages not in this map fall back to FALLBACK_COLOR.
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Perl: "#0298c3",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Markdown: "#083fa1",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Objective: "#438eff",
  "Objective-C": "#438eff",
  "Jupyter Notebook": "#DA5B0B",
  YAML: "#cb171e",
  JSON: "#292929",
  TOML: "#9c4221",
};

export const FALLBACK_COLOR = "#9e9e9e";

export function colorFor(language: string): string {
  return LANGUAGE_COLORS[language] ?? FALLBACK_COLOR;
}
