// node tools/flood-clean.mjs <planche.png> [rayon]
// Planche « transparente » dont le détourage a laissé des traînées de fond opaques collées aux persos
// (halo rouge sous les titres…). Le contour noir des persos est épaissi de [rayon] px (2 par défaut) pour
// boucher ses trous, puis tout ce qui est hors de ce contour et relié à la transparence est effacé ;
// les effets dorés sont gardés ; enfin la frange de halo restée contre le contour (rouge terne, vert ≈ bleu) est rongée sur quelques px.
// Garde l'original à côté (<planche>.orig.png) et réécrit la planche.
import fs from 'node:fs';
import sharp from 'sharp';

const [file, rad = '2'] = process.argv.slice(2);
const orig = file.replace(/\.png$/, '.orig.png');
if (!fs.existsSync(orig)) fs.copyFileSync(file, orig);
const { data, info } = await sharp(fs.readFileSync(orig)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, R = +rad, N = W * H;
const dark = new Uint8Array(N);
for (let i = 0; i < N; i++) dark[i] = data[i * 4 + 3] > 100 && 0.3 * data[i * 4] + 0.59 * data[i * 4 + 1] + 0.11 * data[i * 4 + 2] < 72 ? 1 : 0;
const wall = new Uint8Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!dark[y * W + x]) continue;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const X = x + dx, Y = y + dy;
    if (X >= 0 && Y >= 0 && X < W && Y < H && dx * dx + dy * dy <= R * R) wall[Y * W + X] = 1;
  }
}
// effets dorés sans contour (traînée de sabre, étoiles) : jamais effacés
for (let i = 0; i < N; i++) { const j = i * 4; if (data[j] > 190 && data[j + 1] > 120 && data[j + 2] < 110) wall[i] = 1; }
const gone = new Uint8Array(N);
const stack = [];
for (let i = 0; i < N; i++) if (data[i * 4 + 3] < 20) { gone[i] = 1; stack.push(i); }
const nb = (p) => { const x = p % W; return [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W].filter((q) => q >= 0 && q < N); };
while (stack.length) for (const q of nb(stack.pop())) if (!gone[q] && !wall[q]) { gone[q] = 1; stack.push(q); }
// frange de halo collée au contour (dans la zone épaissie)
const halo = (j) => data[j] >= 110 && data[j] - data[j + 1] >= 40 && Math.abs(data[j + 1] - data[j + 2]) <= 30;
for (let it = 0; it < R + 2; it++) {
  const add = [];
  for (let p = 0; p < N; p++) if (!gone[p] && !dark[p] && halo(p * 4) && nb(p).some((q) => gone[q])) add.push(p);
  for (const p of add) gone[p] = 1;
}
let n = 0;
for (let p = 0; p < N; p++) if (gone[p] && data[p * 4 + 3]) { data[p * 4 + 3] = 0; n++; }
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(file);
console.log(`${file} : ${n} pixels de fond effacés`);
