/**
 * FOCUS — Bucle de animacion gestionado.
 *
 * Un requestAnimationFrame que solo consume CPU/GPU cuando de verdad hace falta:
 *   - se detiene si el elemento no esta en pantalla (IntersectionObserver)
 *   - se detiene si la pestana esta oculta
 *   - limita los FPS segun el nivel de rendimiento del equipo
 *
 * Esto conserva la animacion intacta; simplemente deja de dibujarla cuando
 * nadie la esta viendo. Es la mayor fuente de ahorro en equipos modestos,
 * porque el briefing monta todos los capitulos a la vez.
 */

import { getPerfConfig, subscribePerf } from './perfTier';

export interface ManagedLoopOptions {
  /** Elemento cuya visibilidad activa o detiene el bucle. */
  element?: Element | null;
  /** Se ejecuta en cada frame permitido. delta viene acotado a 0..50ms. */
  onFrame: (time: number, delta: number) => void;
  /** Se ejecuta al reanudar tras una pausa (util para resincronizar relojes). */
  onResume?: (time: number) => void;
  /** Tope de FPS propio; por defecto usa el del nivel detectado. */
  fpsCap?: number;
  root?: Element | Document | null;
  /** Margen de anticipacion del observer. */
  rootMargin?: string;
  /** Si devuelve false, el bucle se pausa aunque el elemento este visible. */
  shouldRun?: () => boolean;
}

export const startManagedLoop = (options: ManagedLoopOptions): (() => void) => {
  const { element, onFrame, onResume, rootMargin = '240px' } = options;

  let frameId = 0;
  let running = false;
  let disposed = false;
  let lastFrame = 0;
  let inViewport = true;
  let interval = 1000 / (options.fpsCap ?? getPerfConfig().fpsCap);

  const unsubscribe = subscribePerf((config) => {
    interval = 1000 / (options.fpsCap ?? config.fpsCap);
  });

  const tick = (time: number) => {
    if (!running) return;

    if (options.shouldRun && !options.shouldRun()) {
      frameId = window.requestAnimationFrame(tick);
      return;
    }

    const elapsed = time - lastFrame;
    // -1.5ms de tolerancia: evita perder un frame por redondeo del vsync.
    if (elapsed < interval - 1.5) {
      frameId = window.requestAnimationFrame(tick);
      return;
    }

    lastFrame = time;
    onFrame(time, Math.min(50, elapsed));
    frameId = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || disposed) return;
    running = true;
    const now = performance.now();
    lastFrame = now - interval;
    onResume?.(now);
    frameId = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(frameId);
  };

  const sync = () => {
    if (inViewport && !document.hidden) start();
    else stop();
  };

  const onVisibilityChange = () => sync();
  document.addEventListener('visibilitychange', onVisibilityChange);

  let observer: IntersectionObserver | null = null;
  const ioRoot = options.root ?? null;
  if (element && typeof IntersectionObserver !== 'undefined') {
    inViewport = false;
    observer = new IntersectionObserver(
      (entries) => {
        inViewport = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { root: ioRoot, rootMargin, threshold: 0 },
    );
    observer.observe(element);
  }

  sync();

  const dispose = () => {
    disposed = true;
    stop();
    unsubscribe();
    observer?.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };

  return dispose;
};
