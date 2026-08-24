import React from 'react';
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
  scenario,
  perspective,
  onResetToArrival,
  currentSection,
  isBriefingActive = false,
}) => {
  const perspectiveLabels: Record<FocusPerspective, string> = {
    executive: 'Perspectiva ejecutiva',
    coordination: 'Perspectiva coordinación',
    analyst: 'Perspectiva analista',
    personal: 'Perspectiva personal',
  };

  return (
    <header
      id="focus-main-header"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-4 sm:py-5 transition-all duration-500 ${
        isBriefingActive
          ? 'bg-[#030712]/75 backdrop-blur-[18px] border-b border-white/[0.04]'
          : 'bg-transparent'
      }`}
    >
      {/* Left: ✦ FOCUS brand logo + Perspective */}
      <button
        id="btn-brand-home"
        onClick={onResetToArrival}
        className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded-lg p-1 -ml-1"
      >
        <span className="text-blue-400 text-xl font-bold tracking-tight transition-transform duration-300 group-hover:scale-110">
          ✦
        </span>
        <span className="text-white font-bold tracking-[0.2em] text-sm sm:text-base font-['Outfit',sans-serif]">
          FOCUS
        </span>
        <span className="hidden sm:inline-block pl-2 border-l border-white/[0.08] text-xs font-light text-slate-400">
          {perspectiveLabels[perspective]}
        </span>
      </button>

      {/* Right: Status indicator + Demo controls */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-light">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Briefing de hoy</span>
        </div>

        {/* Demo configuration button (···) */}
        <button
          id="btn-open-demo-settings"
          onClick={onOpenDemoMenu}
          aria-label="Abrir controles de demostración"
          className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
          title="Modo Demostración y Escenarios"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
