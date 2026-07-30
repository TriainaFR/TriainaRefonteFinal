/**
 * genere-blog.mjs — produit les pages d'article du nouveau site DA-31.
 *
 * Entrée  : tools/contenus/<id>.json (HTML réel des articles, cf. extrait-contenus.mjs)
 *           + les balises SEO lues dans les sources (title, description,
 *             canonical, JSON-LD) — reprises À L'IDENTIQUE, jamais recomposées.
 * Sortie  : site/blog/<slug>/index.html
 *
 * Usage : node tools/genere-blog.mjs [--seul=geo-definition-2026]
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import { reparLiens } from './liens-repares.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CONTENUS = path.join(RACINE, 'tools/contenus');
const BLOG_SRC = path.join(RACINE, 'views/blog');
const SORTIE = path.join(RACINE, 'site/blog');

/* Valeurs servies par l'ancien site sur toutes les pages — reprises telles quelles. */
export const MOTS_CLES = 'agence seo, agence gso, consultant seo, audit seo, référencement naturel, agence seo paris, référencement ia, generative search optimization';
const IMAGE_OG_DEFAUT = 'https://www.triaina.fr/og-image.jpg';

/**
 * URL absolue de l'image de partage, en vérifiant que le fichier EXISTE.
 * Un `og:image` qui répond 404 laisse un aperçu vide sur LinkedIn, Slack et
 * Facebook — et sur ce domaine, un 404 est servi en `text/html` avec un code
 * 200, donc rien ne le signale. Ordre : l'override de la balise <SEO>, puis
 * l'illustration réelle de l'article, puis l'image par défaut du site.
 */
function resoutImageOg(override, illustration, slug) {
  const existe = u => {
    if (!u) return false;
    const chemin = u.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
    return chemin.startsWith('/') && existsSync(path.join(RACINE, 'site', chemin));
  };
  const absolu = u => (/^https?:\/\//.test(u) ? u : 'https://www.triaina.fr' + u);
  if (existe(override)) return absolu(override);
  if (override) console.log(`  ${slug} : og:image « ${override} » introuvable → repli`);
  if (existe(illustration)) return absolu(illustration);
  return IMAGE_OG_DEFAUT;
}

/** Mois français → numéro, pour convertir « 02 MARS 2026 » en 2026-03-02. */
const MOIS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
               juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12 };

