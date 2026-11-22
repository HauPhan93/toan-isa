/* Toán ISA — Lớp 1 (SGK Toán 1 "Kết nối tri thức với cuộc sống", GDPT 2018).
 * One lesson per practisable KNTT "Bài"; "Luyện tập chung", "Ôn tập", hands-on "Thực hành lắp ghép, xếp hình"
 * and "Tiết học đầu tiên" are skipped. Ids: g1-c{chủ đề index}-b{Bài number}. Never rename ids.
 * The child is 6: very short prompts, always a picture, big-number choices, numbers 0–100,
 * + / − within 10 in HK1 and within 100 without carrying (không nhớ) in HK2.
 */
(function () {
  'use strict';
  window.CURRICULUM = window.CURRICULUM || [];
  const R = U.rand, P = U.pick;
  const M = '−'; // real minus sign U+2212
  // T(vi, en) is U.L of I18N.md: named T here because L is the difficulty level inside the generators.
  const T = U.L, EN = U.EN;
  // English helpers: "1 apple" / "3 apples", "is" / "are", 1st 2nd 3rd 4th…, month names
  const pl = (n, sg, p) => `${n} ${n === 1 ? sg : p}`;
  const isAre = n => (n === 1 ? 'is' : 'are');
  const ord = d => d + (d % 10 === 1 && d % 100 !== 11 ? 'st' : d % 10 === 2 && d % 100 !== 12 ? 'nd' : d % 10 === 3 && d % 100 !== 13 ? 'rd' : 'th');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const tensOnes = (t, o) => `${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}`;

  // ---------- small helpers ----------
  const lv = i => (i < 3 ? 0 : i < 7 ? 1 : 2);
  const vz = (type, params) => ({ type, params });
  const num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });
  const cmpAns = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b ? 0 : a > b ? 1 : 2 });
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const nm = rng => P(rng, U.NAMES);
  /** Choice with fixed option order (e.g. ['Nhiều hơn', 'Ít hơn', 'Bằng nhau']). */
  const fixed = (options, correct) => ({ kind: 'choice', options, correct: options.indexOf(correct) });
  /** Number choice: correct + near distractors in [lo, hi], shown in increasing order (big number buttons). */
  function nCh(rng, n, lo, hi, f, step) {
    const s = step || 1;
    const cand = U.shuffle(rng, [n - s, n + s]).concat(U.shuffle(rng, [n - 2 * s, n + 2 * s, n + 3 * s, n - 3 * s, n + 10, n - 10, n + 1, n - 1]));
    const set = [n];
    for (const c of cand) if (c >= lo && c <= hi && !set.includes(c) && set.length < 4) set.push(c);
    set.sort((a, b) => a - b);
    const fm = f || (x => String(x));
    return { kind: 'choice', options: set.map(fm), correct: set.indexOf(n) };
  }
  /** Read-aloud text for prompts with maths symbols. */
  function say(s) {
    return s.replace(/(^|\s)\?(?=\s|$)/gm, '$1mấy').replace(/\+/g, ' cộng ').replace(/−/g, ' trừ ').replace(/=/g, ' bằng ')
      .replace(/…/g, ' chấm chấm ').replace(/</g, ' bé hơn ').replace(/>/g, ' lớn hơn ').replace(/\n/g, '. ').replace(/\s+/g, ' ').trim();
  }
  /** English read-aloud for the same prompts. */
  function sayEN(s) {
    return s.replace(/(^|\s)\?(?=\s|$)/gm, '$1what').replace(/\+/g, ' plus ').replace(/−/g, ' minus ').replace(/=/g, ' equals ')
      .replace(/…/g, ' blank ').replace(/</g, ' is less than ').replace(/>/g, ' is greater than ').replace(/[.:]?\n/g, '. ').replace(/\s+/g, ' ').trim();
  }
  function Q(prompt, visual, answer, hint, explain, extra) {
    const q = { prompt, answer, hint, explain };
    if (visual) q.visual = visual;
    if (/[+−=…<>]/.test(prompt) || /(^|\s)\?(\s|$)/m.test(prompt)) q.speak = EN ? sayEN(prompt) : say(prompt);
    return Object.assign(q, extra || {});
  }
  function noCarry(a, b) { while (a > 0 || b > 0) { if (a % 10 + b % 10 >= 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function noBorrow(a, b) { while (b > 0) { if (a % 10 < b % 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function pairWhere(rng, ra, rb, ok, fb) {
    for (let g = 0; g < 600; g++) {
      const a = R(rng, ra[0], ra[1]), b = R(rng, rb[0], rb[1]);
      if (ok(a, b)) return [a, b];
    }
    return fb;
  }

  const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function readVN(n) {
    if (n === 100) return 'một trăm';
    if (n < 10) return DIG[n];
    const t = Math.floor(n / 10), o = n % 10, out = [t === 1 ? 'mười' : DIG[t] + ' mươi'];
    if (o === 1) out.push(t === 1 ? 'một' : 'mốt');
    else if (o === 4) out.push(t === 1 ? 'bốn' : 'tư');
    else if (o === 5) out.push('lăm');
    else if (o > 0) out.push(DIG[o]);
    return out.join(' ');
  }

  // s / p: English singular / plural
  const ITEMS = [
    { n: 'con cá', e: '🐟', s: 'fish', p: 'fish' }, { n: 'quả táo', e: '🍎', s: 'apple', p: 'apples' }, { n: 'con gà', e: '🐔', s: 'chicken', p: 'chickens' }, { n: 'bông hoa', e: '🌸', s: 'flower', p: 'flowers' },
    { n: 'quả bóng', e: '⚽', s: 'ball', p: 'balls' }, { n: 'ngôi sao', e: '⭐', s: 'star', p: 'stars' }, { n: 'con vịt', e: '🦆', s: 'duck', p: 'ducks' }, { n: 'cái kẹo', e: '🍬', s: 'sweet', p: 'sweets' },
    { n: 'quả cam', e: '🍊', s: 'orange', p: 'oranges' }, { n: 'con bướm', e: '🦋', s: 'butterfly', p: 'butterflies' }, { n: 'con thỏ', e: '🐰', s: 'rabbit', p: 'rabbits' }, { n: 'quả bóng bay', e: '🎈', s: 'balloon', p: 'balloons' },
    { n: 'cái bút chì', e: '✏️', s: 'pencil', p: 'pencils' }, { n: 'chiếc lá', e: '🍃', s: 'leaf', p: 'leaves' }, { n: 'con ốc', e: '🐌', s: 'snail', p: 'snails' }, { n: 'quả dâu', e: '🍓', s: 'strawberry', p: 'strawberries' },
  ];
  const itn = (it, n) => (n === 1 ? it.s : it.p);
  const obj = (e, n) => vz('objects', { groups: [{ emoji: e, count: n }] });
  const line10 = (extra) => vz('numberLine', Object.assign({ min: 0, max: 10, step: 1, labelEvery: 1 }, extra || {}));

  function lesson(c, b, title, story, learn, gen, more) {
    return Object.assign({ id: `g1-c${c}-b${b}`, title, book: T(`Bài ${b}`, `Lesson ${b}`), story, learn, gen }, more || {});
  }

  // ============ CHỦ ĐỀ 1. CÁC SỐ TỪ 0 ĐẾN 10 ============
  function countGen(lo, hi) {
    return function (rng, i) {
      const L = lv(i), f = i % 5, it = P(rng, ITEMS);
      const a = L === 2 && lo === 0 && R(rng, 0, 3) === 0 ? 0 : Math.max(lo, 1);
      const n = R(rng, a, L === 0 ? Math.min(hi, Math.max(lo, 1) + 2) : hi);
      if (f === 0) return Q(T(`Có mấy ${it.n}?`, `How many ${it.p} are there?`), obj(it.e, n), nCh(rng, n, 0, 10), T('Em chạm tay vào từng hình và đếm: một, hai, ba…', 'Touch each picture and count: one, two, three…'), n === 0 ? T(`Không có ${it.n} nào. Ta viết số 0.`, `There are no ${it.p}. We write 0.`) : T(`Đếm được ${n} ${it.n}.`, `There ${isAre(n)} ${pl(n, it.s, it.p)}.`));
      if (f === 1) {
        const opts = [n, n + 1, n - 1, n + 2].filter(x => x >= 1 && x <= 10).slice(0, 3);
        if (opts.length < 2) opts.push(n + 2);
        const strs = opts.map(k => it.e.repeat(k));
        return Q(T(`Nhóm nào có ${n} ${it.n}?`, `Which group has ${n} ${itn(it, n)}?`), line10({ max: hi <= 5 ? 5 : 10, point: n }),U.choices(rng, strs[0], strs.slice(1)), T(`Đếm từng nhóm, tìm nhóm có đúng ${n}.`, `Count each group. Find the group with exactly ${n}.`), T(`Nhóm có ${n} ${it.n} là nhóm đúng.`, `The group with ${n} ${itn(it, n)} is the right one.`));
      }
      if (f === 2) {
        const max = hi <= 5 ? 5 : 10;
        const u = R(rng, lo === 0 ? 0 : 5, max);
        return Q(T('Số nào còn thiếu trên tia số?', 'Which number is missing on the number line?'), vz('numberLine', { min: 0, max, step: 1, labelEvery: 1, unknown: u, marks: [] }), nCh(rng, u, 0, 10), T('Đếm từ 0 theo tia số: 0, 1, 2, …', 'Count along the number line from 0: 0, 1, 2, …'), T(`Số còn thiếu là ${u}.`, `The missing number is ${u}.`));
      }
      if (f === 3) {
        const m = n === 0 ? R(rng, lo + 1, hi) : n;
        const e = P(rng, ['🔴', '🟡', '🔵', '🟢']);
        return Q(T('Đếm rồi viết số:\nCó mấy chấm tròn?', 'Count, then write the number:\nHow many dots are there?'), obj(e, m), num(m), T('Đếm từ trái sang phải, từng hàng một.', 'Count from left to right, one row at a time.'), T(`Có ${m} chấm tròn.`, `There ${isAre(m)} ${pl(m, 'dot', 'dots')}.`));
      }
      // f === 4: counting order, or tap a number on the line
      if (i === 9 || (i === 4 && hi > 5)) {
        const t = R(rng, Math.max(lo, 1), hi);
        return Q(T(`Chạm vào số ${t} trên tia số.`, `Tap the number ${t} on the number line.`), line10({ max: hi <= 5 ? 5 : 10 }), { kind: 'visual', check: v => v === t }, T(`Tìm số ${t} ở dưới tia số.`, `Find the number ${t} under the number line.`), T(`Số ${t} đây rồi!`, `There is the number ${t}.`));
      }
      const back = L === 2 && R(rng, 0, 1) === 1;
      const top = hi - 3;
      const s0 = R(rng, Math.max(0, lo - 1), Math.max(0, top));
      const seq = [0, 1, 2, 3].map(k => s0 + k);
      if (back) seq.reverse();
      const miss = R(rng, 1, 3);
      const shown = seq.map((v, k) => (k === miss ? '?' : String(v))).join(', ');
      return Q(T(`Đếm ${back ? 'lùi' : 'tiếp'}:\n${shown}`, `Count ${back ? 'back' : 'on'}:\n${shown}`), line10({ max: hi <= 5 ? 5 : 10, marks: seq.filter((_, k) => k !== miss) }), nCh(rng, seq[miss], 0, 10), back ? T('Đếm lùi: mỗi lần bớt 1.', 'Count back: take away 1 each time.') : T('Đếm tiếp: mỗi lần thêm 1.', 'Count on: add 1 each time.'), `${seq.join(', ')}.`);
    };
  }

  // as / ap, bs / bp: English singular / plural
  const PAIRS = [
    { a: '🐰', an: 'con thỏ', b: '🥕', bn: 'củ cà rốt', as: 'rabbit', ap: 'rabbits', bs: 'carrot', bp: 'carrots' }, { a: '☕', an: 'cái cốc', b: '🥄', bn: 'cái thìa', as: 'cup', ap: 'cups', bs: 'spoon', bp: 'spoons' },
    { a: '🐝', an: 'con ong', b: '🌸', bn: 'bông hoa', as: 'bee', ap: 'bees', bs: 'flower', bp: 'flowers' }, { a: '🐶', an: 'con chó', b: '🦴', bn: 'khúc xương', as: 'dog', ap: 'dogs', bs: 'bone', bp: 'bones' },
    { a: '🐵', an: 'con khỉ', b: '🍌', bn: 'quả chuối', as: 'monkey', ap: 'monkeys', bs: 'banana', bp: 'bananas' }, { a: '👧', an: 'bạn nhỏ', b: '🎈', bn: 'quả bóng bay', as: 'child', ap: 'children', bs: 'balloon', bp: 'balloons' },
    { a: '🐔', an: 'con gà', b: '🥚', bn: 'quả trứng', as: 'hen', ap: 'hens', bs: 'egg', bp: 'eggs' },
  ];
  const cap = s0 => s0[0].toUpperCase() + s0.slice(1);
  const MORE3 = EN ? ['More', 'Fewer', 'The same'] : ['Nhiều hơn', 'Ít hơn', 'Bằng nhau'];
  const LR = EN ? ['Left', 'Right'] : ['Bên trái', 'Bên phải'];

  const c1 = {
    id: 'g1-c1', semester: 1, title: T('Các số từ 0 đến 10', 'Numbers from 0 to 10'), icon: '🔢', lessons: [
      lesson(1, 1, T('Các số 0, 1, 2, 3, 4, 5', 'The numbers 0, 1, 2, 3, 4, 5'),
        T('Rô-bốt ISA cùng bạn Mai đếm những chú cá vàng trong bể cá ở nhà bà.', 'ISA the robot and Mai count the goldfish in the fish tank at Grandma’s house.'),
        [
          { text: T('Đếm: một, hai, ba. Có 3 con cá.', 'Count: one, two, three. There are 3 fish.'), visual: obj('🐟', 3) },
          { text: T('Đĩa không có quả táo nào. Ta viết số 0.', 'There are no apples on the plate. We write 0.'), visual: obj('🍎', 0) },
          { text: T('Các số 0, 1, 2, 3, 4, 5.', 'The numbers 0, 1, 2, 3, 4, 5.'), visual: vz('numberLine', { min: 0, max: 5, step: 1, labelEvery: 1 }) },
        ],
        countGen(0, 5)),

      lesson(1, 2, T('Các số 6, 7, 8, 9, 10', 'The numbers 6, 7, 8, 9, 10'),
        T('Rô-bốt ISA giúp bạn Nam đếm những chú gà con chạy quanh sân nhà ông.', 'ISA the robot helps Nam count the chicks running around Grandad’s yard.'),
        [
          { text: T('Có 6 con gà. Đếm: …, năm, sáu.', 'There are 6 chickens. Count: …, five, six.'), visual: obj('🐔', 6) },
          { text: T('Có 10 ngôi sao. Số 10 có hai chữ số.', 'There are 10 stars. The number 10 has two digits.'), visual: obj('⭐', 10) },
          { text: T('Các số từ 0 đến 10.', 'The numbers from 0 to 10.'), visual: line10() },
        ],
        countGen(6, 10)),

      lesson(1, 3, T('Nhiều hơn, ít hơn, bằng nhau', 'More, fewer, the same'),
        T('Rô-bốt ISA và bạn Chi chia cà rốt cho đàn thỏ trong vườn.', 'ISA the robot and Chi give out carrots to the rabbits in the garden.'),
        [
          { text: T('Mỗi con thỏ một củ cà rốt. Còn thừa thỏ: số thỏ nhiều hơn.', 'Each rabbit gets one carrot. A rabbit is left over, so there are more rabbits.'), visual: vz('objects', { groups: [{ emoji: '🐰', count: 4, label: T('Thỏ', 'Rabbits') }, { emoji: '🥕', count: 3, label: T('Cà rốt', 'Carrots') }] }) },
          { text: T('Số cà rốt ít hơn số thỏ.', 'There are fewer carrots than rabbits.'), visual: vz('objects', { groups: [{ emoji: '🐰', count: 4, label: T('Thỏ', 'Rabbits') }, { emoji: '🥕', count: 3, label: T('Cà rốt', 'Carrots') }] }) },
          { text: T('Mỗi cốc một cái thìa, không thừa: số cốc bằng số thìa.', 'Each cup gets one spoon and none are left over: there are as many cups as spoons.'), visual: vz('objects', { groups: [{ emoji: '☕', count: 3, label: T('Cốc', 'Cups') }, { emoji: '🥄', count: 3, label: T('Thìa', 'Spoons') }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, pr = P(rng, PAIRS);
          const hi = L === 0 ? 5 : 7;
          let x = R(rng, 1, hi), y = R(rng, 1, hi);
          const wantEq = f === 3 ? R(rng, 0, 1) === 0 : false;
          if (wantEq) y = x;
          else if (x === y && f !== 3) y = x === 1 ? 2 : x - 1;
          const two = vz('objects', { groups: [{ emoji: pr.a, count: x, label: T(cap(pr.an), cap(pr.ap)) }, { emoji: pr.b, count: y, label: T(cap(pr.bn), cap(pr.bp)) }] });
          const res = x > y ? MORE3[0] : x < y ? MORE3[1] : MORE3[2];
          const why = x === y ? T(`Ghép từng cặp, không thừa. Số ${pr.an} bằng số ${pr.bn}.`, `Match them in pairs: none are left over. There are as many ${pr.ap} as ${pr.bp}.`)
            : x > y ? T(`Ghép từng cặp, còn thừa ra ${pr.an}. Số ${pr.an} nhiều hơn số ${pr.bn}.`, `Match them in pairs: some ${pr.ap} are left over. There are more ${pr.ap} than ${pr.bp}.`)
              : T(`Ghép từng cặp, còn thừa ra ${pr.bn}. Số ${pr.an} ít hơn số ${pr.bn}.`, `Match them in pairs: some ${pr.bp} are left over. There are fewer ${pr.ap} than ${pr.bp}.`);
          const hint = T('Ghép từng cặp một. Bên nào còn thừa thì bên đó nhiều hơn.', 'Match them in pairs, one by one. The side with some left over has more.');
          if (f === 0 || (f === 4 && L === 0)) return Q(T(`Số ${pr.an} nhiều hơn hay ít hơn số ${pr.bn}?`, `Are there more or fewer ${pr.ap} than ${pr.bp}?`), two, fixed(MORE3, res), hint, why);
          if (f === 1 || f === 2) {
            const it = P(rng, ITEMS);
            let a = R(rng, 1, hi), b = R(rng, 1, hi);
            if (a === b) b = a === 1 ? 3 : a - 1;
            const more = f === 1;
            const ans = (more ? a > b : a < b) ? LR[0] : LR[1];
            return Q(T(`Bên nào ${more ? 'nhiều' : 'ít'} ${it.n} hơn?`, `Which side has ${more ? 'more' : 'fewer'} ${it.p}?`), vz('compare', { left: { emoji: it.e, count: a }, right: { emoji: it.e, count: b } }), fixed(LR, ans), hint, T(`Bên trái có ${a}, bên phải có ${b}. ${ans} ${more ? 'nhiều' : 'ít'} hơn.`, `The left side has ${a}. The right side has ${b}. The ${ans.toLowerCase()} side has ${more ? 'more' : 'fewer'}.`));
          }
          if (f === 3) return Q(T(`Số ${pr.an} so với số ${pr.bn} thì thế nào?`, `Compare the ${pr.ap} with the ${pr.bp}. Are there more, fewer or the same number?`), two, fixed(MORE3, res), hint, why);
          // f === 4, L >= 1: how many more to make equal
          let big = R(rng, 3, hi), small = big - R(rng, 1, 2);
          return Q(T(`Cần thêm mấy ${pr.bn} để mỗi ${pr.an} đều có một ${pr.bn}?`, `How many more ${pr.bp} do we need so that each ${pr.as} has one ${pr.bs}?`), vz('objects', { groups: [{ emoji: pr.a, count: big, label: T(cap(pr.an), cap(pr.ap)) }, { emoji: pr.b, count: small, label: T(cap(pr.bn), cap(pr.bp)) }] }), num(big - small), hint, T(`Còn ${big - small} ${pr.an} chưa có ${pr.bn}. Cần thêm ${big - small}.`, `${pl(big - small, pr.as, pr.ap)} ${big - small === 1 ? 'has' : 'have'} no ${pr.bs} yet. We need ${big - small} more.`));
        }),

      lesson(1, 4, T('So sánh số', 'Comparing numbers'),
        T('Rô-bốt ISA cùng bạn Bình so xem rổ nào có nhiều quả cam hơn ở chợ quê.', 'At the village market, ISA the robot and Bình find out which basket has more oranges.'),
        [
          { text: T('3 bé hơn 5. Viết: 3 < 5.', '3 is less than 5. We write: 3 < 5.'), visual: vz('compare', { left: { emoji: '🍊', count: 3 }, right: { emoji: '🍊', count: 5 }, show: true }) },
          { text: T('6 lớn hơn 4. Viết: 6 > 4.', '6 is greater than 4. We write: 6 > 4.'), visual: vz('compare', { left: 6, right: 4, show: true }) },
          { text: T('4 bằng 4. Viết: 4 = 4.', '4 is equal to 4. We write: 4 = 4.'), visual: vz('compare', { left: 4, right: 4, show: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, hi = L === 0 ? 5 : 10;
          let a = R(rng, 0, hi), b = R(rng, 0, hi);
          if (a === b && R(rng, 0, 2) > 0) b = a === hi ? a - 1 : a + 1;
          const hintS = T('Số nào đứng sau trên tia số thì lớn hơn.', 'The number that comes later on the number line is greater.');
          if (f === 0) {
            const it = P(rng, ITEMS);
            return Q(T(`Chọn dấu: ${a} … ${b}`, `Choose the sign: ${a} … ${b}`), vz('compare', { left: { emoji: it.e, count: a }, right: { emoji: it.e, count: b } }), cmpAns(a, b), T('Đếm hai bên. Bên nào nhiều hơn thì số đó lớn hơn.', 'Count both sides. The side with more has the greater number.'), `${a} ${sign(a, b)} ${b}.`);
          }
          if (f === 1) return Q(T(`Chọn dấu: ${a} … ${b}`, `Choose the sign: ${a} … ${b}`), vz('compare', { left: a, right: b }), cmpAns(a, b), hintS, `${a} ${sign(a, b)} ${b}.`, { hintVisual: line10({ marks: [a, b] }) });
          if (f === 2) {
            if (a === b) b = a === hi ? a - 1 : a + 1;
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(a, b) : Math.min(a, b);
            return Q(T(`Số nào ${big ? 'lớn' : 'bé'} hơn?`, `Which number is ${big ? 'greater' : 'smaller'}?`), vz('compare', { left: a, right: b }), fixed([String(a), String(b)], String(ans)), hintS, T(`${Math.min(a, b)} < ${Math.max(a, b)}. Số ${big ? 'lớn' : 'bé'} hơn là ${ans}.`, `${Math.min(a, b)} < ${Math.max(a, b)}. The ${big ? 'greater' : 'smaller'} number is ${ans}.`), { hintVisual: line10({ marks: [a, b] }) });
          }
          if (f === 3) {
            const arr = U.sample(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, hi + 1), 3);
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(...arr) : Math.min(...arr);
            return Q(T(`Số nào ${big ? 'lớn nhất' : 'bé nhất'}: ${arr.join(', ')}?`, `Which number is the ${big ? 'greatest' : 'smallest'}: ${arr.join(', ')}?`), line10({ marks: arr }), fixed(arr.map(String), String(ans)), big ? T('Số lớn nhất đứng xa nhất về bên phải tia số.', 'The greatest number is furthest to the right on the number line.') : T('Số bé nhất đứng gần số 0 nhất.', 'The smallest number is the closest to 0.'), T(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`, `The ${big ? 'greatest' : 'smallest'} number is ${ans}.`));
          }
          const k = R(rng, 3, Math.max(4, hi - 1));
          const less = R(rng, 0, 1) === 1;
          const good = less ? R(rng, 0, k - 1) : R(rng, k + 1, Math.max(k + 1, hi));
          const pool = (less ? [k, k + 1, k + 2, k + 3, k + 4] : [k, k - 1, k - 2, k - 3, k - 4]).filter(x => x >= 0 && x <= 10);
          return Q(T(`Số nào ${less ? 'bé' : 'lớn'} hơn ${k}?`, `Which number is ${less ? 'less' : 'greater'} than ${k}?`), line10({ marks: [k] }), U.choices(rng, good, U.sample(rng, pool, 3)), less ? T(`Tìm số đứng trước ${k} trên tia số.`, `Find a number that comes before ${k} on the number line.`) : T(`Tìm số đứng sau ${k} trên tia số.`, `Find a number that comes after ${k} on the number line.`), `${good} ${less ? '<' : '>'} ${k}.`);
        }),

      lesson(1, 5, T('Mấy và mấy', 'Number bonds'),
        T('Rô-bốt ISA và bạn Lan xếp hoa hồng, hoa cúc vào lọ để tặng cô giáo.', 'ISA the robot and Lan put roses and daisies in a vase for their teacher.'),
        [
          { text: T('5 gồm 2 và 3.', '5 is made of 2 and 3.'), visual: vz('objects', { groups: [{ emoji: '🔴', count: 2, label: 2 }, { emoji: '🔵', count: 3, label: 3 }] }) },
          { text: T('6 gồm 4 và 2.', '6 is made of 4 and 2.'), visual: vz('objects', { groups: [{ emoji: '🌹', count: 4, label: 4 }, { emoji: '🌼', count: 2, label: 2 }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const n = L === 0 ? R(rng, 2, 5) : L === 1 ? R(rng, 4, 8) : R(rng, 6, 10);
          const a = R(rng, 1, n - 1), b = n - a;
          const [ea, eb] = P(rng, [['🔴', '🔵'], ['🌹', '🌼'], ['🍎', '🍏'], ['🐔', '🐥'], ['🚗', '🚌'], ['🟡', '🟢']]);
          const both = vz('objects', { groups: [{ emoji: ea, count: a }, { emoji: eb, count: b }] });
          if (f === 0) return Q(T(`${a} và ${b} là mấy?`, `What do ${a} and ${b} make?`), both, nCh(rng, n, 0, 10), T(`Đếm tất cả các hình.`, 'Count all the pictures.'), T(`${a} và ${b} là ${n}.`, `${a} and ${b} make ${n}.`));
          if (f === 1) return Q(T(`${n} gồm ${a} và mấy?`, `${n} is made of ${a} and how many?`), both, num(b), T(`Đếm nhóm thứ hai.`, 'Count the second group.'), T(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`));
          if (f === 2) {
            const AND = T(' và ', ' and ');
            const right = `${a}${AND}${b}`;
            const wrong = [`${a}${AND}${b + 1}`, `${a + 1}${AND}${b + 1}`, `${Math.max(0, a - 1)}${AND}${b}`, `${b}${AND}${b}`].filter(s => {
              const [p1, p2] = s.split(AND).map(Number); return p1 + p2 !== n;
            });
            return Q(T(`${n} gồm mấy và mấy?`, `${n} is made of which two numbers?`), both, U.choices(rng, right, wrong), T('Đếm từng nhóm màu.', 'Count each colour group.'), T(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`));
          }
          if (f === 3) {
            return Q(T(`? và ${b} là ${n}`, `? and ${b} make ${n}`), vz('objects', { groups: [{ emoji: '❔', count: 1, label: '?' }, { emoji: eb, count: b, label: b }] }), num(a), T(`Đếm thêm từ ${b} cho đến ${n}: được mấy lần?`, `Count on from ${b} up to ${n}. How many did you count on?`), T(`${a} và ${b} là ${n}.`, `${a} and ${b} make ${n}.`), { hintVisual: both });
          }
          const ok = R(rng, 0, 1) === 1, shownB = ok ? b : (b + 1 <= 10 ? b + 1 : b - 1);
          const TF = EN ? ['True', 'False'] : ['Đúng', 'Sai'];
          return Q(T(`${n} gồm ${a} và ${shownB}. Đúng hay sai?`, `${n} is made of ${a} and ${shownB}. True or false?`), both, fixed(TF, ok ? TF[0] : TF[1]), T('Đếm từng nhóm rồi đếm tất cả.', 'Count each group, then count them all.'), T(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`) + (ok ? '' : T(` Không phải ${a} và ${shownB}.`, ` It is not ${a} and ${shownB}.`)));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 2. LÀM QUEN VỚI MỘT SỐ HÌNH PHẲNG ============
  const SH = EN ? { square: 'Square', circle: 'Circle', triangle: 'Triangle', rect: 'Rectangle' } : { square: 'Hình vuông', circle: 'Hình tròn', triangle: 'Hình tam giác', rect: 'Hình chữ nhật' };
  const SHK = Object.keys(SH);
  const shOpts = EN ? ['Square', 'Circle', 'Triangle', 'Rectangle'] : ['Hình vuông', 'Hình tròn', 'Hình tam giác', 'Hình chữ nhật'];
  const low = s => s[0].toLowerCase() + s.slice(1);
  // en: English name with its article
  const REAL = [
    { e: '🕒', n: 'Mặt đồng hồ', k: 'circle', en: 'a clock face' }, { e: '🍪', n: 'Chiếc bánh quy', k: 'circle', en: 'a biscuit' }, { e: '🛞', n: 'Bánh xe', k: 'circle', en: 'a wheel' },
    { e: '🎲', n: 'Mặt con xúc xắc', k: 'square', en: 'the face of a dice' }, { e: '🪟', n: 'Ô cửa sổ', k: 'square', en: 'a window pane' },
    { e: '📺', n: 'Màn hình ti vi', k: 'rect', en: 'a TV screen' }, { e: '🚪', n: 'Cánh cửa', k: 'rect', en: 'a door' }, { e: '📗', n: 'Quyển sách', k: 'rect', en: 'a book' },
    { e: '⚠️', n: 'Biển báo', k: 'triangle', en: 'a road sign' }, { e: '🍙', n: 'Nắm cơm', k: 'triangle', en: 'a rice ball' },
  ];
  function shapeItems(rng, n, target, others) {
    const cnt = R(rng, 1, Math.min(3, n - 1));
    const kinds = [];
    for (let k = 0; k < cnt; k++) kinds.push(target);
    while (kinds.length < n) kinds.push(P(rng, others));
    return U.shuffle(rng, kinds).map(k => (k === 'triangle' && R(rng, 0, 1) ? { kind: k, rot: P(rng, [180, 90, -90]) } : { kind: k }));
  }

  const c2 = {
    id: 'g1-c2', semester: 1, title: T('Làm quen với một số hình phẳng', 'Getting to know flat shapes'), icon: '🔺', lessons: [
      lesson(2, 7, T('Hình vuông, hình tròn, hình tam giác, hình chữ nhật', 'Squares, circles, triangles and rectangles'),
        T('Rô-bốt ISA cùng bạn Hà tìm các hình trong lớp học: ô cửa sổ, mặt đồng hồ, lá cờ.', 'ISA the robot and Hà look for shapes in the classroom: a window, a clock face, a flag.'),
        [
          { text: T('Hình vuông, hình tròn, hình tam giác, hình chữ nhật.', 'A square, a circle, a triangle and a rectangle.'), visual: vz('shapeSet', { items: ['square', 'circle', 'triangle', 'rect'] }) },
          { text: T('Hình tam giác có 3 cạnh.', 'A triangle has 3 sides.'), visual: vz('shape', { kind: 'triangle' }) },
          { text: T('Hình chữ nhật có 2 cạnh dài và 2 cạnh ngắn.', 'A rectangle has 2 long sides and 2 short sides.'), visual: vz('shape', { kind: 'rect' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          if (f === 0) {
            const k = P(rng, SHK);
            return Q(T('Đây là hình gì?', 'What shape is this?'), vz('shape', { kind: k }), fixed(shOpts, SH[k]), k === 'circle' ? T('Hình này tròn, không có cạnh thẳng.', 'This shape is round. It has no straight sides.') : T('Đếm số cạnh của hình.', 'Count the sides of the shape.'), T(`Đây là ${low(SH[k])}.`, `This is a ${low(SH[k])}.`));
          }
          if (f === 1 || f === 4) {
            const target = f === 4 && L >= 1 ? P(rng, ['rect', 'square']) : P(rng, SHK);
            const others = f === 4 && L >= 1 ? [target === 'rect' ? 'square' : 'rect', 'circle'] : SHK.filter(k => k !== target);
            const items = shapeItems(rng, L === 0 ? 4 : L === 1 ? 5 : 6, target, others);
            const want = items.map((it, j) => (it.kind === target ? j : -1)).filter(j => j >= 0);
            return Q(T(`Chạm vào tất cả các ${low(SH[target])}.`, `Tap all the ${low(SH[target])}s.`), vz('shapeSet', { items }), { kind: 'visual', check: v => Array.isArray(v) && v.length === want.length && want.every(j => v.includes(j)) },
              target === 'square' ? T('Hình vuông có 4 cạnh dài bằng nhau.', 'A square has 4 sides that are all the same length.') : target === 'rect' ? T('Hình chữ nhật có 2 cạnh dài, 2 cạnh ngắn.', 'A rectangle has 2 long sides and 2 short sides.') : target === 'triangle' ? T('Hình tam giác có 3 cạnh.', 'A triangle has 3 sides.') : T('Hình tròn không có cạnh thẳng.', 'A circle has no straight sides.'),
              T(`Có ${want.length} ${low(SH[target])}.`, `There ${isAre(want.length)} ${pl(want.length, low(SH[target]), low(SH[target]) + 's')}.`));
          }
          if (f === 2) {
            const target = P(rng, SHK);
            const items = shapeItems(rng, L === 0 ? 4 : L === 1 ? 6 : 8, target, SHK.filter(k => k !== target));
            const c = items.filter(it => it.kind === target).length;
            return Q(T(`Có mấy ${low(SH[target])}?`, `How many ${low(SH[target])}s are there?`), vz('shapeSet', { items }), nCh(rng, c, 0, 8), T('Chỉ tay vào từng hình và đếm.', 'Point to each shape and count.'), T(`Có ${c} ${low(SH[target])}.`, `There ${isAre(c)} ${pl(c, low(SH[target]), low(SH[target]) + 's')}.`));
          }
          const r = P(rng, REAL);
          return Q(T(`${r.n} có dạng hình gì?`, `What shape is ${r.en}?`), obj(r.e, 1), fixed(shOpts, SH[r.k]), T('Nhìn kĩ đường viền của đồ vật.', 'Look carefully at the edge of the object.'), T(`${r.n} có dạng ${low(SH[r.k])}.`, `${cap(r.en)} is shaped like a ${low(SH[r.k])}.`), { hintVisual: vz('shapeSet', { items: SHK }) });
        }),
    ],
  };

  // ============ CHỦ ĐỀ 3. PHÉP CỘNG, PHÉP TRỪ TRONG PHẠM VI 10 ============
  function addPair(rng, L) {
    const s = L === 0 ? R(rng, 2, 5) : L === 1 ? R(rng, 4, 8) : R(rng, 5, 10);
    const a = R(rng, 1, s - 1);
    return [a, s - a];
  }
  function subPair(rng, L) {
    const a = L === 0 ? R(rng, 2, 5) : L === 1 ? R(rng, 4, 8) : R(rng, 5, 10);
    return [a, R(rng, 1, a - 1)];
  }
  const hopsOf = (from, k, dir) => Array.from({ length: k }, (_, j) => ({ from: from + dir * j, to: from + dir * (j + 1), label: dir > 0 ? '+1' : M + '1' }));

  const ADD_STORIES = EN ? [
    (a, b, n) => ({ t: `There ${isAre(a)} ${pl(a, 'duck', 'ducks')} on the pond. ${b} more ${b === 1 ? 'duck comes' : 'ducks come'} onto the pond. How many ducks are there altogether?`, e: '🦆', u: 'ducks' }),
    (a, b, n) => ({ t: `${n} has ${pl(a, 'sweet', 'sweets')}. Mum gives ${n} ${b} more. How many sweets does ${n} have now?`, e: '🍬', u: 'sweets' }),
    (a, b, n) => ({ t: `There ${isAre(a)} ${pl(a, 'bird', 'birds')} on a branch. ${b} more ${b === 1 ? 'bird flies' : 'birds fly'} over. How many birds are there altogether?`, e: '🐦', u: 'birds' }),
    (a, b, n) => ({ t: `A vase has ${pl(a, 'flower', 'flowers')} in it. ${n} puts in ${b} more. How many flowers are in the vase now?`, e: '🌸', u: 'flowers' }),
  ] : [
    (a, b, n) => ({ t: `Có ${a} con vịt dưới ao. Thêm ${b} con nữa xuống ao. Có tất cả mấy con vịt?`, e: '🦆', u: 'con vịt' }),
    (a, b, n) => ({ t: `${n} có ${a} cái kẹo. Mẹ cho thêm ${b} cái. ${n} có mấy cái kẹo?`, e: '🍬', u: 'cái kẹo' }),
    (a, b, n) => ({ t: `Trên cành có ${a} con chim. ${b} con nữa bay đến. Có tất cả mấy con chim?`, e: '🐦', u: 'con chim' }),
    (a, b, n) => ({ t: `Lọ có ${a} bông hoa. ${n} cắm thêm ${b} bông. Lọ có mấy bông hoa?`, e: '🌸', u: 'bông hoa' }),
  ];
  const SUB_STORIES = EN ? [
    (a, b, n) => ({ t: `There are ${a} balloons. ${b} ${b === 1 ? 'floats' : 'float'} away. How many are left?`, e: '🎈', u: 'balloons' }),
    (a, b, n) => ({ t: `There are ${a} cakes on a plate. ${n} eats ${b}. How many cakes are left?`, e: '🥮', u: 'cakes' }),
    (a, b, n) => ({ t: `There are ${a} birds on a branch. ${b} ${b === 1 ? 'flies' : 'fly'} away. How many birds are left?`, e: '🐦', u: 'birds' }),
    (a, b, n) => ({ t: `A basket has ${a} oranges. Mum takes out ${b}. How many oranges are left in the basket?`, e: '🍊', u: 'oranges' }),
  ] : [
    (a, b, n) => ({ t: `Có ${a} quả bóng bay. Bay mất ${b} quả. Còn lại mấy quả?`, e: '🎈', u: 'quả bóng bay' }),
    (a, b, n) => ({ t: `Đĩa có ${a} cái bánh. ${n} ăn ${b} cái. Còn lại mấy cái bánh?`, e: '🥮', u: 'cái bánh' }),
    (a, b, n) => ({ t: `Có ${a} con chim trên cành. ${b} con bay đi. Còn lại mấy con chim?`, e: '🐦', u: 'con chim' }),
    (a, b, n) => ({ t: `Rổ có ${a} quả cam. Mẹ lấy ra ${b} quả. Trong rổ còn mấy quả cam?`, e: '🍊', u: 'quả cam' }),
  ];

  const c3 = {
    id: 'g1-c3', semester: 1, title: T('Phép cộng, phép trừ trong phạm vi 10', 'Addition and subtraction within 10'), icon: '➕', lessons: [
      lesson(3, 10, T('Phép cộng trong phạm vi 10', 'Addition within 10'),
        T('Rô-bốt ISA cùng bạn Minh đếm đàn vịt bơi về ao làng.', 'ISA the robot and Minh count the ducks swimming back to the village pond.'),
        [
          { text: T('3 con vịt thêm 2 con vịt là 5 con vịt: 3 + 2 = 5.', '3 ducks and 2 more ducks make 5 ducks: 3 + 2 = 5.'), visual: vz('objects', { groups: [{ emoji: '🦆', count: 3 }, { emoji: '🦆', count: 2 }], op: '+' }) },
          { text: T('Đếm thêm trên tia số: từ 3, thêm 2 bước, đến 5.', 'Count on along the number line: start at 3, jump 2 steps, land on 5.'), visual: line10({ hops: hopsOf(3, 2, 1) }) },
          { text: T('Đổi chỗ hai số, kết quả không đổi: 2 + 3 = 3 + 2.', 'Swap the two numbers and the answer stays the same: 2 + 3 = 3 + 2.'), visual: vz('objects', { groups: [{ emoji: '🍎', count: 2 }, { emoji: '🍎', count: 3 }], op: '+' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, it = P(rng, ITEMS);
          let [a, b] = addPair(rng, L);
          if (i === 8 && R(rng, 0, 1)) { a = R(rng, 1, 9); b = 0; }
          const s = a + b;
          const pic = vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }], op: '+' });
          if (f === 0) return Q(T(`Có tất cả mấy ${it.n}?`, `How many ${it.p} are there altogether?`), pic, num(s), T(`Đếm thêm từ ${a}.`, `Count on from ${a}.`), `${a} + ${b} = ${s}.`);
          if (f === 1) return Q(`${a} + ${b} = ?`, pic, nCh(rng, s, 0, 10), b === 0 ? T('Cộng với 0 thì số không đổi.', 'Adding 0 does not change the number.') : T(`Đếm thêm ${b} từ ${a}.`, `Count on ${b} from ${a}.`), `${a} + ${b} = ${s}.`);
          if (f === 2) {
            const st = P(rng, ADD_STORIES)(a, b, nm(rng));
            return Q(st.t, vz('objects', { groups: [{ emoji: st.e, count: a }, { emoji: st.e, count: b }], op: '+' }), num(s), T('Thêm vào thì làm phép cộng.', 'Some more are added, so we add.'), `${a} + ${b} = ${s} (${st.u}).`);
          }
          if (f === 3) return Q(`${a} + ${b} = ?`, line10({ hops: hopsOf(a, b, 1), unknown: s }), nCh(rng, s, 0, 10), T(`Rô-bốt nhảy ${b} bước từ số ${a}.`, `The robot jumps ${pl(b, 'step', 'steps')} from ${a}.`), T(`Từ ${a} nhảy ${b} bước đến ${s}: ${a} + ${b} = ${s}.`, `Start at ${a}, jump ${pl(b, 'step', 'steps')} and land on ${s}: ${a} + ${b} = ${s}.`));
          if (i === 9) {
            return Q(`${a} + ? = ${s}`, vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: '❔', count: 1 }], op: '+' }), num(b), T(`Đếm thêm từ ${a} cho đến ${s}.`, `Count on from ${a} up to ${s}.`), `${a} + ${b} = ${s}.`, { hintVisual: pic });
          }
          const right = `${a} + ${b} = ${s}`;
          return Q(T('Phép tính nào đúng với hình?', 'Which number sentence matches the picture?'), pic, U.choices(rng, right, [`${a} + ${b} = ${s + 1}`, `${a} + ${b} = ${s - 1}`, `${a} + ${b + 1} = ${s}`, `${s} ${M} ${b} = ${a + 1}`]), T('Đếm từng nhóm, rồi đếm tất cả.', 'Count each group, then count them all.'), right + '.');
        }),

      lesson(3, 11, T('Phép trừ trong phạm vi 10', 'Subtraction within 10'),
        T('Rô-bốt ISA và bạn Vy đếm xem còn mấy quả bóng bay sau khi gió thổi mất vài quả.', 'ISA the robot and Vy count how many balloons are left after the wind blows some away.'),
        [
          { text: T('Có 5 quả bóng, bay mất 2 quả, còn 3 quả: 5 − 2 = 3.', 'There are 5 balloons. 2 fly away and 3 are left: 5 − 2 = 3.'), visual: vz('objects', { groups: [{ emoji: '🎈', count: 5 }], crossOut: 2 }) },
          { text: T('Đếm lùi trên tia số: từ 5, lùi 2 bước, đến 3.', 'Count back along the number line: start at 5, go back 2 steps, land on 3.'), visual: line10({ hops: hopsOf(5, 2, -1) }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5, it = P(rng, ITEMS);
          let [a, b] = subPair(rng, L);
          if (i === 8 && R(rng, 0, 1)) b = R(rng, 0, 1) ? 0 : a;
          const r = a - b;
          const pic = vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b });
          if (f === 0) return Q(T(`Còn lại mấy ${it.n}?`, `How many ${it.p} are left?`), pic, num(r), T('Đếm những hình không bị gạch.', 'Count the pictures that are not crossed out.'), `${a} ${M} ${b} = ${r}.`);
          if (f === 1) return Q(`${a} ${M} ${b} = ?`, pic, nCh(rng, r, 0, 10), b === 0 ? T('Trừ đi 0 thì số không đổi.', 'Taking away 0 does not change the number.') : b === a ? T('Bớt hết thì còn 0.', 'Take them all away and 0 are left.') : T('Đếm những hình còn lại.', 'Count the pictures that are left.'), `${a} ${M} ${b} = ${r}.`);
          if (f === 2) {
            if (b === 0 || b === a) { b = Math.max(1, Math.min(a - 1, 2)); }
            const st = P(rng, SUB_STORIES)(a, b, nm(rng));
            return Q(st.t, vz('objects', { groups: [{ emoji: st.e, count: a }], crossOut: b }), num(a - b), T('Bớt đi thì làm phép trừ.', 'Some are taken away, so we subtract.'), `${a} ${M} ${b} = ${a - b} (${st.u}).`);
          }
          if (f === 3) {
            if (b === 0) b = 1;
            return Q(`${a} ${M} ${b} = ?`, line10({ hops: hopsOf(a, b, -1), unknown: a - b }), nCh(rng, a - b, 0, 10), T(`Rô-bốt lùi ${b} bước từ số ${a}.`, `The robot goes back ${pl(b, 'step', 'steps')} from ${a}.`), T(`Từ ${a} lùi ${b} bước đến ${a - b}: ${a} ${M} ${b} = ${a - b}.`, `Start at ${a}, go back ${pl(b, 'step', 'steps')} and land on ${a - b}: ${a} ${M} ${b} = ${a - b}.`));
          }
          if (i === 9) return Q(`${a} ${M} ? = ${r}`, pic, num(b), T('Đếm những hình bị gạch.', 'Count the pictures that are crossed out.'), `${a} ${M} ${b} = ${r}.`);
          const right = `${a} ${M} ${b} = ${r}`;
          return Q(T('Phép tính nào đúng với hình?', 'Which number sentence matches the picture?'), pic, U.choices(rng, right, [`${a} + ${b} = ${a + b}`, `${a} ${M} ${b} = ${r + 1}`, `${a} ${M} ${r} = ${b + 1}`, `${a} ${M} ${b} = ${Math.abs(r - 1)}`].filter(s => s !== right)), T('Có bao nhiêu? Gạch đi bao nhiêu? Còn lại bao nhiêu?', 'How many are there? How many are crossed out? How many are left?'), right + '.');
        }),

      lesson(3, 12, T('Bảng cộng, bảng trừ trong phạm vi 10', 'Addition and subtraction facts within 10'),
        T('Rô-bốt ISA cùng bạn Phúc chơi trò "đố nhanh" phép tính trên đường đi học.', 'ISA the robot and Phúc play a "quick sums" quiz on the way to school.'),
        [
          { text: T('Từ 4 + 3 = 7 ta có 7 − 3 = 4 và 7 − 4 = 3.', 'From 4 + 3 = 7 we also know 7 − 3 = 4 and 7 − 4 = 3.'), visual: vz('objects', { groups: [{ emoji: '🍬', count: 4 }, { emoji: '🍭', count: 3 }], op: '+' }) },
          { text: T('Các cặp số cộng lại bằng 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.', 'Pairs of numbers that add up to 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.'), visual: vz('objects', { groups: [{ emoji: '🔴', count: 6 }, { emoji: '🔵', count: 4 }], op: '+' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const add = R(rng, 0, 1) === 1;
          const [a, b] = add ? addPair(rng, Math.max(1, L)) : subPair(rng, Math.max(1, L));
          const v = add ? a + b : a - b, op = add ? '+' : M;
          if (f === 0) return Q(`${a} ${op} ${b} = ?`, line10({ marks: [a] }), nCh(rng, v, 0, 10), add ? T(`Đếm thêm ${b} từ ${a} trên tia số.`, `Count on ${b} from ${a} on the number line.`) : T(`Đếm lùi ${b} từ ${a} trên tia số.`, `Count back ${b} from ${a} on the number line.`), `${a} ${op} ${b} = ${v}.`, { hintVisual: line10({ hops: hopsOf(a, b, add ? 1 : -1) }) });
          if (f === 1) {
            const c = Math.max(0, Math.min(10, v + P(rng, [-1, 0, 1, 2, -2])));
            return Q(T(`Chọn dấu: ${a} ${op} ${b} … ${c}`, `Choose the sign: ${a} ${op} ${b} … ${c}`), vz('compare', { left: `${a} ${op} ${b}`, right: c }), cmpAns(v, c), T('Tính phép tính trước rồi so sánh.', 'Work out the calculation first, then compare.'), T(`${a} ${op} ${b} = ${v}, mà ${v} ${sign(v, c)} ${c}.`, `${a} ${op} ${b} = ${v}, and ${v} ${sign(v, c)} ${c}.`));
          }
          if (f === 2) {
            const k = R(rng, 4, 10);
            const x = R(rng, 1, k - 1);
            const good = R(rng, 0, 1) ? `${x} + ${k - x}` : `${Math.min(10, k + x)} ${M} ${Math.min(10, k + x) - k}`;
            const bad = [];
            for (let g = 0; g < 30 && bad.length < 3; g++) {
              const y = R(rng, 1, 9), z = R(rng, 0, 9);
              const e = R(rng, 0, 1) ? (y + z <= 10 && y + z !== k ? `${y} + ${z}` : null) : (y >= z && y - z !== k ? `${y} ${M} ${z}` : null);
              if (e && !bad.includes(e) && e !== good) bad.push(e);
            }
            return Q(T(`Phép tính nào có kết quả bằng ${k}?`, `Which calculation makes ${k}?`), line10({ marks: [k] }), U.choices(rng, good, bad), T('Tính từng phép tính.', 'Work out each calculation.'), `${good} = ${k}.`);
          }
          if (f === 3) {
            const [x, y] = addPair(rng, Math.max(1, L)), s = x + y;
            return Q(T(`Biết ${x} + ${y} = ${s}.\nVậy ${s} ${M} ${y} = ?`, `We know ${x} + ${y} = ${s}.\nSo ${s} ${M} ${y} = ?`), vz('objects', { groups: [{ emoji: '🍬', count: x }, { emoji: '🍭', count: y }], op: '+' }), nCh(rng, x, 0, 10), T(`Có ${s} cái kẹo, bớt ${y} cái kẹo mút thì còn mấy?`, `There are ${s} sweets in all. Take away the ${pl(y, 'lollipop', 'lollipops')}. How many are left?`), `${s} ${M} ${y} = ${x}.`);
          }
          if (L === 2) {
            const [x, y] = addPair(rng, 2), s = x + y;
            if (R(rng, 0, 1)) return Q(`? + ${y} = ${s}`, line10({ marks: [s] }), num(x), T(`Lấy ${s} ${M} ${y}.`, `Work out ${s} ${M} ${y}.`), `${x} + ${y} = ${s}.`);
            return Q(`${s} ${M} ? = ${x}`, line10({ marks: [s, x] }), num(y), T(`Từ ${x} đếm thêm đến ${s}.`, `Count on from ${x} up to ${s}.`), `${s} ${M} ${y} = ${x}.`);
          }
          const it = P(rng, ITEMS);
          const pic = add ? vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }], op: '+' }) : vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b });
          return Q(`${a} ${op} ${b} = ?`, pic, num(v), add ? T('Đếm tất cả.', 'Count them all.') : T('Đếm những hình không bị gạch.', 'Count the pictures that are not crossed out.'), `${a} ${op} ${b} = ${v}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 4. LÀM QUEN VỚI MỘT SỐ HÌNH KHỐI ============
  const SOL = EN ? { cube: 'Cube', box: 'Cuboid' } : { cube: 'Khối lập phương', box: 'Khối hộp chữ nhật' };
  const solOpts = EN ? ['Cube', 'Cuboid'] : ['Khối lập phương', 'Khối hộp chữ nhật'];
  // en: English name with its article (in sentences); o: English option label
  const SOL_OBJ = [
    { e: '🎲', n: 'Con xúc xắc', k: 'cube', en: 'a dice', o: 'Dice' }, { e: '🧊', n: 'Viên đá lạnh', k: 'cube', en: 'an ice cube', o: 'Ice cube' },
    { e: '🧱', n: 'Viên gạch', k: 'box', en: 'a brick', o: 'Brick' }, { e: '🧃', n: 'Hộp sữa', k: 'box', en: 'a carton of milk', o: 'Milk carton' }, { e: '🧰', n: 'Hộp đồ nghề', k: 'box', en: 'a toolbox', o: 'Toolbox' },
  ];
  const ANIMALS = [
    { e: '🐶', n: 'chó', en: 'dog' }, { e: '🐱', n: 'mèo', en: 'cat' }, { e: '🐰', n: 'thỏ', en: 'rabbit' }, { e: '🐻', n: 'gấu', en: 'bear' },
    { e: '🐸', n: 'ếch', en: 'frog' }, { e: '🐷', n: 'lợn', en: 'pig' }, { e: '🐵', n: 'khỉ', en: 'monkey' }, { e: '🐼', n: 'gấu trúc', en: 'panda' },
  ];
  const rowViz = row => vz('objects', { groups: row.map(a => ({ emoji: a.e, count: 1, label: T(a.n, a.en) })) });
  const an = a => T(`Con ${a.n} ${a.e}`, `The ${a.en} ${a.e}`);

  const c4 = {
    id: 'g1-c4', semester: 1, title: T('Làm quen với một số hình khối', 'Getting to know solid shapes'), icon: '🧊', lessons: [
      lesson(4, 14, T('Khối lập phương, khối hộp chữ nhật', 'Cubes and cuboids'),
        T('Rô-bốt ISA cùng bạn Quân xếp những khối gỗ thành ngôi nhà nhỏ.', 'ISA the robot and Quân build a little house out of wooden blocks.'),
        [
          { text: T('Đây là khối lập phương.', 'This is a cube.'), visual: vz('solid', { kind: 'cube', showDims: false }) },
          { text: T('Đây là khối hộp chữ nhật.', 'This is a cuboid.'), visual: vz('solid', { kind: 'box', showDims: false }) },
          { text: T('Con xúc xắc có dạng khối lập phương. Viên gạch có dạng khối hộp chữ nhật.', 'A dice is shaped like a cube. A brick is shaped like a cuboid.'), visual: vz('objects', { groups: [{ emoji: '🎲', count: 1, label: T('Xúc xắc', 'Dice') }, { emoji: '🧱', count: 1, label: T('Viên gạch', 'Brick') }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          if (f === 0) {
            const k = P(rng, ['cube', 'box']);
            const p = k === 'box' ? { kind: 'box', dims: { l: R(rng, 5, 8), w: R(rng, 2, 3), h: R(rng, 2, 4) }, showDims: false } : { kind: 'cube', showDims: false };
            return Q(T('Đây là khối gì?', 'What solid shape is this?'), vz('solid', p), fixed(solOpts, SOL[k]), T('Khối lập phương có các mặt là hình vuông bằng nhau.', 'All the faces of a cube are squares of the same size.'), T(`Đây là ${low(SOL[k])}.`, `This is a ${low(SOL[k])}.`));
          }
          if (f === 1) {
            const o = P(rng, SOL_OBJ);
            return Q(T(`${o.n} có dạng khối gì?`, `What solid shape is ${o.en}?`), obj(o.e, 1), fixed(solOpts, SOL[o.k]), T('Khối lập phương: mọi mặt đều là hình vuông.', 'A cube: every face is a square.'), T(`${o.n} có dạng ${low(SOL[o.k])}.`, `${cap(o.en)} is shaped like a ${low(SOL[o.k])}.`), { hintVisual: vz('solid', { kind: o.k, showDims: false }) });
          }
          if (f === 2) {
            const h = L === 0 ? 1 : R(rng, 1, 2), l = L === 0 ? R(rng, 2, 4) : R(rng, 2, h === 2 ? 4 : 5);
            const n = l * h;
            return Q(T('Có mấy khối lập phương nhỏ?', 'How many small cubes are there?'), vz('cubes', { l, w: 1, h }), nCh(rng, n, 1, 12), h > 1 ? T('Đếm hàng trên, rồi đếm hàng dưới.', 'Count the top row, then count the bottom row.') : T('Đếm từ trái sang phải.', 'Count from left to right.'), T(`Có ${n} khối lập phương nhỏ.`, `There are ${n} small cubes.`));
          }
          if (f === 3) {
            const a = R(rng, 1, L === 0 ? 3 : 5), b = R(rng, 1, L === 0 ? 3 : 5);
            const askCube = R(rng, 0, 1) === 1;
            return Q(T(`Có mấy đồ vật có dạng ${askCube ? 'khối lập phương' : 'khối hộp chữ nhật'}?`, `How many objects are shaped like a ${askCube ? 'cube' : 'cuboid'}?`), vz('objects', { groups: [{ emoji: '🎲', count: a }, { emoji: '🧱', count: b }] }), num(askCube ? a : b), askCube ? T('Con xúc xắc có dạng khối lập phương.', 'A dice is shaped like a cube.') : T('Viên gạch có dạng khối hộp chữ nhật.', 'A brick is shaped like a cuboid.'), T(`Có ${askCube ? a : b} đồ vật.`, `There ${isAre(askCube ? a : b)} ${pl(askCube ? a : b, 'object', 'objects')}.`));
          }
          const k = P(rng, ['cube', 'box']);
          const good = P(rng, SOL_OBJ.filter(o => o.k === k));
          const bad = SOL_OBJ.filter(o => o.k !== k).map(o => `${o.e} ${T(o.n, o.o)}`).concat([T('⚽ Quả bóng', '⚽ Ball')]);
          return Q(T(`Đồ vật nào có dạng ${low(SOL[k])}?`, `Which object is shaped like a ${low(SOL[k])}?`), vz('solid', { kind: k, showDims: false }), U.choices(rng, `${good.e} ${T(good.n, good.o)}`, U.shuffle(rng, bad)), T('Nhìn hình khối trong tranh rồi tìm đồ vật giống nó.', 'Look at the solid shape in the picture, then find an object like it.'), T(`${good.n} có dạng ${low(SOL[k])}.`, `${cap(good.en)} is shaped like a ${low(SOL[k])}.`));
        }),

      lesson(4, 15, T('Vị trí, định hướng trong không gian', 'Position and direction'),
        T('Rô-bốt ISA cùng bạn Tú xếp hàng các bạn thú để chụp ảnh ở công viên.', 'ISA the robot and Tú line up the animal friends for a photo in the park.'),
        [
          { text: T('Con mèo ở giữa con chó và con thỏ.', 'The cat is between the dog and the rabbit.'), visual: rowViz([ANIMALS[0], ANIMALS[1], ANIMALS[2]]) },
          { text: T('Nhìn từ phía em: con chó ở bên trái, con thỏ ở bên phải.', 'Looking from where you are: the dog is on the left and the rabbit is on the right.'), visual: rowViz([ANIMALS[0], ANIMALS[1], ANIMALS[2]]) },
          { text: T('Hình tròn ở hàng trên, hình vuông ở hàng dưới.', 'The circle is in the top row. The square is in the bottom row.'), visual: vz('shapeSet', { items: ['triangle', 'circle', 'rect', 'square', 'triangle', 'rect'] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const hintLR = T('Bên trái là phía tay cầm bát, bên phải là phía tay cầm đũa của em.', 'Left is the side of the hand that holds your bowl. Right is the side of the hand that holds your chopsticks.');
          if (f === 0) {
            const row = U.sample(rng, ANIMALS, 3);
            return Q(T('Con vật nào ở giữa?', 'Which animal is in the middle?'), rowViz(row), fixed(row.map(an), an(row[1])), T('Con ở giữa có một bạn bên trái và một bạn bên phải.', 'The animal in the middle has one friend on its left and one friend on its right.'), T(`${an(row[1])} ở giữa.`, `${an(row[1])} is in the middle.`));
          }
          if (f === 1) {
            const row = U.sample(rng, ANIMALS, L === 0 ? 3 : 4);
            const [x, y] = U.sample(rng, [0, 1, 2, 3].slice(0, row.length), 2);
            const SIDE = EN ? ['To the left', 'To the right'] : ['Bên trái', 'Bên phải'];
            const ans = x < y ? SIDE[0] : SIDE[1];
            return Q(T(`Con ${row[x].n} ${row[x].e} ở bên trái hay bên phải con ${row[y].n} ${row[y].e}?`, `Is the ${row[x].en} ${row[x].e} to the left or to the right of the ${row[y].en} ${row[y].e}?`), rowViz(row), fixed(SIDE, ans), hintLR, T(`Con ${row[x].n} ở ${low(ans)} con ${row[y].n}.`, `The ${row[x].en} is ${low(ans)} of the ${row[y].en}.`));
          }
          if (f === 2) {
            const row = U.sample(rng, ANIMALS, L === 0 ? 3 : L === 1 ? 4 : 5);
            const right = R(rng, 0, 1) === 1;
            const k = right ? R(rng, 0, row.length - 2) : R(rng, 1, row.length - 1);
            const ans = row[right ? k + 1 : k - 1];
            return Q(T(`Con vật nào ở ngay bên ${right ? 'phải' : 'trái'} con ${row[k].n} ${row[k].e}?`, `Which animal is just to the ${right ? 'right' : 'left'} of the ${row[k].en} ${row[k].e}?`), rowViz(row), fixed(row.filter((_, j) => j !== k).map(an), an(ans)), hintLR, T(`${an(ans)} đứng ngay bên ${right ? 'phải' : 'trái'} con ${row[k].n}.`, `${an(ans)} is just to the ${right ? 'right' : 'left'} of the ${row[k].en}.`));
          }
          if (f === 3) {
            const row = U.sample(rng, ANIMALS, L === 0 ? 3 : 5);
            const first = R(rng, 0, 1) === 1;
            const ans = first ? row[0] : row[row.length - 1];
            return Q(T(`Con vật nào đứng ${first ? 'đầu tiên bên trái' : 'cuối cùng bên phải'}?`, `Which animal is ${first ? 'first, on the far left' : 'last, on the far right'}?`), rowViz(row), fixed(row.map(an), an(ans)), hintLR, `${an(ans)}.`);
          }
          const target = P(rng, SHK);
          const others = SHK.filter(k => k !== target);
          const top = R(rng, 0, 1) === 1;
          const items = [];
          for (let j = 0; j < 6; j++) items.push(P(rng, others));
          items[top ? R(rng, 0, 2) : R(rng, 3, 5)] = target;
          const ROWS = EN ? ['Top row', 'Bottom row'] : ['Hàng trên', 'Hàng dưới'];
          return Q(T(`${SH[target]} ở hàng trên hay hàng dưới?`, `Is the ${low(SH[target])} in the top row or the bottom row?`), vz('shapeSet', { items }), fixed(ROWS, top ? ROWS[0] : ROWS[1]), T(`Tìm ${low(SH[target])} trước.`, `Find the ${low(SH[target])} first.`), T(`${SH[target]} ở ${top ? 'hàng trên' : 'hàng dưới'}.`, `The ${low(SH[target])} is in the ${top ? 'top' : 'bottom'} row.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 6. CÁC SỐ ĐẾN 100 ============
  const twoDigit = (rng, L) => (L === 0 ? R(rng, 10, 20) : L === 1 ? R(rng, 21, 59) : R(rng, 60, 99));
  const blk = (n, labels) => vz('blocks', { hundreds: 0, tens: Math.floor(n / 10), ones: n % 10, labels: !!labels });

  const c6 = {
    id: 'g1-c6', semester: 2, title: T('Các số đến 100', 'Numbers to 100'), icon: '💯', lessons: [
      lesson(6, 21, T('Số có hai chữ số', 'Two-digit numbers'),
        T('Rô-bốt ISA cùng bạn Trang bó que tính thành từng bó 1 chục.', 'ISA the robot and Trang tie counting sticks into bundles of ten.'),
        [
          { text: T('Số 23 gồm 2 chục và 3 đơn vị.', 'The number 23 is 2 tens and 3 ones.'), visual: blk(23, true) },
          { text: T('4 chục là 40, đọc là "bốn mươi".', '4 tens is 40. We read it as "forty".'), visual: blk(40, true) },
          { text: T('15 gồm 1 chục và 5 đơn vị, đọc là "mười lăm".', '15 is 1 ten and 5 ones. We read it as "fifteen".'), visual: blk(15, true) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const n = twoDigit(rng, L), t = Math.floor(n / 10), o = n % 10;
          // "t chục và o đơn vị" / "t tens and o ones"
          const TO = (x, y) => T(`${x} chục và ${y} đơn vị`, tensOnes(x, y));
          if (f === 0) return Q(T('Hình bên là số nào?', 'Which number does the picture show?'), blk(n), num(n), T('Đếm số thanh chục, rồi đếm số khối lẻ.', 'Count the tens rods, then count the single cubes.'), T(`${t} chục và ${o} đơn vị là ${n}.`, `${tensOnes(t, o)} make ${n}.`), { hintVisual: blk(n, true) });
          if (f === 1) {
            const right = TO(t, o);
            const bad = [TO(o, t), TO(t, o === 9 ? 8 : o + 1), TO(t === 9 ? 8 : t + 1, o), TO(Math.max(1, t - 1), o)].filter(s => s !== right && !(EN ? /^0 tens/ : /^0 chục/).test(s));
            return Q(T(`Số ${n} gồm mấy chục và mấy đơn vị?`, `How many tens and how many ones are there in ${n}?`), blk(n), U.choices(rng, right, bad), T('Chữ số bên trái chỉ số chục, chữ số bên phải chỉ số đơn vị.', 'The digit on the left tells you the tens. The digit on the right tells you the ones.'), T(`${n} gồm ${right}.`, `${n} is ${right}.`));
          }
          if (f === 2) {
            const bad = [o * 10 + t, n + 10, n - 1, n + 1].filter(x => x >= 10 && x <= 99 && x !== n);
            return Q(T(`Số gồm ${t} chục và ${o} đơn vị là số nào?`, `Which number is ${tensOnes(t, o)}?`), blk(n), U.choices(rng, n, bad), T('Viết số chục trước, số đơn vị sau.', 'Write the tens first, then the ones.'), T(`${t} chục và ${o} đơn vị viết là ${n}.`, `${tensOnes(t, o)} is written ${n}.`));
          }
          if (f === 3) {
            // English: read the number in English words (I18N rule 5); the reversed-digit option (41 for "fourteen") is a real English mistake
            const bad = [o > 0 ? o * 10 + t : t * 10 + 1, n + 10 <= 99 ? n + 10 : n - 10, n + 1 <= 99 ? n + 1 : n - 2].filter(x => x !== n);
            return Q(T(`Số "${readVN(n)}" viết là:`, `How do you write "${U.readEN(n)}" in numbers?`), blk(n), U.choices(rng, n, bad), T('Nghe số chục trước, số đơn vị sau.', n > 12 && n < 20 ? '"…teen" means 1 ten and some ones.' : 'Listen for the tens first, then the ones.'), T(`"${readVN(n)}" viết là ${n}.`, `We write "${U.readEN(n)}" as ${n}.`));
          }
          const a0 = t * 10;
          const u = o === 0 ? a0 + R(rng, 1, 9) : n;
          return Q(T('Số nào còn thiếu trên tia số?', 'Which number is missing on the number line?'), vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: 1, unknown: u }), nCh(rng, u, 0, 100), T('Đếm thêm 1 từ số bên trái.', 'Count on 1 from the number on the left.'), T(`Số còn thiếu là ${u}.`, `The missing number is ${u}.`));
        }),

      lesson(6, 22, T('So sánh số có hai chữ số', 'Comparing two-digit numbers'),
        T('Rô-bốt ISA và bạn Ngọc so xem giỏ nào có nhiều quả vải hơn trong vườn nhà ông.', 'In Grandad’s garden, ISA the robot and Ngọc find out which basket has more lychees.'),
        [
          { text: T('25 < 31 vì 2 chục bé hơn 3 chục.', '25 < 31 because 2 tens is less than 3 tens.'), visual: vz('compare', { left: 25, right: 31, show: true }) },
          { text: T('47 > 43: cùng 4 chục, 7 đơn vị lớn hơn 3 đơn vị.', '47 > 43: both have 4 tens, and 7 ones is more than 3 ones.'), visual: vz('compare', { left: 47, right: 43, show: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          let a = R(rng, 10, 99), b;
          if (L === 0) { do { b = R(rng, 10, 99); } while (Math.floor(b / 10) === Math.floor(a / 10)); }
          else if (L === 1) b = R(rng, 10, 99);
          else b = R(rng, 0, 3) === 0 ? a : Math.floor(a / 10) * 10 + R(rng, 0, 9);
          if (f === 0 || (f === 1 && a === b)) return Q(T(`Chọn dấu: ${a} … ${b}`, `Choose the sign: ${a} … ${b}`), vz('compare', { left: a, right: b }), cmpAns(a, b), T('So số chục trước. Nếu số chục bằng nhau thì so số đơn vị.', 'Compare the tens first. If the tens are the same, compare the ones.'), `${a} ${sign(a, b)} ${b}.`, { hintVisual: vz('blocks', { tens: Math.floor(a / 10), ones: a % 10, labels: true }) });
          if (f === 1) {
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(a, b) : Math.min(a, b);
            return Q(T(`Số nào ${big ? 'lớn' : 'bé'} hơn?`, `Which number is ${big ? 'greater' : 'smaller'}?`), vz('compare', { left: a, right: b }), fixed([String(a), String(b)], String(ans)), T('So số chục trước.', 'Compare the tens first.'), `${Math.min(a, b)} < ${Math.max(a, b)}.`);
          }
          if (f === 2) {
            const arr = U.sample(rng, Array.from({ length: 90 }, (_, k) => k + 10), 3);
            const big = R(rng, 0, 1) === 1, ans = big ? Math.max(...arr) : Math.min(...arr);
            return Q(T(`Số nào ${big ? 'lớn nhất' : 'bé nhất'}: ${arr.join(', ')}?`, `Which number is the ${big ? 'greatest' : 'smallest'}: ${arr.join(', ')}?`), vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10, marks: arr }), fixed(arr.map(String), String(ans)), T('So số chục của các số.', 'Compare the tens of the numbers.'), T(`Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.`, `The ${big ? 'greatest' : 'smallest'} number is ${ans}.`));
          }
          if (f === 3) {
            const arr = U.sample(rng, Array.from({ length: 90 }, (_, k) => k + 10), 3);
            const up = [...arr].sort((x, y) => x - y);
            const right = up.join(', ');
            const bad = [[up[1], up[0], up[2]], [up[2], up[1], up[0]], [up[0], up[2], up[1]]].map(x => x.join(', '));
            return Q(T(`Xếp từ bé đến lớn: ${arr.join(', ')}`, `Put in order from smallest to greatest: ${arr.join(', ')}`), vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10, marks: arr }), U.choices(rng, right, bad), T('Tìm số bé nhất trước.', 'Find the smallest number first.'), right + '.');
          }
          const k = R(rng, 25, 85);
          const more = R(rng, 0, 1) === 1;
          const good = more ? R(rng, k + 1, Math.min(99, k + 15)) : R(rng, Math.max(10, k - 15), k - 1);
          const bad = U.sample(rng, more ? [k, k - 1, k - 10, k - 5, k - 3] : [k, k + 1, k + 10, k + 5, k + 3], 3);
          return Q(T(`Số nào ${more ? 'lớn' : 'bé'} hơn ${k}?`, `Which number is ${more ? 'greater' : 'less'} than ${k}?`), vz('compare', { left: k, right: '?' }), U.choices(rng, good, bad), T('So số chục trước, rồi so số đơn vị.', 'Compare the tens first, then the ones.'), `${good} ${more ? '>' : '<'} ${k}.`);
        }),

      lesson(6, 23, T('Bảng các số từ 1 đến 100', 'The 1 to 100 number square'),
        T('Rô-bốt ISA cùng bạn Hùng tô màu bảng số từ 1 đến 100 treo ở lớp.', 'ISA the robot and Hùng colour in the 1 to 100 number square on the classroom wall.'),
        [
          { text: T('Đếm theo chục: 10, 20, 30, …, 100.', 'Count in tens: 10, 20, 30, …, 100.'), visual: vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10 }) },
          { text: T('Đếm thêm 1: 31, 32, 33, … Số liền sau thì thêm 1.', 'Count on in ones: 31, 32, 33, … The number just after is 1 more.'), visual: vz('numberLine', { min: 30, max: 40, step: 1, labelEvery: 1, hops: [{ from: 32, to: 33, label: '+1' }] }) },
          { text: T('10 chục là 100, đọc là "một trăm".', '10 tens is 100. We read it as "one hundred".'), visual: vz('blocks', { tens: 10, ones: 0, labels: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const a0 = (L === 0 ? R(rng, 1, 4) : R(rng, 1, 9)) * 10 - (L === 0 ? 10 : 0);
          if (f === 0) {
            const u = a0 + R(rng, 1, 9);
            return Q(T('Số nào còn thiếu trên tia số?', 'Which number is missing on the number line?'), vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: L === 2 ? 5 : 1, unknown: u }), L === 2 ? num(u) : nCh(rng, u, 0, 100), T('Đếm thêm 1 từ số bên trái.', 'Count on 1 from the number on the left.'), T(`Số còn thiếu là ${u}.`, `The missing number is ${u}.`));
          }
          if (f === 1 || f === 2) {
            const after = f === 1;
            const n = L === 2 && after && R(rng, 0, 2) === 0 ? 99 : R(rng, a0 + 1, a0 + 9);
            const ans = after ? n + 1 : n - 1;
            const base = Math.min(90, Math.floor((n - 1) / 10) * 10);
            return Q(T(`Số liền ${after ? 'sau' : 'trước'} của ${n} là số nào?`, `Which number comes just ${after ? 'after' : 'before'} ${n}?`), vz('numberLine', { min: base, max: base + 10, step: 1, labelEvery: 1, marks: [n] }), nCh(rng, ans, 1, 100), after ? T('Số liền sau thì thêm 1.', 'The number just after is 1 more.') : T('Số liền trước thì bớt 1.', 'The number just before is 1 less.'), T(`Số liền ${after ? 'sau' : 'trước'} của ${n} là ${ans}.`, `The number just ${after ? 'after' : 'before'} ${n} is ${ans}.`));
          }
          if (f === 3) {
            const t = a0 + R(rng, 1, 9);
            return Q(T(`Chạm vào số ${t} trên tia số.`, `Tap the number ${t} on the number line.`), vz('numberLine', { min: a0, max: a0 + 10, step: 1, labelEvery: L === 2 ? 5 : 1 }), { kind: 'visual', check: v => v === t }, L === 2 ? T(`Tìm số ${a0 + 5} trước rồi đếm tiếp.`, `Find ${a0 + 5} first, then count on.`) : T(`Tìm số ${t} ở dưới tia số.`, `Find the number ${t} under the number line.`), T(`Số ${t} nằm giữa ${t - 1} và ${t + 1}.`, `${t} is between ${t - 1} and ${t + 1}.`));
          }
          const s0 = R(rng, 1, 6) * 10;
          const seq = [s0, s0 + 10, s0 + 20, s0 + 30];
          const miss = R(rng, 1, 3);
          return Q(T(`Đếm theo chục:\n${seq.map((v, k) => (k === miss ? '?' : v)).join(', ')}`, `Count in tens:\n${seq.map((v, k) => (k === miss ? '?' : v)).join(', ')}`), vz('numberLine', { min: 0, max: 100, step: 10, labelEvery: 10, unknown: seq[miss] }), nCh(rng, seq[miss], 10, 100, null, 10), T('Mỗi lần thêm 1 chục.', 'Add 1 ten each time.'), `${seq.join(', ')}.`);
        }),
    ],
  };

  // ============ CHỦ ĐỀ 7. ĐỘ DÀI VÀ ĐO ĐỘ DÀI ============
  const LONG2 = EN ? [['Pencil', 'Crayon'], ['Red string', 'Blue string'], ['Green snake', 'Yellow snake'], ['Train A', 'Train B'], ['Red paper strip', 'Blue paper strip'], ['Ruler', 'Pen']]
    : [['Bút chì', 'Bút sáp'], ['Dây đỏ', 'Dây xanh'], ['Rắn xanh', 'Rắn vàng'], ['Tàu A', 'Tàu B'], ['Băng giấy đỏ', 'Băng giấy xanh'], ['Thước kẻ', 'Bút mực']];
  /** English: "Pencil" → "The pencil", "Train A" → "Train A" (sentence start). */
  const theEN = s => (/ [A-C]$/.test(s) ? s : 'The ' + low(s));
  // en: English name (lower case, used after "the")
  const RUL = [
    { k: 'pencil', n: 'Bút chì', lo: 6, hi: 15, en: 'pencil' }, { k: 'crayon', n: 'Bút sáp', lo: 5, hi: 10, en: 'crayon' }, { k: 'ribbon', n: 'Dải ruy băng', lo: 4, hi: 15, en: 'ribbon' },
    { k: 'nail', n: 'Cái đinh', lo: 3, hi: 7, en: 'nail' }, { k: 'leaf', n: 'Chiếc lá', lo: 4, hi: 9, en: 'leaf' }, { k: 'eraser', n: 'Cục tẩy', lo: 2, hi: 5, en: 'rubber' },
  ];
  const cm = x => `${x} cm`;

  const c7 = {
    id: 'g1-c7', semester: 2, title: T('Độ dài và đo độ dài', 'Length and measuring length'), icon: '📏', lessons: [
      lesson(7, 25, T('Dài hơn, ngắn hơn', 'Longer, shorter'),
        T('Rô-bốt ISA cùng bạn Việt so xem sợi dây diều nào dài hơn trên cánh đồng.', 'Out in the fields, ISA the robot and Việt find out which kite string is longer.'),
        [
          { text: T('Bút đỏ dài hơn bút xanh.', 'The red pen is longer than the blue pen.'), visual: vz('tape', { bars: [{ label: T('Bút đỏ', 'Red pen'), units: 8, color: 'berry' }, { label: T('Bút xanh', 'Blue pen'), units: 5, color: 'sky' }] }) },
          { text: T('Bút xanh ngắn hơn bút đỏ.', 'The blue pen is shorter than the red pen.'), visual: vz('tape', { bars: [{ label: T('Bút đỏ', 'Red pen'), units: 8, color: 'berry' }, { label: T('Bút xanh', 'Blue pen'), units: 5, color: 'sky' }] }) },
          { text: T('Băng giấy dài bằng 6 ô.', 'The paper strip is 6 squares long.'), visual: vz('tape', { bars: [{ label: T('Băng giấy', 'Paper strip'), units: 6, parts: 6, color: 'leaf' }] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const [A, B] = P(rng, LONG2);
          const gap = L === 0 ? 3 : L === 1 ? 2 : 1;
          let x = R(rng, 2, 10), y;
          do { y = R(rng, 2, 10); } while (Math.abs(x - y) < gap);
          const bars2 = vz('tape', { bars: [{ label: A, units: x, color: 'berry' }, { label: B, units: y, color: 'sky' }] });
          if (f === 0 || f === 1) {
            const longer = f === 0;
            const ans = (longer ? x > y : x < y) ? A : B;
            return Q(T(`Cái nào ${longer ? 'dài' : 'ngắn'} hơn?`, `Which one is ${longer ? 'longer' : 'shorter'}?`), bars2, fixed([A, B], ans), T('Hai cái đặt thẳng hàng ở bên trái. Xem cái nào thò ra xa hơn bên phải.', 'Both start at the same place on the left. See which one reaches further to the right.'), T(`${ans} ${longer ? 'dài' : 'ngắn'} hơn.`, `${theEN(ans)} is ${longer ? 'longer' : 'shorter'}.`));
          }
          if (f === 2) {
            const lens = U.sample(rng, [3, 4, 5, 6, 7, 8, 9, 10], 3);
            const names = EN ? ['String A', 'String B', 'String C'] : ['Dây A', 'Dây B', 'Dây C'];
            const longest = R(rng, 0, 1) === 1;
            const v = longest ? Math.max(...lens) : Math.min(...lens);
            const ans = names[lens.indexOf(v)];
            return Q(T(`Dây nào ${longest ? 'dài nhất' : 'ngắn nhất'}?`, `Which string is the ${longest ? 'longest' : 'shortest'}?`), vz('tape', { bars: names.map((nmx, j) => ({ label: nmx, units: lens[j] })) }), fixed(names, ans), T('So từng sợi dây với nhau.', 'Compare the strings with each other.'), T(`${ans} ${longest ? 'dài nhất' : 'ngắn nhất'}.`, `${ans} is the ${longest ? 'longest' : 'shortest'}.`));
          }
          if (f === 3 || L === 0) {
            const n = R(rng, 3, L === 0 ? 7 : 10);
            return Q(T('Băng giấy dài mấy ô?', 'How many squares long is the paper strip?'), vz('tape', { bars: [{ label: T('Băng giấy', 'Paper strip'), units: n, parts: n, color: P(rng, ['leaf', 'sun', 'purple']) }] }), num(n), T('Đếm từng ô từ trái sang phải.', 'Count each square from left to right.'), T(`Băng giấy dài ${n} ô.`, `The paper strip is ${n} squares long.`));
          }
          const big = Math.max(x, y), sm = Math.min(x, y);
          return Q(T(`Băng xanh dài hơn băng đỏ mấy ô?`, 'How many squares longer is the blue strip than the red strip?'), vz('tape', { bars: [{ label: T('Băng đỏ', 'Red strip'), units: sm, parts: sm, color: 'berry' }, { label: T('Băng xanh', 'Blue strip'), units: big, parts: big, color: 'sky' }] }), num(big - sm), T('Đếm số ô thò ra ở băng xanh.', 'Count the extra squares on the blue strip.'), T(`${big} ${M} ${sm} = ${big - sm} (ô).`, `${big} ${M} ${sm} = ${big - sm} (squares).`));
        }),

      lesson(7, 26, T('Đơn vị đo độ dài', 'Units of length'),
        T('Rô-bốt ISA cùng bạn Thảo dùng thước kẻ đo chiếc bút chì mới mua cho năm học.', 'ISA the robot and Thảo use a ruler to measure the new pencil for the school year.'),
        [
          { text: T('Xăng-ti-mét viết tắt là cm. Bút chì dài 8 cm.', 'We write centimetres as cm for short. The pencil is 8 cm long.'), visual: vz('ruler', { length: 8, unit: 'cm', object: 'pencil' }) },
          { text: T('Đặt đầu vật ở vạch 0. Đầu kia ở vạch nào thì vật dài bấy nhiêu xăng-ti-mét.', 'Put one end of the object at 0. The mark at the other end tells you how many centimetres long it is.'), visual: vz('ruler', { length: 5, unit: 'cm', object: 'crayon' }) },
          { text: T('Em cũng có thể đo bằng gang tay. Cái bàn dài 3 gang tay.', 'You can also measure with hand spans. The table is 3 hand spans long.'), visual: obj('🖐️', 3) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const o = P(rng, RUL), n = R(rng, o.lo, L === 0 ? Math.min(o.hi, 10) : o.hi);
          const rv = vz('ruler', { length: n, unit: 'cm', object: o.k });
          if (f === 0) return Q(T(`${o.n} dài mấy xăng-ti-mét?`, `How many centimetres long is the ${o.en}?`), rv, num(n, 'cm'), T('Xem đầu bên phải của vật ở vạch số mấy.', 'Look at which mark the right end of the object reaches.'), T(`${o.n} dài ${n} cm.`, `The ${o.en} is ${n} cm long.`));
          if (f === 1) return Q(T(`${o.n} dài bao nhiêu?`, `How long is the ${o.en}?`), rv, nCh(rng, n, 1, 20, cm), T('Đầu bên trái ở vạch 0. Xem đầu bên phải.', 'The left end is at 0. Look at the right end.'), T(`${o.n} dài ${n} cm.`, `The ${o.en} is ${n} cm long.`));
          if (f === 2) {
            const add = L < 2 || R(rng, 0, 1) === 1;
            let a, b;
            // chủ đề 7 comes before two-digit + / − (chủ đề 8): keep cm arithmetic within 10
            if (add) { a = R(rng, L === 0 ? 1 : 2, L === 0 ? 6 : 8); b = R(rng, 1, 10 - a); }
            else { a = R(rng, 5, 10); b = R(rng, 1, a - 1); }
            const r = add ? a + b : a - b;
            const tv = add ? vz('tape', { bars: [{ label: T('Đoạn 1', 'Part 1'), units: a, value: cm(a) }, { label: T('Đoạn 2', 'Part 2'), units: b, value: cm(b) }], total: '?' })
              : vz('tape', { bars: [{ label: T('Có', 'Start'), units: a, value: cm(a) }, { label: T('Cắt đi', 'Cut off'), units: b, value: cm(b) }], diff: '?' });
            return Q(`${a} cm ${add ? '+' : M} ${b} cm = ?`, tv, num(r, 'cm'), T('Tính như với số, rồi viết thêm "cm".', 'Work it out as you do with numbers, then write "cm".'), `${a} cm ${add ? '+' : M} ${b} cm = ${r} cm.`);
          }
          if (f === 3) {
            const [A, B] = P(rng, EN ? [['Table', 'Chair'], ['Board', 'Window'], ['Bed', 'Wardrobe']] : [['Cái bàn', 'Cái ghế'], ['Bảng lớp', 'Cửa sổ'], ['Giường', 'Tủ']]);
            let a = R(rng, 2, 8), b = R(rng, 2, 8);
            if (a === b) b = a + 1;
            const longer = R(rng, 0, 1) === 1, ans = (longer ? a > b : a < b) ? A : B;
            return Q(T(`${A} dài ${a} gang tay. ${B} dài ${b} gang tay. Cái nào ${longer ? 'dài' : 'ngắn'} hơn?`, `${theEN(A)} is ${a} hand spans long. ${theEN(B)} is ${b} hand spans long. Which one is ${longer ? 'longer' : 'shorter'}?`), vz('objects', { groups: [{ emoji: '🖐️', count: a, label: A }, { emoji: '🖐️', count: b, label: B }] }), fixed([A, B], ans), T('Cái nào nhiều gang tay hơn thì dài hơn.', 'The one with more hand spans is longer.'), T(`${ans} ${longer ? 'dài' : 'ngắn'} hơn.`, `${theEN(ans)} is ${longer ? 'longer' : 'shorter'}.`));
          }
          const k = R(rng, 2, 9);
          // English: the length in English words (I18N rule 5)
          return Q(T(`Số đo nào là "${readVN(k)} xăng-ti-mét"?`, `Which measurement is "${U.readEN(k)} centimetres"?`), vz('ruler', { length: k, unit: 'cm', object: P(rng, ['ribbon', 'crayon', 'leaf']) }), U.choices(rng, cm(k), [cm(k + 10), cm(k * 10), cm(k + 1)]), T('Xăng-ti-mét viết tắt là cm.', 'We write centimetres as cm for short.'), T(`"${readVN(k)} xăng-ti-mét" viết là ${k} cm.`, `We write "${U.readEN(k)} centimetres" as ${k} cm.`));
        }),

      lesson(7, 27, T('Thực hành ước lượng và đo độ dài', 'Practice: estimating and measuring length'),
        T('Rô-bốt ISA cùng bạn Dũng đo đồ dùng học tập trong cặp sách.', 'ISA the robot and Dũng measure the things in their school bag.'),
        [
          { text: T('Đo cục tẩy: cục tẩy dài 4 cm.', 'Measure the rubber: the rubber is 4 cm long.'), visual: vz('ruler', { length: 4, unit: 'cm', object: 'eraser' }) },
          { text: T('Ước lượng: chiếc bút chì dài khoảng 15 cm, không dài tới 90 cm.', 'Estimate: a pencil is about 15 cm long. It is not as long as 90 cm.'), visual: vz('ruler', { length: 15, unit: 'cm', object: 'pencil' }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          if (f === 0 || f === 4) {
            const o = P(rng, RUL), n = R(rng, o.lo, o.hi);
            return Q(T(`Đo ${o.n.toLowerCase()}: dài mấy xăng-ti-mét?`, `Measure the ${o.en}. How many centimetres long is it?`), vz('ruler', { length: n, unit: 'cm', object: o.k }), f === 0 ? nCh(rng, n, 1, 20, cm) : num(n, 'cm'), T('Đầu bên trái ở vạch 0. Xem đầu bên phải ở vạch nào.', 'The left end is at 0. See which mark the right end reaches.'), T(`${o.n} dài ${n} cm.`, `The ${o.en} is ${n} cm long.`));
          }
          const a = R(rng, 6, 15), b0 = R(rng, 3, 12), b = b0 === a ? a - 2 : b0;
          if (f === 1) {
            const PEN = EN ? ['Pencil', 'Crayon'] : ['Bút chì', 'Bút sáp'];
            const longer = R(rng, 0, 1) === 1, ans = (longer ? a > b : a < b) ? PEN[0] : PEN[1];
            return Q(T(`Bút chì dài ${a} cm. Bút sáp dài ${b} cm. Bút nào ${longer ? 'dài' : 'ngắn'} hơn?`, `The pencil is ${a} cm long. The crayon is ${b} cm long. Which one is ${longer ? 'longer' : 'shorter'}?`), vz('tape', { bars: [{ label: PEN[0], units: a, value: cm(a), color: 'sun' }, { label: PEN[1], units: b, value: cm(b), color: 'sky' }] }), fixed(PEN, ans), T('So hai số đo.', 'Compare the two lengths.'), T(`${a} cm ${sign(a, b)} ${b} cm. ${ans} ${longer ? 'dài' : 'ngắn'} hơn.`, `${a} cm ${sign(a, b)} ${b} cm. ${theEN(ans)} is ${longer ? 'longer' : 'shorter'}.`));
          }
          if (f === 2) {
            if (L === 0) {
              const o = P(rng, RUL), n = R(rng, o.lo, Math.min(o.hi, 10));
              return Q(T(`${o.n} dài bao nhiêu?`, `How long is the ${o.en}?`), vz('ruler', { length: n, unit: 'cm', object: o.k }), nCh(rng, n, 1, 20, cm), T('Xem đầu bên phải ở vạch nào.', 'See which mark the right end reaches.'), T(`${o.n} dài ${n} cm.`, `The ${o.en} is ${n} cm long.`));
            }
            const big = Math.max(a, b), sm = Math.min(a, b);
            return Q(T(`Dây đỏ dài ${big} cm. Dây xanh dài ${sm} cm. Dây đỏ dài hơn dây xanh mấy xăng-ti-mét?`, `The red string is ${big} cm long. The blue string is ${sm} cm long. How many centimetres longer is the red string than the blue string?`), vz('tape', { bars: [{ label: T('Dây đỏ', 'Red string'), units: big, value: cm(big), color: 'berry' }, { label: T('Dây xanh', 'Blue string'), units: sm, value: cm(sm), color: 'sky' }], diff: '?' }), num(big - sm, 'cm'), T('Lấy số đo dài hơn trừ số đo ngắn hơn.', 'Take the shorter length away from the longer length.'), `${big} ${M} ${sm} = ${big - sm} (cm).`);
          }
          // en: English name with its article
          const EST = [
            { e: '✏️', n: 'Chiếc bút chì', v: 15, w: [1, 90], en: 'a pencil' }, { e: '📘', n: 'Quyển vở', v: 25, w: [2, 99], en: 'an exercise book' },
            { e: '🧽', n: 'Cục tẩy', v: 4, w: [40, 90], en: 'a rubber' }, { e: '🍃', n: 'Chiếc lá bàng', v: 15, w: [1, 80], en: 'an almond tree leaf' },
            { e: '🥄', n: 'Cái thìa', v: 12, w: [1, 70], en: 'a spoon' }, { e: '🖍️', n: 'Bút sáp màu', v: 8, w: [60, 99], en: 'a crayon' },
          ];
          const ex = P(rng, EST);
          return Q(T(`${ex.n} dài khoảng bao nhiêu?`, `About how long is ${ex.en}?`), obj(ex.e, 1), U.choices(rng, cm(ex.v), ex.w.map(cm)), T('Nghĩ xem đồ vật đó dài hơn hay ngắn hơn gang tay của em (khoảng 12 cm).', 'Think: is it longer or shorter than your hand span (about 12 cm)?'), T(`${ex.n} dài khoảng ${ex.v} cm.`, `${cap(ex.en)} is about ${ex.v} cm long.`));
        }),
    ],
  };

  // ============ CHỦ ĐỀ 8. PHÉP CỘNG, PHÉP TRỪ (KHÔNG NHỚ) TRONG PHẠM VI 100 ============
  const ADD100 = EN ? [
    (a, b, n) => `In ${n}’s garden there are ${pl(a, 'orange tree', 'orange trees')} and ${pl(b, 'pomelo tree', 'pomelo trees')}. How many trees are there altogether?`,
    (a, b) => `Mum buys ${pl(a, 'hen’s egg', 'hen’s eggs')} and ${pl(b, 'duck egg', 'duck eggs')}. How many eggs does Mum buy altogether?`,
    (a, b) => `The class bookshelf has ${pl(a, 'storybook', 'storybooks')}. The teacher brings ${b} more. How many storybooks are there altogether?`,
    (a, b) => `There ${isAre(a)} ${pl(a, 'person', 'people')} on the bus. At the next stop, ${b} more ${b === 1 ? 'person gets' : 'people get'} on. How many people are on the bus now?`,
  ] : [
    (a, b, n) => `Vườn nhà ${n} có ${a} cây cam và ${b} cây bưởi. Có tất cả bao nhiêu cây?`,
    (a, b) => `Mẹ mua ${a} quả trứng gà và ${b} quả trứng vịt. Mẹ mua tất cả bao nhiêu quả trứng?`,
    (a, b) => `Tủ sách lớp có ${a} quyển truyện. Cô mang thêm ${b} quyển. Có tất cả bao nhiêu quyển truyện?`,
    (a, b) => `Xe buýt có ${a} người. Đến bến, thêm ${b} người lên xe. Trên xe có bao nhiêu người?`,
  ];
  const SUB100 = EN ? [
    (a, b) => `There ${isAre(a)} ${pl(a, 'duck', 'ducks')} on the bank. ${b} ${b === 1 ? 'goes' : 'go'} into the pond. How many ducks are left on the bank?`,
    (a, b) => `A shop has ${pl(a, 'bánh chưng (sticky rice cake)', 'bánh chưng (sticky rice cakes)')}. It sells ${b}. How many bánh chưng are left?`,
    (a, b, n) => `${n} has ${pl(a, 'marble', 'marbles')}. ${n} gives ${b} to a friend. How many marbles does ${n} have left?`,
    (a, b) => `There ${isAre(a)} ${pl(a, 'flower', 'flowers')} in the garden. The farmer pulls up ${b}. How many flowers are left in the garden?`,
  ] : [
    (a, b) => `Trên bờ có ${a} con vịt. ${b} con xuống ao. Trên bờ còn lại bao nhiêu con vịt?`,
    (a, b) => `Cửa hàng có ${a} chiếc bánh chưng. Đã bán ${b} chiếc. Còn lại bao nhiêu chiếc bánh chưng?`,
    (a, b, n) => `${n} có ${a} viên bi. ${n} cho bạn ${b} viên. ${n} còn bao nhiêu viên bi?`,
    (a, b) => `Vườn có ${a} cây hoa. Bác nông dân nhổ đi ${b} cây. Vườn còn bao nhiêu cây hoa?`,
  ];
  function calcGen(op, pick, oneDigit) {
    return function (rng, i) {
      const L = lv(i), f = i % 5;
      const [a, b] = pick(rng, L);
      const add = op === '+', r = add ? a + b : a - b, opS = add ? '+' : M;
      const expr = `${a} ${opS} ${b}`;
      const colV = vz('columnCalc', { a, b, op: opS, reveal: 'none' });
      const colH = vz('columnCalc', { a, b, op: opS, reveal: 'steps' });
      const hintCol = T('Viết đơn vị thẳng cột đơn vị, chục thẳng cột chục. Tính từ phải sang trái.', 'Write ones under ones and tens under tens. Work from right to left.');
      if (f === 0) {
        const vis = oneDigit ? vz('numberLine', { min: Math.floor(Math.min(a, r) / 10) * 10, max: Math.floor(Math.min(a, r) / 10) * 10 + 10, step: 1, labelEvery: 1, hops: hopsOf(a, b, add ? 1 : -1), unknown: r })
          : vz('blocks', { tens: Math.floor(a / 10), ones: a % 10, labels: true });
        return Q(`${expr} = ?`, vis, nCh(rng, r, 0, 99), oneDigit ? T(`Đếm ${add ? 'thêm' : 'lùi'} ${b} bước từ ${a}.`, `Count ${add ? 'on' : 'back'} ${pl(b, 'step', 'steps')} from ${a}.`) : T(`Tính chục với chục, đơn vị với đơn vị.`, 'Work out tens with tens and ones with ones.'), `${expr} = ${r}.`, { hintVisual: colH });
      }
      if (f === 1) return Q(T(`Đặt tính rồi tính:\n${expr}`, `Set out and calculate:\n${expr}`), colV, num(r), hintCol, `${expr} = ${r}.`, { hintVisual: colH });
      if (f === 2) {
        const t = P(rng, add ? ADD100 : SUB100)(a, b, nm(rng));
        const tv = add ? vz('tape', { bars: [{ label: T('Có', 'Start'), units: Math.max(1, a), value: String(a) }, { label: T('Thêm', 'Add'), units: Math.max(1, b), value: String(b) }], total: '?' })
          : vz('tape', { bars: [{ label: T('Có', 'Start'), units: Math.max(1, a), value: String(a) }, { label: T('Bớt', 'Take away'), units: Math.max(1, b), value: String(b) }], diff: '?' });
        return Q(t, tv, num(r), add ? T('Gộp lại hay thêm vào thì làm phép cộng.', 'When we put together or add more, we add.') : T('Bớt đi hay còn lại thì làm phép trừ.', 'When some are taken away and we find what is left, we subtract.'), `${expr} = ${r}.`, { hintVisual: colH });
      }
      if (f === 3) {
        const c = Math.max(0, Math.min(99, r + P(rng, [-10, -1, 0, 1, 10, 2])));
        return Q(T(`Chọn dấu: ${expr} … ${c}`, `Choose the sign: ${expr} … ${c}`), vz('compare', { left: expr, right: c }), cmpAns(r, c), T('Tính phép tính trước rồi so sánh.', 'Work out the calculation first, then compare.'), T(`${expr} = ${r}, mà ${r} ${sign(r, c)} ${c}.`, `${expr} = ${r}, and ${r} ${sign(r, c)} ${c}.`), { hintVisual: colH });
      }
      if (L === 2) {
        if (add) return Q(`${a} + ? = ${r}`, vz('tape', { bars: [{ label: T('Có', 'Start'), units: Math.max(1, a), value: String(a) }, { label: T('Thêm', 'Add'), units: Math.max(1, b), value: '?' }], total: String(r) }), num(b), T(`Lấy ${r} ${M} ${a}.`, `Work out ${r} ${M} ${a}.`), `${a} + ${b} = ${r}.`);
        return Q(`${a} ${M} ? = ${r}`, vz('tape', { bars: [{ label: T('Có', 'Start'), units: Math.max(1, a), value: String(a) }, { label: T('Còn', 'Left'), units: Math.max(1, r), value: String(r) }], diff: '?' }), num(b), T(`Lấy ${a} ${M} ${r}.`, `Work out ${a} ${M} ${r}.`), `${a} ${M} ${b} = ${r}.`);
      }
      const right = `${expr} = ${r}`;
      const wrongs = [r + 10, r + 1, r - 10, r - 1, r + 2].filter(x => x >= 0 && x <= 99 && x !== r).map(x => `${expr} = ${x}`);
      return Q(T('Phép tính nào đúng?', 'Which calculation is correct?'), colV, U.choices(rng, right, wrongs), hintCol, right + '.', { hintVisual: colH });
    };
  }

  const c8 = {
    id: 'g1-c8', semester: 2, title: T('Phép cộng, phép trừ (không nhớ) trong phạm vi 100', 'Addition and subtraction within 100 (no regrouping)'), icon: '🧮', lessons: [
      lesson(8, 29, T('Phép cộng số có hai chữ số với số có một chữ số', 'Adding a one-digit number to a two-digit number'),
        T('Rô-bốt ISA cùng bạn An đếm trứng gà trong rổ ở trang trại của bác.', 'ISA the robot and An count the hens’ eggs in a basket on their uncle’s farm.'),
        [
          { text: T('23 + 4: 3 đơn vị thêm 4 đơn vị là 7 đơn vị. 23 + 4 = 27.', '23 + 4: 3 ones and 4 more ones make 7 ones. 23 + 4 = 27.'), visual: vz('columnCalc', { a: 23, b: 4, op: '+', reveal: 'all' }) },
          { text: T('Đếm thêm trên tia số: 23, 24, 25, 26, 27.', 'Count on along the number line: 23, 24, 25, 26, 27.'), visual: vz('numberLine', { min: 20, max: 30, step: 1, labelEvery: 1, hops: hopsOf(23, 4, 1) }) },
        ],
        calcGen('+', (rng, L) => {
          const t = L === 0 ? R(rng, 1, 3) : R(rng, 1, 9);
          const o = R(rng, 0, L === 0 ? 5 : 8);
          return [t * 10 + o, R(rng, 1, 9 - o)];
        }, true)),

      lesson(8, 30, T('Phép cộng số có hai chữ số với số có hai chữ số', 'Adding two two-digit numbers'),
        T('Rô-bốt ISA và bạn Mai gộp hai thúng nhãn hái trong vườn nhà ngoại.', 'ISA the robot and Mai put together two baskets of longans picked in Grandma’s garden.'),
        [
          { text: T('30 + 20: 3 chục cộng 2 chục là 5 chục. 30 + 20 = 50.', '30 + 20: 3 tens plus 2 tens is 5 tens. 30 + 20 = 50.'), visual: vz('blocks', { tens: 5, ones: 0, labels: true }) },
          { text: T('32 + 15: đơn vị cộng đơn vị, chục cộng chục. 32 + 15 = 47.', '32 + 15: add the ones to the ones, then the tens to the tens. 32 + 15 = 47.'), visual: vz('columnCalc', { a: 32, b: 15, op: '+', reveal: 'all' }) },
        ],
        calcGen('+', (rng, L) => {
          if (L === 0) { const x = R(rng, 1, 8); return [x * 10, R(rng, 1, 9 - x) * 10]; }
          return pairWhere(rng, [10, 80], [10, 80], (a, b) => noCarry(a, b) && a + b <= 99 && (L === 2 || (a % 10 + b % 10 <= 6)), [32, 15]);
        }, false)),

      lesson(8, 31, T('Phép trừ số có hai chữ số cho số có một chữ số', 'Subtracting a one-digit number from a two-digit number'),
        T('Rô-bốt ISA cùng bạn Nam đếm xem còn bao nhiêu chiếc bánh chưng sau phiên chợ Tết.', 'ISA the robot and Nam count how many bánh chưng are left after the Tết market.'),
        [
          { text: T('37 − 5: 7 đơn vị bớt 5 đơn vị còn 2 đơn vị. 37 − 5 = 32.', '37 − 5: 7 ones take away 5 ones leaves 2 ones. 37 − 5 = 32.'), visual: vz('columnCalc', { a: 37, b: 5, op: M, reveal: 'all' }) },
          { text: T('Đếm lùi trên tia số: 37, 36, 35, 34, 33, 32.', 'Count back along the number line: 37, 36, 35, 34, 33, 32.'), visual: vz('numberLine', { min: 30, max: 40, step: 1, labelEvery: 1, hops: hopsOf(37, 5, -1) }) },
        ],
        calcGen('−', (rng, L) => {
          const t = L === 0 ? R(rng, 1, 3) : R(rng, 1, 9);
          const o = R(rng, L === 0 ? 3 : 2, 9);
          return [t * 10 + o, R(rng, 1, o)];
        }, true)),

      lesson(8, 32, T('Phép trừ số có hai chữ số cho số có hai chữ số', 'Subtracting a two-digit number from a two-digit number'),
        T('Rô-bốt ISA và bạn Chi tính số chim còn lại trên cây đa đầu làng.', 'ISA the robot and Chi work out how many birds are left in the big banyan tree at the edge of the village.'),
        [
          { text: T('70 − 30: 7 chục bớt 3 chục còn 4 chục. 70 − 30 = 40.', '70 − 30: 7 tens take away 3 tens leaves 4 tens. 70 − 30 = 40.'), visual: vz('blocks', { tens: 4, ones: 0, labels: true }) },
          { text: T('58 − 23: đơn vị trừ đơn vị, chục trừ chục. 58 − 23 = 35.', '58 − 23: subtract the ones from the ones, then the tens from the tens. 58 − 23 = 35.'), visual: vz('columnCalc', { a: 58, b: 23, op: M, reveal: 'all' }) },
        ],
        calcGen('−', (rng, L) => {
          if (L === 0) { const x = R(rng, 2, 9); return [x * 10, R(rng, 1, x - 1) * 10]; }
          return pairWhere(rng, [20, 99], [10, 89], (a, b) => b < a && noBorrow(a, b) && Math.floor(b / 10) < Math.floor(a / 10), [58, 23]);
        }, false)),
    ],
  };

  // ============ CHỦ ĐỀ 9. THỜI GIAN, GIỜ VÀ LỊCH ============
  const gio = h => T(`${h} giờ`, `${h} o’clock`);
  const h12 = h => ((h - 1) % 12 + 12) % 12 + 1;
  // English: eb = verb after "does …", es = verb after a name, ep = part of the day
  const ACTS = [
    { t: 'thức dậy', h: 6, p: 'sáng', eb: 'wake up', es: 'wakes up', ep: 'in the morning' }, { t: 'đi học', h: 7, p: 'sáng', eb: 'go to school', es: 'goes to school', ep: 'in the morning' }, { t: 'ăn cơm trưa', h: 11, p: 'trưa', eb: 'have lunch', es: 'has lunch', ep: 'in the morning' },
    { t: 'tan học', h: 4, p: 'chiều', h24: 16, eb: 'finish school', es: 'finishes school', ep: 'in the afternoon' }, { t: 'tưới cây', h: 5, p: 'chiều', h24: 17, eb: 'water the plants', es: 'waters the plants', ep: 'in the afternoon' }, { t: 'ăn cơm tối', h: 7, p: 'tối', h24: 19, eb: 'have dinner', es: 'has dinner', ep: 'in the evening' },
    { t: 'đi ngủ', h: 9, p: 'tối', h24: 21, eb: 'go to bed', es: 'goes to bed', ep: 'in the evening' }, { t: 'tập thể dục', h: 6, p: 'sáng', eb: 'do exercises', es: 'does exercises', ep: 'in the morning' }, { t: 'đọc truyện', h: 8, p: 'tối', h24: 20, eb: 'read a story', es: 'reads a story', ep: 'in the evening' },
  ];
  const DAYS = EN ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const MON = m => MONTHS[m - 1];
  const wd = (y, m, d) => (new Date(y, m - 1, d).getDay() + 6) % 7;
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  const dayCh = (rng, k) => {
    const opts = [k, (k + 1) % 7, (k + 6) % 7, (k + 2) % 7];
    return fixed(opts.sort((x, y) => x - y).map(j => DAYS[j]), DAYS[k]);
  };
  function pickMonth(rng) { const y = P(rng, [2026, 2027]), m = R(rng, 1, 12); return { y, m, n: daysIn(y, m) }; }
  const clockSet = (h, extra) => ({ kind: 'visual', check: v => !!v && v.m === 0 && h12(v.h) === h12(h) });

  const c9 = {
    id: 'g1-c9', semester: 2, title: T('Thời gian, giờ và lịch', 'Time, clocks and calendars'), icon: '🕐', lessons: [
      lesson(9, 34, T('Xem giờ đúng trên đồng hồ', 'Telling the time: o’clock'),
        T('Rô-bốt ISA cùng bạn Lan xem đồng hồ để không bị muộn giờ đi học.', 'ISA the robot and Lan look at the clock so that they are not late for school.'),
        [
          { text: T('Kim dài chỉ số 12, kim ngắn chỉ số 3: đồng hồ chỉ 3 giờ.', 'The long hand points to 12 and the short hand points to 3: the clock shows 3 o’clock.'), visual: vz('clock', { h: 3, m: 0 }) },
          { text: T('Kim dài chỉ số 12, kim ngắn chỉ số 9: 9 giờ.', 'The long hand points to 12 and the short hand points to 9: 9 o’clock.'), visual: vz('clock', { h: 9, m: 0, digital: true }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const h = R(rng, 1, 12);
          if (f === 0) return Q(T('Đồng hồ chỉ mấy giờ?', 'What time does the clock show?'), vz('clock', { h, m: 0 }), nCh(rng, h, 1, 12, gio), T('Kim dài chỉ số 12. Xem kim ngắn chỉ số mấy.', 'The long hand points to 12. See which number the short hand points to.'), T(`Kim ngắn chỉ số ${h}: ${h} giờ.`, `The short hand points to ${h}: ${h} o’clock.`));
          if (f === 1) return Q(T('Kim ngắn chỉ số mấy?', 'Which number does the short hand point to?'), vz('clock', { h, m: 0 }), num(h), T('Kim ngắn là kim to và ngắn hơn.', 'The short hand is the thicker, shorter hand.'), T(`Kim ngắn chỉ số ${h}. Đồng hồ chỉ ${h} giờ.`, `The short hand points to ${h}. The clock shows ${h} o’clock.`));
          if (f === 2) {
            const a = P(rng, ACTS), who = nm(rng);
            return Q(T(`${who} ${a.t} lúc mấy giờ?`, `What time does ${who} ${a.eb}?`), vz('clock', { h: a.h24 || a.h, m: 0 }), nCh(rng, a.h, 1, 12, gio), T('Xem kim ngắn chỉ số mấy.', 'See which number the short hand points to.'), T(`${who} ${a.t} lúc ${a.h} giờ ${a.p}.`, `${who} ${a.es} at ${a.h} o’clock ${a.ep}.`));
          }
          if (f === 3 && L < 2) {
            const t = h === 12 ? R(rng, 1, 11) : h;
            return Q(T(`Quay kim để đồng hồ chỉ ${t} giờ.`, `Move the hands so that the clock shows ${t} o’clock.`), vz('clock', { h: 12, m: 0 }), clockSet(t), T(`Kim dài để ở số 12. Kéo kim ngắn đến số ${t}.`, `Keep the long hand on 12. Drag the short hand to ${t}.`), T(`${t} giờ: kim dài chỉ số 12, kim ngắn chỉ số ${t}.`, `${t} o’clock: the long hand points to 12 and the short hand points to ${t}.`));
          }
          if (f === 3) return Q(T('Đồng hồ chỉ mấy giờ?', 'What time does the clock show?'), vz('clock', { h, m: 0, digital: true }), num(h, T('giờ', 'o’clock')), T('Xem số trước dấu hai chấm hoặc xem kim ngắn.', 'Look at the number before the colon, or look at the short hand.'), T(`Đồng hồ chỉ ${h} giờ.`, `The clock shows ${h} o’clock.`));
          if (L === 0) return Q(T('Đồng hồ chỉ mấy giờ?', 'What time does the clock show?'), vz('clock', { h, m: 0 }), num(h, T('giờ', 'o’clock')), T('Xem kim ngắn chỉ số mấy.', 'See which number the short hand points to.'), T(`${h} giờ.`, `${h} o’clock.`));
          const k = L === 1 ? 1 : R(rng, 1, 2);
          const after = h12(h + k);
          return Q(T(`Bây giờ là ${h} giờ. Sau ${k} giờ nữa là mấy giờ?`, `It is ${h} o’clock now. What time will it be in ${pl(k, 'hour', 'hours')}?`), vz('clock', { h, m: 0 }), nCh(rng, after, 1, 12, gio), T(`Kim ngắn đi thêm ${k} số.`, `The short hand moves on ${pl(k, 'number', 'numbers')}.`), T(`${h} giờ, thêm ${k} giờ là ${after} giờ.`, `${pl(k, 'hour', 'hours')} after ${h} o’clock it is ${after} o’clock.`));
        }),

      lesson(9, 35, T('Các ngày trong tuần', 'Days of the week'),
        T('Rô-bốt ISA cùng bạn Bình đánh dấu trên tờ lịch ngày cả nhà về quê thăm ông bà.', 'ISA the robot and Bình mark the calendar with the day the family goes to the countryside to visit Grandma and Grandad.'),
        [
          { text: T('Một tuần có 7 ngày: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ nhật.', 'A week has 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.'), visual: vz('calendar', { year: 2027, month: 3, highlight: [1, 2, 3, 4, 5, 6, 7] }) },
          { text: T('Hôm nay là Thứ Ba thì ngày mai là Thứ Tư, hôm qua là Thứ Hai.', 'If today is Tuesday, then tomorrow is Wednesday and yesterday was Monday.'), visual: vz('calendar', { year: 2027, month: 3, highlight: [2] }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const { y, m, n } = pickMonth(rng);
          const d = R(rng, 2, n - 1), k = wd(y, m, d);
          const cal = vz('calendar', { year: y, month: m, highlight: [d] });
          if (f === 0) return Q(T(`Hôm nay là ${DAYS[k]}. Ngày mai là thứ mấy?`, `Today is ${DAYS[k]}. What day is it tomorrow?`), cal, dayCh(rng, (k + 1) % 7), T('Ngày mai là ngày ngay sau hôm nay.', 'Tomorrow is the day just after today.'), T(`Sau ${DAYS[k]} là ${DAYS[(k + 1) % 7]}.`, `After ${DAYS[k]} comes ${DAYS[(k + 1) % 7]}.`));
          if (f === 1) return Q(T(`Hôm nay là ${DAYS[k]}. Hôm qua là thứ mấy?`, `Today is ${DAYS[k]}. What day was it yesterday?`), cal, dayCh(rng, (k + 6) % 7), T('Hôm qua là ngày ngay trước hôm nay.', 'Yesterday is the day just before today.'), T(`Trước ${DAYS[k]} là ${DAYS[(k + 6) % 7]}.`, `Before ${DAYS[k]} comes ${DAYS[(k + 6) % 7]}.`));
          if (f === 2) return Q(T(`Ngày ${d} là thứ mấy?`, `What day of the week is the ${ord(d)}?`), cal, dayCh(rng, k), T('Tìm ngày được khoanh, rồi nhìn lên hàng chữ trên cùng.', 'Find the circled date, then look up at the names in the top row.'), T(`Ngày ${d} là ${DAYS[k]}.`, `The ${ord(d)} is a ${DAYS[k]}.`));
          if (f === 3) {
            const mid = R(rng, 1, 5);
            return Q(T(`Ngày nào ở giữa ${DAYS[mid - 1]} và ${DAYS[mid + 1]}?`, `Which day comes between ${DAYS[mid - 1]} and ${DAYS[mid + 1]}?`), vz('calendar', { year: y, month: m }), dayCh(rng, mid), T('Đọc tên các ngày trong tuần theo thứ tự.', 'Say the days of the week in order.'), `${DAYS[mid - 1]}, ${DAYS[mid]}, ${DAYS[mid + 1]}.`);
          }
          if (L < 2) return Q(T('Một tuần có mấy ngày?', 'How many days are there in a week?'), vz('calendar', { year: y, month: m }), num(7), T('Đếm các ngày ở hàng chữ trên cùng của tờ lịch.', 'Count the days in the top row of the calendar.'), T('Một tuần có 7 ngày.', 'There are 7 days in a week.'));
          let sun = 0;
          for (let x = 1; x <= n; x++) if (wd(y, m, x) === 6) sun++;
          return Q(T(`Tháng ${m} có mấy ngày Chủ nhật?`, `How many Sundays are there in ${MON(m)}?`), vz('calendar', { year: y, month: m }), num(sun), T('Đếm các số ở cột Chủ nhật (cột cuối).', 'Count the numbers in the Sunday column (the last column).'), T(`Tháng ${m} có ${sun} ngày Chủ nhật.`, `${MON(m)} has ${sun} Sundays.`));
        }),

      lesson(9, 36, T('Thực hành xem lịch và giờ', 'Practice: reading the calendar and the clock'),
        T('Rô-bốt ISA giúp bạn Hà xem lịch và đồng hồ để chuẩn bị sinh nhật mẹ.', 'ISA the robot helps Hà read the calendar and the clock to get ready for Mum’s birthday.'),
        [
          { text: T('Tờ lịch cho biết ngày và thứ. Ngày 10 tháng 5 năm 2027 là Thứ Hai.', 'A calendar page shows the dates and the days. 10 May 2027 is a Monday.'), visual: vz('calendar', { year: 2027, month: 5, highlight: [10] }) },
          { text: T('Đồng hồ chỉ 8 giờ: kim dài chỉ số 12, kim ngắn chỉ số 8.', 'The clock shows 8 o’clock: the long hand points to 12 and the short hand points to 8.'), visual: vz('clock', { h: 8, m: 0 }) },
        ],
        function (rng, i) {
          const L = lv(i), f = i % 5;
          const { y, m, n } = pickMonth(rng);
          if (f === 0) {
            const d = R(rng, 1, n), k = wd(y, m, d);
            return Q(T(`Ngày ${d} tháng ${m} là thứ mấy?`, `What day of the week is ${d} ${MON(m)}?`), vz('calendar', { year: y, month: m, highlight: [d] }), dayCh(rng, k), T('Tìm ngày được khoanh, rồi nhìn lên hàng chữ trên cùng.', 'Find the circled date, then look up at the names in the top row.'), T(`Ngày ${d} tháng ${m} là ${DAYS[k]}.`, `${d} ${MON(m)} is a ${DAYS[k]}.`));
          }
          if (f === 1) {
            const d = R(rng, 1, n - 1);
            const back = L === 2 && d > 1 && R(rng, 0, 1) === 1;
            return Q(T(`Hôm nay là ngày ${d}. ${back ? 'Hôm qua' : 'Ngày mai'} là ngày mấy?`, `Today is the ${ord(d)}. ${back ? 'What was the date yesterday?' : 'What is the date tomorrow?'}`), vz('calendar', { year: y, month: m, highlight: [d] }), num(back ? d - 1 : d + 1), back ? T('Hôm qua là ngày ngay trước.', 'Yesterday is the day just before.') : T('Ngày mai là ngày ngay sau.', 'Tomorrow is the day just after.'), T(`${back ? 'Hôm qua' : 'Ngày mai'} là ngày ${back ? d - 1 : d + 1}.`, `${back ? 'Yesterday was' : 'Tomorrow is'} the ${ord(back ? d - 1 : d + 1)}.`));
          }
          if (f === 2) {
            const a = P(rng, ACTS), who = nm(rng);
            return Q(T(`Đồng hồ chỉ giờ ${who} ${a.t}. Đó là mấy giờ?`, `The clock shows the time when ${who} ${a.es}. What time is it?`), vz('clock', { h: a.h24 || a.h, m: 0 }), nCh(rng, a.h, 1, 12, gio), T('Kim dài chỉ số 12. Xem kim ngắn.', 'The long hand points to 12. Look at the short hand.'), T(`${who} ${a.t} lúc ${a.h} giờ ${a.p}.`, `${who} ${a.es} at ${a.h} o’clock ${a.ep}.`));
          }
          if (f === 3) {
            const k = R(rng, 0, 6);
            let first = 1; while (wd(y, m, first) !== k) first++;
            return Q(T(`${DAYS[k]} đầu tiên của tháng ${m} là ngày mấy?`, `What is the date of the first ${DAYS[k]} in ${MON(m)}?`), vz('calendar', { year: y, month: m }), num(first), T(`Tìm cột ${DAYS[k]}, xem số đầu tiên trong cột.`, `Find the ${DAYS[k]} column and look at the first number in it.`), T(`${DAYS[k]} đầu tiên là ngày ${first}.`, `The first ${DAYS[k]} is the ${ord(first)}.`));
          }
          const a = P(rng, ACTS), who = nm(rng);
          return Q(T(`${who} ${a.t} lúc ${a.h} giờ ${a.p}. Quay kim đồng hồ chỉ ${a.h} giờ.`, `${who} ${a.es} at ${a.h} o’clock ${a.ep}. Move the hands to show ${a.h} o’clock.`), vz('clock', { h: a.h === 12 ? 3 : 12, m: 0 }), clockSet(a.h), T(`Kim dài ở số 12, kim ngắn ở số ${a.h}.`, `The long hand is on 12 and the short hand is on ${a.h}.`), T(`${a.h} giờ: kim ngắn chỉ số ${a.h}, kim dài chỉ số 12.`, `${a.h} o’clock: the short hand points to ${a.h} and the long hand points to 12.`));
        }),
    ],
  };

  // ---------- exam(rng, level): exam-style question for "Ôn tập & Kiểm tra" (no tap-to-answer items;
  // level 1/2/3 = Mức 1/2/3 picks a fitting generator index) ----------
  const EXAM_IDX = {
    'g1-c1-b1': { 1: [0, 2, 3], 2: [5, 7], 3: [8] },
    'g1-c1-b2': { 1: [0, 2, 3], 2: [5, 7], 3: [8] },
    'g1-c1-b4': { 1: [1, 2, 3], 2: [5, 6], 3: [8] },
    'g1-c2-b7': { 1: [0, 3], 2: [2, 7], 3: [7, 8] },
    'g1-c3-b10': { 1: [1, 3], 2: [2, 6], 3: [7] },
    'g1-c3-b11': { 1: [1, 3], 2: [2, 6], 3: [7] },
    'g1-c3-b12': { 1: [0, 5], 2: [4], 3: [9] },
    'g1-c6-b23': { 1: [0, 1, 2], 2: [5, 6, 7], 3: [4, 9] },
    'g1-c8-b29': { 1: [1], 2: [6], 3: [7] },
    'g1-c8-b30': { 1: [1], 2: [6], 3: [7] },
    'g1-c8-b31': { 1: [1], 2: [6], 3: [7] },
    'g1-c8-b32': { 1: [1], 2: [6], 3: [7] },
    'g1-c9-b34': { 1: [0, 5], 2: [2, 7], 3: [9] },
    'g1-c9-b36': { 1: [0, 2], 2: [1, 6], 3: [8] },
  };
  [c1, c2, c3, c4, c6, c7, c8, c9].forEach(t => t.lessons.forEach(L => {
    const map = EXAM_IDX[L.id];
    if (!map) return;
    // A trắc nghiệm exam slot turns a typed number answer v into A B C D with distractors up to v + 12
    // (v + 3 below 20), so redraw answers that could push a distractor past 99 (lớp 1 numbers stop at 100).
    const tooHigh = q => q && q.answer && q.answer.kind === 'number' && q.answer.value + (q.answer.value < 20 ? 3 : 12) > 99;
    L.exam = (rng, level) => {
      let q;
      for (let t = 0; t < 30; t++) { q = L.gen(rng, P(rng, map[level] || map[2])); if (!tooHigh(q)) break; }
      return q;
    };
  }));

  CURRICULUM.push({
    grade: 1,
    title: 'Lớp 1',
    book: 'Kết nối tri thức với cuộc sống',
    topics: [c1, c2, c3, c4, c6, c7, c8, c9],
  });
})();
