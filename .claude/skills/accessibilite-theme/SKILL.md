---
name: accessibilite-theme
description: Contrôle l'accessibilité (WCAG 2.1 AA) d'un thème smartweb : contrastes texte/fond calculés depuis les variables SCSS, survol et focus, titres, effets et mouvements. À utiliser quand on intègre ou modifie des couleurs, typos, états hover/focus ou animations d'un thème, ou quand l'utilisateur demande un audit d'accessibilité ou de contraste d'un thème.
argument-hint: <theme>
---

# Accessibilité d'un thème smartweb

Référentiel : **WCAG 2.1 niveau AA** (c'est ce que reprend la norme EN 301 549 applicable aux sites publics). Viser 2.2 AA quand c'est gratuit.

Le HTML est fourni par Plone et ne change pas. Un thème n'agit donc que sur la **couleur, la typo, les états, la taille, les effets**. C'est là que se jouent les contrôles ci-dessous.

## 1. Contrôle automatique

```bash
node scripts/a11y-check.js <theme>        # contrastes + lint SCSS
node scripts/a11y-check.js base           # valeurs par défaut de la base
node scripts/a11y-check.js <theme> --json
```

Le script compile `variables.scss` du thème puis celui de la base (même ordre que `main.scss`) et calcule le ratio de chaque paire texte/fond listée dans `PAIRS`. Code de sortie 1 s'il y a un échec franc.

Lecture des résultats :

| Symbole | Sens | Action |
|---|---|---|
| ✔ | Ratio suffisant | Rien |
| ✘ | Échec sur deux variables connues | Corriger. Le script propose la teinte conforme la plus proche |
| ? | Fond supposé (blanc) ou translucide (image derrière) | Vérifier visuellement sur le site, le script ne peut pas conclure |

Seuils : texte normal **4.5:1**, grand texte (≥ 24 px, ou ≥ 18.66 px en gras) **3:1**, icônes et composants d'interface **3:1**.

Ne jamais corriger une couleur en silence : une couleur de maquette vient d'un graphiste. Présenter l'échec, la valeur proposée, et laisser l'utilisateur valider avec lui. Si l'échec vient d'une valeur par défaut de la base, la correction se fait dans la base et pas dans le thème.

## 2. Ce que le script ne voit pas : à vérifier à la main

Parcourir `references/checklist.md`, en particulier :

- **Hover / focus** : chaque état au survol a un équivalent au clavier, avec un indicateur de focus visible (≥ 3:1 contre le fond).
- **Texte sur image** (bandeau, À la une) : contraste suffisant sur toute l'image, pas seulement sur celle de la maquette.
- **Titres** : la taille visuelle ne doit pas dicter le niveau. Pas de variable de taille qui inverse la hiérarchie (`h3` plus grand que `h2`).
- **Effets** : animations, transitions longues, parallaxe, autoplay du swiper → respecter `prefers-reduced-motion`.
- **Zoom 200 % et mobile** : pas de hauteur fixe en px qui coupe le texte (`$banner-heigh`), pas de défilement horizontal.

## 3. Vérification visuelle sur le site local

Le site tourne sur le port 8080 (`pnpm watch --env theme=<theme>`). Avec les outils `mcp__t3-code__preview_*`, ouvrir la page d'accueil et une page de contenu, puis :

1. Parcourir la page à la touche Tab : le focus est-il toujours visible, dans un ordre logique ?
2. Survoler les liens et boutons principaux : l'état survol reste-t-il lisible ?
3. Zoomer à 200 % (`preview_resize` sur une largeur de 640 px) : rien n'est coupé ni superposé ?

## 4. Rapport

Terminer par un résumé court : échecs (avec valeurs proposées), points à vérifier, ce qui n'a pas pu être contrôlé. Ne pas annoncer « accessible » : le contrôle automatique ne couvre qu'une partie du WCAG, dire ce qui a été vérifié.

## Maintenir la liste des paires

`PAIRS` dans `scripts/a11y-check.js` associe une variable de texte à une variable de fond. Quand une section de la base reçoit de nouvelles variables de couleur, ajouter la paire correspondante.
