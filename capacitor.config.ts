import type { CapacitorConfig } from '@capacitor/cli';

/**
 * O WebView serve os arquivos locais sob o mesmo domínio do site em produção.
 * A API só libera CORS para FRONTEND_URL e emite cookies SameSite=Lax no domínio
 * pai. Com a mesma origem, sessão, CSRF, reCAPTCHA e links de compartilhamento
 * funcionam como na web, sem nenhuma mudança na API.
 *
 * Se FRONTEND_URL mudar na API, este valor precisa mudar junto.
 */
const hostname = process.env.CAP_SERVER_HOSTNAME ?? 'www.grimoriodepersonagens.com.br';

const config: CapacitorConfig = {
  appId: 'br.com.grimoriodepersonagens.app',
  appName: 'Grimório',
  webDir: 'dist',
  backgroundColor: '#12151B',
  server: {
    androidScheme: 'https',
    hostname,
  },
  android: {
    allowMixedContent: false,
    // A CSP do index.html não libera script inline, então a ponte nativa depende
    // de DOCUMENT_START_SCRIPT, disponível em WebViews modernos.
    minWebViewVersion: 90,
  },
  plugins: {
    // Sem viewport-fit=cover, o WebView fica dentro da área segura e acompanha o
    // teclado, sem exigir mudanças de CSS nas telas do redesign.
    SystemBars: {
      insetsHandling: 'native',
      style: 'DARK',
    },
    SocialLogin: {
      // Só o Google é usado; os demais SDKs ficam de fora do APK.
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
  },
};

export default config;
