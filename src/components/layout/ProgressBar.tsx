import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  isVisible: boolean;
}

const steps = [
  { num: '01', name: 'Prioridad' },
  { num: '02', name: 'Por qué' },
  { num: '03', name: 'Qué cambió' },
  { num: '04', name: 'Anomalías' },
  { num: '05', name: 'Estabilidad' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps = 5, stepLabel, isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.nav
      id="focus-progress-container"
      className="focus-section-nav pointer-events-none fixed z-[55]"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`Capítulo ${Math.min(currentStep, totalSteps)} de ${totalSteps}: ${stepLabel || ''}`}
    >
      <ol className="focus-section-nav__items">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const isActive = stepIndex === currentStep;
          const isCompleted = stepIndex < currentStep;
          return (
            <li
              key={step.num}
              className={`focus-section-nav__item ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-complete' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span>{step.num}</span>
              <strong>{step.name}</strong>
              {isActive && <motion.i layoutId="focus-active-section" transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }} />}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
};
