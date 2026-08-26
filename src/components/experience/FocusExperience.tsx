import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getFocusBriefing } from '../../data/mockData';
import { FocusPerspective, FocusScenario } from '../../types/focus';
import { ActionModal } from '../actions/ActionModal';
import { AskPanel } from '../ask/AskPanel';
import { NarrativeTransition } from '../briefing/NarrativeTransition';
import { FocusCore } from '../core/FocusCore';
import { DemoMenu } from '../demo/DemoMenu';
import { InvestigationView } from '../investigation/InvestigationView';
import { Header } from '../layout/Header';
import { briefingSteps, ProgressBar } from '../layout/ProgressBar';
import { AnomalySection } from '../sections/AnomalySection';
import { ArrivalSection } from '../sections/ArrivalSection';
import { CompleteSection } from '../sections/CompleteSection';
import { PrioritySection } from '../sections/PrioritySection';
import { StableSection } from '../sections/StableSection';
import { WhatChangedSection } from '../sections/WhatChangedSection';
import { WhyItMattersSection } from '../sections/WhyItMattersSection';
import { WhyDrawer } from '../why/WhyDrawer';

type ExperiencePhase = 'arrival' | 'briefing' | 'complete' | 'investigation';

const chapterTargets = [
  'focus-arrival-view',
  'section-chapter-priority',
  'section-chapter-why',
  'section-chapter-changes',
  'section-chapter-anomaly',
  'section-chapter-stability',
  'section-chapter-complete',
];

