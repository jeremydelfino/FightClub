// Une partie : combattants, projectiles, détection des coups, caméra, HUD.
import { Fighter } from './fighter.js';
import { FX, drawGlow, pxArc } from './fx.js';
import { renderScenery } from './stage.js';
import { drawFrame } from '../shared/sprites.js';
import { KO_LINES } from '../shared/news.js';
import { drawFlag, FLAG_COLORS } from '../shared/flags.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rad = (g, x, y, r0, r1, stops) => {
  const gr = g.createRadialGradient(x, y, r0, 0, 0, r1);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  return gr;
};
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const FONT = '"Press Start 2P", monospace';
const DISPLAY = '"Anton", Impact, sans-serif';
const UI = '"Barlow Condensed", "Arial Narrow", sans-serif';
const PAPER = '#efe8d8', INK = '#16130f', RED = '#e5383b';

// Illustrations des persos (en-tête de planche), chargées une fois pour le HUD
const portraits = new Map();
function portraitOf(char) {
  if (!char.portraitUrl) return null;
  if (!portraits.has(char.id)) {
    const img = new Image();
    img.src = char.portraitUrl;
    portraits.set(char.id, img);
  }
  return portraits.get(char.id);
}

class Projectile {
  constructor(owner, o) {
    Object.assign(this, o);
    this.owner = owner;
    this.age = 0;
    this.dead = false;
    this.baseY = o.y;
    this.hit = { dmg: o.dmg, base: o.base, growth: o.growth, angle: o.angle, stun: o.stun, gaze: o.gaze, callout: o.callout, calloutImg: o.calloutImg, charm: o.charm };
  }

  rect() {
    const w = this.hw ?? this.size, h = this.hh ?? this.size;
    return { x: this.x - w, y: this.y - h, w: w * 2, h: h * 2 };
  }

  update(game) {
    if (this.delay > 0) {
      this.delay--; // renfort qui arrive un peu après les autres
      return;
    }
    this.age++;
    if (this.kind === 'missile') this.steer(game);
    if (this.spin) this.rot = (this.rot || 0) + this.spin * (Math.sign(this.vx) || 1);
    this.x += this.vx;
    this.vy += this.gravity || 0;
    this.baseY += this.vy;
    this.y = this.wobble ? this.baseY + Math.sin(this.age * 0.15) * this.wobble : this.baseY;
    if (--this.life <= 0) {
      this.dead = true;
      if (this.kind === 'missile') this.puff ? game.fx.puff(this.x, this.y, this.color) : game.fx.boom(this.x, this.y, 0.6); // puff : boule de neige
      if (this.fuse) game.blast(this.owner, this.x, this.y, this.fuse); // grenade : explose au bout de la mèche
    }
    if (this.kind === 'blast') return; // zone d'explosion : ne bouge pas, ne laisse pas de traînée
    if (this.kind === 'decoy') { // double de Retouche express : reste sur place puis explose (ou s'efface)
      if (this.dead) game.popDecoy(this, null);
      return;
    }
    if (this.kind === 'cloud') {
      // Nuage de poudre : dégâts progressifs (sans éjection) à qui reste dedans
      if (this.age % this.tick === 0) {
        for (const f of game.fighters) {
          if (f === this.owner || f.state === 'dead' || f.invulnerable() || !overlap(this.rect(), f.hurtbox())) continue;
          f.percent = Math.min(999, f.percent + this.dmg);
          if (f.mark) f.mark.dmg += this.dmg;
          f.flash = 6;
          this.owner.record.dealt += this.dmg;
          game.fx.spark(f.x, f.y - f.h / 2, 4, this.color, 1);
          game.emitHud(f);
        }
      }
      return;
    }
    if (this.summon && this.fly) {
      // Invocation volante (avion de chasse) : file droit à travers l'écran
      if (this.age % 2 === 0) game.fx.smoke(this.x - Math.sign(this.vx) * this.hw, this.y + 2, '#e8eef8');
      // bombardier : largue une bombe à intervalle régulier
      if (this.drops && this.age % this.drops.every === 0 && this.x > game.stage.blast.left + 20 && this.x < game.stage.blast.right - 20) game.dropBomb(this);
      if (this.x < game.stage.blast.left - 40 || this.x > game.stage.blast.right + 40) this.dead = true;
      return;
    }
    if (this.summon) {
      // Les invocations marchent sur le sol, et tombent si elles en sortent.
      const g = this.ground;
      if (g && this.x >= g.x && this.x <= g.x + g.w && this.vy >= 0 && this.baseY <= g.y - this.hh + 1) {
        this.vy = 0;
        this.baseY = g.y - this.hh;
      } else this.vy = Math.min(this.vy + 0.3, 6);
      this.y = this.baseY;
      if (this.y > game.stage.blast.bottom) this.dead = true;
      if (this.kind === 'battery') {
        if (this.shots?.includes(this.age)) {
          game.launchInterceptor(this);
          this.shotAt = this.age;
        }
        return;
      }
      if (this.wall || !this.vx) return;
      if (this.age % 6 === 0) game.fx.dust(this.x - Math.sign(this.vx) * this.hw * 0.8, this.y + this.hh, -Math.sign(this.vx), 1);
      return;
    }
    if (this.kind === 'ball') {
      // le ballon rebondit sur la nacelle et les planches
      for (const s of [...game.stage.solids.slice(0, 1), ...game.stage.platforms]) {
        if (this.vy > 0 && this.x > s.x && this.x < s.x + s.w && this.baseY + this.size >= s.y && this.baseY + this.size - this.vy <= s.y + 1) {
          this.baseY = this.y = s.y - this.size;
          this.vy = -Math.max(this.fuse ? 1 : 2.2, this.vy * this.bounce);
          if (this.fuse) this.vx *= 0.6; // la grenade ralentit à chaque rebond
          game.fx.dust(this.x, s.y, 0, 2);
        }
      }
      this.spin = 0.25;
      if (this.age % 2 === 0) game.fx.trail(this.x - Math.sign(this.vx) * 2, this.y, '#d4af37');
      return;
    }
    if (this.kind === 'wave') {
      const g = this.ground;
      if (!g || this.x < g.x || this.x > g.x + g.w) this.dead = true;
    } else {
      for (const s of game.stage.solids) {
        if (this.x > s.x && this.x < s.x + s.w && this.y > s.y && this.y < s.y + s.h) {
          this.dead = true;
          if (this.boom) {
            game.fx.boom(this.x, s.y, 0.9); // la bombe touche le sol
            game.shake(4);
          } else game.fx.spark(this.x, this.y, 6, this.color, 1.5);
        }
      }
    }
    if (this.kind === 'missile') {
      if (this.age % 2 === 0) game.fx.smoke(this.x - Math.cos(this.ang) * 8, this.y - Math.sin(this.ang) * 8, '#d9d4cc');
    } else if (this.age % 2 === 0) game.fx.trail(this.x - Math.sign(this.vx) * 2, this.y, this.color);
  }

  /** Tête chercheuse : vire peu à peu vers l'adversaire le plus proche et accélère. */
  steer(game) {
    this.ang ??= Math.atan2(this.vy, this.vx);
    let want = null;
    if (this.guided) {
      // Téléguidé : suit le joystick tant que le lanceur tient la pose ; touché, il perd le contrôle et le missile file droit
      const o = this.owner, { x, y } = o.in;
      if (o.state === 'attack' && o.move?.hold && Math.hypot(x, y) > 0.3) want = Math.atan2(y, x);
    } else {
      let target = null, best = Infinity;
      for (const f of game.fighters) {
        if (f === this.owner || f.state === 'dead' || f.eliminated) continue;
        const d = Math.hypot(f.x - this.x, f.y - f.h / 2 - this.y);
        if (d < best) { best = d; target = f; }
      }
      if (target) want = Math.atan2(target.y - target.h / 2 - this.y, target.x - this.x);
    }
    if (want !== null) {
      let diff = want - this.ang;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.ang += Math.max(-this.turn, Math.min(this.turn, diff));
    }
    this.speed = Math.min(this.maxSpeed, (this.speed ?? Math.hypot(this.vx, this.vy)) + this.accel);
    this.vx = Math.cos(this.ang) * this.speed;
    this.vy = Math.sin(this.ang) * this.speed;
  }

  /** Image tirée de l'atlas du perso, centrée (ou posée au sol pour une invocation). */
  drawImage(ctx, rot = 0, flip = 1, bottom = false) {
    const fr = this.fr;
    ctx.save();
    ctx.translate(this.x, bottom ? this.y + this.hh : this.y);
    ctx.rotate(rot);
    ctx.scale(flip, 1);
    drawFrame(ctx, { ...fr, scale: this.k, ax: fr.sw / 2, ay: bottom ? fr.sh : fr.sh / 2 });
    ctx.restore();
  }

