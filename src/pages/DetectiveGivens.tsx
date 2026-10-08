import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildFor, randomQuestionFor } from "../lib/detective";
import { buildTagging, gradeTagging, NOT_NEEDED } from "../engine/detective";
import { createRng } from "../engine/rng";
import { fmtDisplay } from "../engine/params";
import { templateById } from "../content/templates";
import { recordDetectiveMode } from "../lib/storage";
import { RichText, Tex } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { PickRound, FilterSelect } from "./DetectivePick";
import { PageHeader } from "../components/PageHeader";
import { ActionBar } from "../components/ActionBar";

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
    if (grade || !ready) return;
    const g = gradeTagging(setup, tags, target);
    setGrade(g);
    recordDetectiveMode("givens", g.allCorrect);
  };
  const ready = tags.every((t) => t !== null) && target !== null;

  return (
    <div className="question">
      <PageHeader back={{ to: "/detective", label: "Detective" }} title="Givens" right={<FilterSelect value={filter} onChange={onFilter} />} />
      {stage === "pick" ? (
        <PickRound templateId={templateId} seed={seed} filter={filter} onNext={onNext} embedded />
      ) : (
        <>
          <div className="prompt">
            <RichText text={q.prompt} />
          </div>
          {q.diagram && (
            <div className="diagram-wrap">
              <Diagram spec={q.diagram} />
            </div>
          )}
          <h3>Label each number</h3>
          <p className="helper">Pick its symbol, or "not needed".</p>
          <div className="tag-list">
            {setup.items.map((it, i) => {
              const chosen = tags[i];
              const ok = grade ? chosen === it.correctTag : null;
              return (
                <div key={i} className={"tag-row" + (ok === true ? " correct" : ok === false ? " wrong" : "")}>
                  <span className="chip">
                    <RichText text={fmtDisplay(it.given.value)} /> {it.given.unit}
                  </span>
                  {grade && !ok ? (
                    <span className="small">
                      → {it.correctTag === NOT_NEEDED ? "not needed" : <Tex>{it.correctTag}</Tex>}
                    </span>
                  ) : null}
                  <select className="compact" value={chosen ?? ""} onChange={(e) => setTags((prev) => prev.map((t, j) => (j === i ? e.target.value || null : t)))} disabled={!!grade} aria-label={`symbol for ${fmtDisplay(it.given.value)} ${it.given.unit}`}>
                    <option value="">—</option>
                    {setup.tagOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === NOT_NEEDED ? "not needed" : texPlain(opt)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          <h3 style={{ marginTop: 20 }}>What are you solving for?</h3>
          <div className="choices">
            {setup.targetOptions.map((opt) => {
              let cls = "choice";
              if (grade) {
                if (opt === setup.correctTarget) cls += " correct";
                else if (target === opt) cls += " wrong";
                else cls += " dim";
              } else if (target === opt) cls += " selected";
              return (
                <button key={opt} className={cls} onClick={() => !grade && setTarget(opt)} disabled={!!grade}>
                  <span className="label">
                    <Tex>{opt}</Tex>
                  </span>
                </button>
              );
            })}
          </div>
          <ActionBar
            tone={grade ? (grade.allCorrect ? "good" : "bad") : undefined}
            message={grade ? `${grade.correctTags}/${grade.total} labels · target ${grade.targetCorrect ? "✓" : "✗"}` : undefined}
            detail={grade && grade.irrelevantTotal > 0 ? (grade.irrelevantSpotted === grade.irrelevantTotal ? "You spotted every decoy number." : `${grade.irrelevantTotal - grade.irrelevantSpotted} decoy number${grade.irrelevantTotal - grade.irrelevantSpotted > 1 ? "s" : ""} slipped past you.`) : undefined}
          >
            {grade ? (
              <button className="primary" onClick={() => { setStage("pick"); window.scrollTo({ top: 0 }); }}>
                Now pick the equations
              </button>
            ) : (
              <>
                <button className="quiet" onClick={onNext}>
                  Skip
                </button>
                <button className="primary" onClick={submit} disabled={!ready}>
                  Check
                </button>
              </>
            )}
          </ActionBar>
        </>
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
