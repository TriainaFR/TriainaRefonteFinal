/**
 * genere-expertise-seo.mjs — produit la page /expertise-seo du site DA-31.
 *
 * Source : le code de l'ancien site (views/Expertise.tsx, bloc
 * `id === 'expertise-seo'`, lignes 57-318) — pas une capture de rendu : le
 * composant est déterministe, lire la source est plus fiable que la mesurer.
 * Balises de tête recomposées EXACTEMENT comme <SEO> les pose :
 *   title      = `${title} | Triaina`      (exactTitle non passé)
 *   og:title   = title brut, og:url = canonicalUrl
 *   og:image / twitter:image = valeur par défaut du composant
 *   keywords / geo / ICBM = valeurs de index.html, que la page ne surcharge pas
 * Le schéma @graph (Article + BreadcrumbList + FAQPage) est repris à l'octet.
 *
 * ⚠︎ ARBITRAGE SIGNALÉ À LUCAS : l'ancienne page déclare un FAQPage de
 * 5 questions qui n'existent NULLE PART dans le HTML. Google exige que le
 * contenu balisé en FAQPage soit visible ; sans ça le balisage est ignoré (et
 * expose à une action manuelle). Les 5 questions sont donc AFFICHÉES ici,
 * mot pour mot depuis le schéma — aucune invention, aucun retrait.
 *
 * Design : DA-31 (nuit, or = lumière, bleu = marque) — hero à halo, cartes
 * qui s'allument, panneau « 4 piliers », méthodologie numérotée, FAQ en
 * <details>. Révélations au scroll additives.
 *
 * Usage : node tools/genere-expertise-seo.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ech, barreNav, pieds } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));

/* Le graphe global du site (LocalBusiness/Organization + WebSite) est servi
   sur CHAQUE page par l'ancienne SPA — il est statique dans index.html, donc
   invisible dans views/Expertise.tsx. L'oublier ferait perdre un bloc JSON-LD
   à la page : on le relit sur une page déjà migrée, qui le porte à l'identique. */
const SOURCE_GRAPHE = path.join(RACINE, 'site/faq/index.html');

/* ══ Signaux de tête, tels que <SEO> les produit sur cette route ══ */
const TITRE_BRUT = 'Expertise SEO : Agence Référencement Naturel';
const DESCRIPTION = 'Agence SEO experte en référencement naturel. Audit SEO, stratégie de mots-clés et optimisation technique pour dominer Google.';
const CANONICAL = 'https://www.triaina.fr/expertise-seo';
const IMAGE = 'https://www.triaina.fr/og-image.jpg';   // défaut du composant SEO
const KEYWORDS = 'agence seo, agence gso, consultant seo, audit seo, référencement naturel, agence seo paris, référencement ia, generative search optimization';

/* ══ Schéma @graph — copie conforme de views/Expertise.tsx ══ */
const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Expertise SEO : Agence Spécialisée en Référencement Naturel',
      description: "Découvrez l'expertise SEO de Triaina : agence de référencement naturel avec audit SEO, stratégie et consultant expert.",
      image: 'https://www.triaina.fr/nos-expertises/seo/og-image.jpg',
      author: { '@type': 'Organization', name: 'Triaina' },
      datePublished: '2026-02-02',
      dateModified: '2026-02-02',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.triaina.fr/' },
        { '@type': 'ListItem', position: 2, name: 'Nos Expertises', item: 'https://www.triaina.fr/expertise-seo' },
        { '@type': 'ListItem', position: 3, name: 'Expertise SEO', item: 'https://www.triaina.fr/expertise-seo' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: "Qu'est-ce qu'une agence SEO ?", acceptedAnswer: { '@type': 'Answer', text: "Une agence SEO est spécialisée en référencement naturel. Elle optimise votre site pour améliorer votre visibilité sur Google et les moteurs de recherche." } },
        { '@type': 'Question', name: 'Pourquoi choisir une agence SEO ?', acceptedAnswer: { '@type': 'Answer', text: "Une agence SEO vous offre expertise, outils puissants et équipe complète pour une stratégie de référencement naturel efficace et mesurable." } },
        { '@type': 'Question', name: 'Quels sont les 4 piliers du SEO ?', acceptedAnswer: { '@type': 'Answer', text: "Les 4 piliers du SEO sont : SEO technique, contenu et mots-clés, netlinking et autorité, UX et engagement." } },
        { '@type': 'Question', name: 'Combien de temps pour voir les résultats du SEO ?', acceptedAnswer: { '@type': 'Answer', text: "Le SEO est un investissement long terme. Les premiers résultats apparaissent généralement après 3-6 mois." } },
        { '@type': 'Question', name: 'Quel est le ROI du SEO ?', acceptedAnswer: { '@type': 'Answer', text: "Le SEO génère un trafic organique durable avec un ROI particulièrement intéressant comparé à la publicité." } },
      ],
    },
  ],
};

/* ══ Contenu de la page — VERBATIM de views/Expertise.tsx ══ */
const OPTIMISE = [
  'Vos mots-clés → Pour attirer le bon trafic',
  'Votre contenu → Pour répondre aux questions',
  'La structure de votre site → Pour Google',
  'La vitesse de chargement → Pour l\'UX',
  'Vos backlinks → Pour l\'autorité',
  'Vos balises HTML → Pour le classement',
];

const POURQUOI = [
  ['Un ROI Imbattable', 'tendance',
   "Le SEO génère un trafic organique durable. C'est un levier d'acquisition puissant avec un retour sur investissement supérieur à la publicité payante sur le long terme."],
  ['Maximiser votre Visibilité', 'cible',
   "Plus de 60 % des clics se font sur les 3 premiers résultats. Dominez votre marché et capturez le trafic de vos concurrents en étant visible."],
  ['Augmenter vos Conversions', 'clic',
   "En optimisant l'UX et la pertinence, le SEO transforme vos visiteurs en clients. Un site rapide et clair convertit mieux."],
];

