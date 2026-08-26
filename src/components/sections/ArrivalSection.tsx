import React, { ComponentType, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import { FocusBriefing, FocusCoreState } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';
import { ArrivalCursorField } from '../effects/ArrivalCursorField';
import { SignalConnectorKey, useSignalConnectors } from '../../hooks/useSignalConnectors';

type SignalKey = SignalConnectorKey;

interface ArrivalSectionProps {
  briefing: FocusBriefing;
  onStartBriefing: () => void;
  isStartingTransition?: boolean;
}

interface SignalDefinition {
  key: SignalKey;
  label: string;
  count: number;
  summary: string;
  color: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

const connectorColors: Record<SignalKey, string> = {
  priorities: '#e85a6a',
  changes: '#3bc4ef',
  anomalies: '#a86ae8',
  stable: '#2dd4a8',
};

const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const ArrivalSection: React.FC<ArrivalSectionProps> = ({
  briefing,
  onStartBriefing,
  isStartingTransition = false,
}) => {
  const [hoveredNode, setHoveredNode] = useState<SignalKey | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isStableScenario = briefing.scenario === 'stable';
  const reduce = !!shouldReduceMotion;

  const stageRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const arrivalRef = useRef<HTMLElement>(null);
  const signalRefs = useRef<Record<SignalKey, HTMLElement | null>>({
    priorities: null,
    changes: null,
    anomalies: null,
    stable: null,
  });

  const { connectors, stageSize, remeasure } = useSignalConnectors(
    stageRef,
    coreRef,
    signalRefs,
    !reduce,
  );

  const sentenceBreak = briefing.summarySentence.indexOf('.');
  const summaryLead = sentenceBreak >= 0
    ? briefing.summarySentence.slice(0, sentenceBreak + 1)
    : briefing.summarySentence;
  const summaryRest = sentenceBreak >= 0
    ? briefing.summarySentence.slice(sentenceBreak + 1).trim()
    : '';

  const readMeta = `${briefing.estimatedReadTime} · lectura guiada`;

  const signals: SignalDefinition[] = [
    {
      key: 'priorities',
      label: 'Prioridades',
      count: briefing.dimensions.prioritiesCount,
      summary: briefing.dimensions.prioritiesSummary,
      color: connectorColors.priorities,
      Icon: AlertCircle,
    },
    {
      key: 'changes',
      label: 'Qué cambió',
      count: briefing.dimensions.changesCount,
      summary: briefing.dimensions.changesSummary,
      color: connectorColors.changes,
      Icon: TrendingUp,
    },
    {
      key: 'anomalies',
      label: 'Fuera de lo habitual',
      count: briefing.dimensions.anomaliesCount,
      summary: briefing.dimensions.anomaliesSummary,
      color: connectorColors.anomalies,
      Icon: Activity,
    },
    {
      key: 'stable',
      label: 'Todo lo demás',
      count: briefing.dimensions.stableCount,
      summary: briefing.dimensions.stableSummary,
      color: connectorColors.stable,
      Icon: Check,
    },
  ];

  const getCoreState = (): FocusCoreState => {
    if (isStartingTransition) return 'critical';
    if (hoveredNode === 'priorities') return 'critical';
    if (hoveredNode === 'changes') return 'change';
    if (hoveredNode === 'anomalies') return 'anomaly';
    if (hoveredNode === 'stable') return 'stable';
    if (briefing.scenario === 'stable') return 'stable';
    if (briefing.scenario === 'high_activity') return 'critical';
    return 'attention';
  };

  const fade = (delay: number, y = 10) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y },
    animate: {
      opacity: isStartingTransition ? 0 : 1,
      y: isStartingTransition ? (reduce ? 0 : 6) : 0,
    },
    transition: {
      duration: reduce ? 0.12 : isStartingTransition ? 0.35 : 0.55,
      delay: reduce || isStartingTransition ? 0 : delay,
      ease: easeOut,
    },
  });

  return (
    <section
      ref={arrivalRef}
      id="focus-arrival-view"
      className={`focus-arrival relative w-full overflow-hidden px-5 sm:px-10 lg:px-14 ${isStartingTransition ? 'is-departing' : ''}`}
    >
      <div className="focus-arrival__atmosphere pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="focus-arrival__stars pointer-events-none absolute inset-0" aria-hidden="true" />
      <ArrivalCursorField targetRef={arrivalRef} />
      <motion.div
        className="focus-arrival__analysis-transition pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: isStartingTransition ? 1 : 0 }}
        transition={{ duration: reduce ? 0.12 : 0.7, ease: easeOut }}
        aria-hidden="true"
      />
      <svg className="focus-arrival__orbits pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1280 780" aria-hidden="true">
        <ellipse cx="640" cy="390" rx="470" ry="310" />
        <ellipse cx="640" cy="390" rx="370" ry="246" />
        <ellipse cx="640" cy="390" rx="270" ry="180" />
      </svg>

      <div className="focus-arrival__shell relative z-10 mx-auto w-full max-w-[1480px]">
        <div className="focus-arrival__intro mx-auto w-full max-w-5xl text-center">
          <motion.div
            className="focus-arrival__greeting inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.19em] text-sky-400 sm:text-[11px]"
            {...fade(0.35, 8)}
          >
            <span className="focus-processing-dots" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
            </span>
            <span>{briefing.greeting}</span>
          </motion.div>

          <motion.h1
            className="focus-arrival__headline font-['Segoe_UI',sans-serif] font-[480] tracking-[-0.045em]"
            aria-label={
              isStableScenario
                ? 'Revisé tu operación completa. Todo está bajo control.'
                : 'Revisé tu operación completa. Esto es lo que importa hoy.'
            }
          >
            {isStableScenario ? (
              <>
                <motion.span className="block text-slate-400" {...fade(0.5, 12)}>
                  Revisé tu operación completa.
                </motion.span>
                <motion.span className="mt-0.5 block text-white" {...fade(0.65, 12)}>
                  Todo está <span className="focus-arrival__stable-word">bajo control.</span>
                </motion.span>
              </>
            ) : (
              <>
                <motion.span className="block text-slate-400" {...fade(0.5, 12)}>
                  Revisé tu operación completa.
                </motion.span>
                <motion.span className="mt-0.5 block text-white" {...fade(0.65, 12)}>
                  Esto es lo que <span className="focus-arrival__gradient-word">importa</span> hoy.
                </motion.span>
              </>
            )}
          </motion.h1>

          <motion.p className="focus-arrival__summary mx-auto max-w-2xl font-light text-slate-400" {...fade(0.8, 10)}>
            <span className="block">{summaryLead}</span>
            {summaryRest && <span className="block">{summaryRest}</span>}
          </motion.p>
        </div>

        <div ref={stageRef} className="focus-orbit-stage relative w-full">
          <motion.div
            className="focus-orbit-stage__glow pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{
              opacity: isStartingTransition ? 0.55 : 1,
              scale: isStartingTransition ? 0.88 : 1,
            }}
            transition={{ duration: reduce ? 0.12 : isStartingTransition ? 0.45 : 0.7, delay: reduce || isStartingTransition ? 0 : 0.9, ease: easeOut }}
            aria-hidden="true"
          />

          {stageSize.width > 0 && connectors.length > 0 && (
            <svg
              className="focus-signal-connectors pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
              viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
              fill="none"
              aria-hidden="true"
            >
              <defs>
                {connectors.map(({ key, start, end }) => {
                  const c = connectorColors[key];
                  return (
                    <linearGradient
                      key={`grad-${key}`}
                      id={`focus-stream-${key}`}
                      gradientUnits="userSpaceOnUse"
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                    >
                      <stop offset="0%" stopColor={c} stopOpacity="0.14" />
                      <stop offset="55%" stopColor={c} stopOpacity="0.24" />
                      <stop offset="100%" stopColor={c} stopOpacity="0.42" />
                    </linearGradient>
                  );
                })}
              </defs>

              {connectors.map((connector, index) => {
                const key = connector.key;
                const isActive = hoveredNode === key;
                const color = connectorColors[key];
                return (
                  <g key={key} className={isActive ? 'is-active' : ''}>
                    <motion.path
                      d={connector.path}
                      stroke={isActive ? color : `url(#focus-stream-${key})`}
                      strokeWidth={isActive ? 1.15 : 0.85}
                      strokeLinecap="round"
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: isStartingTransition ? 0 : 1,
                        opacity: isStartingTransition ? 0 : isActive ? 0.95 : 0.78,
                      }}
                      transition={{
                        duration: reduce ? 0.12 : isStartingTransition ? 0.4 : 0.7,
                        delay: reduce || isStartingTransition ? 0 : 1.5 + index * 0.05,
                        ease: easeOut,
                      }}
                    />
                    <motion.circle
                      cx={connector.start.x}
                      cy={connector.start.y}
                      r={isActive ? 3 : 2.4}
                      fill={color}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: isStartingTransition ? 0 : isActive ? 0.95 : 0.5 }}
                      transition={{ delay: reduce || isStartingTransition ? 0 : 1.55 + index * 0.05, duration: 0.4 }}
                    />
                    <motion.circle
                      cx={connector.end.x}
                      cy={connector.end.y}
                      r={isActive ? 3.6 : 2.8}
                      fill={color}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: isStartingTransition ? 0 : isActive ? 1 : 0.75 }}
                      transition={{ delay: reduce || isStartingTransition ? 0 : 1.55 + index * 0.05, duration: 0.4 }}
                      style={isActive ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined}
                    />
                    {!reduce && (
                      <circle r="2.4" fill={color} opacity="0">
                        <animate
                          attributeName="opacity"
                          values="0;0.9;0.9;0;0"
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

          <div ref={coreRef} className="focus-orbit-stage__core">
            <motion.div
              className="z-10 cursor-pointer"
              initial={reduce ? false : { opacity: 0, scale: 0.82 }}
              animate={{
                opacity: isStartingTransition ? 0.42 : 1,
                scale: isStartingTransition ? 0.74 : 1,
                y: isStartingTransition ? 28 : 0,
                filter: isStartingTransition ? 'saturate(1.35) blur(1px)' : 'saturate(1) blur(0px)',
              }}
              transition={{
                duration: reduce ? 0.12 : isStartingTransition ? 0.82 : 0.75,
                delay: reduce || isStartingTransition ? 0 : 1.0,
                ease: easeOut,
              }}
              onClick={() => !isStartingTransition && onStartBriefing()}
              role="button"
              tabIndex={0}
              aria-label="Comenzar briefing desde el núcleo FOCUS"
              onKeyDown={(event) => {
                if (!isStartingTransition && (event.key === 'Enter' || event.key === ' ')) onStartBriefing();
              }}
            >
              <FocusCore size="hero" state={getCoreState()} variant="particle" markStyle="letter" />
            </motion.div>
          </div>

          <div className="focus-signal-list relative z-20">
            {signals.map(({ key, label, count, summary, color, Icon }, index) => (
              <motion.div
                key={key}
                id={`node-${key}`}
                ref={(node) => {
                  signalRefs.current[key] = node;
                  if (node) remeasure();
                }}
                className={`focus-signal focus-signal--${key} group ${hoveredNode === key ? 'is-active' : ''}`}
                style={{ '--signal-color': color } as React.CSSProperties}
                onMouseEnter={() => setHoveredNode(key)}
                onMouseLeave={() => setHoveredNode(null)}
                {...fade(1.6 + index * 0.08, 0)}
              >
                <span className="focus-signal__icon" aria-hidden="true">
                  <Icon className="focus-signal__glyph" strokeWidth={1.8} />
                </span>
                <span className="focus-signal__copy">
                  <span className="focus-signal__heading">
                    <span>{label}</span>
                    <span className="focus-signal__count">{count}</span>
                  </span>
                  <span className="focus-signal__summary">{summary}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div className="focus-arrival__cta relative z-20 flex flex-col items-center text-center" {...fade(1.9, 10)}>
          <button id="btn-start-briefing" type="button" onClick={onStartBriefing} disabled={isStartingTransition} className="focus-primary-cta group">
            <span>{isStableScenario ? 'Verificar estado' : 'Comenzar briefing'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300" />
          </button>
          <motion.span className="focus-arrival__cta-meta" {...fade(1.95, 6)}>
            {readMeta}
          </motion.span>
          <motion.span
            className="focus-scroll-cue flex flex-col items-center text-sky-400/70"
            aria-hidden="true"
            {...fade(2.0, 4)}
          >
            <span className="mb-0.5 tracking-[0.28em] text-[9px] opacity-70">•••••</span>
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
};
