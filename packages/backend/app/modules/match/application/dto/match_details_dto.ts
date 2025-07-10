// TODO: doit retourner des entité spécifique
import { DateTime } from 'luxon'
import { StatutMatch } from '#match/domain/entity/statut_match'
import Match from '#match/domain/entity/match'

interface TeamDto {
  id?: string
  nom: string
  codeFederal?: string
  logo?: string
}

interface MatchDto {
  id: string
  codeRenc: string
  date: DateTime
  heure: string
  equipeDomicile: TeamDto
  equipeExterieur: TeamDto
  officiels: string[]
  statut: StatutMatch
  motifAnnulation?: string
  motifReport?: string
  scoreDomicile?: number
  scoreExterieur?: number
}

export interface MatchDetailsDto {
  match: MatchDto
}

export const matchDetailsDtoDomainsToDto = (match: Match): MatchDetailsDto => {
  const home: TeamDto = {
    id: match.equipeDomicile?.id?.toString() || '',
    nom: match.equipeDomicile?.nom?.toString() || 'Équipe non spécifiée',
    codeFederal: match.equipeDomicile?.codeFederal?.toString(),
    logo: match.equipeDomicile?.logo,
  }

  const away: TeamDto = {
    id: match.equipeExterieur?.id?.toString() || '',
    nom: match.equipeExterieur?.nom?.toString() || 'Équipe non spécifiée',
    codeFederal: match.equipeExterieur?.codeFederal?.toString(),
    logo: match.equipeExterieur?.logo,
  }
  return {
    match: {
      id: match.id.toString(),
      codeRenc: match.codeRenc,
      date: match.date,
      heure: match.heure,
      equipeDomicile: home,
      equipeExterieur: away,
      officiels: match.officiels,
      statut: StatutMatch.A_VENIR,
    },
  }
}