/** Date ISO exploitable par les moteurs, depuis la date affichée de l'article. */
function dateIso(affichee) {
  const m = /(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/.exec(affichee ?? '');
  if (!m) return null;
  const mois = MOIS[m[2].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')];
  if (!mois) return null;
  return `${m[3]}-${String(mois).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

/**
 * Ancre d'un titre de section — même algorithme que le JS de la coquille,
 * mais calculée au build : les crawlers IA n'exécutent pas JavaScript, or ce
 * sont ces ancres qui permettent de citer un passage précis plutôt que la page.
 */
const ancreDe = (texte, i) =>
  'section-' + (texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || String(i));

/**
 * Prépare le corps de l'article :
 *  - rétrograde un <h1> du contenu en <h2> (7 articles en avaient deux, le
 *    gabarit fournissant déjà le H1 de la page) ;
 *  - pose les id d'ancre sur les <h2> ;
 *  - ajoute loading="lazy" aux images du corps ;
 *  - résout les template literals `${PAGE_TO_URL['x']}` restés dans le HTML.
 * Rend aussi le sommaire, pour qu'il soit servi dans le HTML et non injecté.
 */
function prepareCorps(html, urlsParId) {
  /* liens dont le href est resté du code non évalué */
  let out = html.replace(/href="\$\{(?:PAGE_TO_URL)?\['([^']+)'\]\}"/g,
    (tout, cle) => (urlsParId[cle] ? `href="${urlsParId[cle]}"` : tout));

  out = out.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi,
    (_, attrs, dedans) => `<h2${attrs ?? ''}>${dedans}</h2>`);

  const sommaire = [];
  let i = 0;
  out = out.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (tout, attrs, dedans) => {
    /* `dedans` est du HTML : son texte est DÉJÀ échappé (« SEO &amp; GEO »).
       On le décode ici pour que sommaire[].texte soit du texte brut — sinon
       le ech() de l'injection ré-échappe et le lecteur voit « &amp; ». */
    const texte = deech(dedans.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
    if (!texte) return tout;
    const dejaId = /\bid=["']([^"']+)["']/.exec(attrs ?? '');
    const id = dejaId ? dejaId[1] : ancreDe(texte, i);
    i++;
    sommaire.push({ id, texte });
    return dejaId ? tout : `<h2${attrs ?? ''} id="${id}">${dedans}</h2>`;
  });

  out = out.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, '<img loading="lazy"$1>');
  return { html: out, sommaire };
}

export const ech = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Comparaison de texte tolérante aux accents, apostrophes et espaces. */
const aplati = s => String(s ?? '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, "'")
  .replace(/[«»"“”]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Google exige que le contenu d'un FAQPage soit VISIBLE sur la page : une Q/R
 * qui n'existe que dans le JSON-LD n'ouvre droit à aucun rich result et
 * fragilise le reste du balisage. `/blog/ia-analyse-donnees-optimisation-seo-2026`
 * déclarait 5 questions sans la moindre section FAQ dans l'article.
 *
 * On ne réécrit rien : on rend les questions ABSENTES du corps, dans la même
 * convention que les articles qui affichent déjà leur FAQ (h2 puis h3/p).
 * Un article dont la FAQ est déjà visible n'est pas touché.
 */
function rendFaqManquante(html, schemas, slug) {
  /* Le corps est du HTML : ses apostrophes sont écrites « &#x27; » alors que le
     schéma porte le caractère. Sans deech() ici, TOUTE question contenant une
     apostrophe passait pour absente et se retrouvait ajoutée en double. */
  const nu = deech(html.replace(/<[^>]*>/g, ' '));
  const corps = aplati(nu);
  const titres = [...html.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map(m => aplati(deech(m[2].replace(/<[^>]*>/g, ' ')))).filter(Boolean);

  const paires = [];
  const collecte = d => {
    if (Array.isArray(d)) return d.forEach(collecte);
    if (!d || typeof d !== 'object') return;
    if (d['@graph']) collecte(d['@graph']);
    if (d['@type'] === 'FAQPage') {
      for (const q of d.mainEntity ?? []) {
        const question = q.name ?? '';
        const reponse = q.acceptedAnswer?.text ?? '';
        if (!question || !reponse) continue;
        const pose = aplati(question);
        if (corps.includes(pose)) continue;                    // déjà visible
        /* Une question posée sous un libellé voisin est DÉJÀ traitée dans la
           page : ajouter la version du schéma ferait doublon. On signale
           l'écart plutôt que de dupliquer. */
        const tronque = s => s.replace(/[?!.…]+\s*$/, '').trim();
        const poseT = tronque(pose);
        if (titres.some(t => { const tT = tronque(t); return tT && (poseT.startsWith(tT) || tT.startsWith(poseT)); })) {
          console.warn(`  ⚠ ${slug} : question FAQ au libellé différent de la page — « ${question} »`);
          continue;
        }
        paires.push({ question, reponse });
      }
    }
  };
  collecte(schemas);
  if (!paires.length) return html;

  console.log(`  ${slug} : ${paires.length} Q/R du FAQPage rendues visibles (elles n'existaient qu'en JSON-LD)`);
  const section = [
    '<h2>FAQ</h2>',
    ...paires.map(p => `<h3>${ech(p.question)}</h3>\n<p>${ech(p.reponse)}</p>`),
  ].join('\n');
  return `${html}\n${section}`;
}

/* L'ancien site ajoutait « | Triaina » à tous les titres sans vérifier s'il y
   était déjà (SEO.tsx), d'où des SERP en « … | Triaina | Triaina ». On replie
   UNIQUEMENT la signature de marque répétée en fin de titre : un « Triaina »
   au milieu d'une phrase (« Triaina, meilleure agence… ») n'est pas un doublon
   et n'est pas touché. */
export const titreSansMarqueDoublee = s =>
  String(s ?? '').replace(/([-|]\s*Triaina)\s*[-|]\s*Triaina\s*$/, '$1');

/**
 * Réécritures de titres validées par Lucas le 29/07/2026.
 *
 * Ces trois-là ne sont PAS le doublon mécanique traité au-dessus : « Triaina »
 * y est à la fois dans la phrase et en signature. Ce n'était donc pas un bug
 * mais une redite, et sa correction demandait un arbitrage — il l'a donné.
 * Les 29 titres tronqués en SERP, eux, restent inchangés sur sa décision.
 */
const TITRES_REECRITS = {
  blog: 'Blog SEO & GEO : actualités et guides | Triaina',
  faq: 'FAQ | Agence SEO & GEO Triaina',
  'agence-referencement-ia-paris': 'Triaina, meilleure agence de référencement IA à Paris',
};

/** Titre servi pour une page : réécriture validée, sinon dédoublonnage mécanique. */
export const titreDePage = (cle, titre) =>
  TITRES_REECRITS[cle] ?? titreSansMarqueDoublee(titre);

/* Inverse de ech(), pour ramener du HTML à du texte brut avant réinjection.
   `&amp;` est traité EN DERNIER : sinon « &amp;lt; » deviendrait « < »
   au lieu de « &lt; » (double décodage).
   `&nbsp;` est rendu en U+00A0 (pas en espace ordinaire) : la typographie
   française du titre doit survivre à l'aller-retour. */
export const deech = s => String(s ?? '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&');

/* ── Lecture des signaux SEO dans la source de l'article ──
   On évalue les littéraux du <SEO …> et le bloc de schémas tels qu'ils sont
   écrits : c'est la seule façon de conserver les valeurs sur mesure
   (titre en « | Triaina », canonical en www, image OG dédiée…). */
function litSeo(source, texte, post) {
  const res = { title: null, description: null, canonical: null, image: null, schemas: null };
  const parcourt = (n, v) => { v(n); n.forEachChild(c => parcourt(c, v)); };

  const resoudre = (expr) => {
    if (!expr) return null;
    if (ts.isStringLiteral(expr)) return expr.text;
    if (ts.isJsxExpression(expr) && expr.expression) return resoudre(expr.expression);
    if (ts.isTemplateExpression(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      /* `${post.title} - Triaina` → on substitue les champs de post */
      let out = texte.slice(expr.getStart(source) + 1, expr.end - 1);
      out = out.replace(/\$\{[^}]*post\??\.(\w+)[^}]*\}/g, (_, champ) => post[champ] ?? '');
      return out;
    }
    if (ts.isPropertyAccessExpression(expr)) {
      const m = /post\??\.(\w+)/.exec(expr.getText(source));
      return m ? (post[m[1]] ?? null) : null;
    }
    return null;
  };

  parcourt(source, n => {
    const est = (ts.isJsxSelfClosingElement(n) && n.tagName.getText(source) === 'SEO')
      || (ts.isJsxElement(n) && n.openingElement.tagName.getText(source) === 'SEO');
    if (!est) return;
    const ouvrant = ts.isJsxElement(n) ? n.openingElement : n;
    for (const attr of ouvrant.attributes.properties) {
      if (!ts.isJsxAttribute(attr)) continue;
      const nom = attr.name.getText(source);
      if (nom === 'title') res.title = resoudre(attr.initializer);
      if (nom === 'description') res.description = resoudre(attr.initializer);
      if (nom === 'canonicalUrl') res.canonical = resoudre(attr.initializer);
      if (nom === 'image') res.image = resoudre(attr.initializer);
      /* certaines pages ciblent une autre ville : FR-44/Nantes, etc. */
      if (nom === 'geoRegion') res.geoRegion = resoudre(attr.initializer);
      if (nom === 'geoPlacename') res.geoPlacename = resoudre(attr.initializer);
      if (nom === 'geoPosition') res.geoPosition = resoudre(attr.initializer);
    }
  });

  /* Schémas : on récupère le texte du littéral et on le rend évaluable en
     remplaçant les interpolations `post.x` par leur valeur.
     Le nom de la variable n'est pas figé — les articles écrivent `seoSchema`,
     `articleSchema` ou `schemas`. On le lit dans l'attribut `schema={…}` de la
     balise <SEO>, seule source qui dise vraiment lequel est servi ; à défaut on
     retombe sur les deux noms historiques. Sans ça, un article nommé autrement
     perd tous ses schémas EN SILENCE (constaté sur Montpellier : il n'avait
     plus qu'Organization + WebSite, ni Article ni FAQPage ni fil d'Ariane). */
  const nomSchema = /schema=\{\s*(\w+)\s*\}/.exec(texte)?.[1];
  const noms = [nomSchema, 'seoSchema', 'articleSchema'].filter(Boolean);
  const mSchema = new RegExp(
    String.raw`const\s+(?:${noms.join('|')})\s*=\s*([\s\S]*?);\n\n`).exec(texte);
  if (mSchema) {
    let brut = mSchema[1]
      .replace(/`([^`]*)`/g, (tout, dedans) =>
        JSON.stringify(dedans.replace(/\$\{[^}]*post\??\.(\w+)[^}]*\}/g, (_, c) => post[c] ?? '')))
      .replace(/post\??\.(\w+)\s*\|\|\s*''/g, (_, c) => JSON.stringify(post[c] ?? ''))
      .replace(/post\??\.(\w+)/g, (_, c) => JSON.stringify(post[c] ?? ''));
    try { res.schemas = eval('(' + brut + ')'); } catch { res.schemas = null; }
  }
  return res;
}

