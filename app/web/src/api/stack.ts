import type { StackResponse } from "./types";

export async function fetchStack(owner: string, name: string) {
  const res = await fetch(`/api/v1/repos/${owner}/${name}/stack`);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as StackResponse;
  return json.data;
}
