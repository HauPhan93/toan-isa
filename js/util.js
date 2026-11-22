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

  /* ---- Language (Góc phụ huynh → Ngôn ngữ / Language) ----
   * 'vi' (default) or 'en'. Read once when the app loads; changing it in Góc phụ huynh reloads the app, so
   * content can pick its strings while it is built: L('Vietnamese', 'English'). `?lang=en` in the URL
   * overrides it (tests). Maths notation stays as in the SGK in both languages (12 345 · 3,5 · × · :). */
  let LANG = 'vi';
  try {
    const q = /[?&]lang=(en|vi)\b/.exec(location.search);
    if (q) LANG = q[1];
    else { const st = JSON.parse(localStorage.getItem('toanisa.v1') || '{}'); if (st && st.settings && st.settings.lang === 'en') LANG = 'en'; }
  } catch (e) { /* private mode: Vietnamese */ }
  const EN = LANG === 'en';
  if (EN) document.documentElement.lang = 'en';
  /** The string for the current language; falls back to Vietnamese when no English is given. */
  function L(vi, en) { return EN && en != null ? en : vi; }

  /** English number words (British style): 345 → "three hundred and forty-five", 3.25 → "three point two five". */
  const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function en99(n) { return n < 20 ? EN_ONES[n] : EN_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + EN_ONES[n % 10] : ''); }
  function en999(n) {
    const hd = Math.floor(n / 100), r = n % 100;
    if (!hd) return en99(r);
    return EN_ONES[hd] + ' hundred' + (r ? ' and ' + en99(r) : '');
  }
  function readEN(x) {
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    if (x < 0) return 'minus ' + readEN(-x);
    const s = String(round(x, 6)), [ip, dp] = s.split('.');
    let n = Number(ip), words;
    if (n === 0) words = 'zero';
    else {
      const un = ['', ' thousand', ' million', ' billion'], g = [];
      while (n > 0) { g.push(n % 1000); n = Math.floor(n / 1000); }
      const parts = [];
      for (let k = g.length - 1; k >= 0; k--) {
        if (!g[k]) continue;
        // "two thousand and five": the last group under 100 after a bigger group takes "and"
        parts.push((k === 0 && g.length > 1 && g[k] < 100 ? 'and ' : '') + en999(g[k]) + un[k]);
      }
      words = parts.join(' ');
    }
    if (dp) words += ' point ' + dp.split('').map(d => EN_ONES[Number(d)]).join(' ');
    return words;
  }

  window.U = { NBSP, makeRng, rand, pick, shuffle, sample, round, fmt, parseNum, gcd, lcm, simplify, choices, near, NAMES, LANG, EN, L, readEN };
})();