  draw(ctx, t) {
    if (this.delay > 0) return;
    const x = Math.round(this.x), y = Math.round(this.y), r = this.size;
    const d = Math.sign(this.vx) || 1;
    switch (this.kind) {
      case 'blast': return; // l'explosion est dessinée par les effets
      case 'decoy':
        if (!this.fr) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.life / 15) * (0.75 + 0.15 * Math.sin(this.age * 0.3));
        this.drawImage(ctx, 0, this.dir, true);
        ctx.restore();
        return;
      case 'cloud': { // nuage qui gonfle, flotte puis s'efface
        if (!this.fr) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.age / 6, this.life / 20) * 0.9;
        this.y = this.baseY + Math.sin(this.age * 0.08) * 1.5;
        this.drawImage(ctx, 0, this.dir || 1);
        ctx.restore();
        return;
      }
      case 'summon': {
        if (this.fr && this.wall) { // le mur sort de terre puis s'efface
          const up = Math.min(1, this.age / 8);
          ctx.save();
          ctx.globalAlpha = Math.min(1, this.life / 12);
          ctx.beginPath();
          ctx.rect(this.x - this.hw * 2, this.y + this.hh - this.hh * 2 * up, this.hw * 4, this.hh * 2 * up);
          ctx.clip();
          this.drawImage(ctx, 0, 1);
          ctx.restore();
        } else if (this.fr) this.drawImage(ctx, this.fly ? 0 : Math.sin(this.age * 0.35) * 0.03, this.noFlip ? 1 : d);
        if (this.rainbow) { // drapeaux au-dessus de la manif : arc-en-ciel et φ
          const bob = Math.sin(this.age * 0.2);
          drawFlag(ctx, 'rainbow', x - d * this.hw * 0.25, y - this.hh - 12 + bob, 14, 9, t + 7, { dir: -d });
          drawFlag(ctx, 'lfi', x + d * this.hw * 0.45, y - this.hh - 9 - bob, 11, 7.3, t, { dir: -d });
        }
        return;
      }
      case 'tricolor': { // vague bleu-blanc-rouge qui déferle
        const grow = Math.min(1, this.age / 14), h = Math.round(this.hh * 2 * grow);
        ['#0055a4', '#ffffff', '#ef4135'].forEach((c, i) => {
          for (let k = 0; k < 4; k++) {
            const cx = x - d * (8 - i * 4 - k), hh = h - Math.round(Math.abs(Math.sin(this.age * 0.3 + i + k * 0.4)) * 3) - (2 - i) * 2;
            ctx.fillStyle = c;
            ctx.fillRect(cx, y + this.hh - hh, 1, hh);
          }
        });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + d * 4 - 1, y + this.hh - h - 1, 3, 2);
        return;
      }
      case 'missile': { // missile blanc à bandes bleues, flamme qui vacille
        if (this.fr) { // missile dessiné sur la planche, orienté dans sa direction
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, this.x - Math.cos(this.ang) * 8, this.y - Math.sin(this.ang) * 8, 8, '#ffb347', 0.7);
          ctx.globalCompositeOperation = 'source-over';
          this.drawImage(ctx, this.ang, 1);
          return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        const fl = 4 + Math.random() * 3;
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, -9, 0, 9, '#ffb347', 0.9);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffd27a';
        ctx.beginPath();
        ctx.moveTo(-7.5, -1.3);
        ctx.lineTo(-7.5 - fl, 0);
        ctx.lineTo(-7.5, 1.3);
        ctx.fill();
        ctx.fillStyle = '#e9edf2';
        ctx.fillRect(-7.5, -1.6, 13, 3.2);
        ctx.fillStyle = '#b9c2cc';
        ctx.fillRect(-7.5, 0.6, 13, 1);
        ctx.fillStyle = '#0038b8';
        ctx.fillRect(-4.5, -1.6, 1.3, 3.2);
        ctx.fillRect(-1.2, -1.6, 1.3, 3.2);
        ctx.fillStyle = '#8b939c';
        ctx.beginPath();
        ctx.moveTo(5.5, -1.6);
        ctx.lineTo(9, 0);
        ctx.lineTo(5.5, 1.6);
        ctx.fill();
        ctx.fillStyle = '#0038b8';
        for (const sgn of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(-7.5, sgn * 1.6);
          ctx.lineTo(-9.5, sgn * 4);
          ctx.lineTo(-5, sgn * 1.6);
          ctx.fill();
        }
        ctx.restore();
        return;
      }
      case 'battery': { // batterie du Dôme de fer posée au sol
        const grow = Math.min(1, this.age / 8) * Math.min(1, this.life / 10);
        if (this.fr) { // dôme dessiné sur la planche
          ctx.save();
          ctx.globalAlpha = grow;
          ctx.translate(this.x, this.y + this.hh);
          ctx.scale(grow * (this.flip ? this.dir : 1), grow);
          // fireFr : pose de tir affichée juste après chaque tir (sapin qui souffle)
          const fr = this.fireFr && this.shotAt != null && this.age - this.shotAt < 14 ? this.fireFr : this.fr;
          drawFrame(ctx, { ...fr, scale: this.k, ax: fr.sw / 2, ay: fr.sh });
          ctx.restore();
          return;
        }
        ctx.save();
        ctx.translate(this.x, this.y + this.hh);
        ctx.scale(this.dir * grow, grow);
        ctx.fillStyle = '#4c5866';
        ctx.fillRect(-12, -6, 24, 5);
        ctx.fillStyle = '#2b323b';
        for (const wx of [-8, 0, 8]) {
          ctx.beginPath();
          ctx.arc(wx, -1, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.save();
        ctx.translate(-2, -6);
        ctx.rotate(-0.75);
        ctx.fillStyle = '#6b7886';
        ctx.fillRect(-1, -4, 15, 8);
        ctx.fillStyle = '#1d2229';
        for (let k = 0; k < 4; k++) ctx.fillRect(13, -3.5 + k * 2, 1.5, 1.3);
        ctx.restore();
        drawFlag(ctx, 'il', 10, -16, 7, 4.7, t);
        ctx.restore();
        return;
      }
      case 'image':
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, x, y, r * 3, this.color, 0.5);
        ctx.globalCompositeOperation = 'source-over';
        if (this.fr) this.drawImage(ctx, this.rot || 0, this.noFlip ? 1 : d);
        return;
      case 'bubble': { // bulle de BD avec une punchline
        if (this.fr) { // bulle dessinée sur la planche
          this.drawImage(ctx, Math.sin(this.age * 0.25) * 0.08, 1);
          return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.font = '5.5px "Anton", Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const w = ctx.measureText(this.text).width + 6, h = 8;
        ctx.fillStyle = '#16130f';
        ctx.beginPath();
        ctx.roundRect(-w / 2 - 0.7, -h / 2 - 0.7, w + 1.4, h + 1.4, 3.5);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 3);
        ctx.fill();
        ctx.beginPath(); // pointe de la bulle, côté lanceur
        ctx.moveTo(-d * (w / 2 - 3), h / 2 - 0.5);
        ctx.lineTo(-d * (w / 2 + 2), h / 2 + 3);
        ctx.lineTo(-d * (w / 2 - 6), h / 2 - 0.5);
        ctx.fill();
        ctx.fillStyle = '#7b3a7e';
        ctx.fillText(this.text, 0, 0.3);
        ctx.restore();
        return;
      }
      case 'chyron': { // bandeau de chaîne d'info lancé à travers le plateau
        if (this.fr) { // bandeau dessiné sur la planche (texte : jamais en miroir)
          this.drawImage(ctx, Math.sin(this.age * 0.2) * 0.03, 1);
          return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.age * 0.2) * 0.03);
        const w = this.hw * 2, h = this.hh * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w, h);
        ctx.fillStyle = '#efe8d8';
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.fillStyle = this.color;
        ctx.fillRect(-w / 2, -h / 2, 8, h);
        ctx.fillStyle = '#1b2a4a';
        ctx.fillRect(-w / 2, h / 2 - 1, w, 1);
        ctx.font = '3.4px "Anton", Impact, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('DIRECT', -w / 2 + 0.8, -0.2);
        ctx.fillStyle = '#16130f';
        ctx.save();
        ctx.beginPath();
        ctx.rect(-w / 2 + 9, -h / 2, w - 10, h);
        ctx.clip();
        const tw = ctx.measureText(this.text).width;
        ctx.fillText(this.text, -w / 2 + 10 - ((this.age * 0.4) % (tw + 10)) + 0, -0.2);
        ctx.fillText(this.text, -w / 2 + 10 - ((this.age * 0.4) % (tw + 10)) + tw + 10, -0.2);
        ctx.restore();
        ctx.restore();
        return;
      }
      case 'reporter': { // reporter et caméraman qui foncent sur l'adversaire
        const by = this.y + this.hh, step = Math.sin(this.age * 0.5);
        ctx.save();
        ctx.translate(this.x, by);
        ctx.scale(d, 1);
        const person = (px, coat, head, legPhase) => {
          ctx.strokeStyle = '#2b2b33';
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(px, -8);
          ctx.lineTo(px + legPhase * 2.5, 0);
          ctx.moveTo(px, -8);
          ctx.lineTo(px - legPhase * 2.5, 0);
          ctx.stroke();
          ctx.fillStyle = coat;
          ctx.beginPath();
          ctx.roundRect(px - 3, -17, 6.5, 10, 1.5);
          ctx.fill();
          ctx.fillStyle = head;
          ctx.beginPath();
          ctx.arc(px + 0.6, -19.5, 2.6, 0, Math.PI * 2);
          ctx.fill();
        };
        // caméraman, derrière
        person(-9, '#2f3440', '#c99a7a', -step);
        ctx.fillStyle = '#1d2027';
        ctx.fillRect(-10, -21.5, 7, 4);
        ctx.fillRect(-4, -20.5, 2.5, 2);
        ctx.fillStyle = (this.age >> 3) % 2 ? '#ff2d3b' : '#5a1015';
        ctx.fillRect(-9.2, -21.2, 1, 1);
        // reporter en imper, micro tendu
        person(2, '#c8a774', '#efc2a0', step);
        ctx.strokeStyle = '#2b2b33';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(4, -14);
        ctx.lineTo(8, -15.5);
        ctx.stroke();
        ctx.fillStyle = '#1d2027';
        ctx.fillRect(7.5, -17, 1.6, 3);
        ctx.fillStyle = this.color;
        ctx.fillRect(7, -15.2, 2.6, 1.6);
        ctx.restore();
        return;
      }
      case 'ball': { // ballon de foot qui tourne
        if (this.fr) { // ballon dessiné sur la planche
          this.drawImage(ctx, this.rot || 0, 1);
          return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot || 0);
        const r = this.size;
        ctx.fillStyle = rad(ctx, -r * 0.35, -r * 0.4, 0.2, r * 1.2, [[0, '#ffffff'], [1, '#c9cdd4']]);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16130f';
        for (const [px, py, pr] of [[0, 0, 0.42], [0.72, -0.25, 0.22], [-0.6, -0.5, 0.22], [-0.3, 0.75, 0.22], [0.5, 0.65, 0.18]]) {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.lineTo(px * r + Math.cos(a) * pr * r, py * r + Math.sin(a) * pr * r);
          }
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }
      case 'card': { // carton rouge qui tournoie
        if (this.fr) { // carton dessiné sur la planche, qui tourne sur lui-même
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, x, y, 9, this.color, 0.45);
          ctx.globalCompositeOperation = 'source-over';
          this.drawImage(ctx, Math.sin(this.age * 0.3) * 0.3, Math.cos(this.age * 0.35) || 0.05);
          return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.age * 0.3) * 0.3);
        ctx.scale(Math.cos(this.age * 0.35), 1);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 0, 0, 8, '#ff4040', 0.5);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000';
        ctx.fillRect(-2.4, -3.4, 5, 7);
        ctx.fillStyle = '#e3192b';
        ctx.fillRect(-2.6, -3.6, 5, 7);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillRect(-2.2, -3.2, 1, 6);
        ctx.restore();
        return;
      }
      case 'sound': // ondes du mégaphone
        for (let i = 0; i < 3; i++) {
          const rr = 4 + i * 4 + (this.age % 6) * 0.5;
          pxArc(ctx, x - d * 8, y, rr, d > 0 ? -0.7 : Math.PI - 0.7, d > 0 ? 0.7 : Math.PI + 0.7, i % 2 ? '#ffffff' : this.color, 2);
        }
        return;
    }
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, x, y, r * 4, this.color, 0.7);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = this.color;
    switch (this.kind) {
      case 'phi': { // φ, symbole des Insoumis
        pxArc(ctx, x, y, r - 1, 0, Math.PI * 2, this.color);
        pxArc(ctx, x, y, r - 2, 0, Math.PI * 2, this.color);
        ctx.fillStyle = this.color;
        ctx.fillRect(x - 1, y - r - 3, 2, r * 2 + 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 3 + ((t >> 3) % 2), y - 2, 1, 1);
        break;
      }
      case 'book': { // petit livre rouge qui tournoie
        const w = [7, 4, 1, 4][(this.age >> 2) % 4];
        ctx.fillRect(x - (w >> 1), y - 4, Math.max(1, w), 9);
        if (w > 1) {
          ctx.fillStyle = '#f4efe0';
          ctx.fillRect(x - (w >> 1) + w - 1, y - 3, 1, 7);
        }
        if (w > 3) {
          ctx.fillStyle = '#ffde00';
          ctx.fillRect(x - 1, y - 2, 2, 2);
        }
        break;
      }
      case 'phone': { // smartphone lancé, flash du selfie
        const w = [4, 3, 1, 3][(this.age >> 1) % 4];
        ctx.fillStyle = '#15171c';
        ctx.fillRect(x - (w >> 1), y - 3, w, 7);
        if (w > 2) {
          ctx.fillStyle = this.color;
          ctx.fillRect(x - (w >> 1) + 1, y - 2, w - 2, 5);
        }
        if (this.age % 14 < 3) {
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, x, y, 14, '#ffffff', 0.9);
          ctx.globalCompositeOperation = 'source-over';
        }
        break;
      }
      case 'redline': { // trait de feutre rouge
        const wob = (t >> 2) % 2;
        ctx.fillRect(x - 8, y - 1 + wob, 16, 2);
        ctx.fillStyle = '#ff9a9a';
        ctx.fillRect(x - 8, y - 1 + wob, 16, 1);
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(x + (d > 0 ? 8 : -12), y - 2, 4, 3); // feutre
        ctx.fillStyle = '#1d1d1d';
        ctx.fillRect(x + (d > 0 ? 12 : -13), y - 1, 1, 1);
        break;
      }
      case 'bolt': {
        for (let i = 0; i < 4; i++) ctx.fillRect(x - i * 3 * d - 1, y + ((i + (t >> 1)) % 2 ? -1 : 1), 3, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y - 1, 2, 2);
        break;
      }
      case 'rock':
        ctx.fillRect(x - r, y - r + 1, r * 2, r * 2 - 2);
        ctx.fillRect(x - r + 1, y - r, r * 2 - 2, r * 2);
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        ctx.fillRect(x, y, r - 1, r - 1);
        break;
      case 'wave':
        ctx.fillRect(x - 2, y - r + ((t >> 1) % 2), 4, r * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y - r + 2, 2, r * 2 - 2);
        break;
      default:
        ctx.fillRect(x - r, y - r + 1, r * 2, r * 2 - 2);
        ctx.fillRect(x - r + 1, y - r, r * 2 - 2, r * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}

