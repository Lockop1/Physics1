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
}

export function choiceLabel(c: Choice, unit: string): string {
  if (c.label) return c.label;
  if (typeof c.value === "string") return c.value;
  return unit ? `${fmtDisplay(c.value)} ${unit}` : fmtDisplay(c.value);
}

export function ChoiceList({ choices, unit, selected, submitted, onSelect }: Props) {
  return (
    <div className="choices" role="radiogroup">
      {choices.map((c, i) => {
        let cls = "choice";
        if (submitted) {
          if (c.correct) cls += " correct";
          else if (selected === i) cls += " wrong";
        } else if (selected === i) cls += " selected";
        const err = submitted && !c.correct && c.errorId ? errorById(c.errorId) : null;
        return (
          <button key={i} className={cls} onClick={() => !submitted && onSelect(i)} role="radio" aria-checked={selected === i} disabled={submitted}>
            <span className="key">{i + 1}</span>
            <RichText text={choiceLabel(c, unit)} />
            {err && <span className="tag">{err.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
