// « Paris vu du ciel » : une nacelle en bois suspendue à deux montgolfières, au-dessus des toits.
// Géométrie de collision + décor peint en haute résolution (dégradés, lumière de fin d'après-midi).
// Le monde fait 480×270 unités ; les calques sont dessinés à R pixels par unité puis mis à l'échelle.

export const STAGE = {
  name: 'Paris · Ciel ouvert',
  // Nacelle en 3 étages (coque arrondie), on ne peut pas la traverser.
  solids: [
    { x: 100, y: 190, w: 280, h: 12 },
    { x: 118, y: 202, w: 244, h: 14 },
    { x: 148, y: 216, w: 184, h: 12 },
  ],
  // Planches portées par des ballons : traversables (bas sur le joystick), elles flottent doucement.
  platforms: [
    { x: 128, y: 142, w: 64, passable: true, baseY: 142, phase: 0, colors: ['#2f5fd0', '#1c3f99', '#8fb1ff'] },
    { x: 208, y: 98, w: 64, passable: true, baseY: 98, phase: 2.1, colors: ['#f2efe8', '#b9b4a8', '#ffffff'] },
    { x: 288, y: 142, w: 64, passable: true, baseY: 142, phase: 4.2, colors: ['#d8343b', '#93202a', '#ff8f8f'] },
  ],
  blast: { left: -165, right: 645, top: -200, bottom: 370 }, // plafond haut : on survit plus longtemps aux coups vers le haut
  spawns: [{ x: 170, y: 190 }, { x: 310, y: 190 }],
  respawns: [{ x: 200, y: 46 }, { x: 280, y: 46 }],
  /** À appeler une fois par frame : fait monter et descendre les planches. */
  update(t) {
    for (const p of this.platforms) {
      p.prevY = p.y;
      p.y = p.baseY + Math.sin(t * 0.03 + p.phase) * 2;
    }
  },
};

const R = 3; // pixels par unité du monde dans les calques pré-dessinés
const SUN = { x: 338, y: 120 };
const BALLOON_W = 78, BALLOON_H = 96;

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Calque en unités du monde, dessiné à la résolution R. */
function layerCanvas(w, h, res = R) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * res);
  c.height = Math.ceil(h * res);
  const g = c.getContext('2d');
  g.scale(res, res);
  c.ww = w;
  c.wh = h;
  return [c, g];
}

const lin = (g, x0, y0, x1, y1, stops) => {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  return gr;
};
const rad = (g, x, y, r0, r1, stops, x1 = x, y1 = y) => {
  const gr = g.createRadialGradient(x, y, r0, x1, y1, r1);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  return gr;
};

let L = null;
function layers() {
  if (!L) {
    L = {
      far: makeFar(),
      eiffel: makeEiffel(),
      mid: makeMid(),
      near: makeNear(),
      deck: makeDeck(),
      balloon: makeBalloon(),
      plank: makePlank(),
      bunches: STAGE.platforms.map((p) => makeBunch(p.colors)),
      clouds: [
        { img: makeCloud(1, 120, 40), x: 20, y: 18, v: 0.03 },
        { img: makeCloud(2, 70, 24), x: 260, y: 70, v: 0.022 },
        { img: makeCloud(3, 150, 48), x: 520, y: 4, v: 0.035 },
        { img: makeCloud(4, 90, 30), x: 760, y: 110, v: 0.026 },
        { img: makeCloud(5, 110, 36), x: 960, y: 46, v: 0.03 },
      ],
      front: [
        { img: makeCloud(7, 230, 60, true), x: 0, y: 252, v: 0.11 },
        { img: makeCloud(8, 180, 50, true), x: 480, y: 270, v: 0.14 },
        { img: makeCloud(9, 260, 66, true), x: 860, y: 258, v: 0.09 },
      ],
    };
  }
  return L;
}

// ---------------------------------------------------------------- ciel et nuages

/** Cumulus doux : bouffées superposées, ombre bleutée dessous, liseré doré côté soleil. */
function makeCloud(seed, w, h, low = false) {
  const r = rng(seed * 131);
  const [c, g] = layerCanvas(w, h);
  const puffs = [];
  const n = Math.round(w / 7);
  for (let i = 0; i < n; i++) {
    const u = (i + r()) / n;
    const lift = Math.sin(u * Math.PI);
    puffs.push({ x: w * (0.08 + u * 0.84), y: h * (0.72 - lift * 0.32 * (0.6 + r() * 0.6)), rr: h * (0.18 + lift * 0.22 + r() * 0.08) });
  }
  // ombre (dessous)
  for (const p of puffs) {
    g.fillStyle = rad(g, p.x, p.y + 3, 0, p.rr * 1.1, [[0, low ? 'rgba(150,163,190,0.95)' : 'rgba(170,183,208,0.9)'], [0.75, 'rgba(170,183,208,0.55)'], [1, 'rgba(170,183,208,0)']]);
    g.beginPath();
    g.arc(p.x, p.y + 3, p.rr * 1.1, 0, Math.PI * 2);
    g.fill();
  }
  // corps éclairé (dessus)
  for (const p of puffs) {
    g.fillStyle = rad(g, p.x - p.rr * 0.2, p.y - p.rr * 0.35, 0, p.rr, [[0, '#fffaf2'], [0.6, 'rgba(250,246,240,0.92)'], [1, 'rgba(240,238,236,0)']], p.x, p.y);
    g.beginPath();
    g.arc(p.x, p.y, p.rr, 0, Math.PI * 2);
    g.fill();
  }
  // lumière chaude venant de la droite (le soleil)
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, 0, 0, w, 0, [[0, 'rgba(120,140,190,0.18)'], [0.6, 'rgba(255,220,170,0)'], [1, 'rgba(255,205,150,0.35)']]);
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  return c;
}

