/* =====================================================================
   NEU GOID — APP SHELL
   Builds the sidebar and top bar, routes between views (#overview,
   #explorer, ...), handles global search, notifications and the
   branding/appearance settings.
   ===================================================================== */
window.GOID = window.GOID || {};
GOID.views = GOID.views || {};

/* Per-view UI state (filters, selections) — kept in memory per session. */
GOID.viewState = {
  explorer: { q: '', country: '', sector: '', stakeholder: '', mode: 'grid', product: 'abaca' },
  database: { q: '', country: '', sector: '', stakeholder: '', category: '', priority: '', deadline: '', decision: '', verification: '', sort: 'score', showArchived: false },
  evaluation: { selected: null },
  compare: { ids: ['GOID-018', 'GOID-021', 'GOID-019'], stakeholder: '', sector: '' },
  decisions: { filter: '', sort: 'score' },
  analytics: { country: '', sector: '', stakeholder: '', period: 'month', calMonth: null, calDay: null },
  methodology: {},
  implementation: {}
};

GOID.app = (function () {
  const ui = GOID.ui, C = () => GOID.config;

  function brand() { return Object.assign({}, C().app, (GOID.store.state.settings.branding || {})); }

  function applyAppearance() {
    const s = GOID.store.state.settings, root = document.documentElement;
    const a = s.appearance || {};
    if (a.royal) root.style.setProperty('--royal', a.royal); else root.style.removeProperty('--royal');
    if (a.gold) root.style.setProperty('--gold', a.gold); else root.style.removeProperty('--gold');
    if (a.theme === 'light' || a.theme === 'dark') root.setAttribute('data-theme', a.theme);
    else if (a.theme === 'system') root.removeAttribute('data-theme');
  }

  function current() {
    const h = location.hash.replace('#', '');
    return C().nav.some(n => n.id === h) && GOID.views[h] ? h : 'overview';
  }

  function shell() {
    const b = brand();
    document.getElementById('app').innerHTML =
      '<aside class="sidebar" id="sidebar">' +
      '<div class="brand">' + (b.logo ? '<img class="logo-mark" src="' + ui.esc(b.logo) + '" alt="GOID project logo" width="40" height="40">' : '<div class="logo-ph" title="Editable logo placeholder">NEU</div>') +
      '<div><strong id="brand-short"></strong><span id="brand-inst"></span></div></div>' +
      '<nav class="nav" id="nav"></nav>' +
      '<div class="side-foot"><span class="proto-tag">Working prototype</span><p>For development and evaluation. Not an officially deployed or institutionally approved system.</p></div></aside>' +
      '<div class="scrim" id="scrim"></div>' +
      '<div class="main">' +
      '<div class="proto-banner" id="proto-banner"></div>' +
      '<header class="topbar">' +
      '<button class="icon-btn menu-btn" id="menu-btn" aria-label="Open navigation">' + ui.icon('menu', 20) + '</button>' +
      '<div class="page-title"><span class="crumb" id="crumb"></span><h1 id="page-title"></h1></div>' +
      '<div class="search-box"><span>' + ui.icon('search') + '</span><input id="global-search" type="search" placeholder="Search opportunities…" autocomplete="off" aria-label="Search opportunities"><div class="search-drop" id="search-drop" hidden></div></div>' +
      '<div class="top-actions"><button class="icon-btn" id="notif-btn" aria-label="Notifications">' + ui.icon('bell', 19) + '<span class="dot-count" id="notif-count"></span></button>' +
      '<div class="notif-drop" id="notif-drop" hidden></div>' +
      '<button class="icon-btn" id="settings-btn" aria-label="Prototype settings">' + ui.icon('settings', 19) + '</button>' +
      '<div class="user"><span class="avatar">' + ui.esc(b.demoUser.initials) + '</span><div><strong>' + ui.esc(b.demoUser.name) + '</strong><small>' + ui.esc(b.demoUser.role) + '</small></div></div></div>' +
      '</header>' +
      '<main class="content" id="content"></main></div>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>';

    document.getElementById('menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    document.getElementById('scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    wireSearch(); wireNotifications();
  }

  function renderChrome(id) {
    const b = brand(), nav = C().nav.find(n => n.id === id);
    document.getElementById('brand-short').textContent = b.shortName;
    document.getElementById('brand-inst').textContent = b.institution;
    document.getElementById('proto-banner').textContent = b.banner;
    document.getElementById('nav').innerHTML = C().nav.filter(n => GOID.views[n.id]).map(n =>
      '<a href="#' + n.id + '" class="' + (n.id === id ? 'active' : '') + '"' + (n.id === id ? ' aria-current="page"' : '') + '>' + ui.icon(n.icon, 18) +
      '<span>' + ui.esc(n.label) + '</span>' + (n.stage ? '<em>' + n.stage + '</em>' : '') + '</a>').join('');
    document.getElementById('page-title').textContent = nav.label;
    document.getElementById('crumb').textContent = b.shortName + (nav.stage ? ' · ' + nav.stage : '');
    document.title = 'NEU Global Opportunity Intelligence Dashboard';
    updateNotifCount();
  }

  let lastView = null, rendering = false, pending = false;
  /* Guarded so a blur/change fired while the view is being replaced
     queues one more render instead of re-entering. */
  function render() {
    if (rendering) { pending = true; return; }
    rendering = true;
    try { doRender(); } finally { rendering = false; }
    if (pending) { pending = false; setTimeout(render, 0); }
  }
  function doRender() {
    const id = current();
    renderChrome(id);
    const el = document.getElementById('content');
    const y = window.scrollY;
    try { GOID.views[id].render(el); }
    catch (e) { console.error(e); el.innerHTML = '<div class="card"><h2>This section could not load</h2><p class="muted">' + ui.esc(e.message) + '</p></div>'; }
    if (lastView !== id) window.scrollTo(0, 0); else window.scrollTo(0, y);
    lastView = id;
  }

  /* ---------- global search ---------- */
  function wireSearch() {
    const inp = document.getElementById('global-search'), drop = document.getElementById('search-drop');
    const run = () => {
      const q = inp.value.trim().toLowerCase();
      if (!q) { drop.hidden = true; return; }
      const hits = GOID.store.active(true).filter(r => [r.title, r.description, r.category, r.sourceOrg, ui.country(r.country).name, ui.sector(r.sector).label]
        .join(' ').toLowerCase().includes(q)).slice(0, 7);
      drop.innerHTML = (hits.length ? hits.map(r => '<button type="button" data-open="' + r.id + '"><span>' + ui.esc(r.title) + '</span><small>' + ui.esc(r.id) + ' · ' + ui.esc(ui.country(r.country).name) + '</small></button>').join('')
        : '<p class="empty">No matches for “' + ui.esc(inp.value) + '”.</p>') +
        '<button type="button" class="see-all" data-all>Show all results in the database ' + ui.icon('external', 13) + '</button>';
      drop.hidden = false;
    };
    inp.addEventListener('input', run);
    inp.addEventListener('focus', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { toDatabase(inp.value); drop.hidden = true; } });
    drop.addEventListener('click', e => {
      if (e.target.closest('[data-all]')) { toDatabase(inp.value); drop.hidden = true; }
      else if (e.target.closest('[data-open]')) drop.hidden = true;
    });
    document.addEventListener('click', e => { if (!e.target.closest('.search-box')) drop.hidden = true; });
  }
  function toDatabase(q) {
    GOID.viewState.database.q = q; GOID.viewState.database.showArchived = true;
    if (location.hash === '#database') render(); else location.hash = 'database';
  }

  /* ---------- notifications ---------- */
  function notifItems() {
    return GOID.store.active().filter(r => r.decision !== 'REJECT').map(r => ({ r, u: GOID.scoring.urgency(r) }))
      .filter(x => x.u.key === 'critical').sort((a, b) => a.u.days - b.u.days);
  }
  function updateNotifCount() {
    const n = notifItems().length, el = document.getElementById('notif-count');
    if (el) { el.textContent = n; el.hidden = !n; }
  }
  function wireNotifications() {
    const btn = document.getElementById('notif-btn'), drop = document.getElementById('notif-drop');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const items = notifItems();
      drop.innerHTML = '<h4>Deadlines within ' + C().urgency.critical + ' days</h4>' + (items.length ? items.map(x =>
        '<button type="button" data-open="' + x.r.id + '"><span>' + ui.esc(x.r.title) + '</span><small>' + ui.fmtDate(x.r.deadline) + ' · ' + ui.esc(x.u.label) + '</small></button>').join('')
        : '<p class="empty">No deadlines in the next ' + C().urgency.critical + ' days.</p>');
      drop.hidden = !drop.hidden;
    });
    document.addEventListener('click', e => { if (!e.target.closest('.notif-drop')) drop.hidden = true; });
  }

  /* ---------- settings (branding + appearance) ---------- */
  function openSettings() {
    const b = brand(), a = GOID.store.state.settings.appearance || {};
    const css = getComputedStyle(document.documentElement);
    const toHex = v => /^#/.test(v.trim()) ? v.trim() : '#2348a8';
    ui.modal({ title: 'Prototype settings', sub: 'Branding and appearance. Saved in this browser. Defaults live in js/config.js and css/theme.css.',
      body: '<fieldset class="form-group"><legend>Branding text</legend><div class="form-grid">' +
        '<div class="field"><label for="s-short">Short name</label><input id="s-short" value="' + ui.esc(b.shortName) + '"></div>' +
        '<div class="field"><label for="s-inst">Institution line</label><input id="s-inst" value="' + ui.esc(b.institution) + '"></div>' +
        '<div class="field field-full"><label for="s-banner">Prototype banner</label><input id="s-banner" value="' + ui.esc(b.banner) + '"></div></div></fieldset>' +
        '<fieldset class="form-group"><legend>Appearance</legend><div class="form-grid">' +
        '<div class="field"><label for="s-royal">Primary action color</label><input type="color" id="s-royal" value="' + ui.esc(a.royal || toHex(css.getPropertyValue('--royal'))) + '"></div>' +
        '<div class="field"><label for="s-gold">Accent color</label><input type="color" id="s-gold" value="' + ui.esc(a.gold || toHex(css.getPropertyValue('--gold'))) + '"></div>' +
        '<div class="field"><label for="s-theme">Theme</label><select id="s-theme">' + ['system', 'light', 'dark'].map(t => '<option value="' + t + '"' + ((a.theme || 'system') === t ? ' selected' : '') + '>' + t[0].toUpperCase() + t.slice(1) + '</option>').join('') + '</select></div>' +
        '</div></fieldset>' +
        '<p class="small muted">Storage: ' + (GOID.store.isPersistent() ? 'changes are saved in this browser and survive refreshes.' : 'this browser is blocking storage, so changes last only until the page is closed.') + '</p>',
      footer: '<button class="btn btn-ghost" data-reset>Restore default branding</button><button class="btn btn-primary" data-save>Save settings</button>',
      onMount: (el, close) => {
        el.querySelector('[data-save]').addEventListener('click', () => {
          const branding = { shortName: el.querySelector('#s-short').value, institution: el.querySelector('#s-inst').value, banner: el.querySelector('#s-banner').value };
          const appearance = { royal: el.querySelector('#s-royal').value, gold: el.querySelector('#s-gold').value, theme: el.querySelector('#s-theme').value };
          GOID.store.setSettings({ branding, appearance }); applyAppearance(); close(); ui.toast('Settings saved');
        });
        el.querySelector('[data-reset]').addEventListener('click', () => {
          GOID.store.setSettings({ branding: null, appearance: { theme: 'system' } }); applyAppearance(); close(); ui.toast('Default branding restored');
        });
      } });
  }

  /* ---------- global delegated actions ---------- */
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); document.querySelectorAll('.notif-drop,.search-drop').forEach(d => { d.hidden = true; }); ui.openDetail(o.dataset.open); return; }
    const ed = e.target.closest('[data-edit-rec]'); if (ed) { ui.openForm(ed.dataset.editRec); return; }
    const nv = e.target.closest('[data-nav]'); if (nv) { location.hash = nv.dataset.nav; }
    if (e.target.closest('.nav a')) document.body.classList.remove('nav-open');
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const o = e.target.closest && e.target.closest('[data-open]');
    if (o && !/^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { e.preventDefault(); ui.openDetail(o.dataset.open); }
  });

  function start() {
    GOID.store.load();
    applyAppearance();
    shell();
    GOID.store.subscribe(render);
    window.addEventListener('hashchange', render);
    render();
  }

  return { start, render, brand };
})();

document.addEventListener('DOMContentLoaded', GOID.app.start);
