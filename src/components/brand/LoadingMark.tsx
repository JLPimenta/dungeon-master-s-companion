import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LOADING_CYCLE_MS, STRAP, loadingFrame, type LoadingFrame } from './loadingGeometry';

interface LoadingMarkProps {
  /** Lado em px. Mínimo recomendado 48 (abaixo disso o livro aberto vira borrão). */
  size?: number;
  /** Cor dos recortes: precisa ser a cor do fundo onde a marca está. */
  cutoutColor?: string;
  className?: string;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Refs = {
  book: SVGGElement | null;
  pages: SVGPolygonElement | null;
  spine: SVGPolygonElement | null;
  coverHalo: SVGPolygonElement | null;
  cover: SVGPolygonElement | null;
  strap: SVGGElement | null;
  socket: SVGPolygonElement | null;
  gemHalo: SVGPolygonElement | null;
  gemBody: SVGPolygonElement | null;
  face: SVGGElement | null;
};

function apply(r: Refs, f: LoadingFrame) {
  r.book?.setAttribute('transform', f.bookTransform);
  r.pages?.setAttribute('points', f.pages);
  r.spine?.setAttribute('points', f.spine);
  r.spine?.setAttribute('opacity', f.spineOpacity);
  r.coverHalo?.setAttribute('points', f.cover);
  r.cover?.setAttribute('points', f.cover);
  r.strap?.setAttribute('opacity', f.strapOpacity);
  r.socket?.setAttribute('points', f.socket);
  r.socket?.setAttribute('opacity', f.socketOpacity);
  r.gemHalo?.setAttribute('points', f.gemHalo);
  r.gemBody?.setAttribute('points', f.gemBody);
  r.gemBody?.setAttribute('opacity', f.gemOpacity);
  r.face?.setAttribute('transform', f.faceTransform);
  r.face?.setAttribute('opacity', f.faceOpacity);
}

const FIRST = loadingFrame(0);

/**
 * Animação de carregamento: o losango se solta da capa, o livro recua, o
 * losango sobe como d20, o livro abre embaixo dele e tudo volta à marca
 * parada (ciclo de 4,2 s). Com "reduzir movimento", só o losango pulsa.
 *
 * Atualiza os atributos do SVG por ref a cada quadro (sem estado do React).
 */
export function LoadingMark({ size = 160, cutoutColor = 'hsl(var(--background))', className }: LoadingMarkProps) {
  const refs = useRef<Refs>({
    book: null, pages: null, spine: null, coverHalo: null, cover: null,
    strap: null, socket: null, gemHalo: null, gemBody: null, face: null,
  });

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const ms = now - start;
      apply(refs.current, loadingFrame((ms % LOADING_CYCLE_MS) / LOADING_CYCLE_MS, { reduced, ms }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const K = cutoutColor;
  const F = 'currentColor';
  const set = <Key extends keyof Refs>(key: Key) => (el: Refs[Key]) => { refs.current[key] = el; };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className={cn('shrink-0', className)}>
      <g ref={set('book')} transform={FIRST.bookTransform}>
        <polygon ref={set('pages')} points={FIRST.pages} fill={F} stroke={F} strokeWidth={6} strokeLinejoin="round" />
        <polygon ref={set('spine')} points={FIRST.spine} fill={F} stroke={F} strokeWidth={6} strokeLinejoin="round" opacity={FIRST.spineOpacity} />
        <polygon ref={set('coverHalo')} points={FIRST.cover} fill={K} stroke={K} strokeWidth={11} strokeLinejoin="round" />
        <polygon ref={set('cover')} points={FIRST.cover} fill={F} stroke={F} strokeWidth={6} strokeLinejoin="round" />
        <g ref={set('strap')} opacity={FIRST.strapOpacity}>
          <rect {...STRAP.halo} fill={K} />
          <rect {...STRAP.body} fill={F} />
        </g>
        <polygon ref={set('socket')} points={FIRST.socket} fill={K} opacity={FIRST.socketOpacity} />
      </g>
      <polygon ref={set('gemHalo')} points={FIRST.gemHalo} fill={K} />
      <polygon ref={set('gemBody')} points={FIRST.gemBody} fill={F} opacity={FIRST.gemOpacity} />
      <g ref={set('face')} transform={FIRST.faceTransform} opacity={FIRST.faceOpacity}>
        <polygon points="0,-6.5 6,4 -6,4" fill="none" stroke={K} strokeWidth={2} strokeLinejoin="round" />
        <path d="M0 -6.5 L0 -11 M6 4 L9.5 5.5 M-6 4 L-9.5 5.5" stroke={K} strokeWidth={2} />
      </g>
    </svg>
  );
}
