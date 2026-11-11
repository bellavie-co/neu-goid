/* NEU GOID — OPPORTUNITY DATABASE (Centralize)
   Full record management: add, edit, archive, delete, view, search,
   filter, sort, import, export and restore the demonstration dataset. */
GOID.views.database = {
  render(el) {
    const ui = GOID.ui, st = GOID.viewState.database, cm = GOID.common, store = GOID.store;
    const pool = store.active(st.showArchived);
    const list = cm.sortRecords(pool.filter(r => cm.matches(r, st)), st.sort);
    const activeFilters = ['country', 'sector', 'stakeholder', 'category', 'priority', 'deadline', 'decision', 'verification'].filter(k => st[k]).length + (st.q ? 1 : 0);
    const simCount = store.state.records.filter(r => r.simulated).length;

    el.innerHTML =
      '<div class="db-head"><div><p class="eyebrow">Centralized repository · proposed owner: NEU Research and Internationalization Office</p>' +
      '<p class="muted small">' + store.state.records.length + ' records in total · ' + simCount + ' simulated · ' + store.state.records.filter(r => r.verification === 'VERIFIED').length + ' verified · ' + store.state.records.filter(r => r.archived).length + ' archived</p></div>' +
      '<div class="btn-row"><button class="btn btn-primary" id="db-add">' + ui.icon('plus') + ' Add opportunity</button>' +
      '<button class="btn btn-ghost" id="db-import">' + ui.icon('upload') + ' Import</button>' +
      '<button class="btn btn-ghost" id="db-json">' + ui.icon('download') + ' Export JSON</button>' +
      '<button class="btn btn-ghost" id="db-csv">' + ui.icon('download') + ' Export CSV</button>' +
      '<button class="btn btn-ghost" id="db-reset">' + ui.icon('restore') + ' Restore demo data</button></div></div>' +

      '<div class="toolbar toolbar-wrap">' +
      '<label class="search-field" for="db-q">' + ui.icon('search') + '<input id="db-q" type="search" placeholder="Search by title or keyword" value="' + ui.esc(st.q) + '"></label>' +
      cm.selects(st, ['country', 'sector', 'stakeholder', 'category', 'priority', 'deadline', 'decision', 'verification'], 'db') +
      '<label class="filter" for="db-sort"><span>Sort by</span><select id="db-sort">' +
      [['score', 'Overall score (high to low)'], ['added', 'Date added (newest)'], ['deadline', 'Upcoming deadlines'], ['title', 'Title (A–Z)']].map(o => '<option value="' + o[0] + '"' + (st.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<label class="check-inline"><input type="checkbox" id="db-arch"' + (st.showArchived ? ' checked' : '') + '> Show archived</label>' +
      (activeFilters ? '<button class="link-btn" id="db-clear">Clear ' + activeFilters + ' filter' + (activeFilters > 1 ? 's' : '') + '</button>' : '') + '</div>' +

      '<div class="result-line"><span><strong class="tnum">' + list.length + '</strong> record' + (list.length === 1 ? '' : 's') + ' shown</span></div>' +
      '<div class="card flush"><div class="table-wrap"><table class="tbl db-tbl"><thead><tr><th>ID</th><th>Opportunity</th><th>Sector</th><th>Country</th><th>Stakeholder</th><th>Deadline</th><th class="num">Score</th><th>Priority</th><th>Decision</th><th>Verification</th><th class="actions-h">Actions</th></tr></thead><tbody>' +
      (list.length ? list.map(r => {
        const d = GOID.scoring.derive(r);
        return '<tr class="' + (r.archived ? 'is-archived' : '') + '"><td class="mono small">' + ui.esc(r.id) + '</td>' +
          '<td class="t-title"><button class="cell-link" data-open="' + r.id + '">' + ui.esc(r.title) + '</button><small>' + ui.esc(r.category) + (r.archived ? ' · Archived' : '') + '</small></td>' +
          '<td>' + ui.sectorChip(r.sector) + '</td><td>' + ui.esc(ui.country(r.country).name) + '</td><td class="small">' + ui.esc(r.stakeholder) + '</td>' +
          '<td class="nowrap small">' + ui.fmtDate(r.deadline) + '<br>' + ui.urgencyBadge(r) + '</td>' +
          '<td class="num"><strong class="tnum">' + d.score.toFixed(1) + '</strong>' + ui.scoreMeter(d.score) + '</td>' +
          '<td>' + ui.priorityShort(d.priority) + '</td><td>' + ui.decisionBadge(r.decision) + '</td><td>' + ui.verifBadge(r.verification) + '</td>' +
          '<td class="actions"><button class="icon-btn" data-open="' + r.id + '" title="View details" aria-label="View ' + ui.esc(r.id) + '">' + ui.icon('eye') + '</button>' +
          '<button class="icon-btn" data-edit-rec="' + r.id + '" title="Edit" aria-label="Edit ' + ui.esc(r.id) + '">' + ui.icon('edit') + '</button>' +
          '<button class="icon-btn" data-arch="' + r.id + '" title="' + (r.archived ? 'Restore from archive' : 'Archive') + '" aria-label="' + (r.archived ? 'Restore ' : 'Archive ') + ui.esc(r.id) + '">' + ui.icon(r.archived ? 'restore' : 'archive') + '</button>' +
          '<button class="icon-btn danger" data-del="' + r.id + '" title="Delete" aria-label="Delete ' + ui.esc(r.id) + '">' + ui.icon('trash') + '</button></td></tr>';
      }).join('') : '<tr><td colspan="11"><p class="empty">No records match. Clear filters or add a new opportunity.</p></td></tr>') +
      '</tbody></table></div></div>' +
      '<p class="small muted">Records are stored in this browser (' + (store.isPersistent() ? 'saved across refreshes' : 'storage blocked — changes last for this session only') + '). Export regularly to share changes with your group.</p>';

    cm.wire(el, st);
    const q = el.querySelector('#db-q');
    let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { st.q = q.value; GOID.app.render(); const n = document.getElementById('db-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); });
    el.querySelector('#db-sort').addEventListener('change', e => { st.sort = e.target.value; GOID.app.render(); });
    el.querySelector('#db-arch').addEventListener('change', e => { st.showArchived = e.target.checked; GOID.app.render(); });
    const clr = el.querySelector('#db-clear');
    if (clr) clr.addEventListener('click', () => { Object.assign(st, { q: '', country: '', sector: '', stakeholder: '', category: '', priority: '', deadline: '', decision: '', verification: '' }); GOID.app.render(); });
    el.querySelector('#db-add').addEventListener('click', () => ui.openForm(null));
    el.querySelector('#db-import').addEventListener('click', ui.importDialog);
    el.querySelector('#db-json').addEventListener('click', () => ui.exportDialog('Export records (JSON)', 'neu-goid-records.json', store.exportData(), 'application/json',
      'Full backup of all records and product intelligence. Import it on another computer to continue editing.'));
    el.querySelector('#db-csv').addEventListener('click', () => ui.exportDialog('Export records (CSV)', 'neu-goid-records.csv', store.toCSV(list), 'text/csv',
      'The ' + list.length + ' records currently shown, ready for Google Sheets, Excel or Looker Studio.'));
    el.querySelector('#db-reset').addEventListener('click', () => ui.confirm({ title: 'Restore demonstration dataset?', danger: true, confirmLabel: 'Restore demo data',
      message: 'This replaces all current records and product assessments with the original simulated dataset. Export first if you want to keep your changes.' },
      () => { store.resetDemo(); ui.toast('Demonstration dataset restored'); }));
    el.querySelectorAll('[data-arch]').forEach(b => b.addEventListener('click', () => {
      const r = store.get(b.dataset.arch); store.setArchived(r.id, !r.archived); ui.toast((r.archived ? 'Restored ' : 'Archived ') + r.id);
    }));
    el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => ui.confirmDelete(b.dataset.del)));
  }
};
