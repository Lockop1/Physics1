# Physics 1 Trainer — Project Spec (CLAUDE.md)

Read this whole file before doing anything. It is the source of truth for this project.

## What this is

A static web app for studying PHY2048 (calculus-based Physics 1, UCF, Fall 2026). Owner: one student, studying for **Exam 2** (next) and reviewing Exam 1 material.

The exam is **closed-book, multiple-choice (some conceptual), with a formula sheet provided**. That shapes everything:

1. Memorizing formulas is low value. **Knowing which equation(s) to combine for a given situation is the core skill.**
2. Memorizing specific problems is worthless. Every practice question must be **parametric** — same physics, new numbers, and often a **different unknown** (solve for v one time, r or μ the next).
3. Because the exam is MCQ, wrong answer choices must be **plausible distractors produced by real, named mistakes**, and when the student picks one, the app tells them exactly which mistake produces it.

## Source material

- `source-material/` (gitignored — never commit these files; the repo will be public):
  - `Exam 2 Review_ Fall 2026(b).pdf` — professor's Exam 2 review (Ch 4 circular motion, Ch 5, Ch 6, Ch 13, Ch 7)
  - `PHY2048 SI Exam 1 Review.pdf` — SI leader's Exam 1 review (vectors, units, 1D/2D kinematics, projectiles, Newton's laws, circular motion)
  - lecture slides will be added here later
- Questions in the app are **rewritten scenarios with generated numbers**, not copied text. Cite the source (e.g. `"Exam 2 Review — Example #2(a)"`) in metadata so the student can find the original.

## Tech stack (fixed)

- Vite + React + TypeScript (strict mode)
- `react-router-dom` with **HashRouter** (GitHub Pages has no SPA fallback)
- KaTeX (`katex` package) for all math rendering
- Hand-written SVG React components for diagrams (no canvas, no diagram libraries)
- Vitest for tests
- Plain CSS with CSS variables (light + dark theme via `prefers-color-scheme` plus a manual toggle). No Tailwind, no UI kit.
- Deploy: GitHub Actions workflow → GitHub Pages. `vite.config.ts` `base` must be set from the repo name.
- **No backend, no accounts, no runtime network calls, no AI API calls.** Everything is computed in the browser.
- Progress lives in `localStorage` only, through one module (`src/lib/storage.ts`).

## Physical constants (single source: `src/content/constants.ts`)

- g = 9.80 m/s²
- G = 6.674 × 10⁻¹¹ N·m²/kg²
- M_E = 5.97 × 10²⁴ kg, R_E = 6.37 × 10⁶ m
- (The review slides are inconsistent — some use 5.96e24 and 6.36e6. Use the values above; numeric tolerance absorbs the difference.)

## Directory layout

```
src/
  content/
    constants.ts
    topics.ts                 # topic tree (exam → chapter → topic)
    equations.ts              # the equation sheet + "when to use" metadata
    errors.ts                 # library of named mistakes (distractor generators)
    templates/
      index.ts                # registry: imports every template
      ch4-circular/           # one file per template
      ch5-newton/
      ch6-applications/
      ch13-gravitation/
      ch7-work/
      exam1/                  # vectors, units, kinematics, projectiles
    detective/                # hand-written "spot the trap" scenarios for the equation trainer
  engine/
    rng.ts                    # seeded RNG (mulberry32 or similar)
    params.ts                 # helpers: pick in range, round to sig figs, nice values
    check.ts                  # answer checking (tolerance, sig figs)
    distractors.ts            # builds MCQ choices from errors.ts, dedupes
    selection.ts              # weighted random selection (weak spots, exam weighting)
  diagrams/                   # SVG components, all parameter-driven
  lib/
    storage.ts                # versioned localStorage wrapper, try/catch everywhere
    latex.tsx                 # <Tex> component
  pages/                      # Home, Topic, Practice, Detective, EquationSheet, Exam, Review, Settings
  components/
tests/
  golden/                     # reproduces review answers with the review's original numbers
  property/                   # randomized checks over many seeds
.github/workflows/deploy.yml
CONTENT_GUIDE.md              # how to add a template / equation / detective scenario
```

## Core data model

