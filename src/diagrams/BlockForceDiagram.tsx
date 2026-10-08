import type { BlockForceDiagramSpec } from "./types";
import { Arrow, Ground, Label, Svg, AngleArc, C } from "./primitives";

const W = 300;
const H = 190;
const GY = 140; // ground y
const BW = 60;
const BH = 44;
const BX = 110; // block left
const CX = BX + BW / 2;
const CY = GY - BH / 2;

export function BlockForceDiagram({ spec }: { spec: BlockForceDiagramSpec }) {
  return (
    <Svg w={W} h={H} label="Block with applied forces">
      <Ground x1={20} x2={W - 20} y={GY} rough={spec.rough} />
      <rect x={BX} y={GY - BH} width={BW} height={BH} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      {spec.massLabel && (
        <Label x={CX} y={CY}>
          {spec.massLabel}
        </Label>
      )}
      {spec.rough && (
        <Label x={W - 30} y={GY + 16} color={C.muted} size={12} anchor="end">
          rough (μ)
        </Label>
      )}
      {spec.forces.map((f, i) => {
        const L = 62 * (f.scale ?? 1);
        const a = (f.angleDeg * Math.PI) / 180;
        // start at the block edge on the side the force points away from (pull) — anchor at block center-right
        const right = Math.cos(a) >= 0;
        const sx = right ? BX + BW : BX;
        const sy = CY;
        const ex = sx + L * Math.cos(a);
        const ey = sy - L * Math.sin(a);
        const showArc = Math.abs(f.angleDeg) > 2 && Math.abs(f.angleDeg) < 178;
        return (
          <g key={i}>
            {showArc && <line x1={sx} y1={sy} x2={sx + (right ? 1 : -1) * 48} y2={sy} stroke={C.muted} strokeDasharray="3 3" />}
            {showArc && (
              <AngleArc cx={sx} cy={sy} r={26} startDeg={right ? 0 : 180} endDeg={right ? f.angleDeg : 180 - f.angleDeg} label="θ" />
            )}
            <Arrow x1={sx} y1={sy} x2={ex} y2={ey} label={f.label} />
          </g>
        );
      })}
      {spec.showNW && (
        <g>
          <Arrow x1={CX} y1={GY - BH} x2={CX} y2={GY - BH - 50} color={C.motion} label="N" />
          <Arrow x1={CX} y1={GY} x2={CX} y2={GY + 40} color={C.motion} label="mg" />
        </g>
      )}
      {spec.caption && (
        <Label x={W / 2} y={H - 8} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}
