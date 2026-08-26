import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FocusChange } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';

interface WhatChangedSectionProps {
  changes: FocusChange;
}

type ChangeNodeState = 'resolved' | 'attention' | 'relevant' | 'noise';

export const WhatChangedSection: React.FC<WhatChangedSectionProps> = ({ changes }) => {
  const reduce = !!useReducedMotion();
  const totalNodes = Math.min(changes.newItemsCount, 24);
  const resolved = Math.min(changes.resolvedItemsCount, totalNodes);
  const attention = Math.min(changes.pendingItemsCount, Math.max(0, totalNodes - resolved));
  const relevant = Math.min(changes.relevantChangesCount, Math.max(0, totalNodes - resolved - attention));

  const nodes = Array.from({ length: totalNodes }, (_, index): ChangeNodeState => {
    if (index < resolved) return 'resolved';
    if (index < resolved + attention) return 'attention';
    if (index >= totalNodes - relevant) return 'relevant';
    return 'noise';
  });

  return (
    <section id="section-chapter-changes" className="briefing-chapter briefing-chapter--changes">
      <div className="briefing-chapter__inner">
        <ChapterEyebrow number="03 / 05" label="Qué cambió" tone="cyan" />

        <motion.div
          className="changes-heading"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.65 }}
        >
          <p className="briefing-kicker">Tu última visita → Ahora</p>
          <h2 className="briefing-title">Mucho cambió. Poco merece quedarse.</h2>
        </motion.div>

        <motion.div
          className="change-filter"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65 }}
        >
          <div className="change-filter__timeline" aria-hidden="true">
            <span>Tu última visita</span><i /><span>Ahora</span>
          </div>

          <div className="change-filter__stage" aria-label={`${changes.newItemsCount} novedades filtradas hasta encontrar ${changes.relevantChangesCount} cambios relevantes`}>
            {nodes.map((state, index) => (
              <motion.span
                key={`${state}-${index}`}
                className={`change-particle is-${state}`}
                style={{ '--i': index } as React.CSSProperties}
                initial={reduce ? false : { opacity: 0, scale: 0.4, x: -32 }}
                whileInView={
                  state === 'resolved'
                    ? { opacity: [0, 0.85, 0], scale: [0.4, 1, 0.3], x: [-32, 0, 30] }
                    : state === 'noise'
                      ? { opacity: [0, 0.65, 0.12], scale: [0.4, 1, 0.7], x: [-32, 0, 18] }
                      : { opacity: 1, scale: state === 'relevant' ? 1.25 : 1, x: 0 }
                }
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: reduce ? 0.1 : 1.15, delay: reduce ? 0 : index * 0.035 }}
              >
                {state === 'relevant' && <b>{String(index - (totalNodes - relevant) + 1).padStart(2, '0')}</b>}
              </motion.span>
            ))}
            <div className="change-filter__beam" aria-hidden="true" />
          </div>

          <div className="change-filter__counts">
            <span><strong>{changes.newItemsCount}</strong> nuevos</span>
            <span className="is-resolved"><strong>{changes.resolvedItemsCount}</strong> resueltos</span>
            <span className="is-attention"><strong>{changes.pendingItemsCount}</strong> requieren atención</span>
            <span className="is-relevant"><strong>{changes.relevantChangesCount}</strong> relevantes</span>
          </div>
        </motion.div>

        <div className="change-events">
          {changes.events.slice(0, 4).map((event, index) => (
            <motion.div
              key={`${event.time}-${event.title}`}
              className={`change-event is-${event.category}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 * index }}
            >
              <time>{event.time}</time><i /><p>{event.title}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="change-conclusion"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          FOCUS eliminó el ruido. <strong>Solo dejó visible lo relevante.</strong>
        </motion.p>
      </div>
    </section>
  );
};
