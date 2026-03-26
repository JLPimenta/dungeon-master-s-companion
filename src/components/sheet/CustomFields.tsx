import { useState } from 'react';
import type { CharacterSheet, CustomField } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
        <CardTitle className="text-lg text-primary">Campos Personalizáveis</CardTitle>
        <Button variant="ghost" size="sm" onClick={addField} className="h-8 gap-1 text-sm">
          <Plus className="h-4 w-4" /> Adicionar Campo
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {sheet.customFields.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Adicione campos para regras da casa ou informações extras.
          </p>
        ) : (
          sheet.customFields.map((field, i) => (
            <div key={field.id} className="rounded-md border border-border/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Input
                  placeholder="Nome do campo"
                  value={field.label}
                  onChange={e => updateField(i, { label: e.target.value })}
                  className="h-9 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeField(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Valor"
                value={field.value}
                onChange={e => updateField(i, { value: e.target.value })}
                className="min-h-[72px] resize-y text-sm"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
