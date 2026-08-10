/**
 * agence-referencement-ia.mjs — page /agence-referencement-ia, ENTIÈREMENT
 * REMPLACÉE le 10/08/2026 à la demande de Lucas : contenu, title, metas,
 * Open Graph, Twitter, metas GEO/LLM et les 4 schémas (ProfessionalService,
 * FAQPage, BreadcrumbList, Person) viennent de son code —
 * tools/sources/agence-referencement-ia.html. Les corrections apportées à sa
 * source sont documentées en tête de ce fichier-là. (L'ancien module « Le
 * Verdict » habillait le contenu capturé de l'ancien site ; il est parti
 * avec lui.)
 *
 * Design : « La Réponse » — cette page vend une place dans les réponses des
 * IA, alors la page la met en scène : dans le hero, une console tape la
 * requête et les trois moteurs citent Triaina l'un après l'autre ; les cas
 * clients portent des jauges de taux de citation qui se remplissent à
 * l'entrée ; la méthode est un rail qui se charge étape par étape ; les
 * phrases clés reçoivent le balayage doré de la famille (repris de
 * /expertise-geo, où il signe la citation).
 *
 * Sans JS ou en motion réduite : tout est visible d'emblée, la console
 * affiche sa requête en dur, les jauges sont pleines.
 */
import { readFileSync } from 'node:fs';

/* ══ La tête : les signaux de Lucas, à l'octet près ══ */
const SOURCE = readFileSync(new URL('../sources/agence-referencement-ia.html', import.meta.url), 'utf8');
export const TETE = SOURCE
  .slice(SOURCE.indexOf('<!-- SEO primaire -->'), SOURCE.indexOf('</head>'))
  .trim();

