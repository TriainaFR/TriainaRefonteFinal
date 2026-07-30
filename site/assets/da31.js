/* ═══════════════════════════════════════════════════════════════════════
   DA-31 « Éclat » — coquille du site, sans dépendance.

   Une seule grande idée : LA LUMIÈRE CHARGE, L'OMBRE PERD.
   Le halo du curseur charge les particules qu'il touche (or à l'allumage,
   bleu quand la charge tient) ; quand une zone est chargée, une décharge
   voyage de charge en charge jusqu'à la pointe du trident.

   Contraintes de la mission : un seul rAF, devicePixelRatio plafonné,
   animation coupée sous prefers-reduced-motion, aucun texte injecté.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── 1. Champ de charges — PAGES DE LECTURE UNIQUEMENT ───────────
     Ce champ-ci est le fond calme d'une page qu'on lit : trident centré, en
     retrait, sans état de scroll.

     L'accueil, lui, garde son propre moteur (trident décentré à 78 % dans le
     hero, faisceau du phare, balayage, trois états au scroll) déclaré dans la
     page. Il le signale par data-fond="accueil" sur <body>, et ce fichier ne
     doit alors PAS toucher aux mêmes canvas : deux moteurs qui peignent
     #scene/#arcs se recouvrent frame après frame, et c'est le calme qui gagne
     — le logo de l'accueil se retrouve recentré et éteint. */
  var cv = document.getElementById('scene');
  var cvA = document.getElementById('arcs');
  var fondPropre = document.body && document.body.getAttribute('data-fond') === 'accueil';
  if (cv && cvA && !fondPropre) champ(cv, cvA);

  function champ(cv, cvA) {
    var cx = cv.getContext('2d'), cxA = cvA.getContext('2d');
    if (!cx || !cxA) return;

    var DPR = Math.min(devicePixelRatio || 1, 1.5);
    var W = innerWidth, H = innerHeight;
    var N = W < 900 ? 900 : 1800;

    /* Géométrie exacte du logo (repère SVG 0..40) :
       hampe x 18→22 y 5→30 · dents x 10→13 et 27→30, y 12→27. */
    var BARRES = [
      { x0: 18, x1: 22, y0: 5, y1: 30, bleu: true },
      { x0: 10, x1: 13, y0: 12, y1: 27, bleu: false },
      { x0: 27, x1: 30, y0: 12, y1: 27, bleu: false }
    ];
    var aires = BARRES.map(function (b) { return (b.x1 - b.x0) * (b.y1 - b.y0); });
    var aireTot = aires[0] + aires[1] + aires[2];
    var ECH = 30, CXU = 20, CYU = 17.5;

    var parts = [], proj = [], pointeIdx = 0, pointeY = 1e9;
    for (var i = 0; i < N; i++) {
      var tir = Math.random() * aireTot, k = 0, cum = aires[0];
      while (tir > cum && k < 2) { k++; cum += aires[k]; }
      var b = BARRES[k];
      var ux = b.x0 + Math.random() * (b.x1 - b.x0);
      var uy = b.y0 + Math.random() * (b.y1 - b.y0);
      var p = {
        /* une sur six dérive dans tout le cadre : c'est le milieu que la
           lumière traverse et où l'éclair trouve son chemin */
        amb: i % 6 === 0,
        tx: (ux - CXU) * ECH, ty: (uy - CYU) * ECH, tz: (Math.random() - .5) * 44,
        gx: (Math.random() - .5) * 2400, gy: (Math.random() - .5) * 1400, gz: (Math.random() - .5) * 700,
        bleu: b.bleu, r: Math.random() * Math.PI * 2, bd: i / N,
        ox: 0, oy: 0, ch: 0, hot: 0
      };
      p.sx0 = p.tx * 3.4 + (Math.random() - .5) * 900;
      p.sy0 = p.ty * 3.4 + (Math.random() - .5) * 900;
      p.sz0 = p.tz + (Math.random() - .5) * 900;
      if (!p.amb && p.bleu && p.ty < pointeY) { pointeY = p.ty; pointeIdx = i; }
      parts.push(p);
      proj.push({ sx: 0, sy: 0, ok: false });
    }

    function resize() {
      W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cvA.width = W; cvA.height = H;
      cvA.style.width = W + 'px'; cvA.style.height = H + 'px';
    }
    resize();
    addEventListener('resize', resize);

    var mx = 0, pxs = -1e4, pys = -1e4, boot = reduit ? 1 : 0, strike = 0;
    var arcs = [], lueur = document.querySelector('.curseur-lueur');

    if (!reduit) {
      addEventListener('pointermove', function (e) {
        pxs = e.clientX; pys = e.clientY;
        mx = (e.clientX / W - .5) * 2;
        if (lueur) {
          /* le halo est déjà centré sur (0,0) par ses left/top négatifs :
             on translate des coordonnées brutes, sans ajouter le rayon */
          lueur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
          lueur.style.opacity = '1';
        }
      }, { passive: true });
      addEventListener('pointerleave', function () {
        pxs = -1e4; pys = -1e4;
        if (lueur) lueur.style.opacity = '0';
      });
      addEventListener('click', function (e) { decharge(e.clientX, e.clientY); });
    }

    /* L'éclair ne tombe pas du ciel : il saute de charge en charge. */
    function decharge(depX, depY) {
      var cible = proj[pointeIdx];
      if (!cible.ok) return;
      var pts = [[depX, depY]];
      for (var s = 0; s < 7; s++) {
        var t = (s + 1) / 8;
        var bx = depX + (cible.sx - depX) * t, by = depY + (cible.sy - depY) * t;
        var best = -1, bd = 190;
        for (var i = 0; i < N; i += 3) {
          if (!proj[i].ok || parts[i].ch < .25) continue;
          var d = Math.hypot(proj[i].sx - bx, proj[i].sy - by);
          if (d < bd) { bd = d; best = i; }
        }
        if (best >= 0) { pts.push([proj[best].sx, proj[best].sy]); parts[best].hot = 1; }
        else pts.push([bx + (Math.random() - .5) * 60, by + (Math.random() - .5) * 60]);
      }
      pts.push([cible.sx, cible.sy]);
      arcs.push({ pts: pts, a: 1 });
      if (arcs.length > 4) arcs.shift();
      strike = 1;
    }

    var t0 = 0, prochaine = 2.4;
    function dessine(t) {
      if (!t0) t0 = t;
      var e = (t - t0) / 1000;
      cx.clearRect(0, 0, W, H);

      var f = 620;
      var ry = mx * .2 + Math.sin(e * .085) * .1;
      var cosY = Math.cos(ry), sinY = Math.sin(ry);
      var etroit = W < 1120;
      var mini = etroit ? .55 : Math.min(1, W / 1300);
      /* Trident centré dans le cadre. Sur une page de lecture il reste en
         retrait : c'est un fond, pas un sujet — la lumière du curseur suffit
         à le révéler là où l'œil passe. */
      var cxs = W * .5, cys = H * .5;

      /* halo bleu de marque, discret : l'ombre domine */
      var haloR = 520 * mini * (1 + Math.sin(e * 1.25) * .06);
      var g = cx.createRadialGradient(cxs, cys, 0, cxs, cys, haloR);
      g.addColorStop(0, 'rgba(37,99,235,' + (.13 * (1 + strike * 1.4)).toFixed(3) + ')');
      g.addColorStop(.42, 'rgba(37,99,235,' + (.05 * (1 + strike)).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(11,20,40,0)');
      cx.fillStyle = g;
      cx.fillRect(0, 0, W, H);

      if (boot < 1) boot = Math.min(1, boot + .012);

      for (var i = 0; i < N; i++) {
        var p = parts[i], o = proj[i];
        var x = p.amb ? p.gx + Math.sin(e * .21 + p.r) * 120 : p.tx;
        var y = p.amb ? p.gy + Math.cos(e * .17 + p.r * 1.3) * 90 : p.ty + Math.sin(e * .5 + p.r) * 4;
        var z = p.amb ? p.gz : p.tz;

        if (boot < 1) {
          var loc = Math.max(0, Math.min(1, (boot * 1.62 - p.bd * .58) / 1.04));
          var ea = 1 - Math.pow(1 - loc, 3);
          x = p.sx0 + (x - p.sx0) * ea;
          y = p.sy0 + (y - p.sy0) * ea;
          z = p.sz0 + (z - p.sz0) * ea;
        }

        var xr = x * cosY - z * sinY, zr = x * sinY + z * cosY;
        var s = f / (f + zr + 400);
        if (s <= .02) { o.ok = false; continue; }

        var sx = cxs + (xr + p.ox) * s * mini;
        var sy = cys + (y + p.oy) * s * mini;
        o.sx = sx; o.sy = sy; o.ok = true;

        var dl = Math.hypot(sx - pxs, sy - pys);
        if (dl < 190) {
          var kk = 1 - dl / 190;
          if (kk > p.hot) p.hot = kk;
          p.ch = Math.min(1, p.ch + kk * .05);
          p.ox += ((sx - pxs) * .04 - p.ox) * .06;
          p.oy += ((sy - pys) * .04 - p.oy) * .06;
        } else {
          p.ox += (0 - p.ox) * .04;
          p.oy += (0 - p.oy) * .04;
        }
        p.hot *= .94;
        p.ch *= .995;

        var vis = (p.amb ? .055 : .115) + p.ch * .5 + p.hot * .45;
        var taille = (p.amb ? .9 : 1.25) * s * (1 + p.hot * 1.1);
        /* or à l'ignition, bleu quand la charge tient */
        var r = Math.round(96 + p.hot * 159);
        var v = Math.round(165 + p.hot * 68);
        var bl = Math.round(250 - p.hot * 66);
        cx.fillStyle = 'rgba(' + r + ',' + v + ',' + bl + ',' + Math.min(.95, vis).toFixed(3) + ')';
        cx.beginPath();
        cx.arc(sx, sy, Math.max(.4, taille), 0, 6.283);
        cx.fill();
      }

      cxA.clearRect(0, 0, W, H);
      for (var kA = arcs.length - 1; kA >= 0; kA--) {
        var a = arcs[kA];
        a.a -= .045;
        if (a.a <= 0) { arcs.splice(kA, 1); continue; }
        var passes = [
          [6, 'rgba(37,99,235,' + (a.a * .35).toFixed(3) + ')'],
          [2.4, 'rgba(96,165,250,' + (a.a * .8).toFixed(3) + ')'],
          [1, 'rgba(234,242,255,' + a.a.toFixed(3) + ')']
        ];
        for (var q = 0; q < passes.length; q++) {
          cxA.lineWidth = passes[q][0]; cxA.strokeStyle = passes[q][1];
          cxA.lineJoin = 'round'; cxA.lineCap = 'round';
          cxA.beginPath();
          cxA.moveTo(a.pts[0][0], a.pts[0][1]);
          for (var w = 1; w < a.pts.length; w++) cxA.lineTo(a.pts[w][0], a.pts[w][1]);
          cxA.stroke();
        }
      }
      strike *= .9;

      if (!reduit && e > prochaine) {
        prochaine = e + 4 + Math.random() * 3.5;
        decharge(Math.random() * W, -20);
      }
    }

    if (reduit) { dessine(16); return; }
    (function boucle(t) { dessine(t); requestAnimationFrame(boucle); })(0);
  }

  /* ─────────── 2. Barre de charge (lecture) ─────────── */
  var barre = document.getElementById('progBar');
  var corps = document.querySelector('.art-corps');
  if (barre && !reduit) {
    addEventListener('scroll', function () {
      var h = document.documentElement;
      var total = h.scrollHeight - innerHeight;
      barre.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, scrollY / total) : 0) + ')';
    }, { passive: true });
  }

  /* ─────────── 3. Sommaire : ancres posées sur les H2 existants ───────────
     On ne crée aucun titre et on n'en réécrit aucun : le sommaire lit ce que
     l'article contient déjà. */
  var nav = document.getElementById('sommaire');
  if (nav && corps) {
    var h2 = [].slice.call(corps.querySelectorAll('h2'));
    if (h2.length > 1) {
      var liens = [];
      /* Le sommaire est DÉJÀ rendu dans le HTML servi (genere-blog.mjs) pour
         que les crawlers sans JS le voient. Sans ce test, appendChild ajoutait
         une SECONDE liste : chaque article affichait sa table des matières en
         double. On réutilise donc celle qui est là et on se contente de la
         câbler ; on ne la reconstruit que si elle manque. */
      var ul = nav.querySelector('ul');
      if (ul) {
        [].slice.call(ul.querySelectorAll('a[href^="#"]')).forEach(function (a) {
          var el = document.getElementById(a.getAttribute('href').slice(1));
          if (el) liens.push({ a: a, el: el });
        });
      } else {
        ul = document.createElement('ul');
        h2.forEach(function (el, i) {
          var texte = (el.textContent || '').trim();
          if (!texte) return;
          if (!el.id) {
            el.id = 'section-' + (texte.toLowerCase()
              .normalize('NFD').replace(/[̀-ͯ]/g, '')
              .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || i);
          }
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + el.id;
          a.textContent = texte;
          li.appendChild(a); ul.appendChild(li);
          liens.push({ a: a, el: el });
        });
        nav.appendChild(ul);
      }
      nav.hidden = false;

      var obs = new IntersectionObserver(function (entrees) {
        var visible = entrees.filter(function (x) { return x.isIntersecting; })
          .sort(function (x, y) { return x.boundingClientRect.top - y.boundingClientRect.top; })[0];
        if (!visible) return;
        liens.forEach(function (l) { l.a.classList.toggle('actif', l.el === visible.target); });
      }, { rootMargin: '-96px 0px -70% 0px' });
      liens.forEach(function (l) { obs.observe(l.el); });
    }
  }

  /* ─────────── 4. Menu mobile ───────────
     Sous 1080 px la barre de bureau est masquée : sans ce panneau, il n'y a
     aucune navigation. Fermeture au clic sur le fond, à l'Échap, et piégeage
     du focus tant que le menu est ouvert. */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu-mobile');
  if (burger && menu) {
    var ouvrir = function () {
      menu.hidden = false;
      /* laisser le navigateur peindre l'état fermé avant d'animer */
      requestAnimationFrame(function () { menu.classList.add('ouvert'); });
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
      document.body.classList.add('menu-ouvert');
      var premier = menu.querySelector('a');
      if (premier) premier.focus({ preventScroll: true });
    };
    var fermer = function () {
      menu.classList.remove('ouvert');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.classList.remove('menu-ouvert');
      setTimeout(function () { if (!menu.classList.contains('ouvert')) menu.hidden = true; }, 450);
      burger.focus({ preventScroll: true });
    };

    burger.addEventListener('click', function () {
      menu.classList.contains('ouvert') ? fermer() : ouvrir();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-fermer') || e.target.closest('a')) fermer();
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('ouvert')) fermer();
      if (e.key !== 'Tab' || !menu.classList.contains('ouvert')) return;
      var focusables = menu.querySelectorAll('a[href], button');
      if (!focusables.length) return;
      var premier = focusables[0], dernier = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    });
    /* repasser en bureau referme proprement */
    matchMedia('(min-width: 1081px)').addEventListener('change', function (e) {
      if (e.matches && menu.classList.contains('ouvert')) fermer();
    });
  }

  /* ─────────── 5. Sous-menus au clavier ───────────
     Le survol suffit à la souris ; au clavier il faut un état explicite. */
  [].slice.call(document.querySelectorAll('.a-sous-menu > button.nav-parent')).forEach(function (b) {
    var parent = b.parentNode;
    b.addEventListener('click', function () {
      var ouvert = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      parent.classList.toggle('force-ouvert', !ouvert);
    });
    parent.addEventListener('focusout', function (e) {
      if (!parent.contains(e.relatedTarget)) {
        b.setAttribute('aria-expanded', 'false');
        parent.classList.remove('force-ouvert');
      }
    });
  });

  /* ─────────── 6. Chip CTA persistant ─────────── */
  var chip = document.getElementById('chip');
  if (chip) {
    var maj = function () { chip.classList.toggle('la', scrollY > innerHeight * .5); };
    maj();
    addEventListener('scroll', maj, { passive: true });
  }
})();
