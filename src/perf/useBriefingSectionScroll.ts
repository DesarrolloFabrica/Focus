import { useEffect, useRef, useState, type RefObject } from 'react';
import { MotionValue } from 'motion/react';
import {
  registerBriefingSection,
  unregisterBriefingSection,
  type BriefingSectionMetrics,
} from './briefingScrollBus';
import { resolveBeatWithHysteresis, type BeatGate } from './scrollBeatGates';

export const useBriefingSectionScroll = (
  sectionRef: RefObject<HTMLElement | null>,
  sectionId: string,
  scrollRoot: HTMLElement | null | undefined,
): MotionValue<number> | null => {
  const [progress, setProgress] = useState<MotionValue<number> | null>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;

    const root =
      scrollRoot ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
    const registration = registerBriefingSection(sectionId, element, root);
    setProgress(registration.progress);

    return () => {
      unregisterBriefingSection(sectionId);
      setProgress(null);
    };
  }, [sectionId, scrollRoot, sectionRef]);

  return progress;
};

export const useBriefingSectionMetrics = (
  sectionRef: RefObject<HTMLElement | null>,
  sectionId: string,
  scrollRoot: HTMLElement | null | undefined,
  onMetrics: (metrics: BriefingSectionMetrics) => void,
) => {
  const onMetricsRef = useRef(onMetrics);
  onMetricsRef.current = onMetrics;

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;

    const root =
      scrollRoot ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
    const { subscribe } = registerBriefingSection(`${sectionId}-metrics`, element, root);
    return subscribe((metrics) => onMetricsRef.current(metrics));
  }, [sectionId, scrollRoot, sectionRef]);
};

export function useScrollBeat<T extends string>(
  progress: MotionValue<number> | null,
  steps: T[],
  gates: Record<string, BeatGate>,
  initial: T,
): [T, 'up' | 'down'] {
  const [beat, setBeat] = useState<T>(initial);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastBeatRef = useRef(initial);
  const lastProgressRef = useRef(-1);

  useEffect(() => {
    if (!progress) return undefined;

    lastBeatRef.current = initial;
    lastProgressRef.current = -1;
    setBeat(initial);

    return progress.on('change', (p) => {
      const goingUp = lastProgressRef.current >= 0 && p < lastProgressRef.current;
      lastProgressRef.current = p;
      const next = resolveBeatWithHysteresis(p, lastBeatRef.current, goingUp, steps, gates);
      if (next !== lastBeatRef.current) {
        lastBeatRef.current = next;
        setDirection(goingUp ? 'up' : 'down');
        setBeat(next);
      }
    });
  }, [progress, steps, gates, initial]);

  return [beat, direction];
}
