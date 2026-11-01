# App Android (APK)

O app é o mesmo frontend React do site, empacotado com [Capacitor](https://capacitorjs.com). Ele fala com a mesma API e usa a mesma conta, então os dados são os mesmos na web e no celular. Não há banco local nem cópia dos dados no aparelho.

## Como a sessão funciona sem mudar a API

A API só libera CORS para `FRONTEND_URL` e emite cookies `SameSite=Lax` no domínio pai. Com a origem padrão do Capacitor (`https://localhost`), o navegador bloquearia todas as chamadas.

Por isso, `capacitor.config.ts` faz o WebView servir os arquivos locais em `https://www.grimoriodepersonagens.com.br`. Para a API e para o reCAPTCHA, o app é o próprio site:

- Sessão e CSRF funcionam como na web.
- O link de compartilhamento continua correto, pois usa `window.location.origin`.
- Links para outros domínios abrem no navegador do aparelho.

**Se `FRONTEND_URL` mudar na API, mude `hostname` em `capacitor.config.ts` junto.** Caso contrário, o app deixa de conseguir entrar.

## Gerar o APK

O workflow `.github/workflows/android-apk.yml` roda a cada push nesta branch e também pode ser disparado manualmente em **Actions > Android APK > Run workflow** depois que estiver em `master`. O APK fica nos **Artifacts** da execução.

### 1. Variáveis públicas (obrigatórias)

Em **Settings > Secrets and variables > Actions > Variables**, crie com os mesmos valores do site em produção:

| Variável | Conteúdo |
|---|---|
| `VITE_RECAPTCHA_SITE_KEY` | Chave de site do reCAPTCHA |
| `VITE_GOOGLE_CLIENT_ID` | ID do cliente OAuth **Web** |

Sem elas, o workflow para no primeiro passo e diz o que falta. A URL da API está em `.env.android`.

### 2. Chave de assinatura (necessária para o login com Google)

Sem chave, o APK sai assinado com uma chave de debug descartável: serve para testar email e senha, mas cada nova versão exige desinstalar a anterior.

No PowerShell, gere a chave uma única vez e **guarde o arquivo e as senhas fora do repositório**. Sem eles, o app instalado não recebe mais atualizações.

```powershell
keytool -genkeypair -v -keystore grimorio.jks -alias grimorio -keyalg RSA -keysize 2048 -validity 10000
[Convert]::ToBase64String([IO.File]::ReadAllBytes("grimorio.jks")) | Set-Clipboard
```

Em **Settings > Secrets and variables > Actions > Secrets**, crie:

| Secret | Conteúdo |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | O texto copiado pelo segundo comando |
| `ANDROID_KEYSTORE_PASSWORD` | Senha do keystore |
| `ANDROID_KEY_ALIAS` | `grimorio` |
| `ANDROID_KEY_PASSWORD` | Senha da chave |

### 3. Login com Google

O Google não permite o botão web dentro de WebView, então o app usa o seletor de contas nativo do Android. O token continua emitido para o cliente **Web**, e por isso a API não muda.

No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), no mesmo projeto do cliente web, crie uma credencial **ID do cliente OAuth > Android**:

- **Nome do pacote:** `br.com.grimoriodepersonagens.app`
- **SHA-1:** o valor mostrado no resumo da execução do workflow, depois de configurar a chave

## Compilar no computador

Requer Node 22, JDK 21 e Android Studio. Crie `.env.android.local` com as duas variáveis públicas e rode:

```bash
npm ci
npm run android:sync
npx cap open android
```

Depois de qualquer mudança no frontend, rode `npm run android:sync` de novo.

Ícones e abertura são gerados a partir de `assets/` com `npx capacitor-assets generate --android`.

## Comportamento próprio do app

Fica em `src/native/` e não muda nada no navegador:

- **Botão voltar do Android:** fecha painel ou diálogo aberto, depois volta de tela. Na tela inicial e no login, sai do app.
- **Segundo plano:** com o salvamento automático ligado, salva o que estava na fila, pois o Android pode encerrar o app sem aviso. Com ele desligado, a alteração não salva continua dependendo da barra "deseja salvá-las?".
- **Tela cheia:** o botão não aparece, pois o app já ocupa a tela.

## Limitações atuais

- Os links dos emails de confirmação e de redefinição de senha abrem no site. Depois, é só voltar ao app e entrar.
- O app precisa de internet, assim como o site.
- Cada atualização visual exige gerar e instalar um novo APK; o app não acompanha sozinho os deploys do site.

## Conferir em um aparelho

Estes pontos dependem do Android real e devem ser conferidos a cada mudança de configuração nativa:

1. O reCAPTCHA aparece e libera o login.
2. Entrar com email e senha, fechar o app e abrir de novo mantém a sessão.
3. Criar e editar uma ficha no app e ver a alteração no site, e o inverso.
4. Entrar com Google, inclusive em uma conta nova, passando pelos termos de uso.
5. O teclado não cobre o campo em edição, e a barra de abas não fica sob a navegação do sistema.
6. O botão voltar fecha painéis antes de sair da ficha.
7. O link de compartilhamento abre no navegador em outro aparelho.