const PILIERS = [
  ['Pilier 1 : SEO Technique', 'puce',
   'Vitesse, Mobile, SSL, Structure URL. Nous rendons votre site lisible et rapide pour Google.'],
  ['Pilier 2 : Contenu & Mots-clés', 'livre',
   "Réponse aux intentions de recherche. Création de contenus experts qui attirent du trafic qualifié."],
  ['Pilier 3 : Netlinking & Autorité', 'globe',
   'Stratégie de backlinks haute qualité. Nous construisons votre crédibilité aux yeux des moteurs.'],
  ['Pilier 4 : UX & Engagement', 'couches',
   "Navigation fluide, temps de session. L'expérience utilisateur est un facteur clé de classement."],
];

const METHODE = [
  ['01', 'Analyse des Besoins', 'Objectifs business, analyse marché et concurrence.'],
  ['02', 'Audit SEO Complet', 'Technique, Sémantique, Off-page. Identification des freins.'],
  ['03', 'Stratégie Sur Mesure', "Plan d'action, roadmap mots-clés, calendrier éditorial."],
  ['04', 'Mise en Place', 'Optimisations techniques, rédaction, déploiement netlinking.'],
  ['05', 'Reporting & Itération', 'Suivi des KPI, ajustements continus face aux algos.'],
];

const OUTILS = ['Semrush', 'Ahrefs', 'Screaming Frog', 'GSC', 'GA4', 'Majestic', 'LLMs'];

const SERVICES = [
  ['Audit SEO', 'Le diagnostic complet pour fixer le cap.'],
  ['Refonte de Site', 'Migration sécurisée sans perte de trafic.'],
  ['Netlinking', "Campagnes de liens pour booster l'autorité."],
  ['SEO International', 'Déploiement Hreflang et stratégie multilingue.'],
  ['E-réputation', 'Maîtrise de votre image de marque dans les SERP.'],
  ['Consulting SEO', 'Accompagnement ponctuel ou annuel.'],
];

/* Icônes : équivalents en trait des lucide-react de la page actuelle. */
const IC = {
  base: '<path d="M3 5c0-1.7 4-3 9-3s9 1.3 9 3-4 3-9 3-9-1.3-9-3Z"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
  tendance: '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
  cible: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  clic: '<path d="M9 4v2M4 9h2M4.9 4.9l1.4 1.4"/><path d="m10 10 9 3.5-3.8 1.3L13.6 19 10 10Z"/>',
  puce: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3"/>',
  livre: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 5.5v16"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z"/>',
  couches: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  trophee: '<path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 14v4M9 21h6"/>',
  eclair: '<path d="M13 2 3 14h7l-1 8 12-14h-8z"/>',
  coche: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-5"/>',
  fleche: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
};

const FAQ_VISIBLE = SCHEMA['@graph'][2].mainEntity.map(q => [q.name, q.acceptedAnswer.text]);

