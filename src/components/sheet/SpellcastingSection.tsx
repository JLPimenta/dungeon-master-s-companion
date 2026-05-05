import { useState, useEffect } from 'react';
import type { CharacterSheet, Spell, AbilityKey } from '@/types/character';
import { ABILITY_LABELS } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  getAbilityModifier,
  getSpellSaveDC,
  getSpellAttackBonus,
  formatModifier, getEffectiveProficiencyBonus,
} from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
  onBlur?: () => void;
}

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const LEVEL_LABELS: Record<number, string> = {
  0: 'Truque', 1: '1º', 2: '2º', 3: '3º', 4: '4º',
  5: '5º', 6: '6º', 7: '7º', 8: '8º', 9: '9º',
};

export function SpellcastingSection({ sheet, onChange, onBlur }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(isMobile);
  }, []);

  const profBonus = getEffectiveProficiencyBonus(sheet);
  const abilityMod = sheet.spellcastingAbility
      ? getAbilityModifier(sheet, sheet.spellcastingAbility)
      : 0;
  const dc = sheet.spellcastingAbility ? getSpellSaveDC(abilityMod, profBonus) : 0;
  const attackBonus = sheet.spellcastingAbility
      ? getSpellAttackBonus(abilityMod, profBonus)
      : 0;

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    setExpandedIds(prev => new Set(prev).add(spell.id));
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
          <div className="flex w-full items-center justify-between">
            <CardTitle className="text-lg text-primary">Conjuração</CardTitle>
            <button
              type="button"
              onClick={() => setCollapsed(c => !c)}
              className="lg:hidden text-muted-foreground p-1 hover:text-primary transition-colors"
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </CardHeader>

        <CardContent className={`space-y-4 px-4 pb-4 ${collapsed ? 'hidden lg:block' : ''}`} onBlur={onBlur}>

          {/* ── Spellcasting ability row ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <Label className="text-sm text-muted-foreground">Atributo</Label>
              <Select
                  value={sheet.spellcastingAbility || 'none'}
                  onValueChange={v =>
                      onChange({ spellcastingAbility: v === 'none' ? '' : (v as AbilityKey) })
                  }
              >
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {(Object.keys(ABILITY_LABELS) as AbilityKey[]).map(k => (
                      <SelectItem key={k} value={k}>{ABILITY_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Modificador</Label>
              <div className="mt-1 flex h-10 items-center rounded-md border border-input px-3 text-sm font-bold text-primary">
                {formatModifier(abilityMod)}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">CD de Magia</Label>
              <div className="mt-1 flex h-10 items-center rounded-md border border-input px-3 text-sm font-bold text-primary">
                {dc}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Bônus de Ataque</Label>
              <div className="mt-1 flex h-10 items-center rounded-md border border-input px-3 text-sm font-bold text-primary">
                {formatModifier(attackBonus)}
              </div>
            </div>
          </div>

          {/* ── Spell slots ── */}
          <div>
            <Label className="mb-2 block text-sm text-muted-foreground">Espaços de Magia</Label>
            <div className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 lg:grid-cols-9">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lv => (
                  <div key={lv}>
                <span className="mb-1 block text-center text-xs text-muted-foreground">
                  {LEVEL_LABELS[lv]}
                </span>
                    <div className="flex items-center gap-1">
                      <NumericInput
                          min={0}
                          value={sheet.spellSlots[lv]?.used ?? 0}
                          onChange={v => updateSlot(lv, 'used', v)}
                          className="h-9 min-w-0 flex-1 px-1 text-center text-sm"
                          title="Usados"
                      />
                      <span className="shrink-0 text-xs text-muted-foreground">/</span>
                      <NumericInput
                          min={0}
                          value={sheet.spellSlots[lv]?.total ?? 0}
                          onChange={v => updateSlot(lv, 'total', v)}
                          className="h-9 min-w-0 flex-1 px-1 text-center text-sm"
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
              <Label className="text-sm text-muted-foreground">Magias</Label>
              <Button variant="ghost" size="sm" onClick={addSpell} className="h-8 gap-1 text-sm shrink-0">
                <Plus className="h-4 w-4" /> Adicionar Magia
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
                        <p className="mb-2 text-sm font-semibold text-primary/80">
                          {LEVEL_LABELS[lv]}{lv === 0 ? 's' : ' Círculo'}
                        </p>

                        <div className="space-y-2">
                          {sheet.spells
                              .filter(s => s.level === lv)
                              .map(spell => {
                                const idx = sheet.spells.findIndex(s => s.id === spell.id);
                                const isExpanded = expandedIds.has(spell.id);
                                return (
                                    <div
                                        key={spell.id}
                                        className="rounded-md border border-border/50 p-1 md:p-1 space-y-2"
                                    >
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => toggleExpanded(spell.id)}
                                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-primary/5 transition-colors"
                                        >
                                          <div className="flex items-center gap-3 md:gap-6 truncate w-full pr-4 py-1">
                                            <span className="text-sm text-muted-foreground w-[48px] shrink-0">{LEVEL_LABELS[spell.level]}</span>
                                            <span className="font-medium text-foreground min-w-[100px] md:w-56 truncate">
                                              {spell.name || 'Nova magia'}
                                            </span>
                                            
                                            {/* Extra details on large screens */}
                                            <span className="hidden md:inline-block text-xs text-muted-foreground w-28 truncate" title="Tempo">
                                              {spell.castingTime}
                                            </span>
                                            <span className="hidden md:inline-block text-xs text-muted-foreground w-28 truncate" title="Alcance">
                                              {spell.range}
                                            </span>
                                            <div className="hidden md:flex items-center gap-3 w-16">
                                              {spell.concentration && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded" title="Concentração">C</span>}
                                              {spell.ritual && <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded" title="Ritual">R</span>}
                                            </div>
                                          </div>
                                          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isExpanded && (
                                          <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="col-span-2 flex items-center gap-2">
                                              <Select
                                                  value={String(spell.level)}
                                                  onValueChange={v => updateSpell(idx, { level: Number(v) })}
                                              >
                                                <SelectTrigger className="h-9 w-24 shrink-0 text-sm">
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
                                                  className="h-9 flex-1 text-sm"
                                              />
                                            </div>

                                            <div>
                                              <Label className="text-sm text-muted-foreground">Tempo</Label>
                                              <Input
                                                  placeholder="1 ação"
                                                  value={spell.castingTime}
                                                  onChange={e => updateSpell(idx, { castingTime: e.target.value })}
                                                  className="mt-1 h-9 text-sm"
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-sm text-muted-foreground">Alcance</Label>
                                              <Input
                                                  placeholder="30 pés"
                                                  value={spell.range}
                                                  onChange={e => updateSpell(idx, { range: e.target.value })}
                                                  className="mt-1 h-9 text-sm"
                                              />
                                            </div>

                                            <div className="col-span-2">
                                              <Label className="text-sm text-muted-foreground">
                                                Notas / Material
                                              </Label>
                                              <Textarea
                                                  placeholder="Componentes, observações…"
                                                  value={spell.notes}
                                                  onChange={e => updateSpell(idx, { notes: e.target.value })}
                                                  className="mt-1 min-h-[60px] text-sm"
                                              />
                                            </div>

                                            <div className="flex items-center gap-4">
                                              <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
                                                <Checkbox
                                                    checked={spell.concentration}
                                                    onCheckedChange={c => updateSpell(idx, { concentration: !!c })}
                                                    className="h-4 w-4"
                                                />
                                                Concentração
                                              </label>
                                              <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
                                                <Checkbox
                                                    checked={spell.ritual}
                                                    onCheckedChange={c => updateSpell(idx, { ritual: !!c })}
                                                    className="h-4 w-4"
                                                />
                                                Ritual
                                              </label>
                                            </div>

                                              <div className="flex justify-end">
                                                <ConfirmDeleteButton
                                                    iconOnly={false}
                                                    className="h-8 gap-1 text-sm text-muted-foreground hover:text-destructive"
                                                    onConfirm={() => removeSpell(idx)}
                                                />
                                              </div>
                                          </div>
                                        )}
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