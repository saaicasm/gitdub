import type { IssueDetailResponse } from "./types";

export async function fetchIssueDetail(
  owner: string,
  name: string,
  number: number,
  signal?: AbortSignal,
) {
  const url = `/api/v1/repos/${owner}/${name}/issues/${number}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as IssueDetailResponse;
  return json.data;
}
