// Un combattant : états, déplacements, coups, collisions avec l'arène.
import { buildMoves, DEFAULT_PROJECTILE, SPECIALS } from './moves.js';
import { drawFrame } from '../shared/sprites.js';
import { pxArc } from './fx.js';

const DEFAULT_STATS = {
  weight: 100, runSpeed: 2.4, groundAccel: 0.45, friction: 0.72,
  airSpeed: 1.9, airAccel: 0.16, gravity: 0.32, maxFall: 4.6, fastFall: 6.8,
  jumpPower: 6.2, doubleJumpPower: 5.8, jumps: 2, power: 1, frameMult: 1,
  width: 12, height: 25,
};
const NO_INPUT = Object.freeze({ x: 0, y: 0, a: false, b: false, j: false, s: false });
const BUFFER = 12; // une commande tapée un peu tôt reste en mémoire 12 frames (0,2 s)
export const SHIELD_MAX = 50;
const GROUND_STATES = new Set(['idle', 'run', 'crouch', 'land', 'jumpsquat']);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// À cheval : animation montée qui remplace chaque animation à pied (les autres -> m_idle)
const MOUNT_ANIM = { walk: 'm_walk', run: 'm_run', dash: 'm_run', jump: 'm_jump', jump2: 'm_jump2', fall: 'm_fall', helpless: 'm_fall', land: 'm_land', jumpsquat: 'm_land', hurt: 'm_hurt', tumble: 'm_hurt' };

export class Fighter {
  constructor(game, player, char, slot) {
    Object.assign(this, { game, player, char, slot, id: player.id });
    this.color = game.slotColors[slot];
    this.stats = { ...DEFAULT_STATS, ...(char.stats || {}) };
    // Contrôle aérien un peu plus généreux pour tout le monde : poursuites en l'air et retours sur la nacelle.
    this.stats.airSpeed *= 1.08;
    this.stats.airAccel *= 1.2;
    this.shieldMax = this.stats.shieldMax ?? SHIELD_MAX;
    // Thème d'effets du perso : style des coups, traînée des spéciaux, forme du bouclier
    this.fxs = { style: 'arc', trail: 'smoke', shield: 'bubble', ...(char.fx || {}) };
    this.fxs.trailUp ??= this.fxs.trail;
    this.fxs.colors = [...(char.fx?.colors || []), this.color, '#ffffff', this.color].slice(0, 3);
    this.moves = buildMoves(char, this.stats.frameMult);
    this.proj = { ...DEFAULT_PROJECTILE, ...(char.projectile || {}) };
    this.sprite = player.alt ? char.gfxAlt : char.gfx;
    this.icon = player.alt ? char.iconAltImg : char.iconImg;
    this.w = this.stats.width;
    this.h = this.stats.height;
    this.stocks = game.rules.stocks;
    this.percent = 0;
    this.eliminated = false;
    this.record = { kos: 0, falls: 0, dealt: 0 };
    this.prev = { ...NO_INPUT };
    this.in = NO_INPUT;
    this.buf = { a: 0, b: 0, j: 0 };
    this.hitIds = new Set();
    this.lastHitBy = null;
    this.lastHitTime = -1e9;

    const sp = game.stage.spawns[slot];
    this.reset(sp.x, sp.y);
    this.facing = sp.x < 240 ? 1 : -1;
    this.bagIdx = 0; // Sac sans fond : on commence toujours par le premier objet
    this.grounded = true;
    this.ground = game.stage.solids[0];
  }

  reset(x, y) {
    this.setMount(false, true);
    this.mark = null;
    this.charmT = 0;
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.state = 'idle'; this.stateTime = 0; this.animTick = 0;
    this.move = null; this.moveName = null; this.moveFrame = 0; this.moveAir = false; this.slamT = 0;
    this.grounded = false; this.ground = null; this.jumpsLeft = this.stats.jumps;
    this.hitstun = 0; this.hitlag = 0; this.launched = false; this.invuln = 0; this.flash = 0;
    this.shieldHP = this.shieldMax; this.shieldStun = 0; this.dropTimer = 0; this.fastFalling = false;
    this.airdodgeUsed = false; this.sideBUsed = false; this.jump2T = 0; this.landLag = 0; this.tumbleRot = 0; this.dodgeDir = 0;
    this.cd = { neutralB: 0, sideB: 0, upB: 0, downB: 0 }; // recharge des spéciaux, en frames
    this.combo = 0; this.comboTarget = null; this.comboFrame = -1e9; this.denyT = 0;
  }

  /** Monture (Napoléon) : autres stats, zone de contact plus grande et animations « m_ » tant qu'il est à cheval. */
  setMount(on, quiet = false) {
    const M = this.char.mount;
    if (!M || !!this.mounted === on) return;
    this.mounted = on;
    if (on) {
      this.baseStats = this.stats;
      this.stats = { ...this.stats, ...M.stats };
      this.horseHP = M.hp;
      this.w = M.width;
      this.h = M.height;
      return;
    }
    this.stats = this.baseStats;
    this.w = this.stats.width;
    this.h = this.stats.height;
    if (quiet) return;
    this.cd.downB = M.cooldown; // le cheval ne revient pas tout de suite
    this.game.onEvent({ type: 'cd', id: this.id, k: 'downB', ms: Math.round((M.cooldown * 1000) / 60) });
    const g = this.game;
    if (this.sprite.has('fx_mount')) g.fx.add({ type: 'sprite', fr: this.sprite.get('fx_mount', 0, null, 0.99), x: this.x, y: this.y - this.h * 0.5, h: this.h * 1.4, facing: 1, life: 24, center: true });
    g.fx.puff(this.x, this.y - this.h * 0.4, '#f0e7d2');
    g.sfx.whoosh();
  }

  setState(s) {
    if (this.state !== s) {
      this.state = s;
      this.stateTime = 0;
      this.animTick = 0;
    }
  }

  invulnerable() {
    return this.invuln > 0 || this.state === 'respawn' || this.state === 'dead';
  }

  // ------------------------------------------------------------ boucle

