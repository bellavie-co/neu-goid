/* =====================================================================
   NEU GOID — CHART COMPONENTS (dependency-free SVG/HTML)
   Every chart takes plain data computed from the database, so charts
   update whenever records change. Clickable marks carry data-* hooks
   that the views listen for.
   ===================================================================== */
window.GOID = window.GOID || {};

GOID.charts = (function () {
  const esc = s => GOID.ui.esc(s);

  /* Horizontal bars. items: [{label, value, color, attrs, sub}] */
  function hbar(items, opts) {
    opts = opts || {};
    const max = Math.max(1, ...items.map(i => i.value));
    if (!items.length) return '<p class="empty">No records match the current filters.</p>';
    return '<div class="hbar">' + items.map(i =>
      '<button type="button" class="hbar-row" ' + (i.attrs || '') + ' title="' + esc(i.label) + ': ' + i.value + (opts.unit || '') + '">' +
      '<span class="hbar-label">' + esc(i.label) + (i.sub ? '<small>' + esc(i.sub) + '</small>' : '') + '</span>' +
      '<span class="hbar-track"><span class="hbar-fill" style="width:' + (i.value / max * 100) + '%;background:' + (i.color || 'var(--royal)') + '"></span></span>' +
      '<span class="hbar-val tnum">' + (opts.fmt ? opts.fmt(i.value) : i.value) + '</span></button>').join('') + '</div>';
  }

  /* Donut with legend. items: [{label, value, color, attrs}] */
  function donut(items, opts) {
    opts = opts || {};
    const total = items.reduce((a, i) => a + i.value, 0);
    const R = 42, C = 2 * Math.PI * R; let off = 0;
    const segs = total ? items.filter(i => i.value).map(i => {
      const len = i.value / total * C;
      const s = '<circle r="' + R + '" cx="60" cy="60" fill="none" stroke="' + i.color + '" stroke-width="16" stroke-dasharray="' + (len - 1.5) + ' ' + (C - len + 1.5) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 60 60)"><title>' + esc(i.label) + ': ' + i.value + '</title></circle>';
      off += len; return s;
    }).join('') : '<circle r="' + R + '" cx="60" cy="60" fill="none" stroke="var(--line)" stroke-width="16"/>';
    return '<div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="' + esc(opts.label || 'Distribution') + '">' + segs +
      '<text x="60" y="58" text-anchor="middle" class="donut-num">' + total + '</text><text x="60" y="73" text-anchor="middle" class="donut-cap">' + esc(opts.caption || 'records') + '</text></svg>' +
      '<ul class="legend">' + items.map(i => '<li><button type="button" ' + (i.attrs || '') + '><i style="background:' + i.color + '"></i>' + esc(i.label) +
      '<b class="tnum">' + i.value + '</b><span class="muted tnum">' + (total ? Math.round(i.value / total * 100) : 0) + '%</span></button></li>').join('') + '</ul></div>';
  }

  /* Impact-vs-feasibility matrix. points: [{x(1-5), y(1-5), id, label, color, score}] */
  function matrix(points) {
    const W = 520, H = 360, L = 52, B = 44, T = 16, Rt = 16;
    const pw = W - L - Rt, ph = H - T - B;
    const sx = v => L + (v - 0.5) / 5 * pw, sy = v => T + ph - (v - 0.5) / 5 * ph;
    const cells = {};
    points.forEach(p => { const k = p.x + '-' + p.y; (cells[k] = cells[k] || []).push(p); });
    let g = '<rect x="' + sx(3.5) + '" y="' + sy(5.5) + '" width="' + (sx(5.5) - sx(3.5)) + '" height="' + (sy(3.5) - sy(5.5)) + '" class="quad-hi"/>' +
      '<text x="' + (sx(5.5) - 6) + '" y="' + (sy(5.5) + 14) + '" text-anchor="end" class="quad-label">High benefit · high feasibility</text>';
    for (let i = 1; i <= 5; i++) {
      g += '<line x1="' + sx(i) + '" x2="' + sx(i) + '" y1="' + T + '" y2="' + (T + ph) + '" class="grid"/>' +
        '<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + sy(i) + '" y2="' + sy(i) + '" class="grid"/>' +
        '<text x="' + sx(i) + '" y="' + (T + ph + 16) + '" text-anchor="middle" class="tick">' + i + '</text>' +
        '<text x="' + (L - 10) + '" y="' + (sy(i) + 4) + '" text-anchor="end" class="tick">' + i + '</text>';
    }
    g += '<text x="' + (L + pw / 2) + '" y="' + (H - 6) + '" text-anchor="middle" class="axis-title">Feasibility rating (5 = most feasible)</text>' +
      '<text transform="translate(14 ' + (T + ph / 2) + ') rotate(-90)" text-anchor="middle" class="axis-title">Potential benefit rating</text>';
    Object.keys(cells).forEach(k => {
      const arr = cells[k], n = arr.length, cols = Math.ceil(Math.sqrt(n)), gap = 15;
      arr.forEach((p, i) => {
        const cx = sx(p.x) + ((i % cols) - (cols - 1) / 2) * gap;
        const cy = sy(p.y) + (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * gap;
        g += '<circle class="pt" data-open="' + esc(p.id) + '" cx="' + cx + '" cy="' + cy + '" r="' + (4 + p.score / 25) + '" fill="' + p.color + '"><title>' + esc(p.label) + ' — score ' + p.score.toFixed(1) + '</title></circle>';
      });
    });
    return '<div class="svg-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="chart-svg" role="img" aria-label="Impact versus feasibility matrix">' + g + '</svg></div>';
  }

  /* Column chart for trends. items: [{label, value}] */
  function columns(items) {
    const W = 560, H = 220, L = 30, B = 30, T = 14, R = 8;
    const max = Math.max(1, ...items.map(i => i.value)), step = max <= 5 ? 1 : Math.ceil(max / 5);
    const top = Math.ceil(max / step) * step;
    const pw = W - L - R, ph = H - T - B, bw = pw / Math.max(1, items.length);
    let g = '';
    for (let v = 0; v <= top; v += step) {
      const y = T + ph - v / top * ph;
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="tick">' + v + '</text>';
    }
    items.forEach((it, i) => {
      const h = it.value / top * ph, x = L + i * bw + bw * 0.2, y = T + ph - h;
      g += '<rect x="' + x + '" y="' + y + '" width="' + bw * 0.6 + '" height="' + Math.max(0, h) + '" rx="2" class="col"><title>' + esc(it.label) + ': ' + it.value + '</title></rect>' +
        (it.value ? '<text x="' + (x + bw * 0.3) + '" y="' + (y - 4) + '" text-anchor="middle" class="col-val">' + it.value + '</text>' : '') +
        '<text x="' + (x + bw * 0.3) + '" y="' + (H - 10) + '" text-anchor="middle" class="tick">' + esc(it.label) + '</text>';
    });
    return '<div class="svg-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="chart-svg" role="img" aria-label="Opportunities added over time">' + g + '</svg></div>';
  }

  /* Small histogram of score distribution. */
  function histogram(scores) {
    const bins = [[0, 50], [50, 60], [60, 70], [70, 80], [80, 90], [90, 101]];
    const counts = bins.map(b => scores.filter(s => s >= b[0] && s < b[1]).length);
    const max = Math.max(1, ...counts), t = GOID.scoring.thresholds();
    return '<div class="histo">' + bins.map((b, i) => {
      const p = GOID.scoring.priority(b[0]);
      return '<div class="histo-col" title="' + counts[i] + ' records scored ' + b[0] + '–' + Math.min(100, b[1] - 1) + '"><span class="histo-n tnum">' + counts[i] + '</span>' +
        '<span class="histo-bar histo-' + p.toLowerCase() + '" style="height:' + (counts[i] / max * 100) + '%"></span><span class="histo-l">' + (i === 0 ? '<50' : b[0] + (i === 5 ? '+' : 's')) + '</span></div>';
    }).join('') + '</div>';
  }

  /* ---------- schematic map of the five markets ---------- */
  const SHAPES = {
    JP: [[[130.9, 34], [132, 35.5], [135.5, 35.7], [136.8, 37.3], [139.5, 38.5], [140, 40.5], [141.5, 41.3], [142, 39.5], [141, 37], [140.8, 35.7], [139.8, 35], [138.8, 34.6], [137, 34.6], [135.2, 33.7], [132.5, 33.9]],
      [[140, 41.6], [140.3, 43.3], [141.6, 45.4], [143, 44.3], [145.5, 43.3], [143.5, 42], [141, 41.8]],
      [[129.8, 33.2], [130.4, 33.9], [131.9, 33.8], [131.5, 31.4], [130.6, 31.1], [130.2, 32.2]],
      [[132.5, 33], [133.5, 34.2], [134.7, 34.2], [134.3, 33.3], [133, 32.8]]],
    KR: [[[126.1, 34.6], [126.5, 36.5], [126.6, 37.7], [127.5, 38.3], [128.4, 38.6], [129.4, 36.8], [129.4, 35.4], [128.6, 34.9], [127.5, 34.6]]],
    MY: [[[100.2, 6.5], [101.1, 6.2], [102.1, 6.2], [103.4, 4.9], [103.4, 3.4], [104.2, 1.6], [103.5, 1.45], [102.6, 1.9], [101.3, 2.8], [100.4, 4.5], [100.1, 5.5]],
      [[109.6, 1.9], [111.2, 2.6], [113, 3.2], [114.2, 4.6], [115.4, 5], [116.7, 6.9], [117.7, 6.4], [119.2, 5.3], [118.1, 4.3], [116, 4.3], [115.4, 4.1], [114.5, 2.5], [113, 1.5], [111, 1], [109.9, 1.4]]],
    TH: [[[97.5, 18.5], [98.5, 20.2], [100.1, 20.4], [100.5, 19.5], [101.2, 19.6], [101.3, 17.5], [102.1, 18.2], [104, 17.5], [104.8, 16.4], [105.5, 15], [104.8, 14.4], [102.6, 14.2], [102.9, 12.2], [101.6, 12.6], [100.9, 13.4], [100, 13.4], [99.2, 10.3], [100.3, 8.4], [100.6, 6.6], [100.1, 6.6], [99.2, 7.8], [98.3, 8.2], [98.5, 10.5], [99.1, 12], [99.1, 13.8], [98.2, 15.1], [98.6, 16.2], [97.4, 18]]]
  };
  const LON0 = 94, LAT0 = 47, K = 10;
  const px = (lon, lat) => [(lon - LON0) * K, (LAT0 - lat) * K];
  /* counts: {JP: n, ...}; selected: country id */
  function map(counts, selected) {
    const max = Math.max(1, ...Object.values(counts));
    let g = '';
    // Philippines origin marker
    const ph = px(121, 14.6);
    g += '<g class="origin"><circle cx="' + ph[0] + '" cy="' + ph[1] + '" r="5"/><text x="' + (ph[0] + 9) + '" y="' + (ph[1] + 4) + '">Philippines (origin)</text></g>';
    GOID.config.countries.forEach(c => {
      const n = counts[c.id] || 0, op = 0.25 + 0.75 * (n / max), sel = selected === c.id ? ' sel' : '';
      const shapes = SHAPES[c.id];
      let body = '';
      if (shapes) body = shapes.map(poly => '<polygon points="' + poly.map(p => px(p[0], p[1]).join(',')).join(' ') + '"/>').join('');
      const ctr = px(c.lon, c.lat);
      if (c.id === 'SG') body = '<circle cx="' + ctr[0] + '" cy="' + ctr[1] + '" r="7"/>';
      // label offsets keep text clear of shapes
      const off = { JP: [22, 30], KR: [-58, -14], SG: [14, 26], MY: [10, -48], TH: [-62, -40] }[c.id] || [10, 0];
      g += '<g class="country' + sel + '" data-country="' + c.id + '" style="--op:' + op + '" tabindex="0" role="button" aria-label="' + esc(c.name) + ': ' + n + ' opportunities">' +
        '<title>' + esc(c.name) + ': ' + n + ' opportunities</title>' + body +
        '<g class="tag" transform="translate(' + (ctr[0] + off[0]) + ' ' + (ctr[1] + off[1]) + ')"><rect x="-4" y="-14" width="' + (esc(c.name).length * 6.6 + 34) + '" height="22" rx="4"/>' +
        '<text x="4" y="1">' + esc(c.name) + '</text><text class="tag-n" x="' + (esc(c.name).length * 6.6 + 14) + '" y="1">' + n + '</text></g></g>';
    });
    return '<div class="svg-wrap map-wrap"><svg viewBox="0 0 540 500" class="map-svg" role="img" aria-label="Schematic map of the five target markets">' +
      '<rect width="540" height="500" class="sea"/>' + g + '</svg><p class="map-note">Schematic map, not to scale. Shading shows the number of active records.</p></div>';
  }

  return { hbar, donut, matrix, columns, histogram, map };
})();
