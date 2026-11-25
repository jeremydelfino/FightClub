# Praud — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible l’ancienne planche (`sprites_raw/praud/planche.webp`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Praud (Pascal Praud)
- **Classe** : Animateur
- **Slogan** : « On ne peut plus rien dire ! »
- **Personnalité** : animateur de talk-show qui transforme chaque coup en « édition spéciale »
- **Physique et tenue** : Homme de 60 ans, cheveux blancs en brosse, grosses lunettes, sourcils levés d’indignation. Costume gris anthracite, chemise blanche, cravate rayée, fiches à la main. Gestuelle d’animateur : main ouverte, doigt qui accuse.
- **Couleurs** : rouge #D7263D, blanc, bleu marine #1B2A4A ; effets en bandeaux d’info rouges et éclairs blancs
- **Accessoire fétiche** : fiches de présentateur

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | main ouverte qui repousse, petites fiches qui volent | Petit coup enchaînable devant soi |
| Smash avant | coup de poing avec éclair blanc « ÉDITION SPÉCIALE » | Gros coup qui éjecte vers l’avant |
| Smash haut | il jette ses fiches en l’air, tourbillon de papier | Éjecte vers le haut |
| Smash bas | tape sur le bureau, onde rouge au sol | Frappe des deux côtés au sol |
| Attaques aériennes | tourbillon de fiches (variantes avant, arrière, haut, bas) | Coups en l’air |
| J’OUVRE LE DÉBAT ! | Derrière un pupitre, il pointe l’adversaire ; un bandeau d’info rouge « ON NE PEUT PLUS RIEN DIRE ! » fuse vers l’avant. | Bandeau-projectile qui traverse. |
| REPORTER SUR PLACE | Il pointe ; un reporter avec micro et un caméraman courent vers l’avant. | Le duo fonce au sol et percute. |
| AUDIENCE EN HAUSSE | Il s’élève en courant sur une courbe d’audience rouge qui monte, avec des barres d’histogramme bleues. | Remontée. |
| COUPE LA PAROLE | Ruée main tendue en avant, traînée de vitesse blanche, bulle « STOP ! ». | Charge horizontale. |
| Victoire | bras croisés devant un bandeau « RECORD D’AUDIENCE » | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Pascal Praud (Animateur), style chibi cartoon détaillé comme les planches de référence.
Homme de 60 ans, cheveux blancs en brosse, grosses lunettes, sourcils levés d’indignation. Costume gris anthracite, chemise blanche, cravate rayée, fiches à la main. Gestuelle d’animateur : main ouverte, doigt qui accuse.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, lunettes baissées, regard outré, fond rouge façon plateau télé. Couleurs : rouge #D7263D, blanc, bleu marine #1B2A4A ; effets en bandeaux d’info rouges et éclairs blancs.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard face caméra, expression typique, même fond que la bannière.
Aucun autre texte, aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Praud (Animateur). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 60 ans, cheveux blancs en brosse, grosses lunettes, sourcils levés d’indignation. Costume gris anthracite, chemise blanche, cravate rayée, fiches à la main. Gestuelle d’animateur : main ouverte, doigt qui accuse. Couleurs des effets : rouge #D7263D, blanc, bleu marine #1B2A4A ; effets en bandeaux d’info rouges et éclairs blancs.
Rangée 1 : « IDLE » 4 poses (respiration, en garde) — puis « WALK » 6 poses (cycle de marche complet).
Rangée 2 : « RUN » 6 poses (cycle de course penché en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées de vitesse aux couleurs du perso).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc d’effet) — « FALL » 3 poses.
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (roulade avec image fantôme).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Praud (Animateur). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 60 ans, cheveux blancs en brosse, grosses lunettes, sourcils levés d’indignation. Costume gris anthracite, chemise blanche, cravate rayée, fiches à la main. Gestuelle d’animateur : main ouverte, doigt qui accuse. Couleurs des effets : rouge #D7263D, blanc, bleu marine #1B2A4A ; effets en bandeaux d’info rouges et éclairs blancs.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (main ouverte qui repousse, petites fiches qui volent) — « FORWARD SMASH » 3 poses (coup de poing avec éclair blanc « ÉDITION SPÉCIALE »).
Rangée 2 : « UP SMASH » 3 poses (il jette ses fiches en l’air, tourbillon de papier) — « DOWN SMASH » 3 poses (tape sur le bureau, onde rouge au sol).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (tourbillon de fiches) — « FORWARD AIR » 2 — « BACK AIR » 2 (coup vers l’arrière, toujours tourné à droite) — « UP AIR » 2 — « DOWN AIR » 2 (piqué).
Rangée 4 : « HURT » 1 pose (grimace, recul) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 3 poses (bras croisés devant un bandeau « RECORD D’AUDIENCE »).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Praud (Animateur). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 60 ans, cheveux blancs en brosse, grosses lunettes, sourcils levés d’indignation. Costume gris anthracite, chemise blanche, cravate rayée, fiches à la main. Gestuelle d’animateur : main ouverte, doigt qui accuse. Couleurs des effets : rouge #D7263D, blanc, bleu marine #1B2A4A ; effets en bandeaux d’info rouges et éclairs blancs.
Rangée 1 : « NEUTRAL SPECIAL — J’OUVRE LE DÉBAT ! » 3 poses — Derrière un pupitre, il pointe l’adversaire ; un bandeau d’info rouge « ON NE PEUT PLUS RIEN DIRE ! » fuse vers l’avant. Puis, à droite et bien séparé (60 px) : le bandeau d’info seul (rouge, texte blanc, logo parodique « L’HEURE DES PRAUDS »). Puis, encore à droite : la bulle de bouclier seule (bulle ronde rouge translucide en forme d’écran de télé arrondi).
Rangée 2 : « SIDE SPECIAL — REPORTER SUR PLACE » 3 poses — Il pointe ; un reporter avec micro et un caméraman courent vers l’avant. Puis, à droite et bien séparé (60 px) : le reporter seul et le caméraman seul, en pleine course vers la droite.
Rangée 3 : « UP SPECIAL — AUDIENCE EN HAUSSE » 3 poses — Il s’élève en courant sur une courbe d’audience rouge qui monte, avec des barres d’histogramme bleues. Puis, à droite et bien séparé (60 px) : la courbe montante + 5 barres d’histogramme isolées.
Rangée 4 : « DOWN SPECIAL — COUPE LA PAROLE » 3 poses — Ruée main tendue en avant, traînée de vitesse blanche, bulle « STOP ! ». Puis, à droite et bien séparé (60 px) : une bulle « STOP ! » isolée.
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/praud/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
