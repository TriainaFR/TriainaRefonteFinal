# Hébergement et redirections

## L'architecture

```
Cloudflare (DNS + proxy)  →  Railway (npm start)  →  tools/serveur-site.mjs  →  site/
```

Railway est connecté au dépôt GitHub et redéploie à chaque push. Il lance
`npm start`, c'est-à-dire [`tools/serveur-site.mjs`](tools/serveur-site.mjs) :
**c'est ce fichier qui EST le serveur de production**, pas seulement un outil de
développement. Il porte la résolution d'URL, les 301, la vraie page 404, le
cache, la compression et les en-têtes de sécurité.

Il n'y a donc **rien à reporter ailleurs** : la table `REDIRECTIONS` du serveur
est la source de vérité et elle s'applique telle quelle en production. Une seule
exception, déléguée à Cloudflare : **l'apex → www** (voir plus bas).

`vercel.json` a été supprimé le 30/07/2026 — Vercel ne fait pas partie de
l'architecture. Les traductions nginx / Apache / Netlify / Caddy en fin de
document ne servent qu'au cas où l'hébergement changerait un jour.

## Les trois réglages à faire dans Cloudflare

1. **L'enregistrement DNS doit être PROXIFIÉ** (nuage orange). En nuage gris,
   Cloudflare ne fait ni cache, ni compression, ni TLS à la périphérie — et
   l'adresse Railway est exposée en direct.
2. **Redirect Rule apex → www** : `triaina.fr/*` → `https://www.triaina.fr/$1`
   en 301. Tout le site est canonique en `www` ; cette règle est traitée au bord
   du réseau et n'atteint jamais Railway.
3. **Purger le cache après un déploiement qui touche `/assets/`.** Le serveur
   pose un cache de 30 jours sur les assets, mais leurs noms ne portent pas
   d'empreinte (`da31.css`, pas `da31.a1b2c3.css`) : sans purge, un visiteur
   peut garder l'ancien CSS. Le HTML, lui, est toujours revalidé.

## Les redirections à poser

| Source | Destination | Pourquoi |
|---|---|---|
| `/expertise-gsa` | `/expertise-sea` | page supprimée à la refonte |
| `/expertise-contenu` | `/expertise-automatisation-contenu` | seul slug modifié du projet |
| `/blog/optimiser-site-llm-2026-guide-complet` | `/blog/optimiser-site-llm-guide-seo-complet-2026` | **301 déjà vivante en production** |
| `/blog/e-e-a-t-seo-guide` | `/blog/eeat-seo-guide-complet` | 301 déclarée mais jamais appliquée |

> `/recrutement` n'est **pas** redirigée : la page a été **recréée** le
> 30/07/2026 depuis le rendu réel de la production. Elle est au sitemap.

Toutes en **301** (permanent). Une 302 ne transmet pas l'autorité acquise.

## Trois réglages d'hébergement indispensables

1. **Apex → www.** Tout le site est canonique en `https://www.triaina.fr`.
   `triaina.fr` doit rediriger en 301 vers `www.triaina.fr`. C'était l'ancien
   `server.ts` qui s'en chargeait ; il n'existe plus.
2. **URLs sans slash final.** Les pages sont des dossiers (`/faq/index.html`)
   mais tous les canonicals et liens internes sont écrits **sans** slash
   (`/faq`). L'hébergeur doit servir `/faq` directement, sans rediriger vers
   `/faq/` — sinon chaque page coûte une redirection et le canonical ne
   correspond plus à l'URL servie.
