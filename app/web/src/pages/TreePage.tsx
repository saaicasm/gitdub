import { TreeView } from "../components/TreeView";
import { useRepoContext } from "./RepoPage";

export default function TreePage() {
  const { repo } = useRepoContext();
  return <TreeView owner={repo.owner} name={repo.name} branch={repo.defaultBranch} />;
}
