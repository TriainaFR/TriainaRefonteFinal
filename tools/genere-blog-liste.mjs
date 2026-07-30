/**
 * genere-blog-liste.mjs — produit la page /blog du nouveau site DA-31.
 *
 * Fidélité SEO : les balises de tête et les schémas sont repris de la CAPTURE
 * de l'ancienne page (le HTML réellement servi fait foi), et les 60 cartes
 * sont rendues dans l'ordre exact des titres h3 de cette capture — même H1,
 * mêmes textes (tag, source, date, titre, extrait, « Lire l'article »),
 * mêmes libellés de filtres.
 *
 * Le design (grille, arrivées en cascade, ignition au survol, filtres animés,
 * recherche) est purement additif.
 *
 * Usage : node tools/genere-blog-liste.mjs
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { ech, NAV, pieds, barreNav, titreDePage } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const TMP = path.join(RACINE, 'tools/.tmp-liste');

async function chargeBlogData() {
  await mkdir(TMP, { recursive: true });
  const entree = path.join(TMP, 'entree.js');
  await writeFile(entree, `export { BLOG_DATA } from ${JSON.stringify(path.join(RACINE, 'constants.ts'))};`);
  const sortie = path.join(TMP, 'bundle.mjs');
  await build({
    entryPoints: [entree], bundle: true, format: 'esm', platform: 'node',
    outfile: sortie, loader: { '.ts': 'ts', '.tsx': 'tsx' }, jsx: 'automatic',
    external: ['react', 'react-dom', 'lucide-react'], logLevel: 'error',
  });
  const mod = await import(pathToFileURL(sortie).href);
  await rm(TMP, { recursive: true, force: true });
  return mod.BLOG_DATA;
}

function carte(p, i) {
  const grande = i === 0 ? ' grande' : '';
  return `      <article class="carte-blog${grande}" data-tag="${ech(p.tag)}">
        <a href="${p.url}" aria-label="${ech(p.title)}">
          <div class="cb-image">
            <img src="${ech(p.image)}" alt="${ech(p.title)}" loading="lazy" referrerpolicy="no-referrer" width="600" height="340"
                 onerror="this.closest('.cb-image').classList.add('ko');this.remove()">
            <span class="cb-tag">${ech(p.tag)}</span>
          </div>
          <div class="cb-corps">
            <p class="cb-meta">${ech(p.source)} · ${ech(p.date)}</p>
            <h3>${ech(p.title)}</h3>
            <p class="cb-extrait">${ech(p.excerpt)}</p>
            <span class="cb-lire">Lire l'article <span aria-hidden="true">→</span></span>
          </div>
        </a>
      </article>`;
}

/**
 * Titres d'article renommés depuis la capture de l'ancienne page /blog.
 * Format : « titre capturé » → « titre actuel dans BLOG_DATA ».
 *
 * Le garde-fou exige une correspondance exacte entre les h3 de la capture et
 * BLOG_DATA — c'est ce qui garantit qu'aucune carte ne disparaît en silence.
 * Un titre qui change VOLONTAIREMENT doit donc être déclaré ici, comme les
 * écarts de Hn et de texte le sont dans genere-expertises.mjs.
 *
 * 30/07/2026 : Lucas a ajouté Webconversion en 3e position du comparatif
 * « Meilleure agence GEO France ». L'article compare désormais 6 agences et
 * non 5 — le titre, la meta description et le corps ont suivi. L'URL, elle,
 * n'a pas bougé : /blog/meilleure-agence-gso-france-2026.
 */
const TITRES_RENOMMES = {
  'Meilleure agence GEO France 2026 : top 5 comparatif':
    'Meilleure agence GEO France 2026 : top 6 comparatif',
};

