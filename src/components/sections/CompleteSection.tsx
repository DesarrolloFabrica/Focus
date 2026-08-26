import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Eye, Minus, Target } from 'lucide-react';
import { FocusBriefing } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface CompleteSectionProps {
  briefing: FocusBriefing;
  onInvestigate: () => void;
  onFinish: () => void;
  onReset: () => void;
}

const actionIcons = { act: Target, watch: Eye, stable: Minus };
const actionLabels = { act: 'Haz ahora', watch: 'Observa', stable: 'Sin acción' };

export const CompleteSection: React.FC<CompleteSectionProps> = ({ briefing, onInvestigate, onFinish, onReset }) => {
  const coreRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const coreIsVisible = useInView(coreRef, { once: true, amount: 0.25 });
  const actions = briefing.summaryActions.slice(0, 3);

  return (
    <section id="section-chapter-complete" className="iv-scene iv-summary-chapter" data-chapter="summary">
      <div className="iv-summary-chapter__aura" aria-hidden="true" />
      <div className="iv-shell iv-summary-chapter__layout">
        <motion.header
          className="iv-summary-chapter__heading"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <div className="iv-scene-label is-light">
            <span>06 / 07</span>
            <i />
            <strong>Síntesis</strong>
          </div>
          <span className="iv-summary-chapter__badge"><Check aria-hidden="true" /> Briefing completado</span>
          <h2>Ya tienes el panorama.</h2>
          <p>FOCUS redujo toda la actividad observada a lo que realmente necesitabas conocer.</p>
        </motion.header>

        <motion.div
          ref={coreRef}
          className="iv-summary-chapter__core"
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0.01 : 0.95, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Núcleo FOCUS en estado de síntesis"
        >
          {coreIsVisible && <FocusCore size="large" state="complete" variant="particle" markStyle="letter" />}
        </motion.div>

        <div className="iv-summary-chapter__actions" role="list" aria-label="Conclusiones del briefing">
          {actions.map((action, index) => {
            const Icon = actionIcons[action.level];
            return (
              <motion.article
                key={action.id}
                role="listitem"
                className={`iv-summary-chapter__card is-${action.level}`}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: reduce ? 0.01 : 0.5, delay: reduce ? 0 : index * 0.08 }}
              >
                <span><Icon aria-hidden="true" /></span>
                <small>{actionLabels[action.level]}</small>
                <strong>{action.title}</strong>
                <p>{action.description}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="iv-summary-chapter__cta">
          <button id="btn-summary-investigate" type="button" className="iv-primary-button" onClick={onInvestigate}>
            Investigar prioridad <ArrowRight aria-hidden="true" />
          </button>
          <button id="btn-summary-finish" type="button" className="iv-secondary-button" onClick={onFinish}>
            Finalizar briefing
          </button>
          <button type="button" className="iv-summary-chapter__reset" onClick={onReset}>
            Volver al panorama
          </button>
        </div>
      </div>
    </section>
  );
};
