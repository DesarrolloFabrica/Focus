/** ~110vh de recorrido sticky por beat legible (ver focus-modern.css). */
export const READ_BEAT_VH = 110;

export interface BeatGate {
  forward: number;
  backward: number;
}

export type NoisePhase = 'phase1' | 'phase2' | 'handoff';
export type WhyStep = 'intro' | 'e1' | 'e2' | 'e3' | 'e4' | 'convergence';
export type BridgeBeat = 'conclusion' | 'handoff';

/**
 * forward en el beat N = umbral de scroll (0–1) para SALIR del beat N-1 al bajar.
 * backward = umbral para VOLVER al beat anterior al subir (histéresis ≥15%).
 */

/** 3 beats — NoiseFilterTransition (~330vh) */
export const NOISE_PHASE_GATES: Record<NoisePhase, BeatGate> = {
  phase1: { forward: 0, backward: 0 },
  phase2: { forward: 0.34, backward: 0.19 },
  handoff: { forward: 0.68, backward: 0.53 },
};

export const NOISE_PHASES: NoisePhase[] = ['phase1', 'phase2', 'handoff'];

/** 6 beats — WhyItMattersSection (~660vh) */
export const WHY_STEP_GATES: Record<WhyStep, BeatGate> = {
  intro: { forward: 0, backward: 0 },
  e1: { forward: 0.17, backward: 0.02 },
  e2: { forward: 0.34, backward: 0.19 },
  e3: { forward: 0.51, backward: 0.36 },
  e4: { forward: 0.68, backward: 0.53 },
  convergence: { forward: 0.85, backward: 0.70 },
};

export const WHY_STEPS: WhyStep[] = ['intro', 'e1', 'e2', 'e3', 'e4', 'convergence'];

/** Scroll progress (0–1) at the center of each beat — used for click-to-select sync. */
export function whyStepTargetProgress(step: WhyStep): number {
  const idx = WHY_STEPS.indexOf(step);
  const start = idx <= 0 ? 0 : (WHY_STEP_GATES[WHY_STEPS[idx] as WhyStep]?.forward ?? 0);
  const nextStep = WHY_STEPS[idx + 1];
  const end = nextStep ? (WHY_STEP_GATES[nextStep]?.forward ?? 1) : 1;
  return (start + end) / 2;
}

/** 2 beats — WhyChangesBridge (~320vh) */
export const BRIDGE_BEAT_GATES: Record<BridgeBeat, BeatGate> = {
  conclusion: { forward: 0, backward: 0 },
  handoff: { forward: 0.55, backward: 0.40 },
};

export const BRIDGE_BEATS: BridgeBeat[] = ['conclusion', 'handoff'];

export function stepFromProgressForward<T extends string>(
  p: number,
  steps: T[],
  gates: Record<string, BeatGate>,
): T {
  for (let i = 1; i < steps.length; i += 1) {
    const step = steps[i];
    const gate = gates[step];
    if (gate && p < gate.forward) return steps[i - 1];
  }
  return steps[steps.length - 1];
}

export function resolveBeatWithHysteresis<T extends string>(
  p: number,
  current: T,
  goingUp: boolean,
  steps: T[],
  gates: Record<string, BeatGate>,
): T {
  if (!goingUp) return stepFromProgressForward(p, steps, gates);

  let index = steps.indexOf(current);
  while (index > 0) {
    const gate = gates[steps[index]];
    if (gate && p < gate.backward) index -= 1;
    else break;
  }
  return steps[index];
}
