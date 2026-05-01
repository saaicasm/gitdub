import { Fragment, type ReactNode } from 'react';

type NavId = 'overview' | 'tree' | 'stack' | 'issues' | 'metadata';

type NavItem = { id: NavId; label: string; icon: ReactNode };
type NavSection = { label: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: 'Workspace',
    items: [{ id: 'overview', label: 'Overview', icon: <OverviewIcon /> }],
  },
  {
    label: 'Analysis',
    items: [
      { id: 'tree', label: 'Tree', icon: <TreeIcon /> },
      { id: 'stack', label: 'Stack', icon: <StackIcon /> },
      { id: 'issues', label: 'Issues', icon: <IssuesIcon /> },
      { id: 'metadata', label: 'Metadata', icon: <MetadataIcon /> },
    ],
  },
];

export function Sidebar({ activeId = 'overview' }: { activeId?: NavId }) {
  return (
    <nav className="sidebar" aria-label="Workspace navigation">
      {sections.map((section) => (
        <Fragment key={section.label}>
          <div className="sidebar__label">{section.label}</div>
          {section.items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                className={
                  'nav-item' + (isActive ? ' nav-item--active' : '')
                }
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </Fragment>
      ))}
    </nav>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="12" height="12" rx="2" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2h3v3H2zM2 9h3v3H2zM9 2h3v3H9zM9 9h3v3H9z" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" />
      <path d="M7 4v3l2 2" />
    </svg>
  );
}

function IssuesIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 3h12M1 7h8M1 11h10" />
    </svg>
  );
}

function MetadataIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
    </svg>
  );
}
