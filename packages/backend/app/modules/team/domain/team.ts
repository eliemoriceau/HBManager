import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import { TeamName } from '#team/domain/team_name'
import { FederalCode } from '#team/domain/federal_code'

interface Properties {
  id: Identifier
  nom: TeamName
  codeFederal?: FederalCode
  logo?: string
}

export default class Team extends Entity<Properties> {
  private constructor(props: Properties) {
    super(props)
  }

  static create({
    id,
    nom,
    codeFederal,
    logo,
  }: {
    id?: string
    nom: string
    codeFederal?: string
    logo?: string
  }): Team {
    const codeFederalValue = codeFederal ? FederalCode.fromString(codeFederal) : undefined
    return new Team({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      nom: TeamName.fromString(nom),
      codeFederal: codeFederalValue,
      logo,
    })
  }

  get nom() {
    return this.props.nom
  }

  get codeFederal() {
    return this.props.codeFederal
  }

  get logo() {
    return this.props.logo
  }
}
