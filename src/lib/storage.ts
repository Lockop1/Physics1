/**
 * The ONLY module that touches localStorage. Every access is wrapped in
 * try/catch so the app keeps working when storage is unavailable (private
 * mode, quota, SSR, tests). Data lives under a single versioned key.
 */

export const STORAGE_KEY = "phys1-trainer:v1";
export const STORAGE_VERSION = 1;

export interface TemplateStats {
  attempts: number;
  correct: number;
  /** Last 10 results, newest last. */
  recent: boolean[];
  /** ms since epoch */
  lastSeen: number;
}

export interface EquationStats {
  attempts: number;
  correct: number;
}

export interface Settings {
  /** ISO date "YYYY-MM-DD" or null */
  examDate: string | null;
  defaultMode: "mcq" | "free";
  theme: "system" | "light" | "dark";
}

export interface ProgressData {
  version: number;
  templates: Record<string, TemplateStats>;
  errors: Record<string, number>;
  equations: Record<string, EquationStats>;
  settings: Settings;
  /** Last question visited: "templateId/seed" */
  lastQuestion?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  examDate: null,
  defaultMode: "mcq",
  theme: "system",
};

export function emptyProgress(): ProgressData {
  return {
    version: STORAGE_VERSION,
    templates: {},
    errors: {},
    equations: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

// ---- low-level ---------------------------------------------------------

function getStore(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** In-memory fallback so the session still "works" when storage is unavailable. */
let memory: ProgressData | null = null;

export function load(): ProgressData {
  if (memory) return memory;
  const store = getStore();
  if (store) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        const migrated = migrate(parsed);
        if (migrated) {
          memory = migrated;
          return migrated;
        }
      }
    } catch {
      /* fall through */
    }
  }
  memory = emptyProgress();
  return memory;
}

export function save(data: ProgressData): boolean {
  memory = data;
  const store = getStore();
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Validate/migrate parsed JSON into the current shape. Returns null if hopeless. */
export function migrate(raw: unknown): ProgressData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<ProgressData>;
  const base = emptyProgress();
  // Future versions: add `if (r.version === 1) {...}` upgrade steps here. Never wipe.
  return {
    version: STORAGE_VERSION,
    templates: isRecord(r.templates) ? (r.templates as Record<string, TemplateStats>) : base.templates,
    errors: isRecord(r.errors) ? (r.errors as Record<string, number>) : base.errors,
    equations: isRecord(r.equations) ? (r.equations as Record<string, EquationStats>) : base.equations,
    settings: { ...base.settings, ...(isRecord(r.settings) ? (r.settings as Partial<Settings>) : {}) },
    ...(typeof r.lastQuestion === "string" ? { lastQuestion: r.lastQuestion } : {}),
  };
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

/** Drop the in-memory cache (tests). */
export function resetCache(): void {
  memory = null;
}

// ---- high-level API ----------------------------------------------------

export function getTemplateStats(templateId: string): TemplateStats | undefined {
  return load().templates[templateId];
}

export function recordAttempt(templateId: string, correct: boolean, errorId?: string): void {
  const data = load();
  const prev = data.templates[templateId] ?? { attempts: 0, correct: 0, recent: [], lastSeen: 0 };
  const recent = [...prev.recent, correct].slice(-10);
  data.templates[templateId] = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    recent,
    lastSeen: Date.now(),
  };
  if (errorId) data.errors[errorId] = (data.errors[errorId] ?? 0) + 1;
  save(data);
}

export function recordEquationPick(equationId: string, correct: boolean): void {
  const data = load();
  const prev = data.equations[equationId] ?? { attempts: 0, correct: 0 };
  data.equations[equationId] = { attempts: prev.attempts + 1, correct: prev.correct + (correct ? 1 : 0) };
  save(data);
}

export function getSettings(): Settings {
  return load().settings;
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const data = load();
  data.settings = { ...data.settings, ...patch };
  save(data);
  return data.settings;
}

export function setLastQuestion(templateId: string, seed: number): void {
  const data = load();
  data.lastQuestion = `${templateId}/${seed}`;
  save(data);
}

export function exportJson(): string {
  return JSON.stringify(load(), null, 2);
}

/** Import progress JSON. Returns an error message or null on success. */
export function importJson(text: string): string | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    const migrated = migrate(parsed);
    if (!migrated) return "That file doesn't look like exported progress.";
    save(migrated);
    return null;
  } catch (e) {
    return "Could not parse JSON: " + (e instanceof Error ? e.message : String(e));
  }
}

export function clearAll(): void {
  memory = emptyProgress();
  const store = getStore();
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Mastery for a topic given its template ids: 0..1, or null if nothing attempted. */
export function masteryFor(templateIds: string[]): { mastery: number | null; attempts: number } {
  const data = load();
  let attempts = 0;
  let weighted = 0;
  let n = 0;
  for (const id of templateIds) {
    const s = data.templates[id];
    if (!s || s.attempts === 0) continue;
    attempts += s.attempts;
    const acc = s.recent.length ? s.recent.filter(Boolean).length / s.recent.length : 0;
    weighted += acc;
    n++;
  }
  return { mastery: n ? weighted / templateIds.length : null, attempts };
}
