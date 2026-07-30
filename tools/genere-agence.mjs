/**
 * genere-agence.mjs — produit la page /agence (« Notre Histoire ») du site DA-31.
 *
 * Contenu : le code SEO/GEO fourni par Lucas le 28/07/2026, embarqué MOT POUR
 * MOT (balises, attributs rel/target, entités) — rien n'est réécrit. Deux
 * écarts demandés par Lucas : la carte auteur (Camille Rousseau) est retirée
 * (« c'est une page histoire, pas un article de blog »), et l'habillage reste
 * le langage DA-31 de l'ancienne page /agence (.ag-hero, .frise/.jalon,
 * .ag-cartes, .btn-plein — tous déjà définis dans assets/da31.css) : PAS de
 * couche mythologie visuelle (Didot, lettres grecques, méandre… refusés).
 *
 * Les balises de tête (title, description, canonical, og/twitter/geo) et les
 * schémas existants sont RELUS depuis la page en place et reconduits gelés ;
 * seuls s'ajoutent un BreadcrumbList (Accueil › Notre Histoire) et un
 * FAQPage reprenant la FAQ du contenu, texte identique.
 *
 * Usage : node tools/genere-agence.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ech, barreNav, pieds } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const PAGE = path.join(RACINE, 'site/agence/index.html');

const dec = s => String(s ?? '')
  .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;|&#8239;/g, ' ');

/** Signaux de tête et schémas relus dans la page en place — jamais recomposés. */
function litTete(capture) {
  const attr = (nom) => {
    const m = new RegExp(`(?:name|property)="${nom.replace('.', '\\.')}"\\s+content="([^"]*)"`, 'i').exec(capture)
      ?? new RegExp(`content="([^"]*)"\\s+(?:name|property)="${nom.replace('.', '\\.')}"`, 'i').exec(capture);
    return m ? dec(m[1]) : null;
  };
  const titre = /<title>([\s\S]*?)<\/title>/.exec(capture);
  const canon = /rel="canonical"\s+href="([^"]*)"/.exec(capture);
  const schemas = [...capture.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => { try { return JSON.parse(dec(m[1])); } catch { return null; } }).filter(Boolean);
  return {
    title: titre ? dec(titre[1]) : null,
    description: attr('description'),
    keywords: attr('keywords'),
    canonical: canon ? canon[1] : 'https://www.triaina.fr/agence',
    og: Object.fromEntries(['og:type', 'og:url', 'og:title', 'og:description', 'og:image', 'og:locale', 'og:site_name']
      .map(k => [k, attr(k)]).filter(([, v]) => v)),
    twitter: Object.fromEntries(['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']
      .map(k => [k, attr(k)]).filter(([, v]) => v)),
    geo: Object.fromEntries(['geo.region', 'geo.placename', 'geo.position']
      .map(k => [k, attr(k)]).filter(([, v]) => v)),
    schemas,
  };
}

/* ══════════════ LE CONTENU FOURNI PAR LUCAS — VERBATIM ══════════════
   (carte auteur retirée à sa demande). Découpé en blocs pour recevoir les
   enveloppes de design SANS toucher au balisage intérieur. */

const H1 = `<h1>Triaina - Forgée pour Dominer l'Ère de la Recherche IA</h1>`;

const INTRO = `<p>
  Avant les algorithmes, il y avait les bâtisseurs. Certains ont suivi les règles du référencement naturel. Nous, nous les avons façonnées - puis refaçonnées à chaque mutation du web.
</p>
<p>
  <strong>Triaina</strong>, c'est le trident de Poséidon : trois pointes, une seule prise. <strong>SEO</strong>, <strong>GEO</strong>, <strong>Média propriétaire</strong>. Une agence SEO &amp; GEO à Paris qui n'a pas attendu la vague pour apprendre à nager. Elle l'a générée.
</p>
<p>
  Voici l'histoire de 25 ans de terrain, de deux cessions d'agences, de huit médias construits de zéro - et d'une conviction forgée bien avant que ChatGPT ne change la donne.
</p>`;

