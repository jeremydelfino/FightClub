# Mélenchon — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible l’ancienne planche (`sprites_raw/melenchon/planche.webp`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Mélenchon (Jean-Luc Mélenchon)
- **Classe** : Le Tribun
- **Slogan** : « La République, c’est moi ! »
- **Personnalité** : tribun colérique qui transforme chaque coup en manif
- **Physique et tenue** : Homme de 73 ans, cheveux gris en arrière, lunettes, visage très expressif (colère théâtrale, rires). Costume sombre, chemise blanche, cravate rouge. Gestuelle de tribun : poing levé, bras grands ouverts.
- **Couleurs** : rouge #E63946, violet #9D4EDD, rose pâle #FFD6E0 ; effets en ondes rouges, éclairs violets et arcs-en-ciel
- **Accessoire fétiche** : mégaphone

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | coup de poing, petite onde rouge | Petit coup enchaînable devant soi |
| Smash avant | poussée des deux mains avec un grand arc rouge | Gros coup qui éjecte vers l’avant |
| Smash haut | panneau de manifestation levé vers le haut | Éjecte vers le haut |
| Smash bas | frappe au sol, pavés qui volent | Frappe des deux côtés au sol |
| Attaques aériennes | tourbillon de tracts (variantes avant, arrière, haut, bas) | Coups en l’air |
| COUP DE MÉGAPHONE | Il crie dans un mégaphone rouge et blanc ; des ondes sonores rouges partent vers l’avant. | Ondes-projectiles. |
| MARCHE DES FIERTÉS | Il lève le poing ; un cortège LGBT et coloré avec drapeaux arc-en-ciel déferle. | Le cortège avance et emporte l’adversaire. |
| LA RÉPUBLIQUE, C’EST MOI | Il s’envole, écharpe tricolore au vent, éclairs violets. | Remontée. |
| GRÈVE GÉNÉRALE | Il plante une pancarte rouge « GRÈVE GÉNÉRALE ! » ; autour, un train, un avion et une usine barrés d’une croix rouge. | La pancarte fige l’adversaire (« EN GRÈVE ! »). |
| Victoire | poing levé, puis bras croisés, confettis rouges et violets | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Jean-Luc Mélenchon (Le Tribun), style chibi cartoon détaillé comme les planches de référence.
Homme de 73 ans, cheveux gris en arrière, lunettes, visage très expressif (colère théâtrale, rires). Costume sombre, chemise blanche, cravate rouge. Gestuelle de tribun : poing levé, bras grands ouverts.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, poing levé, grand sourire, fond rouge avec un φ blanc. Couleurs : rouge #E63946, violet #9D4EDD, rose pâle #FFD6E0 ; effets en ondes rouges, éclairs violets et arcs-en-ciel.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard face caméra, expression typique, même fond que la bannière.
Aucun autre texte, aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Mélenchon (Le Tribun). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 73 ans, cheveux gris en arrière, lunettes, visage très expressif (colère théâtrale, rires). Costume sombre, chemise blanche, cravate rouge. Gestuelle de tribun : poing levé, bras grands ouverts. Couleurs des effets : rouge #E63946, violet #9D4EDD, rose pâle #FFD6E0 ; effets en ondes rouges, éclairs violets et arcs-en-ciel.
Rangée 1 : « IDLE » 4 poses (respiration, en garde) — puis « WALK » 6 poses (cycle de marche complet).
Rangée 2 : « RUN » 6 poses (cycle de course penché en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées de vitesse aux couleurs du perso).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc d’effet) — « FALL » 3 poses.
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (roulade avec image fantôme).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Mélenchon (Le Tribun). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 73 ans, cheveux gris en arrière, lunettes, visage très expressif (colère théâtrale, rires). Costume sombre, chemise blanche, cravate rouge. Gestuelle de tribun : poing levé, bras grands ouverts. Couleurs des effets : rouge #E63946, violet #9D4EDD, rose pâle #FFD6E0 ; effets en ondes rouges, éclairs violets et arcs-en-ciel.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (coup de poing, petite onde rouge) — « FORWARD SMASH » 3 poses (poussée des deux mains avec un grand arc rouge).
Rangée 2 : « UP SMASH » 3 poses (panneau de manif, explosion violette en rayons) — « DOWN SMASH » 3 poses (frappe au sol, pavés qui volent).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (tourbillon de tracts) — « FORWARD AIR » 2 — « BACK AIR » 2 (coup vers l’arrière, toujours tourné à droite) — « UP AIR » 2 — « DOWN AIR » 2 (piqué).
Rangée 4 : « HURT » 1 pose (grimace, recul) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 3 poses (poing levé, puis bras croisés, confettis rouges et violets).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Mélenchon (Le Tribun). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 73 ans, cheveux gris en arrière, lunettes, visage très expressif (colère théâtrale, rires). Costume sombre, chemise blanche, cravate rouge. Gestuelle de tribun : poing levé, bras grands ouverts. Couleurs des effets : rouge #E63946, violet #9D4EDD, rose pâle #FFD6E0 ; effets en ondes rouges, éclairs violets et arcs-en-ciel.
Rangée 1 : « NEUTRAL SPECIAL — COUP DE MÉGAPHONE » 3 poses — Il crie dans un mégaphone rouge et blanc ; des ondes sonores rouges partent vers l’avant. Puis, à droite et bien séparé (60 px) : les ondes sonores rouges seules. Puis, encore à droite : la bulle de bouclier seule (bulle ronde rouge-violet translucide avec un grand φ blanc au centre).
Rangée 2 : « SIDE SPECIAL — MARCHE DES FIERTÉS » 3 poses — Il lève le poing ; un cortège joyeux et coloré avec drapeaux arc-en-ciel déferle. Puis, à droite et bien séparé (60 px) : le cortège seul (bande horizontale, ambiance festive).
Rangée 3 : « UP SPECIAL — LA RÉPUBLIQUE, C’EST MOI » 3 poses — Il s’envole, écharpe tricolore au vent, éclairs violets. Puis, à droite et bien séparé (60 px) : une écharpe tricolore qui flotte, seule.
Rangée 4 : « DOWN SPECIAL — GRÈVE GÉNÉRALE » 3 poses — Il plante une pancarte rouge « GRÈVE GÉNÉRALE ! » ; autour, un train, un avion et une usine barrés d’une croix rouge. Puis, à droite et bien séparé (60 px) : la pancarte seule.
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/melenchon/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
