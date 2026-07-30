/**
 * genere-references.mjs — produit la page /references du site DA-31.
 *
 * Fidélité : balises de tête, schémas (graphe Organization du site +
 * BreadcrumbList), H1, hiérarchie Hn (h1→h3→h4, sans h2) et TOUS les textes
 * sont repris de la page actuelle, capturée par rendu Chrome réel
 * (tools/snapshots/ancien-references/references.json). Les 13 dossiers sont
 * embarqués mot pour mot dans l'ordre du rendu, avec les MÊMES coupes que
 * l'ancienne carte (2 tags max, 2 résultats max — slices du composant React).
 * Rien n'est réécrit.
 *
 * Design : « La Constellation » — treize clients = treize étoiles d'un même
 * ciel. Chaque dossier s'allume à son entrée dans le viewport (étoile or à
 * l'allumage → bleue quand la charge tient, logo qui sort de l'ombre via
 * --lit), un filament d'1px se trace d'une étoile à la suivante. Aucun pin,
 * aucune bibliothèque : IntersectionObserver + transitions CSS, comme /faq.
 * Sans JS ou en motion réduit : tout est allumé et lisible.
 *
 * Usage : node tools/genere-references.mjs
 *         (puis node tools/ajoute-entites-geo.mjs — entités GEO du schéma —
 *          et node tools/genere-robots-sitemap.mjs — sitemap)
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ech, barreNav, pieds } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CAPTURE = path.join(RACINE, 'tools/snapshots/ancien-references/references.json');

/* ══ Les 13 dossiers — VERBATIM du rendu réel (tags et résultats déjà coupés
      comme dans l'ancienne carte : slice(0,2)). L'ordre est l'ordre du DOM
      de l'ancienne page. img/cl = habillage nuit (aucun signal SEO). ══ */
const DOSSIERS = [
  { client: 'Younight Hospitality', mission: 'Audit GEO & SEO',
    tags: ['GEO', 'SEO'], resultats: ['Audit GEO & SEO'],
    img: '/assets/logos/younight.png', cl: 'lg-invscr', mag: 3 },
  { client: 'Bomporto Hotels', mission: 'Stratégie SEO & GEO',
    tags: ['GEO', 'SEO'], resultats: ['Audit GEO + SEO', 'Accompagnement mensuel en cours.'],
    img: '/assets/logos/bomporto.jpg', cl: 'lg-photo', mag: 2 },
  { client: 'Bernard Magrez', mission: 'Chantier GEO/GSO',
    tags: ['GSO', 'En cours'], resultats: ['Chantier GSO en cours.'],
    img: '/assets/logos/magrez.webp', cl: 'lg-or', mag: 3 },
  { client: 'Tamtam AI', mission: 'Stratégie SEO & GEO',
    tags: ['SaaS', 'IA'], resultats: ['Élaboration d\'une stratégie GSO sur-mesure.', 'Augmentation de la part de voix (Share of Voice).'],
    img: '/assets/logos/tamtam.png', cl: 'lg-card', mag: 2 },
  { client: 'YourSunlife', mission: 'Stratégie SEO & GEO',
    tags: ['SEO', 'GEO'], resultats: ['Accompagnement SEO et GEO en cours.'],
    img: '/assets/logos/sunlife.png', cl: 'lg-invscr', mag: 3 },
  { client: 'Les Hardis', mission: 'Stratégie SEO & GEO',
    tags: ['Lifestyle', 'Audit SEO'], resultats: ['Audit Technique & Sémantique Complet', 'Correction de la dette technique'],
    img: '/assets/logos/les-hardis.png', cl: 'lg-inv', mag: 1 },
  { client: 'Talis Education Group', mission: 'Stratégie GEO/GSO',
    tags: ['GEO/GSO', 'En cours'], resultats: ['Chantier GEO/GSO en cours'],
    img: '/assets/logos/talis.png', cl: 'lg-inv', mag: 3 },
  { client: 'Lazuli Travel Bureau', mission: 'Gestion Campagne SEA',
    tags: ['SEA', 'Travel'], resultats: ['Optimisation des coûts d\'acquisition', 'Augmentation des conversions ciblées'],
    img: '/assets/logos/lazuli-travel-bureau.jpg', cl: 'lg-photo2', mag: 2 },
  { client: 'Skilink', mission: 'Gestion GEO',
    tags: ['SaaS B2B', 'Tech'], resultats: ['Captation de trafic décisionnel B2B', 'Accélération du volume de démos qualifiées'],
    img: '/assets/logos/skilink-dark.svg', cl: 'lg-svg', mag: 2 },
  { client: 'Yonder', mission: 'Stratégie SEO & GEO',
    tags: ['Média', 'GSO Leadership'], resultats: ['Leader thématique sur les moteurs IA', 'Hausse significative du trafic SEO qualifié'],
    img: '/images/Logo Yonder.jpg', cl: 'lg-inv', mag: 1 },
  { client: 'Lazuli Nil', mission: 'Gestion Campagne SEA',
    tags: ['SEA', 'Luxe'], resultats: ['Hausse du ROAS', 'Ciblage d\'audience qualifiée'],
    img: '/assets/logos/lazuli.png', cl: 'lg-or', mag: 2 },
  { client: 'Best Restaurants Paris', mission: 'Stratégie SEO & GEO',
    tags: ['Gastronomie', 'SEO Local'], resultats: ['Positionnement Top 3 Google', 'Intégration dans les recommandations IA'],
    img: '/images/Best Restaurant Paris Logo.png', cl: 'lg-inv', mag: 1 },
  { client: 'Groupe Hôtelier', mission: 'Architecture SEO Internationale',
    tags: ['Hotels', 'Technical SEO'], resultats: ['0% à 70% de citation IA en 3 mois', 'Top 3 Google et cité parmi 8 sites sur la 1ère page via nos médias partenaires'],
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    cl: 'lg-photo', photo: true, mag: 1 },
];

