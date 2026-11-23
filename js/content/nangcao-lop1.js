/* Toán ISA — bài nâng cao lớp 1 (Đề nâng cao). Contract: NANGCAO.md.
 * Lớp 1 limits: numbers to 100; học kì I + / − within 10, học kì II + / − without carrying (không nhớ) within 100;
 * one calculation per problem. Harder through the way it is put (types from real KNTT school papers): the missing
 * number (also the minuend, and 0), two conditions, the greatest / smallest number that fits, position in a row,
 * working backwards, number cards, round tens in a range, yesterday / tomorrow, calculations from left to right.
 */
(function () {
  'use strict';
  const L = NC.L, R = NC.R, P = NC.P, M = NC.M, EN = U.EN;
  const ord = d => d + (d % 10 === 1 && d % 100 !== 11 ? 'st' : d % 10 === 2 && d % 100 !== 12 ? 'nd' : d % 10 === 3 && d % 100 !== 13 ? 'rd' : 'th');
  const pl = (n, sg, p) => `${n} ${n === 1 ? sg : p}`;
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const range = (a, b) => { const out = []; for (let x = a; x <= b; x++) out.push(x); return out; };
  // as the lớp 1 lessons write them (Thứ Hai … Chủ nhật)
  const DAYS = EN ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const day = k => DAYS[((k % 7) + 7) % 7];
  // lớp 1 học kì II: no carrying, no borrowing, results below 100
  const noCarry = (a, b) => a % 10 + b % 10 < 10 && a + b < 100;
  const noBorrow = (a, b) => a >= b && a % 10 >= b % 10;
  // draw until ok(v) (the same rng gives the same result); fb when nothing fits
  function draw(make, ok, fb) { for (let g = 0; g < 400; g++) { const v = make(); if (ok(v)) return v; } return fb; }
  // a row of children: ● is the child asked about
  const row = (n, k) => range(1, n).map(j => (j === k ? '●' : '○')).join(' ');

  // the column steps of a sum, as the lessons say them ("6 − 6 = 0, viết 0; 8 − 5 = 3, viết 3")
  function colSteps(a, b, op) {
    const da = String(a).split('').reverse().map(Number), db = String(b).split('').reverse().map(Number);
    const n = Math.max(da.length, db.length), vi = [], en = [];
    let c = 0, r = 0;
    for (let i = 0; i < n; i++) {
      const top = i === n - 1;
      if (op === '+') {
        const x = da[i], y = db[i];
        if (x == null || y == null) {
          const d = x == null ? y : x, t = d + c;
          if (!c) { vi.push(`hạ ${d}`); en.push(`bring down ${d}`); } else { vi.push(`${d} thêm 1 là ${t}, viết ${t}`); en.push(`${d} + 1 = ${t}, write ${t}`); }
          c = 0; continue;
        }
        const s = x + y, t = s + c, carry = t >= 10 && !top;
        vi.push(`${x} + ${y} = ${s}${c ? `, thêm 1 là ${t}` : ''}${carry ? `, viết ${t % 10} nhớ 1` : `, viết ${t}`}`);
        en.push(`${x} + ${y} = ${s}${c ? `, plus 1 is ${t}` : ''}${carry ? `, write ${t % 10} and carry 1` : `, write ${t}`}`);
        c = carry ? 1 : 0;
      } else {
        const x = da[i], y = db[i];
        if (y == null && !c) { vi.push(`hạ ${x}`); en.push(`bring down ${x}`); continue; }
        const yy = (y == null ? 0 : y) + c, pre = y != null && c ? [`${y} thêm 1 là ${yy}, `, `${y} + 1 = ${yy}, `] : ['', ''];
        if (x >= yy) {
          r = x - yy;
          const lead = r === 0 && i >= String(a - b).length;
          vi.push(`${pre[0]}${x} ${M} ${yy} = ${r}${lead ? ', không viết 0 ở đầu' : `, viết ${r}`}`);
          en.push(`${pre[1]}${x} ${M} ${yy} = ${r}${lead ? ', no 0 is written in front' : `, write ${r}`}`);
          c = 0;
        } else {
          r = 10 + x - yy;
          vi.push(`${pre[0]}${x} không trừ được ${yy}, lấy 1${x} ${M} ${yy} = ${r}, viết ${r} nhớ 1`);
          en.push(`${pre[1]}you cannot take ${yy} from ${x}, so 1${x} ${M} ${yy} = ${r}, write ${r} and carry 1`);
          c = 1;
        }
      }
    }
    const res = op === '+' ? a + b : a - b;
    return L(`Tính từ phải sang trái: ${vi.join('; ')}. Vậy ${a} ${op} ${b} = ${res}.`, `Work from right to left: ${en.join('; ')}. So ${a} ${op} ${b} = ${res}.`);
  }
  const dt = (a, b, op) => NC.dt(a, b, op, op === '+' ? a + b : a - b, colSteps(a, b, op));

  NC.add(1, [
    /* ================= học kì I (cuoi-hk1): numbers and + / − within 10 ================= */

    // "….. − 5 = 4", "10 − ….. = 10": the missing number, also the minuend and the zero
    { id: 'g1-nc-so-thieu', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g1-c3-b12', gen: rng => {
      const f = P(rng, [0, 0, 1, 1, 2, 3]);
      let expr, v, ex;
      if (f === 0) {
        const b = R(rng, 1, 9), c = R(rng, 0, 10 - b);
        v = b + c; expr = `? ${M} ${b} = ${c}`;
        ex = L(`Vì ${c} + ${b} = ${v} nên ${v} ${M} ${b} = ${c}. Số cần điền là ${v}.`, `${c} + ${b} = ${v}, so ${v} ${M} ${b} = ${c}. The missing number is ${v}.`);
      } else if (f === 1) {
        const a = R(rng, 3, 10), t = R(rng, 0, 2), c = t === 0 ? a : t === 1 ? 0 : R(rng, 1, a - 1);
        v = a - c; expr = `${a} ${M} ? = ${c}`;
        ex = t === 0 ? L(`Một số trừ đi 0 thì bằng chính số đó: ${a} ${M} 0 = ${a}. Số cần điền là 0.`, `Taking away 0 leaves a number the same: ${a} ${M} 0 = ${a}. The missing number is 0.`)
          : t === 1 ? L(`Một số trừ đi chính nó thì bằng 0: ${a} ${M} ${a} = 0. Số cần điền là ${a}.`, `A number take away itself is 0: ${a} ${M} ${a} = 0. The missing number is ${a}.`)
            : L(`Vì ${c} + ${v} = ${a} nên ${a} ${M} ${v} = ${c}. Số cần điền là ${v}.`, `${c} + ${v} = ${a}, so ${a} ${M} ${v} = ${c}. The missing number is ${v}.`);
      } else if (f === 2) {
        const s = R(rng, 3, 10), b = R(rng, 1, s - 1);
        v = s - b; expr = `? + ${b} = ${s}`;
        ex = L(`${s} ${M} ${b} = ${v}, và ${v} + ${b} = ${s}. Số cần điền là ${v}.`, `${s} ${M} ${b} = ${v}, and ${v} + ${b} = ${s}. The missing number is ${v}.`);
      } else {
        const a = R(rng, 1, 9), zero = R(rng, 0, 2) === 0, s = zero ? a : R(rng, a + 1, 10);
        v = s - a; expr = `${a} + ? = ${s}`;
        ex = zero ? L(`Một số cộng với 0 thì bằng chính số đó: ${a} + 0 = ${a}. Số cần điền là 0.`, `Adding 0 leaves a number the same: ${a} + 0 = ${a}. The missing number is 0.`)
          : L(`${s} ${M} ${a} = ${v}, và ${a} + ${v} = ${s}. Số cần điền là ${v}.`, `${s} ${M} ${a} = ${v}, and ${a} + ${v} = ${s}. The missing number is ${v}.`);
      }
      return NC.Q(L(`Số?\n${expr}`, `Find the missing number:\n${expr}`), NC.num(v), ex,
        { hint: L('Dựa vào bảng cộng, bảng trừ trong phạm vi 10. Thử lại sau khi điền.', 'Use the addition and subtraction facts within 10. Check your answer in the calculation.') });
    } },

    // "những số vừa lớn hơn 3, vừa bé hơn 9 là": two conditions; counting from 0 is the trap
    { id: 'g1-nc-hai-dieu-kien', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g1-c1-b4', gen: rng => {
      const f = P(rng, [0, 0, 1, 2]), x = NC.name(rng);
      if (f === 0) {
        const a = R(rng, 0, 6), b = R(rng, a + 3, 10), list = range(a + 1, b - 1);
        return NC.Q(L(`Có bao nhiêu số vừa lớn hơn ${a}, vừa bé hơn ${b}?`, `How many numbers are greater than ${a} and also smaller than ${b}?`), NC.num(list.length),
          L(`Các số vừa lớn hơn ${a}, vừa bé hơn ${b} là: ${list.join(', ')}. Có ${list.length} số.`, `The numbers greater than ${a} and smaller than ${b} are ${list.join(', ')}. There are ${list.length} numbers.`),
          { hint: L(`Viết các số từ ${a} đến ${b}, bỏ số ${a} và số ${b}.`, `Write the numbers from ${a} to ${b}, then leave out ${a} and ${b}.`) });
      }
      if (f === 1) {
        if (R(rng, 0, 1)) {
          const b = R(rng, 3, 9), list = range(0, b - 1);
          return NC.Q(L(`Trong các số từ 0 đến 10, có bao nhiêu số bé hơn ${b}?`, `Of the numbers from 0 to 10, how many are smaller than ${b}?`), NC.num(b),
            L(`Các số bé hơn ${b} là: ${list.join(', ')}. Có ${b} số (nhớ đếm cả số 0).`, `The numbers smaller than ${b} are ${list.join(', ')}. There are ${b} numbers (remember to count 0).`));
        }
        const a = R(rng, 1, 7), list = range(a + 1, 10);
        return NC.Q(L(`Trong các số từ 0 đến 10, có bao nhiêu số lớn hơn ${a}?`, `Of the numbers from 0 to 10, how many are greater than ${a}?`), NC.num(list.length),
          L(`Các số lớn hơn ${a} là: ${list.join(', ')}. Có ${list.length} số (nhớ đếm cả số 10).`, `The numbers greater than ${a} are ${list.join(', ')}. There are ${list.length} numbers (remember to count 10).`));
      }
      const a = R(rng, 0, 8);
      return NC.Q(L(`${x} nghĩ một số. Số đó lớn hơn ${a} nhưng bé hơn ${a + 2}. ${x} đã nghĩ số nào?`, `${x} thinks of a number. It is greater than ${a} but smaller than ${a + 2}. Which number is it?`), NC.num(a + 1),
        L(`Số lớn hơn ${a} và bé hơn ${a + 2} chỉ có ${a + 1}: ${a} < ${a + 1} < ${a + 2}.`, `The only number greater than ${a} and smaller than ${a + 2} is ${a + 1}: ${a} < ${a + 1} < ${a + 2}.`));
    } },

    // "đứng thứ mấy từ trái / phải": position in a row (draw the row to see it)
    { id: 'g1-nc-xep-hang', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g1-c4-b15', gen: rng => {
      const f = R(rng, 0, 2), x = NC.name(rng), kids = n => L(`${n} bạn`, pl(n, 'child', 'children'));
      if (f === 0) {
        const n = R(rng, 5, 10), k = R(rng, 2, n - 1), r = n - k + 1, fromLeft = R(rng, 0, 1) === 1;
        const [s1, s2, e1, e2] = fromLeft ? ['trái', 'phải', 'left', 'right'] : ['phải', 'trái', 'right', 'left'];
        const pic = fromLeft ? row(n, k) : row(n, r);
        return NC.Q(L(`Có ${n} bạn xếp thành một hàng ngang. ${x} đứng thứ ${k} tính từ bên ${s1}. Hỏi ${x} đứng thứ mấy tính từ bên ${s2}?`, `${n} children stand in a row. ${x} is ${ord(k)} from the ${e1}. What position is ${x} from the ${e2}?`),
          NC.num(r), L(`Vẽ hàng ${n} bạn, ${x} là ●: ${pic}. Đếm từ bên ${s2} sang, ${x} đứng thứ ${r}.`, `Draw the row of ${n} children, with ${x} as ●: ${pic}. Counting from the ${e2}, ${x} is ${ord(r)}.`),
          { hint: L('Vẽ các bạn bằng những hình tròn rồi đếm.', 'Draw the children as circles, then count.') });
      }
      if (f === 1) {
        const k = R(rng, 2, 6), j = R(rng, 2, 11 - k), n = k + j - 1;
        return NC.Q(L(`Trong một hàng ngang, ${x} đứng thứ ${k} tính từ bên trái và đứng thứ ${j} tính từ bên phải. Hỏi hàng đó có mấy bạn?`, `In a row of children, ${x} is ${ord(k)} from the left and ${ord(j)} from the right. How many children are in the row?`),
          NC.num(n, L('bạn', 'children')),
          L(`Vẽ hàng, ${x} là ●: ${row(n, k)}. Bên trái ${x} có ${k - 1} bạn, bên phải có ${j - 1} bạn. Đếm cả ${x}: hàng có ${n} bạn.`, `Draw the row, with ${x} as ●: ${row(n, k)}. There ${k - 1 === 1 ? 'is' : 'are'} ${kids(k - 1)} to the left of ${x} and ${kids(j - 1)} to the right. Count ${x} too: there are ${n} children in the row.`),
          { hint: L('Vẽ các bạn bằng những hình tròn. Đừng quên đếm cả bạn ấy.', 'Draw the children as circles. Do not forget to count that child too.') });
      }
      const a = R(rng, 1, 6), b = R(rng, 1, 9 - a), n = a + b + 1;
      const pic = `${'○ '.repeat(a)}● ${'○ '.repeat(b)}`.trim();
      return NC.Q(L(`Các bạn xếp một hàng dọc. Đứng trước ${x} có ${a} bạn, đứng sau ${x} có ${b} bạn. Hỏi hàng dọc đó có tất cả mấy bạn?`, `Some children stand in a queue. There ${a === 1 ? 'is' : 'are'} ${kids(a)} in front of ${x} and ${kids(b)} behind ${x}. How many children are in the queue altogether?`),
        NC.num(n, L('bạn', 'children')),
        L(`Vẽ hàng, ${x} là ●: ${pic}. Có ${a} bạn đứng trước, ${x}, và ${b} bạn đứng sau. Đếm tất cả được ${n} bạn (nhớ đếm cả ${x}).`, `Draw the queue, with ${x} as ●: ${pic}. ${cap(kids(a))} in front, ${x}, and ${kids(b)} behind. Counting them all gives ${n} children (remember to count ${x}).`));
    } },

    // working backwards: "lúc đầu có mấy…", "bay đi mấy con…" (one calculation within 10)
    { id: 'g1-nc-luc-dau', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g1-c3-b12', gen: rng => {
      const f = R(rng, 0, 3), x = NC.name(rng);
      if (f === 0) {
        const b = R(rng, 1, 5), s = R(rng, b + 2, 10), v = s - b;
        return NC.Q(L(`${x} có một số viên bi. Anh cho ${x} thêm ${b} viên bi thì ${x} có tất cả ${s} viên bi. Hỏi lúc đầu ${x} có mấy viên bi?`, `${x} has some marbles. ${x}’s big brother gives ${x} ${b} more, and now ${x} has ${s} marbles. How many marbles did ${x} have at first?`),
          NC.num(v, L('viên bi', 'marbles')), L(`Lúc đầu có một số viên bi, thêm ${b} viên thì được ${s} viên. Ta tính: ${s} ${M} ${b} = ${v}. Lúc đầu ${x} có ${v} viên bi.`, `Some marbles and ${b} more make ${s}. So we work out ${s} ${M} ${b} = ${v}. At first ${x} had ${v} marbles.`),
          { hint: L('Bớt đi số viên bi được cho thêm.', 'Take away the marbles that were given.') });
      }
      if (f === 1) {
        const s = R(rng, 4, 10), c = R(rng, 1, s - 2), v = s - c;
        return NC.Q(L(`Trên cành cây có ${s} con chim. Một số con bay đi, trên cành còn lại ${c} con. Hỏi có mấy con chim đã bay đi?`, `There are ${s} birds on a branch. Some fly away and ${c} ${c === 1 ? 'is' : 'are'} left. How many birds flew away?`),
          NC.num(v, L('con chim', 'birds')), L(`Có ${s} con, còn lại ${c} con. Số con bay đi là: ${s} ${M} ${c} = ${v}.`, `There were ${s} birds and ${c} ${c === 1 ? 'is' : 'are'} left. The birds that flew away: ${s} ${M} ${c} = ${v}.`));
      }
      if (f === 2) {
        const b = R(rng, 1, 5), c = R(rng, 1, 10 - b), v = b + c;
        return NC.Q(L(`${x} có một số quả bóng bay. ${x} cho em ${b} quả thì còn lại ${c} quả. Hỏi lúc đầu ${x} có mấy quả bóng bay?`, `${x} has some balloons. ${x} gives ${b} to a little sister and has ${c} left. How many balloons did ${x} have at first?`),
          NC.num(v, L('quả bóng bay', 'balloons')), L(`Cho đi ${b} quả, còn lại ${c} quả. Lúc đầu ${x} có: ${c} + ${b} = ${v} (quả bóng bay).`, `${x} gave away ${b} and has ${c} left. At first ${x} had ${c} + ${b} = ${v} balloons.`),
          { hint: L('Số bóng lúc đầu gồm số bóng đã cho và số bóng còn lại.', 'The balloons at first are the ones given away and the ones left.') });
      }
      const a = R(rng, 1, 8), s = R(rng, a + 2, 10), v = s - a;
      return NC.Q(L(`Trong bể có ${a} con cá. Mẹ thả thêm vào bể một số con cá thì trong bể có ${s} con cá. Hỏi mẹ đã thả thêm mấy con cá?`, `There ${a === 1 ? 'is' : 'are'} ${pl(a, 'fish', 'fish')} in a tank. Mum puts in some more, and now there are ${s} fish. How many fish did Mum put in?`),
        NC.num(v, L('con cá', 'fish')), L(`Có ${a} con, thêm một số con thì được ${s} con. Số cá thả thêm là: ${s} ${M} ${a} = ${v}.`, `${a} fish and some more make ${s}. The fish put in: ${s} ${M} ${a} = ${v}.`));
    } },

    // "số lớn nhất điền vào ô trống: 3 + … < 8": try the numbers in turn
    { id: 'g1-nc-dien-so', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g1-c3-b12', gen: rng => {
      const f = R(rng, 0, 2);
      const hint = L('Thử lần lượt từng số vào ô ?.', 'Try the numbers in the box one by one.');
      if (f === 0) {
        const a = R(rng, 1, 7), c = R(rng, a + 2, 10), v = c - a - 1;
        return NC.Q(L(`Số lớn nhất có thể điền vào ô ? là số nào?\n${a} + ? < ${c}`, `What is the greatest number that can go in the box?\n${a} + ? < ${c}`), NC.num(v),
          L(`${a} + ${v} = ${a + v} < ${c}, đúng. ${a} + ${v + 1} = ${c}, không bé hơn ${c}. Vậy số lớn nhất là ${v}.`, `${a} + ${v} = ${a + v} < ${c}, which is true. ${a} + ${v + 1} = ${c}, which is not smaller than ${c}. So the greatest number is ${v}.`), { hint });
      }
      if (f === 1) {
        const b = R(rng, 1, 6), c = R(rng, b, 9), v = c - b + 1;
        return NC.Q(L(`Số bé nhất có thể điền vào ô ? là số nào?\n? + ${b} > ${c}`, `What is the smallest number that can go in the box?\n? + ${b} > ${c}`), NC.num(v),
          L(`${v} + ${b} = ${c + 1} > ${c}, đúng. ${v - 1} + ${b} = ${c}, không lớn hơn ${c}. Vậy số bé nhất là ${v}.`, `${v} + ${b} = ${c + 1} > ${c}, which is true. ${v - 1} + ${b} = ${c}, which is not greater than ${c}. So the smallest number is ${v}.`), { hint });
      }
      const a = R(rng, 4, 10), c = R(rng, 0, a - 2), v = a - c - 1;
      return NC.Q(L(`Số lớn nhất có thể điền vào ô ? là số nào?\n${a} ${M} ? > ${c}`, `What is the greatest number that can go in the box?\n${a} ${M} ? > ${c}`), NC.num(v),
        L(`${a} ${M} ${v} = ${c + 1} > ${c}, đúng. ${a} ${M} ${v + 1} = ${c}, không lớn hơn ${c}. Vậy số lớn nhất là ${v}.`, `${a} ${M} ${v} = ${c + 1} > ${c}, which is true. ${a} ${M} ${v + 1} = ${c}, which is not greater than ${c}. So the greatest number is ${v}.`), { hint });
    } },

    // three numbers, four calculations: which one is right (or wrong)?
    { id: 'g1-nc-ba-so', from: 'cuoi-hk1', kinds: ['tn'], lesson: 'g1-c3-b12', gen: rng => {
      const [a, b] = draw(() => [R(rng, 1, 8), R(rng, 1, 8)], ([p, q]) => p !== q && p + q <= 10, [3, 5]);
      const c = a + b, lo = Math.min(a, b), hi = Math.max(a, b);
      const good = [`${a} + ${b} = ${c}`, `${b} + ${a} = ${c}`, `${c} ${M} ${a} = ${b}`, `${c} ${M} ${b} = ${a}`];
      const bad = [`${a} + ${c} = ${b}`, `${b} + ${c} = ${a}`, `${hi} ${M} ${lo} = ${c}`, `${c} + ${lo} = ${hi}`];
      const wrong = R(rng, 0, 2) === 0;
      const g1 = P(rng, good), b1 = P(rng, bad);
      const ans = wrong ? NC.ch(rng, b1, U.sample(rng, good, 3)) : NC.ch(rng, g1, U.sample(rng, bad, 3));
      return NC.Q(L(`Với ba số ${lo}, ${hi}, ${c}, phép tính nào ${wrong ? 'sai' : 'đúng'}?`, `Using the three numbers ${lo}, ${hi} and ${c}, which calculation is ${wrong ? 'wrong' : 'right'}?`), ans,
        L(`${a} + ${b} = ${c}, nên ${b} + ${a} = ${c}, ${c} ${M} ${a} = ${b} và ${c} ${M} ${b} = ${a}. ${wrong ? `Phép tính sai là ${b1}.` : `Phép tính đúng là ${g1}.`}`,
          `${a} + ${b} = ${c}, so ${b} + ${a} = ${c}, ${c} ${M} ${a} = ${b} and ${c} ${M} ${b} = ${a}. ${wrong ? `The wrong one is ${b1}.` : `The right one is ${g1}.`}`),
        { hint: L('Tính từng phép tính rồi so với kết quả đã viết.', 'Work out each calculation and compare it with the answer written.') });
    } },

    /* ================= cả năm (cuoi-nam): numbers to 100, + / − without carrying ================= */

    // "Cho các thẻ số 3, 0, 6 …": two-digit numbers from cards (the 0 cannot go first)
    { id: 'g1-nc-the-so', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g1-c6-b21', gen: rng => {
      const k = P(rng, [3, 3, 4]), zero = R(rng, 0, 1) === 1;
      const cards = U.shuffle(rng, (zero ? [0] : []).concat(U.sample(rng, range(1, 9), zero ? k - 1 : k)));
      const nums = [];
      for (const p of cards) for (const q of cards) if (p !== q && p !== 0) nums.push(p * 10 + q);
      nums.sort((x, y) => x - y);
      const f = k === 3 ? P(rng, ['max', 'min', 'count']) : P(rng, ['max', 'min']);
      const qv = { max: L('Số lớn nhất ghép được là số nào?', 'What is the greatest number you can make?'), min: L('Số bé nhất ghép được là số nào?', 'What is the smallest number you can make?'), count: L('Ghép được tất cả bao nhiêu số?', 'How many different numbers can you make?') }[f];
      const v = f === 'max' ? nums[nums.length - 1] : f === 'min' ? nums[0] : nums.length;
      const prompt = L(`Cho ${k} thẻ số: ${cards.join(', ')}. Dùng hai thẻ khác nhau ghép thành số có hai chữ số.\n${qv}`, `There are ${k} number cards: ${cards.join(', ')}. Put two different cards side by side to make a two-digit number.\n${qv}`);
      const z = zero ? L(' Thẻ số 0 không đứng ở hàng chục được.', ' The 0 card cannot go in the tens place.') : '';
      let ex;
      if (k === 3) {
        ex = L(`Các số ghép được là: ${nums.join(', ')}.${z} `, `The numbers you can make are ${nums.join(', ')}.${z} `)
          + (f === 'count' ? L(`Có ${v} số.`, `There are ${v} numbers.`) : L(`Số ${f === 'max' ? 'lớn nhất' : 'bé nhất'} là ${v}.`, `The ${f === 'max' ? 'greatest' : 'smallest'} is ${v}.`));
      } else if (f === 'max') {
        ex = L(`Thẻ lớn nhất ${Math.floor(v / 10)} làm chữ số hàng chục, thẻ lớn nhất còn lại ${v % 10} làm chữ số hàng đơn vị. Số lớn nhất là ${v}.`, `Put the greatest card, ${Math.floor(v / 10)}, in the tens place and the greatest card left, ${v % 10}, in the ones place. The greatest number is ${v}.`);
      } else {
        ex = L(`Chữ số hàng chục là thẻ bé nhất khác 0: ${Math.floor(v / 10)}; chữ số hàng đơn vị là thẻ bé nhất còn lại: ${v % 10}.${z} Số bé nhất là ${v}.`, `The tens digit is the smallest card that is not 0: ${Math.floor(v / 10)}. The ones digit is the smallest card left: ${v % 10}.${z} The smallest number is ${v}.`);
      }
      return NC.Q(prompt, NC.num(v), ex, { hint: L('Chữ số hàng chục viết trước, chữ số hàng đơn vị viết sau.', 'The tens digit comes first, then the ones digit.') });
    } },

    // "Từ 11 đến 34 có bao nhiêu số tròn chục?", the round ten just below / above, counting a range
    { id: 'g1-nc-tron-chuc', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g1-c6-b23', gen: rng => {
      const f = P(rng, [0, 0, 1, 2]);
      if (f === 0) {
        const a = R(rng, 0, 2) === 0 ? R(rng, 1, 5) * 10 : R(rng, 11, 59);
        const b = R(rng, 0, 2) === 0 ? Math.min(90, (Math.floor(a / 10) + R(rng, 2, 4)) * 10) : R(rng, a + 15, 99);
        const list = range(a, b).filter(x => x % 10 === 0);
        const ends = [a, b].filter(x => x % 10 === 0);
        return NC.Q(L(`Từ ${a} đến ${b} có bao nhiêu số tròn chục?`, `How many multiples of 10 are there from ${a} to ${b}?`), NC.num(list.length),
          L(`Các số tròn chục từ ${a} đến ${b} là: ${list.join(', ')}. Có ${list.length} số.${ends.length ? ` Nhớ đếm cả số ${ends.join(' và ')}.` : ''}`, `The multiples of 10 from ${a} to ${b} are ${list.join(', ')}. There ${list.length === 1 ? 'is 1' : `are ${list.length}`}.${ends.length ? ` Remember to count ${ends.join(' and ')}.` : ''}`),
          { hint: L('Số tròn chục có chữ số 0 ở hàng đơn vị: 10, 20, 30, …', 'A multiple of 10 has 0 ones: 10, 20, 30, …') });
      }
      if (f === 1) {
        const below = R(rng, 0, 1) === 1, n = R(rng, 0, 2) === 0 ? R(rng, 2, 8) * 10 : R(rng, 21, 88);
        if (below) {
          const v = n % 10 === 0 ? n - 10 : Math.floor(n / 10) * 10;
          return NC.Q(L(`Số tròn chục lớn nhất bé hơn ${n} là số nào?`, `What is the greatest multiple of 10 that is smaller than ${n}?`), NC.num(v),
            n % 10 === 0 ? L(`${n} là số tròn chục nhưng không bé hơn ${n}. Số tròn chục liền trước ${n} là ${v}.`, `${n} is a multiple of 10, but it is not smaller than ${n}. The multiple of 10 just before ${n} is ${v}.`)
              : L(`Các số tròn chục bé hơn ${n} là 10, …, ${v}. Số lớn nhất là ${v}.`, `The multiples of 10 smaller than ${n} are 10, …, ${v}. The greatest is ${v}.`));
        }
        const v = Math.floor(n / 10) * 10 + 10;
        return NC.Q(L(`Số tròn chục bé nhất lớn hơn ${n} là số nào?`, `What is the smallest multiple of 10 that is greater than ${n}?`), NC.num(v),
          n % 10 === 0 ? L(`${n} là số tròn chục nhưng không lớn hơn ${n}. Số tròn chục liền sau ${n} là ${v}.`, `${n} is a multiple of 10, but it is not greater than ${n}. The multiple of 10 just after ${n} is ${v}.`)
            : L(`Các số tròn chục lớn hơn ${n} là ${v}, ${v + 10 <= 90 ? `${v + 10}, …` : '…'}. Số bé nhất là ${v}.`, `The multiples of 10 greater than ${n} are ${v}, ${v + 10 <= 90 ? `${v + 10}, …` : '…'}. The smallest is ${v}.`));
      }
      const n = R(rng, 13, 29), v = n - 10;
      return NC.Q(L(`Có bao nhiêu số có hai chữ số bé hơn ${n}?`, `How many two-digit numbers are smaller than ${n}?`), NC.num(v),
        n <= 20 ? L(`Đó là các số 10, 11, …, ${n - 1}. Đếm được ${v} số.`, `They are 10, 11, …, ${n - 1}. That makes ${v} numbers.`)
          : L(`Đó là các số từ 10 đến ${n - 1}. Từ 10 đến 19 có 10 số, từ 20 đến ${n - 1} có ${n - 20} số: 10 + ${n - 20} = ${v}.`, `They are the numbers from 10 to ${n - 1}. From 10 to 19 there are 10 numbers, and from 20 to ${n - 1} there ${n - 20 === 1 ? 'is 1' : `are ${n - 20}`}: 10 + ${n - 20} = ${v}.`),
        { hint: L('Số có hai chữ số bé nhất là 10.', 'The smallest two-digit number is 10.') });
    } },

    // "Hôm qua là thứ ba ngày 6. Ngày mai là:" (two days apart), "Thứ Hai tuần sau là ngày mấy?"
    { id: 'g1-nc-thu-ngay', from: 'cuoi-nam', kinds: ['tn'], lesson: 'g1-c9-b35', gen: rng => {
      const f = P(rng, [0, 0, 1, 1, 2]);
      const opt = (k, d) => L(`${day(k)}, ngày ${d}`, `${day(k)} the ${ord(d)}`);
      if (f === 2) {
        const k = R(rng, 4, 6), t = R(rng, 0, 1), s = (t - k + 7) % 7, d = R(rng, 1, 28 - s), v = d + s;
        const steps = range(0, s).map(j => L(`${day(k + j)} ngày ${d + j}`, `${day(k + j)} the ${ord(d + j)}`)).join(', ');
        return NC.Q(L(`Hôm nay là ${day(k)} ngày ${d}. ${day(t)} tuần sau là ngày mấy?`, `Today is ${day(k)} the ${ord(d)}. What is the date on ${day(t)} next week?`), NC.num(v),
          L(`Đếm tiếp từng ngày: ${steps}. Vậy ${day(t)} tuần sau là ngày ${v}.`, `Count on day by day: ${steps}. So ${day(t)} next week is the ${ord(v)}.`),
          { hint: L('Mỗi ngày tiếp theo thì thứ và ngày đều thêm 1.', 'Each next day, the day of the week moves on one and the date goes up by 1.') });
      }
      const fwd = f === 0, k = R(rng, 0, 6), d = fwd ? R(rng, 1, 26) : R(rng, 3, 28), s = fwd ? 1 : -1;
      const good = opt(k + 2 * s, d + 2 * s);
      const ans = NC.ch(rng, good, [opt(k + s, d + s), opt(k + 2 * s, d + s), opt(k + s, d + 2 * s)]);
      return fwd
        ? NC.Q(L(`Hôm qua là ${day(k)} ngày ${d}. Ngày mai là:`, `Yesterday was ${day(k)} the ${ord(d)}. Tomorrow is:`), ans,
          L(`Hôm qua là ${day(k)} ngày ${d} thì hôm nay là ${day(k + 1)} ngày ${d + 1}, ngày mai là ${day(k + 2)} ngày ${d + 2}.`, `Yesterday was ${day(k)} the ${ord(d)}, so today is ${day(k + 1)} the ${ord(d + 1)} and tomorrow is ${day(k + 2)} the ${ord(d + 2)}.`),
          { hint: L('Tìm hôm nay trước: hôm nay là ngày ngay sau hôm qua.', 'Find today first: today is the day just after yesterday.') })
        : NC.Q(L(`Ngày mai là ${day(k)} ngày ${d}. Hôm qua là:`, `Tomorrow is ${day(k)} the ${ord(d)}. Yesterday was:`), ans,
          L(`Ngày mai là ${day(k)} ngày ${d} thì hôm nay là ${day(k - 1)} ngày ${d - 1}, hôm qua là ${day(k - 2)} ngày ${d - 2}.`, `Tomorrow is ${day(k)} the ${ord(d)}, so today is ${day(k - 1)} the ${ord(d - 1)} and yesterday was ${day(k - 2)} the ${ord(d - 2)}.`),
          { hint: L('Tìm hôm nay trước: hôm nay là ngày ngay trước ngày mai.', 'Find today first: today is the day just before tomorrow.') });
    } },

    // "82 − 10 − 51": two steps from left to right, no carrying at either step
    { id: 'g1-nc-tinh-lien', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g1-c8-b32', gen: rng => {
      const pick = (r, op) => (R(rng, 0, 1) ? R(rng, 1, 8) * 10 : R(rng, 11, op === '+' ? 88 : Math.max(11, r)));
      const ok = (r, op, b) => (op === '+' ? noCarry(r, b) : noBorrow(r, b));
      const t = draw(() => {
        const a = R(rng, 20, 99), o1 = P(rng, ['+', M]), b = pick(a, o1);
        const r1 = o1 === '+' ? a + b : a - b, o2 = o1 === '+' ? M : P(rng, ['+', M]), c = pick(r1, o2);
        return { a, o1, b, r1, o2, c, r2: o2 === '+' ? r1 + c : r1 - c };
      }, t => ok(t.a, t.o1, t.b) && ok(t.r1, t.o2, t.c) && t.r1 > 0 && t.r2 > 0 && t.b % 10 + t.c % 10 > 0, { a: 82, o1: M, b: 10, r1: 72, o2: M, c: 51, r2: 21 });
      const expr = `${t.a} ${t.o1} ${t.b} ${t.o2} ${t.c}`;
      return NC.Q(L(`Tính:\n${expr} = ?`, `Calculate:\n${expr} = ?`), NC.num(t.r2),
        L(`Tính lần lượt từ trái sang phải: ${t.a} ${t.o1} ${t.b} = ${t.r1}; ${t.r1} ${t.o2} ${t.c} = ${t.r2}. Vậy ${expr} = ${t.r2}.`, `Work from left to right: ${t.a} ${t.o1} ${t.b} = ${t.r1}, then ${t.r1} ${t.o2} ${t.c} = ${t.r2}. So ${expr} = ${t.r2}.`),
        { hint: L('Tính phép tính đầu trước, rồi lấy kết quả tính tiếp.', 'Do the first calculation, then go on from its answer.') });
    } },

    // the missing number within 100 ("? − 23 = 45"), no carrying
    { id: 'g1-nc-so-thieu-100', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g1-c8-b32', gen: rng => {
      const f = P(rng, [0, 0, 1, 2, 3]);
      const [p, q] = draw(() => [R(rng, 10, 80), R(rng, 0, 2) === 0 ? R(rng, 1, 8) * 10 : R(rng, 11, 80)], ([x, y]) => noCarry(x, y) && x + y >= 30 && x !== y, [23, 45]);
      const s = p + q;
      let expr, v, ex;
      if (f === 0) { expr = `? ${M} ${p} = ${q}`; v = s; ex = L(`Số cần điền bớt đi ${p} thì còn ${q}, nên số đó là ${q} + ${p} = ${s}. Thử lại: ${s} ${M} ${p} = ${q}.`, `Taking ${p} away from the missing number leaves ${q}, so it is ${q} + ${p} = ${s}. Check: ${s} ${M} ${p} = ${q}.`); }
      else if (f === 1) { expr = `${s} ${M} ? = ${q}`; v = p; ex = L(`Số cần điền là ${s} ${M} ${q} = ${p}. Thử lại: ${s} ${M} ${p} = ${q}.`, `The missing number is ${s} ${M} ${q} = ${p}. Check: ${s} ${M} ${p} = ${q}.`); }
      else if (f === 2) { expr = `? + ${p} = ${s}`; v = q; ex = L(`Số cần điền là ${s} ${M} ${p} = ${q}. Thử lại: ${q} + ${p} = ${s}.`, `The missing number is ${s} ${M} ${p} = ${q}. Check: ${q} + ${p} = ${s}.`); }
      else { expr = `${p} + ? = ${s}`; v = q; ex = L(`Số cần điền là ${s} ${M} ${p} = ${q}. Thử lại: ${p} + ${q} = ${s}.`, `The missing number is ${s} ${M} ${p} = ${q}. Check: ${p} + ${q} = ${s}.`); }
      return NC.Q(L(`Số?\n${expr}`, `Find the missing number:\n${expr}`), NC.num(v), ex);
    } },

    // word problems backwards within 100: "lúc đầu có bao nhiêu", "đã cắt đi bao nhiêu"
    { id: 'g1-nc-bai-toan-nguoc', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g1-c8-b32', gen: rng => {
      // not "Trang": "Trang đã đọc một số trang" would read badly
      const f = R(rng, 0, 2), x = P(rng, U.NAMES.filter(n => n !== 'Trang'));
      if (f === 0) {
        const [b, c] = draw(() => [R(rng, 10, 40), R(rng, 10, 60)], ([p, q]) => noCarry(p, q), [12, 25]), v = b + c;
        return NC.Q(L(`${x} có một số nhãn vở. ${x} cho bạn ${b} nhãn vở thì còn lại ${c} nhãn vở. Hỏi lúc đầu ${x} có bao nhiêu nhãn vở?`, `${x} has some book labels. ${x} gives ${b} to a friend and has ${c} left. How many book labels did ${x} have at first?`),
          NC.num(v, L('nhãn vở', 'labels')), L(`Số nhãn vở lúc đầu gồm số nhãn đã cho và số nhãn còn lại: ${c} + ${b} = ${v} (nhãn vở).`, `At first ${x} had the labels given away and the labels left: ${c} + ${b} = ${v} labels.`),
          { hint: L('Đã cho đi bớt nên lúc đầu nhiều hơn số còn lại.', 'Some were given away, so there were more at first than are left.') });
      }
      const [a, c] = draw(() => [R(rng, 40, 99), R(rng, 10, 70)], ([p, q]) => q < p - 5 && noBorrow(p, q), [68, 45]), v = a - c;
      if (f === 1) {
        return NC.Q(L(`Sợi dây dài ${a} cm. ${x} cắt đi một đoạn thì sợi dây còn lại ${c} cm. Hỏi ${x} đã cắt đi đoạn dây dài bao nhiêu xăng-ti-mét?`, `A piece of string is ${a} cm long. ${x} cuts a piece off, and ${c} cm is left. How many centimetres did ${x} cut off?`),
          NC.num(v, 'cm'), L(`Đoạn cắt đi dài: ${a} ${M} ${c} = ${v} (cm).`, `The piece cut off: ${a} ${M} ${c} = ${v} (cm).`));
      }
      return NC.Q(L(`Quyển truyện có ${a} trang. ${x} đã đọc một số trang, còn ${c} trang chưa đọc. Hỏi ${x} đã đọc bao nhiêu trang?`, `A storybook has ${a} pages. ${x} has read some of them, and ${c} pages are still not read. How many pages has ${x} read?`),
        NC.num(v, L('trang', 'pages')), L(`Số trang đã đọc là: ${a} ${M} ${c} = ${v} (trang).`, `Pages read: ${a} ${M} ${c} = ${v}.`));
    } },

    // "số lớn nhất có hai chữ số…" with one calculation
    { id: 'g1-nc-so-dac-biet', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g1-c6-b22', gen: rng => {
      const t = R(rng, 2, 8);
      const SP = [
        [99, 'số lớn nhất có hai chữ số', 'the greatest two-digit number'],
        [10, 'số bé nhất có hai chữ số', 'the smallest two-digit number'],
        [9, 'số lớn nhất có một chữ số', 'the greatest one-digit number'],
        [90, 'số tròn chục lớn nhất có hai chữ số', 'the greatest two-digit multiple of 10'],
        [11, 'số bé nhất có hai chữ số giống nhau', 'the smallest two-digit number with both digits the same'],
        [98, 'số lớn nhất có hai chữ số khác nhau', 'the greatest two-digit number with two different digits'],
        [t * 10 + 9, `số lớn nhất có hai chữ số mà chữ số hàng chục là ${t}`, `the greatest two-digit number with ${t} as its tens digit`],
        [t * 10, `số bé nhất có hai chữ số mà chữ số hàng chục là ${t}`, `the smallest two-digit number with ${t} as its tens digit`],
      ];
      const d = draw(() => ({ sp: P(rng, SP), op: R(rng, 0, 2), b: R(rng, 0, 1) ? R(rng, 1, 8) * 10 : R(rng, 1, 88) }), ({ sp, op, b }) => {
        const v = sp[0];
        return b !== v && (op === 0 ? noCarry(v, b) && v + b < 100 : op === 1 ? noBorrow(v, b) && v - b > 0 : b > v && noBorrow(b, v));
      }, { sp: SP[1], op: 0, b: 35 });
      const [v, vi, en] = d.sp, b = d.b;
      const r = d.op === 0 ? v + b : d.op === 1 ? v - b : b - v;
      const calc = d.op === 0 ? `${v} + ${b} = ${r}` : d.op === 1 ? `${v} ${M} ${b} = ${r}` : `${b} ${M} ${v} = ${r}`;
      const prompt = d.op === 0 ? L(`Lấy ${vi} cộng với ${b}. Kết quả là bao nhiêu?`, `Add ${b} to ${en}. What is the answer?`)
        : d.op === 1 ? L(`Lấy ${vi} trừ đi ${b}. Kết quả là bao nhiêu?`, `Take ${b} away from ${en}. What is the answer?`)
          : L(`Lấy ${b} trừ đi ${vi}. Kết quả là bao nhiêu?`, `Take ${en} away from ${b}. What is the answer?`);
      return NC.Q(prompt, NC.num(r), L(`${cap(vi)} là ${v}. ${calc}.`, `${cap(en)} is ${v}. ${calc}.`),
        { hint: L('Tìm số đó trước, rồi mới tính.', 'Find that number first, then calculate.') });
    } },

    /* ================= Đặt tính rồi tính (cuoi-nam), no carrying, with a 0 or an awkward layout ================= */

    // 40 + 37, 25 + 60: a round ten and a two-digit number
    { id: 'g1-dt-cong-tron-chuc', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g1-c8-b30', gen: rng => {
      const [a, b] = draw(() => [R(rng, 2, 8) * 10, R(rng, 11, 79)], ([p, q]) => q % 10 !== 0 && noCarry(p, q), [40, 37]);
      return R(rng, 0, 1) ? dt(a, b, '+') : dt(b, a, '+');
    } },
    // 86 − 56, 47 − 42, 75 − 40: a zero in the answer or in the number taken away
    { id: 'g1-dt-tru-co-0', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g1-c8-b32', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) { const o = R(rng, 1, 9), ta = R(rng, 3, 9), tb = R(rng, 1, ta - 1); return dt(ta * 10 + o, tb * 10 + o, M); }
      if (f === 1) { const t = R(rng, 2, 9), oa = R(rng, 2, 9), ob = R(rng, 0, oa - 1); return dt(t * 10 + oa, t * 10 + ob, M); }
      const ta = R(rng, 3, 9), o = R(rng, 1, 9), tb = R(rng, 2, ta - 1);
      return dt(ta * 10 + o, tb * 10, M);
    } },
    // 4 + 52 (the one-digit number on top), 47 − 7
    { id: 'g1-dt-mot-chu-so', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g1-c8-b29', gen: rng => {
      if (R(rng, 0, 1)) { const [a, b] = draw(() => [R(rng, 1, 9), R(rng, 11, 98)], ([p, q]) => q % 10 + p <= 9, [4, 52]); return dt(a, b, '+'); }
      const t = R(rng, 1, 9), o = R(rng, 1, 9);
      return dt(t * 10 + o, o, M);
    } },
    // 54 + 45, 36 + 52: sums at the top of the range (ones and tens both reach 8 or 9)
    { id: 'g1-dt-cong-sat', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g1-c8-b30', gen: rng => {
      const [a, b] = draw(() => [R(rng, 11, 88), R(rng, 11, 88)], ([p, q]) => noCarry(p, q) && p % 10 + q % 10 >= 8 && p + q >= 80 && p % 10 && q % 10, [54, 45]);
      return dt(a, b, '+');
    } },
  ]);
})();
