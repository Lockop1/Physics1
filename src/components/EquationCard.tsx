import { Link } from "react-router-dom";
import type { Equation } from "../content/equations";
import { Tex } from "../lib/latex";
import { getEquationStats } from "../lib/storage";
import { templatesUsingEquation } from "../lib/detective";
import { templateById } from "../content/templates";

export function EquationCard({ eq, compact = false }: { eq: Equation; compact?: boolean }) {
  const stats = getEquationStats(eq.id);
  const users = templatesUsingEquation(eq.id);
  return (
    <div className="card eq-card" id={eq.id}>
      <div className="row spread">
        <strong>{eq.name}</strong>
        <span className="row" style={{ gap: 6 }}>
          <span className={"badge " + (eq.onSheet ? "sheet" : "derived")}>{eq.onSheet ? "on sheet" : "derived"}</span>
          <span className="badge">{eq.chapter}</span>
        </span>
      </div>
      <Tex block>{eq.latex}</Tex>
      {!compact && (
        <ul>
          {eq.variables.map((v) => (
            <li key={v.symbol}>
              <Tex>{v.symbol}</Tex> — {v.meaning}
              {v.unit && v.unit !== "—" ? ` (${v.unit})` : ""}
            </li>
          ))}
        </ul>
      )}
      <h4>Use when</h4>
      <ul>
        {eq.useWhen.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h4>Don't use when</h4>
      <ul>
        {eq.dontUseWhen.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h4>Trigger phrases</h4>
      <div className="small muted">{eq.triggers.join(" · ")}</div>
      {eq.derivedFrom && (
        <>
          <h4>Derived from</h4>
          <div className="small row" style={{ gap: 4 }}>
            {eq.derivedFrom.map((d) => (
              <a key={d} href={`#/equations?q=${encodeURIComponent(d)}#${d}`} className="eq-link" onClick={(e) => { e.preventDefault(); document.getElementById(d)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                {d}
              </a>
            ))}
          </div>
        </>
      )}
      <div className="row spread" style={{ marginTop: 10 }}>
        <span className="small muted stat">
          {stats && stats.attempts > 0 ? `Detective: you pick this correctly ${stats.correct}/${stats.attempts}` : "Detective: not yet practised"}
        </span>
        {users.length > 0 && (
          <Link className="btn" to={`/practice-eq/${eq.id}`} title={users.map((id) => templateById(id)?.title ?? id).join("\n")}>
            Practice problems ({users.length})
          </Link>
        )}
      </div>
    </div>
  );
}
