import type { Transition } from 'motion/react';
import type { WhyStep } from './scrollBeatGates';

const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Smooth 0→1 ramp between edges (Hermite). */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const span = Math.max(1e-6, edge1 - edge0);
  const t = Math.max(0, Math.min(1, (x - edge0) / span));
  return t * t * (3 - 2 * t);
}

/**
 * Scroll-linked blend for intro ↔ evidence stage in WhyItMattersSection.
 * Decouples visual crossfade from discrete beat gates so scroll feels continuous
 * in both directions.
 */
export function computeIntroStageHandoff(
  progress: number,
  step: WhyStep,
  reduceMotion: boolean,
): number {
  if (reduceMotion) return step === 'intro' ? 0 : 1;

  const enterStart = 0.05;
  const enterEnd = 0.22;
  const exitStart = 0.02;
  const exitEnd = 0.16;

  if (step === 'intro') {
    return smoothstep(enterStart, enterEnd, progress);
  }
  if (step === 'e1') {
    return progress >= exitEnd ? 1 : smoothstep(exitStart, exitEnd, progress);
  }
  return 1;
}

/** Scroll thresholds that commit the intro ↔ stage handoff (animation runs to completion). */
export const WHY_INTRO_HANDOFF = {
  stageCommitProgress: 0.085,
  introCommitProgress: 0.145,
  stageLockedProgress: 0.19,
  introLockedProgress: 0.04,
  duration: 0.72,
} as const;

/**
 * Returns the handoff target when scroll crosses a commit edge.
 * `null` = stay on the current in-flight animation.
 */
export function resolveIntroStageHandoffCommit(
  progress: number,
  step: WhyStep,
  goingUp: boolean,
): 'intro' | 'stage' | null {
  if (step !== 'intro' && step !== 'e1') return 'stage';

  const {
    stageCommitProgress,
    introCommitProgress,
    stageLockedProgress,
    introLockedProgress,
  } = WHY_INTRO_HANDOFF;

  if (progress >= stageLockedProgress) return 'stage';
  if (progress <= introLockedProgress) return 'intro';
  if (!goingUp && progress >= stageCommitProgress) return 'stage';
  if (goingUp && progress <= introCommitProgress) return 'intro';
  return null;
}

export interface CrossfadeTarget {
  opacity: number;
  y: number;
}

export function crossfadeTarget(
  active: boolean,
  direction: 'up' | 'down',
  reduceMotion: boolean,
): CrossfadeTarget {
  if (reduceMotion) return { opacity: active ? 1 : 0, y: 0 };
  if (active) return { opacity: 1, y: 0 };
  return { opacity: 0, y: direction === 'up' ? 12 : -8 };
}

export function crossfadeTransition(reduceMotion: boolean): Transition {
  return { duration: reduceMotion ? 0.01 : 0.42, ease: EASE_OUT_SOFT };
}
