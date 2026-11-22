/* Toán ISA — Lớp 2 (SGK Toán 2 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g2-c{chủ đề index}-b{Bài number}. Never rename ids (progress is saved by id).
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const R = U.rand, P = U.pick, F = x => U.fmt(x);
  const M = '−'; // real minus sign U+2212
  const L = U.L, EN = U.EN; // L('Vietnamese', 'English') → text for the current language (see I18N.md)

  // ---------- small helpers (duplicated per grade file on purpose) ----------
  const num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });
  const ch = (rng, c, d, f) => U.choices(rng, c, d, f);
  const cmpAns = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b ? 0 : a > b ? 1 : 2 });
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const lv = i => (i < 3 ? 0 : i < 7 ? 1 : 2);
  const vz = (type, params) => ({ type, params });
  // Extra question forms mixed into a lesson generator. extra: [[fromI, toI, fn(rng, i)], ...];
  // the base generator keeps `w` shares (default 2) so its own forms still appear. Keeps base.exam.
  function more(base, extra, w) {
    const g = function (rng, i) {
      const ok = extra.filter(e => i >= e[0] && i <= e[1]);
      const k = R(rng, 0, ok.length + (w || 2) - 1);
      return k < ok.length ? ok[k][2](rng, i) : base(rng, i);
    };
    if (base.exam) g.exam = base.exam;
    return g;
  }
  const TRUE = L('Đúng', 'True'), FALSE = L('Sai', 'False');
  const tf = (rng, ok) => U.choices(rng, ok ? TRUE : FALSE, [ok ? FALSE : TRUE]);
  function Q(prompt, visual, answer, hint, explain, extra) {
    const q = { prompt, answer, hint, explain };
    if (visual) q.visual = visual;
    Object.assign(q, extra || {});
    if (q.hintVisual == null) delete q.hintVisual;
    return q;
  }
  const two = rng => U.sample(rng, U.NAMES, 2);
  const nm = rng => P(rng, U.NAMES);
  const pos = arr => arr.filter(x => x >= 0);
  function pairWhere(rng, ra, rb, ok, fb) {
    for (let g = 0; g < 600; g++) {
      const a = R(rng, ra[0], ra[1]), b = R(rng, rb[0], rb[1]);
      if (ok(a, b)) return [a, b];
    }
    return fb;
  }
  const digits = n => String(n).split('').map(Number);
  function noCarry(a, b) { while (a > 0 || b > 0) { if (a % 10 + b % 10 >= 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function noBorrow(a, b) { while (b > 0) { if (a % 10 < b % 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  // typical mistakes: forgetting to carry / borrow
  function wrongAdd(a, b) { let r = 0, p = 1; while (a > 0 || b > 0) { r += ((a % 10 + b % 10) % 10) * p; p *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10); } return r; }
  function wrongSub(a, b) { let r = 0, p = 1; while (a > 0 || b > 0) { r += Math.abs(a % 10 - b % 10) * p; p *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10); } return r; }
  const units = (x, max) => Math.max(1, Math.round(x * 12 / Math.max(1, max)));

  const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function read3(n, full) {
    const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10, out = [];
    if (h > 0 || full) out.push(DIG[h] + ' trăm');
    if (t === 0) { if (o > 0) out.push((h > 0 || full ? 'linh ' : '') + DIG[o]); }
    else {
      out.push(t === 1 ? 'mười' : DIG[t] + ' mươi');
      if (o === 1) out.push(t === 1 ? 'một' : 'mốt');
      else if (o === 4) out.push(t === 1 ? 'bốn' : 'tư');
      else if (o === 5) out.push('lăm');
      else if (o > 0) out.push(DIG[o]);
    }
    return out.join(' ');
  }
  function readVN(n) {
    if (n === 0) return 'không';
    const un = ['', ' nghìn', ' triệu', ' tỉ'], g = [];
    let x = n; while (x > 0) { g.push(x % 1000); x = Math.floor(x / 1000); }
    const parts = [];
    for (let k = g.length - 1; k >= 0; k--) if (g[k] > 0) parts.push(read3(g[k], k < g.length - 1) + un[k]);
    return parts.join(' ');
  }

  const ITEMS = [
    { n: 'quả táo', e: '🍎' }, { n: 'quả cam', e: '🍊' }, { n: 'cái kẹo', e: '🍬' }, { n: 'con cá', e: '🐟' },
    { n: 'bông hoa', e: '🌸' }, { n: 'ngôi sao', e: '⭐' }, { n: 'quả bóng bay', e: '🎈' }, { n: 'quả xoài', e: '🥭' },
    { n: 'con gà', e: '🐔' }, { n: 'con vịt', e: '🦆' }, { n: 'cái bút chì', e: '✏️' }, { n: 'quyển vở', e: '📘' },
  ];
  const BIG = ['quả cam', 'cái kẹo', 'quyển vở', 'bông hoa', 'viên bi', 'nhãn vở', 'cái bánh', 'quả trứng'];

  // English words for the Vietnamese nouns used in word problems: [singular, plural]
  const NOUN = {
    'quả táo': ['apple', 'apples'], 'quả cam': ['orange', 'oranges'], 'cái kẹo': ['sweet', 'sweets'], 'con cá': ['fish', 'fish'],
    'bông hoa': ['flower', 'flowers'], 'ngôi sao': ['star', 'stars'], 'quả bóng bay': ['balloon', 'balloons'], 'quả xoài': ['mango', 'mangoes'],
    'con gà': ['hen', 'hens'], 'con vịt': ['duck', 'ducks'], 'cái bút chì': ['pencil', 'pencils'], 'quyển vở': ['exercise book', 'exercise books'],
    'viên bi': ['marble', 'marbles'], 'nhãn vở': ['book label', 'book labels'], 'cái bánh': ['cake', 'cakes'], 'quả trứng': ['egg', 'eggs'],
    'quyển truyện': ['storybook', 'storybooks'], 'cái tẩy': ['rubber', 'rubbers'], 'cái thước kẻ': ['ruler', 'rulers'],
    'gói bánh quy': ['packet of biscuits', 'packets of biscuits'], 'hộp bút màu': ['box of crayons', 'boxes of crayons'],
    'cái cặp tóc': ['hair clip', 'hair clips'], 'quả bóng nhỏ': ['small ball', 'small balls'], 'que tính': ['counting stick', 'counting sticks'],
    'hộp': ['box', 'boxes'], 'túi': ['bag', 'bags'], 'bó': ['bundle', 'bundles'], 'thùng': ['crate', 'crates'],
  };
  const wE = (vn, k) => { const p = NOUN[vn]; return p ? p[k === 1 ? 0 : 1] : vn; }; // English noun (plural unless k is 1)
  const nE = (k, vn) => `${F(k)} ${wE(vn, k)}`;                                       // "3 apples", "1 apple"
  const pE = (k, w, ws) => `${F(k)} ${k === 1 ? w : (ws || w + 's')}`;                 // pE(4, 'ten') → "4 tens"
  const art = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;                           // "an orange", "a pencil"
  const cap = s => s[0].toUpperCase() + s.slice(1);

  // Learn cards show their labels (visuals hide most labels by default so questions do not give answers away).
  const LEARN_ON = { blocks: { labels: true }, fraction: { label: true }, decimalGrid: { showLabel: true }, percent: { showLabel: true }, thermometer: { showValue: true }, roman: { showValue: true, showText: true }, average: { showMean: true }, angle: { showDeg: true }, cubes: { showDims: true } };
  function lesson(c, b, title, story, learn, gen) {
    learn.forEach(card => { const v = card.visual; if (v && LEARN_ON[v.type]) v.params = Object.assign({}, LEARN_ON[v.type], v.params); });
    return { id: `g2-c${c}-b${b}`, title, book: L(`Bài ${b}`, `Lesson ${b}`), story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
  }

  // ---------- generic generator builders ----------

  // Column addition / subtraction lesson (đặt tính rồi tính)
  // Several column operations in one lesson (op chosen by i); exam picks one at random.
  function mixCol(list, opts) {
    const gens = list.map(([op, pick]) => colGen(op, pick, opts));
    const gen = (rng, i) => gens[i % gens.length](rng, i);
    gen.exam = (rng, level) => P(rng, gens).exam(rng, level);
    return gen;
  }
  function colGen(op, pickPair, opts) {
    opts = opts || {};
    const at = function (rng, lvl, k) {
      const [a, b] = pickPair(rng, lvl);
      const r = op === '+' ? a + b : a - b;
      const wrong = op === '+' ? wrongAdd(a, b) : wrongSub(a, b);
      const expr = `${F(a)} ${op} ${F(b)}`;
      const colV = vz('columnCalc', { a, b, op, reveal: 'none' });
      const colH = vz('columnCalc', { a, b, op, reveal: 'steps' });
      const hintCol = op === '+'
        ? L('Viết các chữ số cùng hàng thẳng cột. Cộng từ phải sang trái' + (opts.carry ? ', nhớ 1 sang hàng bên trái.' : '.'),
          'Write the digits in their columns: ones under ones, tens under tens. Add from right to left' + (opts.carry ? ' and carry 1 to the next column.' : '.'))
        : L('Viết các chữ số cùng hàng thẳng cột. Trừ từ phải sang trái' + (opts.carry ? '; nếu không trừ được thì mượn 1 chục, nhớ 1 vào số trừ ở hàng bên trái.' : '.'),
          'Write the digits in their columns: ones under ones, tens under tens. Subtract from right to left' + (opts.carry ? '. If the top digit is too small, borrow 1 ten, then add 1 to the bottom digit in the next column.' : '.'));
      if (k === 0) return Q(L(`Đặt tính rồi tính:\n${expr}`, `Set out and calculate:\n${expr}`), colV, num(r), hintCol, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, r, [wrong, r + 10, r - 10, r + 1, r - 1].filter(x => x >= 0)), hintCol, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const [n1, n2] = two(rng), it = P(rng, opts.items || BIG);
        let p;
        if (op === '+') p = P(rng, EN ? [
          `${n1} has ${nE(a, it)} and ${n2} has ${nE(b, it)}. How many ${wE(it)} do they have altogether?`,
          `In the morning a shop sold ${nE(a, it)}. In the afternoon it sold ${nE(b, it)}. How many ${wE(it)} did the shop sell in the whole day?`,
          `The school library has ${F(a)} storybooks. The librarian buys ${F(b)} more. How many storybooks does the library have now?`,
        ] : [
          `${n1} có ${F(a)} ${it}, ${n2} có ${F(b)} ${it}. Cả hai bạn có bao nhiêu ${it}?`,
          `Buổi sáng cửa hàng bán được ${F(a)} ${it}, buổi chiều bán được ${F(b)} ${it}. Cả ngày cửa hàng bán được bao nhiêu ${it}?`,
          `Thư viện trường có ${F(a)} quyển truyện, cô thủ thư mua thêm ${F(b)} quyển. Thư viện có tất cả bao nhiêu quyển truyện?`,
        ]);
        else p = P(rng, EN ? [
          `${n1} has ${nE(a, it)} and gives ${nE(b, it)} to a younger friend. How many ${wE(it)} does ${n1} have left?`,
          `A shop has ${nE(a, it)}. It sells ${nE(b, it)}. How many ${wE(it)} does the shop have left?`,
          `There are ${F(a)} ducks on the grass. ${b === 1 ? '1 duck goes' : `${F(b)} ducks go`} into the pond for a swim. How many ducks are left on the grass?`,
        ] : [
          `${n1} có ${F(a)} ${it}, ${n1} cho em ${F(b)} ${it}. Hỏi ${n1} còn lại bao nhiêu ${it}?`,
          `Cửa hàng có ${F(a)} ${it}, đã bán ${F(b)} ${it}. Cửa hàng còn lại bao nhiêu ${it}?`,
          `Trên bãi cỏ có ${F(a)} con vịt, có ${F(b)} con xuống ao bơi. Hỏi trên bãi cỏ còn bao nhiêu con vịt?`,
        ]);
        const mx = Math.max(a, b);
        const tape = op === '+'
          ? vz('tape', { bars: [{ label: L('Phần 1', 'Part 1'), units: units(a, mx), value: F(a) }, { label: L('Phần 2', 'Part 2'), units: units(b, mx), value: F(b) }], total: '?' })
          : vz('tape', { bars: [{ label: L('Có', 'Start'), units: units(a, mx), value: F(a) }, { label: L('Bớt', 'Take away'), units: units(b, mx), value: F(b) }], diff: '?' });
        return Q(p, tape, num(r), op === '+' ? L('Muốn tìm tất cả, em làm phép cộng.', 'To find how many altogether, add.') : L('Muốn tìm phần còn lại, em làm phép trừ.', 'To find how many are left, subtract.'), L(`Phép tính: ${expr} = ${F(r)}.`, `Calculation: ${expr} = ${F(r)}.`));
      }
      if (k === 3) {
        const c = r + P(rng, [-10, -1, 0, 1, 10, 2]);
        const cc = Math.max(0, c);
        return Q(L(`So sánh: ${expr} … ${F(cc)}`, `Compare: ${expr} … ${F(cc)}`), vz('compare', { left: expr, right: F(cc) }), cmpAns(r, cc), L('Tính kết quả phép tính trước rồi so sánh.', 'Work out the calculation first, then compare.'), L(`${expr} = ${F(r)}, mà ${F(r)} ${sign(r, cc)} ${F(cc)}.`, `${expr} = ${F(r)}, and ${F(r)} ${sign(r, cc)} ${F(cc)}.`));
      }
      if (wrong !== r) {
        const who = nm(rng);
        return Q(L(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, `${who} worked out: ${expr} = ${F(wrong)}.\nWhat is the correct answer?`), colV, num(r), opts.carry ? L('Kiểm tra lại bước nhớ.', op === '+' ? 'Check the carrying step again.' : 'Check the borrowing step again.') : L('Tính lại từng hàng.', 'Work out each column again.'), L(`${expr} = ${F(r)}. Bạn ${who} đã quên nhớ.`, `${expr} = ${F(r)}. ${who} forgot to ${op === '+' ? 'carry' : 'borrow'}.`), { hintVisual: colH });
      }
      if (op === '+') return Q(L(`Số thích hợp ở ô ? là bao nhiêu?\n${F(a)} + ? = ${F(r)}`, `What is the missing number?\n${F(a)} + ? = ${F(r)}`), null, num(b), L('Muốn tìm số hạng chưa biết, lấy tổng trừ đi số hạng kia.', 'To find the missing addend, take the other addend away from the sum.'), `${F(r)} ${M} ${F(a)} = ${F(b)}.`);
      return Q(L(`Số thích hợp ở ô ? là bao nhiêu?\n${F(a)} ${M} ? = ${F(r)}`, `What is the missing number?\n${F(a)} ${M} ? = ${F(r)}`), null, num(b), L('Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu.', 'To find the subtrahend (the number taken away), take the difference away from the minuend.'), `${F(a)} ${M} ${F(r)} = ${F(b)}.`);
    };
    // gen: practice (form by i % 5). exam: level 1 = đặt tính rồi tính, level 2–3 = bài toán có lời văn.
    const gen = (rng, i) => at(rng, lv(i), i % 5);
    gen.exam = (rng, level) => (level === 1 ? at(rng, 1, 0) : at(rng, level === 2 ? 1 : 2, 2));
    return gen;
  }

  // Multiplication table n
  function mulTableGen(n, ctxs) {
    return function (rng, i) {
      const lvl = lv(i);
      const k = lvl === 0 ? R(rng, 1, 5) : R(rng, 2, 10);
      const p = n * k;
      const f = i % 5;
      if (f === 0) return Q(`${n} × ${k} = ?`, vz('array', { rows: k, cols: n, emoji: P(rng, ['🍎', '🌸', '⭐', '🍬']) }), num(p), L(`${n} được lấy ${k} lần.`, `${n} is taken ${k} ${k === 1 ? 'time' : 'times'}.`), `${n} × ${k} = ${p}.`);
      if (f === 1) {
        const c = P(rng, ctxs);
        // draw the k groups being counted (k hens, k hands…); the per-group amount is in c.per
        return Q(L(`${c.per} Hỏi ${k} ${c.who} có bao nhiêu ${c.what}?`, `${c.en.per} How many ${c.en.what} ${k === 1 ? 'does' : 'do'} ${k} ${c.en.who[k === 1 ? 0 : 1]} have?`), vz('objects', { groups: [{ emoji: c.e, count: k }] }), num(p), L(`${n} được lấy ${k} lần, em làm phép nhân ${n} × ${k}.`, `${n} is taken ${k} ${k === 1 ? 'time' : 'times'}, so multiply: ${n} × ${k}.`), `${n} × ${k} = ${p} (${L(c.what, c.en.what)}).`);
      }
      if (f === 2) {
        const start = R(rng, 1, 6), miss = R(rng, 1, 3);
        const seq = [0, 1, 2, 3].map(j => n * (start + j));
        const shown = seq.map((v, j) => (j === miss ? '?' : String(v))).join(', ');
        return Q(L(`Đếm thêm ${n}: ${shown}\nSố ở ô ? là số nào?`, `Count in ${n}s: ${shown}\nWhat is the missing number?`), vz('numberLine', { min: 0, max: n * 10, step: n, labelEvery: 1, hops: seq.slice(0, miss).map(v => ({ from: v, to: v + n, label: '+' + n })), unknown: seq[miss] }), num(seq[miss]), L(`Mỗi lần đếm thêm ${n}.`, `Add ${n} each time.`), `${seq[miss - 1]} + ${n} = ${seq[miss]}.`);
      }
      if (f === 3) return Q(L(`Số thích hợp ở ô ?:\n${n} × ? = ${p}`, `What is the missing number?\n${n} × ? = ${p}`), null, num(k), L(`Nhẩm bảng nhân ${n}: ${n} nhân mấy bằng ${p}?`, `Use the ${n} times table: ${n} times what makes ${p}?`), L(`${n} × ${k} = ${p}, vậy số cần điền là ${k}.`, `${n} × ${k} = ${p}, so the missing number is ${k}.`));
      const k2 = lvl === 0 ? R(rng, 1, 5) : R(rng, 1, 10);
      const right = R(rng, 0, 1) ? n * k2 : n * k2 + P(rng, [-1, 1, 2]);
      return Q(L(`So sánh: ${n} × ${k} … ${right}`, `Compare: ${n} × ${k} … ${right}`), vz('compare', { left: `${n} × ${k}`, right: String(right) }), cmpAns(p, right), L(`Tính ${n} × ${k} trước.`, `Work out ${n} × ${k} first.`), `${n} × ${k} = ${p}; ${p} ${sign(p, right)} ${right}.`);
    };
  }

  // Division table n
  function divTableGen(n, ctxs) {
    return function (rng, i) {
      const lvl = lv(i);
      const k = lvl === 0 ? R(rng, 1, 5) : R(rng, 2, 10);
      const p = n * k;
      const f = i % 5;
      if (f === 0) return Q(`${p} : ${n} = ?`, vz('share', { total: p, groups: n, emoji: P(rng, ['🍬', '🍪', '🍎']) }), num(k), L(`Chia đều ${p} vào ${n} phần. Nhớ bảng nhân ${n}: ${n} × ? = ${p}.`, `Share ${p} equally into ${n} groups. Use the ${n} times table: ${n} × ? = ${p}.`), `${p} : ${n} = ${k}.`);
      if (f === 1) {
        const c = P(rng, ctxs);
        // "mỗi nhóm n" stories (c.bySize) are drawn as k groups of n (objects draws at most 6 groups, so
        // more groups become k rows of n); sharing stories as n plates
        const v = !c.bySize ? vz('share', { total: p, groups: n, emoji: c.e, plateLabel: L(c.plate, c.en.plate) })
          : k <= 6 ? vz('objects', { groups: Array.from({ length: k }, () => ({ emoji: c.e, count: n })) }) : vz('array', { rows: k, cols: n, emoji: c.e });
        return Q(L(c.q(p, n), c.en.q(p, n)), v, num(k), L(`Em làm phép chia ${p} : ${n}.`, `Divide: ${p} : ${n}.`), `${p} : ${n} = ${k} (${L(c.unit, c.en.unit[k === 1 ? 0 : 1])}).`);
      }
      if (f === 2) return Q(L(`Biết ${n} × ${k} = ${p}. Vậy ${p} : ${n} = ?`, `${n} × ${k} = ${p}. So ${p} : ${n} = ?`), vz('array', { rows: k, cols: n }), ch(rng, k, [k + 1, k - 1, p, n].filter(x => x > 0)), L('Từ một phép nhân ta viết được phép chia: lấy tích chia cho một thừa số được thừa số kia.', 'A multiplication gives a division: the product divided by one factor gives the other factor.'), `${p} : ${n} = ${k}.`);
      if (f === 3) {
        if (R(rng, 0, 1)) return Q(L(`Số thích hợp ở ô ?:\n${p} : ? = ${k}`, `What is the missing number?\n${p} : ? = ${k}`), null, num(n), L(`Thử bảng chia ${n}.`, `Try the ${n} division facts.`), `${p} : ${n} = ${k}.`);
        return Q(L(`Số thích hợp ở ô ?:\n? : ${n} = ${k}`, `What is the missing number?\n? : ${n} = ${k}`), null, num(p), L(`Số bị chia = thương × số chia.`, `Dividend = quotient × divisor.`), L(`${k} × ${n} = ${p}, vậy ${p} : ${n} = ${k}.`, `${k} × ${n} = ${p}, so ${p} : ${n} = ${k}.`));
      }
      const k2 = R(rng, 1, 10), right = k2;
      return Q(L(`So sánh: ${p} : ${n} … ${right}`, `Compare: ${p} : ${n} … ${right}`), vz('compare', { left: `${p} : ${n}`, right: String(right) }), cmpAns(k, right), L(`Tính ${p} : ${n} trước.`, `Work out ${p} : ${n} first.`), `${p} : ${n} = ${k}; ${k} ${sign(k, right)} ${right}.`);
    };
  }

  // ============ CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG ============
  const c1 = {
    id: 'g2-c1', semester: 1, title: L('Ôn tập và bổ sung', 'Review and more'), icon: '🔢', lessons: [
      lesson(1, 1, L('Ôn tập các số đến 100', 'Review: numbers to 100'),
        L('Rô-bốt ISA cùng bạn Mai đếm những bó que tính chuẩn bị cho ngày khai giảng.', 'ISA the robot and Mai count bundles of counting sticks for the first day of school.'),
        [
          { text: L('Mỗi thanh là 1 chục (10 khối). Số 45 gồm 4 chục và 5 đơn vị, đọc là "bốn mươi lăm".', 'Each rod is 1 ten (10 cubes). 45 has 4 tens and 5 ones. We say "forty-five".'), visual: vz('blocks', { hundreds: 0, tens: 4, ones: 5 }) },
          { text: L('Số 70 gồm 7 chục và 0 đơn vị. Đây là số tròn chục.', '70 has 7 tens and 0 ones. It is a multiple of ten.'), visual: vz('blocks', { hundreds: 0, tens: 7, ones: 0 }) },
          { text: L('So sánh 38 và 52: so hàng chục trước, 3 chục < 5 chục nên 38 < 52.', 'Compare 38 and 52: look at the tens first. 3 tens < 5 tens, so 38 < 52.'), visual: vz('compare', { left: 38, right: 52 }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) {
            const t = R(rng, 1, 9), o = R(rng, 0, 9), n = t * 10 + o;
            return Q(L('Hình dưới đây biểu diễn số nào?', 'Which number do the blocks show?'), vz('blocks', { hundreds: 0, tens: t, ones: o }), num(n), L('Đếm số thanh chục, rồi đếm số khối lẻ.', 'Count the tens rods, then count the single cubes.'), L(`${t} chục và ${o} đơn vị là ${n}.`, `${pE(t, 'ten')} and ${pE(o, 'one')} make ${n}.`));
          }
          if (f === 1) {
            const t = R(rng, 1, 9), o = R(rng, 1, 9), n = t * 10 + o;
            return Q(L(`Số gồm ${t} chục và ${o} đơn vị là số nào?`, `Which number has ${pE(t, 'ten')} and ${pE(o, 'one')}?`), null, ch(rng, n, [o * 10 + t, t + o, t * 10, n + 10]), L('Chữ số hàng chục viết trước, chữ số hàng đơn vị viết sau.', 'Write the tens digit first, then the ones digit.'), L(`${t} chục và ${o} đơn vị viết là ${n}.`, `${pE(t, 'ten')} and ${pE(o, 'one')} is written ${n}.`));
          }
          if (f === 2) {
            const n = R(rng, 21, 99);
            return Q(L(`Số "${readVN(n)}" viết là:`, `Write "${U.readEN(n)}" in digits:`), null, ch(rng, n, [Math.floor(n / 10) + (n % 10) * 10, n + 1, n - 10].filter(x => x > 0 && x < 100)), L('Nghe số chục trước, số đơn vị sau.', 'Listen for the tens first, then the ones.'), L(`"${readVN(n)}" viết là ${n}.`, `"${U.readEN(n)}" is written ${n}.`));
          }
          if (f === 3) {
            const a = R(rng, 10, 99); let b = lv(i) === 2 ? Math.floor(a / 10) * 10 + R(rng, 0, 9) : R(rng, 10, 99);
            return Q(L(`So sánh: ${a} … ${b}`, `Compare: ${a} … ${b}`), vz('compare', { left: a, right: b }), cmpAns(a, b), L('So sánh chữ số hàng chục trước; nếu bằng nhau thì so sánh hàng đơn vị.', 'Compare the tens digits first. If they are the same, compare the ones.'), `${a} ${sign(a, b)} ${b}.`);
          }
          const arr = U.sample(rng, Array.from({ length: 90 }, (_, k) => k + 10), 4);
          const big = R(rng, 0, 1) === 1;
          const ans = big ? Math.max(...arr) : Math.min(...arr);
          return Q(L(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.join('; ')} là:`, `The ${big ? 'greatest' : 'smallest'} of the numbers ${arr.join('; ')} is:`), null, ch(rng, ans, arr), L('So sánh hàng chục trước.', 'Compare the tens first.'), L(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`, `The ${big ? 'greatest' : 'smallest'} number is ${ans}.`));
        }),

      lesson(1, 2, L('Tia số. Số liền trước, số liền sau', 'The number line. The number before and the number after'),
        L('Rô-bốt ISA nhảy từng bước trên tia số vẽ ở sân trường cùng bạn Nam.', 'ISA the robot and Nam hop step by step along a number line painted in the playground.'),
        [
          { text: L('Trên tia số, các số được xếp theo thứ tự từ bé đến lớn, cách đều nhau.', 'On a number line, the numbers go in order from smallest to greatest, equally spaced.'), visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1 }) },
          { text: L('Số liền sau của 6 là 7 (thêm 1). Số liền trước của 6 là 5 (bớt 1).', 'The number after 6 is 7 (one more). The number before 6 is 5 (one less).'), visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1, marks: [5, 6, 7], hops: [{ from: 6, to: 7, label: '+1' }] }) },
          { text: L('Tia số cũng có thể đếm theo chục: 0, 10, 20, 30, …', 'A number line can also count in tens: 0, 10, 20, 30, …'), visual: vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 1 }) },
        ],
        function (rng, i) {
          const f = i % 5, lvl = lv(i);
          if (f === 0) {
            if (lvl === 2) {
              const n = R(rng, 1, 9) * 10;
              return Q(L('Số thích hợp ở ô ? trên tia số là số nào?', 'Which number goes in the ? box on the number line?'), vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 1, unknown: n }), num(n), L('Tia số này đếm thêm 10.', 'This number line counts in tens.'), L(`Số cần điền là ${n}.`, `The missing number is ${n}.`));
            }
            const a0 = R(rng, 0, 8) * 10, n = a0 + R(rng, 1, 9);
            return Q(L('Số thích hợp ở ô ? trên tia số là số nào?', 'Which number goes in the ? box on the number line?'), vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: 1, unknown: n }), num(n), L('Đếm thêm 1 từ số bên trái.', 'Count on in ones from the number on the left.'), L(`Số cần điền là ${n}.`, `The missing number is ${n}.`));
          }
          if (f === 1) {
            const n = R(rng, 10, 98);
            return Q(L(`Số liền sau của ${n} là số nào?`, `What is the number after ${n}?`), null, ch(rng, n + 1, [n - 1, n + 10, n + 2]), L('Số liền sau thì thêm 1.', 'The number after is one more.'), `${n} + 1 = ${n + 1}.`);
          }
          if (f === 2) {
            const n = R(rng, 11, 99);
            return Q(L(`Số liền trước của ${n} là số nào?`, `What is the number before ${n}?`), null, ch(rng, n - 1, [n + 1, n - 10, n - 2]), L('Số liền trước thì bớt 1.', 'The number before is one less.'), `${n} ${M} 1 = ${n - 1}.`);
          }
          if (f === 3) {
            const a0 = R(rng, 0, 4) * 20, n = a0 + R(rng, 1, 19);
            return Q(L(`Chạm vào vạch ứng với số ${n} trên tia số.`, `Tap the mark for ${n} on the number line.`), vz('numberLine', { min: a0, max: a0 + 20, step: 1, labelEvery: 5 }), { kind: 'visual', check: v => v === n }, L('Tìm số tròn chục hoặc số có chữ số 5 gần nhất rồi đếm tiếp.', 'Find the nearest labelled number, then count on.'), L(`Số ${n} nằm giữa ${n - 1} và ${n + 1}.`, `${n} is between ${n - 1} and ${n + 1}.`));
          }
          const n = R(rng, 11, 98);
          return Q(L(`Số ở giữa ${n - 1} và ${n + 1} là số nào?`, `Which number is between ${n - 1} and ${n + 1}?`), vz('numberLine', { min: Math.floor((n - 1) / 10) * 10, max: Math.floor((n - 1) / 10) * 10 + 20, step: 1, labelEvery: 5, marks: [n - 1, n + 1] }), num(n), L('Số đó là số liền sau của số bé.', 'It is the number after the smaller number.'), `${n - 1}, ${n}, ${n + 1}.`);
        }),

      lesson(1, 3, L('Các thành phần của phép cộng, phép trừ', 'Parts of an addition and a subtraction'),
        L('Rô-bốt ISA giúp bạn Chi đặt tên cho từng số trong phép tính.', 'ISA the robot helps Chi name each number in a calculation.'),
        [
          { text: L('Trong 32 + 15 = 47: 32 và 15 là số hạng, 47 là tổng.', 'In 32 + 15 = 47: 32 and 15 are the addends, 47 is the sum.'), visual: vz('columnCalc', { a: 32, b: 15, op: '+', reveal: 'all' }) },
          { text: L('Trong 68 − 25 = 43: 68 là số bị trừ, 25 là số trừ, 43 là hiệu.', 'In 68 − 25 = 43: 68 is the minuend, 25 is the subtrahend, 43 is the difference.'), visual: vz('columnCalc', { a: 68, b: 25, op: M, reveal: 'all' }) },
        ],
        function (rng, i) {
          const f = i % 5;
          const [a, b] = pairWhere(rng, [11, 69], [10, 30], (x, y) => noCarry(x, y) && x !== y && x + y < 100, [32, 15]);
          const s = a + b;
          if (f === 0) return Q(L(`Trong phép cộng ${a} + ${b} = ${s}, tổng là số nào?`, `In ${a} + ${b} = ${s}, which number is the sum?`), vz('columnCalc', { a, b, op: '+', reveal: 'all' }), ch(rng, s, [a, b]), L('Kết quả của phép cộng gọi là tổng.', 'The answer to an addition is called the sum.'), L(`Tổng là ${s}.`, `The sum is ${s}.`));
          if (f === 1) return Q(L(`Hai số hạng là ${a} và ${b}. Tổng là bao nhiêu?`, `The two addends are ${a} and ${b}. What is the sum?`), vz('columnCalc', { a, b, op: '+', reveal: 'none' }), num(s), L('Tổng = số hạng + số hạng.', 'Sum = addend + addend.'), `${a} + ${b} = ${s}.`);
          if (f === 2) return Q(L(`Số bị trừ là ${s}, số trừ là ${b}. Hiệu là bao nhiêu?`, `The minuend is ${s} and the subtrahend is ${b}. What is the difference?`), vz('columnCalc', { a: s, b, op: M, reveal: 'none' }), num(a), L('Hiệu = số bị trừ − số trừ.', 'Difference = minuend − subtrahend.'), `${s} ${M} ${b} = ${a}.`);
          if (f === 3) return Q(L(`Trong phép trừ ${s} ${M} ${b} = ${a}, số trừ là số nào?`, `In ${s} ${M} ${b} = ${a}, which number is the subtrahend?`), vz('columnCalc', { a: s, b, op: M, reveal: 'all' }), ch(rng, b, [s, a]), L('Số trừ đứng sau dấu trừ.', 'The subtrahend comes after the minus sign.'), L(`Số trừ là ${b}.`, `The subtrahend is ${b}.`));
          const pickT = R(rng, 0, 2);
          const names = EN ? ['Minuend', 'Subtrahend', 'Difference'] : ['Số bị trừ', 'Số trừ', 'Hiệu'];
          const val = [s, b, a][pickT];
          return Q(L(`Trong phép tính ${s} ${M} ${b} = ${a}, số ${val} gọi là gì?`, `In ${s} ${M} ${b} = ${a}, what is ${val} called?`), null, ch(rng, names[pickT], names.concat([L('Tổng', 'Sum')]).filter(x => x !== names[pickT])), L('Nhớ: số bị trừ − số trừ = hiệu.', 'Remember: minuend − subtrahend = difference.'), L(`${val} là ${names[pickT].toLowerCase()}.`, `${val} is the ${names[pickT].toLowerCase()}.`));
        }),

      lesson(1, 4, L('Hơn, kém nhau bao nhiêu', 'How many more? How many fewer?'),
        L('Rô-bốt ISA và bạn Hùng so xem rổ cam nhiều hơn rổ táo mấy quả.', 'ISA the robot and Hùng find out how many more oranges than apples there are in the baskets.'),
        [
          { text: L('Xếp hai hàng thẳng nhau: hàng cam thừa ra 3 quả. Vậy 7 hơn 4 là 3 đơn vị.', 'Line up the two rows: the orange row has 3 extra. So 7 is 3 more than 4.'), visual: vz('objects', { groups: [{ emoji: '🍊', count: 7 }, { emoji: '🍎', count: 4 }] }) },
          { text: L('Muốn biết hơn, kém nhau bao nhiêu, ta lấy số lớn trừ số bé: 7 − 4 = 3.', 'To find how many more or fewer, take the smaller number away from the greater: 7 − 4 = 3.'), visual: vz('tape', { bars: [{ label: L('Cam', 'Oranges'), units: 7, value: '7' }, { label: L('Táo', 'Apples'), units: 4, value: '4' }], diff: '3' }) },
        ],
        function (rng, i) {
          const f = i % 4, lvl = lv(i);
          if (f === 0) {
            const [x, y] = U.sample(rng, ITEMS.slice(0, 8), 2);
            const a = R(rng, 4, 10), b = R(rng, 1, a - 1);
            return Q(L(`Số ${x.n} nhiều hơn số ${y.n} bao nhiêu?`, `How many more ${wE(x.n)} than ${wE(y.n)} are there?`), vz('objects', { groups: [{ emoji: x.e, count: a }, { emoji: y.e, count: b }] }), num(a - b), L('Lấy số lớn trừ số bé.', 'Take the smaller number away from the greater.'), `${a} ${M} ${b} = ${a - b}.`);
          }
          const [a, b] = pairWhere(rng, [20, 99], [10, 89], (p, q) => p > q && noBorrow(p, q), [57, 23]);
          if (f === 1) return Q(L(`${a} hơn ${b} bao nhiêu đơn vị?`, `How much more than ${b} is ${a}?`), vz('tape', { bars: [{ label: String(a), units: units(a, a), value: String(a) }, { label: String(b), units: units(b, a), value: String(b) }], diff: '?' }), num(a - b), L('Lấy số lớn trừ số bé.', 'Take the smaller number away from the greater.'), L(`${a} ${M} ${b} = ${a - b}. Vậy ${a} hơn ${b} là ${a - b} đơn vị.`, `${a} ${M} ${b} = ${a - b}. So ${a} is ${a - b} more than ${b}.`));
          if (f === 2) return Q(L(`${b} kém ${a} bao nhiêu đơn vị?`, `How much less than ${a} is ${b}?`), null, ch(rng, a - b, [a + b, a - b + 10, a - b - 1].filter(x => x > 0)), L('Kém bao nhiêu cũng lấy số lớn trừ số bé.', 'For "how much less", also take the smaller number away from the greater.'), `${a} ${M} ${b} = ${a - b}.`);
          const [c1n, c2n] = U.sample(rng, ['2A', '2B', '2C', '2D'], 2);
          const aa = lvl === 0 ? R(rng, 31, 39) : a, bb = lvl === 0 ? R(rng, 30, aa - 1) : b;
          return Q(L(`Lớp ${c1n} có ${aa} học sinh, lớp ${c2n} có ${bb} học sinh. Lớp ${c1n} nhiều hơn lớp ${c2n} bao nhiêu học sinh?`, `Class ${c1n} has ${aa} pupils and class ${c2n} has ${bb} pupils. How many more pupils does class ${c1n} have than class ${c2n}?`), vz('tape', { bars: [{ label: c1n, units: units(aa, aa), value: String(aa) }, { label: c2n, units: units(bb, aa), value: String(bb) }], diff: '?' }), num(aa - bb), L('Lấy số lớn trừ số bé.', 'Take the smaller number away from the greater.'), L(`${aa} ${M} ${bb} = ${aa - bb} (học sinh).`, `${aa} ${M} ${bb} = ${aa - bb} (${aa - bb === 1 ? 'pupil' : 'pupils'}).`));
        }),

      lesson(1, 5, L('Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100', 'Review: addition and subtraction to 100 (no carrying)'),
        L('Rô-bốt ISA cùng bạn Lan tính số bánh chưng cả xóm gói cho ngày Tết.', 'ISA the robot and Lan count the bánh chưng rice cakes the neighbours wrap for Tết.'),
        [
          { text: L('Đặt tính: hàng đơn vị thẳng hàng đơn vị, hàng chục thẳng hàng chục. Tính từ phải sang trái.', 'Set out the sum: ones under ones, tens under tens. Work from right to left.'), visual: vz('columnCalc', { a: 43, b: 25, op: '+', reveal: 'all' }) },
          { text: L('76 − 34: 6 trừ 4 bằng 2, viết 2; 7 trừ 3 bằng 4, viết 4. Vậy 76 − 34 = 42.', '76 − 34: 6 take away 4 is 2, write 2; 7 take away 3 is 4, write 4. So 76 − 34 = 42.'), visual: vz('columnCalc', { a: 76, b: 34, op: M, reveal: 'all' }) },
        ],
        mixCol([
          ['+', (r, lvl) => pairWhere(r, [10, 80], lvl === 0 ? [1, 9] : [10, 50], (a, b) => noCarry(a, b) && a + b < 100, [43, 25])],
          [M, (r, lvl) => pairWhere(r, [20, 99], lvl === 0 ? [1, 9] : [10, 70], (a, b) => a > b && noBorrow(a, b), [76, 34])],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 2. PHÉP CỘNG, PHÉP TRỪ TRONG PHẠM VI 20 ============
  function addOver10(rng) { const a = R(rng, 2, 9); const b = R(rng, Math.max(2, 11 - a), 9); return [a, b]; }
  function subOver10(rng) { const a = R(rng, 11, 18); const b = R(rng, a - 9, 9); return [a, Math.max(b, (a % 10) + 1)]; }
  const c2 = {
    id: 'g2-c2', semester: 1, title: L('Phép cộng, phép trừ trong phạm vi 20', 'Addition and subtraction to 20'), icon: '➕', lessons: [
      lesson(2, 7, L('Phép cộng (qua 10) trong phạm vi 20', 'Addition to 20 (bridging 10)'),
        L('Rô-bốt ISA giúp bạn An xếp trứng vào khay 10 ô để đếm cho nhanh.', 'ISA the robot helps An put eggs into a tray of 10 to count them quickly.'),
        [
          { text: L('9 + 4: lấy 1 ở số 4 cho đủ 10 với số 9, còn 3. Vậy 9 + 4 = 10 + 3 = 13.', '9 + 4: take 1 from the 4 to make 10 with the 9, and 3 are left. So 9 + 4 = 10 + 3 = 13.'), visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 9, to: 10, label: '+1' }, { from: 10, to: 13, label: '+3' }] }) },
          { text: L('8 + 5 = 8 + 2 + 3 = 13. Tách số sau để "làm tròn 10" trước.', '8 + 5 = 8 + 2 + 3 = 13. Split the second number to "make 10" first.'), visual: vz('objects', { groups: [{ emoji: '🥚', count: 8 }, { emoji: '🥚', count: 5 }] }) },
        ],
        function (rng, i) {
          const [a, b] = addOver10(rng), s = a + b, f = i % 5, it = P(rng, ITEMS.slice(0, 10));
          const hv = vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: a, to: 10, label: '+' + (10 - a) }, { from: 10, to: s, label: '+' + (s - 10) }] });
          if (f === 0) return Q(L(`Có tất cả bao nhiêu ${it.n}?`, `How many ${wE(it.n)} are there altogether?`), vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), num(s), L(`Đếm thêm từ ${a}.`, `Count on from ${a}.`), `${a} + ${b} = ${s}.`, { hintVisual: hv });
          if (f === 1) return Q(`${a} + ${b} = ?`, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), ch(rng, s, [s - 1, s + 1, s - 10, s + 2].filter(x => x > 0)), L(`Tách ${b} = ${10 - a} + ${b - (10 - a)} để ${a} + ${10 - a} = 10.`, `Split ${b} = ${10 - a} + ${b - (10 - a)}, so that ${a} + ${10 - a} = 10.`), `${a} + ${b} = ${a} + ${10 - a} + ${b - (10 - a)} = ${s}.`, { hintVisual: hv });
          if (f === 2) return Q(L(`Số thích hợp ở ô ?:\n${a} + ${b} = ${a} + ${10 - a} + ?`, `What is the missing number?\n${a} + ${b} = ${a} + ${10 - a} + ?`), hv, num(b - (10 - a)), L(`${b} tách thành ${10 - a} và mấy?`, `${b} splits into ${10 - a} and what?`), `${b} = ${10 - a} + ${b - (10 - a)}.`);
          if (f === 3) {
            // each story carries its own picture emoji so the drawing matches the noun
            const [t, e] = P(rng, EN ? [
              [`There are ${a} hens in the henhouse. Mum buys ${b} more hens. How many hens are in the henhouse altogether?`, '🐔'],
              [`${nm(rng)} has ${a} oranges and a friend gives ${b} more. How many oranges are there altogether?`, '🍊'],
              [`There are ${a} birds on a branch. ${b} more birds fly in. How many birds are on the branch altogether?`, '🐦'],
            ] : [
              [`Trong chuồng có ${a} con gà, mẹ mua thêm ${b} con gà. Hỏi trong chuồng có tất cả bao nhiêu con gà?`, '🐔'],
              [`${nm(rng)} có ${a} quả cam, được bạn cho thêm ${b} quả cam. Hỏi bạn ấy có tất cả bao nhiêu quả cam?`, '🍊'],
              [`Trên cành có ${a} con chim, có thêm ${b} con chim bay đến. Hỏi trên cành có tất cả bao nhiêu con chim?`, '🐦'],
            ]);
            return Q(t, vz('objects', { groups: [{ emoji: e, count: a }, { emoji: e, count: b }] }), num(s), L('Thêm vào thì làm phép cộng.', 'When more are added, add.'), `${a} + ${b} = ${s}.`);
          }
          const d = [`${a} + ${b - 1}`, `${a + 1} + ${b}`, `${a - 1} + ${b}`].filter(x => !/\b0\b/.test(x));
          return Q(L(`Phép tính nào có kết quả bằng ${s}?`, `Which calculation makes ${s}?`), null, ch(rng, `${a} + ${b}`, d), L('Tính nhẩm từng phép tính.', 'Work out each calculation in your head.'), `${a} + ${b} = ${s}.`);
        }),

      lesson(2, 8, L('Bảng cộng (qua 10)', 'Addition facts (bridging 10)'),
        L('Rô-bốt ISA cùng bạn Vy học thuộc bảng cộng để đi chợ tính nhẩm thật nhanh.', 'ISA the robot and Vy learn the addition facts so they can add quickly at the market.'),
        [
          { text: L('9 + 2 = 11, 9 + 3 = 12, … 9 + 9 = 18. Thêm 1 vào số hạng thì tổng thêm 1.', '9 + 2 = 11, 9 + 3 = 12, … 9 + 9 = 18. Add 1 to an addend and the sum goes up by 1.'), visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 9, to: 11, label: '+2' }] }) },
          { text: L('Đổi chỗ hai số hạng thì tổng không đổi: 7 + 5 = 5 + 7 = 12.', 'Swap the two addends and the sum stays the same: 7 + 5 = 5 + 7 = 12.'), visual: vz('objects', { groups: [{ emoji: '🍬', count: 7 }, { emoji: '🍬', count: 5 }] }) },
        ],
        function (rng, i) {
          const [a, b] = addOver10(rng), s = a + b, f = i % 5;
          if (f === 0) return Q(L(`Tính nhẩm: ${a} + ${b} = ?`, `Mental maths: ${a} + ${b} = ?`), null, num(s), L('Làm tròn 10 trước.', 'Make 10 first.'), `${a} + ${b} = ${s}.`);
          if (f === 1) return Q(L(`Số thích hợp ở ô ?:\n${a} + ? = ${s}`, `What is the missing number?\n${a} + ? = ${s}`), vz('objects', { groups: [{ emoji: '⭐', count: a }, { emoji: '❔', count: 1 }] }), num(b), L(`Đếm thêm từ ${a} đến ${s}.`, `Count on from ${a} to ${s}.`), `${a} + ${b} = ${s}.`);
          if (f === 2) {
            const [c, d] = addOver10(rng);
            return Q(L(`So sánh: ${a} + ${b} … ${c} + ${d}`, `Compare: ${a} + ${b} … ${c} + ${d}`), vz('compare', { left: `${a} + ${b}`, right: `${c} + ${d}` }), cmpAns(s, c + d), L('Tính tổng hai bên rồi so sánh.', 'Work out both sums, then compare.'), L(`${a} + ${b} = ${s}; ${c} + ${d} = ${c + d}. Vậy ${s} ${sign(s, c + d)} ${c + d}.`, `${a} + ${b} = ${s}; ${c} + ${d} = ${c + d}. So ${s} ${sign(s, c + d)} ${c + d}.`));
          }
          if (f === 3) return Q(L(`Số thích hợp ở ô ?:\n${a} + ${b} = ${b} + ?`, `What is the missing number?\n${a} + ${b} = ${b} + ?`), null, num(a), L('Đổi chỗ các số hạng thì tổng không thay đổi.', 'Swapping the addends does not change the sum.'), `${a} + ${b} = ${b} + ${a}.`);
          const t = R(rng, 11, 18);
          const a2 = R(rng, t - 9, 9);
          return Q(L(`Số nào cộng với ${a2} được ${t}?`, `What number added to ${a2} makes ${t}?`), null, ch(rng, t - a2, [t - a2 + 1, t - a2 - 1, t].filter(x => x > 0)), `${a2} + ? = ${t}.`, `${a2} + ${t - a2} = ${t}.`);
        }),

      lesson(2, 9, L('Bài toán về thêm, bớt một số đơn vị', 'Word problems: adding more, taking away'),
        L('Rô-bốt ISA cùng bạn Bình đếm bóng bay chuẩn bị cho Tết Trung thu.', 'ISA the robot and Bình count balloons for the Mid-Autumn Festival.'),
        [
          { text: L('Có 8 quả bóng, thêm 3 quả. Thêm thì cộng: 8 + 3 = 11 (quả).', 'There are 8 balloons and 3 more come. Adding more means add: 8 + 3 = 11 (balloons).'), visual: vz('objects', { groups: [{ emoji: '🎈', count: 8 }, { emoji: '🎈', count: 3 }] }) },
          { text: L('Có 12 quả bóng, bay mất 4 quả. Bớt thì trừ: 12 − 4 = 8 (quả).', 'There are 12 balloons and 4 fly away. Taking away means subtract: 12 − 4 = 8 (balloons).'), visual: vz('objects', { groups: [{ emoji: '🎈', count: 12 }], crossOut: 4 }) },
        ],
        function (rng, i) {
          const f = i % 4, it = P(rng, [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[4], ITEMS[6], ITEMS[7], ITEMS[10], ITEMS[11]]), who = nm(rng);
          const pickOp = L('\nEm chọn phép tính giải bài toán:', '\nChoose the calculation that solves the problem:');
          if (f === 0 || f === 2) {
            const [a, b] = lv(i) === 0 ? [R(rng, 3, 8), R(rng, 1, 5)] : addOver10(rng);
            const t = P(rng, EN ? [
              `${who} has ${nE(a, it.n)}. Mum gives ${who} ${F(b)} more ${wE(it.n, b)}. How many ${wE(it.n)} does ${who} have altogether?`,
              `There ${a === 1 ? 'is' : 'are'} ${nE(a, it.n)} in a basket. Grandma puts in ${F(b)} more ${wE(it.n, b)}. How many ${wE(it.n)} are in the basket now?`,
            ] : [
              `${who} có ${a} ${it.n}, mẹ cho thêm ${b} ${it.n}. Hỏi ${who} có tất cả bao nhiêu ${it.n}?`,
              `Trong rổ có ${a} ${it.n}, bà bỏ thêm vào ${b} ${it.n}. Hỏi trong rổ có bao nhiêu ${it.n}?`,
            ]);
            // distractors: the wrong operation on the story's two numbers, and a wrong sum (never "total − part = part")
            if (f === 2) return Q(t + pickOp, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), ch(rng, `${a} + ${b} = ${a + b}`, [`${Math.max(a, b)} ${M} ${Math.min(a, b)} = ${Math.abs(a - b)}`, `${a} + ${b} = ${a + b + 1}`]), L('Thêm thì làm phép cộng.', 'Adding more means add.'), `${a} + ${b} = ${a + b} (${L(it.n, wE(it.n, a + b))}).`);
            return Q(t, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), num(a + b), L('Thêm thì làm phép cộng.', 'Adding more means add.'), `${a} + ${b} = ${a + b} (${L(it.n, wE(it.n, a + b))}).`);
          }
          const [a, b] = lv(i) === 0 ? [R(rng, 5, 10), R(rng, 1, 4)] : subOver10(rng);
          const t = P(rng, EN ? [
            `${who} has ${nE(a, it.n)} and gives ${nE(b, it.n)} to a friend. How many ${wE(it.n)} does ${who} have left?`,
            `There are ${nE(a, it.n)} on the table. You take away ${nE(b, it.n)}. How many ${wE(it.n)} are left on the table?`,
          ] : [
            `${who} có ${a} ${it.n}, ${who} cho bạn ${b} ${it.n}. Hỏi ${who} còn lại bao nhiêu ${it.n}?`,
            `Trên bàn có ${a} ${it.n}, em lấy đi ${b} ${it.n}. Hỏi trên bàn còn bao nhiêu ${it.n}?`,
          ]);
          if (f === 3) return Q(t + pickOp, vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b }), ch(rng, `${a} ${M} ${b} = ${a - b}`, [`${a} + ${b} = ${a + b}`, `${a} ${M} ${b} = ${a - b + 1}`]), L('Bớt đi thì làm phép trừ.', 'Taking away means subtract.'), `${a} ${M} ${b} = ${a - b} (${L(it.n, wE(it.n, a - b))}).`);
          return Q(t, vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b }), num(a - b), L('Bớt đi thì làm phép trừ.', 'Taking away means subtract.'), `${a} ${M} ${b} = ${a - b} (${L(it.n, wE(it.n, a - b))}).`);
        }),

      lesson(2, 11, L('Phép trừ (qua 10) trong phạm vi 20', 'Subtraction to 20 (bridging 10)'),
        L('Rô-bốt ISA và bạn Ngọc chia bánh trung thu cho các bạn trong lớp.', 'ISA the robot and Ngọc share out mooncakes to the children in their class.'),
        [
          { text: L('13 − 5: bớt 3 trước để còn 10, rồi bớt tiếp 2. Vậy 13 − 5 = 13 − 3 − 2 = 8.', '13 − 5: first take away 3 to get to 10, then take away 2 more. So 13 − 5 = 13 − 3 − 2 = 8.'), visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 13, to: 10, label: '−3' }, { from: 10, to: 8, label: '−2' }] }) },
          { text: L('Có 12 cái bánh, cho đi 4 cái, còn lại 8 cái: 12 − 4 = 8.', 'There are 12 mooncakes. Give away 4 and 8 are left: 12 − 4 = 8.'), visual: vz('objects', { groups: [{ emoji: '🥮', count: 12 }], crossOut: 4 }) },
        ],
        function (rng, i) {
          const [a, b] = subOver10(rng), r = a - b, f = i % 5, u = a - 10, it = P(rng, ITEMS.slice(0, 10));
          const hv = vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: a, to: 10, label: M + u }, { from: 10, to: r, label: M + (b - u) }] });
          if (f === 0) return Q(L(`Còn lại bao nhiêu ${it.n}?`, `How many ${wE(it.n)} are left?`), vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b }), num(r), L('Đếm những hình không bị gạch.', 'Count the pictures that are not crossed out.'), `${a} ${M} ${b} = ${r}.`, { hintVisual: hv });
          if (f === 1) return Q(`${a} ${M} ${b} = ?`, null, ch(rng, r, [r + 1, r - 1, r + 10, b].filter(x => x > 0)), L(`Bớt ${u} để được 10, rồi bớt tiếp ${b - u}.`, `Take away ${u} to get to 10, then take away ${b - u} more.`), `${a} ${M} ${b} = ${a} ${M} ${u} ${M} ${b - u} = ${r}.`, { hintVisual: hv });
          if (f === 2) return Q(L(`Số thích hợp ở ô ?:\n${a} ${M} ${b} = ${a} ${M} ${u} ${M} ?`, `What is the missing number?\n${a} ${M} ${b} = ${a} ${M} ${u} ${M} ?`), hv, num(b - u), L(`${b} tách thành ${u} và mấy?`, `${b} splits into ${u} and what?`), `${b} = ${u} + ${b - u}.`);
          if (f === 3) {
            const t = P(rng, EN ? [
              `Mum buys ${a} eggs and uses ${b} of them to make a cake. How many eggs are left?`,
              `Our class has ${a} flags. ${b} flags have been put up on the pole. How many flags are not up yet?`,
              `${nm(rng)} has ${a} book labels and has stuck on ${b} of them. How many book labels are still not stuck on?`,
            ] : [
              `Mẹ mua ${a} quả trứng, đã dùng ${b} quả để làm bánh. Hỏi còn lại bao nhiêu quả trứng?`,
              `Lớp em có ${a} lá cờ, đã cắm ${b} lá lên cột. Hỏi còn bao nhiêu lá cờ chưa cắm?`,
              `${nm(rng)} có ${a} nhãn vở, đã dán ${b} nhãn. Hỏi còn bao nhiêu nhãn vở chưa dán?`,
            ]);
            return Q(t, null, num(r), L('Bớt đi thì làm phép trừ.', 'Taking away means subtract.'), `${a} ${M} ${b} = ${r}.`, { hintVisual: hv });
          }
          return Q(L(`Số thích hợp ở ô ?:\n${a} ${M} ? = ${r}`, `What is the missing number?\n${a} ${M} ? = ${r}`), null, num(b), L(`Từ ${a} lùi về ${r} là lùi mấy bước?`, `How many steps back is it from ${a} to ${r}?`), `${a} ${M} ${b} = ${r}.`, { hintVisual: hv });
        }),

      lesson(2, 12, L('Bảng trừ (qua 10)', 'Subtraction facts (bridging 10)'),
        L('Rô-bốt ISA đố bạn Tú trừ nhẩm thật nhanh trên đường đến trường.', 'On the way to school, ISA the robot gives Tú quick subtraction puzzles.'),
        [
          { text: L('11 − 2 = 9, 11 − 3 = 8, … Số trừ thêm 1 thì hiệu bớt 1.', '11 − 2 = 9, 11 − 3 = 8, … Take away 1 more and the difference is 1 less.'), visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 11, to: 9, label: '−2' }] }) },
          { text: L('Dựa vào bảng cộng: 8 + 5 = 13 nên 13 − 5 = 8 và 13 − 8 = 5.', 'Use the addition facts: 8 + 5 = 13, so 13 − 5 = 8 and 13 − 8 = 5.'), visual: vz('objects', { groups: [{ emoji: '🍬', count: 13 }], crossOut: 5 }) },
        ],
        function (rng, i) {
          const [a, b] = subOver10(rng), r = a - b, f = i % 5;
          if (f === 0) return Q(L(`Tính nhẩm: ${a} ${M} ${b} = ?`, `Mental maths: ${a} ${M} ${b} = ?`), null, num(r), L(`Nhớ bảng cộng: ${b} + ? = ${a}.`, `Think of the addition fact: ${b} + ? = ${a}.`), `${a} ${M} ${b} = ${r}.`);
          if (f === 1) return Q(L(`Biết ${r} + ${b} = ${a}. Vậy ${a} ${M} ${b} = ?`, `${r} + ${b} = ${a}. So ${a} ${M} ${b} = ?`), null, ch(rng, r, [b, a, r + 1].filter(x => x !== r)), L('Lấy tổng trừ đi một số hạng thì được số hạng kia.', 'The sum take away one addend gives the other addend.'), `${a} ${M} ${b} = ${r}.`);
          if (f === 2) {
            const [c, d] = subOver10(rng);
            return Q(L(`So sánh: ${a} ${M} ${b} … ${c} ${M} ${d}`, `Compare: ${a} ${M} ${b} … ${c} ${M} ${d}`), vz('compare', { left: `${a} ${M} ${b}`, right: `${c} ${M} ${d}` }), cmpAns(r, c - d), L('Tính hiệu hai bên rồi so sánh.', 'Work out both differences, then compare.'), `${a} ${M} ${b} = ${r}; ${c} ${M} ${d} = ${c - d}.`);
          }
          if (f === 3) return Q(L(`Số thích hợp ở ô ?:\n? ${M} ${b} = ${r}`, `What is the missing number?\n? ${M} ${b} = ${r}`), null, num(a), L('Số bị trừ = hiệu + số trừ.', 'Minuend = difference + subtrahend.'), `${r} + ${b} = ${a}.`);
          const opts = [[a, b], subOver10(rng), subOver10(rng)];
          const target = r;
          const strs = opts.map(([x, y]) => `${x} ${M} ${y}`);
          const wrongs = opts.slice(1).filter(([x, y]) => x - y !== target).map(([x, y]) => `${x} ${M} ${y}`);
          wrongs.push(`${a} ${M} ${b + (b < 9 ? 1 : -1)}`);
          return Q(L(`Phép trừ nào có hiệu bằng ${target}?`, `Which subtraction has a difference of ${target}?`), null, ch(rng, strs[0], wrongs.filter(w => { const [x, y] = w.split(` ${M} `).map(Number); return x - y !== target; })), L('Tính nhẩm từng phép trừ.', 'Work out each subtraction in your head.'), `${a} ${M} ${b} = ${target}.`);
        }),

      lesson(2, 13, L('Bài toán về nhiều hơn, ít hơn một số đơn vị', 'Word problems: more than, fewer than'),
        L('Rô-bốt ISA giúp bạn Thảo và bạn Quân đếm nhãn vở trong ngày đầu năm học.', 'ISA the robot helps Thảo and Quân count book labels on the first day of the school year.'),
        [
          { text: L('Hà có 6 nhãn vở. Lan nhiều hơn Hà 3 nhãn vở. Lan có: 6 + 3 = 9 (nhãn vở).', 'Hà has 6 book labels. Lan has 3 more than Hà. Lan has 6 + 3 = 9 (book labels).'), visual: vz('tape', { bars: [{ label: 'Hà', units: 6, value: '6' }, { label: 'Lan', units: 9, value: '?' }], diff: '3' }) },
          { text: L('Nam có 9 viên bi. Minh ít hơn Nam 4 viên. Minh có: 9 − 4 = 5 (viên bi).', 'Nam has 9 marbles. Minh has 4 fewer than Nam. Minh has 9 − 4 = 5 (marbles).'), visual: vz('tape', { bars: [{ label: 'Nam', units: 9, value: '9' }, { label: 'Minh', units: 5, value: '?' }], diff: '4' }) },
        ],
        function (rng, i) {
          const [n1, n2] = two(rng), it = P(rng, ['nhãn vở', 'viên bi', 'bông hoa', 'quyển truyện', 'cái kẹo']);
          const more = i % 2 === 0;
          const lvl = lv(i);
          let a, b;
          if (more) [a, b] = lvl < 2 ? addOver10(rng) : pairWhere(rng, [20, 70], [10, 25], (x, y) => noCarry(x, y), [42, 15]);
          else [a, b] = lvl < 2 ? subOver10(rng) : pairWhere(rng, [40, 99], [10, 30], (x, y) => x > y && noBorrow(x, y), [68, 25]);
          const r = more ? a + b : a - b;
          const mx = Math.max(a, r);
          const tape = vz('tape', { bars: [{ label: n1, units: units(a, mx), value: F(a) }, { label: n2, units: units(r, mx), value: '?' }], diff: F(b) });
          const stE = `${n1} has ${nE(a, it)}. ${n2} has ${b} ${more ? 'more' : 'fewer'} than ${n1}.`;
          if (i % 4 === 3) {
            return Q(L(`${n1} có ${a} ${it}. ${n2} ${more ? 'nhiều' : 'ít'} hơn ${n1} ${b} ${it}. Em chọn phép tính để tìm số ${it} của ${n2}:`, `${stE} Choose the calculation that finds how many ${wE(it)} ${n2} has:`), tape, ch(rng, more ? `${a} + ${b}` : `${a} ${M} ${b}`, [more ? `${a} ${M} ${b}` : `${a} + ${b}`, `${b} + ${b}`]), more ? L('Nhiều hơn thì cộng.', '"More than" means add.') : L('Ít hơn thì trừ.', '"Fewer than" means subtract.'), `${more ? `${a} + ${b}` : `${a} ${M} ${b}`} = ${r} (${L(it, wE(it, r))}).`);
          }
          return Q(L(`${n1} có ${a} ${it}. ${n2} ${more ? 'nhiều' : 'ít'} hơn ${n1} ${b} ${it}. Hỏi ${n2} có bao nhiêu ${it}?`, `${stE} How many ${wE(it)} does ${n2} have?`), tape, num(r), more ? L('Nhiều hơn thì làm phép cộng.', '"More than" means add.') : L('Ít hơn thì làm phép trừ.', '"Fewer than" means subtract.'), L(`Số ${it} của ${n2} là: ${more ? `${a} + ${b}` : `${a} ${M} ${b}`} = ${r} (${it}).`, `${n2} has ${more ? `${a} + ${b}` : `${a} ${M} ${b}`} = ${r} (${wE(it, r)}).`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. LÀM QUEN VỚI KHỐI LƯỢNG, DUNG TÍCH ============
  function weightsFor(w) { const out = []; let x = w; for (const k of [5, 2, 1]) while (x >= k) { out.push({ label: k + ' kg', kg: k }); x -= k; } return out; }
  const FRUIT = [{ n: 'quả dưa hấu', en: 'watermelon', e: '🍉' }, { n: 'quả bí ngô', en: 'pumpkin', e: '🎃' }, { n: 'túi gạo', en: 'bag of rice', e: '🌾' }, { n: 'quả dưa lưới', en: 'melon', e: '🍈' }, { n: 'túi cam', en: 'bag of oranges', e: '🍊' }];
  const c3 = {
    id: 'g2-c3', semester: 1, title: L('Làm quen với khối lượng, dung tích', 'Getting to know mass and capacity'), icon: '⚖️', lessons: [
      lesson(3, 15, L('Ki-lô-gam', 'Kilograms'),
        L('Rô-bốt ISA theo mẹ bạn Hà ra chợ cân dưa hấu bằng chiếc cân đĩa.', 'ISA the robot goes to the market with Hà\'s mum to weigh watermelons on a balance scale.'),
        [
          { text: L('Ki-lô-gam là đơn vị đo khối lượng, viết tắt là kg. Cân thăng bằng: quả dưa nặng bằng 3 quả cân 1 kg, tức là 3 kg.', 'The kilogram is a unit of mass. We write it kg. The scale balances: the watermelon weighs the same as three 1 kg weights, so it weighs 3 kg.'), visual: vz('scale', { left: [{ label: '🍉', kg: 3 }], right: [{ label: '1 kg', kg: 1 }, { label: '1 kg', kg: 1 }, { label: '1 kg', kg: 1 }] }) },
          { text: L('Đĩa cân nào nặng hơn thì lệch xuống thấp hơn.', 'The heavier pan goes down lower.'), visual: vz('scale', { left: [{ label: '🎃', kg: 5 }], right: [{ label: '🍉', kg: 2 }] }) },
          { text: L('Tính với số đo khối lượng như với số, nhớ ghi "kg": 5 kg + 3 kg = 8 kg.', 'Calculate with masses just like numbers, and remember to write "kg": 5 kg + 3 kg = 8 kg.') },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) {
            const w = R(rng, 2, lv(i) === 0 ? 5 : 9), it = P(rng, FRUIT);
            return Q(L(`Cân thăng bằng. ${it.n[0].toUpperCase() + it.n.slice(1)} nặng mấy ki-lô-gam?`, `The scale balances. How many kilograms does the ${it.en} weigh?`), vz('scale', { left: [{ label: it.e, kg: w }], right: weightsFor(w) }), num(w, 'kg'), L('Cộng các quả cân ở đĩa bên kia.', 'Add up the weights on the other pan.'), (weightsFor(w).length > 1 ? `${weightsFor(w).map(x => x.kg).join(' + ')} = ${w} (kg).` : L(`Cân thăng bằng với quả cân ${w} kg.`, `It balances the ${w} kg weight.`)));
          }
          if (f === 1) {
            const [a, b] = pairWhere(rng, [2, 40], [1, 30], (x, y) => noCarry(x, y), [12, 5]);
            return Q(`${a} kg + ${b} kg = ?`, null, num(a + b, 'kg'), L('Cộng các số rồi viết thêm "kg".', 'Add the numbers, then write "kg".'), `${a} kg + ${b} kg = ${a + b} kg.`);
          }
          if (f === 2) {
            const [x, y] = U.sample(rng, FRUIT, 2);
            const a = R(rng, 1, 9); let b = R(rng, 1, 9); if (b === a) b = a === 9 ? 8 : a + 1;
            const cap = s => s[0].toUpperCase() + s.slice(1);
            const nx = L(x.n, 'The ' + x.en), ny = L(y.n, 'The ' + y.en);
            return Q(L(`Vật nào nặng hơn?`, 'Which is heavier?'), vz('scale', { left: [{ label: x.e, kg: a }], right: [{ label: y.e, kg: b }] }), ch(rng, cap(a > b ? nx : ny), [cap(a > b ? ny : nx), L('Hai vật nặng bằng nhau', 'They weigh the same')]), L('Đĩa cân nào thấp hơn thì vật trên đĩa đó nặng hơn.', 'The thing on the lower pan is heavier.'), L(`${cap(a > b ? x.n : y.n)} nặng hơn.`, `${a > b ? nx : ny} is heavier.`));
          }
          if (f === 3) {
            const [a, b] = pairWhere(rng, [10, 50], [5, 40], (x, y) => noCarry(x, y), [25, 13]);
            return Q(L(`Bao gạo nặng ${a} kg, bao ngô nặng ${b} kg. Cả hai bao nặng bao nhiêu ki-lô-gam?`, `A sack of rice weighs ${a} kg and a sack of maize weighs ${b} kg. How many kilograms do the two sacks weigh altogether?`), vz('tape', { bars: [{ label: L('Gạo', 'Rice'), units: units(a, Math.max(a, b)), value: a + ' kg' }, { label: L('Ngô', 'Maize'), units: units(b, Math.max(a, b)), value: b + ' kg' }], total: '?' }), num(a + b, 'kg'), L('Tìm cả hai thì cộng.', 'To find both together, add.'), `${a} + ${b} = ${a + b} (kg).`);
          }
          const [a, b] = pairWhere(rng, [20, 60], [5, 30], (x, y) => x > y && noBorrow(x, y), [35, 12]);
          return Q(L(`Thùng có ${a} kg đường, người ta đã bán ${b} kg. Trong thùng còn lại bao nhiêu ki-lô-gam đường?`, `A bin holds ${a} kg of sugar. ${b} kg is sold. How many kilograms of sugar are left in the bin?`), null, num(a - b, 'kg'), L('Bớt đi thì trừ.', 'Taking away means subtract.'), `${a} ${M} ${b} = ${a - b} (kg).`);
        }),

      lesson(3, 16, L('Lít', 'Litres'),
        L('Rô-bốt ISA giúp bạn Phúc rót nước chanh mời cả lớp trong buổi liên hoan.', 'ISA the robot helps Phúc pour lemonade for the whole class at the party.'),
        [
          { text: L('Lít là đơn vị đo dung tích (sức chứa), viết tắt là l. Bình này đang chứa 3 l nước.', 'The litre is a unit of capacity (how much something holds). We write it l. This jug has 3 l of water in it.'), visual: vz('jug', { capacity: 5, amount: 3, unit: 'l' }) },
          { text: L('Rót 2 l rồi rót thêm 3 l: có tất cả 2 l + 3 l = 5 l.', 'Pour in 2 l, then 3 l more: altogether 2 l + 3 l = 5 l.'), visual: vz('jug', { capacity: 5, amount: 5, unit: 'l' }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) {
            const cap = P(rng, [5, 10]), a = R(rng, 1, cap);
            return Q(L('Trong bình có mấy lít nước?', 'How many litres of water are in the jug?'), vz('jug', { capacity: cap, amount: a, unit: 'l' }), num(a, 'l'), L('Nhìn mực nước ứng với vạch số mấy.', 'Look at which mark the water reaches.'), L(`Bình có ${a} l nước.`, `The jug has ${a} l of water.`));
          }
          if (f === 1) {
            const [a, b] = pairWhere(rng, [1, 40], [1, 30], (x, y) => noCarry(x, y), [5, 3]);
            return Q(`${a} l + ${b} l = ?`, null, num(a + b, 'l'), L('Cộng các số rồi viết thêm "l".', 'Add the numbers, then write "l".'), `${a} l + ${b} l = ${a + b} l.`);
          }
          if (f === 2) {
            const a = R(rng, 1, 9); let b = R(rng, 1, 9); if (a === b) b = a === 1 ? 2 : a - 1;
            const blue = L('Can xanh', 'The blue can'), red = L('Can đỏ', 'The red can');
            return Q(L(`Can xanh đựng ${a} l nước, can đỏ đựng ${b} l nước. Can nào đựng nhiều nước hơn?`, `The blue can holds ${a} l of water and the red can holds ${b} l. Which can holds more water?`), null, ch(rng, a > b ? blue : red, [a > b ? red : blue, L('Bằng nhau', 'They hold the same')]), L('So sánh hai số đo.', 'Compare the two amounts.'), `${Math.max(a, b)} l > ${Math.min(a, b)} l.`);
          }
          const [a, b] = pairWhere(rng, [10, 40], [2, 20], (x, y) => x > y && noBorrow(x, y), [18, 5]);
          return Q(L(`Thùng có ${a} l nước mắm, mẹ đã rót ra ${b} l. Thùng còn lại bao nhiêu lít nước mắm?`, `A barrel holds ${a} l of fish sauce. Mum pours out ${b} l. How many litres of fish sauce are left in the barrel?`), null, num(a - b, 'l'), L('Bớt đi thì trừ.', 'Taking away means subtract.'), `${a} ${M} ${b} = ${a - b} (l).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. PHÉP CỘNG, PHÉP TRỪ (CÓ NHỚ) TRONG PHẠM VI 100 ============
  const c4 = {
    id: 'g2-c4', semester: 1, title: L('Phép cộng, phép trừ (có nhớ) trong phạm vi 100', 'Addition and subtraction to 100 (with carrying)'), icon: '🧮', lessons: [
      lesson(4, 19, L('Phép cộng (có nhớ) số có hai chữ số với số có một chữ số', 'Adding a 1-digit number to a 2-digit number (with carrying)'),
        L('Rô-bốt ISA cùng bạn Minh đếm cây giống trồng quanh sân trường.', 'ISA the robot and Minh count the young trees planted around the school playground.'),
        [
          { text: L('36 + 8: 6 cộng 8 bằng 14, viết 4 nhớ 1; 3 thêm 1 bằng 4, viết 4. Vậy 36 + 8 = 44.', '36 + 8: 6 plus 8 is 14, write 4 and carry 1; 3 plus the 1 carried is 4, write 4. So 36 + 8 = 44.'), visual: vz('columnCalc', { a: 36, b: 8, op: '+', reveal: 'all' }) },
          { text: L('10 khối đơn vị gộp thành 1 thanh chục mới — đó là "nhớ 1".', '10 ones cubes join to make 1 new tens rod — that is "carry 1".'), visual: vz('blocks', { hundreds: 0, tens: 3, ones: 14 }) },
        ],
        colGen('+', (r, lvl) => pairWhere(r, lvl === 0 ? [11, 49] : [20, 89], [2, 9], (a, b) => (a % 10) + b >= 10 && a + b <= 99, [36, 8]), { carry: true })),
      lesson(4, 20, L('Phép cộng (có nhớ) số có hai chữ số với số có hai chữ số', 'Adding two 2-digit numbers (with carrying)'),
        L('Rô-bốt ISA giúp bạn Trang cộng số sách hai lớp quyên góp cho thư viện.', 'ISA the robot helps Trang add up the books two classes give to the library.'),
        [
          { text: L('47 + 25: 7 cộng 5 bằng 12, viết 2 nhớ 1; 4 cộng 2 bằng 6, thêm 1 bằng 7, viết 7. Vậy 47 + 25 = 72.', '47 + 25: 7 plus 5 is 12, write 2 and carry 1; 4 plus 2 is 6, plus the 1 carried is 7, write 7. So 47 + 25 = 72.'), visual: vz('columnCalc', { a: 47, b: 25, op: '+', reveal: 'all' }) },
          { text: L('Gộp các khối: 4 chục + 2 chục + 1 chục nhớ = 7 chục.', 'Put the blocks together: 4 tens + 2 tens + 1 ten carried = 7 tens.'), visual: vz('blocks', { hundreds: 0, tens: 6, ones: 12 }) },
        ],
        colGen('+', (r, lvl) => pairWhere(r, [11, 79], lvl === 0 ? [11, 29] : [11, 69], (a, b) => (a % 10) + (b % 10) >= 10 && a + b <= 100, [47, 25]), { carry: true })),
      lesson(4, 22, L('Phép trừ (có nhớ) số có hai chữ số cho số có một chữ số', 'Subtracting a 1-digit number from a 2-digit number (with borrowing)'),
        L('Rô-bốt ISA cùng bạn Dũng bán bánh ở hội chợ Xuân của trường.', 'ISA the robot and Dũng sell cakes at the school Spring Fair.'),
        [
          { text: L('32 − 5: 2 không trừ được 5, lấy 12 trừ 5 bằng 7, viết 7 nhớ 1; 3 trừ 1 bằng 2, viết 2. Vậy 32 − 5 = 27.', '32 − 5: you cannot take 5 from 2, so take 5 from 12. 12 − 5 = 7, write 7 and carry 1. Then 3 − 1 = 2, write 2. So 32 − 5 = 27.'), visual: vz('columnCalc', { a: 32, b: 5, op: M, reveal: 'all' }) },
          { text: L('Đổi 1 thanh chục thành 10 khối đơn vị để có đủ khối mà bớt.', 'Exchange 1 tens rod for 10 ones cubes, so there are enough to take away.'), visual: vz('blocks', { hundreds: 0, tens: 2, ones: 12 }) },
        ],
        colGen(M, (r, lvl) => pairWhere(r, lvl === 0 ? [11, 40] : [20, 99], [2, 9], (a, b) => (a % 10) < b, [32, 5]), { carry: true })),
      lesson(4, 23, L('Phép trừ (có nhớ) số có hai chữ số cho số có hai chữ số', 'Subtracting a 2-digit number from a 2-digit number (with borrowing)'),
        L('Rô-bốt ISA giúp bạn Việt tính số học sinh còn lại trên sân sau giờ chào cờ.', 'ISA the robot helps Việt work out how many pupils are still in the playground after the flag ceremony.'),
        [
          { text: L('62 − 28: 2 không trừ được 8, lấy 12 trừ 8 bằng 4, viết 4 nhớ 1; 2 thêm 1 bằng 3, 6 trừ 3 bằng 3, viết 3. Vậy 62 − 28 = 34.', '62 − 28: you cannot take 8 from 2, so take 8 from 12. 12 − 8 = 4, write 4 and carry 1. Then 2 + 1 = 3 and 6 − 3 = 3, write 3. So 62 − 28 = 34.'), visual: vz('columnCalc', { a: 62, b: 28, op: M, reveal: 'all' }) },
          { text: L('Thử lại bằng phép cộng: 34 + 28 = 62. Đúng!', 'Check with an addition: 34 + 28 = 62. That\'s right!'), visual: vz('columnCalc', { a: 34, b: 28, op: '+', reveal: 'all' }) },
        ],
        colGen(M, (r, lvl) => pairWhere(r, lvl === 0 ? [21, 60] : [30, 99], [11, 89], (a, b) => a > b && (a % 10) < (b % 10), [62, 28]), { carry: true })),
    ],
  };

  // ============ CHỦ ĐỀ 5. LÀM QUEN VỚI HÌNH PHẲNG ============
  const QUADS = ['quad', 'rect', 'square', 'trapezoid'];
  const c5 = {
    id: 'g2-c5', semester: 1, title: L('Làm quen với hình phẳng', 'Getting to know flat shapes'), icon: '📐', lessons: [
      lesson(5, 25, L('Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng', 'Points, line segments, straight lines, curves, three points in a line'),
        L('Rô-bốt ISA dùng thước kẻ đo những sợi ruy băng để trang trí lớp học cùng bạn Chi.', 'ISA the robot and Chi use a ruler to measure ribbons for decorating the classroom.'),
        [
          { text: L('Đặt đầu sợi ruy băng trùng vạch 0 của thước. Đầu kia ở vạch 7: ruy băng dài 7 cm.', 'Put one end of the ribbon on the 0 mark of the ruler. The other end is at 7, so the ribbon is 7 cm long.'), visual: vz('ruler', { length: 7, unit: 'cm', object: 'ribbon' }) },
          { text: L('Hình tam giác có 3 cạnh là 3 đoạn thẳng; hình tứ giác có 4 cạnh.', 'A triangle has 3 sides, which are 3 line segments. A quadrilateral has 4 sides.'), visual: vz('shapeSet', { items: ['triangle', 'quad'] }) },
          { text: L('Ba điểm cùng nằm trên một đường thẳng gọi là ba điểm thẳng hàng.', 'Three points on the same straight line are called three points in a line.') },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) {
            const len = R(rng, 3, 15), obj = P(rng, ['ribbon', 'pencil']);
            return Q(L(`${obj === 'pencil' ? 'Chiếc bút chì' : 'Sợi ruy băng'} dài mấy xăng-ti-mét?`, `How many centimetres long is the ${obj === 'pencil' ? 'pencil' : 'ribbon'}?`), vz('ruler', { length: len, unit: 'cm', object: obj }), num(len, 'cm'), L('Đọc số ở vạch thước trùng với đầu bên phải.', 'Read the number on the ruler at the right-hand end.'), L(`Dài ${len} cm.`, `It is ${len} cm long.`));
          }
          if (f === 1) {
            const k = P(rng, ['triangle', 'quad', 'rect', 'square']);
            const n = k === 'triangle' ? 3 : 4;
            const nameK = EN ? { triangle: 'a triangle', quad: 'a quadrilateral', rect: 'a rectangle', square: 'a square' }[k] : { triangle: 'hình tam giác', quad: 'hình tứ giác', rect: 'hình chữ nhật', square: 'hình vuông' }[k];
            return Q(L('Hình này có mấy cạnh?', 'How many sides does this shape have?'), vz('shape', { kind: k }), ch(rng, n, [2, 3, 4, 5].filter(x => x !== n)), L('Đếm các đoạn thẳng tạo thành hình.', 'Count the line segments that make the shape.'), L(`${nameK[0].toUpperCase() + nameK.slice(1)} có ${n} cạnh.`, `${nameK[0].toUpperCase() + nameK.slice(1)} has ${n} sides.`));
          }
          if (f === 2) {
            const a = R(rng, 2, 9), b = R(rng, 2, 9);
            const [p1, p2, p3] = P(rng, [['A', 'B', 'C'], ['M', 'N', 'P'], ['D', 'E', 'G']]);
            // picture: the two named segments with their end points lettered and their lengths marked
            return Q(L(`Đoạn thẳng ${p1}${p2} dài ${a} cm, đoạn thẳng ${p2}${p3} dài ${b} cm. Tổng độ dài hai đoạn thẳng là bao nhiêu xăng-ti-mét?`, `Line segment ${p1}${p2} is ${a} cm long and line segment ${p2}${p3} is ${b} cm long. How many centimetres long are the two segments together?`), vz('shape', { kind: 'polyline', dims: { segments: [a, b] }, showDims: true, label: p1 + p2 + p3 }), num(a + b, 'cm'), L('Cộng hai độ dài.', 'Add the two lengths.'), `${a} + ${b} = ${a + b} (cm).`);
          }
          const qs = EN ? [
            ['Three points on the same straight line are called three points …', 'in a line', ['upright', 'curved', 'round']],
            ['How many straight lines can you draw through two points A and B?', '1', ['2', '3', '0']],
            ['What kind of line is the edge of a round plate?', 'A curved line', ['A straight line', 'A line segment', 'A zigzag line']],
            ['The edge of a ruler is a picture of …', 'a line segment', ['a curved line', 'a circle', 'a point']],
          ] : [
            ['Ba điểm cùng nằm trên một đường thẳng gọi là ba điểm …', 'thẳng hàng', ['thẳng đứng', 'cong', 'tròn']],
            ['Qua hai điểm A và B vẽ được mấy đường thẳng?', '1', ['2', '3', '0']],
            ['Đường viền của chiếc đĩa tròn là đường gì?', 'Đường cong', ['Đường thẳng', 'Đoạn thẳng', 'Đường gấp khúc']],
            ['Mép thước kẻ cho ta hình ảnh của …', 'đoạn thẳng', ['đường cong', 'hình tròn', 'điểm']],
          ];
          const [p, c, d] = P(rng, qs);
          return Q(p, null, ch(rng, c, d), L('Nhớ lại các hình đã học: điểm, đoạn thẳng, đường thẳng, đường cong.', 'Think back to what you have learnt: points, line segments, straight lines and curves.'), L(`Đáp án: ${c}.`, `Answer: ${c}.`));
        }),

      lesson(5, 26, L('Đường gấp khúc. Hình tứ giác', 'Zigzag lines. Quadrilaterals'),
        L('Rô-bốt ISA đi theo con đường gấp khúc trong công viên để tìm bạn Hà.', 'ISA the robot follows a zigzag path in the park to find Hà.'),
        [
          { text: L('Đường gấp khúc gồm nhiều đoạn thẳng nối tiếp nhau. Độ dài đường gấp khúc là tổng độ dài các đoạn: 3 + 4 + 2 = 9 (cm).', 'A zigzag line is made of line segments joined end to end. Its length is the sum of the lengths of the segments: 3 + 4 + 2 = 9 (cm).'), visual: vz('shape', { kind: 'polyline', dims: { segments: [3, 4, 2] }, showDims: true }) },
          { text: L('Hình tứ giác có 4 cạnh và 4 đỉnh. Hình chữ nhật, hình vuông cũng là hình tứ giác.', 'A quadrilateral has 4 sides and 4 corners (vertices). Rectangles and squares are quadrilaterals too.'), visual: vz('shapeSet', { items: ['quad', 'rect', 'square', 'trapezoid'] }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) {
            const n = lv(i) === 0 ? 2 : R(rng, 3, 4);
            const segs = Array.from({ length: n }, () => R(rng, 2, 9));
            const s = segs.reduce((x, y) => x + y, 0);
            return Q(L(`Tính độ dài đường gấp khúc.`, 'Work out the length of the zigzag line.'), vz('shape', { kind: 'polyline', dims: { segments: segs }, showDims: true }), num(s, 'cm'), L('Cộng độ dài tất cả các đoạn thẳng.', 'Add the lengths of all the segments.'), `${segs.join(' + ')} = ${s} (cm).`);
          }
          if (f === 1) {
            const items = U.shuffle(rng, [P(rng, QUADS), P(rng, QUADS), 'triangle', 'circle', P(rng, ['triangle', 'circle', 'quad'])]);
            const want = items.map((k, j) => (QUADS.includes(k) ? j : -1)).filter(j => j >= 0);
            return Q(L('Chạm chọn tất cả các hình tứ giác.', 'Tap all the quadrilaterals.'), vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) }, L('Hình tứ giác có đúng 4 cạnh.', 'A quadrilateral has exactly 4 sides.'), L(`Có ${want.length} hình tứ giác.`, `There ${want.length === 1 ? 'is 1 quadrilateral' : `are ${want.length} quadrilaterals`}.`));
          }
          if (f === 2) {
            const n = R(rng, 2, 5);
            const segs = Array.from({ length: n }, () => R(rng, 2, 6));
            return Q(L('Đường gấp khúc này gồm mấy đoạn thẳng?', 'How many line segments make this zigzag line?'), vz('shape', { kind: 'polyline', dims: { segments: segs }, showDims: false }), num(n), L('Đếm từng đoạn thẳng nối tiếp nhau.', 'Count the segments one by one.'), L(`Đường gấp khúc gồm ${n} đoạn thẳng.`, `The zigzag line has ${n} line segments.`));
          }
          const seg = R(rng, 2, 9), n = R(rng, 3, 4);
          return Q(L(`Một đường gấp khúc gồm ${n} đoạn thẳng, mỗi đoạn dài ${seg} cm. Độ dài đường gấp khúc là bao nhiêu?`, `A zigzag line has ${n} line segments. Each segment is ${seg} cm long. How long is the zigzag line?`), vz('shape', { kind: 'polyline', dims: { segments: Array(n).fill(seg) }, showDims: true }), num(seg * n, 'cm'), L('Cộng các độ dài bằng nhau.', 'Add the equal lengths.'), `${Array(n).fill(seg).join(' + ')} = ${seg * n} (cm).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. NGÀY – GIỜ, GIỜ – PHÚT, NGÀY – THÁNG ============
  const WD = EN ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const MON = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  // English: 7 o'clock, quarter past 7, half past 7, quarter to 8 (minutes are 0, 15, 30 or 45 here)
  const timeEN = (h, m) => (m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}` : m === 45 ? `quarter to ${h % 12 + 1}` : `${h}:${String(m).padStart(2, '0')}`);
  const timeStr = (h, m) => (EN ? timeEN(h, m) : m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`);
  const c6 = {
    id: 'g2-c6', semester: 1, title: L('Ngày – giờ, giờ – phút, ngày – tháng', 'Days and hours, hours and minutes, days and months'), icon: '🕐', lessons: [
      lesson(6, 29, L('Ngày – giờ, giờ – phút', 'Days and hours, hours and minutes'),
        L('Rô-bốt ISA nhắc bạn Nam xem đồng hồ để đi học đúng giờ.', 'ISA the robot reminds Nam to look at the clock so he gets to school on time.'),
        [
          { text: L('Một ngày có 24 giờ. Một giờ có 60 phút.', 'A day has 24 hours. An hour has 60 minutes.'), visual: vz('clock', { h: 7, m: 0 }) },
          { text: L('Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 3 là 15 phút, chỉ số 6 là 30 phút (giờ rưỡi).', 'The short hand shows the hour and the long hand shows the minutes. When the long hand points to 3, it is 15 minutes past (quarter past). When it points to 6, it is 30 minutes past (half past).'), visual: vz('clock', { h: 8, m: 30 }) },
          { text: L('15 giờ còn gọi là 3 giờ chiều; 20 giờ còn gọi là 8 giờ tối.', '15:00 is also 3 o\'clock in the afternoon. 20:00 is 8 o\'clock in the evening.'), visual: vz('clock', { h: 15, m: 0, digital: true }) },
        ],
        function (rng, i) {
          const f = i % 5;
          const h = R(rng, 1, 12), m = lv(i) === 0 ? P(rng, [0, 30]) : P(rng, [0, 15, 30]);
          if (f === 0) return Q(L('Đồng hồ chỉ mấy giờ?', 'What time does the clock show?'), vz('clock', { h, m }), ch(rng, timeStr(h, m), [timeStr(h % 12 + 1, m), timeStr(h, (m + 30) % 60), timeStr(h, m === 15 ? 0 : 15), timeStr(h === 1 ? 12 : h - 1, m)]), L('Nhìn kim ngắn trước để biết giờ, rồi nhìn kim dài để biết phút.', 'Look at the short hand first for the hour, then the long hand for the minutes.'), L(`Đồng hồ chỉ ${timeStr(h, m)}.`, `The clock shows ${timeStr(h, m)}.`));
          if (f === 1) return Q(L(`Em hãy quay kim đồng hồ để chỉ ${timeStr(h, m)}.`, `Move the clock hands to show ${timeStr(h, m)}.`), vz('clock', { h: 12, m: 0 }), { kind: 'visual', check: v => v && ((v.h % 12) + 12) % 12 === h % 12 && v.m === m }, m === 0 ? L('Kim dài chỉ số 12, kim ngắn chỉ số giờ.', 'The long hand points to 12 and the short hand points to the hour.') : L(`Kim dài chỉ số ${m / 5}.`, `The long hand points to ${m / 5}.`), L(`${timeStr(h, m)}: kim ngắn ${m === 0 ? 'chỉ đúng số ' + h : m === 30 ? 'ở giữa số ' + h + ' và số ' + (h % 12 + 1) : 'qua số ' + h + ' một chút'}, kim dài ở số ${m === 0 ? 12 : m / 5}.`, `${cap(timeStr(h, m))}: the short hand ${m === 0 ? 'points straight at ' + h : m === 30 ? 'is halfway between ' + h + ' and ' + (h % 12 + 1) : 'is just past ' + h}, and the long hand points to ${m === 0 ? 12 : m / 5}.`));
          if (f === 2) {
            const hh = R(rng, 13, 23);
            const part = hh < 18 ? 'chiều' : 'tối', partE = hh < 18 ? 'afternoon' : 'evening';
            return Q(L(`${hh} giờ còn gọi là mấy giờ ${part}?`, `${hh}:00 is ? o'clock in the ${partE}. What is the missing number?`), vz('clock', { h: hh, m: 0, digital: true }), num(hh - 12), L(`Lấy ${hh} ${M} 12.`, `Work out ${hh} ${M} 12.`), L(`${hh} giờ hay ${hh - 12} giờ ${part}.`, `${hh}:00 is ${hh - 12} o'clock in the ${partE}.`));
          }
          if (f === 3) {
            const qq = P(rng, EN ? [['1 day = ? hours', 24], ['1 hour = ? minutes', 60]] : [['1 ngày = ? giờ', 24], ['1 giờ = ? phút', 60]]);
            return Q(qq[0], vz('clock', { h: 12, m: 0 }), num(qq[1]), L('Nhớ: một ngày có 24 giờ, một giờ có 60 phút.', 'Remember: a day has 24 hours and an hour has 60 minutes.'), `${qq[0].replace('?', qq[1])}.`);
          }
          const s = R(rng, 7, 9), d = R(rng, 1, 3), who = nm(rng);
          return Q(L(`${who} bắt đầu làm bài lúc ${s} giờ và làm xong lúc ${s + d} giờ. ${who} làm bài trong mấy giờ?`, `${who} starts homework at ${s} o'clock and finishes at ${s + d} o'clock. How many hours does ${who} spend on homework?`), vz('clock', { h: s + d, m: 0 }), num(d, L('giờ', d === 1 ? 'hour' : 'hours')), L('Đếm từ giờ bắt đầu đến giờ kết thúc.', 'Count the hours from the start time to the finish time.'), `${s + d} ${M} ${s} = ${d} (${L('giờ', d === 1 ? 'hour' : 'hours')}).`);
        }),

      lesson(6, 30, L('Ngày – tháng', 'Days and months'),
        L('Rô-bốt ISA cùng bạn Lan xem tờ lịch để đánh dấu ngày Nhà giáo Việt Nam.', 'ISA the robot and Lan look at the calendar to mark Vietnamese Teachers\' Day.'),
        [
          { text: L('Tờ lịch tháng 11 năm 2026: tháng 11 có 30 ngày. Ngày 20 tháng 11 là Ngày Nhà giáo Việt Nam.', 'This is the calendar page for November 2026. November has 30 days. 20 November is Vietnamese Teachers\' Day.'), visual: vz('calendar', { year: 2026, month: 11, highlight: [20] }) },
          { text: L('Hai ngày cùng cột trên tờ lịch cách nhau 7 ngày (1 tuần).', 'Two dates in the same column of the calendar are 7 days (1 week) apart.'), visual: vz('calendar', { year: 2026, month: 11, highlight: [6, 13] }) },
        ],
        function (rng, i) {
          const y = P(rng, [2026, 2027]), mo = R(rng, 1, 12), dim = daysIn(y, mo);
          const f = i % 4;
          if (f === 0) return Q(L(`Tháng ${mo} năm ${y} có bao nhiêu ngày?`, `How many days are there in ${MON[mo]} ${y}?`), vz('calendar', { year: y, month: mo }), num(dim, L('ngày', 'days')), L('Nhìn ngày cuối cùng trên tờ lịch.', 'Look at the last date on the calendar page.'), L(`Tháng ${mo} có ${dim} ngày.`, `${MON[mo]} has ${dim} days.`));
          if (f === 1) {
            const d = R(rng, 1, dim), wd = new Date(y, mo - 1, d).getDay();
            return Q(L(`Ngày ${d} tháng ${mo} năm ${y} là thứ mấy?`, `What day of the week is ${d} ${MON[mo]} ${y}?`), vz('calendar', { year: y, month: mo, highlight: [d] }), ch(rng, WD[wd], [WD[(wd + 1) % 7], WD[(wd + 6) % 7], WD[(wd + 2) % 7]]), L('Tìm ngày được tô màu rồi nhìn lên đầu cột.', 'Find the coloured date, then look at the top of its column.'), L(`Ngày ${d} tháng ${mo} là ${WD[wd].toLowerCase()}.`, `${d} ${MON[mo]} is a ${WD[wd]}.`));
          }
          if (f === 2) {
            const want = R(rng, 1, 6);
            let d = 1; while (new Date(y, mo - 1, d).getDay() !== want) d++;
            return Q(L(`Ngày ${WD[want]} đầu tiên của tháng ${mo} năm ${y} là ngày nào?`, `What is the date of the first ${WD[want]} in ${MON[mo]} ${y}?`), vz('calendar', { year: y, month: mo }), num(d), L(`Tìm cột ${WD[want]} trên tờ lịch.`, `Find the ${WD[want]} column on the calendar.`), L(`Đó là ngày ${d} tháng ${mo}.`, `It is ${d} ${MON[mo]}.`));
          }
          const d = R(rng, 1, dim - 7), wd = new Date(y, mo - 1, d).getDay();
          return Q(L(`Hôm nay là ${WD[wd].toLowerCase()} ngày ${d} tháng ${mo}. ${WD[wd]} tuần sau là ngày nào?`, `Today is ${WD[wd]} ${d} ${MON[mo]}. What is the date on ${WD[wd]} next week?`), vz('calendar', { year: y, month: mo, highlight: [d] }), num(d + 7), L('Một tuần có 7 ngày.', 'A week has 7 days.'), L(`${d} + 7 = ${d + 7}. Đó là ngày ${d + 7} tháng ${mo}.`, `${d} + 7 = ${d + 7}. It is ${d + 7} ${MON[mo]}.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. PHÉP NHÂN, PHÉP CHIA ============
  const MUL2 = [
    { per: 'Mỗi con gà có 2 chân.', who: 'con gà', what: 'cái chân', e: '🐔', en: { per: 'Each hen has 2 legs.', who: ['hen', 'hens'], what: 'legs' } },
    { per: 'Mỗi đôi đũa có 2 chiếc.', who: 'đôi đũa', what: 'chiếc đũa', e: '🥢', en: { per: 'Each pair of chopsticks has 2 chopsticks.', who: ['pair of chopsticks', 'pairs of chopsticks'], what: 'chopsticks' } },
    { per: 'Mỗi bạn có 2 bàn tay.', who: 'bạn', what: 'bàn tay', e: '🧒', en: { per: 'Each child has 2 hands.', who: ['child', 'children'], what: 'hands' } },
  ];
  const MUL5 = [
    { per: 'Mỗi bàn tay có 5 ngón tay.', who: 'bàn tay', what: 'ngón tay', e: '🖐️', en: { per: 'Each hand has 5 fingers.', who: ['hand', 'hands'], what: 'fingers' } },
    { per: 'Mỗi bông hoa có 5 cánh.', who: 'bông hoa', what: 'cánh hoa', e: '🌸', en: { per: 'Each flower has 5 petals.', who: ['flower', 'flowers'], what: 'petals' } },
    { per: 'Mỗi hộp có 5 cái bánh.', who: 'hộp', what: 'cái bánh', e: '📦', en: { per: 'Each box has 5 cakes.', who: ['box', 'boxes'], what: 'cakes' } },
  ];
  const DIV2 = [
    { q: (p, n) => `Có ${p} cái kẹo chia đều cho ${n} bạn. Mỗi bạn được mấy cái kẹo?`, e: '🍬', unit: 'cái kẹo', plate: 'bạn',
      en: { q: (p, n) => `${p} sweets are shared equally between ${n} children. How many sweets does each child get?`, unit: ['sweet', 'sweets'], plate: 'child' } },
    { q: (p, n) => `Có ${p} chiếc đũa, mỗi đôi có ${n} chiếc. Có mấy đôi đũa?`, e: '🥢', unit: 'đôi đũa', bySize: true,
      en: { q: (p, n) => `There are ${p} chopsticks. Each pair has ${n} chopsticks. How many pairs of chopsticks are there?`, unit: ['pair', 'pairs'] } },
  ];
  const DIV5 = [
    { q: (p, n) => `Có ${p} quả cam xếp đều vào ${n} đĩa. Mỗi đĩa có mấy quả cam?`, e: '🍊', unit: 'quả cam', plate: 'đĩa',
      en: { q: (p, n) => `${p} oranges are put equally onto ${n} plates. How many oranges are on each plate?`, unit: ['orange', 'oranges'], plate: 'plate' } },
    { q: (p, n) => `Có ${p} bạn chia đều thành ${n} tổ. Mỗi tổ có mấy bạn?`, e: '🧒', unit: 'bạn', plate: 'tổ',
      en: { q: (p, n) => `${p} children are split equally into ${n} groups. How many children are in each group?`, unit: ['child', 'children'], plate: 'group' } },
  ];
  const c8 = {
    id: 'g2-c8', semester: 2, title: L('Phép nhân, phép chia', 'Multiplication and division'), icon: '✖️', lessons: [
      lesson(8, 37, L('Phép nhân', 'Multiplication'),
        L('Rô-bốt ISA xếp bánh vào các đĩa bằng nhau cho bữa tiệc của bạn Bình.', 'ISA the robot puts equal amounts of food on plates for Bình\'s party.'),
        [
          { text: L('Mỗi đĩa có 2 quả, có 3 đĩa: 2 + 2 + 2 = 6. Ta viết 2 × 3 = 6, đọc là "hai nhân ba bằng sáu".', 'There are 2 apples on each plate and 3 plates: 2 + 2 + 2 = 6. We write 2 × 3 = 6 and say "two times three equals six".'), visual: vz('objects', { groups: [{ emoji: '🍎', count: 2 }, { emoji: '🍎', count: 2 }, { emoji: '🍎', count: 2 }] }) },
          { text: L('2 được lấy 3 lần thì viết 2 × 3. Mỗi hàng 4 bông hoa, có 3 hàng: 4 × 3 = 12.', '2 taken 3 times is written 2 × 3. There are 4 flowers in each row and 3 rows: 4 × 3 = 12.'), visual: vz('array', { rows: 3, cols: 4, emoji: '🌸' }) },
        ],
        function (rng, i) {
          const a = R(rng, 2, 5), b = R(rng, 2, lv(i) === 0 ? 4 : 5), p = a * b, it = P(rng, ITEMS.slice(0, 8)), f = i % 5;
          const groups = Array.from({ length: b }, () => ({ emoji: it.e, count: a }));
          const sumS = Array(b).fill(a).join(' + ');
          if (f === 0) return Q(L(`Mỗi nhóm có ${a} ${it.n}, có ${b} nhóm. Phép nhân nào đúng?`, `There are ${nE(a, it.n)} in each group and ${b} groups. Which multiplication is correct?`), vz('objects', { groups }), ch(rng, `${a} × ${b}`, [`${a} + ${b}`, `${a} × ${b + 1}`, `${a + 1} × ${b}`]), L(`${a} được lấy ${b} lần.`, `${a} is taken ${b} times.`), `${sumS} = ${a} × ${b}.`);
          if (f === 1) return Q(L(`Số thích hợp ở ô ?:\n${sumS} = ${a} × ?`, `What is the missing number?\n${sumS} = ${a} × ?`), vz('objects', { groups }), num(b), L(`Số ${a} được lấy mấy lần?`, `How many times is ${a} taken?`), L(`${a} được lấy ${b} lần nên ${sumS} = ${a} × ${b}.`, `${a} is taken ${b} times, so ${sumS} = ${a} × ${b}.`));
          if (f === 2) return Q(L(`Chuyển tổng thành phép nhân rồi tính:\n${sumS} = ?`, `Write the addition as a multiplication, then work it out:\n${sumS} = ?`), null, num(p), `${sumS} = ${a} × ${b}.`, `${a} × ${b} = ${sumS} = ${p}.`);
          if (f === 3) return Q(L(`Có tất cả bao nhiêu ${it.n}?`, `How many ${wE(it.n)} are there altogether?`), vz('array', { rows: b, cols: a, emoji: it.e }), num(p), L(`Mỗi hàng ${a}, có ${b} hàng: ${a} × ${b}.`, `${a} in each row, ${b} rows: ${a} × ${b}.`), `${a} × ${b} = ${p}.`);
          return Q(L(`Phép nhân ${a} × ${b} ứng với tổng nào?`, `Which addition matches ${a} × ${b}?`), null, ch(rng, sumS, [`${a} + ${b}`, Array(b + 1).fill(a).join(' + '), Array(Math.max(2, b - 1)).fill(a).join(' + ')]), L(`${a} × ${b} là ${a} được lấy ${b} lần.`, `${a} × ${b} means ${a} taken ${b} times.`), `${a} × ${b} = ${sumS}.`);
        }),

      lesson(8, 38, L('Thừa số, tích', 'Factors and products'),
        L('Rô-bốt ISA giới thiệu với bạn Mai tên gọi các số trong phép nhân.', 'ISA the robot shows Mai the names of the numbers in a multiplication.'),
        [
          { text: L('Trong 5 × 3 = 15: 5 và 3 là thừa số, 15 là tích. 5 × 3 cũng gọi là tích.', 'In 5 × 3 = 15: 5 and 3 are the factors, 15 is the product. 5 × 3 is also called a product.'), visual: vz('array', { rows: 3, cols: 5, emoji: '⭐' }) },
          { text: L('Thừa số là 2 và 4 thì tích là 2 × 4 = 2 + 2 + 2 + 2 = 8.', 'If the factors are 2 and 4, the product is 2 × 4 = 2 + 2 + 2 + 2 = 8.'), visual: vz('objects', { groups: [{ emoji: '🍬', count: 2 }, { emoji: '🍬', count: 2 }, { emoji: '🍬', count: 2 }, { emoji: '🍬', count: 2 }] }) },
        ],
        function (rng, i) {
          const a = P(rng, [2, 5, 2, 5, 3, 4]), b = R(rng, 2, lv(i) === 0 ? 5 : 9), p = a * b, f = i % 4;
          if (f === 0) return Q(L(`Trong phép nhân ${a} × ${b} = ${p}, số ${p} gọi là gì?`, `In ${a} × ${b} = ${p}, what is ${p} called?`), null, ch(rng, L('Tích', 'Product'), EN ? ['Factor', 'Sum', 'Difference'] : ['Thừa số', 'Tổng', 'Hiệu']), L('Kết quả của phép nhân gọi là tích.', 'The answer to a multiplication is called the product.'), L(`${p} là tích.`, `${p} is the product.`));
          if (f === 1) return Q(L(`Các thừa số là ${a} và ${b}. Tích là bao nhiêu?`, `The factors are ${a} and ${b}. What is the product?`), vz('array', { rows: b, cols: a }), num(p), L(`${a} được lấy ${b} lần.`, `${a} is taken ${b} times.`), `${a} × ${b} = ${p}.`);
          if (f === 2) return Q(L(`Các thừa số của phép nhân ${a} × ${b} = ${p} là:`, `The factors in ${a} × ${b} = ${p} are:`), null, ch(rng, L(`${a} và ${b}`, `${a} and ${b}`), EN ? [`${a} and ${p}`, `${b} and ${p}`, `${p}`] : [`${a} và ${p}`, `${b} và ${p}`, `${p}`]), L('Các số đứng hai bên dấu × là thừa số.', 'The numbers on each side of the × sign are the factors.'), L(`Thừa số là ${a} và ${b}.`, `The factors are ${a} and ${b}.`));
          return Q(L(`Viết phép nhân, biết thừa số thứ nhất là ${a}, thừa số thứ hai là ${b}. Tích bằng bao nhiêu?`, `Write a multiplication with first factor ${a} and second factor ${b}. What is the product?`), b <= 6 ? vz('objects', { groups: Array.from({ length: b }, () => ({ emoji: '🔵', count: a })) }) : vz('array', { rows: b, cols: a, emoji: '🔵' }), num(p), L(`Cộng ${b} lần số ${a}.`, `Add ${b} lots of ${a}.`), `${a} × ${b} = ${p}.`);
        }),

      lesson(8, 39, L('Bảng nhân 2', 'The 2 times table'),
        L('Rô-bốt ISA đếm chân những chú gà trong vườn nhà bà bạn Quân.', 'ISA the robot counts the legs of the hens in the garden at Quân\'s grandma\'s house.'),
        [
          { text: L('2 × 1 = 2, 2 × 2 = 4, 2 × 3 = 6, … Mỗi lần thêm một nhóm thì tích thêm 2.', '2 × 1 = 2, 2 × 2 = 4, 2 × 3 = 6, … Each extra group makes the product 2 more.'), visual: vz('numberLine', { min: 0, max: 20, step: 2, labelEvery: 1, hops: [{ from: 0, to: 2, label: '+2' }, { from: 2, to: 4, label: '+2' }, { from: 4, to: 6, label: '+2' }] }) },
          { text: L('Mỗi đôi dép có 2 chiếc. 4 đôi dép có 2 × 4 = 8 chiếc.', 'A pair of flip-flops has 2 flip-flops. 4 pairs have 2 × 4 = 8 flip-flops.'), visual: vz('array', { rows: 4, cols: 2, emoji: '🩴' }) },
        ],
        mulTableGen(2, MUL2)),
      lesson(8, 40, L('Bảng nhân 5', 'The 5 times table'),
        L('Rô-bốt ISA cùng bạn Ngọc đếm cánh những bông hoa mai ngày Tết.', 'ISA the robot and Ngọc count the petals on the yellow apricot blossoms at Tết.'),
        [
          { text: L('5 × 1 = 5, 5 × 2 = 10, 5 × 3 = 15, … Đếm thêm 5.', '5 × 1 = 5, 5 × 2 = 10, 5 × 3 = 15, … Count in fives.'), visual: vz('numberLine', { min: 0, max: 50, step: 5, labelEvery: 1, hops: [{ from: 0, to: 5, label: '+5' }, { from: 5, to: 10, label: '+5' }, { from: 10, to: 15, label: '+5' }] }) },
          { text: L('Mỗi bàn tay có 5 ngón. 3 bàn tay có 5 × 3 = 15 ngón.', 'Each hand has 5 fingers. 3 hands have 5 × 3 = 15 fingers.'), visual: vz('objects', { groups: [{ emoji: '🖐️', count: 3 }] }) },
        ],
        mulTableGen(5, MUL5)),

      lesson(8, 41, L('Phép chia', 'Division'),
        L('Rô-bốt ISA chia đều kẹo vào các đĩa cho các bạn nhỏ trong ngày 1 tháng 6.', 'ISA the robot shares sweets equally onto plates for the children on Children\'s Day, 1 June.'),
        [
          { text: L('Chia đều 6 cái kẹo vào 2 đĩa, mỗi đĩa được 3 cái: 6 : 2 = 3, đọc là "sáu chia hai bằng ba".', 'Share 6 sweets equally onto 2 plates: each plate gets 3. 6 : 2 = 3, and we say "six divided by two equals three".'), visual: vz('share', { total: 6, groups: 2, emoji: '🍬' }) },
          { text: L('Từ phép nhân 3 × 2 = 6 ta có hai phép chia: 6 : 2 = 3 và 6 : 3 = 2.', 'From the multiplication 3 × 2 = 6 we get two divisions: 6 : 2 = 3 and 6 : 3 = 2.'), visual: vz('array', { rows: 2, cols: 3, emoji: '🍬' }) },
        ],
        function (rng, i) {
          const g = R(rng, 2, 5), q = R(rng, 2, lv(i) === 0 ? 4 : 5), t = g * q, f = i % 4, it = P(rng, [{ n: 'cái kẹo', en: ['sweet', 'sweets'], e: '🍬' }, { n: 'quả cam', en: ['orange', 'oranges'], e: '🍊' }, { n: 'cái bánh', en: ['biscuit', 'biscuits'], e: '🍪' }]);
          if (f === 0) return Q(L(`Chia đều ${t} ${it.n} vào ${g} đĩa. Mỗi đĩa có mấy ${it.n}?`, `Share ${t} ${it.en[1]} equally onto ${g} plates. How many ${it.en[1]} are on each plate?`), vz('share', { total: t, groups: g, emoji: it.e }), num(q), L(`Chia lần lượt mỗi đĩa một ${it.n} cho đến hết.`, `Put one ${it.en[0]} on each plate in turn until they are all gone.`), `${t} : ${g} = ${q}.`);
          if (f === 1) return Q(L(`Có ${t} ${it.n}, xếp mỗi đĩa ${q} ${it.n}. Xếp được mấy đĩa?`, `There are ${t} ${it.en[1]}. You put ${q} ${it.en[1]} on each plate. How many plates do you fill?`), vz('objects', { groups: Array.from({ length: g }, () => ({ emoji: it.e, count: q })) }), num(g), L(`Mỗi nhóm ${q}, đếm xem có mấy nhóm.`, `There are ${q} in each group. Count the groups.`), L(`${t} : ${q} = ${g} (đĩa).`, `${t} : ${q} = ${g} (plates).`));
          if (f === 2) return Q(L(`Biết ${g} × ${q} = ${t}. Vậy ${t} : ${g} = ?`, `${g} × ${q} = ${t}. So ${t} : ${g} = ?`), vz('array', { rows: g, cols: q }), num(q), L('Lấy tích chia cho thừa số này thì được thừa số kia.', 'The product divided by one factor gives the other factor.'), `${t} : ${g} = ${q}.`);
          return Q(`${t} : ${g} = ?`, vz('share', { total: t, groups: g, emoji: it.e }), ch(rng, q, [q + 1, q - 1, t - g, g].filter(x => x > 0)), L(`Chia đều ${t} thành ${g} phần.`, `Share ${t} equally into ${g} groups.`), `${t} : ${g} = ${q}.`);
        }),

      lesson(8, 42, L('Số bị chia, số chia, thương', 'Dividend, divisor, quotient'),
        L('Rô-bốt ISA giúp bạn Hùng gọi tên các số trong phép chia.', 'ISA the robot helps Hùng name the numbers in a division.'),
        [
          { text: L('Trong 10 : 2 = 5: 10 là số bị chia, 2 là số chia, 5 là thương. 10 : 2 cũng gọi là thương.', 'In 10 : 2 = 5: 10 is the dividend, 2 is the divisor, 5 is the quotient. 10 : 2 is also called a quotient.'), visual: vz('share', { total: 10, groups: 2, emoji: '🍊' }) },
        ],
        function (rng, i) {
          // số chia ≠ thương (no 4 : 2 = 2 or 25 : 5 = 5), so each number has only one name
          const n = P(rng, [2, 5]), k0 = R(rng, 2, lv(i) === 0 ? 5 : 9), k = k0 === n ? n + 1 : k0, p = n * k, f = i % 4;
          const names = EN ? ['Dividend', 'Divisor', 'Quotient'] : ['Số bị chia', 'Số chia', 'Thương'];
          if (f === 0) { const j = R(rng, 0, 2), v = [p, n, k][j]; return Q(L(`Trong phép chia ${p} : ${n} = ${k}, số ${v} gọi là gì?`, `In ${p} : ${n} = ${k}, what is ${v} called?`), null, ch(rng, names[j], names.concat([L('Tích', 'Product')]).filter(x => x !== names[j])), L('Số bị chia : số chia = thương.', 'Dividend : divisor = quotient.'), L(`${v} là ${names[j].toLowerCase()}.`, `${v} is the ${names[j].toLowerCase()}.`)); }
          if (f === 1) return Q(L(`Số bị chia là ${p}, số chia là ${n}. Thương là bao nhiêu?`, `The dividend is ${p} and the divisor is ${n}. What is the quotient?`), vz('share', { total: p, groups: n }), num(k), L(`Tính ${p} : ${n}.`, `Work out ${p} : ${n}.`), `${p} : ${n} = ${k}.`);
          if (f === 2) return Q(L(`Thương của ${p} và ${n} là:`, `The quotient of ${p} and ${n} is:`), null, ch(rng, k, [p - n, k + 1, n].filter(x => x > 0 && x !== k)), L(`Thương là kết quả phép chia ${p} : ${n}.`, `The quotient is the answer to ${p} : ${n}.`), `${p} : ${n} = ${k}.`);
          return Q(L(`Từ phép nhân ${n} × ${k} = ${p}, em viết phép chia có số chia là ${n}. Thương bằng bao nhiêu?`, `From ${n} × ${k} = ${p}, write a division with divisor ${n}. What is the quotient?`), vz('array', { rows: n, cols: k }), num(k), `${p} : ${n} = ?`, `${p} : ${n} = ${k}.`);
        }),

      lesson(8, 43, L('Bảng chia 2', 'Dividing by 2'),
        L('Rô-bốt ISA chia đôi những chiếc bánh cho bạn Vy và em của bạn ấy.', 'ISA the robot shares biscuits in half between Vy and her little brother.'),
        [
          { text: L('Dựa vào bảng nhân 2: 2 × 4 = 8 nên 8 : 2 = 4.', 'Use the 2 times table: 2 × 4 = 8, so 8 : 2 = 4.'), visual: vz('share', { total: 8, groups: 2, emoji: '🍪' }) },
          { text: L('2 : 2 = 1, 4 : 2 = 2, 6 : 2 = 3, … 20 : 2 = 10.', '2 : 2 = 1, 4 : 2 = 2, 6 : 2 = 3, … 20 : 2 = 10.') },
        ],
        divTableGen(2, DIV2)),
      lesson(8, 44, L('Bảng chia 5', 'Dividing by 5'),
        L('Rô-bốt ISA cùng bạn Tú xếp cam vào 5 đĩa để bày mâm ngũ quả.', 'ISA the robot and Tú put oranges onto 5 plates for the Tết five-fruit tray.'),
        [
          { text: L('Dựa vào bảng nhân 5: 5 × 3 = 15 nên 15 : 5 = 3.', 'Use the 5 times table: 5 × 3 = 15, so 15 : 5 = 3.'), visual: vz('share', { total: 15, groups: 5, emoji: '🍊' }) },
          { text: L('5 : 5 = 1, 10 : 5 = 2, 15 : 5 = 3, … 50 : 5 = 10.', '5 : 5 = 1, 10 : 5 = 2, 15 : 5 = 3, … 50 : 5 = 10.') },
        ],
        divTableGen(5, DIV5)),
    ],
  };

  // ============ CHỦ ĐỀ 9. LÀM QUEN VỚI HÌNH KHỐI ============
  const SOLIDS = EN ? { cylinder: 'Cylinder', sphere: 'Sphere', cube: 'Cube', box: 'Cuboid' } : { cylinder: 'Khối trụ', sphere: 'Khối cầu', cube: 'Khối lập phương', box: 'Khối hộp chữ nhật' };
  const REAL = [
    { e: '⚽', k: 'sphere', n: 'Quả bóng', en: 'A ball' }, { e: '🍊', k: 'sphere', n: 'Quả cam', en: 'An orange' }, { e: '🌍', k: 'sphere', n: 'Quả địa cầu', en: 'A globe' },
    { e: '🥫', k: 'cylinder', n: 'Lon nước', en: 'A drinks can' }, { e: '🥁', k: 'cylinder', n: 'Cái trống', en: 'A drum' }, { e: '🕯️', k: 'cylinder', n: 'Cây nến', en: 'A candle' },
    { e: '🎲', k: 'cube', n: 'Con xúc xắc', en: 'A dice' }, { e: '🎁', k: 'box', n: 'Hộp quà', en: 'A present box' }, { e: '📦', k: 'box', n: 'Thùng giấy', en: 'A cardboard box' },
  ];
  const c9 = {
    id: 'g2-c9', semester: 2, title: L('Làm quen với hình khối', 'Getting to know solid shapes'), icon: '🧊', lessons: [
      lesson(9, 46, L('Khối trụ, khối cầu', 'Cylinders and spheres'),
        L('Rô-bốt ISA cùng bạn An tìm các đồ vật có dạng khối trụ, khối cầu trong nhà.', 'ISA the robot and An look for things at home that are shaped like cylinders and spheres.'),
        [
          { text: L('Đây là khối trụ. Lon nước, cái trống có dạng khối trụ.', 'This is a cylinder. A drinks can and a drum are cylinders.'), visual: vz('solid', { kind: 'cylinder' }) },
          { text: L('Đây là khối cầu. Quả bóng, quả cam có dạng khối cầu.', 'This is a sphere. A ball and an orange are spheres.'), visual: vz('solid', { kind: 'sphere' }) },
        ],
        function (rng, i) {
          const f = i % 3;
          const aS = s => art(s.toLowerCase());
          if (f === 0) {
            const k = P(rng, lv(i) === 0 ? ['cylinder', 'sphere'] : ['cylinder', 'sphere', 'cube', 'box']);
            return Q(L('Đây là khối gì?', 'What is this solid shape?'), vz('solid', { kind: k }), ch(rng, SOLIDS[k], Object.values(SOLIDS)), L('Khối cầu tròn đều mọi phía; khối trụ có hai mặt đáy hình tròn.', 'A sphere is round all over. A cylinder has two flat circle faces.'), L(`Đây là ${SOLIDS[k].toLowerCase()}.`, `This is ${aS(SOLIDS[k])}.`));
          }
          if (f === 1) {
            const o = P(rng, REAL);
            return Q(L(`${o.n} có dạng khối gì?`, `What solid shape is ${o.en[0].toLowerCase() + o.en.slice(1)}?`), vz('objects', { groups: [{ emoji: o.e, count: 1 }] }), ch(rng, SOLIDS[o.k], Object.values(SOLIDS)), L('Hình dung đồ vật lăn được hay đứng vững trên mặt đáy tròn.', 'Think: can it roll all ways, or does it stand on a flat round face?'), L(`${o.n} có dạng ${SOLIDS[o.k].toLowerCase()}.`, `${o.en} is ${aS(SOLIDS[o.k])}.`));
          }
          const a = R(rng, 1, 5), b = R(rng, 1, 5), c = R(rng, 1, 4), ask = R(rng, 0, 1);
          return Q(L(`Có bao nhiêu đồ vật có dạng ${ask ? 'khối cầu' : 'khối trụ'}?`, `How many things are shaped like a ${ask ? 'sphere' : 'cylinder'}?`), vz('objects', { groups: [{ emoji: '⚽', count: a }, { emoji: '🥫', count: b }, { emoji: '🎁', count: c }] }), num(ask ? a : b), ask ? L('Quả bóng có dạng khối cầu.', 'A ball is a sphere.') : L('Lon nước có dạng khối trụ.', 'A drinks can is a cylinder.'), L(`Có ${ask ? a : b} đồ vật.`, `There ${(ask ? a : b) === 1 ? 'is 1 thing' : `are ${ask ? a : b} things`}.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 10. CÁC SỐ TRONG PHẠM VI 1000 ============
  const PV3 = EN ? ['Hundreds', 'Tens', 'Ones'] : ['Trăm', 'Chục', 'Đơn vị'];
  const RD = x => (EN ? U.readEN(x) : readVN(x)); // number in words for the current language
  const c10 = {
    id: 'g2-c10', semester: 2, title: L('Các số trong phạm vi 1000', 'Numbers to 1000'), icon: '💯', lessons: [
      lesson(10, 48, L('Đơn vị, chục, trăm, nghìn', 'Ones, tens, hundreds, thousands'),
        L('Rô-bốt ISA cùng bạn Minh xếp những tấm trăm khối thành một khối nghìn thật to.', 'ISA the robot and Minh stack hundred squares to make one big thousand cube.'),
        [
          { text: L('10 đơn vị = 1 chục; 10 chục = 1 trăm; 10 trăm = 1 nghìn.', '10 ones = 1 ten; 10 tens = 1 hundred; 10 hundreds = 1 thousand.'), visual: vz('blocks', { thousands: 1, hundreds: 0, tens: 0, ones: 0 }) },
          { text: L('3 tấm trăm là 300, đọc là "ba trăm".', '3 hundred squares make 300. We say "three hundred".'), visual: vz('blocks', { hundreds: 3, tens: 0, ones: 0 }) },
        ],
        more(function (rng, i) {
          const f = i % 4;
          if (f === 0) { const h = R(rng, 1, 9); return Q(L('Hình dưới đây biểu diễn số nào?', 'Which number do the blocks show?'), vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(h * 100), L('Mỗi tấm là 1 trăm.', 'Each square is 1 hundred.'), L(`${h} trăm là ${h * 100}.`, `${pE(h, 'hundred')} ${h === 1 ? 'is' : 'make'} ${h * 100}.`)); }
          if (f === 1) { const [p, v] = P(rng, EN ? [['10 hundreds = ? ', 1000], ['1 hundred = ? tens', 10], ['1 ten = ? ones', 10], ['1 thousand = ? hundreds', 10], ['10 tens = ?', 100]] : [['10 trăm = ? ', 1000], ['1 trăm = ? chục', 10], ['1 chục = ? đơn vị', 10], ['1 nghìn = ? trăm', 10], ['10 chục = ?', 100]]); return Q(p.trim(), null, num(v), L('Cứ 10 đơn vị của hàng này gộp thành 1 đơn vị của hàng liền trên.', '10 of one place always make 1 of the next place up.'), `${p.replace('?', v).trim()}.`); }
          if (f === 2) { const h = R(rng, 1, 9), t = R(rng, 1, 9); return Q(L('Hình dưới đây biểu diễn số nào?', 'Which number do the blocks show?'), vz('blocks', { hundreds: h, tens: t, ones: 0 }), num(h * 100 + t * 10), L('Đếm số tấm trăm, rồi đếm số thanh chục.', 'Count the hundred squares, then count the tens rods.'), L(`${h} trăm và ${t} chục là ${h * 100 + t * 10}.`, `${pE(h, 'hundred')} and ${pE(t, 'ten')} make ${h * 100 + t * 10}.`)); }
          const h = R(rng, 1, 9);
          return Q(L(`${DIG[h][0].toUpperCase() + DIG[h].slice(1)} trăm viết là:`, `Write "${U.readEN(h * 100)}" in digits:`), null, ch(rng, h * 100, [h * 10, h * 1000, h]), L('Số tròn trăm có hai chữ số 0 ở cuối.', 'A multiple of 100 ends in two zeros.'), L(`${readVN(h * 100)} viết là ${h * 100}.`, `"${U.readEN(h * 100)}" is written ${h * 100}.`));
        }, [
          [0, 4, rng => { const h = R(rng, 1, 9); return Q(L(`Số ${h * 100} gồm mấy trăm?`, `How many hundreds are there in ${h * 100}?`), vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(h), L('Mỗi tấm là 1 trăm.', 'Each square is 1 hundred.'), L(`${h * 100} gồm ${h} trăm.`, `${h * 100} is ${pE(h, 'hundred')}.`)); }],
          [0, 6, rng => { const s = R(rng, 1, 6), miss = R(rng, 1, 3), seq = [0, 1, 2, 3].map(j => (s + j) * 100); return Q(L(`Đếm thêm 100. Số thích hợp ở ô ? là:\n${seq.map((v, j) => (j === miss ? '?' : v)).join(', ')}`, `Count in hundreds. The missing number is:\n${seq.map((v, j) => (j === miss ? '?' : v)).join(', ')}`), null, num(seq[miss]), L('Mỗi lần đếm thêm 1 trăm.', 'Add 1 hundred each time.'), `${seq.join(', ')}.`); }],
          [3, 9, rng => {
            const h = R(rng, 1, 9);
            const [st, ok, fix] = P(rng, EN
              ? [[`${pE(h, 'hundred')} is written ${h * 100}`, true, `${pE(h, 'hundred')} is written ${h * 100}`], [`${pE(h, 'hundred')} is written ${h * 10}`, false, `${pE(h, 'hundred')} is written ${h * 100}`], [`${h * 100} is made of ${pE(h, 'hundred')}`, true, `${h * 100} is made of ${pE(h, 'hundred')}`], [`${h * 100} is made of ${pE(h, 'ten')}`, false, `${h * 100} is made of ${pE(h, 'hundred')}`], ['10 hundreds = 1 thousand', true, '10 hundreds = 1 thousand'], ['10 tens = 1 thousand', false, '10 tens = 1 hundred; 10 hundreds = 1 thousand'], ['1 thousand is written 1000', true, '1 thousand is written 1000'], ['1 hundred = 100 tens', false, '1 hundred = 10 tens']]
              : [[`${h} trăm viết là ${h * 100}`, true, `${h} trăm viết là ${h * 100}`], [`${h} trăm viết là ${h * 10}`, false, `${h} trăm viết là ${h * 100}`], [`Số ${h * 100} gồm ${h} trăm`, true, `${h * 100} gồm ${h} trăm`], [`Số ${h * 100} gồm ${h} chục`, false, `${h * 100} gồm ${h} trăm`], ['10 trăm = 1 nghìn', true, '10 trăm = 1 nghìn'], ['10 chục = 1 nghìn', false, '10 chục = 1 trăm; 10 trăm = 1 nghìn'], ['1 nghìn viết là 1000', true, '1 nghìn viết là 1000'], ['1 trăm = 100 chục', false, '1 trăm = 10 chục']]);
            return Q(L(`Đúng hay sai?\n${st}.`, `True or false?\n${st}.`), null, tf(rng, ok), L('10 đơn vị = 1 chục; 10 chục = 1 trăm; 10 trăm = 1 nghìn.', '10 ones = 1 ten; 10 tens = 1 hundred; 10 hundreds = 1 thousand.'), `${ok ? TRUE : FALSE}. ${fix}.`);
          }],
          [3, 9, rng => { const h = R(rng, 1, 9), k = P(rng, [h, h < 9 ? h + 1 : h - 1, h > 1 ? h - 1 : h + 1, R(rng, 1, 9)]); const hs = L(`${h} trăm`, pE(h, 'hundred')); return Q(L(`So sánh: ${h} trăm … ${k * 100}`, `Compare: ${hs} … ${k * 100}`), vz('compare', { left: hs, right: k * 100 }), cmpAns(h, k), L(`${h} trăm là ${h * 100}.`, `${hs} is ${h * 100}.`), L(`${h} trăm = ${h * 100}; ${h * 100} ${sign(h, k)} ${k * 100}.`, `${hs} = ${h * 100}; ${h * 100} ${sign(h, k)} ${k * 100}.`)); }],
          [3, 9, rng => { const h = R(rng, 2, 9), x = nm(rng), it = P(rng, [['hộp', 'viên bi'], ['túi', 'cái kẹo'], ['bó', 'que tính'], ['thùng', 'quả cam']]); return Q(L(`Mỗi ${it[0]} có 100 ${it[1]}. ${x} có ${h} ${it[0]} như thế. Hỏi ${x} có tất cả bao nhiêu ${it[1]}?`, `Each ${wE(it[0], 1)} has 100 ${wE(it[1])}. ${x} has ${h} ${wE(it[0])} like this. How many ${wE(it[1])} does ${x} have altogether?`), vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(h * 100), L('Đếm thêm 100: 100, 200, 300, …', 'Count in hundreds: 100, 200, 300, …'), L(`${h} trăm là ${h * 100}. ${x} có ${h * 100} ${it[1]}.`, `${h} hundreds make ${h * 100}. ${x} has ${h * 100} ${wE(it[1])}.`)); }],
          [6, 9, rng => { const h = R(rng, 1, 9); return Q(L(`Có ${h} tấm trăm. Cần thêm mấy tấm trăm nữa để được 1 nghìn?`, `There ${h === 1 ? 'is 1 hundred square' : `are ${h} hundred squares`}. How many more hundred squares do you need to make 1 thousand?`), vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(10 - h), L('10 trăm = 1 nghìn.', '10 hundreds = 1 thousand.'), L(`${h} + ${10 - h} = 10. Cần thêm ${10 - h} tấm trăm.`, `${h} + ${10 - h} = 10. You need ${10 - h} more hundred ${10 - h === 1 ? 'square' : 'squares'}.`)); }],
        ])),

      lesson(10, 49, L('Các số tròn trăm, tròn chục', 'Multiples of 100 and multiples of 10'),
        L('Rô-bốt ISA và bạn Lan đếm những bó que tính, mỗi bó một chục.', 'ISA the robot and Lan count bundles of counting sticks, with ten sticks in each bundle.'),
        [
          { text: L('Các số tròn trăm: 100, 200, 300, …, 900 (có 2 chữ số 0 tận cùng).', 'Multiples of 100: 100, 200, 300, …, 900 (they end in two zeros).'), visual: vz('numberLine', { min: 0, max: 1000, step: 100, labelEvery: 1 }) },
          { text: L('Các số tròn chục: 110, 120, 130, … (có chữ số 0 tận cùng). 230 gồm 2 trăm và 3 chục.', 'Multiples of 10: 110, 120, 130, … (they end in a zero). 230 has 2 hundreds and 3 tens.'), visual: vz('blocks', { hundreds: 2, tens: 3, ones: 0 }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) { const k = R(rng, 1, 9); return Q(L('Số thích hợp ở ô ? trên tia số là số nào?', 'Which number goes in the ? box on the number line?'), vz('numberLine', { min: 0, max: 1000, step: 100, labelEvery: 1, unknown: k * 100 }), num(k * 100), L('Tia số đếm thêm 100.', 'This number line counts in hundreds.'), L(`Số cần điền là ${k * 100}.`, `The missing number is ${k * 100}.`)); }
          if (f === 1) { const h = R(rng, 1, 8), t = R(rng, 1, 9), n = h * 100 + t * 10; return Q(L('Số thích hợp ở ô ? trên tia số là số nào?', 'Which number goes in the ? box on the number line?'), vz('numberLine', { min: h * 100, max: h * 100 + 100, step: 10, labelEvery: 1, unknown: n }), num(n), L('Tia số đếm thêm 10.', 'This number line counts in tens.'), L(`Số cần điền là ${n}.`, `The missing number is ${n}.`)); }
          if (f === 2) { const k = R(rng, 1, 9) * 100; return Q(L('Số nào là số tròn trăm?', 'Which number is a multiple of 100?'), null, ch(rng, k, [k + 10, k + 50, k - 10 > 0 ? k - 10 : k + 30]), L('Số tròn trăm có hai chữ số tận cùng là 0.', 'A multiple of 100 ends in two zeros.'), L(`${k} là số tròn trăm.`, `${k} is a multiple of 100.`)); }
          if (f === 3) { const h = R(rng, 1, 9), t = R(rng, 0, 9); return Q(L('Hình dưới đây biểu diễn số tròn chục nào?', 'Which multiple of 10 do the blocks show?'), vz('blocks', { hundreds: h, tens: t, ones: 0 }), num(h * 100 + t * 10), L('Đếm tấm trăm và thanh chục.', 'Count the hundred squares and the tens rods.'), L(`${h} trăm ${t} chục là ${h * 100 + t * 10}.`, `${pE(h, 'hundred')} and ${pE(t, 'ten')} make ${h * 100 + t * 10}.`)); }
          const n = R(rng, 10, 98) * 10, nx = R(rng, 0, 1);
          return Q(L(`Số tròn chục liền ${nx ? 'sau' : 'trước'} của ${n} là:`, `The multiple of 10 just ${nx ? 'after' : 'before'} ${n} is:`), null, ch(rng, nx ? n + 10 : n - 10, [nx ? n - 10 : n + 10, nx ? n + 1 : n - 1, nx ? n + 100 : n - 100].filter(x => x > 0)), L(`Tròn chục liền ${nx ? 'sau thì thêm' : 'trước thì bớt'} 10.`, `For the multiple of 10 just ${nx ? 'after, add' : 'before, take away'} 10.`), `${n} ${nx ? '+' : M} 10 = ${nx ? n + 10 : n - 10}.`);
        }),

      lesson(10, 50, L('So sánh các số tròn trăm, tròn chục', 'Comparing multiples of 100 and of 10'),
        L('Rô-bốt ISA giúp bạn Phúc so xem cửa hàng nào có nhiều bóng bay hơn.', 'ISA the robot helps Phúc find out which shop has more balloons.'),
        [
          { text: L('300 < 500 vì 3 trăm ít hơn 5 trăm.', '300 < 500 because 3 hundreds are less than 5 hundreds.'), visual: vz('compare', { left: 300, right: 500 }) },
          { text: L('240 > 210: cùng 2 trăm, so hàng chục: 4 chục > 1 chục.', '240 > 210: both have 2 hundreds, so compare the tens: 4 tens > 1 ten.'), visual: vz('compare', { left: 240, right: 210 }) },
        ],
        function (rng, i) {
          const f = i % 3;
          const rt = () => (lv(i) === 0 ? R(rng, 1, 10) * 100 : R(rng, 10, 99) * 10);
          if (f === 0) { const a = rt(); const b = R(rng, 0, 3) === 0 ? a : rt(); return Q(L(`So sánh: ${a} … ${b}`, `Compare: ${a} … ${b}`), vz('compare', { left: a, right: b }), cmpAns(a, b), L('So sánh hàng trăm trước, rồi đến hàng chục.', 'Compare the hundreds first, then the tens.'), `${a} ${sign(a, b)} ${b}.`); }
          const arr = []; while (arr.length < 4) { const x = rt(); if (!arr.includes(x)) arr.push(x); }
          if (f === 1) { const big = R(rng, 0, 1); const ans = big ? Math.max(...arr) : Math.min(...arr); return Q(L(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.join('; ')} là:`, `The ${big ? 'greatest' : 'smallest'} of the numbers ${arr.join('; ')} is:`), null, ch(rng, ans, arr), L('So sánh hàng trăm trước.', 'Compare the hundreds first.'), L(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`, `The ${big ? 'greatest' : 'smallest'} number is ${ans}.`)); }
          const asc = arr.slice().sort((x, y) => x - y);
          const s = a => a.join(', ');
          return Q(L(`Sắp xếp các số ${arr.join('; ')} theo thứ tự từ bé đến lớn:`, `Put the numbers ${arr.join('; ')} in order from smallest to greatest:`), null, ch(rng, s(asc), [s(asc.slice().reverse()), s(arr), s([asc[1], asc[0], asc[2], asc[3]])]), L('Tìm số bé nhất trước.', 'Find the smallest number first.'), `${s(asc)}.`);
        }),

      lesson(10, 51, L('Số có ba chữ số', '3-digit numbers'),
        L('Rô-bốt ISA đếm số cây hoa trong vườn ươm cùng bạn Trang.', 'ISA the robot and Trang count the flowering plants in the plant nursery.'),
        [
          { text: L('Số 245 gồm 2 trăm, 4 chục và 5 đơn vị, đọc là "hai trăm bốn mươi lăm".', '245 has 2 hundreds, 4 tens and 5 ones. We say "two hundred and forty-five".'), visual: vz('blocks', { hundreds: 2, tens: 4, ones: 5 }) },
          { text: L('Số 307: 3 trăm, 0 chục, 7 đơn vị, đọc là "ba trăm linh bảy".', '307 has 3 hundreds, 0 tens and 7 ones. We say "three hundred and seven".'), visual: vz('placeValue', { number: 307, columns: PV3 }) },
        ],
        function (rng, i) {
          const f = i % 5;
          const h = R(rng, 1, 9), t = lv(i) === 2 ? P(rng, [0, R(rng, 1, 9)]) : R(rng, 1, 9), o = R(rng, 0, 9), n = h * 100 + t * 10 + o;
          if (f === 0) return Q(L('Hình dưới đây biểu diễn số nào?', 'Which number do the blocks show?'), vz('blocks', { hundreds: h, tens: t, ones: o }), num(n), L('Đếm tấm trăm, thanh chục, rồi khối lẻ.', 'Count the hundred squares, the tens rods, then the single cubes.'), L(`${h} trăm, ${t} chục, ${o} đơn vị: ${n}.`, `${pE(h, 'hundred')}, ${pE(t, 'ten')}, ${pE(o, 'one')}: ${n}.`));
          if (f === 1) return Q(L(`Số "${readVN(n)}" viết là:`, `Write "${U.readEN(n)}" in digits:`), null, ch(rng, n, [h * 100 + o * 10 + t, h * 100 + t, n + 100 <= 999 ? n + 100 : n - 100, h * 10 + t * 100 + o].filter(x => x >= 100 && x <= 999)), L('Viết lần lượt chữ số hàng trăm, hàng chục, hàng đơn vị.', 'Write the hundreds digit, then the tens digit, then the ones digit.'), L(`"${readVN(n)}" viết là ${n}.`, `"${U.readEN(n)}" is written ${n}.`));
          if (f === 2) return Q(L(`Số ${n} đọc là:`, `How do we say ${n}?`), null, ch(rng, RD(n), [RD(h * 100 + o * 10 + t), RD(n + 10 <= 999 ? n + 10 : n - 10), RD(n === 999 ? 998 : n + 1)]), L('Đọc số trăm, số chục, rồi số đơn vị.', 'Say the hundreds, then the tens and ones.'), L(`${n} đọc là "${readVN(n)}".`, `We say ${n} as "${U.readEN(n)}".`));
          if (f === 3) return Q(L(`Số gồm ${h} trăm, ${t} chục và ${o} đơn vị là:`, `The number with ${pE(h, 'hundred')}, ${pE(t, 'ten')} and ${pE(o, 'one')} is:`), null, num(n), L('Viết từ hàng trăm sang hàng đơn vị.', 'Write from the hundreds to the ones.'), L(`Đó là số ${n}.`, `It is ${n}.`));
          const dg = digits(n);
          let pl = R(rng, 0, 2);
          const PL = EN ? ['hundreds', 'tens', 'ones', 'thousands'] : ['hàng trăm', 'hàng chục', 'hàng đơn vị', 'hàng nghìn'];
          // ask only about a digit that appears once ("chữ số 4 trong 447" would have two right answers)
          const once = j => dg.filter(x => x === dg[j]).length === 1;
          if (!once(pl)) pl = [0, 1, 2].find(once) ?? -1;
          if (pl < 0) {   // 111, 222 …: every digit the same — ask for the digit of a place instead
            const k = i % 3;
            return Q(L(`Chữ số ${PL[k]} của số ${n} là:`, `What is the ${PL[k]} digit of ${n}?`), vz('placeValue', { number: n, columns: PV3 }), num(dg[k]), L('Đếm vị trí từ phải sang trái: đơn vị, chục, trăm.', 'Count the places from right to left: ones, tens, hundreds.'), L(`Chữ số ${PL[k]} của ${n} là ${dg[k]}.`, `The ${PL[k]} digit of ${n} is ${dg[k]}.`));
          }
          return Q(L(`Chữ số ${dg[pl]} trong số ${n} thuộc hàng nào?`, `In ${n}, which place is the digit ${dg[pl]} in?`), vz('placeValue', { number: n, columns: PV3 }), ch(rng, PL.slice(0, 3)[pl], PL.filter((x, j) => j !== pl)), L('Đếm vị trí từ phải sang trái: đơn vị, chục, trăm.', 'Count the places from right to left: ones, tens, hundreds.'), L(`Chữ số ${dg[pl]} ở ${PL[pl]}.`, `The digit ${dg[pl]} is in the ${PL[pl]} place.`));
        }),

      lesson(10, 52, L('Viết số thành tổng các trăm, chục, đơn vị', 'Writing a number as hundreds, tens and ones'),
        L('Rô-bốt ISA tách số thành các phần trăm, chục, đơn vị để bạn Hà dễ nhớ.', 'ISA the robot splits numbers into hundreds, tens and ones to help Hà remember them.'),
        [
          { text: L('456 = 400 + 50 + 6.', '456 = 400 + 50 + 6.'), visual: vz('blocks', { hundreds: 4, tens: 5, ones: 6 }) },
          { text: L('708 = 700 + 8 (hàng chục là 0 nên không viết).', '708 = 700 + 8 (there are 0 tens, so we leave them out).'), visual: vz('placeValue', { number: 708, columns: PV3 }) },
        ],
        function (rng, i) {
          const h = R(rng, 1, 9), t = R(rng, lv(i) === 2 ? 0 : 1, 9), o = R(rng, 1, 9), n = h * 100 + t * 10 + o, f = i % 4;
          const sumStr = [h * 100, t * 10, o].filter(x => x > 0).join(' + ');
          if (f === 0) return Q(`${h * 100} + ${t * 10} + ${o} = ?`, vz('blocks', { hundreds: h, tens: t, ones: o }), num(n), L('Ghép trăm, chục, đơn vị lại.', 'Put the hundreds, tens and ones together.'), `${h * 100} + ${t * 10} + ${o} = ${n}.`);
          if (f === 1) { if (t === 0) return Q(L(`Số thích hợp ở ô ?:\n${n} = ${h * 100} + ?`, `What is the missing number?\n${n} = ${h * 100} + ?`), null, num(o), L('Tách số thành trăm và đơn vị.', 'Split the number into hundreds and ones.'), `${n} = ${h * 100} + ${o}.`); return Q(L(`Số thích hợp ở ô ?:\n${n} = ${h * 100} + ? + ${o}`, `What is the missing number?\n${n} = ${h * 100} + ? + ${o}`), vz('placeValue', { number: n, columns: PV3 }), num(t * 10), L(`Chữ số ${t} ở hàng chục nghĩa là ${t * 10}.`, `The digit ${t} in the tens place means ${t * 10}.`), `${n} = ${sumStr}.`); }
          if (f === 2) return Q(L(`Viết số ${n} thành tổng các trăm, chục, đơn vị:`, `Write ${n} as hundreds + tens + ones:`), null, ch(rng, sumStr, [[h * 100, o * 10, t], [h * 10, t * 10, o], [h, t, o]].map(x => x.filter(y => y > 0).join(' + '))), L('Chữ số hàng trăm nhân 100, hàng chục nhân 10.', 'The hundreds digit tells you how many hundreds, the tens digit how many tens.'), `${n} = ${sumStr}.`);
          return Q(L(`Số ${h * 100} + ${o} là số nào?`, `Which number is ${h * 100} + ${o}?`), null, ch(rng, h * 100 + o, [h * 10 + o, h * 100 + o * 10, h + o]), L('Không có chục thì chữ số hàng chục là 0.', 'There are no tens, so the tens digit is 0.'), `${h * 100} + ${o} = ${h * 100 + o}.`);
        }),

      lesson(10, 53, L('So sánh các số có ba chữ số', 'Comparing 3-digit numbers'),
        L('Rô-bốt ISA so sánh chiều cao của các tòa nhà trong thành phố cùng bạn Nam.', 'ISA the robot and Nam compare the heights of buildings in the city.'),
        [
          { text: L('So sánh 352 và 326: cùng 3 trăm; hàng chục 5 > 2. Vậy 352 > 326.', 'Compare 352 and 326: both have 3 hundreds; in the tens, 5 > 2. So 352 > 326.'), visual: vz('compare', { left: 352, right: 326 }) },
          { text: L('Lần lượt so sánh từ hàng trăm, hàng chục đến hàng đơn vị.', 'Compare the hundreds first, then the tens, then the ones.'), visual: vz('placeValue', { number: 352, columns: PV3 }) },
        ],
        function (rng, i) {
          const f = i % 4;
          const r3 = () => R(rng, 100, 999);
          if (f === 0) {
            const a = r3(); let b;
            if (lv(i) === 0) b = r3(); else if (lv(i) === 1) b = Math.floor(a / 100) * 100 + R(rng, 0, 99); else b = Math.floor(a / 10) * 10 + R(rng, 0, 9);
            return Q(L(`So sánh: ${a} … ${b}`, `Compare: ${a} … ${b}`), vz('compare', { left: a, right: b }), cmpAns(a, b), L('So sánh hàng trăm, rồi hàng chục, rồi hàng đơn vị.', 'Compare the hundreds, then the tens, then the ones.'), `${a} ${sign(a, b)} ${b}.`);
          }
          const base = R(rng, 1, 8) * 100;
          const arr = U.sample(rng, Array.from({ length: 199 }, (_, k) => base + k), 4);
          if (f === 1) { const big = R(rng, 0, 1); const ans = big ? Math.max(...arr) : Math.min(...arr); return Q(L(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.join('; ')} là:`, `The ${big ? 'greatest' : 'smallest'} of the numbers ${arr.join('; ')} is:`), null, ch(rng, ans, arr), L('So sánh từng hàng từ trái sang phải.', 'Compare place by place, from left to right.'), L(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`, `The ${big ? 'greatest' : 'smallest'} number is ${ans}.`)); }
          if (f === 2) { const asc = arr.slice().sort((x, y) => x - y), s = a => a.join(', '); return Q(L(`Sắp xếp các số ${arr.join('; ')} theo thứ tự từ lớn đến bé:`, `Put the numbers ${arr.join('; ')} in order from greatest to smallest:`), null, ch(rng, s(asc.slice().reverse()), [s(asc), s(arr), s([asc[2], asc[3], asc[1], asc[0]])]), L('Tìm số lớn nhất trước.', 'Find the greatest number first.'), `${s(asc.slice().reverse())}.`); }
          const v = R(rng, 0, 2), h = R(rng, 1, 9);
          if (v === 0) return Q(L('Số lớn nhất có ba chữ số là số nào?', 'What is the greatest 3-digit number?'), null, ch(rng, 999, [900, 1000, 990]), L('Mỗi hàng đều lấy chữ số lớn nhất là 9.', 'Use the greatest digit, 9, in every place.'), L('Số lớn nhất có ba chữ số là 999.', 'The greatest 3-digit number is 999.'));
          if (v === 1) return Q(L('Số bé nhất có ba chữ số là số nào?', 'What is the smallest 3-digit number?'), null, ch(rng, 100, [101, 111, 99]), L('Hàng trăm phải khác 0, các hàng khác lấy 0.', 'The hundreds digit cannot be 0; use 0 in the other places.'), L('Số bé nhất có ba chữ số là 100.', 'The smallest 3-digit number is 100.'));
          return Q(L(`Số lớn nhất có ba chữ số mà chữ số hàng trăm là ${h} là số nào?`, `What is the greatest 3-digit number with ${h} in the hundreds place?`), null, num(h * 100 + 99), L('Hàng chục và hàng đơn vị lấy chữ số lớn nhất.', 'Use the greatest digit in the tens and in the ones.'), L(`Đó là số ${h}99.`, `It is ${h}99.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 11. ĐỘ DÀI VÀ ĐƠN VỊ ĐO ĐỘ DÀI. TIỀN VIỆT NAM ============
  const c11 = {
    id: 'g2-c11', semester: 2, title: L('Độ dài và đơn vị đo độ dài. Tiền Việt Nam', 'Length and units of length. Vietnamese money'), icon: '📏', lessons: [
      lesson(11, 55, L('Đề-xi-mét. Mét. Ki-lô-mét', 'Decimetres. Metres. Kilometres'),
        L('Rô-bốt ISA dùng thước mét đo chiều dài lớp học cùng bạn Quân.', 'ISA the robot and Quân use a metre stick to measure the length of the classroom.'),
        [
          { text: L('1 dm = 10 cm. Gang tay của em dài khoảng 1 dm.', '1 dm = 10 cm. Your hand span is about 1 dm.'), visual: vz('ruler', { length: 10, unit: 'cm', object: 'ribbon' }) },
          { text: L('1 m = 10 dm = 100 cm. 1 km = 1000 m: quãng đường dài người ta đo bằng ki-lô-mét.', '1 m = 10 dm = 100 cm. 1 km = 1000 m: long distances are measured in kilometres.'), visual: vz('ruler', { length: 3, unit: 'dm', object: 'pencil' }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) {
            const a = R(rng, 1, 9);
            const [p, v, u] = P(rng, [[`${a} dm = ? cm`, a * 10, 'cm'], [`${a} m = ? dm`, a * 10, 'dm'], [`${a} m = ? cm`, a * 100, 'cm'], ['1 km = ? m', 1000, 'm'], [`${a * 10} cm = ? dm`, a, 'dm']]);
            return Q(p, null, num(v, u), L('Nhớ: 1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m.', 'Remember: 1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m.'), `${p.replace('?', v)}.`);
          }
          if (f === 1) { const len = R(rng, 1, 5); return Q(L('Sợi ruy băng dài mấy đề-xi-mét?', 'How many decimetres long is the ribbon?'), vz('ruler', { length: len, unit: 'dm', object: 'ribbon' }), num(len, 'dm'), L('Mỗi khoảng lớn trên thước là 1 dm.', 'Each big space on the ruler is 1 dm.'), L(`Sợi ruy băng dài ${len} dm.`, `The ribbon is ${len} dm long.`)); }
          if (f === 2) { const [a, b] = pairWhere(rng, [2, 60], [1, 30], (x, y) => noCarry(x, y), [12, 5]); const u = P(rng, ['dm', 'm', 'km']); return Q(`${a} ${u} + ${b} ${u} = ?`, null, num(a + b, u), L(`Cộng các số rồi ghi đơn vị ${u}.`, `Add the numbers, then write the unit ${u}.`), `${a} ${u} + ${b} ${u} = ${a + b} ${u}.`); }
          if (f === 3) {
            const [p, u] = P(rng, EN
              ? [['A pencil is about 15', 'cm'], ['Our school flagpole is about 10', 'm'], ['The road from Hà Nội to Hải Phòng is about 100', 'km'], ['The classroom is about 8', 'm'], ['A maths book is about 26', 'cm'], ['Your hand span is about 1', 'dm']]
              : [['Chiếc bút chì dài khoảng 15', 'cm'], ['Cột cờ trường em cao khoảng 10', 'm'], ['Quãng đường từ Hà Nội đến Hải Phòng dài khoảng 100', 'km'], ['Phòng học dài khoảng 8', 'm'], ['Quyển sách Toán dài khoảng 26', 'cm'], ['Gang tay của em dài khoảng 1', 'dm']]);
            return Q(L(`Chọn đơn vị thích hợp:\n${p} …`, `Choose the right unit:\n${p} …`), null, ch(rng, u, ['cm', 'dm', 'm', 'km'].filter(x => x !== u)), L('Hình dung độ dài thật của đồ vật.', 'Think about how long the real thing is.'), `${p} ${u}.`);
          }
          const a = R(rng, 1, 9), pairs = [[`${a} m`, a * 100, `${a * 10} dm`, a * 100], [`${a} dm`, a * 10, `${a * 10 + P(rng, [-5, 5, 0])} cm`, null], [`${a} m`, a * 100, `${a * 100 + P(rng, [-10, 10])} cm`, null]];
          const pr = P(rng, pairs);
          const rv = pr[3] != null ? pr[3] : Number(pr[2].split(' ')[0]);
          return Q(L(`So sánh: ${pr[0]} … ${pr[2]}`, `Compare: ${pr[0]} … ${pr[2]}`), vz('compare', { left: pr[0], right: pr[2] }), cmpAns(pr[1], rv), L('Đổi về cùng đơn vị rồi so sánh.', 'Change them to the same unit, then compare.'), `${pr[0]} = ${pr[1]} cm${pr[3] != null ? `, ${pr[2]} = ${pr[3]} cm` : ''}. ${L('Vậy', 'So')} ${pr[0]} ${sign(pr[1], rv)} ${pr[2]}.`);
        }),

      lesson(11, 56, L('Giới thiệu tiền Việt Nam', 'Vietnamese money'),
        L('Rô-bốt ISA theo bạn Chi bỏ tiền tiết kiệm vào chú lợn đất.', 'ISA the robot watches Chi put her savings into her clay piggy bank.'),
        [
          { text: L('Các tờ tiền: 100 đồng, 200 đồng, 500 đồng, 1000 đồng.', 'Here are some notes: 100 dong, 200 dong, 500 dong, 1000 dong.'), visual: vz('money', { notes: [100, 200, 500, 1000] }) },
          { text: L('1 tờ 500 đồng và 2 tờ 200 đồng: 500 + 200 + 200 = 900 (đồng).', 'One 500 dong note and two 200 dong notes: 500 + 200 + 200 = 900 (dong).'), visual: vz('money', { notes: [500, 200, 200] }) },
        ],
        more(function (rng, i) {
          const f = i % 4, D = L('đồng', 'dong');
          if (f === 0) {
            let notes, s; for (let g = 0; g < 50; g++) { notes = Array.from({ length: R(rng, 2, lv(i) === 0 ? 3 : 4) }, () => P(rng, [100, 200, 500])); s = notes.reduce((x, y) => x + y, 0); if (s <= 1000) break; }
            if (s > 1000) { notes = [500, 200]; s = 700; }
            notes.sort((x, y) => y - x);
            return Q(L('Có tất cả bao nhiêu tiền?', 'How much money is there altogether?'), vz('money', { notes }), num(s, D), L('Cộng giá trị các tờ tiền.', 'Add up the values of the notes.'), `${notes.join(' + ')} = ${s} (${D}).`);
          }
          if (f === 1) {
            // lớp 2 only divides by 2 and 5: explain with repeated addition
            const [big, small] = P(rng, [[1000, 500], [1000, 200], [1000, 100], [500, 100], [200, 100]]), k = big / small;
            return Q(L(`Đổi 1 tờ ${big} đồng được mấy tờ ${small} đồng?`, `How many ${small} dong notes do you get for one ${big} dong note?`), vz('money', { notes: [big] }), num(k), `${small} + ${small} + … = ${big}.`, L(`${big} đồng = ${Array(k).fill(small).join(' + ')} (đồng), nên đổi được ${k} tờ ${small} đồng.`, `${big} dong = ${Array(k).fill(small).join(' + ')} (dong), so you get ${k} notes of ${small} dong.`)); }
          if (f === 2) { const price = R(rng, 1, 9) * 100; const pay = 1000; const who = nm(rng); return Q(L(`${who} mua một cái bút giá ${price} đồng, đưa cô bán hàng tờ 1000 đồng. Cô trả lại bao nhiêu tiền?`, `${who} buys a pen for ${price} dong and gives the shopkeeper a 1000 dong note. How much change does ${who} get back?`), vz('money', { notes: [1000] }), num(pay - price, D), L('Lấy số tiền đưa trừ giá tiền.', 'Take the price away from the money given.'), `1000 ${M} ${price} = ${pay - price} (${D}).`); }
          const target = R(rng, 3, 10) * 100;
          const combos = [[500, 200, 100], [500, 500], [200, 200, 100], [500, 200], [200, 100], [500, 100], [500, 200, 200], [500, 200, 200, 100], [200, 200, 200], [500, 500, 100]];
          const good = combos.filter(c => c.reduce((x, y) => x + y, 0) === target);
          const bad = combos.filter(c => c.reduce((x, y) => x + y, 0) !== target);
          const str = c => c.map(x => x + ' ' + D).join(' + ');
          if (!good.length) { const n = target / 100; return Q(L(`Cần bao nhiêu tờ 100 đồng để được ${target} đồng?`, `How many 100 dong notes make ${target} dong?`), vz('money', { notes: [100] }), num(n), L('Đếm thêm 100.', 'Count in hundreds.'), L(`${target} đồng = ${Array(n).fill(100).join(' + ')} (đồng), nên cần ${n} tờ 100 đồng.`, `${target} dong = ${Array(n).fill(100).join(' + ')} (dong), so you need ${n} notes of 100 dong.`)); }
          return Q(L(`Chọn các tờ tiền có tổng là ${target} đồng:`, `Choose the notes that make ${target} dong altogether:`), null, ch(rng, str(good[0]), U.sample(rng, bad, 3).map(str)), L('Cộng giá trị các tờ tiền trong mỗi đáp án.', 'Add up the notes in each answer.'), `${good[0].join(' + ')} = ${target} (${D}).`);
        }, [
          [0, 6, rng => {
            const x = nm(rng), [a, b] = U.sample(rng, ['cái kẹo', 'cái bút chì', 'quyển vở', 'cái tẩy', 'cái thước kẻ', 'gói bánh quy'], 2);
            const p1 = R(rng, 1, 5) * 100, p2 = R(rng, 1, 10 - p1 / 100) * 100;
            return Q(L(`${x} mua một ${a} giá ${p1} đồng và một ${b} giá ${p2} đồng. Hỏi ${x} phải trả tất cả bao nhiêu tiền?`, `${x} buys ${art(wE(a, 1))} for ${p1} dong and ${art(wE(b, 1))} for ${p2} dong. How much does ${x} pay altogether?`), null, num(p1 + p2, L('đồng', 'dong')), L('Cộng giá tiền hai món đồ.', 'Add the prices of the two things.'), `${p1} + ${p2} = ${p1 + p2} (${L('đồng', 'dong')}).`);
          }],
          [0, 9, rng => {
            const [a, b] = [P(rng, [500, 200, 100]), P(rng, [200, 100, 500])].sort((x, y) => y - x), s = a + b, claim = P(rng, [s, s, s + 100, s - 100, s + 200]);
            return Q(L(`Đúng hay sai?\nTờ ${a} đồng và tờ ${b} đồng có tất cả ${claim} đồng.`, `True or false?\nA ${a} dong note and a ${b} dong note make ${claim} dong altogether.`), vz('money', { notes: [a, b] }), tf(rng, claim === s), L('Cộng giá trị hai tờ tiền.', 'Add the values of the two notes.'), `${a} + ${b} = ${s} (${L('đồng', 'dong')}). ${claim === s ? TRUE : FALSE}.`);
          }],
          [3, 9, rng => {
            const a = P(rng, [500, 200]), b = P(rng, [200, 100, 500]), c = Math.min(1000, a + b + P(rng, [-200, -100, 0, 0, 100, 200]));
            return Q(L(`So sánh: ${a} đồng + ${b} đồng … ${c} đồng`, `Compare: ${a} dong + ${b} dong … ${c} dong`), vz('compare', { left: `${a} + ${b}`, right: c }), cmpAns(a + b, c), L('Tính tổng số tiền bên trái rồi so sánh.', 'Work out the total on the left, then compare.'), `${a} + ${b} = ${a + b}; ${a + b} ${sign(a + b, c)} ${c}.`);
          }],
          [3, 9, rng => {
            const notes = U.sample(rng, [500, 200, 200, 100, 100], R(rng, 2, 3)).sort((x, y) => y - x), s = notes.reduce((x, y) => x + y, 0);
            const p = Math.max(100, Math.min(1000, s + P(rng, [-200, -100, 0, 100, 200, 300]))), x = nm(rng), it = P(rng, ['quyển truyện', 'hộp bút màu', 'cái cặp tóc', 'quả bóng nhỏ']);
            const yes = L('Đủ tiền', 'Yes, enough'), no = L('Không đủ tiền', 'No, not enough');
            return Q(L(`${x} có số tiền như hình. ${x} muốn mua một ${it} giá ${p} đồng. ${x} có đủ tiền không?`, `${x} has the money in the picture. ${x} wants to buy ${art(wE(it, 1))} that costs ${p} dong. Does ${x} have enough money?`), vz('money', { notes }), ch(rng, s >= p ? yes : no, [s >= p ? no : yes]), L('Cộng số tiền đang có rồi so sánh với giá tiền.', 'Add up the money, then compare it with the price.'), L(`${notes.join(' + ')} = ${s} (đồng); ${s} ${sign(s, p)} ${p} nên ${x} ${s >= p ? 'đủ' : 'không đủ'} tiền.`, `${notes.join(' + ')} = ${s} (dong); ${s} ${sign(s, p)} ${p}, so ${x} ${s >= p ? 'has' : 'does not have'} enough money.`));
          }],
          [6, 9, rng => {
            const notes = U.sample(rng, [500, 200, 200, 100], R(rng, 1, 2)).sort((x, y) => y - x), s = notes.reduce((x, y) => x + y, 0);
            const p = R(rng, s / 100 + 1, 10) * 100, x = nm(rng);
            return Q(L(`${x} có số tiền như hình. Một chiếc bút giá ${p} đồng. ${x} cần thêm bao nhiêu tiền nữa thì mua được chiếc bút?`, `${x} has the money in the picture. A pen costs ${p} dong. How much more money does ${x} need to buy the pen?`), vz('money', { notes }), num(p - s, L('đồng', 'dong')), L('Tính số tiền đang có, rồi lấy giá tiền trừ đi số tiền đó.', 'Work out how much money there is, then take it away from the price.'), L(`${x} có ${s} đồng. ${p} ${M} ${s} = ${p - s} (đồng).`, `${x} has ${s} dong. ${p} ${M} ${s} = ${p - s} (dong).`));
          }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 12. PHÉP CỘNG, PHÉP TRỪ TRONG PHẠM VI 1000 ============
  const c12 = {
    id: 'g2-c12', semester: 2, title: L('Phép cộng, phép trừ trong phạm vi 1000', 'Addition and subtraction to 1000'), icon: '➕', lessons: [
      lesson(12, 59, L('Phép cộng (không nhớ) trong phạm vi 1000', 'Addition to 1000 (no carrying)'),
        L('Rô-bốt ISA cùng bạn Thảo đếm số học sinh khối 2 và khối 3 đi tham quan.', 'ISA the robot and Thảo count the Grade 2 and Grade 3 pupils going on a school trip.'),
        [
          { text: L('325 + 142: cộng đơn vị 5 + 2 = 7; chục 2 + 4 = 6; trăm 3 + 1 = 4. Vậy 325 + 142 = 467.', '325 + 142: add the ones, 5 + 2 = 7; the tens, 2 + 4 = 6; the hundreds, 3 + 1 = 4. So 325 + 142 = 467.'), visual: vz('columnCalc', { a: 325, b: 142, op: '+', reveal: 'all' }) },
          { text: L('Cộng nhẩm số tròn trăm: 300 + 200 = 500 (3 trăm + 2 trăm = 5 trăm).', 'Adding multiples of 100 in your head: 300 + 200 = 500 (3 hundreds + 2 hundreds = 5 hundreds).'), visual: vz('blocks', { hundreds: 5, tens: 0, ones: 0 }) },
        ],
        colGen('+', (r, lvl) => pairWhere(r, lvl === 0 ? [100, 500] : [100, 800], lvl === 0 ? [10, 99] : [100, 600], (a, b) => noCarry(a, b) && a + b <= 999, [325, 142]), { items: BIG })),
      lesson(12, 60, L('Phép cộng (có nhớ) trong phạm vi 1000', 'Addition to 1000 (with carrying)'),
        L('Rô-bốt ISA giúp nhà bạn Việt tính số quả trứng gà thu được trong hai ngày.', 'ISA the robot helps Việt\'s family count the hens\' eggs they collected over two days.'),
        [
          { text: L('258 + 136: 8 + 6 = 14, viết 4 nhớ 1; 5 + 3 = 8, thêm 1 là 9; 2 + 1 = 3. Vậy 258 + 136 = 394.', '258 + 136: 8 + 6 = 14, write 4 and carry 1; 5 + 3 = 8, plus 1 is 9; 2 + 1 = 3. So 258 + 136 = 394.'), visual: vz('columnCalc', { a: 258, b: 136, op: '+', reveal: 'all' }) },
          { text: L('Nhớ có thể xảy ra ở hàng chục: 172 + 251 = 423 (7 + 5 = 12, viết 2 nhớ 1).', 'You can also carry from the tens: 172 + 251 = 423 (7 + 5 = 12, write 2 and carry 1).'), visual: vz('columnCalc', { a: 172, b: 251, op: '+', reveal: 'all' }) },
        ],
        colGen('+', (r, lvl) => pairWhere(r, [100, 700], lvl === 0 ? [10, 99] : [100, 500], (a, b) => !noCarry(a, b) && a + b <= 999, [258, 136]), { carry: true, items: BIG })),
      lesson(12, 61, L('Phép trừ (không nhớ) trong phạm vi 1000', 'Subtraction to 1000 (no borrowing)'),
        L('Rô-bốt ISA cùng bạn Vy tính số vé xem xiếc còn lại.', 'ISA the robot and Vy work out how many circus tickets are left.'),
        [
          { text: L('587 − 254: 7 − 4 = 3; 8 − 5 = 3; 5 − 2 = 3. Vậy 587 − 254 = 333.', '587 − 254: 7 − 4 = 3; 8 − 5 = 3; 5 − 2 = 3. So 587 − 254 = 333.'), visual: vz('columnCalc', { a: 587, b: 254, op: M, reveal: 'all' }) },
          { text: L('Trừ nhẩm số tròn trăm: 700 − 300 = 400.', 'Subtracting multiples of 100 in your head: 700 − 300 = 400.'), visual: vz('blocks', { hundreds: 4, tens: 0, ones: 0 }) },
        ],
        colGen(M, (r, lvl) => pairWhere(r, [200, 999], lvl === 0 ? [10, 99] : [100, 800], (a, b) => a > b && noBorrow(a, b), [587, 254]), { items: BIG })),
      lesson(12, 62, L('Phép trừ (có nhớ) trong phạm vi 1000', 'Subtraction to 1000 (with borrowing)'),
        L('Rô-bốt ISA giúp cô bán sách tính số quyển còn lại sau buổi hội sách.', 'ISA the robot helps the bookseller work out how many books are left after the book fair.'),
        [
          { text: L('462 − 128: 2 không trừ được 8, lấy 12 − 8 = 4, viết 4 nhớ 1; 2 thêm 1 là 3, 6 − 3 = 3; 4 − 1 = 3. Vậy 462 − 128 = 334.', '462 − 128: you cannot take 8 from 2, so take 8 from 12. 12 − 8 = 4, write 4 and carry 1. Then 2 + 1 = 3 and 6 − 3 = 3. Then 4 − 1 = 3. So 462 − 128 = 334.'), visual: vz('columnCalc', { a: 462, b: 128, op: M, reveal: 'all' }) },
          { text: L('Thử lại: 334 + 128 = 462.', 'Check: 334 + 128 = 462.'), visual: vz('columnCalc', { a: 334, b: 128, op: '+', reveal: 'all' }) },
        ],
        colGen(M, (r, lvl) => pairWhere(r, [200, 999], lvl === 0 ? [10, 99] : [100, 800], (a, b) => a > b && !noBorrow(a, b), [462, 128]), { carry: true, items: BIG })),
    ],
  };

  // ============ CHỦ ĐỀ 13. LÀM QUEN VỚI YẾU TỐ THỐNG KÊ, XÁC SUẤT ============
  const FR = [{ n: 'táo', en: ['apple', 'apples'], e: '🍎' }, { n: 'cam', en: ['orange', 'oranges'], e: '🍊' }, { n: 'chuối', en: ['banana', 'bananas'], e: '🍌' }, { n: 'xoài', en: ['mango', 'mangoes'], e: '🥭' }, { n: 'dưa hấu', en: ['watermelon', 'watermelons'], e: '🍉' }];
  const COL = [{ n: 'đỏ', en: 'red', c: '#E84A4A' }, { n: 'xanh', en: 'blue', c: '#4DA3FF' }, { n: 'vàng', en: 'yellow', c: '#FFC93C' }, { n: 'xanh lá', en: 'green', c: '#5BC85B' }];
  const c13 = {
    id: 'g2-c13', semester: 2, title: L('Làm quen với yếu tố thống kê, xác suất', 'Getting to know data and chance'), icon: '📊', lessons: [
      lesson(13, 64, L('Thu thập, phân loại, kiểm đếm số liệu', 'Collecting, sorting and counting data'),
        L('Rô-bốt ISA cùng bạn Mai kiểm đếm các loại quả trong giỏ quà biếu bà.', 'ISA the robot and Mai count the fruit in a gift basket for Grandma.'),
        [
          { text: L('Phân loại rồi đếm từng loại: 4 quả táo, 3 quả cam, 2 quả chuối.', 'Sort the fruit, then count each kind: 4 apples, 3 oranges, 2 bananas.'), visual: vz('objects', { groups: [{ emoji: '🍎', count: 4 }, { emoji: '🍊', count: 3 }, { emoji: '🍌', count: 2 }] }) },
          { text: L('Ghi kết quả kiểm đếm vào bảng.', 'Write the counts in a table.'), visual: vz('dataTable', { headers: EN ? ['Fruit', 'Apples', 'Oranges', 'Bananas'] : ['Loại quả', 'Táo', 'Cam', 'Chuối'], rows: [[L('Số quả', 'Number'), 4, 3, 2]] }) },
        ],
        function (rng, i) {
          const fr = U.sample(rng, FR, 3), cnt = fr.map(() => R(rng, 1, lv(i) === 0 ? 5 : 9)), f = i % 4;
          if (cnt[0] === cnt[1]) cnt[1] = cnt[1] === 1 ? 2 : cnt[1] - 1;
          if (cnt[2] === cnt[0] || cnt[2] === cnt[1]) cnt[2] = Math.max(...cnt) + 1;
          const og = vz('objects', { groups: fr.map((x, j) => ({ emoji: x.e, count: cnt[j] })) });
          const nmF = x => (EN ? cap(x.en[1]) : x.n[0].toUpperCase() + x.n.slice(1)); // table / option label
          const tb = vz('dataTable', { headers: [L('Loại quả', 'Fruit')].concat(fr.map(nmF)), rows: [[L('Số quả', 'Number')].concat(cnt)] });
          const QU = L('quả', 'fruit');
          if (f === 0) { const j = R(rng, 0, 2); return Q(L(`Có bao nhiêu quả ${fr[j].n}?`, `How many ${fr[j].en[1]} are there?`), og, num(cnt[j]), L(`Chỉ đếm quả ${fr[j].n}.`, `Count only the ${fr[j].en[1]}.`), L(`Có ${cnt[j]} quả ${fr[j].n}.`, `There ${cnt[j] === 1 ? 'is' : 'are'} ${cnt[j]} ${fr[j].en[cnt[j] === 1 ? 0 : 1]}.`)); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...cnt) : Math.min(...cnt), j = cnt.indexOf(v); return Q(L(`Loại quả nào có số quả ${big ? 'nhiều' : 'ít'} nhất?`, `Which kind of fruit has the ${big ? 'most' : 'fewest'}?`), tb, ch(rng, nmF(fr[j]), fr.map(nmF)), L('So sánh các số trong bảng.', 'Compare the numbers in the table.'), L(`${nmF(fr[j])}: ${v} ${QU}.`, `${nmF(fr[j])}: ${v}.`)); }
          if (f === 2) { const s = cnt[0] + cnt[1] + cnt[2]; return Q(L('Có tất cả bao nhiêu quả?', 'How many pieces of fruit are there altogether?'), tb, num(s), L('Cộng số quả của các loại.', 'Add the numbers for each kind of fruit.'), `${cnt.join(' + ')} = ${s} (${QU}).`); }
          const [x, y] = [0, 1].map(k => k); const hi = cnt[x] > cnt[y] ? x : y, lo = hi === x ? y : x;
          return Q(L(`Số quả ${fr[hi].n} nhiều hơn số quả ${fr[lo].n} bao nhiêu quả?`, `How many more ${fr[hi].en[1]} than ${fr[lo].en[1]} are there?`), og, num(cnt[hi] - cnt[lo]), L('Lấy số lớn trừ số bé.', 'Take the smaller number away from the greater.'), `${cnt[hi]} ${M} ${cnt[lo]} = ${cnt[hi] - cnt[lo]} (${QU}).`);
        }),

      lesson(13, 65, L('Biểu đồ tranh', 'Pictograms'),
        L('Rô-bốt ISA cùng các bạn lớp 2A vẽ biểu đồ tranh về con vật yêu thích.', 'ISA the robot and class 2A draw a pictogram of their favourite animals.'),
        [
          { text: L('Biểu đồ tranh: mỗi hình vẽ là 1 bạn. Hàng "Mèo" có 5 hình nên 5 bạn thích mèo.', 'In this pictogram each picture stands for 1 child. The "Cats" row has 5 pictures, so 5 children like cats.'), visual: vz('pictograph', { rows: [{ label: L('Mèo', 'Cats'), count: 5 }, { label: L('Chó', 'Dogs'), count: 4 }, { label: L('Thỏ', 'Rabbits'), count: 2 }], emoji: '🙂' }) },
        ],
        function (rng, i) {
          // every prompt says what the chart shows and names the counted thing with its unit
          const lc = s => s.toLowerCase();
          const sets = EN ? [
            { labels: ['Cats', 'Dogs', 'Rabbits', 'Goldfish'], emoji: '🙂', u: ['child', 'children'],
              intro: 'The pictogram shows how many children in class 2A like each animal. Each picture stands for 1 child.',
              row: l => `How many children like ${lc(l)}?`,
              most: big => `Which animal do the ${big ? 'most' : 'fewest'} children like?`,
              diff: (h, l) => `How many more children like ${lc(h)} than ${lc(l)}?`,
              total: 'How many children were asked altogether?' },
            { labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], emoji: '🌱', u: ['tree', 'trees'],
              intro: 'The pictogram shows how many trees class 2A planted each day. Each picture stands for 1 tree.',
              row: l => `How many trees did class 2A plant on ${l}?`,
              most: big => `On which day did class 2A plant the ${big ? 'most' : 'fewest'} trees?`,
              diff: (h, l) => `How many more trees were planted on ${h} than on ${l}?`,
              total: 'How many trees did class 2A plant altogether?' },
            { labels: ['Apples', 'Oranges', 'Mangoes', 'Bananas'], emoji: '🍎', u: ['fruit', 'fruit'],
              intro: 'The pictogram shows how many of each fruit are in the basket. Each picture stands for 1 fruit.',
              row: l => `How many ${lc(l)} are in the basket?`,
              most: big => `Which kind of fruit has the ${big ? 'most' : 'fewest'} in the basket?`,
              diff: (h, l) => `How many more ${lc(h)} than ${lc(l)} are there?`,
              total: 'How many pieces of fruit are in the basket altogether?' },
          ] : [
            { labels: ['Mèo', 'Chó', 'Thỏ', 'Cá vàng'], emoji: '🙂', u: 'bạn',
              intro: 'Biểu đồ cho biết số bạn lớp 2A thích mỗi con vật. Mỗi hình vẽ là 1 bạn.',
              row: l => `Có bao nhiêu bạn thích ${lc(l)}?`,
              most: big => `Con vật nào được ${big ? 'nhiều' : 'ít'} bạn thích nhất?`,
              diff: (h, l) => `Số bạn thích ${lc(h)} nhiều hơn số bạn thích ${lc(l)} bao nhiêu bạn?`,
              total: 'Có tất cả bao nhiêu bạn được hỏi?' },
            { labels: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm'], emoji: '🌱', u: 'cây',
              intro: 'Biểu đồ cho biết số cây lớp 2A trồng được mỗi ngày. Mỗi hình vẽ là 1 cây.',
              row: l => `Ngày ${lc(l[0]) + l.slice(1)}, lớp 2A trồng được bao nhiêu cây?`,
              most: big => `Ngày nào lớp 2A trồng được ${big ? 'nhiều' : 'ít'} cây nhất?`,
              diff: (h, l) => `Ngày ${lc(h[0]) + h.slice(1)} trồng được nhiều hơn ngày ${lc(l[0]) + l.slice(1)} bao nhiêu cây?`,
              total: 'Lớp 2A trồng được tất cả bao nhiêu cây?' },
            { labels: ['Táo', 'Cam', 'Xoài', 'Chuối'], emoji: '🍎', u: 'quả',
              intro: 'Biểu đồ cho biết số quả mỗi loại trong giỏ. Mỗi hình vẽ là 1 quả.',
              row: l => `Trong giỏ có bao nhiêu quả ${lc(l)}?`,
              most: big => `Loại quả nào có ${big ? 'nhiều' : 'ít'} quả nhất?`,
              diff: (h, l) => `Số quả ${lc(h)} nhiều hơn số quả ${lc(l)} bao nhiêu quả?`,
              total: 'Trong giỏ có tất cả bao nhiêu quả?' },
          ];
          const st = P(rng, sets), k = lv(i) === 0 ? 3 : 4;
          const labels = st.labels.slice(0, k);
          const counts = U.sample(rng, [1, 2, 3, 4, 5, 6, 7, 8], k);
          const pv = vz('pictograph', { rows: labels.map((l, j) => ({ label: l, count: counts[j] })), emoji: st.emoji });
          const f = i % 4;
          const uu = n => (typeof st.u === 'string' ? st.u : st.u[n === 1 ? 0 : 1]); // English unit agrees with n
          if (f === 0) { const j = R(rng, 0, k - 1); return Q(`${st.intro}\n${st.row(labels[j])}`, pv, num(counts[j], uu(counts[j])), L('Đếm số hình ở hàng đó.', 'Count the pictures in that row.'), L(`Hàng "${labels[j]}" có ${counts[j]} hình, tức là ${counts[j]} ${st.u}.`, `The "${labels[j]}" row has ${pE(counts[j], 'picture')}, so that is ${counts[j]} ${uu(counts[j])}.`)); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...counts) : Math.min(...counts); return Q(`${st.intro}\n${st.most(big)}`, pv, ch(rng, labels[counts.indexOf(v)], labels), L('So sánh độ dài các hàng.', 'Compare the lengths of the rows.'), L(`"${labels[counts.indexOf(v)]}" có ${v} ${st.u}.`, `"${labels[counts.indexOf(v)]}" has ${v} ${uu(v)}.`)); }
          if (f === 2) { const [a, b] = U.sample(rng, labels.map((_, j) => j), 2); const hi = counts[a] > counts[b] ? a : b, lo = hi === a ? b : a; return Q(`${st.intro}\n${st.diff(labels[hi], labels[lo])}`, pv, num(counts[hi] - counts[lo], uu(counts[hi] - counts[lo])), L('Lấy số lớn trừ số bé.', 'Take the smaller number away from the greater.'), `${counts[hi]} ${M} ${counts[lo]} = ${counts[hi] - counts[lo]} (${uu(counts[hi] - counts[lo])}).`); }
          const s = counts.reduce((x, y) => x + y, 0);
          return Q(`${st.intro}\n${st.total}`, pv, num(s, uu(s)), L('Cộng số hình của tất cả các hàng.', 'Add up the pictures in all the rows.'), `${counts.join(' + ')} = ${s} (${uu(s)}).`);
        }),

      lesson(13, 66, L('Chắc chắn, có thể, không thể', 'Certain, possible, impossible'),
        L('Rô-bốt ISA rủ bạn Hùng chơi trò bốc bóng trong hộp kín.', 'ISA the robot and Hùng play a game: pick a ball from a closed box.'),
        [
          { text: L('Hộp chỉ có bóng đỏ: lấy 1 quả thì CHẮC CHẮN được bóng đỏ, KHÔNG THỂ được bóng xanh.', 'The box has only red balls. If you take 1 ball, you are CERTAIN to get a red ball. It is IMPOSSIBLE to get a blue ball.'), visual: vz('chance', { items: [{ color: '#E84A4A', count: 5 }] }) },
          { text: L('Hộp có bóng đỏ và bóng xanh: lấy 1 quả thì CÓ THỂ được bóng đỏ.', 'The box has red balls and blue balls. If you take 1 ball, it is POSSIBLE that you get a red ball.'), visual: vz('chance', { items: [{ color: '#E84A4A', count: 3 }, { color: '#4DA3FF', count: 2 }] }) },
        ],
        function (rng, i) {
          const k = R(rng, 1, lv(i) === 0 ? 2 : 3);
          const cols = U.sample(rng, COL, k + 1);
          const inBox = cols.slice(0, k), out = cols[k];
          const items = inBox.map(c => ({ color: c.c, count: R(rng, 1, 6) }));
          const t = R(rng, 0, 2);
          const CH = EN ? ['Certain', 'Possible', 'Impossible'] : ['Chắc chắn', 'Có thể', 'Không thể'];
          let ask, ans;
          if (t === 0) { ask = inBox[0]; ans = k === 1 ? CH[0] : CH[1]; }
          else if (t === 1) { ask = out; ans = CH[2]; }
          else { ask = inBox[k - 1]; ans = k === 1 ? CH[0] : CH[1]; }
          const parts = inBox.map((c, j) => L(`${items[j].count} quả bóng ${c.n}`, `${items[j].count} ${c.en} ${items[j].count === 1 ? 'ball' : 'balls'}`));
          const desc = EN && parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts.join(', ');
          const isAre = k === 1 && items[0].count === 1 ? 'is' : 'are';
          return Q(L(`Trong hộp có ${desc}. Không nhìn, lấy ra 1 quả bóng. ${'…'} lấy được quả bóng ${ask.n}.`, `In the box there ${isAre} ${desc}. Without looking, you take out 1 ball. It is ${'…'} that you get a ${ask.en} ball.`), vz('chance', { items }), { kind: 'choice', options: CH.slice(), correct: CH.indexOf(ans) }, L('Xem trong hộp có những màu nào.', 'Look at which colours are in the box.'), ans === CH[2] ? L(`Trong hộp không có bóng ${ask.n} nên không thể lấy được.`, `There are no ${ask.en} balls in the box, so it is impossible to get one.`) : ans === CH[0] ? L(`Hộp chỉ có bóng ${ask.n} nên chắc chắn lấy được.`, `The box has only ${ask.en} balls, so you are certain to get one.`) : L(`Hộp có nhiều màu, nên có thể lấy được bóng ${ask.n}.`, `The box has balls of different colours, so it is possible to get a ${ask.en} ball.`));
        }),
    ],
  };

  CURRICULUM.push({
    grade: 2,
    title: L('Lớp 2', 'Grade 2'),
    book: L('Kết nối tri thức với cuộc sống', 'Kết nối tri thức với cuộc sống (Connecting Knowledge with Life)'),
    topics: [c1, c2, c3, c4, c5, c6, c8, c9, c10, c11, c12, c13],
  });
})();
