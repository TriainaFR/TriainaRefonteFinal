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
      const graphe = obj['@graph'];
      if (!Array.isArray(graphe)) continue;
      const org = graphe.find(n => String(n['@type']).includes('Organization'));
      if (!org) continue;
      vu = true;

      let change = false;
      for (const [champ, valeurs] of Object.entries(AJOUTS)) {
        if (!Array.isArray(org[champ])) continue;
        for (const v of valeurs) {
          if (!org[champ].includes(v)) { org[champ].push(v); change = true; }
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
