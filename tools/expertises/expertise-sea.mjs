/**
 * expertise-sea.mjs — page /expertise-sea, ENTIÈREMENT REMPLACÉE le 29/07/2026
 * à la demande de Lucas : contenu, title, metas, Open Graph, Twitter, metas GEO
 * et les 3 schémas (ProfessionalService, FAQPage, BreadcrumbList) viennent de
 * son code, repris à l'identique depuis tools/sources/expertise-sea.html.
 * Rien de l'ancienne page ne subsiste — la référence de contrôle du générateur
 * est désormais ce fichier source (tools/snapshots/refonte-sea/).
 *
 * Design : « L'Adjugé » conservé — la visibilité payante s'emporte à
 * l'instant, comme un lot en salle des ventes : les services défilent en
 * bordereau de lots numérotés (compteurs CSS), le process claque en quatre
 * coups, et l'or n'est dépensé qu'à l'adjudication puis au CTA final.
 */
import { readFileSync } from 'node:fs';

/* ══ La tête : les signaux de Lucas, à l'octet près ══ */
const SOURCE = readFileSync(new URL('../sources/expertise-sea.html', import.meta.url), 'utf8');
export const TETE = SOURCE
  .slice(SOURCE.indexOf('<!-- SEO primary -->'), SOURCE.indexOf('</head>'))
  .trim();

