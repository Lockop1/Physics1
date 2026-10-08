import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch7.spring-work.concept",
    topicId: "ch7.spring-work",
    title: "Spring work concepts (sign, scaling with x)",
    source: "Ch 7 lecture — spring force and spring work slides",
    equations: ["hooke", "work-spring"],
    recipe: ["F_s = −kx opposes the displacement from equilibrium", "W_s = ½k(x_i² − x_f²)", "Work on the spring by the agent is the negative of W_s"],
    hints: ["Ask whether the spring is being deformed (negative work by it) or relaxing (positive).", "Work goes as x², not x.", "The spring's force and the agent's force are equal and opposite, so their works are too."],
  },
  [
    {
      prompt: "You slowly stretch a spring from its natural length. The work done BY the spring during this process is",
      answer: "negative — the spring force opposes the displacement",
      wrong: [
        { value: "positive — the spring stretches in the direction you pull", errorId: "work-by-vs-on-spring" },
        { value: "zero — the spring doesn't move", errorId: "arithmetic-slip" },
        { value: "positive and equal to kx²", errorId: "spring-work-missing-half" },
      ],
      explanation: "The spring pulls back toward equilibrium while the end moves away from it: force and displacement are opposite, so W_s = −½kx² < 0. The work YOU do is +½kx².",
      latex: "W_s = \\tfrac12 k(0^2 - x^2) = -\\tfrac12 k x^2",
      equationId: "work-spring",
    },
    {
      prompt: "A compressed spring is released and pushes a block back to the natural length. The work done by the spring on the block is",
      answer: "positive, equal to ½kx²",
      wrong: [
        { value: "negative, equal to −½kx²", errorId: "work-by-vs-on-spring" },
        { value: "zero, because the spring ends at equilibrium", errorId: "arithmetic-slip" },
        { value: "positive, equal to kx", errorId: "forgot-square" },
      ],
      explanation: "The spring force and the block's displacement are in the same direction (both toward equilibrium): W_s = ½k(x_i² − 0) = +½kx².",
      latex: "W_s = \\tfrac12 k x_i^2",
      equationId: "work-spring",
    },
    {
      prompt: "Stretching a spring by 2x from its natural length (instead of x) requires",
      answer: "4 times as much work",
      wrong: [
        { value: "2 times as much work", errorId: "forgot-square" },
        { value: "√2 times as much work", errorId: "forgot-square" },
        { value: "8 times as much work", errorId: "arithmetic-slip" },
      ],
      explanation: "W = ½kx² ∝ x². Doubling x quadruples the work (the force also doubles, and it acts over twice the distance).",
      latex: "W \\propto x^2",
      equationId: "work-spring",
    },
    {
      prompt: "A spring is stretched from x = a to x = 2a. The work done by the spring is",
      answer: "−³⁄₂ k a² (three times the work from 0 to a, and negative)",
      wrong: [
        { value: "−½ k a², the same as from 0 to a", errorId: "forgot-square" },
        { value: "+³⁄₂ k a²", errorId: "work-by-vs-on-spring" },
        { value: "−2 k a²", errorId: "spring-work-missing-half" },
      ],
      explanation: "W_s = ½k(a² − (2a)²) = ½k(a² − 4a²) = −³⁄₂ka². The second stretch is harder because the force is already large.",
      latex: "W_s = \\tfrac12 k\\left(a^2 - 4a^2\\right) = -\\tfrac32 k a^2",
      equationId: "work-spring",
    },
    {
      prompt: "Why can't you use W = F d cos θ to find the work done by a spring?",
      answer: "Because the spring force changes with position — you need the area under F–x (the integral)",
      wrong: [
        { value: "Because the angle is unknown", errorId: "work-ignores-angle" },
        { value: "You can — use F = kx at the final position", errorId: "area-as-F-times-d" },
        { value: "Because springs do no work", errorId: "arithmetic-slip" },
      ],
      explanation: "W = F d cos θ assumes a CONSTANT force. The spring force grows from 0 to kx, so the work is the triangle area ½kx², not kx·x.",
      latex: "W = \\int_0^x (-kx')\\,dx' = -\\tfrac12 k x^2",
      equationId: "work-spring",
    },
  ],
);
