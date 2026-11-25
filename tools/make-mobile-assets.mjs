// Versions légères pour les téléphones (manette) : atlas SD et portrait en WebP.
// Les manettes chargeaient ~5 Mo de PNG par perso (40 Mo pour le roster) : trop lent en partage de connexion.
// Usage : node tools/make-mobile-assets.mjs [perso…]   (sans argument : tout le roster)
// Appelé aussi automatiquement à la fin de tools/import-sprites.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHARS = path.join(ROOT, 'public', 'characters');

export async function makeMobileAssets(id) {
  const dir = path.join(CHARS, id);
  const file = path.join(dir, 'character.json');
  const def = JSON.parse(fs.readFileSync(file, 'utf8'));
  const sd = def.sprite?.sd;
  const before = [], after = [];
  if (sd?.atlas && fs.existsSync(path.join(dir, sd.atlas))) {
    const out = 'atlas_sd.webp';
    // alphaQuality élevée : les contours d'encre restent nets ; effort max pour la taille
    await sharp(path.join(dir, sd.atlas)).webp({ quality: 86, alphaQuality: 95, effort: 6, smartSubsample: true }).toFile(path.join(dir, out));
    sd.webp = out;
    before.push(fs.statSync(path.join(dir, sd.atlas)).size);
    after.push(fs.statSync(path.join(dir, out)).size);
  }
  if (def.portrait && fs.existsSync(path.join(dir, def.portrait))) {
    const out = 'portrait_m.webp';
    await sharp(path.join(dir, def.portrait)).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(path.join(dir, out));
    def.portraitMobile = out;
    before.push(fs.statSync(path.join(dir, def.portrait)).size);
    after.push(fs.statSync(path.join(dir, out)).size);
  }
  fs.writeFileSync(file, JSON.stringify(def, null, 2) + '\n');
  const mb = (a) => (a.reduce((x, y) => x + y, 0) / 1e6).toFixed(2);
  console.log(`📱 ${id} : ${mb(before)} Mo → ${mb(after)} Mo pour les téléphones`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(fs.readFileSync(path.join(CHARS, 'roster.json'), 'utf8'));
  for (const id of ids) await makeMobileAssets(id);
}
