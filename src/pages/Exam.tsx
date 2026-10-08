import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buildExam, type ExamChoice, type ExamItem } from "../engine/exam";
import { buildQuestion } from "../lib/question";
import { randomSeed } from "../engine/rng";
import type { GeneratedQuestion } from "../engine/types";
import { templateById } from "../content/templates";
import { topicById, CHAPTERS } from "../content/topics";
import { errorById } from "../content/errors";
import { getExams, recordExam, type ExamRecord } from "../lib/storage";
import { RichText, Tex } from "../lib/latex";
import { Diagram } from "../diagrams/Diagram";
import { ChoiceList } from "../components/ChoiceList";
import { Solution } from "../components/Solution";

// ---------------- setup ----------------
export function ExamSetupPage() {
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamChoice>("exam2");
  const [count, setCount] = useState(20);
  const [timed, setTimed] = useState(true);
  const [minutes, setMinutes] = useState(75);
  const exams = getExams();
  return (
    <div className="stack">
      <h1>Exam simulation</h1>
      <p className="muted">Multiple choice only, no hints, no feedback until you submit — like the real thing. About a quarter of the questions are conceptual.</p>
      <div className="card stack" style={{ maxWidth: 520 }}>
        <label className="row">
          <span style={{ minWidth: 150 }}>Exam</span>
          <select value={exam} onChange={(e) => setExam(e.target.value as ExamChoice)}>
            <option value="exam2">Exam 2</option>
            <option value="exam1">Exam 1</option>
            <option value="mixed">Mixed (weighted to Exam 2)</option>
          </select>
        </label>
        <label className="row">
          <span style={{ minWidth: 150 }}>Questions</span>
          <input type="number" min={5} max={60} value={count} onChange={(e) => setCount(Math.max(5, Math.min(60, Number(e.target.value) || 20)))} style={{ width: 90 }} />
        </label>
        <label className="row">
          <span style={{ minWidth: 150 }}>Timer</span>
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
          <input type="number" min={5} max={240} value={minutes} disabled={!timed} onChange={(e) => setMinutes(Math.max(5, Number(e.target.value) || 75))} style={{ width: 90 }} /> min
        </label>
        <div className="actions">
          <button className="primary" onClick={() => navigate(`/exam/run/${randomSeed()}?exam=${exam}&n=${count}&t=${timed ? minutes * 60 : 0}`)}>
            Start exam
          </button>
        </div>
      </div>
      {exams.length > 0 && (
        <div className="card">
          <h2>History</h2>
          <ul className="template-list">
            {[...exams].reverse().map((r) => (
              <li key={r.id}>
                <div className="grow">
                  <strong>{Math.round((100 * r.score) / r.count)}%</strong> · {r.score}/{r.count} · {r.exam === "exam2" ? "Exam 2" : r.exam === "exam1" ? "Exam 1" : "Mixed"}
                  <div className="small muted">
                    {new Date(r.finishedAt).toLocaleString()} · {r.timerSec ? `${Math.round(r.timerSec / 60)} min timer` : "untimed"} · took {Math.round((r.finishedAt - r.startedAt) / 60000)} min
                  </div>
                </div>
                <Link className="btn" to={`/exam/results/${r.id}`}>
                  Review
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------- run ----------------
interface Answer {
  picked: number; // -1 = blank
}

export function ExamRunPage() {
  const { examSeed = "0" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const exam = (params.get("exam") ?? "exam2") as ExamChoice;
  const count = Number(params.get("n") ?? 20);
  const timerSec = Number(params.get("t") ?? 0);
  const seed = Number(examSeed);
  const items = useMemo(() => buildExam(seed, { exam, count }), [seed, exam, count]);
  const questions = useMemo(() => items.map((it) => buildQuestion(it.templateId, it.seed)!), [items]);
  const [answers, setAnswers] = useState<Answer[]>(() => items.map(() => ({ picked: -1 })));
  const [idx, setIdx] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [remaining, setRemaining] = useState(timerSec);
  const submittedRef = useRef(false);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finishedAt = Date.now();
    const recItems = items.map((it, i) => {
      const q = questions[i]!;
      const picked = answers[i]!.picked;
      const choice = picked >= 0 ? q.choices[picked] : undefined;
      const correct = !!choice?.correct;
      const rec: ExamRecord["items"][number] = { templateId: it.templateId, seed: it.seed, picked, correct };
      if (choice && !choice.correct && choice.errorId) rec.errorId = choice.errorId;
      return rec;
    });
    const rec: ExamRecord = {
      id: `${seed}-${finishedAt}`,
      examSeed: seed,
      exam,
      count: items.length,
      timerSec,
      startedAt,
      finishedAt,
      score: recItems.filter((r) => r.correct).length,
      items: recItems,
    };
    recordExam(rec);
    navigate(`/exam/results/${rec.id}`, { replace: true });
  }, [items, questions, answers, seed, exam, timerSec, startedAt, navigate]);

  // timer
  useEffect(() => {
    if (!timerSec) return;
    const t = setInterval(() => {
      const left = timerSec - Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) submit();
    }, 500);
    return () => clearInterval(t);
  }, [timerSec, startedAt, submit]);

  // keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const q = questions[idx];
      if (!q) return;
      if (/^[1-5]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < q.choices.length) setAnswers((prev) => prev.map((a, j) => (j === idx ? { picked: i } : a)));
      } else if (e.key === "n" || e.key === "N" || e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, items.length - 1));
      else if (e.key === "p" || e.key === "P" || e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, questions, items.length]);

  const q = questions[idx];
  if (!q) return <p>Could not build the exam.</p>;
  const answered = answers.filter((a) => a.picked >= 0).length;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div>
      <div className="row spread exam-bar">
        <span>
          Question <strong>{idx + 1}</strong> / {items.length} · {answered} answered
        </span>
        {timerSec > 0 && (
          <span className={"stat timer" + (remaining < 300 ? " low" : "")}>
            {mm}:{ss}
          </span>
        )}
        <button className="primary" onClick={() => { if (answered === items.length || confirm(`${items.length - answered} unanswered. Submit anyway?`)) submit(); }}>
          Submit exam
        </button>
      </div>
      <div className="exam-nav">
        {items.map((_, i) => (
          <button key={i} className={"exam-dot" + (i === idx ? " current" : "") + (answers[i]!.picked >= 0 ? " done" : "")} onClick={() => setIdx(i)}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="card">
        <ExamQuestion q={q} />
        <ChoiceList choices={q.choices} unit={q.target.unit} selected={answers[idx]!.picked >= 0 ? answers[idx]!.picked : null} submitted={false} onSelect={(i) => setAnswers((prev) => prev.map((a, j) => (j === idx ? { picked: i } : a)))} />
        <div className="actions">
          <button onClick={() => setIdx((i) => Math.max(i - 1, 0))} disabled={idx === 0}>
            ← Previous <kbd>P</kbd>
          </button>
          <button className="primary" onClick={() => setIdx((i) => Math.min(i + 1, items.length - 1))} disabled={idx === items.length - 1}>
            Next <kbd>N</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Prompt + diagram + givens (+ first part's sub-prompt for multi-part templates). */
function ExamQuestion({ q }: { q: GeneratedQuestion }) {
  return (
    <>
      <div className="prompt">
        <RichText text={q.prompt} />
        {q.parts && (
          <>
            {" "}
            <RichText text={q.parts[0]!.prompt} />
          </>
        )}
      </div>
      {q.diagram && (
        <div className="diagram-wrap">
          <Diagram spec={q.diagram} />
        </div>
      )}
      <div className="small muted" style={{ marginBottom: 6 }}>
        Find: {q.target.label} {q.target.symbol && <Tex>{q.target.symbol}</Tex>}
        {q.target.unit ? ` (${q.target.unit})` : ""}
      </div>
    </>
  );
}

// ---------------- results ----------------
export function ExamResultsPage() {
  const { recordId = "" } = useParams();
  const rec = getExams().find((r) => r.id === recordId);
  const [open, setOpen] = useState<number | null>(null);
  if (!rec) return <p>Unknown exam record.</p>;
  const questions = rec.items.map((it) => buildQuestion(it.templateId, it.seed));
  // per topic
  const byTopic = new Map<string, { n: number; c: number }>();
  rec.items.forEach((it) => {
    const topicId = templateById(it.templateId)?.topicId ?? "?";
    const e = byTopic.get(topicId) ?? { n: 0, c: 0 };
    e.n++;
    if (it.correct) e.c++;
    byTopic.set(topicId, e);
  });
  const topicRows = CHAPTERS.flatMap((c) => c.topics)
    .filter((t) => byTopic.has(t.id))
    .map((t) => ({ topic: t, ...byTopic.get(t.id)! }));
  // per error
  const errCounts = new Map<string, number>();
  for (const it of rec.items) if (it.errorId) errCounts.set(it.errorId, (errCounts.get(it.errorId) ?? 0) + 1);
  const errRows = Array.from(errCounts.entries()).sort((a, b) => b[1] - a[1]);
  const pct = Math.round((100 * rec.score) / rec.count);
  return (
    <div className="stack">
      <p className="small muted">
        <Link to="/exam">Exam simulation</Link> › results
      </p>
      <div className="card">
        <h1>
          {pct}% — {rec.score} / {rec.count}
        </h1>
        <div className="small muted">
          {rec.exam === "exam2" ? "Exam 2" : rec.exam === "exam1" ? "Exam 1" : "Mixed"} · {new Date(rec.finishedAt).toLocaleString()} · {Math.round((rec.finishedAt - rec.startedAt) / 60000)} min
          {rec.timerSec ? ` of ${Math.round(rec.timerSec / 60)}` : ""} · {rec.items.filter((i) => i.picked < 0).length} blank
        </div>
      </div>
      <div className="practice">
        <div className="card">
          <h2>By topic</h2>
          <table className="results-table">
            <tbody>
              {topicRows.map(({ topic, n, c }) => (
                <tr key={topic.id}>
                  <td>
                    <Link to={`/topic/${topic.id}`}>{topic.title}</Link>
                    <div className="small muted">{topic.chapter}</div>
                  </td>
                  <td className="stat">
                    {c}/{n}
                  </td>
                  <td style={{ width: "40%" }}>
                    <div className={"mastery" + (c / n < 0.6 ? " low" : "")}>
                      <div style={{ width: `${(100 * c) / n}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Named mistakes you made</h2>
          {errRows.length === 0 ? (
            <p className="muted">None — every wrong answer (if any) was a blank or an arithmetic slip without a named cause.</p>
          ) : (
            <ul className="template-list">
              {errRows.map(([id, n]) => {
                const e = errorById(id);
                return (
                  <li key={id}>
                    <div className="grow">
                      <strong>{e?.label ?? id}</strong> <span className="badge">×{n}</span>
                      <div className="small muted">{e?.explanation}</div>
                    </div>
                    <Link className="btn" to={`/drill/error/${id}`}>
                      Drill
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="card">
        <h2>Review each question</h2>
        <ol className="review-list">
          {rec.items.map((it, i) => {
            const q = questions[i];
            if (!q) return null;
            const t = templateById(it.templateId);
            const picked = it.picked >= 0 ? q.choices[it.picked] : undefined;
            const err = picked?.errorId ? errorById(picked.errorId) : null;
            return (
              <li key={i} className={"review-item " + (it.correct ? "good" : "bad")}>
                <div className="row spread" onClick={() => setOpen(open === i ? null : i)} style={{ cursor: "pointer" }}>
                  <span>
                    <strong>{it.correct ? "✓" : "✗"}</strong> {t?.title ?? it.templateId} <span className="small muted">({topicById(t?.topicId ?? "")?.title})</span>
                  </span>
                  <span className="small muted">{open === i ? "hide" : "show"}</span>
                </div>
                {open === i && (
                  <div className="stack" style={{ marginTop: 8 }}>
                    <ExamQuestion q={q} />
                    <ChoiceList choices={q.choices} unit={q.target.unit} selected={it.picked >= 0 ? it.picked : null} submitted onSelect={() => {}} />
                    {err && (
                      <div className="feedback bad">
                        <strong>{err.label}.</strong> {err.explanation}
                      </div>
                    )}
                    <Solution q={q} />
                    <Link className="btn" to={`/q/${it.templateId}/${randomSeed()}`}>
                      Same type, new numbers
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export type { ExamItem };
