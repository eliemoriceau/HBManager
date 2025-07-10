# Guidelines de développement - HBManager

Ce document définit les standards et pratiques à suivre pour le développement du projet HBManager, une application de gestion pour le handball.

## Architecture

Le projet suit les principes de **Domain-Driven Design (DDD)** et **Clean Architecture** avec la structure suivante :

### Structure des modules

Chaque module du projet doit suivre cette structure :

```
/app/modules/{module}
  /domain/              # Couche domaine (cœur métier)
    /entity/            # Entités et objets valeur
    /repository/        # Interfaces des repositories
    /service/           # Services métier
  /application/         # Couche application
    /dto/               # Objets de transfert de données
    /exception/         # Exceptions spécifiques
    /usecase/           # Cas d'utilisation
  /infrastructure/      # Couche infrastructure
    /http/              # Contrôleurs et validateurs HTTP
    /models/            # Modèles ORM (Lucid)
    /repository/        # Implémentations des repositories
```

## Standards de code

### Principes généraux

1. **Nomenclature** : Utiliser le camelCase pour les variables et méthodes, PascalCase pour les classes.
2. **Immutabilité** : Privilégier les structures de données immuables quand c'est possible.
3. **Type safety** : Toujours définir des types explicites, éviter `any`.
4. **Commentaires** : Documenter les méthodes publiques avec des commentaires JSDoc.

### Entities et Value Objects

- Les **entités** doivent être identifiées par un ID unique et avoir une méthode de comparaison d'égalité basée sur cet ID.
- Les **objets valeur** doivent être immutables et avoir une méthode de comparaison d'égalité basée sur tous leurs attributs.
- Toujours valider les entrées dans les constructeurs.

```typescript
// Exemple d'objet valeur
export class Nom extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  public static create(nom: string): Nom {
    if (!nom || nom.trim().length === 0) {
      throw new Error('Le nom ne peut pas être vide');
    }
    return new Nom({ value: nom.trim() });
  }

  toString() {
    return this.props.value;
  }
}
```

### Gestion des erreurs

- Créer des classes d'exception spécifiques au domaine pour faciliter la gestion des erreurs.
- Les exceptions doivent être claires et fournir suffisamment d'informations pour le débogage.
- Utiliser les mécanismes async/await avec try/catch pour la gestion des erreurs asynchrones.

```typescript
export default class InvalidMatchException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMatchException';
  }
}
```

### Repositories

- Les repositories doivent déclarer des interfaces abstraites dans la couche domaine.
- Les implémentations doivent être dans la couche infrastructure.
- Utiliser le motif "adapter" pour convertir entre les modèles Lucid et les entités du domaine.

```typescript
// Interface dans le domaine
export abstract class MatchRepository {
  abstract findAll(): Promise<Match[]>;
  abstract findById(id: string): Promise<Match | null>;
  abstract upsert(match: Match): Promise<void>;
  // ...
}

// Implémentation dans l'infrastructure
export class LucidMatchRepository extends MatchRepository {
  // ...
}
```

### Injection de dépendances

- Utiliser l'injection de dépendances d'AdonisJS pour tous les cas d'utilisation et contrôleurs.
- Injecter les dépendances via le constructeur.
- Configurer les bindings dans un fichier d'index par module.

```typescript
@inject()
export class GetMatch implements GetMatchUseCase {
  constructor(private readonly matchRepository: MatchRepository) {}
  
  async execute(id: string): Promise<MatchDetailsDto> {
    // ...
  }
}
```

## Tests

### Stratégie de test

1. **Tests unitaires** : Tester les entités, value objects et services du domaine en isolation.
2. **Tests d'intégration** : Tester les repositories avec une base de données de test.
3. **Tests fonctionnels** : Tester les API HTTP de bout en bout.

### Bonnes pratiques

- Utiliser des stubs et des mocks pour isoler les composants testés.
- Créer des factories ou helpers pour faciliter la création d'objets de test.
- Nettoyer la base de données avant/après chaque test avec `truncate()`.
- Tester les cas limites et les scénarios d'erreur.

```typescript
// Exemple de test
test('returns match with teams', async ({ assert }) => {
  const teamHome = createTeam(equipeHome, 'Home', 'C1');
  const teamAway = createTeam(equipeAway, 'Away', 'C2');
  const match = createMatch(teamHome, teamAway);
  const matchRepo = new StubMatchRepository([match]);
  const teamRepo = new StubTeamRepository([teamHome, teamAway]);
  const useCase = new GetMatch(matchRepo, teamRepo);

  const res = await useCase.execute(match.id.toString());

  assert.equal(res.match.id.toString(), match.id.toString());
  assert.equal(res.match.equipeDomicile.id, equipeHome);
  assert.equal(res.match.equipeExterieur.id, equipeAway);
});
```

## Gestion des données

### Base de données

- Utiliser des migrations pour toutes les modifications de schéma.
- Définir clairement les contraintes (NOT NULL, UNIQUE, etc.) dans les migrations.
- Nommer les colonnes de façon cohérente (utiliser des suffixes `_id` pour les clés étrangères).

### Robustesse

- Gérer les cas d'absence de données (null, undefined) avec des valeurs par défaut.
- Utiliser des vérifications défensives dans le code manipulant des données externes.
- Implémenter des mécanismes de récupération en cas d'erreur.

```typescript
// Exemple de code robuste avec valeurs par défaut
const equipeDomicile = model.equipeDomicile 
  ? Team.create({
      id: model.equipeDomicile.id.toString(),
      nom: model.equipeDomicile.nom,
      codeFederal: model.equipeDomicile.codeFederal?.toString(),
    })
  : createDefaultTeam(model.equipeDomicileId || '');
```

## Performance

- Optimiser les requêtes N+1 avec le preloading dans Lucid.
- Traiter les données en lots quand c'est possible (bulk inserts, etc.).
- Utiliser le service `PerformanceMeasurementService` pour identifier les goulots d'étranglement.

```typescript
// Exemple d'optimisation des requêtes N+1
const models = await MatchModel.query()
  .preload('equipeDomicile')
  .preload('equipeExterieur');
```

## Sécurité

- Valider toutes les entrées utilisateur avec des validateurs.
- Éviter les vulnérabilités d'injection SQL en utilisant les requêtes paramétrées de Lucid.
- Mettre en œuvre des protections CSRF pour les formulaires.
- Suivre les principes OWASP Top 10.

## Commandes utiles

- **Exécuter les tests** : `yarn test`
- **Vérifier la couverture de tests** : `yarn coverage`
- **Démarrer le serveur** : `node ace serve --watch`
- **Créer une migration** : `node ace make:migration nom_migration`
- **Exécuter les migrations** : `node ace migration:run`
- **Rollback des migrations** : `node ace migration:rollback`
- **Réinitialiser la base de données** : `node ace migration:fresh`

## Bonnes pratiques supplémentaires

1. **Commits Git** : Écrire des messages de commit clairs et descriptifs.
2. **Documentation** : Documenter les APIs et les composants importants.
3. **Revue de code** : Faire des revues de code pour maintenir la qualité.
4. **Refactoring régulier** : Refactoriser le code pour maintenir sa qualité et sa lisibilité.
5. **Logging** : Implémenter un logging approprié pour faciliter le débogage en production.

---

Ce document est vivant et sera mis à jour au fur et à mesure que le projet évolue.