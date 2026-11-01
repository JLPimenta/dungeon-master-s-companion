# 03 · Ficha D&D 5.5e

Dados de exemplo usados nos mockups: Silas Cole, Bruxo 12 (Grande Antigo), Humano, Criminoso. Os mockups estão em `mockups/Phone.dc.html`, `mockups/Tablet.dc.html` e `mockups/Desktop.dc.html`.

## Valores calculados (todos via `src/utils/calculations.ts`)

| Valor | Fórmula | Função |
|---|---|---|
| Modificador | ⌊(valor − 10) / 2⌋ | `getModifier` |
| Proficiência | pelo nível + `bonuses.proficiencyBonus` | `getEffectiveProficiencyBonus` |
| Salvaguarda | mod + prof (se proficiente) + `bonuses.savingThrows[atributo]` | `getSavingThrowBonus` |
| Perícia | mod + (especialista ? 2 × prof : proficiente ? prof : 0) + `bonuses.skills[nome]` | `getSkillBonus` |
| Iniciativa | mod de Destreza + `bonuses.initiative` | `getInitiativeBonus` |
| CD de magia | 8 + mod do atributo de conjuração + prof | `getSpellSaveDC` |
| Ataque de magia | mod do atributo de conjuração + prof | `getSpellAttackBonus` |
| Percepção passiva | 10 + Percepção | `getPassivePerception` |
| Limite de sintonizados | = proficiência efetiva | `getAttunementSlots` |
| Dados de vida disponíveis | número antes do "d" em `hitDice.total` (ex.: "11d8" → 11) − `hitDice.used` | novo helper `parseHitDiceCount` em `calculations.ts`, com teste |
| Peso total | Σ peso × quantidade do equipamento, 1 casa decimal, em lb | novo helper `getTotalWeight` |

Sem atributo de conjuração (`spellcastingAbility === ''`), CD e ataque mostram "—".

**Marca de bônus:** todo valor que inclui um bônus adicional diferente de zero mostra um pequeno losango azul (`--hp-temp-foreground`) ao lado, com `title="Inclui bônus adicional"`. Legenda na aba Perícias: losango dourado = proficiente, losango azul = com bônus.

## Peças comuns aos três tamanhos

### Pontos de vida (`VitalsCard` + `HpBar`)

- Rótulo "Pontos de vida". Número atual grande (40 px) editável, "/", máximo editável. Ao lado, "Temporários" com campo próprio em azul.
- Os três são `NumberField` (ver 02-arquitetura.md). PV atual nunca passa do máximo.
- **Barra:** largura total = `max(máximo, atual + temporários)`. Segmento vermelho (`--hp`) = atual; segmento azul (`--hp-temp`) logo depois = temporários. Transição de largura de 250 ms.
- **Salvaguardas contra morte** (`deathSaves`): "Sucesso" e "Falha", 3 marcadores cada; tocar no marcador *i* define a contagem para *i* + 1 (ou *i*, se já estava marcado), como o `setDeathSave` da v1. **Mudança intencional:** a v1 mostra sempre; o redesign mostra quando PV atual = 0 **ou** quando há qualquer marcação (`successes > 0 || failures > 0`), para que marcações antigas possam ser zeradas. Os mockups só mostram com PV 0; vale esta regra.
- Celular, fora da aba Combate: faixa compacta sob a barra superior com "PV [campo] / máximo", "+temporários" em azul quando > 0, "CA n", "CD n".

### Números de combate

Quatro botões em linha, cada um com o número (22 px) e o rótulo (14 px, itálico):

| Botão | Ao tocar |
|---|---|
| CA (com ícone de escudo) | painel **Informações gerais** |
| Iniciativa | painel de **cálculo + bônus** de iniciativa |
| Deslocamento ("9 m") | painel **Informações gerais** |
| Proficiência | painel de **cálculo + bônus** de proficiência |

