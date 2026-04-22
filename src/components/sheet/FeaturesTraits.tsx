import {useState} from 'react';
import type {CharacterSheet} from '@/types/character';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {ConfirmDeleteButton} from '@/components/ui/confirm-delete-button';
import {ChevronDown, ChevronUp, Plus} from 'lucide-react';

interface Props {
    sheet: CharacterSheet;
    onChange: (patch: Partial<CharacterSheet>) => void;
    onBlur?: () => void;
}

export function FeaturesTraits({sheet, onChange, onBlur}: Props) {
    const [collapsed, setCollapsed] = useState(true);
    const [expandedIdxs, setExpandedIdxs] = useState<Set<number>>(new Set());

    const addFeature = () => {
        onChange({classFeatures: [...sheet.classFeatures, '']});
        setExpandedIdxs(prev => new Set(prev).add(sheet.classFeatures.length));
    };

    const updateFeature = (idx: number, val: string) => {
        const classFeatures = [...sheet.classFeatures];
        classFeatures[idx] = val;
        onChange({classFeatures});
    };

    const removeFeature = (idx: number) => {
        onChange({classFeatures: sheet.classFeatures.filter((_, i) => i !== idx)});
    };

    const toggleExpanded = (idx: number) => {
        setExpandedIdxs(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const getPreviewText = (text: string) => {
        if (!text) return 'Nova Característica';
        const firstLine = text.split('\n')[0];
        return firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;
    };

    return (
        <Card className="border-primary/20">
            <CardHeader className="pb-3 pt-4 px-4">
                <button
                    type="button"
                    onClick={() => setCollapsed(c => !c)}
                    className="flex w-full items-center justify-between"
                >
                    <CardTitle className="text-lg text-primary">Características e Traços</CardTitle>
                    <span className="text-muted-foreground">
            {collapsed ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>}
          </span>
                </button>
            </CardHeader>

            {!collapsed && (
                <CardContent className="space-y-4 px-4 pb-4" onBlur={onBlur}>
                    {/* Class features */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm text-muted-foreground">Características de Classe</Label>
                            <Button variant="ghost" size="sm" onClick={addFeature} className="h-8 gap-1 text-sm">
                                <Plus className="h-4 w-4"/> Adicionar
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {sheet.classFeatures.map((f, i) => {
                                const isExpanded = expandedIdxs.has(i);
                                return (
                                    <div key={i} className="rounded-md border border-border/40 p-1 md:p-3">
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => toggleExpanded(i)}
                                                className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm hover:bg-primary/5 transition-colors"
                                            >
                        <span className="font-medium text-foreground truncate">
                          {getPreviewText(f)}
                        </span>
                                                <ChevronDown
                                                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}/>
                                            </button>

                                            {isExpanded && (
                                                <div className="mt-2 flex gap-2">
                                                    <Textarea
                                                        maxLength={1500}
                                                        value={f}
                                                        onChange={e => updateFeature(i, e.target.value)}
                                                        className="min-h-[72px] resize-y text-sm flex-1"
                                                        placeholder="Descreva a característica…"
                                                    />
                                                    <ConfirmDeleteButton
                                                        iconOnly
                                                        className="h-9 w-9 shrink-0 self-start"
                                                        onConfirm={() => removeFeature(i)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm text-muted-foreground">Traços de Espécie</Label>
                        <Textarea maxLength={5_000} value={sheet.speciesTraits}
                                  onChange={e => onChange({speciesTraits: e.target.value})}
                                  className="mt-1 min-h-[60px] text-sm"/>
                    </div>

                    <div>
                        <Label className="text-sm text-muted-foreground">Talentos</Label>
                        <Textarea maxLength={5_000} value={sheet.feats}
                                  onChange={e => onChange({feats: e.target.value})}
                                  className="mt-1 min-h-[60px] text-sm"/>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <Label className="text-sm text-muted-foreground">Armaduras</Label>
                            <Input value={sheet.armorTraining} onChange={e => onChange({armorTraining: e.target.value})}
                                   className="mt-1 h-9 text-sm"/>
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground">Armas</Label>
                            <Input value={sheet.weaponTraining}
                                   onChange={e => onChange({weaponTraining: e.target.value})}
                                   className="mt-1 h-9 text-sm"/>
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground">Ferramentas</Label>
                            <Input value={sheet.toolTraining} onChange={e => onChange({toolTraining: e.target.value})}
                                   className="mt-1 h-9 text-sm"/>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
