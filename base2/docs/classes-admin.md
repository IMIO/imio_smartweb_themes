# Classes admin (base2)

Classes à saisir dans le champ **« Classe CSS »** d'une section (onglet Mise en page, réservé au Manager). Le core les ajoute à l'enveloppe `div.sortable-section`. Elles se combinent, séparées par un espace :

```
fond-alterne pleine-largeur titre-centre
```

Code : `src/scss/sections/_admin.scss`. Réglages : `src/scss/settings/_sections.scss` (bloc « Classes admin »). Test : `node scripts/base2/scenarios.mjs admin-classes admin-classes-mobile`.

> **Statut : proposition à valider.** Les noms et la liste peuvent encore changer avant la première version.

## Utilitaires

| Classe | Effet | Variables |
|---|---|---|
| `fond-alterne` | Bloc sur fond gris clair, aligné sur la colonne de contenu. | `$band-alt-bg`, `$box-padding` |
| `fond-accent` | Bloc sur la couleur d'accent : texte, titres, liens et focus passent en clair, les cartes gardent leurs couleurs. | `$band-accent-bg`, `$band-accent-color` |
| `fond-sombre` | Comme `fond-accent`, sur fond sombre. | `$band-dark-bg`, `$band-dark-color` |
| `pleine-largeur` | Avec un `fond-*` : la bande va d'un bord à l'autre de l'écran, le contenu reste aligné sur la page. | `$band-padding-y` |
| `encadre` | Bloc arrondi avec marge intérieure (bordure fine s'il n'a pas de fond). Avec `pleine-largeur`, bloc blanc posé dans la bande. | `$box-padding`, `$box-radius` |
| `titre-centre` | Titre, description et lien « Voir tout » centrés. | — |
| `titre-masque` | Titre retiré de l'écran mais lu par les lecteurs d'écran : la hiérarchie des titres reste complète. À préférer à « Masquer le titre » du core quand le contenu suit un titre implicite. | — |
| `espace-reduit` | Moitié de l'espace habituel sous la section. | — |
| `sans-espace` | Aucun espace sous la section (pour coller deux bandes). | — |

Les contrastes de `fond-accent`, `fond-sombre` et des liens sur `fond-alterne` sont contrôlés à la compilation : un thème qui change ces couleurs reçoit un avertissement si le texte n'atteint pas 4,5:1.

## Classes de composition

Elles reprennent les noms V1 les plus utilisés, pour que le contenu existant garde un rendu correct quand un site passe en V2.

| Classe | Usage V1 | Effet en V2 | Variables |
|---|---|---|---|
| `quick-access` | Base V1, 115 thèmes | Section Liens : tuiles d'icônes de largeur fixe, centrées, titre centré. | `$quick-access-tile-width` |
| `a-la-une` | Base V1, 81 thèmes | Titres de cartes plus grands ; en tableau, la première carte occupe deux colonnes. | `$featured-title-font-size` |
| `partenaires` | 22 thèmes | Logos entiers (non recadrés), carrés, sur fond blanc. | `$partner-logo-padding` |

## Classes V1 non reprises

Elles relèvent de maquettes propres à certains thèmes (copiées d'un thème à l'autre) et se reconstruisent avec les utilitaires ci-dessus :

| Classe V1 | Thèmes | Équivalent proposé |
|---|---|---|
| `espace-citoyen`, `espace-citoyen-bloc` | 52 | `fond-alterne encadre titre-centre` |
| `section-en-image` | 44 | image de fond du core (option Manager) |
| `bloc-newsletter` | 29 | `fond-accent pleine-largeur titre-centre` |
| `site-cpas` | 25 | classe propre au thème communal |
| `home-partenaires`, `quick-partenaires`, `sites-partenaires` | 7 à 21 | `partenaires` |
| `bloc_news`, `image-actualites-accueil` | 7 à 21 | `a-la-une` |
| `quick-annuaire`, `liens-accueil` | 7 à 17 | `quick-access` |
| `albumhome`, `galerie-accueil`, `home-video` | base V1 / 13 à 17 | `fond-sombre pleine-largeur` |

Un thème communal V2 peut toujours ajouter ses propres classes dans son `main.scss` ; il est conseillé de les construire sur les mêmes variables et de les documenter dans le thème.
