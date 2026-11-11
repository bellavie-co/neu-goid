/* NEU GOID — COMPARE OPPORTUNITIES
   Select 2–4 records, view side by side, auto-ranked, strongest highlighted. */
GOID.views.compare = {
  MAX: 4,
  render(el) {
    const ui = GOID.ui, C = GOID.config, sc = GOID.scoring, st = GOID.viewState.compare, store = GOID.store, cm = GOID.common;
    st.ids = st.ids.filter(id => store.get(id) && !store.get(id).archived);
    const pool = cm.sortRecords(store.active().filter(r => cm.matches(r, { stakeholder: st.stakeholder, sector: st.sector })), 'score');
    const sel = st.ids.map(id => ({ r: store.get(id), d: sc.derive(store.get(id)) })).sort((a, b) => b.d.score - a.d.score);
    const best = sel.length > 1 ? sel[0].r.id : null;
    const crit = sc.criteria();

    const rows = [
      ['Rank', x => '<span class="rank-pill">#' + (sel.indexOf(x) + 1) + '</span>'],
      ['Country', x => ui.esc(ui.country(x.r.country).name)],
      ['Sector', x => ui.sectorChip(x.r.sector)],
      ['Stakeholder group', x => ui.esc(x.r.stakeholder)]
    ].concat(crit.map(c => [c.label + ' (' + c.weight + '%)', x => {
      const b = x.d.breakdown.find(b => b.id === c.id);
      const top = Math.max(...sel.map(y => y.d.breakdown.find(b => b.id === c.id).value));
      return '<span class="cmp-crit' + (sel.length > 1 && b.value === top ? ' lead' : '') + '"><span class="dots">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= b.rating ? 'on' : '') + '"></i>').join('') + '</span><b class="tnum">' + b.value.toFixed(1) + '</b></span>';
    }])).concat([
      ['Overall score', x => '<strong class="cmp-score tnum">' + x.d.score.toFixed(1) + '</strong>'],
      ['Priority', x => ui.priorityBadge(x.d.priority)],
      ['Funding', x => '<span class="small">' + ui.esc(x.r.funding) + '</span>'],
      ['Application deadline', x => ui.fmtDate(x.r.deadline) + '<br>' + ui.urgencyBadge(x.r)],
      ['Strategic recommendation', x => ui.decisionBadge(x.r.decision) + '<p class="small muted">' + ui.esc(x.r.justification) + '</p>'],
      ['Verification', x => ui.verifBadge(x.r.verification)]
    ]);

    const table = sel.length < 2
      ? '<div class="card empty-state"><h3>Select at least two opportunities</h3><p class="muted">Tick records in the list, or start from one of the example comparisons above.</p></div>'
      : '<section class="card flush"><div class="table-wrap"><table class="tbl cmp-tbl"><thead><tr><th></th>' +
        sel.map(x => '<th class="' + (x.r.id === best ? 'best' : '') + '">' + (x.r.id === best ? '<span class="best-tag">' + ui.icon('star', 13) + ' Strongest option</span>' : '') +
          '<button class="cell-link" data-open="' + x.r.id + '">' + ui.esc(x.r.title) + '</button>' + ui.simBadge(x.r) +
          '<button class="link-btn small" data-remove="' + x.r.id + '">Remove</button></th>').join('') + '</tr></thead><tbody>' +
        rows.map(row => '<tr><th scope="row">' + ui.esc(row[0]) + '</th>' + sel.map(x => '<td class="' + (x.r.id === best ? 'best' : '') + '">' + row[1](x) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div></section>' +
        '<section class="card"><header class="card-head"><h3>Score composition</h3><span class="small muted">Contribution of each criterion to the overall score</span></header>' +
        '<div class="stack-bars">' + sel.map(x => '<div class="sb-row"><span class="sb-label">' + ui.esc(x.r.title) + '</span><span class="sb-track">' +
          x.d.breakdown.map((b, i) => '<span class="sb-seg sb-' + i + '" style="width:' + b.value + '%" title="' + ui.esc(b.label) + ': ' + b.value.toFixed(1) + '"></span>').join('') +
          '</span><b class="tnum">' + x.d.score.toFixed(1) + '</b></div>').join('') + '</div>' +
        '<ul class="sb-legend">' + crit.map((c, i) => '<li><i class="sb-' + i + '"></i>' + ui.esc(c.label) + '</li>').join('') + '</ul></section>';

    el.innerHTML =
      '<section class="card"><header class="card-head"><div><h3>Example comparisons</h3><p class="small muted">Load a ready-made set, or build your own from the list below.</p></div></header>' +
      '<div class="chip-row">' + C.comparePresets.map((p, i) => '<button type="button" class="preset" data-preset="' + i + '">' + ui.esc(p.label) + '</button>').join('') + '</div></section>' +
      '<div class="cmp-layout"><aside class="card cmp-pick"><header class="card-head"><h3>Choose opportunities</h3><span class="small muted tnum">' + st.ids.length + ' / ' + this.MAX + '</span></header>' +
      '<div class="filters-col">' + cm.selects(st, ['stakeholder', 'sector'], 'cmp') + '</div>' +
      '<ul class="pick-list">' + pool.map(r => {
        const on = st.ids.includes(r.id), dis = !on && st.ids.length >= this.MAX;
        return '<li><label class="' + (dis ? 'dis' : '') + '"><input type="checkbox" data-pick="' + r.id + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '><span>' + ui.esc(r.title) + '<small>' + ui.esc(ui.country(r.country).name) + ' · ' + sc.score(r).toFixed(1) + '</small></span></label></li>';
      }).join('') + '</ul>' + (st.ids.length ? '<button class="link-btn" id="cmp-clear">Clear selection</button>' : '') + '</aside>' +
      '<div class="cmp-main">' + table + '</div></div>';

    cm.wire(el, st);
    el.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => { st.ids = C.comparePresets[b.dataset.preset].ids.filter(id => store.get(id)).slice(0, this.MAX); st.stakeholder = ''; st.sector = ''; GOID.app.render(); }));
    el.querySelectorAll('[data-pick]').forEach(c => c.addEventListener('change', () => {
      if (c.checked) st.ids.push(c.dataset.pick); else st.ids = st.ids.filter(id => id !== c.dataset.pick);
      GOID.app.render();
    }));
    el.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => { st.ids = st.ids.filter(id => id !== b.dataset.remove); GOID.app.render(); }));
    const clr = el.querySelector('#cmp-clear'); if (clr) clr.addEventListener('click', () => { st.ids = []; GOID.app.render(); });
  }
};
