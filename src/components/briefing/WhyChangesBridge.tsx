import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { OrganicFramingShapes } from '../effects/OrganicFramingShapes';
import { useIntroScrollRoot } from '../sections/ArrivalSection';

interface WhyChangesBridgeProps {
  conclusion: string;
}

type BridgeBeat = 'conclusion' | 'handoff';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const WhyChangesBridge: React.FC<WhyChangesBridgeProps> = ({ conclusion }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRootRef = useIntroScrollRoot();
  const reduceMotion = !!useReducedMotion();
  const [beat, setBeat] = useState<BridgeBeat>('conclusion');
  const [isCopyVisible, setIsCopyVisible] = useState(false);
  const [areShapesActive, setAreShapesActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const root = scrollRootRef?.current ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
    if (!section) return undefined;

    let frameId = 0;
    let lastBeat: BridgeBeat | null = null;
    let lastCopyVisible: boolean | null = null;
    let lastShapesActive: boolean | null = null;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const sectionRect = section.getBoundingClientRect();
        const rootRect = root?.getBoundingClientRect();
        const rootTop = rootRect?.top ?? 0;
        const rootHeight = root?.clientHeight ?? window.innerHeight;
        const rootBottom = rootTop + rootHeight;
        const totalDistance = Math.max(1, sectionRect.height - rootHeight);
        const progress = Math.max(0, Math.min(1, (rootTop - sectionRect.top) / totalDistance));
        const nextBeat: BridgeBeat = progress < 0.52 ? 'conclusion' : 'handoff';
        const nextCopyVisible =
          sectionRect.bottom > rootTop + rootHeight * 0.08 &&
          sectionRect.top < rootBottom - rootHeight * 0.18;
        const nextShapesActive =
          sectionRect.top <= rootTop + rootHeight * 0.06 &&
          sectionRect.bottom >= rootBottom - rootHeight * 0.06;

        section.style.setProperty('--iv-why-bridge-viewport-height', `${rootHeight}px`);

        if (nextBeat !== lastBeat) {
          lastBeat = nextBeat;
          setBeat(nextBeat);
        }

        if (nextCopyVisible !== lastCopyVisible) {
          lastCopyVisible = nextCopyVisible;
          setIsCopyVisible(nextCopyVisible);
        }

        if (nextShapesActive !== lastShapesActive) {
          lastShapesActive = nextShapesActive;
          setAreShapesActive(nextShapesActive);
        }
      });
    };

    const target = root ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, [scrollRootRef]);

  const copyStagger: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.12,
          delayChildren: reduceMotion ? 0 : 0.06,
        },
      },
      exit: {
        transition: { staggerChildren: reduceMotion ? 0 : 0.04, staggerDirection: -1 },
      },
    }),
    [reduceMotion],
  );

  const copyItem: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.55, ease: EASE_OUT_EXPO },
      },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, y: -14, transition: { duration: 0.32, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  return (
    <section
      ref={sectionRef}
      id="transition-to-changes"
      className="relative h-[230vh] min-h-[230vh] w-full bg-transparent contain-paint"
      aria-label="Transición de Por qué a Cambios"
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: 'var(--iv-why-bridge-viewport-height, 100svh)' }}
      >
        <OrganicFramingShapes active={areShapesActive} variant="why-bridge" />

        <AnimatePresence>
          {isCopyVisible && (
            <motion.div
              key="why-changes-eyebrow"
              className="absolute top-[clamp(72px,12vh,96px)] left-1/2 -translate-x-1/2 z-20 iv-noise-filter-transition__eyebrow"
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: EASE_OUT_SOFT }}
              aria-hidden="true"
            >
              <span className="iv-noise-filter-transition__eyebrow-step">03 → 04</span>
              <span className="iv-noise-filter-transition__eyebrow-sep">/</span>
              <span className="iv-noise-filter-transition__eyebrow-label">DE POR QUÉ A CAMBIOS</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="sync">
          {isCopyVisible && beat === 'conclusion' && (
            <motion.div
              key="why-conclusion-copy"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
              variants={copyStagger}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2
                variants={copyItem}
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.1] max-w-4xl"
              >
                Por eso aparece primero.
              </motion.h2>

              <motion.p
                variants={copyItem}
                className="text-base sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed"
              >
                {conclusion || 'FOCUS combina estos factores para decidir qué merece tu atención primero.'}
              </motion.p>
            </motion.div>
          )}

          {isCopyVisible && beat === 'handoff' && (
            <motion.div
              key="why-changes-copy"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
              variants={copyStagger}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Pero saber qué importa no es suficiente. También necesitas saber qué cambió."
            >
              <motion.p
                variants={copyItem}
                className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-4 text-slate-400 max-w-4xl"
              >
                Pero saber qué importa no es suficiente.
              </motion.p>

              <motion.strong
                variants={copyItem}
                className="block text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-cyan-300 via-white to-violet-300 max-w-5xl"
              >
                También necesitas saber qué cambió.
              </motion.strong>

              <motion.div
                variants={copyItem}
                className="mt-16 h-[2px] w-full max-w-[220px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                aria-hidden="true"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
