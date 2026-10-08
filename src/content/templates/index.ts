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

import { template as ch5WhichLaw } from "./ch5-newton/whichLaw";
import { template as ch5ActionReaction } from "./ch5-newton/actionReaction";
import { template as ch5NetForceZero } from "./ch5-newton/netForceZero";
import { template as ch5MassVsWeight } from "./ch5-newton/massVsWeight";
import { template as ch5TwoForces } from "./ch5-newton/twoForcesAngles";
import { template as ch5PushedUp } from "./ch5-newton/pushedUp";
import { template as ch5ForceKinematics } from "./ch5-newton/forceKinematics";
import { template as ch5NormalForce } from "./ch5-newton/normalForce";
import { template as ch5ApparentWeight } from "./ch5-newton/apparentWeight";
import { template as ch5NormalConcept } from "./ch5-newton/normalConcept";
import { template as ch5TwoCables } from "./ch5-newton/twoCables";
import { template as ch5ElevatorTension } from "./ch5-newton/elevatorTension";
import { template as ch5TensionConcept } from "./ch5-newton/tensionConcept";
import { template as ch5AngledFriction } from "./ch5-newton/angledForceFriction";
import { template as ch5RopeAngle } from "./ch5-newton/ropeAngleKinetic";
import { template as ch5CabinetPush } from "./ch5-newton/cabinetPush";
import { template as ch5CriticalAngle } from "./ch5-newton/criticalAngle";
import { template as ch5Stuck } from "./ch5-newton/stuckOnIncline";
import { template as ch5Sliding } from "./ch5-newton/slidingIncline";
import { template as ch5TablePulley } from "./ch5-newton/tablePulley";
import { template as ch5TablePulleyFriction } from "./ch5-newton/tablePulleyFriction";
import { template as ch5Atwood } from "./ch5-newton/atwood";
import { template as ch5Hooke } from "./ch5-newton/hookeBasics";
import { template as ch5SpringIncline } from "./ch5-newton/springIncline";
import { template as ch5SpringRope } from "./ch5-newton/springRopeIncline";

export const TEMPLATES: QuestionTemplate[] = [
  ch4RadDeg,
  ch4ArcLength,
  ch4PeriodSpeedOmega,
  ch4AcRpm,
  ch4NonUniform,
  ch4Direction,
  // Ch 5
  ch5WhichLaw,
  ch5ActionReaction,
  ch5NetForceZero,
  ch5MassVsWeight,
  ch5TwoForces,
  ch5PushedUp,
  ch5ForceKinematics,
  ch5NormalForce,
  ch5ApparentWeight,
  ch5NormalConcept,
  ch5TwoCables,
  ch5ElevatorTension,
  ch5TensionConcept,
  ch5AngledFriction,
  ch5RopeAngle,
  ch5CabinetPush,
  ch5CriticalAngle,
  ch5Stuck,
  ch5Sliding,
  ch5TablePulley,
  ch5TablePulleyFriction,
  ch5Atwood,
  ch5Hooke,
  ch5SpringIncline,
  ch5SpringRope,
];

const byId = new Map(TEMPLATES.map((t) => [t.id, t]));

export function templateById(id: string): QuestionTemplate | undefined {
  return byId.get(id);
}

export function templatesForTopic(topicId: string): QuestionTemplate[] {
  return TEMPLATES.filter((t) => t.topicId === topicId);
}
