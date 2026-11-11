/* NEU GOID — EXECUTIVE OVERVIEW */
GOID.views.overview = {
  render(el) {
    const ui = GOID.ui, C = GOID.config, ch = GOID.charts;
    const recs = GOID.store.active();
    const der = recs.map(r => ({ r, d: GOID.scoring.derive(r) }));
    const count = fn => der.filter(fn).length;

    const kpis = [
      { label: 'Total identified opportunities', v: recs.length, note: 'Active records', nav: 'database', tone: 'navy' },
      { label: 'High priority', v: count(x => x.d.priority === 'HIGH'), note: 'Score ≥ ' + GOID.scoring.thresholds().high, nav: 'evaluation', tone: 'teal' },
      { label: 'Medium priority', v: count(x => x.d.priority === 'MEDIUM'), note: GOID.scoring.thresholds().medium + '–' + (GOID.scoring.thresholds().high - 0.1), nav: 'evaluation', tone: 'amber' },
      { label: 'Low priority', v: count(x => x.d.priority === 'LOW'), note: 'Below ' + GOID.scoring.thresholds().medium, nav: 'evaluation', tone: 'slate' }
    ].concat(C.sectors.map(s => ({ label: s.short + ' opportunities', v: count(x => x.r.sector === s.id), note: s.label, nav: 'explorer', sector: s.id, color: s.color })));

    const recent = recs.slice().sort((a, b) => String(b.dateAdded).localeCompare(String(a.dateAdded))).slice(0, 5);
    const upcoming = der.filter(x => x.d.urgency.days !== null && x.d.urgency.days >= 0 && x.r.decision !== 'REJECT')
      .sort((a, b) => a.d.urgency.days - b.d.urgency.days).slice(0, 6);
    const top = der.slice().sort((a, b) => b.d.score - a.d.score).slice(0, 5);

    const byCountry = C.countries.map(c => ({ label: c.name, value: recs.filter(r => r.country === c.id).length, color: 'var(--royal)', attrs: 'data-country-go="' + c.id + '"' }));
    const stColors = ['var(--c1)', 'var(--c3)', 'var(--c2)', 'var(--c4)'];
    const bySt = C.stakeholders.map((s, i) => ({ label: s, value: recs.filter(r => r.stakeholder === s).length, color: stColors[i % 4], attrs: 'data-st-go="' + ui.esc(s) + '"' }));
    const decTone = { teal: 'var(--teal)', blue: 'var(--royal)', amber: 'var(--amber)', rose: 'var(--rose)' };

    el.innerHTML =
      '<section class="intro"><div><p class="eyebrow">' + ui.esc(C.app.institution) + ' · ' + ui.esc(C.app.classification) + '</p>' +
      '<h2 class="display">' + ui.esc(C.app.subtitle) + '</h2>' +
      '<p class="lede">One place to discover, centralize, evaluate, compare, prioritize and decide on international opportunities for students, faculty and researchers, and local MSMEs across Japan, South Korea, Singapore, Malaysia and Thailand.</p></div>' +
      '<div class="data-note">' + ui.icon('alert') + '<div><strong>Demonstration data</strong><span>All seeded records are simulated and labeled. Replace them with verified opportunities in the Opportunity Database.</span></div></div></section>' +

      '<ol class="workflow">' + C.workflow.map((w, i) => '<li><button type="button" data-nav="' + w.view + '"><span class="wf-n">' + (i + 1) + '</span><strong>' + w.stage + '</strong><small>' + w.text + '</small></button></li>').join('') + '</ol>' +

      '<section class="kpi-grid">' + kpis.map(k => '<button type="button" class="kpi kpi-' + (k.tone || 'sector') + '" ' + (k.sector ? 'data-sector-go="' + k.sector + '"' : 'data-nav="' + k.nav + '"') + '>' +
        (k.color ? '<i class="kpi-swatch" style="background:' + k.color + '"></i>' : '') +
        '<span class="kpi-label">' + ui.esc(k.label) + '</span><span class="kpi-value tnum">' + k.v + '</span><span class="kpi-note">' + ui.esc(k.note) + '</span></button>').join('') + '</section>' +

      '<div class="grid-2">' +
      '<section class="card"><header class="card-head"><h3>Top-ranked opportunities</h3><button class="link-btn" data-nav="evaluation">Full ranking</button></header>' +
      '<ol class="rank-list">' + top.map((x, i) => '<li data-open="' + x.r.id + '"><span class="rank-n">' + (i + 1) + '</span><div><strong>' + ui.esc(x.r.title) + '</strong><small>' + ui.esc(ui.country(x.r.country).name) + ' · ' + ui.esc(ui.sector(x.r.sector).short) + '</small></div>' +
        '<span class="rank-score tnum">' + x.d.score.toFixed(1) + '</span>' + ui.priorityShort(x.d.priority) + '</li>').join('') + '</ol></section>' +

      '<section class="card"><header class="card-head"><h3>Upcoming application deadlines</h3><button class="link-btn" data-nav="analytics">Calendar</button></header>' +
      (upcoming.length ? '<ul class="dl-list">' + upcoming.map(x => '<li data-open="' + x.r.id + '"><div class="dl-date"><b>' + new Date(x.r.deadline + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric' }) + '</b><span>' + new Date(x.r.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }) + '</span></div>' +
        '<div><strong>' + ui.esc(x.r.title) + '</strong><small>' + ui.esc(ui.country(x.r.country).name) + ' · ' + ui.esc(x.r.decision) + '</small></div>' + ui.urgencyBadge(x.r) + '</li>').join('') + '</ul>' : '<p class="empty">No open deadlines.</p>') + '</section>' +
      '</div>' +

      '<div class="grid-3">' +
      '<section class="card"><header class="card-head"><h3>By country</h3></header>' + ch.hbar(byCountry) + '</section>' +
      '<section class="card"><header class="card-head"><h3>By stakeholder</h3></header>' + ch.hbar(bySt) + '</section>' +
      '<section class="card"><header class="card-head"><h3>Strategic decision summary</h3><button class="link-btn" data-nav="decisions">Decide</button></header>' +
      ch.donut(C.decisions.map(d => ({ label: d.id, value: recs.filter(r => r.decision === d.id).length, color: decTone[d.tone], attrs: 'data-dec-go="' + d.id + '"' })), { caption: 'decisions' }) + '</section>' +
      '</div>' +

      '<section class="card"><header class="card-head"><h3>Recently added opportunities</h3><button class="link-btn" data-nav="database">Open database</button></header>' +
      '<div class="table-wrap"><table class="tbl"><thead><tr><th>Opportunity</th><th>Sector</th><th>Country</th><th>Source organization</th><th>Date added</th></tr></thead><tbody>' +
      recent.map(r => '<tr data-open="' + r.id + '" class="row-link"><td><strong>' + ui.esc(r.title) + '</strong> ' + ui.simBadge(r) + '</td><td>' + ui.sectorChip(r.sector) + '</td><td>' + ui.esc(ui.country(r.country).name) + '</td><td class="muted">' + ui.esc(r.sourceOrg) + '</td><td class="tnum">' + ui.fmtDate(r.dateAdded) + '</td></tr>').join('') +
      '</tbody></table></div></section>';

    el.querySelectorAll('[data-country-go]').forEach(b => b.addEventListener('click', () => { Object.assign(GOID.viewState.explorer, { country: b.dataset.countryGo, mode: 'map' }); location.hash = 'explorer'; }));
    el.querySelectorAll('[data-sector-go]').forEach(b => b.addEventListener('click', () => { GOID.viewState.explorer.sector = b.dataset.sectorGo; location.hash = 'explorer'; }));
    el.querySelectorAll('[data-st-go]').forEach(b => b.addEventListener('click', () => { GOID.viewState.explorer.stakeholder = b.dataset.stGo; location.hash = 'explorer'; }));
    el.querySelectorAll('[data-dec-go]').forEach(b => b.addEventListener('click', () => { GOID.viewState.decisions.filter = b.dataset.decGo; location.hash = 'decisions'; }));
  }
};
