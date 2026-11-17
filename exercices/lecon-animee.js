/* Animated lesson: drawings that appear step by step, each sentence read aloud by the device voice
   (the same voice as the 🔊 button). Replaces a video for an activity that has `animee: 'id'`.
   Usage: LeconAnimee.monter(container, 'fractions') */
(function () {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const VERT = '#168575', VIOLET = '#6654a8', ROUGE = '#b94336', GRIS = '#dce7ef', ENCRE = '#23465d';

/* ---------- small SVG drawing helpers (return markup strings) ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const txt = (x, y, t, o) => { o = o || {}; return `<text x="${x}" y="${y}" text-anchor="${o.ancre || 'middle'}" font-size="${o.taille || 26}" font-weight="${o.gras === false ? 400 : 800}" fill="${o.couleur || ENCRE}"${o.cls ? ` class="${o.cls}"` : ''}>${esc(t)}</text>`; };
/* bar cut in n equal parts; pris = number of coloured parts; compte = parts highlighted with their number */
function barre(x, y, w, h, n, pris, coul, compte, cls) {
  let s = `<g${cls ? ` class="${cls}"` : ''}>`; const p = w / n;
  for (let i = 0; i < n; i++) {
    s += `<rect x="${x + i * p}" y="${y}" width="${p}" height="${h}" fill="${i < pris ? coul : '#e7f1f8'}" stroke="${ENCRE}" stroke-width="3"/>`;
    if (compte && i < compte) s += txt(x + i * p + p / 2, y + h / 2 + 11, String(i + 1), { taille: 30, couleur: i < pris ? '#fff' : VIOLET, cls: 'apparait' });
  }
  return s + '</g>';
}
/* unequal bar (for "parts pas égales") */
function barreInegale(x, y, h, largeurs) { let s = '', cx = x; largeurs.forEach(l => { s += `<rect x="${cx}" y="${y}" width="${l}" height="${h}" fill="#e7f1f8" stroke="${ENCRE}" stroke-width="3"/>`; cx += l; }); return s; }
/* circle cut in n parts, pris coloured */
function cercle(cx, cy, r, n, pris, coul) {
  let s = '';
  if(n===1)return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${pris?coul:'#e7f1f8'}" stroke="${ENCRE}" stroke-width="3"/>`;
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    s += `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${n === 1 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${i < pris ? coul : '#e7f1f8'}" stroke="${ENCRE}" stroke-width="3"/>`;
  }
  return s;
}
/* stacked fraction with a bar; hautCoul / basCoul colour the numbers; labels on the right */
function frac(x, y, num, den, o) {
  o = o || {}; const t = o.taille || 64, l = t * .75;
  let s = txt(x, y, num, { taille: t, couleur: o.hautCoul || ENCRE, cls: o.clsHaut });
  s += `<line x1="${x - l / 2}" y1="${y + t * .22}" x2="${x + l / 2}" y2="${y + t * .22}" stroke="${ENCRE}" stroke-width="${t / 14}" stroke-linecap="round"/>`;
  s += txt(x, y + t * 1.05, den, { taille: t, couleur: o.basCoul || ENCRE, cls: o.clsBas });
  if (o.etiqHaut) s += `<g class="apparait">${txt(x + l / 2 + 22, y - t * .3, '← ' + o.etiqHaut, { ancre: 'start', taille: 24, couleur: o.hautCoul || VERT })}</g>`;
  if (o.etiqBas) s += `<g class="apparait">${txt(x + l / 2 + 22, y + t * .78, '← ' + o.etiqBas, { ancre: 'start', taille: 24, couleur: o.basCoul || VIOLET })}</g>`;
  return s;
}
const bille = (x, y, c) => `<g><circle cx="${x}" cy="${y}" r="22" fill="${c}" stroke="${ENCRE}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="21" fill="url(#mr-gloss)"/><ellipse cx="${x-6}" cy="${y-8}" rx="8" ry="4" fill="white" opacity=".35"/></g>`;

/* ---------- the lessons: each step has a subtitle and phrases {dit (spoken), ecrit (shown), scene (svg)} ---------- */
const LECONS = {
fractions: { titre: 'Les fractions', etapes: [
  { sous: 'Une fraction', phrases: [
    { dit: 'Une fraction, c’est une partie d’un tout.', scene: () => cercle(400, 190, 120, 4, 0, VERT) },
    { dit: 'Le tout est partagé en parts égales.', scene: () => cercle(400, 190, 120, 4, 0, VERT) + txt(400, 360, 'parts égales', { couleur: VERT, cls: 'apparait' }) },
    { dit: 'On prend une ou plusieurs parts.', scene: () => cercle(400, 190, 120, 4, 3, VERT) }] },
  { sous: 'Des parts égales ?', phrases: [
    { dit: 'Ici, les 4 parts ont la même taille. Ce sont des parts égales.', scene: () => barre(90, 120, 260, 80, 4, 0, VERT) + txt(220, 250, '✓ Parts égales', { couleur: VERT }) },
    { dit: 'Ici, les parts n’ont pas la même taille. Ce ne sont pas des parts égales.', scene: () => barre(90, 120, 260, 80, 4, 0, VERT) + txt(220, 250, '✓ Parts égales', { couleur: VERT }) + `<g class="apparait">${barreInegale(450, 120, 80, [40, 80, 30, 110])}${txt(580, 250, '✗ Parts pas égales', { couleur: ROUGE })}</g>` },
    { dit: 'Pour une fraction, il faut toujours des parts égales.', scene: () => barre(90, 120, 260, 80, 4, 0, VERT) + txt(220, 250, '✓ Parts égales', { couleur: VERT }) + barreInegale(450, 120, 80, [40, 80, 30, 110]) + txt(580, 250, '✗ Parts pas égales', { couleur: ROUGE }) }] },
  { sous: 'Le nombre du bas : le dénominateur', phrases: [
    { dit: 'Voici une barre partagée en parts égales.', scene: () => barre(60, 150, 400, 100, 4, 0, VERT) },
    { dit: 'Je compte toutes les parts : 1, 2, 3, 4.', ecrit: 'Je compte toutes les parts : 1, 2, 3, 4.', scene: () => barre(60, 150, 400, 100, 4, 0, VERT, 4) },
    { dit: 'Il y a 4 parts en tout. J’écris 4 en bas.', scene: () => barre(60, 150, 400, 100, 4, 0, VERT, 4) + `<g class="apparait">${frac(530, 150, '', '4', { basCoul: VIOLET })}</g>` },
    { dit: 'Le nombre du bas s’appelle le dénominateur.', ecrit: 'Le nombre du bas : le DÉNOMINATEUR.', scene: () => barre(60, 150, 400, 100, 4, 0, VERT, 4) + frac(530, 150, '', '4', { basCoul: VIOLET, etiqBas: 'dénominateur' }) },
    { dit: 'Le dénominateur dit en combien de parts égales on partage.', scene: () => barre(60, 150, 400, 100, 4, 0, VERT, 4) + frac(530, 150, '', '4', { basCoul: VIOLET, etiqBas: 'dénominateur' }) }] },
  { sous: 'Le nombre du haut : le numérateur', phrases: [
    { dit: 'Maintenant, je colorie des parts : 1, 2, 3.', scene: () => barre(60, 150, 400, 100, 4, 3, VERT) + frac(530, 150, '', '4', { basCoul: VIOLET }) },
    { dit: 'J’ai pris 3 parts. J’écris 3 en haut.', scene: () => barre(60, 150, 400, 100, 4, 3, VERT) + frac(530, 150, '3', '4', { hautCoul: VERT, basCoul: VIOLET, clsHaut: 'apparait' }) },
    { dit: 'Le nombre du haut s’appelle le numérateur.', ecrit: 'Le nombre du haut : le NUMÉRATEUR.', scene: () => barre(60, 150, 400, 100, 4, 3, VERT) + frac(530, 150, '3', '4', { hautCoul: VERT, basCoul: VIOLET, etiqHaut: 'numérateur' }) },
    { dit: 'Le numérateur dit combien de parts on prend.', scene: () => barre(60, 150, 400, 100, 4, 3, VERT) + frac(530, 150, '3', '4', { hautCoul: VERT, basCoul: VIOLET, etiqHaut: 'numérateur', etiqBas: 'dénominateur' }) }] },
  { sous: 'Lire une fraction', phrases: [
    { dit: '3 parts sur 4 parts égales. On lit : trois quarts.', ecrit: '3 parts sur 4 : trois quarts.', scene: () => barre(60, 150, 400, 100, 4, 3, VERT) + frac(530, 150, '3', '4', { hautCoul: VERT, basCoul: VIOLET, etiqHaut: 'parts prises', etiqBas: 'parts en tout' }) },
    { dit: 'Le dénominateur donne le nom de la part. 2 parts : un demi.', ecrit: '2 parts : un demi', scene: () => barre(60, 150, 400, 100, 2, 1, VERT) + frac(530, 150, '1', '2', { hautCoul: VERT, basCoul: VIOLET }) },
    { dit: '3 parts : un tiers.', scene: () => barre(60, 150, 400, 100, 3, 1, VERT) + frac(530, 150, '1', '3', { hautCoul: VERT, basCoul: VIOLET }) },
    { dit: '4 parts : un quart.', scene: () => barre(60, 150, 400, 100, 4, 1, VERT) + frac(530, 150, '1', '4', { hautCoul: VERT, basCoul: VIOLET }) }] },
  { sous: 'Une fraction d’un ensemble', phrases: [
    { dit: 'Voici 5 billes. Le dénominateur est 5 : il y a 5 billes en tout.', scene: () => [0, 1, 2, 3, 4].map(i => bille(220 + i * 80, 150, GRIS)).join('') + frac(400, 255, '', '5', { taille: 54, basCoul: VIOLET }) },
    { dit: '2 billes sont rouges. Le numérateur est 2.', scene: () => [0, 1, 2, 3, 4].map(i => bille(220 + i * 80, 150, i < 2 ? ROUGE : GRIS)).join('') + frac(400, 255, '2', '5', { taille: 54, hautCoul: ROUGE, basCoul: VIOLET, clsHaut: 'apparait' }) },
    { dit: '2 billes rouges sur 5 : deux cinquièmes.', scene: () => [0, 1, 2, 3, 4].map(i => bille(220 + i * 80, 150, i < 2 ? ROUGE : GRIS)).join('') + frac(400, 255, '2', '5', { taille: 54, hautCoul: ROUGE, basCoul: VIOLET }) }] },
  { sous: 'Comparer des fractions', phrases: [
    { dit: 'Un demi et un quart. Les deux barres ont la même longueur.', scene: () => frac(80, 95, '1', '2', { taille: 40 }) + barre(130, 80, 420, 60, 2, 1, VERT) + frac(80, 225, '1', '4', { taille: 40 }) + barre(130, 210, 420, 60, 4, 1, VIOLET) },
    { dit: 'Un demi est plus grand qu’un quart.', scene: () => frac(80, 95, '1', '2', { taille: 40 }) + barre(130, 80, 420, 60, 2, 1, VERT) + frac(80, 225, '1', '4', { taille: 40 }) + barre(130, 210, 420, 60, 4, 1, VIOLET) + txt(400, 330, '1 demi > 1 quart', { couleur: VERT, cls: 'apparait' }) },
    { dit: 'Pour un même tout, plus le dénominateur est grand, plus les parts sont petites.', scene: () => frac(80, 95, '1', '2', { taille: 40 }) + barre(130, 80, 420, 60, 2, 1, VERT) + frac(80, 225, '1', '4', { taille: 40 }) + barre(130, 210, 420, 60, 4, 1, VIOLET) + txt(400, 330, '1 demi > 1 quart', { couleur: VERT }) }] },
  { sous: 'Des fractions équivalentes', phrases: [
    { dit: 'Un demi et deux quarts.', scene: () => frac(80, 95, '1', '2', { taille: 40 }) + barre(130, 80, 420, 60, 2, 1, VERT) + frac(80, 225, '2', '4', { taille: 40 }) + barre(130, 210, 420, 60, 4, 2, VIOLET) },
    { dit: 'La partie coloriée est pareille. Un demi égale deux quarts.', scene: () => frac(80, 95, '1', '2', { taille: 40 }) + barre(130, 80, 420, 60, 2, 1, VERT) + frac(80, 225, '2', '4', { taille: 40 }) + barre(130, 210, 420, 60, 4, 2, VIOLET) + `<line x1="340" y1="60" x2="340" y2="290" stroke="${ROUGE}" stroke-width="4" stroke-dasharray="10 8" class="apparait"/>` + txt(400, 340, '1 demi = 2 quarts', { couleur: VERT, cls: 'apparait' }) }] },
  { sous: 'Une fraction d’un nombre : un quart de 12', phrases: [
    { dit: 'Voici 12 jetons. Je veux un quart de 12.', scene: () => Array.from({ length: 12 }, (_, i) => bille(130 + i * 49, 170, '#3b82d6')).join('') },
    { dit: 'Un quart : le dénominateur est 4. Je partage les 12 jetons en 4 groupes égaux.', scene: () => [0, 1, 2, 3].map(g => `<rect x="${45 + g * 185}" y="125" width="165" height="90" rx="14" fill="#f4f8fb" stroke="${ENCRE}" stroke-width="3" class="apparait"/>` + [0, 1, 2].map(j => bille(85 + g * 185 + j * 43, 170, '#3b82d6')).join('')).join('') + frac(400, 300, '1', '4', { taille: 44, basCoul: VIOLET }) },
    { dit: 'Dans un groupe, il y a 3 jetons. Un quart de 12, c’est 3.', ecrit: 'Un quart de 12, c’est 3.', scene: () => [0, 1, 2, 3].map(g => `<rect x="${45 + g * 185}" y="125" width="165" height="90" rx="14" fill="${g === 0 ? '#e6f6ef' : '#f4f8fb'}" stroke="${g === 0 ? VERT : ENCRE}" stroke-width="${g === 0 ? 6 : 3}"/>` + [0, 1, 2].map(j => bille(85 + g * 185 + j * 43, 170, '#3b82d6')).join('')).join('') + txt(400, 320, '12 ÷ 4 = 3', { taille: 34, couleur: VERT, cls: 'apparait' }) }] },
  { sous: 'À retenir', phrases: [
    { dit: 'En haut, le numérateur : les parts que l’on prend. En bas, le dénominateur : les parts égales en tout.', ecrit: 'En haut : le numérateur. En bas : le dénominateur.', scene: () => barre(60, 150, 400, 100, 4, 3, VERT) + frac(530, 150, '3', '4', { hautCoul: VERT, basCoul: VIOLET, etiqHaut: 'numérateur', etiqBas: 'dénominateur' }) }] }
] }
};


/* ---------- drawing helpers for the number lessons (return SVG markup strings) ---------- */
const JAUNE = '#f2b134', BLEU = '#3b82d6', VERTC = '#d8f3e6', BLEUC = '#e6f0fb';
const ap = s => `<g class="apparait">${s}</g>`;
/* base-ten blocks, flat and clear: unit 22 px, rod 22 x 220, plate 110 x 110, big cube */
const cubeU = (x, y, c) => `<rect x="${x}" y="${y}" width="20" height="20" rx="2" fill="${c || JAUNE}" stroke="${ENCRE}" stroke-width="2"/>`;
function barreD(x, y, c) { let s = `<rect x="${x}" y="${y}" width="22" height="200" rx="2" fill="${c || VERT}" stroke="${ENCRE}" stroke-width="2"/>`; for (let k = 1; k < 10; k++) s += `<line x1="${x}" y1="${y + k * 20}" x2="${x + 22}" y2="${y + k * 20}" stroke="${ENCRE}" stroke-width="1" opacity=".55"/>`; return s; }
function plaqueC(x, y, c) { let s = `<rect x="${x}" y="${y}" width="110" height="110" rx="2" fill="${c || BLEU}" stroke="${ENCRE}" stroke-width="2"/>`; for (let k = 1; k < 10; k++) s += `<line x1="${x + k * 11}" y1="${y}" x2="${x + k * 11}" y2="${y + 110}" stroke="${ENCRE}" stroke-width=".8" opacity=".5"/><line x1="${x}" y1="${y + k * 11}" x2="${x + 110}" y2="${y + k * 11}" stroke="${ENCRE}" stroke-width=".8" opacity=".5"/>`; return s; }
function grosM(x, y) { const a = 100, z = 30; let s = `<path d="M${x} ${y + z} l${z} -${z} h${a} l-${z} ${z} Z" fill="#c9b6f2" stroke="${ENCRE}" stroke-width="2"/><path d="M${x + a} ${y + z} l${z} -${z} v${a} l-${z} ${z} Z" fill="#7d5cc6" stroke="${ENCRE}" stroke-width="2"/><rect x="${x}" y="${y + z}" width="${a}" height="${a}" fill="#a68ae0" stroke="${ENCRE}" stroke-width="2"/>`; for (let k = 1; k < 10; k++) s += `<line x1="${x + k * 10}" y1="${y + z}" x2="${x + k * 10}" y2="${y + z + a}" stroke="${ENCRE}" stroke-width=".6" opacity=".5"/><line x1="${x}" y1="${y + z + k * 10}" x2="${x + a}" y2="${y + z + k * 10}" stroke="${ENCRE}" stroke-width=".6" opacity=".5"/>`; return s; }
/* a row of blocks: m big cubes, c plates, d rods, u units, starting at x; labels under each group when asked */
function blocs(o, x0, y0, etiq) {
  let s = '', x = x0 || 40; const y = y0 || 90;
  for (let k = 0; k < (o.m || 0); k++) { s += grosM(x, y); x += 150; }
  if (o.m) x += 10;
  for (let k = 0; k < (o.c || 0); k++) { s += plaqueC(x, y + 40 + (k % 2) * 0, BLEU); if (etiq) s += txt(x + 55, y + 185, String((k + 1) * 100 + (o.m || 0) * 1000), { taille: 20, couleur: BLEU }); x += 120; }
  if (o.c) x += 10;
  const base = (o.m || 0) * 1000 + (o.c || 0) * 100;
  for (let k = 0; k < (o.d || 0); k++) { s += barreD(x, y); if (etiq && (base < 100 || k === o.d - 1)) s += txt(x + 11, y + 230, String(base + (k + 1) * 10), { taille: 18, couleur: VERT }); /* big numbers: only the last rod is labelled, so labels do not overlap */ x += o.serre ? 26 : 30; }
  if (o.d) x += 14;
  for (let k = 0; k < (o.u || 0); k++) { s += cubeU(x + (k % 5) * 24, y + 180 - Math.floor(k / 5) * 24); }
  if (etiq && o.u) s += txt(x + Math.min(o.u, 5) * 12, y + 230, String(base + (o.d || 0) * 10 + o.u), { taille: 18, couleur: '#a8761b' });
  return s;
}
/* place-value table: columns like ['M','C','D','U'], values, highlighted column */
function tableau(cols, vals, x, y, surligne) {
  const w = 110, noms = { M: 'Milliers', C: 'Centaines', D: 'Dizaines', U: 'Unités' }, coul = { M: '#7d5cc6', C: BLEU, D: VERT, U: '#c58a16' };
  let s = ''; x = x == null ? 400 - cols.length * w / 2 : x; y = y || 110;
  cols.forEach((c, k) => {
    const xx = x + k * w, on = surligne === k;
    s += `<rect x="${xx}" y="${y}" width="${w}" height="50" fill="${coul[c]}" stroke="${ENCRE}" stroke-width="2"/>` + txt(xx + w / 2, y + 33, noms[c], { taille: 17, couleur: '#fff' });
    s += `<rect x="${xx}" y="${y + 50}" width="${w}" height="90" fill="${on ? '#fff4d6' : '#fff'}" stroke="${on ? JAUNE : ENCRE}" stroke-width="${on ? 5 : 2}"/>`;
    if (vals && vals[k] !== undefined && vals[k] !== '') s += txt(xx + w / 2, y + 115, String(vals[k]), { taille: 52, couleur: coul[c] });
  });
  return s;
}
/* number tiles in a row; '?' is drawn as a yellow empty tile */
function tuiles(l, y, fleche) {
  const w = Math.max(96, ...l.map(v => String(v).length * 24 + 30)), x0 = 400 - l.length * (w + 14) / 2; /* tiles grow with long text */ let s = '';
  l.forEach((v, k) => { const x = x0 + k * (w + 14), q = v === '?'; s += `<rect x="${x}" y="${y}" width="${w}" height="80" rx="12" fill="${q ? '#fff4d6' : '#fff'}" stroke="${q ? JAUNE : ENCRE}" stroke-width="3"/>` + txt(x + w / 2, y + 54, String(v), { taille: 36, couleur: q ? '#a8761b' : ENCRE }); });
  if (fleche) s += `<line x1="${x0}" y1="${y + 112}" x2="${x0 + l.length * (w + 14) - 14}" y2="${y + 112}" stroke="${VERT}" stroke-width="4" marker-end="url(#mr-fl)"/>` + txt(400, y + 150, fleche, { taille: 22, couleur: VERT });
  return s;
}
/* number line from a to b with marks every pas; point p; jumps [from,to] drawn as arcs */
function ligne(a, b, pas, p, sauts, etiqTous) {
  const X = v => 60 + (v - a) * 680 / (b - a); let s = `<line x1="40" y1="230" x2="760" y2="230" stroke="${ENCRE}" stroke-width="4"/>`;
  for (let v = a; v <= b; v += pas) { const grand = (v - a) % (pas * 5) === 0 || etiqTous; s += `<line x1="${X(v)}" y1="${grand ? 212 : 220}" x2="${X(v)}" y2="${grand ? 248 : 240}" stroke="${ENCRE}" stroke-width="${grand ? 3 : 2}"/>`; if (grand || v === b) s += txt(X(v), 280, String(v), { taille: 22 }); }
  (sauts || []).forEach(([u, v], k) => { const x1 = X(u), x2 = X(v), m = (x1 + x2) / 2; s += `<path d="M${x1} 222 Q${m} ${170} ${x2} 222" fill="none" stroke="${VIOLET}" stroke-width="3" class="apparait" style="animation-delay:${k * .25}s"/>`; });
  if (p != null) s += `<circle cx="${X(p)}" cy="230" r="13" fill="${ROUGE}" stroke="${ENCRE}" stroke-width="2"/>` + txt(X(p), 195, String(p), { taille: 26, couleur: ROUGE });
  return s;
}
/* tokens: n tokens in g equal groups (boxes); reste tokens left aside */
function groupes(n, g, reste, enLigne) {
  let s = ''; const par = Math.floor(n / g), w = Math.min(170, 700 / g - 14), x0 = 400 - g * (w + 14) / 2;
  for (let k = 0; k < g; k++) { const x = x0 + k * (w + 14); s += `<rect x="${x}" y="110" width="${w}" height="140" rx="16" fill="#f4f8fb" stroke="${ENCRE}" stroke-width="3"/>`; const cols = Math.max(1, Math.floor((w - 10) / 40)); for (let j = 0; j < par; j++) s += bille(x + 26 + (j % cols) * 40, 145 + Math.floor(j / cols) * 44, BLEU); }
  for (let j = 0; j < (reste || 0); j++) s += bille(330 + j * 50, 310, ROUGE);
  return s;
}
const rangee = (n, c, y) => Array.from({ length: n }, (_, k) => bille(400 + (k - (n - 1) / 2) * 52, y || 180, c || BLEU)).join('');
/* points in pairs (even/odd) */
function paires(n) { let s = ''; const p = Math.ceil(n / 2), x0 = 400 - p * 60 / 2; for (let k = 0; k < n; k++) { const col = Math.floor(k / 2), row = k % 2; s += bille(x0 + 30 + col * 60, 150 + row * 60, k === n - 1 && n % 2 ? ROUGE : BLEU); } for (let k = 0; k < Math.floor(n / 2); k++) s += `<rect x="${x0 + 6 + k * 60}" y="122" width="48" height="116" rx="22" fill="none" stroke="${VERT}" stroke-width="3" class="apparait"/>`; return s; }
/* grid of points r rows x c cols */
const grille = (r, c, x0, y0, coul) => { let s = ''; x0 = x0 == null ? 400 - (c - 1) * 26 : x0; y0 = y0 || 110; for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) s += `<circle cx="${x0 + j * 52}" cy="${y0 + i * 52}" r="19" fill="${coul || BLEU}" stroke="${ENCRE}" stroke-width="2"/>`; return s; };
const triangle = n => { let s = ''; for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) s += `<circle cx="${400 + (j - i / 2) * 52}" cy="${100 + i * 52}" r="19" fill="${VERT}" stroke="${ENCRE}" stroke-width="2"/>`; return s; };
/* balance: left text, right text, tilt (-1 left down, 0 level, 1 right down) */
function balance(g, d, pente, signe) {
  const t = (pente || 0) * 14; let s = `<polygon points="400,330 370,380 430,380" fill="${ENCRE}"/><line x1="400" y1="330" x2="400" y2="150" stroke="${ENCRE}" stroke-width="6"/>`;
  s += `<g transform="rotate(${t} 400 150)"><line x1="160" y1="150" x2="640" y2="150" stroke="${ENCRE}" stroke-width="6" stroke-linecap="round"/><path d="M110 150 h200 l-25 70 h-150 Z" fill="${BLEUC}" stroke="${ENCRE}" stroke-width="3"/><path d="M490 150 h200 l-25 70 h-150 Z" fill="${VERTC}" stroke="${ENCRE}" stroke-width="3"/>`;
  s += txt(210, 200, g, { taille: 34 }) + txt(590, 200, d, { taille: 34 }) + '</g>';
  if (signe) s += txt(400, 120, signe, { taille: 46, couleur: signe === '=' ? VERT : ROUGE, cls: 'apparait' });
  return s;
}
/* column calculation: a op b, with optional regroup mark (above tens), result digits shown so far, highlighted column */
function colonnes(a, op, b, o) {
  o = o || {}; const A = String(a).padStart(3, ' '), B = String(b).padStart(3, ' '), x0 = 300, w = 70, y = 70; let s = '';
  ['C', 'D', 'U'].forEach((c, k) => { const on = o.col === k; s += `<rect x="${x0 + k * w}" y="${y}" width="${w}" height="250" fill="${on ? '#fff4d6' : 'none'}" stroke="${on ? JAUNE : '#c9d8e2'}" stroke-width="${on ? 4 : 1.5}"/>` + txt(x0 + k * w + w / 2, y + 26, c, { taille: 20, couleur: '#7a8b97' }); });
  [...A].forEach((ch, k) => { if (ch !== ' ') s += txt(x0 + k * w + w / 2, y + 110, (o.barre && o.barre[k]) ? ch : ch, { taille: 48, couleur: o.barre && o.barre[k] ? '#9aa9b3' : ENCRE }); });
  if (o.barre) o.barre.forEach((v, k) => { if (v != null) s += `<line x1="${x0 + k * w + 18}" y1="${y + 108}" x2="${x0 + k * w + 52}" y2="${y + 80}" stroke="${ROUGE}" stroke-width="4"/>` + txt(x0 + k * w + w / 2, y + 62, String(v), { taille: 26, couleur: ROUGE, cls: 'apparait' }); });
  if (o.regroupe) o.regroupe.forEach((v, k) => { if (v) s += txt(x0 + k * w + w / 2, y + 62, '1', { taille: 28, couleur: ROUGE, cls: 'apparait' }); });
  s += txt(x0 - 30, y + 170, op, { taille: 48 }); [...B].forEach((ch, k) => { if (ch !== ' ') s += txt(x0 + k * w + w / 2, y + 170, ch, { taille: 48 }); });
  s += `<line x1="${x0 - 50}" y1="${y + 190}" x2="${x0 + 3 * w}" y2="${y + 190}" stroke="${ENCRE}" stroke-width="4"/>`;
  if (o.res) [...String(o.res).padStart(3, ' ')].forEach((ch, k) => { if (ch !== ' ' && ch !== '_') s += txt(x0 + k * w + w / 2, y + 240, ch, { taille: 48, couleur: VERT }); });
  return s;
}
/* coordinate plane from -5 to 5; points [x,y,label]; path drawn through pts when relier */
function plan(pts, o) {
  o = o || {}; const P = 32, cx = 400, cy = 200, X = v => cx + v * P, Y = v => cy - v * P; let s = '';
  for (let k = -5; k <= 5; k++) s += `<line x1="${X(k)}" y1="${Y(5.5)}" x2="${X(k)}" y2="${Y(-5.5)}" stroke="#d3e0e8"/><line x1="${X(-5.5)}" y1="${Y(k)}" x2="${X(5.5)}" y2="${Y(k)}" stroke="#d3e0e8"/>`;
  s += `<line x1="${X(-5.8)}" y1="${cy}" x2="${X(5.8)}" y2="${cy}" stroke="${ENCRE}" stroke-width="3"/><line x1="${cx}" y1="${Y(-5.8)}" x2="${cx}" y2="${Y(5.8)}" stroke="${ENCRE}" stroke-width="3"/>` + txt(X(6.2), cy + 8, 'x', { taille: 24, couleur: BLEU }) + txt(cx + 18, Y(5.4), 'y', { taille: 24, couleur: VERT });
  for (let k = -5; k <= 5; k++) if (k) s += txt(X(k), cy + 22, String(k), { taille: 13, gras: false }) + txt(cx - 14, Y(k) + 5, String(k), { taille: 13, gras: false });
  s += txt(cx - 12, cy + 20, '0', { taille: 14 });
  if (o.relier && pts.length > 1) s += `<polygon points="${pts.map(p => X(p[0]) + ',' + Y(p[1])).join(' ')}" fill="#e6f6ef" stroke="${VERT}" stroke-width="4" class="apparait"/>`;
  if (o.chemin) { const [x, y] = o.chemin; s += `<g class="apparait"><line x1="${cx}" y1="${cy}" x2="${X(x)}" y2="${cy}" stroke="${BLEU}" stroke-width="6" marker-end="url(#mr-fl)"/><line x1="${X(x)}" y1="${cy}" x2="${X(x)}" y2="${Y(y)}" stroke="${VERT}" stroke-width="6" marker-end="url(#mr-fl)"/></g>`; }
  pts.forEach(p => { s += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="9" fill="${ROUGE}" stroke="${ENCRE}" stroke-width="2"/>`; if (p[2]) s += txt(X(p[0]) + (p[0] < 0 ? -12 : 12), Y(p[1]) + (p[1] <= 0 ? 30 : -14), p[2], { taille: 18, couleur: ROUGE, ancre: p[0] < 0 ? 'end' : 'start' }); });
  return s;
}
const etiquette = (x, y, t, c) => txt(x, y, t, { taille: 30, couleur: c || VERT, cls: 'apparait' });
const P = (dit, scene, ecrit) => ({ dit, scene, ecrit });
const E = (sous, ...phrases) => ({ sous, phrases });

Object.assign(LECONS, {
dizaines: { titre: 'Les dizaines', etapes: [
  E('Le cube et la barre',
    P('Voici un petit cube. Il vaut 1.', () => cubeU(390, 180), '1 cube = 1'),
    P('Je mets 10 cubes en ligne : 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.', () => Array.from({ length: 10 }, (_, k) => cubeU(150 + k * 50, 180)).join('') + Array.from({ length: 10 }, (_, k) => txt(160 + k * 50, 240, String(k + 1), { taille: 18 })).join(''), '10 cubes'),
    P('10 cubes ensemble font une barre. Une barre, c’est une dizaine. Elle vaut 10.', () => barreD(389, 90) + etiquette(400, 340, '1 barre = 10'), '1 barre = 1 dizaine = 10')),
  E('Compter les barres',
    P('Je compte les barres de 10 en 10 : 10, 20, 30.', () => blocs({ d: 3 }, 330, 70, true), '10, 20, 30'),
    P('3 barres, c’est 3 dizaines. 3 dizaines égalent 30.', () => blocs({ d: 3 }, 330, 70, true) + etiquette(400, 360, '3 dizaines = 30'), '3 dizaines = 30')),
  E('Des barres et des cubes',
    P('Voici 3 barres et 4 cubes. D’abord les barres : 10, 20, 30.', () => blocs({ d: 3, u: 4 }, 280, 70), '10, 20, 30…'),
    P('Puis les cubes, un par un : 31, 32, 33, 34.', () => blocs({ d: 3, u: 4 }, 280, 70, true), '… 31, 32, 33, 34'),
    P('3 dizaines et 4 unités : j’écris 34.', () => blocs({ d: 3, u: 4 }, 280, 70) + etiquette(400, 360, '3 dizaines + 4 unités = 34'), '34')),
  E('10 de plus',
    P('J’ajoute une barre. 34 devient 44. 10 de plus, c’est une barre de plus.', () => blocs({ d: 4, u: 4 }, 265, 70) + etiquette(400, 360, '34 + 10 = 44'), '34 + 10 = 44')),
  E('À retenir',
    P('Une barre vaut 10. Je compte les barres de 10 en 10, puis les cubes un par un.', () => blocs({ d: 2, u: 3 }, 320, 70, true), '1 barre = 10. Barres d’abord, cubes ensuite.'))
] },

centaines: { titre: 'Les centaines', etapes: [
  E('La barre et la plaque',
    P('Une barre vaut 10.', () => barreD(389, 90), '1 barre = 10'),
    P('Je mets 10 barres côte à côte : 10, 20, 30… jusqu’à 100.', () => Array.from({ length: 10 }, (_, k) => barreD(250 + k * 30, 80)).join('') + txt(400, 330, '10 barres', { taille: 26 }), '10 barres = 100'),
    P('10 barres font une plaque. Une plaque, c’est une centaine. Elle vaut 100.', () => plaqueC(345, 90) + etiquette(400, 260, '1 plaque = 100'), '1 plaque = 1 centaine = 100')),
  E('Compter les plaques',
    P('Je compte les plaques de 100 en 100 : 100, 200, 300.', () => blocs({ c: 3 }, 220, 40, true), '100, 200, 300'),
    P('3 plaques, c’est 3 centaines. 3 centaines égalent 300.', () => blocs({ c: 3 }, 220, 40, true) + etiquette(400, 340, '3 centaines = 300'), '3 centaines = 300')),
  E('Plaques, barres et cubes',
    P('Voici 2 plaques, 3 barres et 4 cubes. Les plaques : 100, 200.', () => blocs({ c: 2, d: 3, u: 4 }, 150, 70), '100, 200…'),
    P('Les barres : 210, 220, 230. Les cubes : 231, 232, 233, 234.', () => blocs({ c: 2, d: 3, u: 4 }, 150, 70, true), '… 210, 220, 230… 231, 232, 233, 234'),
    P('2 centaines, 3 dizaines, 4 unités : j’écris 234.', () => blocs({ c: 2, d: 3, u: 4 }, 150, 70) + etiquette(400, 360, '234'), '234')),
  E('100 de plus',
    P('J’ajoute une plaque. 234 devient 334.', () => blocs({ c: 3, d: 3, u: 4 }, 90, 70) + etiquette(400, 360, '234 + 100 = 334'), '234 + 100 = 334')),
  E('À retenir',
    P('Une plaque vaut 100. C’est 10 barres. Je compte les plaques de 100 en 100.', () => plaqueC(250, 90) + txt(400, 160, '=', { taille: 50 }) + Array.from({ length: 10 }, (_, k) => barreD(440 + k * 28, 50)).join(''), '1 plaque = 10 barres = 100'))
] },

milliers: { titre: 'Les milliers', etapes: [
  E('La plaque et le gros cube',
    P('Une plaque vaut 100.', () => plaqueC(345, 120), '1 plaque = 100'),
    P('J’empile 10 plaques : 100, 200, 300… jusqu’à 1 000.', () => Array.from({ length: 10 }, (_, k) => `<rect x="${330 + k * 4}" y="${280 - k * 18}" width="130" height="30" rx="3" fill="${BLEU}" stroke="${ENCRE}" stroke-width="2"/>`).join(''), '10 plaques = 1 000'),
    P('10 plaques font un gros cube. Un gros cube, c’est un millier. Il vaut 1 000.', () => grosM(335, 90) + etiquette(400, 320, '1 gros cube = 1 000'), '1 gros cube = 1 millier = 1 000')),
  E('Compter les gros cubes',
    P('Je compte les gros cubes de 1 000 en 1 000 : 1 000, 2 000, 3 000.', () => [0, 1, 2].map(k => grosM(160 + k * 170, 90) + txt(225 + k * 170, 300, (k + 1) + ' 000', { taille: 24, couleur: VIOLET })).join(''), '1 000, 2 000, 3 000'),
    P('3 gros cubes, c’est 3 milliers. 3 milliers égalent 3 000.', () => [0, 1, 2].map(k => grosM(160 + k * 170, 90)).join('') + etiquette(400, 330, '3 milliers = 3 000'), '3 milliers = 3 000')),
  E('Le tableau M C D U',
    P('Dans le tableau, chaque chiffre a sa case. M pour les milliers, C pour les centaines, D pour les dizaines, U pour les unités.', () => tableau(['M', 'C', 'D', 'U'], ['', '', '', '']), 'M · C · D · U'),
    P('2 milliers, 3 centaines, 4 dizaines et 5 unités. J’écris un chiffre dans chaque case.', () => tableau(['M', 'C', 'D', 'U'], [2, 3, 4, 5]), '2 · 3 · 4 · 5'),
    P('Je lis : deux mille trois cent quarante-cinq.', () => tableau(['M', 'C', 'D', 'U'], [2, 3, 4, 5]) + etiquette(400, 320, '2 345'), '2 345')),
  E('1 000 de plus',
    P('J’ajoute un gros cube : un millier de plus. 2 345 devient 3 345.', () => tableau(['M', 'C', 'D', 'U'], [3, 3, 4, 5], null, 110, 0) + etiquette(400, 320, '2 345 + 1 000 = 3 345'), '2 345 + 1 000 = 3 345')),
  E('À retenir',
    P('Un gros cube vaut 1 000. C’est 10 plaques.', () => grosM(220, 100) + txt(400, 190, '=', { taille: 50 }) + Array.from({ length: 10 }, (_, k) => `<rect x="${450 + k * 3}" y="${260 - k * 16}" width="120" height="26" rx="3" fill="${BLEU}" stroke="${ENCRE}" stroke-width="2"/>`).join(''), '1 gros cube = 10 plaques = 1 000'))
] },

valeur: { titre: 'Unités, dizaines, centaines', etapes: [
  E('Trois sortes de blocs',
    P('Un cube, c’est une unité : 1. Une barre, c’est une dizaine : 10. Une plaque, c’est une centaine : 100.', () => cubeU(160, 220) + txt(170, 300, '1', { taille: 30, couleur: '#a8761b' }) + barreD(359, 70) + txt(370, 300, '10', { taille: 30, couleur: VERT }) + plaqueC(530, 140) + txt(585, 300, '100', { taille: 30, couleur: BLEU }), '1 · 10 · 100')),
  E('Compter les blocs',
    P('2 plaques, 4 barres et 6 cubes. Je compte : 100, 200… 210, 220, 230, 240… 241, 242, 243, 244, 245, 246.', () => blocs({ c: 2, d: 4, u: 6 }, 130, 70, true), '246')),
  E('Le tableau',
    P('Je range chaque chiffre dans sa case : 2 centaines, 4 dizaines, 6 unités.', () => tableau(['C', 'D', 'U'], [2, 4, 6]), '2 centaines · 4 dizaines · 6 unités'),
    P('Attention au zéro. 3 plaques et 5 cubes, mais pas de barre. J’écris 0 dans la case des dizaines : 305.', () => tableau(['C', 'D', 'U'], [3, 0, 5], null, 110, 1), '305 : 0 dizaine')),
  E('La valeur d’un chiffre',
    P('Dans 246, le 4 est dans la case des dizaines. Il vaut 40.', () => tableau(['C', 'D', 'U'], [2, 4, 6], null, 110, 1) + etiquette(400, 320, '4 dizaines = 40'), 'Le 4 vaut 40'),
    P('Le même chiffre ne vaut pas pareil selon sa place. 444, c’est 400, plus 40, plus 4.', () => tableau(['C', 'D', 'U'], [4, 4, 4]) + etiquette(400, 320, '444 = 400 + 40 + 4'), '444 = 400 + 40 + 4')),
  E('Regrouper : 10 pour 1',
    P('10 cubes, je les regroupe en 1 barre. 10 barres, je les regroupe en 1 plaque.', () => Array.from({ length: 10 }, (_, k) => cubeU(60 + (k % 5) * 24, 150 + Math.floor(k / 5) * 24)).join('') + txt(220, 175, '→', { taille: 40 }) + barreD(260, 80) + Array.from({ length: 10 }, (_, k) => barreD(380 + k * 22, 80, VERT)).join('') + txt(640, 175, '→', { taille: 40 }) + plaqueC(670, 120), '10 cubes → 1 barre · 10 barres → 1 plaque')),
  E('À retenir',
    P('La place du chiffre donne sa valeur.', () => tableau(['C', 'D', 'U'], [3, 5, 7]) + txt(400, 330, '300 + 50 + 7', { taille: 30, couleur: VERT }), 'La place du chiffre donne sa valeur.'))
] },

composer: { titre: 'Composer et décomposer', etapes: [
  E('Composer',
    P('3 centaines, 4 dizaines et 5 unités.', () => blocs({ c: 3, d: 4, u: 5 }, 90, 70), '3 centaines · 4 dizaines · 5 unités'),
    P('J’écris 3, puis 4, puis 5. Ça fait 345.', () => tableau(['C', 'D', 'U'], [3, 4, 5]) + etiquette(400, 320, '345'), '345')),
  E('Dans le désordre',
    P('5 unités, 3 centaines et 4 dizaines. Je range d’abord : les centaines, les dizaines, puis les unités. C’est encore 345.', () => tuiles(['5 U', '3 C', '4 D'], 80) + txt(400, 210, '↓', { taille: 40 }) + tuiles(['3 C', '4 D', '5 U'], 240), '5 U, 3 C, 4 D → 345')),
  E('Décomposer',
    P('Décomposer, c’est faire le contraire. 345, c’est 300, plus 40, plus 5.', () => tableau(['C', 'D', 'U'], [3, 4, 5]) + etiquette(400, 320, '345 = 300 + 40 + 5'), '345 = 300 + 40 + 5'),
    P('Il manque une partie ? 345 égale 300, plus quoi, plus 5. Le 4 est aux dizaines : il manque 40.', () => tuiles([300, '+', '?', '+', 5], 120) + etiquette(400, 300, '? = 40'), '345 = 300 + ? + 5 → 40')),
  E('Une autre façon',
    P('Une plaque, c’est 10 barres. Je peux la regrouper autrement. 345, c’est aussi 2 centaines, 14 dizaines et 5 unités.', () => blocs({ c: 2, d: 14, u: 5, serre: true }, 20, 70), '345 = 2 centaines + 14 dizaines + 5 unités')),
  E('Combien de dizaines en tout ?',
    P('Dans 340, combien de dizaines ? 3 centaines font 30 dizaines. Plus 4 dizaines : 34 dizaines.', () => tableau(['C', 'D', 'U'], [3, 4, 0]) + `<rect x="235" y="150" width="220" height="110" fill="none" stroke="${ROUGE}" stroke-width="5" rx="10" class="apparait"/>` + etiquette(400, 320, '340 = 34 dizaines'), '340 = 34 dizaines')),
  E('À retenir',
    P('Composer : des parties donnent un nombre. Décomposer : un nombre donne des parties.', () => tuiles([300, 40, 5], 80) + txt(400, 210, '⇅', { taille: 44, couleur: VERT }) + tuiles([345], 240), 'Parties → nombre · nombre → parties'))
] },

egal: { titre: 'Un nombre, plusieurs façons', etapes: [
  E('Le signe =',
    P('Le signe égal veut dire : la même valeur des deux côtés. Comme une balance bien droite.', () => balance('2 + 3', '5', 0, '='), '= : la même valeur des deux côtés'),
    P('2 plus 3 font 5. De l’autre côté, il y a 5. C’est pareil.', () => balance('2 + 3', '5', 0, '='), '2 + 3 = 5')),
  E('Plusieurs façons',
    P('5, c’est 4 plus 1. C’est aussi 3 plus 2. Un nombre, plusieurs façons.', () => tuiles(['4 + 1', '3 + 2', '5 + 0'], 90) + etiquette(400, 280, 'Tous font 5'), '5 = 4 + 1 = 3 + 2')),
  E('Compléter l’égalité',
    P('2 plus 3 égale 1 plus quoi ?', () => balance('2 + 3', '1 + ?', 0), '2 + 3 = 1 + ?'),
    P('À gauche, 2 plus 3 font 5. À droite, il faut aussi 5. 1 plus 4 font 5. Donc il manque 4.', () => balance('2 + 3', '1 + 4', 0, '='), '? = 4')),
  E('Vrai ou faux ?',
    P('3 plus 3 égale 2 plus 5 ? À gauche : 6. À droite : 7. Ce n’est pas pareil. C’est faux.', () => balance('3 + 3', '2 + 5', 1, '≠'), '6 et 7 : faux')),
  E('Avec la soustraction',
    P('9 moins 3 égale 8 moins quoi ? À gauche : 6. 8 moins 2 font 6. Donc il manque 2.', () => balance('9 − 3', '8 − 2', 0, '='), '9 − 3 = 8 − 2')),
  E('À retenir',
    P('Je calcule chaque côté. S’ils ont la même valeur, je peux écrire le signe égal.', () => balance('4 + 4', '6 + 2', 0, '='), 'Je calcule chaque côté.'))
] },

comparer: { titre: 'Comparer et ordonner', etapes: [
  E('Qui est le plus grand ?',
    P('Je compare 34 et 52. Je regarde d’abord les dizaines : 3 barres et 5 barres.', () => blocs({ d: 3, u: 4 }, 70, 70) + blocs({ d: 5, u: 2 }, 430, 70) + txt(170, 360, '34', { taille: 36 }) + txt(560, 360, '52', { taille: 36 }), '34 et 52 : les dizaines d’abord'),
    P('5 dizaines, c’est plus que 3 dizaines. 52 est le plus grand.', () => blocs({ d: 3, u: 4 }, 70, 70) + blocs({ d: 5, u: 2 }, 430, 70) + txt(170, 360, '34', { taille: 36 }) + txt(560, 360, '52', { taille: 36, couleur: VERT }), '52 est le plus grand')),
  E('Les signes < et >',
    P('Le signe s’ouvre vers le plus grand. La pointe montre le plus petit : 34 est plus petit que 52.', () => txt(400, 220, '34  <  52', { taille: 80 }) + etiquette(400, 320, '34 < 52'), '34 < 52'),
    P('Mêmes dizaines ? Je compare les unités. 47 et 43 : 7 unités, c’est plus que 3. 47 est plus grand que 43.', () => txt(400, 220, '47  >  43', { taille: 80 }), '47 > 43'),
    P('Avec des centaines, je commence par les centaines. 512 et 498 : 5 centaines, c’est plus que 4.', () => tableau(['C', 'D', 'U'], [5, 1, 2], 210, 60, 0) + tableau(['C', 'D', 'U'], [4, 9, 8], 210, 220, 0), '512 > 498')),
  E('Ranger les nombres',
    P('L’ordre croissant va du plus petit au plus grand : 18, 25, 41, 63.', () => tuiles([18, 25, 41, 63], 110, 'croissant'), '18 < 25 < 41 < 63'),
    P('L’ordre décroissant va du plus grand au plus petit : 63, 41, 25, 18.', () => tuiles([63, 41, 25, 18], 110, 'décroissant'), '63 > 41 > 25 > 18')),
  E('À retenir',
    P('Je compare d’abord le chiffre de gauche. La pointe du signe montre le plus petit.', () => txt(400, 220, '34  <  52', { taille: 80 }), 'Le chiffre de gauche d’abord.'))
] },

situer: { titre: 'Situer un nombre', etapes: [
  E('Entre deux nombres',
    P('Sur la droite, les nombres sont rangés dans l’ordre. 6 est entre 5 et 7.', () => ligne(0, 10, 1, 6, null, true), '6 est entre 5 et 7')),
  E('Entre deux dizaines',
    P('57 est entre 50 et 60.', () => ligne(50, 60, 1, 57, null, true), '50 < 57 < 60'),
    P('347 est entre 300 et 400.', () => ligne(300, 400, 10, 347), '300 < 347 < 400')),
  E('Le nombre qui manque',
    P('Dans la liste 12, 13, quoi, 15 : il manque 14.', () => tuiles([12, 13, '?', 15], 110) + etiquette(400, 300, '? = 14'), '12, 13, 14, 15')),
  E('Le plus proche',
    P('68 est entre 60 et 70. Jusqu’à 70, il y a 2 pas. Jusqu’à 60, il y a 8 pas.', () => ligne(60, 70, 1, 68, [[68, 69], [69, 70]], true), '68 → 70 : 2 pas'),
    P('68 est plus proche de 70.', () => ligne(60, 70, 1, 68, [[68, 69], [69, 70]], true) + etiquette(400, 350, '68 est plus proche de 70'), '68 est plus proche de 70')),
  E('À retenir',
    P('Je regarde où se place le nombre sur la droite : ce qui vient avant, ce qui vient après.', () => ligne(0, 10, 1, 4, null, true), 'Avant · le nombre · après'))
] },

sortes: { titre: 'Sortes de nombres', etapes: [
  E('Pair ou impair',
    P('Je fais des paires. 6 points : chaque point a un ami. 6 est pair.', () => paires(6), '6 est pair'),
    P('7 points : un point reste tout seul. 7 est impair.', () => paires(7), '7 est impair'),
    P('Pour un grand nombre, je regarde le chiffre des unités. S’il finit par 0, 2, 4, 6 ou 8, il est pair.', () => tuiles([0, 2, 4, 6, 8], 100) + etiquette(400, 290, '…finit par 0, 2, 4, 6, 8 → pair'), '0, 2, 4, 6, 8 → pair')),
  E('Les nombres carrés',
    P('9 points forment un carré : 3 rangées de 3. 9 est un nombre carré.', () => grille(3, 3, null, 120), '3 × 3 = 9 : carré')),
  E('Les nombres triangulaires',
    P('6 points forment un triangle : 1, puis 2, puis 3. 6 est un nombre triangulaire.', () => triangle(3), '1 + 2 + 3 = 6 : triangulaire')),
  E('Premier ou composé',
    P('12 points : je peux faire des rangées égales, 3 rangées de 4. 12 est un nombre composé.', () => grille(3, 4, null, 120), '12 = 3 rangées de 4 : composé'),
    P('7 points : une seule rangée possible, 1 rangée de 7. 7 est un nombre premier.', () => grille(1, 7, null, 180, VERT), '7 : seulement 1 rangée de 7 : premier')),
  E('À retenir',
    P('Pair : tout le monde a un ami. Carré : un carré de points. Premier : une seule rangée possible.', () => paires(4) , 'Pair · carré · triangulaire · premier · composé'))
] },

proprietes: { titre: 'Propriétés des nombres', etapes: [
  E('Avant, après',
    P('Juste après 8, c’est 9 : j’ajoute 1. Juste avant 8, c’est 7 : j’enlève 1.', () => tuiles([7, 8, 9], 110) + txt(290, 230, '− 1', { taille: 26, couleur: ROUGE }) + txt(510, 230, '+ 1', { taille: 26, couleur: VERT }), '7 ← 8 → 9')),
  E('L’ordre ne change rien',
    P('7 plus 5 donne 12. 5 plus 7 donne aussi 12.', () => rangee(7, BLEU, 140) + rangee(5, VERT, 220) + etiquette(400, 320, '7 + 5 = 5 + 7 = 12'), '7 + 5 = 5 + 7'),
    P('Pareil pour la multiplication. 3 rangées de 4 ou 4 rangées de 3 : 12 points.', () => grille(3, 4, 150, 120) + grille(4, 3, 500, 100, VERT), '3 × 4 = 4 × 3 = 12')),
  E('Regrouper autrement',
    P('2 plus 3, puis plus 4. Ou bien 2, plus 3 plus 4. Le total est toujours 9.', () => txt(400, 160, '(2 + 3) + 4 = 9', { taille: 48 }) + txt(400, 260, '2 + (3 + 4) = 9', { taille: 48, couleur: VERT }), '(2 + 3) + 4 = 2 + (3 + 4)')),
  E('Les nombres 0 et 1',
    P('Plus 0 ne change rien : 6 plus 0 égale 6. Fois 1 ne change rien : 6 fois 1 égale 6. Fois 0 donne toujours 0.', () => txt(400, 130, '6 + 0 = 6', { taille: 46 }) + txt(400, 210, '6 × 1 = 6', { taille: 46 }) + txt(400, 290, '6 × 0 = 0', { taille: 46, couleur: ROUGE }), '+ 0 et × 1 : rien ne change. × 0 : 0')),
  E('Pair ou impair ?',
    P('Pair plus pair donne pair : 2 plus 4 font 6. Impair plus impair donne pair : 3 plus 5 font 8. Pair plus impair donne impair : 2 plus 3 font 5.', () => txt(400, 130, '2 + 4 = 6  pair', { taille: 40 }) + txt(400, 210, '3 + 5 = 8  pair', { taille: 40 }) + txt(400, 290, '2 + 3 = 5  impair', { taille: 40, couleur: ROUGE }), 'pair + pair = pair · impair + impair = pair · pair + impair = impair')),
  E('À retenir',
    P('L’ordre ne change rien. Plus 0 et fois 1 ne changent rien.', () => txt(400, 170, '7 + 5 = 5 + 7', { taille: 50 }) + txt(400, 260, '6 + 0 = 6', { taille: 50, couleur: VERT }), 'L’ordre ne change rien.'))
] },

completer: { titre: 'Compléter des opérations', etapes: [
  E('L’addition à compléter',
    P('7 plus quoi égale 12 ? Il manque un nombre.', () => tuiles([7, '+', '?', '=', 12], 120), '7 + ? = 12'),
    P('Je pars de 7 et j’avance jusqu’à 12 : 8, 9, 10, 11, 12. J’ai fait 5 pas.', () => ligne(5, 13, 1, null, [[7, 8], [8, 9], [9, 10], [10, 11], [11, 12]], true), '5 pas'),
    P('Donc 7 plus 5 égale 12.', () => tuiles([7, '+', 5, '=', 12], 120), '7 + 5 = 12')),
  E('La soustraction à compléter',
    P('15 moins quoi égale 9 ? Je pars de 15 et je recule jusqu’à 9 : 6 pas. Donc 15 moins 6 égale 9.', () => ligne(8, 16, 1, null, [[15, 14], [14, 13], [13, 12], [12, 11], [11, 10], [10, 9]], true), '15 − 6 = 9')),
  E('Avec des dizaines',
    P('40 plus quoi égale 70 ? 4 dizaines plus quoi égale 7 dizaines ? Il manque 3 dizaines : 30.', () => blocs({ d: 4 }, 200, 70) + blocs({ d: 3 }, 380, 70).replace(new RegExp(VERT, 'g'), JAUNE) + etiquette(400, 350, '40 + 30 = 70'), '40 + 30 = 70')),
  E('Compléter à 100',
    P('37 plus quoi égale 100 ? 37 plus 3 font 40. Puis 40 plus 60 font 100. 3 plus 60 font 63.', () => ligne(30, 100, 10, 37, [[37, 40], [40, 100]], true) + txt(150, 150, '+ 3', { taille: 24, couleur: VIOLET }) + txt(450, 150, '+ 60', { taille: 24, couleur: VIOLET }), '37 + 63 = 100')),
  E('À retenir',
    P('Pour trouver le nombre qui manque, je compte les pas entre les deux nombres.', () => ligne(5, 13, 1, null, [[7, 8], [8, 9], [9, 10], [10, 11], [11, 12]], true), 'Je compte les pas.'))
] },

division: { titre: 'La division', etapes: [
  E('Partager en parts égales',
    P('12 divisé par 3 : je partage 12 jetons en 3 groupes égaux.', () => rangee(12, BLEU, 180), '12 ÷ 3'),
    P('Chaque groupe a 4 jetons. 12 divisé par 3 égale 4.', () => groupes(12, 3) + etiquette(400, 320, '12 ÷ 3 = 4'), '12 ÷ 3 = 4')),
  E('Faire des groupes égaux',
    P('12 divisé par 3, c’est aussi : combien de groupes de 3 dans 12 ? Il y a 4 groupes.', () => groupes(12, 4) + etiquette(400, 320, '4 groupes de 3'), '4 groupes de 3')),
  E('Division et multiplication',
    P('4 fois 3 égale 12. Donc 12 divisé par 3 égale 4. La table de multiplication m’aide.', () => txt(400, 160, '4 × 3 = 12', { taille: 54 }) + txt(400, 260, '12 ÷ 3 = 4', { taille: 54, couleur: VERT }), '4 × 3 = 12 → 12 ÷ 3 = 4')),
  E('Division avec un reste',
    P('17 divisé par 5 : 3 groupes de 5 font 15. Il reste 2 jetons.', () => groupes(15, 3, 2) + etiquette(400, 375, '17 ÷ 5 = 3, reste 2'), '17 ÷ 5 = 3, reste 2')),
  E('Des dizaines',
    P('80 divisé par 4 : 8 dizaines divisées par 4 font 2 dizaines. 80 divisé par 4 égale 20.', () => blocs({ d: 8 }, 280, 60) + etiquette(400, 340, '8 dizaines ÷ 4 = 2 dizaines = 20'), '80 ÷ 4 = 20')),
  E('À retenir',
    P('Diviser, c’est partager en groupes égaux. La multiplication m’aide à trouver la réponse.', () => groupes(12, 3), 'Diviser = partager en groupes égaux.'))
] },

partage: { titre: 'Partager équitablement', etapes: [
  E('Partager',
    P('J’ai 12 jetons à partager entre 3 amis.', () => rangee(12, BLEU, 160) + txt(400, 290, '🧒   👧   🧒', { taille: 44 }), '12 jetons, 3 amis'),
    P('Je donne un jeton à chacun, chacun son tour.', () => groupes(3, 3) + rangee(9, BLEU, 320).replace(/r="22"/g, 'r="16"'), 'Un pour chacun…'),
    P('Je continue jusqu’à ce qu’il n’en reste plus.', () => groupes(12, 3), '… jusqu’à la fin'),
    P('Chaque ami a 4 jetons. C’est juste : les parts sont égales. 12 divisé par 3 égale 4.', () => groupes(12, 3) + etiquette(400, 320, '12 ÷ 3 = 4'), '12 ÷ 3 = 4')),
  E('Quand il en reste',
    P('14 jetons pour 3 amis : chacun en a 4, et il reste 2 jetons. On ne peut pas les partager également.', () => groupes(12, 3, 2), '14 ÷ 3 = 4, reste 2')),
  E('À retenir',
    P('Partager équitablement, c’est donner la même quantité à chacun.', () => groupes(8, 2), 'La même quantité pour chacun.'))
] },

regrouper: { titre: 'Additionner et soustraire en regroupant', etapes: [
  E('Additionner en colonnes',
    P('27 plus 15. Je place les nombres en colonnes : les unités sous les unités, les dizaines sous les dizaines.', () => colonnes(27, '+', 15), '27 + 15'),
    P('Je commence par les unités : 7 plus 5 font 12.', () => colonnes(27, '+', 15, { col: 2 }), '7 + 5 = 12 unités'),
    P('12 unités : je regroupe 10 unités en 1 dizaine. J’écris 2 aux unités, et 1 en haut des dizaines.', () => colonnes(27, '+', 15, { col: 2, regroupe: [0, 1, 0], res: '  2' }), 'Je regroupe 10 unités en 1 dizaine'),
    P('Les dizaines : 1 plus 2 plus 1 font 4. La réponse est 42.', () => colonnes(27, '+', 15, { col: 1, regroupe: [0, 1, 0], res: ' 42' }), '27 + 15 = 42')),
  E('Soustraire en colonnes',
    P('42 moins 15. Les unités : 2 moins 5, je ne peux pas.', () => colonnes(42, '−', 15, { col: 2 }), '2 − 5 : je ne peux pas'),
    P('Je regroupe autrement : 1 dizaine devient 10 unités. 4 dizaines deviennent 3, et 2 unités deviennent 12.', () => colonnes(42, '−', 15, { col: 2, barre: [null, 3, 12] }), '1 dizaine → 10 unités'),
    P('12 moins 5 font 7. Puis 3 moins 1 font 2. La réponse est 27.', () => colonnes(42, '−', 15, { col: 1, barre: [null, 3, 12], res: ' 27' }), '42 − 15 = 27')),
  E('À retenir',
    P('Je commence toujours par les unités. 10 unités se regroupent en 1 dizaine, et 1 dizaine se regroupe en 10 unités.', () => colonnes(27, '+', 15, { regroupe: [0, 1, 0], res: ' 42' }), 'Les unités d’abord. Je regroupe par 10.'))
] },

plan: { titre: 'Dessiner sur un plan', etapes: [
  E('Le plan',
    P('Le plan a deux axes. L’axe des x est horizontal. L’axe des y est vertical. Ils se croisent à 0.', () => plan([[0, 0]]), 'x : horizontal · y : vertical'),
    P('Un point se lit avec deux nombres : d’abord x, ensuite y.', () => plan([[3, 2, '(3, 2)']]), '(x, y)')),
  E('Placer un point',
    P('Le point 3, 2 : je fais 3 pas vers la droite, puis 2 pas vers le haut.', () => plan([[3, 2, '(3, 2)']], { chemin: [3, 2] }), '(3, 2) : 3 à droite, 2 en haut'),
    P('Le point moins 2, 3 : x est négatif, je vais vers la gauche. 2 pas à gauche, puis 3 pas en haut.', () => plan([[-2, 3, '(−2, 3)']], { chemin: [-2, 3] }), '(−2, 3) : 2 à gauche, 3 en haut'),
    P('Le point moins 3, moins 2 : 3 pas à gauche, puis 2 pas vers le bas.', () => plan([[-3, -2, '(−3, −2)']], { chemin: [-3, -2] }), '(−3, −2) : 3 à gauche, 2 en bas')),
  E('Un point sur un axe',
    P('Le point 4, 0 : 0 pas vertical. Il reste sur l’axe des x.', () => plan([[4, 0, '(4, 0)']], { chemin: [4, 0] }), '(4, 0) : sur l’axe des x')),
  E('Dessiner une forme',
    P('Je place les points dans l’ordre : 1, 1, puis 4, 1, puis 4, 3, puis 1, 3. Je les relie : c’est un rectangle.', () => plan([[1, 1], [4, 1], [4, 3], [1, 3]], { relier: true }), 'Je relie les points dans l’ordre.')),
  E('À retenir',
    P('D’abord x : à droite si positif, à gauche si négatif. Ensuite y : en haut si positif, en bas si négatif.', () => plan([[2, 3, '(2, 3)'], [-3, -1, '(−3, −1)']]), 'D’abord x, ensuite y.'))
] }
});


/* ---------- player ---------- */
function voixFr() {
  let choix; try { choix=localStorage.getItem('mr-voix'); } catch(e) {}
  const disponible = 'speechSynthesis' in window ? speechSynthesis.getVoices() : [];
  if(choix && disponible.some(x=>x.voiceURI===choix && /^fr/i.test(x.lang))) return disponible.find(x=>x.voiceURI===choix && /^fr/i.test(x.lang));
  const v = 'speechSynthesis' in window ? speechSynthesis.getVoices() : [];
  return v.find(x => /^fr/i.test(x.lang) && /google|natural|online|premium|enhanced/i.test(x.name)) || v.find(x => /fr[-_]CA/i.test(x.lang)) || v.find(x => /^fr/i.test(x.lang)) || null;
}
function vitesseVoix(){ try { return Number(localStorage.getItem('mr-debit')) || .85; } catch(e) { return .85; } }
function monter(box, id) {
  const L = LECONS[id]; if (!L) return false;
  const liste = []; L.etapes.forEach((e, k) => e.phrases.forEach((p, j) => liste.push({ k, j, sous: e.sous, p })));
  box.innerHTML = '';
  const racine = document.createElement('div'); racine.className = 'la';
  racine.innerHTML = `<div class="la-titre">${esc(L.titre)}</div><div class="la-meta"><div class="la-sous"></div><span class="la-compteur"></span></div>
    <svg class="la-scene" viewBox="0 0 800 400" role="img"></svg>
    <p class="la-texte" aria-live="polite"></p>
    <div class="la-barre"><div class="la-avance"></div></div>
    <div class="la-options"><label><input type="checkbox" class="la-auto" checked> Enchaîner les explications</label><button type="button" class="la-b la-repeter">Réécouter cette phrase</button><span class="la-etat" role="status"></span></div><div class="la-boutons"><button type="button" class="la-b la-debut" aria-label="Recommencer">↺ Début</button><button type="button" class="la-b la-prec" aria-label="Phrase précédente">← Retour</button><button type="button" class="la-b la-jouer">▶ Écouter la leçon</button><button type="button" class="la-b la-suiv" aria-label="Phrase suivante">Suivant →</button></div>`;
  box.append(racine);
  const q = s => racine.querySelector(s);
  let i = 0, enCours = false, jeton = 0, minuteur = null, phraseSeule = false;
  function montrer() {
    const it = liste[i];
    q('.la-sous').textContent = it.sous; q('.la-compteur').textContent = 'Étape ' + (it.k + 1) + ' / ' + L.etapes.length; q('.la-prec').disabled = i === 0; q('.la-suiv').disabled = i === liste.length - 1;
    q('.la-scene').innerHTML = `<defs><marker id="mr-fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#23465d"/></marker><linearGradient id="mr-gloss" x2="0" y2="1"><stop stop-color="white" stop-opacity=".35"/><stop offset="1" stop-color="#17394a" stop-opacity=".14"/></linearGradient></defs>` + it.p.scene();
    q('.la-scene').setAttribute('aria-label', it.p.ecrit || it.p.dit);
    q('.la-texte').textContent = it.p.ecrit || it.p.dit;
    q('.la-avance').style.width = (100 * (i + 1) / liste.length) + '%';
  }
  function arreter() { enCours = false; jeton++; clearTimeout(minuteur); q('.la-etat').textContent = ''; if ('speechSynthesis' in window) speechSynthesis.cancel(); q('.la-jouer').textContent = i >= liste.length - 1 ? '↻ Réécouter' : '▶ Continuer'; }
  function dire() {
    const t = ++jeton, it = liste[i], dit = it.p.dit;
    const suite = () => { if (t !== jeton || !enCours || !racine.isConnected) return; if (!phraseSeule && q('.la-auto').checked && i < liste.length - 1) { i++; montrer(); minuteur = setTimeout(dire, 500); } else arreter(); };
    const attente = 2200 + dit.length * 90 / vitesseVoix(); // fallback when no voice or no "end" event
    const v = voixFr();
    q('.la-etat').textContent = v ? 'Lecture en cours' : 'Lecture du texte à ton rythme';
    if ('speechSynthesis' in window && v) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(dit.replace(/’/g, "'"));
      if(v) u.voice = v; u.lang = v ? v.lang : 'fr-CA'; u.rate = vitesseVoix();
      u.onend = () => { if(t !== jeton) return; clearTimeout(minuteur); minuteur = setTimeout(suite, 900); }; u.onerror = () => { if(t !== jeton) return; clearTimeout(minuteur); minuteur = setTimeout(suite, attente); };
      speechSynthesis.speak(u);
      minuteur = setTimeout(() => { if(t !== jeton) return; if(speechSynthesis.speaking) { arreter(); q('.la-etat').textContent = 'Lecture interrompue : réécoute la phrase ou avance manuellement.'; } else suite(); }, Math.max(15000, attente * 3));
    } else minuteur = setTimeout(suite, attente);
  }
  q('.la-jouer').onclick = () => { if (enCours) return arreter(); phraseSeule = false; if (i >= liste.length - 1 && q('.la-jouer').textContent.includes('Réécouter')) { i = 0; montrer(); } enCours = true; q('.la-jouer').textContent = '⏸ Pause'; dire(); };
  q('.la-repeter').onclick = () => { arreter(); phraseSeule = true; enCours = true; q('.la-jouer').textContent = '⏸ Pause'; dire(); };
  q('.la-suiv').onclick = () => { const r = enCours; arreter(); if (i < liste.length - 1) i++; montrer(); if (r) { enCours=true; q('.la-jouer').textContent='⏸ Pause'; dire(); } };
  q('.la-prec').onclick = () => { const r = enCours; arreter(); if (i > 0) i--; montrer(); if (r) { enCours=true; q('.la-jouer').textContent='⏸ Pause'; dire(); } };
  q('.la-debut').onclick = () => { arreter(); i = 0; montrer(); q('.la-jouer').textContent = '▶ Écouter la leçon'; };
  /* stop the voice when the box is closed */
  const det = box.closest('details'); if (det) det.addEventListener('toggle', () => { if (!det.open) arreter(); });
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  montrer();
  return true;
}
window.LeconAnimee = { monter, voixFr, vitesseVoix, arreterToutes: () => document.querySelectorAll('.la-jouer').forEach(b => { if (b.textContent.includes('Pause')) b.click(); }), existe: id => !!LECONS[id] };
})();
