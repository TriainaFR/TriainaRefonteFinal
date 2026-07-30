/**
 * genere-visuel.mjs — fabrique un visuel d'article dans la direction artistique
 * du site, par capture d'un gabarit HTML rendu en local.
 *
 * Pourquoi : certains articles n'ont pas d'illustration exploitable (fichier
 * corrompu, image jamais déposée). Plutôt que de laisser un visuel cassé ou
 * d'emprunter l'image d'un autre article, on en produit un aux couleurs de la
 * marque — nuit, halo bleu, trident, titre. Aucune question de licence, et le
 * résultat reste cohérent avec la maquette. C'est la méthode qui a servi à
 * fabriquer `site/og-image.jpg`.
 *
 * Le résultat est un PLACEHOLDER de qualité : il tient la page tant qu'une
 * vraie photo n'a pas été choisie.
 *
 * Usage :
 *   node tools/genere-visuel.mjs --titre="Agence Google AI Overview" \
 *        --surtitre="Guide 2026" --sortie=site/images/articles/mon-article.jpg
 *   [--largeur=1200] [--hauteur=630]
 */
import { execFile } from 'node:child_process';
import { writeFile, unlink, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const execFileP = promisify(execFile);
const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const arg = (nom, defaut = null) => {
  const a = process.argv.find(x => x.startsWith(`--${nom}=`));
  return a ? a.slice(nom.length + 3) : defaut;
};

const titre = arg('titre');
const surtitre = arg('surtitre', 'Triaina — Agence SEO & GEO');
const sortie = arg('sortie');
const L = +arg('largeur', 1200);
const H = +arg('hauteur', 630);
if (!titre || !sortie) {
  console.error('usage: node tools/genere-visuel.mjs --titre="…" --sortie=site/images/…jpg');
  process.exit(1);
}

const ech = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Le gabarit vit dans site/ le temps de la capture : Chrome doit pouvoir
   charger les polices du site en same-origin depuis le serveur local. */
const gabarit = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/fonts.css">
<style>
  *{margin:0; padding:0; box-sizing:border-box}
  html,body{width:${L}px; height:${H}px; overflow:hidden}
  body{background:#0B1428; position:relative;
    font-family:'Manrope',system-ui,sans-serif; color:#EAF2FF}
  /* halo bleu ambiant, décentré comme sur l'accueil */
  .halo{position:absolute; inset:-20%;
    background:radial-gradient(58% 62% at 72% 38%, rgba(37,99,235,.34), transparent 68%),
               radial-gradient(40% 46% at 18% 84%, rgba(37,99,235,.13), transparent 70%)}
  /* grain léger, pour que l'aplat ne soit pas plat */
  .grain{position:absolute; inset:0; opacity:.05;
    background-image:radial-gradient(rgba(255,255,255,.7) .5px, transparent .5px);
    background-size:3px 3px}
  .cadre{position:absolute; inset:0; display:flex; flex-direction:column;
    justify-content:center; padding:0 ${Math.round(L * 0.075)}px}
  .sur{font-family:ui-monospace,monospace; font-size:${Math.round(H * .026)}px;
    letter-spacing:.22em; text-transform:uppercase; color:#60A5FA}
  h1{font-family:'Syne',sans-serif; font-weight:800; color:#fff;
    font-size:${Math.round(H * (titre.length > 46 ? .088 : .112))}px;
    line-height:1.05; letter-spacing:-.02em; margin-top:${Math.round(H * .045)}px;
    /* le titre s'arrête avant le trident : la colonne de texte ne va jamais
       au-delà du bord gauche du symbole, sinon les lettres le percutent. */
    max-width:${Math.round(L * .615)}px}
  .filet{width:${Math.round(L * .1)}px; height:3px; margin-top:${Math.round(H * .055)}px;
    background:linear-gradient(90deg,#FFE9B8,rgba(255,233,184,0))}
  /* le trident, à droite, en lumière */
  .tri{position:absolute; right:${Math.round(L * .07)}px; top:50%;
    transform:translateY(-50%); width:${Math.round(H * .38)}px; opacity:.92;
    filter:drop-shadow(0 0 26px rgba(96,165,250,.5))}
  .marque{position:absolute; left:${Math.round(L * .075)}px; bottom:${Math.round(H * .07)}px;
    font-family:'Syne',sans-serif; font-weight:800; letter-spacing:.16em;
    font-size:${Math.round(H * .028)}px; color:rgba(234,242,255,.72)}
</style></head><body>
<div class="halo"></div><div class="grain"></div>
<svg class="tri" viewBox="0 0 40 40" aria-hidden="true">
  <rect x="18" y="5" width="4" height="25" rx="1" fill="#2563EB"/>
  <rect x="10" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
  <rect x="27" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
</svg>
<div class="cadre">
  <p class="sur">${ech(surtitre)}</p>
  <h1>${ech(titre)}</h1>
  <div class="filet"></div>
</div>
<p class="marque">TRIAINA</p>
</body></html>`;

const nomTmp = `_visuel-${Date.now().toString(36)}.html`;
const cheminTmp = path.join(RACINE, 'site', nomTmp);
const png = path.join(RACINE, 'site', nomTmp.replace('.html', '.png'));

await writeFile(cheminTmp, gabarit);
try {
  await execFileP(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=${L},${H}`, '--virtual-time-budget=4000',
    '--default-background-color=0B1428FF',
    `--screenshot=${png}`, `http://localhost:8090/${nomTmp}`,
  ], { timeout: 60000 });

  /* JPEG : c'est le format attendu par les balises du site, et il pèse le
     tiers du PNG pour ce type d'image (aplats + dégradés). */
  await execFileP('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82',
    png, '--out', path.join(RACINE, sortie)]);
  const octets = (await readFile(path.join(RACINE, sortie))).length;
  console.log(`✓ ${sortie} — ${L}×${H}, ${Math.round(octets / 1024)} ko`);
} finally {
  await unlink(cheminTmp).catch(() => {});
  await unlink(png).catch(() => {});
}
