import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { buildQuestion, nextForTopic } from "../lib/question";
import { templateById } from "../content/templates";
import { topicById } from "../content/topics";
import { errorById } from "../content/errors";
import { checkNumeric } from "../engine/check";
import { fmtDisplay } from "../engine/params";
import { randomSeed } from "../engine/rng";
import { getSettings, recordAttempt, setLastQuestion, updateSettings } from "../lib/storage";
import { RichText } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { ChoiceList } from "../components/ChoiceList";
import { Solution } from "../components/Solution";
import { Tex } from "../lib/latex";

type Mode = "mcq" | "free";

export function PracticePage() {
  const params = useParams();
  const navigate = useNavigate();

  // /practice/:topicId → pick a template + seed and redirect to the canonical URL
  useEffect(() => {
    if (params.topicId) {
      const pick = nextForTopic(params.topicId);
      if (pick) navigate(`/q/${pick.template.id}/${pick.seed}`, { replace: true });
      else navigate("/", { replace: true });
    } else if (params.templateId && !params.seed) {
      navigate(`/q/${params.templateId}/${randomSeed()}`, { replace: true });
    }
  }, [params.topicId, params.templateId, params.seed, navigate]);

  const templateId = params.templateId ?? "";
  const seed = Number(params.seed ?? 0);
  if (!templateId || !seed) return <p className="muted">Loading…</p>;
  return <Question key={`${templateId}/${seed}`} templateId={templateId} seed={seed} />;
}

