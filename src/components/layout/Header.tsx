import React from 'react';
import { motion } from 'motion/react';
import { MoreHorizontal } from 'lucide-react';
import { FocusPerspective } from '../../types/focus';

interface HeaderProps {
  onOpenDemoMenu: () => void;
  perspective: FocusPerspective;
  onResetToArrival: () => void;
  isBriefingActive?: boolean;
  embedded?: boolean;
  scenario?: string;
  currentSection?: string;
}

const perspectiveLabels: Record<FocusPerspective, string> = {
  executive: 'Ejecutiva',
  coordination: 'Coordinación',
  analyst: 'Analista',
  personal: 'Personal',
};

export const Header: React.FC<HeaderProps> = ({
  onOpenDemoMenu,
  perspective,
  onResetToArrival,
  isBriefingActive = false,
  embedded = false,
}) => (
  <motion.header
    id="focus-main-header"
    className={`iv-header${isBriefingActive ? ' is-journey' : ''}${embedded ? ' is-embedded' : ''}`}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    <button
      id="btn-brand-home"
      type="button"
      className="iv-brand"
      onClick={onResetToArrival}
      aria-label="Volver al inicio de FOCUS"
    >
      <span className="iv-brand__mark">
        <i />
        <b>F</b>
      </span>
      <span className="iv-brand__name">FOCUS</span>
      <span className="iv-brand__perspective">{perspectiveLabels[perspective]}</span>
    </button>

    <div aria-hidden="true" />

    <button
      id="btn-open-demo-settings"
      type="button"
      className="iv-header__menu"
      onClick={onOpenDemoMenu}
      aria-label="Abrir escenarios de demostración"
    >
      <MoreHorizontal aria-hidden="true" />
    </button>
  </motion.header>
);
