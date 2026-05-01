import type { RepoMetadataResponse } from "./types";

export async function fetchRepoMetadata(owner: string, name: string) {
  const res = await fetch(`/api/v1/repos/${owner}/${name}/metadata`);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as RepoMetadataResponse;
  return json.data;
}
