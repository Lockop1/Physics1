import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRng, randomSeed } from "../engine/rng";
import { CHAPTERS } from "../content/topics";
import { templatesForTopic } from "../content/templates";
import { pickTemplate } from "../engine/selection";
import { getTemplateStats } from "../lib/storage";

/** /practice-exam2 → a random (weak-spot-weighted) question from any Exam 2 topic. */
export function RandomExam2Page() {
  const navigate = useNavigate();
  useEffect(() => {
    const pool = CHAPTERS.filter((c) => c.exam === "exam2").flatMap((c) => c.topics).flatMap((t) => templatesForTopic(t.id));
    const t = pickTemplate(createRng(randomSeed()), pool, getTemplateStats);
    navigate(`/q/${t.id}/${randomSeed()}`, { replace: true });
  }, [navigate]);
  return <p className="muted">Picking…</p>;
}