3. **Page 404.** [`site/404.html`](site/404.html) doit être servie sur toute URL
   inconnue, **avec un vrai code HTTP 404** (jamais 200 : une « soft 404 »
   pollue l'index).

## Bonne nouvelle : les fichiers sont déjà déposés

L'ancien site servait un `public/_redirects` et un `public/_headers` au format
Netlify — **l'hébergeur de production sait donc lire ces fichiers**. Ils ont été
recréés, à jour, directement dans le livrable :

- [`site/_redirects`](site/_redirects) — les 6 redirections + la règle 404 ;
- [`site/_headers`](site/_headers) — sécurité + cache 30 jours sur `/assets/` et `/images/`.

Ils partent avec le site, sans manipulation. Si l'hébergeur n'est pas de cette
famille, ces deux fichiers sont inertes et il faut alors utiliser une des
traductions ci-dessous.

## Traductions prêtes à coller

### nginx

```nginx
server {
  server_name triaina.fr;
  return 301 https://www.triaina.fr$request_uri;
}

server {
  server_name www.triaina.fr;
  root /var/www/triaina/site;

  error_page 404 /404.html;

  location = /expertise-gsa                              { return 301 /expertise-sea; }
  location = /expertise-contenu                          { return 301 /expertise-automatisation-contenu; }
  location = /blog/optimiser-site-llm-2026-guide-complet  { return 301 /blog/optimiser-site-llm-guide-seo-complet-2026; }
  location = /blog/e-e-a-t-seo-guide                      { return 301 /blog/eeat-seo-guide-complet; }
  location = /recrutement                                 { return 301 /contact; }

  # /faq → /faq/index.html sans redirection
  location / { try_files $uri $uri/index.html $uri/ =404; }

  location /assets/ { expires 30d; add_header Cache-Control "public, max-age=2592000"; }
  location /images/ { expires 30d; add_header Cache-Control "public, max-age=2592000"; }
}
```

### Netlify — fichier `_redirects` à déposer dans `site/`

```
https://triaina.fr/*                                 https://www.triaina.fr/:splat  301!
/expertise-gsa                                       /expertise-sea                 301
/expertise-contenu                                   /expertise-automatisation-contenu 301
/blog/optimiser-site-llm-2026-guide-complet          /blog/optimiser-site-llm-guide-seo-complet-2026 301
/blog/e-e-a-t-seo-guide                              /blog/eeat-seo-guide-complet   301
/recrutement                                         /contact                       301
/*                                                   /404.html                      404
```

### Apache — `.htaccess`

```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^triaina\.fr$ [NC]
RewriteRule ^(.*)$ https://www.triaina.fr/$1 [R=301,L]

Redirect 301 /expertise-gsa                             /expertise-sea
Redirect 301 /expertise-contenu                         /expertise-automatisation-contenu
Redirect 301 /blog/optimiser-site-llm-2026-guide-complet /blog/optimiser-site-llm-guide-seo-complet-2026
Redirect 301 /blog/e-e-a-t-seo-guide                    /blog/eeat-seo-guide-complet
Redirect 301 /recrutement                               /contact

DirectoryIndex index.html
ErrorDocument 404 /404.html
```

### Caddy

```
triaina.fr {
  redir https://www.triaina.fr{uri} permanent
}

www.triaina.fr {
  root * /var/www/triaina/site
  redir /expertise-gsa                              /expertise-sea permanent
  redir /expertise-contenu                          /expertise-automatisation-contenu permanent
  redir /blog/optimiser-site-llm-2026-guide-complet  /blog/optimiser-site-llm-guide-seo-complet-2026 permanent
  redir /blog/e-e-a-t-seo-guide                      /blog/eeat-seo-guide-complet permanent
  redir /recrutement                                 /contact permanent
  try_files {path} {path}/index.html
  handle_errors { rewrite * /404.html
                  file_server }
  file_server
}
```

## En-têtes recommandés

Aucun en-tête n'est déclaré aujourd'hui. À poser côté hébergeur :

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
```

Et surtout un cache long sur `/assets/` et `/images/` (30 jours minimum) : ces
fichiers pèsent 262 ko revalidés à chaque navigation aujourd'hui. Attention, les
noms d'assets ne portent pas d'empreinte (`da31.css`, pas `da31.a1b2c3.css`) :
après une mise à jour du CSS, il faut purger le cache de l'hébergeur.

## Vérifier après la bascule

```bash
for u in /expertise-gsa /expertise-contenu /blog/e-e-a-t-seo-guide /recrutement; do
  curl -s -o /dev/null -w "$u → %{http_code} %{redirect_url}\n" "https://www.triaina.fr$u"
done
curl -s -o /dev/null -w "apex → %{http_code} %{redirect_url}\n" https://triaina.fr/
curl -s -o /dev/null -w "404 → %{http_code}\n" https://www.triaina.fr/url-qui-nexiste-pas
curl -sI https://www.triaina.fr/og-image.jpg | grep -i content-type   # doit dire image/jpeg
```

⚠ Sur l'ancien site, **un code 200 ne prouvait rien** : la SPA répondait 200 en
`text/html` à n'importe quelle URL. Vérifier le `Content-Type`, pas seulement le code.
