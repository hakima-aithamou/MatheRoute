/* Geometry games: Solids, Plane figures and symmetry. Multiple-choice questions drawn on the canvas.
   Loaded before arcade.js, which provides the shared tools (O). */
window.ArcadeJeux = window.ArcadeJeux || [];
window.ArcadeJeux.push(O => {
'use strict';
const { W, H, hasard, pioche, melange, rond, texte } = O;
const notePar = erreurs => erreurs === 0 ? 3 : erreurs <= 2 ? 2 : 1;
const dans = (x, y, r) => x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h;
const ENCRE = '#1f3a4d';

/* ---------- Text wrapped on several lines ---------- */
function paragraphe(ctx, t, x, y, larg, taille, coul) {
  ctx.font = '700 ' + taille + 'px "Atkinson Hyperlegible", Arial, sans-serif'; ctx.fillStyle = coul; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const mots = t.split(' '), lignes = []; let l = '';
  for (const m of mots) { const e = l ? l + ' ' + m : m; if (ctx.measureText(e).width > larg && l) { lignes.push(l); l = m; } else l = e; }
  lignes.push(l);
  lignes.forEach((s, i) => ctx.fillText(s, x, y + (i - (lignes.length - 1) / 2) * taille * 1.25));
}

/* ================================================================
   Shared quiz engine: 5 questions per level, 2 to 4 choices (text or drawing).
   ================================================================ */
function quiz(def) {
  return Object.assign({
    vitesse: false, pad: false, touches: 'Clic sur une réponse',
    consigne(nv) { return nv.consigne || 'Lis la question, regarde le dessin et clique sur la bonne réponse.'; },
    init(nv, J) { this.s = { nv, num: 1, total: 5, erreurs: 0, q: nv.gen(), mauvais: null, ok: false, attente: 0, fini: false }; J.score('Question 1 / 5'); J.coeurs(''); J.message(''); },
    zones() {
      const q = this.s.q, n = q.choix.length, dessin = q.choix.some(c => c.d), w = n === 4 ? 118 : n === 2 ? 190 : 150, h = dessin ? 150 : 86, g = 18;
      const x0 = (W - n * w - (n - 1) * g) / 2; return q.choix.map((_, i) => ({ x: x0 + i * (w + g), y: dessin ? 380 : 420, w, h }));
    },
    clic(x, y, J) {
      const s = this.s; if (s.ok || s.fini) return;
      const i = this.zones().findIndex(z => dans(x, y, z)); if (i < 0) return;
      if (i === s.q.bon) { s.ok = true; s.mauvais = null; s.attente = 1.6; J.message('Oui ! ' + (s.q.bravo || ''), 'bon'); }
      else { s.erreurs++; s.mauvais = i; J.message('Pas encore. ' + (s.q.aide || 'Regarde bien et essaie une autre réponse.'), 'oups'); }
    },
    touche() {},
    maj(dt, J) {
      const s = this.s; if (!s.ok || (s.attente -= dt) > 0) return;
      if (s.num >= s.total) { s.fini = true; s.ok = false; J.gagne(notePar(s.erreurs), '5 questions réussies avec ' + s.erreurs + (s.erreurs > 1 ? ' erreurs.' : ' erreur.')); return; }
      s.num++; s.q = s.nv.gen(); s.ok = false; s.mauvais = null; J.score('Question ' + s.num + ' / 5'); J.message('');
    },
    dessin(ctx, t) {
      const s = this.s, q = s.q;
      ctx.fillStyle = def.fond; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < s.total; i++) { ctx.beginPath(); ctx.arc(W / 2 + (i - 2) * 24, 18, 7, 0, 7); ctx.fillStyle = i < s.num - (s.ok ? 0 : 1) ? '#3aa36b' : '#d5dde6'; ctx.fill(); }
      paragraphe(ctx, q.texte, W / 2, 56, W - 40, 22, ENCRE);
      if (q.dessin) { ctx.save(); q.dessin(ctx, W / 2, 225, 300, t); ctx.restore(); }
      this.zones().forEach((z, i) => {
        const c = q.choix[i], bon = s.ok && i === q.bon, faux = s.mauvais === i, dx = faux ? Math.sin(t * 40) * 3 : 0;
        rond(ctx, z.x + dx, z.y, z.w, z.h, 18); ctx.fillStyle = bon ? '#dff3e6' : '#fff'; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = bon ? '#3aa36b' : faux ? '#d64545' : '#c8d3e3'; ctx.stroke();
        if (c.d) { ctx.save(); c.d(ctx, z.x + z.w / 2 + dx, z.y + z.h / 2, Math.min(z.w, z.h) * .8); ctx.restore(); }
        if (c.t) paragraphe(ctx, c.t, z.x + z.w / 2 + dx, z.y + z.h / 2 + (c.d ? z.h * .38 : 0), z.w - 14, c.t.length > 14 ? 17 : 22, ENCRE);
      });
    }
  }, def);
}
/* Build choices: the right one plus wrong ones, mixed; returns { choix, bon }. */
function melanger(bonne, fausses, n) {
  const toutes = melange([bonne, ...melange(fausses.slice()).slice(0, (n || 3) - 1)]);
  return { choix: toutes, bon: toutes.indexOf(bonne) };
}

/* ================================================================
   1. SOLIDS
   ================================================================ */
/* Polyhedra: vertices (x, y up, z) and faces (vertex lists). */
const V = (x, y, z) => [x, y, z];
const POLY = {
  cube: { s: [V(-1, -1, -1), V(1, -1, -1), V(1, 1, -1), V(-1, 1, -1), V(-1, -1, 1), V(1, -1, 1), V(1, 1, 1), V(-1, 1, 1)], f: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]] },
  pave: { s: [V(-1.6, -.8, -.8), V(1.6, -.8, -.8), V(1.6, .8, -.8), V(-1.6, .8, -.8), V(-1.6, -.8, .8), V(1.6, -.8, .8), V(1.6, .8, .8), V(-1.6, .8, .8)], f: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]] },
  prismeTri: { s: [V(-1.5, -.8, -1), V(-1.5, -.8, 1), V(-1.5, .9, 0), V(1.5, -.8, -1), V(1.5, -.8, 1), V(1.5, .9, 0)], f: [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [0, 2, 5, 3]] },
  pyrCarree: { s: [V(-1.1, -.9, -1.1), V(1.1, -.9, -1.1), V(1.1, -.9, 1.1), V(-1.1, -.9, 1.1), V(0, 1.2, 0)], f: [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]] },
  pyrTri: { s: [V(-1.2, -.9, -.8), V(1.2, -.9, -.8), V(0, -.9, 1.2), V(0, 1.2, 0)], f: [[0, 1, 2], [0, 1, 3], [1, 2, 3], [2, 0, 3]] }
};
function projeter([x, y, z]) {
  const a = -.6, b = .38, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  const x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
  return [x1, -y1, z2];
}
function polyedre(ctx, cle, cx, cy, r, coul) {
  const P = POLY[cle], pts = P.s.map(projeter).map(([x, y, z]) => [cx + x * r, cy + y * r, z]);
  const n3 = P.s.length, centre = P.s.reduce((m, p) => [m[0] + p[0] / n3, m[1] + p[1] / n3, m[2] + p[2] / n3], [0, 0, 0]);
  /* Outward normal of each face (model space), turned like the drawing; it faces the viewer when its depth is positive. */
  const faces = P.f.map(f => {
    const [A, B, C] = f.slice(0, 3).map(i => P.s[i]), u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const m = f.reduce((s, i) => [s[0] + P.s[i][0] / f.length, s[1] + P.s[i][1] / f.length, s[2] + P.s[i][2] / f.length], [0, 0, 0]);
    if (n[0] * (m[0] - centre[0]) + n[1] * (m[1] - centre[1]) + n[2] * (m[2] - centre[2]) < 0) n = n.map(x => -x);
    const [nx, ny, nz] = projeter(n), l = Math.hypot(nx, ny, nz);
    return { f, visible: nz > 1e-6, lum: .55 + .45 * Math.max(0, (-ny * .8 + nx * .2) / l + .2) };
  });
  ctx.lineJoin = 'round';
  for (const fa of faces) if (fa.visible) {
    ctx.beginPath(); fa.f.forEach((i, k) => k ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1])); ctx.closePath();
    ctx.fillStyle = teinte(coul, fa.lum); ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 2.5; ctx.stroke();
  }
  /* Hidden edges (only on hidden faces), dashed */
  const vues = new Set();
  for (const fa of faces) if (fa.visible) fa.f.forEach((a, k) => { const b = fa.f[(k + 1) % fa.f.length]; vues.add(Math.min(a, b) + '-' + Math.max(a, b)); });
  ctx.setLineDash([6, 5]); ctx.strokeStyle = '#5f7184'; ctx.lineWidth = 2;
  for (const fa of faces) if (!fa.visible) fa.f.forEach((a, k) => {
    const b = fa.f[(k + 1) % fa.f.length]; if (vues.has(Math.min(a, b) + '-' + Math.max(a, b))) return;
    ctx.beginPath(); ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]); ctx.stroke();
  });
  ctx.setLineDash([]);
}
function teinte(hex, k) { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(255 - (255 - v) * k)); return 'rgb(' + c.join(',') + ')'; }
function cylindre(ctx, cx, cy, r, coul) {
  const w = r * .9, h = r * 1.5, e = r * .3;
  ctx.setLineDash([5, 5]); ctx.strokeStyle = '#7a8a99'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy + h / 2, w, e, 0, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(cx - w, cy - h / 2); ctx.lineTo(cx - w, cy + h / 2); ctx.ellipse(cx, cy + h / 2, w, e, 0, Math.PI, 0, true); ctx.lineTo(cx + w, cy - h / 2); ctx.closePath();
  const g = ctx.createLinearGradient(cx - w, 0, cx + w, 0); g.addColorStop(0, teinte(coul, .6)); g.addColorStop(.6, teinte(coul, .95)); g.addColorStop(1, teinte(coul, .7));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy - h / 2, w, e, 0, 0, 7); ctx.fillStyle = teinte(coul, .45); ctx.fill(); ctx.stroke();
}
function cone(ctx, cx, cy, r, coul) {
  const w = r * .9, h = r * 1.6, e = r * .28, by = cy + h / 2;
  ctx.setLineDash([5, 5]); ctx.strokeStyle = '#7a8a99'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, by, w, e, 0, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(cx, by - h); ctx.lineTo(cx - w, by); ctx.ellipse(cx, by, w, e, 0, Math.PI, 0, true); ctx.closePath();
  const g = ctx.createLinearGradient(cx - w, 0, cx + w, 0); g.addColorStop(0, teinte(coul, .6)); g.addColorStop(.6, teinte(coul, .95)); g.addColorStop(1, teinte(coul, .7));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 2.5; ctx.stroke();
}
function sphere(ctx, cx, cy, r, coul) {
  const R = r * .95, g = ctx.createRadialGradient(cx - R * .35, cy - R * .35, R * .1, cx, cy, R);
  g.addColorStop(0, teinte(coul, .25)); g.addColorStop(1, teinte(coul, 1));
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.setLineDash([5, 5]); ctx.strokeStyle = '#7a8a99'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * .28, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
}
const UN = { cube: 'un', pave: 'un', prismeTri: 'un', pyrCarree: 'une', pyrTri: 'une', cylindre: 'un', cone: 'un', sphere: 'une' };
const LE = k => (UN[k] === 'une' ? 'La ' : 'Le ');
const SOLIDES = {
  cube: { nom: 'cube', planes: 6, courbes: 0, sommets: 8, aretes: 12, bouge: 'glisse', figures: ['carre', 'carre', 'carre', 'carre', 'carre', 'carre'], objets: [['🎲', 'un dé'], ['🎁', 'un cadeau']] },
  pave: { nom: 'prisme à base rectangulaire', planes: 6, courbes: 0, sommets: 8, aretes: 12, bouge: 'glisse', figures: ['rect', 'rect', 'rect', 'rect', 'rect', 'rect'], objets: [['📦', 'une boîte'], ['🧱', 'une brique']] },
  prismeTri: { nom: 'prisme à base triangulaire', planes: 5, courbes: 0, sommets: 6, aretes: 9, bouge: 'glisse', figures: ['tri', 'tri', 'rect', 'rect', 'rect'], objets: [['⛺', 'une tente'], ['🧀', 'une part de fromage']] },
  pyrCarree: { nom: 'pyramide à base carrée', planes: 5, courbes: 0, sommets: 5, aretes: 8, bouge: 'glisse', figures: ['carre', 'tri', 'tri', 'tri', 'tri'], objets: [] },
  pyrTri: { nom: 'pyramide à base triangulaire', planes: 4, courbes: 0, sommets: 4, aretes: 6, bouge: 'glisse', figures: ['tri', 'tri', 'tri', 'tri'], objets: [] },
  cylindre: { nom: 'cylindre', planes: 2, courbes: 1, bouge: 'les deux', figures: ['cercle', 'cercle', 'rect'], objets: [['🥫', 'une boîte de conserve'], ['🥁', 'un tambour'], ['🕯️', 'une bougie']] },
  cone: { nom: 'cône', planes: 1, courbes: 1, bouge: 'les deux', objets: [['🍦', 'un cornet de crème glacée']] },
  sphere: { nom: 'sphère', planes: 0, courbes: 1, bouge: 'roule', objets: [['⚽', 'un ballon'], ['🍊', 'une orange'], ['🌍', 'la Terre']] }
};
const COUL_SOLIDE = { cube: '#e0564a', pave: '#3d7fd6', prismeTri: '#f2a33c', pyrCarree: '#d9b44a', pyrTri: '#8a5cc7', cylindre: '#2f9e8f', cone: '#e07a3c', sphere: '#4d8fe0' };
function solide(cle) {
  return (ctx, cx, cy, taille) => {
    const r = taille * .38, c = COUL_SOLIDE[cle];
    if (POLY[cle]) polyedre(ctx, cle, cx, cy, r * (cle === 'pave' || cle === 'prismeTri' ? .8 : .95), c);
    else if (cle === 'cylindre') cylindre(ctx, cx, cy, r, c);
    else if (cle === 'cone') cone(ctx, cx, cy, r, c);
    else sphere(ctx, cx, cy, r, c);
  };
}
const CLES = Object.keys(SOLIDES), POLYS = CLES.filter(k => POLY[k]);
/* Flat shapes drawn small in a row (to build a solid). */
function petiteFigure(ctx, f, x, y, s) {
  ctx.beginPath();
  if (f === 'carre') ctx.rect(x - s / 2, y - s / 2, s, s);
  else if (f === 'rect') ctx.rect(x - s * .7, y - s * .38, s * 1.4, s * .76);
  else if (f === 'tri') { ctx.moveTo(x, y - s / 2); ctx.lineTo(x + s / 2, y + s / 2); ctx.lineTo(x - s / 2, y + s / 2); ctx.closePath(); }
  else if (f === 'cercle') ctx.arc(x, y, s / 2, 0, 7);
  ctx.fillStyle = '#eaf2fb'; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 2; ctx.stroke();
}
function ensemble(figs) {
  return (ctx, cx, cy, taille) => {
    const n = figs.length, par = n > 4 ? 3 : n, lig = Math.ceil(n / par), s = taille / (par + 1.2);
    figs.forEach((f, k) => { const c = k % par, l = Math.floor(k / par); petiteFigure(ctx, f, cx + (c - (par - 1) / 2) * s * 1.55, cy + (l - (lig - 1) / 2) * s * 1.3, s); });
  };
}
const nb = (bonne, autour) => { const set = new Set([bonne]); for (const d of melange(autour.slice())) if (set.size < 3 && bonne + d >= 0) set.add(bonne + d); return [...set]; };
const choixNombres = (bonne, autour) => { const vals = nb(bonne, autour).sort((a, b) => a - b); return { choix: vals.map(v => ({ t: String(v) })), bon: vals.indexOf(bonne) }; };

