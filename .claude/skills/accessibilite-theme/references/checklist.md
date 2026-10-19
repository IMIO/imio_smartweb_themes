# Checklist accessibilité pour l'intégration d'un thème

Référentiel WCAG 2.1 AA. Les numéros renvoient aux critères de succès.

## Couleurs et contrastes

- [ ] Texte normal ≥ **4.5:1** contre son fond (1.4.3). Grand texte ≥ 3:1.
- [ ] Icônes porteuses de sens, bordures de champs, flèches du swiper, pastilles ≥ **3:1** (1.4.11).
- [ ] Texte blanc sur une couleur de marque : tester la couleur de marque, pas la maquette « à l'œil ». Les jaunes, oranges et verts clairs échouent presque toujours avec du blanc.
- [ ] Texte sur image : prévoir un fond semi-opaque (`$banner-content-background`) ou un dégradé. Tester sur la photo la plus claire possible.
- [ ] L'information ne passe pas **que** par la couleur (1.4.1). Un lien dans un texte courant garde un soulignement ou un autre signe.
- [ ] Contrôler **tous les états** : normal, survol, focus, actif, visité, désactivé. Une maquette Figma montre rarement les quatre, les demander au graphiste.

## Survol et focus

- [ ] Tout style `:hover` a son pendant `:focus-visible` (2.1.1, 2.4.7). Ne pas réserver l'info au survol.
- [ ] Le focus est visible : contour ou ombre d'au moins 2 px, ≥ 3:1 contre le fond et contre l'élément (2.4.7, 1.4.11).
- [ ] Jamais de `outline: none` / `outline: 0` sans remplacement équivalent.
- [ ] Un changement au survol qui révèle du contenu doit rester atteignable au clavier et fermable (1.4.13).
- [ ] Le survol ne dégrade pas le contraste : fond et texte d'un état `hover` se testent comme un état normal.

## Typographie et titres

- [ ] Corps de texte ≥ 16 px (`1rem`), en `rem` et pas en `px`, pour suivre les préférences de l'utilisateur (1.4.4).
- [ ] Interligne ≥ 1.5 sur le texte courant, espacement des paragraphes ≥ 2 × la taille de police (1.4.12).
- [ ] La hiérarchie visuelle suit la hiérarchie sémantique : `h1` > `h2` > `h3` en taille. Une variable `$hN-font-size` ne doit pas casser cet ordre.
- [ ] `$enable-title-uppercase` : majuscules acceptables pour des titres courts, pas pour des phrases (lisibilité, lecteurs d'écran qui épellent certains sigles).
- [ ] Police de titre : vérifier que la graisse choisie existe vraiment dans l'import Google Fonts (sinon synthèse floue).
- [ ] Texte justifié, `letter-spacing` négatif et `font-weight` < 400 sur petit texte : à éviter.

## Composants de navigation (slider, pagination)

- [ ] Pastilles de pagination inactives ≥ **3:1** contre leur fond (1.4.11). Les maquettes dessinent souvent un gris très clair (`#f1f1f1` sur blanc = 1.1:1), qui rend la pagination invisible : proposer un gris plus foncé (`#949494` ≈ 3:1) et le dire au graphiste.
- [ ] Flèches du slider : icône ≥ 3:1 contre le disque, disque ≥ 3:1 contre l'image ou le fond, taille ≥ 44 px au tactile.
- [ ] L'état désactivé (première ou dernière diapositive) reste identifiable sans la seule opacité.

## Effets et mouvement

- [ ] Animations et `@keyframes` dans `@media (prefers-reduced-motion: no-preference)` (2.3.3, 2.2.2).
- [ ] Pas de défilement automatique du swiper sans bouton pause (2.2.2).
- [ ] Rien ne clignote plus de 3 fois par seconde (2.3.1).
- [ ] Les `transition` au survol restent courtes (≤ 0.3 s) et ne déplacent pas la mise en page.
- [ ] Pas de `scroll-behavior: smooth` imposé sans respect de `prefers-reduced-motion`.
- [ ] Ombres et flous décoratifs ne réduisent pas le contraste du texte posé dessus.

## Taille, zoom et responsive

- [ ] Cibles cliquables ≥ 24 × 24 px, idéalement 44 × 44 px au tactile (2.5.8). Vérifier `$quick-access-*`, boutons du swiper, `see-all`.
- [ ] Zoom 200 % sans perte de contenu ni défilement horizontal (1.4.4, 1.4.10). Éviter les `height` fixes en px sur du texte.
- [ ] Reflow à 320 px de large (1.4.10).
- [ ] Orientation non verrouillée (1.3.4).

## Composants Plone / smartweb

- [ ] Message viewlets (info, avertissement, erreur) : texte lisible sur chaque fond. Ne pas distinguer les types par la seule couleur.
- [ ] Bandeau cookies : bouton accepter et refuser ont un contraste suffisant et un focus visible, tous deux de même importance visuelle.
- [ ] Navigation principale et sous-site : états ouvert, actif et focus lisibles, y compris sur mobile (`$nav-link-*`, `$sub-nav-*`).
- [ ] Liens « Lire la suite » ou « Voir tout » : le contexte doit rester compréhensible, ne pas masquer le texte visuellement.
- [ ] Les images décoratives (`$img-placeholder`) ne portent aucune information.

## Ce qui n'est pas du ressort du thème

Texte alternatif des images, ordre des titres dans le contenu, libellés de liens, langue des pages et ordre du DOM relèvent de Plone et des contenus. Les signaler à l'équipe quand on les repère, sans les contourner en CSS.
