import {useState} from 'react';
import type {AttunedItem, CharacterSheet, Coins, InventoryItem} from '@/types/character';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {ConfirmDeleteButton} from '@/components/ui/confirm-delete-button';
import {ChevronDown, ChevronUp, Plus} from 'lucide-react';
import {getAttunementSlots, getEffectiveProficiencyBonus} from '@/utils/calculations';

interface Props {
    sheet: CharacterSheet;
    onChange: (patch: Partial<CharacterSheet>) => void;
    onBlur?: () => void;
}

const COIN_LABELS: Record<keyof Coins, string> = {
    cp: 'PC', sp: 'PP', ep: 'PE', gp: 'PO', pp: 'PL',
};

export function InventorySection({sheet, onChange, onBlur}: Props) {
    const [collapsed, setCollapsed] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const profBonus = getEffectiveProficiencyBonus(sheet)
    const maxAttune = getAttunementSlots(profBonus);

    const toggleExpanded = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    /* ── Equipment ── */
    const addItem = () => {
        const id = crypto.randomUUID();
        onChange({
            inventory: [
                ...sheet.inventory,
                {id, name: '', quantity: 1, weight: 0, notes: ''},
            ],
        });
        setExpandedIds(prev => new Set(prev).add(id));
    };
    const updateItem = (idx: number, patch: Partial<InventoryItem>) => {
        const inventory = [...sheet.inventory];
        inventory[idx] = {...inventory[idx], ...patch};
        onChange({inventory});
    };
    const removeItem = (idx: number) => {
        onChange({inventory: sheet.inventory.filter((_, i) => i !== idx)});
    };

    /* ── Attuned items ── */
    const addAttuned = () => {
        if (sheet.attunedItems.length >= maxAttune) return;
        const id = crypto.randomUUID();
        onChange({
            attunedItems: [
                ...sheet.attunedItems,
                {id, name: '', description: ''},
            ],
        });
        setExpandedIds(prev => new Set(prev).add(id));
    };
    const updateAttuned = (idx: number, patch: Partial<AttunedItem>) => {
        const attunedItems = [...sheet.attunedItems];
        attunedItems[idx] = {...attunedItems[idx], ...patch};
        onChange({attunedItems});
    };
    const removeAttuned = (idx: number) => {
        onChange({attunedItems: sheet.attunedItems.filter((_, i) => i !== idx)});
    };

    /* ── Coins ── */
    const updateCoin = (key: keyof Coins, val: number) => {
        onChange({coins: {...sheet.coins, [key]: Math.max(0, val)}});
    };

    return (
        <Card className="border-primary/20">
            <CardHeader className="pb-3 pt-4 px-4">
                <button
                    type="button"
                    onClick={() => setCollapsed(c => !c)}
                    className="flex w-full items-center justify-between"
                >
                    <CardTitle className="text-lg text-primary">Inventário</CardTitle>
                    <span className="text-muted-foreground">
                        {collapsed ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>}
                    </span>
                </button>
            </CardHeader>

            {!collapsed && (
            <CardContent className="space-y-6 px-4 pb-4" onBlur={onBlur}>

                {/* ════════════════════════════ Equipment ════════════════════════════ */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Equipamento</Label>
                        <Button variant="ghost" size="sm" onClick={addItem} className="h-8 gap-1 text-sm shrink-0">
                            <Plus className="h-4 w-4"/> Adicionar
                        </Button>
                    </div>

                    {/* Column headers — md+ only */}
                    {sheet.inventory.length > 0 && (
                        <div className="mb-1 hidden md:grid md:grid-cols-[1fr_68px_80px_1fr_36px] gap-2 px-1">
                            <Label className="text-sm text-muted-foreground">Item</Label>
                            <Label className="text-sm text-muted-foreground">Qtd</Label>
                            <Label className="text-sm text-muted-foreground">Peso (lb)</Label>
                            <Label className="text-sm text-muted-foreground">Notas</Label>
                            <span/>
                        </div>
                    )}

                    <div className="space-y-2">
                        {sheet.inventory.map((item, i) => {
                            const isExpanded = expandedIds.has(item.id);
                            return (
                            <div key={item.id} className="rounded-md border border-border/40 p-3 md:border-0 md:p-0">

                                {/* ── Mobile: collapsible card ── */}
                                <div className="md:hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleExpanded(item.id)}
                                        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="font-medium text-foreground truncate">
                                            {item.name || 'Novo item'}
                                            {item.quantity > 1 && <span className="text-muted-foreground ml-2">x{item.quantity}</span>}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="col-span-2">
                                                <Label className="text-sm text-muted-foreground">Item</Label>
                                                <Input
                                                    placeholder="Nome do item"
                                                    value={item.name}
                                                    onChange={e => updateItem(i, {name: e.target.value})}
                                                    className="mt-1 h-10 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Quantidade</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={item.quantity}
                                                    onChange={e => updateItem(i, {quantity: Number(e.target.value) || 0})}
                                                    className="mt-1 h-10 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Peso (lb)</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.1}
                                                    value={item.weight}
                                                    onChange={e => updateItem(i, {weight: Number(e.target.value) || 0})}
                                                    className="mt-1 h-10 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-sm text-muted-foreground">Notas</Label>
                                                <Input
                                                    placeholder="Observações…"
                                                    value={item.notes}
                                                    onChange={e => updateItem(i, {notes: e.target.value})}
                                                    className="mt-1 h-10 text-sm"
                                                />
                                            </div>
                                            <ConfirmDeleteButton
                                                iconOnly={false}
                                                className="col-span-2 h-8 justify-start gap-1 text-sm text-muted-foreground hover:text-destructive w-full"
                                                onConfirm={() => removeItem(i)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* ── Desktop: single-row ── */}
                                <div className="hidden md:grid md:grid-cols-[1fr_68px_80px_1fr_36px] gap-2 items-center">
                                    <Input
                                        placeholder="Item"
                                        value={item.name}
                                        onChange={e => updateItem(i, {name: e.target.value})}
                                        className="h-10 text-sm"
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Qtd"
                                        value={item.quantity}
                                        onChange={e => updateItem(i, {quantity: Number(e.target.value) || 0})}
                                        className="h-10 text-sm"
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.1}
                                        placeholder="Peso"
                                        value={item.weight}
                                        onChange={e => updateItem(i, {weight: Number(e.target.value) || 0})}
                                        className="h-10 text-sm"
                                    />
                                    <Input
                                        placeholder="Notas"
                                        value={item.notes}
                                        onChange={e => updateItem(i, {notes: e.target.value})}
                                        className="h-10 text-sm"
                                    />
                                    <ConfirmDeleteButton
                                        iconOnly
                                        className="h-10 w-9"
                                        onConfirm={() => removeItem(i)}
                                    />
                                </div>

                            </div>
                            );
                        })}
                    </div>
                </section>

                {/* ════════════════════════ Attuned items ════════════════════════ */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">
                            Itens Sintonizados ({sheet.attunedItems.length}/{maxAttune})
                        </Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={addAttuned}
                            disabled={sheet.attunedItems.length >= maxAttune}
                            className="h-8 gap-1 text-sm shrink-0"
                        >
                            <Plus className="h-4 w-4"/> Adicionar
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {sheet.attunedItems.map((item, i) => {
                            const isExpanded = expandedIds.has(item.id);
                            return (
                            <div key={item.id} className="rounded-md border border-border/40 p-3 md:border-0 md:p-0">

                                {/* ── Mobile ── */}
                                <div className="md:hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleExpanded(item.id)}
                                        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="font-medium text-foreground truncate">
                                            {item.name || 'Novo item sintonizado'}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Nome</Label>
                                                <Input
                                                    placeholder="Nome do item"
                                                    value={item.name}
                                                    onChange={e => updateAttuned(i, {name: e.target.value})}
                                                    className="mt-1 h-10 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Descrição / Efeito</Label>
                                                <Input
                                                    placeholder="Propriedade ou efeito…"
                                                    value={item.description}
                                                    onChange={e => updateAttuned(i, {description: e.target.value})}
                                                    className="mt-1 h-10 text-sm"
                                                />
                                            </div>
                                            <ConfirmDeleteButton
                                                iconOnly={false}
                                                className="h-8 justify-start gap-1 text-sm text-muted-foreground hover:text-destructive w-full"
                                                onConfirm={() => removeAttuned(i)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* ── Desktop ── */}
                                <div className="hidden md:grid md:grid-cols-[1fr_1fr_36px] gap-2 items-center">
                                    <Input
                                        placeholder="Nome"
                                        value={item.name}
                                        onChange={e => updateAttuned(i, {name: e.target.value})}
                                        className="h-10 text-sm"
                                    />
                                    <Input
                                        placeholder="Descrição"
                                        value={item.description}
                                        onChange={e => updateAttuned(i, {description: e.target.value})}
                                        className="h-10 text-sm"
                                    />
                                    <ConfirmDeleteButton
                                        iconOnly
                                        className="h-10 w-9"
                                        onConfirm={() => removeAttuned(i)}
                                    />
                                </div>

                            </div>
                            );
                        })}
                    </div>
                </section>

                {/* ════════════════════════════ Coins ════════════════════════════
            Mobile:  2 cols
            sm+:     5 cols */}
                <section>
                    <Label className="mb-2 block text-sm text-muted-foreground">Moedas</Label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {(Object.keys(COIN_LABELS) as (keyof Coins)[]).map(coin => (
                            <div key={coin}>
                                <Label
                                    className="block text-center text-sm font-semibold text-muted-foreground uppercase">
                                    {COIN_LABELS[coin]}
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={sheet.coins[coin]}
                                    onChange={e => updateCoin(coin, Number(e.target.value) || 0)}
                                    className="mt-1 h-10 text-center text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </section>

            </CardContent>
            )}
        </Card>
    );
}