import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  stepLabel?: string;
  isVisible: boolean;
  isComplete?: boolean;
  onSelectStep?: (stepIndex: number) => void;
}

export const briefingSteps = [
  { id: 'panorama', num: '00', name: 'Panorama' },
  { id: 'priority', num: '01', name: 'Prioridad' },
  { id: 'why', num: '02', name: 'Por qué' },
  { id: 'changes', num: '03', name: 'Cambios' },
  { id: 'anomaly', num: '04', name: 'Anomalía' },
  { id: 'stability', num: '05', name: 'Cobertura' },
  { id: 'summary', num: '06', name: 'Síntesis' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  stepLabel,
  isVisible,
  isComplete = false,
  onSelectStep,
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.nav
        id="focus-progress-container"
        className={`focus-section-nav fixed z-[55] ${isComplete ? 'is-navigable' : 'pointer-events-none'}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-label={`Progreso del briefing: capítulo ${currentStep + 1} de ${briefingSteps.length}, ${stepLabel ?? ''}`}
      >
        <div className={`focus-section-nav__mobile ${isComplete ? 'is-navigable' : ''}`}>
          {isComplete && onSelectStep && (
            <button
              type="button"
              onClick={() => onSelectStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              aria-label="Ir al capítulo anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
          )}
          <span className="focus-section-nav__mobile-label">
            <span>{String(currentStep + 1).padStart(2, '0')} / {String(briefingSteps.length).padStart(2, '0')}</span>
            <strong>{briefingSteps[currentStep]?.name ?? 'Briefing'}</strong>
          </span>
          {isComplete && onSelectStep && (
            <button
              type="button"
              onClick={() => onSelectStep(Math.min(briefingSteps.length - 1, currentStep + 1))}
              disabled={currentStep === briefingSteps.length - 1}
              aria-label="Ir al capítulo siguiente"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          )}
        </div>
        <ol className="focus-section-nav__items">
          {briefingSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep || isComplete;
            const content = (
              <>
                <span>{isCompleted && !isActive ? <Check aria-hidden="true" /> : step.num}</span>
                <strong>{step.name}</strong>
                {isActive && <motion.i layoutId="focus-active-section" transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }} />}
              </>
            );

            return (
              <li key={step.id} className={`focus-section-nav__item ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-complete' : ''}`} aria-current={isActive ? 'step' : undefined}>
                {isComplete && onSelectStep ? (
                  <button type="button" onClick={() => onSelectStep(index)} aria-label={`Ir a ${step.name}`}>{content}</button>
                ) : content}
              </li>
            );
          })}
        </ol>
      </motion.nav>
    )}
  </AnimatePresence>
);
