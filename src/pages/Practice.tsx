import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildQuestion, nextForTopic, nextWeakSpot, nextForError } from "../lib/question";
import { templateById } from "../content/templates";
import { topicById } from "../content/topics";
import { errorById } from "../content/errors";
import { checkNumeric } from "../engine/check";
import { fmtDisplay } from "../engine/params";
import { randomSeed } from "../engine/rng";
import type { GeneratedQuestion, QuestionPart } from "../engine/types";
import { getSettings, recordAttempt, setLastQuestion, updateSettings } from "../lib/storage";
import { RichText } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { ChoiceList } from "../components/ChoiceList";
import { Solution, PartSolution } from "../components/Solution";
import { PageHeader } from "../components/PageHeader";
import { ActionBar } from "../components/ActionBar";

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
  revealed: boolean;
}
const freshPart = (): PartState => ({ selected: null, typed: "", submitted: false, correct: null, errorId: null, revealed: false });

/** Normalise a question into a list of parts (single-answer questions become one unlabeled part). */
function partsOf(q: GeneratedQuestion): QuestionPart[] {
  if (q.parts && q.parts.length > 0) return q.parts;
  return [{ label: "", prompt: "", target: q.target, answer: q.answer, choices: q.choices, solution: q.solution }];
}

function answerText(part: QuestionPart): string {
  return typeof part.answer === "number" ? `${fmtDisplay(part.answer)}${part.target.unit ? " " + part.target.unit : ""}` : String(part.answer);
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
  /** Index of the part whose feedback is showing in the action bar, waiting for "Continue". */
  const [pending, setPending] = useState<number | null>(null);
  const [parseError, setParseError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const solutionRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (q) setLastQuestion(templateId, seed);
  }, [templateId, seed, q]);

  // After a miss, bring the worked solution up above the feedback bar so it's obvious where to look.
  useEffect(() => {
    if (pending === null) return;
    const st = states[pending];
    if (!st || st.correct) return;
    const el = solutionRef.current ?? document.querySelector<HTMLElement>(".part .solution-card[open]");
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const isConceptual = template?.kind === "conceptual" || typeof q?.answer === "string";
  const effectiveMode: Mode = isConceptual ? "mcq" : mode;
  const activeIndex = states.findIndex((s) => !s.submitted); // first unsubmitted part, -1 when done
  const allDone = activeIndex === -1;
  const anySubmitted = states.some((s) => s.submitted);

  const updatePart = (i: number, patch: Partial<PartState>) => setStates((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const finish = useCallback(
    (next: PartState[]) => {
      setStates(next);
      if (next.every((s) => s.submitted)) {
        const allCorrect = next.every((s) => s.correct);
        const firstErr = next.find((s) => s.errorId)?.errorId ?? undefined;
        recordAttempt(templateId, allCorrect, firstErr);
      }
    },
    [templateId],
  );

  const submit = useCallback(() => {
    if (!q || activeIndex === -1 || pending !== null) return;
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
      if (res.parsed === null) {
        setParseError(true);
        return;
      }
      ok = res.correct;
      if (!ok) {
        const hit = part.choices.find((c) => !c.correct && typeof c.value === "number" && checkNumeric(res.parsed as number, c.value).correct);
        errorId = hit?.errorId;
      }
    }
    setParseError(false);
    finish(states.map((s, j) => (j === activeIndex ? { ...s, submitted: true, correct: ok, errorId: errorId ?? null } : s)));
    setPending(activeIndex);
  }, [q, parts, states, activeIndex, pending, effectiveMode, finish]);

  /** "I don't know": counts as a miss, shows the answer and the solution. */
  const reveal = useCallback(() => {
    if (activeIndex === -1 || pending !== null) return;
    finish(states.map((s, j) => (j === activeIndex ? { ...s, submitted: true, correct: false, revealed: true } : s)));
    setPending(activeIndex);
  }, [states, activeIndex, pending, finish]);

  const next = useCallback(() => {
    if (!template || !allDone) return;
    if (drill) {
      const pick = drill.startsWith("error:") ? nextForError(drill.slice(6)) : nextWeakSpot();
      if (pick) {
        navigate(`/q/${pick.template.id}/${pick.seed}?drill=${drill}`);
        return;
      }
    }
    const pick = nextForTopic(template.topicId);
    if (pick) navigate(`/q/${pick.template.id}/${pick.seed}`);
  }, [template, navigate, drill, allDone]);

  const continueNext = useCallback(() => {
    setPending(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, []);

  // keyboard shortcuts (desktop): 1–5 pick, Enter = the primary action, N = next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if (e.key === "Enter") {
        e.preventDefault();
        if (allDone) next();
        else if (pending !== null) continueNext();
        else submit();
        return;
      }
      if (typing) return;
      if (/^[1-5]$/.test(e.key) && activeIndex !== -1 && pending === null) {
        const part = parts[activeIndex]!;
        if (effectiveMode === "mcq" || typeof part.answer === "string") {
          const i = Number(e.key) - 1;
          if (i < part.choices.length) updatePart(activeIndex, { selected: i });
        }
      } else if ((e.key === "n" || e.key === "N") && allDone) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, next, continueNext, effectiveMode, activeIndex, parts, allDone, pending]);

  if (!template || !q) return <p>Unknown question type: {templateId}</p>;
  const topic = topicById(template.topicId);
  const activeState = activeIndex === -1 ? null : states[activeIndex]!;
  const activePart = activeIndex === -1 ? null : parts[activeIndex]!;
  const canSubmit = activePart && activeState ? (effectiveMode === "mcq" || typeof activePart.answer === "string" ? activeState.selected !== null : activeState.typed.trim() !== "") : false;
  const allCorrect = allDone && states.every((s) => s.correct);
  const anyMiss = states.some((s) => s.submitted && !s.correct);
  // parts shown: everything up to the one being answered (the next part waits until "Continue")
  const lastVisible = pending !== null ? pending : allDone ? parts.length - 1 : activeIndex;

  // ----- action bar content -----
  let bar: { tone?: "good" | "bad" | "neutral"; message?: ReactNode; detail?: ReactNode; buttons: ReactNode };
  const fbIndex = pending !== null ? pending : allDone ? parts.length - 1 : null;
  if (fbIndex !== null) {
    const st = states[fbIndex]!;
    const part = parts[fbIndex]!;
    const err = st.errorId ? errorById(st.errorId) : null;
    const useMcq = effectiveMode === "mcq" || typeof part.answer === "string";
    let tone: "good" | "bad" | "neutral";
    let message: ReactNode;
    let detail: ReactNode = null;
    if (st.revealed) {
      tone = "neutral";
      message = (
        <>
          Answer: <RichText text={answerText(part)} />
        </>
      );
      detail = "Counted as a miss, so this type comes back sooner.";
    } else if (st.correct) {
      tone = "good";
      message = multi ? `Part ${part.label} correct` : "Correct";
    } else {
      tone = "bad";
      message = "Not quite";
      if (err) {
        detail = (
          <>
            <strong>{err.label}.</strong> {err.explanation}
          </>
        );
      } else if (!useMcq) {
        detail = (
          <>
            The answer is <RichText text={answerText(part)} />.
          </>
        );
      } else {
        detail = "The correct choice is highlighted. The solution is below.";
      }
    }
    const more = pending !== null && !allDone;
    bar = {
      tone,
      message,
      detail,
      buttons: more ? (
        <button className="primary" onClick={continueNext}>
          Continue <kbd>↵</kbd>
        </button>
      ) : (
        <button className="primary" onClick={next}>
          Next question <kbd>↵</kbd>
        </button>
      ),
    };
  } else {
    bar = {
      buttons: (
        <>
          <button className="quiet" onClick={reveal}>
            Not sure? Reveal
          </button>
          <button className="primary" onClick={submit} disabled={!canSubmit}>
            Check{multi && activePart ? ` ${activePart.label}` : ""} <kbd>↵</kbd>
          </button>
        </>
      ),
    };
  }

  const modeToggle = !isConceptual && (
    <div className="seg mini" role="group" aria-label="answer mode">
      <button className={effectiveMode === "mcq" ? "on" : ""} disabled={anySubmitted} onClick={() => { setMode("mcq"); updateSettings({ defaultMode: "mcq" }); }}>
        Choices
      </button>
      <button className={effectiveMode === "free" ? "on" : ""} disabled={anySubmitted} onClick={() => { setMode("free"); updateSettings({ defaultMode: "free" }); setTimeout(() => inputRef.current?.focus(), 0); }}>
        Type
      </button>
    </div>
  );

  return (
    <div className="question">
      <PageHeader back={drill ? { to: "/", label: "Home" } : { to: `/topic/${template.topicId}`, label: topic?.title ?? "Topic" }} right={modeToggle} />
      <div className="prompt">
        <RichText text={q.prompt} />
      </div>
      {q.diagram && (
        <div className="diagram-wrap">
          <Diagram spec={q.diagram} />
        </div>
      )}

      {parts.map((part, i) => {
        if (i > lastVisible) return null;
        const st = states[i]!;
        const isActive = i === activeIndex && pending === null;
        const stringAnswer = typeof part.answer === "string";
        const useMcq = effectiveMode === "mcq" || stringAnswer;
        return (
          <div key={i} className={multi ? "part" : ""}>
            {multi && (
              <>
                <div className="part-label">
                  <span>Part {part.label}</span>
                  {st.submitted && <span className={"part-status " + (st.correct ? "good" : "bad")}>{st.correct ? "✓" : st.revealed ? "revealed" : "✗"}</span>}
                </div>
                <div className="prompt" style={{ fontSize: "1.02rem", marginBottom: 8 }}>
                  <RichText text={part.prompt} />
                </div>
              </>
            )}
            {useMcq ? (
              <ChoiceList choices={part.choices} unit={part.target.unit} selected={st.selected} submitted={st.submitted} onSelect={(sel) => updatePart(i, { selected: sel })} showTag={false} />
            ) : (
              <div className="free-input">
                <input
                  ref={isActive ? inputRef : undefined}
                  type="text"
                  inputMode="decimal"
                  placeholder={part.target.label}
                  aria-label={part.target.label}
                  value={st.typed}
                  onChange={(e) => {
                    setParseError(false);
                    updatePart(i, { typed: e.target.value });
                  }}
                  disabled={st.submitted}
                  autoFocus={isActive}
                />
                {part.target.unit && <span className="unit">{part.target.unit}</span>}
              </div>
            )}
            {isActive && parseError && !useMcq && <div className="small" style={{ color: "var(--bad)" }}>Enter a number, e.g. 13.4 or 2.5e3.</div>}
            {multi && st.submitted && (
              <details className="solution-card card" open={!st.correct}>
                <summary>Solution for part {part.label}</summary>
                <PartSolution part={part} />
              </details>
            )}
          </div>
        );
      })}

      {allDone && (
        <details className="solution-card card" open={anyMiss || !allCorrect} ref={solutionRef}>
          <summary>{multi ? "Plan and equations" : "Solution"}</summary>
          {multi ? <Solution q={q} omitSteps /> : <Solution q={q} />}
        </details>
      )}

      <p className="source-line">
        {template.title} · #{seed}
        {allDone && template.source ? ` · from ${template.source}` : ""}
      </p>

      <ActionBar tone={bar.tone} message={bar.message} detail={bar.detail}>
        {bar.buttons}
      </ActionBar>
    </div>
  );
}
