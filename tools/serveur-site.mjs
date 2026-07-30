// Serveur statique de développement pour le nouveau site (dossier site/).
// Reproduit la résolution d'URL d'un hébergeur statique : /a/b -> /a/b/index.html,
// et sert 404 sur le reste. Les chemins sont résolus depuis ce fichier, jamais
// depuis le cwd (le lanceur ne garantit pas un cwd lisible).
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname, sep } from 'node:path';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const port = Number(process.env.PORT) || 8090;

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

/* Redirections permanentes — miroir de celles déclarées dans vercel.json,
   pour qu'elles soient testables en local exactement comme en production. */
const REDIRECTIONS = {
  '/expertise-gsa': '/expertise-sea',
  '/expertise-contenu': '/expertise-automatisation-contenu',
};

createServer(async (req, res) => {
  const url = (req.url || '/').split('?')[0].replace(/\/$/, '') || '/';
  const versUrl = REDIRECTIONS[url];
  if (versUrl) {
    console.log(`301 ${req.url} → ${versUrl}`);
    res.writeHead(301, { Location: versUrl });
    res.end();
    return;
  }
  const chemin = await resout(req.url || '/');
  if (!chemin) {
    console.log(`404 ${req.url}`);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1>');
    return;
  }
  console.log(`200 ${req.url}`);
  res.writeHead(200, {
    'Content-Type': TYPES[extname(chemin).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(chemin).pipe(res);
}).listen(port, () => {
  console.log(`Nouveau site (DA-31) servi sur http://localhost:${port}`);
});
