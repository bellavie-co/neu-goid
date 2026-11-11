/* =====================================================================
   NEU GOID — SCORING ENGINE (official 100-point weighted method)
   Weighted contribution = (rating / 5) x criterion weight
   Overall score         = sum of the five contributions (0–100)
   ===================================================================== */
window.GOID = window.GOID || {};

GOID.scoring = (function () {
  const C = () => GOID.config;
  const S = () => (GOID.store && GOID.store.state.settings) || {};

  function criteria() {
    const w = S().weights || {};
    return C().criteria.map(c => Object.assign({}, c, { weight: w[c.id] != null ? Number(w[c.id]) : c.weight }));
  }
  function weightTotal() { return criteria().reduce((a, c) => a + c.weight, 0); }
  function thresholds() { return Object.assign({}, C().thresholds, S().thresholds || {}); }

  function clampRating(v) { v = Math.round(Number(v)); return v >= 1 && v <= 5 ? v : 3; }
  function contribution(rating, weight) { return (clampRating(rating) / 5) * weight; }

  function breakdown(rec) {
    return criteria().map(c => ({
      id: c.id, label: c.label, weight: c.weight, inverse: c.inverse,
      rating: clampRating(rec.ratings && rec.ratings[c.id]),
      value: contribution(rec.ratings && rec.ratings[c.id], c.weight)
    }));
  }
  function score(rec) {
    const s = breakdown(rec).reduce((a, b) => a + b.value, 0);
    return Math.round(s * 10) / 10;
  }
  function priority(s) {
    const t = thresholds();
    if (s >= t.high) return 'HIGH';
    if (s >= t.medium) return 'MEDIUM';
    return 'LOW';
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d)) return null;
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / 86400000);
  }
  /* Time Sensitivity → deadline urgency indicator (not part of the score). */
  function urgency(rec) {
    const u = C().urgency, days = daysUntil(rec.deadline);
    if (days === null) return { key: 'rolling', label: 'Rolling / no deadline', days: null };
    if (days < 0) return { key: 'closed', label: 'Deadline passed', days };
    if (days <= u.critical) return { key: 'critical', label: days === 0 ? 'Due today' : days + ' days left', days };
    if (days <= u.approaching) return { key: 'approaching', label: days + ' days left', days };
    return { key: 'open', label: days + ' days left', days };
  }

  /* Supporting dimensions → suggested ratings for the official criteria.
     Transparent averages; nothing is applied unless the user clicks Apply. */
  function suggestFromSupporting(sup) {
    if (!sup) return null;
    const avg = arr => Math.round(arr.reduce((a, b) => a + Number(b || 3), 0) / arr.length);
    return {
      relevance: avg([sup.alignment, sup.competitive]),
      benefit: avg([sup.impact, sup.financial, sup.competitive]),
      feasibility: avg([sup.feasibility, sup.financial])
    };
  }

  /* Rule-based decision suggestion. Advisory only: the reviewer's decision
     is stored separately, and nothing here touches verification status. */
  function suggestDecision(rec) {
    const s = score(rec), t = thresholds(), r = rec.ratings || {};
    if (Number(r.risk) <= 1) return { decision: 'REJECT', reason: 'Risk rated unacceptable (1 of 5).' };
    if (rec.verification === 'EXPIRED' || urgency(rec).key === 'closed')
      return { decision: 'MONITOR', reason: 'Deadline passed or record expired; watch for the next cycle.' };
    if (s < t.medium - 15) return { decision: 'REJECT', reason: 'Score is well below the medium threshold.' };
    if (rec.verification === 'PENDING VERIFICATION')
      return { decision: 'INVESTIGATE FURTHER', reason: 'Source is not yet verified. Verify before acting.' };
    if (s >= t.high && Number(r.feasibility) >= 3 && Number(r.risk) >= 3)
      return { decision: 'PURSUE', reason: 'High score with acceptable feasibility and risk.' };
    if (s >= t.medium && Number(r.feasibility) <= 2)
      return { decision: 'INVESTIGATE FURTHER', reason: 'Valuable but feasibility is low; check requirements.' };
    if (s >= t.medium) return { decision: 'MONITOR', reason: 'Medium priority; keep watching for changes.' };
    return { decision: 'INVESTIGATE FURTHER', reason: 'Low score; gather more information before deciding.' };
  }

  /* Convenience: everything derived for a record, used across views. */
  function derive(rec) {
    const s = score(rec);
    const country = C().countries.find(c => c.id === rec.country);
    return { score: s, priority: priority(s), urgency: urgency(rec), suggestion: suggestDecision(rec),
      region: country ? country.region : '', breakdown: breakdown(rec) };
  }

  return { criteria, weightTotal, thresholds, contribution, breakdown, score, priority, daysUntil, urgency,
    suggestFromSupporting, suggestDecision, derive };
})();