export const FocusExperience: React.FC = () => {
  const [scenario, setScenario] = useState<FocusScenario>('attention');
  const [perspective, setPerspective] = useState<FocusPerspective>('executive');
  const [phase, setPhase] = useState<ExperiencePhase>('arrival');
  const [activeStep, setActiveStep] = useState(0);
  const [isStartingTransition, setIsStartingTransition] = useState(false);
  const [isAskPanelOpen, setIsAskPanelOpen] = useState(false);
  const [isWhyDrawerOpen, setIsWhyDrawerOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const reduceMotion = !!useReducedMotion();

  const briefing = useMemo(() => getFocusBriefing(perspective, scenario), [perspective, scenario]);
  const isBriefingVisible = phase === 'briefing' || phase === 'complete';
  const explorationIsUnlocked = phase === 'complete' || phase === 'investigation';

  const scrollTo = (id: string, delay = 0) => {
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }, delay);
  };

  const handleSelectChapter = (index: number) => {
    setActiveStep(index);
    scrollTo(chapterTargets[index]);
  };

  const closeOverlays = () => {
    setIsAskPanelOpen(false);
    setIsWhyDrawerOpen(false);
    setIsActionModalOpen(false);
  };

  const handleStartBriefing = () => {
    if (phase !== 'arrival' || isStartingTransition) return;
    setIsStartingTransition(true);

    const mountDelay = reduceMotion ? 20 : 460;
    const scrollDelay = reduceMotion ? 30 : 610;
    const finishDelay = reduceMotion ? 80 : 940;

    window.setTimeout(() => {
      setPhase('briefing');
      setActiveStep(1);
    }, mountDelay);
    scrollTo('section-chapter-priority', scrollDelay);
    window.setTimeout(() => setIsStartingTransition(false), finishDelay);
  };

  const handleReset = () => {
    closeOverlays();
    setPhase('arrival');
    setActiveStep(0);
    setIsStartingTransition(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const resetWithDataChange = (nextScenario: FocusScenario, nextPerspective: FocusPerspective) => {
    setScenario(nextScenario);
    setPerspective(nextPerspective);
    setPhase('arrival');
    setActiveStep(0);
    closeOverlays();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  useEffect(() => {
    if (!isBriefingVisible) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const chapter = (visible.target as HTMLElement).dataset.chapter;
        const index = briefingSteps.findIndex((step) => step.id === chapter);
        if (index < 0) return;
        setActiveStep(index);
        if (chapter === 'summary') setPhase((current) => current === 'briefing' ? 'complete' : current);
      },
      { threshold: [0.08, 0.18, 0.32], rootMargin: '-18% 0px -38% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isBriefingVisible]);

  return (
    <div id="focus-app-root" className={`focus-experience phase-${phase}${isStartingTransition ? ' is-transitioning' : ''}`}>
      <div className="focus-atmosphere" data-active-chapter={briefingSteps[activeStep]?.id ?? 'panorama'} aria-hidden="true" />

      {phase !== 'investigation' && (
        <Header
          onOpenDemoMenu={() => setIsDemoMenuOpen(true)}
          scenario={scenario}
          perspective={perspective}
          onResetToArrival={handleReset}
          currentSection={briefingSteps[activeStep]?.name}
          isBriefingActive={isBriefingVisible}
        />
      )}

      <ProgressBar
        currentStep={activeStep}
        stepLabel={briefingSteps[activeStep]?.name}
        isVisible={isBriefingVisible}
        isComplete={phase === 'complete'}
        onSelectStep={handleSelectChapter}
      />

      <main>
        {phase === 'investigation' ? (
          <InvestigationView
            briefing={briefing}
            onBackToBriefing={() => {
              setPhase('complete');
              scrollTo('section-chapter-complete', 40);
            }}
            onOpenWhy={() => setIsWhyDrawerOpen(true)}
            onOpenAsk={() => setIsAskPanelOpen(true)}
            onOpenActionModal={() => setIsActionModalOpen(true)}
          />
        ) : (
          <>
            <ArrivalSection briefing={briefing} onStartBriefing={handleStartBriefing} isStartingTransition={isStartingTransition} />

            {isBriefingVisible && (
              <div className="focus-narrative" aria-label="Briefing guiado de FOCUS">
                <PrioritySection priority={briefing.mainPriority} onContinue={() => scrollTo('transition-explainability')} />

                <NarrativeTransition
                  id="transition-explainability"
                  eyebrow="FOCUS / EXPLICABILIDAD"
                  firstLine="Un dato aislado no convierte algo en prioridad."
                  secondLine="Es la coincidencia entre varias señales."
                  variant="converge"
                />

                <WhyItMattersSection signals={briefing.signals} conclusion={briefing.mainPriority.explanation.summaryText} onContinue={() => scrollTo('transition-to-changes')} />

                <NarrativeTransition
                  id="transition-to-changes"
                  firstLine="Pero saber qué importa no es suficiente."
                  secondLine="También necesitas saber qué cambió."
                  variant="timeline"
                />

                <WhatChangedSection changes={briefing.changes} onContinue={() => scrollTo('section-chapter-anomaly')} />
                <AnomalySection anomaly={briefing.anomaly} onContinue={() => scrollTo('transition-to-coverage')} />

                <NarrativeTransition
                  id="transition-to-coverage"
                  firstLine="Ya revisamos lo que requiere atención."
                  secondLine="Ahora, veamos lo que está bien."
                  variant="calm"
                />

                <StableSection entities={briefing.entities} onContinue={() => scrollTo('transition-to-summary')} />

                <NarrativeTransition
                  id="transition-to-summary"
                  firstLine="Prioridad, cambios, anomalía y cobertura."
                  secondLine="Todo vuelve a una sola lectura."
                  variant="synthesis"
                />

                <CompleteSection
                  briefing={briefing}
                  onInvestigate={() => {
                    setPhase('investigation');
                    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
                  }}
                  onFinish={handleReset}
                  onReset={handleReset}
                />
              </div>
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {isStartingTransition && (
          <motion.div className="focus-briefing-transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.24 }} aria-live="polite">
            <div className="focus-briefing-transition__iris" aria-hidden="true"><FocusCore size="medium" state="explaining" variant="particle" markStyle="letter" /></div>
            <div className="focus-briefing-transition__beam" aria-hidden="true" />
            <div className="focus-briefing-transition__copy"><span>01 · PRIORIDAD</span><strong>Preparando tu briefing</strong><i><b /><b /><b /><b /><b /></i></div>
          </motion.div>
        )}
      </AnimatePresence>

      {explorationIsUnlocked && <AskPanel isOpen={isAskPanelOpen} onClose={() => setIsAskPanelOpen(false)} onSelectAction={(action) => action === 'focus_cases' && setIsActionModalOpen(true)} />}
      {phase === 'investigation' && <WhyDrawer isOpen={isWhyDrawerOpen} onClose={() => setIsWhyDrawerOpen(false)} explanation={briefing.mainPriority.explanation} priorityTitle={briefing.mainPriority.title} />}
      {explorationIsUnlocked && <ActionModal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} cases={briefing.mainPriority.keyCases} />}

      <DemoMenu
        isOpen={isDemoMenuOpen}
        onClose={() => setIsDemoMenuOpen(false)}
        currentScenario={scenario}
        onSelectScenario={(nextScenario) => resetWithDataChange(nextScenario, perspective)}
        currentPerspective={perspective}
        onSelectPerspective={(nextPerspective) => resetWithDataChange(scenario, nextPerspective)}
      />
    </div>
  );
};
