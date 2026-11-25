// Découpe les planches de sprites (sprites_raw/<perso>/planche.webp) en un atlas prêt pour le jeu.
//   node tools/import-sprites.mjs            → tous les persos de tools/sprite-sheets.json
//   node tools/import-sprites.mjs mao        → un seul perso
//
// Pour chaque animation, on donne le rectangle de la planche qui contient ses poses.
// L'outil agrandit la zone ×4 (lanczos, débruitage, accentuation), repère les persos avec le détourage IA
// de macOS (Vision, tools/vision-mask.swift) affiné par la couleur du fond, sépare les poses, lisse le contour
// et l'entoure d'un fin trait d'encre, cale chaque pose sur ses pieds, puis range tout dans
// public/characters/<perso>/atlas.png (HD, pour l'écran) et atlas_sd.png (÷4, pour les téléphones).
// Le résultat est écrit dans la section "sprite" de character.json, et l'icône dans icon.png.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { makeMobileAssets } from './make-mobile-assets.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/sprite-sheets.json'), 'utf8'));
const BG_TOLERANCE = 26; // écart de couleur au fond toléré par le remplissage (réglable par planche : "tolerance")
let TOL = BG_TOLERANCE, GROW = true, STEP = 7, BG = null; // réglages de la planche en cours (BG : couleur de fond imposée)
const MIN_PIXELS = 150; // en dessous, un morceau isolé est du bruit
const HOLE_MAX = 90; // trou enfermé dans la silhouette rebouché ; au-delà (entre les jambes…) il reste transparent
const UPSCALE = 4; // les poses sont agrandies ×4 avant détourage (réglable par perso : "upscale", ×2 pour les grandes planches)
let UP = UPSCALE, PAD = UP; // marge entre les poses de l'atlas (multiple de UP : l'atlas léger en est la réduction exacte)
const HI_TOL = 14; // écart au fond toléré à l'intérieur de la zone repérée par Vision (strict : les costumes marine sont proches du fond)
const INK = [14, 14, 24]; // trait de contour ajouté autour des poses
let HTOL = HI_TOL;
let STRONG = 48; // hors zone Vision, un pixel plus éloigné que ça de la couleur du fond est un effet à garder

async function load(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function crop(img, [x0, y0, x1, y1]) {
  const w = x1 - x0, h = y1 - y0;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) img.data.copy(out, y * w * 4, ((y0 + y) * img.w + x0) * 4, ((y0 + y) * img.w + x1) * 4);
  return { data: out, w, h };
}

/**
 * Couleur de fond de la zone : médiane du pourtour, sauf si le pourtour est envahi par des filets
 * lumineux (titres, ligne de sol) ; on prend alors la médiane des pixels les plus sombres de la zone.
 */
function borderColor(img) {
  if (BG) return BG;
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  const lum = (i) => img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11;
  const border = [];
  for (let x = 0; x < img.w; x++) border.push(x * 4, ((img.h - 1) * img.w + x) * 4);
  for (let y = 0; y < img.h; y++) border.push(y * img.w * 4, (y * img.w + img.w - 1) * 4);
  const all = [];
  for (let p = 0; p < img.w * img.h; p += 3) all.push(p * 4);
  all.sort((i, j) => lum(i) - lum(j));
  const darkest = all.slice(0, Math.max(1, Math.round(all.length * 0.35)));
  const darkLum = med(darkest.map(lum));
  const borderLum = med(border.map(lum));
  // pourtour clair (fond blanc ou faux damier) : c'est lui le fond, pas les pixels sombres du perso
  const pick = borderLum > darkLum + 12 && borderLum < 200 ? darkest : border;
  return [0, 1, 2].map((k) => med(pick.map((i) => img.data[i + k])));
}

const near = (img, p, [br, bg, bb], tol) => {
  const i = p * 4, d = img.data;
  return Math.hypot(d[i] - br, d[i + 1] - bg, d[i + 2] - bb) < tol;
};

/**
 * Fond en dégradé (halo, ligne de sol lumineuse) : on part du bord et on avance de proche en proche
 * tant que le pixel reste sombre et proche de son voisin déjà reconnu comme fond.
 */
