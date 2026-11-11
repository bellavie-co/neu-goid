/* NEU GOID — OPPORTUNITY EXPLORER (Discover)
   Search, filter, grid/map exploration and MSME product intelligence. */
GOID.views.explorer = {
  render(el) {
    const ui = GOID.ui, C = GOID.config, st = GOID.viewState.explorer, cm = GOID.common;
    const all = GOID.store.active();
    const list = cm.sortRecords(all.filter(r => cm.matches(r, st)), 'score');
    const countsFor = GOID.store.active().filter(r => cm.matches(r, Object.assign({}, st, { country: '' })));
    const counts = {}; C.countries.forEach(c => { counts[c.id] = countsFor.filter(r => r.country === c.id).length; });

    const results = list.length ? '<div class="card-grid">' + list.map(cm.card).join('') + '</div>' : '<div class="card empty-state"><h3>No opportunities match these filters</h3><p class="muted">Clear a filter or try a different keyword.</p><button class="btn btn-ghost" data-clear>Clear filters</button></div>';

    const mapMode = '<div class="map-layout"><section class="card">' + GOID.charts.map(counts, st.country) + '</section>' +
      '<section class="map-results"><header class="card-head"><h3>' + (st.country ? ui.esc(ui.country(st.country).name) + ' · ' + ui.esc(ui.country(st.country).region) : 'Select a country on the map') + '</h3>' +
      (st.country ? '<button class="link-btn" data-country="">Show all countries</button>' : '') + '</header>' +
      (list.length ? '<div class="stack">' + list.map(cm.card).join('') + '</div>' : '<p class="empty">No records for this selection.</p>') + '</section></div>';

    const prod = st.product, intel = GOID.store.state.productIntel[prod] || {};
    const prodRecs = all.filter(r => r.product === prod);
    const intelTable = '<div class="table-wrap"><table class="tbl intel-tbl"><thead><tr><th>Market</th>' + GOID.productIntelFields.map(f => '<th>' + ui.esc(f.label) + '</th>').join('') + '<th></th></tr></thead><tbody>' +
      C.countries.map(c => {
        const row = intel[c.id] || {};
        return '<tr><th scope="row">' + ui.esc(c.name) + '<small>' + prodRecs.filter(r => r.country === c.id).length + ' linked record(s)</small></th>' +
          GOID.productIntelFields.map(f => f.key === 'attractiveness'
            ? '<td><span class="dots">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= Number(row.attractiveness || 0) ? 'on' : '') + '"></i>').join('') + '</span></td>'
            : '<td>' + ui.esc(row[f.key] || '—') + '</td>').join('') +
          '<td><button class="icon-btn" data-intel-edit="' + c.id + '" aria-label="Edit ' + ui.esc(c.name) + ' assessment">' + ui.icon('edit') + '</button></td></tr>';
      }).join('') + '</tbody></table></div>';

    el.innerHTML =
      '<div class="toolbar">' +
      '<label class="search-field" for="ex-q">' + ui.icon('search') + '<input id="ex-q" type="search" placeholder="Search title, description, source…" value="' + ui.esc(st.q) + '"></label>' +
      cm.selects(st, ['country', 'sector', 'stakeholder'], 'ex') +
      '<div class="seg-toggle" role="group" aria-label="View mode"><button type="button" class="' + (st.mode === 'grid' ? 'on' : '') + '" data-mode="grid">' + ui.icon('grid') + ' Grid</button>' +
      '<button type="button" class="' + (st.mode === 'map' ? 'on' : '') + '" data-mode="map">' + ui.icon('map') + ' Map</button></div></div>' +
      '<div class="result-line"><span><strong class="tnum">' + list.length + '</strong> of ' + all.length + ' active opportunities</span>' +
      '<span class="sector-key">' + C.sectors.map(s => '<button type="button" class="sector-chip' + (st.sector === s.id ? ' on' : '') + '" data-sector="' + s.id + '"><i style="background:' + s.color + '"></i>' + ui.esc(s.short) + '</button>').join('') + '</span></div>' +
      (st.mode === 'map' ? mapMode : results) +

      '<section class="card product-intel"><header class="card-head"><div><p class="eyebrow">MSME product focus</p><h3>Market intelligence: ' + (prod === 'abaca' ? 'Philippine abaca fiber' : 'Philippine local coffee') + '</h3></div>' +
      '<div class="seg-toggle"><button type="button" class="' + (prod === 'abaca' ? 'on' : '') + '" data-product="abaca">Abaca fiber</button><button type="button" class="' + (prod === 'coffee' ? 'on' : '') + '" data-product="coffee">Coffee</button></div></header>' +
      '<div class="sim-banner slim">' + ui.icon('alert') + ' Simulated, illustrative assessments. Verify every cell against DTI, UN Trade and Development or ASEAN sources before use.</div>' +
      intelTable +
      (prodRecs.length ? '<h4 class="sub-h">Linked opportunity records</h4><div class="chip-row">' + prodRecs.map(r => '<button type="button" class="rec-chip" data-open="' + r.id + '">' + ui.esc(r.title) + ' <b class="tnum">' + GOID.scoring.score(r).toFixed(1) + '</b></button>').join('') + '</div>' : '') +
      '</section>';

    cm.wire(el, st);
    const q = el.querySelector('#ex-q');
    let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { st.q = q.value; GOID.app.render(); const n = document.getElementById('ex-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); });
    el.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { st.mode = b.dataset.mode; GOID.app.render(); }));
    el.querySelectorAll('[data-sector]').forEach(b => b.addEventListener('click', () => { st.sector = st.sector === b.dataset.sector ? '' : b.dataset.sector; GOID.app.render(); }));
    el.querySelectorAll('[data-product]').forEach(b => b.addEventListener('click', () => { st.product = b.dataset.product; GOID.app.render(); }));
    el.querySelectorAll('[data-country]').forEach(g => {
      const go = () => { st.country = st.country === g.dataset.country ? '' : g.dataset.country; st.mode = 'map'; GOID.app.render(); };
      g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    const clr = el.querySelector('[data-clear]');
    if (clr) clr.addEventListener('click', () => { Object.assign(st, { q: '', country: '', sector: '', stakeholder: '' }); GOID.app.render(); });
    el.querySelectorAll('[data-intel-edit]').forEach(b => b.addEventListener('click', () => this.editIntel(prod, b.dataset.intelEdit)));
  },

  editIntel(prod, cid) {
    const ui = GOID.ui, row = Object.assign({}, (GOID.store.state.productIntel[prod] || {})[cid] || {});
    ui.modal({ title: 'Edit ' + (prod === 'abaca' ? 'abaca' : 'coffee') + ' assessment — ' + ui.country(cid).name,
      sub: 'Mark sources in the text. Keep "Simulated" in any cell you have not verified.',
      body: '<div class="form-grid">' + GOID.productIntelFields.map(f => f.key === 'attractiveness'
        ? '<div class="field"><label for="pi-' + f.key + '">' + ui.esc(f.label) + '</label><select id="pi-' + f.key + '">' + [1, 2, 3, 4, 5].map(n => '<option' + (Number(row[f.key]) === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div>'
        : '<div class="field field-full"><label for="pi-' + f.key + '">' + ui.esc(f.label) + '</label><textarea id="pi-' + f.key + '" rows="2">' + ui.esc(row[f.key] || '') + '</textarea></div>').join('') + '</div>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Save assessment</button>',
      onMount: (el, close) => el.querySelector('[data-save]').addEventListener('click', () => {
        const out = {}; GOID.productIntelFields.forEach(f => { out[f.key] = el.querySelector('#pi-' + f.key).value; });
        out.attractiveness = Number(out.attractiveness);
        GOID.store.setProductIntel(prod, cid, out); close(); ui.toast('Assessment saved');
      }) });
  }
};
