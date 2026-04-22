import { useState, useRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface ConfirmDeleteButtonProps extends Omit<ButtonProps, 'onClick'> {
  onConfirm: () => void;
  iconOnly?: boolean;
}

export function ConfirmDeleteButton({ 
  onConfirm, 
  iconOnly = true, 
  className, 
  title, 
  ...props 
}: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  // Revert state if user clicks outside
  useOnClickOutside(ref, () => setConfirming(false));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirming) {
      onConfirm();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  return (
    <Button
      ref={ref}
      type="button"
      variant={confirming ? 'destructive' : 'ghost'}
      size={iconOnly ? 'icon' : 'sm'}
      onClick={handleClick}
      title={confirming ? 'Clique novamente para excluir' : (title || 'Excluir')}
      className={cn(
        !confirming && 'text-muted-foreground hover:text-destructive',
        !iconOnly && 'h-8 px-2',
        className
      )}
      {...props}
    >
      <Trash2 className={cn("h-4 w-4", !iconOnly && "mr-1.5")} />
      {!iconOnly && (confirming ? 'Confirmar' : 'Remover')}
    </Button>
  );
}
