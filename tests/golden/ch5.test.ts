/**
 * Golden tests for Ch 5 / Ch 6a: the lecture's and reviews' ORIGINAL numbers → their published answers (±2%).
 */
import { describe, it, expect } from "vitest";
import { solve as solveTwoForces } from "../../src/content/templates/ch5-newton/twoForcesAngles";
import { solve as solvePushedUp } from "../../src/content/templates/ch5-newton/pushedUp";
import { solve as solveNormal } from "../../src/content/templates/ch5-newton/normalForce";
import { solve as solveCables } from "../../src/content/templates/ch5-newton/twoCables";
import { solve as solveHanging } from "../../src/content/templates/ch5-newton/elevatorTension";
import { solve as solveAngledFriction, template as angledFrictionTemplate } from "../../src/content/templates/ch5-newton/angledForceFriction";
import { solve as solveCabinet } from "../../src/content/templates/ch5-newton/cabinetPush";
import { muFromAngle, angleFromMu } from "../../src/content/templates/ch5-newton/criticalAngle";
import { solve as solveSliding } from "../../src/content/templates/ch5-newton/slidingIncline";
import { solve as solveTablePulley } from "../../src/content/templates/ch5-newton/tablePulley";
import { solve as solveTableFriction } from "../../src/content/templates/ch5-newton/tablePulleyFriction";
import { solve as solveHooke } from "../../src/content/templates/ch5-newton/hookeBasics";
import { solve as solveSpringIncline } from "../../src/content/templates/ch5-newton/springIncline";
import { solve as solveSpringRope } from "../../src/content/templates/ch5-newton/springRopeIncline";
import { solve as solveMassWeight } from "../../src/content/templates/ch5-newton/massVsWeight";
import { createRng } from "../../src/engine/rng";
import { CHAPTERS } from "../../src/content/topics";
import { templatesForTopic } from "../../src/content/templates";
import { g } from "../../src/content/constants";

