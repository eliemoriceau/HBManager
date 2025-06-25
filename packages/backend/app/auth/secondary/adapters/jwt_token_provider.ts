import jwt from 'jsonwebtoken'
import env from '#start/env'
import TokenProvider, { TokenPayload } from '#auth/secondary/ports/token_provider'
import { TokenInvalidError } from '#auth/exceptions/token_invalid_error'
import { TokenExpiredError } from '#auth/exceptions/token_expired_error'

export class JwtTokenProvider extends TokenProvider {
  private readonly secret: string
  private readonly expiresIn: string

  constructor() {
    super()
    this.secret = env.get('JWT_SECRET')
    this.expiresIn = env.get('JWT_EXPIRES_IN')
  }

  generate(payload: TokenPayload): string {
    // @ts-ignore
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn })
  }

  verify(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError()
      }
      throw new TokenInvalidError()
    }
  }
}
