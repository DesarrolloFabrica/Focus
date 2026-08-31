import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock3,
  Activity,
  Flame,
  Radio,
} from 'lucide-react';
import focusPriorityBeacon from '../../assets/focus-priority-beacon.webp';
import { FocusPriority } from '../../types/focus';
import { useBriefingSectionMetrics, usePerfConfig } from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';

interface PrioritySectionProps {
  priority: FocusPriority;
  onContinue?: () => void;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({ priority, onContinue }) => {
  const reduceMotion = !!useReducedMotion();
  const perf = usePerfConfig();
  const useFullDetailMotion = !reduceMotion && perf.tier === 'high';
  const scrollRootRef = useIntroScrollRoot();
  const sectionRef = useRef<HTMLElement | null>(null);

  const rawProgress = useMotionValue(0);
  const animatedStoryProgress = useSpring(rawProgress, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0005,
    restSpeed: 0.002,
  });
  const storyProgress = reduceMotion ? rawProgress : animatedStoryProgress;

  useBriefingSectionMetrics(
    sectionRef,
    'priority',
    scrollRootRef?.current ?? null,
    useCallback(
      (metrics) => {
        rawProgress.set(metrics.progress);
      },
      [rawProgress],
    ),
  );

  // ---------------------------------------------------------------------------
  // ACT 1: APERTURA EDITORIAL (0.00 - 0.26)
  // ---------------------------------------------------------------------------
  const openingBadgeOpacity = useTransform(storyProgress, [0, 0.03, 0.19, 0.25], [0, 1, 1, 0]);
  const openingFirstOpacity = useTransform(storyProgress, [0, 0.04, 0.08, 0.11], [0, 1, 1, 0]);
  const openingFirstY = useTransform(storyProgress, [0, 0.04, 0.11], [16, 0, -16]);

  const openingExplainOpacity = useTransform(storyProgress, [0.09, 0.13, 0.18, 0.22], [0, 1, 1, 0]);
  const openingExplainY = useTransform(storyProgress, [0.09, 0.13, 0.22], [20, 0, -16]);

  const openingHeadlineOpacity = useTransform(storyProgress, [0.19, 0.22, 0.26, 0.29], [0, 1, 1, 0]);
  const openingHeadlineY = useTransform(storyProgress, [0.19, 0.22, 0.29], [20, 0, -16]);

  const openingLayerOpacity = useTransform(storyProgress, [0, 0.27, 0.30], [1, 1, 0]);

  // ---------------------------------------------------------------------------
  // ACT 2 & 3: MAIN STAGE CONTAINER (0.26 - 0.84)
  // ---------------------------------------------------------------------------
  const stageOpacity = useTransform(storyProgress, [0.26, 0.30, 0.81, 0.85], [0, 1, 1, 0]);
  const stageScale = useTransform(storyProgress, [0.26, 0.31, 0.81, 0.85], [0.97, 1, 1, 0.96]);

  // ACT 2: Holographic Beacon & State Contrast (0.26 - 0.54)
  const act2Opacity = useTransform(storyProgress, [0.26, 0.31, 0.50, 0.54], [0, 1, 1, 0]);
  const act2Y = useTransform(storyProgress, [0.26, 0.31, 0.50, 0.54], [24, 0, 0, -20]);

  const beaconScale = useTransform(storyProgress, [0.26, 0.34, 0.50, 0.54], [0.92, 1, 1, 0.94]);
  const beaconOpacity = useTransform(storyProgress, [0.26, 0.32, 0.50, 0.54], [0, 1, 1, 0]);

  const cardCurrentOpacity = useTransform(storyProgress, [0.28, 0.34, 0.50, 0.54], [0, 1, 1, 0]);
  const cardCurrentX = useTransform(storyProgress, [0.28, 0.34, 0.50, 0.54], [24, 0, 0, 12]);

  const cardBaseOpacity = useTransform(storyProgress, [0.32, 0.38, 0.50, 0.54], [0, 1, 1, 0]);
  const cardBaseX = useTransform(storyProgress, [0.32, 0.38, 0.50, 0.54], [24, 0, 0, 12]);

  const divergencePillOpacity = useTransform(storyProgress, [0.36, 0.42, 0.50, 0.54], [0, 1, 1, 0]);
  const divergencePillScale = useTransform(storyProgress, [0.36, 0.42, 0.50, 0.54], [0.9, 1, 1, 0.92]);

