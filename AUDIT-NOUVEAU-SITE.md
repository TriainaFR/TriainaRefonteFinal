# Audit du nouveau site statique (DA-31) — 29/07/2026

Périmètre : les 81 pages de `site/`, servies telles quelles.
Méthode : extraction mécanique du HTML servi (5 769 liens `<a>`, tous les blocs
JSON-LD), contrôle au rendu réel Chrome sur les points litigieux, puis capture
avant/après et diff bloquant (`seo-snapshot` + `seo-diff`).

**Statut : tout est corrigé, sauf la réécriture éditoriale des titres**, qui
attend un arbitrage — voir [AUDIT-PROPOSITIONS-TITRES.md](AUDIT-PROPOSITIONS-TITRES.md).

---

## Résultat en un coup d'œil

| Anomalie | Avant | Après |
|---|---:|---:|
| Liens internes en 404 | 16 | **0** |
| Liens `href="#"` (morts pour un crawler) | 8 | **0** |
| Pages affichant du texte doublement échappé | 24 | **0** |
| Canonicals sur le mauvais hôte (sans `www`) | 60 | **0** |
| URLs internes totales sans `www` | 214 | **0** |
| Titres avec « Triaina » écrit deux fois | 65 | 4 *(redites de phrase, proposées)* |
| Questions de FAQ absentes du texte visible | 7 | **0** |
| Pages servant le graphe du site en double | 1 | **0** |
| Pages avec deux `<h1>` | 1 | **0** |
| Titres tronqués en SERP (> 65 car.) | 47 | 29 *(éditorial, proposé)* |
| Sauts de hiérarchie Hn | 35 | 20 *(structure des articles)* |

Contrôle de non-régression : capture des 81 pages avant/après, déterminisme
prouvé (deux captures du code inchangé → strictement identiques). Chaque écart
du diff final est rattaché à une correction voulue, aucune surprise.

---

## Ce qui était sain, et l'est resté

| Contrôle | Résultat |
|---|---|
| Texte dans le HTML servi (contrainte n° 1) | home 71 k car., article 21 k — **aucun texte dépendant du JS** |
| Pages orphelines | **0** |
| JSON-LD invalide | **0** |
| Images en 404 | **0** |
| `og-image.jpg` | 200, `image/jpeg`, 71 ko |
| `robots.txt` | GPTBot, Google-Extended, PerplexityBot, ClaudeBot, CCBot autorisés |
| Dates d'articles | 60/60 avec `datePublished` **et** `dateModified` |

---

## Corrections appliquées

### 1. Sommaires d'articles doublement échappés — 24 pages

Le lecteur lisait `Top 5 des agences SEO &amp; GEO à Lyon`, `qu&amp;#x27;ils`,
`&amp;quot;Bon&amp;quot;`. Le `<h2>` voisin, lui, était correct : c'était le
sommaire seul.

Cause : [`genere-blog.mjs`](tools/genere-blog.mjs) extrayait le texte du `<h2>`
depuis son **HTML interne** (donc déjà échappé) puis le ré-échappait à
l'injection. Correction : décodage à l'extraction (`deech`), le NBSP restitué en
U+00A0 pour ne pas casser la typographie française.

> **Correction de mon rapport initial** : j'avais annoncé 6 pages. Je n'avais
> cherché que les esperluettes ; le défaut touchait aussi les apostrophes et les
> guillemets, soit **24 pages**. Mesuré sur les captures avant/après.

### 2. Graphe du site servi en double sur `/expertise-gsa`

> **Correction de mon rapport initial** : je l'avais classé en régression de la
> migration. C'est faux — la capture de l'ancien site contient déjà les deux
> blocs. L'ancienne SPA les émettait en double.

Et ce n'était pas un simple doublon mais un **conflit** : deux définitions du
même `@id` (`…/#organization`), l'une nommant la marque « Agence SEO & GEO
Paris » (celle des 80 autres pages), l'autre « Agence SEO & GSO Paris ». Google
en retient une au hasard. Le générateur ne garde plus qu'un bloc par jeu d'`@id`.

### 3. « Triaina » écrit deux fois — 61 titres

`SEO.tsx` ajoutait ` | Triaina` sans regarder si le titre finissait déjà par
`- Triaina`. Le suffixe n'est plus ajouté quand la signature est là. **18 titres
repassent sous la limite d'affichage** du seul fait de cette correction.

Restent 4 titres où « Triaina » est dans la phrase *et* en signature : ce n'est
pas un bug mais une redite, proposée à l'arbitrage.

### 4. Deux hôtes canoniques sur le même site — 214 URLs

