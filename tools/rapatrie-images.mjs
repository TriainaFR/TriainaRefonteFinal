/**
 * rapatrie-images.mjs — télécharge les couvertures d'article hébergées ailleurs
 * (Unsplash, Wikimedia, Picsum) et les sert depuis le site.
 *
 * Pourquoi : une dépendance externe est un point de rupture (une image qui
 * disparaît casse la page) et une latence supplémentaire pour les crawlers.
 * Les fichiers sont redimensionnés à 1200 px de large et convertis en JPEG,
 * pour tenir la contrainte Lighthouse mobile ≥ 90.
 *
 * Réécrit `image:` dans constants.ts, puis il faut relancer
 * extrait-contenus.mjs + genere-blog.mjs.
 *
 * Usage : node tools/rapatrie-images.mjs [--essai]
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileP = promisify(execFile);
const RACINE = fileURLToPath(new URL('..', import.meta.url));
const DEST = path.join(RACINE, 'site/images/articles');

const LARGEUR = 1200;

/** Nom de fichier stable et lisible, dérivé de l'identifiant de l'article. */
const nomFichier = id => id.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.jpg';

async function telecharge(url, vers) {
  /* -L : Unsplash et Wikimedia redirigent. --fail : ne pas écrire une page
     d'erreur HTML à la place de l'image. */
  await execFileP('curl', ['-sSL', '--fail', '--max-time', '45',
    '-A', 'Mozilla/5.0 (compatible; TriainaBuild/1.0)', '-o', vers, url]);
  const { size } = await stat(vers);
  if (size < 3000) throw new Error(`fichier suspect (${size} o)`);
}

async function optimise(fichier) {
  await execFileP('sips', ['-Z', String(LARGEUR), '-s', 'format', 'jpeg',
    '-s', 'formatOptions', '82', fichier, '--out', fichier]);
  return (await stat(fichier)).size;
}

async function main() {
  const essai = process.argv.includes('--essai');
  const src = await readFile(path.join(RACINE, 'constants.ts'), 'utf8');

  /* Couples (id, url d'image) des articles, lus dans BLOG_DATA. */
  const entrees = [];
  const bloc = /export const BLOG_DATA[\s\S]*?\n\];/.exec(src);
  for (const m of bloc[0].matchAll(/id:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g)) {
    entrees.push({ id: m[1], url: m[2] });
  }

  const externes = entrees.filter(e => /^https?:\/\//.test(e.url));
  console.log(`${entrees.length} articles · ${externes.length} images hébergées ailleurs`);
  if (essai) {
    const parHote = {};
    externes.forEach(e => { const h = new URL(e.url).host; parHote[h] = (parHote[h] ?? 0) + 1; });
    Object.entries(parHote).forEach(([h, n]) => console.log(`   ${String(n).padStart(3)} ${h}`));
    console.log('\n(essai — aucun téléchargement ; retirer --essai)');
    return;
  }

  await mkdir(DEST, { recursive: true });
  let ok = 0, poids = 0; const rates = [];
  let remplacements = src;

  for (const e of externes) {
    const nom = nomFichier(e.id);
    const dest = path.join(DEST, nom);
    try {
      await telecharge(e.url, dest);
      poids += await optimise(dest);
      remplacements = remplacements.replace(`'${e.url}'`, `'/images/articles/${nom}'`);
      ok++;
      if (ok % 10 === 0) console.log(`  ${ok}/${externes.length}`);
    } catch (err) {
      rates.push([e.id, String(err.message).slice(0, 80)]);
    }
  }

  await writeFile(path.join(RACINE, 'constants.ts'), remplacements);
  console.log(`\n${ok} image(s) rapatriée(s) · ${(poids / 1024 / 1024).toFixed(1)} Mo au total`
    + ` (${Math.round(poids / 1024 / Math.max(ok, 1))} Ko en moyenne)`);
  if (rates.length) {
    console.log(`\n${rates.length} échec(s) — l'URL d'origine est conservée :`);
    for (const [id, e] of rates) console.log(`  ✗ ${id.padEnd(44)} ${e}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
