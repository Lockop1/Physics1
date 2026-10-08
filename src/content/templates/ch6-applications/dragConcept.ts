import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch6.drag.concept",
    topicId: "ch6.drag",
    title: "Drag and terminal speed concepts",
    source: "Ch 6b lecture — 6.4 Drag force and terminal speed",
    equations: ["drag-force", "terminal-speed", "newton-2"],
    recipe: ["Drag opposes the motion and grows with v²", "Falling: a = g − F_D/m shrinks as v grows", "Terminal speed when F_D = mg"],
    hints: ["Think about how the net force changes as the speed increases.", "Terminal speed is an equilibrium, not a maximum pull of gravity.", "F_D ∝ v² and ∝ A."],
  },
  [
    {
      prompt: "A skydiver has reached terminal speed. The net force on the skydiver is",
      answer: "zero — drag equals weight",
      wrong: [
        { value: "mg downward", errorId: "forgot-friction" },
        { value: "F_D upward", errorId: "terminal-not-equilibrium" },
        { value: "small but nonzero, since she is still falling", errorId: "force-required-for-motion" },
      ],
      explanation: "Terminal speed means constant velocity, so a = 0 and ΣF = 0: the upward drag has grown to match the weight.",
      latex: "\\tfrac12 C\\rho A v_t^2 = mg",
      equationId: "terminal-speed",
    },
    {
      prompt: "Just after jumping, a skydiver's acceleration is g. As her speed increases, her acceleration",
      answer: "decreases toward zero, because drag grows with v²",
      wrong: [
        { value: "stays at g until terminal speed, then drops to zero", errorId: "forgot-friction" },
        { value: "increases, because she is falling faster", errorId: "motion-vs-acceleration-direction" },
        { value: "becomes negative (upward) once drag appears", errorId: "terminal-not-equilibrium" },
      ],
      explanation: "a = (mg − ½CρAv²)/m. Drag starts at zero and increases smoothly with v², so a falls continuously from g to 0.",
      latex: "a = g - \\frac{C\\rho A v^2}{2m}",
      equationId: "drag-force",
    },
    {
      prompt: "A skydiver goes from a spread-eagle position to head-down, reducing her frontal area to one quarter. Her terminal speed",
      answer: "doubles",
      wrong: [
        { value: "quadruples", errorId: "forgot-sqrt" },
        { value: "halves", errorId: "ratio-inverted" },
        { value: "is unchanged — terminal speed depends only on mass", errorId: "arithmetic-slip" },
      ],
      explanation: "v_t = √(2mg/(CρA)) ∝ 1/√A. A → A/4 gives v_t → 2v_t.",
      latex: "v_t \\propto \\frac{1}{\\sqrt{A}}",
      equationId: "terminal-speed",
    },
    {
      prompt: "Two spheres of the same size fall through air; one is twice as massive. Which has the higher terminal speed?",
      answer: "The heavier one, by a factor of √2",
      wrong: [
        { value: "The heavier one, by a factor of 2", errorId: "forgot-sqrt" },
        { value: "Both the same — all objects fall alike", errorId: "mass-not-weight" },
        { value: "The lighter one", errorId: "ratio-inverted" },
      ],
      explanation: "Same C, ρ and A; v_t = √(2mg/(CρA)) ∝ √m. (Without air they would indeed fall alike — drag is what makes mass matter.)",
      latex: "v_t \\propto \\sqrt{m}",
      equationId: "terminal-speed",
    },
    {
      prompt: "A car's speed doubles on the highway. The air-drag force on it becomes",
      answer: "4 times larger",
      wrong: [
        { value: "2 times larger", errorId: "forgot-square" },
        { value: "the same", errorId: "arithmetic-slip" },
        { value: "8 times larger", errorId: "arithmetic-slip" },
      ],
      explanation: "F_D = ½CρAv² ∝ v². Doubling v quadruples the drag (and the power needed grows as v³).",
      latex: "F_D \\propto v^2",
      equationId: "drag-force",
    },
  ],
);
