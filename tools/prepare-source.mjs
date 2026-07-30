/**
 * prepare-source.mjs — prépare une page dont Lucas fournit lui-même le code.
 *
 * Entrée  : tools/sources/<page>.html (son code complet, tête + corps)
 * Sorties : tools/contenus-pages/<page>.json      (flux de blocs du <main>)
 *           tools/snapshots/refonte-<page>/<page>.json (référence de contrôle
 *           bâtie sur SON code : têtes, schémas, hiérarchie Hn, texte, liens)
 *
 * L'extraction passe par le DOM réel (Chrome headless, page servie en
 * same-origin) : lire la structure à la regex sur du HTML imbriqué produit
 * des erreurs silencieuses, le DOM non.
 *
 * Le fil d'Ariane (hors <main> dans les codes fournis) est repris en tête des
 * blocs pour que ses liens comptent dans le graphe vérifié.
 *
 * Usage : node tools/prepare-source.mjs --page=expertise-geo [--base=http://localhost:8090]
 */
import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const execFileP = promisify(execFile);
const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const page = process.argv.find(a => a.startsWith('--page='))?.slice(7);
const base = process.argv.find(a => a.startsWith('--base='))?.slice(7) ?? 'http://localhost:8090';
if (!page) throw new Error('usage : --page=<nom>');

const SRC = path.join(RACINE, `tools/sources/${page}.html`);
const source = await readFile(SRC, 'utf8');

/* ══ 1 · extraction de la structure par le DOM ══ */
const EXTRACTEUR = `<!doctype html><meta charset="utf-8"><body>
<iframe id="f" src="/_src.html" width="1440" height="900" style="border:0"></iframe>
<script>
setTimeout(function () {
  var d = document.getElementById('f').contentDocument;
  var GARDE = { A:'a', STRONG:'strong', EM:'em', CODE:'code', BR:'br' };
  function net(el) {
    var out = '';
    [].slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) { out += n.textContent; return; }
      if (n.nodeType !== 1) return;
      var tag = GARDE[n.tagName];
      if (!tag) { out += net(n); return; }
      if (tag === 'br') { out += '<br>'; return; }
      if (tag === 'a') {
        var h = n.getAttribute('href') || '#', t = n.getAttribute('target'), r = n.getAttribute('rel');
        out += '<a href="' + h + '"' + (t ? ' target="' + t + '"' : '') + (r ? ' rel="' + r + '"' : '') + '>' + net(n) + '</a>';
        return;
      }
      out += '<' + tag + '>' + net(n) + '</' + tag + '>';
    });
    return out;
  }
  var comp = function (s) { return s.replace(/\\s+/g, ' ').trim(); };
  var blocs = [], groupe = 'hero', nSec = 0;
  function pousse(t, h) { h = comp(h); if (h) blocs.push({ t: t, html: h, groupe: groupe }); }
  function liste(el, tag) {
    var lis = [].slice.call(el.children).filter(function (c) { return c.tagName === 'LI'; });
    blocs.push({ t: tag, groupe: groupe,
      html: '<' + tag + '>' + lis.map(function (li) { return '<li>' + comp(net(li)) + '</li>'; }).join('') + '</' + tag + '>' });
  }
  function tableau(el) {
    var part = function (sel, cell) {
      var sec = el.querySelector(sel);
      if (!sec) return '';
      return '<' + sel + '>' + [].slice.call(sec.querySelectorAll('tr')).map(function (tr) {
        return '<tr>' + [].slice.call(tr.children).map(function (c) {
          return '<' + cell + '>' + comp(net(c)) + '</' + cell + '>'; }).join('') + '</tr>';
      }).join('') + '</' + sel + '>';
    };
    blocs.push({ t: 'table', groupe: groupe, html: '<table>' + part('thead','th') + part('tbody','td') + '</table>' });
  }
  function marche(el) {
    [].slice.call(el.children).forEach(function (n) {
      var tag = n.tagName;
      if (tag === 'H2') { nSec++; groupe = 's' + nSec; pousse('h2', net(n)); return; }
      if (tag === 'H1') { pousse('h1', net(n)); return; }
      if (tag === 'H3') { pousse('h3', net(n)); return; }
      if (tag === 'H4') { pousse('h4', net(n)); return; }
      if (tag === 'P')  { pousse('p', net(n)); return; }
      if (tag === 'BLOCKQUOTE') { pousse('quote', net(n)); return; }
      if (tag === 'TABLE') { tableau(n); return; }
      if (tag === 'DL') {
        [].slice.call(n.children).forEach(function (c) {
          if (c.tagName === 'DT') pousse('faq-q', net(c));
          if (c.tagName === 'DD') pousse('faq-a', net(c));
        });
        return;
      }
      if (tag === 'UL' || tag === 'OL') {
        if (n.querySelector('h1,h2,h3,h4,p,table')) { marche(n); return; }
        liste(n, tag.toLowerCase()); return;
      }
      if (['LI','SECTION','ARTICLE','DIV','HEADER','FOOTER'].indexOf(tag) >= 0) { marche(n); return; }
    });
  }
  marche(d.querySelector('main'));
  var pre = document.createElement('pre');
  pre.id = 'r';
  pre.textContent = JSON.stringify(blocs);
  document.body.appendChild(pre);
}, 2500);
</script></body>`;

