import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

type NarrativeTransitionVariant = 'converge' | 'timeline' | 'calm' | 'synthesis' | 'anomaly-bridge';

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
    <section
      id={id}
      className={`iv-narrative-bridge iv-narrative-bridge--${variant}`}
      aria-label={`${firstLine} ${secondLine}`}
    >
      <div className="iv-shell iv-narrative-bridge__inner">
        {eyebrow && <span className="iv-narrative-bridge__eyebrow">{eyebrow}</span>}
        <motion.p
          initial={reduce ? false : { opacity: 0.25, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduce ? 0.01 : 0.55 }}
        >
          {firstLine}
        </motion.p>
        <motion.strong
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduce ? 0.01 : 0.6, delay: reduce ? 0 : 0.1 }}
        >
          {secondLine}
        </motion.strong>

        <div className="iv-narrative-bridge__visual" aria-hidden="true">
          {variant === 'timeline' && (
            <motion.i
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : 1.05, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          {variant === 'anomaly-bridge' && <span><b /><b /><b /></span>}
          {variant === 'calm' && <span className="is-calm"><i /><i /><i /></span>}
          {variant === 'synthesis' && (
            <span className="is-synthesis">
              <i>Prioridad</i><i>Cambios</i><i>Anomalía</i><i>Cobertura</i><b />
            </span>
          )}
          {variant === 'converge' && <span className="is-converge"><i /><i /><i /><i /><b /></span>}
        </div>
      </div>
    </section>
  );
};