export const STYLE = `
  /* ── La Réponse ── */

  /* corps commun de la famille */
  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.5rem,2.9vw,2.4rem); margin-bottom:1.5rem;
    position:relative; padding-left:1.6rem}
  .xp-sec h2::before{content:'›'; position:absolute; left:0; top:-.08em;
    color:var(--lueur); transition:transform .5s cubic-bezier(.2,1.25,.35,1),
    opacity .5s}
  .xp-anim .xp-sec h2:not(.vu)::before{transform:translateX(-.5rem); opacity:0}
  .xp-sec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.05rem,1.5vw,1.25rem); margin-top:1.9rem}
  .xp-sec p{max-width:47rem; color:var(--brume); line-height:1.75; margin-top:.9rem}
  .xp-sec p strong{color:#EAF0FF}
  .xp-sec p em{font-style:italic; color:#CFE0FF}
  .xp-sec li{color:var(--brume); line-height:1.7; margin-top:.5rem; font-size:.95rem;
    list-style:none; position:relative; padding-left:1.25rem}
  .xp-sec ul li::before{content:'›'; position:absolute; left:0; top:0;
    color:rgba(96,165,250,.75)}
  .xp-sec li strong{color:#EAF0FF}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* balayage doré de la famille : la phrase entre comme une citation */
  .hl{background-image:linear-gradient(105deg, rgba(255,233,184,.2), rgba(255,233,184,.11));
    background-repeat:no-repeat; background-size:100% 100%;
    -webkit-box-decoration-break:clone; box-decoration-break:clone;
    color:var(--lueur)}
  .xp-anim .hl{background-size:0% 100%; color:inherit;
    transition:background-size .6s cubic-bezier(.2,.7,.2,1) .2s, color .6s ease .2s}
  .xp-anim .vu .hl{background-size:100% 100%; color:var(--lueur)}

  /* hero */
  .g-hero .lead{font-size:clamp(1.02rem,1.45vw,1.22rem); max-width:50rem}
  .g-hero .lead strong{color:#fff}
  .g-hero .note{font-family:ui-monospace,monospace; font-size:.72rem;
    letter-spacing:.14em; text-transform:uppercase; color:var(--bleu-c)}

  /* la console : la requête se tape, les moteurs répondent « Triaina » */
  .console{margin-top:2.2rem; max-width:44rem;
    border:1px solid rgba(96,165,250,.28); border-radius:16px;
    background:rgba(13,22,44,.6); overflow:hidden}
  .console .con-b{display:flex; gap:.4rem; padding:.65rem .9rem;
    border-bottom:1px solid rgba(96,165,250,.16)}
  .console .con-b i{width:.55rem; height:.55rem; border-radius:50%;
    background:rgba(148,163,184,.28)}
  .console .con-l{padding:1.1rem 1.2rem .4rem; font-family:ui-monospace,monospace;
    font-size:.86rem; color:#DCE6FF; min-height:2.4rem; max-width:none}
  .console .con-p{color:var(--lueur); margin-right:.45rem}
  .console .con-c{display:inline-block; width:.55em; height:1.05em;
    background:var(--lueur); vertical-align:text-bottom; margin-left:2px;
    animation:conCligne 1s steps(1) infinite}
  @keyframes conCligne{50%{opacity:0}}
  body:not(.xp-anim) .con-q::after{content:attr(data-texte)}
  .console .con-reps{display:grid; gap:.5rem; padding:.7rem 1.2rem 1.1rem}
  .console .rep{display:flex; align-items:center; gap:.7rem; margin:0;
    font-family:ui-monospace,monospace; font-size:.78rem; max-width:none}
  .console .rep b{font-weight:400; color:var(--bleu-c); min-width:6.2rem}
  .console .rep span{color:rgba(148,163,184,.75); letter-spacing:.08em}
  .console .rep strong{color:var(--lueur); font-weight:700; letter-spacing:.06em}
  .console .rep::after{content:''; flex:1; height:1px; margin-left:.3rem;
    background:linear-gradient(90deg, rgba(255,233,184,.35), transparent)}
  .xp-anim .console .rep{opacity:0; transform:translateY(6px);
    transition:opacity .45s, transform .45s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .console.fini .rep{opacity:1; transform:none}
  .xp-anim .console.fini .rep:nth-child(1){transition-delay:.15s}
  .xp-anim .console.fini .rep:nth-child(2){transition-delay:.55s}
  .xp-anim .console.fini .rep:nth-child(3){transition-delay:.95s}
  .console .con-note{margin:0; padding:.55rem 1.2rem .8rem;
    font-family:ui-monospace,monospace; font-size:.6rem; letter-spacing:.16em;
    text-transform:uppercase; color:rgba(148,163,184,.6); max-width:none}

  /* s1 : les trois moteurs, en cartes */
  .moteurs{display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
    gap:1rem; margin-top:1.4rem}
  .moteurs .moteur{max-width:none; margin:0; padding:1.3rem 1.35rem;
    border:1px solid rgba(96,165,250,.18); border-radius:14px;
    background:rgba(16,26,51,.45); font-size:.93rem; line-height:1.7;
    transition:border-color .3s, transform .3s}
  .moteurs .moteur:hover{border-color:rgba(255,233,184,.45); transform:translateY(-3px)}
  .moteurs .moteur strong:first-child{display:block; color:var(--lueur);
    font-family:var(--syne); font-size:1.02rem; margin-bottom:.55rem}

  /* s2 : offres en cartes, fiches prix, les 8 médias en grille */
  .offre{margin-top:2.1rem; padding:1.6rem 1.7rem; max-width:52rem;
    border:1px solid rgba(96,165,250,.18); border-left:3px solid rgba(255,233,184,.5);
    border-radius:14px; background:rgba(16,26,51,.4)}
  .offre h3{margin-top:0}
  .offre .fiche{margin-top:1.2rem; padding:.75rem 1rem; border-radius:10px;
    background:rgba(37,99,235,.14); border:1px solid rgba(96,165,250,.25);
    font-family:ui-monospace,monospace; font-size:.78rem; letter-spacing:.04em;
    color:#DCE6FF; max-width:none}
  .offre .fiche strong{color:var(--lueur)}
  .medias-grille{display:grid; grid-template-columns:repeat(2,minmax(0,1fr));
    gap:.6rem; margin-top:1.2rem}
  .medias-grille li{padding:.75rem .9rem; margin:0; border-radius:10px;
    border:1px solid rgba(96,165,250,.2); background:rgba(13,22,44,.5);
    font-size:.88rem}
  .medias-grille li::before{content:none}
  .medias-grille li strong{display:block; font-family:var(--syne); color:#fff}
  .xp-anim .medias-grille li{opacity:0; transform:translateY(8px);
    transition:opacity .45s, transform .45s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .medias-grille.vu li{opacity:1; transform:none}
  .xp-anim .medias-grille.vu li:nth-child(2){transition-delay:.08s}
  .xp-anim .medias-grille.vu li:nth-child(3){transition-delay:.16s}
  .xp-anim .medias-grille.vu li:nth-child(4){transition-delay:.24s}
  .xp-anim .medias-grille.vu li:nth-child(5){transition-delay:.32s}
  .xp-anim .medias-grille.vu li:nth-child(6){transition-delay:.4s}
  .xp-anim .medias-grille.vu li:nth-child(7){transition-delay:.48s}
  .xp-anim .medias-grille.vu li:nth-child(8){transition-delay:.56s}

  /* s3 : le rail de méthode — chaque étape charge le segment suivant */
  .g-s3{counter-reset:etape}
  .etape{position:relative; padding-left:3.4rem; max-width:47rem; margin-top:2.1rem;
    counter-increment:etape}
  .etape::before{content:counter(etape); position:absolute; left:0; top:.05rem;
    width:2.3rem; height:2.3rem; display:grid; place-items:center;
    border:1.5px solid rgba(96,165,250,.5); border-radius:50%;
    font-family:var(--syne); font-weight:800; color:var(--bleu-c);
    transition:border-color .4s, color .4s, box-shadow .4s}
  .etape.vu::before{border-color:rgba(255,233,184,.8); color:var(--lueur);
    box-shadow:0 0 18px rgba(255,233,184,.22)}
  .etape::after{content:''; position:absolute; left:1.1rem; top:2.6rem;
    bottom:-1.9rem; width:1.5px;
    background:linear-gradient(rgba(255,233,184,.55), rgba(96,165,250,.2));
    transform:scaleY(0); transform-origin:top;
    transition:transform .8s cubic-bezier(.22,.9,.24,1) .2s}
  .etape.vu::after{transform:scaleY(1)}
  .etape:last-of-type::after{content:none}
  .etape h3{margin-top:.35rem}
  .etape p{margin-top:.55rem; font-size:.96rem}
  body:not(.xp-anim) .etape::after{transform:scaleY(1)}

  /* s4 : cas clients + jauge de citation */
  .cas{margin-top:2.1rem; padding:1.6rem 1.7rem; max-width:52rem;
    border:1px solid rgba(96,165,250,.18); border-radius:14px;
    background:rgba(16,26,51,.4)}
  .cas h3{margin-top:0; color:var(--lueur)}
  .cas p{font-size:.95rem}
  .jauge{margin-top:1.3rem}
  .jauge span{display:block; font-family:ui-monospace,monospace; font-size:.6rem;
    letter-spacing:.18em; text-transform:uppercase; color:var(--bleu-c);
    margin-bottom:.45rem}
  .jauge i{display:block; height:7px; border-radius:99px;
    background:rgba(96,165,250,.14); position:relative; overflow:hidden}
  .jauge i::before{content:''; position:absolute; inset:0;
    width:calc(var(--v)*1%); border-radius:99px;
    background:linear-gradient(90deg, var(--bleu), var(--lueur));
    box-shadow:0 0 14px rgba(255,233,184,.35)}
  .xp-anim .cas .jauge i::before{width:0; transition:width 1.1s cubic-bezier(.22,.9,.24,1) .25s}
  .xp-anim .cas.vu .jauge i::before{width:calc(var(--v)*1%)}

  /* tableaux : comparatif et tarifs — défilement horizontal sur mobile */
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
  .defile td strong{color:#EAF0FF}
  .defile td:first-child strong{color:#fff; font-family:var(--syne)}
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

  /* s6 : les 5 raisons */
  .raison{margin-top:1.8rem; max-width:49rem; padding-left:1.3rem;
    border-left:2px solid rgba(96,165,250,.25); transition:border-color .5s}
  .raison.vu{border-left-color:rgba(255,233,184,.55)}
  .raison h3{margin-top:0}
  .raison p{margin-top:.55rem; font-size:.96rem}

  /* s7 : FAQ, paires visibles */
  .qa{max-width:47rem; margin-top:2rem}
  .qa h3{position:relative; padding-left:1.6rem; margin-top:0;
    font-size:1.05rem; color:#E2E8F0}
  .qa h3::before{content:'?'; position:absolute; left:0; top:.02em;
    width:1.1rem; height:1.1rem; display:grid; place-items:center;
    font-family:ui-monospace,monospace; font-size:.72rem; color:var(--lueur);
    border:1px solid rgba(255,233,184,.45); border-radius:5px}
  .qa p{margin-top:.7rem; padding-left:1.6rem; font-size:.95rem}

  /* s8 : CTA final + signature */
  .g-s8{position:relative; padding-bottom:4rem}
  .g-s8::before{content:''; position:absolute; left:20%; top:10%;
    width:26rem; height:14rem; pointer-events:none; opacity:0; transition:opacity 1s;
    background:radial-gradient(closest-side, rgba(255,233,184,.16), transparent 70%)}
  .g-s8.allume::before, body:not(.xp-anim) .g-s8::before{opacity:1}
  .g-s8 a{color:var(--lueur); font-weight:700; text-decoration-color:rgba(255,233,184,.5)}
  .g-s8 a:hover{color:#fff}
  .g-s8 .signature{margin-top:2.4rem; padding-top:1.3rem; max-width:52rem;
    border-top:1px solid rgba(148,163,184,.16); font-size:.9rem}
  .g-s8 .signature strong{color:#EAF0FF}

  /* arrivées */
  .xp-anim .ln:not(.vu){opacity:0; transform:translateY(12px)}
  .xp-anim .ln{transition:opacity .5s, transform .5s cubic-bezier(.22,.9,.24,1)}

  @media(max-width:900px){
    .moteurs{grid-template-columns:1fr}
  }
  @media(max-width:640px){
    .medias-grille{grid-template-columns:1fr}
    .offre, .cas{padding:1.2rem 1.1rem}
    .console .rep b{min-width:5.2rem}
  }
  @media (prefers-reduced-motion: reduce){
    .console .con-c{animation:none}
    .jauge i::before{width:calc(var(--v)*1%)}
    .etape::after{transform:scaleY(1)}
    .g-s8::before{opacity:1}
  }
`;

