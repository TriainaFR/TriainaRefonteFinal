/**
 * agence-referencement-ia.mjs — « Le Verdict » : être reconnu par les
 * machines. Chaque objet important reçoit sa COCHE D'OR : un trait unique
 * (SVG stroke-dashoffset) qui SE TRACE dans un petit carré au coin quand
 * l'objet entre en scène — la validation par les IA. Décliné : cartes de
 * services, 5 étapes (les coches s'accumulent), cas clients, package
 * recommandé (coché d'office), CTA final (la grande coche + halo).
 * Aucun autre motif du site : pas de balayage, pas d'éclat, pas d'anneaux.
 */

const COCHE = `<span class="sceau-v" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 18 19 6.5"/></svg></span>`;

export const STYLE = `
  /* ── Le Verdict ── */
  .g-s0{padding-top:8.5rem; padding-bottom:1.5rem}
  .g-s0 p{font-family:ui-monospace,monospace; font-size:.66rem;
    letter-spacing:.2em; text-transform:uppercase; color:var(--bleu-c)}
  .g-s0 h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(2.3rem,5vw,3.9rem); line-height:1.08;
    max-width:24ch; margin-top:.9rem}
  .g-s0 h1 + p, .g-s0 h1 ~ p{font-family:var(--manrope); font-size:1.06rem;
    letter-spacing:0; text-transform:none; color:var(--brume); line-height:1.75;
    max-width:44rem; margin-top:1.1rem}

  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.6rem,3vw,2.3rem); margin-bottom:2rem}
  .xp-sec p{max-width:46rem; color:var(--brume); line-height:1.72; margin-top:.8rem}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff; font-size:1.12rem}
  .xp-sec h4{font-family:ui-monospace,monospace; font-weight:400; font-size:.62rem;
    letter-spacing:.2em; text-transform:uppercase; color:var(--lueur); margin-top:1rem}
  .xp-sec li{color:var(--brume); line-height:1.65; margin-top:.4rem;
    list-style:none; position:relative; padding-left:1.1rem; font-size:.94rem}
  .xp-sec li::before{content:''; position:absolute; left:0; top:.5em;
    width:6px; height:6px; border-radius:50%; background:rgba(96,165,250,.5)}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* ── la coche : le sceau du verdict ── */
  .sceau-v{position:absolute; right:0; top:0; width:26px; height:26px;
    border:1.5px solid rgba(96,165,250,.4); border-radius:7px;
    display:grid; place-items:center; transition:border-color .3s .35s}
  .sceau-v svg{width:15px; height:15px; fill:none; stroke:var(--lueur);
    stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round;
    stroke-dasharray:22; stroke-dashoffset:22; transition:stroke-dashoffset .4s ease-out .15s}
  .vu > .sceau-v{border-color:rgba(255,233,184,.55)}
  .vu > .sceau-v svg, body:not(.xp-anim) .sceau-v svg{stroke-dashoffset:0}
  body:not(.xp-anim) .sceau-v{border-color:rgba(255,233,184,.55)}

  /* cartes (services, cas, tarifs) */
  .vcarte{position:relative; padding:1.3rem 3rem 1.3rem 0;
    border-top:1px solid rgba(148,163,184,.14)}
  .vcarte h3{padding-right:.5rem}
  .vcarte p{font-size:.94rem}
  .g-s1 .vgrille{display:grid; grid-template-columns:1fr 1fr;
    gap:0 clamp(1.6rem,3vw,3rem)}
  @media(max-width:860px){.g-s1 .vgrille{grid-template-columns:1fr}}

  /* 5 étapes : les coches s'accumulent */
  .g-s2 .vcarte{max-width:46rem; border-top:0; padding-top:.4rem}
  .g-s2 .vcarte + .vcarte{margin-top:1.4rem}
  .g-s2 .vcarte::before{content:''; position:absolute; left:-1.1rem; top:.6rem;
    bottom:-1.4rem; width:1px; background:rgba(148,163,184,.14)}
  .g-s2 .vcarte:last-child::before{display:none}
  @media(max-width:700px){.g-s2 .vcarte::before{display:none}}

  /* cas clients : trois dossiers validés */
  .g-s3 .vgrille3{display:grid; grid-template-columns:repeat(3,1fr);
    gap:clamp(1.2rem,2.5vw,2.2rem)}
  @media(max-width:900px){.g-s3 .vgrille3{grid-template-columns:1fr}}
  .g-s3 .vcarte{border-top:2px solid rgba(96,165,250,.35)}

  /* tarifs : le package recommandé porte le grand sceau */
  .g-s4 .vgrille3{display:grid; grid-template-columns:repeat(3,1fr);
    gap:clamp(1.2rem,2.5vw,2.2rem); align-items:start}
  @media(max-width:900px){.g-s4 .vgrille3{grid-template-columns:1fr}}
  .g-s4 .vcarte{border:1px solid rgba(148,163,184,.16); border-radius:14px;
    padding:1.5rem 3.4rem 1.5rem 1.5rem}
  .g-s4 .vcarte .sceau-v{right:1rem; top:1rem}
  .g-s4 .xp-cta{margin-top:1.2rem}
  .g-s4 .xp-cta a{display:inline-flex; background:var(--bleu); color:#fff;
    font-weight:700; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase;
    padding:.85rem 1.5rem; border-radius:99px; text-decoration:none;
    transition:background .25s, color .25s}
  .g-s4 .xp-cta a:hover{background:var(--lueur); color:#0B1428}

  /* FAQ : paires visibles */
  .g-s5 .paire{max-width:46rem; margin-top:1.8rem; position:relative;
    padding-right:3rem}
  .g-s5 .paire h3{font-size:1.05rem}
  .g-s5 .paire p{margin-top:.5rem; font-size:.95rem}

  /* CTA final : le grand verdict */
  .g-s6{text-align:center; padding-bottom:3.5rem}
  .g-s6 h2{margin-bottom:1rem}
  .g-s6 p{margin-inline:auto}
  .g-s6 .grand-sceau{position:relative; width:64px; height:64px; margin:2rem auto 0;
    border:2px solid rgba(255,233,184,.5); border-radius:16px;
    display:grid; place-items:center}
  .g-s6 .grand-sceau::before{content:''; position:absolute; left:50%; top:50%;
    width:22rem; height:9rem; transform:translate(-50%,-50%); pointer-events:none;
    opacity:0; transition:opacity .8s;
    background:radial-gradient(closest-side, rgba(255,233,184,.24), transparent 70%)}
  .g-s6 .grand-sceau svg{width:34px; height:34px; fill:none; stroke:var(--lueur);
    stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round;
    stroke-dasharray:40; stroke-dashoffset:40; transition:stroke-dashoffset .6s ease-out .2s}
  .g-s6 .grand-sceau.vu::before, body:not(.xp-anim) .g-s6 .grand-sceau::before{opacity:.6}
  .g-s6 .grand-sceau.vu svg, body:not(.xp-anim) .g-s6 .grand-sceau svg{stroke-dashoffset:0}

  /* arrivées */
  .xp-anim .vr:not(.vu){opacity:0; transform:translateY(14px)}
  .xp-anim .vr{transition:opacity .55s, transform .55s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .sceau-v{border-color:rgba(255,233,184,.55)}
    .sceau-v svg, .g-s6 .grand-sceau svg{stroke-dashoffset:0}
    .g-s6 .grand-sceau::before{opacity:.6}
  }
`;

