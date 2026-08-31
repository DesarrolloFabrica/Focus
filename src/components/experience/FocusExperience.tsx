import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { getFocusBriefing } from '../../data/mockData';
import { FocusPerspective, FocusScenario } from '../../types/focus';
import { pauseSubtreeAnimations, resumeSubtreeAnimations, initBriefingScrollBus } from '../../perf';
import { NarrativeTransition } from '../briefing/NarrativeTransition';
import { NoiseFilterTransition } from '../briefing/NoiseFilterTransition';
import { WhyChangesBridge } from '../briefing/WhyChangesBridge';
import { Header } from '../layout/Header';
import { briefingSteps, ProgressBar } from '../layout/ProgressBar';
import { AnomalySection } from '../sections/AnomalySection';
import { ArrivalSection } from '../sections/ArrivalSection';
import { CompleteSection } from '../sections/CompleteSection';
import { PrioritySection } from '../sections/PrioritySection';
import { StableSection } from '../sections/StableSection';
import { WhatChangedSection } from '../sections/WhatChangedSection';
import { WhyItMattersSection } from '../sections/WhyItMattersSection';

/**
 * Vistas y paneles que no forman parte del primer render.
 * Se descargan en segundo plano la primera vez que se abren, lo que aligera
 * el arranque sin perder sus animaciones de entrada y salida (una vez
 * montados, permanecen montados).
 */
const InvestigationView = lazy(() =>
  import('../investigation/InvestigationView').then((m) => ({ default: m.InvestigationView })),
);
const AskPanel = lazy(() => import('../ask/AskPanel').then((m) => ({ default: m.AskPanel })));
const ActionModal = lazy(() => import('../actions/ActionModal').then((m) => ({ default: m.ActionModal })));
const WhyDrawer = lazy(() => import('../why/WhyDrawer').then((m) => ({ default: m.WhyDrawer })));
const DemoMenu = lazy(() => import('../demo/DemoMenu').then((m) => ({ default: m.DemoMenu })));

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

/**
 * Banda de enfoque: el capitulo activo es el que cruza la franja situada
 * entre el 32% y el 40% de la altura visible. Se resuelve con
 * IntersectionObserver en lugar de medir todas las secciones en cada frame
 * de scroll, que era la principal fuente de "layout forzado" de la pagina.
 */
