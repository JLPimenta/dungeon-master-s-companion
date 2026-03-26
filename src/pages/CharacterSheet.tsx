import {useParams, useNavigate} from 'react-router-dom';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useCharacter, useSaveCharacter} from '@/hooks/useCharacters';
import type {CharacterSheet as CharacterSheetType} from '@/types/character';
import {HeaderSection} from '@/components/sheet/HeaderSection';
import {AbilityScores} from '@/components/sheet/AbilityScores';
import {SkillsSection} from '@/components/sheet/SkillsSection';
import {CombatSection} from '@/components/sheet/CombatSection';
import {WeaponsTable} from '@/components/sheet/WeaponsTable';
import {FeaturesTraits} from '@/components/sheet/FeaturesTraits';
import {SpellcastingSection} from '@/components/sheet/SpellcastingSection';
import {InventorySection} from '@/components/sheet/InventorySection';
import {PersonalitySection} from '@/components/sheet/PersonalitySection';
import {CampaignNotes} from '@/components/sheet/CampaignNotes';
import {CustomFields} from '@/components/sheet/CustomFields';
import {Button} from '@/components/ui/button';
import {ArrowLeft, Check, Loader2, Maximize, Minimize, Share2} from 'lucide-react';
import {toast} from 'sonner';

type SaveStatus = 'idle' | 'saving' | 'saved';

function SaveIndicator({status}: {status: SaveStatus}) {
    if (status === 'idle') return null;
    if (status === 'saving') {
        return (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                Salvando...
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1.5 text-sm text-green-500">
            <Check className="h-3.5 w-3.5"/>
            Salvo!
        </span>
    );
}

export default function CharacterSheetPage() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {data: sheet, isLoading} = useCharacter(id);
    const saveMutation = useSaveCharacter();
    const [local, setLocal] = useState<CharacterSheetType | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const isDirtyRef = useRef(false);
    const pendingRef = useRef(false);
    const lastSavedRef = useRef<CharacterSheetType | null>(null);
    const savedTimerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (sheet && !isDirtyRef.current) setLocal(sheet);
    }, [sheet]);

    // Warn before unloading while a save is in-flight
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (pendingRef.current) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    const update = useCallback((patch: Partial<CharacterSheetType>) => {
        isDirtyRef.current = true;
        setLocal(prev => {
            if (!prev) return prev;
            const next = {...prev, ...patch};
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                if (!pendingRef.current) {
                    pendingRef.current = true;
                    setSaveStatus('saving');
                    saveMutation.mutate(next, {
                        onSuccess: () => {
                            lastSavedRef.current = next;
                            isDirtyRef.current = false;
                            setSaveStatus('saved');
                            clearTimeout(savedTimerRef.current);
                            savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 5000);
                        },
                        onSettled: () => {
                            pendingRef.current = false;
                        },
                        onError: (err) => {
                            toast.error(`Erro ao salvar: ${err.message}`);
                            setSaveStatus('idle');
                            if (lastSavedRef.current) setLocal(lastSavedRef.current);
                        }
                    });
                }
            }, 2500);
            return next;
        });
    }, [saveMutation]);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleShare = () => {
        if (!local) return;
        const url = `${window.location.origin}/character/shared/${local.id}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência!');
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
            </div>
        );
    }

    if (!local) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Ficha não encontrada.</p>
                <Button variant="outline" onClick={() => navigate('/')}>Voltar</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 md:px-8">
            {/* Toolbar */}
            <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
                        <ArrowLeft className="h-4 w-4"/> Voltar
                    </Button>
                    <SaveIndicator status={saveStatus}/>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare} title="Compartilhar">
                        <Share2 className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon" onClick={toggleFullscreen} title="Tela cheia">
                        {isFullscreen ? <Minimize className="h-4 w-4"/> : <Maximize className="h-4 w-4"/>}
                    </Button>
                </div>
            </div>

            {/* Sheet content */}
            <div className="mx-auto max-w-6xl space-y-6">
                <HeaderSection sheet={local} onChange={update}/>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Left column */}
                    <div className="space-y-6">
                        <AbilityScores sheet={local} onChange={update}/>
                        <SkillsSection sheet={local} onChange={update}/>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        <CombatSection sheet={local} onChange={update}/>
                        <WeaponsTable sheet={local} onChange={update}/>
                        <FeaturesTraits sheet={local} onChange={update}/>
                    </div>
                </div>

                <SpellcastingSection sheet={local} onChange={update}/>
                <InventorySection sheet={local} onChange={update}/>
                <PersonalitySection sheet={local} onChange={update}/>
                <CampaignNotes sheet={local} onChange={update}/>
                <CustomFields sheet={local} onChange={update}/>
            </div>
        </div>
    );
}
