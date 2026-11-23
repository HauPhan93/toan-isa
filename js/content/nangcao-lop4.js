/* Toán ISA — bài nâng cao lớp 4 (Đề nâng cao). Contract: NANGCAO.md.
 *
 * Which lessons each test covers (core.js scopeLessons; each học kì of lop4.js has 23 lessons, the first half is 12):
 *   giua-hk1 = Bài 1–14: review within 100 000 (+ − × : by one digit), số chẵn/lẻ, biểu thức chứa chữ, three-step
 *              problems, angles (incl. 30° between two numbers of a clock), numbers to the millions, làm tròn, so sánh
 *   cuoi-hk1 = + Bài 15–31: yến/tạ/tấn, dm²/m²/mm², giây/thế kỉ, + − of many digits, properties of addition,
 *              tổng–hiệu, perpendicular/parallel lines, hình bình hành, hình thoi
 *   giua-hk2 = Bài 38–51: × and : by one and two digits, properties of ×, the distributive property, trung bình cộng,
 *              rút về đơn vị, statistics
 *   cuoi-nam = + Bài 53–65: fractions (+ − only when one denominator divides the other, × :, phân số của một số)
 * Word problems have at most three steps (CT 2018, lớp 4). Money answers are 'tl' only: the automatic A B C D
 * distractors of a number answer would not be whole thousands of đồng.
 */
