import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  dangerDialogContent, dialogCancel, dialogConfirm, dialogDescription, dialogFooter, dialogTitle,
} from '@/components/account/ui';

interface Props {
  open: boolean;
  name: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteCharacterDialog({ open, name, onOpenChange, onConfirm, loading }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(dangerDialogContent, 'max-w-[440px]')}>
        <AlertDialogHeader className="space-y-0 text-left">
          <AlertDialogTitle className={cn(dialogTitle, 'text-danger-text')}>Excluir Ficha</AlertDialogTitle>
          <AlertDialogDescription className={dialogDescription}>
            Tem certeza que deseja excluir <strong className="text-foreground">{name}</strong>?
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={dialogFooter}>
          <AlertDialogCancel className={dialogCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={cn(dialogConfirm, 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
          >
            {loading ? 'Excluindo…' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