/* Les quatre époques : jalons de la frise (l'ancien design). */
const EPOQUES = [
  `<h2>2000 - L'Ère des Pionniers</h2>

<p>
  L'an 2000. Google a deux ans. La plupart des entreprises françaises ne savent pas encore ce qu'est un moteur de recherche. Nos associés, eux, fondent leur première agence SEO.
</p>
<p>
  Là où d'autres voyaient un moteur de recherche, nous voyions un oracle. Un système qui allait, dans les années à venir, redistribuer toute la visibilité commerciale du monde.
</p>
<p>
  En quatre ans, l'agence passe de zéro à <strong>40 collaborateurs</strong>. Elle est ensuite cédée à un acteur majeur du secteur. Première sortie. Premier signal : savoir construire, c'est bien. Savoir anticiper le moment de passer à autre chose, c'est mieux.
</p>
<p>
  Les années suivantes voient naître et se céder plusieurs structures. Chaque cycle affine la méthode, densifie le réseau, consolide une lecture du marché que peu d'agences françaises peuvent revendiquer aujourd'hui. La foudre de Zeus ne frappe pas deux fois au même endroit - mais elle frappe toujours juste.
</p>`,

  `<h2>2022-2024 - Prométhée et le Feu de l'IA</h2>

<p>
  Novembre 2022. ChatGPT est lancé. En quelques semaines, la conversation sur le futur de la recherche change de nature. Gemini, Perplexity, Claude arrivent dans la foulée. Google perd du terrain sur les requêtes informationnelles. Les "zero-click searches" explosent.
</p>
<p>
  Le secteur SEO entre en crise existentielle. Beaucoup d'agences attendent de voir. Nos associés, eux, <strong>anticipent dès 2024</strong>.
</p>
<p>
  La question n'est plus seulement "comment ranker sur Google ?" mais "comment être cité par une IA ?" C'est la naissance du <strong>GSO - Generative Search Optimization</strong>, rebaptisé GEO (Generative Engine Optimization) à mesure que le terme se standardise.
</p>
<p>
  <em>Quand ChatGPT est apparu, nous avions déjà les sources qu'il allait citer.</em> Ce n'est pas de la chance. C'est dix ans de construction éditoriale qui se matérialisent.
</p>
<p>
  Prométhée a volé le feu aux dieux pour l'offrir aux hommes. Nous, nous l'avions déjà dans les mains.
</p>`,

  `<h2>2025 - La Genèse de Triaina</h2>

<p>
  En 2025, après la cession de la dernière structure en 2023 et deux ans de construction silencieuse, <strong>Triaina est fondée</strong>.
</p>
<p>
  Première agence en France à combiner sous un même toit :
</p>
<ul>
  <li><strong>SEO</strong> - référencement naturel sur les moteurs classiques</li>
  <li><strong>GEO</strong> - optimisation pour les moteurs génératifs (LLM, IA)</li>
  <li><strong>Groupe média propriétaire</strong> - 8 titres avec autorité thématique réelle</li>
  <li><strong>SEA / Paid</strong> - pour les stratégies de visibilité immédiate</li>
</ul>
<p>
  La conviction fondatrice est simple : <strong>référencement naturel et optimisation IA doivent aller de pair</strong>. Les traiter séparément, c'est déjà prendre du retard.
</p>
<p>
  Le nom Triaina n'est pas un hasard. Le trident de Poséidon domine trois royaumes - la mer, la terre, les profondeurs. Triaina domine trois leviers de visibilité. Même logique. Même maîtrise.
</p>`,

  `<h2>2026 - La Forge Média : Une Solution de Bout en Bout</h2>

<p>
  Le secteur SEO est obsédé par les liens. Tout le monde achète, loue, échange. Héphaïstos, lui, ne commande pas ses armes : il les forge. La nôtre vient d'être allumée - et elle brûle déjà.
</p>
<p>
  En 2026, nos associés font un choix délibéré et stratégique : <strong>créer un groupe média propriétaire pour offrir aux clients de Triaina une solution de visibilité complète et intégrée</strong> - de l'optimisation SEO/GEO jusqu'à la publication dans des médias à autorité réelle. Ce n'est pas un heureux hasard. C'est la pièce manquante d'une offre pensée de bout en bout.
</p>
<p>
  <strong>Pendant que le secteur achète des liens, nous publions dans nos propres sources.</strong>
</p>
<p>
  Huit titres, avec de vraies lignes éditoriales et de vraies audiences - organisés en trois familles :
</p>

<p><strong>Les Leaders</strong> - nos médias phares :</p>
<ul>
  <li><a href="https://www.leshardis.com" rel="dofollow" target="_blank">Les Hardis</a></li>
  <li><a href="https://www.yonder.fr" rel="dofollow" target="_blank">Yonder</a></li>
</ul>

<p><strong>Les Journaux</strong> - information sectorielle :</p>
<ul>
  <li><a href="https://lejournaldelatech.fr" rel="dofollow" target="_blank">Le Journal de la Tech</a></li>
  <li><a href="https://lejournaldesecoles.fr" rel="dofollow" target="_blank">Le Journal des Écoles</a></li>
  <li><a href="https://www.lejournalduvin.fr" rel="dofollow" target="_blank">Le Journal du Vin</a></li>
</ul>

<p><strong>Et les autres</strong> :</p>
<ul>
  <li><a href="https://bestrestaurantsparis.com/fr/" rel="dofollow" target="_blank">Best Restaurants Paris</a></li>
  <li><a href="https://seminaire-hotels.com" rel="dofollow" target="_blank">Séminaire Hôtels</a></li>
  <li><a href="https://www.lesmeilleurshotelspa.fr/" rel="dofollow" target="_blank">Les Meilleurs Hôtels Spa</a></li>
</ul>

<p>
  Ces médias ont été conçus dès le départ pour être des <strong>sources de référence pour les IA</strong> - et c'est déjà le cas. ChatGPT, Gemini et Perplexity les citent dans leurs réponses, avec une présence en constante augmentation. Pour les clients de Triaina, c'est un <strong>avantage concurrentiel immédiat et mesurable</strong> : être cité par une IA n'est plus un objectif lointain, c'est une réalité accessible dès aujourd'hui, via des médias qui ont déjà la confiance des modèles.
</p>`,
];

