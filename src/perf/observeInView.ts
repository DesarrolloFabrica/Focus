/**
 * Observa si un elemento esta (aproximadamente) en pantalla.
 * Se usa para que los manejadores de scroll de cada capitulo dejen de medir
 * geometria cuando su seccion no se esta viendo: con siete capitulos montados
 * a la vez, medir todos en cada frame era la causa principal del scroll a
 * tirones.
 */
export const observeInView = (
  element: Element,
  onChange: (inView: boolean) => void,
  rootMargin = '200px',
  root: Element | Document | null = null,
): (() => void) => {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true);
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];
      if (entry) onChange(entry.isIntersecting);
    },
    { root, rootMargin, threshold: 0 },
  );

  observer.observe(element);
  return () => observer.disconnect();
};

/** Respeta el marcador data-inview que pausa capitulos fuera de pantalla. */
export const isSubtreeInView = (element: Element): boolean => {
  const host = element.closest<HTMLElement>('[data-inview]');
  return !host || host.dataset.inview !== 'false';
};
