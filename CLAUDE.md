# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HBManager is a handball management application built as a monorepo with two main packages:

- **Frontend**: Vue.js 3 application
- **Backend**: AdonisJS 6 API server

The application follows Domain-Driven Design (DDD) principles with a hexagonal architecture (ports and adapters pattern) in both the frontend and backend.

## Common Commands

### Root Level Commands

```bash
# Install dependencies
yarn install

# Run both frontend and backend in development mode
yarn dev
```

### Frontend Commands

```bash
# Start development server
yarn workspace frontend dev

# Build for production
yarn workspace frontend build

# Run unit tests
yarn workspace frontend test:unit

# Run end-to-end tests
yarn workspace frontend test:e2e

# Lint and fix files
yarn workspace frontend lint

# Format code
yarn workspace frontend format

# Type-check
yarn workspace frontend type-check
```

### Backend Commands

```bash
# Start development server
yarn workspace backend dev

# Build for production
yarn workspace backend build

# Run all tests
yarn workspace backend test

# Run specific test files
yarn workspace backend test tests/unit/auth/domain/email.spec.ts

# Run tests with coverage
yarn workspace backend coverage

# Lint files
yarn workspace backend lint

# Format code
yarn workspace backend format

# Type-check
yarn workspace backend typecheck

# Create a migration
node ace make:migration migration_name

# Run migrations
node ace migration:run

# Rollback migrations
node ace migration:rollback

# Reset database
node ace migration:fresh
```

## Architecture Overview

### Backend Architecture

The backend follows a clean hexagonal architecture with DDD principles:

1. **Domain Layer**:
   - Entities: Core business objects with identity (`Match`, `Team`, `User`)
   - Value Objects: Immutable objects without identity (`Email`, `TeamName`)
   - Domain Exceptions: Business rule validations
   - Repository Interfaces: Define persistence contracts

2. **Application Layer**:
   - Use Cases: Orchestrate domain operations
   - Services: Coordinate complex domain operations
   - DTOs: Data transfer objects for external communication

3. **Infrastructure Layer**:
   - Primary Adapters: HTTP controllers, validators
   - Secondary Adapters: Database repositories, external services
   - Models: ORM models (Lucid)

4. **Module Structure**:
   Each module follows the same structure:
   ```
   module/
     ├── domain/            # Domain models, interfaces, rules
     ├── application/       # Use cases, services
     ├── primary/           # Input adapters (controllers)
     ├── secondary/         # Output adapters (repositories)
     ├── infrastructure/    # Technical implementations
     └── service/           # Module-specific services
   ```

### Frontend Architecture

The frontend also follows a clean architecture approach:

1. **Domain Layer**:
   - Models: Business objects (`User`, `Match`)
   - Repository Interfaces: Define data access contracts

2. **Application Layer**:
   - Services: Business logic independent of UI

3. **Infrastructure Layer**:
   - API Repositories: Implementations of repository interfaces
   - Auth Service: Handles authentication

4. **Presentation Layer**:
   - Vue Components: UI elements
   - Views: Page components
   - Pinia Stores: State management
   - Routing: Navigation and guards

5. **Module Structure**:
   ```
   module/
     ├── domain/            # Models and interfaces
     ├── application/       # Services
     ├── infrastructure/    # Repository implementations
     ├── presentation/      # UI components and views
     └── store/             # Pinia stores
   ```

## Key Development Patterns

1. **Repository Pattern**: All data access is through repositories
2. **Use Case Pattern**: Business operations are encapsulated in use cases
3. **Dependency Injection**: Services and repositories are injected
4. **Value Objects**: Encapsulate validation logic for simple values
5. **Rich Domain Model**: Business rules are in domain entities
6. **Command Query Responsibility Segregation (CQRS)**: Separate read and write operations

## Coding Standards

1. **Naming Conventions**:
   - Use camelCase for variables and methods
   - Use PascalCase for classes and interfaces
   - Use snake_case for database columns

2. **Error Handling**:
   - Create domain-specific exception classes
   - Use try/catch with async/await
   - Provide clear error messages

3. **Entities and Value Objects**:
   - Entities must have unique IDs and equality based on identity
   - Value objects must be immutable with equality based on all attributes
   - Validate inputs in constructors

4. **Repositories**:
   - Abstract interfaces in domain layer
   - Concrete implementations in infrastructure layer
   - Use adapter pattern for ORM-to-domain mapping

## Testing Strategy

1. **Backend Tests**:
   - Unit tests: Test domain logic in isolation
   - Functional tests: Test HTTP endpoints
   - Integration tests: Test repository implementations

2. **Frontend Tests**:
   - Unit tests: Test components and services
   - E2E tests: Test user flows with Playwright

3. **Test Best Practices**:
   - Use stubs and mocks to isolate components
   - Create factories or helpers for test objects
   - Clean database before/after tests
   - Test edge cases and error scenarios

## Performance Considerations

- Optimize N+1 queries with Lucid preloading
- Process data in batches when possible
- Use `PerformanceMeasurementService` to identify bottlenecks

## Security Guidelines

- Validate all user inputs with validators
- Avoid SQL injection by using Lucid parameterized queries
- Implement CSRF protections for forms
- Follow OWASP Top 10 principles

## Important Notes

1. Always run tests before submitting changes
2. Maintain the hexagonal architecture and DDD principles
3. Keep the frontend and backend models in sync
4. Use value objects for validation and encapsulation
5. Controllers should be thin and delegate to use cases
6. Use TypeScript for all new code
7. Document public methods with JSDoc comments
8. Implement robust error handling
9. Use dependency injection for all use cases and controllers