/**
 * Sort le bloc « À propos de l'auteur » du corps de l'article pour le remonter
 * en colonne, à hauteur du sommaire. On le DÉPLACE (jamais de doublon) : tous
 * ses textes restent sur la page, y compris son H3, donc la hiérarchie et le
 * contenu indexable sont inchangés.
 */
function detacheAuteur(html) {
  const ancre = html.search(/<div[^>]*>\s*<h3[^>]*>\s*À propos de l/i);
  if (ancre < 0) return detacheAuteurParagraphe(html);

  /* remonter à l'ouverture du div englobant */
  const debut = html.lastIndexOf('<div', ancre + 5);
  const jetons = /<div\b[^>]*>|<\/div\s*>/g;
  jetons.lastIndex = debut + 4;
  let profondeur = 1, fin = -1, m;
  while ((m = jetons.exec(html))) {
    profondeur += m[0].startsWith('</div') ? -1 : 1;
    if (profondeur === 0) { fin = m.index + m[0].length; break; }
  }
  if (fin < 0) return { html, auteur: null };

  const bloc = html.slice(debut, fin);
  const texte = (re) => { const x = re.exec(bloc); return x ? x[1].trim() : null; };

  const auteur = {
    niveau: 'h3',
    intitule: texte(/<h3[^>]*>([\s\S]*?)<\/h3>/i),
    nom: texte(/<h3[^>]*>[\s\S]*?<\/h3>\s*<div[^>]*>([\s\S]*?)<\/div>/i),
    role: texte(/<h3[^>]*>[\s\S]*?<\/h3>\s*<div[^>]*>[\s\S]*?<\/div>\s*<div[^>]*>([\s\S]*?)<\/div>/i),
    bio: texte(/<p[^>]*>([\s\S]*?)<\/p>/i),
    lien: texte(/<a[^>]*href="([^"]+)"/i),
    libelleLien: texte(/<a[^>]*>([\s\S]*?)<\/a>/i),
  };
  if (!auteur.nom) return { html, auteur: null };

  return { html: html.slice(0, debut) + html.slice(fin), auteur };
}

/**
 * Variante rencontrée sur deux articles : la signature n'est pas un bloc
 * structuré mais un simple paragraphe
 * `<p><strong>À propos de l'auteure</strong><br><strong>Nom</strong> - rôle…</p>`,
 * souvent précédé d'un <hr>. Même traitement : on déplace, on ne duplique pas.
 */
function detacheAuteurParagraphe(html) {
  const m = /(?:<hr\s*\/?>\s*)?<p>\s*<strong>\s*À propos de l[^<]*<\/strong>([\s\S]*?)<\/p>/i.exec(html);
  if (!m) return { html, auteur: null };

  const dedans = m[1];
  const nom = /<strong>([^<]+)<\/strong>/i.exec(dedans)?.[1]?.trim() ?? null;
  if (!nom) return { html, auteur: null };

  /* « Nom</strong> - Consultante Senior… chez Triaina. » → le rôle suit le tiret */
  const apresNom = dedans.slice(dedans.indexOf('</strong>') + 9);
  const role = /^[\s—–-]*([^<.]+)/.exec(apresNom)?.[1]?.trim() ?? null;
  /* Le libellé du lien (« Profil LinkedIn ») ne fait pas partie de la bio :
     on le retire avant de découper, sinon il s'y retrouvait à sa place. */
  const sansLien = apresNom.replace(/<a\b[\s\S]*?<\/a>/gi, ' ');
  const reste = sansLien.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const bio = reste.split(/\.\s+/).slice(1).join('. ').replace(/\s+/g, ' ').trim() || null;

  return {
    html: html.slice(0, m.index) + html.slice(m.index + m[0].length),
    auteur: {
      niveau: 'p', intitule: "À propos de l'auteure", nom, role, bio,
      lien: /<a[^>]*href="([^"]+)"/i.exec(dedans)?.[1] ?? null,
      libelleLien: /<a[^>]*>([\s\S]*?)<\/a>/i.exec(dedans)?.[1]?.trim() ?? null,
    },
  };
}

