/**
 * migre-articles.mjs — bascule les articles de blog sur <ArticleLayout>.
 *
 * Principe : on ne réécrit QUE l'enveloppe de présentation. Le contenu de
 * l'article (titres, paragraphes, tableaux, bloc auteur) est déplacé tel quel,
 * caractère pour caractère, à l'intérieur du nouveau composant. Le JSON-LD et
 * les props SEO sont conservés à l'identique.
 *
 * Le découpage passe par l'analyseur syntaxique TypeScript, pas par des
 * expressions régulières : les 60 articles ont été écrits à la main avec des
 * structures hétérogènes (divs auto-fermants, imbrications variables), et seul
 * un vrai parseur JSX sait où un élément se termine.
 *
 * Usage :
 *   node tools/migre-articles.mjs --essai            (aucune écriture)
 *   node tools/migre-articles.mjs --seul=GeoDefinition2026
 *   node tools/migre-articles.mjs --appliquer
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

/* fileURLToPath : le projet vit dans un chemin à espaces, url.pathname les encode. */
const DOSSIER = fileURLToPath(new URL('../views/blog/', import.meta.url));

const parcourt = (noeud, visite) => {
  visite(noeud);
  noeud.forEachChild(enfant => parcourt(enfant, visite));
};

/** Valeur littérale de l'attribut className, ou null si c'est une expression. */
function classeDe(ouvrant) {
  const attr = ouvrant.attributes?.properties?.find(
    p => ts.isJsxAttribute(p) && p.name.getText() === 'className');
  if (!attr?.initializer) return null;
  return ts.isStringLiteral(attr.initializer) ? attr.initializer.text : null;
}

/**
 * Conteneur rédactionnel : le premier élément portant la classe `prose`
 * (le jeton exact — « not-prose » ne compte pas).
 */
function trouveConteneurProse(source) {
  let trouve = null;
  parcourt(source, n => {
    if (trouve || !ts.isJsxElement(n)) return;
    const classe = classeDe(n.openingElement);
    if (classe && /(^|\s)prose(\s|$)/.test(classe)) trouve = n;
  });
  return trouve;
}

/**
 * Balise <SEO … /> de l'article, reprise mot pour mot.
 * Quatre articles portent des valeurs sur mesure (titre en « | Triaina »,
 * canonical en www, image OG dédiée, balises geo) : les recomposer serait les
 * écraser, donc on ne les interprète pas — on les transporte.
 */
function trouveBaliseSeo(source, texte) {
  let bloc = null;
  parcourt(source, n => {
    if (bloc) return;
    const nom = ts.isJsxSelfClosingElement(n) ? n.tagName.getText(source)
              : ts.isJsxElement(n) ? n.openingElement.tagName.getText(source) : null;
    if (nom === 'SEO') bloc = texte.slice(n.getStart(source), n.end);
  });
  return bloc;
}

/** Bloc `const seoSchema = ...` récupéré mot pour mot. */
function trouveSchema(source, texte) {
  let bloc = null;
  parcourt(source, n => {
    if (bloc || !ts.isVariableStatement(n)) return;
    const d = n.declarationList.declarations[0];
    if (d && d.name.getText() === 'seoSchema') bloc = texte.slice(n.getStart(source), n.end);
  });
  return bloc;
}

function trouveComposant(source) {
  let nom = null;
  parcourt(source, n => {
    if (nom || !ts.isVariableStatement(n)) return;
    const d = n.declarationList.declarations[0];
    if (d && /React\.FC/.test(d.type?.getText() ?? '')) nom = d.name.getText();
  });
  return nom;
}

function trouveIdPost(texte) {
  const m = /const post = BLOG_DATA\.find\(p => p\.id === '([^']+)'\)/.exec(texte);
  return m ? m[1] : null;
}

/**
 * Imports à reconduire : le contenu de certains articles utilise des icônes
 * (`<Search />`, `<AlertCircle />`…) ou des composants maison. Si on ne
 * reprend pas leur import, le contenu est intact mais ne compile plus.
 * On ne garde que les symboles réellement cités dans le contenu extrait.
 */
function importsUtiles(source, texte, contenu) {
  /* Usage réel seulement : balise JSX (<Icone …>) ou référence dans une
     expression ({Icone}). Un simple mot du texte (« Facebook » dans une phrase)
     ne compte pas, sinon on reconduit un import mort. */
  const cites = new Set([
    ...[...contenu.matchAll(/<\/?([A-Za-z_$][\w$]*)/g)].map(m => m[1]),
    ...[...contenu.matchAll(/\{[^}]*?\b([A-Za-z_$][\w$]*)\b[^}]*?\}/g)].map(m => m[1]),
  ]);
  const lignes = [];

  parcourt(source, n => {
    if (!ts.isImportDeclaration(n)) return;
    const module = n.moduleSpecifier.getText(source).slice(1, -1);
    if (module.endsWith('/constants') || module.endsWith('/SEO') || module === 'react') return;

    const clause = n.importClause;
    if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) return;

    const gardes = clause.namedBindings.elements
      .map(e => e.name.getText(source))
      .filter(nom => cites.has(nom));
    if (gardes.length) lignes.push(`import { ${gardes.join(', ')} } from '${module}';`);
  });

  return lignes;
}

