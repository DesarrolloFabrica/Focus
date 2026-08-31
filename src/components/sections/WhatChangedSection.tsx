import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import {
  Clock3,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Cpu,
  ShieldAlert,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FocusChange, FocusChangeEvent } from '../../types/focus';
import { useBriefingSectionMetrics } from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';

interface WhatChangedSectionProps {
  changes: FocusChange;
  onContinue?: () => void;
}

interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  nodeBg: string;
  nodeBorder: string;
  nodeIconColor: string;
  Icon: React.ComponentType<{ className?: string }>;
  defaultOrigin: string;
}

function getStatusConfig(status: FocusChangeEvent['status']): StatusConfig {
  switch (status) {
    case 'escalation':
      return {
        label: 'PRIORIDAD ELEVADA',
        badgeBg: 'bg-purple-500/20',
        badgeBorder: 'border-purple-400/40',
        badgeText: 'text-purple-300',
        nodeBg: 'bg-[#1b0a2e]',
        nodeBorder: 'border-purple-400/60',
        nodeIconColor: 'text-purple-300',
        Icon: Zap,
        defaultOrigin: 'FOCUS Engine // Priorización',
      };
    case 'threshold':
      return {
        label: 'LÍMITE SUPERADO',
        badgeBg: 'bg-rose-500/20',
        badgeBorder: 'border-rose-400/40',
        badgeText: 'text-rose-300',
        nodeBg: 'bg-[#250815]',
        nodeBorder: 'border-rose-400/60',
        nodeIconColor: 'text-rose-300',
        Icon: ShieldAlert,
        defaultOrigin: 'Monitor de Umbrales // Latencia',
      };
    case 'resolved':
      return {
        label: 'NORMALIZADO',
        badgeBg: 'bg-emerald-500/20',
        badgeBorder: 'border-emerald-400/40',
        badgeText: 'text-emerald-300',
        nodeBg: 'bg-[#06241a]',
        nodeBorder: 'border-emerald-400/60',
        nodeIconColor: 'text-emerald-300',
        Icon: CheckCircle2,
        defaultOrigin: 'Sensor Unidad Este // Flujo',
      };
    case 'new':
    default:
      return {
        label: 'NUEVO PATRÓN',
        badgeBg: 'bg-cyan-500/20',
        badgeBorder: 'border-cyan-400/40',
        badgeText: 'text-cyan-300',
        nodeBg: 'bg-[#071b30]',
        nodeBorder: 'border-cyan-400/60',
        nodeIconColor: 'text-cyan-300',
        Icon: TrendingUp,
        defaultOrigin: 'Punto de Validación B // Sensor',
      };
  }
}

