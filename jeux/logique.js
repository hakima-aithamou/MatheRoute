/* Thinking games: Clue grid (place numbers or letters with clues), Sequences and friezes.
   Loaded before arcade.js, which provides the shared tools (O). */
window.ArcadeJeux = window.ArcadeJeux || [];
window.ArcadeJeux.push(O => {
'use strict';
const { W, H, hasard, pioche, melange, rond, texte } = O;
const notePar = erreurs => erreurs === 0 ? 3 : erreurs <= 2 ? 2 : 1;
const dans = (x, y, r) => x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h;

/* ================================================================
   1. CLUE GRID
   ================================================================ */
/* Every arrangement of n tokens (token k -> cell), stored flat. */
function toutes(n) {
  const a = [...Array(n).keys()], out = [];
  const perm = k => { if (k === n) { out.push(...a); return; } for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; perm(k + 1); [a[k], a[i]] = [a[i], a[k]]; } };
  perm(0); return Uint8Array.from(out);
}
const cachePerms = {};

/* All true clues for a solution. p[token] = cell. Each clue: text, kind, tokens involved, test(p). */
function indices(R, C, p, noms) {
  const n = R * C, rc = i => [Math.floor(i / C), i % C], out = [];
  const coin = i => { const [r, c] = rc(i); return (r === 0 || r === R - 1) && (c === 0 || c === C - 1); };
  const COINS = { '0,0': 'en haut à gauche', ['0,' + (C - 1)]: 'en haut à droite', [(R - 1) + ',0']: 'en bas à gauche', [(R - 1) + ',' + (C - 1)]: 'en bas à droite' };
  for (let t = 0; t < n; t++) {
    const i = p[t], [r, c] = rc(i), X = noms[t];
    if (R === 3 && C === 3 && i === 4) out.push({ txt: X + ' est au centre.', type: 'exact', toks: [t], test: q => q[t] === 4 });
    if (COINS[r + ',' + c]) out.push({ txt: X + ' est ' + COINS[r + ',' + c] + '.', type: 'exact', toks: [t], test: q => q[t] === i });
    if (n > 4 && coin(i)) out.push({ txt: X + ' est dans un coin.', type: 'zone', toks: [t], test: q => coin(q[t]) });
    if (n > 4 && !coin(i)) out.push({ txt: X + ' n’est pas dans un coin.', type: 'zone', toks: [t], test: q => !coin(q[t]) });
    if (r === 0) out.push({ txt: X + ' est en haut.', type: 'zone', toks: [t], test: q => rc(q[t])[0] === 0 });
    if (r === R - 1) out.push({ txt: X + ' est en bas.', type: 'zone', toks: [t], test: q => rc(q[t])[0] === R - 1 });
    if (c === 0) out.push({ txt: X + ' est à gauche.', type: 'zone', toks: [t], test: q => rc(q[t])[1] === 0 });
    if (c === C - 1) out.push({ txt: X + ' est à droite.', type: 'zone', toks: [t], test: q => rc(q[t])[1] === C - 1 });
    for (let u = 0; u < n; u++) {
      if (u === t) continue;
      const j = p[u], [r2, c2] = rc(j), Y = noms[u];
      if (c2 === c && r2 === r + 1) out.push({ txt: X + ' est juste au-dessus de ' + Y + '.', type: 'rel', toks: [t, u], test: q => q[u] === q[t] + C });
      if (r2 === r && c2 === c + 1) out.push({ txt: X + ' est juste à gauche de ' + Y + '.', type: 'rel', toks: [t, u], test: q => q[u] === q[t] + 1 && q[t] % C !== C - 1 });
      if (u > t && Math.abs(r - r2) + Math.abs(c - c2) === 1) out.push({ txt: X + ' et ' + Y + ' sont voisins.', type: 'rel', toks: [t, u], test: q => { const [a, b] = rc(q[t]), [d, e] = rc(q[u]); return Math.abs(a - d) + Math.abs(b - e) === 1; } });
      for (let v = u + 1; v < n; v++) {
        if (v === t) continue;
        const k = p[v], [r3, c3] = rc(k);
        const entre = (A, B, M) => { const [a, b] = rc(A), [d, e] = rc(B), [m, f] = rc(M); return (a === d && a === m && Math.abs(b - e) === 2 && f === (b + e) / 2) || (b === e && b === f && Math.abs(a - d) === 2 && m === (a + d) / 2); };
        if (entre(j, k, i)) out.push({ txt: X + ' est entre ' + Y + ' et ' + noms[v] + '.', type: 'rel', toks: [t, u, v], test: q => entre(q[u], q[v], q[t]) });
      }
    }
  }
  return out;
}

/* Choose clues until only one arrangement fits. Kinds are weighted by level. */
function faireEnigme(nv) {
  const R = nv.R, C = nv.C, n = R * C, noms = nv.lettres ? 'ABCDEFGHI'.slice(0, n).split('') : [...Array(n).keys()].map(k => String(k + 1));
  const sol = melange([...Array(n).keys()]);
  const pool = indices(R, C, sol, noms);
  const perms = cachePerms[n] || (cachePerms[n] = toutes(n));
  let reste = []; for (let k = 0; k < perms.length / n; k++) reste.push(k);
  const q = new Uint8Array(n), vue = k => { for (let i = 0, o = k * n; i < n; i++) q[i] = perms[o + i]; return q; };
  const choisis = [];
  /* Levels with exact clues always start from one sure cell. */
  if (nv.exact > 0) { const c = pioche(pool.filter(c => c.type === 'exact')); choisis.push(c); reste = reste.filter(k => c.test(vue(k))); }
  while (reste.length > 1) {
    const poids = { exact: nv.exact, zone: nv.zone, rel: nv.rel };
    const cand = melange(pool.filter(c => !choisis.includes(c) && poids[c.type] > 0)).sort((a, b) => poids[b.type] * Math.random() - poids[a.type] * Math.random()).slice(0, 8);
    let meilleur = null, garde = null;
    for (const c of cand) {
      const g = reste.filter(k => c.test(vue(k)));
      if (g.length < reste.length && (!meilleur || g.length < garde.length * (0.6 + Math.random() * .8))) { meilleur = c; garde = g; }
    }
    if (!meilleur) { const c = pool.find(c => !choisis.includes(c) && reste.some(k => !c.test(vue(k)))); meilleur = c; garde = reste.filter(k => c.test(vue(k))); }
    choisis.push(meilleur); reste = garde;
  }
  /* Show clues in a calm order: placements first, then relations. */
  const ordre = { exact: 0, zone: 1, rel: 2 };
  choisis.sort((a, b) => ordre[a.type] - ordre[b.type]);
  return { R, C, n, noms, sol, indices: choisis };
}

const grille = {
  id: 'grille', titre: 'La grille des indices', icone: '🔎', couleur: '#0d8a7e', palier: 'intermediaire',
  resume: 'Lis les indices et place chaque chiffre ou chaque lettre dans la bonne case.',
  touches: 'Clic sur un jeton, puis sur une case',
  aide: 'Clique sur un jeton en bas, puis sur une case de la grille. Pour enlever un jeton, clique sur sa case. Un indice devient vert quand il est respecté, rouge s’il ne l’est pas.',
  vitesse: false, pad: false,
  niveaux: [
    { titre: 'Petite grille', description: '2 × 2 · chiffres 1 à 4', R: 2, C: 2, exact: 3, zone: 1, rel: 0 },
    { titre: 'Au-dessus, à côté', description: '2 × 2 · indices de position', R: 2, C: 2, exact: 0, zone: 2, rel: 3 },
    { titre: 'Six cases', description: '2 × 3 · chiffres 1 à 6', R: 2, C: 3, exact: 3, zone: 2, rel: 1 },
    { titre: 'Entre et voisins', description: '2 × 3 · plus d’indices de position', R: 2, C: 3, exact: 1, zone: 2, rel: 3 },
    { titre: 'La grande grille', description: '3 × 3 · chiffres 1 à 9', R: 3, C: 3, exact: 4, zone: 2, rel: 1 },
    { titre: 'Grande grille, plus difficile', description: '3 × 3 · chiffres 1 à 9', R: 3, C: 3, exact: 2, zone: 2, rel: 3 },
    { titre: 'Les lettres', description: '3 × 3 · lettres A à I', R: 3, C: 3, lettres: true, exact: 3, zone: 2, rel: 2 },
    { titre: 'Détective', description: '3 × 3 · lettres A à I', R: 3, C: 3, lettres: true, exact: 1, zone: 2, rel: 4 }
  ],
  consigne(nv) { return 'Place ' + (nv.lettres ? 'les lettres' : 'les chiffres') + ' dans la grille. Lis bien chaque indice.'; },
  init(nv, J) {
    const e = faireEnigme(nv), c = e.R === 2 && e.C === 2 ? 110 : 84;
    this.s = Object.assign(e, { place: Array(e.n).fill(-1), sel: null, erreurs: 0, rouges: new Set(), fini: false, c, x0: 20 + (252 - e.C * c) / 2, y0: 20 });
    J.score('Erreurs : 0'); J.coeurs(''); J.message('Commence par les indices les plus faciles : ceux qui donnent une case précise.');
  },
  jetons() {
    const s = this.s, t = 64, g = 14;
    return s.noms.map((_, k) => ({ k, x: 20 + (k % 3) * (t + g) + (252 - 3 * t - 2 * g) / 2, y: 300 + Math.floor(k / 3) * (t + g) - (s.n <= 4 ? 0 : 0), w: t, h: t }));
  },
  etat(ind) {
    const p = this.s.place;
    if (ind.toks.some(t => p[t] < 0)) return 0;
    return ind.test(p) ? 1 : -1;
  },
  clic(x, y, J) {
    const s = this.s; if (s.fini) return;
    const j = this.jetons().find(z => dans(x, y, z) && s.place[z.k] < 0);
    if (j) { s.sel = j.k; J.message('Maintenant clique sur une case pour y mettre ' + s.noms[j.k] + '.'); return; }
    const cx = Math.floor((x - s.x0) / s.c), cy = Math.floor((y - s.y0) / s.c);
    if (cx < 0 || cy < 0 || cx >= s.C || cy >= s.R) return;
    const i = cy * s.C + cx, deja = s.place.indexOf(i);
    if (deja >= 0) { s.place[deja] = -1; s.sel = null; J.message(s.noms[deja] + ' est retiré de la grille.'); this.verifier(J); return; }
    if (s.sel === null) { J.message('Choisis d’abord un jeton en bas.'); return; }
    s.place[s.sel] = i; s.sel = null; this.verifier(J);
  },
  verifier(J) {
    const s = this.s, rouges = new Set();
    s.indices.forEach((ind, k) => { if (this.etat(ind) === -1) rouges.add(k); });
    const nouveaux = [...rouges].filter(k => !s.rouges.has(k));
    if (nouveaux.length) { s.erreurs++; J.score('Erreurs : ' + s.erreurs); J.message('Oups, relis l’indice en rouge : « ' + s.indices[nouveaux[0]].txt + ' »', 'oups'); }
    s.rouges = rouges;
    if (s.place.every(v => v >= 0) && !rouges.size) {
      s.fini = true; J.message('Bravo, tous les indices sont respectés !', 'bon');
      setTimeout(() => J.gagne(notePar(s.erreurs), 'Grille résolue avec ' + s.erreurs + (s.erreurs > 1 ? ' erreurs.' : ' erreur.')), 600);
    } else if (!nouveaux.length && s.place.some(v => v >= 0)) J.message('Continue !');
  },
  touche() {},
  maj() {},
  dessin(ctx, t) {
    const s = this.s, c = s.c;
    ctx.fillStyle = '#f1f8f7'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < s.n; i++) {
      const X = s.x0 + (i % s.C) * c, Y = s.y0 + Math.floor(i / s.C) * c;
      ctx.fillStyle = '#fff'; ctx.fillRect(X, Y, c, c); ctx.strokeStyle = '#0d8a7e'; ctx.lineWidth = 3; ctx.strokeRect(X, Y, c, c);
      const k = s.place.indexOf(i);
      if (k >= 0) texte(ctx, s.noms[k], X + c / 2, Y + c / 2 + 2, c * .5, '#08665d');
    }
    for (const j of this.jetons()) {
      if (s.place[j.k] >= 0) { rond(ctx, j.x, j.y, j.w, j.h, 16); ctx.fillStyle = '#e3ece9'; ctx.fill(); continue; }
      rond(ctx, j.x, j.y, j.w, j.h, 16); ctx.fillStyle = s.sel === j.k ? '#ffe9a8' : '#0d8a7e'; ctx.fill();
      if (s.sel === j.k) { ctx.lineWidth = 4 + Math.sin(t * 5); ctx.strokeStyle = '#d19a12'; ctx.stroke(); }
      texte(ctx, s.noms[j.k], j.x + j.w / 2, j.y + j.h / 2 + 2, 32, s.sel === j.k ? '#5a3d00' : '#fff');
    }
    /* Clues on the right */
    rond(ctx, 290, 14, 256, H - 28, 16); ctx.fillStyle = '#fff'; ctx.fill();
    texte(ctx, 'Indices', 418, 40, 22, '#08665d');
    const pas = Math.min(40, (H - 90) / s.indices.length);
    s.indices.forEach((ind, k) => {
      const e = this.etat(ind), y = 76 + k * pas;
      const coul = e === 1 ? '#2b8a4f' : e === -1 ? '#c63b3b' : '#2c3e50';
      ctx.font = '700 17px "Atkinson Hyperlegible", Arial, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = coul; ctx.fillText((e === 1 ? '✓ ' : e === -1 ? '✗ ' : '• ') + ind.txt, 302, y, 236);
    });
  }
};

