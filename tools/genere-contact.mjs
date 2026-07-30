/**
 * genere-contact.mjs — produit la page /contact du site DA-31.
 *
 * Fidélité : balises de tête, schémas (graphe Organization + BreadcrumbList),
 * H1, hiérarchie Hn et textes repris de la page actuelle, capturée par rendu
 * Chrome réel (tools/snapshots/ancien-faq-contact/contact.json) : mêmes
 * libellés, mêmes champs de formulaire (user_name, user_email, user_phone,
 * message), mêmes placeholders, même lien carte.
 *
 * Le formulaire ENVOIE réellement : l'ancien site passe par EmailJS
 * (@emailjs/browser) — la version statique appelle la même API REST
 * (api.emailjs.com) avec les mêmes service/template/clé publique, sans SDK ni
 * CDN. Mêmes messages de succès/erreur que la page actuelle.
 *
 * Usage : node tools/genere-contact.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ech, barreNav, pieds } from './genere-blog.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CAPTURE = path.join(RACINE, 'tools/snapshots/ancien-faq-contact/contact.json');

/* Identifiants EmailJS de la page actuelle (la clé publique est, par
   conception, publique — elle est déjà dans le bundle du site en ligne). */
const EMAILJS = { service: 'service_dme37kj', template: 'template_y87pze2', cle: 'E7cFvIw50eYZ8er2v' };