  update() {
    const inp = this.game.acceptInput && !this.eliminated ? this.player.input : NO_INPUT;
    const p = this.prev;
    if (inp.a && !p.a) this.buf.a = BUFFER;
    if (inp.b && !p.b) this.buf.b = BUFFER;
    if (inp.j && !p.j) this.buf.j = BUFFER;
    this.pressS = inp.s && !p.s;
    this.flickDown = inp.y > 0.7 && p.y <= 0.5;
    if (this.ledgeCd > 0) this.ledgeCd--;
    this.flickX = Math.abs(inp.x) > 0.7 && Math.abs(p.x) <= 0.5 ? Math.sign(inp.x) : 0;
    this.downHold = inp.y > 0.65 ? (this.downHold || 0) + 1 : 0; // joystick maintenu vers le bas
    this.in = inp;
    this.prev = { x: inp.x, y: inp.y, a: inp.a, b: inp.b, j: inp.j, s: inp.s };

    if (this.flash > 0) this.flash--;
    if (this.charmT > 0 && --this.charmT % 14 === 0) {
      const sp = this.charmBy?.sprite;
      if (sp?.has('fx_heart')) this.game.fx.add({ type: 'sprite', fr: sp.get('fx_heart'), x: this.x + (Math.random() - 0.5) * 10, y: this.y - this.h - 2, vy: -0.4, h: 5, facing: 1, life: 26, center: true });
    }
    for (const k of SPECIALS) if (this.cd[k] > 0) this.cd[k]--;
    if (this.denyT > 0) this.denyT--;
    if (this.state === 'dead') {
      if (--this.deadTimer <= 0 && !this.eliminated) this.respawn();
      return;
    }
    if (this.hitlag > 0) {
      this.hitlag--;
      return;
    }

    this.stateTime++;
    this.animTick++;
    if (this.jump2T > 0 && (--this.jump2T === 0 || this.state !== 'air')) this.jump2T = 0;
    if (this.invuln > 0) this.invuln--;
    if (this.dropTimer > 0) this.dropTimer--;
    if (this.shieldStun > 0) this.shieldStun--;
    if (this.state !== 'shield') this.shieldHP = Math.min(this.shieldMax, this.shieldHP + 0.12);

    this.runState();
    this.physics();
    for (const k in this.buf) if (this.buf[k] > 0) this.buf[k]--;
  }

  runState() {
    const inp = this.in, st = this.stats, fx = this.game.fx;
    switch (this.state) {
      case 'idle':
      case 'run':
      case 'crouch': {
        if (!this.grounded) {
          this.setState('air');
          break;
        }
        if (this.groundAction()) break;
        if (inp.y > 0.6 && Math.abs(inp.x) < 0.5) {
          this.setState('crouch');
          this.vx *= 0.6;
        } else if (Math.abs(inp.x) > 0.25) {
          this.facing = Math.sign(inp.x);
          this.vx += clamp(inp.x * st.runSpeed - this.vx, -st.groundAccel, st.groundAccel);
          this.setState('run');
          if (this.stateTime % 12 === 1) fx.dust(this.x - this.facing * 4, this.y, -this.facing, 2);
        } else {
          this.vx *= st.friction;
          this.setState('idle');
        }
        break;
      }
      case 'jumpsquat':
        this.vx *= 0.9;
        if (this.stateTime >= 3) this.doJump();
        break;
      case 'land':
        this.vx *= st.friction;
        if (this.stateTime >= this.landLag) this.setState('idle');
        break;
      case 'air':
        if (!this.airAction()) {
          this.airDrift(1);
          this.checkFastFall();
        }
        break;
      case 'ledge':
        this.runLedge();
        break;
      case 'helpless':
        this.airDrift(0.9);
        this.checkFastFall();
        break;
      case 'attack':
        this.runMove();
        break;
      case 'hurt':
        this.hitstun--;
        if (this.launched) {
          this.vx = this.vx * 0.985 + inp.x * 0.05;
          this.tumbleRot += 0.12 * Math.sign(this.vx || 1) + this.vx * 0.04;
          if (this.stateTime % 3 === 0 && Math.hypot(this.vx, this.vy) > 3.5) fx.smoke(this.x, this.y - this.h / 2);
        } else if (this.grounded) this.vx *= 0.85;
        if (this.hitstun <= 0) {
          this.launched = false;
          this.combo = 0;
          this.setState(this.grounded ? 'idle' : 'air');
        }
        break;
      case 'shield':
        this.vx *= 0.7;
        this.shieldHP -= 0.14;
        if (this.shieldHP <= 0) {
          this.shieldBreak();
          break;
        }
        if (this.shieldStun > 0) break;
        if (this.buf.j) {
          this.buf.j = 0;
          this.setState('jumpsquat');
        } else if (this.flickX) this.startDodge('roll', this.flickX);
        else if (this.flickDown) this.startDodge('spotdodge', 0);
        else if (!inp.s) {
          this.landLag = 6;
          this.setState('land');
        }
        break;
      case 'roll': {
        const t = this.stateTime;
        this.vx = t >= 3 && t <= 18 ? this.dodgeDir * 2.9 : this.vx * 0.7;
        if (t === 3) this.invuln = Math.max(this.invuln, 13);
        if (t >= 26) this.setState('idle');
        break;
      }
      case 'spotdodge':
        this.vx *= 0.6;
        if (this.stateTime === 2) this.invuln = Math.max(this.invuln, 14);
        if (this.stateTime >= 22) this.setState('idle');
        break;
      case 'airdodge':
        if (this.stateTime === 1) this.invuln = Math.max(this.invuln, 16);
        if (this.dodgeDir) {
          this.vx *= 0.88;
          this.vy *= 0.88;
        } else this.airDrift(0.5);
        if (this.stateTime >= 30) this.setState('air');
        break;
      case 'shieldbreak':
        this.vx *= 0.9;
        if (this.stateTime % 10 === 0) fx.dizzy(this.x, this.y - this.h - 2);
        if (this.stateTime >= 150) this.setState(this.grounded ? 'idle' : 'air');
        break;
      case 'respawn': {
        const go = Math.abs(inp.x) > 0.3 || inp.y > 0.5 || this.buf.j || this.buf.a || this.buf.b;
        if ((this.stateTime > 30 && go) || this.stateTime > 180) {
          this.setState('air');
          this.invuln = 100;
        }
        break;
      }
    }
  }

