import { render, screen } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { T20SheetLayout } from './T20SheetLayout';
import { createDefaultT20Sheet } from './defaults';

const renderSheet = (readOnly: boolean) =>
  render(
    <TooltipProvider>
      <T20SheetLayout sheet={createDefaultT20Sheet('Kara')} onChange={() => {}} readOnly={readOnly} />
    </TooltipProvider>,
  );

describe('Ficha Tormenta20', () => {
  it('renderiza as seções principais', () => {
    renderSheet(false);
    for (const title of ['Atributos', 'Perícias', 'Combate', 'Ataques', 'Magias', 'Equipamento', 'Notas da Campanha']) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    expect(screen.getAllByText('Defesa').length).toBeGreaterThan(0);
  });

  it('na visualização compartilhada oculta seções privadas e botões de edição', () => {
    renderSheet(true);
    expect(screen.queryByText('Equipamento')).not.toBeInTheDocument();
    expect(screen.queryByText('Notas da Campanha')).not.toBeInTheDocument();
    expect(screen.queryByText('Anotações')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Adicionar/ })).not.toBeInTheDocument();
    expect(screen.getByText('Perícias')).toBeInTheDocument();
  });

  it('listas que crescem ficam fora do grid de colunas (evita espaço vazio na coluna oposta)', () => {
    const { container } = renderSheet(false);
    const grid = container.querySelector('[class*="lg:grid-cols-[340px_1fr]"]')!;
    expect(grid).not.toBeNull();
    for (const title of ['Habilidades de Raça e Origem', 'Habilidades de Classe e Poderes', 'Magias', 'Equipamento']) {
      expect(grid.textContent).not.toContain(title);
    }
  });
});
