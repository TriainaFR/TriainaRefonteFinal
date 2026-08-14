/**
 * agence-seo-paris.mjs — page /agence-seo-paris, ENTIÈREMENT REMPLACÉE le
 * 10/08/2026 à la demande de Lucas : contenu, title, metas, Open Graph,
 * Twitter, metas GEO/LLM et les 4 schémas (LocalBusiness, FAQPage,
 * BreadcrumbList, Person) viennent de son code —
 * tools/sources/agence-seo-paris.html, dont l'en-tête documente les
 * corrections apportées (canonical en www conservé comme demandé, téléphone
 * bouchon retiré, slug de blog mort réparé, durée du cas Travel alignée sur
 * les deux autres pages qui le publient).
 *
 * L'ancien module « La Ville Lumière » habillait le contenu capturé de
 * l'ancien site ; il part avec lui. Son `transformeSchemas` retirait un
 * `aggregateRating` sans avis réels — le nouveau code de Lucas n'en déclare
 * pas, la précaution devient sans objet.
 *
 * Design : « L'Escargot ». Paris se lit en spirale — le 1ᵉʳ au centre, le
 * 20ᵉ au bout du colimaçon — et c'est exactement le sujet de la page : la
 * concurrence arrondissement par arrondissement. Le hero trace ce plan, les
 * vingt numéros s'allument dans l'ordre, le 16ᵉ reste en or (l'adresse
 * déclarée par le LocalBusiness). Le motif se prolonge ensuite : les
 * secteurs portent leurs codes postaux, les cinq phases suivent un rail
 * gradué, les cas clients ouvrent sur leur arrondissement.
 *
 * Sans JS ou en motion réduite : le plan est tracé, tous les numéros
 * allumés, tout le texte visible.
 */
import { readFileSync } from 'node:fs';

/* ══ La tête : les signaux de Lucas, à l'octet près ══ */
const SOURCE = readFileSync(new URL('../sources/agence-seo-paris.html', import.meta.url), 'utf8');
export const TETE = SOURCE
  .slice(SOURCE.indexOf('<!-- SEO primaire -->'), SOURCE.indexOf('</head>'))
  .trim();

/**
 * Le plan en colimaçon. Spirale d'Archimède adoucie : le pas est resserré au
 * centre (les arrondissements centraux sont petits) puis s'ouvre — c'est la
 * forme réelle de l'escargot parisien, pas une spirale régulière.
 */
