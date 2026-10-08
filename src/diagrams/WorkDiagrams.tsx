import type { WorkAngleDiagramSpec, WorkRankDiagramSpec, FxGraphDiagramSpec } from "./types";
import { Arrow, Label, Svg, AngleArc, C } from "./primitives";

export function WorkAngleDiagram({ spec }: { spec: WorkAngleDiagramSpec }) {
  const W = 280;
  const H = 170;
  const bx = 80;
  const by = 110;
  const a = (spec.angleDeg * Math.PI) / 180;
  const L = 70;
  return (
    <Svg w={W} h={H} label="Force at an angle to the displacement">
      <line x1={20} y1={by + 20} x2={W - 20} y2={by + 20} stroke={C.stroke} strokeWidth={2} />
      <rect x={bx - 22} y={by - 20} width={44} height={40} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      <Arrow x1={bx} y1={by} x2={bx + L * Math.cos(a)} y2={by - L * Math.sin(a)} label={spec.forceLabel ?? "F"} />
      <Arrow x1={bx + 30} y1={by + 42} x2={bx + 130} y2={by + 42} color={C.motion} label="d" />
      {spec.angleDeg > 2 && spec.angleDeg < 178 && (
        <g>
          <line x1={bx} y1={by} x2={bx + 50} y2={by} stroke={C.muted} strokeDasharray="3 3" />
          <AngleArc cx={bx} cy={by} r={26} startDeg={0} endDeg={spec.angleDeg} label="θ" />
        </g>
      )}
      {spec.caption && (
        <Label x={W / 2} y={H - 6} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}

export function WorkRankDiagram({ spec }: { spec: WorkRankDiagramSpec }) {
  const pw = 130;
  const ph = 110;
  const cols = 2;
  const rows = Math.ceil(spec.panels.length / cols);
  const W = pw * cols;
  const H = ph * rows;
  return (
    <Svg w={W} h={H} label="Four force directions">
      {spec.panels.map((p, i) => {
        const ox = (i % cols) * pw;
        const oy = Math.floor(i / cols) * ph;
        const bx = ox + 50;
        const by = oy + 58;
        const a = (p.angleDeg * Math.PI) / 180;
        return (
          <g key={p.label}>
            <rect x={ox + 4} y={oy + 4} width={pw - 8} height={ph - 8} fill="none" stroke={C.muted} strokeWidth={1} rx={6} />
            <Label x={ox + 16} y={oy + 16} size={13}>
              {p.label}
            </Label>
            <rect x={bx - 14} y={by - 12} width={28} height={24} fill={C.fill} stroke={C.stroke} strokeWidth={1.8} />
            <Arrow x1={bx} y1={by} x2={bx + 42 * Math.cos(a)} y2={by - 42 * Math.sin(a)} label="F" labelOffset={9} />
            <Arrow x1={bx + 20} y1={by + 32} x2={bx + 66} y2={by + 32} color={C.motion} label="d" width={1.8} labelOffset={9} />
          </g>
        );
      })}
    </Svg>
  );
}

export function FxGraphDiagram({ spec }: { spec: FxGraphDiagramSpec }) {
  const W = 320;
  const H = 220;
  const ml = 44;
  const mr = 16;
  const mt = 16;
  const mb = 36;
  const pts = spec.points;
  const xs = pts.map((p) => p.x);
  const fs = pts.map((p) => p.F);
  const xMin = Math.min(0, ...xs);
  const xMax = Math.max(...xs);
  const fMax = Math.max(1, ...fs);
  const fMin = Math.min(0, ...fs);
  const sx = (x: number) => ml + ((x - xMin) / (xMax - xMin || 1)) * (W - ml - mr);
  const sy = (f: number) => mt + ((fMax - f) / (fMax - fMin || 1)) * (H - mt - mb);
  const y0 = sy(0);
  // shaded region between from..to
  let shade: string | null = null;
  if (spec.from !== undefined && spec.to !== undefined) {
    const inside = [
      { x: spec.from, F: interp(pts, spec.from) },
      ...pts.filter((p) => p.x > spec.from! && p.x < spec.to!),
      { x: spec.to, F: interp(pts, spec.to) },
    ];
    shade = `M ${sx(spec.from)} ${y0} ` + inside.map((p) => `L ${sx(p.x)} ${sy(p.F)}`).join(" ") + ` L ${sx(spec.to)} ${y0} Z`;
  }
  const xTicks = niceTicks(xMin, xMax);
  const fTicks = niceTicks(fMin, fMax);
  return (
    <Svg w={W} h={H} label="Force versus position graph">
      {shade && <path d={shade} fill="var(--diagram-accel)" opacity={0.18} />}
      {/* grid */}
      {xTicks.map((t) => (
        <line key={"gx" + t} x1={sx(t)} y1={mt} x2={sx(t)} y2={H - mb} stroke={C.muted} strokeWidth={0.5} opacity={0.5} />
      ))}
      {fTicks.map((t) => (
        <line key={"gy" + t} x1={ml} y1={sy(t)} x2={W - mr} y2={sy(t)} stroke={C.muted} strokeWidth={0.5} opacity={0.5} />
      ))}
      <line x1={ml} y1={y0} x2={W - mr} y2={y0} stroke={C.stroke} strokeWidth={1.5} />
      <line x1={ml} y1={mt} x2={ml} y2={H - mb} stroke={C.stroke} strokeWidth={1.5} />
      <polyline points={pts.map((p) => `${sx(p.x)},${sy(p.F)}`).join(" ")} fill="none" stroke={C.force} strokeWidth={2.5} strokeLinejoin="round" />
      {xTicks.map((t) => (
        <Label key={"x" + t} x={sx(t)} y={H - mb + 12} size={11} color={C.muted}>
          {t}
        </Label>
      ))}
      {fTicks.map((t) => (
        <Label key={"f" + t} x={ml - 8} y={sy(t)} size={11} color={C.muted} anchor="end">
          {t}
        </Label>
      ))}
      <Label x={W - mr} y={H - 6} size={12} anchor="end">
        {spec.xLabel ?? "x"} ({spec.xUnit ?? "m"})
      </Label>
      <Label x={ml + 4} y={mt - 4} size={12} anchor="start">
        {spec.yLabel ?? "F"} ({spec.fUnit ?? "N"})
      </Label>
    </Svg>
  );
}

function interp(pts: { x: number; F: number }[], x: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    if (x >= a.x && x <= b.x) {
      if (b.x === a.x) return a.F;
      return a.F + ((b.F - a.F) * (x - a.x)) / (b.x - a.x);
    }
  }
  return 0;
}

function niceTicks(min: number, max: number): number[] {
  const span = max - min || 1;
  const raw = span / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => span / s <= 6) ?? mag * 10;
  const out: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) out.push(Number(t.toFixed(6)));
  return out;
}