  groundAction() {
    if (this.buf.j) {
      this.buf.j = 0;
      this.setState('jumpsquat');
      return true;
    }
    if (this.buf.b) {
      this.buf.b = 0;
      if (this.startSpecial()) return true;
    }
    if (this.buf.a) {
      this.buf.a = 0;
      this.startAttack();
      return true;
    }
    if (this.in.s) {
      this.setState('shield');
      return true;
    }
    // Bas sur une plateforme traversable : on descend (geste sec, ou bas maintenu un instant)
    if (this.ground?.passable && (this.flickDown || this.downHold >= 4)) {
      this.grounded = false;
      this.ground = null;
      this.dropTimer = 12;
      this.vy = 1.5;
      this.setState('air');
      return true;
    }
    return false;
  }

  airAction() {
    const inp = this.in;
    if (this.buf.j && (this.jumpsLeft > 0 || this.mounted)) {
      this.buf.j = 0;
      // À cheval sans saut restant : grand saut du cheval, qui disparaît ensuite
      const leap = this.jumpsLeft <= 0;
      if (leap) this.setMount(false);
      else this.jumpsLeft--;
      this.vy = -(leap ? this.char.mount.jumpPower : this.stats.doubleJumpPower);
      const home = this.homeDir();
      this.vx = inp.x * this.stats.airSpeed * (home && Math.sign(inp.x) === home ? 1.45 : 1); // saut de retour plus long
      this.fastFalling = false;
      this.animTick = 0;
      this.chase();
      this.jump2T = 32; // la pose de double saut (salto) dure un peu plus d'une demi-seconde
      this.game.fx.ring(this.x, this.y, this.fxs.colors[0], 10);
      this.game.fx.ring(this.x, this.y, '#ffffff', 6);
      this.game.sfx.jump(1.35);
      return true;
    }
    if (this.buf.b) {
      this.buf.b = 0;
      if (this.startSpecial()) return true;
    }
    if (this.buf.a) {
      this.buf.a = 0;
      this.startAttack();
      return true;
    }
    if (this.pressS && !this.airdodgeUsed) {
      this.startAirdodge();
      return true;
    }
    return false;
  }

  doJump() {
    this.vy = -this.stats.jumpPower * (this.in.j ? 1 : 0.68); // relâcher tôt = petit saut
    this.vx = clamp(this.vx + this.in.x * 0.5, -this.stats.airSpeed, this.stats.airSpeed);
    this.grounded = false;
    this.ground = null;
    this.setState('air');
    this.game.fx.dust(this.x, this.y, 0, 5);
    this.game.sfx.jump(1);
    this.chase();
  }

  /** Adversaire qu'on vient de toucher et qui est encore sonné : cible de la poursuite. */
  comboFoe() {
    const t = this.comboTarget;
    if (!t || t.state !== 'hurt' || t.hitstun < 4 || this.game.frame - this.comboFrame > 70) return null;
    return t;
  }

  /**
   * Poursuite : un saut pendant un combo part vers l'adversaire éjecté (là où il sera dans un instant),
   * pour enchaîner facilement les coups en l'air. Joystick tiré à l'opposé = saut normal.
   */
  chase() {
    const t = this.comboFoe();
    if (!t) return;
    const T = 13;
    const tx = t.x + t.vx * T * 0.9, ty = t.y - t.h * 0.4 + t.vy * T + 0.5 * t.stats.gravity * 0.6 * T * T;
    const dx = tx - this.x, dy = ty - (this.y - this.h * 0.5);
    if (this.in.x * Math.sign(dx) < -0.3) return;
    this.vx = clamp(dx / T, -3.6, 3.6);
    this.vy = clamp(dy / T - 0.5 * this.stats.gravity * T, -9, -1.5);
    if (Math.abs(dx) > 2) this.facing = Math.sign(dx);
    this.game.fx.ring(this.x, this.y - this.h / 2, '#ffd75e', 9);
    this.game.fx.add({ type: 'ghost', x: this.x, y: this.y, fr: this.currentFrame(), facing: this.facing, life: 10, color: this.fxs.colors[0] });
    this.game.sfx.whoosh();
  }

  /** Côté de l'arène où revenir quand on est hors de la nacelle (0 = au-dessus d'elle). */
  homeDir() {
    const s0 = this.game.stage.solids[0];
    return this.x < s0.x ? 1 : this.x > s0.x + s0.w ? -1 : 0;
  }

  airDrift(mult) {
    const st = this.stats, x = this.in.x;
    // Hors de la nacelle et en direction de celle-ci : on dérive plus vite pour revenir
    const home = this.homeDir(), back = home && Math.sign(x) === home ? 1 : 0;
    const max = st.airSpeed * (back ? 1.3 : 1);
    if (Math.abs(x) > 0.2) {
      const target = x * max, acc = st.airAccel * mult * (back ? 1.5 : 1);
      if (x > 0 && this.vx < target) this.vx = Math.min(target, this.vx + acc);
      else if (x < 0 && this.vx > target) this.vx = Math.max(target, this.vx - acc);
    }
    if (Math.abs(this.vx) > max) this.vx *= 0.92;
    else if (Math.abs(x) <= 0.2) this.vx *= 0.97;
  }

  checkFastFall() {
    if (!this.fastFalling && this.vy > -1 && (this.flickDown || this.downHold >= 3)) {
      this.fastFalling = true;
      this.vy = Math.max(this.vy, this.stats.fastFall);
    }
  }

  startDodge(kind, dir) {
    this.setState(kind);
    this.dodgeDir = dir;
  }

  startAirdodge() {
    this.airdodgeUsed = true;
    this.fastFalling = false;
    const { x, y } = this.in;
    const m = Math.hypot(x, y);
    this.setState('airdodge');
    if (m > 0.4) {
      this.dodgeDir = 1;
      this.vx = (x / m) * 5;
      this.vy = (y / m) * 5;
    } else this.dodgeDir = 0;
  }

  shieldBreak() {
    this.shieldHP = this.shieldMax * 0.6;
    this.setState('shieldbreak');
    this.vy = -5;
    this.grounded = false;
    this.ground = null;
    this.game.fx.spark(this.x, this.y - this.h / 2, 24, '#9fe8ff', 3.5);
    this.game.sfx.shieldBreak();
    this.game.shake(6);
  }

  // ------------------------------------------------------------ coups