function plan() {
  const cx = 160, cy = 160, N = 20;
  /* exposant < 1 : le pas s'ouvre vite au centre puis se resserre. Sans lui,
     les six premiers arrondissements se chevauchaient au milieu. */
  const rayon = (t) => 34 + 102 * Math.pow(t, 0.55);
  const angle = (t) => -Math.PI / 2 + t * 3.7 * Math.PI;
  const point = (t) => [cx + rayon(t) * Math.cos(angle(t)), cy + rayon(t) * Math.sin(angle(t))];

  const trace = [];
  for (let i = 0; i <= 260; i++) {
    const [x, y] = point(i / 260);
    trace.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  const bornes = [];
  for (let i = 0; i < N; i++) {
    const [x, y] = point(i / (N - 1));
    const or = i === 15;                       // le 16ᵉ : l'adresse de Triaina
    bornes.push(
      `<g class="arr${or ? ' arr-or' : ''}" style="--i:${i}">`
      + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10.5"/>`
      + `<text x="${x.toFixed(1)}" y="${(y + 3.2).toFixed(1)}">${i + 1}</text></g>`);
  }

  return `<figure class="plan ln" aria-hidden="true">
  <svg viewBox="0 0 320 320" role="presentation">
    <path class="pl-trace" d="${trace.join(' ')}"/>
    ${bornes.join('\n    ')}
  </svg>
  <figcaption>Les 20 arrondissements — Triaina est au 16ᵉ</figcaption>
</figure>`;
}

export const STYLE = `
  /* ── L'Escargot ── */

  /* corps commun */
  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.35rem); margin-bottom:1.5rem;
    position:relative; padding-left:1.9rem}
  .xp-sec h2::before{content:''; position:absolute; left:0; top:.32em;
    width:.85rem; height:.85rem; border:1.5px solid var(--lueur);
    border-radius:50%; transition:transform .55s cubic-bezier(.2,1.25,.35,1), opacity .55s}
  .xp-sec h2::after{content:''; position:absolute; left:.3rem; top:.62em;
    width:.25rem; height:.25rem; border-radius:50%; background:var(--lueur)}
  .xp-anim .xp-sec h2:not(.vu)::before{transform:scale(.3) rotate(-90deg); opacity:0}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.02rem,1.45vw,1.2rem); margin-top:1.8rem}
  .xp-sec p{max-width:47rem; color:var(--brume); line-height:1.75; margin-top:.9rem}
  .xp-sec p strong{color:#EAF0FF}
  .xp-sec li{color:var(--brume); line-height:1.7; margin-top:.5rem; font-size:.95rem;
    list-style:none; position:relative; padding-left:1.3rem}
  .xp-sec ul li::before{content:''; position:absolute; left:0; top:.55em;
    width:6px; height:6px; border-radius:50%; border:1px solid rgba(96,165,250,.8)}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* balayage doré de la famille sur les chiffres qui portent l'argument */
  .hl{background-image:linear-gradient(105deg, rgba(255,233,184,.2), rgba(255,233,184,.11));
    background-repeat:no-repeat; background-size:100% 100%;
    -webkit-box-decoration-break:clone; box-decoration-break:clone; color:var(--lueur)}
  .xp-anim .hl{background-size:0% 100%; color:inherit;
    transition:background-size .6s cubic-bezier(.2,.7,.2,1) .15s, color .6s ease .15s}
  .xp-anim .vu .hl{background-size:100% 100%; color:var(--lueur)}

  /* ── hero : le plan en colimaçon ── */
  .g-hero{display:grid; grid-template-columns:minmax(0,1fr) 22rem; gap:3rem;
    align-items:center}
  .g-hero h1{grid-column:1; margin:0}
  .g-hero > p{grid-column:1; font-size:clamp(1rem,1.35vw,1.14rem); max-width:44rem}
  .plan{grid-column:2; grid-row:1 / span 2; margin:0; justify-self:center}
  .plan svg{width:min(22rem,72vw); height:auto; overflow:visible}
  .pl-trace{fill:none; stroke:rgba(96,165,250,.45); stroke-width:1.2;
    stroke-linecap:round; stroke-dasharray:1400; stroke-dashoffset:0}
  .xp-anim .plan:not(.vu) .pl-trace{stroke-dashoffset:1400}
  .xp-anim .plan .pl-trace{transition:stroke-dashoffset 2.4s cubic-bezier(.3,.7,.2,1)}
  .arr circle{fill:rgba(13,22,44,.9); stroke:rgba(96,165,250,.55); stroke-width:1}
  .arr text{fill:#9FB6DD; font-family:ui-monospace,monospace; font-size:8.5px;
    text-anchor:middle; letter-spacing:.02em}
  .arr-or circle{stroke:var(--lueur); stroke-width:1.6; fill:rgba(255,233,184,.1)}
  .arr-or text{fill:var(--lueur); font-weight:700}
  .xp-anim .plan:not(.vu) .arr{opacity:0; transform:scale(.6)}
  .xp-anim .plan .arr{transform-box:fill-box; transform-origin:center;
    transition:opacity .45s ease calc(.35s + var(--i)*.085s),
               transform .45s cubic-bezier(.2,1.3,.35,1) calc(.35s + var(--i)*.085s)}
  .xp-anim .plan.vu .arr-or circle{animation:battOr 2.6s ease-in-out 2.6s infinite}
  @keyframes battOr{0%,100%{filter:none}50%{filter:drop-shadow(0 0 7px rgba(255,233,184,.75))}}
  .plan figcaption{margin-top:1rem; text-align:center;
    font-family:ui-monospace,monospace; font-size:.6rem; letter-spacing:.16em;
    text-transform:uppercase; color:rgba(148,163,184,.7)}

  /* ── cartes de service (s2, s3) ── */
  .fiche{margin-top:1.6rem; padding:1.4rem 1.55rem; max-width:52rem;
    border:1px solid rgba(96,165,250,.18); border-radius:14px;
    background:rgba(16,26,51,.42); position:relative;
    transition:border-color .35s, transform .35s}
  .fiche::before{content:''; position:absolute; left:0; top:1.5rem; width:2px;
    height:0; background:linear-gradient(var(--lueur), transparent);
    border-radius:2px; transition:height .7s cubic-bezier(.22,.9,.24,1) .1s}
  .fiche.vu::before, body:not(.xp-anim) .fiche::before{height:calc(100% - 3rem)}
  .fiche:hover{border-color:rgba(255,233,184,.4); transform:translateY(-3px)}
  .fiche h3{margin-top:0}

  /* ── secteurs (s5) : quatre quartiers ── */
  .quartiers{display:grid; grid-template-columns:repeat(2,minmax(0,1fr));
    gap:1.1rem; margin-top:1.5rem; max-width:56rem}
  .quartier{margin:0; padding:1.5rem 1.6rem; border-radius:16px;
    border:1px solid rgba(96,165,250,.2); background:rgba(13,22,44,.55);
    position:relative; overflow:hidden; transition:border-color .35s, transform .35s}
  .quartier::after{content:''; position:absolute; right:-3.5rem; top:-3.5rem;
    width:9rem; height:9rem; border-radius:50%; pointer-events:none;
    border:1px solid rgba(96,165,250,.16); transition:border-color .5s, transform .6s}
  .quartier:hover{border-color:rgba(255,233,184,.45); transform:translateY(-4px)}
  .quartier:hover::after{border-color:rgba(255,233,184,.4); transform:scale(1.12)}
  .quartier h3{margin-top:0}
  .quartier p{margin-top:.7rem; font-size:.93rem; max-width:none}

  /* ── phases (s6) : le rail gradué ── */
  .g-s6{counter-reset:phase}
  .phase{counter-increment:phase; position:relative; padding-left:3.6rem;
    max-width:47rem; margin-top:2rem}
  .phase h3{margin-top:0}
  .phase p{margin-top:.5rem}
  .phase::before{content:counter(phase,decimal-leading-zero); position:absolute;
    left:0; top:0; width:2.5rem; height:2.5rem; display:grid; place-items:center;
    border:1px solid rgba(96,165,250,.45); border-radius:50%;
    font-family:ui-monospace,monospace; font-size:.72rem; color:var(--bleu-c);
    background:rgba(13,22,44,.9); transition:border-color .45s, color .45s, box-shadow .45s}
  .phase.vu::before{border-color:rgba(255,233,184,.85); color:var(--lueur);
    box-shadow:0 0 20px rgba(255,233,184,.2)}
  .phase::after{content:''; position:absolute; left:1.25rem; top:2.8rem;
    bottom:-1.8rem; width:1px; background:linear-gradient(rgba(255,233,184,.5), rgba(96,165,250,.15));
    transform:scaleY(0); transform-origin:top;
    transition:transform .8s cubic-bezier(.22,.9,.24,1) .25s}
  .phase.vu::after{transform:scaleY(1)}
  .phase:last-of-type::after{content:none}
  body:not(.xp-anim) .phase::after{transform:scaleY(1)}

  /* ── cas clients (s7) ── */
  .dossier{margin-top:1.5rem; padding:1.45rem 1.6rem; max-width:52rem;
    border:1px solid rgba(96,165,250,.18); border-left:3px solid rgba(255,233,184,.55);
    border-radius:14px; background:rgba(16,26,51,.42)}
  .dossier h3{margin-top:0; color:var(--lueur); font-size:1.02rem}
  .dossier p{margin-top:.5rem; font-size:.95rem}

  /* ── comparatif (s8) : tableau défilant ── */
  .defile{overflow-x:auto; margin-top:1.5rem; border:1px solid rgba(96,165,250,.16);
    border-radius:14px; max-width:60rem}
  .defile table{border-collapse:collapse; width:100%; min-width:44rem; font-size:.92rem}
  .defile caption{caption-side:top; text-align:left; padding:.85rem 1rem .35rem;
    font-family:ui-monospace,monospace; font-size:.62rem; letter-spacing:.16em;
    text-transform:uppercase; color:var(--brume)}
  .defile th{font-family:ui-monospace,monospace; font-weight:400; font-size:.62rem;
    letter-spacing:.14em; text-transform:uppercase; color:var(--bleu-c);
    text-align:left; padding:.9rem 1rem; border-bottom:1px solid rgba(96,165,250,.22)}
  .defile td{padding:.85rem 1rem; border-bottom:1px solid rgba(96,165,250,.1);
    color:var(--brume); vertical-align:top}
  .defile tr:last-child td{border-bottom:0}
  /* la colonne Triaina se détache */
  .defile td:nth-child(2){color:var(--lueur); font-weight:600}
  .defile th:nth-child(2){color:var(--lueur)}
  .defile tbody tr{transition:background .25s}
  .defile tbody tr:hover{background:rgba(37,99,235,.08)}
  .xp-anim .defile tbody tr{opacity:0; transform:translateX(-8px);
    transition:opacity .45s, transform .45s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .defile.vu tbody tr{opacity:1; transform:none}
  .xp-anim .defile.vu tbody tr:nth-child(2){transition-delay:.09s}
  .xp-anim .defile.vu tbody tr:nth-child(3){transition-delay:.18s}
  .xp-anim .defile.vu tbody tr:nth-child(4){transition-delay:.27s}
  .xp-anim .defile.vu tbody tr:nth-child(5){transition-delay:.36s}
  .xp-anim .defile.vu tbody tr:nth-child(6){transition-delay:.45s}

  /* ── FAQ (s9) ── */
  .qr{max-width:47rem; margin-top:1.9rem}
  .qr h3{position:relative; padding-left:1.7rem; margin-top:0; font-size:1.02rem;
    color:#E2E8F0}
  .qr h3::before{content:''; position:absolute; left:0; top:.3em; width:.7rem;
    height:.7rem; border-radius:50%; border:1.5px solid rgba(255,233,184,.6)}
  .qr p{margin-top:.6rem; padding-left:1.7rem; font-size:.95rem}

  /* ── CTA (s9) + liens (s10) ── */
  .g-s10{position:relative}
  .g-s10::before{content:''; position:absolute; left:12%; top:0; width:24rem;
    height:13rem; pointer-events:none; opacity:0; transition:opacity 1s;
    background:radial-gradient(closest-side, rgba(255,233,184,.15), transparent 70%)}
  .g-s10.allume::before, body:not(.xp-anim) .g-s10::before{opacity:1}
  .g-s10 p:last-child a{display:inline-flex; align-items:center; gap:.6rem;
    background:var(--bleu); color:#fff; font-weight:800; font-size:.8rem;
    letter-spacing:.13em; text-transform:uppercase; padding:1.05rem 2.1rem;
    border-radius:99px; text-decoration:none; margin-top:.6rem;
    transition:background .25s, color .25s, transform .2s}
  .g-s10 p:last-child a:hover{background:var(--lueur); color:#0B1428; transform:translateY(-2px)}
  .g-s11 ul{display:grid; grid-template-columns:repeat(2,minmax(0,1fr));
    gap:.55rem; max-width:48rem; margin-top:1.2rem}
  .g-s11 li{padding:.8rem 1rem; margin:0; border-radius:10px;
    border:1px solid rgba(96,165,250,.2); background:rgba(13,22,44,.5);
    transition:border-color .3s, transform .3s}
  .g-s11 li::before{content:none}
  .g-s11 li:hover{border-color:rgba(255,233,184,.45); transform:translateX(3px)}
  .g-s11 li a{text-decoration:none; color:#DCE6FF}
  .g-s11 li a:hover{color:var(--lueur)}
  .g-s11 .signature{margin-top:2.2rem; padding-top:1.2rem; max-width:52rem;
    border-top:1px solid rgba(148,163,184,.16); font-size:.9rem}
  .g-s11 .signature strong{color:#EAF0FF}

  /* arrivées */
  .xp-anim .ln:not(.vu){opacity:0; transform:translateY(12px)}
  .xp-anim .ln{transition:opacity .5s, transform .5s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .plan.ln:not(.vu){opacity:1; transform:none}   /* le plan a sa propre entrée */

  @media(max-width:980px){
    .g-hero{grid-template-columns:minmax(0,1fr)}
    .g-hero h1, .g-hero > p{grid-column:1}
    .plan{grid-column:1; grid-row:auto; margin-top:2rem}
    .quartiers{grid-template-columns:1fr}
  }
  @media(max-width:640px){
    .g-s11 ul{grid-template-columns:1fr}
    .fiche, .quartier, .dossier{padding:1.15rem 1.1rem}
    .phase{padding-left:3.1rem}
  }
  @media (prefers-reduced-motion: reduce){
    .pl-trace{stroke-dashoffset:0}
    .arr{opacity:1; transform:none}
    .arr-or circle{animation:none}
    .phase::after{transform:scaleY(1)}
    .g-s10::before{opacity:1}
  }
`;

/* chiffres et formules qui portent l'argument (texte inchangé, enveloppé) */
const LUMIERES = [
  '22 200 recherches mensuelles',
  '15 à 25 % des clics',
  '80 % des sites parisiens sont invisibles aux IA',
  'accélère les citations IA de 300 %',
];

export function renduBloc(b, defaut, groupe) {
  /* le comparatif : conteneur défilant, sinon il déborde sous 768 px */
  if (b.t === 'table')
    return `<div class="defile" tabindex="0" role="region" aria-label="Comparatif — défilement horizontal possible">${b.html}</div>`;
  if (b.t === 'p') {
    let html = b.html;
    for (const l of LUMIERES) {
      if (html.includes(l) && !html.includes('class="hl"'))
        html = html.replace(l, `<span class="hl">${l}</span>`);
    }
    if (html !== b.html) return `<p>${html}</p>`;
  }
  return defaut;
}

/* regroupe « une tête + ce qui la suit » en cartes, sans toucher au texte */
function cartes(rendus, blocs, tetes, classe) {
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

  /* le plan en colimaçon se pose à côté du titre */
  if (groupe === 'hero') return env([...s.rendus, plan()].join('\n'));

  /* services et GEO : une carte par sous-titre */
  if (groupe === 's2' || groupe === 's3')
    return env(cartes(s.rendus, s.blocs, ['h3'], 'fiche'));

  /* secteurs : quatre quartiers en grille */
  if (groupe === 's5') {
    const [titre, ...reste] = s.rendus;
    const grille = cartes(reste, s.blocs.slice(1), ['h3'], 'quartier');
    return env(`${titre}\n<div class="quartiers">\n${grille}\n</div>`);
  }

  /* les cinq phases : un sous-titre + son texte = une étape du rail */
  if (groupe === 's6') return env(cartes(s.rendus, s.blocs, ['h3'], 'phase'));

  /* les cas clients : un sous-titre + son texte = un dossier */
  if (groupe === 's7') return env(cartes(s.rendus, s.blocs, ['h3'], 'dossier'));

  /* FAQ : paires question/réponse */
  if (groupe === 's9') return env(cartes(s.rendus, s.blocs, ['h3'], 'qr'));

  /* liens de fin + signature */
  if (groupe === 's11') {
    return env(s.rendus.map((r, i) => {
      const b = s.blocs[i];
      if (b.t === 'p' && /^Auteure de cette page/.test(b.html.replace(/<[^>]*>/g, '').trim()))
        return `<p class="signature">${b.html}</p>`;
      return r;
    }).join('\n'));
  }

  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.plan, .xp-sec h2, .xp-sec h3, .xp-sec > p, .xp-sec > ul, ' +
    '.fiche, .quartier, .phase, .dossier, .defile, .qr, .g-s11 .signature'));
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

  /* le halo du CTA s'allume à l'arrivée */
  var cta = document.querySelector('.g-s10');
  if (cta) new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) { if (x.isIntersecting) cta.classList.add('allume'); });
  }, { threshold: .25 }).observe(cta);`;
