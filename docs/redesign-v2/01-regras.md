# 01 · Regras que não podem ser quebradas

Estas regras vêm de decisões explícitas do dono do projeto e de regressões que já aconteceram durante o desenho. Elas valem para todas as fases.

## O que "moderno" significa aqui

- **Praticidade no celular e no tablet durante a sessão de jogo**, não um visual genérico. A dor principal é rolar a tela para cima e para baixo para achar informação.
- **Manter o tema medieval**: Cinzel nos títulos, Crimson Text no corpo, dourado como cor de destaque, fundo escuro azulado (e o tema pergaminho no claro).
- As seções mais usadas em jogo (teste real com um Bruxo no 5.5e) são **Informações gerais, Atributos, Armas e truques de dano, Conjuração**. Elas ficam juntas na primeira aba do celular e na primeira tela do tablet.

## Nada some

1. **Todo campo da ficha existe por um motivo.** Nenhum campo de `CharacterSheet` (`src/types/character.ts`) pode ficar sem forma de ver e editar. A lista completa está em [07-checklist-regressao.md](07-checklist-regressao.md).
2. **Nenhuma função da v1 é removida sem pedido.** Já aconteceu de o compartilhamento sumir no desenho; foi um erro. Compartilhar, tela cheia, ficha compartilhada somente leitura, tema claro/escuro/sistema, salvamento automático e o indicador de salvamento continuam.
3. **Formulários seguem a v1**: mesmos campos, mesma possibilidade de adicionar e de excluir. O redesign muda a apresentação, não o conjunto de campos.
4. **Excluir sempre com confirmação em dois toques**, como o `ConfirmDeleteButton` da v1: o primeiro toque troca o botão para "Confirmar exclusão" em vermelho; tocar fora cancela.
5. **Bônus adicionais** (`sheet.bonuses`: proficiência, iniciativa, salvaguardas, perícias) continuam editáveis, aceitando negativos e digitação direta (como o `BonusInput` da v1). Os botões − e + do redesign são um atalho a mais, nunca o único jeito de mudar o valor. O mesmo vale para o valor dos atributos (1 a 30).

## Comportamentos que ficam exatamente como na v1

- **Salvamento** (`src/pages/CharacterSheet.tsx`): debounce de 10 s com salvamento automático ligado, salvar ao sair de um campo (`onBlur`), salvar imediatamente ao mudar a visibilidade de compartilhamento, aviso `beforeunload` com alterações pendentes, tratamento de erro com `toast` e reversão. **Não reescreva essa lógica**; os componentes novos só chamam `onChange` e `onBlur`.
- **Barra "Alterações foram realizadas, deseja salvá-las?"** (`UnsavedChangesBar`): aparece quando há alterações e o salvamento automático está **desligado**, com "Descartar" e "Salvar Alterações". O redesign muda só a posição e o visual (ver 03-ficha.md); a condição de exibição continua a da v1.
- **Indicador de salvamento**: estados "Salvando…" e "Salvo!" da v1. No redesign ele mora na barra superior da ficha.
- **Compartilhar**: o interruptor muda `isShared` e salva na hora, com os mesmos avisos (toasts) da v1. O link é `${window.location.origin}/character/shared/${id}`.
- **Ficha compartilhada** (`/character/shared/:id`): somente leitura; Inventário, Notas da Campanha e Campos Personalizados ficam ocultos.
- **Cálculos**: use as funções de `src/utils/calculations.ts`. Não reimplemente fórmulas em componentes.
- **Regra da casa de sintonização**: limite de itens sintonizados = bônus de proficiência efetivo (`getAttunementSlots`).
- **Limites de texto** (o backend valida e devolve erro "texto/limite"): mantenha os `maxLength` da v1 — Nome 255, Classe 100, Idiomas 500, História e personalidade 10 000, Característica de classe 1 500, Traços de espécie 5 000, Talentos 5 000, Conteúdo de nota 5 000. Procure `maxLength` em `src/components/sheet/` antes de criar cada campo.
- **Mudanças intencionais em relação à v1** (decididas; não "corrija" de volta):
  - item novo entra no **início** da lista (a v1 acrescenta no fim);
  - salvaguardas contra morte aparecem com PV 0 ou quando já há marcação (a v1 mostra sempre);
  - lixeira do cartão de ficha sempre visível (na v1 só com o mouse em cima);
  - textos novos listados em [04-inicio-e-contas.md](04-inicio-e-contas.md) (subtítulo do início, descrição do salvamento automático).

## Sem mudanças de dados nem de API

O redesign da ficha 5.5e **não precisa de nenhum campo novo**. Tudo o que as telas mostram já existe em `CharacterSheet` (inclusive `hitDice.used`, `deathSaves`, `heroicInspiration`, `hitPoints.temp`). Se uma tarefa parecer exigir campo novo, pare e registre no PR; não altere o schema do backend (`grimorio-api`) nesta rodada.

Também não mudam: rotas (`src/App.tsx`), serviços (`src/services/`), hooks de dados (`src/hooks/useCharacters.ts`) e o registry. O contrato `SystemDefinition` (`src/systems/types.ts`) ganha só um campo opcional, `ownsChrome`, descrito em [02-arquitetura.md](02-arquitetura.md); nenhum campo existente muda.

## Padrões de interface decididos

- **Botão de adicionar no topo da lista** ("+ Nova arma", "+ Nova magia", "+ Nova característica", "+ Novo item", "+ Nova nota", "+ Novo campo", "+ Sintonizar item"). Vale para o sistema todo.
- **Item novo entra no topo da lista**, já aberto, com o foco no primeiro campo.
- **Pontos de vida**: tocar no número já edita (seleciona tudo, teclado numérico). A barra de vida responde na hora. **PV temporários** têm campo próprio e aparecem em azul na barra. Sem botões de "ajustar" nem teclado próprio.
- **Dados de vida** com botões − (gastar) e + (recuperar).
- **Atributo de conjuração** trocável por um painel que mostra, para cada atributo, a CD e o ataque resultantes.
- **Traços de espécie, Talentos e Treinamento em equipamento** editáveis (modo leitura com botão "Editar" → "Concluir").
- **Sem etiquetas (tags)** em itens. Foi proposto e recusado.
- **Barras de rolagem escondidas**, aparecendo só enquanto a área rola (somem ~0,9 s depois de parar).
- **Botão de compartilhar discreto**: mesmo peso visual dos outros botões de ícone do cabeçalho; quando a ficha é pública, só um ponto dourado de 7 px no canto do ícone.
- **Computador segue a lógica de layout da v1** (ela já resolve bem o aproveitamento de espaço), com os acréscimos do redesign. Não trocar por grade de 4 colunas nem por abas.
- Alvos de toque de no mínimo **44 × 44 px** no celular e no tablet. Texto de corpo com no mínimo **16 px** no celular (labels 14 px). A v1 usava `text-xs` em muitos campos; isso foi apontado como causa de cansaço visual.

## Antes de abrir cada PR

- Rode `npm run lint`, `npm test` e `npm run build`.
- Marque os itens afetados em [07-checklist-regressao.md](07-checklist-regressao.md).
- Teste em 390 × 844 (celular), 1194 × 834 (tablet paisagem), 834 × 1194 (tablet retrato) e 1440 × 900 (computador), nos temas escuro e claro.
- Confira que as fichas 5e (2014) e Tormenta20 continuam abrindo e salvando.