(function () {
  'use strict';
  const { L, F, R, P, Q, num, ch, dt, M } = NC;
  const J = (...a) => a.filter(x => x != null && x !== '').join('\n');
  const DONG = L('đồng', 'dong');
  const pl = (n, one, many) => (n === 1 ? one : many);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const done = (v, uvi, uen) => L(`Đáp số: ${v}${uvi ? ' ' + uvi : ''}.`, `Answer: ${v}${uen ? ' ' + uen : ''}.`);
  const doneD = v => done(F(v), 'đồng', 'dong');
  const listVi = xs => (xs.length > 1 ? xs.slice(0, -1).join(', ') + ' và ' + xs[xs.length - 1] : xs[0]);
  const listEn = xs => (xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : xs[0]);
  const hasInnerZero = n => String(n).slice(1).includes('0');

  // ---------- fractions (always kept in simplest form) ----------
  const fq = (n, d) => { const g = U.gcd(n, d); return { n: n / g, d: d / g }; };
  const fs = x => `${x.n}/${x.d}`;
  const fmul = (x, y) => fq(x.n * y.n, x.d * y.d);
  const fdiv = (x, y) => fq(x.n * y.d, x.d * y.n);
  const fval = x => x.n / x.d;
  // lớp 4 adds and subtracts fractions only when one denominator divides the other
  const rel = (x, y) => x.d % y.d === 0 || y.d % x.d === 0;
  const fadd = (x, y, s) => { const D = Math.max(x.d, y.d); return fq(x.n * D / x.d + s * y.n * D / y.d, D); };
  const pfr = (rng, maxD) => { const d = R(rng, 2, maxD); return fq(R(rng, 1, d - 1), d); };
  // the written steps of one operation, each the expression after "="
  const mulSteps = (x, y) => { const z = fmul(x, y), raw = `${x.n * y.n}/${x.d * y.d}`; return raw === fs(z) ? [raw] : [raw, fs(z)]; };
  const divSteps = (x, y) => { const z = fdiv(x, y), raw = `${x.n * y.d}/${x.d * y.n}`; return [`${fs(x)} × ${y.d}/${y.n}`].concat(raw === fs(z) ? [raw] : [raw, fs(z)]); };
  const addSteps = (x, y, s) => {
    const D = Math.max(x.d, y.d), a = x.n * D / x.d, b = y.n * D / y.d, op = s > 0 ? '+' : M, z = fadd(x, y, s), out = [];
    if (x.d !== y.d) out.push(`${a}/${D} ${op} ${b}/${D}`);
    out.push(`${a + s * b}/${D}`);
    if (fs(z) !== `${a + s * b}/${D}`) out.push(fs(z));
    return out;
  };
  const oneMinus = x => (x.d === 1 ? ['0'] : [`${x.d}/${x.d} ${M} ${fs(x)}`, `${x.d - x.n}/${x.d}`]);

  // ---------- small text helpers ----------
  const tanVi = (t, q) => (q ? `${t} tấn ${q} tạ` : `${t} tấn`);
  const tanEn = (t, q) => `${t} ${pl(t, 'tonne', 'tonnes')}${q ? ` ${q} ${pl(q, 'quintal', 'quintals')}` : ''}`;
  const TAN = (t, q) => L(tanVi(t, q), tanEn(t, q));
  const QUI = q => L(`${q} tạ`, `${q} ${pl(q, 'quintal', 'quintals')}`);
  const msVi = s => (s < 60 ? `${s} giây` : `${Math.floor(s / 60)} phút${s % 60 ? ` ${s % 60} giây` : ''}`);
  const msEn = s => (s < 60 ? `${s} seconds` : `${Math.floor(s / 60)} ${pl(Math.floor(s / 60), 'minute', 'minutes')}${s % 60 ? ` ${s % 60} ${pl(s % 60, 'second', 'seconds')}` : ''}`);
  const MS = s => L(msVi(s), msEn(s));
  const SEC = L('giây', 'seconds');
  // "1 phút 15 giây = 60 giây + 15 giây = 75 giây"
  const msConv = s => L(`${msVi(s)} = ${Math.floor(s / 60) * 60} giây + ${s % 60} giây = ${s} giây`, `${msEn(s)} = ${Math.floor(s / 60) * 60} seconds + ${s % 60} seconds = ${s} seconds`);

  // every permutation of the digits that does not start with 0, as numbers
  function perms(ds) {
    const out = [];
    const rec = (pre, rest) => {
      if (!rest.length) { if (pre[0] !== 0) out.push(Number(pre.join(''))); return; }
      rest.forEach((d, i) => rec(pre.concat(d), rest.slice(0, i).concat(rest.slice(i + 1))));
    };
    rec([], ds);
    return out;
  }

  // ---------- data ----------
  const SHOP = [   // [vi noun, classifier, en plural, price range in thousands of đồng]
    ['quyển vở', 'quyển', 'exercise books', 6, 12],
    ['chiếc bút bi', 'chiếc', 'ballpoint pens', 3, 7],
    ['quyển truyện tranh', 'quyển', 'comic books', 12, 18],
    ['cái thước kẻ', 'cái', 'rulers', 4, 9],
  ];
  const ONE = [    // [vi, en with "a", en with "the", price range in thousands of đồng]
    ['hộp bút chì màu', 'a box of colouring pencils', 'the box of colouring pencils', 20, 45],
    ['quyển sổ tay', 'a notebook', 'the notebook', 10, 25],
    ['hộp màu nước', 'a set of watercolours', 'the set of watercolours', 25, 40],
    ['chiếc com-pa', 'a pair of compasses', 'the pair of compasses', 12, 20],
  ];
  const PAIRS = [  // [A vi, B vi, A en plural, A en singular, B en singular, B en plural, A price, B price (thousands)]
    ['quyển vở', 'chiếc bút', 'exercise books', 'exercise book', 'pen', 'pens', 6, 12, 3, 8],
    ['cái bánh mì', 'hộp sữa', 'bread rolls', 'bread roll', 'carton of milk', 'cartons of milk', 5, 10, 6, 9],
    ['cái bút chì', 'quyển sổ tay', 'pencils', 'pencil', 'notebook', 'notebooks', 2, 5, 10, 18],
  ];
  const LAPSO = [  // [vi, en, 0 any / 1 odd / 2 even, 1 largest / 0 smallest]
    ['lớn nhất', 'the largest', 0, 1], ['bé nhất', 'the smallest', 0, 0], ['chẵn lớn nhất', 'the largest even', 2, 1],
    ['lẻ bé nhất', 'the smallest odd', 1, 0], ['chẵn bé nhất', 'the smallest even', 2, 0], ['lẻ lớn nhất', 'the largest odd', 1, 1],
  ];
  const PLACES = [[1000, 'hàng nghìn', 'the nearest thousand'], [10000, 'hàng chục nghìn', 'the nearest ten thousand'], [100000, 'hàng trăm nghìn', 'the nearest hundred thousand']];
  const AKV = ['góc nhọn', 'góc vuông', 'góc tù', 'góc bẹt'], AKE = ['an acute angle', 'a right angle', 'an obtuse angle', 'a straight angle'];
  const akind = deg => (deg < 90 ? 0 : deg === 90 ? 1 : deg < 180 ? 2 : 3);
  const AKN = k => L(cap(AKV[k]), cap(AKE[k]));
  const DESC = [   // numbers described by a condition: [value, vi, en]
    [999, 'số lớn nhất có ba chữ số', 'the largest 3-digit number'],
    [100, 'số bé nhất có ba chữ số', 'the smallest 3-digit number'],
    [998, 'số chẵn lớn nhất có ba chữ số', 'the largest even 3-digit number'],
    [101, 'số lẻ bé nhất có ba chữ số', 'the smallest odd 3-digit number'],
    [987, 'số lớn nhất có ba chữ số khác nhau', 'the largest 3-digit number with all different digits'],
    [102, 'số bé nhất có ba chữ số khác nhau', 'the smallest 3-digit number with all different digits'],
    [990, 'số tròn chục lớn nhất có ba chữ số', 'the largest 3-digit multiple of 10'],
    [9999, 'số lớn nhất có bốn chữ số', 'the largest 4-digit number'],
    [1000, 'số bé nhất có bốn chữ số', 'the smallest 4-digit number'],
    [9998, 'số chẵn lớn nhất có bốn chữ số', 'the largest even 4-digit number'],
    [1001, 'số lẻ bé nhất có bốn chữ số', 'the smallest odd 4-digit number'],
    [9876, 'số lớn nhất có bốn chữ số khác nhau', 'the largest 4-digit number with all different digits'],
    [1023, 'số bé nhất có bốn chữ số khác nhau', 'the smallest 4-digit number with all different digits'],
    [9900, 'số tròn trăm lớn nhất có bốn chữ số', 'the largest 4-digit multiple of 100'],
    [99, 'số lớn nhất có hai chữ số', 'the largest 2-digit number'],
  ];

  NC.add(4, [
    /* ======================= "Đặt tính rồi tính" ======================= */

    // within 100 000 (lớp 3 range, reviewed in Bài 2): borrowing across zeros
    { id: 'g4-dt-tru', from: 'giua-hk1', kinds: ['dt'], lesson: 'g4-c1-b2', gen: rng => {
      const k = R(rng, 2, 10);
      const a = k === 10 ? 100000 : k * 10000 + P(rng, [0, 0, R(rng, 1, 8), R(rng, 1, 9) * 10, R(rng, 1, 9) * 100]);
      let b = 0;
      for (let g = 0; g < 80; g++) { b = R(rng, Math.floor(a / 5), a - 1001); if (!String(b).includes('0') && b % 10 > a % 10) break; }
      const q = dt(a, b, M, a - b, J(`${F(a)} ${M} ${F(b)} = ${F(a - b)}`, L(`Thử lại: ${F(a - b)} + ${F(b)} = ${F(a)}.`, `Check: ${F(a - b)} + ${F(b)} = ${F(a)}.`)));
      q.hint = L('Hàng nào không trừ được thì lấy 1 ở hàng bên trái; gặp chữ số 0 thì lấy tiếp ở hàng bên trái nữa.', 'If a column cannot be subtracted, exchange 1 from the column on the left; if that digit is 0, go on to the next column on the left.');
      return q;
    } },

    // 5-digit : 1-digit with a 0 in the quotient (96 824 : 4 = 24 206)
    { id: 'g4-dt-chia1', from: 'giua-hk1', kinds: ['dt'], lesson: 'g4-c1-b2', gen: rng => {
      let d = 4, q = 24206;
      for (let g = 0; g < 300; g++) {
        const dd = R(rng, 2, 9), qq = R(rng, Math.ceil(10000 / dd), Math.floor(99999 / dd));
        if (hasInnerZero(qq)) { d = dd; q = qq; break; }
      }
      const r = dt(q * d, d, ':', q, J(`${F(q * d)} : ${d} = ${F(q)}`, L(`Thử lại: ${F(q)} × ${d} = ${F(q * d)}.`, `Check: ${F(q)} × ${d} = ${F(q * d)}.`)));
      r.hint = L('Lần chia nào được số bé hơn số chia thì viết 0 ở thương rồi hạ tiếp chữ số sau.', 'If the number you are dividing is smaller than the divisor, write 0 in the quotient and bring down the next digit.');
      return r;
    } },

    // within 100 000 × a one-digit number, carrying in every column
    { id: 'g4-dt-nhan1', from: 'giua-hk1', kinds: ['dt'], lesson: 'g4-c1-b2', gen: rng => {
      let a = 13897, d = 7;
      for (let g = 0; g < 300; g++) {
        const dd = R(rng, 6, 9), aa = R(rng, 1000, Math.floor(99999 / dd));
        if (String(aa).slice(1).split('').every(c => Number(c) >= 3)) { a = aa; d = dd; break; }
      }
      const r = dt(a, d, '×', a * d, J(`${F(a)} × ${d} = ${F(a * d)}`, L(`Thử lại: ${F(a * d)} : ${d} = ${F(a)}.`, `Check: ${F(a * d)} : ${d} = ${F(a)}.`)));
      r.hint = L('Nhân từ phải sang trái, nhớ cộng phần nhớ vào tích của hàng tiếp theo.', 'Multiply from right to left and add what you carried to the next product.');
      return r;
    } },

    // many digits (Bài 23): 500 000 − 123 456, 4 020 005 − 1 357 869, 967 832 − 79 826
    { id: 'g4-dt-tru-lon', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g4-c5-b23', gen: rng => {
      const len = P(rng, [6, 6, 7]), t = R(rng, 0, 2);
      let a;
      if (t === 0) a = R(rng, 2, 9) * Math.pow(10, len - 1);
      else if (t === 1) {
        for (;;) {
          const ds = [R(rng, 1, 9)];
          for (let i = 1; i < len; i++) ds.push(rng() < 0.5 ? 0 : R(rng, 1, 9));
          if (ds.filter(x => x === 0).length >= 2) { a = Number(ds.join('')); break; }
        }
      } else a = R(rng, Math.pow(10, len - 1), Math.pow(10, len) - 1);
      const a0 = Math.floor(a / Math.pow(10, len - 1));
      let bl = P(rng, [len, len - 1]); if (a0 === 1) bl = len - 1;
      const bd = []; for (let i = 0; i < bl; i++) bd.push(R(rng, 1, 9));
      if (bl === len) bd[0] = R(rng, 1, a0 - 1);
      const b = Number(bd.join(''));
      const q = dt(a, b, M, a - b, J(`${F(a)} ${M} ${F(b)} = ${F(a - b)}`, L(`Thử lại: ${F(a - b)} + ${F(b)} = ${F(a)}.`, `Check: ${F(a - b)} + ${F(b)} = ${F(a)}.`)));
      q.hint = L('Viết các chữ số cùng hàng thẳng cột. Gặp chữ số 0 thì lấy 1 ở hàng bên trái gần nhất có chữ số khác 0.', 'Line up the digits in columns. If a digit is 0, exchange from the nearest column on the left that is not 0.');
      return q;
    } },

    // many digits (Bài 22): a carry in every column
    { id: 'g4-dt-cong-lon', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g4-c5-b22', gen: rng => {
      const la = P(rng, [6, 7]), lb = P(rng, [la, la - 1]), da = [], db = [];
      for (let i = 0; i < la; i++) {
        if (i < lb) { const x = R(rng, 3, 9); da.push(x); db.push(R(rng, Math.max(1, 10 - x), 9)); }
        else da.push(R(rng, i === la - 1 ? 1 : 0, 9));
      }
      const a = Number(da.reverse().join('')), b = Number(db.reverse().join(''));
      return dt(a, b, '+', a + b, J(`${F(a)} + ${F(b)} = ${F(a + b)}`, L(`Thử lại: ${F(a + b)} ${M} ${F(b)} = ${F(a)}.`, `Check: ${F(a + b)} ${M} ${F(b)} = ${F(a)}.`)));
    } },

    // × a two-digit number (Bài 43) with many carries or a 0 inside
    { id: 'g4-dt-nhan2', from: 'giua-hk2', kinds: ['dt'], lesson: 'g4-c8-b43', gen: rng => {
      const b = R(rng, 3, 9) * 10 + R(rng, 3, 9), t = R(rng, 0, 2);
      let a;
      if (t === 0) { const ds = [R(rng, 1, 9)], len = P(rng, [2, 3]); for (let i = 0; i < len; i++) ds.push(R(rng, 4, 9)); a = Number(ds.join('')); }
      else { const ds = [R(rng, 1, 9), R(rng, 1, 9), R(rng, 1, 9), R(rng, 1, 9)]; ds[R(rng, 1, 2)] = 0; a = Number(ds.join('')); }
      const r = dt(a, b, '×', a * b);
      r.hint = L('Tính tích riêng thứ nhất, tích riêng thứ hai (viết lùi sang trái một cột), rồi cộng hai tích riêng.', 'Work out the first partial product and the second one (written one column to the left), then add them.');
      return r;
    } },

    // : a two-digit number (Bài 44) with a 0 in the quotient
    { id: 'g4-dt-chia2', from: 'giua-hk2', kinds: ['dt'], lesson: 'g4-c8-b44', gen: rng => {
      let d = 24, q = 1022;
      for (let g = 0; g < 400; g++) {
        const dd = R(rng, 12, 98); if (dd % 10 === 0) continue;
        const qq = R(rng, 100, Math.floor(99999 / dd));
        if (hasInnerZero(qq) && qq * dd >= 1000) { d = dd; q = qq; break; }
      }
      const r = dt(q * d, d, ':', q, J(`${F(q * d)} : ${d} = ${F(q)}`, L(`Thử lại: ${F(q)} × ${d} = ${F(q * d)}.`, `Check: ${F(q)} × ${d} = ${F(q * d)}.`)));
      r.hint = L('Ước lượng thương ở mỗi lần chia. Lần nào số bị chia bé hơn số chia thì viết 0 ở thương.', 'Estimate each digit of the quotient. If the number is smaller than the divisor, write 0 in the quotient.');
      return r;
    } },

    /* ======================= Giữa học kì I (Bài 1–14) ======================= */

    // shopping in three steps: change, money still needed, or the price of one item worked backwards
    { id: 'g4-mua-hang', from: 'giua-hk1', kinds: ['tl'], lesson: 'g4-c1-b5', gen: rng => {
      let it, one, n, p, c;
      for (let g = 0; g < 60; g++) {
        it = P(rng, SHOP); one = P(rng, ONE);
        p = R(rng, it[3], it[4]) * 1000 + P(rng, [0, 0, 500]); c = R(rng, one[3], one[4]) * 1000; n = R(rng, 3, 8);
        if (n * p + c <= 90000) break;
      }
      if (n * p + c > 90000) n = 3;
      const cost = n * p, tot = cost + c, who = NC.name(rng), f = R(rng, 0, 2);
      const pay = tot < 50000 && rng() < 0.5 ? 50000 : 100000;
      const buyV = `${n} ${it[0]}, mỗi ${it[1]} giá ${F(p)} đồng`, buyE = `${n} ${it[2]} at ${F(p)} dong each`;
      const step1 = [L(`Số tiền mua ${n} ${it[0]} là:`, `Cost of the ${n} ${it[2]}:`), `${F(p)} × ${n} = ${F(cost)} (${DONG})`];
      if (f === 0) {
        return Q(L(`Mẹ mua cho ${who} ${buyV} và 1 ${one[0]} giá ${F(c)} đồng. Mẹ đưa cô bán hàng ${F(pay)} đồng. Hỏi cô bán hàng phải trả lại mẹ bao nhiêu tiền?`,
          `Mum buys ${who} ${buyE} and ${one[1]} for ${F(c)} dong. She gives the shop assistant ${F(pay)} dong. How much change should she get?`),
        num(pay - tot, DONG), J(...step1, L('Mẹ phải trả tất cả số tiền là:', 'Total cost:'), `${F(cost)} + ${F(c)} = ${F(tot)} (${DONG})`,
          L('Cô bán hàng phải trả lại mẹ số tiền là:', 'Change:'), `${F(pay)} ${M} ${F(tot)} = ${F(pay - tot)} (${DONG})`, doneD(pay - tot)),
        { hint: L('Tính tiền vở trước, rồi tổng số tiền phải trả, rồi tiền trả lại.', 'First the cost of the items, then the total, then the change.') });
      }
      if (f === 1) {
        let have = Math.floor((tot - 1) / 10000) * 10000; if (have >= 30000 && rng() < 0.5) have -= 10000;
        return Q(L(`${who} có ${F(have)} đồng. ${who} muốn mua ${buyV} và 1 ${one[0]} giá ${F(c)} đồng. Hỏi ${who} còn thiếu bao nhiêu tiền?`,
          `${who} has ${F(have)} dong. ${who} wants to buy ${buyE} and ${one[1]} for ${F(c)} dong. How much more money does ${who} need?`),
        num(tot - have, DONG), J(...step1, L('Số tiền cần để mua tất cả là:', 'Total cost:'), `${F(cost)} + ${F(c)} = ${F(tot)} (${DONG})`,
          L(`${who} còn thiếu số tiền là:`, `${who} still needs:`), `${F(tot)} ${M} ${F(have)} = ${F(tot - have)} (${DONG})`, doneD(tot - have)));
      }
      const chg = pay - tot;
      return Q(L(`Mẹ mua ${buyV} và 1 ${one[0]}. Mẹ đưa cô bán hàng ${F(pay)} đồng và được trả lại ${F(chg)} đồng. Hỏi 1 ${one[0]} giá bao nhiêu tiền?`,
        `Mum buys ${buyE} and ${one[1]}. She gives the shop assistant ${F(pay)} dong and gets ${F(chg)} dong change. How much does ${one[2]} cost?`),
      num(c, DONG), J(L('Mẹ đã trả tất cả số tiền là:', 'Mum paid altogether:'), `${F(pay)} ${M} ${F(chg)} = ${F(tot)} (${DONG})`, ...step1,
        L(`Giá tiền 1 ${one[0]} là:`, `Cost of ${one[2]}:`), `${F(tot)} ${M} ${F(cost)} = ${F(c)} (${DONG})`, doneD(c)),
      { hint: L('Tìm số tiền mẹ đã trả trước.', 'First find how much Mum paid.') });
    } },

    // the price of one item from two shopping lists
    { id: 'g4-hai-gia', from: 'giua-hk1', kinds: ['tl'], lesson: 'g4-c1-b5', gen: rng => {
      const c = P(rng, PAIRS);
      let a = R(rng, c[6], c[7]) * 1000 + P(rng, [0, 500]); const b = R(rng, c[8], c[9]) * 1000; if (a === b) a += 500;
      if (rng() < 0.5) {
        const x = R(rng, 2, 5), T1 = x * a + b, T2 = (x + 1) * a + b;
        return Q(L(`Mua ${x} ${c[0]} và 1 ${c[1]} hết ${F(T1)} đồng. Mua ${x + 1} ${c[0]} và 1 ${c[1]} như thế hết ${F(T2)} đồng. Hỏi 1 ${c[1]} giá bao nhiêu tiền?`,
          `${x} ${c[2]} and 1 ${c[4]} cost ${F(T1)} dong. ${x + 1} ${c[2]} and 1 ${c[4]} of the same kind cost ${F(T2)} dong. How much does 1 ${c[4]} cost?`),
        num(b, DONG), J(L(`Lần sau mua nhiều hơn lần trước 1 ${c[0]}, nên giá 1 ${c[0]} là:`, `The second time, 1 more ${c[3]} was bought, so 1 ${c[3]} costs:`),
          `${F(T2)} ${M} ${F(T1)} = ${F(a)} (${DONG})`, L(`Giá tiền ${x} ${c[0]} là:`, `Cost of ${x} ${c[2]}:`), `${F(a)} × ${x} = ${F(a * x)} (${DONG})`,
          L(`Giá 1 ${c[1]} là:`, `Cost of 1 ${c[4]}:`), `${F(T1)} ${M} ${F(a * x)} = ${F(b)} (${DONG})`, doneD(b)),
        { hint: L('So sánh hai lần mua: lần sau mua thêm gì?', 'Compare the two lists: what was bought in addition the second time?') });
      }
      let x, y, k, T1, T2;
      for (let g = 0; g < 40; g++) { x = R(rng, 1, 3); y = R(rng, 2, 3); k = R(rng, 2, 4); T1 = x * a + y * b; T2 = (x + k) * a + y * b; if (T2 <= 99000) break; }
      if (T2 > 99000) { x = 1; y = 2; k = 2; T1 = a + 2 * b; T2 = 3 * a + 2 * b; }
      return Q(L(`Mua ${x} ${c[0]} và ${y} ${c[1]} hết ${F(T1)} đồng. Mua ${x + k} ${c[0]} và ${y} ${c[1]} như thế hết ${F(T2)} đồng. Hỏi 1 ${c[0]} giá bao nhiêu tiền?`,
        `${x} ${pl(x, c[3], c[2])} and ${y} ${c[5]} cost ${F(T1)} dong. ${x + k} ${c[2]} and ${y} ${c[5]} of the same kind cost ${F(T2)} dong. How much does 1 ${c[3]} cost?`),
      num(a, DONG), J(L(`Hai lần mua cùng số ${c[1]}, lần sau mua nhiều hơn lần trước ${k} ${c[0]}.`, `Both times ${y} ${c[5]} were bought; the second time ${k} more ${c[2]} were bought.`),
        L(`Giá tiền ${k} ${c[0]} là:`, `Cost of ${k} ${c[2]}:`), `${F(T2)} ${M} ${F(T1)} = ${F(k * a)} (${DONG})`,
        L(`Giá 1 ${c[0]} là:`, `Cost of 1 ${c[3]}:`), `${F(k * a)} : ${k} = ${F(a)} (${DONG})`, doneD(a)));
    } },

    // the largest / smallest (even, odd) six-digit number made from six given digits
    { id: 'g4-lap-so', from: 'giua-hk1', kinds: ['tn'], lesson: 'g4-c3-b14', gen: rng => {
      const ds = rng() < 0.7 ? U.sample(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9], 5).concat([0]) : U.sample(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9], 6);
      const shown = U.shuffle(rng, ds), all = perms(ds);
      const val = c => { const xs = all.filter(v => c[2] === 0 || v % 2 === (c[2] === 2 ? 0 : 1)); return xs.length ? (c[3] ? Math.max(...xs) : Math.min(...xs)) : null; };
      let c = P(rng, LAPSO); while (val(c) == null) c = P(rng, LAPSO);
      const v = val(c), u = v % 10, s = String(v), j = R(rng, 1, 4);
      const swap = Number(s.slice(0, j) + s[j + 1] + s[j] + s.slice(j + 2));
      const others = U.shuffle(rng, LAPSO.map(val).filter(x => x != null && x !== v));
      const pv = c[2] === 2 ? 'chẵn' : 'lẻ', pe = c[2] === 2 ? 'even' : 'odd';
      let why;
      if (c[2] === 0 && c[3]) why = L(`Muốn được số lớn nhất, ta xếp các chữ số từ lớn đến bé: ${F(v)}.`, `To make the largest number, put the digits in order from largest to smallest: ${F(v)}.`);
      else if (c[2] === 0) why = ds.includes(0)
        ? L(`Chữ số 0 không đứng đầu được, nên hàng trăm nghìn là chữ số bé nhất khác 0 (${s[0]}); các chữ số còn lại xếp từ bé đến lớn: ${F(v)}.`, `0 cannot be the first digit, so the hundred thousands digit is the smallest digit that is not 0 (${s[0]}); the other digits go from smallest to largest: ${F(v)}.`)
        : L(`Muốn được số bé nhất, ta xếp các chữ số từ bé đến lớn: ${F(v)}.`, `To make the smallest number, put the digits in order from smallest to largest: ${F(v)}.`);
      else if (c[3]) why = L(`Số ${pv} có chữ số hàng đơn vị là chữ số ${pv}. Để số lớn nhất, ta dành chữ số ${pv} bé nhất (${u}) cho hàng đơn vị, các chữ số còn lại xếp từ lớn đến bé: ${F(v)}.`,
        `An ${pe === 'odd' ? 'odd' : 'even'} number has an ${pe} ones digit. To make it as large as possible, keep the smallest ${pe} digit (${u}) for the ones place and put the other digits in order from largest to smallest: ${F(v)}.`);
      else why = L(`Số ${pv} có chữ số hàng đơn vị là chữ số ${pv}. Để số bé nhất, từ trái sang phải mỗi hàng lấy chữ số bé nhất có thể (chữ số 0 không đứng đầu), hàng đơn vị là chữ số ${pv}: ${F(v)}.`,
        `An ${pe} number has an ${pe} ones digit. To make it as small as possible, go from the left and use the smallest digit you can in each place (0 cannot go first), keeping an ${pe} digit for the ones place: ${F(v)}.`);
      return Q(L(`Từ sáu chữ số ${shown.join('; ')}, hãy lập số ${c[0]} có sáu chữ số, mỗi chữ số dùng đúng một lần.`,
        `Use each of the six digits ${shown.join(', ')} exactly once. Make ${c[1]} six-digit number you can.`),
      ch(rng, v, [swap].concat(others)), why,
      { hint: L('Chữ số ở hàng càng cao thì giá trị càng lớn.', 'The further left a digit is, the more it is worth.') });
    } },

    // rounding worked backwards: the largest / smallest number that rounds to a given number
    { id: 'g4-lam-tron', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c3-b13', gen: rng => {
      const f = R(rng, 0, 2), [p, pv, pe] = f === 2 ? P(rng, PLACES.slice(0, 2)) : P(rng, PLACES);
      const X = p === 100000 ? R(rng, 2, 9) * p : p === 10000 ? R(rng, 11, f === 2 ? 49 : 99) * p : R(rng, f === 2 ? 11 : 21, f === 2 ? 99 : 999) * p;
      const lo = X - p / 2, hi = X + p / 2 - 1;
      const range = L(`Các số làm tròn đến ${pv} được ${F(X)} là các số từ ${F(lo)} đến ${F(hi)}: số bé hơn ${F(lo)} thì làm tròn được ${F(X - p)}, số từ ${F(hi + 1)} trở lên thì làm tròn được ${F(X + p)}.`,
        `The numbers that round to ${F(X)} (to ${pe}) are the numbers from ${F(lo)} to ${F(hi)}: a number below ${F(lo)} rounds to ${F(X - p)}, and a number from ${F(hi + 1)} upwards rounds to ${F(X + p)}.`);
      const hint = L('Xét chữ số ngay sau hàng làm tròn: từ 5 trở lên thì làm tròn lên, bé hơn 5 thì làm tròn xuống.', 'Look at the digit just after the rounding place: 5 or more rounds up, less than 5 rounds down.');
      if (f === 2) {
        const most = rng() < 0.5, v = most ? hi : lo;
        const [sv, se] = P(rng, [['người đến xem lễ hội hoa', 'people came to the flower festival'], ['người tham gia giải chạy', 'people took part in the fun run'], ['lượt khách đến thăm bảo tàng', 'visits were made to the museum']]);
        return Q(L(`Làm tròn đến ${pv} thì có ${F(X)} ${sv}. Hỏi số ${sv} ${most ? 'nhiều nhất' : 'ít nhất'} có thể là bao nhiêu?`,
          `Rounded to ${pe}, ${F(X)} ${se}. What is the ${most ? 'greatest' : 'smallest'} number it could be?`),
        num(v), J(range, most ? L(`Vậy nhiều nhất là ${F(hi)}.`, `So the greatest number is ${F(hi)}.`) : L(`Vậy ít nhất là ${F(lo)}.`, `So the smallest number is ${F(lo)}.`)), { hint });
      }
      const [cv, ce, v, last] = P(rng, [
        ['lớn nhất', 'the largest', hi, L(`Số lớn nhất là ${F(hi)}.`, `The largest is ${F(hi)}.`)],
        ['bé nhất', 'the smallest', lo, L(`Số bé nhất là ${F(lo)}.`, `The smallest is ${F(lo)}.`)],
        ['chẵn lớn nhất', 'the largest even', hi - 1, L(`${F(hi)} là số lẻ, nên số chẵn lớn nhất là ${F(hi - 1)}.`, `${F(hi)} is odd, so the largest even number is ${F(hi - 1)}.`)],
        ['lẻ bé nhất', 'the smallest odd', lo + 1, L(`${F(lo)} là số chẵn, nên số lẻ bé nhất là ${F(lo + 1)}.`, `${F(lo)} is even, so the smallest odd number is ${F(lo + 1)}.`)],
      ]);
      return Q(L(`Tìm số ${cv} mà khi làm tròn đến ${pv} thì được ${F(X)}.`, `Find ${ce} number that rounds to ${F(X)} when it is rounded to ${pe}.`),
        num(v), J(range, last), { hint });
    } },

    // angles: clock hands (30° between two numbers next to each other), a straight angle split in two
    { id: 'g4-goc', from: 'giua-hk1', kinds: ['tn'], lesson: 'g4-c2-b8', gen: rng => {
      const f = R(rng, 0, 3);
      const timeV = (h, pm) => `${pm ? h + 12 : h} giờ`, timeE = (h, pm) => (pm ? `${h + 12}:00` : `${h} o'clock`);
      if (f <= 1) {
        const h = R(rng, 1, 11), pm = rng() < 0.4, mn = Math.min(h, 12 - h), deg = 30 * mn, k = akind(deg);
        const why = J(L(`Lúc ${timeV(h, pm)}, kim phút chỉ số 12, kim giờ chỉ số ${h}.`, `At ${timeE(h, pm)}, the minute hand points to 12 and the hour hand points to ${h}.`),
          L(`Giữa hai số liền nhau trên mặt đồng hồ là 30°, nên góc giữa hai kim là: 30° × ${mn} = ${deg}°.`, `There are 30° between two numbers next to each other on the clock face, so the angle between the hands is 30° × ${mn} = ${deg}°.`),
          L(`Đó là ${AKV[k]}.`, `That is ${AKE[k]}.`));
        if (f === 0) return Q(L(`Lúc ${timeV(h, pm)} đúng, kim giờ và kim phút của đồng hồ tạo thành góc gì?`, `At exactly ${timeE(h, pm)}, what kind of angle do the hour hand and the minute hand make?`),
          ch(rng, AKN(k), [0, 1, 2, 3].filter(x => x !== k).map(AKN)), why);
        const ds = [deg + 30, deg - 30, deg + 60, deg - 60, mn * 15].filter(x => x > 0 && x <= 180 && x !== deg);
        return Q(L(`Lúc ${timeV(h, pm)} đúng, góc tạo bởi kim giờ và kim phút bằng bao nhiêu độ?`, `At exactly ${timeE(h, pm)}, how many degrees is the angle between the hour hand and the minute hand?`),
          ch(rng, `${deg}°`, U.shuffle(rng, ds).map(x => `${x}°`)), why);
      }
      if (f === 2) {
        const k = R(rng, 0, 3), hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const kOf = h => akind(30 * Math.min(h, 12 - h));
        const h = P(rng, hours.filter(x => kOf(x) === k)), wrong = U.shuffle(rng, hours.filter(x => kOf(x) !== k)).slice(0, 3);
        const tV = x => `${x} giờ`, tE = x => `${x} o'clock`;
        return Q(L(`Lúc mấy giờ đúng thì kim giờ và kim phút của đồng hồ tạo thành ${AKV[k]}?`, `At what time do the hour hand and the minute hand make ${AKE[k]}?`),
          ch(rng, L(tV(h), tE(h)), wrong.map(x => L(tV(x), tE(x)))),
          J(L(`Lúc ${h} giờ, góc giữa hai kim là 30° × ${Math.min(h, 12 - h)} = ${30 * Math.min(h, 12 - h)}°, là ${AKV[k]}.`, `At ${h} o'clock the angle between the hands is 30° × ${Math.min(h, 12 - h)} = ${30 * Math.min(h, 12 - h)}°, which is ${AKE[k]}.`),
            L(`Các giờ còn lại: ${wrong.map(x => `${x} giờ là ${AKV[kOf(x)]}`).join('; ')}.`, `The other times: ${wrong.map(x => `${x} o'clock makes ${AKE[kOf(x)]}`).join('; ')}.`)));
      }
      let a = R(rng, 4, 32) * 5; if (a === 90) a = 85;
      const b = 180 - a, k = akind(b), askDeg = rng() < 0.5;
      const why = J(L(`Góc bẹt bằng 180°, nên góc zOy bằng: 180° ${M} ${a}° = ${b}°.`, `A straight angle is 180°, so angle zOy is 180° ${M} ${a}° = ${b}°.`), L(`Góc zOy là ${AKV[k]}.`, `Angle zOy is ${AKE[k]}.`));
      const stem = L(`Góc bẹt xOy được tia Oz chia thành hai góc: góc xOz và góc zOy. Biết góc xOz bằng ${a}°.`, `The straight angle xOy is split by the ray Oz into two angles, xOz and zOy. Angle xOz is ${a}°.`);
      if (askDeg) return Q(`${stem}\n${L('Góc zOy bằng bao nhiêu độ?', 'How many degrees is angle zOy?')}`, ch(rng, `${b}°`, [`${a}°`, `${b + 10}°`, `${b - 10}°`, `${Math.abs(90 - a)}°`]), why);
      return Q(`${stem}\n${L('Góc zOy là góc gì?', 'What kind of angle is zOy?')}`, ch(rng, AKN(k), [0, 1, 2, 3].filter(x => x !== k).map(AKN)), why);
    } },

    // finding a number by working backwards; a division with the largest possible remainder
    { id: 'g4-tim-so', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c1-b2', gen: rng => {
      const f = R(rng, 0, 3), who = NC.name(rng), k = R(rng, 3, 9);
      const hint = L('Làm ngược lại từ kết quả.', 'Work backwards from the result.');
      if (f === 0) {
        let x, c, r; do { x = R(rng, 1000, 15000); c = R(rng, 100, 9999); r = x * k + c; } while (r > 99999);
        return Q(L(`Tìm một số, biết rằng lấy số đó nhân với ${k} rồi cộng thêm ${F(c)} thì được ${F(r)}.`, `Find the number. If you multiply it by ${k} and then add ${F(c)}, you get ${F(r)}.`),
          num(x), J(L(`Số đó nhân với ${k} thì được:`, `The number multiplied by ${k} is:`), `${F(r)} ${M} ${F(c)} = ${F(x * k)}`, L('Số cần tìm là:', 'The number is:'), `${F(x * k)} : ${k} = ${F(x)}`, done(F(x))), { hint });
      }
      if (f === 1) {
        const m = R(rng, 1000, Math.floor(99999 / k)), x = m * k, c = R(rng, 100, m - 100), r = m - c;
        return Q(L(`Tìm một số, biết rằng lấy số đó chia cho ${k} rồi trừ đi ${F(c)} thì được ${F(r)}.`, `Find the number. If you divide it by ${k} and then subtract ${F(c)}, you get ${F(r)}.`),
          num(x), J(L(`Số đó chia cho ${k} thì được:`, `The number divided by ${k} is:`), `${F(r)} + ${F(c)} = ${F(m)}`, L('Số cần tìm là:', 'The number is:'), `${F(m)} × ${k} = ${F(x)}`, done(F(x))), { hint });
      }
      if (f === 2) {
        let x, c, r; do { x = R(rng, 100, 9999); c = R(rng, 10, 999); r = x * k - c; } while (r <= 0 || r > 99999);
        return Q(L(`${who} nghĩ ra một số. Lấy số đó gấp lên ${k} lần rồi bớt đi ${F(c)} thì được ${F(r)}. Hỏi ${who} đã nghĩ ra số nào?`, `${who} thinks of a number, multiplies it by ${k}, then takes away ${F(c)} and gets ${F(r)}. What number did ${who} think of?`),
          num(x), J(L(`Trước khi bớt đi ${F(c)}, số đó gấp lên ${k} lần là:`, `Before taking away ${F(c)}, the number multiplied by ${k} was:`), `${F(r)} + ${F(c)} = ${F(x * k)}`,
            L(`Số ${who} đã nghĩ là:`, `The number ${who} thought of:`), `${F(x * k)} : ${k} = ${F(x)}`, done(F(x))), { hint });
      }
      const d = R(rng, 3, 9), q = R(rng, 1000, Math.floor((99999 - d + 1) / d)), a = q * d + d - 1;
      return Q(L(`Trong một phép chia cho ${d}, thương là ${F(q)} và số dư là số dư lớn nhất có thể. Tìm số bị chia.`, `In a division by ${d}, the quotient is ${F(q)} and the remainder is the largest remainder possible. Find the dividend.`),
        num(a), J(L(`Số dư luôn bé hơn số chia, nên số dư lớn nhất là: ${d} ${M} 1 = ${d - 1}.`, `The remainder is always smaller than the divisor, so the largest remainder is ${d} ${M} 1 = ${d - 1}.`),
          L('Số bị chia là:', 'The dividend is:'), `${F(q)} × ${d} + ${d - 1} = ${F(a)}`, done(F(a))),
        { hint: L('Số bị chia = thương × số chia + số dư.', 'Dividend = quotient × divisor + remainder.') });
    } },

    // three steps with no money: working backwards, the third part of a total, "as many as the first two together"
    { id: 'g4-ba-buoc', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c1-b5', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const [gv, uw, u, ge, ew] = P(rng, [['gạo', 'ki-lô-gam', 'kg', 'rice', 'kilograms'], ['vải', 'mét', 'm', 'cloth', 'metres'], ['đường', 'ki-lô-gam', 'kg', 'sugar', 'kilograms']]);
        const a = R(rng, 120, 900), k = R(rng, 2, 3), r = R(rng, 150, 2500), s = a + a * k, init = s + r;
        return Q(L(`Một cửa hàng có một số ${uw} ${gv}. Ngày thứ nhất cửa hàng bán được ${a} ${u}, ngày thứ hai bán được gấp ${k} lần ngày thứ nhất. Sau hai ngày, cửa hàng còn lại ${F(r)} ${u} ${gv}. Hỏi lúc đầu cửa hàng có bao nhiêu ${uw} ${gv}?`,
          `A shop had some ${ge}. On the first day it sold ${a} ${u}. On the second day it sold ${k} times as much as on the first day. After the two days, ${F(r)} ${u} of ${ge} was left. How many ${ew} of ${ge} did the shop have at first?`),
        num(init, u), J(L('Ngày thứ hai cửa hàng bán được là:', 'Sold on the second day:'), `${a} × ${k} = ${a * k} (${u})`, L('Cả hai ngày cửa hàng bán được là:', 'Sold on the two days:'), `${a} + ${a * k} = ${F(s)} (${u})`,
          L('Lúc đầu cửa hàng có là:', 'At first the shop had:'), `${F(s)} + ${F(r)} = ${F(init)} (${u})`, done(F(init), u, u)),
        { hint: L('Lúc đầu = số đã bán + số còn lại.', 'At first = what was sold + what was left.') });
      }
      if (f === 1) {
        const more = rng() < 0.5, a = R(rng, 40, 90), d = R(rng, 5, 20), b = more ? a + d : a - d, c = R(rng, 25, 90), T = a + b + c;
        return Q(L(`Ba lớp 4A, 4B, 4C quyên góp được tất cả ${T} quyển sách. Lớp 4A quyên góp được ${a} quyển, lớp 4B quyên góp được ${more ? 'nhiều' : 'ít'} hơn lớp 4A ${d} quyển. Hỏi lớp 4C quyên góp được bao nhiêu quyển sách?`,
          `Classes 4A, 4B and 4C collected ${T} books altogether. Class 4A collected ${a} books. Class 4B collected ${d} ${more ? 'more' : 'fewer'} books than class 4A. How many books did class 4C collect?`),
        num(c, L('quyển', 'books')), J(L('Lớp 4B quyên góp được là:', 'Class 4B collected:'), `${a} ${more ? '+' : M} ${d} = ${b} (${L('quyển', 'books')})`,
          L('Hai lớp 4A và 4B quyên góp được là:', 'Classes 4A and 4B collected:'), `${a} + ${b} = ${a + b} (${L('quyển', 'books')})`,
          L('Lớp 4C quyên góp được là:', 'Class 4C collected:'), `${T} ${M} ${a + b} = ${c} (${L('quyển', 'books')})`, done(c, 'quyển sách', 'books')));
      }
      const a = R(rng, 30, 200), d = R(rng, 5, 40), b = a + d, c = a + b, T = a + b + c;
      return Q(L(`Ngày thứ nhất đội trồng cây trồng được ${a} cây, ngày thứ hai trồng được nhiều hơn ngày thứ nhất ${d} cây, ngày thứ ba trồng được bằng số cây của cả hai ngày đầu cộng lại. Hỏi cả ba ngày đội trồng được bao nhiêu cây?`,
        `On the first day a team planted ${a} trees. On the second day it planted ${d} more trees than on the first day. On the third day it planted as many trees as on the first two days put together. How many trees did the team plant in the three days?`),
      num(T, L('cây', 'trees')), J(L('Ngày thứ hai trồng được là:', 'Planted on the second day:'), `${a} + ${d} = ${b} (${L('cây', 'trees')})`,
        L('Ngày thứ ba trồng được là:', 'Planted on the third day:'), `${a} + ${b} = ${c} (${L('cây', 'trees')})`,
        L('Cả ba ngày trồng được là:', 'Planted in the three days:'), `${a} + ${b} + ${c} = ${T} (${L('cây', 'trees')})`, done(T, 'cây', 'trees')));
    } },

    /* ======================= Cuối học kì I (+ Bài 15–31) ======================= */

    // tấn, tạ, yến and kg in three steps (the elephant family of real school papers)
    { id: 'g4-voi', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c4-b17', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const t = R(rng, 3, 5), q = R(rng, 0, 5), Fa = t * 1000 + q * 100, d1 = R(rng, 4, 9), Mo = Fa - d1 * 100, d2 = R(rng, 5, 9), C = Mo - d2 * 100, T = Fa + Mo + C;
        return Q(L(`Trong một gia đình voi, voi bố nặng ${tanVi(t, q)}, voi mẹ nhẹ hơn voi bố ${d1} tạ, voi con nhẹ hơn voi mẹ ${d2} tạ. Hỏi cả gia đình voi nặng bao nhiêu ki-lô-gam?`,
          `In a family of elephants, the father weighs ${tanEn(t, q)}. The mother is ${d1} quintals lighter than the father, and the baby is ${d2} quintals lighter than the mother. How many kilograms does the whole elephant family weigh?`),
        num(T, 'kg'), J(L(`Đổi: ${tanVi(t, q)} = ${F(Fa)} kg; ${d1} tạ = ${d1 * 100} kg; ${d2} tạ = ${d2 * 100} kg.`, `Convert: ${tanEn(t, q)} = ${F(Fa)} kg; ${d1} quintals = ${d1 * 100} kg; ${d2} quintals = ${d2 * 100} kg.`),
          L('Voi mẹ nặng là:', 'The mother weighs:'), `${F(Fa)} ${M} ${d1 * 100} = ${F(Mo)} (kg)`, L('Voi con nặng là:', 'The baby weighs:'), `${F(Mo)} ${M} ${d2 * 100} = ${F(C)} (kg)`,
          L('Cả gia đình voi nặng là:', 'The whole family weighs:'), `${F(Fa)} + ${F(Mo)} + ${F(C)} = ${F(T)} (kg)`, done(F(T), 'kg', 'kg')),
        { hint: L('1 tấn = 1000 kg; 1 tạ = 100 kg.', '1 tonne = 1000 kg; 1 quintal = 100 kg.') });
      }
      if (f === 1) {
        const a = R(rng, 2, 4), b = R(rng, 1, 9), X1 = a * 1000 + b * 100, c = R(rng, 3, 9), X2 = X1 - c * 100, e = R(rng, 3, 9) * 50, X3 = X2 + e, T = X1 + X2 + X3;
        return Q(L(`Xe thứ nhất chở ${tanVi(a, b)} gạo, xe thứ hai chở ít hơn xe thứ nhất ${c} tạ gạo, xe thứ ba chở nhiều hơn xe thứ hai ${e} kg gạo. Hỏi cả ba xe chở được bao nhiêu ki-lô-gam gạo?`,
          `The first lorry carries ${tanEn(a, b)} of rice. The second lorry carries ${c} quintals less than the first. The third lorry carries ${e} kg more than the second. How many kilograms of rice do the three lorries carry altogether?`),
        num(T, 'kg'), J(L(`Đổi: ${tanVi(a, b)} = ${F(X1)} kg; ${c} tạ = ${c * 100} kg.`, `Convert: ${tanEn(a, b)} = ${F(X1)} kg; ${c} quintals = ${c * 100} kg.`),
          L('Xe thứ hai chở được là:', 'The second lorry carries:'), `${F(X1)} ${M} ${c * 100} = ${F(X2)} (kg)`, L('Xe thứ ba chở được là:', 'The third lorry carries:'), `${F(X2)} + ${e} = ${F(X3)} (kg)`,
          L('Cả ba xe chở được là:', 'The three lorries carry:'), `${F(X1)} + ${F(X2)} + ${F(X3)} = ${F(T)} (kg)`, done(F(T), 'kg', 'kg')));
      }
      const t = R(rng, 2, 5), q = R(rng, 5, 9), y = R(rng, 5, 20), d1 = q * 100, d2 = d1 - y * 10, rest = t * 1000 - d1 - d2;
      return Q(L(`Một cửa hàng có ${t} tấn gạo. Ngày thứ nhất cửa hàng bán được ${q} tạ gạo, ngày thứ hai bán được ít hơn ngày thứ nhất ${y} yến gạo. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`,
        `A shop has ${t} tonnes of rice. On the first day it sells ${q} quintals. On the second day it sells ${y} yến less than on the first day. How many kilograms of rice are left?`),
      num(rest, 'kg'), J(L(`Đổi: ${t} tấn = ${t * 1000} kg; ${q} tạ = ${d1} kg; ${y} yến = ${y * 10} kg.`, `Convert: ${t} tonnes = ${t * 1000} kg; ${q} quintals = ${d1} kg; ${y} yến = ${y * 10} kg.`),
        L('Ngày thứ hai cửa hàng bán được là:', 'Sold on the second day:'), `${d1} ${M} ${y * 10} = ${d2} (kg)`, L('Cả hai ngày cửa hàng bán được là:', 'Sold on the two days:'), `${d1} + ${d2} = ${d1 + d2} (kg)`,
        L('Cửa hàng còn lại là:', 'Left:'), `${t * 1000} ${M} ${d1 + d2} = ${rest} (kg)`, done(F(rest), 'kg', 'kg')),
      { hint: L('1 tấn = 1000 kg; 1 tạ = 100 kg; 1 yến = 10 kg.', '1 tonne = 1000 kg; 1 quintal = 100 kg; 1 yến = 10 kg.') });
    } },

    // ages with sum and difference: in a few years, a difference that never changes, a sum in the future
    { id: 'g4-tuoi', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c5-b25', gen: rng => {
      const who = NC.name(rng), [av, ae, lo, hi] = P(rng, [['mẹ', 'mum', 22, 30], ['bố', 'dad', 25, 34]]);
      const c = R(rng, 6, 14), d = R(rng, lo, hi), A = c + d, S = A + c, n = R(rng, 2, Math.min(5, c - 1)), f = R(rng, 0, 2);
      const AGE = L('tuổi', 'years old'), YR = L('tuổi', 'years');
      const childNow = [L(`Tuổi của ${who} hiện nay là:`, `${who}'s age now:`), `(${S} ${M} ${d}) : 2 = ${c} (${YR})`];
      if (f === 0) return Q(L(`Hiện nay tổng số tuổi của ${av} và ${who} là ${S} tuổi. ${cap(av)} hơn ${who} ${d} tuổi. Hỏi ${n} năm nữa ${who} bao nhiêu tuổi?`,
        `Right now, the ages of ${who} and ${who}'s ${ae} add up to ${S} years. ${who}'s ${ae} is ${d} years older than ${who}. How old will ${who} be in ${n} years' time?`),
      num(c + n, AGE), J(...childNow, L(`${n} năm nữa ${who} có số tuổi là:`, `In ${n} years' time ${who} will be:`), `${c} + ${n} = ${c + n} (${YR})`, done(c + n, 'tuổi', 'years old')));
      if (f === 1) return Q(L(`Hiện nay tổng số tuổi của ${av} và ${who} là ${S} tuổi. Cách đây ${n} năm, ${av} hơn ${who} ${d} tuổi. Tính tuổi của ${av} hiện nay.`,
        `Right now, the ages of ${who} and ${who}'s ${ae} add up to ${S} years. ${n} years ago, ${who}'s ${ae} was ${d} years older than ${who}. How old is ${who}'s ${ae} now?`),
      num(A, AGE), J(L(`Hiệu số tuổi của hai người không thay đổi theo thời gian, nên hiện nay ${av} vẫn hơn ${who} ${d} tuổi.`, `The difference between two people's ages never changes, so ${who}'s ${ae} is still ${d} years older than ${who}.`),
        L(`Tuổi của ${av} hiện nay là:`, `${cap(ae)}'s age now:`), `(${S} + ${d}) : 2 = ${A} (${YR})`, done(A, 'tuổi', 'years old')),
      { hint: L('Hai người cùng thêm (hoặc bớt) một số tuổi như nhau.', 'Both people get older by the same number of years.') });
      return Q(L(`Sau ${n} năm nữa, tổng số tuổi của ${av} và ${who} là ${S + 2 * n} tuổi. ${cap(av)} hơn ${who} ${d} tuổi. Tính tuổi của ${who} hiện nay.`,
        `In ${n} years' time, the ages of ${who} and ${who}'s ${ae} will add up to ${S + 2 * n} years. ${who}'s ${ae} is ${d} years older than ${who}. How old is ${who} now?`),
      num(c, AGE), J(L(`Sau ${n} năm, mỗi người thêm ${n} tuổi, nên tổng số tuổi tăng thêm:`, `In ${n} years each of them gets ${n} years older, so the sum of their ages goes up by:`), `${n} × 2 = ${2 * n} (${YR})`,
        L('Tổng số tuổi của hai người hiện nay là:', 'The sum of their ages now:'), `${S + 2 * n} ${M} ${2 * n} = ${S} (${YR})`, ...childNow, done(c, 'tuổi', 'years old')),
      { hint: L('Tìm tổng số tuổi hiện nay trước.', 'First find the sum of their ages now.') });
    } },

    // sum and difference with hidden data, with tấn/tạ/kg, or "if 3 pupils moved, the classes would be equal"
    { id: 'g4-tong-hieu', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c5-b25', gen: rng => {
      const f = R(rng, 0, 2), big = rng() < 0.5;
      if (f === 0) {
        const SUMS = [[999, 'số lớn nhất có ba chữ số', 'the largest 3-digit number'], [9999, 'số lớn nhất có bốn chữ số', 'the largest 4-digit number'],
          [1000, 'số bé nhất có bốn chữ số', 'the smallest 4-digit number'], [10000, 'số bé nhất có năm chữ số', 'the smallest 5-digit number'],
          [998, 'số chẵn lớn nhất có ba chữ số', 'the largest even 3-digit number'], [9998, 'số chẵn lớn nhất có bốn chữ số', 'the largest even 4-digit number']];
        const DIFFS = [[11, 'số lẻ bé nhất có hai chữ số', 'the smallest odd 2-digit number'], [99, 'số lớn nhất có hai chữ số', 'the largest 2-digit number'],
          [10, 'số bé nhất có hai chữ số', 'the smallest 2-digit number'], [98, 'số chẵn lớn nhất có hai chữ số', 'the largest even 2-digit number'],
          [101, 'số lẻ bé nhất có ba chữ số', 'the smallest odd 3-digit number'], [100, 'số bé nhất có ba chữ số', 'the smallest 3-digit number'],
          [90, 'số tròn chục lớn nhất có hai chữ số', 'the largest 2-digit multiple of 10']];
        const s = P(rng, SUMS), d = P(rng, DIFFS.filter(x => x[0] % 2 === s[0] % 2 && x[0] < s[0]));
        const a = (s[0] + d[0]) / 2, b = (s[0] - d[0]) / 2;
        return Q(L(`Tổng của hai số là ${s[1]}, hiệu của hai số là ${d[1]}. Tìm số ${big ? 'lớn' : 'bé'}.`, `The sum of two numbers is ${s[2]} and their difference is ${d[2]}. Find the ${big ? 'bigger' : 'smaller'} number.`),
          num(big ? a : b), J(L(`${cap(s[1])} là ${F(s[0])}; ${d[1]} là ${d[0]}.`, `${cap(s[2])} is ${F(s[0])}; ${d[2]} is ${d[0]}.`),
            big ? L('Số lớn là:', 'The bigger number is:') : L('Số bé là:', 'The smaller number is:'), big ? `(${F(s[0])} + ${d[0]}) : 2 = ${F(a)}` : `(${F(s[0])} ${M} ${d[0]}) : 2 = ${F(b)}`, done(F(big ? a : b))),
          { hint: L('Tìm tổng và hiệu trước.', 'First find the sum and the difference.') });
      }
      if (f === 1) {
        if (rng() < 0.5) {
          const t = R(rng, 3, 9), q = R(rng, 1, 9), T = t * 1000 + q * 100, dq = R(rng, 2, 8), D = dq * 100, a = (T + D) / 2, b = (T - D) / 2;
          return Q(L(`Hai thửa ruộng thu hoạch được tất cả ${tanVi(t, q)} thóc. Thửa ruộng thứ nhất thu được nhiều hơn thửa ruộng thứ hai ${dq} tạ thóc. Hỏi thửa ruộng thứ ${big ? 'nhất' : 'hai'} thu được bao nhiêu ki-lô-gam thóc?`,
            `Two fields gave ${tanEn(t, q)} of paddy rice altogether. The first field gave ${dq} quintals more than the second field. How many kilograms of paddy rice did the ${big ? 'first' : 'second'} field give?`),
          num(big ? a : b, 'kg'), J(L(`Đổi: ${tanVi(t, q)} = ${F(T)} kg; ${dq} tạ = ${D} kg.`, `Convert: ${tanEn(t, q)} = ${F(T)} kg; ${dq} quintals = ${D} kg.`),
            L(`Thửa ruộng thứ ${big ? 'nhất' : 'hai'} thu được là:`, `The ${big ? 'first' : 'second'} field gave:`), big ? `(${F(T)} + ${D}) : 2 = ${F(a)} (kg)` : `(${F(T)} ${M} ${D}) : 2 = ${F(b)} (kg)`, done(F(big ? a : b), 'kg', 'kg')));
        }
        const x = R(rng, 10, 90), T = 100 + x; let D = R(rng, 4, 30); if ((T - D) % 2) D++;
        const a = (T + D) / 2, b = (T - D) / 2;
        return Q(L(`Hai bao gạo cân nặng tất cả 1 tạ ${x} kg. Bao thứ nhất nặng hơn bao thứ hai ${D} kg. Hỏi bao thứ ${big ? 'nhất' : 'hai'} nặng bao nhiêu ki-lô-gam?`,
          `Two sacks of rice weigh 1 quintal ${x} kg altogether. The first sack is ${D} kg heavier than the second. How many kilograms does the ${big ? 'first' : 'second'} sack weigh?`),
        num(big ? a : b, 'kg'), J(L(`Đổi: 1 tạ ${x} kg = ${T} kg.`, `Convert: 1 quintal ${x} kg = ${T} kg.`), L(`Bao thứ ${big ? 'nhất' : 'hai'} nặng là:`, `The ${big ? 'first' : 'second'} sack weighs:`),
          big ? `(${T} + ${D}) : 2 = ${a} (kg)` : `(${T} ${M} ${D}) : 2 = ${b} (kg)`, done(big ? a : b, 'kg', 'kg')));
      }
      const [g, lo, hi, tl, th] = P(rng, [['class', 30, 40, 1, 4], ['shelf', 40, 180, 5, 30], ['basket', 20, 90, 3, 15]]);
      const t = R(rng, tl, th), B = R(rng, lo, hi), A = B + 2 * t, S = A + B, D = 2 * t;
      const T = {
        class: [`Hai lớp 4A và 4B có tất cả ${S} học sinh. Nếu chuyển ${t} học sinh từ lớp 4A sang lớp 4B thì số học sinh của hai lớp bằng nhau. Hỏi lớp ${big ? '4A' : '4B'} có bao nhiêu học sinh?`,
          `Classes 4A and 4B have ${S} pupils altogether. If ${t} ${pl(t, 'pupil moves', 'pupils move')} from class 4A to class 4B, the two classes will have the same number of pupils. How many pupils are there in class ${big ? '4A' : '4B'}?`,
          `lớp 4A`, `lớp 4B`, 'class 4A', 'class 4B', 'học sinh', 'pupils', 'Số học sinh của', 'Pupils in'],
        shelf: [`Hai giá sách có tất cả ${S} quyển sách. Nếu chuyển ${t} quyển sách từ giá thứ nhất sang giá thứ hai thì số sách ở hai giá bằng nhau. Hỏi giá thứ ${big ? 'nhất' : 'hai'} có bao nhiêu quyển sách?`,
          `Two bookshelves hold ${S} books altogether. If ${t} books are moved from the first shelf to the second, the two shelves will hold the same number of books. How many books are on the ${big ? 'first' : 'second'} shelf?`,
          'giá thứ nhất', 'giá thứ hai', 'the first shelf', 'the second shelf', 'quyển', 'books', 'Số sách ở', 'Books on'],
        basket: [`Hai rổ cam có tất cả ${S} quả. Nếu chuyển ${t} quả từ rổ thứ nhất sang rổ thứ hai thì số cam ở hai rổ bằng nhau. Hỏi rổ thứ ${big ? 'nhất' : 'hai'} có bao nhiêu quả cam?`,
          `Two baskets hold ${S} oranges altogether. If ${t} oranges are moved from the first basket to the second, the two baskets will hold the same number of oranges. How many oranges are in the ${big ? 'first' : 'second'} basket?`,
          'rổ thứ nhất', 'rổ thứ hai', 'the first basket', 'the second basket', 'quả', 'oranges', 'Số cam ở', 'Oranges in'],
      }[g];
      const U1 = L(T[6], T[7]);
      return Q(L(T[0], T[1]), num(big ? A : B, U1),
        J(L(`Chuyển ${t} ${T[6]} từ ${T[2]} sang ${T[3]} thì hai bên bằng nhau, nên ${T[2]} nhiều hơn ${T[3]} là:`, `Moving ${t} from ${T[4]} to ${T[5]} makes them equal, so ${T[4]} has more than ${T[5]} by:`),
          `${t} × 2 = ${D} (${U1})`, big ? L(`${T[8]} ${T[2]} là:`, `${T[9]} ${T[4]}:`) : L(`${T[8]} ${T[3]} là:`, `${T[9]} ${T[5]}:`),
          big ? `(${S} + ${D}) : 2 = ${A} (${U1})` : `(${S} ${M} ${D}) : 2 = ${B} (${U1})`, done(big ? A : B, T[6], T[7])),
        { hint: L(`Chuyển đi ${t} thì bên này bớt ${t}, bên kia thêm ${t}.`, `Moving ${t} takes ${t} from one side and adds ${t} to the other.`) });
    } },

    // rectangles with sum and difference: half-perimeter → area, perimeter → length, "add d to the width to get a square"
    { id: 'g4-chu-nhat', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c5-b25', gen: rng => {
      const [ov, oe, u] = P(rng, [['mảnh vườn', 'garden', 'm'], ['bồn hoa', 'flower bed', 'm'], ['tấm bìa', 'piece of card', 'cm'], ['mảnh đất', 'plot of land', 'm']]);
      const f = R(rng, 0, 2), W = f === 1 ? R(rng, 5, 60) : R(rng, 3, 9), d = R(rng, 2, 25), Lg = W + d, H = Lg + W, A = Lg * W;
      const wS = [L('Chiều rộng là:', 'The width:'), `(${H} ${M} ${d}) : 2 = ${W} (${u})`], lS = [L('Chiều dài là:', 'The length:'), `${W} + ${d} = ${Lg} (${u})`];
      const aS = [L(`Diện tích ${ov} là:`, `Area of the ${oe}:`), `${Lg} × ${W} = ${A} (${u}²)`];
      if (f === 0) return Q(L(`Một ${ov} hình chữ nhật có nửa chu vi là ${H} ${u}, chiều dài hơn chiều rộng ${d} ${u}. Tính diện tích ${ov} đó.`,
        `A rectangular ${oe} has a half-perimeter of ${H} ${u}. Its length is ${d} ${u} more than its width. Work out the area of the ${oe}.`),
      num(A, `${u}²`), J(...wS, ...lS, ...aS, done(A, `${u}²`, `${u}²`)), { hint: L('Nửa chu vi = chiều dài + chiều rộng.', 'Half-perimeter = length + width.') });
      if (f === 1) return Q(L(`Một ${ov} hình chữ nhật có chu vi là ${2 * H} ${u}, chiều rộng kém chiều dài ${d} ${u}. Tính chiều dài ${ov} đó.`,
        `A rectangular ${oe} has a perimeter of ${2 * H} ${u}. Its width is ${d} ${u} less than its length. Work out the length of the ${oe}.`),
      num(Lg, u), J(L('Nửa chu vi là:', 'The half-perimeter:'), `${2 * H} : 2 = ${H} (${u})`, L('Chiều dài là:', 'The length:'), `(${H} + ${d}) : 2 = ${Lg} (${u})`, done(Lg, u, u)),
      { hint: L('Chiều dài + chiều rộng = nửa chu vi.', 'Length + width = half the perimeter.') });
      return Q(L(`Một ${ov} hình chữ nhật có nửa chu vi là ${H} ${u}. Nếu tăng chiều rộng thêm ${d} ${u} thì ${ov} trở thành hình vuông. Tính diện tích ${ov} hình chữ nhật đó.`,
        `A rectangular ${oe} has a half-perimeter of ${H} ${u}. If its width were ${d} ${u} longer, it would be a square. Work out the area of the rectangular ${oe}.`),
      num(A, `${u}²`), J(L(`Tăng chiều rộng thêm ${d} ${u} thì được hình vuông, nên chiều dài hơn chiều rộng ${d} ${u}.`, `Adding ${d} ${u} to the width makes a square, so the length is ${d} ${u} more than the width.`), ...wS, ...lS, ...aS, done(A, `${u}²`, `${u}²`)));
    } },

    // convenient calculation: pairs making whole thousands / hundreds, a factor that is 0, subtracting a sum
    { id: 'g4-thuan-tien', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c5-b24', gen: rng => {
      const f = R(rng, 0, 3), EASY = L('Tính bằng cách thuận tiện:', 'Calculate in the easiest way:');
      const mate = (x, unit) => Math.ceil(x / unit) * unit - x || unit;
      if (f === 0) {
        let x1, x2; do { x1 = R(rng, 101, 4899); x2 = R(rng, 101, 4899); } while (x1 % 100 === 0 || x2 % 100 === 0 || x1 === x2);
        const c1 = mate(x1, 1000), c2 = mate(x2, 1000), terms = rng() < 0.5 ? [x1, x2, c1, c2] : [x1, x2, c2, c1], s1 = x1 + c1, s2 = x2 + c2;
        return Q(`${EASY}\n${terms.map(F).join(' + ')}`, num(s1 + s2), `= (${F(x1)} + ${F(c1)}) + (${F(x2)} + ${F(c2)})\n= ${F(s1)} + ${F(s2)}\n= ${F(s1 + s2)}`,
          { hint: L('Ghép các cặp số có tổng là số tròn nghìn.', 'Pair up numbers that make a whole number of thousands.') });
      }
      if (f === 1) {
        let x1, x2; do { x1 = R(rng, 11, 389); x2 = R(rng, 11, 389); } while (x1 % 10 === 0 || x2 % 10 === 0 || x1 === x2);
        const c1 = mate(x1, 100), c2 = mate(x2, 100), z = R(rng, 101, 999), s1 = x1 + c1, s2 = x2 + c2;
        const terms = P(rng, [[x1, z, x2, c1, c2], [x1, x2, z, c2, c1], [z, x1, x2, c1, c2]]);
        return Q(`${EASY}\n${terms.join(' + ')}`, num(s1 + s2 + z), `= (${x1} + ${c1}) + (${x2} + ${c2}) + ${z}\n= ${s1} + ${s2} + ${z}\n= ${F(s1 + s2 + z)}`,
          { hint: L('Ghép các cặp số có tổng là số tròn trăm.', 'Pair up numbers that make a whole number of hundreds.') });
      }
      if (f === 2) {
        const A = R(rng, 100, 999), B = R(rng, 2, 9), C = R(rng, 100, 999), m = R(rng, 2, 9), n = R(rng, 2, 9), k = m * n;
        const expr = rng() < 0.5 ? `(${A} × ${B} + ${C}) × (${k} ${M} ${m} × ${n})` : `${A} × ${B} × (${k} : ${m} ${M} ${n})`;
        const zero = expr.startsWith('(') ? `${k} ${M} ${m} × ${n} = ${k} ${M} ${k} = 0` : `${k} : ${m} ${M} ${n} = ${n} ${M} ${n} = 0`;
        return Q(L(`Tính giá trị của biểu thức (bằng cách thuận tiện):\n${expr}`, `Work out the value of the expression (in the easiest way):\n${expr}`), num(0),
          L(`Ta có: ${zero}.\nSố nào nhân với 0 cũng bằng 0, nên giá trị của biểu thức là 0.`, `${zero}.\nAny number multiplied by 0 is 0, so the value of the expression is 0.`),
          { hint: L('Xem biểu thức trong ngoặc có giá trị bằng bao nhiêu.', 'Look at the value of the brackets first.') });
      }
      let a, b, c; do { a = R(rng, 5000, 99999); b = R(rng, 101, 4899); c = mate(b, 1000); } while (b % 100 === 0 || a <= b + c + 1000);
      return Q(`${EASY}\n${F(a)} ${M} ${F(b)} ${M} ${F(c)}`, num(a - b - c), `= ${F(a)} ${M} (${F(b)} + ${F(c)})\n= ${F(a)} ${M} ${F(b + c)}\n= ${F(a - b - c)}`,
        { hint: L('Trừ liên tiếp hai số cũng là trừ đi tổng của hai số đó.', 'Taking away two numbers one after the other is the same as taking away their sum.') });
    } },

    // seconds: race times written in minutes and seconds, compared, added or chained
    { id: 'g4-chay', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c4-b19', gen: rng => {
      const f = R(rng, 0, 2), nm = NC.names(rng, 3);
      const conv = ts => ts.filter(s => s >= 60).map(msConv);
      if (f === 0) {
        const ts = U.sample(rng, Array.from({ length: 56 }, (_, i) => 75 + i), 3), plain = R(rng, 0, 2);
        const sh = ts.map((s, i) => (i === plain ? L(`${s} giây`, `${s} seconds`) : MS(s)));
        const mn = Math.min(...ts), mx = Math.max(...ts), win = nm[ts.indexOf(mn)], last = nm[ts.indexOf(mx)];
        return Q(L(`Trong cuộc thi chạy 400 m, ${nm[0]} chạy hết ${sh[0]}, ${nm[1]} chạy hết ${sh[1]}, ${nm[2]} chạy hết ${sh[2]}. Hỏi bạn về nhất chạy nhanh hơn bạn về cuối bao nhiêu giây?`,
          `In a 400 m race, ${nm[0]} ran it in ${sh[0]}, ${nm[1]} in ${sh[1]} and ${nm[2]} in ${sh[2]}. How many seconds faster was the winner than the runner who came last?`),
        num(mx - mn, SEC), J(L('Đổi:', 'Convert:'), ...conv(ts.filter((s, i) => i !== plain)),
          L(`Ai chạy hết ít thời gian nhất thì về nhất: ${win} (${mn} giây). Bạn về cuối là ${last} (${mx} giây).`, `The runner who takes the least time wins: ${win} (${mn} seconds). ${last} came last (${mx} seconds).`),
          L('Bạn về nhất chạy nhanh hơn bạn về cuối là:', 'The winner was faster by:'), `${mx} ${M} ${mn} = ${mx - mn} (${SEC})`, done(mx - mn, 'giây', 'seconds')),
        { hint: L('1 phút = 60 giây. Đổi hết ra giây rồi so sánh.', '1 minute = 60 seconds. Change all the times into seconds, then compare.') });
      }
      if (f === 1) {
        const ts = [R(rng, 50, 95), R(rng, 50, 95), R(rng, 50, 95)], T = ts[0] + ts[1] + ts[2];
        return Q(L(`Đội chạy tiếp sức của lớp 4A có ba bạn. Bạn thứ nhất chạy hết ${msVi(ts[0])}, bạn thứ hai chạy hết ${msVi(ts[1])}, bạn thứ ba chạy hết ${msVi(ts[2])}. Hỏi cả đội chạy hết bao nhiêu giây?`,
          `Class 4A's relay team has three runners. The first runner takes ${msEn(ts[0])}, the second takes ${msEn(ts[1])} and the third takes ${msEn(ts[2])}. How many seconds does the whole team take?`),
        num(T, SEC), J(ts.some(s => s >= 60) ? L('Đổi:', 'Convert:') : '', ...conv(ts), L('Cả đội chạy hết là:', 'The whole team takes:'), `${ts.join(' + ')} = ${T} (${SEC})`, done(T, 'giây', 'seconds')),
        { hint: L('1 phút = 60 giây.', '1 minute = 60 seconds.') });
      }
      const tA = R(rng, 70, 120), x = R(rng, 3, 12), y = R(rng, 2, 10), tB = tA - x, tC = tB + y;
      return Q(L(`${nm[0]} bơi 50 m hết ${msVi(tA)}. ${nm[1]} bơi nhanh hơn ${nm[0]} ${x} giây, ${nm[2]} bơi chậm hơn ${nm[1]} ${y} giây. Hỏi ${nm[2]} bơi 50 m hết bao nhiêu giây?`,
        `${nm[0]} swims 50 m in ${msEn(tA)}. ${nm[1]} is ${x} seconds faster than ${nm[0]}, and ${nm[2]} is ${y} seconds slower than ${nm[1]}. How many seconds does ${nm[2]} take to swim 50 m?`),
      num(tC, SEC), J(L('Đổi:', 'Convert:'), msConv(tA), L(`${nm[1]} bơi hết là:`, `${nm[1]} takes:`), `${tA} ${M} ${x} = ${tB} (${SEC})`, L(`${nm[2]} bơi hết là:`, `${nm[2]} takes:`), `${tB} + ${y} = ${tC} (${SEC})`, done(tC, 'giây', 'seconds')),
      { hint: L('Bơi nhanh hơn thì hết ít thời gian hơn.', 'Faster means taking less time.') });
    } },

    // parallelograms and rhombuses with units to convert
    { id: 'g4-hinh-bh', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g4-c6-b31', gen: rng => {
      const f = R(rng, 0, 2), CM = 'cm';
      if (f === 0) {
        const a = R(rng, 1, 3), b = R(rng, 1, 9), AB = a * 10 + b, c = R(rng, 3, Math.min(12, AB - 5)), BC = AB - c, Pm = (AB + BC) * 2;
        return Q(L(`Hình bình hành ABCD có cạnh AB dài ${a} dm ${b} cm, cạnh BC ngắn hơn cạnh AB ${c} cm. Tính chu vi hình bình hành ABCD.`,
          `Parallelogram ABCD has side AB of ${a} dm ${b} cm. Side BC is ${c} cm shorter than side AB. Work out the perimeter of parallelogram ABCD.`),
        num(Pm, CM), J(L(`Đổi: ${a} dm ${b} cm = ${AB} cm.`, `Convert: ${a} dm ${b} cm = ${AB} cm.`), L('Cạnh BC dài là:', 'Side BC:'), `${AB} ${M} ${c} = ${BC} (cm)`,
          L('Hình bình hành có các cặp cạnh đối diện bằng nhau, nên chu vi hình bình hành ABCD là:', 'Opposite sides of a parallelogram are equal, so the perimeter of ABCD is:'), `(${AB} + ${BC}) × 2 = ${Pm} (cm)`, done(Pm, 'cm', 'cm')),
        { hint: L('Hình bình hành có hai cặp cạnh đối diện bằng nhau.', 'A parallelogram has two pairs of equal opposite sides.') });
      }
      if (f === 1) {
        const [Lc, lv, le] = P(rng, [[100, '1 m', '1 m'], [120, '1 m 2 dm', '1 m 2 dm'], [150, '1 m 5 dm', '1 m 5 dm'], [200, '2 m', '2 m']]);
        const k = R(rng, 1, 2), s = R(rng, 8, Math.floor((Lc - 1) / (4 * k))), used = 4 * s * k, rest = Lc - used;
        return Q(L(`Bác thợ có một đoạn dây thép dài ${lv}. Bác uốn thành ${k === 1 ? 'một khung hình thoi' : 'hai khung hình thoi như nhau'}, mỗi cạnh dài ${s} cm. Hỏi đoạn dây thép còn thừa bao nhiêu xăng-ti-mét?`,
          `A metalworker has a piece of wire ${le} long. He bends it into ${k === 1 ? 'a rhombus-shaped frame' : 'two rhombus-shaped frames of the same size'} with sides of ${s} cm. How many centimetres of wire are left over?`),
        num(rest, CM), J(L(`Đổi: ${lv} = ${Lc} cm.`, `Convert: ${le} = ${Lc} cm.`), L('Hình thoi có bốn cạnh bằng nhau. Một khung cần số xăng-ti-mét dây thép là:', 'A rhombus has four equal sides. One frame needs:'), `${s} × 4 = ${4 * s} (cm)`,
          k === 2 ? L('Hai khung cần là:', 'Two frames need:') : '', k === 2 ? `${4 * s} × 2 = ${used} (cm)` : '',
          L('Đoạn dây thép còn thừa là:', 'Wire left over:'), `${Lc} ${M} ${used} = ${rest} (cm)`, done(rest, 'cm', 'cm')));
      }
      const AB = R(rng, 12, 40), BC = R(rng, 8, AB - 2), Pm = (AB + BC) * 2, inDm = Pm % 10 !== 0 && rng() < 0.5;
      const pv = inDm ? `${Math.floor(Pm / 10)} dm ${Pm % 10} cm` : `${Pm} cm`;
      return Q(L(`Hình bình hành ABCD có chu vi là ${pv}, cạnh AB dài ${AB} cm. Tính độ dài cạnh BC.`, `Parallelogram ABCD has a perimeter of ${pv}. Side AB is ${AB} cm long. Work out the length of side BC.`),
        num(BC, CM), J(inDm ? L(`Đổi: ${pv} = ${Pm} cm.`, `Convert: ${pv} = ${Pm} cm.`) : '', L('Nửa chu vi (AB + BC) là:', 'Half the perimeter (AB + BC):'), `${Pm} : 2 = ${Pm / 2} (cm)`,
          L('Cạnh BC dài là:', 'Side BC:'), `${Pm / 2} ${M} ${AB} = ${BC} (cm)`, done(BC, 'cm', 'cm')),
        { hint: L('Chu vi hình bình hành = (AB + BC) × 2.', 'Perimeter of a parallelogram = (AB + BC) × 2.') });
    } },

    /* ======================= Giữa học kì II (Bài 38–51) ======================= */

    // the average of numbers given by conditions
    { id: 'g4-tbc-so', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g4-c8-b46', gen: rng => {
      const n = P(rng, [3, 3, 4]), picks = U.sample(rng, DESC, n - 1);
      const s = picks.reduce((t, d) => t + d[0], 0);
      let x = R(rng, 100, 2000); x += (n - (s + x) % n) % n;
      const vals = picks.map(d => d[0]).concat([x]), S = s + x, avg = S / n;
      return Q(L(`Tìm số trung bình cộng của ${listVi(picks.map(d => d[1]).concat([`số ${F(x)}`]))}.`, `Find the average of ${listEn(picks.map(d => d[2]).concat([F(x)]))}.`),
        num(avg), J(...picks.map(d => L(`${cap(d[1])} là ${F(d[0])}.`, `${cap(d[2])} is ${F(d[0])}.`)), L('Số trung bình cộng là:', 'The average is:'),
          `(${vals.map(F).join(' + ')}) : ${n} = ${F(S)} : ${n} = ${F(avg)}`, done(F(avg))),
        { hint: L('Tìm từng số trước, rồi lấy tổng chia cho số các số hạng.', 'First find each number, then divide their sum by how many numbers there are.') });
    } },

    // the average over two groups (3 hours at 50 km, 2 hours at 55 km)
    { id: 'g4-tbc-nhom', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g4-c8-b46', gen: rng => {
      const g = R(rng, 0, 2), [alo, ahi] = [[40, 60], [120, 250], [25, 50]][g];
      let n1 = 3, n2 = 2, a = 50, b = 55;
      for (let t = 0; t < 200; t++) {
        const m1 = R(rng, 2, 5), m2 = R(rng, 2, 5), x = R(rng, alo, ahi), y = R(rng, alo, ahi);
        if (x !== y && (m1 * x + m2 * y) % (m1 + m2) === 0) { n1 = m1; n2 = m2; a = x; b = y; break; }
      }
      const N = n1 + n2, T1 = n1 * a, T2 = n2 * b, avg = (T1 + T2) / N;
      const T = [
        [`Một ô tô trong ${n1} giờ đầu, mỗi giờ đi được ${a} km; trong ${n2} giờ sau, mỗi giờ đi được ${b} km. Hỏi trung bình mỗi giờ ô tô đi được bao nhiêu ki-lô-mét?`,
          `A car travels for ${n1} hours, going ${a} km each hour, and then for ${n2} hours, going ${b} km each hour. On average, how many kilometres does it travel each hour?`, 'km', 'km',
          [`Quãng đường ô tô đi trong ${n1} giờ đầu là:`, `Distance in the first ${n1} hours:`], [`Quãng đường ô tô đi trong ${n2} giờ sau là:`, `Distance in the next ${n2} hours:`], [`Tổng số giờ ô tô đã đi là:`, 'Number of hours altogether:'], ['giờ', 'hours'], [`Trung bình mỗi giờ ô tô đi được là:`, 'On average, each hour the car travels:']],
        [`Một xưởng may trong ${n1} ngày đầu, mỗi ngày may được ${a} bộ quần áo; trong ${n2} ngày sau, mỗi ngày may được ${b} bộ quần áo. Hỏi trung bình mỗi ngày xưởng may được bao nhiêu bộ quần áo?`,
          `For the first ${n1} days, a clothes workshop made ${a} outfits each day. For the next ${n2} days, it made ${b} outfits each day. On average, how many outfits did it make each day?`, 'bộ', 'outfits',
          [`Số bộ quần áo may trong ${n1} ngày đầu là:`, `Outfits made in the first ${n1} days:`], [`Số bộ quần áo may trong ${n2} ngày sau là:`, `Outfits made in the next ${n2} days:`], ['Tổng số ngày là:', 'Number of days altogether:'], ['ngày', 'days'], ['Trung bình mỗi ngày xưởng may được là:', 'On average, each day the workshop made:']],
        [`Một cửa hàng nhập ${n1} bao gạo, mỗi bao nặng ${a} kg và ${n2} bao gạo khác, mỗi bao nặng ${b} kg. Hỏi trung bình mỗi bao gạo nặng bao nhiêu ki-lô-gam?`,
          `A shop buys in ${n1} sacks of rice weighing ${a} kg each and ${n2} other sacks weighing ${b} kg each. On average, how many kilograms does each sack weigh?`, 'kg', 'kg',
          [`${n1} bao gạo đầu nặng là:`, `The first ${n1} sacks weigh:`], [`${n2} bao gạo sau nặng là:`, `The other ${n2} sacks weigh:`], ['Tổng số bao gạo là:', 'Number of sacks altogether:'], ['bao', 'sacks'], ['Trung bình mỗi bao gạo nặng là:', 'On average, each sack weighs:']],
      ][g];
      const u = L(T[2], T[3]), lb = x => L(x[0], x[1]);
      return Q(L(T[0], T[1]), num(avg, u), J(lb(T[4]), `${a} × ${n1} = ${F(T1)} (${u})`, lb(T[5]), `${b} × ${n2} = ${F(T2)} (${u})`, lb(T[6]), `${n1} + ${n2} = ${N} (${lb(T[7])})`,
        lb(T[8]), `(${F(T1)} + ${F(T2)}) : ${N} = ${F(avg)} (${u})`, done(F(avg), T[2], T[3])),
      { hint: L('Không lấy trung bình cộng của hai số đã cho: phải tính tổng rồi chia cho tổng số phần.', 'Do not just average the two numbers: find the total, then divide by the total number of parts.') });
    } },

    // a missing value from the average (a short table, three numbers, four children's weights)
    { id: 'g4-tbc-thieu', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g4-c8-b46', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        let avg, vs, m;
        for (;;) { avg = R(rng, 40, 70); vs = [0, 1, 2].map(() => R(rng, avg - 15, avg + 15)); m = 4 * avg - vs[0] - vs[1] - vs[2]; if (m >= 20 && m <= 99 && !vs.includes(m)) break; }
        const mi = R(rng, 0, 3), all = vs.slice(); all.splice(mi, 0, m);
        const cls = ['4A', '4B', '4C', '4D'], rows = cls.map((c, i) => (i === mi ? `${c}: ?` : L(`${c}: ${all[i]} quyển`, `${c}: ${all[i]} books`))).join('\n'), s3 = vs[0] + vs[1] + vs[2];
        const known = cls.filter((c, i) => i !== mi);
        return Q(L(`Số quyển sách bốn lớp khối Bốn quyên góp được như sau:\n${rows}\nTrung bình mỗi lớp quyên góp được ${avg} quyển sách. Hỏi lớp ${cls[mi]} quyên góp được bao nhiêu quyển sách?`,
          `The four classes in Grade 4 collected these numbers of books:\n${rows}\nOn average, each class collected ${avg} books. How many books did class ${cls[mi]} collect?`),
        num(m, L('quyển', 'books')), J(L('Cả bốn lớp quyên góp được là:', 'The four classes collected altogether:'), `${avg} × 4 = ${4 * avg} (${L('quyển', 'books')})`,
          L(`Ba lớp ${listVi(known)} quyên góp được là:`, `Classes ${listEn(known)} collected:`), `${vs.join(' + ')} = ${s3} (${L('quyển', 'books')})`,
          L(`Lớp ${cls[mi]} quyên góp được là:`, `Class ${cls[mi]} collected:`), `${4 * avg} ${M} ${s3} = ${m} (${L('quyển', 'books')})`, done(m, 'quyển sách', 'books')),
        { hint: L('Tổng = số trung bình cộng × số các số hạng.', 'Total = average × how many numbers there are.') });
      }
      if (f === 1) {
        let avg, a, d, c; do { avg = R(rng, 50, 500); a = R(rng, 10, avg); d = R(rng, 5, 60); c = 3 * avg - a - (a + d); } while (c < 10);
        return Q(L(`Trung bình cộng của ba số là ${avg}. Số thứ nhất là ${a}, số thứ hai hơn số thứ nhất ${d}. Tìm số thứ ba.`, `The average of three numbers is ${avg}. The first number is ${a}, and the second number is ${d} more than the first. Find the third number.`),
          num(c), J(L('Tổng của ba số là:', 'The sum of the three numbers:'), `${avg} × 3 = ${F(3 * avg)}`, L('Số thứ hai là:', 'The second number:'), `${a} + ${d} = ${a + d}`,
            L('Số thứ ba là:', 'The third number:'), `${F(3 * avg)} ${M} ${a} ${M} ${a + d} = ${F(c)}`, done(F(c))),
          { hint: L('Tìm tổng của ba số trước.', 'First find the sum of the three numbers.') });
      }
      const nm = NC.names(rng, 4);
      let avg, w, m; for (;;) { avg = R(rng, 28, 36); w = [0, 1, 2].map(() => R(rng, 24, 40)); m = 4 * avg - w[0] - w[1] - w[2]; if (m >= 24 && m <= 42) break; }
      const s3 = w[0] + w[1] + w[2];
      return Q(L(`Cân nặng trung bình của bốn bạn ${nm[0]}, ${nm[1]}, ${nm[2]} và ${nm[3]} là ${avg} kg. ${nm[0]} nặng ${w[0]} kg, ${nm[1]} nặng ${w[1]} kg, ${nm[2]} nặng ${w[2]} kg. Hỏi ${nm[3]} nặng bao nhiêu ki-lô-gam?`,
        `The average weight of four children, ${nm[0]}, ${nm[1]}, ${nm[2]} and ${nm[3]}, is ${avg} kg. ${nm[0]} weighs ${w[0]} kg, ${nm[1]} weighs ${w[1]} kg and ${nm[2]} weighs ${w[2]} kg. How many kilograms does ${nm[3]} weigh?`),
      num(m, 'kg'), J(L('Cả bốn bạn nặng là:', 'The four children weigh altogether:'), `${avg} × 4 = ${4 * avg} (kg)`, L(`Ba bạn ${nm[0]}, ${nm[1]}, ${nm[2]} nặng là:`, `${nm[0]}, ${nm[1]} and ${nm[2]} weigh:`), `${w.join(' + ')} = ${s3} (kg)`,
        L(`${nm[3]} nặng là:`, `${nm[3]} weighs:`), `${4 * avg} ${M} ${s3} = ${m} (kg)`, done(m, 'kg', 'kg')));
    } },

    // average together with sum and difference (two dresses, Mum's and Dad's ages, two numbers)
    { id: 'g4-tbc-hieu', from: 'giua-hk2', kinds: ['tl'], lesson: 'g4-c8-b46', gen: rng => {
      const f = R(rng, 0, 2), big = rng() < 0.5;
      if (f === 0) {
        const c = P(rng, [['chiếc váy', 'chiếc', 'chiếc váy đỏ', 'chiếc váy xanh', 'dresses', 'the red dress', 'the blue dress'], ['chiếc áo', 'chiếc', 'chiếc áo trắng', 'chiếc áo kẻ', 'shirts', 'the white shirt', 'the striped shirt'], ['đôi giày', 'đôi', 'đôi giày đen', 'đôi giày trắng', 'pairs of shoes', 'the black pair', 'the white pair']]);
        const avg = R(rng, 15, 50) * 10000 + P(rng, [0, 5000]), D = R(rng, 1, 8) * 10000, A = avg + D / 2, B = avg - D / 2;
        const [qv, qe] = big ? [c[2], c[5]] : [c[3], c[6]];
        return Q(L(`Mẹ mua hai ${c[0]}, trung bình mỗi ${c[1]} giá ${F(avg)} đồng. ${cap(c[2])} đắt hơn ${c[3]} ${F(D)} đồng. Hỏi ${qv} giá bao nhiêu tiền?`,
          `Mum buys two ${c[4]}. On average, each one costs ${F(avg)} dong. ${cap(c[5])} costs ${F(D)} dong more than ${c[6]}. How much does ${qe} cost?`),
        num(big ? A : B, DONG), J(L(`Mua hai ${c[0]} hết số tiền là:`, `The two cost altogether:`), `${F(avg)} × 2 = ${F(2 * avg)} (${DONG})`, L(`Giá tiền ${qv} là:`, `Cost of ${qe}:`),
          big ? `(${F(2 * avg)} + ${F(D)}) : 2 = ${F(A)} (${DONG})` : `(${F(2 * avg)} ${M} ${F(D)}) : 2 = ${F(B)} (${DONG})`, doneD(big ? A : B)),
        { hint: L('Từ số trung bình cộng, tìm tổng giá tiền hai món trước.', 'From the average, first find the total cost of the two.') });
      }
      if (f === 1) {
        const who = NC.name(rng), avg = R(rng, 32, 45), d = P(rng, [2, 4, 6, 8]), dad = avg + d / 2, mum = avg - d / 2;
        return Q(L(`Tuổi trung bình của bố và mẹ ${who} là ${avg} tuổi. Bố hơn mẹ ${d} tuổi. Hỏi ${big ? 'bố' : 'mẹ'} ${who} bao nhiêu tuổi?`,
          `The average age of ${who}'s mum and dad is ${avg} years. Dad is ${d} years older than Mum. How old is ${who}'s ${big ? 'dad' : 'mum'}?`),
        num(big ? dad : mum, L('tuổi', 'years old')), J(L('Tổng số tuổi của bố và mẹ là:', "The sum of Mum's and Dad's ages:"), `${avg} × 2 = ${2 * avg} (${L('tuổi', 'years')})`,
          big ? L('Tuổi của bố là:', "Dad's age:") : L('Tuổi của mẹ là:', "Mum's age:"), big ? `(${2 * avg} + ${d}) : 2 = ${dad} (${L('tuổi', 'years')})` : `(${2 * avg} ${M} ${d}) : 2 = ${mum} (${L('tuổi', 'years')})`,
          done(big ? dad : mum, 'tuổi', 'years old')));
      }
      const avg = R(rng, 100, 999), d = R(rng, 5, 100) * 2, a = avg + d / 2, b = avg - d / 2;
      return Q(L(`Trung bình cộng của hai số là ${avg}. Số lớn hơn số bé ${d} đơn vị. Tìm số ${big ? 'lớn' : 'bé'}.`, `The average of two numbers is ${avg}. The bigger number is ${d} more than the smaller one. Find the ${big ? 'bigger' : 'smaller'} number.`),
        num(big ? a : b), J(L('Tổng của hai số là:', 'The sum of the two numbers:'), `${avg} × 2 = ${F(2 * avg)}`, big ? L('Số lớn là:', 'The bigger number:') : L('Số bé là:', 'The smaller number:'),
          big ? `(${F(2 * avg)} + ${d}) : 2 = ${F(a)}` : `(${F(2 * avg)} ${M} ${d}) : 2 = ${F(b)}`, done(F(big ? a : b))));
    } },

    // rút về đơn vị in real contexts: shopping with change, tấn/tạ, two-digit numbers of boxes
    { id: 'g4-rut-don-vi', from: 'giua-hk2', kinds: ['tl'], lesson: 'g4-c8-b47', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const [fv, fe] = P(rng, [['táo', 'apples'], ['nho', 'grapes'], ['cam', 'oranges'], ['xoài', 'mangoes']]);
        const p = R(rng, 25, 60) * 1000, n1 = R(rng, 2, 5); let n2 = R(rng, 2, 9); if (n2 === n1) n2++;
        const T1 = p * n1, T2 = p * n2, pay = [100000, 200000, 500000, 1000000].find(x => x > T2);
        return Q(L(`Mua ${n1} kg ${fv} hết ${F(T1)} đồng. Mẹ mua ${n2} kg ${fv} như thế và đưa cô bán hàng ${F(pay)} đồng. Hỏi cô bán hàng phải trả lại mẹ bao nhiêu tiền?`,
          `${n1} kg of ${fe} cost ${F(T1)} dong. Mum buys ${n2} kg of the same ${fe} and gives the shop assistant ${F(pay)} dong. How much change should she get?`),
        num(pay - T2, DONG), J(L(`Giá 1 kg ${fv} là:`, `1 kg of ${fe} costs:`), `${F(T1)} : ${n1} = ${F(p)} (${DONG})`, L(`Mua ${n2} kg ${fv} hết số tiền là:`, `${n2} kg cost:`), `${F(p)} × ${n2} = ${F(T2)} (${DONG})`,
          L('Cô bán hàng phải trả lại mẹ là:', 'Change:'), `${F(pay)} ${M} ${F(T2)} = ${F(pay - T2)} (${DONG})`, doneD(pay - T2)),
        { hint: L('Tìm giá tiền 1 kg trước (rút về đơn vị).', 'First find the price of 1 kg (one unit).') });
      }
      if (f === 1) {
        const per = R(rng, 15, 45), n1 = R(rng, 2, 6); let n2 = R(rng, 3, 9); if (n2 === n1) n2++;
        const T = per * n1, t = Math.floor(T / 10), q = T % 10, A = per * n2;
        return Q(L(`${n1} xe tải như nhau chở được ${tanVi(t, q)} xi măng. Hỏi ${n2} xe tải như thế chở được bao nhiêu tạ xi măng?`,
          `${n1} lorries of the same size carry ${tanEn(t, q)} of cement. How many quintals of cement do ${n2} lorries like this carry?`),
        num(A, L('tạ', 'quintals')), J(L(`Đổi: ${tanVi(t, q)} = ${T} tạ.`, `Convert: ${tanEn(t, q)} = ${T} quintals.`), L('Một xe tải chở được là:', 'One lorry carries:'), `${T} : ${n1} = ${per} (${L('tạ', 'quintals')})`,
          L(`${n2} xe tải chở được là:`, `${n2} lorries carry:`), `${per} × ${n2} = ${A} (${L('tạ', 'quintals')})`, done(A, 'tạ', 'quintals')),
        { hint: L('1 tấn = 10 tạ.', '1 tonne = 10 quintals.') });
      }
      const [cv, iv, ce, ie, plo, phi] = P(rng, [['thùng sữa', 'hộp sữa', 'crates', 'cartons of milk', 12, 48], ['hộp bút chì', 'chiếc bút chì', 'boxes', 'pencils', 12, 36], ['túi kẹo', 'chiếc kẹo', 'bags', 'sweets', 15, 45]]);
      const n1 = R(rng, 12, 25), per = R(rng, plo, phi); let n2 = R(rng, 13, 35); if (n2 === n1) n2++;
      const T = n1 * per, A = n2 * per, u = L(iv.split(' ')[0], ie);
      return Q(L(`${n1} ${cv} như nhau có tất cả ${T} ${iv}. Hỏi ${n2} ${cv} như thế có bao nhiêu ${iv}?`, `${n1} ${ce} of the same size hold ${T} ${ie} altogether. How many ${ie} do ${n2} ${ce} like this hold?`),
        num(A, u), J(L(`Mỗi ${cv.split(' ')[0]} có số ${iv} là:`, `Each one holds:`), `${T} : ${n1} = ${per} (${u})`, L(`${n2} ${cv} có số ${iv} là:`, `${n2} ${ce} hold:`), `${per} × ${n2} = ${A} (${u})`, done(A, iv, ie)));
    } },

    // convenient calculation with the distributive and associative properties
    { id: 'g4-phan-phoi', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g4-c8-b42', gen: rng => {
      const f = R(rng, 0, 3), EASY = L('Tính bằng cách thuận tiện:', 'Calculate in the easiest way:');
      if (f === 0) {
        const a = rng() < 0.5 ? R(rng, 12, 99) : R(rng, 101, 499), b = R(rng, 11, 89), c = 100 - b;
        const e = P(rng, [`${b} × ${a} + ${a} × ${c}`, `${a} × ${b} + ${c} × ${a}`, `${b} × ${a} + ${c} × ${a}`]);
        return Q(`${EASY}\n${e}`, num(100 * a), `= ${a} × ${b} + ${a} × ${c}\n= ${a} × (${b} + ${c})\n= ${a} × 100\n= ${F(100 * a)}`,
          { hint: L(`Đổi chỗ các thừa số để thấy thừa số chung ${a}.`, `Swap the factors to see the common factor ${a}.`) });
      }
      if (f === 1) {
        const a = R(rng, 12, 999), b = P(rng, [9, 99, 99, 999]);
        return Q(`${EASY}\n${a} × ${b} + ${a}`, num(a * (b + 1)), `= ${a} × ${b} + ${a} × 1\n= ${a} × (${b} + 1)\n= ${a} × ${F(b + 1)}\n= ${F(a * (b + 1))}`,
          { hint: L(`${a} = ${a} × 1.`, `${a} = ${a} × 1.`) });
      }
      if (f === 2) {
        const a = R(rng, 12, 99), b = R(rng, 11, 50), c = R(rng, 11, 78 - b), d = 100 - b - c;
        return Q(`${EASY}\n${a} × ${b} + ${a} × ${c} + ${a} × ${d}`, num(100 * a), `= ${a} × (${b} + ${c} + ${d})\n= ${a} × 100\n= ${F(100 * a)}`,
          { hint: L(`Cả ba tích đều có thừa số ${a}.`, `All three products have the factor ${a}.`) });
      }
      const PR = [[25, 4], [125, 8], [50, 2], [20, 5]], [p1, p2] = U.sample(rng, PR, 2), z = rng() < 0.4 ? R(rng, 3, 9) : 0;
      const terms = U.shuffle(rng, p1.concat(p2, z ? [z] : [])), v = p1[0] * p1[1] * p2[0] * p2[1] * (z || 1);
      return Q(`${EASY}\n${terms.join(' × ')}`, num(v), `= (${p1[0]} × ${p1[1]}) × (${p2[0]} × ${p2[1]})${z ? ` × ${z}` : ''}\n= ${F(p1[0] * p1[1])} × ${F(p2[0] * p2[1])}${z ? ` × ${z}` : ''}\n= ${F(v)}`,
        { hint: L('Ghép các thừa số có tích là số tròn chục, tròn trăm, tròn nghìn.', 'Group factors whose product is a whole number of tens, hundreds or thousands.') });
    } },

    // division with a remainder in real life: how many coaches at least, how many full boxes at most
    { id: 'g4-chia-du', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g4-c8-b44', gen: rng => {
      const up = rng() < 0.6;
      let N, c, q, r;
      if (up) {
        const g = R(rng, 0, 2), cs = [[29, 35, 40, 45], [24, 30, 36], [12, 15, 18]][g];
        do { c = P(rng, cs); N = R(rng, 150, 999); } while (N % c === 0);
        q = Math.floor(N / c); r = N % c;
        const T = [
          [`Có ${N} học sinh đi tham quan. Mỗi xe ô tô chở được ${c} học sinh. Hỏi cần ít nhất bao nhiêu xe ô tô để chở hết số học sinh đó?`, `${N} pupils are going on a school trip. Each coach can carry ${c} pupils. What is the smallest number of coaches needed to take all the pupils?`, 'học sinh', 'pupils', 'xe', 'coaches', 'xe', 'coach', 'chở được'],
          [`Có ${N} quả trứng cần xếp vào các khay, mỗi khay xếp được ${c} quả. Hỏi cần ít nhất bao nhiêu khay để xếp hết số trứng đó?`, `${N} eggs need to go into trays. Each tray holds ${c} eggs. What is the smallest number of trays needed for all the eggs?`, 'quả trứng', 'eggs', 'khay', 'trays', 'khay', 'tray', 'xếp được'],
          [`Có ${N} khách du lịch cần qua sông. Mỗi chuyến thuyền chở được ${c} người. Hỏi cần ít nhất bao nhiêu chuyến thuyền để chở hết số khách đó?`, `${N} tourists need to cross a river. Each boat trip can carry ${c} people. What is the smallest number of boat trips needed to take all the tourists?`, 'khách', 'tourists', 'chuyến', 'trips', 'chuyến', 'trip', 'chở được'],
        ][g];
        return Q(L(T[0], T[1]), num(q + 1, L(T[4], T[5])), J(L(`Ta có: ${N} : ${c} = ${q} (dư ${r}).`, `${N} : ${c} = ${q} remainder ${r}.`),
          L(`${q} ${T[6]} ${T[8]} ${q * c} ${T[2]}, còn ${r} ${T[2]} nữa nên cần thêm 1 ${T[6]}.`, `${q} ${T[5]} take ${q * c} ${T[3]}; ${r} ${pl(r, T[3].replace(/s$/, ''), T[3])} ${pl(r, 'is', 'are')} still left, so 1 more ${T[7]} is needed.`),
          L('Số cần ít nhất là:', 'The smallest number needed:'), `${q} + 1 = ${q + 1} (${L(T[4], T[5])})`, done(q + 1, T[4], T[5])),
        { hint: L('Còn dư thì vẫn cần thêm một lần nữa.', 'If there is a remainder, one more is still needed.') });
      }
      const g = R(rng, 0, 1), cs = [[12, 16, 18, 24], [12, 15, 25, 35]][g];
      do { c = P(rng, cs); N = R(rng, 150, 999); } while (N % c === 0);
      q = Math.floor(N / c); r = N % c;
      const T = [
        [`Có ${N} cái bánh, xếp vào các hộp, mỗi hộp ${c} cái. Hỏi xếp được nhiều nhất bao nhiêu hộp đầy bánh?`, `There are ${N} cakes. Each box holds ${c} cakes. What is the greatest number of full boxes you can make?`, 'hộp', 'boxes', 'cái bánh', 'cakes'],
        [`Một cuộn dây dài ${N} m, cắt thành các đoạn dài ${c} m. Hỏi cắt được nhiều nhất bao nhiêu đoạn dây như thế?`, `A roll of wire is ${N} m long. It is cut into pieces ${c} m long. What is the greatest number of pieces you can cut?`, 'đoạn', 'pieces', 'm', 'm'],
      ][g];
      return Q(L(T[0], T[1]), num(q, L(T[2], T[3])), J(L(`Ta có: ${N} : ${c} = ${q} (dư ${r}).`, `${N} : ${c} = ${q} remainder ${r}.`),
        L(`Vậy được nhiều nhất ${q} ${T[2]}, còn thừa ${r} ${T[4]}.`, `So you can make at most ${q} ${T[3]}, with ${r} ${T[5]} left over.`), done(q, T[2], T[3])),
      { hint: L('Phần dư không đủ thêm một phần nữa.', 'The remainder is not enough for one more.') });
    } },

    // tiling a floor: area in m², converted to dm², divided by the area of one tile
    { id: 'g4-lat-gach', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g4-c8-b44', gen: rng => {
      let s, Lm, Wm;
      for (;;) {
        s = P(rng, [2, 3, 4, 5, 6]); Lm = R(rng, 3, 9); Wm = R(rng, 3, Lm);
        if ((10 * Lm) % s === 0 && (10 * Wm) % s === 0) break;
      }
      const A = Lm * Wm, Ad = A * 100, t = s * s, n = Ad / t;
      return Q(L(`Người ta lát nền một căn phòng hình chữ nhật có chiều dài ${Lm} m, chiều rộng ${Wm} m bằng những viên gạch hình vuông cạnh ${s} dm. Hỏi cần bao nhiêu viên gạch để lát kín nền căn phòng đó? (Phần mạch vữa không đáng kể.)`,
        `The floor of a rectangular room is ${Lm} m long and ${Wm} m wide. It is covered with square tiles with sides of ${s} dm. How many tiles are needed to cover the whole floor? (Ignore the gaps between the tiles.)`),
      num(n, L('viên', 'tiles')), J(L('Diện tích nền căn phòng là:', 'Area of the floor:'), `${Lm} × ${Wm} = ${A} (m²)`, L(`Đổi: ${A} m² = ${F(Ad)} dm².`, `Convert: ${A} m² = ${F(Ad)} dm².`),
        L('Diện tích một viên gạch là:', 'Area of one tile:'), `${s} × ${s} = ${t} (dm²)`, L('Số viên gạch cần dùng là:', 'Number of tiles needed:'), `${F(Ad)} : ${t} = ${F(n)} (${L('viên', 'tiles')})`, done(F(n), 'viên gạch', 'tiles')),
      { hint: L('1 m² = 100 dm². Đổi về cùng đơn vị rồi chia.', '1 m² = 100 dm². Change to the same unit, then divide.') });
    } },

    /* ======================= Cuối năm (+ Bài 53–65, fractions) ======================= */

    // area + fraction of a number + yield (a rice field, a vegetable garden)
    { id: 'g4-ruong', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g4-c12-b65', gen: rng => {
      const d = P(rng, [2, 3, 4, 5, 8]); let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--;
      // a vegetable garden is kept smaller than a rice field
      const veg = rng() < 0.4, k = R(rng, Math.max(1, Math.ceil(4 / d)), Math.max(1, Math.floor((veg ? 10 : 20) / d))), Lm = d * 10 * k, Wm = n * 10 * k, A = Lm * Wm;
      const per = veg ? 10 : 100, y = veg ? R(rng, 10, 30) : R(rng, 5, 8) * 10, T = A / per * y;
      const [ov, oe, gv, ge] = veg ? ['mảnh vườn', 'garden', 'rau', 'vegetables'] : ['thửa ruộng', 'rice field', 'thóc', 'paddy rice'];
      return Q(L(`Một ${ov} hình chữ nhật có chiều dài ${Lm} m, chiều rộng bằng ${n}/${d} chiều dài. Trung bình cứ ${per} m² thu hoạch được ${y} kg ${gv}. Hỏi cả ${ov} đó thu hoạch được bao nhiêu ki-lô-gam ${gv}?`,
        `A rectangular ${oe} is ${Lm} m long. Its width is ${n}/${d} of its length. On average, every ${per} m² gives ${y} kg of ${ge}. How many kilograms of ${ge} does the whole ${oe} give?`),
      num(T, 'kg'), J(L(`Chiều rộng ${ov} là:`, `Width of the ${oe}:`), `${Lm} × ${n}/${d} = ${Wm} (m)`, L(`Diện tích ${ov} là:`, `Area of the ${oe}:`), `${Lm} × ${Wm} = ${F(A)} (m²)`,
        L(`${F(A)} m² gấp ${per} m² số lần là:`, `${F(A)} m² is this many times ${per} m²:`), `${F(A)} : ${per} = ${F(A / per)} (${L('lần', 'times')})`,
        L(`Cả ${ov} thu hoạch được là:`, `The whole ${oe} gives:`), `${y} × ${F(A / per)} = ${F(T)} (kg)`, done(F(T), 'kg', 'kg')),
      { hint: L(`Tìm ${n}/${d} của chiều dài để có chiều rộng.`, `Find ${n}/${d} of the length to get the width.`) });
    } },

    // fraction of a number in money and in kilograms, two or three steps
    { id: 'g4-ps-cua-so', from: 'cuoi-nam', kinds: ['tl'], lesson: 'g4-c12-b65', gen: rng => {
      const f = R(rng, 0, 2), who = NC.name(rng);
      const fr1 = () => { const d = P(rng, [2, 3, 4, 5, 8, 10]); let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; return [n, d]; };
      const [n, d] = fr1();
      if (f === 0) {
        const m = R(rng, Math.ceil(100 / d), Math.floor(500 / d)), Mo = d * m * 1000, sp = n * m * 1000, rem = Mo - sp;
        const X = R(rng, 1, Math.max(1, Math.floor((rem - 1000) / 5000))) * 5000, res = rem - X;
        return Q(L(`${who} có ${F(Mo)} đồng. ${who} mua đồ dùng học tập hết ${n}/${d} số tiền đó, rồi mua một quyển sách giá ${F(X)} đồng. Hỏi ${who} còn lại bao nhiêu tiền?`,
          `${who} has ${F(Mo)} dong. ${who} spends ${n}/${d} of the money on school things, then buys a book for ${F(X)} dong. How much money does ${who} have left?`),
        num(res, DONG), J(L('Số tiền mua đồ dùng học tập là:', 'Spent on school things:'), `${F(Mo)} × ${n}/${d} = ${F(sp)} (${DONG})`,
          L(`Sau khi mua đồ dùng học tập, ${who} còn lại:`, `Left after buying the school things:`), `${F(Mo)} ${M} ${F(sp)} = ${F(rem)} (${DONG})`,
          L(`Sau khi mua sách, ${who} còn lại:`, 'Left after buying the book:'), `${F(rem)} ${M} ${F(X)} = ${F(res)} (${DONG})`, doneD(res)));
      }
      if (f === 1) {
        const k = P(rng, [2, 3, 4, 5]), m = R(rng, Math.ceil(100 / (d * k)), Math.floor(500 / (d * k))), Mo = d * k * m * 1000, sp = n * k * m * 1000, rem = Mo - sp, book = rem / k;
        return Q(L(`${who} có ${F(Mo)} đồng. ${who} mua đồ dùng học tập hết ${n}/${d} số tiền đó, rồi dùng 1/${k} số tiền còn lại để mua sách. Hỏi ${who} mua sách hết bao nhiêu tiền?`,
          `${who} has ${F(Mo)} dong. ${who} spends ${n}/${d} of the money on school things, then uses 1/${k} of the money left to buy books. How much does ${who} spend on books?`),
        num(book, DONG), J(L('Số tiền mua đồ dùng học tập là:', 'Spent on school things:'), `${F(Mo)} × ${n}/${d} = ${F(sp)} (${DONG})`,
          L('Số tiền còn lại là:', 'Money left:'), `${F(Mo)} ${M} ${F(sp)} = ${F(rem)} (${DONG})`, L('Số tiền mua sách là:', 'Spent on books:'), `${F(rem)} × 1/${k} = ${F(book)} (${DONG})`, doneD(book)),
        { hint: L('"Số tiền còn lại" là số tiền sau khi đã mua đồ dùng học tập.', '"The money left" is what remains after buying the school things.') });
      }
      const [n2, d2] = fr1(), m = R(rng, Math.ceil(600 / (d * d2)), Math.max(Math.ceil(600 / (d * d2)), Math.floor(3000 / (d * d2)))), T = d * d2 * m, s1 = T / d * n, rem = T - s1, s2 = rem / d2 * n2;
      return Q(L(`Một cửa hàng có ${F(T)} kg gạo. Ngày thứ nhất cửa hàng bán được ${n}/${d} số gạo, ngày thứ hai bán được ${n2}/${d2} số gạo còn lại. Hỏi ngày thứ hai cửa hàng bán được bao nhiêu ki-lô-gam gạo?`,
        `A shop has ${F(T)} kg of rice. On the first day it sells ${n}/${d} of the rice. On the second day it sells ${n2}/${d2} of the rice that is left. How many kilograms of rice does it sell on the second day?`),
      num(s2, 'kg'), J(L('Ngày thứ nhất bán được là:', 'Sold on the first day:'), `${F(T)} × ${n}/${d} = ${F(s1)} (kg)`, L('Số gạo còn lại sau ngày thứ nhất là:', 'Rice left after the first day:'), `${F(T)} ${M} ${F(s1)} = ${F(rem)} (kg)`,
        L('Ngày thứ hai bán được là:', 'Sold on the second day:'), `${F(rem)} × ${n2}/${d2} = ${F(s2)} (kg)`, done(F(s2), 'kg', 'kg')));
    } },

    // fraction calculations in two steps, in the right order of operations
    { id: 'g4-ps-tinh', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g4-c12-b63', gen: rng => {
      for (let g = 0; g < 400; g++) {
        const f = R(rng, 0, 3), p = pfr(rng, 12), q = pfr(rng, 9), r = pfr(rng, 9);
        if (fs(p) === fs(q) || fs(q) === fs(r)) continue;   // no "1/2 + 1/2 × 1/2"
        let expr, steps, res;
        if (f === 0) {          // p + q × r
          const m = fmul(q, r); if (m.d === 1 || !rel(p, m)) continue;
          expr = `${fs(p)} + ${fs(q)} × ${fs(r)}`; res = fadd(p, m, 1);
          steps = mulSteps(q, r).map(s => `${fs(p)} + ${s}`).concat(addSteps(p, m, 1));
        } else if (f === 1) {   // p × q − r
          const m = fmul(p, q); if (m.d === 1 || !rel(m, r) || fval(m) <= fval(r)) continue;
          expr = `${fs(p)} × ${fs(q)} ${M} ${fs(r)}`; res = fadd(m, r, -1);
          steps = mulSteps(p, q).map(s => `${s} ${M} ${fs(r)}`).concat(addSteps(m, r, -1));
        } else if (f === 2) {   // (p + q) : r
          if (!rel(p, q) || fadd(p, q, 1).d === 1) continue;
          const s0 = fadd(p, q, 1); expr = `(${fs(p)} + ${fs(q)}) : ${fs(r)}`; res = fdiv(s0, r);
          steps = addSteps(p, q, 1).map(s => `${s} : ${fs(r)}`).concat(divSteps(s0, r));
        } else {                // p : q − r
          const m = fdiv(p, q); if (fs(p) === fs(q) || m.d === 1 || !rel(m, r) || fval(m) <= fval(r)) continue;
          expr = `${fs(p)} : ${fs(q)} ${M} ${fs(r)}`; res = fadd(m, r, -1);
          steps = divSteps(p, q).map(s => `${s} ${M} ${fs(r)}`).concat(addSteps(m, r, -1));
        }
        if (res.d === 1 || res.d > 60 || res.n > 99 || steps.some(s => /\d{4,}/.test(s))) continue;
        return Q(L(`Tính (viết kết quả dưới dạng phân số tối giản):\n${expr}`, `Calculate (give the answer as a fraction in its simplest form):\n${expr}`), NC.fr(res.n, res.d),
          `${expr}\n= ${steps.join('\n= ')}`, { hint: L('Nhân, chia trước; cộng, trừ sau. Có ngoặc thì tính trong ngoặc trước.', 'Multiply and divide first, then add and subtract. Work out brackets first.') });
      }
      return Q(L('Tính (viết kết quả dưới dạng phân số tối giản):\n1/2 + 3/4 × 1/3', 'Calculate (give the answer as a fraction in its simplest form):\n1/2 + 3/4 × 1/3'), NC.fr(3, 4),
        '1/2 + 3/4 × 1/3\n= 1/2 + 3/12\n= 1/2 + 1/4\n= 2/4 + 1/4\n= 3/4');
    } },

    // fraction word problems: what part of the tank is still empty, what part of the book is left, a string cut into pieces
    { id: 'g4-ps-be', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g4-c11-b61', gen: rng => {
      const CH = [[2, 4, 8], [2, 4, 8, 16], [3, 6, 12], [3, 9], [5, 10], [2, 6, 12], [4, 12], [2, 10]];
      const pick = c => { const d = P(rng, c); return fq(R(rng, 1, d - 1), d); };
      const f = R(rng, 0, 2), who = NC.name(rng);
      for (let g = 0; g < 400; g++) {
        const c = P(rng, CH), p = pick(c), q = pick(c);
        if (f === 0) {
          if (!rel(p, q)) continue; const s = fadd(p, q, 1); if (fval(s) >= 1) continue; const rest = fq(s.d - s.n, s.d);
          return Q(L(`Một bể chưa có nước. Lần thứ nhất người ta cho vòi chảy vào ${fs(p)} bể, lần thứ hai cho chảy thêm ${fs(q)} bể. Hỏi còn bao nhiêu phần của bể chưa có nước?`,
            `A tank is empty. First, water is let in until ${fs(p)} of the tank is full. Then another ${fs(q)} of the tank is filled. What fraction of the tank is still empty?`),
          NC.fr(rest.n, rest.d), J(L('Sau hai lần, lượng nước đã chảy vào bể là:', 'After the two fillings, the part of the tank with water:'), `${fs(p)} + ${fs(q)} = ${addSteps(p, q, 1).join(' = ')} (${L('bể', 'of the tank')})`,
            L('Phần bể chưa có nước là:', 'The part still empty:'), `1 ${M} ${fs(s)} = ${oneMinus(s).join(' = ')} (${L('bể', 'of the tank')})`, done(fs(rest), 'bể', 'of the tank')),
          { hint: L('Cả bể là 1.', 'The whole tank is 1.') });
        }
        if (f === 1) {
          if (!rel(p, q) || fval(p) <= fval(q)) continue; const d2 = fadd(p, q, -1); if (!rel(p, d2)) continue;
          const s = fadd(p, d2, 1); if (fval(s) >= 1) continue; const rest = fq(s.d - s.n, s.d);
          return Q(L(`${who} đọc một quyển truyện. Ngày thứ nhất ${who} đọc được ${fs(p)} quyển truyện, ngày thứ hai đọc được ít hơn ngày thứ nhất ${fs(q)} quyển truyện. Hỏi ${who} còn phải đọc bao nhiêu phần quyển truyện nữa thì hết?`,
            `${who} is reading a storybook. On the first day ${who} reads ${fs(p)} of the book. On the second day ${who} reads ${fs(q)} of the book less than on the first day. What fraction of the book is still left to read?`),
          NC.fr(rest.n, rest.d), J(L('Ngày thứ hai đọc được là:', 'Read on the second day:'), `${fs(p)} ${M} ${fs(q)} = ${addSteps(p, q, -1).join(' = ')} (${L('quyển truyện', 'of the book')})`,
            L('Cả hai ngày đọc được là:', 'Read in the two days:'), `${fs(p)} + ${fs(d2)} = ${addSteps(p, d2, 1).join(' = ')} (${L('quyển truyện', 'of the book')})`,
            L('Phần quyển truyện còn phải đọc là:', 'Still left to read:'), `1 ${M} ${fs(s)} = ${oneMinus(s).join(' = ')} (${L('quyển truyện', 'of the book')})`, done(fs(rest), 'quyển truyện', 'of the book')),
          { hint: L('Tìm phần đọc được ngày thứ hai trước. Cả quyển truyện là 1.', 'First find the part read on the second day. The whole book is 1.') });
        }
        if (!rel(p, q) || fval(p) <= fval(q)) continue;
        const k = R(rng, 2, 5), left = fadd(p, q, -1), piece = fq(left.n, left.d * k);
        if (piece.d > 60) continue;
        return Q(L(`Một sợi dây dài ${fs(p)} m. Người ta cắt đi ${fs(q)} m, phần còn lại chia đều thành ${k} đoạn. Hỏi mỗi đoạn dài bao nhiêu mét?`,
          `A piece of string is ${fs(p)} m long. ${fs(q)} m is cut off, and the rest is cut into ${k} equal pieces. How long is each piece, in metres?`),
        NC.fr(piece.n, piece.d), J(L('Phần dây còn lại dài là:', 'The string left:'), `${fs(p)} ${M} ${fs(q)} = ${addSteps(p, q, -1).join(' = ')} (m)`,
          L('Mỗi đoạn dài là:', 'Each piece:'), `${fs(left)} : ${k} = ${fs(left)} × 1/${k} = ${left.n}/${left.d * k}${fs(piece) !== `${left.n}/${left.d * k}` ? ` = ${fs(piece)}` : ''} (m)`, done(fs(piece), 'm', 'm')),
        { hint: L(`Chia cho ${k} là nhân với 1/${k}.`, `Dividing by ${k} is the same as multiplying by 1/${k}.`) });
      }
      return Q(L('Một bể chưa có nước. Lần thứ nhất người ta cho vòi chảy vào 2/7 bể, lần thứ hai cho chảy thêm 3/14 bể. Hỏi còn bao nhiêu phần của bể chưa có nước?', 'A tank is empty. First, water is let in until 2/7 of the tank is full. Then another 3/14 of the tank is filled. What fraction of the tank is still empty?'),
        NC.fr(1, 2), '2/7 + 3/14 = 4/14 + 3/14 = 7/14 = 1/2\n1 − 1/2 = 1/2');
    } },

    // equal fractions and comparing several fractions (trắc nghiệm)
    { id: 'g4-ps-bang', from: 'cuoi-nam', kinds: ['tn'], lesson: 'g4-c10-b56', gen: rng => {
      const f = R(rng, 0, 2);
      const equiv = (x, y) => x[0] * y[1] === x[1] * y[0];
      if (f <= 1) {
        const b = R(rng, 2, 9); let a = R(rng, 1, b - 1); while (U.gcd(a, b) > 1) a--;
        const ks = U.sample(rng, [2, 3, 4, 5, 6, 7, 8, 9], 4), base = [a, b];
        if (f === 0) {
          const eq = ks.slice(0, 3).map(k => [a * k, b * k]), k = ks[3];
          const w = P(rng, [[a * k + 1, b * k], [a * k, b * k + 1], [a + k, b + k]]);
          return Q(L(`Phân số nào dưới đây không bằng phân số ${a}/${b}?`, `Which fraction is not equal to ${a}/${b}?`), ch(rng, `${w[0]}/${w[1]}`, eq.map(x => `${x[0]}/${x[1]}`)),
            J(L(`Rút gọn: ${eq.map((x, i) => `${x[0]}/${x[1]} = ${a}/${b} (chia cả tử số và mẫu số cho ${ks[i]})`).join('; ')}.`, `Simplify: ${eq.map((x, i) => `${x[0]}/${x[1]} = ${a}/${b} (divide the numerator and the denominator by ${ks[i]})`).join('; ')}.`),
              L(`Phân số ${w[0]}/${w[1]} không bằng ${a}/${b}.`, `${w[0]}/${w[1]} is not equal to ${a}/${b}.`)),
            { hint: L('Rút gọn từng phân số.', 'Simplify each fraction.') });
        }
        const k = ks[0], good = [a * k, b * k];
        const cands = [[a + k, b + k], [a * k, b + k], [a * k + 1, b * k], [b * k, a * k], [a * k, b * k - 1], [a + 1, b * k]].filter(x => x[0] > 0 && x[1] > 0 && !equiv(x, base));
        return Q(L(`Phân số nào dưới đây bằng phân số ${a}/${b}?`, `Which fraction is equal to ${a}/${b}?`), ch(rng, `${good[0]}/${good[1]}`, U.shuffle(rng, cands).map(x => `${x[0]}/${x[1]}`)),
          L(`${a}/${b} = (${a} × ${k})/(${b} × ${k}) = ${good[0]}/${good[1]}. Các phân số còn lại rút gọn không được ${a}/${b}.`, `${a}/${b} = (${a} × ${k})/(${b} × ${k}) = ${good[0]}/${good[1]}. None of the other fractions simplifies to ${a}/${b}.`),
          { hint: L('Nhân cả tử số và mẫu số với cùng một số.', 'Multiply the numerator and the denominator by the same number.') });
      }
      const b = R(rng, 2, 5), chain = P(rng, [[b, 2 * b, 4 * b], [b, 3 * b], [b, 2 * b]]), D = chain[chain.length - 1];
      const fr4 = [];
      for (let g = 0; g < 200 && fr4.length < 4; g++) {
        const d = P(rng, chain), n = R(rng, 1, d - 1);
        if (U.gcd(n, d) === 1 && !fr4.some(x => equiv(x, [n, d]))) fr4.push([n, d]);
      }
      while (fr4.length < 4) { const n = fr4.length; fr4.push([2 * n + 1, 2 * D]); }
      const D2 = fr4.reduce((m, x) => (m % x[1] === 0 ? m : m * x[1] / U.gcd(m, x[1])), D);
      const big = rng() < 0.5, key = x => x[0] * D2 / x[1];
      const best = fr4.slice().sort((x, y) => (big ? key(y) - key(x) : key(x) - key(y)))[0];
      return Q(L(`Trong các phân số ${fr4.map(x => `${x[0]}/${x[1]}`).join('; ')}, phân số ${big ? 'lớn' : 'bé'} nhất là:`, `Which is the ${big ? 'largest' : 'smallest'} of the fractions ${fr4.map(x => `${x[0]}/${x[1]}`).join(', ')}?`),
        ch(rng, `${best[0]}/${best[1]}`, fr4.filter(x => x !== best).map(x => `${x[0]}/${x[1]}`)),
        J(L(`Quy đồng mẫu số với mẫu số chung ${D2}: ${fr4.map(x => `${x[0]}/${x[1]} = ${key(x)}/${D2}`).join('; ')}.`, `Give them the common denominator ${D2}: ${fr4.map(x => `${x[0]}/${x[1]} = ${key(x)}/${D2}`).join('; ')}.`),
          L(`So sánh các tử số: phân số ${big ? 'lớn' : 'bé'} nhất là ${best[0]}/${best[1]}.`, `Compare the numerators: the ${big ? 'largest' : 'smallest'} is ${best[0]}/${best[1]}.`)),
        { hint: L('Quy đồng mẫu số rồi so sánh tử số.', 'Give the fractions a common denominator, then compare the numerators.') });
    } },
  ]);
})();