/** Fiche auteur en colonne — la photo se pose dans /images/auteurs/. */
/**
 * Profils d'auteur du blog, pour les articles qui n'embarquent PAS de bloc
 * « À propos de l'auteur » dans leur corps.
 *
 * Les 5 articles importés du dépôt de prod le 29/07 sont dans ce cas : ils
 * déclarent leur auteur dans le schéma et la balise <SEO>, mais sans carte —
 * ils s'affichaient donc sans signature là où les 60 autres en ont une.
 * Les valeurs ci-dessous sont RECOPIÉES d'une fiche existante (agence-seo-lyon)
 * pour que la carte soit identique d'un article à l'autre.
 */
const PROFILS_AUTEURS = {
  'Camille Rousseau': {
    intitule: 'À propos de l&#x27;auteure',
    niveau: 'h3',
    nom: 'Camille Rousseau',
    role: 'Consultante Senior GEO/SEO chez Triaina',
    bio: 'Experte en stratégies d&#x27;acquisition hybrides. Camille accompagne les marques dans l&#x27;optimisation de leur visibilité sur les moteurs de recherche traditionnels (SEO) et les interfaces d&#x27;IA génératives (GSO).',
    lien: 'https://www.linkedin.com/in/camille-rousseau-a44488413/',
    libelleLien: 'Voir son profil LinkedIn',
  },
};

/** Auteur déclaré par les schémas de l'article, quand le corps n'en porte pas. */
function auteurDepuisSchemas(schemas) {
  let nom = null;
  const visite = d => {
    if (nom || !d) return;
    if (Array.isArray(d)) return d.forEach(visite);
    if (typeof d !== 'object') return;
    if (d['@graph']) visite(d['@graph']);
    if (d['@type'] === 'Person' && d.name) { nom = d.name; return; }
    if (d.author) {
      if (typeof d.author === 'string') nom = d.author;
      else if (d.author.name) nom = d.author.name;
      else visite(d.author);
    }
    for (const v of Object.values(d)) if (!nom && v && typeof v === 'object') visite(v);
  };
  visite(schemas);
  return nom ? PROFILS_AUTEURS[nom] ?? null : null;
}

function ficheAuteur(a) {
  if (!a) return '';
  const fichier = a.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const initiales = a.nom.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  /* L'intitulé garde le niveau qu'il avait dans l'article : un <h3> là où
     c'en était un, un simple paragraphe sinon — la hiérarchie Hn ne bouge pas. */
  const balise = a.niveau === 'h3' ? 'h3' : 'p';
  return `      <aside class="fiche-auteur">
        <${balise} class="k">${a.intitule ?? "À propos de l'auteur"}</${balise}>
        <div class="portrait">
          <img src="/images/auteurs/${fichier}.jpg" alt="${ech(a.nom)}" width="120" height="120"
               loading="lazy" onerror="this.remove()">
          <span class="initiales" aria-hidden="true">${initiales}</span>
        </div>
        <p class="nom">${a.nom}</p>
        <p class="role">${a.role ?? ''}</p>
        <p class="bio">${a.bio ?? ''}</p>
        ${a.lien ? `<a class="lien" href="${ech(a.lien)}" target="_blank" rel="noopener noreferrer">${a.libelleLien ?? 'Voir son profil'}</a>` : ''}
      </aside>
`;
}

/* url null = simple libellé de menu, pas un lien : « Expertise » n'est pas une
   page (404 sur le site actuel comme ici), c'est un déclencheur de sous-menu. */
export const NAV = [
  ['/', 'Accueil'], ['/agence', 'Notre Histoire'], [null, 'Expertise'],
  ['/references', 'Références'],
  ['/blog', 'Blog'], ['/annuaire', 'Annuaire'], ['/faq', 'FAQ'],
];

/* Sous-menus — repris du site actuel pour le menu déroulant et le menu
   mobile (ce sont des liens réels du maillage interne).
   Le sous-menu « SEO/IA » a été RETIRÉ de la barre à la demande de Lucas
   (29/07/2026) : ses 4 pages restent liées depuis le footer de chacune des
   81 pages (colonne Localisation), le sitemap et les liens contextuels —
   maillage préservé, seule la proéminence en barre disparaît. */
export const SOUS_MENUS = {
  Expertise: [
    ['/expertise-seo', 'Expertise SEO'], ['/expertise-sea', 'Expertise SEA'],
    ['/expertise-geo', 'Expertise GEO'],
    ['/expertise-media', 'Expertise Média'],
    ['/expertise-automatisation-contenu', 'Expertise Automatisation de Contenu'],
    ['/expertise-ai-overview', 'Google AI Overview'],
  ],
};


/**
 * Barre de navigation — commune à toutes les pages du site.
 *
 * Reprend exactement le maillage du site actuel : mêmes libellés, mêmes URL,
 * et les sous-menus Expertise / SEO/IA qui portent 11 liens internes réels.
 * « Expertise » n'a pas de href (404 sur les deux sites) : c'est un
 * déclencheur, pas une page.
 *
 * Le menu mobile est indispensable : sous 1080 px la barre de bureau est
 * masquée, et sans lui il n'y avait plus AUCUNE navigation sur téléphone.
 */
