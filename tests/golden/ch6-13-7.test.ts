/** Golden tests: Ch 6 / 13 / 7 lecture and review numbers → their published answers (±2%). */
import { describe, it, expect } from "vitest";
import { solve as seat } from "../../src/content/templates/ch6-applications/seatForce";
import { solve as vmin } from "../../src/content/templates/ch6-applications/minSpeedLoop";
import { solve as flat } from "../../src/content/templates/ch6-applications/flatCurve";
import { solve as fcCar } from "../../src/content/templates/ch6-applications/centripetalForceCar";
import { solve as banked, speedFor } from "../../src/content/templates/ch6-applications/bankedCurve";
import { solve as flatVsBanked } from "../../src/content/templates/ch6-applications/flatVsBanked";
import { solve as conical } from "../../src/content/templates/ch6-applications/conicalPendulum";
import { factorLabel } from "../../src/content/templates/ch13-gravitation/ratioConcept";
import { solve as gAlt } from "../../src/content/templates/ch13-gravitation/gAtAltitude";
import { solve as orbit } from "../../src/content/templates/ch13-gravitation/orbitSpeedPeriod";
import { solve as orbitOmega } from "../../src/content/templates/ch13-gravitation/orbitAngularSpeed";
import { solve as planetMass } from "../../src/content/templates/ch13-gravitation/planetMass";
import { solve as planetG } from "../../src/content/templates/ch13-gravitation/planetSurfaceG";
import { solve as workAngle } from "../../src/content/templates/ch7-work/workAngle";
import { solve as elevator } from "../../src/content/templates/ch7-work/elevatorWork";
import { solve as frictionWork } from "../../src/content/templates/ch7-work/frictionWork";
import { solve as dot } from "../../src/content/templates/ch7-work/dotProduct";
import { solve as inverseX } from "../../src/content/templates/ch7-work/inverseXForce";
import { solve as powerLaw } from "../../src/content/templates/ch7-work/powerLawForce";
import { areaUnder, generateGraph, template as graphTemplate } from "../../src/content/templates/ch7-work/fxGraphArea";
import { solve as springWork } from "../../src/content/templates/ch7-work/springWork";
import { solve as weSpeed } from "../../src/content/templates/ch7-work/workEnergySpeed";
import { solve as weVarying } from "../../src/content/templates/ch7-work/varyingForceSpeed";
import { solve as frictionPath } from "../../src/content/templates/ch7-work/frictionPath";
import { solve as powerAvg } from "../../src/content/templates/ch7-work/powerAverage";
import { solve as powerElev } from "../../src/content/templates/ch7-work/powerElevator";
import { createRng } from "../../src/engine/rng";
import { CHAPTERS } from "../../src/content/topics";
import { TEMPLATES, templatesForTopic } from "../../src/content/templates";
import { g } from "../../src/content/constants";

