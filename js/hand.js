/* Toán ISA — handwritten digit input (finger or Apple Pencil), fully offline.
 *
 * Recogniser: $P point-cloud recogniser (Vatavu, Anthony & Wobbrock 2012) — stroke order and direction
 * do not matter, multi-stroke digits (4, 5, 7 with a bar) work. Templates are generated here from
 * hand-made digit shapes with slant/aspect variants, plus the child's own corrected samples, which are
 * kept on the device so recognition adapts to the child's writing.
 *
 * window.Hand = {
 *   recognize(strokes) → [{ d, score }] best first        (strokes: [[{x,y}, …], …])
 *   readNumber(strokes) → { text, parts }                   a whole number written at once ("1638", "98,5")
 *   learn(strokes, d)                                       keep a sample of the child's digit d
 *   pad({ onNumber(text), comma: bool }) → HTMLElement with .clear() and .flush()
 * }
 * The child writes the whole answer in one go (user request); the ink is split into digits by where the
 * strokes sit left to right, each digit is recognised, and a small low mark becomes the decimal comma.
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
      [cat(seg(0.0, 0.55, 0.42, 0), seg(0.42, 0, 0.42, 1))],                     // long flag from low on the left (iPad sample)
      [cat(seg(0.02, 0.4, 0.4, 0), seg(0.4, 0, 0.38, 1))],
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
      [cat(arc(0.3, 0.3, 0.3, 0.3, -10, -370), seg(0.59, 0.25, 0.56, 1))],      // round loop, long straight stem
      [cat(arc(0.32, 0.32, 0.3, 0.32, 20, -340), poly([[0.6, 0.38], [0.6, 0.7], [0.5, 1]]))],
    ],
  };
  const shear = (strokes, k) => strokes.map(st => st.map(q => ({ x: q.x + k * (0.5 - q.y), y: q.y })));
  const squash = (strokes, sx) => strokes.map(st => st.map(q => ({ x: q.x * sx, y: q.y })));

  let TEMPLATES = null;
  // Young children often write 3, 7 and 9 mirrored (ε for 3): those are read as the digit they meant, with a
  // small handicap so a properly written digit always wins a close call.
  const MIRRORED = ['3', '7', '9'];
  const mirror = strokes => strokes.map(st => st.map(q => ({ x: 0.62 - q.x, y: q.y })));
  function builtins() {
    const out = [];
    for (const d of Object.keys(SHAPES)) for (const v of SHAPES[d]) {
      for (const k of [0, 0.18, -0.12]) for (const sx of [0.8, 1.25]) out.push({ d, cloud: normalize(squash(shear(v, k), sx)) });
      if (MIRRORED.includes(d)) for (const k of [0, -0.18]) out.push({ d, cloud: normalize(shear(mirror(v), k)), weight: 1.06 });
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
      else if (t.weight) s *= t.weight;
      if (best[t.d] == null || s < best[t.d]) best[t.d] = s;
    }
    // second opinion from the small neural network (js/hand-cnn.js), when it is loaded: each digit's distance gets
    // the network's doubt about that digit added (−ln p), so the two readers settle close calls together
    const p = cnnProbs(strokes);
    if (p) for (const d of Object.keys(best)) best[d] += CNN_WEIGHT * -Math.log(Math.max(p[d], 1e-4));
    let list = Object.keys(best).map(d => ({ d, score: best[d] })).sort((a, b) => a.score - b.score);
    list = disambiguate(list, strokes);
    // a very thin, tall shape is a 1 whatever the clouds say (a straight line normalises to a point column)
    if (c.aspect < 0.18) list = [{ d: '1', score: 0 }, ...list.filter(x => x.d !== '1')];
    return list;
  }
  // Split the ink into digits. Strokes come in the order they were written, and the strokes of one digit are
  // written one after the other (the bar of a 4, 5 or 7 right after its body), so a stroke can only join the digit
  // of the stroke before it, and only when it sits over that digit. The possible splits of each run of strokes
  // are scored with the recogniser and the best one is kept. A small mark low on the line is a decimal comma.
  // do two strokes cross (a segment of one cuts a segment of the other, not just touching at an end)?
  function crosses(p, q) {
    const side = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const bp = bounds([p]), bq = bounds([q]);
    if (bp.x > bq.x + bq.w || bq.x > bp.x + bp.w || bp.y > bq.y + bq.h || bq.y > bp.y + bp.h) return false;
    for (let i = 1; i < p.length; i++) for (let j = 1; j < q.length; j++) {
      const a = p[i - 1], b = p[i], c = q[j - 1], d = q[j];
      if (side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) {
        // ignore a crossing right at the end of either stroke: that is two strokes meeting, not crossing
        if ((i > 2 && i < p.length - 2) && (j > 2 && j < q.length - 2)) return true;
      }
    }
    return false;
  }
  function segment(strokes) {
    const items = strokes.filter(st => st.length).map(st => ({ st, b: bounds([st]) }));
    if (!items.length) return [];
    const H = Math.max(...items.map(it => it.b.h), 1);
    const top = Math.min(...items.map(it => it.b.y)), bottom = Math.max(...items.map(it => it.b.y + it.b.h));
    const lineH = Math.max(bottom - top, 1);
    const isComma = it => it.b.w < 0.3 * H && it.b.h < 0.3 * H && it.b.y + it.b.h / 2 > top + lineH * 0.55 && H > 18;
    const ink = items.filter(it => !isComma(it));
    const commas = items.filter(isComma).map(it => ({ comma: true, x: it.b.x + it.b.w / 2 }));
    // can strokes a..b (in writing order) be one digit? each one must sit over the ones before it
    const over = (a, b) => {
      let x0 = ink[a].b.x, x1 = ink[a].b.x + ink[a].b.w, y0 = ink[a].b.y, y1 = ink[a].b.y + ink[a].b.h, cross = false;
      for (let k = a + 1; k <= b; k++) {
        for (let j = a; j < k && !cross; j++) cross = crosses(ink[j].st, ink[k].st);
        const it = ink[k], cx = it.b.x + it.b.w / 2, gc = (x0 + x1) / 2, w = Math.max(x1 - x0, 1);
        const ov = Math.min(x1, it.b.x + it.b.w) - Math.max(x0, it.b.x);
        if (!((cx >= x0 - 0.05 * H && cx <= x1 + 0.05 * H) || (gc >= it.b.x && gc <= it.b.x + it.b.w) || ov > 0.6 * Math.min(w, it.b.w))) return false;
        x0 = Math.min(x0, it.b.x); x1 = Math.max(x1, it.b.x + it.b.w);
        y0 = Math.min(y0, it.b.y); y1 = Math.max(y1, it.b.y + it.b.h);
      }
      // one digit is not much wider than it is tall — measured on the strokes together: a 4 drawn as a wide
      // open corner plus a short stem below it is taller than either stroke alone (iPad sample read as "41")
      // Two digits of a number never cross each other, so strokes that cross are one digit even when it is wide:
      // a 4 whose long bar runs far past the stem is nearly twice as wide as tall (iPhone sample read as "41").
      return x1 - x0 <= (cross ? 2.4 : 1.05) * Math.max(H, y1 - y0);
    };
    const cost = (a, b) => {
      const list = recognizeCached(ink.slice(a, b + 1).map(it => it.st));
      return list.length ? list[0].score : 99;
    };
    // best split of the strokes into digits of 1–3 strokes (dynamic programming over the writing order)
    const n = ink.length, best = new Array(n + 1).fill(Infinity), from = new Array(n + 1).fill(-1);
    best[0] = 0;
    const PER_DIGIT = 0.9;   // a small charge per digit, so two strokes of one digit are not read as two digits
    for (let e = 1; e <= n; e++) for (let k = 1; k <= 3 && k <= e; k++) {
      const a = e - k;
      if (k > 1 && !over(a, e - 1)) continue;
      const c = best[a] + cost(a, e - 1) + PER_DIGIT;
      if (c < best[e]) { best[e] = c; from[e] = a; }
    }
    const groups = [];
    for (let e = n; e > 0; e = from[e]) {
      const a = from[e], g = ink.slice(a, e);
      groups.unshift({ strokes: g.map(it => it.st), x0: Math.min(...g.map(it => it.b.x)), x1: Math.max(...g.map(it => it.b.x + it.b.w)) });
    }
    return groups.concat(commas).sort((a, b) => (a.comma ? a.x : (a.x0 + a.x1) / 2) - (b.comma ? b.x : (b.x0 + b.x1) / 2));
  }
  // The pad reads all its ink again after every pause; the same groups of strokes come up again and again, so
  // their readings are kept (strokes are never changed once written).
  const strokeIds = new WeakMap(); let nextStrokeId = 1;
  const recCache = new Map();
  function recognizeCached(strokes) {
    const key = strokes.map(st => { if (!strokeIds.has(st)) strokeIds.set(st, nextStrokeId++); return strokeIds.get(st); }).join(',');
    if (recCache.has(key)) return recCache.get(key);
    const list = recognize(strokes);
    if (recCache.size > 400) recCache.clear();
    recCache.set(key, list);
    return list;
  }
  function readNumber(strokes) {
    const parts = [];
    for (const g of segment(strokes)) {
      if (g.comma) { if (parts.length && !parts.some(p => p.comma) && !parts[parts.length - 1].comma) parts.push({ comma: true }); continue; }
      const list = recognizeCached(g.strokes);
      if (list.length) parts.push({ d: list[0].d, alts: list.slice(1, 5).map(x => x.d), strokes: g.strokes });
    }
    while (parts.length && parts[parts.length - 1].comma) parts.pop();   // a comma needs digits after it
    return { text: parts.map(p => (p.comma ? ',' : p.d)).join(''), parts };
  }
  // Point clouds blur a few pairs; look at the ink itself to tell them apart:
  //  1 vs 4 — a 4 has a horizontal bar across its lower half; a 1 with a long flag has none
  //  0 vs 9 / 6 — a 9 ends in a narrow stem below its loop, a 6 starts with a narrow stroke above it
  function disambiguate(list, strokes) {
    if (list.length < 2) return list;
    const b = bounds(strokes), w = Math.max(b.w, 1), hgt = Math.max(b.h, 1);
    const pts = strokes.map(st => st.map(q => ({ x: (q.x - b.x) / w, y: (q.y - b.y) / hgt })));
    const top = list[0].d, rank = d => list.findIndex(x => x.d === d), near = d => { const k = rank(d); return k > 0 && k <= 3 && list[k].score - list[0].score < 0.45; };
    const promote = d => [list[rank(d)], ...list.filter(x => x.d !== d)];
    if (top === '4' && near('1')) {
      // length of near-horizontal ink in the lower 35–90 % of the height, as a share of the width
      let bar = 0;
      for (const st of pts) for (let i = 1; i < st.length; i++) {
        const dx = Math.abs(st[i].x - st[i - 1].x) * w, dy = Math.abs(st[i].y - st[i - 1].y) * hgt, y = (st[i].y + st[i - 1].y) / 2;
        if (y > 0.35 && y < 0.9 && dy < 0.45 * dx) bar += dx / w;
      }
      if (bar < 0.3) return promote('1');
    }
    if (top === '0' && (near('9') || near('6'))) {
      const xs = band => { const v = pts.flat().filter(q => band(q.y)).map(q => q.x); return v.length ? Math.max(...v) - Math.min(...v) : 1; };
      if (near('9') && xs(y => y > 0.72) < 0.4) return promote('9');
      if (near('6') && xs(y => y < 0.28) < 0.4) return promote('6');
    }
    return list;
  }
  /* ------------------------------------------------ small neural network (second opinion) */
  // Weights trained by tools/train_digit_cnn.py on MNIST + Vietnamese child-style digits; int8, decoded once.
  let CNN_WEIGHT = 0.15, cnn = null;
  function cnnNet() {
    if (cnn !== null) return cnn;
    const W = window.HAND_CNN && window.HAND_CNN.w;
    if (!W) return null;   // not loaded yet: try again next time
    const dec = w => { const bin = atob(w.b64), out = new Float32Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = ((bin.charCodeAt(i) << 24) >> 24) * w.scale; return out; };
    cnn = {};
    for (const k of Object.keys(W)) cnn[k] = dec(W[k]);
    return cnn;
  }
  function conv5(inp, C, Hh, w, b, O) {   // 5 × 5 convolution, padding 2, then ReLU
    const out = new Float32Array(O * Hh * Hh);
    for (let o = 0; o < O; o++) for (let y = 0; y < Hh; y++) for (let x = 0; x < Hh; x++) {
      let v = b[o];
      for (let c = 0; c < C; c++) for (let ky = 0; ky < 5; ky++) {
        const yy = y + ky - 2; if (yy < 0 || yy >= Hh) continue;
        const wo = ((o * C + c) * 5 + ky) * 5, io = (c * Hh + yy) * Hh;
        for (let kx = 0; kx < 5; kx++) { const xx = x + kx - 2; if (xx >= 0 && xx < Hh) v += w[wo + kx] * inp[io + xx]; }
      }
      out[(o * Hh + y) * Hh + x] = v > 0 ? v : 0;
    }
    return out;
  }
  function pool2(inp, C, Hh) {
    const h2 = Hh >> 1, out = new Float32Array(C * h2 * h2);
    for (let c = 0; c < C; c++) for (let y = 0; y < h2; y++) for (let x = 0; x < h2; x++) {
      const i = (c * Hh + 2 * y) * Hh + 2 * x;
      out[(c * h2 + y) * h2 + x] = Math.max(inp[i], inp[i + 1], inp[i + Hh], inp[i + Hh + 1]);
    }
    return out;
  }
  function dense(inp, w, b, O, relu) {
    const N = inp.length, out = new Float32Array(O);
    for (let o = 0; o < O; o++) { let v = b[o]; for (let i = 0; i < N; i++) v += w[o * N + i] * inp[i]; out[o] = relu && v < 0 ? 0 : v; }
    return out;
  }
  function cnnProbs(strokes) {
    const n = cnnNet(); if (!n) return null;
    let x = toImage(strokes);
    x = pool2(conv5(x, 1, 28, n['c1.weight'], n['c1.bias'], 16), 16, 28);
    x = pool2(conv5(x, 16, 14, n['c2.weight'], n['c2.bias'], 32), 32, 14);
    x = dense(x, n['f1.weight'], n['f1.bias'], 64, true);
    x = dense(x, n['f2.weight'], n['f2.bias'], 10, false);
    const m = Math.max(...x); let sum = 0; const p = {};
    for (let d = 0; d < 10; d++) { p[d] = Math.exp(x[d] - m); sum += p[d]; }
    for (let d = 0; d < 10; d++) p[d] /= sum;
    return p;
  }

  // Ink → 28 × 28 grey image laid out like MNIST (the digit fits a 20 × 20 box, centred on its centre of mass),
  // for the small neural network that gives a second opinion. Drawn 4× larger and averaged down for smooth edges.
  let rasterCanvas = null;
  function toImage(strokes) {
    const S = 112, k = 4, b = bounds(strokes);
    if (!rasterCanvas) rasterCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(S, S) : Object.assign(document.createElement('canvas'), { width: S, height: S });
    const c = rasterCanvas.getContext('2d', { willReadFrequently: true });
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, S, S);
    const sc = 80 / Math.max(b.w, b.h, 1);
    c.translate(S / 2 - (b.x + b.w / 2) * sc, S / 2 - (b.y + b.h / 2) * sc);
    c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 9 / sc;
    for (const st of strokes) {
      c.beginPath();
      st.forEach((q, i) => (i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)));
      if (st.length === 1) c.lineTo(st[0].x + 0.01, st[0].y);
      c.stroke();
    }
    const px = c.getImageData(0, 0, S, S).data, small = new Float32Array(784);
    let m = 0, mx = 0, my = 0;
    for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
      let v = 0;
      for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) v += px[((y * k + dy) * S + x * k + dx) * 4];
      v /= k * k * 255; small[y * 28 + x] = v; m += v; mx += v * x; my += v * y;
    }
    if (!m) return small;
    const sx = Math.round(13.5 - mx / m), sy = Math.round(13.5 - my / m), out = new Float32Array(784);
    for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
      const X = x - sx, Y = y - sy;
      if (X >= 0 && X < 28 && Y >= 0 && Y < 28) out[y * 28 + x] = small[Y * 28 + X];
    }
    return out;
  }
  function learn(strokes, d) {
    const mine = own();
    const box = bounds(strokes);
    const scaled = strokes.map(st => st.map(q => ({ x: Math.round((q.x - box.x) * 1000 / box.s) / 1000, y: Math.round((q.y - box.y) * 1000 / box.s) / 1000 })));
    (mine[d] = mine[d] || []).push(scaled);
    if (mine[d].length > PER_DIGIT) mine[d].shift();
    try { localStorage.setItem(STORE, JSON.stringify(mine)); } catch (e) { /* storage full / private mode */ }
    TEMPLATES = null;
    recCache.clear();   // readings made before this sample are out of date
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
    const hintTx = el('div', 'hand-hint', U.L('Viết cả số vào đây ✏️', 'Write the whole number here ✏️'));
    area.append(canvas, hintTx);
    const bar = el('div', 'hand-bar');
    const guess = el('div', 'hand-guess');
    const tools = el('div', 'hand-tools');
    const back = el('button', 'key fn', '⌫'); back.type = 'button'; back.setAttribute('aria-label', U.L('Xóa nét vừa viết', 'Undo the last stroke'));
    back.onclick = () => { if (!strokes.length) return; strokes.pop(); redraw(); update(); };
    const wipe = el('button', 'key fn', '🧹'); wipe.type = 'button'; wipe.setAttribute('aria-label', U.L('Xóa hết để viết lại', 'Clear and write again'));
    wipe.onclick = () => { root.clear(); emit(''); };
    if (opts.comma) {
      const cm = el('button', 'key fn', ','); cm.type = 'button'; cm.setAttribute('aria-label', U.L('Dấu phẩy', 'Decimal comma'));
      cm.onclick = () => { if (strokes.length) { commaAt = readNumber(strokes).parts.filter(p => !p.comma).length; update(); } };
      tools.append(cm);
    }
    tools.append(back, wipe);
    bar.append(guess, tools);
    root.append(area, bar);

    const ctx = canvas.getContext('2d');
    let strokes = [], cur = null, timer = null, penSeen = false;
    let commaAt = -1;                 // comma typed with the "," key: after that many digits
    const fixes = new Map();          // first stroke of a digit → the digit the child chose for it
    let lastText = null, lastParts = [];
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
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1D4ED8'; ctx.lineWidth = Math.max(5, Math.min(9, r.height / 18));
      for (const st of strokes.concat(cur ? [cur] : [])) {
        ctx.beginPath();
        st.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
        if (st.length === 1) ctx.lineTo(st[0].x + 0.1, st[0].y);
        ctx.stroke();
      }
      hintTx.style.opacity = strokes.length || cur ? '0' : '';
    }
    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener('pointerdown', e => {
      if (e.pointerType === 'pen') penSeen = true;
      if (penSeen && e.pointerType === 'touch') return;          // palm resting while writing with the Pencil
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* synthetic events */ }
      clearTimeout(timer);
      hideAlts();
      cur = [pos(e)];
      redraw();
    });
    canvas.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); cur.push(pos(e)); redraw(); });
    const up = () => {
      if (!cur) return;
      strokes.push(cur); cur = null; redraw();
      clearTimeout(timer);
      timer = setTimeout(update, 650);   // read the whole number again after each pause
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    function emit(text) { if (text !== lastText) { lastText = text; opts.onNumber && opts.onNumber(text); } }
    // read all the ink as one number; digits the child corrected keep their choice
    function update() {
      clearTimeout(timer); timer = null;
      const ink = strokes.filter(st => st.length);
      if (!ink.length) { lastParts = []; showGuess(); emit(''); return; }
      const b = bounds(ink);
      if (b.w < 6 && b.h < 6) { strokes = []; redraw(); lastParts = []; showGuess(); emit(''); return; }   // a tap
      const res = readNumber(ink);
      let parts = res.parts.filter(p => !p.comma || commaAt < 0);
      parts = parts.map(p => (p.comma ? p : Object.assign({}, p, fixes.has(p.strokes[0]) ? { d: fixes.get(p.strokes[0]) } : {})));
      if (commaAt > 0) {
        const digits = parts.filter(p => !p.comma);
        if (commaAt < digits.length) parts = [...digits.slice(0, commaAt), { comma: true }, ...digits.slice(commaAt)];
        else parts = digits;
      }
      lastParts = parts;
      showGuess();
      emit(parts.map(p => (p.comma ? ',' : p.d)).join(''));
    }
    // "Bé viết: 1 6 3 8" — a tap on a digit offers the other likely digits for it
    function showGuess() {
      guess.innerHTML = '';
      if (!lastParts.length) { guess.classList.remove('show'); return; }
      guess.append(el('span', 'hg-lbl', U.L('Bé viết:', 'You wrote:')));
      lastParts.forEach(p => {
        if (p.comma) { guess.append(el('b', 'hg-comma', ',')); return; }
        const b = el('button', 'hg-dig', p.d); b.type = 'button';
        b.setAttribute('aria-label', U.L('Sửa chữ số ', 'Change the digit ') + p.d);
        b.onclick = () => showAlts(p);
        guess.append(b);
      });
      guess.append(el('span', 'hg-lbl hg-tip', U.L('Sai số nào thì chạm vào số đó.', 'Tap a digit to change it.')));
      guess.classList.add('show');
    }
    function showAlts(p) {
      guess.innerHTML = '';
      guess.append(el('span', 'hg-lbl', U.L('Bé viết số', 'You wrote')), el('b', 'hg-d', p.d), el('span', 'hg-lbl', U.L('hay là:', 'or is it:')));
      const opts2 = p.alts.concat(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).filter((x, k, a) => x !== p.d && a.indexOf(x) === k).slice(0, 5);
      for (const a of opts2) {
        const b = el('button', 'hg-alt', a); b.type = 'button';
        b.onclick = () => { learn(p.strokes, a); fixes.set(p.strokes[0], a); update(); };
        guess.append(b);
      }
      const no = el('button', 'hg-alt hg-ok', '✓'); no.type = 'button'; no.setAttribute('aria-label', U.L('Đúng rồi', 'That is right')); no.onclick = () => showGuess();
      guess.append(no);
      guess.classList.add('show');
    }
    function hideAlts() { if (guess.querySelector('.hg-alt')) showGuess(); }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(area); else setTimeout(fit, 50);
    root.clear = () => { clearTimeout(timer); strokes = []; cur = null; commaAt = -1; fixes.clear(); lastParts = []; lastText = ''; redraw(); showGuess(); };
    root.flush = () => { if (timer) update(); };   // read the last strokes now (before the answer is checked)
    return root;
  }

  window.Hand = { recognize, readNumber, learn, pad, toImage, cnnProbs, _shapes: SHAPES, _normalize: normalize, _segment: segment, _setCnnWeight: w => { CNN_WEIGHT = w; } };
})();
