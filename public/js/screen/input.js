// Entrées locales de l'écran : joueur clavier (pour tester sans téléphone) et CPU.

export function blankInput() {
  return { x: 0, y: 0, a: false, b: false, j: false, s: false };
}

// Utilise e.code (position physique) : fonctionne en AZERTY comme en QWERTY.
export class Keyboard {
  constructor() {
    this.keys = new Set();
  }
  apply(inp) {
    const k = this.keys;
    inp.x = (k.has('ArrowRight') ? 1 : 0) - (k.has('ArrowLeft') ? 1 : 0);
    inp.y = (k.has('ArrowDown') ? 1 : 0) - (k.has('ArrowUp') ? 1 : 0);
    inp.j = k.has('Space') || k.has('KeyZ');
    inp.a = k.has('KeyX');
    inp.b = k.has('KeyC');
    inp.s = k.has('KeyV') || k.has('ShiftLeft') || k.has('ShiftRight');
  }
}

export class CPU {
  constructor(player, level = 2) {
    this.p = player;
    this.level = level;
    this.cool = 30;
    this.jumpCd = 0;
    this.shieldT = 0;
  }

  update(game, me) {
    const inp = this.p.input;
    Object.assign(inp, blankInput());
    if (this.cool > 0) this.cool--;
    if (this.jumpCd > 0) this.jumpCd--;
    if (me.state === 'dead') return;

    const st = game.stage.solids[0];
    if (me.state === 'ledge') {
      inp.x = me.x < 240 ? 1 : -1; // remonter sur l'arène
      return;
    }
    if (me.state === 'respawn') {
      if (me.stateTime > 50) inp.x = Math.sign(240 - me.x) || 1;
      return;
    }

    // Revenir sur l'arène
    const offstage = me.x < st.x - 2 || me.x > st.x + st.w + 2 || me.y > st.y + 2;
    if (offstage && !me.grounded) {
      inp.x = me.x < 240 ? 1 : -1;
      if (me.state === 'air' && me.vy > -0.5) {
        if (me.jumpsLeft > 0 && this.jumpCd <= 0) {
          inp.j = true;
          this.jumpCd = 20;
        } else if (me.jumpsLeft === 0 && me.y > st.y - 30) {
          inp.b = true;
          inp.y = -1;
          inp.x *= 0.3;
        }
      }
      return;
    }

    const foe = game.fighters.find((f) => f !== me && !f.eliminated);
    if (!foe || foe.state === 'dead' || foe.state === 'respawn') {
      const dx = 240 - me.x;
      if (Math.abs(dx) > 20) inp.x = Math.sign(dx);
      return;
    }

    const dx = foe.x - me.x, dy = foe.y - me.y, adx = Math.abs(dx), dir = Math.sign(dx) || 1;
    if (this.shieldT > 0) {
      this.shieldT--;
      inp.s = true;
      return;
    }
    if (me.grounded && adx < 34 && foe.state === 'attack' && Math.random() < 0.05 * this.level) {
      this.shieldT = (12 + Math.random() * 10) | 0;
      inp.s = true;
      return;
    }

    if (me.grounded && adx > 40 && adx < 140 && Math.abs(dy) < 20 && this.cool <= 0 && me.facing === dir && Math.random() < 0.012 * this.level) {
      inp.y = 1; // spécial bas : manif, armée, vague…
      inp.b = true;
      this.cool = 70;
      return;
    }
    if (adx > 28 || Math.abs(dy) > 30) {
      inp.x = dir;
      if (dy < -30 && me.grounded && Math.random() < 0.06) inp.j = true;
      if (!me.grounded && me.jumpsLeft > 0 && dy < -20 && me.vy > 0 && Math.random() < 0.08) inp.j = true;
      if (adx > 80 && Math.abs(dy) < 20 && this.cool <= 0 && Math.random() < 0.025 * this.level && me.facing === dir) {
        inp.x = 0;
        inp.b = true;
        this.cool = 50;
      }
    } else if (this.cool <= 0) {
      if (dy < -18) {
        inp.y = -1;
        inp.a = true;
      } else if (!me.grounded) {
        inp.x = dir !== me.facing || Math.random() < 0.5 ? dir : 0;
        inp.a = true;
      } else if (foe.percent > 90 && Math.random() < 0.35) {
        inp.x = dir;
        inp.b = true;
      } else {
        const r = Math.random();
        if (r < 0.35 && me.facing === dir) inp.a = true;
        else if (r < 0.7) {
          inp.x = dir;
          inp.a = true;
        } else if (r < 0.85) {
          inp.y = 1;
          inp.a = true;
        } else inp.j = true;
      }
      this.cool = Math.round((14 + Math.random() * 26) / (0.6 + this.level * 0.2));
    } else if (adx > 14) inp.x = dir * 0.5;

    // Ne pas sortir de l'arène tout seul
    const nearEdge = (me.x < st.x + 12 && inp.x < 0) || (me.x > st.x + st.w - 12 && inp.x > 0);
    if (me.grounded && nearEdge && !inp.a && !inp.b) inp.x = 0;
  }
}
