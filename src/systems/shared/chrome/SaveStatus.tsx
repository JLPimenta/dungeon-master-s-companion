import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetChrome } from './SheetChromeContext';

/** "Salvando…", "Salvo!" (some depois de 5 s, como na v1) ou "Não salvo". */
export function SaveStatus({ className, compact }: { className?: string; compact?: boolean }) {
  const { save, readOnly } = useSheetChrome();
  if (readOnly || !save) return null;

  let content: React.ReactNode = null;
  if (save.status === 'saving') {
    content = (<><Loader2 className="h-3.5 w-3.5 animate-spin" />{compact ? null : 'Salvando…'}</>);
  } else if (save.hasUnsavedChanges) {
    content = (<><span className="h-2 w-2 rounded-full bg-primary" />Não salvo</>);
  } else if (save.status === 'saved') {
    content = (<><Check className="h-3.5 w-3.5 text-green-500" />Salvo!</>);
  }
  if (!content) return null;

  return (
    <span role="status" className={cn('flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground', className)}>
      {content}
    </span>
  );
}
