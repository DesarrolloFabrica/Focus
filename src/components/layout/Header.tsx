import React from 'react';
import { motion } from 'motion/react';
import { MoreHorizontal } from 'lucide-react';
import { FocusPerspective, FocusScenario } from '../../types/focus';

interface HeaderProps {
  onOpenDemoMenu: () => void;
  scenario: FocusScenario;
  perspective: FocusPerspective;
  onResetToArrival: () => void;
  currentSection?: string;
  isBriefingActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemoMenu,
  perspective,
  onResetToArrival,
  isBriefingActive = false,
}) => {
  const perspectiveLabels: Record<FocusPerspective, string> = {
    executive: 'Perspectiva ejecutiva',
    coordination: 'Perspectiva coordinación',
    analyst: 'Perspectiva analista',
    personal: 'Perspectiva personal',
  };

  return (
    <motion.header
      id="focus-main-header"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b px-5 transition-all duration-500 sm:px-10 lg:px-12 ${
        isBriefingActive
          ? 'border-white/[0.055] bg-[#020611]/80 backdrop-blur-[18px]'
          : 'border-white/[0.025] bg-[#020611]/38 backdrop-blur-[9px]'
      }`}
    >
      <button
        id="btn-brand-home"
        onClick={onResetToArrival}
        className="group -ml-1 flex items-center gap-3 rounded-lg p-1 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
      >
        <span className="bg-gradient-to-br from-sky-300 via-blue-400 to-violet-500 bg-clip-text text-xl font-bold tracking-tight text-transparent transition-transform duration-300 group-hover:scale-110">
          ✦
        </span>
        <span className="font-['Segoe_UI',sans-serif] text-sm font-semibold tracking-[0.34em] text-white sm:text-[15px]">
          FOCUS
        </span>
        <span className="ml-2 hidden rounded-full border border-white/[0.08] bg-slate-950/25 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.06em] text-slate-500 sm:inline-block">
          {perspectiveLabels[perspective]}
        </span>
      </button>

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-2 text-[11px] font-light text-slate-400 sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.75)]" />
          <span>Briefing de hoy</span>
        </div>

        <button
          id="btn-open-demo-settings"
          onClick={onOpenDemoMenu}
          aria-label="Abrir controles de demostración"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-slate-950/25 text-slate-400 transition-all duration-200 hover:border-white/[0.14] hover:bg-slate-900/70 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
          title="Modo Demostración y Escenarios"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </motion.header>
  );
};
