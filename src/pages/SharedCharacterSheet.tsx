import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AnySheet } from '@/systems/types';
import { findSystem } from '@/systems/registry';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;

// No-op: shared view never persists changes
const noop = () => {};

export default function SharedCharacterSheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<AnySheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('ID da ficha não encontrado.');
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/characters/${id}/shared`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg = body?.message ?? `Erro ${res.status}`;
          throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(data => {
        if (!data) throw new Error('Ficha não encontrada.');
        setSheet(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const system = sheet ? findSystem(sheet) : undefined;

  if (error || !sheet || !system) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg text-muted-foreground">
          {error ?? (sheet ? 'Esta ficha usa um sistema de jogo ainda não suportado.' : 'Ficha não encontrada.')}
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Ir para o início
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      {/* Toolbar */}
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        {/* Read-only badge */}
        <span className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Eye className="h-3.5 w-3.5" />
          Somente leitura
        </span>
      </div>

      {/* Shared-by banner */}
      <div className="mx-auto mb-6 max-w-6xl rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Você está visualizando a ficha de <strong className="text-foreground">{sheet.name}</strong> em modo somente leitura. Nenhuma alteração será salva.
      </div>

      {/* Sheet — pseudo readonly via CSS pointer-events wrapper */}
      <div className="mx-auto max-w-6xl space-y-6 relative opacity-80 pointer-events-none">
        <style dangerouslySetInnerHTML={{ __html: `
          /* Restaurar eventos de clique e arrastar estritamente aos cabeçalhos de colapso */
          div.max-w-6xl button.flex.w-full.items-center.justify-between {
            pointer-events: auto !important;
            cursor: pointer !important;
          }
          /* Esconder botões destrutivos ou de adição */
          div.max-w-6xl button:has(svg.lucide-plus), div.max-w-6xl button:has(svg.lucide-trash2) {
            display: none !important;
          }
        ` }} />
        <system.SheetComponent sheet={sheet} onChange={noop} readOnly />
      </div>
    </div>
  );
}
