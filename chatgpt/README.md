# Faire dessiner des planches par ChatGPT

Ce dossier contient tout ce qu'il faut envoyer à ChatGPT pour obtenir des planches de sprites plus grandes et plus détaillées que les actuelles, dans le même style.

| Fichier | Rôle |
|---|---|
| `00_STYLE_ET_FORMAT.md` | Le guide commun : style, format de l'image, nombre de poses par animation. **À envoyer en premier, à chaque nouvelle conversation.** |
| `persos/<perso>.md` | Une fiche par perso existant : physique, couleurs, détail de chaque coup, et les 4 prompts prêts à copier. |
| `NOUVEAU_PERSO.md` | Le modèle à remplir (ou à faire remplir par ChatGPT) pour créer un nouveau perso. |

## Pourquoi 4 planches par perso au lieu d'une

Sur l'ancienne planche unique, chaque pose ne faisait que 70 à 90 pixels de haut. Même agrandie et nettoyée, elle manque de détails.

En répartissant les animations sur 4 images (portrait, déplacements, attaques, spéciaux), chaque pose mesure environ 200 pixels, soit 2 à 3 fois plus de détail réel. On y gagne aussi les attaques aériennes, absentes de l'ancienne planche.

## Marche à suivre pour un perso

1. Ouvre une nouvelle conversation avec ChatGPT, en mode génération d'images.
2. Envoie le contenu de `00_STYLE_ET_FORMAT.md`, en joignant l'ancienne planche du perso (`sprites_raw/<perso>/planche.webp`) comme référence de visage et de style.
3. Envoie la fiche `persos/<perso>.md`, puis copie ses prompts **un par un**, une image à la fois.
4. Vérifie chaque image :
   - poses bien séparées ;
   - pas d'ombre ni de ligne au sol ;
   - fond transparent ou bleu nuit uni ;
   - titres au-dessus des poses.
   Sinon, demande une correction (exemples en bas de chaque fiche).
5. Enregistre les images dans `sprites_raw/<perso>/` :
   - `planche_portrait.png`
   - `planche_deplacements.png`
   - `planche_attaques.png`
   - `planche_speciaux.png`
6. Préviens-moi : je règle le découpage dans `tools/sprite-sheets.json`, je lance l'outil et je mets les attaques à jour si besoin.

## Retour d'expérience : Mélenchon (premier perso refait)

Le résultat est excellent, avec un vrai fond transparent, des poses bien séparées et le style respecté. Deux points à surveiller pour les suivants :

- **Taille** : la planche des spéciaux est sortie en 1125×750 au lieu de 1536×1024. Je l'ai agrandie, mais demande bien **1536×1024 pour les 4 planches** : les poses gardent ainsi la même taille partout.
- **Nombre de poses** : IDLE n'avait que 3 poses au lieu de 4. Ça passe, mais 4 donnent une respiration plus fluide.

Depuis, les 7 persos sont refaits. L'outil gère trois cas :

- les vrais fonds transparents, le meilleur cas ;
- un voile d'opacité de fond ;
- les fonds blancs ou en faux damier gris clair, plus délicats parce qu'un reflet blanc peut être pris pour du fond.

Le fond transparent reste à privilégier.

Côté découpe, il suffit d'ajouter les rectangles de chaque animation dans `tools/sprite-sheets.json` (voir l'entrée `melenchon`, avec `"upscale": 2`). Je m'en occupe.

## Bon à savoir

- **Fond transparent** : si ChatGPT livre un vrai PNG transparent, l'outil garde la transparence telle quelle, halos des effets compris. C'est le meilleur résultat possible. S'il dessine un faux damier gris, demande un fond bleu nuit uni : l'outil sait le retirer.
- **Ressemblance** : si le visage dérive d'une image à l'autre, redonne la planche portrait en référence et demande « exactement le même visage et la même tenue ».
- **Limites de contenu** : c'est de la satire de personnalités publiques. Ni victimes réelles, ni groupes visés, ni vrais logos. Les fiches sont écrites dans ce sens, garde-les ainsi pour les nouveaux persos.
