import { useEffect, useState } from "react";
import { fetchIssues } from "../api/issues";
import type { Issue } from "../api/types";
import { formatRelative } from "../utils/time";
import { Modal } from "../components/Modal";
import { IssueDetailViewer } from "../components/IssueDetailViewer";
import { useRepoContext } from "./RepoPage";

export default function IssuesPage() {
  const { repo } = useRepoContext();
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openNumber, setOpenNumber] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchIssues(repo.owner, repo.name)
      .then(setIssues)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [repo.owner, repo.name]);

  if (loading) return <div className="issues-status">Loading...</div>;
  if (error) return <div className="issues-status">{error}</div>;
  if (!issues || issues.length === 0) {
    return <div className="issues-status">No open issues.</div>;
  }

  return (
    <>
      <div className="issues-grid">
        {issues.map(issue => (
          <IssueCard
            key={issue.number}
            issue={issue}
            onOpen={() => setOpenNumber(issue.number)}
          />
        ))}
      </div>
      <Modal open={openNumber !== null} onClose={() => setOpenNumber(null)}>
        {openNumber !== null && (
          <IssueDetailViewer
            owner={repo.owner}
            name={repo.name}
            branch={repo.defaultBranch}
            number={openNumber}
            onClose={() => setOpenNumber(null)}
          />
        )}
      </Modal>
    </>
  );
}

function IssueCard({ issue, onOpen }: { issue: Issue; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="issue-card"
      onClick={onOpen}
      aria-label={`Issue #${issue.number}: ${issue.title}`}
    >
      <div className="issue-card__header">
        <span className={`state-pill state-pill--${issue.state}`}>{issue.state}</span>
        <span className="issue-card__number">#{issue.number}</span>
        <span className="issue-card__updated">
          updated {formatRelative(new Date(issue.updatedAt))}
        </span>
      </div>
      <div className="issue-card__title">{issue.title}</div>
      <div className="issue-card__footer">
        <div className="issue-card__author">
          <img className="issue-card__avatar" src={issue.author.avatarUrl} alt="" />
          <span>{issue.author.login}</span>
        </div>
        <div className="issue-card__labels">
          {issue.labels.map(l => (
            <span key={l.name} className="label-chip">
              <span className="label-chip__dot" style={{ background: `#${l.color}` }} />
              {l.name}
            </span>
          ))}
          {issue.comments > 0 && (
            <span className="issue-card__comments">
              <svg className="issue-card__comment-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
                <path d="M2 3h12v8H8l-3 3v-3H2z" />
              </svg>
              {issue.comments}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
