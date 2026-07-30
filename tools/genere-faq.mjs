/**
 * genere-faq.mjs — produit la page /faq du site DA-31.
 *
 * Fidélité : les balises de tête, les schémas (@graph Breadcrumb + FAQPage +
 * graphe Organization du site), le H1, la hiérarchie Hn et TOUS les textes
 * sont repris de la page actuelle, capturée par rendu Chrome réel
 * (tools/snapshots/ancien-faq-contact/faq.json). Les 20 questions/réponses
 * sont embarquées mot pour mot depuis FAQ_DATA (liens des réponses compris),
 * dans l'ordre du rendu. Rien n'est réécrit.
 *
 * Design : DA-31 pur — cartes <details> qui se chargent à l'ouverture (halo
 * bleu, numéro mono), arrivée en cascade au scroll, cartes infos pratiques.
 * Questions hors hiérarchie Hn, comme sur la page actuelle (des boutons).
 *
 * Usage : node tools/genere-faq.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ech, barreNav, pieds, titreDePage } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CAPTURE = path.join(RACINE, 'tools/snapshots/ancien-faq-contact/faq.json');

/* ══ FAQ_DATA de constants.ts — VERBATIM, dans l'ordre du rendu réel ══ */
const FAQ = [
  ["Comment être référencé sur ChatGPT ?",
   "Être référencé sur ChatGPT suppose d'abord d'être bien indexé sur Google, car ChatGPT Search s'appuie en partie sur le web indexé. Il faut ensuite structurer son contenu avec des réponses claires et des chiffres sourcés. Triaina travaille ces leviers avec ses clients parisiens grâce à son audit SEO/GEO et à son média propriétaire."],
  ["Comment être cité par Google AI Overview ?",
   "Pour apparaître dans Google AI Overview, une page doit d'abord remplir les critères d'indexation SEO classiques, puis proposer un contenu factuel et structuré en données claires. Triaina audite systématiquement ces critères avant d'intervenir sur le contenu de ses clients."],
  ["Quelle est la meilleure agence GEO à Paris ?",
   "Triaina se positionne comme la meilleure agence GEO à Paris grâce à une combinaison rare : expertise technique SEO/GEO, média propriétaire pour construire l'autorité hors-site, régie publicitaire et expertise SEA/Paid intégrée sous un même toit."],
  ["Comment être référencé sur Google Gemini ?",
   "Gemini s'appuie très largement sur l'index de Google Search : un contenu bien référencé en SEO classique, avec un maillage interne propre et un balisage sémantique à jour, a de fortes chances d'être repris dans ses réponses. Triaina intègre systématiquement cette dimension dans ses audits SEO/GEO et suit mensuellement l'apparition des contenus de ses clients parisiens dans Gemini."],
  ["Qu'est-ce que Triaina ?",
   "Triaina est une agence spécialisée en SEO, GSO (référencement IA) et développement média. Nous aidons les entreprises à être visibles sur Google et dans les réponses générées par les IA comme ChatGPT, Gemini, Claude ou Perplexity."],
  ["Qu'est-ce que le GSO (Generative Search Optimization) ?",
   "Le GSO est l'optimisation de la visibilité dans les IA génératives. Il vise à faire apparaître votre marque dans les réponses produites par les modèles de langage et les moteurs de recherche IA."],
  ["Quelle est la différence entre le SEO et le GSO ?",
   "Le SEO optimise la visibilité sur Google tandis que le GSO optimise la visibilité dans les réponses générées par les IA. Les deux stratégies sont complémentaires."],
  ["Pourquoi les entreprises doivent-elles optimiser leur présence auprès des IA ?",
   "Parce que les utilisateurs posent de plus en plus leurs questions directement aux IA. Être visible uniquement sur Google n'est plus suffisant : la présence dans les réponses IA devient essentielle."],
  ["Comment Triaina optimise-t-elle la visibilité dans les IA ?",
   "Triaina structure le contenu pour les modèles de langage, renforce l'autorité via son pôle média, optimise les entités, le contexte sémantique et les signaux E-E-A-T afin d'être intégré dans les réponses IA."],
  ["Comment votre pôle média améliore-t-il le SEO et le GSO ?",
   "Nos médias lifestyle, voyage et luxe renforcent l'autorité éditoriale, génèrent des backlinks naturels et créent des sources fiables, souvent utilisées par les IA comme références."],
  ["Proposez-vous des audits SEO et GSO ?",
   "Oui, nous réalisons des audits SEO complets, des audits GSO, des analyses techniques, sémantiques, E-E-A-T, et des diagnostics de visibilité dans les réponses IA."],
  ["Quels types d'entreprises accompagnez-vous ?",
   "PME, ETI, groupes, e-commerces, marques travel, luxe, tech, SaaS."],
  ["Comment savoir si mon site est prêt pour le référencement IA ?",
   "Nous analysons : vos données structurées, votre profondeur sémantique, votre autorité éditoriale, la clarté de vos entités, et votre présence dans les moteurs IA."],
  ["Triaina est-elle vraiment une agence pionnière dans le GSO ?",
   "Oui : nos associés créent des agences SEO depuis 2000, ont monté un groupe média en 2014, et ont pris le virage IA dès 2024. Triaina fait partie des premières agences SEO IA hybrides en France."],
  ["Qu'est-ce que le GEO (Generative Engine Optimization) ou référencement IA ?",
   `Le GEO est l'optimisation de la visibilité d'une marque dans les réponses des IA génératives : ChatGPT, Perplexity, Gemini, Google AI Overview. Distinct du SEO classique qui cible Google Search. Le trafic issu des LLM a progressé de +527 % en un an. Le GEO repose sur 4 piliers : autorité de domaine, contenu structuré et extractible, E-E-A-T, citations tierces. Consultez notre <a href="/blog/geo-definition-2026">définition complète du GEO</a>.`],
  ["Comment être référencé dans ChatGPT et les autres IA ?",
   `Être référencé dans ChatGPT et les IA génératives repose sur 4 leviers : (1) autorité SEO Google solide — les IA crawlent les mêmes sources que Google, (2) contenu structuré avec réponses directes et schema FAQ, (3) signaux E-E-A-T forts (auteur vérifié, sources primaires), (4) citations tierces dans des sources que les LLM consomment. Triaina accélère ce processus grâce à son groupe média propriétaire, qui génère des citations dans des sources directement indexées par les LLM. Découvrez notre <a href="/blog/etre-cite-par-chatgpt">guide pour être cité par ChatGPT</a>.`],
  ["Combien coûte une agence SEO et GEO à Paris ?",
   /* Tarifs alignés le 29/07/2026 sur ceux de la page d'accueil, seule version
      à jour fournie par Lucas. L'ancienne rédaction annonçait un audit « entre
      1 500 € et 3 000 € » et répétait deux fois « à partir de 500 €/mois » —
      un visiteur qui comparait les deux pages tombait sur deux réponses
      différentes à la même question, et les IA qui recoupent le site aussi. */
   `Les tarifs d'une agence SEO et GEO à Paris varient selon le périmètre. Un audit SEO + GEO complet est disponible à partir de 1 700 €. L'accompagnement démarre à partir de 500 €/mois pour les sites de taille réduite, et à partir de 1 000 €/mois pour une stratégie SEO et GEO combinée. Les offres hybrides SEO + GEO de Triaina sont établies sur devis selon la taille du site, le secteur et les objectifs. Un pré-audit gratuit de 30 minutes est proposé pour cadrer le budget avant tout engagement. <a href="/contact">Demandez un audit gratuit</a>.`],
  ["Quelle différence entre SEO, GEO et GSO ?",
   `SEO (Search Engine Optimization) = optimisation pour les moteurs de recherche classiques comme Google (liens bleus). GEO (Generative Engine Optimization) = optimisation pour les moteurs IA génératifs : ChatGPT, Perplexity, Gemini. GSO (Generative Search Optimization) = approche propriétaire Triaina qui combine SEO + GEO + contrôle des sources via groupe média et régie. Les trois disciplines sont complémentaires : un bon SEO facilite le GEO, et le GSO amplifie les deux. En savoir plus sur <a href="/expertise-gso">notre expertise GSO</a>.`],
  ["En combien de temps voit-on des résultats en SEO et en GEO ?",
   `En SEO, les premiers signaux (positions gagnées, trafic en hausse) apparaissent entre 2 et 4 mois. La consolidation dans le top 3 sur des mots-clés concurrentiels demande 6 à 12 mois — c'est lié à l'algorithme Transition Rank de Google, qui observe les pages sur ~90 jours avant de stabiliser leur position. En GEO, les premières citations IA peuvent apparaître sous 4 à 8 semaines si la stratégie de contenu et d'autorité est bien exécutée. Triaina mesure les citations IA dès le premier mois pour ajuster la stratégie en continu. Découvrez <a href="/agence-referencement-ia">notre offre de référencement IA</a>.`],
  ["Comment mesurer sa visibilité dans les IA génératives ?",
   `Trois méthodes pour mesurer sa visibilité dans les IA : (1) test manuel en navigation privée — taper ses requêtes cibles dans ChatGPT, Perplexity et Gemini et vérifier si la marque est citée, (2) Google Search Console — le rapport « AI Overviews » (disponible depuis juin 2026) indique les impressions générées par les réponses IA de Google, (3) outils de tracking GEO tiers pour un suivi automatisé des citations. Triaina intègre le suivi des citations IA dans tous ses reportings mensuels clients. En savoir plus sur <a href="/expertise-gso">notre expertise GSO</a>.`],
];

