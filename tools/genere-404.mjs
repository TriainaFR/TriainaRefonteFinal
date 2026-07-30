/**
 * genere-404.mjs — produit `site/404.html`, la page servie sur une URL inconnue.
 *
 * Pourquoi elle existe : sans fichier 404, un hébergeur statique sert sa propre
 * page d'erreur — texte brut, sans la marque, sans navigation, et surtout sans
 * le moindre lien pour rattraper le visiteur. Sur un site qui vient de changer
 * d'adresse pour 85 pages, c'est la page la plus susceptible d'être vue.
 *
 * Choix SEO : `noindex, follow` (une page d'erreur ne s'indexe pas, mais ses
 * liens doivent rester suivis), AUCUN canonical (une 404 ne désigne aucune page
 * canonique), aucune donnée structurée. La nav et le pied sont repris des
 * mêmes fonctions que les 85 autres pages : ils ne pourront pas diverger.
 *
 * ⚠︎ Le fichier ne suffit pas : l'hébergeur doit être configuré pour le servir
 *    AVEC un vrai code HTTP 404 (voir REDIRECTIONS.md).
 *
 * Usage : node tools/genere-404.mjs
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { barreNav, pieds } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));

const STYLE = `
  .e404{max-width:64rem; margin:0 auto; padding:9rem 1.5rem 5rem}
  .e404 .k{font-family:ui-monospace,monospace; font-size:.66rem; letter-spacing:.2em;
    text-transform:uppercase; color:var(--bleu-c)}
  .e404 h1{font-family:var(--syne); font-weight:800; color:#fff; margin-top:.9rem;
    font-size:clamp(2.2rem,5vw,3.6rem); line-height:1.06; letter-spacing:-.015em}
  .e404 h1 em{font-style:normal; color:var(--lueur)}
  .e404 > p{color:var(--brume); line-height:1.75; margin-top:1.1rem; max-width:52ch}
  .e404 h2{font-family:var(--syne); font-weight:700; color:#fff; font-size:1.05rem;
    margin-top:3.2rem; letter-spacing:.01em}
  .e404 ul{margin-top:1rem; display:grid; gap:.55rem; list-style:none;
    grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))}
  .e404 li a{display:block; padding:.85rem 1rem; border:1px solid rgba(148,163,184,.16);
    border-radius:.6rem; color:#E2E8F0; text-decoration:none; font-size:.95rem;
    transition:border-color .35s, color .35s, transform .35s}
  .e404 li a:hover{border-color:rgba(255,233,184,.5); color:#fff; transform:translateY(-2px)}
  /* da31.css impose une capitale monospace aux paragraphes de fin de section :
     on rétablit ici la typographie courante, sinon la phrase part en petites
     capitales espacées et se casse en trois lignes. */
  .e404 .retour{display:block; margin-top:2.6rem; font-family:var(--manrope),system-ui,sans-serif;
    text-transform:none; letter-spacing:normal; font-size:.95rem;
    line-height:1.75; color:var(--brume); max-width:52ch}
  .e404 .retour a{display:inline; color:var(--bleu-p); text-decoration:underline;
    text-underline-offset:3px; font-family:inherit; text-transform:none;
    letter-spacing:normal; font-size:inherit; padding:0; border:0; transform:none}
`;

/* Les portes de sortie : les pages qui rattrapent le mieux un visiteur perdu. */
const SORTIES = [
  ['/', 'Accueil'],
  ['/expertise-seo', 'Expertise SEO'],
  ['/expertise-geo', 'Expertise GEO'],
  ['/blog', 'Le blog — guides SEO & GEO'],
  ['/references', 'Nos références'],
  ['/contact', 'Nous contacter'],
];

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page introuvable | Triaina</title>
<meta name="description" content="Cette page n'existe pas ou a été déplacée. Retrouvez les expertises SEO et GEO de Triaina, le blog et le contact.">
<meta name="robots" content="noindex, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="Page introuvable">
<meta property="og:description" content="Cette page n'existe pas ou a été déplacée.">
<meta property="og:image" content="https://www.triaina.fr/og-image.jpg">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Triaina">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
<link rel="preload" href="/assets/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
<script src="/assets/da31.js" defer></script>
<style>${STYLE}</style>
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav()}

<main>
  <section class="e404">
    <p class="k">Erreur 404</p>
    <h1>Cette page est <em>hors champ</em>.</h1>
    <p>L'adresse demandée n'existe pas, ou elle a changé. Rien n'est perdu :
    voici les chemins les plus courts vers ce que vous cherchiez.</p>

    <h2>Où aller</h2>
    <ul>
${SORTIES.map(([u, l]) => `      <li><a href="${u}">${l}</a></li>`).join('\n')}
    </ul>

    <p class="retour">Si vous êtes arrivé ici depuis un lien de notre site,
    <a href="/contact">signalez-le nous</a> — on le corrige.</p>
  </section>
</main>

${pieds()}

</body>
</html>
`;

await writeFile(path.join(RACINE, 'site/404.html'), html);
console.log(`404.html écrit — ${(html.length / 1024).toFixed(1)} ko, ${SORTIES.length} portes de sortie`);
