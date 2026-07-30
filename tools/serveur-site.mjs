/**
 * serveur-site.mjs — le serveur du site, en développement ET en production.
 *
 * Architecture visée : Cloudflare (DNS + proxy) → Railway (ce process) → site/.
 * Railway lance `npm start`, écoute sur `process.env.PORT`, et redéploie à
 * chaque push. C'est donc CE fichier qui porte, en production :
 *   · la résolution d'URL propre     : /faq → /faq/index.html, sans redirection
 *   · les redirections 301           : table REDIRECTIONS ci-dessous
 *   · la vraie page 404              : site/404.html, avec un vrai code 404
 *   · le cache et la compression     : voir plus bas
 *   · les en-têtes de sécurité
 *
 * Ce qui est DÉLIBÉRÉMENT laissé à Cloudflare :
 *   · TLS et HSTS ;
 *   · la redirection apex → www (Redirect Rule : elle n'atteint jamais Railway,
 *     donc une requête et un cold start économisés) ;
 *   · la compression à la périphérie — à condition que l'enregistrement DNS
 *     soit PROXIFIÉ (nuage orange). En nuage gris, Cloudflare ne fait rien du
 *     tout : c'est la compression ci-dessous qui prend le relais.
 *
 * Les chemins sont résolus depuis ce fichier, jamais depuis le cwd (ni Railway
 * ni le lanceur d'aperçu local ne garantissent un cwd exploitable).
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname, sep } from 'node:path';
import { createGzip, createBrotliCompress, constants as zlibConstantes } from 'node:zlib';
import { pipeline } from 'node:stream';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const PROD = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);
/* Railway injecte PORT et route les domaines personnalisés vers le port 8080 :
   c'est donc le repli en production, jamais 8090 (le port de développement).
   Se tromper de port ne produit pas une erreur visible — juste un service que
   Railway n'arrive pas à joindre, et un 502 sur tout le site. */
const port = Number(process.env.PORT) || (PROD ? 8080 : 8090);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/* Ne compresser que ce qui y gagne. Les images, les polices woff2 et les
   fichiers déjà compressés n'y gagnent rien et coûtent du CPU à chaque requête. */
const COMPRESSIBLE = /^(text\/|application\/(json|xml|javascript)|image\/svg)/;

/**
 * Cache-Control.
 *
 * Les assets ne portent PAS d'empreinte dans leur nom (`da31.css`, pas
 * `da31.a1b2c3.css`) : un cache long impose donc de purger Cloudflare après
 * chaque déploiement qui touche au CSS, au JS ou aux polices. C'est le prix à
 * payer pour ne pas revalider 262 ko à chaque navigation — le premier poste de
 * gain mesuré à l'audit du 30/07/2026.
 *
 * Le HTML, lui, reste frais : c'est lui qui porte les balises SEO, un HTML
 * périmé en cache est un signal périmé servi à Google.
 */
function cacheControl(chemin) {
  if (!PROD) return 'no-store';                       // en local, on veut toujours le dernier build
  const ext = extname(chemin).toLowerCase();
  if (ext === '.html') return 'public, max-age=0, must-revalidate';
  if (['.xml', '.txt'].includes(ext)) return 'public, max-age=3600';   // sitemap, robots, llms
  return 'public, max-age=2592000';                   // 30 jours : assets, images, polices
}

const SECURITE = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  /* HSTS est posé par Cloudflare ; on le redonne ici pour le cas où le trafic
     arriverait en direct sur Railway (nuage gris, ou test sur l'URL *.up.railway.app). */
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

async function fichier(chemin) {
  try {
    const infos = await stat(chemin);
    return infos.isFile() ? chemin : null;
  } catch {
    return null;
  }
}

async function resout(urlPath) {
  const decode = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const relatif = normalize(decode).replace(/^(\.\.[/\\])+/, '');
  const cible = join(racine, relatif);
  if (cible !== racine && !cible.startsWith(racine + sep)) return null; // hors racine
  return (
    (await fichier(cible)) ||
    (await fichier(join(cible, 'index.html'))) ||
    (await fichier(cible + '.html'))
  );
}

/* Redirections permanentes (301). Cette table est la SOURCE DE VÉRITÉ du
   projet : `vercel.json` a été supprimé le 30/07/2026 (Vercel n'est pas
   l'hébergeur). Comme c'est ce serveur qui tourne en production sur Railway,
   il n'y a plus rien à reporter ailleurs — sauf l'apex → www, laissé à
   Cloudflare. Les équivalents nginx/Apache/Netlify/Caddy restent documentés
   dans REDIRECTIONS.md au cas où l'hébergement changerait.

   Chaque entrée protège une URL qui EXISTE aujourd'hui en production : sans
   elle, le basculement la transforme en 404 et l'indexation acquise est perdue. */
