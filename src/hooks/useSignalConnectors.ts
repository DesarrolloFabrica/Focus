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
  priorities: '2.1s',
  changes: '5.6s',
  anomalies: '9.1s',
  stable: '12.6s',
};

const CONNECTOR_KEYS: SignalConnectorKey[] = ['priorities', 'changes', 'anomalies', 'stable'];

function buildCurve(
  start: { x: number; y: number },
  end: { x: number; y: number },
  isLeft: boolean,
): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const bend = Math.min(Math.abs(dx) * 0.42, 90);
  const cp1x = start.x + (isLeft ? bend : -bend);
  const cp1y = start.y + dy * 0.08;
  const cp2x = end.x + (isLeft ? -bend * 0.35 : bend * 0.35);
  const cp2y = end.y - dy * 0.08;
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
    const coreRadius = Math.min(coreRect.width, coreRect.height) * 0.36;

    const next: SignalConnectorGeometry[] = [];

    for (const key of CONNECTOR_KEYS) {
      const signalEl = signalRefs.current?.[key];
      if (!signalEl) continue;

      const iconEl = signalEl.querySelector('.focus-signal__icon') ?? signalEl;
      const iconRect = iconEl.getBoundingClientRect();
      const isLeft = key === 'priorities' || key === 'changes';

      const start = {
        x: (isLeft ? iconRect.right : iconRect.left) - stageRect.left,
        y: iconRect.top + iconRect.height / 2 - stageRect.top,
      };

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
        cycleDur: '16s',
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
