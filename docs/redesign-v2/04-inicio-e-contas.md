# 04 · Início e telas de conta

Estas telas já funcionam bem na v1. O redesign é uma **reforma visual**: mesmos campos, mesmos fluxos, mesmos textos, mesmas validações e mesmas integrações (reCAPTCHA, Google, cookies/CSRF). Mude apenas o que está listado como mudança. Mockups: `mockups/Home.dc.html`, `mockups/Auth.dc.html`, `mockups/Profile.dc.html` (cada um com tema escuro e claro; o tema vem da preferência do usuário, como hoje).

Regra geral: **não reescreva a lógica** de `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `ConfirmEmail.tsx`, `Profile.tsx`, `AuthContext` e serviços. Troque o JSX e as classes; mantenha handlers, estados e chamadas.

## Visual comum

- Fundo `--background`; cartão central `--card` com borda `--border`, raio 12 px, largura máxima 440 px nas telas de conta.
- Marca no topo das telas de conta: `GrimorioMark` 64 px + "Grimório" (Cinzel 700, 26 px, `letter-spacing: 0.08em`, `--primary-text`). Ver [05-marca.md](05-marca.md).
- Títulos de cartão em Cinzel; subtítulo em `--muted-foreground`.
- Campos com 44–48 px de altura e texto de 16 px (evita o zoom automático do iOS).
- Rodapé das telas de conta: "Grimório © 2026 · Termos de Uso".

## Início (`src/pages/Index.tsx`, `AppHeader`, `CharacterCard`, `CreateCharacterDialog`, `DeleteCharacterDialog`, `AppFooter`)

**Cabeçalho (`AppHeader`):** `GrimorioMark` 30 px + "Grimório" (substitui o ícone `Scroll`); à direita, botão do usuário (círculo dourado com as iniciais, nome, seta) que abre o menu da v1: email (desabilitado), "Meu Perfil", "Sair" (abre o `LogoutDialog` da v1: "Sair da conta?" / "Você será redirecionado para a página de login." / Cancelar · Sair).

**Título:** "Suas fichas". Subtítulo (mudança de texto, a frase da v1 dizia que outros sistemas viriam "em breve", mas eles já existem): "Gerenciador de Fichas — D&D 5.5e, D&D 5e e Tormenta20. Em breve: Ferramentas de Campanha e muito mais!" — monte a lista de sistemas a partir de `AVAILABLE_SYSTEMS` (`shortLabel`), não fixe no texto.

**Botão "Criar nova ficha":** só aparece quando já existe ficha (no estado vazio o botão é o do próprio estado vazio).

**Estados:**
- Carregando: cartões-esqueleto (`animate-pulse`), como na v1. **Não** usar a animação da marca aqui.
- Vazio: "Nenhuma ficha criada ainda." + botão "Criar sua primeira ficha".
- Com fichas: grade 1 coluna (celular) → 2 (≥ 640 px) → 3 (≥ 1024 px).

**Cartão da ficha (`CharacterCard`):**
- Selo do sistema (`shortLabel`) no topo.
- Nome (Cinzel).
- Linhas de `card.details` com ícone por `kind` (classe / origem), como na v1.
- "Nível n" e as `card.stats`.
- **Novo:** selo "Pública" com ícone de globo quando `isShared`.
- **Mudança:** o botão de excluir (lixeira) fica **sempre visível**, discreto, no canto. Na v1 ele só aparece com o mouse em cima, o que não existe no toque. Continua abrindo o `DeleteCharacterDialog` ("Excluir Ficha" / "Tem certeza que deseja excluir {nome}? Essa ação não pode ser desfeita." / Cancelar · Excluir).
- O cartão inteiro abre a ficha; o botão de excluir não propaga o clique.

**Criar Nova Ficha (`CreateCharacterDialog`):** título "Criar Nova Ficha", descrição "Dê um nome ao seu personagem e escolha o sistema de jogo.", campo "Nome do Personagem" (placeholder "Ex: Thorin Escudo de Carvalho"), grupo "Sistema" em cartões de opção (rádio) com `label` e `description` de cada sistema, "Cancelar" e "Criar". "Criar" fica desabilitado sem nome. Manter a regra da v1 de esconder a escolha quando só há um sistema.

**Rodapé (`AppFooter`):** marca 16 px + "Grimório © 2026", "Termos de Uso", "Contato" (links da v1).

## Entrar (`Login.tsx`, `AuthLayout`)

Título "Entrar", subtítulo "Acesse sua conta para gerenciar suas fichas". Email; Senha com o link "Esqueceu sua senha?" na mesma linha do rótulo; reCAPTCHA (componente real da v1); "Entrar" (desabilitado até o reCAPTCHA, como na v1); divisor "ou"; botão do Google (`GoogleSignInButton` da v1, sem alterar o componente oficial); "Não tem uma conta? Criar conta".

**Novo:** botão de mostrar/ocultar senha (ícone de olho, `aria-label` "Mostrar senha" / "Ocultar senha") dentro do campo.

**Google, primeiro acesso** (diálogo da v1): "Complete seu cadastro" / "Vimos que você ainda não tem uma conta. Para continuar com o Google, você precisa aceitar nossos Termos de Uso." / caixa "Li e aceito os Termos de Uso" / Cancelar · "Confirmar e Entrar" (desabilitado sem aceite).

## Criar conta (`Register.tsx`)

Título "Criar Conta", subtítulo "Crie sua conta para salvar suas fichas". Nome, Email, Senha com o `PasswordStrengthIndicator` da v1 (4 barras; "Força: Muito fraca / Fraca / Média / Forte"; regras com ✓/×: "Mínimo 8 caracteres", "Letra maiúscula", "Letra minúscula", "Número"), Confirmar Senha, reCAPTCHA, "Li e aceito os Termos de Uso", "Criar Conta" (desabilitado até tudo valer), "ou", "Registrar com Google" (desabilitado sem aceitar os termos), "Já tem uma conta? Entrar".

**Novo:** mostrar/ocultar senha e o aviso "As senhas não coincidem." aparecendo enquanto digita a confirmação (na v1 só aparece ao enviar). A validação no envio continua.

## Senha e confirmação de email

| Tela | Título · subtítulo | Conteúdo |
|---|---|---|
| Esqueceu a senha (`ForgotPassword.tsx`) | "Esqueceu sua Senha?" · "Informe seu email para recuperar o acesso" | Email, "Enviar Link de Recuperação", "Voltar para Login" |
| Email enviado | "Email Enviado" · "Verifique sua caixa de entrada" | "Se o email {email} estiver cadastrado, você receberá um link para redefinir sua senha." · "Voltar para Login" |
| Redefinir (`ResetPassword.tsx`) | "Redefinir Senha" · "Crie uma nova senha para sua conta" | Nova Senha (com indicador de força), Confirmar Nova Senha, "Redefinir Senha", "Voltar para Login" |
| Link inválido | "Link Inválido" | "O link de redefinição de senha é inválido ou expirou." · "Solicitar novo link" |
| Verifique seu email (`ConfirmEmail.tsx`, após cadastro) | "Verifique seu Email" · "Quase lá!" | "Enviamos um link de confirmação para {email}. Verifique sua caixa de entrada e clique no link para ativar sua conta." · "Não encontrou? Verifique a pasta de spam ou lixo eletrônico." · "Reenviar email de confirmação" (vira "Reenviar em {n}s" por 60 s após o envio) · "Voltar para Login" |
| Email confirmado | "Email Confirmado!" | "Seu email foi confirmado com sucesso. Agora você pode acessar sua conta." · "Ir para Login" |
| Erro na confirmação | "Erro na Confirmação" | "Não foi possível confirmar seu email. O link pode ter expirado." · "Voltar para Login" |

Ícone grande no topo de cada estado de resultado (envelope, alerta, sucesso), como na v1. Se algum texto acima divergir do código da v1, **vale o código**.

## Meu Perfil (`Profile.tsx`)

Link "← Voltar" para o início; título "Meu Perfil"; três cartões e duas ações:

1. **Informações pessoais**: Nome; Email desabilitado com a nota "O email não pode ser alterado."; "Salvar Alterações".
2. **Alterar senha**: Senha Atual; Nova Senha (com indicador de força); Confirmar Nova Senha (aviso de diferença ao digitar); "Alterar Senha".
3. **Configurações**:
   - **Salvamento Automático** (interruptor, `preferences.autoSave`) com a descrição da v1, "Salva automaticamente as alterações da ficha de personagem no servidor.", **acrescida** de "Desligado, a ficha pergunta “deseja salvá-las?” a cada alteração." (explica a barra da ficha).
   - **Tema Visual**: três opções em segmento — Claro, Escuro, Sistema (`preferences.theme`, aplicado na hora via `next-themes`, como na v1), com a nota "Claro usa o pergaminho; Escuro, o couro e ferro. Sistema segue o aparelho."
4. **Sair da Conta** (abre o `LogoutDialog`).
5. **Excluir Minha Conta** (destrutivo; diálogo da v1: "Tem certeza?" / "Esta ação é irreversível. Todos os seus dados, incluindo fichas de personagem, serão permanentemente excluídos." / Cancelar · "Sim, excluir minha conta").

Avisos de sucesso/erro com o `toast` da v1.
