import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TRAPS, trapById } from "../content/detective/traps";
import { createRng, randomSeed } from "../engine/rng";
import { getDetective, recordTrap } from "../lib/storage";
import { RichText } from "../lib/latex";
import { EquationLinks } from "../components/Solution";
import { errorById } from "../content/errors";
import { PageHeader } from "../components/PageHeader";
import { ActionBar } from "../components/ActionBar";

function pickTrap(exclude?: string): string {
  const stats = getDetective().traps;
  const pool = TRAPS.filter((t) => t.id !== exclude);
  const rng = createRng(randomSeed());
  // weight: unseen 3, wrong-heavy higher, mastered lower
  const w = pool.map((t) => {
    const s = stats[t.id];
    if (!s || s.attempts === 0) return 3;
    return 0.5 + 3 * (1 - s.correct / s.attempts);
  });
  const total = w.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= w[i]!;
    if (r <= 0) return pool[i]!.id;
  }
  return pool[pool.length - 1]!.id;
}

/** Mode D: spot the trap. URL /detective/trap/:trapId */
export function DetectiveTrapPage() {
  const { trapId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!trapId) navigate(`/detective/trap/${pickTrap()}`, { replace: true });
  }, [trapId, navigate]);
  if (!trapId) return <p className="muted">Loading…</p>;
  return <TrapRound key={trapId} trapId={trapId} onNext={() => navigate(`/detective/trap/${pickTrap(trapId)}`)} />;
}

function TrapRound({ trapId, onNext }: { trapId: string; onNext: () => void }) {
  const trap = trapById(trapId);
  const order = useMemo(() => (trap ? createRng(hash(trapId)).shuffle(trap.options.map((_, i) => i)) : []), [trap, trapId]);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[1-4]$/.test(e.key) && !done) {
        const i = order[Number(e.key) - 1];
        if (i !== undefined) setPicked(i);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (done) onNext();
        else submit();
      } else if ((e.key === "n" || e.key === "N") && done) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (!trap) return <p>Unknown scenario.</p>;
  const submit = () => {
    if (picked === null || done) return;
    setDone(true);
    recordTrap(trap.id, picked === trap.correct);
  };
  const err = trap.errorId ? errorById(trap.errorId) : null;
  const right = done && picked === trap.correct;
  return (
    <div className="question">
      <PageHeader back={{ to: "/detective", label: "Detective" }} title={trap.topic} />
      <div className="prompt">
        <RichText text={trap.prompt} />
      </div>
      <div className="choices">
        {order.map((optIdx, pos) => {
          let cls = "choice";
          if (done) {
            if (optIdx === trap.correct) cls += " correct";
            else if (picked === optIdx) cls += " wrong";
            else cls += " dim";
          } else if (picked === optIdx) cls += " selected";
          return (
            <button key={optIdx} className={cls} onClick={() => !done && setPicked(optIdx)} disabled={done}>
              <span className="key">{pos + 1}</span>
              <span className="label">
                <RichText text={trap.options[optIdx]!} />
              </span>
            </button>
          );
        })}
      </div>
      {done && (
        <div className="card solution-card">
          <p style={{ margin: 0 }}>{trap.explanation}</p>
          {err && !right && (
            <p className="note" style={{ margin: "10px 0 0" }}>
              Named mistake: <strong>{err.label}</strong>
            </p>
          )}
          {trap.equations.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <EquationLinks ids={trap.equations} />
            </div>
          )}
        </div>
      )}
      <ActionBar tone={done ? (right ? "good" : "bad") : undefined} message={done ? (right ? "You spotted it" : "That's the trap") : undefined}>
        {done ? (
          <button className="primary" onClick={onNext}>
            Next <kbd>↵</kbd>
          </button>
        ) : (
          <>
            <button className="quiet" onClick={onNext}>
              Skip
            </button>
            <button className="primary" onClick={submit} disabled={picked === null}>
              Check <kbd>↵</kbd>
            </button>
          </>
        )}
      </ActionBar>
    </div>
  );
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
