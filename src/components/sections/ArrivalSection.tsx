import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Database,
  Layers3,
  Radar,
  Settings2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import focusObservatory from '../../assets/focus-observatory.webp';
import focusObservatoryLoop from '../../assets/animacion-aro-opt.mp4';
import { FocusBriefing, FocusCoreState } from '../../types/focus';
import { AmbientVideo } from '../effects/AmbientVideo';
import { ArrivalCursorField } from '../effects/ArrivalCursorField';
import { BriefingJourneyAmbient } from '../effects/BriefingJourneyAmbient';
import { FocusCore } from '../core/FocusCore';
import { SignalConnectorKey, useSignalConnectors } from '../../hooks/useSignalConnectors';

export const IntroScrollContext = createContext<React.RefObject<HTMLDivElement | null>>({ current: null });

export const useIntroScrollRoot = () => useContext(IntroScrollContext);

interface ArrivalSectionProps {
  briefing: FocusBriefing;
  onStartBriefing: () => void;
  isStartingTransition?: boolean;
  isBriefingActive?: boolean;
  briefingActiveStep?: number;
  onOpenDemo?: () => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
}

const ease = [0.16, 1, 0.3, 1] as const;
const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SIGNAL_CYCLE: SignalConnectorKey[] = ['priorities', 'changes', 'anomalies', 'stable'];

const connectorColors: Record<SignalConnectorKey, string> = {
  priorities: '#fb923c',
  changes: '#60a5fa',
  anomalies: '#c084fc',
  stable: '#4ade80',
};

