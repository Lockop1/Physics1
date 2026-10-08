import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { EQUATIONS, CHAPTER_ORDER, equationsByChapter } from "../content/equations";
import { EquationCard } from "../components/EquationCard";

export function EquationSheetPage() {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("all");
  const { hash } = useLocation();
  const target = hash.replace(/^#/, "");
  const chapters = useMemo(() => Array.from(new Set(EQUATIONS.map((e) => e.chapter))).sort((a, b) => CHAPTER_ORDER.indexOf(a) - CHAPTER_ORDER.indexOf(b)), []);
  const q = query.trim().toLowerCase();
  const matches = (e: (typeof EQUATIONS)[number]) => {
    if (chapter !== "all" && e.chapter !== chapter) return false;
    if (!q) return true;
    const hay = [e.id, e.name, e.latex, e.chapter, ...e.triggers, ...e.useWhen, ...e.dontUseWhen, ...e.variables.map((v) => v.symbol + " " + v.meaning)].join(" ").toLowerCase();
    return hay.includes(q);
  };
  const groups = equationsByChapter().map((g) => ({ chapter: g.chapter, equations: g.equations.filter(matches) })).filter((g) => g.equations.length > 0);

  // deep link from a solution: open and scroll to that equation
  useEffect(() => {
    if (!target) return;
    const el = document.getElementById(target) as HTMLDetailsElement | null;
    if (el) {
      el.open = true;
      setTimeout(() => el.scrollIntoView({ block: "start" }), 50);
    }
  }, [target]);

  return (
    <div>
      <h1>Equations</h1>
      <p className="helper">Tap one to see when it applies and when it doesn't.</p>
      <div className="search-row">
        <input type="text" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="search equations" />
        <select value={chapter} onChange={(e) => setChapter(e.target.value)} aria-label="chapter" style={{ maxWidth: 160 }}>
          <option value="all">All</option>
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {groups.map(({ chapter, equations }) => (
        <section key={chapter}>
          <div className="section-title">{chapter}</div>
          {equations.map((eq) => (
            <EquationCard key={eq.id} eq={eq} open={eq.id === target} />
          ))}
        </section>
      ))}
      {groups.length === 0 && <p className="empty">Nothing matches.</p>}
    </div>
  );
}
