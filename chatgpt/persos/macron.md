# Macron — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible la planche portrait (`sprites_raw/macron/planche_portrait.png`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

## Fiche

- **Nom affiché** : Macron (Emmanuel Macron)
- **Classe** : Le Président-Mème
- **Slogan** : « CAR C’EST NOTRE PROJET ! »
- **Personnalité** : rushdown rapide et théâtral, toujours devant une caméra imaginaire ; ses gros coups demandent une vraie mise en scène
- **Physique et tenue** : Homme mince et athlétique d’une quarantaine d’années, cheveux châtains courts coiffés sur le côté, sourcils expressifs, sourire présidentiel. Costume bleu nuit ajusté, chemise blanche, cravate sombre, petit insigne tricolore au revers. Posture très droite, index souvent levé.
- **Couleurs** : bleu nuit #17243A, bleu présidentiel #315A9B, rouge #D94343, jaune gilet #F2D12E, blanc cassé #F2EEE5, or #D7AD55 ; effets en éclairs tricolores, poudre scintillante violette et rose, papiers administratifs, traînées jaune fluo
- **Accessoires fétiches** : flacon de « poudre de perlimpinpin », gilet jaune fluo trop grand, pupitre à micro, dossier officiel à onglets
- **Drapeau** : drapeau français (aucun logo de parti, de média ni d’institution)

## Ce que font ses coups en jeu