const STYLE = `
  /* ══════════════════════════════════════════════════════════════════════
     DA-36 « Le Grand Index » — /faq. UNE grande idée : la FAQ est un index
     typographique monumental, un registre de 20 lignes bord à bord — numéro
     display creux au bord gauche, question en Syne, réponse dans une colonne
     de lecture — et la lumière descend le long du registre au fil du scroll.
     Markup <details> inchangé, texte et SEO gelés.
     ══════════════════════════════════════════════════════════════════════ */
  .page{overflow-x:clip}
  .faq-wrap{position:relative; z-index:2; max-width:64rem; margin:0 auto;
    padding:0 var(--marge)}

  /* ── hero typographique pleine largeur ── */
  .faq-hero{padding:8.5rem 0 0; text-align:left; margin-bottom:0}
  .faq-hero h1{font-family:var(--syne); font-weight:800; color:#fff; letter-spacing:-.025em;
    font-size:clamp(2.6rem,7vw,5.4rem); line-height:.94;
    text-shadow:0 0 110px rgba(37,99,235,.5)}
  .faq-hero h1 em{font-style:normal; display:block;
    background:linear-gradient(90deg,var(--bleu),var(--bleu-p));
    -webkit-background-clip:text; background-clip:text; color:transparent}
  /* la ligne mono s'étire d'un bord à l'autre */
  .faq-hero .sous-k{margin:2rem 0 0; display:flex; align-items:center; gap:1.2rem;
    justify-content:flex-start; font-family:ui-monospace,monospace; font-size:.66rem;
    letter-spacing:.22em; text-transform:uppercase; color:var(--brume);
    padding-bottom:2.6rem}
  .faq-hero .sous-k i{flex:1; height:1px; width:auto;
    background:linear-gradient(90deg, rgba(255,233,184,.6), rgba(96,165,250,.3));
    align-self:center}

  /* ── le registre : 20 lignes bord à bord, la lumière descend à gauche ── */
  .ql{position:relative; display:block; margin-bottom:0; gap:0}
  .ql::before{content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
    background:rgba(148,163,184,.14)}
  .ql::after{content:''; position:absolute; left:0; top:0; width:2px;
    height:calc(var(--trace,0)*100%);
    background:linear-gradient(180deg,var(--lueur),var(--bleu-c));
    box-shadow:0 0 16px rgba(255,233,184,.5)}
  .q{border:0; border-radius:0; background:transparent; overflow:visible;
    border-top:1px solid rgba(148,163,184,.16); transition:background .35s}
  .q:last-child{border-bottom:1px solid rgba(148,163,184,.16)}
  .q:hover{border-color:rgba(148,163,184,.16)}
  .q[open]{border-color:rgba(148,163,184,.16); box-shadow:none; transform:none;
    background:linear-gradient(90deg, rgba(37,99,235,.07), transparent 60%)}
  .q summary{display:grid; align-items:baseline;
    grid-template-columns:clamp(3.6rem,7vw,5.6rem) minmax(0,1fr) 2rem;
    gap:clamp(.8rem,2vw,1.6rem); padding:clamp(1rem,2vw,1.5rem) .2rem}
  /* numéro display : creux au repos, or plein quand la ligne est ouverte */
  .q .qn{font-family:var(--syne); font-weight:800;
    font-size:clamp(1.4rem,3vw,2.6rem); line-height:1; color:transparent;
    -webkit-text-stroke:1.4px rgba(96,165,250,.45);
    transition:color .45s, text-shadow .45s}
  @supports not (-webkit-text-stroke:1px #000){.q .qn{color:rgba(96,165,250,.6)}}
  .q[open] .qn, .q summary:hover .qn{color:var(--lueur);
    -webkit-text-stroke:0px transparent; text-shadow:0 0 30px rgba(255,233,184,.5)}
  .q .qt{font-family:var(--syne); font-weight:700; text-transform:uppercase;
    letter-spacing:.01em; color:#CBD5E1; line-height:1.3;
    font-size:clamp(1rem,1.9vw,1.35rem); transition:color .3s}
  .q[open] .qt, .q summary:hover .qt{color:#fff}
  .q .pm{font-family:var(--manrope); font-weight:300; font-size:clamp(1.5rem,2.4vw,2.2rem);
    line-height:1; color:var(--bleu-c); transition:transform .3s; justify-self:end}
  .q[open] .pm{transform:rotate(45deg)}
  /* la réponse s'imprime dans la colonne de lecture */
  .q .rep{margin-left:clamp(0rem,9vw,7.2rem); max-width:60ch;
    padding:.2rem .2rem clamp(1.3rem,2.4vw,2rem);
    border-top:0; color:var(--brume); font-size:.96rem; line-height:1.8;
    animation:rep-in .5s cubic-bezier(.22,.9,.24,1)}
  @keyframes rep-in{from{opacity:0; transform:translateY(12px)} to{opacity:1; transform:none}}
  @media(max-width:880px){
    .q summary{grid-template-columns:auto minmax(0,1fr) 1.6rem; gap:.9rem}
    .q .qn{font-size:1.3rem; -webkit-text-stroke-width:1px}
    .q .qt{font-size:1rem}
    .q .rep{margin-left:0}
    .ql::before,.ql::after{display:none}
  }
  .q .rep .chev{font-family:ui-monospace,monospace; color:var(--bleu-c); margin-right:.6rem}
  .q .rep a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px;
    transition:color .3s}
  .q .rep a:hover{color:var(--lueur)}
  /* le lien de conversion des réponses ressort en capsule */
  .q .rep a[href="/contact"]{display:inline-flex; margin-top:.5rem; padding:.5rem 1.05rem;
    background:var(--bleu); color:#fff; border-radius:99px; text-decoration:none;
    font-weight:700; font-size:.8rem; letter-spacing:.08em}
  .q .rep a[href="/contact"]:hover{background:var(--bleu-nuit); color:#fff}

  /* ── infos pratiques : bande scindée jusqu'aux bords ── */
  .infos{border-top:0; padding-top:0; margin-top:0}
  .infos h3{font-family:ui-monospace,monospace; font-weight:400; font-size:.62rem;
    letter-spacing:.26em; text-transform:uppercase; color:var(--bleu-c);
    text-align:left; padding:2.6rem 0 1.4rem; margin:0}
  .infos .duo{display:grid; grid-template-columns:1fr 1fr; gap:0;
    border-top:1px solid rgba(148,163,184,.16)}
  @media(max-width:720px){.infos .duo{grid-template-columns:1fr}}
  .carte-info{display:flex; gap:1.1rem; align-items:flex-start;
    border:0; border-radius:0; background:transparent;
    padding:clamp(1.6rem,3vw,2.4rem) clamp(1rem,2vw,1.8rem)}
  .carte-info:first-child{padding-left:0}
  .carte-info+.carte-info{border-left:1px solid rgba(148,163,184,.16)}
  @media(max-width:720px){.carte-info+.carte-info{border-left:0;
    border-top:1px solid rgba(148,163,184,.16)}}
  .carte-info:hover{border-color:rgba(148,163,184,.16); box-shadow:none}
  .carte-info .ic{flex:none; width:44px; height:44px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    background:rgba(37,99,235,.16); color:var(--bleu-c)}
  .carte-info .ic svg{width:20px; height:20px; fill:none; stroke:currentColor;
    stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round}
  .carte-info h4{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1rem,1.6vw,1.3rem); margin-bottom:.5rem}
  .carte-info address, .carte-info .lignes{font-family:ui-monospace,monospace;
    font-style:normal; font-size:.84rem; color:var(--brume); line-height:1.75}
  .carte-info .lignes b{display:block; color:var(--bleu-c); font-weight:700; margin-top:.2rem}

  /* arrivée en cascade (additive) */
  .faq-anim :is(.q,.infos h3,.carte-info){transition:opacity .6s,
    transform .6s cubic-bezier(.22,.9,.24,1), background .35s}
  .faq-anim :is(.q,.infos h3,.carte-info):not(.vu){opacity:0; transform:translateY(20px)}

  @media (prefers-reduced-motion: reduce){
    .q .rep{animation:none}
    .ql::after{display:none}
    .q .qn{color:rgba(96,165,250,.7); -webkit-text-stroke:0px transparent}
  }
`;

