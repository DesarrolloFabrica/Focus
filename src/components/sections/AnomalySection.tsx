import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { FocusAnomaly } from '../../types/focus';

interface AnomalySectionProps {
  anomaly: FocusAnomaly;
  onContinue: () => void;
}

const pathFromValues = (values: number[], minimum: number, maximum: number) => {
  if (!values.length) return '';
  const width = 680;
  const left = 40;
  const top = 40;
  const height = 210;
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
  const breakpointIndex = Math.max(
    1,
    anomaly.actualPath.findIndex((value, index) => Math.abs(value - (anomaly.expectedPath[index] ?? value)) > 3),
  );
  const breakpointX = 40 + (680 * breakpointIndex) / Math.max(1, anomaly.actualPath.length - 1);
  const breakpointValue = anomaly.actualPath[breakpointIndex] ?? minimum;
  const breakpointY = 40 + ((breakpointValue - minimum) / Math.max(1, maximum - minimum)) * 210;

  return (
    <section id="section-chapter-anomaly" className="iv-scene iv-anomaly-chapter" data-chapter="anomaly">
      <div className="iv-anomaly-chapter__void" aria-hidden="true"><i /><i /><i /></div>
      <div className="iv-shell iv-anomaly-chapter__layout">
        <motion.header
          className="iv-anomaly-chapter__intro"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <div className="iv-scene-label is-light">
            <span>04 / 07</span>
            <i />
            <strong>Anomalía</strong>
          </div>
          <p className="iv-anomaly-chapter__kicker">FOCUS / FUERA DE LO HABITUAL</p>
          <h2>{hasAnomaly ? 'Esto no suele ocurrir.' : anomaly.headline}</h2>
        </motion.header>

        <motion.div
          className="iv-anomaly-chapter__seed"
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduce ? 0.01 : 0.75 }}
          aria-hidden="true"
        >
          <span />
          <i /><i />
        </motion.div>

        <motion.figure
          className="iv-anomaly-chapter__figure"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0.01 : 0.8 }}
        >
          <svg
            viewBox="0 0 760 300"
            role="img"
            aria-label={hasAnomaly
              ? `La trayectoria observada diverge del patrón esperado: ${anomaly.breakpointLabel}`
              : 'La trayectoria observada se mantiene alineada con el patrón esperado'}
          >
            <motion.ellipse
              cx="380"
              cy="150"
              rx="210"
              ry="88"
              className="iv-anomaly-chapter__wave"
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 0.35, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
            />
            <motion.ellipse
              cx="380"
              cy="150"
              rx="280"
              ry="118"
              className="iv-anomaly-chapter__wave is-late"
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 0.22, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.22 }}
            />
            <motion.path
              className="iv-anomaly-chapter__expected"
              d={expectedPath}
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : 1.15 }}
            />
            <motion.path
              className="iv-anomaly-chapter__actual"
              d={actualPath}
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : 1.3, delay: reduce ? 0 : 0.15 }}
            />
            {hasAnomaly && (
              <g className="iv-anomaly-chapter__break">
                <circle cx={breakpointX} cy={breakpointY} r="7" />
                <circle cx={breakpointX} cy={breakpointY} r="18" />
                <text x={Math.min(560, breakpointX + 24)} y={Math.max(36, breakpointY - 18)}>ANOMALÍA DETECTADA</text>
              </g>
            )}
          </svg>
        </motion.figure>

        <motion.aside
          className="iv-anomaly-chapter__copy"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.65 }}
        >
          <p>No necesariamente es crítico.</p>
          <strong>Es relevante porque se comporta diferente de lo normal.</strong>
          <div>
            <small>{anomaly.title}</small>
            <b>{anomaly.value}</b>
            <span>{anomaly.context}</span>
          </div>
          <button type="button" className="iv-continue is-light" onClick={onContinue}>
            Ver lo estable <ArrowRight aria-hidden="true" />
          </button>
        </motion.aside>
      </div>
    </section>
  );
};
