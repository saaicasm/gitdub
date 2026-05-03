import { useEffect, useState } from "react";
import type { HighlighterCore } from "shiki/core";

type Props = {
  code: string;
  language: string | null;
};

let highlighterPromise: Promise<HighlighterCore> | null = null;
const loadedLangs = new Set<string>();

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighterCore } = await import("shiki/core");
      const { createOnigurumaEngine } = await import("shiki/engine/oniguruma");
      return createHighlighterCore({
        themes: [import("@shikijs/themes/github-light")],
        langs: [],
        engine: createOnigurumaEngine(import("shiki/wasm")),
      });
    })();
  }
  return highlighterPromise;
}

// Static import map — each language becomes its own chunk, loaded on demand.
const LANG_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  typescript: () => import("@shikijs/langs/typescript"),
  tsx: () => import("@shikijs/langs/tsx"),
  javascript: () => import("@shikijs/langs/javascript"),
  jsx: () => import("@shikijs/langs/jsx"),
  python: () => import("@shikijs/langs/python"),
  go: () => import("@shikijs/langs/go"),
  rust: () => import("@shikijs/langs/rust"),
  ruby: () => import("@shikijs/langs/ruby"),
  kotlin: () => import("@shikijs/langs/kotlin"),
  swift: () => import("@shikijs/langs/swift"),
  cpp: () => import("@shikijs/langs/cpp"),
  c: () => import("@shikijs/langs/c"),
  csharp: () => import("@shikijs/langs/csharp"),
  php: () => import("@shikijs/langs/php"),
  dart: () => import("@shikijs/langs/dart"),
  lua: () => import("@shikijs/langs/lua"),
  perl: () => import("@shikijs/langs/perl"),
  scala: () => import("@shikijs/langs/scala"),
  elixir: () => import("@shikijs/langs/elixir"),
  haskell: () => import("@shikijs/langs/haskell"),
  html: () => import("@shikijs/langs/html"),
  css: () => import("@shikijs/langs/css"),
  scss: () => import("@shikijs/langs/scss"),
  sass: () => import("@shikijs/langs/sass"),
  vue: () => import("@shikijs/langs/vue"),
  svelte: () => import("@shikijs/langs/svelte"),
  markdown: () => import("@shikijs/langs/markdown"),
  json: () => import("@shikijs/langs/json"),
  yaml: () => import("@shikijs/langs/yaml"),
  toml: () => import("@shikijs/langs/toml"),
  xml: () => import("@shikijs/langs/xml"),
  bash: () => import("@shikijs/langs/bash"),
  sql: () => import("@shikijs/langs/sql"),
  graphql: () => import("@shikijs/langs/graphql"),
  proto: () => import("@shikijs/langs/proto"),
  diff: () => import("@shikijs/langs/diff"),
  docker: () => import("@shikijs/langs/docker"),
  make: () => import("@shikijs/langs/make"),
  cmake: () => import("@shikijs/langs/cmake"),
};

async function ensureLanguage(highlighter: HighlighterCore, lang: string) {
  if (loadedLangs.has(lang)) return;
  const loader = LANG_LOADERS[lang];
  if (!loader) return;
  try {
    const mod = await loader();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await highlighter.loadLanguage(mod.default as any);
    loadedLangs.add(lang);
  } catch {
    // grammar load failed — fall through to plain text
  }
}

export function CodeBlock({ code, language }: Props) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!language) {
        setHtml(null);
        return;
      }
      const hl = await getHighlighter();
      await ensureLanguage(hl, language);
      if (cancelled) return;
      const supported = hl.getLoadedLanguages().includes(language);
      const out = hl.codeToHtml(code, {
        lang: supported ? language : "text",
        theme: "github-light",
      });
      if (!cancelled) setHtml(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (html) {
    return <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <pre className="code-block code-block--plain"><code>{code}</code></pre>
  );
}
