import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, X } from 'lucide-react';
import { FocusBriefing } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface CompleteSectionProps {
  briefing: FocusBriefing;
  onGoToPriority: () => void;
  onCloseFocus: () => void;
}

export const CompleteSection: React.FC<CompleteSectionProps> = ({ briefing, onGoToPriority, onCloseFocus }) => {
  const coreRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const coreIsVisible = useInView(coreRef, { once: true, amount: 0.35 });

  return (
    <section id="section-chapter-complete" className="briefing-chapter briefing-chapter--complete">
      <div className="complete-field" ref={coreRef}>
        <div className="complete-field__particles" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <motion.i
              key={index}
              style={{ '--i': index } as React.CSSProperties}
              initial={reduce ? false : { opacity: 0, scale: 0.35 }}
              animate={coreIsVisible ? { opacity: [0, 0.75, 0], scale: [0.35, 1, 0.2] } : { opacity: 0 }}
              transition={{ duration: reduce ? 0.1 : 1.25, delay: reduce ? 0 : index * 0.035 }}
            />
          ))}
        </div>
        <motion.div
          className="complete-field__core"
          initial={reduce ? false : { opacity: 0, scale: 0.58 }}
          animate={coreIsVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.58 }}
          transition={{ duration: reduce ? 0.1 : 1.05, delay: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {coreIsVisible && <FocusCore size="large" state="complete" variant="particle" />}
        </motion.div>
      </div>

      <motion.div
        className="complete-copy"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <span className="complete-badge"><Check aria-hidden="true" /> Briefing completado</span>
        <h2>Ya estás al día.</h2>
        <p>
          De toda tu operación, solo <strong>{briefing.detectedCount} asuntos</strong> necesitaron tu atención.
          El resto permanece estable.
        </p>
        <small>Tiempo de lectura guiada · {briefing.completionTime}</small>

        <div className="briefing-actions briefing-actions--centered">
          <button id="btn-complete-to-priority" className="briefing-action briefing-action--primary" onClick={onGoToPriority}>
            Investigar prioridad <ArrowRight aria-hidden="true" />
          </button>
          <button id="btn-complete-close" className="briefing-action briefing-action--quiet" onClick={onCloseFocus}>
            <X aria-hidden="true" /> Cerrar Focus
          </button>
        </div>
      </motion.div>
    </section>
  );
};