  // ACT 3: Deep-Dive Diagnostic & 3 Dimensions (0.54 - 0.82)
  const act3Opacity = useTransform(storyProgress, [0.53, 0.57, 0.79, 0.83], [0, 1, 1, 0]);
  const act3Y = useTransform(storyProgress, [0.53, 0.57, 0.79, 0.83], [24, 0, 0, -20]);

  const chipOneOpacity = useTransform(storyProgress, [0.58, 0.63], [0, 1]);
  const chipOneY = useTransform(storyProgress, [0.58, 0.63], [16, 0]);

  const chipTwoOpacity = useTransform(storyProgress, [0.63, 0.68], [0, 1]);
  const chipTwoY = useTransform(storyProgress, [0.63, 0.68], [16, 0]);

  const chipThreeOpacity = useTransform(storyProgress, [0.68, 0.73], [0, 1]);
  const chipThreeY = useTransform(storyProgress, [0.68, 0.73], [16, 0]);

  // Step Indicators
  const stepOneActive = useTransform(storyProgress, (p: number) => p >= 0.26 && p < 0.54);
  const stepTwoActive = useTransform(storyProgress, (p: number) => p >= 0.54 && p < 0.82);
  const stepThreeActive = useTransform(storyProgress, (p: number) => p >= 0.82);

  // ---------------------------------------------------------------------------
  // ACT 4: EDITORIAL CONCLUSION & CLOSURE (0.82 - 1.00)
  // ---------------------------------------------------------------------------
  const conclusionOpacity = useTransform(storyProgress, [0.82, 0.86, 1], [0, 1, 1]);
  const conclusionY = useTransform(storyProgress, [0.82, 0.86, 1], [24, 0, 0]);
  const conclusionScale = useTransform(storyProgress, [0.82, 0.86, 1], [0.96, 1, 1]);

