/**
 * Discriminated union of every diagram the renderer knows how to draw.
 * Templates emit one of these; src/diagrams/Diagram.tsx dispatches on `kind`.
 */
export type DiagramSpec = CircleDiagramSpec;

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