Abaixo: "Dados de vida" com − (gastar: `used + 1`, até o total) · "disponíveis / total" · + (recuperar: `used − 1`, até 0); "Tamanho" com o valor; link "editar" (abre Informações gerais); botão **Inspiração** (`heroicInspiration`, alternável, ícone de estrela preenchida quando ativo).

### Painéis (`Panel`: folha inferior no celular, diálogo centralizado no tablet e no computador)

| Painel | Título | Conteúdo |
|---|---|---|
| Informações gerais | INFORMAÇÕES GERAIS | CA (número), Deslocamento (m) (número), Tamanho (texto), Dado de vida (total) (texto, ex. "11d8"). Nota: "Iniciativa e proficiência são calculadas; toque nelas para ver o cálculo e o bônus adicional." |
| Atributo de conjuração | ATRIBUTO DE CONJURAÇÃO | 7 opções: "Nenhum" e os 6 atributos. Cada opção mostra nome, modificador entre parênteses e o resultado ("CD 18 · Ataque +10", ou "sem conjuração"). Escolher grava `spellcastingAbility` e fecha. |
| Espaços de magia | ESPAÇOS DE MAGIA | Uma linha por círculo (1º a 9º) com "Usados" − n + e "Total" − n + (0 a 9). Total menor que usados puxa usados para baixo. |
| Cálculo + bônus | nome do valor em maiúsculas | Linhas do cálculo (ex.: "Modificador de Destreza +4"), **Bônus adicional** (subtítulo "antecedente, item, talento…") com − valor + e digitação direta aceitando negativos, e o total. |

Variações do painel de cálculo:

- **Iniciativa:** linha "Modificador de Destreza"; bônus = `bonuses.initiative`; total = iniciativa.
- **Proficiência:** linha "Pelo nível 12"; bônus = `bonuses.proficiencyBonus`; total; nota "Afeta perícias, salvaguardas, CD e ataque de magia e o limite de itens sintonizados."
- **Atributo** (ex.: FORÇA): "Valor do atributo" − n + (1 a 30, com digitação direta); escolha "Salvaguarda": "Sem proficiência" / "Proficiente"; linhas "Modificador de Força" e "Proficiência"; bônus = `bonuses.savingThrows[atributo]`; total "Salvaguarda".
- **Perícia** (ex.: PERCEPÇÃO): escolha "Treinamento": "Nenhum" / "Proficiente" / "Especialista"; linhas "Modificador de Sabedoria" e "Proficiência" (ou "Especialização (2 × prof.)"); bônus = `bonuses.skills[nome]`; total.

### Listas expansíveis (`ExpandableList`)

Usadas em armas, magias, características de classe, itens sintonizados, equipamento, notas e campos personalizados.

- Cabeçalho da seção com título e contagem (ex.: "ARMAS E TRUQUES DE DANO · 13 ataques", "MAGIAS · 28 magias").
- **Botão "+ Novo…" no topo, antes do primeiro item**, largura total, borda tracejada dourada.
- Item novo entra no **início** do array, já aberto, com foco no primeiro campo. Gere `id` com `crypto.randomUUID()` como a v1.
- Só um item aberto por lista. Tocar no cabeçalho do item abre/fecha.
- Dentro do item aberto, no fim: botão "Remover" (ícone de lixeira, discreto). Primeiro toque → "Confirmar exclusão" em vermelho (`--hp`); segundo toque exclui; tocar fora volta ao normal.
- Item sem nome mostra o rótulo padrão ("Nova arma", "Nova magia", "Nova característica", "Novo item", "Novo item sintonizado", "Nova nota", "Novo campo").

### Formulários (iguais aos da v1)

