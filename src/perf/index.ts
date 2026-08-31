export { initPerfTier, getPerfConfig, getPerfTier, subscribePerf } from './perfTier';
export type { PerfConfig, PerfTier } from './perfTier';
export { startManagedLoop } from './managedLoop';
export type { ManagedLoopOptions } from './managedLoop';
export { usePerfConfig } from './usePerf';
export { observeInView, isSubtreeInView } from './observeInView';
export { pauseSubtreeAnimations, resumeSubtreeAnimations } from './animationGate';
export {
  initBriefingScrollBus,
  registerBriefingSection,
  unregisterBriefingSection,
} from './briefingScrollBus';
export type { BriefingSectionMetrics } from './briefingScrollBus';
export {
  useBriefingSectionScroll,
  useBriefingSectionMetrics,
  useScrollBeat,
} from './useBriefingSectionScroll';
export {
  NOISE_PHASE_GATES,
  NOISE_PHASES,
  WHY_STEP_GATES,
  WHY_STEPS,
  BRIDGE_BEAT_GATES,
  BRIDGE_BEATS,
  READ_BEAT_VH,
  resolveBeatWithHysteresis,
  stepFromProgressForward,
  whyStepTargetProgress,
} from './scrollBeatGates';
export type { NoisePhase, WhyStep, BridgeBeat, BeatGate } from './scrollBeatGates';
export {
  crossfadeTarget,
  crossfadeTransition,
  smoothstep,
  computeIntroStageHandoff,
  resolveIntroStageHandoffCommit,
  WHY_INTRO_HANDOFF,
} from './scrollBeat';
