# FightClub — guide de style et de format des planches (à envoyer en premier à ChatGPT)

Tu vas dessiner les planches de sprites d'un jeu de combat de plateforme satirique sur la politique française, FightClub. Le genre est celui des jeux de baston « à la Smash », mais avec notre propre identité : n'utilise jamais le logo, l'emblème rond ou le nom d'un jeu existant.

Chaque personnage est une caricature de personnalité publique. On se moque de ses manies, de ses slogans et de ses positions, jamais de groupes de personnes. Pas de victimes réelles, pas de symboles haineux, pas de vrais logos de marques, de chaînes ou de partis : les panneaux et bandeaux sont parodiques.

Je découpe ensuite les planches automatiquement. Le format ci-dessous compte donc autant que le dessin : **respecte-le à la lettre**.

---

## 1. Style graphique (identique pour tous les persos)

- **Chibi cartoon détaillé** : grosse tête (environ 1/3 de la hauteur), visage très ressemblant et expressif, corps trapu et dynamique.
- **Rendu cel-shading propre** : aplats + 2 niveaux d'ombre + reflets nets. Couleurs saturées, éclairage venant d'en haut à gauche.
- **Contour noir épais et continu** autour de tout le personnage (environ 3 px), y compris entre les jambes et sous les bras.
- **Le même personnage dans toutes les poses** : même visage, même tenue, mêmes couleurs, même taille.
- **Toujours tourné vers la droite** (je retourne l'image moi-même pour la gauche).
- **Effets généreux et thématiques** (ondes, éclairs, traînées, étincelles, objets), dans les couleurs du perso, avec un cœur lumineux et un halo.
- Si je joins une ancienne planche, elle est la référence de style : même rendu, mêmes proportions, même finition.

## 2. Format de chaque image

- **Format paysage 1536 × 1024 px**, la plus haute qualité possible.
- **Fond** :
  - idéalement **transparent** (PNG avec canal alpha) ;
  - sinon **bleu nuit uni #0B1026**, parfaitement plat ;
  - **jamais** de damier gris qui imite la transparence, de dégradé, de halo de fond, de vignettage, de cadre, de panneau ou de texture.
- **4 rangées horizontales**, chacune avec son titre.
- **Titre de rangée** :
  - en haut à gauche de la rangée, en lettres capitales blanches, grasses et italiques, sur un bandeau incliné de la couleur du perso ;
  - le bandeau reste **au-dessus** des poses, sans jamais les toucher ;
  - sous le titre, pas de filet ni de ligne qui traverse l'image.
- **Les poses** :
  - de gauche à droite, posées sur une **ligne de sol invisible** commune à la rangée ;
  - **au moins 40 px de vide** entre deux poses, effets compris : aucun effet ne déborde sur la pose voisine ;
  - **pas d'ombre portée au sol, pas de ligne de sol, pas de poussière qui relie deux poses** ;
  - un personnage debout mesure **environ 200 px de haut**, à la même échelle sur les quatre planches.
- **Les effets isolés** (projectile, invocation, bouclier…) sont dessinés **seuls**, à droite de leur rangée, séparés du perso par au moins 60 px.
- Aucun autre texte que les titres de rangée et les textes demandés (pancarte, bulle…).

## 3. Les quatre planches d'un perso

Chaque fiche perso donne le contenu exact. Le principe :

| Planche | Contenu |
|---|---|
| **0 — Portrait** | En haut, une illustration bannière large (environ 2:1) : buste du perso devant son drapeau ou ses couleurs, pose iconique. En bas, une icône carrée (tête et épaules, regard face caméra). Ici le fond peut être décoré, puisque je ne détoure pas cette planche. |
| **1 — Déplacements** | Attente, marche, course, ruée, sauts, chute, atterrissage, accroupi, bouclier, esquive. |
| **2 — Attaques** | Coup rapide, smashs (avant, haut, bas), attaques aériennes, touché, éjection, victoire. |
| **3 — Spéciaux** | Les 4 coups spéciaux (3 poses chacun) et leurs effets isolés, plus la bulle de bouclier. |

## 4. Nombre de poses par animation (planches 1 et 2)

Respecte ces nombres. Les poses d'une animation se lisent comme une **séquence fluide** : chaque pose avance un peu le mouvement.

| Animation | Poses | Notes |
|---|---|---|
| IDLE (attente) | 4 | Respiration, léger balancement, en garde. |
| WALK (marche) | 6 | Cycle complet, pied gauche puis pied droit. |
| RUN (course) | 6 | Cycle complet, penché en avant, petits nuages de poussière à part. |
| DASH (ruée) | 3 | Élan horizontal, traînées de vitesse derrière. |
| JUMP (saut) | 3 | Impulsion accroupie, décollage, montée. |
| DOUBLE JUMP | 4 | Salto ou vrille avec un arc d'effet. |
| FALL (chute) | 3 | Bras en l'air, vêtements qui flottent. |
| LAND (atterrissage) | 3 | Genoux pliés, puis on se relève. |
| CROUCH (accroupi) | 1 | |
| SHIELD (bouclier) | 1 | Le perso en garde, sans la bulle (dessinée à part en planche 3). |
| DODGE (esquive) | 3 | Roulade ou pas de côté avec une image fantôme. |
| NEUTRAL ATTACK | 3 | Préparation, impact (avec effet), retour. |
| FORWARD SMASH | 3 | Armé, coup puissant vers la droite (gros effet), fin. |
| UP SMASH | 3 | Coup vers le haut, effet au-dessus de la tête. |
| DOWN SMASH | 3 | Frappe au sol, onde de choc des deux côtés. |
| NEUTRAL AIR | 2 | En l'air, coup tout autour (tourbillon). |
| FORWARD AIR | 2 | En l'air, coup vers l'avant. |
| BACK AIR | 2 | En l'air, coup vers l'arrière (le perso reste tourné à droite). |
| UP AIR | 2 | En l'air, coup vers le haut. |
| DOWN AIR | 2 | En l'air, piqué vers le bas. |
| HURT (touché) | 1 | Grimace, recul. |
| TUMBLE / KO | 2 | Éjecté en vrille, étoiles autour de la tête. |
| VICTORY | 3 | Pose de victoire avec son accessoire fétiche. |

## 5. Ce que j'attends en retour

Pour chaque planche, une image PNG. Si une planche ne respecte pas le format (poses collées, ombre au sol, damier, titre qui chevauche une pose), refais-la.