/* Les sections après la frise : [classe, bloc]. */
const SECTIONS = [
  ['nh-philo', `<h2>Notre Philosophie - Travailler en Bonne Intelligence</h2>

<p>
  25 ans de terrain enseignent une chose avant tout : <strong>les meilleures stratégies naissent de l'écoute, pas des slides</strong>.
</p>
<p>
  On n'arrive pas chez un client avec une recette toute faite. On arrive avec des questions. Quels sont vos vrais enjeux de visibilité ? Où perdez-vous du terrain ? Qu'est-ce que votre audience cherche vraiment - sur Google, sur Perplexity, dans une réponse ChatGPT ?
</p>
<p>
  Notre approche : <strong>proximité, écoute des besoins réels, solutions sur-mesure</strong>. Pas de jargon condescendant, pas de relation professeur-élève. On aime travailler en bonne intelligence, construire ensemble des stratégies qui correspondent vraiment aux enjeux de chaque client.
</p>
<p>
  Une approche forgée sur 25 ans de terrain. Pas sur des certifications.
</p>`],

  ['nh-vision', `<h2>Notre Vision 2025+</h2>

<blockquote>
  <p>« Le web ne change pas de direction - il change de vitesse. Les marques qui seront visibles dans cinq ans sont celles qui optimisent aujourd'hui pour les LLM, pas celles qui attendent que Google tranche. »</p>
</blockquote>

<p>
  La recherche guidée par les modèles de langage (LLM) n'est pas une tendance. C'est une infrastructure. D'ici 2027, une part croissante des décisions d'achat, de voyage, de recrutement et de consommation de contenu passera par une interface conversationnelle.
</p>
<p>
  Notre mission : <strong>accompagner nos clients dans cette mutation</strong>, en combinant la solidité du SEO classique et la précision du GEO. Capter les opportunités d'un web en pleine transformation - sans sacrifier les positions acquises sur les moteurs traditionnels.
</p>
<p>
  L'Olympe n'est pas une destination. C'est une posture.
</p>`],

  ['nh-maitrise', `<h2>Ce Que Nous Maîtrisons</h2>

<ul>
  <li>
    <strong><a href="/expertise-seo">SEO technique et éditorial</a></strong> - audits, architecture, maillage interne, optimisation on-page, netlinking via nos médias propriétaires.
  </li>
  <li>
    <strong><a href="/expertise-geo">GEO - Generative Engine Optimization</a></strong> - optimisation pour ChatGPT, Gemini, Perplexity, Claude. Structuration des contenus pour la citation par les LLM.
  </li>
  <li>
    <strong><a href="/agence-referencement-ia">Référencement IA</a></strong> - stratégie de visibilité dans les moteurs de recherche de nouvelle génération. Monitoring de la présence dans les réponses génératives.
  </li>
  <li>
    <strong>Groupe média propriétaire</strong> - 8 titres éditoriaux avec autorité thématique réelle, utilisés comme leviers de netlinking et de citation IA pour nos clients.
  </li>
  <li>
    <strong>SEA / Paid Search</strong> - campagnes Google Ads et Bing Ads pour la visibilité immédiate, en complément de la stratégie organique.
  </li>
  <li>
    <strong><a href="/contact">Audit gratuit</a></strong> - diagnostic SEO et GEO offert pour toute nouvelle prise de contact.
  </li>
</ul>`],

  ['nh-olympe', `<h2>Rejoindre l'Olympe</h2>

<p>
  La visibilité sur Google, c'est bien. La visibilité dans les réponses IA, c'est l'étape d'après. Les deux ensemble, avec un groupe média qui renforce votre autorité thématique - c'est ce que Triaina construit pour ses clients.
</p>
<p>
  Deux façons de commencer :
</p>
<ul>
  <li>
    <strong><a href="/contact">Demander un audit gratuit</a></strong> - nous analysons votre visibilité SEO et GEO actuelle, sans engagement.
  </li>
  <li>
    <strong><a href="/agence-referencement-ia">Découvrir nos expertises</a></strong> - notre approche du référencement IA, en détail.
  </li>
</ul>`],

  ['nh-faq', `<h2>Questions fréquentes sur Triaina</h2>

<dl>
  <dt><strong>Depuis quand Triaina existe-t-elle ?</strong></dt>
  <dd>L'agence Triaina a été fondée en 2025, mais ses associés exercent le métier du référencement naturel depuis 2000 - soit 25 ans de terrain continu, à travers plusieurs structures créées et cédées.</dd>

  <dt><strong>Qu'est-ce que le GEO et pourquoi Triaina s'y est spécialisée ?</strong></dt>
  <dd>Le GEO (Generative Engine Optimization) désigne l'optimisation de la visibilité d'une marque dans les réponses des IA génératives : ChatGPT, Gemini, Perplexity, Claude. Triaina a anticipé ce virage dès 2024, en s'appuyant sur un groupe média propriétaire déjà cité par ces moteurs.</dd>

  <dt><strong>Quels sont les médias propriétaires de Triaina ?</strong></dt>
  <dd>Triaina possède 8 médias en ligne : Les Hardis, Yonder, Le Journal de la Tech, Le Journal des Écoles, Le Journal du Vin, Best Restaurants Paris, Séminaire Hôtels et Les Meilleurs Hôtels Spa. Ces titres sont des sources régulièrement citées par les IA génératives.</dd>

  <dt><strong>En quoi Triaina se différencie-t-elle des autres agences SEO parisiennes ?</strong></dt>
  <dd>Triaina est la seule agence en France à combiner SEO, GEO, un groupe média propriétaire de 8 titres et une offre SEA/Paid sous un même toit. Cette intégration permet une stratégie de visibilité cohérente sur les moteurs classiques et génératifs, avec des leviers d'autorité que les agences classiques ne possèdent pas.</dd>

  <dt><strong>Comment contacter Triaina pour un audit SEO ou GEO ?</strong></dt>
  <dd>Vous pouvez demander un audit gratuit directement depuis la <a href="/contact">page contact</a>. L'équipe répond sous 24 heures ouvrées.</dd>
</dl>`],

  ['nh-sources', `<h2>Sources utiles</h2>

<ul>
  <li><a href="https://en.wikipedia.org/wiki/Generative_engine_optimization" rel="noopener" target="_blank">Wikipedia - Generative Engine Optimization</a></li>
  <li><a href="https://searchengineland.com/what-is-generative-engine-optimization-geo-444418" rel="noopener" target="_blank">Search Engine Land - What is GEO?</a></li>
  <li><a href="https://deux.io/generative-engine-optimization-geo/" rel="noopener" target="_blank">Deux.io - Guide GEO France</a></li>
  <li><a href="https://www.linkedin.com/company/triaina" rel="noopener" target="_blank">Triaina sur LinkedIn</a></li>
</ul>`],
];