export function barreNav(pageCourante = '') {
  const item = ([url, libelle]) => {
    const sous = SOUS_MENUS[libelle];
    const courant = url && url === pageCourante ? ' aria-current="page"' : '';
    if (!sous) {
      return url
        ? `      <li><a href="${url}"${courant}>${libelle}</a></li>`
        : `      <li><span class="nav-parent">${libelle}</span></li>`;
    }
    return `      <li class="a-sous-menu">
        <button type="button" class="nav-parent" aria-expanded="false" aria-haspopup="true">${libelle}<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
        <ul class="sous-menu">
${sous.map(([u, l]) => `          <li><a href="${u}">${l}</a></li>`).join('\n')}
        </ul>
      </li>`;
  };

  const entreesMobile = NAV.flatMap(([url, libelle]) => {
    const sous = SOUS_MENUS[libelle];
    if (!sous) return url ? [`        <li><a href="${url}">${libelle}</a></li>`] : [];
    return [`        <li class="grp"><span>${libelle}</span>
          <ul>
${sous.map(([u, l]) => `            <li><a href="${u}">${l}</a></li>`).join('\n')}
          </ul>
        </li>`];
  });
  /* Contact ne figure pas dans NAV : sur la barre de bureau c'est une capsule
     rendue à part. Le menu mobile, lui, ne recopiait que NAV — Contact n'y
     apparaissait donc NULLE PART, seul le bouton de pré-audit en bas de panneau
     y menait, et il tombait hors écran. On l'ajoute comme entrée de menu. */
  entreesMobile.push('        <li><a href="/contact">Contact</a></li>');

  return `<nav class="site" aria-label="Navigation principale">
  <a class="logo" href="/" aria-label="Triaina — Accueil">
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="18" y="5" width="4" height="25" rx="1" fill="#2563EB"/>
      <rect x="10" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
      <rect x="27" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
    </svg>
    <span><b>TRIAINA</b><i>SEO — GEO — Média</i></span>
  </a>

  <ul class="nav-l">
${NAV.map(item).join('\n')}
    <li><a class="ncta" href="/contact">Contact</a></li>
  </ul>

  <button type="button" class="burger" id="burger" aria-label="Ouvrir le menu"
          aria-expanded="false" aria-controls="menu-mobile">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="menu-mobile" id="menu-mobile" hidden>
  <div class="mm-fond" data-fermer></div>
  <div class="mm-panneau" role="dialog" aria-modal="true" aria-label="Menu" data-lenis-prevent>
    <ul class="mm-liens">
${entreesMobile.join('\n')}
    </ul>
    <a class="mm-cta" href="/contact">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"/></svg>
      Pré-audit gratuit
    </a>
  </div>
</div>`;
}

/* ── Footer : reproduction fidèle de celui de l'ancien site ──
   Mêmes intitulés, mêmes liens (le maillage interne est un signal SEO), même
   adresse, même mention.
   Les intitulés de colonne étaient des titres de niveau 4 : sur les 81 pages,
   la hiérarchie sautait donc du niveau 2 (dernière section du contenu) au
   niveau 4 (pied de page). Ce sont des ÉTIQUETTES de navigation, pas des
   sections du document : elles sortent de la hiérarchie Hn et deviennent des
   paragraphes. Texte visible et style inchangés. */
const FOOTER_COLONNES = [
  ['Agence', [
    ['/', 'ACCUEIL'], ['/agence', 'NOTRE HISTOIRE'], ['/references', 'RÉFÉRENCES'],
    ['/blog', 'BLOG'], ['/annuaire', 'ANNUAIRE'], ['/faq', 'FAQ'],
    /* /recrutement était liée sur l'ancien site ; recréée le 30/07/2026, elle
       n'était plus référencée nulle part — orpheline au sens strict, donc
       invisible pour un crawler qui n'a que le maillage pour la trouver. */
    ['/recrutement', 'RECRUTEMENT'], ['/contact', 'CONTACT'],
  ]],
  ['Expertises', [
    ['/expertise-seo', 'Expertise SEO'], ['/expertise-sea', 'Expertise SEA'],
    ['/expertise-geo', 'Expertise GEO'],
    ['/expertise-media', 'Expertise Média'],
    ['/expertise-automatisation-contenu', 'Expertise Automatisation de Contenu'],
    ['/expertise-ai-overview', 'Google AI Overview'],
  ]],
  ['Localisation', [
    ['/agence-seo-paris', 'Agence SEO Paris'],
    ['/agence-referencement-ia', 'Agence Référencement IA'],
    ['/agence-referencement-ia-paris', 'Agence Référencement IA Paris'],
    ['/agence-geo-paris', 'Agence GEO Paris'],
  ]],
];

export function pieds() {
  return `<footer>
  <div class="pied">
    <div class="pied-col pied-marque">
      <a class="logo" href="/" aria-label="Triaina — Accueil">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <rect x="18" y="5" width="4" height="25" rx="1" fill="#2563EB"/>
          <rect x="10" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
          <rect x="27" y="12" width="3" height="15" rx="1" fill="#F8FAFC"/>
        </svg>
        <span><b>TRIAINA</b><i>SEO — GEO — Média</i></span>
      </a>
      <p>Agence spécialisée en architecture SEO, domination GEO et autorité Média.</p>
      <a class="social" href="https://www.linkedin.com/company/triaina" target="_blank" rel="noreferrer" aria-label="Suivre Triaina sur LinkedIn">LinkedIn</a>
    </div>
${FOOTER_COLONNES.map(([titre, liens]) => `    <div class="pied-col">
      <p class="pied-titre">${titre}</p>
      <ul>
${liens.map(([u, l]) => `        <li><a href="${u}">${l}</a></li>`).join('\n')}
      </ul>
    </div>`).join('\n')}
    <div class="pied-col">
      <p class="pied-titre">Infos</p>
      <address>50 Quai Louis Blériot<br>75016 Paris<br>France</address>
    </div>
  </div>
  <div class="pied-bas">
    <p>© 2026 Triaina SAS.</p>
    <div class="liens">
      <a href="/mentions-legales">Mentions Légales</a>
      <a href="/sitemap.xml" target="_blank">Sitemap</a>
    </div>
  </div>
</footer>`;
}

/**
 * Complète le schéma Article des champs que le site actuel n'a jamais servis :
 * datePublished (= date de publication affichée), dateModified, publisher et
 * mainEntityOfPage. Ajout pur — aucune valeur existante n'est modifiée.
 * Sans date lisible par une machine, un moteur génératif ne peut pas dater
 * l'article ni arbitrer sa fraîcheur face à un concurrent daté.
 */
function enrichitArticle(schemas, d) {
  if (!schemas) return schemas;
  const iso = dateIso(d.date);
  const complete = (o) => {
    if (!o || o['@type'] !== 'Article') return o;
    const enrichi = { ...o };
    if (iso && !enrichi.datePublished) enrichi.datePublished = iso;
    if (iso && !enrichi.dateModified) enrichi.dateModified = iso;
    if (!enrichi.publisher) enrichi.publisher = {
      '@type': 'Organization',
      '@id': 'https://www.triaina.fr/#organization',
      name: 'Triaina',
      logo: { '@type': 'ImageObject', url: 'https://www.triaina.fr/logo.svg' },
    };
    if (!enrichi.mainEntityOfPage && d.canonical) enrichi.mainEntityOfPage = {
      '@type': 'WebPage', '@id': d.canonical,
    };
    return enrichi;
  };
  return Array.isArray(schemas) ? schemas.map(complete) : complete(schemas);
}

