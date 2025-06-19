# HBManager

**HBManager** est une plateforme web de gestion des matchs de handball destinée aux clubs, permettant d'importer automatiquement les plannings, d'organiser les rencontres, d'affecter les équipes et officiels, et d'envoyer des notifications.

## 📖 Table des matières

* [Description](#description)
* [Fonctionnalités](#fonctionnalités)
* [Technologies](#technologies)
* [Prérequis](#prérequis)
* [Installation](#installation)
* [Usage](#usage)
* [Structure du projet](#structure-du-projet)
* [Documentation](#documentation)
* [Contribuer](#contribuer)
* [Licence](#licence)

## Description

HBManager facilite l'organisation des matchs de handball au sein des clubs en proposant :

* **Import CSV** : ingestion automatique des rencontres via un fichier CSV conforme à la fédération. Un modèle est fourni dans `docs/csv_template.csv`.
* **Calendrier interactif** : affichage des matchs passés et à venir, avec filtres par équipe, date et officiel.
* **Gestion des équipes** : association domicile/extérieur pour chaque match.
* **Gestion des officiels** : enregistrement et affectation des arbitres, scoreurs, chronométreurs.
* **Notifications** : envoi d’e-mails ou de notifications internes pour prévenir les officiels de leurs désignations.

## Fonctionnalités

1. Importer et valider un fichier CSV de planning
2. Ajouter, modifier ou supprimer manuellement une rencontre
3. Visualiser le calendrier mensuel et hebdomadaire
4. Assigner les équipes à chaque match (domicile / extérieur)
5. Enregistrer et affecter les officiels (arbitres, scoreurs, chronométreurs)
6. Notifier automatiquement les officiels par e-mail/SMS
7. Gestion des rôles et permissions (secrétaire, entraîneur, arbitre, communication)
8. Internationalisation (format date/heure local)

## Technologies

* **Backend** : AdonisJS (TypeScript)
* **Frontend** : Vue 3 + TailwindCSS
* **Base de données** : PostgreSQL
* **Cache** : Redis
* **Containerisation** : Docker & Docker Compose
* **CI/CD** : GitHub Actions (ESLint, Prettier, Jest, CodeQL)

## Prérequis

* Docker & Docker Compose
* Node.js (>= 16) et npm/yarn
* Accès à un cluster PostgreSQL (local via Docker ou distant)

## Installation

1. Cloner le dépôt :

   ```bash
   git clone https://github.com/mon-org/hbmanager.git
   cd hbmanager
   ```
2. Copier les variables d’environnement :

   ```bash
   cp .env.example .env
   ```
3. Lancer les services avec Docker Compose :

   ```bash
   docker-compose up --build
   ```

## Usage

* **Frontend** : `http://localhost:3000`
* **Backend** : `http://localhost:3333`

### Scripts utiles

* `npm run dev` : démarre frontend et backend en mode développement
* `npm run build` : génère les bundles de production
* `npm test` : lance les tests unitaires
* `npm run lint` : analyse le code (ESLint + Prettier)

## Structure du projet

```
├── .github/               # Configuration GitHub (CI, templates)
├── docs/                  # Cahier des charges & spécifications
│   ├── cahier_des_charges.md
│   └── architecture/
├── src/
│   ├── backend/           # AdonisJS + TypeScript
│   └── frontend/          # Vue 3 + TailwindCSS
├── docker-compose.yml     # Orchestration des conteneurs
├── Dockerfile             # Container backend
├── .env.example           # Variables d'environnement
├── README.md              # Document d'accueil
└── CONTRIBUTING.md        # Guide de contribution
```

## Documentation

Tous les livrables (cahier des charges, diagrammes, use cases) se trouvent dans le dossier [`docs/`](./docs).

## Contribuer

Merci de votre intérêt pour HBManager ! Pour contribuer :

1. Fork du projet
2. Créer une branche : `git checkout -b feature/mon-ajout`
3. Commit & push vos modifications
4. Ouvrir une Pull Request en décrivant les changements et critères d’acceptation

Consultez le fichier [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus de détails.

## Licence

Ce projet est sous licence [MIT](./LICENSE.md).
