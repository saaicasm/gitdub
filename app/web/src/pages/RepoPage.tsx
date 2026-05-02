import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import { fetchRepoMetadata } from "../api/repos";
import type { RepoMetadata } from "../api/types";
import { Sidebar } from "../shell/Sidebar";
import { TopbarLoaded } from "../shell/Topbar";

export type RepoOutletContext = {
  repo: RepoMetadata;
};

export function useRepoContext() {
  return useOutletContext<RepoOutletContext>();
}

export default function RepoPage() {
  const { owner, name } = useParams();
  const [data, setData] = useState<RepoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !name) return;

    setLoading(true);
    setError(null);

    fetchRepoMetadata(owner, name)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [owner, name]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return null;

  const context: RepoOutletContext = { repo: data };

  return (
    <div className="app-shell">
      <TopbarLoaded repo={data} />
      <div className="shell-body">
        <Sidebar />
        <main className="main">
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
}