```ts
type TopicId = string; // e.g. "ch6.flat-curve"

interface QuestionTemplate {
  id: string;                     // "ch6.flat-curve.vmax"
  topicId: TopicId;
  title: string;                  // shown in the topic's template list
  source?: string;                // "Exam 2 Review — Example #2(a)"
  kind: "numeric" | "conceptual"; // conceptual = no calculation, MCQ only
  difficulty: 1 | 2 | 3;
  variants?: string[];            // which unknowns it can rotate through, e.g. ["v", "mu", "r"]
  generate(rng: Rng, opts?: { variant?: string }): GeneratedQuestion;
}

interface GeneratedQuestion {
  templateId: string;
  seed: number;                   // so a question can be reopened exactly (put it in the URL)
  prompt: string;                 // supports inline $...$ KaTeX
  diagram?: DiagramSpec;          // discriminated union, rendered by src/diagrams
  givens: { symbol: string; value: number; unit: string }[];
  target: { symbol: string; unit: string; label: string };
  answer: number | string;        // computed by the solver — NEVER hardcoded
  choices: Choice[];              // always generated, used in MCQ mode
  equations: EquationId[];        // the sheet equations needed, in the order you'd use them
  recipe: string[];               // plain-English plan, e.g. ["ΣF_y = 0 → N = mg", "f_s,max = μ_s N", "set f_s,max = mv²/r"]
  hints: string[];                // progressive: 1) what situation is this, 2) which equations, 3) the setup
  solution: SolutionStep[];       // each step: text + latex + optional equationId; final step equals answer
}

interface Choice {
  value: number | string;
  correct: boolean;
  errorId?: ErrorId;              // for distractors: which named mistake produces it
}
```

### Named-mistake library (`errors.ts`)

