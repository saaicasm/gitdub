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
