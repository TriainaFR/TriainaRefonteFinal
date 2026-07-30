/**
 * expertise-geo.mjs — page /expertise-geo, ENTIÈREMENT REMPLACÉE le 29/07/2026
 * à la demande de Lucas : contenu, title, metas, Open Graph, Twitter, metas
 * GEO/LLM et les 4 schémas (ProfessionalService, FAQPage, BreadcrumbList,
 * Person) viennent de son code — tools/sources/expertise-geo.html — repris à
 * l'octet. Corrections qu'il a validées, appliquées à la source : fil
 * d'Ariane sans le niveau « Expertise » (page inexistante), URLs en www,
 * liste officielle des 8 médias propriétaires.
 *
 * Design : « La Citation » conservée — le GEO, c'est être cité dans la
 * réponse : un surlignage d'or balaie les phrases clés à leur entrée, les
 * titres de section portent un losange, et le tout vit dans un cadre-réponse
 * encadré de guillemets. Remappé sur les nouvelles sections.
 */
import { readFileSync } from 'node:fs';

/* ══ La tête : les signaux de Lucas, à l'octet près ══ */
const SOURCE = readFileSync(new URL('../sources/expertise-geo.html', import.meta.url), 'utf8');
export const TETE = SOURCE
  .slice(SOURCE.indexOf('<!-- SEO primaire -->'), SOURCE.indexOf('</head>'))
  .trim();

