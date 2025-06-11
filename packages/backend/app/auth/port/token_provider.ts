export type TokenPayload = Record<string, unknown>

export default abstract class TokenProvider {
  /**
   * Génère un JWT à partir du payload fourni.
   * @param payload Données à inclure dans le token.
   * @returns Chaîne encodée du JWT.
   */
  abstract generate(payload: TokenPayload): string

  /**
   * Vérifie et décode un JWT.
   * @param token Chaîne du JWT à vérifier.
   * @throws TokenInvalidError si le token n’est pas valide.
   * @throws TokenExpiredError si le token est expiré.
   * @returns Payload décodé.
   */
  abstract verify(token: string): TokenPayload
}