// ---------------------------------------------------------------- Paris au loin

const FAR_W = 1100, FAR_H = 110;

function makeFar() {
  const [c, g] = layerCanvas(FAR_W, FAR_H);
  const r = rng(21);
  const B = FAR_H; // base
  const haze = (k) => `rgba(${Math.round(150 + k * 40)},${Math.round(166 + k * 32)},${Math.round(196 + k * 20)},1)`;
  const building = (x, w, h, k = 0) => {
    g.fillStyle = lin(g, 0, B - h, 0, B, [[0, haze(0.5 + k)], [1, haze(k)]]);
    g.fillRect(x, B - h, w, h);
    g.fillStyle = 'rgba(255,225,190,0.35)'; // façade éclairée côté soleil
    g.fillRect(x + w - Math.max(1, w * 0.25), B - h, Math.max(1, w * 0.25), h);
  };
  // collines lointaines
  g.fillStyle = lin(g, 0, B - 26, 0, B, [[0, haze(0.75)], [1, haze(0.4)]]);
  g.beginPath();
  g.moveTo(0, B);
  for (let x = 0; x <= FAR_W; x += 10) g.lineTo(x, B - 10 - Math.sin(x * 0.006) * 6 - Math.sin(x * 0.017 + 1) * 3);
  g.lineTo(FAR_W, B);
  g.fill();
  // tissu urbain
  for (let x = 0; x < FAR_W; ) {
    const w = 6 + r() * 14, h = 8 + r() * 12;
    building(x, w, h, r() * 0.2);
    x += w + r() * 1.5;
  }
  // La Défense, tout au fond
  for (const [x, w, h] of [[188, 7, 42], [197, 9, 52], [208, 6, 36], [216, 8, 46], [236, 6, 30]]) building(x, w, h, 0.45);
  g.fillStyle = haze(0.62);
  g.fillRect(224, B - 30, 11, 30); // Grande Arche
  g.clearRect(226.5, B - 26, 6, 26);
  // Arc de Triomphe
  building(330, 16, 16, 0.3);
  g.clearRect(335, B - 11, 6, 11);
  g.fillStyle = haze(0.6);
  g.fillRect(329, B - 18, 18, 2);
  // Invalides et son dôme doré
  building(406, 32, 16, 0.25);
  g.fillStyle = haze(0.42);
  g.fillRect(417, B - 24, 10, 8);
  g.fillStyle = lin(g, 414, 0, 430, 0, [[0, '#b8913c'], [0.6, '#f0cf6a'], [1, '#ffe7a3']]);
  g.beginPath();
  g.ellipse(422, B - 24, 6.5, 9, 0, Math.PI, 0);
  g.fill();
  g.fillRect(421.2, B - 38, 1.6, 6);
  // Tour Montparnasse
  g.fillStyle = lin(g, 520, 0, 532, 0, [[0, '#7f8ea8'], [0.7, '#9aa8bf'], [1, '#d7c7b5']]);
  g.fillRect(520, B - 58, 12, 58);
  g.fillStyle = 'rgba(40,50,70,0.25)';
  for (let y = B - 56; y < B; y += 3) g.fillRect(520, y, 12, 0.6);
  // Panthéon
  building(600, 26, 15, 0.3);
  g.fillStyle = haze(0.5);
  g.fillRect(607, B - 23, 12, 8);
  g.fillStyle = lin(g, 607, 0, 619, 0, [[0, haze(0.4)], [1, '#e6dccf']]);
  g.beginPath();
  g.ellipse(613, B - 23, 6, 7, 0, Math.PI, 0);
  g.fill();
  g.fillRect(612.4, B - 33, 1.2, 4);
  // Notre-Dame : deux tours carrées
  building(672, 34, 14, 0.3);
  building(664, 7, 28, 0.38);
  building(673, 7, 28, 0.38);
  g.fillStyle = haze(0.3);
  g.beginPath();
  g.moveTo(690, B - 14);
  g.lineTo(691, B - 34);
  g.lineTo(692, B - 14);
  g.fill();
  // Butte Montmartre et Sacré-Cœur
  g.fillStyle = lin(g, 0, B - 40, 0, B, [[0, '#9fb3a6'], [1, haze(0.3)]]);
  g.beginPath();
  g.moveTo(760, B);
  g.bezierCurveTo(800, B - 34, 870, B - 44, 920, B - 36);
  g.bezierCurveTo(960, B - 30, 990, B - 10, 1010, B);
  g.fill();
  const stone = lin(g, 860, 0, 900, 0, [[0, '#d9d7d0'], [0.6, '#f3efe6'], [1, '#fff7ea']]);
  g.fillStyle = stone;
  g.fillRect(866, B - 56, 34, 14);
  for (const [x, rx, ry, top] of [[883, 7, 12, 56], [872, 4, 6, 56], [894, 4, 6, 56]]) {
    g.beginPath();
    g.ellipse(x, B - top, rx, ry, 0, Math.PI, 0);
    g.fill();
  }
  g.fillRect(882.3, B - 74, 1.4, 6);
  g.fillRect(904, B - 66, 5, 24); // campanile
  g.beginPath();
  g.ellipse(906.5, B - 66, 2.5, 4, 0, Math.PI, 0);
  g.fill();
  // brume qui monte du sol
  g.fillStyle = lin(g, 0, B - 40, 0, B, [[0, 'rgba(240,215,190,0)'], [1, 'rgba(240,215,190,0.55)']]);
  g.fillRect(0, B - 40, FAR_W, 40);
  return c;
}

