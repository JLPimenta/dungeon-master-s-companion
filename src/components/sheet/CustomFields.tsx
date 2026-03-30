import { useState } from 'react';
import type { CharacterSheet, CustomField } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
  onBlur?: () => void;
}

export function CustomFields({ sheet, onChange, onBlur }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const addField = () => {
    const field: CustomField = { id: crypto.randomUUID(), section: 'geral', label: '', value: '' };
    onChange({ customFields: [...sheet.customFields, field] });
    setExpandedIds(prev => new Set(prev).add(field.id));
  };

  const updateField = (idx: number, patch: Partial<CustomField>) => {
    const customFields = [...sheet.customFields];
    customFields[idx] = { ...customFields[idx], ...patch };
    onChange({ customFields });
  };

  const removeField = (idx: number) => {
    onChange({ customFields: sheet.customFields.filter((_, i) => i !== idx) });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 pt-4 px-4">
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex w-full items-center justify-between"
        >
          <CardTitle className="text-lg text-primary">viteCampos Personalizáveis</CardTitle>
          <span className="text-muted-foreground">
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </span>
        </button>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-3 px-4 pb-4" onBlur={onBlur}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground hidden md:inline-block">Campos adicionais para regras extras</span>
            <Button variant="ghost" size="sm" onClick={addField} className="h-8 gap-1 text-sm shrink-0 ml-auto">
              <Plus className="h-4 w-4" /> Adicionar Campo
            </Button>
          </div>

          {sheet.customFields.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma anotação extra.
            </p>
          ) : (
            sheet.customFields.map((field, i) => {
              const isExpanded = expandedIds.has(field.id);
              return (
                <div key={field.id} className="rounded-md border border-border/40 p-1 md:p-3">
                  
                  {/* UNIFIED COLLAPSIBLE VIEW */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(field.id)}
                      className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium text-foreground truncate">
                        {field.label || 'Novo campo'}
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
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
                    )}
                  </div>

                </div>
              );
            })
          )}
        </CardContent>
      )}
    </Card>
  );
}
