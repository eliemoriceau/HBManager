import { PasswordHasher } from '#auth/secondary/ports/password_hashing_interface'

export class StubPasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `hashed_${plainPassword}`
  }

  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return hashedPassword === `hashed_${plainPassword}`
  }
}
