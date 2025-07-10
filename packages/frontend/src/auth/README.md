# Module d'Authentification

Ce module gère l'authentification et l'autorisation des utilisateurs dans l'application Handball Manager, suivant les principes de Domain-Driven Design (DDD) et d'architecture hexagonale.

## Structure

Le module est organisé suivant l'architecture hexagonale (ports et adaptateurs) avec les couches suivantes :

```
src/auth/
├── domain/                  # Cœur du domaine (modèles, règles métier)
│   ├── model/               # Entités et objets de valeur du domaine
│   └── repository/          # Interfaces (ports) pour les repositories
├── application/             # Cas d'utilisation / services d'application
├── infrastructure/          # Adaptateurs pour les dépendances externes
│   └── ApiUserRepository.ts # Implémentation HTTP du repository
├── presentation/            # Interface utilisateur
│   ├── views/               # Composants Vue.js pour les pages d'authentification
│   └── guards/              # Guards pour les routes protégées
└── store/                   # State management avec Pinia
```

## Bounded Context

L'authentification est conçue comme un bounded context séparé dans l'application, avec une interface clairement définie pour interagir avec d'autres contextes.

## Modèle de domaine

- **User** - Entité principale représentant un utilisateur authentifié
- **UserRole** - Enum représentant les rôles disponibles
- **UserCredentials** - Objet de valeur pour les identifiants d'authentification
- **UserRegistrationData** - Objet de valeur pour les données d'inscription
- **AuthResult** - Objet de valeur représentant le résultat d'une authentification

## Application Service

Le service `AuthService` encapsule les cas d'utilisation liés à l'authentification :
- Login
- Register 
- Logout
- Token refresh
- Gestion des jetons JWT

## Infrastructure

L'implémentation de l'interface `UserRepository` pour communiquer avec le backend :
- `ApiUserRepository` - Adaptateur HTTP pour les opérations d'authentification

## Présentation

Les composants Vue.js pour l'interface utilisateur d'authentification :
- `LoginView` - Page de connexion
- `RegisterView` - Page d'inscription

## Store

Le state management avec Pinia qui expose l'état d'authentification à l'application :
- `useAuthStore` - Store qui expose l'état d'authentification et les actions

## Flux d'authentification

1. L'utilisateur accède à `/login` ou `/register`
2. Après une authentification réussie, l'utilisateur est redirigé vers la page demandée
3. Les jetons sont stockés dans le localStorage
4. Les requêtes API ultérieures incluent le jeton dans l'en-tête Authorization
5. Le jeton est automatiquement rafraîchi lorsqu'il expire

## Sécurité

- Les jetons sont stockés dans le localStorage
- Le système utilise un jeton d'accès de courte durée et un jeton de rafraîchissement de longue durée
- Les mots de passe ne sont jamais stockés côté client
- La validation des entrées est effectuée côté client et côté serveur