import { Link } from "react-router-dom";
import type { Choice, GeneratedQuestion, QuestionPart, SolutionStep } from "../engine/types";
import { equationById } from "../content/equations";
import { errorById } from "../content/errors";
import { Tex, RichText } from "../lib/latex";
import { fmtDisplay } from "../engine/params";
import { choiceLabel } from "./ChoiceList";

export function EquationLink({ id }: { id: string }) {
  const eq = equationById(id);
  if (!eq) return <span className="eq-link">{id}</span>;
  return (
    <Link className="eq-link" to={`/equations#${id}`} title={eq.name}>
      {eq.name}
    </Link>
  );
}

export function EquationLinks({ ids }: { ids: string[] }) {
  return (
    <div className="eq-links">
      {ids.map((id) => (
        <EquationLink key={id} id={id} />
      ))}
    </div>
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

/** "Why the other choices are wrong": each distractor with the mistake that produces it. Collapsed by default. */
export function Distractors({ choices, unit }: { choices: Choice[]; unit: string }) {
  const wrong = choices.filter((c) => !c.correct && c.errorId);
  if (wrong.length === 0) return null;
  return (
    <details className="distractors">
      <summary>Why the other choices are wrong</summary>
      <ul>
        {wrong.map((c, i) => {
          const e = c.errorId ? errorById(c.errorId) : null;
          return (
            <li key={i}>
              <RichText text={choiceLabel(c, unit)} /> — <strong>{e?.label ?? c.errorId}</strong>
              {e ? `. ${e.explanation}` : ""}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

/** Solution for one part of a multi-part question. */
export function PartSolution({ part }: { part: QuestionPart }) {
  return (
    <div className="solution">
      <div className="answer">
        <RichText text={answerText(part.answer, part.target.unit)} />
      </div>
      <Steps steps={part.solution} />
      <Distractors choices={part.choices} unit={part.target.unit} />
    </div>
  );
}

/**
 * The full worked solution, in the order you'd actually think: the answer, the plan (which
 * equations and why), then the steps. Everything else stays behind a disclosure.
 */
export function Solution({ q, omitSteps = false }: { q: GeneratedQuestion; omitSteps?: boolean }) {
  return (
    <div className="solution">
      {q.parts ? (
        <div className="answer">
          {q.parts.map((p) => (
            <div key={p.label}>
              <span className="muted">{p.label}</span> <RichText text={answerText(p.answer, p.target.unit)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="answer">
          <RichText text={answerText(q.answer, q.target.unit)} />
        </div>
      )}
      <h4>Plan</h4>
      <ol className="recipe">
        {q.recipe.map((r, i) => (
          <li key={i}>
            <RichText text={r} />
          </li>
        ))}
      </ol>
      <h4>Equations</h4>
      <EquationLinks ids={q.equations} />
      {!omitSteps && <h4>Steps</h4>}
      {omitSteps ? null : q.parts ? (
        q.parts.map((p) => (
          <div key={p.label}>
            <strong>
              {p.label} <RichText text={p.prompt} />
            </strong>
            <Steps steps={p.solution} />
          </div>
        ))
      ) : (
        <Steps steps={q.solution} />
      )}
      {q.note && (
        <p className="note" style={{ marginTop: 12 }}>
          {q.note}
        </p>
      )}
      {!q.parts && <Distractors choices={q.choices} unit={q.target.unit} />}
    </div>
  );
}
