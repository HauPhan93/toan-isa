/* Toán ISA — Học dạng toán, lớp 5. Contract: DANGTOAN.md.
 * Kinds in the order of SGK Toán 5 (Kết nối tri thức): học kì I Bài 19–22 (decimals in word problems), 25, 26, 27;
 * học kì II Bài 37, 38, 39, 40, 41, 52–53, 57–58, 59, 60 (one moving object only).
 * Every problem is written once as a guided example (prompt + steps + done); the practice questions reuse the same
 * builders through toQ(), so the lời giải of a practice question is the list of the steps' lines.
 * Decimals are built from whole numbers (dec(n, k) = n : 10^k) and never have more than 3 places.
 */
(function () {
  'use strict';
  const L = DT.L, F = DT.F, R = DT.R, P = DT.P, M = DT.M, num = DT.num, ch = DT.ch, vz = DT.vz, Q = DT.Q, S = DT.step;

  // ---------- helpers ----------
  const pl = (n, one, many) => `${F(n)} ${n === 1 ? one : (many || one + 's')}`;   // English singular / plural
  const lc = s => s[0].toLowerCase() + s.slice(1);
  const FX = (x, k) => U.fmt(x, k);   // with a fixed number of decimal places (3,6 → 3,60)
  const rd = (x, n) => U.round(x, n == null ? 3 : n);
  const dec = (n, k) => rd(n / Math.pow(10, k), k);
  const nz = (rng, a, b) => { let n = R(rng, a, b); if (n % 10 === 0) n++; return n; };   // a mantissa that does not end in 0
  const DONG = L('đồng', 'dong'), KD = L('nghìn đồng', 'thousand dong'), KMH = L('km/giờ', 'km/h'), HRS = L('giờ', 'hours'), MINS = L('phút', 'minutes');
  const EASY = L('Tính bằng cách thuận tiện:', 'Calculate in the easiest way:');
  const DS = (vi, en) => L(`Đáp số: ${vi}.`, `Answer: ${en == null ? vi : en}.`);
  const G = (prompt, steps, done, visual) => Object.assign({ prompt, steps, done }, visual ? { visual } : {});
  // a guided example as a practice question: the answer of its last step (or `answer`), all the lines as the lời giải
  const toQ = (g, hint, answer) => Q(g.prompt, answer || g.steps[g.steps.length - 1].answer, g.steps.map(s => s.say).join('\n'),
    Object.assign(hint ? { hint } : {}, g.visual ? { visual: g.visual } : {}));
  // a practice-only problem: rows of [value, unit, line of the lời giải]; the last row is the answer
  const lines = (prompt, rows, hint, visual) => Q(prompt, num(rows[rows.length - 1][0], rows[rows.length - 1][1]), rows.map(r => r[2]).join('\n'), Object.assign(hint ? { hint } : {}, visual ? { visual } : {}));
  // practice: i 0–3 the plain form, 4–6 a variation, 7–9 the hardest (8 and 9 from the advanced bank when it has entries)
  const prac = (plain, vary, hard, bank, keep) => (rng, i) => (i < 4 ? plain(rng, i) : i < 7 ? vary(rng, i) : (i > 7 && bank && DT.bank(rng, bank, keep)) || hard(rng, i));
  // time amounts and times of day (English uses the clock form 7:30 for a time of day)
  const hm = (h, m) => L(h && m ? `${h} giờ ${m} phút` : h ? `${h} giờ` : `${m} phút`, h && m ? `${pl(h, 'hour')} ${pl(m, 'minute')}` : h ? pl(h, 'hour') : pl(m, 'minute'));
  const clk = (h, m) => L(m ? `${h} giờ ${m} phút` : `${h} giờ`, `${h}:${String(m).padStart(2, '0')}`);
  const tm = t => hm(Math.floor(t / 60), t % 60), ck = t => clk(Math.floor(t / 60), t % 60);
  // a choice of time amounts given in minutes; every option is a different amount
  const timeCh = (rng, ans, wrongs, f) => ch(rng, (f || tm)(ans), wrongs.concat([ans + 60, ans + 10, ans - 10, ans + 5]).filter((t, k, a) => t > 0 && t !== ans && a.indexOf(t) === k).map(f || tm));

  // ================= 1. Bài toán về cộng, trừ số thập phân (Bài 19, 20) =================
  const CT_THINGS = [
    { u: 'm', vi: ['Một tấm vải dài', 'cắt đi', 'tấm vải', 'mét'], en: ['A piece of cloth is', 'long', 'is cut off', 'How many metres of cloth are left?'] },
    { u: 'l', vi: ['Một thùng có', 'lấy ra', 'trong thùng', 'lít dầu'], en: ['A drum holds', 'of oil', 'is taken out', 'How many litres of oil are left in the drum?'] },
    { u: 'kg', vi: ['Một bao có', 'lấy ra', 'trong bao', 'ki-lô-gam gạo'], en: ['A sack holds', 'of rice', 'is taken out', 'How many kilograms of rice are left in the sack?'] },
  ];
  // T − (b + c): two amounts taken away from a whole
  function ctLeft(rng) {
    const X = P(rng, CT_THINGS), bh = nz(rng, 125, 495), ch1 = nz(rng, 8, 29) * 10, Th = (Math.ceil((bh + ch1) / 100) + R(rng, 2, 8)) * 100 + P(rng, [0, 50]);
    const b = dec(bh, 2), c = dec(ch1, 2), T = dec(Th, 2), used = dec(bh + ch1, 2), left = dec(Th - bh - ch1, 2), u = X.u;
    return G(
      L(`${X.vi[0]} ${F(T)} ${u}${u === 'm' ? '' : ' ' + X.vi[3].split(' ').slice(1).join(' ')}. Lần thứ nhất người ta ${X.vi[1]} ${F(b)} ${u}, lần thứ hai ${X.vi[1]} ${F(c)} ${u}. Hỏi ${X.vi[2]} còn lại bao nhiêu ${X.vi[3]}?`,
        `${X.en[0]} ${F(T)} ${u} ${X.en[1]}. First ${F(b)} ${u} ${X.en[2]}, then ${F(c)} ${u} more. ${X.en[3]}`),
      [
        S(L('Muốn tìm phần còn lại, trước hết ta tìm gì?', 'To find what is left, what do you find first?'),
          ch(rng, L(`Cả hai lần đã ${X.vi[1]} bao nhiêu`, 'How much was taken in the two times together'), [L(`Lần thứ nhất ${X.vi[1]} nhiều hơn lần thứ hai bao nhiêu`, 'How much more was taken the first time'), L('Lúc đầu có tất cả bao nhiêu', 'How much there was at the start')]),
          L('Gộp hai lần lại (phép cộng), rồi lấy số lúc đầu trừ đi.', 'Add the two amounts, then take the sum away from the amount at the start.')),
        S(L(`Cả hai lần: ${F(b)} + ${F(c)} = ?`, `Both times: ${F(b)} + ${F(c)} = ?`), num(used, u), L(`Cả hai lần đã ${X.vi[1]}: ${F(b)} + ${F(c)} = ${F(used)} (${u}).`, `Taken both times: ${F(b)} + ${F(c)} = ${F(used)} (${u}).`),
          L(`Đặt tính: viết các dấu phẩy thẳng cột; ${F(c)} viết thành ${FX(c, 2)}.`, `Set it out with the decimal commas lined up; write ${F(c)} as ${FX(c, 2)}.`)),
        S(L(`Còn lại: ${F(T)} ${M} ${F(used)} = ?`, `Left: ${F(T)} ${M} ${F(used)} = ?`), num(left, u), L(`Còn lại: ${F(T)} ${M} ${F(used)} = ${F(left)} (${u}).`, `Left: ${F(T)} ${M} ${F(used)} = ${F(left)} (${u}).`),
          L(`Viết ${F(T)} thành ${FX(T, 2)} rồi trừ.`, `Write ${F(T)} as ${FX(T, 2)}, then subtract.`)),
      ],
      DS(`${F(left)} ${u}`));
  }
  // a + (a + b): "more than", then the total
  function ctMore(rng) {
    const [x, y, xE, yE] = P(rng, [['Con gà', 'con vịt', 'A chicken', 'duck'], ['Quả bưởi', 'quả dưa hấu', 'A pomelo', 'watermelon'], ['Con mèo', 'con chó', 'A cat', 'dog']]);
    const a10 = nz(rng, 12, 38), b100 = nz(rng, 15, 95), a = dec(a10, 1), b = dec(b100, 2), second = dec(a10 * 10 + b100, 2), both = dec(a10 * 20 + b100, 2);
    return G(
      L(`${x} cân nặng ${F(a)} kg. ${y[0].toUpperCase() + y.slice(1)} nặng hơn ${lc(x)} ${F(b)} kg. Hỏi cả ${lc(x)} và ${y} cân nặng bao nhiêu ki-lô-gam?`,
        `${xE} weighs ${F(a)} kg. A ${yE} is ${F(b)} kg heavier than the ${lc(xE).replace(/^an? /, '')}. How many kilograms do the two weigh altogether?`),
      [
        S(L(`${y[0].toUpperCase() + y.slice(1)} "nặng hơn" ${F(b)} kg. Tìm cân nặng của ${y} bằng phép tính nào?`, `The ${yE} is ${F(b)} kg "heavier". Which calculation gives its mass?`), ch(rng, `${F(a)} + ${F(b)}`, [`${F(a)} ${M} ${F(b)}`, `${F(a)} × ${F(b)}`]),
          L('"Nặng hơn" thì làm phép cộng.', '"Heavier than" means add.')),
        S(L(`${y[0].toUpperCase() + y.slice(1)} cân nặng: ${F(a)} + ${F(b)} = ?`, `The ${yE} weighs: ${F(a)} + ${F(b)} = ?`), num(second, 'kg'), L(`${y[0].toUpperCase() + y.slice(1)} cân nặng: ${F(a)} + ${F(b)} = ${F(second)} (kg).`, `The ${yE} weighs: ${F(a)} + ${F(b)} = ${F(second)} (kg).`),
          L(`Viết ${F(a)} thành ${FX(a, 2)} để các dấu phẩy thẳng cột.`, `Write ${F(a)} as ${FX(a, 2)} so the decimal commas line up.`)),
        S(L(`Cả hai cân nặng: ${F(a)} + ${F(second)} = ?`, `Both weigh: ${F(a)} + ${F(second)} = ?`), num(both, 'kg'), L(`Cả hai cân nặng: ${F(a)} + ${F(second)} = ${F(both)} (kg).`, `Both weigh: ${F(a)} + ${F(second)} = ${F(both)} (kg).`)),
      ],
      DS(`${F(both)} kg`));
  }
  const CT_HINT = L('Đặt tính: các dấu phẩy thẳng cột; thiếu chữ số ở phần thập phân thì viết thêm 0.', 'Set out the sum with the decimal commas lined up; write extra zeros where a decimal place is missing.');
  function ctPlain(rng, i) {
    if (i === 0) {
      const a = dec(nz(rng, 125, 485), 1), b = dec(nz(rng, 85, 365), 1), s = rd(a + b, 1), [vi, en, u] = P(rng, [['Buổi sáng cửa hàng bán được {a} m vải, buổi chiều bán được {b} m vải. Hỏi cả ngày cửa hàng bán được bao nhiêu mét vải?', 'A shop sells {a} m of cloth in the morning and {b} m in the afternoon. How many metres of cloth does it sell that day?', 'm'],
        ['Thùng thứ nhất có {a} l dầu, thùng thứ hai có {b} l dầu. Hỏi cả hai thùng có bao nhiêu lít dầu?', 'The first drum holds {a} l of oil and the second holds {b} l. How many litres of oil are there in the two drums?', 'l'],
        ['Ngày thứ nhất đội công nhân sửa được {a} m đường, ngày thứ hai sửa được {b} m đường. Hỏi cả hai ngày đội sửa được bao nhiêu mét đường?', 'A team of workers repairs {a} m of road on the first day and {b} m on the second day. How many metres of road do they repair in the two days?', 'm']]);
      return Q(L(vi, en).replace('{a}', F(a)).replace('{b}', F(b)), num(s, u), `${F(a)} + ${F(b)} = ${F(s)} (${u}).`, { hint: CT_HINT });
    }
    if (i === 1) {
      const a = dec(nz(rng, 225, 685), 1), b = dec(nz(rng, 45, 195), 1), s = rd(a - b, 1), [vi, en, u] = P(rng, [['Một sợi dây dài {a} m. Người ta cắt đi {b} m. Hỏi sợi dây còn lại dài bao nhiêu mét?', 'A rope is {a} m long. {b} m is cut off. How many metres of rope are left?', 'm'],
        ['Một thùng có {a} kg đường. Người ta đã lấy ra {b} kg. Hỏi trong thùng còn lại bao nhiêu ki-lô-gam đường?', 'A box holds {a} kg of sugar. {b} kg is taken out. How many kilograms of sugar are left in the box?', 'kg'],
        ['Một bể có {a} l nước. Người ta đã dùng hết {b} l. Hỏi trong bể còn lại bao nhiêu lít nước?', 'A tank holds {a} l of water. {b} l has been used. How many litres of water are left in the tank?', 'l']]);
      return Q(L(vi, en).replace('{a}', F(a)).replace('{b}', F(b)), num(s, u), `${F(a)} ${M} ${F(b)} = ${F(s)} (${u}).`, { hint: CT_HINT });
    }
    if (i === 2) {
      const a10 = nz(rng, 15, 65), b100 = nz(rng, 105, 395), a = dec(a10, 1), b = dec(b100, 2), s = dec(a10 * 10 + b100, 2);
      return Q(L(`Quả dưa hấu cân nặng ${F(a)} kg, quả bưởi cân nặng ${F(b)} kg. Hỏi cả hai quả cân nặng bao nhiêu ki-lô-gam?`, `A watermelon weighs ${F(a)} kg and a pomelo weighs ${F(b)} kg. How many kilograms do the two fruits weigh altogether?`), num(s, 'kg'),
        L(`Viết ${F(a)} thành ${FX(a, 2)}.\n${F(a)} + ${F(b)} = ${F(s)} (kg).`, `Write ${F(a)} as ${FX(a, 2)}.\n${F(a)} + ${F(b)} = ${F(s)} (kg).`), { hint: CT_HINT });
    }
    const T = R(rng, 2, 9), b100 = nz(rng, 15, 185), b = dec(b100, 2), s = dec(T * 100 - b100, 2);
    return Q(L(`Một chai có ${T} l nước. Bạn đã uống ${F(b)} l. Hỏi trong chai còn lại bao nhiêu lít nước?`, `A bottle holds ${T} l of water. You drink ${F(b)} l. How many litres of water are left in the bottle?`), num(s, 'l'),
      L(`Viết ${T} thành ${FX(T, 2)}.\n${T} ${M} ${F(b)} = ${F(s)} (l).`, `Write ${T} as ${FX(T, 2)}.\n${T} ${M} ${F(b)} = ${F(s)} (l).`), { hint: CT_HINT });
  }
  function ctVary(rng, i) {
    if (i === 4) return toQ(ctMore(rng), CT_HINT);
    if (i === 5) {
      const a = nz(rng, 25, 65), b = nz(rng, 25, 65), c = nz(rng, 30, 80), p = dec(a + b + c, 1);
      return Q(L(`Một hình tam giác có độ dài ba cạnh là ${F(dec(a, 1))} cm; ${F(dec(b, 1))} cm và ${F(dec(c, 1))} cm. Tính chu vi hình tam giác đó.`, `The sides of a triangle are ${F(dec(a, 1))} cm, ${F(dec(b, 1))} cm and ${F(dec(c, 1))} cm long. Find the perimeter of the triangle.`), num(p, 'cm'),
        L(`Chu vi hình tam giác: ${F(dec(a, 1))} + ${F(dec(b, 1))} + ${F(dec(c, 1))} = ${F(p)} (cm).`, `Perimeter of the triangle: ${F(dec(a, 1))} + ${F(dec(b, 1))} + ${F(dec(c, 1))} = ${F(p)} (cm).`), { hint: L('Chu vi là tổng độ dài ba cạnh.', 'The perimeter is the sum of the three sides.') });
    }
    const a100 = nz(rng, 125, 695), b10 = nz(rng, 12, 85), a = dec(a100, 2), s = dec(a100 + b10 * 10, 2), b = dec(b10, 1);
    return Q(L(`Tổng của hai số là ${F(s)}. Số thứ nhất là ${F(a)}. Tìm số thứ hai.`, `The sum of two numbers is ${F(s)}. The first number is ${F(a)}. Find the second number.`), num(b),
      L(`Số thứ hai = tổng − số thứ nhất: ${F(s)} ${M} ${F(a)} = ${F(b)}.`, `Second number = sum − first number: ${F(s)} ${M} ${F(a)} = ${F(b)}.`), { hint: L('Lấy tổng trừ đi số hạng đã biết.', 'Take the known addend away from the sum.') });
  }
  function ctHard(rng, i) {
    if (i === 8) {
      // a + b + c where a + c is a whole number
      const a100 = nz(rng, 115, 885), c100 = 100 - a100 % 100 + R(rng, 1, 6) * 100, b10 = nz(rng, 12, 95);
      const a = dec(a100, 2), c = dec(c100, 2), b = dec(b10, 1), ac = dec(a100 + c100, 2), e = `${F(a)} + ${F(b)} + ${F(c)}`;
      return Q(`${EASY}\n${e}`, num(rd(ac + b, 2)), `${e} = (${F(a)} + ${F(c)}) + ${F(b)} = ${F(ac)} + ${F(b)} = ${F(rd(ac + b, 2))}.`, { hint: L('Tìm hai số có tổng là số tự nhiên rồi nhóm lại.', 'Find two numbers whose sum is a whole number and group them.') });
    }
    if (i === 9) {
      const b = R(rng, 10, 20), c100 = nz(rng, 125, 475), a10 = nz(rng, 12, 35), c = dec(c100, 2), a = dec(a10, 1), right = dec(b * 100 - c100, 2), x = dec(b * 100 - c100 - a10 * 10, 2);
      return Q(L(`Tìm số thích hợp:\n? + ${F(a)} = ${b} ${M} ${F(c)}`, `Find the missing number:\n? + ${F(a)} = ${b} ${M} ${F(c)}`), num(x), L(`${b} ${M} ${F(c)} = ${F(right)}.\n? + ${F(a)} = ${F(right)} nên ? = ${F(right)} ${M} ${F(a)} = ${F(x)}.`, `${b} ${M} ${F(c)} = ${F(right)}.\n? + ${F(a)} = ${F(right)}, so ? = ${F(right)} ${M} ${F(a)} = ${F(x)}.`),
        { hint: L('Tính vế phải trước, rồi lấy tổng trừ số hạng đã biết.', 'Work out the right-hand side first, then take the known addend away from the sum.') });
    }
    const T = R(rng, 12, 30), b10 = nz(rng, 35, 65), c10 = nz(rng, 5, 25), second = b10 - c10, left = T * 10 - b10 - second;
    return lines(L(`Một thùng có ${T} l dầu. Lần thứ nhất người ta lấy ra ${F(dec(b10, 1))} l, lần thứ hai lấy ra ít hơn lần thứ nhất ${F(dec(c10, 1))} l. Hỏi trong thùng còn lại bao nhiêu lít dầu?`, `A drum holds ${T} l of oil. First ${F(dec(b10, 1))} l is taken out. The second time, ${F(dec(c10, 1))} l less is taken out than the first time. How many litres of oil are left in the drum?`),
      [[dec(second, 1), 'l', L(`Lần thứ hai lấy ra: ${F(dec(b10, 1))} ${M} ${F(dec(c10, 1))} = ${F(dec(second, 1))} (l).`, `Second time: ${F(dec(b10, 1))} ${M} ${F(dec(c10, 1))} = ${F(dec(second, 1))} (l).`)],
        [dec(b10 + second, 1), 'l', L(`Cả hai lần lấy ra: ${F(dec(b10, 1))} + ${F(dec(second, 1))} = ${F(dec(b10 + second, 1))} (l).`, `Both times: ${F(dec(b10, 1))} + ${F(dec(second, 1))} = ${F(dec(b10 + second, 1))} (l).`)],
        [dec(left, 1), 'l', L(`Còn lại: ${T} ${M} ${F(dec(b10 + second, 1))} = ${F(dec(left, 1))} (l).`, `Left: ${T} ${M} ${F(dec(b10 + second, 1))} = ${F(dec(left, 1))} (l).`)]],
      L('Tìm lần thứ hai, rồi cả hai lần, rồi phần còn lại.', 'Find the second time, then both times, then what is left.'));
  }

  // ================= 2. Bài toán về nhân số thập phân (Bài 21) =================
  // contexts: A and B are the whole-number mantissas, da and db the numbers of decimal places
  function nhCtx(rng, k) {
    if (k === 1) { const A = nz(rng, 35, 55), B = P(rng, [15, 25, 35]); return { A, B, da: 1, db: 1, u: 'km', p: (a, b) => L(`Một người đi bộ mỗi giờ đi được ${a} km. Hỏi trong ${b} giờ người đó đi được bao nhiêu ki-lô-mét?`, `A walker goes ${a} km each hour. How many kilometres does the walker go in ${b} hours?`), line: L('Quãng đường đi được', 'Distance') }; }
    if (k === 2) { const A = nz(rng, 85, 185), B = nz(rng, 35, 80); return { A, B, da: 1, db: 1, u: 'm²', p: (a, b) => L(`Một mảnh vườn hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Tính diện tích mảnh vườn.`, `A rectangular garden is ${a} m long and ${b} m wide. Find the area of the garden.`), line: L('Diện tích mảnh vườn', 'Area of the garden'), rect: true }; }
    if (k === 3) { const A = nz(rng, 15, 95), B = P(rng, [3, 4, 5, 6, 7, 8, 9, 11, 12, 15]); return { A, B, da: 2, db: 0, u: 'kg', p: (a, b) => L(`Mỗi gói kẹo cân nặng ${a} kg. Hỏi ${b} gói kẹo như thế cân nặng bao nhiêu ki-lô-gam?`, `Each bag of sweets weighs ${a} kg. How many kilograms do ${b} bags like this weigh?`), line: L(`${B} gói kẹo cân nặng`, `${B} bags weigh`) }; }
    if (k === 4) { const A = nz(rng, 125, 245), B = P(rng, [15, 25, 35, 45]); return { A, B, da: 1, db: 1, u: KD, p: (a, b) => L(`Mỗi ki-lô-gam gạo giá ${a} nghìn đồng. Hỏi mua ${b} kg gạo như thế hết bao nhiêu nghìn đồng?`, `Rice costs ${a} thousand dong per kilogram. How many thousand dong do ${b} kg of this rice cost?`), line: L('Số tiền mua gạo', 'Cost of the rice') }; }
    const A = nz(rng, 7, 9), B = nz(rng, 15, 95);
    return { A, B, da: 1, db: 1, u: 'kg', p: (a, b) => L(`Mỗi lít dầu cân nặng ${a} kg. Hỏi ${b} l dầu cân nặng bao nhiêu ki-lô-gam?`, `Each litre of oil weighs ${a} kg. How many kilograms do ${b} l of oil weigh?`), line: L(`${F(dec(B, 1))} l dầu cân nặng`, `${F(dec(B, 1))} l of oil weigh`) };
  }
  function nhForm(rng, k) {
    const c = nhCtx(rng, k), { A, B, da, db } = c, a = dec(A, da), b = dec(B, db), places = da + db, prod = A * B, v = rd(prod / Math.pow(10, places), places), e = `${F(a)} × ${F(b)}`;
    const raw = FX(prod / Math.pow(10, places), places);   // the product with all its decimal places, before dropping zeros
    return G(c.p(F(a), F(b)),
      [
        S(c.rect ? L('Diện tích hình chữ nhật tính bằng phép tính nào?', 'Which calculation gives the area of the rectangle?') : L('Biết giá trị của 1 phần. Tìm nhiều phần bằng phép tính nào?', 'You know the value of 1 part. Which calculation gives several parts?'),
          ch(rng, e, [`${F(a)} + ${F(b)}`, `${F(a)} : ${F(b)}`]), c.rect ? L(`Diện tích = chiều dài × chiều rộng = ${e}.`, `Area = length × width = ${e}.`) : L(`Lấy giá trị 1 phần nhân với số phần: ${e}.`, `Multiply the value of 1 part by the number of parts: ${e}.`)),
        S(L(`Nhân như nhân hai số tự nhiên (chưa để ý dấu phẩy): ${A} × ${B} = ?`, `Multiply as whole numbers (ignore the commas for now): ${A} × ${B} = ?`), num(prod), `${A} × ${B} = ${F(prod)}.`),
        S(L(`Phần thập phân của cả hai thừa số có tất cả mấy chữ số?`, `How many decimal places do the two factors have altogether?`), num(places),
          L(`${F(a)} có ${da} chữ số ở phần thập phân, ${F(b)} có ${db} chữ số: tất cả ${places} chữ số.`, `${F(a)} has ${pl(da, 'decimal place')} and ${F(b)} has ${db}: ${places} altogether.`)),
        S(L(`Dùng dấu phẩy tách ở tích ${F(prod)} ra ${places} chữ số kể từ phải sang trái. Vậy ${e} = ?`, `Count ${places} digits from the right in ${F(prod)} and put the comma there. So ${e} = ?`), num(v, c.u),
          L(`${c.line}: ${e} = ${raw === F(v) ? F(v) : `${raw} = ${F(v)}`} (${c.u}).`, `${c.line}: ${e} = ${raw === F(v) ? F(v) : `${raw} = ${F(v)}`} (${c.u}).`)),
      ],
      DS(`${F(v)} ${c.u}`), c.rect ? vz('shape', { kind: 'rect', dims: { a: a, b: b, unit: 'm' }, showDims: true }) : null);
  }
  const NH_HINT = L('Nhân như số tự nhiên, rồi đếm xem phần thập phân của cả hai thừa số có bao nhiêu chữ số để đặt dấu phẩy ở tích.', 'Multiply as whole numbers, then count the decimal places of both factors to place the comma in the product.');
  function nhVary(rng, i) {
    const A = nz(rng, 65, 185), B = nz(rng, 25, 60), a = dec(A, 1), b = dec(B, 1);
    if (i === 4) {
      const half = dec(A + B, 1), per = dec((A + B) * 2, 1);
      return lines(L(`Một tấm bìa hình chữ nhật có chiều dài ${F(a)} cm, chiều rộng ${F(b)} cm. Tính chu vi tấm bìa.`, `A rectangular card is ${F(a)} cm long and ${F(b)} cm wide. Find the perimeter of the card.`),
        [[half, 'cm', L(`Tổng của chiều dài và chiều rộng: ${F(a)} + ${F(b)} = ${F(half)} (cm).`, `Length + width: ${F(a)} + ${F(b)} = ${F(half)} (cm).`)], [per, 'cm', L(`Chu vi tấm bìa: ${F(half)} × 2 = ${F(per)} (cm).`, `Perimeter of the card: ${F(half)} × 2 = ${F(per)} (cm).`)]],
        L('Chu vi hình chữ nhật = (dài + rộng) × 2.', 'Perimeter of a rectangle = (length + width) × 2.'), vz('shape', { kind: 'rect', dims: { a, b, unit: 'cm' }, showDims: true }));
    }
    if (i === 5) {
      const s10 = nz(rng, 15, 95), s = dec(s10, 1), area = R(rng, 0, 1) === 1, v = area ? dec(s10 * s10, 2) : dec(s10 * 4, 1);
      return Q(L(`Một viên gạch hình vuông có cạnh ${F(s)} dm. Tính ${area ? 'diện tích' : 'chu vi'} viên gạch.`, `A square tile has sides of ${F(s)} dm. Find its ${area ? 'area' : 'perimeter'}.`), num(v, area ? 'dm²' : 'dm'),
        area ? L(`Diện tích viên gạch: ${F(s)} × ${F(s)} = ${F(v)} (dm²).`, `Area of the tile: ${F(s)} × ${F(s)} = ${F(v)} (dm²).`) : L(`Chu vi viên gạch: ${F(s)} × 4 = ${F(v)} (dm).`, `Perimeter of the tile: ${F(s)} × 4 = ${F(v)} (dm).`),
        { hint: L('Chu vi hình vuông = cạnh × 4; diện tích hình vuông = cạnh × cạnh.', 'Perimeter of a square = side × 4; area of a square = side × side.') });
    }
    const k1 = P(rng, [15, 25, 35]), k2 = P(rng, [5, 15, 25]), p = R(rng, 4, 9) * 5, q = R(rng, 3, 7) * 5 + 2, c1 = dec(k1 * p, 1), c2 = dec(k2 * q, 1);
    return lines(L(`Mẹ mua ${F(dec(k1, 1))} kg táo, mỗi ki-lô-gam giá ${p} nghìn đồng, và ${F(dec(k2, 1))} kg nho, mỗi ki-lô-gam giá ${q} nghìn đồng. Hỏi mẹ phải trả tất cả bao nhiêu nghìn đồng?`, `Mum buys ${F(dec(k1, 1))} kg of apples at ${p} thousand dong per kilogram and ${F(dec(k2, 1))} kg of grapes at ${q} thousand dong per kilogram. How many thousand dong does she pay altogether?`),
      [[c1, '', L(`Tiền mua táo: ${p} × ${F(dec(k1, 1))} = ${F(c1)} (nghìn đồng).`, `Apples: ${p} × ${F(dec(k1, 1))} = ${F(c1)} (thousand dong).`)], [c2, '', L(`Tiền mua nho: ${q} × ${F(dec(k2, 1))} = ${F(c2)} (nghìn đồng).`, `Grapes: ${q} × ${F(dec(k2, 1))} = ${F(c2)} (thousand dong).`)],
        [rd(c1 + c2, 1), KD, L(`Mẹ phải trả tất cả: ${F(c1)} + ${F(c2)} = ${F(rd(c1 + c2, 1))} (nghìn đồng).`, `Altogether: ${F(c1)} + ${F(c2)} = ${F(rd(c1 + c2, 1))} (thousand dong).`)]],
      L('Tính tiền từng loại quả rồi cộng lại.', 'Work out the cost of each fruit, then add.'));
  }
  function nhHard(rng, i) {
    if (i === 8) {
      const A = nz(rng, 15, 95), b10 = nz(rng, 12, 88), a = dec(A, 1), b = dec(b10, 1), c = dec(100 - b10, 1), e = `${F(a)} × ${F(b)} + ${F(a)} × ${F(c)}`;
      return Q(`${EASY}\n${e}`, num(dec(A * 10, 1)), `${e} = ${F(a)} × (${F(b)} + ${F(c)}) = ${F(a)} × 10 = ${F(dec(A * 10, 1))}.`, { hint: L(`Đặt ${F(a)} làm thừa số chung.`, `Take ${F(a)} out as the common factor.`) });
    }
    if (i === 9) {
      const A = nz(rng, 36, 85), B = nz(rng, 5, 35), a = dec(A, 1), b = dec(B, 1), dm2 = dec(A * B, 2), cm2 = A * B;
      return lines(L(`Một tấm kính hình chữ nhật có chiều dài ${F(a)} dm, chiều rộng ${F(b)} dm. Hỏi diện tích tấm kính là bao nhiêu xăng-ti-mét vuông?`, `A rectangular sheet of glass is ${F(a)} dm long and ${F(b)} dm wide. What is its area in square centimetres?`),
        [[dm2, 'dm²', L(`Diện tích tấm kính: ${F(a)} × ${F(b)} = ${F(dm2)} (dm²).`, `Area of the glass: ${F(a)} × ${F(b)} = ${F(dm2)} (dm²).`)], [cm2, 'cm²', L(`Đổi: ${F(dm2)} dm² = ${F(cm2)} cm² (nhân với 100: chuyển dấu phẩy sang phải hai chữ số).`, `Change: ${F(dm2)} dm² = ${F(cm2)} cm² (× 100: move the comma two places to the right).`)]],
        L('Tính diện tích theo dm² rồi đổi ra cm² (1 dm² = 100 cm²).', 'Find the area in dm², then change it to cm² (1 dm² = 100 cm²).'));
    }
    const k = P(rng, [15, 25, 35, 45]), p = R(rng, 6, 16) * 5, cost = dec(k * p, 1), pay = Math.ceil((cost + 1) / 100) * 100;
    return lines(L(`Mẹ mua ${F(dec(k, 1))} m vải, mỗi mét giá ${p} nghìn đồng. Mẹ đưa cô bán hàng ${pay} nghìn đồng. Hỏi cô bán hàng trả lại mẹ bao nhiêu nghìn đồng?`, `Mum buys ${F(dec(k, 1))} m of cloth at ${p} thousand dong per metre. She gives the shopkeeper ${pay} thousand dong. How many thousand dong change does she get?`),
      [[cost, '', L(`Tiền mua vải: ${p} × ${F(dec(k, 1))} = ${F(cost)} (nghìn đồng).`, `Cost of the cloth: ${p} × ${F(dec(k, 1))} = ${F(cost)} (thousand dong).`)], [rd(pay - cost, 1), KD, L(`Cô bán hàng trả lại: ${pay} ${M} ${F(cost)} = ${F(rd(pay - cost, 1))} (nghìn đồng).`, `Change: ${pay} ${M} ${F(cost)} = ${F(rd(pay - cost, 1))} (thousand dong).`)]],
      L('Tính tiền mua vải trước, rồi lấy tiền đưa trừ đi.', 'Find the cost of the cloth first, then take it away from the money given.'));
  }

  // ================= 3. Bài toán về chia số thập phân (Bài 22) =================
  // a : b = n, with b a decimal with one place ("how many parts?")
  function chCount(rng) {
    const B = nz(rng, 12, 48); let n = R(rng, 4, 15); while ((B * n) % 10 === 0) n++;   // keep one decimal place in the dividend
    const b = dec(B, 1), a = dec(B * n, 1), e = `${F(a)} : ${F(b)}`;
    const [vi, en, u, uE] = P(rng, [[`May mỗi bộ quần áo hết ${F(b)} m vải. Hỏi có ${F(a)} m vải thì may được bao nhiêu bộ quần áo như thế?`, `Each outfit needs ${F(b)} m of cloth. How many outfits like this can be made from ${F(a)} m of cloth?`, 'bộ', 'outfits'],
      [`Mỗi chai chứa ${F(b)} l nước mắm. Hỏi có ${F(a)} l nước mắm thì rót được vào bao nhiêu chai như thế?`, `Each bottle holds ${F(b)} l of fish sauce. How many bottles like this will ${F(a)} l of fish sauce fill?`, 'chai', 'bottles'],
      [`Mỗi túi đựng ${F(b)} kg gạo. Hỏi có ${F(a)} kg gạo thì đóng được bao nhiêu túi như thế?`, `Each bag holds ${F(b)} kg of rice. How many bags like this can be filled with ${F(a)} kg of rice?`, 'túi', 'bags']]);
    return G(L(vi, en),
      [
        S(L('Biết mỗi phần và biết tất cả. Tìm số phần bằng phép tính nào?', 'You know one part and the total. Which calculation gives the number of parts?'), ch(rng, e, [`${F(a)} × ${F(b)}`, `${F(a)} ${M} ${F(b)}`]), L(`Hỏi "được bao nhiêu phần" thì lấy tất cả chia cho một phần: ${e}.`, `"How many parts?" means the total divided by one part: ${e}.`)),
        S(L(`Số chia ${F(b)} có mấy chữ số ở phần thập phân?`, `How many decimal places does the divisor ${F(b)} have?`), num(1), L(`Số chia ${F(b)} có 1 chữ số ở phần thập phân: chuyển dấu phẩy của số bị chia sang phải 1 chữ số và bỏ dấu phẩy ở số chia.`, `The divisor ${F(b)} has 1 decimal place: move the comma of the dividend 1 place to the right and drop the comma of the divisor.`)),
        S(L(`Chuyển dấu phẩy của ${F(a)} sang phải 1 chữ số, ta được số nào?`, `Move the comma of ${F(a)} one place to the right. What number do you get?`), num(B * n), L(`${e} = ${F(B * n)} : ${B}.`, `${e} = ${F(B * n)} : ${B}.`), L(`Tức là lấy ${F(a)} × 10.`, `That is ${F(a)} × 10.`)),
        S(`${F(B * n)} : ${B} = ?`, num(n, L(u, uE)), L(`Số ${u}: ${e} = ${n} (${u}).`, `Number of ${uE}: ${e} = ${n} (${uE}).`)),
      ],
      DS(`${n} ${u}`, `${n} ${uE}`));
  }
  // a : n, with n a whole number (sharing equally)
  function chShare(rng) {
    const n = R(rng, 3, 9); let Q10 = nz(rng, 12, 95); while ((Q10 * n) % 10 === 0 || Q10 % 10 === 0) Q10++;   // keep one decimal place in the dividend
    const q = dec(Q10, 1), a = dec(Q10 * n, 1), e = `${F(a)} : ${n}`;
    const [vi, en, u, lineV, lineE] = P(rng, [[`Có ${F(a)} kg gạo chia đều vào ${n} túi. Hỏi mỗi túi có bao nhiêu ki-lô-gam gạo?`, `${F(a)} kg of rice is shared equally among ${n} bags. How many kilograms of rice are in each bag?`, 'kg', 'Mỗi túi có', 'Each bag holds'],
      [`Một sợi dây dài ${F(a)} m được cắt thành ${n} đoạn bằng nhau. Hỏi mỗi đoạn dài bao nhiêu mét?`, `A rope ${F(a)} m long is cut into ${n} equal pieces. How many metres long is each piece?`, 'm', 'Mỗi đoạn dài', 'Each piece is'],
      [`Có ${F(a)} l sữa rót đều vào ${n} bình. Hỏi mỗi bình có bao nhiêu lít sữa?`, `${F(a)} l of milk is poured equally into ${n} jugs. How many litres of milk are in each jug?`, 'l', 'Mỗi bình có', 'Each jug holds']]);
    return G(L(vi, en),
      [
        S(L('Chia đều thành các phần bằng nhau. Tìm một phần bằng phép tính nào?', 'Sharing equally. Which calculation gives one part?'), ch(rng, e, [`${F(a)} × ${n}`, `${F(a)} ${M} ${n}`]), L(`Chia đều thì làm phép chia: ${e}.`, `Sharing equally means dividing: ${e}.`)),
        S(L(`Chia như chia số tự nhiên (chưa để ý dấu phẩy): ${F(Q10 * n)} : ${n} = ?`, `Divide as whole numbers (ignore the comma for now): ${F(Q10 * n)} : ${n} = ?`), num(Q10), `${F(Q10 * n)} : ${n} = ${Q10}.`),
        S(L(`Số bị chia ${F(a)} có 1 chữ số ở phần thập phân nên thương cũng có 1 chữ số ở phần thập phân. Vậy ${e} = ?`, `The dividend ${F(a)} has 1 decimal place, so the quotient has 1 decimal place too. So ${e} = ?`), num(q, u),
          L(`${lineV}: ${e} = ${F(q)} (${u}).`, `${lineE}: ${e} = ${F(q)} (${u}).`), L('Khi chia hết phần nguyên thì viết dấu phẩy vào thương rồi chia tiếp.', 'When you finish the whole-number part, put the comma in the quotient and carry on.')),
      ],
      DS(`${F(q)} ${u}`));
  }
  const CH_HINT = L('Chia cho số thập phân: chuyển dấu phẩy của cả hai số sang phải cho đến khi số chia là số tự nhiên, rồi chia.', 'Dividing by a decimal: move the comma in both numbers to the right until the divisor is a whole number, then divide.');
  function chPlain(rng, i) {
    if (i === 0) return toQ(chShare(rng), L('Chia như số tự nhiên; viết dấu phẩy vào thương khi bắt đầu chia phần thập phân.', 'Divide as whole numbers; put the comma in the quotient when you start on the decimal part.'));
    if (i === 1) return toQ(chCount(rng), CH_HINT);
    if (i === 2) {
      const n = P(rng, [2, 4, 5, 8]); let a = R(rng, 7, 60); if (a % n === 0) a++;
      const q = rd(a / n, 3), [vi, en, u] = P(rng, [[`Một sợi dây dài ${a} m được cắt thành ${n} đoạn bằng nhau. Hỏi mỗi đoạn dài bao nhiêu mét?`, `A rope ${a} m long is cut into ${n} equal pieces. How many metres long is each piece?`, 'm'],
        [`Có ${a} kg đường chia đều vào ${n} túi. Hỏi mỗi túi có bao nhiêu ki-lô-gam đường?`, `${a} kg of sugar is shared equally among ${n} bags. How many kilograms of sugar are in each bag?`, 'kg']]);
      return Q(L(vi, en), num(q, u), L(`${a} : ${n} = ${F(q)} (${u}). (Chia còn dư thì viết dấu phẩy vào thương, thêm 0 vào số dư rồi chia tiếp.)`, `${a} : ${n} = ${F(q)} (${u}). (When there is a remainder, put a comma in the quotient, write a 0 after the remainder and carry on.)`), { hint: L('Còn dư thì viết dấu phẩy vào thương, thêm 0 vào bên phải số dư rồi chia tiếp.', 'If there is a remainder, put a comma in the quotient, write 0 after the remainder and carry on dividing.') });
    }
    const W = nz(rng, 12, 45), Lg = nz(rng, 50, 95), w = dec(W, 1), l = dec(Lg, 1), area = dec(W * Lg, 2);
    return Q(L(`Một tấm thảm hình chữ nhật có diện tích ${F(area)} m², chiều rộng ${F(w)} m. Tính chiều dài tấm thảm.`, `A rectangular rug has an area of ${F(area)} m² and a width of ${F(w)} m. Find the length of the rug.`), num(l, 'm'),
      L(`Chiều dài = diện tích : chiều rộng.\n${F(area)} : ${F(w)} = ${F(dec(W * Lg, 1))} : ${W} = ${F(l)} (m).`, `Length = area : width.\n${F(area)} : ${F(w)} = ${F(dec(W * Lg, 1))} : ${W} = ${F(l)} (m).`), { hint: CH_HINT });
  }
  function chVary(rng, i) {
    if (i === 4) {
      const names = DT.names(rng, 3), v = [nz(rng, 285, 345), nz(rng, 295, 365), 0]; v[2] = nz(rng, 300, 380); const r = (v[0] + v[1] + v[2]) % 3; if (r) v[2] += 3 - r;
      const sum = v[0] + v[1] + v[2], f = x => F(dec(x, 1));
      return lines(L(`Ba bạn ${names[0]}, ${names[1]} và ${names[2]} cân nặng lần lượt là ${f(v[0])} kg; ${f(v[1])} kg và ${f(v[2])} kg. Hỏi trung bình mỗi bạn cân nặng bao nhiêu ki-lô-gam?`, `${names[0]}, ${names[1]} and ${names[2]} weigh ${f(v[0])} kg, ${f(v[1])} kg and ${f(v[2])} kg. On average, how many kilograms does each child weigh?`),
        [[dec(sum, 1), 'kg', L(`Cả ba bạn cân nặng: ${f(v[0])} + ${f(v[1])} + ${f(v[2])} = ${f(sum)} (kg).`, `All three weigh: ${f(v[0])} + ${f(v[1])} + ${f(v[2])} = ${f(sum)} (kg).`)], [dec(sum / 3, 1), 'kg', L(`Trung bình mỗi bạn cân nặng: ${f(sum)} : 3 = ${f(sum / 3)} (kg).`, `Average: ${f(sum)} : 3 = ${f(sum / 3)} (kg).`)]],
        L('Tính tổng rồi chia cho 3.', 'Add them up, then divide by 3.'));
    }
    if (i === 5) {
      const k = P(rng, [15, 25, 35, 45]), p = R(rng, 12, 40), cost = dec(k * p, 1), [vi, en] = P(rng, [['táo', 'apples'], ['cam', 'oranges'], ['thịt', 'meat']]);
      return Q(L(`Mẹ mua ${F(dec(k, 1))} kg ${vi} hết ${F(cost)} nghìn đồng. Hỏi 1 kg ${vi} giá bao nhiêu nghìn đồng?`, `Mum pays ${F(cost)} thousand dong for ${F(dec(k, 1))} kg of ${en}. How many thousand dong does 1 kg cost?`), num(p, KD),
        L(`Giá tiền 1 kg ${vi}: ${F(cost)} : ${F(dec(k, 1))} = ${F(dec(k * p, 0) )} : ${k} = ${p} (nghìn đồng).`, `1 kg costs: ${F(cost)} : ${F(dec(k, 1))} = ${F(dec(k * p, 0))} : ${k} = ${p} (thousand dong).`), { hint: CH_HINT });
    }
    const per = nz(rng, 7, 9), A = P(rng, [15, 25, 35, 45]), c = R(rng, 5, 12), w = dec(per * A, 2);
    return lines(L(`${F(dec(A, 1))} l dầu cân nặng ${F(w)} kg. Hỏi ${c} l dầu như thế cân nặng bao nhiêu ki-lô-gam?`, `${F(dec(A, 1))} l of oil weighs ${F(w)} kg. How many kilograms do ${c} l of this oil weigh?`),
      [[dec(per, 1), 'kg', L(`1 l dầu cân nặng: ${F(w)} : ${F(dec(A, 1))} = ${F(dec(per, 1))} (kg).`, `1 l of oil weighs: ${F(w)} : ${F(dec(A, 1))} = ${F(dec(per, 1))} (kg).`)], [dec(per * c, 1), 'kg', L(`${c} l dầu cân nặng: ${F(dec(per, 1))} × ${c} = ${F(dec(per * c, 1))} (kg).`, `${c} l of oil weigh: ${F(dec(per, 1))} × ${c} = ${F(dec(per * c, 1))} (kg).`)]],
      L('Rút về đơn vị: tìm khối lượng của 1 l dầu trước.', 'Find one unit first: the mass of 1 l of oil.'));
  }
  function chHard(rng) {
    const B = P(rng, [75, 25, 125, 35]), n = R(rng, 2, 9) * 4, p = R(rng, 4, 12) * 5, total = dec(B * n, 2), b = dec(B, 2);
    return lines(L(`Bác Tư có ${F(total)} l mật ong, rót đầy vào các chai, mỗi chai ${F(b)} l. Mỗi chai bán được ${p} nghìn đồng. Hỏi bán hết số mật ong đó, bác Tư thu được bao nhiêu nghìn đồng?`, `Mr Tư has ${F(total)} l of honey. He fills bottles of ${F(b)} l each and sells each bottle for ${p} thousand dong. How many thousand dong does he get for all the honey?`),
      [[n, '', L(`Số chai mật ong: ${F(total)} : ${F(b)} = ${n} (chai).`, `Number of bottles: ${F(total)} : ${F(b)} = ${n} (bottles).`)], [n * p, KD, L(`Số tiền thu được: ${p} × ${n} = ${F(n * p)} (nghìn đồng).`, `Money: ${p} × ${n} = ${F(n * p)} (thousand dong).`)]],
      L('Tìm số chai trước (phép chia), rồi nhân với giá mỗi chai.', 'Find the number of bottles first (divide), then multiply by the price of each.'));
  }

  // ================= 4. Diện tích hình tam giác (Bài 25) =================
  const tri = (a, h, unit) => vz('shape', { kind: 'triangle', dims: { a, h, unit }, showDims: true, showHeight: true });
  const TRI_THINGS = [['Một tấm bìa', 'tấm bìa', 'A card', 'card', 'cm'], ['Một mảnh đất', 'mảnh đất', 'A plot of land', 'plot', 'm'], ['Một lá cờ', 'lá cờ', 'A flag', 'flag', 'dm'], ['Một cánh buồm', 'cánh buồm', 'A sail', 'sail', 'm']];
  function tgBasic(rng, decimal) {
    const [A1, a1, E1, e1, u] = P(rng, TRI_THINGS), a = decimal ? dec(nz(rng, 25, 125), 1) : R(rng, 6, 30), h = decimal ? R(rng, 3, 12) : R(rng, 4, 20), prod = rd(a * h, 1), area = rd(prod / 2, 2);
    return G(L(`${A1} hình tam giác có độ dài đáy ${F(a)} ${u}, chiều cao ${F(h)} ${u}. Tính diện tích ${a1}.`, `${E1} is a triangle with a base of ${F(a)} ${u} and a height of ${F(h)} ${u}. Find the area of the ${e1}.`),
      [
        S(L('Diện tích hình tam giác tính thế nào?', 'How do you find the area of a triangle?'), ch(rng, L('Đáy × chiều cao : 2', 'Base × height : 2'), [L('Đáy × chiều cao', 'Base × height'), L('(Đáy + chiều cao) × 2', '(Base + height) × 2')]), 'S = a × h : 2.'),
        S(L(`Lấy độ dài đáy nhân với chiều cao: ${F(a)} × ${F(h)} = ?`, `Base times height: ${F(a)} × ${F(h)} = ?`), num(prod), `${F(a)} × ${F(h)} = ${F(prod)}.`),
        S(L(`Chia cho 2: ${F(prod)} : 2 = ?`, `Divide by 2: ${F(prod)} : 2 = ?`), num(area, u + '²'), L(`Diện tích ${a1}: ${F(a)} × ${F(h)} : 2 = ${F(area)} (${u}²).`, `Area of the ${e1}: ${F(a)} × ${F(h)} : 2 = ${F(area)} (${u}²).`)),
      ],
      DS(`${F(area)} ${u}²`), tri(a, h, u));
  }
  function tgUnits(rng) {
    const a = R(rng, 2, 9), h = R(rng, 6, 25), a2 = a * 10, prod = a2 * h, area = prod / 2;
    return G(L(`Một tấm biển hình tam giác có độ dài đáy ${a} m, chiều cao ${h} dm. Tính diện tích tấm biển theo đề-xi-mét vuông.`, `A triangular sign has a base of ${a} m and a height of ${h} dm. Find its area in square decimetres.`),
      [
        S(L('Đáy đo bằng mét, chiều cao đo bằng đề-xi-mét. Trước hết ta làm gì?', 'The base is in metres and the height is in decimetres. What do you do first?'), ch(rng, L('Đổi về cùng một đơn vị đo', 'Change them to the same unit'), [L(`Nhân luôn ${a} với ${h}`, `Multiply ${a} by ${h} straight away`), L(`Cộng ${a} với ${h}`, `Add ${a} and ${h}`)]), L('Đáy và chiều cao phải cùng đơn vị đo.', 'The base and the height must be in the same unit.')),
        S(`${a} m = ? dm`, num(a2, 'dm'), `${a} m = ${a2} dm.`),
        S(L(`Đáy × chiều cao: ${a2} × ${h} = ?`, `Base × height: ${a2} × ${h} = ?`), num(prod), `${a2} × ${h} = ${F(prod)}.`),
        S(L(`Chia cho 2: ${F(prod)} : 2 = ?`, `Divide by 2: ${F(prod)} : 2 = ?`), num(area, 'dm²'), L(`Diện tích tấm biển: ${a2} × ${h} : 2 = ${F(area)} (dm²).`, `Area of the sign: ${a2} × ${h} : 2 = ${F(area)} (dm²).`)),
      ],
      DS(`${F(area)} dm²`), tri(a2, h, 'dm'));
  }
  const TG_HINT = L('S = a × h : 2 (đáy và chiều cao cùng đơn vị đo).', 'S = a × h : 2 (base and height in the same unit).');
  function tgPlain(rng, i) {
    if (i < 2) return toQ(tgBasic(rng, i === 1), TG_HINT);
    if (i === 3) return toQ(tgUnits(rng), TG_HINT);
    const a = R(rng, 4, 20), b = R(rng, 3, 15), area = rd(a * b / 2, 1);
    return Q(L(`Một hình tam giác vuông có hai cạnh góc vuông dài ${a} cm và ${b} cm. Tính diện tích hình tam giác đó.`, `A right-angled triangle has two perpendicular sides of ${a} cm and ${b} cm. Find its area.`), num(area, 'cm²'),
      L(`Trong tam giác vuông, cạnh góc vuông này là đáy thì cạnh góc vuông kia là chiều cao.\nDiện tích: ${a} × ${b} : 2 = ${F(area)} (cm²).`, `In a right-angled triangle, if one perpendicular side is the base, the other is the height.\nArea: ${a} × ${b} : 2 = ${F(area)} (cm²).`),
      { hint: L('Hai cạnh góc vuông là đáy và chiều cao.', 'The two perpendicular sides are the base and the height.'), visual: vz('shape', { kind: 'rtriangle', dims: { a, b }, showDims: true }) });
  }
  function tgVary(rng, i) {
    const a = R(rng, 5, 24), h = R(rng, 2, 9) * 2, area = a * h / 2;
    if (i === 4) return lines(L(`Một hình tam giác có diện tích ${area} cm², độ dài đáy ${a} cm. Tính chiều cao của hình tam giác đó.`, `A triangle has an area of ${area} cm² and a base of ${a} cm. Find its height.`),
      [[area * 2, '', L(`Hai lần diện tích: ${area} × 2 = ${area * 2} (cm²).`, `Twice the area: ${area} × 2 = ${area * 2} (cm²).`)], [h, 'cm', L(`Chiều cao: ${area * 2} : ${a} = ${h} (cm).`, `Height: ${area * 2} : ${a} = ${h} (cm).`)]], L('h = S × 2 : a.', 'h = S × 2 : a.'), tri(a, '?', 'cm'));
    if (i === 5) return lines(L(`Một hình tam giác có diện tích ${area} m², chiều cao ${h} m. Tính độ dài đáy của hình tam giác đó.`, `A triangle has an area of ${area} m² and a height of ${h} m. Find the length of its base.`),
      [[area * 2, '', L(`Hai lần diện tích: ${area} × 2 = ${area * 2} (m²).`, `Twice the area: ${area} × 2 = ${area * 2} (m²).`)], [a, 'm', L(`Độ dài đáy: ${area * 2} : ${h} = ${a} (m).`, `Base: ${area * 2} : ${h} = ${a} (m).`)]], L('a = S × 2 : h.', 'a = S × 2 : h.'));
    const k = P(rng, [2, 3, 4, 5]);
    return lines(L(`Một mảnh đất hình tam giác có độ dài đáy ${a} m, chiều cao ${h} m. Trên mảnh đất đó, cứ mỗi mét vuông người ta thu hoạch được ${k} kg rau. Hỏi cả mảnh đất thu hoạch được bao nhiêu ki-lô-gam rau?`, `A triangular plot of land has a base of ${a} m and a height of ${h} m. Each square metre gives ${k} kg of vegetables. How many kilograms of vegetables does the whole plot give?`),
      [[area, 'm²', L(`Diện tích mảnh đất: ${a} × ${h} : 2 = ${area} (m²).`, `Area of the plot: ${a} × ${h} : 2 = ${area} (m²).`)], [area * k, 'kg', L(`Số rau thu hoạch được: ${k} × ${area} = ${F(area * k)} (kg).`, `Vegetables: ${k} × ${area} = ${F(area * k)} (kg).`)]], TG_HINT, tri(a, h, 'm'));
  }
  function tgHard(rng) {
    const [m, n] = P(rng, [[2, 3], [3, 4], [3, 5], [4, 5], [1, 2], [5, 6]]), q = R(rng, 2, 7) * 2, a = n * q, h = m * q, area = a * h / 2;
    return lines(L(`Một mảnh vườn hình tam giác có độ dài đáy ${a} m, chiều cao bằng ${m}/${n} độ dài đáy. Tính diện tích mảnh vườn.`, `A triangular garden has a base of ${a} m. Its height is ${m}/${n} of its base. Find the area of the garden.`),
      [[h, 'm', L(`Chiều cao: ${a} × ${m}/${n} = ${h} (m).`, `Height: ${a} × ${m}/${n} = ${h} (m).`)], [area, 'm²', L(`Diện tích mảnh vườn: ${a} × ${h} : 2 = ${F(area)} (m²).`, `Area of the garden: ${a} × ${h} : 2 = ${F(area)} (m²).`)]],
      L('Tìm chiều cao trước.', 'Find the height first.'));
  }

  // ================= 5. Diện tích hình thang (Bài 26) =================
  const trap = (a, b, h, unit) => vz('shape', { kind: 'trapezoid', dims: { a, b, h, unit }, showDims: true, showHeight: true });
  const HT_THINGS = [['Một thửa ruộng', 'thửa ruộng', 'A field', 'field', 'm'], ['Một tấm bìa', 'tấm bìa', 'A card', 'card', 'cm'], ['Một mảnh vườn', 'mảnh vườn', 'A garden', 'garden', 'm'], ['Một tấm gỗ', 'tấm gỗ', 'A board', 'board', 'dm']];
  // short: the smaller base is given as "d shorter than the bigger base"
  function htForm(rng, decimal, short) {
    const [A1, a1, E1, e1, u] = P(rng, HT_THINGS), b = decimal ? dec(nz(rng, 25, 85), 1) : R(rng, 5, 30), d = decimal ? dec(R(rng, 2, 9) * 5, 1) : R(rng, 2, 15), a = rd(b + d, 1), h = R(rng, 2, 10) * (decimal ? 1 : 2);
    const sum = rd(a + b, 1), prod = rd(sum * h, 1), area = rd(prod / 2, 2);
    const steps = [
      S(L('Diện tích hình thang tính thế nào?', 'How do you find the area of a trapezium?'), ch(rng, L('(Đáy lớn + đáy bé) × chiều cao : 2', '(Long base + short base) × height : 2'), [L('(Đáy lớn + đáy bé) × chiều cao', '(Long base + short base) × height'), L('Đáy lớn × đáy bé × chiều cao : 2', 'Long base × short base × height : 2')]), 'S = (a + b) × h : 2.'),
      S(L(`Tổng độ dài hai đáy: ${F(a)} + ${F(b)} = ?`, `Sum of the two bases: ${F(a)} + ${F(b)} = ?`), num(sum, u), L(`Tổng độ dài hai đáy: ${F(a)} + ${F(b)} = ${F(sum)} (${u}).`, `Sum of the two bases: ${F(a)} + ${F(b)} = ${F(sum)} (${u}).`)),
      S(L(`Nhân với chiều cao: ${F(sum)} × ${h} = ?`, `Multiply by the height: ${F(sum)} × ${h} = ?`), num(prod), `${F(sum)} × ${h} = ${F(prod)}.`),
      S(L(`Chia cho 2: ${F(prod)} : 2 = ?`, `Divide by 2: ${F(prod)} : 2 = ?`), num(area, u + '²'), L(`Diện tích ${a1}: (${F(a)} + ${F(b)}) × ${h} : 2 = ${F(area)} (${u}²).`, `Area of the ${e1}: (${F(a)} + ${F(b)}) × ${h} : 2 = ${F(area)} (${u}²).`)),
    ];
    if (short) steps.splice(0, 1, S(L('Mới biết đáy lớn và chiều cao. Trước hết phải tìm gì?', 'You only know the long base and the height. What must you find first?'), ch(rng, L('Đáy bé', 'The short base'), [L('Chu vi hình thang', 'The perimeter of the trapezium'), L('Nửa chiều cao', 'Half the height')]),
      L('Công thức S = (a + b) × h : 2 cần cả hai đáy, nên phải tìm đáy bé trước.', 'The formula S = (a + b) × h : 2 needs both bases, so find the short base first.')), S(L(`Đáy bé kém đáy lớn ${F(d)} ${u}. Đáy bé dài bao nhiêu?`, `The short base is ${F(d)} ${u} shorter than the long base. How long is the short base?`), num(b, u), L(`Đáy bé: ${F(a)} ${M} ${F(d)} = ${F(b)} (${u}).`, `Short base: ${F(a)} ${M} ${F(d)} = ${F(b)} (${u}).`)));
    return G(short ? L(`${A1} hình thang có đáy lớn ${F(a)} ${u}, đáy bé kém đáy lớn ${F(d)} ${u}, chiều cao ${h} ${u}. Tính diện tích ${a1}.`, `${E1} is a trapezium. Its long base is ${F(a)} ${u}, its short base is ${F(d)} ${u} shorter, and its height is ${h} ${u}. Find the area of the ${e1}.`)
      : L(`${A1} hình thang có độ dài hai đáy là ${F(a)} ${u} và ${F(b)} ${u}, chiều cao ${h} ${u}. Tính diện tích ${a1}.`, `${E1} is a trapezium with bases of ${F(a)} ${u} and ${F(b)} ${u} and a height of ${h} ${u}. Find the area of the ${e1}.`),
    steps, DS(`${F(area)} ${u}²`), trap(a, short ? '?' : b, h, u));
  }
  const HT_HINT = L('S = (a + b) × h : 2: tổng hai đáy nhân với chiều cao rồi chia cho 2.', 'S = (a + b) × h : 2: the sum of the bases times the height, divided by 2.');
  function htPlain(rng, i) {
    if (i < 3) return toQ(htForm(rng, i === 1, false), HT_HINT);
    const a = R(rng, 2, 6), b = R(rng, 8, 18), h = R(rng, 2, 8) * 2, a2 = a * 10, area = (a2 + b) * h / 2;
    return lines(L(`Một tấm tôn hình thang có đáy lớn ${a} m, đáy bé ${b} dm, chiều cao ${h} dm. Tính diện tích tấm tôn theo đề-xi-mét vuông.`, `A sheet of metal is a trapezium with a long base of ${a} m, a short base of ${b} dm and a height of ${h} dm. Find its area in square decimetres.`),
      [[a2, 'dm', L(`Đổi: ${a} m = ${a2} dm.`, `Change: ${a} m = ${a2} dm.`)], [area, 'dm²', L(`Diện tích tấm tôn: (${a2} + ${b}) × ${h} : 2 = ${F(area)} (dm²).`, `Area of the sheet: (${a2} + ${b}) × ${h} : 2 = ${F(area)} (dm²).`)]],
      L('Đổi các số đo về cùng đơn vị trước.', 'Change the measurements to the same unit first.'), trap(a2, b, h, 'dm'));
  }
  function htVary(rng, i) {
    if (i === 5) return toQ(htForm(rng, false, true), HT_HINT);
    const b = R(rng, 4, 20), a = b + R(rng, 1, 6) * 2, h = i === 6 ? (a + b) / 2 : R(rng, 3, 12), area = (a + b) * h / 2;
    if (i === 4) return lines(L(`Một hình thang có diện tích ${F(area)} cm², độ dài hai đáy là ${a} cm và ${b} cm. Tính chiều cao của hình thang đó.`, `A trapezium has an area of ${F(area)} cm² and bases of ${a} cm and ${b} cm. Find its height.`),
      [[area * 2, '', L(`Hai lần diện tích: ${F(area)} × 2 = ${F(area * 2)} (cm²).`, `Twice the area: ${F(area)} × 2 = ${F(area * 2)} (cm²).`)], [a + b, '', L(`Tổng độ dài hai đáy: ${a} + ${b} = ${a + b} (cm).`, `Sum of the bases: ${a} + ${b} = ${a + b} (cm).`)], [h, 'cm', L(`Chiều cao: ${F(area * 2)} : ${a + b} = ${h} (cm).`, `Height: ${F(area * 2)} : ${a + b} = ${h} (cm).`)]],
      L('h = S × 2 : (a + b).', 'h = S × 2 : (a + b).'), trap(a, b, '?', 'cm'));
    return lines(L(`Một mảnh đất hình thang có độ dài hai đáy là ${a} m và ${b} m, chiều cao bằng trung bình cộng của hai đáy. Tính diện tích mảnh đất.`, `A plot of land is a trapezium with bases of ${a} m and ${b} m. Its height is the average of the two bases. Find the area of the plot.`),
      [[h, 'm', L(`Chiều cao: (${a} + ${b}) : 2 = ${h} (m).`, `Height: (${a} + ${b}) : 2 = ${h} (m).`)], [area, 'm²', L(`Diện tích mảnh đất: (${a} + ${b}) × ${h} : 2 = ${F(area)} (m²).`, `Area of the plot: (${a} + ${b}) × ${h} : 2 = ${F(area)} (m²).`)]],
      L('Tìm chiều cao trước: trung bình cộng của hai đáy.', 'Find the height first: the average of the two bases.'));
  }
  function htHard(rng) {
    const b = R(rng, 3, 9) * 10, a = b + R(rng, 1, 4) * 10, h = R(rng, 2, 6) * 10, area = (a + b) * h / 2, k = P(rng, [55, 60, 65, 70]), kg = area / 100 * k;
    return lines(L(`Một thửa ruộng hình thang có độ dài hai đáy là ${a} m và ${b} m, chiều cao ${h} m. Trung bình cứ 100 m² thu hoạch được ${k} kg thóc. Hỏi cả thửa ruộng thu hoạch được bao nhiêu ki-lô-gam thóc?`, `A field is a trapezium with bases of ${a} m and ${b} m and a height of ${h} m. On average, every 100 m² gives ${k} kg of rice. How many kilograms of rice does the whole field give?`),
      [[area, 'm²', L(`Diện tích thửa ruộng: (${a} + ${b}) × ${h} : 2 = ${F(area)} (m²).`, `Area of the field: (${a} + ${b}) × ${h} : 2 = ${F(area)} (m²).`)], [area / 100, '', L(`${F(area)} m² gấp 100 m² số lần: ${F(area)} : 100 = ${F(area / 100)} (lần).`, `${F(area)} m² is ${F(area)} : 100 = ${F(area / 100)} times 100 m².`)],
        [kg, 'kg', L(`Số thóc thu hoạch được: ${k} × ${F(area / 100)} = ${F(kg)} (kg).`, `Rice: ${k} × ${F(area / 100)} = ${F(kg)} (kg).`)]],
      L('Tính diện tích, xem diện tích gấp 100 m² bao nhiêu lần, rồi nhân.', 'Find the area, see how many times 100 m² it is, then multiply.'));
  }

  // ================= 6. Chu vi và diện tích hình tròn (Bài 27) =================
  // the picture carries the problem's own unit and shows what the problem gives: the diameter when it gives d (finding r is a step)
  const circ = (r, unit, byD) => vz('shape', { kind: 'circle', dims: byD ? { d: r * 2, unit } : { r, unit }, showDims: true });
  const HT3 = [['Một mặt bàn', 'mặt bàn', 'A table top', 'table top', 'dm'], ['Một bồn hoa', 'bồn hoa', 'A flower bed', 'flower bed', 'm'], ['Một cái đĩa', 'cái đĩa', 'A plate', 'plate', 'cm'], ['Một miệng giếng', 'miệng giếng', 'The mouth of a well', 'mouth of the well', 'dm']];
  // a radius whose square times 3,14 has at most 3 decimal places: a whole number or a half
  const radius = (rng, half) => (half && R(rng, 0, 2) === 0 ? R(rng, 1, 7) + 0.5 : R(rng, 2, 12));
  function trArea(rng) {
    const [A1, a1, E1, e1, u] = P(rng, HT3), r = radius(rng, true), d = r * 2, r2 = rd(r * r, 2), area = rd(r2 * 3.14, 3);
    return G(L(`${A1} hình tròn có đường kính ${F(d)} ${u}. Tính diện tích ${a1}.`, `${E1} is a circle with a diameter of ${F(d)} ${u}. Find the area of the ${e1}.`),
      [
        S(L('Công thức tính diện tích hình tròn dùng độ dài nào?', 'Which length does the formula for the area of a circle use?'), ch(rng, L('Bán kính', 'The radius'), [L('Đường kính', 'The diameter'), L('Chu vi', 'The circumference')]), L('S = r × r × 3,14. Đề cho đường kính nên phải tìm bán kính trước.', 'S = r × r × 3,14. The problem gives the diameter, so find the radius first.')),
        S(L(`Bán kính: ${F(d)} : 2 = ?`, `Radius: ${F(d)} : 2 = ?`), num(r, u), L(`Bán kính ${a1}: ${F(d)} : 2 = ${F(r)} (${u}).`, `Radius of the ${e1}: ${F(d)} : 2 = ${F(r)} (${u}).`)),
        S(`${F(r)} × ${F(r)} = ?`, num(r2), `${F(r)} × ${F(r)} = ${F(r2)}.`),
        S(L(`Nhân với 3,14: ${F(r2)} × 3,14 = ?`, `Multiply by 3,14: ${F(r2)} × 3,14 = ?`), num(area, u + '²'), L(`Diện tích ${a1}: ${F(r)} × ${F(r)} × 3,14 = ${F(area)} (${u}²).`, `Area of the ${e1}: ${F(r)} × ${F(r)} × 3,14 = ${F(area)} (${u}²).`)),
      ],
      DS(`${F(area)} ${u}²`), circ(r, u, true));
  }
  function trCirc(rng) {
    const r = radius(rng, true), d = r * 2, c = rd(d * 3.14, 2), [vi, en, a1, e1, u] = P(rng, [['Một bánh xe', 'A wheel', 'bánh xe', 'wheel', 'dm'], ['Một cái ao', 'A pond', 'cái ao', 'pond', 'm'], ['Một chiếc vòng', 'A hoop', 'chiếc vòng', 'hoop', 'cm']]);
    return G(L(`${vi} hình tròn có bán kính ${F(r)} ${u}. Tính chu vi ${a1}.`, `${en} is a circle with a radius of ${F(r)} ${u}. Find the circumference of the ${e1}.`),
      [
        S(L('Chu vi hình tròn tính theo bán kính thế nào?', 'How do you find the circumference of a circle from its radius?'), ch(rng, 'r × 2 × 3,14', ['r × r × 3,14', 'r × 3,14']), L('C = d × 3,14 = r × 2 × 3,14.', 'C = d × 3,14 = r × 2 × 3,14.')),
        S(L(`Đường kính: ${F(r)} × 2 = ?`, `Diameter: ${F(r)} × 2 = ?`), num(d, u), L(`Đường kính ${a1}: ${F(r)} × 2 = ${F(d)} (${u}).`, `Diameter of the ${e1}: ${F(r)} × 2 = ${F(d)} (${u}).`)),
        S(L(`Chu vi: ${F(d)} × 3,14 = ?`, `Circumference: ${F(d)} × 3,14 = ?`), num(c, u), L(`Chu vi ${a1}: ${F(d)} × 3,14 = ${F(c)} (${u}).`, `Circumference of the ${e1}: ${F(d)} × 3,14 = ${F(c)} (${u}).`)),
      ],
      DS(`${F(c)} ${u}`), circ(r, u));
  }
  const TR_HINT = L('C = d × 3,14 = r × 2 × 3,14; S = r × r × 3,14.', 'C = d × 3,14 = r × 2 × 3,14; S = r × r × 3,14.');
  function trPlain(rng, i) {
    if (i === 1) return toQ(trCirc(rng), TR_HINT);
    if (i === 3) return toQ(trArea(rng), TR_HINT);
    const [A1, a1, E1, e1, u] = P(rng, HT3), r = radius(rng, i === 2), d = r * 2;
    if (i === 0) return Q(L(`${A1} hình tròn có đường kính ${F(d)} ${u}. Tính chu vi ${a1}.`, `${E1} is a circle with a diameter of ${F(d)} ${u}. Find the circumference of the ${e1}.`), num(rd(d * 3.14, 2), u), L(`Chu vi ${a1}: ${F(d)} × 3,14 = ${F(rd(d * 3.14, 2))} (${u}).`, `Circumference of the ${e1}: ${F(d)} × 3,14 = ${F(rd(d * 3.14, 2))} (${u}).`), { hint: TR_HINT, visual: circ(r, u, true) });
    return Q(L(`${A1} hình tròn có bán kính ${F(r)} ${u}. Tính diện tích ${a1}.`, `${E1} is a circle with a radius of ${F(r)} ${u}. Find the area of the ${e1}.`), num(rd(r * r * 3.14, 3), u + '²'), L(`Diện tích ${a1}: ${F(r)} × ${F(r)} × 3,14 = ${F(rd(r * r * 3.14, 3))} (${u}²).`, `Area of the ${e1}: ${F(r)} × ${F(r)} × 3,14 = ${F(rd(r * r * 3.14, 3))} (${u}²).`), { hint: TR_HINT, visual: circ(r, u) });
  }
  function trVary(rng, i) {
    if (i === 4) {
      const d = R(rng, 4, 8), n = P(rng, [10, 20, 50, 100]), c = rd(d * 3.14, 2), dist = rd(c * n, 2);
      return lines(L(`Bánh xe của một chiếc xe đạp có đường kính ${d} dm. Hỏi khi bánh xe lăn trên mặt đất được ${n} vòng thì xe đi được bao nhiêu đề-xi-mét?`, `A bicycle wheel has a diameter of ${d} dm. How many decimetres does the bicycle travel when the wheel turns ${n} times on the ground?`),
        [[c, 'dm', L(`Chu vi bánh xe (quãng đường khi lăn 1 vòng): ${d} × 3,14 = ${F(c)} (dm).`, `Circumference of the wheel (the distance for 1 turn): ${d} × 3,14 = ${F(c)} (dm).`)], [dist, 'dm', L(`Quãng đường xe đi được: ${F(c)} × ${n} = ${F(dist)} (dm).`, `Distance travelled: ${F(c)} × ${n} = ${F(dist)} (dm).`)]],
        L('Bánh xe lăn 1 vòng thì xe đi được quãng đường bằng chu vi bánh xe.', 'When the wheel turns once, the bicycle travels one circumference.'));
    }
    if (i === 5) {
      const d = R(rng, 2, 20), c = rd(d * 3.14, 2);
      return Q(L(`Một hình tròn có chu vi ${F(c)} cm. Tính đường kính của hình tròn đó.`, `A circle has a circumference of ${F(c)} cm. Find its diameter.`), num(d, 'cm'), L(`C = d × 3,14 nên d = C : 3,14.\nĐường kính: ${F(c)} : 3,14 = ${d} (cm).`, `C = d × 3,14, so d = C : 3,14.\nDiameter: ${F(c)} : 3,14 = ${d} (cm).`), { hint: 'd = C : 3,14.' });
    }
    const r = R(rng, 2, 8), d = r * 2, sq = d * d, ci = rd(r * r * 3.14, 2);
    return lines(L(`Một mặt bàn hình tròn có đường kính ${d} dm. Người ta trải lên bàn một tấm khăn hình vuông cạnh ${d} dm. Hỏi diện tích tấm khăn lớn hơn diện tích mặt bàn bao nhiêu đề-xi-mét vuông?`, `A round table top has a diameter of ${d} dm. A square cloth with sides of ${d} dm is laid on it. How many square decimetres bigger is the cloth than the table top?`),
      [[sq, '', L(`Diện tích tấm khăn: ${d} × ${d} = ${sq} (dm²).`, `Area of the cloth: ${d} × ${d} = ${sq} (dm²).`)], [ci, '', L(`Bán kính mặt bàn: ${d} : 2 = ${r} (dm). Diện tích mặt bàn: ${r} × ${r} × 3,14 = ${F(ci)} (dm²).`, `Radius of the table top: ${d} : 2 = ${r} (dm). Area of the table top: ${r} × ${r} × 3,14 = ${F(ci)} (dm²).`)],
        [rd(sq - ci, 2), 'dm²', L(`Diện tích tấm khăn lớn hơn: ${sq} ${M} ${F(ci)} = ${F(rd(sq - ci, 2))} (dm²).`, `Difference: ${sq} ${M} ${F(ci)} = ${F(rd(sq - ci, 2))} (dm²).`)]],
      L('Tính diện tích hình vuông và diện tích hình tròn rồi trừ.', 'Find the area of the square and the area of the circle, then subtract.'));
  }
  function trHard(rng) {
    const r = R(rng, 2, 10), d = r * 2, c = rd(d * 3.14, 2), area = rd(r * r * 3.14, 2);
    return lines(L(`Một bồn hoa hình tròn có chu vi ${F(c)} m. Tính diện tích bồn hoa đó.`, `A round flower bed has a circumference of ${F(c)} m. Find the area of the flower bed.`),
      [[d, 'm', L(`Đường kính bồn hoa: ${F(c)} : 3,14 = ${d} (m).`, `Diameter of the flower bed: ${F(c)} : 3,14 = ${d} (m).`)], [r, 'm', L(`Bán kính bồn hoa: ${d} : 2 = ${r} (m).`, `Radius of the flower bed: ${d} : 2 = ${r} (m).`)],
        [area, 'm²', L(`Diện tích bồn hoa: ${r} × ${r} × 3,14 = ${F(area)} (m²).`, `Area of the flower bed: ${r} × ${r} × 3,14 = ${F(area)} (m²).`)]],
      L('Từ chu vi tìm đường kính, rồi bán kính, rồi diện tích.', 'From the circumference find the diameter, then the radius, then the area.'));
  }

  // ================= 7. Bài toán về tỉ lệ bản đồ (Bài 37) =================
  const map = (scale, mapCm) => vz('mapScale', { scale, mapCm });
  // km: the answer in kilometres (a small-scale map) instead of metres
  function bdReal(rng, km, half) {
    const sc = km ? P(rng, [100000, 200000, 500000, 1000000]) : P(rng, [500, 1000, 2000, 5000, 10000]), cm = half ? R(rng, 1, 7) + 0.5 : R(rng, 2, 12), real = rd(cm * sc, 0), val = km ? real / 100000 : real / 100, u = km ? 'km' : 'm';
    const [vi, en] = P(rng, km ? [['khoảng cách giữa hai làng', 'the distance between two villages'], ['quãng đường giữa hai thành phố', 'the road between two cities'], ['chiều dài một con sông', 'the length of a river']] : [['quãng đường từ nhà đến trường', 'the road from home to school'], ['chiều dài một cây cầu', 'the length of a bridge'], ['chiều dài sân trường', 'the length of a school playground']]);
    return G(L(`Trên bản đồ tỉ lệ 1 : ${F(sc)}, ${vi} đo được ${F(cm)} cm. Hỏi độ dài thật là bao nhiêu ${km ? 'ki-lô-mét' : 'mét'}?`, `On a map with a scale of 1 : ${F(sc)}, ${en} measures ${F(cm)} cm. What is the real length in ${km ? 'kilometres' : 'metres'}?`),
      [
        S(L(`Tỉ lệ 1 : ${F(sc)} cho biết 1 cm trên bản đồ ứng với độ dài thật là bao nhiêu?`, `With a scale of 1 : ${F(sc)}, what real length does 1 cm on the map stand for?`), ch(rng, `${F(sc)} cm`, [`${F(sc)} m`, '1 cm', `${F(sc)} km`]), L(`1 cm trên bản đồ ứng với ${F(sc)} cm trên thực tế.`, `1 cm on the map stands for ${F(sc)} cm in real life.`)),
        S(L(`Độ dài thật (theo xăng-ti-mét): ${F(cm)} × ${F(sc)} = ?`, `Real length (in centimetres): ${F(cm)} × ${F(sc)} = ?`), num(real, 'cm'), L(`Độ dài thật: ${F(cm)} × ${F(sc)} = ${F(real)} (cm).`, `Real length: ${F(cm)} × ${F(sc)} = ${F(real)} (cm).`)),
        S(L(`Đổi: ${F(real)} cm = ? ${u}`, `Change: ${F(real)} cm = ? ${u}`), num(val, u), L(`${F(real)} cm = ${F(val)} ${u}.`, `${F(real)} cm = ${F(val)} ${u}.`), km ? L('100 000 cm = 1 km.', '100 000 cm = 1 km.') : L('100 cm = 1 m.', '100 cm = 1 m.')),
      ],
      DS(`${F(val)} ${u}`), map(sc, cm));
  }
  function bdMap(rng, km) {
    const sc = km ? P(rng, [100000, 200000, 500000, 1000000]) : P(rng, [500, 1000, 2000, 5000]), cm = R(rng, 2, 12), realCm = cm * sc, val = km ? realCm / 100000 : realCm / 100, u = km ? 'km' : 'm';
    const [vi, en] = P(rng, [['Quãng đường từ nhà bạn An đến trường', "The road from An's home to school"], ['Một con kênh', 'A canal'], ['Một sân vận động', 'A stadium'], ['Quãng đường giữa hai bến xe', 'The road between two bus stations']].slice(0, km ? 2 : 4));
    return G(L(`${vi} dài ${F(val)} ${u}. Hỏi trên bản đồ tỉ lệ 1 : ${F(sc)}, độ dài đó là bao nhiêu xăng-ti-mét?`, `${en} is ${F(val)} ${u} long. How many centimetres long is it on a map with a scale of 1 : ${F(sc)}?`),
      [
        S(L('Độ dài trên bản đồ tính bằng xăng-ti-mét. Trước hết ta làm gì?', 'Lengths on the map are in centimetres. What do you do first?'), ch(rng, L(`Đổi ${F(val)} ${u} ra xăng-ti-mét`, `Change ${F(val)} ${u} to centimetres`), [L(`Lấy ${F(val)} × ${F(sc)}`, `Work out ${F(val)} × ${F(sc)}`), L(`Lấy ${F(sc)} : ${F(val)}`, `Work out ${F(sc)} : ${F(val)}`)]), L('Đổi độ dài thật ra xăng-ti-mét, rồi chia cho mẫu số của tỉ lệ bản đồ.', 'Change the real length to centimetres, then divide by the scale number.')),
        S(L(`Đổi: ${F(val)} ${u} = ? cm`, `Change: ${F(val)} ${u} = ? cm`), num(realCm, 'cm'), `${F(val)} ${u} = ${F(realCm)} cm.`, km ? L('1 km = 100 000 cm.', '1 km = 100 000 cm.') : L('1 m = 100 cm.', '1 m = 100 cm.')),
        S(L(`Độ dài trên bản đồ: ${F(realCm)} : ${F(sc)} = ?`, `Length on the map: ${F(realCm)} : ${F(sc)} = ?`), num(cm, 'cm'), L(`Độ dài trên bản đồ: ${F(realCm)} : ${F(sc)} = ${cm} (cm).`, `Length on the map: ${F(realCm)} : ${F(sc)} = ${cm} (cm).`)),
      ],
      DS(`${cm} cm`), map(sc, cm));
  }
  const BD_HINT = L('Độ dài thật = độ dài trên bản đồ × mẫu số tỉ lệ; độ dài trên bản đồ = độ dài thật (cm) : mẫu số tỉ lệ.', 'Real length = length on the map × the scale number; length on the map = real length (cm) : the scale number.');
  function bdPlain(rng, i) {
    if (i === 2) { const sc = P(rng, [100, 200, 500, 1000, 2000, 5000, 10000]); return Q(L(`Trên bản đồ tỉ lệ 1 : ${F(sc)}, độ dài 1 cm ứng với độ dài thật là bao nhiêu mét?`, `On a map with a scale of 1 : ${F(sc)}, how many metres in real life does 1 cm stand for?`), num(sc / 100, 'm'), L(`1 cm trên bản đồ ứng với ${F(sc)} cm trên thực tế. ${F(sc)} cm = ${F(sc / 100)} m.`, `1 cm on the map stands for ${F(sc)} cm in real life. ${F(sc)} cm = ${F(sc / 100)} m.`), { hint: BD_HINT, visual: map(sc, 1) }); }
    return toQ(bdReal(rng, i === 1, i === 3), BD_HINT);
  }
  function bdVary(rng, i) {
    if (i < 6) return toQ(bdMap(rng, i === 5), BD_HINT);
    const sc = P(rng, [500, 1000, 2000, 5000, 10000]), cm = R(rng, 2, 9), real = cm * sc / 100;
    return lines(L(`Một đoạn đường dài ${F(real)} m. Trên bản đồ, đoạn đường đó dài ${cm} cm. Hỏi bản đồ được vẽ theo tỉ lệ 1 : bao nhiêu?`, `A road is ${F(real)} m long. On a map it is ${cm} cm long. The scale of the map is 1 : what number?`),
      [[cm * sc, '', L(`Đổi: ${F(real)} m = ${F(cm * sc)} cm.`, `Change: ${F(real)} m = ${F(cm * sc)} cm.`)], [sc, '', L(`Độ dài thật gấp độ dài trên bản đồ: ${F(cm * sc)} : ${cm} = ${F(sc)} (lần). Tỉ lệ bản đồ là 1 : ${F(sc)}.`, `The real length is ${F(cm * sc)} : ${cm} = ${F(sc)} times the length on the map. The scale is 1 : ${F(sc)}.`)]],
      L('Đổi về cùng đơn vị xăng-ti-mét rồi chia độ dài thật cho độ dài trên bản đồ.', 'Change both to centimetres, then divide the real length by the length on the map.'));
  }
  function bdHard(rng) {
    const sc = P(rng, [500, 1000, 2000]), a = R(rng, 4, 9), b = R(rng, 2, a - 1), A = a * sc / 100, B = b * sc / 100;
    return lines(L(`Trên bản đồ tỉ lệ 1 : ${F(sc)}, một mảnh đất hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính chu vi thật của mảnh đất đó theo mét.`, `On a map with a scale of 1 : ${F(sc)}, a rectangular plot of land is ${a} cm long and ${b} cm wide. Find the real perimeter of the plot in metres.`),
      [[A, 'm', L(`Chiều dài thật: ${a} × ${F(sc)} = ${F(a * sc)} (cm) = ${F(A)} m.`, `Real length: ${a} × ${F(sc)} = ${F(a * sc)} (cm) = ${F(A)} m.`)], [B, 'm', L(`Chiều rộng thật: ${b} × ${F(sc)} = ${F(b * sc)} (cm) = ${F(B)} m.`, `Real width: ${b} × ${F(sc)} = ${F(b * sc)} (cm) = ${F(B)} m.`)],
        [(A + B) * 2, 'm', L(`Chu vi thật: (${F(A)} + ${F(B)}) × 2 = ${F((A + B) * 2)} (m).`, `Real perimeter: (${F(A)} + ${F(B)}) × 2 = ${F((A + B) * 2)} (m).`)]],
      L('Tính chiều dài thật và chiều rộng thật trước, rồi tính chu vi.', 'Find the real length and the real width first, then the perimeter.'), map(sc, a));
  }

  // ================= 8–9. Tổng – tỉ (Bài 38) và hiệu – tỉ (Bài 39) =================
  // ratios m/n: for a sum mostly with m ≥ 2 (both products matter); for a difference with n − m ≥ 2 (a real division)
  const RS = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7], [3, 7], [5, 7], [1, 3], [1, 4]], RD = [[1, 3], [1, 4], [2, 5], [3, 5], [2, 7], [3, 7], [5, 7], [1, 5], [3, 8], [5, 9]];
  // mode 'S': the sum is given; mode 'D': the difference is given. Returns the context with its numbers.
  function tiCtx(rng, mode, k) {
    const sum = mode === 'S';
    let [m, n] = P(rng, sum ? RS : RD), u = R(rng, 3, 25), c;
    const T = () => (sum ? (m + n) * u : (n - m) * u);
    if (k === 5) { m = 1; n = R(rng, 2, 6); u = R(rng, 4, 40);
      c = { small: L('Số bé', 'The smaller number'), big: L('Số lớn', 'The bigger number'), ss: L('Số bé', 'Smaller'), bs: L('Số lớn', 'Bigger'), unit: '',
        giv: t => (sum ? L(`Tổng của hai số là ${F(t)}. Số lớn gấp ${n} lần số bé.`, `The sum of two numbers is ${F(t)}. The bigger number is ${n} times the smaller number.`) : L(`Hiệu của hai số là ${F(t)}. Số lớn gấp ${n} lần số bé.`, `The difference between two numbers is ${F(t)}. The bigger number is ${n} times the smaller number.`)),
        q: [L('Tìm hai số đó.', 'Find the two numbers.'), L('Tìm số lớn.', 'Find the bigger number.'), L('Tìm số bé.', 'Find the smaller number.')] };
    } else if (k === 4) { u = R(rng, 3, 15);
      c = { small: L('Chiều rộng', 'The width'), big: L('Chiều dài', 'The length'), ss: L('Rộng', 'Width'), bs: L('Dài', 'Length'), unit: 'm',
        giv: t => (sum ? L(`Một mảnh vườn hình chữ nhật có nửa chu vi là ${t} m. Chiều rộng bằng ${m}/${n} chiều dài.`, `Half the perimeter of a rectangular garden is ${t} m. The width is ${m}/${n} of the length.`) : L(`Một mảnh vườn hình chữ nhật có chiều dài hơn chiều rộng ${t} m. Chiều rộng bằng ${m}/${n} chiều dài.`, `A rectangular garden is ${t} m longer than it is wide. The width is ${m}/${n} of the length.`)),
        q: [L('Tính chiều dài và chiều rộng của mảnh vườn.', 'Find the length and the width of the garden.'), L('Tính chiều dài của mảnh vườn.', 'Find the length of the garden.'), L('Tính chiều rộng của mảnh vườn.', 'Find the width of the garden.')] };
    } else if (k === 3 && sum) { u = R(rng, 5, 25);
      c = { small: L('Số sách ngăn trên', 'The number of books on the top shelf'), big: L('Số sách ngăn dưới', 'The number of books on the bottom shelf'), ss: L('Ngăn trên', 'Top'), bs: L('Ngăn dưới', 'Bottom'), unit: L('quyển', 'books'),
        giv: t => L(`Hai ngăn sách có tất cả ${t} quyển sách. Số sách ở ngăn trên bằng ${m}/${n} số sách ở ngăn dưới.`, `Two shelves hold ${t} books altogether. The number of books on the top shelf is ${m}/${n} of the number on the bottom shelf.`),
        q: [L('Hỏi mỗi ngăn có bao nhiêu quyển sách?', 'How many books are there on each shelf?'), L('Hỏi ngăn dưới có bao nhiêu quyển sách?', 'How many books are there on the bottom shelf?'), L('Hỏi ngăn trên có bao nhiêu quyển sách?', 'How many books are there on the top shelf?')] };
    } else if (k === 3) { u = R(rng, 2, 12);
      c = { small: L('Độ dài sợi dây đỏ', 'The length of the red rope'), big: L('Độ dài sợi dây xanh', 'The length of the blue rope'), ss: L('Dây đỏ', 'Red'), bs: L('Dây xanh', 'Blue'), unit: 'm',
        giv: t => L(`Sợi dây xanh dài hơn sợi dây đỏ ${t} m. Sợi dây đỏ dài bằng ${m}/${n} sợi dây xanh.`, `A blue rope is ${t} m longer than a red rope. The red rope is ${m}/${n} as long as the blue rope.`),
        q: [L('Hỏi mỗi sợi dây dài bao nhiêu mét?', 'How many metres long is each rope?'), L('Hỏi sợi dây xanh dài bao nhiêu mét?', 'How many metres long is the blue rope?'), L('Hỏi sợi dây đỏ dài bao nhiêu mét?', 'How many metres long is the red rope?')] };
    } else if (k === 2 && sum) { u = R(rng, 10, 60);
      c = { small: L('Số vịt', 'The number of ducks'), big: L('Số gà', 'The number of chickens'), ss: L('Vịt', 'Ducks'), bs: L('Gà', 'Chickens'), unit: L('con', 'birds'),
        giv: t => L(`Một trang trại nuôi ${t} con gà và vịt. Số vịt bằng ${m}/${n} số gà.`, `A farm has ${t} chickens and ducks. The number of ducks is ${m}/${n} of the number of chickens.`),
        q: [L('Hỏi trang trại có bao nhiêu con gà, bao nhiêu con vịt?', 'How many chickens and how many ducks are there on the farm?'), L('Hỏi trang trại có bao nhiêu con gà?', 'How many chickens are there on the farm?'), L('Hỏi trang trại có bao nhiêu con vịt?', 'How many ducks are there on the farm?')] };
    } else if (k === 2) { u = R(rng, 4, 20);
      c = { small: L('Số cây cam', 'The number of orange trees'), big: L('Số cây bưởi', 'The number of pomelo trees'), ss: L('Cam', 'Orange'), bs: L('Bưởi', 'Pomelo'), unit: L('cây', 'trees'),
        giv: t => L(`Trong vườn, số cây cam ít hơn số cây bưởi là ${t} cây. Số cây cam bằng ${m}/${n} số cây bưởi.`, `In an orchard there are ${t} fewer orange trees than pomelo trees. The number of orange trees is ${m}/${n} of the number of pomelo trees.`),
        q: [L('Hỏi trong vườn có bao nhiêu cây cam, bao nhiêu cây bưởi?', 'How many orange trees and how many pomelo trees are there?'), L('Hỏi trong vườn có bao nhiêu cây bưởi?', 'How many pomelo trees are there?'), L('Hỏi trong vườn có bao nhiêu cây cam?', 'How many orange trees are there?')] };
    } else if (k === 1 && sum) { [m, n] = P(rng, [[2, 3], [3, 4], [4, 5], [3, 5], [5, 7], [5, 6]]); u = R(rng, Math.ceil(28 / (m + n)), Math.floor(45 / (m + n)));
      c = { small: L('Số học sinh nam', 'The number of boys'), big: L('Số học sinh nữ', 'The number of girls'), ss: L('Nam', 'Boys'), bs: L('Nữ', 'Girls'), unit: L('học sinh', 'pupils'),
        giv: t => L(`Lớp 5A có ${t} học sinh. Số học sinh nam bằng ${m}/${n} số học sinh nữ.`, `Class 5A has ${t} pupils. The number of boys is ${m}/${n} of the number of girls.`),
        q: [L('Hỏi lớp 5A có bao nhiêu học sinh nam, bao nhiêu học sinh nữ?', 'How many boys and how many girls are there in class 5A?'), L('Hỏi lớp 5A có bao nhiêu học sinh nữ?', 'How many girls are there in class 5A?'), L('Hỏi lớp 5A có bao nhiêu học sinh nam?', 'How many boys are there in class 5A?')] };
    } else if (k === 1) { m = 1; n = R(rng, 3, 5); u = R(rng, n === 3 ? 9 : n === 4 ? 7 : 6, n === 3 ? 13 : n === 4 ? 11 : 9);
      c = { small: L('Tuổi con', "The child's age"), big: L('Tuổi mẹ', "The mother's age"), ss: L('Con', 'Child'), bs: L('Mẹ', 'Mum'), unit: L('tuổi', 'years'),
        giv: t => L(`Mẹ hơn con ${t} tuổi. Tuổi con bằng ${m}/${n} tuổi mẹ.`, `Mum is ${t} years older than her child. The child's age is ${m}/${n} of Mum's age.`),
        q: [L('Hỏi mẹ bao nhiêu tuổi, con bao nhiêu tuổi?', 'How old is Mum and how old is the child?'), L('Hỏi mẹ bao nhiêu tuổi?', 'How old is Mum?'), L('Hỏi con bao nhiêu tuổi?', 'How old is the child?')] };
    } else {
      c = { small: L('Số bé', 'The smaller number'), big: L('Số lớn', 'The bigger number'), ss: L('Số bé', 'Smaller'), bs: L('Số lớn', 'Bigger'), unit: '',
        giv: t => (sum ? L(`Tổng của hai số là ${F(t)}. Tỉ số của hai số đó là ${m}/${n}.`, `The sum of two numbers is ${F(t)}. Their ratio is ${m}/${n}.`) : L(`Hiệu của hai số là ${F(t)}. Tỉ số của hai số đó là ${m}/${n}.`, `The difference between two numbers is ${F(t)}. Their ratio is ${m}/${n}.`)),
        q: [L('Tìm hai số đó.', 'Find the two numbers.'), L('Tìm số lớn.', 'Find the bigger number.'), L('Tìm số bé.', 'Find the smaller number.')] };
    }
    return Object.assign(c, { m, n, u, T: T(), sm: m * u, bg: n * u, times: k === 5 });
  }
  // ask: 0 both numbers, 1 the bigger, 2 the smaller
  function tiForm(rng, mode, k, ask) {
    const c = tiCtx(rng, mode, k), { m, n, u, T, sm, bg } = c, sum = mode === 'S', parts = sum ? m + n : n - m, un = c.unit ? ` (${c.unit})` : '', uu = c.unit ? ` ${c.unit}` : '';
    const ratio = c.times ? L(`số lớn gấp ${n} lần số bé`, `the bigger number is ${n} times the smaller`) : L(`tỉ số là ${m}/${n}`, `the ratio is ${m}/${n}`);
    const good = sum ? L(`Tổng là ${F(T)}, ${ratio}`, `The sum is ${F(T)}, ${ratio}`) : L(`Hiệu là ${F(T)}, ${ratio}`, `The difference is ${F(T)}, ${ratio}`);
    const bad = [sum ? L(`Hiệu là ${F(T)}, ${ratio}`, `The difference is ${F(T)}, ${ratio}`) : L(`Tổng là ${F(T)}, ${ratio}`, `The sum is ${F(T)}, ${ratio}`), L(`Tổng là ${F(T)}, hiệu là ${n}`, `The sum is ${F(T)}, the difference is ${n}`)];
    const steps = [
      S(L('Bài toán cho biết gì?', 'What does the problem tell you?'), ch(rng, good, bad),
        L(`${good}. Vẽ sơ đồ: ${lc(c.small)} gồm ${m} phần, ${lc(c.big)} gồm ${n} phần bằng nhau.`, `${good}. Draw a bar model: ${lc(c.small)} is ${pl(m, 'part')} and ${lc(c.big)} is ${n} equal parts.`)),
      sum ? S(L(`Tổng số phần bằng nhau: ${m} + ${n} = ?`, `Total number of equal parts: ${m} + ${n} = ?`), num(parts), L(`Tổng số phần bằng nhau là: ${m} + ${n} = ${parts} (phần).`, `Total number of equal parts: ${m} + ${n} = ${parts} (parts).`))
        : S(L(`Hiệu số phần bằng nhau: ${n} ${M} ${m} = ?`, `Difference in equal parts: ${n} ${M} ${m} = ?`), num(parts), L(`Hiệu số phần bằng nhau là: ${n} ${M} ${m} = ${parts} (phần).`, `Difference in equal parts: ${n} ${M} ${m} = ${parts} (${parts === 1 ? 'part' : 'parts'}).`)),
      S(L(`Giá trị một phần: ${F(T)} : ${parts} = ?`, `Value of one part: ${F(T)} : ${parts} = ?`), num(u), L(`Giá trị một phần là: ${F(T)} : ${parts} = ${F(u)}${un}.`, `Value of one part: ${F(T)} : ${parts} = ${F(u)}${un}.`), sum ? L('Lấy tổng chia cho tổng số phần.', 'Divide the sum by the total number of parts.') : L('Lấy hiệu chia cho hiệu số phần.', 'Divide the difference by the difference in parts.')),
      m === 1 ? S(L(`${c.small} gồm 1 phần. ${c.small} là bao nhiêu?`, `${c.small} is 1 part. How much is it?`), num(sm, c.unit), L(`${c.small} gồm 1 phần nên bằng giá trị một phần: ${F(sm)}${uu}.`, `${c.small} is 1 part, so it equals the value of one part: ${F(sm)}${uu}.`))
        : S(L(`${c.small} gồm ${m} phần: ${F(u)} × ${m} = ?`, `${c.small} is ${m} parts: ${F(u)} × ${m} = ?`), num(sm, c.unit), L(`${c.small} là: ${F(u)} × ${m} = ${F(sm)}${un}.`, `${c.small}: ${F(u)} × ${m} = ${F(sm)}${un}.`)),
      S(L(`${c.big} gồm ${n} phần: ${F(u)} × ${n} = ?`, `${c.big} is ${n} parts: ${F(u)} × ${n} = ?`), num(bg, c.unit), L(`${c.big} là: ${F(u)} × ${n} = ${F(bg)}${un}.`, `${c.big}: ${F(u)} × ${n} = ${F(bg)}${un}.`)),
    ];
    const bars = [{ label: c.ss, parts: m, units: m, value: '?' }, { label: c.bs, parts: n, units: n, value: '?' }];
    const g = G(`${c.giv(T)} ${c.q[ask]}`, ask === 1 ? steps.slice(0, 3).concat(steps[4]) : ask === 2 ? steps.slice(0, 4) : steps,
      ask === 1 ? DS(`${F(bg)}${uu}`) : ask === 2 ? DS(`${F(sm)}${uu}`) : DS(`${c.ss}: ${F(sm)}${uu}; ${c.bs}: ${F(bg)}${uu}`),
      vz('tape', sum ? { bars, total: F(T) + uu } : { bars, diff: F(T) + uu }));
    g.c = c;
    return g;
  }
  const TT_HINT = L('Tổng số phần bằng nhau → giá trị một phần → từng số.', 'Total number of equal parts → value of one part → each number.');
  const HT_HINT2 = L('Hiệu số phần bằng nhau → giá trị một phần → từng số.', 'Difference in equal parts → value of one part → each number.');
  function ttVary(rng, i) {
    if (i === 4) return toQ(tiForm(rng, 'S', P(rng, [2, 3]), 1), TT_HINT);
    if (i === 5) return toQ(tiForm(rng, 'S', 4, 1), TT_HINT);
    const c = tiCtx(rng, 'S', 0), { m, n, u, T } = c;
    return lines(L(`Tổng của hai số là ${F(T)}. Tỉ số của hai số đó là ${m}/${n}. Hỏi số lớn hơn số bé bao nhiêu đơn vị?`, `The sum of two numbers is ${F(T)}. Their ratio is ${m}/${n}. How much bigger is the bigger number than the smaller number?`),
      [[m + n, '', L(`Tổng số phần bằng nhau là: ${m} + ${n} = ${m + n} (phần).`, `Total number of equal parts: ${m} + ${n} = ${m + n} (parts).`)], [u, '', L(`Giá trị một phần là: ${F(T)} : ${m + n} = ${u}.`, `Value of one part: ${F(T)} : ${m + n} = ${u}.`)],
        [n - m, '', L(`Số lớn hơn số bé số phần là: ${n} ${M} ${m} = ${n - m} (phần).`, `The bigger number has ${n} ${M} ${m} = ${n - m} more ${n - m === 1 ? 'part' : 'parts'}.`)], [(n - m) * u, '', L(`Số lớn hơn số bé: ${u} × ${n - m} = ${(n - m) * u}.`, `Difference: ${u} × ${n - m} = ${(n - m) * u}.`)]],
      TT_HINT, vz('tape', { bars: [{ label: c.ss, parts: m, units: m, value: '?' }, { label: c.bs, parts: n, units: n, value: '?' }], total: F(T) }));
  }
  // a rectangle from its half-perimeter (sum) or from "longer by" (difference): the area
  function tiArea(rng, mode) {
    const c = tiCtx(rng, mode, 4), { m, n, u, T, sm, bg } = c, sum = mode === 'S', parts = sum ? m + n : n - m;
    return lines(sum ? L(`Một mảnh vườn hình chữ nhật có nửa chu vi là ${T} m. Chiều rộng bằng ${m}/${n} chiều dài. Tính diện tích mảnh vườn.`, `Half the perimeter of a rectangular garden is ${T} m. The width is ${m}/${n} of the length. Find the area of the garden.`)
      : L(`Một mảnh vườn hình chữ nhật có chiều dài hơn chiều rộng ${T} m. Chiều rộng bằng ${m}/${n} chiều dài. Tính diện tích mảnh vườn.`, `A rectangular garden is ${T} m longer than it is wide. The width is ${m}/${n} of the length. Find the area of the garden.`),
    [[parts, '', sum ? L(`Tổng số phần bằng nhau là: ${m} + ${n} = ${parts} (phần).`, `Total number of equal parts: ${m} + ${n} = ${parts} (parts).`) : L(`Hiệu số phần bằng nhau là: ${n} ${M} ${m} = ${parts} (phần).`, `Difference in equal parts: ${n} ${M} ${m} = ${parts} (${parts === 1 ? 'part' : 'parts'}).`)],
      [u, '', L(`Giá trị một phần là: ${T} : ${parts} = ${u} (m).`, `Value of one part: ${T} : ${parts} = ${u} (m).`)], [sm, '', L(`Chiều rộng là: ${u} × ${m} = ${sm} (m).`, `Width: ${u} × ${m} = ${sm} (m).`)], [bg, '', L(`Chiều dài là: ${u} × ${n} = ${bg} (m).`, `Length: ${u} × ${n} = ${bg} (m).`)],
      [sm * bg, 'm²', L(`Diện tích mảnh vườn là: ${bg} × ${sm} = ${F(sm * bg)} (m²).`, `Area of the garden: ${bg} × ${sm} = ${F(sm * bg)} (m²).`)]],
    sum ? TT_HINT : HT_HINT2, vz('tape', Object.assign({ bars: [{ label: c.ss, parts: m, units: m, value: '?' }, { label: c.bs, parts: n, units: n, value: '?' }] }, sum ? { total: T + ' m' } : { diff: T + ' m' })));
  }
  function hieuVary(rng, i) {
    if (i === 4) return toQ(tiForm(rng, 'D', P(rng, [2, 3]), 1), HT_HINT2);
    if (i === 5) return toQ(tiForm(rng, 'D', 4, 2), HT_HINT2);
    const c = tiCtx(rng, 'D', 0), { m, n, u, T } = c;
    return lines(L(`Hiệu của hai số là ${F(T)}. Tỉ số của hai số đó là ${m}/${n}. Tính tổng của hai số đó.`, `The difference between two numbers is ${F(T)}. Their ratio is ${m}/${n}. Find the sum of the two numbers.`),
      [[n - m, '', L(`Hiệu số phần bằng nhau là: ${n} ${M} ${m} = ${n - m} (phần).`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m} (${n - m === 1 ? 'part' : 'parts'}).`)], [u, '', L(`Giá trị một phần là: ${F(T)} : ${n - m} = ${u}.`, `Value of one part: ${F(T)} : ${n - m} = ${u}.`)],
        [m + n, '', L(`Tổng số phần bằng nhau là: ${m} + ${n} = ${m + n} (phần).`, `Total number of equal parts: ${m} + ${n} = ${m + n} (parts).`)], [(m + n) * u, '', L(`Tổng của hai số là: ${u} × ${m + n} = ${(m + n) * u}.`, `Sum of the two numbers: ${u} × ${m + n} = ${(m + n) * u}.`)]],
      HT_HINT2, vz('tape', { bars: [{ label: c.ss, parts: m, units: m, value: '?' }, { label: c.bs, parts: n, units: n, value: '?' }], diff: F(T) }));
  }

  // ================= 10. Tìm tỉ số phần trăm của hai số (Bài 40) =================
  const pcv = p => (p > 0 && p <= 100 && Number.isInteger(p) ? vz('percent', { percent: p }) : null);
  function pcForm(rng, k) {
    const name = DT.name(rng);
    const C = [
      { Ns: [20, 25, 40], lo: 40, hi: 60, vi: (N, g) => `Lớp 5A có ${N} học sinh, trong đó có ${g} học sinh nữ. Hỏi số học sinh nữ chiếm bao nhiêu phần trăm số học sinh cả lớp?`, en: (N, g) => `Class 5A has ${N} pupils, and ${g} of them are girls. What percentage of the class are girls?`, line: L('Tỉ số phần trăm của số học sinh nữ và số học sinh cả lớp', 'Girls as a percentage of the class') },
      { Ns: [200, 400, 500, 800], lo: 70, hi: 96, vi: (N, g) => `Một đội trồng rừng trồng ${N} cây, trong đó có ${g} cây sống. Hỏi số cây sống chiếm bao nhiêu phần trăm số cây đã trồng?`, en: (N, g) => `A team plants ${N} trees, and ${g} of them live. What percentage of the trees planted live?`, line: L('Tỉ số phần trăm của số cây sống và số cây đã trồng', 'Living trees as a percentage of the trees planted') },
      { Ns: [200, 250, 400, 500], lo: 80, hi: 98, vi: (N, g) => `Một xưởng làm được ${N} sản phẩm, trong đó có ${g} sản phẩm đạt chuẩn. Hỏi số sản phẩm đạt chuẩn chiếm bao nhiêu phần trăm tổng số sản phẩm?`, en: (N, g) => `A workshop makes ${N} items, and ${g} of them meet the standard. What percentage of the items meet the standard?`, line: L('Tỉ số phần trăm của số sản phẩm đạt chuẩn và tổng số sản phẩm', 'Items that meet the standard as a percentage of all the items') },
      { Ns: [20, 25, 40, 50], lo: 60, hi: 96, vi: (N, g) => `Bài kiểm tra có ${N} câu hỏi, bạn ${name} trả lời đúng ${g} câu. Hỏi số câu trả lời đúng chiếm bao nhiêu phần trăm số câu hỏi?`, en: (N, g) => `A test has ${N} questions and ${name} answers ${g} of them correctly. What percentage of the questions does ${name} answer correctly?`, line: L('Tỉ số phần trăm của số câu đúng và số câu hỏi', 'Correct answers as a percentage of the questions') },
    ][k];
    const N = P(rng, C.Ns), step = 100 / U.gcd(N, 100), p = R(rng, Math.ceil(C.lo / step), Math.floor(C.hi / step)) * step, g = N * p / 100, q = rd(g / N, 2);
    return G(L(C.vi(N, g), C.en(N, g)),
      [
        S(L('Muốn biết phần đó chiếm bao nhiêu phần trăm, ta làm phép tính nào?', 'To find the percentage, which calculation do you do?'), ch(rng, `${g} : ${N}`, [`${N} : ${g}`, `${N} ${M} ${g}`, `${g} × ${N}`]),
          L(`Lấy phần (${g}) chia cho tất cả (${N}).`, `Divide the part (${g}) by the whole (${N}).`)),
        S(L(`Tìm thương: ${g} : ${N} = ? (viết dưới dạng số thập phân)`, `Find the quotient: ${g} : ${N} = ? (as a decimal)`), num(q), `${g} : ${N} = ${F(q)}.`),
        S(L(`Nhân với 100 rồi viết thêm kí hiệu %: ${F(q)} = ? %`, `Multiply by 100 and write the % sign: ${F(q)} = ? %`), num(p, '%'), L(`${C.line} là: ${g} : ${N} = ${F(q)} = ${p}%.`, `${C.line}: ${g} : ${N} = ${F(q)} = ${p}%.`)),
      ],
      DS(`${p}%`), pcv(p));
  }
  const PC_HINT = L('Tìm thương của hai số, nhân thương với 100 rồi viết thêm kí hiệu %.', 'Divide one number by the other, multiply the quotient by 100 and write the % sign.');
  function pcPlain(rng, i) {
    if (i > 0) return toQ(pcForm(rng, i === 3 ? R(rng, 2, 3) : i - 1), PC_HINT);
    const b = P(rng, [4, 5, 8, 10, 20, 25, 40, 50]), a = R(rng, 1, b - 1), q = rd(a / b, 3), p = rd(q * 100, 1);
    return Q(L(`Tìm tỉ số phần trăm của ${a} và ${b}.`, `What percentage is ${a} of ${b}?`), num(p, '%'), `${a} : ${b} = ${F(q)} = ${F(p)}%.`, { hint: PC_HINT });
  }
  function pcVary(rng, i) {
    if (i === 4) {
      const N = P(rng, [20, 25, 40]), step = 100 / U.gcd(N, 100), p = R(rng, Math.ceil(40 / step), Math.floor(64 / step)) * step, g = N * p / 100, b = N - g;
      return lines(L(`Lớp 5B có ${b} học sinh nam và ${g} học sinh nữ. Hỏi số học sinh nữ chiếm bao nhiêu phần trăm số học sinh cả lớp?`, `Class 5B has ${b} boys and ${g} girls. What percentage of the class are girls?`),
        [[N, '', L(`Số học sinh cả lớp: ${b} + ${g} = ${N} (học sinh).`, `Pupils in the class: ${b} + ${g} = ${N} (pupils).`)], [p, '%', L(`Tỉ số phần trăm của số học sinh nữ và số học sinh cả lớp: ${g} : ${N} = ${F(g / N)} = ${p}%.`, `Girls as a percentage of the class: ${g} : ${N} = ${F(g / N)} = ${p}%.`)]],
        L('Tìm số học sinh cả lớp trước.', 'Find the number of pupils in the class first.'), pcv(p));
    }
    if (i === 5) {
      const A = P(rng, [200, 400, 500, 800, 1200]), p = P(rng, [105, 110, 112, 115, 120, 125, 130]), B = A * p / 100, [vi, en, past] = P(rng, [['trồng', 'plant', 'planted'], ['may', 'make', 'made'], ['lắp ráp', 'assemble', 'assembled']]), [o, oE] = vi === 'trồng' ? ['cây', 'trees'] : vi === 'may' ? ['bộ quần áo', 'outfits'] : ['xe đạp', 'bicycles'];
      return Q(L(`Theo kế hoạch, một đội phải ${vi} ${F(A)} ${o}. Thực tế đội đã ${vi} được ${F(B)} ${o}. Hỏi đội đã thực hiện được bao nhiêu phần trăm kế hoạch?`, `A team planned to ${en} ${F(A)} ${oE}. In fact they ${past} ${F(B)} ${oE}. What percentage of the plan did the team achieve?`), num(p, '%'),
        L(`Tỉ số phần trăm của số ${o} đã ${vi} và số ${o} theo kế hoạch: ${F(B)} : ${F(A)} = ${F(p / 100)} = ${p}%.`, `Done as a percentage of the plan: ${F(B)} : ${F(A)} = ${F(p / 100)} = ${p}%.`), { hint: L('Lấy số đã làm được chia cho số theo kế hoạch.', 'Divide what was done by what was planned.') });
    }
    const N = P(rng, [200, 250, 400, 500]), step = 100 / U.gcd(N, 100), p = R(rng, Math.ceil(20 / step), Math.floor(80 / step)) * step, sold = N * (100 - p) / 100, left = N - sold;
    return lines(L(`Một cửa hàng có ${N} kg gạo, đã bán được ${sold} kg. Hỏi số gạo còn lại chiếm bao nhiêu phần trăm số gạo lúc đầu?`, `A shop has ${N} kg of rice and has sold ${sold} kg. What percentage of the rice it had at the start is left?`),
      [[left, '', L(`Số gạo còn lại: ${N} ${M} ${sold} = ${left} (kg).`, `Rice left: ${N} ${M} ${sold} = ${left} (kg).`)], [p, '%', L(`Tỉ số phần trăm của số gạo còn lại và số gạo lúc đầu: ${left} : ${N} = ${F(left / N)} = ${p}%.`, `Rice left as a percentage of the rice at the start: ${left} : ${N} = ${F(left / N)} = ${p}%.`)]],
      L('Tìm số gạo còn lại trước.', 'Find the rice left first.'), pcv(p));
  }
  function pcHard(rng) {
    const A = P(rng, [200, 400, 500, 800, 1200]), p = P(rng, [105, 110, 112, 115, 120, 125, 130]), B = A * p / 100;
    return lines(L(`Theo kế hoạch, một tổ sản xuất phải làm ${F(A)} sản phẩm. Thực tế tổ đã làm được ${F(B)} sản phẩm. Hỏi tổ đó đã làm vượt mức kế hoạch bao nhiêu phần trăm?`, `A team planned to make ${F(A)} items. In fact they made ${F(B)} items. By what percentage did the team go over the plan?`),
      [[p, '', L(`Tỉ số phần trăm của số sản phẩm đã làm và kế hoạch: ${F(B)} : ${F(A)} = ${F(p / 100)} = ${p}%.`, `Made as a percentage of the plan: ${F(B)} : ${F(A)} = ${F(p / 100)} = ${p}%.`)], [p - 100, '%', L(`Coi kế hoạch là 100%. Tổ đã vượt mức kế hoạch: ${p}% ${M} 100% = ${p - 100}%.`, `The plan is 100%. The team went over the plan by: ${p}% ${M} 100% = ${p - 100}%.`)]],
      L('Tìm tỉ số phần trăm so với kế hoạch, rồi trừ đi 100%.', 'Find the percentage of the plan, then take away 100%.'));
  }

  // ================= 11. Tìm giá trị phần trăm của một số (Bài 41) =================
  // contexts: N (the whole), p (the percentage); rest: also the amount that is left (the new price, what remains)
  function gtCtx(rng, k) {
    if (k === 1) { const N = R(rng, 12, 60) * 10, p = P(rng, [15, 20, 25, 30, 35, 40, 45, 60, 75]); return { N, p, u: 'kg', giv: L(`Một cửa hàng có ${N} kg gạo, đã bán được ${p}% số gạo đó.`, `A shop has ${N} kg of rice and has sold ${p}% of it.`), q: L('Hỏi cửa hàng đã bán được bao nhiêu ki-lô-gam gạo?', 'How many kilograms of rice has the shop sold?'), qr: L('Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?', 'How many kilograms of rice are left?'), part: L('Số gạo đã bán', 'Rice sold'), left: L('Số gạo còn lại', 'Rice left') }; }
    if (k === 2) { const N = R(rng, 8, 60) * 10000, p = P(rng, [10, 15, 20, 25, 30]), [it, itE] = P(rng, [['Một chiếc áo', 'A shirt'], ['Một đôi giày', 'A pair of shoes'], ['Một chiếc cặp sách', 'A school bag']]); return { N, p, u: DONG, giv: L(`${it} có giá ${F(N)} đồng. Nhân dịp năm học mới, cửa hàng giảm giá ${p}%.`, `${itE} costs ${F(N)} dong. For the new school year, the shop takes ${p}% off the price.`), q: L('Hỏi món hàng đó được giảm bao nhiêu tiền?', 'How much money is taken off the price?'), qr: L('Hỏi sau khi giảm giá, món hàng đó có giá bao nhiêu tiền?', 'What is the price after the discount?'), part: L('Số tiền được giảm', 'Discount'), left: L('Giá sau khi giảm', 'Price after the discount') }; }
    if (k === 3) { const [N, p] = P(rng, [[40, 45], [40, 55], [32, 50], [35, 40], [35, 60], [45, 40], [45, 60], [40, 60]]); return { N, p, u: L('học sinh', 'pupils'), giv: L(`Lớp 5C có ${N} học sinh, trong đó ${p}% là học sinh nữ.`, `Class 5C has ${N} pupils, and ${p}% of them are girls.`), q: L('Hỏi lớp 5C có bao nhiêu học sinh nữ?', 'How many girls are there in class 5C?'), qr: L('Hỏi lớp 5C có bao nhiêu học sinh nam?', 'How many boys are there in class 5C?'), part: L('Số học sinh nữ', 'Girls'), left: L('Số học sinh nam', 'Boys') }; }
    if (k === 4) { const N = R(rng, 12, 60) * 5, p = P(rng, [20, 30, 40, 60, 70]); return { N, p, u: 'l', giv: L(`Một thùng có ${N} l dầu. Người ta đã dùng hết ${p}% số dầu đó.`, `A drum holds ${N} l of oil. ${p}% of the oil has been used.`), q: L('Hỏi người ta đã dùng bao nhiêu lít dầu?', 'How many litres of oil have been used?'), qr: L('Hỏi trong thùng còn lại bao nhiêu lít dầu?', 'How many litres of oil are left in the drum?'), part: L('Số dầu đã dùng', 'Oil used'), left: L('Số dầu còn lại', 'Oil left') }; }
    const N = R(rng, 4, 12) * 100, p = R(rng, 42, 58);
    return { N, p, u: L('học sinh', 'pupils'), giv: L(`Một trường tiểu học có ${N} học sinh, trong đó ${p}% là học sinh nữ.`, `A primary school has ${N} pupils, and ${p}% of them are girls.`), q: L('Hỏi trường đó có bao nhiêu học sinh nữ?', 'How many girls are there in the school?'), qr: L('Hỏi trường đó có bao nhiêu học sinh nam?', 'How many boys are there in the school?'), part: L('Số học sinh nữ', 'Girls'), left: L('Số học sinh nam', 'Boys') };
  }
  function gtForm(rng, k, rest) {
    const c = gtCtx(rng, k), { N, p, u } = c, one = rd(N / 100, 2), v = rd(N * p / 100, 2);
    const steps = [
      S(L(`Muốn tìm ${p}% của ${F(N)}, ta làm thế nào?`, `How do you find ${p}% of ${F(N)}?`), ch(rng, `${F(N)} : 100 × ${p}`, [`${F(N)} : ${p} × 100`, `${F(N)} + ${p}`, `${F(N)} × 100 : ${p}`]),
        L(`Coi ${F(N)} là 100%. Tìm 1% (chia cho 100), rồi nhân với ${p}.`, `${F(N)} is 100%. Find 1% (divide by 100), then multiply by ${p}.`)),
      S(L(`1% của ${F(N)}: ${F(N)} : 100 = ?`, `1% of ${F(N)}: ${F(N)} : 100 = ?`), num(one), L(`1% của ${F(N)} là: ${F(N)} : 100 = ${F(one)}.`, `1% of ${F(N)}: ${F(N)} : 100 = ${F(one)}.`), L('Chia cho 100: chuyển dấu phẩy sang trái hai chữ số.', 'To divide by 100, move the comma two places to the left.')),
      S(L(`${p}% của ${F(N)}: ${F(one)} × ${p} = ?`, `${p}% of ${F(N)}: ${F(one)} × ${p} = ?`), num(v, u), L(`${c.part}: ${F(N)} : 100 × ${p} = ${F(v)} (${u}).`, `${c.part}: ${F(N)} : 100 × ${p} = ${F(v)} (${u}).`)),
    ];
    if (rest) steps.push(S(`${c.left}: ${F(N)} ${M} ${F(v)} = ?`, num(rd(N - v, 2), u), `${c.left}: ${F(N)} ${M} ${F(v)} = ${F(rd(N - v, 2))} (${u}).`));
    return G(`${c.giv} ${rest ? c.qr : c.q}`, steps, DS(`${F(rest ? rd(N - v, 2) : v)} ${u}`), pcv(p));
  }
  const GT_HINT = L('Lấy số đó chia cho 100 rồi nhân với số phần trăm (hoặc nhân với số phần trăm rồi chia cho 100).', 'Divide the number by 100, then multiply by the percentage (or multiply first, then divide by 100).');
  function gtPlain(rng, i) {
    if (i > 0) return toQ(gtForm(rng, [0, 3, 2, 1][i], false), GT_HINT);
    const p = P(rng, [10, 20, 25, 30, 40, 50, 75]), N = R(rng, 2, 30) * 20, v = N * p / 100;
    return Q(L(`Tìm ${p}% của ${N}.`, `Find ${p}% of ${N}.`), num(v), `${N} : 100 × ${p} = ${F(N / 100)} × ${p} = ${F(v)}.`, { hint: GT_HINT, visual: pcv(p) });
  }
  const money = (rng) => R(rng, 2, 50) * 1000000;
  function gtVary(rng, i) {
    if (i === 4) return toQ(gtForm(rng, 2, true), L('Tìm số tiền được giảm, rồi lấy giá cũ trừ đi.', 'Find the discount, then take it away from the old price.'));
    if (i === 5) return toQ(gtForm(rng, P(rng, [1, 4]), true), L('Tìm phần đã dùng (đã bán), rồi lấy số lúc đầu trừ đi.', 'Find the part used (or sold), then take it away from the amount at the start.'));
    const A = money(rng), r = P(rng, [5, 6, 7, 5.5, 6.5, 7.2, 4.8]), int = rd(A / 100 * r, 0);
    return Q(L(`Bác Hai gửi tiết kiệm ${F(A)} đồng với lãi suất ${F(r)}% một năm. Hỏi sau một năm, bác Hai nhận được bao nhiêu tiền lãi?`, `Mr Hai puts ${F(A)} dong in a savings account. The interest rate is ${F(r)}% a year. How much interest does he get after one year?`), num(int, DONG),
      L(`Tiền lãi sau một năm là ${F(r)}% của ${F(A)} đồng:\n${F(A)} : 100 × ${F(r)} = ${F(int)} (đồng).`, `The interest after one year is ${F(r)}% of ${F(A)} dong:\n${F(A)} : 100 × ${F(r)} = ${F(int)} (dong).`), { hint: L('Tiền lãi = tiền gửi : 100 × lãi suất.', 'Interest = money saved : 100 × interest rate.') });
  }
  function gtHard(rng) {
    const A = money(rng), r = P(rng, [5, 6, 7, 5.5, 6.5, 7.2, 4.8]), int = rd(A / 100 * r, 0);
    return lines(L(`Cô Lan gửi tiết kiệm ${F(A)} đồng với lãi suất ${F(r)}% một năm. Hỏi sau một năm, cô Lan nhận được cả tiền gửi và tiền lãi là bao nhiêu?`, `Ms Lan puts ${F(A)} dong in a savings account. The interest rate is ${F(r)}% a year. After one year, how much does she get back altogether (her savings and the interest)?`),
      [[int, '', L(`Tiền lãi sau một năm: ${F(A)} : 100 × ${F(r)} = ${F(int)} (đồng).`, `Interest after one year: ${F(A)} : 100 × ${F(r)} = ${F(int)} (dong).`)], [A + int, DONG, L(`Cả tiền gửi và tiền lãi: ${F(A)} + ${F(int)} = ${F(A + int)} (đồng).`, `Savings and interest: ${F(A)} + ${F(int)} = ${F(A + int)} (dong).`)]],
      L('Tính tiền lãi trước, rồi cộng với tiền gửi.', 'Find the interest first, then add it to the savings.'));
  }

  // ================= 12. Thể tích hình hộp chữ nhật, hình lập phương (Bài 52, 53) =================
  const box = (l, w, h, unit) => vz('solid', { kind: 'box', dims: { l, w, h, unit } });
  const edge = (rng, half) => (half && R(rng, 0, 2) === 0 ? R(rng, 1, 8) + 0.5 : R(rng, 2, 12));
  // litres: also the capacity in litres (the sizes are in dm)
  function volBox(rng, half, litres) {
    const b = edge(rng, half), a = rd(b + R(rng, 1, 8), 1), c = R(rng, 2, 9), base = rd(a * b, 2), v = rd(base * c, 2);
    const [A1, a1, E1, e1, u] = litres ? P(rng, [['Một bể cá', 'bể cá', 'A fish tank', 'tank', 'dm'], ['Một thùng tôn', 'thùng', 'A metal tub', 'tub', 'dm'], ['Một hộp nhựa', 'hộp nhựa', 'A plastic box', 'box', 'dm']]) : P(rng, [['Một cái hộp', 'cái hộp', 'A box', 'box', 'cm'], ['Một khối gỗ', 'khối gỗ', 'A block of wood', 'block', 'dm'], ['Một viên gạch', 'viên gạch', 'A brick', 'brick', 'cm'], ['Một thùng hàng', 'thùng hàng', 'A crate', 'crate', 'dm']]);
    const steps = [
      S(L('Thể tích hình hộp chữ nhật tính thế nào?', 'How do you find the volume of a cuboid?'), ch(rng, L('Chiều dài × chiều rộng × chiều cao', 'Length × width × height'), [L('(Chiều dài + chiều rộng) × 2 × chiều cao', '(Length + width) × 2 × height'), L('Chiều dài + chiều rộng + chiều cao', 'Length + width + height')]), 'V = a × b × c.'),
      S(L(`Chiều dài × chiều rộng (diện tích đáy): ${F(a)} × ${F(b)} = ?`, `Length × width (the area of the base): ${F(a)} × ${F(b)} = ?`), num(base), `${F(a)} × ${F(b)} = ${F(base)}.`),
      S(L(`Nhân với chiều cao: ${F(base)} × ${c} = ?`, `Multiply by the height: ${F(base)} × ${c} = ?`), num(v, u + '³'), L(`Thể tích ${a1}: ${F(a)} × ${F(b)} × ${c} = ${F(v)} (${u}³).`, `Volume of the ${e1}: ${F(a)} × ${F(b)} × ${c} = ${F(v)} (${u}³).`)),
    ];
    if (litres) steps.push(S(L(`1 dm³ = 1 l. Vậy ${a1} chứa được nhiều nhất bao nhiêu lít nước?`, `1 dm³ = 1 l. So how many litres of water can the ${e1} hold at most?`), num(v, 'l'), L(`${F(v)} dm³ = ${F(v)} l.`, `${F(v)} dm³ = ${F(v)} l.`)));
    return G(litres ? L(`${A1} dạng hình hộp chữ nhật có chiều dài ${F(a)} dm, chiều rộng ${F(b)} dm, chiều cao ${c} dm. Hỏi ${a1} chứa được nhiều nhất bao nhiêu lít nước?`, `${E1} is a cuboid ${F(a)} dm long, ${F(b)} dm wide and ${c} dm high. How many litres of water can the ${e1} hold at most?`)
      : L(`${A1} dạng hình hộp chữ nhật có chiều dài ${F(a)} ${u}, chiều rộng ${F(b)} ${u}, chiều cao ${c} ${u}. Tính thể tích ${a1}.`, `${E1} is a cuboid ${F(a)} ${u} long, ${F(b)} ${u} wide and ${c} ${u} high. Find the volume of the ${e1}.`),
    steps, DS(litres ? `${F(v)} l` : `${F(v)} ${u}³`), box(a, b, c, u));
  }
  function volCube(rng, half) {
    const a = edge(rng, half), sq = rd(a * a, 2), v = rd(sq * a, 3), [A1, a1, E1, e1, u] = P(rng, [['Một khối gỗ', 'khối gỗ', 'A block of wood', 'block', 'dm'], ['Một hộp quà', 'hộp quà', 'A gift box', 'box', 'cm'], ['Một thùng giấy', 'thùng giấy', 'A cardboard box', 'box', 'dm'], ['Một khối đá', 'khối đá', 'A block of stone', 'block', 'dm']]);
    return G(L(`${A1} dạng hình lập phương có cạnh ${F(a)} ${u}. Tính thể tích ${a1}.`, `${E1} is a cube with edges of ${F(a)} ${u}. Find the volume of the ${e1}.`),
      [
        S(L('Thể tích hình lập phương tính thế nào?', 'How do you find the volume of a cube?'), ch(rng, L('Cạnh × cạnh × cạnh', 'Edge × edge × edge'), [L('Cạnh × 3', 'Edge × 3'), L('Cạnh × cạnh × 6', 'Edge × edge × 6')]), 'V = a × a × a.'),
        S(`${F(a)} × ${F(a)} = ?`, num(sq), `${F(a)} × ${F(a)} = ${F(sq)}.`),
        S(L(`Nhân tiếp với cạnh: ${F(sq)} × ${F(a)} = ?`, `Multiply by the edge again: ${F(sq)} × ${F(a)} = ?`), num(v, u + '³'), L(`Thể tích ${a1}: ${F(a)} × ${F(a)} × ${F(a)} = ${F(v)} (${u}³).`, `Volume of the ${e1}: ${F(a)} × ${F(a)} × ${F(a)} = ${F(v)} (${u}³).`)),
      ],
      DS(`${F(v)} ${u}³`), vz('solid', { kind: 'cube', dims: { a, unit: u } }));
  }
  const TT_VOL = L('Hình hộp chữ nhật: V = a × b × c. Hình lập phương: V = a × a × a.', 'Cuboid: V = a × b × c. Cube: V = a × a × a.');
  function volVary(rng, i) {
    const a = R(rng, 4, 12), b = R(rng, 2, a - 1), c = R(rng, 2, 9);
    if (i === 4) return lines(L(`Một hình hộp chữ nhật có thể tích ${F(a * b * c)} cm³, chiều dài ${a} cm, chiều rộng ${b} cm. Tính chiều cao của hình hộp đó.`, `A cuboid has a volume of ${F(a * b * c)} cm³, a length of ${a} cm and a width of ${b} cm. Find its height.`),
      [[a * b, '', L(`Diện tích đáy: ${a} × ${b} = ${a * b} (cm²).`, `Area of the base: ${a} × ${b} = ${a * b} (cm²).`)], [c, 'cm', L(`Chiều cao: ${F(a * b * c)} : ${a * b} = ${c} (cm).`, `Height: ${F(a * b * c)} : ${a * b} = ${c} (cm).`)]],
      L('Chiều cao = thể tích : (chiều dài × chiều rộng).', 'Height = volume : (length × width).'), box(a, b, '?', 'cm'));
    if (i === 5) { const m = R(rng, 1, 3), a2 = m * 10; return lines(L(`Một thùng gỗ dạng hình hộp chữ nhật có chiều dài ${m} m, chiều rộng ${b + 2} dm, chiều cao ${c} dm. Tính thể tích thùng gỗ theo đề-xi-mét khối.`, `A wooden crate is a cuboid ${m} m long, ${b + 2} dm wide and ${c} dm high. Find its volume in cubic decimetres.`),
      [[a2, 'dm', L(`Đổi: ${m} m = ${a2} dm.`, `Change: ${m} m = ${a2} dm.`)], [a2 * (b + 2) * c, 'dm³', L(`Thể tích thùng gỗ: ${a2} × ${b + 2} × ${c} = ${F(a2 * (b + 2) * c)} (dm³).`, `Volume of the crate: ${a2} × ${b + 2} × ${c} = ${F(a2 * (b + 2) * c)} (dm³).`)]],
      L('Đổi ba kích thước về cùng một đơn vị đo trước.', 'Change the three sizes to the same unit first.'), box(a2, b + 2, c, 'dm')); }
    const l = R(rng, 2, 5), w = dec(R(rng, 3, 5) * 5, 1), h = dec(P(rng, [8, 12, 15, 16]), 1), v = rd(l * w * h, 3);
    return lines(L(`Một bể nước dạng hình hộp chữ nhật có chiều dài ${l} m, chiều rộng ${F(w)} m, chiều cao ${F(h)} m. Hỏi bể đó chứa được nhiều nhất bao nhiêu lít nước?`, `A water tank is a cuboid ${l} m long, ${F(w)} m wide and ${F(h)} m high. How many litres of water can it hold at most?`),
      [[v, 'm³', L(`Thể tích bể nước: ${l} × ${F(w)} × ${F(h)} = ${F(v)} (m³).`, `Volume of the tank: ${l} × ${F(w)} × ${F(h)} = ${F(v)} (m³).`)], [rd(v * 1000, 0), 'l', L(`Đổi: ${F(v)} m³ = ${F(rd(v * 1000, 0))} dm³ = ${F(rd(v * 1000, 0))} l.`, `Change: ${F(v)} m³ = ${F(rd(v * 1000, 0))} dm³ = ${F(rd(v * 1000, 0))} l.`)]],
      L('1 m³ = 1000 dm³; 1 dm³ = 1 l.', '1 m³ = 1000 dm³; 1 dm³ = 1 l.'), box(l, w, h, 'm'));
  }
  function volHard(rng) {
    const a = R(rng, 5, 12), b = R(rng, 3, a - 1), h = R(rng, 2, 6), water = a * b * h, c = h + R(rng, 2, 4);
    return lines(L(`Một bể cá dạng hình hộp chữ nhật có chiều dài ${a} dm, chiều rộng ${b} dm, chiều cao ${c} dm. Người ta đổ vào bể ${F(water)} l nước. Hỏi mực nước trong bể cao bao nhiêu đề-xi-mét?`, `A fish tank is a cuboid ${a} dm long, ${b} dm wide and ${c} dm high. ${F(water)} l of water is poured in. How many decimetres deep is the water?`),
      [[water, '', L(`Đổi: ${F(water)} l = ${F(water)} dm³.`, `Change: ${F(water)} l = ${F(water)} dm³.`)], [a * b, '', L(`Diện tích đáy bể: ${a} × ${b} = ${a * b} (dm²).`, `Area of the base: ${a} × ${b} = ${a * b} (dm²).`)],
        [h, 'dm', L(`Mực nước trong bể cao: ${F(water)} : ${a * b} = ${h} (dm).`, `Depth of the water: ${F(water)} : ${a * b} = ${h} (dm).`)]],
      L('Nước trong bể có dạng hình hộp chữ nhật cùng đáy với bể: chiều cao = thể tích : diện tích đáy.', 'The water is a cuboid with the same base as the tank: height = volume : area of the base.'));
  }

  // ================= 13. Cộng, trừ, nhân, chia số đo thời gian (Bài 57, 58) =================
  function tAdd(rng) {
    const h1 = R(rng, 6, 10), m1 = R(rng, 5, 11) * 5, h2 = R(rng, 1, 4), m2 = R(rng, 13 - m1 / 5, 11) * 5, mm = m1 + m2, Mi = mm - 60, H = h1 + h2 + 1;
    const [vi, en] = P(rng, [['Một ô tô khởi hành từ A lúc T1 và đi hết T2 thì đến B. Hỏi ô tô đến B lúc mấy giờ?', 'A car leaves A at T1. The journey to B takes T2. What time does the car reach B?'],
      ['Một đoàn tàu rời ga lúc T1 và chạy hết T2 thì đến ga tiếp theo. Hỏi tàu đến ga tiếp theo lúc mấy giờ?', 'A train leaves a station at T1. It takes T2 to reach the next station. What time does it get there?'],
      ['Buổi cắm trại bắt đầu lúc T1 và kéo dài T2. Hỏi buổi cắm trại kết thúc lúc mấy giờ?', 'A camping day starts at T1 and lasts T2. What time does it end?']]);
    const e = `${clk(h1, m1)} + ${hm(h2, m2)}`;
    const g = G(L(vi, en).replace('T1', clk(h1, m1)).replace('T2', hm(h2, m2)),
      [
        S(L('Biết lúc bắt đầu và khoảng thời gian. Tìm lúc kết thúc bằng phép tính nào?', 'You know the start time and how long it takes. Which calculation gives the end time?'), ch(rng, e, [`${clk(h1, m1)} ${M} ${hm(h2, m2)}`, `${clk(h1, m1)} × 2`]), L(`Lúc kết thúc = lúc bắt đầu + khoảng thời gian: ${e}.`, `End time = start time + time taken: ${e}.`)),
        S(L(`Cộng số giờ: ${h1} + ${h2} = ?`, `Add the hours: ${h1} + ${h2} = ?`), num(h1 + h2, HRS), L(`${h1} giờ + ${h2} giờ = ${h1 + h2} giờ.`, `${h1} hours + ${pl(h2, 'hour')} = ${h1 + h2} hours.`)),
        S(L(`Cộng số phút: ${m1} + ${m2} = ?`, `Add the minutes: ${m1} + ${m2} = ?`), num(mm, MINS), L(`${m1} phút + ${m2} phút = ${mm} phút. Vậy ${e} = ${h1 + h2} giờ ${mm} phút.`, `${m1} minutes + ${m2} minutes = ${mm} minutes. So ${e} = ${h1 + h2} hours ${mm} minutes.`)),
        S(L(`${mm} phút nhiều hơn 60 phút nên phải đổi: ${mm} phút = 1 giờ ? phút`, `${mm} minutes is more than 60 minutes, so change it: ${mm} minutes = 1 hour ? minutes`), num(Mi, MINS), L(`${mm} phút = 1 giờ ${Mi} phút.`, `${mm} minutes = 1 hour ${pl(Mi, 'minute')}.`), L(`Lấy ${mm} − 60.`, `Work out ${mm} − 60.`)),
        S(L(`Vậy ${h1 + h2} giờ ${mm} phút = ? giờ ${Mi} phút`, `So ${h1 + h2} hours ${mm} minutes = ? hours ${pl(Mi, 'minute')}`), num(H, HRS), L(`${h1 + h2} giờ ${mm} phút = ${H} giờ ${Mi} phút.`, `${h1 + h2} hours ${mm} minutes = ${H} hours ${pl(Mi, 'minute')}.`)),
      ],
      DS(clk(H, Mi)));
    g.t = H * 60 + Mi; g.noCarry = (h1 + h2) * 60 + Mi;
    return g;
  }
  function tSub(rng) {
    // start h2:m2, end h1:m1 with fewer minutes than the start, so that an hour must be changed into minutes
    const h2 = R(rng, 6, 9), m2 = R(rng, 4, 11) * 5, m1 = R(rng, 1, m2 / 5 - 1) * 5, h1 = h2 + R(rng, 2, 4), end = h1 * 60 + m1;
    const d = end - h2 * 60 - m2, dh = Math.floor(d / 60), dm = d % 60, name = DT.name(rng);
    const [vi, en] = P(rng, [[`Gia đình bạn ${name} đi từ nhà lúc T2 và về đến quê lúc T1. Hỏi gia đình bạn ${name} đi hết bao nhiêu thời gian?`, `${name}'s family leaves home at T2 and reaches their home village at T1. How long does the journey take?`],
      ['Một xe khách rời bến lúc T2 và đến nơi lúc T1 cùng ngày. Hỏi xe khách đi hết bao nhiêu thời gian?', 'A coach leaves at T2 and arrives at T1 on the same day. How long does the journey take?'],
      ['Buổi tham quan bảo tàng bắt đầu lúc T2 và kết thúc lúc T1. Hỏi buổi tham quan kéo dài bao nhiêu thời gian?', 'A museum visit starts at T2 and ends at T1. How long does the visit last?']]);
    const e = `${clk(h1, m1)} ${M} ${clk(h2, m2)}`, borrowed = hm(h1 - 1, m1 + 60);
    const g = G(L(vi, en).replace('T2', clk(h2, m2)).replace('T1', clk(h1, m1)),
      [
        S(L('Biết lúc bắt đầu và lúc kết thúc. Tìm khoảng thời gian bằng phép tính nào?', 'You know the start time and the end time. Which calculation gives the time taken?'), ch(rng, e, [`${clk(h1, m1)} + ${clk(h2, m2)}`, `${clk(h2, m2)} ${M} ${clk(h1, m1)}`]), L(`Khoảng thời gian = lúc kết thúc − lúc bắt đầu: ${e}.`, `Time taken = end time − start time: ${e}.`)),
        S(L(`${m1} phút không trừ được ${m2} phút. Ta làm thế nào?`, `You cannot take ${m2} minutes from ${pl(m1, 'minute')}. What do you do?`), ch(rng, L('Đổi 1 giờ = 60 phút', 'Change 1 hour into 60 minutes'), [L(`Lấy ${m2} ${M} ${m1}`, `Work out ${m2} ${M} ${m1}`), L('Bỏ số phút đi, chỉ trừ số giờ', 'Leave out the minutes and subtract the hours only')]),
          L(`Đổi 1 giờ = 60 phút: ${hm(h1, m1)} = ${borrowed}.`, `Change 1 hour into 60 minutes: ${hm(h1, m1)} = ${borrowed}.`)),
        S(L(`Trừ số phút: ${m1 + 60} ${M} ${m2} = ?`, `Subtract the minutes: ${m1 + 60} ${M} ${m2} = ?`), num(dm, MINS), L(`${m1 + 60} phút ${M} ${m2} phút = ${dm} phút.`, `${m1 + 60} minutes ${M} ${m2} minutes = ${pl(dm, 'minute')}.`)),
        S(L(`Trừ số giờ: ${h1 - 1} ${M} ${h2} = ?`, `Subtract the hours: ${h1 - 1} ${M} ${h2} = ?`), num(dh, HRS), L(`${h1 - 1} giờ ${M} ${h2} giờ = ${dh} giờ. Vậy ${e} = ${hm(dh, dm)}.`, `${h1 - 1} hours ${M} ${h2} hours = ${pl(dh, 'hour')}. So ${e} = ${hm(dh, dm)}.`)),
      ],
      DS(hm(dh, dm)));
    g.t = d; g.noBorrow = (h1 - h2) * 60 + (m2 - m1);
    return g;
  }
  function tMul(rng) {
    const [m, k] = P(rng, [[25, 3], [35, 2], [40, 2], [45, 2], [20, 4], [15, 5], [35, 3], [25, 4], [50, 2], [16, 5], [24, 3]]), h = R(rng, 1, 3), mk = m * k, Mi = mk - 60, H = h * k + 1;
    const [vi, en] = P(rng, [[`Một người thợ làm 1 sản phẩm hết ${hm(h, m)}. Hỏi người đó làm ${k} sản phẩm như thế hết bao nhiêu thời gian?`, `A worker takes ${hm(h, m)} to make 1 item. How long does the worker take to make ${k} items like this?`],
      [`Mỗi buổi tập đàn kéo dài ${hm(h, m)}. Hỏi ${k} buổi tập như thế kéo dài bao nhiêu thời gian?`, `Each music practice lasts ${hm(h, m)}. How long do ${k} practices like this last?`],
      [`Một máy bơm bơm đầy 1 bể nước hết ${hm(h, m)}. Hỏi máy bơm đó bơm đầy ${k} bể nước như thế hết bao nhiêu thời gian?`, `A pump takes ${hm(h, m)} to fill 1 tank. How long does it take to fill ${k} tanks like this?`]]);
    const e = `${hm(h, m)} × ${k}`;
    const g = G(L(vi, en),
      [
        S(L('Biết thời gian làm 1 lần. Tìm thời gian làm nhiều lần bằng phép tính nào?', 'You know the time for 1. Which calculation gives the time for several?'), ch(rng, e, [`${hm(h, m)} : ${k}`, `${hm(h, m)} + ${k}`]), L(`Nhân từng loại đơn vị với ${k}: ${e}.`, `Multiply each unit by ${k}: ${e}.`)),
        S(L(`Nhân số giờ: ${h} × ${k} = ?`, `Multiply the hours: ${h} × ${k} = ?`), num(h * k, HRS), L(`${h} giờ × ${k} = ${h * k} giờ.`, `${pl(h, 'hour')} × ${k} = ${h * k} hours.`)),
        S(L(`Nhân số phút: ${m} × ${k} = ?`, `Multiply the minutes: ${m} × ${k} = ?`), num(mk, MINS), L(`${m} phút × ${k} = ${mk} phút. Vậy ${e} = ${h * k} giờ ${mk} phút.`, `${m} minutes × ${k} = ${mk} minutes. So ${e} = ${h * k} hours ${mk} minutes.`)),
        S(L(`${mk} phút nhiều hơn 60 phút nên phải đổi: ${mk} phút = 1 giờ ? phút`, `${mk} minutes is more than 60 minutes, so change it: ${mk} minutes = 1 hour ? minutes`), num(Mi, MINS), L(`${mk} phút = 1 giờ ${Mi} phút.`, `${mk} minutes = 1 hour ${pl(Mi, 'minute')}.`)),
        S(L(`Vậy ${h * k} giờ ${mk} phút = ? giờ ${Mi} phút`, `So ${h * k} hours ${mk} minutes = ? hours ${pl(Mi, 'minute')}`), num(H, HRS), L(`${h * k} giờ ${mk} phút = ${H} giờ ${Mi} phút.`, `${h * k} hours ${mk} minutes = ${H} hours ${pl(Mi, 'minute')}.`)),
      ],
      DS(hm(H, Mi)));
    g.t = H * 60 + Mi; g.wrong = [h * k * 60 + Mi, h * k * 60 + m];
    return g;
  }
  const TG_ADD = L('Cộng giờ với giờ, phút với phút; số phút từ 60 trở lên thì đổi 60 phút = 1 giờ.', 'Add hours to hours and minutes to minutes; if there are 60 minutes or more, change 60 minutes into 1 hour.');
  const TG_SUB = L('Trừ giờ với giờ, phút với phút; số phút không đủ trừ thì đổi 1 giờ = 60 phút.', 'Subtract hours from hours and minutes from minutes; if there are not enough minutes, change 1 hour into 60 minutes.');
  function tgPlain5(rng, i) {
    if (i === 0) {
      const h1 = R(rng, 1, 9), m1 = R(rng, 4, 11) * 5, h2 = R(rng, 1, 5), m2 = R(rng, 13 - m1 / 5, 11) * 5, t = (h1 + h2) * 60 + m1 + m2;
      return Q(`${hm(h1, m1)} + ${hm(h2, m2)} = ?`, timeCh(rng, t, [(h1 + h2) * 60 + (m1 + m2) % 60]), L(`${hm(h1, m1)} + ${hm(h2, m2)} = ${h1 + h2} giờ ${m1 + m2} phút = ${tm(t)} (vì ${m1 + m2} phút = 1 giờ ${m1 + m2 - 60} phút).`, `${hm(h1, m1)} + ${hm(h2, m2)} = ${h1 + h2} hours ${m1 + m2} minutes = ${tm(t)} (because ${m1 + m2} minutes = 1 hour ${pl(m1 + m2 - 60, 'minute')}).`), { hint: TG_ADD });
    }
    if (i === 1) {
      const h2 = R(rng, 1, 4), m2 = R(rng, 5, 11) * 5, m1 = R(rng, 1, m2 / 5 - 1) * 5, h1 = h2 + R(rng, 2, 5), t = (h1 - h2) * 60 + m1 - m2;
      return Q(`${hm(h1, m1)} ${M} ${hm(h2, m2)} = ?`, timeCh(rng, t, [(h1 - h2) * 60 + (m2 - m1)]), L(`Đổi ${hm(h1, m1)} = ${h1 - 1} giờ ${m1 + 60} phút.\n${h1 - 1} giờ ${m1 + 60} phút ${M} ${hm(h2, m2)} = ${tm(t)}.`, `Change ${hm(h1, m1)} into ${h1 - 1} hours ${m1 + 60} minutes.\n${h1 - 1} hours ${m1 + 60} minutes ${M} ${hm(h2, m2)} = ${tm(t)}.`), { hint: TG_SUB });
    }
    if (i === 2) {
      const h = R(rng, 1, 4), m = R(rng, 3, 11) * 5, k = R(rng, 2, 5), t = (h * 60 + m) * k;
      return Q(`${hm(h, m)} × ${k} = ?`, timeCh(rng, t, [h * k * 60 + (m * k) % 60, h * k * 60 + m]), L(`${hm(h, m)} × ${k} = ${h * k} giờ ${m * k} phút${m * k >= 60 ? ` = ${tm(t)}` : ''}.`, `${hm(h, m)} × ${k} = ${h * k} hours ${m * k} minutes${m * k >= 60 ? ` = ${tm(t)}` : ''}.`), { hint: L('Nhân số giờ, nhân số phút với số đó; đổi phút ra giờ nếu từ 60 trở lên.', 'Multiply the hours and the minutes by the number; change minutes into hours if there are 60 or more.') });
    }
    const k = R(rng, 2, 5), qh = R(rng, 1, 3), q0 = R(rng, 2, 11) * 5, qm = (q0 * k) % 60 ? q0 : q0 + 5, t = (qh * 60 + qm) * k, H = Math.floor(t / 60), Mi = t % 60, rem = H % k;
    return Q(`${hm(H, Mi)} : ${k} = ?`, timeCh(rng, qh * 60 + qm, [Math.floor(H / k) * 60 + Math.floor(Mi / k), qh * 60 + qm + 30]),
      rem ? L(`${H} giờ : ${k} = ${Math.floor(H / k)} giờ (dư ${rem} giờ). Đổi ${rem} giờ = ${rem * 60} phút; ${rem * 60} + ${Mi} = ${rem * 60 + Mi} (phút); ${rem * 60 + Mi} : ${k} = ${qm} (phút).\nVậy ${hm(H, Mi)} : ${k} = ${hm(qh, qm)}.`, `${H} hours : ${k} = ${pl(Math.floor(H / k), 'hour')} (remainder ${pl(rem, 'hour')}). Change ${pl(rem, 'hour')} into ${rem * 60} minutes; ${rem * 60} + ${Mi} = ${rem * 60 + Mi} (minutes); ${rem * 60 + Mi} : ${k} = ${qm} (minutes).\nSo ${hm(H, Mi)} : ${k} = ${hm(qh, qm)}.`)
        : L(`${H} giờ : ${k} = ${H / k} giờ; ${Mi} phút : ${k} = ${Mi / k} phút.\nVậy ${hm(H, Mi)} : ${k} = ${hm(qh, qm)}.`, `${H} hours : ${k} = ${pl(H / k, 'hour')}; ${Mi} minutes : ${k} = ${Mi / k} minutes.\nSo ${hm(H, Mi)} : ${k} = ${hm(qh, qm)}.`),
      { hint: L('Chia số giờ trước; số giờ còn dư đổi ra phút, gộp với số phút rồi chia tiếp.', 'Divide the hours first; change any hours left over into minutes, add them to the minutes and divide again.') });
  }
  function tgVary5(rng, i) {
    if (i === 4) { const g = tAdd(rng); return toQ(g, TG_ADD, timeCh(rng, g.t, [g.noCarry, g.t + 30], ck)); }
    if (i === 5) { const g = tSub(rng); return toQ(g, TG_SUB, timeCh(rng, g.t, [g.noBorrow, g.t + 30])); }
    const g = tMul(rng); return toQ(g, L('Nhân số giờ, nhân số phút; đổi phút ra giờ nếu từ 60 trở lên.', 'Multiply the hours and the minutes; change minutes into hours if there are 60 or more.'), timeCh(rng, g.t, g.wrong));
  }
  function tgHard5(rng) {
    const h1 = R(rng, 6, 9), m1 = R(rng, 1, 11) * 5, d = R(rng, 1, 3) * 60 + R(rng, 3, 11) * 5, rest = P(rng, [15, 20, 25, 30, 45]), mid = h1 * 60 + m1 + d, end = mid + rest;
    return Q(L(`Một xe khách khởi hành lúc ${clk(h1, m1)}. Xe chạy trên đường hết ${tm(d)} và nghỉ dọc đường ${rest} phút. Hỏi xe khách đến nơi lúc mấy giờ?`, `A coach sets off at ${clk(h1, m1)}. It spends ${tm(d)} driving and stops for ${rest} minutes on the way. What time does the coach arrive?`), timeCh(rng, end, [mid, end - 60, end + rest], ck),
      L(`Thời gian xe đi và nghỉ: ${tm(d)} + ${rest} phút = ${tm(d + rest)}.\nXe đến nơi lúc: ${clk(h1, m1)} + ${tm(d + rest)} = ${ck(end)}.`, `Driving and stopping: ${tm(d)} + ${rest} minutes = ${tm(d + rest)}.\nArrival time: ${clk(h1, m1)} + ${tm(d + rest)} = ${ck(end)}.`),
      { hint: L('Cộng thời gian chạy với thời gian nghỉ, rồi cộng với giờ khởi hành.', 'Add the driving time and the stop, then add the total to the departure time.') });
  }

  // ================= 14–15. Vận tốc, quãng đường, thời gian của một chuyển động (Bài 59, 60) =================
  const VEH = [
    { veh: 'car', vi: 'Một ô tô', en: 'A car', s: L('ô tô', 'car'), lo: 20, hi: 30 },           // speeds = 2 × (lo…hi): always even
    { veh: 'car', vi: 'Một xe máy', en: 'A motorbike', s: L('xe máy', 'motorbike'), lo: 15, hi: 22 },
    { veh: 'bike', vi: 'Một người đi xe đạp', en: 'A cyclist', s: L('người đi xe đạp', 'cyclist'), lo: 6, hi: 9 },
    { veh: 'boat', vi: 'Một ca nô', en: 'A motorboat', s: L('ca nô', 'motorboat'), lo: 12, hi: 18 },
  ];
  const veh = rng => { const X = P(rng, VEH); return Object.assign({ v: R(rng, X.lo, X.hi) * 2 }, X); };
  const mot = (X, speed, time, distance) => vz('motion', Object.assign({ speed, unit: KMH, vehicle: X.veh }, time != null ? { time } : {}, distance != null ? { distance } : {}));
  // the speed from a distance and a time given as "h giờ 30 phút"
  function vtHalf(rng) {
    const X = veh(rng), h = R(rng, 1, 4), t = h + 0.5, s = X.v * t;
    return G(L(`${X.vi} đi quãng đường ${F(s)} km hết ${hm(h, 30)}. Tính vận tốc của ${X.s}.`, `${X.en} travels ${F(s)} km in ${hm(h, 30)}. Find the speed of the ${X.s}.`),
      [
        S(L('Muốn tìm vận tốc, ta làm thế nào?', 'How do you find the speed?'), ch(rng, L('Quãng đường : thời gian', 'Distance : time'), [L('Quãng đường × thời gian', 'Distance × time'), L('Thời gian : quãng đường', 'Time : distance')]), 'v = s : t.'),
        S(L(`Đổi thời gian ra giờ: ${hm(h, 30)} = ? giờ`, `Change the time to hours: ${hm(h, 30)} = ? hours`), num(t, HRS), L(`30 phút = 0,5 giờ nên ${hm(h, 30)} = ${F(t)} giờ.`, `30 minutes = 0,5 hours, so ${hm(h, 30)} = ${F(t)} hours.`), L('30 phút là nửa giờ, tức 0,5 giờ.', '30 minutes is half an hour: 0,5 hours.')),
        S(`${F(s)} : ${F(t)} = ?`, num(X.v, KMH), L(`Vận tốc của ${X.s}: ${F(s)} : ${F(t)} = ${X.v} (km/giờ).`, `Speed of the ${X.s}: ${F(s)} : ${F(t)} = ${X.v} (km/h).`)),
      ],
      DS(`${X.v} ${KMH}`), mot(X, '?', t, s));
  }
  // the speed when the departure and arrival times are given
  function vtClock(rng) {
    const X = veh(rng), dep = R(rng, 6, 9) * 60 + P(rng, [0, 30]), tt = P(rng, [90, 150, 210]), arr = dep + tt, t = tt / 60, s = X.v * t;
    return G(L(`${X.vi} đi từ A lúc ${ck(dep)} và đến B lúc ${ck(arr)}. Quãng đường AB dài ${F(s)} km. Tính vận tốc của ${X.s}.`, `${X.en} leaves A at ${ck(dep)} and reaches B at ${ck(arr)}. The distance from A to B is ${F(s)} km. Find the speed of the ${X.s}.`),
      [
        S(L('Đã biết quãng đường. Trước hết phải tìm gì?', 'You know the distance. What must you find first?'), ch(rng, L('Thời gian đi từ A đến B', 'The time taken from A to B'), [L('Giờ khởi hành', 'The departure time'), L('Quãng đường AB', 'The distance from A to B')]), L('Vận tốc = quãng đường : thời gian, nên cần tìm thời gian đi.', 'Speed = distance : time, so you need the time taken.')),
        S(L(`Thời gian đi: ${ck(arr)} ${M} ${ck(dep)} = ${tm(tt)} = ? giờ`, `Time taken: ${ck(arr)} ${M} ${ck(dep)} = ${tm(tt)} = ? hours`), num(t, HRS), L(`Thời gian đi: ${ck(arr)} ${M} ${ck(dep)} = ${tm(tt)} = ${F(t)} giờ.`, `Time taken: ${ck(arr)} ${M} ${ck(dep)} = ${tm(tt)} = ${F(t)} hours.`)),
        S(`${F(s)} : ${F(t)} = ?`, num(X.v, KMH), L(`Vận tốc của ${X.s}: ${F(s)} : ${F(t)} = ${X.v} (km/giờ).`, `Speed of the ${X.s}: ${F(s)} : ${F(t)} = ${X.v} (km/h).`)),
      ],
      DS(`${X.v} ${KMH}`), mot(X, '?', t, s));
  }
  // a runner: metres and "1 phút 20 giây" → m/giây
  function vtRun(rng) {
    const v = P(rng, [3, 4, 5, 6]), sec = R(rng, 13, 23) * 5, ss = v * sec, vv = v, name = DT.name(rng), [act, actE] = P(rng, [['chạy', 'runs'], ['đạp xe', 'cycles'], ['trượt pa-tanh', 'skates']]);
    return G(L(`${name} ${act} ${F(ss)} m hết 1 phút ${sec - 60} giây. Tính vận tốc của ${name} theo m/giây.`, `${name} ${actE} ${F(ss)} m in 1 minute ${sec - 60} seconds. Find ${name}'s speed in m/s.`),
      [
        S(L('Vận tốc tính theo m/giây. Trước hết ta làm gì?', 'The speed is in m/s. What do you do first?'), ch(rng, L('Đổi thời gian ra giây', 'Change the time to seconds'), [L('Đổi quãng đường ra ki-lô-mét', 'Change the distance to kilometres'), L('Đổi thời gian ra giờ', 'Change the time to hours')]), L('Đơn vị m/giây: quãng đường tính bằng mét, thời gian tính bằng giây.', 'For m/s the distance is in metres and the time is in seconds.')),
        S(L(`1 phút ${sec - 60} giây = ? giây`, `1 minute ${sec - 60} seconds = ? seconds`), num(sec, L('giây', 'seconds')), L(`1 phút ${sec - 60} giây = 60 giây + ${sec - 60} giây = ${sec} giây.`, `1 minute ${sec - 60} seconds = 60 seconds + ${sec - 60} seconds = ${sec} seconds.`)),
        S(`${F(ss)} : ${sec} = ?`, num(vv, L('m/giây', 'm/s')), L(`Vận tốc của ${name}: ${F(ss)} : ${sec} = ${F(vv)} (m/giây).`, `${name}'s speed: ${F(ss)} : ${sec} = ${F(vv)} (m/s).`)),
      ],
      DS(`${F(vv)} ${L('m/giây', 'm/s')}`));
  }
  const VT_HINT = L('v = s : t. Đổi thời gian về một đơn vị đo trước (1 giờ 30 phút = 1,5 giờ).', 'v = s : t. Change the time to one unit first (1 hour 30 minutes = 1,5 hours).');
  function vtPlain(rng, i) {
    if (i === 3) return toQ(vtHalf(rng), VT_HINT);
    if (i === 2) { const sec = R(rng, 10, 25), v = R(rng, 4, 8), m = sec * v; return Q(L(`Một vận động viên chạy ${m} m hết ${sec} giây. Tính vận tốc chạy của vận động viên đó.`, `A runner runs ${m} m in ${sec} seconds. Find the runner's speed.`), num(v, L('m/giây', 'm/s')), L(`Vận tốc chạy: ${m} : ${sec} = ${v} (m/giây).`, `Speed: ${m} : ${sec} = ${v} (m/s).`), { hint: 'v = s : t.', visual: vz('motion', { speed: '?', unit: L('m/giây', 'm/s'), distance: m, vehicle: 'walk' }) }); }
    const X = veh(rng), t = i === 0 ? R(rng, 2, 5) : P(rng, [1.5, 2.5, 3.5, 0.5]), s = X.v * t;
    return Q(L(`${X.vi} đi được ${F(s)} km trong ${F(t)} giờ. Tính vận tốc của ${X.s}.`, `${X.en} travels ${F(s)} km in ${F(t)} hours. Find the speed of the ${X.s}.`), num(X.v, KMH), L(`Vận tốc của ${X.s}: ${F(s)} : ${F(t)} = ${X.v} (km/giờ).`, `Speed of the ${X.s}: ${F(s)} : ${F(t)} = ${X.v} (km/h).`), { hint: 'v = s : t.', visual: mot(X, '?', t, s) });
  }
  function vtVary(rng, i) {
    if (i === 4) return toQ(vtClock(rng), VT_HINT);
    if (i === 5) {
      const X = veh(rng), [min, t] = P(rng, [[15, 0.25], [30, 0.5], [45, 0.75], [12, 0.2], [24, 0.4], [36, 0.6]]), v = X.v % 4 ? X.v + 2 : X.v, s = rd(v * t, 2);
      return lines(L(`${X.vi} đi được ${F(s)} km trong ${min} phút. Tính vận tốc của ${X.s} theo km/giờ.`, `${X.en} travels ${F(s)} km in ${min} minutes. Find the speed of the ${X.s} in km/h.`),
        [[t, '', L(`Đổi: ${min} phút = ${min} : 60 giờ = ${F(t)} giờ.`, `Change: ${min} minutes = ${min} : 60 hours = ${F(t)} hours.`)], [v, KMH, L(`Vận tốc của ${X.s}: ${F(s)} : ${F(t)} = ${v} (km/giờ).`, `Speed of the ${X.s}: ${F(s)} : ${F(t)} = ${v} (km/h).`)]],
        L('Đổi số phút ra giờ: lấy số phút chia cho 60.', 'Change the minutes to hours: divide the minutes by 60.'));
    }
    const name = DT.name(rng), v = R(rng, 12, 16) * 5, min = R(rng, 8, 20), s = v * min;
    return Q(L(`${name} đi bộ từ nhà đến trường dài ${F(s)} m hết ${min} phút. Tính vận tốc đi bộ của ${name} theo m/phút.`, `${name} walks ${F(s)} m from home to school in ${min} minutes. Find ${name}'s walking speed in m/min.`), num(v, L('m/phút', 'm/min')),
      L(`Vận tốc đi bộ của ${name}: ${F(s)} : ${min} = ${v} (m/phút).`, `${name}'s walking speed: ${F(s)} : ${min} = ${v} (m/min).`), { hint: 'v = s : t.' });
  }
  function vtHard(rng) {
    const v = P(rng, [18, 36, 54, 72, 90]), X = P(rng, [VEH[0], VEH[1]]);
    return lines(L(`${X.vi} đi với vận tốc ${v} km/giờ. Hỏi vận tốc đó bằng bao nhiêu mét trên giây (m/giây)?`, `${X.en} travels at ${v} km/h. What is this speed in metres per second (m/s)?`),
      [[v * 1000, '', L(`Trong 1 giờ ${X.s} đi được: ${v} km = ${F(v * 1000)} m.`, `In 1 hour the ${X.s} travels: ${v} km = ${F(v * 1000)} m.`)], [3600, '', L('1 giờ = 3600 giây.', '1 hour = 3600 seconds.')],
        [v * 5 / 18, L('m/giây', 'm/s'), L(`Vận tốc của ${X.s}: ${F(v * 1000)} : 3600 = ${v * 5 / 18} (m/giây).`, `Speed of the ${X.s}: ${F(v * 1000)} : 3600 = ${v * 5 / 18} (m/s).`)]],
      L('Đổi ki-lô-mét ra mét và giờ ra giây, rồi lấy quãng đường chia cho thời gian.', 'Change kilometres to metres and hours to seconds, then divide the distance by the time.'));
  }
  // the distance from the speed and a time "h giờ m phút"
  function qdDist(rng) {
    const X = veh(rng), h = R(rng, 1, 3), [min, f] = X.v % 4 === 0 ? P(rng, [[30, 0.5], [15, 0.25], [45, 0.75]]) : [30, 0.5], t = h + f, s = rd(X.v * t, 2);
    return G(L(`${X.vi} đi với vận tốc ${X.v} km/giờ trong ${hm(h, min)}. Tính quãng đường ${X.s} đã đi được.`, `${X.en} travels at ${X.v} km/h for ${hm(h, min)}. Find the distance the ${X.s} travels.`),
      [
        S(L('Muốn tìm quãng đường, ta làm thế nào?', 'How do you find the distance?'), ch(rng, L('Vận tốc × thời gian', 'Speed × time'), [L('Vận tốc : thời gian', 'Speed : time'), L('Thời gian : vận tốc', 'Time : speed')]), 's = v × t.'),
        S(L(`Vận tốc tính theo km/giờ nên đổi thời gian ra giờ: ${hm(h, min)} = ? giờ`, `The speed is in km/h, so change the time to hours: ${hm(h, min)} = ? hours`), num(t, HRS), L(`${min} phút = ${F(f)} giờ nên ${hm(h, min)} = ${F(t)} giờ.`, `${min} minutes = ${F(f)} hours, so ${hm(h, min)} = ${F(t)} hours.`), L(`${min} phút = ${min} : 60 giờ.`, `${min} minutes = ${min} : 60 hours.`)),
        S(`${X.v} × ${F(t)} = ?`, num(s, 'km'), L(`Quãng đường ${X.s} đi được: ${X.v} × ${F(t)} = ${F(s)} (km).`, `Distance travelled: ${X.v} × ${F(t)} = ${F(s)} (km).`)),
      ],
      DS(`${F(s)} km`), mot(X, X.v, t, '?'));
  }
  // the time, then the arrival time
  function qdArrive(rng) {
    const X = veh(rng), dep = R(rng, 6, 9) * 60 + P(rng, [0, 15, 30]), h = R(rng, 1, 3), t = h + 0.5, s = X.v * t, arr = dep + h * 60 + 30;
    const g = G(L(`${X.vi} khởi hành từ A lúc ${ck(dep)} và đi đến B với vận tốc ${X.v} km/giờ. Quãng đường AB dài ${F(s)} km. Hỏi ${X.s} đến B lúc mấy giờ?`, `${X.en} leaves A at ${ck(dep)} and travels to B at ${X.v} km/h. The distance from A to B is ${F(s)} km. What time does the ${X.s} reach B?`),
      [
        S(L('Muốn tìm thời gian đi, ta làm thế nào?', 'How do you find the time taken?'), ch(rng, L('Quãng đường : vận tốc', 'Distance : speed'), [L('Quãng đường × vận tốc', 'Distance × speed'), L('Vận tốc : quãng đường', 'Speed : distance')]), 't = s : v.'),
        S(L(`Thời gian đi: ${F(s)} : ${X.v} = ? giờ`, `Time taken: ${F(s)} : ${X.v} = ? hours`), num(t, HRS), L(`Thời gian ${X.s} đi từ A đến B: ${F(s)} : ${X.v} = ${F(t)} (giờ).`, `Time taken from A to B: ${F(s)} : ${X.v} = ${F(t)} (hours).`)),
        S(L(`${F(t)} giờ = ${h} giờ ? phút`, `${F(t)} hours = ${pl(h, 'hour')} ? minutes`), num(30, MINS), L(`0,5 giờ = 30 phút nên ${F(t)} giờ = ${hm(h, 30)}.`, `0,5 hours = 30 minutes, so ${F(t)} hours = ${hm(h, 30)}.`), L('Lấy 0,5 × 60.', 'Work out 0,5 × 60.')),
        S(L(`${X.s[0].toUpperCase() + X.s.slice(1)} đến B lúc: ${ck(dep)} + ${hm(h, 30)} = ?`, `Arrival time: ${ck(dep)} + ${hm(h, 30)} = ?`), timeCh(rng, arr, [dep + h * 60 + 50, arr + 60, arr - 30], ck), L(`${X.s[0].toUpperCase() + X.s.slice(1)} đến B lúc: ${ck(dep)} + ${hm(h, 30)} = ${ck(arr)}.`, `Arrival time: ${ck(dep)} + ${hm(h, 30)} = ${ck(arr)}.`)),
      ],
      DS(ck(arr)), mot(X, X.v, null, s));
    return g;
  }
  const QD_HINT = L('s = v × t; t = s : v. Vận tốc tính theo km/giờ thì thời gian tính bằng giờ.', 's = v × t; t = s : v. If the speed is in km/h, the time is in hours.');
  function qdPlain(rng, i) {
    const X = veh(rng), t = i % 2 === 0 ? R(rng, 2, 5) : P(rng, [1.5, 2.5, 3.5, 0.5]), s = X.v * t;
    if (i < 2) return Q(L(`${X.vi} đi với vận tốc ${X.v} km/giờ trong ${F(t)} giờ. Tính quãng đường ${X.s} đã đi được.`, `${X.en} travels at ${X.v} km/h for ${F(t)} hours. Find the distance the ${X.s} travels.`), num(s, 'km'), L(`Quãng đường ${X.s} đi được: ${X.v} × ${F(t)} = ${F(s)} (km).`, `Distance travelled: ${X.v} × ${F(t)} = ${F(s)} (km).`), { hint: 's = v × t.', visual: mot(X, X.v, t, '?') });
    return Q(L(`${X.vi} đi quãng đường ${F(s)} km với vận tốc ${X.v} km/giờ. Tính thời gian ${X.s} đã đi.`, `${X.en} travels ${F(s)} km at ${X.v} km/h. Find the time taken.`), num(t, HRS), L(`Thời gian ${X.s} đã đi: ${F(s)} : ${X.v} = ${F(t)} (giờ).`, `Time taken: ${F(s)} : ${X.v} = ${F(t)} (hours).`), { hint: 't = s : v.', visual: mot(X, X.v, null, s) });
  }
  function qdVary(rng, i) {
    if (i === 4) return toQ(qdDist(rng), QD_HINT);
    if (i === 6) return toQ(qdArrive(rng), QD_HINT);
    const X = veh(rng), [min, t] = P(rng, [[15, 0.25], [30, 0.5], [45, 0.75], [12, 0.2], [24, 0.4], [36, 0.6], [48, 0.8]]), v = X.v % 4 ? X.v + 2 : X.v, s = rd(v * t, 2);
    return lines(L(`${X.vi} đi quãng đường ${F(s)} km với vận tốc ${v} km/giờ. Hỏi ${X.s} đi quãng đường đó hết bao nhiêu phút?`, `${X.en} travels ${F(s)} km at ${v} km/h. How many minutes does the journey take?`),
      [[t, '', L(`Thời gian đi: ${F(s)} : ${v} = ${F(t)} (giờ).`, `Time taken: ${F(s)} : ${v} = ${F(t)} (hours).`)], [min, MINS, L(`Đổi: ${F(t)} giờ = ${F(t)} × 60 phút = ${min} phút.`, `Change: ${F(t)} hours = ${F(t)} × 60 minutes = ${min} minutes.`)]],
      L('Tìm thời gian theo giờ, rồi nhân với 60 để đổi ra phút.', 'Find the time in hours, then multiply by 60 to change it to minutes.'));
  }
  function qdHard(rng) {
    const X = veh(rng), dep = R(rng, 6, 8) * 60 + P(rng, [0, 30]), drive = R(rng, 3, 6) * 30, rest = P(rng, [15, 30]), arr = dep + drive + rest, t = drive / 60, s = X.v * t;
    return lines(L(`${X.vi} khởi hành từ A lúc ${ck(dep)} và đến B lúc ${ck(arr)}. Dọc đường ${X.s} nghỉ ${rest} phút. Biết vận tốc của ${X.s} là ${X.v} km/giờ. Tính quãng đường AB.`, `${X.en} leaves A at ${ck(dep)} and reaches B at ${ck(arr)}. On the way the ${X.s} stops for ${rest} minutes. The speed of the ${X.s} is ${X.v} km/h. Find the distance from A to B.`),
      [[drive + rest, '', L(`Thời gian từ lúc khởi hành đến lúc tới B: ${ck(arr)} ${M} ${ck(dep)} = ${tm(drive + rest)}.`, `Time from leaving A to reaching B: ${ck(arr)} ${M} ${ck(dep)} = ${tm(drive + rest)}.`)],
        [t, '', L(`Thời gian ${X.s} đi trên đường: ${tm(drive + rest)} ${M} ${rest} phút = ${tm(drive)}${drive % 60 ? ` = ${F(t)} giờ` : ''}.`, `Time spent travelling: ${tm(drive + rest)} ${M} ${rest} minutes = ${tm(drive)}${drive % 60 ? ` = ${F(t)} hours` : ''}.`)],
        [s, 'km', L(`Quãng đường AB: ${X.v} × ${F(t)} = ${F(s)} (km).`, `Distance from A to B: ${X.v} × ${F(t)} = ${F(s)} (km).`)]],
      L('Thời gian đi = thời gian từ lúc khởi hành đến lúc tới nơi − thời gian nghỉ.', 'Travelling time = time from start to arrival − the stop.'));
  }

  DT.add(5, [
    // ---------------- Học kì I ----------------
    { id: 'g5-dt-cong-tru-tp', sem: 1, icon: '➕', lesson: 'g5-c4-b20',
      title: L('Bài toán về cộng, trừ số thập phân', 'Word problems: adding and subtracting decimals'),
      spot: L('Bài toán có các số đo là số thập phân (mét, ki-lô-gam, lít…) và hỏi "tất cả", "cả hai" (phép cộng) hoặc "còn lại", "hơn, kém bao nhiêu" (phép trừ).', 'The problem has measurements that are decimals (metres, kilograms, litres…) and asks "altogether", "both" (add) or "left", "how much more or less" (subtract).'),
      steps: [
        L('Bước 1: Đọc đề, chọn phép tính: gộp lại thì cộng; bớt đi, so sánh thì trừ.', 'Step 1: Read the problem and choose the operation: add to put together; subtract to take away or compare.'),
        L('Bước 2: Đặt tính: viết các dấu phẩy thẳng cột với nhau; thiếu chữ số ở phần thập phân thì viết thêm 0.', 'Step 2: Set it out with the decimal commas lined up; write extra zeros where a decimal place is missing.'),
        L('Bước 3: Cộng (trừ) như các số tự nhiên, rồi viết dấu phẩy ở kết quả thẳng cột với các dấu phẩy ở trên.', 'Step 3: Add (subtract) as with whole numbers, then put the comma in the answer under the other commas.'),
      ],
      tip: L('Dễ nhầm: tính 15,4 − 3,75 mà viết 4 thẳng cột với 5. Hãy viết 15,4 = 15,40 rồi mới trừ.', 'A common mistake: in 15,4 − 3,75, lining up the 4 with the 5. Write 15,4 as 15,40 first, then subtract.'),
      guide: rng => (R(rng, 0, 1) ? ctLeft(rng) : ctMore(rng)),
      practice: prac(ctPlain, ctVary, ctHard) },

    { id: 'g5-dt-nhan-tp', sem: 1, icon: '✖️', lesson: 'g5-c4-b21',
      title: L('Bài toán về nhân số thập phân', 'Word problems: multiplying decimals'),
      spot: L('Bài toán cho giá trị của một phần là số thập phân (1 l dầu nặng 0,8 kg; 1 m vải giá 45,5 nghìn đồng) và hỏi nhiều phần; hoặc tính diện tích, chu vi với số đo là số thập phân.', 'The problem gives the value of one part as a decimal (1 l of oil weighs 0,8 kg; 1 m of cloth costs 45,5 thousand dong) and asks for several parts; or it asks for an area or perimeter with decimal measurements.'),
      steps: [
        L('Bước 1: Xác định giá trị của 1 phần và số phần: làm phép nhân.', 'Step 1: Find the value of 1 part and the number of parts: multiply.'),
        L('Bước 2: Nhân như nhân các số tự nhiên (chưa để ý dấu phẩy).', 'Step 2: Multiply as with whole numbers (ignore the commas for now).'),
        L('Bước 3: Đếm xem phần thập phân của cả hai thừa số có bao nhiêu chữ số, rồi dùng dấu phẩy tách ở tích ra bấy nhiêu chữ số kể từ phải sang trái.', 'Step 3: Count the decimal places of both factors together, then count that many digits from the right of the product and put the comma there.'),
      ],
      tip: L('Dễ nhầm: đặt dấu phẩy ở tích thẳng cột như phép cộng. Phép nhân thì phải đếm số chữ số ở phần thập phân của cả hai thừa số.', 'A common mistake: lining the comma up as in addition. In multiplication, count the decimal places of both factors.'),
      guide: rng => nhForm(rng, R(rng, 0, 4)),
      practice: prac((rng, i) => toQ(nhForm(rng, [3, R(rng, 0, 1), 2, 4][i]), NH_HINT), nhVary, nhHard) },

    { id: 'g5-dt-chia-tp', sem: 1, icon: '➗', lesson: 'g5-c4-b22',
      title: L('Bài toán về chia số thập phân', 'Word problems: dividing decimals'),
      spot: L('Bài toán cho giá trị của nhiều phần và hỏi một phần (chia đều), hoặc hỏi "được bao nhiêu phần" (mỗi bộ quần áo may hết 2,8 m vải; có 33,6 m vải thì may được mấy bộ), với số đo là số thập phân.', 'The problem gives the value of several parts and asks for one part (sharing equally), or asks "how many parts" (each outfit needs 2,8 m of cloth; how many outfits from 33,6 m), with decimal measurements.'),
      steps: [
        L('Bước 1: Xác định phép chia: chia đều thành mấy phần, hoặc mỗi phần là bao nhiêu.', 'Step 1: Find the division: sharing into how many parts, or how much each part is.'),
        L('Bước 2: Chia cho số tự nhiên: chia như số tự nhiên; viết dấu phẩy vào thương trước khi hạ chữ số đầu tiên ở phần thập phân.', 'Step 2: Dividing by a whole number: divide as with whole numbers; put the comma in the quotient before you bring down the first decimal digit.'),
        L('Bước 3: Chia cho số thập phân: phần thập phân của số chia có bao nhiêu chữ số thì chuyển dấu phẩy của số bị chia sang phải bấy nhiêu chữ số, bỏ dấu phẩy ở số chia rồi chia.', 'Step 3: Dividing by a decimal: move the comma of the dividend to the right as many places as the divisor has decimal places, drop the comma of the divisor, then divide.'),
      ],
      tip: L('Dễ nhầm: chỉ bỏ dấu phẩy ở số chia mà quên chuyển dấu phẩy ở số bị chia. Phải làm ở cả hai số: 2,52 : 1,2 = 25,2 : 12.', 'A common mistake: dropping the comma of the divisor but forgetting to move the comma of the dividend. Do both: 2,52 : 1,2 = 25,2 : 12.'),
      guide: rng => (R(rng, 0, 1) ? chCount(rng) : chShare(rng)),
      practice: prac(chPlain, chVary, chHard, ['g5-nc-tim-x', 'g5-nc-tt-thapphan'], DT.hasDivision) },

    { id: 'g5-dt-tam-giac', sem: 1, icon: '🔺', lesson: 'g5-c5-b25',
      title: L('Diện tích hình tam giác', 'Area of a triangle'),
      spot: L('Bài toán cho độ dài đáy và chiều cao của một hình tam giác (tấm bìa, mảnh đất, cánh buồm…) và hỏi diện tích; hoặc cho diện tích và hỏi đáy hay chiều cao.', 'The problem gives the base and the height of a triangle (a card, a plot of land, a sail…) and asks for the area; or it gives the area and asks for the base or the height.'),
      steps: [
        L('Bước 1: Tìm độ dài đáy và chiều cao; đổi về cùng một đơn vị đo.', 'Step 1: Find the base and the height; change them to the same unit.'),
        L('Bước 2: Lấy độ dài đáy nhân với chiều cao.', 'Step 2: Multiply the base by the height.'),
        L('Bước 3: Chia kết quả cho 2: S = a × h : 2.', 'Step 3: Divide the result by 2: S = a × h : 2.'),
      ],
      tip: L('Dễ nhầm: quên chia cho 2. Hình tam giác chỉ bằng một nửa hình chữ nhật có cùng đáy và chiều cao.', 'A common mistake: forgetting to divide by 2. A triangle is only half of the rectangle with the same base and height.'),
      guide: rng => (R(rng, 0, 2) ? tgBasic(rng, R(rng, 0, 1) === 1) : tgUnits(rng)),
      practice: prac(tgPlain, tgVary, tgHard, ['g5-nc-tam-giac']) },

    { id: 'g5-dt-hinh-thang', sem: 1, icon: '📐', lesson: 'g5-c5-b26',
      title: L('Diện tích hình thang', 'Area of a trapezium'),
      spot: L('Bài toán cho độ dài hai đáy (đáy lớn, đáy bé) và chiều cao của một hình thang, hỏi diện tích; hoặc cho diện tích, hỏi chiều cao.', 'The problem gives the two bases (long and short) and the height of a trapezium and asks for the area; or it gives the area and asks for the height.'),
      steps: [
        L('Bước 1: Tìm đáy lớn, đáy bé, chiều cao; đổi về cùng một đơn vị đo.', 'Step 1: Find the long base, the short base and the height; change them to the same unit.'),
        L('Bước 2: Cộng độ dài hai đáy.', 'Step 2: Add the two bases.'),
        L('Bước 3: Nhân tổng đó với chiều cao.', 'Step 3: Multiply the sum by the height.'),
        L('Bước 4: Chia cho 2: S = (a + b) × h : 2.', 'Step 4: Divide by 2: S = (a + b) × h : 2.'),
      ],
      tip: L('Dễ nhầm: chỉ nhân một đáy với chiều cao, hoặc quên chia cho 2. Nhớ: tổng hai đáy nhân chiều cao rồi chia đôi.', 'A common mistake: multiplying only one base by the height, or forgetting to divide by 2. Remember: the sum of the bases times the height, then halve.'),
      guide: rng => htForm(rng, R(rng, 0, 1) === 1, R(rng, 0, 3) === 0),
      practice: prac(htPlain, htVary, htHard, ['g5-nc-hinh-thang']) },

    { id: 'g5-dt-hinh-tron', sem: 1, icon: '⭕', lesson: 'g5-c5-b27',
      title: L('Chu vi và diện tích hình tròn', 'Circumference and area of a circle'),
      spot: L('Bài toán nói về hình tròn (mặt bàn, bánh xe, bồn hoa, miệng giếng…), cho bán kính r hoặc đường kính d, hỏi chu vi (đường viền, một vòng lăn) hoặc diện tích (bề mặt).', 'The problem is about a circle (a table top, a wheel, a flower bed, the mouth of a well…). It gives the radius r or the diameter d and asks for the circumference (the edge, one turn) or the area (the surface).'),
      steps: [
        L('Bước 1: Xem đề cho bán kính hay đường kính (d = r × 2; r = d : 2).', 'Step 1: See whether the problem gives the radius or the diameter (d = r × 2; r = d : 2).'),
        L('Bước 2: Chu vi: C = d × 3,14 (hoặc C = r × 2 × 3,14).', 'Step 2: Circumference: C = d × 3,14 (or C = r × 2 × 3,14).'),
        L('Bước 3: Diện tích: S = r × r × 3,14.', 'Step 3: Area: S = r × r × 3,14.'),
      ],
      tip: L('Dễ nhầm: tính diện tích bằng đường kính. Diện tích luôn dùng bán kính: nếu đề cho d thì tìm r = d : 2 trước.', 'A common mistake: using the diameter for the area. The area always uses the radius: if you are given d, find r = d : 2 first.'),
      guide: rng => (R(rng, 0, 1) ? trArea(rng) : trCirc(rng)),
      practice: prac(trPlain, trVary, trHard, ['g5-nc-banh-xe', 'g5-nc-vuon-ao']) },

    // ---------------- Học kì II ----------------
    { id: 'g5-dt-ti-le-ban-do', sem: 2, icon: '🗺️', lesson: 'g5-c7-b37',
      title: L('Bài toán về tỉ lệ bản đồ', 'Map scale problems'),
      spot: L('Bài toán cho tỉ lệ bản đồ (1 : 1000, 1 : 500 000…) và độ dài trên bản đồ, hỏi độ dài thật; hoặc cho độ dài thật, hỏi độ dài trên bản đồ.', 'The problem gives a map scale (1 : 1000, 1 : 500 000…) and a length on the map and asks for the real length; or it gives the real length and asks for the length on the map.'),
      steps: [
        L('Bước 1: Đọc tỉ lệ: 1 : 1000 nghĩa là 1 cm trên bản đồ ứng với 1000 cm trên thực tế.', 'Step 1: Read the scale: 1 : 1000 means that 1 cm on the map stands for 1000 cm in real life.'),
        L('Bước 2: Tìm độ dài thật: lấy độ dài trên bản đồ nhân với mẫu số tỉ lệ. Tìm độ dài trên bản đồ: đổi độ dài thật ra xăng-ti-mét rồi chia cho mẫu số tỉ lệ.', 'Step 2: Real length = length on the map × the scale number. Length on the map = real length in centimetres : the scale number.'),
        L('Bước 3: Đổi kết quả ra đơn vị phù hợp (m, km).', 'Step 3: Change the answer to a suitable unit (m, km).'),
      ],
      tip: L('Dễ nhầm đơn vị: kết quả của phép nhân là xăng-ti-mét. Nhớ 100 cm = 1 m; 100 000 cm = 1 km.', 'Watch the units: the result of the multiplication is in centimetres. Remember 100 cm = 1 m; 100 000 cm = 1 km.'),
      guide: rng => (R(rng, 0, 2) ? bdReal(rng, R(rng, 0, 2) === 0, false) : bdMap(rng, false)),
      practice: prac(bdPlain, bdVary, bdHard, ['g5-nc-ban-do']) },

    { id: 'g5-dt-tong-ti', sem: 2, icon: '🧮', lesson: 'g5-c7-b38',
      title: L('Tìm hai số khi biết tổng và tỉ số của hai số đó', 'Finding two numbers from their sum and ratio'),
      spot: L('Bài toán cho biết tổng của hai số (cả hai, tất cả) và tỉ số của chúng (số này bằng 2/3 số kia, gấp 3 lần số kia), rồi hỏi mỗi số.', 'The problem gives the sum of two numbers (altogether, in total) and their ratio (one is 2/3 of the other, or 3 times the other), then asks for each number.'),
      steps: [
        L('Bước 1: Vẽ sơ đồ đoạn thẳng: tỉ số 2/3 thì số bé 2 phần, số lớn 3 phần bằng nhau.', 'Step 1: Draw a bar model: with a ratio of 2/3, the smaller number is 2 parts and the bigger number is 3 equal parts.'),
        L('Bước 2: Tìm tổng số phần bằng nhau.', 'Step 2: Find the total number of equal parts.'),
        L('Bước 3: Tìm giá trị một phần: lấy tổng chia cho tổng số phần.', 'Step 3: Find the value of one part: the sum divided by the total number of parts.'),
        L('Bước 4: Tìm từng số: lấy giá trị một phần nhân với số phần của số đó.', 'Step 4: Find each number: one part times its number of parts.'),
      ],
      tip: L('Dễ nhầm: lấy tổng chia cho số phần của một số. Phải chia cho tổng số phần của cả hai số.', 'A common mistake: dividing the sum by the parts of one number only. Divide by the total number of parts of both numbers.'),
      guide: rng => tiForm(rng, 'S', R(rng, 0, 4), 0),
      practice: prac((rng, i) => toQ(tiForm(rng, 'S', [0, 0, P(rng, [1, 2]), 5][i], i === 0 ? 2 : i === 1 ? 1 : R(rng, 1, 2)), TT_HINT), ttVary, rng => tiArea(rng, 'S'), ['g5-nc-tong-ti']) },

    { id: 'g5-dt-hieu-ti', sem: 2, icon: '📏', lesson: 'g5-c7-b39',
      title: L('Tìm hai số khi biết hiệu và tỉ số của hai số đó', 'Finding two numbers from their difference and ratio'),
      spot: L('Bài toán cho biết hiệu của hai số (hơn, kém, nhiều hơn, ít hơn) và tỉ số của chúng (số này bằng 2/5 số kia, gấp 4 lần số kia), rồi hỏi mỗi số.', 'The problem gives the difference between two numbers (more than, fewer than, older than) and their ratio (one is 2/5 of the other, or 4 times the other), then asks for each number.'),
      steps: [
        L('Bước 1: Vẽ sơ đồ đoạn thẳng: tỉ số 2/5 thì số bé 2 phần, số lớn 5 phần bằng nhau.', 'Step 1: Draw a bar model: with a ratio of 2/5, the smaller number is 2 parts and the bigger number is 5 equal parts.'),
        L('Bước 2: Tìm hiệu số phần bằng nhau.', 'Step 2: Find the difference in equal parts.'),
        L('Bước 3: Tìm giá trị một phần: lấy hiệu chia cho hiệu số phần.', 'Step 3: Find the value of one part: the difference divided by the difference in parts.'),
        L('Bước 4: Tìm từng số: lấy giá trị một phần nhân với số phần của số đó.', 'Step 4: Find each number: one part times its number of parts.'),
      ],
      tip: L('Dễ nhầm với dạng tổng – tỉ: ở đây đề cho "hơn, kém" (hiệu) nên phải tìm hiệu số phần, không cộng số phần.', 'Do not mix this up with sum and ratio: here the problem says "more than, fewer than" (a difference), so find the difference in parts — do not add the parts.'),
      guide: rng => tiForm(rng, 'D', R(rng, 0, 4), 0),
      practice: prac((rng, i) => toQ(tiForm(rng, 'D', [0, 0, P(rng, [1, 2]), 5][i], i === 0 ? 2 : i === 1 ? 1 : R(rng, 1, 2)), HT_HINT2), hieuVary, rng => tiArea(rng, 'D'), ['g5-nc-hieu-ti']) },

    { id: 'g5-dt-ti-so-phan-tram', sem: 2, icon: '💯', lesson: 'g5-c7-b40',
      title: L('Tìm tỉ số phần trăm của hai số', 'Finding the percentage one number is of another'),
      spot: L('Bài toán hỏi "… chiếm bao nhiêu phần trăm …?", "tỉ số phần trăm của a và b là bao nhiêu?".', 'The problem asks "what percentage of … is …?" or "what percentage is a of b?".'),
      steps: [
        L('Bước 1: Xác định số đem so (a) và số được so với (b) — thường là "cả", "tổng số".', 'Step 1: Find the number being compared (a) and the number it is compared with (b) — usually "the whole" or "the total".'),
        L('Bước 2: Tìm thương a : b, viết dưới dạng số thập phân.', 'Step 2: Find the quotient a : b as a decimal.'),
        L('Bước 3: Nhân thương đó với 100 và viết thêm kí hiệu % vào bên phải.', 'Step 3: Multiply the quotient by 100 and write the % sign on the right.'),
      ],
      tip: L('Dễ nhầm: chia ngược (lấy tổng số chia cho phần). Số đứng sau chữ "của", "so với" là số chia.', 'A common mistake: dividing the wrong way round (the total by the part). The number after "of" is the divisor.'),
      guide: rng => pcForm(rng, R(rng, 0, 3)),
      practice: prac(pcPlain, pcVary, pcHard, ['g5-nc-ke-hoach']) },

    { id: 'g5-dt-gia-tri-phan-tram', sem: 2, icon: '🏷️', lesson: 'g5-c7-b41',
      title: L('Tìm giá trị phần trăm của một số', 'Finding a percentage of a number'),
      spot: L('Bài toán cho một số và hỏi một số phần trăm của nó: "tìm 30% của 120", "lớp có 40 học sinh, 45% là nữ", "giảm giá 20%", "lãi suất 6% một năm".', 'The problem gives a number and asks for a percentage of it: "find 30% of 120", "a class of 40 pupils, 45% are girls", "20% off", "interest of 6% a year".'),
      steps: [
        L('Bước 1: Xác định số đã cho (ứng với 100%) và số phần trăm cần tìm.', 'Step 1: Find the number given (it is 100%) and the percentage you need.'),
        L('Bước 2: Lấy số đó chia cho 100 để tìm 1%.', 'Step 2: Divide the number by 100 to find 1%.'),
        L('Bước 3: Nhân với số phần trăm. (Viết gọn: số đó : 100 × số phần trăm.)', 'Step 3: Multiply by the percentage. (In short: the number : 100 × the percentage.)'),
      ],
      tip: L('Dễ nhầm: trả lời số tiền được giảm khi đề hỏi giá sau khi giảm. Đọc kĩ câu hỏi: nếu hỏi giá mới thì còn phải trừ.', 'A common mistake: giving the discount when the problem asks for the new price. Read the question: for the new price you still have to subtract.'),
      guide: rng => gtForm(rng, R(rng, 0, 4), R(rng, 0, 3) === 0),
      practice: prac(gtPlain, gtVary, gtHard, ['g5-nc-giam-gia', 'g5-nc-tiet-kiem']) },

    { id: 'g5-dt-the-tich', sem: 2, icon: '📦', lesson: 'g5-c9-b52',
      title: L('Thể tích hình hộp chữ nhật, hình lập phương', 'Volume of a cuboid and of a cube'),
      spot: L('Bài toán nói về cái hộp, bể nước, thùng, khối gỗ… có dạng hình hộp chữ nhật (dài, rộng, cao) hoặc hình lập phương (cạnh), hỏi thể tích hoặc hỏi chứa được bao nhiêu lít nước.', 'The problem is about a box, a water tank, a crate, a block of wood… shaped like a cuboid (length, width, height) or a cube (edge). It asks for the volume, or how many litres of water it holds.'),
      steps: [
        L('Bước 1: Đổi ba kích thước về cùng một đơn vị đo.', 'Step 1: Change the three sizes to the same unit.'),
        L('Bước 2: Hình hộp chữ nhật: V = chiều dài × chiều rộng × chiều cao. Hình lập phương: V = cạnh × cạnh × cạnh.', 'Step 2: Cuboid: V = length × width × height. Cube: V = edge × edge × edge.'),
        L('Bước 3: Ghi đơn vị thể tích (cm³, dm³, m³). Nhớ: 1 dm³ = 1 l; 1 m³ = 1000 dm³.', 'Step 3: Write the unit of volume (cm³, dm³, m³). Remember: 1 dm³ = 1 l; 1 m³ = 1000 dm³.'),
      ],
      tip: L('Dễ nhầm: tính thể tích hình lập phương bằng cạnh × 3. Đúng là cạnh × cạnh × cạnh.', 'A common mistake: working out the volume of a cube as edge × 3. It is edge × edge × edge.'),
      guide: rng => (R(rng, 0, 2) === 0 ? volCube(rng, true) : volBox(rng, R(rng, 0, 1) === 1, R(rng, 0, 1) === 1)),
      practice: prac((rng, i) => toQ(i === 1 ? volCube(rng, false) : volBox(rng, i === 2, i === 3), TT_VOL), volVary, volHard, ['g5-nc-be-nuoc', 'g5-nc-lap-phuong']) },

    { id: 'g5-dt-thoi-gian', sem: 2, icon: '⏰', lesson: 'g5-c10-b57',
      title: L('Cộng, trừ, nhân, chia số đo thời gian', 'Calculating with time'),
      spot: L('Phép tính với số đo thời gian có hai đơn vị (giờ – phút, phút – giây); bài toán hỏi đến nơi lúc mấy giờ, đi hết bao lâu, làm nhiều sản phẩm hết bao lâu.', 'Calculations with times in two units (hours and minutes, minutes and seconds); problems that ask what time something ends, how long it takes, or how long several items take.'),
      steps: [
        L('Bước 1: Cộng, trừ, nhân, chia riêng từng loại đơn vị (giờ với giờ, phút với phút).', 'Step 1: Add, subtract, multiply or divide each unit separately (hours with hours, minutes with minutes).'),
        L('Bước 2: Cộng, nhân: nếu số phút từ 60 trở lên thì đổi 60 phút = 1 giờ.', 'Step 2: Adding and multiplying: if there are 60 minutes or more, change 60 minutes into 1 hour.'),
        L('Bước 3: Trừ: nếu số phút không đủ trừ thì đổi 1 giờ = 60 phút rồi trừ.', 'Step 3: Subtracting: if there are not enough minutes, change 1 hour into 60 minutes, then subtract.'),
        L('Bước 4: Chia: số giờ còn dư đổi ra phút, gộp với số phút rồi chia tiếp.', 'Step 4: Dividing: change any hours left over into minutes, add them to the minutes and carry on dividing.'),
      ],
      tip: L('Dễ nhầm: coi 3 giờ 75 phút là 3,75 giờ. Thời gian không tính theo hệ mười: 60 phút mới bằng 1 giờ, nên 3 giờ 75 phút = 4 giờ 15 phút.', 'A common mistake: treating 3 hours 75 minutes as 3,75 hours. Time is not in tens: 60 minutes make 1 hour, so 3 hours 75 minutes = 4 hours 15 minutes.'),
      guide: rng => P(rng, [tAdd, tSub, tMul])(rng),
      practice: prac(tgPlain5, tgVary5, tgHard5, ['g5-nc-thoi-gian']) },

    { id: 'g5-dt-van-toc', sem: 2, icon: '🚗', lesson: 'g5-c10-b59',
      title: L('Bài toán tìm vận tốc', 'Finding the speed'),
      spot: L('Bài toán cho quãng đường đi được và thời gian đi của một người hoặc một xe, hỏi vận tốc (mỗi giờ, mỗi phút, mỗi giây đi được bao nhiêu).', 'The problem gives the distance and the time for one person or vehicle and asks for the speed (how far it goes each hour, minute or second).'),
      steps: [
        L('Bước 1: Tìm quãng đường s và thời gian t. Nếu đề cho giờ khởi hành và giờ đến thì tính thời gian đi trước.', 'Step 1: Find the distance s and the time t. If the problem gives the departure and arrival times, find the time taken first.'),
        L('Bước 2: Đổi thời gian về một đơn vị đo (ví dụ 1 giờ 30 phút = 1,5 giờ).', 'Step 2: Change the time to one unit (for example 1 hour 30 minutes = 1,5 hours).'),
        L('Bước 3: v = s : t. Ghi đơn vị vận tốc: km/giờ, m/phút, m/giây.', 'Step 3: v = s : t. Write the unit of speed: km/h, m/min, m/s.'),
      ],
      tip: L('Dễ nhầm: đổi 1 giờ 30 phút thành 1,3 giờ. Đúng là 1,5 giờ, vì 30 phút = 0,5 giờ.', 'A common mistake: changing 1 hour 30 minutes into 1,3 hours. It is 1,5 hours, because 30 minutes = 0,5 hours.'),
      guide: rng => P(rng, [vtHalf, vtClock, vtRun])(rng),
      practice: prac(vtPlain, vtVary, vtHard, ['g5-nc-duong-dua']) },

    { id: 'g5-dt-quang-duong-thoi-gian', sem: 2, icon: '🛣️', lesson: 'g5-c10-b60',
      title: L('Bài toán tìm quãng đường, thời gian', 'Finding the distance or the time'),
      spot: L('Bài toán cho vận tốc và thời gian đi, hỏi quãng đường; hoặc cho quãng đường và vận tốc, hỏi thời gian đi (đi hết bao lâu, đến nơi lúc mấy giờ).', 'The problem gives the speed and the time and asks for the distance; or it gives the distance and the speed and asks for the time (how long it takes, what time it arrives).'),
      steps: [
        L('Bước 1: Xác định đề cho gì, hỏi gì trong ba đại lượng: vận tốc v, quãng đường s, thời gian t.', 'Step 1: See which of the three — speed v, distance s, time t — are given and which is asked.'),
        L('Bước 2: Đổi đơn vị cho phù hợp (vận tốc tính theo km/giờ thì thời gian tính bằng giờ).', 'Step 2: Make the units match (if the speed is in km/h, the time must be in hours).'),
        L('Bước 3: Tìm quãng đường: s = v × t. Tìm thời gian: t = s : v.', 'Step 3: Distance: s = v × t. Time: t = s : v.'),
      ],
      tip: L('Dễ nhầm: 2,5 giờ là 2 giờ 30 phút, không phải 2 giờ 50 phút.', 'A common mistake: 2,5 hours is 2 hours 30 minutes, not 2 hours 50 minutes.'),
      guide: rng => (R(rng, 0, 1) ? qdDist(rng) : qdArrive(rng)),
      practice: prac(qdPlain, qdVary, qdHard, ['g5-nc-van-toc', 'g5-nc-gio-den']) },
  ]);
})();