function gabarit(d, schemaGlobal) {
  /* Le schéma global (LocalBusiness/Organization…) était injecté sur chaque
     page par l'ancien site : on le reconduit, sinon chaque page perd son
     entité de marque. */
  /* Un bloc par appel <SEO> : l'ancien site sérialisait le tableau de schémas
     de l'article dans UN SEUL <script>. On ne l'éclate pas, sinon la signature
     diffère alors que le contenu est le même. */
  const jsonld = [schemaGlobal, enrichitArticle(d.schemas, d)].filter(Boolean);
  /* L'ancien site suffixait « | Triaina » SANS regarder le titre (SEO.tsx :
     `${title} | Triaina`). Sur 60 articles dont le titre finissait déjà par
     « - Triaina », la SERP affichait donc « … - Triaina | Triaina » — la marque
     deux fois, sur des titres déjà tronqués par Google. On ne suffixe plus
     quand la signature de marque est déjà là. */
  const title = /[-|]\s*Triaina\s*$/.test(d.title) ? d.title : `${d.title} | Triaina`;
  /* og:image ne suit PAS l'illustration de l'article : l'ancien site servait
     l'image par défaut du composant SEO, sauf override explicite.
     30/07/2026 — mais 6 de ces overrides désignaient un fichier INEXISTANT
     (chemin /images/… alors que le visuel vit dans /images/articles/…) :
     l'aperçu LinkedIn/Facebook de ces pages était vide. On retombe donc, dans
     l'ordre, sur l'illustration réelle de l'article puis sur l'image par
     défaut. Règle générale, pas une liste en dur : un override qui cesse de
     résoudre se répare tout seul au prochain build. */
  const imageOg = resoutImageOg(d.imageOgOverride, d.image, d.id);
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(title)}</title>
<meta name="description" content="${ech(d.description)}">
<meta name="keywords" content="${ech(MOTS_CLES)}">
<link rel="canonical" href="${ech(d.canonical)}">
<meta name="geo.region" content="${ech(d.geoRegion ?? 'FR-75')}">
<meta name="geo.placename" content="${ech(d.geoPlacename ?? 'Paris')}">
<meta name="geo.position" content="${ech(d.geoPosition ?? '48.8464;2.2758')}">
<meta property="og:type" content="article">
<meta property="og:url" content="${ech(d.canonical)}">
<meta property="og:title" content="${ech(d.title)}">
<meta property="og:description" content="${ech(d.description)}">
<meta property="og:image" content="${ech(imageOg)}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Triaina">${metasArticle(d)}${metasSupplementaires(d)}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${ech(d.title)}">
<meta name="twitter:description" content="${ech(d.description)}">
<meta name="twitter:image" content="${ech(imageOg)}">
<meta name="ICBM" content="${ech((d.geoPosition ?? '48.8464;2.2758').replace(';', ', '))}">
<meta name="msvalidate.01" content="4C58C9622B2DBB31ECD9A463E3DCAF66">
<link rel="alternate" hreflang="fr" href="${ech(d.canonical)}">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
<link rel="preload" href="/assets/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/da31.css">
${jsonld.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>

<div class="prog" aria-hidden="true"><i id="progBar"></i></div>
<canvas id="scene" aria-hidden="true"></canvas>
<canvas id="arcs" aria-hidden="true"></canvas>
<div class="curseur-lueur" aria-hidden="true"></div>

${barreNav()}

<a class="chip" id="chip" href="/contact" aria-label="Recevoir mon pré-audit gratuit">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"/></svg>
  Pré-audit gratuit
</a>

<main class="page">
  <div class="art-wrap">
    <a class="retour" href="/blog">← Retour aux articles</a>

    <div class="art-grille">
      <article>
        <div class="art-meta">
          ${dateIso(d.date) ? `<time datetime="${dateIso(d.date)}">${ech(d.date)}</time>` : `<span>${ech(d.date)}</span>`}
          <span class="art-tag">${ech(d.tag)}</span>
        </div>
        <h1 class="art-titre">${ech(d.titre)}</h1>
        <p class="art-chapo">${ech(d.excerpt)}</p>

        <div class="art-image">
          <img src="${ech(d.image)}" alt="${ech(d.titre)}" referrerpolicy="no-referrer" width="1200" height="600">
        </div>

        <div class="art-corps">
${d.html}
        </div>

        <aside class="art-cta">
          <p class="k">Audit offert</p>
          <p class="t">Votre marque est-elle citée par les IA&nbsp;?</p>
          <p>Trente minutes pour mesurer où vous en êtes, positions Google, citations
          dans ChatGPT, Gemini et Perplexity, et repartir avec trois actions concrètes.</p>
          <a class="btn-audit" href="/contact">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 12-14h-8z"/></svg>
            Recevoir mon audit gratuit
          </a>
          <p class="rassure">Sans engagement · réponse sous 24&nbsp;h ouvrées</p>
        </aside>

${d.articlesLies}
        <div class="art-partage">
          <span>Partager cet article</span>
          <div class="liens">
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(d.canonical || '')}" target="_blank" rel="nofollow noopener" aria-label="Partager sur LinkedIn"><svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.5 8.75 21 11 21 14v7h-4v-6.2c0-1.5-.03-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V21H9z"/></svg></a>
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(d.canonical || '')}&text=${encodeURIComponent(d.titre || '')}" target="_blank" rel="nofollow noopener" aria-label="Partager sur X"><svg viewBox="0 0 24 24"><path d="M18.9 2H22l-7.5 8.6L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8-9.2L.9 2h7l4.9 6.5zM17.7 20h1.7L7.4 3.8H5.6z"/></svg></a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(d.canonical || '')}" target="_blank" rel="nofollow noopener" aria-label="Partager sur Facebook"><svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg></a>
          </div>
        </div>
      </article>

      <div class="colonne">
