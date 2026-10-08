import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

type Law = "first" | "second" | "third";
const LAW_TEXT: Record<Law, string> = {
  first: "Newton's first law (no net force → velocity stays constant)",
  second: "Newton's second law (ΣF = ma)",
  third: "Newton's third law (forces come in equal-and-opposite pairs)",
};

const SCENARIOS: { text: string; law: Law }[] = [
  { text: "A hockey puck glides across frictionless ice at constant velocity with nothing pushing it.", law: "first" },
  { text: "A passenger lurches forward when the bus brakes suddenly.", law: "first" },
  { text: "A bullet fired in deep space keeps moving at the same speed forever.", law: "first" },
  { text: "A book sits at rest on a table; the table's upward push balances gravity.", law: "first" },
  { text: "A space station coasts around Earth at the same speed with its engines off (ignoring gravity's pull toward the center, its speed does not change).", law: "first" },
  { text: "The harder you push a shopping cart, the faster its speed increases.", law: "second" },
  { text: "A heavily loaded truck accelerates more slowly than an empty one under the same engine force.", law: "second" },
  { text: "A 2.00 kg block pushed with a 10.0 N net force speeds up at 5.00 m/s².", law: "second" },
  { text: "A falling apple speeds up because gravity exerts a net force on it.", law: "second" },
  { text: "A car's acceleration is proportional to the net force from its tires on the road.", law: "second" },
  { text: "A rocket moves forward because it pushes exhaust gas backward.", law: "third" },
  { text: "When you push on a wall, the wall pushes back on you with the same force.", law: "third" },
  { text: "A swimmer pushes water backward and the water pushes the swimmer forward.", law: "third" },
  { text: "A truck hits a fly; the force the fly exerts on the truck equals the force the truck exerts on the fly.", law: "third" },
  { text: "Earth pulls on the Moon, and the Moon pulls on Earth with an equal and opposite force.", law: "third" },
];

export const template: QuestionTemplate = {
  id: "ch5.concepts.which-law",
  topicId: "ch5.concepts",
  title: "Which Newton's law is illustrated?",
  source: "Ch 5 lecture — hockey puck / space station / truck-and-fly slides",
  kind: "conceptual",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const sc = rng.pick(SCENARIOS);
    const others = (["first", "second", "third"] as Law[]).filter((l) => l !== sc.law);
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `${sc.text} Which of Newton's laws does this situation most directly illustrate?`,
      givens: [],
      target: { symbol: "", unit: "", label: "the law" },
      answer: LAW_TEXT[sc.law],
      choices: buildStringChoices(rng, LAW_TEXT[sc.law], [
        ...others.map((l) => ({ value: LAW_TEXT[l], errorId: "wrong-law-number" })),
        { value: "Newton's law of universal gravitation", errorId: "wrong-law-number" },
      ]),
      equations: ["newton-2"],
      recipe: ["Ask: is the net force zero (1st), nonzero (2nd), or is the statement about a PAIR of forces between two objects (3rd)?"],
      hints: [
        "Decide whether the statement is about an object's motion with zero net force, about acceleration from a net force, or about two objects pushing on each other.",
        "First law: ΣF = 0 → constant velocity. Second: ΣF = ma. Third: F_AB = −F_BA.",
        sc.law === "first" ? "No net force and the velocity doesn't change." : sc.law === "second" ? "A net force produces an acceleration proportional to it." : "Two objects, two forces, equal and opposite.",
      ],
      solution: [
        {
          text:
            sc.law === "first"
              ? "There is no net force and the velocity stays the same (at rest or constant velocity). That is Newton's first law."
              : sc.law === "second"
                ? "A net force causes an acceleration proportional to the force and inversely proportional to the mass: ΣF = ma, Newton's second law."
                : "The statement is about the pair of forces two objects exert on each other — equal magnitude, opposite direction. That is Newton's third law.",
          equationId: "newton-2",
        },
      ],
    };
  },
};
