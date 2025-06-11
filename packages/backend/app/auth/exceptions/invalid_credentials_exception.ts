export class InvalidCredentialsException extends Error {
  constructor(message: string = 'Identifiants invalides') {
    super(message)
    this.name = 'InvalidCredentialsException'
  }
}
