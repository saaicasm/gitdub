import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import RepoPage from "./pages/RepoPage";
import IssuesPage from "./pages/IssuesPage";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "/w/:owner/:name",
    element: <RepoPage />,
    children: [
      { index: true, element: <div /> },
      { path: "issues", element: <IssuesPage /> },
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