const ICONES = {
  lieu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  horloge: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
};

/* Questions dont la réponse s'écarte SCIEMMENT de l'ancienne page.
   Toute entrée ici doit être justifiée : le reste du garde-fou n'a de valeur
   que si les exceptions sont nommées une par une. */
const REPONSES_REECRITES = new Set([
  'Combien coûte une agence SEO et GEO à Paris ?',
]);

/**
 * Le schéma FAQPage vient de la capture de l'ancienne page : quand on réécrit
 * une réponse VISIBLE (cf. REPONSES_REECRITES), il faut le suivre, sinon la
 * page affiche un tarif et déclare l'autre — exactement la contradiction qu'on
 * cherchait à supprimer. On rejoue donc la réponse depuis le tableau FAQ.
 */
function synchroniseSchemaFaq(schemas, FAQ) {
  const plat = s => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const parQuestion = new Map(FAQ.map(([q, r]) => [plat(q), plat(r)]));
  let n = 0;
  const visite = d => {
    if (Array.isArray(d)) return d.forEach(visite);
    if (!d || typeof d !== 'object') return;
    if (d['@graph']) visite(d['@graph']);
    if (d['@type'] === 'FAQPage') {
      for (const q of d.mainEntity ?? []) {
        const attendue = parQuestion.get(plat(q.name ?? ''));
        if (!attendue || !q.acceptedAnswer) continue;
        if (plat(q.acceptedAnswer.text ?? '') === attendue) continue;
        q.acceptedAnswer.text = attendue;
        n++;
        console.log(`  schéma FAQ resynchronisé : « ${q.name} »`);
      }
    }
  };
  visite(schemas);
  return n;
}

