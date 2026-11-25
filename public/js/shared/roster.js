// Charge la liste des personnages (public/characters/roster.json) et leurs sprites.
import { buildSprite, buildIcon } from './sprites.js';

/**
 * sd : atlas légers (téléphones). La version recolorée (deux joueurs avec le même perso) n'est
 * préparée qu'à la demande, par def.loadAlt() : les atlas HD pèsent lourd en mémoire.
 */
export async function loadRoster({ sd = false } = {}) {
  const ids = await fetch('/characters/roster.json', { cache: 'no-cache' }).then((r) => r.json());
  const chars = await Promise.all(
    ids.map(async (id) => {
      try {
        const base = `/characters/${id}/`;
        const def = await fetch(base + 'character.json', { cache: 'no-cache' }).then((r) => r.json());
        Object.assign(def, { id, base });
        def.name ??= id;
        def.gfx = await buildSprite(def, false, { sd });
        def.gfxAlt = null;
        def.loadAlt = () => (def.altPromise ??= buildSprite(def, true, { sd }).then((g) => (def.gfxAlt = g)));
        def.iconImg = await buildIcon(def, def.gfx, false);
        def.iconAltImg = await buildIcon(def, def.gfx, true);
        def.iconUrl = def.iconImg.toDataURL();
        const v = def.sprite?.version ? `?v=${def.sprite.version}` : ''; // numéro d'import : jamais d'ancienne image en cache
        const portrait = sd && def.portraitMobile ? def.portraitMobile : def.portrait;
        def.portraitUrl = portrait ? base + portrait + v : def.iconUrl; // illustration en-tête de planche
        def.theme ??= def.fx?.colors?.[0] || '#2f6bff';
        return def;
      } catch (e) {
        console.warn(`Personnage "${id}" ignoré :`, e);
        return null;
      }
    }),
  );
  const list = chars.filter(Boolean);
  if (!list.length) throw new Error('Aucun personnage chargé — vérifie public/characters/roster.json');
  return list;
}
