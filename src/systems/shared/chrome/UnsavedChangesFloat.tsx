import { Save, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetChrome } from './SheetChromeContext';

/**
 * Barra "Alterações foram realizadas, deseja salvá-las?" no visual novo.
 * Aparece com a MESMA regra da v1 (alteração pendente e salvamento automático
 * desligado). `aboveNav`: no celular, fica acima da navegação inferior.
 */
export function UnsavedChangesFloat({ aboveNav }: { aboveNav?: boolean }) {
  const { save, readOnly } = useSheetChrome();
  if (readOnly || !save?.showUnsavedBar) return null;

  return (
    <div
      role="status"
      className={cn(
        'fixed z-40 flex animate-in fade-in slide-in-from-bottom-4 duration-200',
        aboveNav
          ? 'inset-x-2.5 bottom-[calc(72px+10px+env(safe-area-inset-bottom))] flex-col gap-2 rounded-xl p-3'
          : 'bottom-6 left-1/2 -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-xl py-2 pl-5 pr-2',
        'border border-primary/70 bg-surface-raised shadow-[0_10px_28px_rgba(0,0,0,0.45)]',
      )}
    >
      <p className="text-base">Alterações foram realizadas, deseja salvá-las?</p>
      <div className={cn('flex gap-2', aboveNav && 'justify-end')}>
        <button
          type="button"
          onClick={save.onDiscard}
          disabled={save.isSaving}
          className="flex h-10 items-center gap-1.5 rounded-md px-3 text-[15px] text-muted-foreground hover:text-hp disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Descartar
        </button>
        <button
          type="button"
          onClick={save.onSave}
          disabled={save.isSaving}
          className="flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {save.isSaving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  );
}
