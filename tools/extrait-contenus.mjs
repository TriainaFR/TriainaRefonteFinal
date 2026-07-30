/**
 * extrait-contenus.mjs — sort le contenu réel des 60 articles en HTML statique.
 *
 * Les articles sont des composants React ; on les rend hors navigateur avec
 * react-dom/server. C'est la seule façon d'obtenir leur HTML **exact** sans le
 * retranscrire à la main — donc sans risque de perdre un titre, un tableau ou
 * une ligne de texte indexée.
 *
 * Sortie : tools/contenus/<slug>.json  { slug, id, titre, contenu, schemas, seo }
 *
 * Usage : node tools/extrait-contenus.mjs
 */
import { build } from 'esbuild';
import { mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SORTIE = path.join(RACINE, 'tools/contenus');
const TMP = path.join(RACINE, 'tools/.tmp-extraction');

/**
 * Pendant l'extraction, <ArticleLayout> ne doit rendre QUE le contenu, et
 * <SEO> ne doit rien rendre : on veut la matière, pas l'enveloppe React.
 * On les remplace par des doublures via un plugin de résolution esbuild.
 */
const DOUBLURES = {
  layout: `
    import React from 'react';
    export const ArticleLayout = ({ children }) => React.createElement(React.Fragment, null, children);
    export default ArticleLayout;
  `,
  seo: `
    import React from 'react';
    export const SEO = () => null;
    export default SEO;
  `,
};

const pluginDoublures = {
  name: 'doublures',
  setup(b) {
    b.onResolve({ filter: /blog\/ArticleLayout$/ }, () => ({ path: 'doublure-layout', namespace: 'd' }));
    b.onResolve({ filter: /components\/SEO$/ }, () => ({ path: 'doublure-seo', namespace: 'd' }));
    b.onLoad({ filter: /.*/, namespace: 'd' }, args => ({
      contents: args.path === 'doublure-layout' ? DOUBLURES.layout : DOUBLURES.seo,
      loader: 'jsx',
      resolveDir: RACINE,
    }));
  },
};

async function main() {
  const dossierBlog = path.join(RACINE, 'views/blog');
  const fichiers = (await readdir(dossierBlog)).filter(f => f.endsWith('.tsx')).sort();

  /* Point d'entrée généré : importe chaque article et expose son composant.
     Chemins absolus — le fichier vit dans un sous-dossier temporaire. */
  const abs = p => JSON.stringify(path.join(RACINE, p));
  const noms = [];
  const lignes = [`export { BLOG_DATA } from ${abs('constants.ts')};`];
  for (const f of fichiers) {
    const nom = f.replace(/\.tsx$/, '');
    noms.push(nom);
    lignes.push(`export * as A_${nom} from ${abs('views/blog/' + nom + '.tsx')};`);
  }
  await mkdir(TMP, { recursive: true });
  const entree = path.join(TMP, 'entree.js');
  await writeFile(entree, lignes.join('\n'));

  await build({
    entryPoints: [entree],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: path.join(TMP, 'bundle.mjs'),
    jsx: 'automatic',
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
    plugins: [pluginDoublures],
    logLevel: 'error',
  });

  const { renderToStaticMarkup } = await import('react-dom/server');
  const mod = await import(path.join(TMP, 'bundle.mjs'));
  const BLOG_DATA = mod.BLOG_DATA;

  await mkdir(SORTIE, { recursive: true });
  let ok = 0, rates = [];

  for (const nom of noms) {
    const espace = mod[`A_${nom}`];
    const Composant = espace?.[nom] ?? Object.values(espace ?? {}).find(v => typeof v === 'function');
    if (!Composant) { rates.push([nom, 'composant introuvable']); continue; }

    let html;
    try {
      const React = (await import('react')).default;
      html = renderToStaticMarkup(React.createElement(Composant, { onNavigate: () => {} }));
    } catch (e) {
      rates.push([nom, String(e.message).slice(0, 110)]);
      continue;
    }
    if (!html || html.length < 400) { rates.push([nom, `rendu vide (${html?.length ?? 0} car.)`]); continue; }

    /* L'identifiant est écrit noir sur blanc dans le fichier source : on le lit
       là, plutôt que de le devinter depuis le HTML (le titre appartient à
       l'enveloppe, pas au contenu rendu). */
    const src = await readFile(path.join(dossierBlog, nom + '.tsx'), 'utf8');
    /* le nom du paramètre varie d'un article à l'autre (`p`, `post`…) : on le
       capture et on exige que les deux occurrences correspondent, plutôt que de
       figer « p » — un article écrit autrement passait à la trappe en silence. */
    const mId = /BLOG_DATA\.find\(\s*(\w+)\s*=>\s*\1\.id\s*===\s*'([^']+)'\s*\)/.exec(src);
    const post = mId ? BLOG_DATA.find(p => p.id === mId[2]) : null;
    if (!post) { rates.push([nom, mId ? `id « ${mId[1]} » absent de BLOG_DATA` : 'id introuvable dans la source']); continue; }

    await writeFile(path.join(SORTIE, post.id + '.json'), JSON.stringify({
      composant: nom, id: post.id, url: post.url, titre: post.title,
      excerpt: post.excerpt, date: post.date, tag: post.tag, image: post.image,
      html,
    }, null, 0));
    ok++;
  }

  await rm(TMP, { recursive: true, force: true });
  console.log(`${ok} contenu(s) extraits → ${path.relative(RACINE, SORTIE)}`);
  if (rates.length) {
    console.log(`\n${rates.length} échec(s) :`);
    for (const [n, e] of rates) console.log(`  ✗ ${n.padEnd(34)} ${e}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
