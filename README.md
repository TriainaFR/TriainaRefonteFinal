# Triaina — site statique

Le site de [triaina.fr](https://www.triaina.fr) en HTML statique : **86 pages**,
dont 67 articles de blog. Aucun framework, aucun rendu côté serveur — le dossier
`site/` se dépose tel quel sur n'importe quel hébergeur statique.

## Structure

| Dossier | Rôle |
|---|---|
| `site/` | **Le site livré.** 198 fichiers, autonome : aucune ressource n'y pointe hors du dossier. |
| `tools/` | Les générateurs qui produisent `site/` à partir des contenus figés. |
| `tools/contenus/` | Contenu HTML des articles, extrait une fois pour toutes. |
| `tools/contenus-pages/` | Blocs de contenu des pages hors blog. |
| `tools/sources/` | Codes fournis servant de source de vérité (expertises SEA, GEO, Média, Automatisation). |
| `tools/snapshots/` | Captures de référence par rendu réel, utilisées comme juge de parité. |
| `tools/reference/` | Textes gelés : un générateur échoue si un mot bouge. |
| `REDIRECTIONS.md` | Les 301 à poser chez l'hébergeur, traduites pour nginx, Apache, Netlify et Caddy. |

## Régénérer le site

```bash
npm i -D esbuild typescript   # une seule fois, en local
node tools/build.mjs
```

> `esbuild` et `typescript` ne sont **pas** déclarés dans `package.json`, et
> c'est volontaire : Railway les installait à chaque déploiement — esbuild y
> télécharge un binaire par script `postinstall` — pour deux outils que la
> production n'exécute jamais. C'était le seul maillon du déploiement capable
> d'échouer. Le dépôt n'a désormais **aucune dépendance** : Railway clone,
> et démarre.

La chaîne enchaîne les 14 générateurs dans l'ordre. Cet ordre n'est pas
cosmétique : `ajoute-entites-geo` doit passer après tous les autres (sinon les
entités GEO du schéma se perdent en silence), `valeurs-officielles` aligne les
prix et délais tranchés par Lucas sur les pages produites, et `normalise-urls`
ferme la marche pour qu'aucune URL sans `www` ne subsiste.

> Le script npm s'appelle **`regenere`**, pas `build`. Ce n'est pas un caprice :
> Railpack, le builder de Railway, exécute automatiquement un script nommé
> `build` au déploiement. Or régénérer au déploiement n'aurait aucun sens —
> `site/` EST le livrable, versionné et vérifié, et la régénération réclame
> l'ancien code React qui ne fait plus partie du dépôt. Sans script `build`,
> Railway installe et démarre, point.

## Servir le site en local

```bash
node tools/serveur-site.mjs
```

## Déploiement

```
Cloudflare (DNS + proxy)  →  Railway  →  npm start  →  tools/serveur-site.mjs  →  site/
```

Railway est connecté à ce dépôt et redéploie **à chaque push**. Il ne construit
rien ([`railway.json`](railway.json) le lui dit explicitement) : `site/` est le
livrable, déjà généré et versionné. Il lance `npm start`.

`tools/serveur-site.mjs` est donc le serveur de **production** autant que celui
de développement. Il porte : la résolution d'URL (`/faq` → `/faq/index.html`,
sans redirection), les 301, `site/404.html` avec un vrai code 404, le cache
(30 jours sur les assets, revalidation sur le HTML), la compression brotli/gzip
(−73 % sur l'accueil, −94 % sur le sitemap) et les en-têtes de sécurité. En
local il se met en `no-store` pour toujours servir le dernier build.

Tout est dans [REDIRECTIONS.md](REDIRECTIONS.md), y compris les trois réglages
à faire côté Cloudflare (proxy activé, redirection apex → www, purge du cache
après un déploiement qui touche `/assets/`).

## Prévenir Bing après un déploiement (IndexNow)

```bash
node tools/indexnow.mjs          # les 86 URLs du sitemap
node tools/indexnow.mjs --essai  # montre sans envoyer
node tools/indexnow.mjs --url=https://www.triaina.fr/blog/mon-article
```

À lancer **après** le déploiement, jamais avant : la notification vaut pour ce
qui est en ligne, et le script refuse d'envoyer tant que le fichier de clé ne
répond pas sur le domaine. IndexNow alimente l'index Bing, lui-même source des
citations de Microsoft Copilot — c'est un levier GEO autant que SEO.

> La clé est `f077fac3a598ab5dc3e0ae0f7da7ab7e`, servie par
> `site/f077fac3a598ab5dc3e0ae0f7da7ab7e.txt`. Elle est **différente** de
> `4C58C9622B2DBB31ECD9A463E3DCAF66.txt`, que le site sert aussi : cette
> valeur-là est le jeton de vérification Bing Webmaster, et Bing la refuse
> comme clé IndexNow (403 `UserForbiddedToAccessSite`) parce qu'il la rattache
> à un compte. Une clé IndexNow s'auto-délivre : n'importe quelle chaîne hexa
> convient tant que le domaine la sert en `text/plain`.

## Ce qui est figé — à savoir avant d'y toucher

Le code de l'ancienne application React a été **supprimé le 30/07/2026**. Deux
générateurs en dépendaient :

- `genere-blog.mjs` et `genere-blog-liste.mjs` lisaient `views/blog/*.tsx` et
  `constants.ts` pour reconstruire les 67 articles et la grille du blog.

Ils sont désormais **sautés automatiquement** par `tools/build.mjs`, qui signale
l'étape ignorée au lieu d'échouer. Conséquences concrètes :

- **les pages d'article sont figées** dans `site/blog/` — les modifier se fait
  directement dans leur HTML ;
- **tout le reste reste régénérable** : expertises, FAQ, contact, références,
  annuaire, mentions légales, accueil, sitemap, robots.txt, llms.txt.

Un changement global sur les articles (pied de page, barre de navigation, police)
demande donc une passe manuelle sur les 67 fichiers, ou de restaurer les sources
depuis la sauvegarde.

## Garde-fous

Plusieurs générateurs échouent volontairement plutôt que de produire une page
dégradée. Ce n'est pas de la rigidité : chacun correspond à un incident réel.

- **parité de texte** — le texte du `<main>` est comparé mot à mot à une
  référence figée ; le générateur pointe le mot exact qui a bougé ;
- **hiérarchie Hn** — la séquence des titres doit correspondre à la capture de
  l'ancienne page, sauf écarts déclarés explicitement ;
- **graphe de liens** — les liens rendus doivent être exactement ceux des blocs
  de contenu : rien d'ajouté, rien de perdu ;
- **compteur d'articles** — l'accueil affiche le nombre réel d'articles
  canoniques, recalculé à chaque build ; le générateur échoue si le marqueur
  disparaît.

## Vérifier après un build

```bash
node tools/normalise-urls.mjs --verifie   # échoue s'il reste une URL sans www
node tools/seo-snapshot.mjs tools/snapshots/apres --base=http://localhost:8090
node tools/seo-diff.mjs tools/snapshots/avant tools/snapshots/apres
```
