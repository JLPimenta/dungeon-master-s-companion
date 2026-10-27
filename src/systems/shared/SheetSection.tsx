import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Como a seção recolhe — os mesmos três comportamentos das seções do 5.5e:
 * - `none`:   nunca recolhe (Atributos, Perícias, Armas).
 * - `mobile`: aberta por padrão; o botão de recolher só existe abaixo de `lg`
 *             (Personalidade, Conjuração).
 * - `always`: recolhida por padrão em qualquer tela; o título inteiro é o botão
 *             (Inventário, Características, Notas da Campanha).
 */
export type SectionCollapse = 'none' | 'mobile' | 'always';

interface SectionProps {
  title: ReactNode;
  /**
   * Ação da seção (ex.: Adicionar). Fica no cabeçalho; em `always` vai para o
   * topo do conteúdo, porque o cabeçalho inteiro é o botão de recolher.
   */
  aside?: ReactNode;
  collapse?: SectionCollapse;
  /** Só para `always`: começa aberta. */
  defaultOpen?: boolean;
  /**
   * Ocupa toda a altura disponível na coluna (card que "estica" no fim da
   * coluna da direita, como Personalidade e História no 5.5e). O conteúdo
   * vira flex-col com flex-1.
   */
  fill?: boolean;
  onBlur?: () => void;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

const titleClass = 'text-lg text-primary';

/** Card padrão de seção de ficha, no mesmo estilo e comportamento das seções do 5.5e. */
export function SheetSection({
  title, aside, collapse = 'none', defaultOpen = false, fill = false,
  onBlur, className, contentClassName, children,
}: SectionProps) {
  const [open, setOpen] = useState(collapse === 'always' ? defaultOpen : true);
  const Chevron = open ? ChevronUp : ChevronDown;

  let header: ReactNode;
  if (collapse === 'always') {
    // Mesmas classes do botão das seções do 5.5e: a visualização compartilhada
    // reativa o clique só em `button.flex.w-full.items-center.justify-between`.
    header = (
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between"
      >
        <CardTitle className={titleClass}>{title}</CardTitle>
        <span className="text-muted-foreground"><Chevron className="h-4 w-4" /></span>
      </button>
    );
  } else {
    header = (
      <div className="flex w-full items-center justify-between gap-2">
        <CardTitle className={titleClass}>{title}</CardTitle>
        <div className="flex shrink-0 items-center gap-2">
          {aside}
          {collapse === 'mobile' && (
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-label={open ? 'Recolher seção' : 'Expandir seção'}
              className="p-1 text-muted-foreground transition-colors hover:text-primary lg:hidden"
            >
              <Chevron className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const hidden = !open && (collapse === 'always' ? 'hidden' : 'hidden lg:flex');

  return (
    <Card className={cn('border-primary/20', fill && 'flex h-full flex-col', className)}>
      <CardHeader className="px-4 pb-3 pt-4">{header}</CardHeader>
      <CardContent
        className={cn('flex flex-col px-4 pb-4', fill && 'flex-1', hidden, contentClassName)}
        onBlur={onBlur}
      >
        {collapse === 'always' && aside && <div className="mb-3 flex justify-end">{aside}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
