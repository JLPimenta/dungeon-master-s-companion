import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
  /** Nome do personagem, para a linha de resumo. */
  name: string;
  /** Informações curtas da linha de resumo (classe, nível...). Vazias são ignoradas. */
  summary: (string | false | null | undefined)[];
  /** Destaque à direita do resumo. Ex: "Proficiência: +3", "Defesa 18". */
  badge: ReactNode;
  children: ReactNode;
}

/**
 * Casca do cabeçalho da ficha, no mesmo comportamento do HeaderSection do
 * 5.5e: aberto por padrão; recolhido, vira uma linha com nome, resumo e
 * destaque. Os campos de cada sistema entram como children.
 */
export function SheetHeaderCard({ name, summary, badge, children }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const parts = summary.filter((p): p is string => typeof p === 'string' && p.trim().length > 0);

  return (
    <Card className="border-primary/20">
      <CardContent className="px-4 pb-4 pt-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {!isOpen && (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md border border-primary/30 bg-transparent px-4 py-3 text-left transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center">
                  <span className="truncate text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {name || 'Sem Nome'}
                  </span>
                  {parts.length > 0 && (
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground sm:mt-0">
                      {parts.map((p, i) => (
                        <span key={i} className="flex items-center">
                          <span className={i === 0 ? 'hidden px-2 text-border sm:inline' : 'px-2 text-border'}>|</span>
                          <span>{p}</span>
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="ml-auto flex flex-shrink-0 items-center gap-2">
                  <span className="whitespace-nowrap rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                    {badge}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </CollapsibleTrigger>
          )}

          <CollapsibleContent>
            {isOpen && (
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  aria-label="Recolher cabeçalho"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                >
                  <ChevronDown className="h-4 w-4 rotate-180" />
                </button>
              </div>
            )}
            {children}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
