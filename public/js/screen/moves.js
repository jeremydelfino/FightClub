// Coups par défaut, partagés par tous les personnages (surchargeables dans character.json -> "moves").
// Durées en frames (60/s). Hitbox : x, y, w, h relatifs aux pieds du perso, x vers l'avant quand il regarde à droite.
// Éjection : vitesse = (base + % de la cible * growth) * 100 / poids, angle en degrés (0 = horizontal vers l'avant, 90 = vers le haut).

export const DEFAULT_MOVES = {
  jab: { anim: 'jab', startup: 3, active: 3, endlag: 8, hits: [{ x: 3, y: -18, w: 14, h: 9, dmg: 3, base: 1.5, growth: 0.02, angle: 25 }] },
  ftilt: { anim: 'ftilt', startup: 6, active: 4, endlag: 13, hits: [{ x: 4, y: -14, w: 17, h: 10, dmg: 8, base: 2.6, growth: 0.065, angle: 36 }] },
  utilt: { anim: 'utilt', startup: 5, active: 5, endlag: 11, hits: [{ x: -9, y: -36, w: 22, h: 20, dmg: 7, base: 2.6, growth: 0.055, angle: 88 }] },
  dtilt: { anim: 'dtilt', startup: 4, active: 4, endlag: 10, hits: [{ x: 3, y: -8, w: 19, h: 8, dmg: 6, base: 2.2, growth: 0.04, angle: 70 }] },

  nair: { anim: 'nair', startup: 4, active: 9, endlag: 10, landLag: 4, hits: [{ x: -14, y: -26, w: 28, h: 26, dmg: 7, base: 2.2, growth: 0.05, angle: 45 }] },
  fair: { anim: 'fair', startup: 6, active: 5, endlag: 14, landLag: 6, hits: [{ x: 4, y: -20, w: 17, h: 14, dmg: 10, base: 3, growth: 0.075, angle: 40 }] },
  bair: { anim: 'bair', startup: 6, active: 4, endlag: 14, landLag: 7, hits: [{ x: -21, y: -19, w: 17, h: 12, dmg: 11, base: 3.4, growth: 0.08, angle: 38 }] },
  uair: { anim: 'uair', startup: 5, active: 5, endlag: 10, landLag: 5, hits: [{ x: -12, y: -39, w: 24, h: 16, dmg: 8, base: 2.4, growth: 0.06, angle: 85 }] },
  dair: { anim: 'dair', startup: 8, active: 5, endlag: 16, landLag: 10, hits: [{ x: -8, y: -7, w: 16, h: 15, dmg: 10, base: 2.4, growth: 0.055, angle: 270 }] },

  // Spéciaux : "kind" déclenche un comportement dans fighter.js
  neutralB: { anim: 'special_neutral', kind: 'projectile', startup: 10, active: 6, endlag: 12, landLag: 8, hits: [] },
  sideB: { anim: 'special_side', kind: 'dash', startup: 8, active: 12, endlag: 16, landLag: 10, speed: 5.5, hits: [{ x: 0, y: -21, w: 16, h: 16, dmg: 9, base: 3.4, growth: 0.065, angle: 35 }] },
  upB: { anim: 'special_up', kind: 'rise', startup: 4, active: 14, endlag: 10, landLag: 10, power: 9.2, helpless: true, rehit: 5, hits: [{ x: -10, y: -31, w: 20, h: 30, dmg: 3, base: 2.6, growth: 0.03, angle: 85 }] },
  downB: { anim: 'special_down', kind: 'slam', startup: 10, active: 2, endlag: 18, landLag: 12, hits: [{ x: -8, y: -8, w: 16, h: 15, dmg: 9, base: 2.6, growth: 0.05, angle: 275 }] },
};

export const DEFAULT_PROJECTILE = {
  kind: 'orb', speed: 4, vy: 0, gravity: 0, life: 70, size: 4, max: 2, wobble: 0,
  color: '#ffb03b', dmg: 5, base: 2, growth: 0.03, angle: 30,
};

// Temps de recharge des spéciaux (frames) : on ne peut plus les enchaîner en boucle.
// Surchargeable par coup dans character.json -> moves.<nom>.cooldown. La remontée (rise) n'en a pas.
export const SPECIALS = ['neutralB', 'sideB', 'upB', 'downB'];
const COOLDOWN = { projectile: 55, summon: 200, dash: 80, slam: 90, sneeze: 140, swap: 230, rise: 0 };

export function buildMoves(char, frameMult = 1) {
  const out = {};
  // Les zones de coup ont été pensées pour un perso de 25 de haut : on les met à la taille du sprite.
  const k = Math.max(1, Math.min(1.45, (char.stats?.height ?? 25) / 25));
  const fit = (h) => ({ ...h, x: h.x * k, y: h.y * k, w: h.w * k, h: h.h * k });
  for (const [name, base] of Object.entries(DEFAULT_MOVES)) {
    const ov = char.moves?.[name] || {};
    // hits: [] = coup sans zone de frappe (invocation, projectile) ; sinon on complète les zones par défaut
    const hits = ov.hits?.length === 0 ? [] : base.hits.map((h, i) => fit({ ...h, ...(ov.hits?.[i] || {}) }));
    if (ov.hits && ov.hits.length > base.hits.length) hits.push(...ov.hits.slice(base.hits.length).map(fit));
    const m = { ...base, ...ov, hits };
    m.startup = Math.max(1, Math.round(m.startup * frameMult));
    m.active = Math.max(1, Math.round(m.active * frameMult));
    m.endlag = Math.max(1, Math.round(m.endlag * frameMult));
    m.total = m.startup + m.active + m.endlag;
    if (SPECIALS.includes(name)) m.cooldown ??= COOLDOWN[m.kind] ?? 60;
    out[name] = m;
  }
  return out;
}