/** Mots significatifs, pour vérifier qu'aucun texte rédactionnel ne disparaît. */
const motsDe = s => (s.replace(/<[^>]*>/g, ' ').match(/[\p{L}\p{N}]{4,}/gu) ?? []);

function transforme(texte, fichier) {
  if (texte.includes('ArticleLayout')) return { erreur: 'déjà migré' };

  const source = ts.createSourceFile(fichier, texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const composant = trouveComposant(source);
  if (!composant) return { erreur: 'composant React.FC introuvable' };

  const idPost = trouveIdPost(texte);
  if (!idPost) return { erreur: 'lookup BLOG_DATA introuvable' };

  const conteneur = trouveConteneurProse(source);
  if (!conteneur) return { erreur: 'conteneur .prose introuvable' };

  /* Contenu = tout ce qui est entre la balise ouvrante et la fermante. */
  const contenu = texte.slice(conteneur.openingElement.end, conteneur.closingElement.getStart(source));
  if (contenu.trim().length < 200) return { erreur: 'contenu extrait trop court' };

  const schema = trouveSchema(source, texte);
  const baliseSeo = trouveBaliseSeo(source, texte);
  if (!baliseSeo) return { erreur: 'balise <SEO> introuvable' };
  const reconduits = importsUtiles(source, texte, contenu);

  /* La balise SEO est réindentée d'un cran, sans qu'aucune valeur ne change. */
  const seoIndente = baliseSeo.split('\n').map((l, i) => (i ? '        ' + l.trimStart() : l)).join('\n');

  const sortie = `import React from 'react';
import { BLOG_DATA } from '../../constants';
import { SEO } from '../../components/SEO';
import { ArticleLayout } from '../../components/blog/ArticleLayout';
${reconduits.length ? reconduits.join('\n') + '\n' : ''}

export const ${composant}: React.FC = () => {
  const post = BLOG_DATA.find(p => p.id === '${idPost}');

${schema ? '  ' + schema.trim() + '\n\n' : ''}  if (!post) return null;

  return (
    <ArticleLayout
      post={post}
      seo={
        ${seoIndente}
      }
    >
${contenu.replace(/\s+$/, '')}
    </ArticleLayout>
  );
};
`;

  /* Filets de sécurité, dans l'ordre du plus grave au plus subtil. */
  const avant = motsDe(contenu), apres = motsDe(sortie);
  if (apres.length < avant.length) {
    return { erreur: `perte de texte : ${avant.length} → ${apres.length} mots` };
  }
  if (/<\/article>|Partager cet article/.test(contenu)) {
    return { erreur: 'extraction débordante (enveloppe capturée)' };
  }
  /* Le résultat doit lui-même être du TSX valide. */
  const relu = ts.createSourceFile(fichier, sortie, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const erreurs = relu.parseDiagnostics ?? [];
  if (erreurs.length) {
    const d = erreurs[0];
    return { erreur: `TSX invalide après transformation : ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}` };
  }

  return { sortie, stats: { mots: avant.length, lignesAvant: texte.split('\n').length,
                            lignesApres: sortie.split('\n').length } };
}

async function main() {
  const args = process.argv.slice(2);
  const appliquer = args.includes('--appliquer');
  const seul = (args.find(a => a.startsWith('--seul=')) ?? '').slice(7);

  const fichiers = (await readdir(DOSSIER))
    .filter(f => f.endsWith('.tsx'))
    .filter(f => !seul || f === seul + '.tsx');

  if (!fichiers.length) { console.error('aucun fichier ciblé'); process.exit(1); }

  const ok = [], refus = [];
  for (const f of fichiers.sort()) {
    const chemin = path.join(DOSSIER, f);
    const texte = await readFile(chemin, 'utf8');
    const r = transforme(texte, f);
    if (r.erreur) { refus.push([f, r.erreur]); continue; }
    ok.push([f, r.stats]);
    if (appliquer) await writeFile(chemin, r.sortie);
  }

  console.log(`${ok.length} article(s) ${appliquer ? 'migrés' : 'migrables'}`);
  for (const [f, s] of ok) {
    console.log(`  ✓ ${f.padEnd(38)} ${String(s.mots).padStart(5)} mots · ${s.lignesAvant} → ${s.lignesApres} lignes`);
  }
  if (refus.length) {
    console.log(`\n${refus.length} refus :`);
    for (const [f, e] of refus) console.log(`  ✗ ${f.padEnd(38)} ${e}`);
  }
  if (!appliquer) console.log('\n(essai — aucune écriture ; ajouter --appliquer)');
}

main();
