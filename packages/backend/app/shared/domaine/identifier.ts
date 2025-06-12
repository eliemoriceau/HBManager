import { ValueObject } from '#shared/domaine/value_object'
import { randomUUID } from 'node:crypto'

export class Identifier extends ValueObject<{ value: string }> {
  protected constructor(props: { value: string }) {
    super(props)
  }

  static generate(): Identifier {
    return new Identifier({ value: randomUUID() })
  }

  static fromString(value: string): Identifier {
    return new Identifier({ value })
  }

  toString(): string {
    return this.props.value
  }
}
