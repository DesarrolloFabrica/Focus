import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Check,
  Database,
  Layers3,
  Radar,
  Settings2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FocusBriefing, FocusCoreState } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';
import { IntroScrollContext } from './ImmersiveJourney';

interface ImmersiveLandingProps {
  briefing: FocusBriefing;
  isStarting: boolean;
  isCollapsed?: boolean;
  onStart: () => void;
  onOpenDemo: () => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
}

const ease = [0.16, 1, 0.3, 1] as const;

export const ImmersiveLanding: React.FC<ImmersiveLandingProps> = ({
  briefing,
  isStarting,
  isCollapsed = false,
  onStart,
  onOpenDemo,
  header,
  children,
}) => {
  const reduceMotion = !!useReducedMotion();
  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isStable = briefing.scenario === 'stable';
  const isFolding = isStarting || isCollapsed;
  const showBriefing = Boolean(children);

  const signalCards: Array<{
    id: string;
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
      label: 'Cambios',
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
      id: 'coverage',
      label: 'Cobertura',
      value: briefing.dimensions.stableCount,
      detail: briefing.dimensions.stableSummary,
      Icon: ShieldCheck,
      position: 'bottom-right',
      coreState: 'stable',
    },
  ];

  const activeSignal = signalCards.find((signal) => signal.id === hoveredSignal);
  const coreState: FocusCoreState = activeSignal?.coreState ?? (isStable ? 'stable' : 'observing');

  const reveal = (delay: number, y = 14) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: { opacity: isFolding ? 0 : 1, y: isFolding ? -12 : 0 },
    transition: { duration: reduceMotion ? 0.01 : 0.55, delay: reduceMotion ? 0 : delay, ease },
  });

  useEffect(() => {
    if (!isCollapsed || !showBriefing) return;

    const timer = window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }, reduceMotion ? 40 : 320);

    return () => window.clearTimeout(timer);
  }, [isCollapsed, showBriefing, reduceMotion]);

  useEffect(() => {
    if (isCollapsed) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [isCollapsed, reduceMotion]);

  return (
    <section
      id="focus-arrival-view"
      className={`iv-cover iv-intro${isStarting ? ' is-departing' : ''}${showBriefing ? ' is-briefing' : ''}`}
    >
      <div className="iv-intro__ambient" aria-hidden="true"><i /><i /><i /></div>

      <div className="iv-intro__frame">
        {showBriefing ? (
          header
        ) : (
          <nav className="iv-intro-nav" aria-label="Navegación de introducción">
            <button type="button" className="iv-intro-brand" aria-label="FOCUS, inicio">
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
              <button
                type="button"
                className="iv-intro-nav__tool"
                onClick={onOpenDemo}
                aria-label="Abrir escenarios de demostración"
                title="Escenario y perspectiva"
              >
                <Settings2 aria-hidden="true" />
              </button>
              <button
                id="btn-start-briefing"
                type="button"
                className="iv-intro-nav__cta"
                onClick={onStart}
                disabled={isStarting || isCollapsed}
              >
                <span>{isStarting ? 'Abriendo briefing' : 'Iniciar briefing'}</span>
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
            className={`iv-intro__hero${isFolding ? ' is-collapsed' : ''}`}
            aria-hidden={isFolding}
          >
            <div className="iv-intro__hero-copy">
              <motion.div className="iv-intro__eyebrow" {...reveal(0.14, 8)}>
                <span />
                {briefing.greeting} · Briefing inteligente
              </motion.div>
              <motion.h1 {...reveal(0.22, 18)}>
                Toda tu operación, convertida<br />
                en <span>una señal clara.</span>
              </motion.h1>
              <motion.p {...reveal(0.3, 12)}>
                FOCUS analiza el estado completo de tu plataforma y organiza lo que merece tu atención en un recorrido breve y contextual.
              </motion.p>
            </div>

            <div className="iv-intro-stage">
              <svg className="iv-intro-stage__orbits" viewBox="0 0 920 470" aria-hidden="true">
                <ellipse cx="460" cy="258" rx="262" ry="105" />
                <ellipse cx="460" cy="258" rx="300" ry="125" transform="rotate(-10 460 258)" />
                <ellipse cx="460" cy="258" rx="222" ry="188" transform="rotate(28 460 258)" />
                <path d="M92 286 C240 226 302 244 361 258" />
                <path d="M828 286 C680 226 618 244 559 258" />
              </svg>

              <motion.div
                id="iv-intro-core"
                className="iv-intro-core"
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

              {signalCards.map(({ id, label, value, detail, Icon, position }, index) => (
                <motion.article
                  key={id}
                  className={`iv-intro-signal iv-intro-signal--${position} ${hoveredSignal === id ? 'is-active' : ''}`}
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
                    <span className="iv-intro-signal__icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="iv-intro-signal__label">{label}</span>
                  </div>
                  <div className="iv-intro-signal__metric" aria-label={`${value} ${label}`}>
                    {value}
                  </div>
                  <p className="iv-intro-signal__detail">{detail}</p>
                </motion.article>
              ))}
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

            <div className="iv-intro__footer-note">
              <Sparkles aria-hidden="true" /> Ask y el detalle se habilitan al completar el briefing.
            </div>
          </div>

          {children ? (
            <IntroScrollContext.Provider value={scrollRef}>
              {children}
            </IntroScrollContext.Provider>
          ) : null}
        </div>
      </div>
    </section>
  );
};
