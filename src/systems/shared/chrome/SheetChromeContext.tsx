import { createContext, useContext, type ReactNode } from 'react';

/*
 * O que a página da ficha entrega ao layout de um sistema com `ownsChrome`.
 *
 * Toda a lógica (salvar, descartar, compartilhar, tela cheia) continua em
 * src/pages/CharacterSheet.tsx e SharedCharacterSheet.tsx; este contexto só a
 * expõe para o layout desenhar a barra superior no visual novo.
 */

export type SaveStatus = 'idle' | 'saving' | 'saved';

export interface SheetChrome {
  readOnly: boolean;
  onBack: () => void;
  save?: {
    status: SaveStatus;
    hasUnsavedChanges: boolean;
    autoSaveEnabled: boolean;
    /** Regra da v1: há alteração pendente E o salvamento automático está desligado. */
    showUnsavedBar: boolean;
    isSaving: boolean;
    onSave: () => void;
    onDiscard: () => void;
  };
  /** Ausente no modo somente leitura. */
  share?: {
    isShared: boolean;
    link: string;
    onToggle: (checked: boolean) => void;
    onCopyLink: () => void;
  };
  /** Ausente quando o navegador não suporta tela cheia. */
  fullscreen?: {
    active: boolean;
    onToggle: () => void;
  };
}

const READ_ONLY_FALLBACK: SheetChrome = { readOnly: true, onBack: () => {} };

const SheetChromeContext = createContext<SheetChrome | null>(null);

export function SheetChromeProvider({ value, children }: { value: SheetChrome; children: ReactNode }) {
  return <SheetChromeContext.Provider value={value}>{children}</SheetChromeContext.Provider>;
}

/**
 * Dados da página para a barra superior. Fora de um provider (testes,
 * pré-visualizações) devolve um modo somente leitura sem ações.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSheetChrome(): SheetChrome {
  return useContext(SheetChromeContext) ?? READ_ONLY_FALLBACK;
}

/** `document.fullscreenEnabled`, protegido para ambientes sem DOM completo. */
// eslint-disable-next-line react-refresh/only-export-components
export function isFullscreenSupported(): boolean {
  return typeof document !== 'undefined' && !!document.fullscreenEnabled;
}