/* FAQ du contenu, texte identique, pour le schéma FAQPage. */
const FAQ_SCHEMA = [
  ["Depuis quand Triaina existe-t-elle ?",
   "L'agence Triaina a été fondée en 2025, mais ses associés exercent le métier du référencement naturel depuis 2000 - soit 25 ans de terrain continu, à travers plusieurs structures créées et cédées."],
  ["Qu'est-ce que le GEO et pourquoi Triaina s'y est spécialisée ?",
   "Le GEO (Generative Engine Optimization) désigne l'optimisation de la visibilité d'une marque dans les réponses des IA génératives : ChatGPT, Gemini, Perplexity, Claude. Triaina a anticipé ce virage dès 2024, en s'appuyant sur un groupe média propriétaire déjà cité par ces moteurs."],
  ["Quels sont les médias propriétaires de Triaina ?",
   "Triaina possède 8 médias en ligne : Les Hardis, Yonder, Le Journal de la Tech, Le Journal des Écoles, Le Journal du Vin, Best Restaurants Paris, Séminaire Hôtels et Les Meilleurs Hôtels Spa. Ces titres sont des sources régulièrement citées par les IA génératives."],
  ["En quoi Triaina se différencie-t-elle des autres agences SEO parisiennes ?",
   "Triaina est la seule agence en France à combiner SEO, GEO, un groupe média propriétaire de 8 titres et une offre SEA/Paid sous un même toit. Cette intégration permet une stratégie de visibilité cohérente sur les moteurs classiques et génératifs, avec des leviers d'autorité que les agences classiques ne possèdent pas."],
  ["Comment contacter Triaina pour un audit SEO ou GEO ?",
   "Vous pouvez demander un audit gratuit directement depuis la page contact. L'équipe répond sous 24 heures ouvrées."],
];

