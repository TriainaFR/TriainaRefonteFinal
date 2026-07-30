/**
 * recrutement.mjs — « L'Appel » : la page qui recrute.
 * Le titre s'arme lettre par bloc, les trois traits du profil recherché
 * se dressent comme les pointes du trident, et le cartouche final
 * (candidature spontanée) monte du bas en captant la lueur d'or.
 * Page courte : toute la tension tient dans l'arrivée et dans le contraste
 * entre la colonne de gauche (le discours) et la colonne d'appui (le profil).
 */

export const STYLE = `
  /* ── L'Appel ── */
  .g-s0{padding-top:8.5rem; padding-bottom:.5rem}
  .g-s0 h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.02em; font-size:clamp(2.4rem,6vw,4.4rem); line-height:1.02;
    text-transform:uppercase}
  /* le lien de retour : discret, mono, au-dessus du titre */
  .g-s0 p:first-child a{font-family:ui-monospace,monospace; font-size:.7rem;
    letter-spacing:.16em; text-transform:uppercase; color:var(--brume);
    text-decoration:none; display:inline-flex; align-items:center; gap:.5rem}
  .g-s0 p:first-child a::before{content:'←'; transition:transform .3s}
  .g-s0 p:first-child a:hover{color:var(--bleu-p)}
  .g-s0 p:first-child a:hover::before{transform:translateX(-4px)}
  /* le kicker « // Missions Ouvertes » : pulsation lente du point d'amorce */
  .g-s0 p:last-child{font-family:ui-monospace,monospace; font-size:.72rem;
    letter-spacing:.22em; text-transform:uppercase; color:var(--bleu-c);
    margin-top:1rem}

  /* ── section 1 : le discours et le profil, en vis-à-vis ── */
  .g-s1{display:grid; gap:clamp(2rem,5vw,4rem); align-items:start;
    border-top:1px solid rgba(148,163,184,.18); margin-top:2.5rem}
  /* Placement EXPLICITE : en placement automatique, la liste retombait sous le
     paragraphe en colonne 1 et laissait « PROFIL RECHERCHÉ » seul en colonne 2,
     sans son contenu. On ancre chaque élément. */
  @media(min-width:900px){
    .g-s1{grid-template-columns:1.6fr 1fr}
    .g-s1 > p:first-child{grid-column:1; grid-row:1 / span 2}
    .g-s1 > p:nth-child(2){grid-column:2; grid-row:1}
    .g-s1 > ul{grid-column:2; grid-row:2}
  }
  .g-s1 p:first-child{color:var(--brume); line-height:1.8;
    font-size:clamp(1.05rem,1.7vw,1.3rem); max-width:44rem}
  /* « PROFIL RECHERCHÉ » : intitulé de colonne, pas un titre sémantique */
  .g-s1 p:nth-child(2){font-family:ui-monospace,monospace; font-size:.68rem;
    letter-spacing:.2em; color:var(--brume); margin-bottom:1rem}
  .g-s1 ul{border-left:2px solid var(--bleu-p); padding-left:1.4rem; margin:0}
  .g-s1 li{list-style:none; color:#EAF0FF; font-weight:700;
    font-size:.98rem; line-height:1.5; padding:.55rem 0; position:relative}
  /* les trois pointes : un trait d'or qui se dresse à l'arrivée */
  .g-s1 li::before{content:''; position:absolute; left:-1.4rem; top:1.05em;
    width:2px; height:0; background:var(--lueur); transform:translateX(-1px);
    transition:height .45s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .g-s1 li.vu::before{height:1.1rem; top:.4em}

  /* ── section 2 : l'état « aucune offre » ── */
  .g-s2 p{font-family:ui-monospace,monospace; font-size:.85rem;
    color:var(--brume); text-align:center; padding:clamp(2rem,5vw,3.5rem) 1rem;
    border:1px dashed rgba(148,163,184,.3); border-radius:.75rem}

  /* ── section 3 : le cartouche de candidature spontanée ── */
  .g-s3{position:relative; text-align:center; border-radius:1rem;
    padding:clamp(2.5rem,6vw,4.5rem) clamp(1.2rem,4vw,3rem);
    background:linear-gradient(140deg,rgba(30,58,138,.55),rgba(2,6,23,.85));
    border:1px solid rgba(96,165,250,.22); overflow:hidden}
  /* la lueur qui balaie le cartouche à l'arrivée */
  .g-s3::after{content:''; position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(60% 80% at 50% 0%,rgba(255,233,184,.16),transparent 70%);
    opacity:0; transition:opacity .9s}
  .xp-anim .g-s3.vu::after{opacity:1}
  .g-s3 h3{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.4rem,3vw,2.1rem); margin:0}
  .g-s3 p:not(:last-child){color:var(--brume); line-height:1.75;
    max-width:38rem; margin:1rem auto 0}
  .g-s3 p:last-child{margin-top:2rem}
  .g-s3 a{display:inline-block; padding:1rem 2.4rem; border-radius:.5rem;
    background:#fff; color:#0B1220; font-weight:800; text-decoration:none;
    font-family:ui-monospace,monospace; font-size:.75rem; letter-spacing:.16em;
    text-transform:uppercase; transition:transform .3s, box-shadow .3s}
  .g-s3 a:hover{transform:translateY(-2px);
    box-shadow:0 12px 30px rgba(255,233,184,.28)}

  /* ── arrivées ── */
  .xp-anim .ap:not(.vu){opacity:0; transform:translateY(14px)}
  .xp-anim .ap{transition:opacity .55s, transform .55s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .xp-anim .ap:not(.vu){opacity:1; transform:none}
    .g-s1 li::before{height:1.1rem; top:.4em}
    .g-s3::after{opacity:1}
  }
`;

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll(
    '.g-s0 h1, .g-s0 p, .g-s1 p, .g-s1 ul, .g-s1 li, .g-s2 p, .g-s3'));
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      for (var j = 0; j <= cibles.indexOf(x.target); j++) {
        cibles[j].classList.add('vu');
        io.unobserve(cibles[j]);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  cibles.forEach(function (el) { el.classList.add('ap'); io.observe(el); });
`;
