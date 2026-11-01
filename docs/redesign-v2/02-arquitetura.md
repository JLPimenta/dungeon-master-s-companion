# 02 · Arquitetura da implementação

## Onde o código está hoje

| Peça | Arquivo |
|---|---|
| Página da ficha (estado, salvamento, compartilhar, tela cheia, barra "deseja salvá-las?") | `src/pages/CharacterSheet.tsx` |
| Ficha compartilhada (somente leitura) | `src/pages/SharedCharacterSheet.tsx` |
| Contrato de sistema e registry | `src/systems/types.ts`, `src/systems/registry.ts` |
| Layout da ficha 5.5e | `src/systems/dnd5_5e/Dnd55SheetLayout.tsx` |
| Seções da família D&D (usadas pelo 5.5e **e pelo 5e 2014**) | `src/components/sheet/*.tsx` |
| Primitivos compartilhados entre sistemas | `src/systems/shared/` (`SheetSection`, `EntryListSection`, `SheetHeaderCard`) |
| Cálculos | `src/utils/calculations.ts` |
| Tipos da ficha 5.5e | `src/types/character.ts` |
| Tema e preferências | `src/index.css`, `tailwind.config.ts`, `src/hooks/useUserPreferences.ts` (`next-themes`) |
| Início, contas e perfil | `src/pages/Index.tsx`, `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `ConfirmEmail.tsx`, `Profile.tsx`, `src/components/dashboard/*`, `src/components/auth/*`, `src/components/AppHeader.tsx`, `AppFooter.tsx` |

**Atenção:** `src/components/sheet/*` também é usado por `src/systems/dnd5e/Dnd5eSheetLayout.tsx`. Mudar esses componentes muda a ficha 5e (2014). Por isso o redesign cria componentes **novos** e não altera os antigos (ver abaixo).

## Estrutura nova

```
src/
  components/
    brand/
      GrimorioMark.tsx           marca estática (SVG inline, currentColor)
      LoadingMark.tsx            animação de carregamento
      loadingGeometry.ts         porta TypeScript de assets/geom.js
      FullscreenLoader.tsx       tela de carregamento com atraso de 400 ms
  systems/
    shared/
      chrome/
        SheetChromeContext.tsx   dados que a página entrega ao layout (ver abaixo)
        SheetTopBar.tsx          barra superior da ficha (voltar, título, ações, status)
        SharePopover.tsx         painel de compartilhar (conteúdo idêntico ao da v1)
        SaveStatus.tsx           "Salvando…", "Salvo!", "Não salvo"
        UnsavedChangesFloat.tsx  barra "deseja salvá-las?" no visual novo
        ReadOnlyBanner.tsx
      ui/
        useBreakpoint.ts         'phone' | 'tablet' | 'desktop'
        useScrollbarReveal.ts    barra de rolagem visível só durante a rolagem
        BottomNav.tsx            navegação inferior do celular
        SideRail.tsx             trilho lateral do tablet
        Panel.tsx                painel: folha inferior no celular, diálogo no tablet/computador
        ExpandableList.tsx       lista com "+ Novo" no topo, item expansível e exclusão em dois toques
        ViewEditBlock.tsx        bloco texto com "Editar" → "Concluir"
        Stepper.tsx              − valor + com digitação direta
        NumberField.tsx          campo numérico com rascunho (ver "Campos numéricos")
        ChipFilter.tsx           filtro em pílulas (círculos de magia, categorias de nota)
    dnd-common/
      v2/                        seções da família D&D no visual novo (5.5e agora; 5e depois)
        VitalsCard.tsx           PV, máximo, temporários, barra, CA, iniciativa, deslocamento, proficiência,
                                 dados de vida, tamanho, inspiração, salvaguardas contra morte
        HpBar.tsx
        AbilityGrid.tsx          atributos em grade 3×2 (celular) ou em linhas (computador)
        SkillsByAbility.tsx      perícias agrupadas por atributo (celular/tablet)
        SkillsFlat.tsx           perícias em lista única (computador)
        WeaponsList.tsx          lista expansível (celular/tablet) e tabela (computador)
        SpellcastingHeader.tsx   atributo, modificador, CD, ataque
        SpellSlots.tsx           losangos por círculo + painel de edição
        SpellsList.tsx
        FeaturesList.tsx
        Inventory.tsx            moedas, sintonizados, equipamento
        ProfileBlock.tsx         identidade + história/personalidade
        panels/                  InfoPanel, SlotsPanel, CastAbilityPanel, CalcBonusPanel
    dnd5_5e/
      Dnd55SheetLayout.tsx       passa a escolher PhoneLayout / TabletLayout / DesktopLayout
      layouts/
        PhoneLayout.tsx
        TabletLayout.tsx
        DesktopLayout.tsx
```

Os componentes antigos de `src/components/sheet/` ficam intactos enquanto o 5e (2014) os usar. Remova-os só quando nenhum layout depender deles (fase 7).

### Quem desenha a barra superior: a página ou o layout

Hoje a página desenha a barra de ferramentas (Voltar, indicador de salvamento, Compartilhar, Tela cheia) e o layout desenha só o conteúdo. No redesign a barra superior traz informação do sistema (PV, CA, CD no celular; atalhos de seção no computador), então o layout 5.5e passa a desenhá-la.

Para isso há **uma única mudança aditiva e opcional** no contrato:

```ts
// src/systems/types.ts
export interface SystemDefinition<T> {
  // ...campos atuais, sem mudança...
  /** true: o layout desenha a barra superior e a navegação usando SheetChromeContext. */
  ownsChrome?: boolean;
}
```

- `CharacterSheet.tsx` e `SharedCharacterSheet.tsx` sempre envolvem o layout em `<SheetChromeProvider value={...}>`.
- Se `system.ownsChrome` for verdadeiro, a página **não** desenha a barra de ferramentas antiga nem o `UnsavedChangesBar`; o layout usa `SheetTopBar` e `UnsavedChangesFloat`.
- Se for falso ou ausente (5e 2014, Tormenta20), tudo continua como hoje.

```ts
// src/systems/shared/chrome/SheetChromeContext.tsx
export interface SheetChrome {
  readOnly: boolean;
  onBack: () => void;                 // navigate('/')
  save: {
    status: 'idle' | 'saving' | 'saved';
    hasUnsavedChanges: boolean;
    autoSaveEnabled: boolean;
    showUnsavedBar: boolean;          // = hasUnsavedChanges && !autoSaveEnabled (regra da v1)
    onSave: () => void;               // flush
    onDiscard: () => void;            // handleDiscard
    isSaving: boolean;
  };
  share?: {                           // ausente no modo somente leitura
    isShared: boolean;
    onToggle: (checked: boolean) => void;   // handleToggleShared da v1
    onCopyLink: () => void;                 // handleCopyShareLink da v1
    link: string;
  };
  fullscreen?: { active: boolean; onToggle: () => void };
}
```

Toda a lógica continua em `CharacterSheet.tsx`; o contexto só a expõe. Não duplique `flush`, `update` nem `deepEqual`.

## Pontos de quebra

| Nome | Largura | Layout |
|---|---|---|
| `phone` | < 1024 px | abas com navegação inferior (inclui tablet em retrato, decisão D3; conteúdo com no máximo 640 px, centralizado) |
| `tablet` | 1024–1279 px | trilho lateral + cabeçalho com vitais + colunas que rolam separadamente |
| `desktop` | ≥ 1280 px | página única no padrão da v1, com barra superior fixa e atalhos de seção |

`useBreakpoint()` usa `matchMedia` e renderiza **um** layout por vez (não esconda os três com CSS; isso triplicaria campos e IDs). A aba atual fica num estado do layout 5.5e que sobrevive à troca de layout (ex.: girar o tablet). Mapeamento de abas entre celular e tablet: Combate e Magias → Sessão; Perícias → Perícias; Traços → Traços; Mais/Mochila → Mochila; Mais/Perfil, Notas, Campos → Diário.

## Tokens de cor

Os mockups usam hexadecimais. Eles correspondem aos tokens que já existem em `src/index.css` (tema escuro). **Use os tokens, nunca hex no componente.**

| Hex no mockup | Token (escuro) | Uso |
|---|---|---|
| `#12151B` | `--background` | fundo da página |
| `#1A1F28` | `--card` | cartões |
| `#151920` | `--sidebar-background` (ou `--surface`, novo) | barra superior, navegação inferior, trilho |
| `#222833` | `--secondary` mais claro / novo `--surface-raised` | barras flutuantes |
| `#E6DCC8` | `--foreground` | texto |
| `#A0977F` | `--muted-foreground` | rótulos e texto secundário |
| `#D9A62E` | `--primary` | dourado |
| `#EBC15A` | novo `--primary-strong` | dourado sobre fundos dourados escuros (item selecionado) |
| `#2B2414` | `--primary` / 12 % | fundo de item selecionado |
| `#2A2E38`, `#3A3424` | `--border`, `--input` | bordas |
| `#B8423C` | novo `--hp` (`3 51% 48%`) | barra de PV, exclusão confirmada |
| `#5E86AB` | novo `--hp-temp` (`209 31% 52%`) | PV temporários na barra |
| `#8FB4D6` | novo `--hp-temp-foreground` (`209 46% 70%`) | número de PV temporários |

