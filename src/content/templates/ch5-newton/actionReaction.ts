import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

/** Identify the third-law partner of a given force (monitor-on-table style). */

interface Skin {
  obj: string; // "the monitor"
  surface: string; // "the table"
  surfaceBelow: string; // "the floor"
}
const SKINS: Skin[] = [
  { obj: "the monitor", surface: "the table", surfaceBelow: "the floor" },
  { obj: "the book", surface: "the desk", surfaceBelow: "the floor" },
  { obj: "the crate", surface: "the truck bed", surfaceBelow: "the road" },
  { obj: "the student", surface: "the chair", surfaceBelow: "the floor" },
  { obj: "the vase", surface: "the shelf", surfaceBelow: "the wall bracket" },
];

type Given = "normal-on-obj" | "weight-of-obj" | "obj-on-surface";

export const template: QuestionTemplate = {
  id: "ch5.concepts.action-reaction",
  topicId: "ch5.concepts",
  title: "Third-law pair: identify the partner force",
  source: "Ch 5 lecture — monitor on table (F_tm / F_mt / F_Em / F_mE)",
  kind: "conceptual",
  difficulty: 2,
  variants: ["normal-on-obj", "weight-of-obj", "obj-on-surface"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = (opts?.variant && this.variants!.includes(opts.variant) ? opts.variant : rng.pick(this.variants!)) as Given;
    const s = rng.pick(SKINS);
    const O = s.obj;
    const S = s.surface;
    const normalOnObj = `${cap(S)} pushes up on ${O} (normal force)`;
    const objOnSurface = `${cap(O)} pushes down on ${S}`;
    const weightOfObj = `Earth pulls down on ${O} (its weight)`;
    const objOnEarth = `${cap(O)} pulls up on Earth`;
    const floorOnSurface = `${cap(s.surfaceBelow)} pushes up on ${S}`;

    let given: string;
    let answer: string;
    let wrong: { value: string; errorId: string }[];
    if (variant === "normal-on-obj") {
      given = normalOnObj;
      answer = objOnSurface;
      wrong = [
        { value: weightOfObj, errorId: "third-law-same-object" },
        { value: objOnEarth, errorId: "third-law-wrong-partner" },
        { value: floorOnSurface, errorId: "third-law-wrong-partner" },
      ];
    } else if (variant === "weight-of-obj") {
      given = weightOfObj;
      answer = objOnEarth;
      wrong = [
        { value: normalOnObj, errorId: "third-law-same-object" },
        { value: objOnSurface, errorId: "third-law-wrong-partner" },
        { value: floorOnSurface, errorId: "third-law-wrong-partner" },
      ];
    } else {
      given = objOnSurface;
      answer = normalOnObj;
      wrong = [
        { value: weightOfObj, errorId: "third-law-wrong-partner" },
        { value: floorOnSurface, errorId: "third-law-same-object" },
        { value: objOnEarth, errorId: "third-law-wrong-partner" },
      ];
    }
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${cap(O)} rests on ${S}. Consider the force "${given}". Which force is its Newton's-third-law partner?`,
      givens: [],
      target: { symbol: "", unit: "", label: "the reaction force" },
      answer,
      choices: buildStringChoices(rng, answer, wrong),
      equations: ["newton-2"],
      recipe: ["Name the two objects in the given force (A on B)", "The partner is the same kind of force, B on A, equal and opposite"],
      hints: [
        "A third-law pair always involves exactly two objects. Which two are in the given force?",
        "Swap the roles: if the given force is 'A on B', the partner is 'B on A' — same type of force.",
        `The given force is between ${variant === "weight-of-obj" ? `Earth and ${O}` : `${S} and ${O}`}, so the partner must be too.`,
      ],
      solution: [
        {
          text: `The given force acts ON ${variant === "weight-of-obj" ? O : variant === "normal-on-obj" ? O : S} BY ${variant === "weight-of-obj" ? "Earth" : variant === "normal-on-obj" ? S : O}. Its partner swaps the two: "${answer}". Forces that merely balance each other on the same object (like N and mg on ${O}) are NOT a third-law pair.`,
          latex: "\\vec F_{AB} = -\\vec F_{BA}",
        },
      ],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