${d.ficheAuteur}        ${d.sommaire.length > 1 ? `<nav class="sommaire" id="sommaire" aria-label="Sommaire de l'article">
          <p class="k">Sommaire</p>
          <ul>
${d.sommaire.map(x => `            <li><a href="#${x.id}">${ech(x.texte)}</a></li>`).join('\n')}
          </ul>
        </nav>` : ''}
      </div>
    </div>
  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
</body>
</html>
`;
}

/**
 * Métas Open Graph propres aux articles.
 *
 * `og:type` valait « website » sur les 66 articles, alors qu'ils portent tous
 * un schéma Article : c'est une contradiction que l'audit du 30/07/2026 a
 * relevée. Les dates ne sont pas ressaisies — elles sont lues dans le schéma
 * Article, donc impossible de les désynchroniser.
 */
function metasArticle(d) {
  const art = [];
  const visite = o => {
    if (Array.isArray(o)) return o.forEach(visite);
    if (!o || typeof o !== 'object') return;
    if ([].concat(o['@type'] ?? []).some(t => /Article|BlogPosting/.test(t))) art.push(o);
    if (o['@graph']) visite(o['@graph']);
  };
  visite(d.schemas ?? []);
  const a = art[0];
  if (!a) return '';
  const lignes = [];
  if (a.datePublished) lignes.push(`<meta property="article:published_time" content="${ech(a.datePublished)}">`);
  if (a.dateModified) lignes.push(`<meta property="article:modified_time" content="${ech(a.dateModified)}">`);
  const url = a.author?.url ?? (Array.isArray(a.author) ? a.author[0]?.url : null);
  if (url) lignes.push(`<meta property="article:author" content="${ech(url)}">`);
  return lignes.length ? '\n' + lignes.join('\n') : '';
}

/**
 * Métas libres déclarées par l'article lui-même (`seo.metas`).
 *
 * Sert aux codes fournis par Lucas, qui portent leurs propres balises de
 * cadrage : topic, category, coverage, target, article:section, article:tag…
 * Aucun moteur de recherche ne les exploite aujourd'hui — elles sont là par
 * cohérence avec le code d'origine, et parce qu'elles ne coûtent rien.
 */
function metasSupplementaires(d) {
  const m = d.metas;
  if (!m || typeof m !== 'object') return '';
  const balise = (k, v) => `<meta ${k.startsWith('article:') || k.startsWith('og:') ? 'property' : 'name'}="${ech(k)}" content="${ech(v)}">`;
  const lignes = Object.entries(m).map(([k, v]) => balise(k, v));
  return lignes.length ? '\n' + lignes.join('\n') : '';
}

/**
 * « Sur le même sujet » — trois articles proches, en fin d'article.
 *
 * L'audit du 30/07/2026 a mesuré que 38 des 66 articles ne liaient AUCUN autre
 * article : chacun était un cul-de-sac pour un crawler comme pour un lecteur.
 * Le maillage du blog reposait à 88 % sur la nav et le pied, c'est-à-dire sur
 * du boilerplate qui ne dit rien de la proximité entre deux sujets.
 *
 * Choix de la sélection, sans base de données ni tags manuels : même `tag`
 * d'abord, puis proximité lexicale des titres (mots signifiants communs), puis
 * les plus récents pour compléter. Aucun contenu inventé, aucune phrase
 * ajoutée — seulement des titres réels et leurs URL canoniques.
 */
const VIDES = new Set(['agence', 'seo', 'geo', 'gso', 'guide', 'complet', 'pour', 'les', 'des',
  'une', 'comment', 'quoi', 'avec', 'dans', 'son', 'sur', 'est', 'que', 'qui', 'top',
  'meilleure', 'meilleures', 'france', 'paris', 'ia', 'référencement', 'referencement']);
const motsCles = titre => new Set(
  String(titre ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter(m => m.length > 3 && !VIDES.has(m)));

function articlesLies(courant, tous) {
  const mots = motsCles(courant.titre);
  const candidats = tous
    .filter(p => p.url !== courant.url && p.canonique !== false)
    .map(p => {
      const communs = [...motsCles(p.titre)].filter(m => mots.has(m)).length;
      return { p, score: (p.tag === courant.tag ? 2 : 0) + communs };
    })
    .sort((a, b) => b.score - a.score || (b.p.date ?? '').localeCompare(a.p.date ?? ''))
    .slice(0, 3).map(x => x.p);
  if (candidats.length < 2) return '';
  return `
        <nav class="art-lies" aria-label="Articles sur le même sujet">
          <p class="k">Sur le même sujet</p>
          <ul>
${candidats.map(p => `            <li><a href="${ech(p.url)}">${ech(p.titre)}</a></li>`).join('\n')}
          </ul>
        </nav>
