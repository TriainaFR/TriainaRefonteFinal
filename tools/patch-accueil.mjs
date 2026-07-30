/**
 * patch-accueil.mjs — recâble la navigation de la page d'accueil.
 *
 * `site/index.html` est encore la maquette DA-31 : ses liens de menu sont des
 * `href="#"`, donc on ne peut aller nulle part — notamment pas sur /blog. Et
 * sous 1080 px la barre de bureau est masquée sans rien pour la remplacer :
 * aucune navigation sur téléphone.
 *
 * Ce correctif est provisoire et assumé : il pose la vraie barre (mêmes URL
 * que le site actuel, sous-menus et menu mobile) en attendant la
 * reconstruction complète de l'accueil, qui reste à faire.
 *
 * Usage : node tools/patch-accueil.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { barreNav, pieds } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const ACCUEIL = path.join(RACINE, 'site/index.html');

/** Retire le panneau de menu mobile en place, quel que soit son contenu :
 *  on part de `<div class="menu-mobile"` et on suit la profondeur des <div>
 *  jusqu'à la fermeture correspondante. */
function retirePanneauMobile(html) {
  const debut = html.indexOf('<div class="menu-mobile"');
  if (debut < 0) return html;
  const jeton = /<div\b|<\/div>/g;
  jeton.lastIndex = debut;
  let profondeur = 0, m;
  while ((m = jeton.exec(html))) {
    profondeur += m[0] === '</div>' ? -1 : 1;
    if (profondeur === 0) {
      /* On recolle les deux bords sur UNE seule ligne vide. Sans ça, chaque
         build laissait les sauts de ligne qui entouraient le panneau retiré et
         en réinjectait autant avec le nouveau : site/index.html grossissait de
         deux lignes vides à chaque exécution (≈150 accumulées avant qu'on ne
         s'en aperçoive). Un générateur doit être idempotent — sinon « le build
         a-t-il changé quelque chose ? » n'a plus de réponse fiable. */
      const avant = html.slice(0, debut).replace(/(?:[ \t]*\r?\n)+$/, '\n');
      const apres = html.slice(jeton.lastIndex).replace(/^(?:[ \t]*\r?\n)+/, '\n');
      return avant + apres;
    }
  }
  throw new Error('panneau de menu mobile non refermé dans site/index.html');
}

/**
 * Nombre d'articles de blog réellement publiés.
 *
 * Un article dont le canonical désigne une AUTRE URL est un alias : il sert le
 * même contenu et ne compte pas (cas de /blog/meilleure-agence-geo-france-2026,
 * qui pointe vers la version -gso-). Sans ce filtre, l'accueil annoncerait un
 * guide de plus qu'il n'en existe.
 */
async function compteArticles() {
  const dossier = path.join(RACINE, 'site/blog');
  let n = 0;
  for (const nom of await readdir(dossier)) {
    const f = path.join(dossier, nom, 'index.html');
    let html;
    try { html = await readFile(f, 'utf8'); } catch { continue; }
    const c = /rel="canonical"\s+href="([^"]+)"/.exec(html)?.[1] ?? '';
    const chemin = c.replace(/^https?:\/\/(www\.)?triaina\.fr/, '').replace(/\/$/, '');
    if (chemin === `/blog/${nom}`) n++;
  }
  return n;
}

