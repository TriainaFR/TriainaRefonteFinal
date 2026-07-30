/**
 * annuaire.mjs — « Le Répertoire » : le hub du maillage. Les rubriques en
 * colonnes de répertoire, chaque lien sur sa rangée avec une pastille-flèche
 * d'or qui s'avance au survol et s'allume à l'entrée. AMÉLIORATIONS SEO
 * AUTORISÉES PAR LUCAS (29/07), toutes documentées :
 *  · les 42 liens du répertoire, servis en href="#" par l'ancienne SPA
 *    (maillage invisible des crawlers), sont MATÉRIALISÉS en vraies URLs
 *    (résolution via PAGE_TO_URL de constants.ts, cibles vérifiées) — fait
 *    dans tools/contenus/annuaire.json ;
 *  · le bouton final devient un vrai lien vers /agence-referencement-ia-paris ;
 *  · le schéma CollectionPage de l'ancien site pointait vers des URLs
 *    INEXISTANTES (ex. /blog/agence-seo-angers au lieu de …-2026) :
 *    réparées ici quand la cible réelle existe (règle : URL exacte sinon
 *    variante -2026 sinon inchangée+signalée) ;
 *  · ajout d'un BreadcrumbList (Accueil › Annuaire), absent de l'ancien site.
 *  · SEUL lien laissé en # : « meilleure agence référencement IA France »
 *    (id absent de la table de routage — déjà cassé sur l'ancien site).
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = fileURLToPath(new URL('../..', import.meta.url));

export const STYLE = `
  /* ── Le Répertoire ── */
  .g-s0{padding-top:8.5rem; padding-bottom:.5rem}
  .g-s0 h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(2.1rem,4.6vw,3.4rem); line-height:1.1;
    max-width:26ch}
  .g-s0 p{max-width:46rem; color:var(--brume); line-height:1.75; margin-top:1rem}

  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.4rem,2.6vw,2rem); margin-bottom:1.2rem; position:relative;
    padding-left:1.3rem}
  .xp-sec h2::before{content:''; position:absolute; left:0; top:.32em;
    width:0; height:0; border-top:6px solid transparent;
    border-bottom:6px solid transparent; border-left:10px solid var(--lueur);
    transition:transform .45s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .xp-sec h2:not(.vu)::before{transform:translateX(-8px); opacity:.3}
  .xp-sec h3{font-family:ui-monospace,monospace; font-weight:400; font-size:.66rem;
    letter-spacing:.2em; text-transform:uppercase; color:var(--bleu-c);
    margin-top:1.4rem}
  .xp-sec p{max-width:46rem; color:var(--brume); line-height:1.72; margin-top:.8rem}

  /* les rangées du répertoire : chaque lien vit sur sa ligne */
  .xp-sec li{list-style:none; margin:0; padding:0}
  .xp-sec ul{max-width:46rem; margin-top:.6rem}
  .xp-sec li a{display:flex; align-items:baseline; gap:.7rem;
    padding:.62rem .2rem; border-bottom:1px solid rgba(148,163,184,.12);
    color:#CBD5E1; text-decoration:none; font-size:.96rem;
    transition:color .25s, padding-left .25s}
  .xp-sec li a::before{content:''; flex:none; width:7px; height:7px;
    border-radius:50%; align-self:center;
    background:rgba(96,165,250,.45); transition:background .3s, box-shadow .3s}
  .xp-sec li a:hover{color:#fff; padding-left:.55rem}
  .xp-sec li a:hover::before{background:var(--lueur);
    box-shadow:0 0 8px rgba(255,233,184,.6)}
  /* le lien resté cassé sur l'ancien site (voir en-tête) : neutre */
  .xp-sec li a[href="#"]{color:var(--brume)}

  /* rubriques en colonnes ≥900px quand deux listes se suivent */
  .rep-duo{display:grid; grid-template-columns:1fr 1fr; gap:0 clamp(1.8rem,3vw,3rem)}
  @media(max-width:900px){.rep-duo{grid-template-columns:1fr}}
  .rep-duo > div{min-width:0}

  /* CTA final */
  .g-s6 .xp-cta{margin-top:1.6rem}
  .g-s6 .xp-cta a{display:inline-flex; background:var(--bleu); color:#fff;
    font-weight:800; font-size:.82rem; letter-spacing:.13em; text-transform:uppercase;
    padding:1.1rem 2rem; border-radius:99px; text-decoration:none; border-bottom:0;
    transition:background .25s, color .25s, transform .2s}
  .g-s6 .xp-cta a::before{display:none}
  .g-s6 .xp-cta a:hover{background:var(--lueur); color:#0B1428;
    transform:translateY(-2px); padding-left:2rem}

  /* arrivées */
  .xp-anim .rp:not(.vu){opacity:0; transform:translateY(12px)}
  .xp-anim .rp{transition:opacity .5s, transform .5s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .xp-sec h2::before{transform:none; opacity:1}
  }
`;

/* ── améliorations de schéma (documentées dans l'en-tête) ── */
export function transformeSchemas(schemas) {
  const existe = u => {
    try {
      const chemin = new URL(u).pathname.replace(/\/$/, '');
      return existsSync(path.join(RACINE, 'site', chemin, 'index.html'));
    } catch { return false; }
  };
  let repares = 0, laisses = [];
  for (const s of schemas) {
    const liste = s && s.mainEntity && s.mainEntity.itemListElement;
    if (!Array.isArray(liste)) continue;
    for (const item of liste) {
      if (!item.url || existe(item.url)) continue;
      const variante = item.url.replace(/\/?$/, '') + '-2026';
      if (existe(variante)) { item.url = variante; repares++; }
      else laisses.push(item.url);
    }
  }
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.triaina.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Annuaire', item: 'https://www.triaina.fr/annuaire' },
    ],
  });
  console.log(`  annuaire — schéma CollectionPage : ${repares} URL réparées (-2026)` +
    (laisses.length ? `, ${laisses.length} laissées : ${laisses.join(' ')}` : '') +
    ' ; BreadcrumbList ajouté');
  return schemas;
}

export function renduSection(groupe, s) {
  /* deux listes qui se suivent sous des h3 → colonnes de répertoire */
  const interne = s.interne.replace(
    /(<h3>[\s\S]*?<\/h3>\n<ul>[\s\S]*?<\/ul>)\n(<h3>[\s\S]*?<\/h3>\n<ul>[\s\S]*?<\/ul>)/g,
    '<div class="rep-duo"><div>$1</div>\n<div>$2</div></div>');
  return `<section class="xp-sec g-${groupe}">\n${interne}\n</section>`;
}

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll('.xp-sec h2, .xp-sec h3, .xp-sec p, .xp-sec ul, .xp-cta'));
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      for (var j = 0; j <= cibles.indexOf(x.target); j++) {
        cibles[j].classList.add('vu');
        io.unobserve(cibles[j]);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  cibles.forEach(function (el) { el.classList.add('rp'); io.observe(el); });
`;
