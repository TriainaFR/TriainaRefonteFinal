/**
 * ajoute-entites-geo.mjs — ajoute les entités GEO au graphe JSON-LD global.
 *
 * Décision de Lucas (29/07/2026) : le schéma global servi sur les 67 pages
 * déclare « GSO » / « Generative Search Optimization » mais pas « GEO ». On
 * AJOUTE les entités GEO à côté, on ne remplace pas : « GSO » reste
 * massivement présent dans le contenu réel du site (14 mentions sur /faq,
 * 28 sur l'article seo-gso-geo-aeo-differences, une route /expertise-gso,
 * une URL contenant « gso »). Remplacer aurait désynchronisé les données
 * structurées du texte des pages — perte sèche de signal.
 *
 * Ajouts, et rien d'autre :
 *   alternateName ← « Agence GEO Paris »
 *   knowsAbout    ← « GEO », « Generative Engine Optimization »
 * Aucune valeur existante n'est modifiée ni retirée ; le reste du graphe
 * (adresse, geo, sameAs, WebSite…) est reconduit à l'octet.
 *
 * Idempotent : relancer ne duplique rien.
 *
 * ⚠︎ À RELANCER APRÈS TOUTE RÉGÉNÉRATION de /faq ou /contact : leurs
 * générateurs reconduisent le schéma depuis les captures de l'ANCIEN site
 * (tools/snapshots/ancien-faq-contact/), qui ne contiennent pas les entités
 * GEO — sans ce passage, ces deux pages les reperdent. C'est la dernière
 * étape du build.
 *
 * Usage : node tools/ajoute-entites-geo.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SITE = path.join(RACINE, 'site');

const AJOUTS = {
  alternateName: ['Agence GEO Paris'],
  knowsAbout: ['GEO', 'Generative Engine Optimization'],
};

/**
 * Le nœud WebSite hérité de l'ancien site déclare une SearchAction dont la
 * cible est `https://www.triaina.fr/recherche?q={search_term_string}` — page
 * qui n'a jamais existé. Une action déclarée vers une URL morte est une
 * promesse non tenue faite à Google, sur les 85 pages. On la retire tant
 * qu'aucune page de recherche n'existe ; le jour où elle existera, il suffira
 * de supprimer cet appel.
 * Idempotent : ne retire que ce qui vise une cible inexistante.
 */
const CIBLES_MORTES = ['/recherche'];
function retireActionRecherche(racine) {
  let retire = false;
  const noeuds = [];
  const visite = o => {
    if (Array.isArray(o)) return o.forEach(visite);
    if (!o || typeof o !== 'object') return;
    noeuds.push(o);
    for (const v of Object.values(o)) visite(v);
  };
  visite(racine);
  for (const n of noeuds) {
    if (!n || !n.potentialAction) continue;
    const actions = [].concat(n.potentialAction);
    const gardees = actions.filter(a => {
      const cible = typeof a?.target === 'string' ? a.target : a?.target?.urlTemplate;
      return !(typeof cible === 'string'
        && CIBLES_MORTES.some(c => cible.includes(c)));
    });
    if (gardees.length === actions.length) continue;
    if (gardees.length) n.potentialAction = gardees.length === 1 ? gardees[0] : gardees;
    else delete n.potentialAction;
    retire = true;
  }
  return retire;
}

/**
 * Profils sociaux de l'entreprise — un seul jeu, partout.
 *
 * Le site déclarait QUATRE jeux de `sameAs` pour la même entité selon la page :
 * LinkedIn+Instagram (85 pages, le graphe global), LinkedIn+Twitter (3 pages),
 * LinkedIn+Twitter+Facebook (2 pages), LinkedIn seul (3 pages). Google
 * consolide une entité par ses `sameAs` : quatre versions concurrentes
 * l'empêchent de rattacher les pages à la même organisation.
 *
 * Valeur retenue : LinkedIn + Instagram. Lucas a confirmé le 30/07/2026 ne pas
 * avoir de compte Twitter (« on a pas de twitter »), et la page Facebook
 * déclarée répond 400. Déclarer un profil qui n'existe pas est un signal faux.
 *
 * Ne touche QUE les nœuds de l'entreprise : les `sameAs` de l'auteur (profil
 * LinkedIn personnel) et ceux des nœuds Thing (articles Wikipédia des concepts)
 * sont laissés intacts.
 */
const SAMEAS_ENTREPRISE = [
  'https://www.linkedin.com/company/triaina',
  'https://www.instagram.com/triaina_agency',
];
function normaliseSameAs(racine) {
  let change = false;
  const visite = o => {
    if (Array.isArray(o)) return o.forEach(visite);
    if (!o || typeof o !== 'object') return;
    const liste = typeof o.sameAs === 'string' ? [o.sameAs] : o.sameAs;
    /* signature d'un nœud d'entreprise : il pointe la page LinkedIn de la
       société (jamais un profil personnel, jamais Wikipédia). */
    if (Array.isArray(liste) && liste.some(u => /linkedin\.com\/company\/triaina/i.test(u))) {
      const voulu = JSON.stringify(SAMEAS_ENTREPRISE);
      if (JSON.stringify(liste) !== voulu) { o.sameAs = [...SAMEAS_ENTREPRISE]; change = true; }
    }
    for (const v of Object.values(o)) visite(v);
  };
  visite(racine);
  return change;
}