async function main() {
  let html = await readFile(ACCUEIL, 'utf8');
  const avant = html;

  /* 1. La feuille du site, chargée APRÈS le <style> de la maquette pour que
        ses règles `nav.site`, sous-menus et menu mobile l'emportent. */
  if (!html.includes('/assets/da31.css')) {
    html = html.replace('</style>', '</style>\n<link rel="stylesheet" href="/assets/da31.css">');
  }

  /* 2. Chemins d'assets en absolu : la maquette vivait dans un sous-dossier,
        ses `../assets/…` ne résolvent pas depuis la racine du site. */
  html = html.replace(/(?:\.\.\/)+assets\//g, '/assets/');

  /* 3. La barre de navigation complète remplace celle de la maquette.
        `barreNav()` rend le <nav> ET le panneau de menu mobile qui le suit ;
        comme on ne remplace que jusqu'au premier `</nav>`, il faut retirer à
        la main le panneau déjà posé par une exécution précédente — sinon
        chaque relance en ajoute un de plus (deux id="menu-mobile").
        Le retrait se fait par ANALYSE DE PROFONDEUR, jamais par comparaison
        de chaîne : dès que la nav change (retrait d'une entrée…), le panneau
        en place ne correspond plus au nouveau et resterait en double. */
  html = retirePanneauMobile(html);

  const debut = html.indexOf('<nav');
  const fin = html.indexOf('</nav>', debut);
  if (debut < 0 || fin < 0) throw new Error('barre de navigation introuvable dans site/index.html');
  html = html.slice(0, debut) + barreNav('/') + html.slice(fin + '</nav>'.length);

  /* 3 bis. Le pied de page de la maquette n'avait que 4 liens en `#` : on pose
        celui du site, qui porte les 12 liens réels du maillage interne. */
  const dFooter = html.indexOf('<footer>');
  const fFooter = html.indexOf('</footer>', dFooter);
  if (dFooter >= 0 && fFooter >= 0) {
    html = html.slice(0, dFooter) + pieds() + html.slice(fFooter + '</footer>'.length);
  }

  /* 3 ter. L'adresse de contact était un lien mort : elle devient un vrai
        lien de courriel. */
  html = html.replace(/<a href="#">(contact@triaina\.fr[^<]*)<\/a>/,
    '<a href="mailto:contact@triaina.fr">$1</a>');

  /* 4. Le comportement (burger, sous-menus au clavier) vit dans da31.js. */
  if (!html.includes('/assets/da31.js')) {
    html = html.replace('</body>', '<script src="/assets/da31.js" defer></script>\n</body>');
  }

  /* 4 bis. …mais PAS son fond. da31.js porte le champ calme des pages de
        lecture (trident centré, en retrait) ; l'accueil a le sien, décentré et
        piloté par le scroll. Sans ce marqueur les deux moteurs peignent les
        mêmes canvas et le calme écrase celui de l'accueil. */
  if (!/<body[^>]*data-fond=/.test(html)) {
    html = html.replace('<body', '<body data-fond="accueil"');
  }

  /* 5. La maquette portait un noindex et un badge de retour au comparatif :
        ils n'ont plus lieu d'être sur une page de site. */
  html = html.replace(/\s*<meta name="robots" content="noindex">/g, '');
  html = html.replace(/\s*<a class="badge-da"[\s\S]*?<\/a>/g, '');

  /* 6. Les signaux de tête de la page d'accueil : repris du <head> statique du
        site actuel (index.html), pas réinventés. C'est la page pivot de
        l'entité — sans eux, elle sort du socle d'éligibilité SEO/GEO.

        Posés UNE fois : l'étape remplace le <title>, donc une relance les
        réinjecterait en double — deux canonical et deux description sur la
        page pivot, exactement la régression que la mission interdit. */
  if (!html.includes('rel="canonical"')) {
    const source = await readFile(path.join(RACINE, 'index.html'), 'utf8');
    const balises = [...source.matchAll(
      /<title>[\s\S]*?<\/title>|<meta\s+(?:name|property)="(?:description|keywords|author|robots|og:[^"]+|twitter:[^"]+|geo\.[^"]+|ICBM|msvalidate\.01)"[^>]*>|<link\s+rel="(?:canonical|alternate|icon|apple-touch-icon)"[^>]*>/g,
    )].map(m => m[0].replace(/\s*\/>$/, '>'));

    const titreMaquette = /<title>[\s\S]*?<\/title>/.exec(html);
    if (titreMaquette && balises.length) {
      html = html.replace(titreMaquette[0], balises.join('\n'));
    }
  }

  /* Le JSON-LD global du site, servi sur chaque page par l'ancienne SPA. */
  const refArticle = path.join(RACINE, 'tools/snapshots/avant/blog_geo-definition-2026.json');
  try {
    const snap = JSON.parse(await readFile(refArticle, 'utf8'));
    const graph = snap.schemas.find(s => s && s['@graph']);
    if (graph && !html.includes('application/ld+json')) {
      html = html.replace('</head>',
        `<script type="application/ld+json">${JSON.stringify(graph)}</script>\n</head>`);
    }
  } catch { /* capture absente : on n'invente pas de schéma */ }

  /* Garde-fou : ce correctif se relance, et une duplication silencieuse ici
     coûte des signaux SEO sur la page pivot. Chacun de ces marqueurs doit
     apparaître exactement une fois — sinon on n'écrit rien. */
  const uniques = {
    '<title>': /<title>/g,
    'rel="canonical"': /rel="canonical"/g,
    'name="description"': /name="description"/g,
    'id="menu-mobile"': /id="menu-mobile"/g,
    'data-fond': /<body[^>]*data-fond=/g,
  };
  const doublons = Object.entries(uniques)
    .map(([nom, re]) => [nom, (html.match(re) || []).length])
    .filter(([, n]) => n !== 1);
  if (doublons.length) {
    throw new Error('accueil non écrit — occurrences attendues à 1 : '
      + doublons.map(([nom, n]) => `${nom} = ${n}`).join(', '));
  }

  /* ── Compteur d'articles : recalculé à chaque build ──
     Le chiffre affiché sur l'accueil était figé à « 60+ ». Il se périmait à
     chaque publication, et personne ne pense à le corriger. Il est désormais
     déduit des pages réellement présentes.
     On ne compte QUE les articles canoniques : /blog/meilleure-agence-geo-france-2026
     sert le même contenu que la version -gso- et pointe vers elle, le compter
     ferait un article de trop. */
  const compte = await compteArticles();
  html = html.replace(
    /(<div class="eclat" data-compte="articles"><b>)\d+(<\/b>)/,
    (tout, av, ap) => `${av}${compte}${ap}`);
  if (!/data-compte="articles"><b>\d+</.test(html))
    throw new Error('accueil non écrit — le compteur d\'articles est introuvable');

  if (html === avant) { console.log('accueil : rien à changer'); return; }
  await writeFile(ACCUEIL, html);

  const liens = [...html.matchAll(/<a[^>]*href="([^"]*)"/g)].map(m => m[1]);
  console.log('accueil recâblé :');
  console.log('  liens href="#" restants :', liens.filter(h => h === '#').length);
  console.log('  lien vers /blog         :', liens.includes('/blog') ? 'oui' : 'NON');
  console.log('  menu mobile             :', html.includes('id="menu-mobile"') ? 'oui' : 'NON');
  console.log('  noindex                 :', html.includes('noindex') ? 'ENCORE PRÉSENT' : 'retiré');
}

main().catch(e => { console.error(e.message); process.exit(1); });
