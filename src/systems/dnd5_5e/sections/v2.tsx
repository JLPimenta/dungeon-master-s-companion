/*
 * Seções exclusivas da ficha 5.5e no redesign v2: identidade, história e
 * personalidade, características de classe, traços de espécie, talentos e
 * treinamento em equipamento.
 */
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { SheetCard } from '@/systems/shared/ui/SheetCard';
import { ExpandableList } from '@/systems/shared/ui/ExpandableList';
import { useEditing, EditToggle } from '@/systems/shared/ui/ViewEditBlock';
import { TextAreaField, TextField } from '@/systems/shared/ui/fields';
import { useDndSheet } from '@/systems/dnd-common/v2/context';
import { TextBlockCard, type IdentityField } from '@/systems/shared/ui/IdentityGrid';
import { IdentityGrid } from '@/systems/shared/ui/IdentityGrid';
import { useDndIdentity } from '@/systems/dnd-common/v2/Header';
import type { Dnd55Sheet } from '../definition';

type FeatureView = { id: string; text: string };

/**
 * `classFeatures` é string[] (sem id). Mantém ids estáveis em paralelo para o
 * item aberto não "pular" quando outro é adicionado ou removido; se a lista
 * mudar por fora (descartar, recarregar), os ids são refeitos.
 */
function useStableIds(length: number) {
  const ids = useRef<string[]>([]);
  if (ids.current.length !== length) {
    ids.current = Array.from({ length }, () => crypto.randomUUID());
  }
  return ids;
}

export function FeaturesList({ className, bare }: { className?: string; bare?: boolean }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd55Sheet>();
  const features = sheet.classFeatures ?? [];
  const ids = useStableIds(features.length);
  const views: FeatureView[] = features.map((text, i) => ({ id: ids.current[i], text }));

  const onChange = (next: FeatureView[]) => {
    ids.current = next.map(v => v.id);
    update({ classFeatures: next.map(v => v.text) });
  };

  return (
    <SheetCard title="Características de classe" meta={features.length ? String(features.length) : undefined} className={className} bare={bare} id="tracos">
      <ExpandableList<FeatureView>
        items={views}
        onChange={onChange}
        createItem={() => ({ id: crypto.randomUUID(), text: '' })}
        addLabel="Nova característica"
        emptyText="Nenhuma característica anotada."
        readOnly={readOnly}
        renderSummary={f => {
          const nl = f.text.indexOf('\n');
          const title = (nl < 0 ? f.text : f.text.slice(0, nl)).trim();
          return (
            <span className={cn('block truncate text-base font-semibold', !title && 'font-normal italic text-muted-foreground')}>
              {title || 'Nova característica'}
            </span>
          );
        }}
        renderForm={(f, set) => (
          <TextAreaField
            label="Texto da característica"
            value={f.text}
            onChange={v => set({ text: v })}
            placeholder="Descreva a característica…"
            maxLength={1500}
            minRows={5}
          />
        )}
      />
    </SheetCard>
  );
}

/** Traços de espécie e Talentos. */
export function SpeciesAndFeats({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd55Sheet>();
  return (
    <>
      <TextBlockCard id="speciesTraits" title="Traços de espécie" value={sheet.speciesTraits} readOnly={readOnly}
        className={className} maxLength={5000} onChange={v => update({ speciesTraits: v })} />
      <TextBlockCard id="feats" title="Talentos" value={sheet.feats} readOnly={readOnly}
        className={className} maxLength={5000} onChange={v => update({ feats: v })} />
    </>
  );
}

const TRAINING = [
  ['armorTraining', 'Armaduras'],
  ['weaponTraining', 'Armas'],
  ['toolTraining', 'Ferramentas'],
] as const;

export function EquipmentTraining({ className }: { className?: string }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd55Sheet>();
  const { isEditing, start, done } = useEditing('training');
  const editing = isEditing && !readOnly;
  return (
    <SheetCard
      title="Treinamento em equipamento"
      className={className}
      action={!readOnly && <EditToggle isEditing={editing} onStart={start} onDone={done} label="treinamento em equipamento" />}
    >
      <div className="flex flex-col gap-2">
        {TRAINING.map(([key, label]) => editing ? (
          <TextField key={key} label={label} value={sheet[key]} onChange={v => update({ [key]: v })} />
        ) : (
          <div key={key} className="grid grid-cols-[110px_1fr] gap-2 text-base">
            <span className="italic text-muted-foreground">{label}</span>
            <span className={cn(!sheet[key] && 'text-muted-foreground')}>{sheet[key] || '—'}</span>
          </div>
        ))}
      </div>
    </SheetCard>
  );
}

/** Identidade completa (Perfil, celular e tablet). */
export const IDENTITY_55: IdentityField[] = [
  { key: 'name', label: 'Nome', wide: true, maxLength: 255 },
  { key: 'class', label: 'Classe', maxLength: 100 },
  { key: 'subclass', label: 'Subclasse' },
  { key: 'level', label: 'Nível', number: true, min: 1, max: 20 },
  { key: 'xp', label: 'XP', number: true, min: 0, maxDigits: 7 },
  { key: 'species', label: 'Espécie' },
  { key: 'background', label: 'Antecedente' },
  { key: 'alignment', label: 'Alinhamento' },
  { key: 'languages', label: 'Idiomas', maxLength: 500 },
];

/** Cabeçalho do computador (a v1 mostra estes; Alinhamento e Idiomas ficam em História). */
export const DESKTOP_IDENTITY_55: IdentityField[] = [
  { key: 'name', label: 'Nome', wide: true, maxLength: 255 },
  { key: 'class', label: 'Classe', maxLength: 100 },
  { key: 'subclass', label: 'Subclasse' },
  { key: 'level', label: 'Nível', number: true, min: 1, max: 20 },
  { key: 'species', label: 'Espécie' },
  { key: 'background', label: 'Antecedente' },
  { key: 'xp', label: 'XP', number: true, min: 0, maxDigits: 7 },
];

const PERSONA: IdentityField[] = [
  { key: 'alignment', label: 'Alinhamento' },
  { key: 'languages', label: 'Idiomas', maxLength: 500 },
];

/** História e personalidade. `withPersona`: inclui Alinhamento e Idiomas (computador). */
export function HistoryCard({ className, withPersona }: { className?: string; withPersona?: boolean }) {
  const { sheet, update, readOnly } = useDndSheet<Dnd55Sheet>();
  const identity = useDndIdentity();
  return (
    <TextBlockCard
      id="history"
      anchor="personalidade"
      title="História e personalidade"
      value={sheet.personalityAndHistory}
      onChange={v => update({ personalityAndHistory: v })}
      readOnly={readOnly}
      placeholder="Era uma vez..."
      empty="Era uma vez…"
      minRows={8}
      className={className}
    >
      {editing => withPersona && (
        <IdentityGrid fields={PERSONA} values={identity.values} onChange={identity.onChange} editing={editing} />
      )}
    </TextBlockCard>
  );
}
