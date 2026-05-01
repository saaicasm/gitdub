import { useEffect, useState } from "react";

export type Repo = {
  avatarUrl: string;
  owner: string;
  name: string;
  defaultBranch: string;
  stars: number;
};

function formatRelative(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return "just now";
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatStars(n: number): string {
  if (n < 1000) return String(n);
  return `${Math.ceil(n / 100) / 10}k`;
}

const PLACEHOLDER_UPDATED_AT = new Date(Date.now() - 3 * 60 * 60 * 1000);

export function TopbarEmpty() {
  return (
    <header className="topbar topbar--empty">
      <span className="topbar__placeholder">No repository loaded</span>
    </header>
  );
}

export function TopbarLoaded({ repo }: { repo: Repo }) {
  const [pulledAt, setPulledAt] = useState<Date>(() => new Date());
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setPulledAt(new Date());
  }, [repo.owner, repo.name]);

  const pulledIsStale = Date.now() - pulledAt.getTime() >= 60 * 60 * 1000;

  return (
    <div className="topbar">
      <div className="repo-meta">
        <div className="repo-title">
          <img className="repo-avatar" src={repo.avatarUrl} alt="" />
          <div>
            <span className="repo-owner">{repo.owner} / </span>
            <span className="repo-name">{repo.name}</span>
          </div>
        </div>
        <div className="meta-divider" />
        <div className="meta-item">
          <span className="branch-badge">{repo.defaultBranch}</span>
        </div>
        <div className="meta-divider" />
        <div className="meta-item">
          <span className={`meta-dot${pulledIsStale ? " meta-dot--stale" : ""}`} />
          pulled {formatRelative(pulledAt)}
        </div>
        <div className="meta-divider" />
        <div className="meta-item">{formatStars(repo.stars)} stars</div>
        <div className="meta-divider" />
        <div className="meta-item">
          <svg className="meta-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4.5V8l2.25 1.5" strokeLinecap="round" />
          </svg>
          updated {formatRelative(PLACEHOLDER_UPDATED_AT)}
        </div>
      </div>
      <button className="pull-btn" onClick={() => setPulledAt(new Date())}>
        Pull latest
      </button>
    </div>
  );
}