Each error has an `id`, a short `label` ("Used diameter as radius"), an `explanation` (why it's wrong, 1–2 sentences), and is applied by a template's solver to the **same parameters** to compute the distractor value. Distractors must come from real mistakes, not random offsets. Start with these; add more as templates need them:

Exam 2 traps:
- `diameter-as-radius` — used diameter where radius belongs
- `rpm-not-converted` — used rev/min (or rev/s) directly as rad/s; forgot 2π or ÷60
- `degrees-in-radian-formula` — used θ in degrees in s = rθ or ω = Δθ/Δt
- `forgot-square` — v instead of v² (a_c, K), or r instead of r² (gravity)
- `normal-equals-mg` — assumed N = mg when an angled force, incline, or vertical acceleration changes it
- `incline-sin-cos-swap` — used mg cos θ along the incline / mg sin θ into it
- `static-vs-kinetic` — used μ_k when the object isn't moving (or μ_s when it is)
- `didnt-check-static` — computed an acceleration when static friction actually holds the block (answer should be 0)
- `top-bottom-loop-sign` — at top of a vertical circle, added mg instead of subtracting (or vice versa at bottom)
- `altitude-not-plus-radius` — used h instead of R_E + h as the distance to Earth's center
- `inverse-not-inverse-square` — gravity scaled with 1/r instead of 1/r²
- `work-ignores-angle` — W = Fd with no cos θ
- `work-sign-flip` — wrong sign of work (force opposing motion does negative work)
- `area-as-F-times-d` — used F × total displacement on a varying-force graph instead of area (incl. negative regions)
- `cm-not-converted` — used cm as m
- `tangential-only` / `centripetal-only` — in non-uniform circular motion, reported one component instead of √(a_c² + a_t²)
- `mass-not-weight` — used m where mg belongs (or reported kg as a force)
- `pulley-single-mass` — used only one mass in a connected-system acceleration

Exam 1 traps (student's known recurring errors — prioritize these):
- `sin-cos-swap` — components swapped, especially when the angle is measured from the vertical or in quadrants II–IV
- `arctan-inverted` — tan⁻¹(x/y) instead of tan⁻¹(y/x)
- `arctan-quadrant` — calculator angle not corrected for quadrant
- `linear-conversion-on-area-volume` — applied a linear factor to m² or m³ units
- `range-missing-factor-2` / `height-vs-range` — projectile formula slips
- `wrong-g` — used 9.80 when the problem gives another value
- `motion-vs-acceleration-direction` — conceptual: assumed acceleration points along the motion

### Equation sheet (`equations.ts`)

Each entry:
```ts
interface Equation {
  id: EquationId;                 // "ac-v2-over-r"
  latex: string;
  name: string;                   // "Centripetal acceleration"
  chapter: string;
  variables: { symbol: string; meaning: string; unit: string }[];
  useWhen: string[];              // concrete situational cues
  dontUseWhen: string[];          // the traps
  triggers: string[];             // words/phrases in a problem that point here ("constant speed in a circle", "rev/min", "banked", "about to slip")
  onSheet: boolean;               // true = likely on the provided formula sheet; false = a derived result you should know how to derive
  derivedFrom?: EquationId[];     // for derived results, e.g. v_max = √(μ_s g r) ← ΣF_c = mv²/r + f_s = μ_s N + N = mg
}
```
Cover at minimum: kinematics (4 constant-acceleration equations), vector components / magnitude / direction, radians conversion, s = rθ, v = 2πr/T, ω = Δθ/Δt = 2π/T, v = rω, a_c = v²/r = rω², a = √(a_c² + a_t²), ΣF = ma (component form), W = mg, f_s ≤ μ_s N, f_k = μ_k N, F_s = −kx, ΣF_c = mv²/r, v_max = √(μ_s g r) (derived), tan θ = v²/(rg) (derived), F = Gm₁m₂/r², g = GM/r², v_orbit = √(GM/r), T = 2π√(r³/GM), W = Fd cos θ, W = ∫F dx, W_spring = ½k(x_i² − x_f²), K = ½mv², W_net = ΔK.

The real formula sheet's exact contents are unknown. Keep `onSheet` easy to edit so it can be matched to the actual sheet later.

## Answer checking rules

- Numeric free-response: accept within **±2% relative** of the computed answer (handles rounding and constant differences). Show the expected answer to 3 sig figs with units.
- MCQ: 4 or 5 choices. Correct answer + distractors from named errors. If two choices are within 3% of each other, drop one and pull another error (or fall back to a ×2 / ÷2 slip labeled `arithmetic-slip`). Shuffle with the seeded RNG.
- After answering (right or wrong), show: correct/incorrect, if a distractor was picked → **the error label + explanation**, then the full solution with the recipe and the equations used (as links to their equation-sheet cards).

## Parameter generation rules

- Every number is drawn from a realistic range and rounded to 2–3 sig figs ("nice" values — 35.0 m, not 34.8713 m).
- Templates must **reject and regenerate** physically invalid combos (negative normal force, speed below the minimum at the top of a loop unless that's the point, friction cases where you meant "slides" but it doesn't).
- Rotate the unknown via `variants` wherever the physics allows (flat curve: v_max / μ_s / r; banked curve: θ / v / r; orbit: v / T / r / M).
- Vary the "skin" (car / bike / child on ride / ball on string) when it's the same physics, so the student recognizes the *situation* rather than the story.
- Some templates should deliberately include an irrelevant given (e.g. the car's mass in a v_max problem) — recognizing what you don't need is a skill.

## App modes

1. **Practice by topic** — topic tree grouped Exam 2 (first) / Exam 1. Pick a topic → random template from it, or pick a specific template. Toggle MCQ vs free-response. Buttons: Hint (progressive), Submit, Show solution, Next (new numbers), Same type again.
2. **Equation Detective** — the equation-selection trainer (see Session 4 prompt for full spec). Includes the equation-sheet reference page.
3. **Exam simulation** — N mixed MCQs (default 20), weighted toward Exam 2 chapters, optional timer, no hints, results broken down by topic and by named error.
4. **Weak spots** — drills the templates/errors with the worst recent accuracy.

## Progress tracking (`storage.ts`)

- Single versioned key (e.g. `phys1-trainer:v1`). Every read/write in try/catch; app must work with storage unavailable.
- Per template: attempts, correct, last 10 results, lastSeen. Per error id: times committed. Per equation: detective attempts/correct.
- Settings: exam date (shows countdown on home), default mode (MCQ/free-response), theme.
- Export/import progress as JSON (Settings page).

## UI requirements

- Mobile-first, works on a phone at 375px wide; desktop gets a two-column layout (question | work/solution).
- Keyboard: 1–5 select choice, Enter submit, N next, H hint, S solution.
- Question URL includes template id + seed (`#/q/ch6.flat-curve.vmax/123456`) so any question can be revisited.
- Diagrams: labeled, roughly to scale with the generated angles/lengths, readable in both themes.
- Clean and calm, not gamified-noisy. Mastery bar per topic on home.

## Project invariants (never break these)

- Every answer is computed by the template's solver from the generated parameters — never hardcoded.
- Every template has a golden test (review's original numbers → review's answer) when the review provides one, and is covered by the property test.
- Every distractor maps to a named error in `errors.ts`.
- Constants come only from `constants.ts`.
- Content (topics, equations, templates, errors, detective scenarios) stays separate from UI. Adding a template = one new file + one registry line.
- No backend, no network calls at runtime, no committed source PDFs.
- All storage access goes through `storage.ts`.

## Golden values (verified — use as tests)

| Template situation | Inputs | Expected |
|---|---|---|
| Fan, centripetal accel | 360 rev/min, r = 10.0 cm | a_c ≈ 142 m/s² |
| Radians | 45° | π/4 |
| Arc length | half revolution | πr |
| Hanging chandelier | 20 kg, at rest | T = 196 N |
| Pushed up | 2.00 kg, 25.0 N up | a = 2.70 m/s² |
| Atwood/table (frictionless) | m₁ = 4.00 kg table, m₂ = 1.00 kg hanging | a = 1.96 m/s², T = 7.84 N, v after 1.00 m drop = 1.98 m/s |
| Hooke's law | k = 50 N/m, x = 1 cm | 0.5 N |
| Spring on incline | 30.0 kg, 60°, x = 5.0 cm | k ≈ 5.09 × 10³ N/m |
| Spring + rope on incline | 10.0 kg, 30.0°, k = 330 N/m, T = 50.0 N (rope pulls down-slope) | x = 0.30 m |
| Roller coaster top of loop | 40.0 kg, r = 7.00 m, v = 10.0 m/s | N = 179 N; v_min = 8.28 m/s |
| Ferris wheel | r = 10.0 m, v = 3.00 m/s | N_bottom = 1.09 mg, N_top = 0.908 mg |
| Flat curve centripetal force | 900 kg, r = 500 m, v = 25.0 m/s | 1125 N; μ_s,min = 0.128 |
| Flat curve v_max | r = 35.0 m, μ_s = 0.523 | 13.4 m/s |
| Flat curve wet | r = 35.0 m, skids at 8.00 m/s | μ_s = 0.187 |
| Banked frictionless | v = 13.4 m/s, r = 35.0 m | θ = 27.6° |
| Banked frictionless | r = 100.0 m, θ = 31.0° | v ≈ 24.3 m/s (review's MCQ answer choice is 24.4) |
| g at ISS altitude | h = 400 km | 8.68 m/s² (review says 8.67 — within tolerance) |
| Gravity distance doubled | — | force ÷ 4 |
| Weight at h = R_E | — | ¼ of surface weight |
| ISS angular speed | v = 7.67 × 10³ m/s, h = 400 km | ω = 1.13 × 10⁻³ rad/s |
| Planet mass from orbit | T = 84 s, r = 8.0 × 10⁶ m | M ≈ 4.3 × 10²⁸ kg |
| Work at angle | F = 50.0 N, 30.0°, d = 3.00 m | W = 130 J |
| Variable force | F = −2.0/x N, x: 2.0 → 5.0 m | W = −1.83 J (review rounds to −1.81) |
| Angled push on block (SI Q20) | 7.0 kg, 18 N at 25° below horizontal, μ_s = 0.55, μ_k = 0.15 | a = 0 (static friction holds — f_s,max ≈ 41.9 N > 16.3 N) |
| Critical angle (SI Q22) | μ_s = 0.35 | θ = 19.3° |
| Spring + rope incline (SI Q23) | 17.5 kg, 25.0°, k = 450 N/m, T = 75.0 N | x ≈ 0.328 m |
| Table + hanging (SI Q24) | m₁ = 5.00 kg, m₂ = 1.50 kg | μ_s needed = 0.300; with μ_k = 0.10: a = 1.51 m/s², T = 12.4 N |
| Fan (SI Q25) | r = 36.0 cm, T = 0.221 s | ω = 28.4 rad/s, a_c ≈ 291 m/s² at tip, 0 at center |
| U-turn (SI Q26) | diameter 200 m, v = 6.20 m/s, a_t = 2.20 m/s² | a = 2.23 m/s² |
| Conical pendulum (SI Q27) | 2.00 kg, string 80° from vertical | T ≈ 113 N, a_c ≈ 55.6 m/s² |
| Unbanked curve (SI Q28) | r = 85 m, v = 25 m/s | μ_s = 0.750; frictionless bank = 36.9° |
| Traffic light (SI Q21) | 50.0 kg; cables 41° and 73° from ceiling | T₃ = 490 N, T₁ ≈ 157 N, T₂ ≈ 405 N |

## Working style for the coding agent

- Small, reviewable sessions. Don't start the next session's work.
- If something in this spec seems wrong physically, stop and say so rather than "fixing" it silently.
- Update `PROGRESS.md` at the end of each session (what's done, what's next).
