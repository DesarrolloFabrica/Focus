import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  isVisible: boolean;
  onSelectStep?: (stepIndex: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps = 5,
  stepLabel,
  isVisible,
  onSelectStep,
}) => {
  if (!isVisible) return null;

  const steps = [
    { num: '01', name: 'Prioridad' },
    { num: '02', name: 'Por qué' },
    { num: '03', name: 'Cambios' },
    { num: '04', name: 'Anomalía' },
    { num: '05', name: 'Estabilidad' },
  ];

  return (
    <motion.div
      id="focus-progress-container"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="fixed top-16 left-0 right-0 z-40 px-6 sm:px-12 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-2">
        {/* Minimal linear step indicator: 01 ━━━━━ 02 ━━━━━ 03 ━━━━━ 04 ━━━━━ 05 */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {steps.map((step, idx) => {
            const stepIndex = idx + 1;
            const isActive = stepIndex === currentStep;
            const isCompleted = stepIndex < currentStep;

            return (
              <React.Fragment key={step.num}>
                <button
                  onClick={() => onSelectStep && onSelectStep(stepIndex)}
                  className={`flex items-center gap-1.5 text-[11px] font-mono transition-all duration-300 ${
                    isActive
                      ? 'text-white font-semibold'
                      : isCompleted
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-400 scale-125 shadow-[0_0_8px_#60A5FA]'
                        : isCompleted
                        ? 'bg-blue-600/70'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span>{step.num}</span>
                  {isActive && (
                    <span className="hidden md:inline font-sans text-xs text-slate-300 font-light ml-0.5">
                      · {step.name}
                    </span>
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div className="w-4 sm:w-8 h-[1px] bg-slate-800 relative overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500/80 shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: stepIndex < currentStep ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current contextual chapter label on right */}
        {stepLabel && (
          <div className="text-[11px] font-mono tracking-wider uppercase text-slate-500 font-light hidden lg:block">
            {stepLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
};
