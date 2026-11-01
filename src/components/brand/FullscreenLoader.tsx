import { useEffect, useState } from 'react';
import { LoadingMark } from './LoadingMark';

/** Carregamentos mais rápidos que isto não mostram nada (evita o livro piscando). */
export const LOADER_DELAY_MS = 400;

interface FullscreenLoaderProps {
  /** Texto de status lido por leitores de tela e mostrado abaixo da marca. */
  label?: string;
  /** Atraso antes de aparecer. Padrão 400 ms. */
  delayMs?: number;
}

/**
 * Tela de carregamento de página inteira com a animação da marca.
 * Use só em carregamentos de tela inteira (sessão, abrir ficha). Some assim
 * que o componente é desmontado — nunca espera o ciclo da animação terminar.
 */
export function FullscreenLoader({ label = 'Abrindo o grimório…', delayMs = LOADER_DELAY_MS }: FullscreenLoaderProps) {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-4" aria-busy="true">
      {visible && (
        <>
          <LoadingMark size={160} className="text-primary-text animate-in fade-in duration-150" />
          <p role="status" className="text-lg italic text-muted-foreground animate-in fade-in duration-150">
            {label}
          </p>
        </>
      )}
      {!visible && <span role="status" className="sr-only">{label}</span>}
    </div>
  );
}
