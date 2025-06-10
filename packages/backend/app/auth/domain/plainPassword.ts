import { ValueObject } from '#shared/domaine/value_object'
import InvalidPasswordException from '#auth/exceptions/invalidPasswordException'

export class PlainPassword extends ValueObject<{ value: string }> {
  private constructor(value: { value: string }) {
    if (!value) {
      throw new InvalidPasswordException('Le mot de passe ne peut pas être vide')
    }
    super(value)
  }

  static fromString(value: string): PlainPassword {
    return new PlainPassword({ value })
  }

  toString(): string {
    return this.props.value
  }
}
