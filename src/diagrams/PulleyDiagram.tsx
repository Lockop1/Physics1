import type { PulleyDiagramSpec } from "./types";
import { Arrow, Ground, Label, Svg, C } from "./primitives";

const W = 340;
const H = 220;

export function PulleyDiagram({ spec }: { spec: PulleyDiagramSpec }) {
  if (spec.atwood) {
    const px = 150;
    const py = 40;
    const r = 18;
    return (
      <Svg w={W} h={H} label="Atwood machine">
        <line x1={px} y1={10} x2={px} y2={py - r} stroke={C.stroke} strokeWidth={2} />
        <line x1={px - 30} y1={10} x2={px + 30} y2={10} stroke={C.stroke} strokeWidth={3} />
        <circle cx={px} cy={py} r={r} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
        <circle cx={px} cy={py} r={2} fill={C.stroke} />
        <line x1={px - r} y1={py} x2={px - r} y2={130} stroke={C.stroke} strokeWidth={1.5} />
        <line x1={px + r} y1={py} x2={px + r} y2={100} stroke={C.stroke} strokeWidth={1.5} />
        <rect x={px - r - 22} y={130} width={44} height={44} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
        <rect x={px + r - 18} y={100} width={36} height={36} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
        <Label x={px - r} y={152} size={12}>
          {spec.m1Label}
        </Label>
        <Label x={px + r} y={118} size={12}>
          {spec.m2Label}
        </Label>
        {spec.caption && (
          <Label x={W / 2} y={H - 8} color={C.muted} size={12}>
            {spec.caption}
          </Label>
        )}
      </Svg>
    );
  }
  const tableY = 110;
  const tableX1 = 16;
  const tableX2 = 206;
  const pr = 14;
  const px = tableX2 + 2;
  const py = tableY - pr;
  const bw = 54;
  const bh = 40;
  const bx = 90;
  const hangX = px + pr;
  const hangTop = py + 8;
  const hangH = 60;
  const floorY = 200;
  return (
    <Svg w={W} h={H} label="Block on a table connected over a pulley to a hanging mass">
      <Ground x1={tableX1} x2={tableX2} y={tableY} rough={spec.rough} />
      <line x1={tableX1 + 20} y1={tableY} x2={tableX1 + 20} y2={floorY} stroke={C.muted} strokeWidth={2} />
      <line x1={tableX2 - 20} y1={tableY} x2={tableX2 - 20} y2={floorY} stroke={C.muted} strokeWidth={2} />
      <rect x={bx} y={tableY - bh} width={bw} height={bh} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      <Label x={bx + bw / 2} y={tableY - bh / 2} size={12}>
        {spec.m1Label}
      </Label>
      {/* rope: block → pulley top → down */}
      <line x1={bx + bw} y1={tableY - bh / 2} x2={px} y2={tableY - bh / 2} stroke={C.stroke} strokeWidth={1.5} />
      <circle cx={px} cy={py} r={pr} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      <circle cx={px} cy={py} r={2} fill={C.stroke} />
      <path d={`M ${px} ${py - pr} A ${pr} ${pr} 0 0 1 ${px + pr} ${py}`} fill="none" stroke={C.stroke} strokeWidth={1.5} />
      <line x1={hangX} y1={py} x2={hangX} y2={hangTop + hangH} stroke={C.stroke} strokeWidth={1.5} />
      <rect x={hangX - 24} y={hangTop + hangH} width={48} height={36} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      <Label x={hangX} y={hangTop + hangH + 18} size={12}>
        {spec.m2Label}
      </Label>
      <Ground x1={tableX1} x2={W - 10} y={floorY} />
      {spec.heightLabel && (
        <g>
          <Arrow x1={hangX + 30} y1={hangTop + hangH + 36} x2={hangX + 30} y2={floorY - 2} color={C.muted} width={1.5} labelOffset={0} />
          <Label x={hangX + 36} y={(hangTop + hangH + 36 + floorY) / 2} size={11} color={C.muted} anchor="start">
            {spec.heightLabel}
          </Label>
        </g>
      )}
      {spec.rough && (
        <Label x={bx + bw / 2} y={tableY + 18} color={C.muted} size={12}>
          rough (μ)
        </Label>
      )}
      {spec.caption && (
        <Label x={W / 2} y={H - 4} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}
