/* =====================================================================
   NEU GOID — SHARED VIEW HELPERS
   Filter controls and filtering/sorting logic reused by several views.
   ===================================================================== */
window.GOID = window.GOID || {};

GOID.common = (function () {
  const ui = GOID.ui, C = () => GOID.config;

  const FILTERS = {
    country:      { label: 'Country',      all: 'All countries',    opts: () => C().countries.map(c => [c.id, c.name]) },
    sector:       { label: 'Sector',       all: 'All sectors',      opts: () => C().sectors.map(s => [s.id, s.short]) },
    stakeholder:  { label: 'Stakeholder',  all: 'All stakeholders', opts: () => C().stakeholders.map(s => [s, s]) },
    category:     { label: 'Category',     all: 'All categories',   opts: () => [...new Set(GOID.store.state.records.map(r => r.category).filter(Boolean))].sort().map(c => [c, c]) },
    priority:     { label: 'Priority',     all: 'All priorities',   opts: () => [['HIGH', 'High'], ['MEDIUM', 'Medium'], ['LOW', 'Low']] },
    deadline:     { label: 'Deadline',     all: 'Any deadline',     opts: () => [['30', 'Within 30 days'], ['90', 'Within 90 days'], ['future', 'Still open'], ['closed', 'Deadline passed'], ['rolling', 'Rolling / none']] },
    decision:     { label: 'Decision',     all: 'All decisions',    opts: () => C().decisions.map(d => [d.id, d.id]) },
    verification: { label: 'Verification', all: 'All statuses',     opts: () => C().verification.map(v => [v.id, v.id]) }
  };

  function selects(state, keys, prefix) {
    return keys.map(k => {
      const f = FILTERS[k], id = prefix + '-' + k;
      return '<label class="filter" for="' + id + '"><span>' + f.label + '</span><select id="' + id + '" data-filter="' + k + '">' +
        '<option value="">' + f.all + '</option>' +
        f.opts().map(o => '<option value="' + ui.esc(o[0]) + '"' + (state[k] === o[0] ? ' selected' : '') + '>' + ui.esc(o[1]) + '</option>').join('') +
        '</select></label>';
    }).join('');
  }

  function matches(r, st) {
    const d = GOID.scoring.derive(r);
    if (st.q) {
      const hay = [r.id, r.title, r.description, r.category, r.sourceOrg, r.eligibility, ui.country(r.country).name, ui.sector(r.sector).label].join(' ').toLowerCase();
      if (!hay.includes(st.q.toLowerCase())) return false;
    }
    if (st.country && r.country !== st.country) return false;
    if (st.sector && r.sector !== st.sector) return false;
    if (st.stakeholder && r.stakeholder !== st.stakeholder) return false;
    if (st.category && r.category !== st.category) return false;
    if (st.priority && d.priority !== st.priority) return false;
    if (st.decision && r.decision !== st.decision) return false;
    if (st.verification && r.verification !== st.verification) return false;
    if (st.deadline) {
      const u = d.urgency;
      if (st.deadline === 'rolling' && u.key !== 'rolling') return false;
      if (st.deadline === 'closed' && u.key !== 'closed') return false;
      if (st.deadline === 'future' && (u.days === null || u.days < 0)) return false;
      if ((st.deadline === '30' || st.deadline === '90') && (u.days === null || u.days < 0 || u.days > Number(st.deadline))) return false;
    }
    return true;
  }

  function sortRecords(list, how) {
    const s = r => GOID.scoring.score(r);
    const dl = r => r.deadline ? (GOID.scoring.daysUntil(r.deadline) < 0 ? 1e6 + Math.abs(GOID.scoring.daysUntil(r.deadline)) : GOID.scoring.daysUntil(r.deadline)) : 9e6;
    const copy = list.slice();
    if (how === 'score') copy.sort((a, b) => s(b) - s(a));
    else if (how === 'added') copy.sort((a, b) => String(b.dateAdded).localeCompare(String(a.dateAdded)));
    else if (how === 'deadline') copy.sort((a, b) => dl(a) - dl(b));
    else if (how === 'title') copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  }

  /* Wire filter selects/inputs inside a container to a viewState object. */
  function wire(el, st) {
    el.querySelectorAll('[data-filter]').forEach(s => s.addEventListener('change', () => { st[s.dataset.filter] = s.value; GOID.app.render(); }));
  }

  /* Compact opportunity card used by explorer and lists. */
  function card(r) {
    const d = GOID.scoring.derive(r);
    return '<article class="opp-card" data-open="' + r.id + '" tabindex="0">' +
      '<div class="opp-top">' + ui.sectorChip(r.sector) + '<span class="opp-country">' + ui.esc(ui.country(r.country).name) + '</span></div>' +
      '<h3>' + ui.esc(r.title) + '</h3>' +
      '<p>' + ui.esc(r.description) + '</p>' +
      '<div class="opp-meta"><span>' + ui.esc(r.stakeholder) + '</span><span>' + ui.esc(r.category) + '</span></div>' +
      '<div class="opp-foot"><span class="score-chip tnum">' + d.score.toFixed(1) + '</span>' + ui.priorityShort(d.priority) + ui.urgencyBadge(r) + ui.simBadge(r) + '</div></article>';
  }

  return { selects, matches, sortRecords, wire, card };
})();
