# Guide pour l'agent IA (Codex) sur le projet HBManager

## Contexte du projet

Le projet HBManager vise à faciliter la gestion et l’organisation des matchs de handball pour les clubs, en automatisant la récupération des données de matchs, la gestion des calendriers interactifs, la désignation des officiels, et la communication des événements.

## Rôles clés et personas

1. **Secrétaire de club**

    * Importation et gestion des fichiers CSV fédéraux.
    * Gestion des matchs et des désignations d'officiels.
    * Export des données pour communication externe.

2. **Entraîneur**

    * Consultation du planning par équipe.
    * Notifications en temps réel sur les modifications de planning.
    * Gestion simplifiée via mobile.

3. **Arbitre**

    * Désignation, confirmation et suivi des matchs.
    * Gestion des disponibilités et notifications automatiques.

4. **Responsable communication**

    * Génération et validation des visuels pour publication.
    * Exportation et intégration des calendriers pour diffusion sur les médias sociaux et le site du club.

## Use cases prioritaires

* Importation automatisée des plannings depuis des fichiers CSV.
* Gestion manuelle complémentaire des matchs.
* Assignation et notification des officiels.
* Exportation automatique des données pour communication (formats CSV, JSON, PDF).

## Stack technique recommandée

### Backend

* **Langage/Framework** : TypeScript avec AdonisJS v6
* **Base de données** : PostgreSQL 17
* **ORM** : Lucid
* **Stockage** : Configurable entre AWS S3 et Google Drive
* **Conteneurisation** : Docker (docker-compose)

### Frontend

* **Framework** : Vue 3 avec TypeScript
* **Calendrier interactif** : Schedule-X
* **CSS** : Tailwind CSS

### CI/CD et monitoring

* **Gestion du code** : Trunk-based sur GitHub
* **CI/CD** : GitHub Actions (build, test, déploiement automatique)
* **Monitoring et Logs** : OpenTelemetry, Grafana Loki

## Contraintes techniques

* Conformité RGPD : gestion stricte des données personnelles
* Authentification sécurisée : RBAC, JWT, MFA optionnel pour admins
* Sécurité opérationnelle : TLS, chiffrement au repos et en transit

## Consignes spécifiques à Codex

### Génération de code

* Générer des modules selon l’architecture hexagonale (domaines, use cases, ports, adaptateurs, infrastructure).
* Privilégier la création de Value Objects pour les attributs des entités métier.
* Respecter strictement les contraintes métier et invariants définis dans le cahier des charges.
* doit formater le code 
* Doit respecter le formatage et le lintage du projet

### Validation et tests

* Chaque fonctionnalité doit être accompagnée de tests unitaires et d'intégration (cible de couverture ≥ 80 %).
* Commande pour les test: yarn test
* Commande pour les test: yarn test
* Commande pour les test: yarn test
* Commande pour le formatage: yarn format
* Documenter clairement chaque endpoint (Swagger/OpenAPI).

### Documentation et commentaires

* Rédiger des commentaires clairs et structurés pour chaque fonction importante.
* Fournir des exemples d'utilisation des modules et des fonctions critiques.

### Erreurs et gestion des exceptions

* Implémenter systématiquement une gestion précise des erreurs, avec messages explicites pour les utilisateurs.
* Maintenir une traçabilité complète des actions importantes (imports, modifications, désignations).

### Optimisation des performances

* Prioriser les requêtes asynchrones pour les tâches lourdes (import CSV, notifications).
* Utiliser le cache (Redis) pour améliorer la réactivité des interfaces utilisateur.

## Communication avec les développeurs

* Formuler les questions techniques clairement, en spécifiant précisément les besoins ou les points de blocage.
* Fournir régulièrement des résumés structurés des changements réalisés.

Ce document vise à orienter précisément les tâches d’un agent IA pour maximiser l’efficacité, la conformité aux exigences et la qualité globale du développement du projet HBManager.
