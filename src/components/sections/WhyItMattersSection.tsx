import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Activity, ArrowRight, Clock3, Network, TrendingUp } from 'lucide-react';
import { FocusSignal } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';

interface WhyItMattersSectionProps {
  signals: FocusSignal[];
  conclusion: string;
  onContinue: () => void;
}

const signalIcons = [Activity, TrendingUp, Clock3, Network];

export const WhyItMattersSection: React.FC<WhyItMattersSectionProps> = ({ signals, conclusion, onContinue }) => {
  const reduce = !!useReducedMotion();
  const visibleSignals = signals.slice(0, 4);

  return (
    <section id="section-chapter-why" className="briefing-chapter briefing-chapter--why narrative-chapter" data-chapter="why">
      <div className="briefing-chapter__inner why-bento">
        <header className="why-bento__editorial">
          <ChapterEyebrow number="02" label="Por qué" tone="blue" />
          <motion.div
            className="why-bento__copy"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: reduce ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="briefing-kicker">No fue una sola razón.</p>
            <h2 className="briefing-title">FOCUS no lo priorizó por una sola razón.</h2>
            <p className="briefing-lede">Cuatro señales apuntan a la misma conclusión.</p>
          </motion.div>
          <div className="why-bento__sticky-note" aria-hidden="true">
            <span>Señales separadas</span><i /><strong>Conclusión</strong>
          </div>
        </header>

        <div className="why-bento__grid" role="list" aria-label="Señales que construyen la prioridad">
          {visibleSignals.map((signal, index) => {
            const Icon = signalIcons[index % signalIcons.length];
            return (
              <motion.article
                key={signal.id}
                className={`why-bento-card why-bento-card--${index + 1} is-${signal.semanticType}`}
                role="listitem"
                initial={reduce ? false : { opacity: 0, y: 26, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.42 }}
                transition={{ duration: reduce ? 0.01 : 0.58, delay: reduce ? 0 : index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="why-bento-card__top">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i><Icon aria-hidden="true" /></i>
                </div>
                <small>{signal.label}</small>
                <strong>{signal.value}</strong>
                <p>{signal.description}</p>
                <div className={`why-bento-card__visual is-${signal.optionalVisual ?? 'field'}`} aria-hidden="true">
                  <i /><i /><i /><i /><b />
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          className="why-bento__conclusion"
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.75, delay: reduce ? 0 : 0.12 }}
        >
          <span className="why-bento__mark" aria-hidden="true">F</span>
          <div>
            <small>FOCUS cruzó estas señales.</small>
            <strong>Por eso este asunto aparece primero.</strong>
            <p>{conclusion}</p>
          </div>
          <button type="button" className="briefing-action briefing-action--primary" onClick={onContinue}>
            Continuar <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
