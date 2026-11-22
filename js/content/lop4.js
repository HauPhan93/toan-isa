/* Toán ISA — Lớp 4 (SGK Toán 4 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g4-c{chủ đề index}-b{Bài number}. Never rename ids.
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const R = U.rand, P = U.pick, F = x => U.fmt(x);
  const M = '−';
  const L = U.L, EN = U.EN;
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const pl = (n, one, many) => (n === 1 ? one : many);   // English singular / plural
  const ord = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const TRUE_ = L('Đúng', 'True'), FALSE_ = L('Sai', 'False');
  const TF = ok => (ok ? TRUE_ : FALSE_);

  // ---------- helpers ----------
  const num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });
  const fracA = (n, d, simplest) => (simplest ? { kind: 'fraction', num: n, den: d, simplest: true } : { kind: 'fraction', num: n, den: d });
  const ch = (rng, c, d, f) => U.choices(rng, c, d, f);
  const cmpAns = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b - 1e-12 ? 0 : a > b + 1e-12 ? 1 : 2 });
  const sign = (a, b) => (a < b - 1e-12 ? '<' : a > b + 1e-12 ? '>' : '=');
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
  const tf = (rng, ok) => U.choices(rng, ok ? TRUE_ : FALSE_, [ok ? FALSE_ : TRUE_]);
  const TFQ = L('Đúng hay sai?', 'True or false?');
  function Q(prompt, visual, answer, hint, explain, extra) {
    const q = { prompt, answer, hint, explain };
    if (visual) q.visual = visual;
    Object.assign(q, extra || {});
    if (q.hintVisual == null) delete q.hintVisual;
    return q;
  }
  const two = rng => U.sample(rng, U.NAMES, 2);
  const nm = rng => P(rng, U.NAMES);
  function pairWhere(rng, ra, rb, ok, fb) {
    for (let g = 0; g < 800; g++) {
      const a = R(rng, ra[0], ra[1]), b = R(rng, rb[0], rb[1]);
      if (ok(a, b)) return [a, b];
    }
    return fb;
  }
  function noCarry(a, b) { while (a > 0 || b > 0) { if (a % 10 + b % 10 >= 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function noBorrow(a, b) { while (b > 0) { if (a % 10 < b % 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function wrongAdd(a, b) { let r = 0, p = 1; while (a > 0 || b > 0) { r += ((a % 10 + b % 10) % 10) * p; p *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10); } return r; }
  function wrongSub(a, b) { let r = 0, p = 1; while (a > 0 || b > 0) { r += Math.abs(a % 10 - b % 10) * p; p *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10); } return r; }
  function wrongMul(a, b) {
    if (b >= 10) return a * (b % 10) + a * Math.floor(b / 10); // forgot to shift the 2nd partial product
    let r = 0, p = 1; while (a > 0) { r += ((a % 10) * b % 10) * p; p *= 10; a = Math.floor(a / 10); } return r;
  }
  function wrongDiv(q) { const s = String(q).replace(/0/g, ''); const w = Number(s || '0'); return w !== q && w > 0 ? w : q + 1; }
  const units = (x, max) => Math.max(1, Math.round(x * 12 / Math.max(1, max)));
  const opRes = (a, op, b) => (op === '+' ? a + b : op === M ? a - b : op === '×' ? a * b : a / b);
  const fs = (n, d) => `${n}/${d}`;
  // forward explanation of reducing N/D by g (g divides both)
  const redEx = (N, D, g) => L(`Chia cả tử số và mẫu số cho ${g}: ${N} : ${g} = ${N / g}; ${D} : ${g} = ${D / g}. Vậy ${N}/${D} = ${N / g}/${D / g}.`,
    `Divide both the numerator and the denominator by ${g}: ${N} : ${g} = ${N / g}; ${D} : ${g} = ${D / g}. So ${N}/${D} = ${N / g}/${D / g}.`);
  // fraction multiple choice; distractors equal in value to the answer are dropped
  const fch = (rng, c, ds) => U.choices(rng, fs(c[0], c[1]), ds.filter(([p, q]) => q > 0 && p * c[1] !== q * c[0]).map(([p, q]) => fs(p, q)));

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
  const RD = n => (EN ? U.readEN(n) : readVN(n));   // the number in words, in the current language
  function toRoman(n) {
    const t = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = ''; for (const [v, c] of t) while (n >= v) { s += c; n -= v; } return s;
  }
  const roundTo = (n, p) => Math.round(n / p) * p;
  function expand(n) { const s = String(n), out = []; for (let k = 0; k < s.length; k++) { const d = Number(s[k]); if (d) out.push(d * Math.pow(10, s.length - 1 - k)); } return out; }
  const PLACES = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn', 'triệu', 'chục triệu', 'trăm triệu'];
  const CLASSES = ['lớp đơn vị', 'lớp nghìn', 'lớp triệu'];
  const PLACES_EN = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions', 'ten millions', 'hundred millions'];
  const CLASSES_EN = ['ones class', 'thousands class', 'millions class'];
  // "Hàng chục nghìn, lớp nghìn" / "Ten thousands place, thousands class"
  const hl = (p, c) => L(`Hàng ${PLACES[p]}, ${CLASSES[c]}`, `${cap(String(PLACES_EN[p]))} place, ${CLASSES_EN[c]}`);
  const PVCOLS = EN ? ['Hundred millions', 'Ten millions', 'Millions', 'Hundred thousands', 'Ten thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones']
    : ['Trăm triệu', 'Chục triệu', 'Triệu', 'Trăm nghìn', 'Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  const colsFor = n => PVCOLS.slice(9 - String(n).length);

  // Learn cards show their labels (visuals hide most labels by default so questions do not give answers away).
  const LEARN_ON = { blocks: { labels: true }, fraction: { label: true }, decimalGrid: { showLabel: true }, percent: { showLabel: true }, thermometer: { showValue: true }, roman: { showValue: true, showText: true }, average: { showMean: true }, angle: { showDeg: true }, cubes: { showDims: true } };
  function lesson(c, b, title, story, learn, gen) {
    learn.forEach(card => { const v = card.visual; if (v && LEARN_ON[v.type]) v.params = Object.assign({}, LEARN_ON[v.type], v.params); });
    return { id: `g4-c${c}-b${b}`, title, book: L(`Bài ${b}`, `Lesson ${b}`), story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
  }

  // ---------- generic builders ----------
  const ADD_T = EN ? [
    (a, b) => `Last month a factory made ${F(a)} products. This month it made ${F(b)} products. How many products did the factory make in the two months altogether?`,
    (a, b) => `Last year the province planted ${F(a)} trees. This year it planted ${F(b)} trees. How many trees did it plant in the two years altogether?`,
    (a, b) => `Last week a bookshop sold ${F(a)} books. This week it sold ${F(b)} books. How many books did it sell in the two weeks altogether?`,
  ] : [
    (a, b) => `Một nhà máy tháng trước sản xuất được ${F(a)} sản phẩm, tháng này sản xuất được ${F(b)} sản phẩm. Hỏi cả hai tháng nhà máy sản xuất được bao nhiêu sản phẩm?`,
    (a, b) => `Năm ngoái tỉnh trồng được ${F(a)} cây xanh, năm nay trồng được ${F(b)} cây xanh. Hỏi cả hai năm trồng được bao nhiêu cây xanh?`,
    (a, b) => `Một nhà sách tuần trước bán được ${F(a)} quyển sách, tuần này bán được ${F(b)} quyển. Cả hai tuần bán được bao nhiêu quyển sách?`,
  ];
  const SUB_T = EN ? [
    (a, b) => `A storehouse has ${F(a)} kg of paddy rice. ${F(b)} kg are taken away. How many kilograms of paddy rice are left in the storehouse?`,
    (a, b) => `This year the commune has ${F(a)} people. Last year it had ${F(b)} people. By how many people has the population of the commune grown this year?`,
    (a, b) => `A factory has to make ${F(a)} products. It has made ${F(b)} products so far. How many more products does it still have to make?`,
  ] : [
    (a, b) => `Một kho có ${F(a)} kg thóc, người ta đã chuyển đi ${F(b)} kg. Hỏi trong kho còn lại bao nhiêu ki-lô-gam thóc?`,
    (a, b) => `Năm nay xã có ${F(a)} người, năm trước có ${F(b)} người. Hỏi năm nay số dân của xã tăng thêm bao nhiêu người?`,
    // (operands are not round thousands, so no money context here)
    (a, b) => `Một nhà máy cần sản xuất ${F(a)} sản phẩm, đã sản xuất được ${F(b)} sản phẩm. Hỏi nhà máy còn phải sản xuất bao nhiêu sản phẩm nữa?`,
  ];
  // contexts that suit any count (a up to a few hundred thousand, b up to 99)
  const MUL_T = EN ? [
    (a, b) => `Each storehouse has ${F(a)} cartons of milk. How many cartons of milk are there in ${b} storehouses like this?`,
    (a, b) => `Each farm keeps ${F(a)} chickens. How many chickens do ${b} farms like this keep?`,
    (a, b) => `A factory makes ${F(a)} face masks every day. How many face masks does it make in ${b} days?`,
  ] : [
    (a, b) => `Mỗi kho có ${F(a)} hộp sữa. Hỏi ${b} kho như thế có bao nhiêu hộp sữa?`,
    (a, b) => `Mỗi trang trại nuôi ${F(a)} con gà. Hỏi ${b} trang trại như thế nuôi bao nhiêu con gà?`,
    (a, b) => `Mỗi ngày nhà máy sản xuất được ${F(a)} chiếc khẩu trang. Hỏi trong ${b} ngày như thế nhà máy sản xuất được bao nhiêu chiếc khẩu trang?`,
  ];
  const DIV_T = EN ? [
    (a, b) => `${F(a)} kg of rice is shared equally between ${b} sacks. How many kilograms of rice are in each sack?`,
    (a, b) => `${F(a)} books are shared equally between ${b} libraries. How many books does each library get?`,
    (a, b) => `A team of workers repairs ${F(a)} m of road in ${b} days, the same length each day. How many metres of road does the team repair each day?`,
  ] : [
    (a, b) => `Có ${F(a)} kg gạo chia đều vào ${b} bao. Hỏi mỗi bao có bao nhiêu ki-lô-gam gạo?`,
    (a, b) => `Có ${F(a)} quyển sách chia đều cho ${b} thư viện. Hỏi mỗi thư viện được bao nhiêu quyển sách?`,
    (a, b) => `Một đội công nhân sửa ${F(a)} m đường trong ${b} ngày, mỗi ngày sửa được như nhau. Hỏi mỗi ngày đội sửa được bao nhiêu mét đường?`,
  ];
  // Several column operations in one lesson (op chosen by i); exam picks one at random.
  function mixCol(list, opts) {
    const gens = list.map(([op, pick]) => colGen(op, pick, opts));
    const gen = (rng, i) => gens[i % gens.length](rng, i);
    gen.exam = (rng, level) => P(rng, gens).exam(rng, level);
    return gen;
  }
  function colGen(op, pickPair) {
    const at = function (rng, lev, k) {
      const [a, b] = pickPair(rng, lev);
      const r = opRes(a, op, b);
      const wrong = op === '+' ? wrongAdd(a, b) : op === M ? wrongSub(a, b) : op === '×' ? wrongMul(a, b) : wrongDiv(r);
      const expr = `${F(a)} ${op} ${F(b)}`;
      const colV = vz('columnCalc', { a, b, op, reveal: 'none' });
      const colH = vz('columnCalc', { a, b, op, reveal: 'steps' });
      const hint = op === '+' ? L('Đặt tính thẳng cột, cộng từ phải sang trái, nhớ khi tổng ≥ 10.', 'Line up the digits in columns. Add from right to left, and carry when a column adds up to 10 or more.')
        : op === M ? L('Đặt tính thẳng cột, trừ từ phải sang trái; không trừ được thì mượn 1 ở hàng bên trái.', 'Line up the digits in columns. Subtract from right to left; if a column is too small, exchange 1 from the column on its left.')
          : op === '×' ? (b >= 10 ? L('Nhân lần lượt với từng chữ số của thừa số thứ hai; tích riêng thứ hai viết lùi sang trái một cột rồi cộng.', 'Multiply by each digit of the second factor in turn. Write the second partial product one column to the left, then add.') : L('Nhân từ phải sang trái, nhớ sang hàng bên trái.', 'Multiply from right to left and carry to the next column on the left.'))
            : (b >= 10 ? L('Chia từ trái sang phải; mỗi lượt ước lượng thương (làm tròn số chia), nhân rồi trừ.', 'Divide from left to right. Each time, estimate the quotient (round the divisor), multiply, then subtract.') : L('Chia từ trái sang phải: chia, nhân, trừ, hạ.', 'Divide from left to right: divide, multiply, subtract, bring down.'));
      if (k === 0) return Q(L(`Đặt tính rồi tính:\n${expr}`, `Set out and calculate:\n${expr}`), colV, num(r), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, r, [wrong, r + (op === ':' ? 1 : 10), r - (op === ':' ? 1 : 100), r + 1000].filter(x => x > 0)), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const T = op === '+' ? ADD_T : op === M ? SUB_T : op === '×' ? MUL_T : DIV_T;
        const p = P(rng, T)(a, b);
        let tape;
        if (op === '+') tape = vz('tape', { bars: [{ label: '', units: units(a, Math.max(a, b)), value: F(a) }, { label: '', units: units(b, Math.max(a, b)), value: F(b) }], total: '?' });
        else if (op === M) tape = vz('tape', { bars: [{ label: '', units: 12, value: F(a) }, { label: '', units: units(b, a), value: F(b) }], diff: '?' });
        else if (op === '×') tape = vz('tape', { bars: [{ label: '', parts: Math.min(b, 10), units: Math.min(b, 10), value: `${F(a)} × ${b}` }], total: '?' });
        else tape = vz('tape', { bars: [{ label: '', parts: Math.min(b, 10), units: Math.min(b, 10), value: '?' }], total: F(a) });
        return Q(p, tape, num(r), op === '+' ? L('Tìm tất cả thì cộng.', 'To find the total, add.') : op === M ? L('Tìm phần còn lại (hoặc phần hơn) thì trừ.', 'To find what is left (or how many more), subtract.') : op === '×' ? L('Nhiều nhóm bằng nhau thì nhân.', 'Equal groups: multiply.') : L('Chia đều thì làm phép chia.', 'Sharing equally: divide.'), `${expr} = ${F(r)}.`);
      }
      if (k === 3) {
        const c = Math.max(0, r + P(rng, [-10, -1, 0, 1, 100, 1000]));
        return Q(L(`So sánh: ${expr} … ${F(c)}`, `Compare: ${expr} … ${F(c)}`), vz('compare', { left: expr, right: F(c) }), cmpAns(r, c), L('Tính kết quả rồi so sánh.', 'Work out the answer, then compare.'), `${expr} = ${F(r)}; ${F(r)} ${sign(r, c)} ${F(c)}.`);
      }
      if (wrong !== r) {
        const who = nm(rng);
        return Q(L(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, `${who} worked out: ${expr} = ${F(wrong)}.\nWhat is the correct answer?`), colV, num(r), op === '×' && b >= 10 ? L('Tích riêng thứ hai phải viết lùi sang trái một cột.', 'The second partial product must move one column to the left.') : L('Làm lại từng bước, chú ý phần nhớ và chữ số 0.', 'Do it again step by step. Watch the carrying and the zeros.'), `${expr} = ${F(r)}.`, { hintVisual: colH });
      }
      const FIND = L('Tìm ?:', 'Find the missing number:');
      if (op === '+') return Q(`${FIND}\n? + ${F(b)} = ${F(r)}`, null, num(a), L('Số hạng = tổng − số hạng kia.', 'Addend = sum − the other addend.'), `${F(r)} ${M} ${F(b)} = ${F(a)}.`);
      if (op === M) return Q(`${FIND}\n${F(a)} ${M} ? = ${F(r)}`, null, num(b), L('Số trừ = số bị trừ − hiệu.', 'Subtrahend = minuend − difference.'), `${F(a)} ${M} ${F(r)} = ${F(b)}.`);
      if (op === '×') return Q(`${FIND}\n? × ${b} = ${F(r)}`, null, num(a), L('Thừa số = tích : thừa số kia.', 'Factor = product : the other factor.'), `${F(r)} : ${b} = ${F(a)}.`);
      return Q(`${FIND}\n? : ${b} = ${F(r)}`, null, num(a), L('Số bị chia = thương × số chia.', 'Dividend = quotient × divisor.'), `${F(r)} × ${b} = ${F(a)}.`);
    };
    // gen: practice (form by i % 5). exam: level 1 = đặt tính rồi tính, level 2–3 = bài toán có lời văn.
    const gen = (rng, i) => at(rng, lv(i), i % 5);
    gen.exam = (rng, level) => (level === 1 ? at(rng, 1, 0) : at(rng, level === 2 ? 1 : 2, 2));
    return gen;
  }

  function bigNumberGen(lo, hi) {
    return function (rng, i) {
      const n = R(rng, lo, hi), s = String(n), f = i % 5;
      if (f === 0) return Q(L(`Số "${readVN(n)}" viết là:`, `Write the number "${U.readEN(n)}" in digits:`), null, num(n), L('Viết theo từng lớp, mỗi lớp 3 chữ số; lớp nào thiếu thì viết chữ số 0.', 'Write it class by class, with 3 digits in each class; write 0 for any place that is missing.'), L(`"${readVN(n)}" viết là ${F(n)}.`, `"${U.readEN(n)}" is written ${F(n)}.`));
      if (f === 1) { const alt = [n + Math.pow(10, R(rng, 1, 3)), n - Math.pow(10, R(rng, 0, 2)), Number(s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1))].filter(x => x >= lo && x <= hi && x !== n); return Q(L(`Số ${F(n)} đọc là:`, `How do you read the number ${F(n)}?`), vz('placeValue', { number: n, columns: colsFor(n) }), ch(rng, RD(n), alt.map(RD)), L('Tách số thành từng lớp rồi đọc từ trái sang phải.', 'Split the number into classes, then read it from left to right.'), L(`${F(n)} đọc là "${readVN(n)}".`, `${F(n)} is read as "${U.readEN(n)}".`)); }
      if (f === 2) { const pos = R(rng, 0, s.length - 1), d = Number(s[pos]), place = s.length - 1 - pos; const val = d * Math.pow(10, place); return Q(L(`Trong số ${F(n)}, chữ số ${d} ở hàng ${PLACES[place]} có giá trị là bao nhiêu?`, `In the number ${F(n)}, the digit ${d} is in the ${PLACES_EN[place]} place. What is its value?`), vz('placeValue', { number: n, columns: colsFor(n) }), num(val), L(`Giá trị = chữ số × giá trị của hàng.`, 'Value = digit × the value of its place.'), L(`Chữ số ${d} ở hàng ${PLACES[place]} có giá trị ${F(val)}.`, `The digit ${d} in the ${PLACES_EN[place]} place has a value of ${F(val)}.`)); }
      if (f === 3) { const e = expand(n); return Q(L(`Viết số ${F(n)} thành tổng theo các hàng:`, `Write ${F(n)} as the sum of its place values:`), null, ch(rng, e.map(F).join(' + '), [e.map((x, j) => F(j === 0 ? x / 10 : x)).join(' + '), expand(n + Math.pow(10, R(rng, 1, 3))).map(F).join(' + '), e.map((x, j) => F(j === e.length - 1 ? x * 10 : x)).join(' + ')]), L('Mỗi chữ số nhân với giá trị của hàng.', 'Multiply each digit by the value of its place.'), `${F(n)} = ${e.map(F).join(' + ')}.`); }
      // ask only about a digit that occurs once in the number, so no other place is also a true answer
      const onceIn = t => [...t].map((_, k) => k).filter(k => t.split(t[k]).length === 2);
      let m = n, t = s, uniq = onceIn(t);
      for (let g = 0; g < 60 && !uniq.length; g++) { m = R(rng, lo, hi); t = String(m); uniq = onceIn(t); }
      if (!uniq.length) { m = lo; t = String(m); uniq = [0]; } // lo = 10…0: its leading 1 is unique
      const pos = P(rng, uniq), place = t.length - 1 - pos;
      return Q(L(`Chữ số ${t[pos]} trong số ${F(m)} thuộc hàng nào, lớp nào?`, `In the number ${F(m)}, which place and which class is the digit ${t[pos]} in?`), vz('placeValue', { number: m, columns: colsFor(m) }), ch(rng, hl(place, Math.floor(place / 3)), [place + 1 < t.length ? hl(place + 1, Math.floor((place + 1) / 3)) : hl(place - 1, Math.floor((place - 1) / 3)), hl(place, (Math.floor(place / 3) + 1) % 3), place > 0 ? hl(place - 1, Math.floor((place - 1) / 3)) : hl(place + 2, Math.floor((place + 2) / 3))]), L('Lớp đơn vị gồm hàng đơn vị, chục, trăm; lớp nghìn gồm nghìn, chục nghìn, trăm nghìn; lớp triệu gồm triệu, chục triệu, trăm triệu.', 'The ones class has the ones, tens and hundreds; the thousands class has the thousands, ten thousands and hundred thousands; the millions class has the millions, ten millions and hundred millions.'), L(`Chữ số ${t[pos]} thuộc hàng ${PLACES[place]}, ${CLASSES[Math.floor(place / 3)]}.`, `The digit ${t[pos]} is in the ${PLACES_EN[place]} place, in the ${CLASSES_EN[Math.floor(place / 3)]}.`));
    };
  }

  // Fractions helpers
  const fv = (n, d, shape) => vz('fraction', { num: n, den: d, shape: shape || 'bar' });
  // two-bar fraction picture; the renderer caps denominators at 24, so larger ones get no picture
  const fcmp = (a, b) => (a[1] <= 24 && b[1] <= 24 ? vz('fractionCompare', { a, b }) : null);

  // ============ CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG ============
  const c1 = {
    id: 'g4-c1', semester: 1, title: L('Ôn tập và bổ sung', 'Review and extension'), icon: '🔢', lessons: [
      lesson(1, 1, L('Ôn tập các số đến 100 000', 'Review: numbers to 100 000'),
        L('Rô-bốt ISA cùng bạn An đọc số khán giả đến xem lễ hội hoa Đà Lạt.', 'ISA the robot and An read out how many visitors came to the Đà Lạt flower festival.'),
        [
          { text: L('Số 47 205 gồm 4 chục nghìn, 7 nghìn, 2 trăm, 0 chục, 5 đơn vị; đọc là "bốn mươi bảy nghìn hai trăm linh năm".', 'The number 47 205 has 4 ten thousands, 7 thousands, 2 hundreds, 0 tens and 5 ones. It is read as "forty-seven thousand two hundred and five".'), visual: vz('placeValue', { number: 47205, columns: colsFor(47205) }) },
          { text: L('So sánh 47 205 và 47 520: cùng 47 nghìn, hàng trăm 2 < 5, nên 47 205 < 47 520.', 'Compare 47 205 and 47 520: both have 47 thousands; in the hundreds place 2 < 5, so 47 205 < 47 520.'), visual: vz('compare', { left: F(47205), right: F(47520) }) },
        ],
        function (rng, i) {
          if (i % 3 === 2) {
            const a = R(rng, 10000, 99999); let b = Math.floor(a / 1000) * 1000 + R(rng, 0, 999);
            return Q(L(`So sánh: ${F(a)} … ${F(b)}`, `Compare: ${F(a)} … ${F(b)}`), vz('compare', { left: F(a), right: F(b) }), cmpAns(a, b), L('So sánh từng hàng từ trái sang phải.', 'Compare the digits place by place, from left to right.'), `${F(a)} ${sign(a, b)} ${F(b)}.`);
          }
          return bigNumberGen(10000, 99999)(rng, i);
        }),
      lesson(1, 2, L('Ôn tập các phép tính trong phạm vi 100 000', 'Review: calculations within 100 000'),
        L('Rô-bốt ISA giúp cửa hàng của bố bạn Bình tính tiền hàng cuối tuần.', "ISA the robot helps at Bình's dad's shop, adding up the money taken at the weekend."),
        [
          { text: L('Cộng, trừ: đặt tính thẳng cột, tính từ phải sang trái.', 'Adding and subtracting: line up the digits in columns and work from right to left.'), visual: vz('columnCalc', { a: 45672, b: 28519, op: '+', reveal: 'all' }) },
          { text: L('Nhân, chia với số có một chữ số: 12 035 × 4 = 48 140; 48 140 : 4 = 12 035.', 'Multiplying and dividing by a 1-digit number: 12 035 × 4 = 48 140; 48 140 : 4 = 12 035.'), visual: vz('columnCalc', { a: 12035, b: 4, op: '×', reveal: 'all' }) },
        ],
        mixCol([
          ['+', (r) => pairWhere(r, [10000, 60000], [1000, 39000], (a, b) => a + b <= 99999, [45672, 28519])],
          [M, (r) => pairWhere(r, [20000, 99999], [1000, 19999], (a, b) => a > b, [73120, 28519])],
          ['×', (r) => pairWhere(r, [1000, 24999], [2, 9], (a, b) => a * b <= 99999, [12035, 4])],
          [':', (r) => pairWhere(r, [10000, 99999], [2, 9], (a, b) => a % b === 0, [48140, 4])],
        ])),
      lesson(1, 3, L('Số chẵn, số lẻ', 'Even and odd numbers'),
        L('Rô-bốt ISA xếp hàng đôi cho các bạn đi tham quan bảo tàng.', 'ISA the robot lines the children up in pairs for a trip to the museum.'),
        [
          { text: L('Số chẵn là số có chữ số tận cùng là 0, 2, 4, 6, 8. Số lẻ có chữ số tận cùng là 1, 3, 5, 7, 9.', 'Even numbers end in 0, 2, 4, 6 or 8. Odd numbers end in 1, 3, 5, 7 or 9.'), visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1, marks: [0, 2, 4, 6, 8, 10] }) },
          { text: L('Xếp thành từng đôi: số chẵn thì vừa đủ đôi, số lẻ thì thừa 1.', 'Put things into pairs: an even number makes pairs exactly, an odd number leaves 1 over.'), visual: vz('array', { rows: 2, cols: 4, emoji: '🧒' }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const n = R(rng, 10, lv(i) === 0 ? 99 : 99999); const ev = n % 2 === 0; const EVN = L('Số chẵn', 'Even number'), ODN = L('Số lẻ', 'Odd number'); return Q(L(`Số ${F(n)} là số chẵn hay số lẻ?`, `Is ${F(n)} an even number or an odd number?`), null, ch(rng, ev ? EVN : ODN, [ev ? ODN : EVN]), L('Nhìn chữ số tận cùng.', 'Look at the last digit.'), L(`${F(n)} có chữ số tận cùng là ${n % 10} nên là số ${ev ? 'chẵn' : 'lẻ'}.`, `${F(n)} ends in ${n % 10}, so it is an ${ev ? 'even' : 'odd'} number.`)); }
          if (f === 1) { const want = R(rng, 0, 1); const arr = []; while (arr.length < 3) { const x = R(rng, 100, 999); if (x % 2 !== want && !arr.includes(x)) arr.push(x); } let c; do c = R(rng, 100, 999); while (c % 2 !== want); return Q(L(`Số nào là số ${want ? 'lẻ' : 'chẵn'}?`, `Which number is ${want ? 'odd' : 'even'}?`), null, ch(rng, c, arr), L(`Số ${want ? 'lẻ' : 'chẵn'} có chữ số tận cùng là ${want ? '1, 3, 5, 7, 9' : '0, 2, 4, 6, 8'}.`, `${want ? 'Odd' : 'Even'} numbers end in ${want ? '1, 3, 5, 7 or 9' : '0, 2, 4, 6 or 8'}.`), L(`${c} là số ${want ? 'lẻ' : 'chẵn'}.`, `${c} is an ${want ? 'odd' : 'even'} number.`)); }
          if (f === 2) { const a = R(rng, 1, 40) * 2, b = a + R(rng, 3, 10) * 2; const cnt = (b - a) / 2 + 1; return Q(L(`Có bao nhiêu số chẵn từ ${a} đến ${b}?`, `How many even numbers are there from ${a} to ${b}?`), b - a <= 20 ? vz('numberLine', { min: a, max: b, step: 1, labelEvery: 2 }) : null, num(cnt), L('Hai số chẵn liên tiếp hơn kém nhau 2 đơn vị.', 'Two even numbers next to each other differ by 2.'), L(`(${b} ${M} ${a}) : 2 + 1 = ${cnt} (số).`, `(${b} ${M} ${a}) : 2 + 1 = ${cnt} (numbers).`)); }
          const n = R(rng, 10, 9998); const ev = R(rng, 0, 1);
          const nx = ev ? (n % 2 === 0 ? n + 2 : n + 1) : (n % 2 === 1 ? n + 2 : n + 1);
          return Q(L(`Số ${ev ? 'chẵn' : 'lẻ'} liền sau số ${F(n)} là số nào?`, `What is the next ${ev ? 'even' : 'odd'} number after ${F(n)}?`), null, num(nx), L(`Hai số ${ev ? 'chẵn' : 'lẻ'} liên tiếp hơn kém nhau 2.`, `Two ${ev ? 'even' : 'odd'} numbers next to each other differ by 2.`), L(`Số ${ev ? 'chẵn' : 'lẻ'} liền sau ${F(n)} là ${F(nx)}.`, `The next ${ev ? 'even' : 'odd'} number after ${F(n)} is ${F(nx)}.`));
        }),
      lesson(1, 4, L('Biểu thức chứa chữ', 'Expressions with letters'),
        L('Rô-bốt ISA dùng chữ a để thay cho cạnh của những viên gạch hoa vuông.', 'ISA the robot uses the letter a for the side of some square patterned tiles.'),
        [
          { text: L('a + 15 là biểu thức chứa chữ. Nếu a = 7 thì a + 15 = 7 + 15 = 22.', 'a + 15 is an expression with a letter. If a = 7, then a + 15 = 7 + 15 = 22.') },
          { text: L('Chu vi hình vuông cạnh a: P = a × 4. Với a = 5 cm thì P = 5 × 4 = 20 (cm).', 'The perimeter of a square with side a is P = a × 4. When a = 5 cm, P = 5 × 4 = 20 (cm).'), visual: vz('shape', { kind: 'square', dims: { a: 5 }, showDims: true }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 10, 500), b = R(rng, 10, 500), op = P(rng, ['+', M, '×']); const bb = op === '×' ? R(rng, 2, 9) : op === M ? R(rng, 1, a) : b; const v = opRes(a, op, bb); const ex = op === M ? `a ${M} ${bb}` : op === '×' ? `a × ${bb}` : `a + ${bb}`; return Q(L(`Tính giá trị của biểu thức ${ex} với a = ${a}.`, `Work out the value of the expression ${ex} when a = ${a}.`), null, num(v), L('Thay chữ bằng số rồi tính.', 'Replace the letter with the number, then calculate.'), L(`Với a = ${a}: ${a} ${op} ${bb} = ${F(v)}.`, `When a = ${a}: ${a} ${op} ${bb} = ${F(v)}.`)); }
          if (f === 1) { const a = R(rng, 2, 50); return Q(L(`Chu vi hình vuông cạnh a là P = a × 4. Tính P với a = ${a} cm.`, `The perimeter of a square with side a is P = a × 4. Work out P when a = ${a} cm.`), vz('shape', { kind: 'square', dims: { a }, showDims: true }), num(a * 4, 'cm'), L('Thay a bằng số đo cạnh.', 'Replace a with the length of the side.'), `P = ${a} × 4 = ${a * 4} (cm).`); }
          if (f === 2) { const a = R(rng, 10, 99), b = R(rng, 2, 9), c = R(rng, 10, 99); return Q(L(`Tính giá trị của biểu thức a × b + c với a = ${a}, b = ${b}, c = ${c}.`, `Work out the value of the expression a × b + c when a = ${a}, b = ${b} and c = ${c}.`), null, num(a * b + c), L('Thay chữ bằng số, nhân trước cộng sau.', 'Replace the letters with the numbers. Multiply first, then add.'), `${a} × ${b} + ${c} = ${a * b} + ${c} = ${a * b + c}.`); }
          const a = R(rng, 5, 40), b = R(rng, 2, a - 1);
          return Q(L(`Chu vi hình chữ nhật: P = (a + b) × 2. Tính P với a = ${a} cm, b = ${b} cm.`, `Perimeter of a rectangle: P = (a + b) × 2. Work out P when a = ${a} cm and b = ${b} cm.`), vz('shape', { kind: 'rect', dims: { a, b }, showDims: true }), num((a + b) * 2, 'cm'), L('Tính trong ngoặc trước.', 'Work out the brackets first.'), `P = (${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`);
        }),
      lesson(1, 5, L('Giải bài toán có ba bước tính', 'Word problems with three steps'),
        L('Rô-bốt ISA giúp các bạn lớp 4A tính tiền mua quà tặng thầy cô ngày 20 tháng 11.', "ISA the robot helps class 4A work out the cost of presents for their teachers on 20 November, Vietnamese Teachers' Day."),
        [
          { text: L('Đọc đề, tóm tắt, rồi tìm lần lượt từng bước. Mỗi bước trả lời một câu hỏi nhỏ.', 'Read the problem, write down the key facts, then solve it one step at a time. Each step answers one small question.'), visual: vz('tape', { bars: [{ label: L('Lớp 4A', 'Class 4A'), units: 5, value: '35' }, { label: L('Lớp 4B', 'Class 4B'), units: 6, value: '?' }], diff: '5', total: '?' }) },
        ],
        function (rng, i) {
          const t = i % 4;
          if (t === 0) { const p = R(rng, 5, 20) * 1000, n = R(rng, 2, 5), q = R(rng, 2, 9) * 1000, m = R(rng, 2, 4); const tot = p * n + q * m, pay = Math.ceil(tot / 100000) * 100000 === tot ? tot + 100000 : Math.ceil(tot / 100000) * 100000; return Q(L(`Mẹ mua ${n} kg thịt, mỗi ki-lô-gam giá ${F(p)} đồng và ${m} bó rau, mỗi bó giá ${F(q)} đồng. Mẹ đưa ${F(pay)} đồng. Hỏi người bán trả lại mẹ bao nhiêu tiền?`, `Mum buys ${n} kg of meat at ${F(p)} dong per kilogram and ${m} bunches of vegetables at ${F(q)} dong per bunch. She pays with ${F(pay)} dong. How much change does the seller give her?`), null, num(pay - tot, L('đồng', 'dong')), L('Bước 1: tiền thịt; bước 2: tiền rau; bước 3: tiền trả lại.', 'Step 1: the cost of the meat; step 2: the cost of the vegetables; step 3: the change.'), L(`Tiền thịt: ${F(p)} × ${n} = ${F(p * n)}; tiền rau: ${F(q)} × ${m} = ${F(q * m)}; trả lại: ${F(pay)} ${M} ${F(tot)} = ${F(pay - tot)} (đồng).`, `Meat: ${F(p)} × ${n} = ${F(p * n)}; vegetables: ${F(q)} × ${m} = ${F(q * m)}; change: ${F(pay)} ${M} ${F(tot)} = ${F(pay - tot)} (dong).`)); }
          if (t === 1) { const a = R(rng, 30, 45), d = R(rng, 2, 8), c = R(rng, 3, 9); return Q(L(`Lớp 4A có ${a} học sinh, lớp 4B nhiều hơn lớp 4A ${d} học sinh, lớp 4C ít hơn lớp 4B ${c} học sinh. Hỏi cả ba lớp có bao nhiêu học sinh?`, `Class 4A has ${a} pupils. Class 4B has ${d} more pupils than class 4A. Class 4C has ${c} fewer pupils than class 4B. How many pupils are there in the three classes altogether?`), vz('tape', { bars: [{ label: '4A', units: units(a, a + d), value: String(a) }, { label: '4B', units: units(a + d, a + d), value: '?' }, { label: '4C', units: units(a + d - c, a + d), value: '?' }], total: '?' }), num(a + (a + d) + (a + d - c)), L('Tìm số học sinh lớp 4B, rồi lớp 4C, rồi cả ba lớp.', 'Find the number of pupils in 4B, then in 4C, then in all three classes.'), L(`4B: ${a} + ${d} = ${a + d}; 4C: ${a + d} ${M} ${c} = ${a + d - c}; cả ba lớp: ${a} + ${a + d} + ${a + d - c} = ${3 * a + 2 * d - c} (học sinh).`, `4B: ${a} + ${d} = ${a + d}; 4C: ${a + d} ${M} ${c} = ${a + d - c}; all three classes: ${a} + ${a + d} + ${a + d - c} = ${3 * a + 2 * d - c} (pupils).`)); }
          if (t === 2) { const per = R(rng, 12, 30), n1 = R(rng, 3, 8), n2 = R(rng, 2, 6), sold = R(rng, 10, per * (n1 + n2) - 1); return Q(L(`Cửa hàng nhập ${n1} thùng táo và ${n2} thùng cam, mỗi thùng có ${per} kg. Cửa hàng đã bán ${sold} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam hoa quả?`, `A shop buys in ${n1} boxes of apples and ${n2} boxes of oranges. Each box holds ${per} kg. The shop has sold ${sold} kg. How many kilograms of fruit are left?`), null, num(per * (n1 + n2) - sold, 'kg'), L('Bước 1: số thùng; bước 2: số ki-lô-gam; bước 3: số còn lại.', 'Step 1: the number of boxes; step 2: the number of kilograms; step 3: how much is left.'), L(`${n1} + ${n2} = ${n1 + n2} (thùng); ${per} × ${n1 + n2} = ${per * (n1 + n2)} (kg); ${per * (n1 + n2)} ${M} ${sold} = ${per * (n1 + n2) - sold} (kg).`, `${n1} + ${n2} = ${n1 + n2} (boxes); ${per} × ${n1 + n2} = ${per * (n1 + n2)} (kg); ${per * (n1 + n2)} ${M} ${sold} = ${per * (n1 + n2) - sold} (kg).`)); }
          const a = R(rng, 20, 60), k = R(rng, 2, 4), d = R(rng, 5, 15);
          return Q(L(`Ngày thứ nhất đội trồng được ${a} cây. Ngày thứ hai trồng được gấp ${k} lần ngày thứ nhất. Ngày thứ ba trồng ít hơn ngày thứ hai ${d} cây. Hỏi cả ba ngày trồng được bao nhiêu cây?`, `On the first day a team planted ${a} trees. On the second day they planted ${k} times as many as on the first day. On the third day they planted ${d} fewer trees than on the second day. How many trees did they plant in the three days?`), null, num(a + a * k + a * k - d), L('Tìm số cây ngày thứ hai, ngày thứ ba, rồi cộng cả ba ngày.', 'Find the trees planted on day 2, then on day 3, then add up all three days.'), L(`Ngày 2: ${a} × ${k} = ${a * k}; ngày 3: ${a * k} ${M} ${d} = ${a * k - d}; cả ba ngày: ${a} + ${a * k} + ${a * k - d} = ${a + 2 * a * k - d} (cây).`, `Day 2: ${a} × ${k} = ${a * k}; day 3: ${a * k} ${M} ${d} = ${a * k - d}; all three days: ${a} + ${a * k} + ${a * k - d} = ${a + 2 * a * k - d} (trees).`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 2. GÓC VÀ ĐƠN VỊ ĐO GÓC ============
  const AK = [L('Góc nhọn', 'Acute angle'), L('Góc vuông', 'Right angle'), L('Góc tù', 'Obtuse angle'), L('Góc bẹt', 'Straight angle')];
  const angleKind = d => (d < 90 ? AK[0] : d === 90 ? AK[1] : d < 180 ? AK[2] : AK[3]);
  const akEN = k => (/^[AO]/.test(k) ? 'an ' : 'a ') + k.toLowerCase();   // "an acute angle", "a right angle"
  const c2 = {
    id: 'g4-c2', semester: 1, title: L('Góc và đơn vị đo góc', 'Angles and measuring angles'), icon: '📐', lessons: [
      lesson(2, 7, L('Đo góc, đơn vị đo góc', 'Measuring angles, units of angle'),
        L('Rô-bốt ISA dùng thước đo góc kiểm tra độ mở của chiếc quạt giấy.', 'ISA the robot uses a protractor to check how wide a paper fan opens.'),
        [
          { text: L('Đơn vị đo góc là độ, kí hiệu °. Dùng thước đo góc: đặt tâm thước trùng đỉnh góc, một cạnh trùng vạch 0.', 'Angles are measured in degrees, written °. To use a protractor, put its centre on the vertex of the angle and line up one arm with the 0 mark.'), visual: vz('angle', { deg: 60, protractor: true }) },
          { text: L('Góc vuông có số đo 90°.', 'A right angle measures 90°.'), visual: vz('angle', { deg: 90, protractor: true }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const d = R(rng, 1, 17) * 10; return Q(L('Góc dưới đây có số đo bao nhiêu độ?', 'How many degrees does the angle below measure?'), vz('angle', { deg: d, protractor: true }), num(d, '°'), L('Đọc số trên thước đo góc tại cạnh thứ hai, tính từ vạch 0.', 'Read the number where the second arm crosses the protractor, counting from the 0 mark.'), L(`Góc có số đo ${d}°.`, `The angle measures ${d}°.`)); }
          if (f === 1) { const a = R(rng, 2, 8) * 10, b = R(rng, 1, 17 - a / 10) * 10; const G1 = L('Góc thứ nhất', 'The first angle'), G2 = L('Góc thứ hai', 'The second angle'), EQ = L('Hai góc bằng nhau', 'The two angles are equal'); return Q(L(`Góc thứ nhất ${a}°, góc thứ hai ${b}°. Góc nào lớn hơn, lớn hơn bao nhiêu độ?`, `The first angle is ${a}° and the second angle is ${b}°. Which angle is bigger, and by how many degrees?`), vz('angle', { deg: Math.max(a, b), protractor: true }), a === b ? ch(rng, EQ, [`${G1}, 10°`, `${G2}, 10°`]) : ch(rng, `${a > b ? G1 : G2}, ${Math.abs(a - b)}°`, [`${a > b ? G2 : G1}, ${Math.abs(a - b)}°`, `${a > b ? G1 : G2}, ${a + b}°`]), L('So sánh hai số đo rồi trừ.', 'Compare the two measurements, then subtract.'), a === b ? EQ + '.' : `${Math.max(a, b)}° ${M} ${Math.min(a, b)}° = ${Math.abs(a - b)}°.`); }
          const d = R(rng, 1, 8) * 10;
          return Q(L(`Một góc vuông được chia thành hai góc, một góc ${d}°. Góc còn lại bao nhiêu độ?`, `A right angle is split into two angles. One of them is ${d}°. How many degrees is the other angle?`), vz('angle', { deg: 90, protractor: true }), num(90 - d, '°'), L('Góc vuông có số đo 90°.', 'A right angle measures 90°.'), `90° ${M} ${d}° = ${90 - d}°.`);
        }, [
          [0, 6, rng => { const d = R(rng, 1, 35) * 5; return Q(L('Dùng thước đo góc, đọc số đo của góc dưới đây.', 'Use the protractor to read the size of the angle below.'), vz('angle', { deg: d, protractor: true }), num(d, '°'), L('Đặt tâm thước trùng đỉnh góc, một cạnh trùng vạch 0; đọc số ở cạnh còn lại.', 'The centre of the protractor is on the vertex and one arm is on 0; read the number on the other arm.'), L(`Góc có số đo ${d}°.`, `The angle measures ${d}°.`)); }],
          [0, 9, rng => { const d = R(rng, 1, 17) * 10; return Q(L(`So sánh: góc ${d}° … góc vuông`, `Compare: an angle of ${d}° … a right angle`), vz('angle', { deg: d }), cmpAns(d, 90), L('Góc vuông có số đo 90°.', 'A right angle measures 90°.'), `${d}° ${sign(d, 90)} 90°.`); }],
          [0, 9, rng => { const d = R(rng, 2, 16) * 10, cl = P(rng, [d, d, d + 10, d - 10, 180 - d]); return Q(L(`Đúng hay sai?\nGóc dưới đây có số đo ${cl}°.`, `True or false?\nThe angle below measures ${cl}°.`), vz('angle', { deg: d, protractor: true }), tf(rng, cl === d), L('Đọc số đo trên thước bắt đầu từ vạch 0 trùng với một cạnh của góc.', 'Read the protractor starting from the 0 mark that lies on one arm of the angle.'), L(`Góc có số đo ${d}°. ${cl === d ? 'Đúng' : 'Sai'}.`, `The angle measures ${d}°. ${TF(cl === d)}.`)); }],
          [3, 9, rng => { const d = R(rng, 1, 35) * 5; return Q(L(`Một góc bẹt được chia thành hai góc, một góc có số đo ${d}°. Góc còn lại có số đo bao nhiêu độ?`, `A straight angle is split into two angles. One of them measures ${d}°. How many degrees does the other angle measure?`), vz('angle', { deg: 180, protractor: true }), num(180 - d, '°'), L('Góc bẹt có số đo 180°.', 'A straight angle measures 180°.'), `180° ${M} ${d}° = ${180 - d}°.`); }],
          [6, 9, rng => { const a = R(rng, 2, 12) * 10, b = R(rng, 1, 18 - a / 10) * 10; return Q(L(`Ghép góc ${a}° và góc ${b}° chung đỉnh, chung một cạnh (hai góc không chồng lên nhau) thì được một góc có số đo bao nhiêu độ?`, `An angle of ${a}° and an angle of ${b}° are put side by side, sharing the vertex and one arm (they do not overlap). How many degrees does the new angle measure?`), vz('angle', { deg: a + b }), num(a + b, '°'), L('Cộng số đo hai góc.', 'Add the two measurements.'), `${a}° + ${b}° = ${a + b}°.`); }],
        ])),
      lesson(2, 8, L('Góc nhọn, góc tù, góc bẹt', 'Acute, obtuse and straight angles'),
        L('Rô-bốt ISA quan sát hai kim đồng hồ tạo thành những góc khác nhau.', 'ISA the robot watches the two hands of a clock make different angles.'),
        [
          { text: L('Góc nhọn bé hơn góc vuông (dưới 90°).', 'An acute angle is smaller than a right angle (less than 90°).'), visual: vz('angle', { deg: 45 }) },
          { text: L('Góc tù lớn hơn góc vuông nhưng bé hơn góc bẹt.', 'An obtuse angle is bigger than a right angle but smaller than a straight angle.'), visual: vz('angle', { deg: 130 }) },
          { text: L('Góc bẹt bằng hai góc vuông (180°).', 'A straight angle is the same as two right angles (180°).'), visual: vz('angle', { deg: 180 }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const d = P(rng, [30, 45, 60, 75, 90, 110, 120, 135, 150, 180]); return Q(L('Góc dưới đây là góc gì?', 'What kind of angle is this?'), vz('angle', { deg: d }), ch(rng, angleKind(d), AK), L('So sánh góc với góc vuông (dùng ê ke).', 'Compare the angle with a right angle (use a set square).'), L(`Góc ${d}° là ${angleKind(d).toLowerCase()}.`, `${d}° is ${akEN(angleKind(d))}.`)); }
          if (f === 1) { const d = R(rng, 1, 17) * 10; return Q(L(`Góc có số đo ${d}° là góc gì?`, `An angle measures ${d}°. What kind of angle is it?`), null, ch(rng, angleKind(d), AK), L('Nhọn < 90° = vuông < tù < 180° = bẹt.', 'Acute < 90° = right < obtuse < 180° = straight.'), L(`${d}° là ${angleKind(d).toLowerCase()}.`, `${d}° is ${akEN(angleKind(d))}.`)); }
          const [h, d, k] = P(rng, [[3, 90, AK[1]], [6, 180, AK[3]], [2, 60, AK[0]], [4, 120, AK[2]], [1, 30, AK[0]], [5, 150, AK[2]]]);
          return Q(L(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc gì?`, `At ${h} o'clock, what kind of angle do the hour hand and the minute hand make?`), vz('clock', { h, m: 0 }), ch(rng, k, AK), L('Mỗi khoảng giữa hai số liền nhau trên mặt đồng hồ là 30°.', 'Each gap between two numbers next to each other on the clock face is 30°.'), L(`${h} × 30° = ${d}°: ${k.toLowerCase()}.`, `${h} × 30° = ${d}°: ${akEN(k)}.`));
        }, [
          [0, 9, rng => { const d = R(rng, 1, 18) * 10, k = angleKind(d), cl = P(rng, [k, k, ...AK.filter(x => x !== k)]); return Q(L(`Đúng hay sai?\nGóc có số đo ${d}° là ${cl.toLowerCase()}.`, `True or false?\nAn angle of ${d}° is ${akEN(cl)}.`), null, tf(rng, cl === k), L('Góc nhọn bé hơn 90°, góc vuông bằng 90°, góc tù lớn hơn 90° và bé hơn 180°, góc bẹt bằng 180°.', 'An acute angle is less than 90°, a right angle is 90°, an obtuse angle is more than 90° and less than 180°, and a straight angle is 180°.'), L(`${d}° là ${k.toLowerCase()}. ${cl === k ? 'Đúng' : 'Sai'}.`, `${d}° is ${akEN(k)}. ${TF(cl === k)}.`)); }],
          [0, 6, rng => { const O = P(rng, ['O', 'M', 'I', 'K', 'E']), [A, B] = U.sample(rng, ['A', 'B', 'C', 'D', 'P', 'Q', 'N', 'H'], 2), d = P(rng, [35, 50, 70, 90, 100, 125, 145, 160, 180]); return Q(L(`Góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B} dưới đây là góc gì?`, `What kind of angle is the angle below, with vertex ${O} and arms ${O}${A} and ${O}${B}?`), vz('angle', { deg: d, label: A + O + B }), ch(rng, angleKind(d), AK), L('Dùng ê ke so sánh góc với góc vuông.', 'Use a set square to compare the angle with a right angle.'), L(`Góc đỉnh ${O} là ${angleKind(d).toLowerCase()}.`, `The angle at vertex ${O} is ${akEN(angleKind(d))}.`)); }],
          [3, 9, rng => { const want = P(rng, [AK[0], AK[2]]), pool = { [AK[0]]: [20, 35, 45, 60, 75, 85], [AK[2]]: [95, 110, 120, 135, 150, 170] }; const good = P(rng, pool[want]), other = want === AK[0] ? AK[2] : AK[0]; const bad = [90, 180, P(rng, pool[other])]; return Q(L(`Góc có số đo nào dưới đây là ${want.toLowerCase()}?`, `Which of these angle sizes is ${akEN(want)}?`), null, ch(rng, `${good}°`, bad.map(x => `${x}°`)), L('Góc nhọn < 90° (góc vuông) < góc tù < 180° (góc bẹt).', 'Acute angle < 90° (right angle) < obtuse angle < 180° (straight angle).'), L(`${good}° là ${want.toLowerCase()}.`, `${good}° is ${akEN(want)}.`)); }],
          [3, 9, rng => { const d = R(rng, 1, 17) * 10, ref = P(rng, [[L('góc vuông', 'a right angle'), 90], [L('góc bẹt', 'a straight angle'), 180]]); return Q(L(`So sánh: góc ${d}° … ${ref[0]}`, `Compare: an angle of ${d}° … ${ref[0]}`), vz('angle', { deg: d }), cmpAns(d, ref[1]), L(`${ref[0][0].toUpperCase() + ref[0].slice(1)} có số đo ${ref[1]}°.`, `${cap(ref[0])} measures ${ref[1]}°.`), `${d}° ${sign(d, ref[1])} ${ref[1]}°.`); }],
          [6, 9, rng => { const a = R(rng, 2, 12) * 10, b = R(rng, 1, 18 - a / 10) * 10, k = angleKind(a + b); return Q(L(`Ghép góc ${a}° và góc ${b}° chung đỉnh, chung một cạnh (hai góc không chồng lên nhau) được một góc mới. Góc mới là góc gì?`, `An angle of ${a}° and an angle of ${b}° are put side by side, sharing the vertex and one arm (they do not overlap). What kind of angle is the new angle?`), null, ch(rng, k, AK), L('Cộng số đo hai góc rồi so sánh với 90° và 180°.', 'Add the two measurements, then compare with 90° and 180°.'), L(`${a}° + ${b}° = ${a + b}°: ${k.toLowerCase()}.`, `${a}° + ${b}° = ${a + b}°: ${akEN(k)}.`)); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 3. SỐ CÓ NHIỀU CHỮ SỐ ============
  const c3 = {
    id: 'g4-c3', semester: 1, title: L('Số có nhiều chữ số', 'Numbers with many digits'), icon: '🔢', lessons: [
      lesson(3, 10, L('Số có sáu chữ số. Số 1 000 000', 'Six-digit numbers. The number 1 000 000'),
        L('Rô-bốt ISA cùng bạn Chi đọc số lượt khách đến thăm Vịnh Hạ Long.', 'ISA the robot and Chi read out how many visitors came to Hạ Long Bay.'),
        [
          { text: L('Số 352 418 gồm 3 trăm nghìn, 5 chục nghìn, 2 nghìn, 4 trăm, 1 chục, 8 đơn vị; đọc là "ba trăm năm mươi hai nghìn bốn trăm mười tám".', 'The number 352 418 has 3 hundred thousands, 5 ten thousands, 2 thousands, 4 hundreds, 1 ten and 8 ones. It is read as "three hundred and fifty-two thousand four hundred and eighteen".'), visual: vz('placeValue', { number: 352418, columns: colsFor(352418) }) },
          { text: L('10 trăm nghìn = 1 000 000 (một triệu).', '10 hundred thousands = 1 000 000 (one million).') },
        ],
        bigNumberGen(100000, 999999)),
      lesson(3, 11, L('Hàng và lớp', 'Places and classes'),
        L('Rô-bốt ISA xếp các chữ số vào từng "ngôi nhà" hàng và lớp cho bạn Dũng.', 'ISA the robot puts each digit into its place-and-class "house" for Dũng.'),
        [
          { text: L('Lớp đơn vị: hàng đơn vị, chục, trăm. Lớp nghìn: hàng nghìn, chục nghìn, trăm nghìn.', 'The ones class: the ones, tens and hundreds places. The thousands class: the thousands, ten thousands and hundred thousands places.'), visual: vz('placeValue', { number: 653720, columns: colsFor(653720) }) },
          { text: L('Trong số 653 720, chữ số 5 ở hàng chục nghìn, lớp nghìn, có giá trị 50 000.', 'In 653 720, the digit 5 is in the ten thousands place, in the thousands class. Its value is 50 000.') },
        ],
        bigNumberGen(100000, 999999)),
      lesson(3, 12, L('Các số trong phạm vi lớp triệu', 'Numbers in the millions class'),
        L('Rô-bốt ISA đọc số dân của các tỉnh thành trong sách Địa lí cùng bạn Hà.', 'ISA the robot and Hà read the populations of provinces and cities in a geography book.'),
        [
          { text: L('Lớp triệu gồm hàng triệu, chục triệu, trăm triệu. Số 25 360 000 đọc là "hai mươi lăm triệu ba trăm sáu mươi nghìn".', 'The millions class has the millions, ten millions and hundred millions places. 25 360 000 is read as "twenty-five million three hundred and sixty thousand".'), visual: vz('placeValue', { number: 25360000, columns: colsFor(25360000) }) },
          { text: L('Đọc từ trái sang phải theo từng lớp: triệu – nghìn – đơn vị.', 'Read class by class from left to right: millions – thousands – ones.') },
        ],
        bigNumberGen(1000000, 999999999)),
      lesson(3, 13, L('Làm tròn số đến hàng trăm nghìn', 'Rounding to the nearest hundred thousand'),
        L('Rô-bốt ISA ước lượng số người tham gia giải chạy vì cộng đồng.', 'ISA the robot estimates how many people took part in a charity fun run.'),
        [
          { text: L('Làm tròn 1 362 500 đến hàng trăm nghìn: chữ số hàng chục nghìn là 6 (≥ 5) nên làm tròn lên: 1 400 000.', 'Round 1 362 500 to the nearest hundred thousand: the ten thousands digit is 6 (≥ 5), so round up: 1 400 000.'), visual: vz('numberLine', { min: 1300000, max: 1400000, step: 10000, labelEvery: 10, point: 1362500 }) },
          { text: L('Chữ số ngay sau hàng cần làm tròn bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.', 'Look at the digit just after the place you are rounding to: if it is less than 5, round down; if it is 5 or more, round up.') },
        ],
        function (rng, i) {
          const opts = [[100000, L('hàng trăm nghìn', 'the nearest hundred thousand')], [10000, L('hàng chục nghìn', 'the nearest ten thousand')], [1000, L('hàng nghìn', 'the nearest thousand')]];
          const [p, name] = lv(i) === 0 ? opts[0] : P(rng, opts);
          let n = R(rng, 100001, 9999999); if (n % p === 0) n += R(rng, 1, p - 1);
          const r = roundTo(n, p), lo = Math.floor(n / p) * p, f = i % 3;
          const look = L('Xét chữ số ngay sau hàng làm tròn.', 'Look at the digit just after the place you are rounding to.');
          if (f === 0) return Q(L(`Làm tròn số ${F(n)} đến ${name}.`, `Round ${F(n)} to ${name}.`), vz('numberLine', { min: lo, max: lo + p, step: p / 10, labelEvery: 10, point: n }), num(r), look, L(`${F(n)} làm tròn đến ${name} được ${F(r)}.`, `${F(n)} rounded to ${name} is ${F(r)}.`));
          if (f === 1) return Q(L(`Làm tròn số ${F(n)} đến ${name} ta được:`, `Round ${F(n)} to ${name}. You get:`), null, ch(rng, F(r), [r === lo ? lo + p : lo, r + p, Math.max(p, r - 2 * p), roundTo(n, p * 10)].filter(x => x !== r).map(x => F(x))), look, `${F(r)}.`);
          const pop = R(rng, 10, 99) * 100000 + R(rng, 1, 99999);
          return Q(L(`Một tỉnh có ${F(pop)} người. Làm tròn số dân đến hàng trăm nghìn thì được khoảng bao nhiêu người?`, `A province has ${F(pop)} people. Round the population to the nearest hundred thousand. About how many people is that?`), null, num(roundTo(pop, 100000)), L('Xét chữ số hàng chục nghìn.', 'Look at the ten thousands digit.'), L(`Khoảng ${F(roundTo(pop, 100000))} người.`, `About ${F(roundTo(pop, 100000))} people.`));
        }),
      lesson(3, 14, L('So sánh các số có nhiều chữ số', 'Comparing numbers with many digits'),
        L('Rô-bốt ISA so sánh diện tích các quốc gia trên quả địa cầu cùng bạn Nam.', 'ISA the robot and Nam compare the areas of countries on the globe.'),
        [
          { text: L('Số nào có nhiều chữ số hơn thì lớn hơn: 1 000 000 > 999 999.', 'A number with more digits is bigger: 1 000 000 > 999 999.') },
          { text: L('Cùng số chữ số: so sánh từng cặp chữ số từ trái sang phải. 693 251 < 693 512.', 'With the same number of digits, compare the digits in pairs from left to right. 693 251 < 693 512.'), visual: vz('compare', { left: F(693251), right: F(693512) }) },
        ],
        function (rng, i) {
          const f = i % 3, lvl = lv(i);
          if (f === 0) {
            const a = R(rng, 100000, 99999999); let b;
            if (lvl === 0) b = R(rng, 100000, 99999999); else { const p = Math.pow(10, R(rng, 1, String(a).length - 2)); b = Math.floor(a / (p * 10)) * p * 10 + R(rng, 0, p * 10 - 1); }
            if (R(rng, 0, 6) === 0) b = a;
            return Q(L(`So sánh: ${F(a)} … ${F(b)}`, `Compare: ${F(a)} … ${F(b)}`), vz('compare', { left: F(a), right: F(b) }), cmpAns(a, b), L('Đếm số chữ số trước; bằng nhau thì so sánh từ trái sang phải.', 'Count the digits first; if there are the same number of digits, compare from left to right.'), `${F(a)} ${sign(a, b)} ${F(b)}.`);
          }
          const base = R(rng, 100000, 9000000);
          const arr = []; while (arr.length < 4) { const x = base + R(rng, 0, 999999); if (!arr.includes(x)) arr.push(x); }
          const asc = arr.slice().sort((x, y) => x - y), s = a => a.map(F).join('; ');
          if (f === 1) { const big = R(rng, 0, 1), v = big ? asc[3] : asc[0]; return Q(L(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${s(arr)} là:`, `The ${big ? 'largest' : 'smallest'} of the numbers ${s(arr)} is:`), null, ch(rng, F(v), arr.map(F)), L('So sánh từng hàng từ trái sang phải.', 'Compare place by place, from left to right.'), L(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${F(v)}.`, `The ${big ? 'largest' : 'smallest'} number is ${F(v)}.`)); }
          return Q(L(`Sắp xếp các số ${s(arr)} theo thứ tự từ lớn đến bé:`, `Put the numbers ${s(arr)} in order from largest to smallest:`), null, ch(rng, s(asc.slice().reverse()), [s(asc), s(arr), s([asc[3], asc[1], asc[2], asc[0]])]), L('Tìm số lớn nhất trước.', 'Find the largest number first.'), `${s(asc.slice().reverse())}.`);
        }),
      lesson(3, 15, L('Làm quen với dãy số tự nhiên', 'The sequence of natural numbers'),
        L('Rô-bốt ISA đếm tiếp các số tự nhiên trên tia số dài mãi không có điểm cuối.', 'ISA the robot keeps counting natural numbers along a number line that never ends.'),
        [
          { text: L('Các số 0, 1, 2, 3, … là các số tự nhiên. Số 0 là số tự nhiên bé nhất; không có số tự nhiên lớn nhất.', 'The numbers 0, 1, 2, 3, … are natural numbers. 0 is the smallest natural number; there is no largest natural number.'), visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1 }) },
          { text: L('Hai số tự nhiên liên tiếp hơn (kém) nhau 1 đơn vị.', 'Two natural numbers next to each other differ by 1.') },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const n = R(rng, 1000, 9999999), nx = R(rng, 0, 1); return Q(L(`Số liền ${nx ? 'sau' : 'trước'} của ${F(n)} là:`, `The number just ${nx ? 'after' : 'before'} ${F(n)} is:`), null, num(nx ? n + 1 : n - 1), L(`Số liền ${nx ? 'sau thêm' : 'trước bớt'} 1.`, nx ? 'The number just after is 1 more.' : 'The number just before is 1 less.'), `${F(n)} ${nx ? '+' : M} 1 = ${F(nx ? n + 1 : n - 1)}.`); }
          if (f === 1) {
            const FACTS = EN ? [['The smallest natural number is:', '0', ['1', '10', 'There is none']], ['The largest natural number is:', 'There is none', ['999 999 999', '1 000 000 000', '0']], ['Two natural numbers next to each other differ by:', '1', ['2', '10', '0']]]
              : [['Số tự nhiên bé nhất là:', '0', ['1', '10', 'Không có']], ['Số tự nhiên lớn nhất là:', 'Không có', ['999 999 999', '1 000 000 000', '0']], ['Hai số tự nhiên liên tiếp hơn kém nhau:', '1 đơn vị', ['2 đơn vị', '10 đơn vị', '0 đơn vị']]];
            const [p, c, d] = P(rng, FACTS); return Q(p, null, ch(rng, c, d), L('Nhớ đặc điểm của dãy số tự nhiên.', 'Remember what the sequence of natural numbers is like.'), L(`Đáp án: ${c}.`, `Answer: ${c}.`));
          }
          if (f === 2) { const st = R(rng, 2, 9), a = R(rng, 0, 50); const seq = [0, 1, 2, 3, 4].map(k => a + k * st); const miss = R(rng, 2, 4); return Q(L(`Tìm số thích hợp ở ô ?:\n${seq.map((v, k) => (k === miss ? '?' : F(v))).join('; ')}`, `Find the missing number:\n${seq.map((v, k) => (k === miss ? '?' : F(v))).join('; ')}`), null, num(seq[miss]), L('Tìm quy luật: mỗi số hơn số liền trước bao nhiêu?', 'Find the rule: how much bigger is each number than the one before it?'), L(`Mỗi số hơn số liền trước ${st} đơn vị: ${F(seq[miss])}.`, `Each number is ${st} more than the one before it: ${F(seq[miss])}.`)); }
          const a = R(rng, 10, 500), b = a + R(rng, 5, 40);
          return Q(L(`Có bao nhiêu số tự nhiên từ ${a} đến ${b}?`, `How many natural numbers are there from ${a} to ${b}?`), null, num(b - a + 1), L('Lấy số cuối trừ số đầu rồi cộng 1.', 'Take the first number away from the last number, then add 1.'), L(`${b} ${M} ${a} + 1 = ${b - a + 1} (số).`, `${b} ${M} ${a} + 1 = ${b - a + 1} (numbers).`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. MỘT SỐ ĐƠN VỊ ĐO ĐẠI LƯỢNG ============
  const centuryOf = y => Math.floor((y - 1) / 100) + 1;
  const c4 = {
    id: 'g4-c4', semester: 1, title: L('Một số đơn vị đo đại lượng', 'Some units of measurement'), icon: '⚖️', lessons: [
      // English: yến (10 kg) has no English name and stays "yến"; tạ (100 kg) = quintal; tấn = tonne
      lesson(4, 17, L('Yến, tạ, tấn', 'Yến, quintals and tonnes'),
        L('Rô-bốt ISA theo bác nông dân bạn Phúc đi cân những bao thóc sau mùa gặt.', 'ISA the robot goes with Phúc and a farmer to weigh the sacks of paddy rice after the harvest.'),
        [
          { text: L('1 yến = 10 kg; 1 tạ = 10 yến = 100 kg; 1 tấn = 10 tạ = 1000 kg.', '1 yến = 10 kg; 1 quintal = 10 yến = 100 kg; 1 tonne = 10 quintals = 1000 kg. (Yến is a Vietnamese unit of mass.)'), visual: vz('scale', { left: [{ label: '🌾 1 yến', kg: 10 }], right: [{ label: '5 kg', kg: 5 }, { label: '5 kg', kg: 5 }] }) },
          { text: L('Con voi nặng khoảng 5 tấn; con lợn nặng khoảng 1 tạ.', 'An elephant weighs about 5 tonnes; a pig weighs about 1 quintal.') },
        ],
        function (rng, i) {
          const f = i % 4, a = R(rng, 2, 9);
          if (f === 0) { const [p, v, u] = P(rng, EN ? [[`${a} yến = ? kg`, a * 10, 'kg'], [`${a} quintals = ? kg`, a * 100, 'kg'], [`${a} tonnes = ? kg`, a * 1000, 'kg'], [`${a} tonnes = ? quintals`, a * 10, 'quintals'], [`${a * 10} yến = ? quintals`, a, 'quintals'], [`${a} quintals ${a} kg = ? kg`, a * 101, 'kg']]
            : [[`${a} yến = ? kg`, a * 10, 'kg'], [`${a} tạ = ? kg`, a * 100, 'kg'], [`${a} tấn = ? kg`, a * 1000, 'kg'], [`${a} tấn = ? tạ`, a * 10, 'tạ'], [`${a * 10} yến = ? tạ`, a, 'tạ'], [`${a} tạ ${a} kg = ? kg`, a * 101, 'kg']]); return Q(p, null, num(v, u), L('1 yến = 10 kg; 1 tạ = 100 kg; 1 tấn = 1000 kg.', '1 yến = 10 kg; 1 quintal = 100 kg; 1 tonne = 1000 kg.'), `${p.replace('?', F(v))}.`); }
          if (f === 1) { const x = R(rng, 1, 9), y = x * 100 + P(rng, [-50, 0, 30]); const xq = L(`${x} tạ`, `${x} ${pl(x, 'quintal', 'quintals')}`); return Q(L(`So sánh: ${x} tạ … ${y} kg`, `Compare: ${xq} … ${y} kg`), vz('compare', { left: xq, right: `${y} kg` }), cmpAns(x * 100, y), L('Đổi về cùng đơn vị ki-lô-gam.', 'Change both to kilograms.'), `${xq} = ${x * 100} kg; ${x * 100} ${sign(x * 100, y)} ${y}.`); }
          if (f === 2) { const t = R(rng, 2, 6), q = R(rng, 1, 9); return Q(L(`Một xe tải chở ${t} tấn gạo, một xe khác chở ${q} tạ gạo. Cả hai xe chở bao nhiêu tạ gạo?`, `One lorry carries ${t} tonnes of rice and another lorry carries ${q} ${pl(q, 'quintal', 'quintals')} of rice. How many quintals of rice do the two lorries carry altogether?`), null, num(t * 10 + q, L('tạ', 'quintals')), L('Đổi tấn ra tạ: 1 tấn = 10 tạ.', 'Change the tonnes to quintals: 1 tonne = 10 quintals.'), L(`${t} tấn = ${t * 10} tạ; ${t * 10} + ${q} = ${t * 10 + q} (tạ).`, `${t} tonnes = ${t * 10} quintals; ${t * 10} + ${q} = ${t * 10 + q} (quintals).`)); }
          const [p, u] = P(rng, EN ? [['An elephant weighs about 5 …', 'tonnes'], ['Two pigs weigh about 2 …', 'quintals'], ['A sack of rice weighs about 5 …', 'yến'], ["A hen's egg weighs about 50 …", 'g']]
            : [['Con voi nặng khoảng 5 …', 'tấn'], ['Con lợn nặng khoảng 1 …', 'tạ'], ['Bao gạo nặng khoảng 5 …', 'yến'], ['Quả trứng gà nặng khoảng 50 …', 'g']]);
          return Q(L(`Chọn đơn vị thích hợp:\n${p}`, `Choose the right unit:\n${p}`), null, ch(rng, u, (EN ? ['tonnes', 'quintals', 'yến', 'kg', 'g'] : ['tấn', 'tạ', 'yến', 'kg', 'g']).filter(x => x !== u)), L('Hình dung khối lượng thật.', 'Think about how heavy the real thing is.'), `${p.replace('…', u)}.`);
        }),
      lesson(4, 18, L('Đề-xi-mét vuông, mét vuông, mi-li-mét vuông', 'Square decimetres, square metres, square millimetres'),
        L('Rô-bốt ISA đo diện tích bảng lớp và mặt bàn học cùng bạn Lan.', 'ISA the robot and Lan measure the area of the classroom board and of a desk top.'),
        [
          { text: L('1 dm² là diện tích hình vuông cạnh 1 dm. 1 dm² = 100 cm².', '1 dm² is the area of a square with sides of 1 dm. 1 dm² = 100 cm².'), visual: vz('areaGrid', { w: 10, h: 10, unit: 'cm', fill: true }) },
          { text: '1 m² = 100 dm²; 1 cm² = 100 mm².' },
        ],
        function (rng, i) {
          const f = i % 3, a = R(rng, 2, 9);
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} dm² = ? cm²`, a * 100, 'cm²'], [`${a} m² = ? dm²`, a * 100, 'dm²'], [`${a} cm² = ? mm²`, a * 100, 'mm²'], [`${a * 100} cm² = ? dm²`, a, 'dm²'], [`${a} m² = ? cm²`, a * 10000, 'cm²']]); return Q(p, null, num(v, u), '1 m² = 100 dm²; 1 dm² = 100 cm²; 1 cm² = 100 mm².', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const w = R(rng, 2, 9), h = R(rng, 2, 9); return Q(L(`Một tấm bảng hình chữ nhật dài ${w} m, rộng ${h} dm. Tính diện tích tấm bảng theo đề-xi-mét vuông.`, `A rectangular board is ${w} m long and ${h} dm wide. Work out the area of the board in square decimetres.`), vz('shape', { kind: 'rect', dims: { a: w * 10, b: h }, showDims: true }), num(w * 10 * h, 'dm²'), L('Đổi chiều dài ra đề-xi-mét.', 'Change the length to decimetres first.'), `${w} m = ${w * 10} dm; ${w * 10} × ${h} = ${w * 10 * h} (dm²).`); }
          const [p, u] = P(rng, EN ? [['A classroom has an area of about 50 …', 'm²'], ['A page of an exercise book has an area of about 4 …', 'dm²'], ['A stamp has an area of about 6 …', 'cm²'], ['The face of a shirt button has an area of about 100 …', 'mm²']]
            : [['Diện tích phòng học khoảng 50 …', 'm²'], ['Diện tích một trang vở khoảng 4 …', 'dm²'], ['Diện tích con tem khoảng 6 …', 'cm²'], ['Diện tích mặt chiếc cúc áo khoảng 100 …', 'mm²']]);
          return Q(L(`Chọn đơn vị thích hợp:\n${p}`, `Choose the right unit:\n${p}`), null, ch(rng, u, ['m²', 'dm²', 'cm²', 'mm²'].filter(x => x !== u)), L('Hình dung độ lớn thật.', 'Think about how big the real thing is.'), `${p.replace('…', u)}.`);
        }),
      lesson(4, 19, L('Giây, thế kỉ', 'Seconds and centuries'),
        L('Rô-bốt ISA bấm đồng hồ giây khi bạn Quân chạy thi ở hội khỏe Phù Đổng.', 'ISA the robot times Quân with a stopwatch in a race at the Phù Đổng sports festival.'),
        [
          { text: L('1 phút = 60 giây. Kim giây quay một vòng hết 1 phút.', '1 minute = 60 seconds. The second hand goes all the way round in 1 minute.'), visual: vz('clock', { h: 10, m: 10 }) },
          { text: L('1 thế kỉ = 100 năm. Từ năm 1 đến năm 100 là thế kỉ I; … từ năm 2001 đến năm 2100 là thế kỉ XXI.', '1 century = 100 years. The years 1 to 100 are the 1st century (I); … the years 2001 to 2100 are the 21st century (XXI).') },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 2, 9); const [p, v, u] = P(rng, EN ? [[`${a} minutes = ? seconds`, a * 60, 'seconds'], [`1 minute ${a * 5} seconds = ? seconds`, 60 + a * 5, 'seconds'], [`${a} centuries = ? years`, a * 100, 'years'], [`${a * 60} seconds = ? minutes`, a, 'minutes']]
            : [[`${a} phút = ? giây`, a * 60, 'giây'], [`1 phút ${a * 5} giây = ? giây`, 60 + a * 5, 'giây'], [`${a} thế kỉ = ? năm`, a * 100, 'năm'], [`${a * 60} giây = ? phút`, a, 'phút']]); return Q(p, null, num(v, u), L('1 phút = 60 giây; 1 thế kỉ = 100 năm.', '1 minute = 60 seconds; 1 century = 100 years.'), `${p.replace('?', F(v))}.`); }
          if (f === 1) { const y = R(rng, 1001, 2100), c = centuryOf(y), rom = n => (n <= 20 ? toRoman(n) : 'XX' + toRoman(n - 20)), cr = n => L('Thế kỉ ' + rom(n), `${ord(n)} century (${rom(n)})`); return Q(L(`Năm ${y} thuộc thế kỉ nào?`, `Which century is the year ${y} in?`), null, ch(rng, cr(c), [cr(c + 1), cr(c - 1), cr(Math.floor(y / 100) === c ? c + 2 : Math.floor(y / 100))]), L('Năm có hai chữ số cuối là 00 thì thuộc thế kỉ bằng hai chữ số đầu; còn lại thì lấy hai chữ số đầu cộng 1.', 'If the last two digits of the year are 00, the century is the number made by the first two digits; otherwise add 1 to that number.'), L(`Năm ${y} thuộc thế kỉ ${toRoman(c)} (thế kỉ thứ ${c}).`, `The year ${y} is in the ${ord(c)} century (${toRoman(c)}).`)); }
          if (f === 2) { const [ev, y] = P(rng, EN ? [['Uncle Hồ (President Hồ Chí Minh) was born in 1890', 1890], ['The August Revolution succeeded in 1945', 1945], ['This year is 2026', 2026], ['The Trưng Sisters led an uprising in the year 40', 40], ['Ngô Quyền won the Battle of Bạch Đằng in 938', 938]]
            : [['Bác Hồ sinh năm 1890', 1890], ['Cách mạng tháng Tám thành công năm 1945', 1945], ['Năm 2026', 2026], ['Hai Bà Trưng khởi nghĩa năm 40', 40], ['Ngô Quyền chiến thắng Bạch Đằng năm 938', 938]]); const c = centuryOf(y); return Q(L(`${ev}. Năm đó thuộc thế kỉ thứ mấy?`, `${ev}. Which century is that year in? Type the century as a number.`), null, num(c), L('Thế kỉ thứ n gồm các năm từ (n − 1) × 100 + 1 đến n × 100.', 'The nth century is the years from (n − 1) × 100 + 1 to n × 100.'), L(`Năm ${y} thuộc thế kỉ ${c <= 20 ? toRoman(c) : 'XX' + toRoman(c - 20)} (thứ ${c}).`, `The year ${y} is in the ${ord(c)} century (${c <= 20 ? toRoman(c) : 'XX' + toRoman(c - 20)}).`)); }
          const a = R(rng, 50, 90), b = R(rng, 50, 90); const [x, y] = two(rng);
          const SAME = L('Hai bạn nhanh như nhau', 'They are equally fast');
          return Q(L(`Bạn ${x} chạy 100 m hết ${a} giây, bạn ${y} chạy hết ${b} giây. Ai chạy nhanh hơn?`, `${x} runs 100 m in ${a} seconds and ${y} runs it in ${b} seconds. Who is faster?`), null, a === b ? ch(rng, SAME, [x, y]) : ch(rng, a < b ? x : y, [a < b ? y : x, SAME]), L('Ai chạy hết ít thời gian hơn thì nhanh hơn.', 'The one who takes less time is faster.'), a === b ? L('Hai bạn chạy hết thời gian bằng nhau.', 'They both take the same time.') : L(`${Math.min(a, b)} giây < ${Math.max(a, b)} giây nên ${a < b ? x : y} chạy nhanh hơn.`, `${Math.min(a, b)} seconds < ${Math.max(a, b)} seconds, so ${a < b ? x : y} is faster.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 5. PHÉP CỘNG VÀ PHÉP TRỪ ============
  const c5 = {
    id: 'g4-c5', semester: 1, title: L('Phép cộng và phép trừ', 'Addition and subtraction'), icon: '➕', lessons: [
      lesson(5, 22, L('Phép cộng các số có nhiều chữ số', 'Adding numbers with many digits'),
        L('Rô-bốt ISA cộng số khách du lịch đến Huế trong hai tháng hè.', 'ISA the robot adds up the number of tourists who visited Huế in two summer months.'),
        [{ text: L('367 859 + 541 728 = 909 587. Đặt tính thẳng cột, cộng từ phải sang trái.', '367 859 + 541 728 = 909 587. Line up the digits in columns and add from right to left.'), visual: vz('columnCalc', { a: 367859, b: 541728, op: '+', reveal: 'all' }) }],
        colGen('+', (r, L) => pairWhere(r, L === 0 ? [10000, 99999] : [100000, 6000000], L === 0 ? [1000, 99999] : [10000, 3000000], (a, b) => (L === 0 || !noCarry(a, b)), [367859, 541728]))),
      lesson(5, 23, L('Phép trừ các số có nhiều chữ số', 'Subtracting numbers with many digits'),
        L('Rô-bốt ISA tính số tiền tiết kiệm còn lại của gia đình bạn Thảo.', "ISA the robot works out how much of Thảo's family savings is left."),
        [{ text: L('865 279 − 450 237 = 415 042. Đặt tính thẳng cột, trừ từ phải sang trái.', '865 279 − 450 237 = 415 042. Line up the digits in columns and subtract from right to left.'), visual: vz('columnCalc', { a: 865279, b: 450237, op: M, reveal: 'all' }) }],
        colGen(M, (r, L) => pairWhere(r, L === 0 ? [10000, 99999] : [100000, 9000000], L === 0 ? [1000, 9999] : [10000, 900000], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [865279, 450237]))),
      lesson(5, 24, L('Tính chất giao hoán và kết hợp của phép cộng', 'The commutative and associative properties of addition'),
        L('Rô-bốt ISA chỉ cho bạn Tú cách nhóm số để cộng nhẩm thật nhanh.', 'ISA the robot shows Tú how to group numbers to add them in your head quickly.'),
        [
          { text: L('Giao hoán: a + b = b + a. Đổi chỗ các số hạng thì tổng không thay đổi.', 'Commutative: a + b = b + a. If you swap the addends, the sum stays the same.') },
          { text: L('Kết hợp: (a + b) + c = a + (b + c). Nhóm các số tròn chục, tròn trăm để tính nhanh: 98 + 375 + 2 = 375 + (98 + 2) = 475.', 'Associative: (a + b) + c = a + (b + c). Group numbers that make whole tens or hundreds to work quickly: 98 + 375 + 2 = 375 + (98 + 2) = 475.') },
        ],
        function (rng, i) {
          const f = i % 4;
          const MISS = L('Số thích hợp ở ô ?:', 'Find the missing number:'), EASY = L('Tính bằng cách thuận tiện:', 'Calculate in the easiest way:');
          if (f === 0) { const a = R(rng, 100, 9999), b = R(rng, 100, 9999); return Q(`${MISS}\n${F(a)} + ${F(b)} = ${F(b)} + ?`, null, num(a), L('Tính chất giao hoán của phép cộng.', 'Use the commutative property of addition.'), `${F(a)} + ${F(b)} = ${F(b)} + ${F(a)}.`); }
          if (f === 1) { const x = R(rng, 1, 9) * 10 + R(rng, 1, 9), y = 100 - x, z = R(rng, 100, 999); return Q(`${EASY}\n${x} + ${z} + ${y}`, null, num(x + y + z), L(`Nhóm ${x} với ${y} cho tròn trăm.`, `Group ${x} with ${y} to make a whole hundred.`), `${x} + ${z} + ${y} = ${z} + (${x} + ${y}) = ${z} + 100 = ${z + 100}.`); }
          if (f === 2) { const a = R(rng, 100, 999), c = R(rng, 10, 99), bb = R(rng, 10, 99); return Q(`${MISS}\n(${a} + ${bb}) + ${c} = ${a} + (? + ${c})`, null, num(bb), L('Tính chất kết hợp của phép cộng.', 'Use the associative property of addition.'), `(${a} + ${bb}) + ${c} = ${a} + (${bb} + ${c}).`); }
          const parts = [R(rng, 101, 499), R(rng, 101, 499)]; const comp = parts.map(p => Math.ceil(p / 100) * 100 - p).map((c, k) => (c === 0 ? 100 : c));
          const terms = U.shuffle(rng, [parts[0], comp[0], parts[1], comp[1]]); const s = terms.reduce((x, y) => x + y, 0);
          return Q(`${EASY}\n${terms.join(' + ')}`, null, num(s), L('Ghép các cặp số có tổng tròn trăm.', 'Pair up numbers whose sum is a whole number of hundreds.'), `(${parts[0]} + ${comp[0]}) + (${parts[1]} + ${comp[1]}) = ${parts[0] + comp[0]} + ${parts[1] + comp[1]} = ${s}.`);
        }),
      lesson(5, 25, L('Tìm hai số biết tổng và hiệu của hai số đó', 'Finding two numbers from their sum and difference'),
        L('Rô-bốt ISA giúp bạn Việt tìm tuổi của bố và tuổi của mình qua một câu đố.', "ISA the robot helps Việt solve a puzzle to find his dad's age and his own."),
        [
          { text: L('Vẽ sơ đồ: số lớn là đoạn dài, số bé là đoạn ngắn; tổng là cả hai đoạn, hiệu là phần dài hơn.', 'Draw a bar model: the bigger number is the long bar, the smaller number is the short bar; the sum is both bars together, and the difference is the extra part of the long bar.'), visual: vz('tape', { bars: [{ label: L('Số lớn', 'Bigger'), units: 8, value: '?' }, { label: L('Số bé', 'Smaller'), units: 5, value: '?' }], total: '70', diff: '16' }) },
          { text: L('Số bé = (Tổng − Hiệu) : 2. Số lớn = (Tổng + Hiệu) : 2. Ví dụ: (70 − 16) : 2 = 27; 27 + 16 = 43.', 'Smaller number = (Sum − Difference) : 2. Bigger number = (Sum + Difference) : 2. For example: (70 − 16) : 2 = 27; 27 + 16 = 43.') },
        ],
        function (rng, i) {
          const lvl = lv(i), b = R(rng, lvl === 0 ? 5 : 20, lvl === 0 ? 40 : 900), d = R(rng, 2, lvl === 0 ? 20 : 300) * 1, a = b + d, S = a + b;
          const tape = (la, lb, unit) => vz('tape', { bars: [{ label: la, units: units(a, a), value: '?' }, { label: lb, units: units(b, a), value: '?' }], total: F(S) + (unit || ''), diff: F(d) + (unit || '') });
          const t = i % 4;
          const BIG = L('Số lớn', 'Bigger'), SMALL = L('Số bé', 'Smaller');
          if (t === 0) return Q(L(`Tổng của hai số là ${F(S)}, hiệu của chúng là ${F(d)}. Tìm số lớn.`, `The sum of two numbers is ${F(S)} and their difference is ${F(d)}. Find the bigger number.`), tape(BIG, SMALL), num(a), L('Số lớn = (Tổng + Hiệu) : 2.', 'Bigger number = (Sum + Difference) : 2.'), L(`Số lớn: (${F(S)} + ${F(d)}) : 2 = ${F(a)}.`, `Bigger number: (${F(S)} + ${F(d)}) : 2 = ${F(a)}.`));
          if (t === 1) return Q(L(`Tổng của hai số là ${F(S)}, hiệu của chúng là ${F(d)}. Tìm số bé.`, `The sum of two numbers is ${F(S)} and their difference is ${F(d)}. Find the smaller number.`), tape(BIG, SMALL), num(b), L('Số bé = (Tổng − Hiệu) : 2.', 'Smaller number = (Sum − Difference) : 2.'), L(`Số bé: (${F(S)} ${M} ${F(d)}) : 2 = ${F(b)}.`, `Smaller number: (${F(S)} ${M} ${F(d)}) : 2 = ${F(b)}.`));
          if (t === 2) { const c = R(rng, 6, 12), dd = R(rng, 22, 32); const f2 = c + dd; return Q(L(`Tuổi bố và tuổi con cộng lại được ${c + f2} tuổi. Bố hơn con ${dd} tuổi. Hỏi con bao nhiêu tuổi?`, `A dad's age and his child's age add up to ${c + f2} years. The dad is ${dd} years older than the child. How old is the child?`), vz('tape', { bars: [{ label: L('Bố', 'Dad'), units: units(f2, f2), value: '?' }, { label: L('Con', 'Child'), units: units(c, f2), value: '?' }], total: (c + f2) + L(' tuổi', ' years'), diff: dd + L(' tuổi', ' years') }), num(c, L('tuổi', 'years old')), L('Tuổi con là số bé.', "The child's age is the smaller number."), L(`Tuổi con: (${c + f2} ${M} ${dd}) : 2 = ${c} (tuổi). Tuổi bố: ${c} + ${dd} = ${f2} (tuổi).`, `Child: (${c + f2} ${M} ${dd}) : 2 = ${c} (years old). Dad: ${c} + ${dd} = ${f2} (years old).`)); }
          const boys = R(rng, 12, 22), dg = R(rng, 1, 6), girls = boys + dg;
          return Q(L(`Lớp 4B có ${boys + girls} học sinh, số bạn nữ nhiều hơn số bạn nam ${dg} bạn. Hỏi lớp có bao nhiêu bạn nữ?`, `Class 4B has ${boys + girls} pupils. The number of girls is ${dg} more than the number of boys. How many girls are there in the class?`), vz('tape', { bars: [{ label: L('Nữ', 'Girls'), units: units(girls, girls), value: '?' }, { label: L('Nam', 'Boys'), units: units(boys, girls), value: '?' }], total: String(boys + girls), diff: String(dg) }), num(girls), L('Số bạn nữ là số lớn: (Tổng + Hiệu) : 2.', 'The number of girls is the bigger number: (Sum + Difference) : 2.'), L(`Số bạn nữ: (${boys + girls} + ${dg}) : 2 = ${girls} (bạn).`, `Girls: (${boys + girls} + ${dg}) : 2 = ${girls}.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. ĐƯỜNG THẲNG VUÔNG GÓC, ĐƯỜNG THẲNG SONG SONG ============
  const AND = L('và', 'and');
  const c6 = {
    id: 'g4-c6', semester: 1, title: L('Đường thẳng vuông góc, đường thẳng song song', 'Perpendicular lines and parallel lines'), icon: '📏', lessons: [
      lesson(6, 27, L('Hai đường thẳng vuông góc', 'Perpendicular lines'),
        L('Rô-bốt ISA tìm các cạnh vuông góc trên khung cửa sổ lớp học.', 'ISA the robot looks for perpendicular sides on the frame of the classroom window.'),
        [
          { text: L('Hai đường thẳng vuông góc tạo thành 4 góc vuông có chung đỉnh.', 'Two perpendicular lines make 4 right angles that share the same vertex.'), visual: vz('lines', { kind: 'perpendicular' }) },
          { text: L('Hình chữ nhật có các cặp cạnh liền nhau vuông góc với nhau.', 'In a rectangle, any two sides next to each other are perpendicular.'), visual: vz('shape', { kind: 'rect', label: 'ABCD' }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const k = P(rng, ['perpendicular', 'parallel', 'intersect']); const N = { perpendicular: L('Vuông góc', 'Perpendicular'), parallel: L('Song song', 'Parallel'), intersect: L('Cắt nhau nhưng không vuông góc', 'Crossing, but not perpendicular') }; return Q(L('Hai đường thẳng dưới đây có quan hệ gì?', 'How are the two lines below related?'), vz('lines', { kind: k }), ch(rng, N[k], Object.values(N)), L('Dùng ê ke kiểm tra góc tạo bởi hai đường thẳng.', 'Use a set square to check the angle the two lines make.'), L(`Hai đường thẳng ${N[k].toLowerCase()}.`, `The two lines are ${N[k].toLowerCase()}.`)); }
          if (f === 1) { const k = P(rng, ['rect', 'square']); return Q(L(`${k === 'rect' ? 'Hình chữ nhật' : 'Hình vuông'} ABCD có bao nhiêu cặp cạnh vuông góc với nhau?`, `How many pairs of perpendicular sides does ${k === 'rect' ? 'rectangle' : 'square'} ABCD have?`), vz('shape', { kind: k, label: 'ABCD' }), num(4), L('Mỗi góc vuông ứng với một cặp cạnh vuông góc.', 'Each right angle gives one pair of perpendicular sides.'), L('Có 4 cặp: AB và BC, BC và CD, CD và DA, DA và AB.', 'There are 4 pairs: AB and BC, BC and CD, CD and DA, DA and AB.')); }
          return Q(L('Hai đường thẳng vuông góc với nhau tạo thành mấy góc vuông?', 'How many right angles do two perpendicular lines make?'), vz('lines', { kind: 'perpendicular' }), num(4), L('Đếm các góc quanh điểm cắt.', 'Count the angles around the point where the lines cross.'), L('Tạo thành 4 góc vuông chung đỉnh.', 'They make 4 right angles that share the same vertex.'));
        }, [
          [0, 9, rng => { const RN = P(rng, ['ABCD', 'MNPQ', 'EGHK']), k = R(rng, 0, 3), side = j => RN[(j + 4) % 4] + RN[(j + 5) % 4], s = side(k), adj = `${side(k - 1)} ${AND} ${side(k + 1)}`; return Q(L(`Hình chữ nhật ${RN} có cạnh ${s} vuông góc với những cạnh nào?`, `In rectangle ${RN}, which sides are perpendicular to side ${s}?`), vz('shape', { kind: 'rect', label: RN }), ch(rng, adj, [`${side(k + 2)} ${AND} ${side(k + 1)}`, `${side(k - 1)} ${AND} ${side(k + 2)}`, `${RN[k]}${RN[(k + 2) % 4]} ${AND} ${side(k + 2)}`]), L('Hai cạnh liền nhau của hình chữ nhật vuông góc với nhau.', 'Two sides of a rectangle next to each other are perpendicular.'), L(`Cạnh ${s} vuông góc với ${adj}.`, `Side ${s} is perpendicular to ${adj}.`)); }],
          [0, 9, rng => { const [a, b, c, d, o] = U.sample(rng, ['A', 'B', 'C', 'D', 'M', 'N', 'P', 'Q', 'O', 'I', 'K', 'H'], 5); const PT = L('Điểm', 'Point'); return Q(L(`Hai đường thẳng ${a}${b} và ${c}${d} vuông góc với nhau tại điểm nào?`, `Lines ${a}${b} and ${c}${d} are perpendicular. At which point do they meet?`), vz('lines', { kind: 'perpendicular', labels: [a, b, c, d, o] }), ch(rng, `${PT} ${o}`, [`${PT} ${a}`, `${PT} ${c}`, `${PT} ${d}`]), L('Tìm điểm cắt nhau của hai đường thẳng.', 'Find the point where the two lines cross.'), L(`${a}${b} vuông góc với ${c}${d} tại điểm ${o}.`, `${a}${b} is perpendicular to ${c}${d} at point ${o}.`)); }],
          [0, 9, rng => { const [st, ok] = P(rng, EN ? [['Two perpendicular lines make 4 right angles', true], ['Two perpendicular lines make 2 right angles', false], ['Two sides of a rectangle next to each other are perpendicular', true], ['Two opposite sides of a rectangle are perpendicular', false], ['You can use a set square to check whether two lines are perpendicular', true], ["At 6 o'clock, the hour hand and the minute hand are perpendicular", false], ["At 3 o'clock, the hour hand and the minute hand are perpendicular", true]]
            : [['Hai đường thẳng vuông góc tạo thành 4 góc vuông', true], ['Hai đường thẳng vuông góc tạo thành 2 góc vuông', false], ['Hai cạnh liền nhau của hình chữ nhật vuông góc với nhau', true], ['Hai cạnh đối diện của hình chữ nhật vuông góc với nhau', false], ['Có thể dùng ê ke để kiểm tra hai đường thẳng có vuông góc hay không', true], ['Lúc 6 giờ đúng, kim giờ và kim phút vuông góc với nhau', false], ['Lúc 3 giờ đúng, kim giờ và kim phút vuông góc với nhau', true]]); return Q(`${TFQ}\n${st}.`, null, tf(rng, ok), L('Hai đường thẳng vuông góc tạo thành 4 góc vuông chung đỉnh.', 'Two perpendicular lines make 4 right angles that share the same vertex.'), `${TF(ok)}.`); }],
          [3, 9, rng => { const h = P(rng, [3, 9]), bad = U.sample(rng, [12, 6, 1, 2, 4, 5, 7, 8, 10, 11], 3), hr = x => L(`${x} giờ`, `${x} o'clock`); return Q(L('Lúc mấy giờ đúng thì kim giờ và kim phút vuông góc với nhau?', "At which o'clock time are the hour hand and the minute hand perpendicular?"), vz('clock', { h: 12, m: 0 }), ch(rng, hr(h), bad.map(hr)), L('Hai kim vuông góc khi chúng tạo thành góc vuông.', 'The hands are perpendicular when they make a right angle.'), L(`Lúc ${h} giờ, hai kim tạo thành góc vuông nên vuông góc với nhau.`, `At ${h} o'clock the two hands make a right angle, so they are perpendicular.`)); }],
          [3, 9, rng => { const [k, n, nmK, nmE] = P(rng, [['rtriangle', 1, 'Hình tam giác', 'triangle'], ['triangle', 0, 'Hình tam giác', 'triangle'], ['quad', 0, 'Hình tứ giác', 'quadrilateral'], ['square', 4, 'Hình vuông', 'square']]); return Q(L(`${nmK} dưới đây có mấy cặp cạnh vuông góc với nhau?`, `How many pairs of perpendicular sides does the ${nmE} below have?`), vz('shape', { kind: k }), num(n), L('Dùng ê ke kiểm tra từng góc của hình.', 'Use a set square to check each angle of the shape.'), L(`${nmK} này có ${n} cặp cạnh vuông góc.`, `This ${nmE} has ${n} ${pl(n, 'pair', 'pairs')} of perpendicular sides.`)); }],
        ], 1)),
      lesson(6, 29, L('Hai đường thẳng song song', 'Parallel lines'),
        L('Rô-bốt ISA đi dọc hai thanh ray đường tàu song song cùng bạn Minh.', 'ISA the robot and Minh walk along the two parallel rails of a railway line.'),
        [
          { text: L('Hai đường thẳng song song không bao giờ cắt nhau.', 'Two parallel lines never meet.'), visual: vz('lines', { kind: 'parallel' }) },
          { text: L('Hình chữ nhật ABCD có AB song song với DC, AD song song với BC.', 'In rectangle ABCD, AB is parallel to DC and AD is parallel to BC.'), visual: vz('shape', { kind: 'rect', label: 'ABCD' }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const k = P(rng, ['parallel', 'perpendicular', 'intersect']); const YES = L('Có, song song', 'Yes, they are parallel'), NO = L('Không song song', 'No, they are not parallel'); return Q(L('Hai đường thẳng dưới đây có song song với nhau không?', 'Are the two lines below parallel?'), vz('lines', { kind: k }), ch(rng, k === 'parallel' ? YES : NO, [k === 'parallel' ? NO : YES]), L('Hai đường thẳng song song không cắt nhau dù kéo dài mãi.', 'Parallel lines never meet, however far you make them longer.'), k === 'parallel' ? L('Hai đường thẳng song song.', 'The two lines are parallel.') : L('Hai đường thẳng cắt nhau nên không song song.', 'The two lines cross, so they are not parallel.')); }
          if (f === 1) { const [k, n, nmK, nmE] = P(rng, [['rect', 2, 'Hình chữ nhật', 'rectangle'], ['square', 2, 'Hình vuông', 'square'], ['parallelogram', 2, 'Hình bình hành', 'parallelogram'], ['rect', 2, 'Hình chữ nhật', 'rectangle']]); return Q(L(`${nmK} dưới đây có bao nhiêu cặp cạnh song song?`, `How many pairs of parallel sides does the ${nmE} below have?`), vz('shape', { kind: k }), num(n), L('Tìm các cặp cạnh đối diện không cắt nhau.', 'Look for pairs of opposite sides that do not meet.'), L(`${nmK} có ${n} cặp cạnh song song.`, `The ${nmE} has ${n} pairs of parallel sides.`)); }
          return Q(L('Chạm chọn các hình có hai cặp cạnh song song.', 'Tap all the shapes that have two pairs of parallel sides.'), vz('shapeSet', { items: ['rect', 'triangle', 'square', 'circle', 'parallelogram'] }), { kind: 'visual', check: v => Array.isArray(v) && v.length === 3 && [0, 2, 4].every(j => v.includes(j)) }, L('Hình chữ nhật, hình vuông, hình bình hành đều có hai cặp cạnh đối diện song song.', 'Rectangles, squares and parallelograms all have two pairs of parallel opposite sides.'), L('Hình chữ nhật, hình vuông và hình bình hành.', 'The rectangle, the square and the parallelogram.'));
        }, [
          [0, 9, rng => { const RN = P(rng, ['ABCD', 'MNPQ', 'EGHK']), k = R(rng, 0, 3), side = j => RN[(j + 4) % 4] + RN[(j + 5) % 4], s = side(k), op = RN[(k + 3) % 4] + RN[(k + 2) % 4]; return Q(L(`Trong hình chữ nhật ${RN}, cạnh ${s} song song với cạnh nào?`, `In rectangle ${RN}, which side is parallel to side ${s}?`), vz('shape', { kind: 'rect', label: RN }), ch(rng, op, [side(k + 1), side(k + 3), RN[k] + RN[(k + 2) % 4]]), L('Các cạnh đối diện của hình chữ nhật song song với nhau.', 'Opposite sides of a rectangle are parallel.'), L(`Cạnh ${s} song song với cạnh ${op}.`, `Side ${s} is parallel to side ${op}.`)); }],
          [0, 9, rng => { const [a, b, c, d] = U.sample(rng, ['A', 'B', 'C', 'D', 'M', 'N', 'P', 'Q', 'E', 'G', 'H', 'K'], 4); return Q(L(`Đường thẳng ${a}${b} song song với đường thẳng nào?`, `Which line is parallel to line ${a}${b}?`), vz('lines', { kind: 'parallel', labels: [a, b, c, d] }), ch(rng, `${c}${d}`, [`${a}${c}`, `${b}${d}`, `${a}${d}`]), L('Hai đường thẳng song song không cắt nhau dù kéo dài về hai phía.', 'Parallel lines never meet, even when you make them longer in both directions.'), L(`${a}${b} song song với ${c}${d}.`, `${a}${b} is parallel to ${c}${d}.`)); }],
          [0, 9, rng => { const [st, ok] = P(rng, EN ? [['Two parallel lines never meet', true], ['Two parallel lines meet at one point', false], ['A rectangle has two pairs of parallel sides', true], ['A square has only one pair of parallel sides', false], ['Two opposite sides of a rectangle are parallel', true], ['Two sides of a square next to each other are parallel', false]]
            : [['Hai đường thẳng song song thì không bao giờ cắt nhau', true], ['Hai đường thẳng song song cắt nhau tại một điểm', false], ['Hình chữ nhật có hai cặp cạnh song song', true], ['Hình vuông có một cặp cạnh song song', false], ['Hai cạnh đối diện của hình chữ nhật song song với nhau', true], ['Hai cạnh liền nhau của hình vuông song song với nhau', false]]); return Q(`${TFQ}\n${st}.`, null, tf(rng, ok), L('Hai đường thẳng song song không cắt nhau; các cạnh đối diện của hình chữ nhật song song.', 'Parallel lines never meet; opposite sides of a rectangle are parallel.'), `${TF(ok)}.`); }],
          [3, 9, rng => { const good = P(rng, EN ? ['The two rails of a railway line', 'The lines across a page of an exercise book', 'Two opposite edges of a book'] : ['Hai thanh ray của đường tàu', 'Các dòng kẻ ngang trong vở', 'Hai mép đối diện của quyển sách']), bad = U.sample(rng, EN ? ["The two hands of a clock at 3 o'clock", 'The two sides of the right angle of a set square', 'Two ribs of a paper fan', 'Two edges of a table top next to each other'] : ['Hai kim đồng hồ lúc 3 giờ', 'Hai cạnh góc vuông của ê ke', 'Hai nan quạt giấy', 'Hai cạnh liền nhau của mặt bàn'], 3); return Q(L('Hình ảnh nào gợi nên hai đường thẳng song song?', 'Which of these looks like two parallel lines?'), null, ch(rng, good, bad), L('Hai đường thẳng song song không cắt nhau.', 'Parallel lines never meet.'), L(`${good} gợi nên hai đường thẳng song song.`, `${good}: they look like two parallel lines.`)); }],
          [6, 9, rng => { const RN = P(rng, ['ABCD', 'MNPQ']), k = R(rng, 0, 3), side = j => RN[(j + 4) % 4] + RN[(j + 5) % 4], s1 = side(k), s2 = side(k - 1), ans = side(k + 1); return Q(L(`Hình chữ nhật ${RN}: cạnh nào vừa vuông góc với cạnh ${s1}, vừa song song với cạnh ${s2}?`, `Rectangle ${RN}: which side is perpendicular to side ${s1} and also parallel to side ${s2}?`), vz('shape', { kind: 'rect', label: RN }), ch(rng, ans, [side(k + 2), s1, s2]), L(`Cạnh cần tìm là cạnh đối diện với ${s2}.`, `The side you need is the one opposite ${s2}.`), L(`Cạnh ${ans} vuông góc với ${s1} và song song với ${s2}.`, `Side ${ans} is perpendicular to ${s1} and parallel to ${s2}.`)); }],
        ], 1)),
      lesson(6, 31, L('Hình bình hành, hình thoi', 'Parallelograms and rhombuses'),
        L('Rô-bốt ISA cùng bạn Ngọc xếp những chiếc diều hình thoi bay trên đê.', 'ISA the robot and Ngọc fly rhombus-shaped kites on the river bank.'),
        [
          { text: L('Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau.', 'A parallelogram has two pairs of opposite sides that are parallel and equal.'), visual: vz('shape', { kind: 'parallelogram', dims: { a: 6, b: 4 }, showDims: true }) },
          { text: L('Hình thoi có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau.', 'A rhombus has two pairs of parallel opposite sides, and all four sides are equal.'), visual: vz('shape', { kind: 'rhombus', dims: { a: 5 }, showDims: true }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const target = P(rng, ['parallelogram', 'rhombus']); const items = U.shuffle(rng, [target, target, 'triangle', 'trapezoid', 'circle', target === 'rhombus' ? 'rect' : 'quad']); const want = items.map((k, j) => (k === target ? j : -1)).filter(j => j >= 0); return Q(L(`Chạm chọn tất cả các hình ${target === 'rhombus' ? 'thoi' : 'bình hành'}.`, `Tap all the ${target === 'rhombus' ? 'rhombuses' : 'parallelograms'}.`), vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) }, target === 'rhombus' ? L('Hình thoi có bốn cạnh bằng nhau.', 'A rhombus has four equal sides.') : L('Hình bình hành có hai cặp cạnh đối diện song song.', 'A parallelogram has two pairs of parallel opposite sides.'), L(`Có ${want.length} hình.`, `There are ${want.length} of them.`)); }
          if (f === 1) { const a = R(rng, 3, 25); return Q(L(`Hình thoi có cạnh ${a} cm. Tính chu vi hình thoi.`, `A rhombus has sides of ${a} cm. Work out its perimeter.`), vz('shape', { kind: 'rhombus', dims: { a }, showDims: true }), num(a * 4, 'cm'), L('Hình thoi có bốn cạnh bằng nhau.', 'A rhombus has four equal sides.'), `${a} × 4 = ${a * 4} (cm).`); }
          if (f === 2) { const a = R(rng, 4, 20), b = R(rng, 2, a - 1); return Q(L(`Hình bình hành ABCD có AB = ${a} cm, BC = ${b} cm. Tính chu vi hình bình hành.`, `Parallelogram ABCD has AB = ${a} cm and BC = ${b} cm. Work out its perimeter.`), vz('shape', { kind: 'parallelogram', dims: { a, b }, showDims: true, label: 'ABCD' }), num((a + b) * 2, 'cm'), L('Hai cạnh đối diện của hình bình hành bằng nhau.', 'Opposite sides of a parallelogram are equal.'), `(${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`); }
          const [p, c, d] = P(rng, EN ? [['A rhombus has …', 'four equal sides', ['four right angles', 'three sides', 'only one pair of parallel sides']], ['A parallelogram has …', 'two pairs of opposite sides that are parallel and equal', ['four equal sides', 'four right angles', 'only one pair of parallel sides']]]
            : [['Hình thoi có …', 'bốn cạnh bằng nhau', ['bốn góc vuông', 'ba cạnh', 'một cặp cạnh song song']], ['Hình bình hành có …', 'hai cặp cạnh đối diện song song và bằng nhau', ['bốn cạnh bằng nhau', 'bốn góc vuông', 'một cặp cạnh song song']]]);
          return Q(p, null, ch(rng, c, d), L('Nhớ đặc điểm của hình bình hành, hình thoi.', 'Remember what parallelograms and rhombuses are like.'), `${p.replace('…', c)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. PHÉP NHÂN VÀ PHÉP CHIA ============
  const c8 = {
    id: 'g4-c8', semester: 2, title: L('Phép nhân và phép chia', 'Multiplication and division'), icon: '✖️', lessons: [
      lesson(8, 38, L('Nhân với số có một chữ số', 'Multiplying by a 1-digit number'),
        L('Rô-bốt ISA giúp nhà máy tính số chai nước đóng được trong mấy ngày.', 'ISA the robot helps a factory work out how many bottles of water it fills in a few days.'),
        [{ text: L('241 324 × 3 = 723 972. Nhân từ phải sang trái, nhớ sang hàng bên trái.', '241 324 × 3 = 723 972. Multiply from right to left and carry to the next column on the left.'), visual: vz('columnCalc', { a: 241324, b: 3, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, L === 0 ? [1000, 9999] : [10000, 300000], [2, 9], () => true, [241324, 3]))),
      lesson(8, 39, L('Chia cho số có một chữ số', 'Dividing by a 1-digit number'),
        L('Rô-bốt ISA chia đều số gạo cứu trợ cho các xã vùng lũ.', 'ISA the robot shares out relief rice equally between the flooded communes.'),
        [{ text: L('128 472 : 6 = 21 412. Chia từ trái sang phải: chia, nhân, trừ, hạ.', '128 472 : 6 = 21 412. Divide from left to right: divide, multiply, subtract, bring down.'), visual: vz('columnCalc', { a: 128472, b: 6, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, L === 0 ? [1000, 9999] : [10000, 999999], [2, 9], (a, b) => a % b === 0, [128472, 6]))),
      lesson(8, 40, L('Tính chất giao hoán và kết hợp của phép nhân', 'The commutative and associative properties of multiplication'),
        L('Rô-bốt ISA chỉ cho bạn Bình mẹo ghép 25 với 4 để nhân nhẩm.', 'ISA the robot shows Bình the trick of pairing 25 with 4 to multiply in your head.'),
        [
          { text: L('Giao hoán: a × b = b × a.', 'Commutative: a × b = b × a.'), visual: vz('array', { rows: 3, cols: 5 }) },
          { text: L('Kết hợp: (a × b) × c = a × (b × c). Tính nhanh: 25 × 7 × 4 = 7 × (25 × 4) = 7 × 100 = 700.', 'Associative: (a × b) × c = a × (b × c). A quick way: 25 × 7 × 4 = 7 × (25 × 4) = 7 × 100 = 700.') },
        ],
        more(function (rng, i) {
          const f = i % 3;
          const MISS = L('Số thích hợp ở ô ?:', 'Find the missing number:');
          if (f === 0) { const a = R(rng, 12, 999), b = R(rng, 2, 9); return Q(`${MISS}\n${a} × ${b} = ${b} × ?`, null, num(a), L('Đổi chỗ các thừa số thì tích không thay đổi.', 'Swapping the factors does not change the product.'), `${a} × ${b} = ${b} × ${a}.`); }
          const [x, y] = P(rng, [[25, 4], [5, 2], [50, 2], [125, 8], [20, 5], [250, 4]]); const z = R(rng, 3, 99);
          if (f === 1) { const terms = U.shuffle(rng, [x, y, z]); return Q(L(`Tính bằng cách thuận tiện:\n${terms.join(' × ')}`, `Calculate in the easiest way:\n${terms.join(' × ')}`), null, num(x * y * z), L(`Nhóm ${x} với ${y} được ${x * y}.`, `Group ${x} with ${y} to make ${x * y}.`), `${terms.join(' × ')} = ${z} × (${x} × ${y}) = ${z} × ${x * y} = ${F(x * y * z)}.`); }
          return Q(`${MISS}\n(${z} × ${x}) × ${y} = ${z} × (${x} × ?)`, null, num(y), L('Tính chất kết hợp của phép nhân.', 'Use the associative property of multiplication.'), `(${z} × ${x}) × ${y} = ${z} × (${x} × ${y}).`);
        }, [
          [0, 6, rng => { const a = R(rng, 12, 99), b = R(rng, 2, 9); return Q(L(`Số thích hợp ở ô ?:\n${a} × ? = ${b} × ${a}`, `Find the missing number:\n${a} × ? = ${b} × ${a}`), null, num(b), L('Đổi chỗ các thừa số thì tích không thay đổi.', 'Swapping the factors does not change the product.'), `${a} × ${b} = ${b} × ${a}.`); }],
          [0, 9, rng => { const a = R(rng, 2, 9), b = R(rng, 11, 50), c = R(rng, 2, 9); const [st, ok] = P(rng, [[`${a} × ${b} = ${b} × ${a}`, true], [`(${a} × ${b}) × ${c} = ${a} × (${b} × ${c})`, true], [`(${a} × ${b}) × ${c} = ${a} × (${b} + ${c})`, false], [`${a} × ${b} × ${c} = ${c} × ${b} × ${a}`, true], [`${a} × ${b} = ${a} + ${b}`, false]]); return Q(`${TFQ}\n${st}`, null, tf(rng, ok), L('Giao hoán: a × b = b × a. Kết hợp: (a × b) × c = a × (b × c).', 'Commutative: a × b = b × a. Associative: (a × b) × c = a × (b × c).'), `${TF(ok)}.`); }],
          [3, 9, rng => { const a = R(rng, 2, 9), b = R(rng, 11, 40), c = R(rng, 2, 9); return Q(L(`Biểu thức nào có giá trị bằng ${a} × ${b} × ${c}?`, `Which expression has the same value as ${a} × ${b} × ${c}?`), null, ch(rng, `${b} × (${a} × ${c})`, [`${a} × (${b} + ${c})`, `(${a} + ${b}) × ${c}`, `${a} × ${b} + ${c}`]), L('Đổi chỗ hoặc nhóm các thừa số thì tích không đổi.', 'Swapping or grouping the factors does not change the product.'), `${a} × ${b} × ${c} = ${b} × (${a} × ${c}) = ${F(a * b * c)}.`); }],
          [3, 9, rng => { const [a, it, b, box, en] = P(rng, [[R(rng, 6, 12), 'cái bánh', R(rng, 4, 10), ['hộp', 'thùng'], ['cakes', 'box', 'boxes', 'crate', 'crates']], [R(rng, 10, 25), 'quyển vở', R(rng, 4, 8), ['tập', 'thùng'], ['exercise books', 'pack', 'packs', 'carton', 'cartons']], [R(rng, 6, 12), 'chai sữa', R(rng, 4, 8), ['lốc', 'thùng'], ['bottles of milk', 'pack', 'packs', 'crate', 'crates']]]), c = R(rng, 2, 5); return Q(L(`Mỗi ${box[0]} có ${a} ${it}, mỗi ${box[1]} có ${b} ${box[0]}. Hỏi ${c} ${box[1]} như thế có bao nhiêu ${it}?`, `Each ${en[1]} holds ${a} ${en[0]}, and each ${en[3]} holds ${b} ${en[2]}. How many ${en[0]} are there in ${c} ${en[4]} like this?`), null, num(a * b * c), L(`Tính số ${it} trong 1 ${box[1]} rồi nhân với ${c}.`, `Find the number of ${en[0]} in 1 ${en[3]}, then multiply by ${c}.`), L(`${a} × ${b} × ${c} = ${a * b} × ${c} = ${F(a * b * c)} (${it}).`, `${a} × ${b} × ${c} = ${a * b} × ${c} = ${F(a * b * c)} (${en[0]}).`)); }],
          [6, 9, rng => { const a = R(rng, 2, 9), b = R(rng, 11, 40), c = R(rng, 2, 9), d = P(rng, [c, c, c + 1, c - 1]); return Q(L(`So sánh: ${a} × ${b} × ${c} … ${c} × ${a} × ${d}`, `Compare: ${a} × ${b} × ${c} … ${c} × ${a} × ${d}`), vz('compare', { left: `${a} × ${b} × ${c}`, right: `${c} × ${a} × ${d}` }), cmpAns(a * b * c, c * a * d), L('Đổi chỗ các thừa số để so sánh nhanh.', 'Swap the factors round to compare quickly.'), `${a} × ${b} × ${c} = ${F(a * b * c)}; ${c} × ${a} × ${d} = ${F(c * a * d)}.`); }],
        ])),
      lesson(8, 41, L('Nhân, chia với 10, 100, 1000, …', 'Multiplying and dividing by 10, 100, 1000, …'),
        L('Rô-bốt ISA xếp những bó đũa, mỗi bó 10 đôi, để bán ở chợ phiên.', 'ISA the robot ties chopsticks into bundles of 10 pairs to sell at the market fair.'),
        [
          { text: L('Nhân với 10, 100, 1000: viết thêm 1, 2, 3 chữ số 0 vào bên phải. 35 × 100 = 3500.', 'To multiply by 10, 100 or 1000, write 1, 2 or 3 zeros on the right. 35 × 100 = 3500.') },
          { text: L('Chia số tròn chục, tròn trăm, tròn nghìn cho 10, 100, 1000: bỏ bớt 1, 2, 3 chữ số 0 ở bên phải. 4200 : 100 = 42.', 'To divide a whole number of tens, hundreds or thousands by 10, 100 or 1000, take 1, 2 or 3 zeros off the right. 4200 : 100 = 42.') },
        ],
        function (rng, i) {
          const p = P(rng, [10, 100, 1000]), a = R(rng, 2, 999), f = i % 4, z = String(p).length - 1;
          if (f === 0) return Q(`${a} × ${F(p)} = ?`, null, num(a * p), L(`Viết thêm ${String(p).length - 1} chữ số 0 vào bên phải.`, `Write ${z} ${pl(z, 'zero', 'zeros')} on the right.`), `${a} × ${F(p)} = ${F(a * p)}.`);
          if (f === 1) return Q(`${F(a * p)} : ${F(p)} = ?`, null, num(a), L(`Bỏ bớt ${String(p).length - 1} chữ số 0 ở bên phải.`, `Take ${z} ${pl(z, 'zero', 'zeros')} off the right.`), `${F(a * p)} : ${F(p)} = ${a}.`);
          if (f === 2) { const b = R(rng, 2, 9) * 10, c = R(rng, 11, 99); return Q(L(`Tính: ${c} × ${b}`, `Calculate: ${c} × ${b}`), vz('columnCalc', { a: c, b, op: '×', reveal: 'none' }), num(c * b), `${c} × ${b} = ${c} × ${b / 10} × 10.`, `${c} × ${b / 10} = ${c * b / 10}; ${c * b / 10} × 10 = ${F(c * b)}.`); }
          const [x, u1, u2, k, e1, e1s] = P(rng, [[R(rng, 2, 90), 'tạ', 'kg', 100, 'quintal', 'quintals'], [R(rng, 2, 90), 'tấn', 'kg', 1000, 'tonne', 'tonnes'], [R(rng, 2, 90), 'm', 'cm', 100, 'm', 'm'], [R(rng, 2, 90), 'km', 'm', 1000, 'km', 'km']]);
          return Q(L(`${x} ${u1} = ? ${u2}`, `${x} ${e1s} = ? ${u2}`), null, num(x * k, u2), L(`1 ${u1} = ${F(k)} ${u2}.`, `1 ${e1} = ${F(k)} ${u2}.`), L(`${x} × ${F(k)} = ${F(x * k)}. Vậy ${x} ${u1} = ${F(x * k)} ${u2}.`, `${x} × ${F(k)} = ${F(x * k)}. So ${x} ${e1s} = ${F(x * k)} ${u2}.`));
        }),
      lesson(8, 42, L('Tính chất phân phối của phép nhân đối với phép cộng', 'Multiplying a number by a sum (the distributive property)'),
        L('Rô-bốt ISA tính tiền mua bánh cho hai lớp cùng một lúc thật nhanh.', 'ISA the robot quickly works out the cost of cakes for two classes at once.'),
        [
          { text: L('a × (b + c) = a × b + a × c. Ví dụ: 4 × (3 + 2) = 4 × 3 + 4 × 2 = 20.', 'a × (b + c) = a × b + a × c. For example: 4 × (3 + 2) = 4 × 3 + 4 × 2 = 20.'), visual: vz('array', { rows: 4, cols: 5 }) },
          { text: L('Tính nhanh: 36 × 7 + 36 × 3 = 36 × (7 + 3) = 36 × 10 = 360.', 'A quick way: 36 × 7 + 36 × 3 = 36 × (7 + 3) = 36 × 10 = 360.') },
        ],
        more(function (rng, i) {
          const f = i % 3;
          const EASY = L('Tính bằng cách thuận tiện:', 'Calculate in the easiest way:');
          if (f === 0) { const a = R(rng, 12, 99), b = R(rng, 1, 9), c = 10 - b; return Q(`${EASY}\n${a} × ${b} + ${a} × ${c}`, null, num(a * 10), L(`Đặt ${a} làm thừa số chung.`, `Take ${a} out as the common factor.`), `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × 10 = ${a * 10}.`); }
          if (f === 1) { const a = R(rng, 12, 99), k = P(rng, [11, 101, 21, 12]); const [t, o] = k === 11 ? [10, 1] : k === 101 ? [100, 1] : k === 21 ? [20, 1] : [10, 2]; return Q(L(`Tính: ${a} × ${k}`, `Calculate: ${a} × ${k}`), null, num(a * k), `${k} = ${t} + ${o}.`, `${a} × ${k} = ${a} × ${t} + ${a} × ${o} = ${a * t} + ${a * o} = ${F(a * k)}.`); }
          const a = R(rng, 2, 9), b = R(rng, 10, 50), c = R(rng, 10, 50);
          return Q(L(`Số thích hợp ở ô ?:\n${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ?`, `Find the missing number:\n${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ?`), null, num(c), L('Nhân một số với một tổng: nhân số đó với từng số hạng rồi cộng.', 'To multiply a number by a sum, multiply it by each addend, then add.'), `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c}.`);
        }, [
          [0, 6, rng => { const a = R(rng, 2, 9), b = R(rng, 10, 60), c = R(rng, 2, 40); return Q(L(`Tính bằng hai cách:\n${a} × (${b} + ${c})`, `Calculate in two ways:\n${a} × (${b} + ${c})`), null, num(a * (b + c)), L(`Cách 1: tính tổng trong ngoặc trước. Cách 2: ${a} × ${b} + ${a} × ${c}.`, `Way 1: work out the sum in the brackets first. Way 2: ${a} × ${b} + ${a} × ${c}.`), L(`${a} × (${b} + ${c}) = ${a} × ${b + c} = ${a * (b + c)}; hoặc ${a * b} + ${a * c} = ${a * (b + c)}.`, `${a} × (${b} + ${c}) = ${a} × ${b + c} = ${a * (b + c)}; or ${a * b} + ${a * c} = ${a * (b + c)}.`)); }],
          [0, 9, rng => { const a = R(rng, 2, 9), b = R(rng, 10, 50), c = R(rng, 2, 9), w = R(rng, 0, 1); const st = w ? `${a} × (${b} + ${c}) = ${a} × ${b} + ${c}` : `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c}`; return Q(`${TFQ}\n${st}`, null, tf(rng, !w), L('Nhân một số với một tổng: nhân số đó với từng số hạng rồi cộng các kết quả.', 'To multiply a number by a sum, multiply it by each addend, then add the results.'), `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c}. ${TF(!w)}.`); }],
          [3, 9, rng => { const a = R(rng, 2, 9), b = R(rng, 10, 50), c = R(rng, 2, 30), V = a * (b + c); return Q(L(`Biểu thức ${a} × ${b} + ${a} × ${c} bằng biểu thức nào?`, `Which expression is equal to ${a} × ${b} + ${a} × ${c}?`), null, ch(rng, `${a} × (${b} + ${c})`, [[`${a} × ${b} + ${c}`, a * b + c], [`(${a} + ${b}) × ${c}`, (a + b) * c], [`${a} + ${b} × ${c}`, a + b * c], [`${a} × ${b} × ${c}`, a * b * c], [`(${a} + ${b}) + ${c}`, a + b + c]].filter(e => e[1] !== V).map(e => e[0])), L('Đưa thừa số chung ra ngoài ngoặc.', 'Take the common factor outside the brackets.'), `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a * (b + c)}.`); }],
          [3, 9, rng => { const a = P(rng, [12, 20, 24, 30]), b = R(rng, 3, 15), c = R(rng, 3, 15), [x, y, z, w] = P(rng, EN ? [['crates of orange juice', 'crates of apple juice', 'bottles', 'crate'], ['boxes of red pens', 'boxes of blue pens', 'pens', 'box'], ['trays of soft mooncakes', 'trays of baked mooncakes', 'mooncakes', 'tray']]
            : [['thùng nước cam', 'thùng nước táo', 'chai'], ['hộp bút đỏ', 'hộp bút xanh', 'cái bút'], ['khay bánh dẻo', 'khay bánh nướng', 'cái bánh']]); return Q(L(`Cửa hàng có ${b} ${x} và ${c} ${y}, mỗi ${x.split(' ')[0]} có ${a} ${z}. Hỏi cửa hàng có tất cả bao nhiêu ${z}?`, `A shop has ${b} ${x} and ${c} ${y}. Each ${w} holds ${a} ${z}. How many ${z} does the shop have altogether?`), null, num(a * (b + c)), L(`Có thể tính: ${a} × (${b} + ${c}).`, `You can work out ${a} × (${b} + ${c}).`), `${a} × (${b} + ${c}) = ${a} × ${b + c} = ${a * (b + c)} (${z}).`); }],
          [6, 9, rng => { const a = R(rng, 12, 99), b = R(rng, 11, 89), c = 100 - b; return Q(L(`Tính bằng cách thuận tiện:\n${a} × ${b} + ${a} × ${c}`, `Calculate in the easiest way:\n${a} × ${b} + ${a} × ${c}`), null, num(a * 100), L(`Đặt ${a} làm thừa số chung: ${b} + ${c} = 100.`, `Take ${a} out as the common factor: ${b} + ${c} = 100.`), `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × 100 = ${F(a * 100)}.`); }],
        ])),
      lesson(8, 43, L('Nhân với số có hai chữ số', 'Multiplying by a 2-digit number'),
        L('Rô-bốt ISA tính số học sinh của toàn trường khi mỗi lớp có số bạn như nhau.', 'ISA the robot works out how many pupils the whole school has when every class has the same number of children.'),
        [{ text: L('36 × 23: 36 × 3 = 108 (tích riêng thứ nhất); 36 × 2 = 72 (tích riêng thứ hai, viết lùi sang trái một cột). Cộng: 108 + 720 = 828.', '36 × 23: 36 × 3 = 108 (the first partial product); 36 × 2 = 72 (the second partial product, written one column to the left). Add: 108 + 720 = 828.'), visual: vz('columnCalc', { a: 36, b: 23, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, L === 0 ? [11, 99] : [100, 9999], [11, 99], (a, b) => b % 10 !== 0, [36, 23]))),
      lesson(8, 44, L('Chia cho số có hai chữ số', 'Dividing by a 2-digit number'),
        L('Rô-bốt ISA chia đều số ghế vào các hàng trong hội trường.', 'ISA the robot puts the chairs in the school hall into equal rows.'),
        [{ text: L('672 : 21: 67 : 21 được 3 (ước lượng 6 : 2 = 3), 3 × 21 = 63, 67 − 63 = 4; hạ 2 được 42, 42 : 21 = 2. Vậy 672 : 21 = 32.', '672 : 21: 67 : 21 goes 3 times (estimate 6 : 2 = 3), 3 × 21 = 63, 67 − 63 = 4; bring down the 2 to make 42, and 42 : 21 = 2. So 672 : 21 = 32.'), visual: vz('columnCalc', { a: 672, b: 21, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, L === 0 ? [100, 999] : [1000, 99999], [11, 99], (a, b) => a % b === 0 && a / b >= 2, [672, 21]))),
      lesson(8, 46, L('Tìm số trung bình cộng', 'Finding the average'),
        L('Rô-bốt ISA san đều những chồng sách cho bằng nhau cùng bạn Trang.', 'ISA the robot and Trang even out some piles of books so they are all the same.'),
        [
          { text: L('Ba chồng sách có 4, 6, 8 quyển. San đều: mỗi chồng 6 quyển. 6 là số trung bình cộng của 4, 6 và 8.', 'Three piles have 4, 6 and 8 books. Even them out: each pile has 6 books. 6 is the average of 4, 6 and 8.'), visual: vz('average', { values: [4, 6, 8] }) },
          { text: L('Muốn tìm số trung bình cộng của nhiều số, ta tính tổng các số đó rồi chia tổng cho số các số hạng: (4 + 6 + 8) : 3 = 6.', 'To find the average of several numbers, add them up and divide the sum by how many numbers there are: (4 + 6 + 8) : 3 = 6.') },
        ],
        function (rng, i) {
          const n = R(rng, 2, lv(i) === 0 ? 3 : 5), small = lv(i) < 2;
          let vals, avg;
          for (let g = 0; g < 100; g++) { vals = Array.from({ length: n }, () => R(rng, small ? 1 : 20, small ? 9 : 200)); if (vals.reduce((a, b) => a + b, 0) % n === 0) break; }
          let s = vals.reduce((a, b) => a + b, 0); if (s % n) { vals[0] += n - (s % n); s = vals.reduce((a, b) => a + b, 0); }
          avg = s / n;
          const f = i % 3;
          if (f === 0) return Q(L(`Tìm số trung bình cộng của các số: ${vals.join('; ')}.`, `Find the average of these numbers: ${vals.join('; ')}.`), small ? vz('average', { values: vals }) : null, num(avg), L('Tính tổng rồi chia cho số các số hạng.', 'Add them up, then divide by how many numbers there are.'), `(${vals.join(' + ')}) : ${n} = ${s} : ${n} = ${avg}.`);
          if (f === 1) { const days = (EN ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] : ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu']).slice(0, n); return Q(L(`Số cây lớp 4A trồng được trong ${n} ngày lần lượt là: ${vals.join(', ')} cây. Hỏi trung bình mỗi ngày lớp trồng được bao nhiêu cây?`, `Over ${n} days, class 4A planted ${vals.join(', ')} trees. On average, how many trees did the class plant each day?`), vz('barChart', { labels: days, values: vals, unit: L('cây', 'trees') }), num(avg, L('cây', 'trees')), L('Trung bình cộng = tổng : số ngày.', 'Average = total : number of days.'), L(`(${vals.join(' + ')}) : ${n} = ${avg} (cây).`, `(${vals.join(' + ')}) : ${n} = ${avg} (trees).`)); }
          const avg2 = R(rng, 20, 60), k = R(rng, 2, 4);
          return Q(L(`Số trung bình cộng của ${k} số là ${avg2}. Tổng của ${k} số đó là bao nhiêu?`, `The average of ${k} numbers is ${avg2}. What is the sum of the ${k} numbers?`), null, num(avg2 * k), L('Tổng = số trung bình cộng × số các số hạng.', 'Sum = average × how many numbers there are.'), `${avg2} × ${k} = ${avg2 * k}.`);
        }),
      lesson(8, 47, L('Bài toán liên quan đến rút về đơn vị', 'Problems solved by finding one unit first'),
        L('Rô-bốt ISA tính giúp mẹ bạn Hà giá tiền khi mua nhiều hộp sữa.', "ISA the robot helps Hà's mum work out the price of several cartons of milk."),
        [
          { text: L('3 hộp bánh có 24 cái. 5 hộp như thế có bao nhiêu cái? Bước 1 (rút về đơn vị): 1 hộp có 24 : 3 = 8 (cái). Bước 2: 5 hộp có 8 × 5 = 40 (cái).', '3 boxes hold 24 cakes. How many cakes do 5 boxes like this hold? Step 1 (find one unit): 1 box holds 24 : 3 = 8 (cakes). Step 2: 5 boxes hold 8 × 5 = 40 (cakes).'), visual: vz('tape', { bars: [{ label: L('3 hộp', '3 boxes'), parts: 3, units: 3, value: '24' }, { label: L('5 hộp', '5 boxes'), parts: 5, units: 5, value: '?' }] }) },
        ],
        function (rng, i) {
          const per = R(rng, 2, lv(i) === 0 ? 9 : 50), n1 = R(rng, 2, 9); let n2 = R(rng, 2, 12); if (n2 === n1) n2++;
          const T = P(rng, EN ? [
            [`${n1} bags of rice weigh ${per * n1} kg. How many kilograms do ${n2} bags like this weigh?`, 'kg'],
            [`${n1} exercise books cost ${F(per * n1 * 1000)} dong. How much do ${n2} exercise books like this cost?`, 'dong', 1000],
            [`${n1} lorries carry ${per * n1} sacks of cement. How many sacks of cement do ${n2} lorries like this carry?`, ''],
          ] : [
            [`${n1} túi gạo nặng ${per * n1} kg. Hỏi ${n2} túi gạo như thế nặng bao nhiêu ki-lô-gam?`, 'kg'],
            [`Mua ${n1} quyển vở hết ${F(per * n1 * 1000)} đồng. Hỏi mua ${n2} quyển vở như thế hết bao nhiêu tiền?`, 'đồng', 1000],
            [`${n1} xe chở được ${per * n1} bao xi măng. Hỏi ${n2} xe như thế chở được bao nhiêu bao xi măng?`, ''],
          ]);
          const m = T[2] || 1, ans = per * n2 * m;
          if (i % 3 === 2) return Q(L(`Có ${per * n1} cái bánh xếp đều vào ${n1} hộp. Hỏi ${per * n2} cái bánh thì xếp được mấy hộp như thế?`, `${per * n1} cakes are packed equally into ${n1} boxes. How many boxes like this will ${per * n2} cakes fill?`), vz('tape', { bars: [{ label: L(`${n1} hộp`, `${n1} boxes`), parts: Math.min(n1, 10), units: Math.min(n1, 10), value: String(per * n1) }] }), num(n2), L('Bước 1: tìm số bánh trong 1 hộp. Bước 2: chia số bánh cho số bánh mỗi hộp.', 'Step 1: find the number of cakes in 1 box. Step 2: divide the cakes by the number in each box.'), L(`1 hộp: ${per * n1} : ${n1} = ${per} (cái). Số hộp: ${per * n2} : ${per} = ${n2} (hộp).`, `1 box: ${per * n1} : ${n1} = ${per} (cakes). Boxes: ${per * n2} : ${per} = ${n2} (boxes).`));
          return Q(T[0], vz('tape', { bars: [{ label: String(n1), parts: Math.min(n1, 10), units: Math.min(n1, 10), value: F(per * n1 * m) }, { label: String(n2), parts: Math.min(n2, 10), units: Math.min(n2, 10), value: '?' }] }), T[1] ? num(ans, T[1]) : num(ans), L('Bước 1: tìm giá trị của 1 phần (rút về đơn vị). Bước 2: nhân với số phần.', 'Step 1: find the value of 1 part (one unit). Step 2: multiply by the number of parts.'), L(`1 phần: ${F(per * n1 * m)} : ${n1} = ${F(per * m)}. ${n2} phần: ${F(per * m)} × ${n2} = ${F(ans)}.`, `1 part: ${F(per * n1 * m)} : ${n1} = ${F(per * m)}. ${n2} parts: ${F(per * m)} × ${n2} = ${F(ans)}.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 9. LÀM QUEN VỚI YẾU TỐ THỐNG KÊ, XÁC SUẤT ============
  const c9 = {
    id: 'g4-c9', semester: 2, title: L('Làm quen với yếu tố thống kê, xác suất', 'Getting to know statistics and chance'), icon: '📊', lessons: [
      lesson(9, 49, L('Dãy số liệu thống kê', 'Lists of data'),
        L('Rô-bốt ISA ghi lại chiều cao các bạn trong tổ của bạn Hùng.', "ISA the robot writes down the heights of the children in Hùng's group."),
        [{ text: L('Chiều cao (cm) của 5 bạn: 132; 128; 135; 130; 126. Đây là dãy số liệu thống kê. Số thứ ba là 135.', 'The heights (cm) of 5 children: 132; 128; 135; 130; 126. This is a list of data. The third number is 135.'), visual: vz('dataTable', { headers: [L('Bạn', 'Child'), 'An', 'Bình', 'Chi', 'Dũng', 'Hà'], rows: [[L('Chiều cao (cm)', 'Height (cm)'), 132, 128, 135, 130, 126]] }) }],
        function (rng, i) {
          const n = R(rng, 4, 6), vals = U.sample(rng, Array.from({ length: 25 }, (_, k) => 120 + k), n), f = i % 4;
          const seq = vals.join('; ');
          const HD = L(`Dãy số liệu chiều cao (cm): ${seq}.`, `Heights (cm): ${seq}.`);
          if (f === 0) { const k = R(rng, 1, n); return Q(L(`${HD}\nSố thứ ${k} trong dãy là bao nhiêu?`, `${HD}\nWhat is the ${ord(k)} number in the list?`), null, num(vals[k - 1]), L('Đếm từ trái sang phải.', 'Count from left to right.'), L(`Số thứ ${k} là ${vals[k - 1]}.`, `The ${ord(k)} number is ${vals[k - 1]}.`)); }
          if (f === 1) return Q(L(`${HD}\nDãy số liệu có bao nhiêu số?`, `${HD}\nHow many numbers are there in the list?`), null, num(n), L('Đếm các số trong dãy.', 'Count the numbers in the list.'), L(`Dãy có ${n} số.`, `There are ${n} numbers.`));
          if (f === 2) { const big = R(rng, 0, 1), v = big ? Math.max(...vals) : Math.min(...vals); return Q(L(`${HD}\nBạn ${big ? 'cao nhất' : 'thấp nhất'} cao bao nhiêu xăng-ti-mét?`, `${HD}\nHow tall is the ${big ? 'tallest' : 'shortest'} child, in centimetres?`), null, num(v, 'cm'), L(`Tìm số ${big ? 'lớn' : 'bé'} nhất trong dãy.`, `Find the ${big ? 'largest' : 'smallest'} number in the list.`), `${v} cm.`); }
          const mx = Math.max(...vals), mn = Math.min(...vals);
          return Q(L(`${HD}\nBạn cao nhất hơn bạn thấp nhất bao nhiêu xăng-ti-mét?`, `${HD}\nHow many centimetres taller is the tallest child than the shortest child?`), null, num(mx - mn, 'cm'), L('Lấy số lớn nhất trừ số bé nhất.', 'Take the smallest number away from the largest.'), `${mx} ${M} ${mn} = ${mx - mn} (cm).`);
        }),
      lesson(9, 50, L('Biểu đồ cột', 'Bar charts'),
        L('Rô-bốt ISA vẽ biểu đồ cột về số sách các lớp quyên góp cho thư viện.', 'ISA the robot draws a bar chart of the books each class gave to the library.'),
        [{ text: L('Biểu đồ cột: mỗi cột cho biết một số liệu. Cột càng cao thì số liệu càng lớn.', 'In a bar chart, each bar shows one piece of data. The taller the bar, the bigger the number.'), visual: vz('barChart', { title: L('Số sách quyên góp', 'Books donated'), labels: ['4A', '4B', '4C', '4D'], values: [45, 60, 38, 52], unit: L('quyển', 'books') }) }],
        function (rng, i) {
          const labels = ['4A', '4B', '4C', '4D'].slice(0, lv(i) === 0 ? 3 : 4), vals = U.sample(rng, Array.from({ length: 16 }, (_, k) => 20 + k * 5), labels.length);
          const bc = vz('barChart', { title: L('Số sách quyên góp', 'Books donated'), labels, values: vals, unit: L('quyển', 'books') }), f = i % 4;
          if (f === 0) { const j = R(rng, 0, labels.length - 1); return Q(L(`Lớp ${labels[j]} quyên góp được bao nhiêu quyển sách?`, `How many books did class ${labels[j]} donate?`), bc, num(vals[j]), L('Nhìn số ở đỉnh cột.', 'Look at the number at the top of the bar.'), L(`Lớp ${labels[j]}: ${vals[j]} quyển.`, `Class ${labels[j]}: ${vals[j]} books.`)); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...vals) : Math.min(...vals); return Q(L(`Lớp nào quyên góp được ${big ? 'nhiều' : 'ít'} sách nhất?`, `Which class donated the ${big ? 'most' : 'fewest'} books?`), bc, ch(rng, labels[vals.indexOf(v)], labels), L(`Tìm cột ${big ? 'cao' : 'thấp'} nhất.`, `Find the ${big ? 'tallest' : 'shortest'} bar.`), L(`Lớp ${labels[vals.indexOf(v)]}: ${v} quyển.`, `Class ${labels[vals.indexOf(v)]}: ${v} books.`)); }
          if (f === 2) { const s = vals.reduce((a, b) => a + b, 0); return Q(L('Các lớp quyên góp được tất cả bao nhiêu quyển sách?', 'How many books did the classes donate altogether?'), bc, num(s), L('Cộng số liệu của tất cả các cột.', 'Add up the numbers for all the bars.'), L(`${vals.join(' + ')} = ${s} (quyển).`, `${vals.join(' + ')} = ${s} (books).`)); }
          const [a, b] = U.sample(rng, labels.map((_, k) => k), 2), hi = vals[a] > vals[b] ? a : b, lo = hi === a ? b : a;
          return Q(L(`Lớp ${labels[hi]} quyên góp nhiều hơn lớp ${labels[lo]} bao nhiêu quyển sách?`, `How many more books did class ${labels[hi]} donate than class ${labels[lo]}?`), bc, num(vals[hi] - vals[lo]), L('Lấy số lớn trừ số bé.', 'Take the smaller number away from the larger one.'), L(`${vals[hi]} ${M} ${vals[lo]} = ${vals[hi] - vals[lo]} (quyển).`, `${vals[hi]} ${M} ${vals[lo]} = ${vals[hi] - vals[lo]} (books).`));
        }),
      // English: mặt ngửa = heads, mặt sấp = tails (as in lop5.js)
      lesson(9, 51, L('Số lần xuất hiện của một sự kiện', 'How many times an event happens'),
        L('Rô-bốt ISA tung đồng xu nhiều lần và ghi lại kết quả cùng bạn Vy.', 'ISA the robot and Vy toss a coin many times and write down the results.'),
        [{ text: L('Tung đồng xu 20 lần: mặt sấp xuất hiện 12 lần, mặt ngửa xuất hiện 8 lần.', 'Toss a coin 20 times: it lands on tails 12 times and on heads 8 times.'), visual: vz('dataTable', { headers: [L('Mặt', 'Side'), L('Sấp', 'Tails'), L('Ngửa', 'Heads')], rows: [[L('Số lần', 'Times'), 12, 8]] }) }],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const n = R(rng, 2, 5) * 10, a = R(rng, 3, n - 3); return Q(L(`Tung một đồng xu ${n} lần, mặt sấp xuất hiện ${a} lần. Hỏi mặt ngửa xuất hiện bao nhiêu lần?`, `A coin is tossed ${n} times. It lands on tails ${a} times. How many times does it land on heads?`), vz('dataTable', { headers: [L('Mặt', 'Side'), L('Sấp', 'Tails'), L('Ngửa', 'Heads')], rows: [[L('Số lần', 'Times'), a, '?']] }), num(n - a), L('Tổng số lần sấp và ngửa bằng số lần tung.', 'The number of tails and the number of heads add up to the number of tosses.'), L(`${n} ${M} ${a} = ${n - a} (lần).`, `${n} ${M} ${a} = ${n - a} (times).`)); }
          const cols = [{ n: 'đỏ', e: 'red', c: '#E84A4A' }, { n: 'xanh', e: 'blue', c: '#4DA3FF' }, { n: 'vàng', e: 'yellow', c: '#FFC93C' }];
          const cnt = U.sample(rng, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3);
          const CL = [L('Đỏ', 'Red'), L('Xanh', 'Blue'), L('Vàng', 'Yellow')];
          if (f === 1) { const j = R(rng, 0, 2); return Q(L(`Lấy 1 quả bóng trong hộp rồi trả lại, làm ${cnt[0] + cnt[1] + cnt[2]} lần. Kết quả ghi trong bảng. Bóng ${cols[j].n} xuất hiện bao nhiêu lần?`, `Take 1 ball out of the box, then put it back. Do this ${cnt[0] + cnt[1] + cnt[2]} times. The results are in the table. How many times did a ${cols[j].e} ball come out?`), vz('dataTable', { headers: [L('Màu', 'Colour'), ...CL], rows: [[L('Số lần', 'Times'), cnt[0], cnt[1], cnt[2]]] }), num(cnt[j]), L('Đọc số trong bảng.', 'Read the number in the table.'), L(`Bóng ${cols[j].n}: ${cnt[j]} lần.`, `${cap(cols[j].e)} ball: ${cnt[j]} times.`)); }
          const mx = Math.max(...cnt), j = cnt.indexOf(mx);
          return Q(L(`Lấy 1 quả bóng trong hộp rồi trả lại, làm nhiều lần. Kết quả: đỏ ${cnt[0]} lần, xanh ${cnt[1]} lần, vàng ${cnt[2]} lần. Màu nào xuất hiện nhiều lần nhất?`, `Take 1 ball out of the box, then put it back. Do this many times. Results: red ${cnt[0]} times, blue ${cnt[1]} times, yellow ${cnt[2]} times. Which colour came out the most times?`), vz('barChart', { labels: CL, values: cnt, unit: L('lần', 'times') }), ch(rng, CL[j], CL), L('So sánh các số lần.', 'Compare the numbers of times.'), L(`Màu ${cols[j].n}: ${mx} lần.`, `${cap(cols[j].e)}: ${mx} times.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 10. PHÂN SỐ ============
  function fracPair(rng) { const d = R(rng, 2, 9), k = R(rng, 2, 4); return [d, d * k]; }
  // English fraction words: 3/5 → "three fifths", 1/2 → "one half"
  const EN_DEN = ['', '', 'half', 'third', 'quarter', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  const fracWordEN = (n, d) => `${U.readEN(n)} ${n === 1 ? EN_DEN[d] : d === 2 ? 'halves' : EN_DEN[d] + 's'}`;
  const MISSF = L('Số thích hợp ở ô ?:', 'Find the missing number:');
  const c10 = {
    id: 'g4-c10', semester: 2, title: L('Phân số', 'Fractions'), icon: '🍕', lessons: [
      lesson(10, 53, L('Khái niệm phân số', 'What is a fraction?'),
        L('Rô-bốt ISA cắt chiếc bánh pizza thành các phần bằng nhau cho cả nhóm bạn Mai.', 'ISA the robot cuts a pizza into equal slices for Mai and her friends.'),
        [
          { text: L('Chia hình tròn thành 5 phần bằng nhau, tô màu 3 phần: đã tô màu 3/5 (ba phần năm) hình tròn.', 'Split a circle into 5 equal parts and colour 3 of them: 3/5 (three fifths) of the circle is coloured.'), visual: fv(3, 5, 'pie') },
          { text: L('Trong phân số 3/5: 3 là tử số (số phần được lấy), 5 là mẫu số (số phần bằng nhau). Mẫu số luôn khác 0.', 'In the fraction 3/5, 3 is the numerator (the number of parts taken) and 5 is the denominator (the number of equal parts). The denominator is never 0.') },
        ],
        function (rng, i) {
          const d = R(rng, 2, lv(i) === 0 ? 6 : 10), n = R(rng, 1, d - 1), f = i % 4, sh = P(rng, ['bar', 'pie', 'rect']);
          if (f === 0) return Q(L('Viết phân số chỉ phần đã tô màu của hình.', 'Write the fraction for the coloured part of the shape.'), fv(n, d, sh), fracA(n, d), L('Mẫu số: số phần bằng nhau. Tử số: số phần được tô màu.', 'Denominator: the number of equal parts. Numerator: the number of coloured parts.'), L(`Đã tô màu ${n}/${d} hình.`, `${n}/${d} of the shape is coloured.`));
          if (f === 1) return Q(L(`Em hãy tô màu ${n}/${d} hình (chạm vào các phần để tô).`, `Colour ${n}/${d} of the shape (tap the parts to colour them).`), vz('fraction', { num: 0, den: d, shape: sh }), { kind: 'visual', check: v => v === n }, L(`Hình có ${d} phần bằng nhau, tô ${n} phần.`, `The shape has ${d} equal parts; colour ${n} of them.`), L(`${n}/${d}: tô ${n} trong ${d} phần.`, `${n}/${d}: colour ${n} of the ${d} parts.`));
          if (f === 2) { const t = R(rng, 0, 1); return Q(L(`Phân số ${n}/${d} có ${t ? 'tử số' : 'mẫu số'} là:`, `What is the ${t ? 'numerator' : 'denominator'} of the fraction ${n}/${d}?`), fv(n, d, sh), num(t ? n : d), L('Tử số viết trên gạch ngang, mẫu số viết dưới gạch ngang.', 'The numerator is written above the line and the denominator below it.'), L(`${t ? 'Tử số' : 'Mẫu số'} là ${t ? n : d}.`, `The ${t ? 'numerator' : 'denominator'} is ${t ? n : d}.`)); }
          const nmD = ['', '', 'hai', 'ba', 'tư', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];
          return Q(L(`Phân số "${DIG[n]} phần ${nmD[d]}" viết là:`, `Write the fraction "${fracWordEN(n, d)}" in numbers:`), null, ch(rng, fs(n, d), [fs(d, n), fs(n, d + 1), fs(n + 1 < d ? n + 1 : n - 1 || 1, d)]), L('Đọc tử số trước, mẫu số sau.', 'You say the numerator first, then the denominator.'), L(`${DIG[n]} phần ${nmD[d]}: ${n}/${d}.`, `${fracWordEN(n, d)}: ${n}/${d}.`));
        }),
      lesson(10, 54, L('Phân số và phép chia số tự nhiên', 'Fractions and dividing whole numbers'),
        L('Rô-bốt ISA chia đều 3 chiếc bánh cho 4 bạn nhỏ trong ngày Tết thiếu nhi.', "ISA the robot shares 3 cakes equally between 4 children on Children's Day."),
        [
          { text: L('Thương của phép chia số tự nhiên cho số tự nhiên (khác 0) có thể viết thành phân số: 3 : 4 = 3/4.', 'When you divide a whole number by a whole number (not 0), you can write the quotient as a fraction: 3 : 4 = 3/4.'), visual: fv(3, 4, 'bar') },
          { text: L('Phân số có tử số lớn hơn mẫu số thì lớn hơn 1 (7/4 > 1); tử số bằng mẫu số thì bằng 1; tử số bé hơn mẫu số thì bé hơn 1.', 'A fraction whose numerator is bigger than its denominator is more than 1 (7/4 > 1); if they are equal, the fraction equals 1; if the numerator is smaller, it is less than 1.') },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 1, 15), b = R(rng, 2, 12); return Q(L(`Viết thương ${a} : ${b} dưới dạng phân số.`, `Write the quotient ${a} : ${b} as a fraction.`), null, fracA(a, b), L('Số bị chia là tử số, số chia là mẫu số.', 'The dividend is the numerator and the divisor is the denominator.'), `${a} : ${b} = ${a}/${b}.`); }
          if (f === 1) { const d = R(rng, 2, 9), n = P(rng, [R(rng, 1, d - 1), d, R(rng, d + 1, 2 * d)]); return Q(L(`So sánh phân số ${n}/${d} với 1: ${n}/${d} … 1`, `Compare the fraction ${n}/${d} with 1: ${n}/${d} … 1`), fv(Math.min(n, d), d, 'bar'), cmpAns(n / d, 1), L('So sánh tử số với mẫu số.', 'Compare the numerator with the denominator.'), L(`Tử số ${n} ${sign(n, d)} mẫu số ${d} nên ${n}/${d} ${sign(n, d)} 1.`, `Numerator ${n} ${sign(n, d)} denominator ${d}, so ${n}/${d} ${sign(n, d)} 1.`)); }
          if (f === 2) { const a = R(rng, 2, 9), b = R(rng, a + 1, 12); return Q(L(`Chia đều ${a} cái bánh cho ${b} bạn. Mỗi bạn được bao nhiêu phần của cái bánh?`, `${a} cakes are shared equally between ${b} children. What fraction of a cake does each child get?`), vz('array', { rows: 1, cols: a, emoji: '🎂' }), fracA(a, b), L(`Mỗi bạn được ${a} : ${b} cái bánh.`, `Each child gets ${a} : ${b} cakes.`), L(`${a} : ${b} = ${a}/${b} (cái bánh).`, `${a} : ${b} = ${a}/${b} (of a cake).`)); }
          const n = R(rng, 2, 9);
          return Q(L(`Viết số tự nhiên ${n} dưới dạng phân số có mẫu số là 1.`, `Write the whole number ${n} as a fraction with denominator 1.`), null, fracA(n, 1), L('Mọi số tự nhiên đều viết được thành phân số có mẫu số 1.', 'Every whole number can be written as a fraction with denominator 1.'), `${n} = ${n}/1.`);
        }),
      lesson(10, 55, L('Tính chất cơ bản của phân số', 'The basic property of fractions'),
        L('Rô-bốt ISA cho bạn Quân thấy 1/2 thanh sô-cô-la bằng 2/4 thanh.', 'ISA the robot shows Quân that 1/2 of a chocolate bar is the same as 2/4 of it.'),
        [
          { text: L('Nhân cả tử số và mẫu số với cùng một số tự nhiên khác 0 thì được phân số bằng phân số đã cho: 1/2 = 2/4.', 'If you multiply both the numerator and the denominator by the same whole number (not 0), you get a fraction equal to the one you started with: 1/2 = 2/4.'), visual: vz('fractionCompare', { a: [1, 2], b: [2, 4] }) },
          { text: L('Chia cả tử số và mẫu số cho cùng một số tự nhiên khác 0 (nếu chia hết) thì được phân số bằng phân số đã cho: 6/9 = 2/3.', 'If you divide both the numerator and the denominator by the same whole number (not 0, and it divides exactly), you get an equal fraction: 6/9 = 2/3.') },
        ],
        more(function (rng, i) {
          const d = R(rng, 2, 9), n = R(rng, 1, d - 1), k = R(rng, 2, lv(i) === 0 ? 3 : 6), f = i % 3;
          if (f === 0) return Q(`${MISSF}\n${n}/${d} = ?/${d * k}`, fv(n, d), num(n * k), L(`Mẫu số được nhân với ${k}, tử số cũng nhân với ${k}.`, `The denominator was multiplied by ${k}, so multiply the numerator by ${k} too.`), `${n}/${d} = (${n} × ${k})/(${d} × ${k}) = ${n * k}/${d * k}.`);
          if (f === 1) return Q(`${MISSF}\n${n * k}/${d * k} = ${n}/?`, null, num(d), L(`Tử số được chia cho ${k}, mẫu số cũng chia cho ${k}.`, `The numerator was divided by ${k}, so divide the denominator by ${k} too.`), `${n * k}/${d * k} = (${n * k} : ${k})/(${d * k} : ${k}) = ${n}/${d}.`);
          return Q(L(`Phân số nào bằng phân số ${n}/${d}?`, `Which fraction is equal to ${n}/${d}?`), null, fch(rng, [n * k, d * k], [[n + k, d + k], [n * k, d + k], [n * k + 1, d * k], [n + 1, d * k]]), L('Nhân (hoặc chia) cả tử và mẫu với cùng một số.', 'Multiply (or divide) the numerator and the denominator by the same number.'), `${n}/${d} = ${n * k}/${d * k}.`);
        }, [
          [0, 9, (rng, i) => { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), k = R(rng, 2, lv(i) === 0 ? 3 : 6);  const [p1, q1] = R(rng, 0, 1) ? [n * k, d * k] : P(rng, [[n + k, d + k], [n * k, d + k], [n + 1, d * k]]), ok = p1 * d === q1 * n, rhs = fs(p1, q1); return Q(`${TFQ}\n${n}/${d} = ${rhs}`, null, tf(rng, ok), L('Chỉ khi nhân (hoặc chia) cả tử số và mẫu số với cùng một số khác 0 mới được phân số bằng nó.', 'You only get an equal fraction when you multiply (or divide) both the numerator and the denominator by the same number (not 0).'), ok ? L(`${n}/${d} = (${n} × ${k})/(${d} × ${k}) = ${rhs}. Đúng.`, `${n}/${d} = (${n} × ${k})/(${d} × ${k}) = ${rhs}. True.`) : L(`Sai: ${n}/${d} = ${fs(n * k, d * k)}, không bằng ${rhs}.`, `False: ${n}/${d} = ${fs(n * k, d * k)}, which is not equal to ${rhs}.`)); }],
          [0, 6, (rng, i) => { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), k = R(rng, 2, lv(i) === 0 ? 3 : 6); return Q(`${MISSF}\n${n * k}/${d * k} = ?/${d}`, null, num(n), L(`${d * k} : ${k} = ${d}, nên tử số cũng chia cho ${k}.`, `${d * k} : ${k} = ${d}, so divide the numerator by ${k} too.`), `${n * k}/${d * k} = (${n * k} : ${k})/(${d * k} : ${k}) = ${n}/${d}.`); }],
          [3, 9, rng => { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), k = R(rng, 2, 9); return Q(L(`Ta có ${n}/${d} = ${n * k}/${d * k}. Đã nhân cả tử số và mẫu số của ${n}/${d} với số nào?`, `${n}/${d} = ${n * k}/${d * k}. What number were the numerator and the denominator of ${n}/${d} multiplied by?`), fcmp([n, d], [n * k, d * k]), num(k), L(`Lấy ${d * k} : ${d}.`, `Work out ${d * k} : ${d}.`), `${d * k} : ${d} = ${k}; ${n} × ${k} = ${n * k}.`); }],
          [6, 9, rng => { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), ks = U.sample(rng, [2, 3, 4, 5], 3); return Q(L(`Phân số nào KHÔNG bằng phân số ${n}/${d}?`, `Which fraction is NOT equal to ${n}/${d}?`), null, ch(rng, fs(n + 1, d + 1), ks.map(k => fs(n * k, d * k))), L('Các phân số bằng nhau có được khi nhân cả tử và mẫu với cùng một số.', 'You get equal fractions by multiplying the numerator and the denominator by the same number.'), L(`${ks.map(k => fs(n * k, d * k)).join(', ')} đều bằng ${n}/${d}; ${fs(n + 1, d + 1)} thì không.`, `${ks.map(k => fs(n * k, d * k)).join(', ')} are all equal to ${n}/${d}; ${fs(n + 1, d + 1)} is not.`)); }],
        ])),
      lesson(10, 56, L('Rút gọn phân số', 'Simplifying fractions'),
        L('Rô-bốt ISA rút gọn phân số để bạn Hùng dễ so sánh phần bánh của mình.', 'ISA the robot simplifies fractions so that Hùng can compare his share of the cake more easily.'),
        [
          { text: L('Rút gọn 12/18: chia cả tử và mẫu cho 6 được 2/3. Phân số 2/3 không rút gọn được nữa: đó là phân số tối giản.', 'Simplify 12/18: divide both the numerator and the denominator by 6 to get 2/3. 2/3 cannot be simplified any more: it is in its simplest form.'), visual: vz('fractionCompare', { a: [12, 18], b: [2, 3] }) },
          { text: L('Mẹo: thử chia cả tử và mẫu cho 2, 3, 5, … cho đến khi không chia được nữa.', 'Tip: try dividing both the numerator and the denominator by 2, 3, 5, … until you cannot divide any more.') },
        ],
        more(function (rng, i) {
          const d = R(rng, 2, 9), n = R(rng, 1, d - 1), [sn, sd] = U.simplify(n, d), k = R(rng, 2, lv(i) === 0 ? 3 : 8), f = i % 3;
          const N = sn * k, D = sd * k;
          // picture: the given fraction only (never the reduced answer)
          if (f === 0 || f === 2) return Q(L(`Rút gọn phân số ${N}/${D} thành phân số tối giản.`, `Simplify the fraction ${N}/${D} to its simplest form.`), D <= 24 ? fv(N, D) : null, fracA(sn, sd, true), L(`Chia cả tử và mẫu cho ${k}.`, `Divide both the numerator and the denominator by ${k}.`), redEx(N, D, k));
          const opts = [[sn, sd], [N, D], [sn * 2, sd * 2], [sn + 1, sd + 2]];
          return Q(L('Phân số nào là phân số tối giản?', 'Which fraction is in its simplest form?'), null, ch(rng, fs(sn, sd), opts.slice(1).filter(([a, b]) => U.gcd(a, b) > 1).map(([a, b]) => fs(a, b)).concat([fs(2, 4), fs(3, 6), fs(4, 10)])), L('Phân số tối giản: tử và mẫu không cùng chia hết cho số nào lớn hơn 1.', 'A fraction is in its simplest form when no number bigger than 1 divides both the numerator and the denominator exactly.'), L(`${sn}/${sd} là phân số tối giản.`, `${sn}/${sd} is in its simplest form.`));
        }, [
          [0, 6, (rng, i) => { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), [sn, sd] = U.simplify(n, d), k = R(rng, 2, lv(i) === 0 ? 4 : 8); return Q(`${MISSF}\n${sn * k}/${sd * k} = ?/${sd}`, null, num(sn), L(`Mẫu số ${sd * k} chia cho ${k} được ${sd}, tử số cũng chia cho ${k}.`, `The denominator ${sd * k} divided by ${k} is ${sd}, so divide the numerator by ${k} too.`), redEx(sn * k, sd * k, k)); }],
          [3, 9, rng => { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), [sn, sd] = U.simplify(n, d), k = R(rng, 2, 9); return Q(L(`Rút gọn ${sn * k}/${sd * k} được phân số tối giản ${sn}/${sd}. Ta đã chia cả tử số và mẫu số cho số nào?`, `Simplifying ${sn * k}/${sd * k} gives ${sn}/${sd} in its simplest form. What number were the numerator and the denominator divided by?`), fcmp([sn * k, sd * k], [sn, sd]), num(k), L(`Lấy ${sd * k} : ${sd}.`, `Work out ${sd * k} : ${sd}.`), `${sd * k} : ${sd} = ${k}. ${redEx(sn * k, sd * k, k)}`); }],
          [0, 9, rng => { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), [sn, sd] = U.simplify(n, d), k = R(rng, 2, 6), ok = R(rng, 0, 1) === 1; const cl = ok ? fs(sn, sd) : P(rng, [fs(sn * k - 1, sd * k - 1), fs(sn + 1, sd), fs(sn, sd + 1)]); return Q(L(`Đúng hay sai?\nRút gọn phân số ${sn * k}/${sd * k} được phân số tối giản ${cl}.`, `True or false?\nSimplifying ${sn * k}/${sd * k} gives ${cl} in its simplest form.`), null, tf(rng, ok), L(`Chia cả tử số và mẫu số cho cùng một số.`, 'Divide the numerator and the denominator by the same number.'), `${redEx(sn * k, sd * k, k)} ${TF(ok)}.`); }],
          [6, 9, rng => { const D = P(rng, [20, 24, 30, 32, 36, 40]), N = 2 * R(rng, 1, D / 2 - 1), [sn, sd] = U.simplify(N, D); return Q(L(`Lớp 4A có ${D} học sinh, trong đó có ${N} học sinh nữ. Số học sinh nữ bằng mấy phần số học sinh cả lớp? (Viết phân số tối giản.)`, `Class 4A has ${D} pupils, and ${N} of them are girls. What fraction of the class are girls? (Write it in its simplest form.)`), null, fracA(sn, sd, true), L(`Viết phân số ${N}/${D} rồi rút gọn.`, `Write the fraction ${N}/${D}, then simplify it.`), L(`Số học sinh nữ bằng ${N}/${D} số học sinh cả lớp. ${redEx(N, D, U.gcd(N, D))}`, `The girls are ${N}/${D} of the class. ${redEx(N, D, U.gcd(N, D))}`)); }],
        ])),
      lesson(10, 57, L('Quy đồng mẫu số các phân số', 'Giving fractions a common denominator'),
        L('Rô-bốt ISA giúp hai bạn đổi phần bánh về cùng kiểu cắt để dễ so sánh.', 'ISA the robot helps two friends cut their pieces of cake in the same way so they are easy to compare.'),
        [
          { text: L('Quy đồng mẫu số 2/3 và 5/6: vì 6 : 3 = 2 nên 2/3 = (2 × 2)/(3 × 2) = 4/6; giữ nguyên 5/6.', 'Give 2/3 and 5/6 a common denominator: 6 : 3 = 2, so 2/3 = (2 × 2)/(3 × 2) = 4/6; 5/6 stays the same.'), visual: vz('fractionCompare', { a: [4, 6], b: [5, 6] }) },
          { text: L('Mẫu số chung là mẫu số chia hết cho mẫu số kia.', 'The common denominator is the denominator that can be divided exactly by the other one.') },
        ],
        more(function (rng, i) {
          const [d1, d2] = fracPair(rng), k = d2 / d1, n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1), f = i % 3;
          if (f === 0) return Q(L(`Quy đồng mẫu số hai phân số ${n1}/${d1} và ${n2}/${d2}. Mẫu số chung là bao nhiêu?`, `Give the fractions ${n1}/${d1} and ${n2}/${d2} a common denominator. What is the common denominator?`), null, num(d2), L(`${d2} chia hết cho ${d1}.`, `${d2} can be divided exactly by ${d1}.`), L(`Mẫu số chung là ${d2}.`, `The common denominator is ${d2}.`));
          if (f === 1) return Q(L(`Quy đồng mẫu số ${n1}/${d1} và ${n2}/${d2}:\n${n1}/${d1} = ?/${d2}`, `Give ${n1}/${d1} and ${n2}/${d2} a common denominator:\n${n1}/${d1} = ?/${d2}`), fcmp([n1, d1], [n2, d2]), num(n1 * k), L(`${d2} : ${d1} = ${k}, nhân cả tử và mẫu của ${n1}/${d1} với ${k}.`, `${d2} : ${d1} = ${k}, so multiply the numerator and the denominator of ${n1}/${d1} by ${k}.`), L(`${n1}/${d1} = ${n1 * k}/${d2}; giữ nguyên ${n2}/${d2}.`, `${n1}/${d1} = ${n1 * k}/${d2}; ${n2}/${d2} stays the same.`));
          return Q(L(`Quy đồng mẫu số hai phân số ${n1}/${d1} và ${n2}/${d2}, ta được:`, `Give the fractions ${n1}/${d1} and ${n2}/${d2} a common denominator. You get:`), null, ch(rng, `${n1 * k}/${d2} ${AND} ${n2}/${d2}`, [`${n1}/${d2} ${AND} ${n2}/${d2}`, `${n1 * k}/${d2} ${AND} ${n2 * k}/${d2}`, `${n1 + k}/${d2} ${AND} ${n2}/${d2}`]), L(`Nhân cả tử và mẫu của ${n1}/${d1} với ${k}.`, `Multiply the numerator and the denominator of ${n1}/${d1} by ${k}.`), L(`${n1}/${d1} = ${n1 * k}/${d2}; ${n2}/${d2} giữ nguyên.`, `${n1}/${d1} = ${n1 * k}/${d2}; ${n2}/${d2} stays the same.`));
        }, [
          [0, 6, rng => { const [d1, d2] = fracPair(rng), k = d2 / d1, n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1); return Q(L(`Quy đồng mẫu số ${n1}/${d1} và ${n2}/${d2} với mẫu số chung ${d2}. Ta nhân cả tử số và mẫu số của ${n1}/${d1} với số nào?`, `Give ${n1}/${d1} and ${n2}/${d2} the common denominator ${d2}. What number do you multiply the numerator and the denominator of ${n1}/${d1} by?`), null, num(k), L(`Lấy ${d2} : ${d1}.`, `Work out ${d2} : ${d1}.`), `${d2} : ${d1} = ${k}; ${n1}/${d1} = ${n1 * k}/${d2}.`); }],
          [0, 9, rng => { const [d1, d2] = fracPair(rng), k = d2 / d1, n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1), t = R(rng, 0, 1) ? n1 * k : P(rng, [n1, n1 + k, n1 * k + 1]), ok = t === n1 * k; return Q(L(`Đúng hay sai?\nQuy đồng mẫu số ${n1}/${d1} và ${n2}/${d2} được ${t}/${d2} và ${n2}/${d2}.`, `True or false?\nGiving ${n1}/${d1} and ${n2}/${d2} a common denominator gives ${t}/${d2} and ${n2}/${d2}.`), null, tf(rng, ok), L(`Nhân cả tử và mẫu của ${n1}/${d1} với ${d2} : ${d1} = ${k}.`, `Multiply the numerator and the denominator of ${n1}/${d1} by ${d2} : ${d1} = ${k}.`), `${n1}/${d1} = ${n1 * k}/${d2}. ${TF(ok)}.`); }],
          [3, 9, rng => { const [d1, d2] = fracPair(rng), n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1); return Q(L(`Có thể chọn số nào làm mẫu số chung để quy đồng mẫu số hai phân số ${n1}/${d1} và ${n2}/${d2}?`, `Which number can you use as the common denominator for ${n1}/${d1} and ${n2}/${d2}?`), null, ch(rng, d2, [d1 + d2, d2 + 1, d2 - 1].filter(x => x % d1 !== 0 || x % d2 !== 0)), L(`Chọn số chia hết cho cả ${d1} và ${d2}.`, `Choose a number that can be divided exactly by both ${d1} and ${d2}.`), L(`${d2} chia hết cho ${d1} và ${d2} nên chọn mẫu số chung là ${d2}.`, `${d2} can be divided exactly by ${d1} and by ${d2}, so choose ${d2} as the common denominator.`)); }],
          [6, 9, rng => { const [d1, d2] = fracPair(rng), k = d2 / d1, n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1), C = d2 * 2; return Q(L(`Quy đồng mẫu số hai phân số ${n1}/${d1} và ${n2}/${d2} với mẫu số chung là ${C}:\n${n1}/${d1} = ?/${C}`, `Give ${n1}/${d1} and ${n2}/${d2} the common denominator ${C}:\n${n1}/${d1} = ?/${C}`), null, num(n1 * k * 2), L(`${C} : ${d1} = ${k * 2}, nhân cả tử và mẫu của ${n1}/${d1} với ${k * 2}.`, `${C} : ${d1} = ${k * 2}, so multiply the numerator and the denominator of ${n1}/${d1} by ${k * 2}.`), `${n1}/${d1} = ${n1 * k * 2}/${C}; ${n2}/${d2} = ${n2 * 2}/${C}.`); }],
        ])),
      lesson(10, 58, L('So sánh phân số', 'Comparing fractions'),
        L('Rô-bốt ISA so sánh hai miếng bánh để xem bạn nào được phần nhiều hơn.', 'ISA the robot compares two pieces of cake to see who has the bigger share.'),
        [
          { text: L('Cùng mẫu số: phân số nào có tử số lớn hơn thì lớn hơn. 3/7 < 5/7.', 'Same denominator: the fraction with the bigger numerator is bigger. 3/7 < 5/7.'), visual: vz('fractionCompare', { a: [3, 7], b: [5, 7] }) },
          { text: L('Khác mẫu số: quy đồng mẫu số rồi so sánh. 2/3 và 5/6: 2/3 = 4/6 < 5/6.', 'Different denominators: give them a common denominator, then compare. 2/3 and 5/6: 2/3 = 4/6 < 5/6.'), visual: vz('fractionCompare', { a: [2, 3], b: [5, 6] }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const d = R(rng, 3, 12), a = R(rng, 1, d), b = R(rng, 1, d); return Q(L(`So sánh: ${a}/${d} … ${b}/${d}`, `Compare: ${a}/${d} … ${b}/${d}`), vz('fractionCompare', { a: [a, d], b: [b, d] }), cmpAns(a, b), L('Cùng mẫu số: so sánh tử số.', 'Same denominator: compare the numerators.'), L(`${a} ${sign(a, b)} ${b} nên ${a}/${d} ${sign(a, b)} ${b}/${d}.`, `${a} ${sign(a, b)} ${b}, so ${a}/${d} ${sign(a, b)} ${b}/${d}.`)); }
          if (f === 1) { const [d1, d2] = fracPair(rng), k = d2 / d1, n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1); const sw = R(rng, 0, 1); const A = sw ? [n2, d2] : [n1, d1], B = sw ? [n1, d1] : [n2, d2]; return Q(L(`So sánh: ${A[0]}/${A[1]} … ${B[0]}/${B[1]}`, `Compare: ${A[0]}/${A[1]} … ${B[0]}/${B[1]}`), fcmp(A, B), cmpAns(A[0] / A[1], B[0] / B[1]), L('Quy đồng mẫu số rồi so sánh tử số.', 'Give them a common denominator, then compare the numerators.'), L(`${n1}/${d1} = ${n1 * k}/${d2}. So sánh ${A[0] * (d2 / A[1])}/${d2} và ${B[0] * (d2 / B[1])}/${d2}: ${A[0]}/${A[1]} ${sign(A[0] / A[1], B[0] / B[1])} ${B[0]}/${B[1]}.`, `${n1}/${d1} = ${n1 * k}/${d2}. Compare ${A[0] * (d2 / A[1])}/${d2} and ${B[0] * (d2 / B[1])}/${d2}: ${A[0]}/${A[1]} ${sign(A[0] / A[1], B[0] / B[1])} ${B[0]}/${B[1]}.`)); }
          const n = R(rng, 1, 5), d1 = R(rng, n + 1, 8); let d2 = R(rng, n + 1, 9); if (d2 === d1) d2 = d1 + 1;
          return Q(L(`So sánh hai phân số cùng tử số: ${n}/${d1} … ${n}/${d2}`, `Compare two fractions with the same numerator: ${n}/${d1} … ${n}/${d2}`), vz('fractionCompare', { a: [n, d1], b: [n, d2] }), cmpAns(n / d1, n / d2), L('Cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn (mỗi phần to hơn).', 'Same numerator: the fraction with the smaller denominator is bigger (each part is bigger).'), L(`Mẫu số ${d1} ${sign(d1, d2)} ${d2} nên ${n}/${d1} ${sign(n / d1, n / d2)} ${n}/${d2}.`, `Denominator ${d1} ${sign(d1, d2)} ${d2}, so ${n}/${d1} ${sign(n / d1, n / d2)} ${n}/${d2}.`));
        }, [
          [0, 6, rng => { const d = R(rng, 5, 12), ns = U.sample(rng, Array.from({ length: d - 1 }, (_, j) => j + 1), 4), big = R(rng, 0, 1) === 1, t = big ? Math.max(...ns) : Math.min(...ns); return Q(L(`Phân số nào ${big ? 'lớn nhất' : 'bé nhất'}?`, `Which fraction is the ${big ? 'largest' : 'smallest'}?`), null, ch(rng, fs(t, d), ns.filter(x => x !== t).map(x => fs(x, d))), L('Các phân số cùng mẫu số: so sánh tử số.', 'The fractions have the same denominator: compare the numerators.'), L(`${fs(t, d)} có tử số ${big ? 'lớn nhất' : 'bé nhất'}.`, `${fs(t, d)} has the ${big ? 'largest' : 'smallest'} numerator.`)); }],
          [0, 9, rng => { const d = R(rng, 2, 9), n = P(rng, [R(rng, 1, d - 1), d, R(rng, d + 1, 2 * d)]); return Q(L(`So sánh: ${n}/${d} … 1`, `Compare: ${n}/${d} … 1`), vz('fractionCompare', { a: [Math.min(n, d), d], b: [d, d] }), cmpAns(n / d, 1), L('So sánh tử số với mẫu số.', 'Compare the numerator with the denominator.'), L(`Tử số ${n} ${sign(n, d)} mẫu số ${d} nên ${n}/${d} ${sign(n, d)} 1.`, `Numerator ${n} ${sign(n, d)} denominator ${d}, so ${n}/${d} ${sign(n, d)} 1.`)); }],
          [3, 9, rng => { const d = R(rng, 6, 12), ns = U.sample(rng, Array.from({ length: d - 1 }, (_, j) => j + 1), 3), asc = ns.slice().sort((x, y) => x - y), s = a => a.map(x => fs(x, d)).join('; '); return Q(L(`Sắp xếp các phân số ${s(ns)} theo thứ tự từ bé đến lớn:`, `Put the fractions ${s(ns)} in order from smallest to largest:`), null, ch(rng, s(asc), [s(asc.slice().reverse()), s([asc[1], asc[0], asc[2]]), s([asc[0], asc[2], asc[1]])]), L('Cùng mẫu số: phân số nào có tử số bé hơn thì bé hơn.', 'Same denominator: the fraction with the smaller numerator is smaller.'), `${s(asc)}.`); }],
          [3, 9, rng => { const [x, y] = two(rng), [d1, d2] = fracPair(rng), n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1), A = n1 / d1, B = n2 / d2, k = d2 / d1; const SAME = L('Hai bạn ăn bằng nhau', 'They eat the same amount'), BX = L(`Bạn ${x}`, x), BY = L(`Bạn ${y}`, y); return Q(L(`${x} ăn ${n1}/${d1} cái bánh, ${y} ăn ${n2}/${d2} cái bánh như thế. Bạn nào ăn nhiều bánh hơn?`, `${x} eats ${n1}/${d1} of a cake and ${y} eats ${n2}/${d2} of a cake of the same size. Who eats more cake?`), fcmp([n1, d1], [n2, d2]), ch(rng, A > B ? BX : A < B ? BY : SAME, [BX, BY, SAME]), L('Quy đồng mẫu số rồi so sánh.', 'Give them a common denominator, then compare.'), `${n1}/${d1} = ${n1 * k}/${d2}; ${n1 * k}/${d2} ${sign(A, B)} ${n2}/${d2}.`); }],
          [6, 9, rng => { const [d1, d2] = fracPair(rng), n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1), A = n1 / d1, B = n2 / d2, k = d2 / d1, cl = P(rng, ['<', '>']); const ok = cl === sign(A, B); return Q(`${TFQ}\n${n1}/${d1} ${cl} ${n2}/${d2}`, null, tf(rng, ok), L('Quy đồng mẫu số rồi so sánh tử số.', 'Give them a common denominator, then compare the numerators.'), L(`${n1}/${d1} = ${n1 * k}/${d2}, nên ${n1}/${d1} ${sign(A, B)} ${n2}/${d2}. ${ok ? 'Đúng' : 'Sai'}.`, `${n1}/${d1} = ${n1 * k}/${d2}, so ${n1}/${d1} ${sign(A, B)} ${n2}/${d2}. ${TF(ok)}.`)); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 11. PHÉP CỘNG, PHÉP TRỪ PHÂN SỐ ============
  function addSubGen(op) {
    const add = op === '+';
    // two fractions a/c, b/d (same or multiple denominators); for − the first is strictly bigger
    const pair = (rng, same) => {
      for (let g = 0; g < 40; g++) {
        let a, b, c, d;
        if (same) { d = R(rng, 3, 12); c = d; a = R(rng, 1, d - 1); b = R(rng, 1, d - 1); }
        else { const [d1, d2] = fracPair(rng); [c, d] = R(rng, 0, 1) ? [d2, d1] : [d1, d2]; a = R(rng, 1, c - 1); b = R(rng, 1, d - 1); }
        if (!add && a * d < b * c) [a, b, c, d] = [b, a, d, c];
        if (!add && a * d === b * c) continue;
        const L = U.lcm(c, d), A = a * (L / c), B = b * (L / d), Rn = add ? A + B : A - B, [sn, sd] = U.simplify(Rn, L);
        return { a, b, c, d, L, A, B, Rn, sn, sd };
      }
      return { a: 3, b: 1, c: 4, d: 4, L: 4, A: 3, B: 1, Rn: add ? 4 : 2, sn: add ? 1 : 1, sd: add ? 1 : 2 };
    };
    const how = t => (t.c === t.d ? `${t.a}/${t.c} ${op} ${t.b}/${t.d} = ${t.Rn}/${t.L}` : `${t.a}/${t.c} ${op} ${t.b}/${t.d} = ${t.A}/${t.L} ${op} ${t.B}/${t.L} = ${t.Rn}/${t.L}`) + (t.sn !== t.Rn ? ` = ${t.sn}/${t.sd}` : '');
    const sameH = L(`Cùng mẫu số: ${add ? 'cộng' : 'trừ'} tử số, giữ nguyên mẫu số.`, `Same denominator: ${add ? 'add' : 'subtract'} the numerators and keep the denominator.`);
    const commonH = L('Quy đồng mẫu số trước rồi tính.', 'Give them a common denominator first, then calculate.');
    const FINDF = L('Tìm phân số thích hợp ở ô ?:', 'Find the missing fraction:');
    return more(addSubBase(op), [
      [0, 9, (rng, i) => { const t = pair(rng, i < 5), ok = R(rng, 0, 1) === 1, wrong = t.c === t.d && add ? fs(t.a + t.b, t.c + t.d) : fs(t.Rn + 1, t.L); return Q(`${TFQ}\n${t.a}/${t.c} ${op} ${t.b}/${t.d} = ${ok ? fs(t.Rn, t.L) : wrong}`, null, tf(rng, ok), t.c === t.d ? sameH : commonH, `${how(t)}. ${TF(ok)}.`); }],
      [0, 6, (rng, i) => { const t = pair(rng, false); return Q(L(`Chọn kết quả đúng:\n${t.a}/${t.c} ${op} ${t.b}/${t.d} = ?`, `Choose the correct answer:\n${t.a}/${t.c} ${op} ${t.b}/${t.d} = ?`), fcmp([t.a, t.c], [t.b, t.d]), fch(rng, [t.Rn, t.L], [[add ? t.a + t.b : Math.abs(t.a - t.b), t.c + t.d], [add ? t.a + t.b : Math.abs(t.a - t.b), t.L], [t.Rn, t.L * 2]]), L('Quy đồng mẫu số rồi tính.', 'Give them a common denominator, then calculate.'), how(t) + '.'); }],
      [3, 9, (rng, i) => {
        const t = pair(rng, i < 6), x = nm(rng);
        const pool = EN ? (add
          ? [[`Mum buys ${t.a}/${t.c} kg of grapes and ${t.b}/${t.d} kg of apples. How many kilograms of fruit does she buy altogether?`, 'kg'], [`The first can holds ${t.a}/${t.c} l of oil and the second can holds ${t.b}/${t.d} l of oil. How many litres of oil are there in the two cans altogether?`, 'l']].concat(t.Rn <= t.L ? [[`In the first hour a tap fills ${t.a}/${t.c} of a tank, and in the second hour it fills ${t.b}/${t.d} of the tank. What fraction of the tank does the tap fill in the two hours?`, 'of the tank'], [`In the morning ${x} colours ${t.a}/${t.c} of a picture, and in the afternoon another ${t.b}/${t.d} of it. What fraction of the picture has ${x} coloured?`, 'of the picture']] : [])
          : [[`A jug holds ${t.a}/${t.c} l of water. ${x} pours out ${t.b}/${t.d} l. How many litres of water are left in the jug?`, 'l'], [`A roll of wire is ${t.a}/${t.c} m long. ${t.b}/${t.d} m is cut off. How many metres of wire are left?`, 'm'], [`A box of cakes weighs ${t.a}/${t.c} kg. The family eats ${t.b}/${t.d} kg of it. How many kilograms of cakes are left?`, 'kg']])
          : add
            ? [[`Mẹ mua ${t.a}/${t.c} kg nho và ${t.b}/${t.d} kg táo. Hỏi mẹ mua tất cả bao nhiêu ki-lô-gam hoa quả?`, 'kg'], [`Can thứ nhất có ${t.a}/${t.c} l dầu, can thứ hai có ${t.b}/${t.d} l dầu. Hỏi cả hai can có bao nhiêu lít dầu?`, 'l']].concat(t.Rn <= t.L ? [[`Giờ thứ nhất vòi nước chảy được ${t.a}/${t.c} bể, giờ thứ hai chảy được ${t.b}/${t.d} bể. Hỏi sau hai giờ vòi nước chảy được bao nhiêu phần của bể?`, 'bể'], [`Buổi sáng ${x} tô màu được ${t.a}/${t.c} bức tranh, buổi chiều tô thêm ${t.b}/${t.d} bức tranh. Hỏi ${x} đã tô màu được bao nhiêu phần bức tranh?`, 'bức tranh']] : [])
            : [[`Một bình có ${t.a}/${t.c} l nước, ${x} rót ra ${t.b}/${t.d} l. Hỏi trong bình còn lại bao nhiêu lít nước?`, 'l'], [`Một cuộn dây dài ${t.a}/${t.c} m, người ta cắt đi ${t.b}/${t.d} m. Hỏi cuộn dây còn lại dài bao nhiêu mét?`, 'm'], [`Một hộp bánh nặng ${t.a}/${t.c} kg, cả nhà đã ăn hết ${t.b}/${t.d} kg. Hỏi hộp bánh còn lại bao nhiêu ki-lô-gam?`, 'kg']];
        const [tx, u] = P(rng, pool);
        return Q(tx, fcmp([t.a, t.c], [t.b, t.d]), fracA(t.sn, t.sd), t.c === t.d ? sameH : commonH, `${how(t)} (${u}).`);
      }],
      [3, 9, (rng, i) => { const t = pair(rng, i < 6), ref = add ? 1 : 0.5, rs = add ? '1' : '1/2', v = t.Rn / t.L; return Q(L(`So sánh: ${t.a}/${t.c} ${op} ${t.b}/${t.d} … ${rs}`, `Compare: ${t.a}/${t.c} ${op} ${t.b}/${t.d} … ${rs}`), null, cmpAns(v, ref), L('Tính kết quả trước rồi so sánh.', 'Work out the answer first, then compare.'), `${how(t)}; ${fs(t.sn, t.sd)} ${sign(v, ref)} ${rs}.`); }],
      [6, 9, rng => { const t = pair(rng, R(rng, 0, 1) === 1); if (add) return Q(`${FINDF}\n? + ${t.b}/${t.d} = ${t.sn}/${t.sd}`, null, fracA(...U.simplify(t.a, t.c)), L('Số hạng chưa biết = tổng − số hạng đã biết.', 'Missing addend = sum − the addend you know.'), `? = ${t.sn}/${t.sd} ${M} ${t.b}/${t.d} = ${t.a}/${t.c}.`); if (R(rng, 0, 1)) return Q(`${FINDF}\n? ${M} ${t.b}/${t.d} = ${t.sn}/${t.sd}`, null, fracA(...U.simplify(t.a, t.c)), L('Số bị trừ = hiệu + số trừ.', 'Minuend = difference + subtrahend.'), `? = ${t.sn}/${t.sd} + ${t.b}/${t.d} = ${t.a}/${t.c}.`); return Q(`${FINDF}\n${t.a}/${t.c} ${M} ? = ${t.sn}/${t.sd}`, null, fracA(...U.simplify(t.b, t.d)), L('Số trừ = số bị trừ − hiệu.', 'Subtrahend = minuend − difference.'), `? = ${t.a}/${t.c} ${M} ${t.sn}/${t.sd} = ${t.b}/${t.d}.`); }],
      [7, 9, rng => { const c = R(rng, 2, 9), a = R(rng, 1, c - 1), n = R(rng, 1, 4), top = add ? n * c + a : n * c - a, [sn, sd] = U.simplify(top, c); return Q(L(`Tính: ${n} ${op} ${a}/${c}`, `Calculate: ${n} ${op} ${a}/${c}`), null, fracA(sn, sd), L(`Viết ${n} thành phân số có mẫu số ${c}: ${n} = ${n * c}/${c}.`, `Write ${n} as a fraction with denominator ${c}: ${n} = ${n * c}/${c}.`), `${n} ${op} ${a}/${c} = ${n * c}/${c} ${op} ${a}/${c} = ${top}/${c}${sn !== top ? ` = ${sn}/${sd}` : ''}.`); }],
    ]);
  }
  function addSubBase(op) {
    return function (rng, i) {
      const f = i % 4;
      let a, b, c, d;
      if (lv(i) === 0 || f === 0) { d = R(rng, 3, 12); c = d; a = R(rng, 1, d - 1); b = R(rng, 1, d - 1); if (op === M && a < b) [a, b] = [b, a]; if (op === M && a === b) a = Math.min(d, a + 1); }
      else { const [d1, d2] = fracPair(rng); const sw = R(rng, 0, 1); [c, d] = sw ? [d2, d1] : [d1, d2]; a = R(rng, 1, c - 1); b = R(rng, 1, d - 1); if (op === M && a / c < b / d) { [a, c, b, d] = [b, d, a, c]; } if (op === M && a / c === b / d) a = a + 1 < c ? a + 1 : a; }
      const Lc = U.lcm(c, d), A = a * (Lc / c), B = b * (Lc / d), Rn = op === '+' ? A + B : A - B;
      if (Rn <= 0 && op === M) { return Q(`${a}/${c} ${M} ${a}/${c} = ?`, null, num(0), L('Một số trừ đi chính nó bằng 0.', 'A number minus itself is 0.'), `${a}/${c} ${M} ${a}/${c} = 0.`); }
      const [sn, sd] = U.simplify(Rn, Lc);
      const expr = `${a}/${c} ${op} ${b}/${d}`;
      const how = c === d ? `${a}/${c} ${op} ${b}/${d} = (${a} ${op} ${b})/${c} = ${Rn}/${Lc}` : `${expr} = ${A}/${Lc} ${op} ${B}/${Lc} = ${Rn}/${Lc}`;
      const tail = (sn !== Rn ? ` = ${sn}/${sd}` : '') + '.';
      const sameH = L('Cùng mẫu số: cộng (trừ) tử số, giữ nguyên mẫu số.', 'Same denominator: add (or subtract) the numerators and keep the denominator.');
      if (f === 3 && c === d) {
        return Q(L(`Tính rồi chọn kết quả đúng:\n${expr} = ?`, `Work it out, then choose the correct answer:\n${expr} = ?`), fcmp([a, c], [b, d]), ch(rng, fs(Rn, Lc), [fs(op === '+' ? a + b : Math.abs(a - b), c + d), fs(Rn, Lc * 2), fs(Rn + 1, Lc)]), sameH, how + tail);
      }
      if (f === 2) {
        const who = nm(rng), w = op === '+' ? L(`Ngày thứ nhất ${who} đọc được ${a}/${c} quyển sách, ngày thứ hai đọc được ${b}/${d} quyển. Hỏi cả hai ngày ${who} đọc được bao nhiêu phần quyển sách?`, `On the first day ${who} reads ${a}/${c} of a book, and on the second day ${b}/${d} of it. What fraction of the book does ${who} read in the two days?`) : L(`Một tấm vải dài ${a}/${c} m, mẹ cắt đi ${b}/${d} m để may túi. Hỏi tấm vải còn lại bao nhiêu mét?`, `A piece of cloth is ${a}/${c} m long. Mum cuts off ${b}/${d} m to make a bag. How many metres of cloth are left?`);
        return Q(w, fcmp([a, c], [b, d]), fracA(sn, sd), c === d ? sameH : L('Quy đồng mẫu số trước rồi tính.', 'Give them a common denominator first, then calculate.'), how + tail);
      }
      return Q(L(`Tính:\n${expr}`, `Calculate:\n${expr}`), fcmp([a, c], [b, d]), fracA(sn, sd), c === d ? L('Cùng mẫu số: cộng (trừ) các tử số, giữ nguyên mẫu số.', 'Same denominator: add (or subtract) the numerators and keep the denominator.') : L(`Quy đồng mẫu số (mẫu số chung ${Lc}) rồi ${op === '+' ? 'cộng' : 'trừ'} tử số.`, `Give them a common denominator (${Lc}), then ${op === '+' ? 'add' : 'subtract'} the numerators.`), how + tail);
    };
  }
  const c11 = {
    id: 'g4-c11', semester: 2, title: L('Phép cộng, phép trừ phân số', 'Adding and subtracting fractions'), icon: '➕', lessons: [
      lesson(11, 60, L('Phép cộng phân số', 'Adding fractions'),
        L('Rô-bốt ISA cùng bạn Lan sơn hàng rào: buổi sáng sơn được một phần, buổi chiều sơn thêm một phần.', 'ISA the robot and Lan paint a fence: they paint one part in the morning and another part in the afternoon.'),
        [
          { text: L('Cộng hai phân số cùng mẫu số: cộng hai tử số, giữ nguyên mẫu số. 2/7 + 3/7 = 5/7.', 'To add two fractions with the same denominator, add the numerators and keep the denominator. 2/7 + 3/7 = 5/7.'), visual: vz('fractionCompare', { a: [2, 7], b: [3, 7] }) },
          { text: L('Khác mẫu số: quy đồng mẫu số rồi cộng. 1/2 + 1/4 = 2/4 + 1/4 = 3/4.', 'Different denominators: give them a common denominator, then add. 1/2 + 1/4 = 2/4 + 1/4 = 3/4.'), visual: fv(3, 4, 'bar') },
        ],
        addSubGen('+')),
      lesson(11, 61, L('Phép trừ phân số', 'Subtracting fractions'),
        L('Rô-bốt ISA tính phần bánh còn lại sau khi bạn Nam mời các bạn cùng ăn.', 'ISA the robot works out how much cake is left after Nam shares it with his friends.'),
        [
          { text: L('Trừ hai phân số cùng mẫu số: trừ tử số của phân số thứ nhất cho tử số của phân số thứ hai, giữ nguyên mẫu số. 5/8 − 2/8 = 3/8.', 'To subtract two fractions with the same denominator, take the second numerator away from the first and keep the denominator. 5/8 − 2/8 = 3/8.'), visual: vz('fractionCompare', { a: [5, 8], b: [2, 8] }) },
          { text: L('Khác mẫu số: quy đồng mẫu số rồi trừ. 5/6 − 1/3 = 5/6 − 2/6 = 3/6 = 1/2.', 'Different denominators: give them a common denominator, then subtract. 5/6 − 1/3 = 5/6 − 2/6 = 3/6 = 1/2.') },
        ],
        addSubGen(M)),
    ],
  };

  // ============ CHỦ ĐỀ 12. PHÉP NHÂN, PHÉP CHIA PHÂN SỐ ============
  const c12 = {
    id: 'g4-c12', semester: 2, title: L('Phép nhân, phép chia phân số', 'Multiplying and dividing fractions'), icon: '✖️', lessons: [
      lesson(12, 63, L('Phép nhân phân số', 'Multiplying fractions'),
        L('Rô-bốt ISA tính diện tích mảnh vườn nhỏ hình chữ nhật có cạnh là phân số.', 'ISA the robot works out the area of a small rectangular garden whose sides are fractions of a metre.'),
        [
          { text: L('Muốn nhân hai phân số, ta lấy tử số nhân tử số, mẫu số nhân mẫu số. 2/3 × 4/5 = 8/15.', 'To multiply two fractions, multiply the numerators together and the denominators together. 2/3 × 4/5 = 8/15.'), visual: vz('fraction', { num: 8, den: 15, shape: 'rect' }) },
          { text: L('Nhân phân số với số tự nhiên: 2/7 × 3 = 6/7 (nhân tử số với số tự nhiên).', 'Multiplying a fraction by a whole number: 2/7 × 3 = 6/7 (multiply the numerator by the whole number).') },
        ],
        more(function (rng, i) {
          const f = i % 3;
          const NN = L('Tử nhân tử, mẫu nhân mẫu.', 'Multiply the numerators together and the denominators together.');
          if (f === 1) { const d = R(rng, 3, 12), n = R(rng, 1, d - 1), k = R(rng, 2, 5); const [sn, sd] = U.simplify(n * k, d); return Q(L(`Tính: ${n}/${d} × ${k}`, `Calculate: ${n}/${d} × ${k}`), null, fracA(sn, sd), L('Nhân tử số với số tự nhiên, giữ nguyên mẫu số.', 'Multiply the numerator by the whole number and keep the denominator.'), `${n}/${d} × ${k} = ${n * k}/${d}${sn !== n * k ? ` = ${sn}/${sd}` : ''}.`); }
          const b = R(rng, 2, 9), a = R(rng, 1, b - 1), d = R(rng, 2, 9), c = R(rng, 1, d - 1), [sn, sd] = U.simplify(a * c, b * d);
          if (f === 2) {
            // chiều dài must be the larger fraction (and the two sides must differ)
            let p = a, q = b, r = c, s = d;
            for (let g = 0; g < 40 && p * s === q * r; g++) { s = R(rng, 2, 9); r = R(rng, 1, s - 1); }
            if (p * s === q * r) { r = 1; s = p * 2 === q ? 3 : 2; }
            if (p * s < q * r) [p, q, r, s] = [r, s, p, q];
            const [an, ad] = U.simplify(p * r, q * s);
            return Q(L(`Một hình chữ nhật có chiều dài ${p}/${q} m, chiều rộng ${r}/${s} m. Tính diện tích hình chữ nhật (m²).`, `A rectangle is ${p}/${q} m long and ${r}/${s} m wide. Work out its area (m²).`), vz('shape', { kind: 'rect' }), fracA(an, ad), L('Diện tích = dài × rộng.', 'Area = length × width.'), `${p}/${q} × ${r}/${s} = ${p * r}/${q * s}${an !== p * r ? ` = ${an}/${ad}` : ''} (m²).`);
          }
          return Q(L(`Tính: ${a}/${b} × ${c}/${d}`, `Calculate: ${a}/${b} × ${c}/${d}`), null, fracA(sn, sd), NN, `${a}/${b} × ${c}/${d} = (${a} × ${c})/(${b} × ${d}) = ${a * c}/${b * d}${sn !== a * c ? ` = ${sn}/${sd}` : ''}.`);
        }, [
          [0, 6, rng => { const b = R(rng, 2, 9), a = R(rng, 1, b - 1), d = R(rng, 2, 9), c = R(rng, 1, d - 1); return Q(L(`Chọn kết quả đúng:\n${a}/${b} × ${c}/${d} = ?`, `Choose the correct answer:\n${a}/${b} × ${c}/${d} = ?`), null, fch(rng, [a * c, b * d], [[a + c, b + d], [a * c, b + d], [a * d, b * c]]), L('Tử nhân tử, mẫu nhân mẫu.', 'Multiply the numerators together and the denominators together.'), `${a}/${b} × ${c}/${d} = ${fs(a * c, b * d)}.`); }],
          [0, 9, rng => { const b = R(rng, 2, 9), a = R(rng, 1, b - 1), d = R(rng, 2, 9), c = R(rng, 1, d - 1), ok = R(rng, 0, 1) === 1, cl = ok ? fs(a * c, b * d) : P(rng, [fs(a + c, b + d), fs(a * c, b + d)]); return Q(`${TFQ}\n${a}/${b} × ${c}/${d} = ${cl}`, null, tf(rng, ok), L('Tử nhân tử, mẫu nhân mẫu.', 'Multiply the numerators together and the denominators together.'), `${a}/${b} × ${c}/${d} = ${fs(a * c, b * d)}. ${TF(ok)}.`); }],
          [3, 9, rng => { const b = R(rng, 2, 9), a = R(rng, 1, b - 1), per = R(rng, 0, 1) === 1; if (per) { const [sn, sd] = U.simplify(a * 4, b); return Q(L(`Một hình vuông có cạnh ${a}/${b} m. Tính chu vi hình vuông.`, `A square has sides of ${a}/${b} m. Work out its perimeter.`), vz('shape', { kind: 'square' }), fracA(sn, sd), L('Chu vi hình vuông = cạnh × 4.', 'Perimeter of a square = side × 4.'), `${a}/${b} × 4 = ${a * 4}/${b}${sn !== a * 4 ? ` = ${sn}/${sd}` : ''} (m).`); } const [sn, sd] = U.simplify(a * a, b * b); return Q(L(`Một hình vuông có cạnh ${a}/${b} m. Tính diện tích hình vuông (m²).`, `A square has sides of ${a}/${b} m. Work out its area (m²).`), vz('shape', { kind: 'square' }), fracA(sn, sd), L('Diện tích hình vuông = cạnh × cạnh.', 'Area of a square = side × side.'), `${a}/${b} × ${a}/${b} = ${a * a}/${b * b} (m²).`); }],
          [3, 9, rng => { const b = R(rng, 2, 9), a = R(rng, 1, b - 1), k = R(rng, 2, 9), [sn, sd] = U.simplify(a * k, b), [it, u, uu, ie, ue] = P(rng, [['chai', 'l', 'lít', 'bottle', 'litres'], ['túi', 'kg', 'ki-lô-gam', 'bag', 'kilograms'], ['đoạn dây', 'm', 'mét', 'piece of string', 'metres']]); return Q(L(`Mỗi ${it} có ${a}/${b} ${u}${it === 'đoạn dây' ? ' dài' : ''}. Hỏi ${k} ${it} như thế ${it === 'đoạn dây' ? 'dài' : 'có'} tất cả bao nhiêu ${uu}?`.replace(`có ${a}/${b} ${u} dài`, `dài ${a}/${b} ${u}`), it === 'đoạn dây' ? `Each piece of string is ${a}/${b} m long. How many metres long are ${k} pieces like this altogether?` : `Each ${ie} holds ${a}/${b} ${u}. How many ${ue} do ${k} ${ie}s like this hold altogether?`), null, fracA(sn, sd), L(`Lấy ${a}/${b} × ${k}.`, `Work out ${a}/${b} × ${k}.`), `${a}/${b} × ${k} = ${a * k}/${b}${sn !== a * k ? ` = ${sn}/${sd}` : ''} (${u}).`); }],
          [6, 9, rng => { const b = R(rng, 2, 9), a = R(rng, 1, 9), d = R(rng, 2, 9), c = R(rng, 0, 1) ? R(rng, 1, d - 1) : R(rng, d + 1, 2 * d), v = a * c / (b * d); return Q(L(`So sánh: ${a}/${b} × ${c}/${d} … ${a}/${b}`, `Compare: ${a}/${b} × ${c}/${d} … ${a}/${b}`), null, cmpAns(v, a / b), L('So sánh thừa số thứ hai với 1: nhân với phân số bé hơn 1 thì được kết quả bé hơn, lớn hơn 1 thì được kết quả lớn hơn.', 'Compare the second factor with 1: multiplying by a fraction less than 1 gives a smaller answer; multiplying by a fraction more than 1 gives a bigger answer.'), L(`${c}/${d} ${sign(c, d)} 1 nên ${a}/${b} × ${c}/${d} = ${fs(a * c, b * d)} ${sign(v, a / b)} ${a}/${b}.`, `${c}/${d} ${sign(c, d)} 1, so ${a}/${b} × ${c}/${d} = ${fs(a * c, b * d)} ${sign(v, a / b)} ${a}/${b}.`)); }],
        ])),
      // English: "phân số đảo ngược" = the fraction turned upside down (its reciprocal)
      lesson(12, 64, L('Phép chia phân số', 'Dividing fractions'),
        L('Rô-bốt ISA chia đều nước cam vào những chiếc cốc nhỏ cho các bạn.', 'ISA the robot pours orange juice equally into small cups for the children.'),
        [
          { text: L('Phân số đảo ngược của 2/3 là 3/2.', 'Turning 2/3 upside down gives 3/2 (its reciprocal).') },
          { text: L('Muốn chia hai phân số, ta lấy phân số thứ nhất nhân với phân số thứ hai đảo ngược. 3/4 : 2/5 = 3/4 × 5/2 = 15/8.', 'To divide by a fraction, multiply the first fraction by the second fraction turned upside down. 3/4 : 2/5 = 3/4 × 5/2 = 15/8.') },
        ],
        more(function (rng, i) {
          const f = i % 3;
          const UPS = L('Nhân phân số thứ nhất với phân số thứ hai đảo ngược.', 'Multiply the first fraction by the second fraction turned upside down.');
          const b = R(rng, 2, 9), d = R(rng, 2, 9), c = R(rng, 1, d - 1); let a = R(rng, 1, 9); if (a === b) a = b - 1;   // no a/a (= 1) operands
          if (f === 0) return Q(L(`Phân số đảo ngược của ${c}/${d} là:`, `What is ${c}/${d} turned upside down (its reciprocal)?`), null, ch(rng, fs(d, c), [fs(c, d), fs(d, c + 1), fs(c + d, d)]), L('Đổi chỗ tử số và mẫu số.', 'Swap the numerator and the denominator.'), L(`Phân số đảo ngược của ${c}/${d} là ${d}/${c}.`, `${c}/${d} turned upside down is ${d}/${c}.`));
          const [sn, sd] = U.simplify(a * d, b * c);
          if (f === 1) return Q(L(`Tính: ${a}/${b} : ${c}/${d}`, `Calculate: ${a}/${b} : ${c}/${d}`), null, fracA(sn, sd), UPS, `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c} = ${a * d}/${b * c}${sn !== a * d ? ` = ${sn}/${sd}` : ''}.`);
          const k = R(rng, 2, 5), [s2n, s2d] = U.simplify(a, b * k);
          return Q(L(`Tính: ${a}/${b} : ${k}`, `Calculate: ${a}/${b} : ${k}`), null, fracA(s2n, s2d), L(`Chia cho ${k} tức là nhân với 1/${k}.`, `Dividing by ${k} is the same as multiplying by 1/${k}.`), `${a}/${b} : ${k} = ${a}/${b} × 1/${k} = ${a}/${b * k}${s2n !== a ? ` = ${s2n}/${s2d}` : ''}.`);
        }, [
          [0, 6, rng => { const b = R(rng, 2, 9), d = R(rng, 2, 9), c = R(rng, 1, d - 1); let a = R(rng, 1, 9); if (a === b) a = b - 1; return Q(L(`Chọn kết quả đúng:\n${a}/${b} : ${c}/${d} = ?`, `Choose the correct answer:\n${a}/${b} : ${c}/${d} = ?`), null, fch(rng, [a * d, b * c], [[a * c, b * d], [b * c, a * d], [a * d, b * d]]), L('Nhân phân số thứ nhất với phân số thứ hai đảo ngược.', 'Multiply the first fraction by the second fraction turned upside down.'), `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c} = ${fs(a * d, b * c)}.`); }],
          [0, 9, rng => { const b = R(rng, 2, 9), d = R(rng, 2, 9), c = R(rng, 1, d - 1), ok = R(rng, 0, 1) === 1; let a = R(rng, 1, 9); if (a === b) a = b - 1; const st = ok ? `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c}` : `${a}/${b} : ${c}/${d} = ${a}/${b} × ${c}/${d}`; return Q(`${TFQ}\n${st}`, null, tf(rng, ok), L('Chia cho một phân số là nhân với phân số đảo ngược của nó.', 'Dividing by a fraction is the same as multiplying by that fraction turned upside down.'), `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c}. ${TF(ok)}.`); }],
          [3, 9, rng => { let b = R(rng, 2, 9), a = R(rng, 1, b - 1), d = R(rng, 2, 9), c = R(rng, 1, d - 1); if (a * d === b * c) c = d + 1; if (c * b < a * d) [a, b, c, d] = [c, d, a, b]; const [Sn, Sd] = U.simplify(a * c, b * d); return Q(L(`Một hình chữ nhật có diện tích ${Sn}/${Sd} m², chiều rộng ${a}/${b} m. Tính chiều dài hình chữ nhật.`, `A rectangle has an area of ${Sn}/${Sd} m² and a width of ${a}/${b} m. Work out its length.`), vz('shape', { kind: 'rect' }), fracA(...U.simplify(c, d)), L('Chiều dài = diện tích : chiều rộng.', 'Length = area : width.'), `${Sn}/${Sd} : ${a}/${b} = ${Sn}/${Sd} × ${b}/${a} = ${fs(Sn * b, Sd * a)} = ${fs(...U.simplify(c, d))} (m).`); }],
          [3, 9, rng => { const b = R(rng, 2, 9), k = R(rng, 2, 6); let a = R(rng, 1, 9); if (a === b) a = b - 1; const [sn, sd] = U.simplify(a, b * k); return Q(L(`Có ${a}/${b} l nước cam rót đều vào ${k} cốc. Hỏi mỗi cốc có bao nhiêu lít nước cam?`, `${a}/${b} l of orange juice is poured equally into ${k} cups. How many litres of orange juice are in each cup?`), null, fracA(sn, sd), L(`Lấy ${a}/${b} : ${k}.`, `Work out ${a}/${b} : ${k}.`), `${a}/${b} : ${k} = ${a}/${b} × 1/${k} = ${fs(a, b * k)}${sn !== a ? ` = ${sn}/${sd}` : ''} (l).`); }],
          [6, 9, rng => { const k = R(rng, 2, 9), b = R(rng, 2, 9); let a = R(rng, 1, 9); if (a === b) a = b - 1; const [sn, sd] = U.simplify(k * b, a); return Q(L(`Tính: ${k} : ${a}/${b}`, `Calculate: ${k} : ${a}/${b}`), null, fracA(sn, sd), L(`Lấy ${k} nhân với phân số đảo ngược của ${a}/${b}.`, `Multiply ${k} by ${a}/${b} turned upside down.`), `${k} : ${a}/${b} = ${k} × ${b}/${a} = ${fs(k * b, a)}${sn !== k * b || sd !== a ? ` = ${sn}/${sd}` : ''}.`); }],
        ])),
      lesson(12, 65, L('Tìm phân số của một số', 'Finding a fraction of a number'),
        L('Rô-bốt ISA giúp cô giáo tính 2/3 số học sinh của lớp đi tham quan.', 'ISA the robot helps the teacher work out 2/3 of the pupils in the class, who are going on a trip.'),
        [
          { text: L('Muốn tìm 2/3 của 12, ta lấy 12 × 2/3 = 8. (Chia 12 thành 3 phần bằng nhau, lấy 2 phần.)', 'To find 2/3 of 12, work out 12 × 2/3 = 8. (Split 12 into 3 equal parts and take 2 of them.)'), visual: vz('tape', { bars: [{ label: '12', parts: 3, units: 6, value: '12' }, { label: '2/3', parts: 2, units: 4, value: '?' }] }) },
        ],
        more(function (rng, i) {
          const d = R(rng, 2, 9), f = i % 3; let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; const q = R(rng, 2, f === 1 ? Math.max(2, Math.floor(45 / d)) : lv(i) === 0 ? 6 : 20), N = d * q, v = n * q;
          const tape = vz('tape', { bars: [{ label: L('Cả', 'Whole'), parts: d, units: d, value: String(N) }, { label: `${n}/${d}`, parts: n, units: n, value: '?' }] });
          const FOF = L(`Tìm ${n}/${d} của ${N}.`, `Find ${n}/${d} of ${N}.`);
          if (f === 0) return Q(FOF, tape, num(v), L(`Lấy ${N} × ${n}/${d}.`, `Work out ${N} × ${n}/${d}.`), `${N} × ${n}/${d} = ${N} : ${d} × ${n} = ${v}.`);
          if (f === 1) return Q(L(`Lớp 4A có ${N} học sinh, trong đó ${n}/${d} số học sinh là học sinh nữ. Hỏi lớp có bao nhiêu học sinh nữ?`, `Class 4A has ${N} pupils, and ${n}/${d} of them are girls. How many girls are there in the class?`), tape, num(v), FOF, L(`${N} × ${n}/${d} = ${v} (học sinh).`, `${N} × ${n}/${d} = ${v} (girls).`));
          return Q(L(`Một cửa hàng có ${N} kg gạo, đã bán ${n}/${d} số gạo đó. Hỏi cửa hàng đã bán bao nhiêu ki-lô-gam gạo?`, `A shop has ${N} kg of rice and has sold ${n}/${d} of it. How many kilograms of rice has the shop sold?`), tape, num(v, 'kg'), FOF, `${N} × ${n}/${d} = ${v} (kg).`);
        }, [
          [0, 9, (rng, i) => {
            const d = R(rng, 2, 9); let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; const q = R(rng, 2, lv(i) === 0 ? 6 : 20), N = d * q, v = n * q;
            const [tx, u] = P(rng, EN ? [[`A road is ${N} m long. A team of workers has repaired ${n}/${d} of it. How many metres of road have they repaired?`, 'm'], [`A piece of cloth is ${N} m long. Mum has used ${n}/${d} of it to make curtains. How many metres of cloth has she used?`, 'm'], [`A tank holds ${N} l of water. ${n}/${d} of the water has been used. How many litres of water have been used?`, 'l'], [`A flock has ${N} chickens, and ${n}/${d} of them are hens. How many hens are there?`, '']]
              : [[`Một quãng đường dài ${N} m, đội công nhân đã sửa ${n}/${d} quãng đường. Hỏi đội đã sửa bao nhiêu mét đường?`, 'm'], [`Một tấm vải dài ${N} m, mẹ đã dùng ${n}/${d} tấm vải để may rèm. Hỏi mẹ đã dùng bao nhiêu mét vải?`, 'm'], [`Bể chứa ${N} l nước, người ta đã dùng ${n}/${d} số nước trong bể. Hỏi đã dùng bao nhiêu lít nước?`, 'l'], [`Đàn gà có ${N} con, trong đó ${n}/${d} số gà là gà mái. Hỏi đàn gà có bao nhiêu con gà mái?`, '']]);
            return Q(tx, vz('tape', { bars: [{ label: L('Cả', 'Whole'), parts: d, units: d, value: String(N) }, { label: `${n}/${d}`, parts: n, units: n, value: '?' }] }), u ? num(v, u) : num(v), L(`Tìm ${n}/${d} của ${N}.`, `Find ${n}/${d} of ${N}.`), `${N} × ${n}/${d} = ${v}${u ? ` (${u})` : L(' (con)', ' (hens)')}.`);
          }],
          [6, 9, rng => { const d = R(rng, 3, 9); let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; const q = R(rng, 2, 12), N = d * q, v = n * q; return Q(L(`Một cửa hàng có ${N} kg đường, đã bán ${n}/${d} số đường đó. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam đường?`, `A shop has ${N} kg of sugar and has sold ${n}/${d} of it. How many kilograms of sugar are left?`), vz('tape', { bars: [{ label: L('Có', 'Total'), parts: d, units: d, value: String(N) }, { label: L('Đã bán', 'Sold'), parts: n, units: n, value: '?' }] }), num(N - v, 'kg'), L(`Bước 1: tìm ${n}/${d} của ${N}. Bước 2: lấy ${N} trừ số đã bán.`, `Step 1: find ${n}/${d} of ${N}. Step 2: take the amount sold away from ${N}.`), L(`Đã bán: ${N} × ${n}/${d} = ${v} (kg). Còn lại: ${N} ${M} ${v} = ${N - v} (kg).`, `Sold: ${N} × ${n}/${d} = ${v} (kg). Left: ${N} ${M} ${v} = ${N - v} (kg).`)); }],
          [0, 6, rng => { const d = R(rng, 2, 9); let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; const q = R(rng, 2, 10), N = d * q; return Q(L(`${n}/${d} của ${N} là:`, `${n}/${d} of ${N} is:`), null, ch(rng, n * q, [q, N * n, N + n, N - n].filter(x => x !== n * q)), L(`Lấy ${N} : ${d} × ${n}.`, `Work out ${N} : ${d} × ${n}.`), `${N} : ${d} × ${n} = ${n * q}.`); }],
          [0, 9, rng => { const d = R(rng, 2, 9); let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; const q = R(rng, 2, 10), N = d * q, v = n * q, cl = P(rng, [v, v, q, v + n]); return Q(L(`Đúng hay sai?\n${n}/${d} của ${N} là ${cl}.`, `True or false?\n${n}/${d} of ${N} is ${cl}.`), null, tf(rng, cl === v), L(`Tìm ${n}/${d} của ${N}: lấy ${N} × ${n}/${d}.`, `To find ${n}/${d} of ${N}, work out ${N} × ${n}/${d}.`), `${N} × ${n}/${d} = ${v}. ${TF(cl === v)}.`); }],
          [3, 9, rng => { const [base, u1, u2, ds, e1, e2] = P(rng, [[60, 'giờ', 'phút', [2, 3, 4, 5, 6, 10, 12], 'hour', 'minutes'], [100, 'm', 'cm', [2, 4, 5, 10, 20, 25], 'm', 'cm'], [1000, 'kg', 'g', [2, 4, 5, 8, 10], 'kg', 'g'], [100, 'tạ', 'kg', [2, 4, 5, 10], 'quintal', 'kg'], [100, 'thế kỉ', 'năm', [2, 4, 5], 'century', 'years']]), d = P(rng, ds); let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; const v = base / d * n; return Q(L(`${n}/${d} ${u1} = ? ${u2}`, `${n}/${d} ${e1} = ? ${e2}`), null, num(v, L(u2, e2)), L(`1 ${u1} = ${F(base)} ${u2}; tìm ${n}/${d} của ${F(base)}.`, `1 ${e1} = ${F(base)} ${e2}; find ${n}/${d} of ${F(base)}.`), L(`${F(base)} × ${n}/${d} = ${F(v)}. Vậy ${n}/${d} ${u1} = ${F(v)} ${u2}.`, `${F(base)} × ${n}/${d} = ${F(v)}. So ${n}/${d} ${e1} = ${F(v)} ${e2}.`)); }],
        ])),
    ],
  };

  CURRICULUM.push({
    grade: 4,
    title: L('Lớp 4', 'Grade 4'),
    book: L('Kết nối tri thức với cuộc sống', 'Connecting Knowledge with Life'),
    topics: [c1, c2, c3, c4, c5, c6, c8, c9, c10, c11, c12],
  });
})();
