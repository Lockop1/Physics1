import { Link } from "react-router-dom";

export function Countdown({ examDate }: { examDate: string | null }) {
  if (!examDate) {
    return (
      <div className="countdown muted small">
        <Link to="/settings">Set your exam date</Link> to see a countdown.
      </div>
    );
  }
  const target = new Date(examDate + "T00:00:00");
  const now = new Date();
  const days = Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
  if (Number.isNaN(days)) return null;
  return (
    <div className="countdown">
      {days > 0 ? (
        <>
          <strong>{days}</strong> day{days === 1 ? "" : "s"} until Exam 2 ({examDate})
        </>
      ) : days === 0 ? (
        <strong>Exam 2 is today. Breathe.</strong>
      ) : (
        <span className="muted">Exam 2 was {-days} day{days === -1 ? "" : "s"} ago.</span>
      )}
    </div>
  );
}
