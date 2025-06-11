export class TokenInvalidError extends Error {
  constructor(message = 'Token invalide') {
    super(message)
    this.name = 'TokenInvalidError'
  }
}
