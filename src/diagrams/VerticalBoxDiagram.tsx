import type { VerticalBoxDiagramSpec } from "./types";
import { Arrow, Label, Svg, C } from "./primitives";

const W = 240;
const H = 220;

export function VerticalBoxDiagram({ spec }: { spec: VerticalBoxDiagramSpec }) {
  const cx = 110;
  const bw = 56;
  const bh = 46;
  const by = spec.mode === "hanging" ? 100 : 120;
  const cy = by + bh / 2;
  const forceLabel = spec.forceLabel ?? (spec.mode === "hanging" ? "T" : spec.mode === "elevator" ? "N" : "F");
  return (
    <Svg w={W} h={H} label="Box with vertical forces">
      {spec.mode === "elevator" && (
        <g>
          <rect x={30} y={20} width={160} height={180} fill="none" stroke={C.muted} strokeWidth={2} />
          <line x1={30} y1={by + bh} x2={190} y2={by + bh} stroke={C.stroke} strokeWidth={2} />
          <Label x={110} y={32} color={C.muted} size={11}>
            elevator
          </Label>
        </g>
      )}
      {spec.mode === "hanging" && (
        <g>
          <line x1={40} y1={30} x2={180} y2={30} stroke={C.stroke} strokeWidth={3} />
          <line x1={cx} y1={30} x2={cx} y2={by} stroke={C.stroke} strokeWidth={1.8} />
        </g>
      )}
      {spec.mode === "pushed-up" && <Arrow x1={cx} y1={by + bh + 50} x2={cx} y2={by + bh + 4} label={forceLabel} labelOffset={-62} />}
      <rect x={cx - bw / 2} y={by} width={bw} height={bh} fill={C.fill} stroke={C.stroke} strokeWidth={2} />
      {spec.massLabel && (
        <Label x={cx} y={cy} size={12}>
          {spec.massLabel}
        </Label>
      )}
      {spec.mode !== "pushed-up" && <Arrow x1={cx} y1={by} x2={cx} y2={by - 52} label={forceLabel} />}
      <Arrow x1={cx} y1={by + bh} x2={cx} y2={by + bh + 44} color={C.motion} label="mg" />
      {spec.accel && spec.accel !== "none" && (
        <g>
          <Arrow x1={cx + 60} y1={cy + (spec.accel === "up" ? 22 : -22)} x2={cx + 60} y2={cy + (spec.accel === "up" ? -22 : 22)} color={C.muted} label="a" width={2} />
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
