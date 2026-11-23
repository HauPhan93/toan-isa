/* Toán ISA — bài nâng cao lớp 5 (Đề nâng cao). Contract: NANGCAO.md.
 * Mức 3 "vận dụng" problems for KNTT lớp 5: word problems of up to four steps, two topics together, working
 * backwards, units to convert inside the problem, convenient calculation with a common factor. One moving object
 * only; no xuôi/ngược dòng, no tỉ lệ nghịch, no "find a number from a percentage of it". Decimal answers have at
 * most 3 places; π = 3,14 as in the book.
 * What each test covers (core.js scopeLessons over lop5.js, first half = ceil(n / 2) lessons of the semester):
 *   giua-hk1: Bài 1–7, 10–13 — whole numbers, fractions, mixed numbers, decimals (meaning, comparing, measures,
 *             rounding); no decimal calculations yet
 *   cuoi-hk1: + Bài 15–16 (km², ha), 19–23 (decimal calculations), 25–27 (triangle, trapezium, circle)
 *   giua-hk2: Bài 36–41 (ratio, percentages, map scale, sum/difference and ratio), 45–47 (units of volume),
 *             49–50 (nets, cuboid surface area); the volume of a cuboid (Bài 52) is not in it yet
 *   cuoi-nam: + Bài 51–53 (cube surface area, cuboid and cube volume), 56–60 (time, speed), 63–65 (data, pie charts)
 */
