import { ValueObject } from '#shared/domaine/value_object'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'

export class FederalCode extends ValueObject<{ value: string }> {
  private static registry = new Set<string>()

  private constructor(props: { value: string }) {
    const code = props.value?.trim()
    if (!code) {
      throw new InvalidTeamException('Le code féd\u00e9ral est requis')
    }
    if (FederalCode.registry.has(code)) {
      throw new InvalidTeamException('Code féd\u00e9ral déjà utilis\u00e9')
    }
    super({ value: code })
    FederalCode.registry.add(code)
  }

  static fromString(value: string): FederalCode {
    return new FederalCode({ value })
  }

  static reset() {
    FederalCode.registry.clear()
  }

  toString(): string {
    return this.props.value
  }
}
