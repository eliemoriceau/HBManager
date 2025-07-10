import { ValueObject } from '#shared/domaine/value_object'

export enum OfficielTypeEnum {
  // Officiels obligatoires
  SECRETAIRE = 'SECRETAIRE',
  CHRONOMETREUR = 'CHRONOMETREUR',
  RESPONSABLE_SALLE = 'RESPONSABLE_SALLE',

  // Officiels facultatifs
  TUTEUR_TABLE = 'TUTEUR_TABLE',
  TUTEUR_JUGE_ARBITRE = 'TUTEUR_JUGE_ARBITRE',

  // Arbitres
  ARBITRE_PRINCIPAL = 'ARBITRE_PRINCIPAL',
  ARBITRE_ASSISTANT = 'ARBITRE_ASSISTANT',
}

export class OfficielType extends ValueObject<{ type: OfficielTypeEnum }> {
  private constructor(props: { type: OfficielTypeEnum }) {
    super(props)
  }

  static create(type: OfficielTypeEnum): OfficielType {
    return new OfficielType({ type })
  }

  static fromString(type: string): OfficielType {
    const enumValue = Object.values(OfficielTypeEnum).find((v) => v === type)
    if (!enumValue) {
      throw new Error(`Type d'officiel invalide: ${type}`)
    }
    return new OfficielType({ type: enumValue })
  }

  get value(): OfficielTypeEnum {
    return this.props.type
  }

  isRequired(): boolean {
    return [
      OfficielTypeEnum.SECRETAIRE,
      OfficielTypeEnum.CHRONOMETREUR,
      OfficielTypeEnum.RESPONSABLE_SALLE,
      OfficielTypeEnum.ARBITRE_PRINCIPAL,
    ].includes(this.props.type)
  }

  isArbitre(): boolean {
    return [OfficielTypeEnum.ARBITRE_PRINCIPAL, OfficielTypeEnum.ARBITRE_ASSISTANT].includes(
      this.props.type
    )
  }

  toString(): string {
    return this.props.type
  }
}
