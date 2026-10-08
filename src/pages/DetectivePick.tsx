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
import { EquationLinks } from "../components/Solution";
import { PageHeader } from "../components/PageHeader";
import { ActionBar } from "../components/ActionBar";

const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

export function FilterSelect({ value, onChange }: { value: string; onChange: (f: string) => void }) {
  return (
    <select className="compact" value={value} onChange={(e) => onChange(e.target.value)} aria-label="chapter filter">
      {CHAPTER_FILTERS.map((f) => (
        <option key={f.id} value={f.id}>
          {f.label}
        </option>
      ))}
    </select>
  );
}

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
  const [hide, setHide] = useState(!embedded);
  const template = templateById(templateId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT") return;
      if (/^[1-8]$/.test(e.key) && setup && !grade) {
        const eq = setup.options[Number(e.key) - 1];
        if (eq) toggle(eq.id);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (grade) onNext();
        else submit();
      } else if ((e.key === "n" || e.key === "N") && grade) onNext();
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
    if (grade || selected.size === 0) return;
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
  const summary = grade && !grade.correct ? [grade.extra.length ? `${grade.extra.length} decoy${grade.extra.length > 1 ? "s" : ""} picked` : "", grade.missing.length ? `${grade.missing.length} missing` : ""].filter(Boolean).join(" · ") : "";

  return (
    <div className="question">
      {!embedded && <PageHeader back={{ to: "/detective", label: "Detective" }} title="Equations" right={onFilter && <FilterSelect value={filter} onChange={onFilter} />} />}
      {embedded && (
        <div className="section-title" style={{ marginTop: 8 }}>
          Now the equations
        </div>
      )}
      <div className="prompt">
        <RichText text={prompt} />
      </div>
      {q.diagram && (
        <div className="diagram-wrap">
          <Diagram spec={q.diagram} hideNumbers={hide} />
        </div>
      )}
      <div className="row spread" style={{ marginBottom: 8 }}>
        <div className="target-line" style={{ margin: 0 }}>
          Find {q.target.label} {q.target.symbol && <Tex>{q.target.symbol}</Tex>}
          {q.parts ? ` (+${q.parts.length - 1} more part${q.parts.length > 2 ? "s" : ""})` : ""}
        </div>
        {!embedded && (
          <label className="toggle-line">
            <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} /> hide numbers
          </label>
        )}
      </div>
      <h3 style={{ marginTop: 8 }}>Which equations would you use?</h3>
      <p className="helper">All you need, none you don't.</p>
      <EquationPicker options={setup.options} selected={selected} onToggle={toggle} grade={grade} correct={setup.correct} />

      {grade && (
        <div className="card solution-card">
          {grade.extra.length > 0 && (
            <>
              <h4 className="section-title">Decoys you picked</h4>
              <ul className="small">
                {grade.extra.map((id) => {
                  const eq = equationById(id)!;
                  return (
                    <li key={id}>
                      <strong>{eq.name}</strong> — not when {lc(eq.dontUseWhen[0] ?? "")}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {grade.missing.length > 0 && (
            <>
              <h4 className="section-title" style={{ marginTop: grade.extra.length ? 14 : 0 }}>
                Needed but not picked
              </h4>
              <ul className="small">
                {grade.missing.map((id) => {
                  const eq = equationById(id)!;
                  return (
                    <li key={id}>
                      <strong>{eq.name}</strong> — use when {lc(eq.useWhen[0] ?? "")}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <h4 className="section-title" style={{ marginTop: grade.correct ? 0 : 14 }}>
            Plan
          </h4>
          <ol className="recipe">
            {q.recipe.map((r, i) => (
              <li key={i}>
                <RichText text={r} />
              </li>
            ))}
          </ol>
          <h4 className="section-title" style={{ marginTop: 14 }}>
            Equations, in order
          </h4>
          <EquationLinks ids={q.equations} />
        </div>
      )}

      <ActionBar tone={grade ? (grade.correct ? "good" : "bad") : undefined} message={grade ? (grade.correct ? "Exactly the right set" : "Not quite") : undefined} detail={summary || undefined}>
        {grade ? (
          <>
            <Link className="btn quiet" to={`/q/${templateId}/${seed}`}>
              Solve with numbers
            </Link>
            <button className="primary" onClick={onNext}>
              Next <kbd>↵</kbd>
            </button>
          </>
        ) : (
          <>
            <button className="quiet" onClick={onNext}>
              Skip
            </button>
            <button className="primary" onClick={submit} disabled={selected.size === 0}>
              Check <kbd>↵</kbd>
            </button>
          </>
        )}
      </ActionBar>
    </div>
  );
}
