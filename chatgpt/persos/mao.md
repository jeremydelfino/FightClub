# Mao — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible l’ancienne planche (`sprites_raw/mao/planche.webp`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Mao (Mao Zedong)
- **Classe** : Grand Timonier
- **Slogan** : « Un petit livre, un grand coup. »
- **Personnalité** : chef d’armée lent et lourd, chaque coup est une démonstration de force collective
- **Physique et tenue** : Homme rond, front très dégarni, cheveux noirs plaqués en arrière, grain de beauté au menton, visage placide. Costume Mao gris-vert boutonné jusqu’au col, chaussures marron. Lent mais massif.
- **Couleurs** : rouge #DE2910, or #FFDE00, gris-vert #7D8B74 ; effets en étoiles dorées et flammes rouges
- **Accessoire fétiche** : le Petit Livre rouge

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | coup de poing droit, étoile dorée à l’impact | Petit coup enchaînable devant soi |
| Smash avant | grand coup de poing en avant, arc rouge et étoiles | Gros coup qui éjecte vers l’avant |
| Smash haut | les deux poings levés, explosion dorée en éventail | Éjecte vers le haut |
| Smash bas | poings au sol, rochers qui volent des deux côtés | Frappe des deux côtés au sol |
| Attaques aériennes | tourbillon d’étoiles dorées (variantes avant, arrière, haut, bas) | Coups en l’air |
| PETIT LIVRE ROUGE | Il sort le Petit Livre rouge, le brandit puis le lance en tourbillonnant. | Projectile en cloche qui tourne. |
| ARMÉE POPULAIRE | Il pointe le doigt droit devant ; derrière lui, une rangée de soldats en uniforme vert charge. | 3 soldats chargent au sol et traversent l’adversaire. |
| GRAND RASSEMBLEMENT | Bras levé ; une foule compacte avec drapeaux rouges surgit sous lui et le soulève. | Remontée ; la foule frappe vers le haut au départ. |
| TRACTEUR DU PEUPLE | Accroupi, il frappe le sol ; un gros tracteur rouge des années 50 arrive en trombe. | Le tracteur fonce au sol et percute l’adversaire. |
| Victoire | bras croisés, saluant la foule, pétales rouges qui tombent | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Mao Zedong (Grand Timonier), style chibi cartoon détaillé comme les planches de référence.
Homme rond, front très dégarni, cheveux noirs plaqués en arrière, grain de beauté au menton, visage placide. Costume Mao gris-vert boutonné jusqu’au col, chaussures marron. Lent mais massif.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, main tendue vers la foule, fond rouge avec étoiles dorées. Couleurs : rouge #DE2910, or #FFDE00, gris-vert #7D8B74 ; effets en étoiles dorées et flammes rouges.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard face caméra, expression typique, même fond que la bannière.
Aucun autre texte, aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Mao (Grand Timonier). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme rond, front très dégarni, cheveux noirs plaqués en arrière, grain de beauté au menton, visage placide. Costume Mao gris-vert boutonné jusqu’au col, chaussures marron. Lent mais massif. Couleurs des effets : rouge #DE2910, or #FFDE00, gris-vert #7D8B74 ; effets en étoiles dorées et flammes rouges.
Rangée 1 : « IDLE » 4 poses (respiration, en garde) — puis « WALK » 6 poses (cycle de marche complet).
Rangée 2 : « RUN » 6 poses (cycle de course penché en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées de vitesse aux couleurs du perso).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc d’effet) — « FALL » 3 poses.
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (roulade avec image fantôme).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Mao (Grand Timonier). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme rond, front très dégarni, cheveux noirs plaqués en arrière, grain de beauté au menton, visage placide. Costume Mao gris-vert boutonné jusqu’au col, chaussures marron. Lent mais massif. Couleurs des effets : rouge #DE2910, or #FFDE00, gris-vert #7D8B74 ; effets en étoiles dorées et flammes rouges.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (coup de poing droit, étoile dorée à l’impact) — « FORWARD SMASH » 3 poses (grand coup de poing en avant, arc rouge et étoiles).
Rangée 2 : « UP SMASH » 3 poses (les deux poings levés, explosion dorée en éventail) — « DOWN SMASH » 3 poses (poings au sol, rochers qui volent des deux côtés).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (tourbillon d’étoiles dorées) — « FORWARD AIR » 2 — « BACK AIR » 2 (coup vers l’arrière, toujours tourné à droite) — « UP AIR » 2 — « DOWN AIR » 2 (piqué).
Rangée 4 : « HURT » 1 pose (grimace, recul) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 3 poses (bras croisés, saluant la foule, pétales rouges qui tombent).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Mao (Grand Timonier). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme rond, front très dégarni, cheveux noirs plaqués en arrière, grain de beauté au menton, visage placide. Costume Mao gris-vert boutonné jusqu’au col, chaussures marron. Lent mais massif. Couleurs des effets : rouge #DE2910, or #FFDE00, gris-vert #7D8B74 ; effets en étoiles dorées et flammes rouges.
Rangée 1 : « NEUTRAL SPECIAL — PETIT LIVRE ROUGE » 3 poses — Il sort le Petit Livre rouge, le brandit puis le lance en tourbillonnant. Puis, à droite et bien séparé (60 px) : le livre rouge seul, fermé, avec un halo doré. Puis, encore à droite : la bulle de bouclier seule (bulle ronde rouge translucide avec une étoile dorée au centre).
Rangée 2 : « SIDE SPECIAL — ARMÉE POPULAIRE » 3 poses — Il pointe le doigt droit devant ; derrière lui, une rangée de soldats en uniforme vert charge. Puis, à droite et bien séparé (60 px) : UN soldat seul en pleine course (fusil tenu en travers), tourné vers la droite.
Rangée 3 : « UP SPECIAL — GRAND RASSEMBLEMENT » 3 poses — Bras levé ; une foule compacte avec drapeaux rouges surgit sous lui et le soulève. Puis, à droite et bien séparé (60 px) : la foule avec drapeaux rouges seule (bande horizontale).
Rangée 4 : « DOWN SPECIAL — TRACTEUR DU PEUPLE » 3 poses — Accroupi, il frappe le sol ; un gros tracteur rouge des années 50 arrive en trombe. Puis, à droite et bien séparé (60 px) : le tracteur rouge seul, de profil vers la droite, petit nuage de poussière.
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/mao/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
