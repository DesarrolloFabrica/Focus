import React, { useCallback, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { FocusBriefing } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';
import { useBriefingSectionMetrics } from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';

interface CompleteSectionProps {
  briefing: FocusBriefing;
  onInvestigate: () => void;
  onFinish: () => void;
  onReset: () => void;
}

export const CompleteSection: React.FC<CompleteSectionProps> = ({
  briefing,
  onInvestigate,
  onFinish,
  onReset,
}) => {
  const reduceMotion = !!useReducedMotion();
  const scrollRootRef = useIntroScrollRoot();
  const sectionRef = useRef<HTMLElement | null>(null);

  const [hoveredAction, setHoveredAction] = useState<'ask' | 'resumen' | 'volver' | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const rawStoryProgress = useMotionValue(0);

  useBriefingSectionMetrics(
    sectionRef,
    'summary',
    scrollRootRef?.current ?? null,
    useCallback(
      (metrics) => {
        rawStoryProgress.set(metrics.progress);
      },
      [rawStoryProgress],
    ),
  );

  const animatedProgress = useSpring(rawStoryProgress, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0005,
    restSpeed: 0.002,
  });

  const storyProgress = reduceMotion ? rawStoryProgress : animatedProgress;

  // ---------------------------------------------------------------------------
  // ACT 1: SÍNTESIS EXIT (0.00 - 0.28)
  // ---------------------------------------------------------------------------
  // Elementos desaparecen progresivamente: microdatos -> visualizaciones -> texto secundario
  
  const pillDotsOpacity = useTransform(storyProgress, [0.08, 0.14], [1, 0]);
  const pillTextOpacity = useTransform(storyProgress, [0.10, 0.18], [1, 0]);
  const pillBgOpacity = useTransform(storyProgress, [0.12, 0.22], [1, 0]);
  const pillY = useTransform(storyProgress, [0.08, 0.22], [0, 20]);
  
  const headerSubOpacity = useTransform(storyProgress, [0.10, 0.20], [1, 0]);
  const headerTitleOpacity = useTransform(storyProgress, [0.14, 0.24], [1, 0]);
  const headerBadgeOpacity = useTransform(storyProgress, [0.16, 0.26], [1, 0]);
  const headerY = useTransform(storyProgress, [0.10, 0.26], [0, -32]);

  // ---------------------------------------------------------------------------
  // ACT 2: SOLO F CENTER EXPANSION & RADIANT BURST DISSOLVE (0.24 - 0.58)
  // ---------------------------------------------------------------------------
  // La F se re-centra suavemente, se agranda con un destello radiante y se desvanece
  const coreY = useTransform(storyProgress, [0.16, 0.32], [0, -36]);
  const coreScale = useTransform(storyProgress, [0.28, 0.40, 0.54], [1.0, 1.25, 2.4]);
  const coreOpacity = useTransform(storyProgress, [0.00, 0.46, 0.54], [1, 1, 0]);

  // Brillo radiante y destello anamórfico al agrandarse
  const coreBurstOpacity = useTransform(storyProgress, [0.30, 0.42, 0.50, 0.56], [0, 0.95, 1, 0]);
  const coreBurstScale = useTransform(storyProgress, [0.30, 0.56], [0.5, 3.2]);
  const flareLineOpacity = useTransform(storyProgress, [0.34, 0.44, 0.54], [0, 1, 0]);
  const flareLineScaleX = useTransform(storyProgress, [0.34, 0.48, 0.56], [0.2, 2.5, 4.2]);

  // El stage de síntesis se oculta completamente después del destello
  const mainStageDisplay = useTransform(storyProgress, (p) => (p > 0.56 ? 'none' : 'flex'));

  // ---------------------------------------------------------------------------
  // ACT 3: HERO Y DECISION DOCK ENTRANCE (0.54 - 1.00)
  // ---------------------------------------------------------------------------
  
  // Hero (lado izquierdo)
  const heroBadgeOpacity = useTransform(storyProgress, [0.56, 0.68], [0, 1]);
  const heroBadgeY = useTransform(storyProgress, [0.56, 0.68], [20, 0]);
  
  const heroTitleOpacity = useTransform(storyProgress, [0.62, 0.74], [0, 1]);
  const heroTitleY = useTransform(storyProgress, [0.62, 0.74], [24, 0]);
  
  const heroSubOpacity = useTransform(storyProgress, [0.68, 0.80], [0, 1]);
  const heroSubY = useTransform(storyProgress, [0.68, 0.80], [24, 0]);

  // Decision Dock (lado derecho)
  const dockWrapperDisplay = useTransform(storyProgress, (p) => (p > 0.54 ? 'flex' : 'none'));

  const askOpacity = useTransform(storyProgress, [0.72, 0.82], [0, 1]);
  const askY = useTransform(storyProgress, [0.72, 0.82], [16, 0]);
  
  const resumenOpacity = useTransform(storyProgress, [0.78, 0.88], [0, 1]);
  const resumenY = useTransform(storyProgress, [0.78, 0.88], [16, 0]);
  
  const volverOpacity = useTransform(storyProgress, [0.84, 0.96], [0, 1]);
  const volverY = useTransform(storyProgress, [0.84, 0.96], [16, 0]);

  // ---------------------------------------------------------------------------
  // MANEJADORES
  // ---------------------------------------------------------------------------
  
  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 1200); 
  };

  const handleAskFocus = () => {
    // Callback preparado para la IA conversacional.
    console.log('FOCUS Ask invocado.');
  };

  // Dinámica de plataforma abstracta basada en CSS puro
  const platformBgOpacityVal = isExiting ? 1 : (hoveredAction === 'volver' ? 0.22 : 0.08);
  const platformBgBlurVal = isExiting ? '0px' : (hoveredAction === 'volver' ? '16px' : '28px');

  return (
    <section
      ref={sectionRef}
      id="section-chapter-complete"
      className="syn-section select-none"
      data-chapter="summary"
      aria-label="06 / 07 · Síntesis completada"
      style={{ height: '340svh', background: '#020612' }}
    >
      <style>{`
        /* =========================================
           ABSTRACT PLATFORM BACKGROUND
           ========================================= */
        .abstract-platform {
          position: absolute;
          inset: 0;
          background-color: #020612;
          background-image: 
            linear-gradient(rgba(255,255,255,0.06) 50px, transparent 50px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 240px, transparent 240px),
            linear-gradient(rgba(255,255,255,0.04) 200px, transparent 200px),
            linear-gradient(90deg, transparent 260px, rgba(255,255,255,0.03) 260px, rgba(255,255,255,0.03) 600px, transparent 600px);
          background-position: 0 0, 0 0, 260px 70px, 0 290px;
          background-size: 100% 100%, 100% 100%, calc(100% - 280px) 200px, 100% 300px;
          background-repeat: no-repeat;
          transition: opacity 0.8s ease, filter 0.8s ease;
          pointer-events: none;
          z-index: 0;
        }

        .decision-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        /* =========================================
           LAYOUT ASIMÉTRICO (HERO + DOCK)
           ========================================= */
        .decision-hero-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          pointer-events: none; 
          padding: 0 24px;
        }

        .decision-hero-layout {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1200px;
          gap: 40px;
        }

        @media (min-width: 1024px) {
          .decision-hero-layout {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 60px;
          }
          .decision-hero-content {
            flex: 0 0 40%;
            text-align: left;
            align-items: flex-start;
            padding-bottom: 24px;
          }
          .decision-dock-wrapper {
            flex: 0 0 55%;
          }
        }

        @media (max-width: 1023px) {
          .decision-hero-content {
            text-align: center;
            align-items: center;
          }
        }

        .decision-hero-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .decision-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.08);
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(6, 182, 212, 0.15);
        }

        .decision-title {
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 400;
          letter-spacing: -0.02em;
          color: #f8fafc;
          margin: 0;
          line-height: 1.15;
        }

        .decision-title-highlight {
          display: block;
          font-weight: 600;
          background: linear-gradient(to right, #ffffff, #dcecff, rgba(6, 182, 212, 0.8));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .decision-subtitle {
          font-size: 18px;
          color: #94a3b8;
          font-weight: 400;
          margin: 0;
        }

        .decision-microcopy {
          font-size: 13px;
          color: #64748b;
          margin-top: 8px;
        }

        /* =========================================
           DECISION DOCK & REVOLVING BORDER BEAM
           ========================================= */
        .decision-dock-wrapper {
          pointer-events: auto;
          position: relative;
          width: 100%;
        }

        .syn-dock-glow-wrapper {
          position: relative;
          padding: 1.5px;
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.12);
        }

        @media (min-width: 1024px) {
          .syn-dock-glow-wrapper {
            border-radius: 32px;
          }
        }

        .syn-dock-border-tracer {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 70deg,
            rgba(6, 182, 212, 0.2) 90deg,
            rgba(6, 182, 212, 0.85) 105deg,
            rgba(56, 189, 248, 1) 115deg,
            #ffffff 120deg,
            rgba(56, 189, 248, 1) 125deg,
            rgba(6, 182, 212, 0.85) 135deg,
            rgba(6, 182, 212, 0.2) 150deg,
            transparent 170deg,
            transparent 360deg
          );
          animation: rotateDockTracer 6s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes rotateDockTracer {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .syn-dock-container {
          display: flex;
          flex-direction: column;
          background: rgba(4, 9, 24, 0.90);
          backdrop-filter: blur(36px);
          -webkit-backdrop-filter: blur(36px);
          border-radius: calc(26px - 1.5px);
          width: 100%;
          position: relative;
          overflow: hidden;
          z-index: 2;
        }
        
        @media (min-width: 1024px) {
          .syn-dock-container {
            flex-direction: row;
            border-radius: calc(32px - 1.5px);
          }
          .syn-dock-item--ask { flex: 1.4; }
          .syn-dock-item--resumen { flex: 1; }
          .syn-dock-item--volver { flex: 1; }
        }

        .syn-dock-item {
          padding: 32px 28px;
          position: relative;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          display: flex;
          flex-direction: column;
          outline: none;
          text-align: left;
        }
        
        .syn-dock-item:focus-visible {
          box-shadow: inset 0 0 0 2px #06b6d4;
        }
        .syn-dock-item.is-dimmed {
          opacity: 0.65;
        }
        .syn-dock-item.is-hovered {
          z-index: 10;
        }
        
        .syn-dock-item-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }

        .syn-dock-text h4 {
          font-size: 17px;
          font-weight: 600;
          color: #f8fafc;
          margin: 0 0 6px 0;
          transition: color 0.3s ease;
        }
        .syn-dock-item.is-hovered .syn-dock-text h4 {
          color: #ffffff;
        }
        .syn-dock-text p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.45;
        }

        .syn-dock-divider {
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          height: 1px;
          z-index: 5;
        }
        @media (min-width: 1024px) {
          .syn-dock-divider {
            width: 1px;
            height: auto;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent);
          }
        }

        /* Hover Backgrounds */
        .syn-dock-item-bg {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          transition: opacity 0.5s ease;
          opacity: 0;
        }
        .syn-dock-item.is-hovered .syn-dock-item-bg {
          opacity: 1;
        }
        .syn-dock-item--ask .syn-dock-item-bg {
          background: radial-gradient(circle at 50% 100%, rgba(6, 182, 212, 0.14) 0%, transparent 70%);
        }
        .syn-dock-item--resumen .syn-dock-item-bg {
          background: radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.10) 0%, transparent 70%);
        }
        .syn-dock-item--volver .syn-dock-item-bg {
          background: radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
        }

        /* Micro-interactions: ASK */
        .syn-dock-icon-ask {
          font-size: 24px;
          color: #06b6d4;
          text-shadow: 0 0 16px rgba(6, 182, 212, 0.6);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .syn-dock-item.is-hovered .syn-dock-icon-ask {
          transform: scale(1.1) rotate(10deg);
        }
        
        .syn-dock-ask-reveal {
          font-size: 12px;
          color: #06b6d4;
          font-weight: 500;
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.4s ease;
        }
        .syn-dock-item--ask.is-hovered .syn-dock-ask-reveal {
          opacity: 1;
          transform: translateY(0);
        }

        .syn-dock-ask-fx {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .syn-dock-ask-wave {
          position: absolute;
          left: 36px;
          top: 38px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(6, 182, 212, 0.6);
          animation: askWave 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .syn-dock-item--ask.is-hovered .syn-dock-ask-wave {
          animation: askWaveActive 2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        
        @keyframes askWave {
          0% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        @keyframes askWaveActive {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        /* Micro-interactions: RESUMEN */
        .syn-dock-resumen-icon {
          display: flex;
          flex-direction: column;
          gap: 4px;
          height: 24px;
          justify-content: center;
        }
        .syn-dock-resumen-icon i {
          height: 2px;
          background: #8b5cf6;
          border-radius: 2px;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .syn-dock-resumen-icon i:nth-child(1) { width: 24px; transform: translateX(-2px); }
        .syn-dock-resumen-icon i:nth-child(2) { width: 16px; transform: translateX(2px); }
        .syn-dock-resumen-icon i:nth-child(3) { width: 20px; transform: translateX(-4px); }
        
        .syn-dock-item--resumen.is-hovered .syn-dock-resumen-icon i {
          transform: translateX(0);
          background: #a78bfa;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
        }
        .syn-dock-item--resumen.is-hovered .syn-dock-resumen-icon i:nth-child(1) { width: 24px; }
        .syn-dock-item--resumen.is-hovered .syn-dock-resumen-icon i:nth-child(2) { width: 24px; }
        .syn-dock-item--resumen.is-hovered .syn-dock-resumen-icon i:nth-child(3) { width: 24px; }

        /* Micro-interactions: VOLVER */
        .syn-dock-volver-frame {
          width: 20px;
          height: 14px;
          border: 1.5px solid #64748b;
          border-radius: 3px;
          position: relative;
          margin-top: 5px;
          transition: all 0.4s ease;
        }
        .syn-dock-volver-frame::after {
          content: '';
          position: absolute;
          inset: 3px;
          background: rgba(100, 116, 139, 0.2);
          border-radius: 1px;
          transition: all 0.4s ease;
        }
        .syn-dock-item--volver.is-hovered .syn-dock-volver-frame {
          border-color: #f8fafc;
        }
        .syn-dock-item--volver.is-hovered .syn-dock-volver-frame::after {
          background: rgba(248, 250, 252, 0.5);
        }
        
        .syn-dock-arrow {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease;
        }
        .syn-dock-item.is-hovered .syn-dock-arrow {
          transform: translateX(6px);
          color: #f8fafc;
        }

        /* Exit Overlay */
        .exit-overlay-dimmer {
          position: absolute;
          inset: 0;
          background: #020612;
          z-index: 100;
          pointer-events: none;
          opacity: 0;
          transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-exiting .exit-overlay-dimmer {
          opacity: 1;
        }
      `}</style>

      <div className={`syn-sticky ${isExiting ? 'is-exiting' : ''}`}>
        
        {/* Ambiental Platform Background */}
        <div
          className="abstract-platform"
          style={{ 
            opacity: platformBgOpacityVal,
            filter: `blur(${platformBgBlurVal})`,
          }}
        />
        <div className="decision-noise" />

        {/* ================================================================= */}
        {/* ACT 1: SÍNTESIS EXIT STAGE (Ya tienes el panorama)                */}
        {/* ================================================================= */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{ display: mainStageDisplay }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center pb-[8vh]">
            {/* Header de Síntesis Rediseñado */}
            <motion.header
              className="text-center mb-12 flex flex-col items-center relative"
              style={{
                opacity: headerTitleOpacity,
                y: headerY,
              }}
            >
              {/* Ambient glow behind text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[160%] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
              
              <motion.div 
                className="flex items-center gap-3 text-cyan-400 text-[10px] font-bold tracking-[0.25em] mb-8 bg-[#041d26]/40 px-5 py-1.5 rounded-full border border-cyan-900/40 shadow-[0_0_20px_rgba(6,182,212,0.1)] uppercase"
                style={{ opacity: headerBadgeOpacity }}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>SÍNTESIS FINAL</span>
                <span className="w-1 h-1 bg-cyan-500/50 rounded-full mx-1" />
                <span className="text-cyan-600/80">06/07</span>
              </motion.div>
              
              <div className="relative px-8">
                {/* Decorative brackets */}
                <div className="absolute left-0 top-0 w-3 h-3 border-t border-l border-cyan-500/40" />
                <div className="absolute right-0 bottom-0 w-3 h-3 border-b border-r border-cyan-500/40" />
                <div className="absolute -left-16 top-1/2 w-10 h-px bg-gradient-to-r from-transparent to-cyan-500/20" />
                <div className="absolute -right-16 top-1/2 w-10 h-px bg-gradient-to-l from-transparent to-cyan-500/20" />
                
                <h2 className="text-5xl sm:text-[64px] font-medium mb-5 tracking-tight relative z-10 leading-none">
                  <span className="text-slate-300">Ya tienes el </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_24px_rgba(6,182,212,0.2)]">
                    panorama.
                  </span>
                </h2>
              </div>
              
              <motion.div className="relative mt-3" style={{ opacity: headerSubOpacity }}>
                <div className="absolute left-1/2 -top-4 -translate-x-1/2 w-8 h-[2px] bg-cyan-500/30 rounded-full" />
                <p className="text-slate-400/90 text-lg font-light max-w-md leading-relaxed tracking-wide">
                  FOCUS redujo toda la actividad observada a lo que <span className="text-slate-200 font-medium">realmente necesitas</span> conocer hoy.
                </p>
              </motion.div>
            </motion.header>

            {/* Core + Telemetry Pill */}
            <motion.div
              className="relative flex flex-col items-center"
              style={{
                y: coreY,
              }}
            >
              {/* Radiant Flash / Glow Burst when F scales up */}
              <motion.div
                className="pointer-events-none absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 380,
                  height: 380,
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(6,182,212,0.95) 25%, rgba(59,130,246,0.6) 50%, rgba(168,85,247,0.3) 70%, transparent 85%)',
                  boxShadow: '0 0 120px rgba(6,182,212,0.9), 0 0 220px rgba(59,130,246,0.7)',
                  opacity: reduceMotion ? 0 : coreBurstOpacity,
                  scale: reduceMotion ? 1 : coreBurstScale,
                  filter: 'blur(10px)',
                  zIndex: 5,
                }}
              />

              {/* Anamorphic Horizontal Flare streak */}
              <motion.div
                className="pointer-events-none absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 h-[3px] rounded-full"
                style={{
                  width: 650,
                  background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5) 20%, rgba(255,255,255,1) 50%, rgba(6,182,212,0.5) 80%, transparent)',
                  boxShadow: '0 0 25px #06b6d4, 0 0 50px #38bdf8',
                  opacity: reduceMotion ? 0 : flareLineOpacity,
                  scaleX: reduceMotion ? 1 : flareLineScaleX,
                  zIndex: 6,
                }}
              />

              {/* Core F Mark */}
              <motion.div
                className="relative flex items-center justify-center scale-90 sm:scale-95 mb-10 z-10"
                style={{
                  opacity: coreOpacity,
                  scale: coreScale,
                }}
              >
                <FocusCore size="medium" state="complete" variant="particle" markStyle="letter" />
              </motion.div>

              {/* Telemetry Pill */}
              <motion.div 
                className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 bg-[#020814]/80 backdrop-blur-xl px-7 py-3.5 rounded-full border border-slate-700/50 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] z-10"
                style={{
                  opacity: pillBgOpacity,
                  y: pillY,
                }}
              >
                <span className="flex items-center text-sm font-semibold text-rose-300 tracking-wide">
                  <motion.span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e] mr-2.5" style={{ opacity: pillDotsOpacity }} />
                  <motion.span style={{ opacity: pillTextOpacity }}>Prioridades: {briefing.dimensions.prioritiesCount || 2}</motion.span>
                </span>
                <span className="text-slate-700/80">|</span>
                <span className="flex items-center text-sm font-semibold text-cyan-300 tracking-wide">
                  <motion.span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] mr-2.5" style={{ opacity: pillDotsOpacity }} />
                  <motion.span style={{ opacity: pillTextOpacity }}>Qué cambió: {briefing.dimensions.changesCount || 4}</motion.span>
                </span>
                <span className="text-slate-700/80">|</span>
                <span className="flex items-center text-sm font-semibold text-purple-300 tracking-wide">
                  <motion.span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7] mr-2.5" style={{ opacity: pillDotsOpacity }} />
                  <motion.span style={{ opacity: pillTextOpacity }}>Anomalías: {briefing.dimensions.anomaliesCount || 1}</motion.span>
                </span>
                <span className="text-slate-700/80">|</span>
                <span className="flex items-center text-sm font-semibold text-emerald-300 tracking-wide">
                  <motion.span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] mr-2.5" style={{ opacity: pillDotsOpacity }} />
                  <motion.span style={{ opacity: pillTextOpacity }}>Estables: {briefing.dimensions.stableCount || 10}</motion.span>
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* ================================================================= */}
        {/* ACT 2 & 3: DECISION DOCK HERO Y TRANSFERENCIA                     */}
        {/* ================================================================= */}
        <div className="decision-hero-container">
          <div className="decision-hero-layout">
            
            <div className="decision-hero-content">
              <motion.div 
                className="decision-badge"
                style={{
                  opacity: reduceMotion ? (isExiting ? 0 : 1) : heroBadgeOpacity,
                  y: reduceMotion ? 0 : heroBadgeY,
                  transition: isExiting ? 'opacity 0.6s ease' : 'none',
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>BRIEFING COMPLETADO</span>
              </motion.div>

              <motion.h2 
                className="decision-title"
                style={{
                  opacity: reduceMotion ? (isExiting ? 0 : 1) : heroTitleOpacity,
                  y: reduceMotion ? 0 : heroTitleY,
                  transition: isExiting ? 'opacity 0.6s ease' : 'none',
                }}
              >
                Ya tienes<br/>
                <span className="decision-title-highlight">lo importante.</span>
              </motion.h2>

              <motion.div
                style={{
                  opacity: reduceMotion ? (isExiting ? 0 : 1) : heroSubOpacity,
                  y: reduceMotion ? 0 : heroSubY,
                  transition: isExiting ? 'opacity 0.6s ease' : 'none',
                }}
              >
                <p className="decision-subtitle">Ahora decide qué quieres hacer con ello.</p>
                <p className="decision-microcopy">FOCUS mantiene disponible el contexto de este briefing.</p>
              </motion.div>
            </div>

            <motion.div 
              className="decision-dock-wrapper"
              style={{
                display: reduceMotion ? 'flex' : dockWrapperDisplay,
                opacity: isExiting ? 0 : 1, // Global fade out on exit
                transition: 'opacity 0.8s ease',
              }}
            >
              <div className="syn-dock-glow-wrapper w-full">
                {/* Rotating Cyan/Sky Border Beam Tracer */}
                <div className="syn-dock-border-tracer" />

                <div className="syn-dock-container group/dock">
                  
                  {/* 1. ASK FOCUS */}
                  <motion.button 
                    type="button"
                    className={`syn-dock-item syn-dock-item--ask ${hoveredAction === 'ask' ? 'is-hovered' : ''} ${hoveredAction && hoveredAction !== 'ask' ? 'is-dimmed' : ''}`}
                    style={{ opacity: reduceMotion ? 1 : askOpacity, y: reduceMotion ? 0 : askY }}
                    onMouseEnter={() => setHoveredAction('ask')}
                    onMouseLeave={() => setHoveredAction(null)}
                    onFocus={() => setHoveredAction('ask')}
                    onBlur={() => setHoveredAction(null)}
                    onClick={handleAskFocus}
                    aria-label="Preguntar a FOCUS"
                  >
                    <div className="syn-dock-item-bg" />
                    <div className="syn-dock-item-content">
                      <div className="flex w-full justify-between items-start">
                        <div className="syn-dock-icon-ask">✦</div>
                        <div className="syn-dock-badge">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] mr-1.5 inline-block" />
                          CONTEXTO ACTIVO
                        </div>
                      </div>
                      <div className="syn-dock-text">
                        <h4>Preguntar a FOCUS</h4>
                        <p>Profundiza en cualquier punto sin perder el contexto.</p>
                      </div>
                      <div className="syn-dock-ask-reveal mt-auto">FOCUS está listo para continuar.</div>
                    </div>
                    <div className="syn-dock-ask-fx">
                      <div className="syn-dock-ask-wave" />
                    </div>
                  </motion.button>

                  <div className="syn-dock-divider" />

                  {/* 2. RESUMEN */}
                  <motion.button 
                    type="button"
                    className={`syn-dock-item syn-dock-item--resumen ${hoveredAction === 'resumen' ? 'is-hovered' : ''} ${hoveredAction && hoveredAction !== 'resumen' ? 'is-dimmed' : ''}`}
                    style={{ opacity: reduceMotion ? 1 : resumenOpacity, y: reduceMotion ? 0 : resumenY }}
                    onMouseEnter={() => setHoveredAction('resumen')}
                    onMouseLeave={() => setHoveredAction(null)}
                    onFocus={() => setHoveredAction('resumen')}
                    onBlur={() => setHoveredAction(null)}
                    onClick={onInvestigate}
                    aria-label="Ver resumen"
                  >
                    <div className="syn-dock-item-bg" />
                    <div className="syn-dock-item-content">
                      <div className="syn-dock-resumen-icon">
                        <i /><i /><i />
                      </div>
                      <div className="syn-dock-text">
                        <h4>Ver resumen</h4>
                        <p>Consulta una versión compacta de los hallazgos.</p>
                      </div>
                      <div className="text-[10px] font-bold tracking-widest text-violet-400 opacity-80 mt-auto">
                        3 PUNTOS CLAVE
                      </div>
                    </div>
                  </motion.button>

                  <div className="syn-dock-divider" />

                  {/* 3. VOLVER */}
                  <motion.button 
                    type="button"
                    className={`syn-dock-item syn-dock-item--volver group/volver ${hoveredAction === 'volver' ? 'is-hovered' : ''} ${hoveredAction && hoveredAction !== 'volver' ? 'is-dimmed' : ''}`}
                    style={{ opacity: reduceMotion ? 1 : volverOpacity, y: reduceMotion ? 0 : volverY }}
                    onMouseEnter={() => setHoveredAction('volver')}
                    onMouseLeave={() => setHoveredAction(null)}
                    onFocus={() => setHoveredAction('volver')}
                    onBlur={() => setHoveredAction(null)}
                    onClick={handleExit}
                    aria-label="Volver a la plataforma"
                  >
                    <div className="syn-dock-item-bg" />
                    <div className="syn-dock-item-content">
                      <div className="syn-dock-volver-icon">
                        <div className="syn-dock-volver-frame" />
                      </div>
                      <div className="syn-dock-text">
                        <h4>Volver a la plataforma</h4>
                        <p>Regresa al trabajo con el panorama claro.</p>
                      </div>
                      <div className="flex items-center text-slate-400 group-hover/volver:text-f8fafc transition-colors mt-auto">
                        <ArrowRight className="syn-dock-arrow w-5 h-5" />
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="exit-overlay-dimmer" />
      </div>
    </section>
  );
};
