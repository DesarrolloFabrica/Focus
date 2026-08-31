/**
 * FOCUS — Bus unico de scroll para escenas sticky del briefing.
 * Un listener, una pasada de layout por frame, progreso via MotionValue.
 */

import { MotionValue, motionValue } from 'motion/react';

export interface BriefingSectionMetrics {
  progress: number;
  goingUp: boolean;
  rootHeight: number;
  rootTop: number;
  rootBottom: number;
  sectionTop: number;
  sectionBottom: number;
  sectionHeight: number;
  isInScrollport: boolean;
}

type MetricsListener = (metrics: BriefingSectionMetrics) => void;

interface RegisteredSection {
  element: HTMLElement;
  progress: MotionValue<number>;
  listeners: Set<MetricsListener>;
  lastOffset: number;
  isNearViewport: boolean;
  io: IntersectionObserver | null;
}

const sections = new Map<string, RegisteredSection>();

let scrollRoot: HTMLElement | null = null;
let frameId = 0;
let listening = false;
let rootTop = 0;
let rootHeight = 0;
let rootBottom = 0;

const measureRoot = () => {
  if (!scrollRoot) {
    rootTop = 0;
    rootHeight = window.innerHeight;
    rootBottom = rootHeight;
    return;
  }
  const rect = scrollRoot.getBoundingClientRect();
  rootTop = rect.top;
  rootHeight = scrollRoot.clientHeight;
  rootBottom = rootTop + rootHeight;
};

const publishSection = (entry: RegisteredSection, sectionRect: DOMRect) => {
  const totalDistance = Math.max(1, sectionRect.height - rootHeight);
  const currentOffset = rootTop - sectionRect.top;
  const progress = Math.max(0, Math.min(1, currentOffset / totalDistance));
  const goingUp = entry.lastOffset >= 0 && currentOffset < entry.lastOffset;
  entry.lastOffset = currentOffset;

  if (entry.progress.get() !== progress) {
    entry.progress.set(progress);
  }

  const metrics: BriefingSectionMetrics = {
    progress,
    goingUp,
    rootHeight,
    rootTop,
    rootBottom,
    sectionTop: sectionRect.top,
    sectionBottom: sectionRect.bottom,
    sectionHeight: sectionRect.height,
    isInScrollport: sectionRect.bottom > rootTop && sectionRect.top < rootBottom,
  };

  entry.listeners.forEach((listener) => listener(metrics));
};

const tick = () => {
  frameId = 0;
  if (sections.size === 0) return;

  measureRoot();

  sections.forEach((entry) => {
    if (!entry.isNearViewport && entry.lastOffset < 0) return;
    const sectionRect = entry.element.getBoundingClientRect();
    publishSection(entry, sectionRect);
  });
};

const scheduleTick = () => {
  if (frameId) return;
  frameId = window.requestAnimationFrame(tick);
};

const onScroll = () => scheduleTick();
const onResize = () => scheduleTick();

const ensureListening = () => {
  if (listening) return;
  listening = true;
  const target = scrollRoot ?? window;
  target.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
};

const stopListening = () => {
  if (!listening) return;
  listening = false;
  const target = scrollRoot ?? window;
  target.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onResize);
  if (frameId) {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }
};

const attachSectionObserver = (entry: RegisteredSection) => {
  if (typeof IntersectionObserver === 'undefined') {
    entry.isNearViewport = true;
    return;
  }

  entry.io?.disconnect();
  entry.io = new IntersectionObserver(
    (records) => {
      const hit = records[records.length - 1];
      if (!hit) return;
      entry.isNearViewport = hit.isIntersecting;
      if (hit.isIntersecting) scheduleTick();
    },
    { root: scrollRoot, rootMargin: '200px', threshold: 0 },
  );
  entry.io.observe(entry.element);
};

export const initBriefingScrollBus = (root: HTMLElement | null) => {
  scrollRoot = root;
  sections.forEach((entry) => attachSectionObserver(entry));
  if (sections.size > 0) {
    ensureListening();
    scheduleTick();
  }
};

export const registerBriefingSection = (
  id: string,
  element: HTMLElement,
  root?: HTMLElement | null,
): { progress: MotionValue<number>; subscribe: (listener: MetricsListener) => () => void } => {
  if (root !== undefined) scrollRoot = root;

  let entry = sections.get(id);
  if (!entry) {
    entry = {
      element,
      progress: motionValue(0),
      listeners: new Set(),
      lastOffset: -1,
      isNearViewport: false,
      io: null,
    };
    sections.set(id, entry);
  } else {
    entry.element = element;
    entry.lastOffset = -1;
  }

  attachSectionObserver(entry);
  ensureListening();
  scheduleTick();

  return {
    progress: entry.progress,
    subscribe: (listener) => {
      entry!.listeners.add(listener);
      return () => entry!.listeners.delete(listener);
    },
  };
};

export const unregisterBriefingSection = (id: string) => {
  const entry = sections.get(id);
  if (!entry) return;
  entry.io?.disconnect();
  entry.listeners.clear();
  sections.delete(id);
  if (sections.size === 0) stopListening();
};