export const WhatChangedSection: React.FC<WhatChangedSectionProps> = ({ changes }) => {
  const reduceMotion = !!useReducedMotion();
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
    'changes',
    scrollRootRef?.current ?? null,
    useCallback(
      (metrics) => {
        rawProgress.set(metrics.progress);
      },
      [rawProgress],
    ),
  );

  // ACT 1: Apertura Editorial (0.00 - 0.28)
  const openingBadgeOpacity = useTransform(storyProgress, [0, 0.20, 0.26], [1, 1, 0]);
  const openingFirstOpacity = useTransform(storyProgress, [0, 0.06, 0.09], [1, 1, 0]);
  const openingFirstY = useTransform(storyProgress, [0, 0.06, 0.09], [0, 0, -16]);

  const openingExplainOpacity = useTransform(storyProgress, [0.08, 0.11, 0.16, 0.19], [0, 1, 1, 0]);
  const openingExplainY = useTransform(storyProgress, [0.08, 0.11, 0.19], [20, 0, -16]);

  const openingHeadlineOpacity = useTransform(storyProgress, [0.18, 0.21, 0.26, 0.29], [0, 1, 1, 0]);
  const openingHeadlineY = useTransform(storyProgress, [0.18, 0.21, 0.29], [20, 0, -16]);

  const openingLayerOpacity = useTransform(storyProgress, [0, 0.27, 0.30], [1, 1, 0]);

  // ACT 2: Stage & Comparison (0.28 - 0.54)
  const stageOpacity = useTransform(storyProgress, [0.27, 0.31, 0.81, 0.85], [0, 1, 1, 0]);
  const stageScale = useTransform(storyProgress, [0.27, 0.32, 0.81, 0.85], [0.97, 1, 1, 0.96]);

  const compOpacity = useTransform(storyProgress, [0.28, 0.32, 0.50, 0.54], [0, 1, 1, 0]);
  const compY = useTransform(storyProgress, [0.28, 0.32, 0.50, 0.54], [24, 0, 0, -20]);

  const compBaseOpacity = useTransform(storyProgress, [0.28, 0.33, 0.50, 0.54], [0, 1, 1, 0]);
  const compBaseX = useTransform(storyProgress, [0.28, 0.33, 0.50, 0.54], [-20, 0, 0, -10]);

  const compBridgeOpacity = useTransform(storyProgress, [0.32, 0.36, 0.50, 0.54], [0, 1, 1, 0]);
  const compBridgeScale = useTransform(storyProgress, [0.32, 0.36, 0.50, 0.54], [0.85, 1, 1, 0.9]);

  const compCurrentOpacity = useTransform(storyProgress, [0.33, 0.38, 0.50, 0.54], [0, 1, 1, 0]);
  const compCurrentX = useTransform(storyProgress, [0.33, 0.38, 0.50, 0.54], [20, 0, 0, 10]);

  // ACT 3: Chronological Event Timeline Stream (0.54 - 0.82)
  const timelineOpacity = useTransform(storyProgress, [0.53, 0.57, 0.79, 0.83], [0, 1, 1, 0]);
  
  // Vertical stream trajectory: smoothly scrolls up as the user scrolls, perfectly centering each card in sequence!
  const timelineStreamY = useTransform(
    storyProgress,
    [0.55, 0.63, 0.71, 0.79],
    [50, 0, -110, -220],
  );

  // Step Tracker state indicators
  const stepOneActive = useTransform(storyProgress, (p: number) => p >= 0.28 && p < 0.54);
  const stepTwoActive = useTransform(storyProgress, (p: number) => p >= 0.54 && p < 0.82);
  const stepThreeActive = useTransform(storyProgress, (p: number) => p >= 0.82);

  // ACT 4: Editorial Conclusion & Reflection (0.82 - 1.00) — Remains visible as closure
  const conclusionOpacity = useTransform(storyProgress, [0.82, 0.86, 1], [0, 1, 1]);
  const conclusionY = useTransform(storyProgress, [0.82, 0.86, 1], [24, 0, 0]);
  const conclusionScale = useTransform(storyProgress, [0.82, 0.86, 1], [0.96, 1, 1]);

  const changeEvents = changes.changes || [];

  return (
    <section
      ref={sectionRef}
      id="section-chapter-changes"
      className="chg-section select-none"
      data-chapter="changes"
      aria-label="03 / 07 · Cambios: evolución y eventos observados"
    >
      <div className="chg-sticky">
        {/* Atmospheric Ambient Stage */}
        <div className="chg-ambient" aria-hidden="true">
          <div className="chg-ambient__base" />
          <div className="chg-ambient__grid" />
          <div className="chg-ambient__halo-1" />
          <div className="chg-ambient__halo-2" />
        </div>

        {/* ACTO 1: Apertura Editorial */}
        <motion.div
          className="chg-opening"
          style={{ opacity: reduceMotion ? 1 : openingLayerOpacity }}
          aria-hidden="true"
        >
          <motion.div
            className="chg-opening__badge"
            style={{ opacity: reduceMotion ? 1 : openingBadgeOpacity }}
          >
            <span>03 / 07</span>
            <i />
            <strong>CAMBIOS</strong>
          </motion.div>

          <motion.p
            className="chg-opening__line chg-opening__line--first"
            style={{
              opacity: reduceMotion ? 1 : openingFirstOpacity,
              y: reduceMotion ? 0 : openingFirstY,
            }}
          >
            Desde tu última visita.
          </motion.p>

          <motion.p
            className="chg-opening__line chg-opening__line--explain"
            style={{
              opacity: reduceMotion ? 1 : openingExplainOpacity,
              y: reduceMotion ? 0 : openingExplainY,
            }}
          >
            FOCUS analizó la <strong>evolución del contexto operacional</strong>.
          </motion.p>

          <motion.h2
            className="chg-opening__headline"
            style={{
              opacity: reduceMotion ? 1 : openingHeadlineOpacity,
              y: reduceMotion ? 0 : openingHeadlineY,
            }}
          >
            Esto es lo que se transformó de forma acumulativa.
          </motion.h2>
        </motion.div>

        {/* ACTO 2 & ACTO 3: Stage Container */}
        <motion.div
          className="chg-stage"
          style={{
            opacity: reduceMotion ? 1 : stageOpacity,
            scale: reduceMotion ? 1 : stageScale,
            pointerEvents: useTransform(storyProgress, (p: number) =>
              p >= 0.28 && p <= 0.82 ? 'auto' : 'none',
            ),
          }}
        >
          {/* Topline Bar */}
          <div className="chg-stage__topline">
            <span>
              <Layers />
              CHRONO_REF // 03.07 · EVOLUCIÓN OPERACIONAL
            </span>
            <span>STREAM_DELTA: ACTIVE</span>
          </div>

          <div className="chg-stage__content">
            {/* ACTO 2: Comparación de Estados & Divergencia (0.28 - 0.54) */}
            <motion.div
              className="chg-comparison-stage"
              style={{
                opacity: reduceMotion ? 1 : compOpacity,
                y: reduceMotion ? 0 : compY,
                display: useTransform(storyProgress, (p: number) =>
                  p >= 0.25 && p <= 0.55 ? 'flex' : 'none',
                ),
              }}
            >
              <div className="chg-comparison-grid">
                {/* Left Card: Línea Base */}
                <motion.article
                  className="chg-comp-card chg-comp-card--baseline"
                  style={{
                    opacity: reduceMotion ? 1 : compBaseOpacity,
                    x: reduceMotion ? 0 : compBaseX,
                  }}
                >
                  <div className="chg-comp-card__specular" />
                  <div className="chg-comp-card__header">
                    <div className="chg-comp-card__label-group">
                      <div className="chg-comp-card__icon">
                        <Clock3 className="w-4 h-4" />
                      </div>
                      <span className="chg-comp-card__label">
                        {changes.previousState?.label || 'Última visita'}
                      </span>
                    </div>
                    <span className="chg-comp-card__badge">LÍNEA BASE</span>
                  </div>

                  <h3 className="chg-comp-card__value">
                    {changes.previousState?.value ?? '2.1 días'}
                  </h3>
                  <p className="chg-comp-card__sub">Operación en rango habitual</p>
                  <p className="chg-comp-card__desc">{changes.previousState?.description}</p>
                </motion.article>

                {/* Center Divergence Bridge */}
                <motion.div
                  className="chg-comp-bridge"
                  style={{
                    opacity: reduceMotion ? 1 : compBridgeOpacity,
                    scale: reduceMotion ? 1 : compBridgeScale,
                  }}
                >
                  <div className="chg-comp-bridge__pill">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>DIVERGENCIA ACUMULADA</span>
                  </div>
                </motion.div>

                {/* Right Card: Estado Actual */}
                <motion.article
                  className="chg-comp-card chg-comp-card--current"
                  style={{
                    opacity: reduceMotion ? 1 : compCurrentOpacity,
                    x: reduceMotion ? 0 : compCurrentX,
                  }}
                >
                  <div className="chg-comp-card__specular" />
                  <div className="chg-comp-card__header">
                    <div className="chg-comp-card__label-group">
                      <div className="chg-comp-card__icon">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="chg-comp-card__label">
                        {changes.currentState?.label || 'Ahora'}
                      </span>
                    </div>
                    <span className="chg-comp-card__badge">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      DESVIACIÓN CRÍTICA
                    </span>
                  </div>

                  <h3 className="chg-comp-card__value">
                    {changes.currentState?.value ?? '5.8 días'}
                  </h3>
                  <p className="chg-comp-card__sub">Aceleración de latencia confirmada</p>
                  <p className="chg-comp-card__desc">{changes.currentState?.description}</p>
                </motion.article>
              </div>
            </motion.div>

            {/* ACTO 3: Línea de Tiempo Secuencial de Eventos (0.54 - 0.82) */}
            <motion.div
              className="chg-timeline-stage"
              style={{
                opacity: reduceMotion ? 1 : timelineOpacity,
                display: useTransform(storyProgress, (p: number) =>
                  p >= 0.52 && p <= 0.84 ? 'flex' : 'none',
                ),
              }}
            >
              <motion.div
                className="chg-timeline"
                style={{
                  y: reduceMotion ? 0 : timelineStreamY,
                }}
              >
                <div className="chg-timeline__spine">
                  <div className="chg-timeline__spine-pulse" />
                </div>

                {changeEvents.map((evt, idx) => {
                  const isEven = idx % 2 === 0;
                  const cfg = getStatusConfig(evt.status);
                  const NodeIcon = cfg.Icon;

                  // Progressive entry & highlight intervals
                  const cardStart = 0.54 + idx * 0.06;
                  const cardPeak = cardStart + 0.05;

                  return (
                    <TimelineEventItem
                      key={evt.id || idx}
                      event={evt}
                      config={cfg}
                      NodeIcon={NodeIcon}
                      isEven={isEven}
                      start={cardStart}
                      peak={cardPeak}
                      storyProgress={storyProgress}
                      reduceMotion={reduceMotion}
                    />
                  );
                })}
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Status & Step Navigation Bar */}
          <div className="chg-stage__bottom">
            <div className="chg-step-indicator">
              <StepDot active={stepOneActive} label="01 · COMPARACIÓN" />
              <StepDot active={stepTwoActive} label="02 · SECUENCIA TEMPORAL" />
              <StepDot active={stepThreeActive} label="03 · SÍNTESIS" />
            </div>

            <span className="text-[10px] font-mono text-purple-300/60 uppercase tracking-wider">
              {changes.newItemsCount} EVENTOS // {changes.relevantChangesCount} RELEVANTES
            </span>
          </div>
        </motion.div>

        {/* ACTO 4: Conclusión Editorial y Balance (0.82 - 1.00) */}
        <motion.div
          className="chg-conclusion"
          style={{
            opacity: reduceMotion ? 1 : conclusionOpacity,
            y: reduceMotion ? 0 : conclusionY,
            scale: reduceMotion ? 1 : conclusionScale,
            pointerEvents: useTransform(storyProgress, (p: number) =>
              p >= 0.82 ? 'auto' : 'none',
            ),
          }}
          aria-label="Conclusión editorial de cambios"
        >
          <div className="chg-conclusion__badge">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {changes.newItemsCount} EVENTOS OBSERVADOS · {changes.relevantChangesCount} CAMBIOS RELEVANTES
            </span>
          </div>

          <h3 className="chg-conclusion__headline">
            Los cambios acumulados revelan una tendencia.
          </h3>

          <p className="chg-conclusion__sub">
            El contexto operacional evolucionó. Ahora veamos la anomalía puntual que se desprendió de esto.
          </p>

          <div className="chg-conclusion__chips">
            <span className="chg-conclusion__chip">LATENCIA +176%</span>
            <span className="chg-conclusion__chip">AUDITORÍA CONTINUA</span>
            <span className="chg-conclusion__chip">PATRÓN CONFIRMADO</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

