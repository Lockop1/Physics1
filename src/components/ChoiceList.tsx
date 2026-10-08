import type { Choice } from "../engine/types";
import { RichText } from "../lib/latex";
import { fmtDisplay } from "../engine/params";
import { errorById } from "../content/errors";

interface Props {
  choices: Choice[];
  unit: string;
  selected: number | null;
  submitted: boolean;
  onSelect: (i: number) => void;
  /** Show the named-mistake label on the picked wrong choice (default true). */
  showTag?: boolean;
}

export function choiceLabel(c: Choice, unit: string): string {
  if (c.label) return c.label;
  if (typeof c.value === "string") return c.value;
  return unit ? `${fmtDisplay(c.value)} ${unit}` : fmtDisplay(c.value);
}

/**
 * The answer choices. After submission only two things stand out: the correct choice (green)
 * and, if different, the one you picked (red, with the named mistake). The rest fade.
 */
export function ChoiceList({ choices, unit, selected, submitted, onSelect, showTag = true }: Props) {
  return (
    <div className="choices" role="radiogroup">
      {choices.map((c, i) => {
        let cls = "choice";
        const picked = selected === i;
        if (submitted) {
          if (c.correct) cls += " correct";
          else if (picked) cls += " wrong";
          else cls += " dim";
        } else if (picked) cls += " selected";
        const err = submitted && picked && !c.correct && showTag && c.errorId ? errorById(c.errorId) : null;
        return (
          <button key={i} className={cls} onClick={() => !submitted && onSelect(i)} role="radio" aria-checked={picked} disabled={submitted}>
            <span className="key">{i + 1}</span>
            <span className="label">
              <RichText text={choiceLabel(c, unit)} />
            </span>
            {err && <span className="tag">{err.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
