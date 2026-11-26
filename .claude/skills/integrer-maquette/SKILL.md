---
name: integrer-maquette
description: Intègre le graphisme d'une maquette Figma dans un thème smartweb en surchargeant au maximum les variables SCSS héritées du thème de base, avec contrôle d'accessibilité. À utiliser quand l'utilisateur veut intégrer, mettre à jour ou ajuster le design d'un thème de commune à partir d'une maquette Figma ou d'une description (couleurs, typo, sections de la page d'accueil).
argument-hint: <theme> <url-figma>
---

# Intégrer une maquette dans un thème smartweb

L'HTML est fourni par Plone et identique sur tous les sites. L'intégration est donc **une surcharge de variables**, puis du SCSS custom seulement pour ce que les variables ne couvrent pas.

Principe directeur : **variable d'abord, SCSS custom en dernier recours.** Chaque ligne de SCSS custom est une ligne à maintenir dans un thème de plus.

## Entrées

- Le thème cible (`<theme>`, dossier à la racine). S'il n'existe pas, `pnpm create-theme <theme>`.
- La maquette Figma (URL). Sinon, une description : couleurs, polices, sections utilisées.
- Le site local sur le port 8080, avec le contenu et les sections déjà ajoutés.

## Étapes

### 1. Lire la maquette, sans générer de code

Avec le MCP Figma : `get_variable_defs` (couleurs, typo, espacements), `get_screenshot` (référence visuelle), `get_metadata` si besoin de la structure. Si `get_design_context` est appelé, charger d'abord le skill `figma:figma-design-to-code`, mais ne s'en servir que pour **lire des valeurs** : on n'écrit ni HTML ni composants.

Relever : palette (principale, secondaire, fond, texte), polices et graisses, rayon des angles, ombres, et pour chaque section de l'accueil ce qui change par rapport à un rendu « neutre » (fond, alignement, taille de titre, forme des cartes).

### 2. Mapper sur les variables de la base

Lire `references/variables.md` (index généré des 358 variables, par zone). Ne pas lire `base/src/scss/variables.scss` en entier.

Ordre de décision pour chaque écart de la maquette :

1. **Une variable existe** : la surcharger.
2. **Une variable de groupe existe** (ex. `$home-section-title-*`, `$see-all-*`) : préférer celle-ci à plusieurs variables par section, c'est ce qui garde le thème cohérent.
3. **Le défaut dérive d'une autre variable** (ex. `$font-title-color: $primary`) : ne rien écrire, le changement de `$primary` se propage.
4. **Aucune variable** : noter l'écart. Voir l'étape 5.

Par où commencer : couleurs (`$primary`, `$primary-svg`, `$grey-bg`, `$black-color`), polices et tailles de titres, `$global-radius`, puis header et navigation, puis les sections de l'accueil dans l'ordre de la page.

### 3. Écrire `src/scss/variables.scss`

- **Uniquement les variables qui diffèrent** du défaut de la base. Ne pas recopier le fichier de la base : ça gèle les valeurs et cache ce qui est personnalisé.
- Pas de `!default` dans un thème (il faut que la valeur gagne sur la base).
- Garder le même ordre et les mêmes titres de section que `references/variables.md`.
- Réutiliser les variables entre elles (`$header-top-background: $primary;`) plutôt que de répéter un hexadécimal.
- `main.scss` reste minimal : import de `./variables`, puis de la base.

### 4. Contrôler

1. `node scripts/a11y-check.js <theme>` : voir le skill `accessibilite-theme`. Les échecs de contraste se traitent **avant** de passer à la suite. Ne pas modifier une couleur de la maquette sans le dire : présenter l'échec et la teinte proposée, l'utilisateur tranche avec le graphiste.
2. `pnpm build --env theme=<theme>` : doit produire `dist/` et `theme.zip`.
3. `pnpm stylelint` et `pnpm prettier` : exit 0.
4. Comparaison visuelle : ouvrir le site local (`mcp__t3-code__preview_*`) et le comparer au `get_screenshot` de Figma, section par section. Vérifier aussi mobile et l'état au survol et au focus.

### 5. Traiter ce que les variables ne couvrent pas

Pour chaque écart restant, choisir :

| Situation | Action |
|---|---|
| Écart propre à cette commune (décor, forme unique) | SCSS custom dans le thème : un fichier par section dans `src/scss/home/`, sélecteurs courts, pas de `!important` |
| Écart déjà vu dans d'autres thèmes (`grep -rl '<sélecteur>' */src/scss`) | Proposer d'ajouter une variable ou un flag `$enable-…` **dans la base**, plutôt que de copier du SCSS |

Avant d'écrire du SCSS, regarder si un fichier équivalent existe déjà ailleurs : `section-en-image`, `info-trav`, `se-link`, `contact`, `espace-citoyen` et `se-files` sont recopiés à l'identique dans des dizaines de thèmes. Les signaler à l'utilisateur comme candidats à la base plutôt que d'en créer une nouvelle copie.

Toute modification de `base/` affecte les 169 thèmes : ne pas la faire sans l'accord de l'utilisateur, et la tester sur au moins deux thèmes. Après avoir changé `base/src/scss/variables.scss`, régénérer l'index avec `node scripts/gen-variables-index.js`.

## Rapport final

Résumer en peu de lignes :
- variables surchargées (nombre, et les groupes concernés) ;
- SCSS custom ajouté et pourquoi une variable ne suffisait pas ;
- résultat du contrôle d'accessibilité (échecs, points « à vérifier ») ;
- candidats à remonter dans la base.
