# FightClub · Édition présidentielle

Jeu de combat local en pixel-art, façon débat présidentiel qui dégénère. Le Mac affiche l'arène (une nacelle au-dessus de Paris), les téléphones servent de manettes. Candidats : Mélenchon, Bardella, Mao Zedong, Netanyahu, Zemmour, Pascal Praud et Mbappé (ces trois derniers avec un sprite provisoire, en attendant leur planche : voir `sprites_raw/PROMPTS_NOUVEAUX_PERSOS.md`).

## Lancer

```bash
./start.sh
```

Le script installe les dépendances au premier lancement, démarre le serveur et ouvre l'écran de jeu (`http://localhost:3000/screen`).

Ensuite, chaque joueur :

1. se connecte au **même Wi-Fi** que le Mac ;
2. scanne le QR code affiché à l'écran (ou ouvre l'adresse indiquée et tape le code de la room) ;
3. choisit son perso, appuie sur **Prêt** ;
4. tourne son téléphone en paysage.

Au premier lancement, macOS peut demander d'autoriser les connexions entrantes pour `node` : il faut accepter.

### Le téléphone n'arrive pas à charger la page

L'écran indique sous le QR code combien d'appareils ont atteint le Mac, et le terminal affiche `📱 Nouvel appareil` à chaque arrivée. Si ça reste à zéro pendant qu'un téléphone essaie, le jeu n'est pas en cause : c'est le réseau qui empêche les appareils de se parler. C'est courant sur les Wi-Fi partagés (école, entreprise, résidence, hôtel, Wi-Fi invité).

Solution : active le partage de connexion sur un téléphone, connecte le Mac et les autres téléphones dessus, puis relance `./start.sh`.

## Règles

- 2 joueurs, 3 vies chacun. L'arène est une nacelle suspendue à deux montgolfières au-dessus de Paris.
- Plus ton % de dégâts est haut, plus tu es éjecté loin.
- Tu perds une vie si tu sors de l'écran.
- Tombé de la nacelle ? Deux sauts en l'air, puis SPÉCIAL + haut pour remonter. Le perso s'accroche tout seul au bord : ensuite joystick vers l'arène (ou ATTAQUE) pour remonter, SAUT pour sauter, bas pour lâcher.
- Combos : quand un coup touche, on peut l'enchaîner tout de suite avec un autre coup ou un saut. Les coups neutres se tournent seuls vers l'adversaire.
  - Un coup aérien qui touche te fait flotter un instant et te rend un saut.
  - Un saut pendant un combo part tout seul vers l'adversaire éjecté (la « poursuite ») : tire le joystick à l'opposé pour un saut normal.
  - Le compteur « 3 COUPS ! » s'affiche au-dessus de la cible ; le meilleur combo apparaît dans les résultats.
- Spéciaux en recharge : on ne peut plus les enchaîner en boucle (projectile ≈ 1 s, charge ≈ 1,3 s, invocations ≈ 3,3 s, échange ≈ 4 s ; la remontée n'en a pas). Les pastilles sous le % (écran) et au-dessus de SPÉCIAL (téléphone) se remplissent. Réglable par coup avec `"cooldown"` (en frames) dans `character.json`.
- Plafond plus haut, zone d'accroche au bord plus large, remontée plus haute et mieux dirigeable ; sous la coque, on glisse vers le bord au lieu de rester collé. Prendre un coup rend toujours au moins un saut.

## Commandes (manette téléphone)

| Commande | Action |
|---|---|
| Joystick | se déplacer, y compris en attaquant ; bas maintenu sur une plateforme = descendre ; bas en l'air = chute rapide |
| **ATTAQUE** | le coup dépend de la direction : neutre, côté, haut, bas, au sol ou en l'air |
| **SPÉCIAL** | neutre = projectile, côté = charge, haut = remontée, bas = plongeon |
| **SAUT** | appui court = petit saut ; réappuyer en l'air = double saut (ou pousser le joystick vers le haut, si l'option est cochée) |
| **BOUCLIER** | bloque les coups ; avec le joystick : roulade ou esquive ; en l'air : esquive aérienne |

### Sensations de la manette

- Boutons « physiques » : ils s'enfoncent, un halo dépasse du pouce pour voir ce qu'on presse, et une onde part du point d'appui.
- Vibration à chaque appui, à chaque cran du joystick et quand on prend un coup (le bord de l'écran rougit aussi). Sur iPhone, Safari n'a pas d'API de vibration : on utilise le « tic » haptique d'iOS 18 et plus. Sur les iPhone plus anciens, active le **clic sonore**.
- Joystick à 8 crans : le secteur allumé montre la direction lue par le jeu, le bord s'illumine quand on pousse à fond.
- ⚙ en haut de la manette (ou dans le lobby) : vibrations, clic sonore, saut au joystick, taille des boutons, boutons à gauche (gauchers).

## Raccourcis sur l'écran (clavier du Mac)

- `K` : ajouter un joueur clavier. Il joue avec les flèches, `Espace` pour sauter, `X` attaque, `C` spécial, `V` bouclier.
- `C` : ajouter un CPU.
- `←` `→` ou clic sur un perso de la grille : changer le perso du joueur clavier (ou du CPU). Les joueurs sur téléphone choisissent sur leur écran.
- `Suppr` : retirer un joueur local.
- `F` : plein écran.
- `Échap` : quitter la partie en cours.

## Structure

```
server.js                 serveur HTTP + WebSocket, gestion des rooms
public/screen.html        écran de jeu
public/index.html         manette téléphone
public/js/screen/         moteur : game, fighter, moves, stage, fx, audio, CPU
public/js/shared/         sprites (placeholders + sprite sheets), roster
public/characters/        un dossier par perso (character.json + sprites + icône)
public/fonts/             polices pixel, servies en local (aucun accès Internet requis)
sprites_raw/              planches de sprites brutes (images ChatGPT)
tools/import-sprites.mjs  découpe les planches en atlas pour le jeu (voir public/characters/README.md)
tools/make-mobile-assets.mjs  atlas et portraits WebP légers pour les téléphones (lancé par l'import)
SPRITES_CHATGPT.md        comment générer les sprites avec ChatGPT
```
