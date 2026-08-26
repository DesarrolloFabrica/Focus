import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  Database,
  Layers3,
  Radar,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import focusObservatory from '../../assets/focus-observatory.png';
import { FocusBriefing, FocusCoreState } from '../../types/focus';
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
  onOpenDemo?: () => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
}

const ease = [0.16, 1, 0.3, 1] as const;

const SIGNAL_CYCLE: SignalConnectorKey[] = ['priorities', 'changes', 'anomalies', 'stable'];

const connectorColors: Record<SignalConnectorKey, string> = {
  priorities: '#e85a6a',
  changes: '#3bc4ef',
  anomalies: '#a86ae8',
  stable: '#2dd4a8',
};

export const ArrivalSection: React.FC<ArrivalSectionProps> = ({
  briefing,
  onStartBriefing,
  isStartingTransition = false,
  isBriefingActive = false,
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
  const panoramaCtaLabel = isStable ? 'Ver qué cambió' : 'Ver lo prioritario';

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
    animate: { opacity: isFolding ? 0 : 1, y: isFolding ? -12 : 0 },
    transition: { duration: reduceMotion ? 0.01 : 0.55, delay: reduceMotion ? 0 : delay, ease },
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

  return (
    <section
      ref={sectionRef}
      id="focus-arrival-view"
      className={`iv-cover iv-intro${isStartingTransition ? ' is-departing' : ''}${showBriefing ? ' is-briefing' : ''}`}
      data-chapter={showBriefing ? undefined : 'panorama'}
    >
      <div className="iv-intro__ambient" aria-hidden="true"><i /><i /><i /></div>
      <ArrivalCursorField targetRef={sectionRef} className="iv-intro__cursor-field" />

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

            <div className="iv-intro-nav__links" aria-hidden="true">
              <span className="is-active">Inicio</span>
              <span>Briefing</span>
              <span>Señales</span>
              <span>Contexto</span>
            </div>

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
                onClick={onStartBriefing}
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
            className={`iv-intro__hero${isFolding ? ' is-collapsed' : ''}`}
            data-chapter={showBriefing ? undefined : 'panorama'}
            aria-hidden={isFolding}
          >
            <div className="iv-intro__hero-copy">
              <motion.div className="iv-intro__eyebrow" {...reveal(0.18, 8)}>
                <span />
                {briefing.greeting}
              </motion.div>
              <motion.h1
                {...reveal(0.28, 18)}
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
              <motion.p {...reveal(0.38, 12)}>
                {briefing.summarySentence}
              </motion.p>
            </div>

            <div ref={stageRef} className="iv-intro-stage">
              <div className="iv-intro-stage__glow" aria-hidden="true" />

              <svg className="iv-intro-stage__orbits" viewBox="0 0 920 470" aria-hidden="true">
                <ellipse className="is-a" cx="460" cy="258" rx="262" ry="105" />
                <ellipse className="is-b" cx="460" cy="258" rx="300" ry="125" transform="rotate(-10 460 258)" />
                <ellipse className="is-c" cx="460" cy="258" rx="222" ry="188" transform="rotate(28 460 258)" />
                <path className="is-stream" d="M92 286 C240 226 302 244 361 258" />
                <path className="is-stream" d="M828 286 C680 226 618 244 559 258" />
                <circle className="is-node" cx="198" cy="248" r="2.2" />
                <circle className="is-node" cx="722" cy="248" r="2.2" />
                <circle className="is-node" cx="460" cy="148" r="1.8" />
              </svg>

              {stageSize.width > 0 && connectors.length > 0 && (
                <svg
                  className="iv-intro-streams"
                  viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
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
                          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
                          <stop offset="55%" stopColor={color} stopOpacity="0.28" />
                          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  {connectors.map((connector) => {
                    const key = connector.key;
                    const isLive = activeSignalId === key;
                    const color = connectorColors[key];
                    return (
                      <g key={key} className={isLive ? 'is-live' : ''}>
                        <path
                          d={connector.path}
                          stroke={isLive ? color : `url(#iv-stream-${key})`}
                          strokeWidth={isLive ? 1.25 : 0.9}
                          strokeLinecap="round"
                          opacity={isLive ? 0.95 : 0.72}
                        />
                        {!reduceMotion && (
                          <circle r={isLive ? 2.8 : 2.2} fill={color} opacity="0">
                            <animate
                              attributeName="opacity"
                              values="0;0.95;0.95;0;0"
                              keyTimes="0;0.04;0.2;0.24;1"
                              dur={connector.cycleDur}
                              begin={connector.pulseBegin}
                              repeatCount="indefinite"
                            />
                            <animateMotion
                              path={connector.path}
                              dur={connector.cycleDur}
                              begin={connector.pulseBegin}
                              repeatCount="indefinite"
                              keyTimes="0;0.22;1"
                              keyPoints="0;1;1"
                              calcMode="linear"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}

              <motion.div
                id="iv-intro-core"
                ref={coreRef}
                className={`iv-intro-core${activeSignalId ? ' is-listening' : ''}`}
                tabIndex={isFolding ? -1 : 0}
                aria-label={`Núcleo interactivo de FOCUS. Estado: ${activeSignal?.label ?? (isStable ? 'Operación estable' : 'Observando la operación')}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: isFolding ? 0 : 1, scale: isFolding ? 0.86 : 1 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.65, delay: reduceMotion ? 0 : 0.42, ease }}
              >
                <FocusCore size="hero" state={coreState} interactive={!isFolding} variant="particle" markStyle="letter" />
                <div className="iv-intro-core__caption">
                  <span><i /> Analizando en vivo</span>
                  <strong>{activeSignal ? activeSignal.label : 'FOCUS CORE'}</strong>
                </div>
              </motion.div>

              {signalCards.map(({ id, label, value, detail, Icon, position }, index) => {
                const isActive = activeSignalId === id;
                return (
                  <motion.article
                    key={id}
                    ref={(node) => {
                      signalRefs.current[id] = node;
                      if (node) remeasure();
                    }}
                    className={`iv-intro-signal iv-intro-signal--${position}${isActive ? ' is-active' : ''}`}
                    onMouseEnter={() => !isFolding && setHoveredSignal(id)}
                    onMouseLeave={() => setHoveredSignal(null)}
                    onFocus={() => !isFolding && setHoveredSignal(id)}
                    onBlur={() => setHoveredSignal(null)}
                    tabIndex={isFolding ? -1 : 0}
                    initial={reduceMotion ? false : { opacity: 0, x: position.includes('left') ? -18 : 18, y: 10 }}
                    animate={{ opacity: isFolding ? 0 : 1, x: 0, y: isFolding ? 12 : 0 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.55, delay: reduceMotion ? 0 : 0.56 + index * 0.08, ease }}
                  >
                    <div className="iv-intro-signal__top">
                      <span className="iv-intro-signal__icon" aria-hidden="true"><Icon /></span>
                      <span className="iv-intro-signal__label">{label}</span>
                    </div>
                    <div className="iv-intro-signal__metric" aria-label={`${value} ${label}`}>{value}</div>
                    <p className="iv-intro-signal__detail">{detail}</p>
                  </motion.article>
                );
              })}
            </div>

            <motion.div className="iv-intro-trust" {...reveal(0.82, 16)}>
              <div className="iv-intro-trust__person">
                <span className="iv-intro-trust__avatars" aria-hidden="true"><i>A</i><i>V</i><i>S</i></span>
                <p><strong>Briefing preparado</strong><small>para {briefing.userName}</small></p>
              </div>
              <div className="iv-intro-trust__metric"><strong>100%</strong><small>Operación analizada</small></div>
              <div className="iv-intro-trust__metric"><strong>{briefing.detectedCount}</strong><small>Señales clave</small></div>
              <div className="iv-intro-trust__metric"><strong>14</strong><small>Fuentes conectadas</small></div>
              <div className="iv-intro-trust__metric"><strong className="is-live">24/7</strong><small>Monitoreo activo</small></div>
              <span className="iv-intro-trust__ready"><Check aria-hidden="true" /> Contexto listo</span>
            </motion.div>

            <motion.div className="iv-intro__cta-meta" {...reveal(0.9, 8)}>
              <i />
              <span>{briefing.estimatedReadTime} · lectura guiada</span>
            </motion.div>
          </div>

          {showBriefing ? (
            <IntroScrollContext.Provider value={scrollRef}>
              <div className="iv-journey focus-narrative" aria-label="Briefing guiado de FOCUS">
                <BriefingJourneyAmbient />
                <section
                  id="briefing-panorama-gate"
                  className="iv-scene iv-panorama"
                  data-chapter="panorama"
                >
                  <div className="iv-shell iv-panorama__layout">
                    <div className="iv-panorama__main">
                      <div className="iv-panorama__intro">
                        <div className="iv-scene-label is-light">
                          <span>00 / 07</span>
                          <i />
                          <strong>Panorama general</strong>
                        </div>

                        <motion.div
                          className="iv-panorama__headline"
                          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.75, ease }}
                        >
                          <h2>
                            FOCUS redujo tu operación<br />
                            a <span>cuatro señales claras.</span>
                          </h2>
                          <p className="iv-panorama__lede">{briefing.summarySentence}</p>
                        </motion.div>

                        <div className="iv-panorama__actions">
                          <button
                            type="button"
                            className="iv-continue is-light"
                            onClick={() => scrollToBriefingChapter('section-chapter-priority')}
                          >
                            <span>{panoramaCtaLabel}</span>
                            <ArrowRight aria-hidden="true" />
                          </button>
                          <div className="iv-panorama__meta">
                            <span><Check aria-hidden="true" /><strong>100%</strong> analizada</span>
                            <span><Clock3 aria-hidden="true" /><strong>{briefing.estimatedReadTime}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="iv-panorama__grid" role="list">
                        {panoramaCards.map(({ id, label, value, detail, Icon, emphasis }, index) => (
                          <motion.article
                            key={id}
                            className={`iv-panorama-card${emphasis ? ' is-emphasis' : ''}`}
                            role="listitem"
                            aria-label={`${label}: ${value}. ${detail}`}
                            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.55, delay: index * 0.06, ease }}
                          >
                            <div className="iv-panorama-card__orb" aria-hidden="true" />
                            <div className="iv-panorama-card__top">
                              <span className="iv-panorama-card__icon"><Icon aria-hidden="true" /></span>
                              <h3>{label}</h3>
                            </div>
                            <p className="iv-panorama-card__detail">{detail}</p>
                          </motion.article>
                        ))}
                      </div>
                    </div>

                    <motion.aside
                      className="iv-panorama__stage"
                      initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 0.98 }}
                      whileInView={{ opacity: 1, x: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.9, ease }}
                      aria-hidden="true"
                    >
                      <div className="iv-panorama__stage-glow" />
                      <div className="iv-panorama__stage-frame">
                        <img src={focusObservatory} alt="" />
                      </div>
                      <span className="iv-panorama__live"><i /> FOCUS / LIVE</span>
                    </motion.aside>
                  </div>
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
