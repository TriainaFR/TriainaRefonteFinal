/**
 * expertise-ai-overview.mjs — « La Ligne Zéro » : la réponse au-dessus de la
 * pile. Le filet d'or (--lueur) est TOUJOURS l'arête SUPÉRIEURE d'un bloc —
 * bord haut des panneaux-réponse, tête des h2, sommet de la carte étape 4 —
 * jamais une ligne libre. Dessus : la réponse, nette, en Syne. Dessous : la
 * pile des résultats classiques, barres-squelettes abstraites qui s'enfoncent.
 * Panneau-réponse raréfié à 4 apparitions (héros, first-mover, cas clients,
 * CTA final) ; pile squelette à 2 (héros, CTA). Creux→or réservé aux quatre
 * cartes-chiffres CTR ; dates et stats clients en chute de couleur simple.
 * Puces de citation [n] (CSS counters) : comparatif + registre Sources.
 */

export const STYLE = `
  /* ── La Ligne Zéro : dessus la réponse, dessous la pile ── */

  .g-breadcrumb{padding:0}

  /* vocabulaire commun : le panneau-réponse (bord haut = ligne zéro) */
  .panneau{position:relative; border:1px solid rgba(96,165,250,.25);
    border-top:1px solid var(--lueur); border-radius:12px;
    background:linear-gradient(180deg, rgba(16,26,51,.92), rgba(11,20,40,.55));
    padding:clamp(1.5rem,3vw,2.2rem)}
  .panneau::before{content:''; position:absolute; inset:0 0 auto 0; height:4rem;
    border-radius:12px 12px 0 0; pointer-events:none;
    background:linear-gradient(180deg, rgba(255,233,184,.05), transparent)}
  .panneau p{max-width:none}
  .panneau p strong{color:#fff}

  /* vocabulaire commun : la pile des résultats classiques (abstraite) */
  .pile{display:grid; gap:.55rem; pointer-events:none}
  .pile i{display:block; height:13px; border-radius:6px; background:var(--nuit-2);
    border:1px solid rgba(96,165,250,.16); opacity:.28}
  .pile i:nth-child(1){width:90%} .pile i:nth-child(2){width:78%}
  .pile i:nth-child(3){width:86%} .pile i:nth-child(4){width:62%}

  /* ── héros : LA réponse posée sur la pile ── */
  .g-hero{padding-top:8.5rem; padding-bottom:2.5rem}
  .g-hero .xp-k{margin-bottom:1.1rem}
  .g-hero h1{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.9rem,5vw,4.3rem); line-height:1.08; letter-spacing:-.015em;
    max-width:30ch}
  .g-hero .h1-src{color:var(--bleu-p)}
  .g-hero .strate{margin-top:2.6rem; max-width:56rem}
  .pr-hero{position:relative; z-index:2}
  .pr-hero::before{background:linear-gradient(180deg, rgba(255,233,184,.07), transparent)}
  .pr-hero p{color:#C7D3EA; font-size:1.04rem; line-height:1.75; margin-top:.9rem}
  .pr-hero p:first-child{margin-top:0}
  .pile-hero{position:relative; z-index:1; margin:-1rem 1.8rem 0}
  .xp-anim .pr-hero{animation:lz-pose .65s cubic-bezier(.22,.61,.36,1) both}
  @keyframes lz-pose{from{transform:translateY(16px)}}
  .xp-anim .pile-hero i:nth-child(1){animation:lz-enf1 .65s cubic-bezier(.22,.61,.36,1) both}
  .xp-anim .pile-hero i:nth-child(2){animation:lz-enf2 .65s cubic-bezier(.22,.61,.36,1) both}
  .xp-anim .pile-hero i:nth-child(3){animation:lz-enf3 .65s cubic-bezier(.22,.61,.36,1) both}
  .xp-anim .pile-hero i:nth-child(4){animation:lz-enf4 .65s cubic-bezier(.22,.61,.36,1) both}
  @keyframes lz-enf1{from{transform:translateY(-6px); opacity:.55}}
  @keyframes lz-enf2{from{transform:translateY(-10px); opacity:.55}}
  @keyframes lz-enf3{from{transform:translateY(-14px); opacity:.55}}
  @keyframes lz-enf4{from{transform:translateY(-18px); opacity:.55}}
  .pr-hero .xp-cta{margin-top:1.5rem}

  /* ── boutons : le bleu structure, l'or ne s'allume qu'au dernier ── */
  .xp-cta button{display:inline-flex; align-items:center; cursor:pointer;
    font-family:var(--manrope); font-weight:800; font-size:.8rem;
    letter-spacing:.13em; text-transform:uppercase; border-radius:99px;
    padding:1.05rem 2rem; transition:background-color .2s, color .2s,
    border-color .2s, transform .2s}
  .pr-hero .xp-cta button{background:transparent; color:#EAF2FF;
    border:1px solid rgba(96,165,250,.5)}
  .pr-hero .xp-cta button:hover{border-color:var(--lueur); color:var(--lueur)}

  /* ── têtes de section : le titre naît au-dessus de son filet d'or ── */
  .xp-sec h2{position:relative; font-family:var(--syne); font-weight:800;
    color:#fff; font-size:clamp(1.5rem,2.9vw,2.4rem); line-height:1.18;
    max-width:32ch; padding-top:1.1rem}
  .xp-sec h2::before{content:''; position:absolute; left:0; top:0; width:6rem;
    height:2px; background:var(--lueur); transform-origin:left}
  .xp-anim h2.cl::before{transition:transform .5s cubic-bezier(.22,.61,.36,1) .12s}
  .xp-anim h2.cl:not(.vu)::before{transform:scaleX(0)}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.05rem,1.5vw,1.25rem); line-height:1.3; margin-top:2.4rem}
  .xp-sec p{max-width:44rem; color:var(--brume); font-size:1.02rem;
    line-height:1.75; margin-top:.95rem}
  .xp-sec p strong{color:#E2E8F0}
  .xp-sec p em{color:#CBD5E1}
  .xp-sec p a, .xp-meta a{color:var(--bleu-p); text-decoration:none;
    border-bottom:1px solid rgba(147,197,253,.35); transition:color .2s, border-color .2s}
  .xp-sec p a:hover, .xp-meta a:hover{color:var(--lueur); border-color:var(--lueur)}

  /* ── listes : tirets bleus (structure) ── */
  .xp-ul{list-style:none; margin:0; padding:0; max-width:46rem}
  .xp-ul li{position:relative; padding-left:1.35rem; color:var(--brume);
    line-height:1.68; font-size:.98rem; margin-top:.6rem}
  .xp-ul li::before{content:''; position:absolute; left:0; top:.68em; width:8px;
    height:2px; background:rgba(96,165,250,.6)}
  .xp-ul li strong{color:#E2E8F0}

  /* ── définition : les 4 cartes-chiffres CTR, creux→or ── */
  .g-definition .date-or{font-family:var(--syne); font-weight:800;
    color:var(--lueur); transition:color .6s}
  .xp-anim .cl:not(.vu) .date-or{color:#EAF2FF}
  .g-definition .xp-ul{display:grid; grid-template-columns:1fr 1fr;
    gap:1.1rem; max-width:none; margin-top:1.8rem}
  .g-definition .xp-ul li{margin-top:0; padding:1.4rem 1.5rem 1.5rem;
    border-radius:12px; background:rgba(16,26,51,.5);
    border:1px solid rgba(96,165,250,.14); border-top:1px solid rgba(96,165,250,.3);
    font-size:.94rem; line-height:1.6}
  .g-definition .xp-ul li::before{content:none}
  .g-definition .xp-ul li strong{display:block; font-family:var(--syne);
    font-weight:800; font-size:clamp(2rem,3.6vw,3rem); line-height:1.1;
    letter-spacing:-.01em; margin-bottom:.5rem; color:#8FA8D8;
    -webkit-text-fill-color:#8FA8D8;
    transition:color .6s, -webkit-text-fill-color .6s}
  /* la carte du gain (citée = gagnante) porte la ligne zéro et passe or */
  .g-definition .xp-ul li:last-child{border-top-color:var(--lueur);
    background:linear-gradient(180deg, rgba(16,26,51,.85), rgba(11,20,40,.5))}
  .g-definition .xp-ul li:last-child strong{color:var(--lueur);
    -webkit-text-fill-color:var(--lueur)}
  @supports (-webkit-text-stroke: 1px #fff){
    .xp-anim .g-definition .xp-ul li.cl:not(.vu) strong{
      -webkit-text-stroke:1px rgba(143,168,216,.6); -webkit-text-fill-color:transparent}
    .xp-anim .g-definition .xp-ul li.cl:not(.vu):last-child strong{
      -webkit-text-stroke:1px rgba(255,233,184,.55)}
  }
  .g-definition blockquote{position:relative; max-width:44rem; margin-top:2.4rem;
    padding-top:1.1rem; font-family:var(--syne); font-weight:600;
    font-size:1.15rem; line-height:1.6; color:#E2E8F0}
  .g-definition blockquote::before{content:''; position:absolute; left:0; top:0;
    width:6rem; height:2px; background:rgba(96,165,250,.45)}

  /* ── tableaux : cadres bleus, arête haute bleue (structure) ── */
  .tbl{overflow-x:auto; margin-top:1.8rem; border-radius:12px;
    border:1px solid rgba(96,165,250,.16); border-top:1px solid rgba(96,165,250,.45);
    background:rgba(16,26,51,.45)}
  .tbl table{width:100%; border-collapse:collapse; min-width:36rem}
  .tbl th{font-family:ui-monospace,monospace; font-weight:400; font-size:.62rem;
    letter-spacing:.16em; text-transform:uppercase; color:var(--bleu-c);
    text-align:left; padding:.9rem 1.1rem; border-bottom:1px solid rgba(96,165,250,.25)}
  .tbl td{padding:.85rem 1.1rem; color:var(--brume); font-size:.93rem;
    line-height:1.55; border-bottom:1px solid rgba(148,163,184,.1); vertical-align:top}
  .tbl tbody tr:last-child td{border-bottom:0}
  .tbl td:first-child{color:#E2E8F0; font-weight:600}
  .tbl tbody tr{transition:background-color .2s}
  .tbl tbody tr:hover{background:rgba(96,165,250,.06)}
  .g-impact-secteurs{padding:0}
  .g-impact-secteurs .tbl{margin-top:.4rem}
  .g-impact{padding-bottom:1.4rem}
  .g-impact-secteurs + .g-impact{padding-top:1rem}

  /* ── first-mover : 2e panneau-réponse ── */
  .g-impact .panneau{margin-top:2.6rem; max-width:52rem}
  .g-impact .panneau h3{margin-top:0}
  .g-impact .panneau .date-or{font-family:var(--syne); font-weight:800;
    color:var(--lueur); transition:color .6s}

  /* ── méthode : l'ascension vers la position zéro ── */
  .g-methode{padding-bottom:1.8rem}
  section[class*="g-methode-etape"]{padding:0 0 1.3rem}
  .etape{display:grid; grid-template-columns:3.2rem 1fr;
    gap:clamp(1.1rem,2vw,1.7rem); padding:clamp(1.4rem,2.6vw,2rem);
    border-radius:12px; background:rgba(16,26,51,.4);
    border:1px solid rgba(148,163,184,.14)}
  .etape .glyphe{display:grid; gap:.45rem; align-content:start; padding-top:.45rem}
  .etape .glyphe i{display:block; height:9px; border-radius:4px;
    background:rgba(96,165,250,.1); border:1px solid rgba(96,165,250,.22);
    transition:background-color .45s .2s, border-color .45s .2s}
  .etape-corps{min-width:0}
  .etape-corps h3{margin-top:0}
  .etape-corps p{font-size:.98rem}
  .etape-corps .xp-ul{margin-top:1rem}
  .etape-corps .tbl{margin-top:1.4rem}
  /* le niveau n s'allume en or — étape 4 au sommet de la pile */
  .etape.niv-1 .glyphe i:nth-child(4), .etape.niv-2 .glyphe i:nth-child(3),
  .etape.niv-3 .glyphe i:nth-child(2), .etape.niv-4 .glyphe i:nth-child(1){
    background:var(--lueur); border-color:var(--lueur)}
  .xp-anim .etape.cl:not(.vu) .glyphe i{background:rgba(96,165,250,.1);
    border-color:rgba(96,165,250,.22)}
  /* chrome gradué : la luminance monte, le texte ne change jamais */
  .etape.niv-2{border-color:rgba(96,165,250,.22)}
  .etape.niv-3{border-color:rgba(96,165,250,.38)}
  .etape.niv-4{border-color:rgba(96,165,250,.3); border-top:1px solid var(--lueur)}

  /* ── cas clients : deux panneaux-réponse côte à côte ── */
  .g-resultats{padding-bottom:1.6rem}
  .cas-duo{display:grid; grid-template-columns:1fr 1fr; gap:1.4rem}
  .cas-duo .xp-sec{padding:0}
  .cas-duo .panneau{height:100%}
  .cas-duo h3{margin:0; font-family:ui-monospace,monospace; font-weight:400;
    font-size:.66rem; letter-spacing:.18em; text-transform:uppercase;
    color:var(--bleu-c)}
  .cas-duo p{font-size:.94rem; margin-top:1rem}
  .xp-stat{margin-top:1.6rem; font-family:var(--syne); font-weight:800;
    color:#E2E8F0; font-size:1rem; line-height:1.4}
  .stat-n{display:block; font-size:clamp(2.6rem,5vw,3.6rem); line-height:1.05;
    letter-spacing:-.01em; color:var(--lueur); transition:color .6s}
  .xp-anim .cl:not(.vu) .stat-n{color:#8FA8D8}
  .xp-meta{margin-top:.55rem; font-size:.85rem; color:var(--brume); line-height:1.6}

  /* ── comparatif : les puces de citation [n] ── */
  .g-comparatif .tbl table{counter-reset:cit; min-width:46rem}
  .g-comparatif tbody tr{counter-increment:cit}
  .g-comparatif tbody td:first-child::before{content:'[' counter(cit) ']';
    display:inline-block; margin-right:.55rem; padding:.05rem .3rem;
    font-family:ui-monospace,monospace; font-weight:400; font-size:.62rem;
    color:var(--bleu-c); border:1px solid rgba(96,165,250,.35); border-radius:5px;
    opacity:.55; transition:color .2s, border-color .2s, opacity .2s}
  .g-comparatif tbody tr:hover td:first-child::before{color:var(--lueur);
    border-color:rgba(255,233,184,.6); opacity:1}

  /* ── FAQ : paires visibles, tiret or ── */
  .g-faq{padding-bottom:1rem}
  section[class*="g-faq-item"]{padding:0 0 2.2rem}
  .xp-fq{position:relative; max-width:46rem; padding-left:1.5rem;
    font-family:var(--syne); font-weight:600; color:#E2E8F0; font-size:1.12rem;
    line-height:1.45}
  .xp-fq::before{content:''; position:absolute; left:0; top:.6em; width:.9rem;
    height:2px; background:var(--lueur)}
  .xp-fr{margin-top:.6rem; padding-left:1.5rem; max-width:46rem;
    color:var(--brume); line-height:1.7; font-size:.98rem}

  /* ── CTA final : reprise réduite du dispositif du héros ── */
  .strate-cta{position:relative; margin-top:2.8rem; max-width:46rem}
  .pr-cta{position:relative; z-index:2; text-align:center;
    padding:clamp(1.8rem,3.4vw,2.6rem)}
  .pr-cta p{margin:0 auto; max-width:38rem; font-size:.98rem}
  .pr-cta .xp-cta{margin-top:1.6rem}
  .pr-cta .xp-cta button{background:var(--bleu); color:#fff; border:0;
    padding:1.15rem 2.2rem}
  .pr-cta .xp-cta button:hover{transform:translateY(-2px);
    background:var(--bleu-nuit); box-shadow:0 0 24px rgba(255,233,184,.25)}
  .pile-cta{position:relative; z-index:1; margin:-.9rem 2.4rem 0}
  .pile-cta i{opacity:.2}

  /* ── Sources : le registre des sources contrôlées ── */
  .g-sources h2{font-size:clamp(1.25rem,2vw,1.5rem)}
  .g-sources h2::before{width:3.5rem}
  .g-sources .xp-ul{counter-reset:src; margin-top:1.6rem; display:grid;
    gap:.95rem; max-width:46rem}
  .g-sources .xp-ul li{counter-increment:src; margin-top:0; padding-left:2.9rem;
    font-size:.95rem}
  .g-sources .xp-ul li::before{content:'[' counter(src) ']'; width:auto; height:auto;
    top:.05em; background:none; padding:.05rem .3rem;
    font-family:ui-monospace,monospace; font-size:.62rem; color:var(--bleu-c);
    border:1px solid rgba(96,165,250,.35); border-radius:5px; opacity:.55;
    transition:color .2s, border-color .2s, opacity .2s}
  .g-sources .xp-ul li:hover::before{color:var(--lueur);
    border-color:rgba(255,233,184,.6); opacity:1}
  .g-sources a{color:#CBD5E1; text-decoration:none; line-height:1.6;
    border-bottom:1px solid rgba(148,163,184,.3); transition:color .2s, border-color .2s}
  .g-sources a:hover{color:#fff; border-color:var(--lueur)}

  /* ── maillage expertises : pilules froides navigables ── */
  .g-sidebar-expertises{padding:2.4rem 0 1rem}
  .g-sidebar-expertises h3{margin:0; font-family:ui-monospace,monospace;
    font-weight:400; font-size:.66rem; letter-spacing:.24em;
    text-transform:uppercase; color:var(--brume)}
  .g-sidebar-expertises .xp-ul{margin-top:1.2rem; display:flex; flex-wrap:wrap;
    gap:.6rem; max-width:none}
  .g-sidebar-expertises .xp-ul li{margin-top:0; padding:.55rem 1.1rem;
    border:1px solid rgba(37,99,235,.4); border-radius:99px; color:#CBD5E1;
    font-size:.85rem; cursor:pointer; transition:border-color .2s, color .2s}
  .g-sidebar-expertises .xp-ul li::before{content:none}
  .g-sidebar-expertises .xp-ul li:hover{border-color:rgba(255,233,184,.6); color:#fff}

  /* ── bandeau pré-footer : le bouton répété ── */
  .g-sidebar-cta{text-align:center; padding:3rem 0 4.5rem}
  .g-sidebar-cta h3{margin:0; font-family:var(--syne); font-weight:700;
    color:#fff; font-size:clamp(1.4rem,2.6vw,1.9rem)}
  .g-sidebar-cta p{margin:.9rem auto 0; max-width:36rem}
  .g-sidebar-cta .xp-cta{margin-top:1.5rem}
  .g-sidebar-cta .xp-cta button{background:var(--bleu); color:#fff; border:0;
    padding:1.05rem 2rem}
  .g-sidebar-cta .xp-cta button:hover{transform:translateY(-2px);
    background:var(--bleu-nuit)}

  /* ── arrivées : opacity + translateY, cascades plafonnées ── */
  .xp-anim .cl:not(.vu){opacity:0; transform:translateY(16px)}
  .xp-anim .cl{transition:opacity .6s cubic-bezier(.22,.61,.36,1),
    transform .65s cubic-bezier(.22,.61,.36,1)}
  .xp-anim .g-definition .xp-ul li.cl:nth-child(2){transition-delay:80ms}
  .xp-anim .g-definition .xp-ul li.cl:nth-child(3){transition-delay:160ms}
  .xp-anim .g-definition .xp-ul li.cl:nth-child(4){transition-delay:240ms}
  .xp-anim .g-resultats-client-2 .panneau.cl{transition-delay:100ms}
  .xp-anim .g-sources .xp-ul li.cl:nth-child(2){transition-delay:80ms}
  .xp-anim .g-sources .xp-ul li.cl:nth-child(3){transition-delay:160ms}
  .xp-anim .g-sources .xp-ul li.cl:nth-child(4){transition-delay:240ms}

  /* ── replis ── */
  @media(max-width:900px){
    .cas-duo{grid-template-columns:1fr}
  }
  @media(max-width:640px){
    .g-hero h1{font-size:clamp(1.7rem,8.2vw,2.2rem)}
    .g-definition .xp-ul{grid-template-columns:1fr}
    .etape{grid-template-columns:2.2rem 1fr}
    .pile{gap:.45rem}
    .pile i{height:10px}
    .pile-hero{margin-inline:1rem}
    .pile-cta{margin-inline:1.2rem}
    .panneau::before{height:3rem}
  }

  /* ── sans mouvement : tout est posé, or compris ── */
  @media (prefers-reduced-motion: reduce){
    .pile i{opacity:.28; transform:none}
    .pile-cta i{opacity:.2}
    .pr-hero{transform:none}
    .xp-sec h2::before{transform:none}
    .g-definition .xp-ul li strong{color:#8FA8D8; -webkit-text-fill-color:#8FA8D8}
    .g-definition .xp-ul li:last-child strong{color:var(--lueur);
      -webkit-text-fill-color:var(--lueur)}
    .date-or, .g-impact .panneau .date-or{color:var(--lueur)}
    .stat-n{color:var(--lueur)}
    .etape.niv-1 .glyphe i:nth-child(4), .etape.niv-2 .glyphe i:nth-child(3),
    .etape.niv-3 .glyphe i:nth-child(2), .etape.niv-4 .glyphe i:nth-child(1){
      background:var(--lueur); border-color:var(--lueur)}
  }
`;

