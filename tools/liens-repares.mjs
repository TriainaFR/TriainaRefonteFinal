/**
 * liens-repares.mjs — répare les liens internes morts hérités de l'ancien site.
 *
 * L'audit du 29/07/2026 a relevé 16 liens vers 10 URLs qui n'ont JAMAIS existé
 * (vérifié : aucune route correspondante dans l'ancienne table de routage), plus
 * 8 liens laissés en `href="#"`. Sur l'ancienne SPA c'étaient de vraies fuites
 * de maillage : le lecteur tombait sur du vide et le crawler ne suivait rien.
 *
 * Deux tables, deux logiques :
 *  - REDIRECTIONS : cible morte → cible réelle. S'applique partout, le libellé
 *    du lien n'est jamais touché.
 *  - ANCRES_MORTES : les `href="#"`, qui n'ont pas de cible à deviner. On les
 *    résout par le TEXTE du lien, page par page, pour ne pas risquer de
 *    repointer un homonyme ailleurs sur le site.
 *
 * Règle appliquée aux cibles : on vise toujours l'URL CANONIQUE. `/expertise-gso`
 * et `/blog/meilleure-agence-geo-france-2026` sont servies mais se déclarent
 * non canoniques — y envoyer du maillage interne reviendrait à diluer le signal.
 */

/** Cible morte → cible réelle. Le choix vient du libellé observé sur le lien. */
export const REDIRECTIONS = {
  // « Generative Engine Optimization »
  '/blog/guide-complet-geo': '/blog/geo-definition-2026',
  // « optimiser votre site pour les LLM »
  '/blog/comment-optimiser-site-llm': '/blog/optimiser-site-llm-guide-seo-complet-2026',
  // « une agence SEO à Paris » — la page existe, mais à la racine, pas sous /blog
  '/blog/agence-seo-paris': '/agence-seo-paris',
  // « prix d'une agence SEO »
  '/blog/prix-agence-seo-geo': '/blog/prix-tarifs-agence-seo-geo-2026',
  // « meilleure agence GEO France » → on vise la version canonique
  '/blog/meilleure-agence-referencement-ia-france-2026': '/blog/meilleure-agence-gso-france-2026',
  // « agence GSO » → /expertise-gso se déclare non canonique, on vise sa cible
  '/agence-gso': '/expertise-geo',
  // « stratégie de contenu pour le e-commerce »
  '/blog/agence-seo-ecommerce-2026': '/blog/agence-seo-ecommerce',
  // « stratégie de contenu SEO local »
  '/blog/seo-local-france-2026': '/blog/seo-local-france',
  // « critères E-E-A-T de Google »
  '/blog/eeat-seo': '/blog/eeat-seo-guide-complet',
  // « choisir une agence SEO en France »
  '/blog/agence-seo-france-2026': '/blog/agence-seo-france',

  /* Relevés le 29/07 dans les 5 articles importés du dépôt de prod : mêmes
     fuites, déjà en ligne aujourd'hui. */
  '/blog/meilleure-agence-geo-france': '/blog/meilleure-agence-gso-france-2026',
  '/meilleure-agence-referencement-ia-france-2026': '/blog/meilleure-agence-gso-france-2026',
  '/blog/audit-seo': '/blog/audit-seo-guide-complet',
  '/blog/google-ai-mode': '/blog/google-ai-mode-2026',
  '/blog/google-ai-overview-ecommerce': '/blog/ai-overview-ecommerce-france-2026',
  '/agence-google-ai-overview-2026': '/blog/agence-google-ai-overview',
};

/** page → { libellé exact du lien : cible }. Ne s'applique qu'aux href="#". */
export const ANCRES_MORTES = {
  'expertise-ai-overview': {
    "AI Overview pour l'e-commerce": '/blog/ai-overview-ecommerce-france-2026',
    'agences AI Overview': '/blog/agence-google-ai-overview',
    'guide pratique pour apparaître dans AI Overview': '/blog/google-ai-overview-france',
    'expertise GEO complète': '/expertise-geo',
    'référencement IA': '/agence-referencement-ia',
    "En savoir plus sur l'e-commerce": '/blog/ai-overview-ecommerce-france-2026',
    'comment choisir votre agence AI Overview': '/blog/agence-google-ai-overview',
  },
  annuaire: {
    'Meilleure agence référencement IA France': '/blog/meilleure-agence-gso-france-2026',
  },
};

const texteDe = s => s.replace(/<[^>]*>/g, '')
  .replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

/**
 * Applique les deux tables à un fragment de HTML.
 * `page` est la clé de ANCRES_MORTES ; sans elle, seules les REDIRECTIONS jouent.
 * Retourne { html, remplaces } — le compteur sert aux journaux de build.
 */
export function reparLiens(html, page = null) {
  let remplaces = 0;
  let out = String(html ?? '');

  /* cibles mortes → cibles réelles (href absolu interne ou relatif) */
  out = out.replace(/href="([^"]+)"/g, (tout, href) => {
    const [chemin, ancre] = href.split('#');
    const cle = chemin.replace(/\/$/, '');
    const vers = REDIRECTIONS[cle];
    if (!vers) return tout;
    remplaces++;
    return `href="${vers}${ancre ? '#' + ancre : ''}"`;
  });

  /* href="#" → vraie URL, résolue par le texte du lien */
  const table = page ? ANCRES_MORTES[page] : null;
  if (table) {
    out = out.replace(/<a\b([^>]*)href="#"([^>]*)>([\s\S]*?)<\/a>/gi,
      (tout, avant, apres, dedans) => {
        const vers = table[texteDe(dedans)];
        if (!vers) return tout;
        remplaces++;
        return `<a${avant}href="${vers}"${apres}>${dedans}</a>`;
      });
  }
  return { html: out, remplaces };
}
