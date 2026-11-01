import { fireEvent, render, screen, within } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { T20SheetLayout } from './T20SheetLayout';
import { createDefaultT20Sheet } from './defaults';
import type { T20Sheet } from './types';

const renderSheet = (readOnly: boolean, sheet: T20Sheet = createDefaultT20Sheet('Kara')) =>
  render(
    <TooltipProvider>
      <T20SheetLayout sheet={sheet} onChange={() => {}} readOnly={readOnly} />
    </TooltipProvider>,
  );

const withDesktop = (fn: () => void) => {
  const real = window.matchMedia;
  window.matchMedia = ((q: string) => ({ ...real(q), matches: true })) as typeof window.matchMedia;
  try { fn(); } finally { window.matchMedia = real; }
};

describe('Ficha Tormenta20 — redesign v2', () => {
  it('celular: as abas mostram as seções principais', () => {
    // Nos testes a tela é a de celular (matchMedia sempre falso).
    renderSheet(false);
    expect(screen.getByText('Atributos')).toBeInTheDocument();
    expect(screen.getByText('Ataques')).toBeInTheDocument();
    expect(screen.getAllByText('Defesa').length).toBeGreaterThan(0);
    expect(screen.getByText('Pontos de mana')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Magias' }));
    expect(screen.getByText('Atributo')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma magia anotada.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Perícias' }));
    expect(screen.getByText('Acrobacia')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Poderes' }));
    expect(screen.getByText('Habilidades de raça e origem')).toBeInTheDocument();
    expect(screen.getByText('Habilidades de classe e poderes')).toBeInTheDocument();
    expect(screen.getByText('Proficiências')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mochila' }));
    expect(screen.getByText('Equipamento')).toBeInTheDocument();
    expect(screen.getByText('0 / 4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Notas' }));
    expect(screen.getByText('Anotações')).toBeInTheDocument();
    expect(screen.getByText('Notas da campanha')).toBeInTheDocument();
  });

  it('perícia somente treinada mostra ND e abre o cálculo no painel', () => {
    renderSheet(false);
    fireEvent.click(screen.getByRole('button', { name: 'Perícias' }));
    const row = screen.getByText('Adestramento').closest('button')!;
    expect(within(row).getByText('ND')).toBeInTheDocument();
    fireEvent.click(row);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Treinada')).toBeInTheDocument();
    expect(within(dialog).getByText('½ nível')).toBeInTheDocument();
  });

  it('na visualização compartilhada oculta seções privadas e botões de edição', () => {
    renderSheet(true);
    expect(screen.queryByRole('button', { name: /Novo ataque/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
    expect(screen.queryByRole('button', { name: 'Mochila' })).not.toBeInTheDocument();
    expect(screen.queryByText('Equipamento')).not.toBeInTheDocument();
    expect(screen.queryByText('Notas da campanha')).not.toBeInTheDocument();
    expect(screen.queryByText('Anotações')).not.toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
  });

  it('computador: listas que crescem ficam fora do grid de colunas (evita espaço vazio na coluna oposta)', () => {
    withDesktop(() => {
      const { container } = renderSheet(false);
      const grid = container.querySelector('[class*="grid-cols-[340px_minmax(0,1fr)]"]')!;
      expect(grid).not.toBeNull();
      expect(grid.textContent).toContain('Perícias');
      expect(grid.textContent).toContain('Proficiências');
      for (const title of ['Habilidades de raça e origem', 'Habilidades de classe e poderes', 'Magias', 'Equipamento']) {
        expect(grid.textContent).not.toContain(title);
      }
    });
  });

  it('computador compartilhado: sem Equipamento, Anotações, Notas e Campos', () => {
    withDesktop(() => {
      renderSheet(true);
      expect(screen.getAllByText('Perícias').length).toBeGreaterThan(0);
      for (const title of ['Equipamento', 'Anotações', 'Notas da campanha', 'Campos personalizáveis']) {
        expect(screen.queryByText(title)).not.toBeInTheDocument();
      }
    });
  });
});
