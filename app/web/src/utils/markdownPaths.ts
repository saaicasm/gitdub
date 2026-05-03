// Resolve a relative URL inside a markdown file against the file's path
// in the repo. Returns the resolved path (no leading slash).
export function resolveRepoPath(currentFile: string, url: string): string {
  let cleaned = url.replace(/^\.\//, "");
  if (cleaned.startsWith("/")) return cleaned.slice(1);

  const lastSlash = currentFile.lastIndexOf("/");
  const currentDir = lastSlash >= 0 ? currentFile.slice(0, lastSlash) : "";
  const combined = currentDir ? `${currentDir}/${cleaned}` : cleaned;

  const out: string[] = [];
  for (const part of combined.split("/")) {
    if (part === "..") out.pop();
    else if (part !== "." && part !== "") out.push(part);
  }
  return out.join("/");
}

export function isAbsoluteUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//") ||
    url.startsWith("mailto:") ||
    url.startsWith("#") ||
    url.startsWith("data:")
  );
}
