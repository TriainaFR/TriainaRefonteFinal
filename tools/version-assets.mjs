/**
 * version-assets.mjs — appose une empreinte sur les URLs de feuilles de style
 * et de scripts, pour qu'une correction arrive VRAIMENT chez le visiteur.
 *
 * Le problème qu'il règle, constaté le 30/07/2026 : `serveur-site.mjs` sert les
 * assets avec `Cache-Control: public, max-age=2592000` — trente jours — et sans
 * ETag ni Last-Modified. Le nom du fichier, lui, ne change jamais. Un visiteur
 * déjà venu garde donc `da31.css` en cache pendant un mois : un correctif CSS
 * déployé aujourd'hui ne l'atteint pas, et rien ne le signale. C'est exactement
 * ce qui s'est passé avec le correctif d'affichage mobile — déployé, invisible.
 *
 * Le remède standard : l'URL change quand le contenu change.
 * `/assets/da31.css` devient `/assets/da31.css?v=a1b2c3d4`. Le cache long
 * redevient un avantage — les visiteurs qui reviennent ne retéléchargent que
 * ce qui a bougé.
 *
 * Ne versionne QUE .css et .js. Les polices sont exclues volontairement : leur
 * URL est écrite à la fois dans le `<link rel="preload">` du HTML et dans
 * `fonts.css`. Si les deux ne coïncident pas à l'octet près, le navigateur
 * télécharge la police DEUX fois et le préchargement devient une pénalité.
 *
 * Idempotent : une empreinte déjà posée est remplacée, jamais accumulée.
 *
 * Usage : node tools/version-assets.mjs   (dans la chaîne, après les générateurs)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SITE = path.join(RACINE, 'site');

/** 8 caractères suffisent : on distingue des versions, on ne signe rien. */
const empreinte = async (fichier) =>
  createHash('sha256').update(await readFile(fichier)).digest('hex').slice(0, 8);

/** Toutes les pages HTML du site. */
async function pages(dir = SITE, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'images') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await pages(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const assets = (await readdir(path.join(SITE, 'assets')))
  .filter(f => /\.(css|js)$/.test(f));

const versions = {};
for (const a of assets) versions[a] = await empreinte(path.join(SITE, 'assets', a));

const liste = await pages();
let touchees = 0;
const compte = {};

for (const f of liste) {
  const avant = await readFile(f, 'utf8');
  /* On vise l'URL DANS un attribut href/src : le `?v=` optionnel est capturé
     pour être remplacé, jamais empilé. */
  const apres = avant.replace(
    /(["'])\/assets\/([A-Za-z0-9._-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?\1/g,
    (tout, guillemet, nom) => {
      if (!versions[nom]) return tout;                 // fichier inconnu : on ne touche pas
      compte[nom] = (compte[nom] ?? 0) + 1;
      return `${guillemet}/assets/${nom}?v=${versions[nom]}${guillemet}`;
    });
  if (apres !== avant) { await writeFile(f, apres); touchees++; }
}

console.log(`empreintes posées sur ${liste.length} page(s) — ${touchees} modifiée(s)`);
for (const [nom, n] of Object.entries(compte).sort()) {
  console.log(`  ${String(n).padStart(3)} × ${nom} → ?v=${versions[nom]}`);
}
const oubliees = assets.filter(a => !compte[a]);
if (oubliees.length) console.log(`  (non référencés dans le HTML : ${oubliees.join(', ')})`);