  /** Se tourne vers l'adversaire proche : on n'a pas à viser au joystick pour un coup neutre. */
  faceFoe() {
    let best = null, bd = 90;
    for (const f of this.game.fighters) {
      if (f === this || f.state === 'dead' || f.eliminated) continue;
      const d = Math.abs(f.x - this.x);
      if (d < bd && Math.abs(f.y - this.y) < 60) {
        bd = d;
        best = f;
      }
    }
    if (best && Math.abs(best.x - this.x) > 2) this.facing = Math.sign(best.x - this.x);
  }

  startAttack() {
    const { x, y } = this.in;
    let name;
    if (this.mounted) { // à cheval : toutes les attaques deviennent une charge de cavalerie
      if (Math.abs(x) > 0.4) this.facing = Math.sign(x);
      else if (this.grounded) this.faceFoe();
      return this.startMove('cavalry');
    }
    if (this.grounded && Math.abs(x) <= 0.4) this.faceFoe();
    if (this.grounded) {
      if (y < -0.5 && -y >= Math.abs(x) * 0.8) name = 'utilt';
      else if (y > 0.5 && y >= Math.abs(x) * 0.8) name = 'dtilt';
      else if (Math.abs(x) > 0.4) {
        this.facing = Math.sign(x);
        name = 'ftilt';
      } else name = 'jab';
    } else if (y < -0.5 && -y >= Math.abs(x)) name = 'uair';
    else if (y > 0.5 && y >= Math.abs(x)) name = 'dair';
    else if (Math.abs(x) > 0.4) name = Math.sign(x) === this.facing ? 'fair' : 'bair';
    else name = 'nair';
    this.startMove(name);
  }

  /** Renvoie false si le spécial n'est pas parti (en recharge, charge aérienne déjà utilisée). */
  startSpecial() {
    const { x, y } = this.in;
    let name;
    if (y < -0.5 && -y >= Math.abs(x) * 0.7) name = 'upB';
    else if (y > 0.5 && y >= Math.abs(x)) name = 'downB';
    else if (Math.abs(x) > 0.4) name = 'sideB';
    else name = 'neutralB';
    if (!this.moves[name]) return false;
    if (this.cd[name] > 0) {
      // En recharge : petit « pschitt » et bulle grise, pas de coup
      if (this.denyT <= 0 && this.player.type !== 'cpu') {
        this.denyT = 30;
        this.game.fx.callout(this.x, this.y - this.h - 8, `RECHARGE ${Math.ceil(this.cd[name] / 60)} s`, '#6b7591');
        this.game.sfx.deny?.();
        this.game.onEvent({ type: 'deny', id: this.id });
      }
      return false;
    }
    if (this.mounted) {
      // Bas à cheval : on descend ; un autre spécial se fait à pied (le cheval s'en va)
      if (name === 'downB') {
        this.startMove('dismount');
        return true;
      }
      this.setMount(false);
    }
    if ((name === 'neutralB' || name === 'downB') && this.grounded) this.faceFoe();
    if (name === 'sideB') {
      if (!this.grounded && this.sideBUsed) return false;
      this.facing = Math.sign(x);
      if (!this.grounded) this.sideBUsed = true;
    }
    if (this.fxs.anger) this.game.fx.anger(this.x, this.y - this.h - 4);
    // Sac sans fond : chaque appui sort l'objet suivant d'une séquence fixe
    const bag = name === 'sideB' && this.char.bag ? this.char.bag[this.bagIdx] : null;
    if (bag) this.bagIdx = (this.bagIdx + 1) % this.char.bag.length;
    // Le nom du spécial (ou de l'objet sorti du sac) s'affiche au-dessus de la tête
    const label = (bag && this.moves[bag].say) || this.char.specials?.[{ neutralB: 'neutral', sideB: 'side', upB: 'up', downB: 'down' }[name]];
    if (label) this.game.fx.callout(this.x, this.y - this.h - 10, label.toUpperCase(), this.color);
    this.startMove(bag || name);
    const cd = this.moves[name].cooldown;
    if (cd > 0) {
      this.cd[name] = cd;
      this.game.onEvent({ type: 'cd', id: this.id, k: name, ms: Math.round((cd * 1000) / 60) });
    }
    return true;
  }

  startMove(name) {
    const m = this.moves[name];
    if (!m) return;
    this.move = m;
    this.moveName = name;
    this.moveFrame = 0;
    this.moveAir = !this.grounded;
    this.moveGround = this.grounded ? this.ground : null; // sol de départ (invocation au sol pendant une remontée)
    this.slamT = 0;
    this.landed = false; // passe à true quand le coup touche (enchaînement possible)
    this.hitIds.clear();
    this.setState('attack');
  }

  phaseOf(f) {
    const m = this.move;
    return f <= m.startup ? 0 : f <= m.startup + m.active ? 1 : 2;
  }

