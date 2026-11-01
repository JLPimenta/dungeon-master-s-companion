import { createContext, useContext, useState, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SheetCard } from './SheetCard';

/*
 * Blocos de texto com modo leitura → "Editar" → campos → "Concluir".
 * Só um bloco em edição por vez na ficha (EditingProvider).
 */

interface EditingState {
  editing: string | null;
  setEditing: (id: string | null) => void;
}

const EditingContext = createContext<EditingState | null>(null);

export function EditingProvider({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState<string | null>(null);
  return <EditingContext.Provider value={{ editing, setEditing }}>{children}</EditingContext.Provider>;
}

/** Estado de edição dos blocos. Fora do provider, cada bloco controla o seu. */
// eslint-disable-next-line react-refresh/only-export-components
export function useEditing(id: string) {
  const ctx = useContext(EditingContext);
  const [local, setLocal] = useState(false);
  if (!ctx) {
    return { isEditing: local, start: () => setLocal(true), done: () => setLocal(false) };
  }
  return {
    isEditing: ctx.editing === id,
    start: () => ctx.setEditing(id),
    done: () => ctx.setEditing(null),
  };
}

/** Fecha qualquer bloco em edição (ex.: ao trocar de aba). */
// eslint-disable-next-line react-refresh/only-export-components
export function useCloseEditing() {
  const ctx = useContext(EditingContext);
  return () => ctx?.setEditing(null);
}

export function EditToggle({ isEditing, onStart, onDone, label }: {
  isEditing: boolean;
  onStart: () => void;
  onDone: () => void;
  /** Nome do bloco para o rótulo acessível ("Editar talentos"). */
  label: string;
}) {
  return isEditing ? (
    <button
      type="button"
      onClick={onDone}
      className="h-9 rounded-md border border-primary/60 px-3 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-primary-text hover:bg-primary/10"
    >
      Concluir
    </button>
  ) : (
    <button
      type="button"
      onClick={onStart}
      aria-label={`Editar ${label.toLowerCase()}`}
      className="flex h-9 items-center gap-1.5 rounded-md px-2 text-[15px] text-muted-foreground hover:text-foreground"
    >
      <Pencil className="h-3.5 w-3.5" />
      Editar
    </button>
  );
}

interface ViewEditBlockProps {
  id: string;
  title: string;
  readOnly?: boolean;
  /** Conteúdo em modo leitura. */
  view: ReactNode;
  /** Campos em modo edição. */
  edit: ReactNode;
  anchor?: string;
  className?: string;
  onBlur?: () => void;
}

export function ViewEditBlock({ id, title, readOnly, view, edit, anchor, className, onBlur }: ViewEditBlockProps) {
  const { isEditing, start, done } = useEditing(id);
  const editing = isEditing && !readOnly;
  return (
    <SheetCard
      id={anchor}
      title={title}
      onBlur={onBlur}
      className={className}
      action={!readOnly && <EditToggle isEditing={editing} onStart={start} onDone={done} label={title} />}
    >
      {editing ? edit : view}
    </SheetCard>
  );
}

/** Texto longo em modo leitura, preservando quebras de linha. */
export function ReadText({ text, empty = 'Nada anotado ainda.', className }: { text?: string | null; empty?: string; className?: string }) {
  const t = (text ?? '').trim();
  return (
    <p className={cn('whitespace-pre-wrap text-base leading-relaxed', !t && 'italic text-muted-foreground', className)}>
      {t || empty}
    </p>
  );
}