/* phrases mises en lumière (texte inchangé, simplement enveloppé) */
const LUMIERES = [
  'entre 30 et 40 % des requêtes informationnelles',
  'citation IA quasi-immédiate',
  'les IA citent les sources qu’elles jugent fiables, récentes et structurées',
];

export function renduBloc(b, defaut, groupe, i) {
  if (groupe === 'hero' && b.t === 'p' && i === 1)
    return `<p class="lead">${b.html}</p>`;
  if (groupe === 'hero' && b.t === 'p' && i === 4)
    return `<p class="note">${b.html}</p>`;
  if (b.t === 'table')
    return `<div class="defile" tabindex="0" role="region" aria-label="Tableau — défilement horizontal possible">${b.html}</div>`;
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

const CONSOLE = `<div class="console ln" aria-hidden="true">
  <div class="con-b"><i></i><i></i><i></i></div>
  <p class="con-l"><span class="con-p">›</span><span class="con-q" data-texte="meilleure agence référencement IA à Paris ?"></span><span class="con-c"></span></p>
  <div class="con-reps">
    <p class="rep"><b>ChatGPT</b><span>cite</span><strong>Triaina</strong></p>
    <p class="rep"><b>Gemini</b><span>cite</span><strong>Triaina</strong></p>
    <p class="rep"><b>Perplexity</b><span>cite</span><strong>Triaina</strong></p>
  </div>
  <p class="con-note">Illustration — l'objectif du référencement IA : être la source citée</p>
</div>`;

export function renduSection(groupe, s) {
  const env = (interne) => `<section class="xp-sec g-${groupe}">\n${interne}\n</section>`;

  /* hero : la console de réponse s'insère après l'accroche, avant la note */
  if (groupe === 'hero') {
    const rendus = [...s.rendus];
    rendus.splice(rendus.length - 1, 0, CONSOLE);
    return env(rendus.join('\n'));
  }

  /* s1 : les trois paragraphes moteurs deviennent une grille de cartes */
  if (groupe === 's1') {
    const estMoteur = (b) => b.t === 'p' && /^<strong>(ChatGPT|Gemini|Perplexity)/.test(b.html);
    const sortie = [];
    let grille = null;
    s.rendus.forEach((r, i) => {
      if (estMoteur(s.blocs[i])) {
        if (!grille) { grille = []; sortie.push(grille); }
        grille.push(r.replace(/^<p>/, '<p class="moteur">'));
      } else { grille = null; sortie.push(r); }
    });
    return env(sortie.map(x => Array.isArray(x)
      ? `<div class="moteurs ln">\n${x.join('\n')}\n</div>` : x).join('\n'));
  }

  /* s2 : offres en cartes, fiches prix, les 8 médias en grille */
  if (groupe === 's2') {
    const rendus = s.rendus.map((r, i) => {
      const b = s.blocs[i];
      if (b.t === 'ul' && b.html.includes('Les Hardis'))
        return r.replace(/^<ul>/, '<ul class="medias-grille">');
      if (b.t === 'p' && /^(Durée|Tarif)\s*:/.test(b.html.replace(/<[^>]*>/g, '')))
        return r.replace(/^<p>/, '<p class="fiche">');
      return r;
    });
    return env(cartes(rendus, s.blocs, ['h3'], 'offre'));
  }

  /* s3 : le rail des 5 étapes */
  if (groupe === 's3') return env(cartes(s.rendus, s.blocs, ['h3'], 'etape'));

  /* s4 : cas clients + jauge du taux de citation atteint */
  if (groupe === 's4') {
    const assemble = cartes(s.rendus, s.blocs, ['h3'], 'cas');
    return env(assemble.replace(/<div class="cas ln">\n([\s\S]*?)\n<\/div>/g, (tout, dedans) => {
      const v = /0 % à <strong>(\d+)\s*%<\/strong>/.exec(dedans)?.[1];
      if (!v) return tout;
      return `<div class="cas ln">\n${dedans}\n<div class="jauge" aria-hidden="true" style="--v:${v}"><span>taux de citation IA atteint</span><i></i></div>\n</div>`;
    }));
  }

  /* s6 : les 5 raisons */
  if (groupe === 's6') return env(cartes(s.rendus, s.blocs, ['h3'], 'raison'));

  /* s7 : FAQ en paires question/réponse */
  if (groupe === 's7') return env(cartes(s.rendus, s.blocs, ['h3'], 'qa'));

  /* s8 : CTA final + signature */
  if (groupe === 's8') {
    const rendus = s.rendus.map((r, i) => {
      const b = s.blocs[i];
      if (b.t === 'p' && /^Auteure de cette page/.test(b.html.replace(/<[^>]*>/g, '').trim()))
        return `<p class="signature">${b.html}</p>`;
      return r;
    });
    return env(rendus.join('\n'));
  }

  return s.enveloppe;
}

export const JS = `
  /* arrivées : tout ce qui précède un point atteint s'allume aussi */
  var cibles = [].slice.call(document.querySelectorAll(
    '.g-hero .lead, .g-hero .note, .console, .xp-sec h2, .xp-sec h3, ' +
    '.xp-sec > p, .xp-sec > ul, .moteurs, .offre, .etape, .cas, .defile, ' +
    '.raison, .qa, .g-s8 .signature'));
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

  /* la console : la requête se tape, puis les moteurs répondent */
  var con = document.querySelector('.console');
  if (con) {
    var champ = con.querySelector('.con-q');
    var texte = champ.getAttribute('data-texte'), pos = 0, lance = false;
    var tape = function () {
      if (pos <= texte.length) {
        champ.textContent = texte.slice(0, pos++);
        setTimeout(tape, 32);
      } else con.classList.add('fini');
    };
    new IntersectionObserver(function (entrees, obs) {
      entrees.forEach(function (x) {
        if (!x.isIntersecting || lance) return;
        lance = true; obs.disconnect(); setTimeout(tape, 350);
      });
    }, { threshold: .5 }).observe(con);
  }

  /* le halo du CTA final s'allume quand on y arrive */
  var fin = document.querySelector('.g-s8');
  if (fin) new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) { if (x.isIntersecting) fin.classList.add('allume'); });
  }, { threshold: .2 }).observe(fin);`;
