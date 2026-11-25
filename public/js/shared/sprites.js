// Sprites des personnages.
// - Si character.json contient "sprite", on charge la sprite sheet (voir public/characters/README.md).
// - Sinon on génère un personnage pixel-art procédural (placeholder) à partir de ses couleurs.
// Une frame = { img, sx, sy, sw, sh, ax, ay, scale } ; (ax, ay) = point d'ancrage aux pieds.

export const FRAME = 40;
export const ANCHOR_X = 20;
export const ANCHOR_Y = 38;
const OUTLINE = [20, 13, 31];
const ALT_FILTER = 'hue-rotate(150deg) saturate(1.15)'; // palette du joueur 2 quand les deux prennent le même perso

// Animation manquante dans une sprite sheet -> on essaie celle-ci à la place.
const FALLBACK = {
  run: 'idle', walk: 'run', crouch: 'idle', land: 'crouch', jump: 'fall', fall: 'idle', jump2: 'jump', jumpsquat: 'crouch', dash: 'run',
  jab: 'idle', ftilt: 'jab', utilt: 'jab', dtilt: 'crouch',
  nair: 'jump', fair: 'nair', bair: 'nair', uair: 'nair', dair: 'nair',
  special_neutral: 'jab', special_side: 'ftilt', special_up: 'uair', special_down: 'dair',
  hurt: 'fall', tumble: 'hurt', shield: 'crouch', dodge: 'shield', helpless: 'fall', victory: 'idle',
};
const LOOPING = new Set(['idle', 'run', 'fall', 'crouch', 'shield', 'helpless', 'tumble', 'hurt', 'victory', 'dodge', 'land']);

class Sprite {
  constructor(anims, aliases = {}) {
    this.anims = anims;
    this.aliases = aliases; // animation absente -> animation à utiliser (propre à la planche)
    this.first = Object.keys(anims)[0];
  }
  resolve(name) {
    let n = name;
    for (let i = 0; i < 10 && !this.anims[n]; i++) n = this.aliases[n] || FALLBACK[n] || this.first;
    return this.anims[n] || this.anims[this.first];
  }
  /** Animation fournie par la planche (sans repli) : poses de spéciaux, images d'effets fx_*. */
  has(name) {
    return !!this.anims[name];
  }
  /** tick = frames (60/s) depuis le début de l'anim ; phase 0/1/2 et progress 0..1 pour les attaques. */
  get(name, tick = 0, phase = null, progress = null) {
    const a = this.resolve(name);
    const n = a.frames.length;
    let i;
    if (progress != null) i = a.phased && phase != null ? Math.min(n - 1, phase) : Math.min(n - 1, Math.floor(progress * n));
    else if (a.loop) i = Math.floor((tick * a.fps) / 60) % n;
    else i = Math.min(n - 1, Math.floor((tick * a.fps) / 60));
    return a.frames[i];
  }
}

export function drawFrame(ctx, fr, x = 0, y = 0, tint = null, alpha = 1) {
  const s = fr.scale || 1;
  let img = fr.img, sx = fr.sx, sy = fr.sy;
  if (tint) {
    img = silhouette(fr, tint);
    sx = 0;
    sy = 0;
  }
  const prev = ctx.globalAlpha, smooth = ctx.imageSmoothingEnabled;
  ctx.globalAlpha = prev * alpha;
  // Sprite détaillé affiché plus petit que sa taille d'origine : lissage, sinon il scintille.
  const m = ctx.getTransform();
  if (Math.hypot(m.a, m.b) * s < 0.98) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
  ctx.drawImage(img, sx, sy, fr.sw, fr.sh, x - fr.ax * s, y - fr.ay * s, fr.sw * s, fr.sh * s);
  ctx.globalAlpha = prev;
  ctx.imageSmoothingEnabled = smooth;
}

function silhouette(fr, color) {
  fr._sil ??= {};
  if (!fr._sil[color]) {
    const c = document.createElement('canvas');
    c.width = fr.sw;
    c.height = fr.sh;
    const g = c.getContext('2d');
    g.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, 0, 0, fr.sw, fr.sh);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    fr._sil[color] = c;
  }
  return fr._sil[color];
}

