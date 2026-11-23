/* Toán ISA — Học dạng toán, lớp 1 (SGK Toán 1 "Kết nối tri thức với cuộc sống"). Contract: DANGTOAN.md.
 * The child is 6: very short sentences, a picture where the lessons use one, numbers to 10 in học kì I and to 100
 * without carrying in học kì II, one calculation per problem.
 */
(function () {
  'use strict';
  const L = DT.L, R = DT.R, P = DT.P, M = DT.M, num = DT.num, ch = DT.ch, vz = DT.vz, Q = DT.Q, step = DT.step;

  // ---------- small helpers ----------
  const pl = (n, s, p) => `${n} ${n === 1 ? s : p}`;            // English: "1 apple" / "3 apples"
  const isAre = n => (n === 1 ? 'is' : 'are');
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const signCh = (rng, a, b) => ch(rng, sign(a, b), ['<', '>', '=']);                       // guided steps: a choice
  const cmp = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b ? 0 : a > b ? 1 : 2 }); // practice: big sign buttons
  const G = (prompt, steps, done, visual) => Object.assign({ prompt, steps, done }, visual ? { visual } : {});
  const un = (it, k) => L(it.n, k === 1 ? it.s : it.p);         // unit after an answer
  const noCarry = (a, b) => a % 10 + b % 10 < 10 && a + b < 100;
  const noBorrow = (a, b) => a % 10 >= b % 10 && a >= b;
  function pairWhere(rng, ra, rb, ok, fb) {
    for (let g = 0; g < 400; g++) { const a = R(rng, ra[0], ra[1]), b = R(rng, rb[0], rb[1]); if (ok(a, b)) return [a, b]; }
    return fb;
  }
  const objAdd = (e, a, b) => vz('objects', { groups: [{ emoji: e, count: a }, { emoji: e, count: b }], op: '+' });
  const objSub = (e, a, b) => vz('objects', { groups: [{ emoji: e, count: a }], crossOut: b });
  const line10 = extra => vz('numberLine', Object.assign({ min: 0, max: 10, step: 1, labelEvery: 1 }, extra || {}));
  const hops = (from, k, dir) => Array.from({ length: k }, (_, j) => ({ from: from + dir * j, to: from + dir * (j + 1), label: dir > 0 ? '+1' : M + '1' }));
  const blk = n => vz('blocks', { hundreds: 0, tens: Math.floor(n / 10), ones: n % 10 });
  const col = (a, b, op) => vz('columnCalc', { a, b, op, reveal: 'none' });
  const asc = arr => arr.slice().sort((x, y) => x - y);

  // n: Vietnamese noun with its classifier, s / p: English singular / plural
  const APPLE = { n: 'quả táo', e: '🍎', s: 'apple', p: 'apples' }, ORANGE = { n: 'quả cam', e: '🍊', s: 'orange', p: 'oranges' },
    FISH = { n: 'con cá', e: '🐟', s: 'fish', p: 'fish' }, FLOWER = { n: 'bông hoa', e: '🌸', s: 'flower', p: 'flowers' },
    SWEET = { n: 'cái kẹo', e: '🍬', s: 'sweet', p: 'sweets' }, HEN = { n: 'con gà', e: '🐔', s: 'chicken', p: 'chickens' },
    BALL = { n: 'quả bóng', e: '⚽', s: 'ball', p: 'balls' }, DUCK = { n: 'con vịt', e: '🦆', s: 'duck', p: 'ducks' },
    PENCIL = { n: 'cái bút chì', e: '✏️', s: 'pencil', p: 'pencils' }, STAR = { n: 'ngôi sao', e: '⭐', s: 'star', p: 'stars' },
    BIRD = { n: 'con chim', e: '🐦', s: 'bird', p: 'birds' }, CAR = { n: 'ô tô', e: '🚗', s: 'car', p: 'cars' },
    CAKE = { n: 'cái bánh', e: '🥮', s: 'cake', p: 'cakes' }, BALLOON = { n: 'quả bóng bay', e: '🎈', s: 'balloon', p: 'balloons' },
    KID = { n: 'bạn', e: '🧒', s: 'child', p: 'children' };
  const ITEMS = [APPLE, ORANGE, FISH, FLOWER, SWEET, HEN, BALL, DUCK, PENCIL, STAR];

  // "thêm" stories within 10: a at first, b more (w: a child's name)
  const ADD = [
    (a, b) => ({ it: DUCK, vi: `Có ${a} con vịt dưới ao. Thêm ${b} con vịt nữa xuống ao. Hỏi có tất cả mấy con vịt?`, en: `There ${isAre(a)} ${pl(a, 'duck', 'ducks')} on the pond. ${b} more ${b === 1 ? 'duck comes' : 'ducks come'}. How many ducks are there altogether?` }),
    (a, b, w) => ({ it: SWEET, vi: `${w} có ${a} cái kẹo. Mẹ cho thêm ${b} cái kẹo. Hỏi ${w} có tất cả mấy cái kẹo?`, en: `${w} has ${pl(a, 'sweet', 'sweets')}. Mum gives ${w} ${b} more. How many sweets does ${w} have altogether?` }),
    (a, b) => ({ it: BIRD, vi: `Trên cành có ${a} con chim. Có thêm ${b} con chim bay đến. Hỏi trên cành có tất cả mấy con chim?`, en: `There ${isAre(a)} ${pl(a, 'bird', 'birds')} on a branch. ${b} more ${b === 1 ? 'bird flies' : 'birds fly'} over. How many birds are on the branch altogether?` }),
    (a, b, w) => ({ it: FLOWER, vi: `Lọ hoa có ${a} bông hoa. ${w} cắm thêm ${b} bông hoa. Hỏi lọ hoa có tất cả mấy bông hoa?`, en: `A vase has ${pl(a, 'flower', 'flowers')} in it. ${w} puts in ${b} more. How many flowers are in the vase altogether?` }),
    (a, b) => ({ it: CAR, vi: `Bãi xe có ${a} ô tô. Có thêm ${b} ô tô chạy vào. Hỏi bãi xe có tất cả mấy ô tô?`, en: `There ${isAre(a)} ${pl(a, 'car', 'cars')} in the car park. ${b} more ${b === 1 ? 'car drives' : 'cars drive'} in. How many cars are there altogether?` }),
  ];
  // "bớt" stories within 10: a at first, b go away
  const SUB = [
    (a, b) => ({ it: BALLOON, vi: `Có ${a} quả bóng bay. Bay mất ${b} quả bóng bay. Hỏi còn lại mấy quả bóng bay?`, en: `There are ${a} balloons. ${b} ${b === 1 ? 'balloon floats' : 'balloons float'} away. How many balloons are left?` }),
    (a, b, w) => ({ it: CAKE, vi: `Trên đĩa có ${a} cái bánh. ${w} ăn ${b} cái bánh. Hỏi trên đĩa còn lại mấy cái bánh?`, en: `There are ${a} cakes on a plate. ${w} eats ${b}. How many cakes are left on the plate?` }),
    (a, b) => ({ it: BIRD, vi: `Trên cành có ${a} con chim. Có ${b} con chim bay đi. Hỏi trên cành còn lại mấy con chim?`, en: `There are ${a} birds on a branch. ${b} ${b === 1 ? 'bird flies' : 'birds fly'} away. How many birds are left on the branch?` }),
    (a, b) => ({ it: ORANGE, vi: `Trong rổ có ${a} quả cam. Mẹ lấy ra ${b} quả cam. Hỏi trong rổ còn lại mấy quả cam?`, en: `A basket has ${a} oranges. Mum takes out ${b}. How many oranges are left in the basket?` }),
    (a, b, w) => ({ it: PENCIL, vi: `${w} có ${a} cái bút chì. ${w} cho bạn ${b} cái bút chì. Hỏi ${w} còn lại mấy cái bút chì?`, en: `${w} has ${a} pencils. ${w} gives ${b} to a friend. How many pencils does ${w} have left?` }),
  ];

  // stories within 100 (học kì II): u = unit of the answer [Vietnamese, English]
  const ADD100 = [
    (a, b) => ({ u: ['cây', 'trees'], vi: `Lớp 1A trồng được ${a} cây, lớp 1B trồng được ${b} cây. Hỏi cả hai lớp trồng được bao nhiêu cây?`, en: `Class 1A plants ${a} trees and class 1B plants ${b} trees. How many trees do the two classes plant altogether?` }),
    (a, b, w) => ({ u: ['nhãn vở', 'book labels'], vi: `${w} có ${a} nhãn vở. Mẹ mua thêm cho ${w} ${b} nhãn vở. Hỏi ${w} có tất cả bao nhiêu nhãn vở?`, en: `${w} has ${a} book labels. Mum buys ${w} ${b} more. How many book labels does ${w} have altogether?` }),
    (a, b) => ({ u: ['con gà', 'chickens'], vi: `Nhà bà có ${a} con gà. Bà mua thêm ${b} con gà. Hỏi nhà bà có tất cả bao nhiêu con gà?`, en: `Grandma has ${a} chickens. She buys ${b} more. How many chickens does Grandma have altogether?` }),
    (a, b, w) => ({ u: ['trang', 'pages'], vi: `Hôm qua ${w} đọc được ${a} trang sách, hôm nay đọc được ${b} trang sách. Hỏi cả hai ngày ${w} đọc được bao nhiêu trang sách?`, en: `Yesterday ${w} read ${a} pages. Today ${w} reads ${b} pages. How many pages does ${w} read in the two days altogether?` }),
  ];
  const SUB100 = [
    (a, b, w) => ({ u: ['viên bi', 'marbles'], vi: `${w} có ${a} viên bi. ${w} cho bạn ${b} viên bi. Hỏi ${w} còn lại bao nhiêu viên bi?`, en: `${w} has ${a} marbles. ${w} gives ${b} marbles to a friend. How many marbles does ${w} have left?` }),
    (a, b) => ({ u: ['quả bóng', 'balls'], vi: `Cửa hàng có ${a} quả bóng. Cửa hàng đã bán ${b} quả bóng. Hỏi cửa hàng còn lại bao nhiêu quả bóng?`, en: `A shop has ${a} balls. It sells ${b} balls. How many balls does the shop have left?` }),
    (a, b) => ({ u: ['người', 'people'], vi: `Trên xe buýt có ${a} người. Đến bến, có ${b} người xuống xe. Hỏi trên xe còn lại bao nhiêu người?`, en: `There are ${a} people on a bus. At the stop, ${b} people get off. How many people are left on the bus?` }),
    (a, b, w) => ({ u: ['cm', 'cm'], vi: `Sợi dây dài ${a} cm. ${w} cắt đi ${b} cm. Hỏi sợi dây còn lại dài bao nhiêu xăng-ti-mét?`, en: `A piece of string is ${a} cm long. ${w} cuts off ${b} cm. How many centimetres of string are left?` }),
  ];

  const RUL = [
    { k: 'pencil', n: 'bút chì', lo: 6, hi: 15, en: 'pencil' }, { k: 'crayon', n: 'bút sáp', lo: 5, hi: 10, en: 'crayon' }, { k: 'ribbon', n: 'dải ruy băng', lo: 4, hi: 15, en: 'ribbon' },
    { k: 'nail', n: 'cái đinh', lo: 3, hi: 7, en: 'nail' }, { k: 'leaf', n: 'chiếc lá', lo: 4, hi: 9, en: 'leaf' }, { k: 'eraser', n: 'cục tẩy', lo: 2, hi: 5, en: 'rubber' },
  ];
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const gio = h => L(`${h} giờ`, `${h} o’clock`);
  // what a child does at a given hour (es: English verb after a name)
  const ACTS = [
    { t: 'thức dậy', h: 6, es: 'wakes up' }, { t: 'đi học', h: 7, es: 'goes to school' }, { t: 'ăn cơm trưa', h: 11, es: 'has lunch' }, { t: 'tan học', h: 4, es: 'finishes school' },
    { t: 'tưới cây', h: 5, es: 'waters the plants' }, { t: 'ăn cơm tối', h: 7, es: 'has dinner' }, { t: 'đi ngủ', h: 9, es: 'goes to bed' }, { t: 'đọc truyện', h: 8, es: 'reads a story' },
    { t: 'tập thể dục', h: 6, es: 'does exercises' }, { t: 'học bài', h: 3, es: 'does homework' }, { t: 'đi bơi', h: 10, es: 'goes swimming' }, { t: 'ngủ trưa', h: 12, es: 'has a nap' },
  ];
  const DAYS = U.EN ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const day = k => DAYS[((k % 7) + 7) % 7];
  const dayCh = (rng, k) => ch(rng, day(k), [day(k + 1), day(k - 1), day(k + 2)]);

  DT.add(1, [
    // ================= HỌC KÌ I =================
    {
      id: 'g1-dt-so-sanh', sem: 1, icon: '🐊', lesson: 'g1-c1-b4',
      title: L('So sánh hai số: lớn hơn, bé hơn, bằng nhau', 'Comparing two numbers: greater than, less than, equal to'),
      spot: L('Bài cho hai số (hoặc hai nhóm đồ vật). Em phải điền dấu >, <, = hoặc nói số nào lớn hơn, số nào bé hơn.', 'The problem gives two numbers (or two groups of things). You put in the sign >, < or =, or say which number is greater and which is smaller.'),
      steps: [
        L('Bước 1: Đếm từng nhóm để biết hai số.', 'Step 1: Count each group to find the two numbers.'),
        L('Bước 2: Khi đếm 1, 2, 3, … số nào đếm sau thì lớn hơn.', 'Step 2: When you count 1, 2, 3, … the number you say later is the greater one.'),
        L('Bước 3: Viết dấu. Đầu nhọn của dấu luôn chỉ vào số bé.', 'Step 3: Write the sign. The pointed end always points to the smaller number.'),
      ],
      tip: L('Dấu > và dấu < rất dễ lẫn. Em nhớ: miệng dấu mở về phía số lớn, đầu nhọn chỉ vào số bé.', 'The signs > and < are easy to mix up. Remember: the open side faces the greater number and the point faces the smaller number.'),
      guide: rng => {
        const [x, y] = U.sample(rng, ITEMS, 2);
        const a = R(rng, 1, 9), b0 = R(rng, 1, 9), b = b0 === a ? a + 1 : b0;
        const big = Math.max(a, b), small = Math.min(a, b), s = sign(a, b);
        return G(
          L(`Có ${a} ${x.n} và ${b} ${y.n}. Em điền dấu >, <, = cho đúng:\n${a} … ${b}`, `There ${isAre(a)} ${pl(a, x.s, x.p)} and ${pl(b, y.s, y.p)}. Put in the right sign (>, < or =):\n${a} … ${b}`),
          [
            step(L(`Em đếm xem có mấy ${x.n}?`, `Count the ${x.p}. How many are there?`), num(a), L(`Có ${a} ${x.n} và ${b} ${y.n}. Ta so sánh ${a} và ${b}.`, `There ${isAre(a)} ${pl(a, x.s, x.p)} and ${pl(b, y.s, y.p)}. We compare ${a} and ${b}.`), L('Chạm vào từng hình và đếm: một, hai, ba…', 'Touch each picture and count: one, two, three…')),
            step(L(`Số nào lớn hơn: ${a} hay ${b}?`, `Which number is greater: ${a} or ${b}?`), ch(rng, big, [small]), L(`Khi đếm, ${big} đứng sau ${small} nên ${big} lớn hơn ${small}.`, `When we count, ${big} comes after ${small}, so ${big} is greater than ${small}.`), L('Đếm từ 1. Số nào đếm sau thì lớn hơn.', 'Count from 1. The number you say later is greater.')),
            step(L(`Chọn dấu đúng: ${a} … ${b}`, `Choose the right sign: ${a} … ${b}`), signCh(rng, a, b), L(`${a} ${s} ${b}. Đầu nhọn chỉ vào số bé là ${small}.`, `${a} ${s} ${b}. The point faces the smaller number, ${small}.`), L('Đầu nhọn của dấu chỉ vào số bé.', 'The pointed end points to the smaller number.')),
          ],
          L(`Đáp số: ${a} ${s} ${b}.`, `Answer: ${a} ${s} ${b}.`),
          vz('objects', { groups: [{ emoji: x.e, count: a }, { emoji: y.e, count: b }] }));
      },
      practice: (rng, i) => {
        const hintS = L('Đầu nhọn của dấu chỉ vào số bé.', 'The pointed end points to the smaller number.');
        if (i < 4) {
          const top = i < 2 ? 5 : 10, a = R(rng, 0, top), b = i === 3 && R(rng, 0, 2) === 0 ? a : R(rng, 0, top), it = P(rng, ITEMS);
          const v = i < 2 ? vz('compare', { left: { emoji: it.e, count: a }, right: { emoji: it.e, count: b } }) : vz('compare', { left: a, right: b });
          return Q(L(`Chọn dấu đúng:\n${a} … ${b}`, `Choose the right sign:\n${a} … ${b}`), cmp(a, b),
            a === b ? L(`Hai số giống nhau: ${a} = ${b}.`, `The two numbers are the same: ${a} = ${b}.`) : L(`${Math.max(a, b)} đếm sau ${Math.min(a, b)} nên lớn hơn. Vậy ${a} ${sign(a, b)} ${b}.`, `${Math.max(a, b)} comes after ${Math.min(a, b)} when we count, so it is greater. So ${a} ${sign(a, b)} ${b}.`), { hint: hintS, visual: v });
        }
        if (i === 4) {
          const [w1, w2] = DT.names(rng, 2), it = P(rng, ITEMS), a = R(rng, 1, 10), b0 = R(rng, 1, 10), b = b0 === a ? (a < 10 ? a + 1 : a - 1) : b0;
          const more = R(rng, 0, 1) === 1, ans = (a > b) === more ? w1 : w2;
          return Q(L(`${w1} có ${a} ${it.n}. ${w2} có ${b} ${it.n}. Bạn nào có ${more ? 'nhiều' : 'ít'} ${it.n} hơn?`, `${w1} has ${pl(a, it.s, it.p)}. ${w2} has ${pl(b, it.s, it.p)}. Who has ${more ? 'more' : 'fewer'} ${it.p}?`), ch(rng, ans, [ans === w1 ? w2 : w1]),
            L(`${a} ${sign(a, b)} ${b} nên ${ans} có ${more ? 'nhiều' : 'ít'} hơn.`, `${a} ${sign(a, b)} ${b}, so ${ans} has ${more ? 'more' : 'fewer'}.`), { hint: L(`So sánh ${a} và ${b}.`, `Compare ${a} and ${b}.`), visual: vz('compare', { left: { emoji: it.e, count: a }, right: { emoji: it.e, count: b } }) });
        }
        if (i === 5 || i === 6) {
          const t = U.sample(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3), big = i === 5, ans = big ? Math.max(...t) : Math.min(...t);
          return Q(L(`Số nào ${big ? 'lớn' : 'bé'} nhất?\n${t.join(', ')}`, `Which number is the ${big ? 'greatest' : 'smallest'}?\n${t.join(', ')}`), ch(rng, ans, t.filter(x => x !== ans)),
            L(`Xếp theo thứ tự đếm: ${asc(t).join(', ')}. Số ${big ? 'lớn' : 'bé'} nhất là ${ans}.`, `In counting order: ${asc(t).join(', ')}. The ${big ? 'greatest' : 'smallest'} number is ${ans}.`), { hint: big ? L('Số nào đếm sau cùng thì lớn nhất.', 'The number you say last is the greatest.') : L('Số nào đếm trước tiên thì bé nhất.', 'The number you say first is the smallest.'), visual: line10({ marks: t }) });
        }
        if (i === 7) {
          const t = U.sample(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3), up = R(rng, 0, 1) === 1, s = asc(t), ok = up ? s : s.slice().reverse();
          const f = o => o.join(', ');
          return Q(L(`Xếp các số ${f(t)} theo thứ tự từ ${up ? 'bé đến lớn' : 'lớn đến bé'}.`, `Put the numbers ${f(t)} in order from ${up ? 'smallest to greatest' : 'greatest to smallest'}.`), ch(rng, f(ok), [f(ok.slice().reverse()), f([ok[1], ok[0], ok[2]]), f([ok[0], ok[2], ok[1]])]),
            L(`Thứ tự đúng: ${f(ok)}.`, `The right order: ${f(ok)}.`), { hint: up ? L('Tìm số bé nhất trước.', 'Find the smallest number first.') : L('Tìm số lớn nhất trước.', 'Find the greatest number first.'), visual: line10({ marks: t }) });
        }
        if (i === 9) { const q = DT.bank(rng, ['g1-nc-hai-dieu-kien']); if (q) return q; }
        const x = R(rng, 1, 8);
        return Q(L(`Số nào lớn hơn ${x} và bé hơn ${x + 2}?`, `Which number is greater than ${x} and less than ${x + 2}?`), num(x + 1), L(`Đếm: ${x}, ${x + 1}, ${x + 2}. Số ở giữa là ${x + 1}.`, `Count: ${x}, ${x + 1}, ${x + 2}. The number in between is ${x + 1}.`), { hint: L(`Số đó đứng giữa ${x} và ${x + 2} khi đếm.`, `It comes between ${x} and ${x + 2} when you count.`), visual: line10({ marks: [x, x + 2] }) });
      },
    },

    {
      id: 'g1-dt-tach-gop', sem: 1, icon: '🧩', lesson: 'g1-c1-b5',
      title: L('Tách số, gộp số (mấy và mấy)', 'Putting numbers together and splitting them (number bonds)'),
      spot: L('Bài hỏi “… và … là mấy?” (gộp lại) hoặc “… gồm … và mấy?” (tách ra).', 'The problem asks "… and … make how many?" (put together) or "… is made of … and how many?" (split).'),
      steps: [
        L('Bước 1: Gộp: đếm tất cả hai nhóm.', 'Step 1: To put together, count both groups.'),
        L('Bước 2: Tách: biết cả hai nhóm và một nhóm, em đếm nhóm còn lại.', 'Step 2: To split, you know the whole and one group. Count the other group.'),
        L('Bước 3: Nói lại cả câu: “7 gồm 3 và 4”.', 'Step 3: Say the whole sentence: "7 is made of 3 and 4".'),
      ],
      tip: L('Khi tách số, đừng đếm lại cả hai nhóm. Em chỉ đếm nhóm chưa biết.', 'When you split a number, do not count both groups again. Count only the group you do not know.'),
      guide: rng => {
        const n = R(rng, 4, 10), a = R(rng, 2, n - 1), b = n - a;   // a ≥ 2 so that the plural names read well
        const [ea, na, eb, nb, sa, sb] = P(rng, [['🌹', 'bông hoa hồng', '🌼', 'bông hoa cúc', 'roses', 'daisies'], ['🍎', 'quả táo đỏ', '🍏', 'quả táo xanh', 'red apples', 'green apples'], ['🐔', 'con gà mẹ', '🐥', 'con gà con', 'hens', 'chicks'], ['🚗', 'ô tô', '🚌', 'xe buýt', 'cars', 'buses'], ['🔴', 'chấm tròn đỏ', '🔵', 'chấm tròn xanh', 'red dots', 'blue dots']]);
        return G(
          L(`Có ${n} hình, gồm ${a} ${na} và một số ${nb}.\n${n} gồm ${a} và mấy?`, `There are ${n} pictures: ${a} ${sa} and some ${sb}.\n${n} is made of ${a} and how many?`),
          [
            step(L('Em đếm tất cả. Có mấy hình?', 'Count them all. How many pictures are there?'), num(n), L(`Có tất cả ${n} hình.`, `There are ${n} pictures altogether.`), L('Đếm cả hai nhóm.', 'Count both groups.')),
            step(L(`Muốn biết ${n} gồm ${a} và mấy, em đếm nhóm nào?`, `To find what goes with ${a} to make ${n}, which group do you count?`), ch(rng, L(`Nhóm ${nb}`, `The ${sb}`), [L(`Nhóm ${na}`, `The ${sa}`)]), L(`Đã biết có ${a} ${na}. Ta đếm nhóm còn lại: ${nb}.`, `We know there are ${a} ${sa}. We count the other group: the ${sb}.`)),
            step(L(`Đếm ${nb}. ${n} gồm ${a} và mấy?`, `Count the ${sb}. ${n} is made of ${a} and how many?`), num(b), L(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`), L(`Đếm nhóm ${nb}.`, `Count the ${sb}.`)),
          ],
          L(`Đáp số: ${n} gồm ${a} và ${b}.`, `Answer: ${n} is made of ${a} and ${b}.`),
          vz('objects', { groups: [{ emoji: ea, count: a }, { emoji: eb, count: b }] }));
      },
      practice: (rng, i) => {
        const n = i < 2 ? R(rng, 2, 5) : i < 7 ? R(rng, 4, 9) : R(rng, 6, 10), a = R(rng, 1, n - 1), b = n - a;
        const [ea, eb] = P(rng, [['🔴', '🔵'], ['🌹', '🌼'], ['🍎', '🍏'], ['🐔', '🐥'], ['🚗', '🚌'], ['🟡', '🟢']]);
        const both = vz('objects', { groups: [{ emoji: ea, count: a }, { emoji: eb, count: b }] });
        const AND = L(' và ', ' and ');
        if (i === 0 || i === 2) return Q(L(`${a} và ${b} là mấy?`, `What do ${a} and ${b} make?`), num(n), L(`Đếm tất cả: ${a} và ${b} là ${n}.`, `Count them all: ${a} and ${b} make ${n}.`), { hint: L('Đếm tất cả các hình.', 'Count all the pictures.'), visual: both });
        if (i === 1 || i === 3) return Q(L(`${n} gồm ${a} và mấy?`, `${n} is made of ${a} and how many?`), num(b), L(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`), { hint: L('Đếm nhóm thứ hai.', 'Count the second group.'), visual: both });
        if (i === 4) return Q(L(`? và ${b} là ${n}`, `? and ${b} make ${n}`), num(a), L(`${a} và ${b} là ${n}.`, `${a} and ${b} make ${n}.`), { hint: L(`Từ ${b} đếm thêm cho đến ${n}. Em đếm thêm mấy lần?`, `Count on from ${b} up to ${n}. How many did you count on?`), visual: vz('objects', { groups: [{ emoji: '❔', count: 1, label: '?' }, { emoji: eb, count: b, label: b }] }) });
        if (i === 5) {
          const right = `${a}${AND}${b}`, wrong = [`${a}${AND}${b + 1}`, `${a + 1}${AND}${b + 1}`, `${b}${AND}${b}`, `${a}${AND}${a}`].filter(s => { const [p, q] = s.split(AND).map(Number); return p + q !== n; });
          return Q(L(`${n} gồm mấy và mấy?`, `${n} is made of which two numbers?`), ch(rng, right, wrong), L(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`), { hint: L('Đếm từng nhóm màu.', 'Count each colour group.'), visual: both });
        }
        if (i === 6) {
          const [w1, w2] = DT.names(rng, 2), it = P(rng, [SWEET, APPLE, ORANGE, BALL, FLOWER]);
          return Q(L(`Có ${n} ${it.n} chia cho hai bạn. ${w1} được ${a} ${it.n}. Hỏi ${w2} được mấy ${it.n}?`, `${pl(n, it.s, it.p)} are shared between two friends. ${w1} gets ${a}. How many does ${w2} get?`), num(b, un(it, b)), L(`${n} gồm ${a} và ${b}. ${w2} được ${b} ${it.n}.`, `${n} is made of ${a} and ${b}. ${w2} gets ${b}.`), { hint: L(`${n} gồm ${a} và mấy?`, `${n} is made of ${a} and how many?`), visual: vz('objects', { groups: [{ emoji: it.e, count: n }] }) });
        }
        if (i === 7) return Q(L(`Không nhìn hình, em hãy tìm số:\n${n} gồm ${a} và ?`, `Without a picture, find the number:\n${n} is made of ${a} and ?`), num(b), L(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`), { hint: L(`Từ ${a} đếm thêm cho đến ${n}.`, `Count on from ${a} up to ${n}.`) });
        if (i === 8) {
          const x = R(rng, 1, 9);
          return Q(L(`Hai số nào gộp lại được 10?\n${x} và ?`, `Which two numbers make 10?\n${x} and ?`), num(10 - x), L(`10 gồm ${x} và ${10 - x}.`, `10 is made of ${x} and ${10 - x}.`), { hint: L(`Từ ${x} đếm thêm cho đến 10.`, `Count on from ${x} up to 10.`), visual: vz('objects', { groups: [{ emoji: '🔴', count: x }, { emoji: '⚪', count: 10 - x }] }) });
        }
        const ok = R(rng, 0, 1) === 1, sb = ok ? b : (b + 1 <= 9 ? b + 1 : b - 1), T = L('Đúng', 'True'), F = L('Sai', 'False');
        return Q(L(`Đúng hay sai?\n${n} gồm ${a} và ${sb}.`, `True or false?\n${n} is made of ${a} and ${sb}.`), ch(rng, ok ? T : F, [ok ? F : T]), L(`${n} gồm ${a} và ${b}.`, `${n} is made of ${a} and ${b}.`) + (ok ? '' : L(` Không phải ${a} và ${sb}.`, ` It is not ${a} and ${sb}.`)), { hint: L(`Từ ${a} đếm thêm cho đến ${n}.`, `Count on from ${a} up to ${n}.`) });
      },
    },

    {
      id: 'g1-dt-them', sem: 1, icon: '➕', lesson: 'g1-c3-b10',
      title: L('Bài toán “thêm”: viết phép cộng thích hợp', '"Some more" problems: write the addition'),
      spot: L('Bài toán có các từ: thêm, cho thêm, bay đến, chạy vào, có tất cả. Số đồ vật nhiều lên.', 'The problem has words like: more, gives more, come, drive in, altogether. There are more things at the end.'),
      steps: [
        L('Bước 1: Tìm xem lúc đầu có mấy.', 'Step 1: Find how many there are at first.'),
        L('Bước 2: Tìm xem thêm mấy.', 'Step 2: Find how many more are added.'),
        L('Bước 3: Thêm thì làm phép cộng. Viết phép tính rồi tính.', 'Step 3: Some more are added, so we add. Write the addition and work it out.'),
      ],
      tip: L('Đừng chỉ viết kết quả. Em viết đủ phép tính, ví dụ: 4 + 3 = 7.', 'Do not write only the answer. Write the whole number sentence, for example: 4 + 3 = 7.'),
      guide: rng => {
        const s = R(rng, 4, 10), a = R(rng, 2, s - 1), b = s - a, st = P(rng, ADD)(a, b, DT.name(rng)), it = st.it;
        return G(L(st.vi, st.en), [
          step(L(`Lúc đầu có mấy ${it.n}?`, `How many ${it.p} are there at first?`), num(a), L(`Lúc đầu có ${a} ${it.n}.`, `At first there ${isAre(a)} ${pl(a, it.s, it.p)}.`), L('Đọc lại câu đầu của bài toán.', 'Read the first sentence of the problem again.')),
          step(L(`Thêm mấy ${it.n}?`, `How many more ${it.p} are added?`), num(b), L(`Thêm ${b} ${it.n}.`, `${b} more ${b === 1 ? it.s + ' is' : it.p + ' are'} added.`), L('Tìm số đứng sau chữ “thêm”.', 'Find the number that goes with the word "more".')),
          step(L('Thêm vào thì em chọn phép tính nào?', 'Some more are added. Which calculation do you choose?'), ch(rng, `${a} + ${b}`, [`${Math.max(a, b)} ${M} ${Math.min(a, b)}`]), L(`Thêm thì nhiều lên. Ta làm phép cộng: ${a} + ${b}.`, `Adding more makes more. We add: ${a} + ${b}.`), L('Thêm thì làm phép cộng.', 'Some more are added, so we add.')),
          step(`${a} + ${b} = ?`, num(s), L(`${a} + ${b} = ${s}. Có tất cả ${s} ${it.n}.`, `${a} + ${b} = ${s}. There are ${pl(s, it.s, it.p)} altogether.`), L(`Từ ${a} đếm thêm ${b}.`, `Count on ${b} from ${a}.`)),
        ], L(`Đáp số: ${s} ${it.n}.`, `Answer: ${pl(s, it.s, it.p)}.`), objAdd(it.e, a, b));
      },
      practice: (rng, i) => {
        const hintA = L('Thêm thì làm phép cộng.', 'Some more are added, so we add.');
        const s = i < 2 ? R(rng, 3, 6) : R(rng, 5, 10), a = R(rng, 1, s - 1), b = s - a, w = DT.name(rng);
        if (i < 5) {
          const st = P(rng, ADD)(a, b, w), it = st.it, ex = `${a} + ${b} = ${s} (${un(it, s)}).`;
          if (i === 4) return Q(L(st.vi, st.en) + L('\nEm chọn phép tính đúng:', '\nChoose the right number sentence:'), ch(rng, `${a} + ${b} = ${s}`, [`${Math.max(a, b)} ${M} ${Math.min(a, b)} = ${Math.abs(a - b)}`, `${a} + ${b} = ${s + 1}`]), ex, { hint: hintA, visual: objAdd(it.e, a, b) });
          return Q(L(st.vi, st.en), num(s, un(it, s)), ex, { hint: hintA, visual: objAdd(it.e, a, b) });
        }
        if (i === 5) {
          const [w1, w2] = DT.names(rng, 2), it = P(rng, [APPLE, ORANGE, SWEET, BALL, STAR]);
          return Q(L(`${w1} có ${a} ${it.n}. ${w2} có ${b} ${it.n}. Hỏi cả hai bạn có mấy ${it.n}?`, `${w1} has ${pl(a, it.s, it.p)}. ${w2} has ${pl(b, it.s, it.p)}. How many ${it.p} do they have altogether?`), num(s, un(it, s)), L(`Gộp lại thì làm phép cộng: ${a} + ${b} = ${s} (${it.n}).`, `Putting together means add: ${a} + ${b} = ${s} (${it.p}).`), { hint: L('Gộp hai nhóm lại thì làm phép cộng.', 'To put two groups together, add.'), visual: objAdd(it.e, a, b) });
        }
        if (i === 6) {
          const it = P(rng, [APPLE, ORANGE, CAKE, SWEET]), x = R(rng, 2, 9);
          return Q(L(`Đĩa thứ nhất có ${x} ${it.n}. Đĩa thứ hai không có ${it.n} nào. Hỏi cả hai đĩa có mấy ${it.n}?`, `The first plate has ${x} ${it.p}. The second plate has no ${it.p}. How many ${it.p} are on the two plates altogether?`), num(x, un(it, x)), L(`${x} + 0 = ${x} (${it.n}). Cộng với 0 thì số không đổi.`, `${x} + 0 = ${x} (${it.p}). Adding 0 does not change the number.`), { hint: L('Không có quả nào là 0.', '"None" means 0.'), visual: objAdd(it.e, x, 0) });
        }
        if (i === 7) return Q(L(`Trên sân có ${a} bạn đang chơi. Có ${b} bạn nữa chạy đến. Hỏi lúc này trên sân có mấy bạn?`, `${cap(pl(a, 'child', 'children'))} ${isAre(a)} playing in the yard. ${b} more ${b === 1 ? 'child runs' : 'children run'} over. How many children are in the yard now?`), num(s, un(KID, s)), L(`Có thêm bạn chạy đến nên làm phép cộng: ${a} + ${b} = ${s} (bạn).`, `More children come, so we add: ${a} + ${b} = ${s} (children).`), { hint: L('Số bạn nhiều lên hay ít đi?', 'Are there more children or fewer children now?'), visual: objAdd('🧒', a, b) });
        const it = P(rng, [HEN, FISH, DUCK, STAR]);
        // the question turned round: how many were there at first? (still one calculation)
        if (i === 9) return Q(L(`${w} có một số ${it.n}. Mẹ cho ${w} thêm ${b} ${it.n} thì ${w} có tất cả ${s} ${it.n}. Hỏi lúc đầu ${w} có mấy ${it.n}?`, `${w} has some ${it.p}. Mum gives ${w} ${b} more, and then ${w} has ${s} altogether. How many ${it.p} did ${w} have at first?`), num(a, un(it, a)), L(`Lúc đầu có ít hơn: ${s} ${M} ${b} = ${a}. Thử lại: ${a} + ${b} = ${s}.`, `There were fewer at first: ${s} ${M} ${b} = ${a}. Check: ${a} + ${b} = ${s}.`), { hint: L(`Số nào thêm ${b} thì được ${s}?`, `Which number and ${b} more make ${s}?`), visual: line10({ marks: [s] }) });
        return Q(L(`Có ${a} ${it.n}. Thêm mấy ${it.n} nữa thì được ${s} ${it.n}?`, `There ${isAre(a)} ${pl(a, it.s, it.p)}. How many more make ${pl(s, it.s, it.p)}?`), num(b, un(it, b)), L(`${a} + ${b} = ${s}. Thêm ${b} ${it.n}.`, `${a} + ${b} = ${s}. ${b} more.`), { hint: L(`Từ ${a} đếm thêm cho đến ${s}.`, `Count on from ${a} up to ${s}.`), visual: line10({ hops: hops(a, b, 1) }) });
      },
    },

    {
      id: 'g1-dt-bot', sem: 1, icon: '➖', lesson: 'g1-c3-b11',
      title: L('Bài toán “bớt”: viết phép trừ thích hợp', '"Take away" problems: write the subtraction'),
      spot: L('Bài toán có các từ: bớt, cho đi, ăn, bay mất, lấy ra, còn lại. Số đồ vật ít đi.', 'The problem has words like: take away, gives, eats, fly away, takes out, left. There are fewer things at the end.'),
      steps: [
        L('Bước 1: Tìm xem lúc đầu có mấy.', 'Step 1: Find how many there are at first.'),
        L('Bước 2: Tìm xem bớt đi mấy.', 'Step 2: Find how many are taken away.'),
        L('Bước 3: Bớt thì làm phép trừ. Viết phép tính rồi tính.', 'Step 3: Some are taken away, so we subtract. Write the subtraction and work it out.'),
      ],
      tip: L('Trong phép trừ, số lúc đầu (số lớn) viết trước: 7 − 2, không viết 2 − 7.', 'In a subtraction, write the number you start with (the bigger one) first: 7 − 2, not 2 − 7.'),
      guide: rng => {
        const a = R(rng, 4, 10), b = R(rng, 1, a - 1), r = a - b, st = P(rng, SUB)(a, b, DT.name(rng)), it = st.it;
        return G(L(st.vi, st.en), [
          step(L(`Lúc đầu có mấy ${it.n}?`, `How many ${it.p} are there at first?`), num(a), L(`Lúc đầu có ${a} ${it.n}.`, `At first there are ${a} ${it.p}.`), L('Đọc lại câu đầu của bài toán.', 'Read the first sentence of the problem again.')),
          step(L(`Bớt đi mấy ${it.n}?`, `How many ${it.p} are taken away?`), num(b), L(`Bớt đi ${b} ${it.n}.`, `${pl(b, it.s, it.p)} ${isAre(b)} taken away.`), L('Tìm số thứ hai trong bài toán.', 'Find the second number in the problem.')),
          step(L('Bớt đi thì em chọn phép tính nào?', 'Some are taken away. Which calculation do you choose?'), ch(rng, `${a} ${M} ${b}`, [`${a} + ${b}`]), L(`Bớt thì ít đi. Ta làm phép trừ: ${a} ${M} ${b}.`, `Taking away makes fewer. We subtract: ${a} ${M} ${b}.`), L('Bớt đi thì làm phép trừ.', 'Some are taken away, so we subtract.')),
          step(`${a} ${M} ${b} = ?`, num(r), L(`${a} ${M} ${b} = ${r}. Còn lại ${r} ${it.n}.`, `${a} ${M} ${b} = ${r}. ${cap(pl(r, it.s, it.p))} ${isAre(r)} left.`), L('Đếm những hình không bị gạch.', 'Count the pictures that are not crossed out.')),
        ], L(`Đáp số: ${r} ${it.n}.`, `Answer: ${pl(r, it.s, it.p)}.`), objSub(it.e, a, b));
      },
      practice: (rng, i) => {
        const hintS = L('Bớt đi thì làm phép trừ.', 'Some are taken away, so we subtract.');
        const a = i < 2 ? R(rng, 3, 6) : R(rng, 5, 10), b = R(rng, 1, a - 1), r = a - b, w = DT.name(rng);
        if (i < 5) {
          const st = P(rng, SUB)(a, b, w), it = st.it, ex = `${a} ${M} ${b} = ${r} (${un(it, r)}).`;
          if (i === 4) return Q(L(st.vi, st.en) + L('\nEm chọn phép tính đúng:', '\nChoose the right number sentence:'), ch(rng, `${a} ${M} ${b} = ${r}`, [`${a} + ${b} = ${a + b}`, `${a} ${M} ${b} = ${r + 1}`]), ex, { hint: hintS, visual: objSub(it.e, a, b) });
          return Q(L(st.vi, st.en), num(r, un(it, r)), ex, { hint: hintS, visual: objSub(it.e, a, b) });
        }
        if (i === 5) {
          const it = P(rng, [SWEET, CAKE, APPLE, ORANGE]);
          return Q(L(`${w} có ${a} ${it.n}. ${w} ăn hết cả ${a} ${it.n}. Hỏi ${w} còn lại mấy ${it.n}?`, `${w} has ${pl(a, it.s, it.p)}. ${w} eats all ${a}. How many ${it.p} does ${w} have left?`), num(0, un(it, 0)), L(`${a} ${M} ${a} = 0. Bớt hết thì còn 0.`, `${a} ${M} ${a} = 0. Take them all away and 0 are left.`), { hint: L('Ăn hết thì còn lại mấy?', 'If you eat them all, how many are left?'), visual: objSub(it.e, a, a) });
        }
        if (i === 6) return Q(L(`Trên cây có ${a} quả táo. Có ${b} quả táo rụng xuống đất. Hỏi trên cây còn lại mấy quả táo?`, `There are ${a} apples on a tree. ${b} ${b === 1 ? 'apple falls' : 'apples fall'} to the ground. How many apples are left on the tree?`), num(r, un(APPLE, r)), L(`Quả rụng đi nên số quả ít đi: ${a} ${M} ${b} = ${r} (quả táo).`, `Apples fall, so there are fewer: ${a} ${M} ${b} = ${r} (apples).`), { hint: L('Số quả trên cây nhiều lên hay ít đi?', 'Are there more apples on the tree or fewer?'), visual: objSub('🍎', a, b) });
        if (i === 7) return Q(L(`Có ${a} bạn đang chơi trên sân. Có ${b} bạn đi về. Hỏi trên sân còn lại mấy bạn?`, `${cap(pl(a, 'child', 'children'))} ${isAre(a)} playing in the yard. ${b} ${b === 1 ? 'child goes' : 'children go'} home. How many children are left in the yard?`), num(r, un(KID, r)), L(`Có bạn đi về nên làm phép trừ: ${a} ${M} ${b} = ${r} (bạn).`, `Some children go home, so we subtract: ${a} ${M} ${b} = ${r} (children).`), { hint: L('Số bạn nhiều lên hay ít đi?', 'Are there more children or fewer children now?'), visual: objSub('🧒', a, b) });
        if (i === 8) {
          const it = P(rng, [BALLOON, SWEET, PENCIL, STAR]);
          return Q(L(`${w} có ${a} ${it.n}. Sau khi cho bạn một số ${it.n}, ${w} còn lại ${r} ${it.n}. Hỏi ${w} đã cho bạn mấy ${it.n}?`, `${w} has ${pl(a, it.s, it.p)}. ${w} gives some to a friend and has ${r} left. How many ${it.p} did ${w} give away?`), num(b, un(it, b)), L(`${a} ${M} ${r} = ${b}. ${w} đã cho bạn ${b} ${it.n}.`, `${a} ${M} ${r} = ${b}. ${w} gave away ${b}.`), { hint: L(`Lấy số lúc đầu trừ số còn lại: ${a} ${M} ${r}.`, `Take what is left away from what there was at first: ${a} ${M} ${r}.`), visual: line10({ marks: [a, r] }) });
        }
        // the question turned round: how many were there at first? (an addition)
        return Q(L(`Trong rổ có một số quả cam. Mẹ lấy ra ${b} quả cam thì trong rổ còn lại ${r} quả cam. Hỏi lúc đầu trong rổ có mấy quả cam?`, `A basket has some oranges. Mum takes out ${b} and ${r} ${r === 1 ? 'is' : 'are'} left. How many oranges were in the basket at first?`), num(a, un(ORANGE, a)), L(`Lúc đầu có nhiều hơn: ${r} + ${b} = ${a}. Thử lại: ${a} ${M} ${b} = ${r}.`, `There were more at first: ${r} + ${b} = ${a}. Check: ${a} ${M} ${b} = ${r}.`), { hint: L('Lúc đầu = số còn lại + số đã lấy ra.', 'At first = what is left + what was taken out.'), visual: line10({ marks: [r] }) });
      },
    },

    {
      id: 'g1-dt-so-thieu', sem: 1, icon: '❓', lesson: 'g1-c3-b12',
      title: L('Tìm số còn thiếu trong phép tính', 'Finding the missing number in a calculation'),
      spot: L('Phép tính có một ô trống (dấu ?), ví dụ: 3 + ? = 7 hoặc 9 − ? = 4.', 'The calculation has an empty box (a ?), for example: 3 + ? = 7 or 9 − ? = 4.'),
      steps: [
        L('Bước 1: Xem ô trống ở đâu, phép tính là cộng hay trừ.', 'Step 1: See where the empty box is and whether it is an addition or a subtraction.'),
        L('Bước 2: Phép cộng: từ số đã biết, đếm thêm cho đến kết quả.', 'Step 2: For an addition, count on from the number you know up to the answer.'),
        L('Bước 3: Thử lại: thay số vừa tìm vào ô trống rồi tính.', 'Step 3: Check: put your number in the box and work it out.'),
      ],
      tip: L('Thấy dấu + đừng vội cộng hai số. Với 3 + ? = 7, số cần tìm là 4, không phải 10.', 'Do not add the two numbers just because you see +. In 3 + ? = 7 the missing number is 4, not 10.'),
      guide: rng => {
        const s = R(rng, 4, 10), a = R(rng, 1, s - 2), b = s - a, first = R(rng, 0, 1) === 1;
        const expr = first ? `? + ${a} = ${s}` : `${a} + ? = ${s}`, seq = Array.from({ length: b }, (_, k) => a + k + 1).join(', ');
        return G(L(`Tìm số còn thiếu:\n${expr}`, `Find the missing number:\n${expr}`), [
          step(L('Muốn tìm số còn thiếu, em làm thế nào?', 'How do you find the missing number?'), ch(rng, L(`Từ ${a} đếm thêm đến ${s}`, `Count on from ${a} up to ${s}`), [L(`Lấy ${a} + ${s}`, `Work out ${a} + ${s}`)]), L(`Số ${a} và số còn thiếu gộp lại được ${s}. Ta đếm thêm từ ${a} cho đến ${s}.`, `${a} and the missing number make ${s}. We count on from ${a} up to ${s}.`), L(`Kết quả ${s} là số lớn nhất. Số còn thiếu phải bé hơn ${s}.`, `The answer ${s} is the greatest number. The missing number must be less than ${s}.`)),
          step(L(`Đếm thêm: ${seq}. Em đã đếm thêm mấy số?`, `Count on: ${seq}. How many numbers did you count on?`), num(b), L(`Đếm thêm ${b} số. Số còn thiếu là ${b}.`, `We counted on ${b}. The missing number is ${b}.`), L('Mỗi số đọc lên, em giơ một ngón tay.', 'Put up one finger for each number you say.')),
          step(L(`Thử lại: ${a} + ${b} = ?`, `Check: ${a} + ${b} = ?`), num(s), L(`${a} + ${b} = ${s}. Đúng rồi!`, `${a} + ${b} = ${s}. That's right.`)),
        ], L(`Đáp số: ${b}.`, `Answer: ${b}.`), line10({ hops: hops(a, b, 1) }));
      },
      practice: (rng, i) => {
        const s = i < 2 ? R(rng, 3, 6) : R(rng, 5, 10), a = R(rng, 1, s - 1), b = s - a;
        const find = L('Tìm số còn thiếu:\n', 'Find the missing number:\n');
        if (i < 4) {
          const first = i % 2 === 1, expr = first ? `? + ${a} = ${s}` : `${a} + ? = ${s}`;
          return Q(find + expr, num(b), L(`Từ ${a} đếm thêm ${b} thì được ${s}: ${a} + ${b} = ${s}.`, `Count on ${b} from ${a} to reach ${s}: ${a} + ${b} = ${s}.`), { hint: L(`Từ ${a} đếm thêm cho đến ${s}.`, `Count on from ${a} up to ${s}.`), visual: line10({ marks: [a, s] }) });
        }
        if (i === 4 || i === 6) return Q(find + `${s} ${M} ? = ${a}`, num(b), L(`${s} ${M} ${b} = ${a}. Số còn thiếu là ${b}.`, `${s} ${M} ${b} = ${a}. The missing number is ${b}.`), { hint: L(`Từ ${s} đếm lùi cho đến ${a}. Em lùi mấy bước?`, `Count back from ${s} to ${a}. How many steps back?`), visual: line10({ marks: [s, a] }) });
        if (i === 5) {
          const it = P(rng, ITEMS);
          return Q(L(`Có ${a} ${it.n}. Thêm ? ${it.n} thì được ${s} ${it.n}.\nSố ở ô ? là số nào?`, `There ${isAre(a)} ${pl(a, it.s, it.p)}. Add ? more to make ${s}.\nWhat is the number in the box?`), num(b), L(`${a} + ${b} = ${s}. Số còn thiếu là ${b}.`, `${a} + ${b} = ${s}. The missing number is ${b}.`), { hint: L(`Từ ${a} đếm thêm cho đến ${s}.`, `Count on from ${a} up to ${s}.`), visual: vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: '❔', count: 1 }], op: '+' }) });
        }
        if (i === 9) { const q = DT.bank(rng, ['g1-nc-so-thieu']); if (q) return q; }
        if (i === 7) return Q(find + `? ${M} ${b} = ${a}`, num(s), L(`Số cần tìm bớt ${b} thì còn ${a}. Vậy số đó là ${a} + ${b} = ${s}.`, `The number take away ${b} leaves ${a}. So the number is ${a} + ${b} = ${s}.`), { hint: L(`Số cần tìm lớn hơn ${a}. Em lấy ${a} + ${b}.`, `The number is greater than ${a}. Work out ${a} + ${b}.`), visual: line10({ marks: [a] }) });
        const c = R(rng, 0, 1) === 1;
        return Q(find + (c ? `? + ${a} = ${a}` : `${s} ${M} ? = ${s}`), num(0), c ? L(`0 + ${a} = ${a}. Cộng với 0 thì số không đổi.`, `0 + ${a} = ${a}. Adding 0 does not change the number.`) : L(`${s} ${M} 0 = ${s}. Trừ đi 0 thì số không đổi.`, `${s} ${M} 0 = ${s}. Taking away 0 does not change the number.`), { hint: L('Số nào cộng vào hoặc trừ đi mà số kia không đổi?', 'Which number can you add or take away without changing the other number?') });
      },
    },

    // ================= HỌC KÌ II =================
    {
      id: 'g1-dt-chuc-don-vi', sem: 2, icon: '🔟', lesson: 'g1-c6-b21',
      title: L('Số có hai chữ số: chục và đơn vị', 'Two-digit numbers: tens and ones'),
      spot: L('Bài hỏi một số gồm mấy chục và mấy đơn vị, hoặc cho số chục, số đơn vị rồi bảo em viết số.', 'The problem asks how many tens and ones a number has, or gives the tens and ones and asks you to write the number.'),
      steps: [
        L('Bước 1: Chữ số bên trái chỉ số chục.', 'Step 1: The digit on the left shows the tens.'),
        L('Bước 2: Chữ số bên phải chỉ số đơn vị.', 'Step 2: The digit on the right shows the ones.'),
        L('Bước 3: Viết số: số chục trước, số đơn vị sau.', 'Step 3: Write the number: tens first, then ones.'),
      ],
      tip: L('Đừng viết ngược. 4 chục và 7 đơn vị là 47, không phải 74.', 'Do not write it the wrong way round. 4 tens and 7 ones is 47, not 74.'),
      guide: rng => {
        const t = R(rng, 1, 9), o0 = R(rng, 1, 9), o = o0 === t ? (t % 9) + 1 : o0, n = t * 10 + o;
        return G(L(`Số ${n} gồm mấy chục và mấy đơn vị?`, `How many tens and how many ones are there in ${n}?`), [
          step(L('Em đếm các thanh chục. Có mấy chục?', 'Count the ten-sticks. How many tens are there?'), num(t), L(`Có ${t} chục. Chữ số bên trái của ${n} là ${t}.`, `There ${isAre(t)} ${pl(t, 'ten', 'tens')}. The left digit of ${n} is ${t}.`), L('Mỗi thanh dài là 1 chục.', 'Each long stick is 1 ten.')),
          step(L('Em đếm các khối lẻ. Có mấy đơn vị?', 'Count the single cubes. How many ones are there?'), num(o), L(`Có ${o} đơn vị. Chữ số bên phải của ${n} là ${o}.`, `There ${isAre(o)} ${pl(o, 'one', 'ones')}. The right digit of ${n} is ${o}.`), L('Mỗi khối nhỏ là 1 đơn vị.', 'Each small cube is 1 one.')),
          step(L(`${t} chục và ${o} đơn vị viết là số nào?`, `${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}: which number is that?`), ch(rng, n, [o * 10 + t, t + o]), L(`${n} gồm ${t} chục và ${o} đơn vị.`, `${n} is ${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}.`), L('Viết số chục trước, số đơn vị sau.', 'Write the tens first, then the ones.')),
        ], L(`Đáp số: ${t} chục và ${o} đơn vị.`, `Answer: ${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}.`), blk(n));
      },
      practice: (rng, i) => {
        const t = R(rng, 1, 9), o0 = R(rng, 1, 9), o = o0 === t ? (t % 9) + 1 : o0, n = t * 10 + o;
        const tens = L(`${t} chục`, pl(t, 'ten', 'tens')), ones = L(`${o} đơn vị`, pl(o, 'one', 'ones'));
        const ex = L(`${n} gồm ${t} chục và ${o} đơn vị.`, `${n} is ${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}.`);
        const hintT = L('Chữ số bên trái chỉ chục, chữ số bên phải chỉ đơn vị.', 'The left digit shows the tens and the right digit shows the ones.');
        if (i < 2) return Q(L(`Số gồm ${t} chục và ${o} đơn vị là số nào?`, `Which number is ${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}?`), num(n), ex, { hint: L('Viết số chục trước, số đơn vị sau.', 'Write the tens first, then the ones.'), visual: blk(n) });
        if (i === 2) return Q(L(`Số ${n} gồm mấy chục?`, `How many tens are there in ${n}?`), num(t), ex, { hint: hintT, visual: blk(n) });
        if (i === 3) return Q(L(`Số ${n} gồm ${t} chục và mấy đơn vị?`, `${n} is ${pl(t, 'ten', 'tens')} and how many ones?`), num(o), ex, { hint: hintT, visual: blk(n) });
        if (i === 4) {
          const left = R(rng, 0, 1) === 1, d = left ? t : o;
          return Q(L(`Trong số ${n}, chữ số ${d} chỉ gì?`, `In ${n}, what does the digit ${d} show?`), ch(rng, left ? tens : ones, [left ? L(`${t} đơn vị`, pl(t, 'one', 'ones')) : L(`${o} chục`, pl(o, 'ten', 'tens'))]), ex, { hint: hintT, visual: blk(n) });
        }
        if (i === 5) return Q(L(`${t} chục là số nào?`, `Which number is ${pl(t, 'ten', 'tens')}?`), num(t * 10), L(`${t} chục là ${t * 10}. Số tròn chục có chữ số bên phải là 0.`, `${cap(pl(t, 'ten', 'tens'))} is ${t * 10}. The ones digit is 0.`), { hint: L('Không có đơn vị lẻ nào thì chữ số bên phải là 0.', 'With no extra ones, the right digit is 0.'), visual: blk(t * 10) });
        if (i === 6) return Q(L(`Tìm số còn thiếu:\n${n} = ${t * 10} + ?`, `Find the missing number:\n${n} = ${t * 10} + ?`), num(o), L(`${n} gồm ${t} chục và ${o} đơn vị nên ${n} = ${t * 10} + ${o}.`, `${n} is ${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}, so ${n} = ${t * 10} + ${o}.`), { hint: L(`${t * 10} là ${t} chục. Còn mấy đơn vị?`, `${t * 10} is ${pl(t, 'ten', 'tens')}. How many ones are left?`), visual: blk(n) });
        if (i === 7) return Q(L(`Đổi chỗ hai chữ số của số ${n} thì được số nào?`, `Swap the two digits of ${n}. Which number do you get?`), num(o * 10 + t), L(`${n} có chữ số ${t} và ${o}. Đổi chỗ được ${o * 10 + t} (${o} chục và ${t} đơn vị).`, `${n} has the digits ${t} and ${o}. Swapped, they make ${o * 10 + t} (${pl(o, 'ten', 'tens')} and ${pl(t, 'one', 'ones')}).`), { hint: L('Chữ số bên phải sang bên trái, chữ số bên trái sang bên phải.', 'The right digit goes to the left and the left digit goes to the right.') });
        if (i === 9) { const q = DT.bank(rng, ['g1-nc-the-so']); if (q) return q; }
        const t2 = R(rng, 1, 8), n2 = t2 * 10 + o, up = R(rng, 0, 1) === 1 || t2 === 1, r = up ? n2 + 10 : n2 - 10;
        return Q(up ? L(`Số ${n2} thêm 1 chục thì được số nào?`, `Add 1 ten to ${n2}. Which number do you get?`) : L(`Số ${n2} bớt 1 chục thì còn số nào?`, `Take 1 ten away from ${n2}. Which number is left?`), num(r), L(`${n2} có ${t2} chục. ${up ? 'Thêm' : 'Bớt'} 1 chục thì có ${up ? t2 + 1 : t2 - 1} chục, số đơn vị vẫn là ${o}: ${r}.`, `${n2} has ${pl(t2, 'ten', 'tens')}. ${up ? 'Add' : 'Take away'} 1 ten: ${pl(up ? t2 + 1 : t2 - 1, 'ten', 'tens')}, and still ${pl(o, 'one', 'ones')}: ${r}.`), { hint: L('Chỉ số chục thay đổi, số đơn vị giữ nguyên.', 'Only the tens change. The ones stay the same.'), visual: blk(n2) });
      },
    },

    {
      id: 'g1-dt-so-sanh-2cs', sem: 2, icon: '⚖️', lesson: 'g1-c6-b22',
      title: L('So sánh số có hai chữ số', 'Comparing two-digit numbers'),
      spot: L('Bài cho hai số có hai chữ số và bảo em điền dấu >, <, = hoặc tìm số lớn hơn, số bé hơn.', 'The problem gives two two-digit numbers. You put in the sign >, < or =, or find the greater or the smaller number.'),
      steps: [
        L('Bước 1: So sánh số chục trước. Số nào có nhiều chục hơn thì lớn hơn.', 'Step 1: Compare the tens first. The number with more tens is greater.'),
        L('Bước 2: Nếu số chục bằng nhau thì so sánh số đơn vị.', 'Step 2: If the tens are the same, compare the ones.'),
        L('Bước 3: Viết dấu. Đầu nhọn chỉ vào số bé.', 'Step 3: Write the sign. The point faces the smaller number.'),
      ],
      tip: L('Đừng so số đơn vị trước. 39 có 9 đơn vị nhưng vẫn bé hơn 41, vì 3 chục ít hơn 4 chục.', 'Do not compare the ones first. 39 has 9 ones but it is still less than 41, because 3 tens is fewer than 4 tens.'),
      guide: rng => {
        const same = R(rng, 0, 1) === 1, ta = R(rng, 1, 9), tb0 = R(rng, 1, 9), tb = same ? ta : (tb0 === ta ? (ta % 9) + 1 : tb0);
        const oa = R(rng, 0, 9), ob0 = R(rng, 0, 9), ob = ob0 === oa ? (oa + 3) % 10 : ob0;
        const a = ta * 10 + oa, b = tb * 10 + ob, s = sign(a, b), big = Math.max(a, b), small = Math.min(a, b), eq = L('Bằng nhau', 'They are the same');
        const steps = [
          step(L(`So sánh số chục trước. Số nào có nhiều chục hơn: ${a} hay ${b}?`, `Compare the tens first. Which number has more tens: ${a} or ${b}?`), same ? ch(rng, eq, [a, b]) : ch(rng, big, [small, eq]),
            same ? L(`${a} và ${b} đều có ${ta} chục. Số chục bằng nhau.`, `${a} and ${b} both have ${pl(ta, 'ten', 'tens')}. The tens are the same.`) : L(`${a} có ${ta} chục, ${b} có ${tb} chục. ${big} có nhiều chục hơn nên ${big} lớn hơn.`, `${a} has ${pl(ta, 'ten', 'tens')} and ${b} has ${pl(tb, 'ten', 'tens')}. ${big} has more tens, so ${big} is greater.`), L('Số chục là chữ số bên trái.', 'The tens digit is the one on the left.')),
        ];
        if (same) steps.push(step(L(`Số chục bằng nhau. So sánh số đơn vị: số nào có nhiều đơn vị hơn?`, `The tens are the same. Compare the ones: which number has more ones?`), ch(rng, big, [small]), L(`${a} có ${oa} đơn vị, ${b} có ${ob} đơn vị. ${big} có nhiều đơn vị hơn nên ${big} lớn hơn.`, `${a} has ${pl(oa, 'one', 'ones')} and ${b} has ${pl(ob, 'one', 'ones')}. ${big} has more ones, so ${big} is greater.`), L('Số đơn vị là chữ số bên phải.', 'The ones digit is the one on the right.')));
        steps.push(step(L(`Chọn dấu đúng: ${a} … ${b}`, `Choose the right sign: ${a} … ${b}`), signCh(rng, a, b), `${a} ${s} ${b}.`, L('Đầu nhọn của dấu chỉ vào số bé.', 'The pointed end points to the smaller number.')));
        return G(L(`Điền dấu >, <, = cho đúng:\n${a} … ${b}`, `Put in the right sign (>, < or =):\n${a} … ${b}`), steps, L(`Đáp số: ${a} ${s} ${b}.`, `Answer: ${a} ${s} ${b}.`), vz('compare', { left: a, right: b }));
      },
      practice: (rng, i) => {
        const hintC = L('So số chục trước. Nếu số chục bằng nhau thì so số đơn vị.', 'Compare the tens first. If the tens are the same, compare the ones.');
        const why = (a, b) => (a === b ? L(`Hai số giống nhau: ${a} = ${b}.`, `The two numbers are the same: ${a} = ${b}.`)
          : Math.floor(a / 10) !== Math.floor(b / 10) ? L(`${Math.floor(a / 10)} chục ${sign(Math.floor(a / 10), Math.floor(b / 10))} ${Math.floor(b / 10)} chục nên ${a} ${sign(a, b)} ${b}.`, `${pl(Math.floor(a / 10), 'ten', 'tens')} ${sign(Math.floor(a / 10), Math.floor(b / 10))} ${pl(Math.floor(b / 10), 'ten', 'tens')}, so ${a} ${sign(a, b)} ${b}.`)
            : L(`Số chục bằng nhau. ${a % 10} đơn vị ${sign(a, b)} ${b % 10} đơn vị nên ${a} ${sign(a, b)} ${b}.`, `The tens are the same. ${pl(a % 10, 'one', 'ones')} ${sign(a, b)} ${pl(b % 10, 'one', 'ones')}, so ${a} ${sign(a, b)} ${b}.`));
        const three = () => { const s = new Set(); const t = R(rng, 1, 8); while (s.size < 3) s.add(P(rng, [t, t, t + 1]) * 10 + R(rng, 0, 9)); return [...s]; };
        if (i < 4) {
          const a = R(rng, 10, 99), sw = (a % 10) * 10 + Math.floor(a / 10);   // sw: the two digits swapped (34 and 43)
          const b = i < 2 ? R(rng, 10, 99) : i === 2 ? Math.floor(a / 10) * 10 + R(rng, 0, 9) : (R(rng, 0, 2) === 0 || sw < 10 ? a : sw);
          return Q(L(`Chọn dấu đúng:\n${a} … ${b}`, `Choose the right sign:\n${a} … ${b}`), cmp(a, b), why(a, b), { hint: hintC, visual: vz('compare', { left: a, right: b }) });
        }
        if (i === 4) {
          const [w1, w2] = DT.names(rng, 2), a = R(rng, 11, 98), b0 = R(rng, 11, 98), b = b0 === a ? a + 1 : b0, more = R(rng, 0, 1) === 1, ans = (a > b) === more ? w1 : w2;
          const [vn, en] = P(rng, [['nhãn vở', 'book labels'], ['viên bi', 'marbles'], ['bông hoa', 'flowers'], ['quyển truyện', 'storybooks']]);
          return Q(L(`${w1} có ${a} ${vn}. ${w2} có ${b} ${vn}. Bạn nào có ${more ? 'nhiều' : 'ít'} ${vn} hơn?`, `${w1} has ${a} ${en}. ${w2} has ${b} ${en}. Who has ${more ? 'more' : 'fewer'} ${en}?`), ch(rng, ans, [ans === w1 ? w2 : w1]), why(a, b) + L(` ${ans} có ${more ? 'nhiều' : 'ít'} hơn.`, ` ${ans} has ${more ? 'more' : 'fewer'}.`), { hint: hintC, visual: vz('compare', { left: a, right: b }) });
        }
        if (i === 5 || i === 6) {
          const t = three(), big = i === 5, ans = big ? Math.max(...t) : Math.min(...t);
          return Q(L(`Số nào ${big ? 'lớn' : 'bé'} nhất?\n${t.join(', ')}`, `Which number is the ${big ? 'greatest' : 'smallest'}?\n${t.join(', ')}`), ch(rng, ans, t.filter(x => x !== ans)), L(`Xếp từ bé đến lớn: ${asc(t).join(', ')}. Số ${big ? 'lớn' : 'bé'} nhất là ${ans}.`, `From smallest to greatest: ${asc(t).join(', ')}. The ${big ? 'greatest' : 'smallest'} number is ${ans}.`), { hint: hintC });
        }
        if (i === 7) {
          const t = three(), up = R(rng, 0, 1) === 1, s = asc(t), ok = up ? s : s.slice().reverse(), f = o => o.join(', ');
          return Q(L(`Xếp các số ${f(t)} theo thứ tự từ ${up ? 'bé đến lớn' : 'lớn đến bé'}.`, `Put the numbers ${f(t)} in order from ${up ? 'smallest to greatest' : 'greatest to smallest'}.`), ch(rng, f(ok), [f(ok.slice().reverse()), f([ok[1], ok[0], ok[2]]), f([ok[0], ok[2], ok[1]])]), L(`Thứ tự đúng: ${f(ok)}.`, `The right order: ${f(ok)}.`), { hint: hintC });
        }
        if (i === 8) {
          const x = R(rng, 11, 97);
          return Q(L(`Số nào lớn hơn ${x} và bé hơn ${x + 2}?`, `Which number is greater than ${x} and less than ${x + 2}?`), num(x + 1), L(`Đếm: ${x}, ${x + 1}, ${x + 2}. Số ở giữa là ${x + 1}.`, `Count: ${x}, ${x + 1}, ${x + 2}. The number in between is ${x + 1}.`), { hint: L(`Số đó đứng ngay sau ${x} khi đếm.`, `It comes just after ${x} when you count.`) });
        }
        const t = R(rng, 2, 9) * 10, big = R(rng, 0, 1) === 1 || t === 90;
        return big ? Q(L(`Số lớn nhất bé hơn ${t} là số nào?`, `Which is the greatest number that is less than ${t}?`), num(t - 1), L(`Đếm lùi từ ${t}: số đứng ngay trước ${t} là ${t - 1}.`, `Count back from ${t}: the number just before ${t} is ${t - 1}.`), { hint: L(`Tìm số đứng ngay trước ${t}.`, `Find the number just before ${t}.`) })
          : Q(L(`Số bé nhất lớn hơn ${t + 9} là số nào?`, `Which is the smallest number that is greater than ${t + 9}?`), num(t + 10), L(`Đếm tiếp từ ${t + 9}: số đứng ngay sau ${t + 9} là ${t + 10}.`, `Count on from ${t + 9}: the number just after ${t + 9} is ${t + 10}.`), { hint: L(`Tìm số đứng ngay sau ${t + 9}.`, `Find the number just after ${t + 9}.`) });
      },
    },

    {
      id: 'g1-dt-do-dai', sem: 2, icon: '📏', lesson: 'g1-c7-b26',
      title: L('Đo độ dài bằng thước có vạch xăng-ti-mét', 'Measuring length with a centimetre ruler'),
      spot: L('Bài có hình một đồ vật nằm trên thước kẻ và hỏi: đồ vật dài mấy xăng-ti-mét?', 'The problem shows a thing lying on a ruler and asks: how many centimetres long is it?'),
      steps: [
        L('Bước 1: Xem một đầu của đồ vật có ở vạch 0 không.', 'Step 1: Check that one end of the thing is at the 0 mark.'),
        L('Bước 2: Xem đầu kia ở vạch số mấy.', 'Step 2: See which mark the other end reaches.'),
        L('Bước 3: Viết số đó và thêm chữ cm.', 'Step 3: Write that number and add cm.'),
      ],
      tip: L('Đo phải bắt đầu từ vạch 0, không phải từ vạch 1 hay từ mép thước. Đừng quên viết cm.', 'Start measuring from the 0 mark, not from 1 or from the edge of the ruler. Do not forget to write cm.'),
      guide: rng => {
        const o = P(rng, RUL), n = R(rng, o.lo, o.hi), w = DT.name(rng);
        return G(L(`${w} đặt ${o.n} lên thước kẻ như hình. Hỏi ${o.n} dài mấy xăng-ti-mét?`, `${w} puts a ${o.en} on a ruler, as in the picture. How many centimetres long is the ${o.en}?`), [
          step(L(`Đầu bên trái của ${o.n} ở vạch số mấy?`, `Which mark is the left end of the ${o.en} at?`), num(0), L('Đầu bên trái ở vạch 0. Đặt thước như vậy là đúng.', 'The left end is at 0. That is the right way to use a ruler.'), L('Nhìn vạch đầu tiên trên thước.', 'Look at the first mark on the ruler.')),
          step(L(`Đầu bên phải của ${o.n} ở vạch số mấy?`, `Which mark does the right end of the ${o.en} reach?`), num(n), L(`Đầu bên phải ở vạch ${n}.`, `The right end is at ${n}.`), L('Đọc số ghi dưới vạch ở đầu bên phải.', 'Read the number under the mark at the right end.')),
          step(L(`Vậy ${o.n} dài bao nhiêu?`, `So how long is the ${o.en}?`), ch(rng, `${n} cm`, [`${n + 1} cm`, `${n - 1} cm`]), L(`${cap(o.n)} dài ${n} cm.`, `The ${o.en} is ${n} cm long.`), L('Đầu bên phải ở vạch nào thì đồ vật dài bấy nhiêu xăng-ti-mét.', 'The mark at the right end tells you how many centimetres long it is.')),
        ], L(`Đáp số: ${n} cm.`, `Answer: ${n} cm.`), vz('ruler', { length: n, unit: 'cm', object: o.k }));
      },
      practice: (rng, i) => {
        const w = DT.name(rng);
        if (i < 4) {
          const o = P(rng, RUL), n = R(rng, o.lo, i < 2 ? Math.min(o.hi, 10) : o.hi);
          return Q(L(`${w} đo ${o.n} bằng thước kẻ. Hỏi ${o.n} dài mấy xăng-ti-mét?`, `${w} measures a ${o.en} with a ruler. How many centimetres long is the ${o.en}?`), num(n, 'cm'), L(`Đầu bên trái ở vạch 0, đầu bên phải ở vạch ${n}. ${cap(o.n)} dài ${n} cm.`, `The left end is at 0 and the right end is at ${n}. The ${o.en} is ${n} cm long.`), { hint: L('Xem đầu bên phải của đồ vật ở vạch số mấy.', 'Look at which mark the right end reaches.'), visual: vz('ruler', { length: n, unit: 'cm', object: o.k }) });
        }
        const [x, y] = U.sample(rng, [['bút chì', 'pencil'], ['bút sáp', 'crayon'], ['băng giấy đỏ', 'red paper strip'], ['băng giấy xanh', 'blue paper strip'], ['que tính', 'counting stick'], ['sợi dây', 'piece of string']], 2);
        if (i === 4 || i === 6) {
          const a = R(rng, 3, 19), b0 = R(rng, 3, 19), b = b0 === a ? a + 1 : b0, longer = i === 4, ans = (a > b) === longer ? x : y, oth = ans === x ? y : x;
          return Q(L(`${cap(x[0])} dài ${a} cm. ${cap(y[0])} dài ${b} cm. Cái nào ${longer ? 'dài' : 'ngắn'} hơn?`, `The ${x[1]} is ${a} cm long. The ${y[1]} is ${b} cm long. Which one is ${longer ? 'longer' : 'shorter'}?`), ch(rng, L(cap(ans[0]), `The ${ans[1]}`), [L(cap(oth[0]), `The ${oth[1]}`)]), L(`${a} ${sign(a, b)} ${b} nên ${ans[0]} ${longer ? 'dài' : 'ngắn'} hơn.`, `${a} ${sign(a, b)} ${b}, so the ${ans[1]} is ${longer ? 'longer' : 'shorter'}.`), { hint: L(`So sánh ${a} và ${b}.`, `Compare ${a} and ${b}.`) });
        }
        if (i === 5) {
          const a = R(rng, 5, 10), b = R(rng, 1, a - 2), d = a - b;   // a length with a unit, one subtraction within 10
          return Q(L(`Băng giấy dài ${a} cm. ${w} cắt đi ${b} cm. Hỏi băng giấy còn lại dài mấy xăng-ti-mét?`, `A paper strip is ${a} cm long. ${w} cuts off ${b} cm. How many centimetres long is the strip that is left?`), num(d, 'cm'), L(`Cắt đi thì làm phép trừ: ${a} ${M} ${b} = ${d} (cm).`, `Cutting off means subtract: ${a} ${M} ${b} = ${d} (cm).`), { hint: L('Cắt đi thì băng giấy ngắn lại. Em làm phép trừ.', 'Cutting some off makes the strip shorter. Subtract.'), visual: vz('ruler', { length: a, unit: 'cm', object: 'ribbon' }) });
        }
        if (i === 7 || (i === 9 && R(rng, 0, 1) === 1)) {
          const [a, b] = pairWhere(rng, [11, 60], [10, 35], noCarry, [32, 15]);
          return Q(L(`${w} nối băng giấy dài ${a} cm với băng giấy dài ${b} cm (không chồng lên nhau). Hỏi cả hai băng giấy dài bao nhiêu xăng-ti-mét?`, `${w} joins a paper strip ${a} cm long to a paper strip ${b} cm long, end to end. How many centimetres long are the two strips together?`), num(a + b, 'cm'), L(`Nối lại thì làm phép cộng: ${a} + ${b} = ${a + b} (cm).`, `Joining means add: ${a} + ${b} = ${a + b} (cm).`), { hint: L('Nối hai băng giấy lại thì dài ra. Em làm phép cộng.', 'Joining two strips makes a longer strip. Add.'), visual: col(a, b, '+') });
        }
        const [a, b] = pairWhere(rng, [35, 99], [11, 60], (p, q) => p > q && noBorrow(p, q), [58, 23]);
        return Q(L(`Sợi dây dài ${a} cm. ${w} cắt đi ${b} cm. Hỏi sợi dây còn lại dài bao nhiêu xăng-ti-mét?`, `A piece of string is ${a} cm long. ${w} cuts off ${b} cm. How many centimetres of string are left?`), num(a - b, 'cm'), L(`Cắt đi thì làm phép trừ: ${a} ${M} ${b} = ${a - b} (cm).`, `Cutting off means subtract: ${a} ${M} ${b} = ${a - b} (cm).`), { hint: L('Cắt đi thì sợi dây ngắn lại. Em làm phép trừ.', 'Cutting some off makes the string shorter. Subtract.'), visual: col(a, b, M) });
      },
    },

    {
      id: 'g1-dt-dat-tinh', sem: 2, icon: '🧮', lesson: 'g1-c8-b30',
      title: L('Đặt tính rồi tính (cộng, trừ không nhớ trong phạm vi 100)', 'Set out and calculate (adding and subtracting within 100, no regrouping)'),
      spot: L('Bài ghi “Đặt tính rồi tính” và cho một phép cộng hoặc phép trừ các số có hai chữ số.', 'The problem says "Set out and calculate" and gives an addition or a subtraction with two-digit numbers.'),
      steps: [
        L('Bước 1: Viết số này dưới số kia: đơn vị thẳng đơn vị, chục thẳng chục.', 'Step 1: Write one number under the other: ones under ones, tens under tens.'),
        L('Bước 2: Tính hàng đơn vị trước.', 'Step 2: Work out the ones first.'),
        L('Bước 3: Tính hàng chục sau. Viết kết quả thẳng cột.', 'Step 3: Then work out the tens. Write each answer in its column.'),
      ],
      tip: L('Với 45 + 3, số 3 phải viết thẳng hàng đơn vị (dưới số 5), không viết dưới số 4.', 'In 45 + 3, write the 3 in the ones column (under the 5), not under the 4.'),
      guide: rng => {
        const add = R(rng, 0, 1) === 1;
        const [a, b] = add ? pairWhere(rng, [11, 75], [11, 60], noCarry, [34, 25]) : pairWhere(rng, [35, 99], [11, 80], (p, q) => p - q >= 10 && noBorrow(p, q), [68, 25]);
        const op = add ? '+' : M, f = (p, q) => (add ? p + q : p - q), r = f(a, b), o = f(a % 10, b % 10), t = f(Math.floor(a / 10), Math.floor(b / 10));
        const ON = L('Hàng đơn vị', 'The ones'), TN = L('Hàng chục', 'The tens');
        return G(L(`Đặt tính rồi tính:\n${a} ${op} ${b}`, `Set out and calculate:\n${a} ${op} ${b}`), [
          step(L('Em tính hàng nào trước?', 'Which column do you work out first?'), ch(rng, ON, [TN]), L('Ta tính từ phải sang trái: hàng đơn vị trước, hàng chục sau.', 'We work from right to left: the ones first, then the tens.')),
          step(L(`Hàng đơn vị: ${a % 10} ${op} ${b % 10} = ?`, `The ones: ${a % 10} ${op} ${b % 10} = ?`), num(o), L(`${a % 10} ${op} ${b % 10} = ${o}, viết ${o} ở hàng đơn vị.`, `${a % 10} ${op} ${b % 10} = ${o}. Write ${o} in the ones column.`)),
          step(L(`Hàng chục: ${Math.floor(a / 10)} ${op} ${Math.floor(b / 10)} = ?`, `The tens: ${Math.floor(a / 10)} ${op} ${Math.floor(b / 10)} = ?`), num(t), L(`${Math.floor(a / 10)} ${op} ${Math.floor(b / 10)} = ${t}, viết ${t} ở hàng chục.`, `${Math.floor(a / 10)} ${op} ${Math.floor(b / 10)} = ${t}. Write ${t} in the tens column.`)),
          step(L(`Vậy ${a} ${op} ${b} = ?`, `So ${a} ${op} ${b} = ?`), num(r), `${a} ${op} ${b} = ${r}.`, L(`Ghép lại: ${t} chục và ${o} đơn vị.`, `Put them together: ${pl(t, 'ten', 'tens')} and ${pl(o, 'one', 'ones')}.`)),
        ], L(`Đáp số: ${r}.`, `Answer: ${r}.`), col(a, b, op));
      },
      practice: (rng, i) => {
        const set = L('Đặt tính rồi tính:\n', 'Set out and calculate:\n');
        const hintA = L('Viết các số thẳng cột. Tính hàng đơn vị trước, hàng chục sau.', 'Line up the columns. Work out the ones first, then the tens.');
        if (i < 2) { const [a, b] = pairWhere(rng, [11, 75], [11, 60], noCarry, [34, 25]); return Q(set + `${a} + ${b}`, num(a + b), L(`${a % 10} + ${b % 10} = ${(a + b) % 10}; ${Math.floor(a / 10)} + ${Math.floor(b / 10)} = ${Math.floor((a + b) / 10)}. Vậy ${a} + ${b} = ${a + b}.`, `${a % 10} + ${b % 10} = ${(a + b) % 10}; ${Math.floor(a / 10)} + ${Math.floor(b / 10)} = ${Math.floor((a + b) / 10)}. So ${a} + ${b} = ${a + b}.`), { hint: hintA, visual: col(a, b, '+') }); }
        if (i < 4) { const [a, b] = pairWhere(rng, [35, 99], [11, 80], (p, q) => p > q && noBorrow(p, q), [68, 25]); return Q(set + `${a} ${M} ${b}`, num(a - b), L(`${a % 10} ${M} ${b % 10} = ${(a - b) % 10}; ${Math.floor(a / 10)} ${M} ${Math.floor(b / 10)} = ${Math.floor((a - b) / 10)}. Vậy ${a} ${M} ${b} = ${a - b}.`, `${a % 10} ${M} ${b % 10} = ${(a - b) % 10}; ${Math.floor(a / 10)} ${M} ${Math.floor(b / 10)} = ${Math.floor((a - b) / 10)}. So ${a} ${M} ${b} = ${a - b}.`), { hint: hintA, visual: col(a, b, M) }); }
        if (i === 4) { const [a, b] = pairWhere(rng, [21, 88], [1, 8], noCarry, [45, 3]); return Q(`${a} + ${b} = ?`, ch(rng, a + b, [a + b * 10, a + b + 10, a + b - 1].filter(x => x <= 99)), L(`${b} viết thẳng hàng đơn vị: ${a % 10} + ${b} = ${a % 10 + b}, hạ ${Math.floor(a / 10)} chục. Vậy ${a} + ${b} = ${a + b}.`, `Write ${b} in the ones column: ${a % 10} + ${b} = ${a % 10 + b}, and bring down the ${pl(Math.floor(a / 10), 'ten', 'tens')}. So ${a} + ${b} = ${a + b}.`), { hint: L(`Số ${b} chỉ có đơn vị. Viết ${b} thẳng hàng đơn vị.`, `${b} has only ones. Write ${b} in the ones column.`), visual: col(a, b, '+') }); }
        if (i === 5) { const [a, b] = pairWhere(rng, [23, 99], [1, 8], (p, q) => noBorrow(p, q) && p % 10 > q, [47, 5]); return Q(`${a} ${M} ${b} = ?`, ch(rng, a - b, [a - b * 10, a - b - 10, a - b + 1].filter(x => x >= 0)), L(`${b} viết thẳng hàng đơn vị: ${a % 10} ${M} ${b} = ${a % 10 - b}, hạ ${Math.floor(a / 10)} chục. Vậy ${a} ${M} ${b} = ${a - b}.`, `Write ${b} in the ones column: ${a % 10} ${M} ${b} = ${a % 10 - b}, and bring down the ${pl(Math.floor(a / 10), 'ten', 'tens')}. So ${a} ${M} ${b} = ${a - b}.`), { hint: L(`Số ${b} chỉ có đơn vị. Viết ${b} thẳng hàng đơn vị.`, `${b} has only ones. Write ${b} in the ones column.`), visual: col(a, b, M) }); }
        if (i === 6) {
          const add = R(rng, 0, 1) === 1, x = R(rng, 2, 8), y = add ? R(rng, 1, 9 - x) : R(rng, 1, x - 1), a = x * 10, b = y * 10, r = add ? a + b : a - b, op = add ? '+' : M;
          return Q(L(`Tính nhẩm:\n${a} ${op} ${b} = ?`, `Mental maths:\n${a} ${op} ${b} = ?`), num(r), L(`${x} chục ${op} ${y} chục = ${r / 10} chục. Vậy ${a} ${op} ${b} = ${r}.`, `${pl(x, 'ten', 'tens')} ${op} ${pl(y, 'ten', 'tens')} = ${pl(r / 10, 'ten', 'tens')}. So ${a} ${op} ${b} = ${r}.`), { hint: L(`${a} là ${x} chục, ${b} là ${y} chục.`, `${a} is ${pl(x, 'ten', 'tens')} and ${b} is ${pl(y, 'ten', 'tens')}.`) });
        }
        const q = DT.bank(rng, ['g1-dt-cong-sat', 'g1-dt-tru-co-0', 'g1-dt-mot-chu-so', 'g1-dt-cong-tron-chuc']);
        if (q) return q;
        const [a, b] = pairWhere(rng, [40, 99], [20, 90], (p, q2) => p > q2 && noBorrow(p, q2) && (p - q2) % 10 === 0, [78, 48]);
        return Q(set + `${a} ${M} ${b}`, num(a - b), `${a} ${M} ${b} = ${a - b}.`, { hint: hintA, visual: col(a, b, M) });
      },
    },

    {
      id: 'g1-dt-loi-van-100', sem: 2, icon: '📝', lesson: 'g1-c8-b32',
      title: L('Bài toán có lời văn: cộng, trừ trong phạm vi 100', 'Word problems: adding and subtracting within 100'),
      spot: L('Bài toán kể một câu chuyện có hai số và một câu hỏi “Hỏi … bao nhiêu?”.', 'The problem tells a short story with two numbers and a question "How many …?".'),
      steps: [
        L('Bước 1: Đọc kĩ. Bài toán cho biết gì? Bài toán hỏi gì?', 'Step 1: Read carefully. What does the problem tell you? What does it ask?'),
        L('Bước 2: Thêm, gộp lại, có tất cả: làm phép cộng. Bớt, cho đi, còn lại: làm phép trừ.', 'Step 2: More, put together, altogether: add. Take away, give away, left: subtract.'),
        L('Bước 3: Viết phép tính, tính rồi viết đáp số có tên đơn vị.', 'Step 3: Write the calculation, work it out and write the answer with its unit.'),
      ],
      tip: L('Đừng thấy hai số là cộng ngay. Em đọc câu hỏi: “có tất cả” thì cộng, “còn lại” thì trừ.', 'Do not add just because you see two numbers. Read the question: "altogether" means add, "left" means subtract.'),
      guide: rng => {
        const add = R(rng, 0, 1) === 1, w = DT.name(rng);
        const [a, b] = add ? pairWhere(rng, [12, 60], [10, 35], noCarry, [32, 15]) : pairWhere(rng, [35, 98], [11, 50], (p, q) => p > q && noBorrow(p, q), [68, 25]);
        const st = P(rng, add ? ADD100 : SUB100)(a, b, w), r = add ? a + b : a - b, op = add ? '+' : M, u = L(st.u[0], st.u[1]);
        const qAll = L('Có tất cả bao nhiêu', 'How many altogether'), qLeft = L('Còn lại bao nhiêu', 'How many are left');
        return G(L(st.vi, st.en), [
          step(L('Bài toán hỏi gì?', 'What does the problem ask?'), ch(rng, add ? qAll : qLeft, [add ? qLeft : qAll]), add ? L('Bài toán hỏi có tất cả bao nhiêu. Tìm tất cả thì làm phép cộng.', 'The problem asks how many altogether. To find how many altogether, we add.') : L('Bài toán hỏi còn lại bao nhiêu. Tìm phần còn lại thì làm phép trừ.', 'The problem asks how many are left. To find how many are left, we subtract.'), L('Đọc lại câu có chữ “Hỏi”.', 'Read the question sentence again.')),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} ${op} ${b}`, [add ? `${Math.max(a, b)} ${M} ${Math.min(a, b)}` : `${a} + ${b}`]), L(`Phép tính: ${a} ${op} ${b}.`, `The calculation: ${a} ${op} ${b}.`), add ? L('Có tất cả: làm phép cộng.', 'Altogether: add.') : L('Còn lại: làm phép trừ.', 'Left: subtract.')),
          step(`${a} ${op} ${b} = ?`, num(r), `${a} ${op} ${b} = ${r} (${u}).`, L('Tính hàng đơn vị trước, hàng chục sau.', 'Work out the ones first, then the tens.')),
        ], L(`Đáp số: ${r} ${u}.`, `Answer: ${r} ${u}.`), col(a, b, op));
      },
      practice: (rng, i) => {
        const w = DT.name(rng);
        const hA = L('Tìm tất cả thì làm phép cộng.', 'To find how many altogether, add.'), hS = L('Tìm phần còn lại thì làm phép trừ.', 'To find how many are left, subtract.');
        if (i < 7) {
          const add = i % 2 === 0, tens = i < 2;
          const [a, b] = tens ? (add ? [R(rng, 1, 5) * 10, R(rng, 1, 4) * 10] : [R(rng, 5, 9) * 10, R(rng, 1, 4) * 10])
            : add ? pairWhere(rng, [12, 70], i < 4 ? [1, 8] : [10, 40], noCarry, [32, 15]) : pairWhere(rng, [25, 98], i < 4 ? [1, 8] : [11, 60], (p, q) => p > q && noBorrow(p, q), [68, 25]);
          const st = P(rng, add ? ADD100 : SUB100)(a, b, w), r = add ? a + b : a - b, op = add ? '+' : M, u = L(st.u[0], st.u[1]);
          if (i === 5 || i === 6) return Q(L(st.vi, st.en) + L('\nEm chọn phép tính đúng:', '\nChoose the right calculation:'), ch(rng, `${a} ${op} ${b} = ${r}`, [add ? `${Math.max(a, b)} ${M} ${Math.min(a, b)} = ${Math.abs(a - b)}` : `${a} + ${b} = ${a + b}`, `${a} ${op} ${b} = ${r + 10}`]), `${a} ${op} ${b} = ${r} (${u}).`, { hint: add ? hA : hS });
          return Q(L(st.vi, st.en), num(r, u), `${a} ${op} ${b} = ${r} (${u}).`, { hint: add ? hA : hS, visual: col(a, b, op) });
        }
        if (i === 9) { const q = DT.bank(rng, ['g1-nc-bai-toan-nguoc']); if (q) return q; }
        if (i === 7) {
          const [a, b] = pairWhere(rng, [12, 60], [10, 35], noCarry, [32, 15]), [w1, w2] = DT.names(rng, 2);
          return Q(L(`${w1} hái được ${a} quả cam, ${w2} hái được ${b} quả cam. Hỏi cả hai bạn hái được bao nhiêu quả cam?`, `${w1} picks ${a} oranges and ${w2} picks ${b} oranges. How many oranges do they pick altogether?`), num(a + b, L('quả cam', 'oranges')), L(`Gộp số cam của hai bạn: ${a} + ${b} = ${a + b} (quả cam).`, `Put the two friends' oranges together: ${a} + ${b} = ${a + b} (oranges).`), { hint: L('“Cả hai bạn” là gộp lại: làm phép cộng.', '"Altogether" means put together: add.'), visual: col(a, b, '+') });
        }
        const [a, r] = pairWhere(rng, [35, 98], [11, 60], (p, q) => p > q && noBorrow(p, q), [68, 25]), b = a - r;
        return Q(L(`Quyển truyện có ${a} trang. ${w} đã đọc ${b} trang. Hỏi ${w} còn phải đọc bao nhiêu trang nữa thì hết quyển truyện?`, `A storybook has ${a} pages. ${w} has read ${b} pages. How many more pages must ${w} read to finish the book?`), num(r, L('trang', 'pages')), L(`Số trang còn phải đọc: ${a} ${M} ${b} = ${r} (trang).`, `Pages still to read: ${a} ${M} ${b} = ${r} (pages).`), { hint: L('Tìm số trang còn lại: lấy tất cả trừ số trang đã đọc.', 'Find the pages that are left: take the pages read away from all the pages.'), visual: col(a, b, M) });
      },
    },

    {
      id: 'g1-dt-xem-gio', sem: 2, icon: '🕐', lesson: 'g1-c9-b34',
      title: L('Xem giờ đúng trên đồng hồ', 'Telling the time: o’clock'),
      spot: L('Bài có hình mặt đồng hồ, kim dài chỉ số 12, và hỏi: đồng hồ chỉ mấy giờ?', 'The problem shows a clock face with the long hand on 12 and asks: what time is it?'),
      steps: [
        L('Bước 1: Tìm kim dài. Kim dài chỉ số 12 là giờ đúng.', 'Step 1: Find the long hand. When it points to 12, it is an o’clock time.'),
        L('Bước 2: Tìm kim ngắn. Kim ngắn chỉ số mấy thì là mấy giờ.', 'Step 2: Find the short hand. The number it points to is the hour.'),
        L('Bước 3: Đọc: “… giờ”.', 'Step 3: Say: "… o’clock".'),
      ],
      tip: L('Đừng đọc giờ theo kim dài. Kim dài chỉ số 12, nhưng giờ là số mà kim ngắn chỉ.', 'Do not read the hour from the long hand. The long hand is on 12, but the hour is the number the short hand points to.'),
      guide: rng => {
        const act = P(rng, ACTS), h = act.h, w = DT.name(rng);
        return G(L(`${w} ${act.t} lúc đồng hồ chỉ như hình. Hỏi lúc đó là mấy giờ?`, `${w} ${act.es} when the clock looks like this. What time is it?`), [
          step(L('Kim dài chỉ số mấy?', 'Which number does the long hand point to?'), num(12), L('Kim dài chỉ số 12. Đây là giờ đúng.', 'The long hand points to 12. This is an o’clock time.'), L('Kim dài là kim mảnh và dài hơn.', 'The long hand is the thinner, longer one.')),
          step(L('Kim ngắn chỉ số mấy?', 'Which number does the short hand point to?'), num(h), L(`Kim ngắn chỉ số ${h}.`, `The short hand points to ${h}.`), L('Kim ngắn là kim to và ngắn hơn.', 'The short hand is the thicker, shorter one.')),
          step(L('Vậy đồng hồ chỉ mấy giờ?', 'So what time does the clock show?'), ch(rng, gio(h), [gio(h === 12 ? 1 : 12), gio(h % 12 + 1)]), L(`Kim dài chỉ số 12, kim ngắn chỉ số ${h}: đồng hồ chỉ ${h} giờ.`, `The long hand is on 12 and the short hand is on ${h}: it is ${h} o’clock.`), L('Giờ là số mà kim ngắn chỉ.', 'The hour is the number the short hand points to.')),
        ], L(`Đáp số: ${h} giờ.`, `Answer: ${h} o’clock.`), vz('clock', { h, m: 0 }));
      },
      practice: (rng, i) => {
        const act = P(rng, ACTS), w = DT.name(rng), h = i < 2 ? act.h : R(rng, 1, 12);
        const near = [gio(h % 12 + 1), gio(h === 1 ? 12 : h - 1), gio(h === 12 ? 6 : 12)];
        if (i < 4) {
          const p = i < 2 ? L(`${w} ${act.t} lúc đồng hồ chỉ như hình. Lúc đó là mấy giờ?`, `${w} ${act.es} when the clock looks like this. What time is it?`) : L(`${w} nhìn đồng hồ treo tường. Đồng hồ chỉ mấy giờ?`, `${w} looks at the clock on the wall. What time does it show?`);
          return Q(p, i % 2 ? num(h, L('giờ', 'o’clock')) : ch(rng, gio(h), near), L(`Kim dài chỉ số 12, kim ngắn chỉ số ${h}: ${h} giờ.`, `The long hand is on 12 and the short hand is on ${h}: ${h} o’clock.`), { hint: L('Kim dài chỉ số 12. Xem kim ngắn chỉ số mấy.', 'The long hand is on 12. See which number the short hand points to.'), visual: vz('clock', { h, m: 0 }) });
        }
        if (i === 4) return Q(L(`${w} ${act.t} lúc ${act.h} giờ. Lúc đó kim ngắn của đồng hồ chỉ số mấy?`, `${w} ${act.es} at ${act.h} o’clock. Which number does the short hand point to then?`), num(act.h), L(`Lúc ${act.h} giờ, kim ngắn chỉ số ${act.h}, kim dài chỉ số 12.`, `At ${act.h} o’clock the short hand points to ${act.h} and the long hand points to 12.`), { hint: L('Mấy giờ thì kim ngắn chỉ số đó.', 'The short hand points to the number of the hour.') });
        if (i === 5) return Q(L(`Đồng hồ của ${w} có kim dài chỉ số 12, kim ngắn chỉ số ${h}. Đồng hồ chỉ mấy giờ?`, `On ${w}'s clock the long hand points to 12 and the short hand points to ${h}. What time is it?`), ch(rng, gio(h), near), L(`Kim ngắn chỉ số ${h}: ${h} giờ.`, `The short hand is on ${h}: ${h} o’clock.`), { hint: L('Giờ là số mà kim ngắn chỉ.', 'The hour is the number the short hand points to.') });
        if (i === 6) return Q(L(`Lúc ${h} giờ đúng, kim dài của đồng hồ nhà ${w} chỉ số mấy?`, `At exactly ${h} o’clock, which number does the long hand of ${w}'s clock point to?`), num(12), L('Giờ đúng thì kim dài luôn chỉ số 12.', 'At an o’clock time the long hand always points to 12.'), { hint: L('Giờ đúng: kim dài luôn chỉ một số. Đó là số nào?', 'At an o’clock time the long hand always points to the same number. Which one?'), visual: vz('clock', { h, m: 0 }) });
        const k = R(rng, 1, 3), later = i !== 8, h0 = later ? R(rng, 1, 12 - k) : R(rng, k + 1, 12), r = later ? h0 + k : h0 - k;
        return Q(later ? L(`Bây giờ là ${h0} giờ. ${w} chơi thêm ${k} giờ nữa rồi về. Hỏi ${w} về lúc mấy giờ?`, `It is ${h0} o’clock now. ${w} plays for ${k} more ${k === 1 ? 'hour' : 'hours'} and then goes home. At what time does ${w} go home?`) : L(`Bây giờ là ${h0} giờ. ${w} đã đến lớp từ ${k} giờ trước. Hỏi ${w} đến lớp lúc mấy giờ?`, `It is ${h0} o’clock now. ${w} got to class ${k} ${k === 1 ? 'hour' : 'hours'} ago. At what time did ${w} get to class?`), num(r, L('giờ', 'o’clock')), later ? L(`${h0} + ${k} = ${r}. ${w} về lúc ${r} giờ.`, `${h0} + ${k} = ${r}. ${w} goes home at ${r} o’clock.`) : L(`${h0} ${M} ${k} = ${r}. ${w} đến lớp lúc ${r} giờ.`, `${h0} ${M} ${k} = ${r}. ${w} got to class at ${r} o’clock.`), { hint: later ? L(`Sau ${k} giờ nữa: đếm thêm ${k} từ ${h0}.`, `${k} ${k === 1 ? 'hour' : 'hours'} later: count on ${k} from ${h0}.`) : L(`${k} giờ trước: đếm lùi ${k} từ ${h0}.`, `${k} ${k === 1 ? 'hour' : 'hours'} ago: count back ${k} from ${h0}.`), visual: vz('clock', { h: h0, m: 0 }) });
      },
    },

    {
      id: 'g1-dt-ngay-tuan', sem: 2, icon: '📅', lesson: 'g1-c9-b35',
      title: L('Các ngày trong tuần: hôm qua, hôm nay, ngày mai', 'Days of the week: yesterday, today, tomorrow'),
      spot: L('Bài cho biết hôm nay là thứ mấy và hỏi ngày mai (hoặc hôm qua) là thứ mấy, ngày bao nhiêu.', 'The problem tells you what day it is today and asks what day or date it is tomorrow (or was yesterday).'),
      steps: [
        L('Bước 1: Nhớ thứ tự: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ nhật.', 'Step 1: Remember the order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.'),
        L('Bước 2: Ngày mai là ngày liền sau hôm nay. Hôm qua là ngày liền trước hôm nay.', 'Step 2: Tomorrow is the day just after today. Yesterday is the day just before today.'),
        L('Bước 3: Ngày mai thì số ngày thêm 1. Hôm qua thì số ngày bớt 1.', 'Step 3: For tomorrow, add 1 to the date. For yesterday, take 1 away.'),
      ],
      tip: L('Sau Chủ nhật là Thứ Hai của tuần mới. Trước Thứ Hai là Chủ nhật.', 'After Sunday comes Monday of a new week. Before Monday comes Sunday.'),
      guide: rng => {
        const k = R(rng, 0, 6), tom = R(rng, 0, 1) === 1, d = R(rng, 2, 27), k2 = tom ? k + 1 : k - 1, d2 = tom ? d + 1 : d - 1;
        const after = L('Ngày liền sau hôm nay', 'The day just after today'), before = L('Ngày liền trước hôm nay', 'The day just before today');
        return G(tom ? L(`Hôm nay là ${day(k)}, ngày ${d}. Hỏi ngày mai là thứ mấy, ngày bao nhiêu?`, `Today is ${day(k)} the ${d}${ordS(d)}. What day and date is it tomorrow?`) : L(`Hôm nay là ${day(k)}, ngày ${d}. Hỏi hôm qua là thứ mấy, ngày bao nhiêu?`, `Today is ${day(k)} the ${d}${ordS(d)}. What day and date was it yesterday?`), [
          step(tom ? L('Ngày mai là ngày nào?', 'Which day is tomorrow?') : L('Hôm qua là ngày nào?', 'Which day was yesterday?'), ch(rng, tom ? after : before, [tom ? before : after]), tom ? L('Ngày mai là ngày liền sau hôm nay.', 'Tomorrow is the day just after today.') : L('Hôm qua là ngày liền trước hôm nay.', 'Yesterday is the day just before today.')),
          step(tom ? L(`Liền sau ${day(k)} là thứ mấy?`, `Which day comes just after ${day(k)}?`) : L(`Liền trước ${day(k)} là thứ mấy?`, `Which day comes just before ${day(k)}?`), dayCh(rng, k2), tom ? L(`Sau ${day(k)} là ${day(k2)}.`, `After ${day(k)} comes ${day(k2)}.`) : L(`Trước ${day(k)} là ${day(k2)}.`, `Before ${day(k)} comes ${day(k2)}.`), L('Đọc thứ tự các ngày trong tuần, bắt đầu từ Thứ Hai.', 'Say the days of the week in order, starting from Monday.')),
          step(tom ? L(`Hôm nay là ngày ${d}. Ngày mai là ngày bao nhiêu?`, `Today is the ${d}${ordS(d)}. What is the date tomorrow?`) : L(`Hôm nay là ngày ${d}. Hôm qua là ngày bao nhiêu?`, `Today is the ${d}${ordS(d)}. What was the date yesterday?`), num(d2), tom ? L(`${d} + 1 = ${d2}. Ngày mai là ngày ${d2}.`, `${d} + 1 = ${d2}. Tomorrow is the ${d2}${ordS(d2)}.`) : L(`${d} ${M} 1 = ${d2}. Hôm qua là ngày ${d2}.`, `${d} ${M} 1 = ${d2}. Yesterday was the ${d2}${ordS(d2)}.`), tom ? L('Ngày mai: số ngày thêm 1.', 'Tomorrow: add 1 to the date.') : L('Hôm qua: số ngày bớt 1.', 'Yesterday: take 1 away from the date.')),
        ], L(`Đáp số: ${day(k2)}, ngày ${d2}.`, `Answer: ${day(k2)} the ${d2}${ordS(d2)}.`));
      },
      practice: (rng, i) => {
        const k = R(rng, 0, 6), d = R(rng, 3, 26), w = DT.name(rng);
        const hintD = L('Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ nhật.', 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.');
        if (i === 0 || i === 2) return Q(L(`Hôm nay là ${day(k)}. Ngày mai là thứ mấy?`, `Today is ${day(k)}. What day is it tomorrow?`), dayCh(rng, k + 1), L(`Sau ${day(k)} là ${day(k + 1)}.`, `After ${day(k)} comes ${day(k + 1)}.`), { hint: L('Ngày mai là ngày liền sau hôm nay.', 'Tomorrow is the day just after today.') });
        if (i === 1 || i === 3) return Q(L(`Hôm nay là ${day(k)}. Hôm qua là thứ mấy?`, `Today is ${day(k)}. What day was it yesterday?`), dayCh(rng, k - 1), L(`Trước ${day(k)} là ${day(k - 1)}.`, `Before ${day(k)} comes ${day(k - 1)}.`), { hint: L('Hôm qua là ngày liền trước hôm nay.', 'Yesterday is the day just before today.') });
        if (i === 4) return Q(L(`Hôm nay là ${day(k)}, ngày ${d}. Ngày mai là ngày bao nhiêu?`, `Today is ${day(k)} the ${d}${ordS(d)}. What is the date tomorrow?`), num(d + 1), L(`${d} + 1 = ${d + 1}. Ngày mai là ${day(k + 1)}, ngày ${d + 1}.`, `${d} + 1 = ${d + 1}. Tomorrow is ${day(k + 1)} the ${d + 1}${ordS(d + 1)}.`), { hint: L('Ngày mai: số ngày thêm 1.', 'Tomorrow: add 1 to the date.') });
        if (i === 5) return Q(L(`Hôm nay là ${day(k)}, ngày ${d}. Hôm qua là ngày bao nhiêu?`, `Today is ${day(k)} the ${d}${ordS(d)}. What was the date yesterday?`), num(d - 1), L(`${d} ${M} 1 = ${d - 1}. Hôm qua là ${day(k - 1)}, ngày ${d - 1}.`, `${d} ${M} 1 = ${d - 1}. Yesterday was ${day(k - 1)} the ${d - 1}${ordS(d - 1)}.`), { hint: L('Hôm qua: số ngày bớt 1.', 'Yesterday: take 1 away from the date.') });
        if (i === 6) return Q(L(`Ngày mai là ${day(k + 1)}. Vậy hôm nay là thứ mấy?`, `Tomorrow is ${day(k + 1)}. So what day is it today?`), dayCh(rng, k), L(`Trước ${day(k + 1)} là ${day(k)}. Hôm nay là ${day(k)}.`, `Before ${day(k + 1)} comes ${day(k)}. Today is ${day(k)}.`), { hint: L('Hôm nay là ngày liền trước ngày mai.', 'Today is the day just before tomorrow.') });
        if (i === 9) { const q = DT.bank(rng, ['g1-nc-thu-ngay']); if (q) return q; }
        if (i === 7) return Q(L(`Hôm nay là ${day(k)}. ${w} được đi chơi vào ngày kia (sau ngày mai). Hỏi ${w} đi chơi vào thứ mấy?`, `Today is ${day(k)}. ${w} is going on a trip the day after tomorrow. On which day does ${w} go?`), ch(rng, day(k + 2), [day(k + 1), day(k + 3), day(k - 1)]), L(`Ngày mai là ${day(k + 1)}, ngày kia là ${day(k + 2)}.`, `Tomorrow is ${day(k + 1)} and the day after tomorrow is ${day(k + 2)}.`), { hint: hintD });
        return Q(L(`Hôm qua là ${day(k - 1)}, ngày ${d - 1}. Hỏi ngày mai là ngày bao nhiêu?`, `Yesterday was ${day(k - 1)} the ${d - 1}${ordS(d - 1)}. What is the date tomorrow?`), num(d + 1), L(`Hôm nay là ngày ${d}, ngày mai là ngày ${d + 1} (${day(k + 1)}).`, `Today is the ${d}${ordS(d)}, so tomorrow is the ${d + 1}${ordS(d + 1)} (${day(k + 1)}).`), { hint: L('Tìm hôm nay trước, rồi tìm ngày mai.', 'Find today first, then find tomorrow.') });
      },
    },
  ]);

  // English ordinal ending: 1st, 2nd, 3rd, 4th, 11th, 21st…
  function ordS(d) { return d % 10 === 1 && d % 100 !== 11 ? 'st' : d % 10 === 2 && d % 100 !== 12 ? 'nd' : d % 10 === 3 && d % 100 !== 13 ? 'rd' : 'th'; }
})();
