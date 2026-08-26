import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  stepLabel?: string;
  isVisible: boolean;
  isComplete?: boolean;
  onSelectStep?: (stepIndex: number) => void;
  embedded?: boolean;
}

export const briefingSteps = [
  { id: 'panorama', num: '00', name: 'Panorama', shortLabel: 'Panorama' },
  { id: 'priority', num: '01', name: 'Prioridad', shortLabel: 'Prioridad' },
  { id: 'why', num: '02', name: 'Por qué', shortLabel: 'Por qué' },
  { id: 'changes', num: '03', name: 'Cambios', shortLabel: 'Cambios' },
  { id: 'anomaly', num: '04', name: 'Anomalía', shortLabel: 'Anomalía' },
  { id: 'stability', num: '05', name: 'Cobertura', shortLabel: 'Cobertura' },
  { id: 'summary', num: '06', name: 'Síntesis', shortLabel: 'Síntesis' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  stepLabel,
  isVisible,
  isComplete = false,
  onSelectStep,
  embedded = false,
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.nav
        id="focus-progress-container"
        className={`iv-progress-bar${embedded ? ' is-embedded' : ''}${isComplete ? ' is-navigable' : ''}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-label={`Progreso del briefing: capítulo ${currentStep + 1} de ${briefingSteps.length}, ${stepLabel ?? ''}`}
      >
        <div className="iv-progress">
          <div className={`iv-progress__mobile${isComplete ? ' is-navigable' : ''}`}>
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
            <span>{String(currentStep + 1).padStart(2, '0')} / {String(briefingSteps.length).padStart(2, '0')}</span>
            <strong>{briefingSteps[currentStep]?.shortLabel ?? 'Briefing'}</strong>
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
          <ol>
            {briefingSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep || isComplete;
              const content = (
                <>
                  <span>{isPast && !isActive ? <Check aria-hidden="true" /> : step.num}</span>
                  <strong>{step.shortLabel}</strong>
                  {isActive && (
                    <motion.i
                      layoutId="iv-progress-active"
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </>
              );

              return (
                <li
                  key={step.id}
                  className={`${isActive ? 'is-active' : ''} ${isPast ? 'is-past' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete && onSelectStep ? (
                    <button type="button" onClick={() => onSelectStep(index)} aria-label={`Ir a ${step.name}`}>
                      {content}
                    </button>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </motion.nav>
    )}
  </AnimatePresence>
);
