import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/** Verdadeiro só dentro do APK; no navegador, todo o código nativo fica inativo. */
export const isNativeApp = Capacitor.isNativePlatform();

/**
 * Avisa quando o app vai para segundo plano. Ali o Android pode encerrar o processo
 * a qualquer momento, sem `beforeunload`. Retorna a função de limpeza do efeito.
 */
export function onAppBackground(callback: () => void): () => void {
  if (!isNativeApp) return () => {};
  const handle = App.addListener('pause', callback);
  return () => {
    void handle.then(h => h.remove());
  };
}