Les 60 articles déclaraient leur canonical sur `https://triaina.fr`, le reste du
site sur `www`. Plus grave et invisible : le **même nœud `Organization` était
déclaré sous deux `@id` différents** selon la page, ce qui empêche Google de
consolider l'entité. Nouvel outil [`normalise-urls.mjs`](tools/normalise-urls.mjs),
idempotent, en fin de chaîne. Vérifié : aucune de ces occurrences n'était dans
le texte d'un article, uniquement des URLs structurelles.

### 5. Sitemap contradictoire

`/expertise-gso` et `/blog/meilleure-agence-geo-france-2026` étaient annoncées au
sitemap alors que leur canonical désigne une autre URL. Le générateur les écarte
désormais **en lisant le canonical de chaque page** — règle générale, pas une
liste en dur. Les URLs restent servies, les liens internes intacts :
l'indexation acquise ne bouge pas. Sitemap : 81 → 79 URLs.

### 6. FAQ déclarées mais invisibles

Google exige que le contenu d'un `FAQPage` soit visible. Deux situations
distinctes, traitées différemment :

- `/blog/ia-analyse-donnees-optimisation-seo-2026` : 5 questions, **aucune
  section FAQ** dans l'article → les Q/R sont désormais rendues, dans la même
  convention que les autres articles. Vérifié au navigateur : 5/5 visibles,
  synchronisées au schéma, reprises dans le sommaire.
- `/agence-geo-paris` et `/agence-referencement-ia` : la question existait mais
  sous un libellé plus court que celui du schéma. **C'est la page qui fait foi**
  pour ce qui est visible → c'est le schéma qui est aligné sur elle, pas
  l'inverse. Aucun texte visible modifié.

### 7. Liens morts — 16 en 404, 8 en `href="#"`

Toutes les cibles ont été vérifiées : **aucune n'avait de route sur l'ancien
site**, c'étaient de vraies fuites déjà en production. Repointées vers les pages
réelles d'après le libellé du lien, table documentée dans
[`liens-repares.mjs`](tools/liens-repares.mjs). Les cibles visent toujours
l'URL **canonique**, pour ne pas envoyer de maillage vers une page qui se
déclare non canonique.

### 8. Deux `<h1>` sur `/agence-referencement-ia-paris`

Le second passe en `<h2>`. Son allure à l'écran est préservée à l'identique
(vérifié au navigateur : 36,8 px / graisse 800 dans les deux cas) — la
correction est sémantique, elle ne déplace rien.

### 9. Hiérarchie Hn du pied de page

Les intitulés de colonne étaient des `<h4>` : sur 81 pages, la hiérarchie sautait
du niveau 2 au niveau 4. Ce sont des **étiquettes de navigation**, pas des
sections : elles sortent de la hiérarchie et deviennent des paragraphes. Texte et
style inchangés.

### 10. `llms.txt`

Ajouté, généré depuis les pages réelles (donc jamais périmé). À relativiser :
Google Search l'ignore. Son intérêt est le coût quasi nul pour un gain possible
côté citation IA.

---

## Outillage ajouté

- [`tools/build.mjs`](tools/build.mjs) — rejoue la chaîne complète dans l'ordre.
  Il n'existait pas : l'ordre était tenu de mémoire, alors qu'une étape oubliée
  (`ajoute-entites-geo`) fait perdre les entités GEO en silence.
- [`tools/normalise-urls.mjs`](tools/normalise-urls.mjs) — force `www`, avec un
  mode `--verifie` qui échoue s'il reste une URL sur le mauvais hôte.
- [`tools/liens-repares.mjs`](tools/liens-repares.mjs) — table des liens morts.

---

## Ce qui reste, et pourquoi

- **29 titres tronqués + 4 redites de marque + `/expertise-gsa`** → proposés
  dans [AUDIT-PROPOSITIONS-TITRES.md](AUDIT-PROPOSITIONS-TITRES.md), non
  appliqués : un `<title>` est la ligne affichée dans Google sur des pages
  positionnées, c'est un arbitrage de marque.
- **20 descriptions > 165 caractères** → non réécrites : la meta description
  n'est pas un facteur de classement et Google la réécrit le plus souvent.
- **20 sauts de Hn restants** → tous dans le corps des articles (« TL;DR » en
  H3, « Cas Client » en H4). Structure éditoriale héritée, impact faible.
- **9 réponses de FAQ absentes du DOM** (`/expertise-media` notamment) —
  déjà ainsi sur l'ancien site.
- **2 paires d'URLs en doublon** (`/expertise-gso` ≡ `/expertise-geo`,
  `meilleure-agence-geo` ≡ `-gso`) : assumées, sitemap assaini. Basculer la
  marque GSO → GEO reste une décision à part.