const STYLE = `
  /* ══════════════════════════════════════════════════════════════════════
     DA-35 « Balayage » — /expertise-seo. UNE grande idée : un faisceau de
     lumière plein écran suit le scroll et balaie latéralement, allumant tour
     à tour des blocs ancrés en zigzag aux deux bords du viewport, avant de
     s'immobiliser sur le CTA final. Scroll 100 % naturel — aucun épinglage.
     Texte et SEO gelés. Grammaire commune : bord à bord, filets (pas de
     boîtes), or = allumé, breakpoint 900, un seul rAF, éteint ≥ .55.
     ══════════════════════════════════════════════════════════════════════ */
  .page{overflow-x:clip}
  .xp-wrap{position:relative; z-index:2; max-width:74rem; margin:0 auto;
    padding:0 var(--marge)}

  /* le faisceau : calque fixe, déplacé uniquement par transform (lerp en JS) */
  .faisceau-x{position:fixed; inset:0; pointer-events:none; z-index:1;
    mix-blend-mode:screen; opacity:.45}
  .faisceau-x i{position:absolute; top:-25%; bottom:-25%; left:0; width:64vw;
    margin-left:-32vw; will-change:transform;
    transform:translate3d(calc(var(--bx,50)*1vw),0,0);
    background:radial-gradient(46% 44% at 50% 50%, rgba(255,233,184,.12),
      rgba(37,99,235,.08) 46%, transparent 72%)}
  @media(max-width:900px){.faisceau-x{display:none}}
  @media(prefers-reduced-motion:reduce){.faisceau-x{display:none}}

  /* rythme commun : sections bord à bord, filets pleine largeur */
  .xp-sec{position:relative; padding:clamp(3rem,6vw,5.5rem) 0}
  .xp-sec::before{content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg, rgba(255,233,184,.7), rgba(96,165,250,.28) 30%, transparent);
    transform:scaleX(0); transform-origin:0 50%;
    transition:transform 1.1s cubic-bezier(.22,.9,.24,1)}
  .xp-sec.vu::before{transform:scaleX(1)}
  .xp-h2{font-family:var(--syne); font-weight:800; color:#fff; line-height:1.05;
    font-size:clamp(1.5rem,2.9vw,2.4rem); letter-spacing:-.015em; text-wrap:balance}
  .xp-sec p{color:#CBD5E1; line-height:1.78}
  .xp-sec strong{color:#fff}

  /* ── couverture 100svh : le zigzag annoncé dès le premier écran ── */
  .xp-hero{display:grid;
    grid-template-columns:repeat(12,minmax(0,1fr)); align-content:end;
    gap:0 clamp(1rem,2vw,2rem); padding:8.5rem 0 clamp(3rem,6vw,4.5rem)}
  .xp-badge{grid-column:1/-1; justify-self:start;
    display:inline-flex; align-items:center; gap:.55rem;
    border:1px solid rgba(96,165,250,.35); background:rgba(37,99,235,.12);
    color:var(--bleu-c); border-radius:99px; padding:.45rem 1rem;
    font-family:ui-monospace,monospace; font-size:.62rem; letter-spacing:.2em;
    text-transform:uppercase; margin-bottom:clamp(1.4rem,3vh,2.6rem)}
  .xp-badge svg{width:13px; height:13px; fill:none; stroke:currentColor;
    stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round}
  /* Même échelle que la famille expertise (cf. genere-expertises.mjs) : la
     taille suit la longueur du titre. Celui-ci fait 36 caractères, donc le
     palier le plus grand — mais ramené à 3.4rem, l'ancien 4.3rem donnait un
     titre disproportionné face aux autres pages. */
  /* La césure automatique coupait « RÉFÉRENCEMENT » en deux dès que la largeur
     descendait : sur un titre de marque, ça se voit. Désactivée, et la largeur
     laisse passer le mot le plus long en entier.
     (Pas de backtick dans ce commentaire : il fermerait le template literal.) */
  .xp-hero h1{grid-column:1/-1; font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.025em; font-size:clamp(1.75rem,4.4vw,3.4rem); line-height:1.02;
    overflow-wrap:normal; hyphens:manual; text-shadow:0 0 90px rgba(37,99,235,.45)}
  /* même règle que la famille : balance et largeur en ch seulement au bureau */
  @media(min-width:900px){.xp-hero h1{max-width:23ch; text-wrap:balance}}
  .xp-hero h1 em{font-style:normal; display:block; text-align:right;
    background:linear-gradient(90deg,var(--bleu),var(--bleu-p));
    -webkit-background-clip:text; background-clip:text; color:transparent}
  .xp-hero .chapo{grid-column:7/-1; margin-top:clamp(1.6rem,3.5vh,3rem);
    border-left:1px solid rgba(255,233,184,.5); padding-left:1.3rem;
    font-size:clamp(.98rem,1.2vw,1.1rem); line-height:1.75; color:#CBD5E1; font-weight:300}
  @media(max-width:900px){
    .xp-hero h1 em{text-align:left}
    .xp-hero .chapo{grid-column:1/-1}
  }
  .xp-hero .chapo strong{color:#fff; font-weight:700}

  /* ── 01 intro : titre au bord gauche, texte poussé au bord droit ── */
  .s-intro{display:grid; grid-template-columns:repeat(12,minmax(0,1fr));
    gap:1.4rem clamp(1rem,2vw,2rem)}
  .s-intro .xp-h2{grid-column:1/8}
  .s-intro .tx{grid-column:9/-1; align-self:end}
  .s-intro .tx p+p{margin-top:1.1rem}
  @media(max-width:900px){.s-intro .xp-h2{grid-column:1/-1}.s-intro .tx{grid-column:1/-1}}

  /* ── 02 définition + correspondances collées au bord droit ── */
  .s-def{display:grid; grid-template-columns:repeat(12,minmax(0,1fr));
    gap:2rem clamp(1rem,2vw,2rem)}
  .s-def .col-tx{grid-column:1/7}
  .s-def .col-tx .xp-h2{margin-bottom:1.4rem; font-size:clamp(1.7rem,3.2vw,2.9rem)}
  .s-def .col-tx p+p{margin-top:1.1rem}
  .s-def .col-tx p{max-width:52ch}
  .corresp{grid-column:8/-1; border-left:1px solid rgba(255,233,184,.4);
    padding-left:clamp(1rem,2vw,1.6rem)}
  @media(max-width:900px){.s-def .col-tx{grid-column:1/-1}
    .corresp{grid-column:1/-1; border-left:0; padding-left:0;
      border-top:1px solid rgba(255,233,184,.4); padding-top:1.4rem}}
  .corresp h3{font-family:var(--syne); font-weight:700; color:#fff; font-size:.78rem;
    letter-spacing:.22em; text-transform:uppercase; margin-bottom:1.1rem}
  .corresp ul{list-style:none}
  .corresp li{display:grid; grid-template-columns:minmax(0,1fr) 2.2rem minmax(0,1fr);
    align-items:center; gap:.3rem; padding:.8rem 0;
    border-bottom:1px solid rgba(148,163,184,.12);
    opacity:.6; transition:opacity .5s}
  .corresp li:last-child{border-bottom:0}
  .corresp li.allume{opacity:1}
  .corresp b{font-weight:600; font-size:.88rem; color:#EAF2FF; transition:text-shadow .5s}
  .corresp li.allume b{text-shadow:0 0 22px rgba(255,233,184,.5)}
  .corresp .fl{font-style:normal; justify-self:center; color:var(--bleu-c); font-size:.9rem}
  .corresp .bn{font-family:ui-monospace,monospace; font-size:.72rem; color:var(--brume);
    line-height:1.45}

  /* ── 03 triptyque : filets qui touchent les deux bords ── */
  .s-raisons{border-bottom:1px solid rgba(148,163,184,.16)}
  .s-raisons .xp-h2{margin-bottom:2.4rem; max-width:24ch}
  .triptyque{display:grid; grid-template-columns:repeat(3,1fr);
    border-top:1px solid rgba(148,163,184,.16)}
  @media(max-width:900px){.triptyque{grid-template-columns:1fr}}
  .triptyque article{padding:clamp(1.4rem,2.4vw,2.2rem);
    border-left:1px solid rgba(148,163,184,.16)}
  .triptyque article:first-child{border-left:0}
  @media(max-width:900px){.triptyque article{border-left:0;
    border-top:1px solid rgba(148,163,184,.16)}
    .triptyque article:first-child{border-top:0}}
  .triptyque h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.1rem,1.8vw,1.5rem); margin-bottom:.9rem}
  .triptyque p{font-size:.94rem; color:var(--brume)}
  /* chiffre display nº1/2 : creux au repos, or quand la section est vue */
  .nb{font-family:var(--syne); font-weight:800; font-style:normal; display:block;
    font-size:clamp(2.2rem,4.2vw,3.6rem); line-height:1; letter-spacing:-.02em;
    margin-bottom:.4rem; color:transparent;
    -webkit-text-stroke:1.5px rgba(96,165,250,.55);
    transition:color .8s, text-shadow .8s}
  @supports not (-webkit-text-stroke:1px #000){.nb{color:rgba(96,165,250,.75)}}
  .vu .nb{color:var(--lueur); -webkit-text-stroke:0px transparent;
    text-shadow:0 0 34px rgba(255,233,184,.45)}

  /* ── 04 piliers : grille 2×2 à filets — les quatre lisibles d'un coup.
        (le défilé horizontal précédent rendait le 4e pilier inatteignable :
        piste 1412px dans un cadre 1098px pour 173px de course utile) ── */
  .sc-piliers .scene-t{font-family:ui-monospace,monospace; font-size:.68rem;
    letter-spacing:.28em; text-transform:uppercase; color:var(--bleu-c);
    margin-bottom:2rem}
  .piste{display:grid; grid-template-columns:1fr 1fr; width:auto; transform:none}
  .pil{position:relative; padding:clamp(1.5rem,2.6vw,2.3rem) clamp(1.4rem,2.6vw,2.4rem);
    border-right:1px solid rgba(148,163,184,.16);
    border-bottom:1px solid rgba(148,163,184,.16)}
  .pil:nth-child(odd){padding-left:0}
  .pil:nth-child(even){border-right:0; padding-right:0}
  .pil:nth-child(n+3){border-bottom:0}
  /* le filet du bas se charge quand le pilier est lu */
  .pil::after{content:''; position:absolute; left:0; bottom:-1px; height:1px; width:0;
    background:linear-gradient(90deg,var(--lueur),var(--bleu-c));
    transition:width .9s cubic-bezier(.22,.9,.24,1)}
  .pil.vu::after{width:100%}
  .pil:nth-child(n+3)::after{display:none}
  .pil .ic{width:44px; height:44px; border-radius:11px; display:flex;
    align-items:center; justify-content:center; margin-bottom:1.3rem;
    background:rgba(37,99,235,.16); border:1px solid rgba(96,165,250,.3); color:var(--bleu-c);
    transition:background .45s, color .45s, border-color .45s}
  .pil.vu .ic{background:rgba(255,233,184,.16); border-color:rgba(255,233,184,.45);
    color:var(--lueur)}
  .pil .ic svg{width:20px; height:20px; fill:none; stroke:currentColor;
    stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round}
  .pil h3{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.25rem,2.1vw,1.8rem); line-height:1.1; letter-spacing:-.015em;
    margin-bottom:.8rem; text-wrap:balance}
  .pil p{font-size:.93rem; color:var(--brume); line-height:1.7}
  @media(max-width:820px){
    .piste{grid-template-columns:1fr}
    .pil{padding:1.6rem 0; border-right:0;
      border-bottom:1px solid rgba(148,163,184,.16)}
    .pil:first-child{padding-top:0}
    .pil:last-child{border-bottom:0}
    .pil:nth-child(n+3)::after{display:block}
    .pil:last-child::after{display:none}
  }

  /* ── 05 méthodologie : l'escalier qui descend vers la décision ── */
  .exec{list-style:none; counter-reset:et}
  .exec li{margin-left:calc(var(--i,0)*3.2rem); max-width:56ch;
    display:grid; grid-template-columns:auto minmax(0,1fr); align-items:baseline;
    gap:clamp(.9rem,2vw,1.4rem); padding:1rem 0;
    border-bottom:1px solid rgba(148,163,184,.12);
    opacity:.55; transition:opacity .5s, transform .5s cubic-bezier(.22,.9,.24,1)}
  .exec li:last-child{border-bottom:0}
  .exec li.actif{opacity:1; transform:translateX(4px)}
  .exec .n{font-family:var(--syne); font-weight:800;
    font-size:clamp(2rem,4.6vw,3.6rem); line-height:1; color:transparent;
    -webkit-text-stroke:1.4px rgba(96,165,250,.45); transition:color .5s, text-shadow .5s}
  @supports not (-webkit-text-stroke:1px #000){.exec .n{color:rgba(96,165,250,.6)}}
  .exec li.actif .n{color:var(--lueur); -webkit-text-stroke:0px transparent;
    text-shadow:0 0 26px rgba(255,233,184,.55)}
  .exec h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.05rem,1.9vw,1.4rem); margin-bottom:.2rem}
  .exec p{font-size:.9rem; color:var(--brume)}
  @media(max-width:900px){.exec li{margin-left:0; max-width:none; opacity:1; transform:none}}

  /* ── 06 outils / équipe : deux moitiés jusqu'aux bords ── */
  .s-outils{display:grid; grid-template-columns:1fr 1fr;
    border-block:1px solid rgba(148,163,184,.16)}
  .s-outils>div{padding:clamp(1.8rem,3vw,3rem)}
  .s-outils>div:first-child{padding-left:0}
  .s-outils>div:last-child{border-left:1px solid rgba(148,163,184,.16)}
  @media(max-width:900px){.s-outils{grid-template-columns:1fr}
    .s-outils>div:last-child{border-left:0; border-top:1px solid rgba(148,163,184,.16)}}
  .s-outils h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.15rem,2.2vw,1.5rem); margin-bottom:1rem}
  .s-outils p{font-size:.96rem; max-width:48ch}
  .tags{display:flex; flex-wrap:wrap; gap:.45rem; margin-top:1.4rem}
  .tags span{border-bottom:1px solid rgba(148,163,184,.3); padding:.25rem .1rem;
    font-family:ui-monospace,monospace; font-size:.66rem; letter-spacing:.12em;
    text-transform:uppercase; color:var(--brume); transition:color .3s, border-color .3s}
  .tags span:hover{color:#fff; border-color:var(--lueur)}
  .sceau{margin-top:1.6rem; font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1rem,1.5vw,1.15rem); line-height:1.2}
  /* chiffre display nº2/2 */
  .sceau .nb{font-size:clamp(2.4rem,4.8vw,4rem); display:block; margin-bottom:.3rem}

  /* ── 07 services : registre dont les filets courent de bord à bord ── */
  .s-services .xp-h2{margin-bottom:2rem}
  .registre{display:flex; flex-direction:column; border-top:1px solid rgba(148,163,184,.16)}
  .svc{display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.1fr) 2.5rem;
    align-items:center; gap:1rem; padding:1.4rem .2rem;
    border-bottom:1px solid rgba(148,163,184,.16); position:relative;
    transition:opacity .35s, background .35s}
  @media(max-width:760px){.svc{grid-template-columns:minmax(0,1fr) 2rem;
    grid-template-areas:'t f' 'd d'; row-gap:.4rem}
    .svc h3{grid-area:t} .svc p{grid-area:d} .svc .fl{grid-area:f}}
  .svc::after{content:''; position:absolute; left:0; bottom:-1px; height:1px; width:0;
    background:linear-gradient(90deg,var(--lueur),var(--bleu-c));
    transition:width .6s cubic-bezier(.22,.9,.24,1)}
  .svc:hover::after{width:100%}
  .svc:hover{background:rgba(37,99,235,.07)}
  .registre:hover .svc:not(:hover){opacity:.55}
  .svc h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.1rem,2.2vw,1.6rem); transition:color .3s}
  .svc:hover h3{color:var(--lueur)}
  .svc p{font-size:.87rem; color:var(--brume); line-height:1.6}
  .svc .fl{justify-self:end; width:17px; height:17px; fill:none; stroke:var(--bleu-c);
    stroke-width:2; stroke-linecap:round; stroke-linejoin:round;
    opacity:0; transform:translateX(-8px); transition:opacity .3s, transform .3s}
  .svc:hover .fl{opacity:1; transform:none}

  /* ── 08 FAQ : deux colonnes, titre posé (jamais épinglé) ── */
  .s-faq{display:grid; grid-template-columns:repeat(12,minmax(0,1fr));
    gap:1.6rem clamp(1rem,2vw,2rem)}
  .s-faq .xp-h2{grid-column:1/5; font-size:clamp(1.5rem,2.6vw,2.3rem)}
  .xp-faq{grid-column:5/-1; display:flex; flex-direction:column;
    border-top:1px solid rgba(148,163,184,.16)}
  @media(max-width:900px){.s-faq .xp-h2{grid-column:1/-1}.xp-faq{grid-column:1/-1}}
  .xp-faq details{border-bottom:1px solid rgba(148,163,184,.16)}
  .xp-faq summary{cursor:pointer; list-style:none; display:flex; align-items:baseline;
    justify-content:space-between; gap:1rem; padding:1.15rem .2rem;
    font-family:var(--syne); font-weight:700; font-size:1rem; color:#CBD5E1;
    transition:color .3s}
  .xp-faq summary::-webkit-details-marker{display:none}
  .xp-faq details[open] summary, .xp-faq summary:hover{color:#fff}
  .xp-faq summary .pm{flex:none; font-family:var(--manrope); font-weight:300;
    font-size:1.45rem; line-height:1; color:var(--bleu-c); transition:transform .3s}
  .xp-faq details[open] summary .pm{transform:rotate(45deg)}
  .xp-faq .rep{padding:0 .2rem 1.3rem; color:var(--brume); font-size:.93rem;
    line-height:1.78; max-width:62ch}

  /* ── 09 la décision : 100svh, le faisceau s'immobilise et fleurit ── */
  .xp-cta{position:relative; display:flex; flex-direction:column;
    justify-content:center; padding:clamp(4rem,9vw,7rem) 0 clamp(4.5rem,10vw,8rem); overflow:hidden}
  .xp-cta::before{content:''; position:absolute; inset:0; pointer-events:none;
    opacity:calc(.55 + var(--fin,0)*.45);
    background:radial-gradient(70% 55% at 50% 62%, rgba(37,99,235,.32), transparent 68%),
      radial-gradient(40% 34% at 50% 66%, rgba(255,233,184,calc(.10 + var(--fin,0)*.12)), transparent 70%)}
  .xp-cta > *{position:relative}
  .xp-cta h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(2.1rem,5.4vw,4.4rem); line-height:.99; letter-spacing:-.02em;
    text-wrap:balance; max-width:16ch}
  .xp-cta p{margin-top:1.5rem; max-width:42ch; color:#CBD5E1;
    font-size:clamp(1rem,1.4vw,1.15rem); font-weight:300}
  .xp-cta .actions{display:flex; flex-wrap:wrap; gap:1rem; margin-top:2.6rem}
  .xp-cta .b1, .xp-cta .b2{display:inline-flex; align-items:center; justify-content:center;
    font-weight:800; font-size:.78rem; letter-spacing:.15em; text-transform:uppercase;
    padding:1.15rem 2.2rem; border-radius:99px;
    transition:background .3s, color .3s, transform .25s, box-shadow .35s}
  .xp-cta .b1{background:var(--lueur); color:#1B1206;
    box-shadow:0 0 46px -10px rgba(255,233,184,.75)}
  .xp-cta .b1:hover{transform:translateY(-2px); box-shadow:0 0 62px -8px rgba(255,233,184,.95)}
  .xp-cta .b2{border:1.5px solid rgba(148,163,184,.45); color:#CBD5E1}
  .xp-cta .b2:hover{border-color:var(--bleu-c); color:#fff; background:rgba(37,99,235,.12)}

  /* la capsule d'audit : visible d'emblée, effacée au moment de choisir */
  .chip{opacity:1; transform:none; pointer-events:auto;
    transition:opacity .45s, transform .45s}
  .chip.efface{opacity:0; transform:translateY(14px); pointer-events:none}

  /* révélations — additives */
  .xp-anim .xp-rev{transition:opacity .8s, transform .8s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .xp-rev:not(.vu){opacity:0; transform:translateY(24px)}

  @media (prefers-reduced-motion: reduce){
    .pil::after{width:100%; transition:none}
    .exec li{opacity:1; transform:none}
    .corresp li{opacity:1}
    .xp-sec::before{transform:scaleX(1)}
    .nb, .exec .n{color:var(--lueur); -webkit-text-stroke:0px transparent}
  }
`;

