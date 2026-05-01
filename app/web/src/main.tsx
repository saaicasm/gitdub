import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import RepoPage from "./pages/RepoPage";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/w/:owner/:name", element: <RepoPage /> },
]);

export default function Root() {
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