function growBackground(img, bgc) {
  const n = img.w * img.h, d = img.data;
  const lum = (p) => d[p * 4] * 0.3 + d[p * 4 + 1] * 0.59 + d[p * 4 + 2] * 0.11;
  const bgLum = bgc[0] * 0.3 + bgc[1] * 0.59 + bgc[2] * 0.11;
  const step = (p, q) => Math.hypot(d[p * 4] - d[q * 4], d[p * 4 + 1] - d[q * 4 + 1], d[p * 4 + 2] - d[q * 4 + 2]);
  const bg = new Uint8Array(n);
  const stack = [];
  const seed = (p) => {
    if (!bg[p] && near(img, p, bgc, TOL)) { bg[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < img.w; x++) { seed(x); seed((img.h - 1) * img.w + x); }
  for (let y = 0; y < img.h; y++) { seed(y * img.w); seed(y * img.w + img.w - 1); }
  while (stack.length) {
    const p = stack.pop(), x = p % img.w;
    for (const q of [p - 1, p + 1, p - img.w, p + img.w]) {
      if (q < 0 || q >= n || bg[q] || Math.abs((q % img.w) - x) > 1) continue;
      if (near(img, q, bgc, TOL) || (GROW && lum(q) < bgLum + 38 && step(p, q) < STEP)) {
        bg[q] = 1;
        stack.push(q);
      }
    }
  }
  return bg;
}

/** Dilatation (op = max) ou érosion (op = min) d'un masque, carré de rayon r, en deux passes. */
function morph(mask, w, h, r, grow) {
  const tmp = new Uint8Array(mask.length), out = new Uint8Array(mask.length);
  const pick = grow ? (a, b) => a | b : (a, b) => a & b;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = grow ? 0 : 1;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        v = pick(v, xx < 0 || xx >= w ? (grow ? 0 : 1) : mask[y * w + xx]);
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = grow ? 0 : 1;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        v = pick(v, yy < 0 || yy >= h ? (grow ? 0 : 1) : tmp[yy * w + x]);
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------- détourage HD (Vision + couleur)

let VISION = null;
/** Compile une fois l'outil Vision (Swift) ; sans lui, on détoure à la couleur seule. */
function visionBinary() {
  if (VISION !== null) return VISION;
  const bin = path.join(ROOT, 'tools/.cache/vision-mask'), src = path.join(ROOT, 'tools/vision-mask.swift');
  try {
    if (!fs.existsSync(bin) || fs.statSync(bin).mtimeMs < fs.statSync(src).mtimeMs) {
      fs.mkdirSync(path.dirname(bin), { recursive: true });
      execFileSync('swiftc', ['-O', src, '-o', bin], { stdio: 'ignore' });
    }
    VISION = bin;
  } catch {
    console.warn('Vision indisponible (macOS 14+ et Swift requis) : détourage à la couleur seule');
    VISION = false;
  }
  return VISION;
}

/**
 * Zone de la planche agrandie ×UPSCALE : couleurs nettes (affichage), version douce (pour juger le fond)
 * et masque IA de Vision (mis en cache : il faut ~3 s par zone).
 */
async function hiZone(sheetFile, [x0, y0, x1, y1], cacheKey, alphaFloor = null) {
  const S = UP, w = x1 - x0, h = y1 - y0, W = w * S, H = h * S;
  // Planche à fond transparent (PNG avec alpha) : la transparence fournie fait foi, pas besoin de Vision.
  // On agrandit couleurs et alpha ensemble (sharp prémultiplie : pas de frange noire au bord).
  const alpha = await sheetAlpha(sheetFile);
  if (alpha) {
    const { data } = await sharp(sheetFile).extract({ left: x0, top: y0, width: w, height: h }).ensureAlpha()
      .resize(W, H, { kernel: 'lanczos3' }).sharpen({ sigma: 0.7, m1: 0.4, m2: 1.4 }).raw().toBuffer({ resolveWithObject: true });
    const n = W * H, rgb = Buffer.alloc(n * 3), A = Buffer.alloc(n), top = alpha.top;
    const floor = alphaFloor ?? alpha.floor; // voile plus épais par endroits : seuil imposé par l'animation ("alphaFloor")
    for (let i = 0; i < n; i++) {
      rgb[i * 3] = data[i * 4]; rgb[i * 3 + 1] = data[i * 4 + 1]; rgb[i * 3 + 2] = data[i * 4 + 2];
      A[i] = Math.max(0, Math.min(255, Math.round(((data[i * 4 + 3] - floor) * 255) / (top - floor))));
    }
    return { S, W, H, rgb, soft: rgb, V: null, A };
  }
  const base = () => sharp(sheetFile).extract({ left: x0, top: y0, width: w, height: h }).removeAlpha();
  const rgb = await base().resize(W, H, { kernel: 'lanczos3' }).median(3).sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 }).raw().toBuffer();
  const soft = await base().resize(W, H, { kernel: 'cubic' }).raw().toBuffer();
  let V = null;
  const bin = visionBinary();
  if (bin) {
    const cache = path.join(ROOT, 'tools/.cache/vision', `${cacheKey}_${x0}_${y0}_${x1}_${y1}_${Math.round(fs.statSync(sheetFile).mtimeMs)}.png`);
    if (!fs.existsSync(cache)) {
      fs.mkdirSync(path.dirname(cache), { recursive: true });
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-vision-'));
      const inF = path.join(tmp, 'zone.png');
      await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).png().toFile(inF);
      execFileSync(bin, [inF, cache]);
      fs.rmSync(tmp, { recursive: true, force: true });
    }
    V = await sharp(cache).resize(W, H).toColourspace('b-w').extractChannel(0).raw().toBuffer();
  }
  return { S, W, H, rgb, soft, V };
}

const alphaCache = new Map();
/**
 * Planche à fond transparent ? Si oui, renvoie le plancher d'opacité à retirer : certaines planches ont
 * un voile de bruit faible partout (15-30) ; on prend la médiane de l'opacité des pixels « plutôt
 * transparents », sur toute la planche. Les planches de ChatGPT plafonnent aussi l'opacité vers 232.
 */
async function sheetAlpha(sheetFile) {
  if (!alphaCache.has(sheetFile)) {
    let res = null;
    const meta = await sharp(sheetFile).metadata();
    if (meta.hasAlpha) {
      const a = await sharp(sheetFile).extractChannel(3).raw().toBuffer();
      const low = [];
      for (let i = 0; i < a.length; i += 7) if (a[i] < 128) low.push(a[i]);
      low.sort((p, q) => p - q);
      const floor = Math.min(70, Math.round((low[low.length >> 1] || 0) * 2 + 6));
      let clear = 0;
      for (let i = 0; i < a.length; i += 7) if (a[i] <= floor + 8) clear++;
      if (clear > a.length / 7 / 5) res = { floor, top: 232 };
    }
    alphaCache.set(sheetFile, res);
  }
  return alphaCache.get(sheetFile);
}

/**
 * Masque HD : est fond ce qui est hors de la zone Vision, plus le fond pur (couleur stricte) relié à elle,
 * plus les grandes poches de fond pur enfermées (entre les jambes, sous un bras).
 */
