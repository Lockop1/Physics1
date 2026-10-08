import type { DiagramSpec } from "./types";
import { CircleDiagram } from "./CircleDiagram";
import { BlockForceDiagram } from "./BlockForceDiagram";
import { InclineDiagram } from "./InclineDiagram";
import { PulleyDiagram } from "./PulleyDiagram";
import { CablesDiagram } from "./CablesDiagram";
import { VerticalBoxDiagram } from "./VerticalBoxDiagram";

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
  }
}
