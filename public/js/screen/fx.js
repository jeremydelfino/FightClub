// Particules et halos lumineux (coordonnées monde).
// Chaque perso a un thème d'effets (character.json -> "fx") : style des attaques, traînée des spéciaux, bouclier.
import { drawFrame } from '../shared/sprites.js';

export function rgba(hex, a) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const glowCache = new Map();
export function glowSprite(color) {
  let c = glowCache.get(color);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, rgba(color, 1));
    gr.addColorStop(0.3, rgba(color, 0.45));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    glowCache.set(color, c);
  }
  return c;
}

/** À appeler avec globalCompositeOperation = 'lighter' pour un vrai effet néon. */
export function drawGlow(ctx, x, y, r, color, alpha = 1) {
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * alpha;
  ctx.drawImage(glowSprite(color), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = prev;
}

/** Arc de cercle tracé pixel par pixel (rendu net, sans anticrénelage). */
export function pxArc(ctx, x, y, r, a0, a1, color, th = 1) {
  ctx.fillStyle = color;
  const step = 0.7 / Math.max(1, r);
  for (let a = a0; a <= a1; a += step) {
    for (let k = 0; k < th; k++) ctx.fillRect(Math.round(x + Math.cos(a) * (r - k)), Math.round(y + Math.sin(a) * (r - k)), 1, 1);
  }
}

export function pxLine(ctx, x0, y0, x1, y1, color, th = 1) {
  ctx.fillStyle = color;
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), th, th);
}

const HEART = ['.x.x.', 'xxxxx', '.xxx.', '..x..'];
const ANGER = ['.xx.xx.', 'x.x.x.x', 'xx...xx', '.......', 'xx...xx', 'x.x.x.x', '.xx.xx.'];

export class FX {
  constructor() {
    this.list = [];
  }

  add(o) {
    this.list.push({ vx: 0, vy: 0, grav: 0, drag: 1, size: 1, grow: 0, life: 20, age: 0, color: '#ffffff', type: 'px', ...o });
  }

  update() {
    for (const q of this.list) {
      q.age++;
      if (q.age <= 0) continue; // effet retardé
      q.x += q.vx;
      q.y += q.vy;
      q.vy += q.grav;
      q.vx *= q.drag;
      q.vy *= q.drag;
      q.size += q.grow;
    }
    this.list = this.list.filter((q) => q.age < q.life);
  }

