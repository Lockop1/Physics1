import { Link } from "react-router-dom";
import type { GeneratedQuestion } from "../engine/types";
import { equationById } from "../content/equations";
import { Tex, RichText } from "../lib/latex";
import { fmtDisplay } from "../engine/params";

export function EquationLink({ id }: { id: string }) {
  const eq = equationById(id);
  if (!eq) return <span className="eq-link">{id}</span>;
  return (
    <Link className="eq-link" to={`/equations#${id}`} title={eq.name}>
      {eq.name}
    </Link>
  );
}

export function Solution({ q }: { q: GeneratedQuestion }) {
  const ans = typeof q.answer === "number" ? `${fmtDisplay(q.answer)}${q.target.unit ? " " + q.target.unit : ""}` : q.answer;
  return (
    <div className="solution stack">
      <div>
        <strong>Answer:</strong> <RichText text={ans} />
      </div>
      <div>
        <strong>Plan</strong>
        <ol className="recipe">
          {q.recipe.map((r, i) => (
            <li key={i}>
              <RichText text={r} />
            </li>
          ))}
        </ol>
      </div>
      <div>
        <strong>Equations used</strong>
        <div className="row" style={{ gap: 4 }}>
          {q.equations.map((id) => (
            <EquationLink key={id} id={id} />
          ))}
        </div>
      </div>
      <div>
        <strong>Worked solution</strong>
        <ol>
          {q.solution.map((s, i) => (
            <li key={i}>
              <RichText text={s.text} />
              {s.equationId && <EquationLink id={s.equationId} />}
              {s.latex && <Tex block>{s.latex}</Tex>}
            </li>
          ))}
        </ol>
      </div>
      {q.note && <div className="small muted">{q.note}</div>}
    </div>
  );
}