const FOCUS_BAND_MARGIN = '-32% 0px -60% 0px';
/** Margen de anticipacion para reanudar animaciones antes de entrar en pantalla. */
const INVIEW_MARGIN = '200px 0px 200px 0px';

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

  // Se montan la primera vez que se abren y ya no se desmontan, para no
  // perder las animaciones de salida de AnimatePresence.
  const [askMounted, setAskMounted] = useState(false);
  const [whyMounted, setWhyMounted] = useState(false);
  const [actionMounted, setActionMounted] = useState(false);
  const [demoMounted, setDemoMounted] = useState(false);

  const reduceMotion = !!useReducedMotion();
  const briefing = useMemo(() => getFocusBriefing(perspective, scenario), [perspective, scenario]);
  const isBriefingVisible = phase === 'briefing' || phase === 'complete';
  const explorationIsUnlocked = phase === 'complete' || phase === 'investigation';

  const getScrollRoot = () => document.getElementById('iv-intro-scroll');

  const openAsk = useCallback(() => {
    setAskMounted(true);
    setIsAskPanelOpen(true);
  }, []);
  const openWhy = useCallback(() => {
    setWhyMounted(true);
    setIsWhyDrawerOpen(true);
  }, []);
  const openAction = useCallback(() => {
    setActionMounted(true);
    setIsActionModalOpen(true);
  }, []);
  const openDemo = useCallback(() => {
    setDemoMounted(true);
    setIsDemoMenuOpen(true);
  }, []);

  const scrollTo = useCallback(
    (id: string, delay = 0) => {
      window.setTimeout(() => {
        const target = document.getElementById(id);
        const root = getScrollRoot();
        if (!target || !root) return;

        const rootRect = root.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const top = root.scrollTop + (targetRect.top - rootRect.top) - 8;
        root.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
      }, delay);
    },
    [reduceMotion],
  );

  const handleSelectChapter = useCallback(
    (index: number) => {
      setActiveStep(index);
      scrollTo(chapterTargets[index]);
    },
    [scrollTo],
  );

  const closeOverlays = useCallback(() => {
    setIsAskPanelOpen(false);
    setIsWhyDrawerOpen(false);
    setIsActionModalOpen(false);
  }, []);

  const handleStartBriefing = useCallback(() => {
    setIsStartingTransition((transitioning) => {
      if (transitioning) return transitioning;

      const mountDelay = reduceMotion ? 20 : 420;
      const finishDelay = reduceMotion ? 60 : 780;

      window.setTimeout(() => {
        setPhase((current) => (current === 'arrival' ? 'briefing' : current));
        setActiveStep(0);
        getScrollRoot()?.scrollTo({ top: 0, behavior: 'auto' });
      }, mountDelay);

      window.setTimeout(() => setIsStartingTransition(false), finishDelay);
      return true;
    });
  }, [reduceMotion]);

  const handleReset = useCallback(() => {
    closeOverlays();
    setPhase('arrival');
    setActiveStep(0);
    setIsStartingTransition(false);
    window.setTimeout(() => {
      getScrollRoot()?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }, 40);
  }, [closeOverlays, reduceMotion]);

  const resetWithDataChange = useCallback(
    (nextScenario: FocusScenario, nextPerspective: FocusPerspective) => {
      setScenario(nextScenario);
      setPerspective(nextPerspective);
      setPhase('arrival');
      setActiveStep(0);
      closeOverlays();
      getScrollRoot()?.scrollTo({ top: 0, behavior: 'auto' });
    },
    [closeOverlays],
  );

  /**
   * Un unico par de observers para todo el briefing:
   *  - "focus": marca el capitulo activo (barra de progreso + atmosfera)
   *  - "inview": marca data-inview en cada capitulo para que el CSS pause
   *    las animaciones que no se estan viendo.
   * Ninguno de los dos lee geometria en el hilo principal, asi que el scroll
   * deja de provocar reflows.
   */
  useEffect(() => {
    if (!isBriefingVisible) return undefined;

    const root = getScrollRoot();
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;

    const observed = new Set<Element>();

    const focusObserver = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (!hit) return;

        const chapter = (hit.target as HTMLElement).dataset.chapter;
        if (!chapter) return;

        const index = briefingSteps.findIndex((step) => step.id === chapter);
        if (index < 0) return;

        setActiveStep((current) => (current === index ? current : index));
        if (chapter === 'summary') {
          setPhase((current) => (current === 'briefing' ? 'complete' : current));
        }
      },
      { root, rootMargin: FOCUS_BAND_MARGIN, threshold: 0 },
    );

    let gateFrame = 0;

    const inviewObserver = new IntersectionObserver(
      (entries) => {
        const changed = entries.map((entry) => ({
          element: entry.target as HTMLElement,
          inView: entry.isIntersecting,
        }));

        changed.forEach(({ element, inView }) => {
          element.dataset.inview = inView ? 'true' : 'false';
        });

        // Se hace en el frame siguiente: el atributo ya cambio de estilo y
        // reanudar/pausar aqui no compite con el recalculo en curso.
        cancelAnimationFrame(gateFrame);
        gateFrame = window.requestAnimationFrame(() => {
          changed.forEach(({ element, inView }) => {
            if (inView) resumeSubtreeAnimations(element);
            else pauseSubtreeAnimations(element);
          });
        });
      },
      { root, rootMargin: INVIEW_MARGIN, threshold: 0 },
    );

    const refresh = () => {
      root.querySelectorAll<HTMLElement>('[data-chapter]').forEach((section) => {
        if (observed.has(section)) return;
        observed.add(section);
        section.dataset.inview = 'true';
        focusObserver.observe(section);
        inviewObserver.observe(section);
      });
    };

    refresh();
    // Los capitulos se declaran a lo largo del montaje (la portada activa su
    // data-chapter con retardo), asi que se revisa un par de veces mas.
    const timers = [120, 700, 1600].map((delay) => window.setTimeout(refresh, delay));

    return () => {
      timers.forEach(window.clearTimeout);
      cancelAnimationFrame(gateFrame);
      focusObserver.disconnect();
      inviewObserver.disconnect();
      observed.forEach((section) => {
        // Nada debe quedarse congelado al desmontar el briefing.
        resumeSubtreeAnimations(section);
        delete (section as HTMLElement).dataset.inview;
      });
    };
  }, [isBriefingVisible]);

  useEffect(() => {
    if (!isBriefingVisible) return undefined;
    const root = getScrollRoot();
    initBriefingScrollBus(root);
    return () => initBriefingScrollBus(null);
  }, [isBriefingVisible]);

  /**
   * El arbol del briefing solo depende de `briefing`. Al memorizarlo, avanzar
   * de capitulo (que cambia activeStep muchas veces durante el scroll) ya no
   * vuelve a renderizar las siete secciones completas.
   */
  const briefingContent = useMemo(() => {
    if (!isBriefingVisible) return null;

    return (
      <>
        <NoiseFilterTransition id="transition-panorama-to-priority" />
        <PrioritySection priority={briefing.mainPriority} onContinue={() => scrollTo('section-chapter-why')} />
        <WhyItMattersSection signals={briefing.signals} />
        <WhyChangesBridge conclusion={briefing.mainPriority.explanation.summaryText} />
        <WhatChangedSection changes={briefing.changes} onContinue={() => scrollTo('section-chapter-anomaly')} />
        <AnomalySection anomaly={briefing.anomaly} />
        <StableSection entities={briefing.entities} onContinue={() => scrollTo('section-chapter-complete')} />
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
    );
  }, [isBriefingVisible, briefing, scrollTo, handleReset, reduceMotion]);

  const briefingChrome = useMemo(() => {
    if (!isBriefingVisible) return null;

    return (
      <div className="iv-briefing-chrome">
        <Header
          onOpenDemoMenu={openDemo}
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
    );
  }, [isBriefingVisible, openDemo, scenario, perspective, handleReset, activeStep, phase, handleSelectChapter]);

  return (
    <div id="focus-app-root" className={`focus-experience iv-app phase-${phase}${isStartingTransition ? ' is-transitioning' : ''}`}>
      <div className="focus-atmosphere" data-active-chapter={briefingSteps[activeStep]?.id ?? 'panorama'} aria-hidden="true" />

      <main>
        {phase === 'investigation' ? (
          <Suspense fallback={<div className="min-h-screen" />}>
            <InvestigationView
              briefing={briefing}
              onBackToBriefing={() => {
                setPhase('complete');
                scrollTo('section-chapter-complete', 40);
              }}
              onOpenWhy={openWhy}
              onOpenAsk={openAsk}
              onOpenActionModal={openAction}
            />
          </Suspense>
        ) : (
          <ArrivalSection
            briefing={briefing}
            onStartBriefing={handleStartBriefing}
            isStartingTransition={isStartingTransition}
            isBriefingActive={isBriefingVisible}
            briefingActiveStep={activeStep}
            onOpenDemo={openDemo}
            header={briefingChrome}
          >
            {briefingContent}
          </ArrivalSection>
        )}
      </main>

      {explorationIsUnlocked && askMounted && (
        <Suspense fallback={null}>
          <AskPanel
            isOpen={isAskPanelOpen}
            onClose={() => setIsAskPanelOpen(false)}
            onSelectAction={(action) => action === 'focus_cases' && openAction()}
          />
        </Suspense>
      )}
      {phase === 'investigation' && whyMounted && (
        <Suspense fallback={null}>
          <WhyDrawer
            isOpen={isWhyDrawerOpen}
            onClose={() => setIsWhyDrawerOpen(false)}
            explanation={briefing.mainPriority.explanation}
            priorityTitle={briefing.mainPriority.title}
          />
        </Suspense>
      )}
      {explorationIsUnlocked && actionMounted && (
        <Suspense fallback={null}>
          <ActionModal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} cases={briefing.mainPriority.keyCases} />
        </Suspense>
      )}

      {demoMounted && (
        <Suspense fallback={null}>
          <DemoMenu
            isOpen={isDemoMenuOpen}
            onClose={() => setIsDemoMenuOpen(false)}
            currentScenario={scenario}
            onSelectScenario={(nextScenario) => resetWithDataChange(nextScenario, perspective)}
            currentPerspective={perspective}
            onSelectPerspective={(nextPerspective) => resetWithDataChange(scenario, nextPerspective)}
          />
        </Suspense>
      )}
    </div>
  );
};
