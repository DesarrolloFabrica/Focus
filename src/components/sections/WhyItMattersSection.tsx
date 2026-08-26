import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { FocusSignal } from '../../types/focus';

interface WhyItMattersSectionProps {
  signals: FocusSignal[];
  conclusion: string;
  onContinue: () => void;
}

const order: Array<FocusSignal['semanticType']> = ['impact', 'deterioration', 'persistence', 'context'];

export const WhyItMattersSection: React.FC<WhyItMattersSectionProps> = ({ signals, conclusion, onContinue }) => {
  const reduce = !!useReducedMotion();
  const sorted = order
    .map((type) => signals.find((signal) => signal.semanticType === type))
    .filter(Boolean) as FocusSignal[];
  const visible = sorted.length ? sorted : signals.slice(0, 4);

  return (
    <section id="section-chapter-why" className="iv-scene iv-why-chapter" data-chapter="why">
      <div className="iv-shell iv-why-chapter__layout">
        <motion.header
          className="iv-why-chapter__heading"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <div className="iv-scene-label">
            <span>02 / 07</span>
            <i />
            <strong>Por qué</strong>
          </div>
          <p className="iv-why-chapter__kicker">¿Por qué FOCUS decidió mostrarme esto?</p>
          <h2>FOCUS no lo priorizó por una sola razón.</h2>
          <p className="iv-why-chapter__lede">Cuatro señales apuntan a la misma conclusión.</p>
        </motion.header>

        <div className="iv-why-bento" role="list" aria-label="Señales que construyen la prioridad">
          {visible.map((signal, index) => (
            <motion.article
              key={signal.id}
              role="listitem"
              className={`iv-why-bento__cell is-${signal.semanticType} is-${signal.optionalVisual ?? 'field'}`}
              initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduce ? 0.01 : 0.55, delay: reduce ? 0 : 0.12 + index * 0.12 }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <small>{signal.label}</small>
              <strong>{signal.value}</strong>
              <p>{signal.description}</p>
              <div className="iv-why-bento__visual" aria-hidden="true">
                <i /><i /><i /><i /><b />
              </div>
            </motion.article>
          ))}
          <svg className="iv-why-bento__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M22 28 C40 40 55 42 78 30"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.55 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : 0.9, delay: reduce ? 0 : 0.7 }}
            />
            <motion.path
              d="M24 72 C48 58 60 60 78 70"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.45 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : 0.9, delay: reduce ? 0 : 0.82 }}
            />
          </svg>
        </div>

        <motion.div
          className="iv-why-chapter__conclusion"
          initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.7, delay: reduce ? 0 : 0.2 }}
        >
          <span className="iv-why-chapter__mark" aria-hidden="true">F</span>
          <div>
            <small>FOCUS cruzó estas señales.</small>
            <strong>Por eso este asunto aparece primero.</strong>
            <p>{conclusion}</p>
          </div>
          <button type="button" className="iv-continue" onClick={onContinue}>
            Continuar <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
