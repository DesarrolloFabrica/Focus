import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { getFocusBriefing } from '../../data/mockData';
import { FocusPerspective, FocusScenario } from '../../types/focus';
import { ActionModal } from '../actions/ActionModal';
import { AskPanel } from '../ask/AskPanel';
import { NarrativeTransition } from '../briefing/NarrativeTransition';
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
  'briefing-panorama-gate',
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
  const scrollRootRef = useRef<HTMLElement | null>(null);

  const briefing = useMemo(() => getFocusBriefing(perspective, scenario), [perspective, scenario]);
  const isBriefingVisible = phase === 'briefing' || phase === 'complete';
  const explorationIsUnlocked = phase === 'complete' || phase === 'investigation';

  const getScrollRoot = () => document.getElementById('iv-intro-scroll');

  const scrollTo = (id: string, delay = 0) => {
    window.setTimeout(() => {
      const target = document.getElementById(id);
      const root = getScrollRoot();
      if (!target || !root) return;

      const rootRect = root.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const top = root.scrollTop + (targetRect.top - rootRect.top) - 8;
      root.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
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

    const mountDelay = reduceMotion ? 20 : 320;
    const finishDelay = reduceMotion ? 80 : 720;

    window.setTimeout(() => {
      setPhase('briefing');
      setActiveStep(0);
    }, mountDelay);

    window.setTimeout(() => {
      getScrollRoot()?.scrollTo({ top: 0, behavior: 'auto' });
      setIsStartingTransition(false);
    }, finishDelay);
  };

  const handleReset = () => {
    closeOverlays();
    setPhase('arrival');
    setActiveStep(0);
    setIsStartingTransition(false);
    window.setTimeout(() => {
      getScrollRoot()?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }, 40);
  };

  const resetWithDataChange = (nextScenario: FocusScenario, nextPerspective: FocusPerspective) => {
    setScenario(nextScenario);
    setPerspective(nextPerspective);
    setPhase('arrival');
    setActiveStep(0);
    closeOverlays();
    getScrollRoot()?.scrollTo({ top: 0, behavior: 'auto' });
  };

  useEffect(() => {
    if (!isBriefingVisible) return;

    const root = getScrollRoot();
    if (!root) return;

    scrollRootRef.current = root;
    let frameId = 0;

    const syncActiveChapter = () => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
      if (!sections.length) return;

      const rootRect = root.getBoundingClientRect();
      const focusY = rootRect.top + rootRect.height * 0.34;

      let bestChapter: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom <= rootRect.top + 12 || rect.top >= rootRect.bottom - 12) return;

        const anchorY = rect.top + Math.min(rect.height * 0.28, 120);
        const distance = Math.abs(anchorY - focusY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestChapter = section.dataset.chapter ?? null;
        }
      });

      if (!bestChapter) return;

      const index = briefingSteps.findIndex((step) => step.id === bestChapter);
      if (index < 0) return;

      setActiveStep(index);
      if (bestChapter === 'summary') {
        setPhase((current) => (current === 'briefing' ? 'complete' : current));
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(syncActiveChapter);
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    window.requestAnimationFrame(syncActiveChapter);

    return () => {
      root.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameId);
    };
  }, [isBriefingVisible]);

  return (
    <div id="focus-app-root" className={`focus-experience iv-app phase-${phase}${isStartingTransition ? ' is-transitioning' : ''}`}>
      <div className="focus-atmosphere" data-active-chapter={briefingSteps[activeStep]?.id ?? 'panorama'} aria-hidden="true" />

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
          <ArrivalSection
            briefing={briefing}
            onStartBriefing={handleStartBriefing}
            isStartingTransition={isStartingTransition}
            isBriefingActive={isBriefingVisible}
            onOpenDemo={() => setIsDemoMenuOpen(true)}
            header={
              isBriefingVisible ? (
                <div className="iv-briefing-chrome">
                  <Header
                    onOpenDemoMenu={() => setIsDemoMenuOpen(true)}
                    scenario={scenario}
                    perspective={perspective}
                    onResetToArrival={handleReset}
                    currentSection={briefingSteps[activeStep]?.name}
                    isBriefingActive
                    embedded
                  />
                  <ProgressBar
                    currentStep={activeStep}
                    stepLabel={briefingSteps[activeStep]?.name}
                    isVisible
                    isComplete={phase === 'complete'}
                    onSelectStep={handleSelectChapter}
                    embedded
                  />
                </div>
              ) : null
            }
          >
            {isBriefingVisible ? (
              <>
                <PrioritySection priority={briefing.mainPriority} onContinue={() => scrollTo('section-chapter-why')} />

                <WhyItMattersSection
                  signals={briefing.signals}
                  conclusion={briefing.mainPriority.explanation.summaryText}
                  onContinue={() => scrollTo('transition-to-changes')}
                />

                <NarrativeTransition
                  id="transition-to-changes"
                  firstLine="Pero saber qué importa no es suficiente."
                  secondLine="También necesitas saber qué cambió."
                  variant="timeline"
                />

                <WhatChangedSection changes={briefing.changes} onContinue={() => scrollTo('transition-to-anomaly')} />

                <NarrativeTransition
                  id="transition-to-anomaly"
                  firstLine="Entre lo que cambió, una señal se comporta distinto."
                  secondLine="Eso merece una mirada aparte."
                  variant="anomaly-bridge"
                />

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
              </>
            ) : null}
          </ArrivalSection>
        )}
      </main>

      {explorationIsUnlocked && (
        <AskPanel
          isOpen={isAskPanelOpen}
          onClose={() => setIsAskPanelOpen(false)}
          onSelectAction={(action) => action === 'focus_cases' && setIsActionModalOpen(true)}
        />
      )}
      {phase === 'investigation' && (
        <WhyDrawer
          isOpen={isWhyDrawerOpen}
          onClose={() => setIsWhyDrawerOpen(false)}
          explanation={briefing.mainPriority.explanation}
          priorityTitle={briefing.mainPriority.title}
        />
      )}
      {explorationIsUnlocked && (
        <ActionModal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} cases={briefing.mainPriority.keyCases} />
      )}

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