const solides = quiz({
  id: 'solides', titre: 'Les solides', icone: '🧊', couleur: '#2f9e8f', palier: 'debutant', fond: '#f2f8f7',
  resume: 'Reconnais les solides : leur nom, les objets qui leur ressemblent, leurs faces, sommets et arêtes.',
  aide: 'Lis la question en haut, regarde le dessin, puis clique sur la bonne réponse. Les lignes pointillées sont les arêtes cachées, derrière le solide.',
  niveaux: [
    { titre: 'Le nom des solides', description: '5 questions · cube, cylindre, sphère…', gen() {
      const k = pioche(CLES), r = melanger(k, CLES.filter(x => x !== k));
      return { texte: 'Comment s’appelle ce solide ?', dessin: (c, x, y) => solide(k)(c, x, y + 10, 250), choix: r.choix.map(x => ({ t: SOLIDES[x].nom })), bon: r.bon, bravo: 'C’est ' + UN[k] + ' ' + SOLIDES[k].nom + '.' };
    } },
    { titre: 'Des objets de la vie', description: '5 questions · à quel solide ressemble l’objet ?', gen() {
      const k = pioche(CLES.filter(x => SOLIDES[x].objets.length)), [emo, nom] = pioche(SOLIDES[k].objets), r = melanger(k, CLES.filter(x => x !== k));
      return { texte: 'À quel solide ressemble ' + nom + ' ?', dessin: (c, x, y) => texte(c, emo, x, y + 6, 120, '#000'), choix: r.choix.map(x => ({ d: solide(x) })), bon: r.bon, bravo: nom[0].toUpperCase() + nom.slice(1) + ' ressemble à ' + UN[k] + ' ' + SOLIDES[k].nom + '.' };
    } },
    { titre: 'Roule ou glisse ?', description: '5 questions · il roule, il glisse ou les deux', gen() {
      const k = pioche(CLES), rep = ['glisse', 'roule', 'les deux'], t = { glisse: 'Il glisse seulement', roule: 'Il roule seulement', 'les deux': 'Il roule et il glisse' };
      return { texte: 'Si on le pousse sur la table, que fait ce solide ?', dessin: (c, x, y) => solide(k)(c, x, y + 10, 250), choix: rep.map(x => ({ t: t[x] })), bon: rep.indexOf(SOLIDES[k].bouge),
        aide: 'Une face plane glisse. Une face courbe roule.', bravo: SOLIDES[k].courbes ? (SOLIDES[k].planes ? 'Sa face courbe roule et ses faces planes glissent.' : 'Il n’a que des faces courbes : il roule.') : 'Il n’a que des faces planes : il glisse.' };
    } },
    { titre: 'Faces planes, faces courbes', description: '5 questions · compter les faces', gen() {
      const k = pioche(CLES), courbe = SOLIDES[k].courbes && Math.random() < .4, v = courbe ? SOLIDES[k].courbes : SOLIDES[k].planes;
      const r = choixNombres(v, [1, -1, 2, -2]);
      return { texte: courbe ? 'Combien de faces courbes a ce solide ?' : 'Combien de faces planes a ce solide ?', dessin: (c, x, y) => solide(k)(c, x, y + 10, 250), ...r, aide: 'Compte aussi les faces cachées (lignes pointillées).', bravo: LE(k) + SOLIDES[k].nom + ' a ' + v + (courbe ? ' face courbe.' : v > 1 ? ' faces planes.' : ' face plane.') };
    } },
    { titre: 'Les sommets', description: '5 questions · les coins du solide', gen() {
      const k = pioche(POLYS), v = SOLIDES[k].sommets, r = choixNombres(v, [1, -1, 2, -2]);
      return { texte: 'Combien de sommets a ce solide ? (un sommet est un coin)', dessin: (c, x, y) => solide(k)(c, x, y + 10, 250), ...r, aide: 'Compte les coins, même ceux qui sont derrière.', bravo: LE(k) + SOLIDES[k].nom + ' a ' + v + ' sommets.' };
    } },
    { titre: 'Les arêtes', description: '5 questions · les lignes où deux faces se touchent', gen() {
      const k = pioche(POLYS), v = SOLIDES[k].aretes, r = choixNombres(v, [1, -1, 2, -2, 3]);
      return { texte: 'Combien d’arêtes a ce solide ? (une arête est une ligne où deux faces se touchent)', dessin: (c, x, y) => solide(k)(c, x, y + 10, 250), ...r, aide: 'Compte les lignes pleines et les lignes pointillées.', bravo: LE(k) + SOLIDES[k].nom + ' a ' + v + ' arêtes.' };
    } },
    { titre: 'Les figures pour le construire', description: '5 questions · quelles figures planes ?', gen() {
      const avec = CLES.filter(x => SOLIDES[x].figures), k = pioche(avec);
      const autres = avec.filter(x => x !== k && SOLIDES[x].figures.join() !== SOLIDES[k].figures.join());
      const r = melanger(k, autres);
      return { texte: 'Quelles figures planes faut-il pour construire ce solide ?', dessin: (c, x, y) => solide(k)(c, x, y + 10, 240), choix: r.choix.map(x => ({ d: ensemble(SOLIDES[x].figures) })), bon: r.bon, aide: 'Compte ses faces et regarde leur forme.', bravo: 'Une figure pour chaque face.' };
    } },
    { titre: 'Qui suis-je ?', description: '5 devinettes', gen() {
      const k = pioche(CLES), S = SOLIDES[k];
      const p = S.planes, phr = (S.courbes ? (p ? 'J’ai ' + p + (p > 1 ? ' faces planes' : ' face plane') + ' et une face courbe.' : 'Je n’ai pas de face plane. Je roule partout.') : 'J’ai ' + p + ' faces planes et ' + S.sommets + ' sommets.') + (k === 'cube' ? ' Toutes mes faces sont des carrés.' : k === 'pave' ? ' Mes faces sont des rectangles.' : k === 'pyrCarree' ? ' Ma base est un carré.' : k === 'pyrTri' ? ' Toutes mes faces sont des triangles.' : k === 'prismeTri' ? ' J’ai deux triangles.' : '');
      const r = melanger(k, CLES.filter(x => x !== k && !(x === 'cube' && k === 'pave') && !(x === 'pave' && k === 'cube')));
      return { texte: phr + ' Qui suis-je ?', choix: r.choix.map(x => ({ d: solide(x) })), bon: r.bon, dessin: (c, x, y) => texte(c, '❓', x, y, 90, '#000'), bravo: 'Je suis ' + UN[k] + ' ' + S.nom + '.' };
    } }
  ]
});

