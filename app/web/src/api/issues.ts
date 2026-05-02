import type { IssueListResponse } from "./types";

export async function fetchIssues(owner: string, name: string) {
  const res = await fetch(`/api/v1/repos/${owner}/${name}/issues`);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as IssueListResponse;
  return json.data;
}