/* placement de la carte du ciel (12 colonnes) — ordre DOM = ordre gelé */
const PLACES = ['1/5', '7/12', '2/6', '8/13', '5/9', '1/8', '9/13', '2/7', '8/13', '1/7', '8/13', '4/11', '1/9'];

const STYLE = `
  /* ══════════════════════════════════════════════════════════════════════
     « La Constellation » — /references. UNE grande idée : treize clients =
     treize étoiles d'un même ciel. Chaque dossier S'ALLUME à son entrée
     (étoile or → bleue quand la charge tient, logo qui sort de l'ombre via
     --lit), un filament d'1px se trace d'une étoile à la suivante.
     Sans JS / motion réduit : tout est allumé, filament tracé. ══ */
  .page{overflow-x:clip}
  .ref-wrap{position:relative; z-index:2; max-width:72rem; margin:0 auto;
    padding:0 var(--marge)}

  /* ── l'entrée de la salle ── */
  .ref-tete{padding:8.5rem 0 0; display:flex; align-items:flex-end;
    justify-content:space-between; gap:2rem; flex-wrap:wrap;
    border-bottom:1px solid rgba(148,163,184,.25); padding-bottom:2rem}
  .ref-tete .k{font-family:ui-monospace,monospace; font-size:.66rem;
    letter-spacing:.16em; text-transform:uppercase; color:var(--bleu-p);
    margin-top:.9rem}
  .ref-tete h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(2.6rem,6vw,4.6rem); line-height:.96;
    text-transform:uppercase}
  .ref-tete h1 span{color:var(--bleu-c); text-shadow:0 0 24px rgba(96,165,250,.35)}
  .ref-meta{font-family:ui-monospace,monospace; font-size:.66rem;
    letter-spacing:.12em; color:var(--brume); text-align:right; line-height:1.8;
    border:1px solid rgba(148,163,184,.18); border-radius:10px;
    padding:.7rem 1rem; white-space:nowrap}
  @media(max-width:700px){.ref-meta{display:none}}

  /* ── la légende de la carte (note de confidentialité) ── */
  .ref-note{max-width:46rem; margin:2.2rem 0 0; background:rgba(16,26,51,.7);
    border-left:3px solid var(--lueur); border-radius:0 14px 14px 0;
    padding:1.1rem 1.4rem; font-size:.9rem; color:var(--brume); line-height:1.7}
  .ref-note b{font-family:ui-monospace,monospace; font-weight:700;
    font-size:.68rem; letter-spacing:.14em; text-transform:uppercase;
    color:var(--lueur); margin-right:.35rem}

  /* ── le ciel ── */
  .ciel{position:relative; display:grid; grid-template-columns:repeat(12,1fr);
    column-gap:clamp(1.2rem,2.5vw,2rem); row-gap:clamp(2.8rem,5vw,4.5rem);
    padding:4.5rem 0 7rem}
  .filament{position:absolute; inset:0; z-index:0; pointer-events:none;
    overflow:visible}
  .filament line{stroke:rgba(96,165,250,.38); stroke-width:1;
    transition:stroke-dashoffset .45s ease-in-out}

  .dossier{position:relative; z-index:1}
  ${PLACES.map((p, i) => `.dossier:nth-child(${i + 2}){grid-column:${p}}`).join('\n  ')}
  /* éparpillement céleste, plafonné (ordre de lecture = ordre DOM) */
  .dossier:nth-child(4n+2){transform:translateY(-1.2rem)}
  .dossier:nth-child(4n+4){transform:translateY(1.5rem)}

  /* l'étoile : brume au repos (sans JS : bleue, tenue) */
  .etoile{position:absolute; top:-8px; left:-8px; width:16px; height:16px;
    z-index:2; pointer-events:none}
  .etoile::before{content:''; position:absolute; inset:5px; border-radius:50%;
    background:rgba(148,163,184,.5);
    transition:background .35s, box-shadow .45s}
  .etoile::after{content:''; position:absolute; left:50%; top:50%;
    width:40px; height:40px; transform:translate(-50%,-50%) scale(.4);
    border-radius:50%; opacity:0;
    background:radial-gradient(closest-side, rgba(255,233,184,.4), transparent 70%);
    transition:transform .45s cubic-bezier(.22,.9,.24,1), opacity .45s}
  /* état par défaut (sans JS) et .tenu : l'étoile bleue, la charge tient */
  .etoile::before{background:var(--bleu-c);
    box-shadow:0 0 10px -1px rgba(96,165,250,.7)}
  html.ref-anim .dossier:not(.vu) .etoile::before{background:rgba(148,163,184,.5); box-shadow:none}
  .dossier.allume .etoile::before{background:var(--lueur);
    box-shadow:0 0 14px -2px rgba(255,233,184,.8)}
  .dossier.allume .etoile::after{opacity:1; transform:translate(-50%,-50%) scale(1)}
  .dossier.tenu .etoile::before{background:var(--bleu-c);
    box-shadow:0 0 10px -1px rgba(96,165,250,.7)}
  .dossier.tenu .etoile::after{opacity:.35;
    background:radial-gradient(closest-side, rgba(96,165,250,.35), transparent 70%)}
  /* la lampe : hover desktop / bande centrale au tactile (.lu) */
  .dossier:hover .etoile::after, .dossier.lu .etoile::after{
    transform:translate(-50%,-50%) scale(1.25)}

  /* la plaque : le logo sort de l'ombre (--lit .55 → 1) */
  .dossier{--lit:1}
  html.ref-anim .dossier:not(.vu){--lit:.55}
  /* fond OPAQUE : pendant le fondu d'entrée, l'article isolé prive le
     blending screen de la page en arrière-plan — un fond plein rend la
     boîte noire des logos inversés invisible dans tous les cas (même
     leçon que les plaques de La Revue sur la home) */
  .plaque{--pad:2rem; position:relative; margin:0;
    border:1px solid rgba(148,163,184,.16); border-radius:18px;
    background:#0F1830; overflow:hidden;
    aspect-ratio:4/3; transition:border-color .5s}
  .m1 .plaque{aspect-ratio:16/9}
  .dossier.allume .plaque, .dossier.tenu .plaque{border-color:rgba(96,165,250,.35)}
  .dossier:hover .plaque{border-color:rgba(255,233,184,.35)}
  /* le reflet une-passe (greffe « laiton qui accroche la lampe ») */
  .plaque::after{content:''; position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(105deg, transparent 42%, rgba(255,233,184,.14) 50%, transparent 58%);
    transform:translateX(-120%)}
  .dossier:hover .plaque::after{animation:reflet .6s ease-out 1}
  @keyframes reflet{to{transform:translateX(120%)}}
  /* calage ABSOLU : la boîte de l'image = l'intérieur du cadre, et
     object-fit:contain centre le visuel sur les DEUX axes quelle que soit
     sa taille native (les max-height en %, eux, se résolvent mal) */
  .plaque img{position:absolute; left:var(--pad); top:var(--pad);
    width:calc(100% - var(--pad)*2); height:calc(100% - var(--pad)*2);
    object-fit:contain; transition:filter .6s}
  .m1 .plaque{--pad:2.4rem}
  .plaque.photo{--pad:0rem}
  .plaque.photo img{object-fit:cover}
  .plaque.photo::before{content:''; position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg, transparent 55%, rgba(11,20,40,.75));
    pointer-events:none}
  /* traitements par logo — mêmes recettes que la home, pilotées par --lit */
  .lg-inv{filter:invert(1) grayscale(1) brightness(var(--lit)); mix-blend-mode:screen}
  .lg-invscr{filter:invert(1) brightness(var(--lit)); mix-blend-mode:screen}
  .lg-or{filter:brightness(calc(var(--lit)*1.25))}
  .lg-svg{filter:brightness(var(--lit))}
  .lg-card{filter:brightness(var(--lit)); border-radius:6px}
  .lg-photo{filter:brightness(calc(var(--lit)*.85)) saturate(.75) contrast(1.08)}
  .lg-photo2{filter:brightness(calc(var(--lit)*.9)) saturate(.85)}

  /* la fiche */
  .fiche{margin-top:1.1rem}
  .fiche .tags{display:flex; gap:.5rem; flex-wrap:wrap; margin:0 0 .7rem}
  .fiche .tags span{font-family:ui-monospace,monospace; font-size:.62rem;
    letter-spacing:.15em; text-transform:uppercase; color:var(--bleu-p);
    border:1px solid rgba(37,99,235,.35); border-radius:99px; padding:.25rem .7rem}
  .fiche h3{font-family:var(--syne); font-weight:700; color:#fff; line-height:1.15}
  .m1 .fiche h3{font-size:clamp(1.5rem,2.4vw,1.9rem)}
  .m2 .fiche h3{font-size:1.25rem}
  .m3 .fiche h3{font-size:1.05rem}
  .fiche .mission{margin-top:.3rem; font-weight:300; font-size:.95rem; color:var(--brume)}
  .fiche h4{font-family:ui-monospace,monospace; font-weight:400; font-size:.62rem;
    letter-spacing:.2em; text-transform:uppercase; color:var(--lueur);
    border-top:1px solid rgba(148,163,184,.14); padding-top:.9rem; margin-top:1rem}
  .impact{list-style:none; margin:.7rem 0 0; padding:0; display:grid; gap:.55rem}
  .impact li{position:relative; padding-left:1.15rem; font-size:.85rem;
    color:#CBD5E1; line-height:1.55}
  .impact li::before{content:''; position:absolute; left:0; top:.42em;
    width:7px; height:7px; border-radius:50%;
    background:rgba(255,233,184,.15); transition:background .5s, box-shadow .5s}
  .dossier.allume .impact li::before, .dossier.tenu .impact li::before{
    background:var(--lueur); box-shadow:0 0 8px rgba(255,233,184,.5)}
  .dossier.tenu .impact li::before{background:var(--bleu-c);
    box-shadow:0 0 8px rgba(96,165,250,.5)}
  .impact li:nth-child(2)::before{transition-delay:.06s}

  /* arrivée (additive — posée par JS avant le premier paint) */
  html.ref-anim :is(.ref-tete,.ref-note){transition:opacity .6s,
    transform .6s cubic-bezier(.22,.9,.24,1)}
  html.ref-anim :is(.ref-tete,.ref-note):not(.vu){opacity:0; transform:translateY(14px)}
  html.ref-anim .dossier{transition:opacity .55s, transform .55s cubic-bezier(.22,.9,.24,1),
    filter .6s}
  html.ref-anim .dossier:not(.vu){opacity:0;
    transform:translateY(calc(18px + var(--dy,0px)))}
  html.ref-anim .dossier.vu{transform:translateY(var(--dy,0px))}
  html.ref-anim .dossier:nth-child(4n+2){--dy:-1.2rem; transform:translateY(-1.2rem)}
  html.ref-anim .dossier:nth-child(4n+4){--dy:1.5rem; transform:translateY(1.5rem)}

  /* ── mobile & tablette : la carte du ciel devient une FRISE ──
     Colonne unique, et le filament quitte le contenu pour un rail dédié
     dans la gouttière gauche (le motif frise validé sur /agence) :
     étoiles alignées sur le rail, segments verticaux, jamais sur les
     cartes. Le desktop (>1100px) garde la constellation éparpillée. */
  @media(max-width:1100px){
    .dossier{grid-column:1/-1!important; transform:none!important; --dy:0px}
    html.ref-anim .dossier:not(.vu){transform:translateY(18px)!important}
    html.ref-anim .dossier.vu{transform:none!important}
    .ciel{row-gap:3rem; padding-top:3rem; padding-left:2.1rem}
    .plaque, .m1 .plaque{--pad:1.4rem; aspect-ratio:16/9; max-height:20rem}
    .plaque.photo{--pad:0rem}
    .etoile{left:-2.1rem; top:2px; width:16px; height:16px}
  }
  @media (prefers-reduced-motion: reduce){
    .plaque::after{animation:none!important}
    .filament line{transition:none}
    .etoile::after{transition:none}
  }
`;

