import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { templatesUsingEquation } from "../lib/detective";
import { createRng, randomSeed } from "../engine/rng";

/** /practice-eq/:equationId → random question from a template that uses the equation. */
export function PracticeByEquationPage() {
  const { equationId = "" } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const ids = templatesUsingEquation(equationId);
    if (ids.length === 0) {
      navigate("/equations", { replace: true });
      return;
    }
    const rng = createRng(randomSeed());
    navigate(`/q/${rng.pick(ids)}/${randomSeed()}`, { replace: true });
  }, [equationId, navigate]);
  return <p className="muted">Picking a problem…</p>;
}
