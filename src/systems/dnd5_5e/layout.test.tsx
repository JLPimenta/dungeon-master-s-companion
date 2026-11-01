import { describe, it, expect, afterEach } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { dnd55System, type Dnd55Sheet } from './definition';
import { SheetChromeProvider, type SheetChrome } from '../shared/chrome/SheetChromeContext';

/*
 * Ficha 5.5e — redesign v2. Nos testes, o matchMedia padrão (src/test/setup.ts)
 * responde "não" para tudo, ou seja, tela de celular; `setWidth` simula as outras.
 */

const realMatchMedia = window.matchMedia;
afterEach(() => { window.matchMedia = realMatchMedia; });

function setWidth(px: number) {
  window.matchMedia = ((query: string) => {
    const min = Number(/min-width:\s*(\d+)/.exec(query)?.[1] ?? 0);
    return {
      matches: px >= min, media: query, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    } as MediaQueryList;
  }) as typeof window.matchMedia;
}

function silas(): Dnd55Sheet {
  const s = dnd55System.createDefault('Silas Cole');
  return {
    ...s,
    class: 'Bruxo', subclass: 'Grande Antigo', level: 12,
    hitPoints: { current: 89, max: 89, temp: 0 },
    hitDice: { total: '11d8', used: 0 },
    spellcastingAbility: 'charisma',
    abilities: { ...s.abilities, charisma: { value: 22, proficient: true } },
    weapons: [{ id: 'w1', name: 'Rajada Mística', attackBonus: '+10', damage: '1d10+6', damageType: 'Energia', notes: '' }],
  };
}

const chrome: SheetChrome = { readOnly: false, onBack: () => {} };

function Harness({ initial, readOnly = false }: { initial: Dnd55Sheet; readOnly?: boolean }) {
  const [sheet, setSheet] = useState(initial);
  const Layout = dnd55System.SheetComponent;
  return (
    <SheetChromeProvider value={readOnly ? { readOnly: true, onBack: () => {} } : chrome}>
      <Layout sheet={sheet} onChange={p => setSheet(prev => ({ ...prev, ...p }))} readOnly={readOnly} />
      <output data-testid="state">{JSON.stringify({ hp: sheet.hitPoints, hd: sheet.hitDice, weapons: sheet.weapons.map(w => w.name) })}</output>
    </SheetChromeProvider>
  );
}

const state = () => JSON.parse(screen.getByTestId('state').textContent!);

describe('ficha 5.5e no celular', () => {
  it('declara ownsChrome', () => {
    expect(dnd55System.ownsChrome).toBe(true);
  });

  it('cinco abas; Combate mostra vitais, atributos e armas', () => {
    render(<Harness initial={silas()} />);
    const nav = screen.getByRole('navigation', { name: 'Seções da ficha' });
    expect(within(nav).getAllByRole('button').map(b => b.textContent)).toEqual(['Combate', 'Magias', 'Perícias', 'Traços', 'Mais']);
    expect(screen.getByRole('textbox', { name: 'Pontos de vida atuais' })).toHaveValue('89');
    expect(screen.getByText('Atributos')).toBeInTheDocument();
    expect(screen.getByText('Rajada Mística')).toBeInTheDocument();
  });

  it('PV: digitar grava na hora e não passa do máximo', () => {
    render(<Harness initial={silas()} />);
    const hp = screen.getByRole('textbox', { name: 'Pontos de vida atuais' });
    fireEvent.focus(hp);
    fireEvent.change(hp, { target: { value: '77' } });
    expect(state().hp.current).toBe(77);
    fireEvent.change(hp, { target: { value: '120' } });
    expect(state().hp.current).toBe(89);
  });

  it('dados de vida: − gasta e + recupera', () => {
    render(<Harness initial={silas()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Gastar um dado de vida' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gastar um dado de vida' }));
    expect(state().hd.used).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Recuperar um dado de vida' }));
    expect(state().hd.used).toBe(1);
  });

  it('salvaguardas contra morte só com PV 0 ou com marcação', () => {
    const { unmount } = render(<Harness initial={silas()} />);
    expect(screen.queryByText('Salvaguardas contra morte')).toBeNull();
    unmount();
    render(<Harness initial={{ ...silas(), hitPoints: { current: 0, max: 89, temp: 0 } }} />);
    expect(screen.getByText('Salvaguardas contra morte')).toBeInTheDocument();
  });

  it('nova arma entra no topo', () => {
    render(<Harness initial={silas()} />);
    fireEvent.click(screen.getByRole('button', { name: /nova arma/i }));
    expect(state().weapons).toEqual(['', 'Rajada Mística']);
  });

  it('Magias: CD e ataque pelo atributo de conjuração', () => {
    render(<Harness initial={silas()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Magias' }));
    // Carisma 22 (+6) + proficiência 4 (nível 12): CD 18, ataque +10
    // aparece no cartão de conjuração e na faixa compacta de vitais
    expect(screen.getAllByText('18')).toHaveLength(2);
    expect(screen.getAllByText('+10').length).toBeGreaterThan(0);
  });

  it('somente leitura: sem adicionar, Mais só com Perfil, banner visível', () => {
    render(<Harness initial={silas()} readOnly />);
    expect(screen.getByText(/em modo somente leitura/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nova arma/i })).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Pontos de vida atuais' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
    expect(screen.queryByRole('button', { name: 'Mochila' })).toBeNull();
    expect(screen.queryByText('Notas da campanha')).toBeNull();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });
});

describe('ficha 5.5e no tablet e no computador', () => {
  it('tablet: trilho com Sessão e as quatro seções de jogo juntas', () => {
    setWidth(1194);
    render(<Harness initial={silas()} />);
    const rail = screen.getByRole('navigation', { name: 'Seções da ficha' });
    expect(within(rail).getByRole('button', { name: 'Voltar aos personagens' })).toBeInTheDocument();
    expect(within(rail).getAllByRole('button').map(b => b.textContent).filter(Boolean))
      .toEqual(['Sessão', 'Perícias', 'Traços', 'Mochila', 'Diário']);
    expect(screen.getByText('Atributos')).toBeInTheDocument();
    expect(screen.getByText('Armas e truques de dano')).toBeInTheDocument();
    expect(screen.getByText('Magias')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Pontos de vida atuais' })).toBeInTheDocument();
  });

  it('computador: página única com atalhos e todas as seções', () => {
    setWidth(1440);
    render(<Harness initial={silas()} />);
    const links = screen.getByRole('navigation', { name: 'Ir para seção' });
    expect(within(links).getAllByRole('link').map(a => a.textContent))
      .toEqual(['Ficha', 'Atributos', 'Armas', 'Magias', 'Inventário', 'Traços', 'História', 'Notas', 'Campos']);
    for (const title of ['Conjuração', 'Inventário', 'Características e traços', 'Notas da campanha', 'Campos personalizáveis']) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }
  });

  it('computador somente leitura: sem inventário, notas e campos', () => {
    setWidth(1440);
    render(<Harness initial={silas()} readOnly />);
    expect(screen.queryByText('Notas da campanha')).toBeNull();
    expect(screen.queryByText('Campos personalizáveis')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Inventário' })).toBeNull();
  });
});