| Lista | Campos (rótulo · placeholder) |
|---|---|
| Arma (`weapons`) | Nome · "Nome da arma"; +Atq / CD · "+5 / CD 13"; Dano · "1d8+3"; Tipo · "Cortante"; Notas · "Propriedades…" |
| Magia (`spells`) | Círculo (seleção: Truque, 1º…9º); Nome; Tempo · "1 ação"; Alcance · "30 pés"; Notas / Material (área de texto) · "Componentes, observações…"; Concentração (caixa); Ritual (caixa) |
| Característica de classe (`classFeatures`, string) | Área de texto · "Descreva a característica…". O título na lista é a primeira linha do texto. |
| Item sintonizado (`attunedItems`) | Nome · "Nome do item"; Descrição / Efeito · "Propriedade ou efeito…" |
| Equipamento (`inventory`) | Item · "Nome do item"; Quantidade (número); Peso (lb) (decimal); Notas · "Observações…" |
| Nota (`campaignNotes`) | Categoria (NPCs, Locais, Eventos, Geral); Título; Conteúdo (área de texto) |
| Campo personalizado (`customFields`) | Nome do campo; Valor (área de texto). Ao criar, `section: 'geral'` como na v1. |

`Spell.materialRequired` e `CustomField.section` não têm campo na v1 e continuam sem campo; preserve os valores existentes ao salvar.

### Blocos de texto (`ViewEditBlock`)

Traços de espécie (`speciesTraits`), Talentos (`feats`), Treinamento em equipamento (`armorTraining`, `weaponTraining`, `toolTraining` com rótulos Armaduras, Armas, Ferramentas), Perfil (identidade) e História e personalidade (`personalityAndHistory`). Mostram o texto; botão "Editar" (ícone de lápis) no cabeçalho troca para campos e o botão vira "CONCLUIR". Só um bloco em edição por vez.

### Barra superior da ficha (`SheetTopBar`)

- Voltar (celular: seta; tablet: marca do Grimório no topo do trilho; computador: marca do Grimório à esquerda), sempre com `aria-label="Voltar aos personagens"`.
- Nome do personagem (Cinzel, truncado) e subtítulo "Classe Nível · Subclasse".
- Compartilhar (só com permissão de escrita): botão de ícone com o **mesmo estilo dos demais botões de ícone** (sem fundo dourado). Ficha pública: ponto dourado de 7 px no canto superior direito do ícone; `aria-label` "Compartilhar ficha (pública)" ou "(privada)".
- Tela cheia: `Maximize`/`Minimize`, em **todos** os tamanhos quando `document.fullscreenEnabled` for verdadeiro (a v1 oferece no celular; o mockup do celular omitiu o botão por falta de espaço — coloque-o depois de Compartilhar, mesmo estilo de ícone).
- Status de salvamento (`SaveStatus`): "Salvando…" (com giro), "Salvo!" (some depois de 5 s, como na v1), "Não salvo" quando há alterações pendentes.
- Somente leitura: selo "Somente leitura" (ícone de olho) no lugar de Compartilhar.

### Painel de compartilhar (`SharePopover`)

Igual à v1, só com borda neutra (`--border`, não dourada): ícone de globo (pública, dourado) ou cadeado (privada) + "Ficha pública" / "Ficha privada"; linha "Permitir acesso via link" com interruptor; quando pública: "Qualquer pessoa com o link poderá visualizar esta ficha em modo somente leitura.", campo com o link (somente leitura, seleciona tudo ao focar) e botão "Copiar". Fecha ao tocar fora.

### Barra "deseja salvá-las?" (`UnsavedChangesFloat`)

Mesma condição da v1 (`showUnsavedBar`). Visual: cartão flutuante `--surface-raised`, borda dourada, texto "Alterações foram realizadas, deseja salvá-las?", botões "Descartar" (secundário) e "Salvar alterações" (primário; "Salvando…" enquanto salva). Posição: celular, acima da navegação inferior, de borda a borda com 10 px de margem; tablet e computador, centralizado na base da área de conteúdo.

## Celular (< 1024 px)

