/**
 * expertise-media.mjs — page /expertise-media, ENTIÈREMENT REMPLACÉE le
 * 29/07/2026 : contenu et signaux viennent du code de Lucas
 * (tools/sources/expertise-media.html), repris à l'octet. Corrections
 * validées appliquées à la source : fil d'Ariane sans le niveau
 * « Expertise » (page inexistante), URLs en www, image de partage du site,
 * aucune mention d'auteur.
 *
 * Design : « L'Édition du Soir » conservée — la page est maquettée comme une
 * édition de presse. Chaque cahier ouvre sur un double filet décalé, les
 * huit médias du réseau deviennent huit notices de titre à filet, et le
 * chapô porte sa lettrine.
 */
import { readFileSync } from 'node:fs';

/* ══ La tête : les signaux de Lucas, à l'octet près ══ */
const SOURCE = readFileSync(new URL('../sources/expertise-media.html', import.meta.url), 'utf8');
export const TETE = SOURCE
  .slice(SOURCE.indexOf('<title>'), SOURCE.indexOf('</head>'))
  .trim();

export const STYLE = `
  /* ── L'Édition du Soir ── */

  .g-bc{padding:8.5rem 0 0}
  .g-bc ol{list-style:none; display:flex; flex-wrap:wrap; gap:.5rem;
    font-family:ui-monospace,monospace; font-size:.62rem; letter-spacing:.16em;
    text-transform:uppercase; color:var(--brume)}
  .g-bc li + li::before{content:'›'; margin-right:.5rem; color:rgba(148,163,184,.5)}
  .g-bc a{color:var(--bleu-c); text-decoration:none}
  .g-bc a:hover{color:var(--lueur)}
  .g-bc [aria-current]{color:#EAF0FF}

  /* la une */
  .g-hero{padding:1.2rem 0 1rem; border-bottom:1px solid rgba(148,163,184,.2)}
  .g-hero h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.02em; font-size:clamp(1.9rem,5vw,4.3rem); line-height:1.05;
    max-width:22ch}
  .g-hero .chapo{margin-top:1.5rem; max-width:48rem; font-size:1.05rem;
    line-height:1.8; color:var(--brume)}
  .g-hero .chapo::first-letter{float:left; font-family:var(--syne); font-weight:800;
    font-size:3.1em; line-height:.78; padding:.08em .14em .02em 0; color:var(--lueur)}
  .g-hero p:not(.chapo){max-width:48rem; margin-top:1rem; color:var(--brume); line-height:1.75}

  /* le double filet décalé : signature des cahiers */
  .xp-sec{padding:clamp(2.6rem,5vw,4.2rem) 0}
  .xp-sec h2{position:relative; font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.4rem); padding-top:1.4rem; margin-bottom:1.5rem}
  .xp-sec h2::before, .xp-sec h2::after{content:''; position:absolute; left:0;
    transform-origin:left; transition:transform .8s cubic-bezier(.22,.9,.24,1)}
  .xp-sec h2::before{top:0; width:min(100%,34rem); height:2px;
    background:linear-gradient(90deg, var(--lueur), rgba(96,165,250,.5))}
  .xp-sec h2::after{top:6px; width:min(100%,22rem); height:1px;
    background:rgba(148,163,184,.35); transition-delay:.12s}
  .xp-anim .xp-sec h2:not(.vu)::before, .xp-anim .xp-sec h2:not(.vu)::after{transform:scaleX(0)}

  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.05rem,1.5vw,1.25rem); margin-top:1.8rem}
  .xp-sec p{max-width:48rem; color:var(--brume); line-height:1.75; margin-top:.9rem}
  .xp-sec p strong{color:#EAF0FF}
  .xp-sec li{color:var(--brume); line-height:1.7; margin-top:.45rem; font-size:.95rem;
    list-style:none; position:relative; padding-left:1.15rem}
  .xp-sec ul li::before{content:''; position:absolute; left:0; top:.72em;
    width:8px; height:1px; background:rgba(255,233,184,.6)}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* les 5 leviers : chapeautés d'un numéro de colonne */
  .g-s2 h3{padding-left:0}

  /* ── s3 : les 8 notices de médias, en deux colonnes de journal ── */
  .g-s3 .notices{display:grid; grid-template-columns:1fr 1fr;
    gap:0 clamp(1.6rem,3vw,3rem); margin-top:1.8rem}
  @media(max-width:900px){.g-s3 .notices{grid-template-columns:1fr}}
  .notice{padding:1.4rem 0; border-top:1px solid rgba(148,163,184,.16)}
  .notice h3{margin-top:0; font-size:1.05rem; position:relative; padding-left:.9rem}
  .notice h3::before{content:''; position:absolute; left:0; top:.35em;
    width:3px; height:1em; background:var(--lueur)}
  .notice p{font-size:.92rem; max-width:none; margin-top:.6rem}
  .notice p:first-of-type{font-family:ui-monospace,monospace; font-size:.72rem;
    letter-spacing:.04em}
  .notice p strong{color:#EAF0FF}

  /* ── s4 / s5 : les phases et les cas, en colonnes éditoriales ── */
  .g-s4 .phases, .g-s5 .cas-grille{display:grid; grid-template-columns:1fr 1fr;
    gap:clamp(1.4rem,3vw,2.6rem); margin-top:1.6rem}
  @media(max-width:900px){.g-s4 .phases, .g-s5 .cas-grille{grid-template-columns:1fr}}
  .phase, .cas{border-top:2px solid rgba(96,165,250,.35); padding-top:.9rem}
  .phase h3, .cas h3{margin-top:0; font-size:1.02rem}
  .phase p, .cas p{font-size:.93rem; max-width:none}
  .cas p strong{font-family:ui-monospace,monospace; font-size:.64rem;
    letter-spacing:.16em; text-transform:uppercase; color:var(--bleu-c);
    display:block; margin-bottom:.2rem}
  .cas p:last-child strong{color:var(--lueur)}

  /* ── s6 : FAQ ── */
  .paire{max-width:48rem; margin-top:1.8rem}
  .paire .xp-fq{font-family:var(--syne); font-weight:700; color:#E2E8F0;
    font-size:1.04rem; position:relative; padding-left:1.1rem}
  .paire .xp-fq::before{content:''; position:absolute; left:0; top:.42em;
    width:6px; height:6px; background:rgba(255,233,184,.6)}
  .paire .xp-fr{margin-top:.55rem; padding-left:1.1rem; color:var(--brume);
    line-height:1.75; font-size:.95rem}

  /* ── s8 : l'appel final ── */
  .g-s8{padding-bottom:3.5rem}
  .g-s8 .xp-cta{position:relative; display:inline-block; margin-top:1.2rem}
  .g-s8 .xp-cta::before{content:''; position:absolute; left:50%; top:50%;
    width:24rem; height:10rem; transform:translate(-50%,-50%); pointer-events:none;
    opacity:0; transition:opacity .8s;
    background:radial-gradient(closest-side, rgba(255,233,184,.26), transparent 70%)}
  .g-s8 .xp-cta.vu::before, body:not(.xp-anim) .g-s8 .xp-cta::before{opacity:.55}
  .g-s8 .xp-cta a{position:relative; display:inline-flex; background:var(--bleu);
    color:#fff; font-weight:800; font-size:.82rem; letter-spacing:.13em;
    text-transform:uppercase; padding:1.15rem 2.2rem; border-radius:99px;
    text-decoration:none; transition:background .25s, color .25s, transform .2s}
  .g-s8 .xp-cta a:hover{background:var(--lueur); color:#0B1428; transform:translateY(-2px)}

  /* arrivées */
  .xp-anim .ed:not(.vu){opacity:0; transform:translateY(12px)}
  .xp-anim .ed{transition:opacity .5s, transform .5s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .xp-sec h2::before, .xp-sec h2::after{transform:none}
    .g-s8 .xp-cta::before{opacity:.55}
  }
`;

