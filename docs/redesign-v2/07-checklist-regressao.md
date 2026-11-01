# 07 · Checklist de regressão (paridade com a v1)

Para cada item: dá para **ver** e **editar** (ou executar) no celular, no tablet e no computador, e o valor **salva e volta** depois de recarregar a página. Itens marcados com (RO) também precisam aparecer, sem edição, na ficha compartilhada.

## Ficha 5.5e — campos de `CharacterSheet`

Identidade
- [ ] `name` (RO) · máx. 255
- [ ] `class` (RO) · máx. 100
- [ ] `subclass` (RO)
- [ ] `level` (RO) · muda a proficiência e tudo que depende dela
- [ ] `xp` (RO)
- [ ] `species` (RO)
- [ ] `background` (RO)
- [ ] `alignment` (RO)
- [ ] `languages` (RO) · máx. 500
- [ ] `personalityAndHistory` (RO) · máx. 10 000

Atributos e perícias
- [ ] `abilities.*.value` (RO) · 1 a 30, digitável e com − / +
- [ ] `abilities.*.proficient` (salvaguarda) (RO)
- [ ] `skills[].proficient` e `skills[].expertise` (RO) · três estados: nenhum, proficiente, especialista
- [ ] Percepção passiva (RO)

Combate
- [ ] `armorClass` (RO)
- [ ] `hitPoints.current` (RO) · toque edita; limitado ao máximo; barra responde
- [ ] `hitPoints.max` (RO)
- [ ] `hitPoints.temp` (RO) · azul na barra
- [ ] `hitDice.total` (RO) · texto livre ("11d8")
- [ ] `hitDice.used` (RO) · − gasta, + recupera
- [ ] `deathSaves.successes` / `failures` (RO) · aparecem com PV 0 ou com qualquer marcação
- [ ] `speed` (RO)
- [ ] `size` (RO)
- [ ] `heroicInspiration` (RO)
- [ ] Iniciativa calculada (RO)

Bônus adicionais (`bonuses`)
- [ ] `proficiencyBonus` · digitável, aceita negativo
- [ ] `initiative` · digitável, aceita negativo
- [ ] `savingThrows[atributo]` · digitável, aceita negativo
- [ ] `skills[nome]` · digitável, aceita negativo
- [ ] Marca "inclui bônus adicional" em cada valor afetado

Armas (`weapons`)
- [ ] Listar (RO) · contagem no título
- [ ] Adicionar no topo, já aberta
- [ ] Editar `name`, `attackBonus`, `damage`, `damageType`, `notes`
- [ ] Excluir com dois toques

Conjuração
- [ ] `spellcastingAbility` (RO) · inclui "Nenhum"
- [ ] CD e ataque de magia (RO)
- [ ] `spellSlots[1..9].total` e `.used` (RO) · gastar/recuperar tocando; editar no painel
- [ ] `spells[]`: listar (RO), filtrar por círculo, agrupar por círculo
- [ ] Adicionar magia no topo; editar `level`, `name`, `castingTime`, `range`, `notes`, `concentration`, `ritual`; excluir com dois toques
- [ ] `materialRequired` preservado ao salvar (sem campo, como na v1)

Traços
- [ ] `classFeatures[]` (RO) · adicionar no topo, editar (máx. 1 500), excluir
- [ ] `speciesTraits` (RO) · máx. 5 000
- [ ] `feats` (RO) · máx. 5 000
- [ ] `armorTraining`, `weaponTraining`, `toolTraining` (RO)

Inventário (oculto no RO)
- [ ] `coins.cp`, `sp`, `ep`, `gp`, `pp`
- [ ] `attunedItems[]`: adicionar no topo, editar `name` e `description`, excluir; limite = proficiência; botão bloqueado no limite
- [ ] `inventory[]`: adicionar no topo, editar `name`, `quantity`, `weight`, `notes`, excluir; peso total

Notas da campanha (ocultas no RO)
- [ ] `campaignNotes[]`: adicionar no topo, editar `category`, `title`, `content` (máx. 5 000), excluir; filtro por categoria

Campos personalizados (ocultos no RO)
- [ ] `customFields[]`: adicionar no topo (`section: 'geral'`), editar `label` e `value`, excluir

Compartilhamento
- [ ] `isShared` · interruptor salva na hora; toasts da v1
- [ ] Copiar link · toast "Link copiado para a área de transferência!"
- [ ] Ponto dourado no botão quando pública

## Ficha — comportamento da página

- [ ] Salvamento automático ligado: salva 10 s depois da última alteração e ao sair de um campo; status "Salvando…" → "Salvo!"
- [ ] Salvamento automático desligado: barra "Alterações foram realizadas, deseja salvá-las?" com Descartar (volta ao último salvo) e Salvar Alterações
- [ ] Aviso ao fechar a aba com alteração pendente
- [ ] Erro ao salvar: toast da v1; erros de texto longo mantêm a edição, outros revertem
- [ ] Tela cheia em todos os tamanhos onde o navegador suporta
- [ ] Voltar para o início
- [ ] Ficha de sistema desconhecido mostra a mensagem da v1
- [ ] Ficha inexistente mostra "Ficha não encontrada." + Voltar
- [ ] Ficha compartilhada: banner, selo, seções ocultas, nada editável
- [ ] Fichas 5e (2014) e Tormenta20 abrem, editam e salvam como antes

## Início e contas

- [ ] Lista de fichas com selo do sistema, detalhes, nível, estatísticas, "Pública"
- [ ] Criar ficha (nome obrigatório, escolha de sistema; escolha escondida com um só sistema)
- [ ] Excluir ficha com confirmação
- [ ] Estado vazio e cartões-esqueleto
- [ ] Menu do usuário: Meu Perfil, Sair com confirmação
- [ ] Entrar (email, senha, reCAPTCHA, Google, primeiro acesso com aceite dos termos)
- [ ] Criar conta (força da senha, confirmação, reCAPTCHA, termos, Google)
- [ ] Esqueceu a senha → email enviado
- [ ] Redefinir senha (link válido e inválido)
- [ ] Confirmação de email (verifique, reenviar com espera de 60 s, confirmado, erro)
- [ ] Meu Perfil: nome, email bloqueado, trocar senha, salvamento automático, tema Claro/Escuro/Sistema aplicado na hora, sair, excluir conta
- [ ] Termos de Uso e 404 continuam acessíveis