const svg = (nom, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true">${IC[nom]}</svg>`;

async function main() {
  /* graphe global du site, relu sur une page déjà migrée */
  const srcGraphe = await readFile(SOURCE_GRAPHE, 'utf8');
  const blocs = [...srcGraphe.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m => JSON.parse(m[1]));
  const graphe = blocs.find(b => b['@graph']?.some(x => x['@type'] === 'WebSite'));
  if (!graphe) throw new Error('graphe global du site introuvable dans ' + SOURCE_GRAPHE);

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(TITRE_BRUT)} | Triaina</title>
<meta name="description" content="${ech(DESCRIPTION)}">
<meta name="keywords" content="${ech(KEYWORDS)}">
<link rel="canonical" href="${CANONICAL}">
<meta name="geo.region" content="FR-75">
<meta name="geo.placename" content="Paris">
<meta name="geo.position" content="48.8464;2.2758">
<meta name="ICBM" content="48.8464, 2.2758">
<meta name="msvalidate.01" content="4C58C9622B2DBB31ECD9A463E3DCAF66">
<link rel="alternate" hreflang="fr" href="${CANONICAL}">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
<meta property="og:type" content="website">
<meta property="og:url" content="${CANONICAL}">
<meta property="og:title" content="${ech(TITRE_BRUT)}">
<meta property="og:description" content="${ech(DESCRIPTION)}">
<meta property="og:image" content="${IMAGE}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Triaina">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${ech(TITRE_BRUT)}">
<meta name="twitter:description" content="${ech(DESCRIPTION)}">
<meta name="twitter:image" content="${IMAGE}">
<link rel="preload" href="/assets/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
<style>${STYLE}</style>
<script type="application/ld+json">${JSON.stringify(graphe)}</script>
<script type="application/ld+json">${JSON.stringify(SCHEMA)}</script>
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav('/expertise-seo')}

