/**
 * verifie-schemas.mjs — garantit qu'aucune donnée structurée ne déclare une URL
 * morte. Répare les fichiers (images, logos) ; refuse le build sur une page.
 *
 * Pourquoi cette passe existe. Le 08/08/2026, la Search Console a signalé une
 * 404 sur /blog/meilleure-agence-referencement-ia-france : cette URL n'était
 * liée nulle part dans le texte, elle était seulement DÉCLARÉE dans le JSON-LD
 * de /annuaire, hérité de l'ancien site. Google crawle ce qu'il trouve dans les
 * données structurées, exactement comme un lien.
 *
 * L'audit qui a suivi a montré que le même défaut touchait les images :
 *  · 12 pages déclaraient `publisher.logo` sur /logo.png ou
 *    /images/logo-triaina.png — deux fichiers qui n'existent pas. Or Google
 *    exige un logo VALIDE pour accorder un résultat enrichi à un Article :
 *    ces pages perdaient leur éligibilité en silence ;
 *  · 3 articles déclaraient leur illustration sous /images/<slug>.jpg alors
 *    qu'elle vit sous /images/articles/<slug>.jpg ;
 *  · 4 pages piliers déclaraient une image qui n'a jamais été livrée.
 *
 * `genere-blog.mjs` fait déjà ce travail pour la balise og:image (resoutImageOg).
 * Cette passe applique la même règle au JSON-LD, que les générateurs recopient
 * depuis les captures de l'ancien site sans le vérifier.
 *
 * Règle, dans l'ordre : le fichier existe → on ne touche à rien ; sinon
 * /images/articles/<même nom> s'il existe ; sinon le logo du site pour un
 * logo, l'image de partage par défaut pour une illustration.
 *
 * Idempotent : au second passage, plus rien n'est à réparer.
 *
 * Les URLs de PAGES, elles, ne sont pas réparées : deviner vers quelle page
 * rediriger produirait un lien plausible et faux, pire qu'une erreur visible.
 * Elles font échouer la chaîne — ce qui n'est pas excessif : c'est exactement
 * ce défaut qui a coûté la 404 du 08/08, et le correctif appliqué à la main sur
 * site/annuaire/index.html a été ANNULÉ au build suivant, parce que
 * genere-expertises régénère cette page depuis
 * tools/snapshots/ancien-divers/annuaire.json. Corriger la page produite ne
 * suffit pas : il faut corriger la capture. Sans ce garde-fou, la régression
 * repasse en silence et on croit le problème réglé.
 *
 * Usage : node tools/verifie-schemas.mjs   (après tous les générateurs)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SITE = path.join(RACINE, 'site');
const HOTE = 'https://www.triaina.fr';
const LOGO = '/logo.svg';
const PARTAGE = '/og-image.jpg';

const existe = (url) => {
  const chemin = path.join(SITE, url.replace(/^\//, ''));
  return existsSync(chemin) || existsSync(path.join(chemin, 'index.html'));
};

/** Cible de remplacement, ou null si l'URL est déjà bonne. */
function repare(url) {
  if (existe(url)) return null;
  const nom = path.basename(url);
  const dansArticles = `/images/articles/${nom}`;
  if (existe(dansArticles)) return dansArticles;
  if (/logo/i.test(nom)) return LOGO;
  return PARTAGE;
}

async function pages(dir = SITE, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['assets', 'images'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await pages(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const liste = await pages();
const compte = new Map();
let touchees = 0;

for (const f of liste) {
  const avant = await readFile(f, 'utf8');
  let apres = avant;

  /* On ne réécrit QUE l'intérieur des blocs JSON-LD : le texte visible et les
     balises <meta> ont leurs propres règles ailleurs dans la chaîne. */
  apres = apres.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (bloc, json) => {
    const corrige = json.replace(
      new RegExp(`${HOTE}(/[A-Za-z0-9\\-/._]*\\.(?:jpg|jpeg|png|webp|svg))`, 'g'),
      (tout, chemin) => {
        const cible = repare(chemin);
        if (!cible) return tout;
        const cle = `${chemin} → ${cible}`;
        compte.set(cle, (compte.get(cle) ?? 0) + 1);
        return HOTE + cible;
      });
    return `<script type="application/ld+json">${corrige}</script>`;
  });

  if (apres !== avant) { await writeFile(f, apres); touchees++; }
}

console.log(`images de schéma vérifiées sur ${liste.length} page(s) — ${touchees} réparée(s)`);
for (const [cle, n] of [...compte].sort()) console.log(`  ${String(n).padStart(3)} × ${cle}`);
if (!compte.size) console.log('  (rien à réparer — normal au second passage)');

/* ── Contrôle bloquant : les URLs de PAGES déclarées dans le JSON-LD ──
   Google les crawle comme des liens. Une seule URL morte ici suffit à faire
   remonter une 404 en Search Console, sans qu'aucun lien du HTML ne la porte. */
const mortes = new Map();
for (const f of liste) {
  for (const m of (await readFile(f, 'utf8'))
    .matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    for (const u of m[1].matchAll(new RegExp(`${HOTE}(/[A-Za-z0-9\\-/._]*)`, 'g'))) {
      const url = u[1];
      if (url === '/' || /\.[a-z0-9]+$/i.test(url) || existe(url)) continue;
      const ou = mortes.get(url) ?? new Set();
      ou.add(path.relative(SITE, f));
      mortes.set(url, ou);
    }
  }
}
if (mortes.size) {
  console.error(`\n✗ ${mortes.size} URL(s) de page morte(s) déclarée(s) dans les schémas :`);
  for (const [url, ou] of mortes) console.error(`  ${url}\n      déclarée par ${[...ou].join(', ')}`);
  console.error('\nCorriger la CAPTURE qui alimente le générateur, pas la page produite :'
    + '\nun correctif posé sur site/**.html est annulé au build suivant.');
  process.exit(1);
}
console.log(`URLs de page déclarées : toutes servies ✓`);
