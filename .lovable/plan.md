

# Plano: Gerar documentos .docx

## Resposta sobre NestJS + Vercel

Sim, a arquitetura atual do frontend suporta integração com NestJS perfeitamente. A camada de serviço (`CharacterService` interface) foi projetada exatamente para isso -- basta criar um `apiService.ts` que implemente a mesma interface usando `fetch` apontando para os endpoints NestJS. Zero mudança nos componentes React.

## Nota para o futuro

**Tela de Configuração**: Registrado. Futuramente, criar uma página `/settings` onde o jogador poderá definir regras da mesa (ex: fórmula de itens sintonizados, regras de descanso, variantes de encumbrance, etc.) que alterem dinamicamente os cálculos e campos da ficha.

## Documentos a gerar (2 arquivos .docx)

### Documento 1: Design System Guide
Dados extraídos do `index.css` e `tailwind.config.ts`:
- **Fontes**: Cinzel (headings), Crimson Text (body)
- **Paleta de cores** (HSL → HEX): Background `#171c24`, Foreground `#cec4b2`, Primary/Gold `#daa520`, Accent/Red `#8a2a2a`, Card `#1e2430`, Border `#534a2e`, Muted `#252b35`, Input `#2b3140`
- **Radius**: 0.375rem (6px)
- **Spacing patterns**, component structure, typography scale

### Documento 2: Documentação Funcional (US01-US11)
Seguindo o formato do PDF modelo (História de Usuário, Premissas, Critérios de Aceite, campos detalhados):
- **US01** - Tela Inicial (dashboard, cards, grid responsivo)
- **US02** - Criar Ficha de Jogador (dialog, nome obrigatório, redirecionamento)
- **US03** - Cabeçalho, Atributos & Perícias (campos do header, 6 atributos, 18 perícias, cálculos automáticos)
- **US04** - Informações Gerais (CA, PV, Iniciativa, Deslocamento, Dado de Vida, Salvaguarda contra Morte, Inspiração)
- **US05** - Armas e Truques de Dano (tabela dinâmica com nome, bônus, dano, tipo, notas)
- **US06** - Características e Traços (features de classe, traços de espécie, talentos, treinamento em equipamentos)
- **US07** - Conjuração (atributo, CD, slots 1-9, lista ilimitada de magias)
- **US08** - Inventário (equipamento, itens sintonizados com escala por proficiência, moedas)
- **US09** - Personalidade e História (texto livre, alinhamento, idiomas)
- **US10** - Notas da Campanha (notas categorizadas: NPCs, Locais, Eventos, Geral)
- **US11** - Campos Personalizáveis (campos label/valor para regras da casa)

## Implementação técnica

Usarei `docx-js` (npm) para gerar ambos os .docx com formatação profissional (headings, tabelas, listas), seguindo o estilo do documento modelo. Os arquivos serão salvos em `/mnt/documents/`.

Arquivos gerados:
1. `/mnt/documents/design_system_guide.docx`
2. `/mnt/documents/documentacao_funcional.docx`

