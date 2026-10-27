import { createDefaultT20Sheet, buildT20Card } from './defaults';
import { T20_SKILLS } from './skills';
import {
  armorPenaltyTotal, carryCapacity, currentLoad, defenseTotal, halfLevel, liftCapacity,
  sizeInfo, skillTotal, spellDC, trainingBonus,
} from './rules';
import type { T20Sheet } from './types';

const skill = (key: string) => T20_SKILLS.find(s => s.key === key)!;

function sheet(patch: Partial<T20Sheet> = {}): T20Sheet {
  return { ...createDefaultT20Sheet('Teste'), ...patch };
}

describe('Tormenta20 — regras', () => {
  it('½ nível arredonda para baixo', () => {
    expect([1, 2, 3, 10, 19, 20].map(halfLevel)).toEqual([0, 1, 1, 5, 9, 10]);
  });

  it('bônus de treino por faixa de nível', () => {
    expect([1, 6, 7, 14, 15, 20].map(trainingBonus)).toEqual([2, 2, 4, 4, 6, 6]);
  });

  it('perícia comum: ½ nível + treino + atributo + outros', () => {
    const s = sheet({
      level: 8,
      attributes: { for: 3, des: 2, con: 1, int: 0, sab: 1, car: -1 },
      skills: { luta: { trained: true, attribute: 'for', other: 1 } },
    });
    // 4 (½ de 8) + 4 (treino 7–14) + 3 (FOR) + 1 (outros)
    expect(skillTotal(s, skill('luta'))).toBe(12);
    // não treinada: só ½ nível + atributo
    expect(skillTotal(s, skill('atletismo'))).toBe(7);
  });

  it('perícia somente treinada sem treino é ND (null)', () => {
    const s = sheet();
    expect(skillTotal(s, skill('misticismo'))).toBeNull();
    expect(skillTotal({ ...s, skills: { misticismo: { trained: true, attribute: 'int', other: 0 } } }, skill('misticismo'))).toBe(2);
  });

  it('penalidade de armadura só nas perícias marcadas', () => {
    const s = sheet({
      armor: { name: 'Brunea', bonus: 5, penalty: 2 },
      shield: { name: 'Escudo pesado', bonus: 2, penalty: 2 },
    });
    expect(armorPenaltyTotal(s)).toBe(4);
    expect(skillTotal(s, skill('acrobacia'))).toBe(-4);
    expect(skillTotal(s, skill('furtividade'))).toBe(-4);
    expect(skillTotal(s, skill('atletismo'))).toBe(0);
  });

  it('a perícia pode usar outro atributo (poderes que trocam o atributo)', () => {
    const s = sheet({
      attributes: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 4 },
      skills: { luta: { trained: false, attribute: 'car', other: 0 } },
    });
    expect(skillTotal(s, skill('luta'))).toBe(4);
  });

  it('Defesa: 10 + atributo + armadura + escudo + outros', () => {
    const s = sheet({
      attributes: { for: 0, des: 3, con: 0, int: 0, sab: 0, car: 0 },
      armor: { name: 'Couro batido', bonus: 3, penalty: 1 },
      shield: { name: 'Escudo leve', bonus: 1, penalty: 1 },
      defense: { attribute: 'des', other: 1, heavyArmor: false, attributeLimit: 0 },
    });
    expect(defenseTotal(s)).toBe(18);
  });

  it('Defesa com armadura pesada limita o atributo', () => {
    const base = {
      attributes: { for: 0, des: 3, con: 0, int: 0, sab: 0, car: 0 },
      armor: { name: 'Armadura completa', bonus: 10, penalty: 5 },
    };
    expect(defenseTotal(sheet({ ...base, defense: { attribute: 'des', other: 0, heavyArmor: true, attributeLimit: 0 } }))).toBe(20);
    expect(defenseTotal(sheet({ ...base, defense: { attribute: 'des', other: 0, heavyArmor: true, attributeLimit: 1 } }))).toBe(21);
    // atributo negativo não reduz a Defesa com armadura pesada
    expect(defenseTotal(sheet({ ...base, attributes: { ...base.attributes, des: -2 }, defense: { attribute: 'des', other: 0, heavyArmor: true, attributeLimit: 2 } }))).toBe(20);
  });

  it('carga: 10 + 2 por ponto de Força, ou −1 por ponto negativo; levantar é o dobro', () => {
    expect([-2, 0, 1, 4].map(carryCapacity)).toEqual([8, 10, 12, 18]);
    expect(liftCapacity(4)).toBe(36);
  });

  it('carga atual soma os espaços, aceitando frações', () => {
    const s = sheet({
      equipment: [
        { id: '1', name: 'Mochila', quantity: 1, spaces: 1, worn: true, notes: '' },
        { id: '2', name: 'Flechas', quantity: 20, spaces: 0.5, worn: false, notes: '' },
      ],
    });
    expect(currentLoad(s)).toBe(1.5);
  });

  it('modificadores de tamanho', () => {
    expect(sizeInfo('pequeno')).toMatchObject({ stealth: 2, maneuver: -2 });
    expect(sizeInfo('grande')).toMatchObject({ stealth: -2, maneuver: 2 });
    expect(sizeInfo(undefined).key).toBe('medio');
  });

  it('CD de magia: 10 + ½ nível + atributo-chave', () => {
    const s = sheet({ level: 5, attributes: { for: 0, des: 0, con: 0, int: 0, sab: 4, car: 0 }, spellcasting: { attribute: 'sab' } });
    expect(spellDC(s)).toBe(16);
  });

  it('card do dashboard', () => {
    const s = sheet({ class: 'Clérigo', race: 'Anão', origin: 'Acólito', hp: { max: 20, current: 15, temp: 0 }, mp: { max: 6, current: 3, temp: 0 } });
    expect(buildT20Card(s)).toEqual({
      details: [{ kind: 'class', text: 'Clérigo' }, { kind: 'origin', text: 'Anão · Acólito' }],
      stats: ['PV 15/20', 'PM 3/6'],
    });
  });

  it('ficha nova traz as 30 linhas de perícia da ficha oficial', () => {
    expect(Object.keys(createDefaultT20Sheet('x').skills)).toHaveLength(30);
  });
});
