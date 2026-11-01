import type { CharacterCardData, SheetListItem } from '@/systems/types';
import { AVAILABLE_SYSTEMS, findSystem } from '@/systems/registry';
import { Globe, Shield, Sword, Trash2 } from 'lucide-react';

interface Props {
  character: SheetListItem;
  onClick: () => void;
  onDelete: () => void;
}

const DETAIL_ICONS = { class: Sword, origin: Shield } as const;

/**
 * Card genérico: o conteúdo vem de `card`, calculado pelo sistema da ficha
 * (no servidor, ou no cliente quando o item não traz `card`).
 *
 * Redesign v2: o cartão inteiro abre a ficha; a lixeira fica sempre visível
 * (no toque não existe "passar o mouse") e abre o diálogo de exclusão.
 */
export function CharacterCard({ character, onClick, onDelete }: Props) {
  const system = findSystem(character);
  const card: CharacterCardData | undefined =
    character.card ?? system?.buildCard(character as never);
  const showSystemBadge = AVAILABLE_SYSTEMS.length > 1 || !system;
  const name = character.name || 'Sem Nome';

  return (
    <article className="group relative flex flex-col rounded-xl border border-hairline bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Abrir ficha de ${name}`}
        className="flex flex-1 flex-col gap-2.5 rounded-xl px-4 pb-3.5 pt-4 text-left transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
      >
        {showSystemBadge && (
          <span className="self-start rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-primary-text">
            {system?.shortLabel ?? 'Sistema não suportado'}
          </span>
        )}

        <span className="pr-10 font-heading text-xl font-bold leading-tight text-primary-text">{name}</span>

        {card && card.details.length > 0 && (
          <span className="flex flex-col gap-1 text-[15px]">
            {card.details.map(detail => {
              const Icon = DETAIL_ICONS[detail.kind] ?? Sword;
              return (
                <span key={`${detail.kind}-${detail.text}`} className="flex items-center gap-2 text-foreground">
                  <Icon className="h-[15px] w-[15px] shrink-0 text-primary-text" aria-hidden="true" />
                  <span className="min-w-0 truncate">{detail.text}</span>
                </span>
              );
            })}
          </span>
        )}

        <span className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-2.5 text-sm text-muted-foreground">
          <span>Nível <strong className="font-heading text-foreground">{character.level}</strong></span>
          {card?.stats.map(stat => <span key={stat}>{stat}</span>)}
          {character.isShared && (
            <span className="ml-auto flex items-center gap-1 text-primary-text">
              <Globe className="h-[13px] w-[13px]" aria-hidden="true" />
              Pública
            </span>
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete(); }}
        aria-label={`Excluir ficha de ${name}`}
        title="Excluir ficha"
        className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Trash2 className="h-[17px] w-[17px]" />
      </button>
    </article>
  );
}