/* ================================================================
   2. PLANE FIGURES AND SYMMETRY
   ================================================================ */
const FIG = {
  carre: { nom: 'carré', cotes: 4, pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]] },
  rectangle: { nom: 'rectangle', cotes: 4, pts: [[-1.5, -.8], [1.5, -.8], [1.5, .8], [-1.5, .8]] },
  triangle: { nom: 'triangle', cotes: 3, pts: [[0, -1.1], [1.2, .9], [-1.2, .9]] },
  losange: { nom: 'losange', cotes: 4, pts: [[0, -1.3], [.9, 0], [0, 1.3], [-.9, 0]] },
  pentagone: { nom: 'pentagone', cotes: 5, pts: [0, 1, 2, 3, 4].map(k => [1.15 * Math.cos(-Math.PI / 2 + k * 2 * Math.PI / 5), 1.15 * Math.sin(-Math.PI / 2 + k * 2 * Math.PI / 5)]) },
  hexagone: { nom: 'hexagone', cotes: 6, pts: [0, 1, 2, 3, 4, 5].map(k => [1.15 * Math.cos(k * Math.PI / 3), 1.15 * Math.sin(k * Math.PI / 3)]) },
  cercle: { nom: 'cercle', cotes: 0 }
};
const COUL_FIG = ['#e0564a', '#3d7fd6', '#f2a33c', '#3aa36b', '#8a5cc7', '#2f9e8f'];
function figure(cle, rot, coul, echelle) {
  return (ctx, cx, cy, taille) => {
    const r = taille * .3 * (echelle || 1), F = FIG[cle]; ctx.beginPath();
    if (cle === 'cercle') ctx.arc(cx, cy, r * 1.1, 0, 7);
    else F.pts.forEach(([x, y], k) => { const a = rot || 0, X = cx + (x * Math.cos(a) - y * Math.sin(a)) * r, Y = cy + (x * Math.sin(a) + y * Math.cos(a)) * r; k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
    ctx.closePath(); ctx.fillStyle = coul || '#7fb2ec'; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 3; ctx.stroke();
  };
}
const CLES_FIG = Object.keys(FIG);
/* Lines: straight, curved, broken; open or closed. */
function ligne(type, fermee) {
  return (ctx, cx, cy, taille) => {
    const s = taille * .35; ctx.beginPath(); ctx.lineWidth = 5; ctx.strokeStyle = ENCRE; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (type === 'droite') { ctx.moveTo(cx - s * 1.4, cy + s * .4); ctx.lineTo(cx + s * 1.4, cy - s * .4); }
    else if (type === 'courbe') { if (fermee) ctx.ellipse(cx, cy, s * 1.3, s * .8, .3, 0, 7); else { ctx.moveTo(cx - s * 1.4, cy); ctx.bezierCurveTo(cx - s * .6, cy - s * 1.4, cx + s * .2, cy + s * 1.4, cx + s * 1.4, cy - s * .2); } }
    else { const p = fermee ? [[-1.3, .6], [-.4, -.9], [.5, .1], [1.3, -.7], [1, .9]] : [[-1.4, .6], [-.7, -.6], [0, .6], [.7, -.6], [1.4, .6]]; p.forEach(([x, y], k) => k ? ctx.lineTo(cx + x * s, cy + y * s) : ctx.moveTo(cx + x * s, cy + y * s)); if (fermee) ctx.closePath(); }
    ctx.stroke();
  };
}
/* Pictures made of shapes. */
const DESSINS = [
  { nom: 'une maison', formes: [['carre', 0, .5, 1], ['triangle', 0, -.65, 1]] },
  { nom: 'un château', formes: [['rectangle', 0, .55, 1], ['carre', -1.1, -.25, .55], ['carre', 1.1, -.25, .55], ['triangle', -1.1, -.95, .55], ['triangle', 1.1, -.95, .55]] },
  { nom: 'une fusée', formes: [['rectangle', 0, .2, 1, Math.PI / 2], ['triangle', 0, -1.25, .6], ['triangle', -.8, 1.05, .45], ['triangle', .8, 1.05, .45], ['cercle', 0, 0, .3]] },
  { nom: 'un bonhomme', formes: [['cercle', 0, -1, .5], ['rectangle', 0, .3, .7, Math.PI / 2], ['rectangle', -.85, .1, .3], ['rectangle', .85, .1, .3]] },
  { nom: 'un camion', formes: [['rectangle', -.4, 0, .8], ['carre', 1.15, .15, .5], ['cercle', -1, .8, .3], ['cercle', 1, .8, .3]] },
  { nom: 'un sapin', formes: [['triangle', 0, -.75, .7], ['triangle', 0, 0, .9], ['rectangle', 0, .95, .3, Math.PI / 2]] }
];
function image(d) {
  return (ctx, cx, cy, taille) => d.formes.forEach(([f, x, y, e, rot], k) => figure(f, rot || 0, COUL_FIG[k % COUL_FIG.length], e)(ctx, cx + x * taille * .3, cy + y * taille * .3, taille));
}
const compter = formes => { const c = {}; formes.forEach(([f]) => { c[f] = (c[f] || 0) + 1; }); return c; };
const texteCompte = c => Object.entries(c).map(([f, n]) => n + ' ' + FIG[f].nom + (n > 1 ? 's' : '')).join(', ');
/* Symmetry: a figure and a line; is it an axis? */
const AXES = [
  { f: 'carre', rot: 0, axes: [[0, 1, true], [1, 0, true], [1, 1, true], [1, .4, false], [-1, .4, false]] },
  { f: 'rectangle', rot: 0, axes: [[0, 1, true], [1, 0, true], [1.5, .8, false], [-1.5, .8, false]] },
  { f: 'triangle', rot: 0, axes: [[0, 1, true], [1, 0, false], [1, .6, false], [-1, .6, false]] },
  { f: 'losange', rot: 0, axes: [[0, 1, true], [1, 0, true], [1, 1, false], [-1, 1, false]] },
  { f: 'hexagone', rot: 0, axes: [[1, 0, true], [0, 1, true], [1, .25, false], [-1, 1, false]] },
  { f: 'coeur', axes: [[0, 1, true], [1, 0, false], [1, 1, false]] }
];
function coeur(ctx, cx, cy, r, coul) { ctx.beginPath(); ctx.moveTo(cx, cy + r); ctx.bezierCurveTo(cx - r * 1.6, cy, cx - r * .9, cy - r * 1.3, cx, cy - r * .45); ctx.bezierCurveTo(cx + r * .9, cy - r * 1.3, cx + r * 1.6, cy, cx, cy + r); ctx.fillStyle = coul; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 3; ctx.stroke(); }
function avecAxes(a, liste, lettres) {
  return (ctx, cx, cy) => {
    if (a.f === 'coeur') coeur(ctx, cx, cy + 10, 85, '#ef8fa8'); else figure(a.f, a.rot, '#9cc3ef', a.f === 'rectangle' ? .9 : 1.15)(ctx, cx, cy, 360);
    const couls = ['#d64545', '#2a6fd1', '#2b8a4f'];
    liste.forEach(([dx, dy], k) => {
      const n = Math.hypot(dx, dy), L = 140; ctx.setLineDash([10, 7]); ctx.lineWidth = 4; ctx.strokeStyle = lettres ? couls[k] : '#d64545';
      ctx.beginPath(); ctx.moveTo(cx - dx / n * L, cy - dy / n * L); ctx.lineTo(cx + dx / n * L, cy + dy / n * L); ctx.stroke(); ctx.setLineDash([]);
      if (lettres) texte(ctx, 'ABC'[k], cx + dx / n * (L + 16), cy + dy / n * (L + 16), 22, couls[k]);
    });
  };
}
/* Mirror pictures on a 6 × 6 grid: the left half is given. */
function grilleSym(cases, cote, montrerDroite, petit) {
  return (ctx, cx, cy, taille) => {
    const n = 6, c = petit ? taille / 7 : 34, x0 = cx - n * c / 2, y0 = cy - n * c / 2;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const plein = cases.has(x + ',' + y) && (montrerDroite || x < 3);
      ctx.fillStyle = plein ? cote : '#fff'; ctx.fillRect(x0 + x * c, y0 + y * c, c, c);
      ctx.strokeStyle = '#c6d2de'; ctx.lineWidth = 1; ctx.strokeRect(x0 + x * c, y0 + y * c, c, c);
    }
    ctx.setLineDash([8, 6]); ctx.strokeStyle = '#d64545'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, y0 - 8); ctx.lineTo(cx, y0 + n * c + 8); ctx.stroke(); ctx.setLineDash([]);
  };
}

