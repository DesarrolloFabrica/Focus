import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { FocusEntity } from '../../types/focus';

interface StableSectionProps {
  entities: FocusEntity[];
  onContinue: () => void;
}

export const StableSection: React.FC<StableSectionProps> = ({ entities, onContinue }) => {
  const reduce = !!useReducedMotion();

  return (
    <section id="section-chapter-stability" className="iv-scene iv-coverage-chapter" data-chapter="stability">
      <div className="iv-shell iv-coverage-chapter__layout">
        <motion.header
          className="iv-coverage-chapter__heading"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <div className="iv-scene-label">
            <span>05 / 07</span>
            <i />
            <strong>Cobertura</strong>
          </div>
          <h2>Ahora, lo que puedes dejar tranquilo.</h2>
          <p>FOCUS también revisó el resto.</p>
        </motion.header>

        <div className="iv-coverage-catalog" role="list" aria-label="Entidades estables revisadas">
          {entities.map((entity, index) => (
            <motion.article
              key={entity.id}
              role="listitem"
              className={`iv-coverage-catalog__item is-${(index % 4) + 1}`}
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduce ? 0.01 : 0.42, delay: reduce ? 0 : (index % 6) * 0.05 }}
            >
              <Check aria-hidden="true" />
              <strong>{entity.label}</strong>
              <b>{entity.state}</b>
              {entity.description && <p>{entity.description}</p>}
              {entity.metric && <em>{entity.metric}</em>}
            </motion.article>
          ))}
        </div>

        <motion.div
          className="iv-coverage-chapter__principle"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <small>{entities.length} elementos revisados. Ninguno necesita tu atención.</small>
          <strong>FOCUS también decide qué no mostrarte.</strong>
          <button type="button" className="iv-continue" onClick={onContinue}>
            Cerrar el briefing <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
