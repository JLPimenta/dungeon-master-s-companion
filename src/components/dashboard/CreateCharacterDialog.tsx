import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  loading: boolean;
}

export function CreateCharacterDialog({ open, onOpenChange, onConfirm, loading }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onConfirm(name.trim());
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) setName('');
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Ficha</DialogTitle>
            <DialogDescription>Dê um nome ao seu personagem para começar.</DialogDescription>
          </DialogHeader>
          <div className="my-6">
            <Label htmlFor="char-name">Nome do Personagem</Label>
            <Input
              id="char-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Thalion Escudo de Ferro"
              autoFocus
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? 'Criando…' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
