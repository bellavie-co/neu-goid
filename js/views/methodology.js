/* NEU GOID — DATA SOURCES AND METHODOLOGY
   Source framework, verification labels, the documented 100-point
   method, recommendation process, data dictionary and AI-use disclosure. */
GOID.views.methodology = {
  render(el) {
    const ui = GOID.ui, C = GOID.config, sc = GOID.scoring, recs = GOID.store.state.records;
    const crit = sc.criteria(), th = sc.thresholds();
    const ex = GOID.store.active().slice().sort((a, b) => sc.score(b) - sc.score(a))[0];
    const exB = ex ? sc.breakdown(ex) : [];

    const sections = [
      ['scope', 'Scope'], ['sources', 'Data sources'], ['verification', 'Verification'], ['method', '100-point method'],
      ['decide', 'Recommendation process'], ['dictionary', 'Data dictionary'], ['ai', 'AI-use disclosure']
    ];

    el.innerHTML = '<div class="doc-layout"><nav class="doc-toc" aria-label="On this page">' + sections.map(s => '<a href="#methodology" data-jump="' + s[0] + '">' + s[1] + '</a>').join('') + '</nav><div class="doc">' +

      '<section class="card" id="m-scope"><h2>Scope</h2><p>The dashboard covers <strong>external</strong> opportunity intelligence only. It does not monitor internal university performance such as enrollment, revenue or rankings.</p>' +
      '<div class="grid-2 tight"><div><h4>Four official sectors</h4><ul class="plain">' + C.sectors.map(s => '<li>' + ui.sectorChip(s.id) + ' <strong>' + ui.esc(s.label) + '</strong><br><span class="small muted">' + s.covers.map(ui.esc).join(' · ') + '</span></li>').join('') + '</ul></div>' +
      '<div><h4>Five initial markets</h4><ul class="plain">' + C.countries.map(c => '<li><strong>' + ui.esc(c.name) + '</strong> <span class="muted small">' + ui.esc(c.region) + '</span></li>').join('') + '</ul>' +
      '<p class="small muted">Possible future expansion (not in the current database): ' + C.futureMarkets.map(ui.esc).join(', ') + '.</p>' +
      '<h4>Stakeholders</h4><p class="small">' + C.stakeholders.map(ui.esc).join(' · ') + '. The NEU Research and Internationalization Office (RIO) is proposed as the administrator that validates and maintains the database.</p></div></div></section>' +

      '<section class="card" id="m-sources"><h2>Data sources</h2><p>Initial reference framework from the Idea Development Worksheet. Each record must name a traceable source.</p>' +
      '<div class="source-grid">' + [
        ['UN Trade and Development', 'Trade statistics and market data for export intelligence (abaca, coffee).'],
        ['ASEAN economic reports', 'Regional trade, investment and cooperation programs.'],
        ['Department of Trade and Industry (DTI)', 'Export assistance, trade fairs and MSME programs.'],
        ['Official foreign university portals', 'Exchange programs, scholarships and research partnerships.']
      ].map(s => '<div class="source"><strong>' + s[0] + '</strong><p class="small muted">' + s[1] + '</p></div>').join('') + '</div>' +
      '<p class="small">Other official government agencies, international organizations, research funding bodies and trade organizations may be added when relevant. Every record tracks source organization, source URL, date accessed, last verification date, verification status, responsible reviewer and last-updated date.</p></section>' +

      '<section class="card" id="m-verification"><h2>Verification labels</h2><div class="table-wrap"><table class="tbl"><thead><tr><th>Label</th><th>Meaning</th><th class="num">Records</th></tr></thead><tbody>' +
      [['VERIFIED', 'A reviewer confirmed the details against the official source.'],
       ['PENDING VERIFICATION', 'Collected but not yet confirmed. Default for new records.'],
       ['EXPIRED', 'Deadline passed or the opportunity has closed.'],
       ['ARCHIVED', 'Kept for reference; no longer active.'],
       ['SIMULATED DEMONSTRATION DATA', 'Placeholder created for the prototype. Not a real opportunity; application links are disabled.']]
        .map(v => '<tr><td>' + ui.verifBadge(v[0]) + '</td><td>' + v[1] + '</td><td class="num tnum">' + recs.filter(r => r.verification === v[0]).length + '</td></tr>').join('') +
      '</tbody></table></div><p class="small muted">Rules built into the prototype: a simulated record cannot be labeled VERIFIED, and no score or decision ever changes a verification label automatically.</p></section>' +

      '<section class="card" id="m-method"><h2>Official 100-point weighted evaluation</h2>' +
      '<div class="formula"><span>Weighted score = (Rating ÷ 5) × Criterion weight</span><span>Overall score = sum of the five weighted scores</span></div>' +
      '<div class="table-wrap"><table class="tbl"><thead><tr><th>Criterion</th><th class="num">Weight</th><th>Rating 1</th><th>Rating 3</th><th>Rating 5</th></tr></thead><tbody>' +
      crit.map(c => '<tr><td><strong>' + ui.esc(c.label) + '</strong>' + (c.inverse ? ' <span class="inv-tag">inverse</span>' : '') + '<br><span class="small muted">' + ui.esc(c.question) + '</span></td><td class="num tnum">' + c.weight + '%</td><td class="small">' + ui.esc(c.levels[0]) + '</td><td class="small">' + ui.esc(c.levels[2]) + '</td><td class="small">' + ui.esc(c.levels[4]) + '</td></tr>').join('') +
      '<tr class="total-row"><td>Total</td><td class="num tnum">' + sc.weightTotal() + '%</td><td colspan="3"></td></tr></tbody></table></div>' +
      '<p class="small">For <strong>Risk</strong> and <strong>Estimated Difficulty</strong> the scale is inverse: 5 means low or manageable risk and easier implementation; 1 means very high risk and very difficult implementation. A higher rating always raises the score.</p>' +
      (ex ? '<h4>Worked example: ' + ui.esc(ex.title) + '</h4><div class="table-wrap"><table class="tbl"><thead><tr><th>Criterion</th><th class="num">Rating</th><th class="num">Calculation</th><th class="num">Weighted score</th></tr></thead><tbody>' +
        exB.map(b => '<tr><td>' + ui.esc(b.label) + '</td><td class="num tnum">' + b.rating + '</td><td class="num tnum">(' + b.rating + ' ÷ 5) × ' + b.weight + '</td><td class="num tnum">' + b.value.toFixed(1) + '</td></tr>').join('') +
        '<tr class="total-row"><td colspan="3">Overall score</td><td class="num tnum">' + sc.score(ex).toFixed(1) + '</td></tr></tbody></table></div>' : '') +
      '<h4>Priority classification (proposed prototype defaults, configurable)</h4><div class="prio-row">' +
      '<div>' + ui.priorityBadge('HIGH') + '<span class="tnum">' + th.high + '–100</span><small>Act or prepare now</small></div>' +
      '<div>' + ui.priorityBadge('MEDIUM') + '<span class="tnum">' + th.medium + '–' + (th.high - 1) + '.9</span><small>Worth tracking; address gaps</small></div>' +
      '<div>' + ui.priorityBadge('LOW') + '<span class="tnum">below ' + th.medium + '</span><small>Lower value or major barriers</small></div></div>' +
      '<h4>Supporting assessment dimensions</h4><p class="small">The six dimensions from the original system specification inform the five official criteria without adding weights or a second formula.</p>' +
      '<div class="table-wrap"><table class="tbl"><thead><tr><th>Supporting dimension</th><th>Informs</th></tr></thead><tbody>' +
      C.supporting.map(s => '<tr><td>' + ui.esc(s.label) + '</td><td>' + (s.derived ? ui.esc(s.note) : s.informs.map(id => ui.esc(crit.find(c => c.id === id).label)).join(', ')) + '</td></tr>').join('') +
      '</tbody></table></div><p class="small muted">In the Evaluation Center, reviewers can rate these dimensions and choose to apply the suggested criterion ratings (rounded averages). Nothing is applied automatically.</p></section>' +

      '<section class="card" id="m-decide"><h2>Strategic recommendation process</h2><ol class="steps">' +
      '<li><strong>Score</strong> the record on the five criteria. The overall score and priority update instantly.</li>' +
      '<li><strong>Review the system suggestion.</strong> Rule-based and advisory: unacceptable risk (1) → REJECT; deadline passed → MONITOR; well below medium threshold → REJECT; pending verification → INVESTIGATE FURTHER; high score with feasibility and risk ≥ 3 → PURSUE; medium score with low feasibility → INVESTIGATE FURTHER; otherwise medium → MONITOR.</li>' +
      '<li><strong>Decide.</strong> A reviewer sets PURSUE, MONITOR, INVESTIGATE FURTHER or REJECT, with an explanation and next action. Decisions may differ from the score when context matters (eligibility, timing, partner readiness).</li>' +
      '<li><strong>Revisit</strong> whenever new information arrives. Every change records the date of last evaluation.</li></ol>' +
      '<div class="dec-legend">' + C.decisions.map(d => '<div>' + ui.decisionBadge(d.id) + '<p class="small">' + ui.esc(d.text) + '</p></div>').join('') + '</div></section>' +

      '<section class="card" id="m-dictionary"><h2>Data dictionary</h2><p class="small muted">Generated from the field list in js/config.js. Add a field there and it appears here and in the record form.</p>' +
      '<div class="table-wrap"><table class="tbl dict"><thead><tr><th>Field name</th><th>Description</th><th>Data type</th><th>Purpose</th><th>Example value</th></tr></thead><tbody>' +
      (function () {
        let g = '', out = '';
        C.fields.forEach(f => {
          if (f.group !== g) { g = f.group; out += '<tr class="group-row"><td colspan="5">' + ui.esc(g) + '</td></tr>'; }
          out += '<tr><td class="mono small">' + ui.esc(f.key) + '</td><td>' + ui.esc(f.label) + '</td><td class="small">' + ui.esc(f.dtype) + '</td><td class="small">' + ui.esc(f.purpose) + '</td><td class="small muted">' + ui.esc(f.example) + '</td></tr>';
        });
        out += '<tr class="group-row"><td colspan="5">Calculated indicators</td></tr><tr><td class="mono small">urgency</td><td>Deadline urgency indicator</td><td class="small">Category (calculated)</td><td class="small">Shows Time Sensitivity: ≤' + C.urgency.critical + ' days, ≤' + C.urgency.approaching + ' days, open, passed, rolling</td><td class="small muted">12 days left</td></tr>' +
          '<tr><td class="mono small">supporting.*</td><td>Supporting assessment dimensions</td><td class="small">Integer 1–5 each</td><td class="small">Inform criterion ratings; no weights</td><td class="small muted">alignment: 4</td></tr>';
        return out;
      })() + '</tbody></table></div></section>' +

      '<section class="card" id="m-ai"><h2>AI-use disclosure</h2>' +
      '<p>AI tools were used to help generate this prototype’s source code, interface text, example evaluation criteria descriptions and the simulated demonstration records. No AI-generated content in this prototype is presented as a verified external opportunity.</p>' +
      '<ul class="plain bullets"><li>All demonstration records, funding amounts, deadlines and market assessments are simulated placeholders.</li>' +
      '<li>Any AI-generated market intelligence must be checked by a human reviewer against authoritative sources (DTI, UN Trade and Development, ASEAN reports, official university portals) before entering the actual database.</li>' +
      '<li>Verification status is set only by a reviewer. Scores and decisions never change it.</li>' +
      '<li>The prototype will be revised based on student surveys, faculty interviews, institutional benchmarking, stakeholder feedback and usability testing.</li></ul></section>' +
      '</div></div>';

    el.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); const t = document.getElementById('m-' + a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }
};
