import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Play, Target } from 'lucide-react';
import { FocusPriority } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';
import { FocusCore } from '../core/FocusCore';

interface WhyItMattersSectionProps {
  priority: FocusPriority;
  onBack?: () => void;
  onContinue?: () => void;
}

const signalPaths = [
  'M390 86 C390 150 370 196 390 272',
  'M112 330 C190 330 250 307 326 330',
  'M668 330 C590 330 530 353 454 330',
  'M390 574 C390 510 410 464 390 388',
];

const streamColors = ['#2688ff', '#ec4d9b', '#9b6cff', '#14c8ec'];

const streamParticles = [
  [378, 116, 0], [401, 142, 0], [369, 176, 0], [408, 208, 0], [382, 242, 0], [397, 270, 0],
  [132, 317, 1], [166, 342, 1], [203, 322, 1], [238, 347, 1], [275, 319, 1], [310, 339, 1],
  [648, 318, 2], [615, 345, 2], [579, 321, 2], [542, 344, 2], [505, 318, 2], [470, 338, 2],
  [377, 548, 3], [402, 520, 3], [371, 487, 3], [409, 454, 3], [381, 423, 3], [400, 395, 3],
] as const;

export const WhyItMattersSection: React.FC<WhyItMattersSectionProps> = ({ priority, onBack, onContinue }) => {
  const reduce = !!useReducedMotion();
  const [isCombined, setIsCombined] = useState(false);
  const persistenceMatch = priority.explanation.persistence.match(/^([\d.,]+)\s*(.*)$/);
  const reasons = priority.reasons.slice(0, 4);
  const signals = [
    {
      position: 'impact',
      number: reasons[0]?.number ?? '01',
      label: reasons[0]?.label ?? 'Impacto',
      value: String(priority.affectedCount),
      detail: priority.affectedUnit,
    },
    {
      position: 'deterioration',
      number: reasons[1]?.number ?? '02',
      label: reasons[1]?.label ?? 'Deterioro',
      value: `${priority.deltaPercentage > 0 ? '+' : ''}${priority.deltaPercentage}%`,
      detail: 'frente al comportamiento habitual',
    },
    {
      position: 'persistence',
      number: reasons[2]?.number ?? '03',
      label: 'Persistencia',
      value: persistenceMatch?.[1] ?? priority.explanation.persistence,
      detail: persistenceMatch?.[2] || 'periodo continuo',
    },
    {
      position: 'relevance',
      number: reasons[3]?.number ?? '04',
      label: 'Relevancia',
      value: priority.explanation.relevance,
      detail: 'relación directa con lo que supervisas',
    },
  ];

  return (
    <section id="section-chapter-why" className="briefing-chapter briefing-chapter--lens">
      <div className="briefing-chapter__inner why-immersive">
        <div className="why-layout">
          <motion.aside
            className="why-editorial"
            initial={reduce ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChapterEyebrow number="02 / 05" label="Por qué importa" tone="blue" />
            <p className="briefing-kicker">No es una sola métrica.</p>
            <h2 className="briefing-title">Es la combinación de estas cuatro señales lo que lo hace prioridad.</h2>
            <p className="briefing-lede">
              FOCUS evalúa múltiples dimensiones al mismo tiempo. Cuando las cuatro coinciden, el asunto merece tu atención primero.
            </p>

            <button
              type="button"
              className="why-combine-control"
              aria-pressed={isCombined}
              onClick={() => setIsCombined((current) => !current)}
            >
              <span>{isCombined ? 'Separar las señales' : 'Ver cómo se combinan'}</span>
              <Play aria-hidden="true" />
            </button>

            <motion.div
              className="why-conclusion"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, delay: 0.35 }}
            >
              <span className="why-conclusion__mark">F</span>
              <div>
                <small>Conclusión FOCUS</small>
                <p>La coincidencia de estas cuatro señales indica un riesgo operativo que puede escalar si no se actúa.</p>
              </div>
            </motion.div>
          </motion.aside>

          <div className={`why-visual ${isCombined ? 'is-combined' : ''}`}>
            <div className="why-signal-stage" aria-label="Cuatro señales convergen en la conclusión de FOCUS">
              <svg className="why-signal-stage__field" viewBox="0 0 780 660" fill="none" aria-hidden="true">
                <defs>
                  <radialGradient id="why-field-glow">
                    <stop stopColor="#2563eb" stopOpacity=".2" />
                    <stop offset="1" stopColor="#020612" stopOpacity="0" />
                  </radialGradient>
                  {streamColors.map((color, index) => (
                    <linearGradient key={color} id={`why-stream-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor={color} stopOpacity=".18" />
                      <stop offset=".6" stopColor={color} stopOpacity=".9" />
                      <stop offset="1" stopColor="#7dd3fc" stopOpacity=".72" />
                    </linearGradient>
                  ))}
                </defs>

                <circle cx="390" cy="330" r="292" fill="url(#why-field-glow)" />
                <g className="why-signal-stage__orbits">
                  <circle cx="390" cy="330" r="286" />
                  <circle cx="390" cy="330" r="218" />
                  <circle cx="390" cy="330" r="148" />
                  <ellipse cx="390" cy="330" rx="306" ry="196" transform="rotate(-14 390 330)" />
                  <ellipse cx="390" cy="330" rx="306" ry="196" transform="rotate(14 390 330)" />
                </g>

                {signalPaths.map((path, index) => (
                  <g key={path} className="why-signal-stage__stream">
                    {[-14, -8, -3, 3, 8, 14].map((offset) => (
                      <motion.path
                        key={offset}
                        d={path}
                        stroke={`url(#why-stream-${index})`}
                        strokeWidth={offset === -3 || offset === 3 ? 1.35 : 0.72}
                        transform={index % 2 === 0 ? `translate(${offset} 0)` : `translate(0 ${offset})`}
                        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: isCombined ? 0.82 : 0.38 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: reduce ? 0.01 : 1.3, delay: 0.08 * index + Math.abs(offset) / 90, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ))}
                    {!reduce && (
                      <circle r="2.8" fill={streamColors[index]} className="why-signal-stage__traveler">
                        <animateMotion path={path} dur={`${2.2 + index * 0.24}s`} begin={`${index * 0.18}s`} repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                ))}

                <g className="why-signal-stage__particles">
                  {streamParticles.map(([cx, cy, colorIndex], index) => (
                    <motion.circle
                      key={`${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={index % 4 === 0 ? 2.1 : 1.25}
                      fill={streamColors[colorIndex]}
                      initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                      whileInView={reduce ? undefined : { opacity: [0.24, 0.95, 0.36], scale: [0.7, 1.25, 0.85] }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 2.4 + (index % 5) * 0.26, delay: (index % 6) * 0.12, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  ))}
                </g>

                <g className="why-signal-stage__convergence">
                  <circle cx="390" cy="330" r="86" />
                  <circle cx="390" cy="330" r="104" />
                  <circle cx="390" cy="330" r="126" />
                </g>
              </svg>

              {signals.map((signal, index) => (
                <motion.article
                  key={signal.position}
                  className={`why-signal why-signal--${signal.position}`}
                  initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.55, delay: 0.14 * index }}
                >
                  <span className="why-signal__node" style={{ '--why-signal-color': streamColors[index] } as React.CSSProperties}><i /></span>
                  <div>
                    <small>{signal.number} {signal.label}</small>
                    <strong>{signal.value}</strong>
                    <p>{signal.detail}</p>
                  </div>
                </motion.article>
              ))}

              <motion.div
                className="why-core"
                initial={reduce ? false : { opacity: 0, scale: 0.72 }}
                whileInView={{ opacity: 1, scale: isCombined ? 1.08 : 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.72, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <FocusCore size="small" state="explaining" interactive variant="orb" markStyle="letter" />
              </motion.div>
            </div>

            <div className="why-combination-meter" aria-label="Combinación de señales: cuatro de cuatro">
              <span><small>Combinación de señales</small><b>4 / 4</b></span>
              <div>{Array.from({ length: 8 }).map((_, index) => <i key={index} />)}</div>
            </div>

            <motion.div
              className="why-priority-result"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, delay: 0.5 }}
            >
              <Target aria-hidden="true" />
              <div>
                <strong>FOCUS lo colocó primero</strong>
                <p>No apareció aquí por una sola métrica. La combinación de estas cuatro señales lo colocó como Prioridad #1 en tu briefing.</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="why-section-actions">
          <button type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /> Volver</button>
          <button type="button" className="is-primary" onClick={onContinue}>Continuar <ArrowRight aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
};
