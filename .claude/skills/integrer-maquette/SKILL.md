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

Dans la pratique :
- **`get_variable_defs` renvoie souvent `{}`** : les maquettes n'utilisent pas de variables Figma. Les valeurs sont alors en dur dans `get_design_context` (classes Tailwind : `text-[#52657a]`, `rounded-tr-[50px]`, `text-[22px]`, `shadow-[…]`). Les lire là.
- **`get_design_context` sur une page entière est énorme** (dizaines de milliers de tokens, souvent tronqué). Le lancer sur la page pour la vue d'ensemble, puis par section (`nodeId` d'un groupe) si le résultat est coupé.
- **Les SVG décoratifs** (formes organiques, illustrations, flèches) se téléchargent depuis les URL `assetPathPrefix` de la réponse, avec `curl -L`, vers `<theme>/assets/svg/`. Les images de contenu (bannière, logo, photos des cartes) viennent de Plone : ne pas les télécharger.
- La maquette n'a en général que le desktop : le responsive est à décider soi-même, en gardant les règles de mise en page dans `@include media-breakpoint-up(lg)` ou `(xl)`.

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
- Réutiliser les variables **du thème** entre elles (`$header-top-background: $primary;`) plutôt que de répéter un hexadécimal. Attention : `variables.scss` du thème est importé **avant** celui de la base, donc une variable de la base n'existe pas encore à cet endroit (`$see-all-font-family: $font-family-base;` plante avec « Undefined variable »). Écrire la valeur littérale (`"Roboto", sans-serif`).
- Les couleurs propres au thème qui n'existent pas dans la base se déclarent en haut du fichier (`$accent-dark`, `$slate-dark`…) et servent au SCSS custom.
- Charger les graisses de police nécessaires avec un `@import url("https://fonts.googleapis.com/…")` : la base ne charge que Roboto 400 et 500, et Nunito.
- `main.scss` : import de `./variables`, puis de la base, puis les fichiers custom.
- Dans le SCSS custom, les `url()` se résolvent **depuis `main.scss`** et non depuis le partial : toujours `url("../../assets/svg/…")`, même dans `home/`.

### 4. Contrôler

1. `node scripts/a11y-check.js <theme>` : voir le skill `accessibilite-theme`. Les échecs de contraste se traitent **avant** de passer à la suite. Ne pas modifier une couleur de la maquette sans le dire : présenter l'échec et la teinte proposée, l'utilisateur tranche avec le graphiste.
2. `pnpm build --env theme=<theme>` : doit produire `dist/` et `theme.zip`.
3. `pnpm stylelint` et `pnpm prettier` : exit 0.
4. Comparaison visuelle : ouvrir le site local (`mcp__t3-code__preview_*`) et le comparer au `get_screenshot` de Figma, section par section. Vérifier aussi mobile et l'état au survol et au focus.

#### Comparer par mesure, pas à l'œil

Une comparaison visuelle seule laisse passer des écarts de 20 à 60 px (retour d'utilisateur sur Soignies : « tout n'est pas bon »). Comparer en plus des **coordonnées** :

1. Prendre dans `get_metadata` les `x`, `y`, `width`, `height` des repères de la maquette (haut des titres, des cartes, des boutons, des bandes de fond, hauteur du header et de la bannière).
2. Mesurer les mêmes éléments sur le site avec `preview_evaluate` (`getBoundingClientRect().top + scrollY`), fenêtre fixée à la largeur de la maquette.
3. Régler d'abord par **variables d'espacement** (`$*-section-padding-*`, `$*-title-margin`, `$home-section-title-margin`, `$header-top-padding`), puis par SCSS custom pour le reste. Corriger les écarts de plus de quelques pixels.
4. Pour examiner la capture de la maquette en détail, la découper avec `sips -c <hauteur> <largeur> --cropOffset <y> <x> in.jpg --out out.jpg` (un offset à `0 0` centre le découpage : utiliser `1`).

Écarts fréquents à vérifier dans cet ordre : hauteur du header, position verticale du premier bloc, marge titre → cartes, hauteur des cartes, espace entre sections, ombres des cartes, taille et couleur des pastilles de pagination, position des flèches du slider, alignement du menu, chevrons du menu.

#### Servir le thème en direct

