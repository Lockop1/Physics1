/** Shared SVG helpers for force diagrams. */
import type { ReactNode } from "react";

export const C = {
  stroke: "var(--diagram-stroke)",
  muted: "var(--diagram-muted)",
  force: "var(--diagram-accel)",
  motion: "var(--diagram-velocity)",
  bg: "var(--diagram-bg)",
  fill: "var(--diagram-bg)",
};

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = C.force,
  label,
  width = 2.5,
  labelOffset = 10,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  label?: string;
  width?: number;
  labelOffset?: number;
  dashed?: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hx = x2 - ux * 9;
  const hy = y2 - uy * 9;
  const px = -uy * 5;
  const py = ux * 5;
  const lx = x2 + ux * labelOffset;
  const ly = y2 + uy * labelOffset;
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? "4 3" : undefined} />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={color} />
      {label && (
        <text x={lx} y={ly} fill={color} fontSize={14} fontStyle="italic" textAnchor="middle" dominantBaseline="middle">
          <Sub label={label} />
        </text>
      )}
    </g>
  );
}

/** "F_1" → F with subscript 1. */
export function Sub({ label }: { label: string }) {
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

export function Label({ x, y, children, color = C.stroke, size = 13, anchor = "middle" }: { x: number; y: number; children: ReactNode; color?: string; size?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} dominantBaseline="middle">
      {children}
    </text>
  );
}

/** Hatched ground line (rough surface) or plain line. */
export function Ground({ x1, x2, y, rough }: { x1: number; x2: number; y: number; rough?: boolean }) {
  const ticks: ReactNode[] = [];
  if (rough) {
    for (let x = x1; x < x2; x += 10) ticks.push(<line key={x} x1={x} y1={y} x2={x - 6} y2={y + 7} stroke={C.muted} strokeWidth={1} />);
  }
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.stroke} strokeWidth={2} />
      {ticks}
    </g>
  );
}

/** Zig-zag spring from (x1,y1) to (x2,y2). */
export function Spring({ x1, y1, x2, y2, coils = 8, amp = 6 }: { x1: number; y1: number; x2: number; y2: number; coils?: number; amp?: number }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const pts: string[] = [`${x1},${y1}`];
  const lead = len * 0.12;
  pts.push(`${x1 + ux * lead},${y1 + uy * lead}`);
  const body = len - 2 * lead;
  for (let i = 0; i < coils; i++) {
    const t = lead + (body * (i + 0.5)) / coils;
    const s = i % 2 === 0 ? 1 : -1;
    pts.push(`${x1 + ux * t + px * amp * s},${y1 + uy * t + py * amp * s}`);
  }
  pts.push(`${x2 - ux * lead},${y2 - uy * lead}`);
  pts.push(`${x2},${y2}`);
  return <polyline points={pts.join(" ")} fill="none" stroke={C.stroke} strokeWidth={1.8} strokeLinejoin="round" />;
}

export function AngleArc({ cx, cy, r, startDeg, endDeg, label }: { cx: number; cy: number; r: number; startDeg: number; endDeg: number; label?: string }) {
  // SVG y is down; degrees are math-convention (CCW positive)
  const toXY = (d: number) => ({ x: cx + r * Math.cos((d * Math.PI) / 180), y: cy - r * Math.sin((d * Math.PI) / 180) });
  const s = toXY(startDeg);
  const e = toXY(endDeg);
  const sweep = endDeg > startDeg ? 0 : 1;
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const mid = toXY((startDeg + endDeg) / 2);
  const lp = { x: cx + (r + 12) * Math.cos((((startDeg + endDeg) / 2) * Math.PI) / 180), y: cy - (r + 12) * Math.sin((((startDeg + endDeg) / 2) * Math.PI) / 180) };
  void mid;
  return (
    <g>
      <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`} fill="none" stroke={C.muted} strokeWidth={1.2} />
      {label && (
        <text x={lp.x} y={lp.y} fill={C.stroke} fontSize={12} textAnchor="middle" dominantBaseline="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w + 20 }} role="img" aria-label={label} className="diagram">
      {children}
    </svg>
  );
}
