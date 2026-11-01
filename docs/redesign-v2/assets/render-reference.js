const GRIM = require('./geom.js') /* referência: ordem de desenho */;
const S = GRIM.STRAP;
function body(f, F, K) {
  const rr = (a, fill) => `<rect x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" rx="${a[4]}" fill="${fill}"/>`;
  return `<g transform="${f.bookT}">`
    + `<polygon points="${f.pages}" fill="${F}" stroke="${F}" stroke-width="6" stroke-linejoin="round"/>`
    + `<polygon points="${f.spine}" fill="${F}" stroke="${F}" stroke-width="6" stroke-linejoin="round" opacity="${f.spineOp}"/>`
    + `<polygon points="${f.cover}" fill="${K}" stroke="${K}" stroke-width="11" stroke-linejoin="round"/>`
    + `<polygon points="${f.cover}" fill="${F}" stroke="${F}" stroke-width="6" stroke-linejoin="round"/>`
    + `<g opacity="${f.strapOp}">${rr(S.halo, K)}${rr(S.body, F)}</g>`
    + `<polygon points="${f.socket}" fill="${K}" opacity="${f.socketOp}"/></g>`
    + `<polygon points="${f.gemHalo}" fill="${K}"/><polygon points="${f.gemBody}" fill="${F}" opacity="${f.gemOp}"/>`
    + `<g transform="${f.triT}" opacity="${f.triOp}"><polygon points="0,-6.5 6,4 -6,4" fill="none" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M0 -6.5 L0 -11 M6 4 L9.5 5.5 M-6 4 L-9.5 5.5" stroke="${K}" stroke-width="2"/></g>`;
}
const svg = (u, s, F = '#D9A62E', K = '#12151B') => `<svg width="${s}" height="${s}" viewBox="0 0 64 64">${body(GRIM.frame(u), F, K)}</svg>`;
module.exports = { GRIM, body, svg };
