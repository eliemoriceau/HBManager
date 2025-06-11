import { TokenInvalidError } from '#auth/exceptions/token_invalid_error'
import TokenProvider, { TokenPayload } from '#auth/secondary/ports/token_provider'

/**
 * Stub pour les tests unitaires.
 * Simule un TokenProvider sans logique réelle de JWT.
 */
export class StubTokenProvider extends TokenProvider {
  private readonly _stubPayload: TokenPayload
  private readonly _stubToken: string

  constructor(stubPayload: TokenPayload = {}, stubToken = 'stub-token') {
    super()
    this._stubPayload = stubPayload
    this._stubToken = stubToken
  }

  generate(_payload: TokenPayload): string {
    // Retourne toujours la même chaîne pour faciliter les assertions
    return this._stubToken
  }

  verify(token: string): TokenPayload {
    if (token !== this._stubToken) {
      throw new TokenInvalidError()
    }
    return this._stubPayload
  }
}
