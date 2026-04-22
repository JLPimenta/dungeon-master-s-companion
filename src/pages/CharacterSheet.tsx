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
import {UnsavedChangesBar} from '@/components/sheet/UnsavedChangesBar';
import {Button} from '@/components/ui/button';
import {ArrowLeft, Check, Loader2, Maximize, Minimize, Share2} from 'lucide-react';
import {toast} from 'sonner';
import {useUserPreferences} from '@/hooks/useUserPreferences';

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

export function FloatingSaveIndicator({ status }: { status: SaveStatus }) {
    if (status === 'idle') return null;
    return (
        <div className="fixed z-50 flex items-center gap-2 rounded-full border border-border/50 bg-background/95 px-4 py-2 text-sm shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-5 bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0">
            {status === 'saving' ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-primary font-medium tracking-wide">Salvando...</span>
                </>
            ) : (
                <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium tracking-wide">Salvo!</span>
                </>
            )}
        </div>
    );
}

function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) return false;
    
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;
        for (let i = 0; i < obj1.length; i++) {
            if (!deepEqual(obj1[i], obj2[i])) return false;
        }
        return true;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
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
    const needsResaveRef = useRef(false);
    const localRef = useRef<CharacterSheetType | null>(null);
    const lastSavedRef = useRef<CharacterSheetType | null>(null);
    const savedTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const [scrolled, setScrolled] = useState(false);
    const { autoSaveEnabled } = useUserPreferences();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (sheet && !isDirtyRef.current && !pendingRef.current && !needsResaveRef.current) {
            setLocal(sheet);
            localRef.current = sheet;
            if (!lastSavedRef.current) {
                lastSavedRef.current = sheet;
            }
        }
    }, [sheet]);

    // Warn before unloading while a save is in-flight
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (pendingRef.current || isDirtyRef.current) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    const flush = useCallback(() => {
        const data = localRef.current;
        if (!data) return;

        // Dirty-check: skip if nothing changed since last save
        if (lastSavedRef.current && deepEqual(data, lastSavedRef.current)) {
            isDirtyRef.current = false;
            return;
        }

        if (pendingRef.current) {
            needsResaveRef.current = true;
            return;
        }

        pendingRef.current = true;
        needsResaveRef.current = false;
        setSaveStatus('saving');

        saveMutation.mutate(data, {
            onSuccess: () => {
                lastSavedRef.current = data;
                setSaveStatus('saved');
                clearTimeout(savedTimerRef.current);
                savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 5000);
                
                if (!needsResaveRef.current) {
                    isDirtyRef.current = false;
                    setHasUnsavedChanges(false);
                }
            },
            onError: (err) => {
                setSaveStatus('idle');
                const isUserError = err.message.toLowerCase().includes('texto')
                    || err.message.toLowerCase().includes('limite');

                toast.error(err.message, {
                    duration: isUserError ? 8000 : 4000,
                    description: isUserError
                        ? 'Verifique os campos de Personalidade, Traços de Espécie e Talentos.'
                        : undefined,
                });

                if (!isUserError && lastSavedRef.current) {
                    setLocal(lastSavedRef.current);
                    if (!needsResaveRef.current) {
                        isDirtyRef.current = false;
                        setHasUnsavedChanges(false);
                    }
                }
            },
            onSettled: () => {
                pendingRef.current = false;
                if (needsResaveRef.current) flush();
            }
        });
    }, [saveMutation]);

    const update = useCallback((patch: Partial<CharacterSheetType>) => {
        isDirtyRef.current = true;
        setHasUnsavedChanges(true);
        setLocal(prev => {
            if (!prev) return prev;
            const next = {...prev, ...patch};
            localRef.current = next;
            if (autoSaveEnabled) {
                clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => flush(), 10000);
            }
            return next;
        });
    }, [flush, autoSaveEnabled]);

    const handleBlur = useCallback(() => {
        if (isDirtyRef.current && autoSaveEnabled) {
            clearTimeout(debounceRef.current);
            flush();
        }
    }, [flush, autoSaveEnabled]);

    const handleDiscard = useCallback(() => {
        if (lastSavedRef.current) {
            setLocal(lastSavedRef.current);
            localRef.current = lastSavedRef.current;
            isDirtyRef.current = false;
            setHasUnsavedChanges(false);
            clearTimeout(debounceRef.current);
        }
    }, []);

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
        <>
            <UnsavedChangesBar 
                isVisible={hasUnsavedChanges && !autoSaveEnabled} 
                onSave={flush} 
                onDiscard={handleDiscard} 
                isSaving={saveStatus === 'saving'} 
            />
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
                <HeaderSection sheet={local} onChange={update} onBlur={handleBlur}/>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Left column */}
                    <div className="space-y-6">
                        <AbilityScores sheet={local} onChange={update} onBlur={handleBlur}/>
                        <SkillsSection sheet={local} onChange={update} onBlur={handleBlur}/>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col space-y-6 h-full">
                        <CombatSection sheet={local} onChange={update} onBlur={handleBlur}/>
                        <WeaponsTable sheet={local} onChange={update} onBlur={handleBlur}/>
                        <div className="flex-1">
                            <PersonalitySection sheet={local} onChange={update} onBlur={handleBlur}/>
                        </div>
                    </div>
                </div>

                <SpellcastingSection sheet={local} onChange={update} onBlur={handleBlur}/>
                <InventorySection sheet={local} onChange={update} onBlur={handleBlur}/>
                <FeaturesTraits sheet={local} onChange={update} onBlur={handleBlur}/>
                <CampaignNotes sheet={local} onChange={update} onBlur={handleBlur}/>
                <CustomFields sheet={local} onChange={update} onBlur={handleBlur}/>
            </div>

            {scrolled && <FloatingSaveIndicator status={saveStatus} />}
        </div>
        </>
    );
}