/** sd : atlas léger (÷3) des téléphones, quand la planche en fournit un. */
export async function buildSprite(def, alt = false, { sd = false } = {}) {
  if (def.sprite && (def.sprite.sheet || def.sprite.atlas || def.sprite.animations)) {
    try {
      return await sheetSprite(def, alt, sd);
    } catch (e) {
      console.warn(`Sprite sheet de "${def.id}" illisible, placeholder utilisé :`, e);
    }
  }
  return proceduralSprite(def, alt);
}

/**
 * Icône carrée du perso (HUD des %, sélection) : fichier "icon" de character.json,
 * sinon la tête découpée dans la pose d'attente. Renvoie toujours un canvas.
 */
export async function buildIcon(def, sprite, alt = false) {
  if (def.icon) {
    try {
      const custom = alt && def.altIcon;
      const img = await loadImage(def.base + (custom ? def.altIcon : def.icon) + (def.sprite?.version ? `?v=${def.sprite.version}` : ''));
      return alt && !custom ? recolor(img, def.sprite?.altFilter || ALT_FILTER) : recolor(img, 'none');
    } catch (e) {
      console.warn(`Icône de "${def.id}" illisible, tête du sprite utilisée :`, e);
    }
  }
  if (def.look?.head && !def.sprite) return bustIcon(def, alt);
  return headIcon(sprite);
}

