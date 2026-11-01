import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { SCROLL_REVEAL_CLASS, useScrollbarReveal } from './useScrollbarReveal';
import { useBreakpoint } from './useBreakpoint';

interface PanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Título em maiúsculas, ex.: "INFORMAÇÕES GERAIS". */
  title: string;
  children: ReactNode;
  className?: string;
}

const titleClass = 'font-heading text-[15px] font-bold uppercase tracking-[0.12em] text-primary-text';

/**
 * Painel de edição/consulta: folha que sobe de baixo no celular, diálogo
 * centralizado no tablet e no computador. Foco preso, Esc fecha e o foco
 * volta ao gatilho (Radix/vaul).
 */
export function Panel({ open, onOpenChange, title, children, className }: PanelProps) {
  const bp = useBreakpoint();
  const reveal = useScrollbarReveal();

  const body = (
    <div onScroll={reveal} className={cn(SCROLL_REVEAL_CLASS, 'max-h-[70vh] overflow-y-auto px-5 pb-6', className)}>
      {children}
    </div>
  );

  if (bp === 'phone') {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent aria-describedby={undefined} className="border-hairline bg-card">
          <DrawerTitle className={cn(titleClass, 'px-5 pb-3 pt-4')}>{title}</DrawerTitle>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-md gap-0 border-hairline bg-card p-0">
        <DialogTitle className={cn(titleClass, 'px-5 pb-3 pt-5')}>{title}</DialogTitle>
        {body}
      </DialogContent>
    </Dialog>
  );
}
