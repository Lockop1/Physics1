/** Thin mastery bar with a percentage. `compact` drops the caption to a bare number. */
export function MasteryBar({ mastery, attempts, compact = false }: { mastery: number | null; attempts: number; compact?: boolean }) {
  const pct = mastery === null ? 0 : Math.round(mastery * 100);
  const low = mastery !== null && mastery < 0.6;
  if (compact) {
    return (
      <span className="mastery-block" title={mastery === null ? "not started" : `${pct}% over ${attempts} attempts`}>
        <span className={"mastery mini" + (low ? " low" : "")}>
          <span style={{ width: `${pct}%`, display: "block", height: "100%" }} />
        </span>
        <span className="mastery-pct">{mastery === null ? "" : `${pct}%`}</span>
      </span>
    );
  }
  return (
    <div className="mastery-block">
      <div className={"mastery" + (low ? " low" : "")}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <span className="mastery-pct">{mastery === null ? "new" : `${pct}%`}</span>
    </div>
  );
}
