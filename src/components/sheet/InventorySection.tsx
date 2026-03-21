import type { CharacterSheet, InventoryItem, AttunedItem, Coins } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { getProficiencyBonus, getAttunementSlots } from '@/utils/calculations';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

const COIN_LABELS: Record<keyof Coins, string> = {
  cp: 'PC', sp: 'PP', ep: 'PE', gp: 'PO', pp: 'PL',
};

export function InventorySection({ sheet, onChange }: Props) {
  const profBonus = getProficiencyBonus(sheet.level);
  const maxAttune = getAttunementSlots(profBonus);

  /* ── Equipment ── */
  const addItem = () => {
    onChange({
      inventory: [
        ...sheet.inventory,
        { id: crypto.randomUUID(), name: '', quantity: 1, weight: 0, notes: '' },
      ],
    });
  };
  const updateItem = (idx: number, patch: Partial<InventoryItem>) => {
    const inventory = [...sheet.inventory];
    inventory[idx] = { ...inventory[idx], ...patch };
    onChange({ inventory });
  };
  const removeItem = (idx: number) => {
    onChange({ inventory: sheet.inventory.filter((_, i) => i !== idx) });
  };

  /* ── Attuned items ── */
  const addAttuned = () => {
    if (sheet.attunedItems.length >= maxAttune) return;
    onChange({
      attunedItems: [
        ...sheet.attunedItems,
        { id: crypto.randomUUID(), name: '', description: '' },
      ],
    });
  };
  const updateAttuned = (idx: number, patch: Partial<AttunedItem>) => {
    const attunedItems = [...sheet.attunedItems];
    attunedItems[idx] = { ...attunedItems[idx], ...patch };
    onChange({ attunedItems });
  };
  const removeAttuned = (idx: number) => {
    onChange({ attunedItems: sheet.attunedItems.filter((_, i) => i !== idx) });
  };

  /* ── Coins ── */
  const updateCoin = (key: keyof Coins, val: number) => {
    onChange({ coins: { ...sheet.coins, [key]: Math.max(0, val) } });
  };

  return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm text-primary">Inventário</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-4 pb-4">

          {/* ════════════════════════════ Equipment ════════════════════════════ */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Equipamento</Label>
              <Button variant="ghost" size="sm" onClick={addItem} className="h-7 gap-1 text-xs shrink-0">
                <Plus className="h-3 w-3" /> Adicionar
              </Button>
            </div>

            {sheet.inventory.length > 0 && (
                /* Column headers — md+ only */
                <div className="mb-1 hidden md:grid md:grid-cols-[1fr_64px_64px_1fr_32px] gap-2 px-1">
                  <Label className="text-xs text-muted-foreground">Item</Label>
                  <Label className="text-xs text-muted-foreground">Qtd</Label>
                  <Label className="text-xs text-muted-foreground">Peso (lb)</Label>
                  <Label className="text-xs text-muted-foreground">Notas</Label>
                  <span />
                </div>
            )}

            <div className="space-y-2">
              {sheet.inventory.map((item, i) => (
                  <div key={item.id} className="rounded-md border border-border/40 p-3 md:border-0 md:p-0">
                    {/* Mobile: labeled 2-col card */}
                    <div className="grid grid-cols-2 gap-2 md:hidden">
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Item</Label>
                        <Input
                            placeholder="Nome do item"
                            value={item.name}
                            onChange={e => updateItem(i, { name: e.target.value })}
                            className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Quantidade</Label>
                        <Input
                            type="number"
                            min={0}
                            value={item.quantity}
                            onChange={e => updateItem(i, { quantity: Number(e.target.value) || 0 })}
                            className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Peso (lb)</Label>
                        <Input
                            type="number"
                            min={0}
                            step={0.1}
                            value={item.weight}
                            onChange={e => updateItem(i, { weight: Number(e.target.value) || 0 })}
                            className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Notas</Label>
                        <Input
                            placeholder="Observações…"
                            value={item.notes}
                            onChange={e => updateItem(i, { notes: e.target.value })}
                            className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <Button
                          variant="ghost"
                          size="sm"
                          className="col-span-2 h-7 justify-start gap-1 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(i)}
                      >
                        <Trash2 className="h-3 w-3" /> Remover
                      </Button>
                    </div>

                    {/* Desktop: single-row */}
                    <div className="hidden md:grid md:grid-cols-[1fr_64px_64px_1fr_32px] gap-2 items-center">
                      <Input
                          placeholder="Item"
                          value={item.name}
                          onChange={e => updateItem(i, { name: e.target.value })}
                          className="h-8 text-xs"
                      />
                      <Input
                          type="number"
                          min={0}
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={e => updateItem(i, { quantity: Number(e.target.value) || 0 })}
                          className="h-8 text-xs"
                      />
                      <Input
                          type="number"
                          min={0}
                          step={0.1}
                          placeholder="Peso"
                          value={item.weight}
                          onChange={e => updateItem(i, { weight: Number(e.target.value) || 0 })}
                          className="h-8 text-xs"
                      />
                      <Input
                          placeholder="Notas"
                          value={item.notes}
                          onChange={e => updateItem(i, { notes: e.target.value })}
                          className="h-8 text-xs"
                      />
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════ Attuned items ════════════════════════ */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Itens Sintonizados ({sheet.attunedItems.length}/{maxAttune})
              </Label>
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={addAttuned}
                  disabled={sheet.attunedItems.length >= maxAttune}
                  className="h-7 gap-1 text-xs shrink-0"
              >
                <Plus className="h-3 w-3" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {sheet.attunedItems.map((item, i) => (
                  <div key={item.id} className="rounded-md border border-border/40 p-3 md:border-0 md:p-0">
                    {/* Mobile */}
                    <div className="flex flex-col gap-2 md:hidden">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome</Label>
                        <Input
                            placeholder="Nome do item"
                            value={item.name}
                            onChange={e => updateAttuned(i, { name: e.target.value })}
                            className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Descrição / Efeito</Label>
                        <Input
                            placeholder="Propriedade ou efeito…"
                            value={item.description}
                            onChange={e => updateAttuned(i, { description: e.target.value })}
                            className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 justify-start gap-1 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => removeAttuned(i)}
                      >
                        <Trash2 className="h-3 w-3" /> Remover
                      </Button>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:grid md:grid-cols-[1fr_1fr_32px] gap-2 items-center">
                      <Input
                          placeholder="Nome"
                          value={item.name}
                          onChange={e => updateAttuned(i, { name: e.target.value })}
                          className="h-8 text-xs"
                      />
                      <Input
                          placeholder="Descrição"
                          value={item.description}
                          onChange={e => updateAttuned(i, { description: e.target.value })}
                          className="h-8 text-xs"
                      />
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeAttuned(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════ Coins ════════════════════════════
            Mobile:  2 cols  (PC + PP / PE + PO / PL sozinho)
            sm+:     5 cols  (todos em linha) */}
          <section>
            <Label className="mb-2 block text-xs text-muted-foreground">Moedas</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(Object.keys(COIN_LABELS) as (keyof Coins)[]).map(coin => (
                  <div key={coin}>
                    <Label className="block text-center text-xs font-semibold text-muted-foreground uppercase">
                      {COIN_LABELS[coin]}
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        value={sheet.coins[coin]}
                        onChange={e => updateCoin(coin, Number(e.target.value) || 0)}
                        className="mt-1 h-9 text-center text-xs"
                    />
                  </div>
              ))}
            </div>
          </section>

        </CardContent>
      </Card>
  );
}