import type { CharacterCardData, SheetListItem } from '@/systems/types';
import { AVAILABLE_SYSTEMS, findSystem } from '@/systems/registry';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Swords, Shield } from 'lucide-react';

interface Props {
  character: SheetListItem;
  onClick: () => void;
  onDelete: () => void;
}

const DETAIL_ICONS = { class: Swords, origin: Shield } as const;

/**
 * Card genérico: o conteúdo vem de `card`, calculado pelo sistema da ficha
 * (no servidor, ou no cliente quando o item não traz `card`).
 */
export function CharacterCard({ character, onClick, onDelete }: Props) {
  const system = findSystem(character);
  const card: CharacterCardData | undefined =
    character.card ?? system?.buildCard(character as never);
  const showSystemBadge = AVAILABLE_SYSTEMS.length > 1 || !system;

  return (
    <Card
      className="group relative cursor-pointer border-border/60 bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(43_74%_49%/0.08)] active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Delete button */}
        <div onClick={(e) => e.stopPropagation()}>
          <ConfirmDeleteButton
            iconOnly
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            onConfirm={onDelete}
            title="Excluir ficha"
          />
        </div>

        {showSystemBadge && (
          <span className="mb-2 inline-block rounded-full border border-primary/30 px-2 py-0.5 text-[0.7rem] uppercase tracking-wider text-primary/80">
            {system?.shortLabel ?? 'Sistema não suportado'}
          </span>
        )}

        {/* Name */}
        <h3 className="mb-3 pr-8 text-xl font-semibold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          {character.name || 'Sem Nome'}
        </h3>

        {/* Info rows */}
        {card && card.details.length > 0 && (
          <div className="space-y-1.5 text-sm">
            {card.details.map(detail => {
              const Icon = DETAIL_ICONS[detail.kind] ?? Swords;
              return (
                <div key={`${detail.kind}-${detail.text}`} className="flex items-center gap-2 text-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary/70" />
                  <span>{detail.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-4 flex items-center gap-4 border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <span>Nível {character.level}</span>
          {card?.stats.map(stat => <span key={stat}>{stat}</span>)}
        </div>
      </CardContent>
    </Card>
  );
}
