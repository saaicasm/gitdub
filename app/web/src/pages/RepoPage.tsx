import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRepoMetadata } from "../api/repos";
import type { RepoMetadata } from "../api/types";
import { TopbarLoaded } from "../shell/Topbar";

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

  return (
    <TopbarLoaded
      repo={{
        avatarUrl: data.avatarUrl,
        owner: data.owner,
        name: data.name,
        defaultBranch: data.defaultBranch,
        stars: data.stars,
      }}
    />
  );
}
