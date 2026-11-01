import { useId } from 'react';
import { cn } from '@/lib/utils';

/*
 * Marca do Grimório: grimório fechado de frente, com lombada, capa, fecho e
 * um losango em engaste (o mesmo formato dos espaços de magia da ficha).
 * Guia: docs/redesign-v2/05-marca.md. Os recortes são transparentes
 * (máscara), então a marca funciona sobre qualquer fundo; a cor vem de
 * `currentColor`.
 */

interface GrimorioMarkProps {
  /** Lado em px. */
  size?: number;
  /** Texto acessível. Sem ele, a marca é decorativa (aria-hidden). */
  title?: string;
  /**
   * `full`: marca completa (a partir de 24 px).
   * `small`: versão simplificada para 16–20 px (sem fecho, losango maior).
   * `auto` (padrão): `small` abaixo de 24 px.
   */
  variant?: 'full' | 'small' | 'auto';
  className?: string;
}

/** Marca completa, grade 64 (mesma geometria do quadro 0 da animação). */
function FullShapes() {
  return (
    <g transform="translate(-2.5 0)">
      <rect x="21.5" y="6" width="29.5" height="52" rx="3" fill="#fff" />{/* bloco de páginas */}
      <rect x="13" y="6" width="6" height="52" rx="3" fill="#fff" />{/* lombada */}
      <rect x="19" y="3.5" width="34.5" height="50" rx="5.5" fill="#000" />{/* folga da capa */}
      <rect x="21.5" y="6" width="29.5" height="45" rx="3" fill="#fff" />{/* capa */}
      <rect x="42.5" y="22" width="15" height="13" rx="3" fill="#000" />{/* folga do fecho */}
      <rect x="44" y="23.5" width="12" height="10" rx="2" fill="#fff" />{/* fecho */}
      <polygon points="32,20.5 40,28.5 32,36.5 24,28.5" fill="#000" />{/* engaste */}
      <polygon points="32,24.25 36.25,28.5 32,32.75 27.75,28.5" fill="#fff" />{/* losango */}
    </g>
  );
}

/** Versão simplificada, grade 16, alinhada aos pixels. */
function SmallShapes() {
  return (
    <>
      <rect x="2" y="1" width="2" height="14" rx="1" fill="#fff" />
      <rect x="5" y="1" width="9" height="11" rx="1.2" fill="#fff" />
      <rect x="5" y="13" width="9" height="2" rx="0.6" fill="#fff" />
      <polygon points="9.5,3.5 12.5,6.5 9.5,9.5 6.5,6.5" fill="#000" />
      <polygon points="9.5,5 11,6.5 9.5,8 8,6.5" fill="#fff" />
    </>
  );
}

export function GrimorioMark({ size = 32, title, variant = 'auto', className }: GrimorioMarkProps) {
  const maskId = `grimorio-mark-${useId().replace(/:/g, '')}`;
  const small = variant === 'small' || (variant === 'auto' && size < 24);
  const vb = small ? 16 : 64;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      className={cn('shrink-0', className)}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={vb} height={vb}>
        <rect width={vb} height={vb} fill="#000" />
        {small ? <SmallShapes /> : <FullShapes />}
      </mask>
      <rect width={vb} height={vb} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
