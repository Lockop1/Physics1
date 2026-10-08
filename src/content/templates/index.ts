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

import { template as ch6SeatForce } from "./ch6-applications/seatForce";
import { template as ch6MinSpeed } from "./ch6-applications/minSpeedLoop";
import { template as ch6VerticalConcept } from "./ch6-applications/verticalCircleConcept";
import { template as ch6FlatCurve } from "./ch6-applications/flatCurve";
import { template as ch6CentripetalCar } from "./ch6-applications/centripetalForceCar";
import { template as ch6FlatConcept } from "./ch6-applications/flatCurveConcept";
import { template as ch6Banked } from "./ch6-applications/bankedCurve";
import { template as ch6FlatVsBanked } from "./ch6-applications/flatVsBanked";
import { template as ch6BankedConcept } from "./ch6-applications/bankedConcept";
import { template as ch6Conical } from "./ch6-applications/conicalPendulum";
import { template as ch6ConicalSpeed } from "./ch6-applications/conicalSpeedPeriod";
import { template as ch6ConicalConcept } from "./ch6-applications/conicalConcept";

import { template as ch13Ratio } from "./ch13-gravitation/ratioConcept";
import { template as ch13Force } from "./ch13-gravitation/gravForce";
import { template as ch13Concept } from "./ch13-gravitation/thirdLawGravity";
import { template as ch13GAltitude } from "./ch13-gravitation/gAtAltitude";
import { template as ch13WeightFraction } from "./ch13-gravitation/weightFraction";
import { template as ch13PlanetG } from "./ch13-gravitation/planetSurfaceG";
import { template as ch13OrbitSpeed } from "./ch13-gravitation/orbitSpeedPeriod";
import { template as ch13OrbitOmega } from "./ch13-gravitation/orbitAngularSpeed";
import { template as ch13PlanetMass } from "./ch13-gravitation/planetMass";
import { template as ch13OrbitConcept } from "./ch13-gravitation/orbitConcept";

import { template as ch7WorkAngle } from "./ch7-work/workAngle";
import { template as ch7Elevator } from "./ch7-work/elevatorWork";
import { template as ch7FrictionWork } from "./ch7-work/frictionWork";
import { template as ch7Ranking } from "./ch7-work/workRanking";
import { template as ch7WorkConcept } from "./ch7-work/workConcept";
import { template as ch7DotProduct } from "./ch7-work/dotProduct";
import { template as ch7PowerLaw } from "./ch7-work/powerLawForce";
import { template as ch7InverseX } from "./ch7-work/inverseXForce";
import { template as ch7Linear } from "./ch7-work/linearForce";
import { template as ch7GraphArea } from "./ch7-work/fxGraphArea";
import { template as ch7GraphInterval } from "./ch7-work/fxGraphConcept";
import { template as ch7GraphConcept } from "./ch7-work/graphConcept";
import { template as ch7SpringWork } from "./ch7-work/springWork";
import { template as ch7SpringWorkOn } from "./ch7-work/springWorkOn";
import { template as ch7SpringConcept } from "./ch7-work/springConcept";
import { template as ch7WESpeed } from "./ch7-work/workEnergySpeed";
import { template as ch7WEVarying } from "./ch7-work/varyingForceSpeed";
import { template as ch7FrictionPath } from "./ch7-work/frictionPath";
import { template as ch7FrictionStop } from "./ch7-work/frictionStop";
import { template as ch7PowerAvg } from "./ch7-work/powerAverage";
import { template as ch7PowerElevator } from "./ch7-work/powerElevator";
import { template as ch7Kwh } from "./ch7-work/kwh";

