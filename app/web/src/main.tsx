import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import RepoPage from "./pages/RepoPage";
import OverviewPage from "./pages/OverviewPage";
import IssuesPage from "./pages/IssuesPage";
import TreePage from "./pages/TreePage";
import StackPage from "./pages/StackPage";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "/w/:owner/:name",
    element: <RepoPage />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "issues", element: <IssuesPage /> },
      { path: "tree", element: <TreePage /> },
      { path: "stack", element: <StackPage /> },
    ],
  },
]);

export default function Root() {
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
