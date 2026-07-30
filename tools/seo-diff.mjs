/**
 * seo-diff.mjs — compare deux captures de signature SEO/GEO et bloque
 * si un signal a bougé.
 *
 * Usage : node tools/seo-diff.mjs tools/snapshots/avant tools/snapshots/apres
 * Sortie : code 1 si au moins une régression BLOQUANTE est détectée.
 *
 * Doctrine : le SEO/GEO existant est gelé. Tout ce qui est indexé ou lu par un
 * crawler (balises, schémas, hiérarchie Hn, texte, URLs) doit être identique.
 * Les ajouts de présentation (nouveaux liens de navigation, libellés d'interface)
 * remontent en AVERTISSEMENT, jamais en silence.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/** Champs dont la moindre différence est une régression. */
const CRITIQUES = ['title', 'description', 'keywords', 'robots', 'canonical'];
const OBJETS_CRITIQUES = ['og', 'twitter', 'geo'];

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function charge(dir) {
  const fichiers = (await readdir(dir)).filter(f => f.endsWith('.json') && f !== '_index.json');
  const out = {};
  for (const f of fichiers) {
    out[f.replace(/\.json$/, '')] = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
  }
  return out;
}

/** Hiérarchie Hn sous forme comparable : « 2:Mon titre ». */
const hn = sig => (sig.titres ?? []).map(t => `${t.niveau}:${t.texte}`);

/** Mots du contenu, pour repérer une perte de texte indexable. */
const mots = sig => new Set((sig.texteIntegral ?? '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(m => m.length > 3));

function comparePage(route, a, b) {
  const bloquants = [], avertissements = [];

  for (const champ of CRITIQUES) {
    if (a[champ] !== b[champ]) {
      bloquants.push(`${champ}\n      avant : ${JSON.stringify(a[champ])}\n      après : ${JSON.stringify(b[champ])}`);
    }
  }
  for (const champ of OBJETS_CRITIQUES) {
    if (!eq(a[champ], b[champ])) {
      bloquants.push(`${champ}\n      avant : ${JSON.stringify(a[champ])}\n      après : ${JSON.stringify(b[champ])}`);
    }
  }

  if (!eq(a.schemas, b.schemas)) {
    const ta = (a.typesSchema ?? []).join(', '), tb = (b.typesSchema ?? []).join(', ');
    bloquants.push(ta !== tb
      ? `JSON-LD : types modifiés\n      avant : [${ta}]\n      après : [${tb}]`
      : `JSON-LD : contenu modifié (types identiques [${ta}]) — comparer les fichiers pour le détail`);
  }

  if (!eq(a.h1, b.h1)) {
    bloquants.push(`H1\n      avant : ${JSON.stringify(a.h1)}\n      après : ${JSON.stringify(b.h1)}`);
  }

  const [ha, hb] = [hn(a), hn(b)];
  if (!eq(ha, hb)) {
    const perdus = ha.filter(t => !hb.includes(t));
    const ajoutes = hb.filter(t => !ha.includes(t));
    if (perdus.length) bloquants.push(`hiérarchie Hn : ${perdus.length} titre(s) perdu(s)\n      ${perdus.slice(0, 5).join('\n      ')}`);
    else if (ajoutes.length) avertissements.push(`hiérarchie Hn : ${ajoutes.length} titre(s) ajouté(s) — ${ajoutes.slice(0, 3).join(' | ')}`);
    else bloquants.push('hiérarchie Hn : ordre des titres modifié');
  }

  const [ma, mb] = [mots(a), mots(b)];
  const perdus = [...ma].filter(m => !mb.has(m));
  if (perdus.length) {
    bloquants.push(`texte : ${perdus.length} mot(s) disparu(s) du contenu indexable\n      ex. ${perdus.slice(0, 12).join(', ')}`);
  }
  const dMots = (b.nbMots ?? 0) - (a.nbMots ?? 0);
  if (!perdus.length && dMots < -20) {
    avertissements.push(`volume de texte : ${dMots} mots`);
  }

  const la = a.liensInternes ?? [], lb = b.liensInternes ?? [];
  const liensPerdus = la.filter(l => !lb.includes(l));
  const liensAjoutes = lb.filter(l => !la.includes(l));
  if (liensPerdus.length) bloquants.push(`maillage interne : ${liensPerdus.length} lien(s) perdu(s)\n      ${liensPerdus.slice(0, 8).join(', ')}`);
  if (liensAjoutes.length) avertissements.push(`maillage interne : ${liensAjoutes.length} lien(s) ajouté(s) — ${liensAjoutes.slice(0, 6).join(', ')}`);

  return { bloquants, avertissements };
}

async function main() {
  const [dirA, dirB] = process.argv.slice(2);
  if (!dirA || !dirB) {
    console.error('usage: node tools/seo-diff.mjs <avant> <apres>');
    process.exit(1);
  }
  const [A, B] = [await charge(dirA), await charge(dirB)];

  const toutes = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
  let nbBloquants = 0, nbAvert = 0, pagesKo = 0, pagesOk = 0;

  console.log(`Comparaison ${dirA} → ${dirB}\n${toutes.length} pages\n${'─'.repeat(70)}`);

  for (const page of toutes) {
    if (!A[page]) { console.log(`\n⚠︎  ${page} — page NOUVELLE (absente de la référence)`); nbAvert++; continue; }
    if (!B[page]) { console.log(`\n✗  ${page} — page DISPARUE : URL perdue, régression majeure`); nbBloquants++; pagesKo++; continue; }

    const { bloquants, avertissements } = comparePage(page, A[page], B[page]);
    if (!bloquants.length && !avertissements.length) { pagesOk++; continue; }

    console.log(`\n${bloquants.length ? '✗' : '⚠︎'}  ${page}`);
    for (const b of bloquants) console.log(`    ✗ ${b}`);
    for (const a of avertissements) console.log(`    ⚠︎ ${a}`);
    nbBloquants += bloquants.length;
    nbAvert += avertissements.length;
    if (bloquants.length) pagesKo++;
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`${pagesOk} page(s) strictement identiques`);
  console.log(`${pagesKo} page(s) en régression — ${nbBloquants} problème(s) bloquant(s)`);
  console.log(`${nbAvert} avertissement(s) (ajouts de présentation à valider)`);

  if (nbBloquants) {
    console.log('\nSEO/GEO NON PRÉSERVÉ — ne pas livrer en l\'état.');
    process.exit(1);
  }
  console.log('\nSEO/GEO préservé : aucune régression bloquante.');
}

main();