function Question({ templateId, seed }: { templateId: string; seed: number }) {
  const navigate = useNavigate();
  const template = templateById(templateId);
  const q = useMemo(() => buildQuestion(templateId, seed), [templateId, seed]);
  const [mode, setMode] = useState<Mode>(() => getSettings().defaultMode);
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [pickedError, setPickedError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (q) setLastQuestion(templateId, seed);
  }, [templateId, seed, q]);

  const isConceptual = template?.kind === "conceptual" || typeof q?.answer === "string";
  const effectiveMode: Mode = isConceptual ? "mcq" : mode;

  const submit = useCallback(() => {
    if (!q || submitted) return;
    let ok = false;
    let errorId: string | undefined;
    if (effectiveMode === "mcq") {
      if (selected === null) return;
      const c = q.choices[selected];
      if (!c) return;
      ok = c.correct;
      errorId = c.errorId;
    } else {
      if (typeof q.answer !== "number") return;
      const res = checkNumeric(typed, q.answer);
      if (res.parsed === null) return;
      ok = res.correct;
      // if the typed value matches a distractor, attribute the named error
      if (!ok) {
        const hit = q.choices.find((c) => !c.correct && typeof c.value === "number" && checkNumeric(res.parsed as number, c.value).correct);
        errorId = hit?.errorId;
      }
    }
    setSubmitted(true);
    setCorrect(ok);
    setPickedError(errorId ?? null);
    if (!ok) setShowSolution(true);
    recordAttempt(templateId, ok, errorId);
  }, [q, submitted, effectiveMode, selected, typed, templateId]);

  const next = useCallback(() => {
    if (!template) return;
    const pick = nextForTopic(template.topicId);
    if (pick) navigate(`/q/${pick.template.id}/${pick.seed}`);
  }, [template, navigate]);
  const sameType = useCallback(() => navigate(`/q/${templateId}/${randomSeed()}`), [templateId, navigate]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (typing) return;
      if (/^[1-5]$/.test(e.key) && effectiveMode === "mcq" && !submitted && q) {
        const i = Number(e.key) - 1;
        if (i < q.choices.length) setSelected(i);
      } else if (e.key === "n" || e.key === "N") next();
      else if (e.key === "h" || e.key === "H") setHintsShown((h) => Math.min(h + 1, q?.hints.length ?? 0));
      else if (e.key === "s" || e.key === "S") setShowSolution(true);
      else if (e.key === "r" || e.key === "R") sameType();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, next, sameType, effectiveMode, submitted, q]);

  if (!template || !q) return <p>Unknown question type: {templateId}</p>;
  const topic = topicById(template.topicId);
  const err = pickedError ? errorById(pickedError) : null;

  return (
    <div>
      <p className="small muted row spread">
        <span>
          <Link to="/">Home</Link> › <Link to={`/topic/${template.topicId}`}>{topic?.title ?? template.topicId}</Link> › {template.title}
        </span>
        <span className="stat">#{seed}</span>
      </p>
      <div className="practice">
        <div className="card">
          <div className="row spread" style={{ marginBottom: 10 }}>
            <span className="badge">{template.kind}</span>
            {!isConceptual && (
              <div className="toggle" role="group" aria-label="answer mode">
                <button className={effectiveMode === "mcq" ? "on" : ""} onClick={() => { setMode("mcq"); updateSettings({ defaultMode: "mcq" }); }} disabled={submitted}>
                  Multiple choice
                </button>
                <button className={effectiveMode === "free" ? "on" : ""} onClick={() => { setMode("free"); updateSettings({ defaultMode: "free" }); setTimeout(() => inputRef.current?.focus(), 0); }} disabled={submitted}>
                  Type answer
                </button>
              </div>
            )}
          </div>
          <div className="prompt">
            <RichText text={q.prompt} />
          </div>
          {q.diagram && (
            <div className="diagram-wrap">
              <Diagram spec={q.diagram} />
            </div>
          )}
          {q.givens.length > 0 && (
            <div className="givens">
              {q.givens.map((g, i) => (
                <span className="chip" key={i}>
                  <Tex>{g.symbol}</Tex> = <RichText text={fmtDisplay(g.value)} /> {g.unit}
                  {g.note ? ` (${g.note})` : ""}
                </span>
              ))}
            </div>
          )}
          <div className="small muted" style={{ marginBottom: 6 }}>
            Find: {q.target.label} {q.target.symbol && <Tex>{q.target.symbol}</Tex>}
            {q.target.unit ? ` (${q.target.unit})` : ""}
          </div>

          {effectiveMode === "mcq" ? (
            <ChoiceList choices={q.choices} unit={q.target.unit} selected={selected} submitted={submitted} onSelect={setSelected} />
          ) : (
            <div className="free-input">
              <input ref={inputRef} type="text" inputMode="decimal" placeholder="your answer" value={typed} onChange={(e) => setTyped(e.target.value)} disabled={submitted} autoFocus />
              <span className="muted">{q.target.unit}</span>
              <span className="small muted">(±2%)</span>
            </div>
          )}

          {submitted && (
            <div className={"feedback " + (correct ? "good" : "bad")}>
              <div className="label">{correct ? "Correct!" : "Not quite."}</div>
              {!correct && err && (
                <div>
                  <strong>{err.label}.</strong> {err.explanation}
                </div>
              )}
              {!correct && !err && effectiveMode === "free" && typeof q.answer === "number" && (
                <div>
                  Expected <RichText text={fmtDisplay(q.answer)} /> {q.target.unit}.
                </div>
              )}
              {!correct && !err && effectiveMode === "mcq" && <div>See the worked solution below.</div>}
            </div>
          )}

          {hintsShown > 0 && (
            <div>
              {q.hints.slice(0, hintsShown).map((h, i) => (
                <div className="hint" key={i}>
                  <span className="small muted">Hint {i + 1}: </span>
                  <RichText text={h} />
                </div>
              ))}
            </div>
          )}

          <div className="actions">
            {!submitted && (
              <button className="primary" onClick={submit} disabled={effectiveMode === "mcq" ? selected === null : !typed.trim()}>
                Submit <kbd>↵</kbd>
              </button>
            )}
            <button onClick={() => setHintsShown((h) => Math.min(h + 1, q.hints.length))} disabled={hintsShown >= q.hints.length}>
              Hint <kbd>H</kbd>
            </button>
            <button onClick={() => setShowSolution(true)} disabled={showSolution}>
              Show solution <kbd>S</kbd>
            </button>
            <button className={submitted ? "primary" : ""} onClick={next}>
              Next <kbd>N</kbd>
            </button>
            <button onClick={sameType}>
              Same type again <kbd>R</kbd>
            </button>
          </div>
          <div className="small muted shortcuts">
            Keys: <kbd>1</kbd>–<kbd>5</kbd> pick · <kbd>↵</kbd> submit · <kbd>H</kbd> hint · <kbd>S</kbd> solution · <kbd>N</kbd> next
          </div>
        </div>

        <div className="sticky">
          {showSolution ? (
            <div className="card">
              <h2>Solution</h2>
              <Solution q={q} />
            </div>
          ) : (
            <div className="card muted small">
              Work it out, then submit. The solution, the plan, and the equations used appear here afterward.
              {template.source && (
                <div style={{ marginTop: 8 }}>
                  Based on: <em>{template.source}</em>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
