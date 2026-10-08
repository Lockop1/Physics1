export function MasteryBar({ mastery, attempts }: { mastery: number | null; attempts: number }) {
  const pct = mastery === null ? 0 : Math.round(mastery * 100);
  return (
    <div>
      <div className={"mastery" + (mastery !== null && mastery < 0.6 ? " low" : "")} title={`${pct}%`}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <div className="small muted stat">
        {mastery === null ? "not started" : `${pct}% · ${attempts} attempt${attempts === 1 ? "" : "s"}`}
      </div>
    </div>
  );
}
