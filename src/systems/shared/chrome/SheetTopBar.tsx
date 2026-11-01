import type { ReactNode } from 'react';
import { ChevronLeft, Maximize, Minimize } from 'lucide-react';
import { GrimorioMark } from '@/components/brand/GrimorioMark';
import { cn } from '@/lib/utils';
import { useSheetChrome } from './SheetChromeContext';
import { SharePopover, iconButtonClass } from './SharePopover';
import { SaveStatus } from './SaveStatus';
import { ReadOnlyBadge } from './ReadOnlyBanner';

interface SheetTopBarProps {
  title: string;
  subtitle?: string;
  /** `arrow`: seta (celular). `mark`: marca do Grimório (computador). `none`: sem voltar (tablet usa o trilho). */
  back?: 'arrow' | 'mark' | 'none';
  /** Conteúdo entre o título e as ações (vitais, atalhos de seção). */
  children?: ReactNode;
  /** Botões de ícone com borda (tablet e computador). */
  bordered?: boolean;
  className?: string;
  innerClassName?: string;
  /** false: o status de salvamento fica em outro lugar (trilho do tablet). */
  showStatus?: boolean;
}

/** Fullscreen no mesmo estilo dos outros ícones. */
export function FullscreenButton({ bordered }: { bordered?: boolean }) {
  const { fullscreen } = useSheetChrome();
  if (!fullscreen) return null;
  return (
    <button
      type="button"
      onClick={fullscreen.onToggle}
      aria-label={fullscreen.active ? 'Sair da tela cheia' : 'Tela cheia'}
      className={cn(iconButtonClass, bordered && 'border border-border/60')}
    >
      {fullscreen.active ? <Minimize className="h-[18px] w-[18px]" /> : <Maximize className="h-[18px] w-[18px]" />}
    </button>
  );
}

export function BackButton({ variant }: { variant: 'arrow' | 'mark' }) {
  const { onBack } = useSheetChrome();
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Voltar aos personagens"
      className={cn(iconButtonClass, '-ml-1')}
    >
      {variant === 'arrow'
        ? <ChevronLeft className="h-6 w-6" />
        : <GrimorioMark size={30} className="text-primary-text" />}
    </button>
  );
}

/** Barra superior da ficha: voltar, nome, conteúdo do layout, compartilhar, tela cheia, status. */
export function SheetTopBar({
  title, subtitle, back = 'arrow', children, bordered, className, innerClassName, showStatus = true,
}: SheetTopBarProps) {
  const { readOnly } = useSheetChrome();
  return (
    <header className={cn('z-30 shrink-0 border-b border-border/50 bg-surface', className)}>
      <div className={cn('flex h-14 items-center gap-2 px-2', innerClassName)}>
        {back !== 'none' && <BackButton variant={back} />}
        <div className="min-w-0 shrink">
          <div className="truncate font-heading text-[17px] font-bold leading-tight text-primary-text">{title}</div>
          {subtitle && <div className="truncate text-sm leading-tight text-muted-foreground">{subtitle}</div>}
        </div>
        {children}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {readOnly ? <ReadOnlyBadge /> : showStatus && <SaveStatus />}
          <SharePopover bordered={bordered} />
          <FullscreenButton bordered={bordered} />
        </div>
      </div>
    </header>
  );
}
