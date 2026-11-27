# FightClub — consignes pour Claude

Jeu de combat local (Node + WebSocket) : l'écran dessine l'arène en canvas, les téléphones servent de manettes. Doc des persos et de l'import : `public/characters/README.md`. Fiches et prompts ChatGPT : `chatgpt/persos/`.

## Ajouter ou mettre à jour un perso : le rendu doit être parfait

Chaque nouveau perso suit la même exigence que l'audit des 10 premiers. Ne pas s'arrêter à « ça s'importe » :

1. **Planches** dans `sprites_raw/<id>/` (portrait, déplacements, attaques, spéciaux, plus une planche par état spécial, ex. `planche_cheval.png`). S'il manque une planche dont le perso a besoin, le dire à l'utilisateur et proposer le prompt correspondant.
2. **Fond vraiment transparent** : vérifier l'alpha de chaque planche. Un halo opaque collé aux persos (rouge sous les titres…) : `node tools/flood-clean.mjs <planche.png>` (garde l'original en `.orig.png`), puis contrôler visuellement que rien du perso n'est rongé (cocarde, cape, effets dorés).
3. **Découpage** dans `tools/sprite-sheets.json`, de préférence une pose par rectangle (`rects`) mesurée sur la planche. Aucun bout de pose voisine, de titre ou de main ne doit rester ; les effets détachés gardés seulement s'ils font partie de la pose (`main: false`).
4. **Import** : `node tools/import-sprites.mjs <id>`. Pour un perso dont une planche opaque a été détourée sur macOS (Vision), ne redécouper que le nécessaire : `--only anim1,anim2`.
5. **Audit frame par frame**, à l'échelle du jeu et alignée sur les pieds :
   - **taille** : largeur de tête de chaque animation comparée à la pose d'attente ; corriger avec `scale` (par anim ou par frame) toute pose dessinée plus grande ou plus petite ;
   - **ancrage** : les pieds sur la ligne de sol, pas de saut de côté ni de flottement entre deux frames ;
   - **délimitation** : pas d'éclat, de main, de bout de titre ou de pose voisine ; pas de pose en double (perso + invocation déjà affichée à part) ;
   - **icône et portrait** : icône sans coins de fond, portrait sans bandes de fond.
6. **Animations propres** : chaque état du jeu doit avoir une animation lisible ; un repli (`aliases`) seulement en dépannage, en le signalant.
7. **Vérifier en jeu** (navigateur, console sans erreur) : spéciaux, effets, taille face aux autres persos.
8. **Livrables** : fiche + prompts dans `chatgpt/persos/<id>.md`, `roster.json`, ligne « Candidats » du `README.md`, nouvelles options documentées dans `public/characters/README.md`.

Contraintes de contenu : caricature de la personnalité publique, jamais d'un peuple ou d'un groupe ; pas de vrais logos de parti, d'emblèmes officiels ni de symboles haineux. Ne pas modifier les fiches ni les assets des autres persos sans le demander.

## Code

- `public/js/screen/fighter.js` et `public/js/shared/sprites.js` sont en fins de ligne CRLF : un patch par chaînes exactes doit retirer puis remettre les `\r`.
- Test en jeu sans téléphone : importer `Game` dans la page `/screen`, créer deux joueurs `type: 'keyboard'`, avancer avec `G.step()` et piloter `fighter.player.input`.
