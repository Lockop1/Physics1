import { Link } from "react-router-dom";
import type { GeneratedQuestion, QuestionPart, SolutionStep } from "../engine/types";
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

function Steps({ steps }: { steps: SolutionStep[] }) {
  return (
    <ol>
      {steps.map((s, i) => (
        <li key={i}>
          <RichText text={s.text} />
          {s.equationId && <EquationLink id={s.equationId} />}
          {s.latex && <Tex block>{s.latex}</Tex>}
        </li>
      ))}
    </ol>
  );
}

function answerText(answer: number | string, unit: string): string {
  return typeof answer === "number" ? `${fmtDisplay(answer)}${unit ? " " + unit : ""}` : answer;
}

/** Solution for one part of a multi-part question. */
export function PartSolution({ part }: { part: QuestionPart }) {
  return (
    <div className="solution">
      <div>
        <strong>Answer {part.label}:</strong> <RichText text={answerText(part.answer, part.target.unit)} />
      </div>
      <Steps steps={part.solution} />
    </div>
  );
}

export function Solution({ q }: { q: GeneratedQuestion }) {
  const ans = answerText(q.answer, q.target.unit);
  return (
    <div className="solution stack">
      {q.parts ? (
        <div>
          <strong>Answers</strong>
          <ul style={{ margin: "4px 0", paddingLeft: "1.2rem" }}>
            {q.parts.map((p) => (
              <li key={p.label}>
                {p.label} <RichText text={answerText(p.answer, p.target.unit)} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <strong>Answer:</strong> <RichText text={ans} />
        </div>
      )}
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
      {q.parts ? (
        q.parts.map((p) => (
          <div key={p.label}>
            <strong>
              {p.label} <RichText text={p.prompt} />
            </strong>
            <Steps steps={p.solution} />
          </div>
        ))
      ) : (
        <div>
          <strong>Worked solution</strong>
          <Steps steps={q.solution} />
        </div>
      )}
      {q.note && <div className="small muted">{q.note}</div>}
    </div>
  );
}
