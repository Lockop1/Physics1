import type { DiagramSpec } from "./types";
import { CircleDiagram } from "./CircleDiagram";
import { BlockForceDiagram } from "./BlockForceDiagram";
import { InclineDiagram } from "./InclineDiagram";
import { PulleyDiagram } from "./PulleyDiagram";
import { CablesDiagram } from "./CablesDiagram";
import { VerticalBoxDiagram } from "./VerticalBoxDiagram";
import { LoopDiagram, FlatCurveDiagram, BankedDiagram, ConicalDiagram, OrbitDiagram } from "./CircularDynamicsDiagrams";
import { WorkAngleDiagram, WorkRankDiagram, FxGraphDiagram } from "./WorkDiagrams";
import { VectorsDiagram, ProjectileDiagram } from "./KinematicsDiagrams";

/** Replace numbers in every string prop (labels, captions) with a blank box. */
function scrub<T>(v: T): T {
  if (typeof v === "string") return v.replace(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g, "▢") as unknown as T;
  if (Array.isArray(v)) return v.map(scrub) as unknown as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = k === "kind" ? val : scrub(val);
    return out as T;
  }
  return v;
}

/** Dispatch a DiagramSpec to its SVG component. `hideNumbers` blanks numeric labels (geometry stays to scale). */
export function Diagram({ spec: raw, hideNumbers = false }: { spec: DiagramSpec; hideNumbers?: boolean }) {
  const spec: DiagramSpec = hideNumbers ? { ...scrub(raw), hideNumbers: true } : raw;
  switch (spec.kind) {
    case "circle":
      return <CircleDiagram spec={spec} />;
    case "block-force":
      return <BlockForceDiagram spec={spec} />;
    case "incline":
      return <InclineDiagram spec={spec} />;
    case "pulley":
      return <PulleyDiagram spec={spec} />;
    case "cables":
      return <CablesDiagram spec={spec} />;
    case "vertical-box":
      return <VerticalBoxDiagram spec={spec} />;
    case "loop":
      return <LoopDiagram spec={spec} />;
    case "flat-curve":
      return <FlatCurveDiagram spec={spec} />;
    case "banked":
      return <BankedDiagram spec={spec} />;
    case "conical":
      return <ConicalDiagram spec={spec} />;
    case "orbit":
      return <OrbitDiagram spec={spec} />;
    case "work-angle":
      return <WorkAngleDiagram spec={spec} />;
    case "work-rank":
      return <WorkRankDiagram spec={spec} />;
    case "fx-graph":
      return <FxGraphDiagram spec={spec} />;
    case "vectors":
      return <VectorsDiagram spec={spec} />;
    case "projectile":
      return <ProjectileDiagram spec={spec} />;
  }
}
