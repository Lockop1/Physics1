/**
 * Seeded pseudo-random number generator (mulberry32).
 * Deterministic: the same seed always yields the same sequence, so a question
 * can be reconstructed exactly from (templateId, seed) in the URL.
 */
export interface Rng {
  /** The seed this generator was created with. */
  readonly seed: number;
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Uniform float in [min, max). */
  float(min: number, max: number): number;
  /** Pick one element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** True with the given probability (default 0.5). */
  chance(p?: number): boolean;
  /** Return a shuffled copy (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[];
}

export function createRng(seed: number): Rng {
  let a = (seed >>> 0) || 0x9e3779b9; // avoid the all-zero state
  const next = (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    seed,
    next,
    int(min, max) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    float(min, max) {
      return min + next() * (max - min);
    },
    pick(items) {
      if (items.length === 0) throw new Error("pick() from empty array");
      return items[Math.floor(next() * items.length)] as (typeof items)[number];
    },
    chance(p = 0.5) {
      return next() < p;
    },
    shuffle(items) {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i] as (typeof out)[number];
        out[i] = out[j] as (typeof out)[number];
        out[j] = tmp;
      }
      return out;
    },
  };
  return rng;
}

/** A fresh random seed (for "Next question"). 31-bit so it fits in a URL nicely. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2147483647) + 1;
}