async function main() {
  const cap = JSON.parse(await readFile(CAPTURE, 'utf8'));
  if (!cap.title || !cap.description) throw new Error('capture incomplète');
  synchroniseSchemaFaq(cap.schemas, FAQ);

  /* Parité : chaque question et chaque réponse (débarrassée de ses balises)
     doit exister mot pour mot dans le texte capturé de la page actuelle. */
  const plat = s => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [q, r] of FAQ) {
    if (!cap.texteIntegral.includes(plat(q))) throw new Error(`question absente de la capture : ${q.slice(0, 50)}`);
    /* Réponses volontairement réécrites : le garde-fou reste actif sur les 19
       autres. Ici les tarifs de l'ancienne page contredisaient ceux de la home
       (validé par Lucas le 29/07) — c'est un écart voulu, pas une dérive. */
    if (REPONSES_REECRITES.has(plat(q))) continue;
    if (!cap.texteIntegral.includes(plat(r).slice(0, 120))) throw new Error(`réponse absente de la capture : ${q.slice(0, 50)}`);
  }
  if (FAQ.length !== 20) throw new Error('20 questions attendues');

  const meta = (o) => Object.entries(o)
    .map(([k, v]) => `<meta ${k.startsWith('og:') ? 'property' : 'name'}="${k}" content="${ech(v)}">`).join('\n');

  const questions = FAQ.map(([q, r], i) => `      <details class="q">
        <summary><span class="qn">0${i + 1}</span><span class="qt">${ech(q)}</span><span class="pm" aria-hidden="true">+</span></summary>
        <div class="rep"><span class="chev">&gt;</span>${r}</div>
      </details>`).join('\n');

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(titreDePage('faq', cap.title))}</title>
<meta name="description" content="${ech(cap.description)}">
${cap.keywords ? `<meta name="keywords" content="${ech(cap.keywords)}">` : ''}
<link rel="canonical" href="${ech(cap.canonical)}">
<meta name="ICBM" content="${ech((cap.geo['geo.position'] ?? '').replace(';', ', '))}">
<meta name="msvalidate.01" content="4C58C9622B2DBB31ECD9A463E3DCAF66">
<link rel="alternate" hreflang="fr" href="${ech(cap.canonical)}">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
${meta(cap.geo)}
${meta(cap.og)}
${meta(cap.twitter)}
<link rel="preload" href="/assets/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
<style>${STYLE}</style>
${cap.schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav('/faq')}

