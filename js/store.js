/* =====================================================================
   NEU GOID — DATA STORE
   Persists records, product intelligence, usability feedback and
   settings in the browser (localStorage). Falls back to memory if the
   browser blocks storage. Swap load()/save() for a Google Sheets or
   institutional API connection in a future version.
   ===================================================================== */
window.GOID = window.GOID || {};

GOID.store = (function () {
  const listeners = [];
  const clone = o => JSON.parse(JSON.stringify(o));
  const today = () => new Date().toISOString().slice(0, 10);
  let persistent = true;

  const state = { records: [], productIntel: {}, feedback: [], settings: {} };

  function normalize(r) {
    const n = Object.assign({
      id: '', title: 'Untitled opportunity', category: '', sector: 'academic', stakeholder: 'Students', country: 'JP',
      product: '', description: '', eligibility: '', sourceOrg: '', sourceUrl: '', applicationUrl: '', deadline: '',
      funding: '', benefits: '', documents: '', difficultyNote: '', simulated: false, verification: 'PENDING VERIFICATION',
      dateAccessed: '', lastVerified: '', reviewer: '', evalNotes: '', decision: 'INVESTIGATE FURTHER',
      justification: '', nextAction: '', dateAdded: today(), lastUpdated: today(), lastEvaluated: today(), archived: false
    }, r);
    n.ratings = Object.assign({ benefit: 3, feasibility: 3, relevance: 3, risk: 3, difficulty: 3 }, r.ratings || {});
    const rt = n.ratings;
    n.supporting = Object.assign({
      alignment: rt.relevance, impact: rt.benefit, feasibility: rt.feasibility,
      financial: Math.round((rt.benefit + rt.feasibility) / 2), competitive: rt.relevance
    }, r.supporting || {});
    // Simulated records can never carry the VERIFIED label.
    if (n.simulated && n.verification === 'VERIFIED') n.verification = 'SIMULATED DEMONSTRATION DATA';
    return n;
  }

  function fresh() {
    state.records = GOID.seedRecords.map(r => normalize(clone(r)));
    state.productIntel = clone(GOID.seedProductIntel);
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(GOID.config.storageKey); } catch (e) { persistent = false; }
    if (raw) {
      try {
        const d = JSON.parse(raw);
        state.records = (d.records || []).map(normalize);
        state.productIntel = d.productIntel || clone(GOID.seedProductIntel);
        state.feedback = d.feedback || [];
        state.settings = d.settings || {};
        return;
      } catch (e) { /* corrupted: fall through to fresh */ }
    }
    fresh();
  }

  function save() {
    try { localStorage.setItem(GOID.config.storageKey, JSON.stringify(state)); persistent = true; }
    catch (e) { persistent = false; }
  }
  function emit() { save(); listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { listeners.push(fn); }

  function get(id) { return state.records.find(r => r.id === id); }
  function nextId() {
    const nums = state.records.map(r => parseInt(String(r.id).replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const n = (nums.length ? Math.max.apply(null, nums) : 0) + 1;
    return 'GOID-' + String(n).padStart(3, '0');
  }

  function upsert(rec, opts) {
    opts = opts || {};
    const r = normalize(rec);
    if (!r.id) r.id = nextId();
    r.lastUpdated = today();
    if (opts.evaluated) r.lastEvaluated = today();
    const i = state.records.findIndex(x => x.id === r.id);
    if (i >= 0) state.records[i] = r; else state.records.unshift(r);
    emit();
    return r;
  }
  function patch(id, changes, opts) {
    const r = get(id); if (!r) return;
    return upsert(Object.assign(clone(r), changes), opts);
  }
  function remove(id) { state.records = state.records.filter(r => r.id !== id); emit(); }
  function setArchived(id, flag) { patch(id, { archived: !!flag }); }

  function active(includeArchived) { return state.records.filter(r => includeArchived || !r.archived); }

  function resetDemo() { fresh(); emit(); }

  function exportData() {
    return JSON.stringify({ app: 'NEU GOID working prototype', exported: new Date().toISOString(),
      records: state.records, productIntel: state.productIntel }, null, 2);
  }
  function importData(text, mode) {
    const d = JSON.parse(text);
    const list = Array.isArray(d) ? d : d.records;
    if (!Array.isArray(list)) throw new Error('No "records" list found in the file.');
    const incoming = list.map(normalize);
    if (mode === 'replace') { state.records = incoming; state.records.forEach(r => { if (!r.id) r.id = nextId(); }); }
    else incoming.forEach(r => {
      if (!r.id) r.id = nextId();          // same ID = update, new ID = add
      const i = state.records.findIndex(x => x.id === r.id);
      if (i >= 0) state.records[i] = r; else state.records.push(r);
    });
    if (d.productIntel && mode === 'replace') state.productIntel = d.productIntel;
    emit();
    return incoming.length;
  }

  function toCSV(records) {
    const cols = ['id', 'title', 'category', 'sector', 'stakeholder', 'country', 'product', 'deadline', 'funding', 'sourceOrg',
      'sourceUrl', 'verification', 'simulated', 'benefit', 'feasibility', 'relevance', 'risk', 'difficulty', 'score', 'priority',
      'decision', 'justification', 'nextAction', 'dateAdded', 'lastUpdated', 'archived'];
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = (records || state.records).map(r => {
      const d = GOID.scoring.derive(r);
      const flat = Object.assign({}, r, r.ratings, { score: d.score, priority: d.priority });
      return cols.map(c => q(flat[c])).join(',');
    });
    return [cols.join(',')].concat(rows).join('\n');
  }

  function setSettings(part) { state.settings = Object.assign({}, state.settings, part); emit(); }
  function setProductIntel(product, country, data) {
    state.productIntel[product] = state.productIntel[product] || {};
    state.productIntel[product][country] = data; emit();
  }
  function addFeedback(f) { state.feedback.push(Object.assign({ date: today() }, f)); emit(); }
  function clearFeedback() { state.feedback = []; emit(); }

  return { state, load, save, emit, subscribe, get, nextId, upsert, patch, remove, setArchived, active,
    resetDemo, exportData, importData, toCSV, setSettings, setProductIntel, addFeedback, clearFeedback,
    isPersistent: () => persistent, today };
})();
