import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  Clock3,
  Activity,
  Flame,
  Radio,
} from 'lucide-react';
import focusPriorityScene from '../../assets/focus-priority-command-center-v2.png';
import { FocusPriority } from '../../types/focus';
import { useBriefingSectionMetrics, usePerfConfig } from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';

interface PrioritySectionProps {
  priority: FocusPriority;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({ priority }) => {
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
  // ACT 1: SEÑAL Y CONTRASTE OPERACIONAL (0.00 - 0.48) - VISIBLE IMMEDIATELY
  // ---------------------------------------------------------------------------
  const act1Opacity = useTransform(storyProgress, [0, 0.44, 0.49], [1, 1, 0]);
  const act1Y = useTransform(storyProgress, [0, 0.44, 0.49], [0, 0, -20]);
  const act1Scale = useTransform(storyProgress, [0, 0.44, 0.49], [1, 1, 0.96]);

  const beaconScale = useTransform(storyProgress, [0, 0.05, 0.44, 0.49], [1, 1, 1, 0.94]);
  const beaconOpacity = useTransform(storyProgress, [0, 0.44, 0.49], [1, 1, 0]);

  const cardCurrentOpacity = useTransform(storyProgress, [0, 0.44, 0.49], [1, 1, 0]);
  const cardCurrentX = useTransform(storyProgress, [0, 0.44, 0.49], [0, 0, 12]);

  const cardBaseOpacity = useTransform(storyProgress, [0, 0.44, 0.49], [1, 1, 0]);
  const cardBaseX = useTransform(storyProgress, [0, 0.44, 0.49], [0, 0, 12]);

  const divergencePillOpacity = useTransform(storyProgress, [0, 0.44, 0.49], [1, 1, 0]);
  const divergencePillScale = useTransform(storyProgress, [0, 0.44, 0.49], [1, 1, 0.92]);

  // ---------------------------------------------------------------------------
  // ACT 2: DIAGNÓSTICO PROFUNDO & 3 DIMENSIONES (0.48 - 0.78)
  // ---------------------------------------------------------------------------
  const act2Opacity = useTransform(storyProgress, [0.48, 0.53, 0.75, 0.80], [0, 1, 1, 0]);
  const act2Y = useTransform(storyProgress, [0.48, 0.53, 0.75, 0.80], [24, 0, 0, -20]);

  const chipOneOpacity = useTransform(storyProgress, [0.52, 0.58], [0, 1]);
  const chipOneY = useTransform(storyProgress, [0.52, 0.58], [16, 0]);

  const chipTwoOpacity = useTransform(storyProgress, [0.57, 0.63], [0, 1]);
  const chipTwoY = useTransform(storyProgress, [0.57, 0.63], [16, 0]);

  const chipThreeOpacity = useTransform(storyProgress, [0.62, 0.68], [0, 1]);
  const chipThreeY = useTransform(storyProgress, [0.62, 0.68], [16, 0]);

  // Step Indicators
  const stepOneActive = useTransform(storyProgress, (p: number) => p < 0.48);
  const stepTwoActive = useTransform(storyProgress, (p: number) => p >= 0.48 && p < 0.78);
  const stepThreeActive = useTransform(storyProgress, (p: number) => p >= 0.78);

  // ---------------------------------------------------------------------------
  // ACT 3: SÍNTESIS EDITORIAL & HANDOFF (0.78 - 1.00)
  // ---------------------------------------------------------------------------
  const conclusionOpacity = useTransform(storyProgress, [0.78, 0.83, 1], [0, 1, 1]);
  const conclusionY = useTransform(storyProgress, [0.78, 0.83, 1], [24, 0, 0]);
  const conclusionScale = useTransform(storyProgress, [0.78, 0.83, 1], [0.96, 1, 1]);

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

        {/* Main Stage Container */}
        <div className="prio-stage">
          {/* Topline Bar */}
          <div className="prio-stage__topline">
            <span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              01 / 07 · PRIORIDAD PRINCIPAL // ASUNTO AISLADO
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              TELEMETRY: ACTIVE
            </span>
          </div>

          <div className="prio-stage__content">
            {/* ACTO 1: Beacon Holográfico & Contraste Operacional (0.00 - 0.48) */}
            <motion.div
              className="prio-act-contrast"
              style={{
                opacity: reduceMotion ? 1 : act1Opacity,
                y: reduceMotion ? 0 : act1Y,
                scale: reduceMotion ? 1 : act1Scale,
                display: useTransform(storyProgress, (p: number) =>
                  p <= 0.50 ? 'flex' : 'none',
                ),
                pointerEvents: useTransform(storyProgress, (p: number) =>
                  p <= 0.48 ? 'auto' : 'none',
                ),
              }}
            >
              {/* Executive Header Banner */}
              <div className="prio-contrast-banner">
                <h2 className="prio-contrast-banner__title">
                  {priority.headline}
                </h2>
                <p className="prio-contrast-banner__desc">
                  {priority.description}
                </p>
              </div>

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

                  <div className="prio-beacon-visual__hud" aria-hidden="true">
                    <span>
                      <Radio className="w-3.5 h-3.5" />
                      NÚCLEO PRIORITARIO
                    </span>
                    <span>FOCUS / 01</span>
                  </div>
                  
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
                      src={focusPriorityScene}
                      alt="Centro de observación de FOCUS con el núcleo prioritario completamente visible"
                      loading="eager"
                      decoding="async"
                      className="prio-beacon-visual__img"
                      animate={useFullDetailMotion ? { y: [-3, 3, -3] } : false}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>

                  <div className="prio-beacon-visual__subject">
                    <span>ASUNTO AISLADO</span>
                    <strong>{priority.title}</strong>
                  </div>

                  {/* Live Telemetry Pill */}
                  <figcaption className="prio-beacon-visual__pill">
                    <div className="flex items-center gap-2">
                      <span className="prio-beacon-visual__live-dot" />
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
                  </figcaption>
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

                    <div className="prio-card__metric-row">
                      <div>
                        <h3 className="prio-card__value text-rose-200">{priority.currentMetric}</h3>
                        <p className="prio-card__sub text-rose-300/80">Ritmo observado en tiempo real</p>
                      </div>
                      <div className="prio-card__metric-note is-alert">
                        <small>BRECHA ACTIVA</small>
                        <strong>+{priority.deltaPercentage}%</strong>
                      </div>
                    </div>
                    <p className="prio-card__desc">
                      El indicador opera significativamente alejado del estándar de referencia que la operación suele sostener.
                    </p>
                    <div className="prio-card__footer">
                      <span>Umbral habitual</span>
                      <strong>{priority.usualMetric}</strong>
                    </div>
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

                    <div className="prio-card__metric-row">
                      <div>
                        <h3 className="prio-card__value text-blue-200">{priority.usualMetric}</h3>
                        <p className="prio-card__sub text-blue-300/80">Comportamiento histórico normal</p>
                      </div>
                      <div className="prio-card__metric-note is-base">
                        <small>ESTADO</small>
                        <strong>ESTABLE</strong>
                      </div>
                    </div>
                    <p className="prio-card__desc">
                      El comportamiento esperado se mantiene cerca de este nivel de estabilidad. Ese contraste define la prioridad.
                    </p>
                    <div className="prio-card__footer">
                      <span>Patrón de referencia</span>
                      <strong>Línea base validada</strong>
                    </div>
                  </motion.article>
                </div>
              </div>
            </motion.div>

            {/* ACTO 2: Lectura Diagnóstica de FOCUS & 3 Dimensiones (0.48 - 0.78) */}
            <motion.div
              className="prio-act-deepdive"
              style={{
                opacity: reduceMotion ? 1 : act2Opacity,
                y: reduceMotion ? 0 : act2Y,
                display: useTransform(storyProgress, (p: number) =>
                  p >= 0.46 && p <= 0.80 ? 'flex' : 'none',
                ),
                pointerEvents: useTransform(storyProgress, (p: number) =>
                  p >= 0.48 && p <= 0.78 ? 'auto' : 'none',
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
              <PrioStepDot active={stepOneActive} label="01 · SEÑAL Y CONTRASTE" />
              <PrioStepDot active={stepTwoActive} label="02 · DIAGNÓSTICO DE FOCUS" />
              <PrioStepDot active={stepThreeActive} label="03 · SÍNTESIS" />
            </div>

            <span className="text-[10px] font-mono text-cyan-300/70 uppercase tracking-wider">
              {priority.affectedCount} {priority.affectedUnit.toUpperCase()} // +{priority.deltaPercentage}% DESVÍO
            </span>
          </div>
        </div>

        {/* ACTO 3: Conclusión Editorial y Handoff (0.78 - 1.00) */}
        <motion.div
          className="prio-conclusion"
          style={{
            opacity: reduceMotion ? 1 : conclusionOpacity,
            y: reduceMotion ? 0 : conclusionY,
            scale: reduceMotion ? 1 : conclusionScale,
            pointerEvents: useTransform(storyProgress, (p: number) =>
              p >= 0.78 ? 'auto' : 'none',
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

          <div
            className="prio-conclusion__scroll-cue"
            aria-label="Sigue deslizando para ver el resumen completo de FOCUS"
          >
            <span>Sigue deslizando</span>
            <small>para ver el resumen completo de FOCUS</small>
            <div className="prio-conclusion__scroll-track" aria-hidden="true">
              <i />
              <ChevronDown />
            </div>
          </div>
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

