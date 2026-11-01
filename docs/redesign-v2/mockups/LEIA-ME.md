# Mockups (fonte do canvas de design)

Estes arquivos são a fonte das telas desenhadas no canvas. **Eles não rodam fora do canvas** (dependem de um `support.js` do ambiente de design). Use-os como referência de leitura: estrutura, textos exatos, ordem dos elementos, tamanhos e espaçamentos.

| Arquivo | Tela |
|---|---|
| `Phone.dc.html` | Ficha 5.5e no celular (390 × 844), as 5 abas, painéis, compartilhar, somente leitura |
| `Tablet.dc.html` | Ficha 5.5e no tablet em paisagem (1194 × 834), trilho e 5 seções |
| `Desktop.dc.html` | Ficha 5.5e no computador (largura fluida, conteúdo até 1152 px) |
| `Home.dc.html` | Início: lista de fichas, criar, excluir, menu do usuário, temas escuro/claro |
| `Auth.dc.html` | Entrar, criar conta, senha, confirmação de email (propriedade `screen`) |
| `Profile.dc.html` | Meu Perfil |
| `LoadingMark.dc.html` | Animação de carregamento (componente usado pelas pranchas) |
| `LogoFinal.dc.html` | Guia de uso da marca |

Como ler:

- `{{nome}}` é um valor calculado no script no fim do arquivo (`class Component … renderVals()`). Procure o nome lá para ver a regra (ex.: `attuneAddLabel`, `hpBar`, `slotRows`).
- `<sc-if value="{{x}}">` mostra o trecho quando `x` é verdadeiro; `<sc-for list="{{lista}}" as="item">` repete.
- Os estilos estão em linha, em hexadecimal. Converta para tokens com a tabela de [../02-arquitetura.md](../02-arquitetura.md) — nunca copie hex para os componentes.
- Os dados são de exemplo (Silas Cole). O script simula estado local e "salvar"; **não** copie a lógica de salvamento dele — a lógica real é a de `src/pages/CharacterSheet.tsx`.
