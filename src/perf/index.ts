export { initPerfTier, getPerfConfig, getPerfTier, subscribePerf } from './perfTier';
export type { PerfConfig, PerfTier } from './perfTier';
export { startManagedLoop } from './managedLoop';
export type { ManagedLoopOptions } from './managedLoop';
export { usePerfConfig } from './usePerf';
export { observeInView, isSubtreeInView } from './observeInView';
export { pauseSubtreeAnimations, resumeSubtreeAnimations } from './animationGate';