export const STYLE = `
  /* ── La Citation ── */

  /* fil d'Ariane */
  .g-bc{padding:8.5rem 0 0}
  .g-bc ol{list-style:none; display:flex; flex-wrap:wrap; gap:.5rem;
    font-family:ui-monospace,monospace; font-size:.62rem; letter-spacing:.16em;
    text-transform:uppercase; color:var(--brume)}
  .g-bc li + li::before{content:'›'; margin-right:.5rem; color:rgba(148,163,184,.5)}
  .g-bc a{color:var(--bleu-c); text-decoration:none}
  .g-bc a:hover{color:var(--lueur)}
  .g-bc [aria-current]{color:#EAF0FF}

  /* hero : le cadre-réponse, guillemets aux coins */
  .g-hero{padding:1.4rem 0 1rem; position:relative}
  .g-hero h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(1.9rem,5vw,4.3rem); line-height:1.08;
    max-width:24ch}
  .g-hero .resume{position:relative; margin-top:1.8rem; max-width:48rem;
    border:1px solid rgba(96,165,250,.28); border-radius:18px;
    background:rgba(16,26,51,.55); padding:1.5rem 1.8rem;
    color:var(--brume); line-height:1.78}
  .g-hero .resume::before, .g-hero .resume::after{
    position:absolute; font-family:var(--syne); font-weight:800;
    font-size:2.6rem; line-height:1; color:rgba(255,233,184,.55)}
  .g-hero .resume::before{content:'«'; left:-.2rem; top:-1.1rem}
  .g-hero .resume::after{content:'»'; right:-.2rem; bottom:-1.5rem}
  .g-hero .resume strong:first-child{color:var(--lueur);
    font-family:ui-monospace,monospace; font-size:.68rem; letter-spacing:.14em;
    text-transform:uppercase; margin-right:.35rem}
  .g-hero .resume strong{color:#EAF0FF}
  .g-hero .liens{margin-top:1.6rem; font-size:.94rem; color:var(--brume)}

  /* corps commun */
  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.4rem); margin-bottom:1.5rem;
    position:relative; padding-left:1.5rem}
  .xp-sec h2::before{content:''; position:absolute; left:0; top:.42em;
    width:9px; height:9px; background:var(--lueur); transform:rotate(45deg);
    transition:transform .45s cubic-bezier(.2,1.25,.35,1)}
  .xp-anim .xp-sec h2:not(.vu)::before{transform:rotate(45deg) scale(.35)}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.05rem,1.5vw,1.25rem); margin-top:1.9rem}
  .xp-sec p{max-width:47rem; color:var(--brume); line-height:1.75; margin-top:.9rem}
  .xp-sec p strong{color:#EAF0FF}
  .xp-sec li{color:var(--brume); line-height:1.7; margin-top:.5rem; font-size:.95rem;
    list-style:none; position:relative; padding-left:1.25rem}
  .xp-sec ul li::before{content:''; position:absolute; left:0; top:.52em;
    width:7px; height:7px; background:rgba(96,165,250,.55); transform:rotate(45deg)}
  .xp-sec li strong{color:#EAF0FF}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}
  .xp-sec code{font-family:ui-monospace,monospace; font-size:.88em;
    background:rgba(96,165,250,.12); padding:.1em .35em; border-radius:4px;
    color:#CFE0FF}

  /* le surlignage de citation : l'or balaie la phrase à son entrée */
  .cit{background-image:linear-gradient(105deg, rgba(255,233,184,.2), rgba(255,233,184,.11));
    background-repeat:no-repeat; background-size:100% 100%;
    -webkit-box-decoration-break:clone; box-decoration-break:clone;
    color:var(--lueur)}
  .xp-anim .cit{background-size:0% 100%; color:var(--brume);
    transition:background-size .6s cubic-bezier(.2,.7,.2,1) .2s, color .6s ease .2s}
  .xp-anim .vu .cit, .xp-anim .cit.vu{background-size:100% 100%; color:var(--lueur)}

  /* s3 : les 8 médias, en registre */
  .g-s3 .medias li{padding:.55rem 0; border-bottom:1px solid rgba(148,163,184,.12);
    padding-left:1.25rem}
  .g-s3 .medias li strong{color:#fff; font-family:var(--syne); font-weight:700}

  /* s4 : les 5 étapes, chiffrées en losanges */
  .g-s4{counter-reset:etape}
  .etape{counter-increment:etape; position:relative; padding-left:3.4rem;
    max-width:47rem; margin-top:2rem}
  .etape::before{content:counter(etape); content:counter(etape) / "";
    position:absolute; left:0; top:.1rem; width:2.2rem; height:2.2rem;
    display:grid; place-items:center; transform:rotate(45deg);
    border:1.5px solid rgba(96,165,250,.5);
    transition:border-color .3s, background .3s}
  .etape.vu::before{border-color:rgba(255,233,184,.7); background:rgba(255,233,184,.08)}
  .etape h3{margin-top:0}
  .etape p{margin-top:.5rem; font-size:.96rem}

  /* s5 : le tableau des cas clients */
  .defile{overflow-x:auto; margin-top:1.5rem; border:1px solid rgba(96,165,250,.16);
    border-radius:14px}
  .defile table{border-collapse:collapse; width:100%; min-width:48rem; font-size:.92rem}
  .defile th{font-family:ui-monospace,monospace; font-weight:400; font-size:.62rem;
    letter-spacing:.14em; text-transform:uppercase; color:var(--bleu-c);
    text-align:left; padding:.9rem 1rem; border-bottom:1px solid rgba(96,165,250,.22)}
  .defile td{padding:.85rem 1rem; border-bottom:1px solid rgba(96,165,250,.1);
    color:var(--brume); vertical-align:top}
  .defile tr:last-child td{border-bottom:0}
  .defile td:first-child{color:#fff; font-weight:600; white-space:nowrap}
  .defile td:nth-child(3){color:var(--lueur); font-family:var(--syne);
    font-weight:800; font-size:1.15em}

  /* s6 : FAQ, paires visibles */
  .paire{max-width:47rem; margin-top:1.9rem}
  .paire .xp-fq{font-family:var(--syne); font-weight:700; color:#E2E8F0;
    font-size:1.05rem; position:relative; padding-left:1.3rem}
  .paire .xp-fq::before{content:'»'; position:absolute; left:0; top:-.05em;
    color:rgba(255,233,184,.6); font-family:var(--syne)}
  .paire .xp-fr{margin-top:.55rem; padding-left:1.3rem; color:var(--brume);
    line-height:1.75; font-size:.96rem}

  /* s7 : sources + CTA + signature */
  .g-s7{padding-bottom:3.5rem}
  .g-s7 .xp-cta{position:relative; display:inline-block; margin-top:1.4rem}
  .g-s7 .xp-cta::before{content:''; position:absolute; left:50%; top:50%;
    width:24rem; height:10rem; transform:translate(-50%,-50%); pointer-events:none;
    opacity:0; transition:opacity .8s;
    background:radial-gradient(closest-side, rgba(255,233,184,.26), transparent 70%)}
  .g-s7 .xp-cta.vu::before, body:not(.xp-anim) .g-s7 .xp-cta::before{opacity:.55}
  .g-s7 .xp-cta a{position:relative; display:inline-flex; background:var(--bleu);
    color:#fff; font-weight:800; font-size:.82rem; letter-spacing:.13em;
    text-transform:uppercase; padding:1.15rem 2.2rem; border-radius:99px;
    text-decoration:none; transition:background .25s, color .25s, transform .2s}
  .g-s7 .xp-cta a:hover{background:var(--lueur); color:#0B1428; transform:translateY(-2px)}
  .g-s7 .signature{margin-top:2.2rem; padding-top:1.2rem;
    border-top:1px solid rgba(148,163,184,.16); font-size:.9rem}
  .g-s7 .signature strong{color:#EAF0FF}

  /* arrivées */
  .xp-anim .ln:not(.vu){opacity:0; transform:translateY(12px)}
  .xp-anim .ln{transition:opacity .5s, transform .5s cubic-bezier(.22,.9,.24,1)}

  @media(max-width:640px){
    .g-hero .resume::before, .g-hero .resume::after{font-size:1.8rem}
    .etape{padding-left:2.9rem}
  }
  @media (prefers-reduced-motion: reduce){
    .xp-sec h2::before{transform:rotate(45deg)}
    .cit{background-size:100% 100%; color:var(--lueur)}
    .g-s7 .xp-cta::before{opacity:.55}
  }
`;

