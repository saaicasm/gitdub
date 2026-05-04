import { useEffect, useState } from "react";
import { fetchTree } from "../api/tree";
import type { TreeEntry } from "../api/types";
import { fileIconSlug } from "../utils/fileIcon";

type Props = {
  owner: string;
  name: string;
  onOpenFile: (path: string) => void;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
};

export function TreeView({
  owner,
  name,
  onOpenFile,
  expandedPaths,
  onToggle,
}: Props) {
  const [rootEntries, setRootEntries] = useState<TreeEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTree(owner, name, "")
      .then(setRootEntries)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [owner, name]);

  if (loading) return <div className="tree-status">Loading...</div>;
  if (error) return <div className="tree-status">{error}</div>;
  if (!rootEntries || rootEntries.length === 0) {
    return <div className="tree-status">Empty repository.</div>;
  }

  return (
    <div className="tree-view">
      <div className="tree">
        {rootEntries.map(entry => (
          <TreeNode
            key={entry.path}
            entry={entry}
            owner={owner}
            name={name}
            onOpenFile={onOpenFile}
            expandedPaths={expandedPaths}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

type TreeNodeProps = {
  entry: TreeEntry;
  owner: string;
  name: string;
  onOpenFile: (path: string) => void;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
};

function TreeNode({
  entry,
  owner,
  name,
  onOpenFile,
  expandedPaths,
  onToggle,
}: TreeNodeProps) {
  const [children, setChildren] = useState<TreeEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDir = entry.type === "dir";
  const isOpen = expandedPaths.has(entry.path);

  function onClick() {
    if (isDir) {
      if (!children && !loading && !isOpen) {
        setLoading(true);
        setError(null);
        fetchTree(owner, name, entry.path)
          .then(setChildren)
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));
      }
      onToggle(entry.path);
    } else {
      onOpenFile(entry.path);
    }
  }

  return (
    <div className="tree-node">
      <div
        className={"tree-row" + (isDir ? " tree-row--dir" : " tree-row--file")}
        onClick={onClick}
        role="button"
        aria-expanded={isDir ? isOpen : undefined}
      >
        <span className={"tree-row__chevron" + (isOpen ? " tree-row__chevron--open" : "")}>
          {isDir ? <ChevronIcon /> : null}
        </span>
        <span className="tree-row__icon">
          {isDir ? <FolderIcon /> : <FileIconForName name={entry.name} />}
        </span>
        <span className="tree-row__name">{entry.name}</span>
        {!isDir && entry.size > 0 && (
          <span className="tree-row__size">{formatBytes(entry.size)}</span>
        )}
      </div>
      {isOpen && (
        <div className="tree-children">
          {loading && <div className="tree-row tree-row--muted">Loading...</div>}
          {error && <div className="tree-row tree-row--muted">{error}</div>}
          {children && children.map(child => (
            <TreeNode
              key={child.path}
              entry={child}
              owner={owner}
              name={name}
              onOpenFile={onOpenFile}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileIconForName({ name }: { name: string }) {
  const slug = fileIconSlug(name);
  if (!slug) return <FileIcon />;
  return (
    <img
      className="tree-row__brand-icon"
      src={`https://cdn.simpleicons.org/${slug}`}
      alt=""
      loading="lazy"
      decoding="async"
      onError={e => {
        const img = e.currentTarget;
        const span = document.createElement("span");
        span.className = "tree-row__icon-fallback";
        span.innerHTML = GENERIC_FILE_SVG;
        img.replaceWith(span);
      }}
    />
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

const GENERIC_FILE_SVG =
  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.25">' +
  '<path d="M3 1.5h5l3 3V12a.5.5 0 01-.5.5h-7.5a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z"/>' +
  '<path d="M8 1.5v3h3"/></svg>';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