function hiKeep(hz, bgc) {
  const { W, H, soft, V } = hz, n = W * H;
  if (hz.A) return Uint8Array.from(hz.A, (a) => (a >= 40 ? 1 : 0)); // effets translucides (fantômes, halos) compris
  // Fond clair (blanc, ou faux damier gris clair) : on reconnaît un pixel de fond à ce qu'il est quasi blanc et neutre
  const light = bgc[0] * 0.3 + bgc[1] * 0.59 + bgc[2] * 0.11 > 200;
  const span = (i) => Math.max(soft[i * 3], soft[i * 3 + 1], soft[i * 3 + 2]) - Math.min(soft[i * 3], soft[i * 3 + 1], soft[i * 3 + 2]);
  const lo = (i) => Math.min(soft[i * 3], soft[i * 3 + 1], soft[i * 3 + 2]);
  const near = light
    ? (i) => lo(i) >= 230 && span(i) <= 12
    : (i) => Math.hypot(soft[i * 3] - bgc[0], soft[i * 3 + 1] - bgc[1], soft[i * 3 + 2] - bgc[2]) < HTOL;
  const gone = new Uint8Array(n), stack = [];
  const seed = (i) => { if (!gone[i]) { gone[i] = 1; stack.push(i); } };
  // Hors de la zone Vision, on garde quand même ce qui tranche nettement sur le fond : les effets
  // (ondes, drapeaux, étincelles) que l'IA ne compte pas comme « sujet ».
  const strong = light
    ? (i) => !(lo(i) >= 200 && span(i) <= 25)
    : (i) => Math.hypot(soft[i * 3] - bgc[0], soft[i * 3 + 1] - bgc[1], soft[i * 3 + 2] - bgc[2]) > STRONG;
  if (V) for (let i = 0; i < n; i++) if (V[i] < 128 && !strong(i)) seed(i);
  for (let x = 0; x < W; x++) { if (near(x)) seed(x); if (near(n - W + x)) seed(n - W + x); }
  for (let y = 0; y < H; y++) { if (near(y * W)) seed(y * W); if (near(y * W + W - 1)) seed(y * W + W - 1); }
  while (stack.length) {
    const p = stack.pop(), x = p % W;
    for (const q of [p - 1, p + 1, p - W, p + W]) {
      if (q < 0 || q >= n || gone[q] || Math.abs((q % W) - x) > 1) continue;
      if (near(q)) { gone[q] = 1; stack.push(q); }
    }
  }
  const pocket = new Uint8Array(n);
  // poche enfermée : sur fond clair, seul le gris parfaitement neutre du fond compte (pas un reflet blanc bleuté des cheveux)
  const pure = light ? (i) => lo(i) >= 238 && span(i) <= 5 : near;
  for (let i = 0; i < n; i++) pocket[i] = !gone[i] && pure(i) ? 1 : 0;
  for (const c of components(pocket, W, H)) if (c.pixels.length > HOLE_MAX * hz.S * hz.S) for (const p of c.pixels) gone[p] = 1;
  const keep = new Uint8Array(n);
  for (let i = 0; i < n; i++) keep[i] = gone[i] ? 0 : 1;
  return keep;
}

/** Masque de la zone à l'échelle de la planche (pour découper les poses), tiré du masque HD. */
function foregroundHi(img, hz, clearRects = [], origin = [0, 0], lineRects = []) {
  const bgc = borderColor(img);
  const keep = hiKeep(hz, bgc);
  const { S, W } = hz, fg = new Uint8Array(img.w * img.h);
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      let c = 0;
      for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) c += keep[(y * S + dy) * W + x * S + dx];
      fg[y * img.w + x] = c >= Math.ceil(S * S * 0.45) ? 1 : 0;
    }
  }
  clearSaturated(fg, img, origin, lineRects);
  removeThinLines(fg, img.w, img.h);
  removeTopLines(fg, img.w, img.h);
  clearZones(fg, img, origin, clearRects);
  removeSpecks(fg, img.w, img.h);
  fg.bg = bgc;
  fg.keep = keep;
  return fg;
}

/** Filet de titre coupé en haut de la zone : pixels des premières rangées sans rien juste en dessous. */
function removeTopLines(fg, w, h) {
  const drop = [];
  for (let y = 0; y < Math.min(6, h - 6); y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (fg[p] && !fg[p + 4 * w] && !fg[p + 5 * w]) drop.push(p);
    }
  }
  for (const p of drop) fg[p] = 0;
}

/** Flou « boîte » 3×3 d'un champ de valeurs 0..1 (deux passes ≈ flou gaussien léger). */
function box3(src, w, h) {
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    tmp[i] = (src[i] + (x > 0 ? src[i - 1] : 0) + (x < w - 1 ? src[i + 1] : 0)) / 3;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    out[i] = (tmp[i] + (y > 0 ? tmp[i - w] : 0) + (y < h - 1 ? tmp[i + w] : 0)) / 3;
  }
  return out;
}

/**
 * Découpe une pose en HD : masque de la pose (échelle planche) ∩ masque HD, ombre au sol retirée,
 * contour lissé, frange couleur fond repeinte à l'encre, fin trait d'encre autour, ancrage aux pieds.
 */
