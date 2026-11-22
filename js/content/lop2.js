/* Toán ISA — Lớp 2 (SGK Toán 2 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g2-c{chủ đề index}-b{Bài number}. Never rename ids (progress is saved by id).
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const R = U.rand, P = U.pick, F = x => U.fmt(x);
  const M = '−'; // real minus sign U+2212

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
  const tf = (rng, ok) => U.choices(rng, ok ? 'Đúng' : 'Sai', [ok ? 'Sai' : 'Đúng']);
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

  // Learn cards show their labels (visuals hide most labels by default so questions do not give answers away).
  const LEARN_ON = { blocks: { labels: true }, fraction: { label: true }, decimalGrid: { showLabel: true }, percent: { showLabel: true }, thermometer: { showValue: true }, roman: { showValue: true, showText: true }, average: { showMean: true }, angle: { showDeg: true }, cubes: { showDims: true } };
  function lesson(c, b, title, story, learn, gen) {
    learn.forEach(card => { const v = card.visual; if (v && LEARN_ON[v.type]) v.params = Object.assign({}, LEARN_ON[v.type], v.params); });
    return { id: `g2-c${c}-b${b}`, title, book: `Bài ${b}`, story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
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
    const at = function (rng, L, k) {
      const [a, b] = pickPair(rng, L);
      const r = op === '+' ? a + b : a - b;
      const wrong = op === '+' ? wrongAdd(a, b) : wrongSub(a, b);
      const expr = `${F(a)} ${op} ${F(b)}`;
      const colV = vz('columnCalc', { a, b, op, reveal: 'none' });
      const colH = vz('columnCalc', { a, b, op, reveal: 'steps' });
      const hintCol = op === '+'
        ? 'Viết các chữ số cùng hàng thẳng cột. Cộng từ phải sang trái' + (opts.carry ? ', nhớ 1 sang hàng bên trái.' : '.')
        : 'Viết các chữ số cùng hàng thẳng cột. Trừ từ phải sang trái' + (opts.carry ? '; nếu không trừ được thì mượn 1 chục, nhớ 1 vào số trừ ở hàng bên trái.' : '.');
      if (k === 0) return Q(`Đặt tính rồi tính:\n${expr}`, colV, num(r), hintCol, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, r, [wrong, r + 10, r - 10, r + 1, r - 1].filter(x => x >= 0)), hintCol, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const [n1, n2] = two(rng), it = P(rng, opts.items || BIG);
        let p;
        if (op === '+') p = P(rng, [
          `${n1} có ${F(a)} ${it}, ${n2} có ${F(b)} ${it}. Cả hai bạn có bao nhiêu ${it}?`,
          `Buổi sáng cửa hàng bán được ${F(a)} ${it}, buổi chiều bán được ${F(b)} ${it}. Cả ngày cửa hàng bán được bao nhiêu ${it}?`,
          `Thư viện trường có ${F(a)} quyển truyện, cô thủ thư mua thêm ${F(b)} quyển. Thư viện có tất cả bao nhiêu quyển truyện?`,
        ]);
        else p = P(rng, [
          `${n1} có ${F(a)} ${it}, ${n1} cho em ${F(b)} ${it}. Hỏi ${n1} còn lại bao nhiêu ${it}?`,
          `Cửa hàng có ${F(a)} ${it}, đã bán ${F(b)} ${it}. Cửa hàng còn lại bao nhiêu ${it}?`,
          `Trên bãi cỏ có ${F(a)} con vịt, có ${F(b)} con xuống ao bơi. Hỏi trên bãi cỏ còn bao nhiêu con vịt?`,
        ]);
        const mx = Math.max(a, b);
        const tape = op === '+'
          ? vz('tape', { bars: [{ label: 'Phần 1', units: units(a, mx), value: F(a) }, { label: 'Phần 2', units: units(b, mx), value: F(b) }], total: '?' })
          : vz('tape', { bars: [{ label: 'Có', units: units(a, mx), value: F(a) }, { label: 'Bớt', units: units(b, mx), value: F(b) }], diff: '?' });
        return Q(p, tape, num(r), op === '+' ? 'Muốn tìm tất cả, em làm phép cộng.' : 'Muốn tìm phần còn lại, em làm phép trừ.', `Phép tính: ${expr} = ${F(r)}.`);
      }
      if (k === 3) {
        const c = r + P(rng, [-10, -1, 0, 1, 10, 2]);
        const cc = Math.max(0, c);
        return Q(`So sánh: ${expr} … ${F(cc)}`, vz('compare', { left: expr, right: F(cc) }), cmpAns(r, cc), 'Tính kết quả phép tính trước rồi so sánh.', `${expr} = ${F(r)}, mà ${F(r)} ${sign(r, cc)} ${F(cc)}.`);
      }
      if (wrong !== r) {
        const who = nm(rng);
        return Q(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, colV, num(r), opts.carry ? 'Kiểm tra lại bước nhớ.' : 'Tính lại từng hàng.', `${expr} = ${F(r)}. Bạn ${who} đã quên nhớ.`, { hintVisual: colH });
      }
      if (op === '+') return Q(`Số thích hợp ở ô ? là bao nhiêu?\n${F(a)} + ? = ${F(r)}`, null, num(b), 'Muốn tìm số hạng chưa biết, lấy tổng trừ đi số hạng kia.', `${F(r)} ${M} ${F(a)} = ${F(b)}.`);
      return Q(`Số thích hợp ở ô ? là bao nhiêu?\n${F(a)} ${M} ? = ${F(r)}`, null, num(b), 'Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu.', `${F(a)} ${M} ${F(r)} = ${F(b)}.`);
    };
    // gen: practice (form by i % 5). exam: level 1 = đặt tính rồi tính, level 2–3 = bài toán có lời văn.
    const gen = (rng, i) => at(rng, lv(i), i % 5);
    gen.exam = (rng, level) => (level === 1 ? at(rng, 1, 0) : at(rng, level === 2 ? 1 : 2, 2));
    return gen;
  }

  // Multiplication table n
  function mulTableGen(n, ctxs) {
    return function (rng, i) {
      const L = lv(i);
      const k = L === 0 ? R(rng, 1, 5) : R(rng, 2, 10);
      const p = n * k;
      const f = i % 5;
      if (f === 0) return Q(`${n} × ${k} = ?`, vz('array', { rows: k, cols: n, emoji: P(rng, ['🍎', '🌸', '⭐', '🍬']) }), num(p), `${n} được lấy ${k} lần.`, `${n} × ${k} = ${p}.`);
      if (f === 1) {
        const c = P(rng, ctxs);
        return Q(`${c.per} Hỏi ${k} ${c.who} có bao nhiêu ${c.what}?`, vz('objects', { groups: Array.from({ length: Math.min(k, 10) }, () => ({ emoji: c.e, count: n })) }), num(p), `${n} được lấy ${k} lần, em làm phép nhân ${n} × ${k}.`, `${n} × ${k} = ${p} (${c.what}).`);
      }
      if (f === 2) {
        const start = R(rng, 1, 6), miss = R(rng, 1, 3);
        const seq = [0, 1, 2, 3].map(j => n * (start + j));
        const shown = seq.map((v, j) => (j === miss ? '?' : String(v))).join(', ');
        return Q(`Đếm thêm ${n}: ${shown}\nSố ở ô ? là số nào?`, vz('numberLine', { min: 0, max: n * 10, step: n, labelEvery: 1, hops: seq.slice(0, miss).map(v => ({ from: v, to: v + n, label: '+' + n })), unknown: seq[miss] }), num(seq[miss]), `Mỗi lần đếm thêm ${n}.`, `${seq[miss - 1]} + ${n} = ${seq[miss]}.`);
      }
      if (f === 3) return Q(`Số thích hợp ở ô ?:\n${n} × ? = ${p}`, null, num(k), `Nhẩm bảng nhân ${n}: ${n} nhân mấy bằng ${p}?`, `${n} × ${k} = ${p}, vậy số cần điền là ${k}.`);
      const k2 = L === 0 ? R(rng, 1, 5) : R(rng, 1, 10);
      const right = R(rng, 0, 1) ? n * k2 : n * k2 + P(rng, [-1, 1, 2]);
      return Q(`So sánh: ${n} × ${k} … ${right}`, vz('compare', { left: `${n} × ${k}`, right: String(right) }), cmpAns(p, right), `Tính ${n} × ${k} trước.`, `${n} × ${k} = ${p}; ${p} ${sign(p, right)} ${right}.`);
    };
  }

  // Division table n
  function divTableGen(n, ctxs) {
    return function (rng, i) {
      const L = lv(i);
      const k = L === 0 ? R(rng, 1, 5) : R(rng, 2, 10);
      const p = n * k;
      const f = i % 5;
      if (f === 0) return Q(`${p} : ${n} = ?`, vz('share', { total: p, groups: n, emoji: P(rng, ['🍬', '🍪', '🍎']) }), num(k), `Chia đều ${p} vào ${n} phần. Nhớ bảng nhân ${n}: ${n} × ? = ${p}.`, `${p} : ${n} = ${k}.`);
      if (f === 1) {
        const c = P(rng, ctxs);
        return Q(c.q(p, n), vz('share', { total: p, groups: n, emoji: c.e, plateLabel: c.plate }), num(k), `Em làm phép chia ${p} : ${n}.`, `${p} : ${n} = ${k} (${c.unit}).`);
      }
      if (f === 2) return Q(`Biết ${n} × ${k} = ${p}. Vậy ${p} : ${n} = ?`, vz('array', { rows: k, cols: n }), ch(rng, k, [k + 1, k - 1, p, n].filter(x => x > 0)), 'Từ một phép nhân ta viết được phép chia: lấy tích chia cho một thừa số được thừa số kia.', `${p} : ${n} = ${k}.`);
      if (f === 3) {
        if (R(rng, 0, 1)) return Q(`Số thích hợp ở ô ?:\n${p} : ? = ${k}`, null, num(n), `Thử bảng chia ${n}.`, `${p} : ${n} = ${k}.`);
        return Q(`Số thích hợp ở ô ?:\n? : ${n} = ${k}`, null, num(p), `Số bị chia = thương × số chia.`, `${k} × ${n} = ${p}, vậy ${p} : ${n} = ${k}.`);
      }
      const k2 = R(rng, 1, 10), right = k2;
      return Q(`So sánh: ${p} : ${n} … ${right}`, vz('compare', { left: `${p} : ${n}`, right: String(right) }), cmpAns(k, right), `Tính ${p} : ${n} trước.`, `${p} : ${n} = ${k}; ${k} ${sign(k, right)} ${right}.`);
    };
  }

  // ============ CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG ============
  const c1 = {
    id: 'g2-c1', semester: 1, title: 'Ôn tập và bổ sung', icon: '🔢', lessons: [
      lesson(1, 1, 'Ôn tập các số đến 100',
        'Rô-bốt ISA cùng bạn Mai đếm những bó que tính chuẩn bị cho ngày khai giảng.',
        [
          { text: 'Mỗi thanh là 1 chục (10 khối). Số 45 gồm 4 chục và 5 đơn vị, đọc là "bốn mươi lăm".', visual: vz('blocks', { hundreds: 0, tens: 4, ones: 5 }) },
          { text: 'Số 70 gồm 7 chục và 0 đơn vị. Đây là số tròn chục.', visual: vz('blocks', { hundreds: 0, tens: 7, ones: 0 }) },
          { text: 'So sánh 38 và 52: so hàng chục trước, 3 chục < 5 chục nên 38 < 52.', visual: vz('compare', { left: 38, right: 52 }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) {
            const t = R(rng, 1, 9), o = R(rng, 0, 9), n = t * 10 + o;
            return Q('Hình dưới đây biểu diễn số nào?', vz('blocks', { hundreds: 0, tens: t, ones: o }), num(n), 'Đếm số thanh chục, rồi đếm số khối lẻ.', `${t} chục và ${o} đơn vị là ${n}.`);
          }
          if (f === 1) {
            const t = R(rng, 1, 9), o = R(rng, 1, 9), n = t * 10 + o;
            return Q(`Số gồm ${t} chục và ${o} đơn vị là số nào?`, null, ch(rng, n, [o * 10 + t, t + o, t * 10, n + 10]), 'Chữ số hàng chục viết trước, chữ số hàng đơn vị viết sau.', `${t} chục và ${o} đơn vị viết là ${n}.`);
          }
          if (f === 2) {
            const n = R(rng, 21, 99);
            return Q(`Số "${readVN(n)}" viết là:`, null, ch(rng, n, [Math.floor(n / 10) + (n % 10) * 10, n + 1, n - 10].filter(x => x > 0 && x < 100)), 'Nghe số chục trước, số đơn vị sau.', `"${readVN(n)}" viết là ${n}.`);
          }
          if (f === 3) {
            const a = R(rng, 10, 99); let b = lv(i) === 2 ? Math.floor(a / 10) * 10 + R(rng, 0, 9) : R(rng, 10, 99);
            return Q(`So sánh: ${a} … ${b}`, vz('compare', { left: a, right: b }), cmpAns(a, b), 'So sánh chữ số hàng chục trước; nếu bằng nhau thì so sánh hàng đơn vị.', `${a} ${sign(a, b)} ${b}.`);
          }
          const arr = U.sample(rng, Array.from({ length: 90 }, (_, k) => k + 10), 4);
          const big = R(rng, 0, 1) === 1;
          const ans = big ? Math.max(...arr) : Math.min(...arr);
          return Q(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.join('; ')} là:`, null, ch(rng, ans, arr), 'So sánh hàng chục trước.', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`);
        }),

      lesson(1, 2, 'Tia số. Số liền trước, số liền sau',
        'Rô-bốt ISA nhảy từng bước trên tia số vẽ ở sân trường cùng bạn Nam.',
        [
          { text: 'Trên tia số, các số được xếp theo thứ tự từ bé đến lớn, cách đều nhau.', visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1 }) },
          { text: 'Số liền sau của 6 là 7 (thêm 1). Số liền trước của 6 là 5 (bớt 1).', visual: vz('numberLine', { min: 0, max: 10, step: 1, labelEvery: 1, marks: [5, 6, 7], hops: [{ from: 6, to: 7, label: '+1' }] }) },
          { text: 'Tia số cũng có thể đếm theo chục: 0, 10, 20, 30, …', visual: vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 1 }) },
        ],
        function (rng, i) {
          const f = i % 5, L = lv(i);
          if (f === 0) {
            if (L === 2) {
              const n = R(rng, 1, 9) * 10;
              return Q('Số thích hợp ở ô ? trên tia số là số nào?', vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 1, unknown: n }), num(n), 'Tia số này đếm thêm 10.', `Số cần điền là ${n}.`);
            }
            const a0 = R(rng, 0, 8) * 10, n = a0 + R(rng, 1, 9);
            return Q('Số thích hợp ở ô ? trên tia số là số nào?', vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: 1, unknown: n }), num(n), 'Đếm thêm 1 từ số bên trái.', `Số cần điền là ${n}.`);
          }
          if (f === 1) {
            const n = R(rng, 10, 98);
            return Q(`Số liền sau của ${n} là số nào?`, null, ch(rng, n + 1, [n - 1, n + 10, n + 2]), 'Số liền sau thì thêm 1.', `${n} + 1 = ${n + 1}.`);
          }
          if (f === 2) {
            const n = R(rng, 11, 99);
            return Q(`Số liền trước của ${n} là số nào?`, null, ch(rng, n - 1, [n + 1, n - 10, n - 2]), 'Số liền trước thì bớt 1.', `${n} ${M} 1 = ${n - 1}.`);
          }
          if (f === 3) {
            const a0 = R(rng, 0, 4) * 20, n = a0 + R(rng, 1, 19);
            return Q(`Chạm vào vạch ứng với số ${n} trên tia số.`, vz('numberLine', { min: a0, max: a0 + 20, step: 1, labelEvery: 5 }), { kind: 'visual', check: v => v === n }, 'Tìm số tròn chục hoặc số có chữ số 5 gần nhất rồi đếm tiếp.', `Số ${n} nằm giữa ${n - 1} và ${n + 1}.`);
          }
          const n = R(rng, 11, 98);
          return Q(`Số ở giữa ${n - 1} và ${n + 1} là số nào?`, vz('numberLine', { min: Math.floor((n - 1) / 10) * 10, max: Math.floor((n - 1) / 10) * 10 + 20, step: 1, labelEvery: 5, marks: [n - 1, n + 1] }), num(n), 'Số đó là số liền sau của số bé.', `${n - 1}, ${n}, ${n + 1}.`);
        }),

      lesson(1, 3, 'Các thành phần của phép cộng, phép trừ',
        'Rô-bốt ISA giúp bạn Chi đặt tên cho từng số trong phép tính.',
        [
          { text: 'Trong 32 + 15 = 47: 32 và 15 là số hạng, 47 là tổng.', visual: vz('columnCalc', { a: 32, b: 15, op: '+', reveal: 'all' }) },
          { text: 'Trong 68 − 25 = 43: 68 là số bị trừ, 25 là số trừ, 43 là hiệu.', visual: vz('columnCalc', { a: 68, b: 25, op: M, reveal: 'all' }) },
        ],
        function (rng, i) {
          const f = i % 5;
          const [a, b] = pairWhere(rng, [11, 69], [10, 30], (x, y) => noCarry(x, y) && x !== y && x + y < 100, [32, 15]);
          const s = a + b;
          if (f === 0) return Q(`Trong phép cộng ${a} + ${b} = ${s}, tổng là số nào?`, vz('columnCalc', { a, b, op: '+', reveal: 'all' }), ch(rng, s, [a, b]), 'Kết quả của phép cộng gọi là tổng.', `Tổng là ${s}.`);
          if (f === 1) return Q(`Hai số hạng là ${a} và ${b}. Tổng là bao nhiêu?`, vz('columnCalc', { a, b, op: '+', reveal: 'none' }), num(s), 'Tổng = số hạng + số hạng.', `${a} + ${b} = ${s}.`);
          if (f === 2) return Q(`Số bị trừ là ${s}, số trừ là ${b}. Hiệu là bao nhiêu?`, vz('columnCalc', { a: s, b, op: M, reveal: 'none' }), num(a), 'Hiệu = số bị trừ − số trừ.', `${s} ${M} ${b} = ${a}.`);
          if (f === 3) return Q(`Trong phép trừ ${s} ${M} ${b} = ${a}, số trừ là số nào?`, vz('columnCalc', { a: s, b, op: M, reveal: 'all' }), ch(rng, b, [s, a]), 'Số trừ đứng sau dấu trừ.', `Số trừ là ${b}.`);
          const pickT = R(rng, 0, 2);
          const names = ['Số bị trừ', 'Số trừ', 'Hiệu'];
          const val = [s, b, a][pickT];
          return Q(`Trong phép tính ${s} ${M} ${b} = ${a}, số ${val} gọi là gì?`, null, ch(rng, names[pickT], names.concat(['Tổng']).filter(x => x !== names[pickT])), 'Nhớ: số bị trừ − số trừ = hiệu.', `${val} là ${names[pickT].toLowerCase()}.`);
        }),

      lesson(1, 4, 'Hơn, kém nhau bao nhiêu',
        'Rô-bốt ISA và bạn Hùng so xem rổ cam nhiều hơn rổ táo mấy quả.',
        [
          { text: 'Xếp hai hàng thẳng nhau: hàng cam thừa ra 3 quả. Vậy 7 hơn 4 là 3 đơn vị.', visual: vz('objects', { groups: [{ emoji: '🍊', count: 7 }, { emoji: '🍎', count: 4 }] }) },
          { text: 'Muốn biết hơn, kém nhau bao nhiêu, ta lấy số lớn trừ số bé: 7 − 4 = 3.', visual: vz('tape', { bars: [{ label: 'Cam', units: 7, value: '7' }, { label: 'Táo', units: 4, value: '4' }], diff: '3' }) },
        ],
        function (rng, i) {
          const f = i % 4, L = lv(i);
          if (f === 0) {
            const [x, y] = U.sample(rng, ITEMS.slice(0, 8), 2);
            const a = R(rng, 4, 10), b = R(rng, 1, a - 1);
            return Q(`Số ${x.n} nhiều hơn số ${y.n} bao nhiêu?`, vz('objects', { groups: [{ emoji: x.e, count: a }, { emoji: y.e, count: b }] }), num(a - b), 'Lấy số lớn trừ số bé.', `${a} ${M} ${b} = ${a - b}.`);
          }
          const [a, b] = pairWhere(rng, [20, 99], [10, 89], (p, q) => p > q && noBorrow(p, q), [57, 23]);
          if (f === 1) return Q(`${a} hơn ${b} bao nhiêu đơn vị?`, vz('tape', { bars: [{ label: String(a), units: units(a, a), value: String(a) }, { label: String(b), units: units(b, a), value: String(b) }], diff: '?' }), num(a - b), 'Lấy số lớn trừ số bé.', `${a} ${M} ${b} = ${a - b}. Vậy ${a} hơn ${b} là ${a - b} đơn vị.`);
          if (f === 2) return Q(`${b} kém ${a} bao nhiêu đơn vị?`, null, ch(rng, a - b, [a + b, a - b + 10, a - b - 1].filter(x => x > 0)), 'Kém bao nhiêu cũng lấy số lớn trừ số bé.', `${a} ${M} ${b} = ${a - b}.`);
          const [c1n, c2n] = U.sample(rng, ['2A', '2B', '2C', '2D'], 2);
          const aa = L === 0 ? R(rng, 31, 39) : a, bb = L === 0 ? R(rng, 30, aa - 1) : b;
          return Q(`Lớp ${c1n} có ${aa} học sinh, lớp ${c2n} có ${bb} học sinh. Lớp ${c1n} nhiều hơn lớp ${c2n} bao nhiêu học sinh?`, vz('tape', { bars: [{ label: c1n, units: units(aa, aa), value: String(aa) }, { label: c2n, units: units(bb, aa), value: String(bb) }], diff: '?' }), num(aa - bb), 'Lấy số lớn trừ số bé.', `${aa} ${M} ${bb} = ${aa - bb} (học sinh).`);
        }),

      lesson(1, 5, 'Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100',
        'Rô-bốt ISA cùng bạn Lan tính số bánh chưng cả xóm gói cho ngày Tết.',
        [
          { text: 'Đặt tính: hàng đơn vị thẳng hàng đơn vị, hàng chục thẳng hàng chục. Tính từ phải sang trái.', visual: vz('columnCalc', { a: 43, b: 25, op: '+', reveal: 'all' }) },
          { text: '76 − 34: 6 trừ 4 bằng 2, viết 2; 7 trừ 3 bằng 4, viết 4. Vậy 76 − 34 = 42.', visual: vz('columnCalc', { a: 76, b: 34, op: M, reveal: 'all' }) },
        ],
        mixCol([
          ['+', (r, L) => pairWhere(r, [10, 80], L === 0 ? [1, 9] : [10, 50], (a, b) => noCarry(a, b) && a + b < 100, [43, 25])],
          [M, (r, L) => pairWhere(r, [20, 99], L === 0 ? [1, 9] : [10, 70], (a, b) => a > b && noBorrow(a, b), [76, 34])],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 2. PHÉP CỘNG, PHÉP TRỪ TRONG PHẠM VI 20 ============
  function addOver10(rng) { const a = R(rng, 2, 9); const b = R(rng, Math.max(2, 11 - a), 9); return [a, b]; }
  function subOver10(rng) { const a = R(rng, 11, 18); const b = R(rng, a - 9, 9); return [a, Math.max(b, (a % 10) + 1)]; }
  const c2 = {
    id: 'g2-c2', semester: 1, title: 'Phép cộng, phép trừ trong phạm vi 20', icon: '➕', lessons: [
      lesson(2, 7, 'Phép cộng (qua 10) trong phạm vi 20',
        'Rô-bốt ISA giúp bạn An xếp trứng vào khay 10 ô để đếm cho nhanh.',
        [
          { text: '9 + 4: lấy 1 ở số 4 cho đủ 10 với số 9, còn 3. Vậy 9 + 4 = 10 + 3 = 13.', visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 9, to: 10, label: '+1' }, { from: 10, to: 13, label: '+3' }] }) },
          { text: '8 + 5 = 8 + 2 + 3 = 13. Tách số sau để "làm tròn 10" trước.', visual: vz('objects', { groups: [{ emoji: '🥚', count: 8 }, { emoji: '🥚', count: 5 }] }) },
        ],
        function (rng, i) {
          const [a, b] = addOver10(rng), s = a + b, f = i % 5, it = P(rng, ITEMS.slice(0, 10));
          const hv = vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: a, to: 10, label: '+' + (10 - a) }, { from: 10, to: s, label: '+' + (s - 10) }] });
          if (f === 0) return Q(`Có tất cả bao nhiêu ${it.n}?`, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), num(s), `Đếm thêm từ ${a}.`, `${a} + ${b} = ${s}.`, { hintVisual: hv });
          if (f === 1) return Q(`${a} + ${b} = ?`, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), ch(rng, s, [s - 1, s + 1, s - 10, s + 2].filter(x => x > 0)), `Tách ${b} = ${10 - a} + ${b - (10 - a)} để ${a} + ${10 - a} = 10.`, `${a} + ${b} = ${a} + ${10 - a} + ${b - (10 - a)} = ${s}.`, { hintVisual: hv });
          if (f === 2) return Q(`Số thích hợp ở ô ?:\n${a} + ${b} = ${a} + ${10 - a} + ?`, hv, num(b - (10 - a)), `${b} tách thành ${10 - a} và mấy?`, `${b} = ${10 - a} + ${b - (10 - a)}.`);
          if (f === 3) {
            const t = P(rng, [
              `Trong chuồng có ${a} con gà, mẹ mua thêm ${b} con gà. Hỏi trong chuồng có tất cả bao nhiêu con gà?`,
              `${nm(rng)} có ${a} viên bi, được bạn cho thêm ${b} viên bi. Hỏi bạn ấy có tất cả bao nhiêu viên bi?`,
              `Trên cành có ${a} con chim, có thêm ${b} con chim bay đến. Hỏi trên cành có tất cả bao nhiêu con chim?`,
            ]);
            return Q(t, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), num(s), 'Thêm vào thì làm phép cộng.', `${a} + ${b} = ${s}.`);
          }
          const d = [`${a} + ${b - 1}`, `${a + 1} + ${b}`, `${a - 1} + ${b}`].filter(x => !/\b0\b/.test(x));
          return Q(`Phép tính nào có kết quả bằng ${s}?`, null, ch(rng, `${a} + ${b}`, d), 'Tính nhẩm từng phép tính.', `${a} + ${b} = ${s}.`);
        }),

      lesson(2, 8, 'Bảng cộng (qua 10)',
        'Rô-bốt ISA cùng bạn Vy học thuộc bảng cộng để đi chợ tính nhẩm thật nhanh.',
        [
          { text: '9 + 2 = 11, 9 + 3 = 12, … 9 + 9 = 18. Thêm 1 vào số hạng thì tổng thêm 1.', visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 9, to: 11, label: '+2' }] }) },
          { text: 'Đổi chỗ hai số hạng thì tổng không đổi: 7 + 5 = 5 + 7 = 12.', visual: vz('objects', { groups: [{ emoji: '🍬', count: 7 }, { emoji: '🍬', count: 5 }] }) },
        ],
        function (rng, i) {
          const [a, b] = addOver10(rng), s = a + b, f = i % 5;
          if (f === 0) return Q(`Tính nhẩm: ${a} + ${b} = ?`, null, num(s), 'Làm tròn 10 trước.', `${a} + ${b} = ${s}.`);
          if (f === 1) return Q(`Số thích hợp ở ô ?:\n${a} + ? = ${s}`, vz('objects', { groups: [{ emoji: '⭐', count: a }, { emoji: '❔', count: 1 }] }), num(b), `Đếm thêm từ ${a} đến ${s}.`, `${a} + ${b} = ${s}.`);
          if (f === 2) {
            const [c, d] = addOver10(rng);
            return Q(`So sánh: ${a} + ${b} … ${c} + ${d}`, vz('compare', { left: `${a} + ${b}`, right: `${c} + ${d}` }), cmpAns(s, c + d), 'Tính tổng hai bên rồi so sánh.', `${a} + ${b} = ${s}; ${c} + ${d} = ${c + d}. Vậy ${s} ${sign(s, c + d)} ${c + d}.`);
          }
          if (f === 3) return Q(`Số thích hợp ở ô ?:\n${a} + ${b} = ${b} + ?`, null, num(a), 'Đổi chỗ các số hạng thì tổng không thay đổi.', `${a} + ${b} = ${b} + ${a}.`);
          const t = R(rng, 11, 18);
          const a2 = R(rng, t - 9, 9);
          return Q(`Số nào cộng với ${a2} được ${t}?`, null, ch(rng, t - a2, [t - a2 + 1, t - a2 - 1, t].filter(x => x > 0)), `${a2} + ? = ${t}.`, `${a2} + ${t - a2} = ${t}.`);
        }),

      lesson(2, 9, 'Bài toán về thêm, bớt một số đơn vị',
        'Rô-bốt ISA cùng bạn Bình đếm bóng bay chuẩn bị cho Tết Trung thu.',
        [
          { text: 'Có 8 quả bóng, thêm 3 quả. Thêm thì cộng: 8 + 3 = 11 (quả).', visual: vz('objects', { groups: [{ emoji: '🎈', count: 8 }, { emoji: '🎈', count: 3 }] }) },
          { text: 'Có 12 quả bóng, bay mất 4 quả. Bớt thì trừ: 12 − 4 = 8 (quả).', visual: vz('objects', { groups: [{ emoji: '🎈', count: 12 }], crossOut: 4 }) },
        ],
        function (rng, i) {
          const f = i % 4, it = P(rng, [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[4], ITEMS[6], ITEMS[7], ITEMS[10], ITEMS[11]]), who = nm(rng);
          if (f === 0 || f === 2) {
            const [a, b] = lv(i) === 0 ? [R(rng, 3, 8), R(rng, 1, 5)] : addOver10(rng);
            const t = P(rng, [
              `${who} có ${a} ${it.n}, mẹ cho thêm ${b} ${it.n}. Hỏi ${who} có tất cả bao nhiêu ${it.n}?`,
              `Trong rổ có ${a} ${it.n}, bà bỏ thêm vào ${b} ${it.n}. Hỏi trong rổ có bao nhiêu ${it.n}?`,
            ]);
            if (f === 2) return Q(t + '\nEm chọn phép tính đúng:', vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), ch(rng, `${a} + ${b} = ${a + b}`, [`${a + b} ${M} ${b} = ${a}`, `${a} + ${b} = ${a + b + 1}`]), 'Thêm thì làm phép cộng.', `${a} + ${b} = ${a + b} (${it.n}).`);
            return Q(t, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }), num(a + b), 'Thêm thì làm phép cộng.', `${a} + ${b} = ${a + b} (${it.n}).`);
          }
          const [a, b] = lv(i) === 0 ? [R(rng, 5, 10), R(rng, 1, 4)] : subOver10(rng);
          const t = P(rng, [
            `${who} có ${a} ${it.n}, ${who} cho bạn ${b} ${it.n}. Hỏi ${who} còn lại bao nhiêu ${it.n}?`,
            `Trên bàn có ${a} ${it.n}, em lấy đi ${b} ${it.n}. Hỏi trên bàn còn bao nhiêu ${it.n}?`,
          ]);
          if (f === 3) return Q(t + '\nEm chọn phép tính đúng:', vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b }), ch(rng, `${a} ${M} ${b} = ${a - b}`, [`${a} + ${b} = ${a + b}`, `${a} ${M} ${b} = ${a - b + 1}`]), 'Bớt đi thì làm phép trừ.', `${a} ${M} ${b} = ${a - b} (${it.n}).`);
          return Q(t, vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b }), num(a - b), 'Bớt đi thì làm phép trừ.', `${a} ${M} ${b} = ${a - b} (${it.n}).`);
        }),

      lesson(2, 11, 'Phép trừ (qua 10) trong phạm vi 20',
        'Rô-bốt ISA và bạn Ngọc chia bánh trung thu cho các bạn trong lớp.',
        [
          { text: '13 − 5: bớt 3 trước để còn 10, rồi bớt tiếp 2. Vậy 13 − 5 = 13 − 3 − 2 = 8.', visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 13, to: 10, label: '−3' }, { from: 10, to: 8, label: '−2' }] }) },
          { text: 'Có 12 cái bánh, cho đi 4 cái, còn lại 8 cái: 12 − 4 = 8.', visual: vz('objects', { groups: [{ emoji: '🥮', count: 12 }], crossOut: 4 }) },
        ],
        function (rng, i) {
          const [a, b] = subOver10(rng), r = a - b, f = i % 5, u = a - 10, it = P(rng, ITEMS.slice(0, 10));
          const hv = vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: a, to: 10, label: M + u }, { from: 10, to: r, label: M + (b - u) }] });
          if (f === 0) return Q(`Còn lại bao nhiêu ${it.n}?`, vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b }), num(r), 'Đếm những hình không bị gạch.', `${a} ${M} ${b} = ${r}.`, { hintVisual: hv });
          if (f === 1) return Q(`${a} ${M} ${b} = ?`, null, ch(rng, r, [r + 1, r - 1, r + 10, b].filter(x => x > 0)), `Bớt ${u} để được 10, rồi bớt tiếp ${b - u}.`, `${a} ${M} ${b} = ${a} ${M} ${u} ${M} ${b - u} = ${r}.`, { hintVisual: hv });
          if (f === 2) return Q(`Số thích hợp ở ô ?:\n${a} ${M} ${b} = ${a} ${M} ${u} ${M} ?`, hv, num(b - u), `${b} tách thành ${u} và mấy?`, `${b} = ${u} + ${b - u}.`);
          if (f === 3) {
            const t = P(rng, [
              `Mẹ mua ${a} quả trứng, đã dùng ${b} quả để làm bánh. Hỏi còn lại bao nhiêu quả trứng?`,
              `Lớp em có ${a} lá cờ, đã cắm ${b} lá lên cột. Hỏi còn bao nhiêu lá cờ chưa cắm?`,
              `${nm(rng)} có ${a} nhãn vở, đã dán ${b} nhãn. Hỏi còn bao nhiêu nhãn vở chưa dán?`,
            ]);
            return Q(t, null, num(r), 'Bớt đi thì làm phép trừ.', `${a} ${M} ${b} = ${r}.`, { hintVisual: hv });
          }
          return Q(`Số thích hợp ở ô ?:\n${a} ${M} ? = ${r}`, null, num(b), `Từ ${a} lùi về ${r} là lùi mấy bước?`, `${a} ${M} ${b} = ${r}.`, { hintVisual: hv });
        }),

      lesson(2, 12, 'Bảng trừ (qua 10)',
        'Rô-bốt ISA đố bạn Tú trừ nhẩm thật nhanh trên đường đến trường.',
        [
          { text: '11 − 2 = 9, 11 − 3 = 8, … Số trừ thêm 1 thì hiệu bớt 1.', visual: vz('numberLine', { min: 0, max: 20, step: 1, labelEvery: 5, hops: [{ from: 11, to: 9, label: '−2' }] }) },
          { text: 'Dựa vào bảng cộng: 8 + 5 = 13 nên 13 − 5 = 8 và 13 − 8 = 5.', visual: vz('objects', { groups: [{ emoji: '🍬', count: 13 }], crossOut: 5 }) },
        ],
        function (rng, i) {
          const [a, b] = subOver10(rng), r = a - b, f = i % 5;
          if (f === 0) return Q(`Tính nhẩm: ${a} ${M} ${b} = ?`, null, num(r), `Nhớ bảng cộng: ${b} + ? = ${a}.`, `${a} ${M} ${b} = ${r}.`);
          if (f === 1) return Q(`Biết ${r} + ${b} = ${a}. Vậy ${a} ${M} ${b} = ?`, null, ch(rng, r, [b, a, r + 1].filter(x => x !== r)), 'Lấy tổng trừ đi một số hạng thì được số hạng kia.', `${a} ${M} ${b} = ${r}.`);
          if (f === 2) {
            const [c, d] = subOver10(rng);
            return Q(`So sánh: ${a} ${M} ${b} … ${c} ${M} ${d}`, vz('compare', { left: `${a} ${M} ${b}`, right: `${c} ${M} ${d}` }), cmpAns(r, c - d), 'Tính hiệu hai bên rồi so sánh.', `${a} ${M} ${b} = ${r}; ${c} ${M} ${d} = ${c - d}.`);
          }
          if (f === 3) return Q(`Số thích hợp ở ô ?:\n? ${M} ${b} = ${r}`, null, num(a), 'Số bị trừ = hiệu + số trừ.', `${r} + ${b} = ${a}.`);
          const opts = [[a, b], subOver10(rng), subOver10(rng)];
          const target = r;
          const strs = opts.map(([x, y]) => `${x} ${M} ${y}`);
          const wrongs = opts.slice(1).filter(([x, y]) => x - y !== target).map(([x, y]) => `${x} ${M} ${y}`);
          wrongs.push(`${a} ${M} ${b + (b < 9 ? 1 : -1)}`);
          return Q(`Phép trừ nào có hiệu bằng ${target}?`, null, ch(rng, strs[0], wrongs.filter(w => { const [x, y] = w.split(` ${M} `).map(Number); return x - y !== target; })), 'Tính nhẩm từng phép trừ.', `${a} ${M} ${b} = ${target}.`);
        }),

      lesson(2, 13, 'Bài toán về nhiều hơn, ít hơn một số đơn vị',
        'Rô-bốt ISA giúp bạn Thảo và bạn Quân đếm nhãn vở trong ngày đầu năm học.',
        [
          { text: 'Hà có 6 nhãn vở. Lan nhiều hơn Hà 3 nhãn vở. Lan có: 6 + 3 = 9 (nhãn vở).', visual: vz('tape', { bars: [{ label: 'Hà', units: 6, value: '6' }, { label: 'Lan', units: 9, value: '?' }], diff: '3' }) },
          { text: 'Nam có 9 viên bi. Minh ít hơn Nam 4 viên. Minh có: 9 − 4 = 5 (viên bi).', visual: vz('tape', { bars: [{ label: 'Nam', units: 9, value: '9' }, { label: 'Minh', units: 5, value: '?' }], diff: '4' }) },
        ],
        function (rng, i) {
          const [n1, n2] = two(rng), it = P(rng, ['nhãn vở', 'viên bi', 'bông hoa', 'quyển truyện', 'cái kẹo']);
          const more = i % 2 === 0;
          const L = lv(i);
          let a, b;
          if (more) [a, b] = L < 2 ? addOver10(rng) : pairWhere(rng, [20, 70], [10, 25], (x, y) => noCarry(x, y), [42, 15]);
          else [a, b] = L < 2 ? subOver10(rng) : pairWhere(rng, [40, 99], [10, 30], (x, y) => x > y && noBorrow(x, y), [68, 25]);
          const r = more ? a + b : a - b;
          const mx = Math.max(a, r);
          const tape = vz('tape', { bars: [{ label: n1, units: units(a, mx), value: F(a) }, { label: n2, units: units(r, mx), value: '?' }], diff: F(b) });
          if (i % 4 === 3) {
            return Q(`${n1} có ${a} ${it}. ${n2} ${more ? 'nhiều' : 'ít'} hơn ${n1} ${b} ${it}. Em chọn phép tính để tìm số ${it} của ${n2}:`, tape, ch(rng, more ? `${a} + ${b}` : `${a} ${M} ${b}`, [more ? `${a} ${M} ${b}` : `${a} + ${b}`, `${b} + ${b}`]), more ? 'Nhiều hơn thì cộng.' : 'Ít hơn thì trừ.', `${more ? `${a} + ${b}` : `${a} ${M} ${b}`} = ${r} (${it}).`);
          }
          return Q(`${n1} có ${a} ${it}. ${n2} ${more ? 'nhiều' : 'ít'} hơn ${n1} ${b} ${it}. Hỏi ${n2} có bao nhiêu ${it}?`, tape, num(r), more ? 'Nhiều hơn thì làm phép cộng.' : 'Ít hơn thì làm phép trừ.', `Số ${it} của ${n2} là: ${more ? `${a} + ${b}` : `${a} ${M} ${b}`} = ${r} (${it}).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. LÀM QUEN VỚI KHỐI LƯỢNG, DUNG TÍCH ============
  function weightsFor(w) { const out = []; let x = w; for (const k of [5, 2, 1]) while (x >= k) { out.push({ label: k + ' kg', kg: k }); x -= k; } return out; }
  const FRUIT = [{ n: 'quả dưa hấu', e: '🍉' }, { n: 'quả bí ngô', e: '🎃' }, { n: 'túi gạo', e: '🌾' }, { n: 'quả mít', e: '🍈' }, { n: 'túi cam', e: '🍊' }];
  const c3 = {
    id: 'g2-c3', semester: 1, title: 'Làm quen với khối lượng, dung tích', icon: '⚖️', lessons: [
      lesson(3, 15, 'Ki-lô-gam',
        'Rô-bốt ISA theo mẹ bạn Hà ra chợ cân dưa hấu bằng chiếc cân đĩa.',
        [
          { text: 'Ki-lô-gam là đơn vị đo khối lượng, viết tắt là kg. Cân thăng bằng: quả dưa nặng bằng 3 quả cân 1 kg, tức là 3 kg.', visual: vz('scale', { left: [{ label: '🍉', kg: 3 }], right: [{ label: '1 kg', kg: 1 }, { label: '1 kg', kg: 1 }, { label: '1 kg', kg: 1 }] }) },
          { text: 'Đĩa cân nào nặng hơn thì lệch xuống thấp hơn.', visual: vz('scale', { left: [{ label: '🎃', kg: 5 }], right: [{ label: '🍉', kg: 2 }] }) },
          { text: 'Tính với số đo khối lượng như với số, nhớ ghi "kg": 5 kg + 3 kg = 8 kg.' },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) {
            const w = R(rng, 2, lv(i) === 0 ? 5 : 9), it = P(rng, FRUIT);
            return Q(`Cân thăng bằng. ${it.n[0].toUpperCase() + it.n.slice(1)} nặng mấy ki-lô-gam?`, vz('scale', { left: [{ label: it.e, kg: w }], right: weightsFor(w) }), num(w, 'kg'), 'Cộng các quả cân ở đĩa bên kia.', (weightsFor(w).length > 1 ? `${weightsFor(w).map(x => x.kg).join(' + ')} = ${w} (kg).` : `Cân thăng bằng với quả cân ${w} kg.`));
          }
          if (f === 1) {
            const [a, b] = pairWhere(rng, [2, 40], [1, 30], (x, y) => noCarry(x, y), [12, 5]);
            return Q(`${a} kg + ${b} kg = ?`, null, num(a + b, 'kg'), 'Cộng các số rồi viết thêm "kg".', `${a} kg + ${b} kg = ${a + b} kg.`);
          }
          if (f === 2) {
            const [x, y] = U.sample(rng, FRUIT, 2);
            const a = R(rng, 1, 9); let b = R(rng, 1, 9); if (b === a) b = a === 9 ? 8 : a + 1;
            const cap = s => s[0].toUpperCase() + s.slice(1);
            return Q(`Vật nào nặng hơn?`, vz('scale', { left: [{ label: x.e, kg: a }], right: [{ label: y.e, kg: b }] }), ch(rng, cap(a > b ? x.n : y.n), [cap(a > b ? y.n : x.n), 'Hai vật nặng bằng nhau']), 'Đĩa cân nào thấp hơn thì vật trên đĩa đó nặng hơn.', `${cap(a > b ? x.n : y.n)} nặng hơn.`);
          }
          if (f === 3) {
            const [a, b] = pairWhere(rng, [10, 50], [5, 40], (x, y) => noCarry(x, y), [25, 13]);
            return Q(`Bao gạo nặng ${a} kg, bao ngô nặng ${b} kg. Cả hai bao nặng bao nhiêu ki-lô-gam?`, vz('tape', { bars: [{ label: 'Gạo', units: units(a, Math.max(a, b)), value: a + ' kg' }, { label: 'Ngô', units: units(b, Math.max(a, b)), value: b + ' kg' }], total: '?' }), num(a + b, 'kg'), 'Tìm cả hai thì cộng.', `${a} + ${b} = ${a + b} (kg).`);
          }
          const [a, b] = pairWhere(rng, [20, 60], [5, 30], (x, y) => x > y && noBorrow(x, y), [35, 12]);
          return Q(`Thùng có ${a} kg đường, người ta đã bán ${b} kg. Trong thùng còn lại bao nhiêu ki-lô-gam đường?`, null, num(a - b, 'kg'), 'Bớt đi thì trừ.', `${a} ${M} ${b} = ${a - b} (kg).`);
        }),

      lesson(3, 16, 'Lít',
        'Rô-bốt ISA giúp bạn Phúc rót nước chanh mời cả lớp trong buổi liên hoan.',
        [
          { text: 'Lít là đơn vị đo dung tích (sức chứa), viết tắt là l. Bình này đang chứa 3 l nước.', visual: vz('jug', { capacity: 5, amount: 3, unit: 'l' }) },
          { text: 'Rót 2 l rồi rót thêm 3 l: có tất cả 2 l + 3 l = 5 l.', visual: vz('jug', { capacity: 5, amount: 5, unit: 'l' }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) {
            const cap = P(rng, [5, 10]), a = R(rng, 1, cap);
            return Q('Trong bình có mấy lít nước?', vz('jug', { capacity: cap, amount: a, unit: 'l' }), num(a, 'l'), 'Nhìn mực nước ứng với vạch số mấy.', `Bình có ${a} l nước.`);
          }
          if (f === 1) {
            const [a, b] = pairWhere(rng, [1, 40], [1, 30], (x, y) => noCarry(x, y), [5, 3]);
            return Q(`${a} l + ${b} l = ?`, null, num(a + b, 'l'), 'Cộng các số rồi viết thêm "l".', `${a} l + ${b} l = ${a + b} l.`);
          }
          if (f === 2) {
            const a = R(rng, 1, 9); let b = R(rng, 1, 9); if (a === b) b = a === 1 ? 2 : a - 1;
            return Q(`Can xanh đựng ${a} l nước, can đỏ đựng ${b} l nước. Can nào đựng nhiều nước hơn?`, null, ch(rng, a > b ? 'Can xanh' : 'Can đỏ', [a > b ? 'Can đỏ' : 'Can xanh', 'Bằng nhau']), 'So sánh hai số đo.', `${Math.max(a, b)} l > ${Math.min(a, b)} l.`);
          }
          const [a, b] = pairWhere(rng, [10, 40], [2, 20], (x, y) => x > y && noBorrow(x, y), [18, 5]);
          return Q(`Thùng có ${a} l nước mắm, mẹ đã rót ra ${b} l. Thùng còn lại bao nhiêu lít nước mắm?`, null, num(a - b, 'l'), 'Bớt đi thì trừ.', `${a} ${M} ${b} = ${a - b} (l).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. PHÉP CỘNG, PHÉP TRỪ (CÓ NHỚ) TRONG PHẠM VI 100 ============
  const c4 = {
    id: 'g2-c4', semester: 1, title: 'Phép cộng, phép trừ (có nhớ) trong phạm vi 100', icon: '🧮', lessons: [
      lesson(4, 19, 'Phép cộng (có nhớ) số có hai chữ số với số có một chữ số',
        'Rô-bốt ISA cùng bạn Minh đếm cây giống trồng quanh sân trường.',
        [
          { text: '36 + 8: 6 cộng 8 bằng 14, viết 4 nhớ 1; 3 thêm 1 bằng 4, viết 4. Vậy 36 + 8 = 44.', visual: vz('columnCalc', { a: 36, b: 8, op: '+', reveal: 'all' }) },
          { text: '10 khối đơn vị gộp thành 1 thanh chục mới — đó là "nhớ 1".', visual: vz('blocks', { hundreds: 0, tens: 3, ones: 14 }) },
        ],
        colGen('+', (r, L) => pairWhere(r, L === 0 ? [11, 49] : [20, 89], [2, 9], (a, b) => (a % 10) + b >= 10 && a + b <= 99, [36, 8]), { carry: true })),
      lesson(4, 20, 'Phép cộng (có nhớ) số có hai chữ số với số có hai chữ số',
        'Rô-bốt ISA giúp bạn Trang cộng số sách hai lớp quyên góp cho thư viện.',
        [
          { text: '47 + 25: 7 cộng 5 bằng 12, viết 2 nhớ 1; 4 cộng 2 bằng 6, thêm 1 bằng 7, viết 7. Vậy 47 + 25 = 72.', visual: vz('columnCalc', { a: 47, b: 25, op: '+', reveal: 'all' }) },
          { text: 'Gộp các khối: 4 chục + 2 chục + 1 chục nhớ = 7 chục.', visual: vz('blocks', { hundreds: 0, tens: 6, ones: 12 }) },
        ],
        colGen('+', (r, L) => pairWhere(r, [11, 79], L === 0 ? [11, 29] : [11, 69], (a, b) => (a % 10) + (b % 10) >= 10 && a + b <= 100, [47, 25]), { carry: true })),
      lesson(4, 22, 'Phép trừ (có nhớ) số có hai chữ số cho số có một chữ số',
        'Rô-bốt ISA cùng bạn Dũng bán bánh ở hội chợ Xuân của trường.',
        [
          { text: '32 − 5: 2 không trừ được 5, lấy 12 trừ 5 bằng 7, viết 7 nhớ 1; 3 trừ 1 bằng 2, viết 2. Vậy 32 − 5 = 27.', visual: vz('columnCalc', { a: 32, b: 5, op: M, reveal: 'all' }) },
          { text: 'Đổi 1 thanh chục thành 10 khối đơn vị để có đủ khối mà bớt.', visual: vz('blocks', { hundreds: 0, tens: 2, ones: 12 }) },
        ],
        colGen(M, (r, L) => pairWhere(r, L === 0 ? [11, 40] : [20, 99], [2, 9], (a, b) => (a % 10) < b, [32, 5]), { carry: true })),
      lesson(4, 23, 'Phép trừ (có nhớ) số có hai chữ số cho số có hai chữ số',
        'Rô-bốt ISA giúp bạn Việt tính số học sinh còn lại trên sân sau giờ chào cờ.',
        [
          { text: '62 − 28: 2 không trừ được 8, lấy 12 trừ 8 bằng 4, viết 4 nhớ 1; 2 thêm 1 bằng 3, 6 trừ 3 bằng 3, viết 3. Vậy 62 − 28 = 34.', visual: vz('columnCalc', { a: 62, b: 28, op: M, reveal: 'all' }) },
          { text: 'Thử lại bằng phép cộng: 34 + 28 = 62. Đúng!', visual: vz('columnCalc', { a: 34, b: 28, op: '+', reveal: 'all' }) },
        ],
        colGen(M, (r, L) => pairWhere(r, L === 0 ? [21, 60] : [30, 99], [11, 89], (a, b) => a > b && (a % 10) < (b % 10), [62, 28]), { carry: true })),
    ],
  };

  // ============ CHỦ ĐỀ 5. LÀM QUEN VỚI HÌNH PHẲNG ============
  const QUADS = ['quad', 'rect', 'square', 'trapezoid'];
  const c5 = {
    id: 'g2-c5', semester: 1, title: 'Làm quen với hình phẳng', icon: '📐', lessons: [
      lesson(5, 25, 'Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng',
        'Rô-bốt ISA dùng thước kẻ đo những sợi ruy băng để trang trí lớp học cùng bạn Chi.',
        [
          { text: 'Đặt đầu sợi ruy băng trùng vạch 0 của thước. Đầu kia ở vạch 7: ruy băng dài 7 cm.', visual: vz('ruler', { length: 7, unit: 'cm', object: 'ribbon' }) },
          { text: 'Hình tam giác có 3 cạnh là 3 đoạn thẳng; hình tứ giác có 4 cạnh.', visual: vz('shapeSet', { items: ['triangle', 'quad'] }) },
          { text: 'Ba điểm cùng nằm trên một đường thẳng gọi là ba điểm thẳng hàng.' },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) {
            const L = R(rng, 3, 15), obj = P(rng, ['ribbon', 'pencil']);
            return Q(`${obj === 'pencil' ? 'Chiếc bút chì' : 'Sợi ruy băng'} dài mấy xăng-ti-mét?`, vz('ruler', { length: L, unit: 'cm', object: obj }), num(L, 'cm'), 'Đọc số ở vạch thước trùng với đầu bên phải.', `Dài ${L} cm.`);
          }
          if (f === 1) {
            const k = P(rng, ['triangle', 'quad', 'rect', 'square']);
            const n = k === 'triangle' ? 3 : 4;
            const nameK = { triangle: 'hình tam giác', quad: 'hình tứ giác', rect: 'hình chữ nhật', square: 'hình vuông' }[k];
            return Q(`Hình này (${nameK}) có mấy cạnh?`, vz('shape', { kind: k }), ch(rng, n, [2, 3, 4, 5].filter(x => x !== n)), 'Đếm các đoạn thẳng tạo thành hình.', `${nameK[0].toUpperCase() + nameK.slice(1)} có ${n} cạnh.`);
          }
          if (f === 2) {
            const a = R(rng, 2, 9), b = R(rng, 2, 9);
            const [p1, p2, p3] = P(rng, [['A', 'B', 'C'], ['M', 'N', 'P'], ['D', 'E', 'G']]);
            return Q(`Đoạn thẳng ${p1}${p2} dài ${a} cm, đoạn thẳng ${p2}${p3} dài ${b} cm. Tổng độ dài hai đoạn thẳng là bao nhiêu xăng-ti-mét?`, vz('ruler', { length: a + b, unit: 'cm', object: 'ribbon' }), num(a + b, 'cm'), 'Cộng hai độ dài.', `${a} + ${b} = ${a + b} (cm).`);
          }
          const qs = [
            ['Ba điểm cùng nằm trên một đường thẳng gọi là ba điểm …', 'thẳng hàng', ['thẳng đứng', 'cong', 'tròn']],
            ['Qua hai điểm A và B vẽ được mấy đường thẳng?', '1', ['2', '3', '0']],
            ['Đường viền của chiếc đĩa tròn là đường gì?', 'Đường cong', ['Đường thẳng', 'Đoạn thẳng', 'Đường gấp khúc']],
            ['Mép thước kẻ cho ta hình ảnh của …', 'đoạn thẳng', ['đường cong', 'hình tròn', 'điểm']],
          ];
          const [p, c, d] = P(rng, qs);
          return Q(p, null, ch(rng, c, d), 'Nhớ lại các hình đã học: điểm, đoạn thẳng, đường thẳng, đường cong.', `Đáp án: ${c}.`);
        }),

      lesson(5, 26, 'Đường gấp khúc. Hình tứ giác',
        'Rô-bốt ISA đi theo con đường gấp khúc trong công viên để tìm bạn Hà.',
        [
          { text: 'Đường gấp khúc gồm nhiều đoạn thẳng nối tiếp nhau. Độ dài đường gấp khúc là tổng độ dài các đoạn: 3 + 4 + 2 = 9 (cm).', visual: vz('shape', { kind: 'polyline', dims: { segments: [3, 4, 2] }, showDims: true }) },
          { text: 'Hình tứ giác có 4 cạnh và 4 đỉnh. Hình chữ nhật, hình vuông cũng là hình tứ giác.', visual: vz('shapeSet', { items: ['quad', 'rect', 'square', 'trapezoid'] }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) {
            const n = lv(i) === 0 ? 2 : R(rng, 3, 4);
            const segs = Array.from({ length: n }, () => R(rng, 2, 9));
            const s = segs.reduce((x, y) => x + y, 0);
            return Q(`Tính độ dài đường gấp khúc.`, vz('shape', { kind: 'polyline', dims: { segments: segs }, showDims: true }), num(s, 'cm'), 'Cộng độ dài tất cả các đoạn thẳng.', `${segs.join(' + ')} = ${s} (cm).`);
          }
          if (f === 1) {
            const items = U.shuffle(rng, [P(rng, QUADS), P(rng, QUADS), 'triangle', 'circle', P(rng, ['triangle', 'circle', 'quad'])]);
            const want = items.map((k, j) => (QUADS.includes(k) ? j : -1)).filter(j => j >= 0);
            return Q('Chạm chọn tất cả các hình tứ giác.', vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) }, 'Hình tứ giác có đúng 4 cạnh.', `Có ${want.length} hình tứ giác.`);
          }
          if (f === 2) {
            const n = R(rng, 2, 5);
            const segs = Array.from({ length: n }, () => R(rng, 2, 6));
            return Q('Đường gấp khúc này gồm mấy đoạn thẳng?', vz('shape', { kind: 'polyline', dims: { segments: segs }, showDims: false }), num(n), 'Đếm từng đoạn thẳng nối tiếp nhau.', `Đường gấp khúc gồm ${n} đoạn thẳng.`);
          }
          const seg = R(rng, 2, 9), n = R(rng, 3, 4);
          return Q(`Một đường gấp khúc gồm ${n} đoạn thẳng, mỗi đoạn dài ${seg} cm. Độ dài đường gấp khúc là bao nhiêu?`, vz('shape', { kind: 'polyline', dims: { segments: Array(n).fill(seg) }, showDims: true }), num(seg * n, 'cm'), 'Cộng các độ dài bằng nhau.', `${Array(n).fill(seg).join(' + ')} = ${seg * n} (cm).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. NGÀY – GIỜ, GIỜ – PHÚT, NGÀY – THÁNG ============
  const WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  const timeStr = (h, m) => (m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`);
  const c6 = {
    id: 'g2-c6', semester: 1, title: 'Ngày – giờ, giờ – phút, ngày – tháng', icon: '🕐', lessons: [
      lesson(6, 29, 'Ngày – giờ, giờ – phút',
        'Rô-bốt ISA nhắc bạn Nam xem đồng hồ để đi học đúng giờ.',
        [
          { text: 'Một ngày có 24 giờ. Một giờ có 60 phút.', visual: vz('clock', { h: 7, m: 0 }) },
          { text: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 3 là 15 phút, chỉ số 6 là 30 phút (giờ rưỡi).', visual: vz('clock', { h: 8, m: 30 }) },
          { text: '15 giờ còn gọi là 3 giờ chiều; 20 giờ còn gọi là 8 giờ tối.', visual: vz('clock', { h: 15, m: 0, digital: true }) },
        ],
        function (rng, i) {
          const f = i % 5;
          const h = R(rng, 1, 12), m = lv(i) === 0 ? P(rng, [0, 30]) : P(rng, [0, 15, 30]);
          if (f === 0) return Q('Đồng hồ chỉ mấy giờ?', vz('clock', { h, m }), ch(rng, timeStr(h, m), [timeStr(h % 12 + 1, m), timeStr(h, (m + 30) % 60), timeStr(h, m === 15 ? 0 : 15), timeStr(h === 1 ? 12 : h - 1, m)]), 'Nhìn kim ngắn trước để biết giờ, rồi nhìn kim dài để biết phút.', `Đồng hồ chỉ ${timeStr(h, m)}.`);
          if (f === 1) return Q(`Em hãy quay kim đồng hồ để chỉ ${timeStr(h, m)}.`, vz('clock', { h: 12, m: 0 }), { kind: 'visual', check: v => v && ((v.h % 12) + 12) % 12 === h % 12 && v.m === m }, m === 0 ? 'Kim dài chỉ số 12, kim ngắn chỉ số giờ.' : `Kim dài chỉ số ${m / 5}.`, `${timeStr(h, m)}: kim ngắn ${m === 0 ? 'chỉ đúng số ' + h : m === 30 ? 'ở giữa số ' + h + ' và số ' + (h % 12 + 1) : 'qua số ' + h + ' một chút'}, kim dài ở số ${m === 0 ? 12 : m / 5}.`);
          if (f === 2) {
            const hh = R(rng, 13, 23);
            const part = hh < 18 ? 'chiều' : 'tối';
            return Q(`${hh} giờ còn gọi là mấy giờ ${part}?`, vz('clock', { h: hh, m: 0, digital: true }), num(hh - 12), `Lấy ${hh} ${M} 12.`, `${hh} giờ hay ${hh - 12} giờ ${part}.`);
          }
          if (f === 3) {
            const qq = P(rng, [['1 ngày = ? giờ', 24], ['1 giờ = ? phút', 60]]);
            return Q(qq[0], vz('clock', { h: 12, m: 0 }), num(qq[1]), 'Nhớ: một ngày có 24 giờ, một giờ có 60 phút.', `${qq[0].replace('?', qq[1])}.`);
          }
          const s = R(rng, 7, 9), d = R(rng, 1, 3), who = nm(rng);
          return Q(`${who} bắt đầu làm bài lúc ${s} giờ và làm xong lúc ${s + d} giờ. ${who} làm bài trong mấy giờ?`, vz('clock', { h: s + d, m: 0 }), num(d, 'giờ'), 'Đếm từ giờ bắt đầu đến giờ kết thúc.', `${s + d} ${M} ${s} = ${d} (giờ).`);
        }),

      lesson(6, 30, 'Ngày – tháng',
        'Rô-bốt ISA cùng bạn Lan xem tờ lịch để đánh dấu ngày Nhà giáo Việt Nam.',
        [
          { text: 'Tờ lịch tháng 11 năm 2026: tháng 11 có 30 ngày. Ngày 20 tháng 11 là Ngày Nhà giáo Việt Nam.', visual: vz('calendar', { year: 2026, month: 11, highlight: [20] }) },
          { text: 'Hai ngày cùng cột trên tờ lịch cách nhau 7 ngày (1 tuần).', visual: vz('calendar', { year: 2026, month: 11, highlight: [6, 13] }) },
        ],
        function (rng, i) {
          const y = P(rng, [2026, 2027]), mo = R(rng, 1, 12), dim = daysIn(y, mo);
          const f = i % 4;
          if (f === 0) return Q(`Tháng ${mo} năm ${y} có bao nhiêu ngày?`, vz('calendar', { year: y, month: mo }), num(dim, 'ngày'), 'Nhìn ngày cuối cùng trên tờ lịch.', `Tháng ${mo} có ${dim} ngày.`);
          if (f === 1) {
            const d = R(rng, 1, dim), wd = new Date(y, mo - 1, d).getDay();
            return Q(`Ngày ${d} tháng ${mo} năm ${y} là thứ mấy?`, vz('calendar', { year: y, month: mo, highlight: [d] }), ch(rng, WD[wd], [WD[(wd + 1) % 7], WD[(wd + 6) % 7], WD[(wd + 2) % 7]]), 'Tìm ngày được tô màu rồi nhìn lên đầu cột.', `Ngày ${d} tháng ${mo} là ${WD[wd].toLowerCase()}.`);
          }
          if (f === 2) {
            const want = R(rng, 1, 6);
            let d = 1; while (new Date(y, mo - 1, d).getDay() !== want) d++;
            return Q(`Ngày ${WD[want]} đầu tiên của tháng ${mo} năm ${y} là ngày nào?`, vz('calendar', { year: y, month: mo }), num(d), `Tìm cột ${WD[want]} trên tờ lịch.`, `Đó là ngày ${d} tháng ${mo}.`);
          }
          const d = R(rng, 1, dim - 7), wd = new Date(y, mo - 1, d).getDay();
          return Q(`Hôm nay là ${WD[wd].toLowerCase()} ngày ${d} tháng ${mo}. ${WD[wd]} tuần sau là ngày nào?`, vz('calendar', { year: y, month: mo, highlight: [d] }), num(d + 7), 'Một tuần có 7 ngày.', `${d} + 7 = ${d + 7}. Đó là ngày ${d + 7} tháng ${mo}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. PHÉP NHÂN, PHÉP CHIA ============
  const MUL2 = [
    { per: 'Mỗi con gà có 2 chân.', who: 'con gà', what: 'cái chân', e: '🐔' },
    { per: 'Mỗi đôi đũa có 2 chiếc.', who: 'đôi đũa', what: 'chiếc đũa', e: '🥢' },
    { per: 'Mỗi bạn có 2 bàn tay.', who: 'bạn', what: 'bàn tay', e: '🙌' },
  ];
  const MUL5 = [
    { per: 'Mỗi bàn tay có 5 ngón tay.', who: 'bàn tay', what: 'ngón tay', e: '🖐️' },
    { per: 'Mỗi bông hoa có 5 cánh.', who: 'bông hoa', what: 'cánh hoa', e: '🌸' },
    { per: 'Mỗi hộp có 5 cái bánh.', who: 'hộp', what: 'cái bánh', e: '🧁' },
  ];
  const DIV2 = [
    { q: (p, n) => `Có ${p} cái kẹo chia đều cho ${n} bạn. Mỗi bạn được mấy cái kẹo?`, e: '🍬', unit: 'cái kẹo', plate: 'bạn' },
    { q: (p, n) => `Có ${p} chiếc đũa, mỗi đôi có ${n} chiếc. Có mấy đôi đũa?`, e: '🥢', unit: 'đôi đũa' },
  ];
  const DIV5 = [
    { q: (p, n) => `Có ${p} quả cam xếp đều vào ${n} đĩa. Mỗi đĩa có mấy quả cam?`, e: '🍊', unit: 'quả cam', plate: 'đĩa' },
    { q: (p, n) => `Có ${p} bạn chia đều thành ${n} tổ. Mỗi tổ có mấy bạn?`, e: '🧒', unit: 'bạn', plate: 'tổ' },
  ];
  const c8 = {
    id: 'g2-c8', semester: 2, title: 'Phép nhân, phép chia', icon: '✖️', lessons: [
      lesson(8, 37, 'Phép nhân',
        'Rô-bốt ISA xếp bánh vào các đĩa bằng nhau cho bữa tiệc của bạn Bình.',
        [
          { text: 'Mỗi đĩa có 2 quả, có 3 đĩa: 2 + 2 + 2 = 6. Ta viết 2 × 3 = 6, đọc là "hai nhân ba bằng sáu".', visual: vz('objects', { groups: [{ emoji: '🍎', count: 2 }, { emoji: '🍎', count: 2 }, { emoji: '🍎', count: 2 }] }) },
          { text: '2 được lấy 3 lần thì viết 2 × 3. Mỗi hàng 4 bông hoa, có 3 hàng: 4 × 3 = 12.', visual: vz('array', { rows: 3, cols: 4, emoji: '🌸' }) },
        ],
        function (rng, i) {
          const a = R(rng, 2, 5), b = R(rng, 2, lv(i) === 0 ? 4 : 5), p = a * b, it = P(rng, ITEMS.slice(0, 8)), f = i % 5;
          const groups = Array.from({ length: b }, () => ({ emoji: it.e, count: a }));
          const sumS = Array(b).fill(a).join(' + ');
          if (f === 0) return Q(`Mỗi nhóm có ${a} ${it.n}, có ${b} nhóm. Phép nhân nào đúng?`, vz('objects', { groups }), ch(rng, `${a} × ${b}`, [`${a} + ${b}`, `${a} × ${b + 1}`, `${a + 1} × ${b}`]), `${a} được lấy ${b} lần.`, `${sumS} = ${a} × ${b}.`);
          if (f === 1) return Q(`Số thích hợp ở ô ?:\n${sumS} = ${a} × ?`, vz('objects', { groups }), num(b), `Số ${a} được lấy mấy lần?`, `${a} được lấy ${b} lần nên ${sumS} = ${a} × ${b}.`);
          if (f === 2) return Q(`Chuyển tổng thành phép nhân rồi tính:\n${sumS} = ?`, null, num(p), `${sumS} = ${a} × ${b}.`, `${a} × ${b} = ${sumS} = ${p}.`);
          if (f === 3) return Q(`Có tất cả bao nhiêu ${it.n}?`, vz('array', { rows: b, cols: a, emoji: it.e }), num(p), `Mỗi hàng ${a}, có ${b} hàng: ${a} × ${b}.`, `${a} × ${b} = ${p}.`);
          return Q(`Phép nhân ${a} × ${b} ứng với tổng nào?`, null, ch(rng, sumS, [`${a} + ${b}`, Array(b + 1).fill(a).join(' + '), Array(Math.max(2, b - 1)).fill(a).join(' + ')]), `${a} × ${b} là ${a} được lấy ${b} lần.`, `${a} × ${b} = ${sumS}.`);
        }),

      lesson(8, 38, 'Thừa số, tích',
        'Rô-bốt ISA giới thiệu với bạn Mai tên gọi các số trong phép nhân.',
        [
          { text: 'Trong 5 × 3 = 15: 5 và 3 là thừa số, 15 là tích. 5 × 3 cũng gọi là tích.', visual: vz('array', { rows: 3, cols: 5, emoji: '⭐' }) },
          { text: 'Thừa số là 2 và 4 thì tích là 2 × 4 = 2 + 2 + 2 + 2 = 8.', visual: vz('objects', { groups: [{ emoji: '🍬', count: 2 }, { emoji: '🍬', count: 2 }, { emoji: '🍬', count: 2 }, { emoji: '🍬', count: 2 }] }) },
        ],
        function (rng, i) {
          const a = P(rng, [2, 5, 2, 5, 3, 4]), b = R(rng, 2, lv(i) === 0 ? 5 : 9), p = a * b, f = i % 4;
          if (f === 0) return Q(`Trong phép nhân ${a} × ${b} = ${p}, số ${p} gọi là gì?`, null, ch(rng, 'Tích', ['Thừa số', 'Tổng', 'Hiệu']), 'Kết quả của phép nhân gọi là tích.', `${p} là tích.`);
          if (f === 1) return Q(`Các thừa số là ${a} và ${b}. Tích là bao nhiêu?`, vz('array', { rows: b, cols: a }), num(p), `${a} được lấy ${b} lần.`, `${a} × ${b} = ${p}.`);
          if (f === 2) return Q(`Các thừa số của phép nhân ${a} × ${b} = ${p} là:`, null, ch(rng, `${a} và ${b}`, [`${a} và ${p}`, `${b} và ${p}`, `${p}`]), 'Các số đứng hai bên dấu × là thừa số.', `Thừa số là ${a} và ${b}.`);
          return Q(`Viết phép nhân, biết thừa số thứ nhất là ${a}, thừa số thứ hai là ${b}. Tích bằng bao nhiêu?`, vz('objects', { groups: Array.from({ length: b }, () => ({ emoji: '🔵', count: a })) }), num(p), `Cộng ${b} lần số ${a}.`, `${a} × ${b} = ${p}.`);
        }),

      lesson(8, 39, 'Bảng nhân 2',
        'Rô-bốt ISA đếm chân những chú gà trong vườn nhà bà bạn Quân.',
        [
          { text: '2 × 1 = 2, 2 × 2 = 4, 2 × 3 = 6, … Mỗi lần thêm một nhóm thì tích thêm 2.', visual: vz('numberLine', { min: 0, max: 20, step: 2, labelEvery: 1, hops: [{ from: 0, to: 2, label: '+2' }, { from: 2, to: 4, label: '+2' }, { from: 4, to: 6, label: '+2' }] }) },
          { text: 'Mỗi đôi dép có 2 chiếc. 4 đôi dép có 2 × 4 = 8 chiếc.', visual: vz('array', { rows: 4, cols: 2, emoji: '🩴' }) },
        ],
        mulTableGen(2, MUL2)),
      lesson(8, 40, 'Bảng nhân 5',
        'Rô-bốt ISA cùng bạn Ngọc đếm cánh những bông hoa mai ngày Tết.',
        [
          { text: '5 × 1 = 5, 5 × 2 = 10, 5 × 3 = 15, … Đếm thêm 5.', visual: vz('numberLine', { min: 0, max: 50, step: 5, labelEvery: 1, hops: [{ from: 0, to: 5, label: '+5' }, { from: 5, to: 10, label: '+5' }, { from: 10, to: 15, label: '+5' }] }) },
          { text: 'Mỗi bàn tay có 5 ngón. 3 bàn tay có 5 × 3 = 15 ngón.', visual: vz('array', { rows: 3, cols: 5, emoji: '🌼' }) },
        ],
        mulTableGen(5, MUL5)),

      lesson(8, 41, 'Phép chia',
        'Rô-bốt ISA chia đều kẹo vào các đĩa cho các bạn nhỏ trong ngày 1 tháng 6.',
        [
          { text: 'Chia đều 6 cái kẹo vào 2 đĩa, mỗi đĩa được 3 cái: 6 : 2 = 3, đọc là "sáu chia hai bằng ba".', visual: vz('share', { total: 6, groups: 2, emoji: '🍬' }) },
          { text: 'Từ phép nhân 3 × 2 = 6 ta có hai phép chia: 6 : 2 = 3 và 6 : 3 = 2.', visual: vz('array', { rows: 2, cols: 3, emoji: '🍬' }) },
        ],
        function (rng, i) {
          const g = R(rng, 2, 5), q = R(rng, 2, lv(i) === 0 ? 4 : 5), t = g * q, f = i % 4, it = P(rng, [{ n: 'cái kẹo', e: '🍬' }, { n: 'quả cam', e: '🍊' }, { n: 'cái bánh', e: '🍪' }]);
          if (f === 0) return Q(`Chia đều ${t} ${it.n} vào ${g} đĩa. Mỗi đĩa có mấy ${it.n}?`, vz('share', { total: t, groups: g, emoji: it.e }), num(q), `Chia lần lượt mỗi đĩa một ${it.n} cho đến hết.`, `${t} : ${g} = ${q}.`);
          if (f === 1) return Q(`Có ${t} ${it.n}, xếp mỗi đĩa ${q} ${it.n}. Xếp được mấy đĩa?`, vz('objects', { groups: Array.from({ length: g }, () => ({ emoji: it.e, count: q })) }), num(g), `Mỗi nhóm ${q}, đếm xem có mấy nhóm.`, `${t} : ${q} = ${g} (đĩa).`);
          if (f === 2) return Q(`Biết ${g} × ${q} = ${t}. Vậy ${t} : ${g} = ?`, vz('array', { rows: g, cols: q }), num(q), 'Lấy tích chia cho thừa số này thì được thừa số kia.', `${t} : ${g} = ${q}.`);
          return Q(`${t} : ${g} = ?`, vz('share', { total: t, groups: g, emoji: it.e }), ch(rng, q, [q + 1, q - 1, t - g, g].filter(x => x > 0)), `Chia đều ${t} thành ${g} phần.`, `${t} : ${g} = ${q}.`);
        }),

      lesson(8, 42, 'Số bị chia, số chia, thương',
        'Rô-bốt ISA giúp bạn Hùng gọi tên các số trong phép chia.',
        [
          { text: 'Trong 10 : 2 = 5: 10 là số bị chia, 2 là số chia, 5 là thương. 10 : 2 cũng gọi là thương.', visual: vz('share', { total: 10, groups: 2, emoji: '🍊' }) },
        ],
        function (rng, i) {
          const n = P(rng, [2, 5]), k = R(rng, 2, lv(i) === 0 ? 5 : 9), p = n * k, f = i % 4;
          const names = ['Số bị chia', 'Số chia', 'Thương'];
          if (f === 0) { const j = R(rng, 0, 2), v = [p, n, k][j]; return Q(`Trong phép chia ${p} : ${n} = ${k}, số ${v} gọi là gì?`, null, ch(rng, names[j], names.concat(['Tích']).filter(x => x !== names[j])), 'Số bị chia : số chia = thương.', `${v} là ${names[j].toLowerCase()}.`); }
          if (f === 1) return Q(`Số bị chia là ${p}, số chia là ${n}. Thương là bao nhiêu?`, vz('share', { total: p, groups: n }), num(k), `Tính ${p} : ${n}.`, `${p} : ${n} = ${k}.`);
          if (f === 2) return Q(`Thương của ${p} và ${n} là:`, null, ch(rng, k, [p - n, k + 1, n].filter(x => x > 0 && x !== k)), `Thương là kết quả phép chia ${p} : ${n}.`, `${p} : ${n} = ${k}.`);
          return Q(`Từ phép nhân ${n} × ${k} = ${p}, em viết phép chia có số chia là ${n}. Thương bằng bao nhiêu?`, vz('array', { rows: n, cols: k }), num(k), `${p} : ${n} = ?`, `${p} : ${n} = ${k}.`);
        }),

      lesson(8, 43, 'Bảng chia 2',
        'Rô-bốt ISA chia đôi những chiếc bánh cho bạn Vy và em của bạn ấy.',
        [
          { text: 'Dựa vào bảng nhân 2: 2 × 4 = 8 nên 8 : 2 = 4.', visual: vz('share', { total: 8, groups: 2, emoji: '🍪' }) },
          { text: '2 : 2 = 1, 4 : 2 = 2, 6 : 2 = 3, … 20 : 2 = 10.' },
        ],
        divTableGen(2, DIV2)),
      lesson(8, 44, 'Bảng chia 5',
        'Rô-bốt ISA cùng bạn Tú xếp cam vào 5 đĩa để bày mâm ngũ quả.',
        [
          { text: 'Dựa vào bảng nhân 5: 5 × 3 = 15 nên 15 : 5 = 3.', visual: vz('share', { total: 15, groups: 5, emoji: '🍊' }) },
          { text: '5 : 5 = 1, 10 : 5 = 2, 15 : 5 = 3, … 50 : 5 = 10.' },
        ],
        divTableGen(5, DIV5)),
    ],
  };

  // ============ CHỦ ĐỀ 9. LÀM QUEN VỚI HÌNH KHỐI ============
  const SOLIDS = { cylinder: 'Khối trụ', sphere: 'Khối cầu', cube: 'Khối lập phương', box: 'Khối hộp chữ nhật' };
  const REAL = [
    { e: '⚽', k: 'sphere', n: 'Quả bóng' }, { e: '🍊', k: 'sphere', n: 'Quả cam' }, { e: '🌍', k: 'sphere', n: 'Quả địa cầu' },
    { e: '🥫', k: 'cylinder', n: 'Lon nước' }, { e: '🥁', k: 'cylinder', n: 'Cái trống' }, { e: '🕯️', k: 'cylinder', n: 'Cây nến' },
    { e: '🎲', k: 'cube', n: 'Con xúc xắc' }, { e: '🎁', k: 'box', n: 'Hộp quà' }, { e: '📦', k: 'box', n: 'Thùng giấy' },
  ];
  const c9 = {
    id: 'g2-c9', semester: 2, title: 'Làm quen với hình khối', icon: '🧊', lessons: [
      lesson(9, 46, 'Khối trụ, khối cầu',
        'Rô-bốt ISA cùng bạn An tìm các đồ vật có dạng khối trụ, khối cầu trong nhà.',
        [
          { text: 'Đây là khối trụ. Lon nước, cái trống có dạng khối trụ.', visual: vz('solid', { kind: 'cylinder' }) },
          { text: 'Đây là khối cầu. Quả bóng, quả cam có dạng khối cầu.', visual: vz('solid', { kind: 'sphere' }) },
        ],
        function (rng, i) {
          const f = i % 3;
          if (f === 0) {
            const k = P(rng, lv(i) === 0 ? ['cylinder', 'sphere'] : ['cylinder', 'sphere', 'cube', 'box']);
            return Q('Đây là khối gì?', vz('solid', { kind: k }), ch(rng, SOLIDS[k], Object.values(SOLIDS)), 'Khối cầu tròn đều mọi phía; khối trụ có hai mặt đáy hình tròn.', `Đây là ${SOLIDS[k].toLowerCase()}.`);
          }
          if (f === 1) {
            const o = P(rng, REAL);
            return Q(`${o.n} có dạng khối gì?`, vz('objects', { groups: [{ emoji: o.e, count: 1 }] }), ch(rng, SOLIDS[o.k], Object.values(SOLIDS)), 'Hình dung đồ vật lăn được hay đứng vững trên mặt đáy tròn.', `${o.n} có dạng ${SOLIDS[o.k].toLowerCase()}.`);
          }
          const a = R(rng, 1, 5), b = R(rng, 1, 5), c = R(rng, 1, 4), ask = R(rng, 0, 1);
          return Q(`Có bao nhiêu đồ vật có dạng ${ask ? 'khối cầu' : 'khối trụ'}?`, vz('objects', { groups: [{ emoji: '⚽', count: a }, { emoji: '🥫', count: b }, { emoji: '🎁', count: c }] }), num(ask ? a : b), ask ? 'Quả bóng có dạng khối cầu.' : 'Lon nước có dạng khối trụ.', `Có ${ask ? a : b} đồ vật.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 10. CÁC SỐ TRONG PHẠM VI 1000 ============
  const PV3 = ['Trăm', 'Chục', 'Đơn vị'];
  const c10 = {
    id: 'g2-c10', semester: 2, title: 'Các số trong phạm vi 1000', icon: '💯', lessons: [
      lesson(10, 48, 'Đơn vị, chục, trăm, nghìn',
        'Rô-bốt ISA cùng bạn Minh xếp những tấm trăm khối thành một khối nghìn thật to.',
        [
          { text: '10 đơn vị = 1 chục; 10 chục = 1 trăm; 10 trăm = 1 nghìn.', visual: vz('blocks', { thousands: 1, hundreds: 0, tens: 0, ones: 0 }) },
          { text: '3 tấm trăm là 300, đọc là "ba trăm".', visual: vz('blocks', { hundreds: 3, tens: 0, ones: 0 }) },
        ],
        more(function (rng, i) {
          const f = i % 4;
          if (f === 0) { const h = R(rng, 1, 9); return Q('Hình dưới đây biểu diễn số nào?', vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(h * 100), 'Mỗi tấm là 1 trăm.', `${h} trăm là ${h * 100}.`); }
          if (f === 1) { const [p, v] = P(rng, [['10 trăm = ? ', 1000], ['1 trăm = ? chục', 10], ['1 chục = ? đơn vị', 10], ['1 nghìn = ? trăm', 10], ['10 chục = ?', 100]]); return Q(p.trim(), null, num(v), 'Cứ 10 đơn vị của hàng này gộp thành 1 đơn vị của hàng liền trên.', `${p.replace('?', v).trim()}.`); }
          if (f === 2) { const h = R(rng, 1, 9), t = R(rng, 1, 9); return Q('Hình dưới đây biểu diễn số nào?', vz('blocks', { hundreds: h, tens: t, ones: 0 }), num(h * 100 + t * 10), 'Đếm số tấm trăm, rồi đếm số thanh chục.', `${h} trăm và ${t} chục là ${h * 100 + t * 10}.`); }
          const h = R(rng, 1, 9);
          return Q(`${DIG[h][0].toUpperCase() + DIG[h].slice(1)} trăm viết là:`, null, ch(rng, h * 100, [h * 10, h * 1000, h]), 'Số tròn trăm có hai chữ số 0 ở cuối.', `${readVN(h * 100)} viết là ${h * 100}.`);
        }, [
          [0, 4, rng => { const h = R(rng, 1, 9); return Q(`Số ${h * 100} gồm mấy trăm?`, vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(h), 'Mỗi tấm là 1 trăm.', `${h * 100} gồm ${h} trăm.`); }],
          [0, 6, rng => { const s = R(rng, 1, 6), miss = R(rng, 1, 3), seq = [0, 1, 2, 3].map(j => (s + j) * 100); return Q(`Đếm thêm 100. Số thích hợp ở ô ? là:\n${seq.map((v, j) => (j === miss ? '?' : v)).join(', ')}`, null, num(seq[miss]), 'Mỗi lần đếm thêm 1 trăm.', `${seq.join(', ')}.`); }],
          [3, 9, rng => {
            const h = R(rng, 1, 9);
            const [st, ok, fix] = P(rng, [[`${h} trăm viết là ${h * 100}`, true, `${h} trăm viết là ${h * 100}`], [`${h} trăm viết là ${h * 10}`, false, `${h} trăm viết là ${h * 100}`], [`Số ${h * 100} gồm ${h} trăm`, true, `${h * 100} gồm ${h} trăm`], [`Số ${h * 100} gồm ${h} chục`, false, `${h * 100} gồm ${h} trăm`], ['10 trăm = 1 nghìn', true, '10 trăm = 1 nghìn'], ['10 chục = 1 nghìn', false, '10 chục = 1 trăm; 10 trăm = 1 nghìn'], ['1 nghìn viết là 1000', true, '1 nghìn viết là 1000'], ['1 trăm = 100 chục', false, '1 trăm = 10 chục']]);
            return Q(`Đúng hay sai?\n${st}.`, null, tf(rng, ok), '10 đơn vị = 1 chục; 10 chục = 1 trăm; 10 trăm = 1 nghìn.', `${ok ? 'Đúng' : 'Sai'}. ${fix}.`);
          }],
          [3, 9, rng => { const h = R(rng, 1, 9), k = P(rng, [h, h < 9 ? h + 1 : h - 1, h > 1 ? h - 1 : h + 1, R(rng, 1, 9)]); return Q(`So sánh: ${h} trăm … ${k * 100}`, vz('compare', { left: `${h} trăm`, right: k * 100 }), cmpAns(h, k), `${h} trăm là ${h * 100}.`, `${h} trăm = ${h * 100}; ${h * 100} ${sign(h, k)} ${k * 100}.`); }],
          [3, 9, rng => { const h = R(rng, 2, 9), x = nm(rng), it = P(rng, [['hộp', 'viên bi'], ['túi', 'cái kẹo'], ['bó', 'que tính'], ['thùng', 'quả cam']]); return Q(`Mỗi ${it[0]} có 100 ${it[1]}. ${x} có ${h} ${it[0]} như thế. Hỏi ${x} có tất cả bao nhiêu ${it[1]}?`, vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(h * 100), 'Đếm thêm 100: 100, 200, 300, …', `${h} trăm là ${h * 100}. ${x} có ${h * 100} ${it[1]}.`); }],
          [6, 9, rng => { const h = R(rng, 1, 9); return Q(`Có ${h} tấm trăm. Cần thêm mấy tấm trăm nữa để được 1 nghìn?`, vz('blocks', { hundreds: h, tens: 0, ones: 0 }), num(10 - h), '10 trăm = 1 nghìn.', `${h} + ${10 - h} = 10. Cần thêm ${10 - h} tấm trăm.`); }],
        ])),

      lesson(10, 49, 'Các số tròn trăm, tròn chục',
        'Rô-bốt ISA và bạn Lan đếm những bó que tính, mỗi bó một chục.',
        [
          { text: 'Các số tròn trăm: 100, 200, 300, …, 900 (có 2 chữ số 0 tận cùng).', visual: vz('numberLine', { min: 0, max: 1000, step: 100, labelEvery: 1 }) },
          { text: 'Các số tròn chục: 110, 120, 130, … (có chữ số 0 tận cùng). 230 gồm 2 trăm và 3 chục.', visual: vz('blocks', { hundreds: 2, tens: 3, ones: 0 }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) { const k = R(rng, 1, 9); return Q('Số thích hợp ở ô ? trên tia số là số nào?', vz('numberLine', { min: 0, max: 1000, step: 100, labelEvery: 1, unknown: k * 100 }), num(k * 100), 'Tia số đếm thêm 100.', `Số cần điền là ${k * 100}.`); }
          if (f === 1) { const h = R(rng, 1, 8), t = R(rng, 1, 9), n = h * 100 + t * 10; return Q('Số thích hợp ở ô ? trên tia số là số nào?', vz('numberLine', { min: h * 100, max: h * 100 + 100, step: 10, labelEvery: 1, unknown: n }), num(n), 'Tia số đếm thêm 10.', `Số cần điền là ${n}.`); }
          if (f === 2) { const k = R(rng, 1, 9) * 100; return Q('Số nào là số tròn trăm?', null, ch(rng, k, [k + 10, k + 50, k - 10 > 0 ? k - 10 : k + 30]), 'Số tròn trăm có hai chữ số tận cùng là 0.', `${k} là số tròn trăm.`); }
          if (f === 3) { const h = R(rng, 1, 9), t = R(rng, 0, 9); return Q('Hình dưới đây biểu diễn số tròn chục nào?', vz('blocks', { hundreds: h, tens: t, ones: 0 }), num(h * 100 + t * 10), 'Đếm tấm trăm và thanh chục.', `${h} trăm ${t} chục là ${h * 100 + t * 10}.`); }
          const n = R(rng, 10, 98) * 10, nx = R(rng, 0, 1);
          return Q(`Số tròn chục liền ${nx ? 'sau' : 'trước'} của ${n} là:`, null, ch(rng, nx ? n + 10 : n - 10, [nx ? n - 10 : n + 10, nx ? n + 1 : n - 1, nx ? n + 100 : n - 100].filter(x => x > 0)), `Tròn chục liền ${nx ? 'sau thì thêm' : 'trước thì bớt'} 10.`, `${n} ${nx ? '+' : M} 10 = ${nx ? n + 10 : n - 10}.`);
        }),

      lesson(10, 50, 'So sánh các số tròn trăm, tròn chục',
        'Rô-bốt ISA giúp bạn Phúc so xem cửa hàng nào có nhiều bóng bay hơn.',
        [
          { text: '300 < 500 vì 3 trăm ít hơn 5 trăm.', visual: vz('compare', { left: 300, right: 500 }) },
          { text: '240 > 210: cùng 2 trăm, so hàng chục: 4 chục > 1 chục.', visual: vz('compare', { left: 240, right: 210 }) },
        ],
        function (rng, i) {
          const f = i % 3;
          const rt = () => (lv(i) === 0 ? R(rng, 1, 10) * 100 : R(rng, 10, 99) * 10);
          if (f === 0) { const a = rt(); const b = R(rng, 0, 3) === 0 ? a : rt(); return Q(`So sánh: ${a} … ${b}`, vz('compare', { left: a, right: b }), cmpAns(a, b), 'So sánh hàng trăm trước, rồi đến hàng chục.', `${a} ${sign(a, b)} ${b}.`); }
          const arr = []; while (arr.length < 4) { const x = rt(); if (!arr.includes(x)) arr.push(x); }
          if (f === 1) { const big = R(rng, 0, 1); const ans = big ? Math.max(...arr) : Math.min(...arr); return Q(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.join('; ')} là:`, null, ch(rng, ans, arr), 'So sánh hàng trăm trước.', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`); }
          const asc = arr.slice().sort((x, y) => x - y);
          const s = a => a.join(', ');
          return Q(`Sắp xếp các số ${arr.join('; ')} theo thứ tự từ bé đến lớn:`, null, ch(rng, s(asc), [s(asc.slice().reverse()), s(arr), s([asc[1], asc[0], asc[2], asc[3]])]), 'Tìm số bé nhất trước.', `${s(asc)}.`);
        }),

      lesson(10, 51, 'Số có ba chữ số',
        'Rô-bốt ISA đếm số cây hoa trong vườn ươm cùng bạn Trang.',
        [
          { text: 'Số 245 gồm 2 trăm, 4 chục và 5 đơn vị, đọc là "hai trăm bốn mươi lăm".', visual: vz('blocks', { hundreds: 2, tens: 4, ones: 5 }) },
          { text: 'Số 307: 3 trăm, 0 chục, 7 đơn vị, đọc là "ba trăm linh bảy".', visual: vz('placeValue', { number: 307, columns: PV3 }) },
        ],
        function (rng, i) {
          const f = i % 5;
          const h = R(rng, 1, 9), t = lv(i) === 2 ? P(rng, [0, R(rng, 1, 9)]) : R(rng, 1, 9), o = R(rng, 0, 9), n = h * 100 + t * 10 + o;
          if (f === 0) return Q('Hình dưới đây biểu diễn số nào?', vz('blocks', { hundreds: h, tens: t, ones: o }), num(n), 'Đếm tấm trăm, thanh chục, rồi khối lẻ.', `${h} trăm, ${t} chục, ${o} đơn vị: ${n}.`);
          if (f === 1) return Q(`Số "${readVN(n)}" viết là:`, null, ch(rng, n, [h * 100 + o * 10 + t, h * 100 + t, n + 100 <= 999 ? n + 100 : n - 100, h * 10 + t * 100 + o].filter(x => x >= 100 && x <= 999)), 'Viết lần lượt chữ số hàng trăm, hàng chục, hàng đơn vị.', `"${readVN(n)}" viết là ${n}.`);
          if (f === 2) return Q(`Số ${n} đọc là:`, null, ch(rng, readVN(n), [readVN(h * 100 + o * 10 + t), readVN(n + 10 <= 999 ? n + 10 : n - 10), readVN(n === 999 ? 998 : n + 1)]), 'Đọc số trăm, số chục, rồi số đơn vị.', `${n} đọc là "${readVN(n)}".`);
          if (f === 3) return Q(`Số gồm ${h} trăm, ${t} chục và ${o} đơn vị là:`, null, num(n), 'Viết từ hàng trăm sang hàng đơn vị.', `Đó là số ${n}.`);
          const dg = digits(n), pl = R(rng, 0, 2);
          return Q(`Chữ số ${dg[pl]} trong số ${n} thuộc hàng nào?`, vz('placeValue', { number: n, columns: PV3 }), ch(rng, ['hàng trăm', 'hàng chục', 'hàng đơn vị'][pl], ['hàng trăm', 'hàng chục', 'hàng đơn vị', 'hàng nghìn'].filter((x, j) => j !== pl)), 'Đếm vị trí từ phải sang trái: đơn vị, chục, trăm.', `Chữ số ${dg[pl]} ở ${['hàng trăm', 'hàng chục', 'hàng đơn vị'][pl]}.`);
        }),

      lesson(10, 52, 'Viết số thành tổng các trăm, chục, đơn vị',
        'Rô-bốt ISA tách số thành các phần trăm, chục, đơn vị để bạn Hà dễ nhớ.',
        [
          { text: '456 = 400 + 50 + 6.', visual: vz('blocks', { hundreds: 4, tens: 5, ones: 6 }) },
          { text: '708 = 700 + 8 (hàng chục là 0 nên không viết).', visual: vz('placeValue', { number: 708, columns: PV3 }) },
        ],
        function (rng, i) {
          const h = R(rng, 1, 9), t = R(rng, lv(i) === 2 ? 0 : 1, 9), o = R(rng, 1, 9), n = h * 100 + t * 10 + o, f = i % 4;
          const sumStr = [h * 100, t * 10, o].filter(x => x > 0).join(' + ');
          if (f === 0) return Q(`${h * 100} + ${t * 10} + ${o} = ?`, vz('blocks', { hundreds: h, tens: t, ones: o }), num(n), 'Ghép trăm, chục, đơn vị lại.', `${h * 100} + ${t * 10} + ${o} = ${n}.`);
          if (f === 1) { if (t === 0) return Q(`Số thích hợp ở ô ?:\n${n} = ${h * 100} + ?`, null, num(o), 'Tách số thành trăm và đơn vị.', `${n} = ${h * 100} + ${o}.`); return Q(`Số thích hợp ở ô ?:\n${n} = ${h * 100} + ? + ${o}`, vz('placeValue', { number: n, columns: PV3 }), num(t * 10), `Chữ số ${t} ở hàng chục nghĩa là ${t * 10}.`, `${n} = ${sumStr}.`); }
          if (f === 2) return Q(`Viết số ${n} thành tổng các trăm, chục, đơn vị:`, null, ch(rng, sumStr, [[h * 100, o * 10, t], [h * 10, t * 10, o], [h, t, o]].map(x => x.filter(y => y > 0).join(' + '))), 'Chữ số hàng trăm nhân 100, hàng chục nhân 10.', `${n} = ${sumStr}.`);
          return Q(`Số ${h * 100} + ${o} là số nào?`, null, ch(rng, h * 100 + o, [h * 10 + o, h * 100 + o * 10, h + o]), 'Không có chục thì chữ số hàng chục là 0.', `${h * 100} + ${o} = ${h * 100 + o}.`);
        }),

      lesson(10, 53, 'So sánh các số có ba chữ số',
        'Rô-bốt ISA so sánh chiều cao của các tòa nhà trong thành phố cùng bạn Nam.',
        [
          { text: 'So sánh 352 và 326: cùng 3 trăm; hàng chục 5 > 2. Vậy 352 > 326.', visual: vz('compare', { left: 352, right: 326 }) },
          { text: 'Lần lượt so sánh từ hàng trăm, hàng chục đến hàng đơn vị.', visual: vz('placeValue', { number: 352, columns: PV3 }) },
        ],
        function (rng, i) {
          const f = i % 4;
          const r3 = () => R(rng, 100, 999);
          if (f === 0) {
            const a = r3(); let b;
            if (lv(i) === 0) b = r3(); else if (lv(i) === 1) b = Math.floor(a / 100) * 100 + R(rng, 0, 99); else b = Math.floor(a / 10) * 10 + R(rng, 0, 9);
            return Q(`So sánh: ${a} … ${b}`, vz('compare', { left: a, right: b }), cmpAns(a, b), 'So sánh hàng trăm, rồi hàng chục, rồi hàng đơn vị.', `${a} ${sign(a, b)} ${b}.`);
          }
          const base = R(rng, 1, 8) * 100;
          const arr = U.sample(rng, Array.from({ length: 199 }, (_, k) => base + k), 4);
          if (f === 1) { const big = R(rng, 0, 1); const ans = big ? Math.max(...arr) : Math.min(...arr); return Q(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.join('; ')} là:`, null, ch(rng, ans, arr), 'So sánh từng hàng từ trái sang phải.', `Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`); }
          if (f === 2) { const asc = arr.slice().sort((x, y) => x - y), s = a => a.join(', '); return Q(`Sắp xếp các số ${arr.join('; ')} theo thứ tự từ lớn đến bé:`, null, ch(rng, s(asc.slice().reverse()), [s(asc), s(arr), s([asc[2], asc[3], asc[1], asc[0]])]), 'Tìm số lớn nhất trước.', `${s(asc.slice().reverse())}.`); }
          const v = R(rng, 0, 2), h = R(rng, 1, 9);
          if (v === 0) return Q('Số lớn nhất có ba chữ số là số nào?', null, ch(rng, 999, [900, 1000, 990]), 'Mỗi hàng đều lấy chữ số lớn nhất là 9.', 'Số lớn nhất có ba chữ số là 999.');
          if (v === 1) return Q('Số bé nhất có ba chữ số là số nào?', null, ch(rng, 100, [101, 111, 99]), 'Hàng trăm phải khác 0, các hàng khác lấy 0.', 'Số bé nhất có ba chữ số là 100.');
          return Q(`Số lớn nhất có ba chữ số mà chữ số hàng trăm là ${h} là số nào?`, null, num(h * 100 + 99), 'Hàng chục và hàng đơn vị lấy chữ số lớn nhất.', `Đó là số ${h}99.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 11. ĐỘ DÀI VÀ ĐƠN VỊ ĐO ĐỘ DÀI. TIỀN VIỆT NAM ============
  const c11 = {
    id: 'g2-c11', semester: 2, title: 'Độ dài và đơn vị đo độ dài. Tiền Việt Nam', icon: '📏', lessons: [
      lesson(11, 55, 'Đề-xi-mét. Mét. Ki-lô-mét',
        'Rô-bốt ISA dùng thước mét đo chiều dài lớp học cùng bạn Quân.',
        [
          { text: '1 dm = 10 cm. Gang tay của em dài khoảng 1 dm.', visual: vz('ruler', { length: 10, unit: 'cm', object: 'ribbon' }) },
          { text: '1 m = 10 dm = 100 cm. 1 km = 1000 m: quãng đường dài người ta đo bằng ki-lô-mét.', visual: vz('ruler', { length: 3, unit: 'dm', object: 'pencil' }) },
        ],
        function (rng, i) {
          const f = i % 5;
          if (f === 0) {
            const a = R(rng, 1, 9);
            const [p, v, u] = P(rng, [[`${a} dm = ? cm`, a * 10, 'cm'], [`${a} m = ? dm`, a * 10, 'dm'], [`${a} m = ? cm`, a * 100, 'cm'], ['1 km = ? m', 1000, 'm'], [`${a * 10} cm = ? dm`, a, 'dm']]);
            return Q(p, null, num(v, u), 'Nhớ: 1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m.', `${p.replace('?', v)}.`);
          }
          if (f === 1) { const L = R(rng, 1, 5); return Q('Sợi ruy băng dài mấy đề-xi-mét?', vz('ruler', { length: L, unit: 'dm', object: 'ribbon' }), num(L, 'dm'), 'Mỗi khoảng lớn trên thước là 1 dm.', `Sợi ruy băng dài ${L} dm.`); }
          if (f === 2) { const [a, b] = pairWhere(rng, [2, 60], [1, 30], (x, y) => noCarry(x, y), [12, 5]); const u = P(rng, ['dm', 'm', 'km']); return Q(`${a} ${u} + ${b} ${u} = ?`, null, num(a + b, u), `Cộng các số rồi ghi đơn vị ${u}.`, `${a} ${u} + ${b} ${u} = ${a + b} ${u}.`); }
          if (f === 3) {
            const [p, u] = P(rng, [['Chiếc bút chì dài khoảng 15', 'cm'], ['Cột cờ trường em cao khoảng 10', 'm'], ['Quãng đường từ Hà Nội đến Hải Phòng dài khoảng 100', 'km'], ['Phòng học dài khoảng 8', 'm'], ['Quyển sách Toán dài khoảng 26', 'cm'], ['Gang tay của em dài khoảng 1', 'dm']]);
            return Q(`Chọn đơn vị thích hợp:\n${p} …`, null, ch(rng, u, ['cm', 'dm', 'm', 'km'].filter(x => x !== u)), 'Hình dung độ dài thật của đồ vật.', `${p} ${u}.`);
          }
          const a = R(rng, 1, 9), pairs = [[`${a} m`, a * 100, `${a * 10} dm`, a * 100], [`${a} dm`, a * 10, `${a * 10 + P(rng, [-5, 5, 0])} cm`, null], [`${a} m`, a * 100, `${a * 100 + P(rng, [-10, 10])} cm`, null]];
          const pr = P(rng, pairs);
          const rv = pr[3] != null ? pr[3] : Number(pr[2].split(' ')[0]);
          return Q(`So sánh: ${pr[0]} … ${pr[2]}`, vz('compare', { left: pr[0], right: pr[2] }), cmpAns(pr[1], rv), 'Đổi về cùng đơn vị rồi so sánh.', `${pr[0]} = ${pr[1]} cm${pr[3] != null ? `, ${pr[2]} = ${pr[3]} cm` : ''}. Vậy ${pr[0]} ${sign(pr[1], rv)} ${pr[2]}.`);
        }),

      lesson(11, 56, 'Giới thiệu tiền Việt Nam',
        'Rô-bốt ISA theo bạn Chi bỏ tiền tiết kiệm vào chú lợn đất.',
        [
          { text: 'Các tờ tiền: 100 đồng, 200 đồng, 500 đồng, 1000 đồng.', visual: vz('money', { notes: [100, 200, 500, 1000] }) },
          { text: '1 tờ 500 đồng và 2 tờ 200 đồng: 500 + 200 + 200 = 900 (đồng).', visual: vz('money', { notes: [500, 200, 200] }) },
        ],
        more(function (rng, i) {
          const f = i % 4;
          if (f === 0) {
            let notes, s; for (let g = 0; g < 50; g++) { notes = Array.from({ length: R(rng, 2, lv(i) === 0 ? 3 : 4) }, () => P(rng, [100, 200, 500])); s = notes.reduce((x, y) => x + y, 0); if (s <= 1000) break; }
            if (s > 1000) { notes = [500, 200]; s = 700; }
            notes.sort((x, y) => y - x);
            return Q('Có tất cả bao nhiêu tiền?', vz('money', { notes }), num(s, 'đồng'), 'Cộng giá trị các tờ tiền.', `${notes.join(' + ')} = ${s} (đồng).`);
          }
          if (f === 1) { const [big, small] = P(rng, [[1000, 500], [1000, 200], [1000, 100], [500, 100], [200, 100]]); return Q(`Đổi 1 tờ ${big} đồng được mấy tờ ${small} đồng?`, vz('money', { notes: [big] }), num(big / small), `${small} + ${small} + … = ${big}.`, `${big} : ${small} = ${big / small}. Đổi được ${big / small} tờ.`); }
          if (f === 2) { const price = R(rng, 1, 9) * 100; const pay = 1000; return Q(`${nm(rng)} mua một cái bút giá ${price} đồng, đưa cô bán hàng tờ 1000 đồng. Cô trả lại bao nhiêu tiền?`, vz('money', { notes: [1000] }), num(pay - price, 'đồng'), 'Lấy số tiền đưa trừ giá tiền.', `1000 ${M} ${price} = ${pay - price} (đồng).`); }
          const target = R(rng, 3, 10) * 100;
          const combos = [[500, 200, 100], [500, 500], [200, 200, 100], [500, 200], [200, 100], [500, 100], [500, 200, 200], [500, 200, 200, 100], [200, 200, 200], [500, 500, 100]];
          const good = combos.filter(c => c.reduce((x, y) => x + y, 0) === target);
          const bad = combos.filter(c => c.reduce((x, y) => x + y, 0) !== target);
          const str = c => c.map(x => x + ' đồng').join(' + ');
          if (!good.length) { const n = target / 100; return Q(`Cần bao nhiêu tờ 100 đồng để được ${target} đồng?`, vz('money', { notes: [100] }), num(n), 'Đếm thêm 100.', `${target} : 100 = ${n}.`); }
          return Q(`Chọn các tờ tiền có tổng là ${target} đồng:`, null, ch(rng, str(good[0]), U.sample(rng, bad, 3).map(str)), 'Cộng giá trị các tờ tiền trong mỗi đáp án.', `${good[0].join(' + ')} = ${target} (đồng).`);
        }, [
          [0, 6, rng => {
            const x = nm(rng), [a, b] = U.sample(rng, ['cái kẹo', 'cái bút chì', 'quyển vở', 'cái tẩy', 'cái thước kẻ', 'gói bánh quy'], 2);
            const p1 = R(rng, 1, 5) * 100, p2 = R(rng, 1, 10 - p1 / 100) * 100;
            return Q(`${x} mua một ${a} giá ${p1} đồng và một ${b} giá ${p2} đồng. Hỏi ${x} phải trả tất cả bao nhiêu tiền?`, null, num(p1 + p2, 'đồng'), 'Cộng giá tiền hai món đồ.', `${p1} + ${p2} = ${p1 + p2} (đồng).`);
          }],
          [0, 9, rng => {
            const [a, b] = [P(rng, [500, 200, 100]), P(rng, [200, 100, 500])].sort((x, y) => y - x), s = a + b, claim = P(rng, [s, s, s + 100, s - 100, s + 200]);
            return Q(`Đúng hay sai?\nTờ ${a} đồng và tờ ${b} đồng có tất cả ${claim} đồng.`, vz('money', { notes: [a, b] }), tf(rng, claim === s), 'Cộng giá trị hai tờ tiền.', `${a} + ${b} = ${s} (đồng). ${claim === s ? 'Đúng' : 'Sai'}.`);
          }],
          [3, 9, rng => {
            const a = P(rng, [500, 200]), b = P(rng, [200, 100, 500]), c = Math.min(1000, a + b + P(rng, [-200, -100, 0, 0, 100, 200]));
            return Q(`So sánh: ${a} đồng + ${b} đồng … ${c} đồng`, vz('compare', { left: `${a} + ${b}`, right: c }), cmpAns(a + b, c), 'Tính tổng số tiền bên trái rồi so sánh.', `${a} + ${b} = ${a + b}; ${a + b} ${sign(a + b, c)} ${c}.`);
          }],
          [3, 9, rng => {
            const notes = U.sample(rng, [500, 200, 200, 100, 100], R(rng, 2, 3)).sort((x, y) => y - x), s = notes.reduce((x, y) => x + y, 0);
            const p = Math.max(100, Math.min(1000, s + P(rng, [-200, -100, 0, 100, 200, 300]))), x = nm(rng), it = P(rng, ['quyển truyện', 'hộp bút màu', 'cái cặp tóc', 'quả bóng nhỏ']);
            return Q(`${x} có số tiền như hình. ${x} muốn mua một ${it} giá ${p} đồng. ${x} có đủ tiền không?`, vz('money', { notes }), ch(rng, s >= p ? 'Đủ tiền' : 'Không đủ tiền', [s >= p ? 'Không đủ tiền' : 'Đủ tiền']), 'Cộng số tiền đang có rồi so sánh với giá tiền.', `${notes.join(' + ')} = ${s} (đồng); ${s} ${sign(s, p)} ${p} nên ${x} ${s >= p ? 'đủ' : 'không đủ'} tiền.`);
          }],
          [6, 9, rng => {
            const notes = U.sample(rng, [500, 200, 200, 100], R(rng, 1, 2)).sort((x, y) => y - x), s = notes.reduce((x, y) => x + y, 0);
            const p = R(rng, s / 100 + 1, 10) * 100, x = nm(rng);
            return Q(`${x} có số tiền như hình. Một chiếc bút giá ${p} đồng. ${x} cần thêm bao nhiêu tiền nữa thì mua được chiếc bút?`, vz('money', { notes }), num(p - s, 'đồng'), 'Tính số tiền đang có, rồi lấy giá tiền trừ đi số tiền đó.', `${x} có ${s} đồng. ${p} ${M} ${s} = ${p - s} (đồng).`);
          }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 12. PHÉP CỘNG, PHÉP TRỪ TRONG PHẠM VI 1000 ============
  const c12 = {
    id: 'g2-c12', semester: 2, title: 'Phép cộng, phép trừ trong phạm vi 1000', icon: '➕', lessons: [
      lesson(12, 59, 'Phép cộng (không nhớ) trong phạm vi 1000',
        'Rô-bốt ISA cùng bạn Thảo đếm số học sinh khối 2 và khối 3 đi tham quan.',
        [
          { text: '325 + 142: cộng đơn vị 5 + 2 = 7; chục 2 + 4 = 6; trăm 3 + 1 = 4. Vậy 325 + 142 = 467.', visual: vz('columnCalc', { a: 325, b: 142, op: '+', reveal: 'all' }) },
          { text: 'Cộng nhẩm số tròn trăm: 300 + 200 = 500 (3 trăm + 2 trăm = 5 trăm).', visual: vz('blocks', { hundreds: 5, tens: 0, ones: 0 }) },
        ],
        colGen('+', (r, L) => pairWhere(r, L === 0 ? [100, 500] : [100, 800], L === 0 ? [10, 99] : [100, 600], (a, b) => noCarry(a, b) && a + b <= 999, [325, 142]), { items: BIG })),
      lesson(12, 60, 'Phép cộng (có nhớ) trong phạm vi 1000',
        'Rô-bốt ISA giúp nhà bạn Việt tính số quả trứng gà thu được trong hai ngày.',
        [
          { text: '258 + 136: 8 + 6 = 14, viết 4 nhớ 1; 5 + 3 = 8, thêm 1 là 9; 2 + 1 = 3. Vậy 258 + 136 = 394.', visual: vz('columnCalc', { a: 258, b: 136, op: '+', reveal: 'all' }) },
          { text: 'Nhớ có thể xảy ra ở hàng chục: 172 + 251 = 423 (7 + 5 = 12, viết 2 nhớ 1).', visual: vz('columnCalc', { a: 172, b: 251, op: '+', reveal: 'all' }) },
        ],
        colGen('+', (r, L) => pairWhere(r, [100, 700], L === 0 ? [10, 99] : [100, 500], (a, b) => !noCarry(a, b) && a + b <= 999, [258, 136]), { carry: true, items: BIG })),
      lesson(12, 61, 'Phép trừ (không nhớ) trong phạm vi 1000',
        'Rô-bốt ISA cùng bạn Vy tính số vé xem xiếc còn lại.',
        [
          { text: '587 − 254: 7 − 4 = 3; 8 − 5 = 3; 5 − 2 = 3. Vậy 587 − 254 = 333.', visual: vz('columnCalc', { a: 587, b: 254, op: M, reveal: 'all' }) },
          { text: 'Trừ nhẩm số tròn trăm: 700 − 300 = 400.', visual: vz('blocks', { hundreds: 4, tens: 0, ones: 0 }) },
        ],
        colGen(M, (r, L) => pairWhere(r, [200, 999], L === 0 ? [10, 99] : [100, 800], (a, b) => a > b && noBorrow(a, b), [587, 254]), { items: BIG })),
      lesson(12, 62, 'Phép trừ (có nhớ) trong phạm vi 1000',
        'Rô-bốt ISA giúp cô bán sách tính số quyển còn lại sau buổi hội sách.',
        [
          { text: '462 − 128: 2 không trừ được 8, lấy 12 − 8 = 4, viết 4 nhớ 1; 2 thêm 1 là 3, 6 − 3 = 3; 4 − 1 = 3. Vậy 462 − 128 = 334.', visual: vz('columnCalc', { a: 462, b: 128, op: M, reveal: 'all' }) },
          { text: 'Thử lại: 334 + 128 = 462.', visual: vz('columnCalc', { a: 334, b: 128, op: '+', reveal: 'all' }) },
        ],
        colGen(M, (r, L) => pairWhere(r, [200, 999], L === 0 ? [10, 99] : [100, 800], (a, b) => a > b && !noBorrow(a, b), [462, 128]), { carry: true, items: BIG })),
    ],
  };

  // ============ CHỦ ĐỀ 13. LÀM QUEN VỚI YẾU TỐ THỐNG KÊ, XÁC SUẤT ============
  const FR = [{ n: 'táo', e: '🍎' }, { n: 'cam', e: '🍊' }, { n: 'chuối', e: '🍌' }, { n: 'xoài', e: '🥭' }, { n: 'dưa hấu', e: '🍉' }];
  const COL = [{ n: 'đỏ', c: '#E84A4A' }, { n: 'xanh', c: '#4DA3FF' }, { n: 'vàng', c: '#FFC93C' }, { n: 'xanh lá', c: '#5BC85B' }];
  const c13 = {
    id: 'g2-c13', semester: 2, title: 'Làm quen với yếu tố thống kê, xác suất', icon: '📊', lessons: [
      lesson(13, 64, 'Thu thập, phân loại, kiểm đếm số liệu',
        'Rô-bốt ISA cùng bạn Mai kiểm đếm các loại quả trong giỏ quà biếu bà.',
        [
          { text: 'Phân loại rồi đếm từng loại: 4 quả táo, 3 quả cam, 2 quả chuối.', visual: vz('objects', { groups: [{ emoji: '🍎', count: 4 }, { emoji: '🍊', count: 3 }, { emoji: '🍌', count: 2 }] }) },
          { text: 'Ghi kết quả kiểm đếm vào bảng.', visual: vz('dataTable', { headers: ['Loại quả', 'Táo', 'Cam', 'Chuối'], rows: [['Số quả', 4, 3, 2]] }) },
        ],
        function (rng, i) {
          const fr = U.sample(rng, FR, 3), cnt = fr.map(() => R(rng, 1, lv(i) === 0 ? 5 : 9)), f = i % 4;
          if (cnt[0] === cnt[1]) cnt[1] = cnt[1] === 1 ? 2 : cnt[1] - 1;
          if (cnt[2] === cnt[0] || cnt[2] === cnt[1]) cnt[2] = Math.max(...cnt) + 1;
          const og = vz('objects', { groups: fr.map((x, j) => ({ emoji: x.e, count: cnt[j] })) });
          const tb = vz('dataTable', { headers: ['Loại quả'].concat(fr.map(x => x.n[0].toUpperCase() + x.n.slice(1))), rows: [['Số quả'].concat(cnt)] });
          if (f === 0) { const j = R(rng, 0, 2); return Q(`Có bao nhiêu quả ${fr[j].n}?`, og, num(cnt[j]), `Chỉ đếm quả ${fr[j].n}.`, `Có ${cnt[j]} quả ${fr[j].n}.`); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...cnt) : Math.min(...cnt), j = cnt.indexOf(v); return Q(`Loại quả nào có số quả ${big ? 'nhiều' : 'ít'} nhất?`, tb, ch(rng, fr[j].n[0].toUpperCase() + fr[j].n.slice(1), fr.map(x => x.n[0].toUpperCase() + x.n.slice(1))), 'So sánh các số trong bảng.', `${fr[j].n[0].toUpperCase() + fr[j].n.slice(1)}: ${v} quả.`); }
          if (f === 2) { const s = cnt[0] + cnt[1] + cnt[2]; return Q('Có tất cả bao nhiêu quả?', tb, num(s), 'Cộng số quả của các loại.', `${cnt.join(' + ')} = ${s} (quả).`); }
          const [x, y] = [0, 1].map(k => k); const hi = cnt[x] > cnt[y] ? x : y, lo = hi === x ? y : x;
          return Q(`Số quả ${fr[hi].n} nhiều hơn số quả ${fr[lo].n} bao nhiêu quả?`, og, num(cnt[hi] - cnt[lo]), 'Lấy số lớn trừ số bé.', `${cnt[hi]} ${M} ${cnt[lo]} = ${cnt[hi] - cnt[lo]} (quả).`);
        }),

      lesson(13, 65, 'Biểu đồ tranh',
        'Rô-bốt ISA cùng các bạn lớp 2A vẽ biểu đồ tranh về con vật yêu thích.',
        [
          { text: 'Biểu đồ tranh: mỗi hình vẽ là 1 bạn. Hàng "Mèo" có 5 hình nên 5 bạn thích mèo.', visual: vz('pictograph', { rows: [{ label: 'Mèo', count: 5 }, { label: 'Chó', count: 4 }, { label: 'Thỏ', count: 2 }], emoji: '🙂' }) },
        ],
        function (rng, i) {
          const sets = [
            { labels: ['Mèo', 'Chó', 'Thỏ', 'Cá vàng'], what: 'bạn thích', emoji: '🙂' },
            { labels: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm'], what: 'cây trồng được vào', emoji: '🌱' },
            { labels: ['Táo', 'Cam', 'Xoài', 'Chuối'], what: 'quả', emoji: '🍎' },
          ];
          const st = P(rng, sets), k = lv(i) === 0 ? 3 : 4;
          const labels = st.labels.slice(0, k);
          const counts = U.sample(rng, [1, 2, 3, 4, 5, 6, 7, 8], k);
          const pv = vz('pictograph', { rows: labels.map((l, j) => ({ label: l, count: counts[j] })), emoji: st.emoji });
          const f = i % 4;
          const desc = st.what === 'bạn thích' ? 'Mỗi hình là 1 bạn.' : st.what === 'quả' ? 'Mỗi hình là 1 quả.' : 'Mỗi hình là 1 cây.';
          if (f === 0) { const j = R(rng, 0, k - 1); return Q(`${desc} Hàng "${labels[j]}" có bao nhiêu?`, pv, num(counts[j]), 'Đếm số hình ở hàng đó.', `Có ${counts[j]}.`); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...counts) : Math.min(...counts); return Q(`${desc} Hàng nào có ${big ? 'nhiều' : 'ít'} hình nhất?`, pv, ch(rng, labels[counts.indexOf(v)], labels), 'So sánh độ dài các hàng.', `"${labels[counts.indexOf(v)]}" có ${v}.`); }
          if (f === 2) { const [a, b] = U.sample(rng, labels.map((_, j) => j), 2); const hi = counts[a] > counts[b] ? a : b, lo = hi === a ? b : a; return Q(`${desc} Hàng "${labels[hi]}" nhiều hơn hàng "${labels[lo]}" bao nhiêu?`, pv, num(counts[hi] - counts[lo]), 'Lấy số lớn trừ số bé.', `${counts[hi]} ${M} ${counts[lo]} = ${counts[hi] - counts[lo]}.`); }
          const s = counts.reduce((x, y) => x + y, 0);
          return Q(`${desc} Tất cả có bao nhiêu?`, pv, num(s), 'Cộng số hình của tất cả các hàng.', `${counts.join(' + ')} = ${s}.`);
        }),

      lesson(13, 66, 'Chắc chắn, có thể, không thể',
        'Rô-bốt ISA rủ bạn Hùng chơi trò bốc bóng trong hộp kín.',
        [
          { text: 'Hộp chỉ có bóng đỏ: lấy 1 quả thì CHẮC CHẮN được bóng đỏ, KHÔNG THỂ được bóng xanh.', visual: vz('chance', { items: [{ color: '#E84A4A', count: 5 }] }) },
          { text: 'Hộp có bóng đỏ và bóng xanh: lấy 1 quả thì CÓ THỂ được bóng đỏ.', visual: vz('chance', { items: [{ color: '#E84A4A', count: 3 }, { color: '#4DA3FF', count: 2 }] }) },
        ],
        function (rng, i) {
          const k = R(rng, 1, lv(i) === 0 ? 2 : 3);
          const cols = U.sample(rng, COL, k + 1);
          const inBox = cols.slice(0, k), out = cols[k];
          const items = inBox.map(c => ({ color: c.c, count: R(rng, 1, 6) }));
          const t = R(rng, 0, 2);
          let ask, ans;
          if (t === 0) { ask = inBox[0]; ans = k === 1 ? 'Chắc chắn' : 'Có thể'; }
          else if (t === 1) { ask = out; ans = 'Không thể'; }
          else { ask = inBox[k - 1]; ans = k === 1 ? 'Chắc chắn' : 'Có thể'; }
          const desc = inBox.map((c, j) => `${items[j].count} quả bóng ${c.n}`).join(', ');
          return Q(`Trong hộp có ${desc}. Không nhìn, lấy ra 1 quả bóng. ${'…'} lấy được quả bóng ${ask.n}.`, vz('chance', { items }), { kind: 'choice', options: ['Chắc chắn', 'Có thể', 'Không thể'], correct: ['Chắc chắn', 'Có thể', 'Không thể'].indexOf(ans) }, 'Xem trong hộp có những màu nào.', ans === 'Không thể' ? `Trong hộp không có bóng ${ask.n} nên không thể lấy được.` : ans === 'Chắc chắn' ? `Hộp chỉ có bóng ${ask.n} nên chắc chắn lấy được.` : `Hộp có nhiều màu, nên có thể lấy được bóng ${ask.n}.`);
        }),
    ],
  };

  CURRICULUM.push({
    grade: 2,
    title: 'Lớp 2',
    book: 'Kết nối tri thức với cuộc sống',
    topics: [c1, c2, c3, c4, c5, c6, c8, c9, c10, c11, c12, c13],
  });
})();
