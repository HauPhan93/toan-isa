/* Toán ISA — Lớp 1 (SGK Toán 1 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; "Luyện tập chung", "Ôn tập", hands-on "Thực hành lắp ghép, xếp hình"
 * and "Tiết học đầu tiên" are skipped. Ids: g1-c{chủ đề index}-b{Bài number}. Never rename ids.
 * The child is 6: very short prompts, always a picture, big-number choices, numbers 0–100,
 * + / − within 10 in HK1 and within 100 without carrying (không nhớ) in HK2.
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const R = U.rand, P = U.pick;
  const M = '−'; // real minus sign U+2212

  // ---------- small helpers ----------
  const lv = i => (i < 3 ? 0 : i < 7 ? 1 : 2);
  const vz = (type, params) => ({ type, params });
  const num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });
  const cmpAns = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b ? 0 : a > b ? 1 : 2 });
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const nm = rng => P(rng, U.NAMES);
  /** Choice with fixed option order (e.g. ['Nhiều hơn', 'Ít hơn', 'Bằng nhau']). */
  const fixed = (options, correct) => ({ kind: 'choice', options, correct: options.indexOf(correct) });
  /** Number choice: correct + near distractors in [lo, hi], shown in increasing order (big number buttons). */
  function nCh(rng, n, lo, hi, f, step) {
    const s = step || 1;
    const cand = U.shuffle(rng, [n - s, n + s]).concat(U.shuffle(rng, [n - 2 * s, n + 2 * s, n + 3 * s, n - 3 * s, n + 10, n - 10, n + 1, n - 1]));
    const set = [n];
    for (const c of cand) if (c >= lo && c <= hi && !set.includes(c) && set.length < 4) set.push(c);
    set.sort((a, b) => a - b);
    const fm = f || (x => String(x));
    return { kind: 'choice', options: set.map(fm), correct: set.indexOf(n) };
  }
  /** Read-aloud text for prompts with maths symbols. */
  function say(s) {
    return s.replace(/(^|\s)\?(?=\s|$)/gm, '$1mấy').replace(/\+/g, ' cộng ').replace(/−/g, ' trừ ').replace(/=/g, ' bằng ')
      .replace(/…/g, ' chấm chấm ').replace(/</g, ' bé hơn ').replace(/>/g, ' lớn hơn ').replace(/\n/g, '. ').replace(/\s+/g, ' ').trim();
  }
  function Q(prompt, visual, answer, hint, explain, extra) {
    const q = { prompt, answer, hint, explain };
    if (visual) q.visual = visual;
    if (/[+−=…<>]/.test(prompt) || /(^|\s)\?(\s|$)/m.test(prompt)) q.speak = say(prompt);
    return Object.assign(q, extra || {});
  }
  function noCarry(a, b) { while (a > 0 || b > 0) { if (a % 10 + b % 10 >= 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function noBorrow(a, b) { while (b > 0) { if (a % 10 < b % 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function pairWhere(rng, ra, rb, ok, fb) {
    for (let g = 0; g < 600; g++) {
      const a = R(rng, ra[0], ra[1]), b = R(rng, rb[0], rb[1]);
      if (ok(a, b)) return [a, b];
    }
    return fb;
  }

  const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function readVN(n) {
    if (n === 100) return 'một trăm';
    if (n < 10) return DIG[n];
    const t = Math.floor(n / 10), o = n % 10, out = [t === 1 ? 'mười' : DIG[t] + ' mươi'];
    if (o === 1) out.push(t === 1 ? 'một' : 'mốt');
    else if (o === 4) out.push(t === 1 ? 'bốn' : 'tư');
    else if (o === 5) out.push('lăm');
    else if (o > 0) out.push(DIG[o]);
    return out.join(' ');
  }

  const ITEMS = [
    { n: 'con cá', e: '🐟' }, { n: 'quả táo', e: '🍎' }, { n: 'con gà', e: '🐔' }, { n: 'bông hoa', e: '🌸' },
    { n: 'quả bóng', e: '⚽' }, { n: 'ngôi sao', e: '⭐' }, { n: 'con vịt', e: '🦆' }, { n: 'cái kẹo', e: '🍬' },
    { n: 'quả cam', e: '🍊' }, { n: 'con bướm', e: '🦋' }, { n: 'con thỏ', e: '🐰' }, { n: 'quả bóng bay', e: '🎈' },
    { n: 'cái bút chì', e: '✏️' }, { n: 'chiếc lá', e: '🍃' }, { n: 'con ốc', e: '🐌' }, { n: 'quả dâu', e: '🍓' },
  ];
  const obj = (e, n) => vz('objects', { groups: [{ emoji: e, count: n }] });
  const line10 = (extra) => vz('numberLine', Object.assign({ min: 0, max: 10, step: 1, labelEvery: 1 }, extra || {}));

  function lesson(c, b, title, story, learn, gen, more) {
    return Object.assign({ id: `g1-c${c}-b${b}`, title, book: `Bài ${b}`, story, learn, gen }, more || {});
  }

  // ============ CHỦ ĐỀ 1. CÁC SỐ TỪ 0 ĐẾN 10 ============
  function countGen(lo, hi) {
    return function (rng, i) {
      const L = lv(i), f = i % 5, it = P(rng, ITEMS);
      const a = L === 2 && lo === 0 && R(rng, 0, 3) === 0 ? 0 : Math.max(lo, 1);
      const n = R(rng, a, L === 0 ? Math.min(hi, Math.max(lo, 1) + 2) : hi);
      if (f === 0) return Q(`Có mấy ${it.n}?`, obj(it.e, n), nCh(rng, n, 0, 10), 'Em chạm tay vào từng hình và đếm: một, hai, ba…', n === 0 ? `Không có ${it.n} nào. Ta viết số 0.` : `Đếm được ${n} ${it.n}.`);
      if (f === 1) {
        const opts = [n, n + 1, n - 1, n + 2].filter(x => x >= 1 && x <= 10).slice(0, 3);
        if (opts.length < 2) opts.push(n + 2);
        const strs = opts.map(k => it.e.repeat(k));
        return Q(`Nhóm nào có ${n} ${it.n}?`, line10({ max: hi <= 5 ? 5 : 10, point: n }),U.choices(rng, strs[0], strs.slice(1)), `Đếm từng nhóm, tìm nhóm có đúng ${n}.`, `Nhóm có ${n} ${it.n} là nhóm đúng.`);
      }
      if (f === 2) {
        const max = hi <= 5 ? 5 : 10;
        const u = R(rng, lo === 0 ? 0 : 5, max);
        return Q('Số nào còn thiếu trên tia số?', vz('numberLine', { min: 0, max, step: 1, labelEvery: 1, unknown: u, marks: [] }), nCh(rng, u, 0, 10), 'Đếm từ 0 theo tia số: 0, 1, 2, …', `Số còn thiếu là ${u}.`);
      }
      if (f === 3) {
        const m = n === 0 ? R(rng, lo + 1, hi) : n;
        const e = P(rng, ['🔴', '🟡', '🔵', '🟢']);
        return Q('Đếm rồi viết số:\nCó mấy chấm tròn?', obj(e, m), num(m), 'Đếm từ trái sang phải, từng hàng một.', `Có ${m} chấm tròn.`);
      }
      // f === 4: counting order, or tap a number on the line
      if (i === 9 || (i === 4 && hi > 5)) {
        const t = R(rng, Math.max(lo, 1), hi);
        return Q(`Chạm vào số ${t} trên tia số.`, line10({ max: hi <= 5 ? 5 : 10 }), { kind: 'visual', check: v => v === t }, `Tìm số ${t} ở dưới tia số.`, `Số ${t} đây rồi!`);
      }
      const back = L === 2 && R(rng, 0, 1) === 1;
      const top = hi - 3;
      const s0 = R(rng, Math.max(0, lo - 1), Math.max(0, top));
      const seq = [0, 1, 2, 3].map(k => s0 + k);
      if (back) seq.reverse();
      const miss = R(rng, 1, 3);
      const shown = seq.map((v, k) => (k === miss ? '?' : String(v))).join(', ');
      return Q(`Đếm ${back ? 'lùi' : 'tiếp'}:\n${shown}`, line10({ max: hi <= 5 ? 5 : 10, marks: seq.filter((_, k) => k !== miss) }), nCh(rng, seq[miss], 0, 10), back ? 'Đếm lùi: mỗi lần bớt 1.' : 'Đếm tiếp: mỗi lần thêm 1.', `${seq.join(', ')}.`);
    };
  }

  const PAIRS = [
    { a: '🐰', an: 'con thỏ', b: '🥕', bn: 'củ cà rốt' }, { a: '☕', an: 'cái cốc', b: '🥄', bn: 'cái thìa' },
    { a: '🐝', an: 'con ong', b: '🌸', bn: 'bông hoa' }, { a: '🐶', an: 'con chó', b: '🦴', bn: 'khúc xương' },
    { a: '🐵', an: 'con khỉ', b: '🍌', bn: 'quả chuối' }, { a: '👧', an: 'bạn nhỏ', b: '🎈', bn: 'quả bóng bay' },
    { a: '🐔', an: 'con gà', b: '🥚', bn: 'quả trứng' },
  ];
  const cap = s0 => s0[0].toUpperCase() + s0.slice(1);
  const MORE3 = ['Nhiều hơn', 'Ít hơn', 'Bằng nhau'];

  const c1 = {
    id: 'g1-c1', semester: 1, title: 'Các số từ 0 đến 10', icon: '🔢', lessons: [
      lesson(1, 1, 'Các số 0, 1, 2, 3, 4, 5',
        'Rô-bốt ISA cùng bạn Mai đếm những chú cá vàng trong bể cá ở nhà bà.',
        [
          { text: 'Đếm: một, hai, ba. Có 3 con cá.', visual: obj('🐟', 3) },
          { text: 'Đĩa không có quả táo nào. Ta viết số 0.', visual: obj('🍎', 0) },
          { text: 'Các số 0, 1, 2, 3, 4, 5.', visual: vz('numberLine', { min: 0, max: 5, step: 1, labelEvery: 1 }) },
        ],
        countGen(0, 5)),

      lesson(1, 2, 'Các số 6, 7, 8, 9, 10',
        'Rô-bốt ISA giúp bạn Nam đếm những chú gà con chạy quanh sân nhà ông.',
        [
          { text: 'Có 6 con gà. Đếm: …, năm, sáu.', visual: obj('🐔', 6) },
          { text: 'Có 10 ngôi sao. Số 10 có hai chữ số.', visual: obj('⭐', 10) },
          { text: 'Các số từ 0 đến 10.', visual: line10() },
        ],
        countGen(6, 10)),

      lesson(1, 3, 'Nhiều hơn, ít hơn, bằng nhau',
        'Rô-bốt ISA và bạn Chi chia cà rốt cho đàn thỏ trong vườn.',
        [
          { text: 'Mỗi con thỏ một củ cà rốt. Còn thừa thỏ: số thỏ nhiều hơn.', visual: vz('objects', { groups: [{ emoji: '🐰', count: 4, label: 'Thỏ' }, { emoji: '🥕', count: 3, label: 'Cà rốt' }] }) },
          { text: 'Số cà rốt ít hơn số thỏ.', visual: vz('objects', { groups: [{ emoji: '🐰', count: 4, label: 'Thỏ' }, { emoji: '🥕', count: 3, label: 'Cà rốt' }] }) },
          { text: 'Mỗi cốc một cái thìa, không thừa: số cốc bằng số thìa.', visual: vz('objects', { groups: [{ emoji: '☕', count: 3, label: 'Cốc' }, { emoji: '🥄', count: 3, label: 'Thìa' }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, pr = P(rng, PAIRS);
          const hi = L === 0 ? 5 : 7;
          let x = R(rng, 1, hi), y = R(rng, 1, hi);
          const wantEq = f === 3 ? R(rng, 0, 1) === 0 : false;
          if (wantEq) y = x;
          else if (x === y && f !== 3) y = x === 1 ? 2 : x - 1;
          const two = vz('objects', { groups: [{ emoji: pr.a, count: x, label: cap(pr.an) }, { emoji: pr.b, count: y, label: cap(pr.bn) }] });
          const res = x > y ? 'Nhiều hơn' : x < y ? 'Ít hơn' : 'Bằng nhau';
          const why = x === y ? `Ghép từng cặp, không thừa. Số ${pr.an} bằng số ${pr.bn}.`
            : x > y ? `Ghép từng cặp, còn thừa ra ${pr.an}. Số ${pr.an} nhiều hơn số ${pr.bn}.`
              : `Ghép từng cặp, còn thừa ra ${pr.bn}. Số ${pr.an} ít hơn số ${pr.bn}.`;
          const hint = 'Ghép từng cặp một. Bên nào còn thừa thì bên đó nhiều hơn.';
          if (f === 0 || (f === 4 && L === 0)) return Q(`Số ${pr.an} nhiều hơn hay ít hơn số ${pr.bn}?`, two, fixed(MORE3, res), hint, why);
          if (f === 1 || f === 2) {
            const it = P(rng, ITEMS);
            let a = R(rng, 1, hi), b = R(rng, 1, hi);
            if (a === b) b = a === 1 ? 3 : a - 1;
            const more = f === 1;
            const ans = (more ? a > b : a < b) ? 'Bên trái' : 'Bên phải';
            return Q(`Bên nào ${more ? 'nhiều' : 'ít'} ${it.n} hơn?`, vz('compare', { left: { emoji: it.e, count: a }, right: { emoji: it.e, count: b } }), fixed(['Bên trái', 'Bên phải'], ans), hint, `Bên trái có ${a}, bên phải có ${b}. ${ans} ${more ? 'nhiều' : 'ít'} hơn.`);
          }
          if (f === 3) return Q(`Số ${pr.an} so với số ${pr.bn} thì thế nào?`, two, fixed(MORE3, res), hint, why);
          // f === 4, L >= 1: how many more to make equal
          let big = R(rng, 3, hi), small = big - R(rng, 1, 2);
          return Q(`Cần thêm mấy ${pr.bn} để mỗi ${pr.an} đều có một ${pr.bn}?`, vz('objects', { groups: [{ emoji: pr.a, count: big, label: cap(pr.an) }, { emoji: pr.b, count: small, label: cap(pr.bn) }] }), num(big - small), hint, `Còn ${big - small} ${pr.an} chưa có ${pr.bn}. Cần thêm ${big - small}.`);
        }),

      lesson(1, 4, 'So sánh số',
        'Rô-bốt ISA cùng bạn Bình so xem rổ nào có nhiều quả cam hơn ở chợ quê.',
        [
          { text: '3 bé hơn 5. Viết: 3 < 5.', visual: vz('compare', { left: { emoji: '🍊', count: 3 }, right: { emoji: '🍊', count: 5 }, show: true }) },
          { text: '6 lớn hơn 4. Viết: 6 > 4.', visual: vz('compare', { left: 6, right: 4, show: true }) },
          { text: '4 bằng 4. Viết: 4 = 4.', visual: vz('compare', { left: 4, right: 4, show: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, hi = L === 0 ? 5 : 10;
          let a = R(rng, 0, hi), b = R(rng, 0, hi);
          if (a === b && R(rng, 0, 2) > 0) b = a === hi ? a - 1 : a + 1;
          const hintS = 'Số nào đứng sau trên tia số thì lớn hơn.';
          if (f === 0) {
            const it = P(rng, ITEMS);
            return Q(`Chọn dấu: ${a} … ${b}`, vz('compare', { left: { emoji: it.e, count: a }, right: { emoji: it.e, count: b } }), cmpAns(a, b), 'Đếm hai bên. Bên nào nhiều hơn thì số đó lớn hơn.', `${a} ${sign(a, b)} ${b}.`);
          }
          if (f === 1) return Q(`Chọn dấu: ${a} … ${b}`, vz('compare', { left: a, right: b }), cmpAns(a, b), hintS, `${a} ${sign(a, b)} ${b}.`, { hintVisual: line10({ marks: [a, b] }) });
          if (f === 2) {
            if (a === b) b = a === hi ? a - 1 : a + 1;
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(a, b) : Math.min(a, b);
            return Q(`Số nào ${big ? 'lớn' : 'bé'} hơn?`, vz('compare', { left: a, right: b }), fixed([String(a), String(b)], String(ans)), hintS, `${Math.min(a, b)} < ${Math.max(a, b)}. Số ${big ? 'lớn' : 'bé'} hơn là ${ans}.`, { hintVisual: line10({ marks: [a, b] }) });
          }
          if (f === 3) {
            const arr = U.sample(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, hi + 1), 3);
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(...arr) : Math.min(...arr);
            return Q(`Số nào ${big ? 'lớn nhất' : 'bé nhất'}: ${arr.join(', ')}?`, line10({ marks: arr }), fixed(arr.map(String), String(ans)), big ? 'Số lớn nhất đứng xa nhất về bên phải tia số.' : 'Số bé nhất đứng gần số 0 nhất.', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`);
          }
          const k = R(rng, 3, Math.max(4, hi - 1));
          const less = R(rng, 0, 1) === 1;
          const good = less ? R(rng, 0, k - 1) : R(rng, k + 1, Math.max(k + 1, hi));
          const pool = (less ? [k, k + 1, k + 2, k + 3, k + 4] : [k, k - 1, k - 2, k - 3, k - 4]).filter(x => x >= 0 && x <= 10);
          return Q(`Số nào ${less ? 'bé' : 'lớn'} hơn ${k}?`, line10({ marks: [k] }), U.choices(rng, good, U.sample(rng, pool, 3)), less ? `Tìm số đứng trước ${k} trên tia số.` : `Tìm số đứng sau ${k} trên tia số.`, `${good} ${less ? '<' : '>'} ${k}.`);
        }),

      lesson(1, 5, 'Mấy và mấy',
        'Rô-bốt ISA và bạn Lan xếp hoa hồng, hoa cúc vào lọ để tặng cô giáo.',
        [
          { text: '5 gồm 2 và 3.', visual: vz('objects', { groups: [{ emoji: '🔴', count: 2, label: 2 }, { emoji: '🔵', count: 3, label: 3 }] }) },
          { text: '6 gồm 4 và 2.', visual: vz('objects', { groups: [{ emoji: '🌹', count: 4, label: 4 }, { emoji: '🌼', count: 2, label: 2 }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const n = L === 0 ? R(rng, 2, 5) : L === 1 ? R(rng, 4, 8) : R(rng, 6, 10);
          const a = R(rng, 1, n - 1), b = n - a;
          const [ea, eb] = P(rng, [['🔴', '🔵'], ['🌹', '🌼'], ['🍎', '🍏'], ['🐔', '🐥'], ['🚗', '🚌'], ['🟡', '🟢']]);
          const both = vz('objects', { groups: [{ emoji: ea, count: a }, { emoji: eb, count: b }] });
          if (f === 0) return Q(`${a} và ${b} là mấy?`, both, nCh(rng, n, 0, 10), `Đếm tất cả các hình.`, `${a} và ${b} là ${n}.`);
          if (f === 1) return Q(`${n} gồm ${a} và mấy?`, both, num(b), `Đếm nhóm thứ hai.`, `${n} gồm ${a} và ${b}.`);
          if (f === 2) {
            const right = `${a} và ${b}`;
            const wrong = [`${a} và ${b + 1}`, `${a + 1} và ${b + 1}`, `${Math.max(0, a - 1)} và ${b}`, `${b} và ${b}`].filter(s => {
              const [p1, p2] = s.split(' và ').map(Number); return p1 + p2 !== n;
            });
            return Q(`${n} gồm mấy và mấy?`, both, U.choices(rng, right, wrong), 'Đếm từng nhóm màu.', `${n} gồm ${a} và ${b}.`);
          }
          if (f === 3) {
            return Q(`? và ${b} là ${n}`, vz('objects', { groups: [{ emoji: '❔', count: 1, label: '?' }, { emoji: eb, count: b, label: b }] }), num(a), `Đếm thêm từ ${b} cho đến ${n}: được mấy lần?`, `${a} và ${b} là ${n}.`, { hintVisual: both });
          }
          const ok = R(rng, 0, 1) === 1, shownB = ok ? b : (b + 1 <= 10 ? b + 1 : b - 1);
          return Q(`${n} gồm ${a} và ${shownB}. Đúng hay sai?`, both, fixed(['Đúng', 'Sai'], ok ? 'Đúng' : 'Sai'), 'Đếm từng nhóm rồi đếm tất cả.', `${n} gồm ${a} và ${b}.` + (ok ? '' : ` Không phải ${a} và ${shownB}.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 2. LÀM QUEN VỚI MỘT SỐ HÌNH PHẲNG ============
  const SH = { square: 'Hình vuông', circle: 'Hình tròn', triangle: 'Hình tam giác', rect: 'Hình chữ nhật' };
  const SHK = Object.keys(SH);
  const shOpts = ['Hình vuông', 'Hình tròn', 'Hình tam giác', 'Hình chữ nhật'];
  const low = s => s[0].toLowerCase() + s.slice(1);
  const REAL = [
    { e: '🕒', n: 'Mặt đồng hồ', k: 'circle' }, { e: '🍪', n: 'Chiếc bánh quy', k: 'circle' }, { e: '🛞', n: 'Bánh xe', k: 'circle' },
    { e: '🎲', n: 'Mặt con xúc xắc', k: 'square' }, { e: '🪟', n: 'Ô cửa sổ', k: 'square' },
    { e: '📺', n: 'Màn hình ti vi', k: 'rect' }, { e: '🚪', n: 'Cánh cửa', k: 'rect' }, { e: '📗', n: 'Quyển sách', k: 'rect' },
    { e: '⚠️', n: 'Biển báo', k: 'triangle' }, { e: '🍙', n: 'Nắm cơm', k: 'triangle' },
  ];
  function shapeItems(rng, n, target, others) {
    const cnt = R(rng, 1, Math.min(3, n - 1));
    const kinds = [];
    for (let k = 0; k < cnt; k++) kinds.push(target);
    while (kinds.length < n) kinds.push(P(rng, others));
    return U.shuffle(rng, kinds).map(k => (k === 'triangle' && R(rng, 0, 1) ? { kind: k, rot: P(rng, [180, 90, -90]) } : { kind: k }));
  }

  const c2 = {
    id: 'g1-c2', semester: 1, title: 'Làm quen với một số hình phẳng', icon: '🔺', lessons: [
      lesson(2, 7, 'Hình vuông, hình tròn, hình tam giác, hình chữ nhật',
        'Rô-bốt ISA cùng bạn Hà tìm các hình trong lớp học: ô cửa sổ, mặt đồng hồ, lá cờ.',
        [
          { text: 'Hình vuông, hình tròn, hình tam giác, hình chữ nhật.', visual: vz('shapeSet', { items: ['square', 'circle', 'triangle', 'rect'] }) },
          { text: 'Hình tam giác có 3 cạnh.', visual: vz('shape', { kind: 'triangle' }) },
          { text: 'Hình chữ nhật có 2 cạnh dài và 2 cạnh ngắn.', visual: vz('shape', { kind: 'rect' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          if (f === 0) {
            const k = P(rng, SHK);
            return Q('Đây là hình gì?', vz('shape', { kind: k }), fixed(shOpts, SH[k]), k === 'circle' ? 'Hình này tròn, không có cạnh thẳng.' : 'Đếm số cạnh của hình.', `Đây là ${low(SH[k])}.`);
          }
          if (f === 1 || f === 4) {
            const target = f === 4 && L >= 1 ? P(rng, ['rect', 'square']) : P(rng, SHK);
            const others = f === 4 && L >= 1 ? [target === 'rect' ? 'square' : 'rect', 'circle'] : SHK.filter(k => k !== target);
            const items = shapeItems(rng, L === 0 ? 4 : L === 1 ? 5 : 6, target, others);
            const want = items.map((it, j) => (it.kind === target ? j : -1)).filter(j => j >= 0);
            return Q(`Chạm vào tất cả các ${low(SH[target])}.`, vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) },
              target === 'square' ? 'Hình vuông có 4 cạnh dài bằng nhau.' : target === 'rect' ? 'Hình chữ nhật có 2 cạnh dài, 2 cạnh ngắn.' : target === 'triangle' ? 'Hình tam giác có 3 cạnh.' : 'Hình tròn không có cạnh thẳng.',
              `Có ${want.length} ${low(SH[target])}.`);
          }
          if (f === 2) {
            const target = P(rng, SHK);
            const items = shapeItems(rng, L === 0 ? 4 : L === 1 ? 6 : 8, target, SHK.filter(k => k !== target));
            const c = items.filter(it => it.kind === target).length;
            return Q(`Có mấy ${low(SH[target])}?`, vz('shapeSet', { items }), nCh(rng, c, 0, 8), 'Chỉ tay vào từng hình và đếm.', `Có ${c} ${low(SH[target])}.`);
          }
          const r = P(rng, REAL);
          return Q(`${r.n} có dạng hình gì?`, obj(r.e, 1), fixed(shOpts, SH[r.k]), 'Nhìn kĩ đường viền của đồ vật.', `${r.n} có dạng ${low(SH[r.k])}.`, { hintVisual: vz('shapeSet', { items: SHK }) });
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. PHÉP CỘNG, PHÉP TRỪ TRONG PHẠM VI 10 ============
  function addPair(rng, L) {
    const s = L === 0 ? R(rng, 2, 5) : L === 1 ? R(rng, 4, 8) : R(rng, 5, 10);
    const a = R(rng, 1, s - 1);
    return [a, s - a];
  }
  function subPair(rng, L) {
    const a = L === 0 ? R(rng, 2, 5) : L === 1 ? R(rng, 4, 8) : R(rng, 5, 10);
    return [a, R(rng, 1, a - 1)];
  }
  const hopsOf = (from, k, dir) => Array.from({ length: k }, (_, j) => ({ from: from + dir * j, to: from + dir * (j + 1), label: dir > 0 ? '+1' : M + '1' }));

  const ADD_STORIES = [
    (a, b, n) => ({ t: `Có ${a} con vịt dưới ao. Thêm ${b} con nữa xuống ao. Có tất cả mấy con vịt?`, e: '🦆', u: 'con vịt' }),
    (a, b, n) => ({ t: `${n} có ${a} cái kẹo. Mẹ cho thêm ${b} cái. ${n} có mấy cái kẹo?`, e: '🍬', u: 'cái kẹo' }),
    (a, b, n) => ({ t: `Trên cành có ${a} con chim. ${b} con nữa bay đến. Có tất cả mấy con chim?`, e: '🐦', u: 'con chim' }),
    (a, b, n) => ({ t: `Lọ có ${a} bông hoa. ${n} cắm thêm ${b} bông. Lọ có mấy bông hoa?`, e: '🌸', u: 'bông hoa' }),
  ];
  const SUB_STORIES = [
    (a, b, n) => ({ t: `Có ${a} quả bóng bay. Bay mất ${b} quả. Còn lại mấy quả?`, e: '🎈', u: 'quả bóng bay' }),
    (a, b, n) => ({ t: `Đĩa có ${a} cái bánh. ${n} ăn ${b} cái. Còn lại mấy cái bánh?`, e: '🥮', u: 'cái bánh' }),
    (a, b, n) => ({ t: `Có ${a} con chim trên cành. ${b} con bay đi. Còn lại mấy con chim?`, e: '🐦', u: 'con chim' }),
    (a, b, n) => ({ t: `Rổ có ${a} quả cam. Mẹ lấy ra ${b} quả. Trong rổ còn mấy quả cam?`, e: '🍊', u: 'quả cam' }),
  ];

  const c3 = {
    id: 'g1-c3', semester: 1, title: 'Phép cộng, phép trừ trong phạm vi 10', icon: '➕', lessons: [
      lesson(3, 10, 'Phép cộng trong phạm vi 10',
        'Rô-bốt ISA cùng bạn Minh đếm đàn vịt bơi về ao làng.',
        [
          { text: '3 con vịt thêm 2 con vịt là 5 con vịt: 3 + 2 = 5.', visual: vz('objects', { groups: [{ emoji: '🦆', count: 3 }, { emoji: '🦆', count: 2 }], op: '+' }) },
          { text: 'Đếm thêm trên tia số: từ 3, thêm 2 bước, đến 5.', visual: line10({ hops: hopsOf(3, 2, 1) }) },
          { text: 'Đổi chỗ hai số, kết quả không đổi: 2 + 3 = 3 + 2.', visual: vz('objects', { groups: [{ emoji: '🍎', count: 2 }, { emoji: '🍎', count: 3 }], op: '+' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, it = P(rng, ITEMS);
          let [a, b] = addPair(rng, L);
          if (i === 8 && R(rng, 0, 1)) { a = R(rng, 1, 9); b = 0; }
          const s = a + b;
          const pic = vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }], op: '+' });
          if (f === 0) return Q(`Có tất cả mấy ${it.n}?`, pic, num(s), `Đếm thêm từ ${a}.`, `${a} + ${b} = ${s}.`);
          if (f === 1) return Q(`${a} + ${b} = ?`, pic, nCh(rng, s, 0, 10), b === 0 ? 'Cộng với 0 thì số không đổi.' : `Đếm thêm ${b} từ ${a}.`, `${a} + ${b} = ${s}.`);
          if (f === 2) {
            const st = P(rng, ADD_STORIES)(a, b, nm(rng));
            return Q(st.t, vz('objects', { groups: [{ emoji: st.e, count: a }, { emoji: st.e, count: b }], op: '+' }), num(s), 'Thêm vào thì làm phép cộng.', `${a} + ${b} = ${s} (${st.u}).`);
          }
          if (f === 3) return Q(`${a} + ${b} = ?`, line10({ hops: hopsOf(a, b, 1), unknown: s }), nCh(rng, s, 0, 10), `Rô-bốt nhảy ${b} bước từ số ${a}.`, `Từ ${a} nhảy ${b} bước đến ${s}: ${a} + ${b} = ${s}.`);
          if (i === 9) {
            return Q(`${a} + ? = ${s}`, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: '❔', count: 1 }], op: '+' }), num(b), `Đếm thêm từ ${a} cho đến ${s}.`, `${a} + ${b} = ${s}.`, { hintVisual: pic });
          }
          const right = `${a} + ${b} = ${s}`;
          return Q('Phép tính nào đúng với hình?', pic, U.choices(rng, right, [`${a} + ${b} = ${s + 1}`, `${a} + ${b} = ${s - 1}`, `${a} + ${b + 1} = ${s}`, `${s} ${M} ${b} = ${a + 1}`]), 'Đếm từng nhóm, rồi đếm tất cả.', right + '.');
        }),

      lesson(3, 11, 'Phép trừ trong phạm vi 10',
        'Rô-bốt ISA và bạn Vy đếm xem còn mấy quả bóng bay sau khi gió thổi mất vài quả.',
        [
          { text: 'Có 5 quả bóng, bay mất 2 quả, còn 3 quả: 5 − 2 = 3.', visual: vz('objects', { groups: [{ emoji: '🎈', count: 5 }], crossOut: 2 }) },
          { text: 'Đếm lùi trên tia số: từ 5, lùi 2 bước, đến 3.', visual: line10({ hops: hopsOf(5, 2, -1) }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, it = P(rng, ITEMS);
          let [a, b] = subPair(rng, L);
          if (i === 8 && R(rng, 0, 1)) b = R(rng, 0, 1) ? 0 : a;
          const r = a - b;
          const pic = vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b });
          if (f === 0) return Q(`Còn lại mấy ${it.n}?`, pic, num(r), 'Đếm những hình không bị gạch.', `${a} ${M} ${b} = ${r}.`);
          if (f === 1) return Q(`${a} ${M} ${b} = ?`, pic, nCh(rng, r, 0, 10), b === 0 ? 'Trừ đi 0 thì số không đổi.' : b === a ? 'Bớt hết thì còn 0.' : 'Đếm những hình còn lại.', `${a} ${M} ${b} = ${r}.`);
          if (f === 2) {
            if (b === 0 || b === a) { b = Math.max(1, Math.min(a - 1, 2)); }
            const st = P(rng, SUB_STORIES)(a, b, nm(rng));
            return Q(st.t, vz('objects', { groups: [{ emoji: st.e, count: a }], crossOut: b }), num(a - b), 'Bớt đi thì làm phép trừ.', `${a} ${M} ${b} = ${a - b} (${st.u}).`);
          }
          if (f === 3) {
            if (b === 0) b = 1;
            return Q(`${a} ${M} ${b} = ?`, line10({ hops: hopsOf(a, b, -1), unknown: a - b }), nCh(rng, a - b, 0, 10), `Rô-bốt lùi ${b} bước từ số ${a}.`, `Từ ${a} lùi ${b} bước đến ${a - b}: ${a} ${M} ${b} = ${a - b}.`);
          }
          if (i === 9) return Q(`${a} ${M} ? = ${r}`, pic, num(b), 'Đếm những hình bị gạch.', `${a} ${M} ${b} = ${r}.`);
          const right = `${a} ${M} ${b} = ${r}`;
          return Q('Phép tính nào đúng với hình?', pic, U.choices(rng, right, [`${a} + ${b} = ${a + b}`, `${a} ${M} ${b} = ${r + 1}`, `${a} ${M} ${r} = ${b + 1}`, `${a} ${M} ${b} = ${Math.abs(r - 1)}`].filter(s => s !== right)), 'Có bao nhiêu? Gạch đi bao nhiêu? Còn lại bao nhiêu?', right + '.');
        }),

      lesson(3, 12, 'Bảng cộng, bảng trừ trong phạm vi 10',
        'Rô-bốt ISA cùng bạn Phúc chơi trò "đố nhanh" phép tính trên đường đi học.',
        [
          { text: 'Từ 4 + 3 = 7 ta có 7 − 3 = 4 và 7 − 4 = 3.', visual: vz('objects', { groups: [{ emoji: '🍬', count: 4 }, { emoji: '🍭', count: 3 }], op: '+' }) },
          { text: 'Các cặp số cộng lại bằng 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.', visual: vz('objects', { groups: [{ emoji: '🔴', count: 6 }, { emoji: '🔵', count: 4 }], op: '+' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const add = R(rng, 0, 1) === 1;
          const [a, b] = add ? addPair(rng, Math.max(1, L)) : subPair(rng, Math.max(1, L));
          const v = add ? a + b : a - b, op = add ? '+' : M;
          if (f === 0) return Q(`${a} ${op} ${b} = ?`, line10({ marks: [a] }), nCh(rng, v, 0, 10), add ? `Đếm thêm ${b} từ ${a} trên tia số.` : `Đếm lùi ${b} từ ${a} trên tia số.`, `${a} ${op} ${b} = ${v}.`, { hintVisual: line10({ hops: hopsOf(a, b, add ? 1 : -1) }) });
          if (f === 1) {
            const c = Math.max(0, Math.min(10, v + P(rng, [-1, 0, 1, 2, -2])));
            return Q(`Chọn dấu: ${a} ${op} ${b} … ${c}`, vz('compare', { left: `${a} ${op} ${b}`, right: c }), cmpAns(v, c), 'Tính phép tính trước rồi so sánh.', `${a} ${op} ${b} = ${v}, mà ${v} ${sign(v, c)} ${c}.`);
          }
          if (f === 2) {
            const k = R(rng, 4, 10);
            const x = R(rng, 1, k - 1);
            const good = R(rng, 0, 1) ? `${x} + ${k - x}` : `${Math.min(10, k + x)} ${M} ${Math.min(10, k + x) - k}`;
            const bad = [];
            for (let g = 0; g < 30 && bad.length < 3; g++) {
              const y = R(rng, 1, 9), z = R(rng, 0, 9);
              const e = R(rng, 0, 1) ? (y + z <= 10 && y + z !== k ? `${y} + ${z}` : null) : (y >= z && y - z !== k ? `${y} ${M} ${z}` : null);
              if (e && !bad.includes(e) && e !== good) bad.push(e);
            }
            return Q(`Phép tính nào có kết quả bằng ${k}?`, line10({ marks: [k] }), U.choices(rng, good, bad), 'Tính từng phép tính.', `${good} = ${k}.`);
          }
          if (f === 3) {
            const [x, y] = addPair(rng, Math.max(1, L)), s = x + y;
            return Q(`Biết ${x} + ${y} = ${s}.\nVậy ${s} ${M} ${y} = ?`, vz('objects', { groups: [{ emoji: '🍬', count: x }, { emoji: '🍭', count: y }], op: '+' }), nCh(rng, x, 0, 10), `Có ${s} cái kẹo, bớt ${y} cái kẹo mút thì còn mấy?`, `${s} ${M} ${y} = ${x}.`);
          }
          if (L === 2) {
            const [x, y] = addPair(rng, 2), s = x + y;
            if (R(rng, 0, 1)) return Q(`? + ${y} = ${s}`, line10({ marks: [s] }), num(x), `Lấy ${s} ${M} ${y}.`, `${x} + ${y} = ${s}.`);
            return Q(`${s} ${M} ? = ${x}`, line10({ marks: [s, x] }), num(y), `Từ ${x} đếm thêm đến ${s}.`, `${s} ${M} ${y} = ${x}.`);
          }
          const it = P(rng, ITEMS);
          const pic = add ? vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }], op: '+' }) : vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b });
          return Q(`${a} ${op} ${b} = ?`, pic, num(v), add ? 'Đếm tất cả.' : 'Đếm những hình không bị gạch.', `${a} ${op} ${b} = ${v}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. LÀM QUEN VỚI MỘT SỐ HÌNH KHỐI ============
  const SOL = { cube: 'Khối lập phương', box: 'Khối hộp chữ nhật' };
  const solOpts = ['Khối lập phương', 'Khối hộp chữ nhật'];
  const SOL_OBJ = [
    { e: '🎲', n: 'Con xúc xắc', k: 'cube' }, { e: '🧊', n: 'Viên đá lạnh', k: 'cube' },
    { e: '🧱', n: 'Viên gạch', k: 'box' }, { e: '🧃', n: 'Hộp sữa', k: 'box' }, { e: '🧰', n: 'Hộp đồ nghề', k: 'box' },
  ];
  const ANIMALS = [
    { e: '🐶', n: 'chó' }, { e: '🐱', n: 'mèo' }, { e: '🐰', n: 'thỏ' }, { e: '🐻', n: 'gấu' },
    { e: '🐸', n: 'ếch' }, { e: '🐷', n: 'lợn' }, { e: '🐵', n: 'khỉ' }, { e: '🐼', n: 'gấu trúc' },
  ];
  const rowViz = row => vz('objects', { groups: row.map(a => ({ emoji: a.e, count: 1, label: a.n })) });
  const an = a => `Con ${a.n} ${a.e}`;

  const c4 = {
    id: 'g1-c4', semester: 1, title: 'Làm quen với một số hình khối', icon: '🧊', lessons: [
      lesson(4, 14, 'Khối lập phương, khối hộp chữ nhật',
        'Rô-bốt ISA cùng bạn Quân xếp những khối gỗ thành ngôi nhà nhỏ.',
        [
          { text: 'Đây là khối lập phương.', visual: vz('solid', { kind: 'cube', showDims: false }) },
          { text: 'Đây là khối hộp chữ nhật.', visual: vz('solid', { kind: 'box', showDims: false }) },
          { text: 'Con xúc xắc có dạng khối lập phương. Viên gạch có dạng khối hộp chữ nhật.', visual: vz('objects', { groups: [{ emoji: '🎲', count: 1, label: 'Xúc xắc' }, { emoji: '🧱', count: 1, label: 'Viên gạch' }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          if (f === 0) {
            const k = P(rng, ['cube', 'box']);
            const p = k === 'box' ? { kind: 'box', dims: { l: R(rng, 5, 8), w: R(rng, 2, 3), h: R(rng, 2, 4) }, showDims: false } : { kind: 'cube', showDims: false };
            return Q('Đây là khối gì?', vz('solid', p), fixed(solOpts, SOL[k]), 'Khối lập phương có các mặt là hình vuông bằng nhau.', `Đây là ${low(SOL[k])}.`);
          }
          if (f === 1) {
            const o = P(rng, SOL_OBJ);
            return Q(`${o.n} có dạng khối gì?`, obj(o.e, 1), fixed(solOpts, SOL[o.k]), 'Khối lập phương: mọi mặt đều là hình vuông.', `${o.n} có dạng ${low(SOL[o.k])}.`, { hintVisual: vz('solid', { kind: o.k, showDims: false }) });
          }
          if (f === 2) {
            const h = L === 0 ? 1 : R(rng, 1, 2), l = L === 0 ? R(rng, 2, 4) : R(rng, 2, h === 2 ? 4 : 5);
            const n = l * h;
            return Q('Có mấy khối lập phương nhỏ?', vz('cubes', { l, w: 1, h }), nCh(rng, n, 1, 12), h > 1 ? 'Đếm hàng trên, rồi đếm hàng dưới.' : 'Đếm từ trái sang phải.', `Có ${n} khối lập phương nhỏ.`);
          }
          if (f === 3) {
            const a = R(rng, 1, L === 0 ? 3 : 5), b = R(rng, 1, L === 0 ? 3 : 5);
            const askCube = R(rng, 0, 1) === 1;
            return Q(`Có mấy đồ vật có dạng ${askCube ? 'khối lập phương' : 'khối hộp chữ nhật'}?`, vz('objects', { groups: [{ emoji: '🎲', count: a }, { emoji: '🧱', count: b }] }), num(askCube ? a : b), askCube ? 'Con xúc xắc có dạng khối lập phương.' : 'Viên gạch có dạng khối hộp chữ nhật.', `Có ${askCube ? a : b} đồ vật.`);
          }
          const k = P(rng, ['cube', 'box']);
          const good = P(rng, SOL_OBJ.filter(o => o.k === k));
          const bad = SOL_OBJ.filter(o => o.k !== k).map(o => `${o.e} ${o.n}`).concat(['⚽ Quả bóng']);
          return Q(`Đồ vật nào có dạng ${low(SOL[k])}?`, vz('solid', { kind: k, showDims: false }), U.choices(rng, `${good.e} ${good.n}`, U.shuffle(rng, bad)), 'Nhìn hình khối trong tranh rồi tìm đồ vật giống nó.', `${good.n} có dạng ${low(SOL[k])}.`);
        }),

      lesson(4, 15, 'Vị trí, định hướng trong không gian',
        'Rô-bốt ISA cùng bạn Tú xếp hàng các bạn thú để chụp ảnh ở công viên.',
        [
          { text: 'Con mèo ở giữa con chó và con thỏ.', visual: rowViz([ANIMALS[0], ANIMALS[1], ANIMALS[2]]) },
          { text: 'Nhìn từ phía em: con chó ở bên trái, con thỏ ở bên phải.', visual: rowViz([ANIMALS[0], ANIMALS[1], ANIMALS[2]]) },
          { text: 'Hình tròn ở hàng trên, hình vuông ở hàng dưới.', visual: vz('shapeSet', { items: ['triangle', 'circle', 'rect', 'square', 'triangle', 'rect'] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const hintLR = 'Bên trái là phía tay cầm bát, bên phải là phía tay cầm đũa của em.';
          if (f === 0) {
            const row = U.sample(rng, ANIMALS, 3);
            return Q('Con vật nào ở giữa?', rowViz(row), fixed(row.map(an), an(row[1])), 'Con ở giữa có một bạn bên trái và một bạn bên phải.', `${an(row[1])} ở giữa.`);
          }
          if (f === 1) {
            const row = U.sample(rng, ANIMALS, L === 0 ? 3 : 4);
            const [x, y] = U.sample(rng, [0, 1, 2, 3].slice(0, row.length), 2);
            const ans = x < y ? 'Bên trái' : 'Bên phải';
            return Q(`Con ${row[x].n} ${row[x].e} ở bên trái hay bên phải con ${row[y].n} ${row[y].e}?`, rowViz(row), fixed(['Bên trái', 'Bên phải'], ans), hintLR, `Con ${row[x].n} ở ${low(ans)} con ${row[y].n}.`);
          }
          if (f === 2) {
            const row = U.sample(rng, ANIMALS, L === 0 ? 3 : L === 1 ? 4 : 5);
            const right = R(rng, 0, 1) === 1;
            const k = right ? R(rng, 0, row.length - 2) : R(rng, 1, row.length - 1);
            const ans = row[right ? k + 1 : k - 1];
            return Q(`Con vật nào ở ngay bên ${right ? 'phải' : 'trái'} con ${row[k].n} ${row[k].e}?`, rowViz(row), fixed(row.filter((_, j) => j !== k).map(an), an(ans)), hintLR, `${an(ans)} đứng ngay bên ${right ? 'phải' : 'trái'} con ${row[k].n}.`);
          }
          if (f === 3) {
            const row = U.sample(rng, ANIMALS, L === 0 ? 3 : 5);
            const first = R(rng, 0, 1) === 1;
            const ans = first ? row[0] : row[row.length - 1];
            return Q(`Con vật nào đứng ${first ? 'đầu tiên bên trái' : 'cuối cùng bên phải'}?`, rowViz(row), fixed(row.map(an), an(ans)), hintLR, `${an(ans)}.`);
          }
          const target = P(rng, SHK);
          const others = SHK.filter(k => k !== target);
          const top = R(rng, 0, 1) === 1;
          const items = [];
          for (let j = 0; j < 6; j++) items.push(P(rng, others));
          items[top ? R(rng, 0, 2) : R(rng, 3, 5)] = target;
          return Q(`${SH[target]} ở hàng trên hay hàng dưới?`, vz('shapeSet', { items }), fixed(['Hàng trên', 'Hàng dưới'], top ? 'Hàng trên' : 'Hàng dưới'), `Tìm ${low(SH[target])} trước.`, `${SH[target]} ở ${top ? 'hàng trên' : 'hàng dưới'}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. CÁC SỐ ĐẾN 100 ============
  const twoDigit = (rng, L) => (L === 0 ? R(rng, 10, 20) : L === 1 ? R(rng, 21, 59) : R(rng, 60, 99));
  const blk = (n, labels) => vz('blocks', { hundreds: 0, tens: Math.floor(n / 10), ones: n % 10, labels: !!labels });

  const c6 = {
    id: 'g1-c6', semester: 2, title: 'Các số đến 100', icon: '💯', lessons: [
      lesson(6, 21, 'Số có hai chữ số',
        'Rô-bốt ISA cùng bạn Trang bó que tính thành từng bó 1 chục.',
        [
          { text: 'Số 23 gồm 2 chục và 3 đơn vị.', visual: blk(23, true) },
          { text: '4 chục là 40, đọc là "bốn mươi".', visual: blk(40, true) },
          { text: '15 gồm 1 chục và 5 đơn vị, đọc là "mười lăm".', visual: blk(15, true) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const n = twoDigit(rng, L), t = Math.floor(n / 10), o = n % 10;
          if (f === 0) return Q('Hình bên là số nào?', blk(n), num(n), 'Đếm số thanh chục, rồi đếm số khối lẻ.', `${t} chục và ${o} đơn vị là ${n}.`, { hintVisual: blk(n, true) });
          if (f === 1) {
            const right = `${t} chục và ${o} đơn vị`;
            const bad = [`${o} chục và ${t} đơn vị`, `${t} chục và ${o === 9 ? 8 : o + 1} đơn vị`, `${t === 9 ? 8 : t + 1} chục và ${o} đơn vị`, `${Math.max(1, t - 1)} chục và ${o} đơn vị`].filter(s => s !== right && !/^0 chục/.test(s));
            return Q(`Số ${n} gồm mấy chục và mấy đơn vị?`, blk(n), U.choices(rng, right, bad), 'Chữ số bên trái chỉ số chục, chữ số bên phải chỉ số đơn vị.', `${n} gồm ${right}.`);
          }
          if (f === 2) {
            const bad = [o * 10 + t, n + 10, n - 1, n + 1].filter(x => x >= 10 && x <= 99 && x !== n);
            return Q(`Số gồm ${t} chục và ${o} đơn vị là số nào?`, blk(n), U.choices(rng, n, bad), 'Viết số chục trước, số đơn vị sau.', `${t} chục và ${o} đơn vị viết là ${n}.`);
          }
          if (f === 3) {
            const bad = [o > 0 ? o * 10 + t : t * 10 + 1, n + 10 <= 99 ? n + 10 : n - 10, n + 1 <= 99 ? n + 1 : n - 2].filter(x => x !== n);
            return Q(`Số "${readVN(n)}" viết là:`, blk(n), U.choices(rng, n, bad), 'Nghe số chục trước, số đơn vị sau.', `"${readVN(n)}" viết là ${n}.`);
          }
          const a0 = t * 10;
          const u = o === 0 ? a0 + R(rng, 1, 9) : n;
          return Q('Số nào còn thiếu trên tia số?', vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: 1, unknown: u }), nCh(rng, u, 0, 100), 'Đếm thêm 1 từ số bên trái.', `Số còn thiếu là ${u}.`);
        }),

      lesson(6, 22, 'So sánh số có hai chữ số',
        'Rô-bốt ISA và bạn Ngọc so xem giỏ nào có nhiều quả vải hơn trong vườn nhà ông.',
        [
          { text: '25 < 31 vì 2 chục bé hơn 3 chục.', visual: vz('compare', { left: 25, right: 31, show: true }) },
          { text: '47 > 43: cùng 4 chục, 7 đơn vị lớn hơn 3 đơn vị.', visual: vz('compare', { left: 47, right: 43, show: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          let a = R(rng, 10, 99), b;
          if (L === 0) { do { b = R(rng, 10, 99); } while (Math.floor(b / 10) === Math.floor(a / 10)); }
          else if (L === 1) b = R(rng, 10, 99);
          else b = R(rng, 0, 3) === 0 ? a : Math.floor(a / 10) * 10 + R(rng, 0, 9);
          if (f === 0 || (f === 1 && a === b)) return Q(`Chọn dấu: ${a} … ${b}`, vz('compare', { left: a, right: b }), cmpAns(a, b), 'So số chục trước. Nếu số chục bằng nhau thì so số đơn vị.', `${a} ${sign(a, b)} ${b}.`, { hintVisual: vz('blocks', { tens: Math.floor(a / 10), ones: a % 10, labels: true }) });
          if (f === 1) {
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(a, b) : Math.min(a, b);
            return Q(`Số nào ${big ? 'lớn' : 'bé'} hơn?`, vz('compare', { left: a, right: b }), fixed([String(a), String(b)], String(ans)), 'So số chục trước.', `${Math.min(a, b)} < ${Math.max(a, b)}.`);
          }
          if (f === 2) {
            const arr = U.sample(rng, Array.from({ length: 90 }, (_, k) => k + 10), 3);
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(...arr) : Math.min(...arr);
            return Q(`Số nào ${big ? 'lớn nhất' : 'bé nhất'}: ${arr.join(', ')}?`, vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10, marks: arr }), fixed(arr.map(String), String(ans)), 'So số chục của các số.', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`);
          }
          if (f === 3) {
            const arr = U.sample(rng, Array.from({ length: 90 }, (_, k) => k + 10), 3);
            const up = [...arr].sort((x, y) => x - y);
            const right = up.join(', ');
            const bad = [[up[1], up[0], up[2]], [up[2], up[1], up[0]], [up[0], up[2], up[1]]].map(x => x.join(', '));
            return Q(`Xếp từ bé đến lớn: ${arr.join(', ')}`, vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10, marks: arr }), U.choices(rng, right, bad), 'Tìm số bé nhất trước.', right + '.');
          }
          const k = R(rng, 25, 85);
          const more = R(rng, 0, 1) === 1;
          const good = more ? R(rng, k + 1, Math.min(99, k + 15)) : R(rng, Math.max(10, k - 15), k - 1);
          const bad = U.sample(rng, more ? [k, k - 1, k - 10, k - 5, k - 3] : [k, k + 1, k + 10, k + 5, k + 3], 3);
          return Q(`Số nào ${more ? 'lớn' : 'bé'} hơn ${k}?`, vz('compare', { left: k, right: '?' }), U.choices(rng, good, bad), 'So số chục trước, rồi so số đơn vị.', `${good} ${more ? '>' : '<'} ${k}.`);
        }),

      lesson(6, 23, 'Bảng các số từ 1 đến 100',
        'Rô-bốt ISA cùng bạn Hùng tô màu bảng số từ 1 đến 100 treo ở lớp.',
        [
          { text: 'Đếm theo chục: 10, 20, 30, …, 100.', visual: vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10 }) },
          { text: 'Đếm thêm 1: 31, 32, 33, … Số liền sau thì thêm 1.', visual: vz('numberLine', { min: 30, max: 40, step: 1, labelEvery: 1, hops: [{ from: 32, to: 33, label: '+1' }] }) },
          { text: '10 chục là 100, đọc là "một trăm".', visual: vz('blocks', { tens: 10, ones: 0, labels: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const a0 = (L === 0 ? R(rng, 1, 4) : R(rng, 1, 9)) * 10 - (L === 0 ? 10 : 0);
          if (f === 0) {
            const u = a0 + R(rng, 1, 9);
            return Q('Số nào còn thiếu trên tia số?', vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: L === 2 ? 5 : 1, unknown: u }), L === 2 ? num(u) : nCh(rng, u, 0, 100), 'Đếm thêm 1 từ số bên trái.', `Số còn thiếu là ${u}.`);
          }
          if (f === 1 || f === 2) {
            const after = f === 1;
            const n = L === 2 && after && R(rng, 0, 2) === 0 ? 99 : R(rng, a0 + 1, a0 + 9);
            const ans = after ? n + 1 : n - 1;
            const base = Math.min(90, Math.floor((n - 1) / 10) * 10);
            return Q(`Số liền ${after ? 'sau' : 'trước'} của ${n} là số nào?`, vz('numberLine', { min: base, max: base + 10, step: 1, labelEvery: 1, marks: [n] }), nCh(rng, ans, 1, 100), after ? 'Số liền sau thì thêm 1.' : 'Số liền trước thì bớt 1.', `Số liền ${after ? 'sau' : 'trước'} của ${n} là ${ans}.`);
          }
          if (f === 3) {
            const t = a0 + R(rng, 1, 9);
            return Q(`Chạm vào số ${t} trên tia số.`, vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: L === 2 ? 5 : 1 }), { kind: 'visual', check: v => v === t }, L === 2 ? `Tìm số ${a0 + 5} trước rồi đếm tiếp.` : `Tìm số ${t} ở dưới tia số.`, `Số ${t} nằm giữa ${t - 1} và ${t + 1}.`);
          }
          const s0 = R(rng, 1, 6) * 10;
          const seq = [s0, s0 + 10, s0 + 20, s0 + 30];
          const miss = R(rng, 1, 3);
          return Q(`Đếm theo chục:\n${seq.map((v, k) => (k === miss ? '?' : v)).join(', ')}`, vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10, unknown: seq[miss] }), nCh(rng, seq[miss], 10, 100, null, 10), 'Mỗi lần thêm 1 chục.', `${seq.join(', ')}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 7. ĐỘ DÀI VÀ ĐO ĐỘ DÀI ============
  const LONG2 = [['Bút chì', 'Bút sáp'], ['Dây đỏ', 'Dây xanh'], ['Rắn xanh', 'Rắn vàng'], ['Tàu A', 'Tàu B'], ['Băng giấy đỏ', 'Băng giấy xanh'], ['Thước kẻ', 'Bút mực']];
  const RUL = [
    { k: 'pencil', n: 'Bút chì', lo: 6, hi: 15 }, { k: 'crayon', n: 'Bút sáp', lo: 5, hi: 10 }, { k: 'ribbon', n: 'Dải ruy băng', lo: 4, hi: 15 },
    { k: 'nail', n: 'Cái đinh', lo: 3, hi: 7 }, { k: 'leaf', n: 'Chiếc lá', lo: 4, hi: 9 }, { k: 'eraser', n: 'Cục tẩy', lo: 2, hi: 5 },
  ];
  const cm = x => `${x} cm`;

  const c7 = {
    id: 'g1-c7', semester: 2, title: 'Độ dài và đo độ dài', icon: '📏', lessons: [
      lesson(7, 25, 'Dài hơn, ngắn hơn',
        'Rô-bốt ISA cùng bạn Việt so xem sợi dây diều nào dài hơn trên cánh đồng.',
        [
          { text: 'Bút đỏ dài hơn bút xanh.', visual: vz('tape', { bars: [{ label: 'Bút đỏ', units: 8, color: 'berry' }, { label: 'Bút xanh', units: 5, color: 'sky' }] }) },
          { text: 'Bút xanh ngắn hơn bút đỏ.', visual: vz('tape', { bars: [{ label: 'Bút đỏ', units: 8, color: 'berry' }, { label: 'Bút xanh', units: 5, color: 'sky' }] }) },
          { text: 'Băng giấy dài bằng 6 ô.', visual: vz('tape', { bars: [{ label: 'Băng giấy', units: 6, parts: 6, color: 'leaf' }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const [A, B] = P(rng, LONG2);
          const gap = L === 0 ? 3 : L === 1 ? 2 : 1;
          let x = R(rng, 2, 10), y;
          do { y = R(rng, 2, 10); } while (Math.abs(x - y) < gap);
          const bars2 = vz('tape', { bars: [{ label: A, units: x, color: 'berry' }, { label: B, units: y, color: 'sky' }] });
          if (f === 0 || f === 1) {
            const longer = f === 0;
            const ans = (longer ? x > y : x < y) ? A : B;
            return Q(`Cái nào ${longer ? 'dài' : 'ngắn'} hơn?`, bars2, fixed([A, B], ans), 'Hai cái đặt thẳng hàng ở bên trái. Xem cái nào thò ra xa hơn bên phải.', `${ans} ${longer ? 'dài' : 'ngắn'} hơn.`);
          }
          if (f === 2) {
            const lens = U.sample(rng, [3, 4, 5, 6, 7, 8, 9, 10], 3);
            const names = ['Dây A', 'Dây B', 'Dây C'];
            const longest = R(rng, 0, 1) === 1;
            const v = longest ? Math.max(...lens) : Math.min(...lens);
            const ans = names[lens.indexOf(v)];
            return Q(`Dây nào ${longest ? 'dài nhất' : 'ngắn nhất'}?`, vz('tape', { bars: names.map((nmx, j) => ({ label: nmx, units: lens[j] })) }), fixed(names, ans), 'So từng sợi dây với nhau.', `${ans} ${longest ? 'dài nhất' : 'ngắn nhất'}.`);
          }
          if (f === 3 || L === 0) {
            const n = R(rng, 3, L === 0 ? 7 : 10);
            return Q('Băng giấy dài mấy ô?', vz('tape', { bars: [{ label: 'Băng giấy', units: n, parts: n, color: P(rng, ['leaf', 'sun', 'purple']) }] }), num(n), 'Đếm từng ô từ trái sang phải.', `Băng giấy dài ${n} ô.`);
          }
          const big = Math.max(x, y), sm = Math.min(x, y);
          return Q(`Băng xanh dài hơn băng đỏ mấy ô?`, vz('tape', { bars: [{ label: 'Băng đỏ', units: sm, parts: sm, color: 'berry' }, { label: 'Băng xanh', units: big, parts: big, color: 'sky' }] }), num(big - sm), 'Đếm số ô thò ra ở băng xanh.', `${big} ${M} ${sm} = ${big - sm} (ô).`);
        }),

      lesson(7, 26, 'Đơn vị đo độ dài',
        'Rô-bốt ISA cùng bạn Thảo dùng thước kẻ đo chiếc bút chì mới mua cho năm học.',
        [
          { text: 'Xăng-ti-mét viết tắt là cm. Bút chì dài 8 cm.', visual: vz('ruler', { length: 8, unit: 'cm', object: 'pencil' }) },
          { text: 'Đặt đầu vật ở vạch 0. Đầu kia ở vạch nào thì vật dài bấy nhiêu xăng-ti-mét.', visual: vz('ruler', { length: 5, unit: 'cm', object: 'crayon' }) },
          { text: 'Em cũng có thể đo bằng gang tay. Cái bàn dài 3 gang tay.', visual: obj('🖐️', 3) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const o = P(rng, RUL), n = R(rng, o.lo, L === 0 ? Math.min(o.hi, 10) : o.hi);
          const rv = vz('ruler', { length: n, unit: 'cm', object: o.k });
          if (f === 0) return Q(`${o.n} dài mấy xăng-ti-mét?`, rv, num(n, 'cm'), 'Xem đầu bên phải của vật ở vạch số mấy.', `${o.n} dài ${n} cm.`);
          if (f === 1) return Q(`${o.n} dài bao nhiêu?`, rv, nCh(rng, n, 1, 20, cm), 'Đầu bên trái ở vạch 0. Xem đầu bên phải.', `${o.n} dài ${n} cm.`);
          if (f === 2) {
            const add = L < 2 || R(rng, 0, 1) === 1;
            let a, b;
            // chủ đề 7 comes before two-digit + / − (chủ đề 8): keep cm arithmetic within 10
            if (add) { a = R(rng, L === 0 ? 1 : 2, L === 0 ? 6 : 8); b = R(rng, 1, 10 - a); }
            else { a = R(rng, 5, 10); b = R(rng, 1, a - 1); }
            const r = add ? a + b : a - b;
            const tv = add ? vz('tape', { bars: [{ label: 'Đoạn 1', units: a, value: cm(a) }, { label: 'Đoạn 2', units: b, value: cm(b) }], total: '?' })
              : vz('tape', { bars: [{ label: 'Có', units: a, value: cm(a) }, { label: 'Cắt đi', units: b, value: cm(b) }], diff: '?' });
            return Q(`${a} cm ${add ? '+' : M} ${b} cm = ?`, tv, num(r, 'cm'), 'Tính như với số, rồi viết thêm "cm".', `${a} cm ${add ? '+' : M} ${b} cm = ${r} cm.`);
          }
          if (f === 3) {
            const [A, B] = P(rng, [['Cái bàn', 'Cái ghế'], ['Bảng lớp', 'Cửa sổ'], ['Giường', 'Tủ']]);
            let a = R(rng, 2, 8), b = R(rng, 2, 8);
            if (a === b) b = a + 1;
            const longer = R(rng, 0, 1) === 1, ans = (longer ? a > b : a < b) ? A : B;
            return Q(`${A} dài ${a} gang tay. ${B} dài ${b} gang tay. Cái nào ${longer ? 'dài' : 'ngắn'} hơn?`, vz('objects', { groups: [{ emoji: '🖐️', count: a, label: A }, { emoji: '🖐️', count: b, label: B }] }), fixed([A, B], ans), 'Cái nào nhiều gang tay hơn thì dài hơn.', `${ans} ${longer ? 'dài' : 'ngắn'} hơn.`);
          }
          const k = R(rng, 2, 9);
          return Q(`Số đo nào là "${readVN(k)} xăng-ti-mét"?`, vz('ruler', { length: k, unit: 'cm', object: P(rng, ['ribbon', 'crayon', 'leaf']) }), U.choices(rng, cm(k), [cm(k + 10), cm(k * 10), cm(k + 1)]), 'Xăng-ti-mét viết tắt là cm.', `"${readVN(k)} xăng-ti-mét" viết là ${k} cm.`);
        }),

      lesson(7, 27, 'Thực hành ước lượng và đo độ dài',
        'Rô-bốt ISA cùng bạn Dũng đo đồ dùng học tập trong cặp sách.',
        [
          { text: 'Đo cục tẩy: cục tẩy dài 4 cm.', visual: vz('ruler', { length: 4, unit: 'cm', object: 'eraser' }) },
          { text: 'Ước lượng: chiếc bút chì dài khoảng 15 cm, không dài tới 90 cm.', visual: vz('ruler', { length: 15, unit: 'cm', object: 'pencil' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          if (f === 0 || f === 4) {
            const o = P(rng, RUL), n = R(rng, o.lo, o.hi);
            return Q(`Đo ${o.n.toLowerCase()}: dài mấy xăng-ti-mét?`, vz('ruler', { length: n, unit: 'cm', object: o.k }), f === 0 ? nCh(rng, n, 1, 20, cm) : num(n, 'cm'), 'Đầu bên trái ở vạch 0. Xem đầu bên phải ở vạch nào.', `${o.n} dài ${n} cm.`);
          }
          const a = R(rng, 6, 15), b0 = R(rng, 3, 12), b = b0 === a ? a - 2 : b0;
          if (f === 1) {
            const longer = R(rng, 0, 1) === 1, ans = (longer ? a > b : a < b) ? 'Bút chì' : 'Bút sáp';
            return Q(`Bút chì dài ${a} cm. Bút sáp dài ${b} cm. Bút nào ${longer ? 'dài' : 'ngắn'} hơn?`, vz('tape', { bars: [{ label: 'Bút chì', units: a, value: cm(a), color: 'sun' }, { label: 'Bút sáp', units: b, value: cm(b), color: 'sky' }] }), fixed(['Bút chì', 'Bút sáp'], ans), 'So hai số đo.', `${a} cm ${sign(a, b)} ${b} cm. ${ans} ${longer ? 'dài' : 'ngắn'} hơn.`);
          }
          if (f === 2) {
            if (L === 0) {
              const o = P(rng, RUL), n = R(rng, o.lo, Math.min(o.hi, 10));
              return Q(`${o.n} dài bao nhiêu?`, vz('ruler', { length: n, unit: 'cm', object: o.k }), nCh(rng, n, 1, 20, cm), 'Xem đầu bên phải ở vạch nào.', `${o.n} dài ${n} cm.`);
            }
            const big = Math.max(a, b), sm = Math.min(a, b);
            return Q(`Dây đỏ dài ${big} cm. Dây xanh dài ${sm} cm. Dây đỏ dài hơn dây xanh mấy xăng-ti-mét?`, vz('tape', { bars: [{ label: 'Dây đỏ', units: big, value: cm(big), color: 'berry' }, { label: 'Dây xanh', units: sm, value: cm(sm), color: 'sky' }], diff: '?' }), num(big - sm, 'cm'), 'Lấy số đo dài hơn trừ số đo ngắn hơn.', `${big} ${M} ${sm} = ${big - sm} (cm).`);
          }
          const EST = [
            { e: '✏️', n: 'Chiếc bút chì', v: 15, w: [1, 90] }, { e: '📘', n: 'Quyển vở', v: 25, w: [2, 99] },
            { e: '🧽', n: 'Cục tẩy', v: 4, w: [40, 90] }, { e: '🍃', n: 'Chiếc lá bàng', v: 15, w: [1, 80] },
            { e: '🥄', n: 'Cái thìa', v: 12, w: [1, 70] }, { e: '🖍️', n: 'Bút sáp màu', v: 8, w: [60, 99] },
          ];
          const ex = P(rng, EST);
          return Q(`${ex.n} dài khoảng bao nhiêu?`, obj(ex.e, 1), U.choices(rng, cm(ex.v), ex.w.map(cm)), 'Nghĩ xem đồ vật đó dài hơn hay ngắn hơn gang tay của em (khoảng 12 cm).', `${ex.n} dài khoảng ${ex.v} cm.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. PHÉP CỘNG, PHÉP TRỪ (KHÔNG NHỚ) TRONG PHẠM VI 100 ============
  const ADD100 = [
    (a, b, n) => `Vườn nhà ${n} có ${a} cây cam và ${b} cây bưởi. Có tất cả bao nhiêu cây?`,
    (a, b) => `Mẹ mua ${a} quả trứng gà và ${b} quả trứng vịt. Mẹ mua tất cả bao nhiêu quả trứng?`,
    (a, b) => `Tủ sách lớp có ${a} quyển truyện. Cô mang thêm ${b} quyển. Có tất cả bao nhiêu quyển truyện?`,
    (a, b) => `Xe buýt có ${a} người. Đến bến, thêm ${b} người lên xe. Trên xe có bao nhiêu người?`,
  ];
  const SUB100 = [
    (a, b) => `Trên bờ có ${a} con vịt. ${b} con xuống ao. Trên bờ còn lại bao nhiêu con vịt?`,
    (a, b) => `Cửa hàng có ${a} chiếc bánh chưng. Đã bán ${b} chiếc. Còn lại bao nhiêu chiếc bánh chưng?`,
    (a, b, n) => `${n} có ${a} viên bi. ${n} cho bạn ${b} viên. ${n} còn bao nhiêu viên bi?`,
    (a, b) => `Vườn có ${a} cây hoa. Bác nông dân nhổ đi ${b} cây. Vườn còn bao nhiêu cây hoa?`,
  ];
  function calcGen(op, pick, oneDigit) {
    return function (rng, i) {
      const L = lv(i), f = i % 5;
      const [a, b] = pick(rng, L);
      const add = op === '+', r = add ? a + b : a - b, opS = add ? '+' : M;
      const expr = `${a} ${opS} ${b}`;
      const colV = vz('columnCalc', { a, b, op: opS, reveal: 'none' });
      const colH = vz('columnCalc', { a, b, op: opS, reveal: 'steps' });
      const hintCol = 'Viết đơn vị thẳng cột đơn vị, chục thẳng cột chục. Tính từ phải sang trái.';
      if (f === 0) {
        const vis = oneDigit ? vz('numberLine', { min: Math.floor(Math.min(a, r) / 10) * 10, max: Math.floor(Math.min(a, r) / 10) * 10 + 10, step: 1, labelEvery: 1, hops: hopsOf(a, b, add ? 1 : -1), unknown: r })
          : vz('blocks', { tens: Math.floor(a / 10), ones: a % 10, labels: true });
        return Q(`${expr} = ?`, vis, nCh(rng, r, 0, 99), oneDigit ? `Đếm ${add ? 'thêm' : 'lùi'} ${b} bước từ ${a}.` : `Tính chục với chục, đơn vị với đơn vị.`, `${expr} = ${r}.`, { hintVisual: colH });
      }
      if (f === 1) return Q(`Đặt tính rồi tính:\n${expr}`, colV, num(r), hintCol, `${expr} = ${r}.`, { hintVisual: colH });
      if (f === 2) {
        const t = P(rng, add ? ADD100 : SUB100)(a, b, nm(rng));
        const tv = add ? vz('tape', { bars: [{ label: 'Có', units: Math.max(1, a), value: String(a) }, { label: 'Thêm', units: Math.max(1, b), value: String(b) }], total: '?' })
          : vz('tape', { bars: [{ label: 'Có', units: Math.max(1, a), value: String(a) }, { label: 'Bớt', units: Math.max(1, b), value: String(b) }], diff: '?' });
        return Q(t, tv, num(r), add ? 'Gộp lại hay thêm vào thì làm phép cộng.' : 'Bớt đi hay còn lại thì làm phép trừ.', `${expr} = ${r}.`, { hintVisual: colH });
      }
      if (f === 3) {
        const c = Math.max(0, Math.min(99, r + P(rng, [-10, -1, 0, 1, 10, 2])));
        return Q(`Chọn dấu: ${expr} … ${c}`, vz('compare', { left: expr, right: c }), cmpAns(r, c), 'Tính phép tính trước rồi so sánh.', `${expr} = ${r}, mà ${r} ${sign(r, c)} ${c}.`, { hintVisual: colH });
      }
      if (L === 2) {
        if (add) return Q(`${a} + ? = ${r}`, vz('tape', { bars: [{ label: 'Có', units: Math.max(1, a), value: String(a) }, { label: 'Thêm', units: Math.max(1, b), value: '?' }], total: String(r) }), num(b), `Lấy ${r} ${M} ${a}.`, `${a} + ${b} = ${r}.`);
        return Q(`${a} ${M} ? = ${r}`, vz('tape', { bars: [{ label: 'Có', units: Math.max(1, a), value: String(a) }, { label: 'Còn', units: Math.max(1, r), value: String(r) }], diff: '?' }), num(b), `Lấy ${a} ${M} ${r}.`, `${a} ${M} ${b} = ${r}.`);
      }
      const right = `${expr} = ${r}`;
      const wrongs = [r + 10, r + 1, r - 10, r - 1, r + 2].filter(x => x >= 0 && x <= 99 && x !== r).map(x => `${expr} = ${x}`);
      return Q('Phép tính nào đúng?', colV, U.choices(rng, right, wrongs), hintCol, right + '.', { hintVisual: colH });
    };
  }

  const c8 = {
    id: 'g1-c8', semester: 2, title: 'Phép cộng, phép trừ (không nhớ) trong phạm vi 100', icon: '🧮', lessons: [
      lesson(8, 29, 'Phép cộng số có hai chữ số với số có một chữ số',
        'Rô-bốt ISA cùng bạn An đếm trứng gà trong rổ ở trang trại của bác.',
        [
          { text: '23 + 4: 3 đơn vị thêm 4 đơn vị là 7 đơn vị. 23 + 4 = 27.', visual: vz('columnCalc', { a: 23, b: 4, op: '+', reveal: 'all' }) },
          { text: 'Đếm thêm trên tia số: 23, 24, 25, 26, 27.', visual: vz('numberLine', { min: 20, max: 30, step: 1, labelEvery: 1, hops: hopsOf(23, 4, 1) }) },
        ],
        calcGen('+', (rng, L) => {
          const t = L === 0 ? R(rng, 1, 3) : R(rng, 1, 9);
          const o = R(rng, 0, L === 0 ? 5 : 8);
          return [t * 10 + o, R(rng, 1, 9 - o)];
        }, true)),

      lesson(8, 30, 'Phép cộng số có hai chữ số với số có hai chữ số',
        'Rô-bốt ISA và bạn Mai gộp hai thúng nhãn hái trong vườn nhà ngoại.',
        [
          { text: '30 + 20: 3 chục cộng 2 chục là 5 chục. 30 + 20 = 50.', visual: vz('blocks', { tens: 5, ones: 0, labels: true }) },
          { text: '32 + 15: đơn vị cộng đơn vị, chục cộng chục. 32 + 15 = 47.', visual: vz('columnCalc', { a: 32, b: 15, op: '+', reveal: 'all' }) },
        ],
        calcGen('+', (rng, L) => {
          if (L === 0) { const x = R(rng, 1, 8); return [x * 10, R(rng, 1, 9 - x) * 10]; }
          return pairWhere(rng, [10, 80], [10, 80], (a, b) => noCarry(a, b) && a + b <= 99 && (L === 2 || (a % 10 + b % 10 <= 6)), [32, 15]);
        }, false)),

      lesson(8, 31, 'Phép trừ số có hai chữ số cho số có một chữ số',
        'Rô-bốt ISA cùng bạn Nam đếm xem còn bao nhiêu chiếc bánh chưng sau phiên chợ Tết.',
        [
          { text: '37 − 5: 7 đơn vị bớt 5 đơn vị còn 2 đơn vị. 37 − 5 = 32.', visual: vz('columnCalc', { a: 37, b: 5, op: M, reveal: 'all' }) },
          { text: 'Đếm lùi trên tia số: 37, 36, 35, 34, 33, 32.', visual: vz('numberLine', { min: 30, max: 40, step: 1, labelEvery: 1, hops: hopsOf(37, 5, -1) }) },
        ],
        calcGen('−', (rng, L) => {
          const t = L === 0 ? R(rng, 1, 3) : R(rng, 1, 9);
          const o = R(rng, L === 0 ? 3 : 2, 9);
          return [t * 10 + o, R(rng, 1, o)];
        }, true)),

      lesson(8, 32, 'Phép trừ số có hai chữ số cho số có hai chữ số',
        'Rô-bốt ISA và bạn Chi tính số chim còn lại trên cây đa đầu làng.',
        [
          { text: '70 − 30: 7 chục bớt 3 chục còn 4 chục. 70 − 30 = 40.', visual: vz('blocks', { tens: 4, ones: 0, labels: true }) },
          { text: '58 − 23: đơn vị trừ đơn vị, chục trừ chục. 58 − 23 = 35.', visual: vz('columnCalc', { a: 58, b: 23, op: M, reveal: 'all' }) },
        ],
        calcGen('−', (rng, L) => {
          if (L === 0) { const x = R(rng, 2, 9); return [x * 10, R(rng, 1, x - 1) * 10]; }
          return pairWhere(rng, [20, 99], [10, 89], (a, b) => b < a && noBorrow(a, b) && Math.floor(b / 10) < Math.floor(a / 10), [58, 23]);
        }, false)),
    ],
  };

  // ============ CHỦ ĐỀ 9. THỜI GIAN, GIỜ VÀ LỊCH ============
  const gio = h => `${h} giờ`;
  const h12 = h => ((h - 1) % 12 + 12) % 12 + 1;
  const ACTS = [
    { t: 'thức dậy', h: 6, p: 'sáng' }, { t: 'đi học', h: 7, p: 'sáng' }, { t: 'ăn cơm trưa', h: 11, p: 'trưa' },
    { t: 'tan học', h: 4, p: 'chiều', h24: 16 }, { t: 'tưới cây', h: 5, p: 'chiều', h24: 17 }, { t: 'ăn cơm tối', h: 7, p: 'tối', h24: 19 },
    { t: 'đi ngủ', h: 9, p: 'tối', h24: 21 }, { t: 'tập thể dục', h: 6, p: 'sáng' }, { t: 'đọc truyện', h: 8, p: 'tối', h24: 20 },
  ];
  const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const wd = (y, m, d) => (new Date(y, m - 1, d).getDay() + 6) % 7;
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  const dayCh = (rng, k) => {
    const opts = [k, (k + 1) % 7, (k + 6) % 7, (k + 2) % 7];
    return fixed(opts.sort((x, y) => x - y).map(j => DAYS[j]), DAYS[k]);
  };
  function pickMonth(rng) { const y = P(rng, [2026, 2027]), m = R(rng, 1, 12); return { y, m, n: daysIn(y, m) }; }
  const clockSet = (h, extra) => ({ kind: 'visual', check: v => !!v && v.m === 0 && h12(v.h) === h12(h) });

  const c9 = {
    id: 'g1-c9', semester: 2, title: 'Thời gian, giờ và lịch', icon: '🕐', lessons: [
      lesson(9, 34, 'Xem giờ đúng trên đồng hồ',
        'Rô-bốt ISA cùng bạn Lan xem đồng hồ để không bị muộn giờ đi học.',
        [
          { text: 'Kim dài chỉ số 12, kim ngắn chỉ số 3: đồng hồ chỉ 3 giờ.', visual: vz('clock', { h: 3, m: 0 }) },
          { text: 'Kim dài chỉ số 12, kim ngắn chỉ số 9: 9 giờ.', visual: vz('clock', { h: 9, m: 0, digital: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const h = R(rng, 1, 12);
          if (f === 0) return Q('Đồng hồ chỉ mấy giờ?', vz('clock', { h, m: 0 }), nCh(rng, h, 1, 12, gio), 'Kim dài chỉ số 12. Xem kim ngắn chỉ số mấy.', `Kim ngắn chỉ số ${h}: ${h} giờ.`);
          if (f === 1) return Q('Kim ngắn chỉ số mấy?', vz('clock', { h, m: 0 }), num(h), 'Kim ngắn là kim to và ngắn hơn.', `Kim ngắn chỉ số ${h}. Đồng hồ chỉ ${h} giờ.`);
          if (f === 2) {
            const a = P(rng, ACTS), who = nm(rng);
            return Q(`${who} ${a.t} lúc mấy giờ?`, vz('clock', { h: a.h24 || a.h, m: 0 }), nCh(rng, a.h, 1, 12, gio), 'Xem kim ngắn chỉ số mấy.', `${who} ${a.t} lúc ${a.h} giờ ${a.p}.`);
          }
          if (f === 3 && L < 2) {
            const t = h === 12 ? R(rng, 1, 11) : h;
            return Q(`Quay kim để đồng hồ chỉ ${t} giờ.`, vz('clock', { h: 12, m: 0 }), clockSet(t), `Kim dài để ở số 12. Kéo kim ngắn đến số ${t}.`, `${t} giờ: kim dài chỉ số 12, kim ngắn chỉ số ${t}.`);
          }
          if (f === 3) return Q('Đồng hồ chỉ mấy giờ?', vz('clock', { h, m: 0, digital: true }), num(h, 'giờ'), 'Xem số trước dấu hai chấm hoặc xem kim ngắn.', `Đồng hồ chỉ ${h} giờ.`);
          if (L === 0) return Q('Đồng hồ chỉ mấy giờ?', vz('clock', { h, m: 0 }), num(h, 'giờ'), 'Xem kim ngắn chỉ số mấy.', `${h} giờ.`);
          const k = L === 1 ? 1 : R(rng, 1, 2);
          const after = h12(h + k);
          return Q(`Bây giờ là ${h} giờ. Sau ${k} giờ nữa là mấy giờ?`, vz('clock', { h, m: 0 }), nCh(rng, after, 1, 12, gio), `Kim ngắn đi thêm ${k} số.`, `${h} giờ, thêm ${k} giờ là ${after} giờ.`);
        }),

      lesson(9, 35, 'Các ngày trong tuần',
        'Rô-bốt ISA cùng bạn Bình đánh dấu trên tờ lịch ngày cả nhà về quê thăm ông bà.',
        [
          { text: 'Một tuần có 7 ngày: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ nhật.', visual: vz('calendar', { year: 2027, month: 3, highlight: [1, 2, 3, 4, 5, 6, 7] }) },
          { text: 'Hôm nay là Thứ Ba thì ngày mai là Thứ Tư, hôm qua là Thứ Hai.', visual: vz('calendar', { year: 2027, month: 3, highlight: [2] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const { y, m, n } = pickMonth(rng);
          const d = R(rng, 2, n - 1), k = wd(y, m, d);
          const cal = vz('calendar', { year: y, month: m, highlight: [d] });
          if (f === 0) return Q(`Hôm nay là ${DAYS[k]}. Ngày mai là thứ mấy?`, cal, dayCh(rng, (k + 1) % 7), 'Ngày mai là ngày ngay sau hôm nay.', `Sau ${DAYS[k]} là ${DAYS[(k + 1) % 7]}.`);
          if (f === 1) return Q(`Hôm nay là ${DAYS[k]}. Hôm qua là thứ mấy?`, cal, dayCh(rng, (k + 6) % 7), 'Hôm qua là ngày ngay trước hôm nay.', `Trước ${DAYS[k]} là ${DAYS[(k + 6) % 7]}.`);
          if (f === 2) return Q(`Ngày ${d} là thứ mấy?`, cal, dayCh(rng, k), 'Tìm ngày được khoanh, rồi nhìn lên hàng chữ trên cùng.', `Ngày ${d} là ${DAYS[k]}.`);
          if (f === 3) {
            const mid = R(rng, 1, 5);
            return Q(`Ngày nào ở giữa ${DAYS[mid - 1]} và ${DAYS[mid + 1]}?`, vz('calendar', { year: y, month: m }), dayCh(rng, mid), 'Đọc tên các ngày trong tuần theo thứ tự.', `${DAYS[mid - 1]}, ${DAYS[mid]}, ${DAYS[mid + 1]}.`);
          }
          if (L < 2) return Q('Một tuần có mấy ngày?', vz('calendar', { year: y, month: m }), num(7), 'Đếm các ngày ở hàng chữ trên cùng của tờ lịch.', 'Một tuần có 7 ngày.');
          let sun = 0;
          for (let x = 1; x <= n; x++) if (wd(y, m, x) === 6) sun++;
          return Q(`Tháng ${m} có mấy ngày Chủ nhật?`, vz('calendar', { year: y, month: m }), num(sun), 'Đếm các số ở cột Chủ nhật (cột cuối).', `Tháng ${m} có ${sun} ngày Chủ nhật.`);
        }),

      lesson(9, 36, 'Thực hành xem lịch và giờ',
        'Rô-bốt ISA giúp bạn Hà xem lịch và đồng hồ để chuẩn bị sinh nhật mẹ.',
        [
          { text: 'Tờ lịch cho biết ngày và thứ. Ngày 10 tháng 5 năm 2027 là Thứ Hai.', visual: vz('calendar', { year: 2027, month: 5, highlight: [10] }) },
          { text: 'Đồng hồ chỉ 8 giờ: kim dài chỉ số 12, kim ngắn chỉ số 8.', visual: vz('clock', { h: 8, m: 0 }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const { y, m, n } = pickMonth(rng);
          if (f === 0) {
            const d = R(rng, 1, n), k = wd(y, m, d);
            return Q(`Ngày ${d} tháng ${m} là thứ mấy?`, vz('calendar', { year: y, month: m, highlight: [d] }), dayCh(rng, k), 'Tìm ngày được khoanh, rồi nhìn lên hàng chữ trên cùng.', `Ngày ${d} tháng ${m} là ${DAYS[k]}.`);
          }
          if (f === 1) {
            const d = R(rng, 1, n - 1);
            const back = L === 2 && d > 1 && R(rng, 0, 1) === 1;
            return Q(`Hôm nay là ngày ${d}. ${back ? 'Hôm qua' : 'Ngày mai'} là ngày mấy?`, vz('calendar', { year: y, month: m, highlight: [d] }), num(back ? d - 1 : d + 1), back ? 'Hôm qua là ngày ngay trước.' : 'Ngày mai là ngày ngay sau.', `${back ? 'Hôm qua' : 'Ngày mai'} là ngày ${back ? d - 1 : d + 1}.`);
          }
          if (f === 2) {
            const a = P(rng, ACTS), who = nm(rng);
            return Q(`Đồng hồ chỉ giờ ${who} ${a.t}. Đó là mấy giờ?`, vz('clock', { h: a.h24 || a.h, m: 0 }), nCh(rng, a.h, 1, 12, gio), 'Kim dài chỉ số 12. Xem kim ngắn.', `${who} ${a.t} lúc ${a.h} giờ ${a.p}.`);
          }
          if (f === 3) {
            const k = R(rng, 0, 6);
            let first = 1; while (wd(y, m, first) !== k) first++;
            return Q(`${DAYS[k]} đầu tiên của tháng ${m} là ngày mấy?`, vz('calendar', { year: y, month: m }), num(first), `Tìm cột ${DAYS[k]}, xem số đầu tiên trong cột.`, `${DAYS[k]} đầu tiên là ngày ${first}.`);
          }
          const a = P(rng, ACTS), who = nm(rng);
          return Q(`${who} ${a.t} lúc ${a.h} giờ ${a.p}. Quay kim đồng hồ chỉ ${a.h} giờ.`, vz('clock', { h: a.h === 12 ? 3 : 12, m: 0 }), clockSet(a.h), `Kim dài ở số 12, kim ngắn ở số ${a.h}.`, `${a.h} giờ: kim ngắn chỉ số ${a.h}, kim dài chỉ số 12.`);
        }),
    ],
  };

  // ---------- exam(rng, level): exam-style question for "Ôn tập & Kiểm tra" (no tap-to-answer items;
  // level 1/2/3 = Mức 1/2/3 picks a fitting generator index) ----------
  const EXAM_IDX = {
    'g1-c1-b1': { 1: [0, 2, 3], 2: [5, 7], 3: [8] },
    'g1-c1-b2': { 1: [0, 2, 3], 2: [5, 7], 3: [8] },
    'g1-c1-b4': { 1: [1, 2, 3], 2: [5, 6], 3: [8] },
    'g1-c2-b7': { 1: [0, 3], 2: [2, 7], 3: [7, 8] },
    'g1-c3-b10': { 1: [1, 3], 2: [2, 6], 3: [7] },
    'g1-c3-b11': { 1: [1, 3], 2: [2, 6], 3: [7] },
    'g1-c3-b12': { 1: [0, 5], 2: [4], 3: [9] },
    'g1-c6-b23': { 1: [0, 1, 2], 2: [5, 6, 7], 3: [4, 9] },
    'g1-c8-b29': { 1: [1], 2: [6], 3: [7] },
    'g1-c8-b30': { 1: [1], 2: [6], 3: [7] },
    'g1-c8-b31': { 1: [1], 2: [6], 3: [7] },
    'g1-c8-b32': { 1: [1], 2: [6], 3: [7] },
    'g1-c9-b34': { 1: [0, 5], 2: [2, 7], 3: [9] },
    'g1-c9-b36': { 1: [0, 2], 2: [1, 6], 3: [8] },
  };
  [c1, c2, c3, c4, c6, c7, c8, c9].forEach(t => t.lessons.forEach(L => {
    const map = EXAM_IDX[L.id];
    if (!map) return;
    // A trắc nghiệm exam slot turns a typed number answer v into A B C D with distractors up to v + 12
    // (v + 3 below 20), so redraw answers that could push a distractor past 99 (lớp 1 numbers stop at 100).
    const tooHigh = q => q && q.answer && q.answer.kind === 'number' && q.answer.value + (q.answer.value < 20 ? 3 : 12) > 99;
    L.exam = (rng, level) => {
      let q;
      for (let t = 0; t < 30; t++) { q = L.gen(rng, P(rng, map[level] || map[2])); if (!tooHigh(q)) break; }
      return q;
    };
  }));

  CURRICULUM.push({
    grade: 1,
    title: 'Lớp 1',
    book: 'Kết nối tri thức với cuộc sống',
    topics: [c1, c2, c3, c4, c6, c7, c8, c9],
  });
})();
