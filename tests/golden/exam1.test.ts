/** Golden tests for Exam 1 material: Ch 1–4 lecture numbers → published answers (±2%). */
import { describe, it, expect } from "vitest";
import { solve as comps } from "../../src/content/templates/exam1/vectorComponents";
import { solve as vadd } from "../../src/content/templates/exam1/vectorAdd";
import { toMs } from "../../src/content/templates/exam1/speedConversion";
import { toKgM3 } from "../../src/content/templates/exam1/densityConversion";
import { convertLength } from "../../src/content/templates/exam1/lengthAreaVolume";
import { solve as multi } from "../../src/content/templates/exam1/multiPhase";
import { solve as chase } from "../../src/content/templates/exam1/chase";
import { x, v, solve as poly } from "../../src/content/templates/exam1/positionFunction";
import { solveR, solveV } from "../../src/content/templates/exam1/vectorFunction";
import { solve as turning } from "../../src/content/templates/exam1/turningPoint";
import { integrate, template as vtTemplate } from "../../src/content/templates/exam1/vtGraph";
import { solve as acc2d } from "../../src/content/templates/exam1/constantAccel2D";
import { solve as trip } from "../../src/content/templates/exam1/avgVelocity2D";
import { solve as dispVec } from "../../src/content/templates/exam1/displacementVector";
import { solve as drop } from "../../src/content/templates/exam1/dropFromHeight";
import { solve as thrown } from "../../src/content/templates/exam1/thrownUp";
import { solve as cliffUD } from "../../src/content/templates/exam1/cliffUpDown";
import { solve as range } from "../../src/content/templates/exam1/rangeHeight";
import { solve as horiz } from "../../src/content/templates/exam1/horizontalLaunch";
import { solve as cliff } from "../../src/content/templates/exam1/cliffLaunch";
import { createRng } from "../../src/engine/rng";
import { CHAPTERS } from "../../src/content/topics";
import { templatesForTopic } from "../../src/content/templates";
import { g } from "../../src/content/constants";

