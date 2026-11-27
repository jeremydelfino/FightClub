# Kim — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible la planche portrait (`sprites_raw/kim/planche_portrait.png`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Kim (Kim Jong-un)
- **Classe** : Le Suprême Dirigeant
- **Slogan** : « Votre défaite était prévue dans le plan quinquennal. »
- **Personnalité** : tank / zoneur, lent, très lourd et très puissant ; arrogant et impassible, il traite chaque combat comme un défilé militaire
- **Physique et tenue** : Homme trapu d’une quarantaine d’années, visage rond aux joues pleines, cheveux noirs plaqués en arrière, côtés rasés très courts. Costume noir de type Mao, col fermé, gros boutons, petit insigne rouge sur la poitrine. Ventre marqué, épaules larges. Expression impassible ou suffisante. Gestuelle lourde : s’accroupit avec peine, se relève en ajustant son costume.
- **Couleurs** : noir charbon #20232B, rouge #D9363E, or #E5B84B ; effets en explosions rouge-orange-or, fumée blanche et grise, traînées de missiles
- **Accessoire fétiche** : télécommande noire et rouge à énorme bouton rouge
- **Emblème** : soleil rouge et or stylisé, étoile et silhouette de coiffure au centre (aucun vrai logo de parti ni emblème officiel)

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup. Les quatre spéciaux reprennent le fonctionnement d’un « soldat à l’arsenal explosif » classique : grenade, missile téléguidé, réacteur dorsal, charge déclenchée à distance.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | trois coups de poing, puis une petite gifle autoritaire | Petit coup enchaînable devant soi |
| Smash avant | il sort une énorme roquette et frappe avec, explosion stylisée | Très gros coup lent qui éjecte vers l’avant |
| Smash haut | bras levés, feu d’artifice rouge et or au-dessus de lui | Éjecte vers le haut |
| Smash bas | tape violemment du pied, onde de choc au sol | Frappe des deux côtés au sol |
| Attaques aériennes | toupie bras écartés (neutre), coup de ventre (avant), coup de coude (arrière), poing au ciel avec petite explosion (haut), chute « sac de béton » (bas) | Coups en l’air, lourds |
| CADEAU DIPLOMATIQUE | Il sort une grenade de sa poche, la dégoupille avec les dents, la lance avec un petit sourire. | Grenade en cloche qui rebondit et explose après un délai. |
| MISSILE INTERCONTINENTAL | Il sort une télécommande, lance un missile depuis un mini-lanceur posé au sol, le pilote l’air concentré. | Missile téléguidé : Kim reste immobile et le dirige ; s’il est touché, il perd le contrôle. |
| PROGRAMME SPATIAL | Il regarde derrière lui, un énorme réacteur dorsal apparaît, il décolle bras croisés. | Remontée verticale. |
| INSPECTION SURPRISE | Il s’accroupit péniblement, pose une petite charge au sol, se relève en époussetant son costume. | Charge posée ; réappuyer sur SPÉCIAL + bas la fait exploser à distance. |
| Victoire | assis sur un trône doré, lunettes de soleil, télécommande levée comme un trophée, confettis rouges et or | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Kim Jong-un (Le Suprême Dirigeant), caricature satirique, style chibi cartoon détaillé comme les planches de référence.
Homme trapu d’une quarantaine d’années, visage rond aux joues pleines, cheveux noirs plaqués en arrière, côtés rasés très courts. Costume noir de type Mao, col fermé, gros boutons, petit insigne rouge sur la poitrine. Ventre marqué, épaules larges. Expression impassible ou suffisante.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, index pointé vers l’horizon, air suffisant ; derrière lui un défilé militaire caricatural, un missile stylisé qui décolle, un grand soleil rouge et or stylisé avec une étoile. Couleurs : noir charbon #20232B, rouge #D9363E, or #E5B84B ; explosions rouge-orange-or, fumée blanche.
2. En bas au centre : une icône carrée 400×400 — tête et épaules, regard face caméra, sourcils froncés, même fond rouge.
Aucun autre texte, aucun logo de jeu existant, aucun vrai logo de parti ni emblème officiel. La satire vise le dirigeant et sa propagande, jamais la population.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Kim (Le Suprême Dirigeant). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme trapu d’une quarantaine d’années, visage rond aux joues pleines, cheveux noirs plaqués en arrière, côtés rasés très courts. Costume noir de type Mao, col fermé, gros boutons, petit insigne rouge sur la poitrine. Ventre marqué, épaules larges. Expression impassible ou suffisante. Gestuelle lourde : le ventre et les épaules suivent le mouvement, jamais acrobatique. Couleurs des effets : noir charbon #20232B, rouge #D9363E, or #E5B84B ; explosions rouge-orange-or, fumée blanche.
Rangée 1 : « IDLE » 4 poses (respiration lourde, mains sur les hanches, air impassible) — puis « WALK » 6 poses (marche de défilé pesante).
Rangée 2 : « RUN » 6 poses (course lourde penchée en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (ruée ventre en avant, traînées rouges).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie difficile, décollage, montée) — « DOUBLE JUMP » 4 poses (petite pirouette maladroite avec arc doré) — « FALL » 3 poses (chute lourde, traits de vitesse).
Rangée 4 : « LAND » 3 poses (atterrissage lourd avec étincelles) — « CROUCH » 1 pose (accroupi péniblement) — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (il se baisse lourdement en protégeant son visage, image fantôme bleutée).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Kim (Le Suprême Dirigeant). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme trapu d’une quarantaine d’années, visage rond aux joues pleines, cheveux noirs plaqués en arrière, côtés rasés très courts. Costume noir de type Mao, col fermé, gros boutons, petit insigne rouge sur la poitrine. Ventre marqué, épaules larges. Expression impassible ou suffisante, même pendant les coups absurdes. Couleurs des effets : noir charbon #20232B, rouge #D9363E, or #E5B84B ; explosions rouge-orange-or, fumée blanche.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (coups de poing rapides, puis petite gifle autoritaire, arc doré) — « FORWARD SMASH » 3 poses (il sort une énorme roquette rouge et blanche à étoile, la lève, frappe avec, explosion stylisée à l’impact).
Rangée 2 : « UP SMASH » 3 poses (préparation, bras levés, feu d’artifice rouge et or qui éclate au-dessus de sa tête) — « DOWN SMASH » 3 poses (préparation, il tape violemment du pied, onde de choc et débris des deux côtés au sol).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (il tourne bras écartés, anneau doré) — « FORWARD AIR » 2 (énorme coup de ventre vers l’avant) — « BACK AIR » 2 (coup de coude arrière brutal, toujours tourné à droite) — « UP AIR » 2 (poing levé au ciel, petite explosion au-dessus) — « DOWN AIR » 2 (il se laisse tomber comme un sac de béton, impact doré sous lui).
Rangée 4 : « HURT » 1 pose (il perd son calme, bras agités) — « KO » 2 poses (éjecté, puis à plat, étoiles autour de la tête, costume parfaitement en place) — « VICTORY » 3 poses (pose fière, télécommande levée en trophée avec éclat doré, puis assis sur un trône doré avec lunettes de soleil, bras croisés, petits missiles décoratifs autour).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Kim (Le Suprême Dirigeant). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme trapu d’une quarantaine d’années, visage rond aux joues pleines, cheveux noirs plaqués en arrière, côtés rasés très courts. Costume noir de type Mao, col fermé, gros boutons, petit insigne rouge sur la poitrine. Ventre marqué, épaules larges. Expression impassible ou suffisante. Couleurs des effets : noir charbon #20232B, rouge #D9363E, or #E5B84B ; explosions rouge-orange-or, fumée blanche.
Rangée 1 : « NEUTRAL SPECIAL — CADEAU DIPLOMATIQUE » 3 poses — Il sort une grenade de sa poche avec un air parfaitement sérieux, la dégoupille avec les dents, la lance devant lui avec un petit sourire satisfait. Puis, à droite et bien séparé (60 px) : la grenade caricaturale seule (noire, verte et rouge, symbole de danger jaune) avec sa petite traînée + l’explosion seule (rouge, noire et jaune, petit nuage de fumée).
Rangée 2 : « SIDE SPECIAL — MISSILE INTERCONTINENTAL » 3 poses — Il pose un mini-lanceur gris au sol, sort une télécommande à antenne, puis pilote le missile qui part du lanceur, l’air concentré. Puis, à droite et bien séparé (60 px) : le missile seul, horizontal, pointe vers la droite (rouge et blanc, petite étoile, flammes orange et fumée à l’arrière) + son explosion seule (champignon rouge-orange).
Rangée 3 : « UP SPECIAL — PROGRAMME SPATIAL » 3 poses — Il regarde derrière lui, légèrement inquiet ; un énorme réacteur dorsal noir et rouge apparaît dans son dos ; il décolle verticalement, bras croisés, visage impassible, flammes orange et fumée blanche sous lui. Puis, à droite et bien séparé (60 px) : le jet de flammes et le nuage de fumée seuls.
Rangée 4 : « DOWN SPECIAL — INSPECTION SURPRISE » 3 poses — Il s’accroupit péniblement, pose une petite charge au sol, se relève télécommande en main, air satisfait. Puis, à droite et bien séparé (60 px) : la charge posée seule (petite boîte noire et jaune, gros bouton rouge, symbole de danger) + son explosion seule (avec débris).
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »
- « Remplace le drapeau par le soleil rouge et or stylisé : aucun drapeau ni emblème officiel. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/kim/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
