/**
 * Golden tests: feed each Ch 4 solver the review's ORIGINAL numbers and check
 * the review's published answer (±2%, the app's own tolerance).
 */
import { describe, it, expect } from "vitest";
import { solve as solveRadDeg } from "../../src/content/templates/ch4-circular/radDeg";
import { solve as solveArc } from "../../src/content/templates/ch4-circular/arcLength";
import { solve as solveUcm } from "../../src/content/templates/ch4-circular/periodSpeedOmega";
import { solve as solveAc, omegaFromRpm, omegaFromPeriod } from "../../src/content/templates/ch4-circular/acRpm";
import { solve as solveNonUniform } from "../../src/content/templates/ch4-circular/nonUniform";
import { velocityDirection, centripetalDirection } from "../../src/content/templates/ch4-circular/direction";

const closeTo = (actual: number, expected: number, rel = 0.02) =>
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThanOrEqual(rel);

describe("Ch 4 golden values (Exam 2 review + SI review)", () => {
  it("45° = π/4 rad", () => {
    closeTo(solveRadDeg({ variant: "to-rad", input: 45 }), Math.PI / 4);
    closeTo(solveRadDeg({ variant: "to-deg", input: Math.PI / 4 }), 45);
  });

  it("arc length of a half revolution is πr", () => {
    const r = 2.5;
    closeTo(solveArc({ r, thetaRad: Math.PI }).s, Math.PI * r);
  });

  it("fan: 360 rev/min, r = 10.0 cm → a_c ≈ 142 m/s²", () => {
    const { ac } = solveAc({ r: 0.1, omega: omegaFromRpm(360) });
    closeTo(ac, 142);
  });

  it("SI Q25 fan: r = 36.0 cm, T = 0.221 s → ω = 28.4 rad/s, a_c ≈ 291 m/s² at tip", () => {
    const { omega } = solveUcm({ r: 0.36, T: 0.221 });
    closeTo(omega, 28.4);
    const { ac } = solveAc({ r: 0.36, omega: omegaFromPeriod(0.221) });
    closeTo(ac, 291);
    // at the center r = 0 → a_c = 0
    expect(solveAc({ r: 0, omega }).ac).toBe(0);
  });

  it("SI Q26 U-turn: diameter 200 m, v = 6.20 m/s, a_t = 2.20 m/s² → a = 2.23 m/s²", () => {
    const { a, r } = solveNonUniform({ d: 200, v: 6.2, at: 2.2 });
    expect(r).toBe(100);
    closeTo(a, 2.23);
  });

  it("direction: CCW at the top → velocity Left, a_c Down; CW at the right → velocity Down", () => {
    expect(velocityDirection({ angle: 90, sense: "ccw" })).toBe("Left");
    expect(centripetalDirection({ angle: 90, sense: "ccw" })).toBe("Down");
    expect(velocityDirection({ angle: 0, sense: "cw" })).toBe("Down");
    expect(centripetalDirection({ angle: 0, sense: "cw" })).toBe("Left");
    expect(velocityDirection({ angle: 270, sense: "ccw" })).toBe("Right");
    expect(velocityDirection({ angle: 180, sense: "cw" })).toBe("Up");
  });
});
