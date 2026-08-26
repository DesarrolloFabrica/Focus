import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FocusStableSummary } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';

interface StableSectionProps {
  stable: FocusStableSummary;
  areaCount?: number;
}

const stableAreas = [
  'Admisiones', 'Validación', 'Asignación', 'Control', 'Archivo', 'Entrega',
  'Calidad', 'Documentación', 'Seguimiento', 'Cierre', 'Planeación', 'Servicio',
];

const nodePositions = [
  [12, 28], [27, 15], [44, 27], [63, 13], [82, 30], [72, 48],
  [87, 70], [61, 76], [43, 62], [25, 79], [9, 63], [48, 44],
];

export const StableSection: React.FC<StableSectionProps> = ({ stable, areaCount = stable.monitoredProcessesCount }) => {
  const reduce = !!useReducedMotion();
  const areas = stableAreas.slice(0, Math.min(areaCount, stableAreas.length));

  return (
    <section id="section-chapter-stability" className="briefing-chapter briefing-chapter--stable">
      <div className="briefing-chapter__inner">
        <ChapterEyebrow number="05 / 05" label="Todo lo demás" tone="emerald" />

        <motion.div
          className="stable-heading"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
        >
          <p className="briefing-kicker">El valor de no interrumpir</p>
          <h2 className="briefing-title">{areaCount} áreas revisadas.<br />Ninguna necesita tu atención.</h2>
        </motion.div>

        <motion.div
          className="stability-field"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9 }}
          aria-label={`${areaCount} áreas operan dentro de parámetros`}
        >
          <svg viewBox="0 0 900 430" aria-hidden="true">
            <ellipse cx="450" cy="215" rx="355" ry="148" />
            <ellipse cx="450" cy="215" rx="260" ry="105" />
            <path d="M90 215 C250 75 650 75 810 215 C650 355 250 355 90 215 Z" />
          </svg>
          {areas.map((area, index) => {
            const [left, top] = nodePositions[index];
            return (
              <motion.button
                type="button"
                key={area}
                className="stability-node"
                style={{ left: `${left}%`, top: `${top}%` }}
                initial={reduce ? false : { opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.06 * index }}
                aria-label={`${area}. Dentro de parámetros`}
              >
                <i aria-hidden="true" />
                <span><strong>{area}</strong><small>Dentro de parámetros</small></span>
              </motion.button>
            );
          })}
          <div className="stability-field__center" aria-hidden="true">
            <i /><span>OPERACIÓN ESTABLE</span>
          </div>
        </motion.div>

        <motion.p
          className="stable-principle"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.75, delay: 0.2 }}
        >
          FOCUS también decide <strong>qué no mostrarte.</strong>
        </motion.p>
      </div>
    </section>
  );
};
