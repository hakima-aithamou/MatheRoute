/* Logic game: Number path. In a grid of numbers, go from the start number to the end number
   by following a sequence (going up or down, by steps of 1, 2, 3, 5 or 10).
   Loaded before arcade.js, which provides the shared tools (O). */
window.ArcadeJeux = window.ArcadeJeux || [];
window.ArcadeJeux.push(O => {
'use strict';
const { W, H, hasard, pioche, melange, rond, texte } = O;
const V4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const COUL = '#d0762b', CLAIR = '#fbe3cd', FONCE = '#9c5317';

/* Random path of L cells (side by side, never twice the same cell), built by backtracking. */
function faireChemin(n, L) {
  for (let essai = 0; essai < 200; essai++) {
    const vu = new Set(), chemin = [];
    const libre = (x, y) => x >= 0 && y >= 0 && x < n && y < n && !vu.has(x + ',' + y);
    const avance = (x, y) => {
      vu.add(x + ',' + y); chemin.push([x, y]);
      if (chemin.length === L) return true;
      for (const [dx, dy] of melange(V4.slice())) if (libre(x + dx, y + dy) && avance(x + dx, y + dy)) return true;
      vu.delete(x + ',' + y); chemin.pop(); return false;
    };
    if (avance(hasard(0, n - 1), hasard(0, n - 1))) return chemin;
  }
  return null;
}

/* The grid: the path holds the sequence; the other cells hold other numbers.
   A number of the sequence is allowed outside the path only if it can never be a wrong
   "next step" (no path cell next to it holds the number just before it). */
function faireGrille(nv) {
  const n = nv.n, L = nv.longueur, pas = nv.pas * (nv.sens === 'bas' ? -1 : 1);
  /* Steps of 5 or 10 start on a multiple (0, 5, 10… or 0, 10, 20…). */
  const a = hasard(nv.debut[0], nv.debut[1]) * (nv.multiple || 1);
  const suite = Array.from({ length: L }, (_, i) => a + i * pas);
  const chemin = faireChemin(n, L) || Array.from({ length: L }, (_, i) => { const y = Math.floor(i / n); return [y % 2 ? n - 1 - i % n : i % n, y]; });
  const val = Array.from({ length: n }, () => Array(n).fill(null)), rang = Array.from({ length: n }, () => Array(n).fill(-1));
  chemin.forEach(([x, y], i) => { val[y][x] = suite[i]; rang[y][x] = i; });
  const lo = Math.max(0, Math.min(...suite) - 2 * nv.pas), hi = Math.max(...suite) + 2 * nv.pas;
  const indexDe = new Map(suite.map((v, i) => [v, i]));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (rang[y][x] >= 0) continue;
    let v = null;
    for (let k = 0; k < 60 && v === null; k++) {
      const c = hasard(lo, hi), i = indexDe.get(c);
      if (i === undefined) { v = c; break; }
      if (i === 0) continue;
      const piege = V4.some(([dx, dy]) => { const p = x + dx, q = y + dy; return p >= 0 && q >= 0 && p < n && q < n && rang[q][p] === i - 1; });
      if (!piege) v = c;
    }
    if (v === null) v = hi + hasard(1, 3);
    val[y][x] = v;
  }
  return { n, val, rang, suite, chemin, pas };
}

const signe = p => (p > 0 ? '+ ' : '− ') + Math.abs(p);

const chemin = {
  id: 'chemin', titre: 'Le chemin des nombres', icone: '🔢', couleur: COUL, palier: 'debutant',
  resume: 'Trouve le chemin du nombre de départ au nombre d’arrivée en suivant la suite.',
  touches: 'Clic sur une case · ou flèches',
  aide: 'Pars du nombre vert. Clique sur la case voisine (en haut, en bas, à gauche ou à droite) qui a le bon nombre. Continue jusqu’au drapeau.',
  vitesse: false,
  boutons: [{ id: 'indice', texte: '💡 Indice' }, { id: 'annuler', texte: '↶ Retour d’une case' }],
  niveaux: [
    { titre: 'Compter de 1 en 1', description: '5 × 5 cases · on monte de 1', n: 5, pas: 1, sens: 'haut', longueur: 8, debut: [1, 5] },
    { titre: 'À rebours de 1 en 1', description: '5 × 5 cases · on descend de 1', n: 5, pas: 1, sens: 'bas', longueur: 8, debut: [10, 15] },
    { titre: 'Un plus long chemin', description: '6 × 6 cases · on monte de 1', n: 6, pas: 1, sens: 'haut', longueur: 12, debut: [8, 18] },
    { titre: 'De 2 en 2', description: '6 × 6 cases · on monte de 2', n: 6, pas: 2, sens: 'haut', longueur: 10, debut: [0, 6] },
    { titre: 'À rebours de 2 en 2', description: '6 × 6 cases · on descend de 2', n: 6, pas: 2, sens: 'bas', longueur: 10, debut: [24, 30] },
    { titre: 'De 5 en 5', description: '6 × 6 cases · on monte de 5', n: 6, pas: 5, sens: 'haut', longueur: 10, debut: [0, 1], multiple: 5 },
    { titre: 'De 10 en 10', description: '6 × 6 cases · on monte de 10', n: 6, pas: 10, sens: 'haut', longueur: 10, debut: [0, 1], multiple: 10 },
    { titre: 'À rebours de 5 en 5', description: '6 × 6 cases · on descend de 5', n: 6, pas: 5, sens: 'bas', longueur: 10, debut: [10, 12], multiple: 5 },
    { titre: 'De 3 en 3', description: '6 × 6 cases · on monte de 3', n: 6, pas: 3, sens: 'haut', longueur: 10, debut: [0, 4] },
    { titre: 'Grand chemin à rebours', description: '6 × 6 cases · on descend de 3', n: 6, pas: 3, sens: 'bas', longueur: 12, debut: [36, 42] }
  ],
  consigne(nv) {
    const s = nv.sens === 'bas' ? 'descend' : 'monte';
    return 'Va du nombre vert jusqu’au drapeau 🏁. On ' + s + ' de ' + nv.pas + ' en ' + nv.pas + ' (' + signe(nv.pas * (nv.sens === 'bas' ? -1 : 1)) + ').';
  },
  init(nv, J) {
    const g = faireGrille(nv);
    this.s = Object.assign(g, { fait: 1, erreurs: 0, indice: null, flash: null, fini: false, c: W / g.n });
    J.score('Erreurs : 0'); J.coeurs('');
    J.message('Le départ est ' + g.suite[0] + '. Cherche ' + g.suite[1] + ' juste à côté.');
    J.bouton('annuler', { actif: false });
  },
  /* Try to go to cell (x, y) as the next step. */
  essayer(x, y, J) {
    const s = this.s;
    if (s.fini) return;
    const [px, py] = s.chemin[s.fait - 1];
    if (Math.abs(px - x) + Math.abs(py - y) !== 1) {
      J.message('Choisis une case collée à ' + s.suite[s.fait - 1] + ' : en haut, en bas, à gauche ou à droite.', 'oups');
      return;
    }
    const attendu = s.suite[s.fait];
    if (s.rang[y][x] === s.fait) {
      s.fait++; s.indice = null;
      J.bouton('annuler', { actif: true });
      if (s.fait === s.suite.length) {
        s.fini = true;
        const etoiles = s.erreurs === 0 ? 3 : s.erreurs <= 2 ? 2 : 1;
        J.message('Bravo ! Tu es arrivé à ' + attendu + '.', 'bon');
        setTimeout(() => J.gagne(etoiles, 'Chemin trouvé avec ' + s.erreurs + (s.erreurs > 1 ? ' erreurs.' : ' erreur.')), 500);
      } else J.message('Oui, ' + attendu + ' ! Maintenant cherche ' + s.suite[s.fait] + '.', 'bon');
    } else {
      s.erreurs++; J.score('Erreurs : ' + s.erreurs);
      s.flash = { x, y, t: .8 };
      J.message('Ce n’est pas ' + s.val[y][x] + '. Après ' + s.suite[s.fait - 1] + ', on cherche ' + s.suite[s.fait - 1] + ' ' + signe(s.pas) + ' = ' + attendu + '.', 'oups');
    }
  },
  clic(x, y, J) { const c = this.s.c; this.essayer(Math.floor(x / c), Math.floor(y / c), J); },
  touche(dir, J) {
    const s = this.s, d = { haut: [0, -1], bas: [0, 1], gauche: [-1, 0], droite: [1, 0] }[dir];
    const [px, py] = s.chemin[s.fait - 1], x = px + d[0], y = py + d[1];
    if (x >= 0 && y >= 0 && x < s.n && y < s.n) this.essayer(x, y, J);
  },
  action(id, J) {
    const s = this.s;
    if (s.fini) return;
    if (id === 'indice') {
      s.indice = s.chemin[s.fait]; s.erreurs++; J.score('Erreurs : ' + s.erreurs);
      J.message('Indice : ' + s.suite[s.fait - 1] + ' ' + signe(s.pas) + ' = ' + s.suite[s.fait] + '. La case brille.', 'bon');
    } else if (id === 'annuler' && s.fait > 1) {
      s.fait--; s.indice = null;
      J.bouton('annuler', { actif: s.fait > 1 });
      J.message('Tu es revenu à ' + s.suite[s.fait - 1] + '. Cherche ' + s.suite[s.fait] + '.');
    }
  },
  maj(dt) { const f = this.s.flash; if (f && (f.t -= dt) <= 0) this.s.flash = null; },
  dessin(ctx, t) {
    const s = this.s, c = s.c, n = s.n, m = c * .07;
    ctx.fillStyle = '#fdf8f3'; ctx.fillRect(0, 0, W, H);
    /* Line through the cells already found */
    ctx.strokeStyle = COUL; ctx.lineWidth = c * .16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    s.chemin.slice(0, s.fait).forEach(([x, y], i) => { const X = x * c + c / 2, Y = y * c + c / 2; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
    ctx.stroke();
    const fin = s.chemin[s.chemin.length - 1], cur = s.chemin[s.fait - 1];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const r = s.rang[y][x], trouve = r >= 0 && r < s.fait, X = x * c + m, Y = y * c + m, w = c - 2 * m;
      const voisin = !s.fini && Math.abs(cur[0] - x) + Math.abs(cur[1] - y) === 1;
      rond(ctx, X, Y, w, w, c * .16);
      ctx.fillStyle = r === 0 ? '#3aa36b' : trouve ? COUL : voisin ? '#fff' : '#f3ebe3'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = voisin ? FONCE : '#e2d3c4'; ctx.stroke();
      /* Hint: glowing cell; wrong choice: red outline for a moment */
      if (s.indice && s.indice[0] === x && s.indice[1] === y) { ctx.lineWidth = 6 + 3 * Math.sin(t * 6); ctx.strokeStyle = '#f4c152'; ctx.stroke(); }
      if (s.flash && s.flash.x === x && s.flash.y === y) { ctx.lineWidth = 6; ctx.strokeStyle = '#d64545'; ctx.stroke(); }
      const blanc = r === 0 || trouve;
      texte(ctx, String(s.val[y][x]), x * c + c / 2, y * c + c / 2 + (fin[0] === x && fin[1] === y ? c * .1 : 0), c * (String(s.val[y][x]).length > 2 ? .3 : .38), blanc ? '#fff' : '#3b2a1c');
    }
    texte(ctx, '🏁', fin[0] * c + c * .5, fin[1] * c + c * .24, c * .24, '#000');
    /* Current cell: soft ring */
    if (!s.fini) { ctx.beginPath(); ctx.arc(cur[0] * c + c / 2, cur[1] * c + c / 2, c * (.44 + .02 * Math.sin(t * 3)), 0, 7); ctx.lineWidth = 4; ctx.strokeStyle = FONCE; ctx.stroke(); }
  }
};

return [chemin];
});
