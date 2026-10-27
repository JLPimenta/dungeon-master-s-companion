import { AlertTriangle, Plus } from 'lucide-react';
import { SheetSection } from '@/systems/shared/SheetSection';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumericInput } from '@/components/ui/numeric-input';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { cn } from '@/lib/utils';
import { Computed, newId, type T20SectionProps } from './common';
import { carryCapacity, currentLoad, liftCapacity, MAX_WORN_ITEMS, wornCount } from '../rules';
import type { T20Item } from '../types';

const GRID = 'grid grid-cols-[1.75rem_1fr_3.5rem_3.5rem_2.25rem] items-center gap-2 sm:grid-cols-[1.75rem_2fr_4rem_4rem_2fr_2.25rem]';

/** Aceita "0,5" e "0.5" — espaços fracionários são comuns (flechas, poções). */
function SpacesInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Input
      aria-label="Espaços"
      inputMode="decimal"
      defaultValue={String(value ?? 0).replace('.', ',')}
      key={value}
      onBlur={e => {
        const parsed = parseFloat(e.target.value.replace(',', '.'));
        onChange(Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 10) / 10 : 0);
      }}
      className="h-9 px-1 text-center text-sm"
    />
  );
}

export function T20Equipment({ sheet, onChange, onBlur }: T20SectionProps) {
  const items = sheet.equipment ?? [];
  const strength = sheet.attributes?.for ?? 0;
  const load = currentLoad(sheet);
  const max = carryCapacity(strength);
  const worn = wornCount(sheet);
  const overloaded = load > max;

  const add = () => onChange({
    equipment: [...items, { id: newId(), name: '', quantity: 1, spaces: 1, worn: false, notes: '' }],
  });
  const update = (idx: number, patch: Partial<T20Item>) =>
    onChange({ equipment: items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  const remove = (idx: number) => onChange({ equipment: items.filter((_, i) => i !== idx) });

  return (
    <SheetSection
      title="Equipamento"
      collapse="always"
      onBlur={onBlur}
      aside={
        <Button variant="ghost" size="sm" onClick={add} className="h-8 gap-1 text-sm">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <Label className="text-xs text-muted-foreground">Carga atual</Label>
          <Computed className={cn('mt-1', overloaded && 'border-destructive/60 text-destructive')}>
            {String(load).replace('.', ',')} / {max}
          </Computed>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Levantar</Label>
          <Computed className="mt-1" title="O dobro da carga máxima">{liftCapacity(strength)}</Computed>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Vestidos</Label>
          <Computed className={cn('mt-1', worn > MAX_WORN_ITEMS && 'border-destructive/60 text-destructive')}>
            {worn} / {MAX_WORN_ITEMS}
          </Computed>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">T$</Label>
          <NumericInput min={0} value={sheet.money?.ts ?? 0} onChange={ts => onChange({ money: { ...sheet.money, ts } })} className="mt-1 h-10 text-center text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">TO</Label>
          <NumericInput min={0} value={sheet.money?.to ?? 0} onChange={to => onChange({ money: { ...sheet.money, to } })} className="mt-1 h-10 text-center text-sm" />
        </div>
      </div>

      {(overloaded || worn > MAX_WORN_ITEMS) && (
        <p className="mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span>
            {overloaded && 'Acima da carga máxima: o personagem está sobrecarregado. '}
            {worn > MAX_WORN_ITEMS && `Só ${MAX_WORN_ITEMS} itens vestidos dão seus benefícios ao mesmo tempo.`}
          </span>
        </p>
      )}

      {items.length === 0 ? (
        <p className="py-3 text-center text-sm text-muted-foreground">Nenhum item adicionado.</p>
      ) : (
        <div className="space-y-1.5">
          <div className={`${GRID} text-xs text-muted-foreground`} aria-hidden>
            <span title="Vestido">Vest.</span>
            <span>Item</span>
            <span className="text-center">Qtd.</span>
            <span className="text-center">Espaços</span>
            <span className="hidden sm:block">Notas</span>
            <span />
          </div>
          {items.map((item, idx) => (
            <div key={item.id} className={GRID}>
              <Checkbox
                checked={item.worn}
                onCheckedChange={v => update(idx, { worn: v === true })}
                aria-label={`${item.name || 'Item'} vestido`}
                className="justify-self-center"
              />
              <Input
                aria-label="Item"
                maxLength={120}
                placeholder="Item"
                value={item.name}
                onChange={e => update(idx, { name: e.target.value })}
                className="h-9 text-sm"
              />
              <NumericInput
                min={0}
                value={item.quantity ?? 1}
                onChange={quantity => update(idx, { quantity })}
                className="h-9 px-1 text-center text-sm"
              />
              <SpacesInput value={item.spaces} onChange={spaces => update(idx, { spaces })} />
              <Input
                aria-label="Notas"
                maxLength={300}
                placeholder="Notas"
                value={item.notes}
                onChange={e => update(idx, { notes: e.target.value })}
                className="hidden h-9 text-sm sm:block"
              />
              <ConfirmDeleteButton iconOnly className="h-9 w-9" onConfirm={() => remove(idx)} title="Remover item" />
            </div>
          ))}
        </div>
      )}
    </SheetSection>
  );
}
