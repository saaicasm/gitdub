import { useEffect, useState } from "react";
import { fetchTree } from "../api/tree";
import type { TreeEntry } from "../api/types";
import { useRepoContext } from "./RepoPage";

export default function TreePage() {
  const { repo } = useRepoContext();
  const [rootEntries, setRootEntries] = useState<TreeEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTree(repo.owner, repo.name, "")
      .then(setRootEntries)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [repo.owner, repo.name]);

  if (loading) return <div className="tree-status">Loading...</div>;
  if (error) return <div className="tree-status">{error}</div>;
  if (!rootEntries || rootEntries.length === 0) {
    return <div className="tree-status">Empty repository.</div>;
  }

  return (
    <div className="tree">
      {rootEntries.map(entry => (
        <TreeNode
          key={entry.path}
          entry={entry}
          owner={repo.owner}
          name={repo.name}
          depth={0}
        />
      ))}
    </div>
  );
}

type TreeNodeProps = {
  entry: TreeEntry;
  owner: string;
  name: string;
  depth: number;
};

function TreeNode({ entry, owner, name, depth }: TreeNodeProps) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<TreeEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDir = entry.type === "dir";
  const indent = 12 + depth * 14;

  function toggle() {
    if (!isDir) return;
    if (!children && !loading) {
      setLoading(true);
      setError(null);
      fetchTree(owner, name, entry.path)
        .then(setChildren)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
    setOpen(o => !o);
  }

  return (
    <>
      <div
        className={"tree-row" + (isDir ? " tree-row--dir" : "")}
        style={{ paddingLeft: indent }}
        onClick={toggle}
        role={isDir ? "button" : undefined}
        aria-expanded={isDir ? open : undefined}
      >
        <span className={"tree-row__chevron" + (open ? " tree-row__chevron--open" : "")}>
          {isDir ? <ChevronIcon /> : null}
        </span>
        <span className="tree-row__icon">
          {isDir ? <FolderIcon /> : <FileIcon />}
        </span>
        <span className="tree-row__name">{entry.name}</span>
      </div>
      {open && loading && (
        <div className="tree-row tree-row--muted" style={{ paddingLeft: indent + 14 }}>
          Loading...
        </div>
      )}
      {open && error && (
        <div className="tree-row tree-row--muted" style={{ paddingLeft: indent + 14 }}>
          {error}
        </div>
      )}
      {open && children && children.map(child => (
        <TreeNode
          key={child.path}
          entry={child}
          owner={owner}
          name={name}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M1.5 4V3a1 1 0 011-1h3l1 1.5h5a1 1 0 011 1v6a1 1 0 01-1 1h-9a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M3 1.5h5l3 3V12a.5.5 0 01-.5.5h-7.5a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z" />
      <path d="M8 1.5v3h3" />
    </svg>
  );
}
