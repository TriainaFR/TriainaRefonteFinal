/**
 * genere-expertises.mjs — produit les 6 pages d'expertise restantes du site
 * DA-31 (l'expertise SEO a son générateur historique dédié).
 *
 * Fidélité : head SEO et schémas repris VERBATIM des captures par rendu réel
 * (tools/snapshots/ancien-expertises/<page>.json) ; contenu du <main> assemblé
 * depuis les flux de blocs extraits du code source et vérifiés mot à mot
 * (tools/contenus/<page>.json). Garde-fous bloquants : h1, séquence Hn,
 * inclusion de chaque bloc dans le texte capturé, graphe de liens du main
 * identique aux blocs (rien d'ajouté, rien de perdu).
 *
 * Design : famille « expertise » — socle commun (coquille DA-31, conteneur
 * 72rem, arrivées IO one-shot, loi chromatique « le bleu structure, l'or
 * récompense ») + une signature exclusive par page, portée par le module
 * tools/expertises/<page>.mjs ({ STYLE, JS, hooks }).
 *
 * Cas particuliers reconduits de l'ancien site :
 *  · /expertise-geo ET /expertise-gso servent le même HTML (canonical
 *    → /expertise-gso) — les deux dossiers sont écrits ;
 *  · /expertise-ai-overview : canonical/og sans www, fil d'Ariane masqué,
 *    liens éditoriaux en href="#" (navigation JS par-dessus, graphe de
 *    liens rendu inchangé) ;
 *  · /expertise-media : réponses FAQ absentes du HTML (accordéon fermé sur
 *    l'ancien site) — elles ne vivent que dans le schéma FAQPage ; ancres
 *    #audit-media/#strategie-media/#accompagnement-media reposées (le
 *    schéma Product les référence).
 *
 * Usage : node tools/genere-expertises.mjs [--page=expertise-sea]
 *         (puis node tools/ajoute-entites-geo.mjs && node tools/genere-robots-sitemap.mjs)
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ech, barreNav, pieds, titreDePage } from './genere-blog.mjs';
import { reparLiens } from './liens-repares.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));

/* Le graphe @graph du site (LocalBusiness/Organization + WebSite) est servi
   sur CHAQUE page : c'est lui qui fait de Triaina une entité cohérente pour
   Google et les IA. Les pages à tête fournie par Lucas ne le contiennent pas
   — on le relit sur une page qui le porte et on le leur rend.
   (ajoute-entites-geo.mjs le maintient ensuite à jour partout.) */
const graphePromesse = readFile(path.join(RACINE, 'site/faq/index.html'), 'utf8')
  .then(h => {
    const blocs = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(m => m[1]).filter(x => x.includes('"@graph"'));
    if (!blocs.length) throw new Error('graphe global du site introuvable');
    return `<script type="application/ld+json">${blocs[0]}</script>`;
  });

export const PAGES = [
  /* SEA : contenu ET signaux entièrement remplacés le 29/07 à la demande
     de Lucas — la référence de contrôle est désormais son propre code
     (tools/sources/expertise-sea.html → tools/snapshots/refonte-sea/). */
  { cle: 'expertise-sea', captures: 'refonte-expertise-sea' },
  /* GEO : contenu ET signaux remplacés le 29/07 par le code de Lucas
     (canonical → /expertise-geo). L'alias /expertise-gso continue de
     servir la même page, et pointe donc désormais vers ce canonical. */
  { cle: 'expertise-geo', captures: 'refonte-expertise-geo', aliasDossiers: ['expertise-gso'] },
  { cle: 'expertise-automatisation-contenu', captures: 'refonte-expertise-automatisation-contenu' },
  { cle: 'expertise-media', captures: 'refonte-expertise-media' },
  { cle: 'expertise-ai-overview', captures: 'ancien-expertises' },
  /* SEO Paris : contenu ET signaux remplacés le 10/08 par le code de Lucas
     (tools/sources/agence-seo-paris.html → prepare-source). */
  { cle: 'agence-seo-paris', captures: 'refonte-agence-seo-paris' },
  /* Référencement IA : contenu ET signaux remplacés le 10/08 par le code de
     Lucas (tools/sources/agence-referencement-ia.html → prepare-source). */
  { cle: 'agence-referencement-ia', captures: 'refonte-agence-referencement-ia' },
  { cle: 'agence-referencement-ia-paris', captures: 'ancien-seoia' },
  { cle: 'agence-geo-paris', captures: 'ancien-seoia' },
  { cle: 'mentions-legales', captures: 'ancien-divers' },
  { cle: 'annuaire', captures: 'ancien-divers' },
  /* /recrutement : page vivante en production, oubliée à la migration —
     l'audit du 30/07/2026 l'a rattrapée avant qu'elle ne tombe en 404. Sa
     capture vient du rendu réel de la prod, à deux champs près : le canonical
     et og:url y désignaient /carrieres, une URL qui n'existe pas et répond
     404 noindex. Les reconduire aurait exclu la page du sitemap (le générateur
     écarte toute page dont le canonical pointe ailleurs) tout en demandant à
     Google d'indexer une page noindex. Ils sont auto-référençants. */
  { cle: 'recrutement', captures: 'prod-recrutement' },
];

