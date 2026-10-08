/**
 * Template registry. Adding a template = one new file + one line here.
 */
import type { QuestionTemplate } from "../../engine/types";

import { template as ch4RadDeg } from "./ch4-circular/radDeg";
import { template as ch4ArcLength } from "./ch4-circular/arcLength";
import { template as ch4PeriodSpeedOmega } from "./ch4-circular/periodSpeedOmega";
import { template as ch4AcRpm } from "./ch4-circular/acRpm";
import { template as ch4NonUniform } from "./ch4-circular/nonUniform";
import { template as ch4Direction } from "./ch4-circular/direction";

export const TEMPLATES: QuestionTemplate[] = [
  ch4RadDeg,
  ch4ArcLength,
  ch4PeriodSpeedOmega,
  ch4AcRpm,
  ch4NonUniform,
  ch4Direction,
];

const byId = new Map(TEMPLATES.map((t) => [t.id, t]));

export function templateById(id: string): QuestionTemplate | undefined {
  return byId.get(id);
}

export function templatesForTopic(topicId: string): QuestionTemplate[] {
  return TEMPLATES.filter((t) => t.topicId === topicId);
}
