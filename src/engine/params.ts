import type { Rng } from "./rng";

/** Round to `n` significant figures. */
export function toSigFigs(x: number, n = 3): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  return Number(x.toPrecision(n));
}

/** Round to a given number of decimal places. */
export function toDecimals(x: number, places: number): number {
  const f = Math.pow(10, places);
  return Math.round(x * f) / f;
}

/** Round to the nearest multiple of `step` (e.g. nice(34.87, 0.5) → 35.0). */
export function roundToStep(x: number, step: number): number {
  const r = Math.round(x / step) * step;
  // kill floating noise like 35.000000000000004
  return toSigFigs(r, 10);
}

/**
 * Draw a "nice" value in [min, max] on a grid of `step`.
 * Example: nice(rng, 20, 60, 5) → one of 20, 25, …, 60.
 */
export function nice(rng: Rng, min: number, max: number, step: number): number {
  const lo = Math.ceil(min / step);
  const hi = Math.floor(max / step);
  return roundToStep(rng.int(lo, hi) * step, step);
}

/**
 * Draw a value in [min, max] and round it to `sig` significant figures.
 * Good for ranges spanning more than one decade.
 */
export function sig(rng: Rng, min: number, max: number, sigFigs = 3): number {
  return toSigFigs(rng.float(min, max), sigFigs);
}

/**
 * Format a number for display: up to `sig` significant figures, switching to
 * scientific notation outside [1e-3, 1e5). Returns a plain string (no LaTeX).
 */
export function fmt(x: number, sigFigs = 3): string {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return "0";
  const ax = Math.abs(x);
  if (ax >= 1e5 || ax < 1e-3) {
    const exp = Math.floor(Math.log10(ax));
    let mant = x / Math.pow(10, exp);
    // toPrecision can round 9.99 → "10.0"; renormalise
    let m = Number(mant.toPrecision(sigFigs));
    let e = exp;
    if (Math.abs(m) >= 10) {
      m /= 10;
      e += 1;
    }
    return `${trimZeros(m.toPrecision(sigFigs))}e${e}`;
  }
  const decimals = Math.max(0, sigFigs - 1 - Math.floor(Math.log10(ax)));
  return trimZeros(Number(x.toPrecision(sigFigs)).toFixed(decimals));
}

/**
 * Display string for prose/labels: plain when in normal range, otherwise an
 * inline-LaTeX `$a \\times 10^{n}$` segment (for RichText).
 */
export function fmtDisplay(x: number, sigFigs = 3): string {
  const s = fmt(x, sigFigs);
  return s.includes("e") ? `$${fmtTex(x, sigFigs)}$` : s;
}

/** Same as fmt() but renders scientific notation as LaTeX (×10^n). */
export function fmtTex(x: number, sigFigs = 3): string {
  const s = fmt(x, sigFigs);
  const m = /^(-?[\d.]+)e(-?\d+)$/.exec(s);
  if (!m) return s;
  return `${m[1]} \\times 10^{${m[2]}}`;
}

function trimZeros(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/\.?0+$/, "");
}

/** Keep trying `gen` until `ok` accepts the result (or give up after `tries`). */
export function rejectUntil<T>(gen: () => T, ok: (v: T) => boolean, tries = 200): T {
  let last: T = gen();
  for (let i = 0; i < tries; i++) {
    if (ok(last)) return last;
    last = gen();
  }
  throw new Error("rejectUntil: no valid parameters after " + tries + " tries");
}

export const DEG = Math.PI / 180;
export const toRad = (deg: number): number => deg * DEG;
export const toDeg = (rad: number): number => rad / DEG;
