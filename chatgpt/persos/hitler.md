# Hitler — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins la planche des déplacements déjà validée (`sprites_raw/hitler/planche_deplacements.png`) comme référence de visage, de tenue et d'échelle. Puis copie les prompts un par un.

**Ligne directrice** : on se moque du dictateur, dans l'esprit du *Dictateur* de Chaplin et des parodies de *La Chute*. C'est un tyran colérique, hystérique et ridicule. Il n'est jamais glorifié, et on ne rit jamais de ses victimes.

## Où en sont les planches

| Planche | État |
|---|---|
| 1 — Déplacements | **Validée.** Fond transparent, poses bien séparées. Rien à refaire. |
| 0 — Portrait | **À refaire.** La bannière montre un salut nazi : il faut une autre pose (voir le prompt). |
| 2 — Attaques | **À refaire sur fond transparent.** Les poses sont bonnes, mais le fond sombre décoré ne se détoure pas. La victoire ne doit pas montrer de salut nazi. |
| 3 — Spéciaux | **À refaire sur fond transparent**, avec 4 spéciaux au lieu de 5. « Épuration » (barbelés, miradors, silhouettes prisonnières) est retiré. Le Bombardement passe en spécial bas. |

## Ce qui n'est pas repris, et pourquoi

- **« La Douche »** : c'est une référence aux chambres à gaz. Le gag repose sur des victimes réelles.
- **« Épuration »** : l'image d'un camp de prisonniers (barbelés, miradors, silhouettes enfermées) a le même problème.
- **Le slogan « Ein Volk, ein Reich, ein Führer »** : c'est un slogan de propagande authentique du régime. Il est remplacé par une réplique qui se moque de lui.
- **Le salut nazi** : il n'apparaît ni dans le portrait, ni dans la victoire. Le perso garde le bras levé de tribun, poing serré ou doigt pointé, comme les autres.
- **Aucun symbole du régime** : ni croix gammée, ni runes, ni aigle. L'emblème est le micro brisé entre des lauriers fanés, déjà présent sur les planches.

## Fiche

