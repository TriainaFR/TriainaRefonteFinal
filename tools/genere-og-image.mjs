/**
 * genere-og-image.mjs — fabrique `site/og-image.jpg`, l'aperçu affiché quand on
 * partage le site (LinkedIn, WhatsApp, Slack, Facebook, X).
 *
 * Pourquoi une refonte le 30/07/2026 : la première version portait le
 * logotype, le titre et le halo, mais PAS le trident en particules — celui-là
 * même qui fait l'identité de l'accueil. Partagé, le site ne ressemblait pas
 * au site. On le reconstitue donc ici, en points, comme le moteur de la page.
 *
 * Méthode : un gabarit HTML servi en local, capturé par Chrome headless, puis
 * converti en JPEG. Le trident est dessiné en <canvas> par le même principe
 * que l'accueil (semis de points dans les trois barres, densité plus forte au
 * centre), sans dépendre du moteur d'animation.
 *
 * Prérequis : le serveur local doit tourner (node tools/serveur-site.mjs).
 * Usage : node tools/genere-og-image.mjs
 */
import { execFile } from 'node:child_process';
import { writeFile, unlink, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const execFileP = promisify(execFile);
const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const L = 1200, H = 630;                 // format attendu par les réseaux

const gabarit = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/fonts.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${L}px;height:${H}px;overflow:hidden}
  body{background:#0B1428;position:relative;font-family:'Manrope',sans-serif;color:#EAF2FF}
  .halo{position:absolute;inset:-20%;
    background:radial-gradient(52% 58% at 74% 46%, rgba(37,99,235,.40), transparent 66%),
               radial-gradient(38% 44% at 16% 88%, rgba(37,99,235,.12), transparent 70%)}
  #tri{position:absolute;inset:0}
  .cadre{position:absolute;inset:0;padding:56px 64px;display:flex;flex-direction:column;
    justify-content:space-between}
  .marque{display:flex;align-items:center;gap:14px}
  .marque svg{width:30px;height:30px;flex:0 0 auto}
  .marque b{font-family:'Syne',sans-serif;font-weight:800;font-size:27px;
    letter-spacing:.19em;color:#fff;line-height:1}
  .marque i{display:block;font-family:ui-monospace,monospace;font-style:normal;
    font-size:11px;letter-spacing:.26em;color:#93C5FD;margin-top:6px}
  /* 78px / 770px : la plus grande taille qui garde « SORTEZ DE » sur une seule
     ligne — comme sur l'accueil — sans que le titre passe sous le trident,
     dont la barre gauche commence à 786 px. */
  h1{font-family:'Syne',sans-serif;font-weight:800;text-transform:uppercase;
    font-size:78px;line-height:.95;letter-spacing:-.02em;color:#fff;max-width:770px}
  h1 em{font-style:normal;color:#60A5FA}
  .pied{display:flex;align-items:center;gap:18px;font-family:ui-monospace,monospace;
    font-size:14px;letter-spacing:.22em;text-transform:uppercase;color:rgba(234,242,255,.72)}
  .pied s{display:block;width:52px;height:2px;background:#FFE9B8;text-decoration:none}
</style></head><body>
<div class="halo"></div>
<canvas id="tri" width="${L}" height="${H}"></canvas>
<div class="cadre">
  <div class="marque">
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="18" y="5" width="4" height="25" rx="1" fill="#2563EB"/>
      <rect x="10" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
      <rect x="27" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
    </svg>
    <span><b>TRIAINA</b><i>SEO — GEO — MÉDIA</i></span>
  </div>
  <h1>Sortez de <em>l'ombre.</em></h1>
  <p class="pied"><s></s> Agence SEO &amp; GEO · Paris</p>
</div>
<script>
/* Le trident en points, à droite — même lecture que l'accueil : trois barres,
   la centrale plus haute et plus dense. On sème dans le rectangle de chaque
   barre, avec un bruit léger pour que le bord respire au lieu d'être net. */
(function(){
  var c = document.getElementById('tri'), x = c.getContext('2d');
  var cx = ${Math.round(L * 0.78)}, cy = ${Math.round(H * 0.52)};
  var barres = [
    { dx:-118, h:196, w:34, d:.55 },   // gauche
    { dx:   0, h:330, w:40, d:1   },   // centrale
    { dx: 118, h:196, w:34, d:.55 },   // droite
  ];
  barres.forEach(function(b){
    var n = Math.round(b.h * b.w * 0.10 * b.d);
    for (var i = 0; i < n; i++) {
      var px = cx + b.dx + (Math.random() - .5) * b.w;
      var py = cy + (Math.random() - .5) * b.h;
      /* densité plus forte au centre de la barre : bords plumés */
      var bord = 1 - Math.abs((px - (cx + b.dx)) / (b.w / 2));
      if (Math.random() > bord * .85 + .15) continue;
      var r = Math.random() < .12 ? 1.7 : .95;
      var a = (.30 + Math.random() * .55) * b.d;
      x.beginPath(); x.arc(px, py, r, 0, 6.283);
      x.fillStyle = 'rgba(226,238,255,' + a.toFixed(2) + ')'; x.fill();
    }
  });
  /* poussière ambiante, très discrète, comme le fond de l'accueil */
  for (var j = 0; j < 260; j++) {
    x.beginPath();
    x.arc(Math.random() * ${L}, Math.random() * ${H}, Math.random() < .2 ? 1.2 : .7, 0, 6.283);
    x.fillStyle = 'rgba(226,238,255,' + (.05 + Math.random() * .13).toFixed(2) + ')';
    x.fill();
  }
})();
</script>
</body></html>`;

const nomTmp = `_og-${Date.now().toString(36)}.html`;
const cheminTmp = path.join(RACINE, 'site', nomTmp);
const png = path.join(RACINE, 'site', nomTmp.replace('.html', '.png'));
const sortie = path.join(RACINE, 'site/og-image.jpg');

await writeFile(cheminTmp, gabarit);
try {
  await execFileP(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=${L},${H}`, '--virtual-time-budget=5000',
    '--default-background-color=0B1428FF',
    `--screenshot=${png}`, `http://localhost:8090/${nomTmp}`,
  ], { timeout: 60000 });
  await execFileP('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '86', png, '--out', sortie]);
  const octets = (await readFile(sortie)).length;
  console.log(`✓ site/og-image.jpg — ${L}×${H}, ${Math.round(octets / 1024)} ko`);
} finally {
  await unlink(cheminTmp).catch(() => {});
  await unlink(png).catch(() => {});
}
