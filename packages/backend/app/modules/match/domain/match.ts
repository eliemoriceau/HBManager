import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import InvalidMatchException from '#match/exceptions/invalid_match_exception'
import InvalidMatchStateException from '#match/exceptions/invalid_match_state_exception'
import { StatutMatch, allStatutMatch, allowedTransitions } from '#match/domain/statut_match'

interface Properties {
  id: Identifier
  date: Date
  heure: string
  equipeDomicileId: Identifier
  equipeExterieurId: Identifier
  officiels: Identifier[]
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
    equipeDomicileId,
    equipeExterieurId,
    officiels,
    statut,
  }: {
    id?: string
    date: Date
    heure: string
    equipeDomicileId: string
    equipeExterieurId: string
    officiels?: string[]
    statut?: StatutMatch
  }): Match {
    if (!date || Number.isNaN(date.getTime())) {
      throw new InvalidMatchException('Date du match invalide')
    }

    if (!heure || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(heure)) {
      throw new InvalidMatchException('Heure du match invalide')
    }

    if (!equipeDomicileId || !equipeExterieurId) {
      throw new InvalidMatchException("Les identifiants d'\u00e9quipe sont requis")
    }

    if (equipeDomicileId === equipeExterieurId) {
      throw new InvalidMatchException('Les équipes doivent être différentes')
    }

    return new Match({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      date,
      heure,
      equipeDomicileId: Identifier.fromString(equipeDomicileId),
      equipeExterieurId: Identifier.fromString(equipeExterieurId),
      officiels: (officiels ?? []).map((o) => Identifier.fromString(o)),
      statut: statut ?? StatutMatch.A_VENIR,
    })
  }

  get date() {
    return this.props.date
  }

  get heure() {
    return this.props.heure
  }

  get equipeDomicileId() {
    return this.props.equipeDomicileId
  }

  get equipeExterieurId() {
    return this.props.equipeExterieurId
  }

  get officiels() {
    return this.props.officiels
  }

  get statut() {
    return this.props.statut
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
    this.props.officiels = uniques.map((o) => Identifier.fromString(o))
  }

  private validateDateHeure(date: Date, heure: string) {
    if (!date || Number.isNaN(date.getTime())) {
      throw new InvalidMatchStateException('Date du match invalide')
    }
    if (!heure || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(heure)) {
      throw new InvalidMatchStateException('Heure du match invalide')
    }

    const [h, m] = heure.split(':').map((v) => Number(v))
    const datetime = new Date(date)
    datetime.setHours(h, m, 0, 0)
    if (datetime.getTime() <= Date.now()) {
      throw new InvalidMatchStateException('La date doit être future')
    }
  }

  modifierHoraire(nouvelleDate: Date, nouvelleHeure: string) {
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

  reporterMatch(nouvelleDate: Date, nouvelleHeure: string, motif: string) {
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
    const datetime = new Date(this.props.date)
    datetime.setHours(h, m, 0, 0)
    if (datetime.getTime() > Date.now()) {
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
