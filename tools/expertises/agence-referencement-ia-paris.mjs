/**
 * agence-referencement-ia-paris.mjs — « Les Quatre Voix » : les IA parlent,
 * la marque doit être dans leurs voix. Chaque tête de section porte un petit
 * ÉGALISEUR (4 barres verticales fines) qui joue une seule mesure à l'entrée
 * (scaleY en cascade) puis se fige, dégradé bleu→or. Décliné : les 4 moteurs
 * (mini-égaliseur par carte), la méthode en 5 temps (barres en escalier),
 * la FAQ (barre unique). Aucun motif emprunté : personne d'autre n'a de
 * barres verticales animées.
 */

const EQ = `<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`;

export const STYLE = `
  /* ── Les Quatre Voix ── */
  .g-s0{padding-top:8.5rem; padding-bottom:1.5rem}
  .g-s0 p{max-width:44rem; color:var(--brume); line-height:1.75; margin-top:1rem}
  .g-s0 p:first-child{font-family:ui-monospace,monospace; font-size:.66rem;
    letter-spacing:.2em; text-transform:uppercase; color:var(--bleu-c); margin-top:0}
  /* Le second titre du hero était un titre de niveau 1 hérité de l'ancien site :
     la page en servait donc deux. Passé en niveau 2 pour la sémantique, il garde
     ici l'allure du hero — la correction est SEO, elle ne déplace rien à l'écran.
     (Aucune balise littérale dans ce commentaire : elle ouvrirait un faux titre
     et fausserait toute extraction Hn en aval.) */
  /* La règle .xp-sec h2 du socle famille a la même spécificité et est déclarée
     plus bas : il faut donc .xp-sec.g-s0 h2 pour reprendre la main sur ce seul
     titre, sinon le hero se retrouve en 24px avec le filet des sections.
     (Pas de backtick dans ce commentaire : il fermerait le template literal.) */
  .g-s0 h1, .xp-sec.g-s0 h2{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(2.3rem,5vw,3.9rem); line-height:1.08;
    max-width:22ch; margin-top:.9rem; display:block; margin-bottom:0}
  .xp-sec.g-s0 h2::before{display:none}

  /* l'égaliseur : la signature */
  .eq{display:inline-flex; align-items:flex-end; gap:3px; height:20px;
    margin-right:.8rem; vertical-align:baseline}
  .eq i{width:4px; border-radius:2px 2px 0 0; transform-origin:bottom;
    background:linear-gradient(180deg, var(--lueur), var(--bleu-c));
    transition:transform .5s cubic-bezier(.22,.9,.24,1)}
  .eq i:nth-child(1){height:9px}  .eq i:nth-child(2){height:20px}
  .eq i:nth-child(3){height:13px} .eq i:nth-child(4){height:17px}
  .xp-anim .veq:not(.vu) .eq i{transform:scaleY(.15)}
  .veq.vu .eq i:nth-child(2){transition-delay:.08s}
  .veq.vu .eq i:nth-child(3){transition-delay:.16s}
  .veq.vu .eq i:nth-child(4){transition-delay:.24s}

  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.2rem); margin-bottom:1.6rem;
    display:flex; align-items:baseline}
  .xp-sec p{max-width:46rem; color:var(--brume); line-height:1.72; margin-top:.8rem}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff; font-size:1.1rem;
    margin-top:1.5rem}
  .xp-sec li{color:var(--brume); line-height:1.65; margin-top:.4rem;
    list-style:none; position:relative; padding-left:1.15rem; font-size:.94rem}
  .xp-sec ul li::before{content:''; position:absolute; left:0; top:.42em;
    width:4px; height:11px; border-radius:2px;
    background:linear-gradient(180deg, rgba(255,233,184,.7), rgba(96,165,250,.6))}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* les 4 moteurs (s3) : quatre voix côte à côte */
  .g-s3 .voix-grille{display:grid; grid-template-columns:1fr 1fr;
    gap:clamp(1.2rem,2.5vw,2rem); margin-top:.6rem}
  @media(max-width:860px){.g-s3 .voix-grille{grid-template-columns:1fr}}
  .voix{position:relative; border:1px solid rgba(148,163,184,.16);
    border-radius:14px; padding:1.3rem 1.4rem;
    background:rgba(11,20,40,.55); transition:border-color .4s}
  .voix.vu{border-color:rgba(96,165,250,.35)}
  .voix h3{margin-top:0; display:flex; align-items:baseline}
  .voix p{font-size:.93rem}

  /* la méthode (s6) : l'escalier des 5 temps sur une <ol> */
  .g-s6 ol{counter-reset:temps; max-width:46rem; margin-top:.4rem; padding:0}
  .g-s6 ol li{counter-increment:temps; padding:1rem 0 1rem 3.4rem; margin:0;
    border-bottom:1px solid rgba(148,163,184,.14); font-size:.97rem}
  .g-s6 ol li::before{content:counter(temps, decimal-leading-zero); width:auto;
    height:auto; background:none; left:0; top:1rem; position:absolute;
    font-family:ui-monospace,monospace; font-size:1.2rem; color:transparent;
    -webkit-text-stroke:1px rgba(96,165,250,.55);
    transition:color .45s, -webkit-text-stroke-color .45s}
  @supports not (-webkit-text-stroke:1px #000){.g-s6 ol li::before{color:rgba(96,165,250,.6)}}
  .g-s6 ol li.vu::before, body:not(.xp-anim) .g-s6 ol li::before{
    color:var(--lueur); -webkit-text-stroke-color:transparent}

  /* FAQ : paires visibles à barre unique */
  .g-s8 .paire{max-width:46rem; margin-top:1.8rem; position:relative;
    padding-left:1.15rem}
  .g-s8 .paire::before{content:''; position:absolute; left:0; top:.3rem;
    width:4px; height:1.15rem; border-radius:2px; transform-origin:top;
    background:linear-gradient(180deg, var(--lueur), var(--bleu-c));
    transition:transform .5s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .g-s8 .paire:not(.vu)::before{transform:scaleY(.2)}
  .g-s8 .paire h3{margin-top:0; font-size:1.05rem}
  .g-s8 .paire p{margin-top:.5rem; font-size:.95rem}

  /* sources + CTA final (s9) */
  .g-s9{padding-bottom:3.5rem}
  .g-s9 .xp-cta{position:relative; display:inline-block; margin-top:1.6rem}
  .g-s9 .xp-cta::before{content:''; position:absolute; left:50%; top:50%;
    width:22rem; height:9rem; transform:translate(-50%,-50%); pointer-events:none;
    opacity:0; transition:opacity .8s;
    background:radial-gradient(closest-side, rgba(255,233,184,.24), transparent 70%)}
  .g-s9 .xp-cta.vu::before, body:not(.xp-anim) .g-s9 .xp-cta::before{opacity:.55}
  .g-s9 .xp-cta a{display:inline-flex; background:var(--bleu); color:#fff;
    font-weight:800; font-size:.82rem; letter-spacing:.13em; text-transform:uppercase;
    padding:1.15rem 2.2rem; border-radius:99px; text-decoration:none;
    transition:background .25s, color .25s, transform .2s; position:relative}
  .g-s9 .xp-cta a:hover{background:var(--lueur); color:#0B1428; transform:translateY(-2px)}

  /* arrivées */
  .xp-anim .qv:not(.vu){opacity:0; transform:translateY(14px)}
  .xp-anim .qv{transition:opacity .55s, transform .55s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .eq i{transform:none!important}
    .g-s6 ol li::before{color:var(--lueur); -webkit-text-stroke-color:transparent}
    .g-s8 .paire::before{transform:none!important}
    .g-s9 .xp-cta::before{opacity:.55}
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
    ? `<div class="${classe} qv veq">\n${x.join('\n')}\n</div>` : x).join('\n');
}

/* l'égaliseur se glisse dans les h2 et les h3-moteurs — décor pur */
export function renduBloc(b, defaut, groupe) {
  if (b.t === 'h2') return `<h2 class="veq">${EQ}<span>${b.html}</span></h2>`;
  if (b.t === 'h3' && groupe === 's3') return `<h3>${EQ}<span>${b.html}</span></h3>`;
  return defaut;
}

export function renduSection(groupe, s) {
  if (groupe === 's3') {
    const interne = groupeDepuis(s.rendus, s.blocs, ['h3'], 'voix');
    return `<section class="xp-sec g-s3">\n${interne.replace(/(<div class="voix[\s\S]*<\/div>)/, '<div class="voix-grille">\n$1\n</div>')}\n</section>`;
  }
  if (groupe === 's8')
    return `<section class="xp-sec g-s8">\n${groupeDepuis(s.rendus, s.blocs, ['h3'], 'paire')}\n</section>`;
  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    'h2.veq, .voix, .g-s6 ol li, .g-s8 .paire, .xp-sec p, .xp-sec ul, .xp-cta'));
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
  cibles.forEach(function (el) { el.classList.add('qv'); io.observe(el); });
`;
