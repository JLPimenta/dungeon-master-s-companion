import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableList } from './ExpandableList';
import { NumberField } from './NumberField';
import { Stepper } from './Stepper';
import { EditingProvider, ViewEditBlock } from './ViewEditBlock';
import { SheetChromeProvider, type SheetChrome } from '../chrome/SheetChromeContext';
import { UnsavedChangesFloat } from '../chrome/UnsavedChangesFloat';
import { SheetTopBar } from '../chrome/SheetTopBar';

type Item = { id: string; name: string };

function ListHarness({ initial = [] as Item[], readOnly = false }) {
  const [items, setItems] = useState<Item[]>(initial);
  let n = 0;
  return (
    <>
      <ExpandableList<Item>
        items={items}
        onChange={setItems}
        createItem={() => ({ id: `novo-${++n}-${items.length}`, name: '' })}
        addLabel="Nova arma"
        readOnly={readOnly}
        renderSummary={it => <span>{it.name || 'Nova arma'}</span>}
        renderForm={(it, update) => (
          <input aria-label={`Nome ${it.id}`} value={it.name} onChange={e => update({ name: e.target.value })} />
        )}
      />
      <output data-testid="names">{items.map(i => i.name || '∅').join('|')}</output>
      <button type="button">fora</button>
    </>
  );
}

describe('ExpandableList', () => {
  const two = [{ id: 'a', name: 'Rapieira' }, { id: 'b', name: 'Arco' }];

  it('adiciona no topo, já aberto e com foco no primeiro campo', () => {
    render(<ListHarness initial={two} />);
    fireEvent.click(screen.getByRole('button', { name: /nova arma/i }));
    expect(screen.getByTestId('names').textContent).toBe('∅|Rapieira|Arco');
    const input = screen.getByRole('textbox', { name: /^Nome novo/ });
    expect(document.activeElement).toBe(input);
  });

  it('só um item aberto por vez', () => {
    render(<ListHarness initial={two} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rapieira' }));
    expect(screen.getByRole('textbox', { name: 'Nome a' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Arco' }));
    expect(screen.queryByRole('textbox', { name: 'Nome a' })).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Nome b' })).toBeInTheDocument();
  });

  it('exclui em dois toques', () => {
    render(<ListHarness initial={two} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rapieira' }));
    fireEvent.click(screen.getByRole('button', { name: /remover/i }));
    expect(screen.getByTestId('names').textContent).toBe('Rapieira|Arco');
    fireEvent.click(screen.getByRole('button', { name: /confirmar exclusão/i }));
    expect(screen.getByTestId('names').textContent).toBe('Arco');
  });

  it('tocar fora cancela a confirmação', () => {
    render(<ListHarness initial={two} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rapieira' }));
    fireEvent.click(screen.getByRole('button', { name: /remover/i }));
    fireEvent.mouseDown(screen.getByRole('button', { name: 'fora' }));
    expect(screen.getByRole('button', { name: /remover/i })).toBeInTheDocument();
  });

  it('somente leitura: sem adicionar, sem remover, campos desabilitados', () => {
    render(<ListHarness initial={two} readOnly />);
    expect(screen.queryByRole('button', { name: /nova arma/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Rapieira' }));
    expect(screen.getByRole('textbox', { name: 'Nome a' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /remover/i })).toBeNull();
  });
});

describe('NumberField', () => {
  function Harness({ max, allowNegative }: { max?: number; allowNegative?: boolean }) {
    const [v, setV] = useState(89);
    return (
      <>
        <NumberField aria-label="PV" value={v} onChange={setV} min={allowNegative ? undefined : 0} max={max} allowNegative={allowNegative} />
        <output data-testid="v">{v}</output>
      </>
    );
  }

  it('grava a cada tecla válida e limita ao máximo', () => {
    render(<Harness max={89} />);
    const input = screen.getByRole('textbox', { name: 'PV' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '7' } });
    expect(screen.getByTestId('v').textContent).toBe('7');
    fireEvent.change(input, { target: { value: '95' } });
    expect(screen.getByTestId('v').textContent).toBe('89');
  });

  it('ignora letras e não grava campo vazio', () => {
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: 'PV' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '7a' } });
    expect(screen.getByTestId('v').textContent).toBe('89');
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByTestId('v').textContent).toBe('89');
    fireEvent.blur(input);
    expect(input).toHaveValue('89');
  });

  it('aceita negativo quando permitido', () => {
    render(<Harness allowNegative />);
    const input = screen.getByRole('textbox', { name: 'PV' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '-2' } });
    expect(screen.getByTestId('v').textContent).toBe('-2');
  });
});

describe('Stepper', () => {
  it('− e + respeitam os limites', () => {
    const onChange = vi.fn();
    render(<Stepper value={1} onChange={onChange} min={1} max={30} label="valor" />);
    expect(screen.getByRole('button', { name: 'Diminuir valor' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar valor' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

describe('ViewEditBlock', () => {
  it('um bloco em edição por vez', () => {
    render(
      <EditingProvider>
        <ViewEditBlock id="a" title="Talentos" view={<p>ler A</p>} edit={<p>editar A</p>} />
        <ViewEditBlock id="b" title="Traços" view={<p>ler B</p>} edit={<p>editar B</p>} />
      </EditingProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Editar talentos' }));
    expect(screen.getByText('editar A')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar traços' }));
    expect(screen.getByText('ler A')).toBeInTheDocument();
    expect(screen.getByText('editar B')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.getByText('ler B')).toBeInTheDocument();
  });
});

describe('barra superior e barra de salvar', () => {
  const base = (over: Partial<NonNullable<SheetChrome['save']>> = {}): SheetChrome => ({
    readOnly: false,
    onBack: vi.fn(),
    save: {
      status: 'idle', hasUnsavedChanges: true, autoSaveEnabled: false, showUnsavedBar: true,
      isSaving: false, onSave: vi.fn(), onDiscard: vi.fn(), ...over,
    },
    share: { isShared: true, link: 'https://x/character/shared/1', onToggle: vi.fn(), onCopyLink: vi.fn() },
  });

  it('barra de salvar segue showUnsavedBar (regra da v1)', () => {
    const { rerender } = render(<SheetChromeProvider value={base()}><UnsavedChangesFloat /></SheetChromeProvider>);
    expect(screen.getByText('Alterações foram realizadas, deseja salvá-las?')).toBeInTheDocument();
    rerender(<SheetChromeProvider value={base({ showUnsavedBar: false, autoSaveEnabled: true })}><UnsavedChangesFloat /></SheetChromeProvider>);
    expect(screen.queryByText('Alterações foram realizadas, deseja salvá-las?')).toBeNull();
  });

  it('compartilhar discreto anuncia o estado; somente leitura mostra o selo', () => {
    const { rerender } = render(<SheetChromeProvider value={base()}><SheetTopBar title="Silas Cole" /></SheetChromeProvider>);
    expect(screen.getByRole('button', { name: 'Compartilhar ficha (pública)' })).toBeInTheDocument();
    expect(screen.getByText('Não salvo')).toBeInTheDocument();
    rerender(<SheetChromeProvider value={{ readOnly: true, onBack: vi.fn() }}><SheetTopBar title="Silas Cole" /></SheetChromeProvider>);
    expect(screen.queryByRole('button', { name: /compartilhar/i })).toBeNull();
    expect(screen.getByText('Somente leitura')).toBeInTheDocument();
  });
});
