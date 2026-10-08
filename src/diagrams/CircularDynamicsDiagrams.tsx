import type { LoopDiagramSpec, FlatCurveDiagramSpec, BankedDiagramSpec, ConicalDiagramSpec, OrbitDiagramSpec } from "./types";
import { Arrow, Label, Svg, AngleArc, C } from "./primitives";

/** Vertical loop with marked top/bottom point(s). */
export function LoopDiagram({ spec }: { spec: LoopDiagramSpec }) {
  const W = 280;
  const H = 260;
  const cx = 140;
  const cy = 130;
  const r = 90;
  const F = spec.forceLabel ?? "N";
  const show = spec.showForces ?? true;
  const pts = spec.point === "both" ? (["top", "bottom"] as const) : ([spec.point] as const);
  return (
    <Svg w={W} h={H} label="Vertical circle">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.stroke} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2.5} fill={C.stroke} />
      {spec.radiusLabel && (
        <g>
          <line x1={cx} y1={cy} x2={cx + r * 0.7071} y2={cy + r * 0.7071} stroke={C.muted} strokeDasharray="4 3" />
          <Label x={cx + r * 0.35 + 18} y={cy + r * 0.35 - 6} size={12}>
            {spec.radiusLabel}
          </Label>
        </g>
      )}
      {pts.map((p) => {
        const y = p === "top" ? cy - r : cy + r;
        return (
          <g key={p}>
            <rect x={cx - 14} y={y - 9} width={28} height={18} fill={C.fill} stroke={C.stroke} strokeWidth={2} rx={3} />
            <Label x={cx + (p === "top" ? -52 : 58)} y={y} size={13}>
              {p === "top" ? "A (top)" : "B (bottom)"}
            </Label>
            {show && (
              <g>
                {/* mg always down; contact force toward the center: down at top, up at bottom */}
                <Arrow x1={cx + 8} y1={y} x2={cx + 8} y2={y + 42} color={C.motion} label="mg" />
                {p === "top" && !spec.topContactUp ? <Arrow x1={cx - 8} y1={y + 9} x2={cx - 8} y2={y + 44} label={F} /> : <Arrow x1={cx - 8} y1={y - 9} x2={cx - 8} y2={y - 48} label={F} />}
              </g>
            )}
          </g>
        );
      })}
      <Arrow x1={cx + r + 4} y1={cy + 18} x2={cx + r + 4} y2={cy - 18} color={C.muted} label="v" width={1.5} />
      {spec.caption && (
        <Label x={W / 2} y={H - 6} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}

/** Overhead view of a car on a flat curve, friction toward the center. */
export function FlatCurveDiagram({ spec }: { spec: FlatCurveDiagramSpec }) {
  const W = 280;
  const H = 200;
  const cx = 60;
  const cy = 170;
  const r1 = 110;
  const r2 = 150;
  const arc = (rr: number) => `M ${cx + rr} ${cy} A ${rr} ${rr} 0 0 0 ${cx} ${cy - rr}`;
  const rm = (r1 + r2) / 2;
  const a = Math.PI / 4;
  const car = { x: cx + rm * Math.cos(a), y: cy - rm * Math.sin(a) };
  return (
    <Svg w={W} h={H} label="Flat curve, overhead view">
      <path d={arc(r1)} fill="none" stroke={C.stroke} strokeWidth={2} />
      <path d={arc(r2)} fill="none" stroke={C.stroke} strokeWidth={2} />
      <path d={arc(rm)} fill="none" stroke={C.muted} strokeWidth={1} strokeDasharray="5 4" />
      <line x1={cx} y1={cy} x2={car.x} y2={car.y} stroke={C.muted} strokeDasharray="3 3" />
      <circle cx={cx} cy={cy} r={3} fill={C.stroke} />
      <g transform={`rotate(${-45} ${car.x} ${car.y})`}>
        <rect x={car.x - 12} y={car.y - 8} width={24} height={16} fill={C.fill} stroke={C.stroke} strokeWidth={2} rx={3} />
      </g>
      <Arrow x1={car.x} y1={car.y} x2={car.x - 44 * Math.cos(a)} y2={car.y + 44 * Math.sin(a)} label="f_s" />
      <Arrow x1={car.x} y1={car.y} x2={car.x - 40 * Math.sin(a)} y2={car.y - 40 * Math.cos(a)} color={C.motion} label="v" />
      <Label x={cx + 60} y={cy - 40} size={12}>
        {spec.radiusLabel ?? "r"}
      </Label>
      <Label x={W - 8} y={14} color={C.muted} size={11} anchor="end">
        overhead view
      </Label>
      {spec.caption && (
        <Label x={W / 2} y={H - 6} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}

/** Cross-section of a banked curve. */
export function BankedDiagram({ spec }: { spec: BankedDiagramSpec }) {
  const W = 300;
  const H = 200;
  const th = Math.max(5, Math.min(spec.angleDeg, 60));
  const a = (th * Math.PI) / 180;
  const x0 = 30;
  const y0 = 160;
  const run = 220;
  const rise = run * Math.tan(a);
  const x1 = x0 + run;
  const y1 = y0 - rise;
  const ux = Math.cos(a);
  const uy = -Math.sin(a);
  const nx = Math.sin(a);
  const ny = -Math.cos(a);
  const t = run / ux * 0.55;
  const sx = x0 + ux * t;
  const sy = y0 + uy * t;
  const cx = sx + nx * 11;
  const cy = sy + ny * 11;
  return (
    <Svg w={W} h={H} label="Banked curve, cross-section">
      <polygon points={`${x0},${y0} ${x1},${y0} ${x1},${y1}`} fill="none" stroke={C.stroke} strokeWidth={2} />
      <AngleArc cx={x0} cy={y0} r={34} startDeg={0} endDeg={th} />
      <Label x={x0 + 46} y={y0 + 14} size={12} anchor="start">{spec.hideNumbers ? "θ" : `θ = ${spec.angleDeg}°`}</Label>
      <g transform={`rotate(${-th} ${cx} ${cy})`}>
        <rect x={cx - 20} y={cy - 11} width={40} height={22} fill={C.fill} stroke={C.stroke} strokeWidth={2} rx={4} />
      </g>
      {(spec.showForces ?? true) && (
        <g>
          <Arrow x1={cx} y1={cy} x2={cx + nx * 60} y2={cy + ny * 60} label="N" />
          <Arrow x1={cx} y1={cy} x2={cx} y2={cy + 50} color={C.motion} label="mg" />
          <Arrow x1={cx + 70} y1={cy - 70} x2={cx + 30} y2={cy - 70} color={C.muted} width={1.5} />
          <Label x={cx + 74} y={cy - 70} size={11} color={C.muted} anchor="start">
            to center
          </Label>
        </g>
      )}
      <Label x={W - 8} y={14} color={C.muted} size={11} anchor="end">
        cross-section
      </Label>
      {spec.caption && (
        <Label x={W / 2} y={H - 6} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}

/** Conical pendulum. */
export function ConicalDiagram({ spec }: { spec: ConicalDiagramSpec }) {
  const W = 320;
  const H = 240;
  const px = 130;
  const py = 30;
  const th = Math.max(8, Math.min(spec.angleDeg, 82));
  const a = (th * Math.PI) / 180;
  const L = 150;
  const bx = px + L * Math.sin(a);
  const by = py + L * Math.cos(a);
  const r = L * Math.sin(a);
  return (
    <Svg w={W} h={H} label="Conical pendulum">
      <line x1={px - 40} y1={py} x2={px + 40} y2={py} stroke={C.stroke} strokeWidth={3} />
      <line x1={px} y1={py} x2={px} y2={by} stroke={C.muted} strokeDasharray="4 3" />
      <ellipse cx={px} cy={by} rx={r} ry={r * 0.25} fill="none" stroke={C.muted} strokeDasharray="4 3" />
      <line x1={px} y1={py} x2={bx} y2={by} stroke={C.stroke} strokeWidth={1.8} />
      <circle cx={bx} cy={by} r={8} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      {spec.fromHorizontal ? (
        <AngleArc cx={px} cy={py} r={40} startDeg={-(90 - th)} endDeg={0} label={spec.hideNumbers ? "θ" : `${90 - spec.angleDeg}°`} />
      ) : (
        <AngleArc cx={px} cy={py} r={40} startDeg={-90} endDeg={-(90 - th)} label={spec.hideNumbers ? "θ" : `${spec.angleDeg}°`} />
      )}
      {spec.fromHorizontal && <line x1={px} y1={py} x2={px + 60} y2={py} stroke={C.muted} strokeDasharray="3 3" />}
      {spec.lengthLabel && (
        <Label x={(px + bx) / 2 - 16} y={(py + by) / 2} size={12}>
          {spec.lengthLabel}
        </Label>
      )}
      {(spec.showForces ?? true) && (
        <g>
          <Arrow x1={bx} y1={by} x2={bx - 50 * Math.sin(a)} y2={by - 50 * Math.cos(a)} label="T" />
          <Arrow x1={bx} y1={by} x2={bx} y2={by + 45} color={C.motion} label="mg" />
        </g>
      )}
      <Label x={px} y={by + 8 + r * 0.25 + 12} color={C.muted} size={11}>
        r
      </Label>
      {spec.caption && (
        <Label x={W / 2} y={H - 6} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}

/** Planet + orbit. */
export function OrbitDiagram({ spec }: { spec: OrbitDiagramSpec }) {
  const W = 260;
  const H = 240;
  const cx = 130;
  const cy = 120;
  const R = 60;
  const ro = 100;
  return (
    <Svg w={W} h={H} label="Satellite orbit">
      <circle cx={cx} cy={cy} r={R} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={ro} fill="none" stroke={C.muted} strokeDasharray="5 4" />
      <circle cx={cx} cy={cy} r={2.5} fill={C.stroke} />
      <circle cx={cx + ro} cy={cy} r={5} fill={C.stroke} />
      <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.stroke} strokeWidth={1.5} />
      <Label x={cx + R / 2} y={cy - 9} size={12}>
        R
      </Label>
      {spec.altitudeLabel && (
        <g>
          <line x1={cx + R} y1={cy} x2={cx + ro} y2={cy} stroke={C.force} strokeWidth={1.5} />
          <Label x={cx + (R + ro) / 2} y={cy + 12} size={12} color={C.force}>
            {spec.altitudeLabel}
          </Label>
        </g>
      )}
      {spec.radiusLabel && (
        <g>
          <line x1={cx} y1={cy} x2={cx - ro * 0.7071} y2={cy - ro * 0.7071} stroke={C.muted} strokeDasharray="3 3" />
          <Label x={cx - ro * 0.35 - 14} y={cy - ro * 0.35 + 8} size={12}>
            {spec.radiusLabel}
          </Label>
        </g>
      )}
      <Arrow x1={cx + ro} y1={cy} x2={cx + ro} y2={cy - 36} color={C.motion} label="v" width={1.5} />
      <Label x={cx - 10} y={cy + 14} size={11} color={C.muted}>
        M
      </Label>
      {spec.caption && (
        <Label x={W / 2} y={H - 6} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}
