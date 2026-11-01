import { cn } from '@/lib/utils';
import { SheetCard } from './SheetCard';
import { EditToggle, ReadText, ViewEditBlock, useEditing } from './ViewEditBlock';
import { NumberInputField, TextAreaField, TextField } from './fields';

/*
 * Peças de texto do redesign que servem a qualquer sistema: grade de
 * identidade (Nome, Classe, Nível…) e blocos de texto longo com Editar/Concluir.
 */

export type IdentityField =
  | { key: string; label: string; wide?: boolean; maxLength?: number; placeholder?: string }
  | { key: string; label: string; number: true; min: number; max?: number; maxDigits?: number; wide?: boolean };

type Values = Record<string, unknown>;

/** Grade de identidade com leitura/edição. */
export function IdentityGrid({ fields, values, onChange, columns = 2, editing }: {
  fields: IdentityField[];
  values: Values;
  onChange: (key: string, value: string | number) => void;
  columns?: 2 | 3 | 4 | 8 | 9 | 10;
  editing: boolean;
}) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 8: 'grid-cols-8', 9: 'grid-cols-9', 10: 'grid-cols-10' }[columns];
  return (
    <div className={cn('grid gap-3', grid)}>
      {fields.map(f => {
        const span = f.wide ? 'col-span-2' : '';
        const value = values[f.key];
        if (editing) {
          return 'number' in f ? (
            <NumberInputField
              key={f.key}
              label={f.label}
              className={span}
              value={typeof value === 'number' ? value : 0}
              min={f.min}
              max={f.max}
              maxDigits={f.maxDigits ?? 2}
              onChange={v => onChange(f.key, v)}
            />
          ) : (
            <TextField
              key={f.key}
              label={f.label}
              className={span}
              value={typeof value === 'string' ? value : ''}
              maxLength={f.maxLength ?? 100}
              placeholder={f.placeholder}
              onChange={v => onChange(f.key, v)}
            />
          );
        }
        const empty = value === '' || value === undefined || value === null;
        return (
          <div key={f.key} className={cn('flex min-w-0 flex-col', span)}>
            <span className="text-sm italic text-muted-foreground">{f.label}</span>
            <span className={cn('truncate text-base', empty && 'text-muted-foreground')} title={empty ? undefined : String(value)}>
              {empty ? '—' : String(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Cartão "Perfil" (celular/tablet) com Editar/Concluir. */
export function ProfileCard({ fields, values, onChange, readOnly, title = 'Perfil', className }: {
  fields: IdentityField[];
  values: Values;
  onChange: (key: string, value: string | number) => void;
  readOnly: boolean;
  title?: string;
  className?: string;
}) {
  const { isEditing, start, done } = useEditing(`profile:${title}`);
  const editing = isEditing && !readOnly;
  return (
    <SheetCard
      title={title}
      className={className}
      action={!readOnly && <EditToggle isEditing={editing} onStart={start} onDone={done} label={title} />}
    >
      <IdentityGrid fields={fields} values={values} onChange={onChange} editing={editing} />
    </SheetCard>
  );
}

/** Bloco de texto longo com Editar/Concluir (traços, talentos, história…). */
export function TextBlockCard({
  id, title, value, onChange, readOnly, placeholder, maxLength = 10000, minRows = 6, empty, anchor, className, children,
}: {
  id: string;
  title: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  readOnly: boolean;
  placeholder?: string;
  maxLength?: number;
  minRows?: number;
  empty?: string;
  anchor?: string;
  className?: string;
  /** Conteúdo extra abaixo do texto (ex.: Alinhamento e Idiomas). Recebe se está em edição. */
  children?: (editing: boolean) => React.ReactNode;
}) {
  return (
    <ViewEditBlock
      id={id}
      anchor={anchor}
      title={title}
      readOnly={readOnly}
      className={className}
      view={
        <div className="flex flex-col gap-3">
          <ReadText text={value} empty={empty} />
          {children?.(false)}
        </div>
      }
      edit={
        <div className="flex flex-col gap-3">
          <TextAreaField label={title} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} minRows={minRows} />
          {children?.(true)}
        </div>
      }
    />
  );
}
