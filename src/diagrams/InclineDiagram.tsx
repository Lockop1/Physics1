import type { InclineDiagramSpec } from "./types";
import { Arrow, Label, Spring, Svg, AngleArc, C } from "./primitives";

const W = 320;
const H = 210;

export function InclineDiagram({ spec }: { spec: InclineDiagramSpec }) {
  const th = Math.max(8, Math.min(spec.angleDeg, 75));
  const a = (th * Math.PI) / 180;
  // incline: bottom-left corner at (x0, y0), rises to the right
  const x0 = 30;
  const y0 = 170;
  const run = 240;
  const rise = Math.min(run * Math.tan(a), 150);
  const runEff = rise / Math.tan(a);
  const x1 = x0 + runEff;
  const y1 = y0 - rise;
  // unit vectors along slope (up) and normal (out of surface)
  const ux = Math.cos(a);
  const uy = -Math.sin(a);
  const nx = Math.sin(a);
  const ny = -Math.cos(a);
  // block centre at 50% along slope, sitting on surface
  const t = (runEff / ux) * (spec.rope === "down" ? 0.62 : 0.5);
  const bw = 40;
  const bh = 28;
  const sx = x0 + ux * t; // surface point
  const sy = y0 + uy * t;
  const cx = sx + nx * (bh / 2);
  const cy = sy + ny * (bh / 2);
  const rot = -th;
  // rope / spring endpoints
  const topX = x1;
  const topY = y1;
  const blockTop = { x: sx + ux * (bw / 2) + nx * (bh / 2), y: sy + uy * (bw / 2) + ny * (bh / 2) };
  const blockBottom = { x: sx - ux * (bw / 2) + nx * (bh / 2), y: sy - uy * (bw / 2) + ny * (bh / 2) };
  const ticks = [];
  if (spec.rough) {
    for (let d = 0; d < runEff / ux; d += 12) {
      const px = x0 + ux * d;
      const py = y0 + uy * d;
      ticks.push(<line key={d} x1={px} y1={py} x2={px - nx * 7 + ux * -3} y2={py - ny * 7 + uy * -3} stroke={C.muted} strokeWidth={1} />);
    }
  }
  return (
    <Svg w={W} h={H} label="Block on an incline">
      <polygon points={`${x0},${y0} ${x1},${y0} ${x1},${y1}`} fill="none" stroke={C.stroke} strokeWidth={2} />
      {ticks}
      <AngleArc cx={x0} cy={y0} r={30} startDeg={0} endDeg={th} />
      <Label x={x0 + 44} y={y0 + 14} size={12} anchor="start">{spec.hideNumbers ? "θ" : `θ = ${spec.angleDeg}°`}</Label>
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
        {spec.massLabel && (
          <Label x={cx} y={cy} size={12}>
            {spec.massLabel}
          </Label>
        )}
      </g>
      {spec.spring && (
        <g>
          <Spring x1={blockTop.x} y1={blockTop.y} x2={topX + nx * (bh / 2)} y2={topY + ny * (bh / 2)} coils={7} amp={5} />
          <line x1={topX + nx * (bh / 2) - nx * 10} y1={topY + ny * (bh / 2) - ny * 10} x2={topX + nx * (bh / 2) + nx * 10} y2={topY + ny * (bh / 2) + ny * 10} stroke={C.stroke} strokeWidth={3} />
          <Label x={(blockTop.x + topX) / 2 + nx * 18} y={(blockTop.y + topY) / 2 + ny * 18} size={12}>
            k
          </Label>
        </g>
      )}
      {spec.rope === "down" && (
        <g>
          <line x1={blockBottom.x} y1={blockBottom.y} x2={blockBottom.x - ux * 55} y2={blockBottom.y - uy * 55} stroke={C.stroke} strokeWidth={1.5} />
          <Arrow x1={blockBottom.x - ux * 30} y1={blockBottom.y - uy * 30} x2={blockBottom.x - ux * 70} y2={blockBottom.y - uy * 70} label="T" />
        </g>
      )}
      {spec.rope === "up" && (
        <g>
          <line x1={blockTop.x} y1={blockTop.y} x2={blockTop.x + ux * 55} y2={blockTop.y + uy * 55} stroke={C.stroke} strokeWidth={1.5} />
          <Arrow x1={blockTop.x + ux * 30} y1={blockTop.y + uy * 30} x2={blockTop.x + ux * 70} y2={blockTop.y + uy * 70} label="T" />
        </g>
      )}
      {spec.motion && (
        <Arrow
          x1={cx + nx * 34}
          y1={cy + ny * 34}
          x2={cx + nx * 34 + (spec.motion === "up" ? 1 : -1) * ux * 40}
          y2={cy + ny * 34 + (spec.motion === "up" ? 1 : -1) * uy * 40}
          color={C.motion}
          label={spec.motion === "up" ? "a" : "a"}
          width={2}
        />
      )}
      {spec.rough && (
        <Label x={x1 - 4} y={y0 + 16} color={C.muted} size={12} anchor="end">
          rough (μ)
        </Label>
      )}
      {spec.caption && (
        <Label x={W / 2} y={H - 8} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}
