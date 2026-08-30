/**
 * Replaces the Angular signals with plain DOM work: three tab groups (journey
 * stages, why-pillars, regions), the FAQ accordion, scroll reveals in place of
 * GSAP, the theme toggle, and an inert contact form.
 * STRINGS is injected by the build step.
 */
(function () {
  'use strict';
  var root = document.querySelector('.aws-page');
  if (!root) return;

  var ICON_PLUS = STRINGS.icons.plus;
  var ICON_MINUS = STRINGS.icons.minus;

  function setText(sel, value) {
    var el = root.querySelector(sel);
    if (el && value != null) el.textContent = value;
  }

  function markTabs(act, id) {
    root.querySelectorAll('[data-act="' + act + '"]').forEach(function (b) {
      var on = b.getAttribute('data-val') === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
  }

  /* ---------- journey stages ---------- */
  function selectStage(id) {
    var stage = STRINGS.stages[id];
    if (!stage) return;
    markTabs('selectStage', id);
    var order = STRINGS.stageOrder.indexOf(id);
    root.querySelectorAll('[data-act="selectStage"]').forEach(function (b, i) {
      b.classList.toggle('is-done', i < order);
    });
    setText('.aws-jn__counter-n', stage.n + ' / 06');
    setText('.aws-jn__counter-name', stage.name);
    setText('.aws-jn__stage-title', stage.title);
    setText('.aws-jn__stage-body', stage.body);
    setText('.aws-jn__readout-text', stage.readout);
    var viz = root.querySelector('.aws-viz');
    if (viz) {
      viz.setAttribute('data-stage', id);
      viz.setAttribute('aria-label', stage.vizAlt);
    }
    var panel = root.querySelector('#aws-stage-panel');
    if (panel) panel.setAttribute('aria-labelledby', 'aws-stage-tab-' + id);
  }

  /* ---------- why pillars ---------- */
  function selectPillar(id) {
    var pillar = STRINGS.pillars[id];
    if (!pillar) return;
    markTabs('selectPillar', id);
    var label = root.querySelectorAll('.aws-why__label span');
    if (label.length >= 3) {
      label[0].textContent = pillar.n;
      label[2].textContent = pillar.title;
    }
    var head = root.querySelectorAll('.aws-why__story-title span');
    if (head.length >= 2) {
      head[0].textContent = pillar.headline1;
      head[1].textContent = pillar.headline2;
    }
    setText('.aws-why__story-body', pillar.body);
    root.querySelectorAll('.aws-why__proof-t').forEach(function (el, i) {
      if (pillar.signals[i]) el.textContent = pillar.signals[i];
    });
    root.querySelectorAll('.aws-why__proof-d').forEach(function (el, i) {
      if (pillar.signalNotes[i]) el.textContent = pillar.signalNotes[i];
    });
    var viz = root.querySelector('.aws-why__viz');
    if (viz) {
      viz.setAttribute('data-pillar', id);
      viz.setAttribute('aria-label', pillar.vizAlt);
    }
    var account = root.querySelector('.aws-account');
    if (account) account.setAttribute('data-active', id);
    var detail = root.querySelector('.aws-account__detail');
    if (detail) {
      var dn = detail.querySelector('span');
      var dp = detail.querySelector('p');
      if (dn) dn.textContent = pillar.n;
      if (dp) dp.textContent = pillar.body;
    }
  }

  /* ---------- regions ---------- */
  function selectRegion(id) {
    var region = STRINGS.regions[id];
    if (!region) return;
    markTabs('selectRegion', id);
    var panel = root.querySelector('#region-panel');
    if (!panel) return;
    panel.setAttribute('aria-labelledby', 'region-tab-' + id);
    setText('#region-panel h3', region.title);
    setText('#region-panel p', region.body);
    panel.querySelectorAll('ol li').forEach(function (li, i) {
      var n = li.querySelector('span');
      li.textContent = '';
      if (n) li.appendChild(n);
      li.appendChild(document.createTextNode(' ' + region.points[i]));
    });
  }

  /* ---------- FAQ ---------- */
  function toggleFaq(index) {
    root.querySelectorAll('.aws-faq__item').forEach(function (item, i) {
      var btn = item.querySelector('button');
      var answer = item.querySelector('p');
      var open = i === index && btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      var svg = btn.querySelector('svg');
      if (svg) svg.outerHTML = open ? ICON_MINUS : ICON_PLUS;
      if (answer) answer.hidden = !open;
    });
  }

  /* ---------- wiring ---------- */
  function scrollToSection(sel) {
    var el = root.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var actions = {
    selectStage: selectStage,
    selectPillar: selectPillar,
    selectRegion: selectRegion,
    toggleFaq: function (v) { toggleFaq(Number(v)); },
    scrollToQuestions: function () { scrollToSection('#questions'); },
    scrollToCredentials: function () { scrollToSection('#credentials'); }
  };

  root.addEventListener('click', function (e) {
    var hit = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!hit || !root.contains(hit)) return;
    var fn = actions[hit.getAttribute('data-act')];
    if (fn) {
      e.preventDefault();
      fn(hit.getAttribute('data-val'));
    }
  });

  /* keyboard support for the two vertical rails */
  function railKeys(selector, ids, select) {
    var rail = root.querySelector(selector);
    if (!rail) return;
    rail.addEventListener('keydown', function (e) {
      var current = rail.querySelector('.is-active');
      var at = ids.indexOf(current && current.getAttribute('data-val'));
      var next = at;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (at + 1) % ids.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (at - 1 + ids.length) % ids.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = ids.length - 1;
      else return;
      e.preventDefault();
      select(ids[next]);
      var btn = rail.querySelector('[data-val="' + ids[next] + '"]');
      if (btn) btn.focus();
    });
  }

  railKeys('.aws-jn__rail', STRINGS.stageOrder, selectStage);
  railKeys('.aws-why__rail', STRINGS.pillarOrder, selectPillar);

  /* FAQ starts closed */
  root.querySelectorAll('.aws-faq__item').forEach(function (item, i) {
    var answer = item.querySelector('p');
    if (answer) answer.hidden = true;
    var btn = item.querySelector('button');
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('data-act', 'toggleFaq');
    btn.setAttribute('data-val', String(i));
    var svg = btn.querySelector('svg');
    if (svg) svg.outerHTML = ICON_PLUS;
  });

  /* ---------- scroll reveals (GSAP's job in the app) ---------- */
  var reveals = root.querySelectorAll('[data-reveal]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    reveals.forEach(function (el) { el.classList.add('sa-pending'); });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('sa-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- pointer parallax on the hero ---------- */
  var hero = root.querySelector('.aws-hero');
  if (hero && !reduced) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--anr-mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--anr-my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--anr-mx', '0');
      hero.style.setProperty('--anr-my', '0');
    });
  }

  /* ---------- theme toggle ---------- */
  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      toggle.textContent = next === 'light' ? 'Dark' : 'Light';
    });
  }

  /* ---------- the form has no backend in a standalone file ---------- */
  var form = root.querySelector('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('[data-standalone-note]');
      if (note) note.hidden = false;
    });
  }
})();