/* pile de barres-squelettes abstraites — décor pur, aucun texte, aucun lien */
const pile = (n, cls) =>
  `<div class="pile ${cls}" aria-hidden="true">${'<i></i>'.repeat(n)}</div>`;

export function renduBloc(b, defaut, groupe) {
  /* CTA : l'ancien site rendait des <button onClick> — on reproduit un bouton
     (le rendu <a href="#"> par défaut ajouterait un lien absent des blocs) */
  if (b.t === 'cta') {
    const cible = (b.nav && b.nav[0] && b.nav[0].url) || '/contact';
    return `<p class="xp-cta"><button type="button" data-aller="${cible}">${b.html}</button></p>`;
  }
  /* listes : le flux fournit les <li> nus — on referme la liste (enveloppe) */
  if (b.t === 'ul' || b.t === 'ol') {
    let html = b.html;
    if (groupe === 'sidebar-expertises' && b.nav)
      for (const n of b.nav) /* navigation des anciens boutons : attribut neutre */
        html = html.replace(`<li>${n.texte}</li>`, `<li data-aller="${n.url}" tabindex="0" role="link">${n.texte}</li>`);
    return `<${b.t} class="xp-ul">${html}</${b.t}>`;
  }
  if (b.t === 'table') return `<div class="tbl">${b.html}</div>`;
  /* h1 : « l'agence qui contrôle les sources » était un span bleu sur l'ancien
     site — remis en couleur (texte intact) */
  if (groupe === 'hero' && b.t === 'h1')
    return `<h1>${b.html.replace("l'agence qui contrôle les sources", '<span class="h1-src">$&</span>')}</h1>`;
  /* dates : chute de couleur simple vers l'or (rabotage 5) */
  if (groupe === 'definition' && b.t === 'h3' && b.html.includes('22 juillet 2026'))
    return `<h3>${b.html.replace('22 juillet 2026', '<span class="date-or">$&</span>')}</h3>`;
  if (groupe === 'impact' && b.t === 'p' && b.html.includes('est le jour zéro'))
    return `<p>${b.html.replace('Le 22 juillet 2026', '<span class="date-or">$&</span>')}</p>`;
  /* stat clients : le nombre en display, chute de couleur or */
  if (b.t === 'stat') {
    const m = /^(\d+\s?%)/.exec(b.html);
    if (m) return `<p class="xp-stat"><span class="stat-n">${m[1]}</span>${b.html.slice(m[1].length)}</p>`;
  }
  return defaut;
}

