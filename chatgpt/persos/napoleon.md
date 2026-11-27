# Napoléon — fiche pour ChatGPT

À envoyer **après** `00_STYLE_ET_FORMAT.md`, dans la même conversation. Joins si possible la planche portrait (`sprites_raw/napoleon/planche_portrait.png`) comme référence de visage et de style. Puis copie les prompts un par un (une image par prompt).

Napoléon a **5 planches** : les 4 habituelles plus une planche « à cheval ». Les planches portrait, attaques, spéciaux et cheval sont faites. **Il manque la planche 1 (déplacements à pied)** : en attendant, le jeu se sert de l'attaque chargée pour sa course et de poses d'attaques pour ses sauts.

## Fiche

- **Nom affiché** : Napoléon (Napoléon Bonaparte)
- **Classe** : L'Empereur
- **Slogan** : « IMPOSSIBLE N'EST PAS FRANÇAIS ! »
- **Personnalité** : lent et léger à pied (facile à éjecter), mobile et solide à cheval ; épéiste technique, impérial et arrogant ; il récompense le bon timing (contre, décret) et change de style à cheval
- **Physique et tenue** : chibi, grosse tête, petit corps trapu. Bicorne noir à bordure dorée et cocarde tricolore, cheveux châtains, uniforme bleu impérial à épaulettes dorées, gilet blanc, cape rouge, bottes noires, sabre. Expression hautaine, menton relevé, une main parfois glissée dans le gilet.
- **Couleurs** : bleu #17345C, or #D6A83E, crème #F0E7D2, rouge #8C2929 ; effets en traînées dorées et éclats rouge et or
- **Accessoires fétiches** : sabre, couronne impériale, cheval blanc
- **Drapeau** : drapeau français (aucun emblème officiel réel, le « N » couronné est un motif décoratif)

## Ce que font ses coups en jeu

| Coup | Dessin | En jeu |
|---|---|---|
| Coup rapide | trois coups de sabre rapides | Petit coup enchaînable devant soi |
| Smash avant | grand coup de sabre horizontal en fente | Gros coup qui éjecte vers l'avant, bonne portée |
| Smash haut | sabre levé à la verticale | Éjecte vers le haut |
| Attaque à terre | estoc bas, sabre au ras du sol | Coup bas rapide |
| Attaques aériennes | rotation sabre tendu (neutre), estoc (avant), revers (arrière), sabre au-dessus de la tête (haut), piqué sabre en avant (bas) | Coups en l'air |
| CONTRE IMPÉRIAL | En garde, sabre levé ; à la parade, éclat doré, puis grande riposte en arc doré. | Contre : un coup reçu pendant la fenêtre est paré et l'attaquant reste étourdi 2,5 s ; un projectile est renvoyé. Raté = longue ouverture. |
| LE DÉCRET IMPÉRIAL | Coup de sabre horizontal, traînée dorée. Marque : « N » couronné dans une couronne de laurier, avec 0 à 3 entailles rouges. | 0 dégât, marque les adversaires touchés pendant 3 s ; à la fin, ils reprennent une seconde fois, en %, tout ce qu'ils ont encaissé entre-temps, sans être éjectés. Pas de recharge (une cible déjà marquée ne l’est pas une seconde fois) ; s’enchaîne directement après la riposte du contre. |
| LE SACRE | Il brandit la couronne, qui s'illumine, et s'envole bras levé ; nuages et rayons dorés au décollage. | Remontée verticale qui frappe en continu. |
| LA MONTURE IMPÉRIALE | Il s'accroupit, cercle doré au sol, rayons de lumière, il se relève à cheval. | À cheval : plus rapide, plus lourd, dégâts reçus −40 %, toutes ses attaques deviennent une charge de cavalerie (dégâts modérés). Dernier saut en l'air = grand saut du cheval, qui disparaît. Le cheval part aussi s'il encaisse trop (≈ 32 %), si Napoléon fait un autre spécial, ou sur un nouvel appui bas + B. 8 s avant de pouvoir remonter. |
| Victoire | pied sur un rocher, drapeau français levé | Pose de fin de partie |