/* ================================================================
   2. SEQUENCES AND FRIEZES
   ================================================================ */
const IMG = ['🍎', '🍌', '⭐', '🔵', '🌸', '🐟', '🍓', '🟩'];
/* One question: items (null = blank to fill, in order), the answers, choice builder, and the layout (row or tiling). */
function questionFrise(nv) {
  if (nv.type === 'nombres' || nv.type === 'trou') {
    const pas = pioche(nv.pas), long = 8;
    /* Steps of 5 or 10 start on a multiple; going down always stays above 0. */
    const m = Math.abs(pas) >= 5 ? Math.abs(pas) : 1;
    const debut = pas > 0 ? hasard(nv.debut[0], nv.debut[1]) * m : Math.abs(pas) * (long - 1) + hasard(0, 3) * m;
    const suite = Array.from({ length: long }, (_, i) => debut + i * pas);
    const trous = nv.type === 'trou' ? [hasard(2, 4), hasard(5, 6)] : [long - 2, long - 1];
    return { lignes: [suite.map((v, i) => trous.includes(i) ? null : String(v))], reponses: trous.map(i => String(suite[i])), regle: (pas > 0 ? '+ ' : '− ') + Math.abs(pas), choix: r => { const v = +r; return melange([...new Set([v, v + pas, v - pas, v + (pas > 0 ? 1 : -1)].filter(x => x >= 0))].slice(0, 3)).map(String); } };
  }
  if (nv.type === 'alterne') {
    const [a, b] = pioche([[2, -1], [3, -1], [10, -5], [2, 1]]), debut = hasard(10, 30), suite = [debut];
    for (let i = 1; i < 8; i++) suite.push(suite[i - 1] + (i % 2 ? a : b));
    return { lignes: [suite.map((v, i) => i >= 6 ? null : String(v))], reponses: [String(suite[6]), String(suite[7])], regle: (a > 0 ? '+ ' : '− ') + Math.abs(a) + ', puis ' + (b > 0 ? '+ ' : '− ') + Math.abs(b), choix: r => { const v = +r; return melange([v, v + 1, v - 2].filter(x => x >= 0)).map(String); } };
  }
  const motif = pioche(nv.motifs), lettres = [...new Set(motif)], imgs = melange(IMG.slice()).slice(0, lettres.length + 1);
  const de = l => imgs[lettres.indexOf(l)];
  if (nv.type === 'images') {
    const long = 10, suite = Array.from({ length: long }, (_, i) => de(motif[i % motif.length]));
    const trous = nv.milieu ? [hasard(3, 5), long - 1] : [long - 2, long - 1];
    return { lignes: [suite.map((v, i) => trous.includes(i) ? null : v)], reponses: trous.map(i => suite[i]), regle: 'le motif ' + motif.split('').join(' '), choix: () => melange(imgs.slice(0, 3)) };
  }
  /* Tiling: each row is the pattern shifted by one. */
  const col = 6, lig = 4, grille = Array.from({ length: lig }, (_, r) => Array.from({ length: col }, (_, c) => de(motif[(c + r) % motif.length])));
  const cases = melange([...Array(lig * col).keys()].filter(k => k >= col)).slice(0, 3).sort((a, b) => a - b);
  return { lignes: grille.map((l, r) => l.map((v, c) => cases.includes(r * col + c) ? null : v)), reponses: cases.map(k => grille[Math.floor(k / col)][k % col]), regle: 'chaque ligne recommence une case plus loin', choix: () => melange(imgs.slice(0, Math.max(3, lettres.length))) };
}
const frises = {
  id: 'frises', titre: 'Suites et frises', icone: '🧶', couleur: '#c2633a', palier: 'debutant',
  resume: 'Complète les suites de nombres, les frises et les dallages d’images.',
  touches: 'Clic sur une réponse',
  aide: 'Trouve la règle de la suite. Clique sur la bonne réponse pour remplir la case jaune, puis la suivante.',
  vitesse: false, pad: false,
  niveaux: [
    { titre: 'Compter par 1 et par 2', description: '5 suites · + 1, + 2', type: 'nombres', pas: [1, 2], debut: [1, 10] },
    { titre: 'Compter par 5 et par 10', description: '5 suites · + 5, + 10', type: 'nombres', pas: [5, 10], debut: [0, 3] },
    { titre: 'À rebours', description: '5 suites · − 1, − 2, − 10', type: 'nombres', pas: [-1, -2, -10], debut: [9, 10] },
    { titre: 'Frises d’images', description: '5 frises · A B, A B B, A A B', type: 'images', motifs: ['AB', 'ABB', 'AAB'] },
    { titre: 'Frises plus longues', description: '5 frises · A B C, A A B C', type: 'images', motifs: ['ABC', 'AABC', 'ABCB'], milieu: true },
    { titre: 'Le trou au milieu', description: '5 suites · + 2, + 5, + 10, − 5', type: 'trou', pas: [2, 5, 10, -5], debut: [3, 9] },
    { titre: 'Les dallages', description: '5 dallages · motif qui se décale', type: 'dallage', motifs: ['ABC', 'AB', 'ABCD'] },
    { titre: 'Défi : deux règles', description: '5 suites · + 2 puis − 1…', type: 'alterne' }
  ],
  consigne(nv) { return nv.type === 'dallage' ? 'Complète le dallage : regarde comment chaque ligne commence.' : 'Complète la suite : remplis les cases jaunes dans l’ordre.'; },
  init(nv, J) {
    this.s = { nv, num: 1, total: 5, erreurs: 0, q: questionFrise(nv), k: 0, mauvais: null, attente: 0, ok: false, fini: false };
    this.s.ch = this.s.q.choix(this.s.q.reponses[0]);
    J.score('Suite 1 / 5'); J.coeurs(''); J.message('');
  },
  zones() { const n = this.s.ch.length, w = 120, g = 26, x0 = (W - n * w - (n - 1) * g) / 2; return this.s.ch.map((_, i) => ({ x: x0 + i * (w + g), y: 410, w, h: 110 })); },
  clic(x, y, J) {
    const s = this.s; if (s.ok || s.fini) return;
    const i = this.zones().findIndex(z => dans(x, y, z)); if (i < 0) return;
    if (s.ch[i] === s.q.reponses[s.k]) {
      s.mauvais = null; s.k++;
      if (s.k < s.q.reponses.length) { s.ch = s.q.choix(s.q.reponses[s.k]); J.message('Oui ! Et la case suivante ?', 'bon'); }
      else { s.ok = true; s.attente = 1.1; J.message('Bravo ! La règle : ' + s.q.regle + '.', 'bon'); }
    } else { s.erreurs++; s.mauvais = i; J.message('Pas encore. Cherche la règle : ' + (s.nv.type === 'images' || s.nv.type === 'dallage' ? 'qu’est-ce qui se répète ?' : 'de combien on avance à chaque fois ?'), 'oups'); }
  },
  touche() {},
  maj(dt, J) {
    const s = this.s; if (!s.ok || (s.attente -= dt) > 0) return;
    if (s.num >= s.total) { s.fini = true; s.ok = false; J.gagne(notePar(s.erreurs), '5 suites complétées avec ' + s.erreurs + (s.erreurs > 1 ? ' erreurs.' : ' erreur.')); return; }
    s.num++; s.q = questionFrise(s.nv); s.k = 0; s.ch = s.q.choix(s.q.reponses[0]); s.ok = false; J.score('Suite ' + s.num + ' / 5'); J.message('');
  },
  dessin(ctx, t) {
    const s = this.s, q = s.q, lignes = q.lignes, nl = lignes.length, ncol = lignes[0].length;
    ctx.fillStyle = '#fdf5f0'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < s.total; i++) { ctx.beginPath(); ctx.arc(W / 2 + (i - 2) * 26, 30, 8, 0, 7); ctx.fillStyle = i < s.num - (s.ok ? 0 : 1) ? '#3aa36b' : '#ead8cc'; ctx.fill(); }
    const cw = Math.min(62, (W - 30) / ncol), ch = nl > 1 ? 62 : 70, x0 = (W - ncol * cw) / 2, y0 = nl > 1 ? 60 : 150;
    let vide = 0;
    lignes.forEach((l, r) => l.forEach((v, c) => {
      const X = x0 + c * cw, Y = y0 + r * ch;
      let val = v, actif = false;
      if (v === null) { if (vide < s.k) val = q.reponses[vide]; else if (vide === s.k) actif = true; vide++; }
      rond(ctx, X + 3, Y + 3, cw - 6, ch - 6, 10);
      ctx.fillStyle = v === null ? (val ? '#dff3e6' : '#fff4d6') : '#fff'; ctx.fill();
      ctx.lineWidth = actif ? 4 + Math.sin(t * 5) : 2; ctx.strokeStyle = actif ? '#d19a12' : v === null ? '#e6c46e' : '#ead8cc'; ctx.stroke();
      if (val) texte(ctx, val, X + cw / 2, Y + ch / 2 + 2, val.length > 2 ? cw * .36 : cw * .46, '#4a2a17');
      else texte(ctx, '?', X + cw / 2, Y + ch / 2 + 2, cw * .4, '#b07f07');
    }));
    if (!s.ok) this.zones().forEach((z, i) => {
      const faux = s.mauvais === i, dx = faux ? Math.sin(t * 40) * 3 : 0;
      rond(ctx, z.x + dx, z.y, z.w, z.h, 18); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = faux ? '#d64545' : '#e2c3ae'; ctx.stroke();
      texte(ctx, s.ch[i], z.x + z.w / 2 + dx, z.y + z.h / 2 + 3, s.ch[i].length > 2 ? 34 : 44, '#4a2a17');
    });
  }
};

return [grille, frises];
});
