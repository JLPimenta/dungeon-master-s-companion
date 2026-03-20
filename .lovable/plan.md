
# Plano: Campos de Bonus Adicional por Area

## Problema

O sistema calcula valores automaticamente (salvaguardas, proficiencia, CA, iniciativa, etc.) mas nao permite que o jogador registre bonus de itens magicos, antecedentes ou situacoes especiais (ex: Capa da Protecao +1 salvaguardas, Pedra de Poder +2 proficiencia).

## Solucao

Adicionar um campo numerico de "bonus adicional" em cada area de calculo relevante. O jogador preenche manualmente e o sistema soma ao valor base.

## Areas afetadas

| Area | Campo adicionado | Calculo atualizado |
|------|------------------|--------------------|
| Proficiencia | `proficiencyBonusOverride: number` | `getProficiencyBonus(level) + override` |
| Salvaguardas (por atributo) | `savingThrowBonus: number` no `AbilityScore` | `mod + (prof ? profBonus : 0) + savingThrowBonus` |
| Classe de Armadura | `armorClassBonus: number` | `armorClass + armorClassBonus` (exibido separado) |
| Iniciativa | `initiativeBonus: number` | `modDex + initiativeBonus` |
| Pericias (global) | `skillBonusGlobal: number` | Somado a cada pericia |
| Percepcao Passiva | Herda do bonus de pericias + campo proprio `passivePerceptionBonus` | `10 + skillBonus + passivePerceptionBonus` |

## Alteracoes por arquivo

### 1. `src/types/character.ts`
- `AbilityScore`: adicionar `savingThrowBonus: number` (default 0)
- `CharacterSheet`: adicionar `proficiencyBonusExtra`, `armorClassBonus`, `initiativeBonus`, `skillBonusGlobal`, `passivePerceptionBonus` (todos `number`, default 0)
- Atualizar `createDefaultCharacter` com valores 0

### 2. `src/utils/calculations.ts`
- `getProficiencyBonus`: receber parametro extra opcional
- `getInitiativeBonus`: somar bonus extra
- `getPassivePerception`: somar bonus extra
- Nova funcao `getSavingThrowBonus(abilityScore, proficient, profBonus, extraBonus)`

### 3. Componentes UI
- `HeaderSection`: campo numerico pequeno ao lado do badge de Proficiencia (label: "Bonus Extra")
- `AbilityScores`: campo numerico pequeno por atributo para bonus de salvaguarda
- `CombatSection`: campos de bonus extra para CA e Iniciativa
- `SkillsSection`: campo global de bonus extra no topo + exibir Percepcao Passiva com bonus

### 4. UX
- Campos aparecem como inputs pequenos (w-12) com placeholder "0"
- Tooltip ou label discreto: "Bonus de itens/efeitos"
- Valores 0 nao alteram o calculo (retrocompativel)

## Retrocompatibilidade
Fichas existentes no localStorage nao terao os novos campos. O codigo usara `?? 0` como fallback para que tudo continue funcionando sem migracao.