- **Vérifier quel thème le serveur de dev compile.** `pnpm watch` sans `--env theme=<theme>` compile `base`. Contrôle : `curl -s -o /dev/null -w '%{http_code}' localhost:3000/++theme++<theme>/dist/js/theme.js` doit répondre 200 ET le CSS ne doit pas être celui de la base. En cas de doute, lancer son propre serveur sans toucher à celui de l'utilisateur : `npx webpack serve --mode=development --env theme=<theme> --port 3001`.
- **Le site Plone est sous `/Plone`** (`localhost:<port>/Plone`), pas à la racine (la racine affiche « Welcome to Plone »).
- **Plone calcule un hash d'intégrité (SRI) de `theme.js` et le garde en cache.** Après la première compilation, un rechargement complet de la page est refusé par le navigateur (hash périmé) et la page s'affiche sans style. Deux issues : s'appuyer sur le rechargement à chaud (HMR) sans recharger la page, ou injecter le bundle à la main après chaque rechargement complet avec `preview_evaluate` :
  `(async () => { const t = await (await fetch('/++theme++<theme>/dist/js/theme.js')).text(); (0,eval)(t); })()`
  Le redimensionnement de la fenêtre peut déclencher un rechargement : ré-injecter alors.
- Fixer la largeur de la fenêtre sur celle de la maquette (`preview_resize` à 1728 px) pour comparer à l'échelle.
- `preview_snapshot` renvoie aussi une grosse liste d'éléments : s'en servir avec parcimonie pour les captures, et préférer `preview_evaluate` (positions, styles calculés) pour mesurer.
- Arrêter son propre serveur avant `pnpm build` (le build supprime `dist/`).

### 5. Traiter ce que les variables ne couvrent pas

Pour chaque écart restant, choisir :

| Situation | Action |
|---|---|
| Écart propre à cette commune (décor, forme unique) | SCSS custom dans le thème : un fichier par section dans `src/scss/home/`, sélecteurs courts, pas de `!important` |
| Écart déjà vu dans d'autres thèmes (`grep -rl '<sélecteur>' */src/scss`) | Proposer d'ajouter une variable ou un flag `$enable-…` **dans la base**, plutôt que de copier du SCSS |

Avant d'écrire du SCSS, regarder si un fichier équivalent existe déjà ailleurs : `section-en-image`, `info-trav`, `se-link`, `contact`, `espace-citoyen` et `se-files` sont recopiés à l'identique dans des dizaines de thèmes. Les signaler à l'utilisateur comme candidats à la base plutôt que d'en créer une nouvelle copie.

### Limites connues de la base (à contourner, ou à corriger dans la base avec accord)

Rencontrées à l'intégration de Soignies. Les signaler dans le rapport plutôt que de les redécouvrir :

| Limite | Contournement actuel |
|---|---|
| `$container-max-widths` n'a pas de `!default` : non surchargeable | `.container { max-width }` en SCSS custom |
| `$quick-access-title-color` est déclarée deux fois et pilote à la fois le titre de section et le libellé de chaque lien | Choisir une couleur commune, masquer le titre de section si la maquette n'en a pas |
| Pas de variable pour une ombre de carte (`box-shadow`) | SCSS custom |
| Pas de variable de décor de titre (barre colorée, soulignement) | SCSS custom sur `.sortable-section .section-title::before` |
| Pas de variable pour la forme d'une image de bannière ni pour la position des flèches du bandeau | SCSS custom |
| `$album-category-color` (`$primary`) sur `$album-category-bg-color` (`#000`) : contraste insuffisant par défaut | Surcharger les deux, ou corriger la base |
| `$album-category-text-transform: uppurcase` : faute de frappe dans la base | Sans effet, à corriger dans la base |
| Les sections `espace-citoyen-bloc` et `partenaires` ne sont pas dans la base : ce sont des classes de sections de liens créées côté Plone | Style entièrement custom, un fichier par section |

Toute modification de `base/` affecte les 169 thèmes : ne pas la faire sans l'accord de l'utilisateur, et la tester sur au moins deux thèmes. Après avoir changé `base/src/scss/variables.scss`, régénérer l'index avec `node scripts/gen-variables-index.js`.

## Rapport final

Résumer en peu de lignes :
- variables surchargées (nombre, et les groupes concernés) ;
- SCSS custom ajouté et pourquoi une variable ne suffisait pas ;
- résultat du contrôle d'accessibilité (échecs, points « à vérifier ») ;
- candidats à remonter dans la base.
