import { act, render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NativeAppShell } from './NativeAppShell';

type BackHandler = (event: { canGoBack: boolean }) => void;

const app = vi.hoisted(() => ({
  handler: null as null | ((event: { canGoBack: boolean }) => void),
  exitApp: vi.fn(),
}));

vi.mock('./platform', () => ({ isNativeApp: true }));
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: (_: string, handler: BackHandler) => {
      app.handler = handler;
      return Promise.resolve({ remove: vi.fn() });
    },
    exitApp: app.exitApp,
  },
}));

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

function setup(entries: string[]) {
  const view = render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <NativeAppShell />
      <CurrentPath />
    </MemoryRouter>,
  );
  return () => view.container.querySelector('output')?.textContent;
}

describe('botão voltar do Android', () => {
  beforeEach(() => {
    app.exitApp.mockClear();
    document.body.innerHTML = '';
  });

  it('sai do app na tela inicial', () => {
    setup(['/']);
    act(() => app.handler?.({ canGoBack: false }));
    expect(app.exitApp).toHaveBeenCalledOnce();
  });

  it('volta para a tela anterior a partir da ficha', () => {
    const path = setup(['/', '/character/1']);
    act(() => app.handler?.({ canGoBack: true }));
    expect(path()).toBe('/');
    expect(app.exitApp).not.toHaveBeenCalled();
  });

  it('vai para o início quando não há histórico', () => {
    const path = setup(['/character/1']);
    act(() => app.handler?.({ canGoBack: false }));
    expect(path()).toBe('/');
  });

  it('fecha o painel aberto antes de mudar de tela', () => {
    const path = setup(['/', '/character/1']);
    const panel = document.createElement('div');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('data-state', 'open');
    document.body.appendChild(panel);
    const onEscape = vi.fn();
    document.addEventListener('keydown', onEscape, { once: true });

    act(() => app.handler?.({ canGoBack: true }));

    expect(onEscape.mock.calls[0][0].key).toBe('Escape');
    expect(path()).toBe('/character/1');
  });
});
