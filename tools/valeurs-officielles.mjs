/**
 * valeurs-officielles.mjs — aligne sur TOUT le site les valeurs commerciales
 * que Lucas a tranchées le 30/07/2026, texte visible ET données structurées.
 *
 * Pourquoi une passe finale plutôt qu'une correction dans chaque source :
 * ces valeurs sont dispersées dans les contenus figés des articles, dans les
 * contenus de pages, et surtout dans les CAPTURES de l'ancien site — que l'on
 * ne retouche pas, parce qu'elles sont le témoin de ce que servait la prod et
 * qu'elles font foi pour les garde-fous de parité. Une passe finale, idempotente,
 * qui s'applique après tous les générateurs, met tout d'accord sans abîmer ce
 * qui sert de référence.
 *
 * ⚠︎ Chaque règle vise une PHRASE, jamais un nombre nu : le site cite aussi les
 *    tarifs et les délais des agences concurrentes (Eskimoz, Primelis,
 *    Optimize360, Digimood, Webconversion) et des fourchettes de marché. Les
 *    toucher serait une erreur factuelle. Une règle qui ne trouve plus sa cible
 *    est SIGNALÉE : le silence serait pire que l'échec.
 *
 * Décisions appliquées :
 *   · audit  : à partir de 1 700 €          (valait 1 500, 3 000 ou 3 500 selon la page)
 *   · mensuel: plancher 500 €/mois          (valait 1 000 €/mois par endroits)
 *   · GEO    : premières citations en 6 à 8 semaines  (valait 4 à 8)
 *   · clients: « plus de 50 »               (valait 50, ou « étude de 100 »)
 *   · horaires: 08:00-19:00 partout, schémas compris (les schémas disaient 09:00)
 *
 * Usage : node tools/valeurs-officielles.mjs   (dernière étape du build)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SITE = path.join(RACINE, 'site');

/* Chaque règle : [étiquette, avant, après]. Les variantes d'écriture (espace
   fine, insécable, &nbsp;, avec ou sans espace avant €) sont déclinées, car le
   HTML servi n'est pas homogène là-dessus. */
