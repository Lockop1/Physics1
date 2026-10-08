import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildFor, randomQuestionFor, CHAPTER_FILTERS } from "../lib/detective";
import { buildTagging, gradeTagging, NOT_NEEDED } from "../engine/detective";
import { createRng } from "../engine/rng";
import { fmtDisplay } from "../engine/params";
import { templateById } from "../content/templates";
import { recordDetectiveMode } from "../lib/storage";
import { RichText, Tex } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { PickRound } from "./DetectivePick";

/** Mode B: tag givens with symbols, pick the target, then flow into mode A. */
export function DetectiveGivensPage() {
  const { templateId, seed } = useParams();
  const [params, setParams] = useSearchParams();
  const filter = params.get("filter") ?? "exam2";
  const navigate = useNavigate();
  const go = (f: string) => {
    const pick = randomQuestionFor(f, { numericOnly: true });
    if (pick) navigate(`/detective/givens/${pick.templateId}/${pick.seed}?filter=${f}`);
  };
  useEffect(() => {
    if (!templateId || !seed) {
      const pick = randomQuestionFor(filter, { numericOnly: true });
      if (pick) navigate(`/detective/givens/${pick.templateId}/${pick.seed}?filter=${filter}`, { replace: true });
    }
  }, [templateId, seed, filter, navigate]);
  if (!templateId || !seed) return <p className="muted">Loading…</p>;
  return <GivensRound key={`${templateId}/${seed}`} templateId={templateId} seed={Number(seed)} filter={filter} onFilter={(f) => { setParams({ filter: f }); go(f); }} onNext={() => go(filter)} />;
}

function GivensRound({ templateId, seed, filter, onFilter, onNext }: { templateId: string; seed: number; filter: string; onFilter: (f: string) => void; onNext: () => void }) {
  const q = useMemo(() => buildFor(templateId, seed), [templateId, seed]);
  const setup = useMemo(() => (q ? buildTagging(createRng(seed * 31 + 5), q) : null), [q, seed]);
  const [tags, setTags] = useState<(string | null)[]>(() => (setup ? setup.items.map(() => null) : []));
  const [target, setTarget] = useState<string | null>(null);
  const [grade, setGrade] = useState<ReturnType<typeof gradeTagging> | null>(null);
  const [stage, setStage] = useState<"tag" | "pick">("tag");
  const template = templateById(templateId);
  if (!q || !setup || !template) return <p>Unknown question.</p>;

  const submit = () => {
    const g = gradeTagging(setup, tags, target);
    setGrade(g);
    recordDetectiveMode("givens", g.allCorrect);
  };
  const ready = tags.every((t) => t !== null) && target !== null;

  return (
    <div>
      <p className="small muted row spread">
        <span>
          <Link to="/detective">Detective</Link> › B · Givens & target{stage === "pick" ? " › then the equations" : ""}
        </span>
        <select value={filter} onChange={(e) => onFilter(e.target.value)}>
          {CHAPTER_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </p>
      {stage === "pick" ? (
        <PickRound templateId={templateId} seed={seed} filter={filter} onNext={onNext} embedded />
      ) : (
        <div className="practice">
          <div className="card">
            <span className="badge">{template.title}</span>
            <div className="prompt" style={{ marginTop: 8 }}>
              <RichText text={q.prompt} />
            </div>
            {q.diagram && (
              <div className="diagram-wrap">
                <Diagram spec={q.diagram} />
              </div>
            )}
            <h3>Tag each number</h3>
            <div className="tag-list">
              {setup.items.map((it, i) => {
                const chosen = tags[i];
                const ok = grade ? chosen === it.correctTag : null;
                return (
                  <div key={i} className={"tag-row" + (ok === true ? " correct" : ok === false ? " wrong" : "")}>
                    <span className="chip">
                      <RichText text={fmtDisplay(it.given.value)} /> {it.given.unit}
                    </span>
                    <select value={chosen ?? ""} onChange={(e) => setTags((prev) => prev.map((t, j) => (j === i ? e.target.value || null : t)))} disabled={!!grade}>
                      <option value="">— pick —</option>
                      {setup.tagOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === NOT_NEEDED ? "not needed" : texPlain(opt)}
                        </option>
                      ))}
                    </select>
                    {grade && !ok && (
                      <span className="small">
                        → {it.correctTag === NOT_NEEDED ? "not needed" : <Tex>{it.correctTag}</Tex>}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <h3 style={{ marginTop: 12 }}>What are you solving for?</h3>
            <div className="choices">
              {setup.targetOptions.map((opt) => {
                let cls = "choice";
                if (grade) {
                  if (opt === setup.correctTarget) cls += " correct";
                  else if (target === opt) cls += " wrong";
                } else if (target === opt) cls += " selected";
                return (
                  <button key={opt} className={cls} onClick={() => !grade && setTarget(opt)} disabled={!!grade}>
                    <Tex>{opt}</Tex>
                  </button>
                );
              })}
            </div>
            <div className="actions">
              {!grade && (
                <button className="primary" onClick={submit} disabled={!ready}>
                  Check
                </button>
              )}
              {grade && (
                <button className="primary" onClick={() => setStage("pick")}>
                  Now pick the equations →
                </button>
              )}
              <button onClick={onNext}>Skip</button>
            </div>
          </div>
          <div className="sticky">
            {grade ? (
              <div className={"card feedback " + (grade.allCorrect ? "good" : "bad")}>
                <div className="label">
                  {grade.correctTags}/{grade.total} tags right · target {grade.targetCorrect ? "✓" : "✗"}
                </div>
                {grade.irrelevantTotal > 0 && (
                  <div className="small">
                    Irrelevant givens spotted: {grade.irrelevantSpotted}/{grade.irrelevantTotal}. {grade.irrelevantSpotted === grade.irrelevantTotal ? "Good — knowing what you don't need is half the battle." : "Some numbers in this problem are decoys."}
                  </div>
                )}
                <div className="small muted" style={{ marginTop: 6 }}>
                  Target: {q.target.label} (<Tex>{q.target.symbol}</Tex>)
                </div>
              </div>
            ) : (
              <div className="card muted small">Match each given number to its symbol. If a number isn't needed for this question, say so. Then choose the unknown.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Crude LaTeX → readable text for <option> elements (no HTML allowed there). */
function texPlain(s: string): string {
  return s
    .replace(/\\(mu|theta|omega|Delta|Sigma|pi)/g, (_m, g: string) => ({ mu: "μ", theta: "θ", omega: "ω", Delta: "Δ", Sigma: "Σ", pi: "π" })[g] ?? g)
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/[{}\\]/g, "");
}
