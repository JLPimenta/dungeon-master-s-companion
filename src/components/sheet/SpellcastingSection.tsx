import type { CharacterSheet, Spell, AbilityKey } from '@/types/character';
import { ABILITY_LABELS } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import {
  getAbilityModifier,
  getProficiencyBonus,
  getSpellSaveDC,
  getSpellAttackBonus,
  formatModifier,
} from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const LEVEL_LABELS: Record<number, string> = {
  0: 'Truque', 1: '1º', 2: '2º', 3: '3º', 4: '4º',
  5: '5º', 6: '6º', 7: '7º', 8: '8º', 9: '9º',
};

export function SpellcastingSection({ sheet, onChange }: Props) {
  const profBonus = getProficiencyBonus(sheet.level);
  const abilityMod = sheet.spellcastingAbility
      ? getAbilityModifier(sheet, sheet.spellcastingAbility)
      : 0;
  const dc = sheet.spellcastingAbility ? getSpellSaveDC(abilityMod, profBonus) : 0;
  const attackBonus = sheet.spellcastingAbility
      ? getSpellAttackBonus(abilityMod, profBonus)
      : 0;

  const addSpell = () => {
    const spell: Spell = {
      id: crypto.randomUUID(),
      level: 0,
      name: '',
      castingTime: '',
      range: '',
      concentration: false,
      ritual: false,
      notes: '',
      materialRequired: '',
    };
    onChange({ spells: [...sheet.spells, spell] });
  };

  const updateSpell = (idx: number, patch: Partial<Spell>) => {
    const spells = [...sheet.spells];
    spells[idx] = { ...spells[idx], ...patch };
    onChange({ spells });
  };

  const removeSpell = (idx: number) => {
    onChange({ spells: sheet.spells.filter((_, i) => i !== idx) });
  };

  const updateSlot = (level: number, field: 'total' | 'used', val: number) => {
    onChange({
      spellSlots: {
        ...sheet.spellSlots,
        [level]: { ...sheet.spellSlots[level], [field]: Math.max(0, val) },
      },
    });
  };

  return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm text-primary">Conjuração</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-4">
          {/* ── Spellcasting ability ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <Label className="text-xs text-muted-foreground">Atributo</Label>
              <Select
                  value={sheet.spellcastingAbility || 'none'}
                  onValueChange={v =>
                      onChange({ spellcastingAbility: v === 'none' ? '' : (v as AbilityKey) })
                  }
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {(Object.keys(ABILITY_LABELS) as AbilityKey[]).map(k => (
                      <SelectItem key={k} value={k}>
                        {ABILITY_LABELS[k]}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Modificador</Label>
              <div className="mt-1 flex h-9 items-center rounded-md border border-input px-3 text-sm font-bold text-primary">
                {formatModifier(abilityMod)}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CD de Magia</Label>
              <div className="mt-1 flex h-9 items-center rounded-md border border-input px-3 text-sm font-bold text-primary">
                {dc}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bônus de Ataque</Label>
              <div className="mt-1 flex h-9 items-center rounded-md border border-input px-3 text-sm font-bold text-primary">
                {formatModifier(attackBonus)}
              </div>
            </div>
          </div>

          {/* ── Spell slots ──
            Mobile:  3 cols  (slots 1-3 / 4-6 / 7-9)
            sm+:     5 cols
            lg+:     9 cols (tudo numa linha) */}
          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">Espaços de Magia</Label>
            <div className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 lg:grid-cols-9">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lv => (
                  <div key={lv}>
                <span className="mb-1 block text-center text-xs text-muted-foreground">
                  {LEVEL_LABELS[lv]}
                </span>
                    {/* "usado / total" side by side inside each cell */}
                    <div className="flex items-center gap-1">
                      <Input
                          type="number"
                          min={0}
                          value={sheet.spellSlots[lv]?.used ?? 0}
                          onChange={e => updateSlot(lv, 'used', Number(e.target.value))}
                          className="h-8 min-w-0 flex-1 px-1 text-center text-xs"
                          title="Usados"
                      />
                      <span className="shrink-0 text-xs text-muted-foreground">/</span>
                      <Input
                          type="number"
                          min={0}
                          value={sheet.spellSlots[lv]?.total ?? 0}
                          onChange={e => updateSlot(lv, 'total', Number(e.target.value))}
                          className="h-8 min-w-0 flex-1 px-1 text-center text-xs"
                          title="Total"
                      />
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* ── Spell list ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Magias</Label>
              <Button variant="ghost" size="sm" onClick={addSpell} className="h-7 gap-1 text-xs">
                <Plus className="h-3 w-3" /> Adicionar Magia
              </Button>
            </div>

            {sheet.spells.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma magia adicionada.
                </p>
            ) : (
                <div className="space-y-4">
                  {SPELL_LEVELS.filter(lv => sheet.spells.some(s => s.level === lv)).map(lv => (
                      <div key={lv}>
                        <p className="mb-2 text-xs font-semibold text-primary/80">
                          {LEVEL_LABELS[lv]}{lv === 0 ? 's' : ' Círculo'}
                        </p>

                        <div className="space-y-2">
                          {sheet.spells
                              .filter(s => s.level === lv)
                              .map(spell => {
                                const idx = sheet.spells.findIndex(s => s.id === spell.id);
                                return (
                                    <div
                                        key={spell.id}
                                        className="rounded-md border border-border/40 p-3 md:border-0 md:p-0"
                                    >
                                      {/* Mobile: 2-column card layout */}
                                      <div className="grid grid-cols-2 gap-2 md:hidden">
                                        <div className="col-span-2 flex items-center gap-2">
                                          {/* Level selector */}
                                          <Select
                                              value={String(spell.level)}
                                              onValueChange={v => updateSpell(idx, { level: Number(v) })}
                                          >
                                            <SelectTrigger className="h-8 w-20 shrink-0 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {SPELL_LEVELS.map(l => (
                                                  <SelectItem key={l} value={String(l)}>
                                                    {LEVEL_LABELS[l]}
                                                  </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Input
                                              placeholder="Nome"
                                              value={spell.name}
                                              onChange={e => updateSpell(idx, { name: e.target.value })}
                                              className="h-8 flex-1 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <Label className="text-xs text-muted-foreground">Tempo</Label>
                                          <Input
                                              placeholder="1 ação"
                                              value={spell.castingTime}
                                              onChange={e => updateSpell(idx, { castingTime: e.target.value })}
                                              className="mt-1 h-8 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Alcance</Label>
                                          <Input
                                              placeholder="30 pés"
                                              value={spell.range}
                                              onChange={e => updateSpell(idx, { range: e.target.value })}
                                              className="mt-1 h-8 text-xs"
                                          />
                                        </div>

                                        <div className="col-span-2">
                                          <Label className="text-xs text-muted-foreground">
                                            Notas / Material
                                          </Label>
                                          <Input
                                              placeholder="Componentes, observações…"
                                              value={spell.notes}
                                              onChange={e => updateSpell(idx, { notes: e.target.value })}
                                              className="mt-1 h-8 text-xs"
                                          />
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
                                            <Checkbox
                                                checked={spell.concentration}
                                                onCheckedChange={c =>
                                                    updateSpell(idx, { concentration: !!c })
                                                }
                                                className="h-4 w-4"
                                            />
                                            C
                                          </label>
                                          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
                                            <Checkbox
                                                checked={spell.ritual}
                                                onCheckedChange={c => updateSpell(idx, { ritual: !!c })}
                                                className="h-4 w-4"
                                            />
                                            R
                                          </label>
                                        </div>

                                        <div className="flex justify-end">
                                          <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                                              onClick={() => removeSpell(idx)}
                                          >
                                            <Trash2 className="h-3 w-3" /> Remover
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Desktop: single-row grid
                                cols: [círculo | nome | tempo | alcance | conc | ritual | notas | ×] */}
                                      <div className="hidden md:grid md:grid-cols-[72px_1fr_90px_90px_auto_auto_1fr_32px] gap-1.5 items-center">
                                        <Select
                                            value={String(spell.level)}
                                            onValueChange={v => updateSpell(idx, { level: Number(v) })}
                                        >
                                          <SelectTrigger className="h-7 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {SPELL_LEVELS.map(l => (
                                                <SelectItem key={l} value={String(l)}>
                                                  {LEVEL_LABELS[l]}
                                                </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>

                                        <Input
                                            placeholder="Nome"
                                            value={spell.name}
                                            onChange={e => updateSpell(idx, { name: e.target.value })}
                                            className="h-7 text-xs"
                                        />
                                        <Input
                                            placeholder="Tempo"
                                            value={spell.castingTime}
                                            onChange={e => updateSpell(idx, { castingTime: e.target.value })}
                                            className="h-7 text-xs"
                                        />
                                        <Input
                                            placeholder="Alcance"
                                            value={spell.range}
                                            onChange={e => updateSpell(idx, { range: e.target.value })}
                                            className="h-7 text-xs"
                                        />

                                        <div className="flex items-center gap-1">
                                          <Checkbox
                                              checked={spell.concentration}
                                              onCheckedChange={c =>
                                                  updateSpell(idx, { concentration: !!c })
                                              }
                                              className="h-3.5 w-3.5"
                                          />
                                          <span className="text-[15px] text-muted-foreground">C</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Checkbox
                                              checked={spell.ritual}
                                              onCheckedChange={c => updateSpell(idx, { ritual: !!c })}
                                              className="h-3.5 w-3.5"
                                          />
                                          <span className="text-[15px] text-muted-foreground">R</span>
                                        </div>

                                        <Input
                                            placeholder="Notas / Material"
                                            value={spell.notes}
                                            onChange={e => updateSpell(idx, { notes: e.target.value })}
                                            className="h-7 text-xs"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeSpell(idx)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                );
                              })}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
  );
}