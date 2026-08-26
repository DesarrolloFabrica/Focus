import React from 'react';
import { motion } from 'motion/react';
import { Check, MoreHorizontal } from 'lucide-react';
import { FocusPerspective } from '../../types/focus';
import { JourneyChapter } from './ImmersiveJourney';

type ExperiencePhase = 'arrival' | 'briefing' | 'complete' | 'investigation';

interface ImmersiveHeaderProps {
  phase: ExperiencePhase;
  perspective: FocusPerspective;
  chapters: JourneyChapter[];
  activeSection: string;
  onReset: () => void;
  onOpenDemo: () => void;
  embedded?: boolean;
}

const perspectiveLabels: Record<FocusPerspective, string> = {
  executive: 'Ejecutiva',
  coordination: 'Coordinación',
  analyst: 'Analista',
  personal: 'Personal',
};

export const ImmersiveHeader: React.FC<ImmersiveHeaderProps> = ({
  phase,
  perspective,
  chapters,
  activeSection,
  onReset,
  onOpenDemo,
  embedded = false,
}) => {
  const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === activeSection));
  const isJourney = phase === 'briefing' || phase === 'complete';
  const current = chapters[activeIndex];

  return (
    <motion.header
      id="focus-main-header"
      className={`iv-header ${isJourney ? 'is-journey' : ''} ${phase === 'complete' ? 'is-complete' : ''}${embedded ? ' is-embedded' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <button id="btn-brand-home" type="button" className="iv-brand" onClick={onReset} aria-label="Volver al inicio de FOCUS">
        <span className="iv-brand__mark"><i /><b>F</b></span>
        <span className="iv-brand__name">FOCUS</span>
        <span className="iv-brand__perspective">{perspectiveLabels[perspective]}</span>
      </button>

      {isJourney ? (
        <nav className="iv-progress" aria-label={`Progreso del briefing: ${activeIndex + 1} de ${chapters.length}`}>
          <div className="iv-progress__mobile">
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</span>
            <strong>{current?.shortLabel ?? 'Briefing'}</strong>
          </div>
          <ol>
            {chapters.map((chapter, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex || phase === 'complete';
              return (
                <li key={chapter.id} className={`${isActive ? 'is-active' : ''} ${isPast ? 'is-past' : ''}`}>
                  <span>{isPast ? <Check aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span>
                  <strong>{chapter.shortLabel}</strong>
                  {isActive && <motion.i layoutId="iv-progress-active" transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} />}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : (
        <div className="iv-header__status">
          <span />
          <strong>{phase === 'investigation' ? 'Deep Focus' : 'Briefing de hoy'}</strong>
        </div>
      )}

      <button
        id="btn-open-demo-settings"
        type="button"
        className="iv-header__menu"
        onClick={onOpenDemo}
        aria-label="Abrir escenarios de demostración"
      >
        <MoreHorizontal aria-hidden="true" />
      </button>
    </motion.header>
  );
};

export type { ExperiencePhase };