function headIcon(sprite) {
  const fr = sprite.get('idle', 0);
  const src = document.createElement('canvas');
  src.width = fr.sw;
  src.height = fr.sh;
  const g = src.getContext('2d');
  g.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, 0, 0, fr.sw, fr.sh);
  const d = g.getImageData(0, 0, fr.sw, fr.sh).data;
  const solid = (x, y) => d[(y * fr.sw + x) * 4 + 3] > 0;
  let top = -1, bottom = -1;
  for (let y = 0; y < fr.sh; y++) {
    for (let x = 0; x < fr.sw; x++) {
      if (solid(x, y)) {
        if (top < 0) top = y;
        bottom = y;
        break;
      }
    }
  }
  if (top < 0) return src;
  // Cadre = un peu plus de la moitié haute du perso, centré sur la tête.
  const size = Math.max(8, Math.round((bottom - top + 1) * 0.55));
  let left = fr.sw, right = 0;
  for (let y = top; y < Math.min(fr.sh, top + Math.round(size * 0.6)); y++) {
    for (let x = 0; x < fr.sw; x++) {
      if (solid(x, y)) {
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
  }
  const out = document.createElement('canvas');
  out.width = out.height = size;
  out.getContext('2d').drawImage(src, -Math.round((left + right + 1) / 2 - size / 2), -(top - 1));
  return out;
}

// ---------------------------------------------------------------- Sprite sheets

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image introuvable : ${src}`));
    img.src = src;
  });
}

function recolor(img, filter) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d');
  g.filter = filter;
  g.drawImage(img, 0, 0);
  return c;
}

/** Atlas produit par tools/import-sprites.mjs : chaque frame = [x, y, largeur, hauteur, ancreX, ancreY]. */
async function atlasSprite(def, alt, sd) {
  const sp = def.sprite;
  // Atlas HD (écran) ou sa réduction exacte (téléphones) : coordonnées divisées, échelle multipliée
  const f = sd && sp.sd ? sp.sd.factor : 1;
  // ?v= : numéro d'import, pour qu'un navigateur ne garde jamais un ancien atlas
  // téléphones : WebP léger si l'outil l'a généré (5× plus petit que le PNG)
  const file = f > 1 ? sp.sd.webp || sp.sd.atlas : sp.atlas;
  let img = await loadImage(def.base + file + (sp.version ? `?v=${sp.version}` : ''));
  if (alt) img = recolor(img, sp.altFilter || ALT_FILTER);
  const scale = (sp.scale ?? 1) * f;
  const anims = {};
  for (const [name, a] of Object.entries(sp.animations)) {
    anims[name] = {
      frames: a.frames.map(([sx, sy, sw, sh, ax, ay]) => ({ img, sx: sx / f, sy: sy / f, sw: sw / f, sh: sh / f, ax: ax / f, ay: ay / f, scale })),
      fps: a.fps ?? 10,
      loop: a.loop ?? LOOPING.has(name),
      phased: !!a.phased,
    };
  }
  return new Sprite(anims, sp.aliases);
}

async function sheetSprite(def, alt, sd) {
  const sp = def.sprite;
  if (sp.atlas) return atlasSprite(def, alt, sd);
  const images = new Map();
  const get = async (file) => {
    if (!images.has(file)) {
      const altFile = alt && sp.altSheet && file === sp.sheet ? sp.altSheet : file;
      let img = await loadImage(def.base + altFile);
      if (alt && altFile === file) img = recolor(img, sp.altFilter || ALT_FILTER);
      images.set(file, img);
    }
    return images.get(file);
  };

  const fw = sp.frameWidth, fh = sp.frameHeight;
  const ax = sp.anchorX ?? fw / 2, ay = sp.anchorY ?? fh - 1, scale = sp.scale ?? 1;
  const anims = {};
  for (const [name, a] of Object.entries(sp.animations || {})) {
    const img = await get(a.file || sp.sheet);
    const row = a.file ? (a.row ?? 0) : (a.row ?? 0);
    const col = a.col ?? 0;
    const n = a.frames ?? 1;
    const frames = [];
    for (let i = 0; i < n; i++) frames.push({ img, sx: (col + i) * fw, sy: row * fh, sw: fw, sh: fh, ax, ay, scale });
    anims[name] = { frames, fps: a.fps ?? 10, loop: a.loop ?? LOOPING.has(name), phased: !!a.phased };
  }
  if (!Object.keys(anims).length) throw new Error('aucune animation définie');
  return new Sprite(anims);
}

// ---------------------------------------------------------------- Placeholders procéduraux

const sind = (d) => Math.sin((d * Math.PI) / 180);
const cosd = (d) => Math.cos((d * Math.PI) / 180);

function hexRgb(c) {
  const n = parseInt(String(c).replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(c, f) {
  let [r, g, b] = hexRgb(c);
  if (f < 1) {
    r *= f; g *= f; b *= f;
  } else {
    const k = f - 1;
    r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k;
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

const BASE_LOOK = { bodyW: 8, bodyH: 9, headW: 8, headH: 8, armU: 4, armL: 4, legU: 4, legL: 5, limb: 2, sink: 0, style: 'headband' };
const BASE_COLORS = { main: '#e63946', accent: '#ffb703', skin: '#f4c39b', dark: '#2b2d42' };

// Angles en degrés : 0 = vers le bas, 90 = vers l'avant, 180 = vers le haut, -90 = vers l'arrière.
// Chaque membre = [segment haut, segment bas].
const STANCE = { lF: [16, -4], lB: [-16, 4] };
const GUARD = { aF: [35, 150], aB: [20, 140] };
const CROUCH = { lF: [75, -5], lB: [-55, 10] };
const P = (o) => ({ ...STANCE, ...GUARD, ...o });
const A = (o) => P({ ...o, air: true });

const RUN = [
  { lF: [35, 10], lB: [-35, -60], aF: [-40, 20], aB: [40, 120], bob: 0 },
  { lF: [15, -5], lB: [-15, -70], aF: [-20, 60], aB: [20, 130], bob: 0 },
  { lF: [-10, -20], lB: [10, -30], aF: [0, 90], aB: [0, 90], bob: -1 },
  { lF: [-35, -60], lB: [35, 10], aF: [40, 120], aB: [-40, 20], bob: 0 },
  { lF: [-15, -70], lB: [15, -5], aF: [20, 130], aB: [-20, 60], bob: 0 },
  { lF: [10, -30], lB: [-10, -20], aF: [0, 90], aB: [0, 90], bob: -1 },
].map((f) => P({ ...f, lean: 2 }));

const POSES = {
  idle: { fps: 5, loop: true, frames: [0, 0, 1, 1].map((b) => P({ bob: b })) },
  run: { fps: 12, loop: true, frames: RUN },
  crouch: { fps: 1, loop: true, frames: [P({ ...CROUCH, aF: [50, 150], aB: [40, 140], lean: 2, bob: 1 })] },
  land: { fps: 1, loop: true, frames: [P({ ...CROUCH, aF: [60, 120], aB: [-50, -30], lean: 1, bob: 1 })] },
  jump: {
    fps: 8, loop: false,
    frames: [
      A({ lF: [70, 10], lB: [15, -40], aF: [150, 165], aB: [-150, -165] }),
      A({ lF: [60, 0], lB: [5, -30], aF: [120, 150], aB: [-120, -150] }),
    ],
  },
  fall: {
    fps: 6, loop: true,
    frames: [
      A({ lF: [25, 10], lB: [-20, -5], aF: [110, 130], aB: [-100, -120] }),
      A({ lF: [30, 15], lB: [-15, -5], aF: [115, 135], aB: [-105, -125] }),
    ],
  },
  jab: {
    phased: true,
    frames: [
      P({ aF: [-30, 40], aB: [30, 150], lF: [25, -5], lB: [-25, 5], lean: -1 }),
      P({ aF: [90, 90], aB: [10, 120], lF: [25, -5], lB: [-25, 5], lean: 2 }),
      P({ aF: [60, 110], lF: [25, -5], lB: [-25, 5], lean: 1 }),
    ],
  },
  ftilt: {
    phased: true,
    frames: [
      P({ lF: [70, 0], lean: -1 }),
      P({ lF: [95, 95], lean: -3, aF: [-20, 40], aB: [-40, -10] }),
      P({ lF: [50, 20], lean: -1 }),
    ],
  },
  utilt: {
    phased: true,
    frames: [
      P({ ...CROUCH, aF: [20, 60], bob: 1 }),
      P({ aF: [175, 180], aB: [-20, 30], lean: 1, bob: -1, lF: [10, 0], lB: [-10, 0] }),
      P({ aF: [140, 160] }),
    ],
  },
  dtilt: {
    phased: true,
    frames: [
      P({ ...CROUCH, lF: [60, 0], bob: 1 }),
      P({ lF: [92, 92], lB: [-60, 0], lean: -2, aF: [40, 60], aB: [-30, -10], bob: 2 }),
      P({ ...CROUCH, bob: 1 }),
    ],
  },
  nair: {
    phased: true,
    frames: [
      A({ lF: [80, -10], lB: [60, -30], aF: [60, 150], aB: [40, 150] }),
      A({ aF: [95, 95], aB: [-95, -95], lF: [80, 85], lB: [-80, -85] }),
      A({ lF: [80, -10], lB: [60, -30], aF: [60, 150], aB: [40, 150] }),
    ],
  },
  fair: {
    phased: true,
    frames: [
      A({ lF: [60, -30], aF: [-40, 20] }),
      A({ lF: [100, 100], lB: [-30, -10], aF: [-60, -40], aB: [-100, -120], lean: -2 }),
      A({ lF: [60, 30] }),
    ],
  },
  bair: {
    phased: true,
    frames: [
      A({ lB: [-40, 30], lean: 1 }),
      A({ lB: [-100, -100], lF: [30, -10], lean: 3, aF: [80, 120], aB: [60, 110] }),
      A({ lB: [-60, -30], lean: 1 }),
    ],
  },
  uair: {
    phased: true,
    frames: [
      A({ aF: [100, 120], aB: [-100, -120], lF: [60, -20], lB: [30, -30] }),
      A({ aF: [170, 175], aB: [-170, -175], lF: [20, 0], lB: [-20, 0], bob: -1 }),
      A({ aF: [130, 150], aB: [-130, -150] }),
    ],
  },
  dair: {
    phased: true,
    frames: [
      A({ lF: [80, -20], lB: [70, -30], aF: [150, 170], aB: [-150, -170] }),
      A({ lF: [5, 0], lB: [-5, 0], aF: [160, 175], aB: [-160, -175] }),
      A({ lF: [30, 10], lB: [-20, -5] }),
    ],
  },
  special_neutral: {
    phased: true,
    frames: [
      P({ aF: [-40, 10], aB: [-30, 20], lean: -1 }),
      P({ aF: [90, 90], aB: [80, 85], lean: 2, lF: [30, -5], lB: [-30, 5] }),
      P({ aF: [70, 100], aB: [60, 100] }),
    ],
  },
  special_side: {
    phased: true,
    frames: [
      P({ lean: -2, aF: [-60, -20], aB: [-30, 30] }),
      A({ lean: 4, aF: [90, 90], aB: [-80, -90], lF: [-30, -60], lB: [-60, -80] }),
      P({ lean: 1, aF: [60, 110] }),
    ],
  },
  special_up: {
    phased: true,
    frames: [
      P({ ...CROUCH, aF: [30, 60], bob: 1 }),
      A({ aF: [178, 180], aB: [-30, -20], lF: [5, 0], lB: [-10, -15], bob: -1 }),
      A({ aF: [160, 170], aB: [-60, -40], lF: [25, 10], lB: [-20, -5] }),
    ],
  },
  special_down: {
    phased: true,
    frames: [
      A({ lF: [80, -10], lB: [70, -20], aF: [150, 160], aB: [-150, -160] }),
      A({ lF: [5, 0], lB: [-5, 0], aF: [120, 140], aB: [-120, -140] }),
      P({ ...CROUCH, aF: [60, 30], aB: [-60, -30], bob: 2 }),
    ],
  },
  hurt: {
    fps: 8, loop: true,
    frames: [
      A({ lean: -3, aF: [-130, -150], aB: [-110, -160], lF: [40, 20], lB: [-10, -30], bob: 1 }),
      A({ lean: -2, aF: [-140, -165], aB: [-100, -140], lF: [30, 10], lB: [-20, -40], bob: 1 }),
    ],
  },
  shield: { fps: 1, loop: true, frames: [P({ ...CROUCH, aF: [40, 170], aB: [30, 160], bob: 1 })] },
  dodge: { fps: 1, loop: true, frames: [P({ ...CROUCH, aF: [60, 160], aB: [40, 150], lean: 2, bob: 2 })] },
  helpless: {
    fps: 6, loop: true,
    frames: [
      A({ aF: [-160, -170], aB: [160, 170], lF: [25, 35], lB: [-25, -35] }),
      A({ aF: [-165, -150], aB: [165, 150], lF: [30, 40], lB: [-20, -30] }),
    ],
  },
  victory: {
    fps: 4, loop: true,
    frames: [
      P({ aF: [170, 180], aB: [20, 130], lean: -1 }),
      P({ aF: [172, 178], aB: [25, 135], lean: -1, bob: 1 }),
    ],
  },
};
POSES.tumble = POSES.hurt;

function charColors(def, alt) {
  return { ...BASE_COLORS, ...(def.colors || {}), ...(alt ? def.altColors || {} : {}) };
}

/** Couleur d'une case de grille : "#rrggbb", ou un nom de couleur du perso ("skin", "main"…), suffixé D (sombre) ou L (clair). */
function resolveColor(v, C) {
  if (!v) return '#ff00ff';
  if (v[0] === '#') return v;
  if (C[v]) return C[v];
  const base = C[v.slice(0, -1)];
  if (base && v.endsWith('D')) return shade(base, 0.7);
  if (base && v.endsWith('L')) return shade(base, 1.25);
  return '#ff00ff';
}

/** Dessine une grille de pixels ("." = vide, sinon une lettre de la palette). */
function drawGrid(g, rows, palette, C, x0, y0) {
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = resolveColor(palette?.[ch] ?? ch, C);
      g.fillRect(x0 + x, y0 + y, 1, 1);
    }
  }
}

/** Contour sombre + liseré lumineux sur le haut des formes. */
function outline(g, w, h) {
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  const out = new Uint8ClampedArray(d);
  const alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] === 0) {
        if (alpha(x - 1, y) || alpha(x + 1, y) || alpha(x, y - 1) || alpha(x, y + 1)) {
          out[i] = OUTLINE[0]; out[i + 1] = OUTLINE[1]; out[i + 2] = OUTLINE[2]; out[i + 3] = 255;
        }
      } else if (!alpha(x, y - 1)) {
        out[i] = Math.min(255, d[i] * 1.12 + 28);
        out[i + 1] = Math.min(255, d[i + 1] * 1.12 + 28);
        out[i + 2] = Math.min(255, d[i + 2] * 1.12 + 28);
      }
    }
  }
  g.putImageData(new ImageData(out, w, h), 0, 0);
}

/** Icône en buste : la tête dessinée à la main (look.head) posée sur les épaules de la tenue. */
function bustIcon(def, alt) {
  const C = charColors(def, alt);
  const L = { ...BASE_LOOK, ...(def.look || {}) };
  const head = L.head, hw = head[0].length, hh = head.length;
  const S = 18, mid = S / 2;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  const R = (x, y, w, h, col) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  };
  const top = hh; // les épaules commencent sous le menton
  R(mid - 1, top - 1, 3, 2, shade(C.skin, 0.74)); // cou
  for (let y = top; y < S; y++) {
    const half = Math.min(9, 4 + (y - top) * 2);
    R(mid - half, y, half * 2, 1, C.main);
    R(mid - half, y, 2, 1, shade(C.main, 0.68));
  }
  if (L.outfit === 'mao') {
    R(mid - 2, top, 5, 1, shade(C.main, 1.25));
    for (let y = top + 2; y < S; y += 2) R(mid, y, 1, 1, shade(C.main, 0.6));
    R(mid - 5, top + 3, 3, 1, shade(C.main, 0.68));
    R(mid + 3, top + 3, 3, 1, shade(C.main, 0.68));
  }
  if (L.epaulettes) {
    R(mid - 8, top + 1, 4, 2, C.accent);
    R(mid + 5, top + 1, 4, 2, C.accent);
  }
  if (L.medals) ['#d7263d', '#f6d77c', '#0055a4', '#f6d77c'].forEach((m, i) => R(mid - 6 + i, top + 4, 1, 2, m));
  if (L.outfit === 'suit') {
    const shirt = C.shirt || '#ffffff';
    R(mid - 2, top, 5, 1, shirt);
    R(mid - 1, top + 1, 3, 1, shirt);
    R(mid, top + 2, 1, S, shirt);
    R(mid, top, 1, S, C.accent);
    R(mid - 1, top + 3, 1, S, shade(C.main, 0.6)); // revers
    R(mid + 1, top + 3, 1, S, shade(C.main, 0.6));
    if (C.pin) R(mid + 4, top + 3, 1, 1, C.pin);
  }
  drawGrid(g, head, L.palette, C, Math.round(mid - hw / 2) + (L.iconDx ?? 0), 0);
  outline(g, S, S);
  return cv;
}

function proceduralSprite(def, alt) {
  const colors = charColors(def, alt);
  const look = { ...BASE_LOOK, ...(def.look || {}) };
  const anims = {};
  for (const [name, a] of Object.entries(POSES)) {
    anims[name] = {
      fps: a.fps ?? 10,
      loop: a.loop ?? false,
      phased: !!a.phased,
      frames: a.frames.map((pose, i) => renderPose(look, colors, pose, i)),
    };
  }
  return new Sprite(anims);
}

function renderPose(L, C, pose, idx) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = FRAME;
  const g = cv.getContext('2d');
  const rect = (x, y, w, h, col) => {
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const dot = (x, y, col) => rect(x, y, 1, 1, col);
  const seg = (x0, y0, ang, len, w, col) => {
    g.fillStyle = col;
    const off = (w - 1) / 2;
    for (let t = 0; t <= len; t += 0.5) g.fillRect(Math.round(x0 + sind(ang) * t - off), Math.round(y0 + cosd(ang) * t - off), w, w);
    return [x0 + sind(ang) * len, y0 + cosd(ang) * len];
  };

  const K = {
    mainD: shade(C.main, 0.66), mainL: shade(C.main, 1.25),
    skinD: shade(C.skin, 0.74), darkD: shade(C.dark, 0.68),
    accD: shade(C.accent, 0.72), boot: C.boot || shade(C.dark, 0.5),
  };
  const W = L.limb;
  const { lF, lB, aF, aB } = pose;
  const lean = pose.lean || 0, bob = pose.bob || 0;
  const drop = (l) => L.legU * cosd(l[0]) + L.legL * cosd(l[1]);
  const hipY = Math.round(pose.air ? ANCHOR_Y - (L.legU + L.legL) - 1 : ANCHOR_Y - Math.max(drop(lF), drop(lB)));
  const hipX = ANCHOR_X;
  const topY = hipY - L.bodyH + 1 + bob;
  const shX = hipX + lean;
  const shY = topY + 1;
  const headB = topY - 1 + L.sink;
  const headT = headB - L.headH + 1;
  const headL = Math.round(shX - L.headW / 2 + 1);
  const headR = headL + L.headW - 1;
  const legOff = Math.max(0, Math.floor(L.bodyW / 4) - 1);

  const long = L.sleeves === 'long'; // costume : manches jusqu'aux poignets, mains nues
  const arm = (front, a) => {
    const sx = shX + (front ? 1 : -1) * Math.max(1, Math.floor(L.bodyW / 2 - 1));
    const sleeve = front ? C.main : K.mainD, skin = front ? C.skin : K.skinD;
    const [ex, ey] = seg(sx, shY + 1, a[0], L.armU, W, sleeve);
    const [hx, hy] = seg(ex, ey, a[1], L.armL, W, long ? sleeve : skin);
    rect(hx - 1, hy - 1, W + 1, W + 1, long ? skin : front ? C.accent : K.accD);
  };
  const leg = (front, l) => {
    const hx = front ? hipX + legOff : hipX - legOff - 2;
    const [kx, ky] = seg(hx, hipY, l[0], L.legU, W, front ? C.dark : K.darkD);
    const [fx, fy] = seg(kx, ky, l[1], L.legL, W, front ? C.dark : K.darkD);
    rect(fx - 1, fy - 1, 3, 2, K.boot);
    dot(fx + 2, fy, K.boot);
  };

  arm(false, aB);
  leg(false, lB);
  leg(true, lF);

  // Torse (incliné selon lean)
  const rows = hipY - topY;
  for (let r = 0; r <= rows; r++) {
    const off = Math.round(lean * (1 - r / Math.max(1, rows)));
    const x0 = Math.round(hipX - L.bodyW / 2) + off;
    rect(x0, topY + r, L.bodyW, 1, C.main);
    rect(x0, topY + r, 2, 1, K.mainD);
    dot(x0 + L.bodyW - 2, topY + r, K.mainL);
    const cx = x0 + Math.floor(L.bodyW / 2) + 1; // milieu du torse, un peu vers l'avant (vue de trois quarts)
    if (L.outfit === 'suit') {
      const shirt = C.shirt || '#ffffff';
      if (r === 0) {
        dot(cx - 1, topY, shirt);
        dot(cx + 1, topY, shirt);
      } else if (r === 1) dot(cx + 1, topY + 1, shirt);
      if (r >= 1 && r <= 3) {
        dot(cx - 1, topY + r, K.mainD);
        dot(cx + 2, topY + r, K.mainD);
      }
      if (r <= rows - 3) dot(cx, topY + r, r === rows - 3 ? K.accD : C.accent);
      if (C.pin && r === 2) dot(cx + 2, topY + 2, C.pin);
    } else if (L.outfit === 'mao') {
      if (r === 0) rect(cx - 2, topY, 5, 1, K.mainL);
      if (r >= 2 && r % 2 === 0 && r < rows) dot(cx, topY + r, K.mainD);
      if (r === 3) {
        rect(cx - 3, topY + 3, 2, 1, K.mainD);
        rect(cx + 2, topY + 3, 2, 1, K.mainD);
      }
    }
  }
  rect(Math.round(hipX - L.bodyW / 2), hipY - 1, L.bodyW, 1, C.belt || (L.outfit ? K.mainD : C.accent));
  // Uniforme de général : épaulettes dorées et rangée de médailles
  const tx0 = Math.round(hipX - L.bodyW / 2) + lean;
  if (L.epaulettes) {
    rect(tx0 - 1, topY, 3, 2, C.accent);
    rect(tx0 + L.bodyW - 2, topY, 3, 2, C.accent);
  }
  if (L.medals) ['#d7263d', '#f6d77c', '#0055a4'].forEach((m, i) => dot(tx0 + 2 + i, topY + 3, m));

  // Tête
  if (L.head) {
    const wid = L.head[0].length;
    drawGrid(g, L.head, L.palette, C, Math.round(shX - wid / 2) + (L.headDx ?? 1), headB - L.head.length + 1);
  } else drawProceduralHead();

  arm(true, aF);
  outline(g, FRAME, FRAME);
  return { img: cv, sx: 0, sy: 0, sw: FRAME, sh: FRAME, ax: ANCHOR_X, ay: ANCHOR_Y, scale: 1 };

  // Tête procédurale des placeholders (sans grille look.head)
  function drawProceduralHead() {
    rect(headL, headT, L.headW, L.headH, C.skin);
    rect(headL, headT, 2, L.headH, K.skinD);
    for (const [x, y] of [[headL, headT], [headR, headT], [headL, headB], [headR, headB]]) g.clearRect(x, y, 1, 1);

    const ey = headT + Math.floor(L.headH / 2) - 1;
    const eyes = () => {
      const ex = headR - 2;
      dot(ex, ey, '#ffffff');
      dot(ex, ey + 1, '#ffffff');
      dot(ex + 1, ey, C.eye || '#140d1f');
      dot(ex + 1, ey + 1, C.eye || '#140d1f');
    };

    switch (L.style) {
      case 'spiky': {
        const h = C.hair || C.accent, hD = shade(h, 0.72);
        rect(headL, headT, L.headW, 2, h);
        rect(headL, headT, 2, 5, h);
        const spikes = [[0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [5, -1], [-1, -1], [-1, -2], [-2, -2], [-2, -3], [-3, -3], [-4, -4],
          [1, -2], [2, -3], [3, -2], [4, -3], [5, -2], [6, -1], [-1, 0], [-2, 0], [-3, 1], [-1, 1], [-2, 2], [-1, 2]];
        for (const [dx, dy] of spikes) dot(headL + dx, headT + dy, h);
        dot(headL + 1, headT + 1, hD);
        dot(headL + 3, headT + 1, hD);
        eyes();
        break;
      }
      case 'golem': {
        dot(headL + 2, headT + 1, K.skinD);
        dot(headL + 3, headT + 2, K.skinD);
        dot(headL + 2, headT + 3, K.skinD);
        rect(headR - 3, ey + 1, 3, 1, C.accent);
        rect(Math.round(shX - L.bodyW / 2) - 1, shY - 1, 4, 3, C.dark);
        rect(Math.round(shX + L.bodyW / 2) - 3, shY - 1, 4, 3, C.dark);
        rect(hipX, topY + 3, 2, 2, C.accent);
        break;
      }
      case 'hood': {
        const sc = C.scarf || C.accent;
        rect(headL - 1, headT - 1, L.headW + 1, 3, C.main);
        rect(headL - 1, headT, 3, L.headH, C.main);
        dot(headR, headT + 1, C.main);
        rect(headL + 2, headT + 2, L.headW - 2, 1, shade(C.skin, 0.45));
        dot(headR - 2, ey + 1, C.accent);
        dot(headR - 1, ey + 1, C.accent);
        rect(Math.round(shX - L.bodyW / 2) + 1, topY, L.bodyW - 1, 2, sc);
        for (let k = 1; k <= 5; k++) {
          const y = topY + 1 + Math.round(Math.sin(idx * 1.2 + k * 0.9) * 0.8 + k * 0.35);
          dot(Math.round(shX - L.bodyW / 2) - k + 1, y, sc);
          if (k < 4) dot(Math.round(shX - L.bodyW / 2) - k + 1, y + 1, shade(sc, 0.72));
        }
        break;
      }
      default: {
        // 'headband'
        const hair = C.hair || C.dark;
        rect(headL, headT - 1, L.headW - 1, 2, hair);
        rect(headL, headT, 2, L.headH - 3, hair);
        rect(headL, headT + 2, L.headW, 1, C.accent);
        for (let k = 1; k <= 4; k++) dot(headL - k, headT + 2 + Math.round(Math.sin(idx * 1.3 + k) * 0.7 + k * 0.3), C.accent);
        for (let k = 1; k <= 3; k++) dot(headL - k, headT + 3 + Math.round(Math.sin(idx * 1.3 + k + 1) * 0.7 + k * 0.4), K.accD);
        eyes();
      }
    }
  }
}
