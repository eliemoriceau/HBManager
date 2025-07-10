import { UserRepository } from '../domain/repository/UserRepository'
import { AuthResult, User, UserCredentials, UserRegistrationData } from '../domain/model/User'

/**
 * API implementation of the UserRepository interface
 * This is an adapter in the Hexagonal Architecture that connects to the backend API
 */
export class ApiUserRepository implements UserRepository {
  private apiBaseUrl: string = '/api/auth' // This would be configured from environment

  /**
   * Authenticate a user with the API
   */
  async authenticate(credentials: UserCredentials): Promise<AuthResult | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        if (response.status === 401) {
          return null // Invalid credentials
        }
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const data = await response.json()
      return this.mapToAuthResult(data)
    } catch (error) {
      console.error('Authentication error:', error)
      throw error
    }
  }

  /**
   * Register a new user with the API
   */
  async register(data: UserRegistrationData): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const responseData = await response.json()
      return this.mapToAuthResult(responseData)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      return this.mapToAuthResult(data)
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      return null
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          return null
        }
        throw new Error('Failed to get current user')
      }

      const data = await response.json()
      return this.mapToUser(data.user)
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      return
    }

    try {
      await fetch(`${this.apiBaseUrl}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Map API response to AuthResult domain model
   */
  private mapToAuthResult(data: any): AuthResult {
    return {
      user: this.mapToUser(data.user),
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: new Date(data.expiresAt),
    }
  }

  /**
   * Map API user data to User domain model
   */
  private mapToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
      isActive: data.isActive,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }
  }
}
