import { useState } from "react";
import { fetchRepoMetadata } from "../api/repos";
import type { RepoMetadata } from "../api/types";

function parseGithubUrl(input: string): { owner: string; name: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const match = trimmed.match(/(?:github\.com[/:])?([^/\s]+)\/([^/\s]+)$/);
  if (!match) return null;
  return { owner: match[1], name: match[2] };
}

export default function Home({
  onLoaded,
}: {
  onLoaded: (repo: RepoMetadata) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFetch() {
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      setError("Invalid GitHub URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRepoMetadata(parsed.owner, parsed.name);
      onLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overview">
      <div className="overview__fetch">
        <input
          className="overview__url"
          type="text"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onFetch();
          }}
        />
        <button
          className="overview__btn"
          onClick={onFetch}
          disabled={loading || !url.trim()}
        >
          {loading ? "Fetching..." : "Fetch"}
        </button>
      </div>
      {error && <div className="overview__error">{error}</div>}
    </div>
  );
}
