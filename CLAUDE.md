# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Use **pnpm** exclusively (workspace monorepo, pnpm v8.15.6+, Node 18+).

## Common Commands

All commands run from the repository root unless noted.

```bash
# Linting & formatting
pnpm stylelint             # Check SCSS style violations
pnpm stylelint:fix         # Auto-fix SCSS violations
pnpm prettier              # Check code formatting (JS, JSON, CSS, SCSS)
pnpm prettier:fix          # Auto-format code

# Build a single theme (produces dist/ and theme.zip)
pnpm build --theme=<theme-name>        # Production build
pnpm build:dev --theme=<theme-name>    # Development build with source maps
pnpm watch --theme=<theme-name>        # Dev server on port 3000 (proxies Plone on 8080)

# Build all themes
node build-all.js

# Create a new theme from the template
pnpm create-theme <theme-name>
```

## Architecture

### Monorepo Layout

```
imio_smartweb_themes/
├── [template]/        # Source template for new themes
├── base/              # Shared base theme (published as @imiobe/plonetheme-smartweb-base)
├── smartweb/          # Extended theme variant with fragments
├── scripts/           # Theme creation helpers
├── webpack.config.js  # Webpack config (entry/output resolved via --theme flag)
├── postcss.config.js  # Autoprefixer only
├── .stylelintrc.json  # Stylelint config
└── {municipality}/    # 155+ individual municipality themes
```

### Theme Inheritance Chain

```
@plone/plonetheme-barceloneta-base  (Plone base)
         ↓
   base/                            (SmartWeb shared theme)
         ↓
   {municipality}/                  (Per-municipality overrides)
```

Individual themes customise appearance solely through SCSS variable overrides; they rarely add new selectors.

### Per-Theme Structure

```
{theme}/
├── src/
│   ├── index.js          # Entry point: imports SCSS, jQuery nav/swiper handlers
│   └── scss/
│       ├── main.scss     # @import variables first, then base/src/scss/main
│       ├── variables.scss # Override !default SCSS vars from base
│       └── home/         # Optional per-section homepage overrides
├── dist/                  # Built output (webpack)
├── assets/fonts/images/svg/
├── icons/logo.png         # Source for auto-generated favicons
├── manifest.cfg           # Plone Diazo theme manifest
├── rules.xml              # Diazo XSLT transformation rules
└── theme.zip              # Packaged theme for Plone deployment
```

### SCSS Variable System

`base/src/scss/variables.scss` defines 400+ variables with `!default`. Individual themes override them by declaring the variable **before** importing the base:

```scss
// {theme}/src/scss/main.scss
@import "./variables";                          // theme overrides (no !default)
@import "../../../base/src/scss/main";          // or @imiobe/... if installed via npm
```

Key variable groups: `$primary`, `$grey-bg`, `$black-color`; typography sizes per heading level; layout container widths; component-specific vars for header, nav, swiper, sections, and homepage blocks.

### Base Theme SCSS Structure

```
base/src/scss/
├── variables.scss      # All !default variables
├── _mixin.scss         # full-width, section-padding-top/bottom, fit-cover, etc.
├── _general.scss
├── _header.scss / _sitenav.scss / _sub-sitenav.scss
├── common/             # _com-cookies, _com-faceted, _com-footer, _com-react, etc.
├── sections/           # _se-textes, _se-contact, _se-gallery, _se-link, etc.
└── homepage/           # _banner, _quick-access, _a-la-une, _actualites, _events, etc.
```

### Build System

Webpack 5 resolves the theme path from the `--theme` env flag. Outputs:
- `dist/css/theme.css` + `dist/js/theme.js`
- Auto-generated favicons from `icons/logo.png`
- `theme.zip` (FileManagerPlugin) for Plone deployment

Dev server writes assets to disk (required for Plone integrity hash) and proxies all non-bundle requests to `http://localhost:8080`.

### Plone Integration

Each theme ships a `manifest.cfg` (bundle paths) and `rules.xml` (Diazo XSLT rules that map Plone HTML regions into the `index.html` template). Theme prefix: `/++theme++{theme-name}`.

## Critical Files

- `webpack.config.js` — build config, understand before changing output paths
- `base/src/scss/variables.scss` — all default variables; edits here affect every theme
- `base/src/scss/main.scss` — import order for shared styles
- `[template]/` — source of truth for new theme scaffolding
- `scripts/create-theme.js` — theme creation automation (reads `.env` for INFRADOC_API_URL)

## Verification

After changes:
1. Run `pnpm stylelint` and `pnpm prettier` — both should exit 0
2. Run `pnpm build --theme=<any-theme>` — should produce `dist/` and `theme.zip`
3. For base theme changes, test against at least one municipality theme build