// ---------------------------------------------------------------- tour Eiffel

const EIFFEL_W = 90, EIFFEL_H = 170;

function makeEiffel() {
  const [c, g] = layerCanvas(EIFFEL_W, EIFFEL_H, 4);
  const cx = EIFFEL_W / 2, H = EIFFEL_H;
  const y3 = H * 0.13, y2 = H * 0.46, y1 = H * 0.71;
  const hw = (y) => 0.8 + 39 * Math.pow(y / H, 2.35);
  // silhouette (les quatre pieds et l'arche)
  const outline = new Path2D();
  outline.moveTo(cx - 0.5, 0);
  for (let y = 0; y <= H; y += 2) outline.lineTo(cx + hw(y), y);
  const archTop = y1 + 6, legIn = (y) => cx + Math.max(0, hw(y) - 9 - (y - y1) * 0.06);
  outline.lineTo(legIn(H), H);
  outline.quadraticCurveTo(cx + 4, archTop - 2, cx, archTop);
  outline.quadraticCurveTo(cx - 4, archTop - 2, 2 * cx - legIn(H), H);
  for (let y = H; y >= 0; y -= 2) outline.lineTo(cx - hw(y), y);
  outline.closePath();
  g.save();
  g.clip(outline);
  // teinte bronze, côté soleil plus chaud
  g.fillStyle = lin(g, cx - 40, 0, cx + 40, 0, [[0, 'rgba(70,56,52,0.55)'], [0.55, 'rgba(110,86,70,0.55)'], [1, 'rgba(200,150,105,0.65)']]);
  g.fillRect(0, 0, EIFFEL_W, H);
  // treillis : croisillons fins
  g.lineWidth = 0.35;
  g.strokeStyle = 'rgba(60,46,42,0.85)';
  for (let k = -H; k < EIFFEL_W + H; k += 3.2) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + H * 0.55, H);
    g.stroke();
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k - H * 0.55, H);
    g.stroke();
  }
  g.restore();
  // arêtes et plateformes
  g.strokeStyle = '#4b3c37';
  g.lineWidth = 1.1;
  g.stroke(outline);
  for (const [y, extra, th] of [[y1, 4, 4], [y2, 3, 3], [y3, 2, 2]]) {
    const w = hw(y) + extra;
    g.fillStyle = lin(g, 0, y, 0, y + th, [[0, '#8a6e5c'], [1, '#4b3c37']]);
    g.fillRect(cx - w, y, w * 2, th);
    g.fillStyle = 'rgba(255,215,160,0.5)';
    g.fillRect(cx, y, w, 0.6);
  }
  g.fillStyle = '#5a4842';
  g.fillRect(cx - 0.4, -2, 0.8, 8); // antenne
  return c;
}

// ---------------------------------------------------------------- immeubles haussmanniens

const MID_W = 1300, MID_H = 104;

