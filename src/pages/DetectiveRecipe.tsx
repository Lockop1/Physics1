import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildFor, randomQuestionFor } from "../lib/detective";
import { shuffleRecipe, gradeRecipe, hideNumbers } from "../engine/detective";
import { createRng } from "../engine/rng";
import { templateById } from "../content/templates";
import { recordDetectiveMode } from "../lib/storage";
import { RichText } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { EquationLinks } from "../components/Solution";
import { PageHeader } from "../components/PageHeader";
import { ActionBar } from "../components/ActionBar";
import { FilterSelect } from "./DetectivePick";

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
    if (grade) return;
    const g = gradeRecipe(order);
    setGrade(g);
    recordDetectiveMode("recipe", g.correct);
  };

  return (
    <div className="question">
      <PageHeader back={{ to: "/detective", label: "Detective" }} title="Recipe" right={<FilterSelect value={filter} onChange={onFilter} />} />
      <div className="prompt">
        <RichText text={hideNumbers(q.prompt)} />
      </div>
      {q.diagram && (
        <div className="diagram-wrap">
          <Diagram spec={q.diagram} hideNumbers />
        </div>
      )}
      <h3>Put the steps in order</h3>
      <p className="helper">The order you'd actually do them.</p>
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
                <span className="arrows">
                  <button onClick={() => move(pos, pos - 1)} disabled={pos === 0} aria-label="move up">
                    ▲
                  </button>
                  <button onClick={() => move(pos, pos + 1)} disabled={pos === order.length - 1} aria-label="move down">
                    ▼
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {grade && !grade.correct && (
        <div className="card solution-card">
          <h4 className="section-title">Correct order</h4>
          <ol className="recipe">
            {q.recipe.map((r, i) => (
              <li key={i}>
                <RichText text={r} />
              </li>
            ))}
          </ol>
          <h4 className="section-title" style={{ marginTop: 14 }}>
            Equations
          </h4>
          <EquationLinks ids={q.equations} />
        </div>
      )}
      {grade && grade.correct && (
        <div className="card solution-card">
          <h4 className="section-title">Equations</h4>
          <EquationLinks ids={q.equations} />
        </div>
      )}
      <ActionBar tone={grade ? (grade.correct ? "good" : "bad") : undefined} message={grade ? (grade.correct ? "That's the plan" : `Order is off from step ${grade.firstWrong + 1}`) : undefined}>
        {grade ? (
          <>
            <Link className="btn quiet" to={`/q/${templateId}/${seed}`}>
              Solve with numbers
            </Link>
            <button className="primary" onClick={onNext}>
              Next
            </button>
          </>
        ) : (
          <>
            <button className="quiet" onClick={onNext}>
              Skip
            </button>
            <button className="primary" onClick={submit}>
              Check
            </button>
          </>
        )}
      </ActionBar>
    </div>
  );
}