Le dessin doit rendre l’action lisible : l’effet part dans la direction du coup. Les spéciaux : projectile qui laisse un nuage toxique, ruée qui se termine en uppercut, bond vertical qui saisit, contre qui retourne l’adversaire.

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | petit poing, coup de coude, main ouverte qui ponctue un discours | Petit coup enchaînable devant soi |
| Smash avant | grand coup de poing en fente, éclat bleu-blanc-rouge à l’impact | Gros coup qui éjecte vers l’avant |
| Smash haut | index levé au ciel, bulle « CAR C’EST NOTRE PROJET ! », colonne lumineuse | Éjecte vers le haut |
| Smash bas | il frappe le sol, ondes de choc tricolores des deux côtés | Frappe des deux côtés au sol |
| Attaques aériennes | onde circulaire (neutre), coup de genou (avant), coup de pied arrière, coup de pied remontant (haut), coup de pied plongeant (bas) | Coups en l’air, rapides |
| POUDRE DE PERLIMPINPIN | Il sort son flacon violet, lance une boule de poudre, finit son lancer pendant qu’elle file. | Projectile ; à l’impact, nuage violet persistant qui inflige des dégâts progressifs (un seul nuage à la fois). |
| TRAVERSER LA RUE | Il désigne un passage piéton imaginaire, fonce à l’horizontale cravate au vent, finit par un coup remontant. | Ruée rapide qui envoie vers le haut ; vulnérable s’il rate. |
| DISSOLUTION EXPRESS | Il brandit un décret de dissolution, puis s’élance à la verticale, poing levé, traînée bleue. | Remontée verticale ; seul l’adversaire saisi en route prend des dégâts, dans une explosion de papiers. |
| LE GILET JAUNE | Il saisit son gilet jaune, le fait tournoyer devant lui, finit bras tendu gilet déployé. | Contre : une attaque reçue pendant la fenêtre est annulée, l’attaquant est retourné, Macron lui fait face ; renvoie aussi les projectiles. |
| Victoire | derrière un pupitre, index levé, drapeaux français, confettis tricolores | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Emmanuel Macron (Le Président-Mème), caricature satirique, style chibi cartoon détaillé comme les planches de référence.
Homme mince et athlétique d’une quarantaine d’années, cheveux châtains courts coiffés sur le côté, sourcils expressifs, sourire présidentiel. Costume bleu nuit ajusté, chemise blanche, cravate sombre, petit insigne tricolore au revers. Posture très droite.
Image paysage 1536×1024, fond décoré autorisé (cette planche n’est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, index pointé vers l’horizon, sourire satisfait ; derrière lui une pancarte « CAR C’EST NOTRE PROJET ! », un flacon étiqueté « POUDRE DE PERLIMPINPIN » qui scintille, ciel bleu nuit et drapeau français. Couleurs : bleu nuit #17243A, bleu #315A9B, rouge #D94343, jaune #F2D12E, or #D7AD55.
2. En bas au centre : une icône carrée 400×400 — tête et épaules, regard en coin, sourire en biais, fond bleu-blanc-rouge.
Aucun autre texte, aucun logo de jeu existant, aucun logo de parti, de média ou d’institution. Pas de foule identifiable ni de manifestants réels.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Macron (Le Président-Mème). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme mince et athlétique d’une quarantaine d’années, cheveux châtains courts coiffés sur le côté, sourcils expressifs, sourire présidentiel. Costume bleu nuit ajusté, chemise blanche, cravate sombre, petit insigne tricolore au revers. Posture très droite. Couleurs des effets : bleu #315A9B, blanc #F2EEE5, rouge #D94343, jaune #F2D12E ; éclairs tricolores et traînées bleues.
Rangée 1 : « IDLE » 4 poses (en garde, sûr de lui, petit rajustement de cravate) — puis « WALK » 6 poses (marche dynamique de meeting).
Rangée 2 : « RUN » 6 poses (course nerveuse penchée en avant, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînées bleues).
Rangée 3 : « JUMP » 3 poses (impulsion, décollage, montée) — « DOUBLE JUMP » 4 poses (salto avec arc bleu puis doré) — « FALL » 3 poses (traits de vitesse).
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sans bulle) — « DODGE » 3 poses (pas de côté très rapide avec image fantôme tricolore).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Macron (Le Président-Mème). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme mince et athlétique d’une quarantaine d’années, cheveux châtains courts coiffés sur le côté, sourcils expressifs, sourire présidentiel. Costume bleu nuit ajusté, chemise blanche, cravate sombre, petit insigne tricolore au revers. Gestes de mains théâtraux. Couleurs des effets : bleu #315A9B, blanc #F2EEE5, rouge #D94343, jaune #F2D12E ; éclairs tricolores, arcs dorés.
Rangée 1 : « NEUTRAL ATTACK » 3 poses (petit poing, coup de coude, main ouverte qui ponctue un discours, arc doré) — « FORWARD SMASH » 3 poses (préparation, fente, énorme coup de poing avec éclat bleu-blanc-rouge).
Rangée 2 : « UP SMASH » 3 poses (préparation accroupie, index levé au ciel, bulle de BD « CAR C’EST NOTRE PROJET ! » avec éclairs dorés) — « DOWN SMASH » 3 poses (préparation, il frappe le sol, ondes de choc tricolores et débris des deux côtés).
Rangée 3 (en l’air, pieds décollés) : « NEUTRAL AIR » 2 poses (bras ouverts, onde circulaire dorée) — « FORWARD AIR » 2 (coup de genou vers l’avant) — « BACK AIR » 2 (coup de pied arrière, toujours tourné à droite) — « UP AIR » 2 (coup de pied remontant, traînée tricolore) — « DOWN AIR » 2 (coup de pied plongeant, impact étoilé).
Rangée 4 : « HURT » 1 pose (sourire perdu, cravate de travers) — « KO » 2 poses (éjecté en vrille, étoiles autour de la tête) — « VICTORY » 2 poses (bras ouverts, puis derrière un pupitre à micros, poing levé, drapeaux français, confettis tricolores).
Chaque attaque : pose 1 = préparation, pose 2 = impact avec le gros effet, pose 3 = retour.
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Macron (Le Président-Mème). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d’ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : Homme mince et athlétique d’une quarantaine d’années, cheveux châtains courts coiffés sur le côté, sourcils expressifs, sourire présidentiel. Costume bleu nuit ajusté, chemise blanche, cravate sombre, petit insigne tricolore au revers. Couleurs des effets : bleu #315A9B, blanc #F2EEE5, rouge #D94343, jaune #F2D12E, or #D7AD55 ; poudre scintillante violette et rose.
Rangée 1 : « NEUTRAL SPECIAL — POUDRE DE PERLIMPINPIN » 3 poses — Il sort son petit flacon violet, prépare et lance une boule de poudre lumineuse, puis termine son lancer (petite bouffée de poudre au bout du poing). Puis, à droite et bien séparé (60 px) : la boule de poudre seule avec sa traînée violette (pointe vers la droite) + le gros nuage violet et rose seul, avec particules scintillantes.
Rangée 2 : « SIDE SPECIAL — TRAVERSER LA RUE » 3 poses — Il désigne la direction de l’index, fonce à l’horizontale (traînées bleu-blanc-rouge, poussière), puis termine par un uppercut avec arc doré. Puis, à droite et bien séparé (60 px) : les traînées de vitesse tricolores seules + l’explosion dorée seule.
Rangée 3 : « UP SPECIAL — DISSOLUTION EXPRESS » 3 poses — Il brandit un décret de dissolution, s’élance à la verticale poing levé (traînée bleue), puis saisit devant lui. Puis, à droite et bien séparé (60 px) : la colonne d’énergie tricolore seule + des feuilles génériques qui volent (aucun vrai sceau).
Rangée 4 : « DOWN SPECIAL — LE GILET JAUNE » 3 poses — Il saisit et déploie un gilet jaune fluo, le fait tournoyer devant lui dans un grand arc jaune, puis termine bras tendu, gilet déployé (c’est un contre, pas une glissade). Puis, à droite et bien séparé (60 px) : l’arc circulaire jaune lumineux seul avec petites étincelles blanches.
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés. Pas de manifestants, de blessés ni de foule identifiable.
```

## Si une image ne va pas

Demande une correction précise plutôt que de tout refaire, par exemple :
- « Les poses 2 et 3 de RUN se touchent : écarte-les d’au moins 40 px, sans rien changer d’autre. »
- « Retire l’ombre au sol et la ligne sous les pieds. »
- « Le fond doit être transparent, pas un damier gris. Sinon, bleu nuit uni #0B1026. »
- « Garde exactement le même visage et la même tenue que sur la planche 1. »
- « Retire les silhouettes de manifestants et le bidon en feu : seulement Macron et son effet. »

Quand les 4 planches sont prêtes, enregistre-les dans `sprites_raw/macron/` sous les noms `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png` et `planche_speciaux.png`, et dis-le moi : je règle le découpage et je mets le perso à jour dans le jeu.