/**
 * Habillage de tête commun à la famille « expertise », repris de
 * /expertise-seo que Lucas a validé : une pastille de catégorie au-dessus du
 * titre, et un H1 en deux tons (blanc puis dégradé bleu).
 *
 * Deux garanties, sans quoi ce serait un risque SEO :
 *  · le TEXTE du h1 n'est pas touché — on n'ajoute qu'une balise <em> autour
 *    de sa seconde moitié, et les garde-fous comparent le texte débalisé ;
 *  · la pastille est un <p> sans lien : elle n'entre ni dans la vérification
 *    des blocs, ni dans la hiérarchie Hn, ni dans le graphe de liens.
 */
const BADGES = {
  'expertise-sea': 'Publicité & Acquisition',
  'expertise-geo': 'Citation & Visibilité IA',
  'expertise-media': 'Autorité & Médias',
  'expertise-ai-overview': 'Google & Réponses IA',
  'expertise-automatisation-contenu': 'Production & Volume',
  'agence-referencement-ia': 'Audit & Accompagnement IA',
  'agence-seo-paris': 'Référencement Naturel & GEO',
};

const ICONE_BADGE = '<svg viewBox="0 0 24 24" aria-hidden="true">'
  + '<path d="M3 5c0-1.7 4-3 9-3s9 1.3 9 3-4 3-9 3-9-1.3-9-3Z"/>'
  + '<path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>'
  + '<path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg>';

/**
 * Coupe le titre à sa première ponctuation forte : avant en blanc, après en bleu.
 *
 * Le séparateur est CONSERVÉ — le retirer changerait le texte du h1, donc un
 * signal SEO. Il est simplement collé au mot qui le précède (nowrap) : sans ça
 * il se retrouve seul sur une ligne quand le titre passe à la ligne, ce qui se
 * voyait sur /expertise-sea.
 */
function titreDeuxTons(h1) {
  if (/<(em|span)\b/i.test(h1)) return null;          // le module gère déjà sa mise en forme
  const m = /^([\s\S]{6,}?)(\s*[:—–-])(\s+)([\s\S]+)$/.exec(h1);
  if (!m) return null;
  /* le dernier mot du bloc blanc + le séparateur, insécables ensemble */
  const blanc = m[1].replace(/(\S+)$/, `<span class="nw">$1${m[2]}</span>`);
  /* l'espace qui suivait le séparateur est réinjecté : sans lui le texte du h1
     deviendrait « Paris -Campagnes » — un signal SEO modifié pour rien. */
  return `${blanc}${m[3]}<em>${m[4]}</em>`;
}

/**
 * Classe de taille du H1, choisie d'après sa LONGUEUR.
 *
 * Les titres d'expertise vont de 36 à 102 caractères. À taille unique, le plus
 * court flotte et le plus long forme un pavé de cinq lignes. On règle donc la
 * taille par palier pour que tous occupent à peu près la même surface : plus le
 * titre est long, plus il est petit.
 */
function paletteTitre(texte) {
  const n = texte.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length;
  if (n <= 45) return 'xp-t1';
  if (n <= 62) return 'xp-t2';
  if (n <= 80) return 'xp-t3';
  if (n <= 98) return 'xp-t4';
  return 'xp-t5';
}

