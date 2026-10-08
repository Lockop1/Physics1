import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildFor, randomQuestionFor, CHAPTER_FILTERS } from "../lib/detective";
import { shuffleRecipe, gradeRecipe, hideNumbers } from "../engine/detective";
import { createRng } from "../engine/rng";
import { templateById } from "../content/templates";
import { recordDetectiveMode } from "../lib/storage";
import { RichText } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { EquationLink } from "../components/Solution";

/** Mode C: put the recipe steps in order. Drag on desktop, tap ▲▼ on mobile. */
export function DetectiveRecipePage() {
  const { templateId, seed } = useParams();
  const [params, setParams] = useSearchParams();
  const filter = params.get("filter") ?? "exam2";
  const navigate = useNavigate();
  const go = (f: string, replace = false) => {
    const pick = randomQuestionFor(f, { minRecipe: 3 });
    if (pick) navigate(`/detective/recipe/${pick.templateId}/${pick.seed}?filter=${f}`, { replace });
  };
  useEffect(() => {
    if (!templateId || !seed) go(filter, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, seed, filter]);
  if (!templateId || !seed) return <p className="muted">Loading…</p>;
  return <RecipeRound key={`${templateId}/${seed}`} templateId={templateId} seed={Number(seed)} filter={filter} onFilter={(f) => { setParams({ filter: f }); go(f); }} onNext={() => go(filter)} />;
}

function RecipeRound({ templateId, seed, filter, onFilter, onNext }: { templateId: string; seed: number; filter: string; onFilter: (f: string) => void; onNext: () => void }) {
  const q = useMemo(() => buildFor(templateId, seed), [templateId, seed]);
  const initial = useMemo(() => (q ? shuffleRecipe(createRng(seed * 13 + 3), q.recipe).order : []), [q, seed]);
  const [order, setOrder] = useState<number[]>(initial);
  const [grade, setGrade] = useState<ReturnType<typeof gradeRecipe> | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const template = templateById(templateId);
  if (!q || !template) return <p>Unknown question.</p>;

  const move = (from: number, to: number) => {
    if (grade || to < 0 || to >= order.length) return;
    setOrder((prev) => {
      const n = [...prev];
      const [item] = n.splice(from, 1);
      n.splice(to, 0, item!);
      return n;
    });
  };
  const submit = () => {
    const g = gradeRecipe(order);
    setGrade(g);
    recordDetectiveMode("recipe", g.correct);
  };

  return (
    <div>
      <p className="small muted row spread">
        <span>
          <Link to="/detective">Detective</Link> › C · Build the recipe
        </span>
        <select value={filter} onChange={(e) => onFilter(e.target.value)}>
          {CHAPTER_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </p>
      <div className="practice">
        <div className="card">
          <span className="badge">{template.title}</span>
          <div className="prompt" style={{ marginTop: 8 }}>
            <RichText text={hideNumbers(q.prompt)} />
          </div>
          {q.diagram && (
            <div className="diagram-wrap">
              <Diagram spec={q.diagram} hideNumbers />
            </div>
          )}
          <h3>Put the steps in order</h3>
          <ol className="recipe-order">
            {order.map((stepIdx, pos) => {
              const ok = grade ? stepIdx === pos : null;
              return (
                <li
                  key={stepIdx}
                  className={"recipe-step" + (ok === true ? " correct" : ok === false ? " wrong" : "") + (dragIdx === pos ? " dragging" : "")}
                  draggable={!grade}
                  onDragStart={() => setDragIdx(pos)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx !== null) move(dragIdx, pos);
                    setDragIdx(null);
                  }}
                  onDragEnd={() => setDragIdx(null)}
                >
                  <span className="key">{pos + 1}</span>
                  <span className="grow">
                    <RichText text={q.recipe[stepIdx]!} />
                  </span>
                  {!grade && (
                    <span className="row" style={{ gap: 2 }}>
                      <button className="ghost" onClick={() => move(pos, pos - 1)} disabled={pos === 0} aria-label="move up">
                        ▲
                      </button>
                      <button className="ghost" onClick={() => move(pos, pos + 1)} disabled={pos === order.length - 1} aria-label="move down">
                        ▼
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="actions">
            {!grade && (
              <button className="primary" onClick={submit}>
                Check
              </button>
            )}
            <button className={grade ? "primary" : ""} onClick={onNext}>
              Next
            </button>
            <Link className="btn" to={`/q/${templateId}/${seed}`}>
              Solve it with numbers
            </Link>
          </div>
        </div>
        <div className="sticky">
          {grade ? (
            <div className="card stack">
              <div className={"feedback " + (grade.correct ? "good" : "bad")}>
                <div className="label">{grade.correct ? "That's the plan." : `Order is off from step ${grade.firstWrong + 1}.`}</div>
              </div>
              <div>
                <strong>Correct order</strong>
                <ol className="recipe">
                  {q.recipe.map((r, i) => (
                    <li key={i}>
                      <RichText text={r} />
                    </li>
                  ))}
                </ol>
              </div>
              <div className="row" style={{ gap: 4 }}>
                {q.equations.map((id) => (
                  <EquationLink key={id} id={id} />
                ))}
              </div>
            </div>
          ) : (
            <div className="card muted small">Drag the steps (or use ▲▼) into the order you'd actually do them, then check.</div>
          )}
        </div>
      </div>
    </div>
  );
}
