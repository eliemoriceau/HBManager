/**
 * User entity - Core domain model for the Authentication bounded context
 */
export interface User {
  id: string
  email: string
  // firstName: string;
  // lastName: string;
  roles: UserRole[]
  // isActive: boolean;
  // createdAt: Date;
  // updatedAt: Date;
}

/**
 * Available user roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OFFICIAL = 'OFFICIAL',
  USER = 'USER',
}

/**
 * Value object for user credentials used during authentication
 */
export interface UserCredentials {
  email: string
  password: string
}

/**
 * Value object for user registration data
 */
export interface UserRegistrationData {
  email: string
  password: string
  firstName: string
  lastName: string
}

/**
 * Authentication result containing user and token information
 */
export interface AuthResult {
  user: User
  token: string
  refreshToken?: string
  expiresAt?: Date
}
