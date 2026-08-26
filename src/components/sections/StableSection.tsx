import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { FocusEntity } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';

interface StableSectionProps {
  entities: FocusEntity[];
  onContinue: () => void;
}

export const StableSection: React.FC<StableSectionProps> = ({ entities, onContinue }) => {
  const reduce = !!useReducedMotion();

  return (
    <section id="section-chapter-stability" className="briefing-chapter briefing-chapter--stable narrative-chapter" data-chapter="stability">
      <div className="briefing-chapter__inner coverage-story">
        <motion.header
          className="coverage-story__heading"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <ChapterEyebrow number="05" label="Cobertura" tone="emerald" />
          <p className="briefing-kicker">FOCUS también revisó el resto.</p>
          <h2 className="briefing-title">Ahora, lo que puedes dejar tranquilo.</h2>
          <p className="briefing-lede">No todo lo observado merece convertirse en una interrupción.</p>
        </motion.header>

        <div className="coverage-grid" role="list" aria-label="Entidades estables revisadas por FOCUS">
          {entities.map((entity, index) => (
            <motion.article
              key={entity.id}
              className={`coverage-card coverage-card--${(index % 4) + 1}`}
              role="listitem"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: reduce ? 0.01 : 0.46, delay: reduce ? 0 : (index % 6) * 0.055 }}
            >
              <span><Check aria-hidden="true" /></span>
              <small>{String(index + 1).padStart(2, '0')}</small>
              <strong>{entity.label}</strong>
              <p>{entity.description}</p>
              <div><b>{entity.state}</b>{entity.metric && <em>{entity.metric}</em>}</div>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="coverage-story__result"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <ShieldCheck aria-hidden="true" />
          <div>
            <small>{entities.length} elementos revisados. Ninguno necesita tu atención.</small>
            <strong>FOCUS también decide qué no mostrarte.</strong>
          </div>
          <button type="button" className="briefing-action briefing-action--primary" onClick={onContinue}>
            Ver síntesis <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
