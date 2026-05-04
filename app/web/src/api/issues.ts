import type { IssueListResponse } from "./types";

interface FetchIssuesOptions {
  page?: number;
  perPage?: number;
  state?: string;
  labels?: string[];
}

export async function fetchIssues(
  owner: string,
  name: string,
  options?: FetchIssuesOptions,
) {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", options.page.toString());
  if (options?.perPage) params.set("per_page", options.perPage.toString());
  if (options?.state) params.set("state", options.state);
  if (options?.labels && options.labels.length > 0) {
    params.set("labels", options.labels.join(","));
  }

  const url = `/api/v1/repos/${owner}/${name}/issues${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as IssueListResponse;
  return json.data;
}