export const STYLE = `
  /* ── L'Adjugé : la cadence de la salle des ventes ── */

  /* fil d'Ariane (visible, comme dans le code fourni) */
  .g-bc{padding:8.5rem 0 0}
  .g-bc ol{list-style:none; display:flex; flex-wrap:wrap; gap:.5rem;
    font-family:ui-monospace,monospace; font-size:.62rem; letter-spacing:.16em;
    text-transform:uppercase; color:var(--brume)}
  .g-bc li + li::before{content:'›'; margin-right:.5rem; color:rgba(148,163,184,.5)}
  .g-bc a{color:var(--bleu-c); text-decoration:none}
  .g-bc a:hover{color:var(--lueur)}
  .g-bc [aria-current]{color:#EAF0FF}

  /* hero — h1 jamais masqué (LCP) ; seul le sceau frappe, une fois */
  .g-hero{padding:1.4rem 0 1rem}
  .g-hero h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(1.9rem,5vw,4.3rem); line-height:1.06;
    text-transform:uppercase; max-width:20ch; position:relative}
  .g-hero h1::before{content:''; position:absolute; left:-1.4rem; top:.55em;
    width:10px; height:10px; background:var(--lueur)}
  .g-hero h1::after{content:''; position:absolute; left:-1.9rem; top:.3em;
    width:38px; height:38px; pointer-events:none; opacity:0;
    background:radial-gradient(closest-side, rgba(255,233,184,.55), transparent 70%)}
  .xp-anim .g-hero h1::before{animation:sceau-pose .35s cubic-bezier(.2,1.4,.4,1) both}
  .xp-anim .g-hero h1::after{animation:sceau-eclat .35s ease-out both}
  @keyframes sceau-pose{from{transform:scale(1.4)} to{transform:scale(1)}}
  @keyframes sceau-eclat{0%{opacity:0; transform:scale(.6)}
    45%{opacity:1; transform:scale(1.15)} 100%{opacity:.14; transform:scale(1)}}
  @media(max-width:820px){
    .g-hero h1::before, .g-hero h1::after{display:none}
  }
  /* le « En résumé » : la fiche du lot, encadrée */
  .g-hero .resume{margin-top:1.8rem; max-width:46rem; border-left:3px solid var(--lueur);
    background:rgba(16,26,51,.7); border-radius:0 14px 14px 0; padding:1.1rem 1.4rem;
    color:var(--brume); line-height:1.75}
  .g-hero .resume strong{color:var(--lueur); font-family:ui-monospace,monospace;
    font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; margin-right:.35rem}
  .g-hero p:not(.resume){max-width:46rem; margin-top:1rem; color:var(--brume); line-height:1.75}
  .g-hero p strong{color:#EAF0FF}

  /* corps commun */
  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.4rem); margin-bottom:1.6rem}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff; font-size:clamp(1.05rem,1.5vw,1.25rem)}
  .xp-sec p{max-width:46rem; color:var(--brume); line-height:1.72; margin-top:.85rem}
  .xp-sec p strong{color:#EAF0FF}
  .xp-sec li{color:var(--brume); line-height:1.7; margin-top:.45rem; font-size:.95rem;
    list-style:none; position:relative; padding-left:1.15rem}
  .xp-sec ul li::before{content:''; position:absolute; left:0; top:.55em;
    width:7px; height:7px; background:rgba(255,233,184,.45)}
  .xp-sec li strong{color:#EAF0FF}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* ── s2 : le bordereau des lots (services) ── */
  .g-s2{counter-reset:lot}
  .lot{counter-increment:lot; position:relative; padding-left:4.4rem;
    max-width:46rem; margin-top:2.4rem}
  .lot::before{content:counter(lot,decimal-leading-zero);
    content:counter(lot,decimal-leading-zero) / ""; position:absolute;
    left:0; top:.1rem; width:3rem; height:3rem; border-radius:50%;
    display:grid; place-items:center;
    font-family:ui-monospace,monospace; font-size:.82rem; color:#EAF0FF;
    border:1.5px solid rgba(37,99,235,.55);
    transition:border-color .25s, color .25s}
  .lot::after{content:''; position:absolute; left:-.7rem; top:-.6rem;
    width:4.4rem; height:4.4rem; border-radius:50%; pointer-events:none; opacity:0;
    background:radial-gradient(closest-side, rgba(255,233,184,.5), transparent 70%)}
  .lot h3{font-size:clamp(1.2rem,2vw,1.5rem)}
  .lot ul{margin-top:.7rem}
  .lot.vu::before{border-color:rgba(255,233,184,.8); color:var(--lueur)}
  .xp-anim .lot.vu::after{animation:sceau-eclat .35s ease-out both}
  @media(min-width:64rem){.lot:nth-of-type(2n){margin-left:5rem}}
  @media(max-width:640px){.lot{padding-left:3.4rem}
    .lot::before{width:2.4rem; height:2.4rem; font-size:.72rem}}

  /* ── s3 : les quatre coups (process) ── */
  .g-s3 .coups{display:grid; grid-template-columns:repeat(4,1fr);
    gap:clamp(1.2rem,2.5vw,2.2rem)}
  @media(max-width:980px){.g-s3 .coups{grid-template-columns:1fr 1fr}}
  @media(max-width:640px){.g-s3 .coups{grid-template-columns:1fr}}
  .coup{position:relative; padding-top:1.1rem}
  .coup::before{content:''; position:absolute; left:0; top:0;
    width:8px; height:8px; background:rgba(255,233,184,.4)}
  .coup h3{font-size:1.02rem; line-height:1.35}
  .coup p{font-size:.93rem; margin-top:.55rem}

  /* ── s4 : la boucle SEA ↔ SEO ── */
  .g-s4 h3{margin-top:2rem; position:relative; padding-left:1.1rem}
  .g-s4 h3::before{content:''; position:absolute; left:0; top:.42em;
    width:6px; height:6px; border-radius:50%; background:rgba(255,233,184,.6)}

  /* ── s5 : cas clients, trois colonnes ── */
  .g-s5 .cas-rangee{display:grid; grid-template-columns:repeat(3,1fr);
    gap:clamp(1.2rem,2.5vw,2.2rem)}
  @media(max-width:980px){.g-s5 .cas-rangee{grid-template-columns:1fr}}
  .cas{position:relative; border-top:2px solid rgba(96,165,250,.35); padding-top:1rem}
  .cas h3{font-size:1.05rem}
  .cas p{font-size:.92rem; max-width:none}
  .cas p strong{font-family:ui-monospace,monospace; font-size:.64rem;
    letter-spacing:.16em; text-transform:uppercase; color:var(--bleu-c);
    display:block; margin-bottom:.2rem}
  .cas p:last-child strong{color:var(--lueur)}

  /* ── s6 : FAQ, paires visibles ── */
  .paire{max-width:46rem; margin-top:1.9rem}
  .paire .xp-fq{font-family:var(--syne); font-weight:700; color:#E2E8F0;
    font-size:1.05rem; position:relative; padding-left:1.15rem}
  .paire .xp-fq::before{content:''; position:absolute; left:0; top:.42em;
    width:6px; height:6px; border-radius:50%; background:rgba(255,233,184,.55)}
  .paire .xp-fq strong{font-weight:700}
  .paire .xp-fr{margin-top:.55rem; padding-left:1.15rem; color:var(--brume);
    line-height:1.72; font-size:.96rem}
  .paire .xp-fr strong{color:#EAF0FF}

  /* ── s7 : le dernier coup (CTA) ── */
  .g-s7{text-align:center}
  .g-s7 p{margin-inline:auto}
  .g-s7 .xp-cta{position:relative; display:inline-block; margin-top:1.6rem}
  .g-s7 .xp-cta::before{content:''; position:absolute; left:50%; top:50%;
    width:26rem; height:11rem; transform:translate(-50%,-50%) scale(.7);
    pointer-events:none; opacity:0;
    background:radial-gradient(closest-side, rgba(255,233,184,.28), transparent 70%)}
  .xp-anim .g-s7 .xp-cta.vu::before{animation:halo-final .8s ease-out both}
  .g-s7 .xp-cta.vu::before, body:not(.xp-anim) .g-s7 .xp-cta::before{opacity:.55}
  @keyframes halo-final{from{opacity:0; transform:translate(-50%,-50%) scale(.7)}
    to{opacity:.55; transform:translate(-50%,-50%) scale(1)}}
  .g-s7 .xp-cta a{position:relative; display:inline-flex; align-items:center;
    background:var(--bleu); color:#fff; font-weight:800;
    font-size:.82rem; letter-spacing:.13em; text-transform:uppercase;
    padding:1.15rem 2.2rem; border-radius:99px; text-decoration:none;
    transition:background 90ms linear, color 90ms linear}
  .g-s7 .xp-cta a:hover{background:var(--lueur); color:#0B1428}
  .g-s7 .xp-cta a strong{font-weight:800}
  .g-s7 .liens{font-size:.92rem}

  /* ── s8 : sources ── */
  .g-s8{padding-bottom:3.5rem}
  .g-s8 h2{font-family:ui-monospace,monospace; font-weight:400; font-size:.66rem;
    letter-spacing:.24em; color:var(--brume); text-transform:uppercase}
  .g-s8 li{font-size:.92rem}

  /* ── le claquement (vocabulaire commun) ── */
  .xp-anim .cl:not(.vu){opacity:0; transform:translateY(6px)}
  .xp-anim .cl{transition:opacity 120ms linear,
    transform 160ms cubic-bezier(.2,1.4,.4,1)}
  .xp-anim .coup.cl:nth-child(2){transition-delay:110ms}
  .xp-anim .coup.cl:nth-child(3){transition-delay:220ms}
  .xp-anim .coup.cl:nth-child(4){transition-delay:330ms}
  .xp-anim .cas.cl:nth-child(2){transition-delay:110ms}
  .xp-anim .cas.cl:nth-child(3){transition-delay:220ms}

  @media (prefers-reduced-motion: reduce){
    .g-hero h1::after{opacity:.14}
    .lot::before{border-color:rgba(255,233,184,.55); color:var(--lueur)}
    .g-s7 .xp-cta::before{opacity:.55}
  }
`;