function makeMid() {
  const [c, g] = layerCanvas(MID_W, MID_H);
  const r = rng(5);
  const stones = [['#ecdcc0', '#f8ecd4', '#cdb894'], ['#e5d4b4', '#f4e6ca', '#c4ae88'], ['#efe3cc', '#fff4de', '#d3c3a2']];
  for (let x = 0; x < MID_W; ) {
    const worldX = x - (MID_W / 2 - 240);
    const bw = 46 + r() * 36;
    if (worldX > 6 && worldX < 112) {
      // Champ-de-Mars : arbres devant la tour Eiffel
      for (let tx = x; tx < x + bw; tx += 8) {
        const ty = MID_H - 30 - r() * 6, rr = 7 + r() * 4;
        g.fillStyle = rad(g, tx + 2, ty - 3, 0, rr * 1.2, [[0, '#8db86b'], [0.6, '#5d8c48'], [1, '#3f6635']], tx, ty);
        g.beginPath();
        g.arc(tx, ty, rr, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#3f6635';
      g.fillRect(x, MID_H - 28, bw, 28);
      x += bw;
      continue;
    }
    haussmann(g, x, bw, 64 + r() * 22, stones[(r() * stones.length) | 0], r);
    x += bw + 0.6;
  }
  // brume chaude au pied des immeubles
  g.fillStyle = lin(g, 0, MID_H - 34, 0, MID_H, [[0, 'rgba(246,222,196,0)'], [1, 'rgba(246,222,196,0.5)']]);
  g.fillRect(0, MID_H - 34, MID_W, 34);
  return c;
}

/** Un immeuble haussmannien : pierre de taille, balcons filants, toit mansardé en zinc, lucarnes. */
function haussmann(g, x, w, h, [stone, light, dark], r) {
  const top = MID_H - h, roofH = 15, fTop = top + roofH;
  // façade
  g.fillStyle = lin(g, x, 0, x + w, 0, [[0, dark], [0.25, stone], [0.85, light], [1, '#fff6e4']]);
  g.fillRect(x, fTop, w, MID_H - fTop);
  // corniche
  g.fillStyle = light;
  g.fillRect(x - 0.5, fTop - 1, w + 1, 1.6);
  g.fillStyle = 'rgba(60,40,20,0.25)';
  g.fillRect(x, fTop + 0.6, w, 1.2);
  const cols = Math.max(3, Math.floor((w - 6) / 7.5));
  const gap = (w - 6) / cols;
  for (let k = 0, fy = fTop + 5; fy < MID_H - 6; k++, fy += 11) {
    // bandeau de pierre entre les étages
    g.fillStyle = 'rgba(80,60,30,0.12)';
    g.fillRect(x, fy + 8.6, w, 0.5);
    for (let i = 0; i < cols; i++) {
      const wx = x + 3 + i * gap + gap / 2 - 1.7;
      // fenêtre : encadrement clair, vitre qui reflète le ciel
      g.fillStyle = '#fbf3e3';
      g.fillRect(wx - 0.5, fy - 0.5, 4.4, 7.8);
      g.fillStyle = lin(g, 0, fy, 0, fy + 7, [[0, '#8fb3d6'], [0.5, '#5b7896'], [1, '#3a4b5e']]);
      g.fillRect(wx, fy, 3.4, 6.8);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(wx + 0.3, fy + 0.3, 0.8, 3);
      g.fillStyle = '#e8dcc6';
      g.fillRect(wx + 1.55, fy, 0.3, 6.8);
      if (r() < 0.22) {
        g.fillStyle = '#6b7f74'; // volets
        g.fillRect(wx - 1.6, fy, 1, 6.8);
        g.fillRect(wx + 4, fy, 1, 6.8);
      }
    }
    if (k === 1 || k === 4) {
      // balcon filant en fer forgé
      g.fillStyle = '#2a2a2e';
      g.fillRect(x + 1, fy + 6.8, w - 2, 0.6);
      g.fillRect(x + 1, fy + 4.4, w - 2, 0.35);
      g.fillStyle = 'rgba(40,40,46,0.8)';
      for (let bx = x + 1.5; bx < x + w - 1; bx += 1.2) g.fillRect(bx, fy + 4.4, 0.25, 2.4);
      g.fillStyle = 'rgba(40,30,20,0.18)';
      g.fillRect(x, fy + 7.4, w, 1.2);
    }
  }
  // toit mansardé en zinc
  g.fillStyle = lin(g, 0, top, 0, fTop, [[0, '#a7b6c6'], [0.4, '#7f91a5'], [1, '#5f7186']]);
  g.beginPath();
  g.moveTo(x + 2, top + 3);
  g.lineTo(x + w - 2, top + 3);
  g.lineTo(x + w, fTop - 1);
  g.lineTo(x, fTop - 1);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(40,52,68,0.25)';
  for (let sx = x + 3; sx < x + w - 2; sx += 2.5) g.fillRect(sx, top + 3, 0.25, roofH - 4);
  g.fillStyle = '#c3cfdb';
  g.fillRect(x + 2, top + 2, w - 4, 1.2);
  // lucarnes
  for (let i = 0; i < cols; i++) {
    if (i % 2) continue;
    const lx = x + 3 + i * gap + gap / 2 - 2.2;
    g.fillStyle = '#f2ebde';
    g.beginPath();
    g.moveTo(lx, top + 13);
    g.lineTo(lx, top + 7.5);
    g.quadraticCurveTo(lx + 2.2, top + 4.5, lx + 4.4, top + 7.5);
    g.lineTo(lx + 4.4, top + 13);
    g.fill();
    g.fillStyle = lin(g, 0, top + 7, 0, top + 13, [[0, '#7fa1c2'], [1, '#3b4b5c']]);
    g.fillRect(lx + 0.8, top + 8, 2.8, 4.6);
  }
  // souches de cheminée et leurs pots en terre cuite
  const stacks = r() < 0.6 ? 2 : 1;
  for (let i = 0; i < stacks; i++) {
    const cw = 7 + r() * 8, cx = x + 4 + r() * Math.max(1, w - cw - 8);
    g.fillStyle = lin(g, cx, 0, cx + cw, 0, [[0, '#9a5a40'], [0.7, '#c47b58'], [1, '#e09a74']]);
    g.fillRect(cx, top - 5, cw, 8);
    g.fillStyle = '#7a4532';
    g.fillRect(cx - 0.5, top - 5.5, cw + 1, 1);
    for (let px = cx + 0.8; px < cx + cw - 1; px += 1.8) {
      g.fillStyle = '#d98a60';
      g.fillRect(px, top - 8.5, 1.1, 3);
    }
  }
}

// ---------------------------------------------------------------- toits du premier plan

const NEAR_W = 1400, NEAR_H = 76;

function makeNear() {
  const [c, g] = layerCanvas(NEAR_W, NEAR_H);
  const r = rng(77);
  for (let x = 0; x < NEAR_W; ) {
    const bw = 80 + r() * 70, top = 18 + r() * 14;
    // pan de toit en zinc, dans l'ombre, avec reflet doré sur l'arête
    g.fillStyle = lin(g, 0, top, 0, NEAR_H, [[0, '#6f8096'], [0.3, '#56677c'], [1, '#2c3644']]);
    g.beginPath();
    g.moveTo(x, NEAR_H);
    g.lineTo(x + 4, top);
    g.lineTo(x + bw - 4, top);
    g.lineTo(x + bw, NEAR_H);
    g.fill();
    g.fillStyle = 'rgba(25,32,42,0.35)';
    for (let sx = x + 6; sx < x + bw - 4; sx += 5) g.fillRect(sx, top + 1, 0.5, NEAR_H);
    g.fillStyle = lin(g, x, 0, x + bw, 0, [[0, 'rgba(255,210,150,0.2)'], [1, 'rgba(255,214,160,0.75)']]);
    g.fillRect(x + 4, top - 0.4, bw - 8, 1.6);
    // cheminée
    const cw = 14 + r() * 10, cx = x + 10 + r() * (bw - cw - 20);
    g.fillStyle = lin(g, cx, 0, cx + cw, 0, [[0, '#7a4433'], [0.75, '#b06a4c'], [1, '#d6896a']]);
    g.fillRect(cx, top - 11, cw, 13);
    g.fillStyle = '#5f3427';
    g.fillRect(cx - 1, top - 12, cw + 2, 1.6);
    for (let px = cx + 1.2; px < cx + cw - 2; px += 3.4) {
      g.fillStyle = lin(g, px, 0, px + 2, 0, [[0, '#a85f43'], [1, '#e2956c']]);
      g.fillRect(px, top - 16.5, 2.2, 5);
    }
    if (r() < 0.55) {
      const vx = x + 8 + r() * (bw - 28); // fenêtre de toit qui reflète le ciel
      g.fillStyle = '#2b333d';
      g.fillRect(vx, top + 9, 12, 8);
      g.fillStyle = lin(g, vx, top + 9, vx + 12, top + 17, [[0, '#cfe3f3'], [0.5, '#88a7c4'], [1, '#4b6178']]);
      g.fillRect(vx + 1, top + 10, 10, 6);
    }
    if (r() < 0.4) {
      const ax = x + 12 + r() * (bw - 24); // antenne râteau
      g.fillStyle = '#2a2d33';
      g.fillRect(ax, top - 16, 0.6, 16);
      for (const [dy, w2] of [[-15, 8], [-12, 6], [-9, 4]]) g.fillRect(ax - w2 / 2, top + dy, w2, 0.5);
    }
    x += bw + 3;
  }
  return c;
}

// ---------------------------------------------------------------- la nacelle et ses ballons

function makeDeck() {
  const [c, g] = layerCanvas(280, 50, 4);
  // coque arrondie, peinte en vert wagon
  const hull = new Path2D();
  hull.moveTo(0, 4);
  hull.lineTo(280, 4);
  hull.bezierCurveTo(279, 22, 262, 30, 232, 38);
  hull.lineTo(48, 38);
  hull.bezierCurveTo(18, 30, 1, 22, 0, 4);
  g.fillStyle = lin(g, 0, 4, 0, 38, [[0, '#3c7563'], [0.45, '#2b5a4c'], [1, '#173a31']]);
  g.fill(hull);
  g.save();
  g.clip(hull);
  // bordé en lattes
  g.strokeStyle = 'rgba(10,30,24,0.45)';
  g.lineWidth = 0.35;
  for (let y = 9; y < 40; y += 4.2) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(280, y);
    g.stroke();
  }
  // lumière de fin de journée sur la droite
  g.fillStyle = lin(g, 0, 0, 280, 0, [[0, 'rgba(0,0,0,0.25)'], [0.6, 'rgba(255,220,170,0)'], [1, 'rgba(255,214,160,0.3)']]);
  g.fillRect(0, 0, 280, 50);
  g.restore();
  // liseré doré et hublots en laiton
  g.fillStyle = lin(g, 0, 10, 0, 12, [[0, '#f6d77c'], [1, '#a67c26']]);
  g.fillRect(2, 10, 276, 1.6);
  for (let x = 30; x < 260; x += 32) {
    g.fillStyle = rad(g, x - 1, 20, 0, 4.6, [[0, '#ffe9a6'], [0.6, '#d0a03c'], [1, '#7a5718']]);
    g.beginPath();
    g.arc(x, 21, 4.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = lin(g, x - 3, 18, x + 3, 24, [[0, '#d7ecfb'], [0.5, '#7fa6c9'], [1, '#2d4a66']]);
    g.beginPath();
    g.arc(x, 21, 3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.beginPath();
    g.ellipse(x - 1, 19.8, 1.1, 0.6, -0.5, 0, Math.PI * 2);
    g.fill();
  }
  // quille cerclée de fer
  g.fillStyle = lin(g, 0, 36, 0, 40, [[0, '#5b6068'], [1, '#2c2f35']]);
  g.fillRect(48, 36.5, 184, 3);
  // pont en lattes de chêne
  g.fillStyle = lin(g, 0, 0, 0, 5, [[0, '#f3d8a6'], [0.4, '#c99a5f'], [1, '#8a6238']]);
  g.fillRect(0, 0, 280, 5);
  g.fillStyle = 'rgba(90,60,30,0.5)';
  for (let x = 13; x < 280; x += 14) g.fillRect(x, 0.6, 0.35, 4);
  // sacs de lest suspendus
  for (const bx of [8, 272, 60, 220]) {
    const by = bx === 8 || bx === 272 ? 9 : 36;
    g.strokeStyle = '#5a4632';
    g.lineWidth = 0.4;
    g.beginPath();
    g.moveTo(bx, by - 4);
    g.lineTo(bx, by);
    g.stroke();
    g.fillStyle = rad(g, bx - 1, by + 2, 0, 4, [[0, '#ead6ad'], [1, '#a88f68']]);
    g.beginPath();
    g.ellipse(bx, by + 2.5, 2.6, 3.2, 0, 0, Math.PI * 2);
    g.fill();
  }
  // ancre
  g.strokeStyle = '#3a3f47';
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(140, 39);
  g.lineTo(140, 47);
  g.moveTo(136, 43);
  g.quadraticCurveTo(140, 49, 144, 43);
  g.moveTo(137.5, 41);
  g.lineTo(142.5, 41);
  g.stroke();
  return c;
}

/** Montgolfière : fuseaux bleu-blanc-rouge, ombrage sphérique, ceinture dorée. */
function makeBalloon() {
  const [c, g] = layerCanvas(BALLOON_W, BALLOON_H, 4);
  const cx = BALLOON_W / 2;
  const hw = (y) => (y <= 40 ? 37 * Math.sqrt(Math.max(0, 1 - ((40 - y) / 40) ** 2)) : 6 + 31 * (1 - ((y - 40) / 48) ** 1.6));
  const env = new Path2D();
  for (let y = 0; y <= 88; y += 1) env.lineTo(cx + hw(y), y);
  for (let y = 88; y >= 0; y -= 1) env.lineTo(cx - hw(y), y);
  env.closePath();
  g.save();
  g.clip(env);
  const gores = ['#2f5fd0', '#f4efe6', '#d8343b'];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i / n) * Math.PI, a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI;
    g.fillStyle = gores[i % 3];
    g.beginPath();
    for (let y = 0; y <= 88; y += 2) g.lineTo(cx + Math.sin(a0) * hw(y), y);
    for (let y = 88; y >= 0; y -= 2) g.lineTo(cx + Math.sin(a1) * hw(y), y);
    g.closePath();
    g.fill();
  }
  // ombrage sphérique : lumière en haut à droite (le soleil), ombre à gauche
  g.fillStyle = rad(g, cx + 14, 18, 2, 60, [[0, 'rgba(255,245,225,0.55)'], [0.4, 'rgba(255,240,220,0.1)'], [1, 'rgba(10,15,40,0.45)']]);
  g.fillRect(0, 0, BALLOON_W, BALLOON_H);
  // ceinture dorée
  g.fillStyle = lin(g, 0, 37, 0, 44, [[0, '#f6d77c'], [0.5, '#c9a03a'], [1, '#8a6a1e']]);
  g.fillRect(0, 37, BALLOON_W, 6);
  g.restore();
  g.strokeStyle = 'rgba(20,15,30,0.5)';
  g.lineWidth = 0.5;
  g.stroke(env);
  // jupe et brûleur
  g.fillStyle = lin(g, cx - 6, 0, cx + 6, 0, [[0, '#5b3a2a'], [1, '#8a5a3e']]);
  g.fillRect(cx - 6, 88, 12, 3);
  g.fillStyle = '#3a3f47';
  g.fillRect(cx - 3, 91, 6, 2.5);
  return c;
}

function makePlank() {
  const [c, g] = layerCanvas(64, 5, 4);
  g.fillStyle = lin(g, 0, 0, 0, 4, [[0, '#f3d8a6'], [0.35, '#c99a5f'], [1, '#7a5530']]);
  g.fillRect(0, 0, 64, 4);
  g.fillStyle = 'rgba(80,50,25,0.5)';
  for (let x = 16; x < 64; x += 16) g.fillRect(x, 0.5, 0.35, 3.2);
  g.fillStyle = lin(g, 0, 0, 0, 4, [[0, '#f6d77c'], [1, '#8a6a1e']]);
  g.fillRect(0, 0, 2, 4);
  g.fillRect(62, 0, 2, 4);
  return c;
}

/** Bouquet de trois ballons brillants. */
function makeBunch([main, dark, light]) {
  const [c, g] = layerCanvas(16, 22, 4);
  for (const [bx, by] of [[4.5, 7], [11.5, 6], [8, 3.5]]) {
    g.strokeStyle = 'rgba(240,235,220,0.9)';
    g.lineWidth = 0.3;
    g.beginPath();
    g.moveTo(bx, by + 4);
    g.quadraticCurveTo(bx + (8 - bx) * 0.3, by + 10, 8, 21.5);
    g.stroke();
    g.fillStyle = rad(g, bx - 1.2, by - 1.4, 0.2, 4.4, [[0, light], [0.35, main], [1, dark]], bx, by);
    g.beginPath();
    g.ellipse(bx, by, 3.3, 3.9, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.beginPath();
    g.ellipse(bx - 1.2, by - 1.6, 0.8, 1.1, -0.5, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

// ---------------------------------------------------------------- rendu

/** Place le contexte sur un plan de parallaxe f (0 = fixe, 1 = monde). */
function setLayer(ctx, W, H, cam, base, f, drift = 0, ox = 0, oy = 0) {
  const S = base * (1 + (cam.zoom - 1) * f);
  const cx = 240 + (cam.x - 240) * f;
  const cy = 135 + (cam.y - 135) * f - drift * (1 - f);
  ctx.setTransform(S, 0, 0, S, W / 2 - cx * S + ox * f, H / 2 - cy * S + oy * f);
}

const blit = (ctx, img, x, y) => ctx.drawImage(img, x, y, img.ww, img.wh);

function drawClouds(ctx, list, t, span, alpha) {
  ctx.globalAlpha = alpha;
  for (const c of list) blit(ctx, c.img, ((c.x + t * c.v) % span) - (span - 480) / 2, c.y);
  ctx.globalAlpha = 1;
}

export function renderScenery(ctx, W, H, cam, base, t, ox = 0, oy = 0) {
  const Ls = layers();
  const drift = Math.sin(t * 0.011) * 3; // le décor ondule : on a l'impression que la nacelle flotte
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // ciel de fin d'après-midi
  setLayer(ctx, W, H, cam, base, 0.06, drift);
  ctx.fillStyle = lin(ctx, 0, -220, 0, 270, [[0, '#14305e'], [0.35, '#2f5b9a'], [0.62, '#7fa8d4'], [0.82, '#e9cfb4'], [0.93, '#f6c39b'], [1, '#f3a88a']]);
  ctx.fillRect(-1600, -900, 3700, 1170);
  ctx.fillStyle = '#f3a88a';
  ctx.fillRect(-1600, 270, 3700, 900);

  // soleil, halo et rayons
  setLayer(ctx, W, H, cam, base, 0.04, drift);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rad(ctx, SUN.x, SUN.y, 0, 170, [[0, 'rgba(255,228,170,0.55)'], [0.3, 'rgba(255,200,140,0.18)'], [1, 'rgba(255,190,130,0)']]);
  ctx.fillRect(SUN.x - 170, SUN.y - 170, 340, 340);
  for (let i = 0; i < 7; i++) {
    const a = 1.9 + i * 0.28 + Math.sin(t * 0.004 + i) * 0.04;
    ctx.fillStyle = 'rgba(255,225,180,0.045)';
    ctx.beginPath();
    ctx.moveTo(SUN.x, SUN.y);
    ctx.lineTo(SUN.x + Math.cos(a - 0.05) * 420, SUN.y + Math.sin(a - 0.05) * 420);
    ctx.lineTo(SUN.x + Math.cos(a + 0.05) * 420, SUN.y + Math.sin(a + 0.05) * 420);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = rad(ctx, SUN.x, SUN.y, 0, 12, [[0, '#ffffff'], [0.6, '#fff4d2'], [1, 'rgba(255,236,190,0)']]);
  ctx.beginPath();
  ctx.arc(SUN.x, SUN.y, 12, 0, Math.PI * 2);
  ctx.fill();

  setLayer(ctx, W, H, cam, base, 0.12, drift);
  drawClouds(ctx, Ls.clouds, t, 1150, 0.95);

  setLayer(ctx, W, H, cam, base, 0.18, drift);
  blit(ctx, Ls.far, 240 - FAR_W / 2, 262 - FAR_H);
  ctx.fillStyle = lin(ctx, 0, 262, 0, 360, [[0, '#d6c9bf'], [1, '#c4b3a8']]);
  ctx.fillRect(-1600, 262, 3700, 900);

  setLayer(ctx, W, H, cam, base, 0.28, drift);
  blit(ctx, Ls.eiffel, 72 - EIFFEL_W / 2, 268 - EIFFEL_H);

  setLayer(ctx, W, H, cam, base, 0.38, drift);
  ctx.strokeStyle = 'rgba(50,50,60,0.8)';
  ctx.lineWidth = 0.6;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const bx = ((i * 37 + t * 0.32) % 760) - 140 + (i % 2) * 14;
    const by = 70 + i * 9 + Math.sin(t * 0.04 + i * 2) * 3;
    const wing = Math.sin((t + i * 7) * 0.35) * 1.4;
    ctx.beginPath();
    ctx.moveTo(bx - 2.2, by - wing);
    ctx.quadraticCurveTo(bx - 1, by - 0.6, bx, by);
    ctx.quadraticCurveTo(bx + 1, by - 0.6, bx + 2.2, by - wing);
    ctx.stroke();
  }

  setLayer(ctx, W, H, cam, base, 0.45, drift);
  blit(ctx, Ls.mid, 240 - MID_W / 2, 312 - MID_H);
  ctx.fillStyle = '#d9c6a6';
  ctx.fillRect(-1600, 312, 3700, 900);

  setLayer(ctx, W, H, cam, base, 0.72, drift);
  blit(ctx, Ls.near, 240 - NEAR_W / 2, 332 - NEAR_H);
  ctx.fillStyle = '#2c3644';
  ctx.fillRect(-1600, 332, 3700, 900);

  setLayer(ctx, W, H, cam, base, 0.9, drift);
  drawClouds(ctx, Ls.front, t, 1300, 0.85);

  setLayer(ctx, W, H, cam, base, 1, 0, ox, oy);
  drawStage(ctx, t);
}

function drawStage(ctx, t) {
  const Ls = layers();
  const sway = Math.sin(t * 0.013) * 1.5;
  for (const side of [-1, 1]) {
    const bx = 240 + side * 206 + sway, top = -10;
    // cordages
    ctx.strokeStyle = '#5a4632';
    ctx.lineWidth = 0.7;
    for (const [dx, tx] of [[-4, 139], [4, 131]]) {
      ctx.beginPath();
      ctx.moveTo(bx + dx, top + BALLOON_H - 4);
      ctx.quadraticCurveTo(bx + dx - side * 10, 150, 240 + side * tx, 189);
      ctx.stroke();
    }
    blit(ctx, Ls.balloon, bx - BALLOON_W / 2, top);
    // flamme du brûleur
    const fl = 3 + Math.sin(t * 0.7 + side) * 1 + Math.random();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rad(ctx, bx, top + 88, 0, 10, [[0, 'rgba(255,200,110,0.8)'], [1, 'rgba(255,140,60,0)']]);
    ctx.fillRect(bx - 10, top + 78, 20, 20);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.moveTo(bx - 1.6, top + 90);
    ctx.quadraticCurveTo(bx, top + 90 - fl * 2.2, bx + 1.6, top + 90);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.moveTo(bx - 0.7, top + 90);
    ctx.quadraticCurveTo(bx, top + 90 - fl * 1.3, bx + 0.7, top + 90);
    ctx.fill();
  }
  // ombre douce de la nacelle sur l'air brumeux, puis la nacelle
  blit(ctx, Ls.deck, 100, 190);
  // garde-corps en laiton aux deux bouts
  for (const x of [100, 376]) {
    ctx.fillStyle = '#c9a03a';
    ctx.fillRect(x, 182, 4, 1);
    ctx.fillRect(x + 0.6, 182, 0.8, 8);
    ctx.fillRect(x + 2.6, 182, 0.8, 8);
  }
  for (const p of STAGE.platforms) drawPlatform(ctx, p, Ls, t);
}

function drawPlatform(ctx, p, Ls, t) {
  const i = STAGE.platforms.indexOf(p);
  for (const ex of [p.x + 5, p.x + p.w - 5]) {
    const s = Math.sin(t * 0.04 + ex) * 0.8;
    ctx.save();
    ctx.translate(ex, p.y);
    ctx.rotate(s * 0.05);
    blit(ctx, Ls.bunches[i], -8, -21.5);
    ctx.restore();
  }
  blit(ctx, Ls.plank, p.x, p.y);
}
