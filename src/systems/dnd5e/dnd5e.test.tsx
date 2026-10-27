import { fireEvent, render, screen } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { buildDnd5eCard, createDefaultDnd5eSheet } from './defaults';
import { Dnd5eSheetLayout } from './Dnd5eSheetLayout';
import { dnd55System } from '../dnd5_5e/definition';
import type { Dnd5eSheet } from './types';

const renderSheet = (sheet: Dnd5eSheet, readOnly = false) =>
  render(
    <TooltipProvider>
      <Dnd5eSheetLayout sheet={sheet} onChange={() => {}} readOnly={readOnly} />
    </TooltipProvider>,
  );

describe('D&D 5e — dados', () => {
  it('ficha nova é do sistema dnd5e, com as 18 perícias e "Blefar"', () => {
    const sheet = createDefaultDnd5eSheet('Bruenor');
    expect(sheet.system).toBe('dnd5e');
    expect(sheet.skills).toHaveLength(18);
    expect(sheet.skills.map(s => s.name)).toContain('Blefar');
    expect(sheet.skills.map(s => s.name)).not.toContain('Enganação');
  });

  it('não carrega campos exclusivos do 5.5e', () => {
    const sheet = createDefaultDnd5eSheet('Bruenor') as unknown as Record<string, unknown>;
    for (const key of ['species', 'subclass', 'weaponTraining', 'classFeatures', 'feats']) {
      expect(sheet).not.toHaveProperty(key);
    }
  });

  it('card: classe, raça, proficiência e PV', () => {
    const sheet = { ...createDefaultDnd5eSheet('Bruenor'), class: 'Guerreiro', race: 'Anão', level: 5 };
    sheet.hitPoints = { current: 31, max: 44, temp: 0 };
    expect(buildDnd5eCard(sheet)).toEqual({
      details: [{ kind: 'class', text: 'Guerreiro' }, { kind: 'origin', text: 'Anão' }],
      stats: ['Proficiência +3', 'PV 31/44'],
    });
  });
});

describe('D&D 5e — ficha', () => {
  it('reaproveita as seções da família D&D com os rótulos do 5e', () => {
    renderSheet(createDefaultDnd5eSheet('Bruenor'));
    expect(screen.getByText('Atributos')).toBeInTheDocument();
    expect(screen.getByText('Blefar')).toBeInTheDocument();
    expect(screen.getByText('Inspiração')).toBeInTheDocument();
    expect(screen.queryByText('Inspiração Heroica')).not.toBeInTheDocument();
    expect(screen.getByText('Personalidade')).toBeInTheDocument();
    expect(screen.getByText('Ideais')).toBeInTheDocument();
  });

  it('limita itens sintonizados a 3 (regra de 2014), mesmo com proficiência maior', () => {
    renderSheet({ ...createDefaultDnd5eSheet('Bruenor'), level: 17 });
    fireEvent.click(screen.getByText('Inventário'));
    expect(screen.getByText(/Itens Sintonizados \(0\/3\)/)).toBeInTheDocument();
  });

  it('o 5.5e mantém a regra da casa (sintonização = proficiência)', () => {
    const sheet = { ...dnd55System.createDefault('Thorin'), level: 17 };
    render(
      <TooltipProvider>
        <dnd55System.SheetComponent sheet={sheet} onChange={() => {}} />
      </TooltipProvider>,
    );
    fireEvent.click(screen.getByText('Inventário'));
    expect(screen.getByText(/Itens Sintonizados \(0\/6\)/)).toBeInTheDocument();
    expect(screen.getByText('Inspiração Heroica')).toBeInTheDocument();
  });

  it('visualização compartilhada oculta inventário, notas e campos personalizados', () => {
    renderSheet(createDefaultDnd5eSheet('Bruenor'), true);
    expect(screen.queryByText('Inventário')).not.toBeInTheDocument();
    expect(screen.queryByText('Notas da Campanha')).not.toBeInTheDocument();
    expect(screen.queryByText('Campos Personalizáveis')).not.toBeInTheDocument();
    expect(screen.getByText('Perícias')).toBeInTheDocument();
  });

  it('listas que crescem ficam fora do grid de colunas (evita espaço vazio na coluna oposta)', () => {
    const { container } = renderSheet(createDefaultDnd5eSheet('Bruenor'));
    const grid = container.querySelector('[class*="lg:grid-cols-[280px_1fr]"]')!;
    expect(grid).not.toBeNull();
    for (const title of ['Características e Habilidades', 'Inventário', 'Conjuração']) {
      expect(grid.textContent).not.toContain(title);
    }
  });
});
