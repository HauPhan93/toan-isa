/* Toán ISA — Lớp 3 (SGK Toán 3 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; review / "Luyện tập chung" / hands-on lessons are skipped.
 * Ids: g3-c{chủ đề index}-b{Bài number}. Never rename ids.
 * English mode (I18N.md): every child-facing string is Lg('Vietnamese', 'English'). The helper is called
 * Lg, not L, because many generators here use a local variable named L (level or length).
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const R = U.rand, P = U.pick, F = x => U.fmt(x);
  const M = '−';
  const Lg = U.L, EN = U.EN;

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
  const YES = Lg('Đúng', 'True'), NO = Lg('Sai', 'False');
  const tf = (rng, ok) => U.choices(rng, ok ? YES : NO, [ok ? NO : YES]);
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
  const pl = (n, one, many) => (n === 1 ? one : many); // English singular / plural
  const tw = n => U.readEN(n); // "Make 8 four times bigger": the multiplier in words, so two numbers do not run together
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
  // number in words for the current language (I18N rule 5)
  const rd = n => (EN ? U.readEN(n) : readVN(n));
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
    return { id: `g3-c${c}-b${b}`, title, book: Lg(`Bài ${b}`, `Lesson ${b}`), story, learn, gen, ...(gen.exam ? { exam: gen.exam } : {}) };
  }

  // ---------- generic builders ----------
  const ADD_T = EN ? [
    (a, b, x, y) => `${x}'s family farm keeps ${F(a)} chickens and ${F(b)} ducks. How many chickens and ducks does the farm keep altogether?`,
    (a, b) => `The library has ${F(a)} storybooks and ${F(b)} textbooks. How many books does the library have altogether?`,
    (a, b) => `The first team planted ${F(a)} trees and the second team planted ${F(b)} trees. How many trees did the two teams plant altogether?`,
  ] : [
    (a, b, x, y) => `Trang trại nhà ${x} nuôi ${F(a)} con gà và ${F(b)} con vịt. Hỏi trang trại nuôi tất cả bao nhiêu con gà và vịt?`,
    (a, b) => `Thư viện có ${F(a)} quyển truyện và ${F(b)} quyển sách giáo khoa. Thư viện có tất cả bao nhiêu quyển sách?`,
    (a, b) => `Đội thứ nhất trồng được ${F(a)} cây, đội thứ hai trồng được ${F(b)} cây. Cả hai đội trồng được bao nhiêu cây?`,
  ];
  const SUB_T = EN ? [
    (a, b) => `A shop had ${F(a)} kg of rice and sold ${F(b)} kg. How many kilograms of rice does the shop have left?`,
    (a, b) => `A road is ${F(a)} m long. The workers have covered ${F(b)} m of it with tarmac. How many metres of road still have no tarmac?`,
    (a, b, x) => `${x} has ${F(a)} dong and spends ${F(b)} dong on books. How much money does ${x} have left?`,
  ] : [
    (a, b) => `Một cửa hàng có ${F(a)} kg gạo, đã bán ${F(b)} kg. Cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`,
    (a, b) => `Một con đường dài ${F(a)} m, đội công nhân đã trải nhựa ${F(b)} m. Còn bao nhiêu mét đường chưa trải nhựa?`,
    (a, b, x) => `${x} có ${F(a)} đồng, ${x} mua sách hết ${F(b)} đồng. Hỏi ${x} còn lại bao nhiêu tiền?`,
  ];
  // Each template says which sizes it suits (a = first number, r = result), so the story stays believable.
  const MUL_T = EN ? [
    { ok: a => a <= 48, t: (a, b) => `Each crate holds ${F(a)} cartons of milk. How many cartons of milk are there in ${b} crates like this?` },
    { ok: a => a <= 5000, t: (a, b) => `A lorry carries ${F(a)} kg of goods on each trip. How many kilograms of goods does it carry in ${b} trips like this?` },
    { ok: a => a >= 500, t: (a, b) => `Each storehouse holds ${F(a)} kg of rice. How many kilograms of rice do ${b} storehouses like this hold?` },
    { ok: () => true, t: (a, b) => `A factory makes ${F(a)} shirts each day. How many shirts does the factory make in ${b} days?` },
  ] : [
    { ok: a => a <= 48, t: (a, b) => `Mỗi thùng có ${F(a)} hộp sữa. Hỏi ${b} thùng như thế có bao nhiêu hộp sữa?` },
    { ok: a => a <= 5000, t: (a, b) => `Mỗi chuyến xe chở được ${F(a)} kg hàng. Hỏi ${b} chuyến xe như thế chở được bao nhiêu ki-lô-gam hàng?` },
    { ok: a => a >= 500, t: (a, b) => `Mỗi kho chứa ${F(a)} kg thóc. Hỏi ${b} kho như thế chứa bao nhiêu ki-lô-gam thóc?` },
    { ok: () => true, t: (a, b) => `Một nhà máy mỗi ngày may được ${F(a)} cái áo. Hỏi trong ${b} ngày nhà máy may được bao nhiêu cái áo?` },
  ];
  const DIV_T = EN ? [
    { ok: (a, b, r) => r <= 50, t: (a, b) => `${F(a)} kg of rice is shared equally between ${b} bags. How many kilograms of rice are in each bag?` },
    { ok: (a, b, r) => r <= 200, t: (a, b) => `${F(a)} exercise books are shared equally between ${b} classes. How many exercise books does each class get?` },
    { ok: (a, b, r) => r <= 300, t: (a, b) => `A piece of string ${F(a)} cm long is cut into ${b} equal pieces. How many centimetres long is each piece?` },
    { ok: (a, b, r) => r >= 100, t: (a, b) => `${F(a)} kg of rice is shared equally between ${b} storehouses. How many kilograms of rice does each storehouse hold?` },
    { ok: (a, b, r) => r >= 100, t: (a, b) => `${F(a)} young trees are shared equally between ${b} villages. How many young trees does each village get?` },
    { ok: (a, b, r) => r >= 100, t: (a, b) => `A road ${F(a)} m long is split into ${b} equal sections to be mended. How many metres long is each section?` },
  ] : [
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
      const hint = op === '+' ? Lg('Đặt tính thẳng cột, cộng từ phải sang trái, nhớ sang hàng bên trái khi tổng ≥ 10.', 'Set out the numbers in columns. Add from right to left, and carry 1 to the next column when a column adds up to 10 or more.')
        : op === M ? Lg('Đặt tính thẳng cột, trừ từ phải sang trái; không trừ được thì mượn 1 ở hàng bên trái.', 'Set out the numbers in columns and subtract from right to left. If you cannot subtract, exchange 1 from the column on the left.')
          : op === '×' ? Lg(`Nhân lần lượt từ phải sang trái: lấy ${b} nhân với từng chữ số, nhớ sang hàng bên trái.`, `Multiply from right to left: multiply each digit by ${b}, and carry to the next column.`)
            : Lg(`Chia lần lượt từ trái sang phải: mỗi lượt chia, nhân, trừ rồi hạ chữ số tiếp theo.`, `Divide from left to right. Each time: divide, multiply, subtract, then bring down the next digit.`);
      if (k === 0) return Q(Lg(`Đặt tính rồi tính:\n${expr}`, `Set out and calculate:\n${expr}`), colV, num(r), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 1) return Q(`${expr} = ?`, colV, ch(rng, r, [wrong, r + (op === ':' ? 1 : 10), r - (op === ':' ? 1 : 10), r + 100].filter(x => x > 0)), hint, `${expr} = ${F(r)}.`, { hintVisual: colH });
      if (k === 2) {
        const [x, y] = two(rng);
        const T = op === '+' ? ADD_T : op === M ? SUB_T : op === '×' ? MUL_T : DIV_T;
        const p = pickT(rng, T, a, b, r)(a, b, x, y);
        let tape;
        const mx = Math.max(a, op === '×' ? r : a);
        if (op === '+') tape = vz('tape', { bars: [{ label: '', units: units(a, Math.max(a, b)), value: F(a) }, { label: '', units: units(b, Math.max(a, b)), value: F(b) }], total: '?' });
        else if (op === M) tape = vz('tape', { bars: [{ label: Lg('Có', 'At first'), units: units(a, mx), value: F(a) }, { label: Lg('Bớt', 'Taken away'), units: units(b, mx), value: F(b) }], diff: '?' });
        else if (op === '×') tape = vz('tape', { bars: [{ label: '', parts: b, units: b, value: F(a) + ' × ' + b }], total: '?' });
        else tape = vz('tape', { bars: [{ label: '', parts: b, units: b, value: '?' }], total: F(a) });
        return Q(p, tape, num(r), op === '+' ? Lg('Tìm tất cả thì làm phép cộng.', 'To find how many altogether, add.') : op === M ? Lg('Tìm phần còn lại thì làm phép trừ.', 'To find how many are left, subtract.') : op === '×' ? Lg('Tìm nhiều nhóm bằng nhau thì làm phép nhân.', 'For several equal groups, multiply.') : Lg('Chia đều thành các phần bằng nhau thì làm phép chia.', 'To share into equal parts, divide.'), Lg(`Phép tính: ${expr} = ${F(r)}.`, `Calculation: ${expr} = ${F(r)}.`));
      }
      if (k === 3) {
        const c = Math.max(0, r + P(rng, [-10, -1, 0, 1, 10, 100]));
        return Q(Lg(`So sánh: ${expr} … ${F(c)}`, `Compare: ${expr} … ${F(c)}`), vz('compare', { left: expr, right: F(c) }), cmpAns(r, c), Lg('Tính kết quả phép tính trước rồi so sánh.', 'Work out the calculation first, then compare.'), `${expr} = ${F(r)}; ${F(r)} ${sign(r, c)} ${F(c)}.`);
      }
      if (wrong !== r) {
        const who = nm(rng);
        return Q(Lg(`Bạn ${who} tính: ${expr} = ${F(wrong)}.\nKết quả đúng là bao nhiêu?`, `${who} worked out: ${expr} = ${F(wrong)}.\nWhat is the correct answer?`), colV, num(r), Lg('Làm lại từng bước, chú ý phần nhớ và chữ số 0.', 'Work through each step again. Take care with carrying and with zeros.'), `${expr} = ${F(r)}.`, { hintVisual: colH });
      }
      if (op === '+') return Q(Lg(`Tìm số hạng chưa biết:\n${F(a)} + ? = ${F(r)}`, `Find the missing addend:\n${F(a)} + ? = ${F(r)}`), null, num(b), Lg('Lấy tổng trừ đi số hạng đã biết.', 'Subtract the addend you know from the sum.'), `${F(r)} ${M} ${F(a)} = ${F(b)}.`);
      if (op === M) return Q(Lg(`Tìm số bị trừ:\n? ${M} ${F(b)} = ${F(r)}`, `Find the minuend:\n? ${M} ${F(b)} = ${F(r)}`), null, num(a), Lg('Số bị trừ = hiệu + số trừ.', 'Minuend = difference + subtrahend.'), `${F(r)} + ${F(b)} = ${F(a)}.`);
      if (op === '×') return Q(Lg(`Tìm thừa số chưa biết:\n? × ${b} = ${F(r)}`, `Find the missing factor:\n? × ${b} = ${F(r)}`), null, num(a), Lg('Lấy tích chia cho thừa số đã biết.', 'Divide the product by the factor you know.'), `${F(r)} : ${b} = ${F(a)}.`);
      return Q(Lg(`Tìm số bị chia:\n? : ${b} = ${F(r)}`, `Find the dividend:\n? : ${b} = ${F(r)}`), null, num(a), Lg('Số bị chia = thương × số chia.', 'Dividend = quotient × divisor.'), `${F(r)} × ${b} = ${F(a)}.`);
    };
    // gen: practice (form by i % 5). exam: level 1 = đặt tính rồi tính, level 2–3 = bài toán có lời văn.
    const gen = (rng, i) => at(rng, lv(i), i % 5);
    gen.exam = (rng, level) => (level === 1 ? at(rng, 1, 0) : at(rng, level === 2 ? 1 : 2, 2));
    return gen;
  }

  // Multiplication + division tables
  // en: per = the fact, ask(k) = "how many in k groups?", what = the items, who = the groups (plural)
  const MCTX = {
    2: { per: 'Mỗi đôi đũa có 2 chiếc', who: 'đôi đũa', what: 'chiếc đũa', e: '🥢', en: { per: 'Each pair of chopsticks has 2 chopsticks', ask: k => `How many chopsticks are there in ${k} ${pl(k, 'pair', 'pairs')}?`, what: 'chopsticks', who: 'pairs of chopsticks' } },
    3: { per: 'Mỗi chiếc xích lô có 3 bánh xe', who: 'chiếc xích lô', what: 'bánh xe', e: '🛞', en: { per: 'Each cyclo has 3 wheels', ask: k => `How many wheels are there on ${k} ${pl(k, 'cyclo', 'cyclos')}?`, what: 'wheels', who: 'cyclos' } },
    4: { per: 'Mỗi con mèo có 4 chân', who: 'con mèo', what: 'cái chân', e: '🐱', en: { per: 'Each cat has 4 legs', ask: k => `How many legs ${pl(k, 'does 1 cat', `do ${k} cats`)} have?`, what: 'legs', who: 'cats' } },
    5: { per: 'Mỗi bông hoa có 5 cánh', who: 'bông hoa', what: 'cánh hoa', e: '🌸', en: { per: 'Each flower has 5 petals', ask: k => `How many petals are there on ${k} ${pl(k, 'flower', 'flowers')}?`, what: 'petals', who: 'flowers' } },
    6: { per: 'Mỗi hộp có 6 cái bánh', who: 'hộp', what: 'cái bánh', e: '🧁', en: { per: 'Each box has 6 cakes', ask: k => `How many cakes are there in ${k} ${pl(k, 'box', 'boxes')}?`, what: 'cakes', who: 'boxes' } },
    7: { per: 'Mỗi tuần lễ có 7 ngày', who: 'tuần lễ', what: 'ngày', e: '📅', en: { per: 'Each week has 7 days', ask: k => `How many days are there in ${k} ${pl(k, 'week', 'weeks')}?`, what: 'days', who: 'weeks' } },
    8: { per: 'Mỗi con bạch tuộc có 8 cái tua', who: 'con bạch tuộc', what: 'cái tua', e: '🐙', en: { per: 'Each octopus has 8 tentacles', ask: k => `How many tentacles ${pl(k, 'does 1 octopus', `do ${k} octopuses`)} have?`, what: 'tentacles', who: 'octopuses' } },
    9: { per: 'Mỗi hàng có 9 cây bắp cải', who: 'hàng', what: 'cây bắp cải', e: '🥬', en: { per: 'Each row has 9 cabbages', ask: k => `How many cabbages are there in ${k} ${pl(k, 'row', 'rows')}?`, what: 'cabbages', who: 'rows' } },
  };
  function tableGen(ns) {
    const k2 = (rng, i) => (lv(i) === 0 ? R(rng, 2, 5) : R(rng, 2, 10));
    return more(tableBase(ns), [
      // đúng / sai
      [0, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k, mul = R(rng, 0, 1), off = P(rng, [0, 0, 1, -1, n, -n]);
        const st = mul ? `${n} × ${k} = ${p + off}` : `${p} : ${n} = ${k + (off === n || off === -n ? Math.sign(off) : off)}`;
        const ok = off === 0;
        return Q(Lg(`Đúng hay sai?\n${st}`, `True or false?\n${st}`), null, tf(rng, ok), mul ? Lg(`Nhẩm bảng nhân ${n}.`, `Think of the ${n} times table.`) : Lg(`Nhẩm bảng chia ${n}: ${n} × ? = ${p}.`, `Think of dividing by ${n}: ${n} × ? = ${p}.`), mul ? Lg(`${n} × ${k} = ${p}. ${ok ? 'Đúng' : 'Sai'}.`, `${n} × ${k} = ${p}. ${ok ? 'True' : 'False'}.`) : Lg(`${p} : ${n} = ${k}. ${ok ? 'Đúng' : 'Sai'}.`, `${p} : ${n} = ${k}. ${ok ? 'True' : 'False'}.`));
      }],
      // đếm thêm
      [0, 6, (rng) => {
        const n = P(rng, ns), s = R(rng, 1, 6), miss = R(rng, 1, 3), seq = [0, 1, 2, 3, 4].map(j => n * (s + j));
        return Q(Lg(`Đếm thêm ${n} rồi tìm số thích hợp ở ô ?:\n${seq.map((v, j) => (j === miss ? '?' : v)).join(', ')}`, `Count on in ${n}s and find the missing number:\n${seq.map((v, j) => (j === miss ? '?' : v)).join(', ')}`), null, num(seq[miss]), Lg(`Mỗi số liền sau hơn số liền trước ${n} đơn vị.`, `Each number is ${n} more than the number before it.`), `${seq.join(', ')}.`);
      }],
      // phép nhân phù hợp với hình
      [0, 6, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), c = MCTX[n];
        return Q(Lg(`Có ${k} hàng, mỗi hàng ${n} hình. Phép nhân nào cho biết có tất cả bao nhiêu hình?`, `There are ${k} rows with ${n} pictures in each row. Which multiplication tells you how many pictures there are altogether?`), vz('array', { rows: k, cols: n, emoji: c.e }), ch(rng, `${n} × ${k} = ${n * k}`, [`${n} + ${k} = ${n + k}`, `${n} × ${k + 1} = ${n * (k + 1)}`, `${n} × ${k - 1} = ${n * (k - 1)}`]), Lg(`${n} được lấy ${k} lần.`, `${k} lots of ${n}.`), `${n} × ${k} = ${n * k}.`);
      }],
      // điền dấu × hoặc :
      [3, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k, mul = R(rng, 0, 1);
        const [a, b, c] = mul ? (R(rng, 0, 1) ? [n, k, p] : [k, n, p]) : (R(rng, 0, 1) ? [p, n, k] : [p, k, n]);
        return Q(Lg(`Chọn dấu thích hợp thay cho ô ?:\n${a} ? ${b} = ${c}`, `Choose the sign that goes in place of ?:\n${a} ? ${b} = ${c}`), null, { kind: 'text', options: ['×', ':'], correct: mul ? 0 : 1 }, Lg('Thử tính với từng dấu.', 'Try each sign.'), `${a} ${mul ? '×' : ':'} ${b} = ${c}.`);
      }],
      // tìm số bị chia
      [3, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k;
        return Q(Lg(`Số thích hợp ở ô ?:\n? : ${n} = ${k}`, `Find the missing number:\n? : ${n} = ${k}`), null, num(p), Lg('Số bị chia = thương × số chia.', 'Dividend = quotient × divisor.'), Lg(`${k} × ${n} = ${p}. Vậy ${p} : ${n} = ${k}.`, `${k} × ${n} = ${p}. So ${p} : ${n} = ${k}.`));
      }],
      // bài toán chia đều
      [3, 9, (rng, i) => {
        const n = P(rng, ns), k = k2(rng, i), p = n * k, x = nm(rng);
        const [what, into, wE, iE, i1] = P(rng, [['quả cam', 'đĩa', 'oranges', 'plates', 'plate'], ['cái kẹo', 'túi', 'sweets', 'bags', 'bag'], ['bông hoa', 'lọ', 'flowers', 'vases', 'vase'], ['quyển vở', 'bạn', 'exercise books', 'friends', 'friend'], ['cái bánh', 'hộp', 'cakes', 'boxes', 'box']]);
        const s = into === 'bạn' ? Lg(`${x} chia đều ${p} ${what} cho ${n} bạn. Hỏi mỗi bạn được mấy ${what}?`, `${x} shares ${p} ${wE} equally between ${n} friends. How many ${wE} does each friend get?`) : Lg(`${x} xếp đều ${p} ${what} vào ${n} ${into}. Hỏi mỗi ${into} có mấy ${what}?`, `${x} puts ${p} ${wE} equally into ${n} ${iE}. How many ${wE} are there in each ${i1}?`);
        return Q(s, shareV(p, n), num(k), Lg(`Chia đều thì làm phép chia: ${p} : ${n}.`, `To share equally, divide: ${p} : ${n}.`), Lg(`${p} : ${n} = ${k} (${what}).`, `${p} : ${n} = ${k} (${wE}).`));
      }],
      // từ một phép nhân đã biết suy ra phép nhân kế tiếp
      [6, 9, (rng) => {
        const n = P(rng, ns), k = R(rng, 2, 9), p = n * k, up = R(rng, 0, 1);
        return up
          ? Q(Lg(`Biết ${n} × ${k} = ${p}. Vậy ${n} × ${k + 1} = ?`, `You know that ${n} × ${k} = ${p}. So ${n} × ${k + 1} = ?`), null, num(p + n), Lg(`${n} × ${k + 1} nhiều hơn ${n} × ${k} đúng ${n} đơn vị.`, `${n} × ${k + 1} is exactly ${n} more than ${n} × ${k}.`), `${n} × ${k + 1} = ${p} + ${n} = ${p + n}.`)
          : Q(Lg(`Biết ${n} × ${k} = ${p}. Vậy ${n} × ${k - 1} = ?`, `You know that ${n} × ${k} = ${p}. So ${n} × ${k - 1} = ?`), null, num(p - n), Lg(`${n} × ${k - 1} ít hơn ${n} × ${k} đúng ${n} đơn vị.`, `${n} × ${k - 1} is exactly ${n} less than ${n} × ${k}.`), `${n} × ${k - 1} = ${p} ${M} ${n} = ${p - n}.`);
      }],
      // bài toán hai bước đơn giản
      [7, 9, (rng) => {
        const n = P(rng, ns), k = R(rng, 2, 9), x = nm(rng), [box, item, bE, bsE, itE, it1] = P(rng, [['hộp', 'cái bánh', 'box', 'boxes', 'cakes', 'cake'], ['túi', 'quả cam', 'bag', 'bags', 'oranges', 'orange'], ['bó', 'bông hoa', 'bunch', 'bunches', 'flowers', 'flower'], ['gói', 'cái kẹo', 'packet', 'packets', 'sweets', 'sweet']]), c = R(rng, 1, n * k - 1);
        return Q(Lg(`Mỗi ${box} có ${n} ${item}. ${x} có ${k} ${box} như thế và đã cho bạn ${c} ${item}. Hỏi ${x} còn lại bao nhiêu ${item}?`, `Each ${bE} has ${n} ${itE}. ${x} has ${k} ${bsE} like this and gives ${c} ${pl(c, it1, itE)} to a friend. How many ${itE} does ${x} have left?`), vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(n) }], total: '?' }), num(n * k - c), Lg(`Bước 1: tìm số ${item} có lúc đầu (${n} × ${k}). Bước 2: trừ đi số đã cho.`, `Step 1: find how many ${itE} there were at first (${n} × ${k}). Step 2: subtract the ones given away.`), Lg(`${n} × ${k} = ${n * k}; ${n * k} ${M} ${c} = ${n * k - c} (${item}).`, `${n} × ${k} = ${n * k}; ${n * k} ${M} ${c} = ${n * k - c} (${itE}).`));
      }],
    ], 3);
  }
  function tableBase(ns) {
    return function (rng, i) {
      const n = P(rng, ns), L = lv(i);
      const k = L === 0 ? R(rng, 1, 5) : R(rng, 2, 10);
      const p = n * k, c = MCTX[n], f = i % 6;
      if (f === 0) return Q(`${n} × ${k} = ?`, vz('array', { rows: k, cols: n, emoji: c.e }), num(p), Lg(`${n} được lấy ${k} lần. Có thể lấy ${n} × ${k - 1 || 1} rồi cộng thêm ${n}.`, `${k} ${pl(k, 'lot', 'lots')} of ${n}.${k > 1 ? ` You can work out ${n} × ${k - 1}, then add ${n}.` : ''}`), `${n} × ${k} = ${p}.`);
      if (f === 1) return Q(`${p} : ${n} = ?`, shareV(p, n, c.e), num(k), Lg(`Nhớ bảng nhân ${n}: ${n} × ? = ${p}.`, `Remember the ${n} times table: ${n} × ? = ${p}.`), Lg(`${p} : ${n} = ${k} vì ${n} × ${k} = ${p}.`, `${p} : ${n} = ${k} because ${n} × ${k} = ${p}.`));
      if (f === 2) return Q(Lg(`${c.per}. Hỏi ${k} ${c.who} có bao nhiêu ${c.what}?`, `${c.en.per}. ${c.en.ask(k)}`), vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(n) }], total: '?' }), num(p), Lg(`${n} được lấy ${k} lần.`, `${k} ${pl(k, 'lot', 'lots')} of ${n}.`), Lg(`${n} × ${k} = ${p} (${c.what}).`, `${n} × ${k} = ${p} (${c.en.what}).`));
      if (f === 3) return Q(Lg(`${c.per}. Có ${p} ${c.what} thì có bao nhiêu ${c.who}?`, `${c.en.per}. There are ${p} ${c.en.what}. How many ${c.en.who} are there?`), vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(n) }], total: String(p) }), num(k), Lg(`Chia ${p} thành các nhóm, mỗi nhóm ${n}.`, `Split ${p} into groups of ${n}.`), Lg(`${p} : ${n} = ${k} (${c.who}).`, `${p} : ${n} = ${k} (${c.en.who}).`));
      if (f === 4) {
        if (R(rng, 0, 1)) return Q(Lg(`Số thích hợp ở ô ?:\n${n} × ? = ${p}`, `Find the missing number:\n${n} × ? = ${p}`), null, num(k), Lg(`Nhẩm bảng nhân ${n}.`, `Think of the ${n} times table.`), `${n} × ${k} = ${p}.`);
        return Q(Lg(`Số thích hợp ở ô ?:\n${p} : ? = ${k}`, `Find the missing number:\n${p} : ? = ${k}`), null, num(n), Lg('Lấy số bị chia chia cho thương.', 'Divide the dividend by the quotient.'), `${p} : ${k} = ${n}.`);
      }
      const k2 = R(rng, 1, 10), m2 = P(rng, ns.length > 1 ? ns : [n, n === 9 ? 8 : n + 1]);
      const right = m2 * k2;
      return Q(Lg(`So sánh: ${n} × ${k} … ${m2} × ${k2}`, `Compare: ${n} × ${k} … ${m2} × ${k2}`), vz('compare', { left: `${n} × ${k}`, right: `${m2} × ${k2}` }), cmpAns(p, right), Lg('Tính tích hai bên rồi so sánh.', 'Work out the product on each side, then compare.'), Lg(`${n} × ${k} = ${p}; ${m2} × ${k2} = ${right}. Vậy ${p} ${sign(p, right)} ${right}.`, `${n} × ${k} = ${p}; ${m2} × ${k2} = ${right}. So ${p} ${sign(p, right)} ${right}.`));
    };
  }

  // ============ CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG ============
  const PV3 = EN ? ['Hundreds', 'Tens', 'Ones'] : ['Trăm', 'Chục', 'Đơn vị'];
  const c1 = {
    id: 'g3-c1', semester: 1, title: Lg('Ôn tập và bổ sung', 'Review and extension'), icon: '🔢', lessons: [
      lesson(1, 1, Lg('Ôn tập các số đến 1000', 'Review: numbers to 1000'),
        Lg('Rô-bốt ISA cùng bạn Mai đếm số ghế trong hội trường của trường.', 'ISA the robot and Mai count the chairs in the school hall.'),
        [
          { text: Lg('Số 638 gồm 6 trăm, 3 chục, 8 đơn vị; đọc là "sáu trăm ba mươi tám".', 'The number 638 has 6 hundreds, 3 tens and 8 ones. We read it as "six hundred and thirty-eight".'), visual: vz('blocks', { hundreds: 6, tens: 3, ones: 8 }) },
          { text: '638 = 600 + 30 + 8.', visual: vz('placeValue', { number: 638, columns: PV3 }) },
          { text: Lg('So sánh từ hàng trăm: 638 > 592 vì 6 trăm > 5 trăm.', 'Compare the hundreds first: 638 > 592 because 6 hundreds > 5 hundreds.'), visual: vz('compare', { left: 638, right: 592 }) },
        ],
        function (rng, i) {
          const n = R(rng, 100, 999), f = i % 5;
          if (f === 0) return Q(Lg(`Số "${readVN(n)}" viết là:`, `Write "${rd(n)}" in digits:`), null, num(n), Lg('Viết lần lượt chữ số hàng trăm, chục, đơn vị.', 'Write the hundreds digit, then the tens digit, then the ones digit.'), Lg(`"${readVN(n)}" viết là ${n}.`, `"${rd(n)}" is written ${n}.`));
          if (f === 1) { const m = Math.floor(n / 100) * 100 + R(rng, 0, 99); return Q(Lg(`So sánh: ${n} … ${m}`, `Compare: ${n} … ${m}`), vz('compare', { left: n, right: m }), cmpAns(n, m), Lg('So sánh từ hàng trăm, rồi chục, rồi đơn vị.', 'Compare the hundreds first, then the tens, then the ones.'), `${n} ${sign(n, m)} ${m}.`); }
          if (f === 2) { const e = expand(n); return Q(Lg(`Viết số ${n} thành tổng các trăm, chục, đơn vị:`, `Write ${n} as a sum of hundreds, tens and ones:`), vz('blocks', { hundreds: Math.floor(n / 100), tens: Math.floor(n / 10) % 10, ones: n % 10 }), ch(rng, e.join(' + '), [[Math.floor(n / 100) * 10, (n % 100)].join(' + '), [Math.floor(n / 100) * 100, n % 100 + 1].join(' + '), [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10].join(' + ')]), Lg('Mỗi chữ số có giá trị theo hàng của nó.', 'The value of each digit depends on its place.'), `${n} = ${e.join(' + ')}.`); }
          if (f === 3) { const a0 = Math.floor(n / 10) * 10; const u = a0 + R(rng, 1, 9); return Q(Lg('Số thích hợp ở ô ? trên tia số là:', 'Which number goes in the box ? on the number line?'), vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: 5, unknown: u }), num(u), Lg('Đếm thêm 1 từ vạch có số.', 'Count on in 1s from a mark with a number.'), Lg(`Số cần điền là ${u}.`, `The missing number is ${u}.`)); }
          const arr = U.sample(rng, Array.from({ length: 900 }, (_, k) => k + 100), 4), asc = arr.slice().sort((x, y) => x - y), s = a => a.join(', ');
          return Q(Lg(`Sắp xếp ${arr.join('; ')} theo thứ tự từ bé đến lớn:`, `Put ${arr.join('; ')} in order from smallest to largest:`), null, ch(rng, s(asc), [s(asc.slice().reverse()), s(arr), s([asc[0], asc[2], asc[1], asc[3]])]), Lg('Tìm số bé nhất trước.', 'Find the smallest number first.'), `${s(asc)}.`);
        }),

      lesson(1, 2, Lg('Ôn tập phép cộng, phép trừ trong phạm vi 1000', 'Review: addition and subtraction within 1000'),
        Lg('Rô-bốt ISA giúp bạn Nam tính số vé bán được ở hội chợ Xuân.', 'ISA the robot helps Nam work out how many tickets were sold at the Spring fair.'),
        [
          { text: Lg('Đặt tính thẳng cột rồi cộng từ phải sang trái: 356 + 278 = 634.', 'Set out the numbers in columns, then add from right to left: 356 + 278 = 634.'), visual: vz('columnCalc', { a: 356, b: 278, op: '+', reveal: 'all' }) },
          { text: Lg('Trừ có nhớ: 724 − 358 = 366.', 'Subtraction with exchanging: 724 − 358 = 366.'), visual: vz('columnCalc', { a: 724, b: 358, op: M, reveal: 'all' }) },
        ],
        mixCol([
          ['+', (r, L) => pairWhere(r, [100, 700], [10, 500], (a, b) => a + b <= 999 && (L === 0 || !noCarry(a, b)), [356, 278])],
          [M, (r, L) => pairWhere(r, [200, 999], [10, 800], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [724, 358])],
        ])),

      lesson(1, 3, Lg('Tìm thành phần trong phép cộng, phép trừ', 'Finding missing numbers in addition and subtraction'),
        Lg('Rô-bốt ISA và bạn Chi tìm số bị che bởi chiếc lá trong bài toán.', 'ISA the robot and Chi find the number hidden under a leaf in a maths problem.'),
        [
          { text: Lg('Muốn tìm số hạng chưa biết, ta lấy tổng trừ đi số hạng kia: ? + 25 = 60 thì ? = 60 − 25 = 35.', 'To find a missing addend, subtract the other addend from the sum: if ? + 25 = 60, then ? = 60 − 25 = 35.'), visual: vz('tape', { bars: [{ label: '', units: 7, value: '?' }, { label: '', units: 5, value: '25' }], total: '60' }) },
          { text: Lg('Muốn tìm số bị trừ, lấy hiệu cộng với số trừ. Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu.', 'To find the minuend, add the difference and the subtrahend. To find the subtrahend, subtract the difference from the minuend.') },
        ],
        function (rng, i) {
          const L = lv(i), mx = L === 0 ? 100 : 1000;
          const a = R(rng, 10, mx / 2), b = R(rng, 10, mx / 2 - 1), s = a + b, f = i % 4;
          if (f === 0) return Q(Lg(`Tìm số hạng chưa biết:\n? + ${b} = ${s}`, `Find the missing addend:\n? + ${b} = ${s}`), vz('tape', { bars: [{ label: '', units: units(a, s), value: '?' }, { label: '', units: units(b, s), value: String(b) }], total: String(s) }), num(a), Lg('Lấy tổng trừ đi số hạng đã biết.', 'Subtract the addend you know from the sum.'), `? = ${s} ${M} ${b} = ${a}.`);
          if (f === 1) return Q(Lg(`Tìm số bị trừ:\n? ${M} ${b} = ${a}`, `Find the minuend:\n? ${M} ${b} = ${a}`), null, num(s), Lg('Lấy hiệu cộng với số trừ.', 'Add the difference and the subtrahend.'), `? = ${a} + ${b} = ${s}.`);
          if (f === 2) return Q(Lg(`Tìm số trừ:\n${s} ${M} ? = ${a}`, `Find the subtrahend:\n${s} ${M} ? = ${a}`), null, num(b), Lg('Lấy số bị trừ trừ đi hiệu.', 'Subtract the difference from the minuend.'), `? = ${s} ${M} ${a} = ${b}.`);
          const x = nm(rng);
          return Q(Lg(`${x} có một số viên bi, ${x} cho em ${b} viên thì còn lại ${a} viên. Hỏi lúc đầu ${x} có bao nhiêu viên bi?`, `${x} has some marbles. ${x} gives ${b} marbles to a younger child and has ${a} marbles left. How many marbles did ${x} have at first?`), vz('tape', { bars: [{ label: Lg('Lúc đầu', 'At first'), units: units(s, s), value: '?' }, { label: Lg('Cho em', 'Given away'), units: units(b, s), value: String(b) }], diff: String(a) }), num(s), Lg('Số lúc đầu = số còn lại + số đã cho.', 'Number at first = number left + number given away.'), Lg(`${a} + ${b} = ${s} (viên bi).`, `${a} + ${b} = ${s} (marbles).`));
        }),

      lesson(1, 4, Lg('Ôn tập bảng nhân 2, 5; bảng chia 2, 5', 'Review: the 2 and 5 times tables; dividing by 2 and 5'),
        Lg('Rô-bốt ISA cùng bạn Hà đếm đũa và hoa chuẩn bị cho mâm cơm ngày Tết.', 'ISA the robot and Hà count chopsticks and flowers for the Tết family meal.'),
        [
          { text: Lg('2 × 6 = 12 nên 12 : 2 = 6. Phép chia là phép tính ngược của phép nhân.', '2 × 6 = 12, so 12 : 2 = 6. Division is the inverse of multiplication.'), visual: vz('array', { rows: 6, cols: 2, emoji: '🥢' }) },
          { text: Lg('5 × 4 = 20 nên 20 : 5 = 4 và 20 : 4 = 5.', '5 × 4 = 20, so 20 : 5 = 4 and 20 : 4 = 5.'), visual: vz('share', { total: 20, groups: 5, emoji: '🌸' }) },
        ],
        tableGen([2, 5])),
      lesson(1, 5, Lg('Bảng nhân 3, bảng chia 3', 'The 3 times table; dividing by 3'),
        Lg('Rô-bốt ISA đếm bánh xe của những chiếc xích lô chở khách trên phố cổ.', 'ISA the robot counts the wheels of the cyclos carrying people around the Old Quarter.'),
        [
          { text: Lg('3 × 1 = 3, 3 × 2 = 6, 3 × 3 = 9, … Mỗi lần thêm 3.', '3 × 1 = 3, 3 × 2 = 6, 3 × 3 = 9, … Each time, add 3.'), visual: vz('numberLine', { min: 0, max: 30, step: 3, labelEvery: 1, hops: [{ from: 0, to: 3, label: '+3' }, { from: 3, to: 6, label: '+3' }, { from: 6, to: 9, label: '+3' }] }) },
          { text: Lg('Từ 3 × 4 = 12 ta có 12 : 3 = 4.', 'From 3 × 4 = 12 we know 12 : 3 = 4.'), visual: vz('share', { total: 12, groups: 3, emoji: '🍊' }) },
        ],
        tableGen([3])),
      lesson(1, 6, Lg('Bảng nhân 4, bảng chia 4', 'The 4 times table; dividing by 4'),
        Lg('Rô-bốt ISA đếm chân những chú mèo đang sưởi nắng trong sân nhà bạn Vy.', 'ISA the robot counts the legs of the cats sunbathing in Vy\'s yard.'),
        [
          { text: Lg('4 × 1 = 4, 4 × 2 = 8, 4 × 3 = 12, … đếm thêm 4.', '4 × 1 = 4, 4 × 2 = 8, 4 × 3 = 12, … count on in 4s.'), visual: vz('array', { rows: 3, cols: 4, emoji: '🐾' }) },
          { text: Lg('Từ 4 × 5 = 20 ta có 20 : 4 = 5.', 'From 4 × 5 = 20 we know 20 : 4 = 5.'), visual: vz('share', { total: 20, groups: 4, emoji: '🍬' }) },
        ],
        tableGen([4])),
    ],
  };

  // ============ CHỦ ĐỀ 2. BẢNG NHÂN, BẢNG CHIA ============
  function fracShape(rng) { return P(rng, ['bar', 'pie', 'rect']); }
  const c2 = {
    id: 'g3-c2', semester: 1, title: Lg('Bảng nhân, bảng chia', 'Times tables and division facts'), icon: '✖️', lessons: [
      lesson(2, 9, Lg('Bảng nhân 6, bảng chia 6', 'The 6 times table; dividing by 6'),
        Lg('Rô-bốt ISA xếp bánh vào hộp 6 chiếc cùng bạn Phúc để mang đi biếu ông bà.', 'ISA the robot and Phúc pack cakes into boxes of 6 to give to their grandparents.'),
        [
          { text: Lg('6 × 3 = 18: 3 hộp, mỗi hộp 6 cái bánh.', '6 × 3 = 18: 3 boxes with 6 cakes in each box.'), visual: vz('array', { rows: 3, cols: 6, emoji: '🧁' }) },
          { text: Lg('Từ 6 × 7 = 42 ta có 42 : 6 = 7 và 42 : 7 = 6.', 'From 6 × 7 = 42 we know 42 : 6 = 7 and 42 : 7 = 6.') },
        ],
        tableGen([6])),
      lesson(2, 10, Lg('Bảng nhân 7, bảng chia 7', 'The 7 times table; dividing by 7'),
        Lg('Rô-bốt ISA đếm số ngày trong các tuần của kì nghỉ hè cùng bạn Quân.', 'ISA the robot and Quân count the days in the weeks of the summer holidays.'),
        [
          { text: Lg('7 × 2 = 14: 2 tuần lễ có 14 ngày.', '7 × 2 = 14: 2 weeks have 14 days.'), visual: vz('array', { rows: 2, cols: 7, emoji: '📅' }) },
          { text: Lg('Từ 7 × 6 = 42 ta có 42 : 7 = 6.', 'From 7 × 6 = 42 we know 42 : 7 = 6.'), visual: vz('numberLine', { min: 0, max: 70, step: 7, labelEvery: 1, hops: [{ from: 0, to: 7, label: '+7' }, { from: 7, to: 14, label: '+7' }] }) },
        ],
        tableGen([7])),
      lesson(2, 11, Lg('Bảng nhân 8, bảng chia 8', 'The 8 times table; dividing by 8'),
        Lg('Rô-bốt ISA cùng bạn Lan ngắm những chú bạch tuộc ở thủy cung.', 'ISA the robot and Lan watch the octopuses at the aquarium.'),
        [
          { text: Lg('8 × 3 = 24: mỗi con bạch tuộc có 8 tua, 3 con có 24 tua.', '8 × 3 = 24: each octopus has 8 tentacles, so 3 octopuses have 24 tentacles.'), visual: vz('array', { rows: 3, cols: 8, emoji: '🐙' }) },
          { text: Lg('Từ 8 × 9 = 72 ta có 72 : 8 = 9.', 'From 8 × 9 = 72 we know 72 : 8 = 9.') },
        ],
        tableGen([8])),
      lesson(2, 12, Lg('Bảng nhân 9, bảng chia 9', 'The 9 times table; dividing by 9'),
        Lg('Rô-bốt ISA giúp bác nông dân đếm những luống bắp cải xanh mướt.', 'ISA the robot helps a farmer count the rows of fresh green cabbages.'),
        [
          { text: Lg('9 × 4 = 36: 4 hàng, mỗi hàng 9 cây.', '9 × 4 = 36: 4 rows with 9 cabbages in each row.'), visual: vz('array', { rows: 4, cols: 9, emoji: '🥬' }) },
          { text: Lg('Mẹo: 9 × 6 = 60 − 6 = 54. Từ đó 54 : 9 = 6.', 'Tip: 9 × 6 = 60 − 6 = 54. So 54 : 9 = 6.') },
        ],
        tableGen([9])),

      lesson(2, 13, Lg('Tìm thành phần trong phép nhân, phép chia', 'Finding missing numbers in multiplication and division'),
        Lg('Rô-bốt ISA và bạn Tú giải câu đố tìm số còn thiếu trên bảng lớp.', 'ISA the robot and Tú solve a puzzle to find the missing numbers on the board.'),
        [
          { text: Lg('Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số kia: ? × 4 = 28 thì ? = 28 : 4 = 7.', 'To find a missing factor, divide the product by the other factor: if ? × 4 = 28, then ? = 28 : 4 = 7.'), visual: vz('array', { rows: 4, cols: 7 }) },
          { text: Lg('Muốn tìm số bị chia, lấy thương nhân với số chia. Muốn tìm số chia, lấy số bị chia chia cho thương.', 'To find the dividend, multiply the quotient by the divisor. To find the divisor, divide the dividend by the quotient.') },
        ],
        function (rng, i) {
          const a = R(rng, 2, 9), b = R(rng, 2, lv(i) === 0 ? 5 : 9), p = a * b, f = i % 4;
          if (f === 0) return Q(Lg(`Tìm thừa số chưa biết:\n? × ${b} = ${p}`, `Find the missing factor:\n? × ${b} = ${p}`), vz('array', { rows: b, cols: a }), num(a), Lg('Lấy tích chia cho thừa số đã biết.', 'Divide the product by the factor you know.'), `? = ${p} : ${b} = ${a}.`);
          if (f === 1) return Q(Lg(`Tìm số bị chia:\n? : ${b} = ${a}`, `Find the dividend:\n? : ${b} = ${a}`), null, num(p), Lg('Lấy thương nhân với số chia.', 'Multiply the quotient by the divisor.'), `? = ${a} × ${b} = ${p}.`);
          if (f === 2) return Q(Lg(`Tìm số chia:\n${p} : ? = ${a}`, `Find the divisor:\n${p} : ? = ${a}`), shareV(p, b), num(b), Lg('Lấy số bị chia chia cho thương.', 'Divide the dividend by the quotient.'), `? = ${p} : ${a} = ${b}.`);
          return Q(Lg(`Có ${p} học sinh xếp đều thành các hàng, mỗi hàng ${a} bạn. Hỏi xếp được mấy hàng?`, `${p} pupils line up in equal rows, with ${a} pupils in each row. How many rows are there?`), vz('array', { rows: b, cols: a, emoji: '🧒' }), num(b), Lg(`Lấy ${p} chia cho ${a}.`, `Divide ${p} by ${a}.`), Lg(`${p} : ${a} = ${b} (hàng).`, `${p} : ${a} = ${b} (rows).`));
        }),

      lesson(2, 14, Lg('Một phần mấy', 'Unit fractions'),
        Lg('Rô-bốt ISA chia chiếc bánh chưng thành các phần bằng nhau cho cả nhà bạn Ngọc.', 'ISA the robot cuts a square rice cake (bánh chưng) into equal pieces for Ngọc\'s family.'),
        [
          { text: Lg('Chia hình tròn thành 4 phần bằng nhau, tô màu 1 phần: đã tô màu 1/4 (một phần tư) hình tròn.', 'Split a circle into 4 equal parts and shade 1 part: 1/4 (one quarter) of the circle is shaded.'), visual: vz('fraction', { num: 1, den: 4, shape: 'pie' }) },
          { text: Lg('1/3 của 12 quả cam: chia 12 quả thành 3 phần bằng nhau, mỗi phần 4 quả. 12 : 3 = 4.', '1/3 of 12 oranges: split the 12 oranges into 3 equal groups, with 4 oranges in each group. 12 : 3 = 4.'), visual: vz('share', { total: 12, groups: 3, emoji: '🍊' }) },
        ],
        function (rng, i) {
          const n = R(rng, 2, lv(i) === 0 ? 5 : 9), f = i % 4;
          const fs = d => `1/${d}`;
          if (f === 0) return Q(Lg('Đã tô màu một phần mấy của hình?', 'What fraction of the shape is shaded?'), vz('fraction', { num: 1, den: n, shape: fracShape(rng) }), ch(rng, fs(n), [fs(n + 1), fs(n - 1 > 1 ? n - 1 : n + 2), `${n}/1`, fs(n + 2)]), Lg('Đếm xem hình được chia thành mấy phần bằng nhau.', 'Count how many equal parts the shape is split into.'), Lg(`Hình được chia thành ${n} phần bằng nhau, tô màu 1 phần: 1/${n}.`, `The shape is split into ${n} equal parts and 1 part is shaded: 1/${n}.`));
          if (f === 1) { const q = R(rng, 2, 9), t = q * n; return Q(Lg(`1/${n} của ${t} quả cam là bao nhiêu quả?`, `What is 1/${n} of ${t} oranges?`), shareV(t, n, '🍊'), num(q), Lg(`Chia ${t} thành ${n} phần bằng nhau.`, `Split ${t} into ${n} equal parts.`), Lg(`${t} : ${n} = ${q} (quả).`, `${t} : ${n} = ${q} (oranges).`)); }
          if (f === 2) return Q(Lg(`Em hãy tô màu 1/${n} hình (chạm vào các phần để tô).`, `Shade 1/${n} of the shape (tap the parts to shade them).`), vz('fraction', { num: 0, den: n, shape: fracShape(rng) }), { kind: 'visual', check: v => v === 1 }, Lg(`Hình có ${n} phần bằng nhau, tô 1 phần.`, `The shape has ${n} equal parts. Shade 1 part.`), Lg(`1/${n} nghĩa là 1 trong ${n} phần bằng nhau.`, `1/${n} means 1 of ${n} equal parts.`));
          const q = R(rng, 2, 9), t = q * n, x = nm(rng);
          return Q(Lg(`${x} có ${t} cái kẹo, ${x} cho em 1/${n} số kẹo đó. Hỏi ${x} cho em bao nhiêu cái kẹo?`, `${x} has ${t} sweets and gives 1/${n} of them to a younger child. How many sweets does ${x} give away?`), vz('tape', { bars: [{ label: Lg('Số kẹo', 'Sweets'), parts: n, units: n, value: String(t) }] }), num(q), Lg(`Tìm 1/${n} của ${t}: lấy ${t} : ${n}.`, `Find 1/${n} of ${t}: work out ${t} : ${n}.`), Lg(`${t} : ${n} = ${q} (cái kẹo).`, `${t} : ${n} = ${q} (sweets).`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. LÀM QUEN VỚI HÌNH PHẲNG, HÌNH KHỐI ============
  const RA = Lg('Góc vuông', 'Right angle'), NRA = Lg('Góc không vuông', 'Not a right angle');
  const c3 = {
    id: 'g3-c3', semester: 1, title: Lg('Làm quen với hình phẳng, hình khối', 'Getting to know 2-D and 3-D shapes'), icon: '📐', lessons: [
      lesson(3, 16, Lg('Điểm ở giữa, trung điểm của đoạn thẳng', 'Points in between. The midpoint of a line segment'),
        Lg('Rô-bốt ISA tìm điểm chính giữa sợi dây để bạn Bình treo chiếc đèn ông sao.', 'ISA the robot finds the exact middle of a string so that Bình can hang up a star lantern.'),
        [
          { text: Lg('M là trung điểm của đoạn thẳng AB khi M ở giữa A và B và AM = MB. Đoạn AB dài 8 cm thì AM = MB = 4 cm.', 'M is the midpoint of line segment AB when M is between A and B and AM = MB. If AB is 8 cm long, then AM = MB = 4 cm.'), visual: vz('ruler', { length: 8, unit: 'cm', object: 'ribbon' }) },
          { text: Lg('Muốn tìm độ dài nửa đoạn thẳng, ta lấy độ dài đoạn thẳng chia cho 2.', 'To find half the length of a line segment, divide its length by 2.') },
        ],
        more(function (rng, i) {
          const h = R(rng, 2, lv(i) === 0 ? 6 : 12), L = h * 2, f = i % 4;
          if (f === 0) return Q(Lg(`M là trung điểm của đoạn thẳng AB. Đoạn thẳng AB dài ${L} cm. Đoạn thẳng AM dài bao nhiêu xăng-ti-mét?`, `M is the midpoint of line segment AB. AB is ${L} cm long. How many centimetres long is AM?`), vz('ruler', { length: L, unit: 'cm', object: 'ribbon' }), num(h, 'cm'), Lg('Trung điểm chia đoạn thẳng thành hai phần bằng nhau.', 'The midpoint splits a line segment into two equal parts.'), `${L} : 2 = ${h} (cm).`);
          if (f === 1) return Q(Lg(`O là trung điểm của đoạn thẳng CD. Đoạn OC dài ${h} cm. Đoạn thẳng CD dài bao nhiêu xăng-ti-mét?`, `O is the midpoint of line segment CD. OC is ${h} cm long. How many centimetres long is CD?`), null, num(L, 'cm'), Lg('CD gồm hai đoạn bằng nhau OC và OD.', 'CD is made of two equal parts, OC and OD.'), `${h} × 2 = ${L} (cm).`);
          if (f === 2) return Q(Lg(`Trên tia số, điểm nào là trung điểm của đoạn thẳng nối số 0 và số ${L}? Chạm vào vạch đó.`, `On the number line, which point is the midpoint of the line segment from 0 to ${L}? Tap that mark.`), vz('numberLine', { min: 0, max: L, step: 1, labelEvery: L > 12 ? 2 : 1, marks: [0, L] }), { kind: 'visual', check: v => v === h }, Lg('Trung điểm cách đều hai đầu.', 'The midpoint is the same distance from both ends.'), Lg(`${L} : 2 = ${h}. Trung điểm ứng với số ${h}.`, `${L} : 2 = ${h}. The midpoint is at ${h}.`));
          return Q(Lg('Điểm M là trung điểm của đoạn thẳng AB khi nào?', 'When is point M the midpoint of line segment AB?'), null, ch(rng, Lg('M ở giữa A, B và AM = MB', 'M is between A and B, and AM = MB'), [Lg('M ở giữa A và B', 'M is between A and B'), Lg('AM dài hơn MB', 'AM is longer than MB'), Lg('M nằm ngoài đoạn thẳng AB', 'M is outside line segment AB')]), Lg('Cần đủ hai điều: ở giữa và chia đôi.', 'You need both things: M is in between, and it cuts AB in half.'), Lg('M là trung điểm khi M ở giữa A, B và AM = MB.', 'M is the midpoint when M is between A and B and AM = MB.'));
        }, [
          [0, 5, rng => { const [X, Y, Z] = U.sample(rng, ['A', 'B', 'C', 'D', 'M', 'N', 'O', 'I', 'K', 'P', 'Q', 'E'], 3); return Q(Lg(`Ba điểm ${X}, ${Y}, ${Z} cùng nằm trên một đường thẳng theo thứ tự đó. Điểm nào là điểm ở giữa hai điểm ${X} và ${Z}?`, `Points ${X}, ${Y} and ${Z} lie on a straight line in that order. Which point is between ${X} and ${Z}?`), null, ch(rng, Lg(`Điểm ${Y}`, `Point ${Y}`), [Lg(`Điểm ${X}`, `Point ${X}`), Lg(`Điểm ${Z}`, `Point ${Z}`)]), Lg('Điểm ở giữa nằm giữa hai điểm còn lại.', 'The point in between lies between the other two points.'), Lg(`${Y} nằm giữa ${X} và ${Z} nên ${Y} là điểm ở giữa hai điểm ${X} và ${Z}.`, `${Y} lies between ${X} and ${Z}, so ${Y} is the point between ${X} and ${Z}.`)); }],
          [0, 5, (rng, i) => { const h = R(rng, 2, lv(i) === 0 ? 6 : 15); return Q(Lg(`M là trung điểm của đoạn thẳng AB, đoạn AM dài ${h} cm. Đoạn MB dài bao nhiêu xăng-ti-mét?`, `M is the midpoint of line segment AB, and AM is ${h} cm long. How many centimetres long is MB?`), null, num(h, 'cm'), Lg('Trung điểm chia đoạn thẳng thành hai đoạn bằng nhau: AM = MB.', 'The midpoint splits a line segment into two equal parts: AM = MB.'), `MB = AM = ${h} cm.`); }],
          [3, 9, (rng, i) => { const h = R(rng, 2, lv(i) === 1 ? 9 : 20), L = 2 * h, cl = P(rng, [h, h, L, h + 1, h - 1]); return Q(Lg(`Đúng hay sai?\nM là trung điểm của đoạn thẳng AB dài ${L} cm thì đoạn AM dài ${cl} cm.`, `True or false?\nM is the midpoint of line segment AB, which is ${L} cm long. So AM is ${cl} cm long.`), null, tf(rng, cl === h), Lg('AM bằng một nửa AB.', 'AM is half of AB.'), Lg(`AM = ${L} : 2 = ${h} (cm). ${cl === h ? 'Đúng' : 'Sai'}.`, `AM = ${L} : 2 = ${h} (cm). ${cl === h ? 'True' : 'False'}.`)); }],
          [3, 9, (rng, i) => { const a = R(rng, 0, 10), h = R(rng, 1, lv(i) === 1 ? 4 : 7), b = a + 2 * h; return Q(Lg(`Trên tia số, trung điểm của đoạn thẳng nối số ${a} và số ${b} ứng với số nào?`, `On the number line, which number is at the midpoint of the line segment from ${a} to ${b}?`), vz('numberLine', { min: a, max: b, step: 1, labelEvery: 2 * h, marks: [a, b] }), num(a + h), Lg('Trung điểm cách đều hai đầu đoạn thẳng.', 'The midpoint is the same distance from both ends of the line segment.'), Lg(`Đoạn thẳng dài ${2 * h} vạch; mỗi nửa ${h} vạch: ${a} + ${h} = ${a + h}.`, `The line segment is ${2 * h} steps long, so each half is ${h} ${pl(h, 'step', 'steps')}: ${a} + ${h} = ${a + h}.`)); }],
          [3, 9, (rng, i) => { const h = R(rng, 2, lv(i) === 1 ? 9 : 25), L = 2 * h, x = nm(rng), [it, u, uu, itE, uuE] = P(rng, [['sợi dây', 'cm', 'xăng-ti-mét', 'piece of string', 'centimetres'], ['thanh gỗ', 'dm', 'đề-xi-mét', 'wooden stick', 'decimetres'], ['sợi ruy băng', 'cm', 'xăng-ti-mét', 'ribbon', 'centimetres']]); return Q(Lg(`${x} có một ${it} dài ${L} ${u}. ${x} cắt ${it} đó tại trung điểm. Mỗi đoạn dài bao nhiêu ${uu}?`, `${x} has a ${itE} ${L} ${u} long. ${x} cuts it at its midpoint. How many ${uuE} long is each piece?`), u === 'cm' && L <= 20 ? vz('ruler', { length: L, unit: 'cm', object: 'ribbon' }) : null, num(h, u), Lg('Cắt tại trung điểm thì được hai đoạn bằng nhau.', 'Cutting at the midpoint gives two equal pieces.'), `${L} : 2 = ${h} (${u}).`); }],
          [7, 9, rng => { const k = R(rng, 1, 9); return Q(Lg(`M là trung điểm của đoạn thẳng AB dài ${k} dm. Đoạn AM dài bao nhiêu xăng-ti-mét?`, `M is the midpoint of line segment AB, which is ${k} dm long. How many centimetres long is AM?`), null, num(k * 5, 'cm'), Lg('Đổi ra xăng-ti-mét trước: 1 dm = 10 cm.', 'Change to centimetres first: 1 dm = 10 cm.'), `${k} dm = ${k * 10} cm; ${k * 10} : 2 = ${k * 5} (cm).`); }],
        ])),

      lesson(3, 17, Lg('Hình tròn. Tâm, bán kính, đường kính của hình tròn', 'Circles. The centre, radius and diameter of a circle'),
        Lg('Rô-bốt ISA dùng com-pa vẽ chiếc mặt trăng tròn cho đêm Trung thu cùng bạn Thảo.', 'ISA the robot and Thảo use a pair of compasses to draw a round moon for the Mid-Autumn Festival.'),
        [
          { text: Lg('Hình tròn tâm O. Đoạn thẳng từ tâm đến một điểm trên đường tròn là bán kính.', 'A circle with centre O. A line segment from the centre to a point on the circle is a radius.'), visual: vz('shape', { kind: 'circle', dims: { r: 3 }, showDims: true, label: 'O' }) },
          { text: Lg('Đường kính dài gấp 2 lần bán kính: bán kính 3 cm thì đường kính 6 cm.', 'The diameter is 2 times as long as the radius: if the radius is 3 cm, the diameter is 6 cm.') },
        ],
        function (rng, i) {
          const r = R(rng, 2, lv(i) === 0 ? 5 : 15), f = i % 4;
          if (f === 0) return Q(Lg(`Hình tròn có bán kính ${r} cm. Đường kính dài bao nhiêu xăng-ti-mét?`, `A circle has a radius of ${r} cm. How many centimetres long is its diameter?`), vz('shape', { kind: 'circle', dims: { r }, showDims: true }), num(r * 2, 'cm'), Lg('Đường kính gấp 2 lần bán kính.', 'The diameter is 2 times the radius.'), `${r} × 2 = ${r * 2} (cm).`);
          if (f === 1) return Q(Lg(`Hình tròn có đường kính ${r * 2} cm. Bán kính dài bao nhiêu xăng-ti-mét?`, `A circle has a diameter of ${r * 2} cm. How many centimetres long is its radius?`), vz('shape', { kind: 'circle' }), num(r, 'cm'), Lg('Bán kính bằng một nửa đường kính.', 'The radius is half the diameter.'), `${r * 2} : 2 = ${r} (cm).`);
          if (f === 2) return Q(Lg('Trong một hình tròn, tất cả các bán kính …', 'In a circle, all the radii …'), null, ch(rng, Lg('đều bằng nhau', 'are equal'), [Lg('dài hơn đường kính', 'are longer than the diameter'), Lg('khác nhau', 'are different'), Lg('bằng đường kính', 'are equal to the diameter')]), Lg('Mọi điểm trên đường tròn cách đều tâm.', 'Every point on the circle is the same distance from the centre.'), Lg('Các bán kính của một hình tròn đều bằng nhau.', 'All the radii of a circle are equal.'));
          return Q(Lg(`Muốn vẽ hình tròn có đường kính ${r * 2} cm, em mở com-pa (khẩu độ) bao nhiêu xăng-ti-mét?`, `To draw a circle with a diameter of ${r * 2} cm, how many centimetres wide do you open your compasses?`), vz('shape', { kind: 'circle' }), num(r, 'cm'), Lg('Khẩu độ com-pa bằng bán kính.', 'Open the compasses to the length of the radius.'), Lg(`Bán kính = ${r * 2} : 2 = ${r} (cm).`, `Radius = ${r * 2} : 2 = ${r} (cm).`));
        }),

      lesson(3, 18, Lg('Góc, góc vuông, góc không vuông', 'Angles: right angles and angles that are not right angles'),
        Lg('Rô-bốt ISA dùng ê ke kiểm tra các góc bàn học của bạn Minh.', 'ISA the robot uses a set square to check the corners of Minh\'s desk.'),
        [
          { text: Lg('Đây là góc vuông. Dùng ê ke để kiểm tra góc vuông.', 'This is a right angle. Use a set square to check for a right angle.'), visual: vz('angle', { deg: 90 }) },
          { text: Lg('Góc này không vuông.', 'This angle is not a right angle.'), visual: vz('angle', { deg: 50 }) },
          { text: Lg('Hình chữ nhật và hình vuông đều có 4 góc vuông.', 'Rectangles and squares both have 4 right angles.'), visual: vz('shape', { kind: 'rect' }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const deg = R(rng, 0, 1) ? 90 : P(rng, [40, 60, 120, 135, 70, 110]); return Q(Lg('Góc dưới đây là góc vuông hay góc không vuông?', 'Is the angle below a right angle or not a right angle?'), vz('angle', { deg }), ch(rng, deg === 90 ? RA : NRA, [deg === 90 ? NRA : RA]), Lg('Đặt ê ke vào đỉnh góc để kiểm tra.', 'Put the set square on the vertex of the angle to check.'), deg === 90 ? Lg('Đây là góc vuông.', 'This is a right angle.') : Lg('Đây là góc không vuông.', 'This is not a right angle.')); }
          if (f === 1) { const k = P(rng, ['rect', 'square']); const n = 4; const nmK = { rect: 'Hình chữ nhật', square: 'Hình vuông' }[k], nmE = { rect: 'rectangle', square: 'square' }[k]; return Q(Lg(`${nmK} có mấy góc vuông?`, `How many right angles does a ${nmE} have?`), vz('shape', { kind: k }), num(n), Lg('Dùng ê ke kiểm tra từng góc.', 'Check each angle with a set square.'), Lg(`${nmK} có ${n} góc vuông.`, `A ${nmE} has ${n} right angles.`)); }
          const degs = Array.from({ length: R(rng, 4, 6) }, () => P(rng, [90, 90, 45, 60, 120, 150, 30]));
          if (!degs.includes(90)) degs[0] = 90;
          const c = degs.filter(d => d === 90).length;
          const items = degs.map(d => (d === 90 ? 'rect' : 'circle'));
          return Q(Lg('Mỗi hình chữ nhật có 4 góc vuông, hình tròn không có góc nào. Các hình dưới đây có tất cả bao nhiêu góc vuông?', 'Each rectangle has 4 right angles, and a circle has no angles. How many right angles do the shapes below have altogether?'), vz('shapeSet', { items }), num(c * 4), Lg('Đếm số hình chữ nhật rồi nhân với 4.', 'Count the rectangles, then multiply by 4.'), Lg(`Có ${c} hình chữ nhật: ${c} × 4 = ${c * 4} (góc vuông).`, `${pl(c, 'There is 1 rectangle', `There are ${c} rectangles`)}: ${c} × 4 = ${c * 4} (right angles).`));
        }, [
          [0, 9, rng => {
            const O = P(rng, ['O', 'M', 'I', 'K', 'E', 'H']), [A, B] = U.sample(rng, ['A', 'B', 'C', 'D', 'P', 'Q', 'N', 'G'], 2), deg = P(rng, [90, 90, 50, 120, 70]);
            if (R(rng, 0, 1)) return Q(Lg('Góc dưới đây có đỉnh là điểm nào?', 'Which point is the vertex of the angle below?'), vz('angle', { deg, label: A + O + B }), ch(rng, Lg(`Đỉnh ${O}`, `Vertex ${O}`), [Lg(`Đỉnh ${A}`, `Vertex ${A}`), Lg(`Đỉnh ${B}`, `Vertex ${B}`)]), Lg('Đỉnh góc là điểm chung của hai cạnh.', 'The vertex is the point where the two sides meet.'), Lg(`Góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B}.`, `The angle has vertex ${O} and sides ${O}${A} and ${O}${B}.`));
            return Q(Lg('Hai cạnh của góc dưới đây là:', 'The two sides of the angle below are:'), vz('angle', { deg, label: A + O + B }), ch(rng, Lg(`${O}${A} và ${O}${B}`, `${O}${A} and ${O}${B}`), [Lg(`${A}${B} và ${O}${A}`, `${A}${B} and ${O}${A}`), Lg(`${A}${O} và ${A}${B}`, `${A}${O} and ${A}${B}`), Lg(`${B}${A} và ${B}${O}`, `${B}${A} and ${B}${O}`)]), Lg('Hai cạnh của góc cùng xuất phát từ đỉnh.', 'Both sides of an angle start at the vertex.'), Lg(`Góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B}.`, `The angle has vertex ${O} and sides ${O}${A} and ${O}${B}.`));
          }],
          [3, 9, rng => { const O = P(rng, ['O', 'M', 'I', 'K', 'E', 'H']), [A, B] = U.sample(rng, ['A', 'B', 'C', 'D', 'P', 'Q', 'N', 'G'], 2), deg = P(rng, [90, 90, 90, 40, 60, 80, 100, 120, 140]), ok = deg === 90; return Q(Lg(`Dùng ê ke kiểm tra rồi cho biết: góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B} là góc vuông hay góc không vuông?`, `Check with a set square: is the angle with vertex ${O} and sides ${O}${A} and ${O}${B} a right angle or not a right angle?`), vz('angle', { deg, label: A + O + B }), ch(rng, ok ? RA : NRA, [ok ? NRA : RA]), Lg('Đặt góc vuông của ê ke trùng đỉnh và một cạnh của góc.', 'Line up the right angle of the set square with the vertex and one side of the angle.'), Lg(`Góc đỉnh ${O}, cạnh ${O}${A}, ${O}${B} là ${ok ? 'góc vuông' : 'góc không vuông'}.`, `The angle with vertex ${O} and sides ${O}${A} and ${O}${B} is ${ok ? 'a right angle' : 'not a right angle'}.`)); }],
          [0, 6, rng => { const [k, n, nmK, nmE] = P(rng, [['rect', 4, 'Hình chữ nhật', 'rectangle'], ['square', 4, 'Hình vuông', 'square'], ['rtriangle', 1, 'Hình tam giác', 'triangle'], ['triangle', 0, 'Hình tam giác', 'triangle'], ['quad', 0, 'Hình tứ giác', 'quadrilateral']]); return Q(Lg(`${nmK} dưới đây có mấy góc vuông?`, `How many right angles does the ${nmE} below have?`), vz('shape', { kind: k }), num(n), Lg('Dùng ê ke kiểm tra từng góc của hình.', 'Check each angle of the shape with a set square.'), Lg(`${nmK} này có ${n} góc vuông.`, `This ${nmE} has ${n === 0 ? 'no right angles' : n === 1 ? '1 right angle' : n + ' right angles'}.`)); }],
          [3, 9, rng => { const h = P(rng, [3, 9, 3, 9, 1, 2, 4, 5, 7, 8, 10, 11]), ok = h === 3 || h === 9; return Q(Lg(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc vuông hay góc không vuông?`, `At exactly ${h} o'clock, do the hour hand and the minute hand make a right angle or not a right angle?`), vz('clock', { h, m: 0 }), ch(rng, ok ? RA : NRA, [ok ? NRA : RA]), Lg('Dùng ê ke kiểm tra góc tạo bởi hai kim.', 'Check the angle between the two hands with a set square.'), Lg(`Lúc ${h} giờ hai kim tạo thành ${ok ? 'góc vuông' : 'góc không vuông'}.`, `At ${h} o'clock the two hands make ${ok ? 'a right angle' : 'an angle that is not a right angle'}.`)); }],
          [3, 9, rng => { const [st, ok, stE] = P(rng, [['Hình vuông có 4 góc vuông', true, 'A square has 4 right angles'], ['Hình chữ nhật có 2 góc vuông', false, 'A rectangle has 2 right angles'], ['Hình chữ nhật có 4 góc vuông', true, 'A rectangle has 4 right angles'], ['Ê ke dùng để kiểm tra góc vuông', true, 'A set square is used to check right angles'], ['Hình tròn có 4 góc vuông', false, 'A circle has 4 right angles'], ['Mỗi góc có 3 cạnh', false, 'Every angle has 3 sides'], ['Mỗi góc có một đỉnh và hai cạnh', true, 'Every angle has one vertex and two sides'], ['Hình vuông có 2 góc vuông và 2 góc không vuông', false, 'A square has 2 right angles and 2 angles that are not right angles']]); return Q(Lg(`Đúng hay sai?\n${st}.`, `True or false?\n${stE}.`), null, tf(rng, ok), Lg('Nhớ: góc có một đỉnh, hai cạnh; hình chữ nhật, hình vuông có 4 góc vuông.', 'Remember: an angle has one vertex and two sides; rectangles and squares have 4 right angles.'), Lg(`${ok ? 'Đúng' : 'Sai'}.`, `${ok ? 'True' : 'False'}.`)); }],
          [6, 9, rng => { const r = R(rng, 1, 4), q = R(rng, 1, 3), t = R(rng, 0, 2), items = U.shuffle(rng, [...Array(r).fill('rect'), ...Array(q).fill('square'), ...Array(t).fill('circle')]); return Q(Lg('Các hình chữ nhật và hình vuông dưới đây có tất cả bao nhiêu góc vuông?', 'How many right angles do the rectangles and squares below have altogether?'), vz('shapeSet', { items }), num((r + q) * 4), Lg('Mỗi hình chữ nhật, mỗi hình vuông có 4 góc vuông; hình tròn không có góc.', 'Each rectangle and each square has 4 right angles; a circle has no angles.'), Lg(`Có ${r + q} hình có 4 góc vuông: ${r + q} × 4 = ${(r + q) * 4} (góc vuông).`, `${r + q} shapes have 4 right angles each: ${r + q} × 4 = ${(r + q) * 4} (right angles).`)); }],
        ], 1)),

      lesson(3, 19, Lg('Hình tam giác, hình tứ giác. Hình chữ nhật, hình vuông', 'Triangles and quadrilaterals. Rectangles and squares'),
        Lg('Rô-bốt ISA cùng bạn Hùng tìm các hình trên những viên gạch lát sân trường.', 'ISA the robot and Hùng look for shapes on the tiles of the school yard.'),
        [
          { text: Lg('Hình chữ nhật có 4 góc vuông, 2 chiều dài bằng nhau và 2 chiều rộng bằng nhau.', 'A rectangle has 4 right angles, 2 equal long sides and 2 equal short sides.'), visual: vz('shape', { kind: 'rect', dims: { a: 5, b: 3 }, showDims: true }) },
          { text: Lg('Hình vuông có 4 góc vuông và 4 cạnh dài bằng nhau.', 'A square has 4 right angles and 4 equal sides.'), visual: vz('shape', { kind: 'square', dims: { a: 4 }, showDims: true }) },
          { text: Lg('Hình tam giác có 3 cạnh, 3 đỉnh, 3 góc. Hình tứ giác có 4 cạnh, 4 đỉnh, 4 góc.', 'A triangle has 3 sides, 3 vertices and 3 angles. A quadrilateral has 4 sides, 4 vertices and 4 angles.'), visual: vz('shapeSet', { items: ['triangle', 'quad'] }) },
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
            const [one, many] = { triangle: ['triangle', 'triangles'], rect: ['rectangle', 'rectangles'], square: ['square', 'squares'] }[target];
            return Q(Lg(`Chạm chọn tất cả các ${nmT}.`, `Tap all the ${many}.`), vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) }, target === 'triangle' ? Lg('Hình tam giác có 3 cạnh.', 'A triangle has 3 sides.') : target === 'rect' ? Lg('Hình chữ nhật có 4 góc vuông, hai cặp cạnh đối bằng nhau.', 'A rectangle has 4 right angles, and its opposite sides are equal.') : Lg('Hình vuông có 4 góc vuông và 4 cạnh bằng nhau.', 'A square has 4 right angles and 4 equal sides.'), Lg(`Có ${want.length} ${nmT}.`, `${pl(want.length, `There is 1 ${one}`, `There are ${want.length} ${many}`)}.`));
          }
          if (f === 1) { const a = R(rng, 4, 12), b = R(rng, 2, a - 1); return Q(Lg(`Hình chữ nhật ABCD có AB = ${a} cm, BC = ${b} cm. Cạnh CD dài bao nhiêu xăng-ti-mét?`, `In rectangle ABCD, AB = ${a} cm and BC = ${b} cm. How many centimetres long is side CD?`), vz('shape', { kind: 'rect', dims: { a, b }, showDims: true, label: 'ABCD' }), num(a, 'cm'), Lg('Hai cạnh đối diện của hình chữ nhật bằng nhau.', 'Opposite sides of a rectangle are equal.'), `CD = AB = ${a} cm.`); }
          const qs = [['Hình tam giác có mấy đỉnh?', 3, 'How many vertices does a triangle have?'], ['Hình tứ giác có mấy cạnh?', 4, 'How many sides does a quadrilateral have?'], ['Hình vuông có mấy cạnh bằng nhau?', 4, 'How many equal sides does a square have?'], ['Hình chữ nhật có mấy góc vuông?', 4, 'How many right angles does a rectangle have?']];
          const [p, v, pE] = P(rng, qs);
          return Q(Lg(p, pE), vz('shapeSet', { items: ['triangle', 'quad', 'rect', 'square'] }), num(v), Lg('Đếm trên hình vẽ.', 'Count on the picture.'), Lg(`Đáp án: ${v}.`, `Answer: ${v}.`));
        }),

      lesson(3, 21, Lg('Khối lập phương, khối hộp chữ nhật', 'Cubes and cuboids'),
        Lg('Rô-bốt ISA xếp những hộp quà Tết thành tháp cùng bạn An.', 'ISA the robot and An stack Tết gift boxes into a tower.'),
        [
          { text: Lg('Khối lập phương có 6 mặt là hình vuông bằng nhau, 8 đỉnh, 12 cạnh.', 'A cube has 6 faces that are equal squares, 8 vertices and 12 edges.'), visual: vz('solid', { kind: 'cube' }) },
          { text: Lg('Khối hộp chữ nhật có 6 mặt là hình chữ nhật, 8 đỉnh, 12 cạnh.', 'A cuboid has 6 faces that are rectangles, 8 vertices and 12 edges.'), visual: vz('solid', { kind: 'box' }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          if (f === 0) { const k = P(rng, ['cube', 'box']); const [p, v, pE] = P(rng, [['mấy mặt', 6, 'faces'], ['mấy đỉnh', 8, 'vertices'], ['mấy cạnh', 12, 'edges']]); const nmK = k === 'cube' ? 'Khối lập phương' : 'Khối hộp chữ nhật', nmE = k === 'cube' ? 'cube' : 'cuboid'; return Q(Lg(`${nmK} có ${p}?`, `How many ${pE} does a ${nmE} have?`), vz('solid', { kind: k }), num(v), Lg('Quan sát và đếm, nhớ cả những phần bị che khuất.', 'Look and count. Remember the parts you cannot see.'), Lg(`${nmK} có ${v} ${p.replace('mấy ', '')}.`, `A ${nmE} has ${v} ${pE}.`)); }
          if (f === 1) { const k = P(rng, ['cube', 'box', 'cylinder', 'sphere']); const N = EN ? { cube: 'Cube', box: 'Cuboid', cylinder: 'Cylinder', sphere: 'Sphere' } : { cube: 'Khối lập phương', box: 'Khối hộp chữ nhật', cylinder: 'Khối trụ', sphere: 'Khối cầu' }; return Q(Lg('Đây là khối gì?', 'What is this solid shape?'), vz('solid', { kind: k }), ch(rng, N[k], Object.values(N)), Lg('Khối lập phương có các mặt là hình vuông; khối hộp chữ nhật có các mặt là hình chữ nhật.', 'A cube has square faces; a cuboid has rectangular faces.'), Lg(`Đây là ${N[k].toLowerCase()}.`, `This is a ${N[k].toLowerCase()}.`)); }
          const l = R(rng, 2, 3), w = R(rng, 1, 2), h = R(rng, 1, lv(i) === 2 ? 3 : 2);
          return Q(Lg('Hình dưới đây được xếp bởi bao nhiêu khối lập phương nhỏ?', 'How many small cubes is the shape below made of?'), vz('cubes', { l, w, h }), num(l * w * h), Lg('Đếm số khối ở một tầng rồi nhân với số tầng.', 'Count the cubes in one layer, then multiply by the number of layers.'), Lg(`Mỗi tầng ${l} × ${w} = ${l * w} khối, ${h} tầng: ${l * w} × ${h} = ${l * w * h} (khối).`, `Each layer has ${l} × ${w} = ${l * w} cubes; ${h} ${pl(h, 'layer', 'layers')}: ${l * w} × ${h} = ${l * w * h} (cubes).`));
        }, [
          [0, 9, rng => { const [st, ok, stE] = P(rng, [['Khối lập phương có 6 mặt đều là hình vuông', true, 'A cube has 6 faces, and they are all squares'], ['Khối hộp chữ nhật có 6 mặt', true, 'A cuboid has 6 faces'], ['Khối lập phương có 6 đỉnh', false, 'A cube has 6 vertices'], ['Khối hộp chữ nhật có 12 cạnh', true, 'A cuboid has 12 edges'], ['Khối lập phương có 8 cạnh', false, 'A cube has 8 edges'], ['Khối hộp chữ nhật có 8 đỉnh', true, 'A cuboid has 8 vertices'], ['Khối hộp chữ nhật có 4 mặt', false, 'A cuboid has 4 faces'], ['Khối lập phương có 12 cạnh', true, 'A cube has 12 edges']]); return Q(Lg(`Đúng hay sai?\n${st}.`, `True or false?\n${stE}.`), vz('solid', { kind: /lập phương/.test(st) ? 'cube' : 'box' }), tf(rng, ok), Lg('Khối lập phương và khối hộp chữ nhật đều có 6 mặt, 8 đỉnh, 12 cạnh.', 'Cubes and cuboids both have 6 faces, 8 vertices and 12 edges.'), Lg(`${ok ? 'Đúng' : 'Sai'}. Khối lập phương, khối hộp chữ nhật đều có 6 mặt, 8 đỉnh, 12 cạnh.`, `${ok ? 'True' : 'False'}. Cubes and cuboids both have 6 faces, 8 vertices and 12 edges.`)); }],
          [0, 6, rng => { const cube = R(rng, 0, 1), good = P(rng, cube ? Lg(['Con xúc xắc', 'Khối ru-bích'], ['A dice', 'A puzzle cube']) : Lg(['Viên gạch', 'Bao diêm', 'Hộp bút', 'Quyển sách'], ['A brick', 'A matchbox', 'A pencil case', 'A book'])); const bad = U.sample(rng, cube ? Lg(['Viên gạch', 'Quả bóng', 'Lon nước ngọt', 'Bao diêm', 'Quả cam'], ['A brick', 'A ball', 'A can of fizzy drink', 'A matchbox', 'An orange']) : Lg(['Quả bóng', 'Lon nước ngọt', 'Quả cam', 'Ống hút'], ['A ball', 'A can of fizzy drink', 'An orange', 'A straw']), 3); return Q(Lg(`Đồ vật nào có dạng ${cube ? 'khối lập phương' : 'khối hộp chữ nhật'}?`, `Which object is shaped like a ${cube ? 'cube' : 'cuboid'}?`), vz('solid', { kind: cube ? 'cube' : 'box' }), ch(rng, good, bad), cube ? Lg('Khối lập phương có các mặt là hình vuông bằng nhau.', 'A cube has equal square faces.') : Lg('Khối hộp chữ nhật có các mặt là hình chữ nhật.', 'A cuboid has rectangular faces.'), Lg(`${good} có dạng ${cube ? 'khối lập phương' : 'khối hộp chữ nhật'}.`, `${good} is shaped like a ${cube ? 'cube' : 'cuboid'}.`)); }],
          [3, 9, rng => { const k = R(rng, 2, 9), x = nm(rng), [w, v, wE] = P(rng, [['mặt', 6, 'faces'], ['đỉnh', 8, 'vertices']]), kind = P(rng, ['khối lập phương', 'khối hộp chữ nhật']), kindE = kind === 'khối lập phương' ? 'cubes' : 'cuboids'; return Q(Lg(`${x} có ${k} hộp quà dạng ${kind}. Hỏi ${k} hộp quà đó có tất cả bao nhiêu ${w}?`, `${x} has ${k} gift boxes shaped like ${kindE}. How many ${wE} do the ${k} boxes have altogether?`), vz('solid', { kind: kind === 'khối lập phương' ? 'cube' : 'box' }), num(k * v), Lg(`Mỗi hộp có ${v} ${w}.`, `Each box has ${v} ${wE}.`), Lg(`${v} × ${k} = ${v * k} (${w}).`, `${v} × ${k} = ${v * k} (${wE}).`)); }],
          [6, 9, rng => { const l = R(rng, 2, 3), w = R(rng, 1, 2), h = R(rng, 1, 2); return Q(Lg('Hình dưới đây được xếp bởi các khối lập phương nhỏ. Nếu xếp thêm 1 tầng như thế lên trên thì cần tất cả bao nhiêu khối lập phương nhỏ?', 'The shape below is made of small cubes. If you add 1 more layer like this on top, how many small cubes will you need altogether?'), vz('cubes', { l, w, h }), num(l * w * (h + 1)), Lg('Đếm số khối ở một tầng, rồi nhân với số tầng mới.', 'Count the cubes in one layer, then multiply by the new number of layers.'), Lg(`Mỗi tầng ${l} × ${w} = ${l * w} khối; ${h + 1} tầng: ${l * w} × ${h + 1} = ${l * w * (h + 1)} (khối).`, `Each layer has ${l} × ${w} = ${l * w} cubes; ${h + 1} layers: ${l * w} × ${h + 1} = ${l * w * (h + 1)} (cubes).`)); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 4. PHÉP NHÂN, PHÉP CHIA TRONG PHẠM VI 100 ============
  const c4 = {
    id: 'g3-c4', semester: 1, title: Lg('Phép nhân, phép chia trong phạm vi 100', 'Multiplication and division within 100'), icon: '🧮', lessons: [
      lesson(4, 23, Lg('Nhân số có hai chữ số với số có một chữ số', 'Multiplying a 2-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA giúp cô giáo tính số vở cần phát cho các tổ trong lớp bạn Trang.', 'ISA the robot helps the teacher work out how many exercise books to give to the groups in Trang\'s class.'),
        [
          { text: Lg('23 × 3: 3 nhân 3 bằng 9, viết 9; 3 nhân 2 bằng 6, viết 6. Vậy 23 × 3 = 69.', '23 × 3: 3 times 3 is 9, write 9; 3 times 2 is 6, write 6. So 23 × 3 = 69.'), visual: vz('columnCalc', { a: 23, b: 3, op: '×', reveal: 'all' }) },
          { text: Lg('Có nhớ: 26 × 3: 3 nhân 6 bằng 18, viết 8 nhớ 1; 3 nhân 2 bằng 6, thêm 1 bằng 7. Vậy 26 × 3 = 78.', 'With carrying: 26 × 3: 3 times 6 is 18, write 8 and carry 1; 3 times 2 is 6, add the 1 to make 7. So 26 × 3 = 78.'), visual: vz('columnCalc', { a: 26, b: 3, op: '×', reveal: 'all' }) },
        ],
        colGen('×', (r, L) => pairWhere(r, [11, 49], [2, L === 0 ? 3 : 6], (a, b) => a * b <= 99 && (L === 0 || (a % 10) * b >= 10), [26, 3]))),

      lesson(4, 24, Lg('Gấp một số lên một số lần', 'Making a number several times bigger'),
        Lg('Rô-bốt ISA cùng bạn Việt so sánh số nhãn vở hai anh em có.', 'ISA the robot and Việt compare how many book labels two brothers have.'),
        [
          { text: Lg('Muốn gấp một số lên nhiều lần, ta lấy số đó nhân với số lần. Gấp 4 lên 3 lần: 4 × 3 = 12.', 'To make a number several times bigger, multiply it by the number of times. 4 made three times bigger: 4 × 3 = 12.'), visual: vz('tape', { bars: [{ label: Lg('Em', 'Younger'), parts: 1, units: 1, value: '4' }, { label: Lg('Anh', 'Older'), parts: 3, units: 3, value: '?' }] }) },
        ],
        more(function (rng, i) {
          const a = R(rng, 2, lv(i) === 0 ? 9 : 30), k = R(rng, 2, lv(i) === 0 ? 5 : 9);
          const r = a * k > 99 ? null : a * k;
          const aa = r == null ? R(rng, 2, Math.floor(99 / k)) : a, rr = aa * k, f = i % 3;
          const tape = vz('tape', { bars: [{ label: Lg('Số bé', 'Number'), parts: 1, units: 1, value: String(aa) }, { label: Lg('Gấp lên', 'Times bigger'), parts: k, units: k, value: '?' }] });
          if (f === 0) return Q(Lg(`Gấp ${aa} lên ${k} lần được bao nhiêu?`, `Make ${aa} ${tw(k)} times bigger. What do you get?`), tape, num(rr), Lg(`Lấy ${aa} nhân với ${k}.`, `Multiply ${aa} by ${k}.`), `${aa} × ${k} = ${rr}.`);
          if (f === 1) { const [x, y] = two(rng); return Q(Lg(`${x} có ${aa} viên bi, số bi của ${y} gấp ${k} lần số bi của ${x}. Hỏi ${y} có bao nhiêu viên bi?`, `${x} has ${aa} marbles. ${y} has ${k} times as many marbles as ${x}. How many marbles does ${y} have?`), vz('tape', { bars: [{ label: x, parts: 1, units: 1, value: String(aa) }, { label: y, parts: k, units: k, value: '?' }] }), num(rr), Lg(`Gấp lên ${k} lần thì nhân với ${k}.`, `${k} times as many means multiply by ${k}.`), Lg(`Số bi của ${y} là: ${aa} × ${k} = ${rr} (viên bi).`, `${y} has: ${aa} × ${k} = ${rr} (marbles).`)); }
          return Q(Lg(`Gấp ${aa} lên ${k} lần, rồi thêm ${k}. Kết quả là bao nhiêu?`, `Make ${aa} ${tw(k)} times bigger, then add ${k}. What is the answer?`), tape, ch(rng, rr + k, [aa + k + k, rr, aa * k * 2]), Lg('Gấp lên là nhân, thêm là cộng. Chú ý: "gấp lên" khác "thêm".', 'Making a number times bigger means multiply; adding means plus. Careful: "times bigger" is not the same as "add".'), `${aa} × ${k} = ${rr}; ${rr} + ${k} = ${rr + k}.`);
        }, [
          [0, 6, (rng, i) => {
            const a = R(rng, 2, lv(i) === 0 ? 9 : 15), k = R(rng, 2, Math.min(9, Math.floor(99 / a)));
            const [tx, u, w, txE, wE] = P(rng, [
              [`Đoạn dây xanh dài ${a} cm, đoạn dây đỏ dài gấp ${k} lần đoạn dây xanh. Hỏi đoạn dây đỏ dài bao nhiêu xăng-ti-mét?`, 'cm', 'cm', `The blue string is ${a} cm long. The red string is ${k} times as long as the blue string. How many centimetres long is the red string?`, 'cm'],
              [`Bao gạo nhỏ nặng ${a} kg, bao gạo to nặng gấp ${k} lần bao gạo nhỏ. Hỏi bao gạo to nặng bao nhiêu ki-lô-gam?`, 'kg', 'kg', `The small sack of rice weighs ${a} kg. The big sack weighs ${k} times as much as the small sack. How many kilograms does the big sack weigh?`, 'kg'],
              [`Tổ Một trồng được ${a} cây, số cây tổ Hai trồng được gấp ${k} lần số cây của tổ Một. Hỏi tổ Hai trồng được bao nhiêu cây?`, '', 'cây', `Group One planted ${a} trees. Group Two planted ${k} times as many trees as Group One. How many trees did Group Two plant?`, 'trees'],
              [`Can nhỏ đựng ${a} l nước, can to đựng gấp ${k} lần can nhỏ. Hỏi can to đựng bao nhiêu lít nước?`, 'l', 'l', `The small can holds ${a} l of water. The big can holds ${k} times as much as the small can. How many litres of water does the big can hold?`, 'l']]);
            return Q(Lg(tx, txE), vz('tape', { bars: [{ label: '', parts: 1, units: 1, value: String(a) }, { label: '', parts: k, units: k, value: '?' }] }), u ? num(a * k, u) : num(a * k), Lg(`Gấp lên ${k} lần thì nhân với ${k}.`, `${k} times as much means multiply by ${k}.`), Lg(`${a} × ${k} = ${a * k} (${w}).`, `${a} × ${k} = ${a * k} (${wE}).`));
          }],
          [0, 9, (rng, i) => { const a = R(rng, 2, 9), k = R(rng, 2, lv(i) === 0 ? 5 : 9), r = a * k, cl = P(rng, [r, r, a + k, r + a]); return Q(Lg(`Đúng hay sai?\nGấp ${a} lên ${k} lần được ${cl}.`, `True or false?\n${a} made ${tw(k)} times bigger is ${cl}.`), null, tf(rng, cl === r), Lg('Gấp lên một số lần thì nhân, không phải cộng.', 'To make a number times bigger, multiply. Do not add.'), Lg(`${a} × ${k} = ${r}. ${cl === r ? 'Đúng' : 'Sai'}.`, `${a} × ${k} = ${r}. ${cl === r ? 'True' : 'False'}.`)); }],
          [3, 9, rng => { const a = R(rng, 2, 9), k = R(rng, 2, 9); return Q(Lg(`Gấp ${a} lên ${k} lần, và thêm ${k} vào ${a}. Hai kết quả lần lượt là:`, `Make ${a} ${tw(k)} times bigger, and add ${k} to ${a}. The two answers, in order, are:`), null, ch(rng, Lg(`${a * k} và ${a + k}`, `${a * k} and ${a + k}`), [Lg(`${a + k} và ${a * k}`, `${a + k} and ${a * k}`), Lg(`${a * k} và ${a * k + k}`, `${a * k} and ${a * k + k}`), Lg(`${a * k + k} và ${a + k}`, `${a * k + k} and ${a + k}`)]), Lg('Gấp lên: nhân. Thêm: cộng.', 'Times bigger: multiply. Add: plus.'), `${a} × ${k} = ${a * k}; ${a} + ${k} = ${a + k}.`); }],
          [6, 9, rng => { const k = R(rng, 2, 9), a = R(rng, 2, Math.floor(99 / k)); return Q(Lg(`Một số gấp lên ${k} lần thì được ${a * k}. Tìm số đó.`, `A number made ${k} times bigger is ${a * k}. Find the number.`), vz('tape', { bars: [{ label: Lg('Số đó', 'The number'), parts: 1, units: 1, value: '?' }, { label: Lg('Gấp lên', 'Times bigger'), parts: k, units: k, value: String(a * k) }] }), num(a), Lg(`? × ${k} = ${a * k}: lấy ${a * k} chia cho ${k}.`, `? × ${k} = ${a * k}: divide ${a * k} by ${k}.`), `${a * k} : ${k} = ${a}.`); }],
          [7, 9, rng => { const [x, y] = two(rng), k = R(rng, 2, 5), a = R(rng, 3, Math.floor(80 / (k + 1))); return Q(Lg(`${x} có ${a} nhãn vở, ${y} có số nhãn vở gấp ${k} lần của ${x}. Hỏi cả hai bạn có bao nhiêu nhãn vở?`, `${x} has ${a} book labels. ${y} has ${k} times as many book labels as ${x}. How many book labels do the two friends have altogether?`), vz('tape', { bars: [{ label: x, parts: 1, units: 1, value: String(a) }, { label: y, parts: k, units: k, value: '?' }], total: '?' }), num(a + a * k), Lg(`Bước 1: tìm số nhãn vở của ${y}. Bước 2: cộng số nhãn vở của hai bạn.`, `Step 1: find how many book labels ${y} has. Step 2: add the two friends' book labels together.`), Lg(`${y}: ${a} × ${k} = ${a * k}; cả hai: ${a} + ${a * k} = ${a + a * k} (nhãn vở).`, `${y}: ${a} × ${k} = ${a * k}; both: ${a} + ${a * k} = ${a + a * k} (book labels).`)); }],
        ])),

      lesson(4, 25, Lg('Phép chia hết, phép chia có dư', 'Division with and without a remainder'),
        Lg('Rô-bốt ISA chia kẹo cho các bạn và thấy còn thừa vài cái.', 'ISA the robot shares out sweets between friends and finds a few left over.'),
        [
          { text: Lg('12 : 3 = 4 là phép chia hết (không còn thừa).', '12 : 3 = 4 is a division with no remainder (nothing is left over).'), visual: vz('share', { total: 12, groups: 3, emoji: '🍬' }) },
          { text: Lg('14 : 3 = 4 (dư 2) là phép chia có dư. Số dư bao giờ cũng bé hơn số chia.', '14 : 3 = 4 (remainder 2) is a division with a remainder. The remainder is always smaller than the divisor.'), visual: vz('columnCalc', { a: 14, b: 3, op: ':', reveal: 'all' }) },
        ],
        function (rng, i) {
          const b = R(rng, 2, 9), q = R(rng, 1, 9), r = R(rng, 1, b - 1), a = b * q + r, f = i % 5;
          const fr = (x, y) => Lg(`${x} (dư ${y})`, `${x} (remainder ${y})`);
          if (f === 0) return Q(`${a} : ${b} = ?`, vz('columnCalc', { a, b, op: ':', reveal: 'none' }), ch(rng, fr(q, r), [fr(q + 1, r), fr(q - 1 >= 0 ? q - 1 : q + 2, r + b), fr(q, r + 1 < b ? r + 1 : r - 1 || b - 1)]), Lg('Tìm số lớn nhất trong bảng nhân không vượt quá số bị chia.', 'Find the biggest number in the times table that is not more than the dividend.'), Lg(`${a} : ${b} = ${q} (dư ${r}) vì ${b} × ${q} = ${b * q}, ${a} ${M} ${b * q} = ${r}.`, `${a} : ${b} = ${q} (remainder ${r}) because ${b} × ${q} = ${b * q} and ${a} ${M} ${b * q} = ${r}.`), { hintVisual: vz('columnCalc', { a, b, op: ':', reveal: 'steps' }) });
          if (f === 1) return Q(Lg(`Tìm số dư của phép chia ${a} : ${b}.`, `Find the remainder of ${a} : ${b}.`), vz('columnCalc', { a, b, op: ':', reveal: 'none' }), num(r), `${b} × ${q} = ${b * q}.`, Lg(`${a} : ${b} = ${q} (dư ${r}).`, `${a} : ${b} = ${q} (remainder ${r}).`));
          if (f === 2) { const ex = b * R(rng, 2, 9); const d = [1, 2, 3].map(() => { const bb = R(rng, 2, 9); return [bb * R(rng, 1, 9) + R(rng, 1, bb - 1), bb]; }); return Q(Lg('Phép chia nào là phép chia hết?', 'Which division has no remainder?'), null, ch(rng, `${ex} : ${b}`, d.map(([x, y]) => `${x} : ${y}`)), Lg('Phép chia hết khi số bị chia có trong bảng nhân của số chia.', 'There is no remainder when the dividend is in the times table of the divisor.'), Lg(`${ex} : ${b} = ${ex / b}, không dư.`, `${ex} : ${b} = ${ex / b}, with no remainder.`)); }
          if (f === 3) return Q(Lg(`Trong phép chia có dư với số chia là ${b}, số dư lớn nhất có thể là bao nhiêu?`, `In a division with a divisor of ${b}, what is the biggest possible remainder?`), null, num(b - 1), Lg('Số dư luôn bé hơn số chia.', 'The remainder is always smaller than the divisor.'), Lg(`Số dư lớn nhất là ${b} ${M} 1 = ${b - 1}.`, `The biggest remainder is ${b} ${M} 1 = ${b - 1}.`));
          { // a class of 20–40 pupils, 2–4 to a desk
            const bb = P(rng, [2, 3, 4]), qq = R(rng, Math.ceil(20 / bb), Math.floor(38 / bb)), rr = R(rng, 1, bb - 1), aa = bb * qq + rr;
            return Q(Lg(`Lớp có ${aa} học sinh, mỗi bàn ngồi ${bb} bạn. Cần ít nhất bao nhiêu bàn để tất cả các bạn đều có chỗ ngồi?`, `A class has ${aa} pupils, and ${bb} pupils sit at each desk. What is the smallest number of desks needed so that every pupil has a seat?`), vz('columnCalc', { a: aa, b: bb, op: ':', reveal: 'none' }), num(qq + 1), Lg(`${aa} : ${bb} = ${qq} (dư ${rr}). ${rr} bạn còn lại cũng cần 1 bàn.`, `${aa} : ${bb} = ${qq} (remainder ${rr}). ${pl(rr, 'The 1 pupil left over also needs', `The ${rr} pupils left over also need`)} 1 desk.`), Lg(`${aa} : ${bb} = ${qq} (dư ${rr}); cần ${qq} + 1 = ${qq + 1} (bàn).`, `${aa} : ${bb} = ${qq} (remainder ${rr}); you need ${qq} + 1 = ${qq + 1} (desks).`));
          }
        }),

      lesson(4, 26, Lg('Chia số có hai chữ số cho số có một chữ số', 'Dividing a 2-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA chia đều những quả bưởi vào các giỏ quà Trung thu.', 'ISA the robot shares pomelos equally between the Mid-Autumn gift baskets.'),
        [
          { text: Lg('84 : 4: 8 chia 4 được 2, viết 2; 4 chia 4 được 1, viết 1. Vậy 84 : 4 = 21.', '84 : 4: 8 divided by 4 is 2, write 2; 4 divided by 4 is 1, write 1. So 84 : 4 = 21.'), visual: vz('columnCalc', { a: 84, b: 4, op: ':', reveal: 'all' }) },
          { text: Lg('72 : 3: 7 chia 3 được 2, dư 1; hạ 2 được 12, 12 chia 3 được 4. Vậy 72 : 3 = 24.', '72 : 3: 7 divided by 3 is 2 remainder 1; bring down the 2 to make 12, and 12 divided by 3 is 4. So 72 : 3 = 24.'), visual: vz('columnCalc', { a: 72, b: 3, op: ':', reveal: 'all' }) },
        ],
        colGen(':', (r, L) => pairWhere(r, [20, 99], [2, L === 0 ? 4 : 9], (a, b) => a % b === 0 && a / b >= 10 && (L === 0 || Math.floor(a / 10) % b !== 0), [72, 3]))),

      lesson(4, 27, Lg('Giảm một số đi một số lần', 'Making a number several times smaller'),
        Lg('Rô-bốt ISA giúp mẹ bạn Lan chia nhỏ mớ rau để bán ở chợ quê.', 'ISA the robot helps Lan\'s mum split a big pile of vegetables into small bunches to sell at the village market.'),
        [
          { text: Lg('Muốn giảm một số đi nhiều lần, ta chia số đó cho số lần. Giảm 12 đi 3 lần: 12 : 3 = 4.', 'To make a number several times smaller, divide it by the number of times. 12 made three times smaller: 12 : 3 = 4.'), visual: vz('tape', { bars: [{ label: Lg('Lúc đầu', 'At first'), parts: 3, units: 3, value: '12' }, { label: Lg('Sau khi giảm', 'After'), parts: 1, units: 1, value: '?' }] }) },
          { text: Lg('Chú ý: "giảm đi 3 lần" (chia cho 3) khác "giảm đi 3 đơn vị" (trừ đi 3).', 'Careful: "three times smaller" (divide by 3) is not the same as "take away 3" (subtract 3).') },
        ],
        more(function (rng, i) {
          const k = R(rng, 2, lv(i) === 0 ? 5 : 9), q = R(rng, 2, lv(i) === 0 ? 9 : Math.floor(99 / k)), a = q * k, f = i % 3;
          const tape = vz('tape', { bars: [{ label: Lg('Lúc đầu', 'At first'), parts: k, units: k, value: String(a) }, { label: Lg('Sau khi giảm', 'After'), parts: 1, units: 1, value: '?' }] });
          if (f === 0) return Q(Lg(`Giảm ${a} đi ${k} lần được bao nhiêu?`, `Make ${a} ${tw(k)} times smaller. What do you get?`), tape, num(q), Lg(`Lấy ${a} chia cho ${k}.`, `Divide ${a} by ${k}.`), `${a} : ${k} = ${q}.`);
          if (f === 1) return Q(Lg(`Một cửa hàng có ${a} kg đường. Sau một tuần, số đường giảm đi ${k} lần. Hỏi cửa hàng còn bao nhiêu ki-lô-gam đường?`, `A shop has ${a} kg of sugar. After a week, the amount of sugar is ${k} times smaller. How many kilograms of sugar does the shop have left?`), tape, num(q, 'kg'), Lg(`Giảm đi ${k} lần thì chia cho ${k}.`, `${k} times smaller means divide by ${k}.`), `${a} : ${k} = ${q} (kg).`);
          return Q(Lg(`Số ${a} giảm đi ${k} lần và số ${a} giảm đi ${k} đơn vị. Hai kết quả lần lượt là:`, `Make ${a} ${tw(k)} times smaller, and take ${k} away from ${a}. The two answers, in order, are:`), null, ch(rng, Lg(`${q} và ${a - k}`, `${q} and ${a - k}`), [Lg(`${a - k} và ${q}`, `${a - k} and ${q}`), Lg(`${q} và ${a + k}`, `${q} and ${a + k}`), Lg(`${a * k} và ${a - k}`, `${a * k} and ${a - k}`)]), Lg('Giảm đi nhiều lần: chia. Giảm đi một số đơn vị: trừ.', 'Times smaller: divide. Take away: subtract.'), `${a} : ${k} = ${q}; ${a} ${M} ${k} = ${a - k}.`);
        }, [
          [0, 6, (rng, i) => {
            const k = R(rng, 2, lv(i) === 0 ? 5 : 9), q = R(rng, 2, Math.min(lv(i) === 0 ? 9 : 11, Math.floor(99 / k))), a = q * k;
            const [tx, u, w, txE, wE] = P(rng, [
              [`Sợi dây dài ${a} m. Sau khi cắt, sợi dây ngắn đi ${k} lần. Hỏi sợi dây còn lại dài bao nhiêu mét?`, 'm', 'm', `A rope is ${a} m long. After it is cut, it is ${k} times shorter. How many metres long is the rope now?`, 'm'],
              [`Đàn vịt có ${a} con, số gà bằng số vịt giảm đi ${k} lần. Hỏi có bao nhiêu con gà?`, '', 'con gà', `There are ${a} ducks. The number of chickens is the number of ducks made ${tw(k)} times smaller. How many chickens are there?`, 'chickens'],
              [`Bố mua ${a} kg cam, số ki-lô-gam táo bằng số ki-lô-gam cam giảm đi ${k} lần. Hỏi bố mua bao nhiêu ki-lô-gam táo?`, 'kg', 'kg', `Dad buys ${a} kg of oranges. The weight of apples he buys is the weight of oranges made ${tw(k)} times smaller. How many kilograms of apples does Dad buy?`, 'kg'],
              [`Thùng to có ${a} l nước, số lít nước ở thùng nhỏ bằng số lít nước ở thùng to giảm đi ${k} lần. Hỏi thùng nhỏ có bao nhiêu lít nước?`, 'l', 'l', `The big tank has ${a} l of water. The small tank has the amount in the big tank made ${tw(k)} times smaller. How many litres of water are in the small tank?`, 'l']]);
            return Q(Lg(tx, txE), vz('tape', { bars: [{ label: '', parts: k, units: k, value: String(a) }, { label: '', parts: 1, units: 1, value: '?' }] }), u ? num(q, u) : num(q), Lg(`Giảm đi ${k} lần thì chia cho ${k}.`, `${k} times smaller means divide by ${k}.`), Lg(`${a} : ${k} = ${q} (${w}).`, `${a} : ${k} = ${q} (${wE}).`));
          }],
          [0, 9, (rng, i) => { const k = R(rng, 2, lv(i) === 0 ? 5 : 9), q = R(rng, 2, 9), a = q * k, cl = P(rng, [q, q, a - k, q + 1]); return Q(Lg(`Đúng hay sai?\nGiảm ${a} đi ${k} lần được ${cl}.`, `True or false?\n${a} made ${tw(k)} times smaller is ${cl}.`), null, tf(rng, cl === q), Lg('Giảm đi một số lần thì chia, không phải trừ.', 'To make a number times smaller, divide. Do not subtract.'), Lg(`${a} : ${k} = ${q}. ${cl === q ? 'Đúng' : 'Sai'}.`, `${a} : ${k} = ${q}. ${cl === q ? 'True' : 'False'}.`)); }],
          [3, 9, rng => { const k = R(rng, 2, 9), q = R(rng, 2, 9), a = q * k; return Q(Lg(`So sánh: ${a} giảm đi ${k} lần … ${a} giảm đi ${k} đơn vị`, `Compare: ${a} made ${tw(k)} times smaller … ${a} take away ${k}`), vz('compare', { left: `${a} : ${k}`, right: `${a} ${M} ${k}` }), cmpAns(q, a - k), Lg('Giảm đi nhiều lần: chia. Giảm đi một số đơn vị: trừ.', 'Times smaller: divide. Take away: subtract.'), `${a} : ${k} = ${q}; ${a} ${M} ${k} = ${a - k}; ${q} ${sign(q, a - k)} ${a - k}.`); }],
          [6, 9, rng => { const k = R(rng, 2, 9), q = R(rng, 2, Math.floor(99 / k)), a = q * k; return Q(Lg(`Một số giảm đi ${k} lần thì được ${q}. Tìm số đó.`, `A number made ${k} times smaller is ${q}. Find the number.`), vz('tape', { bars: [{ label: Lg('Số đó', 'The number'), parts: k, units: k, value: '?' }, { label: Lg('Sau khi giảm', 'After'), parts: 1, units: 1, value: String(q) }] }), num(a), Lg(`? : ${k} = ${q}: lấy ${q} nhân với ${k}.`, `? : ${k} = ${q}: multiply ${q} by ${k}.`), `${q} × ${k} = ${a}.`); }],
          [7, 9, rng => { const k = R(rng, 2, 5), q = R(rng, 3, Math.floor(99 / k)), a = q * k, x = nm(rng); return Q(Lg(`${x} có ${a} viên bi. Sau khi cho bạn, số bi của ${x} giảm đi ${k} lần. Hỏi ${x} đã cho bạn bao nhiêu viên bi?`, `${x} has ${a} marbles. After giving some to a friend, ${x}'s number of marbles is ${tw(k)} times smaller. How many marbles did ${x} give to the friend?`), vz('tape', { bars: [{ label: Lg('Lúc đầu', 'At first'), parts: k, units: k, value: String(a) }, { label: Lg('Còn lại', 'Left'), parts: 1, units: 1, value: '?' }] }), num(a - q), Lg(`Bước 1: tìm số bi còn lại (${a} : ${k}). Bước 2: lấy số bi lúc đầu trừ số bi còn lại.`, `Step 1: find how many marbles are left (${a} : ${k}). Step 2: subtract the marbles left from the marbles at first.`), Lg(`Còn lại: ${a} : ${k} = ${q} (viên bi); đã cho: ${a} ${M} ${q} = ${a - q} (viên bi).`, `Left: ${a} : ${k} = ${q} (marbles); given away: ${a} ${M} ${q} = ${a - q} (marbles).`)); }],
        ])),

      lesson(4, 28, Lg('Bài toán giải bằng hai bước tính', 'Two-step word problems'),
        Lg('Rô-bốt ISA cùng bạn Dũng giải bài toán về những thùng nước mắm ở làng chài.', 'ISA the robot and Dũng solve a problem about barrels of fish sauce in a fishing village.'),
        [
          { text: Lg('Thùng thứ nhất có 24 l, thùng thứ hai nhiều hơn 8 l. Bước 1: thùng thứ hai có 24 + 8 = 32 (l). Bước 2: cả hai thùng có 24 + 32 = 56 (l).', 'The first barrel holds 24 l and the second holds 8 l more. Step 1: the second barrel holds 24 + 8 = 32 (l). Step 2: both barrels together hold 24 + 32 = 56 (l).'), visual: vz('tape', { bars: [{ label: Lg('Thùng 1', 'Barrel 1'), units: 6, value: '24 l' }, { label: Lg('Thùng 2', 'Barrel 2'), units: 8, value: '? l' }], diff: '8 l', total: '? l' }) },
          { text: Lg('Đọc kĩ đề, tìm cái chưa biết cần tính trước (bước 1) rồi mới tìm cái đề hỏi (bước 2).', 'Read the problem carefully. First find the unknown you need (step 1), then find what the question asks (step 2).') },
        ],
        function (rng, i) {
          const t = i % 4, x = nm(rng);
          if (t === 0) { const a = R(rng, 12, 40), d = R(rng, 3, 15), b = a + d, s = a + b; return Q(Lg(`Thùng thứ nhất có ${a} l dầu, thùng thứ hai nhiều hơn thùng thứ nhất ${d} l. Hỏi cả hai thùng có bao nhiêu lít dầu?`, `The first barrel has ${a} l of oil. The second barrel has ${d} l more than the first. How many litres of oil do the two barrels have altogether?`), vz('tape', { bars: [{ label: Lg('Thùng 1', 'Barrel 1'), units: units(a, b), value: a + ' l' }, { label: Lg('Thùng 2', 'Barrel 2'), units: units(b, b), value: '?' }], diff: d + ' l', total: '?' }), num(s, 'l'), Lg('Bước 1: tìm số lít dầu ở thùng thứ hai.', 'Step 1: find how many litres of oil are in the second barrel.'), Lg(`Thùng thứ hai: ${a} + ${d} = ${b} (l). Cả hai thùng: ${a} + ${b} = ${s} (l).`, `Second barrel: ${a} + ${d} = ${b} (l). Both barrels: ${a} + ${b} = ${s} (l).`)); }
          if (t === 1) { const per = R(rng, 4, 9), n = R(rng, 3, 9), e = R(rng, 1, per * n - 1); return Q(Lg(`Mỗi hộp có ${per} cái bánh. Mẹ mua ${n} hộp, cả nhà đã ăn ${e} cái bánh. Hỏi còn lại bao nhiêu cái bánh?`, `Each box has ${per} cakes. Mum buys ${n} boxes, and the family eats ${e} ${pl(e, 'cake', 'cakes')}. How many cakes are left?`), vz('tape', { bars: [{ label: Lg('Số bánh', 'Cakes'), parts: n, units: n, value: `${per} × ${n}` }], total: '?' }), num(per * n - e), Lg('Bước 1: tìm số bánh mẹ mua.', 'Step 1: find how many cakes Mum bought.'), Lg(`Số bánh: ${per} × ${n} = ${per * n} (cái). Còn lại: ${per * n} ${M} ${e} = ${per * n - e} (cái).`, `Cakes bought: ${per} × ${n} = ${per * n} (cakes). Left: ${per * n} ${M} ${e} = ${per * n - e} (cakes).`)); }
          if (t === 2) { const a = R(rng, 3, 15), k = R(rng, 2, 5); const y = P(rng, U.NAMES.filter(z => z !== x)); return Q(Lg(`${x} có ${a} quyển truyện. ${y} có số truyện gấp ${k} lần ${x}. Hỏi cả hai bạn có bao nhiêu quyển truyện?`, `${x} has ${a} storybooks. ${y} has ${k} times as many storybooks as ${x}. How many storybooks do the two friends have altogether?`), vz('tape', { bars: [{ label: x, parts: 1, units: 1, value: String(a) }, { label: y, parts: k, units: k, value: '?' }], total: '?' }), num(a + a * k), Lg(`Bước 1: tìm số truyện của ${y}.`, `Step 1: find how many storybooks ${y} has.`), Lg(`${y}: ${a} × ${k} = ${a * k} (quyển). Cả hai: ${a} + ${a * k} = ${a + a * k} (quyển).`, `${y}: ${a} × ${k} = ${a * k} (books). Both: ${a} + ${a * k} = ${a + a * k} (books).`)); }
          const a = R(rng, 50, 99), b = R(rng, 10, 30), c = R(rng, 5, a - b - 5); return Q(Lg(`Một cửa hàng có ${a} kg gạo. Buổi sáng bán được ${b} kg, buổi chiều bán được ${c} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, `A shop has ${a} kg of rice. It sells ${b} kg in the morning and ${c} kg in the afternoon. How many kilograms of rice does the shop have left?`), vz('tape', { bars: [{ label: Lg('Có', 'Had'), units: 12, value: a + ' kg' }, { label: Lg('Đã bán', 'Sold'), units: units(b + c, a), value: `${b} kg + ${c} kg` }], diff: '?' }), num(a - b - c, 'kg'), Lg('Bước 1: tìm số gạo đã bán (hoặc số gạo còn sau buổi sáng).', 'Step 1: find how much rice was sold (or how much was left after the morning).'), Lg(`Đã bán: ${b} + ${c} = ${b + c} (kg). Còn lại: ${a} ${M} ${b + c} = ${a - b - c} (kg).`, `Sold: ${b} + ${c} = ${b + c} (kg). Left: ${a} ${M} ${b + c} = ${a - b - c} (kg).`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 5. MỘT SỐ ĐƠN VỊ ĐO ĐỘ DÀI, KHỐI LƯỢNG, DUNG TÍCH, NHIỆT ĐỘ ============
  function gWeights(g) { const out = []; let x = g; for (const k of [500, 200, 100, 50, 20, 10]) while (x >= k) { out.push({ label: k + ' g', kg: k / 1000 }); x -= k; } return out; }
  const c5 = {
    id: 'g3-c5', semester: 1, title: Lg('Một số đơn vị đo độ dài, khối lượng, dung tích, nhiệt độ', 'Units of length, mass, capacity and temperature'), icon: '🌡️', lessons: [
      lesson(5, 30, Lg('Mi-li-mét', 'Millimetres'),
        Lg('Rô-bốt ISA đo chiếc lá non thật nhỏ trong vườn trường cùng bạn Vy.', 'ISA the robot and Vy measure a tiny new leaf in the school garden.'),
        [
          { text: Lg('Mi-li-mét viết tắt là mm. 1 cm = 10 mm; 1 m = 1000 mm.', 'Millimetre is written mm for short. 1 cm = 10 mm; 1 m = 1000 mm.'), visual: vz('ruler', { length: 3, unit: 'cm', object: 'pencil' }) },
          { text: Lg('Chiếc kẹp giấy dài 35 mm (3 cm 5 mm).', 'The paper clip is 35 mm long (3 cm 5 mm).'), visual: vz('ruler', { length: 35, unit: 'mm', object: 'ribbon' }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const a = R(rng, 1, 9); const [p, v, u] = P(rng, [[`${a} cm = ? mm`, a * 10, 'mm'], [`${a * 10} mm = ? cm`, a, 'cm'], [`${a} m = ? mm`, a * 1000, 'mm'], [`${a} cm ${a} mm = ? mm`, a * 11, 'mm']]); return Q(p, null, num(v, u), Lg('Nhớ: 1 cm = 10 mm; 1 m = 1000 mm.', 'Remember: 1 cm = 10 mm; 1 m = 1000 mm.'), `${p.replace('?', F(v))}.`); }
          if (f === 1) { const L = R(rng, 12, 95); return Q(Lg('Sợi ruy băng dài bao nhiêu mi-li-mét?', 'How many millimetres long is the ribbon?'), vz('ruler', { length: L, unit: 'mm', object: 'ribbon' }), num(L, 'mm'), Lg('Mỗi vạch nhỏ là 1 mm, mỗi vạch có số là 1 cm = 10 mm.', 'Each small mark is 1 mm. From one numbered mark to the next is 1 cm = 10 mm.'), Lg(`Dài ${L} mm.`, `It is ${L} mm long.`)); }
          if (f === 2) { const a = R(rng, 2, 9), mm = a * 10 + P(rng, [-3, 0, 4, 7]); return Q(Lg(`So sánh: ${a} cm … ${mm} mm`, `Compare: ${a} cm … ${mm} mm`), vz('compare', { left: `${a} cm`, right: `${mm} mm` }), cmpAns(a * 10, mm), Lg('Đổi cm ra mm rồi so sánh.', 'Change cm to mm, then compare.'), `${a} cm = ${a * 10} mm; ${a * 10} ${sign(a * 10, mm)} ${mm}.`); }
          const a = R(rng, 15, 60), b = R(rng, 10, 40);
          return Q(Lg(`Con sâu thứ nhất dài ${a} mm, con sâu thứ hai dài ${b} mm. Cả hai con sâu dài bao nhiêu mi-li-mét?`, `The first caterpillar is ${a} mm long and the second caterpillar is ${b} mm long. How many millimetres long are the two caterpillars altogether?`), null, num(a + b, 'mm'), Lg('Cộng hai độ dài.', 'Add the two lengths.'), `${a} + ${b} = ${a + b} (mm).`);
        }),

      lesson(5, 31, Lg('Gam', 'Grams'),
        Lg('Rô-bốt ISA cùng bạn Hà cân bơ và đường để làm bánh bông lan.', 'ISA the robot and Hà weigh butter and sugar to make a sponge cake.'),
        [
          { text: Lg('Gam là đơn vị đo khối lượng, viết tắt là g. 1 kg = 1000 g.', 'The gram is a unit of mass, written g for short. 1 kg = 1000 g.'), visual: vz('scale', { left: [{ label: '🧈', kg: 0.3 }], right: [{ label: '200 g', kg: 0.2 }, { label: '100 g', kg: 0.1 }] }) },
          { text: Lg('Gói bơ nặng 200 g + 100 g = 300 g.', 'The pack of butter weighs 200 g + 100 g = 300 g.') },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const g = R(rng, 2, lv(i) === 0 ? 5 : 9) * 100 + (lv(i) === 2 ? P(rng, [0, 50]) : 0); const it = P(rng, [['🧈', 'Gói bơ', 'the pack of butter'], ['🍎', 'Quả táo', 'the apple'], ['🍞', 'Ổ bánh mì', 'the loaf of bread'], ['🧀', 'Miếng phô mai', 'the piece of cheese']]); return Q(Lg(`Cân thăng bằng. ${it[1]} nặng bao nhiêu gam?`, `The scales balance. How many grams does ${it[2]} weigh?`), vz('scale', { left: [{ label: it[0], kg: g / 1000 }], right: gWeights(g) }), num(g, 'g'), Lg('Cộng các quả cân ở đĩa bên kia.', 'Add up the weights on the other pan.'), `${gWeights(g).map(x => Math.round(x.kg * 1000)).join(' + ')} = ${g} (g).`); }
          if (f === 1) { const a = R(rng, 1, 9); const [p, v, u] = P(rng, [[`${a} kg = ? g`, a * 1000, 'g'], [`${a * 1000} g = ? kg`, a, 'kg'], [`1 kg ${a * 100} g = ? g`, 1000 + a * 100, 'g']]); return Q(p, null, num(v, u), Lg('Nhớ: 1 kg = 1000 g.', 'Remember: 1 kg = 1000 g.'), `${p.replace('?', F(v))}.`); }
          if (f === 2) { const a = R(rng, 1, 9) * 100, b = R(rng, 1, 9) * 100; const FR = EN ? ['The pineapple', 'The pomelo', 'They weigh the same'] : ['Quả dứa', 'Quả bưởi', 'Nặng bằng nhau']; return Q(Lg(`Quả dứa nặng ${a} g, quả bưởi nặng ${b} g. ${a === b ? 'So sánh hai quả' : 'Quả nào nặng hơn'}?`, `The pineapple weighs ${a} g and the pomelo weighs ${b} g. ${a === b ? 'How do the two fruits compare' : 'Which fruit is heavier'}?`), vz('scale', { left: [{ label: '🍍', kg: a / 1000 }], right: [{ label: '🍈', kg: b / 1000 }] }), ch(rng, a > b ? FR[0] : a < b ? FR[1] : FR[2], FR), Lg('So sánh hai số đo khối lượng.', 'Compare the two masses.'), `${a} g ${sign(a, b)} ${b} g.`); }
          const a = R(rng, 2, 6) * 100, b = R(rng, 1, 3) * 100 + 50; return Q(Lg(`Mẹ có ${a + b} g đường, mẹ dùng ${b} g để làm bánh. Hỏi mẹ còn lại bao nhiêu gam đường?`, `Mum has ${a + b} g of sugar. She uses ${b} g to make a cake. How many grams of sugar does Mum have left?`), null, num(a, 'g'), Lg('Bớt đi thì trừ.', 'Taking some away means subtract.'), `${a + b} ${M} ${b} = ${a} (g).`);
        }),

      lesson(5, 32, Lg('Mi-li-lít', 'Millilitres'),
        Lg('Rô-bốt ISA giúp bạn Quân pha nước cam mời cả nhà.', 'ISA the robot helps Quân make orange juice for the whole family.'),
        [
          { text: Lg('Mi-li-lít viết tắt là ml. 1 l = 1000 ml.', 'Millilitre is written ml for short. 1 l = 1000 ml.'), visual: vz('jug', { capacity: 1000, amount: 1000, unit: 'ml' }) },
          { text: Lg('Cốc này chứa 300 ml nước.', 'This one holds 300 ml of water.'), visual: vz('jug', { capacity: 500, amount: 300, unit: 'ml' }) },
        ],
        more(function (rng, i) {
          const f = i % 4;
          if (f === 0) { const cap = P(rng, [500, 1000]), a = R(rng, 1, cap / 100) * 100; return Q(Lg('Trong bình có bao nhiêu mi-li-lít nước?', 'How many millilitres of water are in the jug?'), vz('jug', { capacity: cap, amount: a, unit: 'ml' }), num(a, 'ml'), Lg('Đọc vạch ngang với mặt nước.', 'Read the mark that is level with the top of the water.'), Lg(`Bình có ${a} ml nước.`, `The jug has ${a} ml of water.`)); }
          if (f === 1) { const a = R(rng, 1, 5); const [p, v, u] = P(rng, [[`${a} l = ? ml`, a * 1000, 'ml'], [`${a * 1000} ml = ? l`, a, 'l']]); return Q(p, null, num(v, u), Lg('Nhớ: 1 l = 1000 ml.', 'Remember: 1 l = 1000 ml.'), `${p.replace('?', F(v))}.`); }
          if (f === 2) { const c = R(rng, 2, 5) * 50, n = R(rng, 2, 4); return Q(Lg(`Mỗi cốc chứa ${c} ml sữa. Rót đầy ${n} cốc thì cần bao nhiêu mi-li-lít sữa?`, `Each cup holds ${c} ml of milk. How many millilitres of milk do you need to fill ${n} cups?`), vz('jug', { capacity: 500, amount: c, unit: 'ml' }), num(c * n, 'ml'), Lg('Nhân số mi-li-lít một cốc với số cốc.', 'Multiply the millilitres in one cup by the number of cups.'), `${c} × ${n} = ${c * n} (ml).`); }
          const a = R(rng, 1, 4) * 250, who = nm(rng); return Q(Lg(`Chai nước có 1 l, bạn ${who} đã uống ${a} ml. Trong chai còn lại bao nhiêu mi-li-lít nước?`, `A bottle has 1 l of water. ${who} drinks ${a} ml. How many millilitres of water are left in the bottle?`), vz('jug', { capacity: 1000, amount: 1000, unit: 'ml' }), num(1000 - a, 'ml'), Lg('Đổi 1 l = 1000 ml rồi trừ.', 'Change 1 l to 1000 ml, then subtract.'), `1000 ${M} ${a} = ${1000 - a} (ml).`);
        }, [
          [0, 6, rng => { const a = R(rng, 1, 9) * 50, b = R(rng, 1, 9) * 50, sub = R(rng, 0, 1) === 1 && a !== b; const x = sub ? Math.max(a, b) : a, y = sub ? Math.min(a, b) : b, r = sub ? x - y : x + y; return Q(`${x} ml ${sub ? M : '+'} ${y} ml = ?`, null, num(r, 'ml'), Lg(`${sub ? 'Trừ' : 'Cộng'} các số rồi ghi đơn vị ml.`, `${sub ? 'Subtract' : 'Add'} the numbers, then write the unit ml.`), `${x} ml ${sub ? M : '+'} ${y} ml = ${r} ml.`); }],
          [0, 9, rng => { const [t, u, tE] = P(rng, [['Một thìa nước khoảng 5', 'ml', 'A spoonful of water is about 5'], ['Một xô nước khoảng 10', 'l', 'A bucket of water holds about 10'], ['Một lọ thuốc nhỏ mắt khoảng 10', 'ml', 'A small bottle of eye drops holds about 10'], ['Một can nước mắm khoảng 5', 'l', 'A can of fish sauce holds about 5'], ['Một cốc sữa khoảng 200', 'ml', 'A glass of milk is about 200'], ['Một bể cá nhỏ khoảng 30', 'l', 'A small fish tank holds about 30'], ['Một chai nước khoáng nhỏ khoảng 500', 'ml', 'A small bottle of mineral water holds about 500']]); return Q(Lg(`Chọn đơn vị thích hợp:\n${t} …`, `Choose the right unit:\n${tE} …`), null, ch(rng, u, [u === 'ml' ? 'l' : 'ml']), Lg('Lượng nước ít thì đo bằng ml, nhiều thì đo bằng l.', 'Small amounts of liquid are measured in ml, and large amounts in l.'), Lg(`${t} ${u}.`, `${tE} ${u}.`)); }],
          [3, 9, rng => { const a = R(rng, 1, 3), b = a * 1000 + P(rng, [-200, -100, 0, 100, 300]); return Q(Lg(`So sánh: ${a} l … ${F(b)} ml`, `Compare: ${a} l … ${F(b)} ml`), vz('compare', { left: `${a} l`, right: `${F(b)} ml` }), cmpAns(a * 1000, b), Lg('Đổi lít ra mi-li-lít: 1 l = 1000 ml.', 'Change litres to millilitres: 1 l = 1000 ml.'), `${a} l = ${a * 1000} ml; ${a * 1000} ${sign(a * 1000, b)} ${F(b)}.`); }],
          [3, 9, rng => { const a = R(rng, 2, 6) * 100, b = R(rng, 1, 4) * 100; return Q(Lg(`Bình thứ nhất có ${a} ml nước, bình thứ hai có ${b} ml nước. Hỏi cả hai bình có bao nhiêu mi-li-lít nước?`, `The first jug has ${a} ml of water and the second jug has ${b} ml of water. How many millilitres of water are in the two jugs altogether?`), vz('jug', { capacity: 1000, amount: a, unit: 'ml' }), num(a + b, 'ml'), Lg('Cộng số mi-li-lít của hai bình.', 'Add the millilitres in the two jugs.'), `${a} + ${b} = ${a + b} (ml).`); }],
          [6, 9, rng => { const c = P(rng, [100, 150, 200, 250]), n = R(rng, 2, Math.floor(1000 / c) - 1), x = nm(rng); return Q(Lg(`Bình có 1 l nước. ${x} rót ra ${n} cốc, mỗi cốc ${c} ml. Hỏi trong bình còn lại bao nhiêu mi-li-lít nước?`, `A jug has 1 l of water. ${x} pours out ${n} cups, with ${c} ml in each cup. How many millilitres of water are left in the jug?`), vz('jug', { capacity: 1000, amount: 1000, unit: 'ml' }), num(1000 - c * n, 'ml'), Lg('Bước 1: tính lượng nước đã rót ra. Bước 2: đổi 1 l = 1000 ml rồi trừ.', 'Step 1: work out how much water was poured out. Step 2: change 1 l to 1000 ml, then subtract.'), Lg(`Đã rót: ${c} × ${n} = ${c * n} (ml). Còn lại: 1000 ${M} ${c * n} = ${1000 - c * n} (ml).`, `Poured out: ${c} × ${n} = ${c * n} (ml). Left: 1000 ${M} ${c * n} = ${1000 - c * n} (ml).`)); }],
        ])),

      lesson(5, 33, Lg('Nhiệt độ. Đơn vị đo nhiệt độ', 'Temperature. Units of temperature'),
        Lg('Rô-bốt ISA cùng bạn Nam đo nhiệt độ ngoài sân vào một buổi sáng mùa đông.', 'ISA the robot and Nam measure the temperature outside on a winter morning.'),
        [
          { text: Lg('Nhiệt độ được đo bằng nhiệt kế, đơn vị là độ C (°C). Nhiệt kế này chỉ 25 °C.', 'Temperature is measured with a thermometer, in degrees Celsius (°C). This thermometer shows 25 °C.'), visual: vz('thermometer', { value: 25, min: 0, max: 50 }) },
          { text: Lg('Nhiệt độ cơ thể người khỏe mạnh khoảng 37 °C. Nước đá đang tan ở 0 °C.', 'The body temperature of a healthy person is about 37 °C. Melting ice is at 0 °C.'), visual: vz('thermometer', { value: 37, min: 0, max: 50 }) },
        ],
        function (rng, i) {
          const f = i % 4;
          if (f === 0) { const v = R(rng, lv(i) === 0 ? 2 : 1, lv(i) === 0 ? 9 : 45) * (lv(i) === 0 ? 5 : 1); return Q(Lg('Nhiệt kế chỉ bao nhiêu độ C?', 'How many degrees Celsius does the thermometer show?'), vz('thermometer', { value: v, min: 0, max: 50 }), num(v, '°C'), Lg('Đọc số ở vạch ngang với đỉnh cột chất lỏng.', 'Read the number at the mark that is level with the top of the liquid.'), Lg(`Nhiệt kế chỉ ${v} °C.`, `The thermometer shows ${v} °C.`)); }
          if (f === 1) { const a = R(rng, 15, 25), d = R(rng, 3, 10); return Q(Lg(`Buổi sáng nhiệt độ là ${a} °C, đến trưa nhiệt độ tăng thêm ${d} °C. Hỏi buổi trưa nhiệt độ là bao nhiêu?`, `In the morning the temperature is ${a} °C. By midday it has gone up by ${d} °C. What is the temperature at midday?`), vz('thermometer', { value: a, min: 0, max: 50 }), num(a + d, '°C'), Lg('Tăng thêm thì cộng.', 'Going up means add.'), `${a} + ${d} = ${a + d} (°C).`); }
          if (f === 2) { const [p, c, d, pE] = P(rng, [['Nhiệt độ cơ thể người khỏe mạnh khoảng', '37 °C', ['17 °C', '73 °C', '0 °C'], 'The body temperature of a healthy person is about'], ['Nước đá đang tan có nhiệt độ', '0 °C', ['37 °C', '100 °C', '10 °C'], 'The temperature of melting ice is'], ['Một ngày hè nóng ở Hà Nội có thể lên tới', '38 °C', ['8 °C', '83 °C', '0 °C'], 'On a hot summer day in Hà Nội, the temperature can reach']]); return Q(Lg(`${p} …`, `${pE} …`), null, ch(rng, c, d), Lg('Nhớ lại những nhiệt độ quen thuộc.', 'Think of temperatures you know.'), Lg(`${p} ${c}.`, `${pE} ${c}.`)); }
          const a = R(rng, 15, 35), b = R(rng, 15, 35); return Q(Lg(`Hà Nội: ${a} °C, Đà Lạt: ${b} °C. So sánh nhiệt độ: ${a} °C … ${b} °C`, `Hà Nội: ${a} °C, Đà Lạt: ${b} °C. Compare the temperatures: ${a} °C … ${b} °C`), vz('thermometer', { value: Math.max(a, b), min: 0, max: 50 }), cmpAns(a, b), Lg('So sánh hai số đo.', 'Compare the two measurements.'), `${a} °C ${sign(a, b)} ${b} °C.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. PHÉP NHÂN, PHÉP CHIA TRONG PHẠM VI 1000 ============
  const RULE_AS = Lg('Biểu thức chỉ có cộng, trừ: tính từ trái sang phải.', 'The expression has only + and − signs, so work from left to right.');
  const RULE_MD = Lg('Nhân, chia trước; cộng, trừ sau.', 'Do × and : first, then + and −.');
  const RULE_BR = Lg('Có dấu ngoặc: tính trong ngoặc trước.', 'There are brackets: work out the brackets first.');
  const RULE_MO = Lg('Biểu thức chỉ có nhân, chia: tính từ trái sang phải.', 'The expression has only × and : signs, so work from left to right.');
  function exprGen(rng, L) {
    const t = R(rng, 0, L === 0 ? 2 : 5);
    if (t === 0) { const a = R(rng, 100, 500), b = R(rng, 10, 300), c = R(rng, 10, a + b - 1); return { s: `${a} + ${b} ${M} ${c}`, v: a + b - c, w: a + b + c, how: `${a} + ${b} = ${a + b}; ${a + b} ${M} ${c} = ${a + b - c}`, rule: RULE_AS }; }
    if (t === 1) { const a = R(rng, 10, 200), b = R(rng, 2, 9), c = R(rng, 2, 9); return { s: `${a} + ${b} × ${c}`, v: a + b * c, w: (a + b) * c, how: `${b} × ${c} = ${b * c}; ${a} + ${b * c} = ${a + b * c}`, rule: RULE_MD }; }
    if (t === 2) { const c = R(rng, 2, 9), q = R(rng, 2, 20), b = c * q, a = R(rng, b, 500); return { s: `${a} ${M} ${b} : ${c}`, v: a - q, w: a - b >= 0 && (a - b) % c === 0 ? (a - b) / c : a - b, how: `${b} : ${c} = ${q}; ${a} ${M} ${q} = ${a - q}`, rule: RULE_MD }; }
    if (t === 3) { const a = R(rng, 10, 60), b = R(rng, 5, 40), c = R(rng, 2, 9); return { s: `(${a} + ${b}) × ${c}`, v: (a + b) * c, w: a + b * c, how: `${a} + ${b} = ${a + b}; ${a + b} × ${c} = ${(a + b) * c}`, rule: RULE_BR }; }
    if (t === 4) { const c = R(rng, 2, 9), q = R(rng, 5, 50), d = c * q, b = R(rng, 10, 200), a = d + b; return { s: `(${a} ${M} ${b}) : ${c}`, v: q, w: b % c === 0 ? a - b / c : q + 1, how: `${a} ${M} ${b} = ${d}; ${d} : ${c} = ${q}`, rule: RULE_BR }; }
    const a = R(rng, 2, 9), b = R(rng, 10, 90), c = R(rng, 2, 9); return { s: `${b * c} : ${c} × ${a}`, v: b * a, w: b * c + a, how: `${b * c} : ${c} = ${b}; ${b} × ${a} = ${b * a}`, rule: RULE_MO };
  }
  const c6 = {
    id: 'g3-c6', semester: 1, title: Lg('Phép nhân, phép chia trong phạm vi 1000', 'Multiplication and division within 1000'), icon: '➗', lessons: [
      lesson(6, 36, Lg('Nhân số có ba chữ số với số có một chữ số', 'Multiplying a 3-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA giúp bác thủ kho đếm số viên gạch xếp trên các xe.', 'ISA the robot helps the storekeeper count the bricks stacked on the lorries.'),
        [
          { text: Lg('123 × 3: 3 × 3 = 9; 3 × 2 = 6; 3 × 1 = 3. Vậy 123 × 3 = 369.', '123 × 3: 3 × 3 = 9; 3 × 2 = 6; 3 × 1 = 3. So 123 × 3 = 369.'), visual: vz('columnCalc', { a: 123, b: 3, op: '×', reveal: 'all' }) },
          { text: Lg('218 × 4: 4 × 8 = 32, viết 2 nhớ 3; 4 × 1 = 4, thêm 3 là 7; 4 × 2 = 8. Vậy 218 × 4 = 872.', '218 × 4: 4 × 8 = 32, write 2 and carry 3; 4 × 1 = 4, add the 3 to make 7; 4 × 2 = 8. So 218 × 4 = 872.'), visual: vz('columnCalc', { a: 218, b: 4, op: '×', reveal: 'all' }) },
        ],
        colGen('×', (r, L) => pairWhere(r, [101, 450], [2, L === 0 ? 3 : 9], (a, b) => a * b <= 999 && (L === 0 || wrongMul(a, b) !== a * b), [218, 4]))),
      lesson(6, 37, Lg('Chia số có ba chữ số cho số có một chữ số', 'Dividing a 3-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA chia đều những bao lúa mới gặt vào các kho.', 'ISA the robot shares the newly harvested sacks of rice equally between the storehouses.'),
        [
          { text: Lg('639 : 3: 6 : 3 = 2; 3 : 3 = 1; 9 : 3 = 3. Vậy 639 : 3 = 213.', '639 : 3: 6 : 3 = 2; 3 : 3 = 1; 9 : 3 = 3. So 639 : 3 = 213.'), visual: vz('columnCalc', { a: 639, b: 3, op: ':', reveal: 'all' }) },
          { text: Lg('256 : 4: 2 không chia được cho 4, lấy 25 : 4 = 6 dư 1; hạ 6 được 16, 16 : 4 = 4. Vậy 256 : 4 = 64.', '256 : 4: 2 cannot be divided by 4, so take 25 : 4 = 6 remainder 1; bring down the 6 to make 16, and 16 : 4 = 4. So 256 : 4 = 64.'), visual: vz('columnCalc', { a: 256, b: 4, op: ':', reveal: 'all' }) },
        ],
        colGen(':', (r, L) => pairWhere(r, [100, 999], [2, L === 0 ? 3 : 9], (a, b) => a % b === 0 && (L < 2 || a / b < 100 || String(a / b).includes('0')), [256, 4]))),

      lesson(6, 38, Lg('Biểu thức số. Tính giá trị của biểu thức số', 'Number expressions. Working out the value of an expression'),
        Lg('Rô-bốt ISA và bạn Chi thi xem ai tính đúng thứ tự các phép tính.', 'ISA the robot and Chi have a contest to see who can do the calculations in the right order.'),
        [
          { text: Lg('Biểu thức chỉ có cộng, trừ (hoặc chỉ có nhân, chia): tính từ trái sang phải. 60 + 20 − 5 = 80 − 5 = 75.', 'If an expression has only + and − (or only × and :), work from left to right. 60 + 20 − 5 = 80 − 5 = 75.') },
          { text: Lg('Có cả cộng, trừ, nhân, chia: nhân, chia trước; cộng, trừ sau. 40 + 5 × 3 = 40 + 15 = 55.', 'If it has +, −, × and :, do × and : first, then + and −. 40 + 5 × 3 = 40 + 15 = 55.') },
          { text: Lg('Có dấu ngoặc ( ): tính trong ngoặc trước. (40 + 5) × 3 = 45 × 3 = 135.', 'If it has brackets ( ), work out the brackets first. (40 + 5) × 3 = 45 × 3 = 135.') },
        ],
        function (rng, i) {
          const e = exprGen(rng, lv(i)), f = i % 3;
          if (f === 0) return Q(Lg(`Tính giá trị của biểu thức:\n${e.s}`, `Work out the value of the expression:\n${e.s}`), null, num(e.v), e.rule, `${e.s} = ${e.v} (${e.how}).`);
          if (f === 1) return Q(Lg(`Giá trị của biểu thức ${e.s} là:`, `The value of the expression ${e.s} is:`), null, ch(rng, e.v, [e.w, e.v + 10, e.v - 1].filter(x => x >= 0)), e.rule, `${e.how}.`);
          const c = Math.max(0, e.v + P(rng, [-5, 0, 3]));
          return Q(Lg(`So sánh: ${e.s} … ${c}`, `Compare: ${e.s} … ${c}`), vz('compare', { left: e.s, right: String(c) }), cmpAns(e.v, c), e.rule, `${e.s} = ${e.v}; ${e.v} ${sign(e.v, c)} ${c}.`);
        }),

      lesson(6, 39, Lg('So sánh số lớn gấp mấy lần số bé', 'How many times bigger is the larger number?'),
        Lg('Rô-bốt ISA so sánh chiều cao của cây bàng và cây cau trong sân trường.', 'ISA the robot compares the heights of the almond tree and the areca palm in the school yard.'),
        [
          { text: Lg('Muốn biết số lớn gấp mấy lần số bé, ta lấy số lớn chia cho số bé. 12 gấp 3 lần 4 vì 12 : 4 = 3.', 'To find how many times bigger the larger number is than the smaller number, divide the larger number by the smaller number. 12 is 3 times 4 because 12 : 4 = 3.'), visual: vz('tape', { bars: [{ label: Lg('Số lớn', 'Larger'), parts: 3, units: 3, value: '12' }, { label: Lg('Số bé', 'Smaller'), parts: 1, units: 1, value: '4' }] }) },
        ],
        function (rng, i) {
          const b = R(rng, 2, 9), k = R(rng, 2, 9), a = b * k, f = i % 3;   // lớp 3: chia cho số có một chữ số
          const tape = vz('tape', { bars: [{ label: Lg('Số lớn', 'Larger'), parts: k, units: k, value: String(a) }, { label: Lg('Số bé', 'Smaller'), parts: 1, units: 1, value: String(b) }] });
          if (f === 0) return Q(Lg(`${a} gấp mấy lần ${b}?`, `How many times bigger than ${b} is ${a}?`), tape, num(k), Lg('Lấy số lớn chia cho số bé.', 'Divide the larger number by the smaller number.'), Lg(`${a} : ${b} = ${k}. Vậy ${a} gấp ${k} lần ${b}.`, `${a} : ${b} = ${k}. So ${a} is ${k} times ${b}.`));
          if (f === 1) {
            const t = P(rng, [
              [`Đàn gà có ${a} con, đàn vịt có ${b} con. Hỏi số gà gấp mấy lần số vịt?`, `There are ${a} chickens and ${b} ducks. How many times as many chickens as ducks are there?`],
              [`Sợi dây đỏ dài ${a} cm, sợi dây xanh dài ${b} cm. Hỏi sợi dây đỏ dài gấp mấy lần sợi dây xanh?`, `The red string is ${a} cm long and the blue string is ${b} cm long. How many times as long as the blue string is the red string?`],
              [`Thùng to chứa ${a} l nước, can nhỏ chứa ${b} l nước. Hỏi thùng to chứa gấp mấy lần can nhỏ?`, `The big tank holds ${a} l of water and the small can holds ${b} l of water. How many times as much as the small can does the big tank hold?`],
            ]);
            return Q(Lg(t[0], t[1]), tape, num(k), Lg('Lấy số lớn chia cho số bé.', 'Divide the larger number by the smaller number.'), Lg(`${a} : ${b} = ${k} (lần).`, `${a} : ${b} = ${k} (times).`));
          }
          // "gấp mấy lần" (chia) against "hơn bao nhiêu" (trừ), the usual mix-up
          const wrong = [a - b, k + 1, k > 2 ? k - 1 : k + 2].filter((x, j, arr) => x !== k && arr.indexOf(x) === j);
          return Q(Lg(`Số lớn là ${a}, số bé là ${b}. Số lớn gấp mấy lần số bé?`, `The larger number is ${a} and the smaller number is ${b}. How many times bigger than the smaller number is the larger number?`), tape, ch(rng, Lg(`${k} lần`, `${k} times`), wrong.map(x => Lg(`${x} lần`, `${x} times`))), Lg('Lấy số lớn chia cho số bé (không phải trừ).', 'Divide the larger number by the smaller number (do not subtract).'), Lg(`${a} : ${b} = ${k}. Vậy ${a} gấp ${k} lần ${b}.`, `${a} : ${b} = ${k}. So ${a} is ${k} times ${b}.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. CÁC SỐ ĐẾN 10 000 ============
  const PV4 = EN ? ['Thousands', 'Hundreds', 'Tens', 'Ones'] : ['Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  const PV5 = EN ? ['Ten thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones'] : ['Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  const plc = c => (EN ? c : 'Hàng ' + c.toLowerCase()); // "Hàng trăm" / "Hundreds" (answer option)
  function numberLessonGen(lo, hi, cols) {
    return function (rng, i) {
      const n = R(rng, lo, hi), f = i % 5, d = String(n).split('').map(Number);
      if (f === 0) return Q(Lg(`Số "${readVN(n)}" viết là:`, `Write "${rd(n)}" in digits:`), null, num(n), Lg('Viết lần lượt từ hàng cao nhất.', 'Write the digits in order, starting from the highest place.'), Lg(`"${readVN(n)}" viết là ${F(n)}.`, `"${rd(n)}" is written ${F(n)}.`));
      if (f === 1) { const sw = Number(String(n).split('').reverse().join('')); return Q(Lg(`Số ${F(n)} đọc là:`, `How do you read ${F(n)}?`), null, ch(rng, rd(n), [rd(n + Math.pow(10, R(rng, 0, 2)) <= hi ? n + Math.pow(10, R(rng, 0, 2)) : n - 10), rd(sw >= lo && sw <= hi ? sw : n - 1), rd(n + 1000 <= hi ? n + 1000 : n - 1000)]), Lg('Đọc theo từng lớp, từ trái sang phải.', 'Read from left to right: first the thousands, then the rest of the number.'), Lg(`${F(n)} đọc là "${readVN(n)}".`, `${F(n)} is read "${rd(n)}".`)); }
      if (f === 2) { const once = d.map((x, j) => j).filter(j => d.filter(x => x === d[j]).length === 1); if (!once.length) return numberLessonGen(lo, hi, cols)(rng, i); const pl = P(rng, once); return Q(Lg(`Trong số ${F(n)}, chữ số ${d[pl]} thuộc hàng nào?`, `In ${F(n)}, which place is the digit ${d[pl]} in?`), vz('placeValue', { number: n, columns: cols }), ch(rng, plc(cols[pl]), cols.filter((_, j) => j !== pl).map(plc)), Lg('Đếm từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn.', 'Count from right to left: ones, tens, hundreds, thousands, ten thousands.'), Lg(`Chữ số ${d[pl]} thuộc hàng ${cols[pl].toLowerCase()}.`, `The digit ${d[pl]} is in the ${cols[pl].toLowerCase()} place.`)); }
      if (f === 3) { const e = expand(n); return Q(Lg(`Viết số ${F(n)} thành tổng:`, `Write ${F(n)} as a sum:`), vz('placeValue', { number: n, columns: cols }), ch(rng, e.map(F).join(' + '), [e.map((x, j) => F(j === e.length - 1 ? x * 10 : x)).join(" + "), expand(n + 100 <= hi ? n + 100 : n - 100).map(F).join(' + '), d.filter(x => x).join(' + ')]), Lg('Mỗi chữ số nhân với giá trị hàng của nó.', 'Multiply each digit by the value of its place.'), `${F(n)} = ${e.map(F).join(' + ')}.`); }
      const step = cols.length === 4 ? 1000 : 10000, a0 = Math.floor(n / step) * step;
      const sub = step / 10, u = a0 + R(rng, 1, 9) * sub;
      return Q(Lg('Số thích hợp ở ô ? trên tia số là:', 'Which number goes in the box ? on the number line?'), vz('numberLine', { min: a0, max: a0 + step, step: sub, labelEvery: 5, unknown: u }), num(u), Lg(`Mỗi vạch cách nhau ${F(sub)}.`, `The marks go up in steps of ${F(sub)}.`), Lg(`Số cần điền là ${F(u)}.`, `The missing number is ${F(u)}.`));
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
        return Q(Lg(`So sánh: ${F(a)} … ${F(b)}`, `Compare: ${F(a)} … ${F(b)}`), vz('compare', { left: F(a), right: F(b) }), cmpAns(a, b), Lg('Số nào nhiều chữ số hơn thì lớn hơn. Cùng số chữ số thì so sánh từng hàng từ trái sang phải.', 'The number with more digits is bigger. If both have the same number of digits, compare place by place from left to right.'), `${F(a)} ${sign(a, b)} ${F(b)}.`);
      }
      const base = R(rng, lo, hi - 999);
      const arr = U.sample(rng, Array.from({ length: 999 }, (_, k) => base + k), 4);
      if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...arr) : Math.min(...arr); return Q(Lg(`Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số ${arr.map(F).join('; ')} là:`, `The ${big ? 'largest' : 'smallest'} of the numbers ${arr.map(F).join('; ')} is:`), null, ch(rng, F(v), arr.map(F)), Lg('So sánh từng hàng từ trái sang phải.', 'Compare place by place from left to right.'), Lg(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${F(v)}.`, `The ${big ? 'largest' : 'smallest'} number is ${F(v)}.`)); }
      const asc = arr.slice().sort((x, y) => x - y), s = a => a.map(F).join(', ');
      return Q(Lg(`Sắp xếp các số ${arr.map(F).join('; ')} theo thứ tự từ bé đến lớn:`, `Put the numbers ${arr.map(F).join('; ')} in order from smallest to largest:`), null, ch(rng, s(asc), [s(asc.slice().reverse()), s(arr), s([asc[1], asc[0], asc[2], asc[3]])]), Lg('Tìm số bé nhất trước, rồi số bé tiếp theo.', 'Find the smallest number first, then the next smallest.'), `${s(asc)}.`);
    };
  }
  function roundGen(places, maxN) { // places: [[10, "hàng chục" / "ten"], ...]
    return function (rng, i) {
      const [p, name] = P(rng, places);
      const n = R(rng, p + 1, maxN), r = roundTo(n, p), f = i % 3;
      if (n % p === 0) return Q(Lg(`Làm tròn số ${F(n)} đến ${name} ta được số nào?`, `Round ${F(n)} to the nearest ${name}. What number do you get?`), null, num(n), Lg(`Số ${F(n)} đã tròn ${name.replace('hàng ', '')}.`, `${F(n)} is already a multiple of ${F(p)}.`), Lg(`${F(n)} giữ nguyên.`, `${F(n)} stays the same.`));
      const lo = Math.floor(n / p) * p, hi = lo + p;
      if (f === 0) return Q(Lg(`Làm tròn số ${F(n)} đến ${name} ta được số nào?`, `Round ${F(n)} to the nearest ${name}. What number do you get?`), vz('numberLine', { min: lo, max: hi, step: p / 10, labelEvery: 10, point: n }), num(r), Lg(`Nhìn chữ số ngay sau ${name}: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.`, `Look at the digit just to the right of the ${name}s digit: if it is less than 5, round down; if it is 5 or more, round up.`), Lg(`${F(n)} gần ${F(r)} hơn, làm tròn được ${F(r)}.`, `${F(n)} is closer to ${F(r)}, so it rounds to ${F(r)}.`));
      if (f === 1) return Q(Lg(`Làm tròn số ${F(n)} đến ${name}:`, `Round ${F(n)} to the nearest ${name}:`), null, ch(rng, F(r), [r === lo ? hi : lo, Math.floor(n / (p * 10)) * p * 10, r + p * 10, r - 2 * p].filter(x => x > 0).map(x => F(x))), Lg(`Xét chữ số ngay sau ${name}.`, `Look at the digit just to the right of the ${name}s digit.`), Lg(`${F(n)} làm tròn đến ${name} được ${F(r)}.`, `${F(n)} rounded to the nearest ${name} is ${F(r)}.`));
      return Q(Lg(`Số ${F(n)} nằm giữa ${F(lo)} và ${F(hi)}. Số ${F(n)} gần số nào hơn?`, `${F(n)} is between ${F(lo)} and ${F(hi)}. Which of these is ${F(n)} closer to?`), vz('numberLine', { min: lo, max: hi, step: p / 10, labelEvery: 10, point: n }), ch(rng, F(r), [F(r === lo ? hi : lo)]), Lg('Nhìn vị trí của số trên tia số.', 'Look at where the number is on the number line.'), Lg(`${F(n)} gần ${F(r)} hơn.`, `${F(n)} is closer to ${F(r)}.`));
    };
  }
  const c8 = {
    id: 'g3-c8', semester: 2, title: Lg('Các số đến 10 000', 'Numbers to 10 000'), icon: '🔟', lessons: [
      lesson(8, 45, Lg('Các số có bốn chữ số. Số 10 000', '4-digit numbers. The number 10 000'),
        Lg('Rô-bốt ISA cùng bạn Trang đếm số vé xem xiếc được bán trong tuần.', 'ISA the robot and Trang count the circus tickets sold this week.'),
        [
          { text: Lg('Số 2 345 gồm 2 nghìn, 3 trăm, 4 chục, 5 đơn vị; đọc là "hai nghìn ba trăm bốn mươi lăm".', 'The number 2 345 has 2 thousands, 3 hundreds, 4 tens and 5 ones. We read it as "two thousand three hundred and forty-five".'), visual: vz('blocks', { thousands: 2, hundreds: 3, tens: 4, ones: 5 }) },
          { text: Lg('Viết trong bảng hàng: Nghìn – Trăm – Chục – Đơn vị.', 'In a place value chart: Thousands – Hundreds – Tens – Ones.'), visual: vz('placeValue', { number: 2345, columns: PV4 }) },
          { text: Lg('10 nghìn = 10 000 (mười nghìn), là số tròn chục nghìn nhỏ nhất.', '10 thousands = 10 000 (ten thousand). It is the smallest number made of whole ten thousands.') },
        ],
        numberLessonGen(1000, 9999, PV4)),
      lesson(8, 46, Lg('So sánh các số trong phạm vi 10 000', 'Comparing numbers within 10 000'),
        Lg('Rô-bốt ISA giúp bạn Bình so sánh độ cao của các ngọn núi trên bản đồ.', 'ISA the robot helps Bình compare the heights of the mountains on a map.'),
        [
          { text: Lg('So sánh 4 578 và 4 621: cùng 4 nghìn; hàng trăm 5 < 6. Vậy 4578 < 4621.', 'Compare 4 578 and 4 621: both have 4 thousands; in the hundreds place, 5 < 6. So 4578 < 4621.'), visual: vz('compare', { left: 4578, right: 4621 }) },
          { text: Lg('Số có ít chữ số hơn thì bé hơn: 999 < 1000.', 'A number with fewer digits is smaller: 999 < 1000.') },
        ],
        compareGen(1000, 9999)),
      lesson(8, 47, Lg('Làm quen với chữ số La Mã', 'Getting to know Roman numerals'),
        Lg('Rô-bốt ISA và bạn Mai đọc các số La Mã trên mặt chiếc đồng hồ cổ.', 'ISA the robot and Mai read the Roman numerals on the face of an old clock.'),
        [
          { text: Lg('Chữ số La Mã: I là 1, V là 5, X là 10.', 'Roman numerals: I is 1, V is 5, X is 10.'), visual: vz('roman', { value: 5 }) },
          { text: Lg('Chữ số ghép bên phải là cộng thêm: VI = 6, XII = 12. Chữ số I ghép bên trái là bớt đi: IV = 4, IX = 9.', 'A numeral written on the right is added: VI = 6, XII = 12. An I written on the left is taken away: IV = 4, IX = 9.'), visual: vz('roman', { value: 9 }) },
        ],
        function (rng, i) {
          const n = R(rng, 1, lv(i) === 0 ? 10 : 20), f = i % 3;
          if (f === 0) return Q(Lg('Số La Mã này là số mấy?', 'What number is this Roman numeral?'), vz('roman', { value: n }), num(n), Lg('I = 1, V = 5, X = 10. Chữ I đứng trước V hoặc X là bớt đi 1.', 'I = 1, V = 5, X = 10. An I before V or X means take away 1.'), `${toRoman(n)} = ${n}.`);
          if (f === 1) { const alts = [toRoman(n + 1 <= 20 ? n + 1 : n - 1), toRoman(n - 1 >= 1 ? n - 1 : n + 2), n === 4 ? 'IIII' : n === 9 ? 'VIIII' : n === 6 ? 'IV' : n === 11 ? 'IX' : toRoman(n === 20 ? 18 : n + 2)]; return Q(Lg(`Số ${n} viết bằng chữ số La Mã là:`, `How do you write ${n} in Roman numerals?`), null, ch(rng, toRoman(n), alts), Lg('Ghép I, V, X theo quy tắc.', 'Put I, V and X together using the rules.'), Lg(`${n} viết là ${toRoman(n)}.`, `${n} is written ${toRoman(n)}.`)); }
          const a = R(rng, 1, 20); let b = R(rng, 1, 20);
          return Q(Lg(`So sánh: ${toRoman(a)} … ${toRoman(b)}`, `Compare: ${toRoman(a)} … ${toRoman(b)}`), vz('compare', { left: toRoman(a), right: toRoman(b) }), cmpAns(a, b), Lg('Đổi ra số rồi so sánh.', 'Change them into numbers, then compare.'), `${toRoman(a)} = ${a}, ${toRoman(b)} = ${b}; ${a} ${sign(a, b)} ${b}.`);
        }),
      lesson(8, 48, Lg('Làm tròn số đến hàng chục, hàng trăm', 'Rounding to the nearest ten or hundred'),
        Lg('Rô-bốt ISA giúp bạn Hùng ước lượng số khách đến thăm vườn thú.', 'ISA the robot helps Hùng estimate how many people visited the zoo.'),
        [
          { text: Lg('Làm tròn 347 đến hàng chục: 347 gần 350 hơn 340, ta được 350.', 'Round 347 to the nearest ten: 347 is closer to 350 than to 340, so we get 350.'), visual: vz('numberLine', { min: 340, max: 350, step: 1, labelEvery: 10, point: 347 }) },
          { text: Lg('Chữ số hàng đơn vị bé hơn 5 thì làm tròn xuống; từ 5 trở lên thì làm tròn lên. 2 643 làm tròn đến hàng trăm được 2 600.', 'If the digit you look at is less than 5, round down; if it is 5 or more, round up. 2 643 rounded to the nearest hundred is 2 600.') },
        ],
        roundGen([[10, Lg('hàng chục', 'ten')], [100, Lg('hàng trăm', 'hundred')]], 9999)),
    ],
  };

  // ============ CHỦ ĐỀ 9. CHU VI, DIỆN TÍCH MỘT SỐ HÌNH PHẲNG ============
  const c9 = {
    id: 'g3-c9', semester: 2, title: Lg('Chu vi, diện tích một số hình phẳng', 'Perimeter and area of some 2-D shapes'), icon: '🟩', lessons: [
      lesson(9, 50, Lg('Chu vi hình tam giác, hình tứ giác, hình chữ nhật, hình vuông', 'Perimeter of triangles, quadrilaterals, rectangles and squares'),
        Lg('Rô-bốt ISA đi một vòng quanh mảnh vườn để rào hàng rào cho bà bạn Ngọc.', 'ISA the robot walks all the way round a garden to put up a fence for Ngọc\'s grandma.'),
        [
          { text: Lg('Chu vi của một hình là tổng độ dài các cạnh của hình đó. Tam giác cạnh 3, 4, 5 cm có chu vi 3 + 4 + 5 = 12 (cm).', 'The perimeter of a shape is the total length of all its sides. A triangle with sides of 3, 4 and 5 cm has a perimeter of 3 + 4 + 5 = 12 (cm).'), visual: vz('shape', { kind: 'triangle', dims: { a: 3, b: 4, c: 5 }, showDims: true }) },
          { text: Lg('Chu vi hình chữ nhật = (chiều dài + chiều rộng) × 2. Ví dụ (5 + 3) × 2 = 16 (cm).', 'Perimeter of a rectangle = (length + width) × 2. For example, (5 + 3) × 2 = 16 (cm).'), visual: vz('areaGrid', { w: 5, h: 3, unit: 'cm', showPerimeter: true }) },
          { text: Lg('Chu vi hình vuông = độ dài cạnh × 4.', 'Perimeter of a square = side length × 4.'), visual: vz('shape', { kind: 'square', dims: { a: 4 }, showDims: true }) },
        ],
        function (rng, i) {
          const f = i % 4, big = lv(i) === 2;
          if (f === 0) { const a = R(rng, 3, 15), b = R(rng, 3, 15), c = R(rng, Math.abs(a - b) + 1, a + b - 1); return Q(Lg('Tính chu vi hình tam giác.', 'Work out the perimeter of the triangle.'), vz('shape', { kind: 'triangle', dims: { a, b, c }, showDims: true }), num(a + b + c, 'cm'), Lg('Cộng độ dài ba cạnh.', 'Add the lengths of the three sides.'), `${a} + ${b} + ${c} = ${a + b + c} (cm).`); }
          if (f === 1) { const a = R(rng, 4, big ? 60 : 12), b = R(rng, 2, a - 1); return Q(Lg(`Hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính chu vi hình chữ nhật.`, `A rectangle is ${a} cm long and ${b} cm wide. Work out the perimeter of the rectangle.`), a <= 12 ? vz('areaGrid', { w: a, h: b, unit: 'cm', showPerimeter: true }) : vz('shape', { kind: 'rect', dims: { a, b }, showDims: true }), num((a + b) * 2, 'cm'), Lg('Chu vi = (dài + rộng) × 2.', 'Perimeter = (length + width) × 2.'), `(${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`); }
          if (f === 2) { const a = R(rng, 2, big ? 50 : 10); return Q(Lg(`Hình vuông có cạnh ${a} cm. Tính chu vi hình vuông.`, `A square has sides of ${a} cm. Work out the perimeter of the square.`), vz('shape', { kind: 'square', dims: { a }, showDims: true }), num(a * 4, 'cm'), Lg('Chu vi = cạnh × 4.', 'Perimeter = side × 4.'), `${a} × 4 = ${a * 4} (cm).`); }
          if (R(rng, 0, 1)) { const s = [R(rng, 2, 9), R(rng, 2, 9), R(rng, 2, 9), R(rng, 2, 9)]; return Q(Lg('Tính chu vi hình tứ giác.', 'Work out the perimeter of the quadrilateral.'), vz('shape', { kind: 'quad', dims: { a: s[0], b: s[1], c: s[2], d: s[3] }, showDims: true }), num(s[0] + s[1] + s[2] + s[3], 'cm'), Lg('Cộng độ dài bốn cạnh.', 'Add the lengths of the four sides.'), `${s.join(' + ')} = ${s[0] + s[1] + s[2] + s[3]} (cm).`); }
          const a = R(rng, 3, 25); return Q(Lg(`Một hình vuông có chu vi ${a * 4} cm. Độ dài cạnh hình vuông là bao nhiêu?`, `A square has a perimeter of ${a * 4} cm. How long is each side of the square?`), vz('shape', { kind: 'square' }), num(a, 'cm'), Lg('Cạnh = chu vi : 4.', 'Side = perimeter : 4.'), `${a * 4} : 4 = ${a} (cm).`);
        }),

      lesson(9, 51, Lg('Diện tích của một hình. Xăng-ti-mét vuông', 'The area of a shape. Square centimetres'),
        Lg('Rô-bốt ISA lát những viên gạch vuông nhỏ lên mô hình sân nhà bạn Tú.', 'ISA the robot lays small square tiles on a model of Tú\'s yard.'),
        [
          { text: Lg('Xăng-ti-mét vuông (cm²) là diện tích hình vuông cạnh 1 cm.', 'A square centimetre (cm²) is the area of a square with sides of 1 cm.'), visual: vz('areaGrid', { w: 1, h: 1, unit: 'cm', fill: true }) },
          { text: Lg('Hình này gồm 6 ô vuông 1 cm², diện tích là 6 cm².', 'This shape is made of 6 squares of 1 cm², so its area is 6 cm².'), visual: vz('areaGrid', { w: 3, h: 2, unit: 'cm', fill: true }) },
        ],
        more(function (rng, i) {
          const f = i % 3;
          const w = R(rng, 2, lv(i) === 0 ? 5 : 9), h = R(rng, 1, lv(i) === 0 ? 3 : 6);
          if (f === 0) return Q(Lg('Hình dưới đây có diện tích bao nhiêu xăng-ti-mét vuông?', 'What is the area of the shape below, in square centimetres?'), vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(w * h, 'cm²'), Lg('Đếm số ô vuông 1 cm².', 'Count the 1 cm² squares.'), Lg(`Hình có ${w * h} ô vuông nên diện tích là ${w * h} cm².`, `The shape has ${w * h} squares, so its area is ${w * h} cm².`));
          if (f === 1) { const a = R(rng, 5, 50), b = R(rng, 5, 50); return Q(`${a} cm² + ${b} cm² = ?`, null, num(a + b, 'cm²'), Lg('Cộng các số rồi ghi đơn vị cm².', 'Add the numbers, then write the unit cm².'), `${a} cm² + ${b} cm² = ${a + b} cm².`); }
          let w2 = R(rng, 2, 6), h2 = R(rng, 1, 5);
          return Q(Lg(`Hình A gồm ${w * h} ô vuông 1 cm², hình B gồm ${w2 * h2} ô vuông 1 cm². So sánh diện tích hình A … hình B`, `Shape A is made of ${w * h} squares of 1 cm² and shape B is made of ${w2 * h2} squares of 1 cm². Compare the areas: shape A … shape B`), vz('areaGrid', { w, h, unit: 'cm', fill: true }), cmpAns(w * h, w2 * h2), Lg('Hình nào nhiều ô vuông hơn thì diện tích lớn hơn.', 'The shape with more squares has the larger area.'), `${w * h} cm² ${sign(w * h, w2 * h2)} ${w2 * h2} cm².`);
        }, [
          [0, 6, rng => { const n = R(rng, 11, 99); return Q(Lg(`Số đo "${readVN(n)} xăng-ti-mét vuông" viết là:`, `How do you write "${rd(n)} square centimetres"?`), null, ch(rng, `${n} cm²`, [`${n} cm`, `${n}² cm`, `${n * 10} cm²`]), Lg('Xăng-ti-mét vuông viết tắt là cm².', 'Square centimetre is written cm² for short.'), Lg(`${cap(readVN(n))} xăng-ti-mét vuông viết là ${n} cm².`, `${cap(rd(n))} square centimetres is written ${n} cm².`)); }],
          [3, 9, rng => {
            const op = P(rng, ['−', '×', ':']); let a, b, r, expr;
            if (op === '−') { a = R(rng, 20, 99); b = R(rng, 5, a - 1); r = a - b; expr = `${a} cm² ${M} ${b} cm²`; }
            else if (op === '×') { a = R(rng, 2, 20); b = R(rng, 2, 4); r = a * b; expr = `${a} cm² × ${b}`; }
            else { b = R(rng, 2, 5); r = R(rng, 2, 19); a = r * b; expr = `${a} cm² : ${b}`; }
            return Q(`${expr} = ?`, null, num(r, 'cm²'), Lg('Tính với các số như bình thường rồi ghi đơn vị cm².', 'Calculate with the numbers as usual, then write the unit cm².'), `${expr} = ${r} cm².`);
          }],
          [3, 9, rng => { const w = R(rng, 2, 6), h = R(rng, 2, 4), w2 = R(rng, 1, 5), h2 = R(rng, 1, 3), A = w * h, B = w2 * h2; if (A === B) return Q(Lg(`Hình A gồm ${A} ô vuông 1 cm², hình B gồm ${B} ô vuông 1 cm². Diện tích hai hình hơn kém nhau bao nhiêu xăng-ti-mét vuông?`, `Shape A is made of ${A} squares of 1 cm² and shape B is made of ${B} squares of 1 cm². What is the difference between their areas, in square centimetres?`), vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(0, 'cm²'), Lg('Lấy diện tích lớn trừ diện tích bé.', 'Subtract the smaller area from the larger area.'), Lg('Hai hình có diện tích bằng nhau, hơn kém nhau 0 cm².', 'The two shapes have the same area, so the difference is 0 cm².')); return Q(Lg(`Hình A gồm ${A} ô vuông 1 cm², hình B gồm ${B} ô vuông 1 cm². Diện tích hình ${A > B ? 'A' : 'B'} lớn hơn diện tích hình ${A > B ? 'B' : 'A'} bao nhiêu xăng-ti-mét vuông?`, `Shape A is made of ${A} squares of 1 cm² and shape B is made of ${B} squares of 1 cm². How many square centimetres larger is the area of shape ${A > B ? 'A' : 'B'} than the area of shape ${A > B ? 'B' : 'A'}?`), vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(Math.abs(A - B), 'cm²'), Lg('Lấy diện tích lớn trừ diện tích bé.', 'Subtract the smaller area from the larger area.'), `${Math.max(A, B)} ${M} ${Math.min(A, B)} = ${Math.abs(A - B)} (cm²).`); }],
          [0, 9, rng => { const [st, ok, stE] = P(rng, [['Hình vuông cạnh 1 cm có diện tích 1 cm²', true, 'A square with sides of 1 cm has an area of 1 cm²'], ['Xăng-ti-mét vuông viết tắt là cm²', true, 'Square centimetre is written cm² for short'], ['Xăng-ti-mét vuông viết tắt là cm', false, 'Square centimetre is written cm for short'], ['Hình gồm 6 ô vuông 1 cm² có diện tích là 6 cm', false, 'A shape made of 6 squares of 1 cm² has an area of 6 cm'], ['Hình gồm 8 ô vuông 1 cm² có diện tích là 8 cm²', true, 'A shape made of 8 squares of 1 cm² has an area of 8 cm²'], ['Hai hình có cùng số ô vuông 1 cm² thì có diện tích bằng nhau', true, 'Two shapes made of the same number of 1 cm² squares have the same area']]); return Q(Lg(`Đúng hay sai?\n${st}.`, `True or false?\n${stE}.`), null, tf(rng, ok), Lg('Diện tích đo bằng xăng-ti-mét vuông (cm²), độ dài đo bằng xăng-ti-mét (cm).', 'Area is measured in square centimetres (cm²); length is measured in centimetres (cm).'), Lg(`${ok ? 'Đúng' : 'Sai'}.`, `${ok ? 'True' : 'False'}.`)); }],
          [6, 9, rng => { const w = R(rng, 3, 7), h = R(rng, 2, 4), c = R(rng, 1, w - 1), who = nm(rng); return Q(Lg(`Một tấm bìa gồm ${w * h} ô vuông 1 cm² như hình. Bạn ${who} cắt đi ${c} ô vuông. Hỏi diện tích phần bìa còn lại là bao nhiêu xăng-ti-mét vuông?`, `A piece of card is made of ${w * h} squares of 1 cm², as in the picture. ${who} cuts off ${c} ${pl(c, 'square', 'squares')}. What is the area of the card that is left, in square centimetres?`), vz('areaGrid', { w, h, unit: 'cm', fill: true }), num(w * h - c, 'cm²'), Lg('Cắt đi bao nhiêu ô vuông 1 cm² thì diện tích giảm bấy nhiêu cm².', 'Each 1 cm² square you cut off makes the area 1 cm² smaller.'), `${w * h} ${M} ${c} = ${w * h - c} (cm²).`); }],
        ])),

      lesson(9, 52, Lg('Diện tích hình chữ nhật, diện tích hình vuông', 'Area of a rectangle and area of a square'),
        Lg('Rô-bốt ISA tính diện tích tấm bìa để bạn Lan làm thiệp chúc mừng thầy cô.', 'ISA the robot works out the area of a piece of card so that Lan can make a greetings card for her teachers.'),
        [
          { text: Lg('Diện tích hình chữ nhật = chiều dài × chiều rộng (cùng đơn vị đo). 4 × 3 = 12 (cm²).', 'Area of a rectangle = length × width (in the same unit). 4 × 3 = 12 (cm²).'), visual: vz('areaGrid', { w: 4, h: 3, unit: 'cm', fill: true }) },
          { text: Lg('Diện tích hình vuông = cạnh × cạnh. 3 × 3 = 9 (cm²).', 'Area of a square = side × side. 3 × 3 = 9 (cm²).'), visual: vz('areaGrid', { w: 3, h: 3, unit: 'cm', fill: true }) },
        ],
        more(function (rng, i) {
          const f = i % 4, big = lv(i) === 2;
          if (f === 0) { const a = R(rng, 3, big ? 30 : 9), b = R(rng, 2, Math.min(a - 1, 9)); return Q(Lg(`Tính diện tích hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm.`, `Work out the area of a rectangle that is ${a} cm long and ${b} cm wide.`), a <= 10 ? vz('areaGrid', { w: a, h: b, unit: 'cm', fill: true }) : vz('shape', { kind: 'rect', dims: { a, b }, showDims: true }), num(a * b, 'cm²'), Lg('Diện tích = dài × rộng.', 'Area = length × width.'), `${a} × ${b} = ${a * b} (cm²).`); }
          if (f === 1) { const a = R(rng, 2, big ? 20 : 9); return Q(Lg(`Tính diện tích hình vuông có cạnh ${a} cm.`, `Work out the area of a square with sides of ${a} cm.`), a <= 10 ? vz('areaGrid', { w: a, h: a, unit: 'cm', fill: true }) : vz('shape', { kind: 'square', dims: { a }, showDims: true }), num(a * a, 'cm²'), Lg('Diện tích = cạnh × cạnh.', 'Area = side × side.'), `${a} × ${a} = ${a * a} (cm²).`); }
          if (f === 2) { const a = R(rng, 1, 9), b = R(rng, 2, 9); return Q(Lg(`Hình chữ nhật có chiều dài ${a} dm, chiều rộng ${b} cm. Tính diện tích hình chữ nhật (theo cm²).`, `A rectangle is ${a} dm long and ${b} cm wide. Work out the area of the rectangle (in cm²).`), vz('shape', { kind: 'rect', dims: { a: a * 10, b }, showDims: true }), num(a * 10 * b, 'cm²'), Lg('Đổi về cùng đơn vị: 1 dm = 10 cm.', 'Change to the same unit first: 1 dm = 10 cm.'), `${a} dm = ${a * 10} cm; ${a * 10} × ${b} = ${a * 10 * b} (cm²).`); }
          const a = R(rng, 3, 10), b = R(rng, 2, a - 1);
          return Q(Lg(`Một tấm bìa hình chữ nhật có chiều rộng ${b} cm, chiều dài gấp đôi chiều rộng. Tính diện tích tấm bìa.`, `A rectangular piece of card is ${b} cm wide, and its length is double its width. Work out the area of the card.`), vz('shape', { kind: 'rect', dims: { a: b * 2, b }, showDims: true }), num(b * 2 * b, 'cm²'), Lg('Bước 1: tìm chiều dài.', 'Step 1: find the length.'), Lg(`Chiều dài: ${b} × 2 = ${b * 2} (cm). Diện tích: ${b * 2} × ${b} = ${b * 2 * b} (cm²).`, `Length: ${b} × 2 = ${b * 2} (cm). Area: ${b * 2} × ${b} = ${b * 2 * b} (cm²).`));
        }, [
          [3, 9, (rng, i) => { const b = R(rng, 2, 9), a = R(rng, b + 1, lv(i) === 2 ? 15 : 10), S = a * b; return Q(Lg(`Một hình chữ nhật có diện tích ${S} cm², chiều rộng ${b} cm. Tính chiều dài hình chữ nhật.`, `A rectangle has an area of ${S} cm² and a width of ${b} cm. Work out the length of the rectangle.`), vz('shape', { kind: 'rect', dims: { a: '?', b } }), num(a, 'cm'), Lg('Diện tích = chiều dài × chiều rộng, nên chiều dài = diện tích : chiều rộng.', 'Area = length × width, so length = area : width.'), `${S} : ${b} = ${a} (cm).`); }],
          [6, 9, rng => { const a = R(rng, 2, 9); return Q(Lg(`Một hình vuông có chu vi ${a * 4} cm. Tính diện tích hình vuông đó.`, `A square has a perimeter of ${a * 4} cm. Work out the area of the square.`), vz('shape', { kind: 'square' }), num(a * a, 'cm²'), Lg('Bước 1: cạnh = chu vi : 4. Bước 2: diện tích = cạnh × cạnh.', 'Step 1: side = perimeter : 4. Step 2: area = side × side.'), Lg(`Cạnh: ${a * 4} : 4 = ${a} (cm). Diện tích: ${a} × ${a} = ${a * a} (cm²).`, `Side: ${a * 4} : 4 = ${a} (cm). Area: ${a} × ${a} = ${a * a} (cm²).`)); }],
          [0, 9, rng => { const a = R(rng, 3, 9), b = R(rng, 2, a - 1), sq = R(rng, 0, 1) === 1, S = sq ? a * a : a * b, P2 = sq ? a * 4 : (a + b) * 2, cl = P(rng, [S, S, P2]); const what = sq ? `hình vuông cạnh ${a} cm` : `hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm`, whatE = sq ? `a square with sides of ${a} cm` : `a rectangle ${a} cm long and ${b} cm wide`; return Q(Lg(`Đúng hay sai?\nDiện tích ${what} là ${cl} cm².`, `True or false?\nThe area of ${whatE} is ${cl} cm².`), null, tf(rng, cl === S), sq ? Lg('Diện tích hình vuông = cạnh × cạnh.', 'Area of a square = side × side.') : Lg('Diện tích hình chữ nhật = chiều dài × chiều rộng.', 'Area of a rectangle = length × width.'), Lg(`${sq ? `${a} × ${a}` : `${a} × ${b}`} = ${S} (cm²). ${cl === S ? 'Đúng' : 'Sai'}.`, `${sq ? `${a} × ${a}` : `${a} × ${b}`} = ${S} (cm²). ${cl === S ? 'True' : 'False'}.`)); }],
          [3, 9, rng => { const a = R(rng, 3, 9), b = R(rng, 2, a - 1), c = R(rng, 2, 8), S1 = a * b, S2 = c * c; const SH = EN ? ['The rectangle', 'The square', 'They have the same area'] : ['Hình chữ nhật', 'Hình vuông', 'Hai hình có diện tích bằng nhau']; return Q(Lg(`Hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Hình vuông có cạnh ${c} cm. Hình nào có diện tích lớn hơn?`, `A rectangle is ${a} cm long and ${b} cm wide. A square has sides of ${c} cm. Which shape has the larger area?`), null, ch(rng, S1 > S2 ? SH[0] : S1 < S2 ? SH[1] : SH[2], SH), Lg('Tính diện tích từng hình rồi so sánh.', 'Work out the area of each shape, then compare.'), Lg(`Hình chữ nhật: ${a} × ${b} = ${S1} (cm²); hình vuông: ${c} × ${c} = ${S2} (cm²).`, `Rectangle: ${a} × ${b} = ${S1} (cm²); square: ${c} × ${c} = ${S2} (cm²).`)); }],
        ])),
    ],
  };

  // ============ CHỦ ĐỀ 10. CỘNG, TRỪ, NHÂN, CHIA TRONG PHẠM VI 10 000 ============
  const c10 = {
    id: 'g3-c10', semester: 2, title: Lg('Cộng, trừ, nhân, chia trong phạm vi 10 000', 'Addition, subtraction, multiplication and division within 10 000'), icon: '🧮', lessons: [
      lesson(10, 54, Lg('Phép cộng trong phạm vi 10 000', 'Addition within 10 000'),
        Lg('Rô-bốt ISA giúp nhà máy đếm số áo may được trong hai ngày.', 'ISA the robot helps a factory count the shirts it made in two days.'),
        [{ text: Lg('3 526 + 2 718: cộng từ hàng đơn vị: 6 + 8 = 14, viết 4 nhớ 1; … Vậy 3526 + 2718 = 6244.', '3 526 + 2 718: start by adding the ones: 6 + 8 = 14, write 4 and carry 1; … So 3526 + 2718 = 6244.'), visual: vz('columnCalc', { a: 3526, b: 2718, op: '+', reveal: 'all' }) }],
        colGen('+', (r, L) => pairWhere(r, [1000, 7000], L === 0 ? [100, 999] : [1000, 5000], (a, b) => a + b <= 9999 && (L === 0 || !noCarry(a, b)), [3526, 2718]))),
      lesson(10, 55, Lg('Phép trừ trong phạm vi 10 000', 'Subtraction within 10 000'),
        Lg('Rô-bốt ISA tính số cây giống còn lại sau buổi trồng cây đầu xuân.', 'ISA the robot works out how many young trees are left after the spring tree-planting day.'),
        [{ text: Lg('6 254 − 2 718: 4 không trừ được 8, lấy 14 − 8 = 6, viết 6 nhớ 1; … Vậy 6254 − 2718 = 3536.', '6 254 − 2 718: you cannot take 8 from 4, so take 14 − 8 = 6, write 6 and carry 1; … So 6254 − 2718 = 3536.'), visual: vz('columnCalc', { a: 6254, b: 2718, op: M, reveal: 'all' }) }],
        colGen(M, (r, L) => pairWhere(r, [2000, 9999], L === 0 ? [100, 999] : [1000, 8000], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [6254, 2718]))),
      lesson(10, 56, Lg('Nhân số có bốn chữ số với số có một chữ số', 'Multiplying a 4-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA tính số viên gạch cần để lát sân của bốn lớp học.', 'ISA the robot works out how many tiles are needed to pave the yards of four classrooms.'),
        [{ text: Lg('1 427 × 3: 3 × 7 = 21, viết 1 nhớ 2; 3 × 2 = 6, thêm 2 là 8; 3 × 4 = 12, viết 2 nhớ 1; 3 × 1 = 3, thêm 1 là 4. Vậy 1427 × 3 = 4281.', '1 427 × 3: 3 × 7 = 21, write 1 and carry 2; 3 × 2 = 6, add the 2 to make 8; 3 × 4 = 12, write 2 and carry 1; 3 × 1 = 3, add the 1 to make 4. So 1427 × 3 = 4281.'), visual: vz('columnCalc', { a: 1427, b: 3, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, [1001, 4999], [2, L === 0 ? 3 : 9], (a, b) => a * b <= 9999, [1427, 3]))),
      lesson(10, 57, Lg('Chia số có bốn chữ số cho số có một chữ số', 'Dividing a 4-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA chia đều số sách mới cho các thư viện xã.', 'ISA the robot shares the new books equally between the village libraries.'),
        [{ text: Lg('6 369 : 3: 6 : 3 = 2; 3 : 3 = 1; 6 : 3 = 2; 9 : 3 = 3. Vậy 6369 : 3 = 2123.', '6 369 : 3: 6 : 3 = 2; 3 : 3 = 1; 6 : 3 = 2; 9 : 3 = 3. So 6369 : 3 = 2123.'), visual: vz('columnCalc', { a: 6369, b: 3, op: ':', reveal: 'all' }) }, { text: Lg('Chú ý chữ số 0 ở thương: 3 618 : 3 = 1 206.', 'Watch out for the 0 in the quotient: 3 618 : 3 = 1 206.'), visual: vz('columnCalc', { a: 3618, b: 3, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, [1000, 9999], [2, L === 0 ? 3 : 9], (a, b) => a % b === 0 && (L < 2 || String(a / b).includes('0')), [3618, 3]))),
    ],
  };

  // ============ CHỦ ĐỀ 11. CÁC SỐ ĐẾN 100 000 ============
  const c11 = {
    id: 'g3-c11', semester: 2, title: Lg('Các số đến 100 000', 'Numbers to 100 000'), icon: '🔢', lessons: [
      lesson(11, 59, Lg('Các số có năm chữ số. Số 100 000', '5-digit numbers. The number 100 000'),
        Lg('Rô-bốt ISA cùng bạn Việt đọc số người đến xem trận bóng đá ở sân vận động.', 'ISA the robot and Việt read how many people came to watch the football match at the stadium.'),
        [
          { text: Lg('Số 42 316 gồm 4 chục nghìn, 2 nghìn, 3 trăm, 1 chục, 6 đơn vị; đọc là "bốn mươi hai nghìn ba trăm mười sáu".', 'The number 42 316 has 4 ten thousands, 2 thousands, 3 hundreds, 1 ten and 6 ones. We read it as "forty-two thousand three hundred and sixteen".'), visual: vz('placeValue', { number: 42316, columns: PV5 }) },
          { text: Lg('10 chục nghìn = 100 000 (một trăm nghìn).', '10 ten thousands = 100 000 (one hundred thousand).') },
        ],
        numberLessonGen(10000, 99999, PV5)),
      lesson(11, 60, Lg('So sánh các số trong phạm vi 100 000', 'Comparing numbers within 100 000'),
        Lg('Rô-bốt ISA so sánh số dân của các xã trong huyện cùng bạn Thảo.', 'ISA the robot and Thảo compare how many people live in the villages of the district.'),
        [{ text: Lg('So sánh 45 312 và 45 297: cùng 45 nghìn; hàng trăm 3 > 2. Vậy 45 312 > 45 297.', 'Compare 45 312 and 45 297: both have 45 thousands; in the hundreds place, 3 > 2. So 45 312 > 45 297.'), visual: vz('compare', { left: F(45312), right: F(45297) }) }],
        compareGen(10000, 99999)),
      lesson(11, 61, Lg('Làm tròn số đến hàng nghìn, hàng chục nghìn', 'Rounding to the nearest thousand or ten thousand'),
        Lg('Rô-bốt ISA ước lượng số khán giả đến xem lễ hội pháo hoa.', 'ISA the robot estimates how many people came to watch the fireworks festival.'),
        [
          { text: Lg('Làm tròn 34 718 đến hàng nghìn: chữ số hàng trăm là 7 (≥ 5) nên làm tròn lên: 35 000.', 'Round 34 718 to the nearest thousand: the hundreds digit is 7 (≥ 5), so round up: 35 000.'), visual: vz('numberLine', { min: 34000, max: 35000, step: 100, labelEvery: 10, point: 34718 }) },
          { text: Lg('Làm tròn 34 718 đến hàng chục nghìn: chữ số hàng nghìn là 4 (< 5) nên làm tròn xuống: 30 000.', 'Round 34 718 to the nearest ten thousand: the thousands digit is 4 (< 5), so round down: 30 000.') },
        ],
        roundGen([[1000, Lg('hàng nghìn', 'thousand')], [10000, Lg('hàng chục nghìn', 'ten thousand')]], 99999)),
    ],
  };

  // ============ CHỦ ĐỀ 12. CỘNG, TRỪ TRONG PHẠM VI 100 000 ============
  const c12 = {
    id: 'g3-c12', semester: 2, title: Lg('Cộng, trừ trong phạm vi 100 000', 'Addition and subtraction within 100 000'), icon: '➕', lessons: [
      lesson(12, 63, Lg('Phép cộng trong phạm vi 100 000', 'Addition within 100 000'),
        Lg('Rô-bốt ISA cộng số sách hai nhà sách bán được trong ngày hội đọc sách.', 'ISA the robot adds up the books that two bookshops sold on Book Day.'),
        [{ text: Lg('35 246 + 41 578 = 76 824. Đặt tính thẳng cột, cộng từ phải sang trái, nhớ khi cần.', '35 246 + 41 578 = 76 824. Set out the numbers in columns, add from right to left, and carry when you need to.'), visual: vz('columnCalc', { a: 35246, b: 41578, op: '+', reveal: 'all' }) }, { text: Lg('Cộng nhẩm số tròn nghìn: 20 000 + 30 000 = 50 000 (2 chục nghìn + 3 chục nghìn).', 'Mental maths with whole thousands: 20 000 + 30 000 = 50 000 (2 ten thousands + 3 ten thousands).') }],
        colGen('+', (r, L) => pairWhere(r, [10000, 70000], L === 0 ? [1000, 9999] : [10000, 50000], (a, b) => a + b <= 99999 && (L === 0 || !noCarry(a, b)), [35246, 41578]))),
      lesson(12, 64, Lg('Phép trừ trong phạm vi 100 000', 'Subtraction within 100 000'),
        Lg('Rô-bốt ISA tính số tiền còn lại sau khi bạn Hà mua đồ dùng học tập.', 'ISA the robot works out how much money Hà has left after buying things for school.'),
        [{ text: Lg('82 354 − 37 528 = 44 826. Không trừ được thì mượn 1 ở hàng bên trái.', '82 354 − 37 528 = 44 826. If you cannot subtract, exchange 1 from the column on the left.'), visual: vz('columnCalc', { a: 82354, b: 37528, op: M, reveal: 'all' }) }],
        colGen(M, (r, L) => pairWhere(r, [20000, 99999], L === 0 ? [1000, 9999] : [10000, 80000], (a, b) => a > b && (L === 0 || !noBorrow(a, b)), [82354, 37528]))),
    ],
  };

  // ============ CHỦ ĐỀ 13. XEM ĐỒNG HỒ. THÁNG – NĂM. TIỀN VIỆT NAM ============
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  // English: 8 o'clock, 8:05; "20 minutes to 9" for giờ kém
  const tStr = (h, m) => (EN ? (m === 0 ? `${h} o'clock` : `${h}:${String(m).padStart(2, '0')}`) : (m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`));
  const kem = (h, m) => (EN ? `${60 - m} minutes to ${h % 12 + 1}` : `${h % 12 + 1} giờ kém ${60 - m} phút`);
  const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const c13 = {
    id: 'g3-c13', semester: 2, title: Lg('Xem đồng hồ. Tháng – năm. Tiền Việt Nam', 'Telling the time. Months and years. Vietnamese money'), icon: '🕐', lessons: [
      lesson(13, 66, Lg('Xem đồng hồ. Tháng – năm', 'Telling the time. Months and years'),
        Lg('Rô-bốt ISA nhắc bạn Phúc xem đồng hồ để không trễ chuyến xe buýt về quê.', 'ISA the robot reminds Phúc to check the clock so as not to miss the bus to the countryside.'),
        [
          { text: Lg('Đồng hồ chỉ 8 giờ 40 phút, hay 9 giờ kém 20 phút.', 'The clock shows 8:40, or 20 minutes to 9.'), visual: vz('clock', { h: 8, m: 40 }) },
          { text: Lg('Một năm có 12 tháng. Các tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày; tháng 4, 6, 9, 11 có 30 ngày; tháng 2 có 28 hoặc 29 ngày.', 'A year has 12 months. January, March, May, July, August, October and December have 31 days; April, June, September and November have 30 days; February has 28 or 29 days.'), visual: vz('calendar', { year: 2027, month: 2 }) },
        ],
        function (rng, i) {
          const f = i % 5, h = R(rng, 1, 12), m = R(rng, 1, 11) * 5;
          if (f === 0) return Q(Lg('Đồng hồ chỉ mấy giờ?', 'What time does the clock show?'), vz('clock', { h, m }), ch(rng, tStr(h, m), [tStr(h % 12 + 1, m), tStr(h, (m + 30) % 60 || 5), tStr(h, 60 - m === m ? m + 5 : 60 - m)]), Lg('Kim ngắn chỉ giờ, kim dài chỉ phút (mỗi số là 5 phút).', 'The short hand shows the hour and the long hand shows the minutes (each number is 5 minutes).'), Lg(`Đồng hồ chỉ ${tStr(h, m)}${m > 30 ? ` hay ${kem(h, m)}` : ''}.`, `The clock shows ${tStr(h, m)}${m > 30 ? `, or ${kem(h, m)}` : ''}.`));
          if (f === 1) { const mm = R(rng, 7, 11) * 5; return Q(Lg(`${tStr(h, mm)} còn gọi là:`, `${tStr(h, mm)} can also be said as:`), vz('clock', { h, m: mm }), ch(rng, kem(h, mm), [Lg(`${h} giờ kém ${60 - mm} phút`, `${60 - mm} minutes to ${h}`), Lg(`${h % 12 + 1} giờ kém ${mm} phút`, `${mm} minutes to ${h % 12 + 1}`), Lg(`${h % 12 + 1} giờ ${60 - mm} phút`, `${60 - mm} minutes past ${h % 12 + 1}`)]), Lg(`Còn ${60 - mm} phút nữa thì đến ${h % 12 + 1} giờ.`, `In ${60 - mm} minutes it will be ${h % 12 + 1} o'clock.`), `${tStr(h, mm)} = ${kem(h, mm)}.`); }
          if (f === 2) return Q(Lg(`Em hãy quay kim đồng hồ để chỉ ${tStr(h, m)}.`, `Move the hands of the clock to show ${tStr(h, m)}.`), vz('clock', { h: 12, m: 0 }), { kind: 'visual', check: v => v && ((v.h % 12) + 12) % 12 === h % 12 && v.m === m }, Lg(`Kim dài chỉ số ${m / 5}.`, `The long hand points to ${m / 5}.`), Lg(`Kim ngắn ở giữa số ${h} và số ${h % 12 + 1}, kim dài chỉ số ${m / 5}.`, `The short hand is between ${h} and ${h % 12 + 1}, and the long hand points to ${m / 5}.`));
          if (f === 3) { const s = R(rng, 6, 9), sm = R(rng, 0, 5) * 5, d = R(rng, 2, 9) * 5; const em = sm + d, eh = s + Math.floor(em / 60), emm = em % 60; const who = nm(rng); return Q(Lg(`${who} bắt đầu tưới cây lúc ${tStr(s, sm)}, tưới trong ${d} phút. Hỏi ${tStr(s, sm).includes('phút') ? 'bạn' : 'bạn'} tưới xong lúc mấy giờ?`, `${who} starts watering the plants at ${tStr(s, sm)} and waters them for ${d} minutes. At what time does ${who} finish?`), vz('clock', { h: s, m: sm }), ch(rng, tStr(eh, emm), [tStr(eh, (emm + 5) % 60), tStr(eh + 1, emm), tStr(s, d)]), Lg(`Cộng thêm ${d} phút.`, `Add ${d} minutes.`), Lg(`${tStr(s, sm)} + ${d} phút = ${tStr(eh, emm)}.`, `${tStr(s, sm)} + ${d} minutes = ${tStr(eh, emm)}.`)); }
          const y = P(rng, [2026, 2027, 2028]), mo = R(rng, 1, 12);
          if (R(rng, 0, 1)) return Q(Lg(`Tháng ${mo} năm ${y} có bao nhiêu ngày?`, `How many days are there in ${MONTHS[mo]} ${y}?`), vz('calendar', { year: y, month: mo }), num(daysIn(y, mo), Lg('ngày', 'days')), Lg('Nắm tay đếm tháng: tháng ở đỉnh khớp có 31 ngày.', 'Count the months on your knuckles: the months that land on a knuckle have 31 days.'), Lg(`Tháng ${mo} năm ${y} có ${daysIn(y, mo)} ngày.`, `${MONTHS[mo]} ${y} has ${daysIn(y, mo)} days.`));
          const d = R(rng, 1, daysIn(y, mo)), wd = new Date(y, mo - 1, d).getDay(), WD = EN ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          return Q(Lg(`Ngày ${d} tháng ${mo} năm ${y} là thứ mấy?`, `What day of the week is ${d} ${MONTHS[mo]} ${y}?`), vz('calendar', { year: y, month: mo, highlight: [d] }), ch(rng, WD[wd], [WD[(wd + 1) % 7], WD[(wd + 6) % 7], WD[(wd + 3) % 7]]), Lg('Tìm ngày đó trên tờ lịch rồi nhìn lên đầu cột.', 'Find the date on the calendar, then look at the top of its column.'), Lg(`Ngày ${d}/${mo}/${y} là ${WD[wd].toLowerCase()}.`, `${d} ${MONTHS[mo]} ${y} is a ${WD[wd]}.`));
        }),

      lesson(13, 68, Lg('Tiền Việt Nam', 'Vietnamese money'),
        Lg('Rô-bốt ISA đi chợ Tết cùng bạn Minh và giúp bạn ấy tính tiền.', 'ISA the robot goes to the Tết market with Minh and helps with the sums.'),
        [
          { text: Lg('Các tờ tiền: 1000, 2000, 5000, 10 000, 20 000, 50 000, 100 000 đồng.', 'The notes: 1000, 2000, 5000, 10 000, 20 000, 50 000 and 100 000 dong.'), visual: vz('money', { notes: [1000, 2000, 5000, 10000, 20000, 50000, 100000] }) },
          { text: Lg('20 000 + 10 000 + 5000 = 35 000 (đồng).', '20 000 + 10 000 + 5000 = 35 000 (dong).'), visual: vz('money', { notes: [20000, 10000, 5000] }) },
        ],
        function (rng, i) {
          const f = i % 4, NOTES = [1000, 2000, 5000, 10000, 20000, 50000], DONG = Lg('đồng', 'dong');
          if (f === 0) { const notes = Array.from({ length: R(rng, 2, lv(i) === 0 ? 3 : 5) }, () => P(rng, NOTES)).sort((a, b) => b - a); const s = notes.reduce((a, b) => a + b, 0); return Q(Lg('Có tất cả bao nhiêu tiền?', 'How much money is there altogether?'), vz('money', { notes }), num(s, DONG), Lg('Cộng giá trị các tờ tiền, bắt đầu từ tờ lớn nhất.', 'Add up the values of the notes, starting with the biggest note.'), `${notes.map(F).join(' + ')} = ${F(s)} (${DONG}).`); }
          if (f === 1) { const a = R(rng, 5, 30) * 1000, b = R(rng, 2, 20) * 1000, pay = a + b <= 50000 ? 50000 : 100000, who = nm(rng); return Q(Lg(`${who} mua một quyển truyện giá ${F(a)} đồng và một hộp bút giá ${F(b)} đồng. Bạn đưa cô bán hàng ${F(pay)} đồng. Cô trả lại bao nhiêu tiền?`, `${who} buys a storybook for ${F(a)} dong and a box of pens for ${F(b)} dong, and gives the shopkeeper ${F(pay)} dong. How much change does ${who} get?`), vz('money', { notes: [pay] }), num(pay - a - b, DONG), Lg('Bước 1: tính tổng số tiền phải trả.', 'Step 1: work out how much has to be paid altogether.'), Lg(`Phải trả: ${F(a)} + ${F(b)} = ${F(a + b)} (đồng). Trả lại: ${F(pay)} ${M} ${F(a + b)} = ${F(pay - a - b)} (đồng).`, `To pay: ${F(a)} + ${F(b)} = ${F(a + b)} (dong). Change: ${F(pay)} ${M} ${F(a + b)} = ${F(pay - a - b)} (dong).`)); }
          if (f === 2) { const [big, small] = P(rng, [[10000, 5000], [10000, 2000], [20000, 5000], [50000, 10000], [100000, 20000], [5000, 1000]]); return Q(Lg(`Đổi 1 tờ ${F(big)} đồng được mấy tờ ${F(small)} đồng?`, `How many ${F(small)} dong notes can you change one ${F(big)} dong note into?`), vz('money', { notes: [big] }), num(big / small), `${F(big)} : ${F(small)} = ?`, Lg(`${F(big)} : ${F(small)} = ${big / small} (tờ).`, `${F(big)} : ${F(small)} = ${big / small} (notes).`)); }
          const p = R(rng, 2, 9) * 1000, n = R(rng, 2, 5); return Q(Lg(`Một quyển vở giá ${F(p)} đồng. Mua ${n} quyển vở như thế hết bao nhiêu tiền?`, `An exercise book costs ${F(p)} dong. How much do ${n} exercise books like this cost?`), null, num(p * n, DONG), Lg('Nhân giá một quyển với số quyển.', 'Multiply the price of one book by the number of books.'), `${F(p)} × ${n} = ${F(p * n)} (${DONG}).`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 14. NHÂN, CHIA TRONG PHẠM VI 100 000 ============
  const c14 = {
    id: 'g3-c14', semester: 2, title: Lg('Nhân, chia trong phạm vi 100 000', 'Multiplication and division within 100 000'), icon: '✖️', lessons: [
      lesson(14, 70, Lg('Nhân số có năm chữ số với số có một chữ số', 'Multiplying a 5-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA tính số quả trứng của trang trại sau mấy ngày thu hoạch.', 'ISA the robot works out how many eggs a farm collects in a few days.'),
        [{ text: Lg('12 418 × 4 = 49 672. Nhân từ phải sang trái, nhớ sang hàng bên trái.', '12 418 × 4 = 49 672. Multiply from right to left, and carry to the next column.'), visual: vz('columnCalc', { a: 12418, b: 4, op: '×', reveal: 'all' }) }],
        colGen('×', (r, L) => pairWhere(r, [10001, 49999], [2, L === 0 ? 3 : 9], (a, b) => a * b <= 99999, [12418, 4]))),
      lesson(14, 71, Lg('Chia số có năm chữ số cho số có một chữ số', 'Dividing a 5-digit number by a 1-digit number'),
        Lg('Rô-bốt ISA chia đều số cây giống cho các xã trồng rừng.', 'ISA the robot shares young trees equally between the villages that are planting a forest.'),
        [{ text: Lg('37 648 : 4 = 9 412. Lượt đầu lấy 37 chia 4 vì 3 không chia được cho 4.', '37 648 : 4 = 9 412. First divide 37 by 4, because 3 cannot be divided by 4.'), visual: vz('columnCalc', { a: 37648, b: 4, op: ':', reveal: 'all' }) }],
        colGen(':', (r, L) => pairWhere(r, [10000, 99999], [2, L === 0 ? 3 : 9], (a, b) => a % b === 0 && (L < 2 || String(a / b).includes('0')), [37648, 4]))),
    ],
  };

  // ============ CHỦ ĐỀ 15. LÀM QUEN VỚI YẾU TỐ THỐNG KÊ, XÁC SUẤT ============
  const COL = [{ n: Lg('đỏ', 'red'), c: '#E84A4A' }, { n: Lg('xanh dương', 'blue'), c: '#4DA3FF' }, { n: Lg('vàng', 'yellow'), c: '#FFC93C' }, { n: Lg('xanh lá', 'green'), c: '#5BC85B' }];
  const c15 = {
    id: 'g3-c15', semester: 2, title: Lg('Làm quen với yếu tố thống kê, xác suất', 'Getting to know statistics and chance'), icon: '📊', lessons: [
      lesson(15, 73, Lg('Thu thập, phân loại, ghi chép số liệu. Bảng số liệu', 'Collecting, sorting and recording data. Data tables'),
        Lg('Rô-bốt ISA cùng lớp 3A ghi chép số cây mỗi tổ trồng được.', 'ISA the robot and class 3A record how many trees each group planted.'),
        [{ text: Lg('Bảng số liệu giúp ta đọc nhanh: Tổ 1 trồng 12 cây, Tổ 2 trồng 15 cây, Tổ 3 trồng 9 cây.', 'A data table helps us read information quickly: Group 1 planted 12 trees, Group 2 planted 15 trees and Group 3 planted 9 trees.'), visual: vz('dataTable', { headers: EN ? ['Group', 'Group 1', 'Group 2', 'Group 3'] : ['Tổ', 'Tổ 1', 'Tổ 2', 'Tổ 3'], rows: [[Lg('Số cây', 'Trees'), 12, 15, 9]] }) }],
        function (rng, i) {
          const k = lv(i) === 0 ? 3 : 4, labels = (EN ? ['Group 1', 'Group 2', 'Group 3', 'Group 4'] : ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4']).slice(0, k);
          const vals = U.sample(rng, Array.from({ length: 40 }, (_, j) => j + 5), k);
          // English: [table row, unit, verb, verb in the past]
          const what = P(rng, EN ? [['Trees', 'trees', 'plant', 'planted'], ['Books', 'books', 'collect', 'collected'], ['Gold stars', 'gold stars', 'earn', 'earned']] : [['Số cây', 'cây', 'trồng được'], ['Số quyển sách', 'quyển', 'quyên góp được'], ['Số bông hoa điểm tốt', 'bông', 'đạt được']]);
          const tb = vz('dataTable', { headers: [Lg('Tổ', 'Group')].concat(labels), rows: [[what[0]].concat(vals)] });
          const f = i % 4;
          if (f === 0) { const j = R(rng, 0, k - 1); return Q(Lg(`${labels[j]} ${what[2]} bao nhiêu ${what[1]}?`, `How many ${what[1]} did ${labels[j]} ${what[2]}?`), tb, num(vals[j]), Lg(`Tìm cột ${labels[j]}.`, `Find the ${labels[j]} column.`), `${labels[j]}: ${vals[j]} ${what[1]}.`); }
          if (f === 1) { const big = R(rng, 0, 1), v = big ? Math.max(...vals) : Math.min(...vals); return Q(Lg(`Tổ nào ${what[2]} ${big ? 'nhiều' : 'ít'} ${what[1]} nhất?`, `Which group ${what[3]} the ${big ? 'most' : 'fewest'} ${what[1]}?`), tb, ch(rng, labels[vals.indexOf(v)], labels), Lg('So sánh các số trong bảng.', 'Compare the numbers in the table.'), `${labels[vals.indexOf(v)]}: ${v} ${what[1]}.`); }
          if (f === 2) { const s = vals.reduce((a, b) => a + b, 0); return Q(Lg(`Cả lớp ${what[2]} tất cả bao nhiêu ${what[1]}?`, `How many ${what[1]} did the whole class ${what[2]} altogether?`), tb, num(s), Lg('Cộng tất cả các số trong bảng.', 'Add up all the numbers in the table.'), `${vals.join(' + ')} = ${s} (${what[1]}).`); }
          const [a, b] = U.sample(rng, [0, 1, 2].slice(0, k), 2), hi = vals[a] > vals[b] ? a : b, lo = hi === a ? b : a;
          return Q(Lg(`${labels[hi]} ${what[2]} nhiều hơn ${labels[lo]} bao nhiêu ${what[1]}?`, `How many more ${what[1]} did ${labels[hi]} ${what[2]} than ${labels[lo]}?`), vz('barChart', { labels, values: vals, unit: what[1] }), num(vals[hi] - vals[lo]), Lg('Lấy số lớn trừ số bé.', 'Subtract the smaller number from the larger number.'), `${vals[hi]} ${M} ${vals[lo]} = ${vals[hi] - vals[lo]} (${what[1]}).`);
        }),
      lesson(15, 74, Lg('Khả năng xảy ra của một sự kiện', 'How likely is it to happen?'),
        Lg('Rô-bốt ISA chơi trò bốc thăm may mắn với các bạn trong lớp.', 'ISA the robot plays a lucky dip game with friends in class.'),
        [
          { text: Lg('Hộp có 3 bóng đỏ và 2 bóng xanh: lấy 1 quả, có thể được bóng đỏ, có thể được bóng xanh, không thể được bóng vàng.', 'A box has 3 red balls and 2 blue balls. If you take out 1 ball, it is possible to get a red ball, it is possible to get a blue ball, but it is impossible to get a yellow ball.'), visual: vz('chance', { items: [{ color: '#E84A4A', count: 3 }, { color: '#4DA3FF', count: 2 }] }) },
        ],
        function (rng, i) {
          const k = R(rng, 1, 3), cols = U.sample(rng, COL, k + 1), inBox = cols.slice(0, k), out = cols[k];
          const items = inBox.map(c => ({ color: c.c, count: R(rng, 1, 6) }));
          const parts = inBox.map((c, j) => Lg(`${items[j].count} quả bóng ${c.n}`, `${items[j].count} ${c.n} ${pl(items[j].count, 'ball', 'balls')}`));
          const desc = EN && parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts.join(', ');
          const f = i % 3, opts = ['Chắc chắn', 'Có thể', 'Không thể'];
          if (f === 2 && k >= 2 && items[0].count !== items[1].count) {
            const more = items[0].count > items[1].count ? 0 : 1;
            return Q(Lg(`Trong hộp có ${desc}. Lấy ra 1 quả bóng bất kì. Khả năng lấy được bóng màu nào cao hơn: ${inBox[0].n} hay ${inBox[1].n}?`, `The box has ${desc}. You take out 1 ball without looking. Which colour are you more likely to get: ${inBox[0].n} or ${inBox[1].n}?`), vz('chance', { items }), ch(rng, Lg('Bóng ' + inBox[more].n, cap(inBox[more].n)), [Lg('Bóng ' + inBox[1 - more].n, cap(inBox[1 - more].n)), Lg('Như nhau', 'Equally likely')]), Lg('Màu nào có nhiều quả hơn thì khả năng lấy được cao hơn.', 'The colour with more balls is more likely.'), Lg(`Có ${items[more].count} quả bóng ${inBox[more].n}, nhiều hơn.`, `There are ${items[more].count} ${inBox[more].n} balls, which is more.`));
          }
          const ask = R(rng, 0, 1) ? out : inBox[0], ans = ask === out ? 'Không thể' : k === 1 ? 'Chắc chắn' : 'Có thể';
          return Q(Lg(`Trong hộp có ${desc}. Lấy ra 1 quả bóng bất kì. Em chọn từ thích hợp: … lấy được quả bóng ${ask.n}.`, `The box has ${desc}. You take out 1 ball without looking. Choose the right word: it is … that you will get a ${ask.n} ball.`), vz('chance', { items }), { kind: 'choice', options: EN ? ['certain', 'possible', 'impossible'] : opts, correct: opts.indexOf(ans) }, Lg('Xem trong hộp có những màu nào.', 'Look at which colours are in the box.'), ans === 'Không thể' ? Lg(`Hộp không có bóng ${ask.n}.`, `There are no ${ask.n} balls in the box.`) : ans === 'Chắc chắn' ? Lg(`Hộp chỉ có bóng ${ask.n}.`, `The box has only ${ask.n} balls.`) : Lg(`Hộp có nhiều màu nên có thể lấy được bóng ${ask.n}.`, `The box has more than one colour, so it is possible to get a ${ask.n} ball.`));
        }),
    ],
  };

  CURRICULUM.push({
    grade: 3,
    title: Lg('Lớp 3', 'Grade 3'),
    book: 'Kết nối tri thức với cuộc sống',
    topics: [c1, c2, c3, c4, c5, c6, c8, c9, c10, c11, c12, c13, c14, c15],
  });
})();
