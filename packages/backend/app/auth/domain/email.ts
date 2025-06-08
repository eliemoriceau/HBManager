import { ValueObject } from '#shared/domaine/value_object'

const EMAIL_REGEX = new RegExp(
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/
)

export class Email extends ValueObject<{ value: string }> {
  static fromString(email: string): Email {
    if (!EMAIL_REGEX.test(email)) {
      throw new Error(`Email format invalid: ${email}`)
    }
    return new Email({ value: email.toLowerCase() })
  }
  get() {
    return this.props.value
  }
}