  runMove() {
    const m = this.move, inp = this.in, g = this.game;
    const f = ++this.moveFrame;
    const active = f > m.startup && f <= m.startup + m.active;

    // Coup qui a touché : on peut l'annuler en saut ou en un autre coup pour enchaîner (combos)
    // cancel : coup annulable dès sa 2e frame (riposte du contre → Décret enchaîné)
    if ((this.landed || m.cancel) && !m.kind && f > (m.cancel ? 1 : m.startup + m.active)) {
      if (this.buf.j && (this.grounded || this.jumpsLeft > 0)) {
        this.move = null;
        if (this.grounded) {
          this.buf.j = 0;
          this.setState('jumpsquat');
        } else {
          this.setState('air');
          this.airAction();
        }
        return;
      }
      if (this.buf.a) {
        this.buf.a = 0;
        this.startAttack();
        return;
      }
      if (this.buf.b) {
        this.buf.b = 0;
        if (this.startSpecial()) return;
      }
    }

    if (this.grounded) {
      if (m.kind === 'dash' && active) {
        // la charge garde sa vitesse
      } else if (Math.abs(inp.x) > 0.25 && !m.hold) { // hold : immobile pendant qu'il pilote son missile
        // On continue d'avancer en frappant (sans se retourner), un peu moins vite qu'en courant.
        const target = inp.x * this.stats.runSpeed * (m.kind ? 0.35 : 0.6);
        this.vx += clamp(target - this.vx, -this.stats.groundAccel, this.stats.groundAccel);
      } else this.vx *= 0.8;
    } else if (m.kind !== 'dash' && m.kind !== 'slam') {
      this.airDrift(0.9);
      this.checkFastFall();
    }
    if (f === m.startup + 1 && m.hits.length) {
      g.sfx.whoosh();
      g.fx.attack(this);
    }
    if (m.rehit && active && (f - m.startup - 1) % m.rehit === 0) this.hitIds.clear();

    // Image d'effet de la planche affichée au lancement du coup (courbe d'audience, « STOP ! »…)
    if (m.fxImg && f === m.startup + 1 && this.sprite.has(m.fxImg)) {
      const [dx, dy, hh] = m.fxAt || [14, 0.6, 1];
      g.fx.add({ type: 'sprite', fr: this.sprite.get(m.fxImg), x: this.x + this.facing * dx, y: this.y - this.h * dy, h: this.h * hh, facing: 1, life: 34, center: true });
    }

    // Élan vers l'avant au moment du coup (tacle glissé…)
    if (m.lunge && f === m.startup) this.vx = this.facing * m.lunge;

    // Onde de choc autour du perso (Transformation de star) : effet seul, les zones de coup font les dégâts
    if (m.shockwave && f === m.startup + 1) {
      g.fx.shockwave(this.x, this.y - this.h * 0.45, this.y, m.shockwave);
      g.shake(m.shockwave.shake ?? 7);
    }

    // Explosion devant soi (parfum…)
    if (m.blastAt && f === m.startup + 1) g.blast(this, this.x + this.facing * m.blastAt.dx, this.y - this.h * m.blastAt.dy, m.blastAt);

    // Invocation qui accompagne un autre coup (avion de l'allié pendant la remontée…)
    if (m.summon && m.kind !== 'summon' && f === m.startup + 1) g.spawnSummon(this, m.summon);

    switch (m.kind) {
      case 'projectile':
        // m.proj : second projectile du perso (ex. carton rouge en spécial bas)
        if (f === m.startup + 1) g.spawnProjectile(this, m.proj ? { ...DEFAULT_PROJECTILE, ...this.char[m.proj] } : this.proj);
        // hold : on garde la pose tant que le missile téléguidé vole, puis on reprend la main
        else if (m.hold && active && !g.projectiles.some((p) => p.owner === this && p.guided)) this.moveFrame = m.startup + m.active;
        break;
      case 'summon':
        if (f === 1 && m.detonate) {
          // detonate : si la charge est déjà posée, ce nouvel appui la fait exploser à distance
          const c = g.projectiles.find((p) => p.owner === this && p.summonKey === m.summon && !p.dead);
          if (c) {
            c.dead = true;
            g.blast(this, c.x, c.y, this.char[m.summon].blast);
            this.moveFrame = m.startup + m.active;
            break;
          }
        }
        if (f === m.startup + 1) g.spawnSummon(this, m.summon);
        break;
      case 'sneeze': // « Ah… ah… ATCHOUM ! » : un souffle qui balaie tout devant
        if (f === 1) g.fx.callout(this.x, this.y - this.h - 24, 'AH… AH…', this.color);
        if (f === m.startup + 1) {
          g.fx.sneeze(this);
          g.fx.callout(this.x + this.facing * 16, this.y - this.h - 6, 'ATCHOUM !', '#7cc8ff');
          g.shake(5);
          this.vx -= this.facing * 1.5; // le recul de l'éternuement
        }
        break;
      case 'decoy': // Retouche express : un double reste sur place, elle file dans la direction choisie
        if (f === 1) this.decoyDir = Math.sign(inp.x) || -this.facing;
        if (f === m.startup) g.spawnDecoy(this);
        if (active) {
          this.vx = this.decoyDir * m.speed;
          if (!this.grounded) this.vy = Math.min(this.vy, 0.4);
          if (f % 2 === 0) g.fx.add({ type: 'ghost', x: this.x, y: this.y, fr: this.currentFrame(), facing: this.facing, life: 10, color: this.fxs.colors[0] });
        } else if (f > m.startup) this.vx *= 0.8;
        break;
      case 'mount':
        if (f === m.startup + 1) {
          this.setMount(true);
          g.fx.callout(this.x, this.y - this.h - 10, 'EN SELLE !', this.color);
          g.sfx.jump(0.8);
        }
        break;
      case 'dismount':
        if (f === m.startup + 1) this.setMount(false);
        break;
      case 'swap':
        if (f === 1) g.fx.puff(this.x, this.y - this.h / 2, this.fxs.colors[0]);
        if (f === m.startup + 1) g.swapWithFoe(this);
        break;
      case 'dash':
        if (f === m.startup) this.dashX0 = this.x; // départ de la traînée (trail)
        if (m.trail && f === m.startup + m.active) g.spawnTrail(this, this.dashX0 ?? this.x, m.trail);
        if (f <= m.startup) {
          this.vx *= 0.7;
          if (!this.grounded) this.vy = Math.min(this.vy, 0.6);
        } else if (active) {
          this.vx = this.facing * m.speed;
          if (!this.grounded) this.vy = Math.min(this.vy, 0.4);
          if (f % 2 === 0) {
            g.fx.motion(this);
            g.fx.add({ type: 'ghost', x: this.x, y: this.y, fr: this.currentFrame(), facing: this.facing, life: 10, color: this.fxs.colors[0] });
          }
        } else this.vx *= 0.85;
        break;
      case 'rise':
        if (f === m.startup) {
          this.vy = -m.power * 1.12; // remontée plus haute : on revient plus facilement
          this.grounded = false;
          this.ground = null;
          this.moveAir = true;
          this.fastFalling = false;
          if (Math.abs(inp.x) > 0.3) this.facing = Math.sign(inp.x);
          const home = this.homeDir();
          this.vx = inp.x * (home && Math.sign(inp.x) === home ? 4.6 : 3.5) * (m.drift ?? 1); // remontée dirigeable vers l'arène (drift < 1 : moins)
          g.fx.burst(this, this.fxs.trailUp);
          g.sfx.jump(1.8);
        } else if (f > m.startup) {
          this.airDrift(0.85);
          if (active && f % 2 === 0) g.fx.motion(this, this.fxs.trailUp);
          if (f === m.startup + m.active) g.fx.burst(this, this.fxs.trailUp);
        }
        break;
      case 'slam':
        if (f === 1 && this.grounded) {
          this.vy = -4.2; // petit bond avant de plonger
          this.grounded = false;
          this.ground = null;
        }
        if (f < m.startup) {
          this.vy *= 0.85;
          this.vx *= 0.85;
        } else if (f === m.startup) {
          this.vy = 8.5;
          this.vx = 0;
        } else if (!this.grounded) {
          this.vy = 8.5;
          if (this.moveFrame >= m.startup + m.active) this.moveFrame = m.startup + m.active - 1; // reste actif jusqu'à l'atterrissage
          if (++this.slamT > 50) {
            this.move = null;
            this.setState('helpless');
            return;
          }
        }
        break;
    }
    if (this.moveFrame >= m.total) this.endMove();
  }

