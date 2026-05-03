import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isAbsoluteUrl, resolveRepoPath } from "../utils/markdownPaths";
import { CodeBlock } from "./CodeBlock";

type Props = {
  source: string;
  owner: string;
  name: string;
  branch: string;
  filePath: string;
};

export function MarkdownView({ source, owner, name, branch, filePath }: Props) {
  function urlTransform(url: string, key: string): string {
    if (isAbsoluteUrl(url)) return url;
    const resolved = resolveRepoPath(filePath, url);
    if (key === "src") {
      return `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${resolved}`;
    }
    return `https://github.com/${owner}/${name}/blob/${branch}/${resolved}`;
  }

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={urlTransform}
        components={{
          code({ className, children, ...props }) {
            const match = /language-([\w-]+)/.exec(className || "");
            const text = String(children).replace(/\n$/, "");
            if (match) {
              return <CodeBlock code={text} language={match[1]} />;
            }
            return <code className={className} {...props}>{children}</code>;
          },
          a({ href, children, ...props }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
