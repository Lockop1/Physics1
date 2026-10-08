import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch7.constant-force.concept",
    topicId: "ch7.constant-force",
    title: "Work concepts (zero work, sign of work, net work)",
    source: "Ch 7 lecture — briefcase examples, normal/friction work, descending-elevator ABCD card, cliff ABCD card",
    equations: ["work-const", "work-energy"],
    recipe: ["Identify the force and the displacement", "θ is the angle BETWEEN them", "W = F d cos θ; perpendicular → 0; opposing → negative"],
    hints: ["No displacement → no work. Perpendicular → no work.", "Sign comes from cos θ.", "Net work = ΔK, so constant speed means net work zero."],
  },
  [
    {
      prompt: "A person stands still holding a heavy briefcase for five minutes. The work done by the person on the briefcase is",
      answer: "zero — there is no displacement",
      wrong: [
        { value: "positive — holding it up takes effort", errorId: "work-ignores-angle" },
        { value: "negative — gravity is pulling down", errorId: "work-sign-flip" },
        { value: "equal to mg times the time held", errorId: "arithmetic-slip" },
      ],
      explanation: "W = F d cos θ with d = 0. Tired arms are a biological effect, not physics work on the briefcase.",
      latex: "W = Fd\\cos\\theta = 0 \\text{ since } d = 0",
      equationId: "work-const",
    },
    {
      prompt: "A person walks horizontally at constant velocity while holding a briefcase. The work done by the person's hand on the briefcase is",
      answer: "zero — the upward force is perpendicular to the horizontal displacement",
      wrong: [
        { value: "positive — the briefcase moves forward", errorId: "work-ignores-angle" },
        { value: "equal to mg times the distance walked", errorId: "work-ignores-angle" },
        { value: "negative", errorId: "work-sign-flip" },
      ],
      explanation: "The hand's force is vertical (balancing weight) while the displacement is horizontal: θ = 90°, cos 90° = 0.",
      latex: "W = Fd\\cos90^\\circ = 0",
      equationId: "work-const",
    },
    {
      prompt: "A block slides across a horizontal floor. The work done on it by the normal force is",
      answer: "zero — N is perpendicular to the displacement",
      wrong: [
        { value: "positive, equal to N d", errorId: "work-ignores-angle" },
        { value: "negative, equal to −mg d", errorId: "work-sign-flip" },
        { value: "positive if the block speeds up", errorId: "arithmetic-slip" },
      ],
      explanation: "N points up, the displacement is horizontal, so cos 90° = 0. The same is true for gravity on a horizontal floor.",
      latex: "W_N = N d\\cos90^\\circ = 0",
      equationId: "work-const",
    },
    {
      prompt: "An elevator supported by a single cable DESCENDS at constant speed. Only tension and gravity act. Which statement is true?",
      answer: "The net work done by the two forces is zero",
      wrong: [
        { value: "The work done by tension is larger in magnitude than that done by gravity", errorId: "force-required-for-motion" },
        { value: "The work done by gravity is larger in magnitude than that done by tension", errorId: "force-required-for-motion" },
        { value: "The work done by the tension is zero", errorId: "work-ignores-angle" },
      ],
      explanation: "Constant speed → T = mg. Going down, gravity does +mgh and tension does −mgh (it points up, opposite the displacement). They sum to zero, consistent with ΔK = 0.",
      latex: "W_T + W_g = -mgh + mgh = 0 = \\Delta K",
      equationId: "work-energy",
    },
    {
      prompt: "One car flies off a cliff and lands at a point below. A second identical car drives down a winding road to the same point. Compare the work done by gravity on the two cars.",
      answer: "The same — gravity's work depends only on the change in height",
      wrong: [
        { value: "Greater for the car that flew off the cliff", errorId: "arithmetic-slip" },
        { value: "Greater for the car on the longer road", errorId: "work-ignores-angle" },
        { value: "Zero for the car on the road, since the road supports it", errorId: "work-sign-flip" },
      ],
      explanation: "Gravity is a conservative force: its work is −mgΔy regardless of the path. Both cars drop the same height.",
      latex: "W_g = -mg\\,\\Delta y",
      equationId: "work-const",
    },
    {
      prompt: "A crate is pushed up a ramp at constant speed. The work done by kinetic friction on the crate is",
      answer: "negative — friction points opposite to the displacement",
      wrong: [
        { value: "zero, because the speed is constant", errorId: "zero-net-force-means-rest" },
        { value: "positive, because the crate moves", errorId: "work-sign-flip" },
        { value: "equal to μ_k mg cos θ, with no sign", errorId: "work-sign-flip" },
      ],
      explanation: "Kinetic friction always opposes sliding, so θ = 180° and W_f = −f_k d. Constant speed means the NET work is zero, not friction's work.",
      latex: "W_f = -f_k d",
      equationId: "work-const",
    },
    {
      prompt: "A force acts on a moving object but the object's speed does not change. Which must be true?",
      answer: "The NET work on the object is zero",
      wrong: [
        { value: "The force does no work", errorId: "zero-net-force-means-rest" },
        { value: "The force is zero", errorId: "zero-net-force-means-rest" },
        { value: "The object is not moving", errorId: "zero-net-force-means-rest" },
      ],
      explanation: "W_net = ΔK = 0. Individual forces can still do positive and negative work that cancel (e.g. the cable and gravity on a steadily rising elevator).",
      latex: "W_{\\text{net}} = \\Delta K = 0",
      equationId: "work-energy",
    },
  ],
);