Tema claro (pergaminho, já existe em `:root`): os tokens novos precisam do par claro. Regra importante: **dourado como texto no claro usa `#8A6510` (`42 79% 30%`)**, porque o `--primary` claro (`43 74% 45%`) não passa contraste 4,5:1 sobre o pergaminho. Crie `--primary-text` com esse valor no claro e igual a `--primary` no escuro, e use-o em todo texto dourado.

## Tipografia e tamanhos

- Títulos e números de destaque: `var(--font-heading)` (Cinzel). Corpo: `var(--font-body)` (Crimson Text).
- Celular: corpo 16 px; rótulos 14 px (itálico em `--muted-foreground` nos rótulos de número); títulos de seção 13 px Cinzel, `letter-spacing: 0.12em`, maiúsculas, dourado.
- Números grandes: PV 40 px; CA/Iniciativa/Deslocamento/Proficiência 22 px; modificadores 22 px.
- Alvo mínimo de toque 44 × 44 px (botões de passo 40 × 40 dentro de linhas de 48 px de altura são aceitos).

## Campos numéricos

Use um rascunho de texto enquanto o campo está em foco (o mockup chama de `raw`):

- Ao focar, seleciona tudo; teclado numérico (`inputMode="numeric"`).
- Aceita só dígitos (até 3); o valor vai para `onChange` a cada tecla válida; campo vazio não grava nada.
- PV atual é limitado ao máximo; máximo e temporários só têm piso 0.
- Ao sair, o rascunho é descartado e o campo volta a mostrar o valor salvo.
- Campos de bônus aceitam sinal negativo (reaproveite a lógica do `BonusInput` da v1).

