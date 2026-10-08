import type { Equation } from "../content/equations";
import { Tex } from "../lib/latex";
import type { SetGrade } from "../engine/detective";

interface Props {
  options: Equation[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  grade: SetGrade | null;
  correct: Set<string>;
}

export function EquationPicker({ options, selected, onToggle, grade, correct }: Props) {
  return (
    <div className="eq-options">
      {options.map((eq, i) => {
        const isSel = selected.has(eq.id);
        let cls = "eq-option";
        if (grade) {
          if (correct.has(eq.id)) cls += isSel ? " correct" : " missed";
          else if (isSel) cls += " wrong";
        } else if (isSel) cls += " selected";
        return (
          <button key={eq.id} className={cls} onClick={() => !grade && onToggle(eq.id)} disabled={!!grade} aria-pressed={isSel}>
            <span className="key">{i + 1}</span>
            <span className="eq-option-body">
              <span className="small muted">{eq.name}</span>
              <Tex>{eq.latex}</Tex>
            </span>
            {grade && correct.has(eq.id) && !isSel && <span className="tag">needed</span>}
            {grade && !correct.has(eq.id) && isSel && <span className="tag">decoy</span>}
          </button>
        );
      })}
    </div>
  );
}
