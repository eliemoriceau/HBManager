import { Identifier } from '#shared/domaine/identifier'

export abstract class Entity<TProperties extends { id: Identifier }> {
  readonly props: TProperties
  protected constructor(props: TProperties) {
    this.props = props
  }

  equals(object: Entity<TProperties>): boolean {
    if (object === this) {
      return true
    }

    return this.getIdentifier().equals(object.getIdentifier()) || false
  }

  private getIdentifier() {
    return this.props.id
  }
}