/* ══ Habillage : compléments au vocabulaire .ag-* de da31.css — DA-31 pur,
      aucun décor mythologique. Les jalons portent des h2 (hiérarchie du
      contenu fourni), les listes reçoivent les traitements cartes/puces de
      l'ancienne page. ══ */
const STYLE = `
  .fil-ariane{font-family:ui-monospace,monospace; font-size:.66rem; letter-spacing:.18em;
    text-transform:uppercase; color:var(--brume); margin-bottom:2.4rem}
  .fil-ariane ol{list-style:none; display:flex; gap:.65rem; padding:0; margin:0}
  .fil-ariane a{color:var(--bleu-c)} .fil-ariane a:hover{color:#fff}
  .fil-ariane li+li::before{content:'/'; margin-right:.65rem; color:rgba(148,163,184,.5)}

  .ag-hero{margin-bottom:4.5rem}
  .ag-hero h1{font-size:clamp(2rem,5vw,3.8rem); line-height:1.05}

  .ag-intro p+p{margin-top:1rem}

  .jalon > h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.25rem,2.4vw,1.7rem); line-height:1.25; margin:.1rem 0 .9rem}
  .jalon strong{color:#fff}
  .jalon a{color:var(--bleu-c)} .jalon a:hover{color:#fff}
  .jalon p+p{margin-top:.9rem}
  .jalon em{color:var(--bleu-p)}

  /* listes des jalons : puces DA-31 (point bleu) — et le jalon Forge Média
     (4e depuis la remise en ordre chronologique) présente ses huit titres en
     plaques, comme les cartes de l'ancienne page */
  .jalon ul{list-style:none; padding:0; margin:.9rem 0}
  .jalon ul li{position:relative; padding:.3rem 0 .3rem 1.5rem; color:#CBD5E1; max-width:48em; line-height:1.65}
  .jalon ul li::before{content:''; position:absolute; left:0; top:.85em; width:7px; height:7px;
    border-radius:50%; background:var(--bleu-c); box-shadow:0 0 10px rgba(96,165,250,.9)}
  .frise .jalon:nth-child(4) ul{display:grid; grid-template-columns:repeat(auto-fit,minmax(13.5rem,1fr));
    gap:.7rem; max-width:56rem}
  .frise .jalon:nth-child(4) ul li{border:1px solid rgba(148,163,184,.18); border-radius:14px;
    background:rgba(16,26,51,.72); padding:.85rem 1.1rem; max-width:none;
    transition:border-color .4s, transform .4s, box-shadow .4s}
  .frise .jalon:nth-child(4) ul li::before{content:none}
  .frise .jalon:nth-child(4) ul li:hover{border-color:rgba(255,233,184,.5); transform:translateY(-3px);
    box-shadow:0 0 28px -8px rgba(37,99,235,.6)}
  .frise .jalon:nth-child(4) ul a{color:#fff; font-weight:600; font-size:.95rem}
  .frise .jalon:nth-child(4) ul a:hover{color:var(--bleu-c)}

  /* la sentence : même langage que l'ambition de l'ancienne page, en bleu marque */
  .exergue{border-left:3px solid var(--bleu-c); background:rgba(255,255,255,.03);
    border-radius:0 14px 14px 0; padding:1.1rem 1.4rem; max-width:44em}
  .exergue strong{font-family:var(--syne); font-weight:600; font-size:1.1rem; line-height:1.5; color:#fff}

  .nh-sec{margin-bottom:6rem}
  .nh-sec > h2{font-family:var(--syne); font-weight:800; color:#fff; line-height:1.1;
    font-size:clamp(1.7rem,3.6vw,2.9rem); margin-bottom:1.6rem}
  .nh-sec p{color:#CBD5E1; line-height:1.7; max-width:48em}
  .nh-sec p+p{margin-top:1rem}
  .nh-sec strong{color:#fff}
  .nh-sec a{color:var(--bleu-c)} .nh-sec a:hover{color:#fff}

  /* la citation de la vision : le style ambition de l'ancienne page */
  .nh-vision blockquote{border-left:3px solid var(--lueur); background:rgba(255,255,255,.03);
    border-radius:0 20px 20px 0; padding:1.8rem; margin:0 0 1.6rem; max-width:44em}
  .nh-vision blockquote p{font-family:var(--syne); font-weight:600; font-size:1.15rem;
    line-height:1.5; color:#fff; max-width:none}

  /* Ce que nous maîtrisons : la grille de cartes de l'ancienne page */
  .nh-maitrise ul{list-style:none; padding:0; margin:0;
    display:grid; grid-template-columns:repeat(3,1fr); gap:1.3rem}
  @media(max-width:1000px){.nh-maitrise ul{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:620px){.nh-maitrise ul{grid-template-columns:1fr}}
  .nh-maitrise li{position:relative; border:1px solid rgba(148,163,184,.18); border-radius:20px;
    padding:1.6rem; background:rgba(16,26,51,.72); overflow:hidden; color:var(--brume);
    font-size:.92rem; line-height:1.65;
    transition:border-color .4s, transform .4s, box-shadow .4s}
  .nh-maitrise li::before{content:''; position:absolute; inset:0; opacity:0; transition:opacity .4s;
    pointer-events:none;
    background:radial-gradient(70% 60% at 50% 0%, rgba(37,99,235,.22), transparent 70%)}
  .nh-maitrise li:hover{border-color:rgba(255,233,184,.5); transform:translateY(-4px);
    box-shadow:0 0 32px -8px rgba(37,99,235,.6)}
  .nh-maitrise li:hover::before{opacity:1}
  .nh-maitrise li strong{display:block; font-family:var(--syne); font-weight:700; color:#fff;
    font-size:1.02rem; margin-bottom:.55rem; position:relative}
  .nh-maitrise li strong a{color:#fff} .nh-maitrise li strong a:hover{color:var(--bleu-c)}

  /* Rejoindre l'Olympe : les deux liens en boutons de l'ancienne page */
  .nh-olympe ul{list-style:none; padding:0; margin:1.9rem 0 0;
    display:flex; flex-wrap:wrap; gap:1.2rem 2rem}
  .nh-olympe ul li{display:flex; flex-direction:column; gap:.55rem; max-width:24rem;
    color:var(--brume); font-size:.9rem; line-height:1.6}
  .nh-olympe ul li strong a{display:inline-flex; align-items:center; gap:.5rem; width:max-content;
    font-weight:800; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase;
    padding:1.05rem 1.8rem; border-radius:99px}
  .nh-olympe ul li:first-child strong a{background:var(--bleu); color:#fff;
    transition:background .25s, transform .25s}
  .nh-olympe ul li:first-child strong a:hover{background:var(--bleu-nuit); transform:translateY(-2px)}
  .nh-olympe ul li:last-child strong a{color:#CBD5E1; border:1.5px solid rgba(148,163,184,.4);
    font-weight:700; transition:border-color .3s, color .3s}
  .nh-olympe ul li:last-child strong a:hover{border-color:var(--lueur); color:var(--lueur)}

  /* FAQ : hiérarchie sobre, filets DA-31 */
  .nh-faq dl{margin:0}
  .nh-faq dt{font-family:var(--syne); font-weight:700; color:#fff; margin-top:1.6rem}
  .nh-faq dt strong{font-weight:700}
  .nh-faq dd{margin:.5rem 0 0; padding-left:1.1rem; color:#CBD5E1; line-height:1.7;
    border-left:1px solid rgba(148,163,184,.2); max-width:60em}

  .nh-sources li{padding:.3rem 0}

  /* révélations : même mécanique .ag-anim que l'ancienne page, étendue aux
     nouvelles sections (additif — sans JS ou en motion réduit, tout est
     visible). Le :not(.vu) est indispensable : cette feuille arrive APRÈS
     da31.css, une règle non scopée écraserait son .ag-anim .vu{opacity:1}. */
  .ag-anim .nh-sec > *{transition:opacity .7s, transform .7s cubic-bezier(.22,.9,.24,1)}
  .ag-anim .nh-sec > :not(.vu){opacity:0; transform:translateY(24px)}

`;

