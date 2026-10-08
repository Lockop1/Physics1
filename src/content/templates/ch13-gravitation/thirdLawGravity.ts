import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch13.universal.concept",
    topicId: "ch13.universal",
    title: "Universal gravitation concepts (pairs, who pulls harder)",
    source: "Ch 6b lecture — 'Comparing forces' (woman on Earth / Earth on woman)",
    equations: ["grav-force", "newton-2"],
    recipe: ["Gravity is a third-law pair: equal magnitudes on both objects", "Accelerations differ because masses differ (a = F/m)"],
    hints: ["F = Gm₁m₂/r² is symmetric in the two masses.", "Equal forces, unequal masses → unequal accelerations.", "Gravity never switches off; it just gets weaker with 1/r²."],
  },
  [
    {
      prompt: "Earth pulls on a 60 kg woman with a force of about 590 N. How hard does the woman pull on Earth?",
      answer: "590 N — the forces are an equal-and-opposite pair",
      wrong: [
        { value: "Zero — she is far too light to pull on Earth", errorId: "third-law-wrong-partner" },
        { value: "Much less than 590 N, in proportion to her mass", errorId: "third-law-wrong-partner" },
        { value: "Much more than 590 N, since Earth is more massive", errorId: "ratio-inverted" },
      ],
      explanation: "F = Gm₁m₂/r² is the same number whichever object you call m₁. The two forces are a Newton's-third-law pair.",
      latex: "F_{\\text{E on w}} = F_{\\text{w on E}} = \\frac{G M_E m}{R_E^2}",
      equationId: "grav-force",
    },
    {
      prompt: "A 2000 kg truck hits a 1 g fly. During the collision, the force the fly exerts on the truck is",
      answer: "equal in magnitude to the force the truck exerts on the fly",
      wrong: [
        { value: "much smaller than the force the truck exerts on the fly", errorId: "third-law-wrong-partner" },
        { value: "zero", errorId: "third-law-wrong-partner" },
        { value: "larger, because the fly stops more suddenly", errorId: "ratio-inverted" },
      ],
      explanation: "Third law: the two contact forces are equal and opposite. The fly's ACCELERATION is enormous because its mass is tiny (a = F/m), but the force is the same.",
      latex: "\\vec F_{\\text{fly on truck}} = -\\vec F_{\\text{truck on fly}}",
      equationId: "newton-2",
    },
    {
      prompt: "The Moon is attracted to Earth and Earth to the Moon. Which object has the larger acceleration due to this mutual attraction?",
      answer: "The Moon — same force, smaller mass",
      wrong: [
        { value: "Earth — it is pulled by the same force and is heavier", errorId: "ratio-inverted" },
        { value: "Neither accelerates; the forces cancel", errorId: "third-law-same-object" },
        { value: "They have equal accelerations", errorId: "mass-not-weight" },
      ],
      explanation: "Equal forces (third law) divided by different masses give different accelerations. The forces act on different objects, so they do not cancel.",
      latex: "a = \\frac{F}{m}",
      equationId: "newton-2",
    },
    {
      prompt: "Does the gravitational force between two objects ever become exactly zero as they move apart?",
      answer: "No — it decreases as 1/r² but never reaches zero",
      wrong: [
        { value: "Yes, once they are more than a few Earth radii apart", errorId: "inverse-not-inverse-square" },
        { value: "Yes, outside the atmosphere", errorId: "weightless-means-no-gravity" },
        { value: "Yes, once the objects are no longer touching", errorId: "arithmetic-slip" },
      ],
      explanation: "Gravity is a long-range (field) force. F = Gm₁m₂/r² only approaches zero as r → ∞.",
      latex: "F = \\frac{G m_1 m_2}{r^2} \\to 0 \\text{ only as } r \\to \\infty",
      equationId: "grav-force",
    },
    {
      prompt: "In F = Gm₁m₂/r², the distance r for a satellite 400 km above Earth is",
      answer: "the distance to Earth's CENTER: R_E + 400 km",
      wrong: [
        { value: "400 km", errorId: "altitude-not-plus-radius" },
        { value: "the Earth's radius R_E", errorId: "altitude-not-plus-radius" },
        { value: "400 km minus Earth's radius", errorId: "arithmetic-slip" },
      ],
      explanation: "Newton's law applies to point masses; a sphere acts as if its mass were at its center. So r is measured from Earth's center.",
      latex: "r = R_E + h",
      equationId: "grav-force",
    },
  ],
);
