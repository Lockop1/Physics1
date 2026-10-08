import type { CablesDiagramSpec } from "./types";
import { Label, Svg, AngleArc, C } from "./primitives";

const W = 320;
const H = 200;

export function CablesDiagram({ spec }: { spec: CablesDiagramSpec }) {
  const ceilY = 30;
  const knot = { x: 160, y: 110 };
  const toRad = (d: number) => (d * Math.PI) / 180;
  // left cable goes up-left at leftAngle from horizontal; right goes up-right
  const la = toRad(Math.max(spec.leftAngleDeg, 0));
  const ra = toRad(Math.max(spec.rightAngleDeg, 0));
  const leftEnd = spec.leftAngleDeg < 3 ? { x: 20, y: knot.y } : { x: knot.x - (knot.y - ceilY) / Math.tan(la), y: ceilY };
  const rightEnd = spec.rightAngleDeg < 3 ? { x: W - 20, y: knot.y } : { x: knot.x + (knot.y - ceilY) / Math.tan(ra), y: ceilY };
  const clamp = (p: { x: number; y: number }) => {
    // if the cable would leave the frame, shorten it along its direction
    const minX = 14;
    const maxX = W - 14;
    if (p.x < minX) {
      const f = (knot.x - minX) / (knot.x - p.x);
      return { x: minX, y: knot.y + (p.y - knot.y) * f };
    }
    if (p.x > maxX) {
      const f = (maxX - knot.x) / (p.x - knot.x);
      return { x: maxX, y: knot.y + (p.y - knot.y) * f };
    }
    return p;
  };
  const L = clamp(leftEnd);
  const R = clamp(rightEnd);
  const leftLabelDeg = spec.anglesFromVertical ? 90 - spec.leftAngleDeg : spec.leftAngleDeg;
  const rightLabelDeg = spec.anglesFromVertical ? 90 - spec.rightAngleDeg : spec.rightAngleDeg;
  return (
    <Svg w={W} h={H} label="Object hanging from two cables">
      <line x1={10} y1={ceilY} x2={W - 10} y2={ceilY} stroke={C.stroke} strokeWidth={3} />
      {Array.from({ length: 15 }, (_, i) => (
        <line key={i} x1={14 + i * 21} y1={ceilY} x2={8 + i * 21} y2={ceilY - 8} stroke={C.muted} strokeWidth={1} />
      ))}
      <line x1={knot.x} y1={knot.y} x2={L.x} y2={L.y} stroke={C.stroke} strokeWidth={1.8} />
      <line x1={knot.x} y1={knot.y} x2={R.x} y2={R.y} stroke={C.stroke} strokeWidth={1.8} />
      <line x1={knot.x} y1={knot.y} x2={knot.x} y2={knot.y + 30} stroke={C.stroke} strokeWidth={1.8} />
      <circle cx={knot.x} cy={knot.y} r={3} fill={C.stroke} />
      <rect x={knot.x - 22} y={knot.y + 30} width={44} height={34} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      <Label x={knot.x} y={knot.y + 47} size={12}>
        {spec.loadLabel}
      </Label>
      {/* angle arcs at the ceiling attachment points (angles from horizontal) or at knot from vertical */}
      {spec.anglesFromVertical ? (
        <g>
          <line x1={knot.x} y1={knot.y} x2={knot.x} y2={knot.y - 50} stroke={C.muted} strokeDasharray="3 3" />
          <AngleArc cx={knot.x} cy={knot.y} r={30} startDeg={90} endDeg={90 + leftLabelDeg} label={`${leftLabelDeg}°`} />
          <AngleArc cx={knot.x} cy={knot.y} r={40} startDeg={90 - rightLabelDeg} endDeg={90} label={`${rightLabelDeg}°`} />
        </g>
      ) : (
        <g>
          {spec.leftAngleDeg >= 3 && <AngleArc cx={L.x} cy={L.y} r={28} startDeg={-spec.leftAngleDeg} endDeg={0} label={`${leftLabelDeg}°`} />}
          {spec.rightAngleDeg >= 3 && <AngleArc cx={R.x} cy={R.y} r={28} startDeg={180} endDeg={180 + spec.rightAngleDeg} label={`${rightLabelDeg}°`} />}
        </g>
      )}
      <Label x={(knot.x + L.x) / 2 - 12} y={(knot.y + L.y) / 2 + 12} size={13}>
        {spec.leftLabel}
      </Label>
      <Label x={(knot.x + R.x) / 2 + 12} y={(knot.y + R.y) / 2 + 12} size={13}>
        {spec.rightLabel}
      </Label>
      {spec.caption && (
        <Label x={W / 2} y={H - 8} color={C.muted} size={12}>
          {spec.caption}
        </Label>
      )}
    </Svg>
  );
}
