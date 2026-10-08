import type { VectorsDiagramSpec, ProjectileDiagramSpec } from "./types";
import { Arrow, Label, Svg, AngleArc, C } from "./primitives";

export function VectorsDiagram({ spec }: { spec: VectorsDiagramSpec }) {
  const W = 300;
  const H = 260;
  const cx = 150;
  const cy = 130;
  const maxMag = Math.max(...spec.vectors.map((v) => v.magnitude), 1);
  const scale = 95 / maxMag;
  const colors = [C.force, C.motion, "var(--accent)", C.stroke];
  let rx = 0;
  let ry = 0;
  return (
    <Svg w={W} h={H} label="Vectors">
      <line x1={20} y1={cy} x2={W - 20} y2={cy} stroke={C.muted} strokeWidth={1} />
      <line x1={cx} y1={20} x2={cx} y2={H - 20} stroke={C.muted} strokeWidth={1} />
      <Label x={W - 14} y={cy - 10} size={11} color={C.muted}>
        +x
      </Label>
      <Label x={cx + 12} y={24} size={11} color={C.muted}>
        +y
      </Label>
      {spec.vectors.map((v, i) => {
        const a = (v.angleDeg * Math.PI) / 180;
        const L = v.magnitude * scale;
        const ex = cx + L * Math.cos(a);
        const ey = cy - L * Math.sin(a);
        rx += L * Math.cos(a);
        ry += L * Math.sin(a);
        const color = colors[i % colors.length]!;
        const ref = v.ref ?? "+x";
        const refDeg = ref === "+x" ? 0 : ref === "+y" ? 90 : ref === "-x" ? 180 : 270;
        // arc from reference axis to the vector (shortest way)
        let d = v.angleDeg - refDeg;
        while (d > 180) d -= 360;
        while (d < -180) d += 360;
        return (
          <g key={i}>
            <Arrow x1={cx} y1={cy} x2={ex} y2={ey} color={color} label={v.label} />
            {v.angleLabel && <AngleArc cx={cx} cy={cy} r={28 + i * 8} startDeg={refDeg} endDeg={refDeg + d} label={v.angleLabel} />}
          </g>
        );
      })}
      {spec.showResultant && spec.vectors.length > 1 && <Arrow x1={cx} y1={cy} x2={cx + rx} y2={cy - ry} color={C.muted} label="R" dashed />}
      {spec.caption && (
        <Label x={W / 2} y={H - 6} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}

export function ProjectileDiagram({ spec }: { spec: ProjectileDiagramSpec }) {
  const W = 320;
  const H = 220;
  const groundY = 190;
  const hasCliff = spec.launchHeight > 0;
  const cliffH = hasCliff ? 90 : 0;
  const x0 = hasCliff ? 60 : 40;
  const y0 = groundY - cliffH;
  const a = (spec.angleDeg * Math.PI) / 180;
  // trajectory: parabola with chosen pixel scale
  const v = 1;
  const vx = v * Math.cos(a);
  const vy = v * Math.sin(a);
  const g = 1;
  const tTop = Math.max(vy / g, 0);
  const hTop = (vy * vy) / (2 * g);
  // choose scale so the path fits: landing where y returns to ground
  const tLand = (vy + Math.sqrt(vy * vy + 2 * g * (cliffH / 60))) / g;
  const xLand = vx * tLand;
  const sx = Math.min((W - x0 - 20) / Math.max(xLand, 0.1), 180);
  const sy = 60; // px per unit height
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = (tLand * i) / 40;
    const px = x0 + vx * t * sx;
    const py = y0 - (vy * t - 0.5 * g * t * t) * sy;
    pts.push(`${px},${Math.min(py, groundY)}`);
  }
  void hTop;
  void tTop;
  const refDeg = spec.angleFromVertical ? 90 : 0;
  const Lv = 48;
  return (
    <Svg w={W} h={H} label="Projectile trajectory">
      <line x1={10} y1={groundY} x2={W - 10} y2={groundY} stroke={C.stroke} strokeWidth={2} />
      {hasCliff && (
        <g>
          <polyline points={`${10},${y0} ${x0},${y0} ${x0},${groundY}`} fill="none" stroke={C.stroke} strokeWidth={2} />
          <line x1={x0 + 14} y1={y0} x2={x0 + 14} y2={groundY} stroke={C.muted} strokeDasharray="3 3" />
          <Label x={x0 + 20} y={(y0 + groundY) / 2} size={12} anchor="start">
            {spec.heightLabel ?? "h"}
          </Label>
        </g>
      )}
      <polyline points={pts.join(" ")} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <circle cx={x0} cy={y0} r={5} fill={C.stroke} />
      <Arrow x1={x0} y1={y0} x2={x0 + Lv * Math.cos(a)} y2={y0 - Lv * Math.sin(a)} label={spec.speedLabel ?? "v₀"} />
      {spec.angleLabel && (
        <g>
          {spec.angleFromVertical ? <line x1={x0} y1={y0} x2={x0} y2={y0 - 44} stroke={C.muted} strokeDasharray="3 3" /> : <line x1={x0} y1={y0} x2={x0 + 44} y2={y0} stroke={C.muted} strokeDasharray="3 3" />}
          <AngleArc cx={x0} cy={y0} r={24} startDeg={refDeg} endDeg={spec.angleDeg} label={spec.angleLabel} />
        </g>
      )}
      {spec.rangeLabel && (
        <g>
          <Arrow x1={x0} y1={groundY + 14} x2={x0 + xLand * sx} y2={groundY + 14} color={C.muted} width={1.5} />
          <Label x={x0 + (xLand * sx) / 2} y={groundY + 26} size={12} color={C.muted}>
            {spec.rangeLabel}
          </Label>
        </g>
      )}
      {spec.caption && (
        <Label x={W / 2} y={14} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}
