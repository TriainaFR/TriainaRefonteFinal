/**
 * sync-faq-schema.mjs — aligne le FAQPage JSON-LD d'une source sur son texte.
 *
 * Règle du site (garde-fou de la migration blog) : le texte d'un FAQPage est
 * EXACTEMENT le texte visible de la page — le schéma dit ce que la page
 * montre, rien d'autre. Or les codes fournis arrivent souvent avec des
 * réponses condensées dans le JSON-LD et des réponses longues dans le corps :
 * deux versions du même contenu, et c'est celle que personne ne relit qui
 * finit dans les données structurées.
 *
 * Ce script réécrit chaque `acceptedAnswer.text` du bloc FAQPage à partir des
 * réponses visibles, appariées par question. Il ÉCHOUE si une question du
 * schéma n'a pas de bloc visible, ou l'inverse : mieux vaut pas de
 * synchronisation qu'une synchronisation partielle et silencieuse.
 *
 * Attendu dans la source, après un <h2> commençant par « FAQ » :
 *   <div><h3>question</h3><div><p>…</p><p>…</p></div></div>  (× N)
 *
 * Usage : node tools/sync-faq-schema.mjs --source=agence-referencement-ia
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const nom = process.argv.find(a => a.startsWith('--source='))?.slice(9);
if (!nom) throw new Error('usage : --source=<page>');
const FICHIER = path.join(RACINE, `tools/sources/${nom}.html`);

const source = await readFile(FICHIER, 'utf8');

/* ── le texte visible : depuis le <h2>FAQ jusqu'à la fin de sa <section> ── */
const debut = source.search(/<h2>FAQ[\s\S]*?<\/h2>/);
if (debut < 0) throw new Error('aucun <h2>FAQ…</h2> dans la source');
const zone = source.slice(debut, source.indexOf('</section>', debut));

const plat = (h) => h.replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&#8239;/g, ' ')
  .replace(/\s+/g, ' ')
  /* une balise en bord de mot laisse un espace avant la ponctuation basse
     (« TTC , ») — on le retire ; les deux-points français gardent le leur */
  .replace(/ ([,.)])/g, '$1').replace(/\( /g, '(')
  .trim();

const visibles = new Map();
for (const m of zone.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<div>([\s\S]*?)<\/div>/g)) {
  visibles.set(plat(m[1]), plat(m[2]));
}
if (!visibles.size) throw new Error('aucune paire <h3>question</h3><div>réponse</div> trouvée');

/* ── le bloc FAQPage du <head> ── */
const bloc = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .find(m => m[1].includes('"FAQPage"'));
if (!bloc) throw new Error('aucun bloc FAQPage dans la source');
const donnees = JSON.parse(bloc[1]);

let alignees = 0;
for (const q of donnees.mainEntity ?? []) {
  const texte = visibles.get(plat(q.name));
  if (!texte) throw new Error(`question du schéma sans bloc visible : « ${q.name} »`);
  q.acceptedAnswer.text = texte;
  visibles.delete(plat(q.name));
  alignees++;
}
if (visibles.size)
  throw new Error(`question(s) visible(s) absente(s) du schéma : ${[...visibles.keys()].map(q => `« ${q} »`).join(', ')}`);

/* réécrit le bloc, indenté comme le reste de la tête */
const json = JSON.stringify(donnees, null, 2).replace(/^/gm, '  ').trim();
await writeFile(FICHIER, source.replace(bloc[1], `\n  ${json}\n  `));
console.log(`✓ ${nom} : ${alignees} réponse(s) du FAQPage alignée(s) sur le texte visible`);
