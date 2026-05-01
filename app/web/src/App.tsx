import { useState } from 'react';
import './shell/shell.css';
import { TopbarEmpty, TopbarLoaded } from './shell/Topbar';
import { Sidebar } from './shell/Sidebar';
import Home from './pages/Home';
import type { RepoMetadata } from './api/types';

export default function App() {
  const [repo, setRepo] = useState<RepoMetadata | null>(null);

  return (
    <div className="app-shell">
      {repo ? <TopbarLoaded repo={repo} /> : <TopbarEmpty />}
      <div className="shell-body">
        <Sidebar activeId="overview" />
        <main className="main">
          <Home onLoaded={setRepo} />
        </main>
      </div>
    </div>
  );
}