await copyFile(SRC, path.join(RACINE, 'site/_src.html'));
await writeFile(path.join(RACINE, 'site/_x.html'), EXTRACTEUR);
let blocs;
try {
  const { stdout } = await execFileP(CHROME, ['--headless=new', '--disable-gpu',
    '--window-size=1440,900', '--virtual-time-budget=9000', '--dump-dom', `${base}/_x.html`],
    { maxBuffer: 40 * 1024 * 1024 });
  const m = /<pre id="r">([\s\S]*?)<\/pre>/.exec(stdout);
  if (!m) throw new Error('extraction : aucune sortie (le serveur tourne-t-il ?)');
  const dec = t => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  blocs = JSON.parse(dec(m[1]));
} finally {
  await rm(path.join(RACINE, 'site/_src.html'), { force: true });
  await rm(path.join(RACINE, 'site/_x.html'), { force: true });
}

/* le fil d'Ariane vit hors <main> dans les codes fournis : on le rapatrie */
const bc = /<nav aria-label="Fil d'Ariane">\s*(<ol>[\s\S]*?<\/ol>)\s*<\/nav>/.exec(source);
if (bc) blocs.unshift({ t: 'breadcrumb', groupe: 'bc',
  html: bc[1].replace(/\s+/g, ' ').replace(/> </g, '><').trim() });

/* ══ 2 · référence de contrôle, bâtie sur le code fourni ══ */
const dec = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const plat = s => dec(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const meta = (attr, nom) => {
  const m = new RegExp(`<meta ${attr}="${nom}" content="([^"]*)"`).exec(source);
  return m ? dec(m[1]) : null;
};
const collecte = (attr, prefixe) => {
  const o = {};
  for (const m of source.matchAll(new RegExp(`<meta ${attr}="(${prefixe}[^"]+)" content="([^"]*)"`, 'g')))
    o[m[1]] = dec(m[2]);
  return o;
};
const corps = plat(/<body[\s\S]*<\/body>/.exec(source)[0]);
const titres = blocs.filter(b => /^h[1-4]$/.test(b.t))
  .map(b => ({ niveau: +b.t[1], texte: plat(b.html) }));
const ref = {
  title: dec(/<title>([\s\S]*?)<\/title>/.exec(source)[1]),
  description: meta('name', 'description'),
  keywords: meta('name', 'keywords'),
  robots: meta('name', 'robots'),
  canonical: /<link rel="canonical" href="([^"]*)"/.exec(source)[1],
  og: collecte('property', 'og:'),
  twitter: collecte('name', 'twitter:'),
  geo: collecte('name', 'geo\\.'),
  schemas: [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m => JSON.parse(m[1])),
  titres,
  h1: [titres.find(t => t.niveau === 1).texte],
  texteIntegral: corps,
  nbMots: corps.split(/\s+/).length,
  liensInternes: [...new Set([...source.matchAll(/href="(\/[^"]*)"/g)].map(m => m[1]))].sort(),
};

/* ══ 3 · contrôle de fidélité : chaque bloc doit exister dans le code ══ */
const absents = blocs.filter(b => plat(b.html) && !corps.includes(plat(b.html)));
if (absents.length) {
  console.error(`✗ ${absents.length} bloc(s) absent(s) du code source :`);
  absents.slice(0, 5).forEach(b => console.error('   ', plat(b.html).slice(0, 80)));
  process.exit(1);
}

await mkdir(path.join(RACINE, `tools/snapshots/refonte-${page}`), { recursive: true });
await writeFile(path.join(RACINE, `tools/contenus-pages/${page}.json`),
  JSON.stringify({ page, blocs }, null, 1));
await writeFile(path.join(RACINE, `tools/snapshots/refonte-${page}/${page}.json`),
  JSON.stringify(ref, null, 1));

console.log(`✓ ${page} préparée depuis le code fourni`);
console.log(`  blocs        : ${blocs.length} (fidélité vérifiée, 0 écart)`);
console.log(`  titres Hn    : ${titres.length}  · schémas : ${ref.schemas.length}`);
console.log(`  mots         : ${ref.nbMots}`);
console.log(`  title        : ${ref.title}`);
console.log(`  canonical    : ${ref.canonical}`);
