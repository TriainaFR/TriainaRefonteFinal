/**
 * genere-robots-sitemap.mjs — produit robots.txt et sitemap.xml du nouveau site.
 *
 * robots.txt est repris MOT POUR MOT de celui du site actuel : il porte les
 * autorisations explicites des crawlers IA (GPTBot, Google-Extended,
 * PerplexityBot, ClaudeBot, CCBot) et le bloc Content-Signal. C'est un actif
 * GEO réel, le perdre reviendrait à fermer la porte aux moteurs génératifs.
 *
 * Le sitemap est régénéré à partir des pages réellement présentes dans
 * `site/`, en conservant les `lastmod` de l'ancien sitemap quand l'URL y
 * figurait. L'ancien ne listait que 44 des 60 articles : les 16 absents sont
 * ajoutés, avec la date de publication de l'article.
 *
 * Usage : node tools/genere-robots-sitemap.mjs
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SITE = path.join(RACINE, 'site');
const DOMAINE = 'https://www.triaina.fr';

/** Toutes les URL servies par le site, déduites des index.html présents. */
async function urlsDuSite(dir = SITE, base = '') {
  const urls = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['assets', 'images'].includes(e.name)) continue;
    const complet = path.join(dir, e.name);
    if (e.isDirectory()) urls.push(...await urlsDuSite(complet, `${base}/${e.name}`));
    else if (e.name === 'index.html') urls.push(base === '' ? '/' : base);
  }
  return urls;
}

/**
 * Le canonical déclaré par une page, ou null.
 *
 * Une page dont le canonical pointe AILLEURS ne doit pas figurer au sitemap :
 * on demanderait à Google d'indexer une URL tout en lui disant, sur la page,
 * d'en indexer une autre. Deux cas sur ce site, tous deux hérités :
 *   - /expertise-gso  → canonical /expertise-geo (alias assumé) ;
 *   - /blog/meilleure-agence-geo-france-2026 → canonical …-gso-… (le post porte
 *     l'URL de l'autre slug dans constants.ts).
 * Les URLs restent servies et les liens internes intacts : seule l'annonce au
 * sitemap disparaît. Rien n'est supprimé, l'indexation acquise ne bouge pas.
 */