export class Game {
  constructor({ players, roster, sfx, stage, rules, slotColors, onEvent }) {
    Object.assign(this, { stage, sfx, rules, slotColors });
    this.onEvent = onEvent || (() => {});
    this.fx = new FX();
    this.frame = 0;
    this.phase = 'countdown'; // countdown | fight | gameover
    this.timer = 0;
    this.goTimer = 0;
    this.endTimer = 0;
    this.timeScale = 1;
    this.slowAcc = 0;
    this.paused = false;
    this.winner = null;
    this.cam = { x: 240, y: 165, zoom: 0.75 }; // cadre de base de updateCamera
    this.shakeAmt = 0;
    this.flashAmt = 0;
    this.hudShake = {};
    this.projectiles = [];
    this.fighters = players.map((p) => new Fighter(this, p, roster.find((c) => c.id === p.charId) || roster[0], p.slot));
    for (const f of this.fighters) this.emitHud(f);
  }

  get acceptInput() {
    return this.phase === 'fight';
  }

  tick() {
    this.slowAcc += this.timeScale;
    while (this.slowAcc >= 1) {
      this.slowAcc -= 1;
      this.step();
    }
  }

  step() {
    this.frame++;
    if (this.phase === 'countdown') {
      if (this.timer % 60 === 0) this.sfx.beep(false);
      if (++this.timer >= 180) {
        this.phase = 'fight';
        this.goTimer = 60;
        this.sfx.beep(true);
      }
    }
    if (this.goTimer > 0) this.goTimer--;

    this.stage.update?.(this.frame);
    if (this.phase === 'fight') for (const f of this.fighters) f.player.brain?.update(this, f);
    for (const f of this.fighters) f.update();
    for (const p of this.projectiles) p.update(this);
    this.checkHits();
    for (const f of this.fighters) if (f.mark && this.frame >= f.mark.until) this.decree(f);
    this.pushWalls();
    for (const p of [...this.projectiles]) if (p.dead && p.cloud) this.spawnCloud(p); // poudre : le nuage reste là où elle éclate
    this.projectiles = this.projectiles.filter((p) => !p.dead);
    this.fx.update();
    this.updateCamera();

    if (this.shakeAmt > 0) this.shakeAmt = Math.max(0, this.shakeAmt * 0.88 - 0.05);
    if (this.flashAmt > 0) this.flashAmt--;
    if (this.koNews && --this.koNews.t <= 0) this.koNews = null;
    for (const id in this.hudShake) if (this.hudShake[id] > 0) this.hudShake[id]--;

    if (this.phase === 'gameover') {
      this.endTimer++;
      this.timeScale = this.endTimer < 40 ? 0.3 : 1; // ralenti sur le KO final
      if (this.endTimer === 150) this.onEvent({ type: 'end', winner: this.winner?.id ?? null });
    }
  }

