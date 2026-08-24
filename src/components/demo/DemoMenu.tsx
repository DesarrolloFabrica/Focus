import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal, Check, User, Activity, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { FocusPerspective, FocusScenario } from '../../types/focus';

interface DemoMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenario: FocusScenario;
  onSelectScenario: (scenario: FocusScenario) => void;
  currentPerspective: FocusPerspective;
  onSelectPerspective: (perspective: FocusPerspective) => void;
}

export const DemoMenu: React.FC<DemoMenuProps> = ({
  isOpen,
  onClose,
  currentScenario,
  onSelectScenario,
  currentPerspective,
  onSelectPerspective,
}) => {
  const scenarios: { id: FocusScenario; label: string; desc: string; icon: any }[] = [
    {
      id: 'attention',
      label: 'Requiere atención',
      desc: 'Escenario canónico: 3 asuntos prioritarios, 1 anomalía, 4 cambios.',
      icon: Activity,
    },
    {
      id: 'stable',
      label: 'Todo estable',
      desc: '«El silencio es información»: 0 alertas, operación en parámetros óptimos.',
      icon: ShieldCheck,
    },
    {
      id: 'high_activity',
      label: 'Alta actividad',
      desc: 'Pico de contingencia: 5 prioridades, 12 cambios recientes.',
      icon: Zap,
    },
  ];

  const perspectives: { id: FocusPerspective; label: string; roleDesc: string }[] = [
    {
      id: 'executive',
      label: 'Ejecutiva',
      roleDesc: 'Director de Operaciones · Qué requiere atención global e impacto de negocio.',
    },
    {
      id: 'coordination',
      label: 'Coordinación',
      roleDesc: 'Líder de Equipo · Cuellos de botella y balanceo de asignaciones.',
    },
    {
      id: 'analyst',
      label: 'Analista',
      roleDesc: 'Especialista de Calidad · Casos específicos y trazabilidad técnica.',
    },
    {
      id: 'personal',
      label: 'Personal',
      roleDesc: 'Mi espacio de trabajo · Asuntos bajo mi alcance directo de firma.',
    },
  ];

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

          {/* Centered Modal */}
          <motion.div
            id="focus-demo-menu-modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-16 md:top-24 max-w-xl mx-auto bg-[#070D1F] border border-blue-500/30 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-[#050916]">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-blue-400 uppercase">
                <SlidersHorizontal className="w-4 h-4" />
                <span>MODO DEMOSTRACIÓN CONCEPTUAL</span>
              </div>
              <button
                id="btn-close-demo-modal"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Scenario Selector */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400 block">
                  1. SELECCIONAR ESCENARIO OPERACIONAL
                </span>
                <div className="space-y-2">
                  {scenarios.map((s) => {
                    const Icon = s.icon;
                    const isSelected = currentScenario === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelectScenario(s.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-blue-950/50 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-slate-900/50 border-white/[0.06] text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold block">{s.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                          </div>
                          <p className="text-xs text-slate-400 font-light mt-0.5">{s.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Perspective Selector */}
              <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400 block">
                  2. PERSPECTIVA DE ROL
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {perspectives.map((p) => {
                    const isSelected = currentPerspective === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectPerspective(p.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-950/50 border-blue-500 text-white shadow-md'
                            : 'bg-slate-900/50 border-white/[0.06] text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                            {p.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <p className="text-xs text-slate-400 font-light leading-snug">{p.roleDesc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-[#050916] flex justify-between items-center">
              <span className="text-xs text-slate-500 font-light">
                Los cambios se aplican de forma instantánea.
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
              >
                Aplicar y cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
