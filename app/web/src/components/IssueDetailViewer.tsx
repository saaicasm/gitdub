import { useEffect, useState } from "react";
import { fetchIssueDetail } from "../api/issueDetail";
import type { Comment, IssueDetail } from "../api/types";
import { formatRelative } from "../utils/time";
import { MarkdownView } from "./MarkdownView";

type Props = {
  owner: string;
  name: string;
  branch: string;
  number: number;
  onClose: () => void;
};

export function IssueDetailViewer({ owner, name, branch, number, onClose }: Props) {
  const [data, setData] = useState<IssueDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(null);
    fetchIssueDetail(owner, name, number, controller.signal)
      .then(setData)
      .catch(err => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => controller.abort();
  }, [owner, name, number]);

  return (
    <div className="issue-detail">
      <header className="issue-detail__header">
        <span className={`state-pill state-pill--${data?.state ?? "open"}`}>
          {data?.state ?? "…"}
        </span>
        <span className="issue-detail__number">#{number}</span>
        {data && (
          <span className="issue-detail__meta">
            <img
              className="issue-detail__author-avatar"
              src={data.author.avatarUrl}
              alt=""
              width={18}
              height={18}
              loading="lazy"
            />
            <span className="issue-detail__author-login">{data.author.login}</span>
            <span className="issue-detail__time">opened {formatRelative(new Date(data.createdAt))}</span>
          </span>
        )}
        <div className="issue-detail__actions">
          {data && (
            <a
              href={data.url}
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
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </header>

      <div className="issue-detail__body">
        {error && <div className="file-viewer__message">{error}</div>}
        {!error && !data && <div className="issue-detail__skeleton" aria-hidden="true" />}
        {!error && data && (
          <>
            <h1 className="issue-detail__title">{data.title}</h1>

            {data.labels.length > 0 && (
              <div className="issue-detail__labels">
                {data.labels.map(l => (
                  <span key={l.name} className="label-chip">
                    <span className="label-chip__dot" style={{ background: `#${l.color}` }} />
                    {l.name}
                  </span>
                ))}
              </div>
            )}

            <div className="issue-detail__content">
              {data.body
                ? <MarkdownView source={data.body} owner={owner} name={name} branch={branch} filePath="" />
                : <div className="issue-detail__empty">No description provided.</div>
              }
            </div>

            <div className="issue-detail__comments">
              <div className="issue-detail__divider">
                {data.comments.length === 0
                  ? "No comments yet."
                  : `${data.comments.length} comment${data.comments.length === 1 ? "" : "s"}`}
              </div>
              {data.comments.map(c => (
                <CommentBlock key={c.id} comment={c} owner={owner} name={name} branch={branch} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CommentBlock({
  comment,
  owner,
  name,
  branch,
}: {
  comment: Comment;
  owner: string;
  name: string;
  branch: string;
}) {
  return (
    <article className="issue-comment">
      <header className="issue-comment__header">
        <img
          className="issue-comment__avatar"
          src={comment.author.avatarUrl}
          alt=""
          width={20}
          height={20}
          loading="lazy"
        />
        <span className="issue-comment__author">{comment.author.login}</span>
        <span className="issue-comment__time">commented {formatRelative(new Date(comment.createdAt))}</span>
      </header>
      <div className="issue-comment__body">
        <MarkdownView source={comment.body} owner={owner} name={name} branch={branch} filePath="" />
      </div>
    </article>
  );
}