async function main() {
  const enPlace = await readFile(PAGE, 'utf8');
  const t = litTete(enPlace);
  if (!t.title || !t.description) throw new Error('page en place incomplète : title ou description manquant');

  /* Schémas ajoutés : fil d'Ariane + FAQ du contenu (texte identique). */
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.triaina.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Notre Histoire', item: 'https://www.triaina.fr/agence' },
    ],
  };
  const faq = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ_SCHEMA.map(([q, r]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: r },
    })),
  };
  const schemas = [...t.schemas.filter(s => s['@type'] !== 'BreadcrumbList' && s['@type'] !== 'FAQPage'),
    breadcrumb, faq];

  const meta = (o) => Object.entries(o)
    .map(([k, v]) => `<meta ${k.startsWith('og:') ? 'property' : 'name'}="${k}" content="${ech(v)}">`).join('\n');

  let frise = EPOQUES.map(bloc => `        <li class="jalon">
${bloc}
        </li>`).join('\n');

  /* LA punchline reçoit sa classe d'exergue — attribut seul, texte intact
     (un sélecteur :has(strong) attraperait aussi les paragraphes ordinaires). */
  const punch = '<p>\n  <strong>Pendant que le secteur achète des liens';
  if (frise.split(punch).length !== 2) throw new Error('punchline introuvable ou multiple');
  frise = frise.replace(punch,
    '<p class="exergue">\n  <strong>Pendant que le secteur achète des liens');

  const sections = SECTIONS.map(([classe, bloc]) => `<section class="nh-sec ${classe}">
${bloc}
</section>`).join('\n\n');

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(t.title)}</title>
<meta name="description" content="${ech(t.description)}">
${t.keywords ? `<meta name="keywords" content="${ech(t.keywords)}">` : ''}
<link rel="canonical" href="${ech(t.canonical)}">
<meta name="ICBM" content="48.8464, 2.2758">
<meta name="msvalidate.01" content="4C58C9622B2DBB31ECD9A463E3DCAF66">
<link rel="alternate" hreflang="fr" href="https://www.triaina.fr/">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
${meta(t.geo)}
${meta(t.og)}
${meta(t.twitter)}
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
<style>${STYLE}</style>
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav('/agence')}