export function renduSection(groupe, s) {
  /* héros : kicker + h1 toujours visibles, puis la composition-signature —
     le panneau-réponse (intro gelée) posé sur la pile qui s'enfonce */
  if (groupe === 'hero') {
    const [kicker, h1, ...reste] = s.rendus;
    return `<section class="xp-sec g-hero">
${kicker}
${h1}
<div class="strate">
<div class="panneau pr-hero">
${reste.join('\n')}
</div>
${pile(4, 'pile-hero')}
</div>
</section>`;
  }
  /* second segment impact : l'aparté first-mover en panneau-réponse (2/4) */
  if (groupe === 'impact' && s.blocs.some(b => b.t === 'h3' && b.html.includes('first-mover'))) {
    const i = s.blocs.findIndex(b => b.t === 'h3');
    return `<section class="xp-sec g-impact">
${s.rendus.slice(0, i).join('\n')}
<div class="panneau">
${s.rendus.slice(i, i + 3).join('\n')}
</div>
${s.rendus.slice(i + 3).join('\n')}
</section>`;
  }
  /* les 4 étapes : carte [glyphe-pile | contenu], le niveau n s'allume en or */
  if (groupe.startsWith('methode-etape-')) {
    const n = groupe.slice(-1);
    return `<section class="xp-sec g-${groupe}">
<div class="etape niv-${n}">
<div class="glyphe" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<div class="etape-corps">
${s.rendus.join('\n')}
</div>
</div>
</section>`;
  }
  /* cas clients : deux panneaux-réponse côte à côte (3/4) — l'ouverture du
     duo se referme à la section suivante */
  if (groupe === 'resultats-client-1')
    return `<div class="cas-duo">
<section class="xp-sec g-resultats-client-1">
<div class="panneau">
${s.rendus.join('\n')}
</div>
</section>`;
  if (groupe === 'resultats-client-2')
    return `<section class="xp-sec g-resultats-client-2">
<div class="panneau">
${s.rendus.join('\n')}
</div>
</section>
</div>`;
  /* CTA final : reprise réduite du dispositif du héros (panneau 4/4, pile 2/2) */
  if (groupe === 'cta-final') {
    const avant = s.rendus.slice(0, -2);
    const fin = s.rendus.slice(-2);
    return `<section class="xp-sec g-cta-final">
${avant.join('\n')}
<div class="strate strate-cta">
<div class="panneau pr-cta">
${fin.join('\n')}
</div>
${pile(3, 'pile-cta')}
</div>
</section>`;
  }
  return s.enveloppe;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.g-definition > h2, .g-definition > p, .g-definition > h3, ' +
    '.g-definition > blockquote, .g-definition .xp-ul > li, ' +
    '.g-impact > h2, .g-impact > p, .g-impact > h3, .g-impact > .panneau, ' +
    '.g-impact-secteurs .tbl, .g-methode > h2, .g-methode > p, .etape, ' +
    '.g-resultats > h2, .g-resultats > p, .cas-duo .panneau, ' +
    '.g-comparatif > *, .g-faq > h2, .xp-sec[class*="g-faq-item"], ' +
    '.g-cta-final > h2, .g-cta-final > p, .g-cta-final > .xp-ul, .strate-cta, ' +
    '.g-sources > h2, .g-sources .xp-ul > li, ' +
    '.g-sidebar-expertises > *, .g-sidebar-cta > *'));
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('vu');
      io.unobserve(x.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -12% 0px' });
  cibles.forEach(function (el) { el.classList.add('cl'); io.observe(el); });
`;
