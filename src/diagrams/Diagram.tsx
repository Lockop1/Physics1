import type { DiagramSpec } from "./types";
import { CircleDiagram } from "./CircleDiagram";

/** Dispatch a DiagramSpec to its SVG component. */
export function Diagram({ spec }: { spec: DiagramSpec }) {
  switch (spec.kind) {
    case "circle":
      return <CircleDiagram spec={spec} />;
  }
}
