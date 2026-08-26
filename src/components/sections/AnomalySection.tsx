import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Eye, Waves } from 'lucide-react';
import { FocusAnomaly } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';

interface AnomalySectionProps {
  anomaly: FocusAnomaly;
  onContinue: () => void;
}

const pathFromValues = (values: number[], minimum: number, maximum: number) => {
  if (!values.length) return '';
  const width = 680;
  const left = 40;
  const top = 34;
  const height = 226;
  const range = Math.max(1, maximum - minimum);
  const points = values.map((value, index) => ({
    x: left + (width * index) / Math.max(1, values.length - 1),
    y: top + ((value - minimum) / range) * height,
  }));

  return points.reduce((path, point, index) => `${path}${index ? ' L' : 'M'} ${point.x} ${point.y}`, '');
};

export const AnomalySection: React.FC<AnomalySectionProps> = ({ anomaly, onContinue }) => {
  const reduce = !!useReducedMotion();
  const hasAnomaly = anomaly.isUnusual;
  const allValues = [...anomaly.expectedPath, ...anomaly.actualPath];
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const expectedPath = pathFromValues(anomaly.expectedPath, minimum, maximum);
  const actualPath = pathFromValues(anomaly.actualPath, minimum, maximum);
  const breakpointIndex = Math.max(1, anomaly.actualPath.findIndex((value, index) => Math.abs(value - (anomaly.expectedPath[index] ?? value)) > 3));
  const breakpointX = 40 + (680 * breakpointIndex) / Math.max(1, anomaly.actualPath.length - 1);
  const breakpointValue = anomaly.actualPath[breakpointIndex] ?? minimum;
  const breakpointY = 34 + ((breakpointValue - minimum) / Math.max(1, maximum - minimum)) * 226;

  return (
    <section id="section-chapter-anomaly" className="briefing-chapter briefing-chapter--anomaly narrative-chapter" data-chapter="anomaly">
      <div className="anomaly-story__ambient" aria-hidden="true"><i /><i /><i /></div>
      <div className="briefing-chapter__inner anomaly-story">
        <header className="anomaly-story__intro">
          <ChapterEyebrow number="04" label="Anomalía" tone="violet" />
          <motion.div
            className="anomaly-story__pulse"
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduce ? 0.01 : 0.75 }}
            aria-hidden="true"
          >
            <span /><i /><i />
          </motion.div>
          <p className="briefing-kicker">FOCUS / {hasAnomaly ? 'Fuera de lo habitual' : 'Comportamiento verificado'}</p>
          <h2 className="briefing-title">{anomaly.headline}</h2>
          <p className="briefing-lede">{anomaly.description}</p>
        </header>

        <motion.figure
          className="anomaly-visual"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.32 }}
          transition={{ duration: reduce ? 0.01 : 0.78 }}
        >
          <figcaption>
            <span><Waves aria-hidden="true" /> Patrón esperado</span>
            <strong>{anomaly.breakpointLabel}</strong>
            <span className="is-actual"><Eye aria-hidden="true" /> Señal observada</span>
          </figcaption>
          <svg
            viewBox="0 0 760 320"
            role="img"
            aria-label={hasAnomaly
              ? `La trayectoria observada diverge del patrón esperado: ${anomaly.breakpointLabel}`
              : 'La trayectoria observada se mantiene alineada con el patrón esperado'}
          >
            <g className="anomaly-visual__grid" aria-hidden="true">
              {[52, 112, 172, 232, 292].map((y) => <line key={y} x1="40" x2="720" y1={y} y2={y} />)}
            </g>
            <motion.path
              className="anomaly-visual__expected"
              d={expectedPath}
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : 1.1 }}
            />
            <motion.path
              className="anomaly-visual__actual"
              d={actualPath}
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : 1.25, delay: reduce ? 0 : 0.15 }}
            />
            {hasAnomaly && (
              <g className="anomaly-visual__break" aria-hidden="true">
                <circle cx={breakpointX} cy={breakpointY} r="8" />
                <circle cx={breakpointX} cy={breakpointY} r="22" />
                <path d={`M${breakpointX} ${breakpointY - 28} L${breakpointX} ${Math.max(56, breakpointY - 82)} L${Math.min(610, breakpointX + 142)} ${Math.max(56, breakpointY - 82)}`} />
                <text x={Math.min(620, breakpointX + 152)} y={Math.max(52, breakpointY - 86)}>ANOMALÍA DETECTADA</text>
              </g>
            )}
            <g className="anomaly-visual__axis"><text x="40" y="312">INICIO</text><text x="720" y="312" textAnchor="end">AHORA</text></g>
          </svg>
        </motion.figure>

        <motion.aside
          className="anomaly-story__explanation"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.65 }}
        >
          <div>
            <p>{hasAnomaly ? 'Lo importante no es que sea crítico.' : 'No apareció una ruptura.'}</p>
            <strong>{hasAnomaly
              ? 'Lo importante es que se comporta diferente de lo normal.'
              : 'La señal observada sigue el patrón esperado.'}</strong>
          </div>
          <div className="anomaly-story__value"><small>{anomaly.title}</small><strong>{anomaly.value}</strong><p>{anomaly.context}</p></div>
          <button type="button" className="briefing-action briefing-action--violet" onClick={onContinue}>
            Ver lo que está bien <ArrowRight aria-hidden="true" />
          </button>
        </motion.aside>
      </div>
    </section>
  );
};
