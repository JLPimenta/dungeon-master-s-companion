import type { CharacterSheet, Weapon } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function WeaponsTable({ sheet, onChange }: Props) {
  const addWeapon = () => {
    onChange({
      weapons: [...sheet.weapons, { id: crypto.randomUUID(), name: '', attackBonus: '', damage: '', damageType: '', notes: '' }],
    });
  };

  const updateWeapon = (idx: number, patch: Partial<Weapon>) => {
    const weapons = [...sheet.weapons];
    weapons[idx] = { ...weapons[idx], ...patch };
    onChange({ weapons });
  };

  const removeWeapon = (idx: number) => {
    onChange({ weapons: sheet.weapons.filter((_, i) => i !== idx) });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-lg text-primary">Armas e Truques de Dano</CardTitle>
        <Button variant="ghost" size="sm" onClick={addWeapon} className="h-8 gap-1 text-sm">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {sheet.weapons.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma arma adicionada.</p>
        ) : (
          <div className="space-y-2">
            {sheet.weapons.map((w, i) => (
              <div key={w.id} className="grid grid-cols-[1fr_80px_80px_80px_1fr_32px] gap-2 items-end">
                <Input placeholder="Nome" value={w.name} onChange={e => updateWeapon(i, { name: e.target.value })} className="h-10 text-sm" />
                <Input placeholder="+Atq/CD" value={w.attackBonus} onChange={e => updateWeapon(i, { attackBonus: e.target.value })} className="h-10 text-sm" />
                <Input placeholder="Dano" value={w.damage} onChange={e => updateWeapon(i, { damage: e.target.value })} className="h-10 text-sm" />
                <Input placeholder="Tipo" value={w.damageType} onChange={e => updateWeapon(i, { damageType: e.target.value })} className="h-10 text-sm" />
                <Input placeholder="Notas" value={w.notes} onChange={e => updateWeapon(i, { notes: e.target.value })} className="h-10 text-sm" />
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive" onClick={() => removeWeapon(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
