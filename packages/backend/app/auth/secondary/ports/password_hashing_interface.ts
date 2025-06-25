export abstract class PasswordHasher {
  abstract hash(plainPassword: string): Promise<string>
  abstract verify(plainPassword: string, hashedPassword: string): Promise<boolean>
  abstract isValidHash(hash: string): boolean
}
