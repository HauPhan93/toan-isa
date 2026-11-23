/* Toán ISA — Học dạng toán, lớp 2 (SGK Toán 2 "Kết nối tri thức với cuộc sống"). Contract: DANGTOAN.md.
 * Word problems have ONE step. Học kì I: numbers to 100 (qua 10, then có nhớ). Học kì II: tables 2 and 5,
 * numbers to 1000. The lời giải follows the SGK: câu lời giải, phép tính with the unit in brackets, đáp số.
 */
(function () {
  'use strict';
  const L = DT.L, R = DT.R, P = DT.P, M = DT.M, F = DT.F, num = DT.num, ch = DT.ch, vz = DT.vz, Q = DT.Q, step = DT.step;

  // ---------- small helpers ----------
  const G = (prompt, steps, done, visual) => Object.assign({ prompt, steps, done }, visual ? { visual } : {});
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const signCh = (rng, a, b) => ch(rng, sign(a, b), ['<', '>', '=']);
  const cmp = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b ? 0 : a > b ? 1 : 2 });
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const asc = arr => arr.slice().sort((x, y) => x - y);
  const sum = arr => arr.reduce((x, y) => x + y, 0);
  function pairWhere(rng, ra, rb, ok, fb) {
    for (let g = 0; g < 600; g++) { const a = R(rng, ra[0], ra[1]), b = R(rng, rb[0], rb[1]); if (ok(a, b)) return [a, b]; }
    return fb;
  }
  function noCarry(a, b) { while (a > 0 || b > 0) { if (a % 10 + b % 10 >= 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  function noBorrow(a, b) { while (b > 0) { if (a % 10 < b % 10) return false; a = Math.floor(a / 10); b = Math.floor(b / 10); } return true; }
  // number pairs as the lessons use them
  const addOver10 = rng => { const a = R(rng, 5, 9); return [a, R(rng, 11 - a, 9)]; };              // 8 + 5 (qua 10)
  const subOver10 = rng => { const a = R(rng, 11, 18); return [a, R(rng, a - 9, 9)]; };              // 13 − 5 (qua 10)
  const add2 = rng => pairWhere(rng, [20, 70], [10, 25], (x, y) => noCarry(x, y) && x + y < 100, [42, 15]);       // không nhớ
  const sub2 = rng => pairWhere(rng, [40, 99], [10, 30], (x, y) => x > y && noBorrow(x, y), [68, 25]);
  const carry2 = rng => pairWhere(rng, [15, 79], [13, 69], (x, y) => x % 10 + y % 10 >= 10 && x + y <= 99, [38, 27]); // có nhớ
  const borrow2 = rng => pairWhere(rng, [31, 98], [13, 79], (x, y) => x - y >= 10 && x % 10 < y % 10, [62, 37]);
  // 3-digit pairs: no carrying (Bài 59, 61) or exactly one carry / borrow (Bài 60, 62)
  const carries = (x, y) => (x % 10 + y % 10 >= 10 ? 1 : 0) + (tens(x) + tens(y) + (x % 10 + y % 10 >= 10 ? 1 : 0) >= 10 ? 1 : 0);
  const borrows = (x, y) => (x % 10 < y % 10 ? 1 : 0) + (tens(x) - (x % 10 < y % 10 ? 1 : 0) < tens(y) ? 1 : 0);
  const add3 = (rng, carry) => pairWhere(rng, [120, 680], [105, 290], (x, y) => x + y <= 999 && carries(x, y) === (carry ? 1 : 0), carry ? [356, 127] : [342, 215]);
  const sub3 = (rng, borrow) => pairWhere(rng, [320, 980], [105, 290], (x, y) => x - y >= 100 && borrows(x, y) === (borrow ? 1 : 0), borrow ? [562, 237] : [568, 225]);
  const tens = n => Math.floor(n / 10) % 10, ones = n => n % 10, hund = n => Math.floor(n / 100);
  const units = (x, max) => Math.max(1, Math.round(x * 12 / Math.max(1, max)));   // bar lengths of a tape diagram
  const tapeDiff = (la, a, lb, b, d) => vz('tape', { bars: [{ label: la, units: units(a, Math.max(a, b)), value: a == null ? '?' : F(a) }, { label: lb, units: units(b, Math.max(a, b)), value: F(b) }], diff: d });
  // "nhiều hơn / ít hơn": the known bar, the unknown bar and the difference
  const tapeMore = (la, a, lb, r, b) => vz('tape', { bars: [{ label: la, units: units(a, Math.max(a, r)), value: F(a) }, { label: lb, units: units(r, Math.max(a, r)), value: '?' }], diff: F(b) });
  const col = (a, b, op) => vz('columnCalc', { a, b, op, reveal: 'none' });

  // n: Vietnamese noun with its classifier, s / p: English singular / plural
  const IT = [
    { n: 'nhãn vở', s: 'book label', p: 'book labels', e: '🏷️' }, { n: 'viên bi', s: 'marble', p: 'marbles', e: '🔵' }, { n: 'bông hoa', s: 'flower', p: 'flowers', e: '🌸' },
    { n: 'quyển truyện', s: 'storybook', p: 'storybooks', e: '📖' }, { n: 'cái kẹo', s: 'sweet', p: 'sweets', e: '🍬' }, { n: 'quả cam', s: 'orange', p: 'oranges', e: '🍊' },
    { n: 'quyển vở', s: 'exercise book', p: 'exercise books', e: '📘' }, { n: 'quả bóng bay', s: 'balloon', p: 'balloons', e: '🎈' }, { n: 'cái bút chì', s: 'pencil', p: 'pencils', e: '✏️' },
  ];
  const pE = (k, it) => `${F(k)} ${k === 1 ? it.s : it.p}`;
  const IT_BIG = [IT[0], IT[1], IT[4]];   // things a child can have dozens of: book labels, marbles, sweets
  const un = (it, k) => L(it.n, k === 1 ? it.s : it.p);

  /* ---- story builders: each returns { vi, en, u(k): unit, … } ---- */
  // two amounts a > b: "how many more / fewer?" (asked about the bigger one when `more`)
  function cmpStory(rng, a, b, more, f0) {   // f0: force a story (0 = two children)
    const f = f0 != null ? f0 : R(rng, 0, 3);
    if (f === 0) {
      const [x, y] = DT.names(rng, 2), it = P(rng, a > 20 ? IT_BIG : IT);
      return { la: x, lb: y, u: k => un(it, k),
        vi: `${x} có ${a} ${it.n}, ${y} có ${b} ${it.n}. ` + (more ? `Hỏi ${x} có nhiều hơn ${y} bao nhiêu ${it.n}?` : `Hỏi ${y} có ít hơn ${x} bao nhiêu ${it.n}?`),
        en: `${x} has ${pE(a, it)} and ${y} has ${pE(b, it)}. ` + (more ? `How many more ${it.p} does ${x} have than ${y}?` : `How many fewer ${it.p} does ${y} have than ${x}?`) };
    }
    if (f === 1) return { la: L('Sách', 'Books'), lb: L('Vở', 'Exercise books'), u: k => L('quyển', k === 1 ? 'book' : 'books'),
      vi: `Trên giá có ${a} quyển sách và ${b} quyển vở. ` + (more ? 'Hỏi số quyển sách nhiều hơn số quyển vở bao nhiêu quyển?' : 'Hỏi số quyển vở ít hơn số quyển sách bao nhiêu quyển?'),
      en: `There are ${a} books and ${b} exercise books on a shelf. ` + (more ? 'How many more books than exercise books are there?' : 'How many fewer exercise books than books are there?') };
    if (f === 2) return { la: L('Cam', 'Orange'), lb: L('Bưởi', 'Pomelo'), u: k => L('cây', k === 1 ? 'tree' : 'trees'),
      vi: `Vườn nhà bà có ${a} cây cam và ${b} cây bưởi. ` + (more ? 'Hỏi số cây cam nhiều hơn số cây bưởi bao nhiêu cây?' : 'Hỏi số cây bưởi ít hơn số cây cam bao nhiêu cây?'),
      en: `Grandma's garden has ${a} orange trees and ${b} pomelo trees. ` + (more ? 'How many more orange trees than pomelo trees are there?' : 'How many fewer pomelo trees than orange trees are there?') };
    return { la: L('Gà', 'Chickens'), lb: L('Vịt', 'Ducks'), u: k => L('con', k === 1 ? 'bird' : 'birds'),
      vi: `Nhà bác Tư nuôi ${a} con gà và ${b} con vịt. ` + (more ? 'Hỏi số gà nhiều hơn số vịt bao nhiêu con?' : 'Hỏi số vịt ít hơn số gà bao nhiêu con?'),
      en: `Uncle Tư keeps ${a} chickens and ${b} ducks. ` + (more ? 'How many more chickens than ducks are there?' : 'How many fewer ducks than chickens are there?') };
  }
  // "thêm" (add) / "bớt" (take away) a number of things
  function tbStory(rng, add, a, b, f0) {   // f0: force a story (2 = the shop, for big numbers)
    const w = DT.name(rng), it = P(rng, IT), f = f0 != null ? f0 : R(rng, 0, 2), u = k => un(it, k);
    if (add) return [
      { it, u, vi: `${w} có ${a} ${it.n}, mẹ cho thêm ${b} ${it.n}. Hỏi ${w} có tất cả bao nhiêu ${it.n}?`, en: `${w} has ${pE(a, it)}. Mum gives ${w} ${F(b)} more. How many ${it.p} does ${w} have altogether?` },
      { it, u, vi: `Trong hộp có ${a} ${it.n}, cô giáo bỏ thêm vào ${b} ${it.n}. Hỏi trong hộp có tất cả bao nhiêu ${it.n}?`, en: `There are ${pE(a, it)} in a box. The teacher puts in ${F(b)} more. How many ${it.p} are in the box altogether?` },
      { it, u, vi: `Cửa hàng có ${a} ${it.n}, cô chủ nhập thêm ${b} ${it.n}. Hỏi cửa hàng có tất cả bao nhiêu ${it.n}?`, en: `A shop has ${pE(a, it)}. The shopkeeper gets ${F(b)} more. How many ${it.p} does the shop have altogether?` },
    ][f];
    return [
      { it, u, vi: `${w} có ${a} ${it.n}, ${w} cho bạn ${b} ${it.n}. Hỏi ${w} còn lại bao nhiêu ${it.n}?`, en: `${w} has ${pE(a, it)} and gives ${F(b)} to a friend. How many ${it.p} does ${w} have left?` },
      { it, u, vi: `Trên bàn có ${a} ${it.n}, em lấy đi ${b} ${it.n}. Hỏi trên bàn còn lại bao nhiêu ${it.n}?`, en: `There are ${pE(a, it)} on the table. You take away ${F(b)}. How many ${it.p} are left on the table?` },
      { it, u, vi: `Cửa hàng có ${a} ${it.n}, đã bán ${b} ${it.n}. Hỏi cửa hàng còn lại bao nhiêu ${it.n}?`, en: `A shop has ${pE(a, it)}. It sells ${F(b)}. How many ${it.p} does the shop have left?` },
    ][f];
  }
  // "nhiều hơn" (more = true) / "ít hơn": the first has a, the second has b more / fewer. f: 0 things, 1 cm, 2 kg, 3 years
  function moreStory(rng, more, a, b, f) {
    if (f === 1) return { la: L('Đỏ', 'Red'), lb: L('Xanh', 'Blue'), u: () => 'cm',
      cmpS: L(`Băng giấy xanh ${more ? 'dài' : 'ngắn'} hơn băng giấy đỏ ${b} cm.`, `The blue strip is ${b} cm ${more ? 'longer' : 'shorter'} than the red strip.`),
      ask: more ? L('Băng giấy nào dài hơn?', 'Which paper strip is longer?') : L('Băng giấy nào ngắn hơn?', 'Which paper strip is shorter?'),
      vi: `Băng giấy đỏ dài ${a} cm. Băng giấy xanh ${more ? 'dài' : 'ngắn'} hơn băng giấy đỏ ${b} cm. Hỏi băng giấy xanh dài bao nhiêu xăng-ti-mét?`,
      en: `The red paper strip is ${a} cm long. The blue paper strip is ${b} cm ${more ? 'longer' : 'shorter'} than the red one. How many centimetres long is the blue strip?`,
      key: more ? L('dài hơn', 'longer') : L('ngắn hơn', 'shorter'), who: L('Băng giấy xanh', 'The blue strip'), other: L('Băng giấy đỏ', 'The red strip'), sol: L('Băng giấy xanh dài là', 'Length of the blue strip') };
    if (f === 2) return { la: L('Gạo', 'Rice'), lb: L('Ngô', 'Maize'), u: () => 'kg',
      cmpS: L(`Bao ngô ${more ? 'nặng' : 'nhẹ'} hơn bao gạo ${b} kg.`, `The sack of maize is ${b} kg ${more ? 'heavier' : 'lighter'} than the sack of rice.`),
      ask: more ? L('Bao nào nặng hơn?', 'Which sack is heavier?') : L('Bao nào nhẹ hơn?', 'Which sack is lighter?'),
      vi: `Bao gạo nặng ${a} kg. Bao ngô ${more ? 'nặng' : 'nhẹ'} hơn bao gạo ${b} kg. Hỏi bao ngô nặng bao nhiêu ki-lô-gam?`,
      en: `The sack of rice weighs ${a} kg. The sack of maize is ${b} kg ${more ? 'heavier' : 'lighter'} than the sack of rice. How many kilograms does the sack of maize weigh?`,
      key: more ? L('nặng hơn', 'heavier') : L('nhẹ hơn', 'lighter'), who: L('Bao ngô', 'The sack of maize'), other: L('Bao gạo', 'The sack of rice'), sol: L('Bao ngô nặng là', 'Weight of the sack of maize') };
    if (f === 3) {
      const x = DT.name(rng), sib = more ? L('anh', 'older brother') : L('em', 'younger brother');
      return { la: x, lb: L(more ? 'Anh' : 'Em', 'Brother'), u: k => L('tuổi', k === 1 ? 'year old' : 'years old'),
        cmpS: L(`${more ? 'Anh' : 'Em'} của ${x} ${more ? 'hơn' : 'kém'} ${x} ${b} tuổi.`, `${x}'s ${sib} is ${b} ${b === 1 ? 'year' : 'years'} ${more ? 'older' : 'younger'} than ${x}.`),
        ask: more ? L('Ai nhiều tuổi hơn?', 'Who is older?') : L('Ai ít tuổi hơn?', 'Who is younger?'),
        vi: `Năm nay ${x} ${a} tuổi. ${more ? `Anh của ${x} hơn` : `Em của ${x} kém`} ${x} ${b} tuổi. Hỏi năm nay ${more ? 'anh' : 'em'} của ${x} bao nhiêu tuổi?`,
        en: `${x} is ${a} years old this year. ${x}'s ${sib} is ${b} ${b === 1 ? 'year' : 'years'} ${more ? 'older' : 'younger'} than ${x}. How old is ${x}'s ${sib} this year?`,
        key: more ? L('hơn', 'older') : L('kém', 'younger'), who: L(`${cap(more ? 'anh' : 'em')} của ${x}`, `${x}'s ${sib}`), other: x, sol: L(`Số tuổi của ${more ? 'anh' : 'em'} là`, `Age of ${x}'s ${sib}`) };
    }
    const [x, y] = DT.names(rng, 2), it = P(rng, a > 20 ? IT_BIG : IT);
    return { la: x, lb: y, u: k => un(it, k),
      cmpS: L(`${y} có ${more ? 'nhiều' : 'ít'} hơn ${x} ${b} ${it.n}.`, `${y} has ${F(b)} ${more ? 'more' : 'fewer'} than ${x}.`),
      ask: more ? L(`Bạn nào có nhiều ${it.n} hơn?`, `Who has more ${it.p}?`) : L(`Bạn nào có ít ${it.n} hơn?`, `Who has fewer ${it.p}?`),
      vi: `${x} có ${a} ${it.n}. ${y} có ${more ? 'nhiều' : 'ít'} hơn ${x} ${b} ${it.n}. Hỏi ${y} có bao nhiêu ${it.n}?`,
      en: `${x} has ${pE(a, it)}. ${y} has ${F(b)} ${more ? 'more' : 'fewer'} than ${x}. How many ${it.p} does ${y} have?`,
      key: more ? L('nhiều hơn', 'more') : L('ít hơn', 'fewer'), who: y, other: x, sol: L(`Số ${it.n} của ${y} là`, `${y}'s ${it.p}`) };
  }
  // one-step kg / l problems. f: 0 add, 1 take away, 2 heavier / more, 3 lighter / less
  function kgStory(rng, kg, f, a, b) {
    const u = kg ? 'kg' : 'l', uw = kg ? L('ki-lô-gam', 'kilograms') : L('lít', 'litres');
    const s = kg ? [
      { vi: `Bao gạo nặng ${a} kg, bao ngô nặng ${b} kg. Hỏi cả hai bao nặng bao nhiêu ki-lô-gam?`, en: `A sack of rice weighs ${a} kg and a sack of maize weighs ${b} kg. How many kilograms do the two sacks weigh altogether?`, sol: L('Cả hai bao nặng là', 'Weight of the two sacks') },
      { vi: `Cửa hàng có ${a} kg gạo, đã bán ${b} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, en: `A shop has ${a} kg of rice and sells ${b} kg. How many kilograms of rice does the shop have left?`, sol: L('Số gạo còn lại là', 'Rice left') },
      { vi: `Con dê nặng ${a} kg. Con lợn nặng hơn con dê ${b} kg. Hỏi con lợn nặng bao nhiêu ki-lô-gam?`, en: `A goat weighs ${a} kg. A pig is ${b} kg heavier than the goat. How many kilograms does the pig weigh?`, sol: L('Con lợn nặng là', 'Weight of the pig') },
      { vi: `Bao gạo nặng ${a} kg. Bao đỗ nhẹ hơn bao gạo ${b} kg. Hỏi bao đỗ nặng bao nhiêu ki-lô-gam?`, en: `A sack of rice weighs ${a} kg. A sack of beans is ${b} kg lighter than the sack of rice. How many kilograms does the sack of beans weigh?`, sol: L('Bao đỗ nặng là', 'Weight of the sack of beans') },
    ] : [
      { vi: `Thùng thứ nhất đựng ${a} l nước mắm, thùng thứ hai đựng ${b} l nước mắm. Hỏi cả hai thùng đựng bao nhiêu lít nước mắm?`, en: `The first barrel holds ${a} l of fish sauce and the second barrel holds ${b} l. How many litres of fish sauce do the two barrels hold altogether?`, sol: L('Cả hai thùng đựng là', 'The two barrels hold') },
      { vi: `Thùng có ${a} l dầu, đã rót ra ${b} l. Hỏi trong thùng còn lại bao nhiêu lít dầu?`, en: `A barrel has ${a} l of oil. ${b} l is poured out. How many litres of oil are left in the barrel?`, sol: L('Số dầu còn lại là', 'Oil left') },
      { vi: `Thùng nhỏ đựng ${a} l nước. Thùng to đựng nhiều hơn thùng nhỏ ${b} l nước. Hỏi thùng to đựng bao nhiêu lít nước?`, en: `The small tank holds ${a} l of water. The big tank holds ${b} l more than the small tank. How many litres of water does the big tank hold?`, sol: L('Thùng to đựng là', 'The big tank holds') },
      { vi: `Buổi sáng cửa hàng bán được ${a} l sữa. Buổi chiều bán được ít hơn buổi sáng ${b} l sữa. Hỏi buổi chiều cửa hàng bán được bao nhiêu lít sữa?`, en: `A shop sells ${a} l of milk in the morning. In the afternoon it sells ${b} l less than in the morning. How many litres of milk does it sell in the afternoon?`, sol: L('Buổi chiều bán được là', 'Milk sold in the afternoon') },
    ];
    return Object.assign({ u, uw, add: f === 0 || f === 2 }, s[f]);
  }

  // "Mỗi … có n …": groups for the 2 and 5 times tables. q(k): the question for k groups
  const MUL = [
    { n: 2, e: '🐔', what: ['chân', 'legs'], per: ['Mỗi con gà có 2 chân.', 'Each chicken has 2 legs.'], g: k => L(`${k} con gà`, `${k} chickens`), q: k => L(`Hỏi ${k} con gà có bao nhiêu chân?`, `How many legs do ${k} chickens have?`), sol: k => L(`Số chân của ${k} con gà là`, `Legs of ${k} chickens`) },
    { n: 2, e: '🥢', what: ['chiếc đũa', 'chopsticks'], per: ['Mỗi đôi đũa có 2 chiếc đũa.', 'Each pair of chopsticks has 2 chopsticks.'], g: k => L(`${k} đôi đũa`, `${k} pairs`), q: k => L(`Hỏi ${k} đôi đũa có bao nhiêu chiếc đũa?`, `How many chopsticks are there in ${k} pairs?`), sol: k => L(`Số chiếc đũa của ${k} đôi đũa là`, `Chopsticks in ${k} pairs`) },
    { n: 2, e: '🚲', what: ['bánh xe', 'wheels'], per: ['Mỗi xe đạp có 2 bánh xe.', 'Each bicycle has 2 wheels.'], g: k => L(`${k} xe đạp`, `${k} bicycles`), q: k => L(`Hỏi ${k} xe đạp có bao nhiêu bánh xe?`, `How many wheels do ${k} bicycles have?`), sol: k => L(`Số bánh xe của ${k} xe đạp là`, `Wheels of ${k} bicycles`) },
    { n: 2, e: '📘', what: ['quyển vở', 'exercise books'], per: ['Mỗi bạn được phát 2 quyển vở.', 'Each child is given 2 exercise books.'], g: k => L(`${k} bạn`, `${k} children`), q: k => L(`Hỏi ${k} bạn được phát bao nhiêu quyển vở?`, `How many exercise books are ${k} children given?`), sol: k => L(`Số quyển vở của ${k} bạn là`, `Exercise books for ${k} children`) },
    { n: 5, e: '🖐️', what: ['ngón tay', 'fingers'], per: ['Mỗi bàn tay có 5 ngón tay.', 'Each hand has 5 fingers.'], g: k => L(`${k} bàn tay`, `${k} hands`), q: k => L(`Hỏi ${k} bàn tay có bao nhiêu ngón tay?`, `How many fingers do ${k} hands have?`), sol: k => L(`Số ngón tay của ${k} bàn tay là`, `Fingers of ${k} hands`) },
    { n: 5, e: '🍊', what: ['quả cam', 'oranges'], per: ['Mỗi đĩa có 5 quả cam.', 'Each plate has 5 oranges.'], g: k => L(`${k} đĩa`, `${k} plates`), q: k => L(`Hỏi ${k} đĩa như thế có bao nhiêu quả cam?`, `How many oranges are there on ${k} plates like this?`), sol: k => L(`Số quả cam của ${k} đĩa là`, `Oranges on ${k} plates`) },
    { n: 5, e: '🌸', what: ['bông hoa', 'flowers'], per: ['Mỗi lọ hoa có 5 bông hoa.', 'Each vase has 5 flowers.'], g: k => L(`${k} lọ hoa`, `${k} vases`), q: k => L(`Hỏi ${k} lọ hoa như thế có bao nhiêu bông hoa?`, `How many flowers are there in ${k} vases like this?`), sol: k => L(`Số bông hoa của ${k} lọ hoa là`, `Flowers in ${k} vases`) },
    { n: 5, e: '🥮', what: ['cái bánh', 'cakes'], per: ['Mỗi hộp có 5 cái bánh.', 'Each box has 5 cakes.'], g: k => L(`${k} hộp`, `${k} boxes`), q: k => L(`Hỏi ${k} hộp như thế có bao nhiêu cái bánh?`, `How many cakes are there in ${k} boxes like this?`), sol: k => L(`Số cái bánh của ${k} hộp là`, `Cakes in ${k} boxes`) },
  ];
  // division stories for p = n × k. share: p things into n equal parts (each part?); group: parts of n (how many parts?)
  const DIV_SHARE = [
    { e: '🍬', u: ['cái kẹo', 'sweets'], part: ['bạn', 'child'], vi: (p, n) => `Có ${p} cái kẹo chia đều cho ${n} bạn. Hỏi mỗi bạn được mấy cái kẹo?`, en: (p, n) => `${p} sweets are shared equally between ${n} children. How many sweets does each child get?`, sol: L('Mỗi bạn được số kẹo là', 'Sweets for each child') },
    { e: '📘', u: ['quyển vở', 'exercise books'], part: ['bạn', 'child'], vi: (p, n) => `Cô giáo chia đều ${p} quyển vở cho ${n} bạn. Hỏi mỗi bạn được mấy quyển vở?`, en: (p, n) => `The teacher shares ${p} exercise books equally between ${n} children. How many exercise books does each child get?`, sol: L('Mỗi bạn được số vở là', 'Exercise books for each child') },
    { e: '🍊', u: ['quả cam', 'oranges'], part: ['đĩa', 'plate'], vi: (p, n) => `Có ${p} quả cam xếp đều vào ${n} đĩa. Hỏi mỗi đĩa có mấy quả cam?`, en: (p, n) => `${p} oranges are put equally onto ${n} plates. How many oranges are on each plate?`, sol: L('Mỗi đĩa có số cam là', 'Oranges on each plate') },
    { e: '🌸', u: ['bông hoa', 'flowers'], part: ['lọ', 'vase'], vi: (p, n) => `Có ${p} bông hoa cắm đều vào ${n} lọ. Hỏi mỗi lọ có mấy bông hoa?`, en: (p, n) => `${p} flowers are put equally into ${n} vases. How many flowers are in each vase?`, sol: L('Mỗi lọ có số hoa là', 'Flowers in each vase') },
  ];
  const DIV_GROUP = [
    { e: '🍊', u: ['đĩa', 'plates'], vi: (p, n) => `Có ${p} quả cam, xếp vào mỗi đĩa ${n} quả. Hỏi xếp được mấy đĩa cam?`, en: (p, n) => `There are ${p} oranges. ${n} oranges go on each plate. How many plates of oranges are there?`, each: n => L(`Mỗi đĩa xếp ${n} quả cam`, `${n} oranges on each plate`), sol: L('Số đĩa cam xếp được là', 'Plates of oranges') },
    { e: '🧒', u: ['hàng', 'rows'], vi: (p, n) => `Có ${p} bạn xếp hàng, mỗi hàng ${n} bạn. Hỏi các bạn xếp được mấy hàng?`, en: (p, n) => `${p} children line up with ${n} children in each row. How many rows are there?`, each: n => L(`Mỗi hàng có ${n} bạn`, `${n} children in each row`), sol: L('Số hàng xếp được là', 'Rows') },
    { e: '🥮', u: ['hộp', 'boxes'], vi: (p, n) => `Có ${p} cái bánh, xếp vào mỗi hộp ${n} cái. Hỏi xếp được mấy hộp bánh?`, en: (p, n) => `There are ${p} cakes. ${n} cakes go in each box. How many boxes of cakes are there?`, each: n => L(`Mỗi hộp xếp ${n} cái bánh`, `${n} cakes in each box`), sol: L('Số hộp bánh xếp được là', 'Boxes of cakes') },
    { e: '🌸', u: ['bó', 'bunches'], vi: (p, n) => `Có ${p} bông hoa, bó thành các bó, mỗi bó ${n} bông. Hỏi bó được mấy bó hoa?`, en: (p, n) => `There are ${p} flowers. They are tied in bunches of ${n}. How many bunches are there?`, each: n => L(`Mỗi bó có ${n} bông hoa`, `${n} flowers in each bunch`), sol: L('Số bó hoa bó được là', 'Bunches of flowers') },
  ];

  // 13 giờ … 24 giờ: the part of the day as the SGK names it
  const part = h => (h <= 18 ? L('chiều', 'in the afternoon') : h <= 21 ? L('tối', 'in the evening') : L('đêm', 'at night'));
  const EVENTS = [
    { hs: [16, 17], vi: w => `${w} tan học`, en: w => `${w} finishes school` }, { hs: [17, 18], vi: () => 'Mẹ đi làm về', en: () => 'Mum gets home from work' },
    { hs: [18, 19], vi: () => 'Cả nhà ăn cơm tối', en: () => 'The family has dinner' }, { hs: [14, 15], vi: w => `${w} tập đàn`, en: w => `${w} practises the piano` },
    { hs: [19, 20], vi: () => 'Chương trình hoạt hình bắt đầu', en: () => 'The cartoon starts' }, { hs: [21, 22], vi: w => `${w} đi ngủ`, en: w => `${w} goes to bed` },
    { hs: [13, 14], vi: w => `${w} ngủ trưa dậy`, en: w => `${w} wakes up from a nap` }, { hs: [15, 16], vi: w => `${w} đi đá bóng`, en: w => `${w} goes to play football` },
  ];
  const timeEN = (h, m) => (m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}` : `${h}:${String(m).padStart(2, '0')}`);
  const timeStr = (h, m) => (U.EN ? timeEN(h, m) : m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`);
  const D = L('đồng', 'dong');
  const PLACE = [L('Hàng trăm', 'The hundreds'), L('Hàng chục', 'The tens'), L('Hàng đơn vị', 'The ones')];

  DT.add(2, [
    // ================= HỌC KÌ I =================
    {
      id: 'g2-dt-hon-kem', sem: 1, icon: '📊', lesson: 'g2-c1-b4',
      title: L('Hơn, kém nhau bao nhiêu', 'How many more? How many fewer?'),
      spot: L('Bài toán cho hai số và hỏi: “… nhiều hơn … bao nhiêu?”, “… ít hơn … bao nhiêu?” hoặc “… hơn (kém) … bao nhiêu đơn vị?”.', 'The problem gives two numbers and asks: "How many more … than …?", "How many fewer …?" or "How much more (less) is … than …?".'),
      steps: [
        L('Bước 1: Tìm số lớn và số bé.', 'Step 1: Find the greater number and the smaller number.'),
        L('Bước 2: Lấy số lớn trừ đi số bé.', 'Step 2: Take the smaller number away from the greater number.'),
        L('Bước 3: Viết câu lời giải, phép tính và đáp số.', 'Step 3: Write the answer sentence, the calculation and the answer.'),
      ],
      tip: L('Thấy chữ “nhiều hơn” đừng vội cộng. Hỏi hơn, kém nhau bao nhiêu thì luôn làm phép trừ.', 'Do not add just because you see "more". To find how many more or fewer, always subtract.'),
      guide: rng => {
        const [a, b] = sub2(rng), d = a - b, more = R(rng, 0, 1) === 1, st = cmpStory(rng, a, b, more);
        return G(L(st.vi, st.en), [
          step(L(`Trong bài toán, số nào lớn hơn: ${a} hay ${b}?`, `In the problem, which number is greater: ${a} or ${b}?`), ch(rng, a, [b]), L(`Số lớn là ${a}, số bé là ${b}.`, `The greater number is ${a} and the smaller number is ${b}.`)),
          step(L('Muốn biết hơn, kém nhau bao nhiêu, em chọn phép tính nào?', 'To find how many more or fewer, which calculation do you choose?'), ch(rng, `${a} ${M} ${b}`, [`${a} + ${b}`]), L(`Ta lấy số lớn trừ số bé: ${a} ${M} ${b}.`, `We take the smaller number away from the greater: ${a} ${M} ${b}.`), L('Hơn, kém nhau bao nhiêu: lấy số lớn trừ số bé.', 'How many more or fewer: take the smaller number away from the greater.')),
          step(`${a} ${M} ${b} = ?`, num(d), `${a} ${M} ${b} = ${d} (${st.u(d)}).`, L('Trừ hàng đơn vị trước, hàng chục sau.', 'Subtract the ones first, then the tens.')),
        ], L(`Đáp số: ${d} ${st.u(d)}.`, `Answer: ${d} ${st.u(d)}.`), tapeDiff(st.la, a, st.lb, b, '?'));
      },
      practice: (rng, i) => {
        const hint = L('Lấy số lớn trừ số bé.', 'Take the smaller number away from the greater.');
        if (i < 4 || i === 4) {
          const [a, b] = i < 2 ? [R(rng, 6, 10), R(rng, 2, 5)] : sub2(rng), d = a - b, st = cmpStory(rng, a, b, i !== 4 && i !== 3, i < 2 ? 0 : null);
          return Q(L(st.vi, st.en), num(d, st.u(d)), `${a} ${M} ${b} = ${d} (${st.u(d)}).`, { hint, visual: tapeDiff(st.la, a, st.lb, b, '?') });
        }
        if (i === 5) {
          const [a, b] = sub2(rng), d = a - b, k = R(rng, 0, 1) === 1;
          return Q(k ? L(`${a} hơn ${b} bao nhiêu đơn vị?`, `How much more than ${b} is ${a}?`) : L(`${b} kém ${a} bao nhiêu đơn vị?`, `How much less than ${a} is ${b}?`), num(d), L(`${a} ${M} ${b} = ${d}. Vậy ${a} hơn ${b} là ${d} đơn vị.`, `${a} ${M} ${b} = ${d}. So ${a} is ${d} more than ${b}.`), { hint, visual: tapeDiff(String(a), a, String(b), b, '?') });
        }
        if (i === 6) {
          const a = R(rng, 31, 45), b = R(rng, 28, a - 2), d = a - b, x = DT.name(rng), dad = R(rng, 0, 1) === 1;
          return Q(dad ? L(`Năm nay bố của ${x} ${a} tuổi, mẹ của ${x} ${b} tuổi. Hỏi bố hơn mẹ bao nhiêu tuổi?`, `This year ${x}'s dad is ${a} years old and ${x}'s mum is ${b}. How many years older is Dad than Mum?`) : L(`Năm nay bố của ${x} ${a} tuổi, mẹ của ${x} ${b} tuổi. Hỏi mẹ kém bố bao nhiêu tuổi?`, `This year ${x}'s dad is ${a} years old and ${x}'s mum is ${b}. How many years younger is Mum than Dad?`), num(d, L('tuổi', d === 1 ? 'year' : 'years')), L(`${a} ${M} ${b} = ${d} (tuổi).`, `${a} ${M} ${b} = ${d} (${d === 1 ? 'year' : 'years'}).`), { hint, visual: tapeDiff(L('Bố', 'Dad'), a, L('Mẹ', 'Mum'), b, '?') });
        }
        // the hardest: subtraction with borrowing (end of học kì I), measures, and the bigger number mentioned last
        const [a, b] = borrow2(rng), d = a - b, f = i - 7;
        if (f === 0) return Q(L(`Sợi dây xanh dài ${b} cm, sợi dây đỏ dài ${a} cm. Hỏi sợi dây nào dài hơn và dài hơn bao nhiêu xăng-ti-mét?`, `The blue string is ${b} cm long and the red string is ${a} cm long. Which string is longer, and by how many centimetres?`), ch(rng, L(`Dây đỏ, dài hơn ${d} cm`, `The red one, by ${d} cm`), [L(`Dây xanh, dài hơn ${d} cm`, `The blue one, by ${d} cm`), L(`Dây đỏ, dài hơn ${a + b} cm`, `The red one, by ${a + b} cm`), L(`Dây đỏ, dài hơn ${d + 10} cm`, `The red one, by ${d + 10} cm`)]), L(`${a} > ${b} nên dây đỏ dài hơn. ${a} ${M} ${b} = ${d} (cm).`, `${a} > ${b}, so the red string is longer. ${a} ${M} ${b} = ${d} (cm).`), { hint, visual: tapeDiff(L('Xanh', 'Blue'), b, L('Đỏ', 'Red'), a, '?') });
        if (f === 1) return Q(L(`Bao ngô nặng ${b} kg, bao gạo nặng ${a} kg. Hỏi bao ngô nhẹ hơn bao gạo bao nhiêu ki-lô-gam?`, `A sack of maize weighs ${b} kg and a sack of rice weighs ${a} kg. How many kilograms lighter is the sack of maize?`), num(d, 'kg'), L(`Số lớn là ${a}, số bé là ${b}: ${a} ${M} ${b} = ${d} (kg).`, `The greater number is ${a} and the smaller is ${b}: ${a} ${M} ${b} = ${d} (kg).`), { hint, visual: tapeDiff(L('Ngô', 'Maize'), b, L('Gạo', 'Rice'), a, '?') });
        const st = cmpStory(rng, a, b, R(rng, 0, 1) === 1);
        return Q(L(st.vi, st.en), num(d, st.u(d)), `${a} ${M} ${b} = ${d} (${st.u(d)}).`, { hint, visual: tapeDiff(st.la, a, st.lb, b, '?') });
      },
    },

    {
      id: 'g2-dt-them-bot', sem: 1, icon: '🎈', lesson: 'g2-c2-b9',
      title: L('Bài toán về thêm, bớt một số đơn vị', 'Word problems: adding more, taking away'),
      spot: L('Bài toán cho biết lúc đầu có bao nhiêu, rồi thêm vào (cho thêm, mua thêm) hoặc bớt đi (cho đi, bán đi, lấy ra) một số đơn vị.', 'The problem tells you how many there are at first, and then some more are added (given, bought) or some are taken away (given away, sold, taken out).'),
      steps: [
        L('Bước 1: Tóm tắt: Có bao nhiêu? Thêm (hay bớt) bao nhiêu? Hỏi gì?', 'Step 1: Sum up: How many at first? How many more (or fewer)? What is asked?'),
        L('Bước 2: Thêm thì làm phép cộng. Bớt thì làm phép trừ.', 'Step 2: Adding more means add. Taking away means subtract.'),
        L('Bước 3: Viết câu lời giải, phép tính có đơn vị trong ngoặc, rồi viết đáp số.', 'Step 3: Write the answer sentence, the calculation with its unit in brackets, then the answer.'),
      ],
      tip: L('Đừng thấy hai số là cộng. Em đọc câu hỏi: “có tất cả” thì cộng, “còn lại” thì trừ.', 'Do not add just because there are two numbers. Read the question: "altogether" means add, "left" means subtract.'),
      guide: rng => {
        const add = R(rng, 0, 1) === 1, [a, b] = add ? addOver10(rng) : subOver10(rng), r = add ? a + b : a - b, op = add ? '+' : M, st = tbStory(rng, add, a, b), it = st.it;
        const more = L('Thêm vào', 'Some more are added'), less = L('Bớt đi', 'Some are taken away');
        return G(L(st.vi, st.en), [
          step(L(`Lúc đầu có ${a} ${it.n}. Sau đó là thêm vào hay bớt đi?`, `At first there are ${pE(a, it)}. Then are some more added, or are some taken away?`), ch(rng, add ? more : less, [add ? less : more]),
            add ? L(`Tóm tắt: Có: ${a} ${it.n}. Thêm: ${b} ${it.n}. Có tất cả: … ${it.n}?`, `Summary: At first: ${a}. More: ${b}. Altogether: … ${it.p}?`) : L(`Tóm tắt: Có: ${a} ${it.n}. Bớt: ${b} ${it.n}. Còn lại: … ${it.n}?`, `Summary: At first: ${a}. Taken away: ${b}. Left: … ${it.p}?`)),
          step(add ? L('Thêm vào thì em chọn phép tính nào?', 'Some more are added. Which calculation do you choose?') : L('Bớt đi thì em chọn phép tính nào?', 'Some are taken away. Which calculation do you choose?'), ch(rng, `${a} ${op} ${b}`, [add ? `${Math.max(a, b)} ${M} ${Math.min(a, b)}` : `${a} + ${b}`]), add ? L(`Thêm thì làm phép cộng: ${a} + ${b}.`, `Adding more means add: ${a} + ${b}.`) : L(`Bớt thì làm phép trừ: ${a} ${M} ${b}.`, `Taking away means subtract: ${a} ${M} ${b}.`)),
          step(`${a} ${op} ${b} = ?`, num(r), `${a} ${op} ${b} = ${r} (${st.u(r)}).`, add ? L(`Tách ${b} để ${a} tròn 10 rồi cộng tiếp.`, `Split ${b} to make ${a} up to 10, then add the rest.`) : L(`Trừ để còn 10 trước, rồi trừ tiếp.`, 'Subtract down to 10 first, then subtract the rest.')),
        ], L(`Đáp số: ${r} ${st.u(r)}.`, `Answer: ${r} ${st.u(r)}.`), add ? vz('objects', { groups: [{ emoji: it.e, count: a }, { emoji: it.e, count: b }] }) : vz('objects', { groups: [{ emoji: it.e, count: a }], crossOut: b }));
      },
      practice: (rng, i) => {
        const hA = L('Thêm thì làm phép cộng.', 'Adding more means add.'), hS = L('Bớt đi thì làm phép trừ.', 'Taking away means subtract.');
        if (i < 7) {
          const add = i % 2 === 0, [a, b] = i < 4 ? (add ? addOver10(rng) : subOver10(rng)) : (add ? carry2(rng) : borrow2(rng)), r = add ? a + b : a - b, op = add ? '+' : M, st = tbStory(rng, add, a, b, i < 4 ? null : 2);
          const vis = i < 4 ? (add ? vz('objects', { groups: [{ emoji: st.it.e, count: a }, { emoji: st.it.e, count: b }] }) : vz('objects', { groups: [{ emoji: st.it.e, count: a }], crossOut: b })) : col(a, b, op);
          if (i === 3 || i === 6) return Q(L(st.vi, st.en) + L('\nEm chọn phép tính giải bài toán:', '\nChoose the calculation that solves the problem:'), ch(rng, `${a} ${op} ${b} = ${r}`, [add ? `${Math.max(a, b)} ${M} ${Math.min(a, b)} = ${Math.abs(a - b)}` : `${a} + ${b} = ${a + b}`, `${a} ${op} ${b} = ${r + 1}`]), `${a} ${op} ${b} = ${r} (${st.u(r)}).`, { hint: add ? hA : hS, visual: vis });
          return Q(L(st.vi, st.en), num(r, st.u(r)), `${a} ${op} ${b} = ${r} (${st.u(r)}).`, { hint: add ? hA : hS, visual: vis });
        }
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-lit-kg']); if (q) return q; }
        const it = P(rng, IT);   // the question turned round, in a shop (big numbers)
        if (i === 7) {
          const [r, b] = carry2(rng), a = r + b;   // had some, gave b away, r left → at first r + b
          return Q(L(`Cửa hàng có một số ${it.n}. Sau khi bán ${b} ${it.n}, cửa hàng còn lại ${r} ${it.n}. Hỏi lúc đầu cửa hàng có bao nhiêu ${it.n}?`, `A shop has some ${it.p}. After selling ${F(b)}, it has ${F(r)} left. How many ${it.p} did the shop have at first?`), num(a, un(it, a)), L(`Lúc đầu cửa hàng có nhiều hơn lúc sau. Số ${it.n} lúc đầu là: ${r} + ${b} = ${a} (${it.n}).`, `The shop had more at first than at the end. At first: ${r} + ${b} = ${a} (${it.p}).`), { hint: L('Lúc đầu = số còn lại + số đã bán.', 'At first = what is left + what was sold.'), visual: vz('tape', { bars: [{ label: L('Còn lại', 'Left'), units: units(r, a), value: F(r) }, { label: L('Đã bán', 'Sold'), units: units(b, a), value: F(b) }], total: '?' }) });
        }
        const [s, a] = borrow2(rng), b = s - a;    // had a, got some more, now s → got s − a
        return Q(L(`Cửa hàng có ${a} ${it.n}. Sau khi nhập thêm một số ${it.n}, cửa hàng có tất cả ${s} ${it.n}. Hỏi cửa hàng đã nhập thêm bao nhiêu ${it.n}?`, `A shop has ${pE(a, it)}. After it gets some more, it has ${F(s)} altogether. How many ${it.p} did the shop get?`), num(b, un(it, b)), L(`Số ${it.n} nhập thêm là: ${s} ${M} ${a} = ${b} (${it.n}).`, `The shop got: ${s} ${M} ${a} = ${b} (${it.p}).`), { hint: L('Số nhập thêm = số có tất cả − số lúc đầu.', 'What was added = the total − what there was at first.'), visual: vz('tape', { bars: [{ label: L('Lúc đầu', 'At first'), units: units(a, s), value: F(a) }, { label: L('Nhập thêm', 'More'), units: units(b, s), value: '?' }], total: F(s) }) });
      },
    },

    {
      id: 'g2-dt-nhieu-hon', sem: 1, icon: '📈', lesson: 'g2-c2-b13',
      title: L('Bài toán về nhiều hơn', 'Word problems: more than'),
      spot: L('Bài toán cho biết số thứ nhất, cho biết số thứ hai nhiều hơn (dài hơn, nặng hơn, hơn tuổi) số thứ nhất bao nhiêu, rồi hỏi số thứ hai.', 'The problem gives the first amount, tells you how much more (longer, heavier, older) the second one is, and asks for the second amount.'),
      steps: [
        L('Bước 1: Tìm xem ai (cái gì) có nhiều hơn, và nhiều hơn bao nhiêu.', 'Step 1: Find who (or what) has more, and how many more.'),
        L('Bước 2: Số cần tìm = số đã biết + phần nhiều hơn.', 'Step 2: The amount to find = the amount you know + the extra part.'),
        L('Bước 3: Viết câu lời giải, phép tính và đáp số.', 'Step 3: Write the answer sentence, the calculation and the answer.'),
      ],
      tip: L('Em vẽ sơ đồ đoạn thẳng: đoạn của bạn nhiều hơn dài hơn. Đoạn dài = đoạn ngắn + phần hơn.', 'Draw a bar model: the one with more has the longer bar. Longer bar = shorter bar + the extra part.'),
      guide: rng => {
        const f = R(rng, 0, 3), [a, b] = f === 3 ? [R(rng, 6, 9), R(rng, 2, 9)] : addOver10(rng), r = a + b, st = moreStory(rng, true, a, b, f);
        return G(L(st.vi, st.en), [
          step(st.ask, ch(rng, st.who, [st.other]), st.cmpS + L(` Số cần tìm lớn hơn ${a}.`, ` The amount to find is greater than ${a}.`), L(`Tìm chữ “${st.key}” trong bài toán.`, `Find the word "${st.key}" in the problem.`)),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} + ${b}`, [`${Math.max(a, b)} ${M} ${Math.min(a, b)}`]), L(`Nhiều hơn thì làm phép cộng: ${a} + ${b}.`, `"More than" means add: ${a} + ${b}.`), L('Số lớn = số bé + phần hơn.', 'Greater amount = smaller amount + the extra part.')),
          step(`${a} + ${b} = ?`, num(r), `${st.sol}: ${a} + ${b} = ${r} (${st.u(r)}).`),
        ], L(`Đáp số: ${r} ${st.u(r)}.`, `Answer: ${r} ${st.u(r)}.`), tapeMore(st.la, a, st.lb, r, b));
      },
      practice: (rng, i) => {
        const hint = L('Nhiều hơn thì làm phép cộng.', '"More than" means add.');
        if (i < 9) {
          const f = i < 4 ? 0 : i === 4 ? 1 : i === 5 ? 2 : i === 6 ? 3 : R(rng, 0, 2);
          const [a, b] = f === 3 ? [R(rng, 6, 9), R(rng, 2, 9)] : i < 2 ? addOver10(rng) : i < 7 ? add2(rng) : carry2(rng), r = a + b, st = moreStory(rng, true, a, b, f);
          if (i === 3) return Q(L(st.vi, st.en) + L('\nEm chọn phép tính giải bài toán:', '\nChoose the calculation that solves the problem:'), ch(rng, `${a} + ${b} = ${r}`, [`${Math.max(a, b)} ${M} ${Math.min(a, b)} = ${Math.abs(a - b)}`, `${a} + ${b} = ${r + 10}`]), `${st.sol}: ${a} + ${b} = ${r} (${st.u(r)}).`, { hint, visual: tapeMore(st.la, a, st.lb, r, b) });
          return Q(L(st.vi, st.en), num(r, st.u(r)), `${st.sol}: ${a} + ${b} = ${r} (${st.u(r)}).`, { hint, visual: tapeMore(st.la, a, st.lb, r, b) });
        }
        const q = DT.bank(rng, ['g2-nc-hon-kem']); if (q) return q;
        const [a, b] = carry2(rng), st = moreStory(rng, true, a, b, 0);
        return Q(L(st.vi, st.en), num(a + b, st.u(a + b)), `${st.sol}: ${a} + ${b} = ${a + b} (${st.u(a + b)}).`, { hint });
      },
    },

    {
      id: 'g2-dt-it-hon', sem: 1, icon: '📉', lesson: 'g2-c2-b13',
      title: L('Bài toán về ít hơn', 'Word problems: fewer than'),
      spot: L('Bài toán cho biết số thứ nhất, cho biết số thứ hai ít hơn (ngắn hơn, nhẹ hơn, kém tuổi) số thứ nhất bao nhiêu, rồi hỏi số thứ hai.', 'The problem gives the first amount, tells you how much less (shorter, lighter, younger) the second one is, and asks for the second amount.'),
      steps: [
        L('Bước 1: Tìm xem ai (cái gì) có ít hơn, và ít hơn bao nhiêu.', 'Step 1: Find who (or what) has fewer, and how many fewer.'),
        L('Bước 2: Số cần tìm = số đã biết − phần ít hơn.', 'Step 2: The amount to find = the amount you know − the missing part.'),
        L('Bước 3: Viết câu lời giải, phép tính và đáp số.', 'Step 3: Write the answer sentence, the calculation and the answer.'),
      ],
      tip: L('Đọc kĩ xem ai ít hơn ai. “Lan ít hơn Hà 4 cái” nghĩa là số của Lan = số của Hà − 4.', 'Read carefully who has fewer. "Lan has 4 fewer than Hà" means Lan\'s number = Hà\'s number − 4.'),
      guide: rng => {
        const f = R(rng, 0, 3), [a, b] = f === 3 ? [R(rng, 8, 12), R(rng, 2, 5)] : subOver10(rng), r = a - b, st = moreStory(rng, false, a, b, f);
        return G(L(st.vi, st.en), [
          step(st.ask, ch(rng, st.who, [st.other]), st.cmpS + L(` Số cần tìm bé hơn ${a}.`, ` The amount to find is less than ${a}.`), L(`Tìm chữ “${st.key}” trong bài toán.`, `Find the word "${st.key}" in the problem.`)),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} ${M} ${b}`, [`${a} + ${b}`]), L(`Ít hơn thì làm phép trừ: ${a} ${M} ${b}.`, `"Fewer than" means subtract: ${a} ${M} ${b}.`), L('Số bé = số lớn − phần ít hơn.', 'Smaller amount = greater amount − the missing part.')),
          step(`${a} ${M} ${b} = ?`, num(r), `${st.sol}: ${a} ${M} ${b} = ${r} (${st.u(r)}).`),
        ], L(`Đáp số: ${r} ${st.u(r)}.`, `Answer: ${r} ${st.u(r)}.`), tapeMore(st.la, a, st.lb, r, b));
      },
      practice: (rng, i) => {
        const hint = L('Ít hơn thì làm phép trừ.', '"Fewer than" means subtract.');
        if (i < 9) {
          const f = i < 4 ? 0 : i === 4 ? 1 : i === 5 ? 2 : i === 6 ? 3 : R(rng, 0, 2);
          const [a, b] = f === 3 ? [R(rng, 8, 12), R(rng, 2, 5)] : i < 2 ? subOver10(rng) : i < 7 ? sub2(rng) : borrow2(rng), r = a - b, st = moreStory(rng, false, a, b, f);
          if (i === 3) return Q(L(st.vi, st.en) + L('\nEm chọn phép tính giải bài toán:', '\nChoose the calculation that solves the problem:'), ch(rng, `${a} ${M} ${b} = ${r}`, [`${a} + ${b} = ${a + b}`, `${a} ${M} ${b} = ${r + 10}`]), `${st.sol}: ${a} ${M} ${b} = ${r} (${st.u(r)}).`, { hint, visual: tapeMore(st.la, a, st.lb, r, b) });
          return Q(L(st.vi, st.en), num(r, st.u(r)), `${st.sol}: ${a} ${M} ${b} = ${r} (${st.u(r)}).`, { hint, visual: tapeMore(st.la, a, st.lb, r, b) });
        }
        const q = DT.bank(rng, ['g2-nc-hon-kem']); if (q) return q;
        const [a, b] = borrow2(rng), st = moreStory(rng, false, a, b, 0);
        return Q(L(st.vi, st.en), num(a - b, st.u(a - b)), `${st.sol}: ${a} ${M} ${b} = ${a - b} (${st.u(a - b)}).`, { hint });
      },
    },

    {
      id: 'g2-dt-kg-lit', sem: 1, icon: '⚖️', lesson: 'g2-c3-b15',
      title: L('Bài toán về ki-lô-gam và lít', 'Word problems with kilograms and litres'),
      spot: L('Bài toán có các số đo kèm đơn vị kg (vật nặng bao nhiêu) hoặc l (đựng bao nhiêu nước, dầu, sữa).', 'The numbers in the problem have a unit: kg (how heavy something is) or l (how much water, oil or milk).'),
      steps: [
        L('Bước 1: Đọc kĩ: gộp lại, nhiều hơn thì cộng; lấy ra, còn lại, ít hơn thì trừ.', 'Step 1: Read carefully: altogether or more means add; taken out, left or less means subtract.'),
        L('Bước 2: Tính như với các số thường.', 'Step 2: Calculate as with ordinary numbers.'),
        L('Bước 3: Viết đơn vị (kg hoặc l) sau kết quả và trong đáp số.', 'Step 3: Write the unit (kg or l) after the result and in the answer.'),
      ],
      tip: L('Đừng quên đơn vị. Viết “25 + 13 = 38 (kg)” và “Đáp số: 38 kg”.', 'Do not forget the unit. Write "25 + 13 = 38 (kg)" and "Answer: 38 kg".'),
      guide: rng => {
        const kg = R(rng, 0, 1) === 1, f = R(rng, 0, 3), add = f === 0 || f === 2, [a, b] = add ? add2(rng) : sub2(rng), r = add ? a + b : a - b, op = add ? '+' : M, st = kgStory(rng, kg, f, a, b);
        return G(L(st.vi, st.en), [
          step(L(`Số cần tìm lớn hơn hay bé hơn ${a} ${st.u}?`, `Is the amount to find more than or less than ${a} ${st.u}?`), ch(rng, add ? L('Lớn hơn', 'More') : L('Bé hơn', 'Less'), [add ? L('Bé hơn', 'Less') : L('Lớn hơn', 'More')]), add ? L('Số cần tìm lớn hơn nên ta làm phép cộng.', 'The amount to find is more, so we add.') : L('Số cần tìm bé hơn nên ta làm phép trừ.', 'The amount to find is less, so we subtract.'), L('Đọc lại câu hỏi của bài toán.', 'Read the question of the problem again.')),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} ${op} ${b}`, [add ? `${Math.max(a, b)} ${M} ${Math.min(a, b)}` : `${a} + ${b}`]), L(`Phép tính: ${a} ${op} ${b}.`, `The calculation: ${a} ${op} ${b}.`)),
          step(`${a} ${op} ${b} = ?`, num(r), `${st.sol}: ${a} ${op} ${b} = ${r} (${st.u}).`),
          step(L(`Sau số ${r}, em viết đơn vị nào?`, `Which unit do you write after ${r}?`), ch(rng, st.u, [kg ? 'l' : 'kg', 'cm']), kg ? L('Cân nặng đo bằng ki-lô-gam, viết là kg.', 'Weight is measured in kilograms, written kg.') : L('Lượng nước, dầu, sữa đo bằng lít, viết là l.', 'Water, oil and milk are measured in litres, written l.')),
        ], L(`Đáp số: ${r} ${st.u}.`, `Answer: ${r} ${st.u}.`));
      },
      practice: (rng, i) => {
        if (i >= 7) { const q = DT.bank(rng, i === 7 ? ['g2-nc-can-dia'] : i === 8 ? ['g2-nc-lit-kg'] : ['g2-nc-can-dia', 'g2-nc-lit-kg']); if (q) return q; }
        const kg = i % 2 === 0, f = i < 2 ? 0 : i < 4 ? 1 : i === 4 ? 2 : i === 5 ? 3 : R(rng, 0, 3), add = f === 0 || f === 2;
        const [a, b] = i >= 6 ? (add ? carry2(rng) : borrow2(rng)) : add ? add2(rng) : sub2(rng), r = add ? a + b : a - b, op = add ? '+' : M, st = kgStory(rng, kg, f, a, b);
        return Q(L(st.vi, st.en), num(r, st.u), `${st.sol}: ${a} ${op} ${b} = ${r} (${st.u}).`, { hint: add ? L('Số cần tìm lớn hơn: làm phép cộng. Nhớ viết đơn vị.', 'The amount to find is more: add. Remember the unit.') : L('Số cần tìm bé hơn: làm phép trừ. Nhớ viết đơn vị.', 'The amount to find is less: subtract. Remember the unit.'), visual: f < 2 ? col(a, b, op) : tapeMore('', a, '', r, b) });
      },
    },

    {
      id: 'g2-dt-cong-co-nho', sem: 1, icon: '🧮', lesson: 'g2-c4-b20',
      title: L('Phép cộng có nhớ trong phạm vi 100', 'Adding to 100 with carrying'),
      spot: L('Phép cộng mà hàng đơn vị cộng lại được 10 hoặc hơn 10, ví dụ 38 + 27 (8 + 7 = 15).', 'An addition where the ones add up to 10 or more, for example 38 + 27 (8 + 7 = 15).'),
      steps: [
        L('Bước 1: Đặt tính: viết các chữ số cùng hàng thẳng cột.', 'Step 1: Set out the sum: write the digits in their columns.'),
        L('Bước 2: Cộng hàng đơn vị. Được 10 trở lên thì viết chữ số đơn vị, nhớ 1.', 'Step 2: Add the ones. If you get 10 or more, write the ones digit and carry 1.'),
        L('Bước 3: Cộng hàng chục rồi thêm 1 đã nhớ.', 'Step 3: Add the tens, then add the 1 you carried.'),
      ],
      tip: L('Lỗi hay gặp nhất là quên cộng 1 đã nhớ vào hàng chục. 38 + 27 = 65, không phải 55.', 'The most common mistake is forgetting to add the carried 1 to the tens. 38 + 27 = 65, not 55.'),
      guide: rng => {
        const one = R(rng, 0, 2) === 0, [a, b] = one ? pairWhere(rng, [15, 88], [3, 9], (x, y) => x % 10 + y >= 10, [47, 8]) : carry2(rng);
        const so = ones(a) + ones(b), t = tens(a) + tens(b) + 1, r = a + b;
        return G(L(`Đặt tính rồi tính:\n${a} + ${b}`, `Set out and calculate:\n${a} + ${b}`), [
          step(L(`Hàng đơn vị: ${ones(a)} + ${ones(b)} = ?`, `The ones: ${ones(a)} + ${ones(b)} = ?`), num(so), `${ones(a)} + ${ones(b)} = ${so}.`),
          step(L(`${so} có hai chữ số. Em viết thế nào?`, `${so} has two digits. What do you write?`), ch(rng, L(`Viết ${so % 10}, nhớ 1`, `Write ${so % 10}, carry 1`), [L(`Viết ${so}`, `Write ${so}`), L(`Viết 1, nhớ ${so % 10}`, `Write 1, carry ${so % 10}`)]), L(`Viết ${so % 10} ở hàng đơn vị, nhớ 1 sang hàng chục.`, `Write ${so % 10} in the ones column and carry 1 to the tens.`), L(`${so} gồm 1 chục và ${so % 10} đơn vị.`, `${so} is 1 ten and ${so % 10} ones.`)),
          step(one ? L(`Hàng chục: ${tens(a)} thêm 1 (nhớ) bằng mấy?`, `The tens: ${tens(a)} and the carried 1 make how many?`) : L(`Hàng chục: ${tens(a)} + ${tens(b)} = ${tens(a) + tens(b)}, thêm 1 (nhớ) bằng mấy?`, `The tens: ${tens(a)} + ${tens(b)} = ${tens(a) + tens(b)}. Add the carried 1. How many?`), num(t), one ? L(`${tens(a)} thêm 1 bằng ${t}, viết ${t}.`, `${tens(a)} and 1 make ${t}. Write ${t}.`) : L(`${tens(a)} + ${tens(b)} = ${tens(a) + tens(b)}, thêm 1 bằng ${t}, viết ${t}.`, `${tens(a)} + ${tens(b)} = ${tens(a) + tens(b)}, and 1 more is ${t}. Write ${t}.`), L('Đừng quên cộng 1 đã nhớ.', 'Do not forget the 1 you carried.')),
          step(L(`Vậy ${a} + ${b} = ?`, `So ${a} + ${b} = ?`), num(r), `${a} + ${b} = ${r}.`),
        ], L(`Đáp số: ${r}.`, `Answer: ${r}.`), col(a, b, '+'));
      },
      practice: (rng, i) => {
        const set = L('Đặt tính rồi tính:\n', 'Set out and calculate:\n'), hint = L('Cộng hàng đơn vị trước, nhớ 1 sang hàng chục.', 'Add the ones first and carry 1 to the tens.');
        const ex = (a, b) => (b < 10 ? L(`${ones(a)} + ${b} = ${ones(a) + b}, viết ${(a + b) % 10}, nhớ 1. ${tens(a)} thêm 1 bằng ${tens(a) + 1}. Vậy ${a} + ${b} = ${a + b}.`, `${ones(a)} + ${b} = ${ones(a) + b}: write ${(a + b) % 10}, carry 1. ${tens(a)} and 1 make ${tens(a) + 1}. So ${a} + ${b} = ${a + b}.`)
          : L(`${ones(a)} + ${ones(b)} = ${ones(a) + ones(b)}, viết ${(a + b) % 10}, nhớ 1. ${tens(a)} + ${tens(b)} = ${tens(a) + tens(b)}, thêm 1 bằng ${tens(a) + tens(b) + 1}. Vậy ${a} + ${b} = ${a + b}.`, `${ones(a)} + ${ones(b)} = ${ones(a) + ones(b)}: write ${(a + b) % 10}, carry 1. ${tens(a)} + ${tens(b)} = ${tens(a) + tens(b)}, and 1 more is ${tens(a) + tens(b) + 1}. So ${a} + ${b} = ${a + b}.`));
        if (i < 2) { const [a, b] = pairWhere(rng, [15, 88], [3, 9], (x, y) => x % 10 + y >= 10, [47, 8]); return Q(set + `${a} + ${b}`, num(a + b), ex(a, b), { hint, visual: col(a, b, '+') }); }
        if (i < 4) { const [a, b] = carry2(rng); return Q(set + `${a} + ${b}`, num(a + b), ex(a, b), { hint, visual: col(a, b, '+') }); }
        if (i === 4) { const [a, b] = carry2(rng); return Q(`${a} + ${b} = ?`, ch(rng, a + b, [a + b - 10, a + b + 10, a + b - 1]), ex(a, b), { hint, visual: col(a, b, '+') }); }
        if (i === 5) { const [a, b] = carry2(rng), w = DT.name(rng); return Q(L(`Bạn ${w} tính: ${a} + ${b} = ${a + b - 10}.\nBạn ấy quên nhớ. Kết quả đúng là bao nhiêu?`, `${w} worked out: ${a} + ${b} = ${a + b - 10}.\n${w} forgot to carry. What is the correct answer?`), num(a + b), ex(a, b), { hint: L('Kiểm tra lại hàng chục: đã thêm 1 nhớ chưa?', 'Check the tens again: was the carried 1 added?'), visual: col(a, b, '+') }); }
        if (i === 6) { const [a, b] = carry2(rng), st = tbStory(rng, true, a, b, 2); return Q(L(st.vi, st.en), num(a + b, st.u(a + b)), `${a} + ${b} = ${a + b} (${st.u(a + b)}).`, { hint, visual: col(a, b, '+') }); }
        if (i === 7) { const a = R(rng, 13, 87), a2 = a % 10 === 0 ? a + 4 : a, b = 100 - a2; return Q(set + `${a2} + ${b}`, num(100), L(`${ones(a2)} + ${ones(b)} = 10, viết 0, nhớ 1. ${tens(a2)} + ${tens(b)} = 9, thêm 1 bằng 10, viết 10. Vậy ${a2} + ${b} = 100.`, `${ones(a2)} + ${ones(b)} = 10: write 0, carry 1. ${tens(a2)} + ${tens(b)} = 9, and 1 more is 10: write 10. So ${a2} + ${b} = 100.`), { hint, visual: col(a2, b, '+') }); }
        if (i === 8) { const [a, b] = carry2(rng), c = a + b + P(rng, [-10, -1, 0, 1, 10]); return Q(L(`So sánh: ${a} + ${b} … ${c}`, `Compare: ${a} + ${b} … ${c}`), cmp(a + b, c), L(`${a} + ${b} = ${a + b}, mà ${a + b} ${sign(a + b, c)} ${c}.`, `${a} + ${b} = ${a + b}, and ${a + b} ${sign(a + b, c)} ${c}.`), { hint: L('Tính tổng trước rồi so sánh.', 'Work out the sum first, then compare.'), visual: vz('compare', { left: `${a} + ${b}`, right: String(c) }) }); }
        const q = DT.bank(rng, ['g2-dt-cong-co-nho']); if (q) return q;
        const [a, b] = carry2(rng); return Q(set + `${a} + ${b}`, num(a + b), ex(a, b), { hint, visual: col(a, b, '+') });
      },
    },

    {
      id: 'g2-dt-tru-co-nho', sem: 1, icon: '✂️', lesson: 'g2-c4-b23',
      title: L('Phép trừ có nhớ trong phạm vi 100', 'Subtracting within 100 with borrowing'),
      spot: L('Phép trừ mà chữ số hàng đơn vị của số bị trừ bé hơn của số trừ, ví dụ 62 − 37 (2 không trừ được 7).', 'A subtraction where the ones digit on top is smaller than the ones digit below, for example 62 − 37 (you cannot take 7 from 2).'),
      steps: [
        L('Bước 1: Đặt tính: viết các chữ số cùng hàng thẳng cột.', 'Step 1: Set out the subtraction: write the digits in their columns.'),
        L('Bước 2: Hàng đơn vị không trừ được thì lấy thêm 1 chục (12 − 7), viết kết quả, nhớ 1.', 'Step 2: If you cannot subtract the ones, take 1 ten (12 − 7), write the result and remember 1.'),
        L('Bước 3: Hàng chục: thêm 1 (nhớ) vào số trừ rồi mới trừ.', 'Step 3: The tens: add the remembered 1 to the bottom digit, then subtract.'),
      ],
      tip: L('Đừng lấy số lớn trừ số bé ở từng hàng. Với 62 − 37, không tính 7 − 2. Phải lấy 12 − 7 và nhớ 1.', 'Do not take the smaller digit from the bigger one in each column. In 62 − 37, do not work out 7 − 2. Work out 12 − 7 and remember 1.'),
      guide: rng => {
        const one = R(rng, 0, 2) === 0, [a, b] = one ? pairWhere(rng, [21, 95], [3, 9], (x, y) => x % 10 < y, [43, 8]) : borrow2(rng);
        const d = 10 + ones(a) - ones(b), t = tens(a) - tens(b) - 1, r = a - b, no = L('Không trừ được', 'No, you cannot'), yes = L('Trừ được', 'Yes, you can');
        return G(L(`Đặt tính rồi tính:\n${a} ${M} ${b}`, `Set out and calculate:\n${a} ${M} ${b}`), [
          step(L(`Hàng đơn vị: ${ones(a)} có trừ được ${ones(b)} không?`, `The ones: can you take ${ones(b)} from ${ones(a)}?`), ch(rng, no, [yes]), L(`${ones(a)} bé hơn ${ones(b)} nên không trừ được. Ta lấy ${10 + ones(a)} trừ ${ones(b)}.`, `${ones(a)} is less than ${ones(b)}, so you cannot. We work out ${10 + ones(a)} take away ${ones(b)}.`)),
          step(`${10 + ones(a)} ${M} ${ones(b)} = ?`, num(d), L(`${10 + ones(a)} ${M} ${ones(b)} = ${d}, viết ${d}, nhớ 1.`, `${10 + ones(a)} ${M} ${ones(b)} = ${d}. Write ${d} and remember 1.`)),
          step(one ? L(`Hàng chục: ${tens(a)} trừ 1 (nhớ) bằng mấy?`, `The tens: ${tens(a)} take away the remembered 1 is how many?`) : L(`Hàng chục: ${tens(b)} thêm 1 (nhớ) bằng ${tens(b) + 1}. ${tens(a)} ${M} ${tens(b) + 1} = ?`, `The tens: ${tens(b)} and the remembered 1 make ${tens(b) + 1}. ${tens(a)} ${M} ${tens(b) + 1} = ?`), num(t), one ? L(`${tens(a)} trừ 1 bằng ${t}, viết ${t}.`, `${tens(a)} take away 1 is ${t}. Write ${t}.`) : L(`${tens(b)} thêm 1 bằng ${tens(b) + 1}; ${tens(a)} trừ ${tens(b) + 1} bằng ${t}, viết ${t}.`, `${tens(b)} and 1 make ${tens(b) + 1}; ${tens(a)} take away ${tens(b) + 1} is ${t}. Write ${t}.`), L('Đừng quên 1 đã nhớ.', 'Do not forget the 1 you remembered.')),
          step(L(`Vậy ${a} ${M} ${b} = ?`, `So ${a} ${M} ${b} = ?`), num(r), `${a} ${M} ${b} = ${r}.`),
        ], L(`Đáp số: ${r}.`, `Answer: ${r}.`), col(a, b, M));
      },
      practice: (rng, i) => {
        const set = L('Đặt tính rồi tính:\n', 'Set out and calculate:\n'), hint = L('Hàng đơn vị không trừ được thì lấy thêm 1 chục, rồi nhớ 1.', 'If you cannot subtract the ones, take 1 ten, then remember 1.');
        const ex = (a, b) => (b < 10 ? L(`${ones(a)} không trừ được ${b}, lấy ${10 + ones(a)} ${M} ${b} = ${10 + ones(a) - b}, viết ${10 + ones(a) - b}, nhớ 1. ${tens(a)} trừ 1 bằng ${tens(a) - 1}. Vậy ${a} ${M} ${b} = ${a - b}.`, `You cannot take ${b} from ${ones(a)}, so ${10 + ones(a)} ${M} ${b} = ${10 + ones(a) - b}: write ${10 + ones(a) - b}, remember 1. ${tens(a)} take away 1 is ${tens(a) - 1}. So ${a} ${M} ${b} = ${a - b}.`) : exTwo(a, b));
        const exTwo = (a, b) => L(`${ones(a)} không trừ được ${ones(b)}, lấy ${10 + ones(a)} ${M} ${ones(b)} = ${10 + ones(a) - ones(b)}, viết ${10 + ones(a) - ones(b)}, nhớ 1. ${tens(b)} thêm 1 bằng ${tens(b) + 1}; ${tens(a)} ${M} ${tens(b) + 1} = ${tens(a) - tens(b) - 1}. Vậy ${a} ${M} ${b} = ${a - b}.`, `You cannot take ${ones(b)} from ${ones(a)}, so ${10 + ones(a)} ${M} ${ones(b)} = ${10 + ones(a) - ones(b)}: write ${10 + ones(a) - ones(b)}, remember 1. ${tens(b)} and 1 make ${tens(b) + 1}; ${tens(a)} ${M} ${tens(b) + 1} = ${tens(a) - tens(b) - 1}. So ${a} ${M} ${b} = ${a - b}.`);
        const wrong = (a, b) => Math.abs(tens(a) - tens(b)) * 10 + Math.abs(ones(a) - ones(b));   // the bigger digit minus the smaller one in each column
        if (i < 2) { const [a, b] = pairWhere(rng, [21, 95], [3, 9], (x, y) => x % 10 < y, [43, 8]); return Q(set + `${a} ${M} ${b}`, num(a - b), ex(a, b), { hint, visual: col(a, b, M) }); }
        if (i < 4) { const [a, b] = borrow2(rng); return Q(set + `${a} ${M} ${b}`, num(a - b), ex(a, b), { hint, visual: col(a, b, M) }); }
        if (i === 4) { const [a, b] = borrow2(rng); return Q(`${a} ${M} ${b} = ?`, ch(rng, a - b, [wrong(a, b), a - b + 10, a - b + 1]), ex(a, b), { hint, visual: col(a, b, M) }); }
        if (i === 5) { const [a, b] = borrow2(rng), w = DT.name(rng); return Q(L(`Bạn ${w} tính: ${a} ${M} ${b} = ${wrong(a, b)}.\nBạn ấy tính sai. Kết quả đúng là bao nhiêu?`, `${w} worked out: ${a} ${M} ${b} = ${wrong(a, b)}.\nThat is wrong. What is the correct answer?`), num(a - b), ex(a, b), { hint: L(`Hàng đơn vị: ${ones(a)} không trừ được ${ones(b)}.`, `The ones: you cannot take ${ones(b)} from ${ones(a)}.`), visual: col(a, b, M) }); }
        if (i === 6) { const [a, b] = borrow2(rng), st = tbStory(rng, false, a, b, 2); return Q(L(st.vi, st.en), num(a - b, st.u(a - b)), `${a} ${M} ${b} = ${a - b} (${st.u(a - b)}).`, { hint, visual: col(a, b, M) }); }
        if (i === 7) { const a = R(rng, 3, 9) * 10, b = R(rng, 11, a - 11), b2 = b % 10 === 0 ? b + 3 : b; return Q(set + `${a} ${M} ${b2}`, num(a - b2), ex(a, b2), { hint: L('0 không trừ được, lấy 10 trừ.', 'You cannot subtract from 0, so subtract from 10.'), visual: col(a, b2, M) }); }
        const q = DT.bank(rng, i === 8 ? ['g2-dt-tru-100'] : ['g2-dt-tru-co-nho', 'g2-dt-tru-100']); if (q) return q;
        const [a, b] = borrow2(rng); return Q(set + `${a} ${M} ${b}`, num(a - b), ex(a, b), { hint, visual: col(a, b, M) });
      },
    },

    {
      id: 'g2-dt-gap-khuc', sem: 1, icon: '〰️', lesson: 'g2-c5-b26',
      title: L('Tính độ dài đường gấp khúc', 'Finding the length of a zigzag line'),
      spot: L('Bài cho một đường gấp khúc gồm nhiều đoạn thẳng, biết độ dài từng đoạn, và hỏi độ dài cả đường gấp khúc.', 'The problem gives a zigzag line made of several segments, tells you how long each segment is, and asks for the length of the whole line.'),
      steps: [
        L('Bước 1: Đếm xem đường gấp khúc gồm mấy đoạn thẳng.', 'Step 1: Count how many segments the zigzag line has.'),
        L('Bước 2: Cộng độ dài tất cả các đoạn thẳng.', 'Step 2: Add the lengths of all the segments.'),
        L('Bước 3: Viết đơn vị đo (cm, dm, m) vào kết quả.', 'Step 3: Write the unit (cm, dm, m) with the result.'),
      ],
      tip: L('Đừng bỏ sót đoạn nào. Đường gấp khúc ABCD có ba đoạn: AB, BC và CD.', 'Do not miss a segment. The zigzag line ABCD has three segments: AB, BC and CD.'),
      guide: rng => {
        const n = R(rng, 2, 3), name = P(rng, ['ABCD', 'MNPQ', 'GHIK', 'CDEG', 'DEGH']).slice(0, n + 1), segs = Array.from({ length: n }, () => R(rng, 2, 9)), s = sum(segs);
        const parts = segs.map((v, k) => `${name[k]}${name[k + 1]}`);
        const list = segs.map((v, k) => L(`${parts[k]} dài ${v} cm`, `${parts[k]} is ${v} cm long`)).join(', ');
        return G(L(`Đường gấp khúc ${name} gồm ${n === 2 ? 'hai' : 'ba'} đoạn thẳng: ${list}. Tính độ dài đường gấp khúc ${name}.`, `The zigzag line ${name} is made of ${n === 2 ? 'two' : 'three'} segments: ${list}. Work out the length of the zigzag line ${name}.`), [
          step(L(`Đường gấp khúc ${name} gồm mấy đoạn thẳng?`, `How many segments does the zigzag line ${name} have?`), num(n), L(`Đường gấp khúc ${name} gồm ${n} đoạn thẳng: ${parts.join(', ')}.`, `The zigzag line ${name} has ${n} segments: ${parts.join(', ')}.`)),
          step(L('Muốn tính độ dài đường gấp khúc, em làm thế nào?', 'How do you find the length of a zigzag line?'), ch(rng, L('Cộng độ dài các đoạn thẳng', 'Add the lengths of the segments'), [L('Lấy đoạn dài nhất', 'Take the longest segment'), L('Lấy đoạn dài nhất trừ đoạn ngắn nhất', 'Longest segment minus shortest segment')]), L('Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng của nó.', 'The length of a zigzag line is the sum of the lengths of its segments.')),
          step(`${segs.join(' + ')} = ?`, num(s, 'cm'), L(`Độ dài đường gấp khúc ${name} là: ${segs.join(' + ')} = ${s} (cm).`, `Length of the zigzag line ${name}: ${segs.join(' + ')} = ${s} (cm).`), n === 3 ? L(`Cộng hai số đầu trước: ${segs[0]} + ${segs[1]} = ${segs[0] + segs[1]}.`, `Add the first two numbers first: ${segs[0]} + ${segs[1]} = ${segs[0] + segs[1]}.`) : null),
        ], L(`Đáp số: ${s} cm.`, `Answer: ${s} cm.`), vz('shape', { kind: 'polyline', dims: { segments: segs }, showDims: true, label: name }));
      },
      practice: (rng, i) => {
        const hint = L('Cộng độ dài tất cả các đoạn thẳng.', 'Add the lengths of all the segments.');
        if (i < 7 && i !== 5) {
          const n = i < 2 ? 2 : i < 4 ? 3 : i === 4 ? 4 : 3, name = P(rng, ['ABCDE', 'MNPQR', 'GHIKL', 'CDEGH']).slice(0, n + 1);
          const dm = i === 6, segs = Array.from({ length: n }, () => (i < 4 ? R(rng, 2, 9) : R(rng, 5, 20))), s = sum(segs), u = dm ? 'dm' : 'cm';
          const list = segs.map((v, k) => `${name[k]}${name[k + 1]} = ${v} ${u}`).join(', ');
          return Q(L(`Tính độ dài đường gấp khúc ${name}, biết: ${list}.`, `Work out the length of the zigzag line ${name}, where ${list}.`), num(s, u), L(`Độ dài đường gấp khúc ${name} là: ${segs.join(' + ')} = ${s} (${u}).`, `Length of the zigzag line ${name}: ${segs.join(' + ')} = ${s} (${u}).`), { hint, visual: vz('shape', { kind: 'polyline', dims: { segments: segs, unit: u }, showDims: true, label: name }) });
        }
        if (i === 5) {
          const n = R(rng, 3, 4), v = R(rng, 3, 9), s = n * v, w = P(rng, [['con kiến', 'An ant'], ['con ốc sên', 'A snail'], ['chú rô-bốt', 'A robot']]);
          return Q(L(`Một ${w[0]} bò theo đường gấp khúc gồm ${n} đoạn thẳng, mỗi đoạn dài ${v} cm. Hỏi ${w[0]} đã bò được bao nhiêu xăng-ti-mét?`, `${w[1]} moves along a zigzag line made of ${n} segments. Each segment is ${v} cm long. How many centimetres does it move?`), num(s, 'cm'), L(`${Array(n).fill(v).join(' + ')} = ${s} (cm).`, `${Array(n).fill(v).join(' + ')} = ${s} (cm).`), { hint: L(`Cộng ${n} lần số ${v}.`, `Add ${v} to itself: ${n} of them.`), visual: vz('shape', { kind: 'polyline', dims: { segments: Array(n).fill(v) }, showDims: true }) });
        }
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-gap-khuc']); if (q) return q; }
        const name = P(rng, ['ABC', 'MNP', 'GHK', 'DEG']), a = R(rng, 12, 38), b = R(rng, 12, 38), s = a + b;
        return i === 7 ? Q(L(`Đường gấp khúc ${name} dài ${s} cm. Đoạn thẳng ${name[0]}${name[1]} dài ${a} cm. Hỏi đoạn thẳng ${name[1]}${name[2]} dài bao nhiêu xăng-ti-mét?`, `The zigzag line ${name} is ${s} cm long. The segment ${name[0]}${name[1]} is ${a} cm long. How many centimetres long is the segment ${name[1]}${name[2]}?`), num(b, 'cm'), L(`Độ dài đoạn thẳng ${name[1]}${name[2]} là: ${s} ${M} ${a} = ${b} (cm).`, `Length of ${name[1]}${name[2]}: ${s} ${M} ${a} = ${b} (cm).`), { hint: L('Lấy độ dài cả đường gấp khúc trừ đoạn đã biết.', 'Take the segment you know away from the whole length.'), visual: vz('shape', { kind: 'polyline', dims: { segments: [a, b] }, showDims: false, label: name }) })
          : Q(L(`Đường gấp khúc ${name} có đoạn ${name[0]}${name[1]} dài ${a} cm, đoạn ${name[1]}${name[2]} dài ${b} cm. Đường gấp khúc ${name} dài hơn hay ngắn hơn 50 cm?`, `In the zigzag line ${name}, the segment ${name[0]}${name[1]} is ${a} cm long and ${name[1]}${name[2]} is ${b} cm long. Is the zigzag line ${name} longer or shorter than 50 cm?`), ch(rng, s > 50 ? L('Dài hơn 50 cm', 'Longer than 50 cm') : s < 50 ? L('Ngắn hơn 50 cm', 'Shorter than 50 cm') : L('Dài đúng 50 cm', 'Exactly 50 cm'), [L('Dài hơn 50 cm', 'Longer than 50 cm'), L('Ngắn hơn 50 cm', 'Shorter than 50 cm'), L('Dài đúng 50 cm', 'Exactly 50 cm')]), L(`${a} + ${b} = ${s} (cm), mà ${s} ${sign(s, 50)} 50.`, `${a} + ${b} = ${s} (cm), and ${s} ${sign(s, 50)} 50.`), { hint, visual: vz('shape', { kind: 'polyline', dims: { segments: [a, b] }, showDims: true, label: name }) });
      },
    },

    {
      id: 'g2-dt-gio', sem: 1, icon: '🕒', lesson: 'g2-c6-b29',
      title: L('Ngày – giờ: giờ buổi chiều, buổi tối (13 giờ đến 24 giờ)', 'Days and hours: afternoon and evening times (13:00 to 24:00)'),
      spot: L('Bài có giờ lớn hơn 12 (như 15 giờ, 20 giờ) và hỏi còn gọi là mấy giờ chiều, mấy giờ tối; hoặc hỏi ngược lại.', 'The problem has an hour greater than 12 (like 15:00 or 20:00) and asks what o\'clock that is in the afternoon or evening, or the other way round.'),
      steps: [
        L('Bước 1: Nhớ: một ngày có 24 giờ. Sau 12 giờ trưa là 13 giờ, 14 giờ, …', 'Step 1: Remember: a day has 24 hours. After 12 noon come 13:00, 14:00, …'),
        L('Bước 2: Giờ lớn hơn 12: lấy số giờ trừ đi 12.', 'Step 2: For an hour greater than 12, take 12 away.'),
        L('Bước 3: Thêm buổi: chiều (13 – 18 giờ), tối (19 – 21 giờ), đêm (22 – 24 giờ).', 'Step 3: Say the part of the day: afternoon (13:00–18:00), evening (19:00–21:00), night (22:00–24:00).'),
      ],
      tip: L('Đổi ngược lại thì cộng 12: 3 giờ chiều là 3 + 12 = 15 giờ. Giờ buổi sáng thì giữ nguyên.', 'To go the other way, add 12: 3 o\'clock in the afternoon is 3 + 12 = 15:00. Morning hours stay the same.'),
      guide: rng => {
        const ev = P(rng, EVENTS), h = P(rng, ev.hs), w = DT.name(rng), r = h - 12, pt = part(h);
        const pm = L('Sau 12 giờ trưa', 'After 12 noon'), am = L('Trước 12 giờ trưa', 'Before 12 noon');
        return G(L(`${ev.vi(w)} lúc ${h} giờ. Hỏi ${h} giờ còn gọi là mấy giờ ${pt}?`, `${ev.en(w)} at ${h}:00. What time ${pt} is ${h}:00 on a 12-hour clock?`), [
          step(L(`${h} giờ là trước hay sau 12 giờ trưa?`, `Is ${h}:00 before or after 12 noon?`), ch(rng, pm, [am]), L(`${h} lớn hơn 12 nên ${h} giờ là sau 12 giờ trưa.`, `${h} is greater than 12, so ${h}:00 is after 12 noon.`)),
          step(L(`Muốn đổi ${h} giờ, em lấy ${h} trừ đi mấy?`, `To change ${h}:00, what do you take away from ${h}?`), num(12), L(`Giờ lớn hơn 12 thì lấy số giờ trừ đi 12: ${h} ${M} 12.`, `For an hour greater than 12, take 12 away: ${h} ${M} 12.`), L('Buổi sáng và buổi trưa có 12 giờ.', 'The morning, up to noon, has 12 hours.')),
          step(`${h} ${M} 12 = ?`, num(r), L(`${h} ${M} 12 = ${r}. Vậy ${h} giờ còn gọi là ${r} giờ ${pt}.`, `${h} ${M} 12 = ${r}. So ${h}:00 is ${r} o'clock ${pt}.`)),
        ], L(`Đáp số: ${r} giờ ${pt}.`, `Answer: ${r} o'clock ${pt}.`), vz('clock', { h, m: 0, digital: true }));
      },
      practice: (rng, i) => {
        const w = DT.name(rng), ev = P(rng, EVENTS), h = i % 2 === 1 ? P(rng, ev.hs) : i < 2 ? R(rng, 13, 18) : R(rng, 13, 23), r = h - 12, pt = part(h);
        if (i < 4) return Q(i % 2 === 0 ? L(`${h} giờ còn gọi là mấy giờ ${pt}?`, `What time ${pt} is ${h}:00 on a 12-hour clock?`) : L(`${ev.vi(w)} lúc ${h} giờ. ${h} giờ còn gọi là mấy giờ ${pt}?`, `${ev.en(w)} at ${h}:00. What time ${pt} is ${h}:00 on a 12-hour clock?`), num(r, L(`giờ ${pt}`, `o'clock ${pt}`)), L(`${h} ${M} 12 = ${r}. ${h} giờ còn gọi là ${r} giờ ${pt}.`, `${h} ${M} 12 = ${r}. ${h}:00 is ${r} o'clock ${pt}.`), { hint: L('Giờ lớn hơn 12: lấy số giờ trừ đi 12.', 'For an hour greater than 12, take 12 away.'), visual: vz('clock', { h, m: 0, digital: true }) });
        // answer: the hour on the 24-hour clock (no unit in English)
        if (i === 4 || i === 5) return Q(i === 4 ? L(`${r} giờ ${pt} còn gọi là mấy giờ?`, `${r} o'clock ${pt}: what is that on a 24-hour clock?`) : L(`${ev.vi(w)} lúc ${r} giờ ${pt}. Đồng hồ điện tử lúc đó chỉ mấy giờ?`, `${ev.en(w)} at ${r} o'clock ${pt}. What hour does a digital clock show then?`), num(h, L('giờ', '')), L(`${r} + 12 = ${h}. ${r} giờ ${pt} còn gọi là ${h} giờ.`, `${r} + 12 = ${h}. ${r} o'clock ${pt} is ${h}:00.`), { hint: L('Giờ buổi chiều, buổi tối: cộng thêm 12.', 'For afternoon and evening hours, add 12.') });
        if (i === 6) {
          const hh = R(rng, 1, 12), m = P(rng, [0, 15, 30]);
          return Q(L(`${w} nhìn đồng hồ. Đồng hồ chỉ mấy giờ?`, `${w} looks at the clock. What time does it show?`), ch(rng, timeStr(hh, m), [timeStr(hh % 12 + 1, m), timeStr(hh, (m + 30) % 60), timeStr(hh, m === 15 ? 0 : 15)]), L(`Kim ngắn chỉ giờ, kim dài chỉ phút: ${timeStr(hh, m)}.`, `The short hand shows the hour and the long hand shows the minutes: ${timeStr(hh, m)}.`), { hint: L('Kim dài chỉ số 3 là 15 phút, chỉ số 6 là 30 phút.', 'The long hand on 3 means 15 minutes past; on 6 it means 30 minutes past.'), visual: vz('clock', { h: hh, m }) });
        }
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-gio']); if (q) return q; }
        const k = R(rng, 1, 3);
        if (i === 7) {
          const h0 = R(rng, 7, 10), h1 = h0 + k;
          return Q(L(`${w} bắt đầu học bài lúc ${h0} giờ và học xong lúc ${h1} giờ. Hỏi ${w} học bài trong mấy giờ?`, `${w} starts studying at ${h0} o'clock and finishes at ${h1} o'clock. For how many hours does ${w} study?`), num(k, L('giờ', k === 1 ? 'hour' : 'hours')), L(`${h1} ${M} ${h0} = ${k} (giờ).`, `${h1} ${M} ${h0} = ${k} (${k === 1 ? 'hour' : 'hours'}).`), { hint: L('Lấy giờ kết thúc trừ giờ bắt đầu.', 'Take the start hour away from the end hour.'), visual: vz('clock', { h: h0, m: 0 }) });
        }
        const h0 = R(rng, 13, 20), h1 = h0 + k;
        return Q(L(`Buổi tập văn nghệ bắt đầu lúc ${h0} giờ và kéo dài ${k} giờ. Hỏi buổi tập kết thúc lúc mấy giờ ${part(h1)}?`, `A music practice starts at ${h0}:00 and lasts ${k} ${k === 1 ? 'hour' : 'hours'}. At what time ${part(h1)} does it end, on a 12-hour clock?`), num(h1 - 12, L(`giờ ${part(h1)}`, `o'clock ${part(h1)}`)), L(`${h0} + ${k} = ${h1}. ${h1} giờ còn gọi là ${h1 - 12} giờ ${part(h1)}.`, `${h0} + ${k} = ${h1}. ${h1}:00 is ${h1 - 12} o'clock ${part(h1)}.`), { hint: L('Tìm giờ kết thúc trước, rồi trừ đi 12.', 'Find the end hour first, then take 12 away.'), visual: vz('clock', { h: h0, m: 0, digital: true }) });
      },
    },

    // ================= HỌC KÌ II =================
    {
      id: 'g2-dt-phep-nhan', sem: 2, icon: '✖️', lesson: 'g2-c8-b40',
      title: L('Bài toán về phép nhân (bảng nhân 2, bảng nhân 5)', 'Multiplication word problems (2 and 5 times tables)'),
      spot: L('Bài toán có chữ “mỗi”: mỗi đĩa, mỗi bạn, mỗi hộp có số đồ vật như nhau, rồi hỏi nhiều đĩa, nhiều bạn, nhiều hộp có tất cả bao nhiêu.', 'The problem has the word "each": each plate, each child or each box has the same number of things. It asks how many there are in several of them.'),
      steps: [
        L('Bước 1: Tìm xem mỗi nhóm có mấy.', 'Step 1: Find how many are in each group.'),
        L('Bước 2: Tìm xem có mấy nhóm. Số ở mỗi nhóm được lấy bấy nhiêu lần.', 'Step 2: Find how many groups there are. The number in each group is taken that many times.'),
        L('Bước 3: Viết phép nhân: (số ở mỗi nhóm) × (số nhóm), rồi tính.', 'Step 3: Write the multiplication: (number in each group) × (number of groups), then work it out.'),
      ],
      tip: L('Đừng cộng hai số trong bài. 5 quả cam ở mỗi đĩa, 4 đĩa: 5 × 4 = 20, không phải 5 + 4 = 9.', 'Do not add the two numbers in the problem. 5 oranges on each plate, 4 plates: 5 × 4 = 20, not 5 + 4 = 9.'),
      guide: rng => {
        const c = P(rng, MUL), n = c.n, k = R(rng, 2, 9), k2 = k === n ? k + 1 : k, r = n * k2, u = L(c.what[0], c.what[1]);
        return G(`${L(c.per[0], c.per[1])} ${c.q(k2)}`, [
          step(L(`Đọc câu có chữ “mỗi”. Trong câu đó có mấy ${c.what[0]}?`, `Read the sentence with the word "each". How many ${c.what[1]} does it say?`), num(n), L(c.per[0], c.per[1]), L('Tìm số đứng trong câu có chữ “mỗi”.', 'Find the number in the sentence with the word "each".')),
          step(L(`Có ${c.g(k2)}. Vậy ${n} được lấy mấy lần?`, `There are ${c.g(k2)}. So how many times is ${n} taken?`), num(k2), L(`${n} được lấy ${k2} lần.`, `${n} is taken ${k2} times.`)),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${n} × ${k2}`, [`${n} + ${k2}`]), L(`${n} được lấy ${k2} lần, ta viết phép nhân: ${n} × ${k2}.`, `${n} is taken ${k2} times, so we write the multiplication: ${n} × ${k2}.`), L('Nhiều nhóm bằng nhau thì làm phép nhân.', 'Several equal groups: multiply.')),
          step(`${n} × ${k2} = ?`, num(r), `${c.sol(k2)}: ${n} × ${k2} = ${r} (${u}).`, L(`Nhẩm bảng nhân ${n}.`, `Use the ${n} times table.`)),
        ], L(`Đáp số: ${r} ${u}.`, `Answer: ${r} ${u}.`), vz('array', { rows: k2, cols: n, emoji: c.e }));
      },
      practice: (rng, i) => {
        const c = P(rng, MUL), n = c.n, k = i < 2 ? R(rng, 2, 5) : R(rng, 3, 10), r = n * k, u = L(c.what[0], c.what[1]);
        const hint = L(`${n} được lấy ${k} lần: làm phép nhân ${n} × ${k}.`, `${n} is taken ${k} times: multiply ${n} × ${k}.`);
        if (i < 4) return Q(`${L(c.per[0], c.per[1])} ${c.q(k)}`, num(r, u), `${c.sol(k)}: ${n} × ${k} = ${r} (${u}).`, { hint, visual: vz('array', { rows: k, cols: n, emoji: c.e }) });
        if (i === 4) return Q(`${L(c.per[0], c.per[1])} ${c.q(k)}` + L('\nEm chọn phép tính giải bài toán:', '\nChoose the calculation that solves the problem:'), ch(rng, `${n} × ${k} = ${r}`, [`${n} + ${k} = ${n + k}`, `${n} × ${k} = ${r + n}`]), `${c.sol(k)}: ${n} × ${k} = ${r} (${u}).`, { hint, visual: vz('array', { rows: k, cols: n, emoji: c.e }) });
        if (i === 5) {
          const m = P(rng, [2, 5]), kk = R(rng, 3, 6), [vi, en, uu] = P(rng, [[`Mỗi túi gạo nặng ${m} kg. Hỏi ${kk} túi gạo như thế nặng bao nhiêu ki-lô-gam?`, `Each bag of rice weighs ${m} kg. How many kilograms do ${kk} bags like this weigh?`, 'kg'], [`Mỗi can đựng ${m} l dầu. Hỏi ${kk} can như thế đựng bao nhiêu lít dầu?`, `Each can holds ${m} l of oil. How many litres of oil do ${kk} cans like this hold?`, 'l'], [`Mỗi đoạn dây dài ${m} dm. Hỏi ${kk} đoạn dây như thế dài bao nhiêu đề-xi-mét?`, `Each piece of string is ${m} dm long. How many decimetres long are ${kk} pieces like this?`, 'dm']]);
          return Q(L(vi, en), num(m * kk, uu), `${m} × ${kk} = ${m * kk} (${uu}).`, { hint: L(`${m} được lấy ${kk} lần.`, `${m} is taken ${kk} times.`), visual: vz('tape', { bars: [{ label: '', parts: 1, units: 1, value: `${m} ${uu}` }, { label: '', parts: kk, units: kk, value: '?' }] }) });
        }
        if (i === 6) return Q(L(`Viết phép cộng thành phép nhân rồi tính:\n${Array(k).fill(n).join(' + ')} = ?`, `Write the addition as a multiplication, then work it out:\n${Array(k).fill(n).join(' + ')} = ?`), num(r), L(`${n} được lấy ${k} lần: ${n} × ${k} = ${r}.`, `${n} is taken ${k} times: ${n} × ${k} = ${r}.`), { hint: L(`Đếm xem có mấy số ${n}.`, `Count how many ${n}s there are.`) });
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-nhan-chia']); if (q) return q; }
        // the group size is not written as a number: a pair, a school week
        const kk = R(rng, 3, 10), w = DT.name(rng);
        const [vi, en, m, uu] = P(rng, [
          [`Mẹ mua cho ${w} ${kk} đôi tất. Hỏi mẹ mua cho ${w} bao nhiêu chiếc tất?`, `Mum buys ${w} ${kk} pairs of socks. How many socks does Mum buy?`, 2, L('chiếc tất', 'socks')],
          [`Mỗi tuần ${w} đi học 5 ngày. Hỏi ${kk} tuần ${w} đi học bao nhiêu ngày?`, `${w} goes to school 5 days a week. How many days does ${w} go to school in ${kk} weeks?`, 5, L('ngày', 'days')],
          [`Trên bàn có ${kk} đôi đũa. Hỏi trên bàn có bao nhiêu chiếc đũa?`, `There are ${kk} pairs of chopsticks on the table. How many chopsticks are there?`, 2, L('chiếc đũa', 'chopsticks')],
          [`Mỗi bàn tay có 5 ngón tay. ${kk} bạn cùng giơ một bàn tay lên. Hỏi có tất cả bao nhiêu ngón tay giơ lên?`, `A hand has 5 fingers. ${kk} children each put up one hand. How many fingers are up altogether?`, 5, L('ngón tay', 'fingers')]]);
        return Q(L(vi, en), num(m * kk, uu), L(`${m} được lấy ${kk} lần: ${m} × ${kk} = ${m * kk} (${uu}).`, `${m} is taken ${kk} times: ${m} × ${kk} = ${m * kk} (${uu}).`), { hint: m === 2 ? L('Mỗi đôi có 2 chiếc.', 'A pair is 2.') : L('Số 5 được lấy mấy lần?', 'How many times is 5 taken?') });
      },
    },

    {
      id: 'g2-dt-phep-chia', sem: 2, icon: '➗', lesson: 'g2-c8-b44',
      title: L('Bài toán về phép chia (bảng chia 2, bảng chia 5)', 'Division word problems (dividing by 2 and by 5)'),
      spot: L('Bài toán có các chữ “chia đều”, “xếp đều”, hoặc cho biết mỗi nhóm có mấy và hỏi được mấy nhóm.', 'The problem says "shared equally" or "put equally", or it tells you how many go in each group and asks how many groups there are.'),
      steps: [
        L('Bước 1: Tìm xem có tất cả bao nhiêu.', 'Step 1: Find how many there are altogether.'),
        L('Bước 2: Tìm xem chia thành mấy phần bằng nhau (hoặc mỗi phần có mấy).', 'Step 2: Find how many equal parts there are (or how many go in each part).'),
        L('Bước 3: Viết phép chia rồi nhẩm theo bảng nhân: 5 × ? = 20.', 'Step 3: Write the division and use the times table: 5 × ? = 20.'),
      ],
      tip: L('Số lớn (số có tất cả) đứng trước dấu chia: 20 : 5, không viết 5 : 20.', 'The big number (how many altogether) goes before the division sign: 20 : 5, not 5 : 20.'),
      guide: rng => {
        const share = R(rng, 0, 1) === 1, c = P(rng, share ? DIV_SHARE : DIV_GROUP), n = P(rng, [2, 5]), k0 = R(rng, 2, 9), k = k0 === n ? k0 + 1 : k0, p = n * k, u = L(c.u[0], c.u[1]);
        return G(L(c.vi(p, n), c.en(p, n)), [
          step(L('Có tất cả bao nhiêu?', 'How many are there altogether?'), num(p), L(`Có tất cả ${p}. Đây là số đem chia.`, `There are ${p} altogether. This is the number we divide.`), L('Tìm số lớn nhất trong bài toán.', 'Find the biggest number in the problem.')),
          share ? step(L('Chia đều thành mấy phần?', 'Into how many equal parts?'), num(n), L(`Chia đều thành ${n} phần bằng nhau.`, `It is shared into ${n} equal parts.`))
            : step(L('Mỗi phần có mấy?', 'How many go in each part?'), num(n), `${c.each(n)}.`),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${p} : ${n}`, [`${p} ${M} ${n}`, `${p} + ${n}`]), L(`Chia thành các phần bằng nhau thì làm phép chia: ${p} : ${n}.`, `Equal parts mean divide: ${p} : ${n}.`)),
          step(`${p} : ${n} = ?`, num(k), `${c.sol}: ${p} : ${n} = ${k} (${u}).`, L(`Nhẩm bảng nhân ${n}: ${n} × ? = ${p}.`, `Use the ${n} times table: ${n} × ? = ${p}.`)),
        ], L(`Đáp số: ${k} ${u}.`, `Answer: ${k} ${u}.`), share ? vz('share', { total: p, groups: n, emoji: c.e, plateLabel: L(c.part[0], c.part[1]) }) : vz('array', { rows: k, cols: n, emoji: c.e }));
      },
      practice: (rng, i) => {
        const n = P(rng, [2, 5]), k = i < 2 ? R(rng, 2, 5) : R(rng, 3, 10), p = n * k;
        const hint = L(`Nhẩm bảng nhân ${n}: ${n} × ? = ${p}.`, `Use the ${n} times table: ${n} × ? = ${p}.`);
        if (i < 7) {
          const share = i < 2 || i === 4, c = P(rng, share ? DIV_SHARE : DIV_GROUP), u = L(c.u[0], c.u[1]);
          const vis = share ? vz('share', { total: p, groups: n, emoji: c.e, plateLabel: L(c.part[0], c.part[1]) }) : vz('array', { rows: k, cols: n, emoji: c.e });
          if (i === 5) return Q(L(c.vi(p, n), c.en(p, n)) + L('\nEm chọn phép tính giải bài toán:', '\nChoose the calculation that solves the problem:'), ch(rng, `${p} : ${n} = ${k}`, [`${p} ${M} ${n} = ${p - n}`, `${p} : ${n} = ${k + 1}`]), `${c.sol}: ${p} : ${n} = ${k} (${u}).`, { hint, visual: vis });
          if (i === 6) {
            const [vi, en, uu] = P(rng, [[`Có ${p} l nước mắm rót đều vào ${n} can. Hỏi mỗi can có mấy lít nước mắm?`, `${p} l of fish sauce is poured equally into ${n} cans. How many litres are in each can?`, 'l'], [`Có ${p} kg gạo chia đều vào ${n} túi. Hỏi mỗi túi có mấy ki-lô-gam gạo?`, `${p} kg of rice is shared equally into ${n} bags. How many kilograms are in each bag?`, 'kg'], [`Sợi dây dài ${p} dm được cắt thành ${n} đoạn bằng nhau. Hỏi mỗi đoạn dài mấy đề-xi-mét?`, `A string ${p} dm long is cut into ${n} equal pieces. How many decimetres long is each piece?`, 'dm']]);
            return Q(L(vi, en), num(k, uu), `${p} : ${n} = ${k} (${uu}).`, { hint, visual: vz('tape', { bars: [{ label: '', parts: n, units: n, value: `${p} ${uu}` }, { label: '', parts: 1, units: 1, value: '?' }] }) });
          }
          return Q(L(c.vi(p, n), c.en(p, n)), num(k, u), `${c.sol}: ${p} : ${n} = ${k} (${u}).`, { hint, visual: vis });
        }
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-nhan-chia', 'g2-nc-tim-thanh-phan']); if (q) return q; }
        const w = DT.name(rng);
        // the group size is not written as a number: a pair
        if (i === 7) { const p2 = 2 * k; return Q(L(`${w} có ${p2} chiếc đũa. Hỏi ${w} xếp được mấy đôi đũa?`, `${w} has ${p2} chopsticks. How many pairs of chopsticks can ${w} make?`), num(k, L('đôi đũa', 'pairs')), L(`Mỗi đôi có 2 chiếc: ${p2} : 2 = ${k} (đôi đũa).`, `A pair is 2 chopsticks: ${p2} : 2 = ${k} (pairs).`), { hint: L('Mỗi đôi đũa có 2 chiếc.', 'A pair of chopsticks is 2 chopsticks.') }); }
        // the question turned round: the share is known, the total is asked (a multiplication)
        const it = P(rng, [['cái kẹo', 'sweets'], ['quyển vở', 'exercise books'], ['cái bánh', 'cakes']]);
        return Q(L(`Cô giáo chia đều một số ${it[0]} cho ${k} bạn, mỗi bạn được ${n} ${it[0]}. Hỏi cô giáo có tất cả bao nhiêu ${it[0]}?`, `The teacher shares some ${it[1]} equally between ${k} children. Each child gets ${n} ${it[1]}. How many ${it[1]} does the teacher have altogether?`), num(p, L(it[0], it[1])), L(`${n} được lấy ${k} lần: ${n} × ${k} = ${p} (${it[0]}).`, `${n} is taken ${k} times: ${n} × ${k} = ${p} (${it[1]}).`), { hint: L('Bài toán hỏi “có tất cả”: số ở mỗi phần được lấy nhiều lần. Em làm phép nhân.', 'The problem asks "altogether": the share is taken several times. Multiply.'), visual: vz('array', { rows: k, cols: n }) });
      },
    },

    {
      id: 'g2-dt-so-sanh-3cs', sem: 2, icon: '🔢', lesson: 'g2-c10-b53',
      title: L('So sánh các số có ba chữ số', 'Comparing 3-digit numbers'),
      spot: L('Bài cho hai (hoặc nhiều) số có ba chữ số và bảo em điền dấu >, <, =, tìm số lớn nhất, bé nhất hoặc sắp xếp các số.', 'The problem gives two (or more) 3-digit numbers. You put in >, < or =, find the greatest or smallest, or put the numbers in order.'),
      steps: [
        L('Bước 1: So sánh chữ số hàng trăm. Số nào có hàng trăm lớn hơn thì lớn hơn.', 'Step 1: Compare the hundreds digits. The number with more hundreds is greater.'),
        L('Bước 2: Hàng trăm bằng nhau thì so sánh hàng chục.', 'Step 2: If the hundreds are the same, compare the tens.'),
        L('Bước 3: Hàng trăm và hàng chục bằng nhau thì so sánh hàng đơn vị.', 'Step 3: If the hundreds and tens are the same, compare the ones.'),
      ],
      tip: L('Luôn so sánh từ hàng trăm. 398 bé hơn 401 dù 9 và 8 lớn, vì 3 trăm bé hơn 4 trăm.', 'Always start with the hundreds. 398 is less than 401 even though 9 and 8 are big digits, because 3 hundreds is less than 4 hundreds.'),
      guide: rng => {
        const p = R(rng, 0, 2), a = R(rng, 112, 987);
        const da = [hund(a), tens(a), ones(a)], db = da.slice();
        db[p] = da[p] === 9 ? da[p] - R(rng, 1, 3) : da[p] === (p === 0 ? 1 : 0) ? da[p] + R(rng, 1, 3) : da[p] + P(rng, [-1, 1]);
        for (let k = p + 1; k < 3; k++) db[k] = R(rng, 0, 9);
        const b = db[0] * 100 + db[1] * 10 + db[2], s = sign(a, b);
        const same = p === 0 ? '' : p === 1 ? L(`Hàng trăm đều là ${da[0]}. `, `The hundreds digits are both ${da[0]}. `) : L(`Hàng trăm đều là ${da[0]}, hàng chục đều là ${da[1]}. `, `The hundreds digits are both ${da[0]} and the tens digits are both ${da[1]}. `);
        return G(L(`Điền dấu >, <, = cho đúng:\n${a} … ${b}`, `Put in the right sign (>, < or =):\n${a} … ${b}`), [
          step(L('Em so sánh từ hàng nào trước?', 'Which place do you compare first?'), ch(rng, PLACE[0], [PLACE[1], PLACE[2]]), L('So sánh từ hàng cao nhất: hàng trăm, rồi hàng chục, rồi hàng đơn vị.', 'Start with the highest place: the hundreds, then the tens, then the ones.')),
          step(L(`Đi từ hàng trăm: hàng đầu tiên mà hai số có chữ số khác nhau là hàng nào?`, `Starting from the hundreds: which is the first place where the two numbers have different digits?`), ch(rng, PLACE[p], PLACE.filter((x, k) => k !== p)), same + L(`${PLACE[p]}: ${da[p]} ${sign(da[p], db[p])} ${db[p]}.`, `${PLACE[p]}: ${da[p]} ${sign(da[p], db[p])} ${db[p]}.`), L('So từng cặp chữ số, từ trái sang phải.', 'Compare the digits pair by pair, from left to right.')),
          step(L(`Chọn dấu đúng: ${a} … ${b}`, `Choose the right sign: ${a} … ${b}`), signCh(rng, a, b), L(`${da[p]} ${sign(da[p], db[p])} ${db[p]} nên ${a} ${s} ${b}.`, `${da[p]} ${sign(da[p], db[p])} ${db[p]}, so ${a} ${s} ${b}.`)),
        ], L(`Đáp số: ${a} ${s} ${b}.`, `Answer: ${a} ${s} ${b}.`), vz('compare', { left: String(a), right: String(b) }));
      },
      practice: (rng, i) => {
        const hint = L('So sánh hàng trăm trước, rồi hàng chục, rồi hàng đơn vị.', 'Compare the hundreds first, then the tens, then the ones.');
        const close = () => { const a = R(rng, 112, 987), f = R(rng, 0, 2); const b = f === 0 ? hund(a) * 100 + R(rng, 0, 99) : f === 1 ? Math.floor(a / 10) * 10 + R(rng, 0, 9) : ones(a) * 100 + tens(a) * 10 + hund(a); return [a, b < 100 ? a + 1 : b]; };
        const three = () => { const s = new Set(), h = R(rng, 1, 8); while (s.size < 3) s.add(P(rng, [h, h, h + 1]) * 100 + R(rng, 0, 9) * 10 + R(rng, 0, 9)); return [...s]; };
        if (i < 4) {
          const [a, b] = i < 2 ? [R(rng, 100, 999), R(rng, 100, 999)] : close();
          return Q(L(`Chọn dấu đúng:\n${a} … ${b}`, `Choose the right sign:\n${a} … ${b}`), cmp(a, b), a === b ? L(`Hai số giống nhau: ${a} = ${b}.`, `The two numbers are the same: ${a} = ${b}.`) : L(`So từng hàng từ trái sang phải: ${a} ${sign(a, b)} ${b}.`, `Compare place by place from the left: ${a} ${sign(a, b)} ${b}.`), { hint, visual: vz('compare', { left: String(a), right: String(b) }) });
        }
        if (i === 4) {
          const [a, b0] = close(), b = b0 === a ? a + 10 : b0, more = R(rng, 0, 1) === 1;
          return Q(L(`Trường Hòa Bình có ${a} học sinh, trường Ánh Dương có ${b} học sinh. Trường nào có ${more ? 'nhiều' : 'ít'} học sinh hơn?`, `Hòa Bình School has ${a} pupils and Ánh Dương School has ${b} pupils. Which school has ${more ? 'more' : 'fewer'} pupils?`), ch(rng, (a > b) === more ? L('Trường Hòa Bình', 'Hòa Bình School') : L('Trường Ánh Dương', 'Ánh Dương School'), [L('Trường Hòa Bình', 'Hòa Bình School'), L('Trường Ánh Dương', 'Ánh Dương School')]), `${a} ${sign(a, b)} ${b}.`, { hint, visual: vz('compare', { left: String(a), right: String(b) }) });
        }
        if (i === 5 || i === 6) {
          const t = three(), big = i === 5, ans = big ? Math.max(...t) : Math.min(...t);
          return Q(L(`Số nào ${big ? 'lớn' : 'bé'} nhất?\n${t.join(', ')}`, `Which number is the ${big ? 'greatest' : 'smallest'}?\n${t.join(', ')}`), ch(rng, ans, t.filter(x => x !== ans)), L(`Xếp từ bé đến lớn: ${asc(t).join(', ')}. Số ${big ? 'lớn' : 'bé'} nhất là ${ans}.`, `From smallest to greatest: ${asc(t).join(', ')}. The ${big ? 'greatest' : 'smallest'} number is ${ans}.`), { hint });
        }
        if (i === 7) {
          const t = three(), up = R(rng, 0, 1) === 1, s = asc(t), ok = up ? s : s.slice().reverse(), f = o => o.join(', ');
          return Q(L(`Xếp các số ${f(t)} theo thứ tự từ ${up ? 'bé đến lớn' : 'lớn đến bé'}.`, `Put the numbers ${f(t)} in order from ${up ? 'smallest to greatest' : 'greatest to smallest'}.`), ch(rng, f(ok), [f(ok.slice().reverse()), f([ok[1], ok[0], ok[2]]), f([ok[0], ok[2], ok[1]])]), L(`Thứ tự đúng: ${f(ok)}.`, `The right order: ${f(ok)}.`), { hint });
        }
        if (i === 9) {   // the greatest / smallest 3-digit number written with three given digits
          const ds = U.sample(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3), big = R(rng, 0, 1) === 1, up = asc(ds), down = up.slice().reverse();
          const mx = down[0] * 100 + down[1] * 10 + down[2], mn = up[0] === 0 ? up[1] * 100 + up[2] : up[0] * 100 + up[1] * 10 + up[2];
          return Q(L(`Cho ba chữ số ${ds.join(', ')}. Dùng cả ba chữ số đó, em hãy viết số ${big ? 'lớn' : 'bé'} nhất có ba chữ số.`, `Here are three digits: ${ds.join(', ')}. Use all three digits to write the ${big ? 'greatest' : 'smallest'} 3-digit number.`), num(big ? mx : mn),
            big ? L(`Chữ số lớn nhất đứng ở hàng trăm, rồi đến chữ số lớn thứ hai ở hàng chục: ${mx}.`, `Put the greatest digit in the hundreds place and the next greatest in the tens place: ${mx}.`) : L(`Chữ số bé nhất khác 0 đứng ở hàng trăm, rồi đến chữ số bé nhất còn lại ở hàng chục: ${mn}.`, `Put the smallest digit that is not 0 in the hundreds place, then the smallest digit left in the tens place: ${mn}.`), { hint: big ? L('Hàng trăm quan trọng nhất: chọn chữ số lớn nhất cho hàng trăm.', 'The hundreds matter most: choose the greatest digit for the hundreds.') : L('Hàng trăm quan trọng nhất: chọn chữ số bé nhất cho hàng trăm (nhưng không được là 0).', 'The hundreds matter most: choose the smallest digit for the hundreds (but not 0).') });
        }
        const h = R(rng, 1, 9), t = R(rng, 1, 8), o = R(rng, 0, 9), n = h * 100 + t * 10 + o, lt = R(rng, 0, 1) === 1, d = lt ? t - 1 : t + 1;
        return Q(lt ? L(`Tìm chữ số lớn nhất có thể thay vào dấu ? để được so sánh đúng:\n${h}?${o} < ${n}`, `Find the greatest digit that can replace ? to make this true:\n${h}?${o} < ${n}`) : L(`Tìm chữ số bé nhất có thể thay vào dấu ? để được so sánh đúng:\n${h}?${o} > ${n}`, `Find the smallest digit that can replace ? to make this true:\n${h}?${o} > ${n}`), num(d), lt ? L(`Hàng trăm và hàng đơn vị giống nhau, nên chữ số hàng chục phải bé hơn ${t}. Chữ số lớn nhất là ${d}: ${h}${d}${o} < ${n}.`, `The hundreds and the ones are the same, so the tens digit must be less than ${t}. The greatest such digit is ${d}: ${h}${d}${o} < ${n}.`) : L(`Hàng trăm và hàng đơn vị giống nhau, nên chữ số hàng chục phải lớn hơn ${t}. Chữ số bé nhất là ${d}: ${h}${d}${o} > ${n}.`, `The hundreds and the ones are the same, so the tens digit must be greater than ${t}. The smallest such digit is ${d}: ${h}${d}${o} > ${n}.`), { hint: L('Hai số chỉ khác nhau ở hàng chục.', 'The two numbers differ only in the tens.') });
      },
    },

    {
      id: 'g2-dt-do-dai', sem: 2, icon: '📏', lesson: 'g2-c11-b55',
      title: L('Đổi đơn vị đo độ dài: mét, đề-xi-mét, xăng-ti-mét', 'Changing units of length: metres, decimetres, centimetres'),
      spot: L('Bài bảo em viết số thích hợp vào chỗ chấm: 3 m = … dm, 5 dm = … cm, 2 m = … cm, hoặc có hai số đo khác đơn vị cần so sánh, cộng, trừ.', 'The problem asks for the missing number: 3 m = … dm, 5 dm = … cm, 2 m = … cm, or it has two lengths in different units to compare, add or subtract.'),
      steps: [
        L('Bước 1: Nhớ: 1 dm = 10 cm; 1 m = 10 dm; 1 m = 100 cm; 1 km = 1000 m.', 'Step 1: Remember: 1 dm = 10 cm; 1 m = 10 dm; 1 m = 100 cm; 1 km = 1000 m.'),
        L('Bước 2: Đổi về cùng một đơn vị: 3 m là 3 chục đề-xi-mét, tức là 30 dm.', 'Step 2: Change to the same unit: 3 m is 3 tens of decimetres, which is 30 dm.'),
        L('Bước 3: Rồi mới so sánh hoặc tính.', 'Step 3: Only then compare or calculate.'),
      ],
      tip: L('Đừng so sánh hai số khi khác đơn vị. 2 m dài hơn 15 dm, vì 2 m = 20 dm.', 'Do not compare the numbers when the units are different. 2 m is longer than 15 dm, because 2 m = 20 dm.'),
      guide: rng => {
        const f = R(rng, 0, 2), k = R(rng, 2, 9), w = DT.name(rng);
        const [big, small, rate, bigW, smallW, bigE, smallE] = [['m', 'dm', 10, 'mét', 'đề-xi-mét', 'metre', 'decimetres'], ['dm', 'cm', 10, 'đề-xi-mét', 'xăng-ti-mét', 'decimetre', 'centimetres'], ['m', 'cm', 100, 'mét', 'xăng-ti-mét', 'metre', 'centimetres']][f];
        const r = k * rate, grp = rate === 10 ? L('chục', 'tens') : L('trăm', 'hundreds');
        const [thing, thingE] = P(rng, [['Sợi dây', 'A rope'], ['Tấm vải', 'A piece of cloth'], ['Cái bàn', 'A table'], ['Thanh gỗ', 'A plank']]);
        return G(L(`${thing} của ${w} dài ${k} ${big}. Hỏi ${thing.toLowerCase()} đó dài bao nhiêu ${smallW}?`, `${thingE} is ${k} ${big} long. How many ${smallE} long is it?`), [
          step(L(`1 ${big} bằng bao nhiêu ${smallW}?`, `How many ${smallE} are there in 1 ${bigE}?`), ch(rng, `${rate} ${small}`, [`${rate === 10 ? 100 : 10} ${small}`, `1 ${small}`]), `1 ${big} = ${rate} ${small}.`, L('Xem lại bảng đơn vị đo độ dài.', 'Look at the table of units of length again.')),
          step(L(`${k} ${big} là ${k} lần ${rate} ${small}, tức là ${k} ${grp} ${smallW}. ${k} ${grp} là bao nhiêu?`, `${k} ${big} is ${k} lots of ${rate} ${small}: that is ${k} ${grp} of ${smallE}. How much is ${k} ${grp}?`), num(r), `${k} ${big} = ${r} ${small}.`, rate === 10 ? L(`${k} chục viết là ${k}0.`, `${k} tens is written ${k}0.`) : L(`${k} trăm viết là ${k}00.`, `${k} hundreds is written ${k}00.`)),
        ], L(`Đáp số: ${r} ${small}.`, `Answer: ${r} ${small}.`));
      },
      practice: (rng, i) => {
        const hint = L('1 dm = 10 cm; 1 m = 10 dm; 1 m = 100 cm.', '1 dm = 10 cm; 1 m = 10 dm; 1 m = 100 cm.');
        const fill = L('Tìm số thích hợp:\n', 'Find the missing number:\n');
        const conv = () => { const f = R(rng, 0, 2), k = R(rng, 2, 9); return [['m', 'dm', 10], ['dm', 'cm', 10], ['m', 'cm', 100]][f].concat([k]); };
        if (i < 4) { const [b, s, rate, k] = conv(); return Q(fill + `${k} ${b} = ? ${s}`, num(k * rate, s), L(`1 ${b} = ${rate} ${s} nên ${k} ${b} = ${k * rate} ${s}.`, `1 ${b} = ${rate} ${s}, so ${k} ${b} = ${k * rate} ${s}.`), { hint }); }
        if (i === 4) { const [b, s, rate, k] = conv(); return Q(fill + `${k * rate} ${s} = ? ${b}`, num(k, b), L(`${rate} ${s} = 1 ${b}. ${k * rate} ${s} là ${k} ${rate === 10 ? 'chục' : 'trăm'} ${s} nên bằng ${k} ${b}.`, `${rate} ${s} = 1 ${b}. ${k * rate} ${s} is ${k} ${rate === 10 ? 'tens' : 'hundreds'} of ${s}, so it is ${k} ${b}.`), { hint }); }
        if (i === 5) { const [b, s, rate, k] = conv(), c = k * rate + P(rng, [-rate / 2, 0, rate / 2, rate]); return Q(L(`Chọn dấu đúng:\n${k} ${b} … ${c} ${s}`, `Choose the right sign:\n${k} ${b} … ${c} ${s}`), cmp(k * rate, c), L(`${k} ${b} = ${k * rate} ${s}, mà ${k * rate} ${sign(k * rate, c)} ${c}.`, `${k} ${b} = ${k * rate} ${s}, and ${k * rate} ${sign(k * rate, c)} ${c}.`), { hint: L('Đổi về cùng một đơn vị rồi mới so sánh.', 'Change to the same unit, then compare.') }); }
        if (i === 6) {
          const [a, b] = carry2(rng), w = DT.name(rng), add = R(rng, 0, 1) === 1;
          return add ? Q(L(`Quãng đường từ nhà ${w} đến chợ dài ${a} km, từ chợ đến thị trấn dài ${b} km. Hỏi quãng đường từ nhà ${w} qua chợ đến thị trấn dài bao nhiêu ki-lô-mét?`, `It is ${a} km from ${w}'s house to the market and ${b} km from the market to the town. How many kilometres is it from ${w}'s house, past the market, to the town?`), num(a + b, 'km'), `${a} + ${b} = ${a + b} (km).`, { hint: L('Cộng hai quãng đường.', 'Add the two distances.'), visual: col(a, b, '+') })
            : Q(L(`Cuộn dây dài ${a + b} m. Bố đã dùng ${b} m. Hỏi cuộn dây còn lại bao nhiêu mét?`, `A roll of wire is ${a + b} m long. Dad uses ${b} m. How many metres of wire are left?`), num(a, 'm'), `${a + b} ${M} ${b} = ${a} (m).`, { hint: L('Tìm phần còn lại: làm phép trừ.', 'To find what is left, subtract.'), visual: col(a + b, b, M) });
        }
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-do-dai']); if (q) return q; }
        if (i === 7) {
          const c = R(rng, 2, 8) * 10 + P(rng, [0, 5]), w = DT.name(rng);
          return Q(L(`Thanh gỗ dài 1 m. ${w} cưa đi ${c} cm. Hỏi thanh gỗ còn lại dài bao nhiêu xăng-ti-mét?`, `A plank is 1 m long. ${w} saws off ${c} cm. How many centimetres of plank are left?`), num(100 - c, 'cm'), L(`Đổi: 1 m = 100 cm. Thanh gỗ còn lại: 100 ${M} ${c} = ${100 - c} (cm).`, `Change: 1 m = 100 cm. Left: 100 ${M} ${c} = ${100 - c} (cm).`), { hint: L('Đổi 1 m ra xăng-ti-mét trước.', 'Change 1 m into centimetres first.') });
        }
        const k = R(rng, 2, 9), c = k * 10 + P(rng, [-6, -3, 4, 7]), [x, y] = DT.names(rng, 2), ans = k * 10 > c ? x : y;
        return Q(L(`Sợi dây của ${x} dài ${k} m. Sợi dây của ${y} dài ${c} dm. Sợi dây của bạn nào dài hơn?`, `${x}'s rope is ${k} m long. ${y}'s rope is ${c} dm long. Whose rope is longer?`), ch(rng, ans, [ans === x ? y : x]), L(`Đổi: ${k} m = ${k * 10} dm. ${k * 10} ${sign(k * 10, c)} ${c} nên sợi dây của ${ans} dài hơn.`, `Change: ${k} m = ${k * 10} dm. ${k * 10} ${sign(k * 10, c)} ${c}, so ${ans}'s rope is longer.`), { hint: L('Đổi về cùng một đơn vị rồi mới so sánh.', 'Change to the same unit, then compare.') });
      },
    },

    {
      id: 'g2-dt-tien', sem: 2, icon: '💵', lesson: 'g2-c11-b56',
      title: L('Bài toán về tiền Việt Nam', 'Word problems with Vietnamese money'),
      spot: L('Bài có các tờ tiền 100 đồng, 200 đồng, 500 đồng, 1000 đồng: hỏi có tất cả bao nhiêu tiền, mua hàng hết bao nhiêu, còn lại hay được trả lại bao nhiêu.', 'The problem has 100, 200, 500 and 1000 dong notes. It asks how much money there is altogether, how much something costs, or how much is left or given back.'),
      steps: [
        L('Bước 1: Xem có những tờ tiền nào, mỗi tờ bao nhiêu đồng.', 'Step 1: See which notes there are and how much each one is worth.'),
        L('Bước 2: Có tất cả: cộng giá trị các tờ tiền. Còn lại, trả lại: lấy tiền có trừ tiền mua.', 'Step 2: Altogether: add the values of the notes. Left or change: take the price away from the money you have.'),
        L('Bước 3: Viết chữ “đồng” sau kết quả.', 'Step 3: Write "dong" after the result.'),
      ],
      tip: L('Đếm số tờ tiền không cho biết số tiền. 3 tờ 200 đồng là 600 đồng, không phải 3 đồng.', 'Counting the notes does not tell you the amount. Three 200 dong notes are 600 dong, not 3 dong.'),
      guide: rng => {
        let notes = [500, 200];
        for (let g = 0; g < 40; g++) { const t = Array.from({ length: R(rng, 2, 4) }, () => P(rng, [100, 200, 500])); if (sum(t) <= 1000) { notes = t; break; } }
        notes.sort((x, y) => y - x);
        const s = sum(notes), w = DT.name(rng), list = notes.map(v => L(`${v} đồng`, `${v} dong`)).join(', ');
        return G(L(`${w} có các tờ tiền: ${list}. Hỏi ${w} có tất cả bao nhiêu tiền?`, `${w} has these notes: ${list}. How much money does ${w} have altogether?`), [
          step(L(`${w} có mấy tờ tiền?`, `How many notes does ${w} have?`), num(notes.length), L(`${w} có ${notes.length} tờ tiền: ${list}.`, `${w} has ${notes.length} notes: ${list}.`)),
          step(L('Muốn biết có tất cả bao nhiêu tiền, em làm thế nào?', 'How do you find how much money there is altogether?'), ch(rng, L('Cộng giá trị các tờ tiền', 'Add the values of the notes'), [L('Đếm số tờ tiền', 'Count the notes'), L('Lấy tờ lớn nhất', 'Take the biggest note')]), L('Ta cộng giá trị của tất cả các tờ tiền.', 'We add the values of all the notes.')),
          step(`${notes.join(' + ')} = ?`, num(s, D), L(`${w} có tất cả số tiền là: ${notes.join(' + ')} = ${F(s)} (đồng).`, `${w} has altogether: ${notes.join(' + ')} = ${F(s)} (dong).`), L('Cộng các số tròn trăm: cộng số trăm với nhau.', 'To add hundreds, add the numbers of hundreds.')),
        ], L(`Đáp số: ${F(s)} đồng.`, `Answer: ${F(s)} dong.`), vz('money', { notes }));
      },
      practice: (rng, i) => {
        const w = DT.name(rng);
        const THINGS = [['cái bút chì', 'a pencil'], ['cục tẩy', 'a rubber'], ['cái kẹo mút', 'a lollipop'], ['tờ giấy màu', 'a sheet of coloured paper'], ['cái nhãn vở', 'a book label'], ['gói bánh', 'a packet of biscuits']];
        if (i < 4) {
          let notes = [500, 200];
          for (let g = 0; g < 40; g++) { const t = Array.from({ length: R(rng, 2, i < 2 ? 3 : 4) }, () => P(rng, [100, 200, 500])); if (sum(t) <= 1000) { notes = t; break; } }
          notes.sort((x, y) => y - x); const s = sum(notes);
          return Q(L(`${w} bỏ vào lợn đất các tờ tiền như hình. Hỏi ${w} đã bỏ vào lợn đất bao nhiêu tiền?`, `${w} puts these notes into a piggy bank. How much money does ${w} put in?`), num(s, D), `${notes.join(' + ')} = ${F(s)} (${D}).`, { hint: L('Cộng giá trị các tờ tiền.', 'Add up the values of the notes.'), visual: vz('money', { notes }) });
        }
        const [t1, t2] = U.sample(rng, THINGS, 2);
        if (i === 4) { const price = R(rng, 1, 9) * 100; return Q(L(`${w} mua ${t1[0]} giá ${price} đồng. ${w} đưa cô bán hàng tờ 1000 đồng. Hỏi cô bán hàng trả lại ${w} bao nhiêu tiền?`, `${w} buys ${t1[1]} for ${price} dong and gives the shopkeeper a 1000 dong note. How much change does ${w} get?`), num(1000 - price, D), L(`Số tiền cô trả lại là: 1000 ${M} ${price} = ${1000 - price} (đồng).`, `Change: 1000 ${M} ${price} = ${1000 - price} (dong).`), { hint: L('Lấy số tiền đưa trừ giá tiền.', 'Take the price away from the money given.'), visual: vz('money', { notes: [1000] }) }); }
        if (i === 5) { const [big, small] = P(rng, [[1000, 500], [1000, 200], [500, 100], [200, 100]]), k = big / small; return Q(L(`${w} đổi 1 tờ ${big} đồng lấy các tờ ${small} đồng. Hỏi ${w} nhận được mấy tờ ${small} đồng?`, `${w} changes one ${big} dong note for ${small} dong notes. How many ${small} dong notes does ${w} get?`), num(k, L('tờ', 'notes')), L(`${Array(k).fill(small).join(' + ')} = ${big} (đồng), nên đổi được ${k} tờ ${small} đồng.`, `${Array(k).fill(small).join(' + ')} = ${big} (dong), so ${w} gets ${k} notes of ${small} dong.`), { hint: L(`Cộng các tờ ${small} đồng cho đến khi được ${big} đồng.`, `Add ${small} dong notes until you reach ${big} dong.`), visual: vz('money', { notes: [big] }) }); }
        if (i === 6) { const have = R(rng, 5, 9) * 100, price = R(rng, 1, have / 100 - 1) * 100; return Q(L(`${w} có ${have} đồng. ${w} mua ${t1[0]} hết ${price} đồng. Hỏi ${w} còn lại bao nhiêu tiền?`, `${w} has ${have} dong. ${w} buys ${t1[1]} for ${price} dong. How much money does ${w} have left?`), num(have - price, D), L(`Số tiền còn lại là: ${have} ${M} ${price} = ${have - price} (đồng).`, `Money left: ${have} ${M} ${price} = ${have - price} (dong).`), { hint: L('Tiền còn lại = tiền có − tiền mua.', 'Money left = money you have − price.') }); }
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-tien']); if (q) return q; }
        const a = R(rng, 2, 6) * 100 + P(rng, [0, 50]), b = R(rng, 1, 3) * 100 + P(rng, [0, 50]);
        if (i === 7) return Q(L(`${w} mua ${t1[0]} giá ${a} đồng và ${t2[0]} giá ${b} đồng. Hỏi ${w} phải trả tất cả bao nhiêu tiền?`, `${w} buys ${t1[1]} for ${a} dong and ${t2[1]} for ${b} dong. How much does ${w} pay altogether?`), num(a + b, D), L(`Số tiền phải trả là: ${a} + ${b} = ${a + b} (đồng).`, `To pay: ${a} + ${b} = ${a + b} (dong).`), { hint: L('Cộng giá tiền hai món hàng.', 'Add the two prices.'), visual: col(a, b, '+') });
        const hi = a + b;
        return Q(L(`${cap(t1[0])} giá ${hi} đồng, ${t2[0]} giá ${a} đồng. Hỏi ${t1[0]} đắt hơn ${t2[0]} bao nhiêu tiền?`, `${cap(t1[1])} costs ${hi} dong and ${t2[1]} costs ${a} dong. How much more does ${t1[1]} cost?`), num(b, D), L(`${hi} ${M} ${a} = ${b} (đồng).`, `${hi} ${M} ${a} = ${b} (dong).`), { hint: L('Đắt hơn bao nhiêu: lấy giá cao trừ giá thấp.', 'How much more: take the lower price away from the higher price.'), visual: col(hi, a, M) });
      },
    },

    {
      id: 'g2-dt-loi-van-1000', sem: 2, icon: '📝', lesson: 'g2-c12-b62',
      title: L('Bài toán có lời văn trong phạm vi 1000', 'Word problems with numbers to 1000'),
      spot: L('Bài toán một bước với các số có ba chữ số: thêm, bớt, gộp lại, nhiều hơn, ít hơn.', 'One-step problems with 3-digit numbers: more, take away, altogether, more than, fewer than.'),
      steps: [
        L('Bước 1: Đọc kĩ. Số cần tìm lớn hơn hay bé hơn số đã cho?', 'Step 1: Read carefully. Is the amount to find more or less than the number given?'),
        L('Bước 2: Lớn hơn (thêm, gộp, nhiều hơn): cộng. Bé hơn (bớt, còn lại, ít hơn): trừ.', 'Step 2: More (added, altogether, more than): add. Less (taken away, left, fewer than): subtract.'),
        L('Bước 3: Đặt tính, tính từ hàng đơn vị, nhớ sang hàng bên trái nếu cần.', 'Step 3: Set out the calculation, start with the ones, and carry or borrow if you need to.'),
      ],
      tip: L('Số có ba chữ số phải đặt tính thẳng cột: đơn vị dưới đơn vị, chục dưới chục, trăm dưới trăm.', 'Line up 3-digit numbers in columns: ones under ones, tens under tens, hundreds under hundreds.'),
      guide: rng => {
        const f = R(rng, 0, 5), add = f === 0 || f === 1 || f === 4, [a, b] = add ? add3(rng, false) : sub3(rng, false), r = add ? a + b : a - b, op = add ? '+' : M, st = bigStory(f, a, b);
        const more = L('Lớn hơn', 'More'), less = L('Bé hơn', 'Less');
        return G(L(st.vi, st.en), [
          step(L(`Số cần tìm lớn hơn hay bé hơn ${a}?`, `Is the amount to find more than or less than ${a}?`), ch(rng, add ? more : less, [add ? less : more]), L(st.why[0], st.why[1])),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} ${op} ${b}`, [add ? `${Math.max(a, b)} ${M} ${Math.min(a, b)}` : `${a} + ${b}`]), add ? L(`Số cần tìm lớn hơn nên làm phép cộng: ${a} + ${b}.`, `The amount to find is more, so add: ${a} + ${b}.`) : L(`Số cần tìm bé hơn nên làm phép trừ: ${a} ${M} ${b}.`, `The amount to find is less, so subtract: ${a} ${M} ${b}.`)),
          step(`${a} ${op} ${b} = ?`, num(r), `${L(st.sol[0], st.sol[1])}: ${a} ${op} ${b} = ${r} (${st.u}).`, L('Tính từ hàng đơn vị, rồi hàng chục, rồi hàng trăm.', 'Start with the ones, then the tens, then the hundreds.')),
        ], L(`Đáp số: ${r} ${st.u}.`, `Answer: ${r} ${st.u}.`), col(a, b, op));
      },
      practice: (rng, i) => {
        if (i === 9) { const q = DT.bank(rng, ['g2-nc-hon-kem-1000']); if (q) return q; }
        const f = i < 2 ? i : i < 4 ? i : i < 7 ? R(rng, 0, 5) : R(rng, 4, 5), add = f === 0 || f === 1 || f === 4, hard = i >= 4;
        const [a, b] = add ? add3(rng, hard) : sub3(rng, hard), r = add ? a + b : a - b, op = add ? '+' : M, st = bigStory(f, a, b);
        const hint = add ? L('Số cần tìm lớn hơn: làm phép cộng.', 'The amount to find is more: add.') : L('Số cần tìm bé hơn: làm phép trừ.', 'The amount to find is less: subtract.');
        if (i === 6) return Q(L(st.vi, st.en) + L('\nEm chọn phép tính giải bài toán:', '\nChoose the calculation that solves the problem:'), ch(rng, `${a} ${op} ${b} = ${r}`, [add ? `${Math.max(a, b)} ${M} ${Math.min(a, b)} = ${Math.abs(a - b)}` : a + b <= 1000 ? `${a} + ${b} = ${a + b}` : `${a} ${M} ${b} = ${r + 10}`, `${a} ${op} ${b} = ${r >= 200 ? r - 100 : r + 100}`]), `${L(st.sol[0], st.sol[1])}: ${a} ${op} ${b} = ${r} (${st.u}).`, { hint });
        return Q(L(st.vi, st.en), num(r, st.u), `${L(st.sol[0], st.sol[1])}: ${a} ${op} ${b} = ${r} (${st.u}).`, { hint, visual: col(a, b, op) });
      },
    },
  ]);

  // one-step stories with 3-digit numbers. f: 0 thêm, 1 gộp, 2 bớt, 3 còn phải đi, 4 nhiều hơn, 5 ít hơn
  function bigStory(f, a, b) {
    return [
      { u: L('học sinh', 'pupils'), sol: ['Năm nay trường có số học sinh là', 'Pupils this year'], why: ['Trường nhận thêm học sinh nên số học sinh nhiều lên.', 'The school takes more pupils, so there are more.'],
        vi: `Năm ngoái một trường tiểu học có ${a} học sinh. Năm nay trường nhận thêm ${b} học sinh. Hỏi năm nay trường có tất cả bao nhiêu học sinh?`, en: `Last year a primary school had ${a} pupils. This year it takes ${b} more pupils. How many pupils does the school have this year?` },
      { u: 'kg', sol: ['Cả ngày cửa hàng bán được là', 'Sold in the whole day'], why: ['Gộp buổi sáng và buổi chiều nên số gạo nhiều hơn.', 'Morning and afternoon are put together, so it is more.'],
        vi: `Buổi sáng cửa hàng bán được ${a} kg gạo, buổi chiều bán được ${b} kg gạo. Hỏi cả ngày cửa hàng bán được bao nhiêu ki-lô-gam gạo?`, en: `A shop sells ${a} kg of rice in the morning and ${b} kg in the afternoon. How many kilograms of rice does it sell in the whole day?` },
      { u: L('con gà', 'chickens'), sol: ['Trang trại còn lại số gà là', 'Chickens left'], why: ['Đã bán bớt nên số gà ít đi.', 'Some are sold, so there are fewer.'],
        vi: `Một trang trại có ${a} con gà, đã bán ${b} con gà. Hỏi trang trại còn lại bao nhiêu con gà?`, en: `A farm has ${a} chickens. It sells ${b} chickens. How many chickens does the farm have left?` },
      { u: 'km', sol: ['Ô tô còn phải đi là', 'Still to go'], why: ['Phần còn lại ngắn hơn cả quãng đường.', 'The part left is shorter than the whole way.'],
        vi: `Quãng đường dài ${a} km. Ô tô đã đi được ${b} km. Hỏi ô tô còn phải đi bao nhiêu ki-lô-mét nữa?`, en: `A journey is ${a} km long. A car has gone ${b} km. How many more kilometres does the car have to go?` },
      { u: L('cây', 'trees'), sol: ['Đội Hai trồng được số cây là', 'Trees planted by Team Two'], why: ['Đội Hai trồng nhiều hơn đội Một.', 'Team Two plants more than Team One.'],
        vi: `Đội Một trồng được ${a} cây. Đội Hai trồng được nhiều hơn đội Một ${b} cây. Hỏi đội Hai trồng được bao nhiêu cây?`, en: `Team One plants ${a} trees. Team Two plants ${b} more trees than Team One. How many trees does Team Two plant?` },
      { u: L('quyển', 'books'), sol: ['Số sách khoa học là', 'Science books'], why: ['Sách khoa học ít hơn truyện tranh.', 'There are fewer science books than comics.'],
        vi: `Thư viện có ${a} quyển truyện tranh. Số sách khoa học ít hơn số truyện tranh ${b} quyển. Hỏi thư viện có bao nhiêu quyển sách khoa học?`, en: `A library has ${a} comics. It has ${b} fewer science books than comics. How many science books does the library have?` },
    ][f];
  }
})();
