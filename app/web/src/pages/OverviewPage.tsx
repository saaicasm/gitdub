import { useEffect, useState } from "react";
import { fetchTree } from "../api/tree";
import { fetchStack } from "../api/stack";
import type { TreeEntry, Stack } from "../api/types";
import { useRepoContext } from "./RepoPage";
import { Modal } from "../components/Modal";
import { StackView } from "../components/StackView";
import { TreeView } from "../components/TreeView";
import { FileViewer } from "../components/FileViewer";
import { colorFor } from "../utils/languageColors";
import { iconSlugFor } from "../utils/languageIcon";
import { formatNumber, formatTimeAgo } from "../utils/timeago";

type TreeState = {
  expandedPaths: Set<string>;
};

export default function OverviewPage() {
  const { repo } = useRepoContext();
  const [stackModalOpen, setStackModalOpen] = useState(false);
  const [treeModalOpen, setTreeModalOpen] = useState(false);
  const [treePreview, setTreePreview] = useState<TreeEntry[] | null>(null);
  const [stackPreview, setStackPreview] = useState<Stack | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [openFilePath, setOpenFilePath] = useState<string | null>(null);
  const [treeHistory, setTreeHistory] = useState<TreeState[]>([]);

  useEffect(() => {
    fetchTree(repo.owner, repo.name, "")
      .then(entries => {
        const sorted = entries.sort((a, b) => {
          if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        setTreePreview(sorted.slice(0, 6));
      })
      .catch(() => setTreePreview(null));
  }, [repo.owner, repo.name]);

  useEffect(() => {
    fetchStack(repo.owner, repo.name)
      .then(setStackPreview)
      .catch(() => setStackPreview(null));
  }, [repo.owner, repo.name]);

  function handleOpenFile(filePath: string) {
    setTreeHistory(prev => [...prev, { expandedPaths: new Set(expandedPaths) }]);
    setOpenFilePath(filePath);
  }

  function handleToggleFolder(path: string) {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function handleBackInTree() {
    if (treeHistory.length > 0) {
      const prevState = treeHistory[treeHistory.length - 1];
      setExpandedPaths(new Set(prevState.expandedPaths));
      setOpenFilePath(null);
      setTreeHistory(prev => prev.slice(0, -1));
    }
  }

  return (
    <div className="overview-page">
      <RepoHero repo={repo} />
      <div className="overview-cards">
        <div
          className="overview-card overview-card--stack"
          onClick={() => setStackModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && setStackModalOpen(true)}
        >
          <div className="overview-card__header">
            <h3 className="overview-card__title">Stack</h3>
            <ChevronIcon />
          </div>
          {stackPreview && stackPreview.languages.length > 0 && (
            <StackPreview stack={stackPreview} />
          )}
          {!stackPreview && (
            <div className="overview-card__empty">Click to view stack</div>
          )}
        </div>

        <div
          className="overview-card overview-card--tree"
          onClick={() => setTreeModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && setTreeModalOpen(true)}
        >
          <div className="overview-card__header">
            <h3 className="overview-card__title">Browse files</h3>
            <ChevronIcon />
          </div>
          {treePreview && treePreview.length > 0 && (
            <TreePreview entries={treePreview} />
          )}
          {treePreview?.length === 0 && (
            <div className="overview-card__empty">Empty repository</div>
          )}
          {!treePreview && (
            <div className="overview-card__empty">Click to browse</div>
          )}
        </div>
      </div>

      <Modal open={stackModalOpen} onClose={() => setStackModalOpen(false)}>
        <StackView owner={repo.owner} name={repo.name} />
      </Modal>

      <Modal open={treeModalOpen} onClose={() => setTreeModalOpen(false)}>
        {openFilePath === null ? (
          <TreeView
            owner={repo.owner}
            name={repo.name}
            onOpenFile={handleOpenFile}
            expandedPaths={expandedPaths}
            onToggle={handleToggleFolder}
          />
        ) : (
          <FileViewer
            owner={repo.owner}
            name={repo.name}
            branch={repo.defaultBranch}
            path={openFilePath}
            onClose={handleBackInTree}
          />
        )}
      </Modal>
    </div>
  );
}

function RepoHero({ repo }: { repo: any }) {
  const langIcon = repo.primaryLanguage ? iconSlugFor(repo.primaryLanguage) : null;

  return (
    <div className="repo-hero">
      <div className="repo-hero__body">
        {repo.description && (
          <p className="repo-hero__description">{repo.description}</p>
        )}
        {repo.topics && repo.topics.length > 0 && (
          <div className="repo-hero__topics">
            {repo.topics.map((topic: string) => (
              <span key={topic} className="label-chip">
                <span className="label-chip__dot" />
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="repo-hero__stats">
        {repo.forks > 0 && (
          <div className="stat">
            <div className="stat__value">{formatNumber(repo.forks)}</div>
            <div className="stat__label">forks</div>
          </div>
        )}
        {repo.watchers > 0 && (
          <div className="stat">
            <div className="stat__value">{formatNumber(repo.watchers)}</div>
            <div className="stat__label">watchers</div>
          </div>
        )}
        {repo.openIssues > 0 && (
          <div className="stat">
            <div className="stat__value">{formatNumber(repo.openIssues)}</div>
            <div className="stat__label">open</div>
          </div>
        )}
        {repo.primaryLanguage && (
          <div className="stat">
            {langIcon && (
              <img
                className="stat__icon"
                src={`https://cdn.simpleicons.org/${langIcon}`}
                alt={repo.primaryLanguage}
                onError={e => e.currentTarget.style.display = "none"}
              />
            )}
            {!langIcon && (
              <span
                className="stat__dot"
                style={{ background: colorFor(repo.primaryLanguage) }}
              />
            )}
            <div className="stat__value">{repo.primaryLanguage}</div>
          </div>
        )}
      </div>

      <div className="repo-hero__meta">
        {repo.license && (
          <span className="meta-badge">{repo.license}</span>
        )}
        {repo.createdAt && (
          <span className="meta-text">
            created {formatTimeAgo(repo.createdAt)}
          </span>
        )}
        {repo.pushedAt && (
          <span className="meta-text">
            last commit {formatTimeAgo(repo.pushedAt)}
          </span>
        )}
        {repo.homepage && (
          <a className="meta-link" href={repo.homepage} target="_blank" rel="noopener">
            {new URL(repo.homepage).hostname}
          </a>
        )}
      </div>
    </div>
  );
}

function StackPreview({ stack }: { stack: Stack }) {
  const visible = stack.languages.filter(l => l.percent >= 1).slice(0, 3);

  return (
    <div className="overview-preview">
      <div className="lang-bar" role="img" aria-label="Language breakdown">
        {visible.map(l => (
          <span
            key={l.name}
            className="lang-bar__seg"
            style={{ width: `${l.percent}%`, background: colorFor(l.name) }}
            title={`${l.name} · ${l.percent}%`}
          />
        ))}
      </div>
      <ul className="lang-preview">
        {visible.map(l => (
          <li key={l.name} className="lang-preview__item">
            <span className="lang-preview__dot" style={{ background: colorFor(l.name) }} />
            <span className="lang-preview__name">{l.name}</span>
            <span className="lang-preview__percent">{l.percent}%</span>
          </li>
        ))}
      </ul>
      {stack.tools.length > 0 && (
        <div className="preview-hint">+{stack.tools.length} tools detected</div>
      )}
    </div>
  );
}

function TreePreview({ entries }: { entries: TreeEntry[] }) {
  return (
    <ul className="tree-preview">
      {entries.map(entry => (
        <li key={entry.path} className="tree-preview__item">
          <span className="tree-preview__icon">
            {entry.type === "dir" ? "📁" : "📄"}
          </span>
          <span className="tree-preview__name">{entry.name}</span>
        </li>
      ))}
    </ul>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
