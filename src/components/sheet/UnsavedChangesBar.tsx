import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnsavedChangesBarProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}

export function UnsavedChangesBar({ isVisible, onSave, onDiscard, isSaving }: UnsavedChangesBarProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-full border border-border/50 bg-background/95 px-4 sm:px-6 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <p className="text-md font-medium text-center sm:text-left">Alterações foram realizadas, deseja salvá-las?</p>
        <div className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 sm:border-l sm:border-border/50 sm:pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="h-8 gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Descartar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
