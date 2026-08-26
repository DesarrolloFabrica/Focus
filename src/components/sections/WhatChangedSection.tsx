import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, CircleAlert, Sparkles } from 'lucide-react';
import { FocusChange } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';

interface WhatChangedSectionProps {
  changes: FocusChange;
  onContinue: () => void;
}

export const WhatChangedSection: React.FC<WhatChangedSectionProps> = ({ changes, onContinue }) => {
  const reduce = !!useReducedMotion();

  return (
    <section id="section-chapter-changes" className="briefing-chapter briefing-chapter--changes narrative-chapter" data-chapter="changes">
      <div className="briefing-chapter__inner changes-story">
        <motion.header
          className="changes-story__heading"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <ChapterEyebrow number="03" label="Cambios" tone="cyan" />
          <p className="briefing-kicker">Tu última visita → Ahora</p>
          <h2 className="briefing-title">Desde tu última visita, esto cambió.</h2>
          <p className="briefing-lede">FOCUS comparó el estado anterior con lo que ocurre ahora.</p>
        </motion.header>

        <div className="changes-story__states" aria-label="Comparación de estados">
          <article>
            <small>{changes.previousState.label}</small>
            <strong>{changes.previousState.value}</strong>
            <p>{changes.previousState.description}</p>
          </article>
          <span aria-hidden="true"><i /><ArrowRight /></span>
          <article className="is-current">
            <small>{changes.currentState.label}</small>
            <strong>{changes.currentState.value}</strong>
            <p>{changes.currentState.description}</p>
          </article>
        </div>

        <div className="change-timeline" role="list" aria-label="Línea temporal de cambios relevantes">
          <motion.div
            className="change-timeline__line"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: reduce ? 0.01 : 1.05, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
          <span className="change-timeline__edge is-start">Última visita</span>
          {changes.changes.map((change, index) => (
            <motion.article
              key={change.id}
              className={`change-timeline__event is-${change.status} is-${change.importance}`}
              role="listitem"
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: change.importance === 'low' ? 0.58 : 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: reduce ? 0.01 : 0.5, delay: reduce ? 0 : index * 0.1 }}
            >
              <span className="change-timeline__node" aria-hidden="true">
                {change.status === 'resolved' ? <Check /> : <CircleAlert />}
              </span>
              <small>{change.timeLabel}</small>
              <strong>{change.title}</strong>
              <p>{change.description}</p>
              <b>{change.importance === 'high' ? 'Relevante' : change.status === 'resolved' ? 'Resuelto' : 'Contexto'}</b>
            </motion.article>
          ))}
          <span className="change-timeline__edge is-end">Ahora</span>
        </div>

        <motion.div
          className="changes-story__filter-result"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.65 }}
        >
          <span><Sparkles aria-hidden="true" /> {changes.newItemsCount} cambios observados</span>
          <i aria-hidden="true" />
          <strong>Solo {changes.relevantChangesCount} eventos merecen tu atención.</strong>
          <button type="button" className="briefing-action briefing-action--primary" onClick={onContinue}>
            Continuar <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
