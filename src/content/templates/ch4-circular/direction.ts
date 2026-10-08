import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";
import { chooseVariant } from "../helpers";

/**
 * Conceptual: direction of the velocity or the centripetal acceleration at a
 * marked point on a circle, for CW or CCW motion.
 */

export type Dir = "Up" | "Down" | "Left" | "Right";
export type Sense = "cw" | "ccw";

export interface DirectionParams {
  /** angle of the marked point, degrees from +x, CCW: 0 (right), 90 (top), 180 (left), 270 (bottom) */
  angle: 0 | 90 | 180 | 270;
  sense: Sense;
}

/** Velocity direction at the point: tangent, in the sense of motion. */
export function velocityDirection(p: DirectionParams): Dir {
  // CCW tangent at angle θ points at θ + 90°; CW at θ − 90°.
  const t = (p.angle + (p.sense === "ccw" ? 90 : -90) + 360) % 360;
  return dirFromAngle(t);
}

/** Centripetal acceleration points toward the center: angle + 180°. */
export function centripetalDirection(p: DirectionParams): Dir {
  return dirFromAngle((p.angle + 180) % 360);
}

export function opposite(d: Dir): Dir {
  return d === "Up" ? "Down" : d === "Down" ? "Up" : d === "Left" ? "Right" : "Left";
}

function dirFromAngle(a: number): Dir {
  switch (a) {
    case 0:
      return "Right";
    case 90:
      return "Up";
    case 180:
      return "Left";
    default:
      return "Down";
  }
}

const SKINS = ["a ball on a string", "a car on a circular track", "a child on a merry-go-round", "a point on a spinning wheel", "a satellite in a circular orbit"];

export const template: QuestionTemplate = {
  id: "ch4.ucm.direction",
  topicId: "ch4.ucm",
  title: "Direction of v and a_c at a point (CW / CCW)",
  source: "Exam 2 Review — Ch 4 concept (velocity tangent, acceleration toward center)",
  kind: "conceptual",
  difficulty: 1,
  variants: ["velocity", "acceleration"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as "velocity" | "acceleration";
    const angle = rng.pick([0, 90, 180, 270] as const);
    const sense: Sense = rng.chance() ? "cw" : "ccw";
    const p: DirectionParams = { angle, sense };
    const skin = rng.pick(SKINS);
    const senseText = sense === "cw" ? "clockwise" : "counter-clockwise";
    const posText = angle === 0 ? "rightmost" : angle === 90 ? "top" : angle === 180 ? "leftmost" : "bottom";

    const vDir = velocityDirection(p);
    const aDir = centripetalDirection(p);

    if (variant === "velocity") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `The figure shows ${skin} moving ${senseText} at constant speed. At point $P$ (the ${posText} point of the circle), which direction is its velocity?`,
        diagram: { kind: "circle", direction: sense, markAngleDeg: angle, markLabel: "P" },
        givens: [],
        target: { symbol: "\\vec v", unit: "", label: "direction of velocity at P" },
        answer: vDir,
        choices: buildStringChoices(rng, vDir, [
          { value: opposite(vDir), errorId: "cw-ccw-swap" },
          { value: aDir, errorId: "velocity-not-tangent" },
          { value: opposite(aDir), errorId: "velocity-not-tangent" },
          { value: "Toward the center", errorId: "velocity-not-tangent" },
        ]),
        equations: ["ac-v2-over-r"],
        recipe: ["Velocity is tangent to the circle", "Point it in the sense of motion (CW or CCW)"],
        hints: [
          "Velocity is always tangent to the path.",
          `At the ${posText} point the tangent line is ${angle === 0 || angle === 180 ? "vertical" : "horizontal"}.`,
          `Moving ${senseText}, which way along that tangent does the object go next?`,
        ],
        solution: [
          { text: `At the ${posText} point the tangent is ${angle === 0 || angle === 180 ? "vertical" : "horizontal"}. Going ${senseText}, the object is heading ${vDir.toLowerCase()}.`, latex: `\\vec v \\parallel \\text{tangent},\\quad \\text{direction: ${vDir}}` },
        ],
      };
    }

    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `The figure shows ${skin} moving ${senseText} at constant speed. At point $P$ (the ${posText} point of the circle), which direction is its acceleration?`,
      diagram: { kind: "circle", direction: sense, markAngleDeg: angle, markLabel: "P" },
      givens: [],
      target: { symbol: "\\vec a", unit: "", label: "direction of acceleration at P" },
      answer: aDir,
      choices: buildStringChoices(rng, aDir, [
        { value: opposite(aDir), errorId: "centrifugal-outward" },
        { value: vDir, errorId: "acceleration-along-velocity" },
        { value: opposite(vDir), errorId: "acceleration-along-velocity" },
        { value: "Zero — the speed is constant", errorId: "motion-vs-acceleration-direction" },
      ]),
      equations: ["ac-v2-over-r"],
      recipe: ["Constant speed on a circle → only centripetal acceleration", "a_c points from P toward the center"],
      hints: [
        "Even at constant speed, the velocity's direction changes, so there IS an acceleration.",
        "In uniform circular motion the acceleration points toward the center of the circle.",
        `From the ${posText} point, the center is ${aDir.toLowerCase()}.`,
      ],
      solution: [
        { text: `The speed is constant, so the acceleration is purely centripetal and points from P toward the center — that is ${aDir.toLowerCase()}. The sense of rotation doesn't matter.`, latex: `\\vec a = \\vec a_c,\\ |a_c| = \\frac{v^2}{r},\\quad \\text{direction: ${aDir}}`, equationId: "ac-v2-over-r" },
      ],
    };
  },
};
