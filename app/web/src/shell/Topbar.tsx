export type Repo = {
  avatarUrl: string;
  owner: string;
  name: string;
  defaultBranch: string;
  stars: number;
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
        <div className="meta-item">{repo.stars}</div>
      </div>
      <button className="pull-btn">Pull latest</button>
    </div>
  );
}
