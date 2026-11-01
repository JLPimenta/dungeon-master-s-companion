/*
 * Geometria da marca do Grimório e da animação de carregamento (grade 64 × 64).
 * Porta fiel de docs/redesign-v2/assets/geom.js — não mude os números sem
 * atualizar o guia da marca. O quadro 0 é exatamente a marca estática.
 *
 * Livro: polígonos recuados 3 unidades e desenhados com traço 6 (cantos com raio 3).
 *
 * Coreografia (o losango se solta ANTES de o livro abrir e nunca cruza o livro):
 *  1. o losango se levanta da capa, no lugar; o engaste se fecha por baixo dele
 *  2. o livro fechado recua (encolhe para a base) por baixo do losango parado
 *  3. o losango sobe e vira o d20
 *  4. o livro abre embaixo do dado, crescendo até o tamanho do livro aberto
 *  5. pausa · 6. o livro fecha e recua · 7. o dado desce e vira losango, pairando
 *  8. o livro volta ao tamanho por baixo dele · 9. o losango assenta
 */

type Pt = [number, number];

/** Duração de um ciclo completo, em ms. */
export const LOADING_CYCLE_MS = 4200;
/** Pulso do losango no modo de movimento reduzido, em ms. */
export const REDUCED_PULSE_MS = 1600;

export const TIMELINE = {
  popA: 0.04, popB: 0.11,       // losango se levanta da capa (fica pairando)
  backA: 0.11, backB: 0.23,     // o livro fechado recua por baixo do losango parado
  riseA: 0.21, riseB: 0.37,     // o losango sobe e vira d20
  openA: 0.37, openB: 0.55,     // livro abre embaixo do dado
  closeA: 0.65, closeB: 0.79,   // livro fecha
  fallA: 0.79, fallB: 0.89,     // dado desce e volta a ser losango, pairando
  fwdA: 0.87, fwdB: 0.96,       // o livro volta ao tamanho por baixo dele
  seatA: 0.94, seatB: 0.99,     // losango assenta no engaste
} as const;

export const STRAP = {
  halo: { x: 42.5, y: 22, width: 15, height: 13, rx: 3 },
  body: { x: 44, y: 23.5, width: 12, height: 10, rx: 2 },
} as const;

const COVER_C: Pt[] = [[24.5, 9], [48, 9], [48, 48], [24.5, 48]];   // dobradiça-topo, livre-topo, livre-base, dobradiça-base
const COVER_O: Pt[] = [[28, 35], [9, 30], [9, 48.5], [28, 54]];
const PAGES_C: Pt[] = [[24.5, 9], [48, 9], [48, 55], [24.5, 55]];
const PAGES_O: Pt[] = [[36, 35], [55, 30], [55, 48.5], [36, 54]];
const SPINE_C: Pt[] = [[16, 9], [16, 9], [16, 55], [16, 55]];
const SPINE_O: Pt[] = [[32, 35], [32, 35], [32, 54], [32, 54]];
const SEAT: Pt = [32, 28.5];
const GEM_R = 4.25;
const SOCKET_R = 8;
const D20 = { x: 32, y: 15, r: 11 };
const SMALL = 0.48;          // tamanho do livro recuado
const ANCHOR: Pt = [32, 58]; // ponto fixo ao recuar (base, centro)
const HEX = [-90, -30, 30, 90, 150, 210];
const DIA = [-90, 0, 0, 90, 180, 180];

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const L = (p: Pt, q: Pt, t: number): Pt => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const pts = (arr: Pt[]) => arr.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');

/** Atributos SVG de um quadro. Strings prontas para `setAttribute`. */
export interface LoadingFrame {
  bookTransform: string;
  pages: string;
  spine: string;
  spineOpacity: string;
  cover: string;
  strapOpacity: string;
  socket: string;
  socketOpacity: string;
  gemHalo: string;
  gemBody: string;
  gemOpacity: string;
  faceTransform: string;
  faceOpacity: string;
}

/**
 * Quadro da animação na posição `u` do ciclo (0–1).
 * `reduced`: marca parada com o losango pulsando (`ms` = tempo decorrido).
 */
export function loadingFrame(u: number, opts: { reduced?: boolean; ms?: number } = {}): LoadingFrame {
  const T = TIMELINE;
  if (opts.reduced) u = 0;
  const pop = ease(seg(u, T.popA, T.popB)) - ease(seg(u, T.seatA, T.seatB));     // 1 = losango solto
  const rise = ease(seg(u, T.riseA, T.riseB)) - ease(seg(u, T.fallA, T.fallB));  // 1 = d20 no alto
  const back = ease(seg(u, T.backA, T.backB)) - ease(seg(u, T.fwdA, T.fwdB));    // 1 = livro recuado
  const b = ease(seg(u, T.openA, T.openB)) - ease(seg(u, T.closeA, T.closeB));   // 1 = livro aberto

  // Livro (coordenadas próprias) e a transformação que o recua
  const lift = 4 * Math.sin(Math.PI * b);
  const cover = COVER_C.map((p, i) => {
    const q = L(p, COVER_O[i], b);
    if (i === 1 || i === 2) q[1] -= lift;
    return q;
  });
  const pages = PAGES_C.map((p, i) => L(p, PAGES_O[i], b));
  const spine = SPINE_C.map((p, i) => L(p, SPINE_O[i], b));
  const shiftX = -2.5 * (1 - b);
  const s = lerp(lerp(1, SMALL, back), 1, b);
  const bookTransform =
    `translate(${ANCHOR[0]} ${ANCHOR[1]}) scale(${s.toFixed(4)}) translate(${(-ANCHOR[0] + shiftX).toFixed(3)} ${-ANCHOR[1]})`;

  // Engaste (dentro do livro): fecha quando o losango se solta
  const sk = SOCKET_R * (1 - pop);
  const socket = DIA.map((d): Pt => {
    const a = (d * Math.PI) / 180;
    return [SEAT[0] + sk * Math.cos(a), SEAT[1] + sk * Math.sin(a)];
  });

  // Losango / d20 (coordenadas do quadro). Fica pairando enquanto o livro recua; só então sobe.
  const hover: Pt = [SEAT[0] - 2.5, SEAT[1]];
  const er = ease(rise);
  const cx = lerp(hover[0], D20.x, er);
  const cy = lerp(hover[1], D20.y, er);
  const r = lerp(GEM_R * (1 + 0.12 * pop), D20.r, er);
  const rot = 180 * er;
  const shape = (rad: number) => HEX.map((h, i): Pt => {
    const a = ((lerp(DIA[i], h, er) + rot) * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  const out = 1.6 * pop;

  let gemOpacity = 1;
  if (opts.reduced) {
    gemOpacity = 0.45 + 0.55 * (0.5 + 0.5 * Math.cos(((opts.ms ?? 0) / REDUCED_PULSE_MS) * 2 * Math.PI));
  }

  return {
    bookTransform,
    pages: pts(pages),
    spine: pts(spine),
    spineOpacity: clamp(1 - b * 2.2).toFixed(3),
    cover: pts(cover),
    strapOpacity: clamp(1 - b / 0.12).toFixed(3),
    socket: pts(socket),
    socketOpacity: sk > 0.05 ? '1' : '0',
    gemHalo: pts(shape(r + out)),
    gemBody: pts(shape(r)),
    gemOpacity: gemOpacity.toFixed(3),
    faceTransform: `translate(${cx.toFixed(2)} ${cy.toFixed(2)})`,
    faceOpacity: clamp((rise - 0.8) / 0.2).toFixed(3),
  };
}
