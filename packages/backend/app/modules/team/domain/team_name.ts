import { ValueObject } from '#shared/domaine/value_object'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'

export class TeamName extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    if (!props.value || props.value.trim().length === 0) {
      throw new InvalidTeamException("Le nom d'équipe est requis")
    }
    super({ value: props.value.trim() })
  }

  static fromString(value: string): TeamName {
    return new TeamName({ value })
  }

  toString(): string {
    return this.props.value
  }
}
