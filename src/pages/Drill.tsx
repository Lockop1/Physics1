import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { nextWeakSpot, nextForError } from "../lib/question";

/** /drill/weak → weakest template; /drill/error/:errorId → template that produces that error. */
export function DrillPage() {
  const { errorId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const pick = errorId ? nextForError(errorId) : nextWeakSpot();
    if (!pick) {
      navigate("/", { replace: true });
      return;
    }
    navigate(`/q/${pick.template.id}/${pick.seed}?drill=${errorId ? `error:${errorId}` : "weak"}`, { replace: true });
  }, [errorId, navigate]);
  return <p className="muted">Picking a weak spot…</p>;
}
