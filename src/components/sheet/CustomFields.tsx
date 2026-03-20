import type { CharacterSheet, CustomField } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function CustomFields({ sheet, onChange }: Props) {
  const addField = () => {
    const field: CustomField = { id: crypto.randomUUID(), section: 'geral', label: '', value: '' };
    onChange({ customFields: [...sheet.customFields, field] });
  };

  const updateField = (idx: number, patch: Partial<CustomField>) => {
    const customFields = [...sheet.customFields];
    customFields[idx] = { ...customFields[idx], ...patch };
    onChange({ customFields });
  };

  const removeField = (idx: number) => {
    onChange({ customFields: sheet.customFields.filter((_, i) => i !== idx) });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4">
        <CardTitle className="text-sm text-primary">Campos Personalizáveis</CardTitle>
        <Button variant="ghost" size="sm" onClick={addField} className="h-7 gap-1 text-xs">
          <Plus className="h-3 w-3" /> Adicionar Campo
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        {sheet.customFields.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Adicione campos para regras da casa ou informações extras.
          </p>
        ) : (
          sheet.customFields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
              <Input placeholder="Nome do campo" value={field.label} onChange={e => updateField(i, { label: e.target.value })} className="h-8 text-xs" />
              <Input placeholder="Valor" value={field.value} onChange={e => updateField(i, { value: e.target.value })} className="h-8 text-xs" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeField(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
