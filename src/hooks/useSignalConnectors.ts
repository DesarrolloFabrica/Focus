import { useCallback, useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

export type SignalConnectorKey = 'priorities' | 'changes' | 'anomalies' | 'stable';

export interface SignalConnectorGeometry {
  key: SignalConnectorKey;
  path: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  pulseBegin: string;
  cycleDur: string;
}

const PULSE_OFFSETS: Record<SignalConnectorKey, string> = {
  priorities: '1.2s',
  changes: '4.8s',
  anomalies: '8.4s',
  stable: '12.0s',
};

const CONNECTOR_KEYS: SignalConnectorKey[] = ['priorities', 'changes', 'anomalies', 'stable'];

function buildCurve(
  start: { x: number; y: number },
  end: { x: number; y: number },
  isLeft: boolean,
): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const bend = Math.max(Math.min(Math.abs(dx) * 0.5, 140), 50);
  const cp1x = start.x + (isLeft ? bend : -bend);
  const cp1y = start.y + dy * 0.12;
  const cp2x = end.x + (isLeft ? -bend * 0.45 : bend * 0.45);
  const cp2y = end.y - dy * 0.12;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

export function useSignalConnectors(
  stageRef: RefObject<HTMLElement | null>,
  coreRef: RefObject<HTMLElement | null>,
  signalRefs: RefObject<Record<SignalConnectorKey, HTMLElement | null>>,
  enabled: boolean,
) {
  const [geometry, setGeometry] = useState<SignalConnectorGeometry[]>([]);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const core = coreRef.current;
    if (!stage || !core || !enabled || window.innerWidth < 1024) {
      setGeometry([]);
      setStageSize({ width: 0, height: 0 });
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width < 1 || stageRect.height < 1) return;

    const coreRect = core.getBoundingClientRect();
    const coreCenter = {
      x: coreRect.left + coreRect.width / 2 - stageRect.left,
      y: coreRect.top + coreRect.height / 2 - stageRect.top,
    };
    const coreRadius = Math.min(coreRect.width, coreRect.height) * 0.38;

    const next: SignalConnectorGeometry[] = [];

    for (const key of CONNECTOR_KEYS) {
      const signalEl = signalRefs.current?.[key];
      if (!signalEl) continue;

      const cardRect = signalEl.getBoundingClientRect();
      const isLeft = key === 'priorities' || key === 'changes';

      // Check if there's a dedicated terminal socket element
      const socketEl = signalEl.querySelector('.iv-intro-signal__socket') as HTMLElement | null;
      let start: { x: number; y: number };

      if (socketEl) {
        const socketRect = socketEl.getBoundingClientRect();
        start = {
          x: socketRect.left + socketRect.width / 2 - stageRect.left,
          y: socketRect.top + socketRect.height / 2 - stageRect.top,
        };
      } else {
        start = {
          x: (isLeft ? cardRect.right : cardRect.left) - stageRect.left,
          y: cardRect.top + cardRect.height * 0.44 - stageRect.top,
        };
      }

      const angle = Math.atan2(coreCenter.y - start.y, coreCenter.x - start.x);
      const end = {
        x: coreCenter.x - Math.cos(angle) * coreRadius,
        y: coreCenter.y - Math.sin(angle) * coreRadius,
      };

      next.push({
        key,
        path: buildCurve(start, end, isLeft),
        start,
        end,
        pulseBegin: PULSE_OFFSETS[key],
        cycleDur: '14s',
      });
    }

    setStageSize({ width: stageRect.width, height: stageRect.height });
    setGeometry(next);
  }, [coreRef, enabled, signalRefs, stageRef]);

  useLayoutEffect(() => {
    measure();

    const stage = stageRef.current;
    if (!stage) return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    if (coreRef.current) observer.observe(coreRef.current);

    for (const key of CONNECTOR_KEYS) {
      const signalEl = signalRefs.current?.[key];
      if (signalEl) observer.observe(signalEl);
    }

    window.addEventListener('resize', measure);

    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(measure);
    });
    const introTimer = window.setTimeout(measure, 2200);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.cancelAnimationFrame(raf);
      window.clearTimeout(introTimer);
    };
  }, [coreRef, measure, stageRef]);

  return { connectors: geometry, stageSize, remeasure: measure };
}
