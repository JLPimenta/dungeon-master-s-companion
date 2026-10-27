import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Ficha</DialogTitle>
            <DialogDescription>
              {showSystemPicker
                ? 'Dê um nome ao seu personagem e escolha o sistema de jogo.'
                : 'Dê um nome ao seu personagem para começar.'}
            </DialogDescription>
          </DialogHeader>
          <div className="my-6 space-y-5">
            <div>
              <Label htmlFor="char-name">Nome do Personagem</Label>
              <Input
                id="char-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Thorin Escudo de Carvalho"
                autoFocus
                tabIndex={1}
                className="mt-2"
              />
            </div>

            {showSystemPicker && (
              <div>
                <Label id="char-system-label">Sistema</Label>
                <div role="radiogroup" aria-labelledby="char-system-label" className="mt-2 grid gap-2">
                  {AVAILABLE_SYSTEMS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={system === s.id}
                      onClick={() => setSystem(s.id)}
                      className={cn(
                        'rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        system === s.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <span className="block text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                        {s.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{s.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} tabIndex={3}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || loading} tabIndex={2}>
              {loading ? 'Criando…' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
