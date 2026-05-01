import './shell/shell.css';
import { TopbarEmpty } from './shell/Topbar';
import { Sidebar } from './shell/Sidebar';

export default function App() {
  return (
    <div className="app-shell">
      <TopbarEmpty />
      <div className="shell-body">
        <Sidebar activeId="overview" />
        <main className="main" />
      </div>
    </div>
  );
}
