import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getFocusBriefing } from '../../data/mockData';
import { FocusPerspective, FocusScenario, FocusCoreState } from '../../types/focus';
import { Header } from '../layout/Header';
import { ProgressBar } from '../layout/ProgressBar';
import { ArrivalSection } from '../sections/ArrivalSection';
import { PrioritySection } from '../sections/PrioritySection';
import { WhyItMattersSection } from '../sections/WhyItMattersSection';
import { WhatChangedSection } from '../sections/WhatChangedSection';
import { AnomalySection } from '../sections/AnomalySection';
import { StableSection } from '../sections/StableSection';
import { CompleteSection } from '../sections/CompleteSection';
import { InvestigationView } from '../investigation/InvestigationView';
import { WhyDrawer } from '../why/WhyDrawer';
import { AskPanel } from '../ask/AskPanel';
import { ActionModal } from '../actions/ActionModal';
import { DemoMenu } from '../demo/DemoMenu';
import { FocusCore } from '../core/FocusCore';

export const FocusExperience: React.FC = () => {
  // Scenario & Perspective State
  const [scenario, setScenario] = useState<FocusScenario>('attention');
  const [perspective, setPerspective] = useState<FocusPerspective>('executive');
  const briefing = getFocusBriefing(perspective, scenario);

  // View state: 'briefing' | 'investigation'
  const [viewMode, setViewMode] = useState<'briefing' | 'investigation'>('briefing');

  // Interactive Overlays
  const [isWhyDrawerOpen, setIsWhyDrawerOpen] = useState(false);
  const [isAskPanelOpen, setIsAskPanelOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  // Active section tracking for progress bar & Focus Field
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeStepLabel, setActiveStepLabel] = useState<string>('Arrival');
  const [isScrolledPastArrival, setIsScrolledPastArrival] = useState(false);
  const [isStartingTransition, setIsStartingTransition] = useState(false);

  // Section Refs
  const arrivalRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const whyItMattersRef = useRef<HTMLDivElement>(null);
  const whatChangedRef = useRef<HTMLDivElement>(null);
  const anomalyRef = useRef<HTMLDivElement>(null);
  const stableRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef<HTMLDivElement>(null);

  // Scroll to a specific section smoothly
  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleStartBriefing = () => {
    setIsStartingTransition(true);
    setTimeout(() => {
      if (scenario === 'stable') {
        scrollToSection(stableRef);
      } else {
        scrollToSection(priorityRef);
      }
      setIsStartingTransition(false);
    }, 380);
  };

  const handleSelectDimension = (dimensionKey: 'priorities' | 'changes' | 'anomalies' | 'stable') => {
    switch (dimensionKey) {
      case 'priorities':
        scrollToSection(priorityRef);
        break;
      case 'changes':
        scrollToSection(whatChangedRef);
        break;
      case 'anomalies':
        scrollToSection(anomalyRef);
        break;
      case 'stable':
        scrollToSection(stableRef);
        break;
    }
  };

  const handleSelectStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 1:
        scrollToSection(priorityRef);
        break;
      case 2:
        scrollToSection(whyItMattersRef);
        break;
      case 3:
        scrollToSection(whatChangedRef);
        break;
      case 4:
        scrollToSection(anomalyRef);
        break;
      case 5:
        scrollToSection(stableRef);
        break;
    }
  };

  const handleResetToArrival = () => {
    setViewMode('briefing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll observer to update active step
  useEffect(() => {
    if (viewMode !== 'briefing') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      setIsScrolledPastArrival(scrollY > windowHeight * 0.25);

      // Section top offsets
      const priorityTop = priorityRef.current?.offsetTop || 0;
      const whyTop = whyItMattersRef.current?.offsetTop || 0;
      const changesTop = whatChangedRef.current?.offsetTop || 0;
      const anomalyTop = anomalyRef.current?.offsetTop || 0;
      const stableTop = stableRef.current?.offsetTop || 0;
      const completeTop = completeRef.current?.offsetTop || 0;

      const triggerOffset = scrollY + windowHeight * 0.45;

      if (triggerOffset >= completeTop && completeTop > 0) {
        setActiveStep(5);
        setActiveStepLabel('Al día');
      } else if (triggerOffset >= stableTop && stableTop > 0) {
        setActiveStep(5);
        setActiveStepLabel('Estabilidad');
      } else if (triggerOffset >= anomalyTop && anomalyTop > 0) {
        setActiveStep(4);
        setActiveStepLabel('Fuera de lo habitual');
      } else if (triggerOffset >= changesTop && changesTop > 0) {
        setActiveStep(3);
        setActiveStepLabel('Qué cambió');
      } else if (triggerOffset >= whyTop && whyTop > 0) {
        setActiveStep(2);
        setActiveStepLabel('Por qué importa');
      } else if (triggerOffset >= priorityTop && priorityTop > 0) {
        setActiveStep(1);
        setActiveStepLabel('Prioridad #1');
      } else {
        setActiveStep(0);
        setActiveStepLabel('Arrival');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, scenario]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsWhyDrawerOpen(false);
        setIsAskPanelOpen(false);
        setIsActionModalOpen(false);
        setIsDemoMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine current active Focus Field ambient background colors
  const getFocusFieldAtmosphere = () => {
    if (viewMode === 'investigation') {
      return 'radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.12) 0%, rgba(59, 130, 246, 0.08) 40%, rgba(3, 7, 18, 0) 80%)';
    }
    if (activeStep === 1) {
      // Priority: Coral glow positioned to the right
      return 'radial-gradient(circle at 75% 50%, rgba(244, 63, 94, 0.18) 0%, rgba(59, 130, 246, 0.08) 45%, rgba(3, 7, 18, 0) 75%)';
    }
    if (activeStep === 2) {
      // Explaining: Electric Blue center glow
      return 'radial-gradient(circle at 50% 50%, rgba(0, 112, 243, 0.16) 0%, rgba(6, 182, 212, 0.08) 45%, rgba(3, 7, 18, 0) 75%)';
    }
    if (activeStep === 3) {
      // What Changed: Cyan glow positioned to the left
      return 'radial-gradient(circle at 25% 50%, rgba(6, 182, 212, 0.16) 0%, rgba(59, 130, 246, 0.08) 45%, rgba(3, 7, 18, 0) 75%)';
    }
    if (activeStep === 4) {
      // Anomaly: Violet glow positioned to the right
      return 'radial-gradient(circle at 75% 50%, rgba(168, 85, 247, 0.18) 0%, rgba(244, 63, 94, 0.06) 45%, rgba(3, 7, 18, 0) 75%)';
    }
    if (activeStep === 5) {
      // Stable / Complete: Emerald / Teal center glow
      return 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 45%, rgba(3, 7, 18, 0) 75%)';
    }
    // Arrival: Gentle deep blue center glow
    return 'radial-gradient(circle at 50% 45%, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.06) 40%, rgba(3, 7, 18, 0) 75%)';
  };

  const getFloatingCoreState = (): FocusCoreState => {
    if (activeStep === 1) return 'attention';
    if (activeStep === 2) return 'explaining';
    if (activeStep === 3) return 'change';
    if (activeStep === 4) return 'anomaly';
    if (activeStep === 5) return 'stable';
    return 'observing';
  };

  return (
    <div
      id="focus-app-root"
      className="relative min-h-screen bg-[#030712] text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-1000"
    >
      {/* Living Ambient Focus Field (Dynamic smooth radial background) */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 ease-in-out z-0"
        style={{
          background: getFocusFieldAtmosphere(),
        }}
      />

      {/* Top Fixed Header */}
      <Header
        onOpenDemoMenu={() => setIsDemoMenuOpen(true)}
        scenario={scenario}
        perspective={perspective}
        onResetToArrival={handleResetToArrival}
        currentSection={activeStepLabel}
        isBriefingActive={isScrolledPastArrival && viewMode === 'briefing'}
      />

      {/* Thin Progress line when scrolling briefing: 01 ━━━━━ 02 ━━━━━ 03 */}
      <ProgressBar
        currentStep={Math.max(1, activeStep)}
        totalSteps={5}
        stepLabel={activeStepLabel}
        isVisible={isScrolledPastArrival && viewMode === 'briefing'}
        onSelectStep={handleSelectStep}
      />

      {/* Floating Focus Core Companion during Briefing Scroll */}
      <AnimatePresence>
        {isScrolledPastArrival && viewMode === 'briefing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed right-6 sm:right-10 bottom-8 z-30 hidden md:block cursor-pointer"
            onClick={() => handleResetToArrival()}
            title="Focus Core · Acompañante inteligente (Clic para volver arriba)"
          >
            <div className="p-2 rounded-full bg-[#050A18]/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl hover:border-blue-500/50 transition-all">
              <FocusCore size="companion" state={getFloatingCoreState()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <main className="relative w-full z-10">
        {viewMode === 'briefing' ? (
          <div className="relative w-full">
            {/* Arrival Screen */}
            <div ref={arrivalRef}>
              <ArrivalSection
                briefing={briefing}
                onStartBriefing={handleStartBriefing}
                onSelectDimension={handleSelectDimension}
                isStartingTransition={isStartingTransition}
              />
            </div>

            {/* Chapter 01: Prioridad */}
            {scenario !== 'stable' && (
              <>
                <div ref={priorityRef}>
                  <PrioritySection
                    priority={briefing.mainPriority}
                    onInvestigate={() => {
                      setViewMode('investigation');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onOpenWhy={() => setIsWhyDrawerOpen(true)}
                  />
                </div>

                {/* Chapter 02: Por qué importa */}
                <div ref={whyItMattersRef}>
                  <WhyItMattersSection priority={briefing.mainPriority} />
                </div>
              </>
            )}

            {/* Chapter 03: Qué cambió */}
            <div ref={whatChangedRef}>
              <WhatChangedSection changes={briefing.changes} />
            </div>

            {/* Chapter 04: Fuera de lo habitual */}
            {scenario !== 'stable' && (
              <div ref={anomalyRef}>
                <AnomalySection
                  anomaly={briefing.anomaly}
                  onUnderstand={() => {
                    setViewMode('investigation');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {/* Chapter 05: Todo lo demás (Estabilidad) */}
            <div ref={stableRef}>
              <StableSection stable={briefing.stable} />
            </div>

            {/* Final: Ya estás al día (Complete) */}
            <div ref={completeRef}>
              <CompleteSection
                briefing={briefing}
                onGoToPriority={() => {
                  setViewMode('investigation');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAsk={() => setIsAskPanelOpen(true)}
                onRestart={handleResetToArrival}
              />
            </div>
          </div>
        ) : (
          /* Guided Deep Focus Investigation View */
          <InvestigationView
            briefing={briefing}
            onBackToBriefing={() => {
              setViewMode('briefing');
              setTimeout(() => {
                scrollToSection(priorityRef);
              }, 50);
            }}
            onOpenWhy={() => setIsWhyDrawerOpen(true)}
            onOpenAsk={() => setIsAskPanelOpen(true)}
            onOpenActionModal={() => setIsActionModalOpen(true)}
          />
        )}
      </main>

      {/* WHY Drawer */}
      <WhyDrawer
        isOpen={isWhyDrawerOpen}
        onClose={() => setIsWhyDrawerOpen(false)}
        explanation={briefing.mainPriority.explanation}
        priorityTitle={briefing.mainPriority.title}
      />

      {/* ASK Panel */}
      <AskPanel
        isOpen={isAskPanelOpen}
        onClose={() => setIsAskPanelOpen(false)}
        onSelectAction={(actionType) => {
          if (actionType === 'focus_cases') {
            setIsActionModalOpen(true);
          }
        }}
      />

      {/* Action Modal */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        cases={briefing.mainPriority.keyCases}
      />

      {/* Demo Controls Modal */}
      <DemoMenu
        isOpen={isDemoMenuOpen}
        onClose={() => setIsDemoMenuOpen(false)}
        currentScenario={scenario}
        onSelectScenario={(s) => {
          setScenario(s);
          setViewMode('briefing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentPerspective={perspective}
        onSelectPerspective={(p) => setPerspective(p)}
      />
    </div>
  );
};
