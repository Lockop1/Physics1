import { describe, it, expect } from "vitest";
import { sigFigsOf, decimalsOf, roundSig } from "../../src/content/templates/exam1/sigFigs";
import { solve as outBack } from "../../src/content/templates/exam1/outAndBack";
import { solve as chord } from "../../src/content/templates/exam1/chordDisplacement";
import { solve as terminal } from "../../src/content/templates/ch6-applications/terminalSpeed";
import { TRAPS } from "../../src/content/detective/traps";
import { TEMPLATES } from "../../src/content/templates";

const closeTo = (actual: number, expected: number, rel = 0.02) => expect(Math.abs(actual - expected) / Math.abs(expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(rel);

describe("Session 7 coverage additions", () => {
  it("sig figs: 1.500e3 → 4, 1.50e3 → 3, 2.3e-4 → 2, 0.00023 → 2; 12.71 × 3.46 → 44.0; 23.2 + 5.174 → 28.4", () => {
    expect(sigFigsOf("1.500 × 10^3")).toBe(4);
    expect(sigFigsOf("1.50 × 10^3")).toBe(3);
    expect(sigFigsOf("2.3 × 10^-4")).toBe(2);
    expect(sigFigsOf("0.00023")).toBe(2);
    expect(sigFigsOf("120.0")).toBe(4);
    expect(roundSig(12.71 * 3.46, 3)).toBe("44.0");
    expect((23.2 + 5.174).toFixed(Math.min(decimalsOf("23.2"), decimalsOf("5.174")))).toBe("28.4");
  });
  it("out and back: 100 m / 45 s then 25 m / 10 s → +1.36 m/s, 2.27 m/s", () => {
    const s = outBack({ d1: 100, t1: 45, d2: 25, t2: 10 });
    closeTo(s.vAvg, 1.36);
    closeTo(s.speedAvg, 2.27);
  });
  it("Example 4.1: satellite at 400 km, North Pole → −45° latitude (135° sweep) → chord 2r sin 67.5°", () => {
    const r = 6370 + 400;
    closeTo(chord({ r, sweepDeg: 135 }).chord, 2 * r * Math.sin((67.5 * Math.PI) / 180));
  });
  it("terminal speed: 75 kg skydiver, C = 1.0, A = 0.7 m² → ≈ 42 m/s", () => {
    closeTo(terminal({ m: 75, C: 1.0, A: 0.7 }).vt, 41.8);
  });
  it("coverage: template count ≥ 100 and ≥ 30 trap scenarios", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(100);
    expect(TRAPS.length).toBeGreaterThanOrEqual(30);
  });
});
