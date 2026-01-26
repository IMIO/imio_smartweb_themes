# Plone 6 Classic UI Themes for Walloon local authorities

This repository contains a collection of Plone 6 Classic UI themes, each customized for a specific Walloon local authority in Belgium. These themes are designed to maintain a consistent structure and branding style while allowing unique visual identities for each municipality.

## Structure

Each folder in this repository corresponds to a different Walloon local-authority, containing a fully packaged Plone 6 theme.

```
.
├── local-authority-name-1/
├── local-authority-name-2/
├── local-authority-name-3/
└── ...
```

## Purpose

The goal of this repository is to:

- Provide a unified base for Plone 6 Classic UI theming across Walloon local authorities.
- Facilitate maintenance, updates, and deployment of municipal websites.
- Encourage code reuse and theming consistency.

## Available Commands

### Theme Creation

- **`pnpm create-theme <theme-name>`** - Crée un nouveau thème à partir du template. Récupère automatiquement l'URL depuis l'infradoc et crée un commit Git.

### Code Quality

- **`pnpm stylelint`** - Vérifie les erreurs de style dans les fichiers CSS/SCSS
- **`pnpm stylelint:fix`** - Corrige automatiquement les erreurs de style
- **`pnpm prettier`** - Vérifie le formatage du code
- **`pnpm prettier:fix`** - Formate automatiquement le code

### Build & Development

- **`pnpm build --theme=<theme-name>`** - Compile un thème en mode production
- **`pnpm build:dev --theme=<theme-name>`** - Compile un thème en mode développement
- **`pnpm watch --theme=<theme-name>`** - Lance le serveur de développement avec hot-reload

### Release

- **`pnpm dry-release`** - Simule une release sans la publier
- **`pnpm release`** - Publie une nouvelle version

## Configuration

Le fichier `.env` (à créer depuis `.env.example`) contient :

- `INFRADOC_API_URL` - URL de l'API Infradoc pour récupérer les informations des sites

## Maintainers

- iMio
