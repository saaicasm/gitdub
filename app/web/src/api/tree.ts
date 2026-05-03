import type { TreeListResponse } from "./types";

export async function fetchTree(owner: string, name: string, path = "") {
  const url = `/api/v1/repos/${owner}/${name}/tree?path=${encodeURIComponent(path)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as TreeListResponse;
  return json.data;
}
