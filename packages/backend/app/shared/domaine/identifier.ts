import { ValueObject } from '#shared/domaine/value_object'
import { randomUUID } from 'node:crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class Identifier extends ValueObject<{ value: string }> {
  protected constructor(props: { value: string }) {
    super(props)
  }

  static generate(): Identifier {
    return new Identifier({ value: randomUUID() })
  }

  static fromString(value: string): Identifier {
    if (!UUID_REGEX.test(value)) {
      throw new Error(`Invalid UUID: ${value}`)
    }
    return new Identifier({ value })
  }

  toString(): string {
    return this.props.value
  }
}
