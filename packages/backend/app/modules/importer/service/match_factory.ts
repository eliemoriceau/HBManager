import Match from '#match/domain/entity/match'
import Team from '#team/domain/team'
import { StatutMatch } from '#match/domain/entity/statut_match'
import { DateTime } from 'luxon'

function parseDate(value: string): DateTime {
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return DateTime.fromFormat(trimmed, 'yyyy-MM-dd')
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return DateTime.fromFormat(trimmed, 'dd/MM/yyyy')
  }
  throw new Error(`Format de date invalide: ${value}`)
}

function parseTime(value: string): string {
  const parts = value.trim().split(' ')
  const time = parts[parts.length - 1]
  const [h, m] = time.split(':')
  if (!h || !m) {
    throw new Error(`Heure invalide: ${value}`)
  }
  return `${h}:${m}`
}

export class MatchFactory {
  static fromCsvLine(line: Record<string, string>) {
    return Match.create({
      codeRenc: line['code renc'].trim(),
      date: parseDate(line['le']),
      heure: parseTime(line['horaire']),
      equipeDomicile: Team.create({ nom: line['club rec'].trim() }),
      equipeExterieur: Team.create({ nom: line['club vis'].trim() }),
      officiels: [line['arb1 designe'], line['arb2 designe']].filter(Boolean),
      statut: StatutMatch.A_VENIR,
    })
  }
}
