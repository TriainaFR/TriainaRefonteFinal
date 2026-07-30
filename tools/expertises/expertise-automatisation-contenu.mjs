/**
 * expertise-contenu.mjs — page /expertise-automatisation-contenu, ENTIÈREMENT REMPLACÉE le
 * 29/07/2026 : contenu et signaux viennent du code de Lucas
 * (tools/sources/expertise-contenu.html), repris à l'octet. Corrections
 * validées appliquées à la source : URL migrée le 29/07 de /expertise-contenu
 * vers /expertise-automatisation-contenu (le slug du code fourni), avec 301
 * depuis l'ancienne URL et mise à jour du maillage sur les 81 pages,
 * fil d'Ariane sans le niveau « Expertise », URLs en www, liens internes en
 * relatif comme le reste du site, image de partage du site, aucun auteur.
 *
 * Design : « Le Tirage » conservé — la page est une épreuve d'imprimerie :
 * chaque bloc se révèle par un coup d'encre (clip-path gauche→droite) dont
 * la lisière porte un liseré d'or, et la colonne « Avec Triaina » du
 * comparatif est la seule encre sèche (or) de la page.
 */
import { readFileSync } from 'node:fs';

/* ══ La tête : les signaux de Lucas, à l'octet près ══ */
const SOURCE = readFileSync(new URL('../sources/expertise-automatisation-contenu.html', import.meta.url), 'utf8');
export const TETE = SOURCE
  .slice(SOURCE.indexOf('<title>'), SOURCE.indexOf('</head>'))
  .trim();

