export enum StatutMatch {
  A_VENIR = 'À venir',
  EN_COURS = 'En cours',
  TERMINE = 'Terminé',
  ANNULE = 'Annulé',
  REPORTE = 'Reporté',
}

export const allStatutMatch = new Set(Object.values(StatutMatch))

export const allowedTransitions: Record<StatutMatch, StatutMatch[]> = {
  [StatutMatch.A_VENIR]: [StatutMatch.EN_COURS, StatutMatch.ANNULE, StatutMatch.REPORTE],
  [StatutMatch.REPORTE]: [StatutMatch.A_VENIR, StatutMatch.EN_COURS, StatutMatch.ANNULE],
  [StatutMatch.EN_COURS]: [StatutMatch.TERMINE],
  [StatutMatch.TERMINE]: [],
  [StatutMatch.ANNULE]: [],
}