  return (
    <section
      ref={sectionRef}
      id="section-chapter-priority"
      className="prio-section select-none"
      data-chapter="priority"
      aria-label="01 / 07 · Prioridad principal: detección y diagnóstico del foco de atención"
    >
      <div className="prio-sticky">
        {/* Atmospheric Neon & Volumetric Glow Ambient */}
        <div className="prio-ambient" aria-hidden="true">
          <div className="prio-ambient__base" />
          <div className="prio-ambient__grid" />
          <div className="prio-ambient__halo-cyan" />
          <div className="prio-ambient__halo-purple" />
          <div className="prio-ambient__halo-rose" />
        </div>

        {/* ACTO 1: Apertura Editorial */}
        <motion.div
          className="prio-opening"
          style={{ opacity: reduceMotion ? 1 : openingLayerOpacity }}
          aria-hidden="true"
        >
          <motion.div
            className="prio-opening__badge"
            style={{ opacity: reduceMotion ? 1 : openingBadgeOpacity }}
          >
            <span>01 / 07</span>
            <i />
            <strong>PRIORIDAD PRINCIPAL</strong>
          </motion.div>

          <motion.p
            className="prio-opening__line prio-opening__line--first"
            style={{
              opacity: reduceMotion ? 1 : openingFirstOpacity,
              y: reduceMotion ? 0 : openingFirstY,
            }}
          >
            El ruido fue descartado.
          </motion.p>

          <motion.p
            className="prio-opening__line prio-opening__line--explain"
            style={{
              opacity: reduceMotion ? 1 : openingExplainOpacity,
              y: reduceMotion ? 0 : openingExplainY,
            }}
          >
            FOCUS aisló el <strong>asunto de mayor impacto</strong> para tu operación hoy.
          </motion.p>

          <motion.h2
            className="prio-opening__headline"
            style={{
              opacity: reduceMotion ? 1 : openingHeadlineOpacity,
              y: reduceMotion ? 0 : openingHeadlineY,
            }}
          >
            {priority.headline}
          </motion.h2>
        </motion.div>

        {/* ACTO 2 & ACTO 3: Stage Container */}
        <motion.div
          className="prio-stage"
          style={{
            opacity: reduceMotion ? 1 : stageOpacity,
            scale: reduceMotion ? 1 : stageScale,
            pointerEvents: useTransform(storyProgress, (p: number) =>
              p >= 0.26 && p <= 0.82 ? 'auto' : 'none',
            ),
          }}
        >
          {/* Topline Bar */}
          <div className="prio-stage__topline">
            <span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              SIGNAL_CORE // 01.07 · ASUNTO PRIORITARIO AISLADO
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              TELEMETRY: ACTIVE
            </span>
          </div>

          <div className="prio-stage__content">
            {/* ACTO 2: Beacon Holográfico & Contraste Operacional (0.26 - 0.54) */}
            <motion.div
              className="prio-act-contrast"
              style={{
                opacity: reduceMotion ? 1 : act2Opacity,
                y: reduceMotion ? 0 : act2Y,
                display: useTransform(storyProgress, (p: number) =>
                  p >= 0.24 && p <= 0.55 ? 'flex' : 'none',
                ),
              }}
            >
              <div className="prio-contrast-layout">
                {/* Left: 3D Holographic Beacon Plate */}
                <motion.figure
                  className="prio-beacon-visual"
                  style={{
                    scale: reduceMotion ? 1 : beaconScale,
                    opacity: reduceMotion ? 1 : beaconOpacity,
                  }}
                >
                  <div className="prio-beacon-visual__halo" aria-hidden="true" />
                  
                  {/* Orbiting Laser Geometry */}
                  <svg
                    className="prio-beacon-visual__orbits"
                    viewBox="0 0 420 360"
                    aria-hidden="true"
                  >
                    <ellipse
                      cx="210"
                      cy="210"
                      rx="170"
                      ry="58"
                      fill="none"
                      stroke="rgba(101, 217, 255, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="5 9"
                    />
                    <ellipse
                      cx="210"
                      cy="210"
                      rx="188"
                      ry="74"
                      fill="none"
                      stroke="rgba(147, 197, 253, 0.22)"
                      strokeWidth="0.8"
                      transform="rotate(-12 210 210)"
                    />
                    <circle cx="105" cy="180" r="3" fill="#38bdf8" />
                    <circle cx="325" cy="235" r="2.5" fill="#c084fc" />
                  </svg>

                  {/* 3D Beacon Crystal Media */}
                  <div className="prio-beacon-visual__plate">
                    <motion.img
                      src={focusPriorityBeacon}
                      alt="FOCUS Priority Beacon"
                      loading="eager"
                      decoding="async"
                      className="prio-beacon-visual__img"
                      animate={useFullDetailMotion ? { y: [-3, 3, -3] } : false}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>

                  {/* Live Telemetry Pill */}
                  <div className="prio-beacon-visual__pill">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-cyan-300 font-mono tracking-widest uppercase font-semibold">
                          Señal Activa
                        </span>
                        <strong className="text-white text-sm font-bold font-mono leading-tight">
                          {priority.currentMetric}
                        </strong>
                      </div>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold flex items-center gap-1 ${
                        priority.deltaPercentage > 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>
                        {priority.deltaPercentage > 0 ? '+' : ''}
                        {priority.deltaPercentage}%
                      </span>
                    </div>
                  </div>
                </motion.figure>

                {/* Right: State Comparison Cards */}
                <div className="prio-contrast-cards">
                  {/* Card 1: Situación Actual (Critical) */}
                  <motion.article
                    className="prio-card prio-card--current"
                    style={{
                      opacity: reduceMotion ? 1 : cardCurrentOpacity,
                      x: reduceMotion ? 0 : cardCurrentX,
                    }}
                  >
                    <div className="prio-card__specular" />
                    <div className="prio-card__header">
                      <div className="prio-card__label-group">
                        <div className="prio-card__icon is-alert">
                          <Flame className="w-4 h-4 text-rose-400" />
                        </div>
                        <span className="prio-card__label">Situación Actual</span>
                      </div>
                      <span className="prio-card__badge is-alert">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        DESVIACIÓN CRÍTICA
                      </span>
                    </div>

                    <h3 className="prio-card__value text-rose-200">{priority.currentMetric}</h3>
                    <p className="prio-card__sub text-rose-300/80">Ritmo observado en tiempo real</p>
                    <p className="prio-card__desc">
                      El indicador opera significativamente alejado del estándar de referencia que la operación suele sostener.
                    </p>
                  </motion.article>

                  {/* Divergence Pill */}
                  <motion.div
                    className="prio-divergence-pill"
                    style={{
                      opacity: reduceMotion ? 1 : divergencePillOpacity,
                      scale: reduceMotion ? 1 : divergencePillScale,
                    }}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DIVERGENCIA CONFIRMADA: +{priority.deltaPercentage}%</span>
                  </motion.div>

                  {/* Card 2: Línea Base Habitual */}
                  <motion.article
                    className="prio-card prio-card--baseline"
                    style={{
                      opacity: reduceMotion ? 1 : cardBaseOpacity,
                      x: reduceMotion ? 0 : cardBaseX,
                    }}
                  >
                    <div className="prio-card__specular" />
                    <div className="prio-card__header">
                      <div className="prio-card__label-group">
                        <div className="prio-card__icon is-base">
                          <Clock3 className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="prio-card__label">Referencia Habitual</span>
                      </div>
                      <span className="prio-card__badge is-base">LÍNEA BASE</span>
                    </div>

                    <h3 className="prio-card__value text-blue-200">{priority.usualMetric}</h3>
                    <p className="prio-card__sub text-blue-300/80">Comportamiento histórico normal</p>
                    <p className="prio-card__desc">
                      El comportamiento esperado se mantiene cerca de este nivel de estabilidad. Ese contraste define la prioridad.
                    </p>
                  </motion.article>
                </div>
              </div>
            </motion.div>

            {/* ACTO 3: Lectura Diagnóstica de FOCUS & 3 Dimensiones (0.54 - 0.82) */}
            <motion.div
              className="prio-act-deepdive"
              style={{
                opacity: reduceMotion ? 1 : act3Opacity,
                y: reduceMotion ? 0 : act3Y,
                display: useTransform(storyProgress, (p: number) =>
                  p >= 0.52 && p <= 0.84 ? 'flex' : 'none',
                ),
              }}
            >
              <div className="prio-deepdive-layout">
                {/* Main Diagnostic Insight Card */}
                <article className="prio-deepdive-main">
                  <div className="prio-deepdive-main__specular" />
                  <div className="prio-deepdive-main__header">
                    <div className="prio-deepdive-main__badge">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      <span>DIAGNÓSTICO SISTÉMICO // LECTURA DE FOCUS</span>
                    </div>
                    <span className="text-xs font-mono text-purple-300/70">
                      {priority.startedTimeAgo}
                    </span>
                  </div>

                  <p className="prio-deepdive-main__lead">
                    FOCUS elevó este asunto porque concentra{' '}
                    <strong className="text-white underline decoration-cyan-400/40 decoration-2 underline-offset-4 font-semibold">
                      {priority.affectedCount} {priority.affectedUnit}
                    </strong>
                    , con un deterioro de{' '}
                    <strong className="text-rose-300 font-bold">
                      {priority.deltaPercentage > 0 ? '+' : ''}
                      {priority.deltaPercentage}%
                    </strong>{' '}
                    frente a su ritmo operativo habitual.{' '}
                    <span className="text-slate-300 font-normal">
                      {priority.explanation.summaryText}
                    </span>
                  </p>

                  <div className="prio-deepdive-main__kicker">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>AFECTACIÓN DIRECTA AISLADA EN CADENA CRÍTICA</span>
                  </div>
                </article>

                {/* 3 Pillars Cards (Impact, Persistence, Relevance) */}
                <div className="prio-deepdive-pillars">
                  {/* Pillar 1: Impacto */}
                  <motion.div
                    className="prio-pillar prio-pillar--impact"
                    style={{
                      opacity: reduceMotion ? 1 : chipOneOpacity,
                      y: reduceMotion ? 0 : chipOneY,
                    }}
                  >
                    <div className="prio-pillar__icon">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="prio-pillar__info">
                      <small className="prio-pillar__tag text-rose-300">DIMENSIÓN 01</small>
                      <h4 className="prio-pillar__title">Impacto Operacional</h4>
                      <strong className="prio-pillar__value text-rose-200">
                        {priority.explanation.impact}
                      </strong>
                    </div>
                    <span className="prio-pillar__badge bg-rose-500/15 border-rose-500/30 text-rose-300">
                      ALTO
                    </span>
                  </motion.div>

                  {/* Pillar 2: Persistencia */}
                  <motion.div
                    className="prio-pillar prio-pillar--persistence"
                    style={{
                      opacity: reduceMotion ? 1 : chipTwoOpacity,
                      y: reduceMotion ? 0 : chipTwoY,
                    }}
                  >
                    <div className="prio-pillar__icon">
                      <Clock className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="prio-pillar__info">
                      <small className="prio-pillar__tag text-cyan-300">DIMENSIÓN 02</small>
                      <h4 className="prio-pillar__title">Persistencia Temporal</h4>
                      <strong className="prio-pillar__value text-cyan-200">
                        {priority.explanation.persistence}
                      </strong>
                    </div>
                    <span className="prio-pillar__badge bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                      CONTINUO
                    </span>
                  </motion.div>

                  {/* Pillar 3: Relevancia */}
                  <motion.div
                    className="prio-pillar prio-pillar--relevance"
                    style={{
                      opacity: reduceMotion ? 1 : chipThreeOpacity,
                      y: reduceMotion ? 0 : chipThreeY,
                    }}
                  >
                    <div className="prio-pillar__icon">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="prio-pillar__info">
                      <small className="prio-pillar__tag text-purple-300">DIMENSIÓN 03</small>
                      <h4 className="prio-pillar__title">Relevancia Estratégica</h4>
                      <strong className="prio-pillar__value text-purple-200">
                        {priority.explanation.relevance}
                      </strong>
                    </div>
                    <span className="prio-pillar__badge bg-purple-500/15 border-purple-500/30 text-purple-300">
                      ESTRATÉGICO
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Status & Step Navigation Bar */}
          <div className="prio-stage__bottom">
            <div className="prio-step-indicator">
              <PrioStepDot active={stepOneActive} label="01 · CONTRASTE OPERACIONAL" />
              <PrioStepDot active={stepTwoActive} label="02 · DIAGNÓSTICO DE FOCUS" />
              <PrioStepDot active={stepThreeActive} label="03 · SÍNTESIS" />
            </div>

            <span className="text-[10px] font-mono text-cyan-300/70 uppercase tracking-wider">
              {priority.affectedCount} {priority.affectedUnit.toUpperCase()} // +{priority.deltaPercentage}% DESVÍO
            </span>
          </div>
        </motion.div>

        {/* ACTO 4: Conclusión Editorial y Handoff (0.82 - 1.00) */}
        <motion.div
          className="prio-conclusion"
          style={{
            opacity: reduceMotion ? 1 : conclusionOpacity,
            y: reduceMotion ? 0 : conclusionY,
            scale: reduceMotion ? 1 : conclusionScale,
            pointerEvents: useTransform(storyProgress, (p: number) =>
              p >= 0.82 ? 'auto' : 'none',
            ),
          }}
          aria-label="Conclusión editorial de prioridad"
        >
          <div className="prio-conclusion__badge">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              ASUNTO PRIORITARIO IDENTIFICADO · ACCIÓN AISLADA
            </span>
          </div>

          <h3 className="prio-conclusion__headline">
            Ya sabes cuál es la prioridad.
          </h3>

          <p className="prio-conclusion__sub">
            Ahora profundicemos en las razones: cuatro factores convergentes que explican exactamente por qué ocurrió.
          </p>

          <div className="prio-conclusion__chips">
            <span className="prio-conclusion__chip">
              AFECTACIÓN: {priority.affectedCount} {priority.affectedUnit.toUpperCase()}
            </span>
            <span className="prio-conclusion__chip">
              DESVÍO: +{priority.deltaPercentage}%
            </span>
            <span className="prio-conclusion__chip">
              ORIGEN CONFIRMADO
            </span>
          </div>

          {onContinue && (
            <button
              type="button"
              className="prio-conclusion__cta"
              onClick={onContinue}
              aria-label="Continuar al capítulo Por Qué"
            >
              <span>Explorar las 4 razones en Por Qué</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const PrioStepDot: React.FC<{
  active: ReturnType<typeof useTransform<number, boolean>>;
  label: string;
}> = ({ active, label }) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    return active.on('change', (v) => setIsActive(v));
  }, [active]);

  return (
    <span className={`prio-step-dot ${isActive ? 'is-active' : ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

