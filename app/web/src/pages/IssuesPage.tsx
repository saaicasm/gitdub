import { useEffect, useState } from "react";
import { fetchIssues } from "../api/issues";
import type { Issue, IssueListResult } from "../api/types";
import { formatRelative } from "../utils/time";
import { Modal } from "../components/Modal";
import { IssueDetailViewer } from "../components/IssueDetailViewer";
import { useRepoContext } from "./RepoPage";

export default function IssuesPage() {
  const { repo } = useRepoContext();
  const [result, setResult] = useState<IssueListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openNumber, setOpenNumber] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchIssues(repo.owner, repo.name, {
      page,
      perPage: 30,
      state: "open",
      labels: selectedLabels.length > 0 ? selectedLabels : undefined,
    })
      .then(setResult)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [repo.owner, repo.name, page, selectedLabels]);

  if (loading) return <div className="issues-status">Loading...</div>;
  if (error) return <div className="issues-status">{error}</div>;
  if (!result || result.items.length === 0) {
    return <div className="issues-status">No open issues.</div>;
  }

  const allLabels = Array.from(
    new Set(result.items.flatMap(issue => issue.labels.map(l => l.name)))
  );

  return (
    <>
      <div className="issues-filters">
        <div className="label-filter">
          {allLabels.map(label => (
            <button
              key={label}
              className={`filter-tag ${selectedLabels.includes(label) ? "filter-tag--active" : ""}`}
              onClick={() => {
                if (selectedLabels.includes(label)) {
                  setSelectedLabels(selectedLabels.filter(l => l !== label));
                } else {
                  setSelectedLabels([...selectedLabels, label]);
                }
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="issues-grid">
        {result.items.map(issue => (
          <IssueCard
            key={issue.number}
            issue={issue}
            onOpen={() => setOpenNumber(issue.number)}
          />
        ))}
      </div>

      <div className="issues-pagination">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {result.page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!result.hasNext}
        >
          Next
        </button>
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
