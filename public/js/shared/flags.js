// Drapeaux des persos, dessinés en vectoriel puis animés (ondulation) : confettis, victoire, affiches…

const W = 120, H = 80; // proportions 3:2, dessinées en haute résolution puis réduites

export const FLAG_COLORS = {
  fr: ['#0055a4', '#ffffff', '#ef4135'],
  il: ['#0038b8', '#ffffff', '#6f9cff'],
  cn: ['#de2910', '#ffde00', '#ff7a45'],
  lfi: ['#c9184a', '#ffffff', '#7b2cbf'],
  rainbow: ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'],
};

function star(g, cx, cy, r, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5, rr = i % 2 ? r * 0.382 : r;
    g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
}

const PAINT = {
  fr(g) {
    ['#0055a4', '#ffffff', '#ef4135'].forEach((c, i) => {
      g.fillStyle = c;
      g.fillRect((i * W) / 3, 0, W / 3 + 1, H);
    });
  },
  il(g) {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#0038b8';
    g.fillRect(0, H * 0.1, W, H * 0.15);
    g.fillRect(0, H * 0.75, W, H * 0.15);
    // Étoile de David : deux triangles entrelacés, au centre
    g.strokeStyle = '#0038b8';
    g.lineWidth = H * 0.04;
    g.lineJoin = 'miter';
    const r = H * 0.2;
    for (const rot of [-Math.PI / 2, Math.PI / 2]) {
      g.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = rot + (i * Math.PI * 2) / 3;
        g.lineTo(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r);
      }
      g.closePath();
      g.stroke();
    }
  },
  cn(g) {
    g.fillStyle = '#de2910';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffde00';
    star(g, W * 0.17, H * 0.27, H * 0.16);
    for (const [x, y] of [[0.33, 0.1], [0.4, 0.2], [0.4, 0.35], [0.33, 0.45]]) {
      const ang = Math.atan2(H * 0.27 - y * H, W * 0.17 - x * W);
      star(g, x * W, y * H, H * 0.055, ang);
    }
  },
  lfi(g) {
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#c9184a');
    gr.addColorStop(1, '#7b2cbf');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = '#ffffff';
    g.lineWidth = H * 0.07;
    g.beginPath();
    g.ellipse(W / 2, H / 2, H * 0.2, H * 0.17, 0, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(W / 2, H * 0.14);
    g.lineTo(W / 2, H * 0.86);
    g.stroke();
  },
  rainbow(g) {
    FLAG_COLORS.rainbow.forEach((c, i) => {
      g.fillStyle = c;
      g.fillRect(0, (i * H) / 6, W, H / 6 + 1);
    });
  },
};

const cache = new Map();
export function flagCanvas(type) {
  if (!PAINT[type]) return null;
  if (!cache.has(type)) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    PAINT[type](g);
    // léger ombrage pour donner du volume au tissu
    const sh = g.createLinearGradient(0, 0, W, 0);
    sh.addColorStop(0, 'rgba(0,0,0,0.12)');
    sh.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    sh.addColorStop(1, 'rgba(0,0,0,0.18)');
    g.fillStyle = sh;
    g.fillRect(0, 0, W, H);
    cache.set(type, c);
  }
  return cache.get(type);
}

/**
 * Drapeau qui ondule, accroché à un mât à gauche : (x, y) = haut du mât côté tissu.
 * dir = -1 pour un drapeau qui flotte vers la gauche.
 */
export function drawFlag(ctx, type, x, y, w, h, t, { dir = 1, pole = true, wave = 1 } = {}) {
  const src = flagCanvas(type);
  if (!src) return;
  ctx.save();
  if (dir < 0) {
    // drapeau qui flotte vers la gauche : on dessine en miroir autour du mât
    ctx.translate(x, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }
  if (pole) {
    ctx.fillStyle = '#3a3027';
    ctx.fillRect(x - 1.1, y - 1, 1.2, h * 2.2);
    ctx.fillStyle = '#d9b24c';
    ctx.beginPath();
    ctx.arc(x - 0.5, y - 1.2, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.imageSmoothingEnabled = true;
  const n = 14, alpha = ctx.globalAlpha;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const dy = Math.sin(t * 0.14 - i * 0.55) * h * 0.09 * wave * u;
    ctx.globalAlpha = alpha * (1 - 0.18 * (0.5 + 0.5 * Math.sin(t * 0.14 - i * 0.55 + 1.2)) * u);
    ctx.drawImage(src, u * W, 0, W / n + 0.5, H, x + u * w, y + dy, w / n + 0.35, h);
  }
  ctx.restore();
}
