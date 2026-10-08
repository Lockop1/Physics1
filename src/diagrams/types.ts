/**
 * Discriminated union of every diagram the renderer knows how to draw.
 * Templates emit one of these; src/diagrams/Diagram.tsx dispatches on `kind`.
 */
export type DiagramSpec =
  | CircleDiagramSpec
  | BlockForceDiagramSpec
  | InclineDiagramSpec
  | PulleyDiagramSpec
  | CablesDiagramSpec
  | VerticalBoxDiagramSpec
  | LoopDiagramSpec
  | FlatCurveDiagramSpec
  | BankedDiagramSpec
  | ConicalDiagramSpec
  | OrbitDiagramSpec
  | WorkAngleDiagramSpec
  | WorkRankDiagramSpec
  | FxGraphDiagramSpec;

/** Vertical circle (loop / Ferris wheel) with a marked point and its forces. */
export interface LoopDiagramSpec {
  kind: "loop";
  point: "top" | "bottom" | "both";
  radiusLabel?: string;
  /** Label for the contact force: "N" (seat) or "T" (string). */
  forceLabel?: string;
  /** At the top, draw the contact force pointing UP (seat under the rider, Ferris wheel) instead of toward the center. */
  topContactUp?: boolean;
  showForces?: boolean;
  caption?: string;
}

/** Overhead view of a car on a flat curve. */
export interface FlatCurveDiagramSpec {
  kind: "flat-curve";
  radiusLabel?: string;
  caption?: string;
}

/** Cross-section of a banked road with a car. */
export interface BankedDiagramSpec {
  kind: "banked";
  angleDeg: number;
  showForces?: boolean;
  caption?: string;
}

/** Conical pendulum: string at angle from the vertical. */
export interface ConicalDiagramSpec {
  kind: "conical";
  angleDeg: number; // from vertical
  /** Label the angle as measured from the horizontal instead. */
  fromHorizontal?: boolean;
  lengthLabel?: string;
  showForces?: boolean;
  caption?: string;
}

/** Planet with a satellite orbit at altitude h. */
export interface OrbitDiagramSpec {
  kind: "orbit";
  altitudeLabel?: string;
  radiusLabel?: string;
  /** Hide the altitude and show just the orbit radius. */
  caption?: string;
}

/** A force at angle θ to a displacement. */
export interface WorkAngleDiagramSpec {
  kind: "work-angle";
  angleDeg: number; // angle between F and d (0–180)
  forceLabel?: string;
  caption?: string;
}

/** Four labelled panels with a force at different angles to a rightward displacement. */
export interface WorkRankDiagramSpec {
  kind: "work-rank";
  panels: { label: string; angleDeg: number }[];
}

/** Piecewise-linear F–x graph with a highlighted interval. */
export interface FxGraphDiagramSpec {
  kind: "fx-graph";
  points: { x: number; F: number }[];
  from?: number;
  to?: number;
  xUnit?: string;
  fUnit?: string;
}

/** A force arrow applied to a block: angle in degrees, 0 = +x, positive = above horizontal. */
export interface ForceArrow {
  label: string; // "F", "T", "F_1"
  angleDeg: number;
  /** Relative length 0.5–1.5 (default 1). */
  scale?: number;
}

/** Block on a flat surface with one or more applied forces. */
export interface BlockForceDiagramSpec {
  kind: "block-force";
  forces: ForceArrow[];
  /** Draw a rough-surface hatch and label μ. */
  rough?: boolean;
  massLabel?: string;
  /** Draw N and mg arrows too. */
  showNW?: boolean;
  caption?: string;
}

/** Block on an incline, angle drawn to scale. */
export interface InclineDiagramSpec {
  kind: "incline";
  angleDeg: number;
  /** Spring attached from the block to the top of the incline. */
  spring?: boolean;
  /** Rope attached to the block, pulling down-slope or up-slope. */
  rope?: "down" | "up";
  rough?: boolean;
  massLabel?: string;
  /** Arrow showing motion/acceleration direction along the slope. */
  motion?: "down" | "up";
  caption?: string;
}

/** Block on a table, rope over a pulley at the edge, hanging mass. */
export interface PulleyDiagramSpec {
  kind: "pulley";
  m1Label: string;
  m2Label: string;
  rough?: boolean;
  /** Label for the hanging height, e.g. "h = 1.00 m". */
  heightLabel?: string;
  /** Classic Atwood: both masses hang. */
  atwood?: boolean;
  caption?: string;
}

/** Object hanging from two cables. Angles are measured from the horizontal (ceiling). */
export interface CablesDiagramSpec {
  kind: "cables";
  leftAngleDeg: number; // from horizontal; 0 = horizontal cable
  rightAngleDeg: number;
  leftLabel: string;
  rightLabel: string;
  loadLabel: string;
  /** Label the angles as measured from the vertical instead (values still from horizontal). */
  anglesFromVertical?: boolean;
  caption?: string;
}

/** A box with vertical forces: hanging from a rope, standing in an elevator, or pushed up. */
export interface VerticalBoxDiagramSpec {
  kind: "vertical-box";
  mode: "hanging" | "elevator" | "pushed-up";
  accel?: "up" | "down" | "none";
  massLabel?: string;
  forceLabel?: string; // "T", "N", "F"
  caption?: string;
}

export interface CircleDiagramSpec {
  kind: "circle";
  /** Label for the radius line, e.g. "r = 10.0 cm" or "d = 200 m". */
  radiusLabel?: string;
  /** Draw the radius as a diameter line across the circle. */
  showDiameter?: boolean;
  /** Direction of motion. Omit for no motion arrow. */
  direction?: "cw" | "ccw";
  /** Angle (degrees, math convention, 0 = +x, CCW) of a marked point on the circle. */
  markAngleDeg?: number;
  /** Label for the marked point, e.g. "P". */
  markLabel?: string;
  /** Show the velocity arrow at the marked point. */
  showVelocity?: boolean;
  /** Show the centripetal acceleration arrow at the marked point. */
  showCentripetal?: boolean;
  /** Show a tangential acceleration arrow (opposing or along motion). */
  tangential?: "along" | "opposing";
  /** Arc from 0 to this angle (degrees), e.g. to illustrate s = rθ. */
  arcDeg?: number;
  arcLabel?: string;
  /** Optional caption below the figure. */
  caption?: string;
}
