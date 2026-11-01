import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReadOnlyBanner({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-[15px] text-muted-foreground', className)}>
      Você está visualizando a ficha de <strong className="text-foreground">{name}</strong> em modo somente leitura.
      Nenhuma alteração será salva.
    </div>
  );
}

export function ReadOnlyBadge() {
  return (
    <span className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 text-sm text-primary-text">
      <Eye className="h-3.5 w-3.5" />
      Somente leitura
    </span>
  );
}
