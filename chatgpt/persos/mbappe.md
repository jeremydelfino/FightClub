# Mbappé — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible l’ancienne planche (`sprites_raw/mbappe/planche.webp`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Mbappé (Kylian Mbappé)
- **Classe** : Le Prodige
- **Slogan** : « Vitesse, puissance, victoire. »
- **Personnalité** : star du foot ultra-rapide qui joue au chef de vestiaire
- **Physique et tenue** : Jeune homme athlétique, crâne rasé de près, grand sourire assuré. Costume de général d’opérette (déguisement) : veste kaki à épaulettes dorées, médailles en forme de ballons et de trophées, pantalon kaki, chaussures de foot. C’est un footballeur déguisé, l’humour est sur son côté « c’est moi qui décide ».
- **Couleurs** : or #D4AF37, blanc, kaki #2E5E3E, touche bleu-blanc-rouge ; effets en traînées dorées et éclairs bleus
- **Accessoire fétiche** : ballon de foot
- **Limite** : Aucune référence à un pays africain ni à un dictateur réel : c’est un déguisement d’opérette.

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | coup de genou, étincelle dorée | Petit coup enchaînable devant soi |
| Smash avant | frappe de volée, éclair bleu énorme | Gros coup qui éjecte vers l’avant |
| Smash haut | retourné acrobatique, arc doré | Éjecte vers le haut |
| Smash bas | balayette au sol, gerbe d’herbe et éclats blancs | Frappe des deux côtés au sol |
| Attaques aériennes | ciseau retourné avec traînée dorée (variantes avant, arrière, haut, bas) | Coups en l’air |
| FRAPPE ENROULÉE | Élan, frappe de l’intérieur du pied, le ballon part avec un effet courbe. | Ballon qui rebondit. |
| CARTON ROUGE | Il sort un carton rouge, le brandit puis le lance comme un frisbee. | Le carton sonne l’adversaire (« EXPULSÉ ! »). |
| COUPE DU MONDE | Il brandit un trophée doré et s’envole dans une traînée bleue, confettis bleu-blanc-rouge. | Remontée. |
| ACCÉLÉRATION | Départ de sprinter puis sprint horizontal, traînées bleues et dorées. | Ruée très rapide. |
| Victoire | salut militaire, puis trophée doré brandi, confettis | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Kylian Mbappé (Le Prodige), style chibi cartoon détaillé comme les planches de référence.
Jeune homme athlétique, crâne rasé de près, grand sourire assuré. Costume de général d’opérette (déguisement) : veste kaki à épaulettes dorées, médailles en forme de ballons et de trophées, pantalon kaki, chaussures de foot. C’est un footballeur déguisé, l’humour est sur son côté « c’est moi qui décide ».
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, salut militaire, sourire, fond tricolore incliné. Couleurs : or #D4AF37, blanc, kaki #2E5E3E, touche bleu-blanc-rouge ; effets en traînées dorées et éclairs bleus.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard face caméra, expression typique, même fond que la bannière.
Aucun autre texte, aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Mbappé (Le Prodige). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Jeune homme athlétique, crâne rasé de près, grand sourire assuré. Costume de général d’opérette (déguisement) : veste kaki à épaulettes dorées, médailles en forme de ballons et de trophées, pantalon kaki, chaussures de foot. C’est un footballeur déguisé, l’humour est sur son côté « c’est moi qui décide ». Couleurs des effets : or #D4AF37, blanc, kaki #2E5E3E, touche bleu-blanc-rouge ; effets en traînées dorées et éclairs bleus.
Rangée 1 : « IDLE » 4 poses (respiration, en garde) — puis « WALK » 6 poses (cycle de marche complet).
Rangée 2 : « RUN » 6 poses (cycle de course penché en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées de vitesse aux couleurs du perso).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc d’effet) — « FALL » 3 poses.
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (roulade avec image fantôme).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Mbappé (Le Prodige). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Jeune homme athlétique, crâne rasé de près, grand sourire assuré. Costume de général d’opérette (déguisement) : veste kaki à épaulettes dorées, médailles en forme de ballons et de trophées, pantalon kaki, chaussures de foot. C’est un footballeur déguisé, l’humour est sur son côté « c’est moi qui décide ». Couleurs des effets : or #D4AF37, blanc, kaki #2E5E3E, touche bleu-blanc-rouge ; effets en traînées dorées et éclairs bleus.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (coup de genou, étincelle dorée) — « FORWARD SMASH » 3 poses (frappe de volée, éclair bleu énorme).
Rangée 2 : « UP SMASH » 3 poses (retourné acrobatique, arc doré) — « DOWN SMASH » 3 poses (balayette au sol, gerbe d’herbe et éclats blancs).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (ciseau retourné avec traînée dorée) — « FORWARD AIR » 2 — « BACK AIR » 2 (coup vers l’arrière, toujours tourné à droite) — « UP AIR » 2 — « DOWN AIR » 2 (piqué).
Rangée 4 : « HURT » 1 pose (grimace, recul) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 3 poses (salut militaire, puis trophée doré brandi, confettis).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Mbappé (Le Prodige). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Jeune homme athlétique, crâne rasé de près, grand sourire assuré. Costume de général d’opérette (déguisement) : veste kaki à épaulettes dorées, médailles en forme de ballons et de trophées, pantalon kaki, chaussures de foot. C’est un footballeur déguisé, l’humour est sur son côté « c’est moi qui décide ». Couleurs des effets : or #D4AF37, blanc, kaki #2E5E3E, touche bleu-blanc-rouge ; effets en traînées dorées et éclairs bleus.
Rangée 1 : « NEUTRAL SPECIAL — FRAPPE ENROULÉE » 3 poses — Élan, frappe de l’intérieur du pied, le ballon part avec un effet courbe. Puis, à droite et bien séparé (60 px) : le ballon seul avec une traînée courbe. Puis, encore à droite : la bulle de bouclier seule (bulle ronde dorée translucide avec un ballon stylisé au centre).
Rangée 2 : « SIDE SPECIAL — CARTON ROUGE » 3 poses — Il sort un carton rouge, le brandit puis le lance comme un frisbee. Puis, à droite et bien séparé (60 px) : le carton rouge seul avec un halo + bulle « EXPULSÉ ! » isolée.
Rangée 3 : « UP SPECIAL — COUPE DU MONDE » 3 poses — Il brandit un trophée doré et s’envole dans une traînée bleue, confettis bleu-blanc-rouge. Puis, à droite et bien séparé (60 px) : le trophée doré seul.
Rangée 4 : « DOWN SPECIAL — ACCÉLÉRATION » 3 poses — Départ de sprinter puis sprint horizontal, traînées bleues et dorées. Puis, à droite et bien séparé (60 px) : une traînée de vitesse isolée.
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/mbappe/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
