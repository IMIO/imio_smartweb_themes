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

`pnpm release:base` (sur `main`, dépôt propre) :

1. monte la version de `base/package.json` ;
2. ajoute l'entrée dans `base/CHANGELOG.md` (commits de `base/` depuis le dernier tag `base-v*`) ;
3. épingle la nouvelle version dans tous les thèmes qui utilisaient la précédente ;
4. crée le commit `chore(base): release x.y.z`.

Au `git push`, le workflow `release-base.yml` voit que `base/package.json` a changé. Si
la version n'existe pas encore sur npm, il :

1. publie le paquet sur npm (avec provenance) ;
2. crée le tag `base-vx.y.z` et la release GitHub.

Si la version est déjà publiée, il ne fait rien. On peut le relancer à la main depuis
l'onglet Actions (« Run workflow »), par exemple après un échec.

Les builds des thèmes déclenchés par le même push utilisent la base du dépôt (lien du
workspace pnpm), pas celle de npm : ils ne dépendent pas de la publication.

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
