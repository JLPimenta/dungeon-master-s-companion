import { useEffect, useState } from 'react';

/**
 * Pontos de quebra do redesign v2 (docs/redesign-v2/02-arquitetura.md):
 * - phone:   < 1024 px (inclui tablet em retrato)
 * - tablet:  1024–1279 px
 * - desktop: ≥ 1280 px
 */
export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export const TABLET_MIN = 1024;
export const DESKTOP_MIN = 1280;

const TABLET_QUERY = `(min-width: ${TABLET_MIN}px)`;
const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN}px)`;

function read(): Breakpoint {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'desktop';
  if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop';
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet';
  return 'phone';
}

/** Renderize UM layout por vez com isto (não esconda os três com CSS). */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(read);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const queries = [window.matchMedia(TABLET_QUERY), window.matchMedia(DESKTOP_QUERY)];
    const onChange = () => setBp(read());
    queries.forEach(q => q.addEventListener('change', onChange));
    onChange();
    return () => queries.forEach(q => q.removeEventListener('change', onChange));
  }, []);

  return bp;
}
