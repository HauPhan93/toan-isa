/* Toán ISA — Lớp 3 (SGK Toán 3 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g3-c{chủ đề index}-b{Bài number}. Never rename ids.
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const R = U.rand, P = U.pick, F = x => U.fmt(x);
  const M = '−';

  // ---------- helpers ----------
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
  const tf = (rng, ok) => U.choices(rng, ok ? 'Đúng' : 'Sai', [ok ? 'Sai' : 'Đúng']);
  // share draws at most 60 items: fall back to an array for bigger totals
  const shareV = (total, groups, emoji) => (total <= 60 && groups <= 10 ? vz('share', emoji ? { total, groups, emoji } : { total, groups }) : vz('array', { rows: groups, cols: total / groups }));
  function Q(prompt, visual, answer, hint, explain, extra) {
    const q = { prompt, answer, hint, explain };
    if (visual) q.visual = visual;
    Object.assign(q, extra || {});
    if (q.hintVisual == null) delete q.hintVisual;
    return q;
  }
  const two = rng => U.sample(rng, U.NAMES, 2);
  const nm = rng => P(rng, U.NAMES);
  const cap = s => s[0].toUpperCase() + s.slice(1);
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
  function wrongMul(a, b) { let r = 0, p = 1; while (a > 0) { r += ((a % 10) * b % 10) * p; p *= 10; a = Math.floor(a / 10); } return r; }
  function wrongDiv(q) { const s = String(q).replace(/0/g, ''); const w = Number(s || '0'); return w !== q && w > 0 ? w : q + 1; }
  const units = (x, max) => Math.max(1, Math.round(x * 12 / Math.max(1, max)));
  const opRes = (a, op, b) => (op === '+' ? a + b : op === M ? a - b : op === '×' ? a * b : a / b);

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
  function roundTo(n, p) { return Math.round(n / p) * p; } // ties go up (n/p ≥ x.5)
  function expand(n) { const s = String(n), out = []; for (let k = 0; k < s.length; k++) { const d = Number(s[k]); if (d) out.push(d * Math.pow(10, s.length - 1 - k)); } return out; }

  // Learn cards show their labels (visuals hide most labels by default so questions do not give answers away).
  const LEARN_ON = { blocks: { labels: true }, fraction: { label: true }, decimalGrid: { showLabel: true }, percent: { showLabel: true }, thermometer: { showValue: true }, roman: { showValue: true, showText: true }, average: { showMean: true }, angle: { showDeg: true }, cubes: { showDims: true } };
  function lesson(c, b, title, story, learn, gen) {
    learn.forEach(card => { const v = card.visual; if (v && LEARN_ON[v.type]) v.params = Object.assign({}, LEARN_ON[v.type], v.params); });
    return { id: `g3-c${c}-b${b}`, title, book: `Bài ${b}`, story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
  }

  // ---------- generic builders ----------
  const ADD_T = [
    (a, b, x, y) => `Trang trại nhà ${x} nuôi ${F(a)} con gà và ${F(b)} con vịt. Hỏi trang trại nuôi tất cả bao nhiêu con gà và vịt?`,
    (a, b) => `Thư viện có ${F(a)} quyển truyện và ${F(b)} quyển sách giáo khoa. Thư viện có tất cả bao nhiêu quyển sách?`,
    (a, b) => `Đội thứ nhất trồng được ${F(a)} cây, đội thứ hai trồng được ${F(b)} cây. Cả hai đội trồng được bao nhiêu cây?`,
  ];
  const SUB_T = [
    (a, b) => `Một cửa hàng có ${F(a)} kg gạo, đã bán ${F(b)} kg. Cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`,
    (a, b) => `Một con đường dài ${F(a)} m, đội công nhân đã trải nhựa ${F(b)} m. Còn bao nhiêu mét đường chưa trải nhựa?`,
    (a, b, x) => `${x} có ${F(a)} đồng, ${x} mua sách hết ${F(b)} đồng. Hỏi ${x} còn lại bao nhiêu tiền?`,
  ];
  // Each template says which sizes it suits (a = first number, r = result), so the story stays believable.
  const MUL_T = [
    { ok: a => a <= 48, t: (a, b) => `Mỗi thùng có ${F(a)} hộp sữa. Hỏi ${b} thùng như thế có bao nhiêu hộp sữa?` },
    { ok: a => a <= 5000, t: (a, b) => `Mỗi chuyến xe chở được ${F(a)} kg hàng. Hỏi ${b} chuyến xe như thế chở được bao nhiêu ki-lô-gam hàng?` },
    { ok: a => a >= 500, t: (a, b) => `Mỗi kho chứa ${F(a)} kg thóc. Hỏi ${b} kho như thế chứa bao nhiêu ki-lô-gam thóc?` },
    { ok: () => true, t: (a, b) => `Một nhà máy mỗi ngày may được ${F(a)} cái áo. Hỏi trong ${b} ngày nhà máy may được bao nhiêu cái áo?` },
  ];
  const DIV_T = [
    { ok: (a, b, r) => r <= 50, t: (a, b) => `Có ${F(a)} kg gạo chia đều vào ${b} túi. Hỏi mỗi túi có bao nhiêu ki-lô-gam gạo?` },
    { ok: (a, b, r) => r <= 200, t: (a, b) => `Có ${F(a)} quyển vở chia đều cho ${b} lớp. Hỏi mỗi lớp được bao nhiêu quyển vở?` },
    { ok: (a, b, r) => r <= 300, t: (a, b) => `Một sợi dây dài ${F(a)} cm được cắt thành ${b} đoạn bằng nhau. Mỗi đoạn dài bao nhiêu xăng-ti-mét?` },
    { ok: (a, b, r) => r >= 100, t: (a, b) => `Có ${F(a)} kg thóc chia đều vào ${b} kho. Hỏi mỗi kho chứa bao nhiêu ki-lô-gam thóc?` },
    { ok: (a, b, r) => r >= 100, t: (a, b) => `Có ${F(a)} cây giống chia đều cho ${b} xã. Hỏi mỗi xã nhận được bao nhiêu cây giống?` },
    { ok: (a, b, r) => r >= 100, t: (a, b) => `Một con đường dài ${F(a)} m được chia thành ${b} đoạn bằng nhau để sửa. Mỗi đoạn dài bao nhiêu mét?` },
  ];
  // a plain function, or { ok, t }: pick among those that suit these numbers
  const pickT = (rng, T, a, b, r) => { const fit = T.filter(x => typeof x === 'function' || !x.ok || x.ok(a, b, r)); const x = P(rng, fit.length ? fit : T); return typeof x === 'function' ? x : x.t; };

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
      const r = opRes(a, op, b);
      const wrong = op === '+' ? wrongAdd(a, b) : op === M ? wrongSub(a, b) : op === '×' ? wrongMul(a, b) : wrongDiv(r);
      const expr = `${F(a)} ${op} ${F(b)}`;
      const colV = vz('columnCalc', { a, b, op, reveal: 'none' });
      const colH = vz('columnCalc', { a, b, op, reveal: 'steps' });
      const hint = op === '+' ? 'Đặt tính thẳng cột, cộng từ phải sang trái, nhớ sang hàng bên trái khi tổng ≥ 10.'
        : op === M ? 'Đặt tính thẳng cột, trừ từ phải sang trái; không trừ được thì mượn 1 ở hàng bên trái.'
          : op === '×' ? `Nhân lần lượt từ phải sang trái: lấy ${b} nhân với từng chữ số, nhớ sang hàng bên trái.`
            : `Chia lần lượt từ trái sang phải: mỗi lượt chia, nhân, trừ rồi hạ chữ số tiếp theo.`;
      if (k === 0) return Q(`Đặt tính rồi tính:\n${expr}`, colV, num(r), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, r, [wrong, r + (op === ':' ? 1 : 10), r - (op === ':' ? 1 : 10), r + 100].filter(x => x > 0)), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const [x, y] = two(rng);
        const T = op === '+' ? ADD_T : op === M ? SUB_T : op === '×' ? MUL_T : DIV_T;
        const p = pickT(rng, T, a, b, r)(a, b, x, y);
        let tape;
        const mx = Math.max(a, op === '×' ? r : a);
        if (op === '+') tape = vz('tape', { bars: [{ label: '', units: units(a, Math.max(a, b)), value: F(a) }, { label: '', units: units(b, Math.max(a, b)), value: F(b) }], total: '?' });
        else if (op === M) tape = vz('tape', { bars: [{ label: 'Có', units: units(a, mx), value: F(a) }, { label: 'Bớt', units: units(b, mx), value: F(b) }], diff: '?' });
        else if (op === '×') tape = vz('tape', { bars: [{ label: '', parts: b, units: b, value: F(a) + ' × ' + b }], total: '?' });
        else tape = vz('tape', { bars: [{ label: '', parts: b, units: b, value: '?' }], total: F(a) });
        return Q(p, tape, num(r), op === '+' ? 'Tìm tất cả thì làm phép cộng.' : op === M ? 'Tìm phần còn lại thì làm phép trừ.' : op === '×' ? 'Tìm nhiều nhóm bằng nhau thì làm phép nhân.' : 'Chia đều thành các phần bằng nhau thì làm phép chia.', `Phép tính: ${expr} = ${F(r)}.`);
      }
      if (k === 3) {
        const c = Math.max(0, r + P(rng, [-10, -1, 0, 1, 10, 100]));
        return Q(`So sánh: ${expr} … ${F(c)}`, vz('compare', { left: expr, right: F(c) }), cmpAns(r, c), 'Tính kết quả phép tính trước rồi so sánh.', `${expr} = ${F(r)}; ${F(r)} ${sign(r, c)} ${F(c)}.`);
      }
      if (wrong !== r) {
        const who = nm(rng);
        return Q(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, colV, num(r), 'Làm lại từng bước, chú ý phần nhớ và chữ số 0.', `${expr} = ${F(r)}.`, { hintVisual: colH });
      }
      if (op === '+') return Q(`Tìm số hạng chưa biết:\n${F(a)} + ? = ${F(r)}`, null, num(b), 'Lấy tổng trừ đi số hạng đã biết.', `${F(r)} ${M} ${F(a)} = ${F(b)}.`);
      if (op === M) return Q(`Tìm số bị trừ:\n? ${M} ${F(b)} = ${F(r)}`, null, num(a), 'Số bị trừ = hiệu + số trừ.', `${F(r)} + ${F(b)} = ${F(a)}.`);
      if (op === '×') return Q(`Tìm thừa số chưa biết:\n? × ${b} = ${F(r)}`, null, num(a), 'Lấy tích chia cho thừa số đã biết.', `${F(r)} : ${b} = ${F(a)}.`);
      return Q(`Tìm số bị chia:\n? : ${b} = ${F(r)}`, null, num(a), 'Số bị chia = thương × số chia.', `${F(r)} × ${b} = ${F(a)}.`);
    };
    // gen: practice (form by i % 5). exam: level 1 = đặt tính rồi tính, level 2–3 = bài toán có lời văn.
    const gen = (rng, i) => at(rng, lv(i), i % 5);
    gen.exam = (rng, level) => (level === 1 ? at(rng, 1, 0) : at(rng, level === 2 ? 1 : 2, 2));
    return gen;
  }

  // Multiplication + division tables
  const MCTX = {
    2: { per: 'Mỗi đôi đũa có 2 chiếc', who: 'đôi đũa', what: 'chiếc đũa', e: '🥢' },
    3: { per: 'Mỗi chiếc xích lô có 3 bánh xe', who: 'chiếc xích lô', what: 'bánh xe', e: '🛞' },
    4: { per: 'Mỗi con mèo có 4 chân', who: 'con mèo', what: 'cái chân', e: '🐱' },
    5: { per: 'Mỗi bông hoa có 5 cánh', who: 'bông hoa', what: 'cánh hoa', e: '🌸' },
    6: { per: 'Mỗi hộp có 6 cái bánh', who: 'hộp', what: 'cái bánh', e: '🧁' },
    7: { per: 'Mỗi tuần lễ có 7 ngày', who: 'tuần lễ', what: 'ngày', e: '📅' },
    8: { per: 'Mỗi con bạch tuộc có 8 cái tua', who: 'con bạch tuộc', what: 'cái tua', e: '🐙' },
    9: { per: 'Mỗi hàng có 9 cây bắp cải', who: 'hàng', what: 'cây bắp cải', e: '🥬' },
  };
  function tableGen(ns) {
    const k2 = (rng, i) => (lv(i) === 0 ? R(rng, 2, 5) : R(rng, 2, 10));
    return more(tableBase(ns), [
      // đúng / sai
      [0, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k, mul = R(rng, 0, 1), off = P(rng, [0, 0, 1, -1, n, -n]);
        const st = mul ? `${n} × ${k} = ${p + off}` : `${p} : ${n} = ${k + (off === n || off === -n ? Math.sign(off) : off)}`;
        const ok = off === 0;
        return Q(`Đúng hay sai?\n${st}`, null, tf(rng, ok), mul ? `Nhẩm bảng nhân ${n}.` : `Nhẩm bảng chia ${n}: ${n} × ? = ${p}.`, mul ? `${n} × ${k} = ${p}. ${ok ? 'Đúng' : 'Sai'}.` : `${p} : ${n} = ${k}. ${ok ? 'Đúng' : 'Sai'}.`);
      }],
      // đếm thêm
      [0, 6, (rng) => {
        const n = P(rng, ns), s = R(rng, 1, 6), miss = R(rng, 1, 3), seq = [0, 1, 2, 3, 4].map(j => n * (s + j));
        return Q(`Đếm thêm ${n} rồi tìm số thích hợp ở ô ?:\n${seq.map((v, j) => (j === miss ? '?' : v)).join(', ')}`, null, num(seq[miss]), `Mỗi số liền sau hơn số liền trước ${n} đơn vị.`, `${seq.join(', ')}.`);
      }],
      // phép nhân phù hợp với hình
      [0, 6, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), c = MCTX[n];
        return Q(`Có ${k} hàng, mỗi hàng ${n} hình. Phép nhân nào cho biết có tất cả bao nhiêu hình?`, vz('array', { rows: k, cols: n, emoji: c.e }), ch(rng, `${n} × ${k} = ${n * k}`, [`${n} + ${k} = ${n + k}`, `${n} × ${k + 1} = ${n * (k + 1)}`, `${n} × ${k - 1} = ${n * (k - 1)}`]), `${n} được lấy ${k} lần.`, `${n} × ${k} = ${n * k}.`);
      }],
      // điền dấu × hoặc :
      [3, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k, mul = R(rng, 0, 1);
        const [a, b, c] = mul ? (R(rng, 0, 1) ? [n, k, p] : [k, n, p]) : (R(rng, 0, 1) ? [p, n, k] : [p, k, n]);
        return Q(`Chọn dấu thích hợp thay cho ô ?:\n${a} ? ${b} = ${c}`, null, { kind: 'text', options: ['×', ':'], correct: mul ? 0 : 1 }, 'Thử tính với từng dấu.', `${a} ${mul ? '×' : ':'} ${b} = ${c}.`);
      }],
      // tìm số bị chia
      [3, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k;
        return Q(`Số thích hợp ở ô ?:\n? : ${n} = ${k}`, null, num(p), 'Số bị chia = thương × số chia.', `${k} × ${n} = ${p}. Vậy ${p} : ${n} = ${k}.`);
      }],
      // bài toán chia đều
      [3, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k, x = nm(rng);
        const [what, into] = P(rng, [['quả cam', 'đĩa'], ['cái kẹo', 'túi'], ['bông hoa', 'lọ'], ['quyển vở', 'bạn'], ['cái bánh', 'hộp']]);
        const s = into === 'bạn' ? `${x} chia đều ${p} ${what} cho ${n} bạn. Hỏi mỗi bạn được mấy ${what}?` : `${x} xếp đều ${p} ${what} vào ${n} ${into}. Hỏi mỗi ${into} có mấy ${what}?`;
        return Q(s, shareV(p, n), num(k), `Chia đều thì làm phép chia: ${p} : ${n}.`, `${p} : ${n} = ${k} (${what}).`);
      }],
      // từ một phép nhân đã biết suy ra phép nhân kế tiếp
      [6, 9, (rng) => {
        const n = P(rng, ns), k = R(rng, 2, 9), p = n * k, up = R(rng, 0, 1);
        return up
          ? Q(`Biết ${n} × ${k} = ${p}. Vậy ${n} × ${k + 1} = ?`, null, num(p + n), `${n} × ${k + 1} nhiều hơn ${n} × ${k} đúng ${n} đơn vị.`, `${n} × ${k + 1} = ${p} + ${n} = ${p + n}.`)
          : Q(`Biết ${n} × ${k} = ${p}. Vậy ${n} × ${k - 1} = ?`, null, num(p - n), `${n} × ${k - 1} ít hơn ${n} × ${k} đúng ${n} đơn vị.`, `${n} × ${k - 1} = ${p} ${M} ${n} = ${p - n}.`);
      }],
      // bài toán hai bước đơn giản
      [7, 9, (rng) => {
        const n = P(rng, ns), k = R(rng, 2, 9), x = nm(rng), [box, item] = P(rng, [['hộp', 'cái bánh'], ['túi', 'quả cam'], ['bó', 'bông hoa'], ['gói', 'cái kẹo']]), c = R(rng, 1, n * k - 1);
        return Q(`Mỗi ${box} có ${n} ${item}. ${x} có ${k} ${box} như thế và đã cho bạn ${c} ${item}. Hỏi ${x} còn lại bao nhiêu ${item}?`, vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(n) }], total: '?' }), num(n * k - c), `Bước 1: tìm số ${item} có lúc đầu (${n} × ${k}). Bước 2: trừ đi số đã cho.`, `${n} × ${k} = ${n * k}; ${n * k} ${M} ${c} = ${n * k - c} (${item}).`);
      }],
    ], 3);
  }
  function tableBase(ns) {
    return function (rng, i) {
      const n = P(rng, ns), L = lv(i);
      const k = L === 0 ? R(rng, 1, 5) : R(rng, 2, 10);
      const p = n * k, c = MCTX[n], f = i % 6;
      if (f === 0) return Q(`${n} × ${k} = ?`, vz('array', { rows: k, cols: n, emoji: c.e }), num(p), `${n} được lấy ${k} lần. Có thể lấy ${n} × ${k - 1 || 1} rồi cộng thêm ${n}.`, `${n} × ${k} = ${p}.`);
      if (f === 1) return Q(`${p} : ${n} = ?`, shareV(p, n, c.e), num(k), `Nhớ bảng nhân ${n}: ${n} × ? = ${p}.`, `${p} : ${n} = ${k} vì ${n} × ${k} = ${p}.`);
      if (f === 2) return Q(`${c.per}. Hỏi ${k} ${c.who} có bao nhiêu ${c.what}?`, vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(n) }], total: '?' }), num(p), `${n} được lấy ${k} lần.`, `${n} × ${k} = ${p} (${c.what}).`);
      if (f === 3) return Q(`${c.per}. Có ${p} ${c.what} thì có bao nhiêu ${c.who}?`, vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(n) }], total: String(p) }), num(k), `Chia ${p} thành các nhóm, mỗi nhóm ${n}.`, `${p} : ${n} = ${k} (${c.who}).`);
      if (f === 4) {
        if (R(rng, 0, 1)) return Q(`Số thích hợp ở ô ?:\n${n} × ? = ${p}`, null, num(k), `Nhẩm bảng nhân ${n}.`, `${n} × ${k} = ${p}.`);
        return Q(`Số thích hợp ở ô ?:\n${p} : ? = ${k}`, null, num(n), 'Lấy số bị chia chia cho thương.', `${p} : ${k} = ${n}.`);
      }
      const k2 = R(rng, 1, 10), m2 = P(rng, ns.length > 1 ? ns : [n, n === 9 ? 8 : n + 1]);
      const right = m2 * k2;
      return Q(`So sánh: ${n} × ${k} … ${m2} × ${k2}`, vz('compare', { left: `${n} × ${k}`, right: `${m2} × ${k2}` }), cmpAns(p, right), 'Tính tích hai bên rồi so sánh.', `${n} × ${k} = ${p}; ${m2} × ${k2} = ${right}. Vậy ${p} ${sign(p, right)} ${right}.`);
    };
  }

  // ============ CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG ============
  const PV3 = ['Trăm', 'Chục', 'Đơn vị'];
  const c1 = {
    id: 'g3-c1', semester: 1, title: 'Ôn tập và bổ sung', icon: '🔢', lessons: [
      lesson(1, 1, 'Ôn tập các số đến 1000',
        'Rô-bốt ISA cùng bạn Mai đếm số ghế trong hội trường của trường.',
        [
          { text: 'Số 638 gồm 6 trăm, 3 chục, 8 đơn vị; đọc là "sáu trăm ba mươi tám".', visual: vz('blocks', { hundreds: 6, tens: 3, ones: 8 }) },
          { text: '638 = 600 + 30 + 8.', visual: vz('placeValue', { number: 638, columns: PV3 }) },
          { text: 'So sánh từ hàng trăm: 638 > 592 vì 6 trăm > 5 trăm.', visual: vz('compare', { left: 638, right: 592 }) },
        ],
        function (rng, i) {
          const n = R(rng, 100, 999), f = i % 5;
          if (f === 0) return Q(`Số "${readVN(n)}" viết là:`, null, num(n), 'Viết lần lượt chữ số hàng trăm, chục, đơn vị.', `"${readVN(n)}" viết là ${n}.`);
          if (f === 1) { const m = Math.floor(n / 100) * 100 + R(rng, 0, 99); return Q(`So sánh: ${n} … ${m}`, vz('compare', { left: n, right: m }), cmpAns(n, m), 'So sánh từ hàng trăm, rồi chục, rồi đơn vị.', `${n} ${sign(n, m)} ${m}.`); }
          if (f === 2) { const e = expand(n); return Q(`Viết số ${n} thành tổng các trăm, chục, đơn vị:`, vz('blocks', { hundreds: Math.floor(n / 100), tens: Math.floor(n / 10) % 10, ones: n % 10 }), ch(rng, e.join(' + '), [[Math.floor(n / 100) * 10, (n % 100)].join(' + '), [Math.floor(n / 100) * 100, n % 100 + 1].join(' + '), [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10].join(' + ')]), 'Mỗi chữ số có giá trị theo hàng của nó.', `${n} = ${e.join(' + ')}.`); }
          if (f === 3) { const a0 = Math.floor(n / 10) * 10; const u = a0 + R(rng, 1, 9); return Q('Số thích hợp ở ô ? trên tia số là:', vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: 5, unknown: u }), num(u), 'Đếm thêm 1 từ vạch có số.', `Số cần điền là ${u}.`); }
          const arr = U.sample(rng, Array.from({ length: 900 }, (_, k) => k + 100), 4), asc = arr.slice().sort((x, y) => x - y), s = a => a.join(', ');
          return Q(`Sắp xếp ${arr.join('; ')} theo thứ tự từ bé đến lớn:`, null, ch(rng, s(asc), [s(asc.slice().reverse()), s(arr), s([asc[0], asc[2], asc[1], asc[3]])]), 'Tìm số bé nhất trước.', `${s(asc)}.`);
        }),

      lesson(1, 2, 'Ôn tập phép cộng, phép trừ trong phạm vi 1000',
        'Rô-bốt ISA giúp bạn Nam tính số vé bán được ở hội chợ Xuân.',
        [
          { text: 'Đặt tính thẳng cột rồi cộng từ phải sang trái: 356 + 278 = 634.', visual: vz('columnCalc', { a: 356, b: 278, op: '+', reveal: 'all' }) },
          { text: 'Trừ có nhớ: 724 − 358 = 366.', visual: vz('columnCalc', { a: 724, b: 358, op: M, reveal: 'all' }) },
        ],
        mixCol([
          ['+', (r, L) => pairWhere(r, [100, 700], [10, 500], (a, b) => a + b <= 999 && (L === 0 || !noCarry(a, b)), [356, 278])],
          [M, (r, L) => pairWhere(r, [200, 999], [10, 800], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [724, 358])],
        ])),

      lesson(1, 3, 'Tìm thành phần trong phép cộng, phép trừ',
        'Rô-bốt ISA và bạn Chi tìm số bị che bởi chiếc lá trong bài toán.',
        [
          { text: 'Muốn tìm số hạng chưa biết, ta lấy tổng trừ đi số hạng kia: ? + 25 = 60 thì ? = 60 − 25 = 35.', visual: vz('tape', { bars: [{ label: '', units: 7, value: '?' }, { label: '', units: 5, value: '25' }], total: '60' }) },
          { text: 'Muốn tìm số bị trừ, lấy hiệu cộng với số trừ. Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu.' },
        ],
        function (rng, i) {
          const L = lv(i), mx = L === 0 ? 100 : 1000;
          const a = R(rng, 10, mx / 2), b = R(rng, 10, mx / 2 - 1), s = a + b, f = i % 4;
          if (f === 0) return Q(`Tìm số hạng chưa biết:\n? + ${b} = ${s}`, vz('tape', { bars: [{ label: '', units: units(a, s), value: '?' }, { label: '', units: units(b, s), value: String(b) }], total: String(s) }), num(a), 'Lấy tổng trừ đi số hạng đã biết.', `? = ${s} ${M} ${b} = ${a}.`);
          if (f === 1) return Q(`Tìm số bị trừ:\n? ${M} ${b} = ${a}`, null, num(s), 'Lấy hiệu cộng với số trừ.', `? = ${a} + ${b} = ${s}.`);
          if (f === 2) return Q(`Tìm số trừ:\n${s} ${M} ? = ${a}`, null, num(b), 'Lấy số bị trừ trừ đi hiệu.', `? = ${s} ${M} ${a} = ${b}.`);
          const x = nm(rng);
          return Q(`${x} có một số viên bi, ${x} cho em ${b} viên thì còn lại ${a} viên. Hỏi lúc đầu ${x} có bao nhiêu viên bi?`, vz('tape', { bars: [{ label: 'Lúc đầu', units: units(s, s), value: '?' }, { label: 'Cho em', units: units(b, s), value: String(b) }], diff: String(a) }), num(s), 'Số lúc đầu = số còn lại + số đã cho.', `${a} + ${b} = ${s} (viên bi).`);
        }),

      lesson(1, 4, 'Ôn tập bảng nhân 2, 5; bảng chia 2, 5',
        'Rô-bốt ISA cùng bạn Hà đếm đũa và hoa chuẩn bị cho mâm cơm ngày Tết.',
        [
          { text: '2 × 6 = 12 nên 12 : 2 = 6. Phép chia là phép tính ngược của phép nhân.', visual: vz('array', { rows: 6, cols: 2, emoji: '🥢' }) },
          { text: '5 × 4 = 20 nên 20 : 5 = 4 và 20 : 4 = 5.', visual: vz('share', { total: 20, groups: 5, emoji: '🌸' }) },
        ],
        tableGen([2, 5])),
      lesson(1, 5, 'Bảng nhân 3, bảng chia 3',
        'Rô-bốt ISA đếm bánh xe của những chiếc xích lô chở khách trên phố cổ.',
        [
          { text: '3 × 1 = 3, 3 × 2 = 6, 3 × 3 = 9, … Mỗi lần thêm 3.', visual: vz('numberLine', { min: 0, max: 30, step: 3, labelEvery: 1, hops: [{ from: 0, to: 3, label: '+3' }, { from: 3, to: 6, label: '+3' }, { from: 6, to: 9, label: '+3' }] }) },
          { text: 'Từ 3 × 4 = 12 ta có 12 : 3 = 4.', visual: vz('share', { total: 12, groups: 3, emoji: '🍊' }) },
        ],
        tableGen([3])),
      lesson(1, 6, 'Bảng nhân 4, bảng chia 4',
        'Rô-bốt ISA đếm chân những chú mèo đang sưởi nắng trong sân nhà bạn Vy.',
        [
          { text: '4 × 1 = 4, 4 × 2 = 8, 4 × 3 = 12, … đếm thêm 4.', visual: vz('array', { rows: 3, cols: 4, emoji: '🐾' }) },
          { text: 'Từ 4 × 5 = 20 ta có 20 : 4 = 5.', visual: vz('share', { total: 20, groups: 4, emoji: '🍬' }) },
        ],
        tableGen([4])),
    ],
  };

  // ============ CHỦ ĐỀ 2. BẢNG NHÂN, BẢNG CHIA ============
  function fracShape(rng) { return P(rng, ['bar', 'pie', 'rect']); }
  const c2 = {
    id: 'g3-c2', semester: 1, title: 'Bảng nhân, bảng chia', icon: '✖️', lessons: [
      lesson(2, 9, 'Bảng nhân 6, bảng chia 6',
        'Rô-bốt ISA xếp bánh vào hộp 6 chiếc cùng bạn Phúc để mang đi biếu ông bà.',
        [
          { text: '6 × 3 = 18: 3 hộp, mỗi hộp 6 cái bánh.', visual: vz('array', { rows: 3, cols: 6, emoji: '🧁' }) },
          { text: 'Từ 6 × 7 = 42 ta có 42 : 6 = 7 và 42 : 7 = 6.' },
        ],
        tableGen([6])),
      lesson(2, 10, 'Bảng nhân 7, bảng chia 7',
        'Rô-bốt ISA đếm số ngày trong các tuần của kì nghỉ hè cùng bạn Quân.',
        [
          { text: '7 × 2 = 14: 2 tuần lễ có 14 ngày.', visual: vz('array', { rows: 2, cols: 7, emoji: '📅' }) },
          { text: 'Từ 7 × 6 = 42 ta có 42 : 7 = 6.', visual: vz('numberLine', { min: 0, max: 70, step: 7, labelEvery: 1, hops: [{ from: 0, to: 7, label: '+7' }, { from: 7, to: 14, label: '+7' }] }) },
        ],
        tableGen([7])),
      lesson(2, 11, 'Bảng nhân 8, bảng chia 8',
        'Rô-bốt ISA cùng bạn Lan ngắm những chú bạch tuộc ở thủy cung.',
        [
          { text: '8 × 3 = 24: mỗi con bạch tuộc có 8 tua, 3 con có 24 tua.', visual: vz('array', { rows: 3, cols: 8, emoji: '🐙' }) },
          { text: 'Từ 8 × 9 = 72 ta có 72 : 8 = 9.' },
        ],
        tableGen([8])),
      lesson(2, 12, 'Bảng nhân 9, bảng chia 9',
        'Rô-bốt ISA giúp bác nông dân đếm những luống bắp cải xanh mướt.',
        [
          { text: '9 × 4 = 36: 4 hàng, mỗi hàng 9 cây.', visual: vz('array', { rows: 4, cols: 9, emoji: '🥬' }) },
          { text: 'Mẹo: 9 × 6 = 60 − 6 = 54. Từ đó 54 : 9 = 6.' },
        ],
        tableGen([9])),

      lesson(2, 13, 'Tìm thành phần trong phép nhân, phép chia',
        'Rô-bốt ISA và bạn Tú giải câu đố tìm số còn thiếu trên bảng lớp.',
        [
          { text: 'Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số kia: ? × 4 = 28 thì ? = 28 : 4 = 7.', visual: vz('array', { rows: 4, cols: 7 }) },
          { text: 'Muốn tìm số bị chia, lấy thương nhân với số chia. Muốn tìm số chia, lấy số bị chia chia cho thương.' },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), b = R(rng, 2, lv(i) === 0 ? 5 : 9), p = a * b, f = i % 4;
          if (f === 0) return Q(`Tìm thừa số chưa biết:\n? × ${b} = ${p}`, vz('array', { rows: b, cols: a }), num(a), 'Lấy tích chia cho thừa số đã biết.', `? = ${p} : ${b} = ${a}.`);
          if (f === 1) return Q(`Tìm số bị chia:\n? : ${b} = ${a}`, null, num(p), 'Lấy thương nhân với số chia.', `? = ${a} × ${b} = ${p}.`);
          if (f === 2) return Q(`Tìm số chia:\n${p} : ? = ${a}`, shareV(p, b), num(b), 'Lấy số bị chia chia cho thương.', `? = ${p} : ${a} = ${b}.`);
          return Q(`Có ${p} học sinh xếp đều thành các hàng, mỗi hàng ${a} bạn. Hỏi xếp được mấy hàng?`, vz('array', { rows: b, cols: a, emoji: '🧒' }), num(b), `Lấy ${p} chia cho ${a}.`, `${p} : ${a} = ${b} (hàng).`);
        }),

      lesson(2, 14, 'Một phần mấy',
        'Rô-bốt ISA chia chiếc bánh chưng thành các phần bằng nhau cho cả nhà bạn Ngọc.',
        [
          { text: 'Chia hình tròn thành 4 phần bằng nhau, tô màu 1 phần: đã tô màu 1/4 (một phần tư) hình tròn.', visual: vz('fraction', { num: 1, den: 4, shape: 'pie' }) },
          { text: '1/3 của 12 quả cam: chia 12 quả thành 3 phần bằng nhau, mỗi phần 4 quả. 12 : 3 = 4.', visual: vz('share', { total: 12, groups: 3, emoji: '🍊' }) },
        ],
        function (rng, i) {
          const n = R(rng, 2, lv(i) === 0 ? 5 : 9), f = i % 4;
          const fs = d => `1/${d}`;
          if (f === 0) return Q('Đã tô màu một phần mấy của hình?', vz('fraction', { num: 1, den: n, shape: fracShape(rng) }), ch(rng, fs(n), [fs(n + 1), fs(n - 1 > 1 ? n - 1 : n + 2), `${n}/1`, fs(n + 2)]), 'Đếm xem hình được chia thành mấy phần bằng nhau.', `Hình được chia thành ${n} phần bằng nhau, tô màu 1 phần: 1/${n}.`);
          if (f === 1) { const q = R(rng, 2, 9), t = q * n; return Q(`1/${n} của ${t} quả cam là bao nhiêu quả?`, shareV(t, n, '🍊'), num(q), `Chia ${t} thành ${n} phần bằng nhau.`, `${t} : ${n} = ${q} (quả).`); }
          if (f === 2) return Q(`Em hãy tô màu 1/${n} hình (chạm vào các phần để tô).`, vz('fraction', { num: 0, den: n, shape: fracShape(rng) }), { kind: 'visual', check: v => v === 1 }, `Hình có ${n} phần bằng nhau, tô 1 phần.`, `1/${n} nghĩa là 1 trong ${n} phần bằng nhau.`);
          const q = R(rng, 2, 9), t = q * n, x = nm(rng);
          return Q(`${x} có ${t} cái kẹo, ${x} cho em 1/${n} số kẹo đó. Hỏi ${x} cho em bao nhiêu cái kẹo?`, vz('tape', { bars: [{ label: 'Số kẹo', parts: n, units: n, value: String(t) }] }), num(q), `Tìm 1/${n} của ${t}: lấy ${t} : ${n}.`, `${t} : ${n} = ${q} (cái kẹo).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. LÀM QUEN VỚI HÌNH PHẲNG, HÌNH KHỐI ============
  const c3 = {
    id: 'g3-c3', semester: 1, title: 'Làm quen với hình phẳng, hình khối', icon: '📐', lessons: [
      lesson(3, 16, 'Điểm ở giữa, trung điểm của đoạn thẳng',
        'Rô-bốt ISA tìm điểm chính giữa sợi dây để bạn Bình treo chiếc đèn ông sao.',
        [
          { text: 'M là trung điểm của đoạn thẳng AB khi M ở giữa A và B và AM = MB. Đoạn AB dài 8 cm thì AM = MB = 4 cm.', visual: vz('ruler', { length: 8, unit: 'cm', object: 'ribbon' }) },
          { text: 'Muốn tìm độ dài nửa đoạn thẳng, ta lấy độ dài đoạn thẳng chia cho 2.' },
        ],
        more(function (rng, i) {
          const h = R(rng, 2, lv(i) === 0 ? 6 : 12), L = h * 2, f = i % 4;
          if (f === 0) return Q(`M là trung điểm của đoạn thẳng AB. Đoạn thẳng AB dài ${L} cm. Đoạn thẳng AM dài bao nhiêu xăng-ti-mét?`, vz('ruler', { length: L, unit: 'cm', object: 'ribbon' }), num(h, 'cm'), 'Trung điểm chia đoạn thẳng thành hai phần bằng nhau.', `${L} : 2 = ${h} (cm).`);
          if (f === 1) return Q(`O là trung điểm của đoạn thẳng CD. Đoạn OC dài ${h} cm. Đoạn thẳng CD dài bao nhiêu xăng-ti-mét?`, null, num(L, 'cm'), 'CD gồm hai đoạn bằng nhau OC và OD.', `${h} × 2 = ${L} (cm).`);
          if (f === 2) return Q(`Trên tia số, điểm nào là trung điểm của đoạn thẳng nối số 0 và số ${L}? Chạm vào vạch đó.`, vz('numberLine', { min: 0, max: L, step: 1, labelEvery: L > 12 ? 2 : 1, marks: [0, L] }), { kind: 'visual', check: v => v === h }, 'Trung điểm cách đều hai đầu.', `${L} : 2 = ${h}. Trung điểm ứng với số ${h}.`);
          return Q('Điểm M là trung điểm của đoạn thẳng AB khi nào?', null, ch(rng, 'M ở giữa A, B và AM = MB', ['M ở giữa A và B', 'AM dài hơn MB', 'M nằm ngoài đoạn thẳng AB']), 'Cần đủ hai điều: ở giữa và chia đôi.', 'M là trung điểm khi M ở giữa A, B và AM = MB.');
        }, [
          [0, 5, rng => { const [X, Y, Z] = U.sample(rng, ['A', 'B', 'C', 'D', 'M', 'N', 'O', 'I', 'K', 'P', 'Q', 'E'], 3); return Q(`Ba điểm ${X}, ${Y}, ${Z} cùng nằm trên một đường thẳng theo thứ tự đó. Điểm nào là điểm ở giữa hai điểm ${X} và ${Z}?`, null, ch(rng, `Điểm ${Y}`, [`Điểm ${X}`, `Điểm ${Z}`]), 'Điểm ở giữa nằm giữa hai điểm còn lại.', `${Y} nằm giữa ${X} và ${Z} nên ${Y} là điểm ở giữa hai điểm ${X} và ${Z}.`); }],
          [0, 5, (rng, i) => { const h = R(rng, 2, lv(i) === 0 ? 6 : 15); return Q(`M là trung điểm của đoạn thẳng AB, đoạn AM dài ${h} cm. Đoạn MB dài bao nhiêu xăng-ti-mét?`, null, num(h, 'cm'), 'Trung điểm chia đoạn thẳng thành hai đoạn bằng nhau: AM = MB.', `MB = AM = ${h} cm.`); }],
          [3, 9, (rng, i) => { const h = R(rng, 2, lv(i) === 1 ? 9 : 20), L = 2 * h, cl = P(rng, [h, h, L, h + 1, h - 1]); return Q(`Đúng hay sai?\nM là trung điểm của đoạn thẳng AB dài ${L} cm thì đoạn AM dài ${cl} cm.`, null, tf(rng, cl === h), 'AM bằng một nửa AB.', `AM = ${L} : 2 = ${h} (cm). ${cl === h ? 'Đúng' : 'Sai'}.`); }],
          [3, 9, (rng, i) => { const a = R(rng, 0, 10), h = R(rng, 1, lv(i) === 1 ? 4 : 7), b = a + 2 * h; return Q(`Trên tia số, trung điểm của đoạn thẳng nối số ${a} và số ${b} ứng với số nào?`, vz('numberLine', { min: a, max: b, step: 1, labelEvery: 2 * h, marks: [a, b] }), num(a + h), 'Trung điểm cách đều hai đầu đoạn thẳng.', `Đoạn thẳng dài ${2 * h} vạch; mỗi nửa ${h} vạch: ${a} + ${h} = ${a + h}.`); }],
          [3, 9, (rng, i) => { const h = R(rng, 2, lv(i) === 1 ? 9 : 25), L = 2 * h, x = nm(rng), [it, u, uu] = P(rng, [['sợi dây', 'cm', 'xăng-ti-mét'], ['thanh gỗ', 'dm', 'đề-xi-mét'], ['sợi ruy băng', 'cm', 'xăng-ti-mét']]); return Q(`${x} có một ${it} dài ${L} ${u}. ${x} cắt ${it} đó tại trung điểm. Mỗi đoạn dài bao nhiêu ${uu}?`, u === 'cm' && L <= 20 ? vz('ruler', { length: L, unit: 'cm', object: 'ribbon' }) : null, num(h, u), 'Cắt tại trung điểm thì được hai đoạn bằng nhau.', `${L} : 2 = ${h} (${u}).`); }],
          [7, 9, rng => { const k = R(rng, 1, 9); return Q(`M là trung điểm của đoạn thẳng AB dài ${k} dm. Đoạn AM dài bao nhiêu xăng-ti-mét?`, null, num(k * 5, 'cm'), 'Đổi ra xăng-ti-mét trước: 1 dm = 10 cm.', `${k} dm = ${k * 10} cm; ${k * 10} : 2 = ${k * 5} (cm).`); }],
        ])),

      lesson(3, 17, 'Hình tròn. Tâm, bán kính, đường kính của hình tròn',
        'Rô-bốt ISA dùng com-pa vẽ chiếc mặt trăng tròn cho đêm Trung thu cùng bạn Thảo.',
        [
          { text: 'Hình tròn tâm O. Đoạn thẳng từ tâm đến một điểm trên đường tròn là bán kính.', visual: vz('shape', { kind: 'circle', dims: { r: 3 }, showDims: true, label: 'O' }) },
          { text: 'Đường kính dài gấp 2 lần bán kính: bán kính 3 cm thì đường kính 6 cm.' },
        ],
        function (rng, i) {
          const r = R(rng, 2, lv(i) === 0 ? 5 : 15), f = i % 4;
          if (f === 0) return Q(`Hình tròn có bán kính ${r} cm. Đường kính dài bao nhiêu xăng-ti-mét?`, vz('shape', { kind: 'circle', dims: { r }, showDims: true }), num(r * 2, 'cm'), 'Đường kính gấp 2 lần bán kính.', `${r} × 2 = ${r * 2} (cm).`);
          if (f === 1) return Q(`Hình tròn có đường kính ${r * 2} cm. Bán kính dài bao nhiêu xăng-ti-mét?`, vz('shape', { kind: 'circle' }), num(r, 'cm'), 'Bán kính bằng một nửa đường kính.', `${r * 2} : 2 = ${r} (cm).`);
          if (f === 2) return Q('Trong một hình tròn, tất cả các bán kính …', null, ch(rng, 'đều bằng nhau', ['dài hơn đường kính', 'khác nhau', 'bằng đường kính']), 'Mọi điểm trên đường tròn cách đều tâm.', 'Các bán kính của một hình tròn đều bằng nhau.');
          return Q(`Muốn vẽ hình tròn có đường kính ${r * 2} cm, em mở com-pa (khẩu độ) bao nhiêu xăng-ti-mét?`, vz('shape', { kind: 'circle' }), num(r, 'cm'), 'Khẩu độ com-pa bằng bán kính.', `Bán kính = ${r * 2} : 2 = ${r} (cm).`);
        }),

      lesson(3, 18, 'Góc, góc vuông, góc không vuông',
        'Rô-bốt ISA dùng ê ke kiểm tra các góc bàn học của bạn Minh.',
        [
          { text: 'Đây là góc vuông. Dùng ê ke để kiểm tra góc vuông.', visual: vz('angle', { deg: 90 }) },
          { text: 'Góc này không vuông.', visual: vz('angle', { deg: 50 }) },
          { text: 'Hình chữ nhật và hình vuông đều có 4 góc vuông.', visual: vz('shape', { kind: 'rect' }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const deg = R(rng, 0, 1) ? 90 : P(rng, [40, 60, 120, 135, 70, 110]); return Q('Góc dưới đây là góc vuông hay góc không vuông?', vz('angle', { deg }), ch(rng, deg === 90 ? 'Góc vuông' : 'Góc không vuông', [deg === 90 ? 'Góc không vuông' : 'Góc vuông']), 'Đặt ê ke vào đỉnh góc để kiểm tra.', deg === 90 ? 'Đây là góc vuông.' : 'Đây là góc không vuông.'); }
          if (f === 1) { const k = P(rng, ['rect', 'square']); const n = 4; const nmK = { rect: 'Hình chữ nhật', square: 'Hình vuông' }[k]; return Q(`${nmK} có mấy góc vuông?`, vz('shape', { kind: k }), num(n), 'Dùng ê ke kiểm tra từng góc.', `${nmK} có ${n} góc vuông.`); }
          const degs = Array.from({ length: R(rng, 4, 6) }, () => P(rng, [90, 90, 45, 60, 120, 150, 30]));
          if (!degs.includes(90)) degs[0] = 90;
          const c = degs.filter(d => d === 90).length;
          const items = degs.map(d => (d === 90 ? 'rect' : 'circle'));
          return Q('Mỗi hình chữ nhật có 4 góc vuông, hình tròn không có góc nào. Các hình dưới đây có tất cả bao nhiêu góc vuông?', vz('shapeSet', { items }), num(c * 4), 'Đếm số hình chữ nhật rồi nhân với 4.', `Có ${c} hình chữ nhật: ${c} × 4 = ${c * 4} (góc vuông).`);
        }, [
          [0, 9, rng => {
            const O = P(rng, ['O', 'M', 'I', 'K', 'E', 'H']), [A, B] = U.sample(rng, ['A', 'B', 'C', 'D', 'P', 'Q', 'N', 'G'], 2), deg = P(rng, [90, 90, 50, 120, 70]);
            if (R(rng, 0, 1)) return Q('Góc dưới đây có đỉnh là điểm nào?', vz('angle', { deg, label: A + O + B }), ch(rng, `Đỉnh ${O}`, [`Đỉnh ${A}`, `Đỉnh ${B}`]), 'Đỉnh góc là điểm chung của hai cạnh.', `Góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B}.`);
            return Q('Hai cạnh của góc dưới đây là:', vz('angle', { deg, label: A + O + B }), ch(rng, `${O}${A} và ${O}${B}`, [`${A}${B} và ${O}${A}`, `${A}${O} và ${A}${B}`, `${B}${A} và ${B}${O}`]), 'Hai cạnh của góc cùng xuất phát từ đỉnh.', `Góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B}.`);
          }],
          [3, 9, rng => { const O = P(rng, ['O', 'M', 'I', 'K', 'E', 'H']), [A, B] = U.sample(rng, ['A', 'B', 'C', 'D', 'P', 'Q', 'N', 'G'], 2), deg = P(rng, [90, 90, 90, 40, 60, 80, 100, 120, 140]), ok = deg === 90; return Q(`Dùng ê ke kiểm tra rồi cho biết: góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B} là góc vuông hay góc không vuông?`, vz('angle', { deg, label: A + O + B }), ch(rng, ok ? 'Góc vuông' : 'Góc không vuông', [ok ? 'Góc không vuông' : 'Góc vuông']), 'Đặt góc vuông của ê ke trùng đỉnh và một cạnh của góc.', `Góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B} là ${ok ? 'góc vuông' : 'góc không vuông'}.`); }],
          [0, 6, rng => { const [k, n, nmK] = P(rng, [['rect', 4, 'Hình chữ nhật'], ['square', 4, 'Hình vuông'], ['rtriangle', 1, 'Hình tam giác'], ['triangle', 0, 'Hình tam giác'], ['quad', 0, 'Hình tứ giác']]); return Q(`${nmK} dưới đây có mấy góc vuông?`, vz('shape', { kind: k }), num(n), 'Dùng ê ke kiểm tra từng góc của hình.', `${nmK} này có ${n} góc vuông.`); }],
          [3, 9, rng => { const h = P(rng, [3, 9, 3, 9, 1, 2, 4, 5, 7, 8, 10, 11]), ok = h === 3 || h === 9; return Q(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc vuông hay góc không vuông?`, vz('clock', { h, m: 0 }), ch(rng, ok ? 'Góc vuông' : 'Góc không vuông', [ok ? 'Góc không vuông' : 'Góc vuông']), 'Dùng ê ke kiểm tra góc tạo bởi hai kim.', `Lúc ${h} giờ hai kim tạo thành ${ok ? 'góc vuông' : 'góc không vuông'}.`); }],
          [3, 9, rng => { const [st, ok] = P(rng, [['Hình vuông có 4 góc vuông', true], ['Hình chữ nhật có 2 góc vuông', false], ['Hình chữ nhật có 4 góc vuông', true], ['Ê ke dùng để kiểm tra góc vuông', true], ['Hình tròn có 4 góc vuông', false], ['Mỗi góc có 3 cạnh', false], ['Mỗi góc có một đỉnh và hai cạnh', true], ['Hình vuông có 2 góc vuông và 2 góc không vuông', false]]); return Q(`Đúng hay sai?\n${st}.`, null, tf(rng, ok), 'Nhớ: góc có một đỉnh, hai cạnh; hình chữ nhật, hình vuông có 4 góc vuông.', `${ok ? 'Đúng' : 'Sai'}.`); }],
          [6, 9, rng => { const r = R(rng, 1, 4), q = R(rng, 1, 3), t = R(rng, 0, 2), items = U.shuffle(rng, [...Array(r).fill('rect'), ...Array(q).fill('square'), ...Array(t).fill('circle')]); return Q('Các hình chữ nhật và hình vuông dưới đây có tất cả bao nhiêu góc vuông?', vz('shapeSet', { items }), num((r + q) * 4), 'Mỗi hình chữ nhật, mỗi hình vuông có 4 góc vuông; hình tròn không có góc.', `Có ${r + q} hình có 4 góc vuông: ${r + q} × 4 = ${(r + q) * 4} (góc vuông).`); }],
        ], 1)),

      lesson(3, 19, 'Hình tam giác, hình tứ giác. Hình chữ nhật, hình vuông',
        'Rô-bốt ISA cùng bạn Hùng tìm các hình trên những viên gạch lát sân trường.',
        [
          { text: 'Hình chữ nhật có 4 góc vuông, 2 chiều dài bằng nhau và 2 chiều rộng bằng nhau.', visual: vz('shape', { kind: 'rect', dims: { a: 5, b: 3 }, showDims: true }) },
          { text: 'Hình vuông có 4 góc vuông và 4 cạnh dài bằng nhau.', visual: vz('shape', { kind: 'square', dims: { a: 4 }, showDims: true }) },
          { text: 'Hình tam giác có 3 cạnh, 3 đỉnh, 3 góc. Hình tứ giác có 4 cạnh, 4 đỉnh, 4 góc.', visual: vz('shapeSet', { items: ['triangle', 'quad'] }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0 || f === 2) {
            const target = f === 0 ? P(rng, ['triangle', 'rect']) : 'square';
            const pool = target === 'rect' ? ['rect', 'rect', 'triangle', 'circle', 'quad', 'trapezoid'] : target === 'square' ? ['square', 'square', 'rect', 'triangle', 'circle', 'rhombus'] : ['triangle', 'triangle', 'quad', 'circle', 'rect', 'square'];
            const items = U.sample(rng, pool, 5);
            if (!items.includes(target)) items[R(rng, 0, 4)] = target;
            const want = items.map((k, j) => (k === target ? j : -1)).filter(j => j >= 0);
            const nmT = { triangle: 'hình tam giác', rect: 'hình chữ nhật', square: 'hình vuông' }[target];
            return Q(`Chạm chọn tất cả các ${nmT}.`, vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) }, target === 'triangle' ? 'Hình tam giác có 3 cạnh.' : target === 'rect' ? 'Hình chữ nhật có 4 góc vuông, hai cặp cạnh đối bằng nhau.' : 'Hình vuông có 4 góc vuông và 4 cạnh bằng nhau.', `Có ${want.length} ${nmT}.`);
          }
          if (f === 1) { const a = R(rng, 4, 12), b = R(rng, 2, a - 1); return Q(`Hình chữ nhật ABCD có AB = ${a} cm, BC = ${b} cm. Cạnh CD dài bao nhiêu xăng-ti-mét?`, vz('shape', { kind: 'rect', dims: { a, b }, showDims: true, label: 'ABCD' }), num(a, 'cm'), 'Hai cạnh đối diện của hình chữ nhật bằng nhau.', `CD = AB = ${a} cm.`); }
          const qs = [['Hình tam giác có mấy đỉnh?', 3], ['Hình tứ giác có mấy cạnh?', 4], ['Hình vuông có mấy cạnh bằng nhau?', 4], ['Hình chữ nhật có mấy góc vuông?', 4]];
          const [p, v] = P(rng, qs);
          return Q(p, vz('shapeSet', { items: ['triangle', 'quad', 'rect', 'square'] }), num(v), 'Đếm trên hình vẽ.', `Đáp án: ${v}.`);
        }),

      lesson(3, 21, 'Khối lập phương, khối hộp chữ nhật',
        'Rô-bốt ISA xếp những hộp quà Tết thành tháp cùng bạn An.',
        [
          { text: 'Khối lập phương có 6 mặt là hình vuông bằng nhau, 8 đỉnh, 12 cạnh.', visual: vz('solid', { kind: 'cube' }) },
          { text: 'Khối hộp chữ nhật có 6 mặt là hình chữ nhật, 8 đỉnh, 12 cạnh.', visual: vz('solid', { kind: 'box' }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const k = P(rng, ['cube', 'box']); const [p, v] = P(rng, [['mấy mặt', 6], ['mấy đỉnh', 8], ['mấy cạnh', 12]]); const nmK = k === 'cube' ? 'Khối lập phương' : 'Khối hộp chữ nhật'; return Q(`${nmK} có ${p}?`, vz('solid', { kind: k }), num(v), 'Quan sát và đếm, nhớ cả những phần bị che khuất.', `${nmK} có ${v} ${p.replace('mấy ', '')}.`); }
          if (f === 1) { const k = P(rng, ['cube', 'box', 'cylinder', 'sphere']); const N = { cube: 'Khối lập phương', box: 'Khối hộp chữ nhật', cylinder: 'Khối trụ', sphere: 'Khối cầu' }; return Q('Đây là khối gì?', vz('solid', { kind: k }), ch(rng, N[k], Object.values(N)), 'Khối lập phương có các mặt là hình vuông; khối hộp chữ nhật có các mặt là hình chữ nhật.', `Đây là ${N[k].toLowerCase()}.`); }
          const l = R(rng, 2, 3), w = R(rng, 1, 2), h = R(rng, 1, lv(i) === 2 ? 3 : 2);
          return Q('Hình dưới đây được xếp bởi bao nhiêu khối lập phương nhỏ?', vz('cubes', { l, w, h }), num(l * w * h), 'Đếm số khối ở một tầng rồi nhân với số tầng.', `Mỗi tầng ${l} × ${w} = ${l * w} khối, ${h} tầng: ${l * w} × ${h} = ${l * w * h} (khối).`);
        }, [
          [0, 9, rng => { const [st, ok] = P(rng, [['Khối lập phương có 6 mặt đều là hình vuông', true], ['Khối hộp chữ nhật có 6 mặt', true], ['Khối lập phương có 6 đỉnh', false], ['Khối hộp chữ nhật có 12 cạnh', true], ['Khối lập phương có 8 cạnh', false], ['Khối hộp chữ nhật có 8 đỉnh', true], ['Khối hộp chữ nhật có 4 mặt', false], ['Khối lập phương có 12 cạnh', true]]); return Q(`Đúng hay sai?\n${st}.`, vz('solid', { kind: /lập phương/.test(st) ? 'cube' : 'box' }), tf(rng, ok), 'Khối lập phương và khối hộp chữ nhật đều có 6 mặt, 8 đỉnh, 12 cạnh.', `${ok ? 'Đúng' : 'Sai'}. Khối lập phương, khối hộp chữ nhật đều có 6 mặt, 8 đỉnh, 12 cạnh.`); }],
          [0, 6, rng => { const cube = R(rng, 0, 1), good = P(rng, cube ? ['Con xúc xắc', 'Khối ru-bích'] : ['Viên gạch', 'Bao diêm', 'Hộp bút', 'Quyển sách']); const bad = U.sample(rng, cube ? ['Viên gạch', 'Quả bóng', 'Lon nước ngọt', 'Bao diêm', 'Quả cam'] : ['Quả bóng', 'Lon nước ngọt', 'Quả cam', 'Ống hút'], 3); return Q(`Đồ vật nào có dạng ${cube ? 'khối lập phương' : 'khối hộp chữ nhật'}?`, vz('solid', { kind: cube ? 'cube' : 'box' }), ch(rng, good, bad), cube ? 'Khối lập phương có các mặt là hình vuông bằng nhau.' : 'Khối hộp chữ nhật có các mặt là hình chữ nhật.', `${good} có dạng ${cube ? 'khối lập phương' : 'khối hộp chữ nhật'}.`); }],
          [3, 9, rng => { const k = R(rng, 2, 9), x = nm(rng), [w, v] = P(rng, [['mặt', 6], ['đỉnh', 8]]), kind = P(rng, ['khối lập phương', 'khối hộp chữ nhật']); return Q(`${x} có ${k} hộp quà dạng ${kind}. Hỏi ${k} hộp quà đó có tất cả bao nhiêu ${w}?`, vz('solid', { kind: kind === 'khối lập phương' ? 'cube' : 'box' }), num(k * v), `Mỗi hộp có ${v} ${w}.`, `${v} × ${k} = ${v * k} (${w}).`); }],
          [6, 9, rng => { const l = R(rng, 2, 3), w = R(rng, 1, 2), h = R(rng, 1, 2); return Q('Hình dưới đây được xếp bởi các khối lập phương nhỏ. Nếu xếp thêm 1 tầng như thế lên trên thì cần tất cả bao nhiêu khối lập phương nhỏ?', vz('cubes', { l, w, h }), num(l * w * (h + 1)), 'Đếm số khối ở một tầng, rồi nhân với số tầng mới.', `Mỗi tầng ${l} × ${w} = ${l * w} khối; ${h + 1} tầng: ${l * w} × ${h + 1} = ${l * w * (h + 1)} (khối).`); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 4. PHÉP NHÂN, PHÉP CHIA TRONG PHẠM VI 100 ============
  const c4 = {
    id: 'g3-c4', semester: 1, title: 'Phép nhân, phép chia trong phạm vi 100', icon: '🧮', lessons: [
      lesson(4, 23, 'Nhân số có hai chữ số với số có một chữ số',
        'Rô-bốt ISA giúp cô giáo tính số vở cần phát cho các tổ trong lớp bạn Trang.',
        [
          { text: '23 × 3: 3 nhân 3 bằng 9, viết 9; 3 nhân 2 bằng 6, viết 6. Vậy 23 × 3 = 69.', visual: vz('columnCalc', { a: 23, b: 3, op: '×', reveal: 'all' }) },
          { text: 'Có nhớ: 26 × 3: 3 nhân 6 bằng 18, viết 8 nhớ 1; 3 nhân 2 bằng 6, thêm 1 bằng 7. Vậy 26 × 3 = 78.', visual: vz('columnCalc', { a: 26, b: 3, op: '×', reveal: 'all' }) },
        ],
        colGen('×', (r, L) => pairWhere(r, [11, 49], [2, L === 0 ? 3 : 6], (a, b) => a * b <= 99 && (L === 0 || (a % 10) * b >= 10), [26, 3]))),

      lesson(4, 24, 'Gấp một số lên một số lần',
        'Rô-bốt ISA cùng bạn Việt so sánh số nhãn vở hai anh em có.',
        [
          { text: 'Muốn gấp một số lên nhiều lần, ta lấy số đó nhân với số lần. Gấp 4 lên 3 lần: 4 × 3 = 12.', visual: vz('tape', { bars: [{ label: 'Em', parts: 1, units: 1, value: '4' }, { label: 'Anh', parts: 3, units: 3, value: '?' }] }) },
        ],
        more(function (rng, i) {
          const a = R(rng, 2, lv(i) === 0 ? 9 : 30), k = R(rng, 2, lv(i) === 0 ? 5 : 9);
          const r = a * k > 99 ? null : a * k;
          const aa = r == null ? R(rng, 2, Math.floor(99 / k)) : a, rr = aa * k, f = i % 3;
          const tape = vz('tape', { bars: [{ label: 'Số bé', parts: 1, units: 1, value: String(aa) }, { label: 'Gấp lên', parts: k, units: k, value: '?' }] });
          if (f === 0) return Q(`Gấp ${aa} lên ${k} lần được bao nhiêu?`, tape, num(rr), `Lấy ${aa} nhân với ${k}.`, `${aa} × ${k} = ${rr}.`);
          if (f === 1) { const [x, y] = two(rng); return Q(`${x} có ${aa} viên bi, số bi của ${y} gấp ${k} lần số bi của ${x}. Hỏi ${y} có bao nhiêu viên bi?`, vz('tape', { bars: [{ label: x, parts: 1, units: 1, value: String(aa) }, { label: y, parts: k, units: k, value: '?' }] }), num(rr), `Gấp lên ${k} lần thì nhân với ${k}.`, `Số bi của ${y} là: ${aa} × ${k} = ${rr} (viên bi).`); }
          return Q(`Gấp ${aa} lên ${k} lần, rồi thêm ${k}. Kết quả là bao nhiêu?`, tape, ch(rng, rr + k, [aa + k + k, rr, aa * k * 2]), 'Gấp lên là nhân, thêm là cộng. Chú ý: "gấp lên" khác "thêm".', `${aa} × ${k} = ${rr}; ${rr} + ${k} = ${rr + k}.`);
        }, [
          [0, 6, (rng, i) => {
            const a = R(rng, 2, lv(i) === 0 ? 9 : 15), k = R(rng, 2, Math.min(9, Math.floor(99 / a)));
            const [tx, u, w] = P(rng, [
              [`Đoạn dây xanh dài ${a} cm, đoạn dây đỏ dài gấp ${k} lần đoạn dây xanh. Hỏi đoạn dây đỏ dài bao nhiêu xăng-ti-mét?`, 'cm', 'cm'],
              [`Bao gạo nhỏ nặng ${a} kg, bao gạo to nặng gấp ${k} lần bao gạo nhỏ. Hỏi bao gạo to nặng bao nhiêu ki-lô-gam?`, 'kg', 'kg'],
              [`Tổ Một trồng được ${a} cây, số cây tổ Hai trồng được gấp ${k} lần số cây của tổ Một. Hỏi tổ Hai trồng được bao nhiêu cây?`, '', 'cây'],
              [`Can nhỏ đựng ${a} l nước, can to đựng gấp ${k} lần can nhỏ. Hỏi can to đựng bao nhiêu lít nước?`, 'l', 'l']]);
            return Q(tx, vz('tape', { bars: [{ label: '', parts: 1, units: 1, value: String(a) }, { label: '', parts: k, units: k, value: '?' }] }), u ? num(a * k, u) : num(a * k), `Gấp lên ${k} lần thì nhân với ${k}.`, `${a} × ${k} = ${a * k} (${w}).`);
          }],
          [0, 9, (rng, i) => { const a = R(rng, 2, 9), k = R(rng, 2, lv(i) === 0 ? 5 : 9), r = a * k, cl = P(rng, [r, r, a + k, r + a]); return Q(`Đúng hay sai?\nGấp ${a} lên ${k} lần được ${cl}.`, null, tf(rng, cl === r), 'Gấp lên một số lần thì nhân, không phải cộng.', `${a} × ${k} = ${r}. ${cl === r ? 'Đúng' : 'Sai'}.`); }],
          [3, 9, rng => { const a = R(rng, 2, 9), k = R(rng, 2, 9); return Q(`Gấp ${a} lên ${k} lần, và thêm ${k} vào ${a}. Hai kết quả lần lượt là:`, null, ch(rng, `${a * k} và ${a + k}`, [`${a + k} và ${a * k}`, `${a * k} và ${a * k + k}`, `${a * k + k} và ${a + k}`]), 'Gấp lên: nhân. Thêm: cộng.', `${a} × ${k} = ${a * k}; ${a} + ${k} = ${a + k}.`); }],
          [6, 9, rng => { const k = R(rng, 2, 9), a = R(rng, 2, Math.floor(99 / k)); return Q(`Một số gấp lên ${k} lần thì được ${a * k}. Tìm số đó.`, vz('tape', { bars: [{ label: 'Số đó', parts: 1, units: 1, value: '?' }, { label: 'Gấp lên', parts: k, units: k, value: String(a * k) }] }), num(a), `? × ${k} = ${a * k}: lấy ${a * k} chia cho ${k}.`, `${a * k} : ${k} = ${a}.`); }],
          [7, 9, rng => { const [x, y] = two(rng), k = R(rng, 2, 5), a = R(rng, 3, Math.floor(80 / (k + 1))); return Q(`${x} có ${a} nhãn vở, ${y} có số nhãn vở gấp ${k} lần của ${x}. Hỏi cả hai bạn có bao nhiêu nhãn vở?`, vz('tape', { bars: [{ label: x, parts: 1, units: 1, value: String(a) }, { label: y, parts: k, units: k, value: '?' }], total: '?' }), num(a + a * k), `Bước 1: tìm số nhãn vở của ${y}. Bước 2: cộng số nhãn vở của hai bạn.`, `${y}: ${a} × ${k} = ${a * k}; cả hai: ${a} + ${a * k} = ${a + a * k} (nhãn vở).`); }],
        ])),

      lesson(4, 25, 'Phép chia hết, phép chia có dư',
        'Rô-bốt ISA chia kẹo cho các bạn và thấy còn thừa vài cái.',
        [
          { text: '12 : 3 = 4 là phép chia hết (không còn thừa).', visual: vz('share', { total: 12, groups: 3, emoji: '🍬' }) },
          { text: '14 : 3 = 4 (dư 2) là phép chia có dư. Số dư bao giờ cũng bé hơn số chia.', visual: vz('columnCalc', { a: 14, b: 3, op: ':', reveal: 'all' }) },
        ],
        function (rng, i) {
          const b = R(rng, 2, 9), q = R(rng, 1, 9), r = R(rng, 1, b - 1), a = b * q + r, f = i % 5;
          const fr = (x, y) => `${x} (dư ${y})`;
          if (f === 0) return Q(`${a} : ${b} = ?`, vz('columnCalc', { a, b, op: ':', reveal: 'none' }), ch(rng, fr(q, r), [fr(q + 1, r), fr(q - 1 >= 0 ? q - 1 : q + 2, r + b), fr(q, r + 1 < b ? r + 1 : r - 1 || b - 1)]), 'Tìm số lớn nhất trong bảng nhân không vượt quá số bị chia.', `${a} : ${b} = ${q} (dư ${r}) vì ${b} × ${q} = ${b * q}, ${a} ${M} ${b * q} = ${r}.`, { hintVisual: vz('columnCalc', { a, b, op: ':', reveal: 'steps' }) });
          if (f === 1) return Q(`Tìm số dư của phép chia ${a} : ${b}.`, vz('columnCalc', { a, b, op: ':', reveal: 'none' }), num(r), `${b} × ${q} = ${b * q}.`, `${a} : ${b} = ${q} (dư ${r}).`);
          if (f === 2) { const ex = b * R(rng, 2, 9); const d = [1, 2, 3].map(() => { const bb = R(rng, 2, 9); return [bb * R(rng, 1, 9) + R(rng, 1, bb - 1), bb]; }); return Q('Phép chia nào là phép chia hết?', null, ch(rng, `${ex} : ${b}`, d.map(([x, y]) => `${x} : ${y}`)), 'Phép chia hết khi số bị chia có trong bảng nhân của số chia.', `${ex} : ${b} = ${ex / b}, không dư.`); }
          if (f === 3) return Q(`Trong phép chia có dư với số chia là ${b}, số dư lớn nhất có thể là bao nhiêu?`, null, num(b - 1), 'Số dư luôn bé hơn số chia.', `Số dư lớn nhất là ${b} ${M} 1 = ${b - 1}.`);
          { // a class of 20–40 pupils, 2–4 to a desk
            const bb = P(rng, [2, 3, 4]), qq = R(rng, Math.ceil(20 / bb), Math.floor(38 / bb)), rr = R(rng, 1, bb - 1), aa = bb * qq + rr;
            return Q(`Lớp có ${aa} học sinh, mỗi bàn ngồi ${bb} bạn. Cần ít nhất bao nhiêu bàn để tất cả các bạn đều có chỗ ngồi?`, vz('columnCalc', { a: aa, b: bb, op: ':', reveal: 'none' }), num(qq + 1), `${aa} : ${bb} = ${qq} (dư ${rr}). ${rr} bạn còn lại cũng cần 1 bàn.`, `${aa} : ${bb} = ${qq} (dư ${rr}); cần ${qq} + 1 = ${qq + 1} (bàn).`);
          }
        }),

      lesson(4, 26, 'Chia số có hai chữ số cho số có một chữ số',
        'Rô-bốt ISA chia đều những quả bưởi vào các giỏ quà Trung thu.',
        [
          { text: '84 : 4: 8 chia 4 được 2, viết 2; 4 chia 4 được 1, viết 1. Vậy 84 : 4 = 21.', visual: vz('columnCalc', { a: 84, b: 4, op: ':', reveal: 'all' }) },
          { text: '72 : 3: 7 chia 3 được 2, dư 1; hạ 2 được 12, 12 chia 3 được 4. Vậy 72 : 3 = 24.', visual: vz('columnCalc', { a: 72, b: 3, op: ':', reveal: 'all' }) },
        ],
        colGen(':', (r, L) => pairWhere(r, [20, 99], [2, L === 0 ? 4 : 9], (a, b) => a % b === 0 && a / b >= 10 && (L === 0 || Math.floor(a / 10) % b !== 0), [72, 3]))),

      lesson(4, 27, 'Giảm một số đi một số lần',
        'Rô-bốt ISA giúp mẹ bạn Lan chia nhỏ mớ rau để bán ở chợ quê.',
        [
          { text: 'Muốn giảm một số đi nhiều lần, ta chia số đó cho số lần. Giảm 12 đi 3 lần: 12 : 3 = 4.', visual: vz('tape', { bars: [{ label: 'Lúc đầu', parts: 3, units: 3, value: '12' }, { label: 'Sau khi giảm', parts: 1, units: 1, value: '?' }] }) },
          { text: 'Chú ý: "giảm đi 3 lần" (chia cho 3) khác "giảm đi 3 đơn vị" (trừ đi 3).' },
        ],
        more(function (rng, i) {
          const k = R(rng, 2, lv(i) === 0 ? 5 : 9), q = R(rng, 2, lv(i) === 0 ? 9 : Math.floor(99 / k)), a = q * k, f = i % 3;
          const tape = vz('tape', { bars: [{ label: 'Lúc đầu', parts: k, units: k, value: String(a) }, { label: 'Sau khi giảm', parts: 1, units: 1, value: '?' }] });
          if (f === 0) return Q(`Giảm ${a} đi ${k} lần được bao nhiêu?`, tape, num(q), `Lấy ${a} chia cho ${k}.`, `${a} : ${k} = ${q}.`);
          if (f === 1) return Q(`Một cửa hàng có ${a} kg đường. Sau một tuần, số đường giảm đi ${k} lần. Hỏi cửa hàng còn bao nhiêu ki-lô-gam đường?`, tape, num(q, 'kg'), `Giảm đi ${k} lần thì chia cho ${k}.`, `${a} : ${k} = ${q} (kg).`);
          return Q(`Số ${a} giảm đi ${k} lần và số ${a} giảm đi ${k} đơn vị. Hai kết quả lần lượt là:`, null, ch(rng, `${q} và ${a - k}`, [`${a - k} và ${q}`, `${q} và ${a + k}`, `${a * k} và ${a - k}`]), 'Giảm đi nhiều lần: chia. Giảm đi một số đơn vị: trừ.', `${a} : ${k} = ${q}; ${a} ${M} ${k} = ${a - k}.`);
        }, [
          [0, 6, (rng, i) => {
            const k = R(rng, 2, lv(i) === 0 ? 5 : 9), q = R(rng, 2, Math.min(lv(i) === 0 ? 9 : 11, Math.floor(99 / k))), a = q * k;
            const [tx, u, w] = P(rng, [
              [`Sợi dây dài ${a} m. Sau khi cắt, sợi dây ngắn đi ${k} lần. Hỏi sợi dây còn lại dài bao nhiêu mét?`, 'm', 'm'],
              [`Đàn vịt có ${a} con, số gà bằng số vịt giảm đi ${k} lần. Hỏi có bao nhiêu con gà?`, '', 'con gà'],
              [`Bố mua ${a} kg cam, số ki-lô-gam táo bằng số ki-lô-gam cam giảm đi ${k} lần. Hỏi bố mua bao nhiêu ki-lô-gam táo?`, 'kg', 'kg'],
              [`Thùng to có ${a} l nước, số lít nước ở thùng nhỏ bằng số lít nước ở thùng to giảm đi ${k} lần. Hỏi thùng nhỏ có bao nhiêu lít nước?`, 'l', 'l']]);
            return Q(tx, vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(a) }, { label: '', parts: 1, units: 1, value: '?' }] }), u ? num(q, u) : num(q), `Giảm đi ${k} lần thì chia cho ${k}.`, `${a} : ${k} = ${q} (${w}).`);
          }],
          [0, 9, (rng, i) => { const k = R(rng, 2, lv(i) === 0 ? 5 : 9), q = R(rng, 2, 9), a = q * k, cl = P(rng, [q, q, a - k, q + 1]); return Q(`Đúng hay sai?\nGiảm ${a} đi ${k} lần được ${cl}.`, null, tf(rng, cl === q), 'Giảm đi một số lần thì chia, không phải trừ.', `${a} : ${k} = ${q}. ${cl === q ? 'Đúng' : 'Sai'}.`); }],
          [3, 9, rng => { const k = R(rng, 2, 9), q = R(rng, 2, 9), a = q * k; return Q(`So sánh: ${a} giảm đi ${k} lần … ${a} giảm đi ${k} đơn vị`, vz('compare', { left: `${a} : ${k}`, right: `${a} ${M} ${k}` }), cmpAns(q, a - k), 'Giảm đi nhiều lần: chia. Giảm đi một số đơn vị: trừ.', `${a} : ${k} = ${q}; ${a} ${M} ${k} = ${a - k}; ${q} ${sign(q, a - k)} ${a - k}.`); }],
          [6, 9, rng => { const k = R(rng, 2, 9), q = R(rng, 2, Math.floor(99 / k)), a = q * k; return Q(`Một số giảm đi ${k} lần thì được ${q}. Tìm số đó.`, vz('tape', { bars: [{ label: 'Số đó', parts: k, units: k, value: '?' }, { label: 'Sau khi giảm', parts: 1, units: 1, value: String(q) }] }), num(a), `? : ${k} = ${q}: lấy ${q} nhân với ${k}.`, `${q} × ${k} = ${a}.`); }],
          [7, 9, rng => { const k = R(rng, 2, 5), q = R(rng, 3, Math.floor(99 / k)), a = q * k, x = nm(rng); return Q(`${x} có ${a} viên bi. Sau khi cho bạn, số bi của ${x} giảm đi ${k} lần. Hỏi ${x} đã cho bạn bao nhiêu viên bi?`, vz('tape', { bars: [{ label: 'Lúc đầu', parts: k, units: k, value: String(a) }, { label: 'Còn lại', parts: 1, units: 1, value: '?' }] }), num(a - q), `Bước 1: tìm số bi còn lại (${a} : ${k}). Bước 2: lấy số bi lúc đầu trừ số bi còn lại.`, `Còn lại: ${a} : ${k} = ${q} (viên bi); đã cho: ${a} ${M} ${q} = ${a - q} (viên bi).`); }],
        ])),

      lesson(4, 28, 'Bài toán giải bằng hai bước tính',
        'Rô-bốt ISA cùng bạn Dũng giải bài toán về những thùng nước mắm ở làng chài.',
        [
          { text: 'Thùng thứ nhất có 24 l, thùng thứ hai nhiều hơn 8 l. Bước 1: thùng thứ hai có 24 + 8 = 32 (l). Bước 2: cả hai thùng có 24 + 32 = 56 (l).', visual: vz('tape', { bars: [{ label: 'Thùng 1', units: 6, value: '24 l' }, { label: 'Thùng 2', units: 8, value: '? l' }], diff: '8 l', total: '? l' }) },
          { text: 'Đọc kĩ đề, tìm cái chưa biết cần tính trước (bước 1) rồi mới tìm cái đề hỏi (bước 2).' },
        ],
        function (rng, i) {
          const t = i % 4, x = nm(rng);
          if (t === 0) { const a = R(rng, 12, 40), d = R(rng, 3, 15), b = a + d, s = a + b; return Q(`Thùng thứ nhất có ${a} l dầu, thùng thứ hai nhiều hơn thùng thứ nhất ${d} l. Hỏi cả hai thùng có bao nhiêu lít dầu?`, vz('tape', { bars: [{ label: 'Thùng 1', units: units(a, b), value: a + ' l' }, { label: 'Thùng 2', units: units(b, b), value: '?' }], diff: d + ' l', total: '?' }), num(s, 'l'), 'Bước 1: tìm số lít dầu ở thùng thứ hai.', `Thùng thứ hai: ${a} + ${d} = ${b} (l). Cả hai thùng: ${a} + ${b} = ${s} (l).`); }
          if (t === 1) { const per = R(rng, 4, 9), n = R(rng, 3, 9), e = R(rng, 1, per * n - 1); return Q(`Mỗi hộp có ${per} cái bánh. Mẹ mua ${n} hộp, cả nhà đã ăn ${e} cái bánh. Hỏi còn lại bao nhiêu cái bánh?`, vz('tape', { bars: [{ label: 'Số bánh', parts: n, units: n, value: `${per} × ${n}` }], total: '?' }), num(per * n - e), 'Bước 1: tìm số bánh mẹ mua.', `Số bánh: ${per} × ${n} = ${per * n} (cái). Còn lại: ${per * n} ${M} ${e} = ${per * n - e} (cái).`); }
          if (t === 2) { const a = R(rng, 3, 15), k = R(rng, 2, 5); const y = P(rng, U.NAMES.filter(z => z !== x)); return Q(`${x} có ${a} quyển truyện. ${y} có số truyện gấp ${k} lần ${x}. Hỏi cả hai bạn có bao nhiêu quyển truyện?`, vz('tape', { bars: [{ label: x, parts: 1, units: 1, value: String(a) }, { label: y, parts: k, units: k, value: '?' }], total: '?' }), num(a + a * k), `Bước 1: tìm số truyện của ${y}.`, `${y}: ${a} × ${k} = ${a * k} (quyển). Cả hai: ${a} + ${a * k} = ${a + a * k} (quyển).`); }
          const a = R(rng, 50, 99), b = R(rng, 10, 30), c = R(rng, 5, a - b - 5); return Q(`Một cửa hàng có ${a} kg gạo. Buổi sáng bán được ${b} kg, buổi chiều bán được ${c} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, vz('tape', { bars: [{ label: 'Có', units: 12, value: a + ' kg' }, { label: 'Đã bán', units: units(b + c, a), value: `${b} kg + ${c} kg` }], diff: '?' }), num(a - b - c, 'kg'), 'Bước 1: tìm số gạo đã bán (hoặc số gạo còn sau buổi sáng).', `Đã bán: ${b} + ${c} = ${b + c} (kg). Còn lại: ${a} ${M} ${b + c} = ${a - b - c} (kg).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 5. MỘT SỐ ĐƠN VỊ ĐO ĐỘ DÀI, KHỐI LƯỢNG, DUNG TÍCH, NHIỆT ĐỘ ============
  function gWeights(g) { const out = []; let x = g; for (const k of [500, 200, 100, 50, 20, 10]) while (x >= k) { out.push({ label: k + ' g', kg: k / 1000 }); x -= k; } return out; }
  const c5 = {
    id: 'g3-c5', semester: 1, title: 'Một số đơn vị đo độ dài, khối lượng, dung tích, nhiệt độ', icon: '🌡️', lessons: [
      lesson(5, 30, 'Mi-li-mét',
        'Rô-bốt ISA đo chiếc lá non thật nhỏ trong vườn trường cùng bạn Vy.',
        [
          { text: 'Mi-li-mét viết tắt là mm. 1 cm = 10 mm; 1 m = 1000 mm.', visual: vz('ruler', { length: 3, unit: 'cm', object: 'pencil' }) },
          { text: 'Chiếc kẹp giấy dài 35 mm (3 cm 5 mm).', visual: vz('ruler', { length: 35, unit: 'mm', object: 'ribbon' }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 1, 9); const [p, v, u] = P(rng, [[`${a} cm = ? mm`, a * 10, 'mm'], [`${a * 10} mm = ? cm`, a, 'cm'], [`${a} m = ? mm`, a * 1000, 'mm'], [`${a} cm ${a} mm = ? mm`, a * 11, 'mm']]); return Q(p, null, num(v, u), 'Nhớ: 1 cm = 10 mm; 1 m = 1000 mm.', `${p.replace('?', F(v))}.`); }
          if (f === 1) { const L = R(rng, 12, 95); return Q('Sợi ruy băng dài bao nhiêu mi-li-mét?', vz('ruler', { length: L, unit: 'mm', object: 'ribbon' }), num(L, 'mm'), 'Mỗi vạch nhỏ là 1 mm, mỗi vạch có số là 1 cm = 10 mm.', `Dài ${L} mm.`); }
          if (f === 2) { const a = R(rng, 2, 9), mm = a * 10 + P(rng, [-3, 0, 4, 7]); return Q(`So sánh: ${a} cm … ${mm} mm`, vz('compare', { left: `${a} cm`, right: `${mm} mm` }), cmpAns(a * 10, mm), 'Đổi cm ra mm rồi so sánh.', `${a} cm = ${a * 10} mm; ${a * 10} ${sign(a * 10, mm)} ${mm}.`); }
          const a = R(rng, 15, 60), b = R(rng, 10, 40);
          return Q(`Con sâu thứ nhất dài ${a} mm, con sâu thứ hai dài ${b} mm. Cả hai con sâu dài bao nhiêu mi-li-mét?`, null, num(a + b, 'mm'), 'Cộng hai độ dài.', `${a} + ${b} = ${a + b} (mm).`);
        }),

      lesson(5, 31, 'Gam',
        'Rô-bốt ISA cùng bạn Hà cân bơ và đường để làm bánh bông lan.',
        [
          { text: 'Gam là đơn vị đo khối lượng, viết tắt là g. 1 kg = 1000 g.', visual: vz('scale', { left: [{ label: '🧈', kg: 0.3 }], right: [{ label: '200 g', kg: 0.2 }, { label: '100 g', kg: 0.1 }] }) },
          { text: 'Gói bơ nặng 200 g + 100 g = 300 g.' },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const g = R(rng, 2, lv(i) === 0 ? 5 : 9) * 100 + (lv(i) === 2 ? P(rng, [0, 50]) : 0); const it = P(rng, [['🧈', 'Gói bơ'], ['🍎', 'Quả táo'], ['🍞', 'Ổ bánh mì'], ['🧀', 'Miếng phô mai']]); return Q(`Cân thăng bằng. ${it[1]} nặng bao nhiêu gam?`, vz('scale', { left: [{ label: it[0], kg: g / 1000 }], right: gWeights(g) }), num(g, 'g'), 'Cộng các quả cân ở đĩa bên kia.', `${gWeights(g).map(x => Math.round(x.kg * 1000)).join(' + ')} = ${g} (g).`); }
          if (f === 1) { const a = R(rng, 1, 9); const [p, v, u] = P(rng, [[`${a} kg = ? g`, a * 1000, 'g'], [`${a * 1000} g = ? kg`, a, 'kg'], [`1 kg ${a * 100} g = ? g`, 1000 + a * 100, 'g']]); return Q(p, null, num(v, u), 'Nhớ: 1 kg = 1000 g.', `${p.replace('?', F(v))}.`); }
          if (f === 2) { const a = R(rng, 1, 9) * 100, b = R(rng, 1, 9) * 100; return Q(`Quả dứa nặng ${a} g, quả bưởi nặng ${b} g. ${a === b ? 'So sánh hai quả' : 'Quả nào nặng hơn'}?`, vz('scale', { left: [{ label: '🍍', kg: a / 1000 }], right: [{ label: '🍈', kg: b / 1000 }] }), ch(rng, a > b ? 'Quả dứa' : a < b ? 'Quả bưởi' : 'Nặng bằng nhau', ['Quả dứa', 'Quả bưởi', 'Nặng bằng nhau']), 'So sánh hai số đo khối lượng.', `${a} g ${sign(a, b)} ${b} g.`); }
          const a = R(rng, 2, 6) * 100, b = R(rng, 1, 3) * 100 + 50; return Q(`Mẹ có ${a + b} g đường, mẹ dùng ${b} g để làm bánh. Hỏi mẹ còn lại bao nhiêu gam đường?`, null, num(a, 'g'), 'Bớt đi thì trừ.', `${a + b} ${M} ${b} = ${a} (g).`);
        }),

      lesson(5, 32, 'Mi-li-lít',
        'Rô-bốt ISA giúp bạn Quân pha nước cam mời cả nhà.',
        [
          { text: 'Mi-li-lít viết tắt là ml. 1 l = 1000 ml.', visual: vz('jug', { capacity: 1000, amount: 1000, unit: 'ml' }) },
          { text: 'Cốc này chứa 300 ml nước.', visual: vz('jug', { capacity: 500, amount: 300, unit: 'ml' }) },
        ],
        more(function (rng, i) {
          const f = i % 4;
          if (f === 0) { const cap = P(rng, [500, 1000]), a = R(rng, 1, cap / 100) * 100; return Q('Trong bình có bao nhiêu mi-li-lít nước?', vz('jug', { capacity: cap, amount: a, unit: 'ml' }), num(a, 'ml'), 'Đọc vạch ngang với mặt nước.', `Bình có ${a} ml nước.`); }
          if (f === 1) { const a = R(rng, 1, 5); const [p, v, u] = P(rng, [[`${a} l = ? ml`, a * 1000, 'ml'], [`${a * 1000} ml = ? l`, a, 'l']]); return Q(p, null, num(v, u), 'Nhớ: 1 l = 1000 ml.', `${p.replace('?', F(v))}.`); }
          if (f === 2) { const c = R(rng, 2, 5) * 50, n = R(rng, 2, 4); return Q(`Mỗi cốc chứa ${c} ml sữa. Rót đầy ${n} cốc thì cần bao nhiêu mi-li-lít sữa?`, vz('jug', { capacity: 500, amount: c, unit: 'ml' }), num(c * n, 'ml'), 'Nhân số mi-li-lít một cốc với số cốc.', `${c} × ${n} = ${c * n} (ml).`); }
          const a = R(rng, 1, 4) * 250; return Q(`Chai nước có 1 l, bạn ${nm(rng)} đã uống ${a} ml. Trong chai còn lại bao nhiêu mi-li-lít nước?`, vz('jug', { capacity: 1000, amount: 1000, unit: 'ml' }), num(1000 - a, 'ml'), 'Đổi 1 l = 1000 ml rồi trừ.', `1000 ${M} ${a} = ${1000 - a} (ml).`);
        }, [
          [0, 6, rng => { const a = R(rng, 1, 9) * 50, b = R(rng, 1, 9) * 50, sub = R(rng, 0, 1) === 1 && a !== b; const x = sub ? Math.max(a, b) : a, y = sub ? Math.min(a, b) : b, r = sub ? x - y : x + y; return Q(`${x} ml ${sub ? M : '+'} ${y} ml = ?`, null, num(r, 'ml'), `${sub ? 'Trừ' : 'Cộng'} các số rồi ghi đơn vị ml.`, `${x} ml ${sub ? M : '+'} ${y} ml = ${r} ml.`); }],
          [0, 9, rng => { const [t, u] = P(rng, [['Một thìa nước khoảng 5', 'ml'], ['Một xô nước khoảng 10', 'l'], ['Một lọ thuốc nhỏ mắt khoảng 10', 'ml'], ['Một can nước mắm khoảng 5', 'l'], ['Một cốc sữa khoảng 200', 'ml'], ['Một bể cá nhỏ khoảng 30', 'l'], ['Một chai nước khoáng nhỏ khoảng 500', 'ml']]); return Q(`Chọn đơn vị thích hợp:\n${t} …`, null, ch(rng, u, [u === 'ml' ? 'l' : 'ml']), 'Lượng nước ít thì đo bằng ml, nhiều thì đo bằng l.', `${t} ${u}.`); }],
          [3, 9, rng => { const a = R(rng, 1, 3), b = a * 1000 + P(rng, [-200, -100, 0, 100, 300]); return Q(`So sánh: ${a} l … ${F(b)} ml`, vz('compare', { left: `${a} l`, right: `${F(b)} ml` }), cmpAns(a * 1000, b), 'Đổi lít ra mi-li-lít: 1 l = 1000 ml.', `${a} l = ${a * 1000} ml; ${a * 1000} ${sign(a * 1000, b)} ${F(b)}.`); }],
          [3, 9, rng => { const a = R(rng, 2, 6) * 100, b = R(rng, 1, 4) * 100; return Q(`Bình thứ nhất có ${a} ml nước, bình thứ hai có ${b} ml nước. Hỏi cả hai bình có bao nhiêu mi-li-lít nước?`, vz('jug', { capacity: 1000, amount: a, unit: 'ml' }), num(a + b, 'ml'), 'Cộng số mi-li-lít của hai bình.', `${a} + ${b} = ${a + b} (ml).`); }],
          [6, 9, rng => { const c = P(rng, [100, 150, 200, 250]), n = R(rng, 2, Math.floor(1000 / c) - 1), x = nm(rng); return Q(`Bình có 1 l nước. ${x} rót ra ${n} cốc, mỗi cốc ${c} ml. Hỏi trong bình còn lại bao nhiêu mi-li-lít nước?`, vz('jug', { capacity: 1000, amount: 1000, unit: 'ml' }), num(1000 - c * n, 'ml'), 'Bước 1: tính lượng nước đã rót ra. Bước 2: đổi 1 l = 1000 ml rồi trừ.', `Đã rót: ${c} × ${n} = ${c * n} (ml). Còn lại: 1000 ${M} ${c * n} = ${1000 - c * n} (ml).`); }],
        ])),

      lesson(5, 33, 'Nhiệt độ. Đơn vị đo nhiệt độ',
        'Rô-bốt ISA cùng bạn Nam đo nhiệt độ ngoài sân vào một buổi sáng mùa đông.',
        [
          { text: 'Nhiệt độ được đo bằng nhiệt kế, đơn vị là độ C (°C). Nhiệt kế này chỉ 25 °C.', visual: vz('thermometer', { value: 25, min: 0, max: 50 }) },
          { text: 'Nhiệt độ cơ thể người khỏe mạnh khoảng 37 °C. Nước đá đang tan ở 0 °C.', visual: vz('thermometer', { value: 37, min: 0, max: 50 }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const v = R(rng, lv(i) === 0 ? 2 : 1, lv(i) === 0 ? 9 : 45) * (lv(i) === 0 ? 5 : 1); return Q('Nhiệt kế chỉ bao nhiêu độ C?', vz('thermometer', { value: v, min: 0, max: 50 }), num(v, '°C'), 'Đọc số ở vạch ngang với đỉnh cột chất lỏng.', `Nhiệt kế chỉ ${v} °C.`); }
          if (f === 1) { const a = R(rng, 15, 25), d = R(rng, 3, 10); return Q(`Buổi sáng nhiệt độ là ${a} °C, đến trưa nhiệt độ tăng thêm ${d} °C. Hỏi buổi trưa nhiệt độ là bao nhiêu?`, vz('thermometer', { value: a, min: 0, max: 50 }), num(a + d, '°C'), 'Tăng thêm thì cộng.', `${a} + ${d} = ${a + d} (°C).`); }
          if (f === 2) { const [p, c, d] = P(rng, [['Nhiệt độ cơ thể người khỏe mạnh khoảng', '37 °C', ['17 °C', '73 °C', '0 °C']], ['Nước đá đang tan có nhiệt độ', '0 °C', ['37 °C', '100 °C', '10 °C']], ['Một ngày hè nóng ở Hà Nội có thể lên tới', '38 °C', ['8 °C', '83 °C', '0 °C']]]); return Q(`${p} …`, null, ch(rng, c, d), 'Nhớ lại những nhiệt độ quen thuộc.', `${p} ${c}.`); }
          const a = R(rng, 15, 35), b = R(rng, 15, 35); return Q(`Hà Nội: ${a} °C, Đà Lạt: ${b} °C. So sánh nhiệt độ: ${a} °C … ${b} °C`, vz('thermometer', { value: Math.max(a, b), min: 0, max: 50 }), cmpAns(a, b), 'So sánh hai số đo.', `${a} °C ${sign(a, b)} ${b} °C.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. PHÉP NHÂN, PHÉP CHIA TRONG PHẠM VI 1000 ============
  function exprGen(rng, L) {
    const t = R(rng, 0, L === 0 ? 2 : 5);
    if (t === 0) { const a = R(rng, 100, 500), b = R(rng, 10, 300), c = R(rng, 10, a + b - 1); return { s: `${a} + ${b} ${M} ${c}`, v: a + b - c, w: a + b + c, how: `${a} + ${b} = ${a + b}; ${a + b} ${M} ${c} = ${a + b - c}`, rule: 'Biểu thức chỉ có cộng, trừ: tính từ trái sang phải.' }; }
    if (t === 1) { const a = R(rng, 10, 200), b = R(rng, 2, 9), c = R(rng, 2, 9); return { s: `${a} + ${b} × ${c}`, v: a + b * c, w: (a + b) * c, how: `${b} × ${c} = ${b * c}; ${a} + ${b * c} = ${a + b * c}`, rule: 'Nhân, chia trước; cộng, trừ sau.' }; }
    if (t === 2) { const c = R(rng, 2, 9), q = R(rng, 2, 20), b = c * q, a = R(rng, b, 500); return { s: `${a} ${M} ${b} : ${c}`, v: a - q, w: a - b >= 0 && (a - b) % c === 0 ? (a - b) / c : a - b, how: `${b} : ${c} = ${q}; ${a} ${M} ${q} = ${a - q}`, rule: 'Nhân, chia trước; cộng, trừ sau.' }; }
    if (t === 3) { const a = R(rng, 10, 60), b = R(rng, 5, 40), c = R(rng, 2, 9); return { s: `(${a} + ${b}) × ${c}`, v: (a + b) * c, w: a + b * c, how: `${a} + ${b} = ${a + b}; ${a + b} × ${c} = ${(a + b) * c}`, rule: 'Có dấu ngoặc: tính trong ngoặc trước.' }; }
    if (t === 4) { const c = R(rng, 2, 9), q = R(rng, 5, 50), d = c * q, b = R(rng, 10, 200), a = d + b; return { s: `(${a} ${M} ${b}) : ${c}`, v: q, w: b % c === 0 ? a - b / c : q + 1, how: `${a} ${M} ${b} = ${d}; ${d} : ${c} = ${q}`, rule: 'Có dấu ngoặc: tính trong ngoặc trước.' }; }
    const a = R(rng, 2, 9), b = R(rng, 10, 90), c = R(rng, 2, 9); return { s: `${b * c} : ${c} × ${a}`, v: b * a, w: b * c + a, how: `${b * c} : ${c} = ${b}; ${b} × ${a} = ${b * a}`, rule: 'Biểu thức chỉ có nhân, chia: tính từ trái sang phải.' };
  }
  const c6 = {
    id: 'g3-c6', semester: 1, title: 'Phép nhân, phép chia trong phạm vi 1000', icon: '➗', lessons: [
      lesson(6, 36, 'Nhân số có ba chữ số với số có một chữ số',
        'Rô-bốt ISA giúp bác thủ kho đếm số viên gạch xếp trên các xe.',
        [
          { text: '123 × 3: 3 × 3 = 9; 3 × 2 = 6; 3 × 1 = 3. Vậy 123 × 3 = 369.', visual: vz('columnCalc', { a: 123, b: 3, op: '×', reveal: 'all' }) },
          { text: '218 × 4: 4 × 8 = 32, viết 2 nhớ 3; 4 × 1 = 4, thêm 3 là 7; 4 × 2 = 8. Vậy 218 × 4 = 872.', visual: vz('columnCalc', { a: 218, b: 4, op: '×', reveal: 'all' }) },
        ],
        colGen('×', (r, L) => pairWhere(r, [101, 450], [2, L === 0 ? 3 : 9], (a, b) => a * b <= 999 && (L === 0 || wrongMul(a, b) !== a * b), [218, 4]))),
      lesson(6, 37, 'Chia số có ba chữ số cho số có một chữ số',
        'Rô-bốt ISA chia đều những bao lúa mới gặt vào các kho.',
        [
          { text: '639 : 3: 6 : 3 = 2; 3 : 3 = 1; 9 : 3 = 3. Vậy 639 : 3 = 213.', visual: vz('columnCalc', { a: 639, b: 3, op: ':', reveal: 'all' }) },
          { text: '256 : 4: 2 không chia được cho 4, lấy 25 : 4 = 6 dư 1; hạ 6 được 16, 16 : 4 = 4. Vậy 256 : 4 = 64.', visual: vz('columnCalc', { a: 256, b: 4, op: ':', reveal: 'all' }) },
        ],
        colGen(':', (r, L) => pairWhere(r, [100, 999], [2, L === 0 ? 3 : 9], (a, b) => a % b === 0 && (L < 2 || a / b < 100 || String(a / b).includes('0')), [256, 4]))),

      lesson(6, 38, 'Biểu thức số. Tính giá trị của biểu thức số',
        'Rô-bốt ISA và bạn Chi thi xem ai tính đúng thứ tự các phép tính.',
        [
          { text: 'Biểu thức chỉ có cộng, trừ (hoặc chỉ có nhân, chia): tính từ trái sang phải. 60 + 20 − 5 = 80 − 5 = 75.' },
          { text: 'Có cả cộng, trừ, nhân, chia: nhân, chia trước; cộng, trừ sau. 40 + 5 × 3 = 40 + 15 = 55.' },
          { text: 'Có dấu ngoặc ( ): tính trong ngoặc trước. (40 + 5) × 3 = 45 × 3 = 135.' },
        ],
        function (rng, i) {
          const e = exprGen(rng, lv(i)), f = i % 3;
          if (f === 0) return Q(`Tính giá trị của biểu thức:\n${e.s}`, null, num(e.v), e.rule, `${e.s} = ${e.v} (${e.how}).`);
          if (f === 1) return Q(`Giá trị của biểu thức ${e.s} là:`, null, ch(rng, e.v, [e.w, e.v + 10, e.v - 1].filter(x => x >= 0)), e.rule, `${e.how}.`);
          const c = Math.max(0, e.v + P(rng, [-5, 0, 3]));
          return Q(`So sánh: ${e.s} … ${c}`, vz('compare', { left: e.s, right: String(c) }), cmpAns(e.v, c), e.rule, `${e.s} = ${e.v}; ${e.v} ${sign(e.v, c)} ${c}.`);
        }),

      lesson(6, 39, 'So sánh số lớn gấp mấy lần số bé',
        'Rô-bốt ISA so sánh chiều cao của cây bàng và cây cau trong sân trường.',
        [
          { text: 'Muốn biết số lớn gấp mấy lần số bé, ta lấy số lớn chia cho số bé. 12 gấp 3 lần 4 vì 12 : 4 = 3.', visual: vz('tape', { bars: [{ label: 'Số lớn', parts: 3, units: 3, value: '12' }, { label: 'Số bé', parts: 1, units: 1, value: '4' }] }) },
        ],
        function (rng, i) {
          const b = R(rng, 2, 9), k = R(rng, 2, 9), a = b * k, f = i % 3;   // lớp 3: chia cho số có một chữ số
          const tape = vz('tape', { bars: [{ label: 'Số lớn', parts: k, units: k, value: String(a) }, { label: 'Số bé', parts: 1, units: 1, value: String(b) }] });
          if (f === 0) return Q(`${a} gấp mấy lần ${b}?`, tape, num(k), 'Lấy số lớn chia cho số bé.', `${a} : ${b} = ${k}. Vậy ${a} gấp ${k} lần ${b}.`);
          if (f === 1) {
            const t = P(rng, [
              [`Đàn gà có ${a} con, đàn vịt có ${b} con. Hỏi số gà gấp mấy lần số vịt?`],
              [`Sợi dây đỏ dài ${a} cm, sợi dây xanh dài ${b} cm. Hỏi sợi dây đỏ dài gấp mấy lần sợi dây xanh?`],
              [`Thùng to chứa ${a} l nước, can nhỏ chứa ${b} l nước. Hỏi thùng to chứa gấp mấy lần can nhỏ?`],
            ]);
            return Q(t[0], tape, num(k), 'Lấy số lớn chia cho số bé.', `${a} : ${b} = ${k} (lần).`);
          }
          // "gấp mấy lần" (chia) against "hơn bao nhiêu" (trừ), the usual mix-up
          const wrong = [a - b, k + 1, k > 2 ? k - 1 : k + 2].filter((x, j, arr) => x !== k && arr.indexOf(x) === j);
          return Q(`Số lớn là ${a}, số bé là ${b}. Số lớn gấp mấy lần số bé?`, tape, ch(rng, `${k} lần`, wrong.map(x => `${x} lần`)), 'Lấy số lớn chia cho số bé (không phải trừ).', `${a} : ${b} = ${k}. Vậy ${a} gấp ${k} lần ${b}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. CÁC SỐ ĐẾN 10 000 ============
  const PV4 = ['Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  const PV5 = ['Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  function numberLessonGen(lo, hi, cols) {
    return function (rng, i) {
      const n = R(rng, lo, hi), f = i % 5, d = String(n).split('').map(Number);
      if (f === 0) return Q(`Số "${readVN(n)}" viết là:`, null, num(n), 'Viết lần lượt từ hàng cao nhất.', `"${readVN(n)}" viết là ${F(n)}.`);
      if (f === 1) { const sw = Number(String(n).split('').reverse().join('')); return Q(`Số ${F(n)} đọc là:`, null, ch(rng, readVN(n), [readVN(n + Math.pow(10, R(rng, 0, 2)) <= hi ? n + Math.pow(10, R(rng, 0, 2)) : n - 10), readVN(sw >= lo && sw <= hi ? sw : n - 1), readVN(n + 1000 <= hi ? n + 1000 : n - 1000)]), 'Đọc theo từng lớp, từ trái sang phải.', `${F(n)} đọc là "${readVN(n)}".`); }
      if (f === 2) { const once = d.map((x, j) => j).filter(j => d.filter(x => x === d[j]).length === 1); if (!once.length) return numberLessonGen(lo, hi, cols)(rng, i); const pl = P(rng, once); return Q(`Trong số ${F(n)}, chữ số ${d[pl]} thuộc hàng nào?`, vz('placeValue', { number: n, columns: cols }), ch(rng, 'Hàng ' + cols[pl].toLowerCase(), cols.filter((_, j) => j !== pl).map(c => 'Hàng ' + c.toLowerCase())), 'Đếm từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn.', `Chữ số ${d[pl]} thuộc hàng ${cols[pl].toLowerCase()}.`); }
      if (f === 3) { const e = expand(n); return Q(`Viết số ${F(n)} thành tổng:`, vz('placeValue', { number: n, columns: cols }), ch(rng, e.map(F).join(' + '), [e.map((x, j) => F(j === e.length - 1 ? x * 10 : x)).join(" + "), expand(n + 100 <= hi ? n + 100 : n - 100).map(F).join(' + '), d.filter(x => x).join(' + ')]), 'Mỗi chữ số nhân với giá trị hàng của nó.', `${F(n)} = ${e.map(F).join(' + ')}.`); }
      const step = cols.length === 4 ? 1000 : 10000, a0 = Math.floor(n / step) * step;
      const sub = step / 10, u = a0 + R(rng, 1, 9) * sub;
      return Q('Số thích hợp ở ô ? trên tia số là:', vz('numberLine', { min: a0, max: a0 + step, step: sub, labelEvery: 5, unknown: u }), num(u), `Mỗi vạch cách nhau ${F(sub)}.`, `Số cần điền là ${F(u)}.`);
    };
  }
  function compareGen(lo, hi) {
    return function (rng, i) {
      const f = i % 3, L = lv(i);
      if (f === 0) {
        const a = R(rng, lo, hi); let b;
        const p = Math.pow(10, String(a).length - 1);
        if (L === 0) b = R(rng, lo, hi); else if (L === 1) b = Math.floor(a / p) * p + R(rng, 0, p - 1); else b = Math.floor(a / 10) * 10 + R(rng, 0, 9);
        if (R(rng, 0, 5) === 0) b = a;
        return Q(`So sánh: ${F(a)} … ${F(b)}`, vz('compare', { left: F(a), right: F(b) }), cmpAns(a, b), 'Số nào nhiều chữ số hơn thì lớn hơn. Cùng số chữ số thì so sánh từng hàng từ trái sang phải.', `${F(a)} ${sign(a, b)} ${F(b)}.`);
      }
      const base = R(rng, lo, hi - 999);
      const arr = U.sample(rng, Array.from({ length: 999 }, (_, k) => base + k), 4);
      if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...arr) : Math.min(...arr); return Q(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.map(F).join('; ')} là:`, null, ch(rng, F(v), arr.map(F)), 'So sánh từng hàng từ trái sang phải.', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${F(v)}.`); }
      const asc = arr.slice().sort((x, y) => x - y), s = a => a.map(F).join(', ');
      return Q(`Sắp xếp các số ${arr.map(F).join('; ')} theo thứ tự từ bé đến lớn:`, null, ch(rng, s(asc), [s(asc.slice().reverse()), s(arr), s([asc[1], asc[0], asc[2], asc[3]])]), 'Tìm số bé nhất trước, rồi số bé tiếp theo.', `${s(asc)}.`);
    };
  }
  function roundGen(places, maxN) { // places: [[10, "hàng chục"], ...]
    return function (rng, i) {
      const [p, name] = P(rng, places);
      const n = R(rng, p + 1, maxN), r = roundTo(n, p), f = i % 3;
      if (n % p === 0) return Q(`Làm tròn số ${F(n)} đến ${name} ta được số nào?`, null, num(n), `Số ${F(n)} đã tròn ${name.replace('hàng ', '')}.`, `${F(n)} giữ nguyên.`);
      const lo = Math.floor(n / p) * p, hi = lo + p;
      if (f === 0) return Q(`Làm tròn số ${F(n)} đến ${name} ta được số nào?`, vz('numberLine', { min: lo, max: hi, step: p / 10, labelEvery: 10, point: n }), num(r), `Nhìn chữ số ngay sau ${name}: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.`, `${F(n)} gần ${F(r)} hơn, làm tròn được ${F(r)}.`);
      if (f === 1) return Q(`Làm tròn số ${F(n)} đến ${name}:`, null, ch(rng, F(r), [r === lo ? hi : lo, Math.floor(n / (p * 10)) * p * 10, r + p * 10, r - 2 * p].filter(x => x > 0).map(x => F(x))), `Xét chữ số ngay sau ${name}.`, `${F(n)} làm tròn đến ${name} được ${F(r)}.`);
      return Q(`Số ${F(n)} nằm giữa ${F(lo)} và ${F(hi)}. Số ${F(n)} gần số nào hơn?`, vz('numberLine', { min: lo, max: hi, step: p / 10, labelEvery: 10, point: n }), ch(rng, F(r), [F(r === lo ? hi : lo)]), 'Nhìn vị trí của số trên tia số.', `${F(n)} gần ${F(r)} hơn.`);
    };
  }
  const c8 = {
    id: 'g3-c8', semester: 2, title: 'Các số đến 10 000', icon: '🔟', lessons: [
      lesson(8, 45, 'Các số có bốn chữ số. Số 10 000',
        'Rô-bốt ISA cùng bạn Trang đếm số vé xem xiếc được bán trong tuần.',
        [
          { text: 'Số 2 345 gồm 2 nghìn, 3 trăm, 4 chục, 5 đơn vị; đọc là "hai nghìn ba trăm bốn mươi lăm".', visual: vz('blocks', { thousands: 2, hundreds: 3, tens: 4, ones: 5 }) },
          { text: 'Viết trong bảng hàng: Nghìn – Trăm – Chục – Đơn vị.', visual: vz('placeValue', { number: 2345, columns: PV4 }) },
          { text: '10 nghìn = 10 000 (mười nghìn), là số tròn chục nghìn nhỏ nhất.' },
        ],
        numberLessonGen(1000, 9999, PV4)),
      lesson(8, 46, 'So sánh các số trong phạm vi 10 000',
        'Rô-bốt ISA giúp bạn Bình so sánh độ cao của các ngọn núi trên bản đồ.',
        [
          { text: 'So sánh 4 578 và 4 621: cùng 4 nghìn; hàng trăm 5 < 6. Vậy 4578 < 4621.', visual: vz('compare', { left: 4578, right: 4621 }) },
          { text: 'Số có ít chữ số hơn thì bé hơn: 999 < 1000.' },
        ],
        compareGen(1000, 9999)),
      lesson(8, 47, 'Làm quen với chữ số La Mã',
        'Rô-bốt ISA và bạn Mai đọc các số La Mã trên mặt chiếc đồng hồ cổ.',
        [
          { text: 'Chữ số La Mã: I là 1, V là 5, X là 10.', visual: vz('roman', { value: 5 }) },
          { text: 'Chữ số ghép bên phải là cộng thêm: VI = 6, XII = 12. Chữ số I ghép bên trái là bớt đi: IV = 4, IX = 9.', visual: vz('roman', { value: 9 }) },
        ],
        function (rng, i) {
          const n = R(rng, 1, lv(i) === 0 ? 10 : 20), f = i % 3;
          if (f === 0) return Q('Số La Mã này là số mấy?', vz('roman', { value: n }), num(n), 'I = 1, V = 5, X = 10. Chữ I đứng trước V hoặc X là bớt đi 1.', `${toRoman(n)} = ${n}.`);
          if (f === 1) { const alts = [toRoman(n + 1 <= 20 ? n + 1 : n - 1), toRoman(n - 1 >= 1 ? n - 1 : n + 2), n === 4 ? 'IIII' : n === 9 ? 'VIIII' : n === 6 ? 'IV' : n === 11 ? 'IX' : toRoman(n === 20 ? 18 : n + 2)]; return Q(`Số ${n} viết bằng chữ số La Mã là:`, null, ch(rng, toRoman(n), alts), 'Ghép I, V, X theo quy tắc.', `${n} viết là ${toRoman(n)}.`); }
          const a = R(rng, 1, 20); let b = R(rng, 1, 20);
          return Q(`So sánh: ${toRoman(a)} … ${toRoman(b)}`, vz('compare', { left: toRoman(a), right: toRoman(b) }), cmpAns(a, b), 'Đổi ra số rồi so sánh.', `${toRoman(a)} = ${a}, ${toRoman(b)} = ${b}; ${a} ${sign(a, b)} ${b}.`);
        }),
      lesson(8, 48, 'Làm tròn số đến hàng chục, hàng trăm',
        'Rô-bốt ISA giúp bạn Hùng ước lượng số khách đến thăm vườn thú.',
        [
          { text: 'Làm tròn 347 đến hàng chục: 347 gần 350 hơn 340, ta được 350.', visual: vz('numberLine', { min: 340, max: 350, step: 1, labelEvery: 10, point: 347 }) },
          { text: 'Chữ số hàng đơn vị bé hơn 5 thì làm tròn xuống; từ 5 trở lên thì làm tròn lên. 2 643 làm tròn đến hàng trăm được 2 600.' },
        ],
        roundGen([[10, 'hàng chục'], [100, 'hàng trăm']], 9999)),
    ],
  };

  // ============ CHỦ ĐỀ 9. CHU VI, DIỆN TÍCH MỘT SỐ HÌNH PHẲNG ============
  const c9 = {
    id: 'g3-c9', semester: 2, title: 'Chu vi, diện tích một số hình phẳng', icon: '🟩', lessons: [
      lesson(9, 50, 'Chu vi hình tam giác, hình tứ giác, hình chữ nhật, hình vuông',
        'Rô-bốt ISA đi một vòng quanh mảnh vườn để rào hàng rào cho bà bạn Ngọc.',
        [
          { text: 'Chu vi của một hình là tổng độ dài các cạnh của hình đó. Tam giác cạnh 3, 4, 5 cm có chu vi 3 + 4 + 5 = 12 (cm).', visual: vz('shape', { kind: 'triangle', dims: { a: 3, b: 4, c: 5 }, showDims: true }) },
          { text: 'Chu vi hình chữ nhật = (chiều dài + chiều rộng) × 2. Ví dụ (5 + 3) × 2 = 16 (cm).', visual: vz('areaGrid', { w: 5, h: 3, unit: 'cm', showPerimeter: true }) },
          { text: 'Chu vi hình vuông = độ dài cạnh × 4.', visual: vz('shape', { kind: 'square', dims: { a: 4 }, showDims: true }) },
        ],
        function (rng, i) {
          const f = i % 4, big = lv(i) === 2;
          if (f === 0) { const a = R(rng, 3, 15), b = R(rng, 3, 15), c = R(rng, Math.abs(a - b) + 1, a + b - 1); return Q('Tính chu vi hình tam giác.', vz('shape', { kind: 'triangle', dims: { a, b, c }, showDims: true }), num(a + b + c, 'cm'), 'Cộng độ dài ba cạnh.', `${a} + ${b} + ${c} = ${a + b + c} (cm).`); }
          if (f === 1) { const a = R(rng, 4, big ? 60 : 12), b = R(rng, 2, a - 1); return Q(`Hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính chu vi hình chữ nhật.`, a <= 12 ? vz('areaGrid', { w: a, h: b, unit: 'cm', showPerimeter: true }) : vz('shape', { kind: 'rect', dims: { a, b }, showDims: true }), num((a + b) * 2, 'cm'), 'Chu vi = (dài + rộng) × 2.', `(${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`); }
          if (f === 2) { const a = R(rng, 2, big ? 50 : 10); return Q(`Hình vuông có cạnh ${a} cm. Tính chu vi hình vuông.`, vz('shape', { kind: 'square', dims: { a }, showDims: true }), num(a * 4, 'cm'), 'Chu vi = cạnh × 4.', `${a} × 4 = ${a * 4} (cm).`); }
          if (R(rng, 0, 1)) { const s = [R(rng, 2, 9), R(rng, 2, 9), R(rng, 2, 9), R(rng, 2, 9)]; return Q('Tính chu vi hình tứ giác.', vz('shape', { kind: 'quad', dims: { a: s[0], b: s[1], c: s[2], d: s[3] }, showDims: true }), num(s[0] + s[1] + s[2] + s[3], 'cm'), 'Cộng độ dài bốn cạnh.', `${s.join(' + ')} = ${s[0] + s[1] + s[2] + s[3]} (cm).`); }
          const a = R(rng, 3, 25); return Q(`Một hình vuông có chu vi ${a * 4} cm. Độ dài cạnh hình vuông là bao nhiêu?`, vz('shape', { kind: 'square' }), num(a, 'cm'), 'Cạnh = chu vi : 4.', `${a * 4} : 4 = ${a} (cm).`);
        }),

      lesson(9, 51, 'Diện tích của một hình. Xăng-ti-mét vuông',
        'Rô-bốt ISA lát những viên gạch vuông nhỏ lên mô hình sân nhà bạn Tú.',
        [
          { text: 'Xăng-ti-mét vuông (cm²) là diện tích hình vuông cạnh 1 cm.', visual: vz('areaGrid', { w: 1, h: 1, unit: 'cm', fill: true }) },
          { text: 'Hình này gồm 6 ô vuông 1 cm², diện tích là 6 cm².', visual: vz('areaGrid', { w: 3, h: 2, unit: 'cm', fill: true }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          const w = R(rng, 2, lv(i) === 0 ? 5 : 9), h = R(rng, 1, lv(i) === 0 ? 3 : 6);
          if (f === 0) return Q('Hình dưới đây có diện tích bao nhiêu xăng-ti-mét vuông?', vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(w * h, 'cm²'), 'Đếm số ô vuông 1 cm².', `Hình có ${w * h} ô vuông nên diện tích là ${w * h} cm².`);
          if (f === 1) { const a = R(rng, 5, 50), b = R(rng, 5, 50); return Q(`${a} cm² + ${b} cm² = ?`, null, num(a + b, 'cm²'), 'Cộng các số rồi ghi đơn vị cm².', `${a} cm² + ${b} cm² = ${a + b} cm².`); }
          let w2 = R(rng, 2, 6), h2 = R(rng, 1, 5);
          return Q(`Hình A gồm ${w * h} ô vuông 1 cm², hình B gồm ${w2 * h2} ô vuông 1 cm². So sánh diện tích hình A … hình B`, vz('areaGrid', { w, h, unit: 'cm', fill: true }), cmpAns(w * h, w2 * h2), 'Hình nào nhiều ô vuông hơn thì diện tích lớn hơn.', `${w * h} cm² ${sign(w * h, w2 * h2)} ${w2 * h2} cm².`);
        }, [
          [0, 6, rng => { const n = R(rng, 11, 99); return Q(`Số đo "${readVN(n)} xăng-ti-mét vuông" viết là:`, null, ch(rng, `${n} cm²`, [`${n} cm`, `${n}² cm`, `${n * 10} cm²`]), 'Xăng-ti-mét vuông viết tắt là cm².', `${cap(readVN(n))} xăng-ti-mét vuông viết là ${n} cm².`); }],
          [3, 9, rng => {
            const op = P(rng, ['−', '×', ':']); let a, b, r, expr;
            if (op === '−') { a = R(rng, 20, 99); b = R(rng, 5, a - 1); r = a - b; expr = `${a} cm² ${M} ${b} cm²`; }
            else if (op === '×') { a = R(rng, 2, 20); b = R(rng, 2, 4); r = a * b; expr = `${a} cm² × ${b}`; }
            else { b = R(rng, 2, 5); r = R(rng, 2, 19); a = r * b; expr = `${a} cm² : ${b}`; }
            return Q(`${expr} = ?`, null, num(r, 'cm²'), 'Tính với các số như bình thường rồi ghi đơn vị cm².', `${expr} = ${r} cm².`);
          }],
          [3, 9, rng => { const w = R(rng, 2, 6), h = R(rng, 2, 4), w2 = R(rng, 1, 5), h2 = R(rng, 1, 3), A = w * h, B = w2 * h2; if (A === B) return Q(`Hình A gồm ${A} ô vuông 1 cm², hình B gồm ${B} ô vuông 1 cm². Diện tích hai hình hơn kém nhau bao nhiêu xăng-ti-mét vuông?`, vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(0, 'cm²'), 'Lấy diện tích lớn trừ diện tích bé.', 'Hai hình có diện tích bằng nhau, hơn kém nhau 0 cm².'); return Q(`Hình A gồm ${A} ô vuông 1 cm², hình B gồm ${B} ô vuông 1 cm². Diện tích hình ${A > B ? 'A' : 'B'} lớn hơn diện tích hình ${A > B ? 'B' : 'A'} bao nhiêu xăng-ti-mét vuông?`, vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(Math.abs(A - B), 'cm²'), 'Lấy diện tích lớn trừ diện tích bé.', `${Math.max(A, B)} ${M} ${Math.min(A, B)} = ${Math.abs(A - B)} (cm²).`); }],
          [0, 9, rng => { const [st, ok] = P(rng, [['Hình vuông cạnh 1 cm có diện tích 1 cm²', true], ['Xăng-ti-mét vuông viết tắt là cm²', true], ['Xăng-ti-mét vuông viết tắt là cm', false], ['Hình gồm 6 ô vuông 1 cm² có diện tích là 6 cm', false], ['Hình gồm 8 ô vuông 1 cm² có diện tích là 8 cm²', true], ['Hai hình có cùng số ô vuông 1 cm² thì có diện tích bằng nhau', true]]); return Q(`Đúng hay sai?\n${st}.`, null, tf(rng, ok), 'Diện tích đo bằng xăng-ti-mét vuông (cm²), độ dài đo bằng xăng-ti-mét (cm).', `${ok ? 'Đúng' : 'Sai'}.`); }],
          [6, 9, rng => { const w = R(rng, 3, 7), h = R(rng, 2, 4), c = R(rng, 1, w - 1); return Q(`Một tấm bìa gồm ${w * h} ô vuông 1 cm² như hình. Bạn ${nm(rng)} cắt đi ${c} ô vuông. Hỏi diện tích phần bìa còn lại là bao nhiêu xăng-ti-mét vuông?`, vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(w * h - c, 'cm²'), 'Cắt đi bao nhiêu ô vuông 1 cm² thì diện tích giảm bấy nhiêu cm².', `${w * h} ${M} ${c} = ${w * h - c} (cm²).`); }],
        ])),

      lesson(9, 52, 'Diện tích hình chữ nhật, diện tích hình vuông',
        'Rô-bốt ISA tính diện tích tấm bìa để bạn Lan làm thiệp chúc mừng thầy cô.',
        [
          { text: 'Diện tích hình chữ nhật = chiều dài × chiều rộng (cùng đơn vị đo). 4 × 3 = 12 (cm²).', visual: vz('areaGrid', { w: 4, h: 3, unit: 'cm', fill: true }) },
          { text: 'Diện tích hình vuông = cạnh × cạnh. 3 × 3 = 9 (cm²).', visual: vz('areaGrid', { w: 3, h: 3, unit: 'cm', fill: true }) },
        ],
        more(function (rng, i) {
          const f = i % 4, big = lv(i) === 2;
          if (f === 0) { const a = R(rng, 3, big ? 30 : 9), b = R(rng, 2, Math.min(a - 1, 9)); return Q(`Tính diện tích hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm.`, a <= 10 ? vz('areaGrid', { w: a, h: b, unit: 'cm', fill: true }) : vz('shape', { kind: 'rect', dims: { a, b }, showDims: true }), num(a * b, 'cm²'), 'Diện tích = dài × rộng.', `${a} × ${b} = ${a * b} (cm²).`); }
          if (f === 1) { const a = R(rng, 2, big ? 20 : 9); return Q(`Tính diện tích hình vuông có cạnh ${a} cm.`, a <= 10 ? vz('areaGrid', { w: a, h: a, unit: 'cm', fill: true }) : vz('shape', { kind: 'square', dims: { a }, showDims: true }), num(a * a, 'cm²'), 'Diện tích = cạnh × cạnh.', `${a} × ${a} = ${a * a} (cm²).`); }
          if (f === 2) { const a = R(rng, 1, 9), b = R(rng, 2, 9); return Q(`Hình chữ nhật có chiều dài ${a} dm, chiều rộng ${b} cm. Tính diện tích hình chữ nhật (theo cm²).`, vz('shape', { kind: 'rect', dims: { a: a * 10, b }, showDims: true }), num(a * 10 * b, 'cm²'), 'Đổi về cùng đơn vị: 1 dm = 10 cm.', `${a} dm = ${a * 10} cm; ${a * 10} × ${b} = ${a * 10 * b} (cm²).`); }
          const a = R(rng, 3, 10), b = R(rng, 2, a - 1);
          return Q(`Một tấm bìa hình chữ nhật có chiều rộng ${b} cm, chiều dài gấp đôi chiều rộng. Tính diện tích tấm bìa.`, vz('shape', { kind: 'rect', dims: { a: b * 2, b }, showDims: true }), num(b * 2 * b, 'cm²'), 'Bước 1: tìm chiều dài.', `Chiều dài: ${b} × 2 = ${b * 2} (cm). Diện tích: ${b * 2} × ${b} = ${b * 2 * b} (cm²).`);
        }, [
          [3, 9, (rng, i) => { const b = R(rng, 2, 9), a = R(rng, b + 1, lv(i) === 2 ? 15 : 10), S = a * b; return Q(`Một hình chữ nhật có diện tích ${S} cm², chiều rộng ${b} cm. Tính chiều dài hình chữ nhật.`, vz('shape', { kind: 'rect', dims: { a: '?', b } }), num(a, 'cm'), 'Diện tích = chiều dài × chiều rộng, nên chiều dài = diện tích : chiều rộng.', `${S} : ${b} = ${a} (cm).`); }],
          [6, 9, rng => { const a = R(rng, 2, 9); return Q(`Một hình vuông có chu vi ${a * 4} cm. Tính diện tích hình vuông đó.`, vz('shape', { kind: 'square' }), num(a * a, 'cm²'), 'Bước 1: cạnh = chu vi : 4. Bước 2: diện tích = cạnh × cạnh.', `Cạnh: ${a * 4} : 4 = ${a} (cm). Diện tích: ${a} × ${a} = ${a * a} (cm²).`); }],
          [0, 9, rng => { const a = R(rng, 3, 9), b = R(rng, 2, a - 1), sq = R(rng, 0, 1) === 1, S = sq ? a * a : a * b, P2 = sq ? a * 4 : (a + b) * 2, cl = P(rng, [S, S, P2]); const what = sq ? `hình vuông cạnh ${a} cm` : `hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm`; return Q(`Đúng hay sai?\nDiện tích ${what} là ${cl} cm².`, null, tf(rng, cl === S), sq ? 'Diện tích hình vuông = cạnh × cạnh.' : 'Diện tích hình chữ nhật = chiều dài × chiều rộng.', `${sq ? `${a} × ${a}` : `${a} × ${b}`} = ${S} (cm²). ${cl === S ? 'Đúng' : 'Sai'}.`); }],
          [3, 9, rng => { const a = R(rng, 3, 9), b = R(rng, 2, a - 1), c = R(rng, 2, 8), S1 = a * b, S2 = c * c; return Q(`Hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Hình vuông có cạnh ${c} cm. Hình nào có diện tích lớn hơn?`, null, ch(rng, S1 > S2 ? 'Hình chữ nhật' : S1 < S2 ? 'Hình vuông' : 'Hai hình có diện tích bằng nhau', ['Hình chữ nhật', 'Hình vuông', 'Hai hình có diện tích bằng nhau']), 'Tính diện tích từng hình rồi so sánh.', `Hình chữ nhật: ${a} × ${b} = ${S1} (cm²); hình vuông: ${c} × ${c} = ${S2} (cm²).`); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 10. CỘNG, TRỪ, NHÂN, CHIA TRONG PHẠM VI 10 000 ============
  const c10 = {
    id: 'g3-c10', semester: 2, title: 'Cộng, trừ, nhân, chia trong phạm vi 10 000', icon: '🧮', lessons: [
      lesson(10, 54, 'Phép cộng trong phạm vi 10 000',
        'Rô-bốt ISA giúp nhà máy đếm số áo may được trong hai ngày.',
        [{ text: '3 526 + 2 718: cộng từ hàng đơn vị: 6 + 8 = 14, viết 4 nhớ 1; … Vậy 3526 + 2718 = 6244.', visual: vz('columnCalc', { a: 3526, b: 2718, op: '+', reveal: 'all' }) }],
        colGen('+', (r, L) => pairWhere(r, [1000, 7000], L === 0 ? [100, 999] : [1000, 5000], (a, b) => a + b <= 9999 && (L === 0 || !noCarry(a, b)), [3526, 2718]))),
      lesson(10, 55, 'Phép trừ trong phạm vi 10 000',
        'Rô-bốt ISA tính số cây giống còn lại sau buổi trồng cây đầu xuân.',
        [{ text: '6 254 − 2 718: 4 không trừ được 8, lấy 14 − 8 = 6, viết 6 nhớ 1; … Vậy 6254 − 2718 = 3536.', visual: vz('columnCalc', { a: 6254, b: 2718, op: M, reveal: 'all' }) }],
        colGen(M, (r, L) => pairWhere(r, [2000, 9999], L === 0 ? [100, 999] : [1000, 8000], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [6254, 2718]))),
      lesson(10, 56, 'Nhân số có bốn chữ số với số có một chữ số',
        'Rô-bốt ISA tính số viên gạch cần để lát sân của bốn lớp học.',
        [{ text: '1 427 × 3: 3 × 7 = 21, viết 1 nhớ 2; 3 × 2 = 6, thêm 2 là 8; 3 × 4 = 12, viết 2 nhớ 1; 3 × 1 = 3, thêm 1 là 4. Vậy 1427 × 3 = 4281.', visual: vz('columnCalc', { a: 1427, b: 3, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, [1001, 4999], [2, L === 0 ? 3 : 9], (a, b) => a * b <= 9999, [1427, 3]))),
      lesson(10, 57, 'Chia số có bốn chữ số cho số có một chữ số',
        'Rô-bốt ISA chia đều số sách mới cho các thư viện xã.',
        [{ text: '6 369 : 3: 6 : 3 = 2; 3 : 3 = 1; 6 : 3 = 2; 9 : 3 = 3. Vậy 6369 : 3 = 2123.', visual: vz('columnCalc', { a: 6369, b: 3, op: ':', reveal: 'all' }) }, { text: 'Chú ý chữ số 0 ở thương: 3 618 : 3 = 1 206.', visual: vz('columnCalc', { a: 3618, b: 3, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, [1000, 9999], [2, L === 0 ? 3 : 9], (a, b) => a % b === 0 && (L < 2 || String(a / b).includes('0')), [3618, 3]))),
    ],
  };

  // ============ CHỦ ĐỀ 11. CÁC SỐ ĐẾN 100 000 ============
  const c11 = {
    id: 'g3-c11', semester: 2, title: 'Các số đến 100 000', icon: '🔢', lessons: [
      lesson(11, 59, 'Các số có năm chữ số. Số 100 000',
        'Rô-bốt ISA cùng bạn Việt đọc số người đến xem trận bóng đá ở sân vận động.',
        [
          { text: 'Số 42 316 gồm 4 chục nghìn, 2 nghìn, 3 trăm, 1 chục, 6 đơn vị; đọc là "bốn mươi hai nghìn ba trăm mười sáu".', visual: vz('placeValue', { number: 42316, columns: PV5 }) },
          { text: '10 chục nghìn = 100 000 (một trăm nghìn).' },
        ],
        numberLessonGen(10000, 99999, PV5)),
      lesson(11, 60, 'So sánh các số trong phạm vi 100 000',
        'Rô-bốt ISA so sánh số dân của các xã trong huyện cùng bạn Thảo.',
        [{ text: 'So sánh 45 312 và 45 297: cùng 45 nghìn; hàng trăm 3 > 2. Vậy 45 312 > 45 297.', visual: vz('compare', { left: F(45312), right: F(45297) }) }],
        compareGen(10000, 99999)),
      lesson(11, 61, 'Làm tròn số đến hàng nghìn, hàng chục nghìn',
        'Rô-bốt ISA ước lượng số khán giả đến xem lễ hội pháo hoa.',
        [
          { text: 'Làm tròn 34 718 đến hàng nghìn: chữ số hàng trăm là 7 (≥ 5) nên làm tròn lên: 35 000.', visual: vz('numberLine', { min: 34000, max: 35000, step: 100, labelEvery: 10, point: 34718 }) },
          { text: 'Làm tròn 34 718 đến hàng chục nghìn: chữ số hàng nghìn là 4 (< 5) nên làm tròn xuống: 30 000.' },
        ],
        roundGen([[1000, 'hàng nghìn'], [10000, 'hàng chục nghìn']], 99999)),
    ],
  };

  // ============ CHỦ ĐỀ 12. CỘNG, TRỪ TRONG PHẠM VI 100 000 ============
  const c12 = {
    id: 'g3-c12', semester: 2, title: 'Cộng, trừ trong phạm vi 100 000', icon: '➕', lessons: [
      lesson(12, 63, 'Phép cộng trong phạm vi 100 000',
        'Rô-bốt ISA cộng số sách hai nhà sách bán được trong ngày hội đọc sách.',
        [{ text: '35 246 + 41 578 = 76 824. Đặt tính thẳng cột, cộng từ phải sang trái, nhớ khi cần.', visual: vz('columnCalc', { a: 35246, b: 41578, op: '+', reveal: 'all' }) }, { text: 'Cộng nhẩm số tròn nghìn: 20 000 + 30 000 = 50 000 (2 chục nghìn + 3 chục nghìn).' }],
        colGen('+', (r, L) => pairWhere(r, [10000, 70000], L === 0 ? [1000, 9999] : [10000, 50000], (a, b) => a + b <= 99999 && (L === 0 || !noCarry(a, b)), [35246, 41578]))),
      lesson(12, 64, 'Phép trừ trong phạm vi 100 000',
        'Rô-bốt ISA tính số tiền còn lại sau khi bạn Hà mua đồ dùng học tập.',
        [{ text: '82 354 − 37 528 = 44 826. Không trừ được thì mượn 1 ở hàng bên trái.', visual: vz('columnCalc', { a: 82354, b: 37528, op: M, reveal: 'all' }) }],
        colGen(M, (r, L) => pairWhere(r, [20000, 99999], L === 0 ? [1000, 9999] : [10000, 80000], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [82354, 37528]))),
    ],
  };

  // ============ CHỦ ĐỀ 13. XEM ĐỒNG HỒ. THÁNG – NĂM. TIỀN VIỆT NAM ============
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  const tStr = (h, m) => (m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`);
  const kem = (h, m) => `${h % 12 + 1} giờ kém ${60 - m} phút`;
  const c13 = {
    id: 'g3-c13', semester: 2, title: 'Xem đồng hồ. Tháng – năm. Tiền Việt Nam', icon: '🕐', lessons: [
      lesson(13, 66, 'Xem đồng hồ. Tháng – năm',
        'Rô-bốt ISA nhắc bạn Phúc xem đồng hồ để không trễ chuyến xe buýt về quê.',
        [
          { text: 'Đồng hồ chỉ 8 giờ 40 phút, hay 9 giờ kém 20 phút.', visual: vz('clock', { h: 8, m: 40 }) },
          { text: 'Một năm có 12 tháng. Các tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày; tháng 4, 6, 9, 11 có 30 ngày; tháng 2 có 28 hoặc 29 ngày.', visual: vz('calendar', { year: 2027, month: 2 }) },
        ],
        function (rng, i) {
          const f = i % 5, h = R(rng, 1, 12), m = R(rng, 1, 11) * 5;
          if (f === 0) return Q('Đồng hồ chỉ mấy giờ?', vz('clock', { h, m }), ch(rng, tStr(h, m), [tStr(h % 12 + 1, m), tStr(h, (m + 30) % 60 || 5), tStr(h, 60 - m === m ? m + 5 : 60 - m)]), 'Kim ngắn chỉ giờ, kim dài chỉ phút (mỗi số là 5 phút).', `Đồng hồ chỉ ${tStr(h, m)}${m > 30 ? ` hay ${kem(h, m)}` : ''}.`);
          if (f === 1) { const mm = R(rng, 7, 11) * 5; return Q(`${tStr(h, mm)} còn gọi là:`, vz('clock', { h, m: mm }), ch(rng, kem(h, mm), [`${h} giờ kém ${60 - mm} phút`, `${h % 12 + 1} giờ kém ${mm} phút`, `${h % 12 + 1} giờ ${60 - mm} phút`]), `Còn ${60 - mm} phút nữa thì đến ${h % 12 + 1} giờ.`, `${tStr(h, mm)} = ${kem(h, mm)}.`); }
          if (f === 2) return Q(`Em hãy quay kim đồng hồ để chỉ ${tStr(h, m)}.`, vz('clock', { h: 12, m: 0 }), { kind: 'visual', check: v => v && ((v.h % 12) + 12) % 12 === h % 12 && v.m === m }, `Kim dài chỉ số ${m / 5}.`, `Kim ngắn ở giữa số ${h} và số ${h % 12 + 1}, kim dài chỉ số ${m / 5}.`);
          if (f === 3) { const s = R(rng, 6, 9), sm = R(rng, 0, 5) * 5, d = R(rng, 2, 9) * 5; const em = sm + d, eh = s + Math.floor(em / 60), emm = em % 60; return Q(`${nm(rng)} bắt đầu tưới cây lúc ${tStr(s, sm)}, tưới trong ${d} phút. Hỏi ${tStr(s, sm).includes('phút') ? 'bạn' : 'bạn'} tưới xong lúc mấy giờ?`, vz('clock', { h: s, m: sm }), ch(rng, tStr(eh, emm), [tStr(eh, (emm + 5) % 60), tStr(eh + 1, emm), tStr(s, d)]), `Cộng thêm ${d} phút.`, `${tStr(s, sm)} + ${d} phút = ${tStr(eh, emm)}.`); }
          const y = P(rng, [2026, 2027, 2028]), mo = R(rng, 1, 12);
          if (R(rng, 0, 1)) return Q(`Tháng ${mo} năm ${y} có bao nhiêu ngày?`, vz('calendar', { year: y, month: mo }), num(daysIn(y, mo), 'ngày'), 'Nắm tay đếm tháng: tháng ở đỉnh khớp có 31 ngày.', `Tháng ${mo} năm ${y} có ${daysIn(y, mo)} ngày.`);
          const d = R(rng, 1, daysIn(y, mo)), wd = new Date(y, mo - 1, d).getDay(), WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          return Q(`Ngày ${d} tháng ${mo} năm ${y} là thứ mấy?`, vz('calendar', { year: y, month: mo, highlight: [d] }), ch(rng, WD[wd], [WD[(wd + 1) % 7], WD[(wd + 6) % 7], WD[(wd + 3) % 7]]), 'Tìm ngày đó trên tờ lịch rồi nhìn lên đầu cột.', `Ngày ${d}/${mo}/${y} là ${WD[wd].toLowerCase()}.`);
        }),

      lesson(13, 68, 'Tiền Việt Nam',
        'Rô-bốt ISA đi chợ Tết cùng bạn Minh và giúp bạn ấy tính tiền.',
        [
          { text: 'Các tờ tiền: 1000, 2000, 5000, 10 000, 20 000, 50 000, 100 000 đồng.', visual: vz('money', { notes: [1000, 2000, 5000, 10000, 20000, 50000, 100000] }) },
          { text: '20 000 + 10 000 + 5000 = 35 000 (đồng).', visual: vz('money', { notes: [20000, 10000, 5000] }) },
        ],
        function (rng, i) {
          const f = i % 4, NOTES = [1000, 2000, 5000, 10000, 20000, 50000];
          if (f === 0) { const notes = Array.from({ length: R(rng, 2, lv(i) === 0 ? 3 : 5) }, () => P(rng, NOTES)).sort((a, b) => b - a); const s = notes.reduce((a, b) => a + b, 0); return Q('Có tất cả bao nhiêu tiền?', vz('money', { notes }), num(s, 'đồng'), 'Cộng giá trị các tờ tiền, bắt đầu từ tờ lớn nhất.', `${notes.map(F).join(' + ')} = ${F(s)} (đồng).`); }
          if (f === 1) { const a = R(rng, 5, 30) * 1000, b = R(rng, 2, 20) * 1000, pay = a + b <= 50000 ? 50000 : 100000; return Q(`${nm(rng)} mua một quyển truyện giá ${F(a)} đồng và một hộp bút giá ${F(b)} đồng. Bạn đưa cô bán hàng ${F(pay)} đồng. Cô trả lại bao nhiêu tiền?`, vz('money', { notes: [pay] }), num(pay - a - b, 'đồng'), 'Bước 1: tính tổng số tiền phải trả.', `Phải trả: ${F(a)} + ${F(b)} = ${F(a + b)} (đồng). Trả lại: ${F(pay)} ${M} ${F(a + b)} = ${F(pay - a - b)} (đồng).`); }
          if (f === 2) { const [big, small] = P(rng, [[10000, 5000], [10000, 2000], [20000, 5000], [50000, 10000], [100000, 20000], [5000, 1000]]); return Q(`Đổi 1 tờ ${F(big)} đồng được mấy tờ ${F(small)} đồng?`, vz('money', { notes: [big] }), num(big / small), `${F(big)} : ${F(small)} = ?`, `${F(big)} : ${F(small)} = ${big / small} (tờ).`); }
          const p = R(rng, 2, 9) * 1000, n = R(rng, 2, 5); return Q(`Một quyển vở giá ${F(p)} đồng. Mua ${n} quyển vở như thế hết bao nhiêu tiền?`, null, num(p * n, 'đồng'), 'Nhân giá một quyển với số quyển.', `${F(p)} × ${n} = ${F(p * n)} (đồng).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 14. NHÂN, CHIA TRONG PHẠM VI 100 000 ============
  const c14 = {
    id: 'g3-c14', semester: 2, title: 'Nhân, chia trong phạm vi 100 000', icon: '✖️', lessons: [
      lesson(14, 70, 'Nhân số có năm chữ số với số có một chữ số',
        'Rô-bốt ISA tính số quả trứng của trang trại sau mấy ngày thu hoạch.',
        [{ text: '12 418 × 4 = 49 672. Nhân từ phải sang trái, nhớ sang hàng bên trái.', visual: vz('columnCalc', { a: 12418, b: 4, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, [10001, 49999], [2, L === 0 ? 3 : 9], (a, b) => a * b <= 99999, [12418, 4]))),
      lesson(14, 71, 'Chia số có năm chữ số cho số có một chữ số',
        'Rô-bốt ISA chia đều số cây giống cho các xã trồng rừng.',
        [{ text: '37 648 : 4 = 9 412. Lượt đầu lấy 37 chia 4 vì 3 không chia được cho 4.', visual: vz('columnCalc', { a: 37648, b: 4, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, [10000, 99999], [2, L === 0 ? 3 : 9], (a, b) => a % b === 0 && (L < 2 || String(a / b).includes('0')), [37648, 4]))),
    ],
  };

  // ============ CHỦ ĐỀ 15. LÀM QUEN VỚI YẾU TỐ THỐNG KÊ, XÁC SUẤT ============
  const COL = [{ n: 'đỏ', c: '#E84A4A' }, { n: 'xanh dương', c: '#4DA3FF' }, { n: 'vàng', c: '#FFC93C' }, { n: 'xanh lá', c: '#5BC85B' }];
  const c15 = {
    id: 'g3-c15', semester: 2, title: 'Làm quen với yếu tố thống kê, xác suất', icon: '📊', lessons: [
      lesson(15, 73, 'Thu thập, phân loại, ghi chép số liệu. Bảng số liệu',
        'Rô-bốt ISA cùng lớp 3A ghi chép số cây mỗi tổ trồng được.',
        [{ text: 'Bảng số liệu giúp ta đọc nhanh: Tổ 1 trồng 12 cây, Tổ 2 trồng 15 cây, Tổ 3 trồng 9 cây.', visual: vz('dataTable', { headers: ['Tổ', 'Tổ 1', 'Tổ 2', 'Tổ 3'], rows: [['Số cây', 12, 15, 9]] }) }],
        function (rng, i) {
          const k = lv(i) === 0 ? 3 : 4, labels = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'].slice(0, k);
          const vals = U.sample(rng, Array.from({ length: 40 }, (_, j) => j + 5), k);
          const what = P(rng, [['Số cây', 'cây', 'trồng được'], ['Số quyển sách', 'quyển', 'quyên góp được'], ['Số bông hoa điểm tốt', 'bông', 'đạt được']]);
          const tb = vz('dataTable', { headers: ['Tổ'].concat(labels), rows: [[what[0]].concat(vals)] });
          const f = i % 4;
          if (f === 0) { const j = R(rng, 0, k - 1); return Q(`${labels[j]} ${what[2]} bao nhiêu ${what[1]}?`, tb, num(vals[j]), `Tìm cột ${labels[j]}.`, `${labels[j]}: ${vals[j]} ${what[1]}.`); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...vals) : Math.min(...vals); return Q(`Tổ nào ${what[2]} ${big ? 'nhiều' : 'ít'} ${what[1]} nhất?`, tb, ch(rng, labels[vals.indexOf(v)], labels), 'So sánh các số trong bảng.', `${labels[vals.indexOf(v)]}: ${v} ${what[1]}.`); }
          if (f === 2) { const s = vals.reduce((a, b) => a + b, 0); return Q(`Cả lớp ${what[2]} tất cả bao nhiêu ${what[1]}?`, tb, num(s), 'Cộng tất cả các số trong bảng.', `${vals.join(' + ')} = ${s} (${what[1]}).`); }
          const [a, b] = U.sample(rng, [0, 1, 2].slice(0, k), 2), hi = vals[a] > vals[b] ? a : b, lo = hi === a ? b : a;
          return Q(`${labels[hi]} ${what[2]} nhiều hơn ${labels[lo]} bao nhiêu ${what[1]}?`, vz('barChart', { labels, values: vals, unit: what[1] }), num(vals[hi] - vals[lo]), 'Lấy số lớn trừ số bé.', `${vals[hi]} ${M} ${vals[lo]} = ${vals[hi] - vals[lo]} (${what[1]}).`);
        }),
      lesson(15, 74, 'Khả năng xảy ra của một sự kiện',
        'Rô-bốt ISA chơi trò bốc thăm may mắn với các bạn trong lớp.',
        [
          { text: 'Hộp có 3 bóng đỏ và 2 bóng xanh: lấy 1 quả, có thể được bóng đỏ, có thể được bóng xanh, không thể được bóng vàng.', visual: vz('chance', { items: [{ color: '#E84A4A', count: 3 }, { color: '#4DA3FF', count: 2 }] }) },
        ],
        function (rng, i) {
          const k = R(rng, 1, 3), cols = U.sample(rng, COL, k + 1), inBox = cols.slice(0, k), out = cols[k];
          const items = inBox.map(c => ({ color: c.c, count: R(rng, 1, 6) }));
          const desc = inBox.map((c, j) => `${items[j].count} quả bóng ${c.n}`).join(', ');
          const f = i % 3, opts = ['Chắc chắn', 'Có thể', 'Không thể'];
          if (f === 2 && k >= 2 && items[0].count !== items[1].count) {
            const more = items[0].count > items[1].count ? 0 : 1;
            return Q(`Trong hộp có ${desc}. Lấy ra 1 quả bóng bất kì. Khả năng lấy được bóng màu nào cao hơn: ${inBox[0].n} hay ${inBox[1].n}?`, vz('chance', { items }), ch(rng, 'Bóng ' + inBox[more].n, ['Bóng ' + inBox[1 - more].n, 'Như nhau']), 'Màu nào có nhiều quả hơn thì khả năng lấy được cao hơn.', `Có ${items[more].count} quả bóng ${inBox[more].n}, nhiều hơn.`);
          }
          const ask = R(rng, 0, 1) ? out : inBox[0], ans = ask === out ? 'Không thể' : k === 1 ? 'Chắc chắn' : 'Có thể';
          return Q(`Trong hộp có ${desc}. Lấy ra 1 quả bóng bất kì. Em chọn từ thích hợp: … lấy được quả bóng ${ask.n}.`, vz('chance', { items }), { kind: 'choice', options: opts, correct: opts.indexOf(ans) }, 'Xem trong hộp có những màu nào.', ans === 'Không thể' ? `Hộp không có bóng ${ask.n}.` : ans === 'Chắc chắn' ? `Hộp chỉ có bóng ${ask.n}.` : `Hộp có nhiều màu nên có thể lấy được bóng ${ask.n}.`);
        }),
    ],
  };

  CURRICULUM.push({
    grade: 3,
    title: 'Lớp 3',
    book: 'Kết nối tri thức với cuộc sống',
    topics: [c1, c2, c3, c4, c5, c6, c8, c9, c10, c11, c12, c13, c14, c15],
  });
})();