  // ------------------------------------------------------------ combat

  checkHits() {
    const fs = this.fighters;
    for (const a of fs) {
      const boxes = a.activeHitboxes();
      if (!boxes) continue;
      for (const { hit, rect } of boxes) {
        // un double (Retouche express) encaisse le coup à la place de sa propriétaire
        const decoy = this.projectiles.find((q) => q.kind === 'decoy' && !q.dead && q.owner !== a && overlap(rect, q.rect()));
        if (decoy) {
          this.popDecoy(decoy, a);
          continue;
        }
        for (const t of fs) {
          if (t === a || t.invulnerable() || a.hitIds.has(t.id)) continue;
          if (overlap(rect, t.hurtbox())) {
            a.hitIds.add(t.id);
            this.applyHit(a, t, hit, rect, Math.sign(t.x - a.x) || a.facing, false);
          }
        }
      }
    }
    for (const p of this.projectiles) {
      if (p.dead || p.delay > 0 || p.noHit) continue;
      const decoy = !p.summon && this.projectiles.find((q) => q.kind === 'decoy' && !q.dead && q.owner !== p.owner && overlap(p.rect(), q.rect()));
      if (decoy) {
        this.popDecoy(decoy, null);
        p.dead = true;
        continue;
      }
      for (const t of fs) {
        if (t === p.owner || t.invulnerable() || p.hitIds?.has(t.id)) continue;
        const r = p.rect();
        if (overlap(r, t.hurtbox())) {
          const blocked = this.applyHit(p.owner, t, p.hit, r, Math.sign(t.x - p.x) || Math.sign(p.vx) || 1, true);
          if (blocked === 'counter') { // projectile renvoyé : il repart vers son lanceur
            p.vx = -p.vx;
            p.ang = Math.PI - (p.ang ?? 0);
            p.owner = t;
            p.hitIds?.clear();
            break;
          }
          const intercepted = blocked && t.fxs.intercept;
          if (intercepted) this.fx.intercept(p.x, p.y);
          if ((p.kind === 'missile' || p.boom) && !intercepted) this.fx.boom(p.x, p.y, 1);
          if (p.pierce && !intercepted) p.hitIds.add(t.id);
          else {
            p.dead = true;
            break;
          }
        }
      }
    }
    // Deux projectiles adverses s'annulent (les invocations, elles, avancent)
    const ps = this.projectiles;
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j];
        if ((a.wall || b.wall) && a.owner !== b.owner && !a.dead && !b.dead) {
          const [w, q] = a.wall ? [a, b] : [b, a];
          if (!q.summon && !q.noHit && !(q.delay > 0) && overlap(w.rect(), q.rect())) {
            q.dead = true;
            if (q.kind === 'missile') this.fx.boom(q.x, q.y, 0.7);
            else this.fx.spark(q.x, q.y, 10, '#ffffff', 2);
            this.sfx.shield();
          }
          continue;
        }
        if (a.summon || b.summon || a.noHit || b.noHit || a.delay > 0 || b.delay > 0) continue;
        if (!a.dead && !b.dead && a.owner !== b.owner && overlap(a.rect(), b.rect())) {
          a.dead = b.dead = true;
          this.fx.spark((a.x + b.x) / 2, (a.y + b.y) / 2, 14, '#ffffff', 2.5);
          this.sfx.shield();
        }
      }
    }
  }

  /** Mur de sécurité : l'adversaire ne passe pas, il est repoussé sur le côté. */
  pushWalls() {
    for (const w of this.projectiles) {
      if (!w.wall || w.dead) continue;
      const r = w.rect();
      for (const f of this.fighters) {
        if (f === w.owner || f.state === 'dead' || f.state === 'respawn') continue;
        const hb = f.hurtbox();
        if (!overlap(r, hb)) continue;
        const side = f.x < w.x ? -1 : 1;
        f.x = side < 0 ? r.x - hb.w / 2 - 0.5 : r.x + r.w + hb.w / 2 + 0.5;
        if (Math.sign(f.vx) === -side) f.vx = 0;
      }
    }
  }

  applyHit(a, t, hit, rect, dir, isProj) {
    const dmg = hit.dmg * a.stats.power * (t.mounted ? t.char.mount.armor : 1); // à cheval : dégâts réduits
    const px = (rect.x + rect.w / 2 + t.x) / 2;
    const py = (rect.y + rect.h / 2 + t.y - t.h / 2) / 2;
    const tm = t.state === 'attack' && t.move;
    if (!hit.sure && tm?.kind === 'counter' && t.moveFrame > tm.startup && t.moveFrame <= tm.startup + tm.active) return this.counter(t, a, isProj, hit, rect, dir);

    if (t.state === 'shield' && !hit.sure) {
      t.shieldHP -= dmg * 1.4;
      t.shieldStun = Math.round(3 + dmg * 0.5);
      t.vx = dir * Math.min(3, 0.6 + dmg * 0.15);
      const lag = Math.round(2 + dmg * 0.25);
      t.hitlag = lag;
      if (!isProj) {
        a.hitlag = lag;
        a.vx -= dir * 0.6;
      }
      this.fx.spark(px, py, 6, '#9fe8ff', 2);
      this.sfx.shield();
      if (t.shieldHP <= 0) t.shieldBreak();
      return true;
    }

    if (hit.mark) {
      // Décret impérial : aucun dégât, la cible est marquée ; ce qu'elle encaisse ensuite sera infligé une seconde fois
      if (!t.mark) {
        t.mark = { by: a, until: this.frame + hit.mark, len: hit.mark, dmg: 0 };
        this.fx.callout(t.x, t.y - t.h - 10, 'DÉCRET !', '#d6a83e');
      }
      t.flash = 6;
      t.hitlag = 6;
      if (!isProj) {
        a.hitlag = 6;
        a.landed = true;
      }
      this.fx.spark(px, py, 10, '#d6a83e', 2);
      this.sfx.hit(2);
      return false;
    }

    t.percent = Math.min(999, t.percent + dmg);
    if (t.mark) t.mark.dmg += dmg;
    if (t.mounted && (t.horseHP -= dmg) <= 0) t.setMount(false); // trop de coups : le cheval s'enfuit
    // gaze : n'étourdit que la cible tournée vers le lanceur ; de dos, coup normal
    if (hit.stun && (!hit.gaze || t.facing === (Math.sign(a.x - t.x) || t.facing))) {
      // Carton rouge : pas d'éjection, mais l'adversaire reste sonné un long moment
      t.takeHit(0, 0, 1, a);
      t.hitstun = hit.stun;
      t.flash = 12;
      for (let i = 0; i < 4; i++) this.fx.dizzy(t.x, t.y - t.h - 2);
      // bulle dessinée sur la planche (« EXPULSÉ ! ») si le perso en a une, sinon bulle de texte
      if (hit.calloutImg && a.sprite.has(hit.calloutImg)) this.fx.add({ type: 'sprite', fr: a.sprite.get(hit.calloutImg), x: t.x, y: t.y - t.h - 14, vy: -0.25, h: 15, facing: 1, life: 50, center: true });
      else this.fx.callout(t.x, t.y - t.h - 10, hit.callout || 'EXPULSÉ !', '#e3192b');
      this.fx.add({ type: 'flash', x: px, y: py, life: 8, size: 20, color: '#ff4040' });
      this.sfx.shield();
      this.hudShake[t.id] = 12;
      this.emitHud(t);
      this.onEvent({ type: 'rumble', id: t.id, ms: 150 });
      return false;
    }
    const s = (hit.base + t.percent * hit.growth) * (100 / t.stats.weight);
    const ang = (hit.angle * Math.PI) / 180;
    t.takeHit(Math.cos(ang) * s * dir, -Math.sin(ang) * s, s, a);
    if (hit.charm) { // Bisou fatal : la cible, charmée, se déplace moins vite un moment
      t.charmT = hit.charm;
      t.charmBy = a;
      this.fx.callout(t.x, t.y - t.h - 10, 'CHARMÉ !', '#ff4fa3');
    }
    a.comboTarget = t;
    a.comboFrame = this.frame;
    if (!isProj) {
      // hitImg : image de la planche qui éclate sur la cible (saisie de la Dissolution…)
      if (a.move?.hitImg && a.sprite.has(a.move.hitImg)) this.fx.add({ type: 'sprite', fr: a.sprite.get(a.move.hitImg), x: t.x, y: t.y - t.h, h: t.h * 1.6, facing: 1, life: 32, center: true });
      a.landed = true;
      if (!a.grounded) {
        // Coup aérien qui touche : on flotte un instant et on récupère un saut pour poursuivre
        a.jumpsLeft = Math.max(a.jumpsLeft, 1);
        a.airdodgeUsed = false;
        a.fastFalling = false;
        a.vy = Math.min(a.vy, -1.1);
      }
    }
    if (t.combo >= 2) {
      a.record.bestCombo = Math.max(a.record.bestCombo || 0, t.combo);
      this.fx.list = this.fx.list.filter((q) => !(q.type === 'combo' && q.owner === t));
      this.fx.add({ type: 'combo', owner: t, x: t.x, y: t.y - t.h - 16, n: t.combo, color: a.color, life: 55 });
      this.sfx.combo?.(t.combo);
    }

    const lag = Math.round(3 + dmg * 0.4 + (s > 8 ? 3 : 0));
    t.hitlag = lag;
    if (!isProj) a.hitlag = lag;
    a.record.dealt += dmg;

    this.fx.hit(px, py, s, dmg, a.fxs.colors[0]);
    if (s > 6 && a.fxs.flag) this.fx.confetti(px, py, a.fxs.confettiColors || FLAG_COLORS[a.fxs.flag], Math.round(6 + s), 1.5 + s * 0.15);
    if (s > 6) this.shake(Math.min(10, s * 0.6));
    if (s > 10) this.flashAmt = 3;
    this.sfx.hit(s);
    this.hudShake[t.id] = 12;
    this.emitHud(t);
    this.onEvent({ type: 'rumble', id: t.id, ms: Math.min(200, Math.round(30 + dmg * 8)) });
    return false;
  }

  spawnProjectile(o, c = o.proj) {
    const mine = this.projectiles.filter((p) => p.owner === o && p.kind === c.kind && !p.summon).length; // limite par type (ballon et carton sont indépendants)
    if (mine >= c.max) return;
    // Rafale : plusieurs projectiles à quelques frames d'écart (bulles de punchlines…)
    // imgs : plusieurs images de la planche, une au hasard par projectile
    for (let i = 0; i < (c.burst || 1); i++) {
      const name = c.imgs ? c.imgs[(Math.random() * c.imgs.length) | 0] : c.img;
      const fr = name && o.sprite.has(name) ? o.sprite.get(name) : null;
      this.projectiles.push(new Projectile(o, {
        ...c, fr, k: fr ? c.imgHeight / fr.sh : 1,
        x: o.x + o.facing * 12, y: o.y - o.h * 0.6 + (c.burst ? (i - 1) * 5 : 0), vx: c.speed * o.facing, vy: c.vy || 0,
        ang: o.facing > 0 ? 0 : Math.PI, delay: i * (c.burstGap || 0),
        text: c.texts ? c.texts[(Math.random() * c.texts.length) | 0] : null,
        hitIds: c.pierce ? new Set() : null,
      }));
    }
    this.sfx.shoot();
  }

  /**
   * Invocation : manif, armée, tracteur, reporter… qui avance au sol et traverse l'adversaire,
   * avion qui traverse l'écran (fly), mur qui bloque (wall), batterie du Dôme de fer.
   * key : champ du perso qui décrit l'invocation (« summon » par défaut, un spécial peut en avoir une autre).
   */
  spawnSummon(o, key = 'summon') {
    const c = o.char[key];
    if (!c || this.projectiles.some((p) => p.owner === o && p.summonKey === key)) return;
    if (c.groundOnly && !o.grounded && !o.moveGround) return;
    const g = o.ground || o.moveGround || this.stage.solids[0];
    const dir = o.facing;
    if (c.kind === 'battery') {
      // Dôme de fer : une batterie qui tire des intercepteurs à tête chercheuse
      const fr = c.img ? o.sprite.get(c.img) : null;
      this.projectiles.push(new Projectile(o, {
        kind: 'battery', summon: true, summonKey: key, noHit: true, dir, x: o.x + dir * 16, y: g.y - 6, vx: 0, vy: 0, gravity: 0,
        life: c.life, size: 4, hw: 12, hh: 6, ground: g, color: o.fxs.colors[0], shots: c.shots, missile: c.missile,
        fr, k: fr ? (c.imgHeight || 30) / fr.sh : 1, flip: !!c.flip,
        fireFr: c.fireImg && o.sprite.has(c.fireImg) ? o.sprite.get(c.fireImg) : null,
      }));
      this.shake(3);
      this.sfx.land();
      return;
    }
    for (let i = 0; i < (c.count || 1); i++) {
      const name = c.imgs ? c.imgs[i % c.imgs.length] : c.img; // ex. reporter puis caméraman
      const fr = name ? o.sprite.get(name) : null;
      const k = fr ? c.imgHeight / fr.sh : 1;
      const w = fr ? fr.sw * k : c.width || 18, h = c.imgHeight || 20;
      let x = o.x + dir * (c.from === 'behind' ? -w * 0.25 : c.from === 'under' ? 0 : c.from === 'offscreen' ? -170 : 14 + (c.wall ? w / 2 : 0)) - dir * i * (c.spacing || 0);
      const y = c.fly ? o.y - o.h * 0.5 + (c.dy || 0) : g.y - h / 2;
      if (c.from === 'offscreen') x = clamp(x, this.stage.blast.left, this.stage.blast.right);
      this.projectiles.push(new Projectile(o, {
        kind: c.kind || 'summon', summon: true, summonKey: key, pierce: true, hitIds: new Set(), fr, k,
        x, y, vx: dir * (c.speed || 0), vy: 0, gravity: 0, life: c.life, size: 4, hw: w * (c.wall ? 0.45 : 0.4), hh: h / 2, ground: c.fly ? null : g,
        fly: !!c.fly, wall: !!c.wall, drops: c.drops, noHit: !!c.noHit, // noHit : l'avion ne frappe pas, ses bombes oui
        noFlip: !!c.noFlip, // noFlip : image avec texte ou drapeaux, jamais en miroir
        dmg: c.dmg, base: c.base, growth: c.growth, angle: c.angle, stun: c.stun, callout: c.callout,
        color: o.fxs.colors[0], rainbow: c.rainbow && i === 0, delay: i * (c.delayGap ?? 8),
      }));
      if (c.wall || c.from === 'under') this.fx.puff(x, g.y - 6, '#d9d4cc');
    }
    if (c.say) this.fx.callout(o.x, o.y - o.h - 14, c.say, o.fxs.colors[0]);
    this.shake(c.wall ? 5 : 3);
    c.wall ? this.sfx.land() : this.sfx.shoot();
  }

  spawnWaves(o) {
    const g = o.ground;
    if (!g) return;
    for (const d of [-1, 1]) {
      this.projectiles.push(new Projectile(o, {
        kind: 'wave', x: o.x + d * 8, y: g.y - 4, vx: d * 3, vy: 0, gravity: 0, life: 22, size: 4,
        color: o.fxs.colors[0], dmg: 5, base: 2.4, growth: 0.035, angle: 70, ground: g,
      }));
    }
  }

  /** « Le Grand Remplacement » : le lanceur et l'adversaire échangent leurs places. */
  swapWithFoe(o) {
    let foe = null, best = Infinity;
    for (const f of this.fighters) {
      if (f === o || f.eliminated || f.invulnerable() || f.state === 'ledge') continue;
      const d = Math.hypot(f.x - o.x, f.y - o.y);
      if (d < best) { best = d; foe = f; }
    }
    if (!foe || (o.swapReady ?? 0) > this.frame) {
      this.fx.puff(o.x, o.y - o.h / 2, '#9aa3bd');
      return;
    }
    o.swapReady = this.frame + 240; // 4 secondes avant le prochain échange
    for (const f of [o, foe]) {
      // nuage dessiné sur la planche, s'il y en a un (sinon nuage de particules)
      if (!o.sprite.has('fx_smoke')) this.fx.puff(f.x, f.y - f.h / 2, o.fxs.colors[0]);
      else this.fx.add({ type: 'sprite', fr: o.sprite.get('fx_smoke'), x: f.x, y: f.y - f.h / 2, h: f.h * 1.3, facing: 1, life: 30, center: true });
    }
    const keys = ['x', 'y', 'vx', 'vy'];
    const a = keys.map((k) => o[k]), b = keys.map((k) => foe[k]);
    keys.forEach((k, i) => { o[k] = b[i]; foe[k] = a[i]; });
    for (const f of [o, foe]) {
      f.grounded = false; // chacun se repose sur ce qu'il y a sous ses pieds
      f.ground = null;
    }
    foe.takeHit(0, -1, 2, o); // l'adversaire, sonné, ne comprend pas ce qui lui arrive
    foe.hitstun = 22;
    foe.flash = 10;
    o.invuln = Math.max(o.invuln, 12);
    this.shake(4);
    this.sfx.whoosh();
  }

  /** Nuage persistant laissé par un projectile (p.cloud) ; un seul par lanceur, le précédent disparaît. */
  spawnCloud(p) {
    const c = p.cloud, o = p.owner;
    for (const q of this.projectiles) if (q.owner === o && q.kind === 'cloud') q.dead = true;
    const fr = c.img && o.sprite.has(c.img) ? o.sprite.get(c.img) : null;
    this.projectiles.push(new Projectile(o, {
      kind: 'cloud', noHit: true, x: p.x, y: p.y, vx: 0, vy: 0, gravity: 0, life: c.life, size: c.r, tick: c.tick, dmg: c.dmg,
      fr, k: fr ? c.imgHeight / fr.sh : 1, color: p.color,
    }));
    this.fx.puff(p.x, p.y, p.color);
  }

  /** Traînée laissée par une ruée (champ trail du coup) : couvre le trajet, blesse sans éjecter puis s'efface. */
  spawnTrail(o, x0, c) {
    for (const q of this.projectiles) if (q.owner === o && q.trail) q.dead = true;
    const fr = c.img && o.sprite.has(c.img) ? o.sprite.get(c.img) : null;
    const hw = Math.max(8, Math.abs(o.x - x0) / 2);
    this.projectiles.push(new Projectile(o, {
      kind: 'cloud', trail: true, noHit: true, x: (o.x + x0) / 2, y: o.y - (c.dy ?? 6), vx: 0, vy: 0, gravity: 0, life: c.life,
      size: c.hh ?? 6, hw, hh: c.hh ?? 6, tick: c.tick, dmg: c.dmg, dir: Math.sign(o.x - x0) || o.facing,
      fr, k: fr ? (hw * 2) / fr.sw : 1, color: o.fxs.colors[0],
    }));
  }

  /** Contre (Gilet jaune) : le coup est annulé, l'attaquant est retourné et le contreur lui fait face. */
  counter(t, a, isProj, hit, rect, dir) {
    const mv = t.move;
    if (mv.stun && !isProj) {
      // Contre impérial : on pare et l'attaquant reste étourdi (mv.stun frames), sans dégâts
      t.facing = Math.sign(a.x - t.x) || t.facing;
      t.startMove('riposte');
      this.fx.add({ type: 'flash', x: (t.x + a.x) / 2, y: t.y - t.h * 0.6, life: 8, size: 22, color: '#ffe08a' });
      this.applyHit(t, a, { dmg: 0, stun: mv.stun, callout: 'ÉTOURDI !', sure: true }, rect, -dir, false);
      return 'counter';
    }
    if (!isProj) {
      a.facing = -a.facing;
      a.vx = -a.vx * 0.5;
      a.hitlag = 10;
    }
    t.facing = Math.sign(a.x - t.x) || t.facing;
    t.hitlag = 6;
    const img = t.move.counterImg;
    if (img && t.sprite.has(img)) this.fx.add({ type: 'sprite', fr: t.sprite.get(img), x: t.x + t.facing * 10, y: t.y - t.h * 0.55, h: t.h * 0.9, facing: t.facing, life: 22, center: true });
    this.fx.callout(t.x, t.y - t.h - 10, 'RETOURNÉ !', t.color);
    this.sfx.shield();
    return 'counter';
  }

  /** Retouche express : double laissé sur place, qui encaisse un coup à la place de sa propriétaire. */
  spawnDecoy(o) {
    for (const q of this.projectiles) if (q.owner === o && q.kind === 'decoy') q.dead = true;
    const fr = o.sprite.has('fx_decoy') ? o.sprite.get('fx_decoy') : null;
    this.projectiles.push(new Projectile(o, {
      kind: 'decoy', noHit: true, x: o.x, y: o.y - o.h / 2, vx: 0, vy: 0, gravity: 0, life: o.moves.downB?.life ?? 150, size: 4,
      hw: o.w / 2 + 1, hh: o.h / 2, dir: o.facing, fr, k: fr?.scale ?? 1, boom: o.moves.downB?.boom,
    }));
  }

  /** Le double est frappé (ou arrive en fin de vie) : il explose — ou, sans boom, disparaît en figeant l'attaquant. */
  popDecoy(d, a) {
    d.dead = true;
    if (d.boom) {
      if (a) {
        a.hitlag = 10; // reste dans l'explosion
        this.fx.callout(a.x, a.y - a.h - 10, 'PIÉGÉ !', '#ff4fa3');
      }
      this.blast(d.owner, d.x, d.y + d.hh * 0.3, d.boom);
      return;
    }
    const sp = d.owner.sprite;
    if (sp.has('fx_poof')) this.fx.add({ type: 'sprite', fr: sp.get('fx_poof'), x: d.x, y: d.y, h: d.hh * 2.4, facing: 1, life: 24, center: true });
    else this.fx.puff(d.x, d.y, '#ff8fc8');
    if (a) {
      a.hitlag = 30;
      this.fx.callout(a.x, a.y - a.h - 10, 'RATÉ !', '#ff4fa3');
    }
    this.sfx.whoosh();
  }

  /** Fin du Décret impérial : les dégâts reçus pendant la marque sont infligés une seconde fois, en une explosion. */
  decree(t) {
    const M = t.mark;
    t.mark = null;
    if (t.state === 'dead' || t.state === 'respawn') return;
    const sp = M.by.sprite, y = t.y - t.h / 2;
    if (sp.has('fx_mark')) this.fx.add({ type: 'sprite', fr: sp.get('fx_mark', 0, null, 0.99), x: t.x, y, h: t.h * 1.4, facing: 1, life: 26, center: true });
    if (M.dmg < 1) {
      this.fx.puff(t.x, y, '#d6a83e');
      return;
    }
    // seulement des % en plus, sans éjection
    t.percent = Math.min(999, t.percent + M.dmg);
    M.by.record.dealt += M.dmg;
    t.flash = 10;
    this.fx.boom(t.x, y, 0.8 + Math.min(0.8, M.dmg / 50));
    this.fx.callout(t.x, t.y - t.h - 12, `DÉCRET ×2 : +${Math.round(M.dmg)} %`, '#d6a83e');
    this.sfx.hit(4);
    this.hudShake[t.id] = 12;
    this.emitHud(t);
  }

  /** Explosion (grenade, charge) : zone de coup de rayon b.r pendant quelques frames, image de la planche si dispo. */
  blast(o, x, y, b) {
    this.projectiles.push(new Projectile(o, {
      kind: 'blast', x, y, vx: 0, vy: 0, gravity: 0, life: 5, size: b.r, pierce: true, hitIds: new Set(),
      dmg: b.dmg, base: b.base, growth: b.growth, angle: b.angle,
    }));
    if (b.img && o.sprite.has(b.img)) this.fx.add({ type: 'sprite', fr: o.sprite.get(b.img), x, y: y - b.imgHeight * 0.35, h: b.imgHeight, facing: 1, life: 30, center: true });
    else this.fx.boom(x, y, 1.2);
    this.shake(6);
    this.sfx.hit(9);
  }

  /** Bombe larguée par un bombardier : tombe, explose au sol ou sur l'adversaire. */
  dropBomb(b) {
    const d = b.drops, sp = b.owner.sprite;
    const fr = d.img && sp.has(d.img) ? sp.get(d.img) : null;
    this.projectiles.push(new Projectile(b.owner, {
      kind: 'image', fr, k: fr ? d.imgHeight / fr.sh : 1, boom: true, x: b.x, y: b.y + 4, vx: b.vx * 0.25, vy: 0.5, gravity: 0.22,
      life: 120, size: 4, hw: 4, hh: 5, rot: Math.PI / 2 * Math.sign(b.vx || 1) * 0, dmg: d.dmg, base: d.base, growth: d.growth, angle: d.angle, color: '#ff7043', noFlip: true,
    }));
  }

  /** Un intercepteur part de la batterie, vers le haut, puis file sur l'adversaire. */
  launchInterceptor(b) {
    const d = b.dir, m = b.missile, sp = b.owner.sprite;
    const fr = m.img && sp.has(m.img) ? sp.get(m.img) : null; // intercepteur dessiné sur la planche
    this.projectiles.push(new Projectile(b.owner, {
      // launch : angle de départ (0 = droit devant) ; sans lui, l'intercepteur part vers le haut
      ...m, kind: 'missile', fr, k: fr ? m.imgHeight / fr.sh : 1, x: b.x + d * (m.dx ?? 6), y: b.y - (m.dy ?? 14), vx: 0, vy: 0,
      ang: m.launch != null ? (d > 0 ? -m.launch : Math.PI + m.launch) : -Math.PI / 2 + d * 0.45,
    }));
    this.fx.smoke(b.x + d * 6, b.y - 10, '#d9d4cc');
    this.fx.add({ type: 'flash', x: b.x + d * 8, y: b.y - 14, life: 6, size: 10, color: '#ffb347' });
    this.sfx.shoot();
  }

  shake(n) {
    this.shakeAmt = Math.max(this.shakeAmt, n);
  }

  emitHud(f) {
    this.onEvent({ type: 'hud', id: f.id, percent: Math.floor(f.percent), stocks: f.stocks });
  }

  onKO(f) {
    const c = this.cam;
    const hw = 240 / c.zoom - 12, hh = 135 / c.zoom - 12;
    const x = clamp(f.x, c.x - hw, c.x + hw);
    const y = clamp(f.y - f.h / 2, c.y - hh, c.y + hh);
    this.fx.koBlast(x, y, Math.atan2(150 - y, 240 - x), f.color);
    this.shake(14);
    this.flashAmt = 5;
    this.sfx.ko();
    this.emitHud(f);
    this.onEvent({ type: 'rumble', id: f.id, ms: 400 });
    // Flash info en haut de l'écran
    this.koNews = { text: `${f.player.name} : ${KO_LINES[(Math.random() * KO_LINES.length) | 0]}`, t: 150 };
  }

  checkEnd() {
    if (this.phase === 'gameover') return;
    const alive = this.fighters.filter((f) => !f.eliminated);
    if (alive.length <= 1) {
      this.phase = 'gameover';
      this.winner = alive[0] || null;
      this.endTimer = 0;
      const w = this.winner;
      if (w?.fxs.flag) this.fx.confetti(w.x, w.y - w.h - 20, w.fxs.confettiColors || FLAG_COLORS[w.fxs.flag], 60, 3.5);
      this.sfx.gameSet();
    }
  }

  forfeit(id) {
    const f = this.fighters.find((q) => q.id === id);
    if (!f || f.eliminated) return;
    f.eliminated = true;
    f.stocks = 0;
    f.setState('dead');
    f.deadTimer = Infinity;
    this.checkEnd();
  }

  updateCamera() {
    // Caméra fixe, centrée sur l'arène : elle ne suit personne. Vue large qui montre les bords et le dessous de la nacelle ;
    // elle dézoome encore (sans se décaler sur le côté) quand un perso sort de ce cadre. Gros plan sur le vainqueur en fin de partie.
    const w = this.phase === 'gameover' && this.winner && this.winner.state !== 'dead' ? this.winner : null;
    let cx = 240, cy, zoom;
    if (w) {
      cx = clamp(w.x, -110, 590) * 0.75 + 60;
      cy = (clamp(w.y - w.h / 2, -130, 300) - 8) * 0.7 + 45;
      zoom = 1.8;
    } else {
      const b = this.stage.blast;
      let half = 320, top = -15, bottom = 345; // cadre de base : x -80…560, y -15…345
      for (const f of this.fighters) {
        if (f.state === 'dead' || f.state === 'respawn') continue;
        half = Math.max(half, Math.abs(f.x - 240) + 40);
        top = Math.min(top, f.y - f.h - 25);
        bottom = Math.max(bottom, f.y + 25);
      }
      half = Math.min(half, b.right - 240);
      top = Math.max(top, b.top);
      bottom = Math.min(bottom, b.bottom);
      zoom = Math.min(240 / half, 270 / (bottom - top));
      cy = bottom - 135 / zoom; // le bas reste calé : un combo vers le haut agrandit la vue par le haut
    }
    const c = this.cam;
    const k = zoom < c.zoom ? 0.1 : 0.04; // dézoome vite, revient en douceur
    c.x += (cx - c.x) * 0.07;
    c.y += (cy - c.y) * k;
    c.zoom += (zoom - c.zoom) * k;
  }

  // ------------------------------------------------------------ rendu

  render(ctx, W, H) {
    const base = Math.min(W / 480, H / 270);
    const c = this.cam;
    const sh = this.shakeAmt * base;
    const ox = (Math.random() - 0.5) * sh, oy = (Math.random() - 0.5) * sh;
    renderScenery(ctx, W, H, c, base, this.frame, ox, oy);

    const S = base * c.zoom;
    ctx.setTransform(S, 0, 0, S, W / 2 - c.x * S + ox, H / 2 - c.y * S + oy);
    for (const f of this.fighters) if (f.state === 'respawn') this.drawRespawnPad(ctx, f);
    for (const p of this.projectiles) p.draw(ctx, this.frame);
    const w = this.winner;
    if (this.phase === 'gameover' && w?.fxs.flag && w.state !== 'dead') {
      const k = Math.min(1, this.endTimer / 25); // le drapeau sort du sol
      drawFlag(ctx, w.fxs.flag, w.x - w.facing * 10, w.y - w.h * 1.3 * k, 18, 12, this.frame, { dir: -w.facing });
    }
    for (const f of this.fighters) this.drawShadow(ctx, f);
    for (const f of this.fighters) f.draw(ctx, this.frame);
    this.fx.draw(ctx);
    for (const f of this.fighters) this.drawTag(ctx, f);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawOffscreen(ctx, W, H, S, ox, oy, base);
    this.drawHud(ctx, W, H, base);
    this.drawBanner(ctx, W, H, base);
    if (this.flashAmt > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAmt * 0.05})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  drawRespawnPad(ctx, f) {
    if (f.fxs.flag) drawFlag(ctx, f.fxs.flag, f.x + 9, f.y - 12, 10, 6.6, this.frame);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, f.x, f.y + 1, 14, f.color, 0.6);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#eef6ff';
    ctx.fillRect(Math.round(f.x) - 10, Math.round(f.y), 20, 1);
    ctx.fillStyle = f.color;
    ctx.fillRect(Math.round(f.x) - 9, Math.round(f.y) + 1, 18, 2);
  }

  /** Ombre portée sur le sol sous le perso : il paraît posé, et on lit mieux sa hauteur en l'air. */
  drawShadow(ctx, f) {
    if (f.state === 'dead' || f.state === 'respawn') return;
    let gy = Infinity;
    for (const s of [...this.stage.solids, ...this.stage.platforms]) {
      if (f.x >= s.x && f.x <= s.x + s.w && s.y >= f.y - 0.5 && s.y < gy) gy = s.y;
    }
    if (gy === Infinity) return;
    const dist = gy - f.y, k = Math.max(0, 1 - dist / 90);
    if (k <= 0) return;
    const rx = f.w * (0.75 + 0.35 * k), ry = 2.2 * (0.6 + 0.4 * k);
    ctx.save();
    ctx.globalAlpha = 0.38 * k;
    ctx.fillStyle = '#0b0712';
    ctx.beginPath();
    ctx.ellipse(f.x, gy + 0.6, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawTag(ctx, f) {
    if (f.state === 'dead') return;
    const x = Math.round(f.x), y = Math.round(f.y - f.h - 6);
    ctx.fillStyle = f.color;
    ctx.fillRect(x - 2, y, 5, 1);
    ctx.fillRect(x - 1, y + 1, 3, 1);
    ctx.fillRect(x, y + 2, 1, 1);
    ctx.font = `5px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#07031a';
    ctx.strokeText(`P${f.slot + 1}`, x + 0.5, y - 1);
    ctx.fillText(`P${f.slot + 1}`, x + 0.5, y - 1);
  }

  drawOffscreen(ctx, W, H, S, ox, oy, base) {
    const c = this.cam;
    for (const f of this.fighters) {
      if (f.state === 'dead') continue;
      const sx = W / 2 + (f.x - c.x) * S + ox;
      const sy = H / 2 + (f.y - f.h / 2 - c.y) * S + oy;
      const m = 26 * base;
      if (sx > 0 && sx < W && sy > 0 && sy < H) continue;
      const bx = clamp(sx, m, W - m), by = clamp(sy, m, H - m);
      const r = 18 * base;
      const ang = Math.atan2(sy - by, sx - bx);
      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * (r + 8 * base), Math.sin(ang) * (r + 8 * base));
      ctx.lineTo(Math.cos(ang + 0.5) * r, Math.sin(ang + 0.5) * r);
      ctx.lineTo(Math.cos(ang - 0.5) * r, Math.sin(ang - 0.5) * r);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(7,3,26,.85)';
      ctx.fill();
      ctx.lineWidth = 2 * base;
      ctx.strokeStyle = f.color;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r - base, 0, Math.PI * 2);
      ctx.clip();
      ctx.imageSmoothingEnabled = f.icon.width > 32;
      ctx.drawImage(f.icon, -r * 0.82, -r * 0.82, r * 1.64, r * 1.64);
      ctx.restore();
    }
  }

  drawHud(ctx, W, H, u) {
    const n = this.fighters.length;
    const pw = 150, ph = 40, gap = 22, sk = 9; // cartouches inclinés, comme les bandeaux des planches
    const total = n * pw + (n - 1) * gap;
    const x0 = W / 2 - (total / 2) * u;
    const y0 = H - (ph + 8) * u;
    const slant = (x, y, w, h, k = sk) => {
      ctx.beginPath();
      ctx.moveTo(x + k * u, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - k * u, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
    };
    this.fighters.forEach((f, i) => {
      const px = x0 + i * (pw + gap) * u, W0 = pw * u, H0 = ph * u;
      ctx.save();
      ctx.globalAlpha = f.eliminated ? 0.45 : 1;

      // panneau sombre au liseré lumineux de la couleur du joueur
      slant(px, y0, W0, H0);
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 12 * u;
      const bg = ctx.createLinearGradient(0, y0, 0, y0 + H0);
      bg.addColorStop(0, 'rgba(14,24,60,.95)');
      bg.addColorStop(1, 'rgba(4,8,22,.97)');
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.shadowBlur = 0;

      // illustration du perso, fondue dans le panneau
      ctx.save();
      slant(px, y0, W0, H0);
      ctx.clip();
      const img = portraitOf(f.char);
      if (img?.complete && img.naturalWidth) {
        const ih = H0 * 1.25, iw = (img.naturalWidth / img.naturalHeight) * ih;
        ctx.imageSmoothingEnabled = true;
        ctx.globalAlpha *= 0.95;
        ctx.drawImage(img, px - iw * 0.05, y0 - H0 * 0.12, iw, ih);
        const fade = ctx.createLinearGradient(px + 30 * u, 0, px + 80 * u, 0);
        fade.addColorStop(0, 'rgba(6,11,30,0)');
        fade.addColorStop(1, 'rgba(6,11,30,.96)');
        ctx.fillStyle = fade;
        ctx.fillRect(px, y0, W0, H0);
      } else {
        ctx.drawImage(f.icon, px + 8 * u, y0 + 4 * u, 32 * u, 32 * u);
      }
      ctx.restore();

      slant(px, y0, W0, H0);
      ctx.lineWidth = 1.2 * u;
      ctx.strokeStyle = f.color;
      ctx.stroke();

      // bandeau du nom, incliné, à la couleur du joueur
      ctx.font = `italic 700 ${Math.round(8 * u)}px ${UI}`;
      const name = (f.player.name || '').toUpperCase().slice(0, 14);
      const bw = Math.max(46 * u, ctx.measureText(name).width + 16 * u), bx = px + 4 * u, by = y0 - 6 * u;
      slant(bx, by, bw, 11 * u, 5);
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, bx + 7 * u, by + 5.8 * u);

      // vies : petites têtes rondes du perso
      for (let k = 0; k < this.rules.stocks; k++) {
        const cx = px + (pw - 16 - k * 10) * u, cy = y0 + 31 * u, r = 4 * u;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#0a1230';
        ctx.fill();
        if (k < f.stocks) {
          ctx.clip();
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(f.icon, cx - r, cy - r, r * 2, r * 2);
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.lineWidth = 0.8 * u;
        ctx.strokeStyle = k < f.stocks ? '#fff' : 'rgba(255,255,255,.2)';
        ctx.stroke();
      }

      // pourcentage : gros chiffres italiques, qui tremblent quand on prend un coup
      const shake = (this.hudShake[f.id] || 0) * 0.25 * u;
      const jx = (Math.random() - 0.5) * shake, jy = (Math.random() - 0.5) * shake;
      const pct = `${Math.floor(f.percent)}`;
      const tx = px + 70 * u + jx, ty = y0 + 27 * u + jy;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.transform(1, 0, -0.16, 1, 0, 0);
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.font = `${Math.round(22 * u)}px ${DISPLAY}`;
      ctx.lineWidth = 3.4 * u;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
      ctx.strokeText(pct, 0, 0);
      ctx.fillStyle = percentColor(f.percent);
      ctx.shadowColor = percentColor(f.percent);
      ctx.shadowBlur = 8 * u;
      ctx.fillText(pct, 0, 0);
      const pw2 = ctx.measureText(pct).width;
      ctx.font = `${Math.round(10 * u)}px ${DISPLAY}`;
      ctx.strokeText('%', pw2 + 1.5 * u, 0);
      ctx.fillText('%', pw2 + 1.5 * u, 0);
      ctx.restore();

      ctx.font = `italic 700 ${Math.round(4.6 * u)}px ${UI}`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8f9bc4';
      ctx.fillText('IMPOPULARITÉ', px + 70 * u, y0 + 35.5 * u);

      // recharge des spéciaux : pastilles qui se remplissent (gris = pas encore dispo)
      let ix = px + (pw - 16) * u;
      for (const [k, glyph] of [['downB', '↓'], ['upB', '↑'], ['sideB', '→'], ['neutralB', 'B']]) {
        const max = f.moves[k]?.cooldown;
        if (!max) continue;
        const left = f.cd[k] / max, cx = ix, cy = y0 + 11 * u, r = 4.2 * u;
        ix -= 10 * u;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = left > 0 ? 'rgba(10,18,48,.95)' : f.color;
        ctx.fill();
        if (left > 0) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (1 - left) * Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = 'rgba(143,155,196,.55)';
          ctx.fill();
        }
        ctx.lineWidth = 0.8 * u;
        ctx.strokeStyle = left > 0 ? 'rgba(255,255,255,.25)' : '#fff';
        ctx.stroke();
        ctx.font = `700 ${Math.round(5.4 * u)}px ${UI}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = left > 0 ? 'rgba(255,255,255,.45)' : '#fff';
        ctx.fillText(glyph, cx, cy + 0.3 * u);
      }
      ctx.restore();
    });
  }

  drawBanner(ctx, W, H, u) {
    if (this.koNews) this.drawNews(ctx, W, u);
    let text = null, t = 0, color = PAPER;
    if (this.phase === 'countdown') {
      text = String(3 - Math.floor(this.timer / 60));
      t = (this.timer % 60) / 60;
    } else if (this.goTimer > 0) {
      text = 'DÉBATTEZ !';
      t = 1 - this.goTimer / 60;
      color = RED;
    } else if (this.phase === 'gameover' && this.endTimer < 150) {
      text = this.winner ? 'ÉLU !' : 'BALLOTTAGE !';
      t = Math.min(1, this.endTimer / 30) * 0.4;
      color = '#e8b647';
    }
    if (!text) return;
    const pop = 1 + Math.max(0, 0.6 - t * 3);
    const size = Math.round(46 * u * pop);
    ctx.save();
    ctx.globalAlpha = t > 0.8 && this.phase !== 'gameover' ? 1 - (t - 0.8) * 5 : 1;
    ctx.font = `${size}px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(W / 2, H / 2 - 22 * u);
    ctx.transform(1, 0, -0.18, 1, 0, 0); // italique des planches
    ctx.fillStyle = '#000';
    ctx.fillText(text, 5 * u, 5 * u);
    ctx.lineWidth = 6 * u;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.strokeText(text, 0, 0);
    ctx.shadowColor = color === PAPER ? '#2f6bff' : color;
    ctx.shadowBlur = 24 * u;
    ctx.fillStyle = color === PAPER ? '#ffffff' : color;
    ctx.fillText(text, 0, 0);
    ctx.shadowBlur = 0;
    // filet tricolore sous le texte
    const tw = ctx.measureText(text).width, bh = 4 * u;
    ['#0055a4', '#f3efe6', '#ef4135'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(-tw / 2 + (i * tw) / 3, size * 0.48, tw / 3, bh);
    });
    ctx.restore();
  }

  /** « FLASH INFO » qui annonce un KO, façon chaîne d'info. */
  drawNews(ctx, W, u) {
    const n = this.koNews, appear = Math.min(1, (150 - n.t) / 8), leave = Math.min(1, n.t / 10);
    const h = 18 * u, y = 10 * u, k = Math.min(appear, leave);
    ctx.save();
    ctx.font = `${Math.round(10 * u)}px ${DISPLAY}`;
    const tag = 'FLASH INFO', tagW = ctx.measureText(tag).width + 12 * u;
    const textW = ctx.measureText(n.text).width + 16 * u;
    const w = (tagW + textW) * k, x = W / 2 - (tagW + textW) / 2;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 3 * u, y + 3 * u, tagW + textW, h);
    ctx.fillStyle = RED;
    ctx.fillRect(x, y, tagW, h);
    ctx.fillStyle = PAPER;
    ctx.fillRect(x + tagW, y, textW, h);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(tag, x + 6 * u, y + h / 2 + u * 0.5);
    ctx.fillStyle = INK;
    ctx.fillText(n.text, x + tagW + 8 * u, y + h / 2 + u * 0.5);
    ctx.restore();
  }
}

function percentColor(p) {
  const stops = [[0, [255, 255, 255]], [50, [255, 236, 120]], [100, [255, 150, 60]], [150, [255, 60, 60]], [220, [160, 20, 40]]];
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i][0]) {
      const [p0, c0] = stops[i - 1], [p1, c1] = stops[i];
      const k = (p - p0) / (p1 - p0);
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k))})`;
    }
  }
  return 'rgb(160,20,40)';
}
