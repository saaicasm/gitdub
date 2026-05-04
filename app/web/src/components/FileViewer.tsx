import { useEffect, useState } from "react";
import { fetchBlob } from "../api/blob";
import type { Blob as BlobData } from "../api/types";
import { isImageFile, isMarkdown, languageFor } from "../utils/fileLanguage";
import { CodeBlock } from "./CodeBlock";
import { MarkdownView } from "./MarkdownView";

type Props = {
  owner: string;
  name: string;
  branch: string;
  path: string;
  onClose: () => void;
};

export function FileViewer({ owner, name, branch, path, onClose }: Props) {
  const [blob, setBlob] = useState<BlobData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlob(null);
    setError(null);
    fetchBlob(owner, name, path)
      .then(setBlob)
      .catch(err => setError(err.message));
  }, [owner, name, path]);

  const filename = path.split("/").pop() ?? path;

  return (
    <div className="file-viewer">
      <header className="file-viewer__header">
        <span className="file-viewer__path">{path}</span>
        <div className="file-viewer__actions">
          {blob && (
            <a
              href={blob.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="file-viewer__link"
            >
              View on GitHub
            </a>
          )}
          <button
            type="button"
            className="file-viewer__close"
            onClick={onClose}
            aria-label="Back to tree"
          >
            <BackArrowIcon />
          </button>
        </div>
      </header>
      <div className="file-viewer__body">
        {error && <div className="file-viewer__message">{error}</div>}
        {!error && blob && <Body blob={blob} owner={owner} name={name} branch={branch} filename={filename} />}
      </div>
    </div>
  );
}

function Body({
  blob,
  owner,
  name,
  branch,
  filename,
}: {
  blob: BlobData;
  owner: string;
  name: string;
  branch: string;
  filename: string;
}) {
  if (isImageFile(filename)) {
    return (
      <div className="file-viewer__image-wrap">
        <img className="file-viewer__image" src={blob.downloadUrl} alt={filename} />
      </div>
    );
  }
  if (blob.tooLarge) {
    return (
      <div className="file-viewer__message">
        File too large to preview ({formatSize(blob.size)}).{" "}
        <a href={blob.htmlUrl} target="_blank" rel="noopener noreferrer">
          View on GitHub →
        </a>
      </div>
    );
  }
  if (blob.isBinary) {
    return (
      <div className="file-viewer__message">
        Binary file — preview not available.{" "}
        <a href={blob.htmlUrl} target="_blank" rel="noopener noreferrer">
          View on GitHub →
        </a>
      </div>
    );
  }
  if (isMarkdown(filename)) {
    return (
      <MarkdownView
        source={blob.content}
        owner={owner}
        name={name}
        branch={branch}
        filePath={blob.path}
      />
    );
  }
  return <CodeBlock code={blob.content} language={languageFor(filename)} />;
}

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5L7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
