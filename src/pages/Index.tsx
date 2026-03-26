import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCharacters, useCreateCharacter, useDeleteCharacter} from '@/hooks/useCharacters';
import {CharacterCard} from '@/components/dashboard/CharacterCard';
import {CreateCharacterDialog} from '@/components/dashboard/CreateCharacterDialog';
import {DeleteCharacterDialog} from '@/components/dashboard/DeleteCharacterDialog';
import {AppHeader} from '@/components/AppHeader';
import {Button} from '@/components/ui/button';
import {Plus, Scroll} from 'lucide-react';

const Index = () => {
    const navigate = useNavigate();
    const {data: characters = [], isLoading} = useCharacters();
    const createMutation = useCreateCharacter();
    const deleteMutation = useDeleteCharacter();

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const handleCreate = async (name: string) => {
        const sheet = await createMutation.mutateAsync(name);
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

            <div className="px-4 pt-20 pb-8 md:px-8 lg:px-16">
                {/* Subtitle */}
                <div className="mx-auto mb-10 max-w-5xl text-center">
                    <p className="text-muted-foreground" style={{fontStyle: 'italic'}}>
                        Gerenciador de Fichas — Em breve: Fichas de outros sistemas, Ferramentas de Campanha, e muito mais!
                    </p>
                </div>

                {/* Actions */}
                {characters.length > 0 && (
                    <div className="mx-auto mb-8 flex max-w-5xl justify-end">
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="gap-2 transition-transform active:scale-[0.97]"
                            size="lg"
                        >
                            <Plus className="h-5 w-5"/>
                            Criar Nova Ficha
                        </Button>
                    </div>
                )}

                {/* Grid */}
                <main className="mx-auto max-w-5xl">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-44 animate-pulse rounded-lg bg-card"/>
                            ))}
                        </div>
                    ) : characters.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-24 text-center">
                            <Scroll className="h-16 w-16 text-muted-foreground/40"/>
                            <p className="text-lg text-muted-foreground">
                                Nenhuma ficha criada ainda.
                            </p>
                            <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
                                <Plus className="h-4 w-4"/>
                                Criar sua primeira ficha
                            </Button>
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
                </main>

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
            </div>
        </div>
    );
};

export default Index;
