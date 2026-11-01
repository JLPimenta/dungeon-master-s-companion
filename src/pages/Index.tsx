import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCharacters, useCreateCharacter, useDeleteCharacter, type CreateCharacterInput} from '@/hooks/useCharacters';
import {CharacterCard} from '@/components/dashboard/CharacterCard';
import {CreateCharacterDialog} from '@/components/dashboard/CreateCharacterDialog';
import {DeleteCharacterDialog} from '@/components/dashboard/DeleteCharacterDialog';
import {AppHeader} from '@/components/AppHeader';
import {AVAILABLE_SYSTEMS} from '@/systems/registry';
import {cn} from '@/lib/utils';
import {primaryButton} from '@/components/account/ui';
import {Plus, Scroll} from 'lucide-react';

/** "D&D 5.5e, Tormenta20 e D&D 5e": os sistemas do registro, não uma lista fixa. */
// eslint-disable-next-line react-refresh/only-export-components
export function systemsSentence(labels: string[]): string {
    if (labels.length <= 1) return labels.join('');
    return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`;
}

const SUBTITLE =
    `Gerenciador de Fichas — ${systemsSentence(AVAILABLE_SYSTEMS.map(s => s.shortLabel))}. ` +
    'Em breve: Ferramentas de Campanha e muito mais!';

const Index = () => {
    const navigate = useNavigate();
    const {data: characters = [], isLoading} = useCharacters();
    const createMutation = useCreateCharacter();
    const deleteMutation = useDeleteCharacter();

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const handleCreate = async (input: CreateCharacterInput) => {
        const sheet = await createMutation.mutateAsync(input);
        setCreateOpen(false);
        navigate(`/character/${sheet.id}`);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteMutation.mutateAsync(deleteTarget.id);
        setDeleteTarget(null);
    };

    return (
        <div className="min-h-screen">
            <AppHeader />

            <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7">
                {/* Título e ação principal */}
                <div className="mb-[22px] flex flex-wrap items-end gap-3.5">
                    <div className="min-w-0 flex-[1_1_280px]">
                        <h1 className="font-heading text-[26px] font-bold tracking-[0.04em] text-primary-text">Suas fichas</h1>
                        <p className="mt-1 italic text-muted-foreground">{SUBTITLE}</p>
                    </div>
                    {!isLoading && characters.length > 0 && (
                        <button type="button" onClick={() => setCreateOpen(true)} className={cn(primaryButton, 'uppercase')}>
                            <Plus className="!size-[18px]" strokeWidth={2.4}/>
                            Criar Nova Ficha
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando fichas">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[186px] animate-pulse rounded-xl bg-card"/>
                        ))}
                    </div>
                ) : characters.length === 0 ? (
                    <div className="flex flex-col items-center gap-3.5 px-4 py-[72px] text-center">
                        <Scroll className="h-14 w-14 text-muted-foreground" strokeWidth={1.4} aria-hidden="true"/>
                        <p className="text-lg text-muted-foreground">Nenhuma ficha criada ainda.</p>
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex h-[46px] items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-[18px] font-heading text-sm font-bold uppercase tracking-[0.06em] text-primary-text transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2.4}/>
                            Criar sua primeira ficha
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {characters.map(c => (
                            <CharacterCard
                                key={c.id}
                                character={c}
                                onClick={() => navigate(`/character/${c.id}`)}
                                onDelete={() => setDeleteTarget({id: c.id, name: c.name})}
                            />
                        ))}
                    </div>
                )}

                <CreateCharacterDialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    onConfirm={handleCreate}
                    loading={createMutation.isPending}
                />

                <DeleteCharacterDialog
                    open={!!deleteTarget}
                    name={deleteTarget?.name ?? ''}
                    onOpenChange={(open) => {
                        if (!open) setDeleteTarget(null);
                    }}
                    onConfirm={handleDelete}
                    loading={deleteMutation.isPending}
                />
            </main>
        </div>
    );
};

export default Index;
