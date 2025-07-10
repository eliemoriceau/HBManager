# Handball Manager Frontend

Frontend for the Handball Manager application built with Vue 3 and Tailwind CSS v4.

## Intégration Tailwind CSS v4

L'intégration de Tailwind CSS v4 a été réalisée avec succès. Voici les étapes effectuées :

1. Installation des dépendances :
   ```
   yarn add tailwindcss@4.0.0-alpha.16 postcss@^8.4.32 autoprefixer@^10.4.16 postcss-nesting@^13.0.2 -D
   ```

2. Configuration de Tailwind CSS :
   - Création du fichier `tailwind.config.js`
   - Configuration du PostCSS dans `postcss.config.cjs`
   - Ajout des directives Tailwind dans les fichiers CSS

3. Création de composants UI réutilisables :
   - Button : boutons avec variantes, tailles et états
   - Card : cartes avec en-têtes et pieds de page optionnels
   - Badge : badges pour les indicateurs de statut
   - Input : champs de formulaire avec états de validation
   - Alert : alertes pour les notifications

4. Mise à jour du layout principal pour utiliser Tailwind CSS

5. Création d'une page de démonstration des composants UI à `/ui-components`

## Utilisation

Pour voir les composants UI implémentés, démarrez le serveur de développement et accédez à la route `/ui-components` :

```sh
yarn dev
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```