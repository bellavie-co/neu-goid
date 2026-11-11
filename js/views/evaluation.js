/* NEU GOID — EVALUATION CENTER (Evaluate + Prioritize)
   QS-style leaderboard, the official 100-point evaluator, supporting
   dimensions mapping and editable scoring settings. */
GOID.views.evaluation = {
  render(el) {
    const ui = GOID.ui, C = GOID.config, sc = GOID.scoring, st = GOID.viewState.evaluation, store = GOID.store;
    const recs = store.active();
    const ranked = recs.map(r => ({ r, d: sc.derive(r) })).sort((a, b) => b.d.score - a.d.score);
    if (!st.selected || !store.get(st.selected)) st.selected = ranked.length ? ranked[0].r.id : null;
    const crit = sc.criteria(), th = sc.thresholds(), wt = sc.weightTotal();

    const board = '<section class="card flush"><header class="card-head pad"><div><h3>Opportunity ranking</h3><p class="muted small">Ranked by overall weighted score. Select a row to evaluate it.</p></div>' +
      '<div class="histo-box"><span class="small muted">Score distribution</span>' + GOID.charts.histogram(ranked.map(x => x.d.score)) + '</div></header>' +
      '<div class="table-wrap"><table class="tbl board"><thead><tr><th class="num">Rank</th><th>Opportunity</th>' +
      crit.map(c => '<th class="num" title="' + ui.esc(c.label) + ' — ' + c.weight + '%">' + ui.esc(c.short || c.label) + '<small>' + c.weight + '%</small></th>').join('') +
      '<th class="num">Overall</th><th>Priority</th></tr></thead><tbody>' +
      ranked.map((x, i) => '<tr class="row-link' + (x.r.id === st.selected ? ' selected' : '') + '" data-select="' + x.r.id + '"><td class="num rank-cell tnum">' + (i + 1) + '</td>' +
        '<td class="b-title"><strong>' + ui.esc(x.r.title) + '</strong><small class="block muted">' + ui.esc(ui.country(x.r.country).name) + ' · ' + ui.esc(ui.sector(x.r.sector).short) + '</small></td>' +
        x.d.breakdown.map(b => '<td class="num tnum">' + b.value.toFixed(1) + '</td>').join('') +
        '<td class="num"><strong class="tnum">' + x.d.score.toFixed(1) + '</strong>' + ui.scoreMeter(x.d.score) + '</td><td>' + ui.priorityShort(x.d.priority) + '</td></tr>').join('') +
      '</tbody></table></div></section>';

    let editor = '<section class="card"><p class="empty">Add an opportunity to start evaluating.</p></section>';
    const r = st.selected ? store.get(st.selected) : null;
    if (r) {
      const d = sc.derive(r), sug = sc.suggestFromSupporting(r.supporting);
      editor = '<section class="card evaluator"><header class="card-head"><div><p class="eyebrow mono">' + ui.esc(r.id) + '</p><h3>' + ui.esc(r.title) + '</h3>' +
        '<p class="small muted">' + ui.esc(ui.country(r.country).name) + ' · ' + ui.esc(ui.sector(r.sector).label) + ' · ' + ui.esc(r.stakeholder) + '</p></div>' +
        '<div class="total-box"><span class="small muted">Overall score</span><strong class="tnum">' + d.score.toFixed(1) + '</strong><span class="small muted">out of 100</span>' + ui.priorityBadge(d.priority) + '</div></header>' +
        (r.simulated ? '<div class="sim-banner slim">' + ui.icon('alert') + ' Simulated record. Ratings are examples. A high score never marks a record as verified.</div>' : '') +
        '<div class="crit-editor">' + crit.map(c => {
          const rating = Number(r.ratings[c.id]), val = sc.contribution(rating, c.weight);
          return '<div class="crit-block"><div class="crit-head"><div><strong>' + ui.esc(c.label) + '</strong> <span class="weight-tag">' + c.weight + '%</span>' + (c.inverse ? ' <span class="inv-tag">inverse</span>' : '') +
            '<p class="small muted">' + ui.esc(c.question) + '</p></div><div class="crit-calc tnum">(' + rating + ' ÷ 5) × ' + c.weight + ' = <strong>' + val.toFixed(1) + '</strong></div></div>' +
            '<div class="rating-seg" role="radiogroup" aria-label="' + ui.esc(c.label) + ' rating">' + [1, 2, 3, 4, 5].map(n =>
              '<button type="button" role="radio" aria-checked="' + (n === rating) + '" class="' + (n === rating ? 'on' : '') + '" data-rate="' + c.id + '" data-val="' + n + '"><b>' + n + '</b><span>' + ui.esc(c.levels[n - 1]) + '</span></button>').join('') + '</div></div>';
        }).join('') + '</div>' +
        '<div class="field"><label for="ev-notes">Evaluation explanation</label><textarea id="ev-notes" rows="2" placeholder="Why were these ratings given?">' + ui.esc(r.evalNotes) + '</textarea></div>' +
        '<div class="btn-row"><button class="btn btn-ghost" id="ev-save-notes">Save explanation</button><button class="btn btn-ghost" data-open="' + r.id + '">' + ui.icon('eye') + ' View record</button>' +
        '<span class="small muted">Deadline urgency (Time Sensitivity): ' + ui.urgencyBadge(r) + '</span></div>' +

        '<details class="support"' + (st.supportOpen ? ' open' : '') + '><summary><strong>Supporting assessment dimensions</strong><span class="small muted"> — six dimensions that inform the five criteria. They add no extra weights.</span></summary>' +
        '<div class="support-grid">' + C.supporting.map(s => s.derived
          ? '<div class="sup-item"><span>' + ui.esc(s.label) + '</span>' + ui.urgencyBadge(r) + '<small class="muted">' + ui.esc(s.note) + '</small></div>'
          : '<div class="sup-item"><label for="sup-' + s.id + '">' + ui.esc(s.label) + '</label><select id="sup-' + s.id + '" data-sup="' + s.id + '">' + [1, 2, 3, 4, 5].map(n => '<option' + (Number(r.supporting[s.id]) === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select>' +
            '<small class="muted">Informs ' + s.informs.map(id => ui.esc(crit.find(c => c.id === id).label)).join(' and ') + '</small></div>').join('') + '</div>' +
        '<div class="suggest"><p class="small"><strong>Suggested ratings from supporting dimensions</strong> (rounded averages): ' +
        'Strategic Relevance = avg(Alignment, Competitive Advantage) → <b>' + sug.relevance + '</b> · ' +
        'Potential Benefit = avg(Impact, Financial Potential, Competitive Advantage) → <b>' + sug.benefit + '</b> · ' +
        'Feasibility = avg(Feasibility, Financial Potential) → <b>' + sug.feasibility + '</b></p>' +
        '<button class="btn btn-ghost btn-sm" id="ev-apply">Apply suggested ratings</button></div></details>' +
        '</section>';
    }

    const settings = '<section class="card settings-card"><header class="card-head"><div><h3>Scoring settings</h3><p class="small muted">Official weights from the Idea Development Worksheet are the defaults. Changes recalculate every score.</p></div>' +
      '<button class="btn btn-ghost btn-sm" id="set-reset">' + ui.icon('restore') + ' Restore official defaults</button></header>' +
      '<div class="weights">' + crit.map(c => '<label class="w-field" for="w-' + c.id + '"><span>' + ui.esc(c.label) + '</span><span class="w-input"><input type="number" min="0" max="100" step="1" id="w-' + c.id + '" data-weight="' + c.id + '" value="' + c.weight + '">%</span></label>').join('') +
      '<div class="w-total ' + (wt === 100 ? 'ok' : 'bad') + '"><span>Total</span><strong class="tnum">' + wt + '%</strong>' + (wt === 100 ? '' : '<small>Weights should total 100% for a score out of 100.</small>') + '</div></div>' +
      '<div class="weights th"><label class="w-field" for="th-high"><span>High priority from</span><span class="w-input"><input type="number" min="0" max="100" id="th-high" data-th="high" value="' + th.high + '"></span></label>' +
      '<label class="w-field" for="th-medium"><span>Medium priority from</span><span class="w-input"><input type="number" min="0" max="100" id="th-medium" data-th="medium" value="' + th.medium + '"></span></label>' +
      '<div class="w-total"><span>Low priority</span><strong class="tnum">&lt; ' + th.medium + '</strong></div></div></section>';

    el.innerHTML = '<div class="eval-layout"><div class="eval-main">' + editor + settings + '</div><div class="eval-board">' + board + '</div></div>';

    el.querySelectorAll('[data-select]').forEach(tr => tr.addEventListener('click', () => { st.selected = tr.dataset.select; GOID.app.render(); }));
    if (r) {
      el.querySelectorAll('[data-rate]').forEach(b => b.addEventListener('click', () => {
        const ratings = Object.assign({}, r.ratings); ratings[b.dataset.rate] = Number(b.dataset.val);
        store.patch(r.id, { ratings }, { evaluated: true });
      }));
      el.querySelector('#ev-save-notes').addEventListener('click', () => { store.patch(r.id, { evalNotes: el.querySelector('#ev-notes').value }, { evaluated: true }); ui.toast('Explanation saved'); });
      el.querySelector('details.support').addEventListener('toggle', e => { st.supportOpen = e.target.open; });
      el.querySelectorAll('[data-sup]').forEach(s => s.addEventListener('change', () => {
        const supporting = Object.assign({}, r.supporting); supporting[s.dataset.sup] = Number(s.value);
        store.patch(r.id, { supporting });
      }));
      el.querySelector('#ev-apply').addEventListener('click', () => {
        const sug = sc.suggestFromSupporting(r.supporting);
        store.patch(r.id, { ratings: Object.assign({}, r.ratings, sug) }, { evaluated: true }); ui.toast('Suggested ratings applied');
      });
    }
    el.querySelectorAll('[data-weight]').forEach(i => i.addEventListener('change', () => {
      const w = {}; el.querySelectorAll('[data-weight]').forEach(x => { w[x.dataset.weight] = Math.max(0, Number(x.value) || 0); });
      store.setSettings({ weights: w });
    }));
    el.querySelectorAll('[data-th]').forEach(i => i.addEventListener('change', () => {
      const t = { high: Number(el.querySelector('#th-high').value), medium: Number(el.querySelector('#th-medium').value) };
      if (t.medium >= t.high) { ui.toast('Medium threshold must be lower than high threshold'); GOID.app.render(); return; }
      store.setSettings({ thresholds: t });
    }));
    el.querySelector('#set-reset').addEventListener('click', () => { store.setSettings({ weights: null, thresholds: null }); ui.toast('Official weights and thresholds restored'); });
  }
};
