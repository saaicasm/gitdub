import { useEffect, useState } from "react";
import { fetchStack } from "../api/stack";
import type { Language, Stack, Tool } from "../api/types";
import { colorFor } from "../utils/languageColors";
import { iconSlugFor } from "../utils/languageIcon";

const CATEGORY_ORDER = [
  "package",
  "lang",
  "framework",
  "build",
  "test",
  "lint",
  "container",
  "ci",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  package: "Package",
  lang: "Language",
  framework: "Framework",
  build: "Build",
  test: "Test",
  lint: "Lint",
  container: "Container",
  ci: "CI",
};

const BAR_THRESHOLD = 1;

type Props = {
  owner: string;
  name: string;
};

export function StackView({ owner, name }: Props) {
  const [data, setData] = useState<Stack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStack(owner, name)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [owner, name]);

  if (loading) return <div className="stack-status">Loading...</div>;
  if (error) return <div className="stack-status">{error}</div>;
  if (!data) return null;

  return (
    <div className="stack">
      <LanguagesSection languages={data.languages} />
      <ToolsSection tools={data.tools} />
    </div>
  );
}

function LanguagesSection({ languages }: { languages: Language[] }) {
  if (languages.length === 0) {
    return (
      <section className="stack-section">
        <h2 className="stack-section__heading">Languages</h2>
        <div className="stack-empty">No languages detected.</div>
      </section>
    );
  }

  const visible = languages.filter(l => l.percent >= BAR_THRESHOLD);
  const otherTotal = languages
    .filter(l => l.percent < BAR_THRESHOLD)
    .reduce((acc, l) => acc + l.percent, 0);

  return (
    <section className="stack-section">
      <h2 className="stack-section__heading">Languages</h2>
      <div className="lang-bar" role="img" aria-label="Language breakdown">
        {visible.map(l => (
          <span
            key={l.name}
            className="lang-bar__seg"
            style={{ width: `${l.percent}%`, background: colorFor(l.name) }}
            title={`${l.name} · ${l.percent}%`}
          />
        ))}
        {otherTotal > 0 && (
          <span
            className="lang-bar__seg"
            style={{ width: `${otherTotal}%`, background: "#cccccc" }}
            title={`Other · ${otherTotal.toFixed(1)}%`}
          />
        )}
      </div>
      <ul className="lang-list">
        {languages.map(l => (
          <LanguageRow key={l.name} language={l} />
        ))}
      </ul>
    </section>
  );
}

function LanguageRow({ language }: { language: Language }) {
  const slug = iconSlugFor(language.name);
  const color = colorFor(language.name);

  return (
    <li className="lang-row">
      <span className="lang-row__icon">
        {slug ? (
          <img
            src={`https://cdn.simpleicons.org/${slug}`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={e => {
              const img = e.currentTarget;
              const fallback = document.createElement("span");
              fallback.className = "lang-row__dot";
              fallback.style.background = color;
              img.replaceWith(fallback);
            }}
          />
        ) : (
          <span className="lang-row__dot" style={{ background: color }} />
        )}
      </span>
      <span className="lang-row__name">{language.name}</span>
      <span className="lang-row__percent">{language.percent}%</span>
      <span className="lang-row__bytes">{formatBytes(language.bytes)}</span>
    </li>
  );
}

function ToolsSection({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) {
    return (
      <section className="stack-section">
        <h2 className="stack-section__heading">Tools</h2>
        <div className="stack-empty">No tools detected at the repo root.</div>
      </section>
    );
  }

  const grouped: Record<string, Tool[]> = {};
  for (const t of tools) {
    (grouped[t.category] ??= []).push(t);
  }

  return (
    <section className="stack-section">
      <h2 className="stack-section__heading">Tools</h2>
      {CATEGORY_ORDER.map(cat => {
        const list = grouped[cat];
        if (!list || list.length === 0) return null;
        return (
          <div key={cat} className="tool-group">
            <div className="tool-group__heading">{CATEGORY_LABELS[cat]}</div>
            <div className="tool-group__chips">
              {list.map(t => <ToolChip key={t.name} tool={t} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ToolChip({ tool }: { tool: Tool }) {
  return (
    <span className="tool-chip" title={`Detected via ${tool.evidence}`}>
      <span className="tool-chip__icon">
        {tool.iconSlug && (
          <img
            src={`https://cdn.simpleicons.org/${tool.iconSlug}`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={e => e.currentTarget.remove()}
          />
        )}
      </span>
      <span className="tool-chip__name">{tool.name}</span>
    </span>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
