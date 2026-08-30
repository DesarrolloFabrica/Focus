/**
 * FOCUS — Deteccion adaptativa de capacidad del equipo.
 *
 * Objetivo: conservar TODAS las animaciones y transiciones, pero ajustar
 * automaticamente su coste (radios de desenfoque, densidad de particulas,
 * DPR del canvas, tope de FPS) segun lo que el computador pueda sostener.
 *
 * Tres niveles:
 *   high     -> equipos con GPU/CPU holgada. Experiencia completa.
 *   balanced -> portatiles normales. Mismos efectos, coste reducido.
 *   lite     -> equipos modestos o graficos integrados. Mismos efectos, coste minimo.
 *
 * El nivel se publica en <html data-perf="..."> para que el CSS reaccione,
 * y se degrada solo si el FPS real cae de forma sostenida.
 */

export type PerfTier = 'high' | 'balanced' | 'lite';

export interface PerfConfig {
  tier: PerfTier;
  /** Tope de devicePixelRatio para los <canvas>. */
  maxDpr: number;
  /** Multiplicador de densidad de particulas. */
  particleScale: number;
  /** Tope de FPS de los bucles de canvas. */
  fpsCap: number;
  /** Permite shadowBlur en canvas (caro en GPU integradas). */
  canvasGlow: boolean;
  /** Permite estelas de particulas. */
  canvasTrails: boolean;
}

const CONFIGS: Record<PerfTier, PerfConfig> = {
  high: {
    tier: 'high',
    maxDpr: 1.5,
    particleScale: 1,
    fpsCap: 60,
    canvasGlow: true,
    canvasTrails: true,
  },
  balanced: {
    tier: 'balanced',
    maxDpr: 1.25,
    particleScale: 0.7,
    // En pantallas de 60 Hz, un limite de 45 termina saltando un vsync y se
    // convierte en ~30 FPS reales. Reducimos densidad y DPR, no la cadencia.
    fpsCap: 60,
    canvasGlow: true,
    canvasTrails: true,
  },
  lite: {
    tier: 'lite',
    maxDpr: 1,
    particleScale: 0.45,
    fpsCap: 60,
    canvasGlow: false,
    canvasTrails: false,
  },
};

const ORDER: PerfTier[] = ['high', 'balanced', 'lite'];

type Listener = (config: PerfConfig) => void;

const listeners = new Set<Listener>();
let current: PerfTier = 'balanced';
let pinned = false;
let monitorStarted = false;

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const readOverride = (): PerfTier | null => {
  if (!isBrowser) return null;
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('perf');
    const fromStorage = window.localStorage.getItem('focus:perf');
    const value = (fromQuery || fromStorage || '').toLowerCase();
    if (value === 'high' || value === 'balanced' || value === 'lite') return value;
  } catch {
    /* localStorage puede estar bloqueado: se ignora */
  }
  return null;
};

/** Heuristica estatica: nucleos, memoria, tipo de puntero y densidad de pantalla. */
const detectTier = (): PerfTier => {
  if (!isBrowser) return 'balanced';

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const dpr = window.devicePixelRatio || 1;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const shortSide = Math.min(window.screen?.width ?? 1280, window.screen?.height ?? 800);

  let score = 0;

  if (cores >= 12) score += 3;
  else if (cores >= 8) score += 2;
  else if (cores >= 6) score += 1;
  else if (cores <= 2) score -= 3;
  else if (cores <= 4) score -= 1;

  if (memory >= 8) score += 2;
  else if (memory >= 6) score += 1;
  else if (memory <= 2) score -= 3;
  else if (memory <= 4) score -= 1;

  // Movil o pantalla pequena: menos presupuesto de pixeles.
  if (coarsePointer) score -= 2;
  if (shortSide <= 820) score -= 1;

  // Pantalla muy densa sobre hardware modesto = muchisimos pixeles por frame.
  if (dpr > 2 && cores < 8) score -= 1;

  if (score >= 4) return 'high';
  if (score >= 0) return 'balanced';
  return 'lite';
};

const capTierForReducedMotion = (tier: PerfTier): PerfTier => {
  if (!isBrowser) return tier;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return tier;
  if (tier === 'high') return 'balanced';
  return tier;
};

const applyToDocument = (tier: PerfTier) => {
  if (!isBrowser) return;
  document.documentElement.setAttribute('data-perf', tier);
};

const setTier = (tier: PerfTier) => {
  if (tier === current) return;
  current = tier;
  applyToDocument(tier);
  const config = CONFIGS[tier];
  listeners.forEach((listener) => listener(config));
};

/**
 * Monitor adaptativo: si el FPS real se mantiene bajo, baja un nivel.
 * Solo degrada (nunca sube solo) para evitar oscilaciones visibles.
 */
const startMonitor = () => {
  if (!isBrowser || monitorStarted || pinned) return;
  monitorStarted = true;

  const SAMPLE = 70;
  let frames = 0;
  let accumulated = 0;
  let previous = performance.now();
  let strikes = 0;
  let warmup = 20; // ignora los primeros frames (montaje, fuentes, imagenes)

  const tick = (now: number) => {
    const delta = now - previous;
    previous = now;

    if (warmup > 0) {
      warmup -= 1;
      window.requestAnimationFrame(tick);
      return;
    }

    // Ignora saltos por pestana oculta o bloqueos externos.
    if (delta < 200) {
      accumulated += delta;
      frames += 1;
    }

    if (frames >= SAMPLE) {
      const avg = accumulated / frames;
      frames = 0;
      accumulated = 0;

      // Mas de 20ms de media = por debajo de 50fps sostenidos.
      if (avg > 20) {
        strikes += 1;
        if (strikes >= 1) {
          strikes = 0;
          const index = ORDER.indexOf(current);
          if (index < ORDER.length - 1) setTier(ORDER[index + 1]);
        }
      } else {
        strikes = 0;
      }
    }

    if (current !== 'lite') window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
};

export const initPerfTier = (): PerfConfig => {
  if (!isBrowser) return CONFIGS[current];

  const override = readOverride();
  if (override) {
    pinned = true;
    current = override;
    applyToDocument(current);
    return CONFIGS[current];
  }

  current = capTierForReducedMotion(detectTier());
  applyToDocument(current);

  // El monitor arranca cuando la pagina ya esta estable.
  if (document.readyState === 'complete') {
    window.setTimeout(startMonitor, 1200);
  } else {
    window.addEventListener('load', () => window.setTimeout(startMonitor, 1200), { once: true });
  }

  return CONFIGS[current];
};

export const getPerfConfig = (): PerfConfig => CONFIGS[current];

export const getPerfTier = (): PerfTier => current;

export const subscribePerf = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
