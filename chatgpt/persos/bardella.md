# Bardella — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible l’ancienne planche (`sprites_raw/bardella/planche.webp`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Bardella (Jordan Bardella)
- **Classe** : Le Présidentiable
- **Slogan** : « La France d’abord ! »
- **Personnalité** : candidat lisse et rapide, tout en communication
- **Physique et tenue** : Jeune homme de 30 ans, cheveux bruns coiffés impeccablement, sourire de communicant, rasé de près. Costume bleu marine parfaitement ajusté, chemise blanche, cravate bleu nuit, chaussures marron cirées. Gestuelle de meeting : index pointé, poing serré.
- **Couleurs** : bleu #2F6BFF, blanc, rouge #EF4135 ; effets en ondes sonores bleues et éclairs bleu-blanc-rouge
- **Accessoire fétiche** : pupitre de meeting

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | coup de poing, onde bleue | Petit coup enchaînable devant soi |
| Smash avant | grand coup de poing avec arc bleu-blanc-rouge | Gros coup qui éjecte vers l’avant |
| Smash haut | poing levé « Merci ! », arc bleu | Éjecte vers le haut |
| Smash bas | frappe au sol, explosion blanche | Frappe des deux côtés au sol |
| Attaques aériennes | tourbillon bleu-blanc-rouge (variantes avant, arrière, haut, bas) | Coups en l’air |
| DISCOURS | Derrière un pupitre bleu (logo parodique, pas de vrai logo de parti), il harangue ; des ondes sonores bleues partent vers l’avant. | Ondes-projectiles. |
| MEETING | Il pointe la foule ; une foule de militants avec drapeaux français déferle. | La foule avance au sol et emporte l’adversaire. |
| LA FRANCE D’ABORD | Il s’élève en brandissant un grand drapeau français qui claque au vent. | Remontée, rubans tricolores. |
| FREXIT | Il tient un drapeau européen à deux mains et le déchire en deux ; les étoiles s’éparpillent. | Le drapeau lancé sonne l’adversaire (« FREXIT ! »). |
| Victoire | bras ouverts devant la foule, puis bras croisés, confettis tricolores | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Jordan Bardella (Le Présidentiable), style chibi cartoon détaillé comme les planches de référence.
Jeune homme de 30 ans, cheveux bruns coiffés impeccablement, sourire de communicant, rasé de près. Costume bleu marine parfaitement ajusté, chemise blanche, cravate bleu nuit, chaussures marron cirées. Gestuelle de meeting : index pointé, poing serré.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, index pointé vers le spectateur, fond tricolore. Couleurs : bleu #2F6BFF, blanc, rouge #EF4135 ; effets en ondes sonores bleues et éclairs bleu-blanc-rouge.
2. En bas à gauche : une icône carrée 400×400 — tête et épaules, regard face caméra, expression typique, même fond que la bannière.
Aucun autre texte, aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Bardella (Le Présidentiable). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Jeune homme de 30 ans, cheveux bruns coiffés impeccablement, sourire de communicant, rasé de près. Costume bleu marine parfaitement ajusté, chemise blanche, cravate bleu nuit, chaussures marron cirées. Gestuelle de meeting : index pointé, poing serré. Couleurs des effets : bleu #2F6BFF, blanc, rouge #EF4135 ; effets en ondes sonores bleues et éclairs bleu-blanc-rouge.
Rangée 1 : « IDLE » 4 poses (respiration, en garde) — puis « WALK » 6 poses (cycle de marche complet).
Rangée 2 : « RUN » 6 poses (cycle de course penché en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées de vitesse aux couleurs du perso).
Rangée 3 : « JUMP » 3 poses (impulsion accroupie, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc d’effet) — « FALL » 3 poses.
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (roulade avec image fantôme).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Bardella (Le Présidentiable). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Jeune homme de 30 ans, cheveux bruns coiffés impeccablement, sourire de communicant, rasé de près. Costume bleu marine parfaitement ajusté, chemise blanche, cravate bleu nuit, chaussures marron cirées. Gestuelle de meeting : index pointé, poing serré. Couleurs des effets : bleu #2F6BFF, blanc, rouge #EF4135 ; effets en ondes sonores bleues et éclairs bleu-blanc-rouge.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (coup de poing, onde bleue) — « FORWARD SMASH » 3 poses (grand coup de poing avec arc bleu-blanc-rouge).
Rangée 2 : « UP SMASH » 3 poses (poing levé « Merci ! », arc bleu) — « DOWN SMASH » 3 poses (frappe au sol, explosion blanche).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (tourbillon bleu-blanc-rouge) — « FORWARD AIR » 2 — « BACK AIR » 2 (coup vers l’arrière, toujours tourné à droite) — « UP AIR » 2 — « DOWN AIR » 2 (piqué).
Rangée 4 : « HURT » 1 pose (grimace, recul) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 3 poses (bras ouverts devant la foule, puis bras croisés, confettis tricolores).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Bardella (Le Présidentiable). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Jeune homme de 30 ans, cheveux bruns coiffés impeccablement, sourire de communicant, rasé de près. Costume bleu marine parfaitement ajusté, chemise blanche, cravate bleu nuit, chaussures marron cirées. Gestuelle de meeting : index pointé, poing serré. Couleurs des effets : bleu #2F6BFF, blanc, rouge #EF4135 ; effets en ondes sonores bleues et éclairs bleu-blanc-rouge.
Rangée 1 : « NEUTRAL SPECIAL — DISCOURS » 3 poses — Derrière un pupitre bleu (logo parodique, pas de vrai logo de parti), il harangue ; des ondes sonores bleues partent vers l’avant. Puis, à droite et bien séparé (60 px) : les ondes sonores seules + le pupitre seul. Puis, encore à droite : la bulle de bouclier seule (bulle ronde translucide bleu-blanc-rouge).
Rangée 2 : « SIDE SPECIAL — MEETING » 3 poses — Il pointe la foule ; une foule de militants avec drapeaux français déferle. Puis, à droite et bien séparé (60 px) : la foule avec drapeaux seule (bande horizontale).
Rangée 3 : « UP SPECIAL — LA FRANCE D’ABORD » 3 poses — Il s’élève en brandissant un grand drapeau français qui claque au vent. Puis, à droite et bien séparé (60 px) : le grand drapeau français seul.
Rangée 4 : « DOWN SPECIAL — FREXIT » 3 poses — Il tient un drapeau européen à deux mains et le déchire en deux ; les étoiles s’éparpillent. Puis, à droite et bien séparé (60 px) : le drapeau européen déchiré seul + étoiles qui volent.
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/bardella/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
