import type { Weapon } from '@/types/character';
import { ExpandableList } from '@/systems/shared/ui/ExpandableList';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { TextField } from '@/systems/shared/ui/fields';
import { cn } from '@/lib/utils';
import { useDndSheet } from './context';

const newWeapon = (): Weapon => ({ id: crypto.randomUUID(), name: '', attackBonus: '', damage: '', damageType: '', notes: '' });

function WeaponForm({ w, set }: { w: Weapon; set: (p: Partial<Weapon>) => void }) {
  return (
    <>
      <TextField label="Nome" value={w.name} onChange={v => set({ name: v })} placeholder="Nome da arma" />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="+Atq / CD" value={w.attackBonus} onChange={v => set({ attackBonus: v })} placeholder="+5 / CD 13" />
        <TextField label="Dano" value={w.damage} onChange={v => set({ damage: v })} placeholder="1d8+3" />
      </div>
      <TextField label="Tipo" value={w.damageType} onChange={v => set({ damageType: v })} placeholder="Cortante" />
      <TextField label="Notas" value={w.notes} onChange={v => set({ notes: v })} placeholder="Propriedades…" />
    </>
  );
}

/**
 * Armas e truques de dano. `table`: colunas Nome | +Atq/CD | Dano | Tipo | Notas
 * (computador, altura máxima com rolagem); padrão: linhas com nome, ataque e dano.
 */
export function WeaponsList({ table, className, maxHeightClass }: { table?: boolean; className?: string; maxHeightClass?: string }) {
  const { sheet, update, readOnly } = useDndSheet();
  const weapons = sheet.weapons ?? [];
  const cols = 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.4fr)] gap-3';

  return (
    <SheetCard
      id="armas"
      title="Armas e truques de dano"
      meta={`${weapons.length} ${weapons.length === 1 ? 'ataque' : 'ataques'}`}
      className={className}
    >
      <div className={cn(maxHeightClass, maxHeightClass && 'overflow-y-auto pr-1')}>
        <ExpandableList<Weapon>
          items={weapons}
          onChange={list => update({ weapons: list })}
          createItem={newWeapon}
          addLabel="Nova arma"
          emptyText="Nenhuma arma ou truque de dano."
          readOnly={readOnly}
          header={table && weapons.length > 0 ? (
            <div className={cn(cols, 'px-3 pr-10 text-sm italic text-muted-foreground')}>
              <span>Nome</span><span>+Atq / CD</span><span>Dano</span><span>Tipo</span><span>Notas</span>
            </div>
          ) : undefined}
          renderSummary={w => table ? (
            <div className={cn(cols, 'items-center text-base')}>
              <span className="truncate font-semibold">{w.name || 'Nova arma'}</span>
              <span className="truncate font-heading font-bold text-primary-text">{w.attackBonus || '—'}</span>
              <span className="truncate">{w.damage || '—'}</span>
              <span className="truncate text-muted-foreground">{w.damageType || '—'}</span>
              <span className="truncate text-muted-foreground">{w.notes}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={cn('min-w-0 flex-1 truncate text-base font-semibold', !w.name && 'font-normal italic text-muted-foreground')}>
                {w.name || 'Nova arma'}
              </span>
              <span className="shrink-0 font-heading text-base font-bold text-primary-text">{w.attackBonus}</span>
              <span className="shrink-0 text-base">{w.damage}</span>
            </div>
          )}
          renderForm={(w, set) => <WeaponForm w={w} set={set} />}
        />
      </div>
    </SheetCard>
  );
}
