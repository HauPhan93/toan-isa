/* Toán ISA — handwritten digit input (finger or Apple Pencil), fully offline.
 *
 * Recogniser: $P point-cloud recogniser (Vatavu, Anthony & Wobbrock 2012) — stroke order and direction
 * do not matter, multi-stroke digits (4, 5, 7 with a bar) work. Templates are generated here from
 * hand-made digit shapes with slant/aspect variants, plus the child's own corrected samples, which are
 * kept on the device so recognition adapts to the child's writing.
 *
 * window.Hand = {
 *   recognize(strokes) → [{ d, score }] best first        (strokes: [[{x,y}, …], …])
 *   learn(strokes, d)                                       keep a sample of the child's digit d
 *   pad({ onDigit(d), onFix(d), onBack(), comma: bool, onComma() }) → HTMLElement with .clear()
 * }
 */
(function () {
  'use strict';
  const N = 32;                       // points per cloud
  const STORE = 'toanisa.hand.v1';    // the child's own samples
  const PER_DIGIT = 6;                // newest samples kept per digit

  /* ---------------------------------------------------------------- $P core */
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function pathLen(pts) { let d = 0; for (let i = 1; i < pts.length; i++) if (pts[i].s === pts[i - 1].s) d += dist(pts[i - 1], pts[i]); return d; }
  function resample(pts, n) {
    const I = pathLen(pts) / (n - 1);
    if (!(I > 0)) return Array.from({ length: n }, () => ({ x: pts[0].x, y: pts[0].y, s: 0 }));
    let D = 0; const out = [{ x: pts[0].x, y: pts[0].y, s: pts[0].s }];
    const p = pts.map(q => ({ x: q.x, y: q.y, s: q.s }));
    for (let i = 1; i < p.length; i++) {
      if (p[i].s !== p[i - 1].s) continue;
      const d = dist(p[i - 1], p[i]);
      if (D + d >= I) {
        const t = (I - D) / d;
        const q = { x: p[i - 1].x + t * (p[i].x - p[i - 1].x), y: p[i - 1].y + t * (p[i].y - p[i - 1].y), s: p[i].s };
        out.push(q); p.splice(i, 0, q); D = 0;
      } else D += d;
    }
    while (out.length < n) out.push({ ...p[p.length - 1] });
    return out.slice(0, n);
  }
  function normalize(strokes) {
    const pts = [];
    strokes.forEach((st, s) => st.forEach(q => pts.push({ x: q.x, y: q.y, s })));
    let r = resample(pts, N);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const q of r) { minX = Math.min(minX, q.x); minY = Math.min(minY, q.y); maxX = Math.max(maxX, q.x); maxY = Math.max(maxY, q.y); }
    const size = Math.max(maxX - minX, maxY - minY) || 1;
    r = r.map(q => ({ x: (q.x - minX) / size, y: (q.y - minY) / size }));
    const cx = r.reduce((a, q) => a + q.x, 0) / N, cy = r.reduce((a, q) => a + q.y, 0) / N;
    const cloud = r.map(q => ({ x: q.x - cx, y: q.y - cy }));
    cloud.aspect = (maxX - minX) / ((maxY - minY) || 1);   // kept for a tie-break on very thin shapes (1)
    return cloud;
  }
  function cloudDistance(a, b, start) {
    const matched = new Array(N).fill(false);
    let sum = 0, i = start;
    do {
      let min = Infinity, idx = -1;
      for (let j = 0; j < N; j++) if (!matched[j]) { const d = dist(a[i], b[j]); if (d < min) { min = d; idx = j; } }
      matched[idx] = true;
      sum += (1 - ((i - start + N) % N) / N) * min;
      i = (i + 1) % N;
    } while (i !== start);
    return sum;
  }
  function match(a, b) {
    const step = Math.floor(Math.pow(N, 0.5));
    let min = Infinity;
    for (let i = 0; i < N; i += step) min = Math.min(min, cloudDistance(a, b, i), cloudDistance(b, a, i));
    return min;
  }

  /* ---------------------------------------------------------------- built-in digit shapes */
  // Coordinates in a box ~0.62 wide × 1 tall, y pointing down. Each digit: list of variants, each a list of strokes.
  const seg = (x1, y1, x2, y2, k = 8) => Array.from({ length: k + 1 }, (_, i) => ({ x: x1 + (x2 - x1) * i / k, y: y1 + (y2 - y1) * i / k }));
  const arc = (cx, cy, rx, ry, a0, a1, k = 24) => Array.from({ length: k + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / k) * Math.PI / 180; return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }; });
  const poly = pts => { const out = []; for (let i = 1; i < pts.length; i++) out.push(...seg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 4).slice(i > 1 ? 1 : 0)); return out; };
  const cat = (...parts) => parts.reduce((a, p) => a.concat(a.length ? p.slice(1) : p), []);
  const SHAPES = {
    0: [
      [arc(0.31, 0.5, 0.3, 0.5, -90, 270)],
      [arc(0.31, 0.5, 0.22, 0.5, -90, -450)],
      [arc(0.31, 0.5, 0.32, 0.46, -100, 260)],
    ],
    1: [
      [seg(0.3, 0, 0.3, 1)],
      [cat(seg(0.08, 0.28, 0.32, 0), seg(0.32, 0, 0.32, 1))],
      [cat(seg(0.08, 0.28, 0.32, 0), seg(0.32, 0, 0.32, 1)), seg(0.08, 1, 0.56, 1)],
    ],
    2: [
      [cat(arc(0.3, 0.28, 0.28, 0.28, 200, 380), seg(0.56, 0.38, 0.02, 1), seg(0.02, 1, 0.62, 1))],
      [cat(arc(0.3, 0.3, 0.29, 0.3, 190, 400), poly([[0.55, 0.42], [0.25, 0.72], [0.04, 0.98], [0.62, 0.98]]))],
      [cat(arc(0.3, 0.28, 0.28, 0.28, 200, 380), seg(0.56, 0.38, 0.1, 0.92), arc(0.14, 0.9, 0.1, 0.1, -60, 200), seg(0.05, 0.92, 0.62, 1))],
    ],
    3: [
      [cat(arc(0.3, 0.25, 0.28, 0.25, 200, 450), arc(0.3, 0.75, 0.3, 0.25, 270, 520))],
      [cat(poly([[0.02, 0], [0.58, 0], [0.25, 0.42]]), arc(0.3, 0.7, 0.3, 0.3, 260, 520))],
    ],
    4: [
      [cat(seg(0.45, 0, 0.0, 0.65), seg(0, 0.65, 0.62, 0.65)), seg(0.45, 0, 0.45, 1)],
      [cat(seg(0.05, 0, 0.05, 0.6), seg(0.05, 0.6, 0.62, 0.6)), seg(0.45, 0, 0.45, 1)],
      [cat(seg(0.45, 0.02, 0.0, 0.65), seg(0, 0.65, 0.62, 0.65)), seg(0.45, 0.3, 0.45, 1)],
      [poly([[0.45, 1], [0.45, 0], [0, 0.65], [0.62, 0.65]])],
    ],
    5: [
      [cat(seg(0.56, 0, 0.08, 0), seg(0.08, 0, 0.05, 0.44), arc(0.3, 0.7, 0.3, 0.29, 235, 500))],
      [cat(seg(0.08, 0, 0.05, 0.44), arc(0.3, 0.7, 0.3, 0.29, 235, 500)), seg(0.08, 0, 0.58, 0)],
      [cat(seg(0.08, 0, 0.05, 0.44), arc(0.28, 0.7, 0.3, 0.29, 235, 485)), seg(0.08, 0.02, 0.58, 0)],
    ],
    6: [
      [cat(poly([[0.55, 0.02], [0.35, 0.1], [0.17, 0.28], [0.07, 0.5], [0.05, 0.72]]), arc(0.31, 0.72, 0.26, 0.27, 180, -180))],
      [cat(poly([[0.5, 0], [0.2, 0.3], [0.05, 0.7]]), arc(0.3, 0.73, 0.26, 0.26, 170, -190))],
    ],
    7: [
      [cat(seg(0, 0, 0.62, 0), seg(0.62, 0, 0.2, 1))],
      [cat(seg(0, 0, 0.62, 0), seg(0.62, 0, 0.2, 1)), seg(0.15, 0.5, 0.58, 0.5)],
      [cat(seg(0, 0.08, 0, 0), seg(0, 0, 0.62, 0), seg(0.62, 0, 0.3, 1))],
      [cat(seg(0.02, 0.02, 0.62, 0), arc(-0.15, 1, 0.77, 1, -5, -55))],          // stem bending down-left
    ],
    8: [
      [Array.from({ length: 49 }, (_, i) => { const t = i / 48 * 2 * Math.PI; return { x: 0.31 - 0.27 * Math.sin(2 * t) / 1.0, y: 0.5 - 0.5 * Math.cos(t) }; })],
      [arc(0.31, 0.25, 0.22, 0.25, 0, 360), arc(0.31, 0.74, 0.28, 0.26, 0, 360)],
      [Array.from({ length: 49 }, (_, i) => { const t = i / 48 * 2 * Math.PI; return { x: 0.31 + 0.27 * Math.sin(2 * t), y: 0.5 - 0.5 * Math.cos(t) }; })],
    ],
    9: [
      [cat(arc(0.3, 0.28, 0.27, 0.28, 0, -360), seg(0.57, 0.28, 0.52, 1))],
      [cat(arc(0.3, 0.28, 0.27, 0.28, 10, -350), poly([[0.57, 0.3], [0.5, 0.75], [0.3, 1]]))],
      [arc(0.3, 0.28, 0.27, 0.28, 0, 360), seg(0.57, 0.1, 0.55, 1)],
    ],
  };
  const shear = (strokes, k) => strokes.map(st => st.map(q => ({ x: q.x + k * (0.5 - q.y), y: q.y })));
  const squash = (strokes, sx) => strokes.map(st => st.map(q => ({ x: q.x * sx, y: q.y })));

  let TEMPLATES = null;
  function builtins() {
    const out = [];
    for (const d of Object.keys(SHAPES)) for (const v of SHAPES[d]) {
      for (const k of [0, 0.18, -0.12]) for (const sx of [0.8, 1.25]) out.push({ d, cloud: normalize(squash(shear(v, k), sx)) });
    }
    return out;
  }
  function own() { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } }
  function templates() {
    if (!TEMPLATES) {
      TEMPLATES = builtins();
      const mine = own();
      for (const d of Object.keys(mine)) for (const strokes of mine[d]) TEMPLATES.push({ d, cloud: normalize(strokes), mine: true });
    }
    return TEMPLATES;
  }

  function recognize(strokes) {
    strokes = strokes.filter(s => s.length);
    if (!strokes.length) return [];
    const c = normalize(strokes);
    const best = {};
    for (const t of templates()) {
      let s = match(c, t.cloud);
      if (t.mine) s *= 0.92;   // the child's own samples count a little more
      if (best[t.d] == null || s < best[t.d]) best[t.d] = s;
    }
    let list = Object.keys(best).map(d => ({ d, score: best[d] })).sort((a, b) => a.score - b.score);
    // a very thin, tall shape is a 1 whatever the clouds say (a straight line normalises to a point column)
    if (c.aspect < 0.18) list = [{ d: '1', score: 0 }, ...list.filter(x => x.d !== '1')];
    return list;
  }
  function learn(strokes, d) {
    const mine = own();
    const box = bounds(strokes);
    const scaled = strokes.map(st => st.map(q => ({ x: Math.round((q.x - box.x) * 1000 / box.s) / 1000, y: Math.round((q.y - box.y) * 1000 / box.s) / 1000 })));
    (mine[d] = mine[d] || []).push(scaled);
    if (mine[d].length > PER_DIGIT) mine[d].shift();
    try { localStorage.setItem(STORE, JSON.stringify(mine)); } catch (e) { /* storage full / private mode */ }
    TEMPLATES = null;
  }
  function bounds(strokes) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const st of strokes) for (const q of st) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, s: Math.max(x1 - x0, y1 - y0) || 1 };
  }

  /* ---------------------------------------------------------------- writing pad */
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function pad(opts) {
    const root = el('div', 'hand');
    const area = el('div', 'hand-area');
    const canvas = document.createElement('canvas');
    const hintTx = el('div', 'hand-hint', 'Viết 1 chữ số vào đây ✏️');
    area.append(canvas, hintTx);
    const bar = el('div', 'hand-bar');
    const guess = el('div', 'hand-guess');
    const tools = el('div', 'hand-tools');
    const back = el('button', 'key fn', '⌫'); back.type = 'button'; back.setAttribute('aria-label', 'Xóa số vừa viết');
    back.onclick = () => { resetInk(); hideGuess(); opts.onBack && opts.onBack(); };
    if (opts.comma) { const cm = el('button', 'key fn', ','); cm.type = 'button'; cm.onclick = () => { opts.onComma && opts.onComma(); }; tools.append(cm); }
    tools.append(back);
    bar.append(guess, tools);
    root.append(area, bar);

    const ctx = canvas.getContext('2d');
    let strokes = [], cur = null, timer = null, penSeen = false, last = null;
    function fit() {
      const r = area.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      if (!r.width) return;
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }
    function redraw() {
      const r = area.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1D4ED8'; ctx.lineWidth = Math.max(6, r.width / 32);
      for (const st of strokes.concat(cur ? [cur] : [])) {
        ctx.beginPath();
        st.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
        if (st.length === 1) ctx.lineTo(st[0].x + 0.1, st[0].y);
        ctx.stroke();
      }
    }
    function resetInk() { clearTimeout(timer); strokes = []; cur = null; redraw(); hintTx.style.opacity = ''; }
    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener('pointerdown', e => {
      if (e.pointerType === 'pen') penSeen = true;
      if (penSeen && e.pointerType === 'touch') return;          // palm resting while writing with the Pencil
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* synthetic events */ }
      clearTimeout(timer);
      hideGuess();
      hintTx.style.opacity = '0';
      cur = [pos(e)];
      redraw();
    });
    canvas.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); cur.push(pos(e)); redraw(); });
    const up = () => {
      if (!cur) return;
      strokes.push(cur); cur = null; redraw();
      clearTimeout(timer);
      timer = setTimeout(done, 700);   // wait a moment: 4, 5 and 7 may need a second stroke
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    function done() {
      const ink = strokes.filter(s => s.length);
      const b = bounds(ink);
      if (!ink.length || (b.w < 6 && b.h < 6)) { resetInk(); return; }   // a tap, not a digit
      const list = recognize(ink);
      const d = list[0].d;
      last = { strokes: ink, d };
      showGuess(d, list.slice(1, 5).map(x => x.d));
      resetInk();
      opts.onDigit && opts.onDigit(d);
    }
    function showGuess(d, alts) {
      guess.innerHTML = '';
      guess.append(el('span', 'hg-lbl', 'Bé viết số'), el('b', 'hg-d', d), el('span', 'hg-lbl', 'Không phải? Chọn:'));
      for (const a of alts) {
        const b = el('button', 'hg-alt', a); b.type = 'button';
        b.onclick = () => { if (!last) return; learn(last.strokes, a); last.d = a; opts.onFix && opts.onFix(a); hideGuess(); };
        guess.append(b);
      }
      guess.classList.add('show');
    }
    function hideGuess() { guess.classList.remove('show'); }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(area); else setTimeout(fit, 50);
    root.clear = () => { resetInk(); hideGuess(); last = null; };
    return root;
  }

  window.Hand = { recognize, learn, pad, _shapes: SHAPES, _normalize: normalize };
})();
