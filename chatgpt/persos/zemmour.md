# Zemmour — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible l’ancienne planche (`sprites_raw/zemmour/planche.webp`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Zemmour (Éric Zemmour)
- **Classe** : Le Polémiste
- **Slogan** : « Je n’ai pas fini ma phrase. »
- **Personnalité** : débatteur qui ne laisse personne parler, tout passe par la parole et les bulles
- **Physique et tenue** : Homme de 65 ans, crâne dégarni, sourcils froncés, petit sourire narquois. Costume sombre ajusté, chemise blanche, cravate violette. Gestuelle de plateau télé : doigt pointé, main qui coupe l’air.
- **Couleurs** : violet #7B3A7E, blanc, lavande #D4C8FF ; effets en bulles de BD blanches et éclairs violets
- **Accessoire fétiche** : pupitre de plateau télé, bulles de BD

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | doigt pointé sec, petite bulle « ! » à l’impact | Petit coup enchaînable devant soi |
| Smash avant | grand revers du bras, arc violet et bulle « FAUX ! » | Gros coup qui éjecte vers l’avant |
| Smash haut | index levé vers le ciel « Écoutez-moi ! », étincelles blanches au-dessus | Éjecte vers le haut |
| Smash bas | tape du poing sur un pupitre imaginaire, onde violette au sol des deux côtés | Frappe des deux côtés au sol |
| Attaques aériennes | tourbillon de feuilles de notes autour de lui (variantes avant, arrière, haut, bas) | Coups en l’air |
| RAFALE DE PUNCHLINES | Il parle de plus en plus vite, la main qui tranche l’air ; des bulles de BD jaillissent de sa bouche : « FAUX ! », « BLA BLA ! », « LAISSEZ-MOI FINIR ! », « ?! ». | Rafale de 3 petites bulles-projectiles qui filent tout droit. |
| ÉTERNUEMENT | Pose 1 « AH… », pose 2 « AH… » tête en arrière, pose 3 « ATCHOUM ! » : jet puissant de postillons bleu clair vers l’avant. | Souffle devant lui qui repousse l’adversaire très loin, avec recul. |
| REBOND MÉDIATIQUE | Il s’envole vers le haut, porté par une tornade de unes de journaux et de micros de plateaux (parodiques, sans vrais logos). | Remontée verticale, traînée de pages. |
| LE GRAND REMPLACEMENT | Pose 1 : il pointe l’adversaire. Pose 2 : nuage de fumée violet. Pose 3 : il réapparaît, une silhouette violette neutre à sa place d’origine, flèches d’échange. | Il échange sa place avec l’adversaire (la blague est sur sa propre obsession), 4 s de recharge. |
| Victoire | bras croisés, sourire satisfait, puis doigt levé, bulles « J’AVAIS RAISON » | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Éric Zemmour (Le Polémiste), style chibi cartoon détaillé comme les planches de référence.
Homme de 65 ans, crâne dégarni, sourcils froncés, petit sourire narquois. Costume sombre ajusté, chemise blanche, cravate violette. Gestuelle de plateau télé : doigt pointé, main qui coupe l’air.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, doigt pointé vers le spectateur, fond tricolore incliné avec éclairs violets. Couleurs : violet #7B3A7E, blanc, lavande #D4C8FF ; effets en bulles de BD blanches et éclairs violets.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard face caméra, expression typique, même fond que la bannière.
Aucun autre texte, aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Zemmour (Le Polémiste). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 65 ans, crâne dégarni, sourcils froncés, petit sourire narquois. Costume sombre ajusté, chemise blanche, cravate violette. Gestuelle de plateau télé : doigt pointé, main qui coupe l’air. Couleurs des effets : violet #7B3A7E, blanc, lavande #D4C8FF ; effets en bulles de BD blanches et éclairs violets.
Rangée 1 : « IDLE » 4 poses (respiration, en garde) — puis « WALK » 6 poses (cycle de marche complet).
Rangée 2 : « RUN » 6 poses (cycle de course penché en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées de vitesse aux couleurs du perso).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc d’effet) — « FALL » 3 poses.
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (roulade avec image fantôme).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Zemmour (Le Polémiste). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 65 ans, crâne dégarni, sourcils froncés, petit sourire narquois. Costume sombre ajusté, chemise blanche, cravate violette. Gestuelle de plateau télé : doigt pointé, main qui coupe l’air. Couleurs des effets : violet #7B3A7E, blanc, lavande #D4C8FF ; effets en bulles de BD blanches et éclairs violets.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (doigt pointé sec, petite bulle « ! » à l’impact) — « FORWARD SMASH » 3 poses (grand revers du bras, arc violet et bulle « FAUX ! »).
Rangée 2 : « UP SMASH » 3 poses (index levé vers le ciel « Écoutez-moi ! », étincelles blanches au-dessus) — « DOWN SMASH » 3 poses (tape du poing sur un pupitre imaginaire, onde violette au sol des deux côtés).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (tourbillon de feuilles de notes autour de lui) — « FORWARD AIR » 2 — « BACK AIR » 2 (coup vers l’arrière, toujours tourné à droite) — « UP AIR » 2 — « DOWN AIR » 2 (piqué).
Rangée 4 : « HURT » 1 pose (grimace, recul) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 3 poses (bras croisés, sourire satisfait, puis doigt levé, bulles « J’AVAIS RAISON »).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Zemmour (Le Polémiste). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme de 65 ans, crâne dégarni, sourcils froncés, petit sourire narquois. Costume sombre ajusté, chemise blanche, cravate violette. Gestuelle de plateau télé : doigt pointé, main qui coupe l’air. Couleurs des effets : violet #7B3A7E, blanc, lavande #D4C8FF ; effets en bulles de BD blanches et éclairs violets.
Rangée 1 : « NEUTRAL SPECIAL — RAFALE DE PUNCHLINES » 3 poses — Il parle de plus en plus vite, la main qui tranche l’air ; des bulles de BD jaillissent de sa bouche : « FAUX ! », « BLA BLA ! », « LAISSEZ-MOI FINIR ! », « ?! ». Puis, à droite et bien séparé (60 px) : 3 bulles de BD blanches isolées, contour noir, textes différents. Puis, encore à droite : la bulle de bouclier seule (bulle ronde violette translucide, petites bulles de BD vides qui flottent dedans).
Rangée 2 : « SIDE SPECIAL — ÉTERNUEMENT » 3 poses — Pose 1 « AH… », pose 2 « AH… » tête en arrière, pose 3 « ATCHOUM ! » : jet puissant de postillons bleu clair vers l’avant. Puis, à droite et bien séparé (60 px) : le jet d’éternuement seul (cône de gouttelettes bleu clair et blanches), orienté vers la droite.
Rangée 3 : « UP SPECIAL — REBOND MÉDIATIQUE » 3 poses — Il s’envole vers le haut, porté par une tornade de unes de journaux et de micros de plateaux (parodiques, sans vrais logos). Puis, à droite et bien séparé (60 px) : une tornade de journaux et micros isolée.
Rangée 4 : « DOWN SPECIAL — LE GRAND REMPLACEMENT » 3 poses — Pose 1 : il pointe l’adversaire. Pose 2 : nuage de fumée violet. Pose 3 : il réapparaît, une silhouette violette neutre à sa place d’origine, flèches d’échange. Puis, à droite et bien séparé (60 px) : nuage de fumée violet isolé + petit sablier « 4 s ».
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/zemmour/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
