# Netanyahu — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible l’ancienne planche (`sprites_raw/netanyahu/planche.webp`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Netanyahu (Benyamin Netanyahou)
- **Classe** : Le Magicien
- **Slogan** : « Toujours là. Encore là. »
- **Personnalité** : chef de guerre high-tech qui commande tout depuis sa tablette et ne quitte jamais la scène
- **Physique et tenue** : Homme de 75 ans, cheveux blancs coiffés sur le côté, mâchoire carrée, regard dur. Costume bleu nuit, chemise blanche, cravate bleue, épinglette. Posture de commandant.
- **Couleurs** : bleu #2F6FD6, blanc, touche de rouge #D7263D ; effets en énergie bleue et éclairs blancs
- **Accessoire fétiche** : tablette de commandement
- **Limite** : Aucune ville détruite, aucun civil, aucune scène de guerre réelle : uniquement du matériel et des effets d’énergie.

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | coup de poing, éclat bleu à l’impact | Petit coup enchaînable devant soi |
| Smash avant | poing en avant entouré d’énergie bleue, explosion d’éclairs | Gros coup qui éjecte vers l’avant |
| Smash haut | poing levé, colonne d’énergie bleue | Éjecte vers le haut |
| Smash bas | poings au sol, blocs de béton qui volent | Frappe des deux côtés au sol |
| Attaques aériennes | coup circulaire avec arc bleu (variantes avant, arrière, haut, bas) | Coups en l’air |
| DÔME DE FER | Il pianote sur une tablette ; une batterie anti-missiles apparaît au sol sous un dôme d’énergie hexagonal. | Batterie posée au sol qui tire 3 intercepteurs à tête chercheuse. |
| FRAPPE AÉRIENNE | Il pointe la tablette ; un petit drone passe et lâche un missile vers l’avant. | Missile à tête chercheuse vers l’adversaire. |
| SOUTIEN DE L’ALLIÉ | Il lève le doigt vers le ciel ; un drapeau américain flotte, un avion de chasse passe et il s’envole dans un nuage bleu. | Remontée ; un avion traverse l’écran et percute l’adversaire. |
| MUR DE SÉCURITÉ | Il frappe le sol ; un mur de béton gris surgit devant lui, avec une petite étoile bleue peinte. | Le mur bloque l’adversaire et les projectiles pendant 4 s. |
| Victoire | pouce levé, confettis bleus et blancs, puis bras croisés | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Benyamin Netanyahou (Le Magicien), style chibi cartoon détaillé comme les planches de référence.
Homme de 75 ans, cheveux blancs coiffés sur le côté, mâchoire carrée, regard dur. Costume bleu nuit, chemise blanche, cravate bleue, épinglette. Posture de commandant.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, doigt pointé, drapeau d’Israël qui flotte derrière. Couleurs : bleu #2F6FD6, blanc, touche de rouge #D7263D ; effets en énergie bleue et éclairs blancs.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard face caméra, expression typique, même fond que la bannière.
Aucun autre texte, aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Netanyahu (Le Magicien). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 75 ans, cheveux blancs coiffés sur le côté, mâchoire carrée, regard dur. Costume bleu nuit, chemise blanche, cravate bleue, épinglette. Posture de commandant. Couleurs des effets : bleu #2F6FD6, blanc, touche de rouge #D7263D ; effets en énergie bleue et éclairs blancs.
Rangée 1 : « IDLE » 4 poses (respiration, en garde) — puis « WALK » 6 poses (cycle de marche complet).
Rangée 2 : « RUN » 6 poses (cycle de course penché en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées de vitesse aux couleurs du perso).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc d’effet) — « FALL » 3 poses.
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (roulade avec image fantôme).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Netanyahu (Le Magicien). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 75 ans, cheveux blancs coiffés sur le côté, mâchoire carrée, regard dur. Costume bleu nuit, chemise blanche, cravate bleue, épinglette. Posture de commandant. Couleurs des effets : bleu #2F6FD6, blanc, touche de rouge #D7263D ; effets en énergie bleue et éclairs blancs.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (coup de poing, éclat bleu à l’impact) — « FORWARD SMASH » 3 poses (poing en avant entouré d’énergie bleue, explosion d’éclairs).
Rangée 2 : « UP SMASH » 3 poses (poing levé, colonne d’énergie bleue) — « DOWN SMASH » 3 poses (poings au sol, blocs de béton qui volent).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (coup circulaire avec arc bleu) — « FORWARD AIR » 2 — « BACK AIR » 2 (coup vers l’arrière, toujours tourné à droite) — « UP AIR » 2 — « DOWN AIR » 2 (piqué).
Rangée 4 : « HURT » 1 pose (grimace, recul) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 3 poses (pouce levé, confettis bleus et blancs, puis bras croisés).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Netanyahu (Le Magicien). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 75 ans, cheveux blancs coiffés sur le côté, mâchoire carrée, regard dur. Costume bleu nuit, chemise blanche, cravate bleue, épinglette. Posture de commandant. Couleurs des effets : bleu #2F6FD6, blanc, touche de rouge #D7263D ; effets en énergie bleue et éclairs blancs.
Rangée 1 : « NEUTRAL SPECIAL — DÔME DE FER » 3 poses — Il pianote sur une tablette ; une batterie anti-missiles apparaît au sol sous un dôme d’énergie hexagonal. Puis, à droite et bien séparé (60 px) : la batterie sous son dôme seule. Puis, encore à droite : la bulle de bouclier seule (bulle ronde bleue translucide avec une étoile de David blanche au centre).
Rangée 2 : « SIDE SPECIAL — FRAPPE AÉRIENNE » 3 poses — Il pointe la tablette ; un petit drone passe et lâche un missile vers l’avant. Puis, à droite et bien séparé (60 px) : le drone seul + le missile seul (avec flamme).
Rangée 3 : « UP SPECIAL — SOUTIEN DE L’ALLIÉ » 3 poses — Il lève le doigt vers le ciel ; un drapeau américain flotte, un avion de chasse passe et il s’envole dans un nuage bleu. Puis, à droite et bien séparé (60 px) : l’avion de chasse seul (profil vers la droite) + le drapeau américain seul.
Rangée 4 : « DOWN SPECIAL — MUR DE SÉCURITÉ » 3 poses — Il frappe le sol ; un mur de béton gris surgit devant lui, avec une petite étoile bleue peinte. Puis, à droite et bien séparé (60 px) : le mur de béton seul, vu de face.
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/netanyahu/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