(function () {
  'use strict';
  const L = NC.L, F = NC.F, R = NC.R, P = NC.P, M = NC.M, num = NC.num, Q = NC.Q;
  const EN = U.EN;
  const rd = x => U.round(x, 6);
  const dec = (m, s) => U.round(m / Math.pow(10, s), s);
  const ok2 = x => Math.abs(U.round(x, 2) - x) < 1e-9;
  const ok3 = x => Math.abs(U.round(x, 3) - x) < 1e-9;
  const gcd = U.gcd;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  // a fraction in its simplest form, as text and as an answer
  const sf = (n, d) => { const [a, b] = U.simplify(n, d); return b === 1 ? String(a) : `${a}/${b}`; };
  const frS = (n, d) => { const [a, b] = U.simplify(n, d); return b === 1 ? num(a) : NC.fr(a, b); };
  const lines = a => a.filter(Boolean).join('\n');
  // a decimal mantissa whose last digit is not 0, so the number keeps all its decimal places
  const mant = (rng, lo, hi) => { const m = R(rng, lo, hi); return m % 10 ? m : m + 1 <= hi ? m + 1 : m - 1; };
  // the first value from make() that passes ok (the fallback is a known good value)
  function pick(make, ok, fb) { for (let k = 0; k < 400; k++) { const v = make(); if (ok(v)) return v; } return fb; }
  const pl = (n, w) => `${F(n)} ${w}${n === 1 ? '' : 's'}`;
  const hm = (h, m) => (EN ? (h && m ? `${pl(h, 'hour')} ${pl(m, 'minute')}` : h ? pl(h, 'hour') : pl(m, 'minute'))
    : (h && m ? `${h} giờ ${m} phút` : h ? `${h} giờ` : `${m} phút`));
  const dur = t => hm(Math.floor(t / 60), t % 60);   // an amount of time given in minutes
  // a time of day given in minutes after midnight: "9 giờ 35 phút" / "9:35"
  const clk = t => { const h = Math.floor(t / 60), m = t % 60; return EN ? `${h}:${String(m).padStart(2, '0')}` : (m ? `${h} giờ ${m} phút` : `${h} giờ`); };
  const KMH = L('km/giờ', 'km/h'), DONG = L('đồng', 'dong'), TON = L('tấn', 'tonnes');
  const HEAD_TT = L('Tính bằng cách thuận tiện nhất:', 'Calculate in the most convenient way:');
  const HEAD_X = L('Tìm x, biết:', 'Find x:');
  // coprime ratios m/n (m < n) for the tổng–tỉ / hiệu–tỉ problems; RATIO2 has m ≥ 2 ("5 lần … bằng 2 lần …")
  const RATIO = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7], [4, 7], [5, 8]];
  const RATIO2 = [[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [4, 7], [5, 6], [5, 7], [3, 8], [5, 8], [4, 9], [5, 9], [7, 9]];
  // percentages that are simple ratios: [percent, m, n]
  const PCR = [[20, 1, 5], [25, 1, 4], [40, 2, 5], [50, 1, 2], [60, 3, 5], [75, 3, 4], [80, 4, 5]];

  // a mixed number with a simplest fraction part: { w, n, d, N (numerator as a fraction), s "2 3/4", f "11/4" }
  function mixedNum(rng, wlo, whi) {
    const d = R(rng, 2, 6); let n = R(rng, 1, d - 1);
    while (gcd(n, d) !== 1) n--;
    const w = R(rng, wlo, whi);
    return { w, n, d, N: w * d + n, s: `${w} ${n}/${d}`, f: `${w * d + n}/${d}` };
  }
  // ± mixed numbers over a common denominator: ts = [{ m, sg: 1 | -1 }]
  function sumMixed(ts) {
    const D = ts.reduce((acc, t) => U.lcm(acc, t.m.d), 1);
    const parts = ts.map(t => t.m.N * D / t.m.d);
    const tot = ts.reduce((acc, t, j) => acc + t.sg * parts[j], 0);
    const join = arr => arr.map((x, j) => (j ? (ts[j].sg > 0 ? ' + ' : ` ${M} `) : '') + x).join('');
    const a = join(ts.map(t => t.m.f)), b = join(parts.map(x => `${x}/${D}`));
    return { D, tot, how: `${a}${a !== b ? ` = ${b}` : ''} = ${tot}/${D}${sf(tot, D) !== `${tot}/${D}` ? ` = ${sf(tot, D)}` : ''}` };
  }
  // the pairs of the tổng–tỉ / hiệu–tỉ problems; `first` holds the smaller amount
  function pairCtx(n) {
    return [
      { item: L('số gạo ở', 'the rice in'), x1: L('kho thứ nhất', 'the first store'), x2: L('kho thứ hai', 'the second store'), unit: TON,
        sum: L(`Hai kho có tất cả ${n} tấn gạo.`, `Two stores hold ${n} tonnes of rice altogether.`),
        diff: L(`Kho thứ nhất có ít hơn kho thứ hai ${n} tấn gạo.`, `The first store has ${n} tonnes less rice than the second store.`),
        ask: X => L(`Hỏi ${X} có bao nhiêu tấn gạo?`, `How many tonnes of rice are there in ${X}?`) },
      { item: L('số dầu ở', 'the oil in'), x1: L('thùng thứ nhất', 'the first drum'), x2: L('thùng thứ hai', 'the second drum'), unit: 'l',
        sum: L(`Hai thùng chứa tất cả ${n} l dầu.`, `Two drums hold ${n} l of oil altogether.`),
        diff: L(`Thùng thứ nhất chứa ít hơn thùng thứ hai ${n} l dầu.`, `The first drum holds ${n} l less oil than the second drum.`),
        ask: X => L(`Hỏi ${X} chứa bao nhiêu lít dầu?`, `How many litres of oil are there in ${X}?`) },
      { item: L('số sách của', 'the number of books from'), x1: L('lớp 5A', 'class 5A'), x2: L('lớp 5B', 'class 5B'), unit: L('quyển', 'books'),
        sum: L(`Hai lớp 5A và 5B quyên góp được tất cả ${n} quyển sách.`, `Classes 5A and 5B collected ${n} books altogether.`),
        diff: L(`Lớp 5A quyên góp được ít hơn lớp 5B ${n} quyển sách.`, `Class 5A collected ${n} fewer books than class 5B.`),
        ask: X => L(`Hỏi ${X} quyên góp được bao nhiêu quyển sách?`, `How many books did ${X} collect?`) },
      { item: L('số cây của', 'the number of trees planted by'), x1: L('đội Một', 'team 1'), x2: L('đội Hai', 'team 2'), unit: L('cây', 'trees'),
        sum: L(`Hai đội trồng được tất cả ${n} cây.`, `Two teams planted ${n} trees altogether.`),
        diff: L(`Đội Một trồng được ít hơn đội Hai ${n} cây.`, `Team 1 planted ${n} fewer trees than team 2.`),
        ask: X => L(`Hỏi ${X} trồng được bao nhiêu cây?`, `How many trees did ${X} plant?`) },
      { item: L('số cá ở', 'the number of fish in'), x1: L('bể thứ nhất', 'the first tank'), x2: L('bể thứ hai', 'the second tank'), unit: L('con', 'fish'),
        sum: L(`Hai bể có tất cả ${n} con cá.`, `Two tanks hold ${n} fish altogether.`),
        diff: L(`Bể thứ nhất có ít hơn bể thứ hai ${n} con cá.`, `The first tank has ${n} fewer fish than the second tank.`),
        ask: X => L(`Hỏi ${X} có bao nhiêu con cá?`, `How many fish are there in ${X}?`) },
    ];
  }
  // "q lần A bằng p lần B" read as a ratio
  const relLine = (c, p, q) => L(`Biết ${q} lần ${c.item} ${c.x1} bằng ${p} lần ${c.item} ${c.x2}.`, `${q} times ${c.item} ${c.x1} is equal to ${p} times ${c.item} ${c.x2}.`);
  const relWhy = (c, p, q) => L(`Vì ${q} lần ${c.item} ${c.x1} bằng ${p} lần ${c.item} ${c.x2} nên ${c.item} ${c.x1} bằng ${p}/${q} ${c.item} ${c.x2}.`,
    `Since ${q} times ${c.item} ${c.x1} equals ${p} times ${c.item} ${c.x2}, ${c.item} ${c.x1} is ${p}/${q} of ${c.item} ${c.x2}.`);

  NC.add(5, [
    /* ================= GIỮA HỌC KÌ I (Bài 1–7, 10–13) ================= */

    // Common fraction factor: A = a/d × x/y + a/d × z/y − a/d × w/y (the brackets make 1 or 2)
    { id: 'g5-nc-tt-phanso', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c1-b5', gen: rng => {
      const d = R(rng, 5, 19);
      let a = R(rng, 2, d - 1);
      for (let k = 0; k < 30 && gcd(a, d) !== 1; k++) a = R(rng, 2, d - 1);
      if (gcd(a, d) !== 1) a = d - 1;
      const y = P(rng, [6, 8, 9, 10, 12]), f = R(rng, 0, 2), k = `${a}/${d}`;
      const hint = L(`Các tích đều có chung thừa số ${k}.`, `Every product has the same factor ${k}.`);
      if (f === 0) {
        const w = R(rng, 1, y - 2), x = R(rng, w + 1, y - 1), z = y + w - x, ws = sf(w, y);
        return Q(`${HEAD_TT}\nA = ${k} × ${x}/${y} + ${k} × ${z}/${y} ${M} ${k} × ${ws}`, NC.fr(a, d), lines([
          ws !== `${w}/${y}` ? `${ws} = ${w}/${y}` : '',
          `A = ${k} × (${x}/${y} + ${z}/${y} ${M} ${w}/${y})`,
          `A = ${k} × ${y}/${y} = ${k} × 1 = ${k}`]), { hint });
      }
      if (f === 1) {
        const xs = []; for (let x = 2; x < y; x++) if (gcd(x, y) === 1) xs.push(x);
        const x = P(rng, xs), z = y - x;
        return Q(`${HEAD_TT}\nA = ${k} : ${y}/${x} + ${k} × ${z}/${y}`, NC.fr(a, d), lines([
          L(`${k} : ${y}/${x} = ${k} × ${x}/${y} (nhân với phân số đảo ngược).`, `${k} : ${y}/${x} = ${k} × ${x}/${y} (multiply by the fraction turned upside down).`),
          `A = ${k} × ${x}/${y} + ${k} × ${z}/${y} = ${k} × (${x}/${y} + ${z}/${y})`,
          `A = ${k} × 1 = ${k}`]), { hint });
      }
      const x = R(rng, 1, y - 1), z = y - x;
      return Q(`${HEAD_TT}\nA = ${k} × ${x}/${y} + ${k} × ${z}/${y} + ${k}`, frS(2 * a, d), lines([
        `A = ${k} × ${x}/${y} + ${k} × ${z}/${y} + ${k} × 1`,
        `A = ${k} × (${x}/${y} + ${z}/${y} + 1) = ${k} × 2 = ${sf(2 * a, d)}`]), { hint: L(`Viết ${k} thành ${k} × 1.`, `Write ${k} as ${k} × 1.`) });
    } },

    // Convenient calculation with whole numbers: pairing (3145 − 145 …), a × b + c × a − a, pairs making 100 / 1000
    { id: 'g5-nc-tt-sotn', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c1-b2', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const T = U.sample(rng, [1, 2, 3, 4, 5, 6, 7, 8], 3).map(t => t * 1000);
        const r = []; while (r.length < 3) { const v = R(rng, 101, 899); if (v % 100 && !r.includes(v)) r.push(v); }
        const A = T.map((t, j) => t + r[j]), s = P(rng, [[1, 2, 0], [2, 0, 1]]), tot = T[0] + T[1] + T[2];
        return Q(`${HEAD_TT}\n${A.map((x, j) => `${F(x)} ${M} ${F(r[s[j]])}`).join(' + ')}`, num(tot), lines([
          `= (${F(A[0])} ${M} ${F(r[0])}) + (${F(A[1])} ${M} ${F(r[1])}) + (${F(A[2])} ${M} ${F(r[2])})`,
          `= ${F(T[0])} + ${F(T[1])} + ${F(T[2])}`, `= ${F(tot)}`]),
        { hint: L('Ghép mỗi số với số trừ có cùng ba chữ số cuối.', 'Pair each number with the number taken away that has the same last three digits.') });
      }
      if (f === 1) {
        const a = R(rng, 12, 999), big = R(rng, 0, 1) === 1, S = big ? 1001 : 101, b = R(rng, big ? 120 : 12, big ? 880 : 88), c = S - b, res = a * (S - 1);
        return Q(`${HEAD_TT}\n${a} × ${b} + ${c} × ${a} ${M} ${a}`, num(res), lines([
          `= ${a} × ${b} + ${a} × ${c} ${M} ${a} × 1`, `= ${a} × (${b} + ${c} ${M} 1)`, `= ${a} × ${F(S - 1)} = ${F(res)}`]),
        { hint: L(`Viết ${a} thành ${a} × 1.`, `Write ${a} as ${a} × 1.`) });
      }
      const [p, q] = U.sample(rng, [[25, 4], [125, 8], [50, 2], [20, 5], [250, 4]], 2);
      let kk = R(rng, 11, 99); if ([20, 25, 50].includes(kk)) kk++;
      const fac = U.shuffle(rng, [p[0], p[1], q[0], q[1]]); fac.splice(R(rng, 1, 3), 0, kk);
      const pp = p[0] * p[1], qq = q[0] * q[1], res = kk * pp * qq;
      return Q(`${HEAD_TT}\n${fac.join(' × ')}`, num(res), lines([
        `= (${p[0]} × ${p[1]}) × (${q[0]} × ${q[1]}) × ${kk}`, `= ${F(pp)} × ${F(qq)} × ${kk} = ${F(res)}`]),
      { hint: L('Ghép các thừa số có tích là 100 hoặc 1000.', 'Pair the factors whose product is 100 or 1000.') });
    } },

    // Rectangle field: width = m/n of the length, yield per area → kg or tonnes of rice (4 steps)
    { id: 'g5-nc-thoc', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c1-b5', gen: rng => {
      const [m, n] = P(rng, [[2, 3], [3, 4], [3, 5], [4, 5], [2, 5], [5, 6], [4, 7]]), s = 10 * R(rng, 2, 5);
      const len = n * s, wid = m * s, area = len * wid;
      const [uA, yk] = P(rng, [[100, P(rng, [50, 55, 60, 62, 65, 70])], [50, P(rng, [25, 28, 30, 32, 35])], [10, P(rng, [5, 6, 7])]]);
      const kg = area / uA * yk, t = dec(kg, 3), inTon = R(rng, 0, 1) === 1, byW = R(rng, 0, 1) === 1;
      const what = inTon ? L('tấn', 'tonnes') : L('ki-lô-gam', 'kilograms');
      const side = byW ? L(`có chiều rộng ${wid} m và chiều rộng bằng ${m}/${n} chiều dài`, `is ${wid} m wide, and its width is ${m}/${n} of its length`)
        : L(`có chiều dài ${len} m, chiều rộng bằng ${m}/${n} chiều dài`, `is ${len} m long, and its width is ${m}/${n} of its length`);
      return Q(L(`Một thửa ruộng hình chữ nhật ${side}. Trung bình cứ ${uA} m² thu hoạch được ${yk} kg thóc. Hỏi cả thửa ruộng thu hoạch được bao nhiêu ${what} thóc?`,
        `A rectangular rice field ${side}. On average, every ${uA} m² gives ${yk} kg of rice. How many ${what} of rice does the whole field give?`),
      num(inTon ? t : kg, inTon ? TON : 'kg'), lines([
        byW ? L(`Chiều dài thửa ruộng là: ${wid} : ${m}/${n} = ${len} (m).`, `Length of the field: ${wid} : ${m}/${n} = ${len} (m).`)
          : L(`Chiều rộng thửa ruộng là: ${len} × ${m}/${n} = ${wid} (m).`, `Width of the field: ${len} × ${m}/${n} = ${wid} (m).`),
        L(`Diện tích thửa ruộng là: ${len} × ${wid} = ${F(area)} (m²).`, `Area of the field: ${len} × ${wid} = ${F(area)} (m²).`),
        L(`Số thóc thu hoạch được là: ${F(area)} : ${uA} × ${yk} = ${F(kg)} (kg).`, `Rice harvested: ${F(area)} : ${uA} × ${yk} = ${F(kg)} (kg).`),
        inTon ? L(`${F(kg)} kg = ${F(t)} tấn.`, `${F(kg)} kg = ${F(t)} tonnes.`) : '']),
      { hint: L('Tìm chiều còn lại, rồi diện tích, rồi số thóc.', 'Find the other side first, then the area, then the rice.') });
    } },

    // a/b of the whole, then c/e of the rest: the fraction left, the second part, or the whole from what is left
    { id: 'g5-nc-con-lai', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c1-b5', gen: rng => {
      const b = R(rng, 2, 6); let a = R(rng, 1, b - 1); while (gcd(a, b) !== 1) a--;
      const e = R(rng, 2, 5); let c = R(rng, 1, e - 1); while (gcd(c, e) !== 1) c--;
      const ctx = R(rng, 0, 3), f = R(rng, 0, 2), who = NC.name(rng);
      const [step, lo, hi] = [[10, 200, 3000], [1, 40, 400], [1000, 20000, 300000], [10, 100, 2000]][ctx];
      const u0 = b * e * step, T = u0 * R(rng, Math.max(1, Math.ceil(lo / u0)), Math.max(1, Math.floor(hi / u0)));
      const Y = T * (b - a) * c / (b * e), X = T * (b - a) * (e - c) / (b * e);
      const secS = sf((b - a) * c, b * e), finS = sf((b - a) * (e - c), b * e);
      const C = [
        { intro: L(`Một đội công nhân sửa một quãng đường. Ngày thứ nhất đội sửa được ${a}/${b} quãng đường, ngày thứ hai sửa được ${c}/${e} quãng đường còn lại.`,
          `A team of workers is mending a road. On the first day they mend ${a}/${b} of the road. On the second day they mend ${c}/${e} of the part that is left.`),
          given: L(`Quãng đường dài ${F(T)} m.`, `The road is ${F(T)} m long.`), unit: 'm', whole: L('quãng đường', 'of the road'),
          q0: L('Hỏi sau hai ngày, phần quãng đường chưa sửa bằng bao nhiêu phần quãng đường?', 'After the two days, what fraction of the road is still not mended?'),
          q1: L('Hỏi ngày thứ hai đội sửa được bao nhiêu mét đường?', 'How many metres of road do they mend on the second day?'),
          q2: L(`Sau hai ngày, đội còn phải sửa ${F(X)} m đường nữa. Hỏi quãng đường dài bao nhiêu mét?`, `After the two days, ${F(X)} m of road still need mending. How long is the road?`),
          v1: L('Sau ngày thứ nhất còn lại', 'Left after the first day'), v2: L('Ngày thứ hai sửa được', 'Mended on the second day'), vt: L('Quãng đường dài', 'Length of the road') },
        { intro: L(`${who} đọc một quyển truyện. Ngày thứ nhất ${who} đọc được ${a}/${b} số trang, ngày thứ hai đọc được ${c}/${e} số trang còn lại.`,
          `${who} is reading a storybook. On the first day ${who} reads ${a}/${b} of the pages. On the second day ${who} reads ${c}/${e} of the pages that are left.`),
          given: L(`Quyển truyện dày ${T} trang.`, `The book has ${T} pages.`), unit: L('trang', 'pages'), whole: L('số trang', 'of the pages'),
          q0: L(`Hỏi ${who} còn bao nhiêu phần số trang chưa đọc?`, `What fraction of the pages has ${who} still not read?`),
          q1: L(`Hỏi ngày thứ hai ${who} đọc được bao nhiêu trang?`, `How many pages does ${who} read on the second day?`),
          q2: L(`Sau hai ngày, ${who} còn ${X} trang chưa đọc. Hỏi quyển truyện dày bao nhiêu trang?`, `After the two days, ${who} still has ${X} pages to read. How many pages does the book have?`),
          v1: L('Sau ngày thứ nhất còn lại', 'Left after the first day'), v2: L('Ngày thứ hai đọc được', 'Read on the second day'), vt: L('Số trang của quyển truyện', 'Pages in the book') },
        { intro: L(`${who} có một số tiền. ${who} mua sách hết ${a}/${b} số tiền, sau đó mua bút hết ${c}/${e} số tiền còn lại.`,
          `${who} has some money. ${who} spends ${a}/${b} of it on books, then ${c}/${e} of the money that is left on pens.`),
          given: L(`Lúc đầu ${who} có ${F(T)} đồng.`, `At first ${who} has ${F(T)} dong.`), unit: DONG, whole: L('số tiền', 'of the money'),
          q0: L(`Hỏi ${who} còn lại bao nhiêu phần số tiền?`, `What fraction of the money does ${who} have left?`),
          q1: L(`Hỏi ${who} mua bút hết bao nhiêu tiền?`, `How much does ${who} spend on pens?`),
          q2: L(`Sau khi mua, ${who} còn lại ${F(X)} đồng. Hỏi lúc đầu ${who} có bao nhiêu tiền?`, `After shopping, ${who} has ${F(X)} dong left. How much money did ${who} have at first?`),
          v1: L('Sau khi mua sách còn lại', 'Left after buying books'), v2: L('Mua bút hết', 'Spent on pens'), vt: L('Số tiền lúc đầu', 'Money at first') },
        { intro: L(`Một bể đang chứa đầy nước. Buổi sáng người ta dùng ${a}/${b} lượng nước trong bể, buổi chiều dùng ${c}/${e} lượng nước còn lại.`,
          `A tank is full of water. In the morning ${a}/${b} of the water is used. In the afternoon ${c}/${e} of the water that is left is used.`),
          given: L(`Bể chứa ${F(T)} l nước.`, `The tank holds ${F(T)} l of water.`), unit: 'l', whole: L('lượng nước', 'of the water'),
          q0: L('Hỏi trong bể còn lại bao nhiêu phần lượng nước ban đầu?', 'What fraction of the water is left in the tank?'),
          q1: L('Hỏi buổi chiều người ta dùng bao nhiêu lít nước?', 'How many litres of water are used in the afternoon?'),
          q2: L(`Trong bể còn lại ${F(X)} l nước. Hỏi lúc đầu bể chứa bao nhiêu lít nước?`, `${F(X)} l of water are left in the tank. How many litres did the tank hold at first?`),
          v1: L('Sau buổi sáng còn lại', 'Left after the morning'), v2: L('Buổi chiều dùng', 'Used in the afternoon'), vt: L('Lượng nước lúc đầu', 'Water at first') },
      ][ctx];
      const w = C.whole;
      const s1 = L(`${C.v1}: 1 ${M} ${a}/${b} = ${b - a}/${b} (${w}).`, `${C.v1}: 1 ${M} ${a}/${b} = ${b - a}/${b} ${w}.`);
      const s2 = L(`${C.v2}: ${b - a}/${b} × ${c}/${e} = ${secS} (${w}).`, `${C.v2}: ${b - a}/${b} × ${c}/${e} = ${secS} ${w}.`);
      const s3 = L(`Còn lại: ${b - a}/${b} ${M} ${secS} = ${finS} (${w}).`, `Left at the end: ${b - a}/${b} ${M} ${secS} = ${finS} ${w}.`);
      if (f === 0) return Q(`${C.intro} ${C.q0}`, frS((b - a) * (e - c), b * e), lines([s1, s2, s3]));
      if (f === 1) return Q(`${C.intro} ${C.given} ${C.q1}`, num(Y, C.unit), lines([s1, s2, `${C.v2}: ${F(T)} × ${secS} = ${F(Y)} (${C.unit}).`]));
      return Q(`${C.intro} ${C.q2}`, num(T, C.unit), lines([s1, s2, s3, `${C.vt}: ${F(X)} : ${finS} = ${F(T)} (${C.unit}).`]),
        { hint: L('Tìm xem phần còn lại bằng bao nhiêu phần của cả, rồi tính ngược lại.', 'Find what fraction of the whole is left, then work backwards.') });
    } },

    // Mixed numbers: + − of three, ×, :, and a rope cut twice; answer as a simplest fraction
    { id: 'g5-nc-hon-so', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c1-b7', gen: rng => {
      const f = R(rng, 0, 3), head = L('Tính (viết kết quả dưới dạng phân số tối giản):', 'Calculate (write the answer as a fraction in its simplest form):');
      if (f === 0) {
        const x = mixedNum(rng, 1, 4), y = mixedNum(rng, 1, 4);
        const z = pick(() => mixedNum(rng, 1, 3), v => v.N / v.d < x.N / x.d + y.N / y.d - 0.2, { w: 1, n: 1, d: 2, N: 3, s: '1 1/2', f: '3/2' });
        const S = sumMixed([{ m: x, sg: 1 }, { m: y, sg: 1 }, { m: z, sg: -1 }]);
        return Q(`${head}\n${x.s} + ${y.s} ${M} ${z.s}`, frS(S.tot, S.D), lines([`${x.s} = ${x.f}; ${y.s} = ${y.f}; ${z.s} = ${z.f}`, S.how]),
          { hint: L('Chuyển các hỗn số thành phân số rồi quy đồng mẫu số.', 'Change the mixed numbers into fractions, then give them a common denominator.') });
      }
      if (f === 1 || f === 2) {
        const x = mixedNum(rng, 1, 4), y = mixedNum(rng, 1, 3), mul = f === 1;
        const n0 = mul ? x.N * y.N : x.N * y.d, d0 = mul ? x.d * y.d : x.d * y.N;
        const how = mul ? `${x.f} × ${y.f} = ${n0}/${d0}` : `${x.f} : ${y.f} = ${x.f} × ${y.d}/${y.N} = ${n0}/${d0}`;
        return Q(`${head}\n${x.s} ${mul ? '×' : ':'} ${y.s}`, frS(n0, d0), lines([`${x.s} = ${x.f}; ${y.s} = ${y.f}`, how + (sf(n0, d0) !== `${n0}/${d0}` ? ` = ${sf(n0, d0)}` : '')]),
          { hint: L('Chuyển các hỗn số thành phân số trước.', 'Change the mixed numbers into fractions first.') });
      }
      const t = mixedNum(rng, 6, 9), p = mixedNum(rng, 1, 2), q = mixedNum(rng, 1, 2);
      const S = sumMixed([{ m: t, sg: 1 }, { m: p, sg: -1 }, { m: q, sg: -1 }]);
      return Q(L(`Một sợi dây dài ${t.s} m. Lần thứ nhất cắt đi ${p.s} m, lần thứ hai cắt đi ${q.s} m. Hỏi sợi dây còn lại dài bao nhiêu mét? (Viết kết quả dưới dạng phân số tối giản.)`,
        `A rope is ${t.s} m long. First ${p.s} m is cut off, then another ${q.s} m. How long is the rope that is left? (Write the answer as a fraction in its simplest form.)`),
      frS(S.tot, S.D), lines([`${t.s} = ${t.f}; ${p.s} = ${p.f}; ${q.s} = ${q.f}`,
        L(`Sợi dây còn lại dài: ${S.how} (m).`, `Length left: ${S.how} (m).`)]));
    } },

    // Digit cards: the largest / smallest decimal using four digits once, with k decimal places
    { id: 'g5-nc-tp-the-so', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c2-b10', gen: rng => {
      const ds = U.sample(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9], 4), big = R(rng, 0, 1) === 1, k = R(rng, 1, 3);
      const so = ds.slice().sort((p, q) => (big ? q - p : p - q)), v = dec(Number(so.join('')), k);
      const ip = 4 - k;
      return Q(L(`Cho bốn chữ số ${ds.join('; ')}. Hãy viết số thập phân ${big ? 'lớn nhất' : 'bé nhất'} có đủ bốn chữ số đó (mỗi chữ số viết một lần) và có ${k} chữ số ở phần thập phân.`,
        `Use the four digits ${ds.join('; ')}, each one once, to write the ${big ? 'largest' : 'smallest'} decimal with ${pl(k, 'decimal place')}.`),
      num(v), L(`Phần nguyên có ${ip} chữ số, phần thập phân có ${k} chữ số. Muốn được số ${big ? 'lớn' : 'bé'} nhất, ta viết các chữ số theo thứ tự từ ${big ? 'lớn đến bé' : 'bé đến lớn'}: ${F(v)}.`,
        `The whole-number part has ${pl(ip, 'digit')} and the decimal part has ${pl(k, 'digit')}. To get the ${big ? 'largest' : 'smallest'} number, write the digits from ${big ? 'largest to smallest' : 'smallest to largest'}: ${F(v)}.`),
      { hint: L('Chữ số ở hàng cao nhất quyết định số lớn hay bé.', 'The digit in the highest place matters most.') });
    } },

    // Rounding backwards: the largest / smallest decimal that rounds to a given number
    { id: 'g5-nc-tp-lam-tron', from: 'giua-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c2-b13', gen: rng => {
      const t = R(rng, 0, 2);
      if (t < 2) {
        const N = R(rng, 2, 99), lo = rd(N - 0.5), hi = rd(N + 0.5), big = t === 0, v = big ? rd(N + 0.49) : lo;
        return Q(L(`Tìm số thập phân ${big ? 'lớn nhất' : 'bé nhất'} có hai chữ số ở phần thập phân mà khi làm tròn đến số tự nhiên gần nhất thì được ${N}.`,
          `Find the ${big ? 'largest' : 'smallest'} decimal with two decimal places that rounds to ${N} when rounded to the nearest whole number.`),
        num(v), lines([
          L(`Các số làm tròn được ${N} là các số từ ${F(lo)} đến bé hơn ${F(hi)}.`, `The numbers that round to ${N} go from ${F(lo)} up to just below ${F(hi)}.`),
          big ? L(`Số lớn nhất có hai chữ số ở phần thập phân như thế là ${F(v)}.`, `The largest of them with two decimal places is ${F(v)}.`)
            : L(`Số bé nhất có hai chữ số ở phần thập phân như thế là ${N - 1},50 = ${F(v)}.`, `The smallest of them with two decimal places is ${N - 1},50 = ${F(v)}.`)]),
        { hint: L('Chữ số hàng phần mười từ 5 trở lên thì làm tròn lên.', 'If the tenths digit is 5 or more, round up.') });
      }
      const T = dec(mant(rng, 11, 999), 1), v = rd(T + 0.049);
      return Q(L(`Tìm số thập phân lớn nhất có ba chữ số ở phần thập phân mà khi làm tròn đến hàng phần mười thì được ${F(T)}.`,
        `Find the largest decimal with three decimal places that rounds to ${F(T)} when rounded to the nearest tenth.`),
      num(v), lines([
        L(`Các số làm tròn đến hàng phần mười được ${F(T)} là các số từ ${F(rd(T - 0.05))} đến bé hơn ${F(rd(T + 0.05))}.`, `The numbers that round to ${F(T)} go from ${F(rd(T - 0.05))} up to just below ${F(rd(T + 0.05))}.`),
        L(`Số lớn nhất có ba chữ số ở phần thập phân như thế là ${F(v)}.`, `The largest of them with three decimal places is ${F(v)}.`)]));
    } },

    // Đặt tính (whole numbers, the only calculations learnt by giữa kì I): borrowing across zeros
    { id: 'g5-nc-dt-tru', from: 'giua-hk1', kinds: ['dt'], lesson: 'g5-c1-b2', gen: rng => {
      const dg = [R(rng, 3, 9)]; for (let j = 1; j < 6; j++) dg.push(R(rng, 1, 9));
      U.sample(rng, [1, 2, 3, 4], R(rng, 2, 3)).forEach(j => { dg[j] = 0; });
      const a = Number(dg.join(''));
      let b = R(rng, 10000, a - 1000); if (b % 10 === 0) b += 7;
      return NC.dt(a, b, M, a - b);
    } },
    // a factor with a 0 inside × a two-digit number with big digits (many carries)
    { id: 'g5-nc-dt-nhan', from: 'giua-hk1', kinds: ['dt'], lesson: 'g5-c1-b2', gen: rng => {
      const len = R(rng, 4, 5), dg = [R(rng, 1, 9)]; for (let j = 1; j < len; j++) dg.push(R(rng, 1, 9));
      dg[R(rng, 1, len - 2)] = 0;
      const a = Number(dg.join('')), b = R(rng, 6, 9) * 10 + R(rng, 6, 9);
      return NC.dt(a, b, '×', a * b);
    } },
    // division by a two-digit number with a 0 in the quotient
    { id: 'g5-nc-dt-chia', from: 'giua-hk1', kinds: ['dt'], lesson: 'g5-c1-b2', gen: rng => {
      let b = R(rng, 12, 98); if (b % 10 === 0) b += 3;
      const f = R(rng, 0, 2), x = R(rng, 1, 9), y = R(rng, 1, 9), z = R(rng, 1, 9);
      const q = [x * 100 + y, x * 1000 + y * 10 + z, x * 1000 + y * 100 + z][f];
      return NC.dt(q * b, b, ':', q);
    } },
    // addition with a carry in every column
    { id: 'g5-nc-dt-cong', from: 'giua-hk1', kinds: ['dt'], lesson: 'g5-c1-b2', gen: rng => {
      const len = R(rng, 5, 6); let a = 0, b = 0, p = 1, c = 0;
      for (let j = 0; j < len; j++) {
        const x = R(rng, 1, 9), y = R(rng, Math.max(1, 10 - x - c), 9);
        a += x * p; b += y * p; c = x + y + c >= 10 ? 1 : 0; p *= 10;
      }
      return NC.dt(a, b, '+', a + b);
    } },

    /* ================= CUỐI HỌC KÌ I (+ Bài 15–16, 19–23, 25–27) ================= */

    // Đặt tính with decimals: different numbers of decimal places
    { id: 'g5-nc-dt-cong-tp', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g5-c4-b19', gen: rng => {
      const f = R(rng, 0, 2);
      let a, b;
      if (f === 0) { a = dec(mant(rng, 101, 9999), 1); b = dec(mant(rng, 1001, 99999), 3); }
      else if (f === 1) { a = dec(mant(rng, 1001, 99999), 2); b = dec(mant(rng, 1001, 9999), 3); }
      else { a = R(rng, 12, 999); b = dec(mant(rng, 101, 9999), R(rng, 2, 3)); }
      if (R(rng, 0, 1)) [a, b] = [b, a];
      return NC.dt(a, b, '+', rd(a + b));
    } },
    // 50,81 − 19,256; 72 − 18,46 (zeros written in to subtract)
    { id: 'g5-nc-dt-tru-tp', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g5-c4-b20', gen: rng => {
      if (R(rng, 0, 1)) {
        const ma = mant(rng, 1001, 99999), a = dec(ma, 2), b = dec(mant(rng, 1001, ma * 10 - 11), 3);
        return NC.dt(a, b, M, rd(a - b));
      }
      const a = P(rng, [R(rng, 20, 99), R(rng, 1, 9) * 100 + R(rng, 0, 9), R(rng, 1, 9) * 100]), s = R(rng, 2, 3), p = Math.pow(10, s);
      const b = dec(mant(rng, p + 1, a * p - 11), s);
      return NC.dt(a, b, M, rd(a - b));
    } },
    // a decimal × a decimal (3 decimal places in the product)
    { id: 'g5-nc-dt-nhan-tp', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g5-c4-b21', gen: rng => {
      const f = R(rng, 0, 1);
      const a = dec(mant(rng, 101, 9999), f ? 2 : 1), b = f ? dec(mant(rng, 12, 99), 1) : dec(mant(rng, 12, 999), 2);
      return NC.dt(a, b, '×', rd(a * b));
    } },
    // a decimal quotient: 72,58 : 19; 45 : 8; 18,72 : 2,4 (always exact within 3 places)
    { id: 'g5-nc-dt-chia-tp', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g5-c4-b22', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) { const q = dec(mant(rng, 101, 9999), 2), b = R(rng, 12, 49); return NC.dt(rd(q * b), b, ':', q); }
      if (f === 1) {
        const b = P(rng, [8, 16, 25, 32, 40]);
        const a = pick(() => R(rng, b + 1, 999), x => x % b !== 0 && (x * 1000) % b === 0, b === 25 ? 30 : b * 3 / 2);
        return NC.dt(a, b, ':', rd(a / b));
      }
      const b = dec(mant(rng, 12, 99), 1), q = dec(mant(rng, 11, 999), R(rng, 1, 2));
      return NC.dt(rd(q * b), b, ':', q);
    } },

    // Composite areas: trapezium garden − round pond, yard − flower bed, square − circle, sports ground
    { id: 'g5-nc-vuon-ao', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c5-b27', gen: rng => {
      const f = R(rng, 0, 3), RS = [1.5, 2, 2.5, 3, 3.5];   // radii whose circle areas end within 3 decimal places
      if (f === 0) {
        const [A, B, H, r] = pick(() => { const A = R(rng, 80, 159); return [A, R(rng, 40, A - 10), R(rng, 50, 120), P(rng, RS)]; },
          v => v[3] * v[3] * 3.14 < (v[0] + v[1]) * v[2] / 400, [95, 63, 82, 2]);
        const a = dec(A, 1), b = dec(B, 1), h = dec(H, 1), S1 = rd((A + B) * H / 200), S2 = rd(r * r * 3.14), rem = rd(S1 - S2), byD = R(rng, 0, 1) === 1;
        return Q(L(`Một mảnh vườn hình thang có đáy lớn ${F(a)} m, đáy bé ${F(b)} m, chiều cao ${F(h)} m. Người ta đào một cái ao hình tròn có ${byD ? `đường kính ${F(2 * r)} m` : `bán kính ${F(r)} m`} trong vườn. Tính diện tích phần vườn còn lại.`,
          `A garden is a trapezium with a longer base of ${F(a)} m, a shorter base of ${F(b)} m and a height of ${F(h)} m. A round pond with a ${byD ? `diameter of ${F(2 * r)} m` : `radius of ${F(r)} m`} is dug in the garden. Find the area of the rest of the garden.`),
        num(rem, 'm²'), lines([
          L(`Diện tích mảnh vườn là: (${F(a)} + ${F(b)}) × ${F(h)} : 2 = ${F(S1)} (m²).`, `Area of the garden: (${F(a)} + ${F(b)}) × ${F(h)} : 2 = ${F(S1)} (m²).`),
          byD ? L(`Bán kính cái ao là: ${F(2 * r)} : 2 = ${F(r)} (m).`, `Radius of the pond: ${F(2 * r)} : 2 = ${F(r)} (m).`) : '',
          L(`Diện tích cái ao là: ${F(r)} × ${F(r)} × 3,14 = ${F(S2)} (m²).`, `Area of the pond: ${F(r)} × ${F(r)} × 3,14 = ${F(S2)} (m²).`),
          L(`Diện tích phần vườn còn lại là: ${F(S1)} ${M} ${F(S2)} = ${F(rem)} (m²).`, `Area of the rest of the garden: ${F(S1)} ${M} ${F(S2)} = ${F(rem)} (m²).`)]));
      }
      if (f === 1) {
        const Lm = dec(mant(rng, 150, 400), 1), W = dec(mant(rng, 80, Math.round(Lm * 10) - 10), 1), r = P(rng, RS);
        const S1 = rd(Lm * W), S2 = rd(r * r * 3.14), rem = rd(S1 - S2);
        return Q(L(`Một sân trường hình chữ nhật có chiều dài ${F(Lm)} m, chiều rộng ${F(W)} m. Giữa sân có một bồn hoa hình tròn bán kính ${F(r)} m. Tính diện tích phần sân không có bồn hoa.`,
          `A rectangular school yard is ${F(Lm)} m long and ${F(W)} m wide. In the middle there is a round flower bed with a radius of ${F(r)} m. Find the area of the yard without the flower bed.`),
        num(rem, 'm²'), lines([
          L(`Diện tích sân trường là: ${F(Lm)} × ${F(W)} = ${F(S1)} (m²).`, `Area of the yard: ${F(Lm)} × ${F(W)} = ${F(S1)} (m²).`),
          L(`Diện tích bồn hoa là: ${F(r)} × ${F(r)} × 3,14 = ${F(S2)} (m²).`, `Area of the flower bed: ${F(r)} × ${F(r)} × 3,14 = ${F(S2)} (m²).`),
          L(`Diện tích phần sân không có bồn hoa là: ${F(S1)} ${M} ${F(S2)} = ${F(rem)} (m²).`, `Area without the flower bed: ${F(S1)} ${M} ${F(S2)} = ${F(rem)} (m²).`)]));
      }
      if (f === 2) {
        const a = 2 * R(rng, 2, 10), r = a / 2, S1 = a * a, S2 = rd(r * r * 3.14), rem = rd(S1 - S2);
        return Q(L(`Một hình vuông có cạnh ${a} cm. Bên trong hình vuông vẽ một hình tròn có đường kính bằng cạnh hình vuông. Tính diện tích phần hình vuông nằm ngoài hình tròn.`,
          `A square has sides of ${a} cm. Inside it, a circle is drawn whose diameter is equal to the side of the square. Find the area of the part of the square outside the circle.`),
        num(rem, 'cm²'), lines([
          L(`Diện tích hình vuông là: ${a} × ${a} = ${S1} (cm²).`, `Area of the square: ${a} × ${a} = ${S1} (cm²).`),
          L(`Bán kính hình tròn là: ${a} : 2 = ${r} (cm).`, `Radius of the circle: ${a} : 2 = ${r} (cm).`),
          L(`Diện tích hình tròn là: ${r} × ${r} × 3,14 = ${F(S2)} (cm²).`, `Area of the circle: ${r} × ${r} × 3,14 = ${F(S2)} (cm²).`),
          L(`Diện tích phần nằm ngoài hình tròn là: ${S1} ${M} ${F(S2)} = ${F(rem)} (cm²).`, `Area outside the circle: ${S1} ${M} ${F(S2)} = ${F(rem)} (cm²).`)]));
      }
      const Lr = R(rng, 40, 100), d = 2 * R(rng, 10, 30), r = d / 2, area = R(rng, 0, 1) === 1;
      const C = rd(d * 3.14), Pm = rd(Lr * 2 + C), Sc = rd(r * r * 3.14), Sm = rd(Lr * d + Sc);
      return Q(L(`Một sân vận động gồm một hình chữ nhật dài ${Lr} m và hai nửa hình tròn ở hai đầu. Đường kính của mỗi nửa hình tròn bằng chiều rộng của hình chữ nhật và bằng ${d} m. Tính ${area ? 'diện tích' : 'chu vi'} sân vận động.`,
        `A sports ground is made of a rectangle ${Lr} m long with a half circle at each end. The diameter of each half circle is equal to the width of the rectangle, ${d} m. Find the ${area ? 'area' : 'perimeter'} of the sports ground.`),
      num(area ? Sm : Pm, area ? 'm²' : 'm'), area ? lines([
        L(`Hai nửa hình tròn ghép lại được một hình tròn bán kính ${d} : 2 = ${r} (m).`, `The two half circles make one circle with a radius of ${d} : 2 = ${r} (m).`),
        L(`Diện tích hình tròn đó là: ${r} × ${r} × 3,14 = ${F(Sc)} (m²).`, `Area of that circle: ${r} × ${r} × 3,14 = ${F(Sc)} (m²).`),
        L(`Diện tích hình chữ nhật là: ${Lr} × ${d} = ${F(Lr * d)} (m²).`, `Area of the rectangle: ${Lr} × ${d} = ${F(Lr * d)} (m²).`),
        L(`Diện tích sân vận động là: ${F(Lr * d)} + ${F(Sc)} = ${F(Sm)} (m²).`, `Area of the sports ground: ${F(Lr * d)} + ${F(Sc)} = ${F(Sm)} (m²).`)]) : lines([
        L(`Hai nửa hình tròn ghép lại được một hình tròn đường kính ${d} m, có chu vi là: ${d} × 3,14 = ${F(C)} (m).`, `The two half circles make one circle with a diameter of ${d} m. Its circumference is ${d} × 3,14 = ${F(C)} (m).`),
        L(`Chu vi sân vận động là: ${Lr} × 2 + ${F(C)} = ${F(Pm)} (m).`, `Perimeter of the sports ground: ${Lr} × 2 + ${F(C)} = ${F(Pm)} (m).`)]),
      { hint: L('Chu vi sân gồm hai chiều dài và hai nửa đường tròn.', 'The perimeter is two lengths and two half circles.') });
    } },

    // Find x with decimals in two steps: 9,5 × x = 399; x : a = b + c; x × a + x × b = c; (x + a) × b = c; x − a = b × c
    { id: 'g5-nc-tim-x', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c4-b22', gen: rng => {
      const f = R(rng, 0, 4);
      if (f === 0) {
        const a = dec(mant(rng, 12, 99), 1), x = R(rng, 0, 1) ? R(rng, 12, 99) : dec(mant(rng, 101, 999), 1), c = rd(a * x), left = R(rng, 0, 1) === 1;
        return Q(`${HEAD_X}\n${left ? `${F(a)} × x` : `x × ${F(a)}`} = ${F(c)}`, num(x), lines([`x = ${F(c)} : ${F(a)}`, `x = ${F(x)}`]),
          { hint: L('Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số đã biết.', 'To find a missing factor, divide the product by the known factor.') });
      }
      if (f === 1) {
        const a = dec(mant(rng, 12, 49), 1), b = dec(mant(rng, 11, 199), 1), c = dec(mant(rng, 11, 99), 1), s = rd(b + c), x = rd(s * a);
        return Q(`${HEAD_X}\nx : ${F(a)} = ${F(b)} + ${F(c)}`, num(x), lines([`x : ${F(a)} = ${F(s)}`, `x = ${F(s)} × ${F(a)}`, `x = ${F(x)}`]));
      }
      if (f === 2) {
        const S = P(rng, [2, 4, 5, 10]), a = dec(mant(rng, 1, S * 10 - 1), 1), b = rd(S - a), x = dec(mant(rng, 12, 999), R(rng, 1, 2)), c = rd(x * S);
        return Q(`${HEAD_X}\nx × ${F(a)} + x × ${F(b)} = ${F(c)}`, num(x), lines([`x × (${F(a)} + ${F(b)}) = ${F(c)}`, `x × ${S} = ${F(c)}`, `x = ${F(c)} : ${S}`, `x = ${F(x)}`]),
          { hint: L('Hai tích có chung thừa số x.', 'Both products have the same factor x.') });
      }
      if (f === 3) {
        const b = P(rng, [2, 4, 5, 8, 0.5, 2.5, 1.5]), s = dec(mant(rng, 21, 999), 1), a = dec(mant(rng, 1, Math.round(s * 10) - 1), 1), x = rd(s - a), c = rd(s * b);
        return Q(`${HEAD_X}\n(x + ${F(a)}) × ${F(b)} = ${F(c)}`, num(x), lines([`x + ${F(a)} = ${F(c)} : ${F(b)}`, `x + ${F(a)} = ${F(s)}`, `x = ${F(s)} ${M} ${F(a)}`, `x = ${F(x)}`]));
      }
      const a = dec(mant(rng, 101, 9999), 2), b = dec(mant(rng, 11, 99), 1), c = R(rng, 2, 9), p = rd(b * c), x = rd(a + p);
      return Q(`${HEAD_X}\nx ${M} ${F(a)} = ${F(b)} × ${c}`, num(x), lines([`x ${M} ${F(a)} = ${F(p)}`, `x = ${F(p)} + ${F(a)}`, `x = ${F(x)}`]));
    } },

    // Convenient calculation with decimals: 2,65 × 63,4 + 2,65 × 37,6 − 2,65; 420 : 0,5 + 420 × 94 + 420 : 0,25; pairs
    { id: 'g5-nc-tt-thapphan', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c4-b21', gen: rng => {
      const f = R(rng, 0, 4);
      if (f === 0) {
        const a = dec(mant(rng, 101, 999), 2), b = dec(mant(rng, 101, 899), 1), c = rd(101 - b), res = rd(a * 100);
        return Q(`${HEAD_TT}\n${F(a)} × ${F(b)} + ${F(a)} × ${F(c)} ${M} ${F(a)}`, num(res), lines([
          `= ${F(a)} × ${F(b)} + ${F(a)} × ${F(c)} ${M} ${F(a)} × 1`, `= ${F(a)} × (${F(b)} + ${F(c)} ${M} 1)`, `= ${F(a)} × 100 = ${F(res)}`]),
        { hint: L(`Viết ${F(a)} thành ${F(a)} × 1.`, `Write ${F(a)} as ${F(a)} × 1.`) });
      }
      if (f === 1) {
        const S = P(rng, [10, 100]), a = dec(mant(rng, 11, 999), R(rng, 1, 2)), b = dec(mant(rng, 11, S * 10 - 11), 1), c = rd(S - b), res = rd(a * S);
        return Q(`${HEAD_TT}\n${F(a)} × ${F(b)} + ${F(c)} × ${F(a)}`, num(res), lines([`= ${F(a)} × (${F(b)} + ${F(c)})`, `= ${F(a)} × ${S} = ${F(res)}`]));
      }
      if (f === 2) {
        const N = R(rng, 12, 999), ds = U.sample(rng, [[0.5, 2], [0.25, 4], [0.2, 5], [0.1, 10]], 2), k = 100 - ds[0][1] - ds[1][1];
        const terms = U.shuffle(rng, [`${N} : ${F(ds[0][0])}`, `${N} × ${k}`, `${N} : ${F(ds[1][0])}`]);
        return Q(`${HEAD_TT}\n${terms.join(' + ')}`, num(N * 100), lines([
          `${N} : ${F(ds[0][0])} = ${N} × ${ds[0][1]}; ${N} : ${F(ds[1][0])} = ${N} × ${ds[1][1]}`,
          `= ${N} × (${ds[0][1]} + ${k} + ${ds[1][1]}) = ${N} × 100 = ${F(N * 100)}`]),
        { hint: L('Chia cho 0,5 tức là nhân với 2; chia cho 0,25 tức là nhân với 4.', 'Dividing by 0,5 is the same as multiplying by 2; dividing by 0,25 is the same as multiplying by 4.') });
      }
      if (f === 3) {
        const W1 = R(rng, 3, 15), W2 = R(rng, 3, 15), s1 = R(rng, 1, 2), s2 = R(rng, 1, 2);
        const p1 = dec(mant(rng, 1, W1 * Math.pow(10, s1) - 1), s1), q1 = rd(W1 - p1), p2 = dec(mant(rng, 1, W2 * Math.pow(10, s2) - 1), s2), q2 = rd(W2 - p2);
        const order = P(rng, [[p1, p2, q1, q2], [p1, p2, q2, q1], [p1, q2, p2, q1]]);
        return Q(`${HEAD_TT}\n${order.map(F).join(' + ')}`, num(W1 + W2), lines([`= (${F(p1)} + ${F(q1)}) + (${F(p2)} + ${F(q2)})`, `= ${W1} + ${W2} = ${W1 + W2}`]),
          { hint: L('Ghép hai số có tổng là số tự nhiên.', 'Pair numbers whose sum is a whole number.') });
      }
      const [p, q] = P(rng, [[0.25, 4], [0.25, 40], [1.25, 8], [2.5, 4], [0.5, 20], [0.125, 8], [0.4, 25]]), x = dec(mant(rng, 11, 999), 1), pq = rd(p * q), res = rd(x * pq);
      const first = R(rng, 0, 1) === 1;
      return Q(`${HEAD_TT}\n${first ? `${F(p)} × ${F(x)} × ${F(q)}` : `${F(q)} × ${F(x)} × ${F(p)}`}`, num(res), lines([`= (${F(p)} × ${F(q)}) × ${F(x)}`, `= ${F(pq)} × ${F(x)} = ${F(res)}`]));
    } },

    // Hectares: a plot in km and m → ha, then yield per ha; a trapezium field → ha → tonnes of rice
    { id: 'g5-nc-hecta', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c3-b15', gen: rng => {
      const f = R(rng, 0, 2);
      if (f < 2) {
        const yld = P(rng, [5, 5.5, 6, 6.5, 7]);
        const [k, m, n] = pick(() => { const [m, n] = P(rng, [[1, 2], [2, 3], [3, 4], [3, 5], [2, 5], [4, 5]]); return [R(rng, 3, f ? 8 : 15), m, n]; },
          v => (100 * v[0]) % v[2] === 0 && ok3(100 * v[0] * (100 * v[0] * v[1] / v[2]) / 10000) && ok3(100 * v[0] * (100 * v[0] * v[1] / v[2]) / 10000 * yld), [6, 2, 3]);
        const Lm = 100 * k, Wm = Lm * m / n, A = Lm * Wm, ha = rd(A / 10000), t = rd(ha * yld), Lk = dec(k, 1);
        const base = L(`Một khu đất hình chữ nhật có chiều dài ${F(Lk)} km, chiều rộng bằng ${m}/${n} chiều dài.`, `A rectangular plot of land is ${F(Lk)} km long. Its width is ${m}/${n} of its length.`);
        const steps = [
          L(`Đổi: ${F(Lk)} km = ${Lm} m.`, `${F(Lk)} km = ${Lm} m.`),
          L(`Chiều rộng khu đất là: ${Lm} × ${m}/${n} = ${F(Wm)} (m).`, `Width of the plot: ${Lm} × ${m}/${n} = ${F(Wm)} (m).`),
          L(`Diện tích khu đất là: ${Lm} × ${F(Wm)} = ${F(A)} (m²) = ${F(ha)} ha.`, `Area of the plot: ${Lm} × ${F(Wm)} = ${F(A)} (m²) = ${F(ha)} ha.`)];
        if (f === 0) return Q(L(`${base} Hỏi diện tích khu đất bằng bao nhiêu héc-ta?`, `${base} What is its area in hectares?`), num(ha, 'ha'), lines(steps),
          { hint: '1 ha = 10 000 m²' });
        return Q(L(`${base} Người ta trồng lúa trên khu đất đó, trung bình mỗi héc-ta thu hoạch được ${F(yld)} tấn thóc. Hỏi cả khu đất thu hoạch được bao nhiêu tấn thóc?`,
          `${base} Rice is grown on it, and on average each hectare gives ${F(yld)} tonnes of rice. How many tonnes of rice does the whole plot give?`),
        num(t, TON), lines(steps.concat([L(`Số thóc thu hoạch được là: ${F(ha)} × ${F(yld)} = ${F(t)} (tấn).`, `Rice harvested: ${F(ha)} × ${F(yld)} = ${F(t)} (tonnes).`)])));
      }
      const yld = P(rng, [5, 5.5, 6, 6.5, 7, 7.5]);
      const [a, b, h] = pick(() => { const a = R(rng, 8, 20) * 10; return [a, R(rng, 4, a / 10 - 1) * 10, R(rng, 4, 12) * 10]; },
        v => ok3((v[0] + v[1]) * v[2] / 2 / 10000 * yld), [200, 100, 80]);
      const S = (a + b) * h / 2, ha = rd(S / 10000), t = rd(ha * yld);
      return Q(L(`Một thửa ruộng hình thang có đáy lớn ${a} m, đáy bé ${b} m, chiều cao ${h} m. Trung bình mỗi héc-ta thu hoạch được ${F(yld)} tấn thóc. Hỏi thửa ruộng đó thu hoạch được bao nhiêu tấn thóc?`,
        `A rice field is a trapezium with a longer base of ${a} m, a shorter base of ${b} m and a height of ${h} m. On average, each hectare gives ${F(yld)} tonnes of rice. How many tonnes of rice does the field give?`),
      num(t, TON), lines([
        L(`Diện tích thửa ruộng là: (${a} + ${b}) × ${h} : 2 = ${F(S)} (m²).`, `Area of the field: (${a} + ${b}) × ${h} : 2 = ${F(S)} (m²).`),
        L(`Đổi: ${F(S)} m² = ${F(ha)} ha.`, `${F(S)} m² = ${F(ha)} ha.`),
        L(`Số thóc thu hoạch được là: ${F(ha)} × ${F(yld)} = ${F(t)} (tấn).`, `Rice harvested: ${F(ha)} × ${F(yld)} = ${F(t)} (tonnes).`)]),
      { hint: '1 ha = 10 000 m²' });
    } },

    // Wheels and wire circles: distance from turns, diameter from distance, turns for a distance, area of a bent wire
    { id: 'g5-nc-banh-xe', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c5-b27', gen: rng => {
      const f = R(rng, 0, 3), d = P(rng, [0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 1.2]), C = rd(d * 3.14);
      const Cl = L(`Chu vi bánh xe là: ${F(d)} × 3,14 = ${F(C)} (m).`, `Circumference of the wheel: ${F(d)} × 3,14 = ${F(C)} (m).`);
      if (f === 0) {
        const n = R(rng, 20, 500), s = rd(C * n);
        return Q(L(`Một bánh xe có đường kính ${F(d)} m. Hỏi khi bánh xe lăn trên mặt đất được ${n} vòng thì xe đi được bao nhiêu mét?`,
          `A wheel has a diameter of ${F(d)} m. How many metres does it travel along the ground when it turns ${n} times?`),
        num(s, 'm'), lines([Cl, L(`Quãng đường xe đi được là: ${F(C)} × ${n} = ${F(s)} (m).`, `Distance: ${F(C)} × ${n} = ${F(s)} (m).`)]),
        { hint: L('Mỗi vòng, bánh xe đi được một quãng đường bằng chu vi của nó.', 'In one turn, the wheel travels a distance equal to its circumference.') });
      }
      if (f === 1) {
        const n = R(rng, 20, 500), s = rd(C * n);
        return Q(L(`Một bánh xe lăn trên mặt đất ${n} vòng thì được quãng đường ${F(s)} m. Tính đường kính của bánh xe.`,
          `A wheel turns ${n} times and travels ${F(s)} m along the ground. Find the diameter of the wheel.`),
        num(d, 'm'), lines([
          L(`Chu vi bánh xe là: ${F(s)} : ${n} = ${F(C)} (m).`, `Circumference of the wheel: ${F(s)} : ${n} = ${F(C)} (m).`),
          L(`Đường kính bánh xe là: ${F(C)} : 3,14 = ${F(d)} (m).`, `Diameter of the wheel: ${F(C)} : 3,14 = ${F(d)} (m).`)]));
      }
      if (f === 2) {
        const j = R(rng, 1, 5), n = 1000 * j, sm = rd(C * n), km = rd(sm / 1000);
        return Q(L(`Một bánh xe có đường kính ${F(d)} m. Hỏi để đi hết quãng đường ${F(km)} km thì bánh xe phải lăn bao nhiêu vòng?`,
          `A wheel has a diameter of ${F(d)} m. How many times must it turn to travel ${F(km)} km?`),
        num(n), lines([Cl, L(`Đổi: ${F(km)} km = ${F(sm)} m.`, `${F(km)} km = ${F(sm)} m.`),
          L(`Số vòng bánh xe phải lăn là: ${F(sm)} : ${F(C)} = ${F(n)} (vòng).`, `Number of turns: ${F(sm)} : ${F(C)} = ${F(n)}.`)]));
      }
      const r = R(rng, 2, 15), Cw = rd(r * 2 * 3.14), S = rd(r * r * 3.14);
      return Q(L(`Uốn một sợi dây thép dài ${F(Cw)} cm thành một hình tròn (vừa hết sợi dây). Tính diện tích hình tròn đó.`,
        `A piece of wire ${F(Cw)} cm long is bent into a circle, using all of the wire. Find the area of the circle.`),
      num(S, 'cm²'), lines([
        L(`Chu vi hình tròn bằng độ dài sợi dây: ${F(Cw)} cm.`, `The circumference of the circle is the length of the wire: ${F(Cw)} cm.`),
        L(`Đường kính hình tròn là: ${F(Cw)} : 3,14 = ${2 * r} (cm); bán kính là: ${2 * r} : 2 = ${r} (cm).`, `Diameter: ${F(Cw)} : 3,14 = ${2 * r} (cm); radius: ${2 * r} : 2 = ${r} (cm).`),
        L(`Diện tích hình tròn là: ${r} × ${r} × 3,14 = ${F(S)} (cm²).`, `Area of the circle: ${r} × ${r} × 3,14 = ${F(S)} (cm²).`)]));
    } },

    // Triangles: height from an equal-area square, mixed units, height = m/n of the base, a base made longer
    { id: 'g5-nc-tam-giac', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c5-b25', gen: rng => {
      const f = R(rng, 0, 3);
      if (f === 0) {
        const s = R(rng, 4, 12), A = s * s, divs = [];
        for (let b = 4; b <= 3 * s; b++) if ((2 * A) % b === 0) divs.push(b);
        const B = P(rng, divs), h = 2 * A / B;
        return Q(L(`Một hình tam giác có diện tích bằng diện tích hình vuông cạnh ${s} cm. Biết độ dài đáy của hình tam giác là ${B} cm. Tính chiều cao của hình tam giác.`,
          `A triangle has the same area as a square with sides of ${s} cm. The base of the triangle is ${B} cm. Find the height of the triangle.`),
        num(h, 'cm'), lines([
          L(`Diện tích hình vuông là: ${s} × ${s} = ${A} (cm²), đó cũng là diện tích hình tam giác.`, `Area of the square: ${s} × ${s} = ${A} (cm²). This is also the area of the triangle.`),
          L(`Chiều cao của hình tam giác là: ${A} × 2 : ${B} = ${h} (cm).`, `Height of the triangle: ${A} × 2 : ${B} = ${h} (cm).`)]),
        { hint: L('Chiều cao = diện tích × 2 : đáy.', 'Height = area × 2 : base.') });
      }
      if (f === 1) {
        const A = mant(rng, 12, 60), B = R(rng, 8, 50), S = rd(A * B / 2);
        return Q(L(`Một hình tam giác vuông có hai cạnh góc vuông dài ${F(dec(A, 1))} dm và ${B} cm. Tính diện tích hình tam giác đó theo xăng-ti-mét vuông.`,
          `A right-angled triangle has two sides next to the right angle of ${F(dec(A, 1))} dm and ${B} cm. Find its area in square centimetres.`),
        num(S, 'cm²'), lines([L(`Đổi: ${F(dec(A, 1))} dm = ${A} cm.`, `${F(dec(A, 1))} dm = ${A} cm.`),
          L(`Diện tích hình tam giác vuông là: ${A} × ${B} : 2 = ${F(S)} (cm²).`, `Area of the right-angled triangle: ${A} × ${B} : 2 = ${F(S)} (cm²).`)]),
        { hint: L('Trong tam giác vuông, lấy một cạnh góc vuông làm đáy thì cạnh góc vuông kia là chiều cao.', 'In a right-angled triangle, if one side next to the right angle is the base, the other one is the height.') });
      }
      if (f === 2) {
        const [m, n] = P(rng, [[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [2, 5]]), t = R(rng, 3, 9), B = n * t, H = m * t, S = rd(B * H / 2);
        return Q(L(`Một hình tam giác có độ dài đáy ${F(dec(B, 1))} dm, chiều cao bằng ${m}/${n} độ dài đáy. Tính diện tích hình tam giác theo xăng-ti-mét vuông.`,
          `A triangle has a base of ${F(dec(B, 1))} dm. Its height is ${m}/${n} of the base. Find its area in square centimetres.`),
        num(S, 'cm²'), lines([L(`Đổi: ${F(dec(B, 1))} dm = ${B} cm.`, `${F(dec(B, 1))} dm = ${B} cm.`),
          L(`Chiều cao của hình tam giác là: ${B} × ${m}/${n} = ${H} (cm).`, `Height of the triangle: ${B} × ${m}/${n} = ${H} (cm).`),
          L(`Diện tích hình tam giác là: ${B} × ${H} : 2 = ${F(S)} (cm²).`, `Area of the triangle: ${B} × ${H} : 2 = ${F(S)} (cm²).`)]));
      }
      const h = 2 * R(rng, 2, 10), k = R(rng, 2, 6), b = R(rng, 5, 30), Ai = k * h / 2, S = b * h / 2;
      return Q(L(`Một hình tam giác có diện tích ${S} cm². Nếu kéo dài đáy thêm ${k} cm (giữ nguyên chiều cao) thì diện tích tăng thêm ${Ai} cm². Tính độ dài đáy của hình tam giác ban đầu.`,
        `A triangle has an area of ${S} cm². If its base is made ${k} cm longer (with the same height), its area grows by ${Ai} cm². Find the length of the original base.`),
      num(b, 'cm'), lines([
        L(`Phần tăng thêm là một hình tam giác có đáy ${k} cm và có cùng chiều cao với hình tam giác ban đầu.`, `The extra part is a triangle with a base of ${k} cm and the same height as the original triangle.`),
        L(`Chiều cao của hình tam giác là: ${Ai} × 2 : ${k} = ${h} (cm).`, `Height of the triangle: ${Ai} × 2 : ${k} = ${h} (cm).`),
        L(`Độ dài đáy ban đầu là: ${S} × 2 : ${h} = ${b} (cm).`, `Original base: ${S} × 2 : ${h} = ${b} (cm).`)]));
    } },

    // Trapeziums: a field with related sides and yield per m², a base made longer, mixed units
    { id: 'g5-nc-hinh-thang', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g5-c5-b26', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const [m, n] = P(rng, [[1, 2], [2, 3], [3, 4], [3, 5], [2, 5], [4, 5]]), t = R(rng, 4, 16), a = n * t, b = m * t, yq = P(rng, [0.5, 0.6, 0.7, 0.8, 0.75]);
        const avg = (a + b) % 2 === 0 && R(rng, 0, 1) === 1, k = avg ? 0 : R(rng, 1, Math.max(1, Math.min(10, b - 2))), h = avg ? (a + b) / 2 : b - k;
        const S = rd((a + b) * h / 2), kg = rd(S * yq);
        const hT = avg ? L('bằng trung bình cộng của hai đáy', 'is the average of the two bases') : L(`kém đáy bé ${k} m`, `is ${k} m less than the shorter base`);
        return Q(L(`Một thửa ruộng hình thang có đáy lớn ${a} m, đáy bé bằng ${m}/${n} đáy lớn, chiều cao ${hT}. Trung bình mỗi mét vuông thu hoạch được ${F(yq)} kg thóc. Hỏi cả thửa ruộng thu hoạch được bao nhiêu ki-lô-gam thóc?`,
          `A rice field is a trapezium. Its longer base is ${a} m, its shorter base is ${m}/${n} of the longer base, and its height ${hT}. On average, each square metre gives ${F(yq)} kg of rice. How many kilograms of rice does the whole field give?`),
        num(kg, 'kg'), lines([
          L(`Đáy bé là: ${a} × ${m}/${n} = ${b} (m).`, `Shorter base: ${a} × ${m}/${n} = ${b} (m).`),
          avg ? L(`Chiều cao là: (${a} + ${b}) : 2 = ${h} (m).`, `Height: (${a} + ${b}) : 2 = ${h} (m).`) : L(`Chiều cao là: ${b} ${M} ${k} = ${h} (m).`, `Height: ${b} ${M} ${k} = ${h} (m).`),
          L(`Diện tích thửa ruộng là: (${a} + ${b}) × ${h} : 2 = ${F(S)} (m²).`, `Area of the field: (${a} + ${b}) × ${h} : 2 = ${F(S)} (m²).`),
          L(`Số thóc thu hoạch được là: ${F(S)} × ${F(yq)} = ${F(kg)} (kg).`, `Rice harvested: ${F(S)} × ${F(yq)} = ${F(kg)} (kg).`)]));
      }
      if (f === 1) {
        const b = R(rng, 8, 30), a = b + R(rng, 4, 20), [h, k] = pick(() => [R(rng, 4, 20), R(rng, 2, 8)], v => (v[0] * v[1]) % 2 === 0, [8, 5]);
        const Ai = h * k / 2, S = rd((a + b) * h / 2);
        return Q(L(`Một mảnh đất hình thang có đáy lớn ${a} m, đáy bé ${b} m. Nếu kéo dài đáy lớn thêm ${k} m thì diện tích mảnh đất tăng thêm ${Ai} m². Tính diện tích mảnh đất ban đầu.`,
          `A plot of land is a trapezium with a longer base of ${a} m and a shorter base of ${b} m. If the longer base is made ${k} m longer, the area grows by ${Ai} m². Find the area of the original plot.`),
        num(S, 'm²'), lines([
          L(`Phần diện tích tăng thêm là một hình tam giác có đáy ${k} m và chiều cao bằng chiều cao của hình thang.`, `The extra area is a triangle with a base of ${k} m and the same height as the trapezium.`),
          L(`Chiều cao của hình thang là: ${Ai} × 2 : ${k} = ${h} (m).`, `Height of the trapezium: ${Ai} × 2 : ${k} = ${h} (m).`),
          L(`Diện tích mảnh đất ban đầu là: (${a} + ${b}) × ${h} : 2 = ${F(S)} (m²).`, `Area of the original plot: (${a} + ${b}) × ${h} : 2 = ${F(S)} (m²).`)]));
      }
      const half = R(rng, 0, 1) === 1, B = half ? 2 * R(rng, 6, 20) : mant(rng, 12, 40), a = half ? B * 3 / 2 : 2 * B, h = R(rng, 5, 20), S = rd((a + B) * h / 2);
      return Q(L(`Một hình thang có đáy bé ${F(dec(B, 1))} dm, đáy lớn ${half ? 'gấp rưỡi' : 'gấp đôi'} đáy bé, chiều cao ${h} cm. Tính diện tích hình thang theo xăng-ti-mét vuông.`,
        `A trapezium has a shorter base of ${F(dec(B, 1))} dm. Its longer base is ${half ? 'one and a half times' : 'twice'} the shorter base, and its height is ${h} cm. Find its area in square centimetres.`),
      num(S, 'cm²'), lines([L(`Đổi: ${F(dec(B, 1))} dm = ${B} cm.`, `${F(dec(B, 1))} dm = ${B} cm.`),
        L(`Đáy lớn là: ${B} × ${half ? '1,5' : '2'} = ${a} (cm).`, `Longer base: ${B} × ${half ? '1,5' : '2'} = ${a} (cm).`),
        L(`Diện tích hình thang là: (${a} + ${B}) × ${h} : 2 = ${F(S)} (cm²).`, `Area of the trapezium: (${a} + ${B}) × ${h} : 2 = ${F(S)} (cm²).`)]));
    } },

    /* ================= GIỮA HỌC KÌ II (Bài 36–41, 45–47, 49–50) ================= */

    // Tổng–tỉ: "q lần A bằng p lần B", a rectangle's perimeter → area, an average, a ratio given as a percentage
    { id: 'g5-nc-tong-ti', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c7-b38', gen: rng => {
      const f = R(rng, 0, 3);
      if (f === 0) {
        const [p, q] = P(rng, RATIO2), u = R(rng, 4, 40), S = (p + q) * u, first = R(rng, 0, 1) === 1, c = P(rng, pairCtx(S)), X = first ? c.x1 : c.x2, ans = (first ? p : q) * u;
        return Q(`${c.sum} ${relLine(c, p, q)} ${c.ask(X)}`, num(ans, c.unit), lines([relWhy(c, p, q),
          L(`Tổng số phần bằng nhau là: ${p} + ${q} = ${p + q} (phần).`, `Total number of equal parts: ${p} + ${q} = ${p + q}.`),
          L(`Giá trị một phần là: ${S} : ${p + q} = ${u}.`, `One part: ${S} : ${p + q} = ${u}.`),
          `${cap(c.item)} ${X}: ${u} × ${first ? p : q} = ${ans} (${c.unit}).`]),
        { hint: L(`${q} lần số thứ nhất bằng ${p} lần số thứ hai thì số thứ nhất bằng ${p}/${q} số thứ hai.`, `If ${q} times the first amount equals ${p} times the second, the first amount is ${p}/${q} of the second.`) });
      }
      if (f === 1) {
        const [m, n] = P(rng, RATIO), u = R(rng, 3, 20), Pm = 2 * (m + n) * u, len = n * u, wid = m * u;
        return Q(L(`Một mảnh vườn hình chữ nhật có chu vi ${Pm} m, chiều rộng bằng ${m}/${n} chiều dài. Tính diện tích mảnh vườn.`,
          `A rectangular garden has a perimeter of ${Pm} m. Its width is ${m}/${n} of its length. Find the area of the garden.`),
        num(len * wid, 'm²'), lines([
          L(`Nửa chu vi mảnh vườn là: ${Pm} : 2 = ${Pm / 2} (m).`, `Half the perimeter: ${Pm} : 2 = ${Pm / 2} (m).`),
          L(`Tổng số phần bằng nhau là: ${m} + ${n} = ${m + n} (phần); giá trị một phần là: ${Pm / 2} : ${m + n} = ${u} (m).`, `Total number of equal parts: ${m} + ${n} = ${m + n}; one part: ${Pm / 2} : ${m + n} = ${u} (m).`),
          L(`Chiều dài là: ${u} × ${n} = ${len} (m); chiều rộng là: ${u} × ${m} = ${wid} (m).`, `Length: ${u} × ${n} = ${len} (m); width: ${u} × ${m} = ${wid} (m).`),
          L(`Diện tích mảnh vườn là: ${len} × ${wid} = ${F(len * wid)} (m²).`, `Area of the garden: ${len} × ${wid} = ${F(len * wid)} (m²).`)]),
        { hint: L('Nửa chu vi là tổng của chiều dài và chiều rộng.', 'Half the perimeter is the length plus the width.') });
      }
      if (f === 2) {
        const [c, k] = pick(() => [R(rng, 6, 12), R(rng, 3, 5)], v => (v[0] * (v[1] + 1)) % 2 === 0, [8, 3]);
        const who = NC.name(rng), mom = c * k, sum = c * (k + 1), avg = sum / 2, askMom = R(rng, 0, 1) === 1;
        return Q(L(`Trung bình cộng số tuổi của mẹ và ${who} là ${avg} tuổi. Tuổi của ${who} bằng 1/${k} tuổi mẹ. Tính tuổi của ${askMom ? 'mẹ' : who}.`,
          `The average of Mum's age and ${who}'s age is ${avg} years. ${who}'s age is 1/${k} of Mum's age. How old is ${askMom ? 'Mum' : who}?`),
        num(askMom ? mom : c, L('tuổi', 'years')), lines([
          L(`Tổng số tuổi của hai mẹ con là: ${avg} × 2 = ${sum} (tuổi).`, `Sum of their ages: ${avg} × 2 = ${sum} (years).`),
          L(`Tổng số phần bằng nhau là: 1 + ${k} = ${k + 1} (phần).`, `Total number of equal parts: 1 + ${k} = ${k + 1}.`),
          L(`Tuổi của ${who} là: ${sum} : ${k + 1} = ${c} (tuổi).`, `${who}'s age: ${sum} : ${k + 1} = ${c} (years).`),
          askMom ? L(`Tuổi của mẹ là: ${c} × ${k} = ${mom} (tuổi).`, `Mum's age: ${c} × ${k} = ${mom} (years).`) : '']),
        { hint: L('Tổng hai số = trung bình cộng × 2.', 'The sum of two numbers = their average × 2.') });
      }
      const [pc, m, n] = P(rng, PCR), u = R(rng, 3, 60), S = (m + n) * u, first = R(rng, 0, 1) === 1;
      return Q(L(`Tổng của hai số là ${S}. Số thứ nhất bằng ${pc}% số thứ hai. Tìm số ${first ? 'thứ nhất' : 'thứ hai'}.`,
        `The sum of two numbers is ${S}. The first number is ${pc}% of the second number. Find the ${first ? 'first' : 'second'} number.`),
      num((first ? m : n) * u), lines([
        `${pc}% = ${pc}/100 = ${m}/${n}`,
        L(`Tổng số phần bằng nhau là: ${m} + ${n} = ${m + n} (phần); giá trị một phần là: ${S} : ${m + n} = ${u}.`, `Total number of equal parts: ${m} + ${n} = ${m + n}; one part: ${S} : ${m + n} = ${u}.`),
        L(`Số ${first ? 'thứ nhất' : 'thứ hai'} là: ${u} × ${first ? m : n} = ${(first ? m : n) * u}.`, `The ${first ? 'first' : 'second'} number: ${u} × ${first ? m : n} = ${(first ? m : n) * u}.`)]),
      { hint: L(`Viết ${pc}% thành phân số tối giản.`, `Write ${pc}% as a fraction in its simplest form.`) });
    } },

    // Hiệu–tỉ: "5 lần số cá bể thứ nhất bằng 2 lần số cá bể thứ hai", a transfer that makes two amounts equal, a rectangle, a percentage
    { id: 'g5-nc-hieu-ti', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c7-b39', gen: rng => {
      const f = R(rng, 0, 3);
      if (f === 0) {
        const [p, q] = P(rng, RATIO2), u = R(rng, 4, 30), D = (q - p) * u, first = R(rng, 0, 1) === 1, c = P(rng, pairCtx(D)), X = first ? c.x1 : c.x2, ans = (first ? p : q) * u;
        return Q(`${c.diff} ${relLine(c, p, q)} ${c.ask(X)}`, num(ans, c.unit), lines([relWhy(c, p, q),
          L(`Hiệu số phần bằng nhau là: ${q} ${M} ${p} = ${q - p} (phần).`, `Difference in equal parts: ${q} ${M} ${p} = ${q - p}.`),
          L(`Giá trị một phần là: ${D} : ${q - p} = ${u}.`, `One part: ${D} : ${q - p} = ${u}.`),
          `${cap(c.item)} ${X}: ${u} × ${first ? p : q} = ${ans} (${c.unit}).`]),
        { hint: L(`${q} lần số thứ nhất bằng ${p} lần số thứ hai thì số thứ nhất bằng ${p}/${q} số thứ hai.`, `If ${q} times the first amount equals ${p} times the second, the first amount is ${p}/${q} of the second.`) });
      }
      if (f === 1) {
        const [m, n] = P(rng, RATIO); let u = R(rng, 3, 30); if (((n - m) * u) % 2) u++;
        const D = (n - m) * u, k = D / 2, askA = R(rng, 0, 1) === 1, A = n * u, B = m * u;
        return Q(L(`Lớp 5A có nhiều sách hơn lớp 5B. Nếu lớp 5A chuyển cho lớp 5B ${k} quyển sách thì số sách của hai lớp bằng nhau. Biết số sách của lớp 5B bằng ${m}/${n} số sách của lớp 5A. Hỏi lớp ${askA ? '5A' : '5B'} có bao nhiêu quyển sách?`,
          `Class 5A has more books than class 5B. If class 5A gives ${k} books to class 5B, the two classes will have the same number of books. The number of books in class 5B is ${m}/${n} of the number in class 5A. How many books does class ${askA ? '5A' : '5B'} have?`),
        num(askA ? A : B, L('quyển', 'books')), lines([
          L(`Lớp 5A bớt ${k} quyển, lớp 5B thêm ${k} quyển thì bằng nhau, nên lớp 5A nhiều hơn lớp 5B: ${k} × 2 = ${D} (quyển).`, `Class 5A loses ${k} books and class 5B gains ${k} books, and then they are equal, so class 5A has ${k} × 2 = ${D} more books than class 5B.`),
          L(`Hiệu số phần bằng nhau là: ${n} ${M} ${m} = ${n - m} (phần); giá trị một phần là: ${D} : ${n - m} = ${u} (quyển).`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m}; one part: ${D} : ${n - m} = ${u} (books).`),
          askA ? L(`Số sách của lớp 5A là: ${u} × ${n} = ${A} (quyển).`, `Books in class 5A: ${u} × ${n} = ${A}.`) : L(`Số sách của lớp 5B là: ${u} × ${m} = ${B} (quyển).`, `Books in class 5B: ${u} × ${m} = ${B}.`)]),
        { hint: L(`Chuyển ${k} quyển thì hai lớp bằng nhau: lớp 5A nhiều hơn lớp 5B gấp đôi ${k} quyển.`, `After ${k} books move, the classes are equal, so the difference is twice ${k}.`) });
      }
      if (f === 2) {
        const [m, n] = P(rng, RATIO), u = R(rng, 3, 20), D = (n - m) * u, len = n * u, wid = m * u, area = R(rng, 0, 1) === 1, ans = area ? len * wid : (len + wid) * 2;
        return Q(L(`Một thửa ruộng hình chữ nhật có chiều dài hơn chiều rộng ${D} m, chiều rộng bằng ${m}/${n} chiều dài. Tính ${area ? 'diện tích' : 'chu vi'} thửa ruộng.`,
          `A rectangular rice field is ${D} m longer than it is wide. Its width is ${m}/${n} of its length. Find the ${area ? 'area' : 'perimeter'} of the field.`),
        num(ans, area ? 'm²' : 'm'), lines([
          L(`Hiệu số phần bằng nhau là: ${n} ${M} ${m} = ${n - m} (phần); giá trị một phần là: ${D} : ${n - m} = ${u} (m).`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m}; one part: ${D} : ${n - m} = ${u} (m).`),
          L(`Chiều dài là: ${u} × ${n} = ${len} (m); chiều rộng là: ${u} × ${m} = ${wid} (m).`, `Length: ${u} × ${n} = ${len} (m); width: ${u} × ${m} = ${wid} (m).`),
          area ? L(`Diện tích thửa ruộng là: ${len} × ${wid} = ${F(ans)} (m²).`, `Area of the field: ${len} × ${wid} = ${F(ans)} (m²).`)
            : L(`Chu vi thửa ruộng là: (${len} + ${wid}) × 2 = ${ans} (m).`, `Perimeter of the field: (${len} + ${wid}) × 2 = ${ans} (m).`)]));
      }
      const [pc, m, n] = P(rng, PCR), u = R(rng, 3, 60), D = (n - m) * u, small = R(rng, 0, 1) === 1;
      return Q(L(`Hiệu của hai số là ${D}. Số bé bằng ${pc}% số lớn. Tìm số ${small ? 'bé' : 'lớn'}.`,
        `The difference between two numbers is ${D}. The smaller number is ${pc}% of the larger number. Find the ${small ? 'smaller' : 'larger'} number.`),
      num((small ? m : n) * u), lines([
        `${pc}% = ${pc}/100 = ${m}/${n}`,
        L(`Hiệu số phần bằng nhau là: ${n} ${M} ${m} = ${n - m} (phần); giá trị một phần là: ${D} : ${n - m} = ${u}.`, `Difference in equal parts: ${n} ${M} ${m} = ${n - m}; one part: ${D} : ${n - m} = ${u}.`),
        L(`Số ${small ? 'bé' : 'lớn'} là: ${u} × ${small ? m : n} = ${(small ? m : n) * u}.`, `The ${small ? 'smaller' : 'larger'} number: ${u} × ${small ? m : n} = ${(small ? m : n) * u}.`)]),
      { hint: L(`Viết ${pc}% thành phân số tối giản.`, `Write ${pc}% as a fraction in its simplest form.`) });
    } },

    // How the area changes in per cent: sides made longer, a side 1,5 / 2 / 3 times as long, length up and width down
    { id: 'g5-nc-pt-dien-tich', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c7-b40', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const [s, k] = pick(() => [P(rng, [10, 20, 25, 40, 50]), R(rng, 1, 10)], v => ok2(((v[0] + v[1]) ** 2 - v[0] ** 2) * 100 / v[0] ** 2), [20, 4]);
        const s2 = s + k, A1 = s * s, A2 = s2 * s2, dA = A2 - A1, pct = rd(dA * 100 / A1);
        return Q(L(`Một mảnh vườn hình vuông có cạnh ${s} m. Người ta mở rộng mảnh vườn, mỗi cạnh dài thêm ${k} m (mảnh vườn vẫn là hình vuông). Hỏi diện tích mảnh vườn tăng thêm bao nhiêu phần trăm?`,
          `A square garden has sides of ${s} m. It is made bigger: each side becomes ${k} m longer, and it is still a square. By what percentage does the area of the garden increase?`),
        num(pct, '%'), lines([
          L(`Cạnh mảnh vườn mới là: ${s} + ${k} = ${s2} (m).`, `Side of the new garden: ${s} + ${k} = ${s2} (m).`),
          L(`Diện tích lúc đầu là: ${s} × ${s} = ${F(A1)} (m²); diện tích lúc sau là: ${s2} × ${s2} = ${F(A2)} (m²).`, `Area at first: ${s} × ${s} = ${F(A1)} (m²); new area: ${s2} × ${s2} = ${F(A2)} (m²).`),
          L(`Diện tích tăng thêm là: ${F(A2)} ${M} ${F(A1)} = ${F(dA)} (m²).`, `Increase in area: ${F(A2)} ${M} ${F(A1)} = ${F(dA)} (m²).`),
          L(`Tỉ số phần trăm: ${F(dA)} : ${F(A1)} = ${F(rd(dA / A1))} = ${F(pct)}%.`, `As a percentage: ${F(dA)} : ${F(A1)} = ${F(rd(dA / A1))} = ${F(pct)}%.`)]),
        { hint: L('So sánh phần diện tích tăng thêm với diện tích lúc đầu.', 'Compare the extra area with the area at first.') });
      }
      if (f === 1) {
        const [kx, kv, ke] = P(rng, [[1.5, 'tăng lên gấp rưỡi', 'one and a half times'], [2, 'tăng lên gấp đôi', 'twice'], [3, 'tăng lên gấp ba', 'three times']]);
        const s = 2 * R(rng, 2, 25), s2 = rd(s * kx), A1 = s * s, A2 = rd(s2 * s2), pct = rd((A2 - A1) * 100 / A1);
        return Q(L(`Một hình vuông có cạnh ${s} cm. Nếu cạnh hình vuông ${kv} thì diện tích hình vuông tăng thêm bao nhiêu phần trăm?`,
          `A square has sides of ${s} cm. If each side becomes ${ke} as long, by what percentage does the area of the square increase?`),
        num(pct, '%'), lines([
          L(`Cạnh mới là: ${s} × ${F(kx)} = ${F(s2)} (cm).`, `New side: ${s} × ${F(kx)} = ${F(s2)} (cm).`),
          L(`Diện tích lúc đầu là: ${s} × ${s} = ${F(A1)} (cm²); diện tích lúc sau là: ${F(s2)} × ${F(s2)} = ${F(A2)} (cm²).`, `Area at first: ${s} × ${s} = ${F(A1)} (cm²); new area: ${F(s2)} × ${F(s2)} = ${F(A2)} (cm²).`),
          L(`Diện tích tăng thêm là: ${F(A2)} ${M} ${F(A1)} = ${F(rd(A2 - A1))} (cm²).`, `Increase in area: ${F(A2)} ${M} ${F(A1)} = ${F(rd(A2 - A1))} (cm²).`),
          L(`Tỉ số phần trăm: ${F(rd(A2 - A1))} : ${F(A1)} = ${F(rd((A2 - A1) / A1))} = ${F(pct)}%.`, `As a percentage: ${F(rd(A2 - A1))} : ${F(A1)} = ${F(rd((A2 - A1) / A1))} = ${F(pct)}%.`)]),
        { hint: L('Diện tích tăng thêm so với diện tích lúc đầu (không phải so với diện tích lúc sau).', 'Compare the extra area with the area at first (not with the new area).') });
      }
      const p1 = P(rng, [10, 20, 25, 50]), p2 = P(rng, [10, 20, 25]), Lg = 20 * R(rng, 2, 8), W = 20 * R(rng, 1, Lg / 20 - 1);
      const L2 = Lg + Lg * p1 / 100, W2 = W - W * p2 / 100, A1 = Lg * W, A2 = L2 * W2, pct = rd(A2 * 100 / A1);
      return Q(L(`Một mảnh đất hình chữ nhật có chiều dài ${Lg} m, chiều rộng ${W} m. Người ta tăng chiều dài thêm ${p1}% và giảm chiều rộng đi ${p2}%. Hỏi diện tích mảnh đất mới bằng bao nhiêu phần trăm diện tích mảnh đất ban đầu?`,
        `A rectangular plot of land is ${Lg} m long and ${W} m wide. Its length is increased by ${p1}% and its width is decreased by ${p2}%. What percentage of the original area is the new area?`),
      num(pct, '%'), lines([
        L(`Chiều dài mới là: ${Lg} + ${Lg} × ${p1} : 100 = ${L2} (m).`, `New length: ${Lg} + ${Lg} × ${p1} : 100 = ${L2} (m).`),
        L(`Chiều rộng mới là: ${W} ${M} ${W} × ${p2} : 100 = ${W2} (m).`, `New width: ${W} ${M} ${W} × ${p2} : 100 = ${W2} (m).`),
        L(`Diện tích ban đầu là: ${Lg} × ${W} = ${F(A1)} (m²); diện tích mới là: ${L2} × ${W2} = ${F(A2)} (m²).`, `Original area: ${Lg} × ${W} = ${F(A1)} (m²); new area: ${L2} × ${W2} = ${F(A2)} (m²).`),
        L(`Tỉ số phần trăm: ${F(A2)} : ${F(A1)} = ${F(rd(A2 / A1))} = ${F(pct)}%.`, `As a percentage: ${F(A2)} : ${F(A1)} = ${F(rd(A2 / A1))} = ${F(pct)}%.`)]));
    } },

    // Percentages of money and people: discount then change, a price up then down, clubs, profit on rice
    { id: 'g5-nc-giam-gia', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c7-b41', gen: rng => {
      const f = R(rng, 0, 3), who = NC.name(rng);
      if (f === 0) {
        const [itV, oneV, itE, lo, hi, kmax] = P(rng, [['hộp sữa', 'hộp', 'cartons of milk', 20, 60, 6], ['quyển sách', 'quyển', 'books', 30, 90, 5], ['chiếc áo', 'chiếc', 'shirts', 20, 40, 3], ['hộp bút', 'hộp', 'pencil cases', 25, 70, 4]]);
        const X = (itV === 'chiếc áo' ? 5000 : 1000) * R(rng, lo, hi), k = R(rng, 2, kmax), p = P(rng, [5, 10, 15, 20, 25]);
        const T = X * k, off = T * p / 100, pay = T - off, G = [100000, 200000, 500000, 1000000].find(g => g > pay), back = G - pay;
        return Q(L(`${who} mua ${k} ${itV}, mỗi ${oneV} giá ${F(X)} đồng. Cửa hàng giảm giá ${p}% trên tổng số tiền. ${who} đưa cô bán hàng ${F(G)} đồng. Hỏi cô bán hàng phải trả lại ${who} bao nhiêu tiền?`,
          `${who} buys ${k} ${itE} at ${F(X)} dong each. The shop takes ${p}% off the total. ${who} gives the shopkeeper ${F(G)} dong. How much change does ${who} get?`),
        num(back, DONG), lines([
          L(`Số tiền ${k} ${itV} khi chưa giảm giá là: ${F(X)} × ${k} = ${F(T)} (đồng).`, `Price of ${k} ${itE} before the discount: ${F(X)} × ${k} = ${F(T)} (dong).`),
          L(`Số tiền được giảm là: ${F(T)} × ${p} : 100 = ${F(off)} (đồng).`, `Discount: ${F(T)} × ${p} : 100 = ${F(off)} (dong).`),
          L(`Số tiền phải trả là: ${F(T)} ${M} ${F(off)} = ${F(pay)} (đồng).`, `Amount to pay: ${F(T)} ${M} ${F(off)} = ${F(pay)} (dong).`),
          L(`Số tiền được trả lại là: ${F(G)} ${M} ${F(pay)} = ${F(back)} (đồng).`, `Change: ${F(G)} ${M} ${F(pay)} = ${F(back)} (dong).`)]));
      }
      if (f === 1) {
        const [itV, itE, lo, hi] = P(rng, [['chiếc xe đạp', 'bicycle', 100, 400], ['chiếc ti vi', 'television', 500, 900], ['chiếc quạt điện', 'electric fan', 30, 90]]);
        const X = 10000 * R(rng, lo, hi), p1 = P(rng, [10, 20, 25]), p2 = P(rng, [10, 20, 25]);
        const up = X * p1 / 100, X1 = X + up, down = X1 * p2 / 100, X2 = X1 - down;
        return Q(L(`Một ${itV} giá ${F(X)} đồng. Tháng trước, cửa hàng tăng giá ${p1}%. Tháng này, cửa hàng lại giảm ${p2}% so với giá mới. Hỏi giá ${itV} bây giờ là bao nhiêu tiền?`,
          `A ${itE} cost ${F(X)} dong. Last month the shop raised the price by ${p1}%. This month it lowered the new price by ${p2}%. What is the price of the ${itE} now?`),
        num(X2, DONG), lines([
          L(`Số tiền tăng thêm là: ${F(X)} × ${p1} : 100 = ${F(up)} (đồng); giá mới là: ${F(X)} + ${F(up)} = ${F(X1)} (đồng).`, `Price rise: ${F(X)} × ${p1} : 100 = ${F(up)} (dong); new price: ${F(X)} + ${F(up)} = ${F(X1)} (dong).`),
          L(`Số tiền giảm đi là: ${F(X1)} × ${p2} : 100 = ${F(down)} (đồng).`, `Price cut: ${F(X1)} × ${p2} : 100 = ${F(down)} (dong).`),
          L(`Giá bây giờ là: ${F(X1)} ${M} ${F(down)} = ${F(X2)} (đồng).`, `Price now: ${F(X1)} ${M} ${F(down)} = ${F(X2)} (dong).`)]),
        { hint: L('Lần giảm giá tính trên giá mới, không phải giá ban đầu.', 'The price cut is worked out on the new price, not on the first price.') });
      }
      if (f === 2) {
        const N = 100 * R(rng, 2, 8), p1 = 5 * R(rng, 4, 9), p2 = 5 * R(rng, 2, Math.min(p1 / 5 - 1, 16 - p1 / 5)), p3 = 100 - p1 - p2, diff = R(rng, 0, 1) === 1;
        const ans = diff ? N * (p1 - p2) / 100 : N * p3 / 100;
        return Q(L(`Một trường có ${N} học sinh, mỗi học sinh tham gia một câu lạc bộ. Có ${p1}% số học sinh tham gia câu lạc bộ bóng đá, ${p2}% tham gia câu lạc bộ cờ vua, số còn lại tham gia câu lạc bộ vẽ. ${diff ? 'Hỏi số học sinh tham gia câu lạc bộ bóng đá nhiều hơn số học sinh tham gia câu lạc bộ cờ vua bao nhiêu bạn?' : 'Hỏi có bao nhiêu học sinh tham gia câu lạc bộ vẽ?'}`,
          `A school has ${N} pupils, and each pupil is in one club. ${p1}% of the pupils are in the football club, ${p2}% are in the chess club and the rest are in the art club. ${diff ? 'How many more pupils are in the football club than in the chess club?' : 'How many pupils are in the art club?'}`),
        num(ans), diff ? lines([
          L(`Số học sinh câu lạc bộ bóng đá là: ${N} × ${p1} : 100 = ${N * p1 / 100} (bạn).`, `Football club: ${N} × ${p1} : 100 = ${N * p1 / 100} (pupils).`),
          L(`Số học sinh câu lạc bộ cờ vua là: ${N} × ${p2} : 100 = ${N * p2 / 100} (bạn).`, `Chess club: ${N} × ${p2} : 100 = ${N * p2 / 100} (pupils).`),
          L(`Nhiều hơn: ${N * p1 / 100} ${M} ${N * p2 / 100} = ${ans} (bạn).`, `Difference: ${N * p1 / 100} ${M} ${N * p2 / 100} = ${ans} (pupils).`)]) : lines([
          L(`Số học sinh câu lạc bộ vẽ chiếm: 100% ${M} ${p1}% ${M} ${p2}% = ${p3}%.`, `The art club has 100% ${M} ${p1}% ${M} ${p2}% = ${p3}% of the pupils.`),
          L(`Số học sinh câu lạc bộ vẽ là: ${N} × ${p3} : 100 = ${ans} (bạn).`, `Art club: ${N} × ${p3} : 100 = ${ans} (pupils).`)]));
      }
      const X = 1000 * R(rng, 10, 25), p = P(rng, [5, 10, 15, 20]), k = 10 * R(rng, 2, 20), gain = X * p / 100, sell = X + gain, tot = sell * k;
      return Q(L(`Một cửa hàng mua gạo với giá ${F(X)} đồng một ki-lô-gam và bán ra lãi ${p}% so với giá mua. Hỏi cửa hàng bán ${k} kg gạo thì thu được tất cả bao nhiêu tiền?`,
        `A shop buys rice at ${F(X)} dong a kilogram and sells it at a profit of ${p}% of the buying price. How much money does the shop get for selling ${k} kg of rice?`),
      num(tot, DONG), lines([
        L(`Tiền lãi trên 1 kg gạo là: ${F(X)} × ${p} : 100 = ${F(gain)} (đồng).`, `Profit on 1 kg: ${F(X)} × ${p} : 100 = ${F(gain)} (dong).`),
        L(`Giá bán 1 kg gạo là: ${F(X)} + ${F(gain)} = ${F(sell)} (đồng).`, `Selling price of 1 kg: ${F(X)} + ${F(gain)} = ${F(sell)} (dong).`),
        L(`Bán ${k} kg gạo thu được: ${F(sell)} × ${k} = ${F(tot)} (đồng).`, `Money for ${k} kg: ${F(sell)} × ${k} = ${F(tot)} (dong).`)]));
    } },

    // Savings: one year, two years with the first year's interest added, monthly interest for some months
    { id: 'g5-nc-tiet-kiem', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c7-b41', gen: rng => {
      const f = R(rng, 0, 2), who = NC.name(rng);
      if (f < 2) {
        const N = 1000000 * R(rng, 10, f ? 100 : 200), r = P(rng, f ? [5, 5.5, 6, 6.5, 7] : [5, 5.5, 6, 6.5, 7, 7.2, 7.5]), i1 = rd(N * r / 100), N1 = N + i1;
        const head = L(`Gia đình bạn ${who} gửi tiết kiệm ${F(N)} đồng với lãi suất ${F(r)}% một năm.`, `${who}'s family puts ${F(N)} dong into a savings account at ${F(r)}% a year.`);
        const s1 = L(`Tiền lãi năm thứ nhất là: ${F(N)} × ${F(r)} : 100 = ${F(i1)} (đồng).`, `Interest in the first year: ${F(N)} × ${F(r)} : 100 = ${F(i1)} (dong).`);
        const s2 = L(`Sau một năm có tất cả: ${F(N)} + ${F(i1)} = ${F(N1)} (đồng).`, `After one year: ${F(N)} + ${F(i1)} = ${F(N1)} (dong).`);
        if (f === 0) return Q(L(`${head} Hỏi sau một năm, gia đình bạn ${who} có tất cả bao nhiêu tiền (cả tiền gửi và tiền lãi)?`, `${head} After one year, how much money does the family have, savings and interest together?`),
          num(N1, DONG), lines([s1, s2]));
        const i2 = rd(N1 * r / 100), N2 = N1 + i2;
        return Q(L(`${head} Tiền lãi năm thứ nhất được cộng vào tiền gửi để tính lãi năm thứ hai. Hỏi sau hai năm, gia đình bạn ${who} có tất cả bao nhiêu tiền?`,
          `${head} The first year's interest is added to the savings, and the second year's interest is worked out on the new amount. After two years, how much money does the family have?`),
        num(N2, DONG), lines([s1, s2,
          L(`Tiền lãi năm thứ hai là: ${F(N1)} × ${F(r)} : 100 = ${F(i2)} (đồng).`, `Interest in the second year: ${F(N1)} × ${F(r)} : 100 = ${F(i2)} (dong).`),
          L(`Sau hai năm có tất cả: ${F(N1)} + ${F(i2)} = ${F(N2)} (đồng).`, `After two years: ${F(N1)} + ${F(i2)} = ${F(N2)} (dong).`)]),
        { hint: L('Năm thứ hai, lãi được tính trên số tiền sau năm thứ nhất.', 'In the second year, the interest is worked out on the money after the first year.') });
      }
      const N = 1000000 * R(rng, 5, 100), r = P(rng, [0.4, 0.5, 0.6]), m = P(rng, [3, 4, 6, 9, 12]), i = rd(N * r / 100), I = rd(i * m), T = N + I;
      return Q(L(`Cô ${who} gửi tiết kiệm ${F(N)} đồng với lãi suất ${F(r)}% một tháng. Tiền lãi mỗi tháng không được cộng vào tiền gửi. Hỏi sau ${m} tháng, cô ${who} rút ra được tất cả bao nhiêu tiền (cả tiền gửi và tiền lãi)?`,
        `Ms ${who} puts ${F(N)} dong into a savings account at ${F(r)}% a month. The monthly interest is not added to the savings. After ${m} months, how much money does she take out, savings and interest together?`),
      num(T, DONG), lines([
        L(`Tiền lãi một tháng là: ${F(N)} × ${F(r)} : 100 = ${F(i)} (đồng).`, `Interest for one month: ${F(N)} × ${F(r)} : 100 = ${F(i)} (dong).`),
        L(`Tiền lãi ${m} tháng là: ${F(i)} × ${m} = ${F(I)} (đồng).`, `Interest for ${m} months: ${F(i)} × ${m} = ${F(I)} (dong).`),
        L(`Số tiền rút ra là: ${F(N)} + ${F(I)} = ${F(T)} (đồng).`, `Money taken out: ${F(N)} + ${F(I)} = ${F(T)} (dong).`)]));
    } },

    // Map scale: the real area of a plot, from one map to another, a real field drawn on a map
    { id: 'g5-nc-ban-do', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c7-b37', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const inHa = R(rng, 0, 1) === 1, S = P(rng, inHa ? [2000, 5000, 10000] : [200, 500, 1000, 2000]);
        // sides of 2–24 cm on the map, whole or with one decimal place
        const side = () => (R(rng, 0, 1) ? R(rng, 2, 24) : dec(mant(rng, 21, 239), 1));
        const [a, b] = pick(() => [side(), side()], v => v[0] > v[1] && ok3(v[0] * S / 100 * v[1] * S / 100 / (inHa ? 10000 : 1)), [6, 4]);
        const La = rd(a * S), Wa = rd(b * S), Lm = rd(La / 100), Wm = rd(Wa / 100), A = rd(Lm * Wm), ha = rd(A / 10000);
        return Q(L(`Trên bản đồ tỉ lệ 1 : ${F(S)}, một khu đất hình chữ nhật có chiều dài ${F(a)} cm, chiều rộng ${F(b)} cm. Tính diện tích thật của khu đất đó theo ${inHa ? 'héc-ta' : 'mét vuông'}.`,
          `On a map with a scale of 1 : ${F(S)}, a rectangular plot of land is ${F(a)} cm long and ${F(b)} cm wide. Find the real area of the plot in ${inHa ? 'hectares' : 'square metres'}.`),
        num(inHa ? ha : A, inHa ? 'ha' : 'm²'), lines([
          L(`Chiều dài thật là: ${F(a)} × ${F(S)} = ${F(La)} (cm) = ${F(Lm)} m.`, `Real length: ${F(a)} × ${F(S)} = ${F(La)} (cm) = ${F(Lm)} m.`),
          L(`Chiều rộng thật là: ${F(b)} × ${F(S)} = ${F(Wa)} (cm) = ${F(Wm)} m.`, `Real width: ${F(b)} × ${F(S)} = ${F(Wa)} (cm) = ${F(Wm)} m.`),
          L(`Diện tích thật là: ${F(Lm)} × ${F(Wm)} = ${F(A)} (m²)${inHa ? ` = ${F(ha)} ha` : ''}.`, `Real area: ${F(Lm)} × ${F(Wm)} = ${F(A)} (m²)${inHa ? ` = ${F(ha)} ha` : ''}.`)]),
        { hint: L('Tính chiều dài, chiều rộng thật trước rồi mới tính diện tích.', 'Find the real length and width first, then the area.') });
      }
      if (f === 1) {
        const [S1, S2, c] = pick(() => [P(rng, [100000, 200000, 250000, 500000]), P(rng, [1000000, 2000000, 2500000, 5000000]), R(rng, 2, 20)], v => ok2(v[2] * v[0] / v[1]) && v[2] * v[0] / v[1] >= 1, [500000, 2000000, 6]);
        const real = c * S1, km = rd(real / 100000), c2 = rd(real / S2);
        return Q(L(`Quãng đường từ A đến B trên bản đồ tỉ lệ 1 : ${F(S1)} dài ${c} cm. Hỏi trên bản đồ tỉ lệ 1 : ${F(S2)}, quãng đường đó dài bao nhiêu xăng-ti-mét?`,
          `On a map with a scale of 1 : ${F(S1)}, the road from A to B is ${c} cm long. How many centimetres long is the same road on a map with a scale of 1 : ${F(S2)}?`),
        num(c2, 'cm'), lines([
          L(`Quãng đường thật dài: ${c} × ${F(S1)} = ${F(real)} (cm) = ${F(km)} km.`, `Real distance: ${c} × ${F(S1)} = ${F(real)} (cm) = ${F(km)} km.`),
          L(`Trên bản đồ tỉ lệ 1 : ${F(S2)}, quãng đường dài: ${F(real)} : ${F(S2)} = ${F(c2)} (cm).`, `On the map with a scale of 1 : ${F(S2)}: ${F(real)} : ${F(S2)} = ${F(c2)} (cm).`)]));
      }
      const S = P(rng, [500, 1000, 2000]), mpc = S / 100, a = R(rng, 4, 15), b = R(rng, 2, a - 1), Lm = a * mpc, Wm = b * mpc;
      return Q(L(`Một sân bóng hình chữ nhật có chiều dài ${Lm} m, chiều rộng ${Wm} m. Trên bản đồ tỉ lệ 1 : ${F(S)}, diện tích sân bóng đó là bao nhiêu xăng-ti-mét vuông?`,
        `A rectangular football pitch is ${Lm} m long and ${Wm} m wide. On a map with a scale of 1 : ${F(S)}, what is the area of the pitch in square centimetres?`),
      num(a * b, 'cm²'), lines([
        L(`Đổi: ${Lm} m = ${F(Lm * 100)} cm; ${Wm} m = ${F(Wm * 100)} cm.`, `${Lm} m = ${F(Lm * 100)} cm; ${Wm} m = ${F(Wm * 100)} cm.`),
        L(`Trên bản đồ, chiều dài là: ${F(Lm * 100)} : ${F(S)} = ${a} (cm); chiều rộng là: ${F(Wm * 100)} : ${F(S)} = ${b} (cm).`, `On the map, the length is ${F(Lm * 100)} : ${F(S)} = ${a} (cm) and the width is ${F(Wm * 100)} : ${F(S)} = ${b} (cm).`),
        L(`Diện tích trên bản đồ là: ${a} × ${b} = ${a * b} (cm²).`, `Area on the map: ${a} × ${b} = ${a * b} (cm²).`)]));
    } },

    // Cuboid surface area in real jobs: painting an open box inside and out, a classroom, a fish tank in m²
    { id: 'g5-nc-son-thung', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c9-b50', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const [a, b, c, w] = pick(() => { const a = R(rng, 8, 20); return [a, R(rng, 5, a - 1), R(rng, 4, 12), P(rng, [0.2, 0.25, 0.3, 0.4, 0.5])]; },
          v => ok3(((v[0] + v[1]) * 2 * v[2] + v[0] * v[1]) / 100 * 2 * v[3]), [12, 8, 6, 0.3]);
        const am = dec(a, 1), bm = dec(b, 1), cm = dec(c, 1), Sxq = rd((a + b) * 2 * c / 100), Sd = rd(a * b / 100), Z = rd((Sxq + Sd) * 2), kg = rd(Z * w);
        return Q(L(`Người ta làm một cái thùng không nắp dạng hình hộp chữ nhật có chiều dài ${F(am)} m, chiều rộng ${F(bm)} m, chiều cao ${F(cm)} m. Người ta sơn cả mặt trong và mặt ngoài của thùng, mỗi mét vuông hết ${F(w)} kg sơn. Hỏi cần bao nhiêu ki-lô-gam sơn?`,
          `A box with no lid is a cuboid ${F(am)} m long, ${F(bm)} m wide and ${F(cm)} m high. Both the inside and the outside are painted, and each square metre takes ${F(w)} kg of paint. How many kilograms of paint are needed?`),
        num(kg, 'kg'), lines([
          L(`Diện tích xung quanh của thùng là: (${F(am)} + ${F(bm)}) × 2 × ${F(cm)} = ${F(Sxq)} (m²).`, `Lateral surface area: (${F(am)} + ${F(bm)}) × 2 × ${F(cm)} = ${F(Sxq)} (m²).`),
          L(`Diện tích đáy thùng là: ${F(am)} × ${F(bm)} = ${F(Sd)} (m²).`, `Area of the base: ${F(am)} × ${F(bm)} = ${F(Sd)} (m²).`),
          L(`Diện tích cần sơn là: (${F(Sxq)} + ${F(Sd)}) × 2 = ${F(Z)} (m²).`, `Area to paint (inside and outside): (${F(Sxq)} + ${F(Sd)}) × 2 = ${F(Z)} (m²).`),
          L(`Số ki-lô-gam sơn cần dùng là: ${F(Z)} × ${F(w)} = ${F(kg)} (kg).`, `Paint needed: ${F(Z)} × ${F(w)} = ${F(kg)} (kg).`)]),
        { hint: L('Thùng không nắp: chỉ có 4 mặt xung quanh và 1 mặt đáy.', 'A box with no lid has 4 side faces and 1 base.') });
      }
      if (f === 1) {
        const Lr = R(rng, 6, 10), W = R(rng, 4, Lr - 1), H = P(rng, [3.5, 3.6, 3.8, 4, 4.2]), D = dec(mant(rng, 60, 150), 1);
        const Sxq = rd((Lr + W) * 2 * H), Sc = Lr * W, T = rd(Sxq + Sc - D);
        return Q(L(`Một phòng học dạng hình hộp chữ nhật có chiều dài ${Lr} m, chiều rộng ${W} m, chiều cao ${F(H)} m. Người ta quét vôi bốn bức tường phía trong và trần nhà. Biết diện tích các cửa là ${F(D)} m². Tính diện tích cần quét vôi.`,
          `A classroom is a cuboid ${Lr} m long, ${W} m wide and ${F(H)} m high. The four walls inside and the ceiling are painted. The doors and windows have an area of ${F(D)} m². Find the area to be painted.`),
        num(T, 'm²'), lines([
          L(`Diện tích bốn bức tường là: (${Lr} + ${W}) × 2 × ${F(H)} = ${F(Sxq)} (m²).`, `Area of the four walls: (${Lr} + ${W}) × 2 × ${F(H)} = ${F(Sxq)} (m²).`),
          L(`Diện tích trần nhà là: ${Lr} × ${W} = ${Sc} (m²).`, `Area of the ceiling: ${Lr} × ${W} = ${Sc} (m²).`),
          L(`Diện tích cần quét vôi là: ${F(Sxq)} + ${Sc} ${M} ${F(D)} = ${F(T)} (m²).`, `Area to paint: ${F(Sxq)} + ${Sc} ${M} ${F(D)} = ${F(T)} (m²).`)]),
        { hint: L('Trừ đi phần cửa không quét vôi.', 'Take away the doors and windows, which are not painted.') });
      }
      const a = 10 * R(rng, 4, 12), b = 10 * R(rng, 3, Math.min(6, a / 10 - 1)), c = 10 * R(rng, 3, 6), Sxq = (a + b) * 2 * c, Sd = a * b, T = Sxq + Sd, m2 = rd(T / 10000);
      return Q(L(`Một bể cá dạng hình hộp chữ nhật không có nắp, có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích kính dùng làm bể cá theo mét vuông.`,
        `A fish tank with no lid is a cuboid ${a} cm long, ${b} cm wide and ${c} cm high. Find the area of glass used to make it, in square metres.`),
      num(m2, 'm²'), lines([
        L(`Diện tích xung quanh là: (${a} + ${b}) × 2 × ${c} = ${F(Sxq)} (cm²).`, `Lateral surface area: (${a} + ${b}) × 2 × ${c} = ${F(Sxq)} (cm²).`),
        L(`Diện tích đáy là: ${a} × ${b} = ${F(Sd)} (cm²).`, `Area of the base: ${a} × ${b} = ${F(Sd)} (cm²).`),
        L(`Diện tích kính là: ${F(Sxq)} + ${F(Sd)} = ${F(T)} (cm²) = ${F(m2)} m².`, `Area of glass: ${F(Sxq)} + ${F(Sd)} = ${F(T)} (cm²) = ${F(m2)} m².`)]),
      { hint: '1 m² = 10 000 cm²' });
    } },

    // Percentage of a plan (with units to convert), of girls from a sum and difference, a price change
    { id: 'g5-nc-ke-hoach', from: 'giua-hk2', kinds: ['tn', 'tl'], lesson: 'g5-c7-b40', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const forest = R(rng, 0, 1) === 1, Pn = dec(R(rng, 12, 95), 1), base = forest ? rd(Pn * 10000) : rd(Pn * 1000);
        let pc = R(rng, 80, 150); if (pc === 100) pc = 104;
        const D = base * pc / 100, over = pc > 100 && R(rng, 0, 1) === 1;
        const head = forest ? L(`Theo kế hoạch, một xã phải trồng ${F(Pn)} ha rừng. Xã đã trồng được ${F(D)} m² rừng.`, `A commune planned to plant ${F(Pn)} ha of forest. It has planted ${F(D)} m² of forest.`)
          : L(`Theo kế hoạch, một hợp tác xã phải thu mua ${F(Pn)} tấn cà phê. Hợp tác xã đã thu mua được ${F(D)} kg cà phê.`, `A co-operative planned to buy ${F(Pn)} tonnes of coffee. It has bought ${F(D)} kg of coffee.`);
        const ask = over ? L('Hỏi đã vượt mức kế hoạch bao nhiêu phần trăm?', 'By what percentage has the plan been beaten?') : L('Hỏi đã thực hiện được bao nhiêu phần trăm kế hoạch?', 'What percentage of the plan has been done?');
        return Q(`${head} ${ask}`, num(over ? pc - 100 : pc, '%'), lines([
          forest ? L(`Đổi: ${F(Pn)} ha = ${F(base)} m².`, `${F(Pn)} ha = ${F(base)} m².`) : L(`Đổi: ${F(Pn)} tấn = ${F(base)} kg.`, `${F(Pn)} tonnes = ${F(base)} kg.`),
          L(`Tỉ số phần trăm: ${F(D)} : ${F(base)} = ${F(pc / 100)} = ${pc}%.`, `As a percentage: ${F(D)} : ${F(base)} = ${F(pc / 100)} = ${pc}%.`),
          over ? L(`Vượt mức kế hoạch: ${pc}% ${M} 100% = ${pc - 100}%.`, `Over the plan: ${pc}% ${M} 100% = ${pc - 100}%.`) : '']),
        { hint: L('Đổi về cùng đơn vị đo trước khi tính tỉ số phần trăm.', 'Change to the same unit before working out the percentage.') });
      }
      if (f === 1) {
        const T = P(rng, [20, 25, 40, 50]), d = 2 * R(rng, 1, 5) + (T % 2), g = (T - d) / 2, b = g + d, girls = R(rng, 0, 1) === 1, x = girls ? g : b, pc = rd(x * 100 / T);
        return Q(L(`Lớp 5A có ${T} học sinh, trong đó số học sinh nữ ít hơn số học sinh nam ${d} bạn. Hỏi số học sinh ${girls ? 'nữ' : 'nam'} chiếm bao nhiêu phần trăm số học sinh cả lớp?`,
          `Class 5A has ${T} pupils, and there are ${d} fewer girls than boys. What percentage of the class are ${girls ? 'girls' : 'boys'}?`),
        num(pc, '%'), lines([
          L(`Số học sinh nữ là: (${T} ${M} ${d}) : 2 = ${g} (bạn); số học sinh nam là: ${g} + ${d} = ${b} (bạn).`, `Girls: (${T} ${M} ${d}) : 2 = ${g}; boys: ${g} + ${d} = ${b}.`),
          L(`Tỉ số phần trăm: ${x} : ${T} = ${F(rd(x / T))} = ${F(pc)}%.`, `As a percentage: ${x} : ${T} = ${F(rd(x / T))} = ${F(pc)}%.`)]));
      }
      const [itV, itE] = P(rng, [['quyển sách', 'book'], ['cái cặp sách', 'school bag'], ['đôi giày', 'pair of shoes'], ['hộp bánh', 'box of biscuits']]);
      const X = 5000 * R(rng, 4, 40), pc = P(rng, [5, 10, 15, 20, 25, 30, 40]), down = R(rng, 0, 1) === 1, dX = X * pc / 100, Y = down ? X - dX : X + dX;
      return Q(L(`Giá một ${itV} trước đây là ${F(X)} đồng, nay là ${F(Y)} đồng. Hỏi giá ${itV} đã ${down ? 'giảm' : 'tăng'} bao nhiêu phần trăm?`,
        `A ${itE} used to cost ${F(X)} dong. Now it costs ${F(Y)} dong. By what percentage has the price gone ${down ? 'down' : 'up'}?`),
      num(pc, '%'), lines([
        L(`Số tiền ${down ? 'giảm' : 'tăng'} là: ${down ? `${F(X)} ${M} ${F(Y)}` : `${F(Y)} ${M} ${F(X)}`} = ${F(dX)} (đồng).`, `The price went ${down ? 'down' : 'up'} by ${down ? `${F(X)} ${M} ${F(Y)}` : `${F(Y)} ${M} ${F(X)}`} = ${F(dX)} (dong).`),
        L(`Tỉ số phần trăm: ${F(dX)} : ${F(X)} = ${F(pc / 100)} = ${pc}%.`, `As a percentage: ${F(dX)} : ${F(X)} = ${F(pc / 100)} = ${pc}%.`)]),
      { hint: L('So sánh số tiền thay đổi với giá trước đây.', 'Compare the change with the old price.') });
    } },

    /* ================= CUỐI NĂM (+ Bài 51–53, 56–60, 63–65) ================= */

    // One moving object: home sooner → new speed, distance from times with a stop, km/h → m/s or m/min, faster → minutes saved
    { id: 'g5-nc-van-toc', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g5-c10-b60', gen: rng => {
      const f = R(rng, 0, 3), NT = [12, 15, 18, 24, 30, 36, 45, 48, 54];   // minutes that are tidy decimals of an hour
      if (f === 0) {
        const who = NC.name(rng);
        const [v1, t1, t2] = pick(() => { const t1 = P(rng, NT.slice(1)); return [R(rng, 10, 18), t1, P(rng, NT.filter(t => t < t1 && t1 - t <= 12))]; },
          v => ok3(v[0] * v[1] / 60) && ok2(v[0] * v[1] / v[2]) && v[0] * v[1] / v[2] <= 24, [15, 15, 12]);   // a speed a child can cycle
        const h1 = rd(t1 / 60), h2 = rd(t2 / 60), s = rd(v1 * h1), v2 = rd(s / h2), k = t1 - t2;
        return Q(L(`${who} đi xe đạp từ nhà đến trường với vận tốc ${v1} km/giờ thì hết ${t1} phút. Lúc tan học, ${who} muốn đi về nhà hết ít hơn lúc đi ${k} phút thì phải đi với vận tốc bao nhiêu ki-lô-mét một giờ?`,
          `${who} cycles from home to school at ${v1} km/h, and it takes ${t1} minutes. After school, ${who} wants to get home ${k} minutes faster. What speed, in kilometres per hour, must ${who} cycle at?`),
        num(v2, KMH), lines([
          L(`Đổi: ${t1} phút = ${F(h1)} giờ.`, `${t1} minutes = ${F(h1)} hours.`),
          L(`Quãng đường từ nhà đến trường là: ${v1} × ${F(h1)} = ${F(s)} (km).`, `Distance from home to school: ${v1} × ${F(h1)} = ${F(s)} (km).`),
          L(`Thời gian đi về là: ${t1} ${M} ${k} = ${t2} (phút) = ${F(h2)} giờ.`, `Time for the way home: ${t1} ${M} ${k} = ${t2} (minutes) = ${F(h2)} hours.`),
          L(`Vận tốc lúc về là: ${F(s)} : ${F(h2)} = ${F(v2)} (km/giờ).`, `Speed on the way home: ${F(s)} : ${F(h2)} = ${F(v2)} (km/h).`)]),
        { hint: L('Quãng đường đi và về như nhau.', 'The distance there and back is the same.') });
      }
      if (f === 1) {
        const dep = 60 * R(rng, 6, 8) + 5 * R(rng, 0, 11), tm = 6 * R(rng, 10, 40), r = P(rng, [10, 15, 20, 30]), arr = dep + tm + r, v = R(rng, 30, 60), h = rd(tm / 60), s = rd(v * h);
        return Q(L(`Một ô tô đi từ A lúc ${clk(dep)} và đến B lúc ${clk(arr)}. Dọc đường ô tô nghỉ ${r} phút. Vận tốc của ô tô là ${v} km/giờ. Tính quãng đường AB.`,
          `A car leaves A at ${clk(dep)} and arrives at B at ${clk(arr)}. On the way it stops for ${r} minutes. It travels at ${v} km/h. Find the distance from A to B.`),
        num(s, 'km'), lines([
          L(`Thời gian từ lúc đi đến lúc đến là: ${clk(arr)} ${M} ${clk(dep)} = ${dur(arr - dep)}.`, `From ${clk(dep)} to ${clk(arr)} is ${dur(arr - dep)}.`),
          L(`Thời gian ô tô chạy trên đường là: ${dur(arr - dep)} ${M} ${r} phút = ${dur(tm)} = ${F(h)} giờ.`, `Time actually driving: ${dur(arr - dep)} ${M} ${r} minutes = ${dur(tm)} = ${F(h)} hours.`),
          L(`Quãng đường AB dài là: ${v} × ${F(h)} = ${F(s)} (km).`, `Distance AB: ${v} × ${F(h)} = ${F(s)} (km).`)]),
        { hint: L('Không tính thời gian nghỉ vào thời gian đi.', 'Do not count the stop as travelling time.') });
      }
      if (f === 2) {
        const [veh, vehE] = P(rng, [['Một ô tô', 'A car'], ['Một đoàn tàu', 'A train'], ['Một người đi xe máy', 'A motorcyclist']]);
        if (R(rng, 0, 1)) {
          const v = P(rng, [18, 36, 54, 72]), sec = R(rng, 10, 60), vm = v * 1000 / 3600, s = vm * sec;
          return Q(L(`${veh} đi với vận tốc ${v} km/giờ. Hỏi trong ${sec} giây, ${veh.replace('Một ', '').toLowerCase()} đi được bao nhiêu mét?`, `${vehE} travels at ${v} km/h. How many metres does it travel in ${sec} seconds?`),
            num(s, 'm'), lines([
              L(`${v} km/giờ = ${F(v * 1000)} m/giờ; 1 giờ = 3600 giây.`, `${v} km/h = ${F(v * 1000)} m per hour; 1 hour = 3600 seconds.`),
              L(`Vận tốc tính theo mét một giây là: ${F(v * 1000)} : 3600 = ${vm} (m/giây).`, `Speed in metres per second: ${F(v * 1000)} : 3600 = ${vm} (m/s).`),
              L(`Quãng đường đi được là: ${vm} × ${sec} = ${F(s)} (m).`, `Distance: ${vm} × ${sec} = ${F(s)} (m).`)]));
        }
        const v = P(rng, [12, 15, 18, 24, 30, 36, 42, 45, 48]), mi = R(rng, 3, 25), vm = v * 1000 / 60, s = vm * mi;
        return Q(L(`${veh} đi với vận tốc ${v} km/giờ. Hỏi trong ${mi} phút, ${veh.replace('Một ', '').toLowerCase()} đi được bao nhiêu mét?`, `${vehE} travels at ${v} km/h. How many metres does it travel in ${mi} minutes?`),
          num(s, 'm'), lines([
            L(`${v} km/giờ = ${F(v * 1000)} m/giờ; 1 giờ = 60 phút.`, `${v} km/h = ${F(v * 1000)} m per hour; 1 hour = 60 minutes.`),
            L(`Vận tốc tính theo mét một phút là: ${F(v * 1000)} : 60 = ${F(vm)} (m/phút).`, `Speed in metres per minute: ${F(v * 1000)} : 60 = ${F(vm)} (m/min).`),
            L(`Quãng đường đi được là: ${F(vm)} × ${mi} = ${F(s)} (m).`, `Distance: ${F(vm)} × ${mi} = ${F(s)} (m).`)]));
      }
      const [s, v1, x] = pick(() => [10 * R(rng, 6, 24), R(rng, 30, 60), P(rng, [5, 10, 12, 15, 20])], v => {
        const m1 = v[0] * 60 / v[1], m2 = v[0] * 60 / (v[1] + v[2]);
        return Number.isInteger(m1) && Number.isInteger(m2) && m1 % 3 === 0 && m2 % 3 === 0;
      }, [120, 40, 8]);
      const v2 = v1 + x, m1 = s * 60 / v1, m2 = s * 60 / v2, h1 = rd(m1 / 60), h2 = rd(m2 / 60);
      return Q(L(`Một ô tô đi quãng đường ${s} km với vận tốc ${v1} km/giờ. Nếu mỗi giờ ô tô đi nhanh hơn ${x} km thì ô tô sẽ đến nơi sớm hơn bao nhiêu phút?`,
        `A car travels ${s} km at ${v1} km/h. If it went ${x} km/h faster, how many minutes sooner would it arrive?`),
      num(m1 - m2, L('phút', 'minutes')), lines([
        L(`Thời gian đi lúc đầu là: ${s} : ${v1} = ${F(h1)} (giờ) = ${m1} phút.`, `Time at first: ${s} : ${v1} = ${F(h1)} (hours) = ${m1} minutes.`),
        L(`Vận tốc mới là: ${v1} + ${x} = ${v2} (km/giờ).`, `New speed: ${v1} + ${x} = ${v2} (km/h).`),
        L(`Thời gian đi lúc sau là: ${s} : ${v2} = ${F(h2)} (giờ) = ${m2} phút.`, `New time: ${s} : ${v2} = ${F(h2)} (hours) = ${m2} minutes.`),
        L(`Ô tô đến sớm hơn: ${m1} ${M} ${m2} = ${m1 - m2} (phút).`, `It arrives sooner by ${m1} ${M} ${m2} = ${m1 - m2} (minutes).`)]));
    } },

    // Speed and circles: radius of a round track, a bicycle's speed from its wheel, a runner's laps
    { id: 'g5-nc-duong-dua', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g5-c10-b59', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        // a racing speed of 18–45 km/h
        const sp = v => v[0] * 2 * 3.14 / 1000 * 60 / v[1];
        const [r, t] = pick(() => [P(rng, [100, 150, 200, 250, 300, 400, 500, 1000]), P(rng, [3, 6, 9, 12, 15, 18, 24, 30, 36])], v => ok3(sp(v)) && sp(v) >= 18 && sp(v) <= 45, [1000, 15]);
        const Cm = rd(r * 2 * 3.14), Ck = rd(Cm / 1000), h = rd(t / 60), v = rd(Ck / h);
        return Q(L(`Một vận động viên đua xe đạp chạy trên một đường đua hình tròn với vận tốc ${F(v)} km/giờ. Cứ ${t} phút thì vận động viên đó đi được đúng một vòng đường đua. Tính bán kính của đường đua theo mét.`,
          `A racing cyclist rides round a circular track at ${F(v)} km/h. It takes ${t} minutes to ride exactly one lap. Find the radius of the track in metres.`),
        num(r, 'm'), lines([
          L(`Đổi: ${t} phút = ${F(h)} giờ.`, `${t} minutes = ${F(h)} hours.`),
          L(`Chu vi đường đua là: ${F(v)} × ${F(h)} = ${F(Ck)} (km) = ${F(Cm)} m.`, `Length of one lap (the circumference): ${F(v)} × ${F(h)} = ${F(Ck)} (km) = ${F(Cm)} m.`),
          L(`Bán kính đường đua là: ${F(Cm)} : 3,14 : 2 = ${r} (m).`, `Radius of the track: ${F(Cm)} : 3,14 : 2 = ${r} (m).`)]),
        { hint: L('Một vòng đường đua chính là chu vi hình tròn.', 'One lap is the circumference of the circle.') });
      }
      if (f === 1) {
        const [d, n] = pick(() => [P(rng, [0.5, 0.6, 0.65, 0.7, 0.75, 0.8]), 10 * R(rng, 5, 20)], v => ok3(v[0] * 3.14 * v[1] * 60 / 1000), [0.5, 100]);
        const C = rd(d * 3.14), X = rd(C * n), Y = rd(X * 60), v = rd(Y / 1000);
        return Q(L(`Bánh xe của một chiếc xe đạp có đường kính ${F(d)} m. Khi xe chạy, mỗi phút bánh xe quay được ${n} vòng. Tính vận tốc của xe đạp theo ki-lô-mét một giờ.`,
          `The wheels of a bicycle have a diameter of ${F(d)} m. As the bicycle moves, each wheel turns ${n} times a minute. Find the speed of the bicycle in kilometres per hour.`),
        num(v, KMH), lines([
          L(`Chu vi bánh xe là: ${F(d)} × 3,14 = ${F(C)} (m).`, `Circumference of the wheel: ${F(d)} × 3,14 = ${F(C)} (m).`),
          L(`Quãng đường xe đi trong 1 phút là: ${F(C)} × ${n} = ${F(X)} (m).`, `Distance in 1 minute: ${F(C)} × ${n} = ${F(X)} (m).`),
          L(`Quãng đường xe đi trong 1 giờ là: ${F(X)} × 60 = ${F(Y)} (m) = ${F(v)} km.`, `Distance in 1 hour: ${F(X)} × 60 = ${F(Y)} (m) = ${F(v)} km.`),
          L(`Vậy vận tốc của xe đạp là ${F(v)} km/giờ.`, `So the speed of the bicycle is ${F(v)} km/h.`)]));
      }
      // a running speed of 100–200 m a minute
      const rs = v => v[0] * 2 * 3.14 * v[1] / v[2];
      const [r, k, t] = pick(() => [P(rng, [25, 30, 40, 50, 60]), R(rng, 2, 6), R(rng, 2, 12)], v => ok3(rs(v)) && rs(v) >= 100 && rs(v) <= 200, [50, 3, 6]);
      const C = rd(r * 2 * 3.14), s = rd(C * k), v = rd(s / t), who = NC.name(rng);
      return Q(L(`Một sân chạy hình tròn có bán kính ${r} m. Bạn ${who} chạy ${k} vòng quanh sân hết ${t} phút. Tính vận tốc chạy của bạn ${who} theo mét một phút.`,
        `A round running track has a radius of ${r} m. ${who} runs ${k} laps round it in ${t} minutes. Find ${who}'s running speed in metres per minute.`),
      num(v, L('m/phút', 'm/min')), lines([
        L(`Chu vi sân chạy là: ${r} × 2 × 3,14 = ${F(C)} (m).`, `Circumference of the track: ${r} × 2 × 3,14 = ${F(C)} (m).`),
        L(`Quãng đường ${who} chạy là: ${F(C)} × ${k} = ${F(s)} (m).`, `Distance ${who} runs: ${F(C)} × ${k} = ${F(s)} (m).`),
        L(`Vận tốc chạy là: ${F(s)} : ${t} = ${F(v)} (m/phút).`, `Running speed: ${F(s)} : ${t} = ${F(v)} (m/min).`)]));
    } },

    // Arrival time with a stop on the way (a time of day, so options only)
    { id: 'g5-nc-gio-den', from: 'cuoi-nam', kinds: ['tn'], lesson: 'g5-c10-b60', gen: rng => {
      const [veh, vehE, it, itE, lo, hi, tlo, thi] = P(rng, [['Một ô tô', 'A car', 'ô tô', 'the car', 40, 60, 10, 30], ['Một người đi xe máy', 'A motorcyclist', 'người đó', 'the motorcyclist', 30, 45, 10, 25], ['Một người đi xe đạp', 'A cyclist', 'người đó', 'the cyclist', 10, 16, 5, 20]]);
      const v = R(rng, lo, hi), tm = 6 * R(rng, tlo, thi), r = P(rng, [10, 15, 20, 30]), dep = 60 * R(rng, 6, 13) + 5 * R(rng, 0, 11), h = rd(tm / 60), s = rd(v * h), arr = dep + tm + r;
      const H = Math.floor(h), d1 = Math.round((h - H) * 10), wrongs = [dep + tm, arr + 60, arr - 10, arr + 10];
      if (ok2(h) && Math.abs(h * 10 - Math.round(h * 10)) < 1e-9 && d1) wrongs.unshift(dep + H * 60 + d1 * 10 + r);   // 2,5 giờ read as 2 giờ 50 phút
      return Q(L(`${veh} khởi hành lúc ${clk(dep)}, đi quãng đường ${F(s)} km với vận tốc ${v} km/giờ. Dọc đường ${it} nghỉ ${r} phút. Hỏi ${it} đến nơi lúc mấy giờ?`,
        `${vehE} sets off at ${clk(dep)} and travels ${F(s)} km at ${v} km/h, with a ${r}-minute stop on the way. At what time does ${itE} arrive?`),
      NC.ch(rng, clk(arr), wrongs.filter(t => t !== arr).map(clk)), lines([
        L(`Thời gian đi trên đường là: ${F(s)} : ${v} = ${F(h)} (giờ) = ${dur(tm)}.`, `Travelling time: ${F(s)} : ${v} = ${F(h)} (hours) = ${dur(tm)}.`),
        L(`Tính cả thời gian nghỉ: ${dur(tm)} + ${r} phút = ${dur(tm + r)}.`, `With the stop: ${dur(tm)} + ${r} minutes = ${dur(tm + r)}.`),
        L(`Thời điểm đến nơi là: ${clk(dep)} + ${dur(tm + r)} = ${clk(arr)}.`, `Arrival time: ${clk(dep)} + ${dur(tm + r)} = ${clk(arr)}.`)]),
      { hint: L('Đổi số giờ thập phân ra giờ và phút, nhớ cộng thời gian nghỉ.', 'Change the decimal hours into hours and minutes, and remember the stop.') });
    } },

    // Elapsed time: items made between two times with a break, hours of lessons over some weeks, average per lap
    { id: 'g5-nc-thoi-gian', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g5-c10-b58', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) {
        const p = P(rng, [12, 15, 18, 20, 24, 25, 30, 35, 40, 45, 50, 72, 75, 80, 90]), n = R(rng, Math.max(2, Math.ceil(120 / p)), Math.floor(300 / p));
        const r = P(rng, [15, 20, 30]), work = n * p, start = 7 * 60 + 5 * R(rng, 0, 12), end = start + work + r;
        return Q(L(`Một người thợ làm việc từ ${clk(start)} đến ${clk(end)}, trong đó có ${r} phút nghỉ giữa giờ. Mỗi sản phẩm người đó làm hết ${dur(p)}. Hỏi người đó làm được bao nhiêu sản phẩm?`,
          `A worker works from ${clk(start)} to ${clk(end)}, with a ${r}-minute break. Each item takes ${dur(p)} to make. How many items does the worker make?`),
        num(n, L('sản phẩm', 'items')), lines([
          L(`Thời gian từ ${clk(start)} đến ${clk(end)} là: ${dur(end - start)}.`, `From ${clk(start)} to ${clk(end)} is ${dur(end - start)}.`),
          L(`Thời gian làm việc là: ${dur(end - start)} ${M} ${r} phút = ${dur(work)}${work >= 60 ? ` = ${work} phút` : ''}.`, `Working time: ${dur(end - start)} ${M} ${r} minutes = ${dur(work)}${work >= 60 ? ` = ${work} minutes` : ''}.`),
          p >= 60 ? L(`Đổi: ${dur(p)} = ${p} phút.`, `${dur(p)} = ${p} minutes.`) : '',
          L(`Số sản phẩm làm được là: ${work} : ${p} = ${n} (sản phẩm).`, `Items made: ${work} : ${p} = ${n}.`)]),
        { hint: L('Trừ thời gian nghỉ trước khi chia.', 'Take away the break before you divide.') });
      }
      if (f === 1) {
        const [len, k, w] = pick(() => [P(rng, [35, 40, 45]), R(rng, 3, 6), R(rng, 3, 35)], v => (v[0] * v[1] * v[2]) % 60 === 0, [40, 5, 3]);
        const lessons = k * w, mins = lessons * len, hrs = mins / 60;
        return Q(L(`Mỗi tiết học kéo dài ${len} phút. Mỗi tuần lớp 5A có ${k} tiết Toán. Hỏi trong ${w} tuần, lớp 5A học Toán tất cả bao nhiêu giờ?`,
          `Each lesson lasts ${len} minutes. Class 5A has ${k} maths lessons a week. How many hours of maths does class 5A have in ${w} weeks?`),
        num(hrs, L('giờ', 'hours')), lines([
          L(`Số tiết Toán trong ${w} tuần là: ${k} × ${w} = ${lessons} (tiết).`, `Maths lessons in ${w} weeks: ${k} × ${w} = ${lessons}.`),
          L(`Thời gian học là: ${len} × ${lessons} = ${F(mins)} (phút).`, `Time: ${len} × ${lessons} = ${F(mins)} (minutes).`),
          L(`Đổi: ${F(mins)} phút = ${F(mins)} : 60 = ${hrs} giờ.`, `${F(mins)} minutes = ${F(mins)} : 60 = ${hrs} hours.`)]));
      }
      const n = R(rng, 3, 8), per = R(rng, 9, 25), T = n * per, who = NC.name(rng);
      return Q(L(`Bạn ${who} đi bộ ${n} vòng quanh hồ hết ${dur(T)}. Hỏi trung bình mỗi vòng ${who} đi hết bao nhiêu phút?`,
        `${who} walks ${n} times round a lake in ${dur(T)}. On average, how many minutes does each lap take?`),
      num(per, L('phút', 'minutes')), lines([
        T >= 60 ? L(`Đổi: ${dur(T)} = ${T} phút.`, `${dur(T)} = ${T} minutes.`) : '',
        L(`Trung bình mỗi vòng hết: ${T} : ${n} = ${per} (phút).`, `Each lap on average: ${T} : ${n} = ${per} (minutes).`)]));
    } },

    // Cuboid volume in real jobs: water to fill a tank, a tap filling it, the water level, the weight of a concrete block
    { id: 'g5-nc-be-nuoc', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g5-c9-b52', gen: rng => {
      const f = R(rng, 0, 3);
      if (f < 2) {
        const dims = () => { const a = R(rng, 10, 30); return [a, R(rng, 8, a - 1), R(rng, 6, 15)]; };
        const [a, b, c, z] = f === 0 ? pick(() => dims().concat([5 * R(rng, 4, 16)]), v => (v[0] * v[1] * v[2] * v[3]) % 100 === 0, [20, 15, 12, 60])
          : pick(() => dims().concat([P(rng, [20, 25, 30, 40, 50, 60, 75, 80, 100, 120])]), v => (v[0] * v[1] * v[2]) % v[3] === 0, [20, 15, 12, 40]);
        const V = a * b * c, am = dec(a, 1), bm = dec(b, 1), cm = dec(c, 1);
        const head = L(`Một bể nước dạng hình hộp chữ nhật có chiều dài ${F(am)} m, chiều rộng ${F(bm)} m, chiều cao ${F(cm)} m.`, `A water tank is a cuboid ${F(am)} m long, ${F(bm)} m wide and ${F(cm)} m high.`);
        const s0 = L(`Đổi: ${F(am)} m = ${a} dm; ${F(bm)} m = ${b} dm; ${F(cm)} m = ${c} dm.`, `${F(am)} m = ${a} dm; ${F(bm)} m = ${b} dm; ${F(cm)} m = ${c} dm.`);
        const s1 = L(`Thể tích của bể là: ${a} × ${b} × ${c} = ${F(V)} (dm³) = ${F(V)} l.`, `Volume of the tank: ${a} × ${b} × ${c} = ${F(V)} (dm³) = ${F(V)} l.`);
        if (f === 0) {
          const W = V * z / 100, X = V - W;
          return Q(L(`${head} Lượng nước trong bể đang chiếm ${z}% thể tích của bể. Hỏi cần đổ thêm bao nhiêu lít nước nữa thì đầy bể? (1 dm³ = 1 l)`,
            `${head} The water in it fills ${z}% of the tank. How many more litres of water are needed to fill the tank? (1 dm³ = 1 l)`),
          num(X, 'l'), lines([s0, s1,
            L(`Lượng nước đang có trong bể là: ${F(V)} × ${z} : 100 = ${F(W)} (l).`, `Water in the tank now: ${F(V)} × ${z} : 100 = ${F(W)} (l).`),
            L(`Cần đổ thêm: ${F(V)} ${M} ${F(W)} = ${F(X)} (l).`, `Water still needed: ${F(V)} ${M} ${F(W)} = ${F(X)} (l).`)]));
        }
        const t = V / z;
        return Q(L(`${head} Lúc đầu bể không có nước. Người ta mở một vòi nước chảy vào bể, mỗi phút chảy được ${z} l. Hỏi sau bao nhiêu phút thì bể đầy nước? (1 dm³ = 1 l)`,
          `${head} It is empty. A tap fills it with ${z} l of water a minute. How many minutes does it take to fill the tank? (1 dm³ = 1 l)`),
        num(t, L('phút', 'minutes')), lines([s0, s1, L(`Thời gian để vòi chảy đầy bể là: ${F(V)} : ${z} = ${F(t)} (phút).`, `Time to fill the tank: ${F(V)} : ${z} = ${F(t)} (minutes).`)]));
      }
      if (f === 2) {
        const a = 10 * R(rng, 4, 10), b = 5 * R(rng, 5, 10), c = 10 * R(rng, 3, 6), h = R(rng, 10, c - 5), W = rd(a * b * h / 1000), base = a * b;
        return Q(L(`Một bể cá dạng hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Người ta đổ vào bể ${F(W)} l nước. Hỏi mặt nước cách miệng bể bao nhiêu xăng-ti-mét?`,
          `A fish tank is a cuboid ${a} cm long, ${b} cm wide and ${c} cm high. ${F(W)} l of water is poured into it. How many centimetres below the top of the tank is the water?`),
        num(c - h, 'cm'), lines([
          L(`Đổi: ${F(W)} l = ${F(W)} dm³ = ${F(a * b * h)} cm³.`, `${F(W)} l = ${F(W)} dm³ = ${F(a * b * h)} cm³.`),
          L(`Diện tích đáy bể là: ${a} × ${b} = ${F(base)} (cm²).`, `Area of the base: ${a} × ${b} = ${F(base)} (cm²).`),
          L(`Chiều cao mực nước là: ${F(a * b * h)} : ${F(base)} = ${h} (cm).`, `Height of the water: ${F(a * b * h)} : ${F(base)} = ${h} (cm).`),
          L(`Mặt nước cách miệng bể: ${c} ${M} ${h} = ${c - h} (cm).`, `Distance from the water to the top: ${c} ${M} ${h} = ${c - h} (cm).`)]),
        { hint: L('Chiều cao mực nước = thể tích nước : diện tích đáy.', 'Height of the water = volume of water : area of the base.') });
      }
      const [a, b, hc, rho] = pick(() => [dec(R(rng, 10, 40), 1), dec(R(rng, 3, 10), 1), 10 * R(rng, 2, 8), P(rng, [2.2, 2.4, 2.5])], v => ok3(rd(v[0] * v[1] * v[2] / 100) * v[3]), [2, 0.5, 40, 2.4]);
      const hm2 = dec(hc, 2), V = rd(a * b * hm2), t = rd(V * rho);
      return Q(L(`Một khối bê tông dạng hình hộp chữ nhật có chiều dài ${F(a)} m, chiều rộng ${F(b)} m, chiều cao ${hc} cm. Mỗi mét khối bê tông nặng ${F(rho)} tấn. Hỏi khối bê tông đó nặng bao nhiêu tấn?`,
        `A concrete block is a cuboid ${F(a)} m long, ${F(b)} m wide and ${hc} cm high. Each cubic metre of concrete weighs ${F(rho)} tonnes. How many tonnes does the block weigh?`),
      num(t, TON), lines([
        L(`Đổi: ${hc} cm = ${F(hm2)} m.`, `${hc} cm = ${F(hm2)} m.`),
        L(`Thể tích khối bê tông là: ${F(a)} × ${F(b)} × ${F(hm2)} = ${F(V)} (m³).`, `Volume of the block: ${F(a)} × ${F(b)} × ${F(hm2)} = ${F(V)} (m³).`),
        L(`Khối bê tông nặng: ${F(V)} × ${F(rho)} = ${F(t)} (tấn).`, `Weight of the block: ${F(V)} × ${F(rho)} = ${F(t)} (tonnes).`)]));
    } },

    // Cubes: volume from the surface area, a cube with edges made longer, weight of a metal cube, small cubes in a box
    { id: 'g5-nc-lap-phuong', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g5-c9-b53', gen: rng => {
      const f = R(rng, 0, 3);
      if (f === 0) {
        const a = R(rng, 2, 12), u = P(rng, ['cm', 'dm']), lat = R(rng, 0, 1) === 1, faces = lat ? 4 : 6, S = a * a * faces;
        return Q(L(`Một hình lập phương có diện tích ${lat ? 'xung quanh' : 'toàn phần'} là ${S} ${u}². Tính thể tích hình lập phương đó.`,
          `A cube has a ${lat ? 'lateral' : 'total'} surface area of ${S} ${u}². Find its volume.`),
        num(a * a * a, `${u}³`), lines([
          L(`Diện tích một mặt là: ${S} : ${faces} = ${a * a} (${u}²).`, `Area of one face: ${S} : ${faces} = ${a * a} (${u}²).`),
          L(`Vì ${a} × ${a} = ${a * a} nên cạnh hình lập phương dài ${a} ${u}.`, `Since ${a} × ${a} = ${a * a}, the edge of the cube is ${a} ${u}.`),
          L(`Thể tích hình lập phương là: ${a} × ${a} × ${a} = ${F(a * a * a)} (${u}³).`, `Volume of the cube: ${a} × ${a} × ${a} = ${F(a * a * a)} (${u}³).`)]),
        { hint: L(`Hình lập phương có ${faces} mặt ${lat ? 'xung quanh' : ''} là các hình vuông bằng nhau.`.replace('  ', ' '), `The ${faces} ${lat ? 'side ' : ''}faces of a cube are equal squares.`) });
      }
      if (f === 1) {
        const a = R(rng, 2, 10), [k, kv, ke] = P(rng, [[2, 'gấp đôi', 'twice'], [3, 'gấp ba', 'three times']]), b = a * k, V1 = a ** 3, V2 = b ** 3, more = R(rng, 0, 1) === 1;
        return Q(more ? L(`Một hình lập phương có cạnh ${a} cm. Nếu tăng cạnh lên ${kv} thì thể tích hình lập phương tăng thêm bao nhiêu xăng-ti-mét khối?`,
          `A cube has ${a} cm edges. If each edge becomes ${ke} as long, by how many cubic centimetres does its volume increase?`)
          : L(`Một hình lập phương có cạnh ${a} cm. Nếu tăng cạnh lên ${kv} thì thể tích hình lập phương mới gấp bao nhiêu lần thể tích hình lập phương ban đầu?`,
            `A cube has ${a} cm edges. If each edge becomes ${ke} as long, how many times the original volume is the new volume?`),
        more ? num(V2 - V1, 'cm³') : num(k ** 3, L('lần', 'times')), lines([
          L(`Cạnh hình lập phương mới là: ${a} × ${k} = ${b} (cm).`, `New edge: ${a} × ${k} = ${b} (cm).`),
          L(`Thể tích ban đầu là: ${a} × ${a} × ${a} = ${F(V1)} (cm³); thể tích mới là: ${b} × ${b} × ${b} = ${F(V2)} (cm³).`, `Original volume: ${a} × ${a} × ${a} = ${F(V1)} (cm³); new volume: ${b} × ${b} × ${b} = ${F(V2)} (cm³).`),
          more ? L(`Thể tích tăng thêm: ${F(V2)} ${M} ${F(V1)} = ${F(V2 - V1)} (cm³).`, `Increase: ${F(V2)} ${M} ${F(V1)} = ${F(V2 - V1)} (cm³).`)
            : L(`${F(V2)} : ${F(V1)} = ${k ** 3} (lần).`, `${F(V2)} : ${F(V1)} = ${k ** 3}.`)]));
      }
      if (f === 2) {
        const [mV, mE, rho] = P(rng, [['sắt', 'iron', 7.8], ['nhôm', 'aluminium', 2.7], ['đồng', 'copper', 8.9]]), e = R(rng, 4, 15), V = e ** 3, g = rd(V * rho), kg = rd(g / 1000), inKg = ok3(kg);
        return Q(L(`Một khối ${mV} có dạng hình lập phương có cạnh ${F(dec(e, 1))} dm. Mỗi xăng-ti-mét khối ${mV} nặng ${F(rho)} g. Hỏi khối ${mV} đó nặng bao nhiêu ${inKg ? 'ki-lô-gam' : 'gam'}?`,
          `A block of ${mE} is a cube with ${F(dec(e, 1))} dm edges. Each cubic centimetre of ${mE} weighs ${F(rho)} g. How many ${inKg ? 'kilograms' : 'grams'} does the block weigh?`),
        num(inKg ? kg : g, inKg ? 'kg' : 'g'), lines([
          L(`Đổi: ${F(dec(e, 1))} dm = ${e} cm.`, `${F(dec(e, 1))} dm = ${e} cm.`),
          L(`Thể tích khối ${mV} là: ${e} × ${e} × ${e} = ${F(V)} (cm³).`, `Volume of the block: ${e} × ${e} × ${e} = ${F(V)} (cm³).`),
          L(`Khối ${mV} nặng: ${F(V)} × ${F(rho)} = ${F(g)} (g)${inKg ? ` = ${F(kg)} kg` : ''}.`, `Weight of the block: ${F(V)} × ${F(rho)} = ${F(g)} (g)${inKg ? ` = ${F(kg)} kg` : ''}.`)]));
      }
      const s = P(rng, [2, 3, 4, 5]), n1 = R(rng, 3, 8), n2 = R(rng, 2, n1), n3 = R(rng, 2, 6), A = s * n1, B = s * n2, C = s * n3, V = A * B * C, v = s ** 3;
      return Q(L(`Một cái hộp dạng hình hộp chữ nhật có chiều dài ${A} cm, chiều rộng ${B} cm, chiều cao ${C} cm. Người ta xếp các khối lập phương cạnh ${s} cm vào đầy hộp. Hỏi xếp được bao nhiêu khối lập phương?`,
        `A box is a cuboid ${A} cm long, ${B} cm wide and ${C} cm high. It is filled with cubes with ${s} cm edges. How many cubes fit in the box?`),
      num(V / v), lines([
        L(`Thể tích cái hộp là: ${A} × ${B} × ${C} = ${F(V)} (cm³).`, `Volume of the box: ${A} × ${B} × ${C} = ${F(V)} (cm³).`),
        L(`Thể tích một khối lập phương là: ${s} × ${s} × ${s} = ${v} (cm³).`, `Volume of one cube: ${s} × ${s} × ${s} = ${v} (cm³).`),
        L(`Số khối lập phương xếp được là: ${F(V)} : ${v} = ${V / v} (khối).`, `Number of cubes: ${F(V)} : ${v} = ${V / v}.`)]));
    } },

    // Pie chart data: the missing slice (in words), or how many more pupils chose one thing (with the chart)
    { id: 'g5-nc-quat', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g5-c11-b64', gen: rng => {
      const [subj, labs] = P(rng, [
        [L('môn thể thao yêu thích', 'favourite sport'), L(['bóng đá', 'cầu lông', 'bơi', 'cờ vua'], ['football', 'badminton', 'swimming', 'chess'])],
        [L('loại quả yêu thích', 'favourite fruit'), L(['táo', 'cam', 'xoài', 'nho'], ['apples', 'oranges', 'mangoes', 'grapes'])],
        [L('cách đến trường', 'way of getting to school'), L(['đi bộ', 'xe đạp', 'xe buýt', 'bố mẹ đưa'], ['walking', 'cycling', 'bus', 'taken by parents'])],
        [L('hoạt động yêu thích', 'favourite activity'), L(['đọc sách', 'vẽ', 'ca hát', 'đá cầu'], ['reading', 'drawing', 'singing', 'shuttlecock kicking'])]]);
      const k = R(rng, 3, 4), lab = labs.slice(0, k);
      const pcs = pick(() => { const a = []; for (let j = 0; j < k - 1; j++) a.push(5 * R(rng, 2, 9)); a.push(100 - a.reduce((x, y) => x + y, 0)); return a; },
        a => a[k - 1] >= 10 && new Set(a).size === k, k === 3 ? [45, 30, 25] : [40, 25, 20, 15]);
      const N = 20 * R(rng, 2, 20), cnt = pcs.map(p => N * p / 100), f = R(rng, 0, 1);
      if (f === 0) {
        const known = lab.slice(0, k - 1).map((l, j) => L(`${l} chiếm ${pcs[j]}%`, `${l} ${pcs[j]}%`)).join(', ');
        return Q(L(`Kết quả điều tra về ${subj} của ${N} học sinh được biểu diễn bằng biểu đồ hình quạt tròn: ${known}, còn lại là ${lab[k - 1]}. Hỏi có bao nhiêu học sinh chọn ${lab[k - 1]}?`,
          `A pie chart shows the results of a survey of ${N} pupils about their ${subj}: ${known}, and the rest ${lab[k - 1]}. How many pupils chose ${lab[k - 1]}?`),
        num(cnt[k - 1]), lines([
          L(`${cap(lab[k - 1])} chiếm: 100% ${pcs.slice(0, k - 1).map(p => `${M} ${p}%`).join(' ')} = ${pcs[k - 1]}%.`, `${cap(lab[k - 1])}: 100% ${pcs.slice(0, k - 1).map(p => `${M} ${p}%`).join(' ')} = ${pcs[k - 1]}%.`),
          L(`Số học sinh chọn ${lab[k - 1]} là: ${N} × ${pcs[k - 1]} : 100 = ${cnt[k - 1]} (học sinh).`, `Pupils who chose ${lab[k - 1]}: ${N} × ${pcs[k - 1]} : 100 = ${cnt[k - 1]}.`)]),
        { hint: L('Cả hình tròn là 100%.', 'The whole circle is 100%.') });
      }
      const order = pcs.map((p, j) => j).sort((x, y) => pcs[y] - pcs[x]), ia = order[0], ib = order[R(rng, 1, k - 1)], d = cnt[ia] - cnt[ib];
      return Q(L(`Biểu đồ hình quạt tròn dưới đây cho biết kết quả điều tra về ${subj} của ${N} học sinh. Hỏi số học sinh chọn ${lab[ia]} nhiều hơn số học sinh chọn ${lab[ib]} bao nhiêu bạn?`,
        `The pie chart below shows the results of a survey of ${N} pupils about their ${subj}. How many more pupils chose ${lab[ia]} than ${lab[ib]}?`),
      num(d), lines([
        L(`Số học sinh chọn ${lab[ia]} là: ${N} × ${pcs[ia]} : 100 = ${cnt[ia]} (bạn).`, `Pupils who chose ${lab[ia]}: ${N} × ${pcs[ia]} : 100 = ${cnt[ia]}.`),
        L(`Số học sinh chọn ${lab[ib]} là: ${N} × ${pcs[ib]} : 100 = ${cnt[ib]} (bạn).`, `Pupils who chose ${lab[ib]}: ${N} × ${pcs[ib]} : 100 = ${cnt[ib]}.`),
        L(`Nhiều hơn: ${cnt[ia]} ${M} ${cnt[ib]} = ${d} (bạn).`, `Difference: ${cnt[ia]} ${M} ${cnt[ib]} = ${d}.`)]),
      { visual: { type: 'pieChart', params: { labels: lab.map(cap), percents: pcs } } });
    } },
  ]);
})();
