/* Toán ISA — Lớp 4 (SGK Toán 4 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g4-c{chủ đề index}-b{Bài number}. Never rename ids.
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
  const cmpAns = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b - 1e-12 ? 0 : a > b + 1e-12 ? 1 : 2 });
  const sign = (a, b) => (a < b - 1e-12 ? '<' : a > b + 1e-12 ? '>' : '=');
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
  function toRoman(n) {
    const t = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = ''; for (const [v, c] of t) while (n >= v) { s += c; n -= v; } return s;
  }
  const roundTo = (n, p) => Math.round(n / p) * p;
  function expand(n) { const s = String(n), out = []; for (let k = 0; k < s.length; k++) { const d = Number(s[k]); if (d) out.push(d * Math.pow(10, s.length - 1 - k)); } return out; }
  const PLACES = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn', 'triệu', 'chục triệu', 'trăm triệu'];
  const CLASSES = ['lớp đơn vị', 'lớp nghìn', 'lớp triệu'];
  const PVCOLS = ['Trăm triệu', 'Chục triệu', 'Triệu', 'Trăm nghìn', 'Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  const colsFor = n => PVCOLS.slice(9 - String(n).length);

  // Learn cards show their labels (visuals hide most labels by default so questions do not give answers away).
  const LEARN_ON = { blocks: { labels: true }, fraction: { label: true }, decimalGrid: { showLabel: true }, percent: { showLabel: true }, thermometer: { showValue: true }, roman: { showValue: true, showText: true }, average: { showMean: true }, angle: { showDeg: true }, cubes: { showDims: true } };
  function lesson(c, b, title, story, learn, gen) {
    learn.forEach(card => { const v = card.visual; if (v && LEARN_ON[v.type]) v.params = Object.assign({}, LEARN_ON[v.type], v.params); });
    return { id: `g4-c${c}-b${b}`, title, book: `Bài ${b}`, story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
  }

  // ---------- generic builders ----------
  const ADD_T = [
    (a, b) => `Một nhà máy tháng trước sản xuất được ${F(a)} sản phẩm, tháng này sản xuất được ${F(b)} sản phẩm. Hỏi cả hai tháng nhà máy sản xuất được bao nhiêu sản phẩm?`,
    (a, b) => `Năm ngoái tỉnh trồng được ${F(a)} cây xanh, năm nay trồng được ${F(b)} cây xanh. Hỏi cả hai năm trồng được bao nhiêu cây xanh?`,
    (a, b) => `Một nhà sách tuần trước bán được ${F(a)} quyển sách, tuần này bán được ${F(b)} quyển. Cả hai tuần bán được bao nhiêu quyển sách?`,
  ];
  const SUB_T = [
    (a, b) => `Một kho có ${F(a)} kg thóc, người ta đã chuyển đi ${F(b)} kg. Hỏi trong kho còn lại bao nhiêu ki-lô-gam thóc?`,
    (a, b) => `Năm nay xã có ${F(a)} người, năm trước có ${F(b)} người. Hỏi năm nay số dân của xã tăng thêm bao nhiêu người?`,
    (a, b) => `Bố có ${F(a)} đồng, bố mua sách vở cho con hết ${F(b)} đồng. Hỏi bố còn lại bao nhiêu tiền?`,
  ];
  const MUL_T = [
    (a, b) => `Mỗi thùng có ${F(a)} hộp sữa. Hỏi ${b} thùng như thế có bao nhiêu hộp sữa?`,
    (a, b) => `Mỗi xe chở được ${F(a)} kg gạo. Hỏi ${b} xe như thế chở được bao nhiêu ki-lô-gam gạo?`,
    (a, b) => `Một chiếc áo giá ${F(a)} đồng. Hỏi mua ${b} chiếc áo như thế hết bao nhiêu tiền?`,
  ];
  const DIV_T = [
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
    const at = function (rng, L, k) {
      const [a, b] = pickPair(rng, L);
      const r = opRes(a, op, b);
      const wrong = op === '+' ? wrongAdd(a, b) : op === M ? wrongSub(a, b) : op === '×' ? wrongMul(a, b) : wrongDiv(r);
      const expr = `${F(a)} ${op} ${F(b)}`;
      const colV = vz('columnCalc', { a, b, op, reveal: 'none' });
      const colH = vz('columnCalc', { a, b, op, reveal: 'steps' });
      const hint = op === '+' ? 'Đặt tính thẳng cột, cộng từ phải sang trái, nhớ khi tổng ≥ 10.'
        : op === M ? 'Đặt tính thẳng cột, trừ từ phải sang trái; không trừ được thì mượn 1 ở hàng bên trái.'
          : op === '×' ? (b >= 10 ? 'Nhân lần lượt với từng chữ số của thừa số thứ hai; tích riêng thứ hai viết lùi sang trái một cột rồi cộng.' : 'Nhân từ phải sang trái, nhớ sang hàng bên trái.')
            : (b >= 10 ? 'Chia từ trái sang phải; mỗi lượt ước lượng thương (làm tròn số chia), nhân rồi trừ.' : 'Chia từ trái sang phải: chia, nhân, trừ, hạ.');
      if (k === 0) return Q(`Đặt tính rồi tính:\n${expr}`, colV, num(r), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, r, [wrong, r + (op === ':' ? 1 : 10), r - (op === ':' ? 1 : 100), r + 1000].filter(x => x > 0)), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const T = op === '+' ? ADD_T : op === M ? SUB_T : op === '×' ? MUL_T : DIV_T;
        const p = P(rng, T)(a, b);
        let tape;
        if (op === '+') tape = vz('tape', { bars: [{ label: '', units: units(a, Math.max(a, b)), value: F(a) }, { label: '', units: units(b, Math.max(a, b)), value: F(b) }], total: '?' });
        else if (op === M) tape = vz('tape', { bars: [{ label: '', units: 12, value: F(a) }, { label: '', units: units(b, a), value: F(b) }], diff: '?' });
        else if (op === '×') tape = vz('tape', { bars: [{ label: '', parts: Math.min(b, 10), units: Math.min(b, 10), value: `${F(a)} × ${b}` }], total: '?' });
        else tape = vz('tape', { bars: [{ label: '', parts: Math.min(b, 10), units: Math.min(b, 10), value: '?' }], total: F(a) });
        return Q(p, tape, num(r), op === '+' ? 'Tìm tất cả thì cộng.' : op === M ? 'Tìm phần còn lại (hoặc phần hơn) thì trừ.' : op === '×' ? 'Nhiều nhóm bằng nhau thì nhân.' : 'Chia đều thì làm phép chia.', `${expr} = ${F(r)}.`);
      }
      if (k === 3) {
        const c = Math.max(0, r + P(rng, [-10, -1, 0, 1, 100, 1000]));
        return Q(`So sánh: ${expr} … ${F(c)}`, vz('compare', { left: expr, right: F(c) }), cmpAns(r, c), 'Tính kết quả rồi so sánh.', `${expr} = ${F(r)}; ${F(r)} ${sign(r, c)} ${F(c)}.`);
      }
      if (wrong !== r) {
        const who = nm(rng);
        return Q(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, colV, num(r), op === '×' && b >= 10 ? 'Tích riêng thứ hai phải viết lùi sang trái một cột.' : 'Làm lại từng bước, chú ý phần nhớ và chữ số 0.', `${expr} = ${F(r)}.`, { hintVisual: colH });
      }
      if (op === '+') return Q(`Tìm ?:\n? + ${F(b)} = ${F(r)}`, null, num(a), 'Số hạng = tổng − số hạng kia.', `${F(r)} ${M} ${F(b)} = ${F(a)}.`);
      if (op === M) return Q(`Tìm ?:\n${F(a)} ${M} ? = ${F(r)}`, null, num(b), 'Số trừ = số bị trừ − hiệu.', `${F(a)} ${M} ${F(r)} = ${F(b)}.`);
      if (op === '×') return Q(`Tìm ?:\n? × ${b} = ${F(r)}`, null, num(a), 'Thừa số = tích : thừa số kia.', `${F(r)} : ${b} = ${F(a)}.`);
      return Q(`Tìm ?:\n? : ${b} = ${F(r)}`, null, num(a), 'Số bị chia = thương × số chia.', `${F(r)} × ${b} = ${F(a)}.`);
    };
    // gen: practice (form by i % 5). exam: level 1 = đặt tính rồi tính, level 2–3 = bài toán có lời văn.
    const gen = (rng, i) => at(rng, lv(i), i % 5);
    gen.exam = (rng, level) => (level === 1 ? at(rng, 1, 0) : at(rng, level === 2 ? 1 : 2, 2));
    return gen;
  }

  function bigNumberGen(lo, hi) {
    return function (rng, i) {
      const n = R(rng, lo, hi), s = String(n), f = i % 5;
      if (f === 0) return Q(`Số "${readVN(n)}" viết là:`, null, num(n), 'Viết theo từng lớp, mỗi lớp 3 chữ số; lớp nào thiếu thì viết chữ số 0.', `"${readVN(n)}" viết là ${F(n)}.`);
      if (f === 1) { const alt = [n + Math.pow(10, R(rng, 1, 3)), n - Math.pow(10, R(rng, 0, 2)), Number(s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1))].filter(x => x >= lo && x <= hi && x !== n); return Q(`Số ${F(n)} đọc là:`, vz('placeValue', { number: n, columns: colsFor(n) }), ch(rng, readVN(n), alt.map(readVN)), 'Tách số thành từng lớp rồi đọc từ trái sang phải.', `${F(n)} đọc là "${readVN(n)}".`); }
      if (f === 2) { const pos = R(rng, 0, s.length - 1), d = Number(s[pos]), place = s.length - 1 - pos; const val = d * Math.pow(10, place); return Q(`Trong số ${F(n)}, chữ số ${d} ở hàng ${PLACES[place]} có giá trị là bao nhiêu?`, vz('placeValue', { number: n, columns: colsFor(n) }), num(val), `Giá trị = chữ số × giá trị của hàng.`, `Chữ số ${d} ở hàng ${PLACES[place]} có giá trị ${F(val)}.`); }
      if (f === 3) { const e = expand(n); return Q(`Viết số ${F(n)} thành tổng theo các hàng:`, null, ch(rng, e.map(F).join(' + '), [e.map((x, j) => F(j === 0 ? x / 10 : x)).join(' + '), expand(n + Math.pow(10, R(rng, 1, 3))).map(F).join(' + '), e.map((x, j) => F(j === e.length - 1 ? x * 10 : x)).join(' + ')]), 'Mỗi chữ số nhân với giá trị của hàng.', `${F(n)} = ${e.map(F).join(' + ')}.`); }
      const pos = R(rng, 0, s.length - 1), place = s.length - 1 - pos;
      return Q(`Chữ số ${s[pos]} trong số ${F(n)} thuộc hàng nào, lớp nào?`, vz('placeValue', { number: n, columns: colsFor(n) }), ch(rng, `Hàng ${PLACES[place]}, ${CLASSES[Math.floor(place / 3)]}`, [place + 1 < s.length ? `Hàng ${PLACES[place + 1]}, ${CLASSES[Math.floor((place + 1) / 3)]}` : `Hàng ${PLACES[place - 1]}, ${CLASSES[Math.floor((place - 1) / 3)]}`, `Hàng ${PLACES[place]}, ${CLASSES[(Math.floor(place / 3) + 1) % 3]}`, place > 0 ? `Hàng ${PLACES[place - 1]}, ${CLASSES[Math.floor((place - 1) / 3)]}` : `Hàng ${PLACES[place + 2]}, ${CLASSES[Math.floor((place + 2) / 3)]}`]), 'Lớp đơn vị gồm hàng đơn vị, chục, trăm; lớp nghìn gồm nghìn, chục nghìn, trăm nghìn; lớp triệu gồm triệu, chục triệu, trăm triệu.', `Chữ số ${s[pos]} thuộc hàng ${PLACES[place]}, ${CLASSES[Math.floor(place / 3)]}.`);
    };
  }

  // Fractions helpers
  const fv = (n, d, shape) => vz('fraction', { num: n, den: d, shape: shape || 'bar' });

  // ============ CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG ============
  const c1 = {
    id: 'g4-c1', semester: 1, title: 'Ôn tập và bổ sung', icon: '🔢', lessons: [
      lesson(1, 1, 'Ôn tập các số đến 100 000',
        'Rô-bốt ISA cùng bạn An đọc số khán giả đến xem lễ hội hoa Đà Lạt.',
        [
          { text: 'Số 47 205 gồm 4 chục nghìn, 7 nghìn, 2 trăm, 0 chục, 5 đơn vị; đọc là "bốn mươi bảy nghìn hai trăm linh năm".', visual: vz('placeValue', { number: 47205, columns: colsFor(47205) }) },
          { text: 'So sánh 47 205 và 47 520: cùng 47 nghìn, hàng trăm 2 < 5, nên 47 205 < 47 520.', visual: vz('compare', { left: F(47205), right: F(47520) }) },
        ],
        function (rng, i) {
          if (i % 3 === 2) {
            const a = R(rng, 10000, 99999); let b = Math.floor(a / 1000) * 1000 + R(rng, 0, 999);
            return Q(`So sánh: ${F(a)} … ${F(b)}`, vz('compare', { left: F(a), right: F(b) }), cmpAns(a, b), 'So sánh từng hàng từ trái sang phải.', `${F(a)} ${sign(a, b)} ${F(b)}.`);
          }
          return bigNumberGen(10000, 99999)(rng, i);
        }),
      lesson(1, 2, 'Ôn tập các phép tính trong phạm vi 100 000',
        'Rô-bốt ISA giúp cửa hàng của bố bạn Bình tính tiền hàng cuối tuần.',
        [
          { text: 'Cộng, trừ: đặt tính thẳng cột, tính từ phải sang trái.', visual: vz('columnCalc', { a: 45672, b: 28519, op: '+', reveal: 'all' }) },
          { text: 'Nhân, chia với số có một chữ số: 12 035 × 4 = 48 140; 48 140 : 4 = 12 035.', visual: vz('columnCalc', { a: 12035, b: 4, op: '×', reveal: 'all' }) },
        ],
        mixCol([
          ['+', (r) => pairWhere(r, [10000, 60000], [1000, 39000], (a, b) => a + b <= 99999, [45672, 28519])],
          [M, (r) => pairWhere(r, [20000, 99999], [1000, 19999], (a, b) => a > b, [73120, 28519])],
          ['×', (r) => pairWhere(r, [1000, 24999], [2, 9], (a, b) => a * b <= 99999, [12035, 4])],
          [':', (r) => pairWhere(r, [10000, 99999], [2, 9], (a, b) => a % b === 0, [48140, 4])],
        ])),
      lesson(1, 3, 'Số chẵn, số lẻ',
        'Rô-bốt ISA xếp hàng đôi cho các bạn đi tham quan bảo tàng.',
        [
          { text: 'Số chẵn là số có chữ số tận cùng là 0, 2, 4, 6, 8. Số lẻ có chữ số tận cùng là 1, 3, 5, 7, 9.', visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1, marks: [0, 2, 4, 6, 8, 10] }) },
          { text: 'Xếp thành từng đôi: số chẵn thì vừa đủ đôi, số lẻ thì thừa 1.', visual: vz('array', { rows: 2, cols: 4, emoji: '🧒' }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const n = R(rng, 10, lv(i) === 0 ? 99 : 99999); const ev = n % 2 === 0; return Q(`Số ${F(n)} là số chẵn hay số lẻ?`, null, ch(rng, ev ? 'Số chẵn' : 'Số lẻ', [ev ? 'Số lẻ' : 'Số chẵn']), 'Nhìn chữ số tận cùng.', `${F(n)} có chữ số tận cùng là ${n % 10} nên là số ${ev ? 'chẵn' : 'lẻ'}.`); }
          if (f === 1) { const want = R(rng, 0, 1); const arr = []; while (arr.length < 3) { const x = R(rng, 100, 999); if (x % 2 !== want && !arr.includes(x)) arr.push(x); } let c; do c = R(rng, 100, 999); while (c % 2 !== want); return Q(`Số nào là số ${want ? 'lẻ' : 'chẵn'}?`, null, ch(rng, c, arr), `Số ${want ? 'lẻ' : 'chẵn'} có chữ số tận cùng là ${want ? '1, 3, 5, 7, 9' : '0, 2, 4, 6, 8'}.`, `${c} là số ${want ? 'lẻ' : 'chẵn'}.`); }
          if (f === 2) { const a = R(rng, 1, 40) * 2, b = a + R(rng, 3, 10) * 2; const cnt = (b - a) / 2 + 1; return Q(`Có bao nhiêu số chẵn từ ${a} đến ${b}?`, b - a <= 20 ? vz('numberLine', { min: a, max: b, step: 1, labelEvery: 2 }) : null, num(cnt), 'Hai số chẵn liên tiếp hơn kém nhau 2 đơn vị.', `(${b} ${M} ${a}) : 2 + 1 = ${cnt} (số).`); }
          const n = R(rng, 10, 9998); const ev = R(rng, 0, 1);
          const nx = ev ? (n % 2 === 0 ? n + 2 : n + 1) : (n % 2 === 1 ? n + 2 : n + 1);
          return Q(`Số ${ev ? 'chẵn' : 'lẻ'} liền sau số ${F(n)} là số nào?`, null, num(nx), `Hai số ${ev ? 'chẵn' : 'lẻ'} liên tiếp hơn kém nhau 2.`, `Số ${ev ? 'chẵn' : 'lẻ'} liền sau ${F(n)} là ${F(nx)}.`);
        }),
      lesson(1, 4, 'Biểu thức chứa chữ',
        'Rô-bốt ISA dùng chữ a để thay cho cạnh của những viên gạch hoa vuông.',
        [
          { text: 'a + 15 là biểu thức chứa chữ. Nếu a = 7 thì a + 15 = 7 + 15 = 22.' },
          { text: 'Chu vi hình vuông cạnh a: P = a × 4. Với a = 5 cm thì P = 5 × 4 = 20 (cm).', visual: vz('shape', { kind: 'square', dims: { a: 5 }, showDims: true }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 10, 500), b = R(rng, 10, 500), op = P(rng, ['+', M, '×']); const bb = op === '×' ? R(rng, 2, 9) : op === M ? R(rng, 1, a) : b; const v = opRes(a, op, bb); return Q(`Tính giá trị của biểu thức ${op === M ? `a ${M} ${bb}` : op === '×' ? `a × ${bb}` : `a + ${bb}`} với a = ${a}.`, null, num(v), 'Thay chữ bằng số rồi tính.', `Với a = ${a}: ${a} ${op} ${bb} = ${F(v)}.`); }
          if (f === 1) { const a = R(rng, 2, 50); return Q(`Chu vi hình vuông cạnh a là P = a × 4. Tính P với a = ${a} cm.`, vz('shape', { kind: 'square', dims: { a }, showDims: true }), num(a * 4, 'cm'), 'Thay a bằng số đo cạnh.', `P = ${a} × 4 = ${a * 4} (cm).`); }
          if (f === 2) { const a = R(rng, 10, 99), b = R(rng, 2, 9), c = R(rng, 10, 99); return Q(`Tính giá trị của biểu thức a × b + c với a = ${a}, b = ${b}, c = ${c}.`, null, num(a * b + c), 'Thay chữ bằng số, nhân trước cộng sau.', `${a} × ${b} + ${c} = ${a * b} + ${c} = ${a * b + c}.`); }
          const a = R(rng, 5, 40), b = R(rng, 2, a - 1);
          return Q(`Chu vi hình chữ nhật: P = (a + b) × 2. Tính P với a = ${a} cm, b = ${b} cm.`, vz('shape', { kind: 'rect', dims: { a, b }, showDims: true }), num((a + b) * 2, 'cm'), 'Tính trong ngoặc trước.', `P = (${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`);
        }),
      lesson(1, 5, 'Giải bài toán có ba bước tính',
        'Rô-bốt ISA giúp các bạn lớp 4A tính tiền mua quà tặng thầy cô ngày 20 tháng 11.',
        [
          { text: 'Đọc đề, tóm tắt, rồi tìm lần lượt từng bước. Mỗi bước trả lời một câu hỏi nhỏ.', visual: vz('tape', { bars: [{ label: 'Lớp 4A', units: 5, value: '35' }, { label: 'Lớp 4B', units: 6, value: '?' }], diff: '5', total: '?' }) },
        ],
        function (rng, i) {
          const t = i % 4;
          if (t === 0) { const p = R(rng, 5, 20) * 1000, n = R(rng, 2, 5), q = R(rng, 2, 9) * 1000, m = R(rng, 2, 4); const tot = p * n + q * m, pay = Math.ceil(tot / 100000) * 100000 === tot ? tot + 100000 : Math.ceil(tot / 100000) * 100000; return Q(`Mẹ mua ${n} kg thịt, mỗi ki-lô-gam giá ${F(p)} đồng và ${m} bó rau, mỗi bó giá ${F(q)} đồng. Mẹ đưa ${F(pay)} đồng. Hỏi người bán trả lại mẹ bao nhiêu tiền?`, null, num(pay - tot, 'đồng'), 'Bước 1: tiền thịt; bước 2: tiền rau; bước 3: tiền trả lại.', `Tiền thịt: ${F(p)} × ${n} = ${F(p * n)}; tiền rau: ${F(q)} × ${m} = ${F(q * m)}; trả lại: ${F(pay)} ${M} ${F(tot)} = ${F(pay - tot)} (đồng).`); }
          if (t === 1) { const a = R(rng, 30, 45), d = R(rng, 2, 8), c = R(rng, 3, 9); return Q(`Lớp 4A có ${a} học sinh, lớp 4B nhiều hơn lớp 4A ${d} học sinh, lớp 4C ít hơn lớp 4B ${c} học sinh. Hỏi cả ba lớp có bao nhiêu học sinh?`, vz('tape', { bars: [{ label: '4A', units: units(a, a + d), value: String(a) }, { label: '4B', units: units(a + d, a + d), value: '?' }, { label: '4C', units: units(a + d - c, a + d), value: '?' }], total: '?' }), num(a + (a + d) + (a + d - c)), 'Tìm số học sinh lớp 4B, rồi lớp 4C, rồi cả ba lớp.', `4B: ${a} + ${d} = ${a + d}; 4C: ${a + d} ${M} ${c} = ${a + d - c}; cả ba lớp: ${a} + ${a + d} + ${a + d - c} = ${3 * a + 2 * d - c} (học sinh).`); }
          if (t === 2) { const per = R(rng, 12, 30), n1 = R(rng, 3, 8), n2 = R(rng, 2, 6), sold = R(rng, 10, per * (n1 + n2) - 1); return Q(`Cửa hàng nhập ${n1} thùng táo và ${n2} thùng cam, mỗi thùng có ${per} kg. Cửa hàng đã bán ${sold} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam hoa quả?`, null, num(per * (n1 + n2) - sold, 'kg'), 'Bước 1: số thùng; bước 2: số ki-lô-gam; bước 3: số còn lại.', `${n1} + ${n2} = ${n1 + n2} (thùng); ${per} × ${n1 + n2} = ${per * (n1 + n2)} (kg); ${per * (n1 + n2)} ${M} ${sold} = ${per * (n1 + n2) - sold} (kg).`); }
          const a = R(rng, 20, 60), k = R(rng, 2, 4), d = R(rng, 5, 15);
          return Q(`Ngày thứ nhất đội trồng được ${a} cây. Ngày thứ hai trồng được gấp ${k} lần ngày thứ nhất. Ngày thứ ba trồng ít hơn ngày thứ hai ${d} cây. Hỏi cả ba ngày trồng được bao nhiêu cây?`, null, num(a + a * k + a * k - d), 'Tìm số cây ngày thứ hai, ngày thứ ba, rồi cộng cả ba ngày.', `Ngày 2: ${a} × ${k} = ${a * k}; ngày 3: ${a * k} ${M} ${d} = ${a * k - d}; cả ba ngày: ${a} + ${a * k} + ${a * k - d} = ${a + 2 * a * k - d} (cây).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 2. GÓC VÀ ĐƠN VỊ ĐO GÓC ============
  const angleKind = d => (d < 90 ? 'Góc nhọn' : d === 90 ? 'Góc vuông' : d < 180 ? 'Góc tù' : 'Góc bẹt');
  const c2 = {
    id: 'g4-c2', semester: 1, title: 'Góc và đơn vị đo góc', icon: '📐', lessons: [
      lesson(2, 7, 'Đo góc, đơn vị đo góc',
        'Rô-bốt ISA dùng thước đo góc kiểm tra độ mở của chiếc quạt giấy.',
        [
          { text: 'Đơn vị đo góc là độ, kí hiệu °. Dùng thước đo góc: đặt tâm thước trùng đỉnh góc, một cạnh trùng vạch 0.', visual: vz('angle', { deg: 60, protractor: true }) },
          { text: 'Góc vuông có số đo 90°.', visual: vz('angle', { deg: 90, protractor: true }) },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const d = R(rng, 1, 17) * 10; return Q('Góc dưới đây có số đo bao nhiêu độ?', vz('angle', { deg: d, protractor: true }), num(d, '°'), 'Đọc số trên thước đo góc tại cạnh thứ hai, tính từ vạch 0.', `Góc có số đo ${d}°.`); }
          if (f === 1) { const a = R(rng, 2, 8) * 10, b = R(rng, 1, 17 - a / 10) * 10; return Q(`Góc thứ nhất ${a}°, góc thứ hai ${b}°. Góc nào lớn hơn, lớn hơn bao nhiêu độ?`, vz('angle', { deg: Math.max(a, b), protractor: true }), a === b ? ch(rng, 'Hai góc bằng nhau', ['Góc thứ nhất, 10°', 'Góc thứ hai, 10°']) : ch(rng, `${a > b ? 'Góc thứ nhất' : 'Góc thứ hai'}, ${Math.abs(a - b)}°`, [`${a > b ? 'Góc thứ hai' : 'Góc thứ nhất'}, ${Math.abs(a - b)}°`, `${a > b ? 'Góc thứ nhất' : 'Góc thứ hai'}, ${a + b}°`]), 'So sánh hai số đo rồi trừ.', a === b ? 'Hai góc bằng nhau.' : `${Math.max(a, b)}° ${M} ${Math.min(a, b)}° = ${Math.abs(a - b)}°.`); }
          const d = R(rng, 1, 8) * 10;
          return Q(`Một góc vuông được chia thành hai góc, một góc ${d}°. Góc còn lại bao nhiêu độ?`, vz('angle', { deg: 90, protractor: true }), num(90 - d, '°'), 'Góc vuông có số đo 90°.', `90° ${M} ${d}° = ${90 - d}°.`);
        }),
      lesson(2, 8, 'Góc nhọn, góc tù, góc bẹt',
        'Rô-bốt ISA quan sát hai kim đồng hồ tạo thành những góc khác nhau.',
        [
          { text: 'Góc nhọn bé hơn góc vuông (dưới 90°).', visual: vz('angle', { deg: 45 }) },
          { text: 'Góc tù lớn hơn góc vuông nhưng bé hơn góc bẹt.', visual: vz('angle', { deg: 130 }) },
          { text: 'Góc bẹt bằng hai góc vuông (180°).', visual: vz('angle', { deg: 180 }) },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const d = P(rng, [30, 45, 60, 75, 90, 110, 120, 135, 150, 180]); return Q('Góc dưới đây là góc gì?', vz('angle', { deg: d }), ch(rng, angleKind(d), ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt']), 'So sánh góc với góc vuông (dùng ê ke).', `Góc ${d}° là ${angleKind(d).toLowerCase()}.`); }
          if (f === 1) { const d = R(rng, 1, 17) * 10; return Q(`Góc có số đo ${d}° là góc gì?`, null, ch(rng, angleKind(d), ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt']), 'Nhọn < 90° = vuông < tù < 180° = bẹt.', `${d}° là ${angleKind(d).toLowerCase()}.`); }
          const [h, d, k] = P(rng, [[3, 90, 'Góc vuông'], [6, 180, 'Góc bẹt'], [2, 60, 'Góc nhọn'], [4, 120, 'Góc tù'], [1, 30, 'Góc nhọn'], [5, 150, 'Góc tù']]);
          return Q(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc gì?`, vz('clock', { h, m: 0 }), ch(rng, k, ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt']), 'Mỗi khoảng giữa hai số liền nhau trên mặt đồng hồ là 30°.', `${h} × 30° = ${d}°: ${k.toLowerCase()}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. SỐ CÓ NHIỀU CHỮ SỐ ============
  const c3 = {
    id: 'g4-c3', semester: 1, title: 'Số có nhiều chữ số', icon: '🔢', lessons: [
      lesson(3, 10, 'Số có sáu chữ số. Số 1 000 000',
        'Rô-bốt ISA cùng bạn Chi đọc số lượt khách đến thăm Vịnh Hạ Long.',
        [
          { text: 'Số 352 418 gồm 3 trăm nghìn, 5 chục nghìn, 2 nghìn, 4 trăm, 1 chục, 8 đơn vị; đọc là "ba trăm năm mươi hai nghìn bốn trăm mười tám".', visual: vz('placeValue', { number: 352418, columns: colsFor(352418) }) },
          { text: '10 trăm nghìn = 1 000 000 (một triệu).' },
        ],
        bigNumberGen(100000, 999999)),
      lesson(3, 11, 'Hàng và lớp',
        'Rô-bốt ISA xếp các chữ số vào từng "ngôi nhà" hàng và lớp cho bạn Dũng.',
        [
          { text: 'Lớp đơn vị: hàng đơn vị, chục, trăm. Lớp nghìn: hàng nghìn, chục nghìn, trăm nghìn.', visual: vz('placeValue', { number: 653720, columns: colsFor(653720) }) },
          { text: 'Trong số 653 720, chữ số 5 ở hàng chục nghìn, lớp nghìn, có giá trị 50 000.' },
        ],
        bigNumberGen(100000, 999999)),
      lesson(3, 12, 'Các số trong phạm vi lớp triệu',
        'Rô-bốt ISA đọc số dân của các tỉnh thành trong sách Địa lí cùng bạn Hà.',
        [
          { text: 'Lớp triệu gồm hàng triệu, chục triệu, trăm triệu. Số 25 360 000 đọc là "hai mươi lăm triệu ba trăm sáu mươi nghìn".', visual: vz('placeValue', { number: 25360000, columns: colsFor(25360000) }) },
          { text: 'Đọc từ trái sang phải theo từng lớp: triệu – nghìn – đơn vị.' },
        ],
        bigNumberGen(1000000, 999999999)),
      lesson(3, 13, 'Làm tròn số đến hàng trăm nghìn',
        'Rô-bốt ISA ước lượng số người tham gia giải chạy vì cộng đồng.',
        [
          { text: 'Làm tròn 1 362 500 đến hàng trăm nghìn: chữ số hàng chục nghìn là 6 (≥ 5) nên làm tròn lên: 1 400 000.', visual: vz('numberLine', { min: 1300000, max: 1400000, step: 10000, labelEvery: 10, point: 1362500 }) },
          { text: 'Chữ số ngay sau hàng cần làm tròn bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.' },
        ],
        function (rng, i) {
          const opts = [[100000, 'hàng trăm nghìn'], [10000, 'hàng chục nghìn'], [1000, 'hàng nghìn']];
          const [p, name] = lv(i) === 0 ? opts[0] : P(rng, opts);
          let n = R(rng, 100001, 9999999); if (n % p === 0) n += R(rng, 1, p - 1);
          const r = roundTo(n, p), lo = Math.floor(n / p) * p, f = i % 3;
          if (f === 0) return Q(`Làm tròn số ${F(n)} đến ${name}.`, vz('numberLine', { min: lo, max: lo + p, step: p / 10, labelEvery: 10, point: n }), num(r), 'Xét chữ số ngay sau hàng làm tròn.', `${F(n)} làm tròn đến ${name} được ${F(r)}.`);
          if (f === 1) return Q(`Làm tròn số ${F(n)} đến ${name} ta được:`, null, ch(rng, F(r), [r === lo ? lo + p : lo, r + p, Math.max(p, r - 2 * p), roundTo(n, p * 10)].filter(x => x !== r).map(x => F(x))), 'Xét chữ số ngay sau hàng làm tròn.', `${F(r)}.`);
          const pop = R(rng, 10, 99) * 100000 + R(rng, 1, 99999);
          return Q(`Một tỉnh có ${F(pop)} người. Làm tròn số dân đến hàng trăm nghìn thì được khoảng bao nhiêu người?`, null, num(roundTo(pop, 100000)), 'Xét chữ số hàng chục nghìn.', `Khoảng ${F(roundTo(pop, 100000))} người.`);
        }),
      lesson(3, 14, 'So sánh các số có nhiều chữ số',
        'Rô-bốt ISA so sánh diện tích các quốc gia trên quả địa cầu cùng bạn Nam.',
        [
          { text: 'Số nào có nhiều chữ số hơn thì lớn hơn: 1 000 000 > 999 999.' },
          { text: 'Cùng số chữ số: so sánh từng cặp chữ số từ trái sang phải. 693 251 < 693 512.', visual: vz('compare', { left: F(693251), right: F(693512) }) },
        ],
        function (rng, i) {
          const f = i % 3, L = lv(i);
          if (f === 0) {
            const a = R(rng, 100000, 99999999); let b;
            if (L === 0) b = R(rng, 100000, 99999999); else { const p = Math.pow(10, R(rng, 1, String(a).length - 2)); b = Math.floor(a / (p * 10)) * p * 10 + R(rng, 0, p * 10 - 1); }
            if (R(rng, 0, 6) === 0) b = a;
            return Q(`So sánh: ${F(a)} … ${F(b)}`, vz('compare', { left: F(a), right: F(b) }), cmpAns(a, b), 'Đếm số chữ số trước; bằng nhau thì so sánh từ trái sang phải.', `${F(a)} ${sign(a, b)} ${F(b)}.`);
          }
          const base = R(rng, 100000, 9000000);
          const arr = []; while (arr.length < 4) { const x = base + R(rng, 0, 999999); if (!arr.includes(x)) arr.push(x); }
          const asc = arr.slice().sort((x, y) => x - y), s = a => a.map(F).join('; ');
          if (f === 1) { const big = R(rng, 0, 1), v = big ? asc[3] : asc[0]; return Q(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${s(arr)} là:`, null, ch(rng, F(v), arr.map(F)), 'So sánh từng hàng từ trái sang phải.', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${F(v)}.`); }
          return Q(`Sắp xếp các số ${s(arr)} theo thứ tự từ lớn đến bé:`, null, ch(rng, s(asc.slice().reverse()), [s(asc), s(arr), s([asc[3], asc[1], asc[2], asc[0]])]), 'Tìm số lớn nhất trước.', `${s(asc.slice().reverse())}.`);
        }),
      lesson(3, 15, 'Làm quen với dãy số tự nhiên',
        'Rô-bốt ISA đếm tiếp các số tự nhiên trên tia số dài mãi không có điểm cuối.',
        [
          { text: 'Các số 0, 1, 2, 3, … là các số tự nhiên. Số 0 là số tự nhiên bé nhất; không có số tự nhiên lớn nhất.', visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1 }) },
          { text: 'Hai số tự nhiên liên tiếp hơn (kém) nhau 1 đơn vị.' },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const n = R(rng, 1000, 9999999), nx = R(rng, 0, 1); return Q(`Số liền ${nx ? 'sau' : 'trước'} của ${F(n)} là:`, null, num(nx ? n + 1 : n - 1), `Số liền ${nx ? 'sau thêm' : 'trước bớt'} 1.`, `${F(n)} ${nx ? '+' : M} 1 = ${F(nx ? n + 1 : n - 1)}.`); }
          if (f === 1) { const [p, c, d] = P(rng, [['Số tự nhiên bé nhất là:', '0', ['1', '10', 'Không có']], ['Số tự nhiên lớn nhất là:', 'Không có', ['999 999 999', '1 000 000 000', '0']], ['Hai số tự nhiên liên tiếp hơn kém nhau:', '1 đơn vị', ['2 đơn vị', '10 đơn vị', '0 đơn vị']]]); return Q(p, null, ch(rng, c, d), 'Nhớ đặc điểm của dãy số tự nhiên.', `Đáp án: ${c}.`); }
          if (f === 2) { const st = R(rng, 2, 9), a = R(rng, 0, 50); const seq = [0, 1, 2, 3, 4].map(k => a + k * st); const miss = R(rng, 2, 4); return Q(`Tìm số thích hợp ở ô ?:\n${seq.map((v, k) => (k === miss ? '?' : F(v))).join('; ')}`, null, num(seq[miss]), 'Tìm quy luật: mỗi số hơn số liền trước bao nhiêu?', `Mỗi số hơn số liền trước ${st} đơn vị: ${F(seq[miss])}.`); }
          const a = R(rng, 10, 500), b = a + R(rng, 5, 40);
          return Q(`Có bao nhiêu số tự nhiên từ ${a} đến ${b}?`, null, num(b - a + 1), 'Lấy số cuối trừ số đầu rồi cộng 1.', `${b} ${M} ${a} + 1 = ${b - a + 1} (số).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. MỘT SỐ ĐƠN VỊ ĐO ĐẠI LƯỢNG ============
  const centuryOf = y => Math.floor((y - 1) / 100) + 1;
  const c4 = {
    id: 'g4-c4', semester: 1, title: 'Một số đơn vị đo đại lượng', icon: '⚖️', lessons: [
      lesson(4, 17, 'Yến, tạ, tấn',
        'Rô-bốt ISA theo bác nông dân bạn Phúc đi cân những bao thóc sau mùa gặt.',
        [
          { text: '1 yến = 10 kg; 1 tạ = 10 yến = 100 kg; 1 tấn = 10 tạ = 1000 kg.', visual: vz('scale', { left: [{ label: '🌾 1 yến', kg: 10 }], right: [{ label: '5 kg', kg: 5 }, { label: '5 kg', kg: 5 }] }) },
          { text: 'Con voi nặng khoảng 5 tấn; con lợn nặng khoảng 1 tạ.' },
        ],
        function (rng, i) {
          const f = i % 4, a = R(rng, 2, 9);
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} yến = ? kg`, a * 10, 'kg'], [`${a} tạ = ? kg`, a * 100, 'kg'], [`${a} tấn = ? kg`, a * 1000, 'kg'], [`${a} tấn = ? tạ`, a * 10, 'tạ'], [`${a * 10} yến = ? tạ`, a, 'tạ'], [`${a} tạ ${a} kg = ? kg`, a * 101, 'kg']]); return Q(p, null, num(v, u), '1 yến = 10 kg; 1 tạ = 100 kg; 1 tấn = 1000 kg.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const x = R(rng, 1, 9), y = x * 100 + P(rng, [-50, 0, 30]); return Q(`So sánh: ${x} tạ … ${y} kg`, vz('compare', { left: `${x} tạ`, right: `${y} kg` }), cmpAns(x * 100, y), 'Đổi về cùng đơn vị ki-lô-gam.', `${x} tạ = ${x * 100} kg; ${x * 100} ${sign(x * 100, y)} ${y}.`); }
          if (f === 2) { const t = R(rng, 2, 6), q = R(rng, 1, 9); return Q(`Một xe tải chở ${t} tấn gạo, một xe khác chở ${q} tạ gạo. Cả hai xe chở bao nhiêu tạ gạo?`, null, num(t * 10 + q, 'tạ'), 'Đổi tấn ra tạ: 1 tấn = 10 tạ.', `${t} tấn = ${t * 10} tạ; ${t * 10} + ${q} = ${t * 10 + q} (tạ).`); }
          const [p, u] = P(rng, [['Con voi nặng khoảng 5 …', 'tấn'], ['Con lợn nặng khoảng 1 …', 'tạ'], ['Bao gạo nặng khoảng 5 …', 'yến'], ['Quả trứng gà nặng khoảng 50 …', 'g']]);
          return Q(`Chọn đơn vị thích hợp:\n${p}`, null, ch(rng, u, ['tấn', 'tạ', 'yến', 'kg', 'g'].filter(x => x !== u)), 'Hình dung khối lượng thật.', `${p.replace('…', u)}.`);
        }),
      lesson(4, 18, 'Đề-xi-mét vuông, mét vuông, mi-li-mét vuông',
        'Rô-bốt ISA đo diện tích bảng lớp và mặt bàn học cùng bạn Lan.',
        [
          { text: '1 dm² là diện tích hình vuông cạnh 1 dm. 1 dm² = 100 cm².', visual: vz('areaGrid', { w: 10, h: 10, unit: 'cm', fill: true }) },
          { text: '1 m² = 100 dm²; 1 cm² = 100 mm².' },
        ],
        function (rng, i) {
          const f = i % 3, a = R(rng, 2, 9);
          if (f === 0) { const [p, v, u] = P(rng, [[`${a} dm² = ? cm²`, a * 100, 'cm²'], [`${a} m² = ? dm²`, a * 100, 'dm²'], [`${a} cm² = ? mm²`, a * 100, 'mm²'], [`${a * 100} cm² = ? dm²`, a, 'dm²'], [`${a} m² = ? cm²`, a * 10000, 'cm²']]); return Q(p, null, num(v, u), '1 m² = 100 dm²; 1 dm² = 100 cm²; 1 cm² = 100 mm².', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const w = R(rng, 2, 9), h = R(rng, 2, 9); return Q(`Một tấm bảng hình chữ nhật dài ${w} m, rộng ${h} dm. Tính diện tích tấm bảng theo đề-xi-mét vuông.`, vz('shape', { kind: 'rect', dims: { a: w * 10, b: h }, showDims: true }), num(w * 10 * h, 'dm²'), 'Đổi chiều dài ra đề-xi-mét.', `${w} m = ${w * 10} dm; ${w * 10} × ${h} = ${w * 10 * h} (dm²).`); }
          const [p, u] = P(rng, [['Diện tích phòng học khoảng 50 …', 'm²'], ['Diện tích một trang vở khoảng 4 …', 'dm²'], ['Diện tích con tem khoảng 6 …', 'cm²'], ['Diện tích mặt chiếc cúc áo khoảng 100 …', 'mm²']]);
          return Q(`Chọn đơn vị thích hợp:\n${p}`, null, ch(rng, u, ['m²', 'dm²', 'cm²', 'mm²'].filter(x => x !== u)), 'Hình dung độ lớn thật.', `${p.replace('…', u)}.`);
        }),
      lesson(4, 19, 'Giây, thế kỉ',
        'Rô-bốt ISA bấm đồng hồ giây khi bạn Quân chạy thi ở hội khỏe Phù Đổng.',
        [
          { text: '1 phút = 60 giây. Kim giây quay một vòng hết 1 phút.', visual: vz('clock', { h: 10, m: 10 }) },
          { text: '1 thế kỉ = 100 năm. Từ năm 1 đến năm 100 là thế kỉ I; … từ năm 2001 đến năm 2100 là thế kỉ XXI.' },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 2, 9); const [p, v, u] = P(rng, [[`${a} phút = ? giây`, a * 60, 'giây'], [`1 phút ${a * 5} giây = ? giây`, 60 + a * 5, 'giây'], [`${a} thế kỉ = ? năm`, a * 100, 'năm'], [`${a * 60} giây = ? phút`, a, 'phút']]); return Q(p, null, num(v, u), '1 phút = 60 giây; 1 thế kỉ = 100 năm.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const y = R(rng, 1001, 2100), c = centuryOf(y), cr = n => 'Thế kỉ ' + (n <= 20 ? toRoman(n) : 'XX' + toRoman(n - 20)); return Q(`Năm ${y} thuộc thế kỉ nào?`, null, ch(rng, cr(c), [cr(c + 1), cr(c - 1), cr(Math.floor(y / 100) === c ? c + 2 : Math.floor(y / 100))]), 'Năm có hai chữ số cuối là 00 thì thuộc thế kỉ bằng hai chữ số đầu; còn lại thì lấy hai chữ số đầu cộng 1.', `Năm ${y} thuộc ${cr(c).toLowerCase()} (${c}).`); }
          if (f === 2) { const [ev, y] = P(rng, [['Bác Hồ sinh năm 1890', 1890], ['Cách mạng tháng Tám thành công năm 1945', 1945], ['Năm 2026', 2026], ['Hai Bà Trưng khởi nghĩa năm 40', 40], ['Ngô Quyền chiến thắng Bạch Đằng năm 938', 938]]); const c = centuryOf(y); return Q(`${ev}. Năm đó thuộc thế kỉ thứ mấy?`, null, num(c), 'Thế kỉ thứ n gồm các năm từ (n − 1) × 100 + 1 đến n × 100.', `Năm ${y} thuộc thế kỉ ${c <= 20 ? toRoman(c) : 'XX' + toRoman(c - 20)} (thứ ${c}).`); }
          const a = R(rng, 50, 90), b = R(rng, 50, 90); const [x, y] = two(rng);
          return Q(`Bạn ${x} chạy 100 m hết ${a} giây, bạn ${y} chạy hết ${b} giây. Ai chạy nhanh hơn?`, null, a === b ? ch(rng, 'Hai bạn nhanh như nhau', [x, y]) : ch(rng, a < b ? x : y, [a < b ? y : x, 'Hai bạn nhanh như nhau']), 'Ai chạy hết ít thời gian hơn thì nhanh hơn.', a === b ? 'Hai bạn chạy hết thời gian bằng nhau.' : `${Math.min(a, b)} giây < ${Math.max(a, b)} giây nên ${a < b ? x : y} chạy nhanh hơn.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 5. PHÉP CỘNG VÀ PHÉP TRỪ ============
  const c5 = {
    id: 'g4-c5', semester: 1, title: 'Phép cộng và phép trừ', icon: '➕', lessons: [
      lesson(5, 22, 'Phép cộng các số có nhiều chữ số',
        'Rô-bốt ISA cộng số khách du lịch đến Huế trong hai tháng hè.',
        [{ text: '367 859 + 541 728 = 909 587. Đặt tính thẳng cột, cộng từ phải sang trái.', visual: vz('columnCalc', { a: 367859, b: 541728, op: '+', reveal: 'all' }) }],
        colGen('+', (r, L) => pairWhere(r, L === 0 ? [10000, 99999] : [100000, 6000000], L === 0 ? [1000, 99999] : [10000, 3000000], (a, b) => (L === 0 || !noCarry(a, b)), [367859, 541728]))),
      lesson(5, 23, 'Phép trừ các số có nhiều chữ số',
        'Rô-bốt ISA tính số tiền tiết kiệm còn lại của gia đình bạn Thảo.',
        [{ text: '865 279 − 450 237 = 415 042. Đặt tính thẳng cột, trừ từ phải sang trái.', visual: vz('columnCalc', { a: 865279, b: 450237, op: M, reveal: 'all' }) }],
        colGen(M, (r, L) => pairWhere(r, L === 0 ? [10000, 99999] : [100000, 9000000], L === 0 ? [1000, 9999] : [10000, 900000], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [865279, 450237]))),
      lesson(5, 24, 'Tính chất giao hoán và kết hợp của phép cộng',
        'Rô-bốt ISA chỉ cho bạn Tú cách nhóm số để cộng nhẩm thật nhanh.',
        [
          { text: 'Giao hoán: a + b = b + a. Đổi chỗ các số hạng thì tổng không thay đổi.' },
          { text: 'Kết hợp: (a + b) + c = a + (b + c). Nhóm các số tròn chục, tròn trăm để tính nhanh: 98 + 375 + 2 = 375 + (98 + 2) = 475.' },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 100, 9999), b = R(rng, 100, 9999); return Q(`Số thích hợp ở ô ?:\n${F(a)} + ${F(b)} = ${F(b)} + ?`, null, num(a), 'Tính chất giao hoán của phép cộng.', `${F(a)} + ${F(b)} = ${F(b)} + ${F(a)}.`); }
          if (f === 1) { const x = R(rng, 1, 9) * 10 + R(rng, 1, 9), y = 100 - x, z = R(rng, 100, 999); return Q(`Tính bằng cách thuận tiện:\n${x} + ${z} + ${y}`, null, num(x + y + z), `Nhóm ${x} với ${y} cho tròn trăm.`, `${x} + ${z} + ${y} = ${z} + (${x} + ${y}) = ${z} + 100 = ${z + 100}.`); }
          if (f === 2) { const a = R(rng, 100, 999), c = R(rng, 10, 99), bb = R(rng, 10, 99); return Q(`Số thích hợp ở ô ?:\n(${a} + ${bb}) + ${c} = ${a} + (? + ${c})`, null, num(bb), 'Tính chất kết hợp của phép cộng.', `(${a} + ${bb}) + ${c} = ${a} + (${bb} + ${c}).`); }
          const parts = [R(rng, 101, 499), R(rng, 101, 499)]; const comp = parts.map(p => Math.ceil(p / 100) * 100 - p).map((c, k) => (c === 0 ? 100 : c));
          const terms = U.shuffle(rng, [parts[0], comp[0], parts[1], comp[1]]); const s = terms.reduce((x, y) => x + y, 0);
          return Q(`Tính bằng cách thuận tiện:\n${terms.join(' + ')}`, null, num(s), 'Ghép các cặp số có tổng tròn trăm.', `(${parts[0]} + ${comp[0]}) + (${parts[1]} + ${comp[1]}) = ${parts[0] + comp[0]} + ${parts[1] + comp[1]} = ${s}.`);
        }),
      lesson(5, 25, 'Tìm hai số biết tổng và hiệu của hai số đó',
        'Rô-bốt ISA giúp bạn Việt tìm tuổi của bố và tuổi của mình qua một câu đố.',
        [
          { text: 'Vẽ sơ đồ: số lớn là đoạn dài, số bé là đoạn ngắn; tổng là cả hai đoạn, hiệu là phần dài hơn.', visual: vz('tape', { bars: [{ label: 'Số lớn', units: 8, value: '?' }, { label: 'Số bé', units: 5, value: '?' }], total: '70', diff: '16' }) },
          { text: 'Số bé = (Tổng − Hiệu) : 2. Số lớn = (Tổng + Hiệu) : 2. Ví dụ: (70 − 16) : 2 = 27; 27 + 16 = 43.' },
        ],
        function (rng, i) {
          const L = lv(i), b = R(rng, L === 0 ? 5 : 20, L === 0 ? 40 : 900), d = R(rng, 2, L === 0 ? 20 : 300) * 1, a = b + d, S = a + b;
          const tape = (la, lb, unit) => vz('tape', { bars: [{ label: la, units: units(a, a), value: '?' }, { label: lb, units: units(b, a), value: '?' }], total: F(S) + (unit || ''), diff: F(d) + (unit || '') });
          const t = i % 4;
          if (t === 0) return Q(`Tổng của hai số là ${F(S)}, hiệu của chúng là ${F(d)}. Tìm số lớn.`, tape('Số lớn', 'Số bé'), num(a), 'Số lớn = (Tổng + Hiệu) : 2.', `Số lớn: (${F(S)} + ${F(d)}) : 2 = ${F(a)}.`);
          if (t === 1) return Q(`Tổng của hai số là ${F(S)}, hiệu của chúng là ${F(d)}. Tìm số bé.`, tape('Số lớn', 'Số bé'), num(b), 'Số bé = (Tổng − Hiệu) : 2.', `Số bé: (${F(S)} ${M} ${F(d)}) : 2 = ${F(b)}.`);
          if (t === 2) { const c = R(rng, 6, 12), dd = R(rng, 22, 32); const f2 = c + dd; return Q(`Tuổi bố và tuổi con cộng lại được ${c + f2} tuổi. Bố hơn con ${dd} tuổi. Hỏi con bao nhiêu tuổi?`, vz('tape', { bars: [{ label: 'Bố', units: units(f2, f2), value: '?' }, { label: 'Con', units: units(c, f2), value: '?' }], total: (c + f2) + ' tuổi', diff: dd + ' tuổi' }), num(c, 'tuổi'), 'Tuổi con là số bé.', `Tuổi con: (${c + f2} ${M} ${dd}) : 2 = ${c} (tuổi). Tuổi bố: ${c} + ${dd} = ${f2} (tuổi).`); }
          const boys = R(rng, 12, 22), dg = R(rng, 1, 6), girls = boys + dg;
          return Q(`Lớp 4B có ${boys + girls} học sinh, số bạn nữ nhiều hơn số bạn nam ${dg} bạn. Hỏi lớp có bao nhiêu bạn nữ?`, vz('tape', { bars: [{ label: 'Nữ', units: units(girls, girls), value: '?' }, { label: 'Nam', units: units(boys, girls), value: '?' }], total: String(boys + girls), diff: String(dg) }), num(girls), 'Số bạn nữ là số lớn: (Tổng + Hiệu) : 2.', `Số bạn nữ: (${boys + girls} + ${dg}) : 2 = ${girls} (bạn).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. ĐƯỜNG THẲNG VUÔNG GÓC, ĐƯỜNG THẲNG SONG SONG ============
  const c6 = {
    id: 'g4-c6', semester: 1, title: 'Đường thẳng vuông góc, đường thẳng song song', icon: '📏', lessons: [
      lesson(6, 27, 'Hai đường thẳng vuông góc',
        'Rô-bốt ISA tìm các cạnh vuông góc trên khung cửa sổ lớp học.',
        [
          { text: 'Hai đường thẳng vuông góc tạo thành 4 góc vuông có chung đỉnh.', visual: vz('lines', { kind: 'perpendicular' }) },
          { text: 'Hình chữ nhật có các cặp cạnh liền nhau vuông góc với nhau.', visual: vz('shape', { kind: 'rect', label: 'ABCD' }) },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const k = P(rng, ['perpendicular', 'parallel', 'intersect']); const N = { perpendicular: 'Vuông góc', parallel: 'Song song', intersect: 'Cắt nhau nhưng không vuông góc' }; return Q('Hai đường thẳng dưới đây có quan hệ gì?', vz('lines', { kind: k }), ch(rng, N[k], Object.values(N)), 'Dùng ê ke kiểm tra góc tạo bởi hai đường thẳng.', `Hai đường thẳng ${N[k].toLowerCase()}.`); }
          if (f === 1) { const k = P(rng, ['rect', 'square']); return Q(`${k === 'rect' ? 'Hình chữ nhật' : 'Hình vuông'} ABCD có bao nhiêu cặp cạnh vuông góc với nhau?`, vz('shape', { kind: k, label: 'ABCD' }), num(4), 'Mỗi góc vuông ứng với một cặp cạnh vuông góc.', 'Có 4 cặp: AB và BC, BC và CD, CD và DA, DA và AB.'); }
          return Q('Hai đường thẳng vuông góc với nhau tạo thành mấy góc vuông?', vz('lines', { kind: 'perpendicular' }), num(4), 'Đếm các góc quanh điểm cắt.', 'Tạo thành 4 góc vuông chung đỉnh.');
        }),
      lesson(6, 29, 'Hai đường thẳng song song',
        'Rô-bốt ISA đi dọc hai thanh ray đường tàu song song cùng bạn Minh.',
        [
          { text: 'Hai đường thẳng song song không bao giờ cắt nhau.', visual: vz('lines', { kind: 'parallel' }) },
          { text: 'Hình chữ nhật ABCD có AB song song với DC, AD song song với BC.', visual: vz('shape', { kind: 'rect', label: 'ABCD' }) },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const k = P(rng, ['parallel', 'perpendicular', 'intersect']); return Q('Hai đường thẳng dưới đây có song song với nhau không?', vz('lines', { kind: k }), ch(rng, k === 'parallel' ? 'Có, song song' : 'Không song song', [k === 'parallel' ? 'Không song song' : 'Có, song song']), 'Hai đường thẳng song song không cắt nhau dù kéo dài mãi.', k === 'parallel' ? 'Hai đường thẳng song song.' : 'Hai đường thẳng cắt nhau nên không song song.'); }
          if (f === 1) { const [k, n, nmK] = P(rng, [['rect', 2, 'Hình chữ nhật'], ['square', 2, 'Hình vuông'], ['trapezoid', 1, 'Hình thang'], ['parallelogram', 2, 'Hình bình hành']]); return Q(`${nmK} dưới đây có bao nhiêu cặp cạnh song song?`, vz('shape', { kind: k }), num(n), 'Tìm các cặp cạnh đối diện không cắt nhau.', `${nmK} có ${n} cặp cạnh song song.`); }
          return Q('Chạm chọn các hình có hai cặp cạnh song song.', vz('shapeSet', { items: ['rect', 'triangle', 'square', 'circle', 'parallelogram'] }), { kind: 'visual', check: v => Array.isArray(v) && v.length === 3 && [0, 2, 4].every(j => v.includes(j)) }, 'Hình chữ nhật, hình vuông, hình bình hành đều có hai cặp cạnh đối diện song song.', 'Hình chữ nhật, hình vuông và hình bình hành.');
        }),
      lesson(6, 31, 'Hình bình hành, hình thoi',
        'Rô-bốt ISA cùng bạn Ngọc xếp những chiếc diều hình thoi bay trên đê.',
        [
          { text: 'Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau.', visual: vz('shape', { kind: 'parallelogram', dims: { a: 6, b: 4 }, showDims: true }) },
          { text: 'Hình thoi có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau.', visual: vz('shape', { kind: 'rhombus', dims: { a: 5 }, showDims: true }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const target = P(rng, ['parallelogram', 'rhombus']); const items = U.shuffle(rng, [target, target, 'triangle', 'trapezoid', 'circle', target === 'rhombus' ? 'rect' : 'quad']); const want = items.map((k, j) => (k === target ? j : -1)).filter(j => j >= 0); return Q(`Chạm chọn tất cả các hình ${target === 'rhombus' ? 'thoi' : 'bình hành'}.`, vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) }, target === 'rhombus' ? 'Hình thoi có bốn cạnh bằng nhau.' : 'Hình bình hành có hai cặp cạnh đối diện song song.', `Có ${want.length} hình.`); }
          if (f === 1) { const a = R(rng, 3, 25); return Q(`Hình thoi có cạnh ${a} cm. Tính chu vi hình thoi.`, vz('shape', { kind: 'rhombus', dims: { a }, showDims: true }), num(a * 4, 'cm'), 'Hình thoi có bốn cạnh bằng nhau.', `${a} × 4 = ${a * 4} (cm).`); }
          if (f === 2) { const a = R(rng, 4, 20), b = R(rng, 2, a - 1); return Q(`Hình bình hành ABCD có AB = ${a} cm, BC = ${b} cm. Tính chu vi hình bình hành.`, vz('shape', { kind: 'parallelogram', dims: { a, b }, showDims: true, label: 'ABCD' }), num((a + b) * 2, 'cm'), 'Hai cạnh đối diện của hình bình hành bằng nhau.', `(${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`); }
          const [p, c, d] = P(rng, [['Hình thoi có …', 'bốn cạnh bằng nhau', ['bốn góc vuông', 'ba cạnh', 'một cặp cạnh song song']], ['Hình bình hành có …', 'hai cặp cạnh đối diện song song và bằng nhau', ['bốn cạnh bằng nhau', 'bốn góc vuông', 'một cặp cạnh song song']]]);
          return Q(p, null, ch(rng, c, d), 'Nhớ đặc điểm của hình bình hành, hình thoi.', `${p.replace('…', c)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. PHÉP NHÂN VÀ PHÉP CHIA ============
  const c8 = {
    id: 'g4-c8', semester: 2, title: 'Phép nhân và phép chia', icon: '✖️', lessons: [
      lesson(8, 38, 'Nhân với số có một chữ số',
        'Rô-bốt ISA giúp nhà máy tính số chai nước đóng được trong mấy ngày.',
        [{ text: '241 324 × 3 = 723 972. Nhân từ phải sang trái, nhớ sang hàng bên trái.', visual: vz('columnCalc', { a: 241324, b: 3, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, L === 0 ? [1000, 9999] : [10000, 300000], [2, 9], () => true, [241324, 3]))),
      lesson(8, 39, 'Chia cho số có một chữ số',
        'Rô-bốt ISA chia đều số gạo cứu trợ cho các xã vùng lũ.',
        [{ text: '128 472 : 6 = 21 412. Chia từ trái sang phải: chia, nhân, trừ, hạ.', visual: vz('columnCalc', { a: 128472, b: 6, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, L === 0 ? [1000, 9999] : [10000, 999999], [2, 9], (a, b) => a % b === 0, [128472, 6]))),
      lesson(8, 40, 'Tính chất giao hoán và kết hợp của phép nhân',
        'Rô-bốt ISA chỉ cho bạn Bình mẹo ghép 25 với 4 để nhân nhẩm.',
        [
          { text: 'Giao hoán: a × b = b × a.', visual: vz('array', { rows: 3, cols: 5 }) },
          { text: 'Kết hợp: (a × b) × c = a × (b × c). Tính nhanh: 25 × 7 × 4 = 7 × (25 × 4) = 7 × 100 = 700.' },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const a = R(rng, 12, 999), b = R(rng, 2, 9); return Q(`Số thích hợp ở ô ?:\n${a} × ${b} = ${b} × ?`, null, num(a), 'Đổi chỗ các thừa số thì tích không thay đổi.', `${a} × ${b} = ${b} × ${a}.`); }
          const [x, y] = P(rng, [[25, 4], [5, 2], [50, 2], [125, 8], [20, 5], [250, 4]]); const z = R(rng, 3, 99);
          if (f === 1) { const terms = U.shuffle(rng, [x, y, z]); return Q(`Tính bằng cách thuận tiện:\n${terms.join(' × ')}`, null, num(x * y * z), `Nhóm ${x} với ${y} được ${x * y}.`, `${terms.join(' × ')} = ${z} × (${x} × ${y}) = ${z} × ${x * y} = ${F(x * y * z)}.`); }
          return Q(`Số thích hợp ở ô ?:\n(${z} × ${x}) × ${y} = ${z} × (${x} × ?)`, null, num(y), 'Tính chất kết hợp của phép nhân.', `(${z} × ${x}) × ${y} = ${z} × (${x} × ${y}).`);
        }),
      lesson(8, 41, 'Nhân, chia với 10, 100, 1000, …',
        'Rô-bốt ISA xếp những bó đũa, mỗi bó 10 đôi, để bán ở chợ phiên.',
        [
          { text: 'Nhân với 10, 100, 1000: viết thêm 1, 2, 3 chữ số 0 vào bên phải. 35 × 100 = 3500.' },
          { text: 'Chia số tròn chục, tròn trăm, tròn nghìn cho 10, 100, 1000: bỏ bớt 1, 2, 3 chữ số 0 ở bên phải. 4200 : 100 = 42.' },
        ],
        function (rng, i) {
          const p = P(rng, [10, 100, 1000]), a = R(rng, 2, 999), f = i % 4;
          if (f === 0) return Q(`${a} × ${F(p)} = ?`, null, num(a * p), `Viết thêm ${String(p).length - 1} chữ số 0 vào bên phải.`, `${a} × ${F(p)} = ${F(a * p)}.`);
          if (f === 1) return Q(`${F(a * p)} : ${F(p)} = ?`, null, num(a), `Bỏ bớt ${String(p).length - 1} chữ số 0 ở bên phải.`, `${F(a * p)} : ${F(p)} = ${a}.`);
          if (f === 2) { const b = R(rng, 2, 9) * 10, c = R(rng, 11, 99); return Q(`Tính: ${c} × ${b}`, vz('columnCalc', { a: c, b, op: '×', reveal: 'none' }), num(c * b), `${c} × ${b} = ${c} × ${b / 10} × 10.`, `${c} × ${b / 10} = ${c * b / 10}; ${c * b / 10} × 10 = ${F(c * b)}.`); }
          const [x, u1, u2, k] = P(rng, [[R(rng, 2, 90), 'tạ', 'kg', 100], [R(rng, 2, 90), 'tấn', 'kg', 1000], [R(rng, 2, 90), 'm', 'cm', 100], [R(rng, 2, 90), 'km', 'm', 1000]]);
          return Q(`${x} ${u1} = ? ${u2}`, null, num(x * k, u2), `1 ${u1} = ${F(k)} ${u2}.`, `${x} × ${F(k)} = ${F(x * k)}. Vậy ${x} ${u1} = ${F(x * k)} ${u2}.`);
        }),
      lesson(8, 42, 'Tính chất phân phối của phép nhân đối với phép cộng',
        'Rô-bốt ISA tính tiền mua bánh cho hai lớp cùng một lúc thật nhanh.',
        [
          { text: 'a × (b + c) = a × b + a × c. Ví dụ: 4 × (3 + 2) = 4 × 3 + 4 × 2 = 20.', visual: vz('array', { rows: 4, cols: 5 }) },
          { text: 'Tính nhanh: 36 × 7 + 36 × 3 = 36 × (7 + 3) = 36 × 10 = 360.' },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const a = R(rng, 12, 99), b = R(rng, 1, 9), c = 10 - b; return Q(`Tính bằng cách thuận tiện:\n${a} × ${b} + ${a} × ${c}`, null, num(a * 10), `Đặt ${a} làm thừa số chung.`, `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × 10 = ${a * 10}.`); }
          if (f === 1) { const a = R(rng, 12, 99), k = P(rng, [11, 101, 21, 12]); const [t, o] = k === 11 ? [10, 1] : k === 101 ? [100, 1] : k === 21 ? [20, 1] : [10, 2]; return Q(`Tính: ${a} × ${k}`, null, num(a * k), `${k} = ${t} + ${o}.`, `${a} × ${k} = ${a} × ${t} + ${a} × ${o} = ${a * t} + ${a * o} = ${F(a * k)}.`); }
          const a = R(rng, 2, 9), b = R(rng, 10, 50), c = R(rng, 10, 50);
          return Q(`Số thích hợp ở ô ?:\n${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ?`, null, num(c), 'Nhân một số với một tổng: nhân số đó với từng số hạng rồi cộng.', `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c}.`);
        }),
      lesson(8, 43, 'Nhân với số có hai chữ số',
        'Rô-bốt ISA tính số học sinh của toàn trường khi mỗi lớp có số bạn như nhau.',
        [{ text: '36 × 23: 36 × 3 = 108 (tích riêng thứ nhất); 36 × 2 = 72 (tích riêng thứ hai, viết lùi sang trái một cột). Cộng: 108 + 720 = 828.', visual: vz('columnCalc', { a: 36, b: 23, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, L === 0 ? [11, 99] : [100, 9999], [11, 99], (a, b) => b % 10 !== 0, [36, 23]))),
      lesson(8, 44, 'Chia cho số có hai chữ số',
        'Rô-bốt ISA chia đều số ghế vào các hàng trong hội trường.',
        [{ text: '672 : 21: 67 : 21 được 3 (ước lượng 6 : 2 = 3), 3 × 21 = 63, 67 − 63 = 4; hạ 2 được 42, 42 : 21 = 2. Vậy 672 : 21 = 32.', visual: vz('columnCalc', { a: 672, b: 21, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, L === 0 ? [100, 999] : [1000, 99999], [11, 99], (a, b) => a % b === 0 && a / b >= 2, [672, 21]))),
      lesson(8, 46, 'Tìm số trung bình cộng',
        'Rô-bốt ISA san đều những chồng sách cho bằng nhau cùng bạn Trang.',
        [
          { text: 'Ba chồng sách có 4, 6, 8 quyển. San đều: mỗi chồng 6 quyển. 6 là số trung bình cộng của 4, 6 và 8.', visual: vz('average', { values: [4, 6, 8] }) },
          { text: 'Muốn tìm số trung bình cộng của nhiều số, ta tính tổng các số đó rồi chia tổng cho số các số hạng: (4 + 6 + 8) : 3 = 6.' },
        ],
        function (rng, i) {
          const n = R(rng, 2, lv(i) === 0 ? 3 : 5), small = lv(i) < 2;
          let vals, avg;
          for (let g = 0; g < 100; g++) { vals = Array.from({ length: n }, () => R(rng, small ? 1 : 20, small ? 9 : 200)); if (vals.reduce((a, b) => a + b, 0) % n === 0) break; }
          let s = vals.reduce((a, b) => a + b, 0); if (s % n) { vals[0] += n - (s % n); s = vals.reduce((a, b) => a + b, 0); }
          avg = s / n;
          const f = i % 3;
          if (f === 0) return Q(`Tìm số trung bình cộng của các số: ${vals.join('; ')}.`, small ? vz('average', { values: vals }) : null, num(avg), 'Tính tổng rồi chia cho số các số hạng.', `(${vals.join(' + ')}) : ${n} = ${s} : ${n} = ${avg}.`);
          if (f === 1) { const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'].slice(0, n); return Q(`Số cây lớp 4A trồng được trong ${n} ngày lần lượt là: ${vals.join(', ')} cây. Hỏi trung bình mỗi ngày lớp trồng được bao nhiêu cây?`, vz('barChart', { labels: days, values: vals, unit: 'cây' }), num(avg, 'cây'), 'Trung bình cộng = tổng : số ngày.', `(${vals.join(' + ')}) : ${n} = ${avg} (cây).`); }
          const avg2 = R(rng, 20, 60), k = R(rng, 2, 4);
          return Q(`Số trung bình cộng của ${k} số là ${avg2}. Tổng của ${k} số đó là bao nhiêu?`, null, num(avg2 * k), 'Tổng = số trung bình cộng × số các số hạng.', `${avg2} × ${k} = ${avg2 * k}.`);
        }),
      lesson(8, 47, 'Bài toán liên quan đến rút về đơn vị',
        'Rô-bốt ISA tính giúp mẹ bạn Hà giá tiền khi mua nhiều hộp sữa.',
        [
          { text: '3 hộp bánh có 24 cái. 5 hộp như thế có bao nhiêu cái? Bước 1 (rút về đơn vị): 1 hộp có 24 : 3 = 8 (cái). Bước 2: 5 hộp có 8 × 5 = 40 (cái).', visual: vz('tape', { bars: [{ label: '3 hộp', parts: 3, units: 3, value: '24' }, { label: '5 hộp', parts: 5, units: 5, value: '?' }] }) },
        ],
        function (rng, i) {
          const per = R(rng, 2, lv(i) === 0 ? 9 : 50), n1 = R(rng, 2, 9); let n2 = R(rng, 2, 12); if (n2 === n1) n2++;
          const T = P(rng, [
            [`${n1} túi gạo nặng ${per * n1} kg. Hỏi ${n2} túi gạo như thế nặng bao nhiêu ki-lô-gam?`, 'kg'],
            [`Mua ${n1} quyển vở hết ${F(per * n1 * 1000)} đồng. Hỏi mua ${n2} quyển vở như thế hết bao nhiêu tiền?`, 'đồng', 1000],
            [`${n1} xe chở được ${per * n1} bao xi măng. Hỏi ${n2} xe như thế chở được bao nhiêu bao xi măng?`, ''],
          ]);
          const m = T[2] || 1, ans = per * n2 * m;
          if (i % 3 === 2) return Q(`Có ${per * n1} cái bánh xếp đều vào ${n1} hộp. Hỏi ${per * n2} cái bánh thì xếp được mấy hộp như thế?`, vz('tape', { bars: [{ label: `${n1} hộp`, parts: Math.min(n1, 10), units: Math.min(n1, 10), value: String(per * n1) }] }), num(n2), 'Bước 1: tìm số bánh trong 1 hộp. Bước 2: chia số bánh cho số bánh mỗi hộp.', `1 hộp: ${per * n1} : ${n1} = ${per} (cái). Số hộp: ${per * n2} : ${per} = ${n2} (hộp).`);
          return Q(T[0], vz('tape', { bars: [{ label: String(n1), parts: Math.min(n1, 10), units: Math.min(n1, 10), value: F(per * n1 * m) }, { label: String(n2), parts: Math.min(n2, 10), units: Math.min(n2, 10), value: '?' }] }), T[1] ? num(ans, T[1]) : num(ans), 'Bước 1: tìm giá trị của 1 phần (rút về đơn vị). Bước 2: nhân với số phần.', `1 phần: ${F(per * n1 * m)} : ${n1} = ${F(per * m)}. ${n2} phần: ${F(per * m)} × ${n2} = ${F(ans)}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 9. LÀM QUEN VỚI YẾU TỐ THỐNG KÊ, XÁC SUẤT ============
  const c9 = {
    id: 'g4-c9', semester: 2, title: 'Làm quen với yếu tố thống kê, xác suất', icon: '📊', lessons: [
      lesson(9, 49, 'Dãy số liệu thống kê',
        'Rô-bốt ISA ghi lại chiều cao các bạn trong tổ của bạn Hùng.',
        [{ text: 'Chiều cao (cm) của 5 bạn: 132; 128; 135; 130; 126. Đây là dãy số liệu thống kê. Số thứ ba là 135.', visual: vz('dataTable', { headers: ['Bạn', 'An', 'Bình', 'Chi', 'Dũng', 'Hà'], rows: [['Chiều cao (cm)', 132, 128, 135, 130, 126]] }) }],
        function (rng, i) {
          const n = R(rng, 4, 6), vals = U.sample(rng, Array.from({ length: 25 }, (_, k) => 120 + k), n), f = i % 4;
          const seq = vals.join('; ');
          if (f === 0) { const k = R(rng, 1, n); return Q(`Dãy số liệu chiều cao (cm): ${seq}.\nSố thứ ${k} trong dãy là bao nhiêu?`, null, num(vals[k - 1]), 'Đếm từ trái sang phải.', `Số thứ ${k} là ${vals[k - 1]}.`); }
          if (f === 1) return Q(`Dãy số liệu chiều cao (cm): ${seq}.\nDãy số liệu có bao nhiêu số?`, null, num(n), 'Đếm các số trong dãy.', `Dãy có ${n} số.`);
          if (f === 2) { const big = R(rng, 0, 1), v = big ? Math.max(...vals) : Math.min(...vals); return Q(`Dãy số liệu chiều cao (cm): ${seq}.\nBạn ${big ? 'cao nhất' : 'thấp nhất'} cao bao nhiêu xăng-ti-mét?`, null, num(v, 'cm'), `Tìm số ${big ? 'lớn' : 'bé'} nhất trong dãy.`, `${v} cm.`); }
          const mx = Math.max(...vals), mn = Math.min(...vals);
          return Q(`Dãy số liệu chiều cao (cm): ${seq}.\nBạn cao nhất hơn bạn thấp nhất bao nhiêu xăng-ti-mét?`, null, num(mx - mn, 'cm'), 'Lấy số lớn nhất trừ số bé nhất.', `${mx} ${M} ${mn} = ${mx - mn} (cm).`);
        }),
      lesson(9, 50, 'Biểu đồ cột',
        'Rô-bốt ISA vẽ biểu đồ cột về số sách các lớp quyên góp cho thư viện.',
        [{ text: 'Biểu đồ cột: mỗi cột cho biết một số liệu. Cột càng cao thì số liệu càng lớn.', visual: vz('barChart', { title: 'Số sách quyên góp', labels: ['4A', '4B', '4C', '4D'], values: [45, 60, 38, 52], unit: 'quyển' }) }],
        function (rng, i) {
          const labels = ['4A', '4B', '4C', '4D'].slice(0, lv(i) === 0 ? 3 : 4), vals = U.sample(rng, Array.from({ length: 16 }, (_, k) => 20 + k * 5), labels.length);
          const bc = vz('barChart', { title: 'Số sách quyên góp', labels, values: vals, unit: 'quyển' }), f = i % 4;
          if (f === 0) { const j = R(rng, 0, labels.length - 1); return Q(`Lớp ${labels[j]} quyên góp được bao nhiêu quyển sách?`, bc, num(vals[j]), 'Nhìn số ở đỉnh cột.', `Lớp ${labels[j]}: ${vals[j]} quyển.`); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...vals) : Math.min(...vals); return Q(`Lớp nào quyên góp được ${big ? 'nhiều' : 'ít'} sách nhất?`, bc, ch(rng, labels[vals.indexOf(v)], labels), `Tìm cột ${big ? 'cao' : 'thấp'} nhất.`, `Lớp ${labels[vals.indexOf(v)]}: ${v} quyển.`); }
          if (f === 2) { const s = vals.reduce((a, b) => a + b, 0); return Q('Các lớp quyên góp được tất cả bao nhiêu quyển sách?', bc, num(s), 'Cộng số liệu của tất cả các cột.', `${vals.join(' + ')} = ${s} (quyển).`); }
          const [a, b] = U.sample(rng, labels.map((_, k) => k), 2), hi = vals[a] > vals[b] ? a : b, lo = hi === a ? b : a;
          return Q(`Lớp ${labels[hi]} quyên góp nhiều hơn lớp ${labels[lo]} bao nhiêu quyển sách?`, bc, num(vals[hi] - vals[lo]), 'Lấy số lớn trừ số bé.', `${vals[hi]} ${M} ${vals[lo]} = ${vals[hi] - vals[lo]} (quyển).`);
        }),
      lesson(9, 51, 'Số lần xuất hiện của một sự kiện',
        'Rô-bốt ISA tung đồng xu nhiều lần và ghi lại kết quả cùng bạn Vy.',
        [{ text: 'Tung đồng xu 20 lần: mặt sấp xuất hiện 12 lần, mặt ngửa xuất hiện 8 lần.', visual: vz('dataTable', { headers: ['Mặt', 'Sấp', 'Ngửa'], rows: [['Số lần', 12, 8]] }) }],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const n = R(rng, 2, 5) * 10, a = R(rng, 3, n - 3); return Q(`Tung một đồng xu ${n} lần, mặt sấp xuất hiện ${a} lần. Hỏi mặt ngửa xuất hiện bao nhiêu lần?`, vz('dataTable', { headers: ['Mặt', 'Sấp', 'Ngửa'], rows: [['Số lần', a, '?']] }), num(n - a), 'Tổng số lần sấp và ngửa bằng số lần tung.', `${n} ${M} ${a} = ${n - a} (lần).`); }
          const cols = [{ n: 'đỏ', c: '#E84A4A' }, { n: 'xanh', c: '#4DA3FF' }, { n: 'vàng', c: '#FFC93C' }];
          const cnt = U.sample(rng, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3);
          if (f === 1) { const j = R(rng, 0, 2); return Q(`Lấy 1 quả bóng trong hộp rồi trả lại, làm ${cnt[0] + cnt[1] + cnt[2]} lần. Kết quả ghi trong bảng. Bóng ${cols[j].n} xuất hiện bao nhiêu lần?`, vz('dataTable', { headers: ['Màu', 'Đỏ', 'Xanh', 'Vàng'], rows: [['Số lần', cnt[0], cnt[1], cnt[2]]] }), num(cnt[j]), 'Đọc số trong bảng.', `Bóng ${cols[j].n}: ${cnt[j]} lần.`); }
          const mx = Math.max(...cnt), j = cnt.indexOf(mx);
          return Q(`Lấy 1 quả bóng trong hộp rồi trả lại, làm nhiều lần. Kết quả: đỏ ${cnt[0]} lần, xanh ${cnt[1]} lần, vàng ${cnt[2]} lần. Màu nào xuất hiện nhiều lần nhất?`, vz('barChart', { labels: ['Đỏ', 'Xanh', 'Vàng'], values: cnt, unit: 'lần' }), ch(rng, ['Đỏ', 'Xanh', 'Vàng'][j], ['Đỏ', 'Xanh', 'Vàng']), 'So sánh các số lần.', `Màu ${cols[j].n}: ${mx} lần.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 10. PHÂN SỐ ============
  function fracPair(rng) { const d = R(rng, 2, 9), k = R(rng, 2, 4); return [d, d * k]; }
  const c10 = {
    id: 'g4-c10', semester: 2, title: 'Phân số', icon: '🍕', lessons: [
      lesson(10, 53, 'Khái niệm phân số',
        'Rô-bốt ISA cắt chiếc bánh pizza thành các phần bằng nhau cho cả nhóm bạn Mai.',
        [
          { text: 'Chia hình tròn thành 5 phần bằng nhau, tô màu 3 phần: đã tô màu 3/5 (ba phần năm) hình tròn.', visual: fv(3, 5, 'pie') },
          { text: 'Trong phân số 3/5: 3 là tử số (số phần được lấy), 5 là mẫu số (số phần bằng nhau). Mẫu số luôn khác 0.' },
        ],
        function (rng, i) {
          const d = R(rng, 2, lv(i) === 0 ? 6 : 10), n = R(rng, 1, d - 1), f = i % 4, sh = P(rng, ['bar', 'pie', 'rect']);
          if (f === 0) return Q('Viết phân số chỉ phần đã tô màu của hình.', fv(n, d, sh), fracA(n, d), 'Mẫu số: số phần bằng nhau. Tử số: số phần được tô màu.', `Đã tô màu ${n}/${d} hình.`);
          if (f === 1) return Q(`Em hãy tô màu ${n}/${d} hình (chạm vào các phần để tô).`, vz('fraction', { num: 0, den: d, shape: sh }), { kind: 'visual', check: v => v === n }, `Hình có ${d} phần bằng nhau, tô ${n} phần.`, `${n}/${d}: tô ${n} trong ${d} phần.`);
          if (f === 2) { const t = R(rng, 0, 1); return Q(`Phân số ${n}/${d} có ${t ? 'tử số' : 'mẫu số'} là:`, fv(n, d, sh), num(t ? n : d), 'Tử số viết trên gạch ngang, mẫu số viết dưới gạch ngang.', `${t ? 'Tử số' : 'Mẫu số'} là ${t ? n : d}.`); }
          const nmD = ['', '', 'hai', 'ba', 'tư', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];
          return Q(`Phân số "${DIG[n]} phần ${nmD[d]}" viết là:`, null, ch(rng, fs(n, d), [fs(d, n), fs(n, d + 1), fs(n + 1 < d ? n + 1 : n - 1 || 1, d)]), 'Đọc tử số trước, mẫu số sau.', `${DIG[n]} phần ${nmD[d]}: ${n}/${d}.`);
        }),
      lesson(10, 54, 'Phân số và phép chia số tự nhiên',
        'Rô-bốt ISA chia đều 3 chiếc bánh cho 4 bạn nhỏ trong ngày Tết thiếu nhi.',
        [
          { text: 'Thương của phép chia số tự nhiên cho số tự nhiên (khác 0) có thể viết thành phân số: 3 : 4 = 3/4.', visual: fv(3, 4, 'bar') },
          { text: 'Phân số có tử số lớn hơn mẫu số thì lớn hơn 1 (7/4 > 1); tử số bằng mẫu số thì bằng 1; tử số bé hơn mẫu số thì bé hơn 1.' },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 1, 15), b = R(rng, 2, 12); return Q(`Viết thương ${a} : ${b} dưới dạng phân số.`, null, fracA(a, b), 'Số bị chia là tử số, số chia là mẫu số.', `${a} : ${b} = ${a}/${b}.`); }
          if (f === 1) { const d = R(rng, 2, 9), n = P(rng, [R(rng, 1, d - 1), d, R(rng, d + 1, 2 * d)]); return Q(`So sánh phân số ${n}/${d} với 1: ${n}/${d} … 1`, fv(Math.min(n, d), d, 'bar'), cmpAns(n / d, 1), 'So sánh tử số với mẫu số.', `Tử số ${n} ${sign(n, d)} mẫu số ${d} nên ${n}/${d} ${sign(n, d)} 1.`); }
          if (f === 2) { const a = R(rng, 2, 9), b = R(rng, a + 1, 12); return Q(`Chia đều ${a} cái bánh cho ${b} bạn. Mỗi bạn được bao nhiêu phần của cái bánh?`, fv(a, b, 'rect'), fracA(a, b), `Mỗi bạn được ${a} : ${b} cái bánh.`, `${a} : ${b} = ${a}/${b} (cái bánh).`); }
          const n = R(rng, 2, 9);
          return Q(`Viết số tự nhiên ${n} dưới dạng phân số có mẫu số là 1.`, null, fracA(n, 1), 'Mọi số tự nhiên đều viết được thành phân số có mẫu số 1.', `${n} = ${n}/1.`);
        }),
      lesson(10, 55, 'Tính chất cơ bản của phân số',
        'Rô-bốt ISA cho bạn Quân thấy 1/2 thanh sô-cô-la bằng 2/4 thanh.',
        [
          { text: 'Nhân cả tử số và mẫu số với cùng một số tự nhiên khác 0 thì được phân số bằng phân số đã cho: 1/2 = 2/4.', visual: vz('fractionCompare', { a: [1, 2], b: [2, 4] }) },
          { text: 'Chia cả tử số và mẫu số cho cùng một số tự nhiên khác 0 (nếu chia hết) thì được phân số bằng phân số đã cho: 6/9 = 2/3.' },
        ],
        function (rng, i) {
          const d = R(rng, 2, 9), n = R(rng, 1, d - 1), k = R(rng, 2, lv(i) === 0 ? 3 : 6), f = i % 3;
          if (f === 0) return Q(`Số thích hợp ở ô ?:\n${n}/${d} = ?/${d * k}`, vz('fractionCompare', { a: [n, d], b: [n * k, d * k] }), num(n * k), `Mẫu số được nhân với ${k}, tử số cũng nhân với ${k}.`, `${n}/${d} = (${n} × ${k})/(${d} × ${k}) = ${n * k}/${d * k}.`);
          if (f === 1) return Q(`Số thích hợp ở ô ?:\n${n * k}/${d * k} = ${n}/?`, null, num(d), `Tử số được chia cho ${k}, mẫu số cũng chia cho ${k}.`, `${n * k}/${d * k} = (${n * k} : ${k})/(${d * k} : ${k}) = ${n}/${d}.`);
          return Q(`Phân số nào bằng phân số ${n}/${d}?`, null, ch(rng, fs(n * k, d * k), [fs(n + k, d + k), fs(n * k, d + k), fs(n * k + 1, d * k)]), 'Nhân (hoặc chia) cả tử và mẫu với cùng một số.', `${n}/${d} = ${n * k}/${d * k}.`);
        }),
      lesson(10, 56, 'Rút gọn phân số',
        'Rô-bốt ISA rút gọn phân số để bạn Hùng dễ so sánh phần bánh của mình.',
        [
          { text: 'Rút gọn 12/18: chia cả tử và mẫu cho 6 được 2/3. Phân số 2/3 không rút gọn được nữa: đó là phân số tối giản.', visual: vz('fractionCompare', { a: [12, 18], b: [2, 3] }) },
          { text: 'Mẹo: thử chia cả tử và mẫu cho 2, 3, 5, … cho đến khi không chia được nữa.' },
        ],
        function (rng, i) {
          const d = R(rng, 2, 9), n = R(rng, 1, d - 1), [sn, sd] = U.simplify(n, d), k = R(rng, 2, lv(i) === 0 ? 3 : 8), f = i % 3;
          const N = sn * k, D = sd * k;
          if (f === 0 || f === 2) return Q(`Rút gọn phân số ${N}/${D} thành phân số tối giản.`, vz('fractionCompare', { a: [N, D], b: [sn, sd] }), fracA(sn, sd, true), `Chia cả tử và mẫu cho ${U.gcd(N, D)}.`, `${N}/${D} = (${N} : ${U.gcd(N, D)})/(${D} : ${U.gcd(N, D)}) = ${sn}/${sd}.`);
          const opts = [[sn, sd], [N, D], [sn * 2, sd * 2], [sn + 1, sd + 2]];
          return Q('Phân số nào là phân số tối giản?', null, ch(rng, fs(sn, sd), opts.slice(1).filter(([a, b]) => U.gcd(a, b) > 1).map(([a, b]) => fs(a, b)).concat([fs(2, 4), fs(3, 6), fs(4, 10)])), 'Phân số tối giản: tử và mẫu không cùng chia hết cho số nào lớn hơn 1.', `${sn}/${sd} là phân số tối giản.`);
        }),
      lesson(10, 57, 'Quy đồng mẫu số các phân số',
        'Rô-bốt ISA giúp hai bạn đổi phần bánh về cùng kiểu cắt để dễ so sánh.',
        [
          { text: 'Quy đồng mẫu số 2/3 và 5/6: vì 6 : 3 = 2 nên 2/3 = (2 × 2)/(3 × 2) = 4/6; giữ nguyên 5/6.', visual: vz('fractionCompare', { a: [4, 6], b: [5, 6] }) },
          { text: 'Mẫu số chung là mẫu số chia hết cho mẫu số kia.' },
        ],
        function (rng, i) {
          const [d1, d2] = fracPair(rng), k = d2 / d1, n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1), f = i % 3;
          if (f === 0) return Q(`Quy đồng mẫu số hai phân số ${n1}/${d1} và ${n2}/${d2}. Mẫu số chung là bao nhiêu?`, null, num(d2), `${d2} chia hết cho ${d1}.`, `Mẫu số chung là ${d2}.`);
          if (f === 1) return Q(`Quy đồng mẫu số ${n1}/${d1} và ${n2}/${d2}:\n${n1}/${d1} = ?/${d2}`, vz('fractionCompare', { a: [n1 * k, d2], b: [n2, d2] }), num(n1 * k), `${d2} : ${d1} = ${k}, nhân cả tử và mẫu của ${n1}/${d1} với ${k}.`, `${n1}/${d1} = ${n1 * k}/${d2}; giữ nguyên ${n2}/${d2}.`);
          return Q(`Quy đồng mẫu số hai phân số ${n1}/${d1} và ${n2}/${d2}, ta được:`, null, ch(rng, `${n1 * k}/${d2} và ${n2}/${d2}`, [`${n1}/${d2} và ${n2}/${d2}`, `${n1 * k}/${d2} và ${n2 * k}/${d2}`, `${n1 + k}/${d2} và ${n2}/${d2}`]), `Nhân cả tử và mẫu của ${n1}/${d1} với ${k}.`, `${n1}/${d1} = ${n1 * k}/${d2}; ${n2}/${d2} giữ nguyên.`);
        }),
      lesson(10, 58, 'So sánh phân số',
        'Rô-bốt ISA so sánh hai miếng bánh để xem bạn nào được phần nhiều hơn.',
        [
          { text: 'Cùng mẫu số: phân số nào có tử số lớn hơn thì lớn hơn. 3/7 < 5/7.', visual: vz('fractionCompare', { a: [3, 7], b: [5, 7] }) },
          { text: 'Khác mẫu số: quy đồng mẫu số rồi so sánh. 2/3 và 5/6: 2/3 = 4/6 < 5/6.', visual: vz('fractionCompare', { a: [2, 3], b: [5, 6] }) },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) { const d = R(rng, 3, 12), a = R(rng, 1, d), b = R(rng, 1, d); return Q(`So sánh: ${a}/${d} … ${b}/${d}`, vz('fractionCompare', { a: [a, d], b: [b, d] }), cmpAns(a, b), 'Cùng mẫu số: so sánh tử số.', `${a} ${sign(a, b)} ${b} nên ${a}/${d} ${sign(a, b)} ${b}/${d}.`); }
          if (f === 1) { const [d1, d2] = fracPair(rng), k = d2 / d1, n1 = R(rng, 1, d1 - 1), n2 = R(rng, 1, d2 - 1); const sw = R(rng, 0, 1); const A = sw ? [n2, d2] : [n1, d1], B = sw ? [n1, d1] : [n2, d2]; return Q(`So sánh: ${A[0]}/${A[1]} … ${B[0]}/${B[1]}`, vz('fractionCompare', { a: A, b: B }), cmpAns(A[0] / A[1], B[0] / B[1]), 'Quy đồng mẫu số rồi so sánh tử số.', `${n1}/${d1} = ${n1 * k}/${d2}. So sánh ${A[0] * (d2 / A[1])}/${d2} và ${B[0] * (d2 / B[1])}/${d2}: ${A[0]}/${A[1]} ${sign(A[0] / A[1], B[0] / B[1])} ${B[0]}/${B[1]}.`); }
          const n = R(rng, 1, 5), d1 = R(rng, n + 1, 8); let d2 = R(rng, n + 1, 9); if (d2 === d1) d2 = d1 + 1;
          return Q(`So sánh hai phân số cùng tử số: ${n}/${d1} … ${n}/${d2}`, vz('fractionCompare', { a: [n, d1], b: [n, d2] }), cmpAns(n / d1, n / d2), 'Cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn (mỗi phần to hơn).', `Mẫu số ${d1} ${sign(d1, d2)} ${d2} nên ${n}/${d1} ${sign(n / d1, n / d2)} ${n}/${d2}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 11. PHÉP CỘNG, PHÉP TRỪ PHÂN SỐ ============
  function addSubGen(op) {
    return function (rng, i) {
      const f = i % 4;
      let a, b, c, d;
      if (lv(i) === 0 || f === 0) { d = R(rng, 3, 12); c = d; a = R(rng, 1, d - 1); b = R(rng, 1, d - 1); if (op === M && a < b) [a, b] = [b, a]; if (op === M && a === b) a = Math.min(d, a + 1); }
      else { const [d1, d2] = fracPair(rng); const sw = R(rng, 0, 1); [c, d] = sw ? [d2, d1] : [d1, d2]; a = R(rng, 1, c - 1); b = R(rng, 1, d - 1); if (op === M && a / c < b / d) { [a, c, b, d] = [b, d, a, c]; } if (op === M && a / c === b / d) a = a + 1 < c ? a + 1 : a; }
      const L = U.lcm(c, d), A = a * (L / c), B = b * (L / d), Rn = op === '+' ? A + B : A - B;
      if (Rn <= 0 && op === M) { return Q(`${a}/${c} ${M} ${a}/${c} = ?`, null, num(0), 'Một số trừ đi chính nó bằng 0.', `${a}/${c} ${M} ${a}/${c} = 0.`); }
      const [sn, sd] = U.simplify(Rn, L);
      const expr = `${a}/${c} ${op} ${b}/${d}`;
      const how = c === d ? `${a}/${c} ${op} ${b}/${d} = (${a} ${op} ${b})/${c} = ${Rn}/${L}` : `${expr} = ${A}/${L} ${op} ${B}/${L} = ${Rn}/${L}`;
      const tail = (sn !== Rn ? ` = ${sn}/${sd}` : '') + '.';
      if (f === 3 && c === d) {
        return Q(`Tính rồi chọn kết quả đúng:\n${expr} = ?`, vz('fractionCompare', { a: [a, c], b: [b, d] }), ch(rng, fs(Rn, L), [fs(op === '+' ? a + b : Math.abs(a - b), c + d), fs(Rn, L * 2), fs(Rn + 1, L)]), 'Cùng mẫu số: cộng (trừ) tử số, giữ nguyên mẫu số.', how + tail);
      }
      if (f === 2) {
        const who = nm(rng), w = op === '+' ? `Ngày thứ nhất ${who} đọc được ${a}/${c} quyển sách, ngày thứ hai đọc được ${b}/${d} quyển. Hỏi cả hai ngày ${who} đọc được bao nhiêu phần quyển sách?` : `Một tấm vải dài ${a}/${c} m, mẹ cắt đi ${b}/${d} m để may túi. Hỏi tấm vải còn lại bao nhiêu mét?`;
        return Q(w, vz('fractionCompare', { a: [a, c], b: [b, d] }), fracA(sn, sd), c === d ? 'Cùng mẫu số: cộng (trừ) tử số, giữ nguyên mẫu số.' : 'Quy đồng mẫu số trước rồi tính.', how + tail);
      }
      return Q(`Tính:\n${expr}`, vz('fractionCompare', { a: [a, c], b: [b, d] }), fracA(sn, sd), c === d ? 'Cùng mẫu số: cộng (trừ) các tử số, giữ nguyên mẫu số.' : `Quy đồng mẫu số (mẫu số chung ${L}) rồi ${op === '+' ? 'cộng' : 'trừ'} tử số.`, how + tail);
    };
  }
  const c11 = {
    id: 'g4-c11', semester: 2, title: 'Phép cộng, phép trừ phân số', icon: '➕', lessons: [
      lesson(11, 60, 'Phép cộng phân số',
        'Rô-bốt ISA cùng bạn Lan sơn hàng rào: buổi sáng sơn được một phần, buổi chiều sơn thêm một phần.',
        [
          { text: 'Cộng hai phân số cùng mẫu số: cộng hai tử số, giữ nguyên mẫu số. 2/7 + 3/7 = 5/7.', visual: vz('fractionCompare', { a: [2, 7], b: [3, 7] }) },
          { text: 'Khác mẫu số: quy đồng mẫu số rồi cộng. 1/2 + 1/4 = 2/4 + 1/4 = 3/4.', visual: fv(3, 4, 'bar') },
        ],
        addSubGen('+')),
      lesson(11, 61, 'Phép trừ phân số',
        'Rô-bốt ISA tính phần bánh còn lại sau khi bạn Nam mời các bạn cùng ăn.',
        [
          { text: 'Trừ hai phân số cùng mẫu số: trừ tử số của phân số thứ nhất cho tử số của phân số thứ hai, giữ nguyên mẫu số. 5/8 − 2/8 = 3/8.', visual: vz('fractionCompare', { a: [5, 8], b: [2, 8] }) },
          { text: 'Khác mẫu số: quy đồng mẫu số rồi trừ. 5/6 − 1/3 = 5/6 − 2/6 = 3/6 = 1/2.' },
        ],
        addSubGen(M)),
    ],
  };

  // ============ CHỦ ĐỀ 12. PHÉP NHÂN, PHÉP CHIA PHÂN SỐ ============
  const c12 = {
    id: 'g4-c12', semester: 2, title: 'Phép nhân, phép chia phân số', icon: '✖️', lessons: [
      lesson(12, 63, 'Phép nhân phân số',
        'Rô-bốt ISA tính diện tích mảnh vườn nhỏ hình chữ nhật có cạnh là phân số.',
        [
          { text: 'Muốn nhân hai phân số, ta lấy tử số nhân tử số, mẫu số nhân mẫu số. 2/3 × 4/5 = 8/15.', visual: vz('fraction', { num: 8, den: 15, shape: 'rect' }) },
          { text: 'Nhân phân số với số tự nhiên: 2/7 × 3 = 6/7 (nhân tử số với số tự nhiên).' },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 1) { const d = R(rng, 3, 12), n = R(rng, 1, d - 1), k = R(rng, 2, 5); const [sn, sd] = U.simplify(n * k, d); return Q(`Tính: ${n}/${d} × ${k}`, null, fracA(sn, sd), 'Nhân tử số với số tự nhiên, giữ nguyên mẫu số.', `${n}/${d} × ${k} = ${n * k}/${d}${sn !== n * k ? ` = ${sn}/${sd}` : ''}.`); }
          const b = R(rng, 2, 9), a = R(rng, 1, b - 1), d = R(rng, 2, 9), c = R(rng, 1, d - 1), [sn, sd] = U.simplify(a * c, b * d);
          if (f === 2) return Q(`Một hình chữ nhật có chiều dài ${a}/${b} m, chiều rộng ${c}/${d} m. Tính diện tích hình chữ nhật (m²).`, vz('shape', { kind: 'rect' }), fracA(sn, sd), 'Diện tích = dài × rộng.', `${a}/${b} × ${c}/${d} = ${a * c}/${b * d}${sn !== a * c ? ` = ${sn}/${sd}` : ''} (m²).`);
          return Q(`Tính: ${a}/${b} × ${c}/${d}`, null, fracA(sn, sd), 'Tử nhân tử, mẫu nhân mẫu.', `${a}/${b} × ${c}/${d} = (${a} × ${c})/(${b} × ${d}) = ${a * c}/${b * d}${sn !== a * c ? ` = ${sn}/${sd}` : ''}.`);
        }),
      lesson(12, 64, 'Phép chia phân số',
        'Rô-bốt ISA chia đều nước cam vào những chiếc cốc nhỏ cho các bạn.',
        [
          { text: 'Phân số đảo ngược của 2/3 là 3/2.' },
          { text: 'Muốn chia hai phân số, ta lấy phân số thứ nhất nhân với phân số thứ hai đảo ngược. 3/4 : 2/5 = 3/4 × 5/2 = 15/8.' },
        ],
        function (rng, i) {
          const f = i % 3;
          const b = R(rng, 2, 9), a = R(rng, 1, 9), d = R(rng, 2, 9), c = R(rng, 1, d - 1);
          if (f === 0) return Q(`Phân số đảo ngược của ${c}/${d} là:`, null, ch(rng, fs(d, c), [fs(c, d), fs(d, c + 1), fs(c + d, d)]), 'Đổi chỗ tử số và mẫu số.', `Phân số đảo ngược của ${c}/${d} là ${d}/${c}.`);
          const [sn, sd] = U.simplify(a * d, b * c);
          if (f === 1) return Q(`Tính: ${a}/${b} : ${c}/${d}`, null, fracA(sn, sd), 'Nhân phân số thứ nhất với phân số thứ hai đảo ngược.', `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c} = ${a * d}/${b * c}${sn !== a * d ? ` = ${sn}/${sd}` : ''}.`);
          const k = R(rng, 2, 5), [s2n, s2d] = U.simplify(a, b * k);
          return Q(`Tính: ${a}/${b} : ${k}`, null, fracA(s2n, s2d), `Chia cho ${k} tức là nhân với 1/${k}.`, `${a}/${b} : ${k} = ${a}/${b} × 1/${k} = ${a}/${b * k}${s2n !== a ? ` = ${s2n}/${s2d}` : ''}.`);
        }),
      lesson(12, 65, 'Tìm phân số của một số',
        'Rô-bốt ISA giúp cô giáo tính 2/3 số học sinh của lớp đi tham quan.',
        [
          { text: 'Muốn tìm 2/3 của 12, ta lấy 12 × 2/3 = 8. (Chia 12 thành 3 phần bằng nhau, lấy 2 phần.)', visual: vz('tape', { bars: [{ label: '12', parts: 3, units: 6, value: '12' }, { label: '2/3', parts: 2, units: 4, value: '?' }] }) },
        ],
        function (rng, i) {
          const d = R(rng, 2, 9), f = i % 3; let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; const q = R(rng, 2, f === 1 ? Math.max(2, Math.floor(45 / d)) : lv(i) === 0 ? 6 : 20), N = d * q, v = n * q;
          const tape = vz('tape', { bars: [{ label: 'Cả', parts: d, units: d, value: String(N) }, { label: `${n}/${d}`, parts: n, units: n, value: '?' }] });
          if (f === 0) return Q(`Tìm ${n}/${d} của ${N}.`, tape, num(v), `Lấy ${N} × ${n}/${d}.`, `${N} × ${n}/${d} = ${N} : ${d} × ${n} = ${v}.`);
          if (f === 1) return Q(`Lớp 4A có ${N} học sinh, trong đó ${n}/${d} số học sinh là học sinh nữ. Hỏi lớp có bao nhiêu học sinh nữ?`, tape, num(v), `Tìm ${n}/${d} của ${N}.`, `${N} × ${n}/${d} = ${v} (học sinh).`);
          return Q(`Một cửa hàng có ${N} kg gạo, đã bán ${n}/${d} số gạo đó. Hỏi cửa hàng đã bán bao nhiêu ki-lô-gam gạo?`, tape, num(v, 'kg'), `Tìm ${n}/${d} của ${N}.`, `${N} × ${n}/${d} = ${v} (kg).`);
        }),
    ],
  };

  CURRICULUM.push({
    grade: 4,
    title: 'Lớp 4',
    book: 'Kết nối tri thức với cuộc sống',
    topics: [c1, c2, c3, c4, c5, c6, c8, c9, c10, c11, c12],
  });
})();
