export class TokenExpiredError extends Error {
  constructor(message = 'Token expiré') {
    super(message)
    this.name = 'TokenExpiredError'
  }
}