const figuresPlanes = quiz({
  id: 'figures', titre: 'Figures planes et symétrie', icone: '🔺', couleur: '#d0602b', palier: 'debutant', fond: '#fbf5f0',
  resume: 'Nomme les figures, compte leurs côtés, reconnais les lignes et trouve les axes de symétrie.',
  aide: 'Lis la question en haut, regarde le dessin, puis clique sur la bonne réponse.',
  niveaux: [
    { titre: 'Le nom des figures', description: '5 questions · carré, triangle, cercle…', gen() {
      const k = pioche(CLES_FIG), r = melanger(k, CLES_FIG.filter(x => x !== k));
      return { texte: 'Comment s’appelle cette figure ?', dessin: figure(k, Math.random() < .5 ? 0 : hasard(-3, 3) / 10, pioche(COUL_FIG)), choix: r.choix.map(x => ({ t: FIG[x].nom })), bon: r.bon, bravo: 'C’est un ' + FIG[k].nom + '.' };
    } },
    { titre: 'Les figures pareilles', description: '5 questions · même sorte, autre taille ou position', gen() {
      const k = pioche(CLES_FIG.filter(x => x !== 'cercle')), autres = CLES_FIG.filter(x => x !== k && !(k === 'carre' && x === 'losange') && !(k === 'losange' && x === 'carre'));
      const r = melanger(k, autres);
      return { texte: 'Trouve une figure de la même sorte : un autre ' + FIG[k].nom + '.', dessin: figure(k, 0, '#9cc3ef'), choix: r.choix.map(x => ({ d: figure(x, x === k ? hasard(2, 6) / 10 : hasard(-3, 3) / 10, pioche(COUL_FIG), x === k ? .7 : 1) })), bon: r.bon, aide: 'Compte les côtés de la figure en haut.', bravo: 'Même sorte de figure, même s’il est tourné ou plus petit.' };
    } },
    { titre: 'Côtés et sommets', description: '5 questions · compter', gen() {
      const k = pioche(CLES_FIG.filter(x => x !== 'cercle')), som = Math.random() < .5, v = FIG[k].cotes, r = choixNombres(v, [1, -1, 2]);
      return { texte: som ? 'Combien de sommets (coins) a ce ' + FIG[k].nom + ' ?' : 'Combien de côtés a ce ' + FIG[k].nom + ' ?', dessin: figure(k, 0, pioche(COUL_FIG)), ...r, aide: 'Pose ton doigt sur chaque ' + (som ? 'coin' : 'côté') + ' et compte.', bravo: 'Le ' + FIG[k].nom + ' a ' + v + (som ? ' sommets.' : ' côtés.') };
    } },
    { titre: 'Les lignes', description: '5 questions · droite, courbe, brisée, ouverte, fermée', gen() {
      const type = pioche(['droite', 'courbe', 'brisee']), fermee = type !== 'droite' && Math.random() < .5;
      if (type !== 'droite' && Math.random() < .5) {
        const rep = ['ouverte', 'fermée'];
        return { texte: 'Cette ligne est-elle ouverte ou fermée ?', dessin: ligne(type, fermee), choix: rep.map(x => ({ t: 'Ligne ' + x })), bon: fermee ? 1 : 0, aide: 'Une ligne fermée revient à son point de départ.', bravo: fermee ? 'Elle revient à son départ : elle est fermée.' : 'Ses deux bouts ne se touchent pas : elle est ouverte.' };
      }
      const rep = ['droite', 'courbe', 'brisee'], noms = { droite: 'Ligne droite', courbe: 'Ligne courbe', brisee: 'Ligne brisée' };
      return { texte: 'Quelle sorte de ligne est-ce ?', dessin: ligne(type, fermee), choix: rep.map(x => ({ t: noms[x] })), bon: rep.indexOf(type), aide: 'Une ligne brisée est faite de petits segments droits.', bravo: noms[type] + '.' };
    } },
    { titre: 'Le dessin en figures', description: '5 questions · quelles figures forment le dessin ?', gen() {
      const d = pioche(DESSINS), c = compter(d.formes), bonne = texteCompte(c);
      const fausses = new Set();
      for (let k = 0; k < 30 && fausses.size < 2; k++) {
        const m = Object.assign({}, c), f = pioche(Object.keys(m));
        if (Math.random() < .5) m[f] = m[f] + (Math.random() < .5 || m[f] === 1 ? 1 : -1); else { const g = pioche(CLES_FIG.filter(x => x !== f && !m[x])); m[g] = m[f]; delete m[f]; }
        const t = texteCompte(m); if (t !== bonne) fausses.add(t);
      }
      const r = melanger(bonne, [...fausses]);
      return { texte: 'Quelles figures ont servi à dessiner ' + d.nom + ' ?', dessin: (ctx, x, y) => image(d)(ctx, x, y + 10, 220), choix: r.choix.map(t => ({ t })), bon: r.bon, aide: 'Compte chaque sorte de figure dans le dessin.', bravo: bonne + '.' };
    } },
    { titre: 'Axe de symétrie : oui ou non ?', description: '5 questions · la ligne coupe-t-elle la figure en deux moitiés pareilles ?', gen() {
      const a = pioche(AXES), ax = pioche(a.axes);
      return { texte: 'La ligne rouge est-elle un axe de symétrie ?', dessin: avecAxes(a, [ax], false), choix: [{ t: 'Oui' }, { t: 'Non' }], bon: ax[2] ? 0 : 1, aide: 'Imagine que tu plies le dessin sur la ligne : les deux moitiés se touchent-elles parfaitement ?', bravo: ax[2] ? 'Les deux moitiés sont pareilles.' : 'Les deux moitiés ne sont pas pareilles.' };
    } },
    { titre: 'Trouve l’axe', description: '5 questions · une seule ligne est un axe de symétrie', gen() {
      const a = pioche(AXES.filter(x => x.axes.filter(y => !y[2]).length >= 2)), oui = pioche(a.axes.filter(y => y[2])), non = melange(a.axes.filter(y => !y[2])).slice(0, 2);
      const lignes = melange([oui, ...non]);
      return { texte: 'Laquelle de ces lignes est un axe de symétrie ?', dessin: avecAxes(a, lignes, true), choix: ['A', 'B', 'C'].map(t => ({ t: 'Ligne ' + t })), bon: lignes.indexOf(oui), aide: 'Plie le dessin dans ta tête sur chaque ligne.', bravo: 'Sur cette ligne, les deux moitiés sont pareilles.' };
    } },
    { titre: 'Complète la symétrie', description: '5 questions · le dessin miroir', gen() {
      const cases = new Set(), coul = pioche(COUL_FIG);
      while (cases.size < 6) cases.add(hasard(0, 2) + ',' + hasard(0, 5));
      const miroir = new Set(cases); cases.forEach(k => { const [x, y] = k.split(',').map(Number); miroir.add((5 - x) + ',' + y); });
      const copie = new Set(cases); cases.forEach(k => { const [x, y] = k.split(',').map(Number); copie.add((x + 3) + ',' + y); });
      const erreur = new Set(miroir); const droite = [...miroir].filter(k => +k.split(',')[0] >= 3); erreur.delete(pioche(droite));
      for (let k = 0; k < 20; k++) { const c = hasard(3, 5) + ',' + hasard(0, 5); if (!erreur.has(c)) { erreur.add(c); break; } }
      const opts = [miroir, copie, erreur], ordre = melange([0, 1, 2]);
      const same = [...copie].every(k => miroir.has(k)) && copie.size === miroir.size;
      return { texte: 'Quel dessin est symétrique par rapport à la ligne rouge ?', dessin: grilleSym(miroir, coul, false), choix: ordre.map(i => ({ d: grilleSym(i === 1 && same ? erreur : opts[i], coul, true, true) })), bon: ordre.indexOf(0), aide: 'De chaque côté de la ligne, les cases colorées doivent être à la même distance de la ligne.', bravo: 'C’est le dessin miroir.' };
    } }
  ]
});

return [solides, figuresPlanes];
});
