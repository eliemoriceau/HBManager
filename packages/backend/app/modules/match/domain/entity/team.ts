import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'

interface Properties {
  id: Identifier
  nom: string
  codeFederal: string
  logo?: string
}

export default class Match extends Entity<Properties> {
  private constructor(props: Properties) {
    super(props)
  }

  get id(): Identifier {
    return super.id
  }

  get nom(): string {
    return this.props.nom
  }

  get codeFederal(): string {
    return this.props.codeFederal
  }

  get logo(): string | undefined {
    return this.props.logo
  }
}
