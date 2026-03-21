import type { CharacterSheet, Weapon } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function WeaponsTable({ sheet, onChange }: Props) {
  const addWeapon = () => {
    onChange({
      weapons: [
        ...sheet.weapons,
        { id: crypto.randomUUID(), name: '', attackBonus: '', damage: '', damageType: '', notes: '' },
      ],
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
          <CardTitle className="text-sm text-primary">Armas e Truques de Dano</CardTitle>
          <Button variant="ghost" size="sm" onClick={addWeapon} className="h-7 gap-1 text-xs shrink-0">
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          {sheet.weapons.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma arma adicionada.</p>
          ) : (
              <div className="space-y-3">
                {/* Column headers — visible md+ only */}
                <div className="hidden md:grid md:grid-cols-[1fr_90px_90px_90px_1fr_32px] gap-2 px-1">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Label className="text-xs text-muted-foreground">+Atq / CD</Label>
                  <Label className="text-xs text-muted-foreground">Dano</Label>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <Label className="text-xs text-muted-foreground">Notas</Label>
                  <span />
                </div>

                {sheet.weapons.map((w, i) => (
                    <div key={w.id} className="relative rounded-md border border-border/40 p-3 md:border-0 md:p-0">
                      {/* Mobile: stacked layout */}
                      <div className="grid grid-cols-2 gap-2 md:hidden">
                        <div className="col-span-2">
                          <Label className="text-xs text-muted-foreground">Nome</Label>
                          <Input
                              placeholder="Nome da arma"
                              value={w.name}
                              onChange={e => updateWeapon(i, { name: e.target.value })}
                              className="mt-1 h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">+Atq / CD</Label>
                          <Input
                              placeholder="+5 / CD 13"
                              value={w.attackBonus}
                              onChange={e => updateWeapon(i, { attackBonus: e.target.value })}
                              className="mt-1 h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Dano</Label>
                          <Input
                              placeholder="1d8+3"
                              value={w.damage}
                              onChange={e => updateWeapon(i, { damage: e.target.value })}
                              className="mt-1 h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Tipo</Label>
                          <Input
                              placeholder="Cortante"
                              value={w.damageType}
                              onChange={e => updateWeapon(i, { damageType: e.target.value })}
                              className="mt-1 h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Notas</Label>
                          <Input
                              placeholder="Propriedades…"
                              value={w.notes}
                              onChange={e => updateWeapon(i, { notes: e.target.value })}
                              className="mt-1 h-8 text-xs"
                          />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="col-span-2 h-7 text-xs text-muted-foreground hover:text-destructive justify-start gap-1"
                            onClick={() => removeWeapon(i)}
                        >
                          <Trash2 className="h-3 w-3" /> Remover
                        </Button>
                      </div>

                      {/* Desktop: single-row grid */}
                      <div className="hidden md:grid md:grid-cols-[1fr_90px_90px_90px_1fr_32px] gap-2 items-center">
                        <Input
                            placeholder="Nome"
                            value={w.name}
                            onChange={e => updateWeapon(i, { name: e.target.value })}
                            className="h-8 text-xs"
                        />
                        <Input
                            placeholder="+Atq / CD"
                            value={w.attackBonus}
                            onChange={e => updateWeapon(i, { attackBonus: e.target.value })}
                            className="h-8 text-xs"
                        />
                        <Input
                            placeholder="Dano"
                            value={w.damage}
                            onChange={e => updateWeapon(i, { damage: e.target.value })}
                            className="h-8 text-xs"
                        />
                        <Input
                            placeholder="Tipo"
                            value={w.damageType}
                            onChange={e => updateWeapon(i, { damageType: e.target.value })}
                            className="h-8 text-xs"
                        />
                        <Input
                            placeholder="Notas"
                            value={w.notes}
                            onChange={e => updateWeapon(i, { notes: e.target.value })}
                            className="h-8 text-xs"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeWeapon(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </CardContent>
      </Card>
  );
}