import React, { useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { Activity, Crosshair, Radar } from 'lucide-react';
import { FocusAnomaly } from '../../types/focus';
import { useBriefingSectionMetrics } from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';
import { GradientWaves } from '../effects/GradientWaves';
import LightPillar from '../effects/LightPillar';

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

export const AnomalySection: React.FC<AnomalySectionProps> = ({ anomaly }) => {
  const reduceMotion = !!useReducedMotion();
  const scrollRootRef = useIntroScrollRoot();
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAnomaly = anomaly.isUnusual;

  const rawProgress = useMotionValue(0);
  const animatedStoryProgress = useSpring(rawProgress, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0005,
    restSpeed: 0.002,
  });
  const storyProgress = reduceMotion ? rawProgress : animatedStoryProgress;

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

  useBriefingSectionMetrics(
    sectionRef,
    'anomaly',
    scrollRootRef?.current ?? null,
    useCallback(
      (metrics) => {
        rawProgress.set(metrics.progress);
      },
      [rawProgress],
    ),
  );

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

  const openingBadgeOpacity = useTransform(storyProgress, [0, 0.20, 0.26], [1, 1, 0]);
  const openingFirstOpacity = useTransform(storyProgress, [0, 0.06, 0.09], [1, 1, 0]);
  const openingFirstY = useTransform(storyProgress, [0, 0.06, 0.09], [0, 0, -16]);
  const openingExplainOpacity = useTransform(storyProgress, [0.08, 0.11, 0.16, 0.19], [0, 1, 1, 0]);
  const openingExplainY = useTransform(storyProgress, [0.08, 0.11, 0.19], [20, 0, -16]);
  const openingHeadlineOpacity = useTransform(storyProgress, [0.18, 0.21, 0.26, 0.29], [0, 1, 1, 0]);
  const openingHeadlineY = useTransform(storyProgress, [0.18, 0.21, 0.29], [20, 0, -16]);
  const openingLayerOpacity = useTransform(storyProgress, [0, 0.27, 0.30], [1, 1, 0]);
  const stageOpacity = useTransform(storyProgress, [0.27, 0.31, 0.80, 0.84], [0, 1, 1, 0]);
  const stageScale = useTransform(storyProgress, [0.27, 0.32, 0.80, 0.84], [0.97, 1, 1, 0.95]);
  const visualOpacity = useTransform(storyProgress, [0.28, 0.32, 0.80, 0.84], [0, 1, 1, 0]);
  const expectedDraw = useTransform(storyProgress, [0.29, 0.40], [0, 1]);
  const expectedOpacity = useTransform(storyProgress, [0.29, 0.33, 0.44, 0.50, 0.82], [0, 1, 1, 0.35, 0.2]);
  const expectedTravel = useTransform(storyProgress, [0.29, 0.40], [0, 1]);
  const expectedTrackerX = useTransform(expectedTravel, (value) => pointAtProgress(geometry.expectedPoints, value).x);
  const expectedTrackerY = useTransform(expectedTravel, (value) => pointAtProgress(geometry.expectedPoints, value).y);
  const expectedTrackerOpacity = useTransform(storyProgress, [0.29, 0.33, 0.43, 0.47], [0, 1, 1, 0]);
  const phaseOneOpacity = useTransform(storyProgress, [0.29, 0.33, 0.43, 0.47], [0, 1, 1, 0]);
  const phaseOneY = useTransform(storyProgress, [0.29, 0.33, 0.47], [20, 0, -16]);
  const actualDraw = useTransform(storyProgress, [0.46, 0.58], [0, 1]);
  const actualOpacity = useTransform(storyProgress, [0.46, 0.50, 0.82, 0.86], [0, 1, 1, 0]);
  const actualTravel = useTransform(storyProgress, [0.46, 0.58], [0, 1]);
  const actualTrackerX = useTransform(actualTravel, (value) => pointAtProgress(geometry.actualPoints, value).x);
  const actualTrackerY = useTransform(actualTravel, (value) => pointAtProgress(geometry.actualPoints, value).y);
  const actualTrackerOpacity = useTransform(storyProgress, [0.46, 0.50, 0.62, 0.66], [0, 1, 1, 0]);
  const breakOpacity = useTransform(storyProgress, [0.48, 0.52, 0.82, 0.86], [0, 1, 1, 0]);
  const breakScale = useTransform(storyProgress, [0.48, 0.53, 0.70, 0.82], [0.6, 1, 1, 1.25]);
  const phaseTwoOpacity = useTransform(storyProgress, [0.46, 0.50, 0.61, 0.65], [0, 1, 1, 0]);
  const phaseTwoY = useTransform(storyProgress, [0.46, 0.50, 0.65], [20, 0, -16]);
  const comparisonOpacity = useTransform(storyProgress, [0.64, 0.68, 0.82, 0.86], [0, 1, 1, 0]);
  const phaseThreeOpacity = useTransform(storyProgress, [0.64, 0.68, 0.80, 0.84], [0, 1, 1, 0]);
  const phaseThreeY = useTransform(storyProgress, [0.64, 0.68, 0.84], [20, 0, -16]);
  const chipOneOpacity = useTransform(storyProgress, [0.67, 0.72], [0, 1]);
  const chipTwoOpacity = useTransform(storyProgress, [0.69, 0.74], [0, 1]);
  const chipThreeOpacity = useTransform(storyProgress, [0.71, 0.76], [0, 1]);
  const chipOneY = useTransform(storyProgress, [0.67, 0.72], [16, 0]);
  const chipTwoY = useTransform(storyProgress, [0.69, 0.74], [16, 0]);
  const chipThreeY = useTransform(storyProgress, [0.71, 0.76], [16, 0]);
  const progressScale = useTransform(storyProgress, [0.29, 0.80], [0, 1]);
  const progressOpacity = useTransform(storyProgress, [0.28, 0.32, 0.82, 0.86], [0, 1, 1, 0]);
  const nodeOneOpacity = useTransform(storyProgress, [0.28, 0.32, 0.44, 0.48, 0.78, 0.82], [0.35, 1, 1, 0.35, 0.35, 0.9]);
  const nodeTwoOpacity = useTransform(storyProgress, [0.45, 0.49, 0.62, 0.66, 0.78, 0.82], [0.35, 1, 1, 0.35, 0.35, 0.9]);
  const nodeThreeOpacity = useTransform(storyProgress, [0.63, 0.67, 0.80, 0.84], [0.35, 1, 1, 0.9]);
  const nodeOneScale = useTransform(storyProgress, [0.29, 0.33, 0.43, 0.47], [0.95, 1.1, 1.1, 0.95]);
  const nodeTwoScale = useTransform(storyProgress, [0.46, 0.50, 0.60, 0.64], [0.95, 1.1, 1.1, 0.95]);
  const nodeThreeScale = useTransform(storyProgress, [0.64, 0.68, 0.80, 0.84], [0.95, 1.1, 1.1, 0.95]);
  const violetAmbientOpacity = useTransform(storyProgress, [0.28, 0.44, 0.72, 0.86], [0.05, 0.48, 0.42, 0.08]);
  const coralAmbientOpacity = useTransform(storyProgress, [0.44, 0.56, 0.72, 0.86], [0, 0.35, 0.48, 0.1]);
  const calmAmbientOpacity = useTransform(storyProgress, [0.82, 0.92, 1.0], [0, 0.6, 1]);
  const scanOneOpacity = useTransform(storyProgress, [0.46, 0.50, 0.54, 0.58], [0, 0.4, 0.2, 0]);
  const scanOneX = useTransform(storyProgress, [0.46, 0.58], ['-25%', '125%']);
  const scanTwoOpacity = useTransform(storyProgress, [0.64, 0.68, 0.74, 0.78], [0, 0.35, 0.18, 0]);
  const scanTwoX = useTransform(storyProgress, [0.64, 0.78], ['-25%', '125%']);
  const reflectionOpacity = useTransform(storyProgress, [0.82, 0.85, 0.89, 0.92], [0, 1, 1, 0]);
  const reflectionY = useTransform(storyProgress, [0.82, 0.85, 0.92], [20, 0, -16]);
  const handoffOpacity = useTransform(storyProgress, [0.92, 0.95, 1.0], [0, 1, 1]);
  const handoffY = useTransform(storyProgress, [0.92, 0.95], [20, 0]);
  const closingLayerOpacity = useTransform(storyProgress, [0.81, 0.85, 1.0], [0, 1, 1]);
  const greenPointOpacity = useTransform(storyProgress, [0.92, 0.95], [0, 1]);
  const greenPointScale = useTransform(storyProgress, [0.92, 0.96], [0.4, 1]);

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
          {/* ReactBits Gradient Waves - exact reference implementation */}
          <motion.div
            className="aex-ambient__waves"
            style={{ opacity: openingLayerOpacity }}
          >
            <GradientWaves
              horizonColor="#5227FF"
              waveColor="#FF9FFC"
              crestColor="#FFFFFF"
              speed={0.4}
              amplitude={4.1}
              waveScale={0.6}
              waveRatio={0.9}
              swell={35}
              turbulence={20}
              tilt={1.11}
              zoom={1.0}
              height={5.5}
              fogDepth={15}
              detail="medium"
              brightness={1.0}
              opacity={1.0}
              mouseInteraction={true}
              parallaxStrength={0.5}
              grain={true}
              grainIntensity={0.05}
            />
          </motion.div>

          {/* LightPillar — closing text phase: "Pero no todo requiere atención" & "Ahora veamos lo que funciona" */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              opacity: closingLayerOpacity,
              overflow: 'hidden',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          >
            <LightPillar
              topColor="#6366f1"
              bottomColor="#06b6d4"
              intensity={0.9}
              rotationSpeed={0.24}
              glowAmount={0.0024}
              pillarWidth={9}
              pillarHeight={0.38}
              noiseIntensity={0.3}
              pillarRotation={-15}
              interactive={false}
              mixBlendMode="normal"
              quality="high"
            />
          </motion.div>

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
            style={{ opacity: openingFirstOpacity, y: openingFirstY }}
          >
            {hasAnomaly ? 'Hay algo que no encaja.' : 'Todo encaja con lo esperado.'}
          </motion.p>
          <motion.p
            className="aex-opening__line aex-opening__line--explain"
            style={{ opacity: openingExplainOpacity, y: openingExplainY }}
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
            style={{ opacity: openingHeadlineOpacity, y: openingHeadlineY }}
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
                style={{ opacity: phaseOneOpacity, y: phaseOneY }}
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
                style={{ opacity: phaseTwoOpacity, y: phaseTwoY }}
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
                style={{ opacity: phaseThreeOpacity, y: phaseThreeY }}
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
