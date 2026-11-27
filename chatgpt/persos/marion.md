# Marion Maréchal — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins la planche portrait (`sprites_raw/marion/planche_portrait.png`) comme référence de visage et de style, puis copie les prompts un par un.

Les 4 planches sont faites. **Il manque sur la planche déplacements les poses TOUCHÉ, KO et VICTOIRE** : en attendant, le jeu prend la pose groupée du saut pour « touché » et la pose du bisou envoyé pour la victoire. Le prompt « Planche 1 bis » ci-dessous les ajoute.

## Fiche

- **Nom affiché** : Marion (Marion Maréchal)
- **Classe** : La Diva
- **Slogan** : « Je ne perds jamais. Je fais simplement une pause maquillage. »
- **Personnalité** : rushdown très rapide et léger, axé combos ; facile à éjecter
- **Physique et tenue** : chibi, longs cheveux blonds ondulés et volumineux, maquillage marqué, créoles dorées. Tailleur bleu marine ajusté, jupe courte, escarpins rouges, cocarde tricolore au revers, gros sac à main matelassé brun avec un « R » doré décoratif.
- **Couleurs** : bleu marine #1E2A5A, rose #FF4FA3, or #FFD166, blanc ; effets en traînées roses, cœurs et étoiles
- **Accessoire fétiche** : le sac à main
- **Drapeau** : drapeau français (aucun logo de parti réel : pas de logo « R » de Reconquête ni de nom de parti sur les planches)

## Ce que font ses coups en jeu

