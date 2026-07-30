/**
 * agence-seo-paris.mjs — « La Ville Lumière » : Paris la nuit. Chaque tête de
 * section est une PLAQUE DE RUE émaillée (cadre à double liseré, capitale)
 * dont le liseré intérieur se trace à l'entrée pendant qu'un réverbère d'or
 * s'allume à son coin ; sous le hero, une skyline abstraite de fenêtres
 * s'allume en cascade, une fois. L'or : les réverbères, les fenêtres, le CTA.
 * Aucun motif emprunté aux autres pages (pas de balayage, pas d'éclat, pas
 * de filet libre) — la lumière est toujours logée dans un objet.
 */

export const STYLE = `
  /* ── La Ville Lumière ── */
  .g-s0{padding-top:8.5rem; padding-bottom:1.5rem}
  .g-s0 .xp-k, .g-s0 > p:first-child{font-family:ui-monospace,monospace;
    font-size:.66rem; letter-spacing:.2em; text-transform:uppercase;
    color:var(--bleu-c)}
  .g-s0 h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(2.3rem,5vw,3.9rem); line-height:1.08;
    text-transform:uppercase; max-width:24ch; margin-top:.9rem}
  /* la skyline : rangée de fenêtres qui s'allument (décor pur, aria-hidden) */
  .skyline{display:flex; gap:6px; align-items:flex-end; height:44px;
    margin-top:2.2rem; max-width:26rem}
  .skyline i{flex:1; border-radius:2px 2px 0 0;
    background:rgba(96,165,250,.16); transition:background .5s}
  .skyline i:nth-child(3n){height:100%} .skyline i:nth-child(3n+1){height:62%}
  .skyline i:nth-child(3n+2){height:80%} .skyline i:nth-child(7n){height:46%}
  .skyline i.lum{background:rgba(255,233,184,.75)}
  .xp-anim .skyline i{transition-delay:calc(var(--fx) * 70ms)}

  /* ── la plaque de rue : chaque h2 ── */
  .plaque-rue{position:relative; display:inline-block;
    border:2px solid rgba(96,165,250,.4); border-radius:8px;
    padding:1rem 1.6rem 1rem 1.9rem; background:rgba(11,20,40,.85);
    margin-bottom:2.2rem}
  .plaque-rue::before{content:''; position:absolute; inset:5px;
    border:1px solid rgba(234,242,255,.35); border-radius:5px;
    clip-path:inset(0 100% 0 0); transition:clip-path .8s cubic-bezier(.22,.9,.24,1)}
  .plaque-rue::after{content:''; position:absolute; left:-5px; top:-5px;
    width:10px; height:10px; border-radius:50%;
    background:rgba(148,163,184,.4); transition:background .4s .5s, box-shadow .4s .5s}
  .plaque-rue h2{font-family:var(--syne); font-weight:800; color:#EAF0FF;
    text-transform:uppercase; letter-spacing:.04em;
    font-size:clamp(1.15rem,2.2vw,1.7rem); line-height:1.25; margin:0}
  .plaque-rue.vu::before, body:not(.xp-anim) .plaque-rue::before{clip-path:inset(0)}
  .plaque-rue.vu::after, body:not(.xp-anim) .plaque-rue::after{
    background:var(--lueur); box-shadow:0 0 12px rgba(255,233,184,.75)}

  /* corps de sections */
  .xp-sec p{max-width:46rem; color:var(--brume); line-height:1.75; margin-top:.9rem}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:1.12rem; margin-top:1.6rem}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* services : deux quartiers en colonnes */
  .g-s2 .rues, .g-s3 .rues{display:grid; grid-template-columns:1fr 1fr;
    gap:.4rem clamp(1.6rem,3vw,3rem)}
  @media(max-width:860px){.g-s2 .rues, .g-s3 .rues{grid-template-columns:1fr}}
  .rue{padding:1rem 0; border-bottom:1px solid rgba(148,163,184,.14)}
  .rue h3{margin-top:0; position:relative; padding-left:1.15rem}
  .rue h3::before{content:''; position:absolute; left:0; top:.34em;
    width:7px; height:7px; border-radius:50%;
    background:rgba(148,163,184,.4); transition:background .4s, box-shadow .4s}
  .rue.vu h3::before, body:not(.xp-anim) .rue h3::before{
    background:var(--lueur); box-shadow:0 0 8px rgba(255,233,184,.6)}
  .rue p{font-size:.93rem; margin-top:.5rem}

  /* processus : les étapes en réverbères successifs */
  .g-s4 .etape{position:relative; max-width:46rem; padding-left:2.2rem;
    margin-top:1.8rem}
  .g-s4 .etape .xp-meta, .g-s4 .etape > p:first-child{
    font-family:ui-monospace,monospace; font-size:.62rem; letter-spacing:.2em;
    text-transform:uppercase; color:var(--bleu-c); margin:0}
  .g-s4 .etape::before{content:''; position:absolute; left:.35rem; top:.3rem;
    width:8px; height:8px; border-radius:50%;
    background:rgba(148,163,184,.4); transition:background .4s, box-shadow .4s}
  .g-s4 .etape.vu::before, body:not(.xp-anim) .g-s4 .etape::before{
    background:var(--lueur); box-shadow:0 0 10px rgba(255,233,184,.65)}
  .g-s4 .etape h3{margin-top:.35rem}
  .g-s4 .etape p{margin-top:.5rem; font-size:.95rem}

  /* cas clients : trois immeubles */
  .g-s5 .cas-grille{display:grid; grid-template-columns:repeat(3,1fr);
    gap:clamp(1.2rem,2.5vw,2.2rem)}
  @media(max-width:900px){.g-s5 .cas-grille{grid-template-columns:1fr}}
  .g-s5 .cas{border-top:2px solid rgba(96,165,250,.35); padding-top:1rem}
  .g-s5 .cas h3{margin-top:0}
  .g-s5 .cas p{font-size:.92rem}
  .g-s5 .cas p strong{color:#EAF0FF}

  /* FAQ : paires visibles */
  .g-s7 .paire{max-width:46rem; margin-top:1.8rem}
  .g-s7 .paire h3{position:relative; padding-left:1.15rem; font-size:1.05rem}
  .g-s7 .paire h3::before{content:''; position:absolute; left:0; top:.34em;
    width:7px; height:7px; border-radius:50%; background:rgba(255,233,184,.5)}
  .g-s7 .paire p{margin-top:.5rem; padding-left:1.15rem; font-size:.95rem}

  /* CTA final : le grand réverbère */
  .g-s8{text-align:center}
  .g-s8 .plaque-rue{display:inline-block}
  .g-s8 p{margin-inline:auto}
  .g-s8 .xp-cta{position:relative; display:inline-block; margin-top:1.8rem}
  .g-s8 .xp-cta::before{content:''; position:absolute; left:50%; top:50%;
    width:24rem; height:10rem; transform:translate(-50%,-50%);
    pointer-events:none; opacity:0; transition:opacity .8s;
    background:radial-gradient(closest-side, rgba(255,233,184,.26), transparent 70%)}
  .g-s8 .xp-cta.vu::before, body:not(.xp-anim) .g-s8 .xp-cta::before{opacity:.55}
  .g-s8 .xp-cta a{display:inline-flex; background:var(--bleu); color:#fff;
    font-weight:800; font-size:.82rem; letter-spacing:.13em; text-transform:uppercase;
    padding:1.15rem 2.2rem; border-radius:99px; text-decoration:none;
    transition:background .25s, color .25s, transform .2s; position:relative}
  .g-s8 .xp-cta a:hover{background:var(--lueur); color:#0B1428; transform:translateY(-2px)}

  /* maillage : pilules froides */
  .g-s9{padding-bottom:3.5rem}
  .g-s9 .plaque-rue{border-width:1px; padding:.7rem 1.1rem}
  .g-s9 .plaque-rue::before{display:none}
  .g-s9 .plaque-rue::after{display:none}
  .g-s9 .plaque-rue h2{font-size:.72rem; font-family:ui-monospace,monospace;
    font-weight:400; letter-spacing:.22em; color:var(--brume)}
  .g-s9 p{max-width:none}
  .g-s9 a{display:inline-flex; margin:0 .6rem .6rem 0; padding:.55rem 1.1rem;
    border:1px solid rgba(37,99,235,.4); border-radius:99px; color:#CBD5E1;
    font-size:.85rem; text-decoration:none;
    transition:border-color .25s, color .25s}
  .g-s9 a:hover{border-color:rgba(255,233,184,.6); color:#fff}

  /* arrivées : fondu-montée douce */
  .xp-anim .vl:not(.vu){opacity:0; transform:translateY(14px)}
  .xp-anim .vl{transition:opacity .55s, transform .55s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .plaque-rue::before{clip-path:inset(0)}
    .plaque-rue::after{background:var(--lueur); box-shadow:0 0 12px rgba(255,233,184,.75)}
    .skyline i.lum, .skyline i{transition:none}
    .g-s8 .xp-cta::before{opacity:.55}
  }
`;