<a class="chip" id="chip" href="/contact" aria-label="Recevoir mon pré-audit gratuit">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"/></svg>
  Pré-audit gratuit
</a>

<main class="page">
  <div class="faq-wrap">

    <header class="faq-hero">
      <h1>FAQ <em>SYSTÈME</em></h1>
      <p class="sous-k"><span>// Base de Connaissance</span><i aria-hidden="true"></i><span>// Résolution</span></p>
    </header>

    <div class="ql">
${questions}
    </div>

    <section class="infos" aria-label="Informations pratiques">
      <h3>Informations Pratiques</h3>
      <div class="duo">
        <div class="carte-info">
          <span class="ic" aria-hidden="true">${ICONES.lieu}</span>
          <div>
            <h4>Siège Social</h4>
            <address>50 Quai Louis Blériot<br>75016 Paris<br>France</address>
          </div>
        </div>
        <div class="carte-info">
          <span class="ic" aria-hidden="true">${ICONES.horloge}</span>
          <div>
            <h4>Horaires d'Ouverture</h4>
            <div class="lignes"><p>Lundi - Vendredi</p><b>08:00 - 19:00</b></div>
          </div>
        </div>
      </div>
    </section>

  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
<script>
/* Arrivée en cascade — additive : sans JS ou en motion réduit, tout est visible. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  document.body.classList.add('faq-anim');
  var cibles = [].slice.call(document.querySelectorAll('.q, .infos h3, .carte-info'));
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('vu');
      obs.unobserve(x.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  cibles.forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    obs.observe(el);
  });

  /* la lumière descend le long du registre (un rAF sur scroll, passif) */
  var ql = document.querySelector('.ql');
  var attente = false;
  function trace() {
    attente = false;
    if (!ql) return;
    var r = ql.getBoundingClientRect();
    var p = (innerHeight * 0.7 - r.top) / Math.max(r.height, 1);
    ql.style.setProperty('--trace', Math.min(1, Math.max(0, p)).toFixed(4));
  }
  trace();
  addEventListener('scroll', function () {
    if (!attente) { attente = true; requestAnimationFrame(trace); }
  }, { passive: true });

  /* réponse ouverte sous la ligne de flottaison : on la ramène en vue */
  [].slice.call(document.querySelectorAll('.q')).forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      var rep = d.querySelector('.rep');
      if (rep && rep.getBoundingClientRect().bottom > innerHeight) {
        rep.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  });
})();
</script>
</body>
</html>
`;

  const dossier = path.join(RACINE, 'site/faq');
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, 'index.html'), html);

  const titres = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => m[1] + ':' + m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

  /* ══ GARDE-FOU DE PARITÉ DU TEXTE ══
     Toute refonte visuelle doit laisser le texte du <main> identique au
     caractère près à la référence figée (tools/reference/faq-texte.txt).
     Divergence = échec de génération, avec le mot exact pointé. */
  const corpsMain = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)[1];
  const texteMain = corpsMain
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8239;|&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ').trim();
  const refTexte = (await readFile(path.join(RACINE, 'tools/reference/faq-texte.txt'), 'utf8')).trim();
  if (texteMain !== refTexte) {
    const A = refTexte.split(' '), B = texteMain.split(' ');
    let i = 0;
    while (i < A.length && i < B.length && A[i] === B[i]) i++;
    throw new Error('TEXTE MODIFIÉ — refonte purement visuelle exigée.\n'
      + `  premier écart au mot ${i} (${A.length} attendus, ${B.length} produits)\n`
      + `  attendu : …${A.slice(Math.max(0, i - 6), i + 8).join(' ')}…\n`
      + `  produit : …${B.slice(Math.max(0, i - 6), i + 8).join(' ')}…`);
  }
  console.log('page /faq générée');
  console.log('  title       :', cap.title);
  console.log('  canonical   :', cap.canonical);
  console.log('  JSON-LD     :', cap.schemas.length, 'bloc(s), reconduits de la capture');
  console.log('  questions   :', FAQ.length, '(parité capture vérifiée)');
  console.log('  h1          :', titres.filter(x => x.startsWith('1:')).map(x => x.slice(2)));
  const h1 = titres.filter(x => x.startsWith('1:'));
  if (h1.length !== 1 || h1[0] !== '1:' + cap.h1[0]) throw new Error('h1 ≠ capture');
}

main().catch(e => { console.error(e.message); process.exit(1); });