const REGLES = [
  /* ── prix d'un audit : 1 700 € ── */
  ['audit 3 500 → 1 700', 'Un audit référencement IA coûte à partir de 3 500€', 'Un audit référencement IA coûte à partir de 1 700 €'],
  ['audit GSO 3 500 → 1 700', 'Un audit GSO coûte à partir de 3 500€', 'Un audit GSO coûte à partir de 1 700 €'],
  ['audit 3 500 (variante espacée)', 'audit référencement IA complet coûte 3 500€', 'audit référencement IA complet coûte 1 700 €'],
  ['audit 1 500 HT → 1 700', 'audit SEO &amp; GEO démarre à 1 500 € HT', 'audit SEO &amp; GEO démarre à 1 700 € HT'],
  ['audit 1 500 (tableau Triaina)', 'Audit à partir de 1 500 €', 'Audit à partir de 1 700 €'],
  ['audit 3 000 → 1 700', 'Un audit SEO complet coûte 3000€', 'Un audit SEO complet coûte 1 700 €'],
  ['audit 3 000 (variante)', 'audit SEO complet coûte 3 000€', 'audit SEO complet coûte 1 700 €'],

  /* ── plancher mensuel : 500 €/mois ── */
  ['mensuel 1 000 → 500', 'Un accompagnement démarre à partir de 1 000€/mois', 'Un accompagnement démarre à partir de 500 €/mois'],
  ['mensuel 1 000 → 500 (agence-seo-paris)', 'Nos tarifs commencent à partir de <strong>1 000€/mois</strong>', 'Nos tarifs commencent à partir de <strong>500 €/mois</strong>'],
  ['mensuel 1 000 → 500 (schéma)', 'Nos tarifs commencent à partir de 1000€/mois', 'Nos tarifs commencent à partir de 500 €/mois'],

  /* ── délai GEO : 6 à 8 semaines ── */
  ['délai GEO 4-8 → 6-8', 'citations IA peuvent apparaître sous 4 à 8 semaines', 'citations IA peuvent apparaître sous 6 à 8 semaines'],
  ['délai GEO 4-8 → 6-8 (variante)', 'citations IA peuvent apparaître plus rapidement - sous 4 à 8 semaines', 'citations IA peuvent apparaître plus rapidement - sous 6 à 8 semaines'],
  /* ⚠︎ Ces règles ont d'abord été écrites « 4-8 semaines → 6-8 semaines », sans
     contexte : elles ont alors touché deux passages qui ne parlent PAS de GEO
     (le délai d'effet d'une fiche Google Business Profile, et celui d'une page
     orpheline réintégrée au maillage). Corrigé : on ne vise plus que les
     phrases où le délai porte sur les citations IA. */
  ['délai citations (apparition)', 'peuvent apparaître en 4-8 semaines', 'peuvent apparaître en 6-8 semaines'],
  ['délai citations (attendus)', 'Résultats attendus : 4-8 semaines pour les premières citations', 'Résultats attendus : 6-8 semaines pour les premières citations'],
  ['délai citations (visibles)', 'citations IA visibles en 4-8 semaines', 'citations IA visibles en 6-8 semaines'],
  ['délai citations (résultats visibles)', 'Les résultats sont visibles en 4-8 semaines pour les premières citations', 'Les résultats sont visibles en 6-8 semaines pour les premières citations'],
  ['délai citations (accueil)', '4-8 semaines avant les premières citations IA', '6-8 semaines avant les premières citations IA'],
  /* l'accueil et sa FAQ écrivent « entre 4 et 8 semaines » (et non « 4-8 ») ;
     le passage existe en double, dans le texte visible ET dans le FAQPage. */
  ['délai citations (accueil, FAQ)', 'citations mesurables apparaissent généralement entre 4 et 8 semaines', 'citations mesurables apparaissent généralement entre 6 et 8 semaines'],
  ['délai citations (accueil, saut de ligne)', 'citations mesurables apparaissent\n      généralement entre 4 et 8 semaines', 'citations mesurables apparaissent\n      généralement entre 6 et 8 semaines'],
  ['délai citations (leviers)', 'citations IA mesurables apparaissent entre 4 et 8 semaines', 'citations IA mesurables apparaissent entre 6 et 8 semaines'],
  ['délai citations (leviers, saut de ligne)', 'citations IA mesurables\n      apparaissent entre 4 et 8 semaines', 'citations IA mesurables\n      apparaissent entre 6 et 8 semaines'],
  ['délai citations (nantes)', 'citations IA en 4 à 8 semaines', 'citations IA en 6 à 8 semaines'],
  /* le néon « L'agence en chiffres » de l'accueil : le nombre est isolé dans un
     <b>, le reste de la phrase dans le <span> voisin. */
  ['délai citations (néon accueil)', '<b>4-8</b><span>semaines avant les premières citations IA', '<b>6-8</b><span>semaines avant les premières citations IA'],

  /* ── nombre de clients : plus de 50 ── */
  ['clients 50 → plus de 50', 'Perplexity pour 50 clients', 'Perplexity pour plus de 50 clients'],
  ['clients 100 → plus de 50', 'étude de 100 clients', 'étude de plus de 50 clients'],

  /* ── horaires : 08:00-19:00, y compris dans les schémas ── */
  ['horaires schéma 09:00 → 08:00', '"opens":"09:00"', '"opens":"08:00"'],
  ['horaires schéma 09:00 → 08:00 (espacé)', '"opens": "09:00"', '"opens": "08:00"'],
];

/** Toutes les pages du site. */
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
const compte = new Map(REGLES.map(r => [r[0], 0]));
let touchees = 0;

for (const f of liste) {
  const avant = await readFile(f, 'utf8');
  let apres = avant;
  for (const [nom, a, b] of REGLES) {
    if (!apres.includes(a)) continue;
    const n = apres.split(a).length - 1;
    apres = apres.split(a).join(b);
    compte.set(nom, compte.get(nom) + n);
  }
  if (apres !== avant) { await writeFile(f, apres); touchees++; }
}

console.log(`valeurs officielles alignées — ${touchees} page(s) modifiée(s)`);
const muettes = [];
for (const [nom, n] of compte) {
  if (n) console.log(`  ${n.toString().padStart(3)} × ${nom}`);
  else muettes.push(nom);
}
/* Une règle sans cible n'est pas forcément une erreur (le build est
   idempotent : au second passage tout est déjà aligné), mais il faut le voir. */
if (muettes.length) console.log(`  (${muettes.length} règle(s) sans cible — normal si déjà appliquées)`);