async function canonicalDe(url) {
  const f = path.join(SITE, url === '/' ? '' : url.replace(/^\//, ''), 'index.html');
  const html = await readFile(f, 'utf8');
  const m = /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i.exec(html)
    ?? /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["']/i.exec(html);
  return m ? m[1] : null;
}

/** Date de dernière modification du fichier, en ISO court. */
async function dateFichier(url) {
  const f = path.join(SITE, url === '/' ? '' : url.replace(/^\//, ''), 'index.html');
  const { mtime } = await stat(f);
  return mtime.toISOString().slice(0, 10);
}

/**
 * llms.txt — sommaire du site en Markdown, à destination des moteurs
 * génératifs (convention llmstxt.org).
 *
 * À relativiser : Google Search l'ignore, et aucun moteur n'en garantit la
 * lecture. Son intérêt ici est le coût — il se génère depuis les pages réelles,
 * donc il ne peut pas se périmer — pour un gain possible côté citation IA, qui
 * est l'axe du site. Titre et description sont relus dans chaque page : rien
 * n'est ressaisi à la main.
 */
async function ecritLlmsTxt(urls) {
  const RUBRIQUES = [
    ['Expertises', u => u.startsWith('/expertise-')],
    ['Agence & référencement IA', u => /^\/(agence|references|annuaire|faq|contact|mentions)/.test(u)],
    ['Articles', u => u.startsWith('/blog/')],
  ];

  const fiche = async u => {
    const f = path.join(SITE, u === '/' ? '' : u.replace(/^\//, ''), 'index.html');
    const html = await readFile(f, 'utf8');
    const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? u;
    /* le guillemet fermant est capturé par référence arrière : une classe
       [^"']* s'arrêterait à la première apostrophe DANS le texte et tronquerait
       la description (« …citées par l' » au lieu de la phrase entière). */
    const d = /<meta[^>]*name=["']description["'][^>]*content=(["'])([\s\S]*?)\1/i.exec(html)?.[2] ?? '';
    const nu = s => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'")
      .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ').trim();
    return { u, titre: nu(t), desc: nu(d) };
  };

  const accueil = await fiche('/');
  const out = [
    '# Triaina',
    '',
    `> ${accueil.desc}`,
    '',
    "Agence SEO & GEO à Paris. Ce fichier liste les pages du site et ce qu'elles contiennent,",
    'pour que les moteurs génératifs citent la bonne source.',
    '',
  ];

  const restantes = urls.filter(u => u !== '/');
  for (const [titre, filtre] of RUBRIQUES) {
    const lot = restantes.filter(filtre);
    if (!lot.length) continue;
    out.push(`## ${titre}`, '');
    for (const u of lot) {
      const f = await fiche(u);
      out.push(`- [${f.titre}](${DOMAINE}${u})${f.desc ? `: ${f.desc}` : ''}`);
    }
    out.push('');
  }

  const classees = new Set(RUBRIQUES.flatMap(([, f]) => restantes.filter(f)));
  const autres = restantes.filter(u => !classees.has(u));
  if (autres.length) {
    out.push('## Autres pages', '');
    for (const u of autres) {
      const f = await fiche(u);
      out.push(`- [${f.titre}](${DOMAINE}${u})${f.desc ? `: ${f.desc}` : ''}`);
    }
    out.push('');
  }

  await writeFile(path.join(SITE, 'llms.txt'), out.join('\n'));
  console.log(`llms.txt : ${restantes.length + 1} page(s) référencée(s)`);
}

async function main() {
  /* ── robots.txt : copie fidèle ── */
  const robots = await readFile(path.join(RACINE, 'public/robots.txt'), 'utf8');
  await writeFile(path.join(SITE, 'robots.txt'), robots);

  /* ── sitemap ── */
  const toutes = (await urlsDuSite()).sort();

  /* on écarte les pages qui se déclarent non canoniques (voir canonicalDe).
     La comparaison ignore l'hôte : selon l'ordre du build, le canonical peut
     ne pas encore être passé en www — le chemin seul fait foi. */
  const norm = u => u.replace(/^https?:\/\/(www\.)?triaina\.fr/, '').replace(/\/$/, '') || '/';
  const urls = [];
  const ecartees = [];
  for (const u of toutes) {
    const canon = await canonicalDe(u);
    if (canon && norm(canon) !== norm(u)) ecartees.push([u, canon]);
    else urls.push(u);
  }
  for (const [u, c] of ecartees) console.log(`  écartée du sitemap : ${u} (canonical → ${c})`);

  /* lastmod hérités de l'ancien sitemap, pour ne pas prétendre que tout le
     corpus a été modifié aujourd'hui. */
  const ancien = await readFile(path.join(RACINE, 'public/sitemap.xml'), 'utf8');
  const connus = new Map();
  /* on isole chaque bloc <url> avant d'y chercher loc et lastmod : une regex
     globale unique laissait le groupe optionnel vide et perdait toutes les dates. */
  for (const bloc of ancien.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(bloc);
    const mod = /<lastmod>([^<]+)<\/lastmod>/.exec(bloc);
    if (!loc || !mod) continue;
    const chemin = loc[1].replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
    connus.set(chemin, mod[1].slice(0, 10));
  }

  const lignes = [];
  let herites = 0, nouveaux = 0;
  for (const u of urls) {
    const lastmod = connus.get(u) ?? await dateFichier(u);
    connus.has(u) ? herites++ : nouveaux++;
    const priorite = u === '/' ? '1.0' : u === '/blog' ? '0.9' : '0.8';
    lignes.push(`  <url>
    <loc>${DOMAINE}${u === '/' ? '/' : u}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u === '/' || u === '/blog' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${priorite}</priority>
  </url>`);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...lignes,
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(path.join(SITE, 'sitemap.xml'), xml);
  await ecritLlmsTxt(urls);

  console.log(`robots.txt copié (autorisations IA préservées)`);
  console.log(`sitemap.xml : ${urls.length} URL — ${herites} avec lastmod hérité, ${nouveaux} nouvelles`);
  const manquantes = [...connus.keys()].filter(u => !urls.includes(u));
  if (manquantes.length) {
    console.log(`\n${manquantes.length} URL de l'ancien sitemap pas encore construites :`);
    manquantes.slice(0, 25).forEach(u => console.log('  ·', u));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