## Barras de rolagem

`useScrollbarReveal(ref)`: a área rolável recebe `scrollbar-width: thin` e cor de polegar transparente; no evento `scroll` a cor vira `hsl(var(--border))` e volta a transparente 900 ms depois do último evento. Em WebKit, faça o mesmo com `::-webkit-scrollbar-thumb` via classe. Aplicar em todo contêiner rolável da ficha (abas do celular, colunas do tablet, painéis, tabela de armas do computador).

## Acessibilidade

- Navegação inferior e trilho: `<nav aria-label="Seções da ficha">` com `aria-current="page"` (os mockups usam `aria-pressed`; prefira `aria-current`).
- Painéis: diálogo Radix (foco preso, Esc fecha, foco volta ao gatilho). No celular, desliza de baixo.
- Interruptor de compartilhar: `role="switch"` (Switch do shadcn).
- Botões só com ícone têm `aria-label` (ex.: "Compartilhar ficha (pública)", "Gastar um dado de vida").
- Barra "deseja salvá-las?": `role="status"`.
- Respeitar `prefers-reduced-motion` na animação de carregamento e nas transições de painel.

## Testes

- Vitest + Testing Library para: limites de PV, cálculo da barra (PV + temporários), dados de vida, alternância de espaços de magia, limite de sintonização, adicionar no topo, exclusão em dois toques, `showUnsavedBar` seguindo a regra da v1.
- Mantenha verdes `src/systems/registry.test.tsx`, os testes do 5e e do Tormenta20 e `src/utils/calculations.test.ts`.
- Playwright (`@playwright/test` já está nas dependências): um teste de fumaça por ponto de quebra abrindo a ficha, editando PV e conferindo o status de salvamento.
