import type { DiagramSpec } from "./types";
import { CircleDiagram } from "./CircleDiagram";
import { BlockForceDiagram } from "./BlockForceDiagram";
import { InclineDiagram } from "./InclineDiagram";
import { PulleyDiagram } from "./PulleyDiagram";
import { CablesDiagram } from "./CablesDiagram";
import { VerticalBoxDiagram } from "./VerticalBoxDiagram";
import { LoopDiagram, FlatCurveDiagram, BankedDiagram, ConicalDiagram, OrbitDiagram } from "./CircularDynamicsDiagrams";
import { WorkAngleDiagram, WorkRankDiagram, FxGraphDiagram } from "./WorkDiagrams";

/** Dispatch a DiagramSpec to its SVG component. */
export function Diagram({ spec }: { spec: DiagramSpec }) {
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
  }
}
