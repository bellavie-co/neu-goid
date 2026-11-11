/* NEU GOID — ANALYTICS AND INSIGHTS (Prioritize)
   Every chart is computed from the filtered database. Click a bar,
   segment or country to filter all charts. */
GOID.views.analytics = {
  render(el) {
    const ui = GOID.ui, C = GOID.config, sc = GOID.scoring, ch = GOID.charts, st = GOID.viewState.analytics, cm = GOID.common;
    const recs = GOID.store.active().filter(r => cm.matches(r, st));
    const der = recs.map(r => ({ r, d: sc.derive(r) }));
    const anyFilter = st.country || st.sector || st.stakeholder;

    const bySector = C.sectors.map(s => ({ label: s.short, value: recs.filter(r => r.sector === s.id).length, color: s.color, attrs: 'data-af="sector" data-v="' + s.id + '"' }));
    const stColors = ['var(--c1)', 'var(--c3)', 'var(--c2)'];
    const bySt = C.stakeholders.map((s, i) => ({ label: s, value: recs.filter(r => r.stakeholder === s).length, color: stColors[i % 3], attrs: 'data-af="stakeholder" data-v="' + ui.esc(s) + '"' }));
    const byCountry = C.countries.map(c => ({ label: c.name, value: recs.filter(r => r.country === c.id).length, color: 'var(--royal)', attrs: 'data-af="country" data-v="' + c.id + '"' }));
    const cats = {}; recs.forEach(r => { cats[r.category || 'Uncategorized'] = (cats[r.category || 'Uncategorized'] || 0) + 1; });
    const byCat = Object.keys(cats).sort((a, b) => cats[b] - cats[a]).map(k => ({ label: k, value: cats[k], color: 'var(--c4)' }));
    const prio = [['HIGH', 'var(--teal)'], ['MEDIUM', 'var(--amber)'], ['LOW', 'var(--slate)']].map(p => ({ label: p[0] + ' priority', value: der.filter(x => x.d.priority === p[0]).length, color: p[1] }));
    const counts = {}; C.countries.forEach(c => { counts[c.id] = GOID.store.active().filter(r => cm.matches(r, Object.assign({}, st, { country: '' })) && r.country === c.id).length; });
    const points = der.map(x => ({ x: Number(x.r.ratings.feasibility), y: Number(x.r.ratings.benefit), id: x.r.id, label: x.r.title, score: x.d.score, color: ui.sector(x.r.sector).color }));
    const sweet = der.filter(x => x.r.ratings.feasibility >= 4 && x.r.ratings.benefit >= 4).sort((a, b) => b.d.score - a.d.score);
    const top = der.slice().sort((a, b) => b.d.score - a.d.score).slice(0, 10)
      .map(x => ({ label: x.r.title, value: x.d.score, color: { HIGH: 'var(--teal)', MEDIUM: 'var(--amber)', LOW: 'var(--slate)' }[x.d.priority], attrs: 'data-open="' + x.r.id + '"' }));

    el.innerHTML =
      '<div class="toolbar">' + cm.selects(st, ['country', 'sector', 'stakeholder'], 'an') +
      (anyFilter ? '<button class="link-btn" id="an-clear">Clear filters</button>' : '') +
      '<span class="small muted grow">' + recs.length + ' active records in view. Click any bar or country to filter.</span></div>' +

      '<div class="grid-4">' +
      '<section class="card"><header class="card-head"><h3>By sector</h3></header>' + ch.hbar(bySector) + '</section>' +
      '<section class="card"><header class="card-head"><h3>By stakeholder</h3></header>' + ch.hbar(bySt) + '</section>' +
      '<section class="card"><header class="card-head"><h3>By country</h3></header>' + ch.hbar(byCountry) + '</section>' +
      '<section class="card"><header class="card-head"><h3>Priority distribution</h3></header>' + ch.donut(prio, { caption: 'records' }) + '</section>' +
      '</div>' +

      '<div class="grid-2">' +
      '<section class="card"><header class="card-head"><div><h3>Impact versus feasibility</h3><p class="small muted">Bubble size reflects overall score. Color shows sector.</p></div></header>' + ch.matrix(points) +
      '<div class="sweet"><strong>' + sweet.length + ' in the high-benefit, high-feasibility zone:</strong> ' + (sweet.length ? sweet.map(x => '<button class="rec-chip" data-open="' + x.r.id + '">' + ui.esc(x.r.title) + '</button>').join('') : '<span class="muted">none in this view</span>') + '</div></section>' +
      '<section class="card"><header class="card-head"><h3>Geographic opportunity map</h3></header>' + ch.map(counts, st.country) +
      (st.country ? '<div class="map-list"><h4>' + ui.esc(ui.country(st.country).name) + '</h4><ul>' + recs.map(r => '<li><button class="cell-link" data-open="' + r.id + '">' + ui.esc(r.title) + '</button><span class="tnum">' + sc.score(r).toFixed(1) + '</span></li>').join('') + '</ul></div>' : '') + '</section>' +
      '</div>' +

      '<div class="grid-2">' +
      '<section class="card"><header class="card-head"><h3>Top 10 opportunity ranking</h3><span class="small muted">Overall score out of 100</span></header>' + ch.hbar(top, { fmt: v => v.toFixed(1) }) + '</section>' +
      '<section class="card"><header class="card-head"><h3>Opportunities by category</h3></header>' + ch.hbar(byCat) + '</section>' +
      '</div>' +

      '<div class="grid-2">' +
      '<section class="card">' + this.calendar(recs) + '</section>' +
      '<section class="card"><header class="card-head"><h3>Opportunities added over time</h3><div class="seg-toggle">' +
      [['month', 'Monthly'], ['quarter', 'Quarterly']].map(p => '<button type="button" class="' + (st.period === p[0] ? 'on' : '') + '" data-period="' + p[0] + '">' + p[1] + '</button>').join('') + '</div></header>' +
      ch.columns(this.trend(recs, st.period)) + '</section>' +
      '</div>';

    cm.wire(el, st);
    el.querySelectorAll('[data-af]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.af; st[k] = st[k] === b.dataset.v ? '' : b.dataset.v; GOID.app.render(); }));
    el.querySelectorAll('[data-country]').forEach(g => {
      const go = () => { st.country = st.country === g.dataset.country ? '' : g.dataset.country; GOID.app.render(); };
      g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    const clr = el.querySelector('#an-clear'); if (clr) clr.addEventListener('click', () => { Object.assign(st, { country: '', sector: '', stakeholder: '' }); GOID.app.render(); });
    el.querySelectorAll('[data-period]').forEach(b => b.addEventListener('click', () => { st.period = b.dataset.period; GOID.app.render(); }));
    el.querySelectorAll('[data-cal]').forEach(b => b.addEventListener('click', () => {
      const [y, m] = st.calMonth; const d = new Date(y, m + Number(b.dataset.cal), 1); st.calMonth = [d.getFullYear(), d.getMonth()]; st.calDay = null; GOID.app.render();
    }));
    el.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', () => { st.calDay = st.calDay === b.dataset.day ? null : b.dataset.day; GOID.app.render(); }));
  },

  trend(recs, period) {
    const dates = recs.map(r => r.dateAdded).filter(Boolean).sort();
    if (!dates.length) return [];
    const start = new Date(dates[0] + 'T00:00:00'), end = new Date();
    const items = [];
    if (period === 'quarter') {
      let y = start.getFullYear(), q = Math.floor(start.getMonth() / 3);
      while (y < end.getFullYear() || (y === end.getFullYear() && q <= Math.floor(end.getMonth() / 3))) {
        const n = recs.filter(r => { const d = new Date(r.dateAdded + 'T00:00:00'); return d.getFullYear() === y && Math.floor(d.getMonth() / 3) === q; }).length;
        items.push({ label: 'Q' + (q + 1) + ' ' + String(y).slice(2), value: n });
        q++; if (q > 3) { q = 0; y++; }
      }
    } else {
      const d = new Date(start.getFullYear(), start.getMonth(), 1);
      while (d <= end) {
        const y = d.getFullYear(), m = d.getMonth();
        items.push({ label: d.toLocaleDateString('en-US', { month: 'short' }) + (m === 0 ? ' ' + String(y).slice(2) : ''), value: recs.filter(r => { const x = new Date(r.dateAdded + 'T00:00:00'); return x.getFullYear() === y && x.getMonth() === m; }).length });
        d.setMonth(m + 1);
      }
    }
    return items.slice(-12);
  },

  calendar(recs) {
    const ui = GOID.ui, st = GOID.viewState.analytics, sc = GOID.scoring;
    if (!st.calMonth) { const t = new Date(); st.calMonth = [t.getFullYear(), t.getMonth()]; }
    const [y, m] = st.calMonth, first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
    const pad = n => String(n).padStart(2, '0');
    const todayStr = new Date().toISOString().slice(0, 10);
    const byDay = {};
    recs.filter(r => r.deadline && r.deadline.startsWith(y + '-' + pad(m + 1))).forEach(r => { (byDay[r.deadline] = byDay[r.deadline] || []).push(r); });
    let cells = '';
    for (let i = 0; i < first.getDay(); i++) cells += '<span class="cal-cell blank"></span>';
    for (let dnum = 1; dnum <= days; dnum++) {
      const key = y + '-' + pad(m + 1) + '-' + pad(dnum), items = byDay[key] || [];
      const urg = items.length ? items.map(r => sc.urgency(r).key) : [];
      const worst = ['critical', 'approaching', 'open', 'closed'].find(k => urg.includes(k)) || '';
      cells += items.length
        ? '<button type="button" class="cal-cell has u-' + worst + (st.calDay === key ? ' sel' : '') + (key === todayStr ? ' today' : '') + '" data-day="' + key + '" aria-label="' + dnum + ': ' + items.length + ' deadline(s)"><span>' + dnum + '</span><i>' + items.length + '</i></button>'
        : '<span class="cal-cell' + (key === todayStr ? ' today' : '') + '"><span>' + dnum + '</span></span>';
    }
    const dayList = st.calDay && byDay[st.calDay] ? '<ul class="cal-list">' + byDay[st.calDay].map(r => '<li><button class="cell-link" data-open="' + r.id + '">' + ui.esc(r.title) + '</button>' + ui.urgencyBadge(r) + '</li>').join('') + '</ul>'
      : '';
    const monthCount = Object.values(byDay).reduce((a, b) => a + b.length, 0);
    return '<header class="card-head"><h3>Application deadline calendar</h3><div class="cal-nav"><button class="icon-btn" data-cal="-1" aria-label="Previous month">‹</button>' +
      '<strong>' + first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + '</strong><button class="icon-btn" data-cal="1" aria-label="Next month">›</button></div></header>' +
      '<div class="cal-week">' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => '<span>' + d + '</span>').join('') + '</div>' +
      '<div class="cal-grid">' + cells + '</div>' +
      '<div class="cal-legend"><span class="urg urg-critical"><i></i>≤ ' + GOID.config.urgency.critical + ' days</span><span class="urg urg-approaching"><i></i>≤ ' + GOID.config.urgency.approaching + ' days</span><span class="urg urg-open"><i></i>Open</span><span class="urg urg-closed"><i></i>Passed</span>' +
      '<span class="small muted">' + monthCount + ' deadline' + (monthCount === 1 ? '' : 's') + ' this month. Select a date to list them.</span></div>' + (st.calDay ? dayList : '');
  }
};