const STYLE = `
  /* ══════════════════════════════════════════════════════════════════════
     DA-37b « La Borne » — /contact, gabarit classique. Le formulaire est la
     borne lumineuse au centre du champ de particules — le langage du CTA de
     l'accueil. Un fil longe la borne et SE CHARGE champ après champ (CSS
     pur) ; formulaire complet → le bouton passe à l'or. Texte et SEO gelés.
     ══════════════════════════════════════════════════════════════════════ */
  .page{overflow-x:clip}
  .ct-wrap{position:relative; z-index:2; max-width:74rem; margin:0 auto;
    padding:8.5rem var(--marge) 5.5rem}

  .ct-hero{border-bottom:1px solid rgba(148,163,184,.18);
    padding-bottom:2rem; margin-bottom:clamp(2.5rem,5vw,4rem)}
  .ct-hero h1{font-family:var(--syne); font-weight:800; color:#fff; letter-spacing:-.02em;
    font-size:clamp(2.6rem,7vw,4.8rem); line-height:1; text-shadow:0 0 70px rgba(37,99,235,.5)}
  .ct-hero .k{font-family:ui-monospace,monospace; font-size:.66rem; letter-spacing:.22em;
    text-transform:uppercase; color:var(--bleu-c); margin-top:.7rem}

  /* ── la borne : voile centré, halo, seule source lumineuse ── */
  .ct-lum{position:relative; display:flex; justify-content:center}
  .ct-lum::before{ /* le flood derrière la borne, comme sur l'accueil */
    content:''; position:absolute; left:50%; top:50%; width:64rem; height:64rem;
    transform:translate(-50%,-50%); border-radius:50%; pointer-events:none;
    background:radial-gradient(closest-side, rgba(37,99,235,.20),
      rgba(255,233,184,.05) 55%, transparent 74%)}
  .ct-form{position:relative; width:min(46rem,100%);
    border:1px solid rgba(148,163,184,.2); border-radius:24px;
    background:rgba(11,20,40,.74); backdrop-filter:blur(6px);
    padding:clamp(1.6rem,4vw,3rem) clamp(1.4rem,3.5vw,2.8rem)
            clamp(1.6rem,4vw,3rem) clamp(2rem,4.5vw,3.4rem)}
  /* le fil : longe l'intérieur de la borne et se charge champ après champ */
  .ct-form::before{content:''; position:absolute; left:clamp(.9rem,2vw,1.5rem);
    top:clamp(1.6rem,4vw,3rem); bottom:clamp(1.6rem,4vw,3rem); width:1px;
    background:rgba(148,163,184,.22)}
  .ct-form::after{content:''; position:absolute; left:clamp(.9rem,2vw,1.5rem);
    top:clamp(1.6rem,4vw,3rem); width:1px;
    height:calc(var(--fil,0)*(100% - 2*clamp(1.6rem,4vw,3rem)));
    background:linear-gradient(180deg, var(--lueur), var(--bleu-c));
    box-shadow:0 0 14px rgba(255,233,184,.55);
    transition:height .6s cubic-bezier(.22,.9,.24,1)}
  .ct-form:has(#user_name:not(:placeholder-shown)){--fil:.25}
  .ct-form:has(#user_name:not(:placeholder-shown)):has(#user_email:not(:placeholder-shown)){--fil:.5}
  .ct-form:has(#user_name:not(:placeholder-shown)):has(#user_email:not(:placeholder-shown)):has(#user_phone:not(:placeholder-shown)){--fil:.75}
  .ct-form:has(#user_name:not(:placeholder-shown)):has(#user_email:not(:placeholder-shown)):has(#user_phone:not(:placeholder-shown)):has(#message:not(:placeholder-shown)){--fil:1}
  .ct-form.envoye{--fil:1}

  .ct-form h3{font-family:var(--syne); font-weight:700; color:#fff;
    font-size:clamp(1.2rem,1.9vw,1.5rem);
    display:flex; align-items:center; gap:.65rem; margin-bottom:1.7rem}
  .ct-form h3 svg{width:20px; height:20px; fill:none; stroke:var(--bleu-c);
    stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round}

  .ct-form .ligne{display:grid; grid-template-columns:1fr 1fr; gap:0 1.6rem}
  @media(max-width:620px){.ct-form .ligne{grid-template-columns:1fr}}
  .ct-form .champ{position:relative; display:flex; flex-direction:column; gap:.45rem;
    padding-bottom:1.35rem}
  .ct-form label{font-family:ui-monospace,monospace; font-size:.6rem; letter-spacing:.18em;
    text-transform:uppercase; color:var(--brume); font-weight:700; transition:color .3s}
  .ct-form .champ:focus-within label{color:var(--lueur)}
  .ct-form input, .ct-form textarea{
    width:100%; background:transparent; border:0;
    border-bottom:1px solid rgba(148,163,184,.35); border-radius:0;
    padding:.6rem .1rem; color:var(--papier);
    font-family:var(--manrope); font-size:.98rem; transition:border-color .3s}
  .ct-form textarea{resize:none}
  .ct-form input::placeholder, .ct-form textarea::placeholder{color:rgba(148,163,184,.55)}
  .ct-form input:focus, .ct-form textarea:focus{outline:none; border-color:transparent}
  .ct-form .champ::after{content:''; position:absolute; left:0; bottom:1.35rem; height:1px;
    width:100%; background:linear-gradient(90deg,var(--lueur),var(--bleu-c));
    transform:scaleX(0); transform-origin:0 50%;
    transition:transform .4s cubic-bezier(.22,.9,.24,1)}
  .ct-form .champ:focus-within::after{transform:scaleX(1)}
  .ct-form .champ:has(input:not(:placeholder-shown))::after,
  .ct-form .champ:has(textarea:not(:placeholder-shown))::after{transform:scaleX(1);
    background:rgba(96,165,250,.6)}

  .ct-form button[type=submit]{
    width:100%; display:inline-flex; align-items:center; justify-content:center; gap:.7rem;
    background:var(--bleu); color:#fff; border:0; cursor:pointer;
    font-family:var(--manrope); font-weight:800; font-size:.8rem; letter-spacing:.15em;
    text-transform:uppercase; padding:1.15rem 2rem; border-radius:99px; margin-top:.5rem;
    box-shadow:0 18px 44px -20px rgba(37,99,235,.95);
    transition:background .3s, box-shadow .35s, transform .2s, opacity .3s, color .3s}
  .ct-form button[type=submit]:hover{background:var(--bleu-nuit);
    box-shadow:0 0 38px rgba(37,99,235,.65); transform:translateY(-1px)}
  /* borne chargée : le bouton passe à l'or */
  .ct-form:has(#user_name:not(:placeholder-shown)):has(#user_email:not(:placeholder-shown)):has(#message:not(:placeholder-shown)) button[type=submit]{
    background:var(--lueur); color:#1B1206;
    box-shadow:0 0 42px -8px rgba(255,233,184,.8)}
  .ct-form button[type=submit][disabled]{opacity:.55; cursor:not-allowed; transform:none}
  .ct-form button svg{width:15px; height:15px; fill:none; stroke:currentColor;
    stroke-width:2; stroke-linecap:round; stroke-linejoin:round}

  .ct-etat{display:none; margin-top:1.1rem; padding:.95rem 1.15rem; border-radius:12px;
    font-size:.9rem; align-items:center; gap:.6rem}
  .ct-etat.la{display:flex}
  .ct-etat.ok{background:rgba(34,197,94,.12); color:#86EFAC; border:1px solid rgba(34,197,94,.35)}
  .ct-etat.ko{background:rgba(239,68,68,.12); color:#FCA5A5; border:1px solid rgba(239,68,68,.35)}

  /* ── les bureaux : bande discrète sous la borne ── */
  .ct-bureaux{margin-top:clamp(2.5rem,5vw,4rem); padding-top:1.8rem;
    border-top:1px solid rgba(148,163,184,.16);
    display:flex; flex-wrap:wrap; align-items:baseline; gap:1rem 2.5rem}
  .ct-bureaux h3{font-family:var(--syne); font-weight:700; font-size:.78rem; color:#fff;
    letter-spacing:.22em; text-transform:uppercase;
    display:inline-flex; align-items:center; gap:.55rem; margin:0}
  .ct-bureaux h3 svg{width:15px; height:15px; fill:none; stroke:var(--bleu-c);
    stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round}
  .ct-bureaux address{font-style:normal; color:#CBD5E1; font-weight:300;
    display:inline; line-height:1.7}
  .ct-bureaux address br{display:none}
  .ct-bureaux address strong{color:#fff; font-weight:700; margin-right:.4rem}
  .ct-carte-lien{display:inline-flex; align-items:center; gap:.5rem;
    font-size:.68rem; font-weight:800; letter-spacing:.16em;
    text-transform:uppercase; color:var(--bleu-c); transition:color .3s, gap .3s}
  .ct-carte-lien:hover{color:var(--lueur); gap:.75rem}
  .ct-carte-lien svg{width:13px; height:13px; fill:none; stroke:currentColor;
    stroke-width:2; stroke-linecap:round; stroke-linejoin:round}
  @media(max-width:620px){
    .ct-bureaux{flex-direction:column; gap:.9rem}
    .ct-bureaux address br{display:block}
  }

  /* arrivée (additive) */
  .ct-anim :is(.ct-hero,.ct-form,.ct-bureaux){transition:opacity .8s, transform .8s cubic-bezier(.22,.9,.24,1)}
  .ct-anim :is(.ct-hero,.ct-form,.ct-bureaux):not(.vu){opacity:0; transform:translateY(22px)}

  @media (prefers-reduced-motion: reduce){
    .ct-form::after{transition:none}
    .ct-form .champ::after{transition:none}
  }
`;

