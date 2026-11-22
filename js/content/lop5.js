/* Toán ISA — Lớp 5 (SGK Toán 5 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g5-c{chủ đề index}-b{Bài number}. Never rename ids.
 * Decimals are generated from integer mantissas (dec(m, s) = m / 10^s) to avoid float noise.
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
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
  const roundTo = (n, p) => Math.round(n / p) * p;
  function expand(n) { const s = String(n), out = []; for (let k = 0; k < s.length; k++) { const d = Number(s[k]); if (d) out.push(d * Math.pow(10, s.length - 1 - k)); } return out; }
  const PLACES = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn', 'triệu', 'chục triệu', 'trăm triệu'];
  const PVCOLS = ['Trăm triệu', 'Chục triệu', 'Triệu', 'Trăm nghìn', 'Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  const colsFor = n => PVCOLS.slice(9 - String(n).length);

  // Learn cards show their labels (visuals hide most labels by default so questions do not give answers away).
  const LEARN_ON = { blocks: { labels: true }, fraction: { label: true }, decimalGrid: { showLabel: true }, percent: { showLabel: true }, thermometer: { showValue: true }, roman: { showValue: true, showText: true }, average: { showMean: true }, angle: { showDeg: true }, cubes: { showDims: true } };
  function lesson(c, b, title, story, learn, gen) {
    learn.forEach(card => { const v = card.visual; if (v && LEARN_ON[v.type]) v.params = Object.assign({}, LEARN_ON[v.type], v.params); });
    return { id: `g5-c${c}-b${b}`, title, book: `Bài ${b}`, story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
  }
  const fv = (n, d, shape) => vz('fraction', { num: n, den: d, shape: shape || 'bar' });

  // ---------- column calculation (natural numbers and decimals) ----------
  // word templates: [text(a, b), unit of the answer]
  const T_ADD = [
    [(a, b) => `Ngày thứ nhất cửa hàng bán được ${F(a)} kg gạo, ngày thứ hai bán được ${F(b)} kg. Hỏi cả hai ngày bán được bao nhiêu ki-lô-gam gạo?`, 'kg'],
    [(a, b) => `Đoạn đường thứ nhất dài ${F(a)} km, đoạn đường thứ hai dài ${F(b)} km. Cả hai đoạn đường dài bao nhiêu ki-lô-mét?`, 'km'],
  ];
  const T_SUB = [
    [(a, b) => `Một thùng có ${F(a)} l nước mắm, người ta đã lấy ra ${F(b)} l. Hỏi trong thùng còn lại bao nhiêu lít nước mắm?`, 'l'],
    [(a, b) => `Sợi dây dài ${F(a)} m, bạn đã cắt đi ${F(b)} m. Sợi dây còn lại dài bao nhiêu mét?`, 'm'],
  ];
  const T_MUL = [
    [(a, b) => `Mỗi tấm vải dài ${F(a)} m. Hỏi ${F(b)} tấm vải như thế dài bao nhiêu mét?`, 'm'],
    [(a, b) => `Mỗi chuyến xe chở được ${F(a)} kg hàng. Hỏi ${F(b)} chuyến xe như thế chở được bao nhiêu ki-lô-gam hàng?`, 'kg'],
  ];
  const T_DIV = [
    [(a, b) => `Có ${F(a)} l dầu chia đều vào ${F(b)} can. Hỏi mỗi can có bao nhiêu lít dầu?`, 'l'],
    [(a, b) => `Một sợi dây dài ${F(a)} m được cắt thành ${F(b)} đoạn bằng nhau. Mỗi đoạn dài bao nhiêu mét?`, 'm'],
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
    const at = function (rng, L, k) {
      const [a, b] = pickPair(rng, L);
      const r = rd(op === '+' ? a + b : op === M ? a - b : op === '×' ? a * b : a / b);
      const isInt = Number.isInteger(a) && Number.isInteger(b);
      const wrong = isInt ? (op === '+' ? wrongAdd(a, b) : op === M ? wrongSub(a, b) : op === '×' ? wrongMul(a, b) : wrongDiv(r)) : rd(r * 10);
      const expr = `${F(a)} ${op} ${F(b)}`;
      const colOk = op !== ':' || (Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(r));
      const colV = colOk ? vz('columnCalc', { a, b, op, reveal: 'none' }) : null;
      const colH = colOk ? vz('columnCalc', { a, b, op, reveal: 'steps' }) : null;
      const hint = opts.hint || (op === '+' ? 'Đặt tính sao cho các chữ số cùng hàng (và dấu phẩy) thẳng cột, cộng như số tự nhiên rồi đặt dấu phẩy ở tổng thẳng cột với các dấu phẩy.'
        : op === M ? 'Đặt tính cho dấu phẩy thẳng cột (thêm chữ số 0 vào bên phải nếu cần), trừ như số tự nhiên rồi đặt dấu phẩy.'
          : op === '×' ? 'Nhân như nhân số tự nhiên, rồi đếm xem các thừa số có tất cả bao nhiêu chữ số ở phần thập phân để đặt dấu phẩy ở tích.'
            : 'Chia như chia số tự nhiên; khi hết phần nguyên của số bị chia thì viết dấu phẩy vào thương rồi chia tiếp.');
      const u = opts.unit ? ' ' + opts.unit : '';
      if (k === 0) return Q(`Đặt tính rồi tính:\n${expr}`, colV, num(r), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, F(r), [wrong, rd(r / 10), rd(r + 1), rd(r * 100)].filter(x => x > 0).map(x => F(x))), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const T = op === '+' ? T_ADD : op === M ? T_SUB : op === '×' ? T_MUL : T_DIV;
        const [tf, unit] = P(rng, T);
        let p = tf(a, b);
        if (op === '×' && !Number.isInteger(b)) p = `Mỗi mét vải nặng ${F(a)} kg. Hỏi ${F(b)} m vải như thế nặng bao nhiêu ki-lô-gam?`;
        if (op === ':' && !Number.isInteger(b)) p = `Một thanh sắt dài ${F(b)} m nặng ${F(a)} kg. Hỏi 1 m thanh sắt đó nặng bao nhiêu ki-lô-gam?`;
        const unitOut = op === '×' && !Number.isInteger(b) ? 'kg' : op === ':' && !Number.isInteger(b) ? 'kg' : unit;
        return Q(p, null, num(r, unitOut), op === '+' ? 'Tìm cả hai thì cộng.' : op === M ? 'Tìm phần còn lại thì trừ.' : op === '×' ? 'Nhân giá trị một phần với số phần.' : 'Chia đều thì làm phép chia.', `${expr} = ${F(r)} (${unitOut}).`);
      }
      if (k === 3) {
        const c = rd(Math.max(0, r + P(rng, [-1, 0, 1, 0.1, -0.1, 10])));
        return Q(`So sánh: ${expr} … ${F(c)}`, vz('compare', { left: expr, right: F(c) }), cmpAns(r, c), 'Tính kết quả rồi so sánh.', `${expr} = ${F(r)}; ${F(r)} ${sign(r, c)} ${F(c)}.`);
      }
      if (wrong !== r && wrong > 0) {
        const who = nm(rng);
        return Q(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, colV, num(r), isInt ? 'Làm lại từng bước, chú ý phần nhớ.' : 'Kiểm tra lại vị trí dấu phẩy.', `${expr} = ${F(r)}.`, { hintVisual: colH });
      }
      return Q(`Tính: ${expr}`, colV, num(r), hint, `${expr} = ${F(r)}.`);
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
    const L = U.lcm(c, d), A = a * L / c, B = b * L / d, Rn = op === '+' ? A + B : A - B;
    const [sn, sd] = Rn === 0 ? [0, 1] : U.simplify(Rn, L);
    const how = c === d ? `${a}/${c} ${op} ${b}/${d} = (${a} ${op} ${b})/${c} = ${Rn}/${L}` : `${a}/${c} ${op} ${b}/${d} = ${A}/${L} ${op} ${B}/${L} = ${Rn}/${L}`;
    return { a, b, c, d, L, Rn, sn, sd, expr: `${a}/${c} ${op} ${b}/${d}`, how: how + (sn !== Rn && Rn ? ` = ${sn}/${sd}` : '') + '.' };
  }
  const c1 = {
    id: 'g5-c1', semester: 1, title: 'Ôn tập và bổ sung', icon: '🔢', lessons: [
      lesson(1, 1, 'Ôn tập số tự nhiên',
        'Rô-bốt ISA cùng bạn Minh đọc số dân Việt Nam trong cuốn sách Địa lí.',
        [
          { text: 'Số 102 345 678 đọc là "một trăm linh hai triệu ba trăm bốn mươi lăm nghìn sáu trăm bảy mươi tám".', visual: vz('placeValue', { number: 102345678, columns: colsFor(102345678) }) },
          { text: 'Giá trị của chữ số phụ thuộc vào vị trí: chữ số 3 trong 102 345 678 có giá trị 300 000.' },
        ],
        function (rng, i) {
          const n = R(rng, 100000, 999999999), s = String(n), f = i % 5;
          if (f === 0) return Q(`Số "${readVN(n)}" viết là:`, null, num(n), 'Viết theo từng lớp: triệu, nghìn, đơn vị.', `Viết là ${F(n)}.`);
          if (f === 1) { const pos = R(rng, 0, s.length - 1), place = s.length - 1 - pos, v = Number(s[pos]) * Math.pow(10, place); return Q(`Trong số ${F(n)}, chữ số ${s[pos]} ở hàng ${PLACES[place]} có giá trị là bao nhiêu?`, vz('placeValue', { number: n, columns: colsFor(n) }), num(v), 'Giá trị = chữ số × giá trị của hàng.', `Giá trị là ${F(v)}.`); }
          if (f === 2) { const m = Math.floor(n / 1000) * 1000 + R(rng, 0, 999); return Q(`So sánh: ${F(n)} … ${F(m)}`, vz('compare', { left: F(n), right: F(m) }), cmpAns(n, m), 'So sánh từng hàng từ trái sang phải.', `${F(n)} ${sign(n, m)} ${F(m)}.`); }
          if (f === 3) { const [p, nmP] = P(rng, [[1000, 'hàng nghìn'], [100000, 'hàng trăm nghìn'], [1000000, 'hàng triệu']]); return Q(`Làm tròn số ${F(n)} đến ${nmP}.`, null, num(roundTo(n, p)), 'Xét chữ số ngay bên phải hàng làm tròn.', `${F(n)} ≈ ${F(roundTo(n, p))}.`); }
          const e = expand(n);
          return Q(`Viết số ${F(n)} thành tổng theo các hàng:`, null, ch(rng, e.map(F).join(' + '), [e.map((x, j) => F(j === e.length - 1 ? x * 10 : x)).join(' + '), e.map((x, j) => F(j === 0 ? x / 10 : x)).join(' + ')]), 'Mỗi chữ số nhân với giá trị hàng của nó.', `${F(n)} = ${e.map(F).join(' + ')}.`);
        }),
      lesson(1, 2, 'Ôn tập các phép tính với số tự nhiên',
        'Rô-bốt ISA giúp hợp tác xã tính số tấn lúa thu hoạch của cả xã.',
        [
          { text: 'Nhân với số có hai chữ số: 345 × 26 = 8970.', visual: vz('columnCalc', { a: 345, b: 26, op: '×', reveal: 'all' }) },
          { text: 'Chia cho số có hai chữ số: 8970 : 26 = 345.', visual: vz('columnCalc', { a: 8970, b: 26, op: ':', reveal: 'all' }) },
        ],
        (function () {
          const addSub = 'Đặt tính thẳng cột rồi tính từ phải sang trái.';
          const gens = [
            colGen('+', r => pairWhere(r, [10000, 900000], [1000, 99999], () => true, [45672, 28519]), { hint: addSub }),
            colGen(M, r => pairWhere(r, [100000, 999999], [1000, 99999], (a, b) => a > b, [73120, 28519]), { hint: addSub }),
            colGen('×', r => pairWhere(r, [100, 9999], [11, 99], (a, b) => b % 10 !== 0, [345, 26]), { hint: 'Nhân lần lượt từng chữ số của thừa số thứ hai, tích riêng thứ hai viết lùi sang trái một cột.' }),
            colGen(':', r => pairWhere(r, [1000, 99999], [11, 99], (a, b) => a % b === 0, [8970, 26]), { hint: 'Chia từ trái sang phải, ước lượng thương ở mỗi lượt chia.' }),
          ];
          const g = (rng, i) => gens[i % 4](rng, i);
          g.exam = (rng, level) => P(rng, gens).exam(rng, level);
          return g;
        })()),
      lesson(1, 3, 'Ôn tập phân số',
        'Rô-bốt ISA chia những chiếc bánh chưng ngày Tết thành các phần bằng nhau cùng bạn Lan.',
        [
          { text: 'Phân số 3/4: mẫu số 4 cho biết chia thành 4 phần bằng nhau, tử số 3 cho biết lấy 3 phần.', visual: fv(3, 4, 'pie') },
          { text: 'Rút gọn: 6/8 = 3/4. Quy đồng mẫu số để so sánh: 2/3 = 8/12 và 3/4 = 9/12, nên 2/3 < 3/4.', visual: vz('fractionCompare', { a: [2, 3], b: [3, 4] }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const d = R(rng, 2, 10), n = R(rng, 1, d - 1); return Q('Viết phân số chỉ phần đã tô màu.', fv(n, d, P(rng, ['bar', 'pie', 'rect'])), fracA(n, d), 'Mẫu số là số phần bằng nhau; tử số là số phần tô màu.', `${n}/${d}.`); }
          if (f === 1) { const d = R(rng, 2, 9), n = R(rng, 1, d - 1), [sn, sd] = U.simplify(n, d), k = R(rng, 2, 6); return Q(`Rút gọn phân số ${sn * k}/${sd * k} thành phân số tối giản.`, null, fracA(sn, sd, true), `Chia cả tử và mẫu cho ${k}.`, `${sn * k}/${sd * k} = ${sn}/${sd}.`); }
          if (f === 2) { const c = R(rng, 2, 9); let d = R(rng, 2, 9); if (d === c) d = c + 1; const a = R(rng, 1, c - 1), b = R(rng, 1, d - 1); const L = U.lcm(c, d); return Q(`So sánh: ${a}/${c} … ${b}/${d}`, vz('fractionCompare', { a: [a, c], b: [b, d] }), cmpAns(a / c, b / d), 'Quy đồng mẫu số rồi so sánh tử số.', `${a}/${c} = ${a * L / c}/${L}; ${b}/${d} = ${b * L / d}/${L}. Vậy ${a}/${c} ${sign(a / c, b / d)} ${b}/${d}.`); }
          const arr = [], vals = []; while (arr.length < 4) { const d = R(rng, 2, 9), n = R(rng, 1, d - 1); if (!vals.some(v => Math.abs(v - n / d) < EPS)) { arr.push([n, d]); vals.push(n / d); } }
          const big = R(rng, 0, 1), idx = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals));
          return Q(`Phân số ${big ? 'lớn nhất' : 'bé nhất'} trong các phân số ${arr.map(([n, d]) => fs(n, d)).join('; ')} là:`, null, ch(rng, fs(...arr[idx]), arr.map(([n, d]) => fs(n, d))), 'Quy đồng mẫu số hoặc so sánh với 1/2.', `Phân số ${big ? 'lớn nhất' : 'bé nhất'} là ${fs(...arr[idx])}.`);
        }),
      lesson(1, 4, 'Phân số thập phân',
        'Rô-bốt ISA đổi tiền lẻ thành những phần mười, phần trăm của một nghìn đồng.',
        [
          { text: 'Các phân số có mẫu số là 10, 100, 1000, … gọi là phân số thập phân: 3/10, 47/100, 9/1000.', visual: vz('decimalGrid', { value: 0.47 }) },
          { text: 'Một số phân số viết được thành phân số thập phân: 3/5 = (3 × 2)/(5 × 2) = 6/10; 7/25 = 28/100.' },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const good = P(rng, [[R(rng, 1, 9), 10], [R(rng, 1, 99), 100], [R(rng, 1, 999), 1000]]); const bad = [[R(rng, 1, 9), 3], [R(rng, 1, 9), 20], [R(rng, 1, 9), 50], [R(rng, 1, 9), 11]]; return Q('Phân số nào là phân số thập phân?', null, ch(rng, fs(...good), U.sample(rng, bad, 3).map(x => fs(...x))), 'Phân số thập phân có mẫu số là 10, 100, 1000, …', `${fs(...good)} có mẫu số ${good[1]}.`); }
          const [d, to] = P(rng, [[2, 10], [5, 10], [4, 100], [20, 100], [25, 100], [50, 100], [8, 1000], [125, 1000], [250, 1000]]);
          let n = R(rng, 1, d - 1); const k = to / d;
          if (f === 1) return Q(`Viết phân số ${n}/${d} thành phân số thập phân:\n${n}/${d} = ?/${to}`, null, num(n * k), `Nhân cả tử và mẫu với ${k}.`, `${n}/${d} = (${n} × ${k})/(${d} × ${k}) = ${n * k}/${to}.`);
          const m = R(rng, 1, 9) * k; const [sn, sd] = U.simplify(m, to);
          return Q(`Viết phân số ${m}/${to} dưới dạng phân số tối giản.`, null, fracA(sn, sd, true), `Chia cả tử và mẫu cho ${U.gcd(m, to)}.`, `${m}/${to} = ${sn}/${sd}.`);
        }),
      lesson(1, 5, 'Ôn tập các phép tính với phân số',
        'Rô-bốt ISA tính phần đường mà đội công nhân đã sửa trong hai ngày.',
        [
          { text: 'Cộng, trừ phân số cùng mẫu số: cộng, trừ tử số, giữ nguyên mẫu số. 2/9 + 5/9 = 7/9.' },
          { text: 'Nhân: tử nhân tử, mẫu nhân mẫu. Chia: nhân với phân số đảo ngược. 2/3 : 4/5 = 2/3 × 5/4 = 10/12 = 5/6.' },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0 || f === 1) { const r = addSubFrac(rng, f === 0 ? '+' : M, false); return Q(`Tính:\n${r.expr}`, vz('fractionCompare', { a: [r.a, r.c], b: [r.b, r.d] }), fracA(r.sn, r.sd), 'Cùng mẫu số: cộng (trừ) tử số, giữ nguyên mẫu số.', r.how); }
          const b = R(rng, 2, 9), a = R(rng, 1, b - 1), d = R(rng, 2, 9), c = R(rng, 1, d - 1);
          if (f === 2) { const [sn, sd] = U.simplify(a * c, b * d); return Q(`Tính:\n${a}/${b} × ${c}/${d}`, null, fracA(sn, sd), 'Tử nhân tử, mẫu nhân mẫu.', `${a}/${b} × ${c}/${d} = ${a * c}/${b * d}${sn !== a * c ? ` = ${sn}/${sd}` : ''}.`); }
          const [sn, sd] = U.simplify(a * d, b * c);
          return Q(`Tính:\n${a}/${b} : ${c}/${d}`, null, fracA(sn, sd), 'Nhân với phân số đảo ngược của phân số thứ hai.', `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c} = ${a * d}/${b * c}${sn !== a * d ? ` = ${sn}/${sd}` : ''}.`);
        }),
      lesson(1, 6, 'Cộng, trừ hai phân số khác mẫu số',
        'Rô-bốt ISA cùng bạn Hà tính phần vườn đã trồng rau và trồng hoa.',
        [
          { text: 'Muốn cộng (trừ) hai phân số khác mẫu số, ta quy đồng mẫu số rồi cộng (trừ) hai phân số đã quy đồng. 1/2 + 1/3 = 3/6 + 2/6 = 5/6.', visual: vz('fractionCompare', { a: [1, 2], b: [1, 3] }) },
        ],
        function (rng, i) {
          const op = i % 2 === 0 ? '+' : M, r = addSubFrac(rng, op, true), f = i % 4;
          if (r.Rn === 0) return Q(`Tính:\n${r.expr}`, null, num(0), 'Hai phân số bằng nhau thì hiệu bằng 0.', `${r.expr} = 0.`);
          if (f === 2 || f === 3) {
            const who = nm(rng);
            const p = op === '+' ? `Vườn nhà ${who}: ${r.a}/${r.c} diện tích trồng rau, ${r.b}/${r.d} diện tích trồng hoa. Hỏi rau và hoa chiếm bao nhiêu phần diện tích vườn?` : `${who} có ${r.a}/${r.c} lít sữa, ${who} đã uống ${r.b}/${r.d} lít. Hỏi còn lại bao nhiêu lít sữa?`;
            return Q(p, vz('fractionCompare', { a: [r.a, r.c], b: [r.b, r.d] }), fracA(r.sn, r.sd), `Quy đồng mẫu số (mẫu số chung ${r.L}).`, r.how);
          }
          return Q(`Tính:\n${r.expr}`, vz('fractionCompare', { a: [r.a, r.c], b: [r.b, r.d] }), fracA(r.sn, r.sd), `Quy đồng mẫu số, mẫu số chung là ${r.L}.`, r.how);
        }),
      lesson(1, 7, 'Hỗn số',
        'Rô-bốt ISA đếm những chiếc bánh pizza: hai cái nguyên và ba phần tư cái nữa.',
        [
          { text: 'Có 2 cái bánh và 3/4 cái bánh: viết gọn là 2 3/4 (hai và ba phần tư). 2 là phần nguyên, 3/4 là phần phân số.', visual: fv(3, 4, 'pie') },
          { text: 'Chuyển hỗn số thành phân số: 2 3/4 = (2 × 4 + 3)/4 = 11/4.' },
        ],
        function (rng, i) {
          const d = R(rng, 2, 9), n = R(rng, 1, d - 1), w = R(rng, 1, lv(i) === 0 ? 3 : 9), N = w * d + n, f = i % 4;
          if (f === 0) return Q(`Chuyển hỗn số ${w} ${n}/${d} thành phân số.`, fv(n, d, 'pie'), fracA(N, d), 'Tử số = phần nguyên × mẫu số + tử số của phần phân số; mẫu số giữ nguyên.', `${w} ${n}/${d} = (${w} × ${d} + ${n})/${d} = ${N}/${d}.`);
          if (f === 1) return Q(`Viết phân số ${N}/${d} thành hỗn số:`, null, ch(rng, mixed(N, d), [`${w + 1} ${n}/${d}`, `${w} ${d}/${n}`, `${n} ${w}/${d}`, `${w} ${n + 1 < d ? n + 1 : n - 1 || 1}/${d}`].filter(x => x !== mixed(N, d))), `Lấy ${N} : ${d} được thương là phần nguyên, số dư là tử số.`, `${N} : ${d} = ${w} (dư ${n}), nên ${N}/${d} = ${w} ${n}/${d}.`);
          if (f === 2) return Q(`Hỗn số ${w} ${n}/${d} có phần nguyên là bao nhiêu?`, fv(n, d, 'pie'), num(w), 'Phần nguyên viết trước, phần phân số viết sau.', `Phần nguyên là ${w}, phần phân số là ${n}/${d}.`);
          const d2 = d, n2 = R(rng, 1, d - 1), w2 = R(rng, 1, 9);
          return Q(`So sánh: ${w} ${n}/${d} … ${w2} ${n2}/${d2}`, null, cmpAns(w + n / d, w2 + n2 / d2), 'So sánh phần nguyên trước; bằng nhau thì so sánh phần phân số.', `${w} ${n}/${d} ${sign(w + n / d, w2 + n2 / d2)} ${w2} ${n2}/${d2}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 2. SỐ THẬP PHÂN ============
  const c2 = {
    id: 'g5-c2', semester: 1, title: 'Số thập phân', icon: '🔟', lessons: [
      lesson(2, 10, 'Khái niệm số thập phân',
        'Rô-bốt ISA đo chiều cao của bạn Nam bằng thước mét: 1 m và 35 cm, tức là 1,35 m.',
        [
          { text: '1/10 = 0,1; 1/100 = 0,01; 1/1000 = 0,001. Tô 37 ô trong 100 ô là 37/100 = 0,37.', visual: vz('decimalGrid', { value: 0.37 }) },
          { text: 'Số 3,25 có phần nguyên là 3 và phần thập phân là 25; đọc là "ba phẩy hai mươi lăm".', visual: vz('placeValue', { number: 3.25, columns: ['Đơn vị', 'Phần mười', 'Phần trăm'] }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) { const h = R(rng, 1, 99); return Q('Phần đã tô màu của hình vuông được viết thành số thập phân nào?', vz('decimalGrid', { value: dec(h, 2) }), num(dec(h, 2)), 'Hình vuông có 100 ô; đếm số ô tô màu rồi viết thành phần trăm.', `${h}/100 = ${F(dec(h, 2))}.`); }
          if (f === 1) { const h = R(rng, 1, 99); return Q(`Em hãy tô màu ${F(dec(h, 2))} hình vuông (chạm vào các ô).`, vz('decimalGrid', { value: 0 }), { kind: 'visual', check: v => v === h }, `${F(dec(h, 2))} = ${h}/100: tô ${h} ô.`, `${F(dec(h, 2))} = ${h}/100.`); }
          if (f === 2) { const [m, s] = P(rng, [[R(rng, 1, 9), 1], [R(rng, 1, 99), 2], [R(rng, 1, 999), 3]]); const den = Math.pow(10, s); return Q(`Viết phân số thập phân ${m}/${den} thành số thập phân.`, s === 2 ? vz('decimalGrid', { value: dec(m, 2) }) : null, num(dec(m, s)), `Mẫu số ${den} có ${s} chữ số 0 thì phần thập phân có ${s} chữ số.`, `${m}/${den} = ${F(dec(m, s))}.`); }
          if (f === 3) { let m4 = R(rng, 101, 99999); if (m4 % 10 === 0) m4++; const x = dec(m4, R(rng, 1, 3)); return Q(`Số ${F(x)} đọc là:`, null, ch(rng, readDec(x), [readDec(rd(x * 10)), readDec(rd(x + 1)), readDec(rd(x / 10))]), 'Đọc phần nguyên, đọc "phẩy", rồi đọc phần thập phân.', `${F(x)} đọc là "${readDec(x)}".`); }
          let m5 = R(rng, 1001, 99999); if (m5 % 10 === 0) m5++; const x = dec(m5, R(rng, 1, 3)), ip = Math.floor(x), t = R(rng, 0, 1);
          const dp = F(x).split(',')[1];
          return Q(`Số ${F(x)} có ${t ? 'phần nguyên' : 'phần thập phân'} là:`, null, ch(rng, t ? String(ip) : dp, t ? [dp, String(ip + 1), F(x)] : [String(ip), dp + '0', dp.slice(0, -1) || '0']), 'Phần nguyên ở bên trái dấu phẩy, phần thập phân ở bên phải.', `${F(x)}: phần nguyên ${ip}, phần thập phân ${dp}.`);
        }),
      lesson(2, 11, 'So sánh các số thập phân',
        'Rô-bốt ISA so sánh chiều cao của các bạn trong đội bóng rổ của lớp.',
        [
          { text: 'So sánh phần nguyên trước: 4,5 > 3,98 vì 4 > 3.', visual: vz('compare', { left: '4,5', right: '3,98' }) },
          { text: 'Phần nguyên bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm, …: 2,47 < 2,5 vì 4 < 5 (hàng phần mười). Thêm chữ số 0 vào bên phải phần thập phân thì giá trị không đổi: 2,5 = 2,50.' },
        ],
        function (rng, i) {
          const f = i % 3, L = lv(i);
          if (f === 0) {
            const ip = R(rng, 0, 20), s1 = R(rng, 1, 3), s2 = R(rng, 1, 3);
            const a = rd(ip + dec(R(rng, 1, Math.pow(10, s1) - 1), s1));
            let b = L === 0 ? rd(R(rng, 0, 20) + dec(R(rng, 1, 9), 1)) : rd(ip + dec(R(rng, 1, Math.pow(10, s2) - 1), s2));
            if (R(rng, 0, 6) === 0) b = a;
            const left = F(a), right = R(rng, 0, 1) && b === a && s1 < 3 ? F(a) + '0' : F(b);
            return Q(`So sánh: ${left} … ${right}`, vz('compare', { left, right }), cmpAns(a, b), 'So sánh phần nguyên, rồi lần lượt từng hàng của phần thập phân.', `${left} ${sign(a, b)} ${right}.`);
          }
          const ip = R(rng, 0, 9), arr = [];
          while (arr.length < 4) { const s = R(rng, 1, 3), x = rd(ip + R(rng, 0, 1) + dec(R(rng, 1, Math.pow(10, s) - 1), s)); if (!arr.includes(x)) arr.push(x); }
          const asc = arr.slice().sort((x, y) => x - y), S = a => a.map(F).join('; ');
          if (f === 1) { const big = R(rng, 0, 1), v = big ? asc[3] : asc[0]; return Q(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${S(arr)} là:`, null, ch(rng, F(v), arr.map(F)), 'So sánh phần nguyên trước, rồi phần mười, phần trăm…', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${F(v)}.`); }
          return Q(`Sắp xếp các số ${S(arr)} theo thứ tự từ bé đến lớn:`, null, ch(rng, S(asc), [S(asc.slice().reverse()), S(arr), S([asc[1], asc[0], asc[2], asc[3]])]), 'Tìm số bé nhất trước.', `${S(asc)}.`);
        }),
      lesson(2, 12, 'Viết số đo đại lượng dưới dạng số thập phân',
        'Rô-bốt ISA giúp bạn Phúc ghi cân nặng các bao hàng bằng số thập phân.',
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
          else if (t === 3) { const a = R(rng, 1, 9), b = R(rng, 1, 999); p = `${a} tấn ${b} kg = ? tấn`; v = rd(a + dec(b, 3)); u = 'tấn'; }
          else if (t === 4) { const a = R(rng, 1, 99); p = `${a} cm = ? m`; v = dec(a, 2); u = 'm'; }
          else { const a = R(rng, 1, 9), b = R(rng, 1, 9); p = `${a} dm ${b} cm = ? dm`; v = rd(a + dec(b, 1)); u = 'dm'; }
          if (i % 3 === 2) return Q(p.replace('= ?', '= …') + '\nChọn số thích hợp:', null, ch(rng, F(v), [rd(v * 10), rd(v / 10), rd(v + 1)].map(x => F(x))), 'Viết phần lẻ thành phân số thập phân rồi chuyển thành số thập phân.', `${p.replace('?', F(v))}.`);
          return Q(p, null, num(v, u), 'Đổi đơn vị nhỏ ra phân số thập phân của đơn vị lớn (1 cm = 1/100 m, 1 g = 1/1000 kg, …).', `${p.replace('?', F(v))}.`);
        }),
      lesson(2, 13, 'Làm tròn số thập phân',
        'Rô-bốt ISA làm tròn số tiền để ước lượng nhanh khi đi siêu thị cùng mẹ bạn Vy.',
        [
          { text: 'Làm tròn 3,47 đến hàng phần mười: chữ số hàng phần trăm là 7 (≥ 5) nên làm tròn lên: 3,5.', visual: vz('numberLine', { min: 3.4, max: 3.5, step: 0.01, labelEvery: 10, point: 3.47 }) },
          { text: 'Làm tròn 12,34 đến số tự nhiên gần nhất: chữ số hàng phần mười là 3 (< 5) nên được 12.' },
        ],
        function (rng, i) {
          const s = 3, m = R(rng, 1001, 99999), x = dec(m, s);
          const [k, name] = P(rng, lv(i) === 0 ? [[0, 'số tự nhiên gần nhất']] : [[0, 'số tự nhiên gần nhất'], [1, 'hàng phần mười'], [2, 'hàng phần trăm']]);
          const p = Math.pow(10, s - k), r = dec(Math.round(m / p) * p, s);
          if (i % 2 === 0) return Q(`Làm tròn số ${F(x)} đến ${name}.`, null, num(r), 'Xét chữ số ngay bên phải hàng cần làm tròn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.', `${F(x)} ≈ ${F(r)}.`);
          const lo = dec(Math.floor(m / p) * p, s), hi = rd(lo + Math.pow(10, -k));
          return Q(`Làm tròn số ${F(x)} đến ${name} ta được:`, null, ch(rng, F(r), [r === lo ? hi : lo, rd(x), dec(Math.floor(m / (p * 10)) * p * 10, s)].map(y => F(y))), 'Xét chữ số ngay bên phải hàng làm tròn.', `${F(x)} ≈ ${F(r)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. MỘT SỐ ĐƠN VỊ ĐO DIỆN TÍCH ============
  const AU = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'];
  const c3 = {
    id: 'g5-c3', semester: 1, title: 'Một số đơn vị đo diện tích', icon: '🗺️', lessons: [
      lesson(3, 15, 'Ki-lô-mét vuông. Héc-ta',
        'Rô-bốt ISA cùng bạn Quân tìm hiểu diện tích Vịnh Hạ Long trên bản đồ.',
        [
          { text: 'Ki-lô-mét vuông (km²) là diện tích hình vuông cạnh 1 km. 1 km² = 1 000 000 m².' },
          { text: 'Héc-ta (ha) là diện tích hình vuông cạnh 100 m. 1 ha = 10 000 m²; 1 km² = 100 ha.', visual: vz('shape', { kind: 'square', dims: { a: 100 }, showDims: true, label: '1 ha' }) },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), f = i % 4;
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} km² = ? ha`, a * 100, 'ha'], [`${a} ha = ? m²`, a * 10000, 'm²'], [`${a * 100} ha = ? km²`, a, 'km²'], [`${a} km² = ? m²`, a * 1000000, 'm²']]); return Q(p, null, num(v, u), '1 km² = 100 ha; 1 ha = 10 000 m².', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const h = R(rng, 1, 9); return Q(`${h * 1000} m² = ? ha`, null, num(dec(h, 1), 'ha'), '1 ha = 10 000 m².', `${F(h * 1000)} m² = ${F(dec(h, 1))} ha.`); }
          if (f === 2) { const [p, u] = P(rng, [['Diện tích nước Việt Nam khoảng 331 000 …', 'km²'], ['Diện tích một khu vườn trường khoảng 2 …', 'ha'], ['Diện tích một phòng học khoảng 48 …', 'm²'], ['Diện tích Hồ Gươm khoảng 12 …', 'ha']]); return Q(`Chọn đơn vị thích hợp:\n${p}`, null, ch(rng, u, ['km²', 'ha', 'm²', 'cm²'].filter(x => x !== u)), 'Hình dung độ lớn thật của diện tích.', `${p.replace('…', u)}.`); }
          const w = R(rng, 2, 5) * 100, hgt = R(rng, 1, 4) * 100;
          return Q(`Một khu rừng hình chữ nhật dài ${w} m, rộng ${hgt} m. Diện tích khu rừng là bao nhiêu héc-ta?`, vz('shape', { kind: 'rect', dims: { a: w, b: hgt }, showDims: true }), num(w * hgt / 10000, 'ha'), 'Tính diện tích theo m² rồi đổi ra ha (1 ha = 10 000 m²).', `${w} × ${hgt} = ${F(w * hgt)} (m²) = ${F(w * hgt / 10000)} ha.`);
        }),
      lesson(3, 16, 'Các đơn vị đo diện tích',
        'Rô-bốt ISA xếp các đơn vị đo diện tích thành bậc thang, mỗi bậc gấp 100 lần.',
        [
          { text: 'km² – hm² (ha) – dam² – m² – dm² – cm² – mm². Hai đơn vị liền nhau gấp (kém) nhau 100 lần.' },
          { text: 'Ví dụ: 3 m² 5 dm² = 305 dm²; 350 dm² = 3,5 m².' },
        ],
        function (rng, i) {
          const j = R(rng, 1, 6), a = R(rng, 2, 99), f = i % 3;
          if (f === 0) return Q(`${a} ${AU[j - 1]} = ? ${AU[j]}`, null, num(a * 100, AU[j]), 'Đổi sang đơn vị bé liền kề: nhân với 100.', `${a} ${AU[j - 1]} = ${F(a * 100)} ${AU[j]}.`);
          if (f === 1) { const m = R(rng, 101, 9999); return Q(`${F(m)} ${AU[j]} = ? ${AU[j - 1]}`, null, num(dec(m, 2), AU[j - 1]), 'Đổi sang đơn vị lớn liền kề: chia cho 100.', `${F(m)} ${AU[j]} = ${F(dec(m, 2))} ${AU[j - 1]}.`); }
          const b = R(rng, 1, 99);
          return Q(`${a} ${AU[j - 1]} ${b} ${AU[j]} = ? ${AU[j]}`, null, num(a * 100 + b, AU[j]), `1 ${AU[j - 1]} = 100 ${AU[j]}.`, `${a} ${AU[j - 1]} ${b} ${AU[j]} = ${a * 100} + ${b} = ${F(a * 100 + b)} ${AU[j]}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. CÁC PHÉP TÍNH VỚI SỐ THẬP PHÂN ============
  const rDec = (rng, lo, hi, s) => dec(R(rng, lo, hi), s);
  const c4 = {
    id: 'g5-c4', semester: 1, title: 'Các phép tính với số thập phân', icon: '🧮', lessons: [
      lesson(4, 19, 'Phép cộng số thập phân',
        'Rô-bốt ISA cộng cân nặng hai giỏ cam bạn Ngọc hái trong vườn.',
        [{ text: '3,45 + 12,7: đặt dấu phẩy thẳng cột, cộng như số tự nhiên, rồi đặt dấu phẩy ở tổng: 16,15.', visual: vz('columnCalc', { a: 3.45, b: 12.7, op: '+', reveal: 'all' }) }],
        colGen('+', (r, L) => [rDec(r, 11, L === 0 ? 999 : 99999, 1 + (L > 0 ? R(r, 0, 1) : 0)), rDec(r, 11, 9999, R(r, 1, 2))], { unit: 'kg' })),
      lesson(4, 20, 'Phép trừ số thập phân',
        'Rô-bốt ISA tính phần nước còn lại trong bể sau khi tưới rau cùng bạn Dũng.',
        [{ text: '15,4 − 3,75: viết 15,4 thành 15,40 rồi trừ như số tự nhiên: 11,65.', visual: vz('columnCalc', { a: 15.4, b: 3.75, op: M, reveal: 'all' }) }],
        colGen(M, (r, L) => { const a = rDec(r, 1001, L === 0 ? 9999 : 99999, 2), b = rDec(r, 11, Math.floor(a * 10) - 1, R(r, 1, 2) === 1 ? 1 : 2); return [a, b < a ? b : rd(a / 2)]; }, { unit: 'l' })),
      lesson(4, 21, 'Phép nhân số thập phân',
        'Rô-bốt ISA tính tiền mua vải may áo dài cho cô giáo dịp 20 tháng 11.',
        [
          { text: '2,35 × 4: nhân như 235 × 4 = 940, phần thập phân của 2,35 có 2 chữ số nên tích là 9,40 = 9,4.', visual: vz('columnCalc', { a: 2.35, b: 4, op: '×', reveal: 'all' }) },
          { text: '1,2 × 0,5: 12 × 5 = 60; hai thừa số có tất cả 2 chữ số ở phần thập phân, nên tích là 0,60 = 0,6.' },
        ],
        colGen('×', (r, L) => L === 0 ? [rDec(r, 11, 999, R(r, 1, 2)), R(r, 2, 9)] : L === 1 ? [rDec(r, 11, 999, R(r, 1, 2)), R(r, 11, 49)] : [rDec(r, 11, 99, 1), rDec(r, 2, 99, 1)], { unit: 'l' })),
      lesson(4, 22, 'Phép chia số thập phân',
        'Rô-bốt ISA chia đều dầu ăn vào các chai nhỏ để tặng các gia đình khó khăn.',
        [
          { text: 'Chia số thập phân cho số tự nhiên: 8,4 : 4 = 2,1 (chia như số tự nhiên, đánh dấu phẩy ở thương khi chia xong phần nguyên).', visual: vz('columnCalc', { a: 8.4, b: 4, op: ':', reveal: 'all' }) },
          { text: 'Chia cho số thập phân: 2,52 : 1,2 — chuyển dấu phẩy của cả hai số sang phải một chữ số: 25,2 : 12 = 2,1.' },
        ],
        colGen(':', (r, L) => {
          if (L === 0) { const b = R(r, 2, 9), q = rDec(r, 11, 999, R(r, 1, 2)); return [rd(q * b), b]; }
          if (L === 1) { const b = P(r, [2, 4, 5, 8, 20, 25]), a = R(r, 1, 99); return a % b === 0 ? [a + 1, b] : [a, b]; }
          const b = rDec(r, 2, 99, 1), q = rDec(r, 11, 99, 1); return [rd(q * b), b];
        }, { unit: 'l' })),
      lesson(4, 23, 'Nhân, chia số thập phân với 10; 100; 1000; ... hoặc với 0,1; 0,01; 0,001; ...',
        'Rô-bốt ISA đổi đơn vị đo thật nhanh bằng cách dời dấu phẩy.',
        [
          { text: 'Nhân với 10; 100; 1000: chuyển dấu phẩy sang phải 1, 2, 3 chữ số. 3,456 × 100 = 345,6.' },
          { text: 'Chia cho 10; 100; 1000 (hoặc nhân với 0,1; 0,01; 0,001): chuyển dấu phẩy sang trái 1, 2, 3 chữ số. 34,5 : 100 = 0,345; 34,5 × 0,1 = 3,45.' },
        ],
        function (rng, i) {
          const x = rDec(rng, 11, 99999, R(rng, 1, 3)), k = R(rng, 1, 3), p = Math.pow(10, k), t = R(rng, 0, 3);
          const [opS, val, mv] = [[`× ${F(p)}`, rd(x * p), `sang phải ${k}`], [`: ${F(p)}`, rd(x / p), `sang trái ${k}`], [`× ${F(dec(1, k))}`, rd(x / p), `sang trái ${k}`], [`: ${F(dec(1, k))}`, rd(x * p), `sang phải ${k}`]][t];
          if (i % 3 === 2) return Q(`${F(x)} ${opS} = ?`, null, ch(rng, F(val), [rd(val * 10), rd(val / 10), t % 3 === 0 ? rd(x / p) : rd(x * p)].map(y => F(y))), `Chuyển dấu phẩy ${mv} chữ số.`, `${F(x)} ${opS} = ${F(val)}.`);
          return Q(`Tính nhẩm:\n${F(x)} ${opS}`, null, num(val), `Chuyển dấu phẩy ${mv} chữ số (thêm chữ số 0 nếu thiếu).`, `${F(x)} ${opS} = ${F(val)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 5. MỘT SỐ HÌNH PHẲNG ============
  const c5 = {
    id: 'g5-c5', semester: 1, title: 'Một số hình phẳng', icon: '📐', lessons: [
      lesson(5, 25, 'Hình tam giác. Diện tích hình tam giác',
        'Rô-bốt ISA tính diện tích lá cờ đuôi nheo hình tam giác cho hội thi của trường.',
        [
          { text: 'Diện tích hình tam giác bằng độ dài đáy nhân với chiều cao (cùng đơn vị đo) rồi chia cho 2: S = a × h : 2.', visual: vz('shape', { kind: 'triangle', dims: { a: 8, h: 5 }, showDims: true, showHeight: true }) },
          { text: 'Tam giác có ba góc nhọn là tam giác nhọn; có một góc vuông là tam giác vuông; có một góc tù là tam giác tù.' },
        ],
        function (rng, i) {
          const a = R(rng, 3, lv(i) === 0 ? 12 : 40), h = R(rng, 2, lv(i) === 0 ? 10 : 30), S = rd(a * h / 2), f = i % 4;
          if (f === 0 || f === 1) return Q(`Tính diện tích hình tam giác có độ dài đáy ${a} cm và chiều cao ${h} cm.`, vz('shape', { kind: 'triangle', dims: { a, h }, showDims: true, showHeight: true }), num(S, 'cm²'), 'S = đáy × chiều cao : 2.', `${a} × ${h} : 2 = ${F(S)} (cm²).`);
          if (f === 2) { const a2 = R(rng, 2, 20), h2 = R(rng, 1, 9), a3 = rd(a2 + 0.5); return Q(`Hình tam giác có đáy ${F(a3)} m, chiều cao ${h2} m. Tính diện tích.`, vz('shape', { kind: 'triangle', dims: { a: a3, h: h2 }, showDims: true, showHeight: true }), num(rd(a3 * h2 / 2), 'm²'), 'S = đáy × chiều cao : 2.', `${F(a3)} × ${h2} : 2 = ${F(rd(a3 * h2 / 2))} (m²).`); }
          const [p, c] = P(rng, [['Hình tam giác có một góc vuông gọi là hình tam giác …', 'vuông'], ['Hình tam giác có một góc tù gọi là hình tam giác …', 'tù'], ['Hình tam giác có ba góc nhọn gọi là hình tam giác …', 'nhọn']]);
          return Q(p, null, ch(rng, c, ['vuông', 'tù', 'nhọn', 'đều'].filter(x => x !== c)), 'Dựa vào góc lớn nhất của tam giác.', `${p.replace('…', c)}.`);
        }),
      lesson(5, 26, 'Hình thang. Diện tích hình thang',
        'Rô-bốt ISA đo thửa ruộng hình thang của bác nông dân bạn Thảo.',
        [
          { text: 'Hình thang có một cặp cạnh đối diện song song (hai đáy). Diện tích hình thang bằng tổng độ dài hai đáy nhân với chiều cao rồi chia cho 2: S = (a + b) × h : 2.', visual: vz('shape', { kind: 'trapezoid', dims: { a: 9, b: 5, h: 4 }, showDims: true, showHeight: true }) },
          { text: 'Hình thang có một cạnh bên vuông góc với hai đáy gọi là hình thang vuông.' },
        ],
        function (rng, i) {
          const b = R(rng, 2, lv(i) === 0 ? 10 : 40), a = b + R(rng, 1, 15), h = R(rng, 2, lv(i) === 0 ? 10 : 30), S = rd((a + b) * h / 2), f = i % 3;
          if (f === 0) return Q(`Tính diện tích hình thang có đáy lớn ${a} cm, đáy bé ${b} cm, chiều cao ${h} cm.`, vz('shape', { kind: 'trapezoid', dims: { a, b, h }, showDims: true, showHeight: true }), num(S, 'cm²'), 'S = (đáy lớn + đáy bé) × chiều cao : 2.', `(${a} + ${b}) × ${h} : 2 = ${F(S)} (cm²).`);
          if (f === 1) { const A = a * 10, B = b * 10, H = h * 5; const SS = (A + B) * H / 2; return Q(`Một thửa ruộng hình thang có đáy lớn ${A} m, đáy bé ${B} m, chiều cao ${H} m. Tính diện tích thửa ruộng.`, vz('shape', { kind: 'trapezoid', dims: { a: A, b: B, h: H }, showDims: true, showHeight: true }), num(SS, 'm²'), 'S = (a + b) × h : 2.', `(${A} + ${B}) × ${H} : 2 = ${F(SS)} (m²).`); }
          return Q('Hình thang có mấy cặp cạnh đối diện song song?', vz('shape', { kind: 'trapezoid' }), num(1), 'Hai đáy của hình thang song song với nhau.', 'Hình thang có 1 cặp cạnh đối diện song song (hai đáy).');
        }),
      lesson(5, 27, 'Đường tròn. Chu vi và diện tích hình tròn',
        'Rô-bốt ISA đo chiếc mâm tròn ngày Tết để may khăn trải bàn cùng bạn An.',
        [
          { text: 'Chu vi hình tròn: C = d × 3,14 hoặc C = r × 2 × 3,14.', visual: vz('shape', { kind: 'circle', dims: { r: 5 }, showDims: true }) },
          { text: 'Diện tích hình tròn: S = r × r × 3,14. Bán kính 5 cm: S = 5 × 5 × 3,14 = 78,5 (cm²).' },
        ],
        function (rng, i) {
          const r = R(rng, 1, lv(i) === 0 ? 10 : 30), f = i % 4;
          const C = rd(r * 628 / 100), S = rd(r * r * 314 / 100);
          if (f === 0) return Q(`Tính chu vi hình tròn có bán kính ${r} cm.`, vz('shape', { kind: 'circle', dims: { r }, showDims: true }), num(C, 'cm'), 'C = r × 2 × 3,14.', `${r} × 2 × 3,14 = ${F(C)} (cm).`);
          if (f === 1) return Q(`Tính diện tích hình tròn có bán kính ${r} cm.`, vz('shape', { kind: 'circle', dims: { r }, showDims: true }), num(S, 'cm²'), 'S = r × r × 3,14.', `${r} × ${r} × 3,14 = ${F(S)} (cm²).`);
          if (f === 2) { const d = r * 2; return Q(`Tính chu vi hình tròn có đường kính ${d} dm.`, vz('shape', { kind: 'circle', dims: { r } }), num(rd(d * 314 / 100), 'dm'), 'C = d × 3,14.', `${d} × 3,14 = ${F(rd(d * 314 / 100))} (dm).`); }
          const d = r * 2;
          return Q(`Một bánh xe có đường kính ${d} cm. Tính diện tích mặt bánh xe (hình tròn).`, vz('shape', { kind: 'circle', dims: { r } }), num(S, 'cm²'), 'Tìm bán kính trước: r = d : 2.', `r = ${d} : 2 = ${r} (cm); S = ${r} × ${r} × 3,14 = ${F(S)} (cm²).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 7. TỈ SỐ VÀ CÁC BÀI TOÁN LIÊN QUAN ============
  const c7 = {
    id: 'g5-c7', semester: 2, title: 'Tỉ số và các bài toán liên quan', icon: '➗', lessons: [
      lesson(7, 36, 'Tỉ số. Tỉ số phần trăm',
        'Rô-bốt ISA cùng lớp 5A đếm số bạn nam và bạn nữ để chia đội văn nghệ.',
        [
          { text: 'Lớp có 12 bạn nam và 15 bạn nữ. Tỉ số của số bạn nam và số bạn nữ là 12 : 15 hay 12/15 = 4/5.' },
          { text: 'Tỉ số phần trăm: 25/100 viết là 25%. Hình vuông 100 ô tô màu 25 ô là 25%.', visual: vz('percent', { percent: 25 }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 2, 20), b = R(rng, 2, 20); const [sn, sd] = U.simplify(a, b); return Q(`Tỉ số của ${a} và ${b} viết dưới dạng phân số là:`, null, fracA(a, b), `Tỉ số của a và b là a : b hay a/b.`, `${a} : ${b} = ${a}/${b}${sn !== a ? ` = ${sn}/${sd}` : ''}.`); }
          if (f === 1) { const p = R(rng, 1, 99); return Q('Phần tô màu chiếm bao nhiêu phần trăm hình vuông?', vz('percent', { percent: p }), num(p, '%'), 'Hình vuông có 100 ô; tô bao nhiêu ô là bấy nhiêu phần trăm.', `${p}/100 = ${p}%.`); }
          if (f === 2) { const [n, d] = P(rng, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 10], [7, 20], [9, 25], [1, 10], [3, 50]]); return Q(`Viết phân số ${n}/${d} dưới dạng tỉ số phần trăm.`, vz('percent', { percent: n * 100 / d }), num(n * 100 / d, '%'), `Viết thành phân số có mẫu số 100.`, `${n}/${d} = ${n * 100 / d}/100 = ${n * 100 / d}%.`); }
          const boys = R(rng, 10, 20), girls = R(rng, 10, 20), [sn, sd] = U.simplify(girls, boys);
          return Q(`Lớp 5B có ${boys} bạn nam và ${girls} bạn nữ. Tỉ số của số bạn nữ và số bạn nam là:`, null, fracA(girls, boys), 'Số bạn nữ viết trước (tử số), số bạn nam viết sau (mẫu số).', `${girls} : ${boys} = ${girls}/${boys}${sn !== girls ? ` = ${sn}/${sd}` : ''}.`);
        }),
      lesson(7, 37, 'Tỉ lệ bản đồ và ứng dụng',
        'Rô-bốt ISA đo trên bản đồ để tính quãng đường thật từ nhà bạn Hùng đến trường.',
        [
          { text: 'Tỉ lệ bản đồ 1 : 1000 nghĩa là 1 cm trên bản đồ ứng với 1000 cm (= 10 m) trên thực tế.', visual: vz('mapScale', { scale: 1000, mapCm: 5 }) },
          { text: 'Độ dài thật = độ dài trên bản đồ × số lần (mẫu số của tỉ lệ). 5 cm × 1000 = 5000 cm = 50 m.' },
        ],
        function (rng, i) {
          const sc = P(rng, lv(i) === 0 ? [100, 500, 1000, 2000] : [1000, 5000, 10000, 100000, 500000, 1000000]), cm = R(rng, 2, 15), real = cm * sc, f = i % 3;
          const km = sc >= 100000;
          const val = km ? rd(real / 100000) : rd(real / 100), u = km ? 'km' : 'm';
          if (f === 0 || f === 1) return Q(`Trên bản đồ tỉ lệ 1 : ${F(sc)}, quãng đường đo được ${cm} cm. Quãng đường thật dài bao nhiêu ${km ? 'ki-lô-mét' : 'mét'}?`, vz('mapScale', { scale: sc, mapCm: cm }), num(val, u), `Lấy ${cm} × ${F(sc)} (cm) rồi đổi ra ${u}.`, `${cm} × ${F(sc)} = ${F(real)} (cm) = ${F(val)} ${u}.`);
          const realM = R(rng, 2, 20) * 10, sc2 = P(rng, [500, 1000, 2000]); const mapC = realM * 100 / sc2;
          return Q(`Một sân trường dài ${realM} m. Trên bản đồ tỉ lệ 1 : ${F(sc2)}, chiều dài đó là bao nhiêu xăng-ti-mét?`, null, num(rd(mapC), 'cm'), 'Đổi độ dài thật ra xăng-ti-mét rồi chia cho số lần.', `${realM} m = ${F(realM * 100)} cm; ${F(realM * 100)} : ${F(sc2)} = ${F(rd(mapC))} (cm).`);
        }),
      lesson(7, 38, 'Tìm hai số khi biết tổng và tỉ số của hai số đó',
        'Rô-bốt ISA giúp hai bạn chia số sách theo tỉ số để mang tặng thư viện.',
        [
          { text: 'Tổng hai số là 35, tỉ số là 2/3. Vẽ sơ đồ: số bé 2 phần, số lớn 3 phần. Tổng số phần: 2 + 3 = 5. Giá trị một phần: 35 : 5 = 7.', visual: vz('tape', { bars: [{ label: 'Số bé', parts: 2, units: 2, value: '?' }, { label: 'Số lớn', parts: 3, units: 3, value: '?' }], total: '35' }) },
          { text: 'Số bé: 7 × 2 = 14. Số lớn: 35 − 14 = 21.' },
        ],
        function (rng, i) {
          let m = R(rng, 1, 5), n = R(rng, m + 1, 9); const g = U.gcd(m, n); m /= g; n /= g;
          const u = R(rng, 2, lv(i) === 0 ? 10 : 50), S = (m + n) * u, f = i % 4;
          const tape = (l1, l2, tot) => vz('tape', { bars: [{ label: l1, parts: m, units: m, value: '?' }, { label: l2, parts: n, units: n, value: '?' }], total: tot });
          if (f === 0) return Q(`Tổng của hai số là ${S}. Tỉ số của hai số là ${m}/${n}. Tìm số bé.`, tape('Số bé', 'Số lớn', String(S)), num(m * u), `Tổng số phần bằng nhau: ${m} + ${n} = ${m + n}.`, `Một phần: ${S} : ${m + n} = ${u}. Số bé: ${u} × ${m} = ${m * u}.`);
          if (f === 1) return Q(`Tổng của hai số là ${S}. Số bé bằng ${m}/${n} số lớn. Tìm số lớn.`, tape('Số bé', 'Số lớn', String(S)), num(n * u), `Tổng số phần: ${m + n}.`, `Một phần: ${S} : ${m + n} = ${u}. Số lớn: ${u} × ${n} = ${n * u}.`);
          if (f === 2) { const [x, y] = two(rng); return Q(`${x} và ${y} có tất cả ${S} viên bi. Số bi của ${x} bằng ${m}/${n} số bi của ${y}. Hỏi ${x} có bao nhiêu viên bi?`, tape(x, y, S + ' viên'), num(m * u), `Vẽ sơ đồ: ${x} ${m} phần, ${y} ${n} phần.`, `Tổng số phần: ${m + n}. Một phần: ${S} : ${m + n} = ${u}. ${x}: ${u} × ${m} = ${m * u} (viên bi).`); }
          const P2 = 2 * S; return Q(`Một mảnh vườn hình chữ nhật có chu vi ${P2} m, chiều rộng bằng ${m}/${n} chiều dài. Tính chiều dài mảnh vườn.`, tape('Chiều rộng', 'Chiều dài', S + ' m'), num(n * u, 'm'), `Nửa chu vi là tổng chiều dài và chiều rộng: ${P2} : 2 = ${S} (m).`, `Nửa chu vi: ${S} m. Một phần: ${S} : ${m + n} = ${u}. Chiều dài: ${u} × ${n} = ${n * u} (m).`);
        }),
      lesson(7, 39, 'Tìm hai số khi biết hiệu và tỉ số của hai số đó',
        'Rô-bốt ISA tìm tuổi mẹ và tuổi con qua một bài toán đố vui.',
        [
          { text: 'Hiệu hai số là 24, tỉ số là 3/5. Số bé 3 phần, số lớn 5 phần. Hiệu số phần: 5 − 3 = 2. Một phần: 24 : 2 = 12.', visual: vz('tape', { bars: [{ label: 'Số bé', parts: 3, units: 3, value: '?' }, { label: 'Số lớn', parts: 5, units: 5, value: '?' }], diff: '24' }) },
          { text: 'Số bé: 12 × 3 = 36. Số lớn: 36 + 24 = 60.' },
        ],
        function (rng, i) {
          let m = R(rng, 1, 6), n = R(rng, m + 1, 9); const g = U.gcd(m, n); m /= g; n /= g;
          const u = R(rng, 2, lv(i) === 0 ? 10 : 40), D = (n - m) * u, f = i % 3;
          const tape = (l1, l2, d) => vz('tape', { bars: [{ label: l1, parts: m, units: m, value: '?' }, { label: l2, parts: n, units: n, value: '?' }], diff: d });
          if (f === 0) return Q(`Hiệu của hai số là ${D}. Tỉ số của hai số là ${m}/${n}. Tìm số lớn.`, tape('Số bé', 'Số lớn', String(D)), num(n * u), `Hiệu số phần bằng nhau: ${n} − ${m} = ${n - m}.`.replace('−', M), `Một phần: ${D} : ${n - m} = ${u}. Số lớn: ${u} × ${n} = ${n * u}.`);
          if (f === 1) return Q(`Hiệu của hai số là ${D}. Số bé bằng ${m}/${n} số lớn. Tìm số bé.`, tape('Số bé', 'Số lớn', String(D)), num(m * u), `Hiệu số phần: ${n} ${M} ${m} = ${n - m}.`, `Một phần: ${D} : ${n - m} = ${u}. Số bé: ${u} × ${m} = ${m * u}.`);
          const k = R(rng, 3, 7), c = R(rng, 5, 10), mom = c * k, d = mom - c;
          return Q(`Mẹ hơn con ${d} tuổi. Tuổi con bằng 1/${k} tuổi mẹ. Tính tuổi con.`, vz('tape', { bars: [{ label: 'Con', parts: 1, units: 1, value: '?' }, { label: 'Mẹ', parts: k, units: k, value: '?' }], diff: d + ' tuổi' }), num(c, 'tuổi'), `Hiệu số phần: ${k} ${M} 1 = ${k - 1}.`, `Tuổi con: ${d} : ${k - 1} = ${c} (tuổi). Tuổi mẹ: ${c} × ${k} = ${mom} (tuổi).`);
        }),
      lesson(7, 40, 'Tìm tỉ số phần trăm của hai số',
        'Rô-bốt ISA tính tỉ số phần trăm số cây đã trồng so với kế hoạch của lớp.',
        [
          { text: 'Muốn tìm tỉ số phần trăm của hai số, ta tìm thương của hai số rồi nhân thương đó với 100 và viết thêm kí hiệu %. 18 và 24: 18 : 24 = 0,75 = 75%.', visual: vz('percent', { percent: 75 }) },
        ],
        function (rng, i) {
          const b = P(rng, lv(i) === 0 ? [10, 20, 25, 50] : [20, 25, 40, 50, 80, 200, 400, 500]), a = R(rng, 1, lv(i) === 2 ? b + b / 2 : b);
          const pc = rd(a * 100 / b), f = i % 3;
          if (f === 0) return Q(`Tìm tỉ số phần trăm của ${a} và ${b}.`, pc <= 100 && Number.isInteger(pc) ? vz('percent', { percent: pc }) : null, num(pc, '%'), 'Lấy số thứ nhất chia cho số thứ hai, nhân với 100 rồi viết thêm %.', `${a} : ${b} = ${F(rd(a / b))} = ${F(pc)}%.`);
          if (f === 1) { const tot = P(rng, [20, 25, 40, 50]), girls = R(rng, 1, tot - 1), p2 = rd(girls * 100 / tot); return Q(`Một lớp có ${tot} học sinh, trong đó có ${girls} học sinh nữ. Số học sinh nữ chiếm bao nhiêu phần trăm số học sinh cả lớp?`, Number.isInteger(p2) ? vz('percent', { percent: p2 }) : null, num(p2, '%'), 'Tỉ số phần trăm = số học sinh nữ : số học sinh cả lớp × 100.', `${girls} : ${tot} = ${F(rd(girls / tot))} = ${F(p2)}%.`); }
          const plan = P(rng, [20, 40, 50, 80, 200]), done = R(rng, plan / 2, plan * 1.5), p3 = rd(done * 100 / plan);
          return Q(`Theo kế hoạch, lớp phải trồng ${plan} cây. Lớp đã trồng được ${done} cây. Lớp đã thực hiện được bao nhiêu phần trăm kế hoạch?`, null, num(p3, '%'), 'Tỉ số phần trăm = số cây đã trồng : số cây kế hoạch × 100.', `${done} : ${plan} = ${F(rd(done / plan))} = ${F(p3)}%.`);
        }),
      lesson(7, 41, 'Tìm giá trị phần trăm của một số',
        'Rô-bốt ISA tính tiền được giảm giá khi mẹ bạn Mai mua quần áo mới.',
        [
          { text: 'Muốn tìm 30% của 120, ta lấy 120 × 30 : 100 = 36.', visual: vz('percent', { percent: 30 }) },
        ],
        function (rng, i) {
          const p = P(rng, [10, 20, 25, 30, 40, 50, 60, 75, 5, 15]), base = 100 / U.gcd(p, 100), N = base * R(rng, 1, lv(i) === 0 ? 5 : 40), v = N * p / 100, f = i % 3;
          if (f === 0) return Q(`Tìm ${p}% của ${F(N)}.`, vz('percent', { percent: p }), num(v), `Lấy ${F(N)} × ${p} : 100.`, `${F(N)} × ${p} : 100 = ${F(v)}.`);
          if (f === 1) { const price = R(rng, 2, 40) * 10000, pp = P(rng, [10, 20, 25, 50]), off = price * pp / 100; return Q(`Một chiếc áo giá ${F(price)} đồng, được giảm giá ${pp}%. Hỏi chiếc áo được giảm bao nhiêu tiền?`, vz('percent', { percent: pp }), num(off, 'đồng'), `Tìm ${pp}% của ${F(price)}.`, `${F(price)} × ${pp} : 100 = ${F(off)} (đồng).`); }
          const tot = P(rng, [20, 25, 40, 50]), pp = P(rng, [20, 40, 60, 80]), girls = tot * pp / 100;
          return Q(`Lớp 5C có ${tot} học sinh, số học sinh nữ chiếm ${pp}%. Hỏi lớp có bao nhiêu học sinh nữ?`, vz('percent', { percent: pp }), num(girls), `Tìm ${pp}% của ${tot}.`, `${tot} × ${pp} : 100 = ${girls} (học sinh).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. THỂ TÍCH. ĐƠN VỊ ĐO THỂ TÍCH ============
  const c8 = {
    id: 'g5-c8', semester: 2, title: 'Thể tích. Đơn vị đo thể tích', icon: '🧊', lessons: [
      lesson(8, 45, 'Thể tích của một hình',
        'Rô-bốt ISA xếp những khối lập phương nhỏ thành các hình khác nhau cùng bạn Tú.',
        [
          { text: 'Hình này gồm 12 khối lập phương nhỏ. Ta nói thể tích của hình bằng 12 khối lập phương nhỏ.', visual: vz('cubes', { l: 3, w: 2, h: 2 }) },
          { text: 'Hình A gồm nhiều khối lập phương hơn hình B (cùng loại) thì thể tích hình A lớn hơn.' },
        ],
        function (rng, i) {
          const l = R(rng, 1, 4), w = R(rng, 1, 3), h = R(rng, 1, lv(i) === 0 ? 2 : 4), f = i % 3;
          if (f === 0 || f === 2) return Q('Hình dưới đây gồm bao nhiêu khối lập phương nhỏ?', vz('cubes', { l, w, h }), num(l * w * h), 'Đếm số khối ở một lớp rồi nhân với số lớp.', `${l} × ${w} × ${h} = ${l * w * h} (khối).`);
          const l2 = R(rng, 1, 4), w2 = R(rng, 1, 3), h2 = R(rng, 1, 3);
          return Q(`Hình A gồm ${l * w * h} khối lập phương nhỏ, hình B gồm ${l2 * w2 * h2} khối như thế. So sánh thể tích: hình A … hình B`, vz('cubes', { l, w, h }), cmpAns(l * w * h, l2 * w2 * h2), 'Hình nào gồm nhiều khối hơn thì thể tích lớn hơn.', `${l * w * h} ${sign(l * w * h, l2 * w2 * h2)} ${l2 * w2 * h2}.`);
        }),
      lesson(8, 46, 'Xăng-ti-mét khối. Đề-xi-mét khối',
        'Rô-bốt ISA dùng những khối lập phương cạnh 1 cm xếp thành khối lớn cạnh 1 dm.',
        [
          { text: 'Xăng-ti-mét khối (cm³) là thể tích hình lập phương cạnh 1 cm. Đề-xi-mét khối (dm³) là thể tích hình lập phương cạnh 1 dm.', visual: vz('solid', { kind: 'cube' }) },
          { text: '1 dm³ = 1000 cm³ (10 × 10 × 10 khối nhỏ).' },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), f = i % 3;
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} dm³ = ? cm³`, a * 1000, 'cm³'], [`${a * 1000} cm³ = ? dm³`, a, 'dm³'], [`${F(dec(a * 10 + 5, 1))} dm³ = ? cm³`, (a * 10 + 5) * 100, 'cm³'], [`${a * 100} cm³ = ? dm³`, dec(a, 1), 'dm³']]); return Q(p, null, num(v, u), '1 dm³ = 1000 cm³.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const l = R(rng, 2, 4), w = R(rng, 1, 3), h = R(rng, 1, 3); return Q('Mỗi khối lập phương nhỏ có thể tích 1 cm³. Thể tích của hình là bao nhiêu xăng-ti-mét khối?', vz('cubes', { l, w, h }), num(l * w * h, 'cm³'), 'Đếm số khối 1 cm³.', `${l * w * h} cm³.`); }
          const x = R(rng, 1, 5), y = x * 1000 + P(rng, [-100, 0, 200]);
          return Q(`So sánh: ${x} dm³ … ${F(y)} cm³`, vz('compare', { left: `${x} dm³`, right: `${F(y)} cm³` }), cmpAns(x * 1000, y), 'Đổi về cùng đơn vị.', `${x} dm³ = ${F(x * 1000)} cm³; ${F(x * 1000)} ${sign(x * 1000, y)} ${F(y)}.`);
        }),
      lesson(8, 47, 'Mét khối',
        'Rô-bốt ISA tính lượng nước trong bể bơi của nhà văn hóa.',
        [
          { text: 'Mét khối (m³) là thể tích hình lập phương cạnh 1 m. 1 m³ = 1000 dm³ = 1 000 000 cm³.', visual: vz('solid', { kind: 'cube' }) },
          { text: 'm³ – dm³ – cm³: mỗi đơn vị gấp 1000 lần đơn vị bé hơn liền sau.' },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), f = i % 3;
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} m³ = ? dm³`, a * 1000, 'dm³'], [`${a} m³ = ? cm³`, a * 1000000, 'cm³'], [`${a * 1000} dm³ = ? m³`, a, 'm³'], [`${F(dec(a, 1))} m³ = ? dm³`, a * 100, 'dm³']]); return Q(p, null, num(v, u), '1 m³ = 1000 dm³; 1 dm³ = 1000 cm³.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const [p, u] = P(rng, [['Thể tích một bể bơi khoảng 500 …', 'm³'], ['Thể tích một hộp sữa nhỏ khoảng 180 …', 'cm³'], ['Thể tích một thùng nước khoảng 20 …', 'dm³']]); return Q(`Chọn đơn vị thích hợp:\n${p}`, null, ch(rng, u, ['m³', 'dm³', 'cm³'].filter(x => x !== u)), 'Hình dung độ lớn thật.', `${p.replace('…', u)}.`); }
          const b = R(rng, 1, 999);
          return Q(`${a} m³ ${b} dm³ = ? dm³`, null, num(a * 1000 + b, 'dm³'), '1 m³ = 1000 dm³.', `${a} m³ ${b} dm³ = ${F(a * 1000 + b)} dm³.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 9. DIỆN TÍCH VÀ THỂ TÍCH CỦA MỘT SỐ HÌNH KHỐI ============
  const c9 = {
    id: 'g5-c9', semester: 2, title: 'Diện tích và thể tích của một số hình khối', icon: '📦', lessons: [
      lesson(9, 49, 'Hình khai triển của hình lập phương, hình hộp chữ nhật và hình trụ',
        'Rô-bốt ISA mở phẳng chiếc hộp quà để xem nó được ghép từ những hình nào.',
        [
          { text: 'Hình khai triển của hình lập phương gồm 6 hình vuông bằng nhau.', visual: vz('solid', { kind: 'cube' }) },
          { text: 'Hình khai triển của hình hộp chữ nhật gồm 6 hình chữ nhật. Hình khai triển của hình trụ gồm 2 hình tròn và 1 hình chữ nhật.', visual: vz('solid', { kind: 'cylinder' }) },
        ],
        function (rng, i) {
          const qs = [
            ['Hình khai triển của hình lập phương gồm mấy hình vuông?', 'cube', null, 6],
            ['Hình khai triển của hình hộp chữ nhật gồm mấy hình chữ nhật?', 'box', null, 6],
            ['Hình khai triển của hình trụ gồm những hình nào?', 'cylinder', '2 hình tròn và 1 hình chữ nhật', ['1 hình tròn và 2 hình chữ nhật', '6 hình vuông', '2 hình tam giác và 1 hình chữ nhật']],
            ['Hình nào có hình khai triển gồm 6 hình vuông bằng nhau?', 'cube', 'Hình lập phương', ['Hình hộp chữ nhật', 'Hình trụ', 'Hình cầu']],
            ['Hình nào có hình khai triển gồm 2 hình tròn và 1 hình chữ nhật?', 'cylinder', 'Hình trụ', ['Hình lập phương', 'Hình hộp chữ nhật', 'Hình cầu']],
          ];
          const [p, k, c, d] = qs[(i + R(rng, 0, 4)) % 5];
          if (c == null) return Q(p, vz('solid', { kind: k }), num(d), 'Đếm số mặt của hình khối.', `Gồm ${d} hình.`);
          return Q(p, vz('solid', { kind: k }), ch(rng, c, d), 'Hình dung mở phẳng các mặt của hình khối.', `Đáp án: ${c}.`);
        }),
      lesson(9, 50, 'Diện tích xung quanh và diện tích toàn phần của hình hộp chữ nhật',
        'Rô-bốt ISA tính lượng giấy màu để bọc chiếc hộp quà tặng mẹ.',
        [
          { text: 'Diện tích xung quanh = chu vi mặt đáy × chiều cao: Sxq = (a + b) × 2 × c.', visual: vz('solid', { kind: 'box', dims: { l: 5, w: 3, h: 4 } }) },
          { text: 'Diện tích toàn phần = diện tích xung quanh + diện tích hai đáy: Stp = Sxq + a × b × 2.' },
        ],
        function (rng, i) {
          const a = R(rng, 3, lv(i) === 0 ? 10 : 30), b = R(rng, 2, a - 1), c = R(rng, 2, lv(i) === 0 ? 10 : 25), sxq = (a + b) * 2 * c, stp = sxq + a * b * 2, f = i % 3;
          const v = vz('solid', { kind: 'box', dims: { l: a, w: b, h: c } });
          if (f === 0) return Q(`Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích xung quanh.`, v, num(sxq, 'cm²'), 'Sxq = (dài + rộng) × 2 × cao.', `(${a} + ${b}) × 2 × ${c} = ${F(sxq)} (cm²).`);
          if (f === 1) return Q(`Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích toàn phần.`, v, num(stp, 'cm²'), 'Stp = Sxq + 2 × diện tích đáy.', `Sxq = (${a} + ${b}) × 2 × ${c} = ${F(sxq)}; Stp = ${F(sxq)} + ${a} × ${b} × 2 = ${F(stp)} (cm²).`);
          const A = a * 10, B = b * 10, C = c * 10, glass = (A + B) * 2 * C + A * B;
          return Q(`Một bể cá không có nắp dạng hình hộp chữ nhật dài ${A} cm, rộng ${B} cm, cao ${C} cm. Tính diện tích kính dùng làm bể.`, vz('solid', { kind: 'box', dims: { l: A, w: B, h: C } }), num(glass, 'cm²'), 'Bể không nắp: diện tích xung quanh + 1 mặt đáy.', `(${A} + ${B}) × 2 × ${C} + ${A} × ${B} = ${F(glass)} (cm²).`);
        }),
      lesson(9, 51, 'Diện tích xung quanh và diện tích toàn phần của hình lập phương',
        'Rô-bốt ISA sơn những khối gỗ lập phương làm đồ chơi cho các em mẫu giáo.',
        [
          { text: 'Hình lập phương cạnh a: Sxq = a × a × 4; Stp = a × a × 6.', visual: vz('solid', { kind: 'cube', dims: { a: 4 } }) },
        ],
        function (rng, i) {
          const a = R(rng, 2, lv(i) === 0 ? 10 : 30), f = i % 3;
          if (f === 0) return Q(`Tính diện tích xung quanh của hình lập phương có cạnh ${a} cm.`, vz('solid', { kind: 'cube', dims: { a } }), num(a * a * 4, 'cm²'), 'Sxq = cạnh × cạnh × 4.', `${a} × ${a} × 4 = ${F(a * a * 4)} (cm²).`);
          if (f === 1) return Q(`Tính diện tích toàn phần của hình lập phương có cạnh ${a} cm.`, vz('solid', { kind: 'cube', dims: { a } }), num(a * a * 6, 'cm²'), 'Stp = cạnh × cạnh × 6.', `${a} × ${a} × 6 = ${F(a * a * 6)} (cm²).`);
          const x = dec(R(rng, 11, 29), 1);
          return Q(`Một hình lập phương có cạnh ${F(x)} m. Tính diện tích toàn phần.`, vz('solid', { kind: 'cube', dims: { a: x, unit: 'm' } }), num(rd(x * x * 6), 'm²'), 'Stp = cạnh × cạnh × 6.', `${F(x)} × ${F(x)} × 6 = ${F(rd(x * x * 6))} (m²).`);
        }),
      lesson(9, 52, 'Thể tích của hình hộp chữ nhật',
        'Rô-bốt ISA tính lượng nước cần đổ đầy chiếc bể cá của lớp.',
        [
          { text: 'Thể tích hình hộp chữ nhật = chiều dài × chiều rộng × chiều cao (cùng đơn vị đo): V = a × b × c.', visual: vz('cubes', { l: 4, w: 3, h: 2 }) },
          { text: 'Ví dụ: 4 × 3 × 2 = 24 (cm³).' },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const l = R(rng, 2, 5), w = R(rng, 1, 4), h = R(rng, 1, 4); return Q(`Tính thể tích hình hộp chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm, chiều cao ${h} cm.`, vz('cubes', { l, w, h }), num(l * w * h, 'cm³'), 'V = dài × rộng × cao.', `${l} × ${w} × ${h} = ${l * w * h} (cm³).`); }
          if (f === 1) { const a = R(rng, 5, 40), b = R(rng, 3, 30), c = R(rng, 2, 20); return Q(`Một hình hộp chữ nhật dài ${a} dm, rộng ${b} dm, cao ${c} dm. Tính thể tích.`, vz('solid', { kind: 'box', dims: { l: a, w: b, h: c, unit: 'dm' } }), num(a * b * c, 'dm³'), 'V = a × b × c.', `${a} × ${b} × ${c} = ${F(a * b * c)} (dm³).`); }
          const a = R(rng, 1, 3), b = R(rng, 4, 9), c = R(rng, 3, 8);
          return Q(`Một bể nước dạng hình hộp chữ nhật dài ${a} m, rộng ${b} dm, cao ${c} dm. Bể chứa được nhiều nhất bao nhiêu lít nước? (1 dm³ = 1 l)`, vz('solid', { kind: 'box', dims: { l: a * 10, w: b, h: c, unit: 'dm' } }), num(a * 10 * b * c, 'l'), `Đổi ${a} m = ${a * 10} dm rồi tính thể tích theo dm³.`, `${a * 10} × ${b} × ${c} = ${F(a * 10 * b * c)} (dm³) = ${F(a * 10 * b * c)} l.`);
        }),
      lesson(9, 53, 'Thể tích của hình lập phương',
        'Rô-bốt ISA xếp những khối rubik thành một khối lập phương lớn.',
        [
          { text: 'Thể tích hình lập phương = cạnh × cạnh × cạnh: V = a × a × a.', visual: vz('cubes', { l: 3, w: 3, h: 3 }) },
          { text: 'Cạnh 3 cm: V = 3 × 3 × 3 = 27 (cm³).' },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const a = R(rng, 1, 4); return Q(`Tính thể tích hình lập phương có cạnh ${a} cm.`, vz('cubes', { l: a, w: a, h: a }), num(a * a * a, 'cm³'), 'V = cạnh × cạnh × cạnh.', `${a} × ${a} × ${a} = ${a * a * a} (cm³).`); }
          if (f === 1) { const a = R(rng, 5, 30); return Q(`Một khối gỗ hình lập phương có cạnh ${a} cm. Tính thể tích khối gỗ.`, vz('solid', { kind: 'cube', dims: { a } }), num(a * a * a, 'cm³'), 'V = a × a × a.', `${a} × ${a} × ${a} = ${F(a * a * a)} (cm³).`); }
          const x = dec(R(rng, 11, 25), 1);
          return Q(`Tính thể tích hình lập phương có cạnh ${F(x)} m.`, vz('solid', { kind: 'cube', dims: { a: x, unit: 'm' } }), num(rd(x * x * x), 'm³'), 'V = a × a × a.', `${F(x)} × ${F(x)} × ${F(x)} = ${F(rd(x * x * x))} (m³).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 10. SỐ ĐO THỜI GIAN, VẬN TỐC. CÁC BÀI TOÁN LIÊN QUAN ĐẾN CHUYỂN ĐỘNG ĐỀU ============
  const hm = (h, m) => (h && m ? `${h} giờ ${m} phút` : h ? `${h} giờ` : `${m} phút`);
  const VEH = [['car', 'Một ô tô', 'ô tô'], ['bike', 'Một người đi xe đạp', 'xe đạp'], ['boat', 'Một ca nô', 'ca nô'], ['walk', 'Một người đi bộ', 'người đi bộ']];
  const vRange = { car: [35, 70], bike: [10, 18], boat: [20, 40], walk: [4, 6] };
  const c10 = {
    id: 'g5-c10', semester: 2, title: 'Số đo thời gian, vận tốc. Các bài toán liên quan đến chuyển động đều', icon: '🚗', lessons: [
      lesson(10, 56, 'Các đơn vị đo thời gian',
        'Rô-bốt ISA cùng bạn Trang tính xem từ khi trường được xây đến nay đã bao nhiêu năm.',
        [
          { text: '1 thế kỉ = 100 năm; 1 năm = 12 tháng; 1 năm thường có 365 ngày, năm nhuận có 366 ngày.' },
          { text: '1 tuần = 7 ngày; 1 ngày = 24 giờ; 1 giờ = 60 phút; 1 phút = 60 giây. 1,5 giờ = 90 phút.', visual: vz('clock', { h: 1, m: 30 }) },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), f = i % 3;
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} năm = ? tháng`, a * 12, 'tháng'], [`${a} ngày = ? giờ`, a * 24, 'giờ'], [`${a} giờ = ? phút`, a * 60, 'phút'], [`${a} phút = ? giây`, a * 60, 'giây'], [`${a} tuần = ? ngày`, a * 7, 'ngày']]); return Q(p, null, num(v, u), 'Nhớ bảng đơn vị đo thời gian.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const [p, v, u] = P(rng, [[`${F(dec(a * 10 + 5, 1))} giờ = ? phút`, (a * 10 + 5) * 6, 'phút'], ['0,5 ngày = ? giờ', 12, 'giờ'], [`${F(dec(a, 1))} giờ = ? phút`, a * 6, 'phút'], [`${a * 30} phút = ? giờ`, dec(a * 5, 1), 'giờ'], ['1/4 giờ = ? phút', 15, 'phút']]); return Q(p, null, num(v, u), '1 giờ = 60 phút; 1 ngày = 24 giờ.', `${p.replace('?', F(v))}.`); }
          const y = P(rng, [2024, 2025, 2026, 2027, 2028, 2032, 2100, 2000]); const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
          return Q(`Năm ${y} có bao nhiêu ngày?`, vz('calendar', { year: y, month: 2 }), num(leap ? 366 : 365, 'ngày'), 'Năm nhuận (tháng 2 có 29 ngày) có 366 ngày; năm thường có 365 ngày.', `Tháng 2 năm ${y} có ${leap ? 29 : 28} ngày nên năm ${y} có ${leap ? 366 : 365} ngày.`);
        }),
      lesson(10, 57, 'Cộng, trừ số đo thời gian',
        'Rô-bốt ISA tính thời gian chuyến xe khách từ Hà Nội về quê bạn Việt.',
        [
          { text: 'Cộng: 2 giờ 45 phút + 1 giờ 30 phút = 3 giờ 75 phút = 4 giờ 15 phút (75 phút = 1 giờ 15 phút).' },
          { text: 'Trừ: 5 giờ 20 phút − 2 giờ 45 phút: đổi 5 giờ 20 phút = 4 giờ 80 phút; 4 giờ 80 phút − 2 giờ 45 phút = 2 giờ 35 phút.' },
        ],
        function (rng, i) {
          const h1 = R(rng, 1, 9), m1 = R(rng, 1, 11) * 5, h2 = R(rng, 1, 5), m2 = R(rng, 1, 11) * 5, f = i % 3;
          if (f === 0 || f === 2) {
            const t = (h1 + h2) * 60 + m1 + m2, H = Math.floor(t / 60), Mi = t % 60;
            if (f === 2) return Q(`Một xe khách khởi hành lúc ${hm(h1 + 5, m1)}, đi hết ${hm(h2, m2)}. Hỏi xe đến nơi lúc mấy giờ?`, vz('clock', { h: (h1 + 5) % 12, m: m1 }), ch(rng, hm(H + 5, Mi), [hm(h1 + h2 + 5, m1 + m2), hm(H + 6, Mi), hm(H + 5, (Mi + 15) % 60 || 5)]), 'Cộng giờ với giờ, phút với phút; nếu số phút ≥ 60 thì đổi ra giờ.', `${hm(h1 + 5, m1)} + ${hm(h2, m2)} = ${hm(H + 5, Mi)}.`);
            return Q(`${hm(h1, m1)} + ${hm(h2, m2)} = ?`, null, ch(rng, hm(H, Mi), [hm(h1 + h2, m1 + m2), hm(H + 1, Mi), hm(H, (Mi + 10) % 60 || 5)]), 'Cộng giờ với giờ, phút với phút; số phút ≥ 60 thì đổi 60 phút = 1 giờ.', `${hm(h1, m1)} + ${hm(h2, m2)} = ${hm(h1 + h2, m1 + m2)}${m1 + m2 >= 60 ? ` = ${hm(H, Mi)}` : ''}.`);
          }
          const A = (h1 + 5) * 60 + m1, B = h2 * 60 + m2, t = A - B, H = Math.floor(t / 60), Mi = t % 60;
          return Q(`${hm(h1 + 5, m1)} ${M} ${hm(h2, m2)} = ?`, null, ch(rng, hm(H, Mi), [hm(H + 1, Mi), hm(H, Math.abs(m1 - m2) === Mi ? (Mi + 5) % 60 : Math.abs(m1 - m2)), hm(Math.max(H - 1, 0) || H + 2, Mi)]), 'Trừ giờ với giờ, phút với phút; số phút không đủ trừ thì đổi 1 giờ = 60 phút.', `${hm(h1 + 5, m1)} ${M} ${hm(h2, m2)} = ${hm(H, Mi)}.`);
        }),
      lesson(10, 58, 'Nhân, chia số đo thời gian với một số',
        'Rô-bốt ISA tính thời gian bạn Lan cần để làm xong mấy bài tập thủ công.',
        [
          { text: 'Nhân: 1 giờ 25 phút × 3 = 3 giờ 75 phút = 4 giờ 15 phút.' },
          { text: 'Chia: 7 giờ 30 phút : 3 = 2 giờ 30 phút (7 giờ : 3 = 2 giờ dư 1 giờ = 60 phút; 60 + 30 = 90 phút; 90 : 3 = 30 phút).' },
        ],
        function (rng, i) {
          const k = R(rng, 2, 5), f = i % 3;
          if (f === 0 || f === 2) {
            const h = R(rng, 1, 4), m = R(rng, 1, 11) * 5, t = (h * 60 + m) * k, H = Math.floor(t / 60), Mi = t % 60;
            if (f === 2) return Q(`Mỗi sản phẩm làm hết ${hm(h, m)}. Hỏi làm ${k} sản phẩm như thế hết bao nhiêu thời gian?`, null, ch(rng, hm(H, Mi), [hm(h * k, m * k), hm(H + 1, Mi), hm(H, (Mi + 15) % 60 || 5)]), 'Nhân số giờ, số phút với số đó; đổi phút ra giờ nếu ≥ 60.', `${hm(h, m)} × ${k} = ${hm(h * k, m * k)}${m * k >= 60 ? ` = ${hm(H, Mi)}` : ''}.`);
            return Q(`${hm(h, m)} × ${k} = ?`, null, ch(rng, hm(H, Mi), [hm(h * k, m * k), hm(H + 1, Mi), hm(H, (Mi + 10) % 60 || 5)].filter(x => x !== hm(H, Mi))), 'Nhân giờ với số đó, nhân phút với số đó, rồi đổi phút ra giờ nếu cần.', `${hm(h, m)} × ${k} = ${hm(h * k, m * k)}${m * k >= 60 ? ` = ${hm(H, Mi)}` : ''}.`);
          }
          const qh = R(rng, 1, 3), qm = R(rng, 1, 11) * 5, t = (qh * 60 + qm) * k, H = Math.floor(t / 60), Mi = t % 60;
          return Q(`${hm(H, Mi)} : ${k} = ?`, null, ch(rng, hm(qh, qm), [hm(qh + 1, qm), hm(qh, (qm + 10) % 60 || 5), hm(Math.floor(H / k), Math.floor(Mi / k) || 5)].filter(x => x !== hm(qh, qm))), 'Chia số giờ trước; số giờ dư đổi ra phút rồi cộng với số phút và chia tiếp.', `${hm(H, Mi)} : ${k} = ${hm(qh, qm)}.`);
        }),
      lesson(10, 59, 'Vận tốc của một chuyển động đều',
        'Rô-bốt ISA đo xem chiếc ô tô của bố bạn Nam đi được bao nhiêu ki-lô-mét mỗi giờ.',
        [
          { text: 'Vận tốc là quãng đường đi được trong một đơn vị thời gian: v = s : t. Ô tô đi 120 km trong 3 giờ: v = 120 : 3 = 40 (km/giờ).', visual: vz('motion', { speed: 40, unit: 'km/giờ', time: 3, distance: 120, vehicle: 'car' }) },
          { text: 'Đơn vị vận tốc: km/giờ, m/phút, m/giây.' },
        ],
        function (rng, i) {
          const [veh, name] = P(rng, VEH), [lo, hi] = vRange[veh], v = R(rng, lo, hi), f = i % 3;
          if (f === 0) { const t = R(rng, 2, 5), s = v * t; return Q(`${name} đi được ${s} km trong ${t} giờ. Tính vận tốc.`, vz('motion', { speed: '?', unit: 'km/giờ', time: t, distance: s, vehicle: veh }), num(v, 'km/giờ'), 'v = s : t.', `${s} : ${t} = ${v} (km/giờ).`); }
          if (f === 1) { const t = dec(R(rng, 3, 9) * 5, 1), v2 = v % 2 ? v + 1 : v, s = rd(v2 * t); return Q(`${name} đi quãng đường ${F(s)} km hết ${F(t)} giờ. Tính vận tốc.`, vz('motion', { speed: '?', unit: 'km/giờ', time: t, distance: s, vehicle: veh }), num(v2, 'km/giờ'), 'v = s : t.', `${F(s)} : ${F(t)} = ${v2} (km/giờ).`); }
          const sec = R(rng, 10, 25), m = sec * R(rng, 4, 8);
          return Q(`Một vận động viên chạy ${m} m trong ${sec} giây. Tính vận tốc chạy (m/giây).`, vz('motion', { speed: '?', unit: 'm/giây', distance: m, vehicle: 'walk' }), num(m / sec, 'm/giây'), 'v = s : t.', `${m} : ${sec} = ${m / sec} (m/giây).`);
        }),
      lesson(10, 60, 'Quãng đường, thời gian của một chuyển động đều',
        'Rô-bốt ISA tính giờ đến nơi cho chuyến ca nô thăm Tràng An cùng gia đình bạn Hà.',
        [
          { text: 'Quãng đường: s = v × t. Ca nô đi với vận tốc 30 km/giờ trong 2 giờ: s = 30 × 2 = 60 (km).', visual: vz('motion', { speed: 30, unit: 'km/giờ', time: 2, distance: 60, vehicle: 'boat' }) },
          { text: 'Thời gian: t = s : v. Đi 60 km với vận tốc 30 km/giờ: t = 60 : 30 = 2 (giờ).' },
        ],
        function (rng, i) {
          const [veh, name] = P(rng, VEH), [lo, hi] = vRange[veh], v0 = R(rng, lo, hi), v = v0 % 2 ? v0 + 1 : v0, f = i % 4;
          if (f === 0) { const t = R(rng, 2, 5); return Q(`${name} đi với vận tốc ${v} km/giờ trong ${t} giờ. Tính quãng đường đi được.`, vz('motion', { speed: v, unit: 'km/giờ', time: t, distance: '?', vehicle: veh }), num(v * t, 'km'), 's = v × t.', `${v} × ${t} = ${v * t} (km).`); }
          if (f === 1) { const t = dec(R(rng, 3, 9) * 5, 1); return Q(`${name} đi với vận tốc ${v} km/giờ trong ${F(t)} giờ. Tính quãng đường đi được.`, vz('motion', { speed: v, unit: 'km/giờ', time: t, distance: '?', vehicle: veh }), num(rd(v * t), 'km'), 's = v × t.', `${v} × ${F(t)} = ${F(rd(v * t))} (km).`); }
          if (f === 2) { const t = R(rng, 2, 6), s = v * t; return Q(`${name} đi quãng đường ${s} km với vận tốc ${v} km/giờ. Tính thời gian đi.`, vz('motion', { speed: v, unit: 'km/giờ', distance: s, vehicle: veh }), num(t, 'giờ'), 't = s : v.', `${s} : ${v} = ${t} (giờ).`); }
          const t = dec(R(rng, 3, 9) * 5, 1), s = rd(v * t), dep = R(rng, 6, 9), mins = Math.round(t * 60), ah = dep + Math.floor(mins / 60), am = mins % 60;
          return Q(`${name} khởi hành lúc ${dep} giờ, đi quãng đường ${F(s)} km với vận tốc ${v} km/giờ. Hỏi đến nơi lúc mấy giờ?`, vz('motion', { speed: v, unit: 'km/giờ', distance: s, vehicle: veh }), ch(rng, hm(ah, am), [hm(ah + 1, am), hm(dep + Math.floor(t), Math.round((t % 1) * 10)), hm(ah, (am + 30) % 60 || 15)].filter(x => x !== hm(ah, am))), 'Tìm thời gian đi (t = s : v), rồi cộng với giờ khởi hành.', `t = ${F(s)} : ${v} = ${F(t)} giờ = ${hm(Math.floor(mins / 60), am)}. Đến nơi lúc ${dep} giờ + ${hm(Math.floor(mins / 60), am)} = ${hm(ah, am)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 11. MỘT SỐ YẾU TỐ THỐNG KÊ VÀ XÁC SUẤT ============
  const PIES = [[['Bóng đá', 'Cầu lông', 'Bơi', 'Cờ vua'], [40, 25, 20, 15]], [['Táo', 'Cam', 'Xoài'], [50, 30, 20]], [['Đi bộ', 'Xe đạp', 'Xe buýt', 'Bố mẹ đưa'], [20, 35, 15, 30]], [['Đọc sách', 'Vẽ', 'Ca hát'], [45, 25, 30]]];
  const c11 = {
    id: 'g5-c11', semester: 2, title: 'Một số yếu tố thống kê và xác suất', icon: '📊', lessons: [
      lesson(11, 63, 'Thu thập, phân loại, sắp xếp các số liệu',
        'Rô-bốt ISA cùng lớp 5A khảo sát môn thể thao các bạn yêu thích.',
        [{ text: 'Thu thập số liệu, phân loại, rồi sắp xếp vào bảng để dễ so sánh.', visual: vz('dataTable', { headers: ['Môn thể thao', 'Bóng đá', 'Cầu lông', 'Bơi', 'Cờ vua'], rows: [['Số bạn', 12, 8, 6, 4]] }) }],
        function (rng, i) {
          const labels = ['Bóng đá', 'Cầu lông', 'Bơi', 'Cờ vua'], vals = U.sample(rng, Array.from({ length: 15 }, (_, k) => k + 2), 4), f = i % 4;
          const tb = vz('dataTable', { headers: ['Môn thể thao'].concat(labels), rows: [['Số bạn'].concat(vals)] });
          if (f === 0) { const s = vals.reduce((a, b) => a + b, 0); return Q('Lớp có tất cả bao nhiêu bạn tham gia khảo sát?', tb, num(s), 'Cộng tất cả các số liệu.', `${vals.join(' + ')} = ${s} (bạn).`); }
          if (f === 1) { const asc = labels.map((l, k) => [l, vals[k]]).sort((x, y) => y[1] - x[1]).map(x => x[0]); return Q('Sắp xếp các môn thể thao theo số bạn yêu thích từ nhiều đến ít:', tb, ch(rng, asc.join(', '), [asc.slice().reverse().join(', '), labels.join(', '), [asc[1], asc[0], asc[2], asc[3]].join(', ')]), 'So sánh các số liệu trong bảng.', `${asc.join(', ')}.`); }
          if (f === 2) { const mx = Math.max(...vals), mn = Math.min(...vals); return Q('Môn được yêu thích nhiều nhất hơn môn ít nhất bao nhiêu bạn?', tb, num(mx - mn), 'Tìm số lớn nhất và số bé nhất.', `${mx} ${M} ${mn} = ${mx - mn} (bạn).`); }
          const s = vals.reduce((a, b) => a + b, 0), avg = s / 4;
          if (!Number.isInteger(avg * 4) || s % 4 !== 0) { const j = R(rng, 0, 3); return Q(`Có bao nhiêu bạn thích ${labels[j].toLowerCase()}?`, tb, num(vals[j]), 'Đọc số liệu trong bảng.', `${vals[j]} bạn.`); }
          return Q('Trung bình mỗi môn có bao nhiêu bạn yêu thích?', tb, num(avg), 'Lấy tổng chia cho số môn.', `${s} : 4 = ${avg} (bạn).`);
        }),
      lesson(11, 64, 'Biểu đồ hình quạt tròn',
        'Rô-bốt ISA đọc biểu đồ hình quạt tròn về cách các bạn đến trường.',
        [{ text: 'Cả hình tròn là 100%. Mỗi hình quạt biểu diễn tỉ số phần trăm của một phần so với tổng.', visual: vz('pieChart', { labels: ['Đi bộ', 'Xe đạp', 'Xe buýt', 'Bố mẹ đưa'], percents: [20, 35, 15, 30] }) }],
        function (rng, i) {
          const [labels, pcs] = P(rng, PIES), pc = vz('pieChart', { labels, percents: pcs }), f = i % 3, j = R(rng, 0, labels.length - 1);
          if (f === 0) return Q(`Theo biểu đồ, "${labels[j]}" chiếm bao nhiêu phần trăm?`, pc, num(pcs[j], '%'), 'Đọc số phần trăm ghi trên hình quạt.', `"${labels[j]}" chiếm ${pcs[j]}%.`);
          const tot = P(rng, [20, 40, 60, 80, 100, 200]), cnt = tot * pcs[j] / 100;
          if (f === 1) return Q(`Có ${tot} học sinh được hỏi. Có bao nhiêu học sinh chọn "${labels[j]}"?`, pc, num(cnt), `Tìm ${pcs[j]}% của ${tot}.`, `${tot} × ${pcs[j]} : 100 = ${cnt} (học sinh).`);
          const mx = Math.max(...pcs);
          return Q('Phần nào chiếm tỉ lệ lớn nhất trong biểu đồ?', pc, ch(rng, labels[pcs.indexOf(mx)], labels), 'Tìm hình quạt lớn nhất.', `"${labels[pcs.indexOf(mx)]}" chiếm ${mx}%.`);
        }),
      lesson(11, 65, 'Tỉ số của số lần lặp lại của một sự kiện so với tổng số lần thực hiện',
        'Rô-bốt ISA tung xúc xắc nhiều lần và ghi lại kết quả cùng bạn Phúc.',
        [{ text: 'Tung đồng xu 20 lần, mặt sấp xuất hiện 9 lần. Tỉ số của số lần xuất hiện mặt sấp và tổng số lần tung là 9/20.', visual: vz('dataTable', { headers: ['Mặt', 'Sấp', 'Ngửa'], rows: [['Số lần', 9, 11]] }) }],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const n = P(rng, [10, 20, 25, 30, 40, 50]), a = R(rng, 1, n - 1); return Q(`Tung một đồng xu ${n} lần, mặt ngửa xuất hiện ${a} lần. Viết tỉ số của số lần xuất hiện mặt ngửa và tổng số lần tung.`, vz('dataTable', { headers: ['Mặt', 'Sấp', 'Ngửa'], rows: [['Số lần', n - a, a]] }), fracA(a, n), 'Tỉ số = số lần xuất hiện : tổng số lần thực hiện.', `${a} : ${n} = ${a}/${n}.`); }
          if (f === 1) { const n = P(rng, [12, 18, 20, 24, 30]), a = R(rng, 1, Math.floor(n / 3)); return Q(`Gieo một con xúc xắc ${n} lần, mặt 6 chấm xuất hiện ${a} lần. Tỉ số của số lần xuất hiện mặt 6 chấm và tổng số lần gieo là:`, null, ch(rng, fs(a, n), [fs(n, a), fs(a, 6), fs(n - a, n)]), 'Tỉ số = số lần xuất hiện / tổng số lần gieo.', `${a}/${n}.`); }
          const n = P(rng, [20, 25, 50]), a = R(rng, 1, n - 1), pc = rd(a * 100 / n);
          return Q(`Lấy bóng từ hộp rồi trả lại, làm ${n} lần, có ${a} lần lấy được bóng đỏ. Số lần lấy được bóng đỏ chiếm bao nhiêu phần trăm tổng số lần?`, vz('chance', { items: [{ color: '#E84A4A', count: 3 }, { color: '#4DA3FF', count: 2 }] }), num(pc, '%'), 'Tìm tỉ số rồi đổi ra tỉ số phần trăm.', `${a} : ${n} = ${F(rd(a / n))} = ${F(pc)}%.`);
        }),
    ],
  };

  CURRICULUM.push({
    grade: 5,
    title: 'Lớp 5',
    book: 'Kết nối tri thức với cuộc sống',
    topics: [c1, c2, c3, c4, c5, c7, c8, c9, c10, c11],
  });
})();
