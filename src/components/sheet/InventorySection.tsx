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

export function InventorySection({ sheet, onChange }: Props) {
  const profBonus = getProficiencyBonus(sheet.level);
  const maxAttune = getAttunementSlots(profBonus);

  const addItem = () => {
    onChange({ inventory: [...sheet.inventory, { id: crypto.randomUUID(), name: '', quantity: 1, weight: 0, notes: '' }] });
  };
  const updateItem = (idx: number, patch: Partial<InventoryItem>) => {
    const inventory = [...sheet.inventory];
    inventory[idx] = { ...inventory[idx], ...patch };
    onChange({ inventory });
  };
  const removeItem = (idx: number) => {
    onChange({ inventory: sheet.inventory.filter((_, i) => i !== idx) });
  };

  const addAttuned = () => {
    if (sheet.attunedItems.length >= maxAttune) return;
    onChange({ attunedItems: [...sheet.attunedItems, { id: crypto.randomUUID(), name: '', description: '' }] });
  };
  const updateAttuned = (idx: number, patch: Partial<AttunedItem>) => {
    const attunedItems = [...sheet.attunedItems];
    attunedItems[idx] = { ...attunedItems[idx], ...patch };
    onChange({ attunedItems });
  };
  const removeAttuned = (idx: number) => {
    onChange({ attunedItems: sheet.attunedItems.filter((_, i) => i !== idx) });
  };

  const updateCoin = (key: keyof Coins, val: number) => {
    onChange({ coins: { ...sheet.coins, [key]: Math.max(0, val) } });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-lg text-primary">Inventário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-4 pb-4">
        {/* Equipment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Equipamento</Label>
            <Button variant="ghost" size="sm" onClick={addItem} className="h-8 gap-1 text-sm">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
          {sheet.inventory.map((item, i) => (
            <div key={item.id} className="mb-1.5 grid grid-cols-[1fr_50px_50px_1fr_36px] gap-2 items-center">
              <Input placeholder="Item" value={item.name} onChange={e => updateItem(i, { name: e.target.value })} className="h-9 text-sm" />
              <Input type="number" placeholder="Qtd" min={0} value={item.quantity} onChange={e => updateItem(i, { quantity: Number(e.target.value) || 0 })} className="h-9 text-sm" />
              <Input type="number" placeholder="Peso" min={0} step={0.1} value={item.weight} onChange={e => updateItem(i, { weight: Number(e.target.value) || 0 })} className="h-9 text-sm" />
              <Input placeholder="Notas" value={item.notes} onChange={e => updateItem(i, { notes: e.target.value })} className="h-9 text-sm" />
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => removeItem(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Attuned items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Itens Sintonizados ({sheet.attunedItems.length}/{maxAttune})</Label>
            <Button variant="ghost" size="sm" onClick={addAttuned} disabled={sheet.attunedItems.length >= maxAttune} className="h-8 gap-1 text-sm">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
          {sheet.attunedItems.map((item, i) => (
            <div key={item.id} className="mb-1.5 grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
              <Input placeholder="Nome" value={item.name} onChange={e => updateAttuned(i, { name: e.target.value })} className="h-9 text-sm" />
              <Input placeholder="Descrição" value={item.description} onChange={e => updateAttuned(i, { description: e.target.value })} className="h-9 text-sm" />
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => removeAttuned(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Coins */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Moedas</Label>
          <div className="grid grid-cols-5 gap-2">
            {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map(coin => (
              <div key={coin} className="text-center">
                <span className="text-sm font-semibold text-muted-foreground uppercase">{coin === 'cp' ? 'PC' : coin === 'sp' ? 'PP' : coin === 'ep' ? 'PE' : coin === 'gp' ? 'PO' : 'PL'}</span>
                <Input type="number" min={0} value={sheet.coins[coin]} onChange={e => updateCoin(coin, Number(e.target.value) || 0)} className="mt-1 h-9 text-center text-sm" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
