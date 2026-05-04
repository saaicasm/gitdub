import { useState } from "react";
import { TreeView } from "../components/TreeView";
import { FileViewer } from "../components/FileViewer";
import { Modal } from "../components/Modal";
import { useRepoContext } from "./RepoPage";

type TreeState = {
  expandedPaths: Set<string>;
};

export default function TreePage() {
  const { repo } = useRepoContext();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [openFilePath, setOpenFilePath] = useState<string | null>(null);
  const [treeHistory, setTreeHistory] = useState<TreeState[]>([]);

  function handleOpenFile(filePath: string) {
    setTreeHistory(prev => [...prev, { expandedPaths: new Set(expandedPaths) }]);
    setOpenFilePath(filePath);
  }

  function handleToggleFolder(path: string) {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function handleBackInTree() {
    if (treeHistory.length > 0) {
      const prevState = treeHistory[treeHistory.length - 1];
      setExpandedPaths(new Set(prevState.expandedPaths));
      setOpenFilePath(null);
      setTreeHistory(prev => prev.slice(0, -1));
    }
  }

  return (
    <>
      {openFilePath === null ? (
        <TreeView
          owner={repo.owner}
          name={repo.name}
          onOpenFile={handleOpenFile}
          expandedPaths={expandedPaths}
          onToggle={handleToggleFolder}
        />
      ) : (
        <FileViewer
          owner={repo.owner}
          name={repo.name}
          branch={repo.defaultBranch}
          path={openFilePath}
          onClose={handleBackInTree}
        />
      )}
      <Modal open={openFilePath !== null} onClose={handleBackInTree}>
        {openFilePath !== null && (
          <FileViewer
            owner={repo.owner}
            name={repo.name}
            branch={repo.defaultBranch}
            path={openFilePath}
            onClose={handleBackInTree}
          />
        )}
      </Modal>
    </>
  );
}