## Prompt planche 0 — Portrait et icône

```text
Personnage : Napoléon Bonaparte (L'Empereur), caricature satirique, style chibi cartoon détaillé comme les planches de référence.
Chibi, grosse tête, petit corps trapu. Bicorne noir à bordure dorée et cocarde tricolore, cheveux châtains, uniforme bleu impérial #17345C à épaulettes dorées, gilet blanc, cape rouge #8C2929, sabre. Expression hautaine, menton relevé.
Image paysage 1536×1024, fond décoré autorisé (cette planche n'est pas détourée), deux éléments bien séparés :
1. En haut, sur toute la largeur : une illustration bannière au format 2:1 — buste, bras croisés, main dans le gilet, cape au vent ; derrière lui un grand drapeau tricolore avec un « N » doré couronné dans une couronne de laurier, un canon, un arc de triomphe et des grenadiers en silhouette. Couleurs : bleu #17345C, or #D6A83E, crème #F0E7D2, rouge #8C2929.
2. En bas au centre : une icône carrée 400×400 — tête et épaules, bicorne, regard hautain, fond rouge.
Aucun autre texte, aucun logo de jeu existant, aucun emblème officiel réel.
```

## Prompt planche 1 — Déplacements à pied (à faire)

```text
Planche de sprites « DÉPLACEMENTS » de Napoléon (L'Empereur). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d'ombre ni de ligne de sol, perso debout ≈ 200 px, toujours tourné vers la droite, contour noir épais, même échelle partout. Même visage, même tenue et même taille que sur les planches attaques et spéciaux déjà faites.
Personnage : chibi, grosse tête, petit corps trapu. Bicorne noir à bordure dorée et cocarde tricolore, cheveux châtains, uniforme bleu impérial #17345C à épaulettes dorées, gilet blanc, cape rouge #8C2929, bottes noires, sabre à la main. Couleurs des effets : or #D6A83E, rouge #8C2929.
Rangée 1 : « IDLE » 4 poses (debout, sabre pointé vers le bas, main dans le gilet, petite respiration) — puis « WALK » 6 poses (marche martiale, menton levé).
Rangée 2 : « RUN » 6 poses (course penchée en avant, cape qui flotte, petits nuages de poussière détachés) — puis « DASH » 3 poses (élan horizontal, traînée dorée).
Rangée 3 : « JUMP » 3 poses (impulsion, décollage, montée) — « DOUBLE JUMP » 4 poses (salto, cape enroulée, arc doré) — « FALL » 3 poses (cape relevée, traits de vitesse).
Rangée 4 : « LAND » 3 poses — « CROUCH » 1 pose — « SHIELD » 1 pose (en garde, sabre en travers, sans bulle) — « DODGE » 3 poses (pas de côté très rapide avec image fantôme dorée).
```

## Prompt planche 2 — Attaques

```text
Planche de sprites « ATTAQUES » de Napoléon (L'Empereur). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 5 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d'ombre ni de ligne de sol, perso debout ≈ 160 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : chibi, bicorne noir à bordure dorée et cocarde tricolore, uniforme bleu impérial #17345C, gilet blanc, cape rouge #8C2929, sabre. Couleurs des effets : or #D6A83E, rouge #8C2929.
Rangée 1 : « ATTAQUE RAPIDE (x3) » 4 poses (garde puis trois coups de sabre rapides) — « ATTAQUE CHARGÉE » 4 poses (charge sabre pointé en avant).
Rangée 2 : « SMASH AVANT » 4 poses (grand coup horizontal en fente) — « SMASH HAUT » 4 poses (sabre levé à la verticale).
Rangée 3 (en l'air, pieds décollés) : « SMASH BAS » 3 — « AÉRIENNE NEUTRE » 2 (rotation sabre tendu) — « AÉRIENNE AVANT » 2 (estoc) — « AÉRIENNE BAS » 2 (piqué sabre en avant).
Rangée 4 : « AÉRIENNE HAUT » 2 — « AÉRIENNE ARRIÈRE » 2 (revers, toujours tourné à droite) — « DOWN TILT » 3 (estoc au ras du sol) — « UP TILT » 3.
Rangée 5 : « TOUCHÉ » 4 poses (bouche ouverte, étoiles) — « ÉJECTION / KO » 4 poses (en vrille) — « VICTOIRE » 3 poses (bras croisés, sabre levé, puis pied sur un rocher avec un drapeau français levé).
```

