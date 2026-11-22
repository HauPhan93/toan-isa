/* Test-only: child-style handwritten digits, built independently of the recogniser's templates (js/hand.js).
 * Styles follow how Vietnamese children are taught to write digits (Toán 1 KNTT: 2, 3, 4, 5, 7 have two forms;
 * 1 = nét xiên phải + nét thẳng; 9 = vòng cong + nét thẳng) plus common child habits (open loops, overshoot,
 * mirrored 3/7/9, separate strokes). Load it in a page that has window.Hand, then:
 *   HandStyles.sample(d, rng, size)  → strokes of one digit
 *   HandStyles.confusion(n, seed)    → { accuracy, matrix, worst }
 */
(function () {
  'use strict';
  const L = (pts, k = 10) => { const o = []; for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, d] = pts[i]; for (let j = i > 1 ? 1 : 0; j <= k; j++) o.push([a + (c - a) * j / k, b + (d - b) * j / k]); } return o; };
  const A = (cx, cy, rx, ry, a0, a1, k = 28) => Array.from({ length: k + 1 }, (_, i) => { const t = (a0 + (a1 - a0) * i / k) * Math.PI / 180; return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)]; });
  const J = (...parts) => parts.reduce((a, p) => a.concat(a.length ? p.slice(1) : p), []);
  // quadratic curve through control point
  const Qc = (p0, p1, p2, k = 16) => Array.from({ length: k + 1 }, (_, i) => { const t = i / k, u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; });

  // each style: (r) => strokes in a box about 0.6 wide × 1 tall, y down; r() gives small random variation
  const STYLES = {
    0: [r => [A(0.3, 0.5, 0.28 + r() * 0.06, 0.5, -80, -440)],
        r => [A(0.3, 0.5, 0.26, 0.48, -95, 250 - r() * 25)],                       // not quite closed
        r => [A(0.3, 0.5, 0.3, 0.5, -90, 280)]],
    1: [r => [J(L([[0.02, 0.45 + r() * 0.2], [0.42, 0]]), L([[0.42, 0], [0.42, 1]]))],      // nét xiên phải + nét thẳng (SGK)
        r => [J(L([[0.15, 0.25], [0.4, 0]]), L([[0.4, 0], [0.38, 1]]))],
        r => [L([[0.35, 0], [0.33, 1]])],
        r => [L([[0.1, 0.35 + r() * 0.15], [0.4, 0]]), L([[0.4, 0], [0.4, 1]])]],          // two strokes
    2: [r => [J(A(0.3, 0.28, 0.28, 0.28, 195, 360), Qc([0.58, 0.28], [0.5, 0.6], [0.03, 1]), L([[0.03, 1], [0.62, 0.98]]))],
        r => [J(A(0.3, 0.28, 0.28, 0.28, 195, 365), Qc([0.58, 0.3], [0.4, 0.7], [0.1, 0.92]), A(0.15, 0.88, 0.09, 0.09, -40, 230), L([[0.08, 0.95], [0.62, 1]]))],   // kiểu 2: loop at the base
        r => [J(L([[0.03, 0.12], [0.3, 0], [0.55, 0.12]]), L([[0.55, 0.12], [0.03, 1]]), L([[0.03, 1], [0.6, 1]]))]],
    3: [r => [J(A(0.28, 0.25, 0.27, 0.25, 200, 450), A(0.28, 0.75, 0.3, 0.25, 270, 525))],
        r => [J(L([[0.02, 0], [0.58, 0], [0.22, 0.42]]), Qc([0.22, 0.42], [0.7, 0.45], [0.55, 0.85]), Qc([0.55, 0.85], [0.35, 1.05], [0.02, 0.88]))],   // flat top
        r => [J(A(0.3, 0.27, 0.27, 0.27, 180, 440), A(0.3, 0.74, 0.3, 0.26, 280, 520))]],
    4: [r => [J(L([[0.42, 0], [0.0, 0.62]]), L([[0.0, 0.62], [0.62, 0.62]])), L([[0.45, 0.05 + r() * 0.2], [0.45, 1]])],   // xiên, ngang, sổ
        r => [L([[0.42, 0], [0.0, 0.62]]), L([[0.0, 0.62], [0.62, 0.62]]), L([[0.45, 0.2], [0.45, 1]])],                      // three separate strokes
        r => [J(L([[0.05, 0], [0.05, 0.6]]), L([[0.05, 0.6], [0.62, 0.6]])), L([[0.45, 0.1], [0.45, 1]])],                    // open 4 (kiểu 2)
        r => [J(L([[0.45, 1], [0.45, 0], [0.0, 0.65], [0.62, 0.65]]))]],                                                       // one stroke, closed
    5: [r => [J(L([[0.08, 0], [0.05, 0.45]]), A(0.3, 0.7, 0.3, 0.29, 235, 495)), L([[0.08, 0.01], [0.58, 0]])],
        r => [L([[0.58, 0], [0.08, 0]]), J(L([[0.08, 0], [0.05, 0.45]]), A(0.3, 0.7, 0.3, 0.29, 235, 490))],
        r => [J(L([[0.58, 0], [0.08, 0], [0.05, 0.45]]), Qc([0.05, 0.45], [0.7, 0.35], [0.55, 0.8]), Qc([0.55, 0.8], [0.4, 1.02], [0.02, 0.9]))]],
    6: [r => [J(Qc([0.52, 0], [0.05, 0.25], [0.05, 0.7]), A(0.3, 0.72, 0.26, 0.27, 180, -175))],
        r => [J(L([[0.48, 0], [0.12, 0.55]]), A(0.3, 0.74, 0.25, 0.25, 200, -150))],
        r => [J(Qc([0.55, 0.05], [0.0, 0.2], [0.04, 0.75]), A(0.29, 0.74, 0.25, 0.25, 175, -185))]],
    7: [r => [J(L([[0, 0], [0.62, 0]]), L([[0.62, 0], [0.22, 1]]))],
        r => [J(L([[0, 0], [0.62, 0]]), L([[0.62, 0], [0.22, 1]])), L([[0.15, 0.5], [0.56, 0.5]])],      // crossed (kiểu 2)
        r => [J(L([[0, 0.12], [0, 0], [0.62, 0]]), Qc([0.62, 0], [0.4, 0.45], [0.3, 1]))],
        r => [L([[0, 0.02], [0.62, 0]]), L([[0.62, 0], [0.25, 1]])]],
    8: [r => [Array.from({ length: 49 }, (_, i) => { const t = i / 48 * 2 * Math.PI; return [0.31 - 0.27 * Math.sin(2 * t), 0.5 - 0.5 * Math.cos(t)]; })],
        r => [A(0.31, 0.25, 0.22, 0.25, 0, 360), A(0.31, 0.74, 0.28, 0.26, 0, 360)],
        r => [J(A(0.3, 0.25, 0.22, 0.24, 90, 380), A(0.3, 0.74, 0.28, 0.26, 270, -60))]],
    9: [r => [J(A(0.3, 0.28, 0.27, 0.28, -10, -370), L([[0.57, 0.25], [0.55, 1]]))],                  // vòng cong + nét thẳng (SGK)
        r => [J(A(0.3, 0.28, 0.27, 0.27, 0, -360), Qc([0.57, 0.3], [0.55, 0.8], [0.25, 1]))],
        r => [A(0.3, 0.28, 0.27, 0.28, 0, 360), L([[0.57, 0.15], [0.56, 1]])],                          // two strokes
        r => [J(A(0.3, 0.3, 0.3, 0.3, 20, -340), L([[0.6, 0.35], [0.6, 1]]))]],
  };
  const MIRROR = new Set(['3', '7', '9']);   // children often write these mirrored

  function sample(d, rng, size) {
    size = size || 90;
    const r = () => rng() - 0.5;
    const st = STYLES[d][Math.floor(rng() * STYLES[d].length)](r);
    const mirror = MIRROR.has(String(d)) && rng() < 0.12;
    const slant = r() * 0.5, sx = 0.75 + rng() * 0.55, rot = r() * 0.2;
    // smooth wobble: two low-frequency waves
    const f1 = 2 + rng() * 3, f2 = 2 + rng() * 3, ph1 = rng() * 6, ph2 = rng() * 6, amp = 0.025 + rng() * 0.03;
    return st.map(s => {
      let pts = s.map(([x, y]) => [mirror ? 0.6 - x : x, y]);
      if (rng() < 0.3) pts = pts.reverse();                       // stroke direction varies
      return pts.map(([x, y]) => {
        let X = x + slant * (0.5 - y) + amp * Math.sin(f1 * y + ph1), Y = y + amp * Math.sin(f2 * x + ph2);
        const cx = X - 0.3, cy = Y - 0.5; X = 0.3 + cx * Math.cos(rot) - cy * Math.sin(rot); Y = 0.5 + cx * Math.sin(rot) + cy * Math.cos(rot);
        return { x: 20 + X * sx * size + r() * 1.5, y: 20 + Y * size + r() * 1.5 };
      });
    });
  }
  function confusion(n, seed) {
    let s = seed || 1; const rng = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const matrix = {}; let ok = 0, tot = 0;
    for (let k = 0; k < n; k++) for (let d = 0; d <= 9; d++) {
      const got = window.Hand.recognize(sample(d, rng, 60 + rng() * 80))[0].d;
      tot++; if (got === String(d)) ok++; else matrix[d + '→' + got] = (matrix[d + '→' + got] || 0) + 1;
    }
    const worst = Object.entries(matrix).sort((a, b) => b[1] - a[1]).slice(0, 12);
    return { accuracy: Math.round(ok / tot * 1000) / 10 + '%', samples: tot, worst };
  }
  window.HandStyles = { sample, confusion, STYLES };
})();
