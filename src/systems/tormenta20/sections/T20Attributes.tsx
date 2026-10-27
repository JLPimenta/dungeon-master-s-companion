import { HelpCircle } from 'lucide-react';
import { SheetSection } from '@/systems/shared/SheetSection';
import { NumericInput } from '@/components/ui/numeric-input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type T20SectionProps } from './common';
import { T20_ATTRIBUTES } from '../rules';
import type { T20Attribute } from '../types';

export function T20Attributes({ sheet, onChange, onBlur }: T20SectionProps) {
  const set = (key: T20Attribute, value: number) =>
    onChange({ attributes: { ...sheet.attributes, [key]: value } });

  return (
    <SheetSection
      onBlur={onBlur}
      title={
        <span className="flex items-center gap-1">
          Atributos
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 cursor-default text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>No Tormenta20, o valor do atributo já é o modificador usado nos testes.</p>
            </TooltipContent>
          </Tooltip>
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {T20_ATTRIBUTES.map(attr => (
          <label
            key={attr.key}
            className="flex flex-col items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 pb-2 pt-1.5"
            title={attr.name}
          >
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">{attr.abbr}</span>
            <NumericInput
              min={-10}
              max={20}
              fallback={0}
              value={sheet.attributes?.[attr.key] ?? 0}
              onChange={v => set(attr.key, v)}
              className="h-11 w-full text-center text-xl font-bold text-primary"
            />
          </label>
        ))}
      </div>
    </SheetSection>
  );
}
