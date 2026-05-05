import type { CharacterSheet } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Swords, Shield } from 'lucide-react';
import { getProficiencyBonus } from '@/utils/calculations';

interface Props {
  character: CharacterSheet;
  onClick: () => void;
  onDelete: () => void;
}

export function CharacterCard({ character, onClick, onDelete }: Props) {
  const profBonus = getProficiencyBonus(character.level);

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

        {/* Name */}
        <h3 className="mb-3 pr-8 text-xl font-semibold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          {character.name || 'Sem Nome'}
        </h3>

        {/* Info rows */}
        <div className="space-y-1.5 text-sm">
          {character.class && (
            <div className="flex items-center gap-2 text-foreground">
              <Swords className="h-3.5 w-3.5 text-primary/70" />
              <span>{character.class}{character.subclass ? ` — ${character.subclass}` : ''}</span>
            </div>
          )}
          {character.species && (
            <div className="flex items-center gap-2 text-foreground">
              <Shield className="h-3.5 w-3.5 text-primary/70" />
              <span>{character.species}</span>
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="mt-4 flex items-center gap-4 border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <span>Nível {character.level}</span>
          <span>Proficiência +{profBonus}</span>
          <span>PV {character.hitPoints.current}/{character.hitPoints.max}</span>
        </div>
      </CardContent>
    </Card>
  );
}