async function main() {
  const cap = JSON.parse(await readFile(CAPTURE, 'utf8'));
  if (!cap.title || !cap.description) throw new Error('capture incomplète');

  const meta = (o) => Object.entries(o)
    .map(([k, v]) => `<meta ${k.startsWith('og:') ? 'property' : 'name'}="${k}" content="${ech(v)}">`).join('\n');

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(cap.title)}</title>
<meta name="description" content="${ech(cap.description)}">
${cap.keywords ? `<meta name="keywords" content="${ech(cap.keywords)}">` : ''}
<link rel="canonical" href="${ech(cap.canonical)}">
<meta name="ICBM" content="${ech((cap.geo['geo.position'] ?? '').replace(';', ', '))}">
<meta name="msvalidate.01" content="4C58C9622B2DBB31ECD9A463E3DCAF66">
<link rel="alternate" hreflang="fr" href="https://www.triaina.fr/">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo.svg">
${meta(cap.geo)}
${meta(cap.og)}
${meta(cap.twitter)}
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

${barreNav('/contact')}

<main class="page">
  <div class="ct-wrap">

    <header class="ct-hero">
      <h1>CONTACT</h1>
      <p class="k">// Bureau Parisien</p>
    </header>

    <div class="ct-lum">
      <div class="ct-form">
        <h3><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>Envoyez-nous un message</h3>
        <form id="ctForm" method="post" action="#">
          <div class="champ">
            <label for="user_name">Nom &amp; Entreprise</label>
            <input type="text" name="user_name" id="user_name" required placeholder="Jean Dupont - Société X" autocomplete="name">
          </div>
          <div class="ligne">
            <div class="champ">
              <label for="user_email">Email Professionnel</label>
              <input type="email" name="user_email" id="user_email" required placeholder="contact@entreprise.com" autocomplete="email">
            </div>
            <div class="champ">
              <label for="user_phone">Téléphone</label>
              <input type="tel" name="user_phone" id="user_phone" placeholder="06 12 34 56 78" autocomplete="tel">
            </div>
          </div>
          <div class="champ">
            <label for="message">Votre Défi / Projet</label>
            <textarea name="message" id="message" required rows="4" placeholder="Décrivez votre projet..."></textarea>
          </div>
          <button type="submit" id="ctBtn">
            <span id="ctBtnTxt">Envoyer la demande</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>
          </button>
          <p class="ct-etat ok" id="ctOk" role="status">Message envoyé avec succès&nbsp;! Nous vous répondrons sous 24h.</p>
          <p class="ct-etat ko" id="ctKo" role="alert">Une erreur est survenue. Vérifiez votre connexion ou appelez-nous.</p>
        </form>
      </div>
    </div>

    <div class="ct-bureaux">
      <h3><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>Bureaux</h3>
      <address><strong>Triaina</strong>50 Quai Louis Blériot<br>75016 Paris<br>France</address>
      <a class="ct-carte-lien" href="https://maps.google.com/?q=50+Quai+Louis+Blériot+75016+Paris" target="_blank" rel="noopener noreferrer">
        Voir sur la carte
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>
      </a>
    </div>

  </div>
