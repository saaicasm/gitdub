import { Fragment, type ReactNode } from 'react';
import { NavLink, useParams } from 'react-router-dom';

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
      { id: 'issues', label: 'Issues', icon: <IssuesIcon /> },
      { id: 'metadata', label: 'Metadata', icon: <MetadataIcon /> },
    ],
  },
];

function linkFor(id: NavId, repoBase: string): { to: string; end?: boolean } | null {
  switch (id) {
    case 'overview': return { to: repoBase, end: true };
    case 'issues':   return { to: `${repoBase}/issues` };
    case 'tree':     return { to: `${repoBase}/tree` };
    case 'stack':    return { to: `${repoBase}/stack` };
    default:         return null;
  }
}

export function Sidebar() {
  const { owner, name } = useParams();
  const repoBase = owner && name ? `/w/${owner}/${name}` : null;

  return (
    <nav className="sidebar" aria-label="Workspace navigation">
      {sections.map((section) => (
        <Fragment key={section.label}>
          <div className="sidebar__label">{section.label}</div>
          {section.items.map((item) => {
            const icon = (
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            );
            const link = repoBase ? linkFor(item.id, repoBase) : null;

            if (link) {
              return (
                <NavLink
                  key={item.id}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    'nav-item' + (isActive ? ' nav-item--active' : '')
                  }
                >
                  {icon}
                  {item.label}
                </NavLink>
              );
            }
            return (
              <div
                key={item.id}
                className="nav-item nav-item--disabled"
                aria-disabled="true"
              >
                {icon}
                {item.label}
              </div>
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
