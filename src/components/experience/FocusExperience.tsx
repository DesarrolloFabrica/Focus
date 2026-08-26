import React, { useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { getFocusBriefing } from '../../data/mockData';
import { FocusPerspective, FocusScenario } from '../../types/focus';
import { ActionModal } from '../actions/ActionModal';
import { AskPanel } from '../ask/AskPanel';
import { DemoMenu } from '../demo/DemoMenu';
import { InvestigationView } from '../investigation/InvestigationView';
import { WhyDrawer } from '../why/WhyDrawer';
import { ExperiencePhase, ImmersiveHeader } from './ImmersiveHeader';
import { ImmersiveJourney, getJourneyChapters } from './ImmersiveJourney';
import { ImmersiveLanding } from './ImmersiveLanding';

export const FocusExperience: React.FC = () => {
  const [scenario, setScenario] = useState<FocusScenario>('attention');
  const [perspective, setPerspective] = useState<FocusPerspective>('executive');
  const [phase, setPhase] = useState<ExperiencePhase>('arrival');
  const [activeSection, setActiveSection] = useState('panorama');
  const [isStartingTransition, setIsStartingTransition] = useState(false);
  const [isAskPanelOpen, setIsAskPanelOpen] = useState(false);
  const [isWhyDrawerOpen, setIsWhyDrawerOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const reduceMotion = !!useReducedMotion();

  const briefing = useMemo(() => getFocusBriefing(perspective, scenario), [perspective, scenario]);
  const chapters = useMemo(() => getJourneyChapters(briefing), [briefing]);
  const briefingIsAvailable = phase === 'briefing' || phase === 'complete';
  const explorationIsUnlocked = phase === 'complete' || phase === 'investigation';

  const closeOverlays = () => {
    setIsAskPanelOpen(false);
    setIsWhyDrawerOpen(false);
    setIsActionModalOpen(false);
  };

  const handleStartBriefing = () => {
    if (isStartingTransition || phase !== 'arrival') return;
    setIsStartingTransition(true);

    const foldDelay = reduceMotion ? 30 : 260;
    const finishDelay = reduceMotion ? 120 : 780;

    window.setTimeout(() => {
      setPhase('briefing');
      setActiveSection('panorama');
    }, foldDelay);

    window.setTimeout(() => setIsStartingTransition(false), finishDelay);
  };

  const handleReset = () => {
    closeOverlays();
    setPhase('arrival');
    setActiveSection('panorama');
    setIsStartingTransition(false);
    window.requestAnimationFrame(() => {
      document.getElementById('iv-intro-scroll')?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  };

  const handleFinalReached = () => {
    if (phase === 'briefing') setPhase('complete');
  };

  const handleOpenAsk = () => {
    if (!explorationIsUnlocked) return;
    setIsAskPanelOpen(true);
  };

  const handleInvestigate = () => {
    if (phase !== 'complete') return;
    setPhase('investigation');
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleScenarioChange = (nextScenario: FocusScenario) => {
    setScenario(nextScenario);
    closeOverlays();
    setPhase('arrival');
    setActiveSection('panorama');
    document.getElementById('iv-intro-scroll')?.scrollTo({ top: 0 });
  };

  return (
    <div id="focus-app-root" className={`iv-app phase-${phase}${isStartingTransition ? ' is-folding' : ''}`}>
      <main>
        {phase === 'investigation' ? (
          <InvestigationView
            briefing={briefing}
            onBackToBriefing={() => {
              setPhase('complete');
              window.setTimeout(() => document.getElementById('briefing-summary')?.scrollIntoView({ behavior: 'smooth' }), 60);
            }}
            onOpenWhy={() => setIsWhyDrawerOpen(true)}
            onOpenAsk={handleOpenAsk}
            onOpenActionModal={() => setIsActionModalOpen(true)}
          />
        ) : (
          <ImmersiveLanding
            briefing={briefing}
            isStarting={isStartingTransition}
            isCollapsed={briefingIsAvailable}
            onStart={handleStartBriefing}
            onOpenDemo={() => setIsDemoMenuOpen(true)}
            header={
              briefingIsAvailable ? (
                <ImmersiveHeader
                  phase={phase}
                  perspective={perspective}
                  chapters={chapters}
                  activeSection={activeSection}
                  onReset={handleReset}
                  onOpenDemo={() => setIsDemoMenuOpen(true)}
                  embedded
                />
              ) : null
            }
          >
            {briefingIsAvailable ? (
              <ImmersiveJourney
                briefing={briefing}
                isComplete={phase === 'complete'}
                onActiveSection={setActiveSection}
                onFinalReached={handleFinalReached}
                onOpenAsk={handleOpenAsk}
                onInvestigate={handleInvestigate}
                onReset={handleReset}
              />
            ) : null}
          </ImmersiveLanding>
        )}
      </main>

      {explorationIsUnlocked && (
        <AskPanel
          isOpen={isAskPanelOpen}
          onClose={() => setIsAskPanelOpen(false)}
          onSelectAction={(actionType) => actionType === 'focus_cases' && setIsActionModalOpen(true)}
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
        <ActionModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          cases={briefing.mainPriority.keyCases}
        />
      )}

      <DemoMenu
        isOpen={isDemoMenuOpen}
        onClose={() => setIsDemoMenuOpen(false)}
        currentScenario={scenario}
        onSelectScenario={handleScenarioChange}
        currentPerspective={perspective}
        onSelectPerspective={(nextPerspective) => {
          setPerspective(nextPerspective);
          closeOverlays();
          setPhase('arrival');
          setActiveSection('panorama');
          document.getElementById('iv-intro-scroll')?.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
};