async function main() {
  const [donnees, ref] = await Promise.all([
    chargeBlogData(),
    readFile(path.join(RACINE, 'tools/snapshots/avant/blog.json'), 'utf8').then(JSON.parse),
  ]);

  /* Ordre des cartes = ordre des h3 de l'ancienne page. Zéro devinette :
     chaque titre doit correspondre à exactement une entrée BLOG_DATA. */
  const parTitre = new Map(donnees.map(p => [p.title.replace(/\s+/g, ' ').trim(), p]));
  const ordonnes = [];
  for (const t of ref.titres.filter(t => t.niveau === 3)) {
    let cle = t.texte.replace(/\s+/g, ' ').trim();
    cle = TITRES_RENOMMES[cle] ?? cle;
    const p = parTitre.get(cle);
    if (!p) { console.error(`✗ titre de la référence introuvable dans BLOG_DATA : « ${cle} »`); process.exit(1); }
    ordonnes.push(p);
  }
  if (ordonnes.length !== 60) { console.error(`✗ ${ordonnes.length} cartes appariées (attendu 60)`); process.exit(1); }

  /* La capture fige l'ancienne page à 60 articles. Ceux publiés depuis n'y sont
     donc pas — sans ce rattrapage ils existent en page mais ne sont listés nulle
     part : aucun lien entrant, invisibles pour un crawler comme pour un lecteur.
     On les place EN TÊTE, comme la prod, dans l'ordre de BLOG_DATA. */
  const dejaLa = new Set(ordonnes.map(p => p.url));
  const recents = donnees.filter(p =>
    p.url?.startsWith('/blog/') && !dejaLa.has(p.url) &&
    existsSync(path.join(RACINE, 'site', p.url.replace(/^\//, ''), 'index.html')));

  /* Articles écrits DEPUIS la suppression de l'application React : ils
     n'existent que dans tools/contenus/ et ne sont donc pas dans BLOG_DATA,
     qui vit dans constants.ts. Sans ce rattrapage, un nouvel article serait
     publié mais absent de la liste — donc sans le moindre lien entrant. */
  const connus = new Set([...dejaLa, ...recents.map(p => p.url)]);
  for (const f of (await readdir(path.join(RACINE, 'tools/contenus'))).sort()) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(await readFile(path.join(RACINE, 'tools/contenus', f), 'utf8'));
    if (!d.url?.startsWith('/blog/') || connus.has(d.url)) continue;
    if (!existsSync(path.join(RACINE, 'site', d.url.replace(/^\//, ''), 'index.html'))) continue;
    recents.push({ id: d.id, url: d.url, title: d.titre, excerpt: d.excerpt,
                   date: d.date, tag: d.tag, image: d.image, source: d.source ?? 'TRIAINA' });
    connus.add(d.url);
    console.log(`  article hors BLOG_DATA ajouté : ${d.url}`);
  }

  if (recents.length) {
    ordonnes.unshift(...recents);
    console.log(`  ${recents.length} article(s) hors capture ajouté(s) en tête : ${recents.map(p => p.url).join(', ')}`);
  }

  /* Libellés de filtres = TOUS + tags dans l'ordre du tableau BLOG_DATA :
     c'est ainsi que l'ancienne page les affichait (GUIDE, ANALYSE, AGENCE
     GEO, CLASSEMENT…), pas dans l'ordre des cartes. */
  const tags = [...new Set(donnees.map(p => p.tag))];

  /* Balises de tête et schémas : valeurs de la capture, telles quelles. */
  const meta = (o) => Object.entries(o).map(([k, v]) =>
    `<meta ${k.startsWith('og:') ? 'property' : 'name'}="${k}" content="${ech(v)}">`).join('\n');

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(titreDePage('blog', ref.title))}</title>
<meta name="description" content="${ech(ref.description)}">
<meta name="keywords" content="${ech(ref.keywords)}">
<link rel="canonical" href="${ech(ref.canonical)}">
<link rel="alternate" hreflang="fr" href="${ech(ref.canonical)}">
${meta(ref.geo)}
${meta(ref.og)}
${meta(ref.twitter)}
<link rel="preload" href="/assets/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
${ref.schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav('/blog')}

<a class="chip" id="chip" href="/contact" aria-label="Recevoir mon pré-audit gratuit">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"/></svg>
  Pré-audit gratuit
</a>

<main class="page">
  <div class="blog-wrap">
    <header class="blog-tete">
      <p class="k">// Actualités &amp; Insights SEO/IA</p>
      <h1>LE BLOG</h1>
      <div class="blog-outils">
        <div class="filtres" id="filtres" role="group" aria-label="Filtrer par catégorie">
          <button type="button" class="filtre actif" data-tag="">TOUS</button>
${tags.map(t => `          <button type="button" class="filtre" data-tag="${ech(t)}">${ech(t)}</button>`).join('\n')}
        </div>
        <label class="recherche">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input type="search" id="chercher" placeholder="Rechercher un article…" aria-label="Rechercher un article">
        </label>
      </div>
      <p class="blog-compte" id="compte" aria-live="polite">${ordonnes.length} articles</p>
    </header>

    <div class="grille-blog" id="grille">
${ordonnes.map(carte).join('\n')}
    </div>
    <p class="blog-vide" id="vide" hidden>Aucun article ne correspond — élargissez la recherche.</p>
  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
<script>
/* ── Page blog : cascade d'arrivée, filtres, recherche ──
   Tout est additif : sans JS, les 60 cartes sont affichées telles quelles. */
(function () {
  'use strict';
  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cartes = [].slice.call(document.querySelectorAll('.carte-blog'));
  var grille = document.getElementById('grille');

  /* Arrivée en cascade : l'état caché n'est posé que si le mouvement est
     permis — noscript et reduced-motion voient tout, sans rien faire. */
  if (!reduit && 'IntersectionObserver' in window) {
    grille.classList.add('anim');
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (x) {
        if (!x.isIntersecting) return;
        var el = x.target;
        el.style.transitionDelay = (el._retard || 0) + 'ms';
        el.classList.add('vue');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    cartes.forEach(function (el, i) { el._retard = (i % 3) * 90; obs.observe(el); });
  }

  /* Filtres + recherche combinés */
  var filtres = [].slice.call(document.querySelectorAll('.filtre'));
  var champ = document.getElementById('chercher');
  var compte = document.getElementById('compte');
  var vide = document.getElementById('vide');
  var tagActif = '', requete = '';

  function applique() {
    var visibles = 0;
    cartes.forEach(function (el) {
      var okTag = !tagActif || el.getAttribute('data-tag') === tagActif;
      var okTexte = !requete || el.textContent.toLowerCase().indexOf(requete) !== -1;
      var ok = okTag && okTexte;
      el.classList.toggle('cachee', !ok);
      if (ok) visibles++;
    });
    compte.textContent = visibles + (visibles > 1 ? ' articles' : ' article');
    vide.hidden = visibles !== 0;
  }
  filtres.forEach(function (b) {
    b.addEventListener('click', function () {
      filtres.forEach(function (x) { x.classList.remove('actif'); });
      b.classList.add('actif');
      tagActif = b.getAttribute('data-tag') || '';
      applique();
    });
  });
  if (champ) champ.addEventListener('input', function () {
    requete = champ.value.toLowerCase().trim();
    applique();
  });
})();
</script>
</body>
</html>
`;

  const dossier = path.join(RACINE, 'site/blog');
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, 'index.html'), html);
  console.log(`page /blog générée — ${ordonnes.length} cartes, ${tags.length} filtres (${tags.join(', ')})`);
}

main().catch(e => { console.error(e); process.exit(1); });