function habilleTete(main, cle) {
  let out = main;
  const badge = BADGES[cle];
  if (badge) {
    out = out.replace(/<h1(\s[^>]*)?>/,
      `<p class="xp-badge">${ICONE_BADGE}${ech(badge)}</p>\n<h1$1>`);
  }
  out = out.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/, (tout, attrs, dedans) => {
    const deux = titreDeuxTons(dedans) ?? dedans;
    const palier = paletteTitre(dedans);
    const a = (attrs ?? '').replace(/\bclass="([^"]*)"/, (t, c) => `class="${c} ${palier}"`);
    return a.includes('class=')
      ? `<h1${a}>${deux}</h1>`
      : `<h1 class="${palier}"${a}>${deux}</h1>`;
  });
  return out;
}

/* ══ rendu par défaut d'un bloc — le texte n'est JAMAIS altéré ══ */
function renduBlocDefaut(b) {
  switch (b.t) {
    case 'kicker': return `<p class="xp-k">${b.html}</p>`;
    case 'h1': return `<h1>${b.html}</h1>`;
    case 'h2': return `<h2>${b.html}</h2>`;
    case 'h3': return `<h3>${b.html}</h3>`;
    case 'h4': return `<h4>${b.html}</h4>`;
    case 'p': return `<p>${b.html}</p>`;
    case 'ul': case 'ol':
      /* certains extraits stockent les listes sans wrapper : on le restaure
         (sémantique de liste + HTML valide) */
      return /^\s*<li/.test(b.html) ? `<${b.t}>${b.html}</${b.t}>` : b.html;
    case 'table': return b.html;
    case 'quote': return `<blockquote>${b.html}</blockquote>`;
    case 'breadcrumb':
      /* masqué sur l'ancien site (className="hidden") — reproduit masqué */
      return `<nav aria-label="Fil d'Ariane" class="bc-cache">${b.html}</nav>`;
    case 'stat': return `<p class="xp-stat">${b.html}</p>`;
    case 'meta': return `<p class="xp-meta">${b.html}</p>`;
    case 'num': return `<span class="xp-num">${b.html}</span>`;
    case 'tag': return `<span class="xp-tag">${b.html}</span>`;
    case 'link': return `<p class="xp-lien">${b.html}</p>`;
    case 'faq-q': return `<p class="xp-fq">${b.html}</p>`;
    case 'faq-a': return `<div class="xp-fr">${b.html}</div>`;
    case 'bouton':
      return `<p class="xp-cta"><button type="button" data-aller="/contact">${b.html}</button></p>`;
    case 'cta': {
      if (/^<a[\s>]/.test(b.html.trim())) return `<p class="xp-cta">${b.html}</p>`;
      const cible = (b.nav && b.nav[0] && b.nav[0].url) || '/contact';
      if (b.nav) /* ancien rendu : <a href="#"> — graphe de liens inchangé */
        return `<p class="xp-cta"><a href="#" data-aller="${ech(cible)}">${b.html}</a></p>`;
      /* ancien rendu : <button> sans lien */
      return `<p class="xp-cta"><button type="button" data-aller="${ech(cible)}">${b.html}</button></p>`;
    }
    default: throw new Error(`type de bloc inconnu : ${b.t}`);
  }
}

/* liens SPA internes aux paragraphes (href="#") : on pose data-aller depuis
   le champ nav du bloc, par correspondance de texte — attribut neutre, le
   href rendu reste « # » comme sur l'ancien site */
function poseNavSPA(html, nav) {
  if (!nav || !nav.length) return html;
  return html.replace(/<a href="#"([^>]*)>([\s\S]*?)<\/a>/g, (tout, attrs, texte) => {
    if (attrs.includes('data-aller')) return tout;
    const plat = texte.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const e = nav.find(n => n.texte.replace(/\s+/g, ' ').trim() === plat);
    return e ? `<a href="#" data-aller="${ech(e.url)}"${attrs}>${texte}</a>` : tout;
  });
}