<a class="chip" id="chip" href="/contact" aria-label="Recevoir mon pré-audit gratuit">
  ${svg('eclair')}
  Pré-audit gratuit
</a>

<div class="faisceau-x" aria-hidden="true"><i></i></div>

<main class="page">
  <div class="xp-wrap">

    <header class="xp-hero" data-bx="38">
      <p class="xp-badge">${svg('base')}Expertise &amp; Performance</p>
      <h1>EXPERTISE SEO : <em>AGENCE RÉFÉRENCEMENT</em></h1>
      <p class="chapo"><strong>Triaina</strong> est une <strong>agence SEO</strong> engagée à vos côtés.
      Nous optimisons votre visibilité sur Google avec une <strong>stratégie de référencement naturel</strong> complète et mesurable.</p>
    </header>

    <section class="xp-sec s-intro xp-rev" data-bx="58">
      <h2 class="xp-h2">L'Expertise SEO qui Fait Décoller votre Trafic</h2>
      <div class="tx">
        <p>Confiez votre <strong>stratégie de référencement naturel</strong> à une <strong>agence SEO</strong> expérimentée.
        Notre équipe vous accompagne pour positionner votre site en tête des premiers résultats sur Google.</p>
        <p>Depuis plus de 26 ans, nous aidons les entreprises à dominer leur marché grâce à une
        <strong>expertise SEO</strong> éprouvée et des résultats mesurables.</p>
      </div>
    </section>

    <section class="xp-sec s-def xp-rev" data-bx="60">
      <div class="col-tx">
        <h2 class="xp-h2">Qu'est-ce qu'une Agence SEO ?</h2>
        <p>Une <strong>agence SEO</strong> (Search Engine Optimization) est spécialisée en
        <strong>référencement naturel</strong>. Son objectif : améliorer votre visibilité sur les
        moteurs de recherche comme Google.</p>
        <p>Un <strong>consultant SEO</strong> indépendant offre une expertise spécialisée mais des
        ressources limitées. Une <strong>agence SEO</strong> comme Triaina combine expertise, équipe
        complète et outils puissants.</p>
      </div>
      <aside class="corresp">
        <h3>Ce que nous optimisons</h3>
        <ul>
