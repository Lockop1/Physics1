import { Link } from "react-router-dom";
import type { Equation } from "../content/equations";
import { Tex } from "../lib/latex";
import { getEquationStats } from "../lib/storage";
import { templatesUsingEquation } from "../lib/detective";

/** Collapsed: name + the equation. Open: when to use it, when not to, what phrases point to it. */
export function EquationCard({ eq, open = false }: { eq: Equation; open?: boolean }) {
  const stats = getEquationStats(eq.id);
  const users = templatesUsingEquation(eq.id);
  return (
    <details className="card eq-card" id={eq.id} open={open}>
      <summary>
        <div className="eq-head">
          <strong>{eq.name}</strong>
          <span className={"pill " + (eq.onSheet ? "sheet" : "derived")}>{eq.onSheet ? "on sheet" : "derive it"}</span>
        </div>
        <Tex block>{eq.latex}</Tex>
      </summary>
      <div className="eq-body">
        <h4>Use when</h4>
        <ul>
          {eq.useWhen.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <h4>Not when</h4>
        <ul>
          {eq.dontUseWhen.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <h4>Cue words</h4>
        <div className="muted">{eq.triggers.join(" · ")}</div>
        <h4>Symbols</h4>
        <ul>
          {eq.variables.map((v) => (
            <li key={v.symbol}>
              <Tex>{v.symbol}</Tex> — {v.meaning}
              {v.unit && v.unit !== "—" ? ` (${v.unit})` : ""}
            </li>
          ))}
        </ul>
        {eq.derivedFrom && (
          <>
            <h4>Built from</h4>
            <div className="eq-links">
              {eq.derivedFrom.map((d) => (
                <a
                  key={d}
                  href={`#${d}`}
                  className="eq-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(d) as HTMLDetailsElement | null;
                    if (el) {
                      el.open = true;
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                >
                  {d}
                </a>
              ))}
            </div>
          </>
        )}
        <div className="row spread" style={{ marginTop: 14 }}>
          <span className="small muted stat">{stats && stats.attempts > 0 ? `Detective: ${stats.correct}/${stats.attempts}` : ""}</span>
          {users.length > 0 && (
            <Link className="btn" to={`/practice-eq/${eq.id}`}>
              Practice ({users.length})
            </Link>
          )}
        </div>
      </div>
    </details>
  );
}
