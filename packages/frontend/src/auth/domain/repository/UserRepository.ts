import { AuthResult, User, UserCredentials, UserRegistrationData } from '../model/User'

/**
 * Repository interface for User entity in the Authentication bounded context
 * Following the Hexagonal Architecture / Ports & Adapters pattern
 */
export interface UserRepository {
  /**
   * Authenticate a user with email and password
   * @param credentials User credentials
   * @returns Authentication result or null if authentication fails
   */
  authenticate(credentials: UserCredentials): Promise<AuthResult | null>

  /**
   * Register a new user
   * @param data User registration data
   * @returns Authentication result with the newly created user
   * @throws Error if registration fails (e.g., email already exists)
   */
  register(data: UserRegistrationData): Promise<AuthResult>

  /**
   * Refresh the authentication token
   * @param refreshToken Current refresh token
   * @returns New authentication result
   * @throws Error if token refresh fails
   */
  refreshToken(refreshToken: string): Promise<AuthResult>

  /**
   * Get the current authenticated user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): Promise<User | null>

  /**
   * Logout the current user
   */
  logout(): Promise<void>
}
