export type ExamId = "exam2" | "exam1";

export interface Topic {
  id: string; // "ch4.ucm"
  title: string;
  chapter: string; // "Ch 4"
  exam: ExamId;
}

export interface Chapter {
  id: string;
  title: string;
  exam: ExamId;
  topics: Topic[];
}

const t = (exam: ExamId, chapter: string, id: string, title: string): Topic => ({
  id,
  title,
  chapter,
  exam,
});

export const CHAPTERS: Chapter[] = [
  // ---------------- Exam 2 ----------------
  {
    id: "ch4",
    title: "Ch 4 — Circular motion",
    exam: "exam2",
    topics: [t("exam2", "Ch 4", "ch4.ucm", "Uniform & non-uniform circular motion")],
  },
  {
    id: "ch5",
    title: "Ch 5 — Newton's laws",
    exam: "exam2",
    topics: [
      t("exam2", "Ch 5", "ch5.concepts", "Newton's laws (concepts)"),
      t("exam2", "Ch 5", "ch5.net-force", "Net force & acceleration"),
      t("exam2", "Ch 5", "ch5.normal", "Normal force"),
      t("exam2", "Ch 5", "ch5.tension", "Tension & equilibrium"),
      t("exam2", "Ch 5", "ch5.friction", "Friction"),
      t("exam2", "Ch 5", "ch5.inclines", "Inclines"),
      t("exam2", "Ch 5", "ch5.pulleys", "Connected objects & pulleys"),
      t("exam2", "Ch 5", "ch5.springs", "Springs (Hooke's law)"),
    ],
  },
  {
    id: "ch6",
    title: "Ch 6 — Applications of Newton's laws",
    exam: "exam2",
    topics: [
      t("exam2", "Ch 6", "ch6.vertical-circle", "Vertical circles (loops, Ferris wheel)"),
      t("exam2", "Ch 6", "ch6.flat-curve", "Flat curves"),
      t("exam2", "Ch 6", "ch6.banked-curve", "Banked curves"),
      t("exam2", "Ch 6", "ch6.conical-pendulum", "Conical pendulum"),
    ],
  },
  {
    id: "ch13",
    title: "Ch 13 — Gravitation",
    exam: "exam2",
    topics: [
      t("exam2", "Ch 13", "ch13.universal", "Universal gravitation"),
      t("exam2", "Ch 13", "ch13.g-altitude", "g at altitude"),
      t("exam2", "Ch 13", "ch13.orbits", "Orbits"),
    ],
  },
  {
    id: "ch7",
    title: "Ch 7 — Work",
    exam: "exam2",
    topics: [
      t("exam2", "Ch 7", "ch7.constant-force", "Work by constant force"),
      t("exam2", "Ch 7", "ch7.varying-force", "Work by varying force (integrals)"),
      t("exam2", "Ch 7", "ch7.graphs", "Work from F–x graphs"),
      t("exam2", "Ch 7", "ch7.spring-work", "Spring work"),
      t("exam2", "Ch 7", "ch7.work-energy", "Work–energy theorem"),
    ],
  },
  // ---------------- Exam 1 ----------------
  {
    id: "e1-vectors-units",
    title: "Vectors & units",
    exam: "exam1",
    topics: [
      t("exam1", "Ch 1–3", "e1.vectors", "Vectors"),
      t("exam1", "Ch 1", "e1.units", "Unit conversions"),
    ],
  },
  {
    id: "e1-kinematics",
    title: "Kinematics",
    exam: "exam1",
    topics: [
      t("exam1", "Ch 2", "e1.kin1d", "1D kinematics"),
      t("exam1", "Ch 2", "e1.calculus", "Position/velocity functions (calculus)"),
      t("exam1", "Ch 2", "e1.graphs", "Motion graphs"),
      t("exam1", "Ch 4", "e1.kin2d", "2D kinematics"),
      t("exam1", "Ch 2", "e1.freefall", "Free fall"),
      t("exam1", "Ch 4", "e1.projectiles", "Projectile motion"),
    ],
  },
];

export const TOPICS: Topic[] = CHAPTERS.flatMap((c) => c.topics);

export function topicById(id: string): Topic | undefined {
  return TOPICS.find((x) => x.id === id);
}

export function chaptersFor(exam: ExamId): Chapter[] {
  return CHAPTERS.filter((c) => c.exam === exam);
}
