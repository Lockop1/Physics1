import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

interface Scenario {
  prompt: string;
  answer: string;
  wrong: { value: string; errorId: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    prompt: "Two horizontal forces of equal magnitude act on a box in opposite directions. Which statement must be true?",
    answer: "The box's acceleration is zero — it is at rest or moving at constant velocity",
    wrong: [
      { value: "The box must be at rest", errorId: "zero-net-force-means-rest" },
      { value: "The box is slowing down", errorId: "force-required-for-motion" },
      { value: "The box accelerates in the direction of the larger force", errorId: "arithmetic-slip" },
    ],
  },
  {
    prompt: "Is it possible that a box is moving while two forces equal in size but opposite in direction act on it?",
    answer: "Yes — it can move at constant velocity, since the net force is zero",
    wrong: [
      { value: "No — equal and opposite forces mean the box must be at rest", errorId: "zero-net-force-means-rest" },
      { value: "Yes, but it must be slowing down", errorId: "force-required-for-motion" },
      { value: "Yes, but only if one force is slightly larger", errorId: "zero-net-force-means-rest" },
    ],
  },
  {
    prompt: "A bullet is fired in deep space, far from any gravity. What eventually happens to it?",
    answer: "It keeps moving at the same speed in the same direction",
    wrong: [
      { value: "It slows down and comes to a stop", errorId: "force-required-for-motion" },
      { value: "It speeds up as it moves away from the gun", errorId: "wrong-law-number" },
      { value: "It stops as soon as the force from the gun is gone", errorId: "force-required-for-motion" },
    ],
  },
  {
    prompt: "A car cruises down a straight highway at a constant 30 m/s. What is the net force on the car?",
    answer: "Zero — constant velocity means zero acceleration",
    wrong: [
      { value: "Forward, equal to the engine's push", errorId: "force-required-for-motion" },
      { value: "Forward, equal to the car's weight", errorId: "mass-not-weight" },
      { value: "Backward, equal to air resistance", errorId: "force-required-for-motion" },
    ],
  },
  {
    prompt: "A hockey puck slides across ice at constant velocity. Which statement is correct?",
    answer: "The net force on the puck is zero",
    wrong: [
      { value: "A small forward force must be acting to keep it moving", errorId: "force-required-for-motion" },
      { value: "The puck must be slowing down since nothing pushes it", errorId: "force-required-for-motion" },
      { value: "The net force is in the direction of motion", errorId: "motion-vs-acceleration-direction" },
    ],
  },
  {
    prompt: "An elevator rises at a constant 2.0 m/s. Compared to the elevator's weight, the cable tension is",
    answer: "equal to the weight — net force is zero at constant velocity",
    wrong: [
      { value: "greater than the weight, because it is moving up", errorId: "force-required-for-motion" },
      { value: "less than the weight", errorId: "tension-equals-weight" },
      { value: "zero, because it is not accelerating", errorId: "zero-net-force-means-rest" },
    ],
  },
  {
    prompt: "You are standing on a bus that suddenly brakes. You lurch forward. Why?",
    answer: "Your body tends to keep its velocity (inertia) while the bus slows",
    wrong: [
      { value: "A forward force from the braking pushes you", errorId: "wrong-law-number" },
      { value: "The bus's reaction force acts on you", errorId: "third-law-wrong-partner" },
      { value: "Gravity pulls you toward the front", errorId: "wrong-law-number" },
    ],
  },
];

export const template: QuestionTemplate = {
  id: "ch5.concepts.net-force-zero",
  topicId: "ch5.concepts",
  title: "What does net force = 0 mean?",
  source: "Ch 5 lecture — balanced-forces box, bullet in space, hockey puck",
  kind: "conceptual",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const sc = rng.pick(SCENARIOS);
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: sc.prompt,
      givens: [],
      target: { symbol: "", unit: "", label: "the correct statement" },
      answer: sc.answer,
      choices: buildStringChoices(rng, sc.answer, sc.wrong),
      equations: ["newton-2"],
      recipe: ["ΣF = 0 ⇔ a = 0", "a = 0 means velocity is constant: at rest OR moving uniformly"],
      hints: [
        "Newton's first law: with zero net force the velocity does not change.",
        "'Does not change' includes constant nonzero velocity — not just rest.",
        "No force is needed to keep something moving; a force is needed to change its motion.",
      ],
      solution: [
        {
          text: "Zero net force means zero acceleration (Newton's first law / ΣF = ma with a = 0). The velocity is constant — which can be zero (rest) or nonzero (uniform motion). A net force is required only to change velocity.",
          latex: "\\sum \\vec F = 0 \;\\Rightarrow\; \\vec a = 0 \;\\Rightarrow\; \\vec v = \\text{const}",
          equationId: "newton-2",
        },
      ],
    };
  },
};
