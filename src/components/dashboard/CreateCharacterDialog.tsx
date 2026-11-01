import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  accountInput, dialogContent, dialogDescription, dialogTitle, outlineButton, primaryButton,
} from '@/components/account/ui';
import { AVAILABLE_SYSTEMS } from '@/systems/registry';
import { DEFAULT_SYSTEM_ID, type SystemId } from '@/systems/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: { name: string; system: SystemId }) => void;
  loading: boolean;
}

export function CreateCharacterDialog({ open, onOpenChange, onConfirm, loading }: Props) {
  const [name, setName] = useState('');
  const [system, setSystem] = useState<SystemId>(DEFAULT_SYSTEM_ID);

  // Com um único sistema registrado a escolha não existe — o dialog fica como antes.
  const showSystemPicker = AVAILABLE_SYSTEMS.length > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onConfirm({ name: name.trim(), system });
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setName('');
      setSystem(DEFAULT_SYSTEM_ID);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(dialogContent, 'max-h-[calc(100dvh-32px)] max-w-[460px] overflow-y-auto')}>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-0 text-left">
            <DialogTitle className={dialogTitle}>Criar Nova Ficha</DialogTitle>
            <DialogDescription className="mt-1 text-base text-muted-foreground">
              {showSystemPicker
                ? 'Dê um nome ao seu personagem e escolha o sistema de jogo.'
                : 'Dê um nome ao seu personagem para começar.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-[18px] flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="char-name" className="text-[15px]">Nome do Personagem</label>
              <Input
                id="char-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Thorin Escudo de Carvalho"
                autoFocus
                tabIndex={1}
                className={cn(accountInput, 'h-11')}
              />
            </div>

            {showSystemPicker && (
              <div className="flex flex-col gap-1.5">
                <span id="char-system-label" className="text-[15px]">Sistema</span>
                <div role="radiogroup" aria-labelledby="char-system-label" className="flex flex-col gap-2">
                  {AVAILABLE_SYSTEMS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={system === s.id}
                      onClick={() => setSystem(s.id)}
                      className={cn(
                        'min-h-[48px] rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        system === s.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <span className="block font-heading text-sm font-bold text-primary-text">{s.label}</span>
                      {s.description && (
                        <span className="mt-0.5 block text-sm text-muted-foreground">{s.description}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => handleOpenChange(false)} tabIndex={3} className={cn(outlineButton, 'h-11')}>
              Cancelar
            </button>
            <button type="submit" disabled={!name.trim() || loading} tabIndex={2} className={cn(primaryButton, 'h-11 font-body text-base font-semibold tracking-normal')}>
              {loading ? 'Criando…' : 'Criar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
