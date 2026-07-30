/**
 * agence-geo-paris.mjs — « La Boussole » : le GEO a changé le nord de la
 * recherche. Chaque tête de section porte une petite ROSE — deux aiguilles
 * (or/bleu) qui PIVOTENT et se fixent à l'entrée (rotation -120°→0 avec un
 * léger dépassement) : l'orientation vers le nouveau nord, les IA. Déclinée :
 * les étapes de la méthodologie (chaque aiguille se cale tour à tour), la
 * FAQ (pointe statique), le CTA final (grande rose fixée + halo).
 * Aucun motif emprunté : personne d'autre ne fait pivoter quoi que ce soit.
 */

const ROSE = `<span class="rose" aria-hidden="true"><i class="n"></i><i class="s"></i></span>`;

export const STYLE = `
  /* ── La Boussole ── */
  .g-s0{padding-top:8.5rem; padding-bottom:1.5rem}
  .g-s0 p{max-width:44rem; color:var(--brume); line-height:1.75; margin-top:1rem}
  .g-s0 p:first-child{font-family:ui-monospace,monospace; font-size:.66rem;
    letter-spacing:.2em; text-transform:uppercase; color:var(--bleu-c); margin-top:0}
  .g-s0 h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(2.3rem,5vw,3.9rem); line-height:1.08;
    max-width:22ch; margin-top:.9rem}

  /* la rose : deux aiguilles qui se fixent */
  .rose{position:relative; display:inline-block; width:22px; height:22px;
    margin-right:.85rem; vertical-align:-3px}
  .rose::before{content:''; position:absolute; inset:0; border-radius:50%;
    border:1px solid rgba(96,165,250,.35)}
  .rose i{position:absolute; left:50%; top:50%; width:0; height:0;
    border-left:3px solid transparent; border-right:3px solid transparent;
    transform-origin:50% 100%;
    transition:transform .7s cubic-bezier(.2,1.25,.35,1)}
  .rose .n{border-bottom:8px solid var(--lueur);
    transform:translate(-50%,-100%) rotate(0deg)}
  .rose .s{border-top:8px solid rgba(96,165,250,.7); transform-origin:50% 0;
    transform:translate(-50%,0) rotate(0deg)}
  .xp-anim .bs:not(.vu) .rose .n{transform:translate(-50%,-100%) rotate(-120deg)}
  .xp-anim .bs:not(.vu) .rose .s{transform:translate(-50%,0) rotate(-120deg)}

  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.2rem); margin-bottom:1.6rem}
  .xp-sec p{max-width:46rem; color:var(--brume); line-height:1.72; margin-top:.8rem}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff; font-size:1.1rem;
    margin-top:1.5rem}
  .xp-sec li{color:var(--brume); line-height:1.65; margin-top:.4rem;
    list-style:none; position:relative; padding-left:1.1rem; font-size:.94rem}
  .xp-sec ul li::before{content:''; position:absolute; left:0; top:.48em;
    width:0; height:0; border-top:3px solid transparent;
    border-bottom:3px solid transparent; border-left:6px solid rgba(255,233,184,.6)}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* GEO vs SEO (s1) : deux caps face à face */
  .g-s1 .caps{display:grid; grid-template-columns:1fr 1fr;
    gap:clamp(1.4rem,3vw,2.6rem)}
  @media(max-width:820px){.g-s1 .caps{grid-template-columns:1fr}}
  .cap-carte{border-top:2px solid rgba(96,165,250,.35); padding-top:1rem}
  .cap-carte h3{margin-top:0}
  .cap-carte p{font-size:.94rem}

  /* méthodologie (s2) : chaque étape se cale sur son cap */
  .g-s2 .etape{position:relative; max-width:46rem; margin-top:1.7rem;
    padding-left:2.4rem}
  .g-s2 .etape .rose{position:absolute; left:0; top:.15rem; margin:0}
  .g-s2 .etape h3{margin-top:0}
  .g-s2 .etape p{margin-top:.5rem; font-size:.95rem}

  /* FAQ (s3) : paires visibles, pointe fixe */
  .g-s3 .paire{max-width:46rem; margin-top:1.8rem; position:relative;
    padding-left:1.2rem}
  .g-s3 .paire::before{content:''; position:absolute; left:0; top:.42em;
    width:0; height:0; border-top:4px solid transparent;
    border-bottom:4px solid transparent; border-left:8px solid rgba(255,233,184,.6)}
  .g-s3 .paire h3{margin-top:0; font-size:1.05rem}
  .g-s3 .paire p{margin-top:.5rem; font-size:.95rem}

  /* ressources (s4) */
  .g-s4 li{font-size:.95rem}

  /* CTA final (s5) : la grande rose fixée */
  .g-s5{text-align:center; padding-bottom:3.5rem}
  .g-s5 p{margin-inline:auto}
  .g-s5 .grande-rose{position:relative; width:64px; height:64px; margin:2rem auto 0}
  .g-s5 .grande-rose::before{content:''; position:absolute; inset:0;
    border-radius:50%; border:1.5px solid rgba(255,233,184,.45)}
  .g-s5 .grande-rose::after{content:''; position:absolute; left:50%; top:50%;
    width:22rem; height:9rem; transform:translate(-50%,-50%); pointer-events:none;
    opacity:0; transition:opacity .8s;
    background:radial-gradient(closest-side, rgba(255,233,184,.24), transparent 70%)}
  .g-s5 .grande-rose i{position:absolute; left:50%; top:50%; width:0; height:0;
    border-left:8px solid transparent; border-right:8px solid transparent;
    transform-origin:50% 100%;
    transition:transform .9s cubic-bezier(.2,1.25,.35,1)}
  .g-s5 .grande-rose .n{border-bottom:24px solid var(--lueur);
    transform:translate(-50%,-100%) rotate(0deg)}
  .g-s5 .grande-rose .s{border-top:24px solid rgba(96,165,250,.7);
    transform-origin:50% 0; transform:translate(-50%,0) rotate(0deg)}
  .xp-anim .g-s5 .grande-rose.bs:not(.vu) .n{transform:translate(-50%,-100%) rotate(-150deg)}
  .xp-anim .g-s5 .grande-rose.bs:not(.vu) .s{transform:translate(-50%,0) rotate(-150deg)}
  .g-s5 .grande-rose.vu::after, body:not(.xp-anim) .g-s5 .grande-rose::after{opacity:.6}
  .g-s5 .xp-cta{margin-top:1.6rem}
  .g-s5 .xp-cta a{display:inline-flex; background:var(--bleu); color:#fff;
    font-weight:800; font-size:.82rem; letter-spacing:.13em; text-transform:uppercase;
    padding:1.15rem 2.2rem; border-radius:99px; text-decoration:none;
    transition:background .25s, color .25s, transform .2s}
  .g-s5 .xp-cta a:hover{background:var(--lueur); color:#0B1428; transform:translateY(-2px)}

  /* arrivées */
  .xp-anim .bv:not(.vu){opacity:0; transform:translateY(14px)}
  .xp-anim .bv{transition:opacity .55s, transform .55s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .rose i, .g-s5 .grande-rose i{transform-origin:50% 100%}
    .rose .n{transform:translate(-50%,-100%) rotate(0)!important}
    .rose .s{transform:translate(-50%,0) rotate(0)!important}
    .g-s5 .grande-rose .n{transform:translate(-50%,-100%) rotate(0)!important}
    .g-s5 .grande-rose .s{transform:translate(-50%,0) rotate(0)!important}
    .g-s5 .grande-rose::after{opacity:.6}
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
    ? `<div class="${classe} bv">\n${x.join('\n')}\n</div>` : x).join('\n');
}

const GRANDE_ROSE = `<div class="grande-rose bs" aria-hidden="true"><i class="n"></i><i class="s"></i></div>`;

export function renduBloc(b, defaut) {
  if (b.t === 'h2') return `<h2 class="bs">${ROSE}<span>${b.html}</span></h2>`;
  return defaut;
}

export function renduSection(groupe, s) {
  if (groupe === 's1') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'cap-carte');
    return `<section class="xp-sec g-s1">\n${interne.replace(/(<div class="cap-carte[\s\S]*<\/div>)/, '<div class="caps">\n$1\n</div>')}\n</section>`;
  }
  if (groupe === 's2') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'etape');
    return `<section class="xp-sec g-s2">\n${interne.replace(/<div class="etape bv">\n<h3>/g, `<div class="etape bv bs">\n${ROSE}<h3>`)}\n</section>`;
  }
  if (groupe === 's3')
    return `<section class="xp-sec g-s3">\n${groupeDepuis(s.rendus, s.blocs, ['h3'], 'paire')}\n</section>`;
  if (groupe === 's5')
    return `<section class="xp-sec g-s5">\n${s.interne}\n${GRANDE_ROSE}\n</section>`.replace(`\n${GRANDE_ROSE}\n</section>`, `\n${GRANDE_ROSE}\n</section>`);
  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    'h2.bs, .cap-carte, .etape, .g-s3 .paire, .grande-rose, .xp-sec > p, .xp-sec ul, .xp-cta'));
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
  cibles.forEach(function (el) { el.classList.add('bv'); io.observe(el); });
`;