${OPTIMISE.map(x => {
  /* La flèche du texte source devient le connecteur graphique : la chaîne est
     découpée SUR elle, jamais modifiée — l'extraction rend le même texte. */
  const [gauche, droite] = x.split(' → ');
  return `          <li><b>${ech(gauche)}</b> <i class="fl">→</i> <span class="bn">${ech(droite)}</span></li>`;
}).join('\n')}
        </ul>
      </aside>
    </section>

    <section class="xp-sec s-raisons xp-rev" data-bx="50">
      <h2 class="xp-h2">Pourquoi Choisir une Agence SEO ?</h2>
      <div class="triptyque">
${POURQUOI.map(([t, , d]) => {
  /* Chiffre en display nº1/2 : « 60 % » sort du corps de texte. Balise
     ajoutée autour de la chaîne existante, aucun caractère touché. */
  const corps = ech(d).replace('60 %', '<b class="nb">60 %</b>');
  return `        <article>
          <h3>${ech(t)}</h3>
          <p>${corps}</p>
        </article>`;
}).join('\n')}
      </div>
    </section>

    <section class="xp-sec sc-piliers xp-rev" data-bx="40">
      <h2 class="scene-t">Les 4 Piliers du SEO</h2>
      <div class="piste">
${PILIERS.map(([t, ic, d]) => `        <article class="pil">
          <span class="ic" aria-hidden="true">${svg(ic)}</span>
          <h3>${ech(t)}</h3>
          <p>${ech(d)}</p>
        </article>`).join('\n')}
      </div>
    </section>

    <section class="xp-sec sc-etapes xp-rev" data-bx="62">
      <h2 class="xp-h2" style="margin-bottom:2rem">Notre Méthodologie : 5 Étapes</h2>
      <ol class="exec">
