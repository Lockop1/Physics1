import type { CircleDiagramSpec } from "./types";

const W = 260;
const H = 260;
const CX = 130;
const CY = 130;
const R = 90;

/** Polar → SVG coords (SVG y grows downward, so math angle is flipped). */
function pt(deg: number, rad = R): { x: number; y: number } {
  const a = (deg * Math.PI) / 180;
  return { x: CX + rad * Math.cos(a), y: CY - rad * Math.sin(a) };
}

function Arrow({ x1, y1, x2, y2, color, label, id }: { x1: number; y1: number; x2: number; y2: number; color: string; label?: string; id: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // arrow head
  const hx = x2 - ux * 9;
  const hy = y2 - uy * 9;
  const px = -uy * 5;
  const py = ux * 5;
  // label offset perpendicular
  const lx = x2 + ux * 8 + px * 1.6;
  const ly = y2 + uy * 8 + py * 1.6;
  return (
    <g id={id}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={color} />
      {label && (
        <text x={lx} y={ly} fill={color} fontSize={14} fontStyle="italic" textAnchor="middle" dominantBaseline="middle">
          <SubLabel label={label} />
        </text>
      )}
    </g>
  );
}

/** "a_c" → a with a subscript c. */
function SubLabel({ label }: { label: string }) {
  const i = label.indexOf("_");
  if (i === -1) return <>{label}</>;
  return (
    <>
      {label.slice(0, i)}
      <tspan dy={4} fontSize={10}>
        {label.slice(i + 1)}
      </tspan>
    </>
  );
}

export function CircleDiagram({ spec }: { spec: CircleDiagramSpec }) {
  const stroke = "var(--diagram-stroke)";
  const muted = "var(--diagram-muted)";
  const vColor = "var(--diagram-velocity)";
  const aColor = "var(--diagram-accel)";
  const mark = spec.markAngleDeg ?? null;
  const p = mark !== null ? pt(mark) : null;

  // direction-of-motion indicator arc (top-left quadrant), drawn as arrow
  let motionArrow: React.ReactNode = null;
  if (spec.direction) {
    const start = spec.direction === "ccw" ? 120 : 150;
    const end = spec.direction === "ccw" ? 150 : 120;
    const rr = R + 16;
    const s = pt(start, rr);
    const e = pt(end, rr);
    const sweep = spec.direction === "ccw" ? 0 : 1;
    const tip = pt(end + (spec.direction === "ccw" ? 4 : -4), rr);
    motionArrow = (
      <g>
        <path d={`M ${s.x} ${s.y} A ${rr} ${rr} 0 0 ${sweep} ${e.x} ${e.y}`} fill="none" stroke={muted} strokeWidth={2} />
        <circle cx={tip.x} cy={tip.y} r={3.5} fill={muted} />
        <text x={pt(135, rr + 16).x} y={pt(135, rr + 16).y} fill={muted} fontSize={11} textAnchor="middle" dominantBaseline="middle">
          {spec.direction === "ccw" ? "CCW" : "CW"}
        </text>
      </g>
    );
  }

  // arc from 0 to arcDeg
  let arc: React.ReactNode = null;
  if (spec.arcDeg && spec.arcDeg > 0) {
    const a = Math.min(spec.arcDeg, 359.9);
    const s = pt(0, R);
    const e = pt(a, R);
    const large = a > 180 ? 1 : 0;
    const mid = pt(a / 2, R + 14);
    const innerS = pt(0, 22);
    const innerE = pt(Math.min(a, 359), 22);
    arc = (
      <g>
        <path d={`M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 0 ${e.x} ${e.y}`} fill="none" stroke={aColor} strokeWidth={4} strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={s.x} y2={s.y} stroke={muted} strokeDasharray="4 3" />
        <line x1={CX} y1={CY} x2={e.x} y2={e.y} stroke={muted} strokeDasharray="4 3" />
        <path d={`M ${innerS.x} ${innerS.y} A 22 22 0 ${large} 0 ${innerE.x} ${innerE.y}`} fill="none" stroke={stroke} strokeWidth={1.5} />
        <text x={mid.x} y={mid.y} fill={aColor} fontSize={13} textAnchor="middle" dominantBaseline="middle">
          {spec.arcLabel ?? "s"}
        </text>
      </g>
    );
  }

  // radius / diameter line
  const radiusAngle = mark !== null && mark === 0 ? 225 : 0;
  const rEnd = pt(radiusAngle);
  const rStart = spec.showDiameter ? pt(radiusAngle + 180) : { x: CX, y: CY };
  const rLabelPos = pt(radiusAngle, R / 2 + (spec.showDiameter ? 0 : 0));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 280 }} role="img" aria-label="Circular motion diagram" className="diagram">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={stroke} strokeWidth={2} />
      <circle cx={CX} cy={CY} r={2.5} fill={stroke} />
      {motionArrow}
      {arc}
      {spec.radiusLabel && (
        <g>
          <line x1={rStart.x} y1={rStart.y} x2={rEnd.x} y2={rEnd.y} stroke={muted} strokeWidth={1.5} strokeDasharray={spec.showDiameter ? undefined : "5 3"} />
          <rect x={rLabelPos.x - 34} y={rLabelPos.y - 9 - 8} width={68} height={16} fill="var(--diagram-bg)" rx={3} />
          <text x={rLabelPos.x} y={rLabelPos.y - 9} fill={stroke} fontSize={12} textAnchor="middle" dominantBaseline="middle">
            {spec.radiusLabel}
          </text>
        </g>
      )}
      {p && (
        <g>
          {spec.showCentripetal && (() => {
            const inner = pt(mark as number, R - 46);
            return <Arrow id="ac" x1={p.x} y1={p.y} x2={inner.x} y2={inner.y} color={aColor} label="a_c" />;
          })()}
          {spec.showVelocity && (() => {
            const dir = spec.direction ?? "ccw";
            const t = (mark as number) + (dir === "ccw" ? 90 : -90);
            const ta = (t * Math.PI) / 180;
            const L = 46;
            return <Arrow id="v" x1={p.x} y1={p.y} x2={p.x + L * Math.cos(ta)} y2={p.y - L * Math.sin(ta)} color={vColor} label="v" />;
          })()}
          {spec.tangential && (() => {
            const dir = spec.direction ?? "ccw";
            const sign = spec.tangential === "along" ? 1 : -1;
            const t = (mark as number) + sign * (dir === "ccw" ? 90 : -90);
            const ta = (t * Math.PI) / 180;
            const L = 32;
            // offset slightly outward so it doesn't overlap v
            const base = pt(mark as number, R + 12);
            return <Arrow id="at" x1={base.x} y1={base.y} x2={base.x + L * Math.cos(ta)} y2={base.y - L * Math.sin(ta)} color={muted} label="a_t" />;
          })()}
          <circle cx={p.x} cy={p.y} r={5} fill={stroke} />
          {spec.markLabel && (() => {
            const lp = pt(mark as number, R + 16);
            // nudge label away from arrows
            return (
              <text x={lp.x} y={lp.y} fill={stroke} fontSize={14} fontWeight={600} textAnchor="middle" dominantBaseline="middle">
                {spec.markLabel}
              </text>
            );
          })()}
        </g>
      )}
      {spec.caption && (
        <text x={CX} y={H - 6} fill={muted} fontSize={12} textAnchor="middle">
          {spec.caption}
        </text>
      )}
    </svg>
  );
}

