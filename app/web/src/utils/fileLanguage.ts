// Filename → shiki language ID. Used for both file-type classification
// and as the language hint for shiki when highlighting.

const FILENAME_LANG: Record<string, string> = {
  Dockerfile: "docker",
  Makefile: "make",
  "CMakeLists.txt": "cmake",
};

const EXT_LANG: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  go: "go",
  rs: "rust",
  rb: "ruby",
  kt: "kotlin",
  swift: "swift",
  cpp: "cpp",
  cxx: "cpp",
  cc: "cpp",
  hpp: "cpp",
  c: "c",
  h: "c",
  cs: "csharp",
  php: "php",
  dart: "dart",
  lua: "lua",
  pl: "perl",
  scala: "scala",
  ex: "elixir",
  exs: "elixir",
  hs: "haskell",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  vue: "vue",
  svelte: "svelte",
  md: "markdown",
  markdown: "markdown",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  xml: "xml",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  proto: "proto",
  diff: "diff",
  patch: "diff",
};

export function languageFor(filename: string): string | null {
  if (filename in FILENAME_LANG) return FILENAME_LANG[filename];
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = filename.slice(dot + 1).toLowerCase();
  return EXT_LANG[ext] ?? null;
}

const IMAGE_EXTS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "svg", "ico",
]);

export function isImageFile(filename: string): boolean {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return false;
  return IMAGE_EXTS.has(filename.slice(dot + 1).toLowerCase());
}

export function isMarkdown(filename: string): boolean {
  return /\.(md|markdown)$/i.test(filename);
}
