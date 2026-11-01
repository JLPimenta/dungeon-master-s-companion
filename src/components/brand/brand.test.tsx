import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { loadingFrame } from './loadingGeometry';
import { GrimorioMark } from './GrimorioMark';
import { FullscreenLoader, LOADER_DELAY_MS } from './FullscreenLoader';

describe('loadingFrame', () => {
  it('quadro 0 é a marca parada', () => {
    const f = loadingFrame(0);
    expect(f.bookTransform).toBe('translate(32 58) scale(1.0000) translate(-34.500 -58)');
    expect(f.cover).toBe('24.50,9.00 48.00,9.00 48.00,48.00 24.50,48.00');
    expect(f.pages).toBe('24.50,9.00 48.00,9.00 48.00,55.00 24.50,55.00');
    // losango de 4,25 centrado no engaste (32 − 2,5 de centralização, 28,5)
    expect(f.gemBody).toBe('29.50,24.25 33.75,28.50 33.75,28.50 29.50,32.75 25.25,28.50 25.25,28.50');
    expect(f.gemHalo).toBe(f.gemBody);
    expect(f.socketOpacity).toBe('1');
    expect(f.strapOpacity).toBe('1.000');
    expect(f.faceOpacity).toBe('0.000');
  });

  it('o ciclo termina exatamente onde começou', () => {
    expect(loadingFrame(1)).toEqual(loadingFrame(0));
  });

  it('no meio do ciclo o livro está aberto e o d20 no alto', () => {
    const f = loadingFrame(0.6);
    expect(f.bookTransform).toContain('scale(1.0000)');
    expect(f.strapOpacity).toBe('0.000');
    expect(f.faceOpacity).toBe('1.000');
    expect(f.faceTransform).toBe('translate(32.00 15.00)');
  });

  it('movimento reduzido: livro parado, só o losango pulsa', () => {
    const a = loadingFrame(0.6, { reduced: true, ms: 0 });
    const b = loadingFrame(0.6, { reduced: true, ms: 800 });
    expect(a.cover).toBe(loadingFrame(0).cover);
    expect(a.gemOpacity).toBe('1.000');
    expect(b.gemOpacity).toBe('0.450');
  });
});

describe('GrimorioMark', () => {
  it('decorativa sem título', () => {
    const { container } = render(<GrimorioMark size={30} />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('com título vira imagem acessível', () => {
    render(<GrimorioMark size={30} title="Grimório" />);
    expect(screen.getByRole('img', { name: 'Grimório' })).toBeInTheDocument();
  });

  it('usa a versão simplificada abaixo de 24 px', () => {
    const { container } = render(<GrimorioMark size={16} />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 16 16');
  });

  it('máscaras com ids únicos', () => {
    const { container } = render(<><GrimorioMark /><GrimorioMark /></>);
    const ids = [...container.querySelectorAll('mask')].map(m => m.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('FullscreenLoader', () => {
  afterEach(() => vi.useRealTimers());

  it('só mostra a animação depois do atraso', () => {
    vi.useFakeTimers();
    const { container } = render(<FullscreenLoader label="Abrindo o grimório…" />);
    expect(container.querySelector('svg')).toBeNull();
    act(() => { vi.advanceTimersByTime(LOADER_DELAY_MS); });
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Abrindo o grimório…');
  });
});
