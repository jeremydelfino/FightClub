// Bandeau « chaîne d'info » : fausses dépêches absurdes, mélangées à chaque chargement.

const HEADLINES = [
  ['URGENT', 'Le débat présidentiel dégénère, les journalistes se réfugient sous le pupitre'],
  ['SONDAGE', '73 % des Français souhaitent que le débat se règle à mains nues'],
  ['INSOLITE', 'Une nacelle survole Paris avec deux candidats qui se tapent dessus'],
  ['POLITIQUE', 'Le 49.3 officiellement classé arme non conventionnelle'],
  ['MÉTÉO', 'Fortes rafales de baffes attendues sur la capitale en soirée'],
  ['ÉCONOMIE', 'La dette atteint un nouveau record, l’arène reste ouverte'],
  ['FACT-CHECK', 'Non, l’immunité parlementaire ne protège pas des uppercuts'],
  ['SOCIAL', 'Grève reconductible des cascadeurs du débat'],
  ['SANTÉ', 'Le ministère rappelle que tomber d’une montgolfière nuit gravement à la santé'],
  ['URGENT', 'Le CPU dépose sa candidature, personne ne sait pour qui il roule'],
  ['INSTITUTIONS', 'La VIe République repoussée à la fin du match'],
  ['TRANSPORTS', 'Trafic perturbé autour de la tour Eiffel : chute de candidats'],
  ['SONDAGE', 'L’abstention atteint 0 % : il n’y a que deux électeurs'],
  ['JUSTICE', 'Plainte déposée pour coup de mégaphone en réunion'],
  ['DIPLOMATIE', 'Sommet international annulé, tous les dirigeants sont sur la nacelle'],
];

export function fillTicker(el) {
  const list = [...HEADLINES].sort(() => Math.random() - 0.5);
  el.innerHTML = list.map(([tag, text]) => `<b>${tag}</b>${text}`).join('<i>■</i>');
  el.style.setProperty('--ticker-duration', `${list.length * 7}s`);
}

/** Petites phrases affichées quand un candidat perd une vie. */
export const KO_LINES = ['DISSOLUTION !', 'DÉMISSION !', 'RECALÉ !', 'HORS JEU !', 'MOTION DE CENSURE !', 'EXIT !'];
