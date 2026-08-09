/**
 * build.mjs — rejoue TOUTE la chaîne de génération du site statique, dans l'ordre.
 *
 * L'ordre n'est pas cosmétique :
 *  - `genere-blog` pose la nav et le pied de page que les autres réutilisent ;
 *  - `ajoute-entites-geo` doit passer APRÈS tous les générateurs, parce que
 *    genere-faq et genere-contact relisent leur schéma dans les captures de
 *    l'ancien site, qui n'ont pas les entités GEO — sans ce passage final,
 *    chaque régénération les reperd en silence ;
 *  - `normalise-urls` ferme la marche : plus rien ne peut réintroduire une URL
 *    sans www après lui.
 *
 * Un générateur qui échoue arrête tout : mieux vaut un site non régénéré qu'un
 * site à moitié régénéré.
 *
 * Usage : node tools/build.mjs
 */
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const execFileP = promisify(execFile);
const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const CHAINE = [
  'genere-blog.mjs',
  'genere-blog-liste.mjs',
  'patch-accueil.mjs',
  'genere-agence.mjs',
  'genere-faq.mjs',
  'genere-contact.mjs',
  'genere-expertise-seo.mjs',
  'genere-references.mjs',
  'genere-expertises.mjs',
  'ajoute-entites-geo.mjs',
  /* avant le sitemap : celui-ci écarte les pages non canoniques en comparant
     les canonicals, autant qu'ils soient déjà tous sur le même hôte */
  'normalise-urls.mjs',
  /* la page 404 reprend la nav et le pied des autres pages : sans elle dans la
     chaîne, elle se met à diverger dès qu'un lien ou une mention change (c'est
     arrivé : elle a gardé « Triaina Global Systems » une génération de trop). */
  'genere-404.mjs',
  /* les valeurs commerciales tranchées par Lucas (prix, délais, horaires) sont
     dispersées dans les contenus figés ET dans les captures de l'ancien site,
     qu'on ne retouche pas : cette passe les aligne sur les pages produites.
     Elle passe AVANT le sitemap, qui relit titres et descriptions pour llms.txt. */
  'valeurs-officielles.mjs',
  /* après tous les générateurs : ils recopient le JSON-LD des captures de
     l'ancien site, images comprises, sans vérifier que les fichiers existent. */
  'repare-images-schema.mjs',
  'genere-robots-sitemap.mjs',
  /* EN DERNIER, une fois que plus personne ne réécrit de HTML : l'empreinte
     posée sur /assets/*.css et *.js. Sans elle, les assets sont servis avec un
     cache de 30 jours sur une URL qui ne change jamais — un correctif CSS
     déployé n'atteint pas les visiteurs déjà venus, et rien ne le signale. */
  'version-assets.mjs',
];

/**
 * Étapes dont l'entrée est le CODE DE L'ANCIEN SITE (views/blog/*.tsx et
 * constants.ts). Ce code a été supprimé du dépôt le 30/07/2026 : les pages
 * d'article sont désormais FIGÉES dans site/blog/. Ces étapes sont donc sautées
 * plutôt que de faire échouer toute la chaîne — sans quoi une seule entrée
 * manquante empêcherait aussi de régénérer les pages qui, elles, fonctionnent
 * encore (expertises, FAQ, contact, références, annuaire, sitemap).
 */
const DEPEND_ANCIEN_CODE = {
  'genere-blog.mjs': ['views/blog', 'constants.ts'],
  'genere-blog-liste.mjs': ['constants.ts'],
  'patch-accueil.mjs': [],           // n'a besoin que de site/
};

const manque = (outil) => (DEPEND_ANCIEN_CODE[outil] ?? [])
  .filter(p => !existsSync(path.join(RACINE, p)));

const debut = process.hrtime.bigint();
let sautees = 0;
for (const [i, outil] of CHAINE.entries()) {
  const absents = manque(outil);
  if (absents.length) {
    console.log(`\n[${i + 1}/${CHAINE.length}] ${outil} — SAUTÉE (entrée absente : ${absents.join(', ')})`);
    sautees++;
    continue;
  }
  process.stdout.write(`\n[${i + 1}/${CHAINE.length}] ${outil}\n`);
  try {
    const { stdout, stderr } = await execFileP('node', [path.join('tools', outil)], {
      cwd: RACINE, maxBuffer: 32 * 1024 * 1024,
    });
    const sortie = (stdout + stderr).trim();
    if (sortie) console.log(sortie.split('\n').map(l => `  ${l}`).join('\n'));
  } catch (e) {
    console.error(`\n✗ ÉCHEC sur ${outil} — chaîne interrompue.\n`);
    console.error((e.stdout ?? '') + (e.stderr ?? e.message));
    process.exit(1);
  }
}
const secondes = Number(process.hrtime.bigint() - debut) / 1e9;
console.log(`\n✓ chaîne terminée en ${secondes.toFixed(1)} s — ${CHAINE.length - sautees}/${CHAINE.length} étapes exécutées${sautees ? `, ${sautees} sautée(s)` : ''}`);
