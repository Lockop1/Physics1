import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { R_E } from "../../constants";
import { q, fx, sinD } from "../helpers";

/** Displacement between two points on a circle (chord) vs the arc length. Lecture Example 4.1: satellite at 400 km altitude from the North Pole to −45° latitude → chord 2r sin(135°/2). */
export function solve(p: { r: number; sweepDeg: number }): { chord: number; arc: number } {
  return { chord: 2 * p.r * sinD(p.sweepDeg / 2), arc: p.r * ((p.sweepDeg * Math.PI) / 180) };
}

export const template: QuestionTemplate = {
  id: "e1.kin2d.chord-displacement",
  topicId: "e1.kin2d",
  title: "Displacement along a circular path (chord) vs distance travelled (arc)",
  source: "Ch 4 lecture — Example 4.1 (polar-orbit satellite at 400 km, North Pole → −45° latitude)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const satellite = rng.chance(0.5);
    const hKm = rng.pick([300, 400, 500, 800]);
    const r = satellite ? (R_E + hKm * 1000) / 1000 : nice(rng, 20, 500, 10); // km or m
    const unit = satellite ? "km" : "m";
    const sweep = rng.pick([60, 90, 120, 135, 150, 180]);
    const s = solve({ r, sweepDeg: sweep });
    const rShown = toSigFigs(r, 4);
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: satellite
        ? `A satellite in a circular polar orbit ${q(hKm, "km")} above Earth's surface moves from directly above the North Pole to a point where it has swept through $${sweep}^\\circ$ around Earth's center. What is the magnitude of its displacement? (Earth's radius 6370 km.)`
        : `A car drives along a circular track of radius ${q(r, "m")} through an angle of $${sweep}^\\circ$ measured at the center. What is the magnitude of its displacement?`,
      diagram: { kind: "circle", radiusLabel: `r = ${rShown} ${unit}`, arcDeg: sweep, arcLabel: "path", direction: "ccw" },
      givens: [satellite ? { symbol: "h", value: hKm, unit: "km" } : { symbol: "r", value: r, unit: "m" }, { symbol: "\\theta", value: sweep, unit: "°" }],
      target: { symbol: "|\\Delta\\vec r|", unit, label: "displacement magnitude" },
      answer: toSigFigs(s.chord, 4),
      choices: buildNumericChoices(rng, s.chord, [
        { errorId: "displacement-vs-distance", value: s.arc },
        { errorId: "arithmetic-slip", value: r },
        { errorId: "diameter-as-radius", value: s.chord / 2 },
        ...(satellite ? [{ errorId: "altitude-not-plus-radius", value: 2 * hKm * sinD(sweep / 2) }] : [{ errorId: "arithmetic-slip", value: 2 * r }]),
      ]),
      equations: ["vec-magnitude", "arc-length"],
      recipe: [...(satellite ? ["r = R_E + h"] : []), "Displacement is the straight chord between the two points", "Chord = 2r sin(θ/2) (isosceles triangle with the center)"],
      hints: ["Displacement is the straight line from start to end, not the distance along the arc.", "The two radii and the chord form an isosceles triangle; split it in half.", `2 × ${rShown} × sin(${sweep / 2}°).`],
      solution: [
        ...(satellite ? [{ text: "Orbit radius from Earth's center.", latex: `r = 6370 + ${hKm} = ${rShown}\\ \\text{km}`, value: r }] : []),
        { text: "The chord of a circle subtending angle θ.", latex: `|\\Delta\\vec r| = 2r\\sin\\frac{\\theta}{2} = 2(${rShown})\\sin${sweep / 2}^\\circ = ${fx(s.chord)}\\ \\text{${unit}}`, equationId: "vec-magnitude", value: toSigFigs(s.chord, 4) },
      ],
      note: `The distance travelled along the arc is rθ = ${fx(s.arc)} ${unit}.`,
    };
  },
};
