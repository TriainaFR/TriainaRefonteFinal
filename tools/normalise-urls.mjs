/**
 * normalise-urls.mjs — force toutes les URLs internes sur https://www.triaina.fr
 *
 * L'ancien site mélangeait les deux hôtes : le composant SEO construisait les
 * canonicals des articles en `https://triaina.fr${post.url}` (sans www) alors
 * que le reste du site est en `www`. Conséquences mesurées avant correction :
 *   - 60 canonicals d'articles déclarés sur un hôte, 21 pages sur l'autre ;
 *   - le MÊME nœud Organization déclaré sous deux @id distincts selon la page
 *     (`https://triaina.fr/#organization` vs `https://www.triaina.fr/#organization`),
 *     ce qui casse la consolidation des entités côté Google ;
 *   - 12 BreadcrumbList et 2 og:image sur l'hôte sans www.
 *
 * Le remplacement ne touche QUE l'hôte : aucune URL n'est créée, supprimée ni
 * repointée. Vérifié avant écriture : toutes les occurrences sont des URLs
 * structurelles (canonical, @id, item, url, href), aucune dans le texte des
 * articles.
 *
 * Idempotent : relancer ne change rien. À exécuter en DERNIÈRE étape du build,
 * après tout générateur (cf. tools/build.mjs).
 *
 * Usage : node tools/normalise-urls.mjs [--verifie]
 *   --verifie : n'écrit rien, sort en code 1 s'il reste des URLs sans www.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(RACINE, 'site');

/* `https://triaina.fr` ou `http://triaina.fr`, jamais `www.triaina.fr`
   (le « . » qui précède est exclu pour ne pas casser un sous-domaine). */
const SANS_WWW = /\bhttps?:\/\/triaina\.fr/g;
const CIBLE = 'https://www.triaina.fr';

async function fichiers(dir) {
  const out = [];
  for (const e of await readdir(dir)) {
    const p = path.join(dir, e);
    if ((await stat(p)).isDirectory()) out.push(...await fichiers(p));
    else if (/\.(html|xml|txt)$/.test(e)) out.push(p);
  }
  return out;
}

const verifie = process.argv.includes('--verifie');
let total = 0, touches = 0;

for (const f of await fichiers(SITE)) {
  const avant = await readFile(f, 'utf8');
  const n = (avant.match(SANS_WWW) ?? []).length;
  if (!n) continue;
  total += n;
  touches++;
  const rel = path.relative(RACINE, f);
  if (verifie) { console.error(`  ✗ ${rel} : ${n} URL(s) sans www`); continue; }
  await writeFile(f, avant.replace(SANS_WWW, CIBLE));
  console.log(`  ${rel} : ${n} URL(s) → www`);
}

if (verifie) {
  console.log(total ? `\n✗ ${total} URL(s) sans www dans ${touches} fichier(s)` : '\n✓ toutes les URLs internes sont en www');
  process.exit(total ? 1 : 0);
}
console.log(total ? `\n${total} URL(s) normalisée(s) sur www dans ${touches} fichier(s)` : '\nRien à faire : déjà tout en www.');