${METHODE.map(([n, t, d], i) => `        <li style="--i:${i}">
          <span class="n" aria-hidden="true">${n}</span>
          <div>
            <h3>${ech(t)}</h3>
            <p>${ech(d)}</p>
          </div>
        </li>`).join('\n')}
      </ol>
    </section>

    <section class="xp-sec s-outils xp-rev" data-bx="60">
      <div>
        <h3>Outils &amp; IA</h3>
        <p>Nous combinons les meilleurs outils du marché (Semrush, Ahrefs, Screaming Frog) avec nos
        solutions propriétaires de prédiction et d'analyse IA.</p>
        <div class="tags">
${OUTILS.map(o => `          <span>${ech(o)}</span>`).join('\n')}
        </div>
      </div>
      <div>
        <h3>Une Équipe Experte</h3>
        <p>Nos consultants ne sont pas de simples exécutants. Ils sont stratèges, data-analysts et
        experts en sémantique. Ils anticipent les mises à jour (Core Updates) et intègrent le GEO
        (Generative Engine Optimization) pour vous garder en tête.</p>
        <p class="sceau"><b class="nb">26 ans</b> d'expérience cumulée</p>
      </div>
    </section>

    <section class="xp-sec s-services xp-rev" data-bx="40">
      <h2 class="xp-h2">Nos Services SEO</h2>
      <div class="registre">
${SERVICES.map(([t, d]) => `        <a class="svc" href="/contact">
          <h3>${ech(t)}</h3>
          <p>${ech(d)}</p>
          ${svg('fleche', 'fl')}
        </a>`).join('\n')}
      </div>
    </section>

    <section class="xp-sec s-faq xp-rev" data-bx="58">
      <h2 class="xp-h2">Questions fréquentes sur le SEO</h2>
      <div class="xp-faq">
${FAQ_VISIBLE.map(([q, r]) => `        <details>
          <summary><span>${ech(q)}</span><span class="pm" aria-hidden="true">+</span></summary>
          <p class="rep">${ech(r)}</p>
        </details>`).join('\n')}
      </div>
    </section>

    <section class="xp-cta xp-rev" data-bx="50">
      <h2>Prêt à Dominer Google ?</h2>
      <p>Triaina vous accompagne. Audit SEO, consultant expert, résultats mesurables.</p>
      <div class="actions">
        <a class="b1" href="/contact">→ Nous contacter</a>
        <a class="b2" href="/faq">FAQ</a>
      </div>
    </section>

  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
<script>
/* ══ DA-35 « Balayage » — un faisceau suit la lecture, aucun épinglage ══
   Un SEUL rAF, déclenché par scroll/resize seulement (pas de boucle libre).
   Tout est additif : sans JS, en motion réduit ou sous 900 px, la page est
   une colonne lisible et le faisceau disparaît. Aucun texte injecté. */
