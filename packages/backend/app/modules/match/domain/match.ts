import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'

interface Properties {
  id: Identifier
  date: Date
  heure: string
  equipeDomicileId: Identifier
  equipeExterieurId: Identifier
  officiels: Identifier[]
  statut: string
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
    statut?: string
  }): Match {
    return new Match({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      date,
      heure,
      equipeDomicileId: Identifier.fromString(equipeDomicileId),
      equipeExterieurId: Identifier.fromString(equipeExterieurId),
      officiels: (officiels ?? []).map((o) => Identifier.fromString(o)),
      statut: statut ?? 'À venir',
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
}
