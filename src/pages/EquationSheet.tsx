import { equationsByChapter, type Equation } from "../content/equations";
import { Tex } from "../lib/latex";

function EquationCard({ eq }: { eq: Equation }) {
  return (
    <div className="card eq-card" id={eq.id}>
      <div className="row spread">
        <strong>{eq.name}</strong>
        <span className={"badge " + (eq.onSheet ? "sheet" : "derived")}>{eq.onSheet ? "on sheet" : "derived"}</span>
      </div>
      <Tex block>{eq.latex}</Tex>
      <ul>
        {eq.variables.map((v) => (
          <li key={v.symbol}>
            <Tex>{v.symbol}</Tex> — {v.meaning}
            {v.unit && v.unit !== "—" ? ` (${v.unit})` : ""}
          </li>
        ))}
      </ul>
      <h4>Use when</h4>
      <ul>
        {eq.useWhen.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h4>Don't use when</h4>
      <ul>
        {eq.dontUseWhen.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h4>Trigger phrases</h4>
      <div className="small muted">{eq.triggers.join(" · ")}</div>
      {eq.derivedFrom && (
        <>
          <h4>Derived from</h4>
          <div className="small">
            {eq.derivedFrom.map((d) => (
              <a key={d} href={`#${d}`} className="eq-link">
                {d}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function EquationSheetPage() {
  return (
    <div>
      <h1>Equation sheet</h1>
      <p className="muted">
        "On sheet" marks equations expected on the provided formula sheet; "derived" ones you should be able to build from
        sheet equations. (Flags are editable in <code>src/content/equations.ts</code> once the real sheet is known.)
      </p>
      {equationsByChapter().map(({ chapter, equations }) => (
        <section key={chapter} className="exam-section">
          <h2>{chapter}</h2>
          <div className="eq-grid">
            {equations.map((eq) => (
              <EquationCard key={eq.id} eq={eq} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
