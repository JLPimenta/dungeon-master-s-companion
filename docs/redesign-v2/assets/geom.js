// Grimório · marca e animação de carregamento (grade 64 × 64).
// Fonte única: o quadro 0 é exatamente a marca estática.
// Formas do livro são polígonos recuados 3 unidades e desenhados com traço 6 (cantos com raio 3).
//
// Coreografia (o losango se solta ANTES de o livro abrir e nunca cruza o livro):
//  1. o losango se levanta da capa, no lugar; o engaste se fecha por baixo dele
//  2. o livro fechado recua (encolhe para a base) por baixo do losango, que fica parado
//  3. o losango sobe e vira o d20
//  4. o livro abre embaixo do dado, crescendo até o tamanho do livro aberto
//  5. pausa · 6. o livro fecha e recua · 7. o dado desce e vira losango, pairando
//  8. o livro volta ao tamanho por baixo dele · 9. o losango assenta
const GRIM = (() => {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const seg = (u, a, b) => clamp((u - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const L = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  const pts = (arr) => arr.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');

  const T = {
    popA: 0.04, popB: 0.11,       // losango se levanta da capa (fica pairando)
    backA: 0.11, backB: 0.23,     // o livro fechado recua por baixo do losango parado
    riseA: 0.21, riseB: 0.37,     // o losango sobe e vira d20
    openA: 0.37, openB: 0.55,     // livro abre embaixo do dado
    closeA: 0.65, closeB: 0.79,   // livro fecha
    fallA: 0.79, fallB: 0.89,     // dado desce e volta a ser losango, pairando
    fwdA: 0.87, fwdB: 0.96,       // o livro volta ao tamanho por baixo dele
    seatA: 0.94, seatB: 0.99      // losango assenta no engaste
  };
  const PHASES = [[0, 'Fechado'], [T.popA, 'Losango se solta'], [T.backA, 'Livro recua'], [T.riseA, 'Dado subindo'], [T.openA, 'Abrindo'], [T.openB, 'Aberto'],
    [T.closeA, 'Fechando'], [T.fallA, 'Dado descendo'], [T.fwdA, 'Livro volta'], [T.seatA, 'Assentando'], [T.seatB, 'Fechado']];

  const COVER_C = [[24.5, 9], [48, 9], [48, 48], [24.5, 48]];   // dobradiça-topo, livre-topo, livre-base, dobradiça-base
  const COVER_O = [[28, 35], [9, 30], [9, 48.5], [28, 54]];
  const PAGES_C = [[24.5, 9], [48, 9], [48, 55], [24.5, 55]];
  const PAGES_O = [[36, 35], [55, 30], [55, 48.5], [36, 54]];
  const SPINE_C = [[16, 9], [16, 9], [16, 55], [16, 55]];
  const SPINE_O = [[32, 35], [32, 35], [32, 54], [32, 54]];
  const STRAP = { halo: [42.5, 22, 15, 13, 3], body: [44, 23.5, 12, 10, 2] };
  const SEAT = [32, 28.5], GEM_R = 4.25, SOCKET_R = 8, D20 = { x: 32, y: 15, r: 11 };
  const SMALL = 0.48, ANCHOR = [32, 58];   // tamanho do livro recuado e ponto fixo (base, centro)
  const HEX = [-90, -30, 30, 90, 150, 210], DIA = [-90, 0, 0, 90, 180, 180];

  function frame(u, opts) {
    opts = opts || {};
    if (opts.reduced) u = 0;
    const pop = ease(seg(u, T.popA, T.popB)) - ease(seg(u, T.seatA, T.seatB));     // 1 = losango solto
    const rise = ease(seg(u, T.riseA, T.riseB)) - ease(seg(u, T.fallA, T.fallB));  // 1 = d20 no alto
    const back = ease(seg(u, T.backA, T.backB)) - ease(seg(u, T.fwdA, T.fwdB));    // 1 = livro recuado
    const b = ease(seg(u, T.openA, T.openB)) - ease(seg(u, T.closeA, T.closeB));   // 1 = livro aberto

    // Livro (coordenadas próprias) e a transformação que o recua
    const lift = 4 * Math.sin(Math.PI * b);
    const cover = COVER_C.map((p, i) => { const q = L(p, COVER_O[i], b); if (i === 1 || i === 2) q[1] -= lift; return q; });
    const pages = PAGES_C.map((p, i) => L(p, PAGES_O[i], b));
    const spine = SPINE_C.map((p, i) => L(p, SPINE_O[i], b));
    const shiftX = -2.5 * (1 - b);
    const s = lerp(lerp(1, SMALL, back), 1, b);
    const bookT = 'translate(' + ANCHOR[0] + ' ' + ANCHOR[1] + ') scale(' + s.toFixed(4) + ') translate(' + (-ANCHOR[0] + shiftX).toFixed(3) + ' ' + (-ANCHOR[1]) + ')';

    // Engaste (dentro do livro): fecha quando o losango se solta
    const sk = SOCKET_R * (1 - pop);
    const socket = DIA.map((d) => { const a = d * Math.PI / 180; return [SEAT[0] + sk * Math.cos(a), SEAT[1] + sk * Math.sin(a)]; });

    // Losango / d20 (coordenadas do quadro). Sai do assento e fica pairando no mesmo ponto
    // enquanto o livro recua; só então sobe. O livro nunca passa por cima dele.
    const hover = [SEAT[0] - 2.5, SEAT[1]];
    const cx = lerp(hover[0], D20.x, ease(rise)), cy = lerp(hover[1], D20.y, ease(rise));
    const r = lerp(GEM_R * (1 + 0.12 * pop), D20.r, ease(rise)), rot = 180 * ease(rise);
    const shape = (rad) => HEX.map((h, i) => {
      const a = (lerp(DIA[i], h, ease(rise)) + rot) * Math.PI / 180;
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    });
    const out = 1.6 * pop;

    let gemOp = 1;
    if (opts.reduced) gemOp = 0.45 + 0.55 * (0.5 + 0.5 * Math.cos((opts.ms || 0) / 1600 * 2 * Math.PI));
    let phase = 'Fechado';
    PHASES.forEach(([at, name]) => { if (u >= at) phase = name; });
    return {
      bookT,
      cover: pts(cover), pages: pts(pages), spine: pts(spine),
      spineOp: clamp(1 - b * 2.2).toFixed(3), strapOp: clamp(1 - b / 0.12).toFixed(3),
      socket: pts(socket), socketOp: sk > 0.05 ? '1' : '0',
      gemHalo: pts(shape(r + out)), gemBody: pts(shape(r)), gemOp: gemOp.toFixed(3),
      triOp: clamp((rise - 0.8) / 0.2).toFixed(3), triT: 'translate(' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ')',
      phase: opts.reduced ? 'Movimento reduzido' : phase
    };
  }
  return { frame, T, STRAP };
})();
if (typeof module !== 'undefined') module.exports = GRIM;
