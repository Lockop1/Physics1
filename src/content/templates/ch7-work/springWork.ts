import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Work done BY a spring: W_s = ½k(x_i² − x_f²). */
export function solve(p: { k: number; xi: number; xf: number }): { W: number } {
  return { W: 0.5 * p.k * (p.xi * p.xi - p.xf * p.xf) };
}

type Variant = "stretch-from-rest" | "return-to-rest" | "between";

export const template: QuestionTemplate = {
  id: "ch7.spring-work.by-spring",
  topicId: "ch7.spring-work",
  title: "Work done BY a spring: ½k(x_i² − x_f²)",
  source: "Ch 7 lecture — 'Work done by a spring force'",
  kind: "numeric",
  difficulty: 2,
  variants: ["stretch-from-rest", "return-to-rest", "between"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const k = nice(rng, 50, 1500, 10);
    const useCm = rng.chance(0.5);
    const p = rejectUntil(
      () => {
        const a = nice(rng, 2, 30, 0.5) / 100;
        const b = nice(rng, 2, 30, 0.5) / 100;
        if (variant === "stretch-from-rest") return { k, xi: 0, xf: a };
        if (variant === "return-to-rest") return { k, xi: a, xf: 0 };
        return { k, xi: a, xf: b };
      },
      (c) => Math.abs(c.xi - c.xf) > 0.03 && Math.abs(solve(c).W) > 0.2,
    );
    const { W } = solve(p);
    const show = (x: number) => (useCm ? q(toSigFigs(x * 100, 3), "cm") : q(x, "m"));
    const text =
      variant === "stretch-from-rest"
        ? `A spring with $k = ${k}$ N/m is stretched from its natural length to an extension of ${show(p.xf)}. How much work does the SPRING do during this process?`
        : variant === "return-to-rest"
          ? `A spring with $k = ${k}$ N/m, initially compressed by ${show(p.xi)}, is released and returns to its natural length. How much work does the spring do on the attached block?`
          : `A spring with $k = ${k}$ N/m is stretched from ${show(p.xi)} to ${show(p.xf)} beyond its natural length. How much work does the spring do during this change?`;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: text,
      givens: [
        { symbol: "k", value: k, unit: "N/m" },
        { symbol: "x_i", value: useCm ? toSigFigs(p.xi * 100, 3) : p.xi, unit: useCm ? "cm" : "m" },
        { symbol: "x_f", value: useCm ? toSigFigs(p.xf * 100, 3) : p.xf, unit: useCm ? "cm" : "m" },
      ],
      target: { symbol: "W_s", unit: "J", label: "work done by the spring" },
      answer: toSigFigs(W, 4),
      choices: buildNumericChoices(rng, W, [
        { errorId: "work-by-vs-on-spring", value: -W },
        { errorId: "spring-work-missing-half", value: 2 * W },
        ...(useCm ? [{ errorId: "cm-not-converted", value: W * 10000 }] : [{ errorId: "forgot-square", value: 0.5 * k * (p.xi - p.xf) }]),
        { errorId: "forgot-square", value: 0.5 * k * Math.abs(p.xi - p.xf) * Math.sign(W || 1) },
      ]),
      equations: ["hooke", "work-spring"],
      recipe: ["x is measured from the natural length (convert cm → m)", "W_s = ½k x_i² − ½k x_f²", "Sign: negative when the spring is deformed further, positive when it relaxes"],
      hints: [
        "The spring force varies with x, so this is the integral of −kx — the ½kx² formula.",
        "W_by spring = ½k(x_i² − x_f²). Stretching it further → negative (the spring pulls back). Relaxing → positive.",
        `x_i = ${p.xi} m, x_f = ${p.xf} m.`,
      ],
      solution: [
        { text: "Work by the spring between two displacements from the natural length.", latex: `W_s = \\tfrac12 k x_i^2 - \\tfrac12 k x_f^2 = \\tfrac12(${k})\\left[(${p.xi})^2 - (${p.xf})^2\\right] = ${fx(W)}\\ \\text{J}`, equationId: "work-spring", value: toSigFigs(W, 4) },
      ],
      note: W < 0 ? "Negative: the spring's force opposes the displacement while it is being deformed. The agent doing the stretching does +" + fx(-W) + " J." : "Positive: the relaxing spring pushes/pulls in the direction of motion.",
    };
  },
};
