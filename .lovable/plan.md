

# Plano: Revisao da Documentacao Funcional

## Objetivo

Reescrever o documento `documentacao_funcional.docx` seguindo fielmente a estrutura do exemplo (US05 - Agendamentos), orientando a documentacao ao produto final (com backend NestJS funcional, autenticacao, persistencia real), e descrevendo acoes em tela com notacao `[Botao]`.

## Estrutura por US (replicando o modelo)

Cada US seguira exatamente:

1. **Titulo**: US0X - Nome da Funcionalidade
2. **Historia de Usuario**: "Como jogador, eu quero... para que..."
3. **Premissas**: Lista numerada (ex: usuario logado, ficha existente)
4. **Criterios de Aceite**: Numerados, com:
   - Acoes em tela entre colchetes: `[Criar Nova Ficha]`, `[Salvar]`, `[Excluir]`
   - Campos detalhados com tipo, obrigatoriedade, condicoes
   - Calculos automaticos descritos com formulas
   - Mensagens de confirmacao/erro
   - Listagem (Data Grid) quando aplicavel
5. **Historico de Versoes**: Tabela com data, versao, descricao, autor

## Conteudo por US

### US01 - Tela Inicial
- Historia: acessar dashboard para visualizar, acessar, criar e excluir fichas
- Premissas: usuario logado
- Criterios: grid de cards (Nome, Classe, Nivel, Especie, updatedAt), acoes `[Criar Nova Ficha]`, clique no card navega para ficha, botao `[Excluir]` no card com confirmacao, estado vazio com mensagem, filtro/busca futuro

### US02 - Criar Ficha de Jogador
- Historia: criar nova ficha para iniciar construcao do personagem
- Premissas: usuario logado, na tela inicial
- Criterios: botao `[Criar Nova Ficha]` abre dialog, campo Nome (texto, obrigatorio), botoes `[Cancelar]` e `[Criar]`, redirecionamento para `/character/:id`, valores padrao (nivel 1, atributos 10, PV 10, CA 10, velocidade 30)

### US03 - Cabecalho, Atributos & Pericias
- Campos do cabecalho: Nome (texto, obrigatorio), Classe, Nivel (numerico 1-20), Especie, Subclasse, Antecedente, XP (numerico), Bonus de Proficiencia (somente leitura, calculado)
- 6 atributos: valor (numerico 1-30), modificador calculado `Math.floor((valor - 10) / 2)`, checkbox salvaguarda
- 18 pericias: checkbox proficiencia, checkbox expertise, bonus calculado automaticamente
- Percepcao Passiva: `10 + bonus de Percepcao`

### US04 - Informacoes Gerais
- Campos: CA (numerico), Iniciativa (somente leitura = mod Destreza), Deslocamento (numerico), Tamanho (texto)
- PV: Atual, Maximo, Temporario (numericos)
- Dado de Vida: Total (texto ex: "3d10"), Usados (numerico)
- Salvaguarda contra Morte: 3 checkboxes sucesso, 3 checkboxes falha
- Inspiracao Heroica: checkbox
- Acoes: `[Resetar Salvaguardas]`

### US05 - Armas e Truques de Dano
- Tabela dinamica com colunas: Nome, Bonus Ataque/CD, Dano, Tipo de Dano, Notas
- Acoes: `[Adicionar Arma]`, `[Remover]` por linha

### US06 - Caracteristicas e Tracos
- Caracteristicas de Classe: lista editavel, `[Adicionar]`, `[Remover]`
- Tracos de Especie: texto livre
- Talentos: texto livre
- Treinamento: Armaduras, Armas, Ferramentas (textos livres)

### US07 - Conjuracao
- Atributo de conjuracao (select entre 6 atributos ou nenhum)
- Modificador (somente leitura), CD = `8 + mod + prof`, Bonus de Ataque = `mod + prof`
- Espacos de Magia: 1o ao 9o circulo, Total e Usados
- Lista de Magias ilimitada: Circulo (select), Nome, Tempo Conjuracao, Alcance, Concentracao (checkbox), Ritual (checkbox), Notas/Material
- Acoes: `[Adicionar Magia]`, `[Remover]`

### US08 - Inventario
- Equipamento: tabela com Nome, Quantidade, Peso, Notas. Acoes: `[Adicionar]`, `[Remover]`
- Itens Sintonizados: limite = bonus de proficiencia. Acoes: `[Adicionar]` (desabilitado no limite), `[Remover]`
- Moedas: PC, PP, PE, PO, PL (numericos >= 0)

### US09 - Personalidade e Historia
- Campos: Personalidade e Historia (textarea livre), Alinhamento (texto), Idiomas (texto)

### US10 - Notas da Campanha
- Notas categorizadas: NPCs, Locais, Eventos, Geral
- Cada nota: Categoria (select), Titulo (texto, obrigatorio), Conteudo (textarea)
- Acoes: `[Adicionar Nota]`, `[Remover]`

### US11 - Campos Personalizaveis
- Campos genericos label/valor por secao
- Acoes: `[Adicionar Campo]`, `[Remover]`

## Secoes transversais (ao final do documento)

- **Auto-save**: debounce 500ms, persiste via API REST
- **Compartilhar**: `[Compartilhar]` gera link com dados codificados, copia para clipboard
- **Tela Cheia**: `[Tela Cheia]` via Fullscreen API
- **Exportar PDF**: `[Baixar PDF]` (futuro)

## Implementacao tecnica

Script Node.js com `docx` gerando o .docx com formatacao profissional: headings, tabelas de campos, listas numeradas de criterios, tabela de historico. Salvo em `/mnt/documents/documentacao_funcional_v2.docx`.