function groupeDepuis(rendus, blocs, tetes, classe) {
  const sortie = [];
  let carte = null;
  rendus.forEach((r, i) => {
    if (tetes.includes(blocs[i].t)) { if (carte) sortie.push(carte); carte = [r]; }
    else if (carte) carte.push(r);
    else sortie.push(r);
  });
  if (carte) sortie.push(carte);
  return sortie.map(x => Array.isArray(x)
    ? `<div class="${classe} vl">\n${x.join('\n')}\n</div>` : x).join('\n');
}

/* le h2 devient plaque de rue ; la skyline est injectée après le h1 */
export function renduBloc(b, defaut) {
  if (b.t === 'h2')
    return `<div class="plaque-rue vl"><h2>${b.html}</h2></div>`;
  if (b.t === 'h1') {
    const fen = Array.from({ length: 14 }, (_, i) => `<i style="--fx:${i}"></i>`).join('');
    return `<h1>${b.html}</h1>\n<div class="skyline" aria-hidden="true">${fen}</div>`;
  }
  return defaut;
}

export function renduSection(groupe, s) {
  if (groupe === 's2' || groupe === 's3') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'rue');
    return `<section class="xp-sec g-${groupe}">\n${interne.replace(/(<div class="rue[\s\S]*<\/div>)/, '<div class="rues">\n$1\n</div>')}\n</section>`;
  }
  if (groupe === 's4') {
    /* étapes : « Étape 0N » (p) + h3 + p */
    const interne = groupeDepuis(s.rendus, s.blocs,
      s.blocs.some(b => b.t === 'meta') ? ['meta'] : ['p'], 'etape');
    /* le premier élément est le h2-plaque, les p « Étape » ouvrent les cartes :
       on ne regroupe qu'à partir des blocs dont le texte commence par Étape */
    return `<section class="xp-sec g-s4">\n${regroupeEtapes(s)}\n</section>`;
  }
  if (groupe === 's5') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'cas');
    return `<section class="xp-sec g-s5">\n${interne.replace(/(<div class="cas[\s\S]*<\/div>)/, '<div class="cas-grille">\n$1\n</div>')}\n</section>`;
  }
  if (groupe === 's7')
    return `<section class="xp-sec g-s7">\n${groupeDepuis(s.rendus, s.blocs, ['h3'], 'paire')}\n</section>`;
  return s.enveloppe;
}

