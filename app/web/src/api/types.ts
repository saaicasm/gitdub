export interface RepoMetadata {
  avatarUrl: string;
  owner: string;
  name: string;
  defaultBranch: string;
  stars: number;
}

export interface RepoMetadataResponse {
  data: RepoMetadata;
}

export interface IssueAuthor {
  login: string;
  avatarUrl: string;
}

export interface IssueLabel {
  name: string;
  color: string;
}

export interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  author: IssueAuthor;
  labels: IssueLabel[];
  comments: number;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface IssueListResponse {
  data: Issue[];
}

export interface TreeEntry {
  path: string;
  name: string;
  type: string;
  size: number;
  sha: string;
}

export interface TreeListResponse {
  data: TreeEntry[];
}

export interface Language {
  name: string;
  bytes: number;
  percent: number;
}

export interface Tool {
  name: string;
  category: string;
  evidence: string;
  iconSlug: string;
}

export interface Stack {
  languages: Language[];
  tools: Tool[];
}

export interface StackResponse {
  data: Stack;
}
