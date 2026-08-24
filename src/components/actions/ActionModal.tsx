import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, AlertCircle, Clock, ArrowRight, UserCheck, Bell, ShieldAlert, Sparkles } from 'lucide-react';
import { KeyCase } from '../../types/focus';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: KeyCase[];
}

export const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, cases }) => {
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleExecuteAction = (caseId: string, actionName: string) => {
    setActiveActionId(caseId);
    setTimeout(() => {
      setFeedbackMessage(`Acción aplicada: «${actionName}». FOCUS actualizará el impacto en el próximo ciclo.`);
      setActiveActionId(null);
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3500);
    }, 450);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            id="focus-action-modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-16 md:top-20 max-w-2xl mx-auto bg-[#050A18] border border-blue-500/30 rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-[#040814]">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-rose-400 uppercase">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>CASOS PRIORITARIOS CONCENTRADOS</span>
              </div>
              <button
                id="btn-close-action-modal"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                  Elementos que concentran el retraso
                </h2>
                <p className="text-sm text-slate-300 font-light mt-1">
                  Atender estos dos elementos resolverá el 70% del desvío en el Punto de Validación B.
                </p>
              </div>

              {/* Toast Feedback notification if triggered */}
              <AnimatePresence>
                {feedbackMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-3 text-emerald-200 text-xs sm:text-sm font-medium"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feedbackMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cases List */}
              <div className="space-y-4">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-blue-500/40 space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-semibold text-blue-400 block uppercase">
                          {c.rootCausePoint}
                        </span>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          {c.name}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                        Score: {c.impactScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500 block">Responsable:</span>
                        <span className="text-slate-200 font-medium">{c.owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tiempo en espera:</span>
                        <span className="text-rose-300 font-semibold">{c.delayTime}</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleExecuteAction(c.id, 'Reasignación a Revisor Suplente')}
                        disabled={activeActionId === c.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/90 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reasignar suplente</span>
                      </button>

                      <button
                        onClick={() => handleExecuteAction(c.id, 'Recordatorio de Alta Prioridad')}
                        disabled={activeActionId === c.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notificar responsable</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-[#040814] flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
