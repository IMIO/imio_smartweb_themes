# Plan : thème de base V2 (`base2`)

Thème de base neutre, publiable et accessible pour les **futurs** sites SmartWeb.
Les sites existants restent sur `base/` (V1) : ni `base/` ni les ~167 thèmes communaux ne changent.

Suivi : chaque étape se termine par un commit sur la branche `V3` (pas de push).
La case est cochée quand l'étape est validée (build, lint, captures, contrôles a11y).

---

## 0. Décisions (19/10/2026)

| Sujet | Décision |
|---|---|
| Nom | dossier `base2/`, thème Plone `++theme++base2`, paquet npm `@imiobe/plonetheme-smartweb-base2` |
| Git | commits sur `V3`, un par étape, pas de push |
| Visuel | neutre mais publiable tel quel (gris + une couleur d'accent) |
| Variables | nouveaux noms cohérents + table de correspondance V1 → V2 ; le `variables.scss` d'un thème ne contient que ses surcharges |
| Police | pile système (aucun appel externe) + mixin pour auto-héberger la police d'une commune |
| imio.smartweb.core | documenter les corrections proposées, ne rien modifier |
| Barceloneta | `@plone/plonetheme-barceloneta-base` 4.1.0 (Bootstrap 5.3.8) |
| Accessibilité | WCAG 2.1 AA (EN 301 549), plus les critères 2.2 AA atteignables en CSS (focus non masqué, taille des cibles ≥ 24 px) |
| Environnement local | je peux redémarrer Plone ; je ne crée pas de contenu, n'active pas de thème et ne lance pas de serveur de dev. Contenu de test : la page d'accueil enrichie par Thomas |

---

## 1. Contraintes relevées dans le code

Analyse de `imio.smartweb.core` 1.4.62, `imio.smartweb.common` et du thème `base` actuel.

**Balisage (fixe)**
- Chaque section : `div.sortable-section.{type}.{css_class}.{col-sm-N}[.container-se-text][.with-background]` > `div.container.section-container` à l'intérieur de `#content-core > .row`. Les conteneurs imbriqués doublent les gouttières.
- Une section vide ou en erreur laisse ses enveloppes. Un éditeur connecté voit un DOM différent (`span.pat-sortable.row`, barre d'outils de section).
- Titre de section : `h2.section-title`. Titres d'éléments : `h3` en carrousel, `span` en tableau. Les sections Texte et Contact masquent leur titre par défaut ; Contact produit des `h2` génériques (« Contact », « Adresse », « Horaire »).
- Page d'accueil : deux `h1` (`h1.sr-only` dans le logo + `h1.page-title`).
- Options de section qui produisent des classes : `display-{paysage|portrait|carre}`, `nb-items-batch-N`, `figure-{left|right|top|bottom}`, `nb-contact-by-line-N`, `container-se-text`, `with-background`, `collapse`.

**Navigation**
- Le JS du core gère l'ouverture (`.show-nav`, `#portal-globalnav.activated`, `.mask-menu.in`, `inert`). Le positionnement des sous-menus et les boutons de défilement du sous-site viennent du JS de `base` V1.
- Manques : pas de fermeture par Échap, pas d'`aria-expanded` ni d'`aria-current`, `aria-controls="navbarNav"` pointe vers un id inexistant, `.prev-nav` n'est pas atteignable au clavier.
- Incohérence de points de rupture : la barre se replie sous 768 px (`navbar-expand-md`) mais le JS déplace `#header-actions` sous 992 px.

**CSS déjà présente sur la page**
- Ordre de chargement : CSS du registre (core, common, webcomponents, swiper) → CSS du thème → `@@custom.css` → CSS des widgets React, ajoutée au montage et donc gagnante à spécificité égale.
- Le core impose `* { background-position: 50%; background-size: cover }` : toute icône en fond doit le contrer (on utilisera `mask-image`).
- Les widgets React fuient des règles globales (`.row { margin: 0 }`, `#portal-column-content h1 { font-size: 0 }`, `header#content-header { position: sticky }`…) et supposent les largeurs de conteneur Bootstrap par défaut (1116/1296 px de contenu).
- Le core importe déjà bootstrap-icons (CDN) ; `.sr-only` n'est défini nulle part (Bootstrap 5 l'a retiré) : le thème doit le fournir.
- `collective.anysurfer` supprime les `<ul>` vides et ajoute `alt=""` après Diazo.
- `index.html` doit garder `header#content-header` (cible du lien d'évitement du pied de page), `.mask-menu` et `#portal-footer-wrapper`.

**Thème V1 (à ne pas reproduire)**
- 131 `!important`, ~114 couleurs en dur, ~180 sélecteurs par id, 21 variables sans `!default`, 22 variables jamais lues, des fautes dans les noms.
- Titres stylés par balise ; trois systèmes d'espacement concurrents ; fond pleine largeur réalisé de dix façons.
- Polices Google et icônes chargées par CDN (RGPD, performance).
- Focus supprimé par endroits, états uniquement au survol, animations sans `prefers-reduced-motion`.

**Chaîne de build et CI**
- Le CI reconstruit et pousse en production tout dossier de thème modifié sur `main` ; `pnpm-lock.yaml` n'est pas versionné.
- Une mise à jour d'outil ne doit donc **modifier aucun fichier dans un dossier de thème existant** (un reformatage Prettier redéploierait tous les sites).
- `base2/**` doit être ignoré par le CI (le workflow ignore déjà `basev2/**`).

---

## 2. Architecture de `base2`

```
base2/
├── manifest.cfg  rules.xml  index.html  preview.png
├── package.json            # @imiobe/plonetheme-smartweb-base2, barceloneta-base 4.1.0
├── docs/                   # exclu du theme.zip
│   ├── PLAN.md             # ce fichier
│   ├── variables.md        # index généré des variables
│   ├── correspondance-v1-v2.md
│   ├── classes-admin.md    # classes utilisables dans le champ « classe CSS » des sections
│   └── propositions-core.md
└── src/
    ├── index.js            # SCSS + JS d'amélioration progressive (sans jQuery)
    ├── js/
    └── scss/
        ├── main.scss       # ordre d'import
        ├── settings/       # variables !default : jetons, pont Bootstrap, composants
        ├── tools/          # fonctions et mixins (contraste, focus, icônes, espacements)
        ├── vendor/         # imports sélectifs Bootstrap + Barceloneta
        ├── base/           # :root (--sw-*), typographie, liens, focus, médias, accessibilité, mouvement
        ├── layout/         # page, en-tête, navigation, sous-site, fil d'Ariane, bandeau, pied de page
        ├── sections/       # système commun + un fichier par type de section
        ├── components/     # cartes, boutons, « voir tout », carrousel, formulaires
        ├── views/          # dossiers, recherche à facettes, vues React, recherche, procédures
        ├── plone/          # barre d'outils, édition, messages, bandeau RGPD, TinyMCE
        └── utilities/      # classes admin, impression
```

**Conventions**
- **Variables** : jetons globaux = variables Bootstrap quand elles existent (`$primary`, `$body-color`, `$font-family-base`, `$h2-font-size`, `$spacer`, `$border-radius`…). Variables de composant : `$<composant>-<élément>-<propriété>[-<état>]` (`$mainnav-link-hover-color`, `$section-spacing-y`). Un script vérifie qu'aucun nom n'entre en collision avec Bootstrap ou Barceloneta. Toutes en `!default`, commentées, et aucun fichier de variables ne produit de CSS.
- **Propriétés CSS `--sw-*`** sur `:root` pour les couleurs et espacements lus par les composants. Une section à fond sombre bascule ainsi ses couleurs en redéfinissant quelques propriétés.
- **Contraste garanti** : quand l'intégrateur ne fixe pas une couleur de texte, elle est calculée depuis le fond (`color-contrast()`, ratio ≥ 4,5). Un contrôle statique vérifie les paires texte/fond.
- **Sélecteurs** : classes ; id seulement pour battre une règle du core ; `:where()` pour les contextes par défaut ; imbrication ≤ 3. Pas d'`!important`, sauf contre un style en ligne ou un `!important` du core, et toujours commenté.
- **Unités et responsive** : `rem`, `clamp()` pour la typographie et les espacements fluides, propriétés logiques, mixins de points de rupture Bootstrap uniquement.
- **Accessibilité par défaut** : `:focus-visible` global à double anneau (visible sur fond clair et sombre), liens soulignés dans le contenu, états jamais portés par la couleur seule, cibles ≥ 24 px, transitions désactivées sous `prefers-reduced-motion`.
- **Icônes** : SVG en `mask-image` coloré par `currentColor` (elles suivent la couleur du texte, survol et fonds sombres compris).

---

## 3. Méthode de test

Le thème actif du Plone local reste `base`. Pour tester `base2` sans l'activer :
- un script Playwright (`scripts/base2/check.mjs`) intercepte les requêtes `++theme++base/dist/…` et sert les fichiers de `base2/dist/`, en retirant les attributs `integrity` ;
- Diazo (`index.html`, `rules.xml`) reste celui de `base` : `base2` garde la même structure Diazo tant que son activation n'est pas possible. Avant toute modification Diazo, je demande l'activation.

Pour chaque page (accueil, dossier, recherche à facettes, vues React actualités/agenda/annuaire, recherche, 404, connexion, et une vue connectée), à 390, 768, 1024 et 1280 px :
- captures pleine page dans `/tmp/base2-checks/` (hors dépôt) ;
- axe-core (règles WCAG 2.1 AA) ;
- plan des titres (un seul `h1` visible, pas de saut de niveau) ;
- focus visible au clavier sur les premiers éléments tabulables ;
- cibles interactives < 24 px.

Le même contrôle sur la V1 sert de référence : on distingue ainsi les défauts du thème de ceux du core.

**Une étape est validée quand** :
- `pnpm build --env theme=base2` réussit et produit `theme.zip` ;
- `pnpm stylelint` et `pnpm prettier` passent ;
- le code de `base2` ne produit aucun avertissement Sass ;
- aucune nouvelle violation axe n'est imputable au thème ;
- les captures sont relues aux quatre largeurs.

---

## 4. Étapes

### [x] Étape 0 — Plan et garde-fous
- Ce document.
- Exclure `base2/**` du CI et `docs/` du `theme.zip`.

### [x] Étape 1 — Mise à jour de la chaîne d'outils, sans régression

**Résultat (19/10/2026).** Plafond retenu : versions compatibles Node 20.19. La version de `sass-embedded` déjà résolue par le CI exige Node 20.19, ce qui donne une bonne indication sur les runners.
- **Mis à jour** : webpack 5.112, webpack-cli 7, sass-loader 16 (API Sass moderne, compilateur partagé), css-loader 7, style-loader 4, css-minimizer 8 (cssnano 7), filemanager 9, babel-loader 10, Sass 1.105.2, PostCSS 8.5.31, Autoprefixer 10.6.1, Stylelint 17 (+ configs), release-it 20, concurrently 9, dotenv 18.
- **Diff sur 168 thèmes** (hors `six_smartweb`, qui échouait déjà avant) : CSS équivalente.
  - Autoprefixer : `:-moz-placeholder-shown` devient `:-moz-placeholder` dans des règles préfixées ignorées par les navigateurs actuels.
  - cssnano : `grey` → `gray`, `0ms` → `0s`, hexadécimal en minuscules, une couleur arrondie à 62,4 % au lieu de 62 %.
  - JS : seuls les identifiants de modules changent.
- **Gardé tel quel** :
  - Prettier 3.3.3 : la 3.4+ reformate 114 `index.js` de thèmes, et le CI les redéploierait.
  - webpack-dev-server 5 : la v6 supprime l'option `bypass` du proxy utilisée par `pnpm watch`, et exige Node 22.15.
  - Babel 7, sass-loader 16, filemanager 9, postcss-html 1, release-it 20 : leurs versions suivantes exigent Node 22.
- **Ajustements** :
  - SVGO 4 conserverait les `viewBox` des icônes SVG ; `removeViewBox` est réactivé pour garder le rendu des thèmes existants.
  - Correction de la faute `overwite` → `overwrite` (refusée par filemanager 9, ignorée en silence par la v8).
  - Les trois nouvelles règles Stylelint 17 ne sont actives que pour `base2/`.
- **À vérifier par Thomas** : `pnpm watch` (je ne lance pas de serveur de dev) et la version de Node des runners CI.
- **Note** : en local, le pnpm Homebrew est la version 12 ; il refuse `pnpm --theme=x build` (syntaxe du CI), alors que `pnpm build --env theme=x` fonctionne.
- Script `scripts/css-snapshot.js` : compile la CSS et le JS de chaque thème dans `/tmp`, sans écrire dans les dossiers de thème (pas de favicons, pas de zip).
- Instantané « avant » des ~169 thèmes. Mise à jour des dépendances racine (Sass, PostCSS, Autoprefixer, webpack et ses loaders et plugins, Babel, Stylelint, Prettier…), puis adaptation de `webpack.config.js` (API Sass moderne, avertissements des dépendances tiers masqués).
- Instantané « après » et diff : la CSS non minifiée doit être identique, ou chaque différence expliquée.
- `pnpm prettier` et `pnpm stylelint` doivent passer **sans modifier un seul fichier de thème**. Sinon, l'outil concerné est épinglé et documenté.
- pnpm reste en v8 pour ne pas toucher au CI.

### [x] Étape 2 — Squelette de `base2`
- `package.json`, `manifest.cfg`, `rules.xml` et `index.html` (même structure que la V1, règles mortes retirées), `src/index.js`, arborescence SCSS.
- Bootstrap 5.3.8 et Barceloneta 4.1.0 importés sélectivement ; `.sr-only` fourni.
- Le build produit `dist/` et `theme.zip`.
- **Résultat** : `theme.css` de 236 Ko minifié (Bootstrap 5.3.8 complet et styles Plone de Barceloneta 4.1.0, sans en-tête, navigation, fil d'Ariane ni pied de page Barceloneta). Le zip exclut bien `src/`, `docs/` et `package.json`. Plone sert `++theme++base2/…` depuis le disque sans activation.

### [x] Étape 3 — Outillage de test
- `scripts/base2/check.mjs` (substitution, captures, axe, titres, focus, cibles).
- Contrôle statique des contrastes adapté de `a11y-check.js` (branche `skill-integration`).
- Rapport de référence sur la V1.
- **Résultat** :
  - `node scripts/base2/check.mjs [--pages=…] [--widths=…] [--auth] [--focus] [--gdpr]` contrôle 11 pages publiques et 3 pages connectées. Il produit les captures (pleine page et bandes de 1000 px), les violations axe, le plan des titres, les cibles < 24 px et le parcours clavier. Il masque le bandeau cookies, sauf avec `--gdpr`.
  - Référence V1 : `node scripts/base2/check.mjs --dist=/tmp/snap-after/base/dist --auth --focus`.
  - Le contrôle statique des contrastes se fait dans Sass (`settings/_checks.scss`) plutôt que dans un script séparé : l'intégrateur voit l'avertissement dès qu'il compile.

### [x] Étape 4 — Fondations
- Jetons : couleurs (accent, neutres, surfaces, états), typographie (pile système, échelle fluide h1–h6 bien distincte), espacements, rayons, ombres, transitions.
- Pont vers les variables Bootstrap et propriétés `--sw-*`.
- Styles de base : liens, focus, sélection, mouvement réduit.
- Texte riche (`.text`, descriptions, corps TinyMCE) : titres, listes, tableaux, citations, figures, `mark`, mesure de ligne lisible.
- **Résultat** :
  - Accent `#1f5c99` (6,9:1 sur blanc), gris légèrement bleutés, police système, interlignage 1,6, échelle de titres 2,5 / 2 / 1,5 / 1,25 / 1,125 / 1 rem.
  - Anneau de focus à double couleur partout, y compris sur les composants Bootstrap.
  - Liens soulignés, plus épais au survol.
  - `.sr-only` fourni ; un lien `.sr-only` réapparaît quand il reçoit le focus.
  - Mouvement réduit respecté.
  - Texte riche (titres, listes, citation, bloc `mark` en encadré, tableaux), appliqué aussi dans l'éditeur TinyMCE.
  - `sw-contrast()` avertit à la compilation pour 10 paires texte/fond ; les avertissements restent visibles même quand `base2` est chargé comme dépendance.
  - La mesure de ligne du texte est reportée à l'étape 8 (section Texte).

### [x] Étape 5 — En-tête et navigation
- Logo, liens d'en-tête, recherche (offcanvas), sélecteur de langue, variantes collantes (`menu-sticky*`).
- Menu principal : panneau pleine largeur et navigation en profondeur (retour/fermer), sans JS de positionnement. Menu mobile jusqu'à 991 px pour corriger l'écart 768/992.
- Navigation de sous-site, fil d'Ariane, mini-site.
- JS d'amélioration progressive : fermeture par Échap, `aria-expanded`, correction de `aria-controls`, gestion du focus.
- **Résultat** :
  - Ordinateur (≥ 992 px) : logo, menu et actions sur une ligne ; panneau pleine largeur (titre de rubrique, grille de liens, Fermer), voile sur la page. Les niveaux suivants recouvrent le panneau, avec un bouton « Retour ».
  - Mobile et tablette : bouton menu (icône en croix une fois ouvert), feuille pleine largeur, sous-menus en accordéon, page bloquée derrière, « Mon compte » en bas. Corrige l'écart 768/992 du core.
  - JS (`src/js/navigation.js`) : Échap ferme le niveau ouvert puis le menu mobile et rend le focus, `aria-expanded`, `aria-current`, `aria-controls` corrigé, « Retour » utilisable au clavier. Vérifié par `scripts/base2/scenarios.mjs`.
  - Les cases à cocher du core sont masquées (elles prenaient le focus), ce qui supprime les violations `aria-required-children` et `target-size`. Il ne reste plus aucune violation de contraste dans l'en-tête.
  - Fil d'Ariane masqué quand il ne contient que « Accueil ». Liens `.sr-only` visibles au focus. Liens d'évitement au-dessus de la barre d'outils.
  - **Non testable sur le site local** (aucun contenu) : navigation de sous-site, mini-site, sélecteur de langue, options de menu collant, niveaux de menu ≥ 3. Les styles sont écrits (mixins partagés dans `layout/_nav.scss`) ; il faudra les valider sur un site qui les utilise.

### [x] Étape 6 — Bandeau d'accueil (hero) et bannière
- Diapositives image, vidéo ou couleur ; voile garantissant le contraste du texte ; hauteur minimale plutôt que fixe (zoom 200 %, reflow).
- Contrôles du carrousel accessibles (≥ 44 px, focus visible).
- **Résultat** :
  - Bandeau pleine largeur.
  - Sur ordinateur, texte dans un encadré opaque aligné sur le conteneur (contraste garanti sur toute photo) ; hauteur minimale fluide que le contenu peut agrandir.
  - Sur petit écran, image 16/9 au-dessus et texte dessous.
  - Flèches rondes de 48 px à chevrons en masque, groupées en bas à droite (au milieu de l'image sur mobile).
  - Lien de diapositive en bouton.
  - Composant `components/_carousel.scss` partagé avec les sections en carrousel.
  - Testé en injectant côté navigateur le balisage du core (`scenarios.mjs hero`) : les diapositives locales n'ont pas de texte.
  - La bannière des pages intérieures (`#banner`) passe en pleine largeur (non testée : absente du site local).

### [ ] Étape 7 — Système de sections
- Rythme vertical unique (`--sw-section-space`, fluide) : première et dernière section, sections Texte consécutives (rythme d'article), colonnes `col-sm-*`, alignement « texte », fonds (`with-background`).
- Neutralisation des sections vides (`:has()`), double gouttière supprimée, DOM d'édition pris en charge.
- Titre, description et variante repliable de section.
- Composant carte unique (tableau et carrousel) : ratios d'image, grille `nb-items-batch-N`, catégorie, date, titre de même taille quelle que soit la balise, carte entièrement cliquable avec focus visible, état sans image.
- Lien « Voir tout » (bouton centré par défaut, comme sur la majorité des sites), flèches et puces de carrousel.

### [ ] Étape 8 — Sections une par une
- Texte, Liens, Fichiers, Contact, Galerie, Plan, Vidéo, Post-it : présentes sur la page d'accueil de test.
- Sélections, Collection, Publications horodatées, HTML, Contenu externe : à ajouter sur le site de test.
- Actualités, Événements.

Chaque section est vérifiée dans toutes ses variantes d'affichage.

### [ ] Étape 9 — Pied de page et colophon
- Sections du pied de page en colonnes, contraste, lien d'évitement, colophon.

### [ ] Étape 10 — Vues hors sections
- Vues de dossier, recherche à facettes (« Je trouve »).
- Vues React (actualités, agenda, annuaire, recherche), en neutralisant leurs fuites globales.
- `@@search`, procédures (bouton e-guichet), formulaires et connexion, messages, bandeau RGPD, 404.
- Impression et CSS de contenu TinyMCE.

### [ ] Étape 11 — Classes admin (champ « classe CSS » des sections)
- Classes V1 encore utilisées (`quick-access`, `partenaires`, `espace-citoyen-bloc`…) et utilitaires génériques (fonds, centrage…).
- Liste à valider avec Thomas ; documentation dans `docs/classes-admin.md`.

### [ ] Étape 12 — Mode connecté
- Barre d'outils, édition des sections, formulaires, contenu des dossiers, panneaux de configuration : rien de cassé.

### [ ] Étape 13 — Gabarit et outillage pour les thèmes communaux
- Gabarit V2 : `variables.scss` réduit aux surcharges, avec la liste commentée des variables les plus utiles.
- Option V2 dans `create-theme`.
- `docs/variables.md` généré et `docs/correspondance-v1-v2.md`.
- Thème pilote temporaire (une quinzaine de surcharges) pour prouver l'API de variables et le maintien des contrastes.

### [ ] Étape 14 — Propositions pour imio.smartweb.core
- `docs/propositions-core.md` : pour chaque problème, fichier et ligne, critère WCAG, diff proposé, risque pour les thèmes existants, caractère additif ou non.
- Rien n'est modifié dans le core.

### [ ] Étape 15 — Finalisation
- Version initiale, CHANGELOG et configuration release-it (tag `base2-v…`). Publication npm seulement sur demande.
- Rapport final avec captures.

---

## 5. Hors périmètre, constats à signaler

- `smartweb/` est l'ancien thème autonome de Braine-l'Alleud : il porte le nom de paquet de la base et `homepage: https://www.arlon.be`. Toute modification de ce dossier ferait pousser ce thème sur le site d'Arlon par le CI.
- `create-theme.js` copie tout `base/src/scss/variables.scss` dans chaque nouveau thème V1.
- La branche `skill-integration` supprime des fichiers de `soignies` : elle ne doit pas être fusionnée telle quelle.