(function () {
  var doux = matchMedia('(prefers-reduced-motion: reduce)');
  var large = matchMedia('(min-width: 901px)');
  var aObs = 'IntersectionObserver' in window;

  /* révélations + allumages ponctuels */
  if (!doux.matches && aObs) {
    document.body.classList.add('xp-anim');
    var obs = new IntersectionObserver(function (e) {
      e.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add('vu');
        obs.unobserve(x.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].slice.call(document.querySelectorAll('.xp-rev')).forEach(function (el) { obs.observe(el); });
    [].slice.call(document.querySelectorAll('.pil')).forEach(function (el, i) {
      el.style.transitionDelay = (i * 110) + 'ms';
      obs.observe(el);
    });

    /* les correspondances s'allument une à une à l'approche du centre */
    var obsC = new IntersectionObserver(function (e) {
      e.forEach(function (x) { x.target.classList.toggle('allume', x.isIntersecting); });
    }, { rootMargin: '-32% 0px -32% 0px' });
    [].slice.call(document.querySelectorAll('.corresp li')).forEach(function (el) { obsC.observe(el); });

    /* l'étape qui franchit la médiane s'exécute */
    var obsE = new IntersectionObserver(function (e) {
      e.forEach(function (x) { x.target.classList.toggle('actif', x.isIntersecting); });
    }, { rootMargin: '-42% 0px -42% 0px' });
    [].slice.call(document.querySelectorAll('.exec li')).forEach(function (el) { obsE.observe(el); });
  }

  /* un seul CTA au moment de choisir */
  var chip = document.getElementById('chip');
  var cta = document.querySelector('.xp-cta');
  if (chip && cta && aObs) {
    new IntersectionObserver(function (e) {
      e.forEach(function (x) { chip.classList.toggle('efface', x.isIntersecting); });
    }, { threshold: .12 }).observe(cta);
  }

  if (doux.matches) return;

  /* ── le faisceau : cible = l'ancre data-bx de la section au centre ── */
  var calque = document.querySelector('.faisceau-x i');
  var ancres = [].slice.call(document.querySelectorAll('[data-bx]'));
  var bx = 50, cible = 50, enVol = false;

  function pas() {
    /* lerp plafonné à .07 : le faisceau glisse, ne saute jamais */
    bx += (cible - bx) * .07;
    if (calque) calque.style.setProperty('--bx', bx.toFixed(2));
    if (Math.abs(cible - bx) > .15) requestAnimationFrame(pas);
    else enVol = false;
  }

  function surScroll() {
    if (!large.matches) return;
    var centre = innerHeight / 2, meilleure = null, dist = 1e9;
    for (var i = 0; i < ancres.length; i++) {
      var r = ancres[i].getBoundingClientRect();
      var m = Math.abs((r.top + r.bottom) / 2 - centre);
      if (r.bottom > 0 && r.top < innerHeight && m < dist) { dist = m; meilleure = ancres[i]; }
    }
    if (meilleure) cible = +meilleure.getAttribute('data-bx') || 50;

    /* floraison du CTA final */
    if (cta) {
      var r3 = cta.getBoundingClientRect();
      var fin = Math.min(1, Math.max(0, 1 - r3.top / (innerHeight * .8)));
      cta.style.setProperty('--fin', fin.toFixed(3));
    }

    if (!enVol) { enVol = true; requestAnimationFrame(pas); }
  }

  surScroll();
  addEventListener('scroll', surScroll, { passive: true });
  addEventListener('resize', surScroll);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(surScroll);
  }
})();
</script>
</body>
</html>
`;

  const dossier = path.join(RACINE, 'site/expertise-seo');
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, 'index.html'), html);

  /* ── garde-fous ── */
  const titres = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => ({ n: +m[1], t: m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() }));
  const h1 = titres.filter(t => t.n === 1);
  const mots = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const texte = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&#8239;/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/\s+/g, ' ');

  /* chaque question du FAQPage doit désormais être VISIBLE dans le HTML */
  for (const [q, r] of FAQ_VISIBLE) {
    if (!texte.includes(q)) throw new Error(`question FAQ non affichée : ${q}`);
    if (!texte.includes(r.slice(0, 60))) throw new Error(`réponse FAQ non affichée : ${q}`);
  }

  /* ══ GARDE-FOU DE PARITÉ DU TEXTE ══
     La refonte visuelle DA-34 ne doit pas déplacer un seul mot. Le texte du
     <main> est comparé caractère par caractère à la référence figée avant
     refonte (tools/reference/expertise-seo-texte.txt). Toute divergence —
     y compris une espace avalée par un découpage de balise — fait échouer
     la génération : « le texte ne change pas » devient un test, pas une
     promesse. */
  const corps = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)[1];
  const texteCorps = corps
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8239;|&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ').trim();
  const attendu = (await readFile(path.join(RACINE, 'tools/reference/expertise-seo-texte.txt'), 'utf8')).trim();
  if (texteCorps !== attendu) {
    const a = attendu.split(' '), b = texteCorps.split(' ');
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    throw new Error(
      'TEXTE MODIFIÉ — la refonte doit être purement visuelle.\n'
      + `  premier écart au mot ${i} (${a.length} mots attendus, ${b.length} produits)\n`
      + `  attendu : …${a.slice(Math.max(0, i - 6), i + 8).join(' ')}…\n`
      + `  produit : …${b.slice(Math.max(0, i - 6), i + 8).join(' ')}…`);
  }

  console.log('page /expertise-seo générée');
  console.log('  title       :', TITRE_BRUT + ' | Triaina');
  console.log('  canonical   :', CANONICAL);
  console.log('  JSON-LD     : 1 @graph — Article + BreadcrumbList + FAQPage(5)');
  console.log('  h1          :', h1.map(t => t.t));
  console.log('  hiérarchie  : h2 ×' + titres.filter(t => t.n === 2).length,
              '· h3 ×' + titres.filter(t => t.n === 3).length,
              '· h4 ×' + titres.filter(t => t.n === 4).length);
  console.log('  FAQ visible :', FAQ_VISIBLE.length, 'questions (schéma désormais adossé au texte)');
  console.log('  liens sortie: /contact ×' + (html.match(/href="\/contact"/g) || []).length,
              '· /faq ×' + (html.match(/href="\/faq"/g) || []).length);
  console.log('  mots servis :', mots);
  if (h1.length !== 1) throw new Error('h1 ≠ 1');
}

main().catch(e => { console.error(e.message); process.exit(1); });