export const STYLE = `
  /* ── Le Tirage ── */
  @keyframes lisiere{
    0%{transform:scaleX(0); opacity:.45}
    70%{opacity:.45}
    100%{transform:scaleX(1); opacity:0}
  }

  /* barre d'encre : dispositif de tête de section */
  .xp-sec h2{position:relative; font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.4rem); padding-top:1.15rem; margin-bottom:1.5rem}
  .xp-sec h2::before, .xp-sec h2::after{content:''; position:absolute;
    left:0; top:0; width:56px; height:3px}
  .xp-sec h2::before{background:var(--bleu)}
  .xp-sec h2::after{background:linear-gradient(90deg,var(--bleu) 0 70%,var(--lueur) 70%)}

  /* hero — h1 toujours visible (LCP) */
  .g-hero{padding:8.5rem 0 1rem; position:relative}
  .g-hero::before{content:''; position:absolute; left:-8rem; top:6rem; z-index:-1;
    width:620px; height:330px; pointer-events:none;
    background:radial-gradient(closest-side, rgba(37,99,235,.12), transparent 70%)}
  .g-hero h1{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.9rem,5vw,4.3rem); line-height:1.08; letter-spacing:-.015em;
    max-width:24ch}
  .g-hero p{max-width:47rem; margin-top:1.1rem; color:var(--brume);
    font-size:1.04rem; line-height:1.78}

  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.05rem,1.5vw,1.25rem); margin-top:1.8rem}
  .xp-sec p{max-width:47rem; color:var(--brume); line-height:1.75; margin-top:.9rem}
  .xp-sec p strong{color:#EAF2FF}
  .xp-sec li{color:var(--brume); line-height:1.7; margin-top:.5rem; font-size:.95rem;
    list-style:none; position:relative; padding-left:1.4rem}
  .xp-sec ul li::before{content:''; position:absolute; left:0; top:.5em;
    width:8px; height:8px; border-radius:50%; background:var(--bleu-c)}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* s1 : la sortie du logiciel, en planche encadrée */
  .g-s1 ul{border:1px solid rgba(96,165,250,.2); border-radius:14px;
    padding:1.3rem 1.6rem; margin-top:1.1rem; max-width:36rem;
    background:repeating-linear-gradient(0deg, rgba(234,242,255,.02) 0 1px,
      transparent 1px 3px), #0F1B33}
  .g-s1 ul li:first-child{margin-top:0}

  /* s3 : le comparatif — la colonne « Avec Triaina » est l'encre sèche */
  .tab-roule{overflow-x:auto; margin-top:1.2rem}
  .tab-roule table{width:100%; min-width:36rem; border-collapse:collapse; font-size:.94rem}
  .tab-roule th, .tab-roule td{padding:.85rem 1.1rem; text-align:left; vertical-align:top}
  .tab-roule thead th{border-bottom:1px solid rgba(96,165,250,.28)}
  .tab-roule thead th:first-child{font-family:ui-monospace,monospace; font-weight:400;
    font-size:.64rem; letter-spacing:.16em; text-transform:uppercase; color:var(--brume)}
  .tab-roule thead th:nth-child(2){font-family:var(--manrope); font-weight:500; color:#8FA8D8}
  .tab-roule thead th:nth-child(3){font-family:var(--syne); font-weight:700; color:#fff;
    position:relative; padding-left:2rem}
  .tab-roule thead th:nth-child(3)::before{content:''; position:absolute; left:.8rem;
    top:50%; margin-top:-4px; width:8px; height:8px; border-radius:50%; background:var(--lueur)}
  .tab-roule tbody td{border-top:1px solid rgba(96,165,250,.1); color:var(--brume)}
  .tab-roule tbody tr:first-child td{border-top:0}
  .tab-roule td:first-child{color:#EAF2FF; font-weight:600}
  .tab-roule td:nth-child(2){color:rgba(226,232,240,.6)}
  .tab-roule td:nth-child(3){color:#F1F5F9}
  .tab-roule th:nth-child(3), .tab-roule td:nth-child(3){
    border-left:1px solid rgba(96,165,250,.16)}

  /* s4 : les cas d'usage, en trois épreuves */
  .g-s4 .epreuves{display:grid; grid-template-columns:repeat(3,1fr);
    gap:clamp(1.2rem,2.5vw,2rem); margin-top:1.6rem}
  @media(max-width:900px){.g-s4 .epreuves{grid-template-columns:1fr}}
  .epreuve{position:relative; border:1px solid rgba(96,165,250,.18);
    border-radius:14px; padding:1.4rem 1.5rem; overflow:hidden}
  .epreuve::before{content:''; position:absolute; left:0; right:0; top:0; height:2px;
    background:linear-gradient(90deg,var(--lueur),transparent);
    transform-origin:left; transition:transform .6s cubic-bezier(.22,.61,.21,1)}
  .xp-anim .epreuves:not(.est-tire) .epreuve::before{transform:scaleX(0)}
  .epreuve h3{margin-top:0; font-size:1.02rem}
  .epreuve p{font-size:.93rem; max-width:none}

  /* s5 : FAQ, questions en vrais titres (comme dans le code fourni) */
  .g-s5 .paire{max-width:47rem; margin-top:1.8rem}
  .g-s5 .paire h3{margin-top:0; font-size:1.04rem; position:relative; padding-left:1.15rem}
  .g-s5 .paire h3::before{content:''; position:absolute; left:0; top:.42em;
    width:7px; height:7px; border-radius:50%; background:rgba(255,233,184,.6)}
  .g-s5 .paire p{padding-left:1.15rem; font-size:.95rem}

  /* s6 : le bon à tirer */
  .g-s6{padding-bottom:3.5rem}
  .g-s6 .xp-cta{position:relative; display:inline-block; margin-top:1rem}
  .g-s6 .xp-cta::before{content:''; position:absolute; left:50%; top:50%;
    width:24rem; height:10rem; transform:translate(-50%,-50%); pointer-events:none;
    opacity:0; transition:opacity .8s;
    background:radial-gradient(closest-side, rgba(255,233,184,.26), transparent 70%)}
  .g-s6 .xp-cta.est-tire::before, body:not(.xp-anim) .g-s6 .xp-cta::before{opacity:.55}
  .g-s6 .xp-cta a{position:relative; display:inline-flex; background:var(--bleu);
    color:#fff; font-weight:800; font-size:.82rem; letter-spacing:.13em;
    text-transform:uppercase; padding:1.15rem 2.2rem; border-radius:99px;
    text-decoration:none; transition:background .25s, color .25s, transform .2s}
  .g-s6 .xp-cta a:hover{background:var(--lueur); color:#0B1428; transform:translateY(-2px)}

  /* le coup d'encre : révélation par clip-path, liseré or sur la lisière */
  .xp-anim .encre{clip-path:inset(0 0 0 0);
    transition:clip-path .7s cubic-bezier(.22,.61,.21,1)}
  .xp-anim .encre:not(.est-tire){clip-path:inset(0 100% 0 0)}
  .xp-anim .encre::after{content:''; position:absolute; inset:0; pointer-events:none;
    opacity:0; transform:scaleX(0); transform-origin:left; border-radius:inherit;
    background:linear-gradient(90deg, transparent calc(100% - 48px), rgba(255,233,184,.4))}
  .xp-anim .encre.est-tire::after{animation:lisiere .7s cubic-bezier(.22,.61,.21,1) forwards}
  .encre{position:relative}

  @media (prefers-reduced-motion: reduce){
    .xp-anim .encre{clip-path:none!important}
    .epreuve::before{transform:none!important}
    .g-s6 .xp-cta::before{opacity:.55}
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
    ? `<div class="${classe} encre">\n${x.join('\n')}\n</div>` : x).join('\n');
}

export function renduBloc(b, defaut) {
  if (b.t === 'table') return `<div class="tab-roule encre" tabindex="0" role="region" aria-label="Comparatif production classique et Triaina">${b.html}</div>`;
  return defaut;
}

export function renduSection(groupe, s) {
  const env = (interne) => `<section class="xp-sec g-${groupe}">\n${interne}\n</section>`;
  if (groupe === 's4') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'epreuve');
    return env(interne.replace(/(<div class="epreuve[\s\S]*<\/div>)/, '<div class="epreuves">\n$1\n</div>'));
  }
  if (groupe === 's5') return env(groupeDepuis(s.rendus, s.blocs, ['h3'], 'paire'));
  if (groupe === 's6') {
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
    '.g-hero p, .xp-sec h2, .xp-sec h3, .xp-sec > p, .g-s1 ul, ' +
    '.tab-roule, .epreuves, .paire, .g-s6 .xp-cta'));
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      /* rattrapage : un saut de défilement imprime aussi tout ce qui précède */
      for (var j = 0; j <= cibles.indexOf(x.target); j++) {
        cibles[j].classList.add('est-tire');
        io.unobserve(cibles[j]);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  cibles.forEach(function (el) { io.observe(el); });
`;
