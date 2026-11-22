/* Toán ISA — Lớp 5 (SGK Toán 5 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g5-c{chủ đề index}-b{Bài number}. Never rename ids.
 * Decimals are generated from integer mantissas (dec(m, s) = m / 10^s) to avoid float noise.
 * Bilingual: every child-facing string is L('Vietnamese', 'English') (see I18N.md).
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const L = U.L, EN = U.EN, RE = x => U.readEN(x);
  const R = U.rand, P = U.pick, F = x => U.fmt(x);
  const M = '−';

  // ---------- helpers ----------
  const num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });
  const fracA = (n, d, simplest) => (simplest ? { kind: 'fraction', num: n, den: d, simplest: true } : { kind: 'fraction', num: n, den: d });
  const ch = (rng, c, d, f) => U.choices(rng, c, d, f);
  const EPS = 1e-9;
  const cmpAns = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b - EPS ? 0 : a > b + EPS ? 1 : 2 });
  const sign = (a, b) => (a < b - EPS ? '<' : a > b + EPS ? '>' : '=');
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
  const YES = L('Đúng', 'True'), NO = L('Sai', 'False');
  const tf = (rng, ok) => U.choices(rng, ok ? YES : NO, [ok ? NO : YES]);
  function Q(prompt, visual, answer, hint, explain, extra) {
    const q = { prompt, answer, hint, explain };
    if (visual) q.visual = visual;
    Object.assign(q, extra || {});
    if (q.hintVisual == null) delete q.hintVisual;
    return q;
  }
  const two = rng => U.sample(rng, U.NAMES, 2);
  const nm = rng => P(rng, U.NAMES);
  const rd = x => U.round(x, 6);
  const dec = (m, s) => U.round(m / Math.pow(10, s), s);
  const units = (x, max) => Math.max(1, Math.round(x * 12 / Math.max(1, max)));
  const fs = (n, d) => `${n}/${d}`;
  const mixed = (n, d) => { const w = Math.floor(n / d), r = n % d; return r ? `${w} ${r}/${d}` : String(w); };
  // English: "1 hour", "3 hours" (integers only).
  const pl = (n, word) => `${F(n)} ${word}${n === 1 ? '' : 's'}`;
  function pairWhere(rng, ra, rb, ok, fb) {
    for (let g = 0; g < 800; g++) {
      const a = R(rng, ra[0], ra[1]), b = R(rng, rb[0], rb[1]);
      if (ok(a, b)) return [a, b];
    }
    return fb;
  }
  function wrongAdd(a, b) { let r = 0, p = 1; while (a > 0 || b > 0) { r += ((a % 10 + b % 10) % 10) * p; p *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10); } return r; }
  function wrongSub(a, b) { let r = 0, p = 1; while (a > 0 || b > 0) { r += Math.abs(a % 10 - b % 10) * p; p *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10); } return r; }
  function wrongMul(a, b) { if (b >= 10) return a * (b % 10) + a * Math.floor(b / 10); let r = 0, p = 1; while (a > 0) { r += ((a % 10) * b % 10) * p; p *= 10; a = Math.floor(a / 10); } return r; }
  function wrongDiv(q) { const s = String(q).replace(/0/g, ''); const w = Number(s || '0'); return w !== q && w > 0 ? w : q + 1; }

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
  function readDec(x) { // "3,05" -> "ba phẩy không năm"
    const s = F(x).replace(/\s/g, '');
    const [ip, dp] = s.split(',');
    if (!dp) return readVN(Number(ip));
    const lead = dp.match(/^0*/)[0].length, rest = dp.slice(lead);
    return `${readVN(Number(ip))} phẩy ${Array(lead).fill('không').join(' ')}${lead && rest ? ' ' : ''}${rest ? readVN(Number(rest)) : ''}`.trim();
  }
  // Number words in the current language (English: "three point zero five").
  const readN = n => (EN ? RE(n) : readVN(n));
  const readD = x => (EN ? RE(x) : readDec(x));
  const roundTo = (n, p) => Math.round(n / p) * p;
  function expand(n) { const s = String(n), out = []; for (let k = 0; k < s.length; k++) { const d = Number(s[k]); if (d) out.push(d * Math.pow(10, s.length - 1 - k)); } return out; }
  const PLACES = EN ? ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions', 'ten millions', 'hundred millions']
    : ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn', 'triệu', 'chục triệu', 'trăm triệu'];
  const PVCOLS = EN ? ['Hundred millions', 'Ten millions', 'Millions', 'Hundred thousands', 'Ten thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones']
    : ['Trăm triệu', 'Chục triệu', 'Triệu', 'Trăm nghìn', 'Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  const colsFor = n => PVCOLS.slice(9 - String(n).length);

  // Learn cards show their labels (visuals hide most labels by default so questions do not give answers away).
  const LEARN_ON = { blocks: { labels: true }, fraction: { label: true }, decimalGrid: { showLabel: true }, percent: { showLabel: true }, thermometer: { showValue: true }, roman: { showValue: true, showText: true }, average: { showMean: true }, angle: { showDeg: true }, cubes: { showDims: true } };
  function lesson(c, b, title, story, learn, gen) {
    learn.forEach(card => { const v = card.visual; if (v && LEARN_ON[v.type]) v.params = Object.assign({}, LEARN_ON[v.type], v.params); });
    return { id: `g5-c${c}-b${b}`, title, book: L(`Bài ${b}`, `Lesson ${b}`), story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
  }
  const fv = (n, d, shape) => vz('fraction', { num: n, den: d, shape: shape || 'bar' });

  // ---------- column calculation (natural numbers and decimals) ----------
  // word templates: [text(a, b), unit of the answer]
  const T_ADD = [
    [(a, b) => L(`Ngày thứ nhất cửa hàng bán được ${F(a)} kg gạo, ngày thứ hai bán được ${F(b)} kg. Hỏi cả hai ngày bán được bao nhiêu ki-lô-gam gạo?`, `On the first day a shop sold ${F(a)} kg of rice. On the second day it sold ${F(b)} kg. How many kilograms of rice did it sell on the two days altogether?`), 'kg'],
    [(a, b) => L(`Đoạn đường thứ nhất dài ${F(a)} km, đoạn đường thứ hai dài ${F(b)} km. Cả hai đoạn đường dài bao nhiêu ki-lô-mét?`, `The first stretch of road is ${F(a)} km long and the second is ${F(b)} km long. How many kilometres long are the two stretches altogether?`), 'km'],
  ];
  const T_SUB = [
    [(a, b) => L(`Một thùng có ${F(a)} l nước mắm, người ta đã lấy ra ${F(b)} l. Hỏi trong thùng còn lại bao nhiêu lít nước mắm?`, `A barrel holds ${F(a)} l of fish sauce. ${F(b)} l is taken out. How many litres of fish sauce are left in the barrel?`), 'l'],
    [(a, b) => L(`Sợi dây dài ${F(a)} m, bạn đã cắt đi ${F(b)} m. Sợi dây còn lại dài bao nhiêu mét?`, `A rope is ${F(a)} m long. You cut off ${F(b)} m. How many metres of rope are left?`), 'm'],
  ];
  const T_MUL = [
    [(a, b) => L(`Mỗi tấm vải dài ${F(a)} m. Hỏi ${F(b)} tấm vải như thế dài bao nhiêu mét?`, `Each roll of cloth is ${F(a)} m long. How many metres long are ${F(b)} rolls like this?`), 'm'],
    [(a, b) => L(`Mỗi chuyến xe chở được ${F(a)} kg hàng. Hỏi ${F(b)} chuyến xe như thế chở được bao nhiêu ki-lô-gam hàng?`, `A lorry carries ${F(a)} kg of goods on each trip. How many kilograms of goods does it carry in ${F(b)} trips like this?`), 'kg'],
  ];
  const T_DIV = [
    [(a, b) => L(`Có ${F(a)} l dầu chia đều vào ${F(b)} can. Hỏi mỗi can có bao nhiêu lít dầu?`, `${F(a)} l of oil is shared equally between ${F(b)} cans. How many litres of oil are in each can?`), 'l'],
    [(a, b) => L(`Một sợi dây dài ${F(a)} m được cắt thành ${F(b)} đoạn bằng nhau. Mỗi đoạn dài bao nhiêu mét?`, `A rope ${F(a)} m long is cut into ${F(b)} equal pieces. How many metres long is each piece?`), 'm'],
  ];
  // Several column operations in one lesson (op chosen by i); exam picks one at random.
  function mixCol(list, opts) {
    const gens = list.map(([op, pick]) => colGen(op, pick, opts));
    const gen = (rng, i) => gens[i % gens.length](rng, i);
    gen.exam = (rng, level) => P(rng, gens).exam(rng, level);
    return gen;
  }
  function colGen(op, pickPair, opts) {
    opts = opts || {};
    const at = function (rng, lev, k) {
      const [a, b] = pickPair(rng, lev);
      const r = rd(op === '+' ? a + b : op === M ? a - b : op === '×' ? a * b : a / b);
      const isInt = Number.isInteger(a) && Number.isInteger(b);
      const wrong = isInt ? (op === '+' ? wrongAdd(a, b) : op === M ? wrongSub(a, b) : op === '×' ? wrongMul(a, b) : wrongDiv(r)) : rd(r * 10);
      const expr = `${F(a)} ${op} ${F(b)}`;
      const colOk = op !== ':' || (Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(r));
      const colV = colOk ? vz('columnCalc', { a, b, op, reveal: 'none' }) : null;
      const colH = colOk ? vz('columnCalc', { a, b, op, reveal: 'steps' }) : null;
      const hint = opts.hint || (op === '+' ? L('Đặt tính sao cho các chữ số cùng hàng (và dấu phẩy) thẳng cột, cộng như số tự nhiên rồi đặt dấu phẩy ở tổng thẳng cột với các dấu phẩy.', 'Line up digits of the same place (and the decimal commas) in columns. Add as with whole numbers, then put the comma in the sum under the other commas.')
        : op === M ? L('Đặt tính cho dấu phẩy thẳng cột (thêm chữ số 0 vào bên phải nếu cần), trừ như số tự nhiên rồi đặt dấu phẩy.', 'Line up the decimal commas (add zeros on the right if needed). Subtract as with whole numbers, then put in the comma.')
          : op === '×' ? L('Nhân như nhân số tự nhiên, rồi đếm xem các thừa số có tất cả bao nhiêu chữ số ở phần thập phân để đặt dấu phẩy ở tích.', 'Multiply as with whole numbers. Then count how many decimal places the factors have altogether and give the product that many decimal places.')
            : L('Chia như chia số tự nhiên; khi hết phần nguyên của số bị chia thì viết dấu phẩy vào thương rồi chia tiếp.', 'Divide as with whole numbers. When you have used up the whole-number part of the dividend, write a comma in the quotient and carry on dividing.'));
      const u = opts.unit ? ' ' + opts.unit : '';
      if (k === 0) return Q(L(`Đặt tính rồi tính:\n${expr}`, `Set out and calculate:\n${expr}`), colV, num(r), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, F(r), [wrong, rd(r / 10), rd(r + 1), rd(r * 100)].filter(x => x > 0).map(x => F(x))), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const T = op === '+' ? T_ADD : op === M ? T_SUB : op === '×' ? T_MUL : T_DIV;
        const [tf, unit] = P(rng, T);
        let p = tf(a, b);
        // Believable weight per metre: cloth only when light (< 1 kg/m), otherwise a steel pipe.
        if (op === '×' && !Number.isInteger(b)) p = a < 1 ? L(`Mỗi mét vải nặng ${F(a)} kg. Hỏi ${F(b)} m vải như thế nặng bao nhiêu ki-lô-gam?`, `Each metre of cloth weighs ${F(a)} kg. How many kilograms do ${F(b)} m of this cloth weigh?`) : L(`Mỗi mét ống thép nặng ${F(a)} kg. Hỏi một đoạn ống thép như thế dài ${F(b)} m nặng bao nhiêu ki-lô-gam?`, `Each metre of steel pipe weighs ${F(a)} kg. How many kilograms does a piece of this pipe ${F(b)} m long weigh?`);
        if (op === ':' && !Number.isInteger(b)) p = L(`Một thanh sắt dài ${F(b)} m nặng ${F(a)} kg. Hỏi 1 m thanh sắt đó nặng bao nhiêu ki-lô-gam?`, `An iron bar ${F(b)} m long weighs ${F(a)} kg. How many kilograms does 1 m of this bar weigh?`);
        const unitOut = op === '×' && !Number.isInteger(b) ? 'kg' : op === ':' && !Number.isInteger(b) ? 'kg' : unit;
        return Q(p, null, num(r, unitOut), op === '+' ? L('Tìm cả hai thì cộng.', 'To find the total, add.') : op === M ? L('Tìm phần còn lại thì trừ.', 'To find what is left, subtract.') : op === '×' ? L('Nhân giá trị một phần với số phần.', 'Multiply the amount for one by the number of them.') : L('Chia đều thì làm phép chia.', 'Sharing equally means dividing.'), `${expr} = ${F(r)} (${unitOut}).`);
      }
      if (k === 3) {
        const c = rd(Math.max(0, r + P(rng, [-1, 0, 1, 0.1, -0.1, 10])));
        return Q(L(`So sánh: ${expr} … ${F(c)}`, `Compare: ${expr} … ${F(c)}`), vz('compare', { left: expr, right: F(c) }), cmpAns(r, c), L('Tính kết quả rồi so sánh.', 'Work out the answer, then compare.'), `${expr} = ${F(r)}; ${F(r)} ${sign(r, c)} ${F(c)}.`);
      }
      if (wrong !== r && wrong > 0) {
        const who = nm(rng);
        return Q(L(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, `${who} worked out: ${expr} = ${F(wrong)}.\nWhat is the correct answer?`), colV, num(r), isInt ? L('Làm lại từng bước, chú ý phần nhớ.', 'Do it again step by step. Watch the carrying.') : L('Kiểm tra lại vị trí dấu phẩy.', 'Check where the decimal comma goes.'), `${expr} = ${F(r)}.`, { hintVisual: colH });
      }
      return Q(L(`Tính: ${expr}`, `Calculate: ${expr}`), colV, num(r), hint, `${expr} = ${F(r)}.`);
    };
    // gen: practice (form by i % 5). exam: level 1 = đặt tính rồi tính, level 2–3 = bài toán có lời văn.
    const gen = (rng, i) => at(rng, lv(i), i % 5);
    gen.exam = (rng, level) => (level === 1 ? at(rng, 1, 0) : at(rng, level === 2 ? 1 : 2, 2));
    return gen;
  }

  // ============ CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG ============
  function addSubFrac(rng, op, general) {
    let a, b, c, d;
    if (!general) { c = d = R(rng, 3, 12); a = R(rng, 1, c - 1); b = R(rng, 1, c - 1); }
    else { c = R(rng, 2, 9); do d = R(rng, 2, 10); while (d === c); a = R(rng, 1, c - 1); b = R(rng, 1, d - 1); }
    if (op === M && a / c < b / d) [a, b, c, d] = [b, a, d, c];
    if (op === M && a * d === b * c) a = a + 1 <= c ? a + 1 : a;
    const LC = U.lcm(c, d), A = a * LC / c, B = b * LC / d, Rn = op === '+' ? A + B : A - B;
    const [sn, sd] = Rn === 0 ? [0, 1] : U.simplify(Rn, LC);
    const how = c === d ? `${a}/${c} ${op} ${b}/${d} = (${a} ${op} ${b})/${c} = ${Rn}/${LC}` : `${a}/${c} ${op} ${b}/${d} = ${A}/${LC} ${op} ${B}/${LC} = ${Rn}/${LC}`;
    return { a, b, c, d, L: LC, Rn, sn, sd, expr: `${a}/${c} ${op} ${b}/${d}`, how: how + (sn !== Rn && Rn ? ` = ${sn}/${sd}` : '') + '.' };
  }
  const c1 = {
    id: 'g5-c1', semester: 1, title: L('Ôn tập và bổ sung', 'Revision and extension'), icon: '🔢', lessons: [
      lesson(1, 1, L('Ôn tập số tự nhiên', 'Revising whole numbers'),
        L('Rô-bốt ISA cùng bạn Minh đọc số dân Việt Nam trong cuốn sách Địa lí.', 'ISA the robot and Minh read the population of Viet Nam in a geography book.'),
        [
          { text: L('Số 102 345 678 đọc là "một trăm linh hai triệu ba trăm bốn mươi lăm nghìn sáu trăm bảy mươi tám".', `The number 102 345 678 is read "${RE(102345678)}".`), visual: vz('placeValue', { number: 102345678, columns: colsFor(102345678) }) },
          { text: L('Giá trị của chữ số phụ thuộc vào vị trí: chữ số 3 trong 102 345 678 có giá trị 300 000.', 'The value of a digit depends on its place: the digit 3 in 102 345 678 has the value 300 000.') },
        ],
        function (rng, i) {
          const n = R(rng, 100000, 999999999), s = String(n), f = i % 5;
          if (f === 0) return Q(L(`Số "${readVN(n)}" viết là:`, `Write "${RE(n)}" in digits:`), null, num(n), L('Viết theo từng lớp: triệu, nghìn, đơn vị.', 'Write it group by group: millions, thousands, ones.'), L(`Viết là ${F(n)}.`, `It is written ${F(n)}.`));
          if (f === 1) { const pos = R(rng, 0, s.length - 1), place = s.length - 1 - pos, v = Number(s[pos]) * Math.pow(10, place); return Q(L(`Trong số ${F(n)}, chữ số ${s[pos]} ở hàng ${PLACES[place]} có giá trị là bao nhiêu?`, `In the number ${F(n)}, the digit ${s[pos]} is in the ${PLACES[place]} place. What is its value?`), vz('placeValue', { number: n, columns: colsFor(n) }), num(v), L('Giá trị = chữ số × giá trị của hàng.', 'Value = digit × value of its place.'), L(`Giá trị là ${F(v)}.`, `The value is ${F(v)}.`)); }
          if (f === 2) { const m = Math.floor(n / 1000) * 1000 + R(rng, 0, 999); return Q(L(`So sánh: ${F(n)} … ${F(m)}`, `Compare: ${F(n)} … ${F(m)}`), vz('compare', { left: F(n), right: F(m) }), cmpAns(n, m), L('So sánh từng hàng từ trái sang phải.', 'Compare place by place from left to right.'), `${F(n)} ${sign(n, m)} ${F(m)}.`); }
          if (f === 3) { const [p, nmP] = P(rng, [[1000, L('hàng nghìn', 'the nearest thousand')], [100000, L('hàng trăm nghìn', 'the nearest hundred thousand')], [1000000, L('hàng triệu', 'the nearest million')]]); return Q(L(`Làm tròn số ${F(n)} đến ${nmP}.`, `Round ${F(n)} to ${nmP}.`), null, num(roundTo(n, p)), L('Xét chữ số ngay bên phải hàng làm tròn.', 'Look at the digit just to the right of the place you are rounding to.'), `${F(n)} ≈ ${F(roundTo(n, p))}.`); }
          const e = expand(n);
          return Q(L(`Viết số ${F(n)} thành tổng theo các hàng:`, `Write ${F(n)} as the sum of its places:`), null, ch(rng, e.map(F).join(' + '), [e.map((x, j) => F(j === e.length - 1 ? x * 10 : x)).join(' + '), e.map((x, j) => F(j === 0 ? x / 10 : x)).join(' + ')]), L('Mỗi chữ số nhân với giá trị hàng của nó.', 'Multiply each digit by the value of its place.'), `${F(n)} = ${e.map(F).join(' + ')}.`);
        }),
      lesson(1, 2, L('Ôn tập các phép tính với số tự nhiên', 'Revising calculations with whole numbers'),
        L('Rô-bốt ISA giúp hợp tác xã tính số tấn lúa thu hoạch của cả xã.', 'ISA the robot helps the farming co-operative work out how many tonnes of rice the whole commune harvested.'),
        [
          { text: L('Nhân với số có hai chữ số: 345 × 26 = 8970.', 'Multiplying by a two-digit number: 345 × 26 = 8970.'), visual: vz('columnCalc', { a: 345, b: 26, op: '×', reveal: 'all' }) },
          { text: L('Chia cho số có hai chữ số: 8970 : 26 = 345.', 'Dividing by a two-digit number: 8970 : 26 = 345.'), visual: vz('columnCalc', { a: 8970, b: 26, op: ':', reveal: 'all' }) },
        ],
        (function () {
          const addSub = L('Đặt tính thẳng cột rồi tính từ phải sang trái.', 'Line up the digits in columns, then calculate from right to left.');
          const gens = [
            colGen('+', r => pairWhere(r, [10000, 900000], [1000, 99999], () => true, [45672, 28519]), { hint: addSub }),
            colGen(M, r => pairWhere(r, [100000, 999999], [1000, 99999], (a, b) => a > b, [73120, 28519]), { hint: addSub }),
            colGen('×', r => pairWhere(r, [100, 9999], [11, 99], (a, b) => b % 10 !== 0, [345, 26]), { hint: L('Nhân lần lượt từng chữ số của thừa số thứ hai, tích riêng thứ hai viết lùi sang trái một cột.', 'Multiply by each digit of the second factor in turn. Write the second partial product one column further to the left.') }),
            colGen(':', r => pairWhere(r, [1000, 99999], [11, 99], (a, b) => a % b === 0, [8970, 26]), { hint: L('Chia từ trái sang phải, ước lượng thương ở mỗi lượt chia.', 'Divide from left to right, estimating the quotient at each step.') }),
          ];
          const g = (rng, i) => gens[i % 4](rng, i);
          g.exam = (rng, level) => P(rng, gens).exam(rng, level);
          return g;
        })()),
      lesson(1, 3, L('Ôn tập phân số', 'Revising fractions'),
        L('Rô-bốt ISA chia những chiếc bánh chưng ngày Tết thành các phần bằng nhau cùng bạn Lan.', 'ISA the robot and Lan cut the Tết rice cakes (bánh chưng) into equal parts.'),
        [
          { text: L('Phân số 3/4: mẫu số 4 cho biết chia thành 4 phần bằng nhau, tử số 3 cho biết lấy 3 phần.', 'In the fraction 3/4, the denominator 4 tells you the whole is cut into 4 equal parts, and the numerator 3 tells you that 3 parts are taken.'), visual: fv(3, 4, 'pie') },
          { text: L('Rút gọn: 6/8 = 3/4. Quy đồng mẫu số để so sánh: 2/3 = 8/12 và 3/4 = 9/12, nên 2/3 < 3/4.', 'Simplify: 6/8 = 3/4. To compare, give the fractions a common denominator: 2/3 = 8/12 and 3/4 = 9/12, so 2/3 < 3/4.'), visual: vz('fractionCompare', { a: [2, 3], b: [3, 4] }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const d = R(rng, 2, 10), n = R(rng, 1, d - 1); return Q(L('Viết phân số chỉ phần đã tô màu.', 'Write the fraction for the shaded part.'), fv(n, d, P(rng, ['bar', 'pie', 'rect'])), fracA(n, d), L('Mẫu số là số phần bằng nhau; tử số là số phần tô màu.', 'The denominator is the number of equal parts; the numerator is the number of shaded parts.'), `${n}/${d}.`); }
          if (f === 1) { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), [sn, sd] = U.simplify(n, d), k = R(rng, 2, 6); return Q(L(`Rút gọn phân số ${sn * k}/${sd * k} thành phân số tối giản.`, `Simplify ${sn * k}/${sd * k} to its simplest form.`), null, fracA(sn, sd, true), L(`Chia cả tử và mẫu cho ${k}.`, `Divide both the numerator and the denominator by ${k}.`), `${sn * k}/${sd * k} = ${sn}/${sd}.`); }
          if (f === 2) { const c = R(rng, 2, 9); let d = R(rng, 2, 9); if (d === c) d = c + 1; const a = R(rng, 1, c - 1), b = R(rng, 1, d - 1); const LC = U.lcm(c, d); return Q(L(`So sánh: ${a}/${c} … ${b}/${d}`, `Compare: ${a}/${c} … ${b}/${d}`), vz('fractionCompare', { a: [a, c], b: [b, d] }), cmpAns(a / c, b / d), L('Quy đồng mẫu số rồi so sánh tử số.', 'Give them a common denominator, then compare the numerators.'), L(`${a}/${c} = ${a * LC / c}/${LC}; ${b}/${d} = ${b * LC / d}/${LC}. Vậy ${a}/${c} ${sign(a / c, b / d)} ${b}/${d}.`, `${a}/${c} = ${a * LC / c}/${LC}; ${b}/${d} = ${b * LC / d}/${LC}. So ${a}/${c} ${sign(a / c, b / d)} ${b}/${d}.`)); }
          const arr = [], vals = []; while (arr.length < 4) { const d = R(rng, 2, 9), n = R(rng, 1, d - 1); if (!vals.some(v => Math.abs(v - n / d) < EPS)) { arr.push([n, d]); vals.push(n / d); } }
          const big = R(rng, 0, 1), idx = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals));
          return Q(L(`Phân số ${big ? 'lớn nhất' : 'bé nhất'} trong các phân số ${arr.map(([n, d]) => fs(n, d)).join('; ')} là:`, `The ${big ? 'largest' : 'smallest'} of the fractions ${arr.map(([n, d]) => fs(n, d)).join('; ')} is:`), null, ch(rng, fs(...arr[idx]), arr.map(([n, d]) => fs(n, d))), L('Quy đồng mẫu số hoặc so sánh với 1/2.', 'Give them a common denominator, or compare each one with 1/2.'), L(`Phân số ${big ? 'lớn nhất' : 'bé nhất'} là ${fs(...arr[idx])}.`, `The ${big ? 'largest' : 'smallest'} fraction is ${fs(...arr[idx])}.`));
        }),
      lesson(1, 4, L('Phân số thập phân', 'Decimal fractions'),
        L('Rô-bốt ISA đổi tiền lẻ thành những phần mười, phần trăm của một nghìn đồng.', 'ISA the robot changes small money into tenths and hundredths of a thousand dong.'),
        [
          { text: L('Các phân số có mẫu số là 10, 100, 1000, … gọi là phân số thập phân: 3/10, 47/100, 9/1000.', 'Fractions with the denominator 10, 100, 1000, … are called decimal fractions: 3/10, 47/100, 9/1000.'), visual: vz('decimalGrid', { value: 0.47 }) },
          { text: L('Một số phân số viết được thành phân số thập phân: 3/5 = (3 × 2)/(5 × 2) = 6/10; 7/25 = 28/100.', 'Some fractions can be written as decimal fractions: 3/5 = (3 × 2)/(5 × 2) = 6/10; 7/25 = 28/100.') },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const good = P(rng, [[R(rng, 1, 9), 10], [R(rng, 1, 99), 100], [R(rng, 1, 999), 1000]]); const bad = [[R(rng, 1, 9), 3], [R(rng, 1, 9), 20], [R(rng, 1, 9), 50], [R(rng, 1, 9), 11]]; return Q(L('Phân số nào là phân số thập phân?', 'Which fraction is a decimal fraction?'), null, ch(rng, fs(...good), U.sample(rng, bad, 3).map(x => fs(...x))), L('Phân số thập phân có mẫu số là 10, 100, 1000, …', 'A decimal fraction has the denominator 10, 100, 1000, …'), L(`${fs(...good)} có mẫu số ${good[1]}.`, `${fs(...good)} has the denominator ${good[1]}.`)); }
          const [d, to] = P(rng, [[2, 10], [5, 10], [4, 100], [20, 100], [25, 100], [50, 100], [8, 1000], [125, 1000], [250, 1000]]);
          let n = R(rng, 1, d - 1); const k = to / d;
          if (f === 1) return Q(L(`Viết phân số ${n}/${d} thành phân số thập phân:\n${n}/${d} = ?/${to}`, `Write ${n}/${d} as a decimal fraction:\n${n}/${d} = ?/${to}`), null, num(n * k), L(`Nhân cả tử và mẫu với ${k}.`, `Multiply both the numerator and the denominator by ${k}.`), `${n}/${d} = (${n} × ${k})/(${d} × ${k}) = ${n * k}/${to}.`);
          const m = R(rng, 1, 9) * k; const [sn, sd] = U.simplify(m, to);
          return Q(L(`Viết phân số ${m}/${to} dưới dạng phân số tối giản.`, `Write ${m}/${to} in its simplest form.`), null, fracA(sn, sd, true), L(`Chia cả tử và mẫu cho ${U.gcd(m, to)}.`, `Divide both the numerator and the denominator by ${U.gcd(m, to)}.`), `${m}/${to} = ${sn}/${sd}.`);
        }, [
          [0, 6, rng => {
            const [D, w] = P(rng, [[10, 'mười'], [100, 'trăm'], [1000, 'nghìn']]), n = R(rng, 1, D === 10 ? 9 : 99);
            // English: "seven tenths"; the last distractor is the "tens / tenths" mix-up.
            const say = Dd => `${RE(n)} ${{ 10: 'tenth', 100: 'hundredth', 1000: 'thousandth' }[Dd]}${n === 1 ? '' : 's'}`;
            if (EN) return Q(`How do you read the fraction ${n}/${D}?`, null, ch(rng, say(D), [10, 100, 1000].filter(x => x !== D).map(say).concat([`${RE(n)} ${{ 10: 'tens', 100: 'hundreds', 1000: 'thousands' }[D]}`])), 'Read the numerator first, then the denominator as "tenths", "hundredths" or "thousandths".', `${n}/${D} is read "${say(D)}".`);
            const others = [[10, 'mười'], [100, 'trăm'], [1000, 'nghìn']].filter(x => x[0] !== D).map(x => `${readVN(n)} phần ${x[1]}`); return Q(`Phân số ${n}/${D} đọc là:`, null, ch(rng, `${readVN(n)} phần ${w}`, others.concat([`${readVN(D)} phần ${readVN(n)}`])), 'Đọc tử số trước, rồi đọc "phần", rồi đọc mẫu số.', `${n}/${D} đọc là: ${readVN(n)} phần ${w}.`);
          }],
          [0, 9, rng => { const ok = R(rng, 0, 1) === 1, [n, d] = ok ? P(rng, [[R(rng, 1, 9), 10], [R(rng, 1, 99), 100], [R(rng, 1, 999), 1000]]) : P(rng, [[R(rng, 1, 9), 20], [R(rng, 1, 9), 50], [R(rng, 1, 9), 11], [R(rng, 1, 9), 101], [R(rng, 1, 9), 25]]); return Q(L(`Đúng hay sai?\nPhân số ${n}/${d} là phân số thập phân.`, `True or false?\nThe fraction ${n}/${d} is a decimal fraction.`), null, tf(rng, ok), L('Phân số thập phân có mẫu số là 10, 100, 1000, …', 'A decimal fraction has the denominator 10, 100, 1000, …'), ok ? L(`${n}/${d} có mẫu số ${d} nên là phân số thập phân. Đúng.`, `${n}/${d} has the denominator ${d}, so it is a decimal fraction. True.`) : L(`Mẫu số ${d} không phải 10, 100, 1000, … Sai.`, `The denominator ${d} is not 10, 100, 1000, … False.`)); }],
          [0, 9, rng => { let v = R(rng, 1, 99); while (v % 2 === 0 || v % 5 === 0) v++; return Q(L('Viết phân số thập phân chỉ phần đã tô màu của hình vuông (hình vuông được chia thành 100 ô bằng nhau).', 'Write the decimal fraction for the shaded part of the square (the square is divided into 100 equal small squares).'), vz('decimalGrid', { value: v / 100 }), fracA(v, 100), L('Đếm số ô được tô màu trong 100 ô.', 'Count the shaded squares out of 100.'), L(`Đã tô ${v} ô trong 100 ô: ${v}/100.`, `${v} of the 100 squares are shaded: ${v}/100.`)); }],
          [3, 9, rng => { const to = P(rng, [10, 100]), m = R(rng, 2, 5), n = R(rng, 1, to - 1) * m; return Q(L(`Viết phân số ${n}/${to * m} thành phân số thập phân:\n${n}/${to * m} = ?/${to}`, `Write ${n}/${to * m} as a decimal fraction:\n${n}/${to * m} = ?/${to}`), null, num(n / m), L(`Chia cả tử số và mẫu số cho ${m}.`, `Divide both the numerator and the denominator by ${m}.`), `${n}/${to * m} = (${n} : ${m})/(${to * m} : ${m}) = ${n / m}/${to}.`); }],
        ])),
      lesson(1, 5, L('Ôn tập các phép tính với phân số', 'Revising calculations with fractions'),
        L('Rô-bốt ISA tính phần đường mà đội công nhân đã sửa trong hai ngày.', 'ISA the robot works out how much of the road a team of workers mended in two days.'),
        [
          { text: L('Cộng, trừ phân số cùng mẫu số: cộng, trừ tử số, giữ nguyên mẫu số. 2/9 + 5/9 = 7/9.', 'Adding and subtracting fractions with the same denominator: add or subtract the numerators and keep the denominator. 2/9 + 5/9 = 7/9.') },
          { text: L('Nhân: tử nhân tử, mẫu nhân mẫu. Chia: nhân với phân số đảo ngược. 2/3 : 4/5 = 2/3 × 5/4 = 10/12 = 5/6.', 'Multiplying: numerator × numerator, denominator × denominator. Dividing: multiply by the second fraction turned upside down. 2/3 : 4/5 = 2/3 × 5/4 = 10/12 = 5/6.') },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0 || f === 1) { const r = addSubFrac(rng, f === 0 ? '+' : M, false); return Q(L(`Tính:\n${r.expr}`, `Calculate:\n${r.expr}`), vz('fractionCompare', { a: [r.a, r.c], b: [r.b, r.d] }), fracA(r.sn, r.sd), L('Cùng mẫu số: cộng (trừ) tử số, giữ nguyên mẫu số.', 'Same denominator: add (subtract) the numerators and keep the denominator.'), r.how); }
          const b = R(rng, 2, 9), a = R(rng, 1, b - 1), d = R(rng, 2, 9), c = R(rng, 1, d - 1);
          if (f === 2) { const [sn, sd] = U.simplify(a * c, b * d); return Q(L(`Tính:\n${a}/${b} × ${c}/${d}`, `Calculate:\n${a}/${b} × ${c}/${d}`), null, fracA(sn, sd), L('Tử nhân tử, mẫu nhân mẫu.', 'Numerator × numerator, denominator × denominator.'), `${a}/${b} × ${c}/${d} = ${a * c}/${b * d}${sn !== a * c ? ` = ${sn}/${sd}` : ''}.`); }
          const [sn, sd] = U.simplify(a * d, b * c);
          return Q(L(`Tính:\n${a}/${b} : ${c}/${d}`, `Calculate:\n${a}/${b} : ${c}/${d}`), null, fracA(sn, sd), L('Nhân với phân số đảo ngược của phân số thứ hai.', 'Multiply by the second fraction turned upside down.'), `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c} = ${a * d}/${b * c}${sn !== a * d ? ` = ${sn}/${sd}` : ''}.`);
        }),
      lesson(1, 6, L('Cộng, trừ hai phân số khác mẫu số', 'Adding and subtracting fractions with different denominators'),
        L('Rô-bốt ISA cùng bạn Hà tính phần vườn đã trồng rau và trồng hoa.', 'ISA the robot and Hà work out how much of the garden is planted with vegetables and flowers.'),
        [
          { text: L('Muốn cộng (trừ) hai phân số khác mẫu số, ta quy đồng mẫu số rồi cộng (trừ) hai phân số đã quy đồng. 1/2 + 1/3 = 3/6 + 2/6 = 5/6.', 'To add (subtract) two fractions with different denominators, first give them a common denominator, then add (subtract). 1/2 + 1/3 = 3/6 + 2/6 = 5/6.'), visual: vz('fractionCompare', { a: [1, 2], b: [1, 3] }) },
        ],
        function (rng, i) {
          const op = i % 2 === 0 ? '+' : M, r = addSubFrac(rng, op, true), f = i % 4;
          if (r.Rn === 0) return Q(L(`Tính:\n${r.expr}`, `Calculate:\n${r.expr}`), null, num(0), L('Hai phân số bằng nhau thì hiệu bằng 0.', 'When two fractions are equal, their difference is 0.'), `${r.expr} = 0.`);
          if (f === 2 || f === 3) {
            const who = nm(rng);
            const p = op === '+' ? L(`Vườn nhà ${who}: ${r.a}/${r.c} diện tích trồng rau, ${r.b}/${r.d} diện tích trồng hoa. Hỏi rau và hoa chiếm bao nhiêu phần diện tích vườn?`, `In ${who}'s garden, ${r.a}/${r.c} of the area has vegetables and ${r.b}/${r.d} has flowers. What fraction of the garden do vegetables and flowers take up altogether?`) : L(`${who} có ${r.a}/${r.c} lít sữa, ${who} đã uống ${r.b}/${r.d} lít. Hỏi còn lại bao nhiêu lít sữa?`, `${who} has ${r.a}/${r.c} of a litre of milk and drinks ${r.b}/${r.d} of a litre. How many litres of milk are left?`);
            return Q(p, vz('fractionCompare', { a: [r.a, r.c], b: [r.b, r.d] }), fracA(r.sn, r.sd), L(`Quy đồng mẫu số (mẫu số chung ${r.L}).`, `Give them a common denominator (${r.L}).`), r.how);
          }
          return Q(L(`Tính:\n${r.expr}`, `Calculate:\n${r.expr}`), vz('fractionCompare', { a: [r.a, r.c], b: [r.b, r.d] }), fracA(r.sn, r.sd), L(`Quy đồng mẫu số, mẫu số chung là ${r.L}.`, `Give them a common denominator: ${r.L}.`), r.how);
        }),
      lesson(1, 7, L('Hỗn số', 'Mixed numbers'),
        L('Rô-bốt ISA đếm những chiếc bánh pizza: hai cái nguyên và ba phần tư cái nữa.', 'ISA the robot counts pizzas: two whole ones and three quarters of another one.'),
        [
          { text: L('Có 2 cái bánh và 3/4 cái bánh: viết gọn là 2 3/4 (hai và ba phần tư). 2 là phần nguyên, 3/4 là phần phân số.', 'There are 2 pizzas and 3/4 of a pizza: we write 2 3/4 (two and three quarters). 2 is the whole-number part and 3/4 is the fraction part.'), visual: fv(3, 4, 'pie') },
          { text: L('Chuyển hỗn số thành phân số: 2 3/4 = (2 × 4 + 3)/4 = 11/4.', 'Changing a mixed number into a fraction: 2 3/4 = (2 × 4 + 3)/4 = 11/4.') },
        ],
        function (rng, i) {
          const d = R(rng, 2, 9), n = R(rng, 1, d - 1), w = R(rng, 1, lv(i) === 0 ? 3 : 9), N = w * d + n, f = i % 4;
          if (f === 0) return Q(L(`Chuyển hỗn số ${w} ${n}/${d} thành phân số.`, `Change the mixed number ${w} ${n}/${d} into a fraction.`), fv(n, d, 'pie'), fracA(N, d), L('Tử số = phần nguyên × mẫu số + tử số của phần phân số; mẫu số giữ nguyên.', 'Numerator = whole-number part × denominator + numerator of the fraction part; the denominator stays the same.'), `${w} ${n}/${d} = (${w} × ${d} + ${n})/${d} = ${N}/${d}.`);
          if (f === 1) return Q(L(`Viết phân số ${N}/${d} thành hỗn số:`, `Write ${N}/${d} as a mixed number:`), null, ch(rng, mixed(N, d), [`${w + 1} ${n}/${d}`, `${w} ${d}/${n}`, `${n} ${w}/${d}`, `${w} ${n + 1 < d ? n + 1 : n - 1 || 1}/${d}`].filter(x => x !== mixed(N, d))), L(`Lấy ${N} : ${d} được thương là phần nguyên, số dư là tử số.`, `Work out ${N} : ${d}. The quotient is the whole-number part and the remainder is the numerator.`), L(`${N} : ${d} = ${w} (dư ${n}), nên ${N}/${d} = ${w} ${n}/${d}.`, `${N} : ${d} = ${w} (remainder ${n}), so ${N}/${d} = ${w} ${n}/${d}.`));
          if (f === 2) return Q(L(`Hỗn số ${w} ${n}/${d} có phần nguyên là bao nhiêu?`, `What is the whole-number part of the mixed number ${w} ${n}/${d}?`), fv(n, d, 'pie'), num(w), L('Phần nguyên viết trước, phần phân số viết sau.', 'The whole-number part is written first, then the fraction part.'), L(`Phần nguyên là ${w}, phần phân số là ${n}/${d}.`, `The whole-number part is ${w} and the fraction part is ${n}/${d}.`));
          const d2 = d, n2 = R(rng, 1, d - 1), w2 = R(rng, 1, 9);
          return Q(L(`So sánh: ${w} ${n}/${d} … ${w2} ${n2}/${d2}`, `Compare: ${w} ${n}/${d} … ${w2} ${n2}/${d2}`), null, cmpAns(w + n / d, w2 + n2 / d2), L('So sánh phần nguyên trước; bằng nhau thì so sánh phần phân số.', 'Compare the whole-number parts first; if they are equal, compare the fraction parts.'), `${w} ${n}/${d} ${sign(w + n / d, w2 + n2 / d2)} ${w2} ${n2}/${d2}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 2. SỐ THẬP PHÂN ============
  const c2 = {
    id: 'g5-c2', semester: 1, title: L('Số thập phân', 'Decimals'), icon: '🔟', lessons: [
      lesson(2, 10, L('Khái niệm số thập phân', 'What is a decimal?'),
        L('Rô-bốt ISA đo chiều cao của bạn Nam bằng thước mét: 1 m và 35 cm, tức là 1,35 m.', 'ISA the robot measures Nam\'s height with a metre stick: 1 m and 35 cm, which is 1,35 m.'),
        [
          { text: L('1/10 = 0,1; 1/100 = 0,01; 1/1000 = 0,001. Tô 37 ô trong 100 ô là 37/100 = 0,37.', '1/10 = 0,1; 1/100 = 0,01; 1/1000 = 0,001. Shading 37 of the 100 squares gives 37/100 = 0,37.'), visual: vz('decimalGrid', { value: 0.37 }) },
          { text: L('Số 3,25 có phần nguyên là 3 và phần thập phân là 25; đọc là "ba phẩy hai mươi lăm".', 'The number 3,25 has the whole-number part 3 and the decimal part 25. It is read "three point two five".'), visual: vz('placeValue', { number: 3.25, columns: L(['Đơn vị', 'Phần mười', 'Phần trăm'], ['Ones', 'Tenths', 'Hundredths']) }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) { const h = R(rng, 1, 99); return Q(L('Phần đã tô màu của hình vuông được viết thành số thập phân nào?', 'Which decimal shows the shaded part of the square?'), vz('decimalGrid', { value: dec(h, 2) }), num(dec(h, 2)), L('Hình vuông có 100 ô; đếm số ô tô màu rồi viết thành phần trăm.', 'The square has 100 small squares. Count the shaded ones and write them as hundredths.'), `${h}/100 = ${F(dec(h, 2))}.`); }
          if (f === 1) { const h = R(rng, 1, 99); return Q(L(`Em hãy tô màu ${F(dec(h, 2))} hình vuông (chạm vào các ô).`, `Shade ${F(dec(h, 2))} of the square (tap the small squares).`), vz('decimalGrid', { value: 0 }), { kind: 'visual', check: v => v === h }, L(`${F(dec(h, 2))} = ${h}/100: tô ${h} ô.`, `${F(dec(h, 2))} = ${h}/100: shade ${h} squares.`), `${F(dec(h, 2))} = ${h}/100.`); }
          if (f === 2) { const [m, s] = P(rng, [[R(rng, 1, 9), 1], [R(rng, 1, 99), 2], [R(rng, 1, 999), 3]]); const den = Math.pow(10, s); return Q(L(`Viết phân số thập phân ${m}/${den} thành số thập phân.`, `Write the decimal fraction ${m}/${den} as a decimal.`), s === 2 ? vz('decimalGrid', { value: dec(m, 2) }) : null, num(dec(m, s)), L(`Mẫu số ${den} có ${s} chữ số 0 thì phần thập phân có ${s} chữ số.`, `The denominator ${den} has ${pl(s, 'zero')}, so the decimal has ${pl(s, 'decimal place')}.`), `${m}/${den} = ${F(dec(m, s))}.`); }
          if (f === 3) { let m4 = R(rng, 101, 99999); if (m4 % 10 === 0) m4++; const x = dec(m4, R(rng, 1, 3)); return Q(L(`Số ${F(x)} đọc là:`, `How do you read ${F(x)}?`), null, ch(rng, readD(x), [readD(rd(x * 10)), readD(rd(x + 1)), readD(rd(x / 10))]), L('Đọc phần nguyên, đọc "phẩy", rồi đọc phần thập phân.', 'Read the whole-number part, say "point", then say the digits after the comma one by one.'), L(`${F(x)} đọc là "${readDec(x)}".`, `${F(x)} is read "${RE(x)}".`)); }
          let m5 = R(rng, 1001, 99999); if (m5 % 10 === 0) m5++; const x = dec(m5, R(rng, 1, 3)), ip = Math.floor(x), t = R(rng, 0, 1);
          const dp = F(x).split(',')[1], rev = dp.split('').reverse().join('');
          // Distractors are clearly different numbers (never dp + '0', which names the same decimal part).
          return Q(L(`Số ${F(x)} có ${t ? 'phần nguyên' : 'phần thập phân'} là:`, `What is the ${t ? 'whole-number part' : 'decimal part'} of ${F(x)}?`), null, ch(rng, t ? String(ip) : dp, t ? [dp, String(ip + 1), F(x), String(ip - 1)] : [String(ip), rev, String(ip) + dp, String(Number(dp) + 1)]), L('Phần nguyên ở bên trái dấu phẩy, phần thập phân ở bên phải.', 'The whole-number part is to the left of the comma; the decimal part is to the right.'), L(`${F(x)}: phần nguyên ${ip}, phần thập phân ${dp}.`, `${F(x)}: whole-number part ${ip}, decimal part ${dp}.`));
        }),
      lesson(2, 11, L('So sánh các số thập phân', 'Comparing decimals'),
        L('Rô-bốt ISA so sánh chiều cao của các bạn trong đội bóng rổ của lớp.', 'ISA the robot compares the heights of the players in the class basketball team.'),
        [
          { text: L('So sánh phần nguyên trước: 4,5 > 3,98 vì 4 > 3.', 'Compare the whole-number parts first: 4,5 > 3,98 because 4 > 3.'), visual: vz('compare', { left: '4,5', right: '3,98' }) },
          { text: L('Phần nguyên bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm, …: 2,47 < 2,5 vì 4 < 5 (hàng phần mười). Thêm chữ số 0 vào bên phải phần thập phân thì giá trị không đổi: 2,5 = 2,50.', 'If the whole-number parts are equal, compare the tenths, then the hundredths, …: 2,47 < 2,5 because 4 < 5 (in the tenths place). Adding zeros to the right of the decimal part does not change the value: 2,5 = 2,50.') },
        ],
        function (rng, i) {
          const f = i % 3, lev = lv(i);
          if (f === 0) {
            const ip = R(rng, 0, 20), s1 = R(rng, 1, 3), s2 = R(rng, 1, 3);
            const a = rd(ip + dec(R(rng, 1, Math.pow(10, s1) - 1), s1));
            let b = lev === 0 ? rd(R(rng, 0, 20) + dec(R(rng, 1, 9), 1)) : rd(ip + dec(R(rng, 1, Math.pow(10, s2) - 1), s2));
            if (R(rng, 0, 6) === 0) b = a;
            const left = F(a), right = R(rng, 0, 1) && b === a && s1 < 3 ? F(a) + '0' : F(b);
            return Q(L(`So sánh: ${left} … ${right}`, `Compare: ${left} … ${right}`), vz('compare', { left, right }), cmpAns(a, b), L('So sánh phần nguyên, rồi lần lượt từng hàng của phần thập phân.', 'Compare the whole-number parts, then each decimal place in turn.'), `${left} ${sign(a, b)} ${right}.`);
          }
          const ip = R(rng, 0, 9), arr = [];
          while (arr.length < 4) { const s = R(rng, 1, 3), x = rd(ip + R(rng, 0, 1) + dec(R(rng, 1, Math.pow(10, s) - 1), s)); if (!arr.includes(x)) arr.push(x); }
          const asc = arr.slice().sort((x, y) => x - y), S = a => a.map(F).join('; ');
          if (f === 1) { const big = R(rng, 0, 1), v = big ? asc[3] : asc[0]; return Q(L(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${S(arr)} là:`, `The ${big ? 'largest' : 'smallest'} of the numbers ${S(arr)} is:`), null, ch(rng, F(v), arr.map(F)), L('So sánh phần nguyên trước, rồi phần mười, phần trăm…', 'Compare the whole-number parts first, then the tenths, the hundredths…'), L(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${F(v)}.`, `The ${big ? 'largest' : 'smallest'} number is ${F(v)}.`)); }
          return Q(L(`Sắp xếp các số ${S(arr)} theo thứ tự từ bé đến lớn:`, `Put the numbers ${S(arr)} in order from smallest to largest:`), null, ch(rng, S(asc), [S(asc.slice().reverse()), S(arr), S([asc[1], asc[0], asc[2], asc[3]])]), L('Tìm số bé nhất trước.', 'Find the smallest number first.'), `${S(asc)}.`);
        }),
      lesson(2, 12, L('Viết số đo đại lượng dưới dạng số thập phân', 'Writing measurements as decimals'),
        L('Rô-bốt ISA giúp bạn Phúc ghi cân nặng các bao hàng bằng số thập phân.', 'ISA the robot helps Phúc write the weights of the sacks of goods as decimals.'),
        [
          { text: '3 m 25 cm = 3 25/100 m = 3,25 m.', visual: vz('ruler', { length: 3.25, unit: 'dm', object: 'ribbon' }) },
          { text: '2 kg 50 g = 2 50/1000 kg = 2,05 kg; 1234 m = 1,234 km.' },
        ],
        function (rng, i) {
          const t = R(rng, 0, 5);
          let p, v, u;
          if (t === 0) { const a = R(rng, 1, 9), b = R(rng, 1, 99); p = `${a} m ${b} cm = ? m`; v = rd(a + dec(b, 2)); u = 'm'; }
          else if (t === 1) { const a = R(rng, 1, 9), b = R(rng, 1, 999); p = `${a} kg ${b} g = ? kg`; v = rd(a + dec(b, 3)); u = 'kg'; }
          else if (t === 2) { const a = R(rng, 1, 99999); p = `${F(a)} m = ? km`; v = dec(a, 3); u = 'km'; }
          else if (t === 3) { const a = R(rng, 1, 9), b = R(rng, 1, 999); p = L(`${a} tấn ${b} kg = ? tấn`, `${a} t ${b} kg = ? t`); v = rd(a + dec(b, 3)); u = L('tấn', 't'); }
          else if (t === 4) { const a = R(rng, 1, 99); p = `${a} cm = ? m`; v = dec(a, 2); u = 'm'; }
          else { const a = R(rng, 1, 9), b = R(rng, 1, 9); p = `${a} dm ${b} cm = ? dm`; v = rd(a + dec(b, 1)); u = 'dm'; }
          if (i % 3 === 2) return Q(p.replace('= ?', '= …') + L('\nChọn số thích hợp:', '\nChoose the right number:'), null, ch(rng, F(v), [rd(v * 10), rd(v / 10), rd(v + 1)].map(x => F(x))), L('Viết phần lẻ thành phân số thập phân rồi chuyển thành số thập phân.', 'Write the smaller part as a decimal fraction, then as a decimal.'), `${p.replace('?', F(v))}.`);
          return Q(p, null, num(v, u), L('Đổi đơn vị nhỏ ra phân số thập phân của đơn vị lớn (1 cm = 1/100 m, 1 g = 1/1000 kg, …).', 'Change the smaller unit into a decimal fraction of the bigger unit (1 cm = 1/100 m, 1 g = 1/1000 kg, 1 kg = 1/1000 t, …).'), `${p.replace('?', F(v))}.`);
        }),
      lesson(2, 13, L('Làm tròn số thập phân', 'Rounding decimals'),
        L('Rô-bốt ISA làm tròn số tiền để ước lượng nhanh khi đi siêu thị cùng mẹ bạn Vy.', 'ISA the robot rounds prices to estimate quickly at the supermarket with Vy\'s mum.'),
        [
          { text: L('Làm tròn 3,47 đến hàng phần mười: chữ số hàng phần trăm là 7 (≥ 5) nên làm tròn lên: 3,5.', 'Round 3,47 to the nearest tenth: the hundredths digit is 7 (≥ 5), so round up: 3,5.'), visual: vz('numberLine', { min: 3.4, max: 3.5, step: 0.01, labelEvery: 10, point: 3.47 }) },
          { text: L('Làm tròn 12,34 đến số tự nhiên gần nhất: chữ số hàng phần mười là 3 (< 5) nên được 12.', 'Round 12,34 to the nearest whole number: the tenths digit is 3 (< 5), so you get 12.') },
        ],
        function (rng, i) {
          const s = 3, m = R(rng, 1001, 99999), x = dec(m, s);
          const W0 = L('số tự nhiên gần nhất', 'the nearest whole number');
          const [k, name] = P(rng, lv(i) === 0 ? [[0, W0]] : [[0, W0], [1, L('hàng phần mười', 'the nearest tenth')], [2, L('hàng phần trăm', 'the nearest hundredth')]]);
          const p = Math.pow(10, s - k), r = dec(Math.round(m / p) * p, s);
          if (i % 2 === 0) return Q(L(`Làm tròn số ${F(x)} đến ${name}.`, `Round ${F(x)} to ${name}.`), null, num(r), L('Xét chữ số ngay bên phải hàng cần làm tròn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.', 'Look at the digit just to the right of the place you are rounding to: less than 5, round down; 5 or more, round up.'), `${F(x)} ≈ ${F(r)}.`);
          const lo = dec(Math.floor(m / p) * p, s), hi = rd(lo + Math.pow(10, -k));
          return Q(L(`Làm tròn số ${F(x)} đến ${name} ta được:`, `Round ${F(x)} to ${name}. You get:`), null, ch(rng, F(r), [r === lo ? hi : lo, rd(x), dec(Math.floor(m / (p * 10)) * p * 10, s)].map(y => F(y))), L('Xét chữ số ngay bên phải hàng làm tròn.', 'Look at the digit just to the right of the place you are rounding to.'), `${F(x)} ≈ ${F(r)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. MỘT SỐ ĐƠN VỊ ĐO DIỆN TÍCH ============
  const AU = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'];
  const c3 = {
    id: 'g5-c3', semester: 1, title: L('Một số đơn vị đo diện tích', 'Some units of area'), icon: '🗺️', lessons: [
      lesson(3, 15, L('Ki-lô-mét vuông. Héc-ta', 'Square kilometres. Hectares'),
        L('Rô-bốt ISA cùng bạn Quân tìm hiểu diện tích Vịnh Hạ Long trên bản đồ.', 'ISA the robot and Quân find out the area of Hạ Long Bay on a map.'),
        [
          { text: L('Ki-lô-mét vuông (km²) là diện tích hình vuông cạnh 1 km. 1 km² = 1 000 000 m².', 'A square kilometre (km²) is the area of a square with sides of 1 km. 1 km² = 1 000 000 m².') },
          { text: L('Héc-ta (ha) là diện tích hình vuông cạnh 100 m. 1 ha = 10 000 m²; 1 km² = 100 ha.', 'A hectare (ha) is the area of a square with sides of 100 m. 1 ha = 10 000 m²; 1 km² = 100 ha.'), visual: vz('shape', { kind: 'square', dims: { a: 100 }, showDims: true, label: '1 ha' }) },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), f = i % 4;
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} km² = ? ha`, a * 100, 'ha'], [`${a} ha = ? m²`, a * 10000, 'm²'], [`${a * 100} ha = ? km²`, a, 'km²'], [`${a} km² = ? m²`, a * 1000000, 'm²']]); return Q(p, null, num(v, u), '1 km² = 100 ha; 1 ha = 10 000 m².', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const h = R(rng, 1, 9); return Q(`${h * 1000} m² = ? ha`, null, num(dec(h, 1), 'ha'), '1 ha = 10 000 m².', `${F(h * 1000)} m² = ${F(dec(h, 1))} ha.`); }
          if (f === 2) { const [p, u] = P(rng, [[L('Diện tích nước Việt Nam khoảng 331 000 …', 'The area of Viet Nam is about 331 000 …'), 'km²'], [L('Diện tích một khu vườn trường khoảng 2 …', 'The area of a school garden is about 2 …'), 'ha'], [L('Diện tích một phòng học khoảng 48 …', 'The area of a classroom is about 48 …'), 'm²'], [L('Diện tích Hồ Gươm khoảng 12 …', 'The area of Hoan Kiem Lake (Hồ Gươm) is about 12 …'), 'ha']]); return Q(L(`Chọn đơn vị thích hợp:\n${p}`, `Choose the right unit:\n${p}`), null, ch(rng, u, ['km²', 'ha', 'm²', 'cm²'].filter(x => x !== u)), L('Hình dung độ lớn thật của diện tích.', 'Imagine how big the area really is.'), `${p.replace('…', u)}.`); }
          const w = R(rng, 2, 5) * 100, hgt = R(rng, 1, w / 100 - 1) * 100; // width < length: a real rectangle
          return Q(L(`Một khu rừng hình chữ nhật dài ${w} m, rộng ${hgt} m. Diện tích khu rừng là bao nhiêu héc-ta?`, `A rectangular forest is ${w} m long and ${hgt} m wide. What is its area in hectares?`), vz('shape', { kind: 'rect', dims: { a: w, b: hgt }, showDims: true }), num(w * hgt / 10000, 'ha'), L('Tính diện tích theo m² rồi đổi ra ha (1 ha = 10 000 m²).', 'Work out the area in m², then change it to ha (1 ha = 10 000 m²).'), `${w} × ${hgt} = ${F(w * hgt)} (m²) = ${F(w * hgt / 10000)} ha.`);
        }),
      lesson(3, 16, L('Các đơn vị đo diện tích', 'Units of area'),
        L('Rô-bốt ISA xếp các đơn vị đo diện tích thành bậc thang, mỗi bậc gấp 100 lần.', 'ISA the robot lines up the units of area like a staircase: each step is 100 times bigger.'),
        [
          { text: L('km² – hm² (ha) – dam² – m² – dm² – cm² – mm². Hai đơn vị liền nhau gấp (kém) nhau 100 lần.', 'km² – hm² (ha) – dam² – m² – dm² – cm² – mm². Each unit is 100 times the next smaller unit.') },
          { text: L('Ví dụ: 3 m² 5 dm² = 305 dm²; 350 dm² = 3,5 m².', 'For example: 3 m² 5 dm² = 305 dm²; 350 dm² = 3,5 m².') },
        ],
        function (rng, i) {
          const j = R(rng, 1, 6), a = R(rng, 2, 99), f = i % 3;
          if (f === 0) return Q(`${a} ${AU[j - 1]} = ? ${AU[j]}`, null, num(a * 100, AU[j]), L('Đổi sang đơn vị bé liền kề: nhân với 100.', 'To change to the next smaller unit, multiply by 100.'), `${a} ${AU[j - 1]} = ${F(a * 100)} ${AU[j]}.`);
          if (f === 1) { const m = R(rng, 101, 9999); return Q(`${F(m)} ${AU[j]} = ? ${AU[j - 1]}`, null, num(dec(m, 2), AU[j - 1]), L('Đổi sang đơn vị lớn liền kề: chia cho 100.', 'To change to the next bigger unit, divide by 100.'), `${F(m)} ${AU[j]} = ${F(dec(m, 2))} ${AU[j - 1]}.`); }
          const b = R(rng, 1, 99);
          return Q(`${a} ${AU[j - 1]} ${b} ${AU[j]} = ? ${AU[j]}`, null, num(a * 100 + b, AU[j]), `1 ${AU[j - 1]} = 100 ${AU[j]}.`, `${a} ${AU[j - 1]} ${b} ${AU[j]} = ${a * 100} + ${b} = ${F(a * 100 + b)} ${AU[j]}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. CÁC PHÉP TÍNH VỚI SỐ THẬP PHÂN ============
  const rDec = (rng, lo, hi, s) => dec(R(rng, lo, hi), s);
  const c4 = {
    id: 'g5-c4', semester: 1, title: L('Các phép tính với số thập phân', 'Calculating with decimals'), icon: '🧮', lessons: [
      lesson(4, 19, L('Phép cộng số thập phân', 'Adding decimals'),
        L('Rô-bốt ISA cộng cân nặng hai giỏ cam bạn Ngọc hái trong vườn.', 'ISA the robot adds the weights of two baskets of oranges that Ngọc picked in the garden.'),
        [{ text: L('3,45 + 12,7: đặt dấu phẩy thẳng cột, cộng như số tự nhiên, rồi đặt dấu phẩy ở tổng: 16,15.', '3,45 + 12,7: line up the decimal commas, add as with whole numbers, then put the comma in the sum: 16,15.'), visual: vz('columnCalc', { a: 3.45, b: 12.7, op: '+', reveal: 'all' }) }],
        colGen('+', (r, lev) => [rDec(r, 11, lev === 0 ? 999 : 99999, 1 + (lev > 0 ? R(r, 0, 1) : 0)), rDec(r, 11, 9999, R(r, 1, 2))], { unit: 'kg' })),
      lesson(4, 20, L('Phép trừ số thập phân', 'Subtracting decimals'),
        L('Rô-bốt ISA tính phần nước còn lại trong bể sau khi tưới rau cùng bạn Dũng.', 'ISA the robot works out how much water is left in the tank after watering the vegetables with Dũng.'),
        [{ text: L('15,4 − 3,75: viết 15,4 thành 15,40 rồi trừ như số tự nhiên: 11,65.', '15,4 − 3,75: write 15,4 as 15,40, then subtract as with whole numbers: 11,65.'), visual: vz('columnCalc', { a: 15.4, b: 3.75, op: M, reveal: 'all' }) }],
        colGen(M, (r, lev) => { const a = rDec(r, 1001, lev === 0 ? 9999 : 99999, 2), b = rDec(r, 11, Math.floor(a * 10) - 1, R(r, 1, 2) === 1 ? 1 : 2); return [a, b < a ? b : rd(a / 2)]; }, { unit: 'l' })),
      lesson(4, 21, L('Phép nhân số thập phân', 'Multiplying decimals'),
        L('Rô-bốt ISA tính tiền mua vải may áo dài cho cô giáo dịp 20 tháng 11.', 'ISA the robot works out the cost of cloth for an áo dài for the teacher on 20 November, Teachers\' Day.'),
        [
          { text: L('2,35 × 4: nhân như 235 × 4 = 940, phần thập phân của 2,35 có 2 chữ số nên tích là 9,40 = 9,4.', '2,35 × 4: multiply 235 × 4 = 940. 2,35 has 2 decimal places, so the product is 9,40 = 9,4.'), visual: vz('columnCalc', { a: 2.35, b: 4, op: '×', reveal: 'all' }) },
          { text: L('1,2 × 0,5: 12 × 5 = 60; hai thừa số có tất cả 2 chữ số ở phần thập phân, nên tích là 0,60 = 0,6.', '1,2 × 0,5: 12 × 5 = 60. The two factors have 2 decimal places altogether, so the product is 0,60 = 0,6.') },
        ],
        colGen('×', (r, lev) => lev === 0 ? [rDec(r, 11, 999, R(r, 1, 2)), R(r, 2, 9)] : lev === 1 ? [rDec(r, 11, 999, R(r, 1, 2)), R(r, 11, 49)] : [rDec(r, 11, 99, 1), rDec(r, 2, 99, 1)], { unit: 'l' })),
      lesson(4, 22, L('Phép chia số thập phân', 'Dividing decimals'),
        L('Rô-bốt ISA chia đều dầu ăn vào các chai nhỏ để tặng các gia đình khó khăn.', 'ISA the robot shares cooking oil equally into small bottles to give to families in need.'),
        [
          { text: L('Chia số thập phân cho số tự nhiên: 8,4 : 4 = 2,1 (chia như số tự nhiên, đánh dấu phẩy ở thương khi chia xong phần nguyên).', 'Dividing a decimal by a whole number: 8,4 : 4 = 2,1 (divide as with whole numbers, and put the comma in the quotient when you finish the whole-number part).'), visual: vz('columnCalc', { a: 8.4, b: 4, op: ':', reveal: 'all' }) },
          { text: L('Chia cho số thập phân: 2,52 : 1,2 — chuyển dấu phẩy của cả hai số sang phải một chữ số: 25,2 : 12 = 2,1.', 'Dividing by a decimal: 2,52 : 1,2 — move the comma in both numbers one place to the right: 25,2 : 12 = 2,1.') },
        ],
        colGen(':', (r, lev) => {
          if (lev === 0) { const b = R(r, 2, 9), q = rDec(r, 11, 999, R(r, 1, 2)); return [rd(q * b), b]; }
          if (lev === 1) { const b = P(r, [2, 4, 5, 8, 20, 25]), a = R(r, 1, 99); return a % b === 0 ? [a + 1, b] : [a, b]; }
          const b = rDec(r, 2, 99, 1), q = rDec(r, 11, 99, 1); return [rd(q * b), b];
        }, { unit: 'l' })),
      lesson(4, 23, L('Nhân, chia số thập phân với 10; 100; 1000; ... hoặc với 0,1; 0,01; 0,001; ...', 'Multiplying and dividing decimals by 10; 100; 1000; ... or by 0,1; 0,01; 0,001; ...'),
        L('Rô-bốt ISA đổi đơn vị đo thật nhanh bằng cách dời dấu phẩy.', 'ISA the robot changes units very quickly by moving the decimal comma.'),
        [
          { text: L('Nhân với 10; 100; 1000: chuyển dấu phẩy sang phải 1, 2, 3 chữ số. 3,456 × 100 = 345,6.', 'Multiplying by 10; 100; 1000: move the comma 1, 2, 3 places to the right. 3,456 × 100 = 345,6.') },
          { text: L('Chia cho 10; 100; 1000 (hoặc nhân với 0,1; 0,01; 0,001): chuyển dấu phẩy sang trái 1, 2, 3 chữ số. 34,5 : 100 = 0,345; 34,5 × 0,1 = 3,45.', 'Dividing by 10; 100; 1000 (or multiplying by 0,1; 0,01; 0,001): move the comma 1, 2, 3 places to the left. 34,5 : 100 = 0,345; 34,5 × 0,1 = 3,45.') },
        ],
        function (rng, i) {
          const x = rDec(rng, 11, 99999, R(rng, 1, 3)), k = R(rng, 1, 3), p = Math.pow(10, k), t = R(rng, 0, 3);
          const toR = L(`sang phải ${k}`, `${pl(k, 'place')} to the right`), toL = L(`sang trái ${k}`, `${pl(k, 'place')} to the left`);
          const [opS, val, mv] = [[`× ${F(p)}`, rd(x * p), toR], [`: ${F(p)}`, rd(x / p), toL], [`× ${F(dec(1, k))}`, rd(x / p), toL], [`: ${F(dec(1, k))}`, rd(x * p), toR]][t];
          if (i % 3 === 2) return Q(`${F(x)} ${opS} = ?`, null, ch(rng, F(val), [rd(val * 10), rd(val / 10), t % 3 === 0 ? rd(x / p) : rd(x * p)].map(y => F(y))), L(`Chuyển dấu phẩy ${mv} chữ số.`, `Move the decimal comma ${mv}.`), `${F(x)} ${opS} = ${F(val)}.`);
          return Q(L(`Tính nhẩm:\n${F(x)} ${opS}`, `Mental maths:\n${F(x)} ${opS}`), null, num(val), L(`Chuyển dấu phẩy ${mv} chữ số (thêm chữ số 0 nếu thiếu).`, `Move the decimal comma ${mv} (add zeros if you need to).`), `${F(x)} ${opS} = ${F(val)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 5. MỘT SỐ HÌNH PHẲNG ============
  const c5 = {
    id: 'g5-c5', semester: 1, title: L('Một số hình phẳng', 'Some 2D shapes'), icon: '📐', lessons: [
      lesson(5, 25, L('Hình tam giác. Diện tích hình tam giác', 'Triangles. Area of a triangle'),
        L('Rô-bốt ISA tính diện tích lá cờ đuôi nheo hình tam giác cho hội thi của trường.', 'ISA the robot works out the area of a triangular pennant for the school competition.'),
        [
          { text: L('Diện tích hình tam giác bằng độ dài đáy nhân với chiều cao (cùng đơn vị đo) rồi chia cho 2: S = a × h : 2.', 'The area of a triangle is the base times the height (in the same unit), divided by 2: S = a × h : 2.'), visual: vz('shape', { kind: 'triangle', dims: { a: 8, h: 5 }, showDims: true, showHeight: true }) },
          { text: L('Tam giác có ba góc nhọn là tam giác nhọn; có một góc vuông là tam giác vuông; có một góc tù là tam giác tù.', 'A triangle with three acute angles is an acute-angled triangle; one with a right angle is a right-angled triangle; one with an obtuse angle is an obtuse-angled triangle.') },
        ],
        function (rng, i) {
          const a = R(rng, 3, lv(i) === 0 ? 12 : 40), h = R(rng, 2, lv(i) === 0 ? 10 : 30), S = rd(a * h / 2), f = i % 4;
          if (f === 0 || f === 1) return Q(L(`Tính diện tích hình tam giác có độ dài đáy ${a} cm và chiều cao ${h} cm.`, `Find the area of a triangle with a base of ${a} cm and a height of ${h} cm.`), vz('shape', { kind: 'triangle', dims: { a, h }, showDims: true, showHeight: true }), num(S, 'cm²'), L('S = đáy × chiều cao : 2.', 'S = base × height : 2.'), `${a} × ${h} : 2 = ${F(S)} (cm²).`);
          if (f === 2) { const a2 = R(rng, 2, 20), h2 = R(rng, 1, 9), a3 = rd(a2 + 0.5); return Q(L(`Hình tam giác có đáy ${F(a3)} m, chiều cao ${h2} m. Tính diện tích.`, `A triangle has a base of ${F(a3)} m and a height of ${h2} m. Find its area.`), vz('shape', { kind: 'triangle', dims: { a: a3, h: h2 }, showDims: true, showHeight: true }), num(rd(a3 * h2 / 2), 'm²'), L('S = đáy × chiều cao : 2.', 'S = base × height : 2.'), `${F(a3)} × ${h2} : 2 = ${F(rd(a3 * h2 / 2))} (m²).`); }
          const RT = L('vuông', 'right-angled'), OB = L('tù', 'obtuse-angled'), AC = L('nhọn', 'acute-angled');
          const [p, c] = P(rng, [[L('Hình tam giác có một góc vuông gọi là hình tam giác …', 'A triangle with one right angle is called … triangle.'), RT], [L('Hình tam giác có một góc tù gọi là hình tam giác …', 'A triangle with one obtuse angle is called … triangle.'), OB], [L('Hình tam giác có ba góc nhọn gọi là hình tam giác …', 'A triangle with three acute angles is called … triangle.'), AC]]);
          // English: "an acute-angled triangle", "a right-angled triangle" — the article goes with the option.
          const art = x => (EN ? (/^[aeiou]/.test(x) ? 'an ' : 'a ') + x : x);
          return Q(p, null, ch(rng, art(c), [RT, OB, AC, L('đều', 'equilateral')].filter(x => x !== c).map(art)), L('Dựa vào góc lớn nhất của tam giác.', 'Look at the largest angle of the triangle.'), `${p.replace('…', art(c)).replace(/\.$/, '')}.`);
        }),
      lesson(5, 26, L('Hình thang. Diện tích hình thang', 'Trapeziums. Area of a trapezium'),
        L('Rô-bốt ISA đo thửa ruộng hình thang của bác nông dân bạn Thảo.', 'ISA the robot measures the trapezium-shaped rice field of Thảo\'s uncle, who is a farmer.'),
        [
          { text: L('Hình thang có một cặp cạnh đối diện song song (hai đáy). Diện tích hình thang bằng tổng độ dài hai đáy nhân với chiều cao rồi chia cho 2: S = (a + b) × h : 2.', 'A trapezium has one pair of parallel opposite sides (the two bases). The area of a trapezium is the sum of the two bases times the height, divided by 2: S = (a + b) × h : 2.'), visual: vz('shape', { kind: 'trapezoid', dims: { a: 9, b: 5, h: 4 }, showDims: true, showHeight: true }) },
          { text: L('Hình thang có một cạnh bên vuông góc với hai đáy gọi là hình thang vuông.', 'A trapezium with one side perpendicular to the two bases is called a right trapezium.') },
        ],
        more(function (rng, i) {
          const b = R(rng, 2, lv(i) === 0 ? 10 : 40), a = b + R(rng, 1, 15), h = R(rng, 2, lv(i) === 0 ? 10 : 30), S = rd((a + b) * h / 2), f = i % 3;
          if (f === 0) return Q(L(`Tính diện tích hình thang có đáy lớn ${a} cm, đáy bé ${b} cm, chiều cao ${h} cm.`, `Find the area of a trapezium with a longer base of ${a} cm, a shorter base of ${b} cm and a height of ${h} cm.`), vz('shape', { kind: 'trapezoid', dims: { a, b, h }, showDims: true, showHeight: true }), num(S, 'cm²'), L('S = (đáy lớn + đáy bé) × chiều cao : 2.', 'S = (longer base + shorter base) × height : 2.'), `(${a} + ${b}) × ${h} : 2 = ${F(S)} (cm²).`);
          if (f === 1) { const A = a * 10, B = b * 10, H = h * 5; const SS = (A + B) * H / 2; return Q(L(`Một thửa ruộng hình thang có đáy lớn ${A} m, đáy bé ${B} m, chiều cao ${H} m. Tính diện tích thửa ruộng.`, `A rice field is a trapezium with a longer base of ${A} m, a shorter base of ${B} m and a height of ${H} m. Find the area of the field.`), vz('shape', { kind: 'trapezoid', dims: { a: A, b: B, h: H }, showDims: true, showHeight: true }), num(SS, 'm²'), 'S = (a + b) × h : 2.', `(${A} + ${B}) × ${H} : 2 = ${F(SS)} (m²).`); }
          return Q(L('Hình thang có mấy cặp cạnh đối diện song song?', 'How many pairs of parallel opposite sides does a trapezium have?'), vz('shape', { kind: 'trapezoid' }), num(1), L('Hai đáy của hình thang song song với nhau.', 'The two bases of a trapezium are parallel.'), L('Hình thang có 1 cặp cạnh đối diện song song (hai đáy).', 'A trapezium has 1 pair of parallel opposite sides (the two bases).'));
        }, [
          [0, 9, (rng, i) => { const b = R(rng, 2, 10), a = b + R(rng, 1, 8), h = R(rng, 2, 10), S = rd((a + b) * h / 2), cl = P(rng, [S, S, (a + b) * h, rd(a * b / 2)]); return Q(L(`Đúng hay sai?\nHình thang có đáy lớn ${a} cm, đáy bé ${b} cm, chiều cao ${h} cm thì có diện tích là ${F(cl)} cm².`, `True or false?\nA trapezium with a longer base of ${a} cm, a shorter base of ${b} cm and a height of ${h} cm has an area of ${F(cl)} cm².`), vz('shape', { kind: 'trapezoid', dims: { a, b, h }, showDims: true, showHeight: true }), tf(rng, cl === S), L('S = (đáy lớn + đáy bé) × chiều cao : 2.', 'S = (longer base + shorter base) × height : 2.'), `(${a} + ${b}) × ${h} : 2 = ${F(S)} (cm²). ${cl === S ? YES : NO}.`); }],
          [0, 3, () => Q(L('Hình thang vuông có mấy góc vuông?', 'How many right angles does a right trapezium have?'), null, num(2), L('Hình thang vuông có một cạnh bên vuông góc với hai đáy.', 'A right trapezium has one side perpendicular to both bases.'), L('Cạnh bên vuông góc với cả hai đáy nên hình thang vuông có 2 góc vuông.', 'That side is perpendicular to both bases, so a right trapezium has 2 right angles.'))],
          [3, 9, rng => { const a = dec(R(rng, 30, 90), 1), b = dec(R(rng, 10, 29), 1), h = R(rng, 2, 9), S = rd((a + b) * h / 2); return Q(L(`Tính diện tích hình thang có đáy lớn ${F(a)} m, đáy bé ${F(b)} m, chiều cao ${h} m.`, `Find the area of a trapezium with a longer base of ${F(a)} m, a shorter base of ${F(b)} m and a height of ${h} m.`), vz('shape', { kind: 'trapezoid', dims: { a, b, h, unit: 'm' }, showDims: true, showHeight: true }), num(S, 'm²'), 'S = (a + b) × h : 2.', `(${F(a)} + ${F(b)}) × ${h} : 2 = ${F(rd(a + b))} × ${h} : 2 = ${F(S)} (m²).`); }],
          [6, 9, rng => { const b = R(rng, 4, 20), a = b + R(rng, 2, 12), h = 2 * R(rng, 2, 10), S = (a + b) * h / 2; return Q(L(`Một hình thang có diện tích ${S} cm², đáy lớn ${a} cm, đáy bé ${b} cm. Tính chiều cao của hình thang.`, `A trapezium has an area of ${S} cm², a longer base of ${a} cm and a shorter base of ${b} cm. Find its height.`), vz('shape', { kind: 'trapezoid', dims: { a, b, h: '?' }, showDims: true, showHeight: true }), num(h, 'cm'), L('Chiều cao = diện tích × 2 : (đáy lớn + đáy bé).', 'Height = area × 2 : (longer base + shorter base).'), `${S} × 2 : (${a} + ${b}) = ${S * 2} : ${a + b} = ${h} (cm).`); }],
          [7, 9, rng => { const b = R(rng, 4, 20), a = b + R(rng, 2, 12), h = 2 * R(rng, 2, 10), S = (a + b) * h / 2; return Q(L(`Một hình thang có diện tích ${S} m², chiều cao ${h} m, đáy lớn ${a} m. Tính đáy bé.`, `A trapezium has an area of ${S} m², a height of ${h} m and a longer base of ${a} m. Find the shorter base.`), vz('shape', { kind: 'trapezoid', dims: { a, b: '?', h }, showDims: true, showHeight: true }), num(b, 'm'), L('Tổng hai đáy = diện tích × 2 : chiều cao; rồi trừ đi đáy lớn.', 'Sum of the two bases = area × 2 : height. Then subtract the longer base.'), L(`Tổng hai đáy: ${S} × 2 : ${h} = ${a + b} (m). Đáy bé: ${a + b} ${M} ${a} = ${b} (m).`, `Sum of the two bases: ${S} × 2 : ${h} = ${a + b} (m). Shorter base: ${a + b} ${M} ${a} = ${b} (m).`)); }],
        ])),
      lesson(5, 27, L('Đường tròn. Chu vi và diện tích hình tròn', 'Circles. Circumference and area of a circle'),
        L('Rô-bốt ISA đo chiếc mâm tròn ngày Tết để may khăn trải bàn cùng bạn An.', 'ISA the robot and An measure the round Tết tray to make a tablecloth for it.'),
        [
          { text: L('Chu vi hình tròn: C = d × 3,14 hoặc C = r × 2 × 3,14.', 'Circumference of a circle: C = d × 3,14 or C = r × 2 × 3,14.'), visual: vz('shape', { kind: 'circle', dims: { r: 5 }, showDims: true }) },
          { text: L('Diện tích hình tròn: S = r × r × 3,14. Bán kính 5 cm: S = 5 × 5 × 3,14 = 78,5 (cm²).', 'Area of a circle: S = r × r × 3,14. With a radius of 5 cm: S = 5 × 5 × 3,14 = 78,5 (cm²).') },
        ],
        function (rng, i) {
          const r = R(rng, 1, lv(i) === 0 ? 10 : 30), f = i % 4;
          const C = rd(r * 628 / 100), S = rd(r * r * 314 / 100);
          if (f === 0) return Q(L(`Tính chu vi hình tròn có bán kính ${r} cm.`, `Find the circumference of a circle with a radius of ${r} cm.`), vz('shape', { kind: 'circle', dims: { r }, showDims: true }), num(C, 'cm'), 'C = r × 2 × 3,14.', `${r} × 2 × 3,14 = ${F(C)} (cm).`);
          if (f === 1) return Q(L(`Tính diện tích hình tròn có bán kính ${r} cm.`, `Find the area of a circle with a radius of ${r} cm.`), vz('shape', { kind: 'circle', dims: { r }, showDims: true }), num(S, 'cm²'), 'S = r × r × 3,14.', `${r} × ${r} × 3,14 = ${F(S)} (cm²).`);
          if (f === 2) { const d = r * 2; return Q(L(`Tính chu vi hình tròn có đường kính ${d} dm.`, `Find the circumference of a circle with a diameter of ${d} dm.`), vz('shape', { kind: 'circle', dims: { r } }), num(rd(d * 314 / 100), 'dm'), 'C = d × 3,14.', `${d} × 3,14 = ${F(rd(d * 314 / 100))} (dm).`); }
          const d = r * 2;
          return Q(L(`Một bánh xe có đường kính ${d} cm. Tính diện tích mặt bánh xe (hình tròn).`, `A wheel has a diameter of ${d} cm. Find the area of the face of the wheel (a circle).`), vz('shape', { kind: 'circle', dims: { r } }), num(S, 'cm²'), L('Tìm bán kính trước: r = d : 2.', 'Find the radius first: r = d : 2.'), `r = ${d} : 2 = ${r} (cm); S = ${r} × ${r} × 3,14 = ${F(S)} (cm²).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 7. TỈ SỐ VÀ CÁC BÀI TOÁN LIÊN QUAN ============
  // With N = 100, p% of N equals p, so the p% picture would show the answer: step past 100.
  const no100 = (N, step) => (N === 100 ? N + step : N);
  const SMALL = L('Số bé', 'Smaller'), BIG = L('Số lớn', 'Larger');
  const c7 = {
    id: 'g5-c7', semester: 2, title: L('Tỉ số và các bài toán liên quan', 'Ratios and related problems'), icon: '➗', lessons: [
      lesson(7, 36, L('Tỉ số. Tỉ số phần trăm', 'Ratios. Percentages'),
        L('Rô-bốt ISA cùng lớp 5A đếm số bạn nam và bạn nữ để chia đội văn nghệ.', 'ISA the robot and class 5A count the boys and the girls to make teams for the school show.'),
        [
          { text: L('Lớp có 12 bạn nam và 15 bạn nữ. Tỉ số của số bạn nam và số bạn nữ là 12 : 15 hay 12/15 = 4/5.', 'A class has 12 boys and 15 girls. The ratio of the number of boys to the number of girls is 12 : 15, or 12/15 = 4/5.') },
          { text: L('Tỉ số phần trăm: 25/100 viết là 25%. Hình vuông 100 ô tô màu 25 ô là 25%.', 'Percentages: 25/100 is written 25%. A square of 100 small squares with 25 shaded shows 25%.'), visual: vz('percent', { percent: 25 }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 2, 20), b = R(rng, 2, 20); const [sn, sd] = U.simplify(a, b); return Q(L(`Tỉ số của ${a} và ${b} viết dưới dạng phân số là:`, `Write the ratio of ${a} to ${b} as a fraction:`), null, fracA(a, b), L(`Tỉ số của a và b là a : b hay a/b.`, 'The ratio of a to b is a : b, or a/b.'), `${a} : ${b} = ${a}/${b}${sn !== a ? ` = ${sn}/${sd}` : ''}.`); }
          if (f === 1) { const p = R(rng, 1, 99); return Q(L('Phần tô màu chiếm bao nhiêu phần trăm hình vuông?', 'What percentage of the square is shaded?'), vz('percent', { percent: p }), num(p, '%'), L('Hình vuông có 100 ô; tô bao nhiêu ô là bấy nhiêu phần trăm.', 'The square has 100 small squares: the number of shaded squares is the percentage.'), `${p}/100 = ${p}%.`); }
          if (f === 2) { const [n, d] = P(rng, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 10], [7, 20], [9, 25], [1, 10], [3, 50]]); return Q(L(`Viết phân số ${n}/${d} dưới dạng tỉ số phần trăm.`, `Write ${n}/${d} as a percentage.`), d <= 24 ? fv(n, d) : null, num(n * 100 / d, '%'), L(`Viết thành phân số có mẫu số 100.`, 'Write it as a fraction with the denominator 100.'), `${n}/${d} = ${n * 100 / d}/100 = ${n * 100 / d}%.`); }
          const boys = R(rng, 10, 20), girls = R(rng, 10, 20), [sn, sd] = U.simplify(girls, boys);
          return Q(L(`Lớp 5B có ${boys} bạn nam và ${girls} bạn nữ. Tỉ số của số bạn nữ và số bạn nam là:`, `Class 5B has ${boys} boys and ${girls} girls. The ratio of the number of girls to the number of boys is:`), null, fracA(girls, boys), L('Số bạn nữ viết trước (tử số), số bạn nam viết sau (mẫu số).', 'The number of girls comes first (numerator), the number of boys second (denominator).'), `${girls} : ${boys} = ${girls}/${boys}${sn !== girls ? ` = ${sn}/${sd}` : ''}.`);
        }),
      lesson(7, 37, L('Tỉ lệ bản đồ và ứng dụng', 'Map scales and how to use them'),
        L('Rô-bốt ISA đo trên bản đồ để tính quãng đường thật từ nhà bạn Hùng đến trường.', 'ISA the robot measures on a map to work out the real distance from Hùng\'s house to school.'),
        [
          { text: L('Tỉ lệ bản đồ 1 : 1000 nghĩa là 1 cm trên bản đồ ứng với 1000 cm (= 10 m) trên thực tế.', 'A map scale of 1 : 1000 means that 1 cm on the map stands for 1000 cm (= 10 m) in real life.'), visual: vz('mapScale', { scale: 1000, mapCm: 5 }) },
          { text: L('Độ dài thật = độ dài trên bản đồ × số lần (mẫu số của tỉ lệ). 5 cm × 1000 = 5000 cm = 50 m.', 'Real length = length on the map × the scale number (the second number of the scale). 5 cm × 1000 = 5000 cm = 50 m.') },
        ],
        more(function (rng, i) {
          const sc = P(rng, lv(i) === 0 ? [100, 500, 1000, 2000] : [1000, 5000, 10000, 100000, 500000, 1000000]), cm = R(rng, 2, 15), real = cm * sc, f = i % 3;
          const km = sc >= 100000;
          const val = km ? rd(real / 100000) : rd(real / 100), u = km ? 'km' : 'm';
          if (f === 0 || f === 1) return Q(L(`Trên bản đồ tỉ lệ 1 : ${F(sc)}, quãng đường đo được ${cm} cm. Quãng đường thật dài bao nhiêu ${km ? 'ki-lô-mét' : 'mét'}?`, `On a map with a scale of 1 : ${F(sc)}, a road measures ${cm} cm. How many ${km ? 'kilometres' : 'metres'} long is the real road?`), vz('mapScale', { scale: sc, mapCm: cm }), num(val, u), L(`Lấy ${cm} × ${F(sc)} (cm) rồi đổi ra ${u}.`, `Work out ${cm} × ${F(sc)} (cm), then change it to ${u}.`), `${cm} × ${F(sc)} = ${F(real)} (cm) = ${F(val)} ${u}.`);
          const realM = R(rng, 2, 20) * 10, sc2 = P(rng, [500, 1000, 2000]); const mapC = realM * 100 / sc2;
          return Q(L(`Một sân trường dài ${realM} m. Trên bản đồ tỉ lệ 1 : ${F(sc2)}, chiều dài đó là bao nhiêu xăng-ti-mét?`, `A school yard is ${realM} m long. How many centimetres long is it on a map with a scale of 1 : ${F(sc2)}?`), null, num(rd(mapC), 'cm'), L('Đổi độ dài thật ra xăng-ti-mét rồi chia cho số lần.', 'Change the real length to centimetres, then divide by the scale number.'), `${realM} m = ${F(realM * 100)} cm; ${F(realM * 100)} : ${F(sc2)} = ${F(rd(mapC))} (cm).`);
        }, [
          [0, 6, rng => { const sc = P(rng, [100, 200, 500, 1000, 2000, 5000, 10000]); return Q(L(`Trên bản đồ tỉ lệ 1 : ${F(sc)}, độ dài 1 cm ứng với độ dài thật là bao nhiêu mét?`, `On a map with a scale of 1 : ${F(sc)}, how many metres in real life does 1 cm stand for?`), vz('mapScale', { scale: sc, mapCm: 1 }), num(sc / 100, 'm'), L(`1 cm trên bản đồ ứng với ${F(sc)} cm trên thực tế.`, `1 cm on the map stands for ${F(sc)} cm in real life.`), `${F(sc)} cm = ${F(sc / 100)} m.`); }],
          [0, 9, rng => { const sc = P(rng, [500, 1000, 2000, 5000]), cm = R(rng, 2, 12), real = cm * sc / 100, cl = P(rng, [real, real, real * 10, cm * sc]); return Q(L(`Đúng hay sai?\nTrên bản đồ tỉ lệ 1 : ${F(sc)}, độ dài ${cm} cm ứng với độ dài thật ${F(cl)} m.`, `True or false?\nOn a map with a scale of 1 : ${F(sc)}, ${cm} cm stands for a real length of ${F(cl)} m.`), vz('mapScale', { scale: sc, mapCm: cm }), tf(rng, cl === real), L('Độ dài thật (cm) = độ dài trên bản đồ × số lần; rồi đổi ra mét.', 'Real length (cm) = length on the map × the scale number. Then change it to metres.'), `${cm} × ${F(sc)} = ${F(cm * sc)} (cm) = ${F(real)} m. ${cl === real ? YES : NO}.`); }],
          [3, 9, rng => { const sc = P(rng, [10000, 20000, 50000, 100000, 500000]), cm = R(rng, 2, 10), km = rd(cm * sc / 100000); const opts = [sc, sc * 10, sc / 10].map(x => `1 : ${F(x)}`); return Q(L(`Quãng đường thật dài ${F(km)} km được vẽ trên bản đồ dài ${cm} cm. Bản đồ đó có tỉ lệ là:`, `A real road ${F(km)} km long is drawn ${cm} cm long on a map. The scale of the map is:`), null, ch(rng, opts[0], opts.slice(1).concat([`1 : ${F(cm)}`])), L('Đổi độ dài thật ra xăng-ti-mét rồi chia cho độ dài trên bản đồ.', 'Change the real length to centimetres, then divide by the length on the map.'), L(`${F(km)} km = ${F(cm * sc)} cm; ${F(cm * sc)} : ${cm} = ${F(sc)}. Tỉ lệ 1 : ${F(sc)}.`, `${F(km)} km = ${F(cm * sc)} cm; ${F(cm * sc)} : ${cm} = ${F(sc)}. The scale is 1 : ${F(sc)}.`)); }],
          [6, 9, rng => { const a = R(rng, 3, 9), b = R(rng, 2, a - 1), sc = P(rng, [500, 1000, 2000]), A = a * sc / 100, B = b * sc / 100; return Q(L(`Trên bản đồ tỉ lệ 1 : ${F(sc)}, một mảnh đất hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính chu vi thật của mảnh đất (theo mét).`, `On a map with a scale of 1 : ${F(sc)}, a rectangular plot of land is ${a} cm long and ${b} cm wide. Find the real perimeter of the plot (in metres).`), vz('mapScale', { scale: sc, mapCm: a }), num((A + B) * 2, 'm'), L('Tính chiều dài, chiều rộng thật trước rồi tính chu vi.', 'Work out the real length and width first, then the perimeter.'), L(`Dài: ${a} × ${F(sc)} = ${F(a * sc)} cm = ${F(A)} m; rộng: ${F(B)} m. Chu vi: (${F(A)} + ${F(B)}) × 2 = ${F((A + B) * 2)} (m).`, `Length: ${a} × ${F(sc)} = ${F(a * sc)} cm = ${F(A)} m; width: ${F(B)} m. Perimeter: (${F(A)} + ${F(B)}) × 2 = ${F((A + B) * 2)} (m).`)); }],
        ])),
      lesson(7, 38, L('Tìm hai số khi biết tổng và tỉ số của hai số đó', 'Finding two numbers from their sum and ratio'),
        L('Rô-bốt ISA giúp hai bạn chia số sách theo tỉ số để mang tặng thư viện.', 'ISA the robot helps two friends share out books in a given ratio to give to the library.'),
        [
          { text: L('Tổng hai số là 35, tỉ số là 2/3. Vẽ sơ đồ: số bé 2 phần, số lớn 3 phần. Tổng số phần: 2 + 3 = 5. Giá trị một phần: 35 : 5 = 7.', 'The sum of two numbers is 35 and their ratio is 2/3. Draw a bar model: the smaller number is 2 parts and the larger number is 3 parts. Total parts: 2 + 3 = 5. One part: 35 : 5 = 7.'), visual: vz('tape', { bars: [{ label: SMALL, parts: 2, units: 2, value: '?' }, { label: BIG, parts: 3, units: 3, value: '?' }], total: '35' }) },
          { text: L('Số bé: 7 × 2 = 14. Số lớn: 35 − 14 = 21.', 'Smaller number: 7 × 2 = 14. Larger number: 35 − 14 = 21.') },
        ],
        function (rng, i) {
          let m = R(rng, 1, 5), n = R(rng, m + 1, 9); const g = U.gcd(m, n); m /= g; n /= g;
          const u = R(rng, 2, lv(i) === 0 ? 10 : 50), S = (m + n) * u, f = i % 4;
          const tape = (l1, l2, tot) => vz('tape', { bars: [{ label: l1, parts: m, units: m, value: '?' }, { label: l2, parts: n, units: n, value: '?' }], total: tot });
          const totP = L(`Tổng số phần bằng nhau: ${m} + ${n} = ${m + n} (phần).`, `Total number of equal parts: ${m} + ${n} = ${m + n} (${m + n === 1 ? 'part' : 'parts'}).`), oneP = L('Giá trị một phần', 'One part');
          if (f === 0) return Q(L(`Tổng của hai số là ${S}. Tỉ số của hai số là ${m}/${n}. Tìm số bé.`, `The sum of two numbers is ${S}. The ratio of the two numbers is ${m}/${n}. Find the smaller number.`), tape(SMALL, BIG, String(S)), num(m * u), L(`Tổng số phần bằng nhau: ${m} + ${n} = ${m + n}.`, `Total number of equal parts: ${m} + ${n} = ${m + n}.`), L(`${totP} ${oneP}: ${S} : ${m + n} = ${u}. Số bé: ${u} × ${m} = ${m * u}.`, `${totP} ${oneP}: ${S} : ${m + n} = ${u}. Smaller number: ${u} × ${m} = ${m * u}.`));
          if (f === 1) return Q(L(`Tổng của hai số là ${S}. Số bé bằng ${m}/${n} số lớn. Tìm số lớn.`, `The sum of two numbers is ${S}. The smaller number is ${m}/${n} of the larger number. Find the larger number.`), tape(SMALL, BIG, String(S)), num(n * u), L(`Tổng số phần: ${m + n}.`, `Total number of parts: ${m + n}.`), L(`${totP} ${oneP}: ${S} : ${m + n} = ${u}. Số lớn: ${u} × ${n} = ${n * u}.`, `${totP} ${oneP}: ${S} : ${m + n} = ${u}. Larger number: ${u} × ${n} = ${n * u}.`));
          if (f === 2) { const [x, y] = two(rng); return Q(L(`${x} và ${y} có tất cả ${S} viên bi. Số bi của ${x} bằng ${m}/${n} số bi của ${y}. Hỏi ${x} có bao nhiêu viên bi?`, `${x} and ${y} have ${S} marbles altogether. ${x}'s marbles are ${m}/${n} of ${y}'s marbles. How many marbles does ${x} have?`), tape(x, y, S + L(' viên', ' marbles')), num(m * u), L(`Vẽ sơ đồ: ${x} ${m} phần, ${y} ${n} phần.`, `Draw a bar model: ${x} ${pl(m, 'part')}, ${y} ${pl(n, 'part')}.`), L(`${totP} ${oneP}: ${S} : ${m + n} = ${u} (viên bi). Số bi của ${x}: ${u} × ${m} = ${m * u} (viên bi).`, `${totP} ${oneP}: ${S} : ${m + n} = ${u} (marbles). ${x}'s marbles: ${u} × ${m} = ${m * u} (marbles).`)); }
          const P2 = 2 * S; return Q(L(`Một mảnh vườn hình chữ nhật có chu vi ${P2} m, chiều rộng bằng ${m}/${n} chiều dài. Tính chiều dài mảnh vườn.`, `A rectangular garden has a perimeter of ${P2} m. Its width is ${m}/${n} of its length. Find the length of the garden.`), tape(L('Chiều rộng', 'Width'), L('Chiều dài', 'Length'), S + ' m'), num(n * u, 'm'), L(`Nửa chu vi là tổng chiều dài và chiều rộng: ${P2} : 2 = ${S} (m).`, `Half the perimeter is the length plus the width: ${P2} : 2 = ${S} (m).`), L(`Nửa chu vi: ${P2} : 2 = ${S} (m). ${totP} ${oneP}: ${S} : ${m + n} = ${u} (m). Chiều dài: ${u} × ${n} = ${n * u} (m).`, `Half the perimeter: ${P2} : 2 = ${S} (m). ${totP} ${oneP}: ${S} : ${m + n} = ${u} (m). Length: ${u} × ${n} = ${n * u} (m).`));
        }),
      lesson(7, 39, L('Tìm hai số khi biết hiệu và tỉ số của hai số đó', 'Finding two numbers from their difference and ratio'),
        L('Rô-bốt ISA tìm tuổi mẹ và tuổi con qua một bài toán đố vui.', 'ISA the robot works out the ages of a mother and her child from a fun puzzle.'),
        [
          { text: L('Hiệu hai số là 24, tỉ số là 3/5. Số bé 3 phần, số lớn 5 phần. Hiệu số phần: 5 − 3 = 2. Một phần: 24 : 2 = 12.', 'The difference between two numbers is 24 and their ratio is 3/5. The smaller number is 3 parts and the larger number is 5 parts. Difference in parts: 5 − 3 = 2. One part: 24 : 2 = 12.'), visual: vz('tape', { bars: [{ label: SMALL, parts: 3, units: 3, value: '?' }, { label: BIG, parts: 5, units: 5, value: '?' }], diff: '24' }) },
          { text: L('Số bé: 12 × 3 = 36. Số lớn: 36 + 24 = 60.', 'Smaller number: 12 × 3 = 36. Larger number: 36 + 24 = 60.') },
        ],
        more(function (rng, i) {
          let m = R(rng, 1, 6), n = R(rng, m + 1, 9); const g = U.gcd(m, n); m /= g; n /= g;
          const u = R(rng, 2, lv(i) === 0 ? 10 : 40), D = (n - m) * u, f = i % 3;
          const tape = (l1, l2, d) => vz('tape', { bars: [{ label: l1, parts: m, units: m, value: '?' }, { label: l2, parts: n, units: n, value: '?' }], diff: d });
          // Explanations always show every step: hiệu số phần → giá trị một phần → each number.
          const diffP = (big, small) => L(`Hiệu số phần bằng nhau: ${big} ${M} ${small} = ${big - small} (phần).`, `Difference in equal parts: ${big} ${M} ${small} = ${big - small} (${big - small === 1 ? 'part' : 'parts'}).`);
          if (f === 0) return Q(L(`Hiệu của hai số là ${D}. Tỉ số của hai số là ${m}/${n}. Tìm số lớn.`, `The difference between two numbers is ${D}. The ratio of the two numbers is ${m}/${n}. Find the larger number.`), tape(SMALL, BIG, String(D)), num(n * u), L(`Hiệu số phần bằng nhau: ${n} ${M} ${m} = ${n - m}.`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m}.`), L(`${diffP(n, m)} Giá trị một phần: ${D} : ${n - m} = ${u}. Số lớn: ${u} × ${n} = ${n * u}.`, `${diffP(n, m)} One part: ${D} : ${n - m} = ${u}. Larger number: ${u} × ${n} = ${n * u}.`));
          if (f === 1) return Q(L(`Hiệu của hai số là ${D}. Số bé bằng ${m}/${n} số lớn. Tìm số bé.`, `The difference between two numbers is ${D}. The smaller number is ${m}/${n} of the larger number. Find the smaller number.`), tape(SMALL, BIG, String(D)), num(m * u), L(`Hiệu số phần: ${n} ${M} ${m} = ${n - m}.`, `Difference in parts: ${n} ${M} ${m} = ${n - m}.`), L(`${diffP(n, m)} Giá trị một phần: ${D} : ${n - m} = ${u}. Số bé: ${u} × ${m} = ${m * u}.`, `${diffP(n, m)} One part: ${D} : ${n - m} = ${u}. Smaller number: ${u} × ${m} = ${m * u}.`));
          const k = R(rng, 3, 7), c = R(rng, 5, 10), mom = c * k, d = mom - c;
          return Q(L(`Mẹ hơn con ${d} tuổi. Tuổi con bằng 1/${k} tuổi mẹ. Tính tuổi con.`, `Mum is ${d} years older than her child. The child's age is 1/${k} of Mum's age. How old is the child?`), vz('tape', { bars: [{ label: L('Con', 'Child'), parts: 1, units: 1, value: '?' }, { label: L('Mẹ', 'Mum'), parts: k, units: k, value: '?' }], diff: d + L(' tuổi', ' years') }), num(c, L('tuổi', 'years old')), L(`Hiệu số phần: ${k} ${M} 1 = ${k - 1}.`, `Difference in parts: ${k} ${M} 1 = ${k - 1}.`), L(`Tuổi con 1 phần, tuổi mẹ ${k} phần. ${diffP(k, 1)} Giá trị một phần (tuổi con): ${d} : ${k - 1} = ${c} (tuổi). Tuổi mẹ: ${c} × ${k} = ${mom} (tuổi).`, `The child's age is 1 part and Mum's age is ${k} parts. ${diffP(k, 1)} One part (the child's age): ${d} : ${k - 1} = ${c} (years). Mum's age: ${c} × ${k} = ${mom} (years).`));
        }, [
          [0, 6, rng => { let m = R(rng, 1, 6), n = R(rng, m + 1, 9); const g = U.gcd(m, n); m /= g; n /= g; const D = (n - m) * R(rng, 2, 20); return Q(L(`Hiệu của hai số là ${D}, tỉ số của hai số là ${m}/${n}. Hiệu số phần bằng nhau là bao nhiêu?`, `The difference between two numbers is ${D} and their ratio is ${m}/${n}. What is the difference in equal parts?`), vz('tape', { bars: [{ label: SMALL, parts: m, units: m, value: '?' }, { label: BIG, parts: n, units: n, value: '?' }], diff: String(D) }), num(n - m), L('Số bé có ' + m + ' phần, số lớn có ' + n + ' phần.', `The smaller number has ${pl(m, 'part')} and the larger number has ${pl(n, 'part')}.`), L(`Số bé ${m} phần, số lớn ${n} phần. Hiệu số phần bằng nhau: ${n} ${M} ${m} = ${n - m} (phần).`, `The smaller number is ${pl(m, 'part')} and the larger number is ${pl(n, 'part')}. Difference in equal parts: ${n} ${M} ${m} = ${n - m} (${n - m === 1 ? 'part' : 'parts'}).`)); }],
          [0, 9, (rng, i) => { const k = R(rng, 2, 9), u = R(rng, 3, lv(i) === 0 ? 15 : 60), D = (k - 1) * u, big = R(rng, 0, 1) === 1; return Q(L(`Hiệu của hai số là ${D}. Số lớn gấp ${k} lần số bé. Tìm số ${big ? 'lớn' : 'bé'}.`, `The difference between two numbers is ${D}. The larger number is ${k} times the smaller number. Find the ${big ? 'larger' : 'smaller'} number.`), vz('tape', { bars: [{ label: SMALL, parts: 1, units: 1, value: '?' }, { label: BIG, parts: k, units: k, value: '?' }], diff: String(D) }), num(big ? k * u : u), L(`Số bé 1 phần, số lớn ${k} phần; hiệu số phần: ${k} ${M} 1 = ${k - 1}.`, `The smaller number is 1 part and the larger number is ${k} parts; difference in parts: ${k} ${M} 1 = ${k - 1}.`), L(`Số bé 1 phần, số lớn ${k} phần. Hiệu số phần bằng nhau: ${k} ${M} 1 = ${k - 1} (phần). Giá trị một phần (số bé): ${D} : ${k - 1} = ${u}. Số lớn: ${u} × ${k} = ${k * u}.`, `The smaller number is 1 part and the larger number is ${k} parts. Difference in equal parts: ${k} ${M} 1 = ${k - 1} (${k - 1 === 1 ? 'part' : 'parts'}). One part (the smaller number): ${D} : ${k - 1} = ${u}. Larger number: ${u} × ${k} = ${k * u}.`)); }],
          [3, 9, (rng, i) => {
            let m = R(rng, 1, 6), n = R(rng, m + 1, 9); const g = U.gcd(m, n); m /= g; n /= g; const u = R(rng, 2, lv(i) === 1 ? 12 : 40), D = (n - m) * u;
            // [text, answer, answer unit, tape label small, tape label big, answer name, parts of the answer, unit in explanation]
            const [tx, ans, unit, l1, l2, who, parts, eu] = P(rng, [
              [L(`Số học sinh nam ít hơn số học sinh nữ ${D} bạn. Số học sinh nam bằng ${m}/${n} số học sinh nữ. Hỏi có bao nhiêu học sinh nam?`, `There are ${D} fewer boys than girls. The number of boys is ${m}/${n} of the number of girls. How many boys are there?`), m * u, '', L('Nam', 'Boys'), L('Nữ', 'Girls'), L('Số học sinh nam', 'Number of boys'), m, L('bạn', 'pupils')],
              [L(`Cửa hàng có số gạo tẻ nhiều hơn gạo nếp ${D} kg. Số gạo nếp bằng ${m}/${n} số gạo tẻ. Hỏi cửa hàng có bao nhiêu ki-lô-gam gạo tẻ?`, `A shop has ${D} kg more plain rice than sticky rice. The sticky rice is ${m}/${n} of the plain rice. How many kilograms of plain rice does the shop have?`), n * u, 'kg', L('Nếp', 'Sticky'), L('Tẻ', 'Plain'), L('Số gạo tẻ', 'Plain rice'), n, 'kg'],
              [L(`Một thửa ruộng hình chữ nhật có chiều dài hơn chiều rộng ${D} m, chiều rộng bằng ${m}/${n} chiều dài. Tính chiều dài thửa ruộng.`, `A rectangular rice field is ${D} m longer than it is wide. Its width is ${m}/${n} of its length. Find the length of the field.`), n * u, 'm', L('Rộng', 'Width'), L('Dài', 'Length'), L('Chiều dài', 'Length'), n, 'm']]);
            return Q(tx, vz('tape', { bars: [{ label: l1, parts: m, units: m, value: '?' }, { label: l2, parts: n, units: n, value: '?' }], diff: String(D) }), unit ? num(ans, unit) : num(ans), L(`Hiệu số phần bằng nhau: ${n} ${M} ${m} = ${n - m}.`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m}.`), L(`Hiệu số phần bằng nhau: ${n} ${M} ${m} = ${n - m} (phần). Giá trị một phần: ${D} : ${n - m} = ${u} (${eu}). ${who}: ${u} × ${parts} = ${ans} (${eu}).`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m} (${n - m === 1 ? 'part' : 'parts'}). One part: ${D} : ${n - m} = ${u} (${eu}). ${who}: ${u} × ${parts} = ${ans} (${eu}).`));
          }],
          [3, 9, rng => { let m = R(rng, 1, 6), n = R(rng, m + 1, 9); const g = U.gcd(m, n); m /= g; n /= g; const u = R(rng, 2, 25), D = (n - m) * u, AND = L('và', 'and'); return Q(L(`Hiệu của hai số là ${D}, tỉ số của hai số là ${m}/${n}. Hai số đó là:`, `The difference between two numbers is ${D} and their ratio is ${m}/${n}. The two numbers are:`), null, ch(rng, `${m * u} ${AND} ${n * u}`, [`${m * (u + 1)} ${AND} ${n * (u + 1)}`, `${m * u} ${AND} ${m * u + D + u}`, `${u} ${AND} ${u + D}`, `${m * u + D} ${AND} ${n * u + D}`]), L('Tìm giá trị một phần, rồi tìm từng số.', 'Find one part, then each number.'), L(`Hiệu số phần bằng nhau: ${n} ${M} ${m} = ${n - m} (phần). Giá trị một phần: ${D} : ${n - m} = ${u}. Số bé: ${u} × ${m} = ${m * u}. Số lớn: ${u} × ${n} = ${n * u}.`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m} (${n - m === 1 ? 'part' : 'parts'}). One part: ${D} : ${n - m} = ${u}. Smaller number: ${u} × ${m} = ${m * u}. Larger number: ${u} × ${n} = ${n * u}.`)); }],
          [7, 9, rng => { let m = R(rng, 1, 4), n = R(rng, m + 1, 6); const g = U.gcd(m, n); m /= g; n /= g; const u = R(rng, 2, 10), D = (n - m) * u; return Q(L(`Một mảnh vườn hình chữ nhật có chiều dài hơn chiều rộng ${D} m, chiều rộng bằng ${m}/${n} chiều dài. Tính diện tích mảnh vườn.`, `A rectangular garden is ${D} m longer than it is wide. Its width is ${m}/${n} of its length. Find the area of the garden.`), vz('tape', { bars: [{ label: L('Rộng', 'Width'), parts: m, units: m, value: '?' }, { label: L('Dài', 'Length'), parts: n, units: n, value: '?' }], diff: D + ' m' }), num(m * u * n * u, 'm²'), L('Tìm chiều dài, chiều rộng (bài toán hiệu – tỉ), rồi tính diện tích.', 'Find the length and the width (a difference and ratio problem), then work out the area.'), L(`Hiệu số phần bằng nhau: ${n} ${M} ${m} = ${n - m} (phần). Giá trị một phần: ${D} : ${n - m} = ${u} (m). Chiều rộng: ${u} × ${m} = ${m * u} (m). Chiều dài: ${u} × ${n} = ${n * u} (m). Diện tích: ${n * u} × ${m * u} = ${F(m * u * n * u)} (m²).`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m} (${n - m === 1 ? 'part' : 'parts'}). One part: ${D} : ${n - m} = ${u} (m). Width: ${u} × ${m} = ${m * u} (m). Length: ${u} × ${n} = ${n * u} (m). Area: ${n * u} × ${m * u} = ${F(m * u * n * u)} (m²).`)); }],
        ])),
      lesson(7, 40, L('Tìm tỉ số phần trăm của hai số', 'Finding the percentage one number is of another'),
        L('Rô-bốt ISA tính tỉ số phần trăm số cây đã trồng so với kế hoạch của lớp.', 'ISA the robot works out what percentage of the planned trees the class has planted.'),
        [
          { text: L('Muốn tìm tỉ số phần trăm của hai số, ta tìm thương của hai số rồi nhân thương đó với 100 và viết thêm kí hiệu %. 18 và 24: 18 : 24 = 0,75 = 75%.', 'To find what percentage one number is of another, divide the first number by the second, multiply the quotient by 100 and write the % sign. 18 and 24: 18 : 24 = 0,75 = 75%.'), visual: vz('percent', { percent: 75 }) },
        ],
        more(function (rng, i) {
          const b = P(rng, lv(i) === 0 ? [10, 20, 25, 50] : [20, 25, 40, 50, 80, 200, 400, 500]), a = R(rng, 1, lv(i) === 2 ? b + b / 2 : b);
          const pc = rd(a * 100 / b), f = i % 3;
          if (f === 0) return Q(L(`Tìm tỉ số phần trăm của ${a} và ${b}.`, `What percentage of ${b} is ${a}?`), null, num(pc, '%'), L('Lấy số thứ nhất chia cho số thứ hai, nhân với 100 rồi viết thêm %.', 'Divide the first number by the second, multiply by 100 and write %.'), `${a} : ${b} = ${F(rd(a / b))} = ${F(pc)}%.`);
          if (f === 1) { const tot = P(rng, [20, 25, 40, 50]), girls = R(rng, 1, tot - 1), p2 = rd(girls * 100 / tot); return Q(L(`Một lớp có ${tot} học sinh, trong đó có ${girls} học sinh nữ. Số học sinh nữ chiếm bao nhiêu phần trăm số học sinh cả lớp?`, `A class has ${tot} pupils, and ${girls} of them are girls. What percentage of the class are girls?`), null, num(p2, '%'), L('Tỉ số phần trăm = số học sinh nữ : số học sinh cả lớp × 100.', 'Percentage = number of girls : number of pupils in the class × 100.'), `${girls} : ${tot} = ${F(rd(girls / tot))} = ${F(p2)}%.`); }
          const plan = P(rng, [20, 40, 50, 80, 200]), done = R(rng, plan / 2, plan * 1.5), p3 = rd(done * 100 / plan);
          return Q(L(`Theo kế hoạch, lớp phải trồng ${plan} cây. Lớp đã trồng được ${done} cây. Lớp đã thực hiện được bao nhiêu phần trăm kế hoạch?`, `The class planned to plant ${plan} trees. It has planted ${done} trees. What percentage of the plan has the class done?`), null, num(p3, '%'), L('Tỉ số phần trăm = số cây đã trồng : số cây kế hoạch × 100.', 'Percentage = trees planted : trees planned × 100.'), `${done} : ${plan} = ${F(rd(done / plan))} = ${F(p3)}%.`);
        }, [
          [0, 6, rng => { const p = R(rng, 1, 99); return Q(L('Phần đã tô màu chiếm bao nhiêu phần trăm hình vuông?', 'What percentage of the square is shaded?'), vz('percent', { percent: p }), num(p, '%'), L('Hình vuông có 100 ô bằng nhau; mỗi ô là 1%.', 'The square has 100 equal small squares; each one is 1%.'), L(`Có ${p} ô được tô trong 100 ô: ${p}%.`, `${p} of the 100 squares are shaded: ${p}%.`)); }],
          [0, 9, rng => { const [a, b] = P(rng, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [R(rng, 1, 9), 10], [R(rng, 1, 19), 20], [R(rng, 1, 24), 25], [R(rng, 1, 49), 50]]), pc = a * 100 / b; return Q(L(`Viết phân số ${a}/${b} dưới dạng tỉ số phần trăm.`, `Write ${a}/${b} as a percentage.`), b <= 24 ? fv(a, b) : null, num(pc, '%'), L(`Viết ${a}/${b} thành phân số có mẫu số 100.`, `Write ${a}/${b} as a fraction with the denominator 100.`), `${a}/${b} = ${pc}/100 = ${pc}%.`); }],
          [3, 9, rng => { const tot = P(rng, [20, 25, 40, 50, 80, 200]), a = R(rng, 1, tot - 1), pc = rd(a * 100 / tot); const [tx] = P(rng, [[L(`Một vườn cây có ${tot} cây, trong đó có ${a} cây cam. Số cây cam chiếm bao nhiêu phần trăm số cây trong vườn?`, `An orchard has ${tot} trees, and ${a} of them are orange trees. What percentage of the trees in the orchard are orange trees?`)], [L(`Lớp 5A có ${tot} học sinh, trong đó có ${a} bạn thích đá cầu. Số bạn thích đá cầu chiếm bao nhiêu phần trăm số học sinh cả lớp?`, `Class 5A has ${tot} pupils, and ${a} of them like playing shuttlecock (đá cầu). What percentage of the class like playing shuttlecock?`)], [L(`Một đội bóng đã thi đấu ${tot} trận, thắng ${a} trận. Số trận thắng chiếm bao nhiêu phần trăm tổng số trận?`, `A football team has played ${tot} matches and won ${a} of them. What percentage of the matches did it win?`)]]); return Q(tx, null, num(pc, '%'), L('Tỉ số phần trăm = phần cần tìm : tổng × 100.', 'Percentage = the part : the total × 100.'), `${a} : ${tot} = ${F(rd(a / tot))} = ${F(pc)}%.`); }],
          [6, 9, rng => { const tot = P(rng, [20, 25, 40, 50]), boys = R(rng, 1, tot - 1), g = tot - boys, pc = rd(g * 100 / tot); return Q(L(`Một lớp có ${tot} học sinh, trong đó có ${boys} học sinh nam. Số học sinh nữ chiếm bao nhiêu phần trăm số học sinh cả lớp?`, `A class has ${tot} pupils, and ${boys} of them are boys. What percentage of the class are girls?`), null, num(pc, '%'), L('Bước 1: tìm số học sinh nữ. Bước 2: tìm tỉ số phần trăm.', 'Step 1: find the number of girls. Step 2: find the percentage.'), L(`Số học sinh nữ: ${tot} ${M} ${boys} = ${g}. ${g} : ${tot} = ${F(rd(g / tot))} = ${F(pc)}%.`, `Number of girls: ${tot} ${M} ${boys} = ${g}. ${g} : ${tot} = ${F(rd(g / tot))} = ${F(pc)}%.`)); }],
          [6, 9, rng => { const von = P(rng, [20000, 40000, 50000, 80000, 100000, 200000]), p = P(rng, [5, 10, 15, 20, 25]), lai = von * p / 100; return Q(L(`Một món hàng được mua vào với giá ${F(von)} đồng và bán ra với giá ${F(von + lai)} đồng. Tiền lãi bằng bao nhiêu phần trăm tiền vốn?`, `A shopkeeper buys an item for ${F(von)} dong and sells it for ${F(von + lai)} dong. The profit is what percentage of the cost price?`), null, num(p, '%'), L('Tiền lãi = giá bán − tiền vốn; tỉ số phần trăm = tiền lãi : tiền vốn × 100.', 'Profit = selling price − cost price; percentage = profit : cost price × 100.'), L(`Tiền lãi: ${F(von + lai)} ${M} ${F(von)} = ${F(lai)} (đồng). ${F(lai)} : ${F(von)} = ${F(rd(lai / von))} = ${p}%.`, `Profit: ${F(von + lai)} ${M} ${F(von)} = ${F(lai)} (dong). ${F(lai)} : ${F(von)} = ${F(rd(lai / von))} = ${p}%.`)); }],
        ])),
      lesson(7, 41, L('Tìm giá trị phần trăm của một số', 'Finding a percentage of a number'),
        L('Rô-bốt ISA tính tiền được giảm giá khi mẹ bạn Mai mua quần áo mới.', 'ISA the robot works out the discount when Mai\'s mum buys new clothes.'),
        [
          { text: L('Muốn tìm 30% của 120, ta lấy 120 × 30 : 100 = 36.', 'To find 30% of 120, work out 120 × 30 : 100 = 36.'), visual: vz('percent', { percent: 30 }) },
        ],
        more(function (rng, i) {
          const p = P(rng, [10, 20, 25, 30, 40, 50, 60, 75, 5, 15]), base = 100 / U.gcd(p, 100), N = no100(base * R(rng, 1, lv(i) === 0 ? 5 : 40), base), v = N * p / 100, f = i % 3;
          if (f === 0) return Q(L(`Tìm ${p}% của ${F(N)}.`, `Find ${p}% of ${F(N)}.`), vz('percent', { percent: p }), num(v), L(`Lấy ${F(N)} × ${p} : 100.`, `Work out ${F(N)} × ${p} : 100.`), `${F(N)} × ${p} : 100 = ${F(v)}.`);
          if (f === 1) { const price = R(rng, 2, 40) * 10000, pp = P(rng, [10, 20, 25, 50]), off = price * pp / 100; return Q(L(`Một chiếc áo giá ${F(price)} đồng, được giảm giá ${pp}%. Hỏi chiếc áo được giảm bao nhiêu tiền?`, `A shirt costs ${F(price)} dong and has ${pp}% off. How much money is taken off the price?`), vz('percent', { percent: pp }), num(off, L('đồng', 'dong')), L(`Tìm ${pp}% của ${F(price)}.`, `Find ${pp}% of ${F(price)}.`), L(`${F(price)} × ${pp} : 100 = ${F(off)} (đồng).`, `${F(price)} × ${pp} : 100 = ${F(off)} (dong).`)); }
          const tot = P(rng, [20, 25, 40, 50]), pp = P(rng, [20, 40, 60, 80]), girls = tot * pp / 100;
          return Q(L(`Lớp 5C có ${tot} học sinh, số học sinh nữ chiếm ${pp}%. Hỏi lớp có bao nhiêu học sinh nữ?`, `Class 5C has ${tot} pupils, and ${pp}% of them are girls. How many girls are there in the class?`), vz('percent', { percent: pp }), num(girls), L(`Tìm ${pp}% của ${tot}.`, `Find ${pp}% of ${tot}.`), L(`${tot} × ${pp} : 100 = ${girls} (học sinh).`, `${tot} × ${pp} : 100 = ${girls} (girls).`));
        }, [
          [0, 9, rng => { const p = P(rng, [10, 20, 25, 50]), N = no100(R(rng, 1, 20) * (100 / U.gcd(p, 100)), 100 / U.gcd(p, 100)), v = N * p / 100, cl = P(rng, [v, v, v * 10, N - v]); return Q(L(`Đúng hay sai?\n${p}% của ${F(N)} là ${F(cl)}.`, `True or false?\n${p}% of ${F(N)} is ${F(cl)}.`), vz('percent', { percent: p }), tf(rng, cl === v), L(`Lấy ${F(N)} × ${p} : 100.`, `Work out ${F(N)} × ${p} : 100.`), `${F(N)} × ${p} : 100 = ${F(v)}. ${cl === v ? YES : NO}.`); }],
          [3, 9, rng => { const p = P(rng, [20, 25, 30, 40, 60, 75]), N = no100(R(rng, 2, 12) * (100 / U.gcd(p, 100)) * 2, 200 / U.gcd(p, 100)), v = N * p / 100; const [tx, u] = P(rng, [[L(`Một trường có ${F(N)} học sinh, số học sinh biết bơi chiếm ${p}%. Hỏi trường có bao nhiêu học sinh biết bơi?`, `A school has ${F(N)} pupils, and ${p}% of them can swim. How many pupils can swim?`), ''], [L(`Một cửa hàng có ${F(N)} kg gạo, đã bán được ${p}% số gạo đó. Hỏi cửa hàng đã bán bao nhiêu ki-lô-gam gạo?`, `A shop has ${F(N)} kg of rice and has sold ${p}% of it. How many kilograms of rice has the shop sold?`), 'kg'], [L(`Một thửa ruộng thu hoạch được ${F(N)} kg thóc, trong đó ${p}% là thóc nếp. Hỏi thu hoạch được bao nhiêu ki-lô-gam thóc nếp?`, `A rice field gave a harvest of ${F(N)} kg of rice grain, and ${p}% of it is sticky rice. How many kilograms of sticky rice were harvested?`), 'kg']]); return Q(tx, vz('percent', { percent: p }), u ? num(v, u) : num(v), L(`Tìm ${p}% của ${F(N)}.`, `Find ${p}% of ${F(N)}.`), `${F(N)} × ${p} : 100 = ${F(v)}${u ? ' (' + u + ')' : ''}.`); }],
          [3, 9, rng => { const tr = R(rng, 1, 20), N = tr * 1000000, lai = tr * 5000; return Q(L(`Một người gửi tiết kiệm ${F(N)} đồng với lãi suất 0,5% một tháng. Hỏi sau một tháng người đó nhận được bao nhiêu tiền lãi?`, `Someone puts ${F(N)} dong in a savings account. The interest is 0,5% a month. How much interest do they get after one month?`), null, num(lai, L('đồng', 'dong')), L(`Tìm 0,5% của ${F(N)}: lấy ${F(N)} × 0,5 : 100.`, `Find 0,5% of ${F(N)}: work out ${F(N)} × 0,5 : 100.`), L(`${F(N)} × 0,5 : 100 = ${F(lai)} (đồng).`, `${F(N)} × 0,5 : 100 = ${F(lai)} (dong).`)); }],
          [6, 9, rng => { const price = R(rng, 4, 40) * 10000, pp = P(rng, [10, 20, 25, 50]), off = price * pp / 100; return Q(L(`Một đôi giày giá ${F(price)} đồng, nay được giảm giá ${pp}%. Hỏi giá đôi giày sau khi giảm là bao nhiêu tiền?`, `A pair of shoes cost ${F(price)} dong. Now they have ${pp}% off. What is the new price of the shoes?`), vz('percent', { percent: pp }), num(price - off, L('đồng', 'dong')), L(`Bước 1: tìm ${pp}% của ${F(price)}. Bước 2: lấy giá cũ trừ số tiền được giảm.`, `Step 1: find ${pp}% of ${F(price)}. Step 2: subtract the discount from the old price.`), L(`Được giảm: ${F(price)} × ${pp} : 100 = ${F(off)} (đồng). Giá mới: ${F(price)} ${M} ${F(off)} = ${F(price - off)} (đồng).`, `Discount: ${F(price)} × ${pp} : 100 = ${F(off)} (dong). New price: ${F(price)} ${M} ${F(off)} = ${F(price - off)} (dong).`)); }],
          [0, 6, rng => { const p = P(rng, [10, 20, 25, 50]), N = no100(R(rng, 1, 20) * (100 / U.gcd(p, 100)), 100 / U.gcd(p, 100)), v = N * p / 100; return Q(L(`${p}% của ${F(N)} là:`, `${p}% of ${F(N)} is:`), vz('percent', { percent: p }), ch(rng, v, [v * 10, N - v, rd(v / 10), N * p].filter(x => x > 0)), L(`Lấy ${F(N)} × ${p} : 100.`, `Work out ${F(N)} × ${p} : 100.`), `${F(N)} × ${p} : 100 = ${F(v)}.`); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 8. THỂ TÍCH. ĐƠN VỊ ĐO THỂ TÍCH ============
  const c8 = {
    id: 'g5-c8', semester: 2, title: L('Thể tích. Đơn vị đo thể tích', 'Volume. Units of volume'), icon: '🧊', lessons: [
      lesson(8, 45, L('Thể tích của một hình', 'The volume of a shape'),
        L('Rô-bốt ISA xếp những khối lập phương nhỏ thành các hình khác nhau cùng bạn Tú.', 'ISA the robot and Tú build different shapes from small cubes.'),
        [
          { text: L('Hình này gồm 12 khối lập phương nhỏ. Ta nói thể tích của hình bằng 12 khối lập phương nhỏ.', 'This shape is made of 12 small cubes. We say that its volume is 12 small cubes.'), visual: vz('cubes', { l: 3, w: 2, h: 2 }) },
          { text: L('Hình A gồm nhiều khối lập phương hơn hình B (cùng loại) thì thể tích hình A lớn hơn.', 'If shape A is made of more cubes than shape B (cubes of the same size), shape A has the bigger volume.') },
        ],
        more(function (rng, i) {
          const l = R(rng, 1, 4), w = R(rng, 1, 3), h = R(rng, 1, lv(i) === 0 ? 2 : 4), f = i % 3;
          if (f === 0 || f === 2) return Q(L('Hình dưới đây gồm bao nhiêu khối lập phương nhỏ?', 'How many small cubes make up the shape below?'), vz('cubes', { l, w, h }), num(l * w * h), L('Đếm số khối ở một lớp rồi nhân với số lớp.', 'Count the cubes in one layer, then multiply by the number of layers.'), L(`${l} × ${w} × ${h} = ${l * w * h} (khối).`, `${l} × ${w} × ${h} = ${l * w * h} (${l * w * h === 1 ? 'cube' : 'cubes'}).`));
          const l2 = R(rng, 1, 4), w2 = R(rng, 1, 3), h2 = R(rng, 1, 3);
          return Q(L(`Hình A gồm ${l * w * h} khối lập phương nhỏ, hình B gồm ${l2 * w2 * h2} khối như thế. So sánh thể tích: hình A … hình B`, `Shape A is made of ${pl(l * w * h, 'small cube')} and shape B is made of ${pl(l2 * w2 * h2, 'cube')} like these. Compare the volumes: shape A … shape B`), vz('cubes', { l, w, h }), cmpAns(l * w * h, l2 * w2 * h2), L('Hình nào gồm nhiều khối hơn thì thể tích lớn hơn.', 'The shape with more cubes has the bigger volume.'), `${l * w * h} ${sign(l * w * h, l2 * w2 * h2)} ${l2 * w2 * h2}.`);
        }, [
          [0, 9, rng => { const l = R(rng, 1, 4), w = R(rng, 1, 3), h = R(rng, 1, 3), n = l * w * h, cl = P(rng, [n, n, n + l, n + w * h, Math.max(1, n - 1)]); return Q(L(`Đúng hay sai?\nHình dưới đây gồm ${cl} khối lập phương nhỏ.`, `True or false?\nThe shape below is made of ${cl} small cubes.`), vz('cubes', { l, w, h }), tf(rng, cl === n), L('Đếm số khối ở một lớp rồi nhân với số lớp (nhớ cả những khối bị che).', 'Count the cubes in one layer, then multiply by the number of layers (remember the hidden cubes too).'), L(`${l} × ${w} × ${h} = ${n} (khối). ${cl === n ? 'Đúng' : 'Sai'}.`, `${l} × ${w} × ${h} = ${n} (${n === 1 ? 'cube' : 'cubes'}). ${cl === n ? YES : NO}.`)); }],
          [3, 9, rng => { const l = R(rng, 2, 4), w = R(rng, 1, 3), h = R(rng, 1, 3), A = l * w * h; let B = R(rng, 1, 30); if (B === A) B = A + 2; const SH = x => L(`Hình ${x}`, `Shape ${x}`), CU = x => L(`${x} khối`, pl(x, 'cube')); return Q(L(`Hình A như hình vẽ. Hình B gồm ${B} khối lập phương nhỏ như thế. Hình nào có thể tích lớn hơn và lớn hơn bao nhiêu khối lập phương nhỏ?`, `Shape A is in the picture. Shape B is made of ${B} small cubes like these. Which shape has the bigger volume, and by how many small cubes?`), vz('cubes', { l, w, h }), ch(rng, `${SH(A > B ? 'A' : 'B')}, ${CU(Math.abs(A - B))}`, [`${SH(A > B ? 'B' : 'A')}, ${CU(Math.abs(A - B))}`, `${SH(A > B ? 'A' : 'B')}, ${CU(A + B)}`, `${SH(A > B ? 'A' : 'B')}, ${CU(Math.abs(A - B) + 1)}`]), L('Đếm số khối của hình A rồi so sánh với hình B.', 'Count the cubes in shape A, then compare with shape B.'), L(`Hình A gồm ${A} khối. ${Math.max(A, B)} ${M} ${Math.min(A, B)} = ${Math.abs(A - B)}.`, `Shape A is made of ${A} cubes. ${Math.max(A, B)} ${M} ${Math.min(A, B)} = ${Math.abs(A - B)}.`)); }],
          [3, 9, rng => { const ns = U.sample(rng, Array.from({ length: 30 }, (_, j) => j + 4), 3), mx = Math.max(...ns), names = ['A', 'B', 'C'], SH = x => L(`Hình ${x}`, `Shape ${x}`); return Q(L(`Hình A gồm ${ns[0]} khối lập phương nhỏ, hình B gồm ${ns[1]} khối, hình C gồm ${ns[2]} khối (các khối như nhau). Hình nào có thể tích lớn nhất?`, `Shape A is made of ${ns[0]} small cubes, shape B of ${ns[1]} cubes and shape C of ${ns[2]} cubes (all the cubes are the same). Which shape has the biggest volume?`), null, ch(rng, SH(names[ns.indexOf(mx)]), names.map(SH)), L('Hình nào gồm nhiều khối lập phương nhỏ nhất thì có thể tích lớn nhất.', 'The shape made of the most small cubes has the biggest volume.'), L(`Hình ${names[ns.indexOf(mx)]} gồm ${mx} khối, nhiều nhất.`, `Shape ${names[ns.indexOf(mx)]} is made of ${mx} cubes, the most.`)); }],
          [6, 9, rng => { const l = R(rng, 2, 4), w = R(rng, 1, 3), h = R(rng, 1, 3); return Q(L('Nếu xếp thêm một lớp khối lập phương nhỏ như lớp trên cùng lên hình dưới đây thì hình mới gồm bao nhiêu khối lập phương nhỏ?', 'If you put one more layer of small cubes, like the top layer, on the shape below, how many small cubes will the new shape have?'), vz('cubes', { l, w, h }), num(l * w * (h + 1)), L('Mỗi lớp có số khối bằng nhau; tính số khối một lớp rồi nhân với số lớp mới.', 'Each layer has the same number of cubes. Find the cubes in one layer, then multiply by the new number of layers.'), L(`Mỗi lớp ${l} × ${w} = ${l * w} khối; ${h + 1} lớp: ${l * w * (h + 1)} (khối).`, `Each layer: ${l} × ${w} = ${l * w} cubes; ${h + 1} layers: ${l * w * (h + 1)} (cubes).`)); }],
          [7, 9, rng => { let l = R(rng, 1, 3), w = R(rng, 1, 3), h = R(rng, 1, 3); if (l * w * h === 27) h = 2; return Q(L('Cần xếp thêm ít nhất bao nhiêu khối lập phương nhỏ nữa để hình dưới đây trở thành một hình lập phương có cạnh gồm 3 khối?', 'What is the smallest number of small cubes you must add to make the shape below into a big cube with 3 small cubes along each edge?'), vz('cubes', { l, w, h }), num(27 - l * w * h), L('Hình lập phương cạnh 3 khối gồm 3 × 3 × 3 = 27 khối.', 'A cube with 3 small cubes along each edge has 3 × 3 × 3 = 27 small cubes.'), L(`Hình đã có ${l * w * h} khối. 27 ${M} ${l * w * h} = ${27 - l * w * h} (khối).`, `The shape already has ${l * w * h} cubes. 27 ${M} ${l * w * h} = ${27 - l * w * h} (${27 - l * w * h === 1 ? 'cube' : 'cubes'}).`)); }],
        ])),
      lesson(8, 46, L('Xăng-ti-mét khối. Đề-xi-mét khối', 'Cubic centimetres. Cubic decimetres'),
        L('Rô-bốt ISA dùng những khối lập phương cạnh 1 cm xếp thành khối lớn cạnh 1 dm.', 'ISA the robot uses cubes with 1 cm edges to build a big cube with 1 dm edges.'),
        [
          { text: L('Xăng-ti-mét khối (cm³) là thể tích hình lập phương cạnh 1 cm. Đề-xi-mét khối (dm³) là thể tích hình lập phương cạnh 1 dm.', 'A cubic centimetre (cm³) is the volume of a cube with 1 cm edges. A cubic decimetre (dm³) is the volume of a cube with 1 dm edges.'), visual: vz('solid', { kind: 'cube' }) },
          { text: L('1 dm³ = 1000 cm³ (10 × 10 × 10 khối nhỏ).', '1 dm³ = 1000 cm³ (10 × 10 × 10 small cubes).') },
        ],
        more(function (rng, i) {
          const a = R(rng, 2, 9), f = i % 3;
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} dm³ = ? cm³`, a * 1000, 'cm³'], [`${a * 1000} cm³ = ? dm³`, a, 'dm³'], [`${F(dec(a * 10 + 5, 1))} dm³ = ? cm³`, (a * 10 + 5) * 100, 'cm³'], [`${a * 100} cm³ = ? dm³`, dec(a, 1), 'dm³']]); return Q(p, null, num(v, u), '1 dm³ = 1000 cm³.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const l = R(rng, 2, 4), w = R(rng, 1, 3), h = R(rng, 1, 3); return Q(L('Mỗi khối lập phương nhỏ có thể tích 1 cm³. Thể tích của hình là bao nhiêu xăng-ti-mét khối?', 'Each small cube has a volume of 1 cm³. What is the volume of the shape in cubic centimetres?'), vz('cubes', { l, w, h }), num(l * w * h, 'cm³'), L('Đếm số khối 1 cm³.', 'Count the 1 cm³ cubes.'), `${l * w * h} cm³.`); }
          const x = R(rng, 1, 5), y = x * 1000 + P(rng, [-100, 0, 200]);
          return Q(L(`So sánh: ${x} dm³ … ${F(y)} cm³`, `Compare: ${x} dm³ … ${F(y)} cm³`), vz('compare', { left: `${x} dm³`, right: `${F(y)} cm³` }), cmpAns(x * 1000, y), L('Đổi về cùng đơn vị.', 'Change them to the same unit.'), `${x} dm³ = ${F(x * 1000)} cm³; ${F(x * 1000)} ${sign(x * 1000, y)} ${F(y)}.`);
        }, [
          [0, 6, rng => {
            const n = R(rng, 11, 999), dm = R(rng, 0, 1) === 1, u = dm ? L('đề-xi-mét khối', 'cubic decimetres') : L('xăng-ti-mét khối', 'cubic centimetres'), s = dm ? 'dm³' : 'cm³';
            if (R(rng, 0, 1)) return Q(L(`Số đo ${n} ${s} đọc là:`, `How do you read ${n} ${s}?`), null, ch(rng, `${readN(n)} ${u}`, [`${readN(n)} ${dm ? L('đề-xi-mét vuông', 'square decimetres') : L('xăng-ti-mét vuông', 'square centimetres')}`, `${readN(n)} ${dm ? L('xăng-ti-mét khối', 'cubic centimetres') : L('đề-xi-mét khối', 'cubic decimetres')}`, `${readN(n)} ${dm ? L('đề-xi-mét', 'decimetres') : L('xăng-ti-mét', 'centimetres')}`]), L(`${s} đọc là "${u}".`, `${s} is read "${u}".`), L(`${n} ${s} đọc là: ${readVN(n)} ${u}.`, `${n} ${s} is read "${RE(n)} ${u}".`));
            return Q(L(`"${readVN(n)} ${u}" viết là:`, `How do you write "${RE(n)} ${u}"?`), null, ch(rng, `${n} ${s}`, [`${n} ${dm ? 'dm²' : 'cm²'}`, `${n} ${dm ? 'cm³' : 'dm³'}`, `${n} ${dm ? 'dm' : 'cm'}`]), L(`${u[0].toUpperCase() + u.slice(1)} viết tắt là ${s}.`, `We write "${u}" as ${s} for short.`), L(`Viết là ${n} ${s}.`, `It is written ${n} ${s}.`));
          }],
          [0, 9, rng => { const [t, u] = P(rng, [[L('Thể tích một viên phấn khoảng 5', 'The volume of a stick of chalk is about 5'), 'cm³'], [L('Thể tích một hộp sữa tươi khoảng 1', 'The volume of a carton of fresh milk is about 1'), 'dm³'], [L('Thể tích một viên xúc xắc khoảng 8', 'The volume of a dice is about 8'), 'cm³'], [L('Thể tích một chiếc thùng giấy khoảng 30', 'The volume of a cardboard box is about 30'), 'dm³'], [L('Thể tích một quả trứng gà khoảng 50', 'The volume of a hen\'s egg is about 50'), 'cm³'], [L('Thể tích một chiếc nồi cơm điện khoảng 5', 'The volume of a rice cooker is about 5'), 'dm³']]); return Q(L(`Chọn đơn vị thích hợp:\n${t} …`, `Choose the right unit:\n${t} …`), null, ch(rng, u, [u === 'cm³' ? 'dm³' : 'cm³']), L('Hình dung độ lớn: 1 cm³ là khối lập phương cạnh 1 cm, 1 dm³ là khối lập phương cạnh 10 cm.', 'Think about the size: 1 cm³ is a cube with 1 cm edges, 1 dm³ is a cube with 10 cm edges.'), `${t} ${u}.`); }],
          [3, 9, rng => { const dm = R(rng, 0, 1) === 1, u = dm ? 'dm³' : 'cm³', a = R(rng, 20, 900), b = R(rng, 5, a - 1), sub = R(rng, 0, 1) === 1; return Q(`${a} ${u} ${sub ? M : '+'} ${b} ${u} = ?`, null, num(sub ? a - b : a + b, u), L('Tính với các số rồi ghi đơn vị.', 'Calculate with the numbers, then write the unit.'), `${a} ${u} ${sub ? M : '+'} ${b} ${u} = ${sub ? a - b : a + b} ${u}.`); }],
          [6, 9, rng => { const a = R(rng, 1, 9), b = R(rng, 1, 999); return Q(`${a} dm³ ${b} cm³ = ? cm³`, null, num(a * 1000 + b, 'cm³'), '1 dm³ = 1000 cm³.', `${a} dm³ = ${F(a * 1000)} cm³; ${F(a * 1000)} + ${b} = ${F(a * 1000 + b)} (cm³).`); }],
        ])),
      lesson(8, 47, L('Mét khối', 'Cubic metres'),
        L('Rô-bốt ISA tính lượng nước trong bể bơi của nhà văn hóa.', 'ISA the robot works out how much water there is in the swimming pool at the community centre.'),
        [
          { text: L('Mét khối (m³) là thể tích hình lập phương cạnh 1 m. 1 m³ = 1000 dm³ = 1 000 000 cm³.', 'A cubic metre (m³) is the volume of a cube with 1 m edges. 1 m³ = 1000 dm³ = 1 000 000 cm³.'), visual: vz('solid', { kind: 'cube' }) },
          { text: L('m³ – dm³ – cm³: mỗi đơn vị gấp 1000 lần đơn vị bé hơn liền sau.', 'm³ – dm³ – cm³: each unit is 1000 times the next smaller unit.') },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), f = i % 3;
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} m³ = ? dm³`, a * 1000, 'dm³'], [`${a} m³ = ? cm³`, a * 1000000, 'cm³'], [`${a * 1000} dm³ = ? m³`, a, 'm³'], [`${F(dec(a, 1))} m³ = ? dm³`, a * 100, 'dm³']]); return Q(p, null, num(v, u), '1 m³ = 1000 dm³; 1 dm³ = 1000 cm³.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const [p, u] = P(rng, [[L('Thể tích một bể bơi khoảng 500 …', 'The volume of a swimming pool is about 500 …'), 'm³'], [L('Thể tích một hộp sữa nhỏ khoảng 180 …', 'The volume of a small carton of milk is about 180 …'), 'cm³'], [L('Thể tích một thùng nước khoảng 20 …', 'The volume of a water bucket is about 20 …'), 'dm³']]); return Q(L(`Chọn đơn vị thích hợp:\n${p}`, `Choose the right unit:\n${p}`), null, ch(rng, u, ['m³', 'dm³', 'cm³'].filter(x => x !== u)), L('Hình dung độ lớn thật.', 'Imagine how big it really is.'), `${p.replace('…', u)}.`); }
          const b = R(rng, 1, 999);
          return Q(`${a} m³ ${b} dm³ = ? dm³`, null, num(a * 1000 + b, 'dm³'), '1 m³ = 1000 dm³.', `${a} m³ ${b} dm³ = ${F(a * 1000 + b)} dm³.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 9. DIỆN TÍCH VÀ THỂ TÍCH CỦA MỘT SỐ HÌNH KHỐI ============
  const CUBE = L('Hình lập phương', 'A cube'), BOX = L('Hình hộp chữ nhật', 'A cuboid'), CYL = L('Hình trụ', 'A cylinder'), SPH = L('Hình cầu', 'A sphere');
  const c9 = {
    id: 'g5-c9', semester: 2, title: L('Diện tích và thể tích của một số hình khối', 'Surface area and volume of some solids'), icon: '📦', lessons: [
      lesson(9, 49, L('Hình khai triển của hình lập phương, hình hộp chữ nhật và hình trụ', 'Nets of a cube, a cuboid and a cylinder'),
        L('Rô-bốt ISA mở phẳng chiếc hộp quà để xem nó được ghép từ những hình nào.', 'ISA the robot opens out a gift box flat to see which shapes it is made of.'),
        [
          { text: L('Hình khai triển của hình lập phương gồm 6 hình vuông bằng nhau.', 'The net of a cube is made of 6 equal squares.'), visual: vz('solid', { kind: 'cube' }) },
          { text: L('Hình khai triển của hình hộp chữ nhật gồm 6 hình chữ nhật. Hình khai triển của hình trụ gồm 2 hình tròn và 1 hình chữ nhật.', 'The net of a cuboid is made of 6 rectangles. The net of a cylinder is made of 2 circles and 1 rectangle.'), visual: vz('solid', { kind: 'cylinder' }) },
        ],
        more(function (rng, i) {
          const qs = [
            [L('Hình khai triển của hình lập phương gồm mấy hình vuông?', 'How many squares make up the net of a cube?'), 'cube', null, 6],
            [L('Hình khai triển của hình hộp chữ nhật gồm mấy hình chữ nhật?', 'How many rectangles make up the net of a cuboid?'), 'box', null, 6],
            [L('Hình khai triển của hình trụ gồm những hình nào?', 'Which shapes make up the net of a cylinder?'), 'cylinder', L('2 hình tròn và 1 hình chữ nhật', '2 circles and 1 rectangle'), [L('1 hình tròn và 2 hình chữ nhật', '1 circle and 2 rectangles'), L('6 hình vuông', '6 squares'), L('2 hình tam giác và 1 hình chữ nhật', '2 triangles and 1 rectangle')]],
            [L('Hình nào có hình khai triển gồm 6 hình vuông bằng nhau?', 'Which solid has a net made of 6 equal squares?'), 'cube', CUBE, [BOX, CYL, SPH]],
            [L('Hình nào có hình khai triển gồm 2 hình tròn và 1 hình chữ nhật?', 'Which solid has a net made of 2 circles and 1 rectangle?'), 'cylinder', CYL, [CUBE, BOX, SPH]],
          ];
          const [p, k, c, d] = qs[(i + R(rng, 0, 4)) % 5];
          if (c == null) return Q(p, vz('solid', { kind: k }), num(d), L('Đếm số mặt của hình khối.', 'Count the faces of the solid.'), L(`Gồm ${d} hình.`, `It is made of ${d} shapes.`));
          return Q(p, vz('solid', { kind: k }), ch(rng, c, d), L('Hình dung mở phẳng các mặt của hình khối.', 'Imagine opening out the faces of the solid flat.'), L(`Đáp án: ${c}.`, `Answer: ${c}.`));
        }, [
          [0, 9, rng => { const [st, ok, kd] = P(rng, [[L('Hình khai triển của hình lập phương gồm 6 hình vuông bằng nhau', 'The net of a cube is made of 6 equal squares'), true, 'cube'], [L('Hình khai triển của hình hộp chữ nhật gồm 6 hình vuông bằng nhau', 'The net of a cuboid is made of 6 equal squares'), false, 'box'], [L('Hình khai triển của hình trụ gồm 2 hình tròn và 1 hình chữ nhật', 'The net of a cylinder is made of 2 circles and 1 rectangle'), true, 'cylinder'], [L('Hình khai triển của hình trụ gồm 1 hình tròn và 1 hình chữ nhật', 'The net of a cylinder is made of 1 circle and 1 rectangle'), false, 'cylinder'], [L('Hình khai triển của hình hộp chữ nhật gồm 6 hình chữ nhật', 'The net of a cuboid is made of 6 rectangles'), true, 'box'], [L('Hình khai triển của hình lập phương gồm 4 hình vuông', 'The net of a cube is made of 4 squares'), false, 'cube'], [L('Hai đáy của hình trụ là hai hình tròn bằng nhau', 'The two bases of a cylinder are two equal circles'), true, 'cylinder']]); return Q(L(`Đúng hay sai?\n${st}.`, `True or false?\n${st}.`), vz('solid', { kind: kd }), tf(rng, ok), L('Hình dung mở phẳng các mặt của hình khối.', 'Imagine opening out the faces of the solid flat.'), `${ok ? YES : NO}.`); }],
          [0, 9, rng => { const a = R(rng, 2, 20); return Q(L(`Hình khai triển của hình lập phương cạnh ${a} cm gồm 6 hình vuông. Mỗi hình vuông có cạnh bao nhiêu xăng-ti-mét?`, `The net of a cube with ${a} cm edges is made of 6 squares. How many centimetres long is the side of each square?`), vz('solid', { kind: 'cube', dims: { a } }), num(a, 'cm'), L('Mỗi mặt của hình lập phương là một hình vuông có cạnh bằng cạnh hình lập phương.', 'Each face of a cube is a square with sides as long as the edges of the cube.'), L(`Mỗi hình vuông có cạnh ${a} cm.`, `Each square has sides of ${a} cm.`)); }],
          [3, 9, rng => { const [l, w, h] = U.sample(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10], 3).sort((x, y) => y - x), [p, q] = P(rng, [[l, w], [l, h], [w, h]]); return Q(L(`Hình khai triển của hình hộp chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm, chiều cao ${h} cm có mấy hình chữ nhật kích thước ${p} cm × ${q} cm?`, `Look at the net of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high. How many rectangles in it measure ${p} cm × ${q} cm?`), vz('solid', { kind: 'box', dims: { l, w, h } }), num(2), L('Các mặt đối diện của hình hộp chữ nhật bằng nhau.', 'Opposite faces of a cuboid are equal.'), L(`Có 2 mặt đối diện kích thước ${p} cm × ${q} cm.`, `There are 2 opposite faces measuring ${p} cm × ${q} cm.`)); }],
          [6, 9, rng => { const [l, w, h] = U.sample(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10], 3).sort((x, y) => y - x); return Q(L(`Hình khai triển của hình hộp chữ nhật dài ${l} cm, rộng ${w} cm, cao ${h} cm gồm mấy cặp hình chữ nhật bằng nhau?`, `The net of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high is made of how many pairs of equal rectangles?`), vz('solid', { kind: 'box', dims: { l, w, h } }), num(3), L('Hình hộp chữ nhật có 3 cặp mặt đối diện bằng nhau.', 'A cuboid has 3 pairs of equal opposite faces.'), L(`Gồm 3 cặp: ${l} × ${w}, ${l} × ${h}, ${w} × ${h} (cm).`, `3 pairs: ${l} × ${w}, ${l} × ${h}, ${w} × ${h} (cm).`)); }],
          [0, 9, rng => { const a = R(rng, 2, 15), cube = R(rng, 0, 1) === 1; if (cube) return Q(L(`Hình khai triển của hình lập phương cạnh ${a} cm gồm mấy hình vuông cạnh ${a} cm?`, `The net of a cube with ${a} cm edges has how many squares with ${a} cm sides?`), vz('solid', { kind: 'cube', dims: { a } }), num(6), L('Hình lập phương có 6 mặt là các hình vuông bằng nhau.', 'A cube has 6 faces, and they are all equal squares.'), L('Gồm 6 hình vuông.', 'It has 6 squares.')); const [l, w, h] = U.sample(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 3).sort((x, y) => y - x); return Q(L(`Hình khai triển của hình hộp chữ nhật dài ${l} cm, rộng ${w} cm, cao ${h} cm gồm tất cả mấy hình chữ nhật?`, `The net of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high is made of how many rectangles altogether?`), vz('solid', { kind: 'box', dims: { l, w, h } }), num(6), L('Hình hộp chữ nhật có 6 mặt là hình chữ nhật.', 'A cuboid has 6 faces, and they are all rectangles.'), L('Gồm 6 hình chữ nhật.', 'It has 6 rectangles.')); }],
          [0, 9, rng => { const [l, w, h] = U.sample(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 3).sort((x, y) => y - x), big = R(rng, 0, 1) === 1; return Q(L(`Hình khai triển của hình hộp chữ nhật dài ${l} cm, rộng ${w} cm, cao ${h} cm. Hình chữ nhật ${big ? 'lớn' : 'bé'} nhất trong hình khai triển có kích thước là:`, `Look at the net of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high. The ${big ? 'largest' : 'smallest'} rectangle in the net measures:`), vz('solid', { kind: 'box', dims: { l, w, h } }), ch(rng, big ? `${l} cm × ${w} cm` : `${w} cm × ${h} cm`, [`${l} cm × ${h} cm`, big ? `${w} cm × ${h} cm` : `${l} cm × ${w} cm`, `${l} cm × ${l} cm`]), L('Các mặt của hình hộp chữ nhật có kích thước: dài × rộng, dài × cao, rộng × cao.', 'The faces of a cuboid measure: length × width, length × height, width × height.'), big ? L(`Mặt lớn nhất: ${l} cm × ${w} cm.`, `Largest face: ${l} cm × ${w} cm.`) : L(`Mặt bé nhất: ${w} cm × ${h} cm.`, `Smallest face: ${w} cm × ${h} cm.`)); }],
        ], 1)),
      lesson(9, 50, L('Diện tích xung quanh và diện tích toàn phần của hình hộp chữ nhật', 'Lateral and total surface area of a cuboid'),
        L('Rô-bốt ISA tính lượng giấy màu để bọc chiếc hộp quà tặng mẹ.', 'ISA the robot works out how much coloured paper is needed to wrap a gift box for Mum.'),
        [
          { text: L('Diện tích xung quanh = chu vi mặt đáy × chiều cao: Sxq = (a + b) × 2 × c.', 'Lateral surface area (the four side faces) = perimeter of the base × height = (a + b) × 2 × c.'), visual: vz('solid', { kind: 'box', dims: { l: 5, w: 3, h: 4 } }) },
          { text: L('Diện tích toàn phần = diện tích xung quanh + diện tích hai đáy: Stp = Sxq + a × b × 2.', 'Total surface area = lateral surface area + area of the two bases = lateral area + a × b × 2.') },
        ],
        more(function (rng, i) {
          const a = R(rng, 3, lv(i) === 0 ? 10 : 30), b = R(rng, 2, a - 1), c = R(rng, 2, lv(i) === 0 ? 10 : 25), sxq = (a + b) * 2 * c, stp = sxq + a * b * 2, f = i % 3;
          const v = vz('solid', { kind: 'box', dims: { l: a, w: b, h: c } });
          if (f === 0) return Q(L(`Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích xung quanh.`, `A cuboid is ${a} cm long, ${b} cm wide and ${c} cm high. Find its lateral surface area.`), v, num(sxq, 'cm²'), L('Sxq = (dài + rộng) × 2 × cao.', 'Lateral area = (length + width) × 2 × height.'), `(${a} + ${b}) × 2 × ${c} = ${F(sxq)} (cm²).`);
          if (f === 1) return Q(L(`Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích toàn phần.`, `A cuboid is ${a} cm long, ${b} cm wide and ${c} cm high. Find its total surface area.`), v, num(stp, 'cm²'), L('Stp = Sxq + 2 × diện tích đáy.', 'Total area = lateral area + 2 × area of the base.'), L(`Sxq = (${a} + ${b}) × 2 × ${c} = ${F(sxq)}; Stp = ${F(sxq)} + ${a} × ${b} × 2 = ${F(stp)} (cm²).`, `Lateral area = (${a} + ${b}) × 2 × ${c} = ${F(sxq)}; total area = ${F(sxq)} + ${a} × ${b} × 2 = ${F(stp)} (cm²).`));
          const A = a * 10, B = b * 10, C = c * 10, glass = (A + B) * 2 * C + A * B;
          return Q(L(`Một bể cá không có nắp dạng hình hộp chữ nhật dài ${A} cm, rộng ${B} cm, cao ${C} cm. Tính diện tích kính dùng làm bể.`, `A fish tank with no lid is a cuboid ${A} cm long, ${B} cm wide and ${C} cm high. Find the area of glass used to make the tank.`), vz('solid', { kind: 'box', dims: { l: A, w: B, h: C } }), num(glass, 'cm²'), L('Bể không nắp: diện tích xung quanh + 1 mặt đáy.', 'No lid: lateral area + 1 base.'), `(${A} + ${B}) × 2 × ${C} + ${A} × ${B} = ${F(glass)} (cm²).`);
        }, [
          [0, 6, rng => { const a = R(rng, 3, 20), b = R(rng, 2, a - 1), c = R(rng, 2, 15); return Q(L(`Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích một mặt đáy.`, `A cuboid is ${a} cm long, ${b} cm wide and ${c} cm high. Find the area of one base.`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: c } }), num(a * b, 'cm²'), L('Mặt đáy là hình chữ nhật có chiều dài và chiều rộng của hình hộp.', 'The base is a rectangle with the length and width of the cuboid.'), `${a} × ${b} = ${a * b} (cm²).`); }],
          [3, 9, rng => { const P2 = R(rng, 5, 40) * 2, c = R(rng, 2, 20); return Q(L(`Một hình hộp chữ nhật có chu vi mặt đáy ${P2} cm, chiều cao ${c} cm. Tính diện tích xung quanh.`, `The base of a cuboid has a perimeter of ${P2} cm and the cuboid is ${c} cm high. Find its lateral surface area.`), null, num(P2 * c, 'cm²'), L('Sxq = chu vi mặt đáy × chiều cao.', 'Lateral area = perimeter of the base × height.'), `${P2} × ${c} = ${F(P2 * c)} (cm²).`); }],
          [0, 9, rng => { const a = R(rng, 3, 15), b = R(rng, 2, a - 1), c = R(rng, 2, 12), sxq = (a + b) * 2 * c, stp = sxq + 2 * a * b; return Q(L(`Diện tích xung quanh của hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm là:`, `The lateral surface area of a cuboid ${a} cm long, ${b} cm wide and ${c} cm high is:`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: c } }), ch(rng, `${F(sxq)} cm²`, [`${F(stp)} cm²`, `${F((a + b) * c)} cm²`, `${F(a * b * c)} cm²`]), L('Sxq = (dài + rộng) × 2 × cao.', 'Lateral area = (length + width) × 2 × height.'), `(${a} + ${b}) × 2 × ${c} = ${F(sxq)} (cm²).`); }],
          [6, 9, rng => { const a = dec(R(rng, 12, 30), 1), b = dec(R(rng, 5, 11), 1), c = R(rng, 1, 3), sxq = rd((a + b) * 2 * c); return Q(L(`Một cái thùng dạng hình hộp chữ nhật dài ${F(a)} m, rộng ${F(b)} m, cao ${c} m. Tính diện tích xung quanh của thùng.`, `A crate is a cuboid ${F(a)} m long, ${F(b)} m wide and ${c} m high. Find the lateral surface area of the crate.`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: c, unit: 'm' } }), num(sxq, 'm²'), L('Sxq = (a + b) × 2 × c.', 'Lateral area = (a + b) × 2 × c.'), `(${F(a)} + ${F(b)}) × 2 × ${c} = ${F(sxq)} (m²).`); }],
          [3, 9, rng => { const a = R(rng, 5, 30), b = R(rng, 3, a - 1), c = R(rng, 2, 20), stp = (a + b) * 2 * c + 2 * a * b; return Q(L(`Người ta sơn toàn bộ mặt ngoài của một cái hộp có nắp dạng hình hộp chữ nhật dài ${a} cm, rộng ${b} cm, cao ${c} cm. Tính diện tích được sơn.`, `The whole outside of a box with a lid is painted. The box is a cuboid ${a} cm long, ${b} cm wide and ${c} cm high. Find the painted area.`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: c } }), num(stp, 'cm²'), L('Hộp có nắp: sơn cả 6 mặt, tức là diện tích toàn phần.', 'A box with a lid: all 6 faces are painted, so this is the total surface area.'), L(`Sxq = (${a} + ${b}) × 2 × ${c} = ${F((a + b) * 2 * c)}; Stp = ${F((a + b) * 2 * c)} + ${a} × ${b} × 2 = ${F(stp)} (cm²).`, `Lateral area = (${a} + ${b}) × 2 × ${c} = ${F((a + b) * 2 * c)}; total area = ${F((a + b) * 2 * c)} + ${a} × ${b} × 2 = ${F(stp)} (cm²).`)); }],
        ])),
      lesson(9, 51, L('Diện tích xung quanh và diện tích toàn phần của hình lập phương', 'Lateral and total surface area of a cube'),
        L('Rô-bốt ISA sơn những khối gỗ lập phương làm đồ chơi cho các em mẫu giáo.', 'ISA the robot paints wooden cubes to make toys for the children at the nursery school.'),
        [
          { text: L('Hình lập phương cạnh a: Sxq = a × a × 4; Stp = a × a × 6.', 'A cube with edge a: lateral area = a × a × 4; total surface area = a × a × 6.'), visual: vz('solid', { kind: 'cube', dims: { a: 4 } }) },
        ],
        more(function (rng, i) {
          const a = R(rng, 2, lv(i) === 0 ? 10 : 30), f = i % 3;
          if (f === 0) return Q(L(`Tính diện tích xung quanh của hình lập phương có cạnh ${a} cm.`, `Find the lateral surface area of a cube with ${a} cm edges.`), vz('solid', { kind: 'cube', dims: { a } }), num(a * a * 4, 'cm²'), L('Sxq = cạnh × cạnh × 4.', 'Lateral area = edge × edge × 4.'), `${a} × ${a} × 4 = ${F(a * a * 4)} (cm²).`);
          if (f === 1) return Q(L(`Tính diện tích toàn phần của hình lập phương có cạnh ${a} cm.`, `Find the total surface area of a cube with ${a} cm edges.`), vz('solid', { kind: 'cube', dims: { a } }), num(a * a * 6, 'cm²'), L('Stp = cạnh × cạnh × 6.', 'Total area = edge × edge × 6.'), `${a} × ${a} × 6 = ${F(a * a * 6)} (cm²).`);
          const x = dec(R(rng, 11, 29), 1);
          return Q(L(`Một hình lập phương có cạnh ${F(x)} m. Tính diện tích toàn phần.`, `A cube has ${F(x)} m edges. Find its total surface area.`), vz('solid', { kind: 'cube', dims: { a: x, unit: 'm' } }), num(rd(x * x * 6), 'm²'), L('Stp = cạnh × cạnh × 6.', 'Total area = edge × edge × 6.'), `${F(x)} × ${F(x)} × 6 = ${F(rd(x * x * 6))} (m²).`);
        }, [
          [0, 6, rng => { const a = R(rng, 2, 15), S = a * a, t = R(rng, 0, 1) === 1; return Q(L(`Một hình lập phương có diện tích một mặt là ${S} cm². Tính diện tích ${t ? 'toàn phần' : 'xung quanh'} của hình lập phương đó.`, `One face of a cube has an area of ${S} cm². Find the ${t ? 'total' : 'lateral'} surface area of the cube.`), vz('solid', { kind: 'cube' }), num(S * (t ? 6 : 4), 'cm²'), t ? L('Stp = diện tích một mặt × 6.', 'Total area = area of one face × 6.') : L('Sxq = diện tích một mặt × 4.', 'Lateral area = area of one face × 4.'), `${S} × ${t ? 6 : 4} = ${F(S * (t ? 6 : 4))} (cm²).`); }],
          [3, 9, rng => { const a = R(rng, 3, 30); return Q(L(`Một cái thùng không có nắp dạng hình lập phương có cạnh ${a} dm. Tính diện tích tôn dùng để làm thùng (không tính mép hàn).`, `A tin box with no lid is a cube with ${a} dm edges. Find the area of tin used to make it (do not count the joins).`), vz('solid', { kind: 'cube', dims: { a, unit: 'dm' } }), num(a * a * 5, 'dm²'), L('Thùng không nắp gồm 5 mặt.', 'A box with no lid has 5 faces.'), `${a} × ${a} × 5 = ${F(a * a * 5)} (dm²).`); }],
          [0, 9, rng => { const a = R(rng, 2, 20), sxq = a * a * 4, stp = a * a * 6, t = R(rng, 0, 1) === 1; return Q(L(`Diện tích ${t ? 'toàn phần' : 'xung quanh'} của hình lập phương cạnh ${a} cm là:`, `The ${t ? 'total' : 'lateral'} surface area of a cube with ${a} cm edges is:`), vz('solid', { kind: 'cube', dims: { a } }), ch(rng, `${F(t ? stp : sxq)} cm²`, [`${F(t ? sxq : stp)} cm²`, `${F(a * 4)} cm²`, `${F(a * a * a)} cm²`]), t ? L('Stp = cạnh × cạnh × 6.', 'Total area = edge × edge × 6.') : L('Sxq = cạnh × cạnh × 4.', 'Lateral area = edge × edge × 4.'), `${a} × ${a} × ${t ? 6 : 4} = ${F(t ? stp : sxq)} (cm²).`); }],
          [6, 9, rng => { const a = R(rng, 2, 10); return Q(L(`Một hình lập phương có diện tích toàn phần là ${a * a * 6} cm². Tính cạnh của hình lập phương.`, `A cube has a total surface area of ${a * a * 6} cm². Find the length of its edge.`), vz('solid', { kind: 'cube' }), num(a, 'cm'), L('Diện tích một mặt = Stp : 6; rồi tìm số nhân với chính nó bằng diện tích một mặt.', 'Area of one face = total area : 6. Then find the number that, multiplied by itself, gives the area of one face.'), L(`Một mặt: ${a * a * 6} : 6 = ${a * a} (cm²). Vì ${a} × ${a} = ${a * a} nên cạnh là ${a} cm.`, `One face: ${a * a * 6} : 6 = ${a * a} (cm²). Because ${a} × ${a} = ${a * a}, the edge is ${a} cm.`)); }],
          [6, 9, rng => { const k = R(rng, 2, 4); return Q(L(`Nếu cạnh của một hình lập phương gấp lên ${k} lần thì diện tích xung quanh của nó gấp lên mấy lần?`, `If the edge of a cube becomes ${k} times as long, how many times bigger does its lateral surface area become?`), vz('solid', { kind: 'cube' }), num(k * k), L('Diện tích một mặt = cạnh × cạnh.', 'Area of one face = edge × edge.'), L(`Cạnh gấp ${k} lần thì diện tích mỗi mặt gấp ${k} × ${k} = ${k * k} lần, nên Sxq gấp ${k * k} lần.`, `The edge is ${k} times as long, so the area of each face is ${k} × ${k} = ${k * k} times bigger, and the lateral area is ${k * k} times bigger.`)); }],
        ])),
      lesson(9, 52, L('Thể tích của hình hộp chữ nhật', 'Volume of a cuboid'),
        L('Rô-bốt ISA tính lượng nước cần đổ đầy chiếc bể cá của lớp.', 'ISA the robot works out how much water is needed to fill the class fish tank.'),
        [
          { text: L('Thể tích hình hộp chữ nhật = chiều dài × chiều rộng × chiều cao (cùng đơn vị đo): V = a × b × c.', 'Volume of a cuboid = length × width × height (in the same unit): V = a × b × c.'), visual: vz('cubes', { l: 4, w: 3, h: 2 }) },
          { text: L('Ví dụ: 4 × 3 × 2 = 24 (cm³).', 'For example: 4 × 3 × 2 = 24 (cm³).') },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const l = R(rng, 2, 5), w = R(rng, 1, 4), h = R(rng, 1, 4); return Q(L(`Tính thể tích hình hộp chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm, chiều cao ${h} cm.`, `Find the volume of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high.`), vz('cubes', { l, w, h }), num(l * w * h, 'cm³'), L('V = dài × rộng × cao.', 'V = length × width × height.'), `${l} × ${w} × ${h} = ${l * w * h} (cm³).`); }
          if (f === 1) { const a = R(rng, 5, 40), b = R(rng, 3, 30), c = R(rng, 2, 20); return Q(L(`Một hình hộp chữ nhật dài ${a} dm, rộng ${b} dm, cao ${c} dm. Tính thể tích.`, `A cuboid is ${a} dm long, ${b} dm wide and ${c} dm high. Find its volume.`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: c, unit: 'dm' } }), num(a * b * c, 'dm³'), 'V = a × b × c.', `${a} × ${b} × ${c} = ${F(a * b * c)} (dm³).`); }
          const a = R(rng, 1, 3), b = R(rng, 4, 9), c = R(rng, 3, 8);
          return Q(L(`Một bể nước dạng hình hộp chữ nhật dài ${a} m, rộng ${b} dm, cao ${c} dm. Bể chứa được nhiều nhất bao nhiêu lít nước? (1 dm³ = 1 l)`, `A water tank is a cuboid ${a} m long, ${b} dm wide and ${c} dm high. How many litres of water can it hold at most? (1 dm³ = 1 l)`), vz('solid', { kind: 'box', dims: { l: a * 10, w: b, h: c, unit: 'dm' } }), num(a * 10 * b * c, 'l'), L(`Đổi ${a} m = ${a * 10} dm rồi tính thể tích theo dm³.`, `Change ${a} m to ${a * 10} dm, then work out the volume in dm³.`), `${a * 10} × ${b} × ${c} = ${F(a * 10 * b * c)} (dm³) = ${F(a * 10 * b * c)} l.`);
        }, [
          [3, 9, rng => { const a = R(rng, 1, 5), b = R(rng, 2, 9), c = R(rng, 2, 9); return Q(L(`Một hình hộp chữ nhật có chiều dài ${a} dm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính thể tích hình hộp chữ nhật theo xăng-ti-mét khối.`, `A cuboid is ${a} dm long, ${b} cm wide and ${c} cm high. Find its volume in cubic centimetres.`), vz('solid', { kind: 'box', dims: { l: a * 10, w: b, h: c } }), num(a * 10 * b * c, 'cm³'), L(`Đổi về cùng đơn vị: ${a} dm = ${a * 10} cm.`, `Change to the same unit: ${a} dm = ${a * 10} cm.`), `${a * 10} × ${b} × ${c} = ${F(a * 10 * b * c)} (cm³).`); }],
          [6, 9, rng => { const a = R(rng, 4, 15), b = R(rng, 2, a - 1), c = R(rng, 2, 12), V = a * b * c; return Q(L(`Một hình hộp chữ nhật có thể tích ${F(V)} cm³, chiều dài ${a} cm, chiều rộng ${b} cm. Tính chiều cao.`, `A cuboid has a volume of ${F(V)} cm³, a length of ${a} cm and a width of ${b} cm. Find its height.`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: '?' } }), num(c, 'cm'), L('Chiều cao = thể tích : (chiều dài × chiều rộng).', 'Height = volume : (length × width).'), `${F(V)} : (${a} × ${b}) = ${F(V)} : ${a * b} = ${c} (cm).`); }],
          [6, 9, rng => { const a = dec(R(rng, 12, 30), 1), b = dec(R(rng, 5, 10), 1), c = dec(P(rng, [5, 10, 20]), 1), V = rd(a * b * c); return Q(L(`Tính thể tích hình hộp chữ nhật có chiều dài ${F(a)} m, chiều rộng ${F(b)} m, chiều cao ${F(c)} m.`, `Find the volume of a cuboid ${F(a)} m long, ${F(b)} m wide and ${F(c)} m high.`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: c, unit: 'm' } }), num(V, 'm³'), 'V = a × b × c.', `${F(a)} × ${F(b)} × ${F(c)} = ${F(V)} (m³).`); }],
          [0, 9, rng => { const a = R(rng, 3, 12), b = R(rng, 2, a - 1), c = R(rng, 2, 10), V = a * b * c; return Q(L(`Thể tích hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm là:`, `The volume of a cuboid ${a} cm long, ${b} cm wide and ${c} cm high is:`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: c } }), ch(rng, `${F(V)} cm³`, [`${F((a + b) * 2 * c)} cm³`, `${F(V)} cm²`, `${F(a * b + c)} cm³`]), L('V = dài × rộng × cao; đơn vị là cm³.', 'V = length × width × height; the unit is cm³.'), `${a} × ${b} × ${c} = ${F(V)} (cm³).`); }],
          [3, 9, rng => { const a = R(rng, 5, 12), b = R(rng, 3, a - 1), h = R(rng, 2, 6); return Q(L(`Một bể kính dạng hình hộp chữ nhật dài ${a} dm, rộng ${b} dm. Mực nước trong bể cao ${h} dm. Hỏi trong bể có bao nhiêu lít nước? (1 dm³ = 1 l)`, `A glass tank is a cuboid ${a} dm long and ${b} dm wide. The water in it is ${h} dm deep. How many litres of water are in the tank? (1 dm³ = 1 l)`), vz('solid', { kind: 'box', dims: { l: a, w: b, h: h + 2, unit: 'dm' } }), num(a * b * h, 'l'), L('Thể tích nước = dài × rộng × chiều cao mực nước.', 'Volume of water = length × width × depth of the water.'), `${a} × ${b} × ${h} = ${a * b * h} (dm³) = ${a * b * h} l.`); }],
        ])),
      lesson(9, 53, L('Thể tích của hình lập phương', 'Volume of a cube'),
        L('Rô-bốt ISA xếp những khối rubik thành một khối lập phương lớn.', 'ISA the robot stacks Rubik\'s cubes to make one big cube.'),
        [
          { text: L('Thể tích hình lập phương = cạnh × cạnh × cạnh: V = a × a × a.', 'Volume of a cube = edge × edge × edge: V = a × a × a.'), visual: vz('cubes', { l: 3, w: 3, h: 3 }) },
          { text: L('Cạnh 3 cm: V = 3 × 3 × 3 = 27 (cm³).', 'With 3 cm edges: V = 3 × 3 × 3 = 27 (cm³).') },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const a = R(rng, 1, 4); return Q(L(`Tính thể tích hình lập phương có cạnh ${a} cm.`, `Find the volume of a cube with ${a} cm edges.`), vz('cubes', { l: a, w: a, h: a }), num(a * a * a, 'cm³'), L('V = cạnh × cạnh × cạnh.', 'V = edge × edge × edge.'), `${a} × ${a} × ${a} = ${a * a * a} (cm³).`); }
          if (f === 1) { const a = R(rng, 5, 30); return Q(L(`Một khối gỗ hình lập phương có cạnh ${a} cm. Tính thể tích khối gỗ.`, `A wooden block is a cube with ${a} cm edges. Find the volume of the block.`), vz('solid', { kind: 'cube', dims: { a } }), num(a * a * a, 'cm³'), 'V = a × a × a.', `${a} × ${a} × ${a} = ${F(a * a * a)} (cm³).`); }
          const x = dec(R(rng, 11, 25), 1);
          return Q(L(`Tính thể tích hình lập phương có cạnh ${F(x)} m.`, `Find the volume of a cube with ${F(x)} m edges.`), vz('solid', { kind: 'cube', dims: { a: x, unit: 'm' } }), num(rd(x * x * x), 'm³'), 'V = a × a × a.', `${F(x)} × ${F(x)} × ${F(x)} = ${F(rd(x * x * x))} (m³).`);
        }, [
          [3, 9, rng => { const a = R(rng, 1, 10); return Q(L(`Một hình lập phương có thể tích ${F(a * a * a)} cm³. Cạnh của hình lập phương dài bao nhiêu xăng-ti-mét?`, `A cube has a volume of ${F(a * a * a)} cm³. How many centimetres long is its edge?`), vz('solid', { kind: 'cube' }), num(a, 'cm'), L('Tìm số nhân với chính nó 3 lần bằng thể tích.', 'Find the number that, multiplied by itself and then by itself again, gives the volume.'), L(`${a} × ${a} × ${a} = ${F(a * a * a)} nên cạnh dài ${a} cm.`, `${a} × ${a} × ${a} = ${F(a * a * a)}, so the edge is ${a} cm long.`)); }],
          [6, 9, rng => { const k = R(rng, 2, 4); return Q(L(`Nếu cạnh của một hình lập phương gấp lên ${k} lần thì thể tích của nó gấp lên mấy lần?`, `If the edge of a cube becomes ${k} times as long, how many times bigger does its volume become?`), vz('cubes', { l: k, w: k, h: k }), num(k * k * k), L('V = cạnh × cạnh × cạnh.', 'V = edge × edge × edge.'), L(`Thể tích gấp ${k} × ${k} × ${k} = ${k * k * k} lần.`, `The volume is ${k} × ${k} × ${k} = ${k * k * k} times bigger.`)); }],
          [3, 9, rng => { const a = R(rng, 2, 12); return Q(L(`Một cái thùng dạng hình lập phương có cạnh ${a} dm. Thùng chứa được nhiều nhất bao nhiêu lít nước? (1 dm³ = 1 l)`, `A container is a cube with ${a} dm edges. How many litres of water can it hold at most? (1 dm³ = 1 l)`), vz('solid', { kind: 'cube', dims: { a, unit: 'dm' } }), num(a * a * a, 'l'), L('Tính thể tích theo dm³ rồi đổi: 1 dm³ = 1 l.', 'Work out the volume in dm³, then change it: 1 dm³ = 1 l.'), `${a} × ${a} × ${a} = ${F(a * a * a)} (dm³) = ${F(a * a * a)} l.`); }],
          [0, 9, rng => { const a = R(rng, 2, 15), V = a * a * a; return Q(L(`Thể tích hình lập phương cạnh ${a} cm là:`, `The volume of a cube with ${a} cm edges is:`), vz('solid', { kind: 'cube', dims: { a } }), ch(rng, `${F(V)} cm³`, [`${F(a * a * 6)} cm³`, `${F(a * 3)} cm³`, `${F(a * a)} cm³`]), L('V = cạnh × cạnh × cạnh.', 'V = edge × edge × edge.'), `${a} × ${a} × ${a} = ${F(V)} (cm³).`); }],
          [6, 9, rng => { const a = R(rng, 3, 9), l = R(rng, 2, 12), w = R(rng, 2, 9), h = R(rng, 2, 9), V1 = a * a * a, V2 = l * w * h, C1 = L('Hình lập phương', 'The cube'), C2 = L('Hình hộp chữ nhật', 'The cuboid'), C3 = L('Hai hình có thể tích bằng nhau', 'They have the same volume'); return Q(L(`Hình lập phương có cạnh ${a} cm. Hình hộp chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm, chiều cao ${h} cm. Hình nào có thể tích lớn hơn?`, `A cube has ${a} cm edges. A cuboid is ${l} cm long, ${w} cm wide and ${h} cm high. Which has the bigger volume?`), null, ch(rng, V1 > V2 ? C1 : V1 < V2 ? C2 : C3, [C1, C2, C3]), L('Tính thể tích từng hình rồi so sánh.', 'Work out the volume of each solid, then compare.'), L(`Hình lập phương: ${F(V1)} cm³; hình hộp chữ nhật: ${l} × ${w} × ${h} = ${F(V2)} cm³.`, `Cube: ${F(V1)} cm³; cuboid: ${l} × ${w} × ${h} = ${F(V2)} cm³.`)); }],
          [3, 9, rng => { const x = R(rng, 11, 19), d = dec(x, 1); return Q(L(`Một hình lập phương có cạnh ${F(d)} dm. Tính thể tích hình lập phương đó theo xăng-ti-mét khối.`, `A cube has ${F(d)} dm edges. Find its volume in cubic centimetres.`), vz('solid', { kind: 'cube', dims: { a: d, unit: 'dm' } }), num(x * x * x, 'cm³'), L(`Đổi ${F(d)} dm = ${x} cm rồi tính.`, `Change ${F(d)} dm to ${x} cm, then calculate.`), L(`${F(d)} dm = ${x} cm; ${x} × ${x} × ${x} = ${F(x * x * x)} (cm³).`, `${F(d)} dm = ${x} cm; ${x} × ${x} × ${x} = ${F(x * x * x)} (cm³).`)); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 10. SỐ ĐO THỜI GIAN, VẬN TỐC. CÁC BÀI TOÁN LIÊN QUAN ĐẾN CHUYỂN ĐỘNG ĐỀU ============
  // Amounts of time: "2 giờ 15 phút" / "2 hours 15 minutes".
  const hm = (h, m) => (EN ? (h && m ? `${pl(h, 'hour')} ${pl(m, 'minute')}` : h ? pl(h, 'hour') : pl(m, 'minute'))
    : (h && m ? `${h} giờ ${m} phút` : h ? `${h} giờ` : `${m} phút`));
  // Times of day: Vietnamese keeps "7 giờ 30 phút", English uses the clock form "7:30".
  const clk = (h, m) => (EN ? `${h}:${String(m).padStart(2, '0')}` : hm(h, m));
  const ord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th');
  // Choice of time amounts given in small units (minutes by default). Every option is written in
  // carried form (small part < base) and is a different amount, so no distractor equals the key.
  function timeCh(rng, ans, wrongs, base, fmt) {
    const b = base || 60, f = fmt || hm, show = t => f(Math.floor(t / b), t % b);
    const pool = wrongs.concat([ans + 2 * b, ans + 5, ans - 5, ans + 10]).filter(t => Number.isInteger(t) && t > 0 && t !== ans);
    return ch(rng, show(ans), pool.filter((t, k) => pool.indexOf(t) === k).map(show));
  }
  const VEH = [['car', L('Một ô tô', 'A car'), L('ô tô', 'car')], ['bike', L('Một người đi xe đạp', 'A cyclist'), L('xe đạp', 'bicycle')], ['boat', L('Một ca nô', 'A motorboat'), L('ca nô', 'motorboat')], ['walk', L('Một người đi bộ', 'A walker'), L('người đi bộ', 'walker')]];
  const vRange = { car: [35, 70], bike: [10, 18], boat: [20, 40], walk: [4, 6] };
  const KMH = L('km/giờ', 'km/h'), MS = L('m/giây', 'm/s'), HRS = L('giờ', 'hours'), MINS = L('phút', 'minutes');
  const c10 = {
    id: 'g5-c10', semester: 2, title: L('Số đo thời gian, vận tốc. Các bài toán liên quan đến chuyển động đều', 'Time and speed. Problems about uniform motion'), icon: '🚗', lessons: [
      lesson(10, 56, L('Các đơn vị đo thời gian', 'Units of time'),
        L('Rô-bốt ISA cùng bạn Trang tính xem từ khi trường được xây đến nay đã bao nhiêu năm.', 'ISA the robot and Trang work out how many years ago their school was built.'),
        [
          { text: L('1 thế kỉ = 100 năm; 1 năm = 12 tháng; 1 năm thường có 365 ngày, năm nhuận có 366 ngày.', '1 century = 100 years; 1 year = 12 months; a normal year has 365 days and a leap year has 366 days.') },
          { text: L('1 tuần = 7 ngày; 1 ngày = 24 giờ; 1 giờ = 60 phút; 1 phút = 60 giây. 1,5 giờ = 90 phút.', '1 week = 7 days; 1 day = 24 hours; 1 hour = 60 minutes; 1 minute = 60 seconds. 1,5 hours = 90 minutes.'), visual: vz('clock', { h: 1, m: 30 }) },
        ],
        more(function (rng, i) {
          const a = R(rng, 2, 9), f = i % 3;
          if (f === 0) { const [p, v, u] = P(rng, [[L(`${a} năm = ? tháng`, `${a} years = ? months`), a * 12, L('tháng', 'months')], [L(`${a} ngày = ? giờ`, `${a} days = ? hours`), a * 24, HRS], [L(`${a} giờ = ? phút`, `${a} hours = ? minutes`), a * 60, MINS], [L(`${a} phút = ? giây`, `${a} minutes = ? seconds`), a * 60, L('giây', 'seconds')], [L(`${a} tuần = ? ngày`, `${a} weeks = ? days`), a * 7, L('ngày', 'days')]]); return Q(p, null, num(v, u), L('Nhớ bảng đơn vị đo thời gian.', 'Remember the table of units of time.'), `${p.replace('?', F(v))}.`); }
          if (f === 1) { const [p, v, u] = P(rng, [[L(`${F(dec(a * 10 + 5, 1))} giờ = ? phút`, `${F(dec(a * 10 + 5, 1))} hours = ? minutes`), (a * 10 + 5) * 6, MINS], [L('0,5 ngày = ? giờ', '0,5 days = ? hours'), 12, HRS], [L(`${F(dec(a, 1))} giờ = ? phút`, `${F(dec(a, 1))} hours = ? minutes`), a * 6, MINS], [L(`${a * 30} phút = ? giờ`, `${a * 30} minutes = ? hours`), dec(a * 5, 1), HRS], [L('1/4 giờ = ? phút', '1/4 hour = ? minutes'), 15, MINS]]); return Q(p, null, num(v, u), L('1 giờ = 60 phút; 1 ngày = 24 giờ.', '1 hour = 60 minutes; 1 day = 24 hours.'), `${p.replace('?', F(v)).replace(/= 1 hours$/, '= 1 hour')}.`); }
          const y = P(rng, [2024, 2025, 2026, 2027, 2028, 2032, 2100, 2000]); const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
          return Q(L(`Năm ${y} có bao nhiêu ngày?`, `How many days are there in the year ${y}?`), vz('calendar', { year: y, month: 2 }), num(leap ? 366 : 365, L('ngày', 'days')), L('Năm nhuận (tháng 2 có 29 ngày) có 366 ngày; năm thường có 365 ngày.', 'A leap year (when February has 29 days) has 366 days; a normal year has 365 days.'), L(`Tháng 2 năm ${y} có ${leap ? 29 : 28} ngày nên năm ${y} có ${leap ? 366 : 365} ngày.`, `February ${y} has ${leap ? 29 : 28} days, so the year ${y} has ${leap ? 366 : 365} days.`));
        }, [
          [0, 9, rng => { const ROM = n => { let s = '', x = n; for (const [v, c] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (x >= v) { s += c; x -= v; } return s; }; const y = P(rng, [938, 1010, 1288, 1428, 1789, 1858, 1890, 1945, 1975, 2000, 2026, 2045, R(rng, 1001, 2099)]), c = Math.floor((y - 1) / 100) + 1; const CEN = n => L(`Thế kỉ ${ROM(n)}`, `The ${ord(n)} century`); return Q(L(`Năm ${y} thuộc thế kỉ nào?`, `Which century is the year ${y} in?`), null, ch(rng, CEN(c), [CEN(c - 1), CEN(c + 1), CEN(c >= 20 ? c - 2 : c + 2)]), L('Từ năm 1 đến năm 100 là thế kỉ I; từ năm 101 đến năm 200 là thế kỉ II; …; từ năm 2001 đến năm 2100 là thế kỉ XXI.', 'The years 1 to 100 are the 1st century; the years 101 to 200 are the 2nd century; …; the years 2001 to 2100 are the 21st century.'), L(`Năm ${y} thuộc thế kỉ ${ROM(c)} (thế kỉ thứ ${c}).`, `The year ${y} is in the ${ord(c)} century.`)); }],
          [0, 6, rng => { const a = R(rng, 2, 9); const [p, v, u] = P(rng, [[L(`${a * 12} tháng = ? năm`, `${a * 12} months = ? years`), a, L('năm', 'years')], [L(`${a * 24} giờ = ? ngày`, `${a * 24} hours = ? days`), a, L('ngày', 'days')], [L(`${a * 60} phút = ? giờ`, `${a * 60} minutes = ? hours`), a, HRS], [L(`${a * 60} giây = ? phút`, `${a * 60} seconds = ? minutes`), a, MINS], [L(`${a * 7} ngày = ? tuần`, `${a * 7} days = ? weeks`), a, L('tuần', 'weeks')], [L(`${a} thế kỉ = ? năm`, `${a} centuries = ? years`), a * 100, L('năm', 'years')]]); return Q(p, null, num(v, u), L('Nhớ: 1 năm = 12 tháng; 1 ngày = 24 giờ; 1 giờ = 60 phút; 1 phút = 60 giây; 1 tuần = 7 ngày; 1 thế kỉ = 100 năm.', 'Remember: 1 year = 12 months; 1 day = 24 hours; 1 hour = 60 minutes; 1 minute = 60 seconds; 1 week = 7 days; 1 century = 100 years.'), `${p.replace('?', F(v))}.`); }],
          [3, 9, rng => { const h = R(rng, 1, 5), m = R(rng, 1, 59), big = R(rng, 0, 1) === 1; if (big) return Q(L(`${h} giờ ${m} phút = ? phút`, `${hm(h, m)} = ? minutes`), null, num(h * 60 + m, MINS), L('1 giờ = 60 phút.', '1 hour = 60 minutes.'), L(`${h} × 60 + ${m} = ${h * 60 + m} (phút).`, `${h} × 60 + ${m} = ${h * 60 + m} (minutes).`)); const d = R(rng, 1, 4), hh = R(rng, 1, 23); return Q(L(`${d} ngày ${hh} giờ = ? giờ`, `${pl(d, 'day')} ${pl(hh, 'hour')} = ? hours`), null, num(d * 24 + hh, HRS), L('1 ngày = 24 giờ.', '1 day = 24 hours.'), L(`${d} × 24 + ${hh} = ${d * 24 + hh} (giờ).`, `${d} × 24 + ${hh} = ${d * 24 + hh} (hours).`)); }],
          [3, 9, rng => { const a = R(rng, 1, 4), b = a * 60 + P(rng, [-15, -5, 0, 10, 20]); return Q(L(`So sánh: ${a} giờ … ${b} phút`, `Compare: ${pl(a, 'hour')} … ${b} minutes`), vz('compare', { left: L(`${a} giờ`, pl(a, 'hour')), right: L(`${b} phút`, `${b} minutes`) }), cmpAns(a * 60, b), L('Đổi giờ ra phút rồi so sánh.', 'Change the hours into minutes, then compare.'), L(`${a} giờ = ${a * 60} phút; ${a * 60} ${sign(a * 60, b)} ${b}.`, `${pl(a, 'hour')} = ${a * 60} minutes; ${a * 60} ${sign(a * 60, b)} ${b}.`)); }],
          [6, 9, rng => { const t = R(rng, 100, 299), H = Math.floor(t / 60), Mi = t % 60; if (Mi === 0) return Q(L(`${t} phút = ? giờ`, `${t} minutes = ? hours`), null, num(H, HRS), L('60 phút = 1 giờ.', '60 minutes = 1 hour.'), `${t} : 60 = ${H}.`); return Q(L(`${t} phút = … giờ … phút`, `${t} minutes = … hours … minutes`), null, timeCh(rng, t, [t + 60, t - 60, t + 10]), L('Lấy số phút chia cho 60: thương là số giờ, số dư là số phút.', 'Divide the number of minutes by 60: the quotient is the hours and the remainder is the minutes.'), L(`${t} : 60 = ${H} (dư ${Mi}). Vậy ${t} phút = ${H} giờ ${Mi} phút.`, `${t} : 60 = ${H} (remainder ${Mi}). So ${t} minutes = ${hm(H, Mi)}.`)); }],
        ])),
      lesson(10, 57, L('Cộng, trừ số đo thời gian', 'Adding and subtracting time'),
        L('Rô-bốt ISA tính thời gian chuyến xe khách từ Hà Nội về quê bạn Việt.', 'ISA the robot works out how long the coach journey from Hà Nội to Việt\'s home town takes.'),
        [
          { text: L('Cộng: 2 giờ 45 phút + 1 giờ 30 phút = 3 giờ 75 phút = 4 giờ 15 phút (75 phút = 1 giờ 15 phút).', 'Adding: 2 hours 45 minutes + 1 hour 30 minutes = 3 hours 75 minutes = 4 hours 15 minutes (75 minutes = 1 hour 15 minutes).') },
          { text: L('Trừ: 5 giờ 20 phút − 2 giờ 45 phút: đổi 5 giờ 20 phút = 4 giờ 80 phút; 4 giờ 80 phút − 2 giờ 45 phút = 2 giờ 35 phút.', 'Subtracting: 5 hours 20 minutes − 2 hours 45 minutes: change 5 hours 20 minutes into 4 hours 80 minutes; 4 hours 80 minutes − 2 hours 45 minutes = 2 hours 35 minutes.') },
        ],
        more(function (rng, i) {
          const h1 = R(rng, 1, 9), m1 = R(rng, 1, 11) * 5, h2 = R(rng, 1, 5), m2 = R(rng, 1, 11) * 5, f = i % 3;
          if (f === 0 || f === 2) {
            const t = (h1 + h2) * 60 + m1 + m2, H = Math.floor(t / 60), Mi = t % 60;
            // forgot = carry dropped (the 60 minutes vanish): a different, carried time.
            const forgot = (h1 + h2) * 60 + (m1 + m2) % 60;
            if (f === 2) return Q(L(`Một xe khách khởi hành lúc ${hm(h1 + 5, m1)}, đi hết ${hm(h2, m2)}. Hỏi xe đến nơi lúc mấy giờ?`, `A coach leaves at ${clk(h1 + 5, m1)} and the journey takes ${hm(h2, m2)}. What time does it arrive?`), vz('clock', { h: (h1 + 5) % 12, m: m1 }), timeCh(rng, t + 300, [forgot + 300, t + 360, t + 315], 60, clk), L('Cộng giờ với giờ, phút với phút; nếu số phút ≥ 60 thì đổi ra giờ.', 'Add hours to hours and minutes to minutes. If there are 60 minutes or more, change them into hours.'), `${clk(h1 + 5, m1)} + ${hm(h2, m2)} = ${clk(H + 5, Mi)}.`);
            return Q(`${hm(h1, m1)} + ${hm(h2, m2)} = ?`, null, timeCh(rng, t, [forgot, t + 60, t + 10]), L('Cộng giờ với giờ, phút với phút; số phút ≥ 60 thì đổi 60 phút = 1 giờ.', 'Add hours to hours and minutes to minutes. If there are 60 minutes or more, change 60 minutes into 1 hour.'), `${hm(h1, m1)} + ${hm(h2, m2)} = ${hm(h1 + h2, m1 + m2)}${m1 + m2 >= 60 ? ` = ${hm(H, Mi)}` : ''}.`);
          }
          const A = (h1 + 5) * 60 + m1, B = h2 * 60 + m2, t = A - B, H = Math.floor(t / 60), Mi = t % 60;
          // noBorrow = "smaller minutes from bigger" without borrowing an hour.
          const noBorrow = (h1 + 5 - h2) * 60 + Math.abs(m1 - m2);
          return Q(`${hm(h1 + 5, m1)} ${M} ${hm(h2, m2)} = ?`, null, timeCh(rng, t, [noBorrow, t + 60, t - 60, t + 10]), L('Trừ giờ với giờ, phút với phút; số phút không đủ trừ thì đổi 1 giờ = 60 phút.', 'Subtract hours from hours and minutes from minutes. If there are not enough minutes, change 1 hour into 60 minutes.'), `${hm(h1 + 5, m1)} ${M} ${hm(h2, m2)} = ${hm(H, Mi)}.`);
        }, [
          [0, 6, rng => { const m1 = R(rng, 1, 9), s1 = R(rng, 5, 55), m2 = R(rng, 1, 9), s2 = R(rng, 5, 55), t = (m1 + m2) * 60 + s1 + s2, Mm = Math.floor(t / 60), S = t % 60, fm = EN ? (m, s) => (m && s ? `${pl(m, 'minute')} ${pl(s, 'second')}` : m ? pl(m, 'minute') : pl(s, 'second')) : (m, s) => (m && s ? `${m} phút ${s} giây` : m ? `${m} phút` : `${s} giây`); return Q(L(`${m1} phút ${s1} giây + ${m2} phút ${s2} giây = ?`, `${fm(m1, s1)} + ${fm(m2, s2)} = ?`), null, timeCh(rng, t, [(m1 + m2) * 60 + S, t + 60, t + 10], 60, fm), L('Cộng phút với phút, giây với giây; nếu số giây ≥ 60 thì đổi 60 giây = 1 phút.', 'Add minutes to minutes and seconds to seconds. If there are 60 seconds or more, change 60 seconds into 1 minute.'), L(`${m1} phút ${s1} giây + ${m2} phút ${s2} giây = ${m1 + m2} phút ${s1 + s2} giây${s1 + s2 >= 60 ? ` = ${fm(Mm, S)}` : ''}.`, `${fm(m1, s1)} + ${fm(m2, s2)} = ${fm(m1 + m2, s1 + s2)}${s1 + s2 >= 60 ? ` = ${fm(Mm, S)}` : ''}.`)); }],
          [3, 9, rng => { const y1 = R(rng, 2, 9), mo1 = R(rng, 1, 11), y2 = R(rng, 1, 5), mo2 = R(rng, 1, 11), sub = R(rng, 0, 1) === 1, fy = EN ? (y, m) => (m ? `${pl(y, 'year')} ${pl(m, 'month')}` : pl(y, 'year')) : (y, m) => (m ? `${y} năm ${m} tháng` : `${y} năm`); const A = y1 * 12 + mo1 + (sub ? 72 : 0), B = y2 * 12 + mo2, t = sub ? A - B : A + B, Y = Math.floor(t / 12), Mo = t % 12; const left = fy(Math.floor(A / 12), A % 12); return Q(`${left} ${sub ? M : '+'} ${fy(y2, mo2)} = ?`, null, ch(rng, fy(Y, Mo), [fy(Y + 1, Mo), fy(Y, (Mo + 2) % 12 || 1), fy(Math.max(1, Y - 1), Mo)]), sub ? L('Trừ năm với năm, tháng với tháng; nếu không đủ tháng để trừ thì đổi 1 năm = 12 tháng.', 'Subtract years from years and months from months. If there are not enough months, change 1 year into 12 months.') : L('Cộng năm với năm, tháng với tháng; nếu số tháng ≥ 12 thì đổi 12 tháng = 1 năm.', 'Add years to years and months to months. If there are 12 months or more, change 12 months into 1 year.'), `${left} ${sub ? M : '+'} ${fy(y2, mo2)} = ${fy(Y, Mo)}.`); }],
          [3, 9, rng => { const h = R(rng, 1, 2), m = R(rng, 0, 11) * 5, sub = R(rng, 5, 11) * 5, tot = h * 60 + m; if (sub >= tot) return Q(L(`${hm(h, m)} + ${sub} phút = ? phút`, `${hm(h, m)} + ${sub} minutes = ? minutes`), null, num(tot + sub, MINS), L('Đổi giờ ra phút rồi cộng.', 'Change the hours into minutes, then add.'), L(`${hm(h, m)} = ${tot} phút; ${tot} + ${sub} = ${tot + sub} (phút).`, `${hm(h, m)} = ${tot} minutes; ${tot} + ${sub} = ${tot + sub} (minutes).`)); return Q(L(`${hm(h, m)} ${M} ${sub} phút = ? phút`, `${hm(h, m)} ${M} ${sub} minutes = ? minutes`), null, num(tot - sub, MINS), L('Đổi giờ ra phút rồi trừ.', 'Change the hours into minutes, then subtract.'), L(`${hm(h, m)} = ${tot} phút; ${tot} ${M} ${sub} = ${tot - sub} (phút).`, `${hm(h, m)} = ${tot} minutes; ${tot} ${M} ${sub} = ${tot - sub} (minutes).`)); }],
          [6, 9, rng => { const h1 = R(rng, 6, 10), m1 = R(rng, 0, 11) * 5, d = R(rng, 40, 200) , end = h1 * 60 + m1 + d - (d % 5), H = Math.floor(end / 60), Mi = end % 60, dur = end - h1 * 60 - m1, dh = Math.floor(dur / 60), dm = dur % 60; return Q(L(`Một chuyến tàu khởi hành lúc ${hm(h1, m1)} và đến nơi lúc ${hm(H, Mi)} cùng ngày. Hỏi chuyến tàu đi hết bao nhiêu thời gian?`, `A train leaves at ${clk(h1, m1)} and arrives at ${clk(H, Mi)} on the same day. How long does the journey take?`), null, timeCh(rng, dur, [dur + 60, dur + 10, (H - h1) * 60 + Math.abs(Mi - m1)]), L('Lấy thời điểm đến trừ thời điểm khởi hành.', 'Subtract the departure time from the arrival time.'), `${clk(H, Mi)} ${M} ${clk(h1, m1)} = ${hm(dh, dm)}.`); }],
        ])),
      lesson(10, 58, L('Nhân, chia số đo thời gian với một số', 'Multiplying and dividing time by a number'),
        L('Rô-bốt ISA tính thời gian bạn Lan cần để làm xong mấy bài tập thủ công.', 'ISA the robot works out how long Lan needs to finish a few craft projects.'),
        [
          { text: L('Nhân: 1 giờ 25 phút × 3 = 3 giờ 75 phút = 4 giờ 15 phút.', 'Multiplying: 1 hour 25 minutes × 3 = 3 hours 75 minutes = 4 hours 15 minutes.') },
          { text: L('Chia: 7 giờ 30 phút : 3 = 2 giờ 30 phút (7 giờ : 3 = 2 giờ dư 1 giờ = 60 phút; 60 + 30 = 90 phút; 90 : 3 = 30 phút).', 'Dividing: 7 hours 30 minutes : 3 = 2 hours 30 minutes (7 hours : 3 = 2 hours, remainder 1 hour = 60 minutes; 60 + 30 = 90 minutes; 90 : 3 = 30 minutes).') },
        ],
        function (rng, i) {
          const k = R(rng, 2, 5), f = i % 3;
          if (f === 0 || f === 2) {
            const h = R(rng, 1, 4), m = R(rng, 1, 11) * 5, t = (h * 60 + m) * k, H = Math.floor(t / 60), Mi = t % 60;
            // Wrong amounts, all written in carried form: carry dropped, only the hours multiplied, one hour too many.
            const wr = [h * k * 60 + (m * k) % 60, h * k * 60 + m, t + 60, t + 15];
            if (f === 2) return Q(L(`Mỗi sản phẩm làm hết ${hm(h, m)}. Hỏi làm ${k} sản phẩm như thế hết bao nhiêu thời gian?`, `It takes ${hm(h, m)} to make one item. How long does it take to make ${k} items like this?`), null, timeCh(rng, t, wr), L('Nhân số giờ, số phút với số đó; đổi phút ra giờ nếu ≥ 60.', 'Multiply the hours and the minutes by the number. Change the minutes into hours if there are 60 or more.'), `${hm(h, m)} × ${k} = ${hm(h * k, m * k)}${m * k >= 60 ? ` = ${hm(H, Mi)}` : ''}.`);
            return Q(`${hm(h, m)} × ${k} = ?`, null, timeCh(rng, t, wr), L('Nhân giờ với số đó, nhân phút với số đó, rồi đổi phút ra giờ nếu cần.', 'Multiply the hours by the number, then the minutes, and change minutes into hours if you need to.'), `${hm(h, m)} × ${k} = ${hm(h * k, m * k)}${m * k >= 60 ? ` = ${hm(H, Mi)}` : ''}.`);
          }
          const qh = R(rng, 1, 3), qm = R(rng, 1, 11) * 5, t = (qh * 60 + qm) * k, H = Math.floor(t / 60), Mi = t % 60;
          return Q(`${hm(H, Mi)} : ${k} = ?`, null, timeCh(rng, qh * 60 + qm, [Math.floor(H / k) * 60 + Math.floor(Mi / k), qh * 60 + qm + 60, qh * 60 + qm + 10]), L('Chia số giờ trước; số giờ dư đổi ra phút rồi cộng với số phút và chia tiếp.', 'Divide the hours first. Change any hours left over into minutes, add them to the minutes and carry on dividing.'), `${hm(H, Mi)} : ${k} = ${hm(qh, qm)}.`);
        }),
      lesson(10, 59, L('Vận tốc của một chuyển động đều', 'Speed'),
        L('Rô-bốt ISA đo xem chiếc ô tô của bố bạn Nam đi được bao nhiêu ki-lô-mét mỗi giờ.', 'ISA the robot measures how many kilometres Nam\'s dad\'s car travels each hour.'),
        [
          { text: L('Vận tốc là quãng đường đi được trong một đơn vị thời gian: v = s : t. Ô tô đi 120 km trong 3 giờ: v = 120 : 3 = 40 (km/giờ).', 'Speed is the distance travelled in one unit of time: v = s : t. A car travels 120 km in 3 hours: v = 120 : 3 = 40 (km/h).'), visual: vz('motion', { speed: 40, unit: KMH, time: 3, distance: 120, vehicle: 'car' }) },
          { text: L('Đơn vị vận tốc: km/giờ, m/phút, m/giây.', 'Units of speed: km/h, m/min, m/s.') },
        ],
        function (rng, i) {
          const [veh, name] = P(rng, VEH), [lo, hi] = vRange[veh], v = R(rng, lo, hi), f = i % 3;
          if (f === 0) { const t = R(rng, 2, 5), s = v * t; return Q(L(`${name} đi được ${s} km trong ${t} giờ. Tính vận tốc.`, `${name} travels ${s} km in ${t} hours. Find the speed.`), vz('motion', { speed: '?', unit: KMH, time: t, distance: s, vehicle: veh }), num(v, KMH), 'v = s : t.', `${s} : ${t} = ${v} (${KMH}).`); }
          if (f === 1) { const t = dec(R(rng, 3, 9) * 5, 1), v2 = v % 2 ? v + 1 : v, s = rd(v2 * t); return Q(L(`${name} đi quãng đường ${F(s)} km hết ${F(t)} giờ. Tính vận tốc.`, `${name} travels ${F(s)} km in ${F(t)} hours. Find the speed.`), vz('motion', { speed: '?', unit: KMH, time: t, distance: s, vehicle: veh }), num(v2, KMH), 'v = s : t.', `${F(s)} : ${F(t)} = ${v2} (${KMH}).`); }
          const sec = R(rng, 10, 25), m = sec * R(rng, 4, 8);
          return Q(L(`Một vận động viên chạy ${m} m trong ${sec} giây. Tính vận tốc chạy (m/giây).`, `A runner runs ${m} m in ${sec} seconds. Find the running speed (m/s).`), vz('motion', { speed: '?', unit: MS, distance: m, vehicle: 'walk' }), num(m / sec, MS), 'v = s : t.', `${m} : ${sec} = ${m / sec} (${MS}).`);
        }),
      lesson(10, 60, L('Quãng đường, thời gian của một chuyển động đều', 'Distance and time'),
        L('Rô-bốt ISA tính giờ đến nơi cho chuyến ca nô thăm Tràng An cùng gia đình bạn Hà.', 'ISA the robot works out the arrival time of a motorboat trip to Tràng An with Hà\'s family.'),
        [
          { text: L('Quãng đường: s = v × t. Ca nô đi với vận tốc 30 km/giờ trong 2 giờ: s = 30 × 2 = 60 (km).', 'Distance: s = v × t. A motorboat travels at 30 km/h for 2 hours: s = 30 × 2 = 60 (km).'), visual: vz('motion', { speed: 30, unit: KMH, time: 2, distance: 60, vehicle: 'boat' }) },
          { text: L('Thời gian: t = s : v. Đi 60 km với vận tốc 30 km/giờ: t = 60 : 30 = 2 (giờ).', 'Time: t = s : v. Travelling 60 km at 30 km/h: t = 60 : 30 = 2 (hours).') },
        ],
        function (rng, i) {
          const [veh, name] = P(rng, VEH), [lo, hi] = vRange[veh], v0 = R(rng, lo, hi), v = v0 % 2 ? v0 + 1 : v0, f = i % 4;
          if (f === 0) { const t = R(rng, 2, 5); return Q(L(`${name} đi với vận tốc ${v} km/giờ trong ${t} giờ. Tính quãng đường đi được.`, `${name} travels at ${v} km/h for ${t} hours. Find the distance travelled.`), vz('motion', { speed: v, unit: KMH, time: t, distance: '?', vehicle: veh }), num(v * t, 'km'), 's = v × t.', `${v} × ${t} = ${v * t} (km).`); }
          if (f === 1) { const t = dec(R(rng, 3, 9) * 5, 1); return Q(L(`${name} đi với vận tốc ${v} km/giờ trong ${F(t)} giờ. Tính quãng đường đi được.`, `${name} travels at ${v} km/h for ${F(t)} hours. Find the distance travelled.`), vz('motion', { speed: v, unit: KMH, time: t, distance: '?', vehicle: veh }), num(rd(v * t), 'km'), 's = v × t.', `${v} × ${F(t)} = ${F(rd(v * t))} (km).`); }
          if (f === 2) { const t = R(rng, 2, 6), s = v * t; return Q(L(`${name} đi quãng đường ${s} km với vận tốc ${v} km/giờ. Tính thời gian đi.`, `${name} travels ${s} km at ${v} km/h. Find the time taken.`), vz('motion', { speed: v, unit: KMH, distance: s, vehicle: veh }), num(t, HRS), 't = s : v.', `${s} : ${v} = ${t} (${HRS}).`); }
          const t = dec(R(rng, 3, 9) * 5, 1), s = rd(v * t), dep = R(rng, 6, 9), mins = Math.round(t * 60), ah = dep + Math.floor(mins / 60), am = mins % 60;
          return Q(L(`${name} khởi hành lúc ${dep} giờ, đi quãng đường ${F(s)} km với vận tốc ${v} km/giờ. Hỏi đến nơi lúc mấy giờ?`, `${name} sets off at ${clk(dep, 0)} and travels ${F(s)} km at ${v} km/h. What time does the journey end?`), vz('motion', { speed: v, unit: KMH, distance: s, vehicle: veh }), timeCh(rng, ah * 60 + am, [ah * 60 + am + 60, (dep + Math.floor(t)) * 60 + Math.round((t % 1) * 10), ah * 60 + am + 30, ah * 60 + am - 30], 60, clk), L('Tìm thời gian đi (t = s : v), rồi cộng với giờ khởi hành.', 'Find the travel time (t = s : v), then add it to the departure time.'), L(`t = ${F(s)} : ${v} = ${F(t)} giờ = ${hm(Math.floor(mins / 60), am)}. Đến nơi lúc ${dep} giờ + ${hm(Math.floor(mins / 60), am)} = ${hm(ah, am)}.`, `t = ${F(s)} : ${v} = ${F(t)} hours = ${hm(Math.floor(mins / 60), am)}. It arrives at ${clk(dep, 0)} + ${hm(Math.floor(mins / 60), am)} = ${clk(ah, am)}.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 11. MỘT SỐ YẾU TỐ THỐNG KÊ VÀ XÁC SUẤT ============
  const PIES = EN ? [[['Football', 'Badminton', 'Swimming', 'Chess'], [40, 25, 20, 15]], [['Apples', 'Oranges', 'Mangoes'], [50, 30, 20]], [['Walking', 'Cycling', 'Bus', 'Driven by parents'], [20, 35, 15, 30]], [['Reading', 'Drawing', 'Singing'], [45, 25, 30]]]
    : [[['Bóng đá', 'Cầu lông', 'Bơi', 'Cờ vua'], [40, 25, 20, 15]], [['Táo', 'Cam', 'Xoài'], [50, 30, 20]], [['Đi bộ', 'Xe đạp', 'Xe buýt', 'Bố mẹ đưa'], [20, 35, 15, 30]], [['Đọc sách', 'Vẽ', 'Ca hát'], [45, 25, 30]]];
  const SPORTS = L(['Bóng đá', 'Cầu lông', 'Bơi', 'Cờ vua'], ['Football', 'Badminton', 'Swimming', 'Chess']), SPORT = L('Môn thể thao', 'Sport'), KIDS = L('Số bạn', 'Children');
  const COIN = L(['Mặt', 'Sấp', 'Ngửa'], ['Side', 'Tails', 'Heads']), TIMES = L('Số lần', 'Times');
  const c11 = {
    id: 'g5-c11', semester: 2, title: L('Một số yếu tố thống kê và xác suất', 'Statistics and probability'), icon: '📊', lessons: [
      lesson(11, 63, L('Thu thập, phân loại, sắp xếp các số liệu', 'Collecting, sorting and organising data'),
        L('Rô-bốt ISA cùng lớp 5A khảo sát môn thể thao các bạn yêu thích.', 'ISA the robot and class 5A do a survey of the children\'s favourite sports.'),
        [{ text: L('Thu thập số liệu, phân loại, rồi sắp xếp vào bảng để dễ so sánh.', 'Collect the data, sort it, then put it in a table so that it is easy to compare.'), visual: vz('dataTable', { headers: [SPORT].concat(SPORTS), rows: [[KIDS, 12, 8, 6, 4]] }) }],
        function (rng, i) {
          const labels = SPORTS, vals = U.sample(rng, Array.from({ length: 15 }, (_, k) => k + 2), 4), f = i % 4;
          const tb = vz('dataTable', { headers: [SPORT].concat(labels), rows: [[KIDS].concat(vals)] });
          if (f === 0) { const s = vals.reduce((a, b) => a + b, 0); return Q(L('Lớp có tất cả bao nhiêu bạn tham gia khảo sát?', 'How many children in the class took part in the survey?'), tb, num(s), L('Cộng tất cả các số liệu.', 'Add up all the data.'), L(`${vals.join(' + ')} = ${s} (bạn).`, `${vals.join(' + ')} = ${s} (children).`)); }
          if (f === 1) { const asc = labels.map((l, k) => [l, vals[k]]).sort((x, y) => y[1] - x[1]).map(x => x[0]); return Q(L('Sắp xếp các môn thể thao theo số bạn yêu thích từ nhiều đến ít:', 'Put the sports in order, from the most popular to the least popular:'), tb, ch(rng, asc.join(', '), [asc.slice().reverse().join(', '), labels.join(', '), [asc[1], asc[0], asc[2], asc[3]].join(', ')]), L('So sánh các số liệu trong bảng.', 'Compare the data in the table.'), `${asc.join(', ')}.`); }
          if (f === 2) { const mx = Math.max(...vals), mn = Math.min(...vals); return Q(L('Môn được yêu thích nhiều nhất hơn môn ít nhất bao nhiêu bạn?', 'How many more children like the most popular sport than the least popular sport?'), tb, num(mx - mn), L('Tìm số lớn nhất và số bé nhất.', 'Find the largest number and the smallest number.'), L(`${mx} ${M} ${mn} = ${mx - mn} (bạn).`, `${mx} ${M} ${mn} = ${mx - mn} (children).`)); }
          const s = vals.reduce((a, b) => a + b, 0), avg = s / 4;
          if (!Number.isInteger(avg * 4) || s % 4 !== 0) { const j = R(rng, 0, 3); return Q(L(`Có bao nhiêu bạn thích ${labels[j].toLowerCase()}?`, `How many children like ${labels[j].toLowerCase()}?`), tb, num(vals[j]), L('Đọc số liệu trong bảng.', 'Read the data in the table.'), L(`${vals[j]} bạn.`, `${vals[j]} children.`)); }
          return Q(L('Trung bình mỗi môn có bao nhiêu bạn yêu thích?', 'On average, how many children like each sport?'), tb, num(avg), L('Lấy tổng chia cho số môn.', 'Divide the total by the number of sports.'), L(`${s} : 4 = ${avg} (bạn).`, `${s} : 4 = ${avg} (children).`));
        }),
      lesson(11, 64, L('Biểu đồ hình quạt tròn', 'Pie charts'),
        L('Rô-bốt ISA đọc biểu đồ hình quạt tròn về cách các bạn đến trường.', 'ISA the robot reads a pie chart about how the children get to school.'),
        [{ text: L('Cả hình tròn là 100%. Mỗi hình quạt biểu diễn tỉ số phần trăm của một phần so với tổng.', 'The whole circle is 100%. Each slice shows one part as a percentage of the whole.'), visual: vz('pieChart', { labels: PIES[2][0], percents: [20, 35, 15, 30] }) }],
        function (rng, i) {
          const [labels, pcs] = P(rng, PIES), pc = vz('pieChart', { labels, percents: pcs }), f = i % 3, j = R(rng, 0, labels.length - 1);
          if (f === 0) return Q(L(`Theo biểu đồ, "${labels[j]}" chiếm bao nhiêu phần trăm?`, `Look at the chart. What percentage is "${labels[j]}"?`), pc, num(pcs[j], '%'), L('Đọc số phần trăm ghi trên hình quạt.', 'Read the percentage written on the slice.'), L(`"${labels[j]}" chiếm ${pcs[j]}%.`, `"${labels[j]}" is ${pcs[j]}%.`));
          const tot = P(rng, [20, 40, 60, 80, 100, 200]), cnt = tot * pcs[j] / 100;
          if (f === 1) return Q(L(`Có ${tot} học sinh được hỏi. Có bao nhiêu học sinh chọn "${labels[j]}"?`, `${tot} pupils were asked. How many pupils chose "${labels[j]}"?`), pc, num(cnt), L(`Tìm ${pcs[j]}% của ${tot}.`, `Find ${pcs[j]}% of ${tot}.`), L(`${tot} × ${pcs[j]} : 100 = ${cnt} (học sinh).`, `${tot} × ${pcs[j]} : 100 = ${cnt} (pupils).`));
          const mx = Math.max(...pcs);
          return Q(L('Phần nào chiếm tỉ lệ lớn nhất trong biểu đồ?', 'Which part is the biggest in the chart?'), pc, ch(rng, labels[pcs.indexOf(mx)], labels), L('Tìm hình quạt lớn nhất.', 'Find the biggest slice.'), L(`"${labels[pcs.indexOf(mx)]}" chiếm ${mx}%.`, `"${labels[pcs.indexOf(mx)]}" is ${mx}%.`));
        }),
      lesson(11, 65, L('Tỉ số của số lần lặp lại của một sự kiện so với tổng số lần thực hiện', 'The ratio of how many times an event happens to the total number of tries'),
        L('Rô-bốt ISA tung xúc xắc nhiều lần và ghi lại kết quả cùng bạn Phúc.', 'ISA the robot and Phúc roll a dice many times and write down the results.'),
        [{ text: L('Tung đồng xu 20 lần, mặt sấp xuất hiện 9 lần. Tỉ số của số lần xuất hiện mặt sấp và tổng số lần tung là 9/20.', 'Toss a coin 20 times: it lands on tails 9 times. The ratio of the number of tails to the total number of tosses is 9/20.'), visual: vz('dataTable', { headers: COIN, rows: [[TIMES, 9, 11]] }) }],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const n = P(rng, [10, 20, 25, 30, 40, 50]), a = R(rng, 1, n - 1); return Q(L(`Tung một đồng xu ${n} lần, mặt ngửa xuất hiện ${a} lần. Viết tỉ số của số lần xuất hiện mặt ngửa và tổng số lần tung.`, `Toss a coin ${n} times: it lands on heads ${pl(a, 'time')}. Write the ratio of the number of heads to the total number of tosses.`), vz('dataTable', { headers: COIN, rows: [[TIMES, n - a, a]] }), fracA(a, n), L('Tỉ số = số lần xuất hiện : tổng số lần thực hiện.', 'Ratio = number of times it happens : total number of tries.'), `${a} : ${n} = ${a}/${n}.`); }
          if (f === 1) { const n = P(rng, [12, 18, 20, 24, 30]), a = R(rng, 1, Math.floor(n / 3)); return Q(L(`Gieo một con xúc xắc ${n} lần, mặt 6 chấm xuất hiện ${a} lần. Tỉ số của số lần xuất hiện mặt 6 chấm và tổng số lần gieo là:`, `Roll a dice ${n} times: it lands on six ${pl(a, 'time')}. The ratio of the number of sixes to the total number of rolls is:`), null, ch(rng, fs(a, n), [fs(n, a), fs(a, 6), fs(n - a, n)]), L('Tỉ số = số lần xuất hiện / tổng số lần gieo.', 'Ratio = number of times it happens / total number of rolls.'), `${a}/${n}.`); }
          const n = P(rng, [20, 25, 50]), a = R(rng, 1, n - 1), pc = rd(a * 100 / n);
          return Q(L(`Lấy bóng từ hộp rồi trả lại, làm ${n} lần, có ${a} lần lấy được bóng đỏ. Số lần lấy được bóng đỏ chiếm bao nhiêu phần trăm tổng số lần?`, `Take a ball from a box, then put it back. You do this ${n} times and get a red ball ${pl(a, 'time')}. What percentage of the tries gave a red ball?`), vz('chance', { items: [{ color: '#E84A4A', count: 3 }, { color: '#4DA3FF', count: 2 }] }), num(pc, '%'), L('Tìm tỉ số rồi đổi ra tỉ số phần trăm.', 'Find the ratio, then change it into a percentage.'), `${a} : ${n} = ${F(rd(a / n))} = ${F(pc)}%.`);
        }, [
          [0, 9, rng => { const n = P(rng, [20, 24, 30, 36, 40]), c = Array(6).fill(1); for (let k = 6; k < n; k++) c[R(rng, 0, 5)]++; const f = R(rng, 1, 6); return Q(L(`Gieo một con xúc xắc ${n} lần, kết quả ghi ở bảng. Viết tỉ số của số lần xuất hiện mặt ${f} chấm và tổng số lần gieo.`, `A dice is rolled ${n} times and the results are in the table. Write the ratio of the number of times it lands on ${f} to the total number of rolls.`), vz('dataTable', { headers: L(['Mặt', '1 chấm', '2 chấm', '3 chấm', '4 chấm', '5 chấm', '6 chấm'], ['Number', '1', '2', '3', '4', '5', '6']), rows: [[TIMES, ...c]] }), fracA(c[f - 1], n), L('Tỉ số = số lần xuất hiện mặt đó : tổng số lần gieo.', 'Ratio = number of times it lands on that number : total number of rolls.'), L(`Mặt ${f} chấm xuất hiện ${c[f - 1]} lần: ${c[f - 1]}/${n}.`, `The number ${f} comes up ${pl(c[f - 1], 'time')}: ${c[f - 1]}/${n}.`)); }],
          [3, 9, rng => { const n = P(rng, [10, 20, 25, 30, 40, 50]), a = R(rng, 1, n - 1); return Q(L(`Tung một đồng xu ${n} lần, mặt sấp xuất hiện ${a} lần. Viết tỉ số của số lần xuất hiện mặt ngửa và tổng số lần tung.`, `Toss a coin ${n} times: it lands on tails ${pl(a, 'time')}. Write the ratio of the number of heads to the total number of tosses.`), null, fracA(n - a, n), L('Bước 1: tìm số lần xuất hiện mặt ngửa. Bước 2: viết tỉ số.', 'Step 1: find how many times it lands on heads. Step 2: write the ratio.'), L(`Mặt ngửa: ${n} ${M} ${a} = ${n - a} (lần). Tỉ số: ${n - a}/${n}.`, `Heads: ${n} ${M} ${a} = ${n - a} (${n - a === 1 ? 'time' : 'times'}). Ratio: ${n - a}/${n}.`)); }],
          [0, 9, rng => { const n = P(rng, [10, 12, 15, 20, 25]), a = R(rng, 1, n - 1), x = nm(rng); return Q(L(`${x} ném bóng vào rổ ${n} lần, có ${a} lần bóng vào rổ. Viết tỉ số của số lần ném bóng vào rổ và tổng số lần ném.`, `${x} throws a ball at the basket ${n} times and gets it in ${pl(a, 'time')}. Write the ratio of the number of baskets to the total number of throws.`), null, fracA(a, n), L('Tỉ số = số lần ném vào rổ : tổng số lần ném.', 'Ratio = number of baskets : total number of throws.'), `${a} : ${n} = ${a}/${n}.`); }],
          [3, 9, rng => { const n = P(rng, [10, 20, 30, 40]), a = R(rng, 1, n - 1), ok = R(rng, 0, 1) === 1, cl = ok ? fs(a, n) : P(rng, [fs(n, a), fs(a, n - a), fs(n - a, n)]); return Q(L(`Đúng hay sai?\nTung đồng xu ${n} lần, mặt ngửa xuất hiện ${a} lần. Tỉ số của số lần xuất hiện mặt ngửa và tổng số lần tung là ${cl}.`, `True or false?\nA coin is tossed ${n} times and lands on heads ${pl(a, 'time')}. The ratio of the number of heads to the total number of tosses is ${cl}.`), null, tf(rng, ok || cl === fs(a, n)), L('Tỉ số = số lần xuất hiện : tổng số lần thực hiện.', 'Ratio = number of times it happens : total number of tries.'), L(`Tỉ số là ${a}/${n}. ${ok || cl === fs(a, n) ? 'Đúng' : 'Sai'}.`, `The ratio is ${a}/${n}. ${ok || cl === fs(a, n) ? YES : NO}.`)); }],
          [6, 9, rng => { const n = P(rng, [20, 25, 40, 50]), a = R(rng, 1, n - 1); return Q(L(`Trong hộp có bóng xanh và bóng đỏ. Lấy một quả bóng rồi trả lại, làm ${n} lần, có ${a} lần lấy được bóng xanh. Viết tỉ số của số lần lấy được bóng đỏ và tổng số lần lấy.`, `A box has blue balls and red balls. Take out one ball, then put it back. You do this ${n} times and get a blue ball ${pl(a, 'time')}. Write the ratio of the number of red balls to the total number of tries.`), vz('chance', { items: [{ color: '#4DA3FF', count: 3 }, { color: '#E84A4A', count: 3 }] }), fracA(n - a, n), L('Mỗi lần lấy được bóng xanh hoặc bóng đỏ; tìm số lần lấy được bóng đỏ trước.', 'Each time you get either a blue ball or a red ball. First find how many times you got a red ball.'), L(`Bóng đỏ: ${n} ${M} ${a} = ${n - a} (lần). Tỉ số: ${n - a}/${n}.`, `Red ball: ${n} ${M} ${a} = ${n - a} (${n - a === 1 ? 'time' : 'times'}). Ratio: ${n - a}/${n}.`)); }],
        ])),
    ],
  };

  CURRICULUM.push({
    grade: 5,
    title: L('Lớp 5', 'Grade 5'),
    book: L('Kết nối tri thức với cuộc sống', 'Connecting Knowledge with Life'),
    topics: [c1, c2, c3, c4, c5, c7, c8, c9, c10, c11],
  });
})();