interface TimelineEventItemProps {
  event: FocusChangeEvent;
  config: StatusConfig;
  NodeIcon: React.ComponentType<{ className?: string }>;
  isEven: boolean;
  start: number;
  peak: number;
  storyProgress: ReturnType<typeof useSpring>;
  reduceMotion: boolean;
}

const TimelineEventItem: React.FC<TimelineEventItemProps> = ({
  event,
  config,
  NodeIcon,
  isEven,
  start,
  peak,
  storyProgress,
  reduceMotion,
}) => {
  const itemOpacity = useTransform(storyProgress, [start, peak], [0, 1]);
  const itemX = useTransform(
    storyProgress,
    [start, peak],
    isEven ? [-20, 0] : [20, 0],
  );
  const nodeScale = useTransform(storyProgress, [start, peak], [0.6, 1]);

  return (
    <motion.div
      className={`chg-timeline__row ${isEven ? 'chg-timeline__row--even' : 'chg-timeline__row--odd'}`}
      style={{
        opacity: reduceMotion ? 1 : itemOpacity,
        x: reduceMotion ? 0 : itemX,
      }}
    >
      <div className="chg-timeline__card">
        <div className="chg-timeline__card-header">
          <span className="chg-timeline__time">
            <Clock3 className="w-3 h-3 text-cyan-400" />
            {event.timeLabel}
          </span>

          <span
            className={`chg-timeline__badge ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
          >
            {config.label}
          </span>
        </div>

        <h4 className="chg-timeline__title">{event.title}</h4>
        <p className="chg-timeline__desc">{event.description}</p>

        <div className="chg-timeline__footer">
          <span className="chg-timeline__origin">
            <Cpu className="w-3 h-3 text-purple-400" />
            {config.defaultOrigin}
          </span>
          <span className="chg-timeline__tag">AUDITADO</span>
        </div>
      </div>

      {/* Central Node Indicator */}
      <motion.div
        className={`chg-timeline__node ${config.nodeBg} ${config.nodeBorder}`}
        style={{ scale: reduceMotion ? 1 : nodeScale }}
      >
        <NodeIcon className={`w-4 h-4 ${config.nodeIconColor}`} />
      </motion.div>
    </motion.div>
  );
};

const StepDot: React.FC<{ active: ReturnType<typeof useTransform<number, boolean>>; label: string }> = ({
  active,
  label,
}) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    return active.on('change', (v) => setIsActive(v));
  }, [active]);

  return (
    <span className={`chg-step-dot ${isActive ? 'is-active' : ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
