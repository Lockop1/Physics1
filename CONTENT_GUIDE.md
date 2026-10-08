# Content guide — adding templates, errors, equations

Content lives in `src/content/` and is completely separate from the UI. The
UI only knows about the `QuestionTemplate` / `GeneratedQuestion` types in
`src/engine/types.ts`.

## Adding a question template

1. **Create one file** under the right chapter folder, e.g.
   `src/content/templates/ch6-applications/flatCurve.ts`.
2. **Export a pure `solve()`** that takes the physical parameters and returns
   the answer(s). Golden tests call this directly with the review's original
   numbers, so keep it free of RNG and formatting.
3. **Export `template: QuestionTemplate`** with:
   - `id` — `"<topic>.<name>"`, e.g. `"ch6.flat-curve.vmax"`. Used in URLs.
   - `topicId` — must exist in `src/content/topics.ts`.
   - `source` — where the student can find the original, e.g.
     `"Exam 2 Review — Example #2(a)"`.
   - `kind` — `"numeric"` (MCQ or typed) or `"conceptual"` (MCQ only).
   - `variants` — the unknowns the template rotates through. Use
     `chooseVariant(rng, this.variants!, opts?.variant)` from `helpers.ts`.
   - `generate(rng, opts)` — draws parameters with `nice()` / `sig()` from
     `src/engine/params.ts`, rejects invalid combos with `rejectUntil()`,
     calls `solve()`, and returns a `GeneratedQuestion`.
4. **Register it**: one import + one array entry in
   `src/content/templates/index.ts`.
5. **Run `npm test`.** The property test picks up every registered template
   automatically and checks: finite answer, exactly one correct choice, all
   choices > 3 % apart, every distractor has a known `errorId`, every equation
   id exists, the last solution step's `value` equals the answer, givens have
   ≤ 4 significant figures, and every declared variant is actually produced.
6. **Add a golden test** in `tests/golden/` if the review provides an answer
   for that situation: call `solve()` with the review's numbers and assert
   within ±2 %.

### Rules for `generate()`

- Every number comes from the RNG and is "nice" (`nice(rng, 20, 60, 5)` →
  20, 25, …, 60; `sig(rng, 0.1, 0.5, 3)` → 3 sig figs).
- `answer` is `solve(...)` — never a literal.
- `choices` come from `buildNumericChoices(rng, answer, candidates)` where each
  candidate is `{ errorId, value }` and `value` is what the *named mistake*
  produces from the *same* parameters. The builder drops anything within 3 %
  of another choice and fills to 4 with `arithmetic-slip` (×2, ÷2, ×10, …).
  For conceptual questions use `buildStringChoices()`.
- `solution` is a list of steps; each has `text`, optional `latex`
  (display math), optional `equationId`, and `value`. **The last step must
  carry `value` equal to the answer** (the property test checks this).
- `hints` are progressive: (1) what kind of situation this is, (2) which
  equations, (3) the actual setup with numbers.
- `recipe` is the plain-English plan shown after submitting.
- `equations` lists the sheet equations in the order you'd use them.
- `givens` lists what the prompt states (use `note: "diameter"` to make a trap
  visible). Include an irrelevant given now and then, and say so in `note`.
- Put a `diagram` on the question when it helps. See "Adding a diagram".
- Use `q(value, unit)` from `helpers.ts` for inline numbers with units in the
  prompt (renders as KaTeX) and `fx(value)` for numbers inside `latex`.

## Adding a named error (distractor)

Append to `ERRORS` in `src/content/errors.ts`:

```ts
e("my-new-error", "Short label", "One or two sentences on why it's wrong.", "exam2"),
```

Never change an existing `id` — stored progress is keyed by it.

## Adding or editing an equation

Append to `EQUATIONS` in `src/content/equations.ts`. Fill in all of:
`latex`, `name`, `chapter`, `variables`, `useWhen`, `dontUseWhen`,
`triggers`, `onSheet`, and `derivedFrom` (required when `onSheet: false`).
The content integrity test enforces this. Never change an existing `id`.

When the real formula sheet is known, flip `onSheet` flags to match.

## Adding a diagram

1. Add a new variant to the `DiagramSpec` union in `src/diagrams/types.ts`
   (discriminated by `kind`).
2. Write a parameter-driven SVG component in `src/diagrams/` using the CSS
   variables `--diagram-stroke`, `--diagram-muted`, `--diagram-velocity`,
   `--diagram-accel`, `--diagram-bg` so it works in both themes.
3. Add a `case` in `src/diagrams/Diagram.tsx`.
4. Keep it readable at 260 px wide (phones).

## Adding a topic

Add a `t(...)` entry inside the right chapter in `src/content/topics.ts`.
Topics with zero templates show as "coming in a later session" on the home page.