| Coup | En jeu |
|---|---|
| Coup rapide | combo de coups de sac, enchaînable |
| Smash avant | grand coup de sac horizontal, forte éjection |
| Smash haut | coup vers le haut, éjecte à la verticale |
| Smash bas | rotation avec le sac, frappe des deux côtés |
| Aériennes | pirouette multi-coups (neutre), talon (avant), sac retourné (arrière), talon céleste (haut), plongeon (bas, risqué) |
| BISOU FATAL | projectile ; la cible touchée est charmée 2 s : elle se déplace moins vite mais joue normalement |
| SAC SANS FOND | toujours dans cet ordre, puis on recommence : rouge à lèvres (coup direct), parfum (explosion devant elle), préservatif gonflable (projectile qui rebondit), miroir de poche (projectile qui éblouit un instant), poudre compacte (coup lent et puissant). L'objet suivant flotte derrière son épaule. |
| TAPIS ROUGE | remontée verticale, peu dirigeable sur le côté, sans dégâts |
| RETOUCHE EXPRESS | elle file dans la direction choisie (en arrière par défaut) et laisse un double rose qui explose quand on le frappe (l’attaquant est piégé dans l’explosion) ou au bout de 2 s. Recharge 2,5 s. |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Marion Maréchal (La Diva), caricature satirique, style chibi cartoon détaillé comme les planches de référence.
Longs cheveux blonds ondulés et volumineux, maquillage marqué, créoles dorées, tailleur bleu marine ajusté, cocarde tricolore au revers, gros sac à main matelassé.
Image paysage 1536×1024, fond décoré autorisé, deux éléments bien séparés :
1. En haut, sur toute la largeur : une bannière 2:1 — buste, index pointé vers l'horizon, air hautain ; derrière elle des drapeaux français, un arc de triomphe et une foule en silhouette. Couleurs : bleu marine #1E2A5A, rose #FF4FA3, or #FFD166.
2. En bas au centre : une icône carrée 400×400 — tête et épaules, sourire en coin, fond bleu-blanc-rouge.
Aucun texte, aucun logo de parti (pas de « R » de Reconquête, pas de nom de parti), aucun logo de jeu existant.
```

## Prompt planche 1 — Déplacements

```text
Planche de sprites « DÉPLACEMENTS » de Marion Maréchal (La Diva). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » : image paysage 1536×1024, fond transparent (jamais de damier), 4 rangées titrées, au moins 40 px de vide entre les poses, pas d'ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : chibi, longs cheveux blonds ondulés, maquillage marqué, créoles dorées, tailleur bleu marine ajusté, jupe courte, escarpins rouges, cocarde tricolore, gros sac à main matelassé brun.
Rangée 1 : « IDLE » 4 poses (main sur la hanche, l'autre sur le sac, regarde ses ongles) — « WALK » 6 poses (démarche de podium).
Rangée 2 : « RUN » 6 poses (sac serré contre elle, cheveux au vent) — « DASH » 3 poses (traînée rose).
Rangée 3 : « JUMP » 3 — « DOUBLE JUMP » 4 (rotation des jambes, arc rose) — « FALL » 3.
Rangée 4 : « LAND » 3 — « CROUCH » 1 — « SHIELD » 1 (sac levé devant elle, sans bulle) — « DODGE » 3.
```

## Prompt planche 1 bis — Touché, KO, victoire (à faire)

```text
Planche de sprites « RÉACTIONS » de Marion Maréchal (La Diva), même style, même visage, même tenue et même taille que la planche déplacements déjà faite. Image paysage 1536×1024, fond transparent, 3 rangées titrées, 40 px de vide entre les poses, tournée vers la droite.
Rangée 1 : « HURT » 3 poses (elle recule sous le choc, puis replace ses cheveux).
Rangée 2 : « KO » 3 poses (éjectée en vrille, elle protège son visage, étoiles autour de la tête).
Rangée 3 : « VICTORY » 4 poses (elle sort son miroir, replace ses cheveux, met du rouge à lèvres, envoie un bisou avec un petit cœur rose).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Marion Maréchal (La Diva). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » : image paysage 1536×1024, fond transparent, rangées titrées, 40 px de vide entre les poses, toujours tournée vers la droite, même échelle partout (toutes les rangées à la même taille que la planche déplacements).
Rangée 1 : « BASIC ATTACK (COMBO x3) » 4 poses (coups de sac rapides, arc rose) — « FORWARD SMASH » 5 poses (elle fait tourner son sac, grand coup horizontal, éclat rose).
Rangée 2 : « UP SMASH » 4 poses (coup vers le haut, arc rose) — « DOWN SMASH » 5 poses (rotation basse avec le sac, arc rose des deux côtés, poussière).
Rangée 3 (en l'air) : « NEUTRAL AIR » 3 (pirouette avec le sac) — « FORWARD AIR » 3 (talon en avant) — « BACK AIR » 3 (sac retourné) — « UP AIR » 2 (talon vers le haut) — « DOWN AIR » 2 (plongeon sac en avant, impact rose).
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Marion Maréchal (La Diva). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » : image paysage 1536×1024, fond transparent, 4 rangées titrées, 40 px de vide entre les poses, toujours tournée vers la droite, même échelle sur toutes les rangées.
Rangée 1 : « BISOU FATAL » 8 poses — deux doigts sur les lèvres, elle envoie un bisou ; une paire de lèvres roses part vers la droite. Puis, séparées : les lèvres roses seules avec leur traînée + un petit cœur seul.
Rangée 2 : « SAC SANS FOND » — elle ouvre son sac, fouille, puis une pose par objet tenu en main : rouge à lèvres géant, flacon de parfum qui pschitte, préservatif gonflable dans son emballage rose, poudre compacte géante ouverte (miroir et nuage de poudre). Puis, séparés : chaque objet seul.
Rangée 3 : « TAPIS ROUGE » 6 poses — elle déroule un tapis rouge, monte dessus, le tapis se relève en rampe et la propulse vers le haut, traînées roses et étoiles.
Rangée 4 : « RETOUCHE EXPRESS » 6 poses — elle sort un miroir à main, pirouette, file sur le côté (traînée rose) puis replace sa coiffure. Puis, séparés : son double rose translucide seul + un éclat rose de disparition seul.
```

Enregistre les planches dans `sprites_raw/marion/` : `planche_portrait.png`, `planche_deplacements.png`, `planche_attaques.png`, `planche_speciaux.png` (et `planche_reactions.png` pour la 1 bis).
