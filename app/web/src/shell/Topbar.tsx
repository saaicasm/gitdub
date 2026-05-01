export type Repo = {
  owner: string;
  name: string;
  avatarInitials: string;
  branch: string;
  pulledAt: string;
  stars: string;
  updatedAt: string;
};

export function TopbarEmpty() {
  return (
    <header className="topbar topbar--empty">
      <span className="topbar__placeholder">No repository loaded</span>
    </header>
  );
}

export function TopbarLoaded({ repo }: { repo: Repo }) {
  return (
    <div className="topbar">
      <div className="repo-meta">
        <div className="repo-title">
          <div className="repo-avatar">{repo.avatarInitials}</div>
          <div>
            <span className="repo-owner">{repo.owner} / </span>
            <span className="repo-name">{repo.name}</span>
          </div>
        </div>
        <div className="meta-divider" />
        <div className="meta-item">
          <span className="branch-badge">{repo.branch}</span>
        </div>
        <div className="meta-divider" />
        <div className="meta-item">
          <div className="meta-dot" />
          {repo.pulledAt}
        </div>
        <div className="meta-divider" />
        <div className="meta-item">{repo.stars}</div>
        <div className="meta-item">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: 0.5 }}
          >
            <circle cx="6" cy="6" r="4" />
            <path d="M6 3v3l2 2" />
          </svg>
          {repo.updatedAt}
        </div>
      </div>
      <button className="pull-btn">Pull latest</button>
    </div>
  );
}
