import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildQuestion, nextForTopic, nextWeakSpot, nextForError } from "../lib/question";
import { templateById } from "../content/templates";
import { topicById } from "../content/topics";
import { errorById } from "../content/errors";
import { checkNumeric } from "../engine/check";
import { fmtDisplay } from "../engine/params";
import { randomSeed } from "../engine/rng";
import type { GeneratedQuestion, QuestionPart } from "../engine/types";
import { getSettings, recordAttempt, setLastQuestion, updateSettings } from "../lib/storage";
import { RichText, Tex } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { ChoiceList } from "../components/ChoiceList";
import { Solution, PartSolution } from "../components/Solution";

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

interface PartState {
  selected: number | null;
  typed: string;
  submitted: boolean;
  correct: boolean | null;
  errorId: string | null;
}
const freshPart = (): PartState => ({ selected: null, typed: "", submitted: false, correct: null, errorId: null });

/** Normalise a question into a list of parts (single-answer questions become one unlabeled part). */
function partsOf(q: GeneratedQuestion): QuestionPart[] {
  if (q.parts && q.parts.length > 0) return q.parts;
  return [{ label: "", prompt: "", target: q.target, answer: q.answer, choices: q.choices, solution: q.solution }];
}

function Question({ templateId, seed }: { templateId: string; seed: number }) {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const drill = search.get("drill"); // "weak" | "error:<id>" | null
  const template = templateById(templateId);
  const q = useMemo(() => buildQuestion(templateId, seed), [templateId, seed]);
  const parts = useMemo(() => (q ? partsOf(q) : []), [q]);
  const multi = !!q?.parts;
  const [mode, setMode] = useState<Mode>(() => getSettings().defaultMode);
  const [states, setStates] = useState<PartState[]>(() => parts.map(freshPart));
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (q) setLastQuestion(templateId, seed);
  }, [templateId, seed, q]);

  const isConceptual = template?.kind === "conceptual" || typeof q?.answer === "string";
  const effectiveMode: Mode = isConceptual ? "mcq" : mode;
  const activeIndex = states.findIndex((s) => !s.submitted); // first unsubmitted part, -1 when done
  const allDone = activeIndex === -1;

  const updatePart = (i: number, patch: Partial<PartState>) => setStates((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const submit = useCallback(() => {
    if (!q || activeIndex === -1) return;
    const part = parts[activeIndex]!;
    const st = states[activeIndex]!;
    let ok = false;
    let errorId: string | undefined;
    if (effectiveMode === "mcq" || typeof part.answer === "string") {
      if (st.selected === null) return;
      const c = part.choices[st.selected];
      if (!c) return;
      ok = c.correct;
      errorId = c.errorId;
    } else {
      const res = checkNumeric(st.typed, part.answer);
      if (res.parsed === null) return;
      ok = res.correct;
      if (!ok) {
        const hit = part.choices.find((c) => !c.correct && typeof c.value === "number" && checkNumeric(res.parsed as number, c.value).correct);
        errorId = hit?.errorId;
      }
    }
    const next = states.map((s, j) => (j === activeIndex ? { ...s, submitted: true, correct: ok, errorId: errorId ?? null } : s));
    setStates(next);
    if (!ok) setShowSolution(true);
    // record once, when the last part is submitted
    if (next.every((s) => s.submitted)) {
      const allCorrect = next.every((s) => s.correct);
      const firstErr = next.find((s) => s.errorId)?.errorId ?? undefined;
      recordAttempt(templateId, allCorrect, firstErr);
    }
  }, [q, parts, states, activeIndex, effectiveMode, templateId]);

  const next = useCallback(() => {
    if (!template) return;
    if (drill) {
      const pick = drill.startsWith("error:") ? nextForError(drill.slice(6)) : nextWeakSpot();
      if (pick) {
        navigate(`/q/${pick.template.id}/${pick.seed}?drill=${drill}`);
        return;
      }
    }
    const pick = nextForTopic(template.topicId);
    if (pick) navigate(`/q/${pick.template.id}/${pick.seed}`);
  }, [template, navigate, drill]);
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
      if (/^[1-5]$/.test(e.key) && activeIndex !== -1) {
        const part = parts[activeIndex]!;
        if (effectiveMode === "mcq" || typeof part.answer === "string") {
          const i = Number(e.key) - 1;
          if (i < part.choices.length) updatePart(activeIndex, { selected: i });
        }
      } else if (e.key === "n" || e.key === "N") next();
      else if (e.key === "h" || e.key === "H") setHintsShown((h) => Math.min(h + 1, q?.hints.length ?? 0));
      else if (e.key === "s" || e.key === "S") setShowSolution(true);
      else if (e.key === "r" || e.key === "R") sameType();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, next, sameType, effectiveMode, activeIndex, parts, q]);

  if (!template || !q) return <p>Unknown question type: {templateId}</p>;
  const topic = topicById(template.topicId);
  const activeState = activeIndex === -1 ? null : states[activeIndex]!;
  const activePart = activeIndex === -1 ? null : parts[activeIndex]!;
  const canSubmit = activePart && activeState ? (effectiveMode === "mcq" || typeof activePart.answer === "string" ? activeState.selected !== null : activeState.typed.trim() !== "") : false;

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
            <span className="badge">{template.kind}{multi ? ` · ${parts.length} parts` : ""}</span>
            {!isConceptual && (
              <div className="toggle" role="group" aria-label="answer mode">
                <button className={effectiveMode === "mcq" ? "on" : ""} onClick={() => { setMode("mcq"); updateSettings({ defaultMode: "mcq" }); }} disabled={states.some((s) => s.submitted)}>
                  Multiple choice
                </button>
                <button className={effectiveMode === "free" ? "on" : ""} onClick={() => { setMode("free"); updateSettings({ defaultMode: "free" }); setTimeout(() => inputRef.current?.focus(), 0); }} disabled={states.some((s) => s.submitted)}>
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

          {parts.map((part, i) => {
            const st = states[i]!;
            const isActive = i === activeIndex;
            const visible = i <= Math.max(activeIndex === -1 ? parts.length - 1 : activeIndex, 0);
            if (!visible) return null;
            const stringAnswer = typeof part.answer === "string";
            const useMcq = effectiveMode === "mcq" || stringAnswer;
            const err = st.errorId ? errorById(st.errorId) : null;
            return (
              <div key={i} className={multi ? "part" + (isActive ? " active" : "") : ""}>
                {multi && (
                  <div className="part-prompt">
                    <strong>{part.label}</strong> <RichText text={part.prompt} />
                  </div>
                )}
                <div className="small muted" style={{ marginBottom: 6 }}>
                  Find: {part.target.label} {part.target.symbol && <Tex>{part.target.symbol}</Tex>}
                  {part.target.unit ? ` (${part.target.unit})` : ""}
                </div>
                {useMcq ? (
                  <ChoiceList choices={part.choices} unit={part.target.unit} selected={st.selected} submitted={st.submitted} onSelect={(sel) => updatePart(i, { selected: sel })} />
                ) : (
                  <div className="free-input">
                    <input
                      ref={isActive ? inputRef : undefined}
                      type="text"
                      inputMode="decimal"
                      placeholder="your answer"
                      value={st.typed}
                      onChange={(e) => updatePart(i, { typed: e.target.value })}
                      disabled={st.submitted}
                      autoFocus={isActive}
                    />
                    <span className="muted">{part.target.unit}</span>
                    <span className="small muted">(±2%)</span>
                  </div>
                )}
                {st.submitted && (
                  <div className={"feedback " + (st.correct ? "good" : "bad")}>
                    <div className="label">{st.correct ? "Correct!" : "Not quite."}</div>
                    {!st.correct && err && (
                      <div>
                        <strong>{err.label}.</strong> {err.explanation}
                      </div>
                    )}
                    {!st.correct && !err && !useMcq && typeof part.answer === "number" && (
                      <div>
                        Expected <RichText text={fmtDisplay(part.answer)} /> {part.target.unit}.
                      </div>
                    )}
                    {!st.correct && !err && useMcq && <div>See the worked solution.</div>}
                  </div>
                )}
                {multi && st.submitted && showSolution && (
                  <details className="part-solution" open={!st.correct}>
                    <summary className="small muted">Solution for {part.label}</summary>
                    <PartSolution part={part} />
                  </details>
                )}
              </div>
            );
          })}

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
            {!allDone && (
              <button className="primary" onClick={submit} disabled={!canSubmit}>
                Submit{multi && activePart ? ` ${activePart.label}` : ""} <kbd>↵</kbd>
              </button>
            )}
            <button onClick={() => setHintsShown((h) => Math.min(h + 1, q.hints.length))} disabled={hintsShown >= q.hints.length}>
              Hint <kbd>H</kbd>
            </button>
            <button onClick={() => setShowSolution(true)} disabled={showSolution}>
              Show solution <kbd>S</kbd>
            </button>
            <button className={allDone ? "primary" : ""} onClick={next}>
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
