import type { AttunedItem, Coins, InventoryItem } from '@/types/character';
import { cn } from '@/lib/utils';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { ExpandableList } from '@/systems/shared/ui/ExpandableList';
import { NumberField } from '@/systems/shared/ui/NumberField';
import { NumberInputField, TextField } from '@/systems/shared/ui/fields';
import { useDndSheet } from './context';

const COINS: [keyof Coins, string][] = [['cp', 'PC'], ['sp', 'PP'], ['ep', 'PE'], ['gp', 'PO'], ['pp', 'PL']];

export function CoinsCard({ className, bare }: { className?: string; bare?: boolean }) {
  const { sheet, update, readOnly } = useDndSheet();
  const coins = sheet.coins ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  return (
    <SheetCard title="Moedas" className={className} bare={bare}>
      <div className="grid grid-cols-5 gap-2">
        {COINS.map(([k, label]) => (
          <label key={k} className="flex flex-col items-center gap-1">
            <span className="font-heading text-[13px] font-bold text-muted-foreground">{label}</span>
            <NumberField
              aria-label={`Moedas ${label}`}
              value={coins[k] ?? 0}
              min={0}
              maxDigits={7}
              disabled={readOnly}
              onChange={v => update({ coins: { ...coins, [k]: v } })}
              className="h-11 w-full rounded-md border border-hairline bg-background font-heading text-lg font-bold focus:border-primary"
            />
          </label>
        ))}
      </div>
    </SheetCard>
  );
}

const newAttuned = (): AttunedItem => ({ id: crypto.randomUUID(), name: '', description: '' });

/** Itens sintonizados; o limite vem da regra da edição (5.5e: proficiência; 5e: 3). */
export function AttunedList({ className, table, bare }: { className?: string; table?: boolean; bare?: boolean }) {
  const { sheet, update, readOnly, d, rules } = useDndSheet();
  const items = sheet.attunedItems ?? [];
  const full = items.length >= d.attunementLimit;
  return (
    <SheetCard
      title="Itens sintonizados"
      meta={`${items.length} / ${d.attunementLimit}${full ? ' · limite atingido' : ''}`}
      className={className}
      bare={bare}
    >
      <p className="-mt-2 text-sm italic text-muted-foreground">{rules.attunementNote}</p>
      <ExpandableList<AttunedItem>
        items={items}
        onChange={list => update({ attunedItems: list })}
        createItem={newAttuned}
        addLabel="Sintonizar item"
        addDisabled={full}
        addDisabledLabel="Limite de sintonização atingido"
        readOnly={readOnly}
        header={table && items.length > 0 ? (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 px-3 pr-10 text-sm italic text-muted-foreground">
            <span>Nome</span><span>Descrição / Efeito</span>
          </div>
        ) : undefined}
        renderSummary={it => (
          <div className={cn(table ? 'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3' : 'flex flex-col')}>
            <span className={cn('truncate text-base font-semibold', !it.name && 'font-normal italic text-muted-foreground')}>
              {it.name || 'Novo item sintonizado'}
            </span>
            {it.description && <span className="truncate text-sm text-muted-foreground">{it.description}</span>}
          </div>
        )}
        renderForm={(it, set) => (
          <>
            <TextField label="Nome" value={it.name} onChange={v => set({ name: v })} placeholder="Nome do item" />
            <TextField label="Descrição / Efeito" value={it.description} onChange={v => set({ description: v })} placeholder="Propriedade ou efeito…" />
          </>
        )}
      />
    </SheetCard>
  );
}

const newItem = (): InventoryItem => ({ id: crypto.randomUUID(), name: '', quantity: 1, weight: 0, notes: '' });

export function EquipmentList({ className, table, bare }: { className?: string; table?: boolean; bare?: boolean }) {
  const { sheet, update, readOnly, d } = useDndSheet();
  const items = sheet.inventory ?? [];
  const cols = 'grid grid-cols-[minmax(0,2fr)_56px_80px_minmax(0,1.5fr)] gap-3';
  return (
    <SheetCard title="Equipamento" meta={`${d.totalWeight} lb`} className={className} bare={bare}>
      <ExpandableList<InventoryItem>
        items={items}
        onChange={list => update({ inventory: list })}
        createItem={newItem}
        addLabel="Novo item"
        emptyText="Nenhum item na mochila."
        readOnly={readOnly}
        header={table && items.length > 0 ? (
          <div className={cn(cols, 'px-3 pr-10 text-sm italic text-muted-foreground')}>
            <span>Item</span><span>Qtd</span><span>Peso (lb)</span><span>Notas</span>
          </div>
        ) : undefined}
        renderSummary={it => table ? (
          <div className={cn(cols, 'items-center text-base')}>
            <span className={cn('truncate font-semibold', !it.name && 'font-normal italic text-muted-foreground')}>{it.name || 'Novo item'}</span>
            <span>{it.quantity}</span>
            <span>{it.weight ? it.weight : '—'}</span>
            <span className="truncate text-muted-foreground">{it.notes}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-9 shrink-0 font-heading font-bold text-muted-foreground">×{it.quantity}</span>
            <span className={cn('min-w-0 flex-1 truncate text-base font-semibold', !it.name && 'font-normal italic text-muted-foreground')}>
              {it.name || 'Novo item'}
            </span>
            <span className="shrink-0 text-sm text-muted-foreground">{it.weight ? `${it.weight} lb` : '—'}</span>
          </div>
        )}
        renderForm={(it, set) => (
          <>
            <TextField label="Item" value={it.name} onChange={v => set({ name: v })} placeholder="Nome do item" />
            <div className="grid grid-cols-2 gap-3">
              <NumberInputField label="Quantidade" value={it.quantity} min={0} maxDigits={4} onChange={v => set({ quantity: v })} />
              <NumberInputField label="Peso (lb)" value={it.weight} min={0} decimal maxDigits={4} onChange={v => set({ weight: v })} />
            </div>
            <TextField label="Notas" value={it.notes} onChange={v => set({ notes: v })} placeholder="Observações…" />
          </>
        )}
      />
    </SheetCard>
  );
}
