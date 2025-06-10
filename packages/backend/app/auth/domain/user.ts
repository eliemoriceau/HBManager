import { Email } from '#auth/domain/email'
import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import { Role, setRoles } from '#auth/domain/role'
import { PlainPassword } from '#auth/domain/plain_password'

interface Properties {
  id: Identifier
  email: Email
  password: PlainPassword
  roles: Role[]
}

export default class User extends Entity<Properties> {
  private constructor(props: Properties) {
    super(props)
  }

  static create(email: string, password: string, roles: string[]): User {
    return new User({
      id: Identifier.generate(),
      email: Email.fromString(email),
      roles: setRoles(roles as Role[]),
      password: PlainPassword.fromString(password),
    })
  }

  get email(): Email {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get roles() {
    return this.props.roles
  }
}