function regroupeEtapes(s) {
  const sortie = [];
  let carte = null;
  s.rendus.forEach((r, i) => {
    const b = s.blocs[i];
    const ouvre = b.t === 'p' && /^Étape \d/.test(b.html);
    if (ouvre) { if (carte) sortie.push(carte); carte = [r]; }
    else if (carte) carte.push(r);
    else sortie.push(r);
  });
  if (carte) sortie.push(carte);
  return sortie.map(x => Array.isArray(x)
    ? `<div class="etape vl">\n${x.join('\n')}\n</div>` : x).join('\n');
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.plaque-rue, .rue, .etape, .g-s5 .cas, .g-s7 .paire, ' +
    '.g-s1 p, .g-s6 p, .g-s8 p, .g-s8 .xp-cta, .g-s9 p'));
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      /* rattrapage : un saut de défilement allume aussi tout ce qui précède */
      for (var j = 0; j <= cibles.indexOf(x.target); j++) {
        cibles[j].classList.add('vu');
        io.unobserve(cibles[j]);
      }
    });
  }, { threshold: .2, rootMargin: '0px 0px -10% 0px' });
  cibles.forEach(function (el) { el.classList.add('vl'); io.observe(el); });
  /* la skyline s'allume en cascade, une fois */
  var fen = [].slice.call(document.querySelectorAll('.skyline i'));
  var ioSky = new IntersectionObserver(function (e) {
    if (!e[0].isIntersecting) return;
    ioSky.disconnect();
    fen.forEach(function (f, i) {
      if (i % 3 === 1) return;              /* quelques fenêtres restent éteintes */
      setTimeout(function () { f.classList.add('lum'); }, 200 + i * 70);
    });
  }, { threshold: .4 });
  if (fen.length) ioSky.observe(fen[0].parentElement);
`;

/* ── correction de schéma demandée par Lucas le 30/07/2026 ──────────────────
 * La capture de l'ancien site (tools/snapshots/ancien-seoia/) contient un
 * aggregateRating « 4,9 sur 52 avis » sur le nœud LocalBusiness. Aucun avis
 * n'existe nulle part sur le site : c'est exactement le motif d'action
 * manuelle Google « Problème lié aux données structurées ». On le retire ici
 * plutôt que dans la capture, pour que celle-ci reste un témoin fidèle de
 * l'ancien site (c'est elle qui sert de référence au diff de non-régression).
 * À rétablir le jour où de vrais avis, visibles sur la page, existeront. */
export function transformeSchemas(schemas) {
  let retires = 0;
  const visite = o => {
    if (Array.isArray(o)) return o.forEach(visite);
    if (!o || typeof o !== 'object') return;
    if (o.aggregateRating) { delete o.aggregateRating; retires++; }
    for (const v of Object.values(o)) visite(v);
  };
  visite(schemas);
  if (retires) console.log(`  agence-seo-paris : ${retires} aggregateRating retiré(s) (aucun avis réel)`);
  return schemas;
}
