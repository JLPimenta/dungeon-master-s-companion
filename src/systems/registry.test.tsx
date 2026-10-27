import { render, screen } from '@testing-library/react';
import { AVAILABLE_SYSTEMS, findSystem, resolveSystem } from './registry';
import { dnd55System } from './dnd5_5e/definition';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import type { SheetListItem, SystemId } from './types';

describe('registry de sistemas', () => {
  it('registra os três sistemas', () => {
    expect(AVAILABLE_SYSTEMS.map(s => s.id)).toEqual(['dnd5_5e', 'tormenta20', 'dnd5e']);
  });

  it('trata ficha sem `system` como 5.5e (fichas anteriores à migração)', () => {
    expect(resolveSystem({}).id).toBe('dnd5_5e');
  });

  it('não quebra com sistema desconhecido: findSystem devolve undefined', () => {
    expect(findSystem('inexistente' as SystemId)).toBeUndefined();
    expect(() => resolveSystem('inexistente' as SystemId)).toThrow(/não suportado/);
  });
});

describe('dnd5_5e', () => {
  it('createDefault marca o sistema e mantém os defaults existentes', () => {
    const sheet = dnd55System.createDefault('Thorin');
    expect(sheet).toMatchObject({ system: 'dnd5_5e', name: 'Thorin', level: 1, armorClass: 10 });
    expect(sheet.skills).toHaveLength(18);
  });

  // Mesmos valores esperados do teste do backend (character.service.spec.ts):
  // os dois buildCard precisam produzir o mesmo card.
  it('buildCard gera o mesmo card que o backend', () => {
    const sheet = { ...dnd55System.createDefault('Thorin'), class: 'Guerreiro', subclass: 'Campeão', species: 'Anão', level: 5 };
    sheet.hitPoints = { current: 31, max: 44, temp: 0 };
    expect(dnd55System.buildCard(sheet)).toEqual({
      details: [
        { kind: 'class', text: 'Guerreiro — Campeão' },
        { kind: 'origin', text: 'Anão' },
      ],
      stats: ['Proficiência +3', 'PV 31/44'],
    });
  });
});

describe('CharacterCard', () => {
  const base = { id: '1', name: 'Thorin', level: 5, createdAt: '', updatedAt: '' };

  it('usa o card vindo da API', () => {
    const item: SheetListItem = {
      ...base, system: 'dnd5_5e',
      card: { details: [{ kind: 'class', text: 'Guerreiro' }], stats: ['PV 31/44'] },
    };
    render(<CharacterCard character={item} onClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Guerreiro')).toBeInTheDocument();
    expect(screen.getByText('PV 31/44')).toBeInTheDocument();
    expect(screen.getByText('Nível 5')).toBeInTheDocument();
  });

  it('calcula o card no cliente quando o item não traz `card` (localStorage / API antiga)', () => {
    const item: SheetListItem = {
      ...base, class: 'Mago', species: 'Elfo', hitPoints: { current: 7, max: 9, temp: 0 },
    };
    render(<CharacterCard character={item} onClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Mago')).toBeInTheDocument();
    expect(screen.getByText('Elfo')).toBeInTheDocument();
    expect(screen.getByText('PV 7/9')).toBeInTheDocument();
  });

  it('sinaliza ficha de sistema não suportado sem quebrar', () => {
    const item: SheetListItem = { ...base, system: 'pathfinder' as SystemId, card: { details: [], stats: [] } };
    render(<CharacterCard character={item} onClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Sistema não suportado')).toBeInTheDocument();
  });

  it('mostra o sistema da ficha quando há mais de um registrado', () => {
    const item: SheetListItem = { ...base, system: 'tormenta20', card: { details: [], stats: ['PM 3/6'] } };
    render(<CharacterCard character={item} onClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Tormenta20')).toBeInTheDocument();
    expect(screen.getByText('PM 3/6')).toBeInTheDocument();
  });
});