</main>

${pieds()}

<script src="/assets/da31.js" defer></script>
<script>
/* Envoi réel via l'API EmailJS de la page actuelle (mêmes identifiants, la
   clé est publique par conception). Sans JS : le bouton ne fait rien de
   destructif (action="#") et l'email/l'adresse restent dans la page. */
(function () {
  var form = document.getElementById('ctForm');
  var btn = document.getElementById('ctBtn');
  var btnTxt = document.getElementById('ctBtnTxt');
  var ok = document.getElementById('ctOk');
  var ko = document.getElementById('ctKo');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ok.classList.remove('la'); ko.classList.remove('la');
    btn.disabled = true; btnTxt.textContent = 'Envoi...';

    var params = {};
    ['user_name', 'user_email', 'user_phone', 'message'].forEach(function (n) {
      params[n] = form.elements[n] ? form.elements[n].value : '';
    });

    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: '${EMAILJS.service}',
        template_id: '${EMAILJS.template}',
        user_id: '${EMAILJS.cle}',
        template_params: params,
      }),
    }).then(function (rep) {
      if (!rep.ok) return rep.text().then(function (t) { throw new Error('EmailJS ' + rep.status + ' : ' + t.slice(0, 200)); });
      ok.classList.add('la');
      document.querySelector('.ct-form').classList.add('envoye');
      form.reset();
    }).catch(function (err) {
      console.error('Erreur EmailJS:', err);
      ko.classList.add('la');
    }).finally(function () {
      btn.disabled = false; btnTxt.textContent = 'Envoyer la demande';
    });
  });

  /* arrivée en douceur */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  document.body.classList.add('ct-anim');
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('vu');
      obs.unobserve(x.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  [].slice.call(document.querySelectorAll('.ct-hero, .ct-form, .ct-bureaux')).forEach(function (el, i) {
    el.style.transitionDelay = i * 110 + 'ms';
    obs.observe(el);
  });
})();
</script>
</body>
</html>
`;

  const dossier = path.join(RACINE, 'site/contact');
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, 'index.html'), html);

  const titres = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => m[1] + ':' + m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
  const h1 = titres.filter(x => x.startsWith('1:'));

  /* ══ GARDE-FOU DE PARITÉ DU TEXTE ══
     Toute refonte visuelle doit laisser le texte du <main> identique au
     caractère près à la référence figée (tools/reference/contact-texte.txt).
     Divergence = échec de génération, avec le mot exact pointé. */
  const corpsMain = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)[1];
  const texteMain = corpsMain
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8239;|&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ').trim();
  const refTexte = (await readFile(path.join(RACINE, 'tools/reference/contact-texte.txt'), 'utf8')).trim();
  if (texteMain !== refTexte) {
    const A = refTexte.split(' '), B = texteMain.split(' ');
    let i = 0;
    while (i < A.length && i < B.length && A[i] === B[i]) i++;
    throw new Error('TEXTE MODIFIÉ — refonte purement visuelle exigée.\n'
      + `  premier écart au mot ${i} (${A.length} attendus, ${B.length} produits)\n`
      + `  attendu : …${A.slice(Math.max(0, i - 6), i + 8).join(' ')}…\n`
      + `  produit : …${B.slice(Math.max(0, i - 6), i + 8).join(' ')}…`);
  }
  console.log('page /contact générée');
  console.log('  title     :', cap.title);
  console.log('  canonical :', cap.canonical);
  console.log('  JSON-LD   :', cap.schemas.length, 'bloc(s), reconduits de la capture');
  console.log('  h1        :', h1.map(x => x.slice(2)));
  console.log('  champs    :', ['user_name', 'user_email', 'user_phone', 'message']
    .every(n => html.includes(`name="${n}"`)) ? 'les 4 de la page actuelle' : 'MANQUANTS');
  if (h1.length !== 1 || h1[0] !== '1:' + cap.h1[0]) throw new Error('h1 ≠ capture');
}

main().catch(e => { console.error(e.message); process.exit(1); });
