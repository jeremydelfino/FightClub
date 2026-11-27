# Personnages

Chaque personnage est un dossier `public/characters/<id>/` contenant un `character.json`. L'`id` doit aussi figurer dans `roster.json`, qui fixe l'ordre de sélection.

Sans section `"sprite"`, le jeu dessine le perso en pixel-art à partir de `colors` et `look`.

## Champs principaux

| Champ | Rôle |
|---|---|
| `name`, `short` | nom affiché ; `short` sert dans les grilles quand le nom est long |
| `class` | classe affichée sous le nom (Tribun, Influenceur…) |
| `description` | une ou deux phrases, montrées sur le téléphone |
| `specials` | noms des 4 spéciaux : `neutral`, `side`, `up`, `down` |
| `colors` / `altColors` | couleurs ; `altColors` sert au joueur 2 quand les deux prennent le même perso |
| `look` | silhouette dessinée par le jeu, voir ci-dessous |
| `fx` | thème d'effets, voir ci-dessous |

## Silhouette dessinée (`look`)

- `bodyW`, `bodyH`, `legU`, `legL`, `armU`, `armL`, `limb` : proportions en pixels.
- `outfit` : `"suit"` (costume, chemise et cravate `accent`) ou `"mao"` (veste à col fermé).
- `sleeves: "long"` : manches jusqu'aux poignets, mains nues.
- `head` : la tête dessinée à la main, une chaîne par rangée, de profil tournée vers la droite (`.` = vide). Elle sert aussi à l'icône en buste.
- `palette` : la couleur de chaque lettre de `head`, en `#rrggbb` ou par nom de couleur du perso (`skin`, `main`…), suffixé `D` pour plus sombre ou `L` pour plus clair.

## Effets (`fx`)

```json
"fx": { "style": "wave", "trail": "holo", "shield": "holo", "colors": ["#e63946", "#9d4edd", "#ffd6e0"] }
```

- `style` (effet des attaques) : `wave` (ondes sonores), `flash` (flash photo), `stars` (taillade et étoiles), `line` (traits de feutre).
- `trail` (traînée des spéciaux de déplacement) : `holo` (hologramme), `hearts` (likes), `stars`, `smoke` (nuage de magicien : le perso disparaît pendant sa remontée).
- `shield` : `bubble`, `holo` ou `dome`.
- `colors` : 3 couleurs, la première sert aussi aux étincelles quand le coup touche.

- `flag` : `fr`, `il`, `cn`, `lfi` ou `rainbow`. Ce drapeau sert aux confettis des gros coups, au fond des affiches, à la plateforme de retour et au drapeau planté par le vainqueur. `confettiColors` remplace les couleurs des confettis.
- `trailUp` : traînée propre à la remontée (`splash` pour la traversée du Yangtsé).

Le nom de chaque spécial (`specials`) s'affiche au-dessus du perso quand il l'utilise.

Invocations (`kind: "summon"` ; `"summon": "<champ>"` dans le coup choisit la description, `summon` par défaut) : une image de l'atlas qui avance au sol (`img`, `speed`), qui reste sur place (`speed: 0`, `from: "under"`, `groundOnly`), un mur qui bloque projectiles et adversaire (`wall: true`), un avion qui traverse l'écran (`fly: true`, `from: "offscreen"`), la vague `tricolor` ou la batterie `battery` (`shots`, `missile`, `img`). `say` affiche une bulle, `noFlip` garde une image avec texte ou drapeaux à l'endroit. Un autre coup peut aussi lancer une invocation (`"upB": { "summon": "summonUp" }`). Un projectile avec `stun` sonne au lieu d'éjecter (`callout` : le texte affiché).