`;
}

/**
 * Schéma global (LocalBusiness / Organization / WebSite…) : l'ancien site
 * l'injectait sur chaque page. On le relit dans la capture de référence —
 * c'est le HTML réellement servi qui fait foi, pas la source.
 */
async function schemaGlobalDeReference() {
  const ref = path.join(RACINE, 'tools/snapshots/avant/blog_geo-definition-2026.json');
  try {
    const d = JSON.parse(await readFile(ref, 'utf8'));
    const g = d.schemas.find(s => s && s['@graph']);
    if (!g) console.log('⚠︎ schéma global introuvable dans la référence');
    return g ?? null;
  } catch {
    console.log('⚠︎ capture de référence absente : pages générées SANS schéma global');
    return null;
  }
}

async function main() {
  const seul = (process.argv.find(a => a.startsWith('--seul=')) ?? '').slice(7);
  const schemaGlobal = await schemaGlobalDeReference();
  const fichiers = (await readdir(CONTENUS)).filter(f => f.endsWith('.json'));

  /* Un article, deux URL sur le site actuel : la seconde doit exister. */
  const ALIAS = { 'meilleure-agence-gso-france-2026': 'meilleure-agence-geo-france-2026' };
  /* Table complète clé → URL, lue dans constants.ts : elle couvre aussi les
     pages hors blog (/expertise-geo, /agence-referencement-ia…) que certains
     articles citent via `${PAGE_TO_URL['…']}` resté non évalué. */
  const urlsParId = {};
  {
    const src = await readFile(path.join(RACINE, 'constants.ts'), 'utf8');
    const bloc = /export const PAGE_TO_URL[\s\S]*?\n\};/.exec(src);
    if (bloc) for (const m of bloc[0].matchAll(/'([^']+)':\s*'([^']+)'/g)) urlsParId[m[1]] = m[2];
  }

  /* Métadonnées de TOUS les articles, chargées avant la boucle : c'est ce qui
     permet de calculer « Sur le même sujet » sans relire 66 fichiers par page. */
  const tousArticles = [];
  for (const f of fichiers) {
    const { titre, url, tag, date } = JSON.parse(await readFile(path.join(CONTENUS, f), 'utf8'));
    tousArticles.push({ titre, url, tag, date });
  }

  let ok = 0; const rates = [];
  for (const f of fichiers.sort()) {
    const d = JSON.parse(await readFile(path.join(CONTENUS, f), 'utf8'));
    const slug = d.url.replace(/^\/blog\//, '');
    if (seul && slug !== seul) continue;

    /* Deux origines possibles pour les signaux SEO d'un article :
       · `d.seo` dans le JSON — c'est le cas des articles écrits DEPUIS la
         suppression de l'application React (30/07/2026). Ils ne dépendent
         d'aucun code disparu, et un clone neuf du dépôt peut les régénérer ;
       · à défaut, la balise <SEO> du composant .tsx d'origine, pour les 66
         articles hérités. */
    let seo;
    if (d.seo) {
      seo = { ...d.seo, schemas: d.seo.schemas ?? null };
    } else {
      const texte = await readFile(path.join(BLOG_SRC, d.composant + '.tsx'), 'utf8');
      const source = ts.createSourceFile(d.composant, texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      /* Les sources interpolent `post.title`, `post.excerpt`… : on présente les
         champs sous leurs noms d'origine, sinon les substitutions rendent vide. */
      const post = { id: d.id, title: d.titre, excerpt: d.excerpt, url: d.url,
                     image: d.image, date: d.date, tag: d.tag };
      seo = litSeo(source, texte, post);
    }
    /* `image` de la balise <SEO> ne concerne QUE og:image. L'illustration de
       l'article vient de BLOG_DATA : sans cette séparation, les 58 articles
       sans override se retrouvaient avec <img src=""> (régression corrigée). */
    seo.imageOgOverride = seo.image;
    delete seo.image;

    if (!seo.title || !seo.description || !seo.canonical) {
      rates.push([slug, `SEO incomplet (title:${!!seo.title} desc:${!!seo.description} canonical:${!!seo.canonical})`]);
      continue;
    }
    if (!seo.schemas) rates.push([slug, 'JSON-LD non évalué — À VÉRIFIER']);

    const { html: sansAuteur, auteur: auteurDuCorps } = detacheAuteur(d.html);
    /* pas de carte dans le corps → on la reconstruit depuis l'auteur déclaré
       aux schémas, pour que tous les articles portent la même signature */
    const auteur = auteurDuCorps ?? auteurDepuisSchemas(seo.schemas);
    if (!auteurDuCorps && auteur) console.log(`  ${slug} : fiche auteur reconstruite (${auteur.nom})`);
    const { html: sansMorts, remplaces } = reparLiens(sansAuteur);
    if (remplaces) console.log(`  ${slug} : ${remplaces} lien(s) mort(s) repointé(s)`);
    const avecFaq = rendFaqManquante(sansMorts, seo.schemas, slug);
    const { html: corps, sommaire } = prepareCorps(avecFaq, urlsParId);
    const html = gabarit({ ...d, ...seo, html: corps, sommaire,
                           articlesLies: articlesLies(d, tousArticles),
                           ficheAuteur: ficheAuteur(auteur) }, schemaGlobal);

    /* Garde-fous : ces trois défauts sont passés inaperçus une fois, ils ne
       repasseront pas. Mieux vaut un build qui échoue qu'une page cassée. */
    if (/<img[^>]+src=""/.test(html)) { rates.push([slug, 'ABANDON : image avec src vide']); continue; }
    if (html.includes('${')) { rates.push([slug, 'ABANDON : template literal non résolu']); continue; }
    const nbMots = html.replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (nbMots < 500) { rates.push([slug, `ABANDON : seulement ${nbMots} mots servis`]); continue; }
    if ((html.match(/<h1\b/g) ?? []).length !== 1) {
      rates.push([slug, `ABANDON : ${(html.match(/<h1\b/g) ?? []).length} balises h1`]); continue;
    }

    const dossier = path.join(SORTIE, slug);
    await mkdir(dossier, { recursive: true });
    await writeFile(path.join(dossier, 'index.html'), html);
    ok++;

    /* Alias : /blog/meilleure-agence-geo-france-2026 et .../gso-... pointent
       vers le même article sur le site actuel. Sans cette page, 5 liens
       existants tomberaient en 404. Le canonical reste celui de l'article. */
    const alias = ALIAS[slug];
    if (alias) {
      const dAlias = path.join(SORTIE, alias);
      await mkdir(dAlias, { recursive: true });
      await writeFile(path.join(dAlias, 'index.html'), html);
      ok++;
    }
  }

  console.log(`${ok} page(s) générée(s) → site/blog/`);
  if (rates.length) {
    console.log(`\n${rates.length} avertissement(s) :`);
    for (const [s, e] of rates) console.log(`  ⚠︎ ${s.padEnd(42)} ${e}`);
  }
}

/* Exécution directe seulement : le module est aussi importé par
   genere-blog-liste.mjs pour partager la coquille (nav, footer). */
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
