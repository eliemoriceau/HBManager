# Module d'Upload CSV

Ce module permet aux utilisateurs ayant le rôle SECRETAIRE d'uploader des fichiers CSV contenant des données de matchs qui seront ensuite importées dans le système. Il suit les principes de Domain-Driven Design (DDD) et l'architecture hexagonale.

## Structure

Le module est organisé selon l'architecture hexagonale (ports et adaptateurs) avec les couches suivantes :

```
src/csvUpload/
├── domain/                    # Cœur du domaine (modèles, règles métier)
│   ├── model/                 # Entités et objets de valeur du domaine
│   └── repository/            # Interfaces (ports) pour les repositories
├── application/               # Cas d'utilisation / services d'application
├── infrastructure/            # Adaptateurs pour les dépendances externes
│   └── ApiCsvUploadRepository.ts  # Implémentation HTTP du repository
├── presentation/              # Interface utilisateur
│   ├── components/            # Composants Vue.js pour l'upload CSV
│   ├── views/                 # Pages Vue.js pour l'upload CSV
│   └── guards/                # Guards pour la protection par rôle
└── store/                     # State management avec Pinia
```

## Bounded Context

L'upload CSV est conçu comme un bounded context séparé dans l'application, avec une interface clairement définie pour interagir avec d'autres contextes.

## Modèle de domaine

- **CsvUpload** - Entité principale représentant un upload CSV
- **CsvUploadStatus** - Enum représentant les statuts possibles d'un upload
- **CsvUploadResult** - Objet de valeur pour le résultat d'un upload
- **CsvValidationError** - Objet de valeur pour les erreurs de validation CSV
- **CsvUploadReport** - Objet de valeur pour le rapport d'un upload CSV
- **CsvUploadProgress** - Objet de valeur pour le suivi de la progression d'un upload

## Application Service

Le service `CsvUploadService` encapsule les cas d'utilisation liés à l'upload CSV :
- Upload d'un fichier CSV
- Récupération des uploads
- Récupération des détails d'un upload
- Récupération du rapport d'un upload
- Suppression d'un upload

## Infrastructure

L'implémentation de l'interface `CsvUploadRepository` pour communiquer avec le backend :
- `ApiCsvUploadRepository` - Adaptateur HTTP pour les opérations d'upload CSV

## Présentation

Les composants Vue.js pour l'interface utilisateur d'upload CSV :
- `CsvDropzone` - Composant pour déposer ou sélectionner un fichier CSV
- `UploadItem` - Composant pour afficher les détails d'un upload CSV
- `CsvUploadView` - Page principale pour l'upload CSV
- `CsvUploadDetailsView` - Page de détails d'un upload CSV

## Store

Le state management avec Pinia qui expose l'état des uploads CSV à l'application :
- `useCsvUploadStore` - Store qui expose l'état des uploads CSV et les actions

## Protection par rôle

L'accès aux fonctionnalités d'upload CSV est protégé par un guard qui vérifie que l'utilisateur a le rôle SECRETAIRE :
- `requireSecretaryRole` - Guard qui redirige vers la page d'accueil si l'utilisateur n'a pas le rôle SECRETAIRE

## Routes

- `/csv-uploads` - Page principale pour l'upload CSV
- `/csv-uploads/:id` - Page de détails d'un upload CSV

## Validation des fichiers

La validation des fichiers CSV se fait à plusieurs niveaux :
1. Côté client : vérification de l'extension et du type MIME du fichier
2. Côté serveur : validation du contenu du fichier CSV

## Gestion des erreurs

Les erreurs sont gérées à différents niveaux :
1. Erreurs de validation client : affichées directement dans l'interface
2. Erreurs d'API : affichées dans des alertes
3. Erreurs de traitement du CSV : affichées dans le rapport d'upload