function extractHi(img, mask, fg, hz) {
  const w1 = img.w, S = hz.S, W = hz.W, bgc = fg.bg;
  let y0 = img.h, y1 = -1, x0 = w1, x1 = -1;
  const bounds = () => {
    y0 = img.h; y1 = -1; x0 = w1; x1 = -1;
    for (let p = 0; p < mask.length; p++) {
      if (!mask[p]) continue;
      const x = p % w1, y = (p / w1) | 0;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
    }
  };
  bounds();
  for (let y = y1; y > Math.max(y0, y1 - 10) && !hz.A; y--) {
    for (let x = x0; x <= x1; x++) {
      const p = y * w1 + x;
      if (mask[p] && isShadow(img.data, p * 4)) mask[p] = 0;
    }
  }
  bounds();
  // Fin trait de sol sous les pieds : pixels du bas sans rien 3 rangées au-dessus (planches opaques seulement)
  const drop = [];
  for (let y = y1; y > Math.max(y0 + 3, y1 - 5) && !hz.A; y--) {
    for (let x = x0; x <= x1; x++) {
      const p = y * w1 + x;
      if (mask[p] && !mask[p - 3 * w1]) drop.push(p);
    }
  }
  for (const p of drop) mask[p] = 0;
  bounds();
  const dil = morph(mask, w1, img.h, 1, true);
  const dil2 = morph(mask, w1, img.h, 2, true); // les halos des effets débordent un peu du masque
  // région HD : la pose + 2 pixels de planche de marge (contour, halos)
  const bx0 = Math.max(0, x0 - 2), by0 = Math.max(0, y0 - 2), bx1 = Math.min(w1 - 1, x1 + 2), by1 = Math.min(img.h - 1, y1 + 2);
  const w = (bx1 - bx0 + 1) * S, h = (by1 - by0 + 1) * S, X0 = bx0 * S, Y0 = by0 * S;
  if (hz.A) {
    // Planche transparente : on garde l'alpha et les couleurs telles quelles (halos compris)
    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const gx = X0 + x, gy = Y0 + y, gi = gy * W + gx, i = y * w + x;
      if (!dil2[((gy / S) | 0) * w1 + ((gx / S) | 0)]) continue;
      for (let k = 0; k < 3; k++) out[i * 4 + k] = hz.rgb[gi * 3 + k];
      out[i * 4 + 3] = hz.A[gi];
    }
    return anchored(out, w, h);
  }
  let V = hz.V;
  const edgeFade = 3 * S;
  if (V) {
    // Vision n'a pas vu le perso dans cette pose (effet qui le recouvre) : tout est traité comme le perso
    let inV = 0, all = 0;
    for (let y = by0 * S; y < (by1 + 1) * S; y++) for (let x = bx0 * S; x < (bx1 + 1) * S; x++) {
      if (!mask[((y / S) | 0) * w1 + ((x / S) | 0)] || !fg.keep[y * W + x]) continue;
      all++;
      if (V[y * W + x] >= 64) inV++;
    }
    if (inV < all * 0.3) V = null;
  }
  // Deux couches : le perso (zone Vision : bord net + trait d'encre) et les effets autour
  // (ondes, éclairs, halos, traînées) dont la transparence suit l'écart au fond, comme une lumière.
  const m = new Float32Array(w * h), eff = new Float32Array(w * h), effRgb = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const gx = X0 + x, gy = Y0 + y, gi = gy * W + gx, ci = ((gy / S) | 0) * w1 + ((gx / S) | 0), i = y * w + x;
    const body = !V || V[gi] >= 64;
    if (body) {
      m[i] = hz_keep(fg, gi) && dil[ci] ? 1 : 0;
      continue;
    }
    if (!dil2[ci]) continue;
    const r = hz.soft[gi * 3], g = hz.soft[gi * 3 + 1], b = hz.soft[gi * 3 + 2];
    const e = Math.hypot(r - bgc[0], g - bgc[1], b - bgc[2]);
    // effet coupé par le cadre de la planche : on l'estompe au lieu d'un bord droit
    const fade = Math.min(1, gx / edgeFade, gy / edgeFade, (W - 1 - gx) / edgeFade, (hz.H - 1 - gy) / edgeFade);
    const a = Math.pow(Math.max(0, Math.min(1, (e - 10) / 85)), 0.85) * fade;
    if (a < 0.02) continue;
    eff[i] = a;
    // couleur « dé-mélangée » du fond : un halo bleu sur fond marine redevient un halo bleu transparent
    for (let k = 0; k < 3; k++) {
      const c = hz.rgb[gi * 3 + k], base = bgc[k];
      effRgb[i * 3 + k] = Math.max(0, Math.min(255, base + (c - base) / Math.max(a, 0.35)));
    }
  }
  // silhouette lissée (escaliers arrondis), et version épaissie pour le trait d'encre
  const inner = box3(box3(m, w, h), w, h);
  const grown = new Float32Array(m.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0;
    for (let dy = -2; dy <= 2 && !v; dy++) for (let dx = -2; dx <= 2 && !v; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && m[yy * w + xx] && dx * dx + dy * dy <= 5) v = 1;
    }
    grown[y * w + x] = v;
  }
  const outer = box3(grown, w, h);
  const effS = box3(eff, w, h); // halo adouci d'un rien (bruit de compression)
  const ramp = (v) => Math.max(0, Math.min(1, (v - 0.5) * 3 + 0.5));
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, si = ((Y0 + y) * W + X0 + x) * 3;
    const ai = ramp(inner[i]), ao = ramp(outer[i]), ae = Math.max(eff[i], effS[i] * 0.9);
    // pas de trait d'encre en travers d'un effet (onde à cheval sur la limite du perso)
    const ink = ao * (1 - Math.min(1, ae * 1.6));
    const ko = (1 - ai) * ink, ke = (1 - ai) * (1 - ink) * ae;
    const a = ai + ko + ke;
    if (a <= 0.004) continue;
    let r = hz.rgb[si], g = hz.rgb[si + 1], b = hz.rgb[si + 2];
    // bord du perso resté couleur fond (halo bleu nuit) : on le repeint à l'encre
    if (inner[i] < 0.97 && Math.hypot(r - bgc[0], g - bgc[1], b - bgc[2]) < 40) { r = INK[0]; g = INK[1]; b = INK[2]; }
    const er = eff[i] ? effRgb[i * 3] : r, eg = eff[i] ? effRgb[i * 3 + 1] : g, eb = eff[i] ? effRgb[i * 3 + 2] : b;
    out[i * 4] = Math.round((ai * r + ko * INK[0] + ke * er) / a);
    out[i * 4 + 1] = Math.round((ai * g + ko * INK[1] + ke * eg) / a);
    out[i * 4 + 2] = Math.round((ai * b + ko * INK[2] + ke * eb) / a);
    out[i * 4 + 3] = Math.round(Math.min(1, a) * 255);
  }
  return anchored(out, w, h);
}

/** Ancrage : bas de la silhouette, centré sur les jambes (quart inférieur). */
function anchored(out, w, h) {
  let bottom = h - 1;
  while (bottom > 0 && !rowHas(out, w, bottom)) bottom--;
  const xs = [];
  for (let y = Math.floor(bottom * 0.75); y <= bottom; y++) for (let x = 0; x < w; x++) if (out[(y * w + x) * 4 + 3] > 128) xs.push(x);
  xs.sort((p, q) => p - q);
  return { data: out, w, h, ax: xs.length ? xs[xs.length >> 1] : w >> 1, ay: bottom };
}

const hz_keep = (fg, i) => fg.keep[i];
const rowHas = (buf, w, y) => {
  for (let x = 0; x < w; x++) if (buf[(y * w + x) * 4 + 3] > 128) return true;
  return false;
};

/**
 * Masque « premier plan ». On repère le fond (couleur du pourtour), on efface les titres,
 * puis on « ferme » la silhouette pour boucher les fissures : sans ça, les ombres très sombres
 * des costumes, reliées au fond par le contour noir, étaient effacées et laissaient des trous.
 */
function foreground(img, clearRects = [], origin = [0, 0], lineRects = []) {
  const bgc = borderColor(img);
  const n = img.w * img.h;
  const init = new Uint8Array(n);
  const grown = growBackground(img, bgc);
  for (let p = 0; p < n; p++) init[p] = grown[p] || near(img, p, bgc, TOL) ? 0 : 1;
  clearSaturated(init, img, origin, lineRects);
  removeThinLines(init, img.w, img.h);
  clearZones(init, img, origin, clearRects);
  const closed = morph(morph(init, img.w, img.h, 2, true), img.w, img.h, 2, false);
  // Le fond = ce qui reste relié au bord sans traverser la silhouette fermée
  const isBg = new Uint8Array(n);
  const stack = [];
  const push = (p) => {
    if (!isBg[p] && !closed[p]) {
      isBg[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < img.w; x++) { push(x); push((img.h - 1) * img.w + x); }
  for (let y = 0; y < img.h; y++) { push(y * img.w); push(y * img.w + img.w - 1); }
  while (stack.length) {
    const p = stack.pop();
    const x = p % img.w;
    if (x > 0) push(p - 1);
    if (x < img.w - 1) push(p + 1);
    if (p >= img.w) push(p - img.w);
    if (p < n - img.w) push(p + img.w);
  }
  const fg = new Uint8Array(n);
  for (let p = 0; p < n; p++) fg[p] = isBg[p] ? 0 : 1;
  // Grandes poches de fond enfermées (entre les jambes, sous un bras) : elles restent transparentes
  const pocket = new Uint8Array(n);
  // (seulement le fond « pur » : les ombres sombres des costumes, un peu plus claires, sont gardées)
  for (let p = 0; p < n; p++) pocket[p] = fg[p] && !init[p] && near(img, p, bgc, 11) ? 1 : 0;
  for (const c of components(pocket, img.w, img.h)) if (c.pixels.length > HOLE_MAX) for (const p of c.pixels) fg[p] = 0;
  clearZones(fg, img, origin, clearRects);
  removeSpecks(fg, img.w, img.h);
  fg.bg = bgc;
  return fg;
}

/** Retire les filets décoratifs des titres : longues lignes horizontales de quelques pixels d'épaisseur. */
function removeThinLines(fg, w, h) {
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (!fg[y * w + x]) { x++; continue; }
      let e = x;
      while (e < w && fg[y * w + e]) e++;
      if (e - x >= 120) {
        for (let k = x; k < e; k++) {
          const thick = (y >= 8 && fg[(y - 8) * w + k]) || (y < h - 8 && fg[(y + 8) * w + k]);
          if (!thick) fg[y * w + k] = 2; // marqué, effacé après le balayage
        }
      }
      x = e;
    }
  }
  for (let p = 0; p < fg.length; p++) if (fg[p] === 2) fg[p] = 0;
}

/** Étiquette les morceaux connexes du masque (8 voisins). */
function components(fg, w, h) {
  const label = new Int32Array(fg.length).fill(-1);
  const comps = [];
  for (let s = 0; s < fg.length; s++) {
    if (!fg[s] || label[s] >= 0) continue;
    const id = comps.length;
    const c = { id, pixels: [s], x0: w, x1: 0, y0: h, y1: 0, sx: 0 };
    label[s] = id;
    for (let i = 0; i < c.pixels.length; i++) {
      const p = c.pixels[i], x = p % w, y = (p / w) | 0;
      c.x0 = Math.min(c.x0, x); c.x1 = Math.max(c.x1, x);
      c.y0 = Math.min(c.y0, y); c.y1 = Math.max(c.y1, y);
      c.sx += x;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (fg[q] && label[q] < 0) { label[q] = id; c.pixels.push(q); }
        }
      }
    }
    c.cx = c.sx / c.pixels.length;
    comps.push(c);
  }
  return comps;
}

/** Retire les petits îlots isolés (bruit de compression). */
function removeSpecks(fg, w, h) {
  for (const c of components(fg, w, h)) if (c.pixels.length < 40) for (const p of c.pixels) fg[p] = 0;
}

/**
 * Efface les filets de titre dans des bandes de la planche : tout ce qui y est fin et horizontal
 * (rien 11 px au-dessus ni 11 px en dessous), sans toucher à la tête qui passe devant.
 */
function clearSaturated(fg, zone, [zx, zy], rects) {
  const drop = [];
  for (const [x0, y0, x1, y1] of rects) {
    for (let y = Math.max(0, y0 - zy); y < Math.min(zone.h, y1 - zy); y++) {
      for (let x = Math.max(0, x0 - zx); x < Math.min(zone.w, x1 - zx); x++) {
        const p = y * zone.w + x;
        if (!fg[p]) continue;
        const above = y >= 11 && fg[p - 11 * zone.w], below = y < zone.h - 11 && fg[p + 11 * zone.w];
        const i = p * 4, d = zone.data;
        const vivid = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 100;
        if ((!above && !below) || vivid) drop.push(p);
      }
    }
  }
  for (const p of drop) fg[p] = 0;
}

/** Efface des rectangles de la planche (titres de section) dans le masque d'une zone. */
function clearZones(fg, zone, [zx, zy], rects) {
  for (const [x0, y0, x1, y1] of rects) {
    for (let y = Math.max(0, y0 - zy); y < Math.min(zone.h, y1 - zy); y++) {
      for (let x = Math.max(0, x0 - zx); x < Math.min(zone.w, x1 - zx); x++) fg[y * zone.w + x] = 0;
    }
  }
}

/** Sépare les poses par les colonnes vides, puis ajuste au nombre attendu. */
function splitFrames(fg, w, h, expected, cuts, even = false) {
  const cols = new Array(w).fill(0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cols[x] += fg[y * w + x];
  if (even && expected) {
    // Poses serrées qui se chevauchent : coupe régulière, à la colonne la plus vide près de chaque repère.
    // On ne regarde que le haut des poses (têtes, torses) : la poussière au sol fausserait les repères.
    cols.fill(0);
    for (let y = 0; y < Math.round(h * 0.65); y++) for (let x = 0; x < w; x++) cols[x] += fg[y * w + x];
    let x0 = 0, x1 = w;
    while (x0 < w && cols[x0] < 2) x0++;
    while (x1 > x0 && cols[x1 - 1] < 2) x1--;
    const step = (x1 - x0) / expected, cut = [Math.max(0, Math.round(x0 - step * 0.45))];
    for (let k = 1; k < expected; k++) {
      const target = Math.round(x0 + step * k), win = Math.round(step * 0.25);
      let best = target;
      for (let x = target - win; x <= target + win; x++) if (cols[x] < cols[best]) best = x;
      cut.push(best);
    }
    cut.push(Math.min(w, Math.round(x1 + step * 0.45)));
    return cut.slice(0, -1).map((c, i) => [c, cut[i + 1]]);
  }
  if (cuts) {
    // Découpe imposée dans la config (coordonnées de la zone)
    const bounds = [0, ...cuts, w];
    return bounds.slice(0, -1).map((c, i) => [c, bounds[i + 1]]);
  }
  // Une colonne « pleine » doit contenir un vrai bout de corps : les traînées de vitesse
  // et les ombres au sol, minces, ne suffisent pas à relier deux poses.
  const minCol = Math.max(3, Math.round(h * 0.07));
  let segs = [];
  let start = -1;
  for (let x = 0; x <= w; x++) {
    const filled = x < w && cols[x] >= minCol;
    if (filled && start < 0) start = x;
    if (!filled && start >= 0) { segs.push([start, x]); start = -1; }
  }
  const mass = ([a, b]) => cols.slice(a, b).reduce((s, v) => s + v, 0);
  segs = segs.filter((s) => mass(s) >= MIN_PIXELS);
  if (expected && segs.length < expected && segs.length) {
    // Poses collées : on coupe à la colonne la plus vide autour de chaque position régulière.
    const x0 = segs[0][0], x1 = segs[segs.length - 1][1], step = (x1 - x0) / expected;
    const cut = [x0];
    for (let k = 1; k < expected; k++) {
      const target = Math.round(x0 + step * k), win = Math.round(step * 0.3);
      let best = target;
      for (let x = target - win; x <= target + win; x++) if (cols[x] < cols[best]) best = x;
      cut.push(best);
    }
    cut.push(x1);
    segs = cut.slice(0, -1).map((c, i) => [c, cut[i + 1]]);
  }
  while (expected && segs.length > expected) {
    // On fusionne le plus petit morceau avec son voisin le plus proche
    let small = 0;
    for (let i = 1; i < segs.length; i++) if (mass(segs[i]) < mass(segs[small])) small = i;
    const left = small > 0 ? segs[small][0] - segs[small - 1][1] : Infinity;
    const right = small < segs.length - 1 ? segs[small + 1][0] - segs[small][1] : Infinity;
    const j = left <= right ? small - 1 : small;
    segs.splice(j, 2, [segs[j][0], segs[j + 1][1]]);
  }
  return segs;
}

/**
 * Répartit les morceaux du masque entre les poses : un morceau entier va à la pose où se trouve
 * son centre (un poing qui déborde reste à sa pose). Seul un morceau qui recouvre vraiment
 * deux poses collées est coupé par colonnes.
 */
function assignFrames(fg, w, h, segs) {
  const comps = components(fg, w, h);
  const masks = segs.map(() => new Uint8Array(fg.length));
  const segOf = (x) => {
    let best = 0, bd = Infinity;
    segs.forEach(([a, b], i) => {
      const d = x < a ? a - x : x >= b ? x - b + 1 : 0;
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };
  const frameMass = segs.map(() => 0);
  for (const c of comps) frameMass[segOf(c.cx)] += c.pixels.length;
  const typical = [...frameMass].sort((p, q) => p - q)[frameMass.length >> 1] || 1;
  for (const c of comps) {
    if (c.y1 - c.y0 <= 7 && c.y0 < 18) continue; // reste de titre
    const spans = new Set([segOf(c.x0), segOf(c.x1)]);
    if (spans.size > 1 && c.pixels.length > typical * 0.3) {
      // Deux poses reliées par une ombre ou une traînée : on les sépare en rongeant les liaisons fines
      for (const [p, s] of splitByErosion(c, w, h, segOf)) masks[s][p] = 1;
    } else {
      const s = segOf(c.cx);
      for (const p of c.pixels) masks[s][p] = 1;
    }
  }
  // Une pose restée vide (poses reliées par de la poussière, une traînée…) : les morceaux partagés
  // sont alors coupés simplement par colonnes.
  if (masks.some((m) => !m.some((v) => v))) {
    for (const c of comps) {
      if (new Set([segOf(c.x0), segOf(c.x1)]).size < 2) continue;
      for (const p of c.pixels) {
        masks.forEach((m) => (m[p] = 0));
        masks[segOf(p % w)][p] = 1;
      }
    }
  }
  masks.forEach((m, i) => dropStrays(m, w, h, segs[i]));
  return masks;
}

/** Sépare un morceau en érodant ses liaisons fines, puis rend chaque pixel au cœur le plus proche. */
function splitByErosion(c, w, h, segOf) {
  const own = new Uint8Array(w * h);
  for (const p of c.pixels) own[p] = 1;
  const core = morph(own, w, h, 2, false);
  const seed = new Int32Array(w * h).fill(-1);
  const queue = [];
  for (const sub of components(core, w, h)) {
    const s = segOf(sub.cx);
    for (const p of sub.pixels) { seed[p] = s; queue.push(p); }
  }
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i], x = p % w;
    for (const q of [p - 1, p + 1, p - w, p + w]) {
      if (q < 0 || q >= own.length || Math.abs((q % w) - x) > 1 || !own[q] || seed[q] >= 0) continue;
      seed[q] = seed[p];
      queue.push(q);
    }
  }
  return c.pixels.map((p) => [p, seed[p] >= 0 ? seed[p] : segOf(p % w)]);
}

/** Découpe stricte par colonnes (poses qui se chevauchent). */
function columnMasks(fg, w, segs) {
  return segs.map(([a, b]) => {
    const m = new Uint8Array(fg.length);
    for (let p = 0; p < fg.length; p++) if (fg[p] && p % w >= a && p % w < b) m[p] = 1;
    return m;
  });
}

/** Retire d'une pose les petits débris détachés coupés au bord (bout de la pose voisine, reste de décor). */
function dropStrays(mask, w, h, [a, b]) {
  const comps = components(mask, w, h);
  if (comps.length < 2) return;
  const main = comps.reduce((a, b) => (b.pixels.length > a.pixels.length ? b : a));
  const total = comps.reduce((s, c) => s + c.pixels.length, 0);
  for (const c of comps) {
    if (c === main || c.pixels.length > total * 0.08) continue;
    const gap = Math.max(c.x0 - main.x1, main.x0 - c.x1, c.y0 - main.y1, main.y0 - c.y1);
    const atEdge = c.x0 <= a + 2 || c.x1 >= b - 3; // les effets (ondes, étoiles) sont au milieu : on les garde
    if (gap > 3 && atEdge) for (const p of c.pixels) mask[p] = 0;
  }
}

/** Ombre portée au sol : rangées du bas faites surtout de pixels gris très sombres. */
function isShadow(d, i) {
  const r = d[i], g = d[i + 1], b = d[i + 2];
  return Math.max(r, g, b) < 50 && r < g + 14;
}

/** Découpe une pose : image détourée, bords adoucis, sans ombre au sol, ancrée aux pieds. */
function extract(img, mask, bgc) {
  const W = img.w;
  let y0 = img.h, y1 = -1, x0 = W, x1 = -1;
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p]) continue;
    const x = p % W, y = (p / W) | 0;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
  }
  // Retire l'ombre portée sous les pieds (gris très sombre, dans les dernières rangées)
  for (let y = y1; y > Math.max(y0, y1 - 10); y--) {
    for (let x = x0; x <= x1; x++) {
      const p = y * W + x;
      if (mask[p] && isShadow(img.data, p * 4)) mask[p] = 0;
    }
  }
  y0 = img.h; y1 = -1; x0 = W; x1 = -1;
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p]) continue;
    const x = p % W, y = (p / W) | 0;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const out = Buffer.alloc(w * h * 4);
  const [br, bg, bb] = bgc;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sp = (y0 + y) * W + (x0 + x);
      if (!mask[sp]) continue;
      const o = (y * w + x) * 4, i = sp * 4;
      img.data.copy(out, o, i, i + 4);
      // Bord de la silhouette : transparence selon l'écart au fond (contour adouci)
      const edge = !mask[sp - 1] || !mask[sp + 1] || !mask[sp - W] || !mask[sp + W];
      const dist = Math.hypot(img.data[i] - br, img.data[i + 1] - bg, img.data[i + 2] - bb);
      out[o + 3] = edge ? Math.round(255 * Math.max(0.45, Math.min(1, (dist - 4) / 36))) : 255;
    }
  }
  // Ancrage : bas de la silhouette, centré sur les jambes (quart inférieur)
  const xs = [];
  for (let y = Math.floor(h * 0.75); y < h; y++) for (let x = 0; x < w; x++) if (out[(y * w + x) * 4 + 3]) xs.push(x);
  xs.sort((p, q) => p - q);
  return { data: out, w, h, ax: xs.length ? xs[xs.length >> 1] : w >> 1, ay: h - 1 };
}

