import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** W_net = ½mv_f² − ½mv_i². Lecture: 6.0 kg, 12 N, 3.0 m from rest → 3.5 m/s. */
export function solve(p: { m: number; vi: number; W: number }): { vf: number } {
  return { vf: Math.sqrt(Math.max(0, p.vi * p.vi + (2 * p.W) / p.m)) };
}

type Variant = "vf-from-force" | "vf-from-work" | "work-from-speeds";
const SKINS = ["a block", "a sled", "a cart", "a puck", "a crate"];

export const template: QuestionTemplate = {
  id: "ch7.work-energy.final-speed",
  topicId: "ch7.work-energy",
  title: "Work–energy theorem: final speed from net work (and the reverse)",
  source: "Ch 7 lecture — W–E theorem example (6.0 kg, 12 N over 3.0 m → 3.5 m/s)",
  kind: "numeric",
  difficulty: 2,
  variants: ["vf-from-force", "vf-from-work", "work-from-speeds"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const m = nice(rng, 0.5, 20, 0.5);
    const fromRest = rng.chance(0.5);
    const vi = fromRest ? 0 : nice(rng, 1, 8, 0.5);
    if (variant === "vf-from-force") {
      const p = rejectUntil(() => ({ F: nice(rng, 2, 60, 1), d: nice(rng, 0.5, 10, 0.5) }), (c) => solve({ m, vi, W: c.F * c.d }).vf < 40);
      const W = p.F * p.d;
      const { vf } = solve({ m, vi, W });
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A ${q(m, "kg")} ${skin.replace("a ", "")}${fromRest ? ", initially at rest," : ` moving at ${q(vi, "m/s")}`} is pushed along a frictionless horizontal surface by a constant horizontal force of ${q(p.F, "N")}. What is its speed after it has moved ${q(p.d, "m")}?`,
        diagram: { kind: "block-force", forces: [{ label: "F", angleDeg: 0 }], massLabel: `${m} kg`, caption: "frictionless" },
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "v_i", value: vi, unit: "m/s" },
          { symbol: "F", value: p.F, unit: "N" },
          { symbol: "d", value: p.d, unit: "m" },
        ],
        target: { symbol: "v_f", unit: "m/s", label: "final speed" },
        answer: toSigFigs(vf, 4),
        choices: buildNumericChoices(rng, vf, [
          { errorId: "forgot-sqrt", value: vi * vi + (2 * W) / m },
          { errorId: "kinematics-missing-half", value: Math.sqrt(vi * vi + W / m) },
          { errorId: "forgot-square", value: vi + (2 * W) / m },
          { errorId: "mass-not-weight", value: Math.sqrt(vi * vi + (2 * W) / (m * 9.8)) },
        ]),
        equations: ["work-const", "kinetic-energy", "work-energy"],
        recipe: ["W_net = F d (force along motion, no friction)", "W_net = ½mv_f² − ½mv_i²", "Solve for v_f"],
        hints: ["No time is given — use energy, not kinematics.", "The only force doing work is F: W_net = Fd. Then W_net = ΔK.", `W_net = ${W} J.`],
        solution: [
          { text: "Net work (N and mg do no work).", latex: `W_{\\text{net}} = Fd = (${p.F})(${p.d}) = ${fx(W)}\\ \\text{J}`, equationId: "work-const", value: W },
          { text: "Work–energy theorem.", latex: `W_{\\text{net}} = \\tfrac12 m v_f^2 - \\tfrac12 m v_i^2 \;\\Rightarrow\; v_f = \\sqrt{v_i^2 + \\frac{2W}{m}} = \\sqrt{(${vi})^2 + \\frac{2(${fx(W)})}{${m}}} = ${fx(vf)}\\ \\text{m/s}`, equationId: "work-energy", value: toSigFigs(vf, 4) },
        ],
        note: "Newton's second law + kinematics gives the same answer; energy skips the acceleration step.",
      };
    }
    if (variant === "vf-from-work") {
      const W = nice(rng, -40, 120, 1);
      const ok = vi * vi + (2 * W) / m > 0.5;
      const Wuse = ok ? W : Math.abs(W) + 5;
      const { vf } = solve({ m, vi, W: Wuse });
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A net work of ${q(Wuse, "J")} is done on a ${q(m, "kg")} ${skin.replace("a ", "")} that was ${fromRest ? "initially at rest" : `moving at ${q(vi, "m/s")}`}. What is its final speed?`,
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "v_i", value: vi, unit: "m/s" },
          { symbol: "W_{\\text{net}}", value: Wuse, unit: "J" },
        ],
        target: { symbol: "v_f", unit: "m/s", label: "final speed" },
        answer: toSigFigs(vf, 4),
        choices: buildNumericChoices(rng, vf, [
          { errorId: "forgot-sqrt", value: vi * vi + (2 * Wuse) / m },
          { errorId: "kinematics-missing-half", value: Math.sqrt(Math.max(0, vi * vi + Wuse / m)) },
          { errorId: "forgot-square", value: Math.abs(vi + (2 * Wuse) / m) },
          { errorId: "work-sign-flip", value: Math.sqrt(Math.max(0.01, vi * vi - (2 * Wuse) / m)) },
        ]),
        equations: ["kinetic-energy", "work-energy"],
        recipe: ["W_net = ΔK = ½mv_f² − ½mv_i²", "v_f = √(v_i² + 2W/m)"],
        hints: ["Net work changes kinetic energy.", "½mv_f² = ½mv_i² + W_net.", `K_i = ${toSigFigs(0.5 * m * vi * vi, 3)} J.`],
        solution: [{ text: "Work–energy theorem solved for v_f.", latex: `v_f = \\sqrt{v_i^2 + \\frac{2W_{\\text{net}}}{m}} = \\sqrt{(${vi})^2 + \\frac{2(${Wuse})}{${m}}} = ${fx(vf)}\\ \\text{m/s}`, equationId: "work-energy", value: toSigFigs(vf, 4) }],
        note: Wuse < 0 ? "Negative net work slows the object down." : undefined,
      };
    }
    const vf = nice(rng, 0, 15, 0.5);
    const W = 0.5 * m * (vf * vf - vi * vi);
    const Wuse = Math.abs(W) < 1 ? 0.5 * m * ((vf + 3) * (vf + 3) - vi * vi) : W;
    const vfUse = Math.abs(W) < 1 ? vf + 3 : vf;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A ${q(m, "kg")} ${skin.replace("a ", "")} speeds up from ${q(vi, "m/s")} to ${q(vfUse, "m/s")}. How much net work was done on it?`,
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        { symbol: "v_i", value: vi, unit: "m/s" },
        { symbol: "v_f", value: vfUse, unit: "m/s" },
      ],
      target: { symbol: "W_{\\text{net}}", unit: "J", label: "net work" },
      answer: toSigFigs(Wuse, 4),
      choices: buildNumericChoices(rng, Wuse, [
        { errorId: "forgot-square", value: 0.5 * m * (vfUse - vi) },
        { errorId: "kinematics-missing-half", value: m * (vfUse * vfUse - vi * vi) },
        { errorId: "forgot-square", value: 0.5 * m * (vfUse - vi) * (vfUse - vi) },
        { errorId: "work-sign-flip", value: -Wuse },
      ]),
      equations: ["kinetic-energy", "work-energy"],
      recipe: ["K = ½mv² at each speed", "W_net = K_f − K_i"],
      hints: ["Net work equals the change in kinetic energy.", "Compute ½mv² before and after — don't subtract the speeds first.", `K_f = ${toSigFigs(0.5 * m * vfUse * vfUse, 3)} J.`],
      solution: [{ text: "Change in kinetic energy. Note ½m(v_f² − v_i²) ≠ ½m(v_f − v_i)².", latex: `W_{\\text{net}} = \\tfrac12 m v_f^2 - \\tfrac12 m v_i^2 = \\tfrac12(${m})\\left[(${vfUse})^2 - (${vi})^2\\right] = ${fx(Wuse)}\\ \\text{J}`, equationId: "work-energy", value: toSigFigs(Wuse, 4) }],
    };
  },
};