Estrutura de cima para baixo: barra superior (56 px) · faixa compacta de vitais (fora da aba Combate) · banner de somente leitura (se for o caso) · conteúdo da aba (rola) · navegação inferior (72 px, 5 botões com ícone + rótulo; ativo em dourado com traço de 2 px no topo).

| Aba | Ícone (lucide) | Conteúdo, nesta ordem |
|---|---|---|
| **Combate** | `Sword` | Cartão de vitais (PV, temporários, barra, 4 números, dados de vida, tamanho, inspiração, salvaguardas contra morte se PV = 0) · **Atributos** em grade 3 × 2 (sigla + valor, modificador grande, "salv. +n"; toque abre o painel do atributo) · **Armas e truques de dano** (lista expansível; linha fechada: nome, +atq, dano) |
| **Magias** | `BookOpen` | Cartão de conjuração: botão **Atributo** (sigla + seta; abre o painel), **CD de magia**, **Ataque** · **Espaços de magia** com "Editar": uma linha por círculo com total > 0 ("5º círculo", losangos, "disponíveis / total"); tocar num losango cheio gasta, num vazio recupera; sem espaços: "Nenhum espaço definido." · **Magias**: "+ Nova magia", pílulas de filtro (Todas, Truques, e só os círculos que têm magia), grupos por círculo ("TRUQUES", "1º CÍRCULO"…); linha fechada: nome, "tempo · alcance", marcas "C" (concentração) e "R" (ritual) |
| **Perícias** | `ListChecks` | Legenda + "Percepção passiva n" · um cartão por atributo: cabeçalho (nome, "valor n", modificador; abre o painel do atributo), linha "Salvaguarda" (marca de proficiência, valor; abre o painel do atributo) e as perícias desse atributo (marca: 1 losango = proficiente, 2 = especialista; valor; abre o painel da perícia) |
| **Traços** | `Scroll` | **Características de classe** (lista expansível) · **Traços de espécie** · **Talentos** · **Treinamento em equipamento** |
| **Mais** | `Backpack` | Seletor segmentado no topo: Perfil · Mochila · Notas · Campos (somente leitura: só Perfil). **Perfil**: identidade (Nome em largura total; Classe, Subclasse, Nível, XP, Espécie, Antecedente, Alinhamento, Idiomas em duas colunas) e História e personalidade. **Mochila**: Moedas (PC, PP, PE, PO, PL, campos numéricos em linha), Itens sintonizados ("n / limite", "· limite atingido"; nota "Limite = bônus de proficiência"; botão "+ Sintonizar item" que vira "Limite de sintonização atingido" desabilitado), Equipamento (peso total no título; linha fechada: ×quantidade, nome, peso). **Notas**: "+ Nova nota", pílulas (Todas, NPCs, Locais, Eventos, Geral), cartões com categoria, título e prévia do conteúdo; vazio: "Nenhuma nota nesta categoria." **Campos**: "+ Novo campo" e a lista |

Trocar de aba fecha edições abertas e cancela confirmações de exclusão pendentes.

## Tablet (1024–1279 px)

- **Trilho lateral** (88 px): marca do Grimório (voltar) no topo; 5 botões com ícone + rótulo: **Sessão** (`Sword`), **Perícias** (`ListChecks`), **Traços** (`Scroll`), **Mochila** (`Backpack`), **Diário** (`BookOpen`); status de salvamento no pé.
- **Cabeçalho** fixo: nome (h1) e subtítulo; PV atual / máximo / "Temp." (campos); CA, Iniciativa, Deslocamento ("Desloc."), Proficiência (botões, mesmos painéis); botão de editar informações; Compartilhar; Tela cheia.
- **Sessão** — três colunas que rolam separadamente (`270px | 1fr | 360px`):
  1. **Atributos** em 2 colunas (mesmo cartão do celular), Percepção passiva, Tamanho + "editar", Dados de vida − n/total +, salvaguardas contra morte se PV = 0.
  2. **Armas e truques de dano** (lista expansível).
  3. **Conjuração** (atributo, CD, ataque), **Espaços de magia**, **Magias** (pílulas e grupos).
