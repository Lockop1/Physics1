/** Default relative tolerance for numeric free-response answers. */
export const REL_TOLERANCE = 0.02;

export interface CheckResult {
  correct: boolean;
  /** Parsed value of the user's input, or null if unparsable. */
  parsed: number | null;
  /** Relative error |user − expected| / |expected| (or absolute when expected = 0). */
  relError: number | null;
}

/**
 * Parse a user-typed number. Accepts "1.2e3", "1.2×10^3", "1.2*10^3", "-3,500",
 * surrounding whitespace, and a trailing unit (which is ignored).
 */
export function parseNumber(input: string): number | null {
  let s = input.trim().replace(/,/g, "").replace(/−/g, "-");
  if (s === "") return null;
  // "1.2×10^3" / "1.2x10^3" / "1.2*10^3" → "1.2e3"
  s = s.replace(/\s*[×x*]\s*10\s*\^\s*\(?\s*(-?\d+)\s*\)?/i, "e$1");
  const m = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s);
  if (!m) return null;
  const v = Number(m[0]);
  return Number.isFinite(v) ? v : null;
}

/** Check a numeric answer against the expected value within a relative tolerance. */
export function checkNumeric(
  input: string | number,
  expected: number,
  tol = REL_TOLERANCE,
): CheckResult {
  const parsed = typeof input === "number" ? input : parseNumber(input);
  if (parsed === null) return { correct: false, parsed: null, relError: null };
  const denom = Math.abs(expected) < 1e-12 ? 1 : Math.abs(expected);
  const relError = Math.abs(parsed - expected) / denom;
  // When expected is exactly 0 (e.g. "static friction holds"), accept |x| ≤ 0.02 absolute.
  return { correct: relError <= tol, parsed, relError };
}

/** Are two numbers within `rel` of each other (relative to the larger magnitude)? */
export function within(a: number, b: number, rel: number): boolean {
  const scale = Math.max(Math.abs(a), Math.abs(b));
  if (scale < 1e-12) return true;
  return Math.abs(a - b) / scale <= rel;
}
