# Audit avant lancement — 30/07/2026

85 pages statiques. Méthode : extraction mécanique des 85 pages + capture du DOM rendu par
Chrome sur les 85 routes + Lighthouse + 10 audits spécialisés. Un contre-audit adversarial a
été lancé sur chaque constat ; **il n'a abouti que sur la dimension canonical/indexation**
(la session s'arrête avant la fin). Les constats des autres dimensions sont donc **à vérifier
avant correction** — la colonne « vérifié » le précise.

Sitemap : les 83 `<lastmod>` sont passés à **2026-07-30** comme demandé. XML revalidé.

---

## 1. Ce qui BLOQUE la mise en ligne

### 1.1 Le déploiement ne servirait pas le site — VÉRIFIÉ DEUX FOIS
`vercel.json` ne déclare **aucun `outputDirectory`**. Le livrable est dans `site/`, mais Vercel
servirait la racine du dépôt : **les 85 URLs répondraient 404**.

Second problème enchaîné : `package.json` déclare un script `build` que Vercel relancerait au
déploiement, et **il échoue sur un clone frais** (l'ancien code React n'est plus dans le dépôt,
les générateurs d'articles n'ont plus leur source).

Correction, dans `vercel.json` :

```json
{
  "outputDirectory": "site",
  "buildCommand": null,
  "cleanUrls": true,
  "trailingSlash": false
}
```

⚠ Un audit affirme aussi que **la production n'est pas sur Vercel mais sur Railway** — donc que
`vercel.json` n'a jamais servi. À confirmer avant toute bascule : si c'est exact, il faut
d'abord créer le projet Vercel et pointer le DNS, et les redirections doivent être portées par
l'hébergeur réellement utilisé.

### 1.2 Deux données fausses publiées en JSON-LD — risque d'action manuelle Google
- `/agence-seo-paris` déclare un **`aggregateRating` de 4,9/5 sur 52 avis** alors qu'aucun avis
  n'existe sur le site. C'est le motif exact de la pénalité « Problème lié aux données
  structurées ». **À supprimer avant la mise en ligne.**
- `/agence-geo-paris` publie un **téléphone bouchon `+33100000000`** dans son `LocalBusiness`.
  À remplacer par le vrai numéro ou à retirer.

### 1.3 URLs perdues au basculement
La table de routage réelle de la production contient **91 URLs** (sa sitemap n'en déclare que
62 — elle sous-déclare). **7 tomberaient en 404 demain**, dont :

| URL de production | Statut aujourd'hui | À faire |
|---|---|---|
| `/recrutement` | page complète, canonique, indexable | recréer **ou** 301 → `/contact` |
| `/blog/optimiser-site-llm-2026-guide-complet` | **301 vivante** | reporter la 301 dans la config |
| `/blog/e-e-a-t-seo-guide` | 301 déclarée jamais appliquée | 301 → `/blog/eeat-seo-guide-complet` |

Vérifie les 4 autres dans le détail avant bascule. Rien ne garantit non plus la redirection
**apex → www** (`triaina.fr` → `www.triaina.fr`) : elle n'existait que dans l'ancien `server.ts`.

### 1.4 Une image hero corrompue
Un fichier hero de **1,59 Mo est illisible par le navigateur** (fichier corrompu, pas seulement
lourd). La page concernée s'affiche sans son visuel.

### 1.5 Aperçus sociaux vides sur 10 pages
**20 balises `og:image`/`twitter:image` pointent vers un fichier absent.** Les visuels existent,
mais sous `site/images/articles/` alors que les balises disent `/images/`.

Pages : `/agence-seo-paris`, `/agence-referencement-ia`, `/agence-referencement-ia-paris`, et les
articles `agence-seo-montpellier-2026`, `agence-seo-nantes-2026`, `agence-seo-strasbourg-2026`,
`maillage-interne-seo-2026`, `optimiser-ai-overview-2026`, `referencement-ia-ecommerce-2026`,
`strategie-contenu-seo-2026`.

C'est une régression : la prod actuelle, elle, affiche bien une image.

---

## 2. À corriger dans la journée (n'empêche pas de sortir)

**Contradictions factuelles à travers le site** — le point le plus abîmant pour la confiance,
côté Google comme côté IA :

| Sujet | Ce que dit le site |
|---|---|
| Ancienneté | 26 ans sur l'accueil, 25 ans sur `/agence` et `/expertise-seo` |
| Prix d'un audit | de 1 700 € à 3 500 € selon la page, JSON-LD compris |
| Cas client « 0 → 73 % de citations IA » | attribué à 7 secteurs et villes différents |
| Nombre de clients | 13 sur `/references`, « des centaines » sur `/agence-seo-paris` |
| Délai de résultat | 5 réponses différentes |
| Groupe média | créé en 2026, en 2014, ou « dix ans » avant ChatGPT selon la page |

**Mesure d'audience — il n'y a rien.** Aucun GA4, aucun GTM, aucune balise de vérification
Search Console sur les 85 pages. Avant de soumettre la sitemap : **vérifie la propriété Search
Console par DNS** (elle survit à un changement d'hébergeur, contrairement à une balise HTML) et
ajoute au moins GA4, sinon le jour du lancement est aveugle.

**Technique**
- `hreflang` pointant vers l'accueil au lieu de la page elle-même sur **79 pages**.
- `SearchAction` du schéma `WebSite` pointe vers `/recherche`, qui n'existe pas — sur les 85 pages.
- Pas de `site/404.html` : Vercel servirait sa page d'erreur générique.
- Entité `Organization` éclatée : plusieurs pages déclarent deux entités concurrentes avec des
  `sameAs` et un logo contradictoires.

**Performance (Lighthouse mobile réel)**
- 13 articles ont une image hero de plus de 700 ko → **LCP mesuré entre 3,9 s et 6,9 s**.
- **CLS 0,225** sur l'accueil en desktop, causé à 100 % par `font-display:swap`.
- L'hébergement actuel **ne compresse rien** : 12 points de Performance mobile perdus.
- `fonts.css` : 79 ko de polices en base64 dans le chemin critique des 85 pages.
- Le moteur de particules de l'accueil **ne se met jamais en pause** : thread principal saturé
  sur mobile bas de gamme.

---

## 3. Peut attendre

- **Maillage** : 88 % des liens sont du boilerplate nav/footer, aucun bloc « articles liés »,
  38 articles sur 66 ne lient aucun autre article, le fil d'Ariane n'est visible que sur 1 page
  sur 85 alors que `BreadcrumbList` est déclaré sur 85/85.
- **5 pages lient encore l'alias** `/blog/meilleure-agence-geo-france-2026` au lieu de la
  canonique en `-gso-` : `/annuaire`, et les articles Lille, Lyon, Bordeaux, Marseille.
- **Nœud auteur incohérent** (la byline est voulue, c'est sa cohérence qui pêche) : 3 `jobTitle`
  différents, `url` pointant vers l'accueil sur 58 articles, `@id` vers `/equipe/camille-rousseau`
  qui n'existe pas sur 2 articles.
- **Cannibalisation** : `/expertise-geo` et `/agence-geo-paris` ciblent tous deux « Agence GEO
  Paris » en tête de title ; jusqu'à 42 % de texte identique entre articles « agence SEO <ville> ».
- **GEO** : `llms.txt` n'est qu'un export titre + description ; 55 des 65 articles n'ont pas de
  `FAQPage` ; 63 titles et 37 URLs sont millésimés 2026 et s'auto-périment au 1er janvier.
- **Images** : 27 Mo au total, 27 fichiers > 250 ko, aucun `srcset`, aucun format moderne,
  5,5 Mo d'images jamais référencées.

---

## 4. Ce qui est sain — vérifié mécaniquement sur les 85 pages

| Contrôle | Résultat |
|---|---|
| `title`, `meta description`, `canonical`, OG, Twitter, metas GEO, JSON-LD, H1 unique | **85/85** |
| Canonicals sur le bon hôte, auto-référençants (hors 2 alias assumés) | **85/85** |
| Liens internes en 404 | **0** |
| Pages orphelines | **0** |
| JSON-LD invalide | **0** |
| Balises `<img>` cassées | **0** |
| Sitemap : URLs fantômes ou non canoniques | **0** |
| Texte dépendant du JS (contrainte n° 1) | **aucun** — parité HTML brut / DOM rendu vérifiée |
| `robots.txt` | GPTBot, Google-Extended, PerplexityBot, ClaudeBot, CCBot autorisés |

L'article « Meilleure agence GEO France 2026 » conserve bien son URL
`https://www.triaina.fr/blog/meilleure-agence-gso-france-2026` : c'est elle la canonique, elle
seule est au sitemap et dans `llms.txt`, et la variante `-geo-` reste servie sans créer de doublon.

---

## 5. Ordre d'exécution conseillé

1. `vercel.json` : `outputDirectory`, neutraliser le `build`, les 301 manquantes, apex → www.
2. Supprimer l'`aggregateRating` et le téléphone bouchon.
3. Corriger les 20 `og:image` (chemin `/images/articles/…`).
4. Vérifier la propriété Search Console **par DNS**, puis soumettre la sitemap.
5. Remplacer l'image hero corrompue, compresser les 13 heros > 700 ko.
6. Uniformiser les chiffres contradictoires (ancienneté, prix, délais, nombre de clients).