/* ══ assemblage du <main> : sections par groupes consécutifs ══ */
function assembleMain(blocs, mod) {
  const sections = [];
  for (const b of blocs) {
    const der = sections[sections.length - 1];
    if (der && der.groupe === b.groupe) der.blocs.push(b);
    else sections.push({ groupe: b.groupe, blocs: [b] });
  }
  return sections.map((s, si) => {
    const rendus = s.blocs.map((b, bi) => {
      const html = { ...b, html: poseNavSPA(b.html, b.nav) };
      const defaut = renduBlocDefaut(html);
      return mod.renduBloc ? mod.renduBloc(html, defaut, s.groupe, bi) : defaut;
    });
    const interne = rendus.join('\n');
    /* Un groupe qui ne contient QUE le fil d'Ariane produisait une section vide
       mais gardée en flux : son padding laissait 134 px de blanc entre la barre
       de navigation et le titre. On la marque pour la masquer entièrement. */
    const bcSeule = s.blocs.every(b => b.t === 'breadcrumb');
    const enveloppe = `<section class="xp-sec g-${s.groupe}${bcSeule ? ' bc-seule' : ''}">\n${interne}\n</section>`;
    return mod.renduSection
      ? mod.renduSection(s.groupe, { interne, enveloppe, rendus, blocs: s.blocs, index: si })
      : enveloppe;
  }).join('\n\n');
}

/**
 * Corrections de hiérarchie Hn assumées face à la capture de l'ancien site.
 * Format : page → { « niveau:texte » attendu par la capture : niveau corrigé }.
 *
 * `/agence-referencement-ia-paris` servait DEUX <h1> (le titre du hero, plus
 * celui que l'ancien composant injectait dans le corps de page). Deux H1, c'est
 * un sujet principal ambigu pour Google. Le second passe en <h2> ; son allure
 * à l'écran est préservée par la CSS du module, la correction est sémantique.
 */
const ECARTS_HN = {
  'agence-referencement-ia-paris': {
    '1:Triaina, meilleure agence de référencement IA à Paris':
      '2:Triaina, meilleure agence de référencement IA à Paris',
  },
};

/**
 * Corrections de TEXTE assumées face à la capture de l'ancien site.
 * Format : page → [{ avant, apres, pourquoi }].
 *
 * Même principe que ECARTS_HN : le garde-fou de parité reste actif sur tout le
 * reste du texte, et la capture n'est PAS retouchée — elle doit rester le
 * témoin fidèle de ce que servait l'ancien site. On déclare l'écart ici, avec
 * sa raison, et le générateur applique la même correction à la référence avant
 * de comparer.
 */
const ECARTS_TEXTE = {
  /* L'écart déclaré ici pour `agence-seo-paris` (« des centaines d'entreprises
     parisiennes », affirmation de volume invérifiable, corrigée à l'audit du
     30/07/2026) est devenu sans objet le 10/08/2026 : Lucas a remplacé toute
     la page par son propre code, qui ne contient plus cette phrase. La règle,
     elle, reste — voir l'en-tête de tools/sources/agence-seo-paris.html, où
     les affirmations invérifiables du nouveau code sont traitées de la même
     façon (téléphone bouchon retiré, durée du cas Travel alignée). */
};

