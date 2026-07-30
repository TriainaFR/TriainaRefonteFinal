/**
 * indexnow.mjs — signale à Bing (et aux moteurs partenaires d'IndexNow) que
 * les pages du site ont changé, sans attendre qu'ils repassent d'eux-mêmes.
 *
 * Pourquoi c'est un outil à part et PAS une étape de build : le build tourne
 * en local à chaque retouche, souvent plusieurs fois d'affilée. Prévenir les
 * moteurs à chaque fois n'aurait aucun sens — la notification vaut pour ce qui
 * est EN LIGNE. On lance donc ce script après un déploiement, jamais avant.
 *
 * IndexNow alimente l'index Bing, qui est lui-même la source des citations de
 * Microsoft Copilot : c'est un levier GEO, pas seulement SEO.
 *
 * La clé vit dans `site/<clé>.txt` et doit être servie en clair par le domaine :
 * c'est ainsi que le moteur vérifie que l'émetteur possède bien le site. Le
 * script refuse d'envoyer quoi que ce soit si ce fichier ne répond pas — une
 * soumission sans clé vérifiable est rejetée en bloc, silencieusement.
 *
 * Usage : node tools/indexnow.mjs [--essai] [--url=https://…] [--url=…]
 *   --essai : montre ce qui serait envoyé, n'envoie rien
 *   --url   : n'envoie que ces URLs (par défaut : tout le sitemap)
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SITE = path.join(RACINE, 'site');
const HOTE = 'www.triaina.fr';
const POINT_DE_COLLECTE = 'https://api.indexnow.org/indexnow';

/**
 * Clé IndexNow du site — émise au hasard le 30/07/2026, servie par
 * `site/<clé>.txt`.
 *
 * ⚠︎ Elle est VOLONTAIREMENT différente de `4C58C9622B2DBB31ECD9A463E3DCAF66`,
 * que l'ancien site servait aussi en .txt : cette valeur-là est le jeton de
 * vérification Bing Webmaster (`msvalidate.01`), recyclé en clé IndexNow. Bing
 * la rattache à un compte et refuse la soumission — 403
 * « UserForbiddedToAccessSite » — alors même que le fichier répond 200 en
 * text/plain. Une clé IndexNow s'auto-délivre : n'importe quelle chaîne hexa
 * fait l'affaire tant que le domaine la sert. On garde l'ancien fichier en
 * place (il ne gêne pas), mais la clé utilisée ici est explicite, pas devinée
 * en listant le dossier.
 */
const CLE = 'f077fac3a598ab5dc3e0ae0f7da7ab7e';

const essai = process.argv.includes('--essai');
const urlsDemandees = process.argv.filter(a => a.startsWith('--url=')).map(a => a.slice(6));

/** Le fichier de clé doit exister et contenir EXACTEMENT la clé. */
async function verifieFichierLocal() {
  const fichier = path.join(SITE, `${CLE}.txt`);
  const contenu = (await readFile(fichier, 'utf8').catch(() => null))?.trim();
  if (contenu === undefined) throw new Error(`site/${CLE}.txt est absent`);
  if (contenu !== CLE) {
    throw new Error(`site/${CLE}.txt doit contenir exactement « ${CLE} », il contient « ${contenu} »`);
  }
}

/** URLs du sitemap : c'est la liste que l'on déclare déjà aux moteurs. */
async function urlsDuSitemap() {
  const xml = await readFile(path.join(SITE, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

await verifieFichierLocal();
const cle = CLE;
const emplacementCle = `https://${HOTE}/${cle}.txt`;
const urls = urlsDemandees.length ? urlsDemandees : await urlsDuSitemap();

const horsDomaine = urls.filter(u => new URL(u).host !== HOTE);
if (horsDomaine.length) {
  console.error(`✗ ${horsDomaine.length} URL(s) hors de ${HOTE} — refusé en bloc par le moteur :`);
  horsDomaine.slice(0, 5).forEach(u => console.error(`   ${u}`));
  process.exit(1);
}

console.log(`${urls.length} URL(s) à signaler · clé ${cle}`);

/* Vérification préalable : la clé doit être servie par le domaine LUI-MÊME.
   Sans elle, le moteur rejette la soumission entière sans le dire clairement. */
const reponseCle = await fetch(emplacementCle, { headers: { 'User-Agent': 'TriainaBuild/1.0' } });
const contenuServi = (await reponseCle.text()).trim();
if (!reponseCle.ok || contenuServi !== cle) {
  console.error(`✗ ${emplacementCle} répond ${reponseCle.status} et sert « ${contenuServi.slice(0, 40)} »`);
  console.error('  La clé doit être en ligne AVANT la soumission — déployez d\'abord.');
  process.exit(1);
}
console.log(`✓ clé vérifiée en ligne : ${emplacementCle}`);

if (essai) {
  console.log('\n(essai — rien n\'est envoyé)');
  urls.slice(0, 5).forEach(u => console.log(`   ${u}`));
  if (urls.length > 5) console.log(`   … et ${urls.length - 5} autres`);
  process.exit(0);
}

const reponse = await fetch(POINT_DE_COLLECTE, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOTE, key: cle, keyLocation: emplacementCle, urlList: urls }),
});

/* Le protocole répond par un code, jamais par un message lisible : on traduit. */
const SENS = {
  200: 'accepté — les URLs sont dans la file du moteur',
  202: 'accepté, vérification de la clé en attente (normal la première fois)',
  400: 'requête mal formée',
  403: 'clé refusée (fichier absent ou contenu différent)',
  422: 'URLs incohérentes avec le domaine déclaré',
  429: 'trop de soumissions — réessayer plus tard',
};
const corps = (await reponse.text()).trim();
console.log(`\n${reponse.status} — ${SENS[reponse.status] ?? 'réponse inattendue'}`);
if (corps) console.log(`réponse : ${corps.slice(0, 300)}`);
process.exit(reponse.status === 200 || reponse.status === 202 ? 0 : 1);
