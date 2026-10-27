import type {SheetComponentProps} from '../types';
import type {Dnd55Sheet} from './definition';
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

const noop = () => {};

/**
 * Layout da ficha D&D 5.5e — antes duplicado em pages/CharacterSheet.tsx e
 * pages/SharedCharacterSheet.tsx. No modo `readOnly` (link compartilhado),
 * Inventário, Notas de Campanha e Campos Personalizados ficam ocultos.
 */
export function Dnd55SheetLayout({sheet, onChange, onBlur, readOnly = false}: SheetComponentProps<Dnd55Sheet>) {
    const update = readOnly ? noop : onChange;
    const blur = readOnly ? undefined : onBlur;

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <HeaderSection sheet={sheet} onChange={update} onBlur={blur}/>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                {/* Left column */}
                <div className="space-y-6">
                    <AbilityScores sheet={sheet} onChange={update} onBlur={blur}/>
                    <SkillsSection sheet={sheet} onChange={update} onBlur={blur}/>
                </div>

                {/* Right column */}
                <div className="flex flex-col space-y-6 h-full">
                    <CombatSection sheet={sheet} onChange={update} onBlur={blur}/>
                    <WeaponsTable sheet={sheet} onChange={update} onBlur={blur}/>
                    <div className="flex-1">
                        <PersonalitySection sheet={sheet} onChange={update} onBlur={blur}/>
                    </div>
                </div>
            </div>

            <SpellcastingSection sheet={sheet} onChange={update} onBlur={blur}/>
            {!readOnly && <InventorySection sheet={sheet} onChange={update} onBlur={blur}/>}
            <FeaturesTraits sheet={sheet} onChange={update} onBlur={blur}/>
            {!readOnly && <CampaignNotes sheet={sheet} onChange={update} onBlur={blur}/>}
            {!readOnly && <CustomFields sheet={sheet} onChange={update} onBlur={blur}/>}
        </div>
    );
}
