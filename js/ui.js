/* =====================================================================
   NEU GOID — SHARED UI COMPONENTS
   Helpers, icons, badges, modal, toast, confirm dialog, the opportunity
   detail panel, the add/edit form and the import/export dialogs.
   ===================================================================== */
window.GOID = window.GOID || {};

GOID.ui = (function () {
  const C = () => GOID.config;

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
  function fmtDate(s) {
    if (!s) return '—';
    const d = new Date(s + 'T00:00:00'); if (isNaN(d)) return esc(s);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function getPath(o, path) { return path.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
  function setPath(o, path, v) {
    const ks = path.split('.'); let cur = o;
    ks.slice(0, -1).forEach(k => { cur[k] = cur[k] || {}; cur = cur[k]; });
    cur[ks[ks.length - 1]] = v;
  }
  const sector = id => C().sectors.find(s => s.id === id) || { id, label: id, short: id, color: 'var(--muted)' };
  const country = id => C().countries.find(c => c.id === id) || { id, name: id, region: '' };
  const tone = (list, id) => (C()[list].find(x => x.id === id) || {}).tone || 'slate';

  /* ---------- icons (inline SVG, stroke = currentColor) ---------- */
  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="2.5"/><path d="M4 5.5v13c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    columns: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
    restore: '<path d="M4 12a8 8 0 1 0 2.3-5.6L4 9M4 4v5h5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M4 4h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    alert: '<path d="M12 3 2 20h20zM12 10v4M12 17v.5"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    map: '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4H3v13h5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'
  };
  function icon(name, size) {
    return '<svg class="ic" width="' + (size || 16) + '" height="' + (size || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }

  /* ---------- badges ---------- */
  const pill = (text, t, extra) => '<span class="pill pill-' + t + (extra ? ' ' + extra : '') + '">' + esc(text) + '</span>';
  const priorityBadge = p => pill(p + ' PRIORITY', { HIGH: 'teal', MEDIUM: 'amber', LOW: 'slate' }[p] || 'slate');
  const priorityShort = p => pill(p, { HIGH: 'teal', MEDIUM: 'amber', LOW: 'slate' }[p] || 'slate');
  const decisionBadge = d => pill(d, tone('decisions', d));
  const verifBadge = v => pill(v, tone('verification', v));
  const simBadge = r => r.simulated ? '<span class="pill pill-sim" title="SIMULATED — NOT A VERIFIED EXTERNAL OPPORTUNITY">SIMULATED</span>' : '';
  function urgencyBadge(rec) {
    const u = GOID.scoring.urgency(rec);
    const t = { critical: 'rose', approaching: 'amber', open: 'teal', closed: 'slate', rolling: 'blue' }[u.key];
    return '<span class="urg urg-' + u.key + '"><i></i>' + esc(u.label) + '</span>';
  }
  function sectorChip(id) {
    const s = sector(id);
    return '<span class="sector-chip"><i style="background:' + s.color + '"></i>' + esc(s.short) + '</span>';
  }
  function scoreMeter(score) {
    const p = GOID.scoring.priority(score);
    return '<span class="meter meter-' + p.toLowerCase() + '"><span style="width:' + Math.max(2, score) + '%"></span></span>';
  }

  /* ---------- toast ---------- */
  function toast(msg) {
    let el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ---------- modal ---------- */
  let modalStack = [];
  function modal(o) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = '<div class="modal ' + (o.wide ? 'modal-wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(o.title) + '">' +
      '<header class="modal-head"><div><h2>' + esc(o.title) + '</h2>' + (o.sub ? '<div class="modal-sub">' + o.sub + '</div>' : '') + '</div>' +
      '<button class="icon-btn" data-close aria-label="Close">' + icon('x', 18) + '</button></header>' +
      '<div class="modal-body">' + o.body + '</div>' + (o.footer ? '<footer class="modal-foot">' + o.footer + '</footer>' : '') + '</div>';
    document.body.appendChild(wrap);
    const close = () => { wrap.remove(); modalStack = modalStack.filter(m => m !== api); };
    const api = { el: wrap, close };
    modalStack.push(api);
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    if (o.onMount) o.onMount(wrap, close);
    const f = wrap.querySelector('input,select,textarea,button:not([data-close])'); if (f) setTimeout(() => f.focus(), 30);
    return api;
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalStack.length) modalStack[modalStack.length - 1].close(); });

  function confirm(o, onYes) {
    modal({ title: o.title, body: '<p class="confirm-msg">' + o.message + '</p>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" data-yes>' + esc(o.confirmLabel || 'Confirm') + '</button>',
      onMount: (el, close) => el.querySelector('[data-yes]').addEventListener('click', () => { close(); onYes(); }) });
  }

  /* ---------- copy / download ---------- */
  function copyText(text, ta) {
    const fallback = () => { if (ta) { ta.focus(); ta.select(); } toast('Text selected. Press Ctrl+C (or Cmd+C) to copy.'); };
    try { navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard'), fallback); } catch (e) { fallback(); }
  }
  /* Works when the prototype runs from the project files; hosted previews may block downloads. */
  function download(filename, text, type) {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' }));
      a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast('Download started. If nothing happens, use Copy instead.');
    } catch (e) { toast('Download blocked here. Use Copy instead.'); }
  }
  function exportDialog(title, filename, text, type, note) {
    modal({ title, wide: true,
      body: (note ? '<p class="muted small">' + note + '</p>' : '') +
        '<textarea id="export-text" class="code-area" readonly>' + esc(text) + '</textarea>',
      footer: '<span class="muted small foot-note">Downloads work when you open the project files on your computer. In hosted previews, use Copy.</span>' +
        '<button class="btn btn-ghost" data-dl>' + icon('download') + ' Download ' + esc(filename.split('.').pop().toUpperCase()) + '</button>' +
        '<button class="btn btn-primary" data-copy>' + icon('copy') + ' Copy</button>',
      onMount: el => {
        const ta = el.querySelector('textarea');
        el.querySelector('[data-copy]').addEventListener('click', () => copyText(text, ta));
        el.querySelector('[data-dl]').addEventListener('click', () => download(filename, text, type));
      } });
  }

  function importDialog() {
    modal({ title: 'Import opportunity records', wide: true,
      body: '<p class="muted small">Choose a JSON file exported from this prototype, or paste its contents. Records with an existing ID update that record; new IDs are added.</p>' +
        '<div class="field"><label for="imp-file">JSON file</label><input type="file" id="imp-file" accept=".json,application/json"></div>' +
        '<div class="field"><label for="imp-text">Or paste JSON</label><textarea id="imp-text" class="code-area" placeholder=\'{"records":[ ... ]}\'></textarea></div>' +
        '<div class="field"><span class="label">Import mode</span><div class="seg">' +
        '<label><input type="radio" name="imp-mode" value="merge" checked> Merge with current records</label>' +
        '<label><input type="radio" name="imp-mode" value="replace"> Replace all records</label></div></div>' +
        '<p class="form-error" id="imp-err" hidden></p>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-go>' + icon('upload') + ' Import</button>',
      onMount: (el, close) => {
        const ta = el.querySelector('#imp-text');
        el.querySelector('#imp-file').addEventListener('change', e => {
          const f = e.target.files[0]; if (!f) return;
          const rd = new FileReader(); rd.onload = () => { ta.value = rd.result; }; rd.readAsText(f);
        });
        el.querySelector('[data-go]').addEventListener('click', () => {
          const err = el.querySelector('#imp-err');
          try {
            const n = GOID.store.importData(ta.value, el.querySelector('input[name=imp-mode]:checked').value);
            close(); toast(n + ' record' + (n === 1 ? '' : 's') + ' imported');
          } catch (e) { err.hidden = false; err.textContent = 'Could not import: ' + e.message + ' Check that the text is valid JSON from this prototype.'; }
        });
      } });
  }

  /* ---------- opportunity detail ---------- */
  function openDetail(id) {
    const r = GOID.store.get(id); if (!r) return;
    const d = GOID.scoring.derive(r), s = sector(r.sector), c = country(r.country);
    const row = (label, val) => '<div class="kv"><dt>' + esc(label) + '</dt><dd>' + (val || '<span class="muted">—</span>') + '</dd></div>';
    const link = (url, label) => {
      if (r.simulated) return '<button class="btn btn-sm" disabled title="Disabled for simulated records">' + esc(label) + ' (disabled)</button>';
      if (!url) return '<span class="muted">Not provided</span>';
      return '<a class="btn btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + ' ' + icon('external', 14) + '</a>';
    };
    const bars = d.breakdown.map(b => '<div class="crit-row"><span class="crit-name">' + esc(b.label) + (b.inverse ? ' <em>(5 = ' + (b.id === 'risk' ? 'low risk' : 'easier') + ')</em>' : '') + '</span>' +
      '<span class="dots">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= b.rating ? 'on' : '') + '"></i>').join('') + '</span>' +
      '<span class="crit-val tnum">' + b.value.toFixed(1) + ' / ' + b.weight + '</span></div>').join('');

    modal({ title: r.title, wide: true,
      sub: '<span class="mono">' + esc(r.id) + '</span> · ' + sectorChip(r.sector) + ' · ' + esc(c.name) + ' · ' + esc(d.region),
      body:
        (r.simulated ? '<div class="sim-banner">' + icon('alert') + ' <strong>SIMULATED DATA</strong> — NOT A VERIFIED EXTERNAL OPPORTUNITY. Application actions are disabled.</div>' : '') +
        '<div class="detail-grid">' +
        '<section><h3>Overview</h3><p>' + esc(r.description) + '</p>' +
        '<dl class="kv-list">' +
        row('Sector', esc(s.label)) + row('Category', esc(r.category)) + row('Target stakeholder', esc(r.stakeholder)) +
        row('Country and region', esc(c.name) + ' · ' + esc(d.region)) +
        (r.product ? row('MSME product focus', esc((C().products.find(p => p.id === r.product) || {}).label)) : '') +
        row('Eligibility', esc(r.eligibility)) + row('Funding or assistance', esc(r.funding)) +
        row('Potential benefits', esc(r.benefits)) + row('Required documents', esc(r.documents)) +
        row('Implementation difficulty', esc(r.difficultyNote)) +
        row('Application deadline', fmtDate(r.deadline) + ' ' + urgencyBadge(r)) +
        '</dl>' +
        '<h3>Source and verification</h3><dl class="kv-list">' +
        row('Source organization', esc(r.sourceOrg)) + row('Official source', link(r.sourceUrl, 'Open source')) +
        row('Application link', link(r.applicationUrl, 'Apply')) + row('Verification status', verifBadge(r.verification)) +
        row('Date accessed', fmtDate(r.dateAccessed)) + row('Last verified', fmtDate(r.lastVerified)) +
        row('Responsible reviewer', esc(r.reviewer)) + row('Date added', fmtDate(r.dateAdded)) + row('Last updated', fmtDate(r.lastUpdated)) +
        '</dl></section>' +
        '<aside class="detail-side"><div class="score-card"><div class="score-big tnum">' + d.score.toFixed(1) + '<small>/100</small></div>' +
        priorityBadge(d.priority) + '<div class="crit-list">' + bars + '</div>' +
        (r.evalNotes ? '<p class="small muted">' + esc(r.evalNotes) + '</p>' : '') + '</div>' +
        '<div class="rec-card"><h3>Strategic recommendation</h3><div class="rec-status">' + decisionBadge(r.decision) + '</div>' +
        '<p class="small"><strong>Why:</strong> ' + esc(r.justification || '—') + '</p>' +
        '<p class="small"><strong>Next action:</strong> ' + esc(r.nextAction || '—') + '</p>' +
        '<p class="small muted">System suggestion: ' + esc(d.suggestion.decision) + ' — ' + esc(d.suggestion.reason) + '</p>' +
        '<p class="small muted">Last evaluated ' + fmtDate(r.lastEvaluated) + '</p></div></aside></div>',
      footer: '<button class="btn btn-ghost" data-close>Close</button>' +
        '<button class="btn btn-ghost" data-eval>' + icon('sliders') + ' Evaluate</button>' +
        '<button class="btn btn-primary" data-edit>' + icon('edit') + ' Edit record</button>',
      onMount: (el, close) => {
        el.querySelector('[data-edit]').addEventListener('click', () => { close(); openForm(id); });
        el.querySelector('[data-eval]').addEventListener('click', () => { close(); GOID.viewState.evaluation.selected = id; location.hash = 'evaluation'; GOID.app.render(); });
      } });
  }

  /* ---------- add / edit form (built from config.fields) ---------- */
  function optionsFor(src) {
    const cfg = C();
    if (src === 'sectors') return cfg.sectors.map(s => [s.id, s.label]);
    if (src === 'countries') return cfg.countries.map(c => [c.id, c.name]);
    if (src === 'stakeholders') return cfg.stakeholders.map(s => [s, s]);
    if (src === 'verification') return cfg.verification.map(v => [v.id, v.id]);
    if (src === 'decisions') return cfg.decisions.map(v => [v.id, v.id]);
    if (src === 'products') return cfg.products.map(p => [p.id, p.label]);
    if (src === 'categories') return cfg.categories.map(c => [c, c]);
    return [];
  }
  function fieldHTML(f, rec) {
    const id = 'f-' + f.key.replace('.', '-'), v = getPath(rec, f.key);
    const lab = '<label for="' + id + '">' + esc(f.label) + (f.required ? ' <span class="req">*</span>' : '') + '</label>';
    const full = f.type === 'textarea' ? ' field-full' : '';
    switch (f.type) {
      case 'text': case 'url': case 'date':
        return '<div class="field' + full + '">' + lab + '<input id="' + id + '" data-key="' + f.key + '" type="' + f.type + '" value="' + esc(v) + '"' + (f.required ? ' required' : '') + (f.type === 'url' ? ' placeholder="https://"' : '') + '></div>';
      case 'textarea':
        return '<div class="field field-full">' + lab + '<textarea id="' + id + '" data-key="' + f.key + '" rows="2">' + esc(v) + '</textarea></div>';
      case 'select':
        return '<div class="field">' + lab + '<select id="' + id + '" data-key="' + f.key + '">' +
          optionsFor(f.options).map(o => '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></div>';
      case 'datalist':
        return '<div class="field">' + lab + '<input id="' + id + '" data-key="' + f.key + '" list="' + id + '-list" value="' + esc(v) + '"><datalist id="' + id + '-list">' +
          optionsFor(f.options).map(o => '<option value="' + esc(o[0]) + '">').join('') + '</datalist></div>';
      case 'checkbox':
        return '<div class="field field-check"><label><input id="' + id + '" data-key="' + f.key + '" type="checkbox"' + (v ? ' checked' : '') + '> ' + esc(f.label) + '</label></div>';
      case 'rating':
        return '<div class="field">' + lab + '<select id="' + id + '" data-key="' + f.key + '" data-num>' +
          [1, 2, 3, 4, 5].map(n => '<option' + (Number(v) === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div>';
      default: return '';
    }
  }
  function openForm(id) {
    const existing = id ? GOID.store.get(id) : null;
    const rec = existing ? JSON.parse(JSON.stringify(existing)) : {
      id: '', simulated: false, verification: 'PENDING VERIFICATION', decision: 'INVESTIGATE FURTHER', sector: 'academic',
      country: 'JP', stakeholder: 'Students', dateAdded: GOID.store.today(),
      ratings: { benefit: 3, feasibility: 3, relevance: 3, risk: 3, difficulty: 3 }
    };
    const groups = {};
    C().fields.forEach(f => { (groups[f.group] = groups[f.group] || []).push(f); });
    const body = Object.keys(groups).map(g => {
      const inner = groups[g].map(f => fieldHTML(f, rec)).join('');
      return inner ? '<fieldset class="form-group"><legend>' + esc(g) + '</legend><div class="form-grid">' + inner + '</div></fieldset>' : '';
    }).join('');
    const live = '<div class="form-live" id="form-live"></div>';
    modal({ title: existing ? 'Edit ' + existing.id : 'Add opportunity', wide: true,
      sub: existing ? esc(existing.title) : 'New records start as PENDING VERIFICATION until a reviewer confirms the source.',
      body: live + '<form id="rec-form" novalidate>' + body + '</form><p class="form-error" id="form-err" hidden></p>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>' + icon('check') + ' Save record</button>',
      onMount: (el, close) => {
        const form = el.querySelector('#rec-form');
        const collect = () => {
          const out = JSON.parse(JSON.stringify(rec));
          form.querySelectorAll('[data-key]').forEach(inp => {
            let v = inp.type === 'checkbox' ? inp.checked : inp.value;
            if (inp.hasAttribute('data-num')) v = Number(v);
            setPath(out, inp.dataset.key, v);
          });
          return out;
        };
        const refresh = () => {
          const r = collect(), d = GOID.scoring.derive(r);
          el.querySelector('#form-live').innerHTML = '<span>Live score</span><strong class="tnum">' + d.score.toFixed(1) + '</strong>' + priorityShort(d.priority) +
            '<span class="muted small">System suggestion: ' + esc(d.suggestion.decision) + '</span>';
          const simBox = form.querySelector('[data-key="simulated"]'), ver = form.querySelector('[data-key="verification"]');
          if (simBox && ver) {
            const opt = [...ver.options].find(o => o.value === 'VERIFIED');
            if (opt) opt.disabled = simBox.checked;
            if (simBox.checked && ver.value === 'VERIFIED') ver.value = 'SIMULATED DEMONSTRATION DATA';
          }
        };
        form.addEventListener('input', refresh); form.addEventListener('change', refresh); refresh();
        el.querySelector('[data-save]').addEventListener('click', () => {
          const out = collect(), err = el.querySelector('#form-err');
          const missing = C().fields.filter(f => f.required && !String(getPath(out, f.key) || '').trim()).map(f => f.label);
          if (missing.length) { err.hidden = false; err.textContent = 'Please fill in: ' + missing.join(', ') + '.'; return; }
          const ratingsChanged = !existing || JSON.stringify(existing.ratings) !== JSON.stringify(out.ratings) || existing.decision !== out.decision;
          const saved = GOID.store.upsert(out, { evaluated: ratingsChanged });
          close(); toast((existing ? 'Saved ' : 'Added ') + saved.id);
        });
      } });
  }

  function confirmDelete(id) {
    const r = GOID.store.get(id); if (!r) return;
    confirm({ title: 'Delete ' + r.id + '?', danger: true, confirmLabel: 'Delete permanently',
      message: '“' + esc(r.title) + '” will be removed from the database. To keep it out of active views without losing it, archive it instead.' },
      () => { GOID.store.remove(id); toast('Deleted ' + id); });
  }

  return { esc, fmtDate, getPath, setPath, sector, country, icon, pill, priorityBadge, priorityShort, decisionBadge, verifBadge,
    simBadge, urgencyBadge, sectorChip, scoreMeter, toast, modal, confirm, copyText, download, exportDialog, importDialog,
    openDetail, openForm, confirmDelete };
})();
