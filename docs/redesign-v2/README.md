# Redesign v2 — especificação para implementação

Este pacote descreve o redesign do frontend do Grimório de Personagens (ficha D&D 5.5e, tela de início, contas, marca e animação de carregamento) com detalhe suficiente para um agente implementar sem consultar o canvas de design.

**Escopo desta rodada:** ficha **D&D 5.5e** (`dnd5_5e`), tela inicial, telas de conta, Meu Perfil, marca e carregamento. As fichas D&D 5e (2014) e Tormenta20 não mudam nesta rodada (ver [06-plano.md](06-plano.md), fase 7).

## Ordem de leitura

| Arquivo | Conteúdo |
|---|---|
| [01-regras.md](01-regras.md) | O que não pode mudar. Leia antes de tocar em qualquer arquivo. |
| [02-arquitetura.md](02-arquitetura.md) | Onde cada peça mora no código, componentes novos, tokens, pontos de quebra, acessibilidade. |
| [03-ficha.md](03-ficha.md) | A ficha 5.5e no celular, tablet e computador: conteúdo de cada aba, painéis, formulários e interações. |
| [04-inicio-e-contas.md](04-inicio-e-contas.md) | Início (lista de fichas), Entrar, Criar conta, senha, confirmação de email, Meu Perfil. |
| [05-marca.md](05-marca.md) | Logo, ícones, favicon e animação de carregamento. |
| [06-plano.md](06-plano.md) | Fases, entregas por PR e critérios de aceite. |
| [07-checklist-regressao.md](07-checklist-regressao.md) | Tudo o que a v1 faz e precisa continuar fazendo. Marque item a item antes de cada PR. |

Material de apoio:

- `mockups/` — fonte HTML das telas desenhadas. Não rodam fora do canvas; servem para ler estrutura, textos exatos e estilos. Veja [mockups/LEIA-ME.md](mockups/LEIA-ME.md).
- `assets/` — arquivos finais da marca (SVG, favicon, ícones PNG, manifesto, geometria da animação).
- Canvas de design (privado, acesso do dono do projeto): https://claude.ai/artifact/3MYkC71r8wYQqbcMjaDBVz — páginas "v2 · Ficha", "v2 · Início e contas" e "Logo · conceitos". A página "v1 · Moderno (descartada)" foi rejeitada e **não** deve ser implementada.

## Hierarquia de fontes (quando duas coisas se contradizem)

1. Comportamento atual da v1 no código (`src/`) — o redesign muda a forma, não as regras.
2. [01-regras.md](01-regras.md).
3. Este pacote de documentos.
4. Os mockups.

Os mockups usam dados de exemplo e simplificações (ex.: a barra "deseja salvá-las?" aparece em toda edição, porque o protótipo não simula o salvamento automático). Onde o mockup e a v1 divergem em comportamento, vale a v1.

## Decisões pendentes (com o padrão a seguir até o dono decidir)

| # | Decisão | Padrão a implementar |
|---|---|---|
| D1 | Campo de PV aceitar conta relativa ("-12", "+8") | **Não implementar.** Em espera por decisão do dono. Manter digitação do valor absoluto. |
| D2 | Ficha 5e (2014) adotar o mesmo layout em abas | Fora desta rodada. Os componentes novos ficam em `src/systems/dnd-common/` para permitir a adoção depois. |
| D3 | Tablet em retrato (largura 768–1023 px) | Usa o layout de celular, com conteúdo centralizado em no máximo 640 px. |
| D4 | Unidade do deslocamento | Mostrar "m" depois do número na ficha 5.5e (o livro em português usa metros). O dado continua número puro. |
| D5 | Tema claro nas telas da ficha | Não foi desenhado. Implementar todas as cores por token (CSS vars) para o tema claro funcionar; revisar contraste no claro antes de liberar. |
| D6 | Modo somente leitura no tablet | Não foi desenhado. Seguir a mesma regra do celular e do computador (ver 03-ficha.md, "Ficha compartilhada"). |

Ao terminar cada fase, liste no PR qualquer outra divergência encontrada em vez de decidir sozinho.
