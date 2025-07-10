import { UserRepository } from '../domain/repository/UserRepository'
import { AuthResult, User, UserCredentials, UserRegistrationData } from '../domain/model/User'

/**
 * Authentication service that implements use cases for the Authentication bounded context
 * Acts as a facade for authentication operations in the application layer
 */
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Login use case
   * @param credentials User credentials
   * @returns Authentication result
   * @throws Error if authentication fails
   */
  async login(credentials: UserCredentials): Promise<AuthResult> {
    const result = await this.userRepository.authenticate(credentials)

    if (!result) {
      throw new Error('Invalid email or password')
    }

    this.storeTokens(result)
    return result
  }

  /**
   * Register use case
   * @param userData User registration data
   * @returns Authentication result
   * @throws Error if registration fails
   */
  async register(userData: UserRegistrationData): Promise<AuthResult> {
    const result = await this.userRepository.register(userData)
    this.storeTokens(result)
    return result
  }

  /**
   * Logout use case
   */
  async logout(): Promise<void> {
    await this.userRepository.logout()
    this.clearTokens()
  }

  /**
   * Get current user use case
   * @returns Current user or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    return this.userRepository.getCurrentUser()
  }

  /**
   * Check if user is authenticated
   * @returns True if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    const expiresAt = localStorage.getItem('auth_expires_at')

    if (!token || !expiresAt) {
      return false
    }

    return new Date(expiresAt) > new Date()
  }

  /**
   * Refresh token use case
   * @returns New authentication result
   * @throws Error if token refresh fails
   */
  async refreshToken(): Promise<AuthResult> {
    const refreshToken = localStorage.getItem('auth_refresh_token')

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const result = await this.userRepository.refreshToken(refreshToken)
    this.storeTokens(result)
    return result
  }

  /**
   * Store authentication tokens in local storage
   * @param authResult Authentication result
   */
  private storeTokens(authResult: AuthResult): void {
    localStorage.setItem('auth_token', authResult.token)
    localStorage.setItem('auth_refresh_token', authResult.refreshToken)
    localStorage.setItem('auth_expires_at', authResult.expiresAt.toISOString())
  }

  /**
   * Clear authentication tokens from local storage
   */
  private clearTokens(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_expires_at')
  }
}