Projectiles disponibles (`projectile.kind`) : `orb`, `bolt`, `rock`, `phi`, `book`, `phone`, `redline`. `hw` et `hh` règlent la zone de contact d'un projectile allongé. Explosifs (Kim) : `fuse` sur un projectile le fait exploser en fin de vie (`r` rayon, dégâts, `img` de l'explosion) ; `guided: true` sur un `missile` le fait suivre le joystick tant que le coup qui l'a lancé a `hold: true` (le perso reste immobile, et perd le contrôle s'il est touché) ; `detonate: true` sur une invocation fait exploser la précédente (champ `blast`) au lieu d'en poser une nouvelle. `cloud` sur un projectile laisse, là où il éclate, un nuage (un seul par perso) qui inflige `dmg` toutes les `tick` frames sans éjecter. Un coup `kind: "counter"` est un contre : un coup reçu pendant sa phase active est annulé, l'attaquant est retourné (un projectile est renvoyé) et le perso lui fait face (`counterImg` : image de l'effet). `hitImg` sur un coup : image qui éclate sur la cible touchée. `stats.shieldMax` règle la solidité du bouclier (50 par défaut).

Napoléon : `"stun": 90` sur un contre pare le coup et laisse l'attaquant étourdi 90 frames, sans dégâts (pose : coup `riposte` du perso). `"mark": 180` dans une zone de coup (Décret impérial) ne fait aucun dégât et marque la cible 180 frames : à la fin, elle reprend une seconde fois en % tout ce qu'elle a encaissé entre-temps, sans être éjectée (image `fx_mark`, une frame par étape). Un coup `kind: "mount"` met le perso à cheval selon le champ `mount` du perso : `stats` (remplacent les stats à pied), `armor` (multiplicateur des dégâts reçus), `hp` (dégâts encaissés avant que le cheval parte), `width`/`height` (zone de contact), `jumpPower` (grand saut final du cheval, qui disparaît), `cooldown` (frames avant de remonter). À cheval, les animations `m_<anim>` remplacent celles à pied, toutes les attaques deviennent le coup `cavalry`, bas + B lance `dismount`, et un autre spécial fait descendre. Un coup absent des coups par défaut (`riposte`, `cavalry`, `dismount`) se décrit entièrement dans `moves`. `"cancel": true` sur un coup : annulable dès sa 2e frame en saut, coup ou spécial (la riposte enchaîne sur le Décret).

Marion : `charm` sur un projectile (frames) ralentit les déplacements de la cible touchée sans l'immobiliser (cœurs `fx_heart`). `bag` : liste de coups joués à tour de rôle par le spécial côté, toujours dans le même ordre (`say` : nom affiché, `icon` : image de l'objet suivant, montrée derrière l'épaule). `blastAt` sur un coup : explosion devant le perso (`dx`, `dy` en part de la taille, plus les champs d'une explosion). `drift` sur une remontée : part du contrôle horizontal (1 par défaut). Un coup `kind: "decoy"` laisse un double (`fx_decoy`) qui encaisse un seul coup à sa place (l'attaquant reste figé un instant) et file à `speed` dans la direction du joystick (en arrière sinon). Avec `boom` (champs d'une explosion), le double explose quand on le frappe ou au bout de `life` frames.

Khalamité : `gaze: true` sur un projectile avec `stun` : n'étourdit que la cible tournée vers le lanceur (de dos, coup normal). `trail` sur un coup `kind: "dash"` : à la fin de la ruée, une traînée couvre le trajet (`img` étirée sur la longueur, `life`, `dmg` toutes les `tick` frames sans éjecter, `dy` hauteur au-dessus des pieds, `hh` demi-hauteur de la zone ; une seule par perso). Batterie (`kind: "battery"`) : `fireImg` pose affichée juste après chaque tir, `flip: true` retourne l'image selon le sens du perso ; dans `missile`, `launch` angle de départ en radians (0 = droit devant, sinon vers le haut), `dx`/`dy` point de départ, `puff: true` petit nuage au lieu d'une explosion en fin de course. `shockwave` sur un coup : onde de choc visuelle autour du perso au début de la phase active (`r` rayon, `colors` deux couleurs, `shake`), les dégâts restant dans `hits`. Les zones d'un coup sont essayées dans l'ordre et chaque cible n'est touchée qu'une fois : en les rangeant de la plus petite à la plus large, plus la cible est près, plus elle prend fort.

## Icône

```json
"icon": "icon.png"
```

Image carrée du perso, affichée à côté de son % en combat et dans la grille de sélection (écran et téléphone). `altIcon` (optionnel) sert quand les deux joueurs prennent le même perso. Sans `icon`, le jeu découpe la tête dans la pose d'attente.

## Importer une planche (images générées par ChatGPT)

1. Dépose la planche dans `sprites_raw/<perso>/planche.webp` (ou `.png`).
2. Dans `tools/sprite-sheets.json`, indique pour chaque animation le rectangle `[x0, y0, x1, y1]` de la planche qui contient ses poses, et leur nombre (`frames`). `pick` garde seulement certaines poses, `clear` efface des zones (titres de section), `aliases` réutilise une animation pour une autre. `icon` est le carré du portrait, `height` la taille du perso en jeu.
3. Lance :

```bash
node tools/import-sprites.mjs <perso>
```