/** Rangement en étagères dans un atlas de largeur fixe. */
function pack(frames, width = 4095) {
  const order = frames.map((f, i) => i).sort((p, q) => frames[q].h - frames[p].h);
  let x = PAD, y = PAD, shelf = 0;
  for (const i of order) {
    const f = frames[i];
    if (x + f.w + PAD > width) { x = PAD; y += shelf + PAD; shelf = 0; }
    f.x = x; f.y = y;
    x += f.w + PAD;
    shelf = Math.max(shelf, f.h);
  }
  return { width, height: y + shelf + PAD };
}

/** Garde le plus gros morceau et les morceaux à moins de 3 pixels de lui (pas de chevauchement de boîtes : vrai contact). */
function keepTouching(fg, w, h) {
  const comps = components(fg, w, h);
  if (!comps.length) return fg;
  const main = comps.reduce((a, b) => (b.pixels.length > a.pixels.length ? b : a));
  const own = new Uint8Array(fg.length);
  for (const p of main.pixels) own[p] = 1;
  const near = morph(own, w, h, 3, true);
  const out = new Uint8Array(fg.length);
  for (const c of comps) if (c === main || c.pixels.some((p) => near[p])) for (const p of c.pixels) out[p] = 1;
  return out;
}

/** Garde le plus gros morceau (le perso) et ce qui le touche presque (mains, pieds, petit effet collé). */
function keepMain(fg, w, h) {
  const comps = components(fg, w, h);
  if (!comps.length) return fg;
  const main = comps.reduce((a, b) => (b.pixels.length > a.pixels.length ? b : a));
  const out = new Uint8Array(fg.length);
  for (const c of comps) {
    const gap = Math.max(c.x0 - main.x1, main.x0 - c.x1, c.y0 - main.y1, main.y0 - c.y1);
    if (c === main || gap <= 2) for (const p of c.pixels) out[p] = 1;
  }
  return out;
}

/** Ligne de sol sous une rangée de poses : rangée presque pleine ; on l'efface sauf sous les pieds. */
function removeFloorLines(fg, w, h) {
  const drop = [];
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < w; x++) n += fg[y * w + x];
    if (n < w * 0.5) continue;
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (fg[p] && !(y >= 5 && fg[p - 5 * w]) ) drop.push(p);
    }
  }
  for (const p of drop) fg[p] = 0;
}