export const ArrivalSection: React.FC<ArrivalSectionProps> = ({
  briefing,
  onStartBriefing,
  isStartingTransition = false,
  isBriefingActive = false,
  briefingActiveStep = 0,
  onOpenDemo,
  header,
  children,
}) => {
  const reduceMotion = !!useReducedMotion();
  const [hoveredSignal, setHoveredSignal] = useState<SignalConnectorKey | null>(null);
  const [cycledSignal, setCycledSignal] = useState<SignalConnectorKey | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const signalRefs = useRef<Record<SignalConnectorKey, HTMLElement | null>>({
    priorities: null,
    changes: null,
    anomalies: null,
    stable: null,
  });

  const isStable = briefing.scenario === 'stable';
  const isFolding = isStartingTransition || isBriefingActive;
  const showBriefing = Boolean(children) && isBriefingActive;
  const streamsEnabled = !reduceMotion && !isFolding;

  const { connectors, stageSize, remeasure } = useSignalConnectors(
    stageRef,
    coreRef,
    signalRefs,
    streamsEnabled,
  );

  const signalCards: Array<{
    id: SignalConnectorKey;
    label: string;
    value: number;
    detail: string;
    Icon: typeof Activity;
    position: string;
    coreState: FocusCoreState;
  }> = [
    {
      id: 'priorities',
      label: 'Prioridades',
      value: briefing.dimensions.prioritiesCount,
      detail: briefing.dimensions.prioritiesSummary,
      Icon: Layers3,
      position: 'top-left',
      coreState: briefing.dimensions.prioritiesCount ? 'attention' : 'observing',
    },
    {
      id: 'changes',
      label: 'Qué cambió',
      value: briefing.dimensions.changesCount,
      detail: briefing.dimensions.changesSummary,
      Icon: Database,
      position: 'bottom-left',
      coreState: 'change',
    },
    {
      id: 'anomalies',
      label: 'Anomalías',
      value: briefing.dimensions.anomaliesCount,
      detail: briefing.dimensions.anomaliesSummary,
      Icon: Radar,
      position: 'top-right',
      coreState: briefing.dimensions.anomaliesCount ? 'analysis' : 'observing',
    },
    {
      id: 'stable',
      label: 'Estable',
      value: briefing.dimensions.stableCount,
      detail: briefing.dimensions.stableSummary,
      Icon: ShieldCheck,
      position: 'bottom-right',
      coreState: 'stable',
    },
  ];

  const activeSignalId = hoveredSignal ?? cycledSignal;
  const activeSignal = signalCards.find((signal) => signal.id === activeSignalId);
  const coreState: FocusCoreState = activeSignal?.coreState
    ?? (isStartingTransition ? 'explaining' : isStable ? 'stable' : 'observing');

  const panoramaCards = signalCards.map((card) => ({
    ...card,
    emphasis: card.id === 'priorities' ? !isStable : card.id === 'stable' ? isStable : false,
  }));

  const panoramaSectionVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };

  const panoramaFadeUp: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease },
    },
  };

  const panoramaFadeLeft: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: EASE_OUT_SOFT },
    },
  };

  const panoramaFadeRight: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, x: 28, scale: 0.96 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.85, ease },
    },
  };

  const panoramaCardVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.97 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: reduceMotion ? 0 : 0.08 + i * 0.08,
        ease,
      },
    }),
  };

  const scrollToBriefingChapter = (id: string) => {
    const target = document.getElementById(id);
    const root = scrollRef.current;
    if (!target || !root) return;
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = root.scrollTop + (targetRect.top - rootRect.top) - 8;
    root.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const reveal = (delay: number, y = 14) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: {
      opacity: isFolding ? 0 : 1,
      y: isFolding ? -14 : 0,
    },
    transition: {
      duration: reduceMotion ? 0.01 : isFolding ? 0.58 : 0.55,
      delay: reduceMotion ? 0 : isFolding ? 0 : delay,
      ease,
    },
  });

  useEffect(() => {
    if (!isBriefingActive || !showBriefing) return;
    const timer = window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }, reduceMotion ? 40 : 280);
    return () => window.clearTimeout(timer);
  }, [isBriefingActive, showBriefing, reduceMotion]);

  useEffect(() => {
    if (isBriefingActive) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [isBriefingActive, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || isFolding || hoveredSignal) {
      if (hoveredSignal) setCycledSignal(null);
      return undefined;
    }

    let index = 0;
    setCycledSignal(SIGNAL_CYCLE[0]);
    const timer = window.setInterval(() => {
      index = (index + 1) % SIGNAL_CYCLE.length;
      setCycledSignal(SIGNAL_CYCLE[index]);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [reduceMotion, isFolding, hoveredSignal]);

  useEffect(() => {
    if (!isFolding) {
      window.requestAnimationFrame(() => remeasure());
    }
  }, [isFolding, remeasure]);

  useEffect(() => {
    if (isBriefingActive || isStartingTransition) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.key === ' ' || (e.key === 'Enter' && (document.activeElement === document.body || document.activeElement?.id === 'btn-start-briefing'))) {
        e.preventDefault();
        onStartBriefing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBriefingActive, isStartingTransition, onStartBriefing]);

  return (
    <section
      ref={sectionRef}
      id="focus-arrival-view"
      className={`iv-cover iv-intro${isStartingTransition ? ' is-departing' : ''}${showBriefing ? ' is-briefing' : ''}`}
      data-chapter={showBriefing ? undefined : 'panorama'}
    >
      <div className="iv-intro__ambient" aria-hidden="true"><i /><i /><i /></div>
      {!showBriefing && (
        <ArrivalCursorField targetRef={sectionRef} className="iv-intro__cursor-field" />
      )}

      <div className="iv-intro__frame">
        {showBriefing ? (
          header
        ) : (
          <nav className="iv-intro-nav" aria-label="Navegación de introducción">
            <button
              type="button"
              className="iv-intro-brand"
              aria-label="FOCUS, inicio"
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
            >
              <span><i /><b>F</b></span>
              <strong>FOCUS</strong>
            </button>

            <div className="iv-intro-nav__actions">
              {onOpenDemo && (
                <button
                  type="button"
                  className="iv-intro-nav__tool"
                  onClick={onOpenDemo}
                  aria-label="Abrir escenarios de demostración"
                  title="Escenario y perspectiva"
                >
                  <Settings2 aria-hidden="true" />
                </button>
              )}
              <button
                id="btn-start-briefing"
                type="button"
                className="iv-intro-nav__cta"
                onClick={() => onStartBriefing()}
                disabled={isStartingTransition || isBriefingActive}
              >
                <span>{isStartingTransition ? 'Abriendo briefing' : 'Iniciar briefing'}</span>
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </nav>
        )}

        <div
          id="iv-intro-scroll"
          ref={scrollRef}
          className={`iv-intro__scroll${showBriefing ? ' is-active' : ''}`}
        >
          <div
            id="section-chapter-panorama"
            className={`iv-intro__hero${showBriefing ? ' is-collapsed' : ''}`}
            data-chapter={showBriefing ? undefined : 'panorama'}
            aria-hidden={isFolding}
          >
            <div className="iv-intro__hero-copy">
              <motion.div className="iv-intro__eyebrow" {...reveal(0.15, 8)}>
                <span className="iv-intro__status-dot" aria-hidden="true" />
                <span className="iv-intro__greeting-title">{briefing.greeting}</span>
                <span className="iv-intro__greeting-sync" aria-hidden="true">/ OPERACIÓN SINCRONIZADA</span>
              </motion.div>
              <motion.h1
                {...reveal(0.24, 14)}
                aria-label={
                  isStable
                    ? 'Revisé tu operación completa. Todo está bajo control.'
                    : 'Revisé tu operación completa. Esto es lo que importa hoy.'
                }
              >
                {isStable ? (
                  <>
                    Revisé tu operación completa.<br />
                    Todo está <span>bajo control.</span>
                  </>
                ) : (
                  <>
                    Revisé tu operación completa.<br />
                    Esto es lo que <span>importa</span> hoy.
                  </>
                )}
              </motion.h1>
              <motion.p {...reveal(0.34, 10)}>
                {briefing.summarySentence}
              </motion.p>
            </div>

            <div ref={stageRef} className="iv-intro-stage">
              <div className="iv-intro-stage__glow" aria-hidden="true" />

              <svg className="iv-intro-stage__orbits" viewBox="0 0 920 470" aria-hidden="true">
                <ellipse className="is-a" cx="460" cy="258" rx="280" ry="110" />
                <ellipse className="is-b" cx="460" cy="258" rx="320" ry="130" transform="rotate(-8 460 258)" />
                <ellipse className="is-c" cx="460" cy="258" rx="240" ry="195" transform="rotate(24 460 258)" />
                <circle className="is-node is-node-1" cx="180" cy="248" r="2.0" />
                <circle className="is-node is-node-2" cx="740" cy="248" r="2.0" />
                <circle className="is-node is-node-3" cx="460" cy="142" r="1.6" />
              </svg>

              {stageSize.width > 0 && connectors.length > 0 && (
                <svg
                  className="iv-intro-streams"
                  viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
                    <filter id="iv-stream-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {connectors.map(({ key, start, end }) => {
                      const color = connectorColors[key];
                      return (
                        <linearGradient
                          key={`stream-grad-${key}`}
                          id={`iv-stream-${key}`}
                          gradientUnits="userSpaceOnUse"
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                        >
                          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
                          <stop offset="35%" stopColor={color} stopOpacity="0.45" />
                          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  {connectors.map((connector) => {
                    const key = connector.key;
                    const isLive = activeSignalId === key;
                    const isPriority = key === 'priorities';
                    const color = connectorColors[key];
                    return (
                      <g key={key} className={`iv-stream-group ${isLive ? 'is-live' : ''} ${isPriority ? 'is-priority' : ''}`}>
                        {/* Ambient Glow Under-rail */}
                        <path
                          d={connector.path}
                          stroke={color}
                          strokeWidth={isLive ? 3.0 : isPriority ? 2.2 : 1.6}
                          strokeLinecap="round"
                          opacity={isLive ? 0.45 : isPriority ? 0.22 : 0.12}
                          filter="url(#iv-stream-glow)"
                        />

                        {/* Primary High-Tech Conduit Path */}
                        <path
                          d={connector.path}
                          stroke={`url(#iv-stream-${key})`}
                          strokeWidth={isLive ? 1.4 : isPriority ? 1.1 : 0.9}
                          strokeLinecap="round"
                          strokeDasharray={isLive ? 'none' : '4 3'}
                          opacity={isLive ? 0.95 : isPriority ? 0.75 : 0.55}
                        />

                        {/* Flowing Laser Photon Packet */}
                        {!reduceMotion && (
                          <g className="iv-stream-photon">
                            <circle r={isLive ? 3.5 : isPriority ? 3.0 : 2.4} fill={color} opacity="0" filter="url(#iv-stream-glow)">
                              <animate
                                attributeName="opacity"
                                values="0;0.95;0.95;0.2;0"
                                keyTimes="0;0.05;0.25;0.3;1"
                                dur={connector.cycleDur}
                                begin={connector.pulseBegin}
                                repeatCount="indefinite"
                              />
                              <animateMotion
                                path={connector.path}
                                dur={connector.cycleDur}
                                begin={connector.pulseBegin}
                                repeatCount="indefinite"
                                keyTimes="0;0.28;1"
                                keyPoints="0;1;1"
                                calcMode="linear"
                              />
                            </circle>
                            <circle r={isLive ? 1.6 : 1.2} fill="#ffffff" opacity="0">
                              <animate
                                attributeName="opacity"
                                values="0;1;1;0;0"
                                keyTimes="0;0.05;0.25;0.28;1"
                                dur={connector.cycleDur}
                                begin={connector.pulseBegin}
                                repeatCount="indefinite"
                              />
                              <animateMotion
                                path={connector.path}
                                dur={connector.cycleDur}
                                begin={connector.pulseBegin}
                                repeatCount="indefinite"
                                keyTimes="0;0.28;1"
                                keyPoints="0;1;1"
                                calcMode="linear"
                              />
                            </circle>
                          </g>
                        )}

                        {/* Orbital Gateway Node (at Core connection point) */}
                        <g className="iv-stream-gateway">
                          <circle cx={connector.end.x} cy={connector.end.y} r={isLive ? 6.5 : 5.0} stroke={color} strokeWidth="0.8" opacity={isLive ? 0.6 : 0.3} />
                          <circle cx={connector.end.x} cy={connector.end.y} r={isLive ? 3.0 : 2.2} fill={color} opacity={isLive ? 0.95 : 0.7} />
                          <circle cx={connector.end.x} cy={connector.end.y} r="1.0" fill="#ffffff" opacity="0.9" />
                        </g>
                      </g>
                    );
                  })}
                </svg>
              )}

              <motion.button
                id="iv-intro-core"
                ref={coreRef}
                type="button"
                className={`iv-intro-core iv-intro-core--interactive${activeSignalId ? ' is-listening' : ''}`}
                tabIndex={isFolding ? -1 : 0}
                onClick={() => onStartBriefing()}
                aria-label={`Núcleo interactivo de FOCUS. Clic para iniciar briefing completo. Estado: ${activeSignal?.label ?? (isStable ? 'Operación estable' : 'Observando la operación')}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: isFolding ? 0 : 1, scale: isFolding ? 0.9 : 1 }}
                transition={{ duration: reduceMotion ? 0.01 : isFolding ? 0.62 : 0.65, delay: reduceMotion ? 0 : isFolding ? 0 : 0.38, ease }}
              >
                <FocusCore size="hero" state={coreState} interactive={!isFolding} variant="particle" markStyle="letter" />
                <div className="iv-intro-core__caption">
                  <span className="iv-intro-core__orbital-badge">
                    <i />
                    <b>{activeSignal ? activeSignal.label.toUpperCase() : 'INICIAR BRIEFING'}</b>
                    <small>· {activeSignal ? '14 FUENTES' : 'CLIC PARA EXPLORAR'}</small>
                  </span>
                </div>
              </motion.button>

              {/* Conexión sutil entre Core y Status Strip */}
              <div className="iv-intro-stage__core-beam" aria-hidden="true" />

              {signalCards.map(({ id, label, value, detail, Icon, position }, index) => {
                const isActive = activeSignalId === id;
                return (
                  <motion.button
                    key={id}
                    ref={(node) => {
                      signalRefs.current[id] = node;
                      if (node) remeasure();
                    }}
                    type="button"
                    className={`iv-intro-signal iv-intro-signal--${id} iv-intro-signal--${position}${isActive ? ' is-active' : ''}`}
                    onClick={() => onStartBriefing()}
                    onMouseEnter={() => !isFolding && setHoveredSignal(id)}
                    onMouseLeave={() => setHoveredSignal(null)}
                    onFocus={() => !isFolding && setHoveredSignal(id)}
                    onBlur={() => setHoveredSignal(null)}
                    tabIndex={isFolding ? -1 : 0}
                    aria-label={`${label}: ${value}. ${detail}. Clic para iniciar briefing.`}
                    initial={reduceMotion ? false : { opacity: 0, x: position.includes('left') ? -18 : 18, y: 10 }}
                    animate={{
                      opacity: isFolding ? 0 : 1,
                      x: isFolding ? (position.includes('left') ? -20 : 20) : 0,
                      y: isFolding ? -10 : 0,
                      scale: isFolding ? 0.94 : 1,
                    }}
                    transition={{
                      duration: reduceMotion ? 0.01 : isFolding ? 0.52 : 0.5,
                      delay: reduceMotion ? 0 : isFolding ? index * 0.05 : 0.54 + index * 0.07,
                      ease,
                    }}
                  >
                    {/* Radiant Neon Underglow & Bottom Rim Flare (Exact Reference Effect) */}
                    <div className="iv-intro-signal__glow" aria-hidden="true" />
                    <div className="iv-intro-signal__rim-light" aria-hidden="true" />

                    {/* Floating Embossed Glass Icon Vessel */}
                    <div className="iv-intro-signal__icon-box" aria-hidden="true">
                      <Icon />
                    </div>

                    <div className="iv-intro-signal__content">
                      <div className="iv-intro-signal__title-row">
                        <h3 className="iv-intro-signal__title">{label}</h3>
                        <span className="iv-intro-signal__num" aria-label={`${value} ${label}`}>{value}</span>
                      </div>
                      <p className="iv-intro-signal__desc">{detail}</p>
                    </div>

                    {/* Dedicated Interface Socket (Connection Anchor Point) */}
                    <div className={`iv-intro-signal__socket iv-intro-signal__socket--${position.includes('left') ? 'right' : 'left'}`} aria-hidden="true">
                      <span className="iv-intro-signal__socket-led" />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Contextual Status Strip (bottom) */}
            <div className="iv-intro-trust-zone">
            <motion.div
              className="iv-intro-trust"
              aria-label="Capa de confianza del sistema"
              {...reveal(0.72, 12)}
            >
              {/* Rotating Laser Border Beam */}
              <div className="iv-intro-trust__beam-layer" aria-hidden="true">
                <div className="iv-intro-trust__beam-rotator" />
              </div>

              {/* Ambient Glow */}
              <div className="iv-intro-trust__ambient-glow" aria-hidden="true" />

              {/* Inner Content Grid */}
              <div className="iv-intro-trust__body">
                <button
                  type="button"
                  className="iv-intro-trust__person iv-intro-trust__person--interactive"
                  onClick={() => onStartBriefing()}
                  aria-label={`Iniciar briefing preparado para ${briefing.userName}`}
                >
                  <span className="iv-intro-trust__avatars" aria-hidden="true">
                    <i>A</i>
                    <i>V</i>
                    <i>S</i>
                  </span>
                  <p>
                    <strong>Briefing preparado</strong>
                    <small>para {briefing.userName}</small>
                  </p>
                </button>

                <div className="iv-intro-trust__metric iv-intro-trust__metric--tooltip">
                  <strong className="is-cyan">100%</strong>
                  <small>Operación analizada</small>
                  <div className="iv-intro-trust__popover" role="tooltip">
                    <span>Análisis completo de infraestructura, servicios y señales operativas.</span>
                  </div>
                </div>

                <div className="iv-intro-trust__metric iv-intro-trust__metric--tooltip">
                  <strong className="is-white">{briefing.detectedCount}</strong>
                  <small>Señales clave</small>
                  <div className="iv-intro-trust__popover" role="tooltip">
                    <span>{briefing.dimensions.prioritiesCount} prioridades, {briefing.dimensions.changesCount} cambios y {briefing.dimensions.anomaliesCount} anomalías detectadas.</span>
                  </div>
                </div>

                <div className="iv-intro-trust__metric iv-intro-trust__metric--tooltip">
                  <strong className="is-white">14</strong>
                  <small>Fuentes conectadas</small>
                  <div className="iv-intro-trust__popover iv-intro-trust__popover--sources" role="tooltip">
                    <span className="iv-intro-trust__popover-heading">Fuentes operativas conectadas</span>
                    <div className="iv-intro-trust__sources-grid">
                      <span>AWS</span>
                      <span>Datadog</span>
                      <span>Jira</span>
                      <span>GitHub</span>
                      <span>Slack</span>
                      <span>PagerDuty</span>
                      <span>Sentry</span>
                      <span>Linear</span>
                      <span>Notion</span>
                      <span>Kubernetes</span>
                      <span>Postgres</span>
                      <span>Stripe</span>
                      <span>Cloudflare</span>
                      <span>Redis</span>
                    </div>
                  </div>
                </div>

                <div className="iv-intro-trust__metric">
                  <strong className="is-live">24/7</strong>
                  <small>Monitoreo activo</small>
                </div>

                {/* Ultra-Premium Contexto Listo Button */}
                <button
                  type="button"
                  className="iv-intro-trust__ready iv-intro-trust__ready--premium"
                  onClick={() => onStartBriefing()}
                  aria-label="Iniciar briefing, contexto listo"
                >
                  <span className="iv-intro-trust__ready-shimmer" aria-hidden="true" />
                  <span className="iv-intro-trust__ready-icon" aria-hidden="true">
                    <Check />
                  </span>
                  <span className="iv-intro-trust__ready-text">Contexto listo</span>
                  <ArrowRight className="iv-intro-trust__ready-arrow" aria-hidden="true" />
                </button>
              </div>
            </motion.div>

            <motion.div className="iv-intro__footer-note" {...reveal(0.82, 8)}>
              <Sparkles aria-hidden="true" />
              <span>Al completar el briefing se habilitan Ask, modo investigación y análisis detallado</span>
            </motion.div>
            </div>
          </div>

          {showBriefing ? (
            <IntroScrollContext.Provider value={scrollRef}>
              <div className="iv-journey focus-narrative" aria-label="Briefing guiado de FOCUS">
                <BriefingJourneyAmbient
                  scrollRoot={scrollRef.current}
                  enabled={briefingActiveStep <= 2}
                />
                <section
                  id="briefing-panorama-gate"
                  className="iv-scene iv-panorama"
                  data-chapter="panorama"
                >
                  <motion.div
                    className="iv-shell iv-panorama__layout"
                    variants={panoramaSectionVariants}
                    initial={false}
                    animate="visible"
                  >
                    <div className="iv-panorama__main">
                      <div className="iv-panorama__intro">
                        <motion.div
                          className="iv-scene-label is-light"
                          variants={panoramaFadeLeft}
                        >
                          <span>00 / 07</span>
                          <i />
                          <strong>Panorama general</strong>
                        </motion.div>

                        <motion.div
                          className="iv-panorama__headline"
                          variants={panoramaFadeUp}
                        >
                          <h2>
                            FOCUS redujo tu operación<br />
                            a <span>cuatro señales claras.</span>
                          </h2>
                          <p className="iv-panorama__lede">{briefing.summarySentence}</p>
                        </motion.div>

                        <motion.div
                          className="iv-panorama__actions"
                          variants={panoramaFadeUp}
                        >
                          <div className="iv-panorama__meta">
                            <span><Check aria-hidden="true" /><strong>100%</strong> analizada</span>
                            <span><Clock3 aria-hidden="true" /><strong>{briefing.estimatedReadTime}</strong></span>
                          </div>
                        </motion.div>

                        <motion.button
                          type="button"
                          className="iv-panorama__scroll-cue"
                          onClick={() => scrollToBriefingChapter('transition-panorama-to-priority')}
                          variants={panoramaFadeUp}
                          aria-label="Desliza para explorar el briefing"
                        >
                          <span>Desliza para explorar</span>
                          <ChevronDown aria-hidden="true" />
                        </motion.button>
                      </div>

                      <div className="iv-panorama__grid" role="list">
                        {panoramaCards.map(({ id, label, value, detail, Icon, emphasis }, index) => (
                          <motion.article
                            key={id}
                            className={`iv-panorama-card iv-panorama-card--${id}${emphasis ? ' is-emphasis' : ''}`}
                            role="listitem"
                            aria-label={`${label}: ${value}. ${detail}`}
                            custom={index}
                            variants={panoramaCardVariants}
                            initial={false}
                            animate="visible"
                          >
                            <div className="iv-panorama-card__glow" aria-hidden="true" />
                            <div className="iv-panorama-card__orb" aria-hidden="true" />
                            <div className="iv-panorama-card__top">
                              <span className="iv-panorama-card__icon"><Icon aria-hidden="true" /></span>
                              <div className="iv-panorama-card__title-group">
                                <h3>{label}</h3>
                                <span className="iv-panorama-card__num">{value}</span>
                              </div>
                            </div>
                            <p className="iv-panorama-card__detail">{detail}</p>
                          </motion.article>
                        ))}
                      </div>
                    </div>

                    <motion.aside
                      className="iv-panorama__stage"
                      variants={panoramaFadeRight}
                      aria-hidden="true"
                    >
                      <div className="iv-panorama__stage-glow" />
                      <div className={`iv-panorama__stage-frame${reduceMotion ? '' : ' is-video'}`}>
                        {reduceMotion ? (
                          <img src={focusObservatory} alt="FOCUS Observatory 3D Portal" />
                        ) : (
                          <AmbientVideo
                            className="iv-panorama__stage-media"
                            src={focusObservatoryLoop}
                            poster={focusObservatory}
                          />
                        )}
                      </div>
                      <motion.span
                        className="iv-panorama__live"
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.45, ease: EASE_OUT_SOFT }}
                      >
                        <i /> FOCUS / LIVE
                      </motion.span>
                    </motion.aside>
                  </motion.div>
                </section>
                {children}
              </div>
            </IntroScrollContext.Provider>
          ) : null}
        </div>
      </div>
    </section>
  );
};