/* phrases mises en citation (texte inchangé, simplement enveloppé) */
const CITATIONS = [
  'jusqu’à 40 %',
  'sources tierces indexées par les LLMs',
  'agence GEO Paris',
];

export function renduBloc(b, defaut, groupe, i) {
  if (b.t === 'breadcrumb') return `<nav aria-label="Fil d'Ariane">${b.html}</nav>`;
  if (groupe === 'hero' && b.t === 'p' && i === 1) return `<p class="resume">${b.html}</p>`;
  if (groupe === 'hero' && b.t === 'p' && i === 2) return `<p class="liens">${b.html}</p>`;
  if (b.t === 'table') return `<div class="defile" tabindex="0" role="region" aria-label="Cas clients : résultats mesurés">${b.html}</div>`;
  if (b.t === 'p') {
    let html = b.html;
    for (const c of CITATIONS) {
      if (html.includes(c) && !html.includes('class="cit"'))
        html = html.replace(c, `<span class="cit">${c}</span>`);
    }
    if (html !== b.html) return `<p>${html}</p>`;
  }
  return defaut;
}

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
    ? `<div class="${classe} ln">\n${x.join('\n')}\n</div>` : x).join('\n');
}

export function renduSection(groupe, s) {
  const env = (interne) => `<section class="xp-sec g-${groupe}">\n${interne}\n</section>`;
  if (groupe === 's3') {
    /* la liste des 8 médias devient un registre */
    const rendus = s.rendus.map((r, i) =>
      s.blocs[i].t === 'ul' && /Les Hardis/.test(s.blocs[i].html)
        ? r.replace('<ul>', '<ul class="medias">') : r);
    return env(rendus.join('\n'));
  }
  if (groupe === 's4') {
    /* les 5 étapes : h3 + p appariés */
    return env(groupeDepuis(s.rendus, s.blocs, ['h3'], 'etape'));
  }
  if (groupe === 's6')
    return env(groupeDepuis(s.rendus, s.blocs, ['faq-q'], 'paire'));
  if (groupe === 's7') {
    const rendus = s.rendus.map((r, i) => {
      const b = s.blocs[i];
      if (b.t === 'p' && /^<a href="\/contact">/.test(b.html) && b.html.endsWith('</a>'))
        return `<p class="xp-cta">${b.html}</p>`;
      if (b.t === 'p' && /Auteure de cette page/.test(b.html))
        return `<p class="signature">${b.html}</p>`;
      return r;
    });
    return env(rendus.join('\n'));
  }
  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.g-hero .resume, .g-hero .liens, .xp-sec h2, .xp-sec h3, ' +
    '.xp-sec > p, .xp-sec > ul, .xp-sec > ol, .etape, .paire, .defile, ' +
    '.g-s7 .xp-cta, .g-s7 .signature'));
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      /* rattrapage : un saut de défilement allume aussi tout ce qui précède */
      for (var j = 0; j <= cibles.indexOf(x.target); j++) {
        cibles[j].classList.add('vu');
        io.unobserve(cibles[j]);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  cibles.forEach(function (el) { el.classList.add('ln'); io.observe(el); });
`;