import { template as e1VecComponents } from "./exam1/vectorComponents";
import { template as e1VecAdd } from "./exam1/vectorAdd";
import { template as e1VecThree } from "./exam1/vectorResultant";
import { template as e1VecConcept } from "./exam1/vectorConcept";
import { template as e1Speed } from "./exam1/speedConversion";
import { template as e1Density } from "./exam1/densityConversion";
import { template as e1LAV } from "./exam1/lengthAreaVolume";
import { template as e1MultiPhase } from "./exam1/multiPhase";
import { template as e1Stopping } from "./exam1/stoppingDistance";
import { template as e1Chase } from "./exam1/chase";
import { template as e1Poly } from "./exam1/positionFunction";
import { template as e1VecFn } from "./exam1/vectorFunction";
import { template as e1Turning } from "./exam1/turningPoint";
import { template as e1VtGraph } from "./exam1/vtGraph";
import { template as e1GraphConcept } from "./exam1/graphConcept";
import { template as e1Slope } from "./exam1/accelFromGraph";
import { template as e1Accel2D } from "./exam1/constantAccel2D";
import { template as e1Trip } from "./exam1/avgVelocity2D";
import { template as e1DispVec } from "./exam1/displacementVector";
import { template as e1Drop } from "./exam1/dropFromHeight";
import { template as e1ThrownUp } from "./exam1/thrownUp";
import { template as e1CliffUpDown } from "./exam1/cliffUpDown";
import { template as e1FreefallConcept } from "./exam1/freefallConcept";
import { template as e1RangeHeight } from "./exam1/rangeHeight";
import { template as e1Horizontal } from "./exam1/horizontalLaunch";
import { template as e1CliffLaunch } from "./exam1/cliffLaunch";
import { template as e1ProjConcept } from "./exam1/projectileConcept";
import { template as e1SigFigs } from "./exam1/sigFigs";
import { template as e1OutAndBack } from "./exam1/outAndBack";
import { template as e1Chord } from "./exam1/chordDisplacement";
import { template as ch6TerminalSpeed } from "./ch6-applications/terminalSpeed";
import { template as ch6DragForce } from "./ch6-applications/dragForce";
import { template as ch6DragConcept } from "./ch6-applications/dragConcept";

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
  // Ch 6
  ch6SeatForce,
  ch6MinSpeed,
  ch6VerticalConcept,
  ch6FlatCurve,
  ch6CentripetalCar,
  ch6FlatConcept,
  ch6Banked,
  ch6FlatVsBanked,
  ch6BankedConcept,
  ch6Conical,
  ch6ConicalSpeed,
  ch6ConicalConcept,
  // Ch 13
  ch13Ratio,
  ch13Force,
  ch13Concept,
  ch13GAltitude,
  ch13WeightFraction,
  ch13PlanetG,
  ch13OrbitSpeed,
  ch13OrbitOmega,
  ch13PlanetMass,
  ch13OrbitConcept,
  // Ch 7
  ch7WorkAngle,
  ch7Elevator,
  ch7FrictionWork,
  ch7Ranking,
  ch7WorkConcept,
  ch7DotProduct,
  ch7PowerLaw,
  ch7InverseX,
  ch7Linear,
  ch7GraphArea,
  ch7GraphInterval,
  ch7GraphConcept,
  ch7SpringWork,
  ch7SpringWorkOn,
  ch7SpringConcept,
  ch7WESpeed,
  ch7WEVarying,
  ch7FrictionPath,
  ch7FrictionStop,
  ch7PowerAvg,
  ch7PowerElevator,
  ch7Kwh,
  // Exam 1
  e1VecComponents,
  e1VecAdd,
  e1VecThree,
  e1VecConcept,
  e1Speed,
  e1Density,
  e1LAV,
  e1MultiPhase,
  e1Stopping,
  e1Chase,
  e1Poly,
  e1VecFn,
  e1Turning,
  e1VtGraph,
  e1GraphConcept,
  e1Slope,
  e1Accel2D,
  e1Trip,
  e1DispVec,
  e1Drop,
  e1ThrownUp,
  e1CliffUpDown,
  e1FreefallConcept,
  e1RangeHeight,
  e1Horizontal,
  e1CliffLaunch,
  e1ProjConcept,
  // Session 7 coverage additions
  e1SigFigs,
  e1OutAndBack,
  e1Chord,
  ch6TerminalSpeed,
  ch6DragForce,
  ch6DragConcept,
];

const byId = new Map(TEMPLATES.map((t) => [t.id, t]));

export function templateById(id: string): QuestionTemplate | undefined {
  return byId.get(id);
}

export function templatesForTopic(topicId: string): QuestionTemplate[] {
  return TEMPLATES.filter((t) => t.topicId === topicId);
}
