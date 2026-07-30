/**
 * seo-snapshot.mjs — capture la signature SEO/GEO de chaque page.
 *
 * Le site est une SPA : le HTML servi ne contient aucun texte, tout est rendu
 * en JS. La capture passe donc par un vrai rendu Chrome (--dump-dom) et non
 * par un simple curl.
 *
 * Usage :
 *   node tools/seo-snapshot.mjs <dossier-sortie> [--base=http://localhost:3000]
 *                               [--routes=/faq,/contact]   (défaut : / + /blog + articles)
 *   node tools/seo-diff.mjs <avant> <apres>
 */
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileP = promisify(execFile);

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CONCURRENCE = 4;
const BUDGET_MS = 9000;

/** Routes à capturer : les articles de blog + les pages qui les listent. */
async function routes() {
  const src = await readFile(new URL('../constants.ts', import.meta.url), 'utf8');
  const blog = [...src.matchAll(/url:\s*'(\/blog\/[^']+)'/g)].map(m => m[1]);
  return ['/', '/blog', ...[...new Set(blog)].sort()];
}

/**
 * Chrome se fige parfois sans jamais rendre la main : SIGKILL au bout de 45 s
 * puis une seule reprise. Sans ça, la capture reste bloquée sur une route et
 * la page absente ressort en « URL perdue » — un faux positif.
 */
async function rendu(base, route, reprise = true) {
  try {
    const { stdout } = await execFileP(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      /* fenêtre figée : sans elle Chrome rend en 800×600 et tout ce qui est
         responsive (sommaire en lg:block) échappe à la mesure. */
      '--window-size=1440,1000',
      `--virtual-time-budget=${BUDGET_MS}`, '--dump-dom',
      base + route,
    ], { maxBuffer: 64 * 1024 * 1024, timeout: 45000, killSignal: 'SIGKILL' });
    return stdout;
  } catch (e) {
    if (!reprise) throw e;
    console.log(`  ↻ ${route} — reprise après ${e.killed ? 'blocage' : 'erreur'}`);
    return rendu(base, route, false);
  }
}

const nettoie = s => s.replace(/\s+/g, ' ').trim();
const sansBalises = s => nettoie(s.replace(/<[^>]*>/g, ' '));

function decode(s) {
  const table = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ', '#8239': ' ' };
  return s.replace(/&(#?\w+);/g, (m, e) => (e in table ? table[e] : m));
}

/** Tri récursif des clés : deux JSON-LD équivalents doivent diffère à zéro. */
function normalise(v) {
  if (Array.isArray(v)) return v.map(normalise);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().map(k => [k, normalise(v[k])]));
  }
  return typeof v === 'string' ? nettoie(v) : v;
}

/**
 * Valeur d'attribut, délimiteur respecté par référence arrière : une apostrophe
 * dans un attribut en guillemets doubles ne doit pas couper la valeur
 * (« Le GEO désigne l'ensemble… » tronqué à « Le GEO désigne l »).
 */
const attr = (source, nom) => {
  const m = new RegExp(`\\b${nom}\\s*=\\s*(["'])((?:(?!\\1)[\\s\\S])*)\\1`, 'i').exec(source);
  return m ? m[2] : null;
};

function signature(html) {
  const meta = {};
  for (const m of html.matchAll(/<meta\s+([^>]*?)\/?>/gi)) {
    const attrs = m[1];
    const nom = attr(attrs, 'name') ?? attr(attrs, 'property') ?? attr(attrs, 'http-equiv');
    const val = attr(attrs, 'content');
    if (nom && val !== null) meta[nom.toLowerCase()] = decode(nettoie(val));
  }

  const lien = rel => {
    const m = new RegExp(`<link\\s+[^>]*rel\\s*=\\s*["']${rel}["'][^>]*>`, 'i').exec(html);
    return m ? attr(m[0], 'href') : null;
  };

  const titres = [];
  for (const m of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    titres.push({ niveau: +m[1], texte: decode(sansBalises(m[2])) });
  }

  const schemas = [];
  for (const m of html.matchAll(
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      schemas.push(normalise(JSON.parse(decode(m[1]))));
    } catch (e) {
      schemas.push({ ERREUR_PARSE: nettoie(m[1]).slice(0, 200) });
    }
  }

  const liens = [...new Set(
    [...html.matchAll(/<a\s[^>]*>/gi)]
      .map(m => attr(m[0], 'href'))
      .filter(h => h && h.startsWith('/'))
      .map(h => h.split(/[#?]/)[0])
  )].sort();

  const titre = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const corps = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  const texte = corps
    ? sansBalises(corps[1].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' '))
    : '';

  return {
    title: titre ? decode(nettoie(titre[1])) : null,
    description: meta.description ?? null,
    keywords: meta.keywords ?? null,
    robots: meta.robots ?? null,
    canonical: lien('canonical'),
    og: Object.fromEntries(Object.entries(meta).filter(([k]) => k.startsWith('og:'))),
    twitter: Object.fromEntries(Object.entries(meta).filter(([k]) => k.startsWith('twitter:'))),
    geo: Object.fromEntries(Object.entries(meta).filter(([k]) => k.startsWith('geo.'))),
    titres,
    h1: titres.filter(t => t.niveau === 1).map(t => t.texte),
    schemas,
    typesSchema: schemas.flatMap(s => (Array.isArray(s) ? s : [s]).map(x => x?.['@type'] ?? null)),
    liensInternes: liens,
    nbMots: texte ? texte.split(' ').length : 0,
    texteIntegral: texte,
  };
}

const cle = route => (route === '/' ? 'accueil' : route.replace(/^\//, '').replace(/\//g, '_'));

async function main() {
  const [sortie, ...opts] = process.argv.slice(2);
  if (!sortie) {
    console.error('usage: node tools/seo-snapshot.mjs <dossier-sortie> [--base=URL]');
    process.exit(1);
  }
  const base = (opts.find(o => o.startsWith('--base=')) ?? '--base=http://localhost:3000').slice(7);
  const routesOpt = opts.find(o => o.startsWith('--routes='));

  await mkdir(sortie, { recursive: true });
  const liste = routesOpt
    ? routesOpt.slice(9).split(',').map(r => r.trim()).filter(Boolean)
    : await routes();
  console.log(`${liste.length} routes à capturer depuis ${base}`);

  const index = {};
  let faits = 0, echecs = 0;

  async function traite(route) {
    try {
      const sig = signature(await rendu(base, route));
      await writeFile(path.join(sortie, cle(route) + '.json'), JSON.stringify(sig, null, 2));
      index[route] = { title: sig.title, canonical: sig.canonical, h1: sig.h1,
                       nbSchemas: sig.schemas.length, nbMots: sig.nbMots };
      if (!sig.title || sig.nbMots < 50) {
        console.log(`  ⚠︎ ${route} — titre ou contenu quasi vide (${sig.nbMots} mots)`);
      }
    } catch (e) {
      echecs++;
      index[route] = { ERREUR: String(e.message).slice(0, 160) };
      console.log(`  ✗ ${route} — ${String(e.message).slice(0, 90)}`);
    }
    if (++faits % 10 === 0) console.log(`  ${faits}/${liste.length}`);
  }

  const file = [...liste];
  await Promise.all(Array.from({ length: CONCURRENCE }, async () => {
    while (file.length) await traite(file.shift());
  }));

  await writeFile(path.join(sortie, '_index.json'), JSON.stringify(index, null, 2));
  console.log(`\nterminé : ${faits - echecs} ok, ${echecs} en échec → ${sortie}`);
}

main();