function groupeDepuis(rendus, blocs, tetes, classe, sceau) {
  const sortie = [];
  let carte = null;
  rendus.forEach((r, i) => {
    if (tetes.includes(blocs[i].t)) { if (carte) sortie.push(carte); carte = [r]; }
    else if (carte) carte.push(r);
    else sortie.push(r);
  });
  if (carte) sortie.push(carte);
  return sortie.map(x => Array.isArray(x)
    ? `<div class="${classe} vr">${sceau ? COCHE : ''}\n${x.join('\n')}\n</div>` : x).join('\n');
}

const GRAND_SCEAU = `<div class="grand-sceau vr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 18 19 6.5"/></svg></div>`;

export function renduSection(groupe, s) {
  const enGrille = (classe, grille) => {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], classe, true);
    return `<section class="xp-sec g-${groupe}">\n${interne.replace(new RegExp('(<div class="' + classe + '[\\s\\S]*</div>)'), `<div class="${grille}">\n$1\n</div>`)}\n</section>`;
  };
  if (groupe === 's1') return enGrille('vcarte', 'vgrille');
  if (groupe === 's2')
    return `<section class="xp-sec g-s2">\n${groupeDepuis(s.rendus, s.blocs, ['h3'], 'vcarte', true)}\n</section>`;
  if (groupe === 's3') return enGrille('vcarte', 'vgrille3');
  if (groupe === 's4') return enGrille('vcarte', 'vgrille3');
  if (groupe === 's5')
    return `<section class="xp-sec g-s5">\n${groupeDepuis(s.rendus, s.blocs, ['h3'], 'paire', true)}\n</section>`;
  if (groupe === 's6')
    return `<section class="xp-sec g-s6">\n${s.interne}\n${GRAND_SCEAU}\n</section>`;
  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.vcarte, .paire, .grand-sceau, .xp-sec h2, .g-s6 p, .g-s6 .xp-cta'));
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
  cibles.forEach(function (el) { el.classList.add('vr'); io.observe(el); });
`;
