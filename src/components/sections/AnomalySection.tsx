import React, { useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { Activity, Crosshair, Radar } from 'lucide-react';
import { FocusAnomaly } from '../../types/focus';
import { isSubtreeInView, observeInView, usePerfConfig } from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';

interface AnomalySectionProps {
  anomaly: FocusAnomaly;
}

interface PlotPoint {
  x: number;
  y: number;
}

const plotPointsFromValues = (values: number[], minimum: number, maximum: number): PlotPoint[] => {
  const left = 58;
  const width = 684;
  const top = 82;
  const height = 268;
  const range = Math.max(1, maximum - minimum);

  return values.map((value, index) => ({
    x: left + (width * index) / Math.max(1, values.length - 1),
    y: top + ((value - minimum) / range) * height,
  }));
};

const smoothPathFromPoints = (points: PlotPoint[]) => {
  if (!points.length) return '';

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
};

const pointAtProgress = (points: PlotPoint[], progress: number): PlotPoint => {
  if (!points.length) return { x: 0, y: 0 };
  const position = Math.max(0, Math.min(1, progress)) * Math.max(0, points.length - 1);
  const index = Math.min(points.length - 1, Math.floor(position));
  const nextIndex = Math.min(points.length - 1, index + 1);
  const localProgress = position - index;

  return {
    x: points[index].x + (points[nextIndex].x - points[index].x) * localProgress,
    y: points[index].y + (points[nextIndex].y - points[index].y) * localProgress,
  };
};

/**
 * Reparte el scroll fisico en actos mas largos: apertura, exploracion y cierre
 * no consumen el mismo porcentaje de recorrido.
 */
function toNarrativeProgress(raw: number): number {
  const t = Math.max(0, Math.min(1, raw));
  if (t <= 0.18) return (t / 0.18) * 0.24;
  if (t <= 0.8) return 0.24 + ((t - 0.18) / 0.62) * 0.58;
  return 0.82 + ((t - 0.8) / 0.2) * 0.18;
}

export const AnomalySection: React.FC<AnomalySectionProps> = ({ anomaly }) => {
  const reduceMotion = !!useReducedMotion();
  const perf = usePerfConfig();
  const scrollBlur = perf.tier === 'high' && !reduceMotion;
  const scrollRootRef = useIntroScrollRoot();
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAnomaly = anomaly.isUnusual;
  const rawStoryProgress = useMotionValue(0);

  const geometry = useMemo(() => {
    const allValues = [...anomaly.expectedPath, ...anomaly.actualPath];
    const minimum = Math.min(...allValues);
    const maximum = Math.max(...allValues);
    const expectedPoints = plotPointsFromValues(anomaly.expectedPath, minimum, maximum);
    const actualPoints = plotPointsFromValues(anomaly.actualPath, minimum, maximum);
    const threshold = Math.max(1, (maximum - minimum) * 0.07);
    const detectedIndex = anomaly.actualPath.findIndex(
      (value, index) => Math.abs(value - (anomaly.expectedPath[index] ?? value)) > threshold,
    );
    const breakpointIndex = Math.min(
      Math.max(1, detectedIndex < 0 ? anomaly.actualPath.length - 2 : detectedIndex),
      Math.max(1, anomaly.actualPath.length - 1),
    );

    return {
      expectedPoints,
      actualPoints,
      expectedPath: smoothPathFromPoints(expectedPoints),
      actualPath: smoothPathFromPoints(actualPoints),
      breakpoint: actualPoints[breakpointIndex] ?? actualPoints[0] ?? { x: 400, y: 220 },
      expectedEnd: expectedPoints.at(-1) ?? { x: 742, y: 250 },
      actualEnd: actualPoints.at(-1) ?? { x: 742, y: 120 },
    };
  }, [anomaly.actualPath, anomaly.expectedPath]);

  useEffect(() => {
    const section = sectionRef.current;
    const root = scrollRootRef?.current ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
    if (!section) return undefined;

    let frameId = 0;
    let isNearViewport = true;
    let pendingFinalPass = false;

    const updateProgress = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (!isSubtreeInView(section) && !pendingFinalPass) return;
        if (!isNearViewport && !pendingFinalPass) return;
        pendingFinalPass = false;

        const sectionRect = section.getBoundingClientRect();
        const rootTop = root ? root.getBoundingClientRect().top : 0;
        const rootHeight = root?.clientHeight ?? window.innerHeight;
        const totalDistance = Math.max(1, sectionRect.height - rootHeight);
        const offset = rootTop - sectionRect.top;
        const progress = Math.max(0, Math.min(1, offset / totalDistance));
        rawStoryProgress.set(progress);
      });
    };

    const target = root ?? window;
    target.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    const stopObserving = observeInView(
      section,
      (inView) => {
        isNearViewport = inView;
        if (!inView) pendingFinalPass = true;
        updateProgress();
      },
      '200px',
      root,
    );

    updateProgress();

    return () => {
      stopObserving();
      target.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      cancelAnimationFrame(frameId);
    };
  }, [scrollRootRef, rawStoryProgress]);

  const explorer = {
    baselineLabel: anomaly.baselineLabel ?? 'Patrón habitual',
    baselineValue: anomaly.baselineValue ?? anomaly.usualBehavior,
    currentValue: anomaly.currentValue ?? anomaly.currentBehavior,
    delta: anomaly.delta ?? anomaly.value,
    timeWindow: anomaly.timeWindow,
    anomalyTitle: anomaly.anomalyTitle ?? anomaly.title,
    anomalyDescription: anomaly.anomalyDescription ?? anomaly.description,
    impactText: anomaly.impactText ?? anomaly.context,
  };

  const storyProgress = useTransform(rawStoryProgress, (raw) => {
    const value = toNarrativeProgress(raw);
    if (!reduceMotion) return value;
    if (value < 0.14) return 0.06;
    if (value < 0.38) return 0.24;
    if (value < 0.68) return 0.52;
    if (value < 0.88) return 0.76;
    return 0.96;
  });

  // El salto directo desde Cambios aterriza exactamente en progreso 0. La
  // portada debe estar lista en ese primer frame; si badge y frase empiezan
  // tambien en 0 de opacidad, el usuario recibe una pantalla completamente
  // negra hasta volver a desplazar.
  const openingBadgeOpacity = useTransform(storyProgress, [0, 0.16, 0.22], [1, 1, 0]);
  const openingFirstOpacity = useTransform(storyProgress, [0, 0.09, 0.14], [1, 1, 0]);
  const openingFirstY = useTransform(storyProgress, [0, 0.09, 0.14], [0, 0, -18]);
  const openingFirstBlur = useTransform(
    storyProgress,
    [0, 0.09, 0.14],
    scrollBlur ? ['blur(0px)', 'blur(0px)', 'blur(5px)'] : ['blur(0px)', 'blur(0px)', 'blur(0px)'],
  );
  const openingExplainOpacity = useTransform(storyProgress, [0.07, 0.11, 0.18, 0.24], [0, 1, 1, 0]);
  const openingExplainY = useTransform(storyProgress, [0.07, 0.12, 0.24], [25, 0, -18]);
  const openingExplainBlur = useTransform(
    storyProgress,
    [0.07, 0.12, 0.24],
    scrollBlur ? ['blur(6px)', 'blur(0px)', 'blur(5px)'] : ['blur(0px)', 'blur(0px)', 'blur(0px)'],
  );
  const openingHeadlineOpacity = useTransform(storyProgress, [0.15, 0.19, 0.26, 0.32], [0, 1, 1, 0]);
  const openingHeadlineY = useTransform(storyProgress, [0.15, 0.21, 0.32], [25, 0, -18]);
  const openingHeadlineBlur = useTransform(
    storyProgress,
    [0.15, 0.21, 0.32],
    scrollBlur ? ['blur(6px)', 'blur(0px)', 'blur(5px)'] : ['blur(0px)', 'blur(0px)', 'blur(0px)'],
  );
  const openingLayerOpacity = useTransform(storyProgress, [0, 0.1, 0.28], [1, 1, 0]);

  const stageOpacity = useTransform(storyProgress, [0.18, 0.26, 0.8, 0.88], [0, 1, 1, 0]);
  const stageScale = useTransform(storyProgress, [0.18, 0.27, 0.81, 0.89], [0.965, 1, 1, 0.88]);
  const visualOpacity = useTransform(storyProgress, [0.2, 0.27, 0.82, 0.9], [0, 1, 1, 0]);

  const expectedDraw = useTransform(storyProgress, [0.18, 0.4], [0, 1]);
  const expectedOpacity = useTransform(storyProgress, [0.18, 0.24, 0.38, 0.46, 0.84], [0, 1, 1, 0.28, 0.18]);
  const actualDraw = useTransform(storyProgress, [0.36, 0.72], [0, 1]);
  const actualOpacity = useTransform(storyProgress, [0.35, 0.42, 0.85, 0.9], [0, 1, 1, 0]);

  const expectedTravel = useTransform(storyProgress, [0.18, 0.42], [0, 1]);
  const actualTravel = useTransform(storyProgress, [0.36, 0.74], [0, 1]);
  const expectedTrackerX = useTransform(expectedTravel, (value) => pointAtProgress(geometry.expectedPoints, value).x);
  const expectedTrackerY = useTransform(expectedTravel, (value) => pointAtProgress(geometry.expectedPoints, value).y);
  const actualTrackerX = useTransform(actualTravel, (value) => pointAtProgress(geometry.actualPoints, value).x);
  const actualTrackerY = useTransform(actualTravel, (value) => pointAtProgress(geometry.actualPoints, value).y);
  const expectedTrackerOpacity = useTransform(storyProgress, [0.17, 0.22, 0.4, 0.46], [0, 1, 1, 0]);
  const actualTrackerOpacity = useTransform(storyProgress, [0.36, 0.42, 0.72, 0.78], [0, 1, 1, 0]);

  const breakOpacity = useTransform(storyProgress, [0.4, 0.46, 0.84, 0.9], [0, 1, 1, 0]);
  const breakScale = useTransform(storyProgress, [0.39, 0.46, 0.7, 0.84], [0.5, 1, 1, 1.45]);
  const comparisonOpacity = useTransform(storyProgress, [0.66, 0.72, 0.84, 0.9], [0, 1, 1, 0]);

  const phaseOneOpacity = useTransform(storyProgress, [0.18, 0.24, 0.4, 0.48], [0, 1, 1, 0]);
  const phaseOneY = useTransform(storyProgress, [0.18, 0.24, 0.48], [20, 0, -18]);
  const phaseOneBlur = useTransform(
    storyProgress,
    [0.18, 0.24, 0.48],
    scrollBlur ? ['blur(5px)', 'blur(0px)', 'blur(5px)'] : ['blur(0px)', 'blur(0px)', 'blur(0px)'],
  );
  const phaseTwoOpacity = useTransform(storyProgress, [0.36, 0.44, 0.66, 0.74], [0, 1, 1, 0]);
  const phaseTwoY = useTransform(storyProgress, [0.36, 0.44, 0.74], [20, 0, -18]);
  const phaseTwoBlur = useTransform(
    storyProgress,
    [0.36, 0.44, 0.74],
    scrollBlur ? ['blur(5px)', 'blur(0px)', 'blur(5px)'] : ['blur(0px)', 'blur(0px)', 'blur(0px)'],
  );
  const phaseThreeOpacity = useTransform(storyProgress, [0.64, 0.72, 0.82, 0.88], [0, 1, 1, 0]);
  const phaseThreeY = useTransform(storyProgress, [0.64, 0.72, 0.88], [20, 0, -18]);
  const phaseThreeBlur = useTransform(
    storyProgress,
    [0.64, 0.72, 0.88],
    scrollBlur ? ['blur(5px)', 'blur(0px)', 'blur(5px)'] : ['blur(0px)', 'blur(0px)', 'blur(0px)'],
  );

  const chipOneOpacity = useTransform(storyProgress, [0.7, 0.75], [0, 1]);
  const chipTwoOpacity = useTransform(storyProgress, [0.72, 0.77], [0, 1]);
  const chipThreeOpacity = useTransform(storyProgress, [0.74, 0.79], [0, 1]);
  const chipOneY = useTransform(storyProgress, [0.7, 0.75], [20, 0]);
  const chipTwoY = useTransform(storyProgress, [0.72, 0.77], [20, 0]);
  const chipThreeY = useTransform(storyProgress, [0.74, 0.79], [20, 0]);

  const progressScale = useTransform(storyProgress, [0.18, 0.82], [0, 1]);
  const progressOpacity = useTransform(storyProgress, [0.19, 0.25, 0.84, 0.92], [0, 1, 1, 0]);
  const nodeOneOpacity = useTransform(storyProgress, [0.16, 0.2, 0.4, 0.48, 0.78, 0.82, 0.88, 0.94], [0.28, 1, 1, 0.3, 0.3, 1, 1, 0.22]);
  const nodeTwoOpacity = useTransform(storyProgress, [0.35, 0.44, 0.66, 0.74, 0.78, 0.82, 0.88, 0.94], [0.28, 1, 1, 0.3, 0.3, 1, 1, 0.22]);
  const nodeThreeOpacity = useTransform(storyProgress, [0.64, 0.72, 0.78, 0.82, 0.9, 0.96], [0.28, 1, 1, 1, 1, 0.25]);
  const nodeOneScale = useTransform(storyProgress, [0.16, 0.22, 0.4, 0.48, 0.8, 0.84, 0.9], [0.9, 1.12, 1.12, 0.9, 0.9, 1.12, 0.9]);
  const nodeTwoScale = useTransform(storyProgress, [0.36, 0.44, 0.66, 0.75, 0.8, 0.84, 0.9], [0.9, 1.12, 1.12, 0.9, 0.9, 1.12, 0.9]);
  const nodeThreeScale = useTransform(storyProgress, [0.64, 0.72, 0.8, 0.84, 0.92], [0.9, 1.12, 1.12, 1.12, 0.9]);

  const violetAmbientOpacity = useTransform(storyProgress, [0.28, 0.44, 0.72, 0.86], [0.05, 0.48, 0.42, 0.08]);
  const coralAmbientOpacity = useTransform(storyProgress, [0.4, 0.54, 0.72, 0.86, 0.94], [0, 0.15, 0.48, 0.28, 0]);
  const calmAmbientOpacity = useTransform(storyProgress, [0.84, 0.94, 1], [0, 0.74, 1]);
  const scanOneOpacity = useTransform(storyProgress, [0.38, 0.42, 0.46, 0.48], [0, 0.42, 0.2, 0]);
  const scanOneX = useTransform(storyProgress, [0.38, 0.48], ['-25%', '125%']);
  const scanTwoOpacity = useTransform(storyProgress, [0.66, 0.7, 0.74, 0.76], [0, 0.38, 0.18, 0]);
  const scanTwoX = useTransform(storyProgress, [0.66, 0.76], ['-25%', '125%']);

  const reflectionOpacity = useTransform(storyProgress, [0.8, 0.86, 0.92, 0.96], [0, 1, 1, 0]);
  const reflectionY = useTransform(storyProgress, [0.8, 0.87, 0.96], [24, 0, -18]);
  const handoffOpacity = useTransform(storyProgress, [0.9, 0.96, 1], [0, 1, 1]);
  const handoffY = useTransform(storyProgress, [0.9, 0.97], [22, 0]);
  const greenPointOpacity = useTransform(storyProgress, [0.9, 0.97], [0, 1]);
  const greenPointScale = useTransform(storyProgress, [0.9, 0.98], [0.4, 1]);

  return (
    <section
      ref={sectionRef}
      id="section-chapter-anomaly"
      className="aex-section"
      data-chapter="anomaly"
      aria-label="04 / 07 · Anomalía: exploración del patrón habitual, la ruptura y su impacto"
    >
      <div className="aex-sticky">
        <div className="aex-ambient" aria-hidden="true">
          <div className="aex-ambient__base" />
          <motion.div className="aex-ambient__violet" style={{ opacity: violetAmbientOpacity }} />
          <motion.div className="aex-ambient__coral" style={{ opacity: coralAmbientOpacity }} />
          <motion.div className="aex-ambient__calm" style={{ opacity: calmAmbientOpacity }} />
          <span className="aex-particle aex-particle--one" />
          <span className="aex-particle aex-particle--two" />
          <span className="aex-particle aex-particle--three" />
        </div>

        <motion.div className="aex-opening" style={{ opacity: openingLayerOpacity }}>
          <motion.div className="aex-opening__badge" style={{ opacity: openingBadgeOpacity }}>
            <span>04 / 07</span><i /><strong>ANOMALÍA</strong>
          </motion.div>
          <motion.p
            className="aex-opening__line aex-opening__line--first"
            style={{ opacity: openingFirstOpacity, y: openingFirstY, filter: openingFirstBlur }}
          >
            {hasAnomaly ? 'Hay algo que no encaja.' : 'Todo encaja con lo esperado.'}
          </motion.p>
          <motion.p
            className="aex-opening__line aex-opening__line--explain"
            style={{ opacity: openingExplainOpacity, y: openingExplainY, filter: openingExplainBlur }}
          >
            {hasAnomaly ? (
              <>
                No necesariamente está peor.<br />
                <strong>Simplemente dejó de comportarse como debería.</strong>
              </>
            ) : (
              <>
                La señal conserva su trayectoria.<br />
                <strong>No aparece ninguna ruptura del patrón.</strong>
              </>
            )}
          </motion.p>
          <motion.h2
            className="aex-opening__headline"
            style={{ opacity: openingHeadlineOpacity, y: openingHeadlineY, filter: openingHeadlineBlur }}
          >
            {hasAnomaly ? 'Esto no suele ocurrir.' : anomaly.headline}
          </motion.h2>
        </motion.div>

        <motion.div className="aex-stage" style={{ opacity: stageOpacity, scale: stageScale }}>
          <div className="aex-stage__topline">
            <span><Radar aria-hidden="true" /> ANOMALY EXPLORER</span>
            <span>FOCUS / SCROLL ANALYSIS</span>
          </div>

          <div className="aex-layout">
            <motion.figure className="aex-visual" style={{ opacity: visualOpacity }}>
              <figcaption>
                <span title={explorer.anomalyTitle}><i /> {explorer.anomalyTitle.toUpperCase()}</span>
                <small>BASELINE / LIVE</small>
              </figcaption>

              <svg
                viewBox="0 0 800 430"
                role="img"
                aria-label={`Trayectoria habitual comparada con el comportamiento actual. ${anomaly.breakpointLabel}.`}
              >
                <defs>
                  <linearGradient id="aex-baseline-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3f8cff" stopOpacity="0.22" />
                    <stop offset="48%" stopColor="#69dcff" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="#8ea9ff" stopOpacity="0.58" />
                  </linearGradient>
                  <linearGradient id="aex-anomaly-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#69dcff" />
                    <stop offset="52%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#ff6f86" />
                  </linearGradient>
                  <radialGradient id="aex-break-halo">
                    <stop offset="0%" stopColor="#ff6f86" stopOpacity="0.62" />
                    <stop offset="100%" stopColor="#ff6f86" stopOpacity="0" />
                  </radialGradient>
                  <filter id="aex-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                <g className="aex-orbits" aria-hidden="true">
                  <ellipse cx="400" cy="222" rx="302" ry="142" />
                  <ellipse cx="400" cy="222" rx="238" ry="108" />
                  <path d="M85 285 C230 155 564 129 734 238" />
                </g>

                <motion.path
                  className="aex-path aex-path--expected"
                  d={geometry.expectedPath}
                  style={{ pathLength: expectedDraw, opacity: expectedOpacity }}
                />
                <motion.path
                  className="aex-path aex-path--actual"
                  d={geometry.actualPath}
                  style={{ pathLength: actualDraw, opacity: actualOpacity }}
                />

                <motion.circle
                  className="aex-tracker aex-tracker--expected"
                  r="5"
                  style={{ cx: expectedTrackerX, cy: expectedTrackerY, opacity: expectedTrackerOpacity }}
                />
                <motion.circle
                  className="aex-tracker aex-tracker--actual"
                  r="5"
                  style={{ cx: actualTrackerX, cy: actualTrackerY, opacity: actualTrackerOpacity }}
                />

                {hasAnomaly && (
                  <motion.g
                    className="aex-breakpoint"
                    style={{ opacity: breakOpacity, scale: breakScale, transformOrigin: `${geometry.breakpoint.x}px ${geometry.breakpoint.y}px` }}
                  >
                    <circle className="aex-breakpoint__halo" cx={geometry.breakpoint.x} cy={geometry.breakpoint.y} r="64" />
                    <circle className="aex-breakpoint__ring" cx={geometry.breakpoint.x} cy={geometry.breakpoint.y} r="22" />
                    <circle className="aex-breakpoint__core" cx={geometry.breakpoint.x} cy={geometry.breakpoint.y} r="7" />
                    <path d={`M${geometry.breakpoint.x + 12} ${geometry.breakpoint.y - 12} L${geometry.breakpoint.x + 42} ${geometry.breakpoint.y - 42} L${geometry.breakpoint.x + 130} ${geometry.breakpoint.y - 42}`} />
                    <text x={geometry.breakpoint.x + 138} y={geometry.breakpoint.y - 38}>RUPTURA DETECTADA</text>
                  </motion.g>
                )}

                <motion.g className="aex-comparison-labels" style={{ opacity: comparisonOpacity }}>
                  <line x1={geometry.expectedEnd.x - 72} y1={geometry.expectedEnd.y} x2={geometry.expectedEnd.x - 16} y2={geometry.expectedEnd.y} />
                  <text x={geometry.expectedEnd.x - 80} y={geometry.expectedEnd.y + 4} textAnchor="end">HABITUAL</text>
                  <line x1={geometry.actualEnd.x - 72} y1={geometry.actualEnd.y} x2={geometry.actualEnd.x - 16} y2={geometry.actualEnd.y} />
                  <text x={geometry.actualEnd.x - 80} y={geometry.actualEnd.y + 4} textAnchor="end">ACTUAL</text>
                </motion.g>
              </svg>

              <motion.div className="aex-scan" style={{ opacity: scanOneOpacity, x: scanOneX }} aria-hidden="true" />
              <motion.div className="aex-scan" style={{ opacity: scanTwoOpacity, x: scanTwoX }} aria-hidden="true" />

              <div className="aex-visual__legend">
                <span><i className="is-baseline" /> Comportamiento habitual</span>
                <span><i className="is-current" /> Comportamiento actual</span>
              </div>
            </motion.figure>

            <aside
              className="aex-editorial"
              aria-label={`Lectura contextual de la anomalía. ${explorer.anomalyTitle}. ${explorer.anomalyDescription}`}
            >
              <div className="aex-editorial__rail" aria-hidden="true"><i /><i /><i /></div>

              <motion.article
                className="aex-editorial__phase"
                style={{ opacity: phaseOneOpacity, y: phaseOneY, filter: phaseOneBlur }}
              >
                <div className="aex-phase-label"><span>01</span><i /><strong>{explorer.baselineLabel}</strong></div>
                <p>Normalmente esta señal sigue una trayectoria estable.</p>
                <div className="aex-reference">
                  <small>REFERENCIA ACTIVA</small>
                  <strong>{explorer.baselineValue}</strong>
                </div>
                <span className="aex-system-status"><i /> BASELINE / ACTIVE</span>
              </motion.article>

              <motion.article
                className="aex-editorial__phase"
                style={{ opacity: phaseTwoOpacity, y: phaseTwoY, filter: phaseTwoBlur }}
              >
                <div className="aex-phase-label"><span>02</span><i /><strong>{hasAnomaly ? 'RUPTURA' : 'VERIFICACIÓN'}</strong></div>
                <p>{hasAnomaly ? 'El comportamiento actual dejó de seguir su patrón habitual.' : 'El comportamiento observado continúa alineado con su patrón habitual.'}</p>
                <strong className="aex-delta">{explorer.delta}</strong>
                {explorer.timeWindow && <span className="aex-time-window">{explorer.timeWindow}</span>}
                <p className="aex-editorial__detail">{anomaly.insight}</p>
                <span className={`aex-system-status ${hasAnomaly ? 'is-alert' : ''}`}><Crosshair aria-hidden="true" /> {hasAnomaly ? anomaly.breakpointLabel : 'Sin ruptura detectada'}</span>
              </motion.article>

              <motion.article
                className="aex-editorial__phase aex-editorial__phase--impact"
                style={{ opacity: phaseThreeOpacity, y: phaseThreeY, filter: phaseThreeBlur }}
              >
                <div className="aex-phase-label"><span>03</span><i /><strong>POR QUÉ IMPORTA</strong></div>
                <p>{anomaly.isCritical ? 'Esta desviación ya requiere atención.' : 'No necesariamente es crítico.'}</p>
                <strong className="aex-impact-emphasis">{hasAnomaly ? 'DIFERENTE DE LO NORMAL' : 'DENTRO DE LO NORMAL'}</strong>
                <p className="aex-editorial__detail">{explorer.impactText}</p>
                <blockquote>FOCUS no solo busca problemas.<br /><strong>También busca comportamientos inesperados.</strong></blockquote>

                <div className="aex-chips">
                  <motion.div style={{ opacity: chipOneOpacity, y: chipOneY }}><small>PRIMERA VEZ</small><span>{anomaly.insight}</span></motion.div>
                  <motion.div style={{ opacity: chipTwoOpacity, y: chipTwoY }}><small>DESVÍO</small><span>{explorer.delta}</span></motion.div>
                  <motion.div style={{ opacity: chipThreeOpacity, y: chipThreeY }}><small>FUERA DE RANGO</small><span>{explorer.currentValue}</span></motion.div>
                </div>
              </motion.article>
            </aside>
          </div>

          <motion.nav className="aex-progress" style={{ opacity: progressOpacity }} aria-label="Progreso narrativo de la anomalía">
            <div className="aex-progress__track"><motion.i style={{ scaleX: progressScale }} /></div>
            <motion.div className="aex-progress__step is-first" data-tooltip="Comportamiento de referencia" style={{ opacity: nodeOneOpacity, scale: nodeOneScale }}>
              <b /><span>PATRÓN HABITUAL</span>
            </motion.div>
            <motion.div className="aex-progress__step is-second" data-tooltip="Momento de la desviación" style={{ opacity: nodeTwoOpacity, scale: nodeTwoScale }}>
              <b /><span>{hasAnomaly ? 'RUPTURA' : 'VERIFICACIÓN'}</span>
            </motion.div>
            <motion.div className="aex-progress__step is-third" data-tooltip="Contexto e impacto" style={{ opacity: nodeThreeOpacity, scale: nodeThreeScale }}>
              <b /><span>IMPACTO</span>
            </motion.div>
          </motion.nav>
        </motion.div>

        <motion.div className="aex-reflection" style={{ opacity: reflectionOpacity, y: reflectionY }}>
          <Activity aria-hidden="true" />
          <p>Detectar lo raro también es parte de entender la operación.</p>
          <strong>Pero no todo requiere atención.</strong>
        </motion.div>

        <motion.div className="aex-handoff" style={{ opacity: handoffOpacity, y: handoffY }}>
          <motion.i style={{ opacity: greenPointOpacity, scale: greenPointScale }} aria-hidden="true" />
          <p>Lo excepcional ya está claro.</p>
          <strong>Ahora veamos lo que funciona como debería.</strong>
        </motion.div>
      </div>
    </section>
  );
};
