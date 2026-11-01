import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { isNativeApp } from './platform';

/** Telas sem nada "atrás": o botão voltar do Android sai do app. */
const EXIT_ROUTES = new Set(['/', '/login']);

const OPEN_OVERLAY = [
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"][data-state="open"]',
  '[role="menu"][data-state="open"]',
  '[role="listbox"][data-state="open"]',
  '[data-radix-popper-content-wrapper] [data-state="open"]',
].join(',');

/** Fecha diálogos, gavetas e menus do Radix pelo mesmo caminho da tecla Esc. */
function closeOpenOverlay(): boolean {
  if (!document.querySelector(OPEN_OVERLAY)) return false;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return true;
}

/** Botão voltar do Android: fecha o que estiver aberto antes de mudar de tela. */
export function NativeAppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  useEffect(() => {
    if (!isNativeApp) return;
    const handle = App.addListener('backButton', ({ canGoBack }) => {
      if (closeOpenOverlay()) return;
      if (EXIT_ROUTES.has(pathnameRef.current)) {
        void App.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    });
    return () => {
      void handle.then(h => h.remove());
    };
  }, [navigate]);

  return null;
}
