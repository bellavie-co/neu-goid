/* NEU GOID — STRATEGIC DECISIONS (Decide)
   Reviewers set PURSUE / MONITOR / INVESTIGATE FURTHER / REJECT and edit
   the justification and next action. System suggestions are advisory. */
GOID.views.decisions = {
  render(el) {
    const ui = GOID.ui, C = GOID.config, sc = GOID.scoring, st = GOID.viewState.decisions, store = GOID.store, cm = GOID.common;
    const recs = store.active();
    const list = cm.sortRecords(recs.filter(r => !st.filter || r.decision === st.filter), st.sort);

    el.innerHTML =
      '<section class="dec-summary">' + C.decisions.map(d => {
        const n = recs.filter(r => r.decision === d.id).length;
        return '<button type="button" class="dec-card dec-' + d.tone + (st.filter === d.id ? ' on' : '') + '" data-dfilter="' + d.id + '"><span class="dec-n tnum">' + n + '</span><strong>' + d.id + '</strong><small>' + ui.esc(d.text) + '</small></button>';
      }).join('') + '</section>' +
      '<div class="toolbar"><span class="result-line"><strong class="tnum">' + list.length + '</strong>&nbsp;records · ' + (st.filter ? ui.esc(st.filter) : 'all decisions') + '</span>' +
      (st.filter ? '<button class="link-btn" id="d-all">Show all decisions</button>' : '') +
      '<label class="filter" for="d-sort"><span>Sort by</span><select id="d-sort">' + [['score', 'Overall score'], ['deadline', 'Upcoming deadlines'], ['added', 'Date added']].map(o => '<option value="' + o[0] + '"' + (st.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<span class="small muted grow">Decisions are made by reviewers. Changing a decision never changes a record’s verification status.</span></div>' +
      '<div class="dec-list">' + (list.length ? list.map(r => {
        const d = sc.derive(r), agree = d.suggestion.decision === r.decision;
        return '<article class="card dec-item" data-id="' + r.id + '"><div class="dec-info">' +
          '<div class="dec-title"><button class="cell-link" data-open="' + r.id + '">' + ui.esc(r.title) + '</button>' + ui.simBadge(r) + '</div>' +
          '<p class="small muted">' + ui.esc(r.id) + ' · ' + ui.esc(ui.country(r.country).name) + ' · ' + ui.esc(ui.sector(r.sector).short) + ' · ' + ui.esc(r.stakeholder) + '</p>' +
          '<div class="dec-facts"><span class="score-chip tnum">' + d.score.toFixed(1) + '</span>' + ui.priorityShort(d.priority) + ui.verifBadge(r.verification) + ui.urgencyBadge(r) + '</div>' +
          '<p class="small"><strong>Supporting assessment:</strong> ' + d.breakdown.map(b => ui.esc(b.label) + ' ' + b.rating + '/5').join(' · ') + '</p>' +
          '<p class="small suggestion ' + (agree ? 'agree' : 'differ') + '">' + ui.icon(agree ? 'check' : 'alert', 14) + ' System suggestion: <b>' + d.suggestion.decision + '</b> — ' + ui.esc(d.suggestion.reason) + (agree ? '' : ' Reviewer decision differs.') + '</p></div>' +
          '<div class="dec-edit"><div class="dec-btns" role="group" aria-label="Decision status">' + C.decisions.map(x =>
            '<button type="button" class="dbtn dbtn-' + x.tone + (r.decision === x.id ? ' on' : '') + '" data-set="' + x.id + '" aria-pressed="' + (r.decision === x.id) + '">' + x.id + '</button>').join('') + '</div>' +
          '<label class="small" for="j-' + r.id + '">Explanation</label><textarea id="j-' + r.id + '" data-j rows="2">' + ui.esc(r.justification) + '</textarea>' +
          '<label class="small" for="n-' + r.id + '">Suggested next action</label><textarea id="n-' + r.id + '" data-n rows="2">' + ui.esc(r.nextAction) + '</textarea>' +
          '<div class="dec-foot"><span class="small muted">Last decision update: ' + ui.fmtDate(r.lastEvaluated) + '</span><button class="btn btn-sm btn-primary" data-save>Save notes</button></div></div></article>';
      }).join('') : '<p class="empty card">No records with this decision.</p>') + '</div>';

    el.querySelectorAll('[data-dfilter]').forEach(b => b.addEventListener('click', () => { st.filter = st.filter === b.dataset.dfilter ? '' : b.dataset.dfilter; GOID.app.render(); }));
    const all = el.querySelector('#d-all'); if (all) all.addEventListener('click', () => { st.filter = ''; GOID.app.render(); });
    el.querySelector('#d-sort').addEventListener('change', e => { st.sort = e.target.value; GOID.app.render(); });
    el.querySelectorAll('.dec-item').forEach(card => {
      const id = card.dataset.id;
      const notes = () => ({ justification: card.querySelector('[data-j]').value, nextAction: card.querySelector('[data-n]').value });
      card.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => {
        store.patch(id, Object.assign(notes(), { decision: b.dataset.set }), { evaluated: true }); ui.toast(id + ' set to ' + b.dataset.set);
      }));
      card.querySelector('[data-save]').addEventListener('click', () => { store.patch(id, notes(), { evaluated: true }); ui.toast('Notes saved for ' + id); });
    });
  }
};
