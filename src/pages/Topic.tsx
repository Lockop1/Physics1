import { Link, useParams } from "react-router-dom";
import { topicById } from "../content/topics";
import { templatesForTopic } from "../content/templates";
import { getTemplateStats, masteryFor } from "../lib/storage";
import { MasteryBar } from "../components/MasteryBar";

export function TopicPage() {
  const { topicId = "" } = useParams();
  const topic = topicById(topicId);
  const temps = templatesForTopic(topicId);
  if (!topic) return <p>Unknown topic.</p>;
  const { mastery, attempts } = masteryFor(temps.map((t) => t.id));
  return (
    <div>
      <p className="small muted">
        <Link to="/">Home</Link> › {topic.chapter}
      </p>
      <h1>{topic.title}</h1>
      <div style={{ maxWidth: 360, marginBottom: 14 }}>
        <MasteryBar mastery={mastery} attempts={attempts} />
      </div>
      <div className="row" style={{ marginBottom: 16 }}>
        <Link className="btn primary" to={`/practice/${topic.id}`}>
          Random question from this topic
        </Link>
      </div>
      <div className="card">
        <h2>Question types</h2>
        {temps.length === 0 && <p className="muted">No templates yet.</p>}
        <ul className="template-list">
          {temps.map((t) => {
            const s = getTemplateStats(t.id);
            return (
              <li key={t.id}>
                <div className="grow">
                  <div>
                    <strong>{t.title}</strong>{" "}
                    <span className="diff" title={`difficulty ${t.difficulty}`}>
                      {"★".repeat(t.difficulty)}
                    </span>{" "}
                    <span className="badge">{t.kind}</span>
                  </div>
                  <div className="small muted">
                    {t.source ?? ""}
                    {t.variants ? ` · unknown rotates: ${t.variants.join(", ")}` : ""}
                  </div>
                </div>
                <div className="small muted stat">{s ? `${s.correct}/${s.attempts}` : "—"}</div>
                <Link className="btn" to={`/q/${t.id}`}>
                  Practice
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
