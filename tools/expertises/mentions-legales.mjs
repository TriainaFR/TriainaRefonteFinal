/**
 * mentions-legales.mjs — « Le Paraphe » : la page légale, digne et nette.
 * Chaque article (h2) porte un paraphe d'or — un court trait incliné qui se
 * trace sous l'intitulé à l'entrée, comme une signature apposée. Le reste
 * est une colonne de lecture calme. Aucun autre effet : la sobriété est ici
 * la justesse (page légale), la famille reste lisible dans les détails
 * (mono, filets, or posé avec parcimonie).
 */

export const STYLE = `
  /* ── Le Paraphe ── */
  .g-s0{padding-top:8.5rem; padding-bottom:.5rem}
  .g-s0 h1{font-family:var(--syne); font-weight:800; color:#fff;
    letter-spacing:-.015em; font-size:clamp(2rem,4.4vw,3.2rem); line-height:1.1}
  .g-s0 p{max-width:44rem; color:var(--brume); line-height:1.75; margin-top:1rem}

  .xp-sec{padding:clamp(1.6rem,3vw,2.6rem) 0}
  .xp-sec h2{font-family:var(--syne); font-weight:800; color:#fff;
    font-size:clamp(1.2rem,2.2vw,1.55rem); position:relative;
    display:inline-block; padding-bottom:.55rem}
  /* le paraphe : trait d'or incliné qui se trace */
  .xp-sec h2::after{content:''; position:absolute; left:0; bottom:0;
    width:44px; height:2px; background:var(--lueur);
    transform:skewY(-6deg); transform-origin:left;
    transition:width .5s cubic-bezier(.22,.9,.24,1)}
  .xp-anim .xp-sec h2:not(.vu)::after{width:0}
  .xp-sec p{max-width:44rem; color:var(--brume); line-height:1.75; margin-top:.8rem}
  .xp-sec p strong{color:#EAF0FF}
  .xp-sec li{color:var(--brume); line-height:1.7; margin-top:.4rem;
    list-style:none; position:relative; padding-left:1.1rem; font-size:.95rem}
  .xp-sec li::before{content:''; position:absolute; left:0; top:.62em;
    width:5px; height:2px; background:rgba(255,233,184,.55);
    transform:skewY(-6deg)}
  .xp-sec a{color:var(--bleu-p); text-decoration:underline; text-underline-offset:3px}
  .xp-sec a:hover{color:var(--lueur)}

  /* arrivées : fondu discret */
  .xp-anim .ml:not(.vu){opacity:0; transform:translateY(10px)}
  .xp-anim .ml{transition:opacity .5s, transform .5s cubic-bezier(.22,.9,.24,1)}

  @media (prefers-reduced-motion: reduce){
    .xp-sec h2::after{width:44px}
  }
`;

export const JS = `
  var cibles = [].slice.call(document.querySelectorAll('.xp-sec h2, .xp-sec p, .xp-sec ul'));
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (x) {
      if (!x.isIntersecting) return;
      for (var j = 0; j <= cibles.indexOf(x.target); j++) {
        cibles[j].classList.add('vu');
        io.unobserve(cibles[j]);
      }
    });
  }, { threshold: .2, rootMargin: '0px 0px -8% 0px' });
  cibles.forEach(function (el) { el.classList.add('ml'); io.observe(el); });
`;