  spark(x, y, n, color, speed = 2.5) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random());
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 0.88, life: 10 + Math.random() * 12, size: Math.random() < 0.3 ? 2 : 1, color, glow: true });
    }
  }

  hit(x, y, s, dmg, color) {
    this.add({ type: 'flash', x, y, life: 6, size: 10 + s * 2, color: '#ffffff' });
    this.add({ type: 'ring', x, y, life: 12, size: 2, grow: 1 + s * 0.15, color });
    this.spark(x, y, 6 + Math.round(dmg), '#fff6c2', 1.5 + s * 0.25);
    this.spark(x, y, 4 + Math.round(dmg * 0.5), color, 1 + s * 0.2);
    if (s > 6) {
      for (let i = 0; i < 8; i++) {
        this.add({ type: 'ray', x, y, angle: (i / 8) * Math.PI * 2 + Math.random() * 0.3, life: 8, size: 6 + s * 1.5, color: '#ffffff' });
      }
    }
  }

  dust(x, y, dir = 0, n = 3) {
    for (let i = 0; i < n; i++) {
      this.add({
        x: x + (Math.random() - 0.5) * 6, y: y - 1,
        vx: dir * (0.3 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.6, vy: -Math.random() * 0.5,
        drag: 0.92, life: 16 + Math.random() * 10, size: 2, grow: 0.06, color: '#d9c8ff', fade: true,
      });
    }
  }

  smoke(x, y, color = '#f2eaff') {
    this.add({ x: x + (Math.random() - 0.5) * 4, y: y + (Math.random() - 0.5) * 4, vy: -0.1, life: 26, size: 3, grow: 0.12, color, fade: true });
  }

  /** Éternuement : un cône de gouttelettes et de brume vers l'avant. */
  sneeze(f) {
    const x = f.x + f.facing * 8, y = f.y - f.h * 0.72;
    for (let i = 0; i < 34; i++) {
      const a = (Math.random() - 0.5) * 0.9, s = 3 + Math.random() * 4;
      this.add({ type: 'drop', x, y, vx: Math.cos(a) * s * f.facing, vy: Math.sin(a) * s, grav: 0.05, drag: 0.93, life: 24 + Math.random() * 14, size: 0.8 + Math.random() * 1.2, color: i % 4 ? '#cfeaff' : '#ffffff' });
    }
    for (let i = 0; i < 8; i++) this.smoke(x + f.facing * (6 + i * 4), y + (Math.random() - 0.5) * 8, '#e6f4ff');
    // Jet dessiné sur la planche (bouche → avant), qui s'étire puis s'efface
    if (f.sprite.has('fx_spray')) this.add({ type: 'sprite', fr: f.sprite.get('fx_spray'), x: x - f.facing * 2, y, h: f.h * 0.55, facing: f.facing, life: 22, stretch: true });
  }

  /** Nuage de fumée (disparition, échange de place). */
  puff(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, s = 0.5 + Math.random() * 1.3;
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.7, drag: 0.9, life: 28, size: 3 + Math.random() * 3, grow: 0.15, color: i % 3 ? '#efe9f5' : color, fade: true });
    }
    this.add({ type: 'star4', x, y, size: 7, life: 10, color: '#ffffff' });
  }

  /** Confettis aux couleurs du drapeau du perso (coups puissants, victoire). */
  confetti(x, y, colors, n = 18, power = 2.5) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, s = power * (0.4 + Math.random());
      this.add({
        type: 'conf', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, grav: 0.07, drag: 0.97,
        life: 50 + Math.random() * 30, size: 1.6 + Math.random() * 1.2, color: colors[i % colors.length],
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  /** Nom du spécial qui s'affiche au-dessus du perso, façon bande dessinée. */
  callout(x, y, text, color) {
    this.add({ type: 'callout', x, y, vy: -0.25, drag: 0.96, life: 55, text, color });
  }

  /** Explosion de dessin animé (missile). */
  boom(x, y, s = 1) {
    this.add({ type: 'flash', x, y, life: 10, size: 26 * s, color: '#ffb347' });
    this.add({ type: 'ring', x, y, life: 14, size: 2, grow: 1.6 * s, color: '#fff2c4' });
    this.spark(x, y, Math.round(18 * s), '#ffb347', 3 * s);
    this.spark(x, y, Math.round(10 * s), '#ff5a36', 2.2 * s);
    for (let i = 0; i < 6 * s; i++) this.smoke(x + (Math.random() - 0.5) * 12 * s, y + (Math.random() - 0.5) * 10 * s, i % 2 ? '#8a8378' : '#c9c2b6');
  }

  /** Projectile intercepté par le Dôme de fer. */
  intercept(x, y) {
    this.add({ type: 'flash', x, y, life: 8, size: 22, color: '#bfe0ff' });
    this.add({ type: 'star4', x, y, size: 9, life: 10, color: '#ffffff' });
    this.spark(x, y, 12, '#9fd0ff', 2.6);
  }

  /** Veine de colère façon manga, au-dessus de la tête. */
  anger(x, y) {
    this.add({ type: 'anger', x: x + 6, y, vy: -0.15, life: 34, color: '#ff2d3b' });
  }

  // ---------------------------------------------------------- effets propres au perso

  /** Effet d'attaque au moment où le coup devient actif, à l'endroit de la hitbox. */
  attack(f) {
    const boxes = f.activeHitboxes();
    if (!boxes) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const { rect: r } of boxes) {
      x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h);
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const bx = f.x, by = f.y - f.h * 0.55;
    const d = Math.hypot(cx - bx, cy - by);
    const around = d < 6; // coup tout autour du corps (aérienne neutre)
    const ang = around ? 0 : Math.atan2(cy - by, cx - bx);
    const size = Math.max(6, Math.max(x1 - x0, y1 - y0) * 0.6);
    const [c0, c1, c2] = f.fxs.colors;
    const a0 = around ? 0 : ang - 0.85, a1 = around ? Math.PI * 2 : ang + 0.85;
    switch (f.fxs.style) {
      case 'wave': // ondes sonores qui partent vers l'avant
        for (let i = 0; i < 3; i++) {
          this.add({ type: 'arc', x: around ? bx : bx + Math.cos(ang) * d * 0.35, y: around ? by : by + Math.sin(ang) * d * 0.35, size: 3 + i * 4, grow: 0.8, a0, a1, color: i % 2 ? c1 : c0, life: 12, age: -i * 2 });
        }
        break;
      case 'flash': // flash d'appareil photo
        this.add({ type: 'star4', x: cx, y: cy, size: size * 0.9, life: 10, color: c1 });
        this.add({ type: 'flash', x: cx, y: cy, life: 6, size: size * 1.8, color: c0 });
        this.spark(cx, cy, 5, c0, 2);
        break;
      case 'stars': // taillade rouge et petites étoiles dorées
        this.add({ type: 'arc', x: bx, y: by, size: around ? size : Math.max(6, d), grow: 0.3, a0, a1, color: c0, th: 3, life: 10 });
        for (let i = 0; i < 4; i++) {
          const a = ang + (Math.random() - 0.5) * 1.6, s = 1 + Math.random() * 1.5;
          this.add({ type: 'mstar', x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 0.9, life: 18, color: c1 });
        }
        break;
      case 'quote': { // bulles « ! » qui jaillissent, façon débat qui dérape
        this.add({ type: 'callout', x: cx, y: cy - 4, vy: -0.5, drag: 0.92, life: 22, text: ['!', '?!', '!!', '#@!'][(Math.random() * 4) | 0], color: c0 });
        this.add({ type: 'arc', x: bx, y: by, size: around ? size : Math.max(6, d), a0, a1, color: c2, th: 2, life: 8 });
        break;
      }
      case 'line': { // coups de feutre nets
        const len = size * 1.3;
        const dirs = around ? [Math.PI / 4, -Math.PI / 4] : [ang];
        for (const a of dirs) {
          const dx = Math.cos(a) * len, dy = Math.sin(a) * len;
          this.add({ type: 'streak', x: cx - dx, y: cy - dy, x1: cx + dx, y1: cy + dy, color: c1, color2: c0, life: 9 });
        }
        this.spark(cx, cy, 4, c1, 1.8);
        break;
      }
      default:
        this.add({ type: 'arc', x: bx, y: by, size: around ? size : Math.max(6, d), a0, a1, color: c0, th: 2, life: 9 });
    }
  }

  /** Effet au déclenchement d'un spécial de déplacement (remontée…). */
  burst(f, style = f.fxs.trail) {
    const [c0, c1, c2] = f.fxs.colors;
    const x = f.x, y = f.y - f.h / 2;
    switch (style) {
      case 'trophy': // il brandit la Coupe du monde
        this.confetti(x, y - 4, ['#d4af37', '#f6d77c', '#ffffff', '#0055a4', '#ef4135'], 24, 2.8);
        this.add({ type: 'star4', x, y: y - f.h * 0.5, size: 12, life: 16, color: '#ffe9a6' });
        this.add({ type: 'flash', x, y: y - f.h * 0.4, life: 10, size: 24, color: '#d4af37' });
        break;
      case 'speed': // pointe de vitesse
        this.ring(x, y, c0, 10);
        break;
      case 'pages': // pluie de pages de livres et de journaux
        this.confetti(x, y + 6, ['#ffffff', '#efe8d8', '#d6ccb4'], 16, 2.2);
        this.ring(x, y, c0, 12);
        break;
      case 'chart': // la courbe d'audience s'envole
        this.ring(x, y + f.h / 2, '#2ecc71', 14);
        for (let i = 0; i < 6; i++) this.add({ type: 'colbar', x: x - 9 + i * 3.6, y: y + f.h / 2, life: 30, size: 4 + i * 2.4, color: i === 5 ? '#2ecc71' : '#1b2a4a' });
        break;
      case 'splash': // plongeon dans le Yangtsé
        this.ring(x, y + f.h / 2, '#bfe6ff', 16);
        for (let i = 0; i < 16; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, s = 1.5 + Math.random() * 2.5;
          this.add({ type: 'drop', x, y: y + f.h / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, grav: 0.18, life: 30, size: 1.4 + Math.random(), color: i % 3 ? '#7cc8ff' : '#ffffff' });
        }
        break;
      case 'smoke': // nuage de magicien
        for (let i = 0; i < 12; i++) {
          const a = Math.random() * Math.PI * 2, s = 0.4 + Math.random() * 1.2;
          this.add({ x, y: y + 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, drag: 0.9, life: 30, size: 3 + Math.random() * 3, grow: 0.15, color: i % 3 ? '#e8eef8' : c0, fade: true });
        }
        for (let i = 0; i < 3; i++) this.add({ type: 'star4', x: x + (Math.random() - 0.5) * 22, y: y + (Math.random() - 0.5) * 22, size: 4, life: 14, color: '#ffffff', age: -i * 3 });
        break;
      case 'holo': // apparition en hologramme
        this.ring(x, y, c1, 14);
        for (let i = 0; i < 6; i++) this.add({ type: 'bar', x: x - 10 + Math.random() * 6, y: y - 12 + Math.random() * 24, size: 8 + Math.random() * 12, life: 10, color: i % 2 ? '#7df9ff' : c1 });
        break;
      case 'hearts': // pluie de « likes »
        this.ring(x, y, c0, 12);
        for (let i = 0; i < 6; i++) this.add({ type: 'heart', x: x + (Math.random() - 0.5) * 14, y: y + 6, vx: (Math.random() - 0.5) * 1.2, vy: -0.6 - Math.random() * 0.8, drag: 0.96, life: 30, color: [c2, '#ff8fb1', c1][i % 3] });
        break;
      case 'stars':
        this.ring(x, y, c0, 13);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          this.add({ type: 'mstar', x, y, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.6, drag: 0.92, life: 22, color: c1 });
        }
        break;
      default:
        this.ring(x, y, c0, 12);
    }
  }

  /** Traînée pendant un spécial de déplacement (appelée toutes les 2 frames). */
  motion(f, style = f.fxs.trail) {
    const [c0, c1, c2] = f.fxs.colors;
    const x = f.x, y = f.y - f.h / 2;
    switch (style) {
      case 'trophy':
        this.add({ type: 'px', x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 14, vy: 0.3, life: 18, size: 1.5, color: Math.random() < 0.6 ? '#f6d77c' : '#ffffff', glow: true });
        break;
      case 'flag': // rubans bleu-blanc-rouge
        ['#0055a4', '#ffffff', '#ef4135'].forEach((c, i) => this.add({ type: 'streak', x: x + (i - 1) * 3, y: y + 4, x1: x + (i - 1) * 3 - f.facing * 4, y1: y + 22, color: c, color2: c, life: 10 }));
        break;
      case 'speed':
        for (let i = 0; i < 3; i++) this.add({ type: 'streak', x: x - f.facing * (4 + i * 3), y: y - 8 + i * 7, x1: x - f.facing * (22 + i * 4), y1: y - 8 + i * 7, color: '#ffffff', color2: c0, life: 8 });
        break;
      case 'pages':
        this.add({ type: 'conf', x: x + (Math.random() - 0.5) * 8, y: y + 6, vx: (Math.random() - 0.5), vy: 0.4, grav: 0.03, drag: 0.98, life: 40, size: 2.4, color: Math.random() < 0.5 ? '#ffffff' : '#efe8d8', rot: Math.random() * 6, vr: 0.2 });
        break;
      case 'chart':
        this.add({ type: 'colbar', x: x + (Math.random() - 0.5) * 10, y: y + f.h / 2, life: 18, size: 3 + Math.random() * 8, color: Math.random() < 0.7 ? '#2ecc71' : '#d7263d' });
        break;
      case 'splash':
        for (let i = 0; i < 2; i++) this.add({ type: 'drop', x: x + (Math.random() - 0.5) * 10, y: y + f.h * 0.3, vx: (Math.random() - 0.5) * 1.5, vy: 0.5 + Math.random(), grav: 0.15, life: 22, size: 1.2 + Math.random(), color: Math.random() < 0.6 ? '#7cc8ff' : '#ffffff' });
        break;
      case 'smoke':
        this.smoke(x, y + 4, '#e8eef8');
        if (Math.random() < 0.3) this.add({ type: 'star4', x: x + (Math.random() - 0.5) * 14, y: y + (Math.random() - 0.5) * 14, size: 3, life: 10, color: '#ffffff' });
        break;
      case 'holo':
        this.add({ type: 'ghost', x: f.x, y: f.y, fr: f.currentFrame(), facing: f.facing, life: 12, color: '#7df9ff' });
        if (Math.random() < 0.4) this.add({ type: 'bar', x: x - 8, y: y + (Math.random() - 0.5) * f.h, size: 6 + Math.random() * 10, life: 6, color: c1 });
        break;
      case 'hearts':
        this.add({ type: 'heart', x: x + (Math.random() - 0.5) * 8, y: y + 4, vx: (Math.random() - 0.5) * 0.6, vy: -0.4, life: 24, color: Math.random() < 0.5 ? c2 : '#ff8fb1' });
        break;
      case 'stars':
        this.add({ type: 'mstar', x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 10, vy: 0.2, life: 16, color: c1 });
        this.spark(x, y, 1, c0, 0.8);
        break;
      default:
        this.smoke(x, y);
    }
  }

  trail(x, y, color) {
    this.add({ x, y, life: 10, size: 2, grow: -0.12, color, fade: true });
  }

  ring(x, y, color, r = 12) {
    this.add({ type: 'ring', x, y, life: 14, size: 1, grow: r / 14, color });
  }

  /** Onde de choc (champ shockwave d'un coup) : flash, anneaux qui s'élargissent jusqu'à r, anneau aplati au sol, étincelles. */
  shockwave(x, y, groundY, { r = 60, colors = ['#ff4fa3', '#ffffff'] } = {}) {
    const [c0, c1] = colors;
    this.add({ type: 'flash', x, y, life: 12, size: r * 0.9, color: c0 });
    this.add({ type: 'flash', x, y, life: 8, size: r * 0.45, color: c1 });
    for (let i = 0; i < 3; i++) {
      const life = 16 + i * 5;
      this.add({ type: 'ring', x, y, age: -i * 4, life, size: 4, grow: (r - 4) / life, color: i % 2 ? c1 : c0, width: 3 - i * 0.6 });
      this.add({ type: 'ring', x, y: groundY, age: -i * 4, life, size: 4, grow: (r - 4) / life, sy: 0.22, color: i % 2 ? c1 : c0, width: 3 - i * 0.6 });
    }
    this.spark(x, y, 26, c0, 4.5);
    this.spark(x, y, 14, c1, 3.5);
  }

  koBlast(x, y, angle, color) {
    this.add({ type: 'beam', x, y, angle, life: 50, color });
    this.add({ type: 'flash', x, y, life: 10, size: 60, color });
    for (let i = 0; i < 3; i++) this.add({ type: 'ring', x, y, life: 24 + i * 6, size: 2, grow: 2.2 + i, color: i ? color : '#ffffff' });
    this.spark(x, y, 40, color, 5);
    this.spark(x, y, 30, '#ffffff', 4);
  }

  dizzy(x, y) {
    this.add({ x: x + (Math.random() - 0.5) * 10, y, vy: -0.3, life: 30, color: '#ffe14d', glow: true });
  }

  draw(ctx) {
    for (const q of this.list) {
      if (q.age < 0) continue;
      const k = 1 - q.age / q.life;
      const stepped = Math.ceil(k * 3) / 3; // fondu en paliers, plus « pixel »
      switch (q.type) {
        case 'arc':
          ctx.globalAlpha = stepped;
          pxArc(ctx, q.x, q.y, q.size, q.a0, q.a1, q.color, q.th || 1);
          break;
        case 'star4': {
          ctx.globalAlpha = 1;
          const s = Math.max(1, Math.round(q.size * Math.sin(Math.PI * Math.min(1, (1 - k) * 1.4 + 0.15))));
          const x = Math.round(q.x), y = Math.round(q.y);
          ctx.fillStyle = q.color;
          ctx.fillRect(x - s, y, s * 2 + 1, 1);
          ctx.fillRect(x, y - s, 1, s * 2 + 1);
          ctx.fillRect(x - 1, y - 1, 3, 3);
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, x, y, s * 1.5, q.color, 0.5 * k);
          ctx.globalCompositeOperation = 'source-over';
          break;
        }
        case 'mstar': {
          ctx.globalAlpha = stepped;
          const x = Math.round(q.x), y = Math.round(q.y);
          ctx.fillStyle = q.color;
          ctx.fillRect(x - 1, y, 3, 1);
          ctx.fillRect(x, y - 1, 1, 3);
          break;
        }
        case 'heart': {
          ctx.globalAlpha = stepped;
          ctx.fillStyle = q.color;
          const x = Math.round(q.x) - 2, y = Math.round(q.y) - 2;
          for (let r = 0; r < HEART.length; r++) for (let c = 0; c < 5; c++) if (HEART[r][c] === 'x') ctx.fillRect(x + c, y + r, 1, 1);
          break;
        }
        case 'anger': {
          ctx.globalAlpha = stepped;
          ctx.fillStyle = q.color;
          const pop = q.age < 6 ? 1 : 0;
          const x = Math.round(q.x) - 3 - pop, y = Math.round(q.y) - 3 - pop;
          for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if (ANGER[r][c] === 'x') ctx.fillRect(x + c * (1 + pop * 0.3), y + r * (1 + pop * 0.3), 1, 1);
          break;
        }
        case 'streak':
          ctx.globalAlpha = stepped;
          pxLine(ctx, q.x, q.y + 1, q.x1, q.y1 + 1, q.color2, 1);
          pxLine(ctx, q.x, q.y, q.x1, q.y1, q.color, 1);
          break;
        case 'bar':
          ctx.globalAlpha = stepped * 0.8;
          ctx.fillStyle = q.color;
          ctx.fillRect(Math.round(q.x + (Math.random() - 0.5) * 4), Math.round(q.y), Math.round(q.size), 1);
          break;
        case 'conf': { // confetti qui virevolte
          q.rot += q.vr;
          ctx.save();
          ctx.globalAlpha = Math.min(1, k * 2);
          ctx.translate(q.x, q.y);
          ctx.rotate(q.rot);
          ctx.scale(1, Math.cos(q.age * 0.35 + q.rot));
          ctx.fillStyle = q.color;
          ctx.fillRect(-q.size / 2, -q.size * 0.3, q.size, q.size * 0.6);
          ctx.restore();
          break;
        }
        case 'colbar': { // barre d'histogramme qui monte
          const hh = q.size * Math.min(1, q.age / 8);
          ctx.globalAlpha = Math.min(1, k * 2);
          ctx.fillStyle = q.color;
          ctx.fillRect(q.x - 1.2, q.y - hh, 2.4, hh);
          break;
        }
        case 'drop': // goutte d'eau
          ctx.globalAlpha = Math.min(1, k * 1.5);
          ctx.fillStyle = q.color;
          ctx.beginPath();
          ctx.ellipse(q.x, q.y, q.size * 0.6, q.size, Math.atan2(q.vy, q.vx) + Math.PI / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'combo': { // compteur de combo : « 3 COUPS ! » qui grossit à chaque coup
          const pop = q.age < 8 ? 1 + (8 - q.age) * 0.09 : 1;
          ctx.save();
          ctx.globalAlpha = Math.min(1, k * 4);
          ctx.translate(q.x, q.y - (1 - k) * 4);
          ctx.rotate(-0.08);
          ctx.scale(pop, pop);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.lineJoin = 'round';
          const big = Math.min(16, 9 + q.n);
          ctx.font = `${big}px "Anton", Impact, sans-serif`;
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#07031a';
          ctx.strokeText(String(q.n), -8, 0);
          ctx.fillStyle = q.n >= 5 ? '#ff5a3c' : q.n >= 3 ? '#ffd75e' : '#ffffff';
          ctx.fillText(String(q.n), -8, 0);
          ctx.font = 'italic 700 6px "Barlow Condensed", sans-serif';
          ctx.textAlign = 'left';
          ctx.lineWidth = 2;
          ctx.strokeText('COUPS !', -8 + big * 0.32, -1);
          ctx.fillStyle = q.color;
          ctx.fillText('COUPS !', -8 + big * 0.32, -1);
          ctx.restore();
          break;
        }
        case 'callout': {
          const pop = q.age < 6 ? 1 + (6 - q.age) * 0.08 : 1;
          ctx.save();
          ctx.globalAlpha = Math.min(1, k * 3);
          ctx.translate(q.x, q.y);
          ctx.rotate(-0.06);
          ctx.scale(pop, pop);
          ctx.font = '7px "Anton", Impact, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const w = ctx.measureText(q.text).width + 6;
          ctx.fillStyle = '#000';
          ctx.fillRect(-w / 2 + 1, -5, w, 10);
          ctx.fillStyle = '#efe8d8';
          ctx.fillRect(-w / 2, -6, w, 10);
          ctx.fillStyle = q.color;
          ctx.fillRect(-w / 2, -6, 1.5, 10);
          ctx.fillStyle = '#16130f';
          ctx.fillText(q.text, 0.5, -0.6);
          ctx.restore();
          break;
        }
        case 'sprite': { // image de la planche (jet, effet), ancrée à gauche, qui s'étire et s'efface
          const fr = q.fr, sc = q.h / fr.sh, st = q.stretch ? 0.6 + 0.4 * Math.min(1, (1 - k) * 4) : 1;
          ctx.save();
          ctx.translate(q.x, q.y);
          ctx.scale(q.facing * st, 1);
          drawFrame(ctx, { ...fr, scale: sc * (q.center ? 1 + Math.max(0, 0.3 - (1 - k)) : 1), ax: q.center ? fr.sw / 2 : 0, ay: fr.sh / 2 }, 0, 0, null, Math.min(1, k * 2.5));
          ctx.restore();
          break;
        }
        case 'ghost':
          ctx.save();
          ctx.translate(Math.round(q.x), Math.round(q.y));
          if (q.facing < 0) ctx.scale(-1, 1);
          drawFrame(ctx, q.fr, 0, 0, q.color, 0.45 * stepped);
          ctx.restore();
          break;
        case 'px': {
          ctx.globalAlpha = q.fade ? Math.ceil(k * 3) / 3 : k > 0.3 ? 1 : 0.5;
          const s = Math.max(1, Math.round(q.size));
          ctx.fillStyle = q.color;
          ctx.fillRect(Math.round(q.x - s / 2), Math.round(q.y - s / 2), s, s);
          if (q.glow) {
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, q.x, q.y, 3 + s * 2, q.color, 0.5 * k);
            ctx.globalCompositeOperation = 'source-over';
          }
          break;
        }
        case 'ring':
          ctx.globalAlpha = k;
          ctx.strokeStyle = q.color;
          ctx.lineWidth = Math.max(0.6, (q.width || 2) * k);
          ctx.beginPath();
          ctx.ellipse(q.x, q.y, Math.max(0.5, q.size), Math.max(0.5, q.size * (q.sy || 1)), 0, 0, Math.PI * 2); // sy : anneau aplati (au sol)
          ctx.stroke();
          break;
        case 'flash':
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 1;
          drawGlow(ctx, q.x, q.y, q.size * (0.6 + 0.4 * k), q.color, k);
          ctx.globalCompositeOperation = 'source-over';
          break;
        case 'ray':
          ctx.globalAlpha = k;
          ctx.fillStyle = q.color;
          ctx.save();
          ctx.translate(q.x, q.y);
          ctx.rotate(q.angle);
          ctx.fillRect(q.size * (1.2 - k) + 4, -0.5, q.size * k, 1);
          ctx.restore();
          break;
        case 'beam': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 1;
          const len = 260, w = 40 * k;
          ctx.save();
          ctx.translate(q.x, q.y);
          ctx.rotate(q.angle);
          const gr = ctx.createLinearGradient(0, 0, len, 0);
          gr.addColorStop(0, rgba(q.color, k));
          gr.addColorStop(1, rgba(q.color, 0));
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.moveTo(0, -w * 0.2);
          ctx.lineTo(len, -w);
          ctx.lineTo(len, w);
          ctx.lineTo(0, w * 0.2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${k})`;
          ctx.fillRect(0, -1, len * 0.6 * k, 2);
          ctx.restore();
          ctx.globalCompositeOperation = 'source-over';
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}