  endMove() {
    const m = this.move;
    this.move = null;
    if (this.grounded) this.setState('idle');
    else this.setState(m.helpless ? 'helpless' : 'air');
  }

  slamLand() {
    const m = this.move;
    this.moveFrame = m.startup + m.active;
    this.vx = 0;
    const g = this.game;
    g.spawnWaves(this);
    g.shake(4);
    g.fx.dust(this.x, this.y, -1, 4);
    g.fx.dust(this.x, this.y, 1, 4);
    g.sfx.hit(5);
  }

  activeHitboxes() {
    if (this.state !== 'attack' || this.hitlag > 0) return null;
    const m = this.move, f = this.moveFrame;
    if (!m.hits.length || f <= m.startup || f > m.startup + m.active) return null;
    return m.hits.map((h) => ({
      hit: h,
      rect: { x: this.facing > 0 ? this.x + h.x : this.x - h.x - h.w, y: this.y + h.y, w: h.w, h: h.h },
    }));
  }

  hurtbox() {
    const low = this.state === 'crouch' || this.state === 'shield' || (this.state === 'attack' && this.moveName === 'dtilt');
    const h = low ? this.h * 0.65 : this.h;
    return { x: this.x - this.w / 2, y: this.y - h, w: this.w, h };
  }

  takeHit(vx, vy, s, attacker) {
    // Encore sonné par le même adversaire : le combo continue
    this.combo = this.state === 'hurt' && this.hitstun > 0 && this.lastHitBy === attacker ? this.combo + 1 : 1;
    this.jumpsLeft = Math.max(this.jumpsLeft, 1); // on garde toujours de quoi revenir
    this.move = null;
    this.hitIds.clear();
    this.sideBUsed = false;
    this.airdodgeUsed = false;
    this.fastFalling = false;
    this.flash = 6;
    this.lastHitBy = attacker;
    this.lastHitTime = this.game.frame;
    if (s < 3.5 && this.grounded && vy > -3) {
      this.vx = vx * 0.7;
      this.vy = 0;
      this.hitstun = Math.round(8 + s * 3);
      this.launched = false;
    } else {
      if (this.grounded && vy > 0) vy = -vy * 0.7; // un météore au sol fait rebondir
      this.vx = vx;
      this.vy = vy;
      this.grounded = false;
      this.ground = null;
      this.hitstun = Math.round(14 + s * 4); // assez d'étourdissement pour enchaîner en l'air
      this.launched = s >= 5;
      this.tumbleRot = 0;
    }
    this.state = 'hurt';
    this.stateTime = 0;
    this.animTick = 0;
  }

  ko() {
    if (this.state === 'dead') return;
    this.mark = null;
    this.stocks--;
    this.record.falls++;
    const killer = this.lastHitBy && this.game.frame - this.lastHitTime < 600 ? this.lastHitBy : null;
    if (killer && killer !== this) killer.record.kos++;
    if (this.stocks <= 0) this.eliminated = true;
    this.game.onKO(this);
    this.setState('dead');
    this.deadTimer = 90;
    this.move = null;
    this.vx = this.vy = 0;
    this.hitlag = 0;
    this.game.checkEnd();
  }

  respawn() {
    const r = this.game.stage.respawns[this.slot];
    this.reset(r.x, r.y);
    this.percent = 0;
    this.facing = r.x < 240 ? 1 : -1;
    this.state = 'respawn';
    this.game.emitHud(this);
  }

  // ------------------------------------------------------------ physique

  physics() {
    if (this.state === 'respawn' || this.state === 'ledge') return;
    const st = this.stats;
    if (!this.grounded) {
      const m = this.move;
      const noGrav =
        (this.state === 'airdodge' && this.dodgeDir && this.stateTime < 20) ||
        (this.state === 'attack' && m.kind === 'dash' && this.moveFrame > m.startup && this.moveFrame <= m.startup + m.active);
      if (!noGrav) {
        const g = this.state === 'hurt' && this.launched ? st.gravity * 0.6 : st.gravity;
        const cap = this.fastFalling ? st.fastFall : st.maxFall;
        if (this.vy < cap) this.vy = Math.min(cap, this.vy + g);
        else if (this.state !== 'attack') this.vy = Math.max(cap, this.vy * 0.96);
      }
    }
    this.collide();
    if (this.tryLedge()) return;
    const b = this.game.stage.blast;
    if (this.x < b.left || this.x > b.right || this.y > b.bottom || this.y - this.h < b.top) this.ko();
  }