/* le fil d'Ariane reste VISIBLE (comme dans le code fourni) */
export function renduBloc(b, defaut, groupe, i) {
  if (b.t === 'breadcrumb')
    return `<nav aria-label="Fil d'Ariane">${b.html}</nav>`;
  if (groupe === 'hero' && b.t === 'p' && i === 1)
    return `<p class="resume">${b.html}</p>`;
  return defaut;
}

/* appariement des blocs en objets du motif */
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
    ? `<div class="${classe} cl">\n${x.join('\n')}\n</div>` : x).join('\n');
}

export function renduSection(groupe, s) {
  const enveloppe = (interne) => `<section class="xp-sec g-${groupe}">\n${interne}\n</section>`;
  if (groupe === 's2')
    return enveloppe(groupeDepuis(s.rendus, s.blocs, ['h3'], 'lot'));
  if (groupe === 's3') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'coup');
    return enveloppe(interne.replace(/(<div class="coup[\s\S]*<\/div>)/, '<div class="coups">\n$1\n</div>'));
  }
  if (groupe === 's5') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'cas');
    return enveloppe(interne.replace(/(<div class="cas[\s\S]*<\/div>)/, '<div class="cas-rangee">\n$1\n</div>'));
  }
  if (groupe === 's6')
    return enveloppe(groupeDepuis(s.rendus, s.blocs, ['faq-q'], 'paire'));
  if (groupe === 's7') {
    /* le paragraphe qui ne porte QUE le lien de rendez-vous devient le CTA */
    const rendus = s.rendus.map((r, i) => {
      const b = s.blocs[i];
      if (b.t === 'p' && /^<a href="\/contact">/.test(b.html) && b.html.endsWith('</a>'))
        return `<p class="xp-cta">${b.html}</p>`;
      if (b.t === 'p' && /Vous pouvez aussi/.test(b.html)) return `<p class="liens">${b.html}</p>`;
      return r;
    });
    return enveloppe(rendus.join('\n'));
  }
  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.g-hero .resume, .g-hero p, .xp-sec h2, .lot, .coup, .cas, .paire, ' +
    '.g-s1 > p, .g-s1 > ul, .g-s4 > p, .g-s4 > h3, .g-s4 > ul, ' +
    '.g-s7 > p, .g-s7 .xp-cta, .g-s8 > ul'));
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
  cibles.forEach(function (el) { el.classList.add('cl'); io.observe(el); });
`;
