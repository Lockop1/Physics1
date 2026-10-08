import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

type Rel = "T > mg" | "T < mg" | "T = mg" | "T = 0";
const ALL: Rel[] = ["T > mg", "T < mg", "T = mg", "T = 0"];

const CASES: { text: string; rel: Rel; why: string }[] = [
  { text: "hangs at rest", rel: "T = mg", why: "ΣF_y = 0" },
  { text: "is being raised at constant velocity", rel: "T = mg", why: "constant velocity means a = 0, so the forces balance" },
  { text: "is being lowered at constant velocity", rel: "T = mg", why: "constant velocity means a = 0" },
  { text: "is accelerating upward", rel: "T > mg", why: "T − mg = ma with a > 0" },
  { text: "is accelerating downward (less than g)", rel: "T < mg", why: "T − mg = −ma" },
  { text: "is moving upward but slowing down", rel: "T < mg", why: "the acceleration is downward while slowing on the way up" },
  { text: "is moving downward but slowing down", rel: "T > mg", why: "the acceleration is upward while slowing on the way down" },
  { text: "is in free fall after the rope goes slack", rel: "T = 0", why: "a slack rope exerts no force" },
  { text: "is moving downward and speeding up", rel: "T < mg", why: "the acceleration is downward" },
  { text: "is moving upward and speeding up", rel: "T > mg", why: "the acceleration is upward" },
];

const OBJECTS = ["A crate on a crane cable", "A bucket on a rope", "An elevator car on its cable", "A fish on a spring scale", "A lamp on a cord"];

export const template: QuestionTemplate = {
  id: "ch5.tension.concept",
  topicId: "ch5.tension",
  title: "Tension vs weight when accelerating up / down / constant velocity",
  source: "Ch 5 lecture — fish in an elevator (cases 1 and 2)",
  kind: "conceptual",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const c = rng.pick(CASES);
    const obj = rng.pick(OBJECTS);
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `${obj} ${c.text}. How does the tension T compare with the object's weight mg?`,
      givens: [],
      target: { symbol: "T", unit: "", label: "comparison of T to mg" },
      answer: c.rel,
      choices: buildStringChoices(
        rng,
        c.rel,
        ALL.filter((r) => r !== c.rel).map((r) => ({
          value: r,
          errorId: r === "T = mg" ? "tension-equals-weight" : c.rel === "T = mg" ? "force-required-for-motion" : r === "T = 0" ? "arithmetic-slip" : "elevator-sign",
        })),
      ),
      equations: ["newton-2", "weight"],
      recipe: ["Find the direction of the ACCELERATION (not the velocity)", "ΣF_y = T − mg = m a_y", "a_y > 0 → T > mg; a_y < 0 → T < mg; a_y = 0 → T = mg"],
      hints: ["Tension depends on the acceleration, not on the velocity.", "Is the acceleration up, down, or zero? 'Slowing down' flips it relative to the velocity.", c.why],
      solution: [{ text: `${c.rel}: ${c.why}.`, latex: "T - mg = m a_y", equationId: "newton-2" }],
    };
  },
};
