/* Toán ISA — bài nâng cao lớp 2 (Đề nâng cao). Contract: NANGCAO.md.
 * Lớp 2 limits: học kì I + / − within 100 with at most one carry (có nhớ không quá một lượt), kg, l, ngày – giờ,
 * ngày – tháng, đường gấp khúc; học kì II numbers to 1000, × and : with the tables of 2 and 5 only, dm / m / km,
 * tiền Việt Nam, + / − within 1000 with one carry, chắc chắn / có thể / không thể.
 * Every word problem is ONE step (the user's decision): harder through conditions, working backwards, reversed
 * wording ("ít hơn" → add), units to convert, convenient calculation and the calendar — never a second operation.
 * Number answers of the trắc nghiệm kind stay below 100 in học kì I and at most 900 in học kì II, so the A B C D
 * distractors made from them stay inside the numbers the child knows.
 */
(function () {
  'use strict';
  const L = NC.L, R = NC.R, P = NC.P, M = NC.M, EN = U.EN;
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const range = (a, b) => { const out = []; for (let x = a; x <= b; x++) out.push(x); return out; };
  // number of carries (+) or borrows (−) when the sum is set out in columns
  function carries(a, b, op) {
    let n = 0, c = 0;
    while (a > 0 || b > 0) {
      const d = op === '+' ? a % 10 + b % 10 + c : a % 10 - b % 10 - c;
      c = op === '+' ? (d >= 10 ? 1 : 0) : (d < 0 ? 1 : 0);
      n += c; a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return n;
  }
  const calc = (a, b, op) => (op === '+' ? a + b : a - b);
  // draw until ok(v) (the same rng gives the same result); fb when nothing fits
  function draw(make, ok, fb) { for (let g = 0; g < 400; g++) { const v = make(); if (ok(v)) return v; } return fb; }
  // a pair for "a op b" within [1, max] with at most one carry; exactly one when `one`
  function pair(rng, ra, rb, op, max, one, fb) {
    return draw(() => [R(rng, ra[0], ra[1]), R(rng, rb[0], rb[1])], ([a, b]) => {
      const r = calc(a, b, op), k = carries(a, b, op);
      return r >= 1 && r <= max && (op === '+' || a > b) && (one ? k === 1 : k <= 1);
    }, fb);
  }

  // the column steps of a sum, as the lessons say them ("8 + 6 = 14, viết 4 nhớ 1; 5 + 3 = 8, thêm 1 là 9")
  function colSteps(a, b, op) {
    const da = String(a).split('').reverse().map(Number), db = String(b).split('').reverse().map(Number);
    const n = Math.max(da.length, db.length), vi = [], en = [];
    let c = 0;
    for (let i = 0; i < n; i++) {
      const top = i === n - 1;
      if (op === '+') {
        const x = da[i], y = db[i];
        if (x == null || y == null) {
          const d = x == null ? y : x, t = d + c, carry = t >= 10 && !top;
          if (!c) { vi.push(`hạ ${d}`); en.push(`bring down ${d}`); }
          else { vi.push(`${d} thêm 1 là ${t}${carry ? `, viết ${t % 10} nhớ 1` : `, viết ${t}`}`); en.push(`${d} + 1 = ${t}${carry ? `, write ${t % 10} and carry 1` : `, write ${t}`}`); }
          c = carry ? 1 : 0; continue;
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
          // a 0 to the left of the answer's first digit is not written (178 − 169 = 9)
          const r = x - yy, lead = r === 0 && i >= String(a - b).length;
          vi.push(`${pre[0]}${x} ${M} ${yy} = ${r}${lead ? ', không viết 0 ở đầu' : `, viết ${r}`}`);
          en.push(`${pre[1]}${x} ${M} ${yy} = ${r}${lead ? ', no 0 is written in front' : `, write ${r}`}`);
          c = 0;
        } else {
          const r = 10 + x - yy;
          vi.push(`${pre[0]}${x} không trừ được ${yy}, lấy 1${x} ${M} ${yy} = ${r}, viết ${r} nhớ 1`);
          en.push(`${pre[1]}you cannot take ${yy} from ${x}, so 1${x} ${M} ${yy} = ${r}, write ${r} and carry 1`);
          c = 1;
        }
      }
    }
    const res = calc(a, b, op);
    // starts with words: a number right after the prompt's last number would read as one long number in the test
    return L(`Tính từ phải sang trái: ${vi.join('; ')}. Vậy ${a} ${op} ${b} = ${res}.`, `Work from right to left: ${en.join('; ')}. So ${a} ${op} ${b} = ${res}.`);
  }
  const dt = (a, b, op) => NC.dt(a, b, op, calc(a, b, op), colSteps(a, b, op));

  // calendar: Monday first, as the Vietnamese week; "thứ Ba" inside a sentence, "Thứ Ba" as an option
  const DAYS = EN ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy', 'Chủ nhật'];
  const day = k => DAYS[((k % 7) + 7) % 7];
  const MON = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const LEN = { 1: 31, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
  const dayCh = k => {
    const opts = [k, k + 1, k + 6, k + 2].map(j => ((j % 7) + 7) % 7).sort((x, y) => x - y);
    return { kind: 'choice', options: opts.map(j => cap(day(j))), correct: opts.indexOf(((k % 7) + 7) % 7) };
  };
  const COL = [{ n: 'đỏ', en: 'red', c: '#E84A4A' }, { n: 'xanh', en: 'blue', c: '#4DA3FF' }, { n: 'vàng', en: 'yellow', c: '#FFC93C' }];

  NC.add(2, [
    /* ================= học kì I (cuoi-hk1): + / − within 100, one carry; kg, l; time; zigzag lines ================= */

    // "Tìm hiệu của 43 và số tròn chục nhỏ nhất có hai chữ số"
    { id: 'g2-nc-so-dac-biet', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c1-b3', gen: rng => {
      const t = R(rng, 2, 8);
      const SP = [
        [10, 'số tròn chục nhỏ nhất có hai chữ số', 'the smallest two-digit multiple of 10'],
        [90, 'số tròn chục lớn nhất có hai chữ số', 'the greatest two-digit multiple of 10'],
        [99, 'số lớn nhất có hai chữ số', 'the greatest two-digit number'],
        [9, 'số lớn nhất có một chữ số', 'the greatest one-digit number'],
        [98, 'số lớn nhất có hai chữ số khác nhau', 'the greatest two-digit number with two different digits'],
        [10, 'số bé nhất có hai chữ số khác nhau', 'the smallest two-digit number with two different digits', ['(1 và 0 là hai chữ số khác nhau)', '(1 and 0 are different digits)']],
        [11, 'số bé nhất có hai chữ số giống nhau', 'the smallest two-digit number with both digits the same'],
        [t * 10 + 9, `số lớn nhất có hai chữ số mà chữ số hàng chục là ${t}`, `the greatest two-digit number with ${t} as its tens digit`],
      ];
      const one = R(rng, 0, 2) > 0;
      const d = draw(() => ({ sp: P(rng, SP), op: R(rng, 0, 2), x: R(rng, 11, 95) }), ({ sp, op, x }) => {
        const v = sp[0];
        if (x === v) return false;
        const [a, b, o] = op === 0 ? [x, v, M] : op === 1 ? [v, x, M] : [v, x, '+'];
        const r = calc(a, b, o), k = carries(a, b, o);
        return (o === '+' || a > b) && r >= 1 && r <= 99 && (one ? k === 1 : k === 0);
      }, { sp: SP[0], op: 0, x: 43 });
      const [v, vi, en, note] = d.sp, x = d.x;
      const [a, b, o] = d.op === 0 ? [x, v, M] : d.op === 1 ? [v, x, M] : [v, x, '+'];
      const r = calc(a, b, o);
      const prompt = d.op === 0 ? L(`Tìm hiệu của ${x} và ${vi}.`, `Find the difference between ${x} and ${en}.`)
        : d.op === 1 ? L(`Tìm hiệu của ${vi} và ${x}.`, `Find the difference between ${en} and ${x}.`)
          : L(`Tìm tổng của ${vi} và ${x}.`, `Find the sum of ${en} and ${x}.`);
      return NC.Q(prompt, NC.num(r), L(`${cap(vi)} là ${v}${note ? ' ' + note[0] : ''}. ${a} ${o} ${b} = ${r}.`, `${cap(en)} is ${v}${note ? ' ' + note[1] : ''}. ${a} ${o} ${b} = ${r}.`),
        { hint: L('Tìm số đó trước, rồi mới tính.', 'Find that number first, then calculate.') });
    } },

    // "Hiệu hai số bằng 74, nếu giữ nguyên số trừ, bớt số bị trừ đi 9 đơn vị thì hiệu… bằng bao nhiêu?"
    { id: 'g2-nc-hieu-moi', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c1-b3', gen: rng => {
      const f = R(rng, 0, 5), up = f === 1 || f === 3 || f === 4, one = R(rng, 0, 2) > 0;
      const [h, k] = draw(() => [R(rng, 25, 90), R(rng, 3, 19)], ([p, q]) => {
        const r = up ? p + q : p - q;
        return r >= 1 && r <= 99 && carries(p, q, up ? '+' : M) === (one ? 1 : 0);
      }, [74, 9]);
      const r = up ? h + k : h - k, o = up ? '+' : M;
      const T = [
        [`Hiệu của hai số bằng ${h}. Nếu giữ nguyên số trừ và bớt số bị trừ đi ${k} đơn vị thì hiệu mới bằng bao nhiêu?`, `The difference between two numbers is ${h}. The subtrahend stays the same and the minuend is made ${k} smaller. What is the new difference?`,
          `Số trừ giữ nguyên, số bị trừ bớt đi ${k} đơn vị thì hiệu cũng bớt đi ${k} đơn vị`, `The subtrahend stays the same and the minuend is ${k} smaller, so the difference is also ${k} smaller`],
        [`Hiệu của hai số bằng ${h}. Nếu giữ nguyên số trừ và thêm vào số bị trừ ${k} đơn vị thì hiệu mới bằng bao nhiêu?`, `The difference between two numbers is ${h}. The subtrahend stays the same and the minuend is made ${k} bigger. What is the new difference?`,
          `Số trừ giữ nguyên, số bị trừ thêm ${k} đơn vị thì hiệu cũng thêm ${k} đơn vị`, `The subtrahend stays the same and the minuend is ${k} bigger, so the difference is also ${k} bigger`],
        [`Hiệu của hai số bằng ${h}. Nếu giữ nguyên số bị trừ và thêm vào số trừ ${k} đơn vị thì hiệu mới bằng bao nhiêu?`, `The difference between two numbers is ${h}. The minuend stays the same and the subtrahend is made ${k} bigger. What is the new difference?`,
          `Số bị trừ giữ nguyên, trừ đi nhiều hơn ${k} đơn vị thì hiệu bớt đi ${k} đơn vị`, `The minuend stays the same and we take away ${k} more, so the difference is ${k} smaller`],
        [`Hiệu của hai số bằng ${h}. Nếu giữ nguyên số bị trừ và bớt số trừ đi ${k} đơn vị thì hiệu mới bằng bao nhiêu?`, `The difference between two numbers is ${h}. The minuend stays the same and the subtrahend is made ${k} smaller. What is the new difference?`,
          `Số bị trừ giữ nguyên, trừ đi ít hơn ${k} đơn vị thì hiệu thêm ${k} đơn vị`, `The minuend stays the same and we take away ${k} less, so the difference is ${k} bigger`],
        [`Tổng của hai số bằng ${h}. Nếu giữ nguyên số hạng thứ nhất và thêm vào số hạng thứ hai ${k} đơn vị thì tổng mới bằng bao nhiêu?`, `The sum of two numbers is ${h}. The first addend stays the same and the second addend is made ${k} bigger. What is the new sum?`,
          `Một số hạng giữ nguyên, số hạng kia thêm ${k} đơn vị thì tổng cũng thêm ${k} đơn vị`, `One addend stays the same and the other is ${k} bigger, so the sum is also ${k} bigger`],
        [`Tổng của hai số bằng ${h}. Nếu giữ nguyên số hạng thứ nhất và bớt số hạng thứ hai đi ${k} đơn vị thì tổng mới bằng bao nhiêu?`, `The sum of two numbers is ${h}. The first addend stays the same and the second addend is made ${k} smaller. What is the new sum?`,
          `Một số hạng giữ nguyên, số hạng kia bớt đi ${k} đơn vị thì tổng cũng bớt đi ${k} đơn vị`, `One addend stays the same and the other is ${k} smaller, so the sum is also ${k} smaller`],
      ][f];
      const ex = f >= 4 ? ['Ví dụ: 30 + 20 = 50', 'For example: 30 + 20 = 50'] : ['Ví dụ: 50 − 20 = 30', 'For example: 50 − 20 = 30'];
      return NC.Q(L(T[0], T[1]), NC.num(r), L(`${T[2]}: ${h} ${o} ${k} = ${r}.`, `${T[3]}: ${h} ${o} ${k} = ${r}.`),
        { hint: L(`Thử với hai số cụ thể. ${ex[0]}.`, `Try it with real numbers. ${ex[1]}.`) });
    } },

    // "Ngày 24 tháng 12 … là thứ Ba. Ngày 1 tháng 1 năm sau là thứ mấy?" (the number of days in the month)
    { id: 'g2-nc-lich', from: 'cuoi-hk1', kinds: ['tn'], lesson: 'g2-c6-b30', gen: rng => {
      const m = P(rng, [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), n = LEN[m], m2 = m === 12 ? 1 : m + 1, k = R(rng, 0, 6), f = R(rng, 0, 2);
      const next = L(m === 12 ? 'ngày 1 tháng 1 năm sau' : `ngày 1 tháng ${m2}`, m === 12 ? '1 January of the next year' : `1 ${MON[m2]}`);
      const has = L(`Tháng ${m} có ${n} ngày.`, `${MON[m]} has ${n} days.`);
      if (f === 2) {
        return NC.Q(L(`${cap(next)} là ${day(k)}. Hỏi ngày ${n} tháng ${m} là thứ mấy?`, `${cap(next)} is a ${day(k)}. What day of the week is ${n} ${MON[m]}?`), dayCh(k - 1),
          L(`${has} Ngày ${n} tháng ${m} là ngày cuối cùng của tháng ${m}, ngay trước ${next}. Vậy ngày ${n} tháng ${m} là ${day(k - 1)}.`, `${has} ${n} ${MON[m]} is the last day of ${MON[m]}, just before ${next}. So ${n} ${MON[m]} is a ${day(k - 1)}.`),
          { hint: L(`Tháng ${m} có bao nhiêu ngày?`, `How many days are there in ${MON[m]}?`) });
      }
      const d = f === 0 ? n - 7 : n - 6;
      const prompt = L(`Ngày ${d} tháng ${m} là ${day(k)}. Hỏi ${next} là thứ mấy?`, `${d} ${MON[m]} is a ${day(k)}. What day of the week is ${next}?`);
      const hint = L(`Tháng ${m} có bao nhiêu ngày? Một tuần có 7 ngày.`, `How many days are there in ${MON[m]}? A week has 7 days.`);
      if (f === 0) {
        return NC.Q(prompt, dayCh(k + 1), L(`${has} ${d} + 7 = ${n} nên ngày ${n} tháng ${m} cũng là ${day(k)}. ${cap(next)} là ngày ngay sau ngày ${n} tháng ${m}, nên là ${day(k + 1)}.`,
          `${has} ${d} + 7 = ${n}, so ${n} ${MON[m]} is also a ${day(k)}. ${cap(next)} is the day after ${n} ${MON[m]}, so it is a ${day(k + 1)}.`), { hint });
      }
      const list = range(d + 1, n).join(', ');
      return NC.Q(prompt, dayCh(k), L(`${has} Đếm thêm 7 ngày từ ngày ${d} tháng ${m}: ${list} rồi đến ${next}. Sau đúng 1 tuần nên ${next} cũng là ${day(k)}.`,
        `${has} Count on 7 days from ${d} ${MON[m]}: ${list}, then ${next}. That is exactly 1 week later, so ${next} is also a ${day(k)}.`), { hint });
    } },

    // hours: "5 giờ chiều là 17 giờ" inside a one-step problem
    { id: 'g2-nc-gio', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c6-b29', gen: rng => {
      const f = R(rng, 0, 2), x = NC.name(rng);
      if (f === 0) {
        const h1 = R(rng, 6, 9), h2 = R(rng, 1, 5), v = h2 + 12 - h1;
        const [pv, pe] = P(rng, [[['Một cửa hàng', 'cửa hàng'], ['A shop', 'the shop']], [['Thư viện của trường', 'thư viện'], ['The school library', 'the library']], [['Một nhà sách', 'nhà sách'], ['A bookshop', 'the bookshop']]]);
        return NC.Q(L(`${pv[0]} mở cửa lúc ${h1} giờ sáng và đóng cửa lúc ${h2} giờ chiều. Hỏi mỗi ngày ${pv[1]} mở cửa trong bao nhiêu giờ?`, `${pe[0]} opens at ${h1} o’clock in the morning and closes at ${h2} o’clock in the afternoon. How many hours is ${pe[1]} open each day?`),
          NC.num(v, L('giờ', 'hours')), L(`${h2} giờ chiều là ${h2 + 12} giờ. ${h2 + 12} ${M} ${h1} = ${v}. ${cap(pv[1])} mở cửa trong ${v} giờ.`, `${h2} o’clock in the afternoon is ${h2 + 12}:00. ${h2 + 12} ${M} ${h1} = ${v}. ${cap(pe[1])} is open for ${v} hours.`),
          { hint: L('Đổi giờ buổi chiều sang cách gọi 13 giờ, 14 giờ, …', 'Change the afternoon time to 13:00, 14:00, …') });
      }
      if (f === 1) {
        const [h1, d] = draw(() => [R(rng, 6, 11), R(rng, 2, 9)], ([p, q]) => p + q >= 13 && p + q <= 18, [8, 7]), e = h1 + d;
        return NC.Q(L(`Một chuyến xe khách khởi hành lúc ${h1} giờ sáng, đi hết ${d} giờ thì đến nơi. Hỏi xe đến nơi lúc mấy giờ chiều?`, `A coach leaves at ${h1} o’clock in the morning. The journey takes ${d} hours. At what time in the afternoon does it arrive?`),
          NC.num(e - 12, L('giờ chiều', 'o’clock in the afternoon')), L(`${h1} + ${d} = ${e}. ${e} giờ còn gọi là ${e - 12} giờ chiều.`, `${h1} + ${d} = ${e}. ${e}:00 is ${e - 12} o’clock in the afternoon.`),
          { hint: L('13 giờ là 1 giờ chiều, 14 giờ là 2 giờ chiều, …', '13:00 is 1 o’clock in the afternoon, 14:00 is 2 o’clock, …') });
      }
      const h = R(rng, 1, 4), e = R(rng, h + 14, 18), v = e - h - 12;
      return NC.Q(L(`${x} đi đá bóng lúc ${h} giờ chiều và về đến nhà lúc ${e} giờ. Hỏi ${x} đi đá bóng trong mấy giờ?`, `${x} goes out to play football at ${h} o’clock in the afternoon and gets home at ${e}:00. For how many hours was ${x} out?`),
        NC.num(v, L('giờ', 'hours')), L(`${h} giờ chiều là ${h + 12} giờ. ${e} ${M} ${h + 12} = ${v}. ${x} đi đá bóng trong ${v} giờ.`, `${h} o’clock in the afternoon is ${h + 12}:00. ${e} ${M} ${h + 12} = ${v}. ${x} was out for ${v} ${v === 1 ? 'hour' : 'hours'}.`),
        { hint: L('Viết hai giờ theo cùng một cách gọi rồi mới trừ.', 'Write both times the same way, then subtract.') });
    } },

    // a balance with a weight on the side of the thing being weighed
    { id: 'g2-nc-can-dia', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c3-b15', gen: rng => {
      const LIGHT = [{ n: 'quả dưa hấu', en: 'watermelon', e: '🍉' }, { n: 'quả bí ngô', en: 'pumpkin', e: '🎃' }, { n: 'túi cam', en: 'bag of oranges', e: '🍊' }, { n: 'nải chuối', en: 'bunch of bananas', e: '🍌' }];
      const HEAVY = [{ n: 'bao gạo', en: 'sack of rice', e: '🌾' }, { n: 'bao ngô', en: 'sack of maize', e: '🌽' }, { n: 'bao khoai tây', en: 'sack of potatoes', e: '🥔' }];
      const kg = w => ({ label: `${w} kg`, kg: w });
      if (R(rng, 0, 2) > 0) {
        const heavy = R(rng, 0, 1) === 1, it = P(rng, heavy ? HEAVY : LIGHT);
        const W = heavy ? P(rng, [20, 50]) : 10, w = heavy ? P(rng, [1, 2, 5, 10]) : P(rng, [1, 2, 5]), v = W - w;
        return NC.Q(L(`Cân thăng bằng: một đĩa cân có ${it.n} và quả cân ${w} kg, đĩa bên kia có quả cân ${W} kg. Hỏi ${it.n} nặng bao nhiêu ki-lô-gam?`, `The scale balances. One pan holds a ${it.en} and a ${w} kg weight. The other pan holds a ${W} kg weight. How many kilograms does the ${it.en} weigh?`),
          NC.num(v, 'kg'), L(`${cap(it.n)} và quả cân ${w} kg nặng bằng quả cân ${W} kg. ${cap(it.n)} nặng: ${W} ${M} ${w} = ${v} (kg).`, `The ${it.en} and the ${w} kg weight together weigh the same as ${W} kg. The ${it.en} weighs ${W} ${M} ${w} = ${v} (kg).`),
          { visual: { type: 'scale', params: { left: [{ label: it.e, kg: v }, kg(w)], right: [kg(W)] } }, hint: L('Quả cân ở cùng đĩa với đồ vật cũng được tính vào bên đó.', 'The weight in the same pan as the thing counts on that side too.') });
      }
      const [A, B] = U.sample(rng, HEAVY, 2), [b, w] = draw(() => [R(rng, 12, 45), P(rng, [2, 5, 10, 20])], ([p, q]) => p + q <= 60 && carries(p, q, '+') <= 1, [25, 5]), v = b + w;
      return NC.Q(L(`Cân thăng bằng: đĩa bên trái có ${A.n}, đĩa bên phải có ${B.n} nặng ${b} kg và quả cân ${w} kg. Hỏi ${A.n} nặng bao nhiêu ki-lô-gam?`, `The scale balances. The left pan holds a ${A.en}. The right pan holds a ${B.en} that weighs ${b} kg and a ${w} kg weight. How many kilograms does the ${A.en} weigh?`),
        NC.num(v, 'kg'), L(`${cap(A.n)} nặng bằng ${B.n} và quả cân ${w} kg cộng lại: ${b} + ${w} = ${v} (kg).`, `The ${A.en} weighs the same as the ${B.en} and the ${w} kg weight together: ${b} + ${w} = ${v} (kg).`),
        { visual: { type: 'scale', params: { left: [{ label: A.e, kg: v }], right: [{ label: B.e, kg: b }, kg(w)] } } });
    } },

    // litres and kilograms, working backwards ("còn lại …, lúc đầu có bao nhiêu")
    { id: 'g2-nc-lit-kg', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c3-b16', gen: rng => {
      const f = R(rng, 0, 3), x = NC.name(rng), one = R(rng, 0, 3) > 0;
      if (f === 0 || f === 2) {
        const [b, c] = pair(rng, [5, 35], [10, 60], '+', 99, one, [18, 35]), v = b + c;
        if (f === 0) {
          return NC.Q(L(`Từ một thùng nước, mẹ lấy ra ${b} l nước để tưới cây thì trong thùng còn lại ${c} l. Hỏi lúc đầu thùng có bao nhiêu lít nước?`, `Mum takes ${b} l of water out of a tank to water the plants, and ${c} l is left in the tank. How many litres of water were in the tank at first?`),
            NC.num(v, 'l'), L(`Nước lúc đầu gồm nước đã lấy ra và nước còn lại: ${c} + ${b} = ${v} (l).`, `The water at first is the water taken out and the water left: ${c} + ${b} = ${v} (l).`),
            { hint: L('Lấy ra bớt đi, nên lúc đầu nhiều hơn số còn lại.', 'Some was taken out, so there was more at first than is left.') });
        }
        return NC.Q(L(`Một bao gạo, sau khi bán đi ${b} kg thì còn lại ${c} kg. Hỏi lúc đầu bao gạo nặng bao nhiêu ki-lô-gam?`, `After ${b} kg is sold from a sack of rice, ${c} kg is left. How many kilograms did the sack weigh at first?`),
          NC.num(v, 'kg'), L(`Lúc đầu bao gạo nặng: ${c} + ${b} = ${v} (kg).`, `At first the sack weighed ${c} + ${b} = ${v} (kg).`));
      }
      const [s, a] = pair(rng, [30, 99], [10, 80], M, 99, one, [62, 35]), v = s - a;
      if (f === 1) {
        return NC.Q(L(`Bể có ${a} l nước. Bố đổ thêm nước vào bể thì bể có ${s} l nước. Hỏi bố đã đổ thêm bao nhiêu lít nước?`, `A water tank holds ${a} l of water. Dad pours in some more, and now it holds ${s} l. How many litres did Dad pour in?`),
          NC.num(v, 'l'), L(`Số lít nước đổ thêm là: ${s} ${M} ${a} = ${v} (l).`, `Dad poured in ${s} ${M} ${a} = ${v} (l).`));
      }
      return NC.Q(L(`Thùng có ${s} l dầu. Sau khi lấy ra một số lít dầu thì thùng còn lại ${a} l. Hỏi đã lấy ra bao nhiêu lít dầu?`, `A drum holds ${s} l of oil. Some oil is taken out, and ${a} l is left. How many litres were taken out?`),
        NC.num(v, 'l'), L(`Số lít dầu đã lấy ra là: ${s} ${M} ${a} = ${v} (l).`, `Oil taken out: ${s} ${M} ${a} = ${v} (l).`));
    } },

    // tính nhanh: pair the numbers that make a round ten
    { id: 'g2-nc-tinh-nhanh', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c4-b20', gen: rng => {
      const f = R(rng, 0, 2), hint = L('Ghép hai số có tổng (hoặc hiệu) là số tròn chục.', 'Put together two numbers that make a multiple of 10.');
      const mate = (a, top) => draw(() => R(rng, 1, Math.max(1, Math.floor((top - a) / 10))) * 10 + (10 - a % 10), c => a + c <= top && c >= 11, 10 + (10 - a % 10));
      if (f === 0) {
        const a = draw(() => R(rng, 11, 59), x => x % 10 !== 0, 26), c = mate(a, 80), s = a + c;
        const b = draw(() => R(rng, 11, 99 - s), x => x % 10 !== 0 && s + x <= 99, 7), t = s + b;
        const expr = R(rng, 0, 1) ? `${a} + ${b} + ${c}` : `${c} + ${b} + ${a}`;
        return NC.Q(L(`Tính nhanh:\n${expr}`, `Find a quick way to work out:\n${expr}`), NC.num(t),
          L(`Ghép ${a} với ${c} được số tròn chục: ${expr} = (${a} + ${c}) + ${b} = ${s} + ${b} = ${t}.`, `${a} and ${c} make a multiple of 10: ${expr} = (${a} + ${c}) + ${b} = ${s} + ${b} = ${t}.`), { hint });
      }
      if (f === 1) {
        const [a, c] = draw(() => [R(rng, 31, 89), R(rng, 11, 79)], ([p, q]) => p % 10 === q % 10 && p % 10 !== 0 && p - q >= 10, [38, 18]), dd = a - c;
        const b = draw(() => R(rng, 11, 60), x => x % 10 !== 0 && a + x <= 99, 5), t = dd + b;
        const expr = `${a} + ${b} ${M} ${c}`;
        return NC.Q(L(`Tính nhanh:\n${expr}`, `Find a quick way to work out:\n${expr}`), NC.num(t),
          L(`${a} và ${c} có cùng chữ số hàng đơn vị: ${expr} = (${a} ${M} ${c}) + ${b} = ${dd} + ${b} = ${t}.`, `${a} and ${c} have the same ones digit: ${expr} = (${a} ${M} ${c}) + ${b} = ${dd} + ${b} = ${t}.`), { hint });
      }
      const a = draw(() => R(rng, 11, 29), x => x % 10 !== 0, 13), c = mate(a, 50), b = draw(() => R(rng, 11, 29), x => x % 10 !== 0 && x !== a && x !== c, 28), d = mate(b, 90 - (a + c));
      const t = a + b + c + d, expr = `${a} + ${b} + ${c} + ${d}`;
      return NC.Q(L(`Tính nhanh:\n${expr}`, `Find a quick way to work out:\n${expr}`), NC.num(t),
        L(`${expr} = (${a} + ${c}) + (${b} + ${d}) = ${a + c} + ${b + d} = ${t}.`, `${expr} = (${a} + ${c}) + (${b} + ${d}) = ${a + c} + ${b + d} = ${t}.`), { hint });
    } },

    // the unknown with carrying: "? + 28 = 64", "90 − ? = 35", "Tìm một số, biết rằng…"
    { id: 'g2-nc-tim-so', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c4-b23', gen: rng => {
      const f = R(rng, 0, 3), words = R(rng, 0, 1) === 1;
      const [p, q] = R(rng, 0, 2) === 0
        ? (() => { const s = R(rng, 3, 9) * 10, a = draw(() => R(rng, 11, s - 6), x => x % 10 !== 0, 13); return [a, s - a]; })()
        : pair(rng, [11, 80], [6, 80], '+', 99, true, [28, 36]);
      const s = p + q;
      const T = [
        [`? + ${p} = ${s}`, `số đó cộng với ${p} thì bằng ${s}`, `when you add ${p} to the number, you get ${s}`, q, L(`Số cần tìm là ${s} ${M} ${p} = ${q}. Thử lại: ${q} + ${p} = ${s}.`, `The number is ${s} ${M} ${p} = ${q}. Check: ${q} + ${p} = ${s}.`)],
        [`${s} ${M} ? = ${q}`, `lấy ${s} trừ đi số đó thì bằng ${q}`, `when you take the number away from ${s}, you get ${q}`, p, L(`Số cần tìm là ${s} ${M} ${q} = ${p}. Thử lại: ${s} ${M} ${p} = ${q}.`, `The number is ${s} ${M} ${q} = ${p}. Check: ${s} ${M} ${p} = ${q}.`)],
        [`? ${M} ${p} = ${q}`, `số đó trừ đi ${p} thì bằng ${q}`, `when you take ${p} away from the number, you get ${q}`, s, L(`Số cần tìm là ${q} + ${p} = ${s}. Thử lại: ${s} ${M} ${p} = ${q}.`, `The number is ${q} + ${p} = ${s}. Check: ${s} ${M} ${p} = ${q}.`)],
        [`${q} + ? = ${s}`, `${q} cộng với số đó thì bằng ${s}`, `when you add the number to ${q}, you get ${s}`, p, L(`Số cần tìm là ${s} ${M} ${q} = ${p}. Thử lại: ${q} + ${p} = ${s}.`, `The number is ${s} ${M} ${q} = ${p}. Check: ${q} + ${p} = ${s}.`)],
      ][f];
      const prompt = words ? L(`Tìm một số, biết rằng ${T[1]}.`, `Find the number. ${cap(T[2])}.`) : L(`Số?\n${T[0]}`, `Find the missing number:\n${T[0]}`);
      return NC.Q(prompt, NC.num(T[3]), T[4], { hint: L('Thử lại bằng cách thay số tìm được vào phép tính.', 'Check by putting your number back into the calculation.') });
    } },

    // đường gấp khúc ABC: one part from the whole, or from "dài hơn đoạn AB … cm"
    { id: 'g2-nc-gap-khuc', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c5-b26', gen: rng => {
      const [X, Y, Z] = P(rng, [['A', 'B', 'C'], ['M', 'N', 'P'], ['D', 'E', 'G'], ['H', 'I', 'K']]), f = P(rng, [0, 0, 1, 1]);   // form 2 (the answer is the "dài hơn" number itself) is a trick question: left out
      const XYZ = X + Y + Z, XY = X + Y, YZ = Y + Z;
      const [s, a] = pair(rng, [30, 99], [10, 70], M, 99, R(rng, 0, 3) > 0, [52, 27]), v = s - a;
      if (f === 0) {
        return NC.Q(L(`Đường gấp khúc ${XYZ} dài ${s} cm, đoạn thẳng ${XY} dài ${a} cm. Hỏi đoạn thẳng ${YZ} dài bao nhiêu xăng-ti-mét?`, `The zigzag line ${XYZ} is ${s} cm long. The line segment ${XY} is ${a} cm long. How many centimetres long is the segment ${YZ}?`),
          NC.num(v, 'cm'), L(`Độ dài đường gấp khúc ${XYZ} bằng ${XY} + ${YZ}. Đoạn ${YZ} dài: ${s} ${M} ${a} = ${v} (cm).`, `The length of ${XYZ} is ${XY} + ${YZ}. So ${YZ} is ${s} ${M} ${a} = ${v} (cm).`));
      }
      const say = L(`Đường gấp khúc ${XYZ} dài ${s} cm và dài hơn đoạn thẳng ${XY} là ${a} cm.`, `The zigzag line ${XYZ} is ${s} cm long. It is ${a} cm longer than the line segment ${XY}.`);
      if (f === 1) {
        return NC.Q(`${say} ${L(`Hỏi đoạn thẳng ${XY} dài bao nhiêu xăng-ti-mét?`, `How many centimetres long is ${XY}?`)}`, NC.num(v, 'cm'),
          L(`Đoạn ${XY} ngắn hơn đường gấp khúc ${a} cm: ${s} ${M} ${a} = ${v} (cm).`, `${XY} is ${a} cm shorter than the zigzag line: ${s} ${M} ${a} = ${v} (cm).`));
      }
      return NC.Q(`${say} ${L(`Hỏi đoạn thẳng ${YZ} dài bao nhiêu xăng-ti-mét?`, `How many centimetres long is ${YZ}?`)}`, NC.num(a, 'cm'),
        L(`Đường gấp khúc ${XYZ} gồm đoạn ${XY} và đoạn ${YZ}, nên nó dài hơn đoạn ${XY} đúng bằng độ dài đoạn ${YZ}. Vậy ${YZ} dài ${a} cm. (Thử lại: ${XY} dài ${s} ${M} ${a} = ${v} cm; ${v} + ${a} = ${s}.)`,
          `${XYZ} is made of ${XY} and ${YZ}, so it is longer than ${XY} by exactly the length of ${YZ}. So ${YZ} is ${a} cm long. (Check: ${XY} is ${s} ${M} ${a} = ${v} cm; ${v} + ${a} = ${s}.)`),
        { hint: L(`Đường gấp khúc ${XYZ} gồm những đoạn thẳng nào?`, `Which segments make up the zigzag line ${XYZ}?`) });
    } },

    // reversed wording: "A ít hơn B 8 …, hỏi B" (add), "A nhiều hơn B …, hỏi B" (subtract)
    { id: 'g2-nc-hon-kem', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c2-b13', gen: rng => {
      const f = R(rng, 0, 3), [x, y] = NC.names(rng, 2), one = R(rng, 0, 3) > 0;
      const add = f !== 1;
      const [a, k] = add ? pair(rng, [15, 85], [5, 30], '+', 99, one, [35, 8]) : pair(rng, [25, 95], [5, 30], M, 99, one, [42, 15]);
      const v = add ? a + k : a - k, o = add ? '+' : M;
      if (f === 0) {
        return NC.Q(L(`${x} có ${a} nhãn vở. ${x} có ít hơn ${y} ${k} nhãn vở. Hỏi ${y} có bao nhiêu nhãn vở?`, `${x} has ${a} book labels. ${x} has ${k} fewer labels than ${y}. How many labels does ${y} have?`),
          NC.num(v, L('nhãn vở', 'labels')), L(`${x} ít hơn ${y} ${k} nhãn vở, tức là ${y} nhiều hơn ${x} ${k} nhãn vở. ${y} có: ${a} ${o} ${k} = ${v} (nhãn vở).`, `${x} has ${k} fewer than ${y}, so ${y} has ${k} more than ${x}: ${a} ${o} ${k} = ${v} (labels).`),
          { hint: L('Đọc kĩ: ai nhiều hơn, ai ít hơn?', 'Read carefully: who has more, who has fewer?') });
      }
      if (f === 1) {
        return NC.Q(L(`${x} có ${a} viên bi, ${x} có nhiều hơn ${y} ${k} viên bi. Hỏi ${y} có bao nhiêu viên bi?`, `${x} has ${a} marbles. ${x} has ${k} more marbles than ${y}. How many marbles does ${y} have?`),
          NC.num(v, L('viên bi', 'marbles')), L(`${x} nhiều hơn ${y} ${k} viên bi, tức là ${y} ít hơn ${x} ${k} viên bi. ${y} có: ${a} ${o} ${k} = ${v} (viên bi).`, `${x} has ${k} more than ${y}, so ${y} has ${k} fewer than ${x}: ${a} ${o} ${k} = ${v} (marbles).`),
          { hint: L('Đọc kĩ: ai nhiều hơn, ai ít hơn?', 'Read carefully: who has more, who has fewer?') });
      }
      if (f === 2) {
        return NC.Q(L(`Thùng thứ nhất có ${a} l nước. Thùng thứ nhất ít hơn thùng thứ hai ${k} l nước. Hỏi thùng thứ hai có bao nhiêu lít nước?`, `The first tank holds ${a} l of water. The first tank holds ${k} l less than the second tank. How many litres does the second tank hold?`),
          NC.num(v, 'l'), L(`Thùng thứ nhất ít hơn thùng thứ hai ${k} l, tức là thùng thứ hai nhiều hơn ${k} l: ${a} ${o} ${k} = ${v} (l).`, `The first tank holds ${k} l less, so the second tank holds ${k} l more: ${a} ${o} ${k} = ${v} (l).`));
      }
      return NC.Q(L(`Cây hoa hồng cao ${a} cm. Cây hoa hồng thấp hơn cây hoa hướng dương ${k} cm. Hỏi cây hoa hướng dương cao bao nhiêu xăng-ti-mét?`, `The rose bush is ${a} cm tall. The rose bush is ${k} cm shorter than the sunflower. How tall is the sunflower in centimetres?`),
        NC.num(v, 'cm'), L(`Cây hoa hồng thấp hơn ${k} cm, tức là cây hoa hướng dương cao hơn ${k} cm: ${a} ${o} ${k} = ${v} (cm).`, `The rose bush is ${k} cm shorter, so the sunflower is ${k} cm taller: ${a} ${o} ${k} = ${v} (cm).`));
    } },

    // "từ ba chữ số … viết số lớn nhất và số bé nhất có hai chữ số khác nhau", then their difference or sum
    { id: 'g2-nc-ghep-so', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g2-c1-b1', gen: rng => {
      const t = draw(() => {
        const zero = R(rng, 0, 1) === 1, ds = U.shuffle(rng, (zero ? [0] : []).concat(U.sample(rng, range(1, 9), zero ? 2 : 3)));
        const desc = ds.slice().sort((p, q) => q - p), mx = desc[0] * 10 + desc[1];
        const nz = ds.filter(z => z > 0).sort((p, q) => p - q)[0], rest = ds.filter(z => z !== nz).sort((p, q) => p - q)[0], mn = nz * 10 + rest;
        const sum = R(rng, 0, 2) === 0 && mx + mn <= 99;
        return { zero, ds, mx, mn, sum };
      }, o => (o.sum ? carries(o.mx, o.mn, '+') <= 1 : carries(o.mx, o.mn, M) <= 1), null) || { zero: true, ds: [4, 0, 7], mx: 74, mn: 40, sum: false };
      const r = t.sum ? t.mx + t.mn : t.mx - t.mn, list = t.ds.join(', ');
      return NC.Q(L(`Từ ba chữ số ${list}, hãy viết số lớn nhất và số bé nhất có hai chữ số khác nhau. Tìm ${t.sum ? 'tổng' : 'hiệu'} của hai số đó.`, `Using the digits ${list}, write the greatest and the smallest two-digit numbers with two different digits. Find the ${t.sum ? 'sum' : 'difference'} of the two numbers.`),
        NC.num(r), L(`Số lớn nhất là ${t.mx}. Số bé nhất là ${t.mn}${t.zero ? ' (chữ số 0 không đứng ở hàng chục)' : ''}. ${t.sum ? `${t.mx} + ${t.mn}` : `${t.mx} ${M} ${t.mn}`} = ${r}.`,
          `The greatest is ${t.mx}. The smallest is ${t.mn}${t.zero ? ' (0 cannot be the tens digit)' : ''}. ${t.sum ? `${t.mx} + ${t.mn}` : `${t.mx} ${M} ${t.mn}`} = ${r}.`),
        { hint: L('Số lớn nhất: chữ số lớn nhất ở hàng chục. Số bé nhất: chữ số bé nhất khác 0 ở hàng chục.', 'Greatest: the biggest digit in the tens place. Smallest: the smallest digit that is not 0 in the tens place.') });
    } },

    /* ================= cả năm (cuoi-nam): to 1000, × : with 2 and 5, dm / m / km, money, chance ================= */

    // "Cho bốn chữ số 5, 3, 0, 8. Hãy viết số lớn nhất và số nhỏ nhất có ba chữ số khác nhau…"
    { id: 'g2-nc-ba-chu-so', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g2-c10-b53', gen: rng => {
      const t = draw(() => {
        const zero = R(rng, 0, 1) === 1, ds = U.shuffle(rng, (zero ? [0] : []).concat(U.sample(rng, range(1, 8), zero ? 3 : 4)));
        const desc = ds.slice().sort((p, q) => q - p), mx = desc[0] * 100 + desc[1] * 10 + desc[2];
        const nz = ds.filter(z => z > 0).sort((p, q) => p - q)[0], rest = ds.filter(z => z !== nz).sort((p, q) => p - q), mn = nz * 100 + rest[0] * 10 + rest[1];
        return { zero, ds, desc, mx, nz, rest, mn, f: R(rng, 0, 2) };
      }, o => o.f < 2 || carries(o.mx, o.mn, M) <= 1, null) || { zero: true, ds: [5, 3, 0, 8], desc: [8, 5, 3, 0], mx: 853, nz: 3, rest: [0, 5, 8], mn: 305, f: 2 };
      const list = t.ds.join(', ');
      const exMax = L(`Số lớn nhất: chữ số hàng trăm là ${t.desc[0]}, hàng chục là ${t.desc[1]}, hàng đơn vị là ${t.desc[2]}: ${t.mx}.`, `The greatest: ${t.desc[0]} hundreds, ${t.desc[1]} tens and ${t.desc[2]} ones: ${t.mx}.`);
      const exMin = L(`Số bé nhất: chữ số hàng trăm là chữ số bé nhất khác 0 (${t.nz}), rồi đến ${t.rest[0]} và ${t.rest[1]}: ${t.mn}.`, `The smallest: the hundreds digit is the smallest digit that is not 0 (${t.nz}), then ${t.rest[0]} and ${t.rest[1]}: ${t.mn}.`);
      const head = L(`Cho bốn chữ số ${list}.`, `Here are four digits: ${list}.`);
      if (t.f === 2) {
        const r = t.mx - t.mn;
        return NC.Q(`${head} ${L('Tìm hiệu của số lớn nhất và số bé nhất có ba chữ số khác nhau viết được từ bốn chữ số đó.', 'Find the difference between the greatest and the smallest three-digit numbers with three different digits that you can write with them.')}`,
          NC.num(r), `${exMax} ${exMin} ${t.mx} ${M} ${t.mn} = ${r}.`);
      }
      const big = t.f === 0;
      return NC.Q(`${head} ${L(`Hãy viết số ${big ? 'lớn nhất' : 'bé nhất'} có ba chữ số khác nhau từ các chữ số đó.`, `Write the ${big ? 'greatest' : 'smallest'} three-digit number with three different digits that you can make with them.`)}`,
        NC.num(big ? t.mx : t.mn), big ? exMax : exMin, { hint: L('So sánh từ hàng trăm. Chữ số 0 không đứng ở hàng trăm.', 'Compare from the hundreds. 0 cannot be the hundreds digit.') });
    } },

    // "Tìm hiệu của số lớn nhất có ba chữ số khác nhau và số bé nhất có ba chữ số"
    { id: 'g2-nc-so-dac-biet-1000', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g2-c12-b62', gen: rng => {
      const SP = [
        [999, 'số lớn nhất có ba chữ số', 'the greatest three-digit number'],
        [100, 'số bé nhất có ba chữ số', 'the smallest three-digit number'],
        [987, 'số lớn nhất có ba chữ số khác nhau', 'the greatest three-digit number with three different digits'],
        [102, 'số bé nhất có ba chữ số khác nhau', 'the smallest three-digit number with three different digits'],
        [900, 'số tròn trăm lớn nhất có ba chữ số', 'the greatest three-digit multiple of 100'],
        [990, 'số tròn chục lớn nhất có ba chữ số', 'the greatest three-digit multiple of 10'],
        [111, 'số bé nhất có ba chữ số giống nhau', 'the smallest three-digit number with all three digits the same'],
        [99, 'số lớn nhất có hai chữ số', 'the greatest two-digit number'],
        [98, 'số lớn nhất có hai chữ số khác nhau', 'the greatest two-digit number with two different digits'],
      ];
      const d = draw(() => {
        if (R(rng, 0, 1)) { const [A, B] = U.sample(rng, SP, 2).sort((p, q) => q[0] - p[0]); return { A, B, x: null, op: M }; }
        const A = P(rng, SP), x = R(rng, 0, 1) ? R(rng, 1, 8) * 100 + R(rng, 0, 9) * 10 : R(rng, 101, 899), op = P(rng, ['+', M]);
        return { A, x, op, rev: op === M && x > A[0] };
      }, o => {
        const a = o.x == null ? o.A[0] : o.rev ? o.x : o.A[0], b = o.x == null ? o.B[0] : o.rev ? o.A[0] : o.x;
        const r = calc(a, b, o.op);
        return a !== b && r >= 1 && r <= 900 && carries(a, b, o.op) <= 1;
      }, { A: SP[2], B: SP[1], x: null, op: M });
      let a, b, prompt, ex;
      if (d.x == null) {
        a = d.A[0]; b = d.B[0];
        prompt = L(`Tìm hiệu của ${d.A[1]} và ${d.B[1]}.`, `Find the difference between ${d.A[2]} and ${d.B[2]}.`);
        ex = L(`${cap(d.A[1])} là ${a}; ${d.B[1]} là ${b}.`, `${cap(d.A[2])} is ${a}; ${d.B[2]} is ${b}.`);
      } else {
        [a, b] = d.rev ? [d.x, d.A[0]] : [d.A[0], d.x];
        prompt = d.op === '+' ? L(`Tìm tổng của ${d.A[1]} và ${d.x}.`, `Find the sum of ${d.A[2]} and ${d.x}.`)
          : d.rev ? L(`Tìm hiệu của ${d.x} và ${d.A[1]}.`, `Find the difference between ${d.x} and ${d.A[2]}.`) : L(`Tìm hiệu của ${d.A[1]} và ${d.x}.`, `Find the difference between ${d.A[2]} and ${d.x}.`);
        ex = L(`${cap(d.A[1])} là ${d.A[0]}.`, `${cap(d.A[2])} is ${d.A[0]}.`);
      }
      const r = calc(a, b, d.op);
      return NC.Q(prompt, NC.num(r), `${ex} ${a} ${d.op} ${b} = ${r}.`, { hint: L('Viết các số đó ra trước, rồi mới tính.', 'Write those numbers down first, then calculate.') });
    } },

    // chắc chắn / có thể / không thể when several balls are taken at once, or after a colour is taken out
    { id: 'g2-nc-kha-nang', from: 'cuoi-nam', kinds: ['tn'], lesson: 'g2-c13-b66', gen: rng => {
      const CH = EN ? ['Certain', 'Possible', 'Impossible'] : ['Chắc chắn', 'Có thể', 'Không thể'];
      const [Rc, Bc] = U.sample(rng, COL, 2), x = NC.name(rng), want = R(rng, 0, 2);
      const balls = n => (n === 1 ? 'ball' : 'balls');
      let r, b, k, form;
      if (want === 0) {
        if (R(rng, 0, 2) === 0) { form = 3; r = R(rng, 1, 4); b = R(rng, 1, 5); k = 1; }
        // more than the red balls but not every ball in the box
        else { form = 1; r = R(rng, 1, 3); b = R(rng, 2, 4); k = r + R(rng, 1, b - 1); }
      } else if (want === 1) {
        form = P(rng, [1, 2]); k = R(rng, 2, 3); r = R(rng, k, 5); b = R(rng, 1, 4);
      } else if (R(rng, 0, 2) === 0) { form = 4; r = R(rng, 1, 4); b = R(rng, 1, 5); k = 1; }
      else { form = 2; r = R(rng, 1, 3); k = R(rng, r + 1, r + 2); b = R(rng, k - r + 1, 5); }
      const box = L(`Trong hộp có ${r} quả bóng ${Rc.n} và ${b} quả bóng ${Bc.n}.`, `In the box there ${r === 1 ? 'is' : 'are'} ${r} ${Rc.en} ${balls(r)} and ${b} ${Bc.en} ${balls(b)}.`);
      let prompt, ex;
      if (form === 1 || form === 2) {
        const take = L(`Không nhìn, lấy ra cùng lúc ${k} quả bóng.`, `Without looking, you take out ${k} balls at the same time.`);
        if (form === 1) {
          prompt = `${box} ${take}\n${L(`… có quả bóng ${Bc.n} trong ${k} quả lấy ra.`, `It is … that there is a ${Bc.en} ball among the ${k} balls.`)}`;
          ex = k > r ? L(`Hộp chỉ có ${r} quả bóng ${Rc.n}, ít hơn ${k}, nên ${k} quả lấy ra không thể toàn bóng ${Rc.n}. Vậy chắc chắn có quả bóng ${Bc.n}.`, `There ${r === 1 ? 'is' : 'are'} only ${r} ${Rc.en} ${balls(r)}, fewer than ${k}, so the ${k} balls cannot all be ${Rc.en}. So it is certain that there is a ${Bc.en} ball.`)
            : L(`Hộp có ${r} quả bóng ${Rc.n}, nên ${k} quả lấy ra có thể đều là bóng ${Rc.n}, cũng có thể có bóng ${Bc.n}. Vậy có thể.`, `There are ${r} ${Rc.en} balls, so the ${k} balls might all be ${Rc.en}, or there might be a ${Bc.en} one. So it is possible.`);
        } else {
          prompt = `${box} ${take}\n${L(`… cả ${k} quả lấy ra đều là bóng ${Rc.n}.`, `It is … that all ${k} balls are ${Rc.en}.`)}`;
          ex = r < k ? L(`Hộp chỉ có ${r} quả bóng ${Rc.n}, ít hơn ${k}, nên không thể lấy được ${k} quả đều là bóng ${Rc.n}.`, `There ${r === 1 ? 'is' : 'are'} only ${r} ${Rc.en} ${balls(r)}, fewer than ${k}, so it is impossible for all ${k} to be ${Rc.en}.`)
            : L(`Hộp có ${r} quả bóng ${Rc.n} nên có thể lấy được ${k} quả đều là bóng ${Rc.n}; nhưng cũng có thể lấy phải bóng ${Bc.n}. Vậy có thể.`, `There are ${r} ${Rc.en} balls, so all ${k} might be ${Rc.en}, but you might also get a ${Bc.en} one. So it is possible.`);
        }
      } else {
        const ask = form === 3 ? Bc : Rc;
        prompt = `${box} ${L(`${x} lấy hết các quả bóng ${Rc.n} ra khỏi hộp. Sau đó, không nhìn, ${x} lấy 1 quả bóng trong hộp.`, `${x} takes all the ${Rc.en} balls out of the box. Then, without looking, ${x} takes 1 ball from the box.`)}\n${L(`… ${x} lấy được quả bóng ${ask.n}.`, `It is … that ${x} gets a ${ask.en} ball.`)}`;
        ex = form === 3 ? L(`Trong hộp chỉ còn bóng ${Bc.n}, nên chắc chắn lấy được bóng ${Bc.n}.`, `Only ${Bc.en} balls are left in the box, so it is certain that ${x} gets a ${Bc.en} ball.`)
          : L(`Trong hộp không còn quả bóng ${Rc.n} nào, nên không thể lấy được bóng ${Rc.n}.`, `There are no ${Rc.en} balls left in the box, so it is impossible to get one.`);
      }
      return NC.Q(prompt, { kind: 'choice', options: CH.slice(), correct: want }, ex,
        { visual: { type: 'chance', params: { items: [{ color: Rc.c, count: r }, { color: Bc.c, count: b }] } }, hint: L('Đếm số bóng mỗi màu rồi so với số bóng lấy ra.', 'Count the balls of each colour and compare with how many are taken.') });
    } },

    // money, one step backwards: the price from the change, the money at first, "rẻ hơn" → add
    { id: 'g2-nc-tien', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g2-c11-b56', gen: rng => {
      const ITEMS = [['cái bút chì', 'pencil'], ['cái thước kẻ', 'ruler'], ['cái tẩy', 'rubber'], ['quyển truyện', 'storybook'], ['gói bánh', 'packet of biscuits'], ['hộp bút màu', 'box of crayons']];
      const [it, ie] = P(rng, ITEMS), x = NC.name(rng), f = R(rng, 0, 2), D = L('đồng', 'dong');
      if (f === 0) {
        const c = R(rng, 1, 8) * 100, v = 1000 - c;
        return NC.Q(L(`${x} đưa cô bán hàng tờ 1000 đồng để mua một ${it} và được cô trả lại ${c} đồng. Hỏi ${it} giá bao nhiêu tiền?`, `${x} gives the shopkeeper a 1000 dong note for a ${ie} and gets ${c} dong change. How much does the ${ie} cost?`),
          NC.num(v, D), L(`Giá tiền ${it} bằng số tiền đưa trừ đi số tiền được trả lại: 1000 ${M} ${c} = ${v} (đồng).`, `The price is the money given minus the change: 1000 ${M} ${c} = ${v} (dong).`),
          { hint: L('Tiền đưa = giá tiền + tiền trả lại.', 'Money given = price + change.') });
      }
      const [p, q] = draw(() => [R(rng, 2, 14) * 50, R(rng, 1, 12) * 50], ([a, b]) => a + b <= 900 && carries(a, b, '+') <= 1, [350, 250]);
      const v = p + q;
      if (f === 1) {
        return NC.Q(L(`Sau khi mua một ${it} giá ${p} đồng, ${x} còn lại ${q} đồng. Hỏi lúc đầu ${x} có bao nhiêu tiền?`, `After buying a ${ie} for ${p} dong, ${x} has ${q} dong left. How much money did ${x} have at first?`),
          NC.num(v, D), L(`Tiền lúc đầu gồm tiền đã mua ${it} và tiền còn lại: ${p} + ${q} = ${v} (đồng).`, `The money at first is the money spent and the money left: ${p} + ${q} = ${v} (dong).`));
      }
      return NC.Q(L(`Quyển vở giá ${p} đồng. Quyển vở rẻ hơn ${it} ${q} đồng. Hỏi ${it} giá bao nhiêu tiền?`, `An exercise book costs ${p} dong. The exercise book is ${q} dong cheaper than the ${ie}. How much does the ${ie} cost?`),
        NC.num(v, D), L(`Quyển vở rẻ hơn ${q} đồng, tức là ${it} đắt hơn quyển vở ${q} đồng: ${p} + ${q} = ${v} (đồng).`, `The exercise book is ${q} dong cheaper, so the ${ie} costs ${q} dong more: ${p} + ${q} = ${v} (dong).`),
        { hint: L('Đọc kĩ: món nào đắt hơn?', 'Read carefully: which one costs more?') });
    } },

    // × or : with the tables of 2 and 5 — the child has to choose the operation
    { id: 'g2-nc-nhan-chia', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g2-c8-b44', gen: rng => {
      const f = R(rng, 0, 5), x = NC.name(rng), k = R(rng, 3, 10);
      if (f === 0) {
        return NC.Q(L(`Mỗi con gà có 2 chân. Đếm được tất cả ${2 * k} chân gà. Hỏi có bao nhiêu con gà?`, `Each hen has 2 legs. There are ${2 * k} legs altogether. How many hens are there?`),
          NC.num(k, L('con gà', 'hens')), L(`Mỗi con có 2 chân, nên số con gà là: ${2 * k} : 2 = ${k} (con).`, `Each hen has 2 legs, so the number of hens is ${2 * k} : 2 = ${k}.`), { hint: L('Chia số chân thành từng nhóm 2 chân.', 'Split the legs into groups of 2.') });
      }
      if (f === 1) {
        return NC.Q(L(`Có ${k} đôi đũa. Hỏi có tất cả bao nhiêu chiếc đũa?`, `There are ${k} pairs of chopsticks. How many chopsticks are there altogether?`),
          NC.num(2 * k, L('chiếc đũa', 'chopsticks')), L(`Mỗi đôi đũa có 2 chiếc: 2 × ${k} = ${2 * k} (chiếc).`, `Each pair has 2 chopsticks: 2 × ${k} = ${2 * k}.`), { hint: L('Một đôi đũa có mấy chiếc?', 'How many chopsticks are in a pair?') });
      }
      if (f === 2) {
        return NC.Q(L(`Mỗi bàn tay có 5 ngón tay. Hỏi ${5 * k} ngón tay là của mấy bàn tay?`, `Each hand has 5 fingers. How many hands have ${5 * k} fingers altogether?`),
          NC.num(k, L('bàn tay', 'hands')), L(`Số bàn tay là: ${5 * k} : 5 = ${k} (bàn tay).`, `The number of hands is ${5 * k} : 5 = ${k}.`));
      }
      if (f === 3) {
        const g = P(rng, [2, 5]), n = g * k;
        return NC.Q(L(`Có ${n} bạn xếp đều thành ${g} hàng. Hỏi mỗi hàng có mấy bạn?`, `${n} children line up in ${g} equal rows. How many children are in each row?`),
          NC.num(k, L('bạn', 'children')), L(`Chia đều ${n} bạn thành ${g} hàng: ${n} : ${g} = ${k} (bạn).`, `Share ${n} children equally into ${g} rows: ${n} : ${g} = ${k}.`));
      }
      if (f === 4) {
        const q = P(rng, [2, 5]), n = q * k;
        return NC.Q(L(`Có ${n} quả cam xếp vào các đĩa, mỗi đĩa ${q} quả. Hỏi xếp được mấy đĩa cam?`, `${n} oranges are put on plates, ${q} on each plate. How many plates are needed?`),
          NC.num(k, L('đĩa', 'plates')), L(`Mỗi đĩa ${q} quả, nên số đĩa là: ${n} : ${q} = ${k} (đĩa).`, `${q} on each plate, so the number of plates is ${n} : ${q} = ${k}.`));
      }
      const q = P(rng, [2, 5]), week = R(rng, 0, 1) === 1, dd = week ? 7 : k;
      return NC.Q(L(`Mỗi ngày ${x} đọc ${q} trang sách. Hỏi trong ${week ? '1 tuần lễ' : `${dd} ngày`} ${x} đọc được bao nhiêu trang sách?`, `${x} reads ${q} pages every day. How many pages does ${x} read in ${week ? '1 week' : `${dd} days`}?`),
        NC.num(q * dd, L('trang', 'pages')), L(`${week ? '1 tuần lễ có 7 ngày. ' : ''}Mỗi ngày ${q} trang, ${dd} ngày đọc được: ${q} × ${dd} = ${q * dd} (trang).`, `${week ? '1 week has 7 days. ' : ''}${q} pages a day for ${dd} days: ${q} × ${dd} = ${q * dd} (pages).`),
        week ? { hint: L('Một tuần lễ có mấy ngày?', 'How many days are there in a week?') } : {});
    } },

    // the unknown in × and : ("? : 5 = 7", "5 × ? = 45", "20 : ? = 4")
    { id: 'g2-nc-tim-thanh-phan', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g2-c8-b42', gen: rng => {
      const f = R(rng, 0, 3), d = P(rng, [2, 5]), q = R(rng, 2, 10), p = d * q;
      if (f === 0 || f === 3) {
        const prompt = f === 0 ? L(`Số?\n? : ${d} = ${q}`, `Find the missing number:\n? : ${d} = ${q}`) : L(`Tìm một số, biết rằng lấy số đó chia cho ${d} thì được ${q}.`, `Find the number. When you divide the number by ${d}, you get ${q}.`);
        return NC.Q(prompt, NC.num(p), L(`Vì ${d} × ${q} = ${p} nên ${p} : ${d} = ${q}. Số cần tìm là ${p}.`, `${d} × ${q} = ${p}, so ${p} : ${d} = ${q}. The number is ${p}.`),
          { hint: L(`Số nào chia cho ${d} được ${q}? Dùng bảng nhân ${d}.`, `Which number divided by ${d} makes ${q}? Use the ${d} times table.`) });
      }
      if (f === 1) {
        return NC.Q(L(`Số?\n${d} × ? = ${p}`, `Find the missing number:\n${d} × ? = ${p}`), NC.num(q), L(`${p} : ${d} = ${q}, vì ${d} × ${q} = ${p}. Số cần tìm là ${q}.`, `${p} : ${d} = ${q}, because ${d} × ${q} = ${p}. The number is ${q}.`));
      }
      return NC.Q(L(`Số?\n${p} : ? = ${q}`, `Find the missing number:\n${p} : ? = ${q}`), NC.num(d), L(`Vì ${d} × ${q} = ${p} nên ${p} : ${d} = ${q}. Số cần tìm là ${d}.`, `${d} × ${q} = ${p}, so ${p} : ${d} = ${q}. The number is ${d}.`));
    } },

    // lengths with a conversion inside: "Quân cao 9 dm 4 cm, Kiên thấp hơn Quân 5 cm…", 1 km = 1000 m
    { id: 'g2-nc-do-dai', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g2-c11-b55', gen: rng => {
      const f = R(rng, 0, 3), [x, y] = NC.names(rng, 2);
      if (f === 0) {
        const [H, k] = draw(() => [R(rng, 11, 13) * 10 + R(rng, 1, 9), R(rng, 3, 19)], ([h, q]) => carries(h, q, M) === 1, [124, 5]), v = H - k;
        const dm = Math.floor(H / 10), cm = H % 10, taller = R(rng, 0, 2) === 0, w = taller ? H + k : v;
        return NC.Q(L(`${x} cao ${dm} dm ${cm} cm, ${y} ${taller ? 'cao hơn' : 'thấp hơn'} ${x} ${k} cm. Hỏi ${y} cao bao nhiêu xăng-ti-mét?`, `${x} is ${dm} dm ${cm} cm tall. ${y} is ${k} cm ${taller ? 'taller' : 'shorter'} than ${x}. How tall is ${y} in centimetres?`),
          NC.num(w, 'cm'), L(`Đổi: ${dm} dm ${cm} cm = ${H} cm. ${y} cao: ${H} ${taller ? '+' : M} ${k} = ${w} (cm).`, `Change the units: ${dm} dm ${cm} cm = ${H} cm. ${y} is ${H} ${taller ? '+' : M} ${k} = ${w} (cm).`),
          { hint: L('1 dm = 10 cm. Đổi về xăng-ti-mét trước.', '1 dm = 10 cm. Change to centimetres first.') });
      }
      if (f === 1) {
        const d = P(rng, [2, 3, 4]), k = draw(() => R(rng, 3, 19), q => q % 10 !== 0, 12), v = d * 10 - k;
        return NC.Q(L(`Thước kẻ dài ${d} dm. Bút chì ngắn hơn thước kẻ ${k} cm. Hỏi bút chì dài bao nhiêu xăng-ti-mét?`, `A ruler is ${d} dm long. A pencil is ${k} cm shorter than the ruler. How long is the pencil in centimetres?`),
          NC.num(v, 'cm'), L(`Đổi: ${d} dm = ${d * 10} cm. Bút chì dài: ${d * 10} ${M} ${k} = ${v} (cm).`, `Change the units: ${d} dm = ${d * 10} cm. The pencil is ${d * 10} ${M} ${k} = ${v} (cm).`),
          { hint: L('1 dm = 10 cm.', '1 dm = 10 cm.') });
      }
      if (f === 2) {
        const a = R(rng, 1, 9) * 100, v = 1000 - a;
        return NC.Q(L(`Quãng đường từ nhà ${x} đến trường dài 1 km. ${x} đã đi được ${a} m. Hỏi ${x} còn phải đi bao nhiêu mét nữa thì đến trường?`, `It is 1 km from ${x}’s home to school. ${x} has walked ${a} m. How many more metres does ${x} have to walk to get to school?`),
          NC.num(v, 'm'), L(`Đổi: 1 km = 1000 m. ${x} còn phải đi: 1000 ${M} ${a} = ${v} (m).`, `Change the units: 1 km = 1000 m. ${x} still has to walk 1000 ${M} ${a} = ${v} (m).`),
          { hint: L('1 km = 1000 m.', '1 km = 1000 m.') });
      }
      const m = P(rng, [1, 2, 3]), k = R(rng, 5, 60), v = m * 100 + k;
      return NC.Q(L(`Sợi dây thứ nhất dài ${m} m. Sợi dây thứ hai dài hơn sợi dây thứ nhất ${k} cm. Hỏi sợi dây thứ hai dài bao nhiêu xăng-ti-mét?`, `The first piece of rope is ${m} m long. The second piece is ${k} cm longer than the first. How long is the second piece in centimetres?`),
        NC.num(v, 'cm'), L(`Đổi: ${m} m = ${m * 100} cm. Sợi dây thứ hai dài: ${m * 100} + ${k} = ${v} (cm).`, `Change the units: ${m} m = ${m * 100} cm. The second piece is ${m * 100} + ${k} = ${v} (cm).`),
        { hint: L('1 m = 100 cm.', '1 m = 100 cm.') });
    } },

    // reversed wording with three-digit numbers and one carry
    { id: 'g2-nc-hon-kem-1000', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g2-c12-b60', gen: rng => {
      const f = R(rng, 0, 2), add = f !== 1;
      const [a, k] = add ? pair(rng, [150, 700], [15, 250], '+', 900, true, [465, 28]) : pair(rng, [250, 900], [15, 250], M, 900, true, [532, 46]);
      const v = add ? a + k : a - k, o = add ? '+' : M;
      if (f === 0) {
        const [A, B] = U.sample(rng, ['Hòa Bình', 'Sao Mai', 'Ánh Dương', 'Hoa Sen', 'Quang Trung'], 2);
        return NC.Q(L(`Trường ${A} có ${a} học sinh, ít hơn trường ${B} ${k} học sinh. Hỏi trường ${B} có bao nhiêu học sinh?`, `${A} School has ${a} pupils. That is ${k} fewer than ${B} School. How many pupils does ${B} School have?`),
          NC.num(v, L('học sinh', 'pupils')), L(`Trường ${A} ít hơn ${k} học sinh, tức là trường ${B} nhiều hơn ${k} học sinh: ${a} ${o} ${k} = ${v} (học sinh).`, `${A} School has ${k} fewer, so ${B} School has ${k} more: ${a} ${o} ${k} = ${v} (pupils).`),
          { hint: L('Đọc kĩ: trường nào nhiều học sinh hơn?', 'Read carefully: which school has more pupils?') });
      }
      if (f === 1) {
        return NC.Q(L(`Đội Một trồng được ${a} cây, nhiều hơn đội Hai ${k} cây. Hỏi đội Hai trồng được bao nhiêu cây?`, `Team One planted ${a} trees. That is ${k} more than Team Two. How many trees did Team Two plant?`),
          NC.num(v, L('cây', 'trees')), L(`Đội Một nhiều hơn ${k} cây, tức là đội Hai ít hơn ${k} cây: ${a} ${o} ${k} = ${v} (cây).`, `Team One planted ${k} more, so Team Two planted ${k} fewer: ${a} ${o} ${k} = ${v} (trees).`),
          { hint: L('Đọc kĩ: đội nào trồng nhiều hơn?', 'Read carefully: which team planted more?') });
      }
      return NC.Q(L(`Buổi sáng cửa hàng bán được ${a} kg gạo. Buổi sáng bán ít hơn buổi chiều ${k} kg gạo. Hỏi buổi chiều cửa hàng bán được bao nhiêu ki-lô-gam gạo?`, `In the morning a shop sold ${a} kg of rice. That is ${k} kg less than in the afternoon. How many kilograms of rice did the shop sell in the afternoon?`),
        NC.num(v, 'kg'), L(`Buổi sáng bán ít hơn ${k} kg, tức là buổi chiều bán nhiều hơn ${k} kg: ${a} ${o} ${k} = ${v} (kg).`, `The morning was ${k} kg less, so the afternoon was ${k} kg more: ${a} ${o} ${k} = ${v} (kg).`));
    } },

    /* ================= Đặt tính rồi tính ================= */

    // học kì I: 100 − 65, 100 − 7
    { id: 'g2-dt-tru-100', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g2-c4-b23', gen: rng => {
      const b = R(rng, 0, 3) === 0 ? R(rng, 2, 9) : draw(() => R(rng, 11, 98), x => x % 10 !== 0, 65);
      return dt(100, b, M);
    } },
    // học kì I: 60 − 43 (a round ten on top), 94 − 57, 52 − 47
    { id: 'g2-dt-tru-co-nho', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g2-c4-b23', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) { const a = R(rng, 3, 9) * 10, b = draw(() => R(rng, 11, a - 1), x => x % 10 !== 0, 43); return dt(a, b, M); }
      if (f === 1) { const [a, b] = draw(() => [R(rng, 41, 98), R(rng, 15, 89)], ([p, q]) => p % 10 < q % 10 && p - q >= 12, [94, 57]); return dt(a, b, M); }
      // 52 − 47: the answer has one digit
      const [a, b] = draw(() => [R(rng, 21, 98), R(rng, 13, 89)], ([p, q]) => p > q && p - q < 10 && p % 10 < q % 10, [52, 47]);
      return dt(a, b, M);
    } },
    // học kì I: 37 + 43 (a round answer), 8 + 57 (the one-digit number on top), 48 + 37
    { id: 'g2-dt-cong-co-nho', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g2-c4-b20', gen: rng => {
      const f = R(rng, 0, 2);
      if (f === 0) { const [a, b] = draw(() => [R(rng, 11, 79), R(rng, 11, 79)], ([p, q]) => p % 10 && (p + q) % 10 === 0 && p + q <= 90, [37, 43]); return dt(a, b, '+'); }
      if (f === 1) { const [a, b] = draw(() => [R(rng, 3, 9), R(rng, 21, 89)], ([p, q]) => p + q % 10 >= 10 && p + q <= 99, [8, 57]); return dt(a, b, '+'); }
      const [a, b] = pair(rng, [15, 79], [15, 79], '+', 99, true, [48, 37]);
      return dt(a, b, '+');
    } },
    // học kì II: three-digit + three- or two-digit with one carry, a 0 somewhere (408 + 275, 360 + 248, 547 + 38)
    { id: 'g2-dt-cong-3-chu-so', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g2-c12-b60', gen: rng => {
      const two = R(rng, 0, 2) === 0;
      const [a, b] = draw(() => [R(rng, 101, 899), two ? R(rng, 12, 98) : R(rng, 101, 799)],
        ([p, q]) => p + q <= 999 && carries(p, q, '+') === 1 && /0/.test(`${p}${q}${p + q}`), [408, 275]);
      return R(rng, 0, 1) && !two ? dt(b, a, '+') : dt(a, b, '+');
    } },
    // học kì II: three-digit − three- or two-digit with one borrow and a 0 (507 − 234, 352 − 47, 524 − 516)
    { id: 'g2-dt-tru-3-chu-so', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g2-c12-b62', gen: rng => {
      const f = R(rng, 0, 2);
      const [a, b] = f === 0
        ? draw(() => { const h = R(rng, 2, 9) * 100; return [R(rng, 0, 1) ? h + R(rng, 1, 9) : h + R(rng, 1, 9) * 10, R(rng, 101, 899)]; }, ([p, q]) => p > q && carries(p, q, M) === 1, [507, 234])
        : f === 1 ? draw(() => [R(rng, 120, 999), R(rng, 12, 98)], ([p, q]) => carries(p, q, M) === 1 && /0/.test(String(p - q)), [352, 47])
          : draw(() => { const h = R(rng, 1, 9) * 100; return [h + R(rng, 10, 99), h + R(rng, 1, 98)]; }, ([p, q]) => p > q && carries(p, q, M) === 1, [524, 516]);
      return dt(a, b, M);
    } },
  ]);
})();
