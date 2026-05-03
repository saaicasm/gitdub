import type { BlobResponse } from "./types";

export async function fetchBlob(owner: string, name: string, path: string) {
  const url = `/api/v1/repos/${owner}/${name}/blob?path=${encodeURIComponent(path)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as BlobResponse;
  return json.data;
}