- **Perícias**: os 6 cartões de atributo em 3 colunas.
- **Traços**: Características de classe | Traços de espécie, Talentos, Treinamento.
- **Mochila**: Moedas e Itens sintonizados | Equipamento.
- **Diário**: Perfil e História e personalidade | Notas da campanha | Campos personalizáveis.
- Somente leitura (D6): esconder Mochila do trilho; no Diário, mostrar só Perfil e História.

## Computador (≥ 1280 px)

Segue a lógica da v1 (`Dnd55SheetLayout` atual): página única que rola, conteúdo com no máximo 1152 px.

- **Barra superior fixa** (64 px): marca do Grimório (voltar); nome e subtítulo; **atalhos de seção** (âncoras com rolagem suave): Ficha, Atributos, Armas, Magias, Inventário, Traços, História, Notas, Campos (Inventário, Notas e Campos somem no somente leitura); PV [campo] / máximo e "+temporários"; CA; Compartilhar; Tela cheia; status.
- **Cabeçalho da ficha** (âncora `topo`): grade de identidade — Nome (2 colunas), Classe, Subclasse, Nível, Espécie, Antecedente, XP — modo leitura/edição com "Editar"/"Concluir"; botão **Proficiência** (abre o painel).
- **Grade de duas colunas** (`300px | 1fr`, colunas com a mesma altura):
  - Esquerda: **Atributos** em linhas (modificador grande, nome, "valor n", "salv. +n"; abre o painel) e **Perícias** em lista única (nome, sigla do atributo, marca, valor; "Passiva n" no título).
  - Direita: **Informações gerais** (o mesmo cartão de vitais do celular), **Armas e truques de dano** em tabela (Nome, +Atq / CD, Dano, Tipo, Notas; altura máxima de 300 px com rolagem; linha abre o formulário embaixo) e **História e personalidade** (ocupa o resto da altura; texto + Alinhamento e Idiomas; "Editar"/"Concluir").
- **Conjuração** (largura total, âncora `magias`): quatro caixas — Atributo (botão), Modificador, CD de magia, Ataque — e "Editar espaços"; **espaços em 9 colunas** (1º a 9º; losangos; "—" quando o total é 0); **Magias** em tabela (Nome, Tempo, Alcance, C/R) com pílulas e grupos por círculo.
- **Inventário** (âncora `inventario`; oculto no somente leitura): Itens sintonizados ("· limite = bônus de proficiência") em tabela Nome | Descrição / Efeito; Moedas; Equipamento em tabela Item | Qtd | Peso (lb) | Notas, com peso total.
- **Características e traços** (âncora `tracos`): Características de classe (lista) e, abaixo, três colunas: Traços de espécie | Talentos | Treinamento em equipamento.
- **Notas da campanha** (âncora `notas`; oculto no somente leitura): pílulas e grade de cartões; a nota aberta ocupa a linha inteira.
- **Campos personalizáveis** (âncora `campos`; oculto no somente leitura).

## Ficha compartilhada (somente leitura)

Rota `/character/shared/:id` (`SharedCharacterSheet.tsx`) com `readOnly`:

- Banner no topo do conteúdo: "Você está visualizando a ficha de **{nome}** em modo somente leitura. Nenhuma alteração será salva."
- Selo "Somente leitura" na barra superior; sem Compartilhar e sem status de salvamento; tela cheia continua.
- Ocultos: Inventário/Mochila, Notas da campanha, Campos personalizáveis (como na v1).
- Nenhum campo editável e nenhum botão de adicionar, excluir, editar ou − / +. Os cartões que abrem painéis continuam podendo abrir o painel para **ver** o cálculo, sem controles de edição. Rolagem e troca de abas continuam funcionando.
