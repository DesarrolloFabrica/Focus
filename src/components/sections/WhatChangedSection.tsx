import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, CircleAlert, Sparkles } from 'lucide-react';
import { FocusChange } from '../../types/focus';

interface WhatChangedSectionProps {
  changes: FocusChange;
  onContinue: () => void;
}

export const WhatChangedSection: React.FC<WhatChangedSectionProps> = ({ changes, onContinue }) => {
  const reduce = !!useReducedMotion();

  return (
    <section id="section-chapter-changes" className="iv-scene iv-changes-chapter" data-chapter="changes">
      <div className="iv-shell iv-changes-chapter__layout">
        <motion.header
          className="iv-changes-chapter__heading"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <div className="iv-scene-label is-light">
            <span>03 / 07</span>
            <i />
            <strong>Cambios</strong>
          </div>
          <h2>Desde tu última visita, esto cambió.</h2>
          <p>FOCUS comparó lo que había antes con lo que ocurre ahora.</p>
        </motion.header>

        <div className="iv-changes-chapter__states" aria-label="Comparación de estados">
          <article>
            <small>{changes.previousState.label}</small>
            <strong>{changes.previousState.value ?? 'Antes'}</strong>
            <p>{changes.previousState.description}</p>
          </article>
          <span aria-hidden="true">ANTES</span>
          <article className="is-now">
            <small>{changes.currentState.label}</small>
            <strong>{changes.currentState.value ?? 'Ahora'}</strong>
            <p>{changes.currentState.description}</p>
          </article>
        </div>

        <div className="iv-change-timeline" role="list" aria-label="Línea temporal de cambios">
          <motion.div
            className="iv-change-timeline__rail"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: reduce ? 0.01 : 1.05, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
          <span className="iv-change-timeline__edge is-start">Antes</span>
          {changes.changes.map((change, index) => (
            <motion.article
              key={change.id}
              role="listitem"
              className={`iv-change-timeline__event is-${change.status} is-${change.importance}`}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: change.importance === 'low' ? 0.42 : 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduce ? 0.01 : 0.5, delay: reduce ? 0 : index * 0.1 }}
            >
              <span aria-hidden="true">{change.status === 'resolved' ? <Check /> : <CircleAlert />}</span>
              <small>{change.timeLabel}</small>
              <strong>{change.title}</strong>
              <p>{change.description}</p>
              <b>{change.importance === 'high' ? 'Relevante' : change.status === 'resolved' ? 'Resuelto' : 'Ruido'}</b>
            </motion.article>
          ))}
          <span className="iv-change-timeline__edge is-end">Ahora</span>
        </div>

        <motion.div
          className="iv-changes-chapter__filter"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.65 }}
        >
          <span><Sparkles aria-hidden="true" /> {changes.newItemsCount} observados</span>
          <i aria-hidden="true" />
          <strong>De todo lo que cambió, solo esto merece tu atención.</strong>
          <em>{changes.relevantChangesCount} relevantes</em>
          <button type="button" className="iv-continue is-light" onClick={onContinue}>
            Continuar <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
