import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildFor, randomQuestionFor, CHAPTER_FILTERS } from "../lib/detective";
import { buildEquationOptions, gradeEquationPick, hideNumbers } from "../engine/detective";
import { createRng } from "../engine/rng";
import { equationById } from "../content/equations";
import { templateById } from "../content/templates";
import { recordDetectiveMode, recordEquationPick } from "../lib/storage";
import { RichText, Tex } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { EquationPicker } from "../components/EquationPicker";
import { EquationLink } from "../components/Solution";

/** Mode A: pick the equations. URL: /detective/pick/:templateId/:seed?filter=… */
export function DetectivePickPage() {
  const { templateId, seed } = useParams();
  const [params, setParams] = useSearchParams();
  const filter = params.get("filter") ?? "exam2";
  const navigate = useNavigate();

  useEffect(() => {
    if (!templateId || !seed) {
      const pick = randomQuestionFor(filter);
      if (pick) navigate(`/detective/pick/${pick.templateId}/${pick.seed}?filter=${filter}`, { replace: true });
    }
  }, [templateId, seed, filter, navigate]);

  if (!templateId || !seed) return <p className="muted">Loading…</p>;
  return (
    <PickRound
      key={`${templateId}/${seed}`}
      templateId={templateId}
      seed={Number(seed)}
      filter={filter}
      onFilter={(f) => {
        setParams({ filter: f });
        const pick = randomQuestionFor(f);
        if (pick) navigate(`/detective/pick/${pick.templateId}/${pick.seed}?filter=${f}`);
      }}
      onNext={() => {
        const pick = randomQuestionFor(filter);
        if (pick) navigate(`/detective/pick/${pick.templateId}/${pick.seed}?filter=${filter}`);
      }}
    />
  );
}

export function PickRound({ templateId, seed, filter, onFilter, onNext, embedded = false }: { templateId: string; seed: number; filter: string; onFilter?: (f: string) => void; onNext: () => void; embedded?: boolean }) {
  const q = useMemo(() => buildFor(templateId, seed), [templateId, seed]);
  const setup = useMemo(() => (q ? buildEquationOptions(createRng(seed * 7919 + 17), q) : null), [q, seed]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [grade, setGrade] = useState<ReturnType<typeof gradeEquationPick> | null>(null);
  const [hide, setHide] = useState(true);
  const template = templateById(templateId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return;
      if (/^[1-8]$/.test(e.key) && setup && !grade) {
        const eq = setup.options[Number(e.key) - 1];
        if (eq) toggle(eq.id);
      } else if (e.key === "Enter" && !grade) submit();
      else if ((e.key === "n" || e.key === "N") && grade) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!q || !setup || !template) return <p>Unknown question.</p>;
  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const submit = () => {
    if (grade) return;
    const g = gradeEquationPick(selected, setup.correct);
    setGrade(g);
    recordDetectiveMode("pick", g.correct);
    for (const eq of setup.options) {
      const isCorrect = setup.correct.has(eq.id);
      const picked = selected.has(eq.id);
      // per-equation accuracy: a correct equation counts as a hit when picked; a decoy counts as a hit when NOT picked
      if (isCorrect) recordEquationPick(eq.id, picked);
      else if (picked) recordEquationPick(eq.id, false);
    }
  };
  const prompt = hide ? hideNumbers(q.prompt) : q.prompt;

  return (
    <div>
      {!embedded && (
        <p className="small muted row spread">
          <span>
            <Link to="/detective">Detective</Link> › A · Pick the equations
          </span>
          {onFilter && (
            <select value={filter} onChange={(e) => onFilter(e.target.value)}>
              {CHAPTER_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          )}
        </p>
      )}
      <div className="practice">
        <div className="card">
          <div className="row spread" style={{ marginBottom: 8 }}>
            <span className="badge">{template.title}</span>
            <label className="small row" style={{ gap: 6 }}>
              <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} /> hide numbers
            </label>
          </div>
          <div className="prompt">
            <RichText text={prompt} />
          </div>
          {q.diagram && (
            <div className="diagram-wrap">
              <Diagram spec={q.diagram} hideNumbers={hide} />
            </div>
          )}
          <div className="small muted">
            Find: {q.target.label} {q.target.symbol && <Tex>{q.target.symbol}</Tex>}
            {q.parts ? ` (and ${q.parts.length - 1} more part${q.parts.length > 2 ? "s" : ""})` : ""}
          </div>
          <h3 style={{ marginTop: 12 }}>Which equation(s) would you use?</h3>
          <EquationPicker options={setup.options} selected={selected} onToggle={toggle} grade={grade} correct={setup.correct} />
          <div className="actions">
            {!grade && (
              <button className="primary" onClick={submit} disabled={selected.size === 0}>
                Check <kbd>↵</kbd>
              </button>
            )}
            <button className={grade ? "primary" : ""} onClick={onNext}>
              Next <kbd>N</kbd>
            </button>
            <Link className="btn" to={`/q/${templateId}/${seed}`}>
              Solve this one with numbers
            </Link>
          </div>
        </div>
        <div className="sticky">
          {grade ? (
            <div className="card stack">
              <div className={"feedback " + (grade.correct ? "good" : "bad")}>
                <div className="label">{grade.correct ? "Exactly the right set." : "Not quite."}</div>
                {grade.extra.length > 0 && (
                  <div>
                    <strong>Decoys you picked:</strong>
                    <ul>
                      {grade.extra.map((id) => {
                        const eq = equationById(id)!;
                        return (
                          <li key={id}>
                            <em>{eq.name}</em> — don't use when: {eq.dontUseWhen.join("; ")}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {grade.missing.length > 0 && (
                  <div>
                    <strong>Needed but not picked:</strong>
                    <ul>
                      {grade.missing.map((id) => {
                        const eq = equationById(id)!;
                        return (
                          <li key={id}>
                            <em>{eq.name}</em> — use when: {eq.useWhen[0]}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
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
                <strong>Equations, in order</strong>
                <div className="row" style={{ gap: 4 }}>
                  {q.equations.map((id) => (
                    <EquationLink key={id} id={id} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card muted small">Pick every equation you'd need (and none you wouldn't), then check. Keys 1–8 toggle, ↵ checks.</div>
          )}
        </div>
      </div>
    </div>
  );
}
