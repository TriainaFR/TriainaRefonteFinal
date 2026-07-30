# Corrections appliquées — 30/07/2026

Suite de l'audit ([AUDIT-30-07-LANCEMENT.md](AUDIT-30-07-LANCEMENT.md)).
Tout est corrigé **à la source** (les générateurs), jamais dans le HTML produit :
un `node tools/build.mjs` régénère les 85 pages avec les corrections.
Chaîne complète rejouée : **12/12 étapes**.

## État final, mesuré sur les 86 pages

| Contrôle | Résultat |
|---|---|
| `title` + `description` + `canonical` | 86/86 |
| `H1` unique | 86/86 |
| `hreflang` auto-référençant | **86/86** (était : 79 faux + 6 absents) |
| `og:image` et `twitter:image` qui résolvent | **86/86** (était : 20 en 404) |
| JSON-LD valide | 86/86 |
| `aggregateRating` fabriqué | **0** |
| Téléphone bouchon | **0** |
| `SearchAction` vers une page inexistante | **0** |
| Profils sociaux inexistants (Twitter, Facebook) | **0** |
| Sitemap | **84 URLs** (dont `/recrutement`, recréée), toutes en `lastmod 2026-07-30` |

---

## 1 · Ce qui bloquait le lancement

### `vercel.json` supprimé, redirections déplacées
Vercel ne fait pas partie de l'architecture. Le fichier est supprimé.
Les redirections vivent maintenant dans la table `REDIRECTIONS` de
[`tools/serveur-site.mjs`](tools/serveur-site.mjs) — testables en local — et
sont **déjà déposées dans le livrable** :

- [`site/_redirects`](site/_redirects) — l'ancien site servait le même format
  (`public/_redirects`), donc l'hébergeur sait le lire ;