const REDIRECTIONS = {
  /* slugs remplacés lors de la refonte */
  '/expertise-gsa': '/expertise-sea',
  '/expertise-contenu': '/expertise-automatisation-contenu',
  /* 301 déjà vivantes sur l'ancien site, à ne pas perdre */
  '/blog/optimiser-site-llm-2026-guide-complet': '/blog/optimiser-site-llm-guide-seo-complet-2026',
  '/blog/e-e-a-t-seo-guide': '/blog/eeat-seo-guide-complet',
  /* /recrutement n'est plus redirigée : la page a été recréée le 30/07/2026
     depuis le rendu réel de la production (voir tools/expertises/recrutement.mjs). */
};

/** Compresse si le client le demande ET si le type de contenu y gagne. */
function envoie(req, res, chemin, code) {
  const type = TYPES[extname(chemin).toLowerCase()] || 'application/octet-stream';
  const entetes = {
    'Content-Type': type,
    'Cache-Control': cacheControl(chemin),
    ...(PROD ? SECURITE : {}),
  };
  const accepte = String(req.headers['accept-encoding'] || '');
  const flux = createReadStream(chemin);

  if (COMPRESSIBLE.test(type)) {
    /* Vary est obligatoire dès qu'on négocie l'encodage : sans lui, un cache
       intermédiaire peut servir une réponse brotli à un client qui n'en veut pas. */
    entetes.Vary = 'Accept-Encoding';
    if (/\bbr\b/.test(accepte)) {
      entetes['Content-Encoding'] = 'br';
      res.writeHead(code, entetes);
      /* qualité 5 : le bon compromis à la volée — au-delà, le CPU coûte plus
         que les octets gagnés, et Cloudflare recompresse de toute façon en amont. */
      return pipeline(flux, createBrotliCompress({
        params: { [zlibConstantes.BROTLI_PARAM_QUALITY]: 5 },
      }), res, () => {});
    }
    if (/\bgzip\b/.test(accepte)) {
      entetes['Content-Encoding'] = 'gzip';
      res.writeHead(code, entetes);
      return pipeline(flux, createGzip({ level: 6 }), res, () => {});
    }
  }
  res.writeHead(code, entetes);
  return pipeline(flux, res, () => {});
}

createServer(async (req, res) => {
  const url = (req.url || '/').split('?')[0].replace(/\/$/, '') || '/';

  /* Apex → www, en filet de sécurité.
     Aujourd'hui la redirection est portée par un SECOND service Railway,
     auquel l'enregistrement DNS `triaina.fr` pointe (l'apex n'atteint donc
     jamais ce serveur-ci). Le jour où les deux services seraient fusionnés,
     cette règle évite que tout le site se retrouve accessible sur deux hôtes
     — ce qui est exactement ce que les canonicals en www cherchent à éviter. */
  const hote = String(req.headers.host || '').toLowerCase().split(':')[0];
  if (hote === 'triaina.fr') {
    res.writeHead(301, {
      Location: `https://www.triaina.fr${req.url || '/'}`,
      'Cache-Control': 'public, max-age=3600',
    });
    res.end();
    return;
  }

  const versUrl = REDIRECTIONS[url];
  if (versUrl) {
    if (!PROD) console.log(`301 ${req.url} → ${versUrl}`);
    res.writeHead(301, { Location: versUrl, 'Cache-Control': 'public, max-age=3600' });
    res.end();
    return;
  }

  const chemin = await resout(req.url || '/');
  if (!chemin) {
    if (!PROD) console.log(`404 ${req.url}`);
    const page = join(racine, '404.html');
    /* Un vrai code 404, jamais un 200 : une « soft 404 » servie en 200 finit
       indexée, et c'est exactement ce que faisait l'ancienne SPA. */
    if (existsSync(page)) return envoie(req, res, page, 404);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1>');
    return;
  }

  if (!PROD) console.log(`200 ${req.url}`);
  envoie(req, res, chemin, 200);
/* écoute explicite sur 0.0.0.0 : dans un conteneur, se lier à la seule
   boucle locale rend le service injoignable depuis l'extérieur. */
}).listen(port, '0.0.0.0', () => {
  console.log(PROD
    ? `Site Triaina servi en production sur le port ${port}`
    : `Nouveau site (DA-31) servi sur http://localhost:${port}`);
});
