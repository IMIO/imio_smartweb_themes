### Release du thème de base (`@imiobe/plonetheme-smartweb-base`)

La publication sur npm se fait dans GitHub Actions, sans jeton ni OTP sur ton poste.

#### Faire une release

```bash
pnpm release:base            # patch : 1.0.3 → 1.0.4
pnpm release:base minor      # 1.0.3 → 1.1.0
pnpm release:base 1.2.0      # version explicite
pnpm release:base --dry-run  # montre ce qui serait fait, sans rien modifier
git push
```

`pnpm release:base` (sur `main`, dépôt propre) ne touche qu'à `base/` :

1. monte la version de `base/package.json` ;
2. ajoute l'entrée dans `base/CHANGELOG.md` (commits de `base/` depuis le dernier tag `base-v*`) ;
3. crée le commit `chore(base): release x.y.z`.

Au `git push`, le workflow `release-base.yml` voit que `base/package.json` a changé. Si
la version n'existe pas encore sur npm, il :

1. publie le paquet sur npm (avec provenance) ;
2. crée le tag `base-vx.y.z` et la release GitHub.

Si la version est déjà publiée, il ne fait rien. On peut le relancer à la main depuis
l'onglet Actions (« Run workflow »), par exemple après un échec.

#### Épingler la nouvelle version dans les thèmes

Commande séparée, à lancer quand tu veux faire passer les thèmes sur la nouvelle base :

```bash
pnpm pinned-theme            # version de base/package.json
pnpm pinned-theme 1.0.4      # version explicite
pnpm pinned-theme --dry-run  # liste ce qui changerait
git push                     # déclenche le build des thèmes modifiés
```

Elle met à jour les thèmes épinglés sur une version exacte de la même version
majeure et crée le commit `chore: pin base x.y.z in themes`. Les thèmes en
`workspace:*` et ceux restés sur une autre version majeure (ex. `0.3.x`) ne sont pas
touchés ; `--all` inclut ces derniers.

#### Configuration (une seule fois)

Sur npmjs.com, avec un compte propriétaire du paquet :
**@imiobe/plonetheme-smartweb-base → Settings → Trusted Publisher → GitHub Actions**

| Champ             | Valeur                 |
| ----------------- | ---------------------- |
| Organization      | `IMIO`                 |
| Repository        | `imio_smartweb_themes` |
| Workflow filename | `release-base.yml`     |
| Environment       | (vide)                 |

Ensuite, dans **Settings → Publishing access**, on peut choisir « Require two-factor
authentication and disallow tokens » : seul ce workflow pourra publier.

Le workflow tourne sur `ubuntu-latest` : le Trusted Publishing de npm ne fonctionne
pas avec les runners auto-hébergés (`gha-runners-smartweb`).
