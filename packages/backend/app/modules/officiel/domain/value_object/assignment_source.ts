import { ValueObject } from '#shared/domaine/value_object'

export enum AssignmentSourceEnum {
  FEDERATION_CSV = 'FEDERATION_CSV', // Import CSV fédéral
  CLUB_MANUAL = 'CLUB_MANUAL', // Assignation manuelle par club
  SYSTEM_AUTO = 'SYSTEM_AUTO', // Suggestion automatique
}

export class AssignmentSource extends ValueObject<{ source: AssignmentSourceEnum }> {
  private constructor(props: { source: AssignmentSourceEnum }) {
    super(props)
  }

  static create(source: AssignmentSourceEnum): AssignmentSource {
    return new AssignmentSource({ source })
  }

  static federation(): AssignmentSource {
    return new AssignmentSource({ source: AssignmentSourceEnum.FEDERATION_CSV })
  }

  static clubManual(): AssignmentSource {
    return new AssignmentSource({ source: AssignmentSourceEnum.CLUB_MANUAL })
  }

  static systemAuto(): AssignmentSource {
    return new AssignmentSource({ source: AssignmentSourceEnum.SYSTEM_AUTO })
  }

  get value(): AssignmentSourceEnum {
    return this.props.source
  }

  isFederation(): boolean {
    return this.props.source === AssignmentSourceEnum.FEDERATION_CSV
  }

  isClubManual(): boolean {
    return this.props.source === AssignmentSourceEnum.CLUB_MANUAL
  }

  requiresStrictValidation(): boolean {
    return this.isFederation()
  }

  toString(): string {
    return this.props.source
  }
}