/**
 * Nœud auteur — une seule forme, sur les 66 articles.
 *
 * La signature d'article est VOULUE par Lucas (« y'a auteur sur les articles de
 * blog donc c'est normal »). Ce qui ne l'était pas : trois `jobTitle`
 * différents selon l'article, une `url` pointant vers l'accueil sur 58 d'entre
 * eux, un `@id` vers `/equipe/camille-rousseau` — page qui n'existe pas — sur
 * deux autres, et un seul article renvoyant vers le vrai profil LinkedIn.
 * Google consolide un auteur comme une entité : trois variantes valent trois
 * personnes, et l'E-E-A-T se dilue au lieu de s'accumuler.
 *
 * Forme retenue : `@id` en fragment sur le domaine (identifiant stable qui ne
 * promet aucune page), `url` et `sameAs` vers le profil LinkedIn — la seule
 * adresse publique qui existe réellement. Les autres propriétés du nœud
 * (description, image…) sont conservées telles quelles.
 */
const AUTEUR = {
  '@id': 'https://www.triaina.fr/#camille-rousseau',
  name: 'Camille Rousseau',
  jobTitle: 'Consultante Senior GEO/SEO chez Triaina',
  url: 'https://www.linkedin.com/in/camille-rousseau-a44488413/',
  sameAs: ['https://www.linkedin.com/in/camille-rousseau-a44488413/'],
};
function normaliseAuteur(racine) {
  let change = false;
  const visite = o => {
    if (Array.isArray(o)) return o.forEach(visite);
    if (!o || typeof o !== 'object') return;
    const est = [].concat(o['@type'] ?? []).includes('Person')
      && String(o.name ?? '').trim() === AUTEUR.name;
    if (est) {
      for (const [k, v] of Object.entries(AUTEUR)) {
        if (JSON.stringify(o[k]) !== JSON.stringify(v)) { o[k] = Array.isArray(v) ? [...v] : v; change = true; }
      }
    }
    for (const v of Object.values(o)) visite(v);
  };
  visite(racine);
  return change;
}

/** Toutes les pages du site. */
async function pages(dir = SITE) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['assets', 'images'].includes(e.name)) continue;
    const complet = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await pages(complet));
    else if (e.name === 'index.html') out.push(complet);
  }
  return out;
}

async function main() {
  const liste = await pages();
  let touchees = 0, deja = 0, sansGraphe = 0;

  for (const fichier of liste) {
    const html = await readFile(fichier, 'utf8');
    const blocs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

    let nouveau = html, modifie = false, vu = false;

    for (const m of blocs) {
      let obj;
      try { obj = JSON.parse(m[1]); } catch { continue; }
      let change = false;

      /* Ces deux normalisations s'appliquent à TOUT bloc JSON-LD, pas seulement
         au graphe global : les nœuds fautifs (LocalBusiness anonymes des pages
         agence-*) vivent dans un second bloc, sans @graph. */
      if (normaliseSameAs(obj)) change = true;
      if (normaliseAuteur(obj)) change = true;
      if (retireActionRecherche(obj)) change = true;

      const graphe = obj['@graph'];
      const org = Array.isArray(graphe)
        ? graphe.find(n => String(n['@type']).includes('Organization')) : null;
      if (org) {
        vu = true;
        for (const [champ, valeurs] of Object.entries(AJOUTS)) {
          if (!Array.isArray(org[champ])) continue;
          for (const v of valeurs) {
            if (!org[champ].includes(v)) { org[champ].push(v); change = true; }
          }
        }
      }
      if (!change) continue;

      /* Remplacement par FONCTION, jamais par chaîne : dans une chaîne de
         remplacement, String.replace interprète « $$ » comme un « $ »
         littéral — ce qui écrasait silencieusement priceRange:"$$" en "$"
         dans le schéma. Une fonction désactive toute substitution. */
      nouveau = nouveau.replace(m[1], () => JSON.stringify(obj));
      modifie = true;
    }

    if (modifie) { await writeFile(fichier, nouveau); touchees++; }
    else if (vu) deja++;
    else sansGraphe++;
  }

  console.log('entités GEO ajoutées au graphe global');
  console.log('  pages modifiées      :', touchees);
  console.log('  déjà à jour          :', deja);
  console.log('  sans graphe global   :', sansGraphe);
  console.log('  total pages          :', liste.length);
}

main().catch(e => { console.error(e.message); process.exit(1); });