export function renduBloc(b, defaut, groupe, i) {
  if (b.t === 'breadcrumb') return `<nav aria-label="Fil d'Ariane">${b.html}</nav>`;
  if (groupe === 'hero' && b.t === 'p' && i === 1) return `<p class="chapo">${b.html}</p>`;
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
    ? `<div class="${classe} ed">\n${x.join('\n')}\n</div>` : x).join('\n');
}

export function renduSection(groupe, s) {
  const env = (interne) => `<section class="xp-sec g-${groupe}">\n${interne}\n</section>`;
  const enGrille = (classe, grille) => {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], classe);
    return env(interne.replace(new RegExp(`(<div class="${classe}[\\s\\S]*</div>)`),
      `<div class="${grille}">\n$1\n</div>`));
  };
  if (groupe === 's3') return enGrille('notice', 'notices');
  if (groupe === 's4') return enGrille('phase', 'phases');
  if (groupe === 's5') return enGrille('cas', 'cas-grille');
  if (groupe === 's6') return env(groupeDepuis(s.rendus, s.blocs, ['faq-q'], 'paire'));
  if (groupe === 's8') {
    const rendus = s.rendus.map((r, i) => {
      const b = s.blocs[i];
      if (b.t === 'p' && /^<a href="\/contact">/.test(b.html) && b.html.endsWith('</a>'))
        return `<p class="xp-cta">${b.html}</p>`;
      return r;
    });
    return env(rendus.join('\n'));
  }
  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.g-hero .chapo, .g-hero p, .xp-sec h2, .xp-sec h3, .xp-sec > p, ' +
    '.xp-sec > ul, .notice, .phase, .cas, .paire, .g-s8 .xp-cta'));
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
  cibles.forEach(function (el) { el.classList.add('ed'); io.observe(el); });
`;
