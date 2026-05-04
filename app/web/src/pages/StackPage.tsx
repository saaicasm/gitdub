import { StackView } from "../components/StackView";
import { useRepoContext } from "./RepoPage";

export default function StackPage() {
  const { repo } = useRepoContext();
  return <StackView owner={repo.owner} name={repo.name} />;
}
