import { Email } from '#auth/domain/email'
import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import { Role, setRoles } from '#auth/domain/role'
import { PlainPassword } from '#auth/domain/plainPassword'

interface properties {
  id: Identifier
  email: Email
  password: PlainPassword
  roles: Role[]
}

export default class User extends Entity<properties> {
  private constructor(props: properties) {
    super(props)
  }

  static create(email: string, password: string, roles: string[]): User {
    return new User({
      id: Identifier.generate(),
      email: Email.fromString(email),
      roles: setRoles(roles),
      password: PlainPassword.fromString(password),
    })
  }
}
