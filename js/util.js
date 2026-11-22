/* Shared helpers for content generators and visuals. Loaded first.
 * Vietnamese number conventions (SGK GDPT 2018):
 *   - thousands grouped with a space: 12 345 (we use a narrow no-break space U+202F)
 *   - decimal comma: 3,5
 *   - multiplication "×", division ":"
 */
(function () {
  'use strict';
  const NBSP = ' ';

  /** Seeded PRNG (mulberry32). rng() -> float in [0,1). */
  function makeRng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Integer in [a, b] inclusive. */
  function rand(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    const r = arr.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }
  /** k distinct items from arr. */
  function sample(rng, arr, k) { return shuffle(rng, arr).slice(0, k); }

  /** Round to n decimals without float noise. */
  function round(x, n = 0) { const p = Math.pow(10, n); return Math.round((x + Number.EPSILON) * p) / p; }

  /**
   * Format a number the Vietnamese way: 12 345 ; 3,25 ; -7.
   * 4-digit integers stay ungrouped (2345); grouping by space starts at 10 000.
   */
  function fmt(x, decimals) {
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    let s = decimals == null ? String(round(x, 6)) : round(x, decimals).toFixed(decimals);
    let neg = s[0] === '-'; if (neg) s = s.slice(1);
    let [int, dec] = s.split('.');
    if (int.length > 4) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return (neg ? '-' : '') + int + (dec ? ',' + dec : '');
  }

  /** Parse a kid's keypad string ("3,5", "12 345", "1/2") into a number (fractions -> value). */
  function parseNum(str) {
    if (str == null) return NaN;
    const s = String(str).replace(/[\s ]/g, '').replace(',', '.');
    if (s.includes('/')) { const [n, d] = s.split('/').map(Number); return d ? n / d : NaN; }
    return s === '' ? NaN : Number(s);
  }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
  function simplify(n, d) { const g = gcd(n, d); return [n / g, d / g]; }

  /**
   * Build a multiple-choice answer. correct: value; distractors: array of values (duplicates / equal to
   * correct are removed). Returns {kind:'choice', options:[...strings], correct:index}.
   * Values are formatted with fmt() if numbers. Pass `format` to override.
   */
  function choices(rng, correct, distractors, format) {
    const f = format || (v => (typeof v === 'number' ? fmt(v) : String(v)));
    const c = f(correct);
    const seen = new Set([c]);
    const opts = [c];
    for (const d of distractors) {
      const s = f(d);
      if (!seen.has(s) && opts.length < 4) { seen.add(s); opts.push(s); }
    }
    const sh = shuffle(rng, opts);
    return { kind: 'choice', options: sh, correct: sh.indexOf(c) };
  }

  /** Numeric distractors near a value (never negative unless allowNeg). */
  function near(rng, v, spread = 3, count = 3, allowNeg = false) {
    const out = new Set();
    let guard = 0;
    while (out.size < count && guard++ < 100) {
      let d = rand(rng, 1, spread) * (rng() < 0.5 ? -1 : 1);
      const x = v + d;
      if ((allowNeg || x >= 0) && x !== v) out.add(x);
    }
    return [...out];
  }

  /** Vietnamese names / contexts for word problems (kid-friendly, local). */
  const NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Hùng', 'Lan', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Phúc', 'Quân', 'Thảo', 'Trang', 'Tú', 'Việt', 'Vy'];

  window.U = { NBSP, makeRng, rand, pick, shuffle, sample, round, fmt, parseNum, gcd, lcm, simplify, choices, near, NAMES };
})();
