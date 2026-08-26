import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

type NarrativeTransitionVariant = 'converge' | 'timeline' | 'calm' | 'synthesis';

interface NarrativeTransitionProps {
  id: string;
  eyebrow?: string;
  firstLine: string;
  secondLine: string;
  variant: NarrativeTransitionVariant;
}

export const NarrativeTransition: React.FC<NarrativeTransitionProps> = ({
  id,
  eyebrow,
  firstLine,
  secondLine,
  variant,
}) => {
  const reduce = !!useReducedMotion();

  return (
    <section id={id} className={`narrative-transition narrative-transition--${variant}`} aria-label={`${firstLine} ${secondLine}`}>
      <div className="narrative-transition__inner">
        {eyebrow && <span className="narrative-transition__eyebrow">{eyebrow}</span>}
        <motion.p
          initial={reduce ? false : { opacity: 0.2, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.65 }}
          transition={{ duration: reduce ? 0.01 : 0.6 }}
        >
          {firstLine}
        </motion.p>
        <motion.strong
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduce ? 0.01 : 0.65, delay: reduce ? 0 : 0.12 }}
        >
          {secondLine}
        </motion.strong>

        <div className="narrative-transition__visual" aria-hidden="true">
          {variant === 'converge' && (
            <>
              <i /><i /><i /><i />
              <b />
            </>
          )}
          {variant === 'timeline' && <span><i /><b /><i /></span>}
          {variant === 'calm' && <span><i /><i /><i /></span>}
          {variant === 'synthesis' && (
            <span className="narrative-transition__signals">
              <i>Prioridad</i><i>Cambios</i><i>Anomalía</i><i>Cobertura</i><b />
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