async function importCharacter(id, cfg) {
  TOL = cfg.tolerance ?? BG_TOLERANCE;
  GROW = cfg.grow ?? true;
  STEP = cfg.step ?? 7;
  BG = cfg.bg ?? null;
  HTOL = cfg.hiTolerance ?? HI_TOL;
  UP = PAD = cfg.upscale ?? UPSCALE;
  STRONG = cfg.strong ?? 48; // planche à fond brumeux : seuil plus haut pour ne pas garder la brume
  const sheetPath = (file = cfg.sheet || 'planche.webp') => path.join(ROOT, 'sprites_raw', id, file);
  const sheets = new Map();
  const sheetOf = async (file = cfg.sheet || 'planche.webp') => {
    if (!sheets.has(file)) sheets.set(file, await load(path.join(ROOT, 'sprites_raw', id, file)));
    return sheets.get(file);
  };
  const all = [];
  const anims = {};
  const report = [];
  for (const [name, a] of Object.entries(cfg.animations)) {
    const sheet = await sheetOf(a.sheet);
    BG = a.bg ?? cfg.bg ?? null;
    STRONG = a.strong ?? cfg.strong ?? 48;
    if (a.rects) {
      // Une pose par rectangle : on ne garde que le perso (les bulles et effets voisins sont ignorés)
      const frames = [];
      for (const r of a.rects) {
        const zone = crop(sheet, r);
        const hz = await hiZone(sheetPath(a.sheet), r, `${id}_${a.sheet || 'planche'}`, a.alphaFloor);
        const fg = foregroundHi(zone, hz, a.clear || [], r, []);
        const mask = a.main !== false ? keepMain(fg, zone.w, zone.h) : fg;
        frames.push(extractHi(zone, mask, fg, hz));
      }
      report.push(`${name}:${frames.length}`);
      all.push(...frames);
      anims[name] = { frames, fps: a.fps, loop: a.loop, phased: a.phased };
      continue;
    }
    const zone = crop(sheet, a.rect);
    const hz = await hiZone(sheetPath(a.sheet), a.rect, `${id}_${a.sheet || 'planche'}`, a.alphaFloor);
    const fg = foregroundHi(zone, hz, [...(cfg.clear || []), ...(a.clear || [])], a.rect, cfg.titleLines || []);
    removeFloorLines(fg, zone.w, zone.h);
    const segs = splitFrames(fg, zone.w, zone.h, a.frames, a.cuts, a.even);
    let masks = a.even ? columnMasks(fg, zone.w, segs) : assignFrames(fg, zone.w, zone.h, segs);
    if (a.even) masks.forEach((m, i) => dropStrays(m, zone.w, zone.h, segs[i]));
    if (a.main === true) masks = masks.map((m) => keepMain(m, zone.w, zone.h)); // détails détachés (nuages de la pose voisine) retirés
    if (a.main === 'touch') masks = masks.map((m) => keepTouching(m, zone.w, zone.h)); // seulement ce qui touche le perso
    if (a.pick) masks = a.pick.map((i) => masks[i]).filter(Boolean);
    const frames = masks.filter((m) => m.some((v) => v)).map((m) => extractHi(zone, m, fg, hz));
    report.push(`${name}:${frames.length}${a.frames && segs.length !== a.frames ? ' ⚠' : ''}`);
    all.push(...frames);
    anims[name] = { frames, fps: a.fps, loop: a.loop, phased: a.phased };
  }

  const { width, height } = pack(all, Math.floor(4096 / UP) * UP);
  const atlas = Buffer.alloc(width * height * 4);
  for (const f of all) for (let y = 0; y < f.h; y++) f.data.copy(atlas, ((f.y + y) * width + f.x) * 4, y * f.w * 4, (y + 1) * f.w * 4);
  const outDir = path.join(ROOT, 'public/characters', id);
  await sharp(atlas, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(outDir, 'atlas.png'));
  // Atlas léger pour les téléphones : réduction exacte (tailles et positions multiples de UPSCALE)
  await sharp(atlas, { raw: { width, height, channels: 4 } })
    .resize(width / UP, height / UP, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'atlas_sd.png'));

  // Échelle : le perso au repos mesure cfg.height unités du monde (le monde fait 480×270)
  const idleH = anims.idle.frames.map((f) => f.h).sort((p, q) => p - q)[anims.idle.frames.length >> 1];
  const scale = +(cfg.height / idleH).toFixed(4);

  const sprite = { version: Date.now().toString(36), atlas: 'atlas.png', sd: { atlas: 'atlas_sd.png', factor: UP }, scale, altFilter: cfg.altFilter, aliases: cfg.aliases, animations: {} };
  for (const [name, a] of Object.entries(anims)) {
    sprite.animations[name] = {
      ...(a.fps ? { fps: a.fps } : {}),
      ...(a.loop != null ? { loop: a.loop } : {}),
      ...(a.phased ? { phased: true } : {}),
      frames: a.frames.map((f) => [f.x, f.y, f.w, f.h, f.ax, f.ay]),
    };
  }

  if (cfg.portrait) {
    // Illustration du perso (en-tête de la planche) pour les affiches et la sélection
    const [x0, y0, x1, y1] = cfg.portrait;
    await sharp(path.join(ROOT, 'sprites_raw', id, cfg.portraitSheet || cfg.sheet || 'planche.webp'))
      .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
      .png()
      .toFile(path.join(outDir, 'portrait.png'));
  }

  if (cfg.icon) {
    const [x0, y0, x1, y1] = cfg.icon;
    await sharp(path.join(ROOT, 'sprites_raw', id, cfg.portraitSheet || cfg.sheet || 'planche.webp'))
      .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
      .resize(160, 160, { kernel: 'lanczos3' })
      .png()
      .toFile(path.join(outDir, 'icon.png'));
  }

  const jsonPath = path.join(outDir, 'character.json');
  const def = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  def.sprite = sprite;
  if (cfg.icon) def.icon = 'icon.png';
  if (cfg.portrait) def.portrait = 'portrait.png';
  fs.writeFileSync(jsonPath, JSON.stringify(def, null, 2) + '\n');
  console.log(`${id}: atlas ${width}×${height}, échelle ${scale} — ${report.join(' ')}`);
  await makeMobileAssets(id); // versions WebP légères pour les manettes
}

// Débogage : node tools/import-sprites.mjs <perso> --mask <animation> <fichier.png> enregistre la zone HD détourée sur fond magenta.
if (process.argv[3] === '--mask') {
  const [id, , anim, file] = process.argv.slice(2);
  const cfg = CONFIG[id], a = cfg.animations[anim], r = a.rect || a.rects[0];
  const sheetFile = path.join(ROOT, 'sprites_raw', id, a.sheet || cfg.sheet || 'planche.webp');
  const sheet = await load(sheetFile);
  TOL = cfg.tolerance ?? BG_TOLERANCE;
  BG = a.bg ?? cfg.bg ?? null;
  HTOL = cfg.hiTolerance ?? HI_TOL;
  UP = PAD = cfg.upscale ?? UPSCALE;
  const zone = crop(sheet, r);
  const hz = await hiZone(sheetFile, r, `${id}_${a.sheet || 'planche'}`);
  const fg = foregroundHi(zone, hz, [...(cfg.clear || []), ...(a.clear || [])], r, a.rect ? cfg.titleLines || [] : []);
  const out = Buffer.alloc(hz.W * hz.H * 3);
  for (let i = 0; i < hz.W * hz.H; i++) {
    const on = fg.keep[i] && fg[((i / hz.W / hz.S) | 0) * zone.w + (((i % hz.W) / hz.S) | 0)];
    for (let k = 0; k < 3; k++) out[i * 3 + k] = on ? hz.rgb[i * 3 + k] : [255, 0, 255][k];
  }
  await sharp(out, { raw: { width: hz.W, height: hz.H, channels: 3 } }).png().toFile(file);
  process.exit(0);
}

const only = process.argv[2];
for (const [id, cfg] of Object.entries(CONFIG)) {
  if (only && id !== only) continue;
  await importCharacter(id, cfg);
}
