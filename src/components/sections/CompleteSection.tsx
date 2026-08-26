import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Eye, Minus, Target } from 'lucide-react';
import { FocusBriefing } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';
import { FocusCore } from '../core/FocusCore';

interface CompleteSectionProps {
  briefing: FocusBriefing;
  onInvestigate: () => void;
  onFinish: () => void;
  onReset: () => void;
}

const actionIcons = { act: Target, watch: Eye, stable: Minus };

export const CompleteSection: React.FC<CompleteSectionProps> = ({ briefing, onInvestigate, onFinish, onReset }) => {
  const coreRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const coreIsVisible = useInView(coreRef, { once: true, amount: 0.25 });

  return (
    <section id="section-chapter-complete" className="briefing-chapter briefing-chapter--complete narrative-chapter" data-chapter="summary">
      <div className="briefing-chapter__inner summary-story">
        <motion.header
          className="summary-story__heading"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduce ? 0.01 : 0.7 }}
        >
          <ChapterEyebrow number="06" label="Síntesis" tone="blue" />
          <span className="complete-badge"><Check aria-hidden="true" /> Briefing completado</span>
          <h2>Ya tienes el panorama.</h2>
          <p>FOCUS redujo toda la actividad observada a lo que realmente necesitabas conocer.</p>
        </motion.header>

        <motion.div
          ref={coreRef}
          className="summary-story__core"
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0.01 : 0.95, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Núcleo FOCUS en estado de síntesis"
        >
          <div className="summary-story__orbit" aria-hidden="true"><i /><i /><i /></div>
          {coreIsVisible && <FocusCore size="large" state="complete" variant="particle" markStyle="letter" />}
        </motion.div>

        <div className="focus-summary" role="list" aria-label="Síntesis de acciones">
          {briefing.summaryActions.map((action, index) => {
            const Icon = actionIcons[action.level];
            return (
              <motion.article
                key={action.id}
                className={`focus-summary__item is-${action.level}`}
                role="listitem"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: reduce ? 0.01 : 0.55, delay: reduce ? 0 : index * 0.09 }}
              >
                <span><Icon aria-hidden="true" /></span>
                <small>{action.label}</small>
                <strong>{action.title}</strong>
                <p>{action.description}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="summary-story__actions">
          <button id="btn-summary-investigate" type="button" className="briefing-action briefing-action--primary" onClick={onInvestigate}>
            Investigar prioridad <ArrowRight aria-hidden="true" />
          </button>
          <button id="btn-summary-finish" type="button" className="briefing-action briefing-action--quiet" onClick={onFinish}>
            Finalizar briefing
          </button>
          <button type="button" className="summary-story__reset" onClick={onReset}>Volver al panorama</button>
        </div>
      </div>
    </section>
  );
};
