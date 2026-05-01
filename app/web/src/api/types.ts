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