- **Nom affiché** : Hitler
- **Nom complet** : Adolf Hitler
- **Classe** : Le Dictateur (clin d'œil à Chaplin)
- **Slogan** : « JE NE SUIS PAS EN COLÈRE !!! »
- **Personnalité en combat** : lent, lourd, très puissant, et toujours au bord de la crise de nerfs. Il contrôle la zone : ondes, char, tour de propagande, bombardement.
- **Physique et tenue** :
  - homme d'environ 50 ans, cheveux bruns plaqués avec la mèche, petite moustache rectangulaire ;
  - visage crispé, sourcils froncés ;
  - uniforme gris-vert sans aucun insigne, ceinturon marron, pantalon sombre, bottes noires ;
  - gestuelle raide, crises de colère théâtrales.
- **Couleurs** :
  - gris militaire `#555B61` (tenue, fumée) ;
  - rouge sombre `#A52A2A` (colère, explosions) ;
  - noir `#191919` (impacts, ondes).
- **Accessoire fétiche** : microphone vintage de discours.
- **Emblème** : micro brisé entre des lauriers fanés, sur fond anthracite.
- **Bulle de bouclier** : bulle rouge sombre translucide, légèrement irrégulière, contour gris, micro fissuré au centre.

## Statistiques de jeu

- **Vitesse** : lente.
- **Poids** : lourd.
- **Puissance** : forte.

C'est un tank qui frappe fort et contrôle le terrain, mais il est lent et vulnérable face aux persos rapides.

## Ce que font ses coups en jeu (calé sur les sprites)

| Coup | Dessin (planches) | En jeu |
|---|---|---|
| Coup rapide | Paume en avant, éclat rouge | Petit coup enchaînable devant soi |
| Smash avant | Il brandit le micro à deux mains et l'abat, grosse explosion rouge | Gros coup qui éjecte vers l'avant, longue portée |
| Smash haut | Poing levé en hurlant, colonne d'énergie rouge | Éjecte vers le haut |
| Smash bas | Les deux poings au sol, rochers et ondes des deux côtés | Frappe des deux côtés au sol |
| Neutre air | Tourne sur lui-même, anneaux rouges | Coup tout autour |
| Avant air | Coup de botte, arc rouge | Coup vers l'avant |
| Arrière air | Coup de micro vers l'arrière | Coup vers l'arrière |
| Haut air | Poing levé, arc vertical | Coup vers le haut |
| Bas air | Plongeon bottes en avant, impact au sol | Piqué qui envoie vers le bas |
| Discours du Führer (B) | Il attrape un micro sur pied et hurle, ondes sonores rouges | Ondes-projectiles qui repoussent |
| Blitzkrieg (B →) | Il pointe, un petit char caricatural sort d'un nuage et fonce | Le char traverse le terrain et percute l'adversaire |
| Propagande de masse (B ↑) | Bras ouverts, une tour de haut-parleurs surgit avec des bannières à l'emblème du micro | Remontée ; la tour sonne l'adversaire proche (étourdi) |
| Bombardement (B ↓) | Jumelles, doigt levé, des avions caricaturaux passent et larguent des bombes sur le terrain, explosions | Les avions traversent l'écran ; les explosions touchent l'adversaire au sol |
| Victoire | Il tape du pied, son micro tombe et le pupitre s'écroule ; puis bras écartés, puis bras croisés vexé | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Adolf Hitler en caricature de dictateur ridicule (style « Le Dictateur » de Chaplin), même style chibi cartoon détaillé que la planche de référence.
Homme d'environ 50 ans, cheveux bruns plaqués avec la mèche, petite moustache rectangulaire, visage crispé. Uniforme gris-vert SANS aucun insigne, symbole ou emblème du régime.
Image paysage 1536×1024, fond décoré autorisé, deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, en pleine crise de colère, rouge de fureur, poing serré qui tremble, micro brisé à ses pieds, pupitre renversé, fumée rouge sombre, fond anthracite, bannière avec un micro brisé entre des lauriers fanés. PAS de salut, pas de bras tendu.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard noir, moustache frémissante de colère.
Aucun autre texte, aucun logo de jeu existant, aucun symbole nazi.
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Hitler (Le Dictateur), caricature ridicule. Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » : image paysage 1536×1024, FOND TRANSPARENT (sinon bleu nuit uni #0B1026 ; jamais de fond décoré, de fumée de fond, de dégradé ni de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d'ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle et même visage que la planche des déplacements jointe.
Uniforme gris-vert sans aucun insigne. Aucun salut nazi, aucun symbole du régime. Couleurs des effets : rouge sombre #A52A2A, gris #555B61, noir #191919.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (paume en avant, éclat rouge) — « FORWARD SMASH » 3 poses (il lève le micro à deux mains puis l'abat vers l'avant, grosse explosion rouge).
Rangée 2 : « UP SMASH » 3 poses (poing levé en hurlant, colonne d'énergie rouge) — « DOWN SMASH » 3 poses (les deux poings au sol, rochers et ondes rouges des deux côtés).
Rangée 3 (en l'air) : « NEUTRAL AIR » 2 poses (tourne sur lui-même, anneaux rouges) — « FORWARD AIR » 2 (coup de botte) — « BACK AIR » 2 (coup de micro vers l'arrière, toujours tourné à droite) — « UP AIR » 2 (poing levé, arc vertical) — « DOWN AIR » 2 (plongeon bottes en avant, impact).
Rangée 4 : « HURT » 1 pose — « KO » 2 poses (éjecté en vrille, étoiles) — « VICTORY » 3 poses : il tape du pied et son micro tombe du pupitre qui s'écroule / bras écartés, l'air hagard / bras croisés, boudeur et vexé. PAS de salut, pas de bras tendu.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Hitler (Le Dictateur), caricature ridicule. Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » : image paysage 1536×1024, FOND TRANSPARENT (sinon bleu nuit uni #0B1026 ; jamais de fond décoré, de fumée de fond ni de panneaux), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d'ombre ni de ligne de sol, perso debout ≈ 200 px, tourné vers la droite, même visage et même échelle que la planche des déplacements jointe.
Uniforme gris-vert sans aucun insigne. Aucun salut nazi, aucun symbole du régime, aucune victime, aucun prisonnier, aucun camp. Les adversaires ne sont pas dessinés.
Rangée 1 : « NEUTRAL SPECIAL — DISCOURS DU FÜHRER » 3 poses (il attrape un micro sur pied / il hurle dedans, visage déformé / il hurle, première onde) — puis, à droite et séparées de 60 px : les ondes sonores rouges seules — puis la bulle de bouclier seule (bulle rouge sombre translucide, micro fissuré au centre).
Rangée 2 : « SIDE SPECIAL — BLITZKRIEG » 3 poses (il pointe devant lui / il est debout dans un petit char caricatural qui sort d'un nuage / le char fonce, traînées rouges) — puis, à droite : le petit char seul, tourné vers la droite, sans aucun insigne.
Rangée 3 : « UP SPECIAL — PROPAGANDE DE MASSE » 3 poses (bras ouverts / bras levés, il s'élève / il s'élève, ondes rouges autour) — puis, à droite : une tour de haut-parleurs seule, avec deux bannières au micro brisé entre des lauriers.
Rangée 4 : « DOWN SPECIAL — BOMBARDEMENT » 3 poses (il regarde aux jumelles / il pointe le ciel / il trépigne de joie) — puis, à droite : un avion caricatural seul (profil vers la droite, sans insigne) — puis une bombe seule — puis une explosion seule (feu et fumée, sans bâtiment ni personne).
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire :

- « Le fond doit être transparent : retire la fumée, les panneaux et le dégradé du fond. »
- « Retire le salut : il garde le poing serré ou le doigt pointé. »
- « Aucun insigne sur l'uniforme. »
- « Garde exactement le même visage et la même tenue que sur la planche des déplacements. »

Quand les planches sont prêtes, enregistre-les dans `sprites_raw/hitler/` sous les noms `planche_portrait.png`, `planche_attaques.png` et `planche_speciaux.png`. La planche des déplacements y est déjà. Dis-le-moi : je règle le découpage et j'ajoute le perso au jeu.
