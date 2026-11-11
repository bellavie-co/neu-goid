/* NEU GOID — IMPLEMENTATION PLAN
   90-day roadmap, usability testing plan with a working feedback form,
   institutional ownership, cross-section integration and future work. */
GOID.views.implementation = {
  PLAN: [
    { phase: 'Initial preparation and database structuring', days: 'Days 1–15', weeks: 'Weeks 1–2',
      tasks: ['Confirm sectors, markets and fields with faculty adviser', 'Finalize data dictionary and scoring method', 'Set up Google Sheets structure mirroring the prototype fields', 'Assign reviewer roles within the group'],
      output: 'Approved database structure and data dictionary' },
    { phase: 'Opportunity collection and verification', days: 'Days 16–40', weeks: 'Weeks 3–6',
      tasks: ['Collect opportunities from DTI, UN Trade and Development, ASEAN reports and foreign university portals', 'Record source URL, access date and reviewer for each', 'Verify details against official pages', 'Replace simulated records with verified ones'],
      output: 'Verified starter dataset across 4 sectors and 5 markets' },
    { phase: 'Prototype development', days: 'Days 41–65', weeks: 'Weeks 7–10',
      tasks: ['Refine interface from adviser feedback', 'Connect to Google Sheets or Looker Studio (proposed)', 'Score all verified records and draft decisions', 'Prepare abaca and coffee market intelligence with sources'],
      output: 'Working prototype loaded with verified data' },
    { phase: 'Testing and refinement', days: 'Days 66–80', weeks: 'Weeks 11–12',
      tasks: ['Run usability testing with at least 10 actual users in Week 12', 'Record feedback using the form below', 'Fix navigation, clarity and scoring issues found', 'Document results separately from the plan'],
      output: 'Usability test report and revised prototype' },
    { phase: 'Institutional adoption', days: 'Days 81–90', weeks: 'Week 13',
      tasks: ['Present adoption proposal to the Research and Internationalization Office', 'Agree on update schedule and verification responsibilities', 'Hand over source files, data and documentation', 'Plan integration with Section 3 and Section 4'],
      output: 'Adoption proposal and handover package' }
  ],
  CRITERIA: [
    ['nav', 'Ease of navigation'], ['search', 'Search and filtering functionality'], ['clarity', 'Information clarity'],
    ['eval', 'Evaluation system usability'], ['compare', 'Opportunity comparison'], ['decide', 'Strategic decision-making'], ['overall', 'Overall user satisfaction']
  ],

  render(el) {
    const ui = GOID.ui, store = GOID.store, fb = store.state.feedback;
    const avg = k => fb.length ? (fb.reduce((a, f) => a + Number(f[k] || 0), 0) / fb.length) : 0;
    const roles = ['Student', 'Faculty / Researcher', 'MSME owner / Student entrepreneur', 'RIO / Administrator', 'Other'];

    el.innerHTML =
      '<section class="card"><header class="card-head"><div><p class="eyebrow">Practical roadmap</p><h3>90-day implementation plan</h3></div></header>' +
      '<ol class="timeline">' + this.PLAN.map((p, i) => '<li><div class="tl-mark"><span>' + (i + 1) + '</span></div><div class="tl-body"><div class="tl-head"><strong>' + ui.esc(p.phase) + '</strong><span class="tl-when">' + p.days + ' · ' + p.weeks + '</span></div>' +
        '<ul class="plain bullets small">' + p.tasks.map(t => '<li>' + ui.esc(t) + '</li>').join('') + '</ul><p class="small"><strong>Output:</strong> ' + ui.esc(p.output) + '</p></div></li>').join('') + '</ol></section>' +

      '<div class="grid-2">' +
      '<section class="card"><header class="card-head"><div><p class="eyebrow">Proposed plan</p><h3>Usability testing plan</h3></div></header>' +
      '<dl class="kv-list"><div class="kv"><dt>When</dt><dd>Week 12 of the project timeline</dd></div><div class="kv"><dt>Participants</dt><dd>At least 10 actual users: students, faculty/researchers, MSME owners or student entrepreneurs, and RIO staff</dd></div>' +
      '<div class="kv"><dt>Tasks</dt><dd>Find an opportunity by country and sector · Open a record’s details · Add and edit a record · Change a rating and read the new score · Compare three opportunities · Set a decision with an explanation</dd></div>' +
      '<div class="kv"><dt>Measures</dt><dd>1–5 ratings on seven criteria, task completion, and written recommendations</dd></div></dl>' +
      '<div class="note-box">' + ui.icon('alert') + ' Results below come only from responses actually entered in this form. No feedback has been invented.</div>' +
      '<h4 class="sub-h">Actual results to date</h4>' +
      '<div class="progress-line"><span class="tnum"><strong>' + fb.length + '</strong> of 10 target participants</span><span class="meter meter-high"><span style="width:' + Math.min(100, fb.length * 10) + '%"></span></span></div>' +
      (fb.length ? GOID.charts.hbar(this.CRITERIA.map(c => ({ label: c[1], value: Math.round(avg(c[0]) * 10) / 10, color: 'var(--royal)' })), { fmt: v => v.toFixed(1) + ' / 5' }) +
        '<h4 class="sub-h">Recommendations received</h4><ul class="plain bullets small">' + fb.filter(f => f.recommend).map(f => '<li>' + ui.esc(f.recommend) + ' <span class="muted">— ' + ui.esc(f.role) + ', ' + ui.fmtDate(f.date) + '</span></li>').join('') + '</ul>' +
        '<div class="btn-row"><button class="btn btn-ghost btn-sm" id="fb-export">' + ui.icon('download') + ' Export responses (CSV)</button><button class="btn btn-ghost btn-sm" id="fb-clear">Clear responses</button></div>'
        : '<p class="empty">No responses recorded yet. Testing is planned for Week 12.</p>') +
      '</section>' +

      '<section class="card"><header class="card-head"><div><p class="eyebrow">Feedback mechanism</p><h3>Participant feedback form</h3></div></header>' +
      '<form id="fb-form" class="fb-form" novalidate><div class="field"><label for="fb-role">Participant role</label><select id="fb-role">' + roles.map(r => '<option>' + r + '</option>').join('') + '</select></div>' +
      this.CRITERIA.map(c => '<fieldset class="likert"><legend>' + c[1] + '</legend><div>' + [1, 2, 3, 4, 5].map(n => '<label><input type="radio" name="fb-' + c[0] + '" value="' + n + '"' + (n === 3 ? '' : '') + '><span>' + n + '</span></label>').join('') + '</div></fieldset>').join('') +
      '<p class="small muted">1 = very poor · 5 = excellent</p>' +
      '<div class="field"><label for="fb-rec">Recommendations for improvement</label><textarea id="fb-rec" rows="3"></textarea></div>' +
      '<p class="form-error" id="fb-err" hidden></p><button class="btn btn-primary" type="submit">' + ui.icon('check') + ' Record response</button></form></section>' +
      '</div>' +

      '<div class="grid-2">' +
      '<section class="card"><header class="card-head"><div><p class="eyebrow">Sustainability</p><h3>Institutional ownership</h3></div></header>' +
      '<p>The adoption proposal recommends the <strong>New Era University Research and Internationalization Office (RIO)</strong> as the proposed owner of the opportunity database and its continued development.</p>' +
      '<ul class="plain bullets small"><li>Validate and verify new records before publishing</li><li>Keep sources, deadlines and verification dates current</li><li>Review scoring thresholds each academic term</li><li>Coordinate with colleges, DTI partners and local MSMEs</li><li>Archive expired opportunities and track outcomes of pursued ones</li></ul>' +
      '<p class="small muted">This is a proposal. The prototype is not institutionally approved.</p></section>' +

      '<section class="card"><header class="card-head"><div><p class="eyebrow">Cross-section integration</p><h3>Sharing data with related systems</h3></div></header>' +
      '<div class="integ"><div><strong>Section 3 — AI Trade Navigator</strong><p class="small muted">Receives MSME and business records plus abaca and coffee market intelligence to guide export planning.</p>' +
      '<button class="btn btn-ghost btn-sm" data-pkg="s3">' + ui.icon('download') + ' Prepare data package</button></div>' +
      '<div><strong>Section 4 — Global Partner Match</strong><p class="small muted">Receives partnership, collaboration and trade fair records with country, sector and decision to match partners.</p>' +
      '<button class="btn btn-ghost btn-sm" data-pkg="s4">' + ui.icon('download') + ' Prepare data package</button></div></div>' +
      '<p class="small">Today: packages are JSON exports you can hand over manually. Future: a shared Google Sheet or API endpoint that both sections read directly.</p></section>' +
      '</div>' +

      '<section class="card"><header class="card-head"><div><p class="eyebrow">Not yet implemented</p><h3>Proposed future enhancements</h3></div></header>' +
      '<div class="future">' + [
        ['Google Sheets database sync', 'Replace browser storage with a shared Google Sheet as the live database.'],
        ['Looker Studio reporting', 'Publish executive reports connected to the Sheet.'],
        ['User accounts and roles', 'Separate viewer, reviewer and RIO administrator permissions.'],
        ['Deadline reminders', 'Email or messaging alerts for approaching deadlines.'],
        ['Source monitoring', 'Periodic checks that official source links still work.'],
        ['Additional markets', 'Expand beyond the five initial countries once data is verified.']
      ].map(f => '<div><span class="future-tag">Future</span><strong>' + f[0] + '</strong><p class="small muted">' + f[1] + '</p></div>').join('') + '</div></section>';

    el.querySelector('#fb-form').addEventListener('submit', e => {
      e.preventDefault();
      const out = { role: el.querySelector('#fb-role').value, recommend: el.querySelector('#fb-rec').value.trim() };
      const missing = this.CRITERIA.filter(c => { const v = el.querySelector('input[name="fb-' + c[0] + '"]:checked'); if (v) out[c[0]] = Number(v.value); return !v; });
      const err = el.querySelector('#fb-err');
      if (missing.length) { err.hidden = false; err.textContent = 'Please rate: ' + missing.map(c => c[1]).join(', ') + '.'; return; }
      store.addFeedback(out); ui.toast('Response recorded');
    });
    const ex = el.querySelector('#fb-export');
    if (ex) ex.addEventListener('click', () => {
      const cols = ['date', 'role'].concat(this.CRITERIA.map(c => c[0])).concat(['recommend']);
      const csv = [cols.join(',')].concat(fb.map(f => cols.map(c => '"' + String(f[c] == null ? '' : f[c]).replace(/"/g, '""') + '"').join(','))).join('\n');
      ui.exportDialog('Usability responses (CSV)', 'neu-goid-usability-responses.csv', csv, 'text/csv');
    });
    const cl = el.querySelector('#fb-clear');
    if (cl) cl.addEventListener('click', () => ui.confirm({ title: 'Clear all responses?', danger: true, confirmLabel: 'Clear responses', message: 'All recorded usability responses in this browser will be removed. Export them first if needed.' }, () => { store.clearFeedback(); ui.toast('Responses cleared'); }));
    el.querySelectorAll('[data-pkg]').forEach(b => b.addEventListener('click', () => {
      const s3 = b.dataset.pkg === 's3';
      const recs = store.active().filter(r => s3 ? (r.sector === 'community' || r.sector === 'business') : ['Industry Partnership', 'Business Collaboration', 'Research Collaboration', 'Academic Partnership', 'Trade Fair', 'Foreign Market Connection'].includes(r.category));
      const pkg = { target: s3 ? 'Section 3 — AI Trade Navigator' : 'Section 4 — Global Partner Match', generated: new Date().toISOString(),
        note: 'Contains simulated demonstration records unless replaced with verified data.',
        records: recs.map(r => { const d = GOID.scoring.derive(r); return { id: r.id, title: r.title, sector: r.sector, category: r.category, country: ui.country(r.country).name, product: r.product,
          score: d.score, priority: d.priority, decision: r.decision, verification: r.verification, simulated: r.simulated, sourceOrg: r.sourceOrg, sourceUrl: r.sourceUrl, deadline: r.deadline }; }) };
      if (s3) pkg.productIntel = store.state.productIntel;
      ui.exportDialog('Data package: ' + pkg.target, s3 ? 'goid-to-ai-trade-navigator.json' : 'goid-to-global-partner-match.json', JSON.stringify(pkg, null, 2), 'application/json', recs.length + ' records included.');
    }));
  }
};
