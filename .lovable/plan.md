

# Plano: Aumentar tamanhos de texto e campos da ficha

## Problema
Textos com `text-xs` (12px) e campos com `h-7`/`h-8` sao muito pequenos para leitura e uso mobile.

## Regra de escala

| Elemento | Atual | Novo |
|----------|-------|------|
| CardTitle (titulos de secao) | `text-sm` (14px) | `text-lg` (18px) |
| Labels | `text-xs` (12px) | `text-sm` (14px) |
| Inputs/campos texto | `text-xs`, `h-7`/`h-8` | `text-sm`, `h-9`/`h-10` |
| Botoes de acao (Adicionar, etc.) | `text-xs`, `h-7` | `text-sm`, `h-8` |
| Spans auxiliares (Salv., Conc., etc.) | `text-xs` / `text-[10px]` | `text-sm` / `text-xs` |
| Icones em botoes | `h-3 w-3` | `h-4 w-4` |
| Badge Proficiencia | `text-xs` | `text-sm` |
| Spellcasting grid spell rows | `h-7` | `h-9` |
| Checkboxes | `h-3.5 w-3.5` / `h-4 w-4` | `h-4 w-4` / `h-5 w-5` |

## Arquivos alterados (11 componentes)

1. **HeaderSection.tsx** - Labels `text-xs` → `text-sm`, badge `text-xs` → `text-sm`
2. **AbilityScores.tsx** - CardTitle → `text-lg`, labels → `text-sm`, inputs mantêm `h-9`
3. **SkillsSection.tsx** - CardTitle → `text-lg`, body `text-sm` base (remover md:text-xs), labels → `text-sm`
4. **CombatSection.tsx** - CardTitle → `text-lg`, labels → `text-sm`, checkboxes labels → `text-sm`
5. **WeaponsTable.tsx** - CardTitle → `text-lg`, inputs `h-8 text-xs` → `h-10 text-sm`, botao Adicionar → `text-sm h-8`
6. **FeaturesTraits.tsx** - CardTitle → `text-lg`, labels → `text-sm`, inputs `h-8 text-xs` → `h-9 text-sm`
7. **SpellcastingSection.tsx** - CardTitle → `text-lg`, labels → `text-sm`, spell inputs `h-7 text-xs` → `h-9 text-sm`, spans `text-[10px]` → `text-xs`
8. **InventorySection.tsx** - CardTitle → `text-lg`, labels → `text-sm`, inputs `h-8 text-xs` → `h-9 text-sm`
9. **PersonalitySection.tsx** - CardTitle → `text-lg`, labels → `text-sm`, inputs `h-8 text-xs` → `h-9 text-sm`
10. **CampaignNotes.tsx** - CardTitle → `text-lg`, labels → `text-sm`, inputs `h-7 text-xs` → `h-9 text-sm`
11. **CustomFields.tsx** - CardTitle → `text-lg`, labels → `text-sm`, inputs `h-8 text-xs` → `h-9 text-sm`

## Nao alterado
- Estrutura, logica, layout grid -- tudo permanece igual
- Apenas classes CSS de tamanho de texto e altura de campo sao atualizadas

