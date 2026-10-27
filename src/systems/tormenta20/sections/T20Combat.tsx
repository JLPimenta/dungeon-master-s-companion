import { Checkbox } from '@/components/ui/checkbox';
import { SheetSection } from '@/systems/shared/SheetSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumericInput } from '@/components/ui/numeric-input';
import { AttributeSelect, Computed, type T20SectionProps } from './common';
import { armorPenaltyTotal, defenseTotal, formatBonus, sizeInfo, T20_SIZES } from '../rules';
import type { T20ArmorPiece, T20Resource, T20Size } from '../types';

function ResourceBox({
  label, value, onChange,
}: {
  label: string;
  value: T20Resource;
  onChange: (v: T20Resource) => void;
}) {
  const field = (key: keyof T20Resource, text: string) => (
    <div>
      <Label className="text-sm text-muted-foreground">{text}</Label>
      <NumericInput
        min={key === 'current' ? -999 : 0}
        value={value?.[key] ?? 0}
        onChange={v => onChange({ ...value, [key]: v })}
        className={key === 'current' ? 'mt-1 h-10 text-center text-base font-bold text-primary' : 'mt-1 h-10 text-center text-sm'}
      />
    </div>
  );

  return (
    <div className="rounded-md border border-primary/20 p-3">
      <p className="mb-2 text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {field('current', 'Atuais')}
        {field('max', 'Máximos')}
        {field('temp', 'Temporários')}
      </div>
    </div>
  );
}

function ArmorRow({ label, value, onChange }: { label: string; value: T20ArmorPiece; onChange: (v: T20ArmorPiece) => void }) {
  return (
    <div className="grid grid-cols-[1fr_4rem_4rem] items-end gap-2">
      <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <Input
          maxLength={100}
          value={value?.name ?? ''}
          onChange={e => onChange({ ...value, name: e.target.value })}
          placeholder="Nenhum"
          className="mt-1 h-10 text-sm"
        />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground">Defesa</Label>
        <NumericInput value={value?.bonus ?? 0} onChange={bonus => onChange({ ...value, bonus })} className="mt-1 h-10 text-center text-sm" />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground" title="Penalidade de armadura">Penal.</Label>
        <NumericInput min={0} value={value?.penalty ?? 0} onChange={penalty => onChange({ ...value, penalty })} className="mt-1 h-10 text-center text-sm" />
      </div>
    </div>
  );
}

export function T20Combat({ sheet, onChange, onBlur }: T20SectionProps) {
  const defense = defenseTotal(sheet);
  const size = sizeInfo(sheet.size);
  const penalty = armorPenaltyTotal(sheet);

  return (
    <SheetSection title="Combate" onBlur={onBlur}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResourceBox label="Pontos de Vida" value={sheet.hp} onChange={hp => onChange({ hp })} />
        <ResourceBox label="Pontos de Mana" value={sheet.mp} onChange={mp => onChange({ mp })} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[11rem_1fr]">
        {/* Defesa */}
        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-primary/30 bg-primary/5 p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Defesa</span>
          <span className="text-4xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{defense}</span>
          <span className="text-center text-[0.7rem] leading-tight text-muted-foreground">
            10 + atributo + armadura + escudo + outros
          </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[auto_1fr_4.5rem] items-end gap-2">
            <div>
              <Label className="text-sm text-muted-foreground">Atributo</Label>
              <AttributeSelect
                label="Atributo da Defesa"
                value={sheet.defense?.attribute ?? 'des'}
                onChange={attribute => onChange({ defense: { ...sheet.defense, attribute } })}
                className="mt-1 h-10 w-20"
                showChevron
              />
            </div>
            <div className="flex h-10 items-center gap-2">
              <Checkbox
                id="t20-heavy-armor"
                checked={sheet.defense?.heavyArmor ?? false}
                onCheckedChange={v => onChange({ defense: { ...sheet.defense, heavyArmor: v === true } })}
              />
              <label htmlFor="t20-heavy-armor" className="text-xs text-muted-foreground">Armadura pesada</label>
              {sheet.defense?.heavyArmor && (
                <label className="flex items-center gap-1 text-xs text-muted-foreground" title="Limite de atributo permitido na Defesa">
                  limite
                  <NumericInput
                    min={0}
                    value={sheet.defense?.attributeLimit ?? 0}
                    onChange={attributeLimit => onChange({ defense: { ...sheet.defense, attributeLimit } })}
                    className="h-7 w-10 px-1 text-center text-xs"
                  />
                </label>
              )}
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Outros</Label>
              <NumericInput
                value={sheet.defense?.other ?? 0}
                onChange={other => onChange({ defense: { ...sheet.defense, other } })}
                className="mt-1 h-10 text-center text-sm"
              />
            </div>
          </div>

          <ArmorRow label="Armadura" value={sheet.armor} onChange={armor => onChange({ armor })} />
          <ArmorRow label="Escudo" value={sheet.shield} onChange={shield => onChange({ shield })} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/40 pt-4 sm:grid-cols-4">
        <div>
          <Label className="text-sm text-muted-foreground">Tamanho</Label>
          <Select value={sheet.size ?? 'medio'} onValueChange={v => onChange({ size: v as T20Size })}>
            <SelectTrigger aria-label="Tamanho" className="mt-1 h-10 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {T20_SIZES.map(s => <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Furtividade / Manobras</Label>
          <Computed className="mt-1" title="Modificadores de tamanho">
            {formatBonus(size.stealth)} / {formatBonus(size.maneuver)}
          </Computed>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Deslocamento</Label>
          <Input maxLength={50} value={sheet.speed ?? ''} onChange={e => onChange({ speed: e.target.value })} className="mt-1 h-10 text-sm" />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Penalidade de armadura</Label>
          <Computed className="mt-1" title="Somada de armadura e escudo; aplicada às perícias marcadas com ✝">
            {penalty > 0 ? `−${penalty}` : '0'}
          </Computed>
        </div>
      </div>
    </SheetSection>
  );
}
