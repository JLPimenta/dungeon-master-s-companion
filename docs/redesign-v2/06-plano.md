# 06 · Plano de implementação

Cada fase é um PR (ou poucos PRs) que deixa o app funcionando. Não comece uma fase antes de a anterior estar integrada. Em cada PR: descrição do que mudou, prints nos 4 tamanhos de tela (ver 01-regras.md) e a lista de itens marcados no [07-checklist-regressao.md](07-checklist-regressao.md).

## Fase 0 — Base (sem mudança visível)

- Tokens novos em `src/index.css` (escuro e claro): `--hp`, `--hp-temp`, `--hp-temp-foreground`, `--surface`, `--surface-raised`, `--primary-strong`, `--primary-text`; registrar em `tailwind.config.ts`.
- `useBreakpoint`, `useScrollbarReveal`.
- Helpers `parseHitDiceCount` e `getTotalWeight` em `calculations.ts`, com testes.
- `ownsChrome?` em `SystemDefinition` e `SheetChromeContext`; `CharacterSheet.tsx` e `SharedCharacterSheet.tsx` passam a fornecer o contexto (sem usar ainda).

**Aceite:** build, lint e testes verdes; nenhuma tela muda.

## Fase 1 — Marca

- `GrimorioMark`, ícones e favicon em `public/`, `index.html`, `site.webmanifest`.
- Trocar `Scroll` por `GrimorioMark` no `AppHeader` e no `AppFooter`.
- `LoadingMark` + `loadingGeometry.ts` + `FullscreenLoader` (atraso de 400 ms, saída imediata, movimento reduzido).
- Usar `FullscreenLoader` no `ProtectedRoute`, `CharacterSheet` e `SharedCharacterSheet`.

**Aceite:** quadro 0 da animação idêntico à marca parada (teste de snapshot dos pontos); carregamento < 400 ms não mostra nada; favicon novo nas abas clara e escura.

## Fase 2 — Primitivos da ficha

Em `src/systems/shared/`: `Panel`, `ExpandableList`, `ViewEditBlock`, `Stepper`, `NumberField`, `ChipFilter`, `BottomNav`, `SideRail`, `SheetTopBar`, `SharePopover`, `SaveStatus`, `UnsavedChangesFloat`, `ReadOnlyBanner`.

**Aceite:** testes de unidade de `ExpandableList` (adicionar no topo e abrir, um aberto por vez, exclusão em dois toques, tocar fora cancela) e `NumberField` (selecionar ao focar, só dígitos, limite, rascunho descartado ao sair).

## Fase 3 — Ficha 5.5e no celular

- Seções `src/systems/dnd-common/v2/*` e painéis.
- `PhoneLayout` com as 5 abas; `dnd55System.ownsChrome = true`; `Dnd55SheetLayout` escolhe o layout pelo ponto de quebra (tablet e computador continuam usando o layout antigo nesta fase, dentro do mesmo componente, até as fases 4 e 5).
- Somente leitura no celular.

**Aceite:** todos os itens do checklist da ficha conferidos em 390 × 844 e 834 × 1194; editar PV no celular atualiza a barra; salvamento automático ligado e desligado se comportam como na v1.

## Fase 4 — Ficha 5.5e no tablet

`TabletLayout` (trilho, cabeçalho, Sessão em 3 colunas, Perícias, Traços, Mochila, Diário) e somente leitura (D6).

**Aceite:** em 1194 × 834 as quatro seções de jogo (vitais, atributos, armas, conjuração) ficam visíveis sem rolar a página; cada coluna rola sozinha.

## Fase 5 — Ficha 5.5e no computador

`DesktopLayout` no padrão da v1 com barra superior fixa, atalhos de seção, tabelas de armas e magias, espaços em 9 colunas, notas em grade.

**Aceite:** comparar lado a lado com a v1 em 1440 × 900 — nenhuma seção ausente, nenhuma área vazia nova (a coluna da direita estica até a altura da esquerda como na v1).

## Fase 6 — Início, contas e perfil

Reforma visual de `Index`, `CharacterCard`, diálogos, telas de conta e `Profile` conforme [04-inicio-e-contas.md](04-inicio-e-contas.md).

**Aceite:** fluxos completos funcionando: cadastrar, confirmar email, entrar, entrar com Google (primeiro acesso), esquecer e redefinir senha, editar perfil, trocar senha, trocar tema, excluir conta, criar e excluir ficha.

## Fase 7 — Depois desta rodada (não fazer sem pedido)

- Ficha 5e (2014) adotar `dnd-common/v2` e `ownsChrome` (D2).
- Tormenta20 adotar o casco (barra superior, navegação, painéis) com seções próprias.
- Remover `src/components/sheet/*` quando nenhum layout depender dele.
- Campo de PV com conta relativa (D1), se o dono aprovar.
