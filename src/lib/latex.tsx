import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";

interface TexProps {
  /** LaTeX source. */
  children: string;
  /** Display (block) mode. */
  block?: boolean;
  className?: string;
}

/** Render a single LaTeX expression with KaTeX. Errors are rendered as text. */
export function Tex({ children, block = false, className }: TexProps) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        displayMode: block,
        throwOnError: false,
        strict: "ignore",
      }),
    [children, block],
  );
  const Tag = block ? "div" : "span";
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Render a string containing prose with inline `$...$` math segments.
 * `$$...$$` renders as display math.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => splitMath(text), [text]);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.kind === "text" ? (
          <span key={i}>{p.value}</span>
        ) : (
          <Tex key={i} block={p.kind === "display"}>
            {p.value}
          </Tex>
        ),
      )}
    </span>
  );
}

type Part = { kind: "text" | "inline" | "display"; value: string };

export function splitMath(text: string): Part[] {
  const out: Part[] = [];
  let i = 0;
  let buf = "";
  while (i < text.length) {
    if (text.startsWith("$$", i)) {
      const end = text.indexOf("$$", i + 2);
      if (end === -1) break;
      if (buf) out.push({ kind: "text", value: buf });
      buf = "";
      out.push({ kind: "display", value: text.slice(i + 2, end) });
      i = end + 2;
    } else if (text[i] === "$") {
      const end = text.indexOf("$", i + 1);
      if (end === -1) break;
      if (buf) out.push({ kind: "text", value: buf });
      buf = "";
      out.push({ kind: "inline", value: text.slice(i + 1, end) });
      i = end + 1;
    } else {
      buf += text[i];
      i++;
    }
  }
  if (i < text.length) buf += text.slice(i);
  if (buf) out.push({ kind: "text", value: buf });
  return out;
}
