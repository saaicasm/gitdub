import './shell/shell.css';
import { TopbarEmpty } from './shell/Topbar';
import { Sidebar } from './shell/Sidebar';
import Home from './pages/Home';

export default function App() {
  return (
    <div className="app-shell">
      <TopbarEmpty />
      <div className="shell-body">
        <Sidebar />
        <main className="main">
          <Home />
        </main>
      </div>
    </div>
  );
}