const closeTo = (actual: number, expected: number, rel = 0.02) =>
  expect(Math.abs(actual - expected) / Math.abs(expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(rel);

describe("Exam 1 golden values — units & vectors (Ch 1–2)", () => {
  it("120 km/h → 33.3 m/s; 85.0 mi/h → 137 km/h; 33.0 m/s → 73.8 mi/h; 15.0 in → 38.1 cm; lead 11.35 g/cm³ → 11 350 kg/m³", () => {
    closeTo(toMs(120, "km/h"), 33.3);
    closeTo(85 * 1.609, 137);
    closeTo((33 * 3600) / 1609, 73.8);
    closeTo(convertLength(15, "in") * 100, 38.1);
    closeTo(toKgM3(11.35, "g/cm3"), 11350);
    expect(convertLength(38, "km")).toBe(38000);
  });
  it("C = 12.0 units at 60° below +x → (6.00, −10.4)", () => {
    const s = comps({ A: 12, theta: -60, ref: "+x" });
    closeTo(s.Ax, 6);
    closeTo(s.Ay, -10.4);
  });
  it("(2,2) + (2,−4) → 4.5 units at −27.0° (333°); (3,2) + (−5,4) = (−2,6)", () => {
    const s = vadd({ ax: 2, ay: 2, bx: 2, by: -4, op: "add" });
    closeTo(s.R, 4.47);
    closeTo(s.thetaDeg, 333.4);
    const t = vadd({ ax: 3, ay: 2, bx: -5, by: 4, op: "add" });
    expect(t.rx).toBe(-2);
    expect(t.ry).toBe(6);
  });
});

describe("Exam 1 golden values — 1D kinematics (Ch 3)", () => {
  it("#58 freight train: 28.0 m/s; 50.9 s; 7680 m and 713 m", () => {
    const s = multi({ v0: 4, a1: 0.05, tMin: 8, a2: 0.55 });
    closeTo(s.v, 28);
    closeTo(s.t2, 50.9);
    closeTo(s.x1, 7680);
    closeTo(s.x2, 713);
  });
  it("trooper: 45.0 m/s, 1.00 s head start, 3.00 m/s² → 31.0 s; #96 Jacob: 50 m, 0.050 m/s² → 44.7 s (≈45), 184 m, 5.2 m/s", () => {
    closeTo(chase({ kind: "time-head-start", v: 45, a: 3, headStart: 1 }).t, 31.0);
    const j = chase({ kind: "distance-head-start", v: 3, a: 0.05, headStart: 50 });
    closeTo(j.t, 44.7);
    closeTo(j.x, 184);
    closeTo(j.vf, 5.24);
  });
  it("#35 x = 10t − 2t²: v(2) = 2, v(4) = −6, v̄(2→4) = −2; #27 x = 4 − 2t crosses at t = 2 with Δx(3→6) = −6; Example 3.4 x = 3t − 3t²: v = 0 at 0.5 s, x = 0.75", () => {
    const c = [0, 10, -2];
    expect(v(c, 2)).toBe(2);
    expect(v(c, 4)).toBe(-6);
    expect(poly({ c, t1: 2, t2: 4 }).vAvg).toBe(-2);
    expect(x([4, -2], 2)).toBe(0);
    expect(x([4, -2], 6) - x([4, -2], 3)).toBe(-6);
    const tp = turning({ c0: 0, c1: 3, c2: 3 });
    closeTo(tp.tStop, 0.5);
    closeTo(tp.xMax, 0.75);
    closeTo(tp.tCross, 1.0);
  });
  it("Example 5: drop 13.5 m → 1.66 s, −16.3 m/s; Example 6: 20.0 m/s up from 50.0 m → 2.04 s, 20.4 m, −29.0 m/s and −22.5 m at 5.00 s", () => {
    const d = drop({ h: 13.5, gLocal: g });
    closeTo(d.t, 1.66);
    closeTo(d.v, -16.3);
    const s = thrown({ v0: 20, H: 50, t: 5 });
    closeTo(s.tTop, 2.04);
    closeTo(s.hMax, 20.4);
    closeTo(s.vAt, -29.0);
    closeTo(s.yAt, -22.5);
    closeTo(cliffUD({ v0: 20, H: 50 }).vLand, Math.sqrt(400 + 2 * g * 50));
  });
});

describe("Exam 1 golden values — 2D motion (Ch 4)", () => {
  it("Example 4.3: r = 2t² i + (2 + 3t) j → v(2) = (8, 3); Example 4.4: v = 5t i + t² j → a(2) = (5, 4)", () => {
    const r = solveR({ rx: [0, 0, 2], ry: [2, 3, 0], t: 2 });
    expect(r.vx).toBe(8);
    expect(r.vy).toBe(3);
    const a = solveV({ vx: [0, 5, 0], vy: [0, 0, 1], t: 2 });
    expect(a.ax).toBe(5);
    expect(a.ay).toBe(4);
  });
  it("Example 1 plane: v0 = (20, −15), a = (4, 0), t = 5 → 43 m/s at −21° (339°); #28 boat → v = (22, 1), r = (120, 10)", () => {
    const s = acc2d({ v0x: 20, v0y: -15, ax: 4, ay: 0, t: 5 });
    closeTo(s.speed, 42.7);
    closeTo(s.thetaDeg, 339.4);
    const b = acc2d({ v0x: 2, v0y: 1, ax: 2, ay: 0, t: 10 });
    expect(b.vx).toBe(22);
    expect(b.x).toBe(120);
    expect(b.y).toBe(10);
  });
  it("boat trip 80 km N, 60 km E, 1 h → 1.00e5 m; 38.9 m/s; 27.8 m/s; 53.1° N of E; #20 bird 95 km at 45° for 3 h → 8.80 m/s", () => {
    const s = trip({ dNorth: 80, dEast: 60, hours: 1 });
    closeTo(s.disp, 1e5);
    closeTo(s.avgSpeed, 38.9);
    closeTo(s.avgVel, 27.8);
    closeTo(s.angleNofE, 53.1);
    closeTo(dispVec({ d: 95, deg: 45, hours: 3 }).vavg, 8.8);
    closeTo(dispVec({ d: 95, deg: 45, hours: 3 }).x, 67200);
  });
  it("long jumper 11.0 m/s at 20.0° → 7.94 m, 0.722 m; firework 70.0 m/s at 75.0° → 233 m, 6.90 s", () => {
    const s = range({ v0: 11, theta: 20, gLocal: g });
    closeTo(s.R, 7.94);
    closeTo(s.h, 0.722);
    const f = range({ v0: 70, theta: 75, gLocal: g });
    closeTo(f.h, 233);
    closeTo(f.tTop, 6.9);
  });
  it("#36 crate: 500 km/h at 800 m → ≈1779 m; Waymo: 20.0 m cliff, 30.0 m out → 2.02 s, 14.8 m/s, 24.8 m/s", () => {
    closeTo(horiz({ v0: 500 / 3.6, h: 800 }).x, 1779, 0.01);
    const t = Math.sqrt((2 * 20) / g);
    closeTo(t, 2.02);
    const w = horiz({ v0: 30 / t, h: 20 });
    closeTo(30 / t, 14.8);
    closeTo(w.v, 24.8);
  });
  it("stone 20.0 m/s at 30° from 45.0 m → 4.22 s, 35.8 m/s; Kilauea 25 m/s at 35° from 20 m → 3.96 s, 31.9 m/s at −50°; #46 agent clears? no (54 m < 60 m)", () => {
    const s = cliff({ v0: 20, theta: 30, H: 45 });
    closeTo(s.t, 4.22);
    closeTo(s.v, 35.8);
    const k = cliff({ v0: 25, theta: 35, H: 20 });
    closeTo(k.t, 3.96);
    closeTo(k.v, 31.9);
    closeTo(k.angleBelow, 50.0);
    const a = cliff({ v0: 16.68, theta: -30, H: 100 });
    closeTo(a.t, 3.75);
    expect(a.x).toBeLessThan(60);
  });
});

describe("Exam 1 structural requirements", () => {
  it("every Exam 1 topic has ≥ 3 templates", () => {
    for (const ch of CHAPTERS.filter((c) => c.exam === "exam1")) {
      for (const t of ch.topics) expect(templatesForTopic(t.id).length, t.id).toBeGreaterThanOrEqual(3);
    }
  });
  it("v–t graph: displacement and distance match an independent fine Riemann sum over 300 seeds", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const q = vtTemplate.generate(createRng(seed));
      const d = q.diagram;
      if (!d || d.kind !== "fx-graph") throw new Error("expected graph");
      const pts = d.points.map((p) => ({ t: p.x, v: p.F }));
      const tEnd = pts[pts.length - 1]!.t;
      const vAt = (t: number) => {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i]!;
          const b = pts[i + 1]!;
          if (t >= a.t && t <= b.t) return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t);
        }
        return 0;
      };
      const n = 40000;
      const h = tEnd / n;
      let disp = 0;
      let dist = 0;
      for (let i = 0; i < n; i++) {
        const vv = vAt((i + 0.5) * h);
        disp += vv * h;
        dist += Math.abs(vv) * h;
      }
      const parts = q.parts!;
      expect(Math.abs(disp - (parts[0]!.answer as number)) / Math.abs(parts[0]!.answer as number)).toBeLessThan(0.01);
      expect(Math.abs(dist - (parts[1]!.answer as number)) / Math.abs(parts[1]!.answer as number)).toBeLessThan(0.01);
      const ex = integrate(pts, 0, tEnd);
      expect(Math.abs(ex.displacement - disp)).toBeLessThan(0.05);
    }
  });
});
