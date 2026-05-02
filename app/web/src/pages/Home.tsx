import { useState } from "react";
import { useNavigate } from "react-router-dom";

function parseGithubUrl(input: string): { owner: string; name: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const match = trimmed.match(/(?:github\.com[/:])?([^/\s]+)\/([^/\s]+)$/);
  if (!match) return null;
  return { owner: match[1], name: match[2] };
}

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onFetch() {
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      setError("Invalid GitHub URL");
      return;
    }
    setError(null);
    navigate(`/w/${parsed.owner}/${parsed.name}`);
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
          disabled={!url.trim()}
        >
          Fetch
        </button>
      </div>
      {error && <div className="overview__error">{error}</div>}
    </div>
  );
}
