import {useState, useEffect} from 'react';
import type {CharacterSheet} from '@/types/character';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useIsMobile} from '@/hooks/use-mobile';

interface Props {
    sheet: CharacterSheet;
    onChange: (patch: Partial<CharacterSheet>) => void;
    onBlur?: () => void;
}

export function PersonalitySection({sheet, onChange, onBlur}: Props) {
    const isMobile = useIsMobile();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        setCollapsed(isMobile);
    }, []);

    return (
        <Card className="border-primary/20 h-full flex flex-col">
            <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex w-full items-center justify-between">
                    <CardTitle className="text-lg text-primary">Personalidade e História</CardTitle>
                    <button
                        type="button"
                        onClick={() => setCollapsed(c => !c)}
                        className="lg:hidden text-muted-foreground p-1 hover:text-primary transition-colors"
                    >
                        {collapsed ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>}
                    </button>
                </div>
            </CardHeader>

            <CardContent
                className={cn("px-4 pb-4 flex-1 flex-col", collapsed ? "hidden lg:flex" : "flex")}
                onBlur={onBlur}
            >
                <div className="flex-1 flex flex-col mb-4">
                    <Label className="text-sm text-muted-foreground mb-1.5">História e Personalidade</Label>
                    <Textarea
                        maxLength={10_000}
                        value={sheet.personalityAndHistory}
                        onChange={e => onChange({personalityAndHistory: e.target.value})}
                        placeholder="Era uma vez..."
                        className="flex-1 min-h-[120px] text-sm resize-none"
                    />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-auto">
                    <div>
                        <Label className="text-sm text-muted-foreground">Alinhamento</Label>
                        <Input value={sheet.alignment} onChange={e => onChange({alignment: e.target.value})}
                               className="mt-1 h-9 text-sm"/>
                    </div>
                    <div>
                        <Label className="text-sm text-muted-foreground">Idiomas</Label>
                        <Input maxLength={500} value={sheet.languages} onChange={e => onChange({languages: e.target.value})}
                               className="mt-1 h-9 text-sm"/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
