import { useMemo, useState } from "react";
import { EQUATIONS, CHAPTER_ORDER, equationsByChapter } from "../content/equations";
import { EquationCard } from "../components/EquationCard";

export function EquationSheetPage() {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("all");
  const chapters = useMemo(() => Array.from(new Set(EQUATIONS.map((e) => e.chapter))).sort((a, b) => CHAPTER_ORDER.indexOf(a) - CHAPTER_ORDER.indexOf(b)), []);
  const q = query.trim().toLowerCase();
  const matches = (e: (typeof EQUATIONS)[number]) => {
    if (chapter !== "all" && e.chapter !== chapter) return false;
    if (!q) return true;
    const hay = [e.id, e.name, e.latex, e.chapter, ...e.triggers, ...e.useWhen, ...e.dontUseWhen, ...e.variables.map((v) => v.symbol + " " + v.meaning)].join(" ").toLowerCase();
    return hay.includes(q);
  };
  const groups = equationsByChapter().map((g) => ({ chapter: g.chapter, equations: g.equations.filter(matches) })).filter((g) => g.equations.length > 0);
  return (
    <div>
      <h1>Equation sheet</h1>
      <p className="muted">
        "On sheet" = expected on the provided formula sheet; "derived" = build it from sheet equations. Each card shows when to use it, when NOT to, and the phrases that point to it.
      </p>
      <div className="row" style={{ marginBottom: 14 }}>
        <input type="text" placeholder="Search: keyword, symbol, trigger phrase…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: "1 1 240px" }} />
        <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
          <option value="all">All chapters</option>
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="small muted">{groups.reduce((n, g) => n + g.equations.length, 0)} equations</span>
      </div>
      {groups.map(({ chapter, equations }) => (
        <section key={chapter} className="exam-section">
          <h2>{chapter}</h2>
          <div className="eq-grid">
            {equations.map((eq) => (
              <EquationCard key={eq.id} eq={eq} />
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <p className="muted">Nothing matches.</p>}
    </div>
  );
}
