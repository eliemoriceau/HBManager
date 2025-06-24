import hash from '@adonisjs/core/services/hash'
import { PasswordHasher } from '#auth/secondary/ports/password_hashing_interface'

export class HashPasswordHasher implements PasswordHasher {
  isValidHash(hashStr: string): boolean {
    return hash.isValidHash(hashStr)
  }
  async hash(plainPassword: string): Promise<string> {
    return hash.make(plainPassword)
  }

  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return hash.verify(hashedPassword, plainPassword)
  }
}