async function main() {
  const cap = JSON.parse(await readFile(CAPTURE, 'utf8'));
  if (!cap.title || !cap.description) throw new Error('capture incomplète');

  /* ══ Parité : chaque texte embarqué doit exister mot pour mot dans le
        texte capturé de la page actuelle. ══ */
  const brut = cap.texteIntegral
    .replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  const verifie = (txt, quoi) => {
    if (!brut.includes(txt.replace(/\s+/g, ' ')))
      throw new Error(`${quoi} absent de la capture : « ${txt.slice(0, 60)} »`);
  };
  if (DOSSIERS.length !== 13) throw new Error('13 dossiers attendus');
  for (const d of DOSSIERS) {
    verifie(d.client, 'client');
    verifie(d.mission, 'mission');
    d.tags.forEach(t => verifie(t, `tag de ${d.client}`));
    d.resultats.forEach(r => verifie(r, `résultat de ${d.client}`));
  }
  verifie('NOTE DE CONFIDENTIALITÉ', 'note');
  verifie('Seules nos références sans accord de confidentialité sont affichées publiquement.', 'note');
  verifie('TOTAL DOSSIERS: 13', 'méta');

  const meta = (o) => Object.entries(o)
    .map(([k, v]) => `<meta ${k.startsWith('og:') ? 'property' : 'name'}="${k}" content="${ech(v)}">`).join('\n');

  const cartes = DOSSIERS.map((d, i) => {
    const alt = `Référence client ${d.client} - ${d.mission}`;
    return `      <article class="dossier m${d.mag}">
        <span class="etoile" aria-hidden="true"></span>
        <figure class="plaque${d.photo ? ' photo' : ''}">
          <img class="${d.cl}" src="${ech(d.img)}" alt="${ech(alt)}"${i < 2 ? '' : ' loading="lazy"'}>
        </figure>
        <div class="fiche">
          <p class="tags">${d.tags.map(t => `<span>${ech(t)}</span>`).join('')}</p>
          <h3>${ech(d.client)}</h3>
          <p class="mission">${ech(d.mission)}</p>
          <h4>Impact &amp; Résultats</h4>
          <ul class="impact">
${d.resultats.map(r => `            <li>${ech(r)}</li>`).join('\n')}
          </ul>
        </div>
      </article>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(cap.title)}</title>
<meta name="description" content="${ech(cap.description)}">
${cap.keywords ? `<meta name="keywords" content="${ech(cap.keywords)}">` : ''}
<link rel="canonical" href="${ech(cap.canonical)}">
<meta name="ICBM" content="${ech((cap.geo['geo.position'] ?? '').replace(';', ', '))}">
<meta name="msvalidate.01" content="4C58C9622B2DBB31ECD9A463E3DCAF66">
<link rel="alternate" hreflang="fr" href="${ech(cap.canonical)}">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
${meta(cap.geo)}
${meta(cap.og)}
${meta(cap.twitter)}
<link rel="preload" href="/assets/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
<style>${STYLE}</style>
<script>
/* la classe d'animation est posée AVANT le premier paint (zéro CLS) ;
   sans JS ou en motion réduit, l'état par défaut est « tout allumé » */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches &&
    'IntersectionObserver' in window) {
  document.documentElement.classList.add('ref-anim');
}
</script>
${cap.schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav('/references')}

<a class="chip" id="chip" href="/contact" aria-label="Recevoir mon pré-audit gratuit">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"></path></svg>
  Pré-audit gratuit
</a>

<main class="page">
  <div class="ref-wrap">

    <header class="ref-tete">
      <div>
        <h1>DOSSIERS <span>CLIENTS</span></h1>
        <p class="k">// Base de Performance</p>
      </div>
      <p class="ref-meta">TOTAL DOSSIERS: 13<br>STATUT: PUBLIC</p>
    </header>

    <aside class="ref-note">
      <b>NOTE DE CONFIDENTIALITÉ :</b>Seules nos références sans accord de confidentialité sont affichées publiquement. Nos use cases détaillés et nos données de suivi de performance sont présentés de vive voix lors de nos premiers rendez-vous.
    </aside>

    <section class="ciel" aria-label="Nos références clients">
      <svg class="filament" aria-hidden="true"></svg>
${cartes}
    </section>

  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
<script>
/* La Constellation — allumage des dossiers + filament. Vanilla, additif :
   sans la classe ref-anim (posée dans le head), rien ici ne tourne. */
(function () {
  if (!document.documentElement.classList.contains('ref-anim')) return;
  var dossiers = [].slice.call(document.querySelectorAll('.dossier'));
  var tete = [].slice.call(document.querySelectorAll('.ref-tete, .ref-note'));
  var ciel = document.querySelector('.ciel');
  var svg = document.querySelector('.filament');

  /* ── le filament : 12 segments entre étoiles + 1 fuite vers le bas ── */
  var lignes = [];
  function centres() {
    var rc = ciel.getBoundingClientRect();
    return dossiers.map(function (d) {
      var r = d.querySelector('.etoile').getBoundingClientRect();
      return { x: r.left + r.width / 2 - rc.left, y: r.top + r.height / 2 - rc.top };
    });
  }
  function construit() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    lignes = [];
    var c = centres();
    svg.setAttribute('viewBox', '0 0 ' + ciel.clientWidth + ' ' + ciel.clientHeight);
    svg.setAttribute('width', ciel.clientWidth);
    svg.setAttribute('height', ciel.clientHeight);
    for (var i = 0; i < c.length; i++) {
      var a = c[i], b = (i < c.length - 1)
        ? c[i + 1]
        : { x: c[i].x, y: c[i].y + 128 };   /* la constellation continue */
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', a.x); l.setAttribute('y1', a.y);
      l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
      var d = Math.hypot(b.x - a.x, b.y - a.y);
      l.setAttribute('stroke-dasharray', d);
      l.setAttribute('stroke-dashoffset', dossiers[i].classList.contains('vu') ? 0 : d);
      if (i === c.length - 1) l.setAttribute('opacity', '.5');
      svg.appendChild(l);
      lignes.push(l);
    }
  }

  /* ── rituel d'allumage : or bref, puis la charge tient (bleu) ── */
  function allume(d, i) {
    d.classList.add('vu');                       /* entrée + logo hors ombre */
    if (lignes[i]) lignes[i].setAttribute('stroke-dashoffset', 0);
    setTimeout(function () { d.classList.add('allume'); }, 220);
    setTimeout(function () {
      d.classList.remove('allume'); d.classList.add('tenu');
    }, 1150);
  }

  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      obs.unobserve(x.target);
      var i = dossiers.indexOf(x.target);
      /* deux dossiers d'une même rangée : le second retarde d'un souffle
         (constellation desktop seulement — en frise, colonne unique) */
      var retard = matchMedia('(min-width: 1100px)').matches ? (i % 2) * 120 : 0;
      if (retard) setTimeout(function () { allume(x.target, i); }, retard);
      else allume(x.target, i);
    });
  }, { rootMargin: '0px 0px -18% 0px' });

  var obsTete = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('vu');
      obsTete.unobserve(x.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });

  /* ── la lampe tactile : au doigt, le dossier qui traverse la bande
        centrale porte le halo (greffe du Palmarès) ── */
  var lampe = null;
  if (matchMedia('(hover: none)').matches) {
    lampe = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (x) {
        if (x.isIntersecting) {
          dossiers.forEach(function (d) { d.classList.remove('lu'); });
          x.target.classList.add('lu');
        } else x.target.classList.remove('lu');
      });
    }, { rootMargin: '-38% 0px -38% 0px' });
  }

  /* fontes chargées → géométrie stable → on construit et on observe */
  function demarre() {
    construit();
    tete.forEach(function (t) { obsTete.observe(t); });
    dossiers.forEach(function (d) { obs.observe(d); if (lampe) lampe.observe(d); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(demarre);
  else demarre();

  var attente = null;
  addEventListener('resize', function () {
    clearTimeout(attente);
    attente = setTimeout(construit, 150);
  });

  /* motion réduit basculé page ouverte : tout allumé, tout tracé */
  var mr = matchMedia('(prefers-reduced-motion: reduce)');
  if (mr.addEventListener) mr.addEventListener('change', function (e) {
    if (!e.matches) return;
    document.documentElement.classList.remove('ref-anim');
    dossiers.forEach(function (d) {
      d.classList.add('vu', 'tenu'); d.classList.remove('allume', 'lu');
    });
    lignes.forEach(function (l) { l.setAttribute('stroke-dashoffset', 0); });
  });
})();
</script>
</body>
</html>
`;

  const dossier = path.join(RACINE, 'site/references');
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, 'index.html'), html);

  /* ══ Garde-fous de sortie ══ */
  const titres = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => [Number(m[1]), m[2].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ').trim()]);
  const h1 = titres.filter(t => t[0] === 1);
  if (h1.length !== 1 || h1[0][1] !== cap.h1[0]) throw new Error(`h1 ≠ capture : ${h1[0]?.[1]}`);
  const h2 = titres.filter(t => t[0] === 2 && !['Agence', 'Expertises', 'Localisation', 'Infos'].includes(t[1]));
  if (h2.length) throw new Error('h2 inattendu (hiérarchie ancienne : h1→h3→h4)');
  const h3 = titres.filter(t => t[0] === 3).map(t => t[1]);
  const attendus = DOSSIERS.map(d => d.client);
  if (JSON.stringify(h3.slice(0, 13)) !== JSON.stringify(attendus))
    throw new Error('h3 ≠ ordre gelé des clients');
  const nbH4 = titres.filter(t => t[0] === 4 && t[1] === 'Impact & Résultats').length;
  if (nbH4 !== 13) throw new Error(`13 h4 « Impact & Résultats » attendus, ${nbH4} trouvés`);

  console.log('page /references générée');
  console.log('  title     :', cap.title);
  console.log('  canonical :', cap.canonical);
  console.log('  JSON-LD   :', cap.schemas.length, 'bloc(s), reconduits de la capture');
  console.log('  dossiers  :', DOSSIERS.length, '(parité capture vérifiée, tags/résultats coupés comme le rendu)');
  console.log('  h1        :', cap.h1[0]);
}

main().catch(e => { console.error(e.message); process.exit(1); });
