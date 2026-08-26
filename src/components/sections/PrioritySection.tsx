import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import focusPriorityBeacon from '../../assets/focus-priority-beacon.png';
import { FocusPriority } from '../../types/focus';

interface PrioritySectionProps {
  priority: FocusPriority;
  onContinue: () => void;
}

/**
 * Visual source of truth: ImmersiveJourney `iv-priority` at 7af41f5
 * (active experience before ade3396). Narrative/data contract from ade3396.
 */
export const PrioritySection: React.FC<PrioritySectionProps> = ({ priority, onContinue }) => {
  const reduceMotion = !!useReducedMotion();

  return (
    <section
      id="section-chapter-priority"
      className="iv-scene iv-priority"
      data-chapter="priority"
    >
      <div className="iv-priority__glow" aria-hidden="true" />
      <div className="iv-shell iv-priority__layout">
        <div className="iv-priority__lead">
          <div className="iv-scene-label is-light">
            <span>01 / 07</span>
            <i />
            <strong>Prioridad principal</strong>
          </div>

          <motion.div
            className="iv-priority__copy"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p>{priority.title}</p>
            <h2 id="priority-heading" tabIndex={-1}>{priority.headline}</h2>
          </motion.div>

          <motion.figure
            className="iv-priority__figure"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg className="iv-priority__figure-orbit" viewBox="0 0 420 420" aria-hidden="true">
              <ellipse cx="210" cy="210" rx="168" ry="72" />
              <ellipse cx="210" cy="210" rx="196" ry="88" transform="rotate(-14 210 210)" />
              <ellipse cx="210" cy="210" rx="132" ry="132" transform="rotate(22 210 210)" />
              <circle cx="210" cy="118" r="2.2" />
              <circle cx="318" cy="228" r="1.8" />
            </svg>
            <div className="iv-priority__figure-glow" aria-hidden="true" />
            <div className="iv-priority__figure-frame">
              <img src={focusPriorityBeacon} alt="" />
            </div>
            <figcaption className="iv-priority__figure-cap">
              <div>
                <small><i /> Señal activa</small>
                <strong>{priority.currentMetric}</strong>
              </div>
              <span className={priority.deltaPercentage > 0 ? 'is-up' : 'is-down'}>
                {priority.deltaPercentage > 0 ? '+' : ''}{priority.deltaPercentage}%
              </span>
            </figcaption>
          </motion.figure>

          <div className="iv-priority__actions">
            <button
              id="btn-continue-priority"
              type="button"
              className="iv-continue is-light"
              onClick={onContinue}
            >
              <span>Entender por qué</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <motion.div
          className="iv-priority__panel"
          initial={reduceMotion ? false : { opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="iv-priority__panel-accent" aria-hidden="true" />
          <p className="iv-priority__panel-kicker">
            {priority.description}
          </p>

          <div className="iv-priority__cards">
            <article className="iv-priority-card">
              <div className="iv-priority-card__orb" aria-hidden="true" />
              <span>01</span>
              <h3>situación actual</h3>
              <p>
                El indicador opera en <b>{priority.currentMetric}</b>, lejos del ritmo que esta operación suele sostener.
              </p>
            </article>

            <article className="iv-priority-card">
              <div className="iv-priority-card__orb" aria-hidden="true" />
              <span>02</span>
              <h3>referencia habitual</h3>
              <p>
                El comportamiento esperado se mantiene cerca de <b>{priority.usualMetric}</b>. Ese contraste define la prioridad.
              </p>
            </article>

            <article className="iv-priority-card iv-priority-card--wide">
              <div className="iv-priority-card__orb" aria-hidden="true" />
              <span>lectura de focus</span>
              <p>
                FOCUS elevó este asunto porque concentra <b>{priority.affectedCount} {priority.affectedUnit}</b>,
                con un deterioro de <b>{priority.deltaPercentage > 0 ? '+' : ''}{priority.deltaPercentage}%</b> frente
                a lo habitual. {priority.startedTimeAgo}{' '}
                {priority.explanation.summaryText}
              </p>
              <div className="iv-priority-card__meta">
                <div>
                  <small>Impacto</small>
                  <strong>{priority.explanation.impact}</strong>
                </div>
                <div>
                  <small>Persistencia</small>
                  <strong>{priority.explanation.persistence}</strong>
                </div>
                <div>
                  <small>Relevancia</small>
                  <strong>{priority.explanation.relevance}</strong>
                </div>
              </div>
            </article>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