/* ══ garde-fous bloquants ══ */
function verifie(cle, html, blocs, cap) {
  const decode = s => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<');
  const plat = s => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  const main = /<main[\s\S]*?<\/main>/.exec(html)[0];

  /* 1 · chaque bloc, débalisé, doit exister dans le texte capturé —
         aux écarts déclarés près (voir ECARTS_TEXTE). */
  let texCap = decode(cap.texteIntegral).replace(/\s+/g, ' ');
  for (const e of ECARTS_TEXTE[cle] ?? []) {
    const avant = e.avant.replace(/\s+/g, ' ');
    if (!texCap.includes(avant))
      throw new Error(`${cle} : écart de texte déclaré introuvable dans la capture — « ${avant.slice(0, 60)} ». `
        + 'Le texte d’origine a changé : revoir ECARTS_TEXTE.');
    texCap = texCap.split(avant).join(e.apres.replace(/\s+/g, ' '));
  }
  for (const b of blocs) {
    const t = plat(b.html);
    if (t && !texCap.includes(t))
      throw new Error(`${cle} : bloc absent de la capture — « ${t.slice(0, 70)} »`);
  }

  /* 2 · séquence Hn du main = capture (hors les 4 h4 du footer) */
  const hn = [...main.matchAll(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => m[1] + ':' + plat(m[2]));
  const attendu = cap.titres.map(t => t.niveau + ':' + plat(t.texte))
    .filter(t => !['4:Agence', '4:Expertises', '4:Localisation', '4:Infos'].includes(t))
    /* Écarts VOULUS et corrigés à l'audit du 29/07/2026. Le garde-fou reste
       actif sur tout le reste : on déclare l'exception, on ne la contourne pas. */
    .map(t => ECARTS_HN[cle]?.[t] ?? t);
  if (JSON.stringify(hn) !== JSON.stringify(attendu)) {
    let i = 0; while (i < hn.length && i < attendu.length && hn[i] === attendu[i]) i++;
    throw new Error(`${cle} : hiérarchie Hn ≠ capture au titre ${i} — produit « ${hn[i]} », attendu « ${attendu[i]} »`);
  }
  if (plat(cap.h1[0]) !== hn[0]?.slice(2))
    throw new Error(`${cle} : h1 ≠ capture`);

  /* 3 · graphe de liens du main = exactement les liens des blocs */
  const liens = h => [...h.matchAll(/<a\s[^>]*href="([^"]*)"/g)].map(m => m[1]).sort();
  const liensMain = liens(main);
  const liensBlocs = liens(blocs.map(b => b.html).join('\n'));
  if (JSON.stringify(liensMain) !== JSON.stringify(liensBlocs))
    throw new Error(`${cle} : liens du main ≠ blocs\n  main  : ${liensMain.join(' ')}\n  blocs : ${liensBlocs.join(' ')}`);
}

/** Comparaison de texte tolérante aux accents, apostrophes et espaces. */
const aplati = s => String(s ?? '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, "'")
  .replace(/[«»"“”]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Google exige qu'une Q/R de FAQPage soit visible sur la page. Sur deux pages,
 * le schéma hérité pose une question plus longue que le titre affiché :
 *   schéma  « Combien de temps pour voir les résultats en référencement IA ? »
 *   affiché « Combien de temps pour voir les résultats ? »
 * Le texte de la page fait foi — c'est lui que le visiteur lit et que le
 * garde-fou de parité protège — donc on aligne le SCHÉMA sur l'affiché, jamais
 * l'inverse. L'appariement se fait par préfixe : sans correspondance unique et
 * non ambiguë, on ne touche à rien et on le signale.
 */
function aligneFaqSurTexte(schemas, blocs, cle) {
  const titres = blocs.filter(b => /^h[2-4]$/.test(b.t))
    .map(b => aplati(b.html.replace(/<[^>]*>/g, ' ')))
    .filter(Boolean);
  const corps = aplati(blocs.map(b => b.html.replace(/<[^>]*>/g, ' ')).join(' '));

  const visite = d => {
    if (Array.isArray(d)) return d.forEach(visite);
    if (!d || typeof d !== 'object') return;
    if (d['@graph']) visite(d['@graph']);
    if (d['@type'] !== 'FAQPage') return;
    for (const q of d.mainEntity ?? []) {
      const pose = aplati(q.name);
      if (!pose || corps.includes(pose)) continue;             // déjà visible
      /* La ponctuation finale est retirée des deux côtés : « …résultats ? »
         n'est pas un préfixe de « …résultats en référencement IA ? » tant que
         le point d'interrogation reste collé. */
      const tronque = s => s.replace(/[?!.…]+\s*$/, '').trim();
      const poseT = tronque(pose);
      const candidats = titres.filter(t => {
        const tT = tronque(t);
        return tT && (poseT.startsWith(tT) || tT.startsWith(poseT));
      });
      const uniques = [...new Set(candidats)];
      if (uniques.length !== 1) {
        console.warn(`  ⚠ ${cle} : question FAQ absente du texte, sans équivalent visible — « ${q.name} »`);
        continue;
      }
      const visible = blocs.find(b => aplati(b.html.replace(/<[^>]*>/g, ' ')) === uniques[0]);
      const avant = q.name;
      q.name = visible.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      console.log(`  ${cle} : question FAQ alignée sur le titre affiché\n      schéma  « ${avant} »\n      affiché « ${q.name} »`);
    }
  };
  visite(schemas);
  return schemas;
}

/* Certaines captures de l'ancien site contiennent deux blocs qui déclarent
   LES MÊMES @id avec des valeurs CONTRADICTOIRES — /expertise-gsa portait le
   graphe du site en double, une version « SEO & GEO » (celle des 80 autres
   pages) et une version « SEO & GSO » périmée. Deux définitions au même @id,
   Google en retient une au hasard : le nom de marque déclaré devenait
   indéterminé. On ne garde donc qu'un bloc par jeu d'@id — le premier, qui est
   celui aligné sur le graphe de référence. */
function dedoublonneSchemas(schemas, cle) {
  const vus = new Set();
  return (schemas ?? []).filter(s => {
    const ids = ((s['@graph'] ?? [s]).map(n => n['@id']).filter(Boolean)).sort().join('|');
    if (!ids) return true;               // bloc sans @id : rien à dédoublonner
    if (vus.has(ids)) {
      console.warn(`  ⚠ ${cle} : bloc JSON-LD ignoré, @id déjà déclaré (${ids})`);
      return false;
    }
    vus.add(ids);
    return true;
  });
}

/**
 * Les captures de l'ancien site reconduisent des `og:image` / `twitter:image`
 * qui désignent des fichiers jamais déposés (ex. /images/agence-seo-paris.jpg) :
 * l'aperçu LinkedIn de ces pages était vide, et rien ne le signalait puisque
 * l'ancien domaine répond 200 en text/html à toute URL inconnue. On retombe
 * sur l'image de partage du site, qui existe et est au bon format 1200×630.
 * Règle générale : toute URL d'image qui ne résout pas est remplacée.
 */
const IMAGE_SOCIALE_DEFAUT = 'https://www.triaina.fr/og-image.jpg';
function reparImagesSociales(cle, cap) {
  const existe = u => {
    if (typeof u !== 'string') return true;
    const chemin = u.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
    return chemin.startsWith('/') && existsSync(path.join(RACINE, 'site', chemin));
  };
  for (const [sac, clef] of [[cap.og, 'og:image'], [cap.twitter, 'twitter:image']]) {
    if (!sac || !sac[clef] || existe(sac[clef])) continue;
    console.log(`  ${cle} : ${clef} « ${sac[clef]} » introuvable → image de partage du site`);
    sac[clef] = IMAGE_SOCIALE_DEFAUT;
  }
}

/* ══ page complète ══ */
function pageHTML(cle, cap, mainInterne, mod, grapheSite) {
  const meta = o => Object.entries(o)
    .map(([k, v]) => `<meta ${k.startsWith('og:') ? 'property' : 'name'}="${k}" content="${ech(v)}">`).join('\n');
  reparImagesSociales(cle, cap);
  /* Une page peut fournir SA tête complète (mod.TETE) — cas d'une page dont
     Lucas remplace lui-même les signaux. Sinon on reconduit ceux de la
     capture de l'ancien site, schémas compris. */
  /* Les têtes fournies par Lucas (mod.TETE) ne déclarent pas de hreflang : sans
     ce complément, 5 pages sur 85 n'en ont aucun alors que les 80 autres en ont
     un, auto-référençant. On l'ajoute seulement s'il manque, jamais en double. */
  const hreflangSiAbsent = t => /hreflang=/.test(t) ? ''
    : `\n<link rel="alternate" hreflang="fr" href="${ech(cap.canonical)}">`;
  const teteSignaux = mod.TETE !== undefined
    ? `${mod.TETE}${hreflangSiAbsent(mod.TETE)}\n${grapheSite}` : [
    `<title>${ech(titreDePage(cle, cap.title))}</title>`,
    `<meta name="description" content="${ech(cap.description)}">`,
    cap.keywords ? `<meta name="keywords" content="${ech(cap.keywords)}">` : '',
    `<link rel="canonical" href="${ech(cap.canonical)}">`,
    `<meta name="ICBM" content="${ech((cap.geo['geo.position'] ?? '').replace(';', ', '))}">`,
    `<meta name="msvalidate.01" content="4C58C9622B2DBB31ECD9A463E3DCAF66">`,
    `<link rel="alternate" hreflang="fr" href="${ech(cap.canonical)}">`,
    meta(cap.geo), meta(cap.og), meta(cap.twitter),
    dedoublonneSchemas(cap.schemas, cle)
      .map(x => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n'),
  ].filter(Boolean).join('\n');
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${teteSignaux}
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
<link rel="preload" href="/assets/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
<style>
  /* ── socle famille expertise ── */
  .page{overflow-x:clip}
  .xp-wrap{position:relative; z-index:2; max-width:72rem; margin:0 auto;
    padding:0 var(--marge)}
  .xp-sec{padding:clamp(3rem,6vw,5.5rem) 0}
  /* Le fil d'Ariane visible des codes fournis tombait en haut de page sans
     habillage — Lucas l'a jugé moche. Masqué comme sur /expertise-seo : le
     schéma BreadcrumbList reste servi, donc le signal Google est intact. */
  .bc-cache, .xp-sec > nav[aria-label="Fil d'Ariane"]{display:none}
  .xp-sec.bc-seule{display:none}
  /* Le fil d'Ariane masqué servait involontairement d'espaceur : une fois sa
     section retirée, c'est au hero de porter la retombée sous la barre de
     navigation. Trois classes pour passer devant les « .g-hero » des modules. */
  .xp-wrap .xp-sec.g-hero, .xp-wrap .xp-sec.g-s0{padding-top:8.5rem}
  @media(max-width:900px){.xp-wrap .xp-sec.g-hero, .xp-wrap .xp-sec.g-s0{padding-top:6.5rem}}

  /* ── titre en décalé gauche/droite (recette /expertise-seo) ──
     Le second bloc du titre s'aligne à droite : c'est ce contrepoint qui donne
     son allure au hero. À plat sous 900 px, où l'effet ne se lit pas. */
  @media(min-width:900px){
    .xp-sec h1 em, .xp-sec h1 .h1-src{display:block; text-align:right}
  }

  /* ── pastille de catégorie + titre deux tons (recette /expertise-seo) ── */
  /* Deux classes dans le sélecteur : les modules déclarent des règles comme
     « .g-hero p » (1 classe + 1 élément) qui, à spécificité égale et déclarées
     plus bas, écrasaient la taille de la pastille — elle sortait à 16-17 px au
     lieu de 10 px sur /expertise-ai-overview et /expertise-automatisation-contenu. */
  .xp-sec .xp-badge{justify-self:start; display:inline-flex; align-items:center;
    gap:.55rem; width:auto; max-width:max-content;
    border:1px solid rgba(96,165,250,.35); background:rgba(37,99,235,.12);
    color:var(--bleu-c); border-radius:99px; padding:.45rem 1rem;
    font-family:ui-monospace,monospace; font-size:.62rem; line-height:1.6;
    letter-spacing:.2em; font-weight:400;
    text-transform:uppercase; margin:0 0 clamp(1.1rem,2.4vh,2rem)}
  .xp-badge svg{width:13px; height:13px; fill:none; stroke:currentColor;
    stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round}
  /* ── Échelle du H1 par longueur de titre ──
     Deux classes + un élément : ça passe devant les « .g-hero h1 » des modules,
     qui sont déclarés plus bas. text-wrap:balance répartit les lignes au lieu
     d'en laisser une orpheline, et la largeur en « ch » empêche la ligne de
     courir sur toute la page — c'est ce qui donnait un pavé. */
  .xp-sec h1.xp-t1, .xp-sec h1.xp-t2, .xp-sec h1.xp-t3,
  .xp-sec h1.xp-t4, .xp-sec h1.xp-t5{line-height:1.02; letter-spacing:-.025em}
  /* Le minimum descend lui aussi avec la longueur : Syne 800 est une fonte
     large — à 27 px elle ne loge que ~11 caractères sur un écran de 375 px.
     Sans ce palier bas, un titre de 100 caractères tombait en colonne de
     9 lignes sur mobile. */
  .xp-sec h1.xp-t1{font-size:clamp(1.75rem,4.4vw,3.4rem)}
  .xp-sec h1.xp-t2{font-size:clamp(1.55rem,4.0vw,3.0rem)}
  .xp-sec h1.xp-t3{font-size:clamp(1.35rem,3.6vw,2.6rem)}
  .xp-sec h1.xp-t4{font-size:clamp(1.25rem,3.2vw,2.3rem)}
  .xp-sec h1.xp-t5{font-size:clamp(1.15rem,3.0vw,2.1rem)}
  /* balance et largeur en « ch » RÉSERVÉES au bureau : sous 900 px, balance
     resserre les lignes à ~9 caractères dans une boîte qui en tient le triple,
     et le titre part en colonne de 9 lignes. En pleine largeur, il en fait 3. */
  @media(min-width:900px){
    .xp-sec h1.xp-t1, .xp-sec h1.xp-t2, .xp-sec h1.xp-t3,
    .xp-sec h1.xp-t4, .xp-sec h1.xp-t5{text-wrap:balance}
    .xp-sec h1.xp-t1{max-width:19ch}
    .xp-sec h1.xp-t2{max-width:21ch}
    .xp-sec h1.xp-t3{max-width:23ch}
    .xp-sec h1.xp-t4{max-width:25ch}
    .xp-sec h1.xp-t5{max-width:27ch}
  }
  .xp-sec h1 .nw{white-space:nowrap}
  .xp-sec h1 em{font-style:normal; display:block;
    background:linear-gradient(90deg,var(--bleu),var(--bleu-p));
    -webkit-background-clip:text; background-clip:text; color:transparent}
  .xp-k{font-family:ui-monospace,monospace; font-size:.66rem; letter-spacing:.2em;
    text-transform:uppercase; color:var(--bleu-c)}
  /* chip visible d'emblée sur les pages d'expertise, effacé sur le CTA final */
  .chip{opacity:1; transform:none; pointer-events:auto}
  .chip.efface{opacity:0; transform:translateY(14px); pointer-events:none}
${mod.STYLE}
</style>
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav('/' + cle)}

<a class="chip" id="chip" href="/contact" aria-label="Recevoir mon pré-audit gratuit">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"></path></svg>
  Pré-audit gratuit
</a>

<main class="page">
  <div class="xp-wrap">
${mainInterne}
  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
<script>
/* socle : arrivées additives (sans JS / motion réduit : tout visible),
   navigation des liens SPA reproduits, chip effacé sur le CTA final */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-aller]');
    if (a) { e.preventDefault(); location.href = a.getAttribute('data-aller'); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var a = e.target.closest('[data-aller]');
    if (a) { e.preventDefault(); location.href = a.getAttribute('data-aller'); }
  });
  var chip = document.getElementById('chip');
  var ctaFinal = document.querySelector('.g-cta-final') ||
    document.querySelector('main .xp-sec:last-of-type');
  if (chip && ctaFinal && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      e.forEach(function (x) { chip.classList.toggle('efface', x.isIntersecting); });
    }, { threshold: .12 }).observe(ctaFinal);
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  document.body.classList.add('xp-anim');
${mod.JS}
})();
</script>
</body>
</html>
`;
}

async function genere(p) {
  const cap = JSON.parse(await readFile(path.join(RACINE, `tools/snapshots/${p.captures}/${p.cle}.json`), 'utf8'));
  const { blocs } = JSON.parse(await readFile(path.join(RACINE, `tools/contenus-pages/${p.cle}.json`), 'utf8'));
  /* Réparé AVANT assemblage : le garde-fou de parité compare les liens du main
     à ceux des blocs — les deux côtés doivent voir les mêmes hrefs. */
  let repares = 0;
  for (const b of blocs) {
    const r = reparLiens(b.html, p.cle);
    b.html = r.html;
    repares += r.remplaces;
  }
  if (repares) console.log(`  ${p.cle} : ${repares} lien(s) mort(s) repointé(s)`);
  const mod = await import(`./expertises/${p.cle}.mjs`);
  if (mod.transformeSchemas) cap.schemas = mod.transformeSchemas(
    JSON.parse(JSON.stringify(cap.schemas)));
  cap.schemas = aligneFaqSurTexte(JSON.parse(JSON.stringify(cap.schemas)), blocs, p.cle);
  const html = pageHTML(p.cle, cap, habilleTete(assembleMain(blocs, mod), p.cle), mod, await graphePromesse);
  verifie(p.cle, html, blocs, cap);
  for (const dossier of [p.cle, ...(p.aliasDossiers || [])]) {
    await mkdir(path.join(RACINE, 'site', dossier), { recursive: true });
    await writeFile(path.join(RACINE, 'site', dossier, 'index.html'), html);
  }
  console.log(`✓ /${p.cle}${p.aliasDossiers ? ' (+ alias /' + p.aliasDossiers.join(', /') + ')' : ''} — ${blocs.length} blocs, ${cap.schemas.length} schémas, h1 « ${cap.h1[0].slice(0, 40)}… »`);
}

const seule = process.argv.find(a => a.startsWith('--page='))?.slice(7);
for (const p of PAGES) {
  if (seule && p.cle !== seule) continue;
  await genere(p);
}