## Prompt planche 3 — Spéciaux et effets

```text
Planche de sprites « SPÉCIAUX » de Napoléon (L'Empereur). Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier), 4 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d'ombre ni de ligne de sol, perso debout ≈ 160 px, toujours tourné vers la droite, contour noir épais, même échelle partout.
Personnage : chibi, bicorne noir à bordure dorée et cocarde tricolore, uniforme bleu impérial #17345C, gilet blanc, cape rouge #8C2929, sabre. Couleurs des effets : or #D6A83E, rouge #8C2929.
Rangée 1 : « CONTRE IMPÉRIAL » 7 poses — debout, garde sabre levé (2 poses), parade avec éclat doré, riposte sabre tendu, grand arc doré, retour.
Rangée 2 : « LE DÉCRET IMPÉRIAL » 4 poses — debout, préparation, coup horizontal avec traînée dorée, retour. Puis, bien séparé (60 px) : 4 marques seules, un « N » doré couronné dans une couronne de laurier, avec 0, 1, 2 puis 3 entailles rouges.
Rangée 3 : « LE SACRE » 6 poses — il sort la couronne, elle s'illumine, il la brandit, puis s'envole bras levé (petits nuages sous lui). Puis, bien séparé : la couronne seule + les rayons dorés et le nuage du décollage, seuls.
Rangée 4 : « LA MONTURE IMPÉRIALE » 6 poses — debout, il s'accroupit, cercle doré au sol, rayons de lumière, il se relève. Puis, bien séparé : le cercle doré seul + les rayons seuls (2 tailles).
Les effets isolés sont dessinés seuls, sans le personnage, prêts à être découpés.
```

## Prompt planche 4 — À cheval

```text
Planche de sprites « À CHEVAL » de Napoléon (L'Empereur), sur un cheval blanc. Respecte STRICTEMENT le guide « 00_STYLE_ET_FORMAT.md » (envoyé avant) : image paysage 1536×1024, fond transparent (sinon bleu nuit uni #0B1026, jamais de damier ni de halo coloré derrière les titres), 5 rangées titrées (bandeau incliné AU-DESSUS des poses), au moins 40 px de vide entre les poses, pas d'ombre ni de ligne de sol, toujours tourné vers la droite, contour noir épais, même échelle partout. Le cheval garde exactement le même dessin sur toutes les poses.
Personnage : même Napoléon que les autres planches, assis sur un cheval blanc à crinière grise, selle rouge, bride marron.
Rangée 1 : « ATTENTE » 4 poses — « MARCHE » 6 poses.
Rangée 2 : « COURSE » 6 poses (galop).
Rangée 3 : « SAUT » 3 — « DOUBLE SAUT » 4 — « CHUTE » 3.
Rangée 4 : « ATTERRISSAGE » 3 — « ATTAQUE À CHEVAL » 4 (sabre levé, arc doré horizontal) — « TOUCHÉ » 3.
Rangée 5 : « DÉMONTAGE » 4 poses (à cheval, il saute à terre, il retombe accroupi à pied).
```

## Si une image ne va pas

- « Les poses 2 et 3 se touchent : écarte-les d'au moins 40 px, sans rien changer d'autre. »
- « Retire le halo rouge derrière les titres : le fond doit être entièrement transparent. »
- « Garde exactement le même visage, le même bicorne et la même taille que sur la planche attaques. »

Enregistre les planches dans `sprites_raw/napoleon/` : `planche_portrait.png`, `planche_deplacements.png` (à faire), `planche_attaques.png`, `planche_speciaux.png`, `planche_cheval.png`.
