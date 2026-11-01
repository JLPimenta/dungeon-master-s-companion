import { useCallback, useEffect, useRef } from 'react';

const HIDE_AFTER_MS = 900;

/** Classe que acompanha o hook (definida em src/index.css). */
export const SCROLL_REVEAL_CLASS = 'scroll-reveal';

/**
 * Barra de rolagem visível só enquanto a área rola.
 *
 * Uso:
 *   const reveal = useScrollbarReveal();
 *   <div onScroll={reveal} className={cn(SCROLL_REVEAL_CLASS, 'overflow-y-auto')}>
 *
 * Liga o atributo `data-scrolling` durante a rolagem e o desliga 900 ms depois
 * do último evento; o CSS de `.scroll-reveal` mostra o polegar só nesse estado.
 */
export function useScrollbarReveal<T extends HTMLElement = HTMLDivElement>() {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback((e: React.UIEvent<T>) => {
    const el = e.currentTarget;
    if (!el.hasAttribute('data-scrolling')) el.setAttribute('data-scrolling', '');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => el.removeAttribute('data-scrolling'), HIDE_AFTER_MS);
  }, []);
}