const closeTo = (actual: number, expected: number, rel = 0.02) =>
  expect(Math.abs(actual - expected) / Math.abs(expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(rel);

describe("Ch 6 golden values", () => {
  it("roller coaster #73: 40.0 kg, r 7.00, v 10.0 at top (inside loop) → 179 N; v_min 8.28", () => {
    closeTo(seat({ m: 40, r: 7, v: 10, at: "top", topContact: "toward" }).N, 179);
    closeTo(vmin({ r: 7 }).vmin, 8.28);
    // (The slide's point B → 290 N is at an unlabelled position on the loop, not the bottom; see PROGRESS.md.)
  });
  it("Ferris wheel (seat under rider): r 10.0 m, v 3.00 → N_bottom 1.09 mg, N_top 0.908 mg", () => {
    closeTo(seat({ m: 1, r: 10, v: 3, at: "bottom" }).ratio, 1.09);
    closeTo(seat({ m: 1, r: 10, v: 3, at: "top", topContact: "away" }).ratio, 0.908);
  });
  it("flat curve: 900 kg, 500 m, 25.0 m/s → 1125 N, μ_s 0.128", () => {
    const s = fcCar({ m: 900, r: 500, v: 25 });
    closeTo(s.Fc, 1125);
    closeTo(s.mu, 0.128);
  });
  it("flat curve v_max: 35.0 m, μ 0.523 → 13.4 m/s; wet 8.00 m/s → 0.187", () => {
    closeTo(flat({ mu: 0.523, r: 35 }).vmax, 13.4);
    closeTo((8 * 8) / (g * 35), 0.187);
  });
  it("banked: 13.4 m/s, 35.0 m → 27.6°; 100 m, 31.0° → 24.3 m/s", () => {
    closeTo(banked({ v: 13.4, r: 35 }).thetaDeg, 27.6);
    closeTo(speedFor({ thetaDeg: 31, r: 100 }), 24.3);
  });
  it("SI Q28: r 85, v 25 → μ_s 0.750; bank 36.9°", () => {
    const s = flatVsBanked({ r: 85, v: 25 });
    closeTo(s.mu, 0.75);
    closeTo(s.thetaDeg, 36.9);
  });
  it("SI Q27 conical pendulum: 2.00 kg, 80° from vertical → T ≈ 113 N, a_c ≈ 55.6 m/s²", () => {
    const s = conical({ m: 2, thetaFromVertical: 80 });
    closeTo(s.T, 113);
    closeTo(s.ac, 55.6);
  });
});

describe("Ch 13 golden values", () => {
  it("ratios: distance doubled → ÷4", () => {
    expect(factorLabel(1 / 4)).toBe("1/4 as large");
  });
  it("g at 400 km → 8.68 (lecture 8.67); weight at h = R_E → ¼", () => {
    closeTo(gAlt({ hKm: 400 }).g, 8.68);
    closeTo(gAlt({ hKm: 6370 }).g / g, 0.25, 0.03);
  });
  it("ISS: v 7.67 × 10³, T 5.55 × 10³ s, ω 1.13 × 10⁻³", () => {
    const s = orbit({ hKm: 400 });
    closeTo(s.v, 7670);
    closeTo(s.T, 5550);
    closeTo(orbitOmega({ v: 7670, hKm: 400 }).omega, 1.13e-3);
  });
  it("planet Nutron: T 84 s, r 8.0 × 10⁶ → 4.3 × 10²⁸ kg", () => {
    closeTo(planetMass({ T: 84, r: 8e6 }).M, 4.3e28);
  });
  it("Earth's own surface g from GM/R²", () => {
    closeTo(planetG({ M: 5.97e24, R: 6.37e6 }).g, 9.8, 0.01);
  });
});

describe("Ch 7 golden values", () => {
  it("vacuum: 50.0 N, 30.0°, 3.00 m → 130 J; concrete block 40 N, 7.0 m, 247 J → 28°", () => {
    closeTo(workAngle({ F: 50, d: 3, theta: 30 }).W, 130);
    closeTo((Math.acos(247 / (40 * 7)) * 180) / Math.PI, 28, 0.03);
  });
  it("elevator #25: 1500 kg, 40.0 m, 100 N → 592 kJ, −588 kJ, 0", () => {
    const s = elevator({ m: 1500, h: 40, f: 100 });
    closeTo(s.Wcable, 592000);
    closeTo(s.Wg, -588000);
    expect(Math.abs(s.Wnet)).toBeLessThan(1e-6);
  });
  it("friction work: 1.00 kg, 1.60 m, μ 0.25 → −3.92 J; 3.0 kg, 16 N at 37°, μ 0.25, 5.0 m → −25 J", () => {
    closeTo(frictionWork({ m: 1, muk: 0.25, d: 1.6, F: 0, theta: 0 }).W, -3.92);
    closeTo(frictionWork({ m: 3, muk: 0.25, d: 5, F: 16, theta: 37 }).W, -25, 0.03);
  });
  it("dot product: (2,3)·(−1,2) = 4, θ = 60.3°", () => {
    const s = dot({ ax: 2, ay: 3, bx: -1, by: 2 });
    expect(s.dot).toBe(4);
    closeTo(s.thetaDeg, 60.3);
  });
  it("F = −2.0/x from 2.0 to 5.0 m → −1.83 J (slides round to −1.81)", () => {
    closeTo(inverseX({ a: 2, xi: 2, xf: 5 }).W, -1.83);
  });
  it("power law integral: ∫₀² 3x² dx = 8", () => {
    closeTo(powerLaw({ a: 3, n: 2, xi: 0, xf: 2 }).W, 8);
  });
  it("F–x graph: 5 N rectangle over 4 m + triangle down over 2 m → 25 J", () => {
    const pts = [{ x: 0, F: 5 }, { x: 4, F: 5 }, { x: 6, F: 0 }];
    closeTo(areaUnder(pts, 0, 6), 25);
  });
  it("spring work: ½k(x_i² − x_f²)", () => {
    closeTo(springWork({ k: 200, xi: 0, xf: 0.1 }).W, -1);
    closeTo(springWork({ k: 200, xi: 0.1, xf: 0 }).W, 1);
  });
  it("W–E: 6.0 kg, 12 N, 3.0 m from rest → 3.5 m/s", () => {
    closeTo(weSpeed({ m: 6, vi: 0, W: 36 }).vf, 3.46);
  });
  it("review follow-up: F = −2.0/x on a 0.5 kg particle moving 3 m/s at x = 2 → v at x = 5", () => {
    const s = weVarying({ a: 2, xi: 2, xf: 5, m: 0.5, vi: 3 });
    closeTo(s.W, -1.83);
    closeTo(s.vf, Math.sqrt(9 + 2 * -1.83 / 0.5));
  });
  it("#64: 100 g block, drops ≈2.0 m, arrives at 4.0 m/s → W_f = −1.2 J", () => {
    closeTo(frictionPath({ m: 0.1, h: 2.0, v: 4 }).Wf, -1.2, 0.05);
  });
  it("power: 75 N, 42 m, 3.0 min → 18 W (17.5)", () => {
    closeTo(powerAvg({ F: 75, d: 42, tSec: 180 }).P, 17.5);
  });
  it("elevator motor: 1800 kg, f 4000 N, 3.00 m/s → 6.49 × 10⁴ W; a = 1.00 → 7.02 × 10⁴ W", () => {
    const s = powerElev({ M: 1800, f: 4000, v: 3, a: 1 });
    closeTo(s.P0, 6.49e4);
    closeTo(s.Pa, 7.02e4);
  });
});

describe("Ch 7 F–x graph: independent numeric integration over 300 seeds", () => {
  it("matches the template's answer", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const q = graphTemplate.generate(createRng(seed));
      const d = q.diagram;
      expect(d && d.kind === "fx-graph").toBe(true);
      if (!d || d.kind !== "fx-graph") continue;
      // Simpson-free: midpoint Riemann sum with many slices
      const f = (x: number): number => {
        for (let i = 0; i < d.points.length - 1; i++) {
          const a = d.points[i]!;
          const b = d.points[i + 1]!;
          if (x >= a.x && x <= b.x) return b.x === a.x ? a.F : a.F + ((b.F - a.F) * (x - a.x)) / (b.x - a.x);
        }
        return 0;
      };
      const n = 20000;
      const from = d.from!;
      const to = d.to!;
      const h = (to - from) / n;
      let sum = 0;
      for (let i = 0; i < n; i++) sum += f(from + (i + 0.5) * h) * h;
      expect(Math.abs(sum - (q.answer as number)) / Math.abs(q.answer as number)).toBeLessThan(0.01);
    }
  });
  it("generateGraph produces graphs with negative regions sometimes", () => {
    let neg = 0;
    for (let seed = 1; seed <= 200; seed++) if (generateGraph(createRng(seed)).points.some((p) => p.F < 0)) neg++;
    expect(neg).toBeGreaterThan(20);
  });
});

describe("Exam 2 coverage", () => {
  it("every Exam 2 topic has ≥ 3 templates", () => {
    for (const ch of CHAPTERS.filter((c) => c.exam === "exam2")) {
      for (const t of ch.topics) expect(templatesForTopic(t.id).length, t.id).toBeGreaterThanOrEqual(3);
    }
  });
  it("every declared variant of every template is generated over 300 seeds", () => {
    for (const t of TEMPLATES) {
      if (!t.variants) continue;
      const seen = new Set<string>();
      for (let seed = 1; seed <= 300; seed++) {
        const v = t.generate(createRng(seed)).variant;
        if (v) seen.add(v);
      }
      for (const v of t.variants) expect(seen.has(v), `${t.id}: variant ${v}`).toBe(true);
    }
  });
});