<a class="chip" id="chip" href="/contact" aria-label="Recevoir mon pré-audit gratuit">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"/></svg>
  Pré-audit gratuit
</a>

<main class="page">
  <div class="ag-wrap">

    <nav class="fil-ariane" aria-label="Fil d'Ariane">
      <ol>
        <li><a href="/">Accueil</a></li>
        <li aria-current="page">Notre Histoire</li>
      </ol>
    </nav>

    <header class="ag-hero">
      <p class="k">// Notre Histoire</p>
      ${H1}
    </header>

    <div class="ag-intro">
${INTRO}
    </div>

    <section class="ag-histoire" aria-label="Les grandes époques de Triaina">
      <ol class="frise" id="frise">
${frise}
      </ol>
    </section>

${sections}

  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
<script>
/* Révélations au scroll + frise qui se trace — la mécanique de l'ancienne
   page. Additif : sans JS ou en motion réduit, tout est déjà visible. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  document.body.classList.add('ag-anim');

  var cibles = [].slice.call(document.querySelectorAll('.ag-intro, .jalon, .nh-sec > *'));
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('vu');
      obs.unobserve(x.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  cibles.forEach(function (el) { obs.observe(el); });

  /* La frise se trace au fil de la lecture. */
  var frise = document.getElementById('frise');
  if (frise) {
    var maj = function () {
      var r = frise.getBoundingClientRect();
      var p = (innerHeight * 0.75 - r.top) / Math.max(r.height, 1);
      frise.style.setProperty('--trace', Math.min(1, Math.max(0, p)));
    };
    maj();
    addEventListener('scroll', maj, { passive: true });
    addEventListener('resize', maj);
  }
})();
</script>
</body>
</html>
`;

  const dossier = path.join(RACINE, 'site/agence');
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, 'index.html'), html);

  const titres = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => m[1] + ':' + m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
  const mots = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const dofollow = (html.match(/rel="dofollow"/g) || []).length;

  /* ══ GARDE-FOU DE PARITÉ DU TEXTE ══
     Toute refonte visuelle doit laisser le texte du <main> identique au
     caractère près à la référence figée (tools/reference/agence-texte.txt).
     Divergence = échec de génération, avec le mot exact pointé. */
  const corpsMain = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)[1];
  const texteMain = corpsMain
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8239;|&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ').trim();
  const refTexte = (await readFile(path.join(RACINE, 'tools/reference/agence-texte.txt'), 'utf8')).trim();
  if (texteMain !== refTexte) {
    const A = refTexte.split(' '), B = texteMain.split(' ');
    let i = 0;
    while (i < A.length && i < B.length && A[i] === B[i]) i++;
    throw new Error('TEXTE MODIFIÉ — refonte purement visuelle exigée.\n'
      + `  premier écart au mot ${i} (${A.length} attendus, ${B.length} produits)\n`
      + `  attendu : …${A.slice(Math.max(0, i - 6), i + 8).join(' ')}…\n`
      + `  produit : …${B.slice(Math.max(0, i - 6), i + 8).join(' ')}…`);
  }
  console.log('page /agence (« Notre Histoire », habillage DA-31) générée');
  console.log('  title (gelé)   :', t.title);
  console.log('  canonical      :', t.canonical);
  console.log('  JSON-LD        :', schemas.length, 'bloc(s) (dont Breadcrumb + FAQPage)');
  console.log('  titres         :', titres.length, '| h1 :', titres.filter(x => x.startsWith('1:')).length);
  console.log('  jalons         :', (html.match(/class="jalon"/g) || []).length, '| sections :', (html.match(/class="nh-sec /g) || []).length);
  console.log('  liens dofollow :', dofollow, '(8 attendus)');
  console.log('  Camille absente:', html.includes('Camille Rousseau') ? 'NON — ENCORE LÀ' : 'oui');
  console.log('  grec/Didot     :', /Didot|ΤΡΙΑΙΝΑ|lapidaire|drachme|méandre|fronton/i.test(html) ? 'RÉSIDU DÉTECTÉ' : 'aucun résidu');
  console.log('  mots servis    :', mots);
  if (titres.filter(x => x.startsWith('1:')).length !== 1) throw new Error('h1 ≠ 1');
  if (dofollow !== 8) throw new Error('liens dofollow ≠ 8');
  if (html.includes('Camille Rousseau')) throw new Error('carte auteur encore présente');
}

main().catch(e => { console.error(e.message); process.exit(1); });