const closeTo = (actual: number, expected: number, rel = 0.02) =>
  expect(Math.abs(actual - expected) / Math.abs(expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(rel);

describe("Ch 5 golden values", () => {
  it("lecture Q40: 30.0 kg, 30.0 N horizontal + 30.0 N at 30° → 1.87 m/s²", () => {
    closeTo(solveTwoForces({ m: 30, F1: 30, theta1: 0, F2: 30, theta2: 30 }).a, 1.87);
  });
  it("pushed up: 2.00 kg, 25.0 N → 2.70 m/s²", () => {
    closeTo(solvePushedUp({ m: 2, F: 25 }).a, 2.7);
  });
  it("chandelier: 20 kg at rest → T = 196 N", () => {
    closeTo(solveHanging({ m: 20, ay: 0 }).T, 196);
  });
  it("fish in elevator: 40.0 N fish, a = ±2.00 m/s² → 48.2 N / 31.8 N", () => {
    const m = 40 / g;
    closeTo(solveHanging({ m, ay: 2 }).T, 48.2);
    closeTo(solveHanging({ m, ay: -2 }).T, 31.8);
    closeTo(solveNormal({ kind: "elevator-up", m, a: 2 }).N, 48.2);
    closeTo(solveNormal({ kind: "elevator-down", m, a: 2 }).N, 31.8);
  });
  it("normal force cases reduce to mg cos θ / mg ± F sin θ", () => {
    closeTo(solveNormal({ kind: "incline", m: 10, theta: 60 }).N, 49);
    closeTo(solveNormal({ kind: "push-down", m: 10, F: 20, theta: 30 }).N, 108);
    closeTo(solveNormal({ kind: "pull-up", m: 10, F: 20, theta: 30 }).N, 88);
  });
  it("traffic light (Ch 6a lecture): 122 N, 37.0°/53.0° → T1 = 73.4 N, T2 = 97.4 N", () => {
    const s = solveCables({ W: 122, theta1: 37, theta2: 53 });
    closeTo(s.T1, 73.4);
    closeTo(s.T2, 97.4);
    closeTo(s.T3, 122);
  });
  it("SI Q21: 50.0 kg, cables 41° and 73° from ceiling → T3 = 490 N, T1 ≈ 157 N, T2 ≈ 405 N", () => {
    const s = solveCables({ W: 50 * g, theta1: 41, theta2: 73 });
    closeTo(s.T3, 490);
    closeTo(s.T1, 157);
    closeTo(s.T2, 405);
  });
  it("two cables, one horizontal (lecture Example 3a): 100 N ball, angled cable at 30° → 200 N", () => {
    closeTo(solveCables({ W: 100, theta1: 0, theta2: 30 }).T2, 200);
  });
  it("SI Q20: 7.0 kg, 18 N at 25° below, μs 0.55, μk 0.15 → static holds, a = 0", () => {
    const s = solveAngledFriction({ m: 7, F: 18, theta: 25, below: true, mus: 0.55, muk: 0.15 });
    expect(s.holds).toBe(true);
    expect(s.a).toBe(0);
    closeTo(s.fsMax, 41.9);
    closeTo(s.Fpar, 16.3);
  });
  it("cabinet (Ch 6a lecture iii): 75.0 kg, 200 N at 25°, μs 0.40 → push = 79.0 N", () => {
    closeTo(solveCabinet({ m: 75, Fpull: 200, theta: 25, mus: 0.4 }).Fpush, 79.0);
  });
  it("critical angle: 20.0° → μs = 0.364; SI Q22: μs = 0.35 → 19.3°", () => {
    closeTo(muFromAngle(20), 0.364);
    closeTo(angleFromMu(0.35), 19.3);
  });
  it("Runway: frictionless incline a = g sin θ", () => {
    closeTo(solveSliding({ theta: 30, muk: 0, d: 10 }).a, g * 0.5);
    closeTo(solveSliding({ theta: 30, muk: 0, d: 10 }).v, Math.sqrt(2 * g * 10 * 0.5));
  });
  it("table + hanging (frictionless): 4.00 kg / 1.00 kg → a = 1.96, T = 7.84, v after 1.00 m = 1.98", () => {
    const s = solveTablePulley({ m1: 4, m2: 1, h: 1 });
    closeTo(s.a, 1.96);
    closeTo(s.T, 7.84);
    closeTo(s.v, 1.98);
  });
  it("SI Q24: 5.00 kg / 1.50 kg → μs = 0.300; μk = 0.10 → a = 1.51, T = 12.4; lecture ii: 4/1 kg μk 0.2 → 0.392", () => {
    const s = solveTableFriction({ m1: 5, m2: 1.5, muk: 0.1 });
    closeTo(s.musMin, 0.3);
    closeTo(s.a, 1.51);
    closeTo(s.T, 12.4);
    closeTo(solveTableFriction({ m1: 4, m2: 1, muk: 0.2 }).a, 0.392);
  });
  it("Hooke: k = 50 N/m, x = 1 cm → 0.5 N", () => {
    closeTo(solveHooke({ k: 50, xM: 0.01 }).F, 0.5);
  });
  it("spring on incline: 30.0 kg, 60°, 5.0 cm → k ≈ 5.09 × 10³ N/m", () => {
    closeTo(solveSpringIncline({ m: 30, theta: 60, xM: 0.05 }).k, 5090);
  });
  it("spring + rope: 10.0 kg, 30°, 330 N/m, T = 50.0 N down-slope → 0.30 m; SI Q23: 17.5 kg, 25°, 450, 75.0 → 0.328 m", () => {
    closeTo(solveSpringRope({ m: 10, theta: 30, k: 330, T: 50, ropeDown: true }).x, 0.3);
    closeTo(solveSpringRope({ m: 17.5, theta: 25, k: 450, T: 75, ropeDown: true }).x, 0.328);
  });
  it("mass vs weight: 20 kg → 196 N; Moon ≈ 1/6", () => {
    closeTo(solveMassWeight({ m: 20, gLocal: g }).W, 196);
    closeTo(solveMassWeight({ m: 20, gLocal: 1.62 }).W, 32.4);
  });
});

describe("Ch 5 structural requirements", () => {
  it("angled-force friction template produces both 'static holds' and 'slides' cases over 300 seeds", () => {
    let holds = 0;
    let slides = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const q = angledFrictionTemplate.generate(createRng(seed));
      if (q.answer === 0) holds++;
      else slides++;
    }
    expect(holds).toBeGreaterThan(30);
    expect(slides).toBeGreaterThan(30);
  });
  it("every Ch 5 topic has at least 3 templates", () => {
    const ch5 = CHAPTERS.find((c) => c.id === "ch5")!;
    for (const t of ch5.topics) {
      expect(templatesForTopic(t.id).length, t.id).toBeGreaterThanOrEqual(3);
    }
  });
});
