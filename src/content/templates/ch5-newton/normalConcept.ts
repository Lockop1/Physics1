import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

type Rel = "N > mg" | "N < mg" | "N = mg" | "N = 0";
const ALL: Rel[] = ["N > mg", "N < mg", "N = mg", "N = 0"];

const CASES: { text: string; rel: Rel; why: string }[] = [
  { text: "a box at rest on a horizontal floor", rel: "N = mg", why: "no other vertical forces and a_y = 0" },
  { text: "a box being pushed across a horizontal floor by a force angled downward", rel: "N > mg", why: "the push's downward component adds to the weight: N = mg + F sin θ" },
  { text: "a box being pulled across a horizontal floor by a rope angled upward", rel: "N < mg", why: "the rope's upward component supports part of the weight: N = mg − F sin θ" },
  { text: "a box at rest on a ramp inclined at 30°", rel: "N < mg", why: "N only balances the perpendicular component: N = mg cos θ" },
  { text: "a box on the floor of an elevator accelerating upward", rel: "N > mg", why: "N − mg = ma with a > 0" },
  { text: "a box on the floor of an elevator accelerating downward (slower than g)", rel: "N < mg", why: "N − mg = −ma" },
  { text: "a box on the floor of an elevator moving upward at constant velocity", rel: "N = mg", why: "constant velocity means a = 0" },
  { text: "a box on the floor of an elevator moving downward at constant velocity", rel: "N = mg", why: "constant velocity means a = 0" },
  { text: "a box on the floor of an elevator in free fall", rel: "N = 0", why: "both fall at g; the floor exerts no force" },
  { text: "a box on the floor of an elevator that is moving downward but slowing down", rel: "N > mg", why: "slowing while moving down means the acceleration is upward" },
  { text: "a box on the floor of an elevator that is moving upward but slowing down", rel: "N < mg", why: "slowing while moving up means the acceleration is downward" },
  { text: "a box being pushed horizontally across a horizontal floor", rel: "N = mg", why: "a horizontal push has no vertical component" },
];

export const template: QuestionTemplate = {
  id: "ch5.normal.concept",
  topicId: "ch5.normal",
  title: "Is N greater than, less than, or equal to mg?",
  source: "Ch 5 lecture — 'N = Fg only if a_y = 0' slide",
  kind: "conceptual",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const c = rng.pick(CASES);
    const wrongIds: Record<Rel, string> = { "N > mg": "elevator-sign", "N < mg": "elevator-sign", "N = mg": "normal-equals-mg", "N = 0": "arithmetic-slip" };
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `Consider ${c.text}. How does the normal force N on the box compare to its weight mg?`,
      givens: [],
      target: { symbol: "N", unit: "", label: "comparison of N to mg" },
      answer: c.rel,
      choices: buildStringChoices(
        rng,
        c.rel,
        ALL.filter((r) => r !== c.rel).map((r) => ({ value: r, errorId: r === "N = mg" ? "normal-equals-mg" : c.rel === "N = mg" ? "force-required-for-motion" : wrongIds[r] })),
      ),
      equations: ["newton-2", "weight"],
      recipe: ["List all vertical forces", "ΣF_y = m a_y — is a_y zero?", "Solve for N"],
      hints: [
        "N = mg only when the vertical net force is zero and nothing else has a vertical component.",
        "Look for: an angled force, an incline, or a vertical acceleration.",
        c.why,
      ],
      solution: [{ text: `${c.rel} because ${c.why}.`, latex: "\\sum F_y = N - mg \\pm (\\ldots) = m a_y", equationId: "newton-2" }],
    };
  },
};
