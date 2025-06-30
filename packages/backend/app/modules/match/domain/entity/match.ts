import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import InvalidMatchException from '#match/application/exception/invalid_match_exception'
import InvalidMatchStateException from '#match/application/exception/invalid_match_state_exception'
import { allowedTransitions, allStatutMatch, StatutMatch } from '#match/domain/entity/statut_match'
import { DateTime } from 'luxon'
import Team from '#team/domain/team'

interface Properties {
  id: Identifier
  codeRenc: string
  date: DateTime
  heure: string
  equipeDomicile: Team
  equipeExterieur: Team
  officiels: string[]
  statut: StatutMatch
  motifAnnulation?: string
  motifReport?: string
  scoreDomicile?: number
  scoreExterieur?: number
}

export default class Match extends Entity<Properties> {
  private constructor(props: Properties) {
    super(props)
  }

  static create({
    id,
    date,
    heure,
    equipeDomicile,
    equipeExterieur,
    officiels,
    statut,
    codeRenc,
  }: {
    id?: string
    codeRenc: string
    date: DateTime
    heure: string
    equipeDomicile: Team
    equipeExterieur: Team
    officiels?: string[]
    statut?: StatutMatch
  }): Match {
    if (!date || !date.isValid) {
      throw new InvalidMatchException('Date du match invalide')
    }

    if (!heure || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(heure)) {
      throw new InvalidMatchException('Heure du match invalide')
    }

    if (!equipeDomicile || !equipeExterieur) {
      throw new InvalidMatchException("Les identifiants d'\u00e9quipe sont requis")
    }

    if (equipeDomicile === equipeExterieur) {
      throw new InvalidMatchException('Les équipes doivent être différentes')
    }

    return new Match({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      date,
      heure,
      equipeDomicile: equipeDomicile,
      equipeExterieur: equipeExterieur,
      officiels: (officiels ?? []).map((o) => o),
      statut: statut ?? StatutMatch.A_VENIR,
      codeRenc,
    })
  }

  get date() {
    return this.props.date
  }

  get heure() {
    return this.props.heure
  }

  get equipeDomicile() {
    return this.props.equipeDomicile
  }

  get equipeExterieur() {
    return this.props.equipeExterieur
  }

  get officiels() {
    return this.props.officiels
  }

  get statut() {
    return this.props.statut
  }
  get codeRenc() {
    return this.props.codeRenc
  }
  changerStatut(nouveauStatut: StatutMatch) {
    if (!allStatutMatch.has(nouveauStatut)) {
      throw new InvalidMatchStateException(`Statut inconnu : ${nouveauStatut}`)
    }

    const autorises = allowedTransitions[this.props.statut] || []
    if (!autorises.includes(nouveauStatut)) {
      throw new InvalidMatchStateException(
        `Transition de ${this.props.statut} vers ${nouveauStatut} interdite`
      )
    }

    this.props.statut = nouveauStatut
  }

  affecterOfficiels(officiels: string[]) {
    if (!officiels || officiels.length === 0) {
      throw new InvalidMatchStateException('La liste des officiels est vide')
    }

    const uniques = Array.from(new Set(officiels))
    this.props.officiels = uniques.map((o) => o)
  }

  private validateDateHeure(date: DateTime, heure: string) {
    if (!date || !date.isValid) {
      throw new InvalidMatchStateException('Date du match invalide')
    }
    if (!heure || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(heure)) {
      throw new InvalidMatchStateException('Heure du match invalide')
    }
  }

  modifierHoraire(nouvelleDate: DateTime, nouvelleHeure: string) {
    this.validateDateHeure(nouvelleDate, nouvelleHeure)
    this.props.date = nouvelleDate
    this.props.heure = nouvelleHeure
    this.props.motifReport = undefined
    if (this.props.statut !== StatutMatch.A_VENIR) {
      this.changerStatut(StatutMatch.A_VENIR)
    }
  }

  annulerMatch(motif: string) {
    if (!motif || motif.trim().length === 0) {
      throw new InvalidMatchStateException('Le motif est requis pour annuler')
    }
    this.props.motifAnnulation = motif
    this.changerStatut(StatutMatch.ANNULE)
  }

  reporterMatch(nouvelleDate: DateTime, nouvelleHeure: string, motif: string) {
    if (!motif || motif.trim().length === 0) {
      throw new InvalidMatchStateException('Le motif est requis pour reporter')
    }
    this.validateDateHeure(nouvelleDate, nouvelleHeure)
    this.props.date = nouvelleDate
    this.props.heure = nouvelleHeure
    this.props.motifReport = motif
    this.changerStatut(StatutMatch.REPORTE)
  }

  demarrerMatch() {
    if (![StatutMatch.A_VENIR, StatutMatch.REPORTE].includes(this.props.statut)) {
      throw new InvalidMatchStateException(
        `Impossible de démarrer le match depuis le statut ${this.props.statut}`
      )
    }

    const [h, m] = this.props.heure.split(':').map((v) => Number(v))
    const datetime = DateTime.fromJSDate(this.props.date.toJSDate())

    if (datetime.plus({ hours: h, minute: m }) > DateTime.now()) {
      throw new InvalidMatchStateException("L'heure de début du match n'est pas encore atteinte")
    }

    this.changerStatut(StatutMatch.EN_COURS)
  }

  terminerMatch(scoreDomicile: number, scoreExterieur: number) {
    if (this.props.statut !== StatutMatch.EN_COURS) {
      throw new InvalidMatchStateException('Le match doit être en cours pour être terminé')
    }
    if (
      scoreDomicile === undefined ||
      scoreExterieur === undefined ||
      scoreDomicile < 0 ||
      scoreExterieur < 0
    ) {
      throw new InvalidMatchStateException('Scores invalides')
    }

    this.props.scoreDomicile = scoreDomicile
    this.props.scoreExterieur = scoreExterieur
    this.changerStatut(StatutMatch.TERMINE)
  }
}
