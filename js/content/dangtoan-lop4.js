/* Toán ISA — Học dạng toán, lớp 4. Contract: DANGTOAN.md.
 * Kinds in the order of SGK Toán 4 (Kết nối tri thức): học kì I Bài 5, 17, 18, 19, 24, 25 and the perimeter / area
 * problems of the review chapter; học kì II Bài 40–42, 46, 47, 60–61, 63, 64, 65.
 * Every problem is written once as a guided example (prompt + steps + done); the practice questions reuse the same
 * builders through toQ(), so the lời giải of a practice question is the list of the steps' lines.
 */
(function () {
  'use strict';
  const L = DT.L, F = DT.F, R = DT.R, P = DT.P, M = DT.M, num = DT.num, ch = DT.ch, fr = DT.fr, vz = DT.vz, Q = DT.Q, S = DT.step;

  // ---------- helpers ----------
  const pl = (n, one, many) => `${F(n)} ${n === 1 ? one : (many || one + 's')}`;   // English singular / plural
  const lc = s => s[0].toLowerCase() + s.slice(1);
  const DONG = L('đồng', 'dong');
  const EASY = L('Tính bằng cách thuận tiện:', 'Calculate in the easiest way:');
  const MISS = L('Số thích hợp ở ô ?:', 'Find the missing number:');
  const CALC = L('Tính:', 'Calculate:');
  const DS = (vi, en) => L(`Đáp số: ${vi}.`, `Answer: ${en == null ? vi : en}.`);
  const SO = (vi, en) => L(`Vậy: ${vi}.`, `So: ${en == null ? vi : en}.`);
  const units = (x, max) => Math.max(1, Math.round(x * 12 / Math.max(1, max)));   // bar length of a tape diagram
  const cmp = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b ? 0 : a > b ? 1 : 2 });
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const G = (prompt, steps, done, visual) => Object.assign({ prompt, steps, done }, visual ? { visual } : {});
  // a guided example as a practice question: the answer of its last step (or `answer`), all the lines as the lời giải
  const toQ = (g, hint, answer) => Q(g.prompt, answer || g.steps[g.steps.length - 1].answer, g.steps.map(s => s.say).join('\n'),
    Object.assign(hint ? { hint } : {}, g.visual ? { visual: g.visual } : {}));
  // practice: i 0–3 the plain form, 4–6 a variation, 7–9 the hardest (8 and 9 from the advanced bank when it has entries)
  const prac = (plain, vary, hard, bank) => (rng, i) => (i < 4 ? plain(rng, i) : i < 7 ? vary(rng, i) : (i > 7 && bank && DT.bank(rng, bank)) || hard(rng, i));
  const roman = n => { let s = '', x = n; for (const [v, c] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (x >= v) { s += c; x -= v; } return s; };
  const ord = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const centuryOf = y => Math.floor((y - 1) / 100) + 1;
  const fs = (n, d) => `${n}/${d}`;
  const coprime = (rng, d) => { let n = R(rng, 1, d - 1); while (U.gcd(n, d) > 1) n--; return n; };   // n/d in simplest form, n < d

  // ================= 1. Giải bài toán có ba bước tính (Bài 5) =================
  function bbClasses(rng) {
    const a = R(rng, 25, 60), d = R(rng, 3, 12), c = R(rng, 2, 9), b = a + d, e = b - c, tot = a + b + e;
    const [did, didE, doE, u, uE] = P(rng, [['trồng được', 'planted', 'plant', 'cây', 'trees'], ['quyên góp được', 'collected', 'collect', 'quyển sách', 'books'], ['thu gom được', 'collected', 'collect', 'vỏ chai', 'empty bottles']]);
    return G(
      L(`Lớp 4A ${did} ${a} ${u}. Lớp 4B ${did} nhiều hơn lớp 4A ${d} ${u}. Lớp 4C ${did} ít hơn lớp 4B ${c} ${u}. Hỏi cả ba lớp ${did} bao nhiêu ${u}?`,
        `Class 4A ${didE} ${a} ${uE}. Class 4B ${didE} ${d} more ${uE} than class 4A. Class 4C ${didE} ${c} fewer ${uE} than class 4B. How many ${uE} did the three classes ${doE} altogether?`),
      [
        S(L('Muốn biết cả ba lớp, trước hết phải tìm gì?', 'To find the total for the three classes, what must you find first?'),
          ch(rng, L(`Số ${u} của lớp 4B và của lớp 4C`, `How many ${uE} class 4B and class 4C ${didE}`), [L('Số học sinh của ba lớp', 'The number of pupils in the three classes'), L(`Số ${u} của riêng lớp 4A`, `How many ${uE} class 4A ${didE}`)]),
          L('Đã biết lớp 4A. Ta tìm lớp 4B, rồi lớp 4C, sau đó cộng cả ba lớp.', 'We know class 4A. Find class 4B, then class 4C, then add the three classes.')),
        S(L(`Lớp 4B ${did} bao nhiêu ${u}?`, `How many ${uE} did class 4B ${doE}?`), num(b),
          L(`Lớp 4B ${did}: ${a} + ${d} = ${b} (${u}).`, `Class 4B: ${a} + ${d} = ${b} (${uE}).`), L('"Nhiều hơn" thì làm phép cộng.', '"More than" means add.')),
        S(L(`Lớp 4C ${did} bao nhiêu ${u}?`, `How many ${uE} did class 4C ${doE}?`), num(e),
          L(`Lớp 4C ${did}: ${b} ${M} ${c} = ${e} (${u}).`, `Class 4C: ${b} ${M} ${c} = ${e} (${uE}).`), L('"Ít hơn" thì làm phép trừ.', '"Fewer than" means subtract.')),
        S(L(`Cả ba lớp ${did} bao nhiêu ${u}?`, `How many ${uE} did the three classes ${doE} altogether?`), num(tot),
          L(`Cả ba lớp ${did}: ${a} + ${b} + ${e} = ${tot} (${u}).`, `All three classes: ${a} + ${b} + ${e} = ${tot} (${uE}).`)),
      ],
      DS(`${tot} ${u}`, `${tot} ${uE}`),
      vz('tape', { bars: [{ label: '4A', units: units(a, b), value: String(a) }, { label: '4B', units: units(b, b), value: '?' }, { label: '4C', units: units(e, b), value: '?' }], total: '?' }));
  }
  function bbShop(rng) {
    const [it, cl, one, many] = P(rng, [['hộp bánh', 'hộp', 'box of biscuits', 'boxes of biscuits'], ['quyển truyện', 'quyển', 'storybook', 'storybooks'], ['hộp bút màu', 'hộp', 'box of coloured pencils', 'boxes of coloured pencils']]);
    const [x, xE] = P(rng, [['một chai dầu ăn', 'a bottle of cooking oil'], ['một cái cặp sách', 'a school bag'], ['một quả dưa hấu', 'a watermelon']]);
    const n = R(rng, 2, 5), p = R(rng, 12, 45) * 1000, q = R(rng, 15, 60) * 1000, tot = p * n + q, pay = Math.ceil((tot + 1000) / 50000) * 50000;
    return G(
      L(`Mẹ mua ${n} ${it}, mỗi ${cl} giá ${F(p)} đồng, và ${x} giá ${F(q)} đồng. Mẹ đưa cô bán hàng ${F(pay)} đồng. Hỏi cô bán hàng trả lại mẹ bao nhiêu tiền?`,
        `Mum buys ${n} ${many}. Each ${one} costs ${F(p)} dong. She also buys ${xE} for ${F(q)} dong. She gives the shopkeeper ${F(pay)} dong. How much change does she get?`),
      [
        S(L('Muốn tìm tiền trả lại, trước hết phải biết gì?', 'To find the change, what must you know first?'),
          ch(rng, L('Mẹ mua hết tất cả bao nhiêu tiền', 'How much Mum spends altogether'), [L('Mẹ mua tất cả bao nhiêu món hàng', 'How many things Mum buys'), L(`Mỗi ${cl} nặng bao nhiêu`, `How heavy each ${one} is`)]),
          L('Tiền trả lại = tiền mẹ đưa − tiền mua hàng. Vậy phải tính tiền mua hàng trước.', 'Change = money given − money spent. So work out the money spent first.')),
        S(L(`Mua ${n} ${it} hết bao nhiêu tiền?`, `How much do the ${n} ${many} cost?`), num(p * n, DONG),
          L(`Mua ${n} ${it} hết: ${F(p)} × ${n} = ${F(p * n)} (đồng).`, `The ${n} ${many} cost: ${F(p)} × ${n} = ${F(p * n)} (dong).`)),
        S(L('Mẹ mua hết tất cả bao nhiêu tiền?', 'How much does Mum spend altogether?'), num(tot, DONG),
          L(`Mẹ mua hết tất cả: ${F(p * n)} + ${F(q)} = ${F(tot)} (đồng).`, `Mum spends altogether: ${F(p * n)} + ${F(q)} = ${F(tot)} (dong).`)),
        S(L('Cô bán hàng trả lại mẹ bao nhiêu tiền?', 'How much change does Mum get?'), num(pay - tot, DONG),
          L(`Cô bán hàng trả lại mẹ: ${F(pay)} ${M} ${F(tot)} = ${F(pay - tot)} (đồng).`, `Change: ${F(pay)} ${M} ${F(tot)} = ${F(pay - tot)} (dong).`)),
      ],
      DS(`${F(pay - tot)} đồng`, `${F(pay - tot)} dong`));
  }
  function bbBoxes(rng) {
    const per = R(rng, 12, 30), n1 = R(rng, 3, 5), n2 = R(rng, 2, 4), all = per * (n1 + n2), sold = R(rng, 20, all - 10), k = R(rng, 0, 1);
    const box = k ? 'bao' : 'thùng', boxE = k ? 'sack' : 'box', boxesE = k ? 'sacks' : 'boxes', what = k ? 'gạo' : 'hoa quả', whatE = k ? 'rice' : 'fruit';
    return G(
      k ? L(`Trong kho có ${n1} bao gạo nếp và ${n2} bao gạo tẻ, mỗi bao nặng ${per} kg. Người ta đã chuyển đi ${sold} kg gạo. Hỏi trong kho còn lại bao nhiêu ki-lô-gam gạo?`,
        `A store has ${n1} sacks of sticky rice and ${n2} sacks of plain rice. Each sack weighs ${per} kg. ${sold} kg of rice has been taken away. How many kilograms of rice are left in the store?`)
        : L(`Cửa hàng nhập về ${n1} thùng táo và ${n2} thùng cam, mỗi thùng có ${per} kg. Cửa hàng đã bán ${sold} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam hoa quả?`,
          `A shop buys in ${n1} boxes of apples and ${n2} boxes of oranges. Each box holds ${per} kg. The shop has sold ${sold} kg. How many kilograms of fruit are left?`),
      [
        S(L('Các ' + box + ' nặng như nhau. Bước đầu tiên nên tìm gì?', `All the ${boxesE} weigh the same. What should you find first?`),
          ch(rng, L(`Có tất cả bao nhiêu ${box}`, `How many ${boxesE} there are altogether`), [L(`Mỗi ${box} bán được bao nhiêu tiền`, `How much money each ${boxE} is sold for`), L(`Còn lại bao nhiêu ${box}`, `How many ${boxesE} are left`)]),
          L(`Tìm tổng số ${box}, rồi tìm tổng số ki-lô-gam, cuối cùng trừ đi phần đã ${k ? 'chuyển đi' : 'bán'}.`, `Find the number of ${boxesE}, then the total number of kilograms, and last take away what has gone.`)),
        S(L(`Có tất cả bao nhiêu ${box}?`, `How many ${boxesE} are there altogether?`), num(n1 + n2),
          L(`Số ${box} có tất cả: ${n1} + ${n2} = ${n1 + n2} (${box}).`, `Number of ${boxesE}: ${n1} + ${n2} = ${n1 + n2} (${boxesE}).`)),
        S(L(`${n1 + n2} ${box} có tất cả bao nhiêu ki-lô-gam ${what}?`, `How many kilograms of ${whatE} are in the ${n1 + n2} ${boxesE}?`), num(all, 'kg'),
          L(`Số ${what} có tất cả: ${per} × ${n1 + n2} = ${all} (kg).`, `Total ${whatE}: ${per} × ${n1 + n2} = ${all} (kg).`)),
        S(L(`Còn lại bao nhiêu ki-lô-gam ${what}?`, `How many kilograms of ${whatE} are left?`), num(all - sold, 'kg'),
          L(`Số ${what} còn lại: ${all} ${M} ${sold} = ${all - sold} (kg).`, `${whatE[0].toUpperCase() + whatE.slice(1)} left: ${all} ${M} ${sold} = ${all - sold} (kg).`)),
      ],
      DS(`${all - sold} kg`));
  }
  // practice-only forms: a short list of [ask, value, unit, line] is enough
  const lines = (prompt, rows, hint, visual) => Q(prompt, num(rows[rows.length - 1][0], rows[rows.length - 1][1]), rows.map(r => r[2]).join('\n'), Object.assign(hint ? { hint } : {}, visual ? { visual } : {}));
  function bbDays(rng) {
    const a = R(rng, 20, 60), k = R(rng, 2, 4), d = R(rng, 5, 15), b = a * k, c = b - d;
    return lines(L(`Ngày thứ nhất đội trồng được ${a} cây. Ngày thứ hai đội trồng được gấp ${k} lần ngày thứ nhất. Ngày thứ ba đội trồng ít hơn ngày thứ hai ${d} cây. Hỏi cả ba ngày đội trồng được bao nhiêu cây?`,
      `On the first day a team planted ${a} trees. On the second day they planted ${k} times as many as on the first day. On the third day they planted ${d} fewer trees than on the second day. How many trees did they plant in the three days?`),
    [[b, '', L(`Ngày thứ hai trồng được: ${a} × ${k} = ${b} (cây).`, `Day 2: ${a} × ${k} = ${b} (trees).`)],
      [c, '', L(`Ngày thứ ba trồng được: ${b} ${M} ${d} = ${c} (cây).`, `Day 3: ${b} ${M} ${d} = ${c} (trees).`)],
      [a + b + c, '', L(`Cả ba ngày trồng được: ${a} + ${b} + ${c} = ${a + b + c} (cây).`, `All three days: ${a} + ${b} + ${c} = ${a + b + c} (trees).`)]],
    L('Tìm số cây ngày thứ hai, ngày thứ ba, rồi cộng cả ba ngày.', 'Find the trees planted on day 2, then on day 3, then add up all three days.'));
  }
  function bbRoad(rng) {
    const a = R(rng, 80, 200), k = R(rng, 2, 3), b = a * k, left = R(rng, 50, 300), T = a + b + left;
    return lines(L(`Một đội công nhân phải sửa ${F(T)} m đường. Ngày thứ nhất đội sửa được ${a} m, ngày thứ hai sửa được gấp ${k} lần ngày thứ nhất. Hỏi đội còn phải sửa bao nhiêu mét đường nữa?`,
      `A team of workers has to repair ${F(T)} m of road. On the first day they repair ${a} m. On the second day they repair ${k} times as much as on the first day. How many metres of road do they still have to repair?`),
    [[b, 'm', L(`Ngày thứ hai sửa được: ${a} × ${k} = ${b} (m).`, `Day 2: ${a} × ${k} = ${b} (m).`)],
      [a + b, 'm', L(`Cả hai ngày sửa được: ${a} + ${b} = ${a + b} (m).`, `Both days: ${a} + ${b} = ${a + b} (m).`)],
      [left, 'm', L(`Còn phải sửa: ${F(T)} ${M} ${a + b} = ${left} (m).`, `Still to repair: ${F(T)} ${M} ${a + b} = ${left} (m).`)]],
    L('Tìm ngày thứ hai, rồi cả hai ngày, rồi phần còn lại.', 'Find day 2, then both days, then what is left.'));
  }
  function bbPocket(rng) {
    const name = DT.name(rng), n = R(rng, 3, 6), p = R(rng, 4, 9) * 1000, q = R(rng, 8, 25) * 1000, spent = n * p + q, have = Math.ceil((spent + 2000) / 10000) * 10000 + R(rng, 0, 2) * 10000;
    return lines(L(`${name} có ${F(have)} đồng. ${name} mua ${n} quyển vở, mỗi quyển giá ${F(p)} đồng, và một hộp bút giá ${F(q)} đồng. Hỏi ${name} còn lại bao nhiêu tiền?`,
      `${name} has ${F(have)} dong. ${name} buys ${n} exercise books at ${F(p)} dong each and a pencil case for ${F(q)} dong. How much money does ${name} have left?`),
    [[n * p, DONG, L(`Mua ${n} quyển vở hết: ${F(p)} × ${n} = ${F(n * p)} (đồng).`, `The ${n} exercise books cost: ${F(p)} × ${n} = ${F(n * p)} (dong).`)],
      [spent, DONG, L(`Mua vở và hộp bút hết: ${F(n * p)} + ${F(q)} = ${F(spent)} (đồng).`, `Books and pencil case: ${F(n * p)} + ${F(q)} = ${F(spent)} (dong).`)],
      [have - spent, DONG, L(`${name} còn lại: ${F(have)} ${M} ${F(spent)} = ${F(have - spent)} (đồng).`, `Money left: ${F(have)} ${M} ${F(spent)} = ${F(have - spent)} (dong).`)]],
    L('Tính tiền mua vở, rồi tổng số tiền đã mua, rồi số tiền còn lại.', 'Work out the cost of the books, then the total spent, then the money left.'));
  }
  function bbCompare(rng) {
    let n1, a, n2, b;
    do { n1 = R(rng, 4, 9); a = R(rng, 20, 50); n2 = R(rng, 3, 8); b = R(rng, 15, 45); } while (n1 * a <= n2 * b);
    return lines(L(`Bác Ba thu hoạch được ${n1} bao thóc, mỗi bao nặng ${a} kg, và ${n2} bao ngô, mỗi bao nặng ${b} kg. Hỏi số thóc nhiều hơn số ngô bao nhiêu ki-lô-gam?`,
      `Mr Ba harvests ${n1} sacks of rice, each weighing ${a} kg, and ${n2} sacks of maize, each weighing ${b} kg. How many more kilograms of rice than maize does he have?`),
    [[n1 * a, 'kg', L(`Số thóc: ${a} × ${n1} = ${n1 * a} (kg).`, `Rice: ${a} × ${n1} = ${n1 * a} (kg).`)],
      [n2 * b, 'kg', L(`Số ngô: ${b} × ${n2} = ${n2 * b} (kg).`, `Maize: ${b} × ${n2} = ${n2 * b} (kg).`)],
      [n1 * a - n2 * b, 'kg', L(`Số thóc nhiều hơn số ngô: ${n1 * a} ${M} ${n2 * b} = ${n1 * a - n2 * b} (kg).`, `Difference: ${n1 * a} ${M} ${n2 * b} = ${n1 * a - n2 * b} (kg).`)]],
    L('Tính số thóc, số ngô, rồi so sánh bằng phép trừ.', 'Work out the rice, then the maize, then subtract to compare.'));
  }
  function bbCans(rng) {
    const k = P(rng, [4, 5, 6, 8]), m = R(rng, 12, 30), T = k * m; let d = R(rng, 4, 20); if ((T - d) % 2) d++;
    const a = (T - d) / 2, b = a + d;
    return lines(L(`Thùng thứ nhất có ${a} l dầu. Thùng thứ hai có nhiều hơn thùng thứ nhất ${d} l dầu. Người ta rót hết dầu ở cả hai thùng vào các can, mỗi can ${k} l. Hỏi rót được tất cả bao nhiêu can dầu?`,
      `The first drum holds ${a} l of oil. The second drum holds ${d} l more than the first. All the oil from both drums is poured into cans of ${k} l each. How many cans are filled?`),
    [[b, 'l', L(`Thùng thứ hai có: ${a} + ${d} = ${b} (l).`, `Second drum: ${a} + ${d} = ${b} (l).`)],
      [T, 'l', L(`Cả hai thùng có: ${a} + ${b} = ${T} (l).`, `Both drums: ${a} + ${b} = ${T} (l).`)],
      [m, '', L(`Số can dầu rót được: ${T} : ${k} = ${m} (can).`, `Number of cans: ${T} : ${k} = ${m} (cans).`)]],
    L('Tìm thùng thứ hai, rồi cả hai thùng, rồi chia cho số lít mỗi can.', 'Find the second drum, then both drums, then divide by the litres in each can.'));
  }

  // ================= 2. Đổi đơn vị đo khối lượng: yến, tạ, tấn (Bài 17) =================
  // English: yến (10 kg) keeps its name; tạ = quintal; tấn = tonne
  const KU = { yen: [L('yến', 'yến'), L('yến', 'yến')], ta: [L('tạ', 'quintal'), L('tạ', 'quintals')], tan: [L('tấn', 'tonne'), L('tấn', 'tonnes')] };
  const ku = (n, k) => `${F(n)} ${KU[k][n === 1 ? 0 : 1]}`;
  const KG_RULE = L('1 yến = 10 kg; 1 tạ = 10 yến = 100 kg; 1 tấn = 10 tạ = 1000 kg.', '1 yến = 10 kg; 1 quintal = 10 yến = 100 kg; 1 tonne = 10 quintals = 1000 kg.');
  function kgLorry(rng) {
    const t = R(rng, 2, 9), q = R(rng, 1, 9), [w, wE] = P(rng, [['gạo', 'rice'], ['xi măng', 'cement'], ['ngô', 'maize'], ['than', 'coal']]), v = t * 1000 + q * 100;
    return G(
      L(`Một xe tải chở ${t} tấn ${q} tạ ${w}. Hỏi xe đó chở bao nhiêu ki-lô-gam ${w}?`, `A lorry carries ${ku(t, 'tan')} ${ku(q, 'ta')} of ${wE}. How many kilograms of ${wE} does it carry?`),
      [
        S(L('1 tấn bằng bao nhiêu ki-lô-gam?', 'How many kilograms are there in 1 tonne?'), ch(rng, '1000 kg', ['100 kg', '10 kg']), KG_RULE),
        S(L(`${t} tấn = ? kg`, `${ku(t, 'tan')} = ? kg`), num(t * 1000, 'kg'), L(`${t} tấn = ${F(t * 1000)} kg (lấy ${t} × 1000).`, `${ku(t, 'tan')} = ${F(t * 1000)} kg (${t} × 1000).`)),
        S(L(`${q} tạ = ? kg`, `${ku(q, 'ta')} = ? kg`), num(q * 100, 'kg'), L(`${q} tạ = ${q * 100} kg (lấy ${q} × 100).`, `${ku(q, 'ta')} = ${q * 100} kg (${q} × 100).`)),
        S(L(`Vậy ${t} tấn ${q} tạ = ? kg`, `So ${ku(t, 'tan')} ${ku(q, 'ta')} = ? kg`), num(v, 'kg'), L(`${t} tấn ${q} tạ = ${F(t * 1000)} kg + ${q * 100} kg = ${F(v)} kg.`, `${ku(t, 'tan')} ${ku(q, 'ta')} = ${F(t * 1000)} kg + ${q * 100} kg = ${F(v)} kg.`)),
      ],
      DS(`${F(v)} kg`));
  }
  function kgAnimals(rng) {
    const t = R(rng, 2, 6), q = R(rng, 3, 9), [big, bigE] = P(rng, [['con voi', 'An elephant'], ['con hà mã', 'A hippo'], ['con tê giác', 'A rhino']]), [sm, smE] = P(rng, [['con bò', 'cow'], ['con trâu', 'buffalo'], ['con ngựa', 'horse']]), v = t * 10 - q;
    return G(
      L(`Một ${big} nặng ${t} tấn. Một ${sm} nặng ${q} tạ. Hỏi ${big} nặng hơn ${sm} bao nhiêu tạ?`, `${bigE} weighs ${ku(t, 'tan')}. A ${smE} weighs ${ku(q, 'ta')}. How many quintals heavier is the ${lc(bigE).replace(/^an? /, '')} than the ${smE}?`),
      [
        S(L('Hai số đo khác đơn vị (tấn và tạ). Trước hết ta làm gì?', 'The two masses are in different units (tonnes and quintals). What do you do first?'),
          ch(rng, L(`Đổi ${t} tấn ra tạ`, `Change ${ku(t, 'tan')} to quintals`), [L(`Lấy ${t} ${M} ${q}`, `Work out ${t} ${M} ${q}`), L(`Lấy ${t} + ${q}`, `Work out ${t} + ${q}`)]),
          L('Phải đổi về cùng một đơn vị rồi mới trừ được.', 'Change both to the same unit before you subtract.')),
        S(L('1 tấn = ? tạ', '1 tonne = ? quintals'), num(10, L('tạ', 'quintals')), L('1 tấn = 10 tạ.', '1 tonne = 10 quintals.')),
        S(L(`${t} tấn = ? tạ`, `${ku(t, 'tan')} = ? quintals`), num(t * 10, L('tạ', 'quintals')), L(`${t} tấn = ${t * 10} tạ.`, `${ku(t, 'tan')} = ${t * 10} quintals.`)),
        S(L(`${big[0].toUpperCase() + big.slice(1)} nặng hơn ${sm} bao nhiêu tạ?`, 'How many quintals heavier is it?'), num(v, L('tạ', 'quintals')),
          L(`${big[0].toUpperCase() + big.slice(1)} nặng hơn ${sm}: ${t * 10} ${M} ${q} = ${v} (tạ).`, `Difference: ${t * 10} ${M} ${q} = ${v} (quintals).`)),
      ],
      DS(`${v} tạ`, ku(v, 'ta')));
  }
  function kgBags(rng) {
    const y = P(rng, [2, 5]), n = (y === 2 ? 5 : 2) * R(rng, 2, 9), tot = n * y, [w, wE] = P(rng, [['gạo', 'rice'], ['thóc', 'paddy rice'], ['ngô', 'maize']]);
    return G(
      L(`Mỗi bao ${w} nặng ${y} yến. Hỏi ${n} bao ${w} như thế nặng bao nhiêu tạ?`, `Each sack of ${wE} weighs ${y} yến. How many quintals do ${n} sacks like this weigh?`),
      [
        S(L('Trước hết ta tìm gì?', 'What do you find first?'),
          ch(rng, L(`${n} bao nặng bao nhiêu yến`, `How many yến ${n} sacks weigh`), [L('1 yến bằng bao nhiêu bao', 'How many sacks make 1 yến'), L(`${n} bao nặng bao nhiêu tấn`, `How many tonnes ${n} sacks weigh`)]),
          L('Tìm khối lượng theo yến trước, rồi đổi yến ra tạ.', 'Find the mass in yến first, then change yến to quintals.')),
        S(L(`${n} bao nặng bao nhiêu yến?`, `How many yến do ${n} sacks weigh?`), num(tot, 'yến'), L(`${n} bao nặng: ${y} × ${n} = ${tot} (yến).`, `${n} sacks weigh: ${y} × ${n} = ${tot} (yến).`)),
        S(L(`10 yến = 1 tạ. Vậy ${tot} yến = ? tạ`, `10 yến = 1 quintal. So ${tot} yến = ? quintals`), num(tot / 10, L('tạ', 'quintals')), L(`${tot} yến = ${tot / 10} tạ (lấy ${tot} : 10).`, `${tot} yến = ${ku(tot / 10, 'ta')} (${tot} : 10).`)),
      ],
      DS(`${tot / 10} tạ`, ku(tot / 10, 'ta')));
  }
  function kgSimple(rng, i) {
    const a = R(rng, 2, i === 0 ? 9 : 30), b = R(rng, 1, 9) * (i === 3 ? P(rng, [1, 5, 10]) : 1);
    const rows = [
      [[L(`${a} yến = ? kg`, `${a} yến = ? kg`), a * 10, 'kg'], [L(`${a} tạ = ? kg`, `${ku(a, 'ta')} = ? kg`), a * 100, 'kg'], [L(`${a} tấn = ? kg`, `${ku(a, 'tan')} = ? kg`), a * 1000, 'kg']],
      [[L(`${a} tấn = ? tạ`, `${ku(a, 'tan')} = ? quintals`), a * 10, L('tạ', 'quintals')], [L(`${a} tạ = ? yến`, `${ku(a, 'ta')} = ? yến`), a * 10, 'yến'], [L(`${a} tấn = ? yến`, `${ku(a, 'tan')} = ? yến`), a * 100, 'yến']],
      [[L(`${a * 10} kg = ? yến`, `${a * 10} kg = ? yến`), a, 'yến'], [L(`${F(a * 100)} kg = ? tạ`, `${F(a * 100)} kg = ? quintals`), a, L('tạ', 'quintals')], [L(`${F(a * 1000)} kg = ? tấn`, `${F(a * 1000)} kg = ? tonnes`), a, L('tấn', 'tonnes')], [L(`${a * 10} tạ = ? tấn`, `${a * 10} quintals = ? tonnes`), a, L('tấn', 'tonnes')]],
      [[L(`${a} tạ ${b} kg = ? kg`, `${ku(a, 'ta')} ${b} kg = ? kg`), a * 100 + b, 'kg'], [L(`${a} tấn ${b} kg = ? kg`, `${ku(a, 'tan')} ${b} kg = ? kg`), a * 1000 + b, 'kg'], [L(`${a} yến ${b % 10 || 5} kg = ? kg`, `${a} yến ${b % 10 || 5} kg = ? kg`), a * 10 + (b % 10 || 5), 'kg'], [L(`${a} tấn ${b % 10 || 5} tạ = ? tạ`, `${ku(a, 'tan')} ${ku(b % 10 || 5, 'ta')} = ? quintals`), a * 10 + (b % 10 || 5), L('tạ', 'quintals')]],
    ][i];
    const [p, v, u] = P(rng, rows);
    return Q(`${MISS}\n${p}`, num(v, u), `${KG_RULE}\n${p.replace('?', F(v))}.`, { hint: KG_RULE });
  }
  function kgCompare(rng) {
    const x = R(rng, 2, 9), k = P(rng, ['ta', 'tan', 'yen']), mul = k === 'ta' ? 100 : k === 'tan' ? 1000 : 10, y = x * mul + P(rng, [-5, 0, 0, 5, 50]) * (mul / 10);
    const left = L(`${x} ${KU[k][1]}`, ku(x, k)), right = `${F(y)} kg`;
    return Q(L(`So sánh: ${left} … ${right}`, `Compare: ${left} … ${right}`), cmp(x * mul, y), L(`Đổi về ki-lô-gam: ${left} = ${F(x * mul)} kg. ${F(x * mul)} ${sign(x * mul, y)} ${F(y)} nên ${left} ${sign(x * mul, y)} ${right}.`, `Change to kilograms: ${left} = ${F(x * mul)} kg. ${F(x * mul)} ${sign(x * mul, y)} ${F(y)}, so ${left} ${sign(x * mul, y)} ${right}.`),
      { hint: L('Đổi về cùng đơn vị ki-lô-gam rồi so sánh.', 'Change both to kilograms, then compare.'), visual: vz('compare', { left, right }) });
  }
  function kgTwoLorries(rng) {
    const t = R(rng, 2, 6), q = R(rng, 1, 9), c = R(rng, 3, 15), a = t * 10 + q, b = a - c;
    return lines(L(`Xe thứ nhất chở ${t} tấn ${q} tạ gạo. Xe thứ hai chở ít hơn xe thứ nhất ${c} tạ gạo. Hỏi cả hai xe chở bao nhiêu tạ gạo?`,
      `The first lorry carries ${ku(t, 'tan')} ${ku(q, 'ta')} of rice. The second lorry carries ${ku(c, 'ta')} less than the first. How many quintals of rice do the two lorries carry altogether?`),
    [[a, '', L(`Đổi: ${t} tấn ${q} tạ = ${a} tạ.`, `Change: ${ku(t, 'tan')} ${ku(q, 'ta')} = ${a} quintals.`)],
      [b, '', L(`Xe thứ hai chở: ${a} ${M} ${c} = ${b} (tạ).`, `Second lorry: ${a} ${M} ${c} = ${b} (quintals).`)],
      [a + b, L('tạ', 'quintals'), L(`Cả hai xe chở: ${a} + ${b} = ${a + b} (tạ).`, `Both lorries: ${a} + ${b} = ${a + b} (quintals).`)]],
    L('Đổi về tạ trước: 1 tấn = 10 tạ.', 'Change to quintals first: 1 tonne = 10 quintals.'));
  }

  // ================= 3. Đổi đơn vị đo diện tích (Bài 18) =================
  const AU = ['m²', 'dm²', 'cm²', 'mm²'];
  const AREA_RULE = L('1 m² = 100 dm²; 1 dm² = 100 cm²; 1 cm² = 100 mm².', '1 m² = 100 dm²; 1 dm² = 100 cm²; 1 cm² = 100 mm².');
  function dtCompound(rng) {
    const k = R(rng, 0, 2), big = AU[k], sm = AU[k + 1], a = R(rng, 2, 9), b = R(rng, 5, 95), v = a * 100 + b;
    return G(`${MISS}\n${a} ${big} ${b} ${sm} = ? ${sm}`,
      [
        S(`1 ${big} = ? ${sm}`, ch(rng, `100 ${sm}`, [`10 ${sm}`, `1000 ${sm}`]), L(`1 ${big} = 100 ${sm}. Hai đơn vị đo diện tích liền nhau gấp, kém nhau 100 lần.`, `1 ${big} = 100 ${sm}. Each unit of area is 100 times the next smaller one.`)),
        S(`${a} ${big} = ? ${sm}`, num(a * 100, sm), L(`${a} ${big} = ${a * 100} ${sm} (lấy ${a} × 100).`, `${a} ${big} = ${a * 100} ${sm} (${a} × 100).`)),
        S(L(`Cộng thêm ${b} ${sm}: ${a} ${big} ${b} ${sm} = ? ${sm}`, `Add the ${b} ${sm}: ${a} ${big} ${b} ${sm} = ? ${sm}`), num(v, sm), `${a} ${big} ${b} ${sm} = ${a * 100} ${sm} + ${b} ${sm} = ${v} ${sm}.`),
      ],
      SO(`${a} ${big} ${b} ${sm} = ${v} ${sm}`));
  }
  function dtSplit(rng) {
    const k = R(rng, 0, 2), big = AU[k], sm = AU[k + 1], a = R(rng, 2, 9), b = R(rng, 5, 95), v = a * 100 + b;
    return G(L(`Viết số thích hợp vào chỗ chấm:\n${v} ${sm} = … ${big} … ${sm}`, `Fill in the missing numbers:\n${v} ${sm} = … ${big} … ${sm}`),
      [
        S(L(`Bao nhiêu ${sm} thì bằng 1 ${big}?`, `How many ${sm} make 1 ${big}?`), ch(rng, `100 ${sm}`, [`10 ${sm}`, `1000 ${sm}`]), `100 ${sm} = 1 ${big}.`),
        S(L(`${v} : 100 được mấy (không kể số dư)? Đó là số ${big}.`, `How many whole hundreds are there in ${v}? That is the number of ${big}.`), num(a, big), L(`${v} : 100 = ${a} (dư ${b}). Vậy có ${a} ${big}.`, `${v} : 100 = ${a} (remainder ${b}). So there are ${a} ${big}.`)),
        S(L(`Còn dư bao nhiêu ${sm}?`, `How many ${sm} are left over?`), num(b, sm), L(`Còn dư ${b} ${sm}.`, `${b} ${sm} are left over.`)),
      ],
      SO(`${v} ${sm} = ${a} ${big} ${b} ${sm}`));
  }
  // the split form with the bigger unit already written: 325 dm² = 3 m² ? dm²
  function dtSplitQ(rng) {
    const g = dtSplit(rng), a = g.steps[1].answer, b = g.steps[2].answer;
    return Q(`${MISS}\n${a.value * 100 + b.value} ${b.unit} = ${a.value} ${a.unit} ? ${b.unit}`, b, g.steps.map(s => s.say).join('\n'), { hint: AREA_RULE });
  }
  function dtTwoHops(rng) {
    const a = R(rng, 2, 9), k = R(rng, 0, 1), u0 = AU[k], u1 = AU[k + 1], u2 = AU[k + 2];
    return G(`${MISS}\n${a} ${u0} = ? ${u2}`,
      [
        S(L(`Đổi từ ${u0} ra ${u2} (đơn vị bé hơn): ta nhân hay chia?`, `To change ${u0} to ${u2} (a smaller unit), do you multiply or divide?`), ch(rng, L('Nhân', 'Multiply'), [L('Chia', 'Divide')]),
          L(`Đổi ra đơn vị bé hơn thì nhân. Đi qua hai bước: ${u0} → ${u1} → ${u2}, mỗi bước nhân với 100.`, `Multiply to change to a smaller unit. There are two steps: ${u0} → ${u1} → ${u2}, each one × 100.`)),
        S(`${a} ${u0} = ? ${u1}`, num(a * 100, u1), `${a} ${u0} = ${a * 100} ${u1}.`),
        S(`${a * 100} ${u1} = ? ${u2}`, num(a * 10000, u2), `${a * 100} ${u1} = ${F(a * 10000)} ${u2}.`),
      ],
      SO(`${a} ${u0} = ${F(a * 10000)} ${u2}`));
  }
  function dtSimple(rng, i) {
    const a = R(rng, 2, i === 0 ? 9 : 40), k = R(rng, 0, 2), big = AU[k], sm = AU[k + 1];
    if (i === 0) return Q(`${MISS}\n${a} ${big} = ? ${sm}`, num(a * 100, sm), `${AREA_RULE}\n${a} ${big} = ${F(a * 100)} ${sm}.`, { hint: AREA_RULE });
    if (i === 1) return Q(`${MISS}\n${F(a * 100)} ${sm} = ? ${big}`, num(a, big), L(`100 ${sm} = 1 ${big}.\n${F(a * 100)} ${sm} = ${a} ${big} (lấy ${F(a * 100)} : 100).`, `100 ${sm} = 1 ${big}.\n${F(a * 100)} ${sm} = ${a} ${big} (${F(a * 100)} : 100).`), { hint: AREA_RULE });
    if (i === 2) return toQ(dtCompound(rng), AREA_RULE);
    return toQ(dtTwoHops(rng), AREA_RULE);
  }
  function dtCompare(rng) {
    const k = R(rng, 0, 2), big = AU[k], sm = AU[k + 1], x = R(rng, 2, 9), y = P(rng, [x * 100, x * 100, x * 10, x * 1000, x * 100 + 10, x * 100 - 10]);
    const left = `${x} ${big}`, right = `${F(y)} ${sm}`;
    return Q(L(`So sánh: ${left} … ${right}`, `Compare: ${left} … ${right}`), cmp(x * 100, y), L(`Đổi: ${left} = ${x * 100} ${sm}. ${x * 100} ${sign(x * 100, y)} ${F(y)} nên ${left} ${sign(x * 100, y)} ${right}.`, `Change: ${left} = ${x * 100} ${sm}. ${x * 100} ${sign(x * 100, y)} ${F(y)}, so ${left} ${sign(x * 100, y)} ${right}.`),
      { hint: L(`Đổi ${left} ra ${sm} rồi so sánh.`, `Change ${left} to ${sm}, then compare.`), visual: vz('compare', { left, right }) });
  }
  function dtSum(rng) {
    const a = R(rng, 2, 9), b = R(rng, 12, 95), [x, y, xE, yE] = P(rng, [['Tấm bìa đỏ', 'tấm bìa xanh', 'A red card', 'a blue card'], ['Tờ giấy màu vàng', 'tờ giấy màu tím', 'A sheet of yellow paper', 'a sheet of purple paper']]);
    return lines(L(`${x} có diện tích ${a} dm², ${y} có diện tích ${b} cm². Hỏi cả hai có diện tích bao nhiêu xăng-ti-mét vuông?`, `${xE} has an area of ${a} dm² and ${yE} has an area of ${b} cm². What is their total area in square centimetres?`),
      [[a * 100, 'cm²', L(`Đổi: ${a} dm² = ${a * 100} cm².`, `Change: ${a} dm² = ${a * 100} cm².`)], [a * 100 + b, 'cm²', L(`Diện tích cả hai: ${a * 100} + ${b} = ${a * 100 + b} (cm²).`, `Total area: ${a * 100} + ${b} = ${a * 100 + b} (cm²).`)]],
      L('Đổi về cùng đơn vị cm² rồi cộng.', 'Change both to cm², then add.'));
  }
  function dtTiles(rng) {
    const t = P(rng, [2, 4, 5]), a = R(rng, 6, 40), [room, roomE] = P(rng, [['Một căn phòng', 'A room'], ['Một lối đi', 'A path'], ['Một góc sân', 'A corner of a yard']]);
    return lines(L(`${room} có diện tích ${a} m² được lát kín bằng các viên gạch như nhau, mỗi viên có diện tích ${t} dm². Hỏi cần bao nhiêu viên gạch?`, `${roomE} with an area of ${a} m² is covered with equal tiles. Each tile has an area of ${t} dm². How many tiles are needed?`),
      [[a * 100, 'dm²', L(`Đổi: ${a} m² = ${F(a * 100)} dm².`, `Change: ${a} m² = ${F(a * 100)} dm².`)], [a * 100 / t, '', L(`Số viên gạch cần dùng: ${F(a * 100)} : ${t} = ${F(a * 100 / t)} (viên).`, `Number of tiles: ${F(a * 100)} : ${t} = ${F(a * 100 / t)} (tiles).`)]],
      L('Đổi diện tích ra đề-xi-mét vuông rồi chia cho diện tích một viên gạch.', 'Change the area to square decimetres, then divide by the area of one tile.'));
  }
  function dtBoard(rng) {
    const w = R(rng, 2, 9), h = R(rng, 3, 9);
    return lines(L(`Một tấm bảng hình chữ nhật dài ${w} m, rộng ${h} dm. Tính diện tích tấm bảng theo đề-xi-mét vuông.`, `A rectangular board is ${w} m long and ${h} dm wide. Work out its area in square decimetres.`),
      [[w * 10, 'dm', L(`Đổi: ${w} m = ${w * 10} dm.`, `Change: ${w} m = ${w * 10} dm.`)], [w * 10 * h, 'dm²', L(`Diện tích tấm bảng: ${w * 10} × ${h} = ${w * 10 * h} (dm²).`, `Area of the board: ${w * 10} × ${h} = ${w * 10 * h} (dm²).`)]],
      L('Đổi chiều dài ra đề-xi-mét trước.', 'Change the length to decimetres first.'), vz('shape', { kind: 'rect', dims: { a: w * 10, b: h, unit: 'dm' }, showDims: true }));
  }
  function dtLeft(rng) {
    const a = R(rng, 3, 9), b = R(rng, 2, 9) * 5, n = R(rng, 2, 6);
    return lines(L(`Một tấm vải có diện tích ${a} m². Cô thợ may cắt ra ${n} mảnh, mỗi mảnh ${b} dm². Hỏi tấm vải còn lại bao nhiêu đề-xi-mét vuông?`, `A piece of cloth has an area of ${a} m². A dressmaker cuts off ${n} pieces of ${b} dm² each. How many square decimetres of cloth are left?`),
      [[a * 100, 'dm²', L(`Đổi: ${a} m² = ${a * 100} dm².`, `Change: ${a} m² = ${a * 100} dm².`)], [b * n, 'dm²', L(`Đã cắt: ${b} × ${n} = ${b * n} (dm²).`, `Cut off: ${b} × ${n} = ${b * n} (dm²).`)], [a * 100 - b * n, 'dm²', L(`Còn lại: ${a * 100} ${M} ${b * n} = ${a * 100 - b * n} (dm²).`, `Left: ${a * 100} ${M} ${b * n} = ${a * 100 - b * n} (dm²).`)]],
      L('Đổi m² ra dm², tính phần đã cắt, rồi trừ.', 'Change m² to dm², work out what was cut off, then subtract.'));
  }

  // ================= 4. Giây, thế kỉ (Bài 19) =================
  const EVENTS = [['Bác Hồ sinh năm 1890', 'President Hồ Chí Minh was born in 1890', 1890], ['Cách mạng tháng Tám thành công năm 1945', 'The August Revolution succeeded in 1945', 1945],
    ['Ngô Quyền chiến thắng trên sông Bạch Đằng năm 938', 'Ngô Quyền won the Battle of Bạch Đằng in 938', 938], ['Lý Thái Tổ dời đô về Thăng Long năm 1010', 'King Lý Thái Tổ moved the capital to Thăng Long in 1010', 1010],
    ['Nguyễn Trãi sinh năm 1380', 'Nguyễn Trãi was born in 1380', 1380], ['Quang Trung đại phá quân Thanh năm 1789', 'King Quang Trung defeated the Qing army in 1789', 1789]];
  const cen = c => L(`thế kỉ ${roman(c)}`, `the ${ord(c)} century (${roman(c)})`);
  function tgRun(rng) {
    const name = DT.name(rng), m = R(rng, 1, 5), s = R(rng, 5, 55), v = m * 60 + s, [act, actE] = P(rng, [['chạy một vòng quanh sân trường', 'runs once round the playground'], ['bơi hết một vòng bể', 'swims one length of the pool and back'], ['giải xong một câu đố', 'solves a puzzle']]);
    return G(
      L(`${name} ${act} hết ${m} phút ${s} giây. Hỏi ${name} làm việc đó hết bao nhiêu giây?`, `${name} ${actE} in ${pl(m, 'minute')} ${s} seconds. How many seconds is that?`),
      [
        S(L('1 phút bằng bao nhiêu giây?', 'How many seconds are there in 1 minute?'), ch(rng, L('60 giây', '60 seconds'), [L('100 giây', '100 seconds'), L('10 giây', '10 seconds')]), L('1 phút = 60 giây.', '1 minute = 60 seconds.')),
        S(L(`${m} phút = ? giây`, `${pl(m, 'minute')} = ? seconds`), num(m * 60, L('giây', 'seconds')), L(`${m} phút = ${m * 60} giây (lấy 60 × ${m}).`, `${pl(m, 'minute')} = ${m * 60} seconds (60 × ${m}).`)),
        S(L(`Cộng thêm ${s} giây: ${m} phút ${s} giây = ? giây`, `Add the ${s} seconds: ${pl(m, 'minute')} ${s} seconds = ? seconds`), num(v, L('giây', 'seconds')), L(`${m} phút ${s} giây = ${m * 60} giây + ${s} giây = ${v} giây.`, `${pl(m, 'minute')} ${s} seconds = ${m * 60} seconds + ${s} seconds = ${v} seconds.`)),
      ],
      DS(`${v} giây`, `${v} seconds`));
  }
  function tgCentury(rng) {
    let ev, evE, y;
    if (R(rng, 0, 2)) [ev, evE, y] = P(rng, EVENTS);
    else { y = R(rng, 11, 20) * 100 + R(rng, 1, 99); ev = `Một ngôi đình cổ được xây dựng năm ${y}`; evE = `An old village hall was built in ${y}`; }
    const h = Math.floor(y / 100), c = h + 1;
    return G(
      L(`${ev}. Hỏi năm đó thuộc thế kỉ nào?`, `${evE}. Which century is that year in?`),
      [
        S(L('1 thế kỉ bằng bao nhiêu năm?', 'How many years are there in 1 century?'), ch(rng, L('100 năm', '100 years'), [L('10 năm', '10 years'), L('1000 năm', '1000 years')]),
          L('1 thế kỉ = 100 năm. Từ năm 1 đến năm 100 là thế kỉ I, từ năm 101 đến năm 200 là thế kỉ II, …', '1 century = 100 years. The years 1 to 100 are the 1st century, the years 101 to 200 are the 2nd century, …')),
        S(L(`Bỏ hai chữ số cuối của số ${y}, ta được số nào?`, `Take away the last two digits of ${y}. What number is left?`), num(h), L(`Bỏ hai chữ số cuối của ${y}, ta được ${h}: đã qua ${h} thế kỉ trọn vẹn.`, `Without its last two digits, ${y} becomes ${h}: ${pl(h, 'whole century', 'whole centuries')} have passed.`)),
        S(L(`Hai chữ số cuối khác 00 nên lấy ${h} + 1. Năm ${y} thuộc thế kỉ thứ mấy?`, `The last two digits are not 00, so work out ${h} + 1. Which century is the year ${y} in? Type the number.`), num(c),
          L(`${h} + 1 = ${c}. Năm ${y} thuộc ${cen(c)} (từ năm ${(c - 1) * 100 + 1} đến năm ${c * 100}).`, `${h} + 1 = ${c}. The year ${y} is in ${cen(c)}, which runs from the year ${(c - 1) * 100 + 1} to the year ${c * 100}.`)),
      ],
      DS(cen(c)));
  }
  function tgSimple(rng, i) {
    const a = R(rng, 2, 9);
    if (i === 1) return toQ(tgRun(rng), L('Đổi phút ra giây rồi cộng với số giây.', 'Change the minutes to seconds, then add the seconds.'));
    if (i === 3) {
      const y = R(rng, 0, 3) ? R(rng, 101, 2099) : R(rng, 2, 20) * 100, c = centuryOf(y);
      return Q(L(`Năm ${y} thuộc thế kỉ thứ mấy? (Viết bằng số.)`, `Which century is the year ${y} in? Type the number.`), num(c),
        L(`Thế kỉ thứ ${c} gồm các năm từ ${(c - 1) * 100 + 1} đến ${c * 100}. Năm ${y} thuộc ${cen(c)}.`, `The ${ord(c)} century is the years ${(c - 1) * 100 + 1} to ${c * 100}. The year ${y} is in ${cen(c)}.`),
        { hint: L('Bỏ hai chữ số cuối rồi cộng 1; nếu hai chữ số cuối là 00 thì không cộng.', 'Take away the last two digits and add 1; if the last two digits are 00, do not add.') });
    }
    const [p, v, u] = P(rng, i === 0 ? [[L(`${a} phút = ? giây`, `${a} minutes = ? seconds`), a * 60, L('giây', 'seconds')], [L(`${a} thế kỉ = ? năm`, `${a} centuries = ? years`), a * 100, L('năm', 'years')], [L(`${a} giờ = ? phút`, `${a} hours = ? minutes`), a * 60, L('phút', 'minutes')]]
      : [[L(`${a * 60} giây = ? phút`, `${a * 60} seconds = ? minutes`), a, L('phút', 'minutes')], [L(`${a * 100} năm = ? thế kỉ`, `${a * 100} years = ? centuries`), a, L('thế kỉ', 'centuries')], [L(`${a * 60} phút = ? giờ`, `${a * 60} minutes = ? hours`), a, L('giờ', 'hours')]]);
    const rule = L('1 giờ = 60 phút; 1 phút = 60 giây; 1 thế kỉ = 100 năm.', '1 hour = 60 minutes; 1 minute = 60 seconds; 1 century = 100 years.');
    return Q(`${MISS}\n${p}`, num(v, u), `${rule}\n${p.replace('?', F(v))}.`, { hint: rule });
  }
  function tgVary(rng, i) {
    if (i === 4) {
      const y = R(rng, 0, 2) ? R(rng, 901, 2025) : R(rng, 10, 20) * 100, c = centuryOf(y), C = n => L(`Thế kỉ ${roman(n)}`, `The ${ord(n)} century (${roman(n)})`);
      return Q(L(`Năm ${y} thuộc thế kỉ nào?`, `Which century is the year ${y} in?`), ch(rng, C(c), [C(c + 1), C(c - 1), C(c + 2)]),
        L(`${C(c)} gồm các năm từ ${(c - 1) * 100 + 1} đến ${c * 100}, nên năm ${y} thuộc ${cen(c)}.`, `${C(c)} is the years ${(c - 1) * 100 + 1} to ${c * 100}, so the year ${y} is in ${cen(c)}.`),
        { hint: L('Bỏ hai chữ số cuối rồi cộng 1; nếu hai chữ số cuối là 00 thì không cộng.', 'Take away the last two digits and add 1; if the last two digits are 00, do not add.') });
    }
    if (i === 5) {
      const [x, y] = DT.names(rng, 2), m = R(rng, 1, 2), s = R(rng, 5, 50), a = m * 60 + s; let b = a + P(rng, [-12, -7, -3, 4, 8, 15]);
      return Q(L(`${x} chạy 400 m hết ${m} phút ${s} giây. ${y} chạy 400 m hết ${b} giây. Ai chạy nhanh hơn?`, `${x} runs 400 m in ${pl(m, 'minute')} ${s} seconds. ${y} runs 400 m in ${b} seconds. Who is faster?`), ch(rng, a < b ? x : y, [a < b ? y : x, L('Hai bạn nhanh như nhau', 'They are equally fast')]),
        L(`${m} phút ${s} giây = ${a} giây. ${Math.min(a, b)} giây < ${Math.max(a, b)} giây. Ai chạy hết ít thời gian hơn thì nhanh hơn: ${a < b ? x : y}.`, `${pl(m, 'minute')} ${s} seconds = ${a} seconds. ${Math.min(a, b)} seconds < ${Math.max(a, b)} seconds. The one who takes less time is faster: ${a < b ? x : y}.`),
        { hint: L('Đổi về giây rồi so sánh. Ít thời gian hơn là nhanh hơn.', 'Change both to seconds, then compare. Less time means faster.') });
    }
    const c = R(rng, 2, 21), first = R(rng, 0, 1) === 1;
    return Q(first ? L(`Thế kỉ ${roman(c)} bắt đầu từ năm nào?`, `In which year does the ${ord(c)} century (${roman(c)}) begin?`) : L(`Năm cuối cùng của thế kỉ ${roman(c)} là năm nào?`, `Which is the last year of the ${ord(c)} century (${roman(c)})?`),
      num(first ? (c - 1) * 100 + 1 : c * 100),
      L(`Thế kỉ ${roman(c)} (thế kỉ thứ ${c}) gồm 100 năm: từ năm ${(c - 1) * 100 + 1} đến năm ${c * 100}.`, `The ${ord(c)} century has 100 years: from the year ${(c - 1) * 100 + 1} to the year ${c * 100}.`),
      { hint: L('Thế kỉ I từ năm 1 đến năm 100; thế kỉ II từ năm 101 đến năm 200.', 'The 1st century is the years 1 to 100; the 2nd century is the years 101 to 200.') });
  }
  function tgLaps(rng) {
    const name = DT.name(rng), m1 = R(rng, 1, 3), s1 = R(rng, 20, 55), m2 = R(rng, 1, 3), s2 = R(rng, 20, 55), a = m1 * 60 + s1, b = m2 * 60 + s2;
    return lines(L(`${name} chạy vòng thứ nhất hết ${m1} phút ${s1} giây, vòng thứ hai hết ${m2} phút ${s2} giây. Hỏi ${name} chạy cả hai vòng hết bao nhiêu giây?`, `${name} runs the first lap in ${pl(m1, 'minute')} ${s1} seconds and the second lap in ${pl(m2, 'minute')} ${s2} seconds. How many seconds do the two laps take altogether?`),
      [[a, '', L(`Vòng thứ nhất: ${m1} phút ${s1} giây = ${a} giây.`, `Lap 1: ${pl(m1, 'minute')} ${s1} seconds = ${a} seconds.`)], [b, '', L(`Vòng thứ hai: ${m2} phút ${s2} giây = ${b} giây.`, `Lap 2: ${pl(m2, 'minute')} ${s2} seconds = ${b} seconds.`)],
        [a + b, L('giây', 'seconds'), L(`Cả hai vòng: ${a} + ${b} = ${a + b} (giây).`, `Both laps: ${a} + ${b} = ${a + b} (seconds).`)]],
      L('Đổi từng số đo ra giây rồi cộng.', 'Change each time to seconds, then add.'));
  }

  // ================= 5. Tính bằng cách thuận tiện — phép cộng (Bài 24) =================
  // x + z + y where x + y is a round number (100 or 1000) and z makes no round number with x or y
  function ttc3(rng, big) {
    const T = big ? 1000 : 100, x = big ? R(rng, 101, 899) : R(rng, 11, 89), y = T - x; let z = R(rng, big ? 120 : 101, big ? 4999 : 899);
    while ((z + x) % 100 === 0 || (z + y) % 100 === 0 || z % 100 === 0) z++;
    const e = `${F(x)} + ${F(z)} + ${F(y)}`, round = big ? L('tròn nghìn', 'a whole thousand') : L('tròn trăm', 'a whole hundred');
    return G(`${EASY}\n${e}`,
      [
        S(L(`Hai số nào cộng với nhau được số ${round}?`, `Which two numbers add up to ${round}?`), ch(rng, L(`${x} và ${y}`, `${x} and ${y}`), [L(`${x} và ${F(z)}`, `${x} and ${F(z)}`), L(`${F(z)} và ${y}`, `${F(z)} and ${y}`)]),
          L(`${x} + ${y} = ${F(T)}. Ta đổi chỗ rồi nhóm hai số này: ${e} = ${F(z)} + (${x} + ${y}).`, `${x} + ${y} = ${F(T)}. Swap the addends and group these two: ${e} = ${F(z)} + (${x} + ${y}).`),
          L('Nhìn chữ số hàng đơn vị: hai chữ số nào cộng lại được 10?', 'Look at the ones digits: which two add up to 10?')),
        S(`${x} + ${y} = ?`, num(T), `${x} + ${y} = ${F(T)}.`),
        S(`${F(z)} + ${F(T)} = ?`, num(z + T), `${F(z)} + ${F(T)} = ${F(z + T)}.`),
      ],
      SO(`${e} = ${F(z)} + (${x} + ${y}) = ${F(z)} + ${F(T)} = ${F(z + T)}`));
  }
  // a + b + c + d where a + c and b + d are round numbers
  function ttc4(rng, big, word) {
    const T = big ? 1000 : 100, lo = big ? 1001 : 101, hi = big ? 5899 : 499;
    let a = R(rng, lo, hi), b = R(rng, lo, hi);
    while (a % 100 === 0) a++;
    const c = T - a % T;
    while (b % 100 === c % 100 || b % 100 === a % 100 || b % 100 === 0) b++;
    const d = T - b % T, s1 = a + c, s2 = b + d, e = `${F(a)} + ${F(b)} + ${F(c)} + ${F(d)}`;
    const round = big ? L('tròn nghìn', 'a whole number of thousands') : L('tròn trăm', 'a whole number of hundreds');
    const prompt = word ? L(`Bốn thôn trồng được lần lượt là ${F(a)} cây, ${F(b)} cây, ${F(c)} cây và ${F(d)} cây. Hỏi cả bốn thôn trồng được bao nhiêu cây? (Tính bằng cách thuận tiện.)`,
      `Four villages plant ${F(a)}, ${F(b)}, ${F(c)} and ${F(d)} trees. How many trees do they plant altogether? (Calculate in the easiest way.)`) : `${EASY}\n${e}`;
    return G(prompt,
      [
        S(L(`Số ${F(a)} ghép với số nào thì được số ${round}?`, `Which number goes with ${F(a)} to make ${round}?`), ch(rng, c, [b, d]),
          L(`${F(a)} + ${F(c)} = ${F(s1)}. Hai số còn lại cũng ghép được: ${F(b)} + ${F(d)} = ${F(s2)}.`, `${F(a)} + ${F(c)} = ${F(s1)}. The other two also go together: ${F(b)} + ${F(d)} = ${F(s2)}.`),
          L('Nhìn hai chữ số cuối: hai số nào cộng lại được 100?', 'Look at the last two digits: which two add up to 100?')),
        S(`${F(a)} + ${F(c)} = ?`, num(s1), `${F(a)} + ${F(c)} = ${F(s1)}.`),
        S(`${F(b)} + ${F(d)} = ?`, num(s2), `${F(b)} + ${F(d)} = ${F(s2)}.`),
        S(`${F(s1)} + ${F(s2)} = ?`, num(s1 + s2), `${F(s1)} + ${F(s2)} = ${F(s1 + s2)}.`),
      ],
      word ? DS(`${F(s1 + s2)} cây`, `${F(s1 + s2)} trees`) : SO(`${e} = (${F(a)} + ${F(c)}) + (${F(b)} + ${F(d)}) = ${F(s1)} + ${F(s2)} = ${F(s1 + s2)}`));
  }
  const TTC_HINT = L('Tìm các cặp số có tổng là số tròn trăm, tròn nghìn rồi nhóm lại.', 'Find pairs that make whole hundreds or thousands and group them.');
  function ttcVary(rng, i) {
    if (i === 4) return toQ(ttc4(rng, false, true), TTC_HINT);
    if (i === 5) {
      const a = R(rng, 100, 999), b = R(rng, 100, 999), c = R(rng, 10, 99);
      return R(rng, 0, 1) ? Q(`${MISS}\n${a} + ${b} = ${b} + ?`, num(a), L(`Tính chất giao hoán: đổi chỗ các số hạng thì tổng không thay đổi. ${a} + ${b} = ${b} + ${a}.`, `The commutative property: swapping the addends does not change the sum. ${a} + ${b} = ${b} + ${a}.`), { hint: 'a + b = b + a.' })
        : Q(`${MISS}\n(${a} + ${b}) + ${c} = ${a} + (? + ${c})`, num(b), L(`Tính chất kết hợp: (a + b) + c = a + (b + c). (${a} + ${b}) + ${c} = ${a} + (${b} + ${c}).`, `The associative property: (a + b) + c = a + (b + c). (${a} + ${b}) + ${c} = ${a} + (${b} + ${c}).`), { hint: '(a + b) + c = a + (b + c).' });
    }
    // five addends: two round pairs and one number left
    const g = ttc4(rng, false), w = R(rng, 11, 89), tot = g.steps[3].answer.value + w, e = g.prompt.split('\n')[1] + ` + ${w}`;
    return Q(`${EASY}\n${e}`, num(tot), g.steps.slice(1).map(s => s.say).join('\n') + '\n' + `${F(tot - w)} + ${w} = ${F(tot)}.`, { hint: TTC_HINT });
  }

  // ================= 6. Tìm hai số khi biết tổng và hiệu (Bài 25) =================
  // contexts: big / small long labels (lời giải), short labels (diagram), unit, the givens and the three questions
  function thCtx(rng, k, lvl) {
    const X = (b, d, o) => Object.assign({ b, d, a: b + d, S: 2 * b + d }, o);
    if (k === 1) return X(R(rng, 12, 20), R(rng, 1, 6), { big: L('Số học sinh nữ', 'The number of girls'), small: L('Số học sinh nam', 'The number of boys'), bs: L('Nữ', 'Girls'), ss: L('Nam', 'Boys'), u: L('học sinh', 'pupils'),
      giv: (S, d) => L(`Lớp 4A có ${S} học sinh. Số học sinh nữ nhiều hơn số học sinh nam ${d} bạn.`, `Class 4A has ${S} pupils. There are ${d} more girls than boys.`),
      q: [L('Hỏi lớp 4A có bao nhiêu học sinh nam, bao nhiêu học sinh nữ?', 'How many boys and how many girls are there in class 4A?'), L('Hỏi lớp 4A có bao nhiêu học sinh nữ?', 'How many girls are there in class 4A?'), L('Hỏi lớp 4A có bao nhiêu học sinh nam?', 'How many boys are there in class 4A?')] });
    if (k === 2) return X(R(rng, 6, 12), R(rng, 24, 32), { big: L('Tuổi bố', "The dad's age"), small: L('Tuổi con', "The child's age"), bs: L('Bố', 'Dad'), ss: L('Con', 'Child'), u: L('tuổi', 'years'),
      giv: (S, d) => L(`Tuổi bố và tuổi con cộng lại được ${S} tuổi. Bố hơn con ${d} tuổi.`, `A dad's age and his child's age add up to ${S} years. The dad is ${d} years older than the child.`),
      q: [L('Hỏi bố bao nhiêu tuổi, con bao nhiêu tuổi?', 'How old is the dad and how old is the child?'), L('Hỏi bố bao nhiêu tuổi?', 'How old is the dad?'), L('Hỏi con bao nhiêu tuổi?', 'How old is the child?')] });
    if (k === 3) return X(R(rng, 20, 90) * 10, R(rng, 2, 30) * 10, { big: L('Số thóc thửa thứ nhất', 'The rice from the first field'), small: L('Số thóc thửa thứ hai', 'The rice from the second field'), bs: L('Thửa 1', 'Field 1'), ss: L('Thửa 2', 'Field 2'), u: 'kg',
      giv: (S, d) => L(`Hai thửa ruộng thu hoạch được ${F(S)} kg thóc. Thửa thứ nhất thu hoạch được nhiều hơn thửa thứ hai ${d} kg thóc.`, `Two fields give ${F(S)} kg of rice altogether. The first field gives ${d} kg more than the second.`),
      q: [L('Hỏi mỗi thửa ruộng thu hoạch được bao nhiêu ki-lô-gam thóc?', 'How many kilograms of rice does each field give?'), L('Hỏi thửa thứ nhất thu hoạch được bao nhiêu ki-lô-gam thóc?', 'How many kilograms of rice does the first field give?'), L('Hỏi thửa thứ hai thu hoạch được bao nhiêu ki-lô-gam thóc?', 'How many kilograms of rice does the second field give?')] });
    if (k === 4) return X(R(rng, 25, 70), R(rng, 4, 24), { big: L('Số sách ngăn dưới', 'The number of books on the bottom shelf'), small: L('Số sách ngăn trên', 'The number of books on the top shelf'), bs: L('Ngăn dưới', 'Bottom'), ss: L('Ngăn trên', 'Top'), u: L('quyển', 'books'),
      giv: (S, d) => L(`Hai ngăn sách có tất cả ${S} quyển sách. Ngăn trên có ít hơn ngăn dưới ${d} quyển.`, `Two shelves hold ${S} books altogether. The top shelf has ${d} fewer books than the bottom shelf.`),
      q: [L('Hỏi mỗi ngăn có bao nhiêu quyển sách?', 'How many books are there on each shelf?'), L('Hỏi ngăn dưới có bao nhiêu quyển sách?', 'How many books are there on the bottom shelf?'), L('Hỏi ngăn trên có bao nhiêu quyển sách?', 'How many books are there on the top shelf?')] });
    if (k === 5) return X(R(rng, 8, 30), R(rng, 2, 15), { big: L('Chiều dài', 'The length'), small: L('Chiều rộng', 'The width'), bs: L('Dài', 'Length'), ss: L('Rộng', 'Width'), u: 'm',
      giv: (S, d) => L(`Một mảnh vườn hình chữ nhật có nửa chu vi là ${S} m. Chiều dài hơn chiều rộng ${d} m.`, `Half the perimeter of a rectangular garden is ${S} m. The length is ${d} m more than the width.`),
      q: [L('Tính chiều dài và chiều rộng của mảnh vườn.', 'Find the length and the width of the garden.'), L('Tính chiều dài của mảnh vườn.', 'Find the length of the garden.'), L('Tính chiều rộng của mảnh vườn.', 'Find the width of the garden.')] });
    return X(R(rng, lvl ? 120 : 12, lvl ? 900 : 60), R(rng, 2, lvl ? 200 : 30), { big: L('Số lớn', 'The bigger number'), small: L('Số bé', 'The smaller number'), bs: L('Số lớn', 'Bigger'), ss: L('Số bé', 'Smaller'), u: '',
      giv: (S, d) => L(`Tổng của hai số là ${F(S)}. Hiệu của hai số đó là ${F(d)}.`, `The sum of two numbers is ${F(S)}. Their difference is ${F(d)}.`),
      q: [L('Tìm hai số đó.', 'Find the two numbers.'), L('Tìm số lớn.', 'Find the bigger number.'), L('Tìm số bé.', 'Find the smaller number.')] });
  }
  // ask: 0 both numbers, 1 the bigger, 2 the smaller
  function thForm(rng, k, ask, lvl) {
    const c = thCtx(rng, k, lvl), { a, b, d, S: sum } = c, un = c.u ? ` (${c.u})` : '', uu = c.u ? ` ${c.u}` : '';
    const steps = [
      S(L('Bài toán cho biết gì?', 'What does the problem tell you?'),
        ch(rng, L(`Tổng là ${F(sum)}, hiệu là ${F(d)}`, `The sum is ${F(sum)}, the difference is ${F(d)}`), [L(`Tổng là ${F(d)}, hiệu là ${F(sum)}`, `The sum is ${F(d)}, the difference is ${F(sum)}`), L(`Số lớn là ${F(sum)}, số bé là ${F(d)}`, `The bigger number is ${F(sum)}, the smaller is ${F(d)}`)]),
        k === 0 ? L(`Tổng là ${F(sum)}, hiệu là ${F(d)}. Đây là dạng toán tổng – hiệu.`, `The sum is ${F(sum)} and the difference is ${F(d)}. This is a sum-and-difference problem.`)
          : L(`Tổng là ${F(sum)}, hiệu là ${F(d)}. ${c.big} là số lớn, ${lc(c.small)} là số bé.`, `The sum is ${F(sum)} and the difference is ${F(d)}. ${c.big} is the bigger number; ${lc(c.small)} is the smaller number.`)),
      S(L(`Bớt phần hơn (${F(d)}) ở số lớn thì được hai lần số bé. Hai lần số bé là bao nhiêu?`, `Take the extra ${F(d)} away from the bigger number: you get twice the smaller number. How much is twice the smaller number?`), num(sum - d),
        L(`Hai lần ${lc(c.small)}: ${F(sum)} ${M} ${F(d)} = ${F(sum - d)}${un}.`, `Twice ${lc(c.small)}: ${F(sum)} ${M} ${F(d)} = ${F(sum - d)}${un}.`), L('Lấy tổng trừ hiệu.', 'Sum minus difference.')),
      S(L(`${c.small} là bao nhiêu?`, `What is ${lc(c.small)}?`), num(b, c.u),
        L(`${c.small} là: (${F(sum)} ${M} ${F(d)}) : 2 = ${F(b)}${un}.`, `${c.small}: (${F(sum)} ${M} ${F(d)}) : 2 = ${F(b)}${un}.`), L(`Lấy ${F(sum - d)} : 2.`, `Work out ${F(sum - d)} : 2.`)),
      S(L(`${c.big} là bao nhiêu?`, `What is ${lc(c.big)}?`), num(a, c.u),
        L(`${c.big} là: ${F(b)} + ${F(d)} = ${F(a)}${un}.`, `${c.big}: ${F(b)} + ${F(d)} = ${F(a)}${un}.`), L('Số lớn = số bé + hiệu.', 'Bigger number = smaller number + difference.')),
    ];
    const g = G(`${c.giv(sum, d)} ${c.q[ask]}`, steps,
      ask === 1 ? DS(`${F(a)}${uu}`) : ask === 2 ? DS(`${F(b)}${uu}`) : DS(`${c.ss}: ${F(b)}${uu}; ${c.bs}: ${F(a)}${uu}`),
      vz('tape', { bars: [{ label: c.bs, units: units(a, a), value: '?' }, { label: c.ss, units: units(b, a), value: '?' }], total: F(sum) + uu, diff: F(d) + uu }));
    g.pick = ask === 2 ? steps[2].answer : steps[3].answer;
    if (ask === 2) g.steps = steps.slice(0, 3);   // only the smaller number is asked (practice): stop there
    return g;
  }
  const TH_HINT = L('Số bé = (Tổng − Hiệu) : 2. Số lớn = (Tổng + Hiệu) : 2.', 'Smaller number = (Sum − Difference) : 2. Bigger number = (Sum + Difference) : 2.');
  function thPerimeter(rng) {
    const b = R(rng, 8, 30), d = R(rng, 2, 15), a = b + d, half = a + b;
    return lines(L(`Một sân chơi hình chữ nhật có chu vi ${half * 2} m. Chiều dài hơn chiều rộng ${d} m. Tính chiều dài của sân chơi.`, `The perimeter of a rectangular playground is ${half * 2} m. The length is ${d} m more than the width. Find the length of the playground.`),
      [[half, '', L(`Nửa chu vi (tổng của chiều dài và chiều rộng): ${half * 2} : 2 = ${half} (m).`, `Half the perimeter (length + width): ${half * 2} : 2 = ${half} (m).`)],
        [a, 'm', L(`Chiều dài: (${half} + ${d}) : 2 = ${a} (m).`, `Length: (${half} + ${d}) : 2 = ${a} (m).`)]],
      L('Nửa chu vi là tổng của chiều dài và chiều rộng.', 'Half the perimeter is the sum of the length and the width.'),
      vz('tape', { bars: [{ label: L('Dài', 'Length'), units: units(a, a), value: '?' }, { label: L('Rộng', 'Width'), units: units(b, a), value: '?' }], total: half + ' m', diff: d + ' m' }));
  }
  function thGive(rng) {
    const [x, y] = DT.names(rng, 2), k = R(rng, 2, 9), b = R(rng, 10, 40), a = b + 2 * k, sum = a + b, [it, itE] = P(rng, [['viên bi', 'marbles'], ['nhãn vở', 'stickers'], ['quyển truyện', 'storybooks']]);
    return lines(L(`${x} và ${y} có tất cả ${sum} ${it}. Nếu ${x} cho ${y} ${k} ${it} thì hai bạn có số ${it} bằng nhau. Hỏi lúc đầu ${x} có bao nhiêu ${it}?`, `${x} and ${y} have ${sum} ${itE} altogether. If ${x} gives ${y} ${k} ${itE}, they will both have the same number. How many ${itE} does ${x} have at the start?`),
      [[2 * k, '', L(`${x} cho ${y} ${k} ${it} thì bằng nhau, nên lúc đầu ${x} hơn ${y}: ${k} × 2 = ${2 * k} (${it}).`, `Giving ${k} makes them equal, so at the start ${x} has ${k} × 2 = ${2 * k} more ${itE} than ${y}.`)],
        [a, '', L(`Lúc đầu ${x} có: (${sum} + ${2 * k}) : 2 = ${a} (${it}).`, `At the start ${x} has: (${sum} + ${2 * k}) : 2 = ${a} (${itE}).`)]],
      L(`Hiệu của hai số gấp 2 lần số ${it} đem cho.`, 'The difference is twice the number given away.'));
  }

  // ================= 7. Chu vi và diện tích hình chữ nhật, hình vuông =================
  const rect = (a, b, unit) => vz('shape', { kind: 'rect', dims: { a, b, unit }, showDims: true });
  const PLACES = [['Một mảnh vườn', 'mảnh vườn', 'A garden', 'garden'], ['Một sân chơi', 'sân chơi', 'A playground', 'playground'], ['Một thửa ruộng', 'thửa ruộng', 'A field', 'field'], ['Một ao cá', 'ao cá', 'A fish pond', 'pond']];
  function cvFence(rng) {
    const a = R(rng, 12, 40), b = R(rng, 4, 9);   // học kì I: only one-digit multipliers
    const [A1, a1, E1, e1] = P(rng, PLACES), per = (a + b) * 2;
    return G(
      L(`${A1} hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Người ta làm hàng rào xung quanh ${a1}. Hỏi hàng rào dài bao nhiêu mét? Diện tích ${a1} là bao nhiêu mét vuông?`,
        `${E1} is a rectangle ${a} m long and ${b} m wide. A fence is built all the way round the ${e1}. How long is the fence? What is the area of the ${e1}?`),
      [
        S(L(`Hàng rào chạy xung quanh ${a1}. Độ dài hàng rào là gì của hình chữ nhật?`, `The fence goes all the way round the ${e1}. Which measure of the rectangle is its length?`), ch(rng, L('Chu vi', 'The perimeter'), [L('Diện tích', 'The area'), L('Chiều dài', 'The length')]),
          L('Đường bao quanh là chu vi. Chu vi hình chữ nhật = (dài + rộng) × 2.', 'The line all the way round is the perimeter. Perimeter of a rectangle = (length + width) × 2.')),
        S(L(`Chiều dài cộng chiều rộng: ${a} + ${b} = ?`, `Length plus width: ${a} + ${b} = ?`), num(a + b, 'm'), `${a} + ${b} = ${a + b} (m).`),
        S(L('Hàng rào (chu vi) dài bao nhiêu mét?', 'How long is the fence (the perimeter)?'), num(per, 'm'), L(`Hàng rào dài: (${a} + ${b}) × 2 = ${per} (m).`, `Length of the fence: (${a} + ${b}) × 2 = ${per} (m).`)),
        S(L(`Diện tích = dài × rộng. Diện tích ${a1} là bao nhiêu mét vuông?`, `Area = length × width. What is the area of the ${e1}?`), num(a * b, 'm²'), L(`Diện tích ${a1}: ${a} × ${b} = ${F(a * b)} (m²).`, `Area of the ${e1}: ${a} × ${b} = ${F(a * b)} (m²).`)),
      ],
      DS(`hàng rào dài ${per} m; diện tích ${F(a * b)} m²`, `fence ${per} m; area ${F(a * b)} m²`), rect(a, b, 'm'));
  }
  // ask: 0 both (guide), 1 perimeter, 2 area
  function cvTimes(rng, ask) {
    const b = R(rng, 3, 9), k = R(rng, 2, 4), a = b * k, per = (a + b) * 2, [it, itE] = P(rng, [['tấm bìa', 'card'], ['bức tranh', 'picture'], ['tấm kính', 'sheet of glass']]);
    const q = [L(`Tính chu vi và diện tích ${it}.`, `Find the perimeter and the area of the ${itE}.`), L(`Tính chu vi ${it}.`, `Find the perimeter of the ${itE}.`), L(`Tính diện tích ${it}.`, `Find the area of the ${itE}.`)][ask || 0];
    const steps = [
      S(L('Muốn tính chu vi và diện tích, trước hết phải tìm gì?', 'Before you can find the perimeter and the area, what must you find?'), ch(rng, L('Chiều dài', 'The length'), [L('Nửa chiều rộng', 'Half the width'), L('Cạnh hình vuông', 'The side of a square')]),
        L('Mới biết chiều rộng. Phải tìm chiều dài trước.', 'We only know the width. Find the length first.')),
      S(L(`Chiều dài gấp ${k} lần chiều rộng. Chiều dài là bao nhiêu xăng-ti-mét?`, `The length is ${k} times the width. How long is it?`), num(a, 'cm'), L(`Chiều dài: ${b} × ${k} = ${a} (cm).`, `Length: ${b} × ${k} = ${a} (cm).`)),
      S(L('Chu vi = (dài + rộng) × 2. Chu vi là bao nhiêu?', 'Perimeter = (length + width) × 2. What is the perimeter?'), num(per, 'cm'), L(`Chu vi: (${a} + ${b}) × 2 = ${per} (cm).`, `Perimeter: (${a} + ${b}) × 2 = ${per} (cm).`)),
      S(L('Diện tích = dài × rộng. Diện tích là bao nhiêu?', 'Area = length × width. What is the area?'), num(a * b, 'cm²'), L(`Diện tích: ${a} × ${b} = ${F(a * b)} (cm²).`, `Area: ${a} × ${b} = ${F(a * b)} (cm²).`)),
    ];
    const g = G(L(`Một ${it} hình chữ nhật có chiều rộng ${b} cm, chiều dài gấp ${k} lần chiều rộng. ${q}`, `A rectangular ${itE} is ${b} cm wide. Its length is ${k} times its width. ${q}`),
      ask === 1 ? steps.slice(0, 3) : ask === 2 ? [steps[0], steps[1], steps[3]] : steps,
      ask === 1 ? DS(`${per} cm`) : ask === 2 ? DS(`${F(a * b)} cm²`) : DS(`chu vi ${per} cm; diện tích ${F(a * b)} cm²`, `perimeter ${per} cm; area ${F(a * b)} cm²`), rect(a, b, 'cm'));
    return g;
  }
  function cvSquare(rng) {
    const s = R(rng, 4, 10), per = s * 4, [A1, a1, E1, e1] = P(rng, PLACES.slice(0, 2).concat([['Một nền nhà', 'nền nhà', 'A floor', 'floor']]));
    return G(
      L(`${A1} hình vuông có chu vi ${per} m. Tính diện tích ${a1}.`, `${E1} is a square with a perimeter of ${per} m. Find the area of the ${e1}.`),
      [
        S(L('Biết chu vi, muốn tìm cạnh hình vuông ta làm thế nào?', 'You know the perimeter. How do you find the side of the square?'), ch(rng, `${per} : 4`, [`${per} × 4`, `${per} : 2`]),
          L('Hình vuông có 4 cạnh bằng nhau nên cạnh = chu vi : 4.', 'A square has 4 equal sides, so side = perimeter : 4.')),
        S(L('Cạnh hình vuông dài bao nhiêu mét?', 'How long is the side of the square?'), num(s, 'm'), L(`Cạnh ${a1}: ${per} : 4 = ${s} (m).`, `Side of the ${e1}: ${per} : 4 = ${s} (m).`)),
        S(L('Diện tích hình vuông = cạnh × cạnh. Diện tích là bao nhiêu?', 'Area of a square = side × side. What is the area?'), num(s * s, 'm²'), L(`Diện tích ${a1}: ${s} × ${s} = ${s * s} (m²).`, `Area of the ${e1}: ${s} × ${s} = ${s * s} (m²).`)),
      ],
      DS(`${s * s} m²`), vz('shape', { kind: 'square', dims: { a: s, unit: 'm' }, showDims: true }));
  }
  function cvPlain(rng, i) {
    const a = R(rng, 12, 45), b = R(rng, 4, 9), [A1, a1, E1, e1] = P(rng, PLACES);
    if (i === 0) return Q(L(`${A1} hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Tính chu vi ${a1}.`, `${E1} is a rectangle ${a} m long and ${b} m wide. Find the perimeter of the ${e1}.`), num((a + b) * 2, 'm'),
      L(`Chu vi ${a1}: (${a} + ${b}) × 2 = ${(a + b) * 2} (m).`, `Perimeter of the ${e1}: (${a} + ${b}) × 2 = ${(a + b) * 2} (m).`), { hint: L('Chu vi hình chữ nhật = (dài + rộng) × 2.', 'Perimeter of a rectangle = (length + width) × 2.'), visual: rect(a, b, 'm') });
    if (i === 1) return Q(L(`${A1} hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Tính diện tích ${a1}.`, `${E1} is a rectangle ${a} m long and ${b} m wide. Find the area of the ${e1}.`), num(a * b, 'm²'),
      L(`Diện tích ${a1}: ${a} × ${b} = ${F(a * b)} (m²).`, `Area of the ${e1}: ${a} × ${b} = ${F(a * b)} (m²).`), { hint: L('Diện tích hình chữ nhật = dài × rộng.', 'Area of a rectangle = length × width.'), visual: rect(a, b, 'm') });
    if (i === 2) {
      const area = R(rng, 0, 1) === 1, s = area ? R(rng, 4, 10) : R(rng, 6, 30);
      return Q(L(`Một viên gạch hình vuông có cạnh ${s} cm. Tính ${area ? 'diện tích' : 'chu vi'} viên gạch.`, `A square tile has sides of ${s} cm. Find its ${area ? 'area' : 'perimeter'}.`), num(area ? s * s : s * 4, area ? 'cm²' : 'cm'),
        area ? L(`Diện tích viên gạch: ${s} × ${s} = ${s * s} (cm²).`, `Area of the tile: ${s} × ${s} = ${s * s} (cm²).`) : L(`Chu vi viên gạch: ${s} × 4 = ${s * 4} (cm).`, `Perimeter of the tile: ${s} × 4 = ${s * 4} (cm).`),
        { hint: L('Chu vi hình vuông = cạnh × 4; diện tích hình vuông = cạnh × cạnh.', 'Perimeter of a square = side × 4; area of a square = side × side.'), visual: vz('shape', { kind: 'square', dims: { a: s, unit: 'cm' }, showDims: true }) });
    }
    return dtBoard(rng);
  }
  function cvVary(rng, i) {
    if (i === 5) return toQ(cvSquare(rng), L('Tìm cạnh trước: cạnh = chu vi : 4.', 'Find the side first: side = perimeter : 4.'));
    if (i === 6) return toQ(cvTimes(rng, R(rng, 1, 2)), L('Tìm chiều dài trước.', 'Find the length first.'));
    const b = R(rng, 4, 9), a = R(rng, b + 2, 30), area = a * b;
    return lines(L(`Một tấm thảm hình chữ nhật có diện tích ${area} dm², chiều rộng ${b} dm. Tính chu vi tấm thảm.`, `A rectangular rug has an area of ${area} dm² and a width of ${b} dm. Find the perimeter of the rug.`),
      [[a, 'dm', L(`Chiều dài tấm thảm: ${area} : ${b} = ${a} (dm).`, `Length of the rug: ${area} : ${b} = ${a} (dm).`)], [(a + b) * 2, 'dm', L(`Chu vi tấm thảm: (${a} + ${b}) × 2 = ${(a + b) * 2} (dm).`, `Perimeter of the rug: (${a} + ${b}) × 2 = ${(a + b) * 2} (dm).`)]],
      L('Chiều dài = diện tích : chiều rộng.', 'Length = area : width.'));
  }
  function cvHard(rng) {
    const b = R(rng, 4, 9), d = R(rng, 2, 15), a = b + d, half = a + b;
    return lines(L(`Một mảnh vườn hình chữ nhật có nửa chu vi ${half} m. Chiều dài hơn chiều rộng ${d} m. Tính diện tích mảnh vườn.`, `Half the perimeter of a rectangular garden is ${half} m. The length is ${d} m more than the width. Find the area of the garden.`),
      [[b, 'm', L(`Chiều rộng: (${half} ${M} ${d}) : 2 = ${b} (m).`, `Width: (${half} ${M} ${d}) : 2 = ${b} (m).`)], [a, 'm', L(`Chiều dài: ${b} + ${d} = ${a} (m).`, `Length: ${b} + ${d} = ${a} (m).`)],
        [a * b, 'm²', L(`Diện tích mảnh vườn: ${a} × ${b} = ${F(a * b)} (m²).`, `Area of the garden: ${a} × ${b} = ${F(a * b)} (m²).`)]],
      L('Nửa chu vi là tổng của chiều dài và chiều rộng: dạng toán tổng – hiệu.', 'Half the perimeter is length + width: a sum-and-difference problem.'));
  }

  // ================= 8. Tính bằng cách thuận tiện — phép nhân (Bài 40, 42) =================
  const PAIRS = [[25, 4], [5, 2], [50, 2], [125, 8], [20, 5], [250, 4]];
  function ttnPair(rng) {
    const [x, y] = P(rng, [[25, 4], [5, 2], [125, 8], [4, 25], [2, 5], [8, 125]]); let z = R(rng, 3, 99);   // no multiples of 10: any product with them is round
    while ((x * z) % 10 === 0 || (y * z) % 10 === 0 || z === x || z === y) z++;
    const e = `${x} × ${z} × ${y}`;
    return G(`${EASY}\n${e}`,
      [
        S(L('Hai thừa số nào nhân với nhau được số tròn chục, tròn trăm hoặc tròn nghìn?', 'Which two factors multiply to make a whole number of tens, hundreds or thousands?'),
          ch(rng, L(`${x} và ${y}`, `${x} and ${y}`), [L(`${x} và ${z}`, `${x} and ${z}`), L(`${z} và ${y}`, `${z} and ${y}`)]),
          L(`${x} × ${y} = ${F(x * y)}. Ta đổi chỗ rồi nhóm hai thừa số này: ${e} = ${z} × (${x} × ${y}).`, `${x} × ${y} = ${F(x * y)}. Swap the factors and group these two: ${e} = ${z} × (${x} × ${y}).`),
          L('Nhớ các cặp: 5 × 2 = 10; 25 × 4 = 100; 125 × 8 = 1000.', 'Remember the pairs: 5 × 2 = 10; 25 × 4 = 100; 125 × 8 = 1000.')),
        S(`${x} × ${y} = ?`, num(x * y), `${x} × ${y} = ${F(x * y)}.`),
        S(`${z} × ${F(x * y)} = ?`, num(x * y * z), `${z} × ${F(x * y)} = ${F(x * y * z)}.`),
      ],
      SO(`${e} = ${z} × (${x} × ${y}) = ${z} × ${F(x * y)} = ${F(x * y * z)}`));
  }
  function ttnDist(rng, T) {
    const a = R(rng, 12, 99), b = T === 100 ? R(rng, 11, 89) : R(rng, 1, 9), c = T - b, e = `${a} × ${b} + ${a} × ${c}`;
    return G(`${EASY}\n${e}`,
      [
        S(L('Thừa số nào có mặt ở cả hai tích?', 'Which factor is in both products?'), ch(rng, a, [b, c].filter(v => v !== a)), L(`Cả hai tích đều có thừa số ${a}. Đó là thừa số chung.`, `Both products have the factor ${a}. It is the common factor.`)),
        S(L('Đặt thừa số chung ra ngoài ngoặc, ta viết thế nào?', 'Take the common factor outside brackets. How do you write it?'), ch(rng, `${a} × (${b} + ${c})`, [`${a} × ${b} × ${c}`, `(${a} + ${b}) × ${c}`]),
          `${e} = ${a} × (${b} + ${c}).`, 'a × b + a × c = a × (b + c).'),
        S(L(`Tính trong ngoặc: ${b} + ${c} = ?`, `Work out the brackets: ${b} + ${c} = ?`), num(T), `${b} + ${c} = ${T}.`),
        S(`${a} × ${T} = ?`, num(a * T), `${a} × ${T} = ${F(a * T)}.`),
      ],
      SO(`${e} = ${a} × (${b} + ${c}) = ${a} × ${T} = ${F(a * T)}`));
  }
  const TTN_HINT = L('Nhóm các thừa số có tích tròn (5 × 2, 25 × 4, 125 × 8), hoặc đặt thừa số chung ra ngoài ngoặc.', 'Group factors with a round product (5 × 2, 25 × 4, 125 × 8), or take the common factor outside brackets.');
  function ttnPlain(rng, i) {
    if (i === 0) return toQ(ttnPair(rng), TTN_HINT);
    if (i === 1) return toQ(ttnDist(rng, 10), TTN_HINT);
    if (i === 3) return toQ(ttnDist(rng, 100), TTN_HINT);
    const a = R(rng, 12, 99), [k, t, o] = P(rng, [[11, 10, 1], [101, 100, 1], [21, 20, 1], [12, 10, 2]]);
    return Q(`${EASY}\n${a} × ${k}`, num(a * k), L(`Tách ${k} = ${t} + ${o}.\n${a} × ${k} = ${a} × (${t} + ${o}) = ${a} × ${t} + ${a} × ${o} = ${F(a * t)} + ${a * o} = ${F(a * k)}.`, `Split ${k} = ${t} + ${o}.\n${a} × ${k} = ${a} × (${t} + ${o}) = ${a} × ${t} + ${a} × ${o} = ${F(a * t)} + ${a * o} = ${F(a * k)}.`),
      { hint: L(`Tách ${k} = ${t} + ${o} rồi nhân ${a} với từng số hạng.`, `Split ${k} = ${t} + ${o}, then multiply ${a} by each part.`) });
  }
  function ttnVary(rng, i) {
    if (i === 4) {
      const [x, y] = P(rng, PAIRS.slice(0, 4)), p = P(rng, [3, 7, 9]), q = P(rng, [3, 7, 9, 11]), e = `${x} × ${p} × ${y} × ${q}`;
      return Q(`${EASY}\n${e}`, num(x * y * p * q), `${e} = (${x} × ${y}) × (${p} × ${q}) = ${F(x * y)} × ${p * q} = ${F(x * y * p * q)}.`, { hint: TTN_HINT });
    }
    if (i === 5) {
      const a = P(rng, [12, 15, 24, 36, 48]), T = P(rng, [10, 20]), b = R(rng, 2, T - 2), c = T - b, [box, it, boxE, itE] = P(rng, [['thùng', 'chai nước', 'crate', 'bottles of water'], ['hộp', 'cái bánh', 'box', 'cakes'], ['khay', 'quả trứng', 'tray', 'eggs']]);
      return Q(L(`Mỗi ${box} có ${a} ${it}. Buổi sáng cửa hàng bán được ${b} ${box}, buổi chiều bán được ${c} ${box}. Hỏi cả ngày cửa hàng bán được bao nhiêu ${it}? (Tính bằng cách thuận tiện.)`,
        `Each ${boxE} holds ${a} ${itE}. A shop sells ${pl(b, boxE, boxE === 'box' ? 'boxes' : boxE + 's')} in the morning and ${pl(c, boxE, boxE === 'box' ? 'boxes' : boxE + 's')} in the afternoon. How many ${itE} does it sell that day? (Calculate in the easiest way.)`), num(a * T),
      L(`Cả ngày bán được: ${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × ${T} = ${a * T} (${it}).`, `Sold that day: ${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × ${T} = ${a * T} (${itE}).`),
      { hint: L(`Cả hai buổi đều nhân với ${a}: đặt ${a} làm thừa số chung.`, `Both parts are multiplied by ${a}: take ${a} out as the common factor.`) });
    }
    const a = R(rng, 12, 99), b = P(rng, [9, 99]);
    return Q(`${EASY}\n${a} × ${b} + ${a}`, num(a * (b + 1)), L(`Viết ${a} = ${a} × 1.\n${a} × ${b} + ${a} × 1 = ${a} × (${b} + 1) = ${a} × ${b + 1} = ${F(a * (b + 1))}.`, `Write ${a} = ${a} × 1.\n${a} × ${b} + ${a} × 1 = ${a} × (${b} + 1) = ${a} × ${b + 1} = ${F(a * (b + 1))}.`),
      { hint: `${a} = ${a} × 1.` });
  }
  function ttnHard(rng) {
    const a = R(rng, 12, 99), b = R(rng, 11, 50), c = R(rng, 11, 78 - b), d = 100 - b - c, e = `${a} × ${b} + ${a} × ${c} + ${a} × ${d}`;
    return Q(`${EASY}\n${e}`, num(a * 100), `${e} = ${a} × (${b} + ${c} + ${d}) = ${a} × 100 = ${F(a * 100)}.`, { hint: L(`Cả ba tích đều có thừa số ${a}.`, `All three products have the factor ${a}.`) });
  }

  // ================= 9. Tìm số trung bình cộng (Bài 46) =================
  function avgVals(rng, n, lo, hi) {
    const v = Array.from({ length: n }, () => R(rng, lo, hi)), r = v.reduce((x, y) => x + y, 0) % n;
    if (r) v[n - 1] += n - r;
    return v;
  }
  function tbcForm(rng, n, k) {
    const C = [
      { lo: 12, hi: 45, u: L('cây', 'trees'), per: L('ngày', 'day'), p: (n, s) => L(`Trong ${n} ngày, tổ Một trồng được lần lượt là ${s} cây. Hỏi trung bình mỗi ngày tổ Một trồng được bao nhiêu cây?`, `Over ${n} days, Team One planted ${s} trees. On average, how many trees did the team plant each day?`) },
      { lo: 28, hi: 42, u: 'kg', per: L('bạn', 'child'), p: (n, s) => L(`${n} bạn cân nặng lần lượt là ${s} kg. Hỏi trung bình mỗi bạn cân nặng bao nhiêu ki-lô-gam?`, `${n} children weigh ${s} kg. On average, how many kilograms does each child weigh?`) },
      { lo: 15, hi: 60, u: 'kg', per: L('tuần', 'week'), p: (n, s) => L(`Trong ${n} tuần, lớp 4B thu gom được lần lượt là ${s} kg giấy vụn. Hỏi trung bình mỗi tuần lớp 4B thu gom được bao nhiêu ki-lô-gam giấy vụn?`, `Over ${n} weeks, class 4B collected ${s} kg of waste paper. On average, how many kilograms did the class collect each week?`) },
      { lo: 30, hi: 60, u: L('tạ', 'quintals'), per: L('xe', 'lorry'), p: (n, s) => L(`${n} xe ô tô chở lần lượt là ${s} tạ gạo. Hỏi trung bình mỗi xe chở bao nhiêu tạ gạo?`, `${n} lorries carry ${s} quintals of rice. On average, how many quintals does each lorry carry?`) },
    ][k];
    const v = avgVals(rng, n, C.lo, C.hi), sum = v.reduce((x, y) => x + y, 0), avg = sum / n, list = L(v.join(', '), v.slice(0, -1).join(', ') + ' and ' + v[n - 1]), add = v.join(' + ');
    return G(C.p(n, list),
      [
        S(L(`Muốn tìm trung bình mỗi ${C.per}, ta làm thế nào?`, `How do you find the average for each ${C.per}?`),
          ch(rng, L(`Tính tổng rồi chia cho ${n}`, `Add them up, then divide by ${n}`), [L(`Tính tổng rồi chia cho ${n === 2 ? 3 : n - 1}`, `Add them up, then divide by ${n === 2 ? 3 : n - 1}`), L('Lấy số lớn nhất trừ số bé nhất', 'Take the smallest from the biggest')]),
          L('Số trung bình cộng = tổng các số : số các số hạng.', 'Average = the sum of the numbers : how many numbers there are.')),
        S(L(`Tổng: ${add} = ?`, `Sum: ${add} = ?`), num(sum, C.u), L(`Tổng: ${add} = ${sum} (${C.u}).`, `Sum: ${add} = ${sum} (${C.u}).`)),
        S(L('Có mấy số hạng?', 'How many numbers are there?'), num(n), L(`Có ${n} số hạng (${n} ${C.per}).`, `There are ${n} numbers.`)),
        S(L(`Trung bình mỗi ${C.per}: ${sum} : ${n} = ?`, `Average for each ${C.per}: ${sum} : ${n} = ?`), num(avg, C.u), L(`Trung bình mỗi ${C.per}: ${sum} : ${n} = ${avg} (${C.u}).`, `Average for each ${C.per}: ${sum} : ${n} = ${avg} (${C.u}).`)),
      ],
      DS(`${avg} ${C.u}`), n <= 5 && Math.max(...v) <= 60 ? vz('barChart', { labels: v.map((_, j) => String(j + 1)), values: v, unit: C.u }) : null);
  }
  const TBC_HINT = L('Tính tổng rồi chia cho số các số hạng.', 'Add them up, then divide by how many numbers there are.');
  function tbcPlain(rng, i) {
    if (i === 0) {
      const n = R(rng, 2, 3), v = avgVals(rng, n, 2, 30), s = v.reduce((x, y) => x + y, 0);
      return Q(L(`Tìm số trung bình cộng của các số: ${v.join('; ')}.`, `Find the average of these numbers: ${v.join('; ')}.`), num(s / n), `(${v.join(' + ')}) : ${n} = ${s} : ${n} = ${s / n}.`, Object.assign({ hint: TBC_HINT }, Math.max(...v) <= 12 ? { visual: vz('average', { values: v }) } : {}));
    }
    return toQ(tbcForm(rng, i + 2, R(rng, 0, 3)), TBC_HINT);
  }
  function tbcVary(rng, i) {
    if (i === 4) {
      const k = R(rng, 3, 6), m = R(rng, 15, 80);
      return Q(L(`Số trung bình cộng của ${k} số là ${m}. Tính tổng của ${k} số đó.`, `The average of ${k} numbers is ${m}. Find the sum of the ${k} numbers.`), num(k * m), L(`Tổng = số trung bình cộng × số các số hạng: ${m} × ${k} = ${k * m}.`, `Sum = average × how many numbers: ${m} × ${k} = ${k * m}.`), { hint: L('Tổng = số trung bình cộng × số các số hạng.', 'Sum = average × how many numbers there are.') });
    }
    if (i === 5) {
      const a = R(rng, 30, 90), d = R(rng, 2, 15) * 2, b = a + d, [w, wE, long] = P(rng, [['kg đường', 'kg of sugar', 'ki-lô-gam đường'], ['m vải', 'm of cloth', 'mét vải'], ['l dầu', 'l of oil', 'lít dầu']]);
      return lines(L(`Ngày thứ nhất cửa hàng bán được ${a} ${w}. Ngày thứ hai bán được nhiều hơn ngày thứ nhất ${d} ${w}. Hỏi trung bình mỗi ngày cửa hàng bán được bao nhiêu ${long}?`, `On the first day a shop sells ${a} ${wE}. On the second day it sells ${d} ${wE.split(' ')[0]} more than on the first day. On average, how much does it sell each day?`),
        [[b, '', L(`Ngày thứ hai bán được: ${a} + ${d} = ${b} (${w.split(' ')[0]}).`, `Day 2: ${a} + ${d} = ${b} (${wE.split(' ')[0]}).`)], [(a + b) / 2, w.split(' ')[0], L(`Trung bình mỗi ngày bán được: (${a} + ${b}) : 2 = ${(a + b) / 2} (${w.split(' ')[0]}).`, `Average each day: (${a} + ${b}) : 2 = ${(a + b) / 2} (${wE.split(' ')[0]}).`)]],
        L('Tìm ngày thứ hai trước, rồi tính trung bình cộng của hai ngày.', 'Find day 2 first, then the average of the two days.'));
    }
    const m = R(rng, 20, 90), a = R(rng, m - 15, m + 15), b = 2 * m - a;
    return lines(L(`Số trung bình cộng của hai số là ${m}. Một trong hai số là ${a}. Tìm số kia.`, `The average of two numbers is ${m}. One of the numbers is ${a}. Find the other number.`),
      [[2 * m, '', L(`Tổng của hai số: ${m} × 2 = ${2 * m}.`, `Sum of the two numbers: ${m} × 2 = ${2 * m}.`)], [b, '', L(`Số kia là: ${2 * m} ${M} ${a} = ${b}.`, `The other number: ${2 * m} ${M} ${a} = ${b}.`)]],
      L('Tìm tổng của hai số trước: tổng = trung bình cộng × 2.', 'Find the sum first: sum = average × 2.'));
  }
  function tbcHard(rng) {
    const [x, y, z] = DT.names(rng, 3), m = R(rng, 30, 40), a = R(rng, m - 5, m + 4), b = R(rng, m - 4, m + 5), c = 3 * m - a - b;
    return lines(L(`Ba bạn ${x}, ${y} và ${z} cân nặng trung bình ${m} kg. ${x} cân nặng ${a} kg, ${y} cân nặng ${b} kg. Hỏi ${z} cân nặng bao nhiêu ki-lô-gam?`, `${x}, ${y} and ${z} weigh ${m} kg on average. ${x} weighs ${a} kg and ${y} weighs ${b} kg. How many kilograms does ${z} weigh?`),
      [[3 * m, '', L(`Cả ba bạn cân nặng: ${m} × 3 = ${3 * m} (kg).`, `All three weigh: ${m} × 3 = ${3 * m} (kg).`)], [a + b, '', L(`${x} và ${y} cân nặng: ${a} + ${b} = ${a + b} (kg).`, `${x} and ${y} weigh: ${a} + ${b} = ${a + b} (kg).`)],
        [c, 'kg', L(`${z} cân nặng: ${3 * m} ${M} ${a + b} = ${c} (kg).`, `${z} weighs: ${3 * m} ${M} ${a + b} = ${c} (kg).`)]],
      L('Tổng = trung bình cộng × 3. Lấy tổng trừ đi hai số đã biết.', 'Sum = average × 3. Take the two known numbers away from the sum.'));
  }

  // ================= 10. Bài toán liên quan đến rút về đơn vị (Bài 47) =================
  // contexts of "n1 parts have T; how much do n2 parts have?"
  function rdvCtx(rng, k, per, n1, n2) {
    const T = per * n1;
    return [
      { u: L('cái', 'cakes'), mul: 1, one: L('1 hộp có bao nhiêu cái bánh', 'How many cakes 1 box holds'), part: L('hộp', 'boxes'), l1: L('1 hộp có', '1 box holds'), ln: L(`${n2} hộp có`, `${n2} boxes hold`),
        p: L(`Có ${T} cái bánh xếp đều vào ${n1} hộp. Hỏi ${n2} hộp như thế có bao nhiêu cái bánh?`, `${T} cakes are packed equally into ${n1} boxes. How many cakes do ${n2} boxes like this hold?`) },
      { u: DONG, mul: 1000, one: L('1 quyển vở giá bao nhiêu tiền', 'How much 1 exercise book costs'), part: L('quyển vở', 'exercise books'), l1: L('Giá tiền 1 quyển vở', '1 exercise book costs'), ln: L(`Mua ${n2} quyển vở hết`, `${n2} exercise books cost`),
        p: L(`Mua ${n1} quyển vở hết ${F(T * 1000)} đồng. Hỏi mua ${n2} quyển vở như thế hết bao nhiêu tiền?`, `${n1} exercise books cost ${F(T * 1000)} dong. How much do ${n2} exercise books like this cost?`) },
      { u: 'kg', mul: 1, one: L('1 bao gạo nặng bao nhiêu ki-lô-gam', 'How many kilograms 1 sack of rice weighs'), part: L('bao gạo', 'sacks'), l1: L('1 bao gạo nặng', '1 sack weighs'), ln: L(`${n2} bao gạo nặng`, `${n2} sacks weigh`),
        p: L(`${n1} bao gạo như nhau nặng ${T} kg. Hỏi ${n2} bao gạo như thế nặng bao nhiêu ki-lô-gam?`, `${n1} equal sacks of rice weigh ${T} kg. How many kilograms do ${n2} sacks like this weigh?`) },
      { u: L('thùng', 'crates'), mul: 1, one: L('1 xe chở được bao nhiêu thùng hàng', 'How many crates 1 lorry carries'), part: L('xe', 'lorries'), l1: L('1 xe chở được', '1 lorry carries'), ln: L(`${n2} xe chở được`, `${n2} lorries carry`),
        p: L(`${n1} xe như nhau chở được ${T} thùng hàng. Hỏi ${n2} xe như thế chở được bao nhiêu thùng hàng?`, `${n1} equal lorries carry ${T} crates. How many crates do ${n2} lorries like this carry?`) },
      { u: 'l', mul: 1, one: L('1 can đựng bao nhiêu lít dầu', 'How many litres 1 can holds'), part: L('can', 'cans'), l1: L('1 can đựng', '1 can holds'), ln: L(`${n2} can đựng`, `${n2} cans hold`),
        p: L(`${n1} can như nhau đựng ${T} l dầu. Hỏi ${n2} can như thế đựng bao nhiêu lít dầu?`, `${n1} equal cans hold ${T} l of oil. How many litres do ${n2} cans like this hold?`) },
    ][k];
  }
  function rdvForm(rng, k, big) {
    const per = R(rng, big ? 12 : 3, big ? 45 : 9), n1 = R(rng, 2, 9); let n2 = R(rng, 2, 12); if (n2 === n1) n2++;
    const c = rdvCtx(rng, k, per, n1, n2), m = c.mul, T = per * n1 * m, one = per * m, ans = per * n2 * m;
    return G(c.p,
      [
        S(L('Trước hết phải tìm gì?', 'What must you find first?'), ch(rng, c.one, [L(`Có tất cả bao nhiêu ${c.part}`, `How many ${c.part} there are altogether`), L(`${n2} ${c.part} nhiều hơn ${n1} ${c.part} bao nhiêu`, `How many more ${n2} ${c.part} are than ${n1} ${c.part}`)]),
          L('Bước 1 là "rút về đơn vị": tìm giá trị của 1 phần.', 'Step 1 is "finding one unit": the value of 1 part.')),
        S(`${c.l1}: ${F(T)} : ${n1} = ?`, num(one, c.u), `${c.l1}: ${F(T)} : ${n1} = ${F(one)} (${c.u}).`, L('Chia cho số phần.', 'Divide by the number of parts.')),
        S(L(`Biết 1 phần là ${F(one)}. Tìm ${n2} phần bằng phép tính nào?`, `1 part is ${F(one)}. Which calculation gives ${n2} parts?`), ch(rng, `${F(one)} × ${n2}`, [`${F(one)} : ${n2}`, `${F(one)} + ${n2}`]),
          L('Nhiều phần như nhau thì làm phép nhân.', 'Several equal parts: multiply.')),
        S(`${c.ln}: ${F(one)} × ${n2} = ?`, num(ans, c.u), `${c.ln}: ${F(one)} × ${n2} = ${F(ans)} (${c.u}).`),
      ],
      DS(`${F(ans)} ${c.u}`),
      vz('tape', { bars: [{ label: String(n1), parts: Math.min(n1, 10), units: Math.min(n1, 10), value: F(T) }, { label: String(n2), parts: Math.min(n2, 12), units: Math.min(n2, 12), value: '?' }] }));
  }
  // "how many parts?": divide, then divide again
  function rdvCount(rng, k) {
    const per = R(rng, 3, 12) * (k === 3 ? 1000 : 1), n1 = R(rng, 2, 9); let n2 = R(rng, 2, 12); if (n2 === n1) n2++;
    const T = per * n1, T2 = per * n2;
    const c = [
      { one: L('1 chai đựng bao nhiêu lít mật ong', 'How many litres 1 bottle holds'), l1: L('1 chai đựng', '1 bottle holds'), u1: 'l', ln: L('Số chai rót được', 'Number of bottles'), u: L('chai', 'bottles'),
        p: L(`Có ${F(T)} l mật ong rót đều vào ${n1} chai. Hỏi có ${F(T2)} l mật ong thì rót được vào mấy chai như thế?`, `${F(T)} l of honey is poured equally into ${n1} bottles. How many bottles like this will ${F(T2)} l of honey fill?`) },
      { one: L('1 hộp xếp được bao nhiêu cái bánh', 'How many cakes 1 box holds'), l1: L('1 hộp xếp được', '1 box holds'), u1: L('cái', 'cakes'), ln: L('Số hộp xếp được', 'Number of boxes'), u: L('hộp', 'boxes'),
        p: L(`Có ${F(T)} cái bánh xếp đều vào ${n1} hộp. Hỏi có ${F(T2)} cái bánh thì xếp được vào mấy hộp như thế?`, `${F(T)} cakes are packed equally into ${n1} boxes. How many boxes like this will ${F(T2)} cakes fill?`) },
      { one: L('May 1 bộ quần áo hết bao nhiêu mét vải', 'How many metres of cloth 1 outfit needs'), l1: L('May 1 bộ quần áo hết', '1 outfit needs'), u1: 'm', ln: L('Số bộ quần áo may được', 'Number of outfits'), u: L('bộ', 'outfits'),
        p: L(`May ${n1} bộ quần áo như nhau hết ${F(T)} m vải. Hỏi có ${F(T2)} m vải thì may được mấy bộ quần áo như thế?`, `${n1} equal outfits need ${F(T)} m of cloth. How many outfits like this can be made from ${F(T2)} m of cloth?`) },
      { one: L('1 hộp sữa giá bao nhiêu tiền', 'How much 1 carton of milk costs'), l1: L('Giá tiền 1 hộp sữa', '1 carton costs'), u1: DONG, ln: L('Số hộp sữa mua được', 'Number of cartons'), u: L('hộp', 'cartons'),
        p: L(`Mua ${n1} hộp sữa hết ${F(T)} đồng. Hỏi có ${F(T2)} đồng thì mua được mấy hộp sữa như thế?`, `${n1} cartons of milk cost ${F(T)} dong. How many cartons like this can you buy with ${F(T2)} dong?`) },
    ][k];
    return G(c.p,
      [
        S(L('Trước hết phải tìm gì?', 'What must you find first?'), ch(rng, c.one, [L(`Có tất cả bao nhiêu ${c.u}`, `How many ${c.u} there are altogether`), L(`${F(T2)} nhiều hơn ${F(T)} bao nhiêu`, `How much more ${F(T2)} is than ${F(T)}`)]),
          L('Rút về đơn vị: tìm giá trị của 1 phần trước.', 'Find one unit first: the value of 1 part.')),
        S(`${c.l1}: ${F(T)} : ${n1} = ?`, num(per, c.u1), `${c.l1}: ${F(T)} : ${n1} = ${F(per)} (${c.u1}).`),
        S(`${c.ln}: ${F(T2)} : ${F(per)} = ?`, num(n2, c.u), `${c.ln}: ${F(T2)} : ${F(per)} = ${n2} (${c.u}).`, L('Hỏi "được mấy phần" thì làm phép chia.', '"How many parts?" means divide.')),
      ],
      DS(`${n2} ${c.u}`));
  }
  const RDV_HINT = L('Bước 1: tìm giá trị của 1 phần (phép chia). Bước 2: tìm nhiều phần (phép nhân) hoặc số phần (phép chia).', 'Step 1: find the value of 1 part (divide). Step 2: find several parts (multiply) or the number of parts (divide).');
  function rdvVary(rng, i) {
    if (i === 4) return toQ(rdvCount(rng, R(rng, 1, 2)), RDV_HINT);
    if (i === 6) return toQ(rdvCount(rng, 3), RDV_HINT);
    const per = R(rng, 4, 15) * 1000, n1 = R(rng, 3, 8), k = R(rng, 2, 6), [it, itE] = P(rng, [['cái bút', 'pens'], ['quyển vở', 'exercise books'], ['gói bánh', 'packets of biscuits']]);
    return lines(L(`Mua ${n1} ${it} hết ${F(per * n1)} đồng. Hỏi nếu mua thêm ${k} ${it} như thế nữa thì phải trả thêm bao nhiêu tiền?`, `${n1} ${itE} cost ${F(per * n1)} dong. How much more do you pay if you buy ${k} more ${itE} like these?`),
      [[per, '', L(`Giá tiền 1 ${it}: ${F(per * n1)} : ${n1} = ${F(per)} (đồng).`, `Each one costs: ${F(per * n1)} : ${n1} = ${F(per)} (dong).`)], [per * k, DONG, L(`Mua thêm ${k} ${it} phải trả thêm: ${F(per)} × ${k} = ${F(per * k)} (đồng).`, `${k} more cost: ${F(per)} × ${k} = ${F(per * k)} (dong).`)]], RDV_HINT);
  }
  function rdvHard(rng) {
    const per = R(rng, 5, 18) * 1000, n1 = R(rng, 3, 6), n2 = R(rng, 7, 12), cost = per * n2, pay = Math.ceil((cost + 1000) / 50000) * 50000;
    return lines(L(`Mua ${n1} quyển vở hết ${F(per * n1)} đồng. Mẹ mua ${n2} quyển vở như thế và đưa cô bán hàng ${F(pay)} đồng. Hỏi cô bán hàng trả lại mẹ bao nhiêu tiền?`, `${n1} exercise books cost ${F(per * n1)} dong. Mum buys ${n2} exercise books like these and gives the shopkeeper ${F(pay)} dong. How much change does she get?`),
      [[per, '', L(`Giá tiền 1 quyển vở: ${F(per * n1)} : ${n1} = ${F(per)} (đồng).`, `1 exercise book costs: ${F(per * n1)} : ${n1} = ${F(per)} (dong).`)], [cost, '', L(`Mua ${n2} quyển vở hết: ${F(per)} × ${n2} = ${F(cost)} (đồng).`, `${n2} exercise books cost: ${F(per)} × ${n2} = ${F(cost)} (dong).`)],
        [pay - cost, DONG, L(`Cô bán hàng trả lại: ${F(pay)} ${M} ${F(cost)} = ${F(pay - cost)} (đồng).`, `Change: ${F(pay)} ${M} ${F(cost)} = ${F(pay - cost)} (dong).`)]], RDV_HINT);
  }

  // ================= 11. Cộng, trừ hai phân số (Bài 60, 61) =================
  // two fractions in simplest form whose denominators are d1 and d2 = d1 × k; the result is never a whole number
  function psPair(rng, op, proper) {
    for (let t = 0; t < 200; t++) {
      const d1 = R(rng, 2, 6), k = R(rng, 2, 4), d2 = d1 * k, n1 = coprime(rng, d1), n2 = coprime(rng, d2), a = n1 * k;
      const s = op === '+' ? a + n2 : Math.abs(a - n2);
      if (s === 0 || s % d2 === 0 || (proper && s >= d2)) continue;
      return { d1, d2, k, n1, n2, a, s, firstSmallDen: op === '+' ? R(rng, 0, 1) === 1 : a > n2 };
    }
    return { d1: 2, d2: 4, k: 2, n1: 1, n2: 1, a: 2, s: op === '+' ? 3 : 1, firstSmallDen: true };
  }
  // word: 0 a plain calculation, 1 a word problem
  function psAddSub(rng, op, word) {
    const p = psPair(rng, op, !!word), { d1, d2, k, n1, n2, a, s } = p, [sn, sd] = U.simplify(s, d2), A = fs(n1, d1), B = fs(n2, d2);
    const first = p.firstSmallDen ? A : B, second = p.firstSmallDen ? B : A, e = `${first} ${op} ${second}`, plus = op === '+';
    const tops = p.firstSmallDen ? `${a} ${op} ${n2}` : `${n2} ${op} ${a}`, same = p.firstSmallDen ? `${fs(a, d2)} ${op} ${B}` : `${B} ${op} ${fs(a, d2)}`;
    const res = `${e} = ${same} = ${fs(s, d2)}${sn !== s ? ` = ${fs(sn, sd)}` : ''}`;
    const [w, wE] = P(rng, plus ? [[`Ngày thứ nhất đội công nhân sửa được ${first} quãng đường, ngày thứ hai sửa được ${second} quãng đường. Hỏi cả hai ngày đội sửa được bao nhiêu phần quãng đường?`, `On the first day a team repairs ${first} of a road. On the second day they repair ${second} of the road. What fraction of the road do they repair in the two days?`],
      [`Buổi sáng bác Năm tưới được ${first} vườn rau, buổi chiều tưới được ${second} vườn rau. Hỏi cả ngày bác Năm tưới được bao nhiêu phần vườn rau?`, `In the morning Mr Năm waters ${first} of a vegetable garden. In the afternoon he waters ${second} of it. What fraction of the garden does he water that day?`]]
      : [[`Một chai có ${first} l nước. Bạn đã uống ${second} l. Hỏi trong chai còn lại bao nhiêu lít nước?`, `A bottle holds ${first} l of water. You drink ${second} l. How many litres of water are left in the bottle?`],
        [`Một sợi dây dài ${first} m. Người ta cắt đi ${second} m. Hỏi sợi dây còn lại dài bao nhiêu mét?`, `A piece of string is ${first} m long. ${second} m is cut off. How many metres of string are left?`]]);
    const steps = [
      S(L(`Hai mẫu số là ${d1} và ${d2}. Mẫu số nào chia hết cho mẫu số kia? Lấy số đó làm mẫu số chung.`, `The denominators are ${d1} and ${d2}. Which one can be divided exactly by the other? Use it as the common denominator.`), num(d2),
        L(`${d2} : ${d1} = ${k} nên chọn mẫu số chung là ${d2}.`, `${d2} : ${d1} = ${k}, so the common denominator is ${d2}.`)),
      S(L(`Quy đồng: ${A} = ?/${d2}. Tử số mới là bao nhiêu?`, `Change ${A} to ?/${d2}. What is the new numerator?`), num(a),
        L(`Nhân cả tử số và mẫu số của ${A} với ${k}: ${A} = ${fs(a, d2)}. Giữ nguyên ${B}.`, `Multiply the numerator and the denominator of ${A} by ${k}: ${A} = ${fs(a, d2)}. ${B} stays the same.`), L(`Lấy ${n1} × ${k}.`, `Work out ${n1} × ${k}.`)),
      S(L(`${plus ? 'Cộng' : 'Trừ'} hai tử số: ${tops} = ?`, `${plus ? 'Add' : 'Subtract'} the numerators: ${tops} = ?`), num(s), L(`${tops} = ${s}. Giữ nguyên mẫu số ${d2}.`, `${tops} = ${s}. Keep the denominator ${d2}.`)),
      S(L(`Vậy ${e} = ?`, `So ${e} = ?`), ch(rng, fs(s, d2), [fs(s, plus ? d1 + d2 : d2 - d1), fs(plus ? n1 + n2 : Math.abs(n1 - n2) || s + 1, d2), fs(s, d1)]), `${res}.`),
    ];
    if (word) steps.unshift(S(L('Bài toán này làm phép tính gì?', 'Which calculation does this problem need?'), ch(rng, e, [`${first} ${plus ? M : '+'} ${second}`, `${first} × ${second}`]),
      plus ? L('Gộp hai phần lại thì làm phép cộng.', 'Putting two parts together means adding.') : L('Bớt đi một phần thì làm phép trừ.', 'Taking a part away means subtracting.')));
    const g = G(word ? L(w, wE) : `${CALC} ${e}`, word ? steps.slice(0, 5) : steps, word ? DS(fs(sn, sd)) : SO(res));
    g.frac = fr(sn, sd);
    return g;
  }
  const PS_HINT = L('Quy đồng mẫu số (lấy mẫu số lớn làm mẫu số chung) rồi cộng, trừ các tử số.', 'Give the fractions a common denominator (the bigger one), then add or subtract the numerators.');
  function psPlain(rng, i) {
    if (i < 2) {
      const plus = i === 0, d = R(rng, 5, 12); let a, b;
      do { a = R(rng, 1, d - 1); b = R(rng, 1, d - 1); } while (a === b || (plus ? (a + b) % d === 0 : false));
      if (!plus && a < b) [a, b] = [b, a];
      const s = plus ? a + b : a - b, [sn, sd] = U.simplify(s, d), op = plus ? '+' : M;
      return Q(`${CALC} ${fs(a, d)} ${op} ${fs(b, d)}`, fr(sn, sd), L(`Hai phân số cùng mẫu số: ${plus ? 'cộng' : 'trừ'} hai tử số, giữ nguyên mẫu số.\n${fs(a, d)} ${op} ${fs(b, d)} = ${fs(s, d)}${sn !== s ? ` = ${fs(sn, sd)}` : ''}.`, `Same denominator: ${plus ? 'add' : 'subtract'} the numerators and keep the denominator.\n${fs(a, d)} ${op} ${fs(b, d)} = ${fs(s, d)}${sn !== s ? ` = ${fs(sn, sd)}` : ''}.`),
        { hint: L('Cùng mẫu số: cộng (trừ) hai tử số, giữ nguyên mẫu số.', 'Same denominator: add (subtract) the numerators and keep the denominator.') });
    }
    const g = psAddSub(rng, i === 2 ? '+' : M, 0);
    return toQ(g, PS_HINT, g.frac);
  }
  function psVary(rng, i) {
    if (i < 6) { const g = psAddSub(rng, i === 4 ? '+' : M, 1); return toQ(g, PS_HINT, g.frac); }
    const d = R(rng, 3, 12), n = coprime(rng, d);
    return Q(`${CALC} 1 ${M} ${fs(n, d)}`, fr(d - n, d), L(`Viết 1 = ${fs(d, d)}.\n1 ${M} ${fs(n, d)} = ${fs(d, d)} ${M} ${fs(n, d)} = ${fs(d - n, d)}.`, `Write 1 = ${fs(d, d)}.\n1 ${M} ${fs(n, d)} = ${fs(d, d)} ${M} ${fs(n, d)} = ${fs(d - n, d)}.`), { hint: L(`Viết 1 thành phân số có mẫu số ${d}.`, `Write 1 as a fraction with the denominator ${d}.`) });
  }
  function psHard(rng) {
    const p = psPair(rng, '+', true), { d1, d2, n1, n2, a, s } = p, [rn, rd] = U.simplify(d2 - s, d2), [sn, sd] = U.simplify(s, d2);
    return Q(L(`Một mảnh vườn có ${fs(n1, d1)} diện tích trồng rau, ${fs(n2, d2)} diện tích trồng hoa, phần còn lại là lối đi. Hỏi lối đi chiếm bao nhiêu phần diện tích mảnh vườn?`, `In a garden, ${fs(n1, d1)} of the area is for vegetables and ${fs(n2, d2)} is for flowers. The rest is a path. What fraction of the garden is the path?`), fr(rn, rd),
      L(`Phần trồng rau và hoa: ${fs(n1, d1)} + ${fs(n2, d2)} = ${fs(a, d2)} + ${fs(n2, d2)} = ${fs(s, d2)}${sn !== s ? ` = ${fs(sn, sd)}` : ''} (mảnh vườn).\nLối đi chiếm: 1 ${M} ${fs(s, d2)} = ${fs(d2, d2)} ${M} ${fs(s, d2)} = ${fs(d2 - s, d2)}${rn !== d2 - s ? ` = ${fs(rn, rd)}` : ''} (mảnh vườn).`,
        `Vegetables and flowers: ${fs(n1, d1)} + ${fs(n2, d2)} = ${fs(a, d2)} + ${fs(n2, d2)} = ${fs(s, d2)}${sn !== s ? ` = ${fs(sn, sd)}` : ''} (of the garden).\nThe path: 1 ${M} ${fs(s, d2)} = ${fs(d2, d2)} ${M} ${fs(s, d2)} = ${fs(d2 - s, d2)}${rn !== d2 - s ? ` = ${fs(rn, rd)}` : ''} (of the garden).`),
      { hint: L('Cả mảnh vườn là 1. Cộng hai phần đã biết rồi lấy 1 trừ đi.', 'The whole garden is 1. Add the two known parts, then take the sum away from 1.') });
  }

  // ================= 12. Nhân phân số (Bài 63) =================
  // a/b × c/d in simplest form; needG: 1 the product can be simplified, 0 any
  function mulPair(rng, needG) {
    for (let t = 0; t < 300; t++) {
      const b = R(rng, 2, 9), a = coprime(rng, b), d = R(rng, 2, 9), c = coprime(rng, d), g = U.gcd(a * c, b * d);
      if ((needG && g === 1) || a * c === 1) continue;   // no 1/b × 1/d: too plain to show the rule
      return { a, b, c, d, g };
    }
    return { a: 2, b: 3, c: 3, d: 4, g: 6 };
  }
  // kind: 0 a plain calculation, 1 the area of a rectangle
  function nhanForm(rng, kind, needG) {
    let p = mulPair(rng, needG);
    if (kind === 1 && p.a * p.d < p.b * p.c) p = { a: p.c, b: p.d, c: p.a, d: p.b, g: p.g };   // chiều dài is the larger fraction
    if (kind === 1 && p.a * p.d === p.b * p.c) p = { a: 3, b: 4, c: 2, d: 5, g: 2 };
    const { a, b, c, d, g } = p, N = a * c, D = b * d, A = fs(a, b), B = fs(c, d), e = `${A} × ${B}`, res = `${e} = (${a} × ${c})/(${b} × ${d}) = ${fs(N, D)}${g > 1 ? ` = ${fs(N / g, D / g)}` : ''}`;
    const steps = [
      kind === 1 ? S(L('Diện tích hình chữ nhật tính thế nào?', 'How do you find the area of a rectangle?'), ch(rng, L('Chiều dài × chiều rộng', 'Length × width'), [L('(Chiều dài + chiều rộng) × 2', '(Length + width) × 2'), L('Chiều dài + chiều rộng', 'Length + width')]), L(`Diện tích = chiều dài × chiều rộng = ${e}.`, `Area = length × width = ${e}.`))
        : S(L('Muốn nhân hai phân số, ta làm thế nào?', 'How do you multiply two fractions?'), ch(rng, L('Tử số nhân tử số, mẫu số nhân mẫu số', 'Numerator × numerator, denominator × denominator'), [L('Quy đồng mẫu số rồi nhân hai tử số', 'Find a common denominator, then multiply the numerators'), L('Tử số nhân mẫu số, mẫu số nhân tử số', 'Numerator × denominator, denominator × numerator')]),
          L('Nhân phân số: lấy tử số nhân tử số, mẫu số nhân mẫu số. Không cần quy đồng.', 'To multiply fractions: numerator × numerator, denominator × denominator. No common denominator is needed.')),
      S(L(`Tử số của tích: ${a} × ${c} = ?`, `Numerator of the product: ${a} × ${c} = ?`), num(N), L(`Tử số: ${a} × ${c} = ${N}.`, `Numerator: ${a} × ${c} = ${N}.`)),
      S(L(`Mẫu số của tích: ${b} × ${d} = ?`, `Denominator of the product: ${b} × ${d} = ?`), num(D), L(`Mẫu số: ${b} × ${d} = ${D}. Vậy ${e} = ${fs(N, D)}.`, `Denominator: ${b} × ${d} = ${D}. So ${e} = ${fs(N, D)}.`)),
    ];
    if (g > 1) steps.push(S(L(`Rút gọn ${fs(N, D)}: chia cả tử số và mẫu số cho ${g}. Tử số mới là bao nhiêu?`, `Simplify ${fs(N, D)}: divide the numerator and the denominator by ${g}. What is the new numerator?`), num(N / g),
      L(`${fs(N, D)} = ${fs(N / g, D / g)} (${N} : ${g} = ${N / g}; ${D} : ${g} = ${D / g}).`, `${fs(N, D)} = ${fs(N / g, D / g)} (${N} : ${g} = ${N / g}; ${D} : ${g} = ${D / g}).`)));
    const [it, itE] = P(rng, [['Một tấm bìa', 'A card'], ['Một tấm kính', 'A sheet of glass'], ['Một mảnh vải', 'A piece of cloth']]);
    const gd = G(kind === 1 ? L(`${it} hình chữ nhật có chiều dài ${A} m, chiều rộng ${B} m. Tính diện tích của nó (theo mét vuông).`, `${itE} is a rectangle ${A} m long and ${B} m wide. Find its area (in square metres).`) : `${CALC} ${e}`,
      steps, kind === 1 ? DS(`${fs(N / g, D / g)} m²`) : SO(res), kind === 1 ? vz('shape', { kind: 'rect' }) : null);
    gd.frac = fr(N / g, D / g);
    return gd;
  }
  const NHAN_HINT = L('Tử số nhân tử số, mẫu số nhân mẫu số; rút gọn nếu được.', 'Numerator × numerator, denominator × denominator; simplify if you can.');
  function nhanWhole(rng, word) {
    const b = R(rng, 3, 12), a = coprime(rng, b), k = R(rng, 2, 9), [sn, sd] = U.simplify(a * k, b), A = fs(a, b);
    const tail = `(${a} × ${k})/${b} = ${fs(a * k, b)}${sd === 1 ? ` = ${sn}` : sn !== a * k ? ` = ${fs(sn, sd)}` : ''}`, line = `${A} × ${k} = ${tail}`;
    const ans = sd === 1 ? num(sn) : fr(sn, sd), hint = L('Nhân tử số với số tự nhiên, giữ nguyên mẫu số.', 'Multiply the numerator by the whole number and keep the denominator.');
    if (!word) { const e = R(rng, 0, 1) ? `${A} × ${k}` : `${k} × ${A}`; return Q(`${CALC} ${e}`, ans, `${e} = ${tail}.`, { hint }); }
    const [vi, en] = P(rng, [[`Mỗi chai có ${A} l nước cam. Hỏi ${k} chai như thế có tất cả bao nhiêu lít nước cam?`, `Each bottle holds ${A} l of orange juice. How many litres do ${k} bottles like this hold altogether?`],
      [`Một con ốc sên mỗi phút bò được ${A} m. Hỏi trong ${k} phút con ốc sên bò được bao nhiêu mét?`, `A snail crawls ${A} m each minute. How many metres does it crawl in ${k} minutes?`],
      [`Mỗi túi kẹo nặng ${A} kg. Hỏi ${k} túi kẹo như thế nặng bao nhiêu ki-lô-gam?`, `Each bag of sweets weighs ${A} kg. How many kilograms do ${k} bags like this weigh?`]]);
    return Q(L(vi, en), ans, `${line}.`, { hint });
  }
  function nhanVary(rng, i) {
    if (i === 4) return nhanWhole(rng, true);
    if (i === 6) return nhanWhole(rng, false);
    const b = R(rng, 2, 9), a = coprime(rng, b), per = R(rng, 0, 1) === 1, A = fs(a, b), sq = vz('shape', { kind: 'square' });
    if (per) { const [sn, sd] = U.simplify(a * 4, b); return Q(L(`Một hình vuông có cạnh ${A} m. Tính chu vi hình vuông (theo mét).`, `A square has sides of ${A} m. Find its perimeter (in metres).`), sd === 1 ? num(sn, 'm') : fr(sn, sd), L(`Chu vi hình vuông: ${A} × 4 = ${fs(a * 4, b)}${sd === 1 ? ` = ${sn}` : sn !== a * 4 ? ` = ${fs(sn, sd)}` : ''} (m).`, `Perimeter of the square: ${A} × 4 = ${fs(a * 4, b)}${sd === 1 ? ` = ${sn}` : sn !== a * 4 ? ` = ${fs(sn, sd)}` : ''} (m).`), { hint: L('Chu vi hình vuông = cạnh × 4.', 'Perimeter of a square = side × 4.'), visual: sq }); }
    return Q(L(`Một hình vuông có cạnh ${A} m. Tính diện tích hình vuông (theo mét vuông).`, `A square has sides of ${A} m. Find its area (in square metres).`), fr(a * a, b * b), L(`Diện tích hình vuông: ${A} × ${A} = ${fs(a * a, b * b)} (m²).`, `Area of the square: ${A} × ${A} = ${fs(a * a, b * b)} (m²).`), { hint: L('Diện tích hình vuông = cạnh × cạnh.', 'Area of a square = side × side.'), visual: sq });
  }
  function nhanHard(rng, i) {
    if (i === 8) {
      const p = mulPair(rng, 1), k = R(rng, 2, 5), N = p.a * p.c * k, D = p.b * p.d, [sn, sd] = U.simplify(N, D), e = `${fs(p.a, p.b)} × ${fs(p.c, p.d)} × ${k}`;
      return Q(`${CALC} ${e}`, sd === 1 ? num(sn) : fr(sn, sd), `${e} = (${p.a} × ${p.c} × ${k})/(${p.b} × ${p.d}) = ${fs(N, D)}${sd === 1 ? ` = ${sn}` : sn !== N ? ` = ${fs(sn, sd)}` : ''}.`, { hint: L(`Viết ${k} = ${k}/1 rồi nhân các tử số với nhau, các mẫu số với nhau.`, `Write ${k} = ${k}/1, then multiply the numerators together and the denominators together.`) });
    }
    // three fractions that cancel in a chain: a/b × b/c × c/d
    let a = 2, b = 3, c = 4, d = 5;
    for (let t = 0; t < 200; t++) {
      const w = R(rng, 1, 4), x = R(rng, w + 1, 6), y = R(rng, x + 1, 8), z = R(rng, y + 1, 11);
      if (U.gcd(w, x) === 1 && U.gcd(x, y) === 1 && U.gcd(y, z) === 1) { a = w; b = x; c = y; d = z; break; }
    }
    const [sn, sd] = U.simplify(a, d), e = `${fs(a, b)} × ${fs(b, c)} × ${fs(c, d)}`, same = sn === a ? '' : ` = ${fs(sn, sd)}`;
    return Q(`${CALC} ${e}`, fr(sn, sd), L(`${e} = (${a} × ${b} × ${c})/(${b} × ${c} × ${d}) = ${fs(a, d)}${same} (chia cả tử số và mẫu số cho ${b} × ${c}).`, `${e} = (${a} × ${b} × ${c})/(${b} × ${c} × ${d}) = ${fs(a, d)}${same} (divide the numerator and the denominator by ${b} × ${c}).`),
      { hint: L('Nhân ba tử số với nhau, ba mẫu số với nhau, rồi rút gọn.', 'Multiply the three numerators together and the three denominators together, then simplify.') });
  }

  // ================= 13. Chia phân số (Bài 64) =================
  function chiaForm(rng, kind) {
    let a, b, c, d;
    for (let t = 0; t < 300; t++) { b = R(rng, 2, 9); a = coprime(rng, b); d = R(rng, 2, 9); c = coprime(rng, d); if (a * d !== b * c && !(a === c && b === d)) break; }
    if (a * d === b * c) { a = 3; b = 4; c = 2; d = 5; }
    if (kind === 1) {
      // a rectangle: the width c/d and the length p/q (longer than the width) give the area a/b
      let p = 3, q = 4;
      for (let t = 0; t < 100; t++) { q = R(rng, 2, 9); p = coprime(rng, q); if (p * d > q * c) break; }
      if (p * d <= q * c) { c = 1; d = 3; p = 3; q = 4; }
      [a, b] = U.simplify(p * c, q * d);
    }
    const N = a * d, D = b * c, g = U.gcd(N, D), A = fs(a, b), B = fs(c, d), inv = fs(d, c), e = `${A} : ${B}`, whole = D / g === 1;
    const out = whole ? String(N / g) : fs(N / g, D / g), res = `${e} = ${A} × ${inv} = ${fs(N, D)}${g > 1 ? ` = ${out}` : ''}`;
    const steps = [
      S(L(`Phân số đảo ngược của ${B} là phân số nào?`, `What is ${B} turned upside down (its reciprocal)?`), ch(rng, inv, [B, fs(b, a), fs(c + d, d)]), L(`Đổi chỗ tử số và mẫu số: phân số đảo ngược của ${B} là ${inv}.`, `Swap the numerator and the denominator: ${B} turned upside down is ${inv}.`)),
      S(L(`Phép chia ${e} đổi thành phép nhân nào?`, `Which multiplication is the same as ${e}?`), ch(rng, `${A} × ${inv}`, [`${fs(b, a)} × ${B}`, `${A} × ${B}`]), L(`Lấy phân số thứ nhất nhân với phân số thứ hai đảo ngược: ${e} = ${A} × ${inv}.`, `Multiply the first fraction by the second one turned upside down: ${e} = ${A} × ${inv}.`)),
      S(L(`Tử số: ${a} × ${d} = ?`, `Numerator: ${a} × ${d} = ?`), num(N), L(`Tử số: ${a} × ${d} = ${N}.`, `Numerator: ${a} × ${d} = ${N}.`)),
      S(L(`Mẫu số: ${b} × ${c} = ?`, `Denominator: ${b} × ${c} = ?`), num(D), L(`Mẫu số: ${b} × ${c} = ${D}. Vậy ${res}.`, `Denominator: ${b} × ${c} = ${D}. So ${res}.`)),
    ];
    let prompt = `${CALC} ${e}`, done = SO(res);
    if (kind === 1) {
      prompt = L(`Một hình chữ nhật có diện tích ${A} m², chiều rộng ${B} m. Tính chiều dài hình chữ nhật (theo mét).`, `A rectangle has an area of ${A} m² and a width of ${B} m. Find its length (in metres).`);
      done = DS(`${out} m`);
      steps[0] = S(L('Biết diện tích và chiều rộng. Chiều dài tính thế nào?', 'You know the area and the width. How do you find the length?'), ch(rng, L('Diện tích : chiều rộng', 'Area : width'), [L('Diện tích × chiều rộng', 'Area × width'), L('Diện tích − chiều rộng', 'Area − width')]), L(`Chiều dài = diện tích : chiều rộng = ${e}.`, `Length = area : width = ${e}.`));
    }
    const gd = G(prompt, steps, done);
    gd.frac = whole ? num(N / g) : fr(N / g, D / g);
    return gd;
  }
  const CHIA_HINT = L('Lấy phân số thứ nhất nhân với phân số thứ hai đảo ngược.', 'Multiply the first fraction by the second fraction turned upside down.');
  function chiaPlain(rng, i) {
    if (i === 0) { const d = R(rng, 2, 9), c = coprime(rng, d); return Q(L(`Phân số đảo ngược của ${fs(c, d)} là:`, `What is ${fs(c, d)} turned upside down (its reciprocal)?`), ch(rng, fs(d, c), [fs(c, d), fs(d, c + 1), fs(c + d, d)]), L(`Đổi chỗ tử số và mẫu số: phân số đảo ngược của ${fs(c, d)} là ${fs(d, c)}.`, `Swap the numerator and the denominator: ${fs(c, d)} turned upside down is ${fs(d, c)}.`), { hint: L('Đổi chỗ tử số và mẫu số.', 'Swap the numerator and the denominator.') }); }
    if (i === 1) { const g = chiaForm(rng, 0); return toQ(g, CHIA_HINT, g.frac); }
    const b = R(rng, 2, 9), a = coprime(rng, b), k = R(rng, 2, 6), A = fs(a, b);
    if (i === 2) { const [sn, sd] = U.simplify(a, b * k); return Q(`${CALC} ${A} : ${k}`, fr(sn, sd), L(`Viết ${k} = ${k}/1; phân số đảo ngược là 1/${k}.\n${A} : ${k} = ${A} × 1/${k} = ${fs(a, b * k)}${sn !== a ? ` = ${fs(sn, sd)}` : ''}.`, `Write ${k} = ${k}/1; turned upside down it is 1/${k}.\n${A} : ${k} = ${A} × 1/${k} = ${fs(a, b * k)}${sn !== a ? ` = ${fs(sn, sd)}` : ''}.`), { hint: L(`Chia cho ${k} tức là nhân với 1/${k}.`, `Dividing by ${k} is the same as multiplying by 1/${k}.`) }); }
    const [sn, sd] = U.simplify(k * b, a);
    return Q(`${CALC} ${k} : ${A}`, sd === 1 ? num(sn) : fr(sn, sd), `${k} : ${A} = ${k} × ${fs(b, a)} = ${fs(k * b, a)}${sd === 1 ? ` = ${sn}` : sn !== k * b ? ` = ${fs(sn, sd)}` : ''}.`, { hint: L(`Lấy ${k} nhân với phân số đảo ngược của ${A}.`, `Multiply ${k} by ${A} turned upside down.`) });
  }
  function chiaVary(rng, i) {
    if (i === 5) { const g = chiaForm(rng, 1); return toQ(g, L('Chiều dài = diện tích : chiều rộng.', 'Length = area : width.'), g.frac); }
    if (i === 4) {
      const b = R(rng, 2, 9), a = coprime(rng, b), k = R(rng, 2, 6), [sn, sd] = U.simplify(a, b * k), A = fs(a, b);
      return Q(L(`Có ${A} l nước cam rót đều vào ${k} cốc. Hỏi mỗi cốc có bao nhiêu lít nước cam?`, `${A} l of orange juice is poured equally into ${k} cups. How many litres are in each cup?`), fr(sn, sd), L(`Mỗi cốc có: ${A} : ${k} = ${A} × 1/${k} = ${fs(a, b * k)}${sn !== a ? ` = ${fs(sn, sd)}` : ''} (l).`, `Each cup holds: ${A} : ${k} = ${A} × 1/${k} = ${fs(a, b * k)}${sn !== a ? ` = ${fs(sn, sd)}` : ''} (l).`), { hint: L(`Chia đều thì làm phép chia: ${A} : ${k}.`, `Sharing equally means dividing: ${A} : ${k}.`) });
    }
    // the missing factor
    const p = mulPair(rng, 0), [pn, pd] = U.simplify(p.a * p.c, p.b * p.d), B = fs(p.c, p.d), Pr = fs(pn, pd);
    return Q(L(`Tìm phân số thích hợp: ? × ${B} = ${Pr}`, `Find the missing fraction: ? × ${B} = ${Pr}`), fr(p.a, p.b), L(`Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số đã biết.\n${Pr} : ${B} = ${Pr} × ${fs(p.d, p.c)} = ${fs(pn * p.d, pd * p.c)} = ${fs(p.a, p.b)}.`, `To find a missing factor, divide the product by the known factor.\n${Pr} : ${B} = ${Pr} × ${fs(p.d, p.c)} = ${fs(pn * p.d, pd * p.c)} = ${fs(p.a, p.b)}.`), { hint: L('Thừa số chưa biết = tích : thừa số đã biết.', 'Missing factor = product : known factor.') });
  }
  function chiaHard(rng) {
    const d = R(rng, 2, 8), c = coprime(rng, d), n = R(rng, 2, 9), [an, ad] = U.simplify(n * c, d), B = fs(c, d), A = ad === 1 ? String(an) : fs(an, ad);
    const [vi, en, u, uE] = P(rng, [[`Có ${A} kg kẹo chia vào các túi, mỗi túi ${B} kg. Hỏi chia được bao nhiêu túi kẹo?`, `${A} kg of sweets is put into bags of ${B} kg each. How many bags are filled?`, 'túi', 'bags'],
      [`Một sợi dây dài ${A} m được cắt thành các đoạn, mỗi đoạn dài ${B} m. Hỏi cắt được bao nhiêu đoạn?`, `A string ${A} m long is cut into pieces of ${B} m each. How many pieces are there?`, 'đoạn', 'pieces'],
      [`Có ${A} l sữa rót vào các cốc, mỗi cốc ${B} l. Hỏi rót được bao nhiêu cốc sữa?`, `${A} l of milk is poured into cups of ${B} l each. How many cups are filled?`, 'cốc', 'cups']]);
    return Q(L(vi, en), num(n, L(u, uE)), L(`Số ${u}: ${A} : ${B} = ${A} × ${fs(d, c)} = ${fs(an * d, ad * c)} = ${n} (${u}).`, `Number of ${uE}: ${A} : ${B} = ${A} × ${fs(d, c)} = ${fs(an * d, ad * c)} = ${n} (${uE}).`), { hint: L(`Lấy ${A} chia cho ${B}.`, `Divide ${A} by ${B}.`) });
  }

  // ================= 14. Tìm phân số của một số (Bài 65) =================
  // rest: also ask what is left
  function pcsForm(rng, k, rest, big) {
    let d, n;
    do { d = R(rng, 3, 9); n = coprime(rng, d); } while (n < 2);   // at least 2 parts, so that both steps matter
    const q = R(rng, 2, big ? 20 : 8), N = d * q, v = n * q, f = fs(n, d);
    const C = [
      { u: L('học sinh', 'pupils'), part: L('Số học sinh nữ', 'The number of girls'), left: L('Số học sinh nam', 'The number of boys'),
        p: L(`Lớp 4A có ${N} học sinh, trong đó ${f} số học sinh là học sinh nữ.`, `Class 4A has ${N} pupils, and ${f} of them are girls.`), q: L('Hỏi lớp 4A có bao nhiêu học sinh nữ?', 'How many girls are there in class 4A?'), qr: L('Hỏi lớp 4A có bao nhiêu học sinh nam?', 'How many boys are there in class 4A?') },
      { u: 'kg', part: L('Số gạo đã bán', 'Rice sold'), left: L('Số gạo còn lại', 'Rice left'),
        p: L(`Một cửa hàng có ${N} kg gạo, đã bán ${f} số gạo đó.`, `A shop has ${N} kg of rice and has sold ${f} of it.`), q: L('Hỏi cửa hàng đã bán bao nhiêu ki-lô-gam gạo?', 'How many kilograms of rice has the shop sold?'), qr: L('Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?', 'How many kilograms of rice are left?') },
      { u: 'm', part: L('Quãng đường đã sửa', 'Road repaired'), left: L('Quãng đường còn phải sửa', 'Road still to repair'),
        p: L(`Một quãng đường dài ${N} m. Đội công nhân đã sửa được ${f} quãng đường.`, `A road is ${N} m long. A team of workers has repaired ${f} of it.`), q: L('Hỏi đội đã sửa được bao nhiêu mét đường?', 'How many metres of road have they repaired?'), qr: L('Hỏi đội còn phải sửa bao nhiêu mét đường?', 'How many metres of road do they still have to repair?') },
      { u: L('trang', 'pages'), part: L('Số trang đã đọc', 'Pages read'), left: L('Số trang chưa đọc', 'Pages not yet read'),
        p: L(`Quyển truyện có ${N} trang. Bạn Mai đã đọc được ${f} số trang.`, `A storybook has ${N} pages. Mai has read ${f} of the pages.`), q: L('Hỏi Mai đã đọc được bao nhiêu trang?', 'How many pages has Mai read?'), qr: L('Hỏi Mai còn bao nhiêu trang chưa đọc?', 'How many pages has Mai not read yet?') },
    ][k];
    const steps = [
      S(L(`Muốn tìm ${f} của ${N}, ta làm phép tính nào?`, `Which calculation finds ${f} of ${N}?`), ch(rng, `${N} × ${f}`, [`${N} : ${f}`, `${N} + ${f}`, `${N} ${M} ${f}`]),
        L(`Tìm ${f} của ${N}: lấy ${N} × ${f}, tức là chia ${N} thành ${d} phần bằng nhau rồi lấy ${n} phần.`, `To find ${f} of ${N}, work out ${N} × ${f}: split ${N} into ${d} equal parts and take ${n} of them.`)),
      S(L(`Chia ${N} thành ${d} phần bằng nhau. Mỗi phần là bao nhiêu?`, `Split ${N} into ${d} equal parts. How much is each part?`), num(q, C.u), L(`Giá trị 1 phần: ${N} : ${d} = ${q} (${C.u}).`, `1 part: ${N} : ${d} = ${q} (${C.u}).`)),
      S(L(`Lấy ${n} phần như thế: ${q} × ${n} = ?`, `Take ${n} of these parts: ${q} × ${n} = ?`), num(v, C.u), L(`${C.part}: ${N} × ${f} = ${v} (${C.u}).`, `${C.part}: ${N} × ${f} = ${v} (${C.u}).`)),
    ];
    if (rest) steps.push(S(L(`${C.left}: ${N} ${M} ${v} = ?`, `${C.left}: ${N} ${M} ${v} = ?`), num(N - v, C.u), L(`${C.left}: ${N} ${M} ${v} = ${N - v} (${C.u}).`, `${C.left}: ${N} ${M} ${v} = ${N - v} (${C.u}).`)));
    return G(`${C.p} ${rest ? C.qr : C.q}`, steps, DS(`${rest ? N - v : v} ${C.u}`),
      vz('tape', { bars: [{ label: L('Cả', 'Whole'), parts: d, units: d, value: String(N) }, { label: f, parts: n, units: n, value: '?' }] }));
  }
  const PCS_HINT = L('Lấy số đã cho chia cho mẫu số rồi nhân với tử số.', 'Divide the number by the denominator, then multiply by the numerator.');
  function pcsPlain(rng, i) {
    if (i > 0) return toQ(pcsForm(rng, i, false, i === 3), PCS_HINT);
    const d = R(rng, 2, 9), n = coprime(rng, d), q = R(rng, 2, 9), N = d * q, f = fs(n, d);
    return Q(L(`Tìm ${f} của ${N}.`, `Find ${f} of ${N}.`), num(n * q), `${N} × ${f} = ${N} : ${d} × ${n} = ${q} × ${n} = ${n * q}.`,
      { hint: PCS_HINT, visual: vz('tape', { bars: [{ label: L('Cả', 'Whole'), parts: d, units: d, value: String(N) }, { label: f, parts: n, units: n, value: '?' }] }) });
  }
  function pcsVary(rng, i) {
    if (i === 4) return toQ(pcsForm(rng, R(rng, 0, 3), true, true), L('Tìm phân số của số đó, rồi lấy số đó trừ đi.', 'Find the fraction of the number, then take it away from the number.'));
    if (i === 5) {
      const [base, u1, u2, ds, e1, e2] = P(rng, [[60, 'giờ', 'phút', [2, 3, 4, 5, 6, 10, 12], 'hour', 'minutes'], [100, 'm', 'cm', [2, 4, 5, 10, 20, 25], 'm', 'cm'], [1000, 'kg', 'g', [2, 4, 5, 8, 10], 'kg', 'g'], [100, 'tạ', 'kg', [2, 4, 5, 10], 'quintal', 'kg'], [60, 'phút', 'giây', [2, 3, 4, 5, 6, 10], 'minute', 'seconds']]);
      const d = P(rng, ds), n = coprime(rng, d), v = base / d * n, f = fs(n, d);
      return Q(L(`${MISS}\n${f} ${u1} = ? ${u2}`, `${MISS}\n${f} ${e1} = ? ${e2}`), num(v, L(u2, e2)), L(`1 ${u1} = ${F(base)} ${u2}.\n${f} của ${F(base)}: ${F(base)} : ${d} × ${n} = ${F(v)}. Vậy ${f} ${u1} = ${F(v)} ${u2}.`, `1 ${e1} = ${F(base)} ${e2}.\n${f} of ${F(base)}: ${F(base)} : ${d} × ${n} = ${F(v)}. So ${f} ${e1} = ${F(v)} ${e2}.`),
        { hint: L(`1 ${u1} = ${F(base)} ${u2}; tìm ${f} của ${F(base)}.`, `1 ${e1} = ${F(base)} ${e2}; find ${f} of ${F(base)}.`) });
    }
    const d = R(rng, 2, 6), n = coprime(rng, d), q = R(rng, 3, 9), a = d * q, b = n * q, f = fs(n, d);
    return lines(L(`Một mảnh vườn hình chữ nhật có chiều dài ${a} m, chiều rộng bằng ${f} chiều dài. Tính diện tích mảnh vườn.`, `A rectangular garden is ${a} m long. Its width is ${f} of its length. Find the area of the garden.`),
      [[b, 'm', L(`Chiều rộng mảnh vườn: ${a} × ${f} = ${b} (m).`, `Width of the garden: ${a} × ${f} = ${b} (m).`)], [a * b, 'm²', L(`Diện tích mảnh vườn: ${a} × ${b} = ${F(a * b)} (m²).`, `Area of the garden: ${a} × ${b} = ${F(a * b)} (m²).`)]],
      L(`Tìm chiều rộng trước: ${f} của ${a}.`, `Find the width first: ${f} of ${a}.`), rect(a, b, 'm'));
  }
  function pcsHard(rng) {
    const d = R(rng, 3, 8), n = coprime(rng, d), q = R(rng, 6, 20), N = d * q, v = n * q, pm = R(rng, 5, N - v - 5), f = fs(n, d);
    return lines(L(`Một cửa hàng có ${N} kg đường. Buổi sáng cửa hàng bán được ${f} số đường đó, buổi chiều bán được ${pm} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam đường?`, `A shop has ${N} kg of sugar. In the morning it sells ${f} of the sugar. In the afternoon it sells ${pm} kg. How many kilograms of sugar are left?`),
      [[v, 'kg', L(`Buổi sáng bán được: ${N} × ${f} = ${v} (kg).`, `Sold in the morning: ${N} × ${f} = ${v} (kg).`)], [v + pm, 'kg', L(`Cả ngày bán được: ${v} + ${pm} = ${v + pm} (kg).`, `Sold that day: ${v} + ${pm} = ${v + pm} (kg).`)],
        [N - v - pm, 'kg', L(`Còn lại: ${N} ${M} ${v + pm} = ${N - v - pm} (kg).`, `Left: ${N} ${M} ${v + pm} = ${N - v - pm} (kg).`)]],
      L(`Tìm ${f} của ${N} trước.`, `Find ${f} of ${N} first.`));
  }

  DT.add(4, [
    // ---------------- Học kì I ----------------
    { id: 'g4-dt-ba-buoc', sem: 1, icon: '🧩', lesson: 'g4-c1-b5',
      title: L('Giải bài toán có ba bước tính', 'Word problems with three steps'),
      spot: L('Bài toán hỏi một điều, nhưng muốn trả lời thì phải tìm hai điều khác trước. Ta phải làm ba phép tính.', 'The problem asks for one thing, but you must find two other things first. You need three calculations.'),
      steps: [
        L('Bước 1: Đọc kĩ đề và tóm tắt: bài toán cho biết gì, hỏi gì?', 'Step 1: Read the problem carefully and note the key facts: what is given and what is asked?'),
        L('Bước 2: Đi từ câu hỏi: muốn tìm điều đó cần biết những gì trước?', 'Step 2: Start from the question: what do you need to know first to answer it?'),
        L('Bước 3: Tính lần lượt từng bước. Mỗi bước viết một câu lời giải và một phép tính.', 'Step 3: Work through the steps one by one. For each step write one sentence and one calculation.'),
      ],
      tip: L('Dễ nhầm: dừng lại ở bước thứ hai. Đọc lại câu hỏi xem đã trả lời đúng điều bài toán hỏi chưa.', 'A common mistake: stopping after the second step. Read the question again to check you have answered what it asks.'),
      guide: rng => P(rng, [bbClasses, bbShop, bbBoxes])(rng),
      practice: prac((rng, i) => (i === 3 ? bbDays(rng) : toQ([bbClasses, bbBoxes, bbShop][i](rng), L('Tìm lần lượt từng bước; mỗi bước trả lời một câu hỏi nhỏ.', 'Go one step at a time; each step answers one small question.'))),
        (rng, i) => [bbRoad, bbPocket, bbCompare][i - 4](rng), bbCans, ['g4-ba-buoc', 'g4-mua-hang']) },

    { id: 'g4-dt-doi-khoi-luong', sem: 1, icon: '⚖️', lesson: 'g4-c4-b17',
      title: L('Đổi đơn vị đo khối lượng: yến, tạ, tấn', 'Changing units of mass: yến, quintals, tonnes'),
      spot: L('Bài toán có các số đo khối lượng với đơn vị khác nhau (tấn, tạ, yến, kg), hoặc yêu cầu viết số thích hợp: 3 tạ = ? kg.', 'The problem has masses in different units (tonnes, quintals, yến, kg), or asks for a missing number: 3 quintals = ? kg.'),
      steps: [
        L('Bước 1: Nhớ: 1 yến = 10 kg; 1 tạ = 10 yến = 100 kg; 1 tấn = 10 tạ = 1000 kg.', 'Step 1: Remember: 1 yến = 10 kg; 1 quintal = 10 yến = 100 kg; 1 tonne = 10 quintals = 1000 kg.'),
        L('Bước 2: Đổi ra đơn vị bé hơn thì nhân; đổi ra đơn vị lớn hơn thì chia.', 'Step 2: Multiply to change to a smaller unit; divide to change to a bigger unit.'),
        L('Bước 3: Trong bài toán có lời văn, đổi tất cả về cùng một đơn vị rồi mới tính.', 'Step 3: In a word problem, change everything to the same unit before you calculate.'),
      ],
      tip: L('Dễ nhầm: cho rằng 1 tấn = 100 kg. Đúng là 1 tấn = 1000 kg, còn 1 tạ = 100 kg.', 'A common mistake: thinking 1 tonne = 100 kg. In fact 1 tonne = 1000 kg, and 1 quintal = 100 kg.'),
      guide: rng => P(rng, [kgLorry, kgAnimals, kgBags])(rng),
      practice: prac(kgSimple, (rng, i) => (i === 5 ? kgCompare(rng) : toQ((i === 4 ? kgAnimals : kgBags)(rng), L('Đổi về cùng một đơn vị trước.', 'Change to the same unit first.'))), kgTwoLorries, ['g4-voi']) },

    { id: 'g4-dt-doi-dien-tich', sem: 1, icon: '🟦', lesson: 'g4-c4-b18',
      title: L('Đổi đơn vị đo diện tích: m², dm², cm², mm²', 'Changing units of area: m², dm², cm², mm²'),
      spot: L('Bài toán có số đo diện tích với các đơn vị m², dm², cm², mm² và yêu cầu đổi sang đơn vị khác: 5 m² = ? dm².', 'The problem has areas in m², dm², cm² or mm² and asks you to change the unit: 5 m² = ? dm².'),
      steps: [
        L('Bước 1: Nhớ: 1 m² = 100 dm²; 1 dm² = 100 cm²; 1 cm² = 100 mm². Hai đơn vị đo diện tích liền nhau gấp, kém nhau 100 lần.', 'Step 1: Remember: 1 m² = 100 dm²; 1 dm² = 100 cm²; 1 cm² = 100 mm². Each unit of area is 100 times the next smaller one.'),
        L('Bước 2: Đổi ra đơn vị bé hơn: nhân với 100. Đổi ra đơn vị lớn hơn: chia cho 100.', 'Step 2: To change to a smaller unit, multiply by 100. To change to a bigger unit, divide by 100.'),
        L('Bước 3: Số đo có hai đơn vị (3 m² 25 dm²): đổi phần đơn vị lớn rồi cộng với phần còn lại.', 'Step 3: With two units (3 m² 25 dm²): change the bigger unit, then add the rest.'),
      ],
      tip: L('Dễ nhầm với đơn vị đo độ dài: 1 m = 10 dm nhưng 1 m² = 100 dm².', 'Do not mix this up with length: 1 m = 10 dm, but 1 m² = 100 dm².'),
      guide: rng => P(rng, [dtCompound, dtSplit, dtTwoHops])(rng),
      practice: prac(dtSimple, (rng, i) => (i === 4 ? dtCompare(rng) : i === 5 ? dtSum(rng) : dtSplitQ(rng)),
        (rng, i) => [dtTiles, dtBoard, dtLeft][i - 7](rng)) },

    { id: 'g4-dt-giay-the-ki', sem: 1, icon: '⏱️', lesson: 'g4-c4-b19',
      title: L('Đổi đơn vị đo thời gian: giây, thế kỉ', 'Units of time: seconds and centuries'),
      spot: L('Bài toán yêu cầu đổi phút ra giây, thế kỉ ra năm, hoặc hỏi một năm thuộc thế kỉ nào.', 'The problem asks you to change minutes to seconds or centuries to years, or asks which century a year is in.'),
      steps: [
        L('Bước 1: Nhớ: 1 giờ = 60 phút; 1 phút = 60 giây; 1 thế kỉ = 100 năm.', 'Step 1: Remember: 1 hour = 60 minutes; 1 minute = 60 seconds; 1 century = 100 years.'),
        L('Bước 2: Đổi phút ra giây: nhân với 60. Số đo "2 phút 15 giây": đổi 2 phút ra giây rồi cộng 15 giây.', 'Step 2: To change minutes to seconds, multiply by 60. For "2 minutes 15 seconds": change the 2 minutes to seconds, then add 15 seconds.'),
        L('Bước 3: Tìm thế kỉ của một năm: từ năm 1 đến năm 100 là thế kỉ I, từ năm 101 đến năm 200 là thế kỉ II, …, từ năm 2001 đến năm 2100 là thế kỉ XXI.', 'Step 3: To find the century of a year: the years 1 to 100 are the 1st century, 101 to 200 the 2nd century, …, 2001 to 2100 the 21st century.'),
      ],
      tip: L('Dễ nhầm: năm 2000 thuộc thế kỉ XX (không phải XXI), vì thế kỉ XX gồm các năm từ 1901 đến 2000.', 'A common mistake: the year 2000 is in the 20th century (not the 21st), because the 20th century is the years 1901 to 2000.'),
      guide: rng => P(rng, [tgRun, tgCentury])(rng),
      practice: prac(tgSimple, tgVary, tgLaps, ['g4-chay']) },

    { id: 'g4-dt-thuan-tien-cong', sem: 1, icon: '🧠', lesson: 'g4-c5-b24',
      title: L('Tính bằng cách thuận tiện (phép cộng)', 'Calculating in the easiest way (addition)'),
      spot: L('Đề bài ghi "Tính bằng cách thuận tiện". Trong phép cộng có những số cộng với nhau được số tròn chục, tròn trăm, tròn nghìn.', 'The problem says "Calculate in the easiest way". Some of the addends make a whole number of tens, hundreds or thousands.'),
      steps: [
        L('Bước 1: Tìm các cặp số có tổng là số tròn chục, tròn trăm, tròn nghìn (nhìn chữ số hàng đơn vị: 3 và 7, 6 và 4, …).', 'Step 1: Look for pairs that make whole tens, hundreds or thousands (look at the ones digits: 3 and 7, 6 and 4, …).'),
        L('Bước 2: Dùng tính chất giao hoán và kết hợp để đổi chỗ và nhóm các cặp số đó trong ngoặc.', 'Step 2: Use the commutative and associative properties to swap the addends and group those pairs in brackets.'),
        L('Bước 3: Tính trong ngoặc trước, rồi cộng các kết quả.', 'Step 3: Work out the brackets first, then add the results.'),
      ],
      tip: L('Dễ nhầm: đổi chỗ rồi chép thiếu hoặc chép sai một số hạng. Đếm lại xem đã đủ các số hạng chưa.', 'A common mistake: leaving out or miscopying an addend after swapping. Count the addends again.'),
      guide: rng => (R(rng, 0, 1) ? ttc3(rng, R(rng, 0, 2) === 0) : ttc4(rng, false)),
      practice: prac((rng, i) => toQ(i === 0 ? ttc3(rng, false) : i === 1 ? ttc3(rng, true) : ttc4(rng, i === 3), TTC_HINT), ttcVary, rng => toQ(ttc4(rng, true), TTC_HINT), ['g4-thuan-tien']) },

    { id: 'g4-dt-tong-hieu', sem: 1, icon: '👫', lesson: 'g4-c5-b25',
      title: L('Tìm hai số khi biết tổng và hiệu', 'Finding two numbers from their sum and difference'),
      spot: L('Bài toán cho biết tổng của hai số (cả hai, tất cả) và hiệu của hai số (hơn, kém, nhiều hơn, ít hơn), rồi hỏi mỗi số.', 'The problem gives the sum of two numbers (altogether, in total) and their difference (more than, fewer than, older than), then asks for each number.'),
      steps: [
        L('Bước 1: Xác định tổng, hiệu; số nào là số lớn, số nào là số bé. Vẽ sơ đồ đoạn thẳng.', 'Step 1: Find the sum and the difference, and which number is bigger. Draw a bar model.'),
        L('Bước 2: Số bé = (Tổng − Hiệu) : 2.', 'Step 2: Smaller number = (Sum − Difference) : 2.'),
        L('Bước 3: Số lớn = Số bé + Hiệu. (Hoặc tìm số lớn trước: Số lớn = (Tổng + Hiệu) : 2.)', 'Step 3: Bigger number = Smaller number + Difference. (Or find the bigger one first: Bigger number = (Sum + Difference) : 2.)'),
      ],
      tip: L('Dễ nhầm: lấy tổng chia 2 ngay. Phải bớt hiệu đi (hoặc thêm hiệu vào) để được hai số bằng nhau rồi mới chia 2.', 'A common mistake: halving the sum straight away. First take away (or add) the difference so the two numbers are equal, then divide by 2.'),
      guide: rng => thForm(rng, R(rng, 0, 4), 0, 0),
      practice: prac((rng, i) => { const g = thForm(rng, i, i === 0 ? R(rng, 1, 2) : i === 1 ? 1 : 2, 0); return toQ(g, TH_HINT, g.pick); },
        (rng, i) => { if (i === 6) return thPerimeter(rng); const g = thForm(rng, i === 4 ? P(rng, [0, 3, 4]) : 5, i === 4 ? 1 : 2, 1); return toQ(g, TH_HINT, g.pick); }, thGive, ['g4-tuoi', 'g4-tong-hieu']) },

    { id: 'g4-dt-chu-vi-dien-tich', sem: 1, icon: '📐', lesson: 'g4-c4-b18',
      title: L('Chu vi và diện tích hình chữ nhật, hình vuông', 'Perimeter and area of rectangles and squares'),
      spot: L('Bài toán nói về một hình chữ nhật hoặc hình vuông (mảnh vườn, sân, tấm bìa…) và hỏi chu vi (đường bao quanh) hoặc diện tích (bề mặt).', 'The problem is about a rectangle or a square (a garden, a yard, a card…) and asks for the perimeter (the line all the way round) or the area (the surface).'),
      steps: [
        L('Bước 1: Xem các số đo đã cùng đơn vị chưa; nếu chưa thì đổi.', 'Step 1: Check that the measurements are in the same unit; if not, change them.'),
        L('Bước 2: Chu vi hình chữ nhật = (dài + rộng) × 2. Chu vi hình vuông = cạnh × 4.', 'Step 2: Perimeter of a rectangle = (length + width) × 2. Perimeter of a square = side × 4.'),
        L('Bước 3: Diện tích hình chữ nhật = dài × rộng. Diện tích hình vuông = cạnh × cạnh.', 'Step 3: Area of a rectangle = length × width. Area of a square = side × side.'),
        L('Bước 4: Ghi đúng đơn vị: chu vi là m, cm…; diện tích là m², cm²…', 'Step 4: Write the right unit: m, cm… for a perimeter; m², cm²… for an area.'),
      ],
      tip: L('Dễ nhầm chu vi với diện tích. Rào quanh vườn là chu vi; lát nền, trồng cỏ là diện tích.', 'Do not mix up perimeter and area. A fence round a garden is a perimeter; tiling a floor or planting grass is an area.'),
      guide: rng => P(rng, [cvFence, cvTimes, cvSquare])(rng, 0),
      practice: prac(cvPlain, cvVary, cvHard, ['g4-chu-nhat']) },

    // ---------------- Học kì II ----------------
    { id: 'g4-dt-thuan-tien-nhan', sem: 2, icon: '✨', lesson: 'g4-c8-b42',
      title: L('Tính bằng cách thuận tiện (phép nhân)', 'Calculating in the easiest way (multiplication)'),
      spot: L('Đề bài ghi "Tính bằng cách thuận tiện" và có phép nhân: có hai thừa số nhân với nhau được số tròn (25 × 4, 125 × 8, 5 × 2…), hoặc hai tích có một thừa số giống nhau (36 × 7 + 36 × 3).', 'The problem says "Calculate in the easiest way" and has multiplication: two factors make a round number (25 × 4, 125 × 8, 5 × 2…), or two products share a factor (36 × 7 + 36 × 3).'),
      steps: [
        L('Bước 1: Xem phép tính thuộc kiểu nào: tích của nhiều thừa số, hay tổng của hai tích có thừa số chung.', 'Step 1: See which type it is: a product of several factors, or a sum of two products with a common factor.'),
        L('Bước 2: Tích nhiều thừa số: nhóm các thừa số có tích tròn chục, tròn trăm, tròn nghìn (5 × 2 = 10; 25 × 4 = 100; 125 × 8 = 1000).', 'Step 2: A product of several factors: group the factors that make whole tens, hundreds or thousands (5 × 2 = 10; 25 × 4 = 100; 125 × 8 = 1000).'),
        L('Bước 3: Có thừa số chung: a × b + a × c = a × (b + c). Tính trong ngoặc trước rồi nhân.', 'Step 3: A common factor: a × b + a × c = a × (b + c). Work out the brackets first, then multiply.'),
      ],
      tip: L('Dễ nhầm: viết thừa số chung hai lần. 36 × 7 + 36 × 3 = 36 × (7 + 3), thừa số 36 chỉ viết một lần.', 'A common mistake: writing the common factor twice. 36 × 7 + 36 × 3 = 36 × (7 + 3): write 36 only once.'),
      guide: rng => (R(rng, 0, 1) ? ttnPair(rng) : ttnDist(rng, R(rng, 0, 2) ? 10 : 100)),
      practice: prac(ttnPlain, ttnVary, ttnHard, ['g4-phan-phoi']) },

    { id: 'g4-dt-trung-binh-cong', sem: 2, icon: '📊', lesson: 'g4-c8-b46',
      title: L('Tìm số trung bình cộng', 'Finding the average'),
      spot: L('Bài toán hỏi "trung bình mỗi … được bao nhiêu?" hoặc "tìm số trung bình cộng của các số".', 'The problem asks "on average, how many … each?" or "find the average of these numbers".'),
      steps: [
        L('Bước 1: Tính tổng của tất cả các số.', 'Step 1: Add up all the numbers.'),
        L('Bước 2: Đếm xem có mấy số hạng.', 'Step 2: Count how many numbers there are.'),
        L('Bước 3: Lấy tổng chia cho số các số hạng.', 'Step 3: Divide the sum by how many numbers there are.'),
      ],
      tip: L('Dễ nhầm: có 3 số mà chia cho 2. Có bao nhiêu số hạng thì chia cho bấy nhiêu.', 'A common mistake: dividing by 2 when there are 3 numbers. Divide by exactly how many numbers there are.'),
      guide: rng => tbcForm(rng, R(rng, 3, 4), R(rng, 0, 3)),
      practice: prac(tbcPlain, tbcVary, tbcHard, ['g4-tbc-so', 'g4-tbc-nhom', 'g4-tbc-thieu', 'g4-tbc-hieu']) },

    { id: 'g4-dt-rut-ve-don-vi', sem: 2, icon: '📦', lesson: 'g4-c8-b47',
      title: L('Bài toán liên quan đến rút về đơn vị', 'Problems solved by finding one unit first'),
      spot: L('Bài toán cho biết giá trị của nhiều phần bằng nhau (3 hộp có 24 cái bánh) rồi hỏi giá trị của một số phần khác (5 hộp như thế), hoặc hỏi được mấy phần.', 'The problem gives the value of several equal parts (3 boxes hold 24 cakes), then asks for the value of another number of parts (5 boxes like this), or asks how many parts.'),
      steps: [
        L('Bước 1 (rút về đơn vị): Tìm giá trị của 1 phần — làm phép chia.', 'Step 1 (find one unit): Find the value of 1 part — divide.'),
        L('Bước 2: Tìm giá trị của nhiều phần — làm phép nhân. (Nếu bài toán hỏi "được mấy phần" thì bước này làm phép chia.)', 'Step 2: Find the value of several parts — multiply. (If the problem asks "how many parts", divide in this step.)'),
      ],
      tip: L('Dễ nhầm: lấy hai số trong đề nhân luôn với nhau. Luôn tìm 1 phần trước: 1 hộp, 1 quyển, 1 xe…', 'A common mistake: multiplying two numbers from the problem straight away. Always find 1 part first: 1 box, 1 book, 1 lorry…'),
      guide: rng => (R(rng, 0, 2) ? rdvForm(rng, R(rng, 0, 4), false) : rdvCount(rng, R(rng, 0, 2))),
      practice: prac((rng, i) => toQ(i === 3 ? rdvCount(rng, 0) : rdvForm(rng, i === 0 ? P(rng, [0, 3]) : i === 1 ? 1 : P(rng, [2, 4]), i === 2), RDV_HINT), rdvVary, rdvHard, ['g4-rut-don-vi']) },

    { id: 'g4-dt-cong-tru-ps', sem: 2, icon: '➕', lesson: 'g4-c11-b60',
      title: L('Cộng, trừ hai phân số', 'Adding and subtracting fractions'),
      spot: L('Phép tính cộng hoặc trừ hai phân số. Nếu hai mẫu số khác nhau thì mẫu số này chia hết cho mẫu số kia (1/2 và 3/8; 2/3 và 5/6).', 'An addition or subtraction of two fractions. If the denominators are different, one can be divided exactly by the other (1/2 and 3/8; 2/3 and 5/6).'),
      steps: [
        L('Bước 1: Cùng mẫu số: cộng (trừ) hai tử số, giữ nguyên mẫu số.', 'Step 1: Same denominator: add (subtract) the numerators and keep the denominator.'),
        L('Bước 2: Khác mẫu số: quy đồng — lấy mẫu số lớn làm mẫu số chung, nhân cả tử số và mẫu số của phân số kia với cùng một số.', 'Step 2: Different denominators: use the bigger one as the common denominator; multiply the numerator and the denominator of the other fraction by the same number.'),
        L('Bước 3: Cộng (trừ) hai tử số, giữ nguyên mẫu số chung. Rút gọn kết quả nếu được.', 'Step 3: Add (subtract) the numerators and keep the common denominator. Simplify the answer if you can.'),
      ],
      tip: L('Dễ nhầm: cộng tử số với tử số, mẫu số với mẫu số (1/2 + 1/4 = 2/6 là sai). Mẫu số không cộng: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.', 'A common mistake: adding numerators and also adding denominators (1/2 + 1/4 = 2/6 is wrong). Never add denominators: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.'),
      guide: rng => psAddSub(rng, R(rng, 0, 1) ? '+' : M, R(rng, 0, 2) === 0 ? 1 : 0),
      practice: prac(psPlain, psVary, psHard, ['g4-ps-be']) },

    { id: 'g4-dt-nhan-ps', sem: 2, icon: '✖️', lesson: 'g4-c12-b63',
      title: L('Nhân phân số', 'Multiplying fractions'),
      spot: L('Phép nhân hai phân số, hoặc nhân phân số với số tự nhiên. Trong bài toán: tính diện tích hình chữ nhật có cạnh là phân số; "mỗi chai có 3/4 l, hỏi 5 chai như thế…".', 'Multiplying two fractions, or a fraction by a whole number. In word problems: the area of a rectangle whose sides are fractions; "each bottle holds 3/4 l, how much do 5 bottles hold?".'),
      steps: [
        L('Bước 1: Lấy tử số nhân với tử số.', 'Step 1: Multiply the numerators together.'),
        L('Bước 2: Lấy mẫu số nhân với mẫu số.', 'Step 2: Multiply the denominators together.'),
        L('Bước 3: Rút gọn kết quả nếu được. (Số tự nhiên viết thành phân số có mẫu số 1: 3 = 3/1.)', 'Step 3: Simplify the answer if you can. (Write a whole number as a fraction over 1: 3 = 3/1.)'),
      ],
      tip: L('Dễ nhầm: quy đồng mẫu số như phép cộng. Phép nhân không cần quy đồng: tử nhân tử, mẫu nhân mẫu.', 'A common mistake: finding a common denominator as for addition. Multiplication does not need one: numerator × numerator, denominator × denominator.'),
      guide: rng => nhanForm(rng, R(rng, 0, 2) === 0 ? 1 : 0, 0),
      practice: prac((rng, i) => { if (i === 1) return nhanWhole(rng, false); const g = nhanForm(rng, i === 3 ? 1 : 0, i === 2 ? 1 : 0); return toQ(g, NHAN_HINT, g.frac); }, nhanVary, nhanHard) },

    { id: 'g4-dt-chia-ps', sem: 2, icon: '➗', lesson: 'g4-c12-b64',
      title: L('Chia phân số', 'Dividing fractions'),
      spot: L('Phép chia hai phân số, hoặc chia phân số cho số tự nhiên. Trong bài toán: biết diện tích và một cạnh, tìm cạnh kia; chia đều một lượng là phân số.', 'Dividing two fractions, or a fraction by a whole number. In word problems: you know the area and one side and find the other side; or you share out an amount that is a fraction.'),
      steps: [
        L('Bước 1: Viết phân số đảo ngược của phân số thứ hai (đổi chỗ tử số và mẫu số).', 'Step 1: Turn the second fraction upside down (swap its numerator and denominator).'),
        L('Bước 2: Lấy phân số thứ nhất nhân với phân số đảo ngược đó.', 'Step 2: Multiply the first fraction by that upside-down fraction.'),
        L('Bước 3: Rút gọn kết quả nếu được.', 'Step 3: Simplify the answer if you can.'),
      ],
      tip: L('Dễ nhầm: đảo ngược phân số thứ nhất. Chỉ đảo ngược phân số thứ hai (số chia).', 'A common mistake: turning the first fraction upside down. Only the second fraction (the divisor) is turned upside down.'),
      guide: rng => chiaForm(rng, R(rng, 0, 2) === 0 ? 1 : 0),
      practice: prac(chiaPlain, chiaVary, chiaHard, ['g4-ps-tinh']) },

    { id: 'g4-dt-ps-cua-so', sem: 2, icon: '🍰', lesson: 'g4-c12-b65',
      title: L('Tìm phân số của một số', 'Finding a fraction of a number'),
      spot: L('Bài toán cho một số (lớp có 35 học sinh) và hỏi một phần của số đó, viết bằng phân số (3/5 số học sinh là nữ).', 'The problem gives a number (a class of 35 pupils) and asks for a part of it written as a fraction (3/5 of the pupils are girls).'),
      steps: [
        L('Bước 1: Xác định số đã cho và phân số cần tìm.', 'Step 1: Find the number given and the fraction you need.'),
        L('Bước 2: Lấy số đã cho chia cho mẫu số để tìm giá trị 1 phần.', 'Step 2: Divide the number by the denominator to find 1 part.'),
        L('Bước 3: Lấy giá trị 1 phần nhân với tử số. (Viết gọn: số đó × phân số.)', 'Step 3: Multiply 1 part by the numerator. (In short: the number × the fraction.)'),
      ],
      tip: L('Dễ nhầm: lấy số đã cho chia cho phân số. Tìm phân số của một số thì lấy số đó nhân với phân số.', 'A common mistake: dividing the number by the fraction. To find a fraction of a number, multiply the number by the fraction.'),
      guide: rng => pcsForm(rng, R(rng, 0, 3), R(rng, 0, 3) === 0, false),
      practice: prac(pcsPlain, pcsVary, pcsHard, ['g4-ps-cua-so', 'g4-ruong']) },
  ]);
})();