L'outil agrandit chaque zone ×4 (lanczos, débruitage, accentuation), repère les persos avec le détourage IA de macOS (Vision, `tools/vision-mask.swift`, compilé et mis en cache dans `tools/.cache/`), affine avec la couleur du fond (`hiTolerance`, 14 par défaut), garde les effets vifs hors de la zone IA, sépare les poses, lisse le contour et l'entoure d'un fin trait d'encre, puis écrit `atlas.png` (HD, pour l'écran), `atlas_sd.png` (÷4, pour les téléphones), `icon.png`, `portrait.png` et la section `sprite` de `character.json`. Les effets hors du perso (ondes, halos, traînées) gardent une transparence douce et n'ont pas de trait d'encre. Une planche PNG à fond transparent est utilisée telle quelle. Un voile d'opacité de fond est retiré automatiquement, ou avec `alphaFloor` par animation. Les fonds blancs ou en faux damier gris clair sont reconnus. Pour une animation en ligne, `"main": "touch"` ne garde que ce qui touche le perso, ce qui retire les nuages de la pose voisine. Une animation peut venir d'une autre planche (`"sheet": "planche_attaques.png"`), le portrait et l'icône aussi (`portraitSheet`). Sans Vision (autre système), le détourage se fait à la couleur seule. Pour faire dessiner de nouvelles planches, voir `chatgpt/README.md`. En cas de souci sur une animation, `node tools/import-sprites.mjs <perso> --mask <animation> masque.png` enregistre la zone HD détourée (le fond retiré apparaît en magenta).

Le point d'ancrage (les pieds) se calcule sur le corps du perso seul (silhouette opaque, sans les effets fins ni les débris détachés), pour qu'une traînée ou un nuage sous les pieds ne le fasse pas sauter de côté ou flotter. Les petits morceaux de la pose voisine ramassés au bord d'une zone (main, chaussure, coin de titre) sont effacés automatiquement. Autres options par animation :

- `"scale": 0.85` (ou une valeur par frame) : pose dessinée plus grande ou plus petite que la pose d'attente sur la planche ; le jeu la remet à la bonne taille.
- `"scale"` vaut aussi pour un état entier : Napoléon à cheval (`m_*`) est réglé à 1,3 fois sa taille à pied.
- une pose de `rects` peut s'écrire `{ "r": [x0, y0, x1, y1], "clear": [[…]] }` : zones effacées pour cette pose seule, quand la pose voisine la touche presque. Une zone peut aussi être un polygone `[[x, y], …]` pour séparer deux poses qui se chevauchent (sac contre cheveux).
- `"tight": 4` (par perso ou par animation) : avec `rects`, ne garde que les morceaux à moins de 4 px du perso lui-même ; les bouts de pose voisine inclus dans un rectangle large sont retirés. Permet d'élargir les rectangles sans rien couper.
- `"unmatte": [r, g, b]` : image d'effet restée collée à son fond (planche opaque) ; la transparence suit l'écart à cette couleur. Seulement pour une image d'effet seule.

`node tools/import-sprites.mjs <perso> --only anim1,anim2` ne redécoupe que ces animations et garde les autres telles quelles (`--only none` : aucune, seulement ancrages, échelles, icône et portrait). C'est indispensable pour les persos dont une planche est opaque et a été détourée avec Vision sur macOS : sans Vision, il ne faut pas la redécouper.

Planche transparente avec un halo opaque collé autour des persos : `node tools/flood-clean.mjs sprites_raw/<perso>/<planche>.png` l'efface (l'original reste en `.orig.png`).

Les images `fx_*` de l'atlas (manif, soldat, livre, missile) servent aux projectiles et invocations : `projectile.img` et `summon.img` dans `character.json`.

## Format sprite sheet (prêt pour le moteur)

```json
"sprite": {
  "sheet": "sheet.png",
  "frameWidth": 48,
  "frameHeight": 48,
  "anchorX": 24,
  "anchorY": 46,
  "scale": 1,
  "altFilter": "hue-rotate(150deg)",
  "animations": {
    "idle": { "row": 0, "frames": 4, "fps": 6 },
    "run":  { "row": 1, "frames": 6, "fps": 12 },
    "jab":  { "row": 4, "frames": 3, "phased": true }
  }
}
```

- `anchorX` / `anchorY` : point du sprite qui se trouve aux pieds du perso, au milieu.
- Le perso regarde à droite ; le jeu le retourne lui-même.
- Une animation peut avoir sa propre image : `"file": "run.png"` (une bande horizontale de frames).
- `"phased": true` sur une attaque de 3 frames : frame 1 = préparation, frame 2 = coup actif, frame 3 = retour.
- `altSheet` (optionnel) : palette alternative, utilisée quand les deux joueurs prennent le même perso. Sans elle, `altFilter` est appliqué à la sheet normale.

Animations reconnues : `idle`, `run`, `jump`, `fall`, `crouch`, `land`, `jab`, `ftilt`, `utilt`, `dtilt`, `nair`, `fair`, `bair`, `uair`, `dair`, `special_neutral`, `special_side`, `special_up`, `special_down`, `hurt`, `tumble`, `shield`, `dodge`, `helpless`, `victory`. Une animation absente est remplacée par une animation proche.

## Stats (`"stats"`)

`weight`, `runSpeed`, `airSpeed`, `airAccel`, `gravity`, `maxFall`, `fastFall`, `jumpPower`, `doubleJumpPower`, `jumps` (nombre de sauts en l'air), `power` (multiplicateur de dégâts), `frameMult` (plus petit = coups plus rapides), `width`, `height` (hurtbox).

Les valeurs par défaut sont dans `public/js/screen/fighter.js`, les coups dans `public/js/screen/moves.js`. Pour surcharger un coup :

```json
"moves": { "fair": { "hits": [{ "dmg": 12 }] } }
```