  collide() {
    const stg = this.game.stage;
    const hw = this.w / 2, h = this.h;

    if (this.grounded) {
      const gr = this.ground;
      if (!gr || this.x < gr.x || this.x > gr.x + gr.w) {
        this.grounded = false;
        this.ground = null;
        if (GROUND_STATES.has(this.state)) this.setState('air');
      }
    }

    if (this.grounded && this.ground) this.y = this.ground.y; // suit une plateforme qui bouge

    const prevY = this.y, prevTop = this.y - h;

    this.x += this.vx * (this.charmT > 0 && this.state !== 'hurt' ? 0.65 : 1); // charmé : déplacements ralentis
    for (const s of stg.solids) {
      if (this.y > s.y + 0.01 && this.y - h < s.y + s.h && this.x + hw > s.x && this.x - hw < s.x + s.w) {
        this.x = this.x < s.x + s.w / 2 ? s.x - hw : s.x + s.w + hw;
        this.vx = this.state === 'hurt' && Math.abs(this.vx) > 3 ? -this.vx * 0.5 : 0;
      }
    }

    this.y += this.vy;
    let landed = null;
    if (this.vy >= 0) {
      for (const s of stg.solids) {
        if (prevY <= s.y + 0.01 && this.y >= s.y && this.x >= s.x && this.x <= s.x + s.w) {
          landed = s;
          break;
        }
      }
      if (!landed && this.dropTimer === 0) {
        for (const p of stg.platforms) {
          if (prevY <= (p.prevY ?? p.y) + 0.01 && this.y >= p.y && this.x >= p.x && this.x <= p.x + p.w) {
            landed = p;
            break;
          }
        }
      }
    } else {
      for (const s of stg.solids) {
        if (prevTop >= s.y + s.h - 0.01 && this.y - h < s.y + s.h && this.x + hw > s.x && this.x - hw < s.x + s.w) {
          this.y = s.y + s.h + h;
          if (this.state === 'hurt') this.vy = 0;
          else this.x += (this.x < s.x + s.w / 2 ? -1 : 1) * 3.2; // sous la coque : on glisse vers le bord au lieu de rester collé
        }
      }
    }

    if (landed) {
      if (this.state === 'hurt' && this.launched && this.vy > 3.2) {
        this.y = landed.y;
        this.vy = -this.vy * 0.45;
        this.vx *= 0.8;
        this.game.fx.dust(this.x, this.y, 0, 5);
        this.game.sfx.land();
        this.game.shake(2);
      } else {
        this.y = landed.y;
        this.vy = 0;
        this.ground = landed;
        if (!this.grounded) {
          this.grounded = true;
          this.onLand();
        }
      }
    }
  }

  // ------------------------------------------------------------ bord de l'arène

  /** Accroche automatique au bord de la nacelle quand on passe à portée en revenant. */
  tryLedge() {
    if (this.grounded || this.ledgeCd > 0) return false;
    const st = this.state;
    const m = this.move;
    const rising = st === 'attack' && m.kind === 'rise' && this.moveFrame > m.startup;
    const aerial = st === 'attack' && this.moveAir && this.vy > 0 && m.kind !== 'slam';
    if (!(st === 'air' || st === 'helpless' || st === 'airdodge' || rising || aerial)) return false;
    const s0 = this.game.stage.solids[0];
    for (const side of [-1, 1]) {
      const cx = side < 0 ? s0.x : s0.x + s0.w;
      const hangX = cx + side * (this.w / 2 + 1);
      // zone d'accroche large : on rattrape le bord même un peu loin ou un peu bas
      if (Math.abs(this.x - hangX) > 24) continue;
      if (this.y < s0.y || this.y > s0.y + this.h + 50) continue;
      this.grabLedge(side, cx, s0);
      return true;
    }
    return false;
  }

  grabLedge(side, cx, s0) {
    this.move = null;
    this.setState('ledge');
    this.ledge = { side, cx, ground: s0 };
    this.x = cx + side * (this.w / 2 + 1);
    this.y = s0.y + this.h * 0.8;
    this.vx = this.vy = 0;
    this.facing = -side;
    this.invuln = Math.max(this.invuln, 45);
    this.jumpsLeft = this.stats.jumps;
    this.airdodgeUsed = false;
    this.sideBUsed = false;
    this.fastFalling = false;
    this.game.fx.dust(cx, s0.y, -side, 3);
    this.game.sfx.land();
  }

  /** Accroché au bord : saut, remonter (vers l'arène, haut, attaque) ou se laisser tomber. */
  runLedge() {
    const inp = this.in, L = this.ledge, toward = -L.side;
    this.vx = this.vy = 0;
    if (this.stateTime < 6) return;
    if (this.buf.j) {
      this.buf.j = 0;
      this.leaveLedge();
      this.vy = -this.stats.jumpPower * 1.05;
      this.vx = toward * 1.2;
      this.game.sfx.jump(1);
      return;
    }
    if (this.buf.a || this.buf.b || inp.y < -0.5 || inp.x * toward > 0.5 || this.stateTime > 120) {
      this.buf.a = this.buf.b = 0;
      this.x = L.cx + toward * (this.w / 2 + 4);
      this.y = L.ground.y;
      this.grounded = true;
      this.ground = L.ground;
      this.ledge = null;
      this.landLag = 5;
      this.setState('land');
      this.invuln = Math.max(this.invuln, 12);
      this.game.fx.dust(this.x, this.y, toward, 4);
      return;
    }
    if (inp.y > 0.6 || inp.x * L.side > 0.5) {
      this.leaveLedge();
      this.vy = 1;
    }
  }

  leaveLedge() {
    this.setState('air');
    this.ledge = null;
    this.ledgeCd = 30;
  }

  onLand() {
    this.jumpsLeft = this.stats.jumps;
    this.airdodgeUsed = false;
    this.sideBUsed = false;
    this.fastFalling = false;
    const s = this.state;
    const toLand = (lag) => {
      this.landLag = lag;
      this.move = null;
      this.setState('land');
      this.game.fx.dust(this.x, this.y, 0, 4);
      this.game.sfx.land();
    };
    if (s === 'attack') {
      const m = this.move;
      if (m.kind === 'slam') {
        if (this.moveFrame >= m.startup) this.slamLand();
      } else if (this.moveAir) toLand(m.landLag ?? 8);
    } else if (s === 'helpless') toLand(14);
    else if (s === 'airdodge') toLand(10);
    else if (s === 'air') toLand(3);
    else if (s === 'hurt') {
      this.launched = false;
      this.hitstun = Math.min(this.hitstun, 12);
    }
  }

  // ------------------------------------------------------------ rendu

  animInfo() {
    if (this.game.phase === 'gameover' && this.game.winner === this && this.grounded && GROUND_STATES.has(this.state)) return ['victory'];
    switch (this.state) {
      case 'run': return [Math.abs(this.vx) < this.stats.runSpeed * 0.62 ? 'walk' : 'run'];
      case 'crouch': return ['crouch'];
      case 'jumpsquat': return ['jumpsquat'];
      case 'land': return ['land'];
      case 'air':
        if (this.jump2T > 0) return ['jump2'];
        return [this.vy < -0.6 ? 'jump' : 'fall'];
      case 'helpless': return ['helpless'];
      case 'ledge': return ['fall'];
      case 'attack': {
        const m = this.move;
        // Ruée sans pose dédiée sur la planche : on reprend la course « dash »
        const anim = m.kind === 'dash' && !this.sprite.has(m.anim) ? 'dash' : m.anim;
        return [anim, this.phaseOf(this.moveFrame), this.moveFrame / m.total];
      }
      case 'hurt':
      case 'shieldbreak': return [this.launched ? 'tumble' : 'hurt'];
      case 'shield':
      case 'spotdodge': return ['shield'];
      case 'roll':
      case 'airdodge': return ['dodge'];
      default: return ['idle'];
    }
  }

