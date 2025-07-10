import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

interface OfficielProperties {
  id: Identifier
  nom: string
  prenom: string
  email: string
  telephone?: string
  clubId?: string
  qualifications: OfficielType[]
  disponibilites: Map<string, boolean> // date -> available
}

export class Officiel extends Entity<OfficielProperties> {
  private constructor(props: OfficielProperties) {
    super(props)
  }

  static create({
    id,
    nom,
    prenom,
    email,
    telephone,
    clubId,
    qualifications = [],
  }: {
    id?: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    clubId?: string
    qualifications?: OfficielTypeEnum[]
  }): Officiel {
    if (!nom || !prenom || !email) {
      throw new Error('Nom, prénom et email sont requis')
    }

    return new Officiel({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      nom,
      prenom,
      email,
      telephone,
      clubId,
      qualifications: qualifications.map((q) => OfficielType.create(q)),
      disponibilites: new Map(),
    })
  }

  get nom(): string {
    return this.props.nom
  }

  get prenom(): string {
    return this.props.prenom
  }

  get email(): string {
    return this.props.email
  }

  get telephone(): string | undefined {
    return this.props.telephone
  }

  get clubId(): string | undefined {
    return this.props.clubId
  }

  get nomComplet(): string {
    return `${this.props.prenom} ${this.props.nom}`
  }

  get qualifications(): OfficielType[] {
    return [...this.props.qualifications]
  }

  hasQualification(type: OfficielType): boolean {
    return this.props.qualifications.some((q) => q.equals(type))
  }

  addQualification(type: OfficielType): void {
    if (!this.hasQualification(type)) {
      this.props.qualifications.push(type)
    }
  }

  removeQualification(type: OfficielType): void {
    this.props.qualifications = this.props.qualifications.filter((q) => !q.equals(type))
  }

  setDisponibilite(date: string, available: boolean): void {
    this.props.disponibilites.set(date, available)
  }

  isAvailable(date: string): boolean {
    return this.props.disponibilites.get(date) ?? true
  }

  canAssignTo(type: OfficielType): boolean {
    return this.hasQualification(type)
  }

  get disponibilites(): Map<string, boolean> {
    return this.props.disponibilites
  }
}