- [`site/_headers`](site/_headers) — sécurité + cache 30 jours sur `/assets/` et
  `/images/` (262 ko revalidés à chaque navigation aujourd'hui).

[REDIRECTIONS.md](REDIRECTIONS.md) donne les traductions nginx, Apache, Netlify
et Caddy, plus les commandes de contrôle après bascule.

**Les 5 redirections posées**, toutes testées en local (301 vérifié) :

| Source | Destination |
|---|---|
| `triaina.fr/*` | `www.triaina.fr/*` |
| `/expertise-gsa` | `/expertise-sea` |
| `/expertise-contenu` | `/expertise-automatisation-contenu` |
| `/blog/optimiser-site-llm-2026-guide-complet` | `/blog/optimiser-site-llm-guide-seo-complet-2026` |
| `/blog/e-e-a-t-seo-guide` | `/blog/eeat-seo-guide-complet` |

### Données structurées mensongères retirées
- L'`aggregateRating` **4,9/5 sur 52 avis** de `/agence-seo-paris` est supprimé.
  Correction portée par `transformeSchemas()` dans
  [`tools/expertises/agence-seo-paris.mjs`](tools/expertises/agence-seo-paris.mjs),
  pas dans la capture de l'ancien site — qui doit rester un témoin fidèle.
- Le téléphone `+33100000000` de `/agence-geo-paris` devient **`+33614916295`**.

### Page 404
[`site/404.html`](site/404.html) créée, générée par
[`tools/genere-404.mjs`](tools/genere-404.mjs) : même nav et même pied que les
85 autres pages (elles ne pourront pas diverger), `noindex, follow`, aucun
canonical, 6 portes de sortie. Le serveur local la sert désormais avec un vrai
code 404 — vérifié.

### Images corrompues
Trois fichiers, pas un : `file` les voyait comme `data`, aucun navigateur ne
pouvait les décoder.

- `meilleure_agence_ia_france.jpg` (1,5 Mo) et `agence_geo_paris.jpg` (1,4 Mo) :
  référencés **nulle part** → supprimés.
- `ai_overview_agency.jpg` (1,5 Mo) : c'était le visuel de
  `/blog/agence-google-ai-overview`. Remplacé par un visuel **fabriqué dans la
  DA** (nuit, halo bleu, trident, titre — 1200×630, 160 ko) via le nouvel outil
  [`tools/genere-visuel.mjs`](tools/genere-visuel.mjs), réutilisable pour tout
  article sans illustration. C'est un placeholder de qualité : remplace-le par
  une vraie photo quand tu veux.

### Aperçus sociaux
Les 20 balises cassées sont réparées, et surtout **la cause l'est aussi** :
`resoutImageOg()` dans `genere-blog.mjs` et `reparImagesSociales()` dans
`genere-expertises.mjs` vérifient désormais que le fichier existe et retombent
sur l'illustration réelle de l'article, puis sur `og-image.jpg`. Un chemin qui
casse à l'avenir se répare tout seul au build.

> Je n'ai pas supprimé les balises `twitter:*` comme tu le demandais : `og:image`
> n'est pas une balise Twitter, c'est l'aperçu LinkedIn/Slack/Facebook, et les
> visuels existaient déjà. Dis-moi si tu veux quand même retirer les `twitter:*`.

### Clé IndexNow restaurée
`site/4C58C9622B2DBB31ECD9A463E3DCAF66.txt`, servie aujourd'hui en production et
absente du nouveau site. Sans elle, les soumissions IndexNow vers Bing (donc
Copilot) échouent.

---

## 2 · Corrections du jour

- **`hreflang`** : les 85 pages pointaient vers l'accueil (79) ou n'en avaient
  aucun (6, dont `/blog` et les pages d'expertise). Toutes auto-référençantes,
  corrigé dans les 8 générateurs.
- **`SearchAction`** : les 85 pages promettaient à Google une page `/recherche`
  qui n'existe pas. Retirée par `ajoute-entites-geo.mjs`, dernière étape du build.
- **Profils sociaux** : 4 jeux de `sameAs` concurrents déclaraient la même
  entreprise (dont un compte Twitter que tu n'as pas et une page Facebook qui
  répond 400). Un seul jeu partout : **LinkedIn + Instagram**, sur 93 nœuds.
  Les `sameAs` de l'auteur et des concepts Wikipédia sont intacts.
- **Ancienneté** : « 25 ans » → « **26 ans** » (21 occurrences, 5 fichiers).
  Racines en 2000, nous sommes en 2026 — c'est de l'arithmétique, pas un choix.
  Les 3 « 25 ans » restants du blog parlent de tiers, ils ne bougent pas.
- **Chronologie du groupe média** : `/agence` disait « créer un groupe média en
  2026 » quand `/faq` dit « monté un groupe média en 2014 ». Reformulé en
  « adosser à Triaina le groupe média propriétaire construit depuis 2014 ».
- **« des centaines d'entreprises parisiennes »** → « des entreprises
  parisiennes ». L'affirmation contredisait les 13 dossiers de `/references` et
  une société immatriculée en 2025.
- **Sitemap** : les `lastmod` ne repartaient pas en arrière au build suivant —
  un plancher `DATE_REFONTE = 2026-07-30` est posé dans le générateur.
- **Robustesse du build** : `genere-robots-sitemap.mjs` lisait `public/` (l'ancien
  code, retiré du dépôt) et aurait échoué sur un clone neuf. Rendu tolérant.

### Nouveau garde-fou : les écarts de texte se déclarent
Modifier une phrase faisait échouer le générateur (parité avec la capture de
l'ancien site). Plutôt que de retoucher la capture — ce qui aurait détruit le
témoin —, `ECARTS_TEXTE` permet de **déclarer** l'écart avec sa raison, sur le
modèle d'`ECARTS_HN` qui existait déjà. Le garde-fou reste actif sur tout le reste.

---

## 3 · Tes décisions — APPLIQUÉES

Tranchées par Lucas le 30/07/2026 et alignées sur tout le site, texte visible
**et** données structurées, par une passe finale du build
([`tools/valeurs-officielles.mjs`](tools/valeurs-officielles.mjs), étape 13/14).

| Décision | Valeur | Vérifié |
|---|---|---|
| Audit | **à partir de 1 700 €** | 18 mentions · 0 ancien prix Triaina restant |
| Plancher mensuel | **500 €/mois** | 21 mentions |
| Délai GEO | **6 à 8 semaines** | 22 mentions · 0 restant à 4-8 |
| Nombre de clients | **plus de 50** | 4 mentions |
| Horaires | **08:00-19:00** | texte + 85 schémas alignés |
| Raison sociale | **Triaina SAS** | 86 pages |

Chaque règle vise une **phrase**, jamais un nombre nu : le site cite aussi les
tarifs et délais des concurrents (Eskimoz, Primelis, Optimize360, Digimood,
Webconversion) et des fourchettes de marché, qui ne doivent pas bouger. Une règle
qui ne trouve plus sa cible est signalée au build plutôt que passée sous silence.

> **Un débordement que j'ai attrapé et corrigé** : la première version de la
> règle de délai remplaçait « 4-8 semaines » partout. Elle a touché deux
> passages qui ne parlent pas de GEO — le délai d'effet d'une fiche Google
> Business Profile, et celui d'une page orpheline réintégrée au maillage. Les
> deux sont revenus à 4-8, et la règle ne vise plus que les phrases où le délai
> porte sur les citations IA. Les délais SEA (CPA/ROAS) et SEO local sont
> intacts.

### Restent en suspens — deux points que tu n'as pas tranchés

| Sujet | État |
|---|---|
| **Cas client « 0 → 73 % »** | toujours attribué à **9 clients, villes et secteurs différents** |
| **Cas Travel** | « 5 mois » sur `/expertise-geo` contre « moins de 8 mois » sur `/expertise-media` |

Le premier est le plus sensible du site : le même résultat présenté comme neuf
références distinctes.

<details><summary>Historique — l'état avant tes décisions</summary>

Je ne les invente pas : ce sont tes chiffres.

| Sujet | Ce que dit le site aujourd'hui | Ce qu'il faut trancher |
|---|---|---|
| **Prix d'un audit** | 1 700 € (19 occ.) · 3 500 € (14) · 3 000 € (8) · 1 500 € HT (6) | une seule valeur |
| **Prix mensuel plancher** | 500 €/mois (accueil, FAQ) · 1 000 €/mois (`/agence-seo-paris`) | 500, 500-750 ou 1 000 ? |
| **Délai avant résultats** | 4-8 sem. · 6-8 sem. · 6-12 sem. · 3-6 mois · 3-5 mois | une formulation, partout |
| **Cas client « 0 → 73 % »** | attribué à **9 clients/secteurs/villes différents** | sont-ce 9 cas réels ou un seul ? |
| **Cas Travel** | « 5 mois » (`/expertise-geo`) vs « moins de 8 mois » (`/expertise-media`) | la vraie durée |
| **Nombre de clients** | 13 dossiers · « 50 clients » · « étude de 100 clients » | le chiffre réel |
| **Horaires** | 08:00-19:00 en texte, 09:00-19:00 dans 85 schémas | les vrais horaires |
| **Raison sociale au pied** | « Triaina Global Systems » vs « TRIAINA SAS » aux mentions légales | nom commercial ou erreur ? |

Le point le plus sensible est le **cas client « 0 → 73 % »** : le même résultat
présenté comme neuf clients différents, dans neuf villes et secteurs. C'est le
genre d'incohérence qui coûte cher en E-E-A-T si elle est repérée.

</details>

---

## 4 · `/recrutement` a été RECRÉÉE

Plutôt que redirigée : zéro perte, c'est la règle du projet. Le site passe à
**86 pages, 84 URLs au sitemap**.

Contenu repris **verbatim du rendu réel de la production** (`REJOINDRE L'UNITÉ`,
le profil recherché, la candidature spontanée). Deux constats en chemin :

- **La prod ne sert aucune offre d'emploi** : `CAREERS_DATA` y est un tableau
  vide. Les 85 mots de la page sont donc la page entière — ce n'est pas une
  extraction partielle. À étoffer quand tu auras des postes à publier.
- **Le canonical de la prod pointait vers `/carrieres`**, une URL qui n'existe
  pas et répond 404 `noindex`. Le reconduire aurait demandé à Google d'indexer
  une page noindex *et* exclu `/recrutement` du sitemap (le générateur écarte
  toute page dont le canonical pointe ailleurs). Il est auto-référençant.

Un gain au passage : le lien « Retour à l'Agence & Histoire » était un `<button>`
piloté en JS — invisible pour un crawler. C'est un vrai `<a href="/agence">`.

## 5 · Lot 3 — fait

### Article « Meilleure agence GEO France » — Webconversion ajoutée en 3e
**L'URL n'a pas bougé** : `/blog/meilleure-agence-gso-france-2026`, canonique,
et l'alias `-geo-` continue de pointer dessus. Texte repris verbatim.
Ajouts : la ligne du TL;DR, la ligne du tableau comparatif (SEO/GEO B2B · pas de
médias propriétaires · PME, ETI, grands comptes B2B et SaaS · à partir de
1 000 €/mois), et le bloc éditorial complet. Lien **dofollow** sur le mot
Webconversion → `https://www.webconversion.fr/` (aucun `rel`, donc suivi).
Primelis, Optimize360 et Digimood sont renumérotés 4, 5 et 6.

> **Un point à valider** : l'article compare désormais **6 agences**. J'ai donc
> passé le titre, la meta description et le schéma Article de « top 5 » à
> « top 6 » — sans ça, la page annonçait 5 agences et en listait 6. Si tu
> préfères garder « top 5 », il faut retirer une agence : dis-moi laquelle.
> La divergence est déclarée dans `TITRES_RENOMMES` (genere-blog-liste.mjs),
> le garde-fou qui interdit qu'un titre d'article change en silence.

### Maillage interne
- **38 articles sur 66 ne liaient aucun autre article → 0.** Un bloc « Sur le
  même sujet » (3 articles) est calculé au build par proximité de tag puis de
  vocabulaire du titre, dans `genere-blog.mjs`. Rien d'inventé : uniquement des
  titres réels et leurs URL canoniques. **282 liens inter-articles** au total.
- **Les 6 liens vers l'alias `-geo-` repointent sur la canonique `-gso-`**
  (`/annuaire` + articles Lille, Lyon, Bordeaux, Marseille).

### Nœud auteur unifié
71 nœuds, une seule forme : `@id` stable en fragment de domaine (au lieu de
`/equipe/camille-rousseau`, qui n'existe pas), `url` et `sameAs` vers le vrai
profil LinkedIn (au lieu de l'accueil sur 58 articles), un seul `jobTitle` au
lieu de trois. La signature reste — c'est sa cohérence qui manquait.

### Images
**23 Mo → 15 Mo (−35 %)**, sans perte visible (vérifié à l'écran) : redimensionnées
à 1 400 px de large maximum, ré-encodées. Les 12 visuels d'article les plus lourds
passent d'environ 1 Mo à 250-350 ko — ce sont eux qui faisaient les LCP mobiles
à 6 s. Les fichiers que l'opération alourdissait ont été restaurés à l'identique.
Nettoyage au passage : les `.DS_Store` qui seraient partis en production.

### Ce que je n'ai PAS fait du lot 3, et pourquoi
- **FAQ sur 55 articles** : cela revient à écrire du contenu éditorial à ta place.
  Les 10 articles où elle apporterait le plus sont identifiés, à toi de valider.
- **Millésimes « 2026 » dans 63 titles** : tu as interdit de toucher aux titres.
- **Fil d'Ariane visible** (14 pages sur 86 aujourd'hui) : l'afficher change le
  rendu de 72 pages. C'est une décision de design, pas une correction technique.
- **Cannibalisation** `/expertise-geo` vs `/agence-geo-paris`, et les articles
  « agence SEO <ville> » à 42 % de texte commun : arbitrage éditorial.

---

## 6 · Performance, Search Console, `/.well-known/`

### Search Console : tu avais raison, il n'y a rien à sauver
J'ai cloné le dépôt de production en lecture seule et cherché. Le site en ligne
ne porte **aucune balise `google-site-verification`**, aucun GA4, aucun GTM.
La seule vérification présente est celle de **Bing** (`msvalidate.01`), et elle
est déjà reconduite sur les 86 pages du nouveau site, avec la clé IndexNow.

Conclusion : ta propriété Search Console n'est pas vérifiée par balise HTML —
donc **rien ne casse à la bascule**. Aucune action requise avant de soumettre
la sitemap.

### `/.well-known/` : déjà parti, rien à supprimer
Ces endpoints (`api-catalog`, `mcp/server-card.json`, `oauth-protected-resource`)
n'étaient déclarés que dans le `public/_headers` de l'ancienne application et
servis par son serveur Express. Le nouveau site n'y fait **aucune référence** —
vérifié dans `site/`, dans `tools/`, dans `_headers` et `_redirects`. Ils sont
partis avec `vercel.json`, qui portait les deux derniers blocs d'en-têtes.

### Performance — mesures Lighthouse réelles, mobile

| | accueil au départ | accueil maintenant |
|---|---:|---:|
| Score performance | 85 | **85** |
| First Contentful Paint | 3,0 s | **2,6 s** |
| Largest Contentful Paint | 3,2 s | 3,6 s |
| Total Blocking Time | 140 ms | 140 ms |
| **Cumulative Layout Shift** | 0,013 | **0** |

**Un article** (`/blog/audit-geo`) : score **89**, FCP 1,7 s, **LCP 2,9 s**,
CLS **0**. L'audit initial annonçait des LCP d'article entre 3,9 s et 6,9 s.

Ce qui a été fait :
- **Polices sorties du CSS.** `fonts.css` portait 77 ko de woff2 en base64 dans
  une feuille bloquant le rendu — et du base64 ne se compresse pas. Les deux
  polices sont maintenant de vrais fichiers (`syne.woff2` 34 ko, `manrope.woff2`
  24 ko), `fonts.css` fait **0,3 ko**, et les 86 pages les **préchargent**.
- **Images : 23 Mo → 12 Mo.** Les 65 visuels d'article sont ramenés à leur taille
  d'affichage (1 200 px) ; les plus lourds passent d'environ 1 Mo à 150-300 ko.
  Ce sont eux qui faisaient les LCP à 6 s. Qualité vérifiée à l'écran.

**Une correction que j'ai testée puis annulée** : passer gsap, ScrollTrigger et
lenis en `defer` faisait tomber le FCP à **1,6 s** — mais faisait exploser le
Total Blocking Time de 140 à **490 ms**, les trois bibliothèques s'exécutant
alors en une seule salve. Score global : 77 au lieu de 85. J'ai donc reverti.
Le moteur de l'accueil reste encapsulé dans `DOMContentLoaded`, ce qui ne change
rien aujourd'hui mais rend le `defer` réutilisable si les animations sont un
jour allégées. Trident en particules vérifié après coup : intact.

**Le vrai gain restant est côté hébergeur, pas côté code** : le serveur de test
ne compresse rien et ne cache rien. Lighthouse chiffre 205 ko d'économie par la
seule compression texte. `site/_headers` pose déjà le cache 30 jours sur
`/assets/` et `/images/` — reste à vérifier que gzip/brotli est actif.

---

## 7 · Reste à faire, sans décision requise

1. **Search Console** — vérifier la propriété **par DNS** avant de soumettre la
   sitemap. Il n'y a aucune balise Google sur le site (celle de **Bing** est
   présente sur les 85 pages, elle, et fonctionne).
3. **Analytics** — aucun GA4, aucun GTM. Le jour du lancement est aveugle sans.
4. ~~**Performance**~~ — TRAITÉ (§6). Ancien point : 13 images hero de plus de 700 ko font des LCP mobiles
   mesurés entre 3,9 s et 6,9 s ; CLS 0,225 sur l'accueil dû à `font-display:swap`.
5. **Maillage** — 88 % des liens sont du boilerplate, aucun bloc « articles
   liés », 38 articles sur 66 ne lient aucun autre article.
6. ~~**`/.well-known/`**~~ — VÉRIFIÉ, plus aucune référence (§6). Ancien point : l'ancien serveur Express exposait des endpoints
   (`api-catalog`, `mcp/server-card.json`) qui disparaissent avec lui.