  currentFrame() {
    let [anim, phase, prog] = this.animInfo();
    if (this.mounted && !anim.startsWith('m_') && anim !== 'dismount') anim = this.sprite.has(MOUNT_ANIM[anim]) ? MOUNT_ANIM[anim] : 'm_idle';
    return this.sprite.get(anim, this.animTick, phase ?? null, prog ?? null);
  }

  draw(ctx, frame) {
    if (this.state === 'dead') return;
    const fr = this.currentFrame();
    ctx.save();
    const ox = this.hitlag > 0 && this.state === 'hurt' ? (frame % 2 ? 1 : -1) * 1.5 : 0;
    ctx.translate(Math.round(this.x + ox), Math.round(this.y));
    if (this.invulnerable() && (frame >> 2) % 2) ctx.globalAlpha = 0.55;
    // Le « magicien » disparaît pendant sa remontée
    if (this.fxs.trail === 'smoke' && this.state === 'attack' && this.move.kind === 'rise' && this.phaseOf(this.moveFrame) === 1) ctx.globalAlpha *= 0.12;
    if (this.state === 'hurt' && this.launched) {
      ctx.translate(0, -this.h / 2);
      ctx.rotate(this.tumbleRot);
      ctx.translate(0, this.h / 2);
    }
    if (this.facing < 0) ctx.scale(-1, 1);
    drawFrame(ctx, fr);
    if (this.flash > 0) drawFrame(ctx, fr, 0, 0, '#ffffff', 0.85);
    else if (this.state === 'helpless') drawFrame(ctx, fr, 0, 0, '#140d1f', 0.4);
    else if (this.state === 'shieldbreak' && (frame >> 3) % 2) drawFrame(ctx, fr, 0, 0, '#ffe14d', 0.35);
    ctx.restore();

    if (this.mark) this.drawMark(ctx, frame);
    if (this.char.bag) this.drawNextItem(ctx, frame);
    if (this.state === 'shield') this.drawShield(ctx, frame);
  }

  /** Sac sans fond : petit objet suivant de la séquence, flottant derrière l'épaule. */
  drawNextItem(ctx, frame) {
    const img = this.moves[this.char.bag[this.bagIdx]]?.icon;
    if (!img || !this.sprite.has(img) || this.state === 'dead' || this.state === 'respawn') return;
    const fr = this.sprite.get(img), h = 7, w = (fr.sw / fr.sh) * h;
    ctx.save();
    ctx.globalAlpha = this.cd.sideB > 0 ? 0.35 : 0.9;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, this.x - this.facing * 10 - w / 2, this.y - this.h - 2 - h + Math.sin(frame * 0.12), w, h);
    ctx.restore();
  }

  /** Marque du Décret impérial au-dessus de la tête : une entaille de plus à chaque seconde écoulée. */
  drawMark(ctx, frame) {
    const M = this.mark, sp = M.by.sprite;
    if (!sp.has('fx_mark')) return;
    const fr = sp.get('fx_mark', 0, null, Math.min(0.99, 1 - (M.until - this.game.frame) / M.len));
    const h = 14, w = (fr.sw / fr.sh) * h; // au-dessus de l'étiquette P1/P2
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, this.x - w / 2, this.y - this.h - 13 - h + Math.sin(frame * 0.15), w, h);
    ctx.restore();
  }

  drawShield(ctx, frame) {
    const k = this.shieldHP / this.shieldMax;
    const [c0, c1] = this.fxs.colors;
    const hit = this.shieldStun > 0 ? 0.25 : 0;
    const x = Math.round(this.x);
    ctx.save();
    // Bouclier dessiné sur la planche (faucille et marteau, étoile, flamme, φ) : bulle découpée en rond
    if (this.sprite.has('fx_shield')) {
      const fr = this.sprite.get('fx_shield');
      const y = this.y - this.h * 0.48, r = this.h * (0.42 + 0.3 * k);
      const s = (r * 2) / Math.max(fr.sw, fr.sh);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.5 + hit + 0.08 * Math.sin(frame * 0.2);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, x - (fr.sw * s) / 2, y - (fr.sh * s) / 2, fr.sw * s, fr.sh * s);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.9;
      pxArc(ctx, x, Math.round(y), Math.round(r), 0, Math.PI * 2, '#ffffff');
      ctx.restore();
      return;
    }
    switch (this.fxs.shield) {
      case 'dome': { // dôme posé au sol, nervures blanches
        const r = Math.round(10 + 11 * k), y = Math.round(this.y);
        ctx.globalAlpha = 0.24 + hit;
        ctx.fillStyle = c0;
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 0.95;
        pxArc(ctx, x, y, r, Math.PI, Math.PI * 2, '#ffffff');
        ctx.globalAlpha = 0.55;
        pxArc(ctx, x, y, Math.round(r * 0.62), Math.PI, Math.PI * 2, c1);
        for (const a of [-0.55, -1.2, -1.94, -2.6]) {
          for (let t = r * 0.62; t <= r; t++) ctx.fillRect(Math.round(x + Math.cos(a) * t), Math.round(y + Math.sin(a) * t), 1, 1);
        }
        break;
      }
      case 'holo': { // bulle d'hologramme à lignes de balayage
        const r = 6 + 10 * k, y = this.y - this.h * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.2 + hit;
        ctx.fillStyle = c1;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#7df9ff';
        for (let yy = Math.round(y - r) + ((frame >> 2) % 2); yy < y + r; yy += 2) ctx.fillRect(x - r, yy, r * 2, 1);
        ctx.globalAlpha = 0.9;
        pxArc(ctx, x, y, Math.round(r), 0, Math.PI * 2, c0);
        break;
      }
      default: {
        const r = 6 + 10 * k, y = this.y - this.h * 0.45;
        ctx.globalAlpha = 0.28 + hit;
        ctx.fillStyle = c0;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.9;
        pxArc(ctx, x, y, Math.round(r), 0, Math.PI * 2, c1);
      }
    }
    ctx.restore();
  }
}
