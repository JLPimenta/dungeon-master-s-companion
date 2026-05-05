import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CharacterSheet } from '@/types/character';
import { HeaderSection } from '@/components/sheet/HeaderSection';
import { AbilityScores } from '@/components/sheet/AbilityScores';
import { SkillsSection } from '@/components/sheet/SkillsSection';
import { CombatSection } from '@/components/sheet/CombatSection';
import { WeaponsTable } from '@/components/sheet/WeaponsTable';
import { FeaturesTraits } from '@/components/sheet/FeaturesTraits';
import { SpellcastingSection } from '@/components/sheet/SpellcastingSection';
import { InventorySection } from '@/components/sheet/InventorySection';
import { PersonalitySection } from '@/components/sheet/PersonalitySection';
import { CampaignNotes } from '@/components/sheet/CampaignNotes';
import { CustomFields } from '@/components/sheet/CustomFields';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;

// No-op: shared view never persists changes
const noop = () => {};

export default function SharedCharacterSheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
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

  if (error || !sheet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg text-muted-foreground">
          {error ?? 'Ficha não encontrada.'}
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

      {/* Sheet — all form controls disabled via fieldset */}
      <fieldset disabled className="mx-auto max-w-6xl space-y-6 [&_button:not([type])]:pointer-events-none [&_button[type=button]]:pointer-events-none">
        <HeaderSection sheet={sheet} onChange={noop} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-6">
            <AbilityScores sheet={sheet} onChange={noop} />
            <SkillsSection sheet={sheet} onChange={noop} />
          </div>
          <div className="space-y-6">
            <CombatSection sheet={sheet} onChange={noop} />
            <WeaponsTable sheet={sheet} onChange={noop} />
            <FeaturesTraits sheet={sheet} onChange={noop} />
          </div>
        </div>

        <SpellcastingSection sheet={sheet} onChange={noop} />
        <InventorySection sheet={sheet} onChange={noop} />
        <PersonalitySection sheet={sheet} onChange={noop} />
        <CampaignNotes sheet={sheet} onChange={noop} />
        <CustomFields sheet={sheet} onChange={noop} />
      </fieldset>
    </div>
  );
}
