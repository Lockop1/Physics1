import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TRAPS, trapById } from "../content/detective/traps";
import { createRng, randomSeed } from "../engine/rng";
import { getDetective, recordTrap } from "../lib/storage";
import { RichText } from "../lib/latex";
import { EquationLink } from "../components/Solution";
import { errorById } from "../content/errors";

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
      } else if (e.key === "Enter" && !done && picked !== null) submit();
      else if ((e.key === "n" || e.key === "N") && done) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (!trap) return <p>Unknown scenario.</p>;
  const submit = () => {
    if (picked === null) return;
    setDone(true);
    recordTrap(trap.id, picked === trap.correct);
  };
  const err = trap.errorId ? errorById(trap.errorId) : null;
  const stat = getDetective().traps[trap.id];
  return (
    <div>
      <p className="small muted row spread">
        <span>
          <Link to="/detective">Detective</Link> › D · Spot the trap
        </span>
        <span className="stat">
          {trap.topic} · {stat ? `${stat.correct}/${stat.attempts}` : "new"}
        </span>
      </p>
      <div className="practice">
        <div className="card">
          <div className="prompt">
            <RichText text={trap.prompt} />
          </div>
          <div className="choices">
            {order.map((optIdx, pos) => {
              let cls = "choice";
              if (done) {
                if (optIdx === trap.correct) cls += " correct";
                else if (picked === optIdx) cls += " wrong";
              } else if (picked === optIdx) cls += " selected";
              return (
                <button key={optIdx} className={cls} onClick={() => !done && setPicked(optIdx)} disabled={done}>
                  <span className="key">{pos + 1}</span>
                  <RichText text={trap.options[optIdx]!} />
                </button>
              );
            })}
          </div>
          <div className="actions">
            {!done && (
              <button className="primary" onClick={submit} disabled={picked === null}>
                Check <kbd>↵</kbd>
              </button>
            )}
            <button className={done ? "primary" : ""} onClick={onNext}>
              Next <kbd>N</kbd>
            </button>
          </div>
        </div>
        <div className="sticky">
          {done ? (
            <div className="card stack">
              <div className={"feedback " + (picked === trap.correct ? "good" : "bad")}>
                <div className="label">{picked === trap.correct ? "You spotted it." : "That's the trap."}</div>
                <div>{trap.explanation}</div>
                {err && picked !== trap.correct && (
                  <div className="small muted" style={{ marginTop: 6 }}>
                    Named mistake: <strong>{err.label}</strong>
                  </div>
                )}
              </div>
              <div className="row" style={{ gap: 4 }}>
                {trap.equations.map((id) => (
                  <EquationLink key={id} id={id} />
                ))}
              </div>
            </div>
          ) : (
            <div className="card muted small">One option is right; the others are the tempting-but-wrong moves. Keys 1–4 pick, ↵ checks.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
