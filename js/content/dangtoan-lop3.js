/* Toán ISA — Học dạng toán, lớp 3 (SGK Toán 3 "Kết nối tri thức với cuộc sống"). Contract: DANGTOAN.md.
 * Word problems have at most TWO steps. Tables 2–9, dividing by a one-digit number. Học kì I: numbers within 1000;
 * học kì II: to 100 000. Nothing of lớp 4 (no tổng – hiệu, trung bình cộng, rút về đơn vị, distributive property).
 */
(function () {
  'use strict';
  const L = DT.L, R = DT.R, P = DT.P, M = DT.M, F = DT.F, num = DT.num, ch = DT.ch, vz = DT.vz, Q = DT.Q, step = DT.step;

  // ---------- small helpers ----------
  const G = (prompt, steps, done, visual) => Object.assign({ prompt, steps, done }, visual ? { visual } : {});
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const cmp = (a, b) => ({ kind: 'text', options: ['<', '>', '='], correct: a < b ? 0 : a > b ? 1 : 2 });
  const units = (x, max) => Math.max(1, Math.round(x * 12 / Math.max(1, max)));   // bar lengths of a tape diagram
  const tapeK = (la, a, lb, k, big) => vz('tape', { bars: [{ label: la, parts: 1, units: 1, value: a }, { label: lb, parts: k, units: k, value: big }] });   // 1 part against k parts
  const D = L('đồng', 'dong');
  const lc1 = s => (U.NAMES.some(n => s.startsWith(n + "'")) ? s : s[0].toLowerCase() + s.slice(1));   // keeps "Trang's …"
  const uk = (it, k) => L(it[0], k === 1 ? it[1] : it[2]);   // unit of a count: [Vietnamese, English singular, plural]
  // two-step problems, "what must you find first?": the two usual wrong ideas
  const WRONG_FIRST = [L('Một số đã cho sẵn trong đề bài', 'A number already given in the problem'), L('Không cần tìm gì, cộng luôn hai số trong đề', 'Nothing: just add the two numbers in the problem')];
  // choices for a time of day: the right one, 5 or 10 minutes off, and one hour later
  const timeCh = (rng, h, m) => ch(rng, hm(h, m), [m + 5, m - 5, m + 10, m - 10].filter(z => z >= 0 && z <= 55).slice(0, 2).map(z => hm(h, z)).concat([hm(h + 1, m)]));
  const two = rng => DT.names(rng, 2);
  const hm = (h, m) => L(m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`, `${h}:${String(m).padStart(2, '0')}`);   // a time of day
  const mins = k => L(`${k} phút`, `${k} ${k === 1 ? 'minute' : 'minutes'}`);

  /* ---- Tìm thành phần: t = 0, 1, 2 ---- */
  const CT_NAME = [L('Số hạng', 'An addend'), L('Số bị trừ', 'The minuend'), L('Số trừ', 'The subtrahend')];
  const CT_name = [L('số hạng chưa biết', 'the missing addend'), L('số bị trừ', 'the minuend'), L('số trừ', 'the subtrahend')];
  const CT_RULE = [L('Lấy tổng trừ đi số hạng kia', 'Subtract the other addend from the sum'), L('Lấy hiệu cộng với số trừ', 'Add the difference and the subtrahend'), L('Lấy số bị trừ trừ đi hiệu', 'Subtract the difference from the minuend')];
  const CT_WRONG = [L('Lấy tổng cộng với số hạng kia', 'Add the sum and the other addend'), L('Lấy hiệu trừ đi số trừ', 'Subtract the subtrahend from the difference'), L('Lấy số bị trừ cộng với hiệu', 'Add the minuend and the difference')];
  // a + b = s. t 0: ? + b = s; t 1: ? − b = a; t 2: s − ? = a
  function ct(t, a, b) {
    const s = a + b;
    return t === 0 ? { expr: `? + ${F(b)} = ${F(s)}`, x: a, calc: `${F(s)} ${M} ${F(b)}`, chk: `${F(a)} + ${F(b)}`, chkV: s }
      : t === 1 ? { expr: `? ${M} ${F(b)} = ${F(a)}`, x: s, calc: `${F(a)} + ${F(b)}`, chk: `${F(s)} ${M} ${F(b)}`, chkV: a }
        : { expr: `${F(s)} ${M} ? = ${F(a)}`, x: b, calc: `${F(s)} ${M} ${F(a)}`, chk: `${F(s)} ${M} ${F(b)}`, chkV: a };
  }
  const NC_NAME = [L('Thừa số', 'A factor'), L('Số bị chia', 'The dividend'), L('Số chia', 'The divisor')];
  const NC_name = [L('thừa số chưa biết', 'the missing factor'), L('số bị chia', 'the dividend'), L('số chia', 'the divisor')];
  const NC_RULE = [L('Lấy tích chia cho thừa số kia', 'Divide the product by the other factor'), L('Lấy thương nhân với số chia', 'Multiply the quotient by the divisor'), L('Lấy số bị chia chia cho thương', 'Divide the dividend by the quotient')];
  const NC_WRONG = [L('Lấy tích nhân với thừa số kia', 'Multiply the product by the other factor'), L('Lấy thương chia cho số chia', 'Divide the quotient by the divisor'), L('Lấy số bị chia nhân với thương', 'Multiply the dividend by the quotient')];
  // q × b = p. t 0: ? × b = p; t 1: ? : b = q; t 2: p : ? = q
  function nc(t, q, b) {
    const p = q * b;
    return t === 0 ? { expr: `? × ${b} = ${F(p)}`, x: q, calc: `${F(p)} : ${b}`, chk: `${F(q)} × ${b}`, chkV: p }
      : t === 1 ? { expr: `? : ${b} = ${F(q)}`, x: p, calc: `${F(q)} × ${b}`, chk: `${F(p)} : ${b}`, chkV: q }
        : { expr: `${F(p)} : ? = ${F(q)}`, x: b, calc: `${F(p)} : ${F(q)}`, chk: `${F(p)} : ${b}`, chkV: q };
  }

  /* ---- story builders ---- */
  // 1/n of t things (t = n × q)
  function partStory(rng, t, n) {
    const w = DT.name(rng);
    const all = [
      { u: L('cái kẹo', 'sweets'), lab: L('Số kẹo', 'Sweets'), sol: L(`Số kẹo ${w} cho em là`, `Sweets ${w} gives away`), vi: `${w} có ${t} cái kẹo. ${w} cho em 1/${n} số kẹo đó. Hỏi ${w} cho em bao nhiêu cái kẹo?`, en: `${w} has ${t} sweets and gives 1/${n} of them to a younger child. How many sweets does ${w} give away?` },
      { u: L('quả cam', 'oranges'), lab: L('Số cam', 'Oranges'), sol: L('Số cam mẹ biếu bà là', 'Oranges for Grandma'), vi: `Mẹ mua ${t} quả cam. Mẹ biếu bà 1/${n} số cam đó. Hỏi mẹ biếu bà bao nhiêu quả cam?`, en: `Mum buys ${t} oranges. She gives 1/${n} of them to Grandma. How many oranges does Mum give Grandma?` },
      { u: 'm', lab: L('Số vải', 'Cloth'), sol: L('Số mét vải đã bán là', 'Cloth sold'), vi: `Một cửa hàng có ${t} m vải. Cửa hàng đã bán 1/${n} số vải đó. Hỏi cửa hàng đã bán bao nhiêu mét vải?`, en: `A shop has ${t} m of cloth. It sells 1/${n} of the cloth. How many metres of cloth does the shop sell?` },
      { u: L('trang', 'pages'), lab: L('Số trang', 'Pages'), sol: L(`Số trang ${w} đã đọc là`, `Pages ${w} has read`), vi: `Quyển truyện có ${t} trang. ${w} đã đọc 1/${n} số trang đó. Hỏi ${w} đã đọc bao nhiêu trang?`, en: `A storybook has ${t} pages. ${w} has read 1/${n} of the pages. How many pages has ${w} read?` },
      { u: L('học sinh', 'pupils'), lab: L('Cả lớp', 'Class'), sol: L('Số học sinh tham gia câu lạc bộ là', 'Pupils in the club'), vi: `Lớp 3A có ${t} học sinh. 1/${n} số học sinh của lớp tham gia câu lạc bộ cờ vua. Hỏi lớp 3A có bao nhiêu học sinh tham gia câu lạc bộ cờ vua?`, en: `Class 3A has ${t} pupils. 1/${n} of the pupils are in the chess club. How many pupils of class 3A are in the chess club?` },
      { u: 'kg', lab: L('Số gạo', 'Rice'), sol: L('Số gạo đã bán là', 'Rice sold'), vi: `Một cửa hàng có ${t} kg gạo. Cửa hàng đã bán 1/${n} số gạo đó. Hỏi cửa hàng đã bán bao nhiêu ki-lô-gam gạo?`, en: `A shop has ${t} kg of rice. It sells 1/${n} of the rice. How many kilograms of rice does the shop sell?` },
    ];
    return P(rng, t > 45 ? [all[2], all[3], all[5]] : all);   // big numbers: cloth, pages, rice (not a class of 91 pupils)
  }
  // "gấp k lần": the first has a, the second has k times as much
  function gapStory(rng, a, k) {
    const [x, y] = two(rng);
    return P(rng, [
      { la: x, lb: y, u: L('viên bi', 'marbles'), sol: L(`Số bi của ${y} là`, `${y}'s marbles`), vi: `${x} có ${a} viên bi. Số bi của ${y} gấp ${k} lần số bi của ${x}. Hỏi ${y} có bao nhiêu viên bi?`, en: `${x} has ${a} marbles. ${y} has ${k} times as many marbles as ${x}. How many marbles does ${y} have?` },
      { la: L('Dây xanh', 'Blue'), lb: L('Dây đỏ', 'Red'), u: 'cm', sol: L('Đoạn dây đỏ dài là', 'Length of the red string'), vi: `Đoạn dây xanh dài ${a} cm. Đoạn dây đỏ dài gấp ${k} lần đoạn dây xanh. Hỏi đoạn dây đỏ dài bao nhiêu xăng-ti-mét?`, en: `The blue string is ${a} cm long. The red string is ${k} times as long as the blue string. How many centimetres long is the red string?` },
      { la: L('Bao nhỏ', 'Small'), lb: L('Bao to', 'Big'), u: 'kg', sol: L('Bao gạo to nặng là', 'Weight of the big sack'), vi: `Bao gạo nhỏ nặng ${a} kg. Bao gạo to nặng gấp ${k} lần bao gạo nhỏ. Hỏi bao gạo to nặng bao nhiêu ki-lô-gam?`, en: `The small sack of rice weighs ${a} kg. The big sack weighs ${k} times as much as the small sack. How many kilograms does the big sack weigh?` },
      { la: L('Tổ Một', 'Group One'), lb: L('Tổ Hai', 'Group Two'), u: L('cây', 'trees'), sol: L('Số cây tổ Hai trồng được là', 'Trees planted by Group Two'), vi: `Tổ Một trồng được ${a} cây. Số cây tổ Hai trồng được gấp ${k} lần số cây của tổ Một. Hỏi tổ Hai trồng được bao nhiêu cây?`, en: `Group One plants ${a} trees. Group Two plants ${k} times as many trees as Group One. How many trees does Group Two plant?` },
      { la: L('Can nhỏ', 'Small'), lb: L('Can to', 'Big'), u: 'l', sol: L('Can to đựng là', 'The big can holds'), vi: `Can nhỏ đựng ${a} l nước. Can to đựng gấp ${k} lần can nhỏ. Hỏi can to đựng bao nhiêu lít nước?`, en: `The small can holds ${a} l of water. The big can holds ${k} times as much as the small can. How many litres of water does the big can hold?` },
    ]);
  }
  // "giảm đi k lần": the first has a = q × k, the second is a made k times smaller
  function giamStory(rng, a, k) {
    return P(rng, [
      { la: L('Buổi sáng', 'Morning'), lb: L('Buổi chiều', 'Afternoon'), u: 'kg', sol: L('Buổi chiều bán được là', 'Sold in the afternoon'), vi: `Buổi sáng cửa hàng bán được ${a} kg đường. Số đường bán được buổi chiều bằng số đường buổi sáng giảm đi ${k} lần. Hỏi buổi chiều cửa hàng bán được bao nhiêu ki-lô-gam đường?`, en: `A shop sells ${a} kg of sugar in the morning. In the afternoon it sells that amount made ${U.readEN(k)} times smaller. How many kilograms of sugar does it sell in the afternoon?` },
      { la: L('Lúc đầu', 'At first'), lb: L('Còn lại', 'Now'), u: 'm', sol: L('Sợi dây còn lại dài là', 'Length of the rope now'), vi: `Sợi dây dài ${a} m. Sau khi cắt, độ dài sợi dây giảm đi ${k} lần. Hỏi sợi dây còn lại dài bao nhiêu mét?`, en: `A rope is ${a} m long. After it is cut, it is ${k} times shorter. How many metres long is the rope now?` },
      { la: L('Vịt', 'Ducks'), lb: L('Gà', 'Chickens'), u: L('con gà', 'chickens'), sol: L('Số con gà là', 'Chickens'), vi: `Đàn vịt có ${a} con. Số gà bằng số vịt giảm đi ${k} lần. Hỏi có bao nhiêu con gà?`, en: `There are ${a} ducks. The number of chickens is the number of ducks made ${U.readEN(k)} times smaller. How many chickens are there?` },
      { la: L('Thùng to', 'Big tank'), lb: L('Thùng nhỏ', 'Small tank'), u: 'l', sol: L('Thùng nhỏ có số lít nước là', 'Water in the small tank'), vi: `Thùng to có ${a} l nước. Số lít nước ở thùng nhỏ bằng số lít nước ở thùng to giảm đi ${k} lần. Hỏi thùng nhỏ có bao nhiêu lít nước?`, en: `The big tank has ${a} l of water. The small tank has the amount in the big tank made ${U.readEN(k)} times smaller. How many litres of water are in the small tank?` },
      { la: L('Lúc đầu', 'At first'), lb: L('Còn lại', 'Left'), u: L('quả trứng', 'eggs'), sol: L('Số trứng còn lại là', 'Eggs left'), vi: `Trong rổ có ${a} quả trứng. Sau khi bán, số trứng trong rổ giảm đi ${k} lần. Hỏi trong rổ còn lại bao nhiêu quả trứng?`, en: `There are ${a} eggs in a basket. After some are sold, the number of eggs is ${k} times smaller. How many eggs are left in the basket?` },
    ]);
  }
  // a = b × k: "how many times as much?"
  function lanStory(rng, a, b) {
    return P(rng, [
      { la: L('Gà', 'Chickens'), lb: L('Vịt', 'Ducks'), vi: `Đàn gà có ${a} con, đàn vịt có ${b} con. Hỏi số gà gấp mấy lần số vịt?`, en: `There are ${a} chickens and ${b} ducks. How many times as many chickens as ducks are there?`, sol: L('Số gà gấp số vịt số lần là', 'Number of times') },
      { la: L('Dây đỏ', 'Red'), lb: L('Dây xanh', 'Blue'), vi: `Sợi dây đỏ dài ${a} cm, sợi dây xanh dài ${b} cm. Hỏi sợi dây đỏ dài gấp mấy lần sợi dây xanh?`, en: `The red string is ${a} cm long and the blue string is ${b} cm long. How many times as long as the blue string is the red string?`, sol: L('Sợi dây đỏ dài gấp sợi dây xanh số lần là', 'Number of times') },
      { la: L('Thùng to', 'Tank'), lb: L('Can nhỏ', 'Can'), vi: `Thùng to chứa ${a} l nước, can nhỏ chứa ${b} l nước. Hỏi thùng to chứa gấp mấy lần can nhỏ?`, en: `The big tank holds ${a} l of water and the small can holds ${b} l. How many times as much as the small can does the big tank hold?`, sol: L('Thùng to chứa gấp can nhỏ số lần là', 'Number of times') },
      { la: L('Con lợn', 'Pig'), lb: L('Con ngỗng', 'Goose'), vi: `Con lợn nặng ${a} kg, con ngỗng nặng ${b} kg. Hỏi con lợn nặng gấp mấy lần con ngỗng?`, en: `A pig weighs ${a} kg and a goose weighs ${b} kg. How many times as heavy as the goose is the pig?`, sol: L('Con lợn nặng gấp con ngỗng số lần là', 'Number of times') },
      { la: L('Vở', 'Exercise books'), lb: L('Truyện', 'Storybooks'), vi: `Trên giá có ${a} quyển vở và ${b} quyển truyện. Hỏi số quyển vở gấp mấy lần số quyển truyện?`, en: `There are ${a} exercise books and ${b} storybooks on a shelf. How many times as many exercise books as storybooks are there?`, sol: L('Số quyển vở gấp số quyển truyện số lần là', 'Number of times') },
    ]);
  }
  // equal sharing with a remainder: a = b × q + r
  function duStory(rng, a, b) {
    return P(rng, [
      { it: ['cái kẹo', 'sweet', 'sweets'], one: ['bạn', 'child'], vi: `Có ${a} cái kẹo chia đều cho ${b} bạn. Hỏi mỗi bạn được nhiều nhất mấy cái kẹo và còn thừa mấy cái kẹo?`, en: `${a} sweets are shared equally between ${b} children. What is the greatest number of sweets each child can get, and how many sweets are left over?`, qEach: L(`Có ${a} cái kẹo chia đều cho ${b} bạn. Hỏi mỗi bạn được nhiều nhất mấy cái kẹo?`, `${a} sweets are shared equally between ${b} children. What is the greatest number of sweets each child can get?`), qLeft: L(`Có ${a} cái kẹo chia đều cho ${b} bạn, mỗi bạn được số kẹo nhiều nhất có thể. Hỏi còn thừa mấy cái kẹo?`, `${a} sweets are shared equally between ${b} children, as many each as possible. How many sweets are left over?`) },
      { it: ['bông hoa', 'flower', 'flowers'], one: ['lọ', 'vase'], vi: `Có ${a} bông hoa cắm đều vào ${b} lọ. Hỏi mỗi lọ cắm được nhiều nhất mấy bông hoa và còn thừa mấy bông hoa?`, en: `${a} flowers are put equally into ${b} vases. What is the greatest number of flowers in each vase, and how many flowers are left over?`, qEach: L(`Có ${a} bông hoa cắm đều vào ${b} lọ. Hỏi mỗi lọ cắm được nhiều nhất mấy bông hoa?`, `${a} flowers are put equally into ${b} vases. What is the greatest number of flowers in each vase?`), qLeft: L(`Có ${a} bông hoa cắm đều vào ${b} lọ, mỗi lọ nhiều hoa nhất có thể. Hỏi còn thừa mấy bông hoa?`, `${a} flowers are put equally into ${b} vases, as many in each as possible. How many flowers are left over?`) },
      { it: ['quyển vở', 'exercise book', 'exercise books'], one: ['bạn', 'child'], vi: `Cô giáo có ${a} quyển vở, chia đều cho ${b} bạn. Hỏi mỗi bạn được nhiều nhất mấy quyển vở và cô còn thừa mấy quyển vở?`, en: `The teacher has ${a} exercise books and shares them equally between ${b} children. What is the greatest number each child can get, and how many are left over?`, qEach: L(`Cô giáo có ${a} quyển vở, chia đều cho ${b} bạn. Hỏi mỗi bạn được nhiều nhất mấy quyển vở?`, `The teacher shares ${a} exercise books equally between ${b} children. What is the greatest number each child can get?`), qLeft: L(`Cô giáo có ${a} quyển vở, chia đều cho ${b} bạn, mỗi bạn được nhiều vở nhất có thể. Hỏi cô còn thừa mấy quyển vở?`, `The teacher shares ${a} exercise books equally between ${b} children, as many each as possible. How many exercise books are left over?`) },
    ]);
  }

  // two-step problems. Returns the two calculations and what must be found first.
  function twoStep(rng, t) {
    const x = DT.name(rng);
    if (t === 0 || t === 4) {   // more / fewer, then the total
      const more = t === 0, a = R(rng, 18, 45), d = R(rng, 4, 15), b = more ? a + d : a - d, s = a + b;
      const c = P(rng, [
        { u: 'l', first: L('Số lít dầu ở thùng thứ hai', 'The litres of oil in the second barrel'), s1: L('Thùng thứ hai có số lít dầu là', 'Oil in the second barrel'), s2: L('Cả hai thùng có số lít dầu là', 'Oil in the two barrels'), la: L('Thùng 1', 'Barrel 1'), lb: L('Thùng 2', 'Barrel 2'),
          vi: `Thùng thứ nhất có ${a} l dầu. Thùng thứ hai có ${more ? 'nhiều' : 'ít'} hơn thùng thứ nhất ${d} l dầu. Hỏi cả hai thùng có bao nhiêu lít dầu?`, en: `The first barrel has ${a} l of oil. The second barrel has ${d} l ${more ? 'more' : 'less'} than the first. How many litres of oil do the two barrels have altogether?` },
        { u: L('cây', 'trees'), first: L('Số cây đội Hai trồng được', 'The trees Team Two plants'), s1: L('Đội Hai trồng được số cây là', 'Trees planted by Team Two'), s2: L('Cả hai đội trồng được số cây là', 'Trees planted by the two teams'), la: L('Đội Một', 'Team One'), lb: L('Đội Hai', 'Team Two'),
          vi: `Đội Một trồng được ${a} cây. Đội Hai trồng được ${more ? 'nhiều' : 'ít'} hơn đội Một ${d} cây. Hỏi cả hai đội trồng được bao nhiêu cây?`, en: `Team One plants ${a} trees. Team Two plants ${d} ${more ? 'more' : 'fewer'} trees than Team One. How many trees do the two teams plant altogether?` },
        { u: L('quyển sách', 'books'), first: L('Số sách ở ngăn dưới', 'The books on the bottom shelf'), s1: L('Ngăn dưới có số quyển sách là', 'Books on the bottom shelf'), s2: L('Cả hai ngăn có số quyển sách là', 'Books on the two shelves'), la: L('Ngăn trên', 'Top'), lb: L('Ngăn dưới', 'Bottom'),
          vi: `Ngăn trên có ${a} quyển sách. Ngăn dưới có ${more ? 'nhiều' : 'ít'} hơn ngăn trên ${d} quyển sách. Hỏi cả hai ngăn có bao nhiêu quyển sách?`, en: `The top shelf has ${a} books. The bottom shelf has ${d} ${more ? 'more' : 'fewer'} books than the top shelf. How many books are there on the two shelves altogether?` },
      ]);
      return Object.assign(c, { e1: `${a} ${more ? '+' : M} ${d}`, w1: `${a} ${more ? M : '+'} ${d}`, v1: b, e2: `${a} + ${b}`, v2: s, wrongFirst: WRONG_FIRST,
        visual: vz('tape', { bars: [{ label: c.la, units: units(a, Math.max(a, b)), value: String(a) }, { label: c.lb, units: units(b, Math.max(a, b)), value: '?' }], diff: String(d), total: '?' }) });
    }
    if (t === 1) {   // equal groups, then take away
      const per = R(rng, 4, 9), n = R(rng, 3, 9), tot = per * n, e = R(rng, 2, Math.min(tot - 3, 15));
      const c = P(rng, [
        { u: L('cái bánh', 'cakes'), first: L('Số cái bánh mẹ mua', 'The cakes Mum buys'), s1: L('Mẹ mua số cái bánh là', 'Cakes Mum buys'), s2: L('Còn lại số cái bánh là', 'Cakes left'), lab: L('Số bánh', 'Cakes'),
          vi: `Mỗi hộp có ${per} cái bánh. Mẹ mua ${n} hộp bánh, cả nhà đã ăn ${e} cái bánh. Hỏi còn lại bao nhiêu cái bánh?`, en: `Each box has ${per} cakes. Mum buys ${n} boxes and the family eats ${e} cakes. How many cakes are left?` },
        { u: L('quyển vở', 'exercise books'), first: L('Số quyển vở cô giáo có', 'The exercise books the teacher has'), s1: L('Cô giáo có số quyển vở là', 'Exercise books the teacher has'), s2: L('Cô giáo còn lại số quyển vở là', 'Exercise books left'), lab: L('Số vở', 'Books'),
          vi: `Cô giáo có ${n} chồng vở, mỗi chồng có ${per} quyển vở. Cô đã phát cho học sinh ${e} quyển vở. Hỏi cô giáo còn lại bao nhiêu quyển vở?`, en: `The teacher has ${n} piles of exercise books with ${per} books in each pile. She hands out ${e} books. How many exercise books does the teacher have left?` },
        { u: L('quả trứng', 'eggs'), first: L('Số quả trứng bác Tư có', 'The eggs Uncle Tư has'), s1: L('Bác Tư có số quả trứng là', 'Eggs Uncle Tư has'), s2: L('Bác Tư còn lại số quả trứng là', 'Eggs left'), lab: L('Số trứng', 'Eggs'),
          vi: `Bác Tư có ${n} khay trứng, mỗi khay có ${per} quả trứng. Bác đã bán ${e} quả trứng. Hỏi bác Tư còn lại bao nhiêu quả trứng?`, en: `Uncle Tư has ${n} trays of eggs with ${per} eggs on each tray. He sells ${e} eggs. How many eggs does Uncle Tư have left?` },
      ]);
      return Object.assign(c, { e1: `${per} × ${n}`, w1: `${per} + ${n}`, v1: tot, e2: `${tot} ${M} ${e}`, v2: tot - e, wrongFirst: WRONG_FIRST,
        visual: vz('tape', { bars: [{ label: c.lab, parts: n, units: n, value: `${per} × ${n}` }] }) });
    }
    if (t === 2 || t === 5) {   // k times as many / k times smaller, then the total
      const up = t === 2, k = R(rng, 2, 5), q = R(rng, 4, 15), a = up ? q : q * k, b = up ? q * k : q, [y] = DT.names(rng, 2).filter(z => z !== x);
      const c = up ? { u: L('quyển truyện', 'storybooks'), first: L(`Số quyển truyện của ${y}`, `${y}'s storybooks`), s1: L(`${y} có số quyển truyện là`, `${y}'s storybooks`), s2: L('Cả hai bạn có số quyển truyện là', 'Storybooks of the two friends'), la: x, lb: y,
        vi: `${x} có ${a} quyển truyện. Số truyện của ${y} gấp ${k} lần số truyện của ${x}. Hỏi cả hai bạn có bao nhiêu quyển truyện?`, en: `${x} has ${a} storybooks. ${y} has ${k} times as many storybooks as ${x}. How many storybooks do the two friends have altogether?` }
        : { u: 'kg', first: L('Số ki-lô-gam gạo bán buổi chiều', 'The kilograms of rice sold in the afternoon'), s1: L('Buổi chiều bán được là', 'Sold in the afternoon'), s2: L('Cả ngày bán được là', 'Sold in the whole day'), la: L('Sáng', 'Morning'), lb: L('Chiều', 'Afternoon'),
          vi: `Buổi sáng cửa hàng bán được ${a} kg gạo. Số gạo bán được buổi chiều bằng số gạo buổi sáng giảm đi ${k} lần. Hỏi cả ngày cửa hàng bán được bao nhiêu ki-lô-gam gạo?`, en: `A shop sells ${a} kg of rice in the morning. In the afternoon it sells that amount made ${U.readEN(k)} times smaller. How many kilograms of rice does it sell in the whole day?` };
      return Object.assign(c, { e1: up ? `${a} × ${k}` : `${a} : ${k}`, w1: up ? `${a} + ${k}` : `${a} ${M} ${k}`, v1: b, e2: `${a} + ${b}`, v2: a + b, wrongFirst: WRONG_FIRST,
        visual: vz('tape', { bars: [{ label: c.la, parts: up ? 1 : k, units: up ? 1 : k, value: String(a) }, { label: c.lb, parts: up ? k : 1, units: up ? k : 1, value: '?' }], total: '?' }) });
    }
    // t === 3: sold twice, how much is left
    const a = R(rng, 60, 99), b = R(rng, 12, 30), c2 = R(rng, 8, a - b - 6);
    const c = P(rng, [
      { u: 'kg', first: L('Số ki-lô-gam gạo đã bán cả hai buổi', 'The kilograms of rice sold in the two sessions'), s1: L('Cả hai buổi đã bán là', 'Sold in the two sessions'), s2: L('Cửa hàng còn lại là', 'Rice left'), vi: `Một cửa hàng có ${a} kg gạo. Buổi sáng bán được ${b} kg, buổi chiều bán được ${c2} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, en: `A shop has ${a} kg of rice. It sells ${b} kg in the morning and ${c2} kg in the afternoon. How many kilograms of rice does the shop have left?` },
      { u: L('trang', 'pages'), first: L(`Số trang ${x} đã đọc trong hai ngày`, `The pages ${x} reads in the two days`), s1: L('Hai ngày đã đọc số trang là', 'Pages read in the two days'), s2: L('Số trang chưa đọc là', 'Pages still to read'), vi: `Quyển truyện có ${a} trang. Ngày thứ nhất ${x} đọc được ${b} trang, ngày thứ hai đọc được ${c2} trang. Hỏi ${x} còn bao nhiêu trang chưa đọc?`, en: `A storybook has ${a} pages. ${x} reads ${b} pages on the first day and ${c2} pages on the second day. How many pages does ${x} still have to read?` },
      { u: 'm', first: L('Số mét vải đã bán cả hai lần', 'The metres of cloth sold the two times'), s1: L('Cả hai lần đã bán là', 'Sold the two times'), s2: L('Tấm vải còn lại dài là', 'Cloth left'), vi: `Tấm vải dài ${a} m. Lần đầu cô bán hàng bán ${b} m, lần sau bán ${c2} m. Hỏi tấm vải còn lại dài bao nhiêu mét?`, en: `A roll of cloth is ${a} m long. The shopkeeper sells ${b} m, and then ${c2} m. How many metres of cloth are left?` },
    ]);
    return Object.assign(c, { e1: `${b} + ${c2}`, w1: `${a} + ${b}`, v1: b + c2, e2: `${a} ${M} ${b + c2}`, v2: a - b - c2, wrongFirst: WRONG_FIRST,
      visual: vz('tape', { bars: [{ label: L('Có', 'Had'), units: 12, value: String(a) }, { label: L('Đã bán', 'Sold'), units: units(b + c2, a), value: `${b} + ${c2}` }], diff: '?' }) });
  }

  // number expressions. k: 0 a + b − c, 1 a : b × c, 2 a + b × c, 3 a − b : c, 4 (a + b) × c, 5 a : (b − c). big: numbers within 1000
  function expr(rng, k, big) {
    const LR = L('Biểu thức chỉ có cộng, trừ (hoặc chỉ có nhân, chia): tính từ trái sang phải.', 'Only + and − (or only × and :): work from left to right.');
    const MD = L('Có cả cộng, trừ và nhân, chia: làm nhân, chia trước; cộng, trừ sau.', 'With +, − and ×, : together: do × and : first, then + and −.');
    const BR = L('Có dấu ngoặc ( ): tính trong ngoặc trước.', 'With brackets ( ): work out the brackets first.');
    if (k === 0) { const a = R(rng, big ? 120 : 20, big ? 600 : 60), b = R(rng, big ? 105 : 11, big ? 300 : 35), c = R(rng, big ? 110 : 12, a + b - 5); return { s: `${a} + ${b} ${M} ${c}`, first: `${a} + ${b}`, wrong: `${b} ${M} ${c}`, v1: a + b, s2: `${a + b} ${M} ${c}`, v: a + b - c, bad: null, rule: LR }; }
    if (k === 1) { const b = R(rng, 2, 9), q = R(rng, 2, big ? 20 : 9), c = R(rng, 2, big ? 5 : 9), a = b * q; return { s: `${a} : ${b} × ${c}`, first: `${a} : ${b}`, wrong: `${b} × ${c}`, v1: q, s2: `${q} × ${c}`, v: q * c, bad: null, rule: LR }; }
    if (k === 2) { const a = R(rng, big ? 120 : 15, big ? 500 : 60), b = R(rng, big ? 12 : 2, big ? 40 : 9), c = R(rng, 2, 9); return { s: `${a} + ${b} × ${c}`, first: `${b} × ${c}`, wrong: `${a} + ${b}`, v1: b * c, s2: `${a} + ${b * c}`, v: a + b * c, bad: (a + b) * c, rule: MD }; }
    if (k === 3) { const c = R(rng, 2, 9), q = R(rng, 2, big ? 30 : 9), b = c * q, a = R(rng, b + (big ? 100 : 5), b + (big ? 500 : 50)); return { s: `${a} ${M} ${b} : ${c}`, first: `${b} : ${c}`, wrong: `${a} ${M} ${b}`, v1: q, s2: `${a} ${M} ${q}`, v: a - q, bad: null, rule: MD }; }
    if (k === 4) { const a = R(rng, big ? 30 : 5, big ? 120 : 30), b = R(rng, big ? 20 : 3, big ? 70 : 20), c = R(rng, 2, big ? 5 : 9); return { s: `(${a} + ${b}) × ${c}`, first: `${a} + ${b}`, wrong: `${b} × ${c}`, v1: a + b, s2: `${a + b} × ${c}`, v: (a + b) * c, bad: a + b * c, rule: BR }; }
    const d = R(rng, 2, 9), q = R(rng, 2, big ? 60 : 9), a = d * q, c = R(rng, 2, big ? 40 : 20), b = d + c;
    return { s: `${a} : (${b} ${M} ${c})`, first: `${b} ${M} ${c}`, wrong: `${a} : ${b}`, v1: d, s2: `${a} : ${d}`, v: q, bad: null, rule: BR };
  }

  // rounding: place 10 / 100 / 1000 / 10 000
  const RP = { 10: L('hàng chục', 'ten'), 100: L('hàng trăm', 'hundred'), 1000: L('hàng nghìn', 'thousand'), 10000: L('hàng chục nghìn', 'ten thousand') };
  const LOOK = { 10: L('Hàng đơn vị', 'The ones'), 100: L('Hàng chục', 'The tens'), 1000: L('Hàng trăm', 'The hundreds'), 10000: L('Hàng nghìn', 'The thousands') };
  const look = { 10: L('hàng đơn vị', 'ones'), 100: L('hàng chục', 'tens'), 1000: L('hàng trăm', 'hundreds'), 10000: L('hàng nghìn', 'thousands') };
  const roundTo = (n, p) => Math.round(n / p) * p;
  // a number to round to place p: four digits for tens and hundreds (Bài 48), five digits for thousands (Bài 61)
  const pickN = (rng, p) => { const lo = Math.max(1001, p * 10 + 1), hi = p >= 1000 ? 99999 - p : 9999 - p; let n = R(rng, lo, hi); if (n % p === 0) n += Math.floor(p / 10) * R(rng, 1, 9) || 3; return n; };

  // shapes for perimeter / area: a thing, its unit
  const RECTS = [
    { vi: 'mảnh vườn hình chữ nhật', en: 'rectangular garden', u: 'm', lo: 6, hi: 40 }, { vi: 'tấm bìa hình chữ nhật', en: 'rectangular piece of card', u: 'cm', lo: 5, hi: 30 },
    { vi: 'sân chơi hình chữ nhật', en: 'rectangular playground', u: 'm', lo: 10, hi: 50 }, { vi: 'bức tranh hình chữ nhật', en: 'rectangular picture', u: 'dm', lo: 3, hi: 15 }, { vi: 'mặt bàn hình chữ nhật', en: 'rectangular table top', u: 'dm', lo: 5, hi: 20 },
  ];
  const SQS = [
    { vi: 'viên gạch hình vuông', en: 'square tile', u: 'cm', lo: 10, hi: 40 }, { vi: 'mảnh vườn hình vuông', en: 'square garden', u: 'm', lo: 5, hi: 25 },
    { vi: 'tấm bìa hình vuông', en: 'square piece of card', u: 'cm', lo: 4, hi: 20 }, { vi: 'khăn trải bàn hình vuông', en: 'square tablecloth', u: 'dm', lo: 6, hi: 18 }, { vi: 'sân hình vuông', en: 'square yard', u: 'm', lo: 6, hi: 30 },
  ];
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const rectDims = (rng, c, small) => { const b = R(rng, small ? 2 : c.lo, small ? 8 : Math.floor(c.hi * 0.6)), a = R(rng, b + 1, small ? 9 : c.hi); return [a, b]; };
  const P_RECT = L('(Chiều dài + chiều rộng) × 2', '(Length + width) × 2'), A_RECT = L('Chiều dài × chiều rộng', 'Length × width'), P_SQ = L('Cạnh × 4', 'Side × 4'), A_SQ = L('Cạnh × cạnh', 'Side × side');

  // things to buy: Vietnamese, English (with article), English plural, prices
  const GOODS = [
    ['quyển vở', 'an exercise book', 'exercise books', [5000, 6000, 7000, 8000]], ['cái bút chì', 'a pencil', 'pencils', [3000, 4000, 5000]], ['hộp sữa', 'a carton of milk', 'cartons of milk', [6000, 7000, 8000, 9000]],
    ['cái bánh mì', 'a bread roll', 'bread rolls', [5000, 6000, 7000]], ['gói kẹo', 'a bag of sweets', 'bags of sweets', [9000, 12000, 15000]], ['cái thước kẻ', 'a ruler', 'rulers', [4000, 6000, 8000]],
  ];
  const noteFor = cost => [10000, 20000, 50000, 100000].find(n => n > cost);

  DT.add(3, [
    // ================= HỌC KÌ I =================
    {
      id: 'g3-dt-tim-so-cong-tru', sem: 1, icon: '🔍', lesson: 'g3-c1-b3',
      title: L('Tìm thành phần chưa biết của phép cộng, phép trừ', 'Finding the missing number in an addition or a subtraction'),
      spot: L('Phép cộng hoặc phép trừ có một số chưa biết (dấu ?), ví dụ: ? + 25 = 60; ? − 18 = 42; 75 − ? = 30.', 'An addition or a subtraction with one unknown number (a ?), for example: ? + 25 = 60; ? − 18 = 42; 75 − ? = 30.'),
      steps: [
        L('Bước 1: Gọi tên số cần tìm: số hạng, số bị trừ hay số trừ?', 'Step 1: Name the missing number: an addend, the minuend or the subtrahend?'),
        L('Bước 2: Tìm số hạng: lấy tổng trừ đi số hạng kia.', 'Step 2: A missing addend: subtract the other addend from the sum.'),
        L('Bước 3: Tìm số bị trừ: lấy hiệu cộng với số trừ. Tìm số trừ: lấy số bị trừ trừ đi hiệu.', 'Step 3: The minuend: add the difference and the subtrahend. The subtrahend: subtract the difference from the minuend.'),
        L('Bước 4: Thử lại bằng cách thay số vừa tìm vào dấu ?.', 'Step 4: Check by putting your number in place of the ?.'),
      ],
      tip: L('Đừng nhìn dấu phép tính rồi làm theo. Với ? − 18 = 42, số cần tìm là số bị trừ nên phải cộng: 42 + 18 = 60.', 'Do not just follow the sign you see. In ? − 18 = 42 the missing number is the minuend, so you add: 42 + 18 = 60.'),
      guide: rng => {
        const t = R(rng, 0, 2), a = R(rng, 15, 60), b = R(rng, 12, 39), e = ct(t, a, b);
        return G(L(`Tìm số thích hợp thay cho dấu ?:\n${e.expr}`, `Find the number that replaces the ?:\n${e.expr}`), [
          step(L(`Trong phép tính ${e.expr}, số cần tìm gọi là gì?`, `In ${e.expr}, what is the missing number called?`), ch(rng, CT_NAME[t], CT_NAME.filter((z, k) => k !== t)), L(`Số cần tìm là ${CT_name[t]}.`, `The missing number is ${CT_name[t]}.`), L('Số hạng + số hạng = tổng. Số bị trừ − số trừ = hiệu.', 'Addend + addend = sum. Minuend − subtrahend = difference.')),
          step(L(`Muốn tìm ${CT_name[t]}, em làm thế nào?`, `How do you find ${CT_name[t]}?`), ch(rng, CT_RULE[t], [CT_WRONG[t]]), `${CT_RULE[t]}: ${e.calc}.`),
          step(`${e.calc} = ?`, num(e.x), `? = ${e.calc} = ${F(e.x)}.`),
          step(L(`Thử lại: ${e.chk} = ?`, `Check: ${e.chk} = ?`), num(e.chkV), L(`${e.chk} = ${F(e.chkV)}. Đúng với đề bài.`, `${e.chk} = ${F(e.chkV)}. It matches the problem.`)),
        ], L(`Đáp số: ${F(e.x)}.`, `Answer: ${F(e.x)}.`), t === 0 ? vz('tape', { bars: [{ label: '', units: units(a, a + b), value: '?' }, { label: '', units: units(b, a + b), value: String(b) }], total: String(a + b) }) : null);
      },
      practice: (rng, i) => {
        const find = L('Tìm số thích hợp thay cho dấu ?:\n', 'Find the number that replaces the ?:\n');
        const big = i >= 3, a = big ? R(rng, 120, 480) : R(rng, 15, 60), b = big ? R(rng, 105, 390) : R(rng, 12, 39), s = a + b, w = DT.name(rng);
        if (i < 4) { const t = i < 3 ? i : R(rng, 0, 2), e = ct(t, a, b); return Q(find + e.expr, num(e.x), L(`Số cần tìm là ${CT_name[t]}. ${CT_RULE[t]}: ${e.calc} = ${F(e.x)}.`, `The missing number is ${CT_name[t]}. ${CT_RULE[t]}: ${e.calc} = ${F(e.x)}.`), { hint: CT_RULE[t] + '.' }); }
        if (i === 4) {
          const t = R(rng, 0, 2), e = ct(t, a, b);
          const p = [L(`${w} nghĩ ra một số. Lấy số đó cộng với ${b} thì được ${s}. Tìm số ${w} đã nghĩ.`, `${w} thinks of a number. That number plus ${b} is ${s}. Find ${w}'s number.`), L(`${w} nghĩ ra một số. Lấy số đó trừ đi ${b} thì được ${a}. Tìm số ${w} đã nghĩ.`, `${w} thinks of a number. That number minus ${b} is ${a}. Find ${w}'s number.`), L(`${w} nghĩ ra một số. Lấy ${s} trừ đi số đó thì được ${a}. Tìm số ${w} đã nghĩ.`, `${w} thinks of a number. ${s} minus that number is ${a}. Find ${w}'s number.`)][t];
          return Q(p, num(e.x), L(`Viết thành: ${e.expr}. ${CT_RULE[t]}: ${e.calc} = ${F(e.x)}.`, `Write it as: ${e.expr}. ${CT_RULE[t]}: ${e.calc} = ${F(e.x)}.`), { hint: L('Viết lại thành phép tính có dấu ?.', 'Write it as a calculation with a ?.') });
        }
        if (i === 5) {
          const t = R(rng, 0, 2), e = ct(t, a, b);
          const p = [L(`Tổng của hai số là ${s}. Một số hạng là ${b}. Tìm số hạng kia.`, `The sum of two numbers is ${s}. One addend is ${b}. Find the other addend.`), L(`Hiệu của hai số là ${a}, số trừ là ${b}. Tìm số bị trừ.`, `The difference of two numbers is ${a} and the subtrahend is ${b}. Find the minuend.`), L(`Số bị trừ là ${s}, hiệu là ${a}. Tìm số trừ.`, `The minuend is ${s} and the difference is ${a}. Find the subtrahend.`)][t];
          return Q(p, num(e.x), `${CT_RULE[t]}: ${e.calc} = ${F(e.x)}.`, { hint: CT_RULE[t] + '.' });
        }
        if (i === 6) {
          const t = R(rng, 1, 2), e = ct(t, a, b);
          const p = t === 1 ? L(`Một cửa hàng có một số ki-lô-gam gạo. Sau khi bán ${b} kg thì cửa hàng còn lại ${a} kg. Hỏi lúc đầu cửa hàng có bao nhiêu ki-lô-gam gạo?`, `A shop has some rice. After selling ${b} kg, it has ${a} kg left. How many kilograms of rice did the shop have at first?`) : L(`Một thùng có ${s} l dầu. Sau khi lấy ra một số lít dầu thì thùng còn lại ${a} l. Hỏi đã lấy ra bao nhiêu lít dầu?`, `A barrel has ${s} l of oil. After some oil is taken out, ${a} l is left. How many litres of oil were taken out?`);
          return Q(p, num(e.x, t === 1 ? 'kg' : 'l'), L(`Viết thành: ${e.expr}. ${e.calc} = ${F(e.x)}.`, `Write it as: ${e.expr}. ${e.calc} = ${F(e.x)}.`), { hint: t === 1 ? L('Lúc đầu = số còn lại + số đã bán.', 'At first = what is left + what was sold.') : L('Số lấy ra = số lúc đầu − số còn lại.', 'Taken out = at first − what is left.') });
        }
        // the right-hand side is a calculation: two steps
        const t = i === 7 ? 0 : i === 8 ? 1 : R(rng, 0, 2), c = R(rng, 110, 400), d = R(rng, 105, 380), rhs = t === 2 ? null : c + d;
        if (t === 0) { const bb = R(rng, 105, rhs - 20); return Q(find + `? + ${bb} = ${c} + ${d}`, num(rhs - bb), L(`Tính vế phải trước: ${c} + ${d} = ${rhs}. Ta có ? + ${bb} = ${rhs}, nên ? = ${rhs} ${M} ${bb} = ${rhs - bb}.`, `Work out the right-hand side first: ${c} + ${d} = ${rhs}. So ? + ${bb} = ${rhs}, and ? = ${rhs} ${M} ${bb} = ${rhs - bb}.`), { hint: L('Tính vế phải trước, rồi tìm số hạng chưa biết.', 'Work out the right-hand side first, then find the missing addend.') }); }
        if (t === 1) { const bb = R(rng, 105, 999 - rhs); return Q(find + `? ${M} ${bb} = ${c} + ${d}`, num(rhs + bb), L(`Tính vế phải trước: ${c} + ${d} = ${rhs}. Ta có ? ${M} ${bb} = ${rhs}, nên ? = ${rhs} + ${bb} = ${rhs + bb}.`, `Work out the right-hand side first: ${c} + ${d} = ${rhs}. So ? ${M} ${bb} = ${rhs}, and ? = ${rhs} + ${bb} = ${rhs + bb}.`), { hint: L('Tính vế phải trước, rồi tìm số bị trừ.', 'Work out the right-hand side first, then find the minuend.') }); }
        const hi = Math.max(c, d), lo = Math.min(c, d) === hi ? hi - 15 : Math.min(c, d), r2 = hi - lo, ss = R(rng, r2 + 110, r2 + 480);
        return Q(find + `${ss} ${M} ? = ${hi} ${M} ${lo}`, num(ss - r2), L(`Tính vế phải trước: ${hi} ${M} ${lo} = ${r2}. Ta có ${ss} ${M} ? = ${r2}, nên ? = ${ss} ${M} ${r2} = ${ss - r2}.`, `Work out the right-hand side first: ${hi} ${M} ${lo} = ${r2}. So ${ss} ${M} ? = ${r2}, and ? = ${ss} ${M} ${r2} = ${ss - r2}.`), { hint: L('Tính vế phải trước, rồi tìm số trừ.', 'Work out the right-hand side first, then find the subtrahend.') });
      },
    },

    {
      id: 'g3-dt-tim-so-nhan-chia', sem: 1, icon: '🧩', lesson: 'g3-c2-b13',
      title: L('Tìm thành phần chưa biết của phép nhân, phép chia', 'Finding the missing number in a multiplication or a division'),
      spot: L('Phép nhân hoặc phép chia có một số chưa biết (dấu ?), ví dụ: ? × 6 = 42; ? : 5 = 8; 36 : ? = 4.', 'A multiplication or a division with one unknown number (a ?), for example: ? × 6 = 42; ? : 5 = 8; 36 : ? = 4.'),
      steps: [
        L('Bước 1: Gọi tên số cần tìm: thừa số, số bị chia hay số chia?', 'Step 1: Name the missing number: a factor, the dividend or the divisor?'),
        L('Bước 2: Tìm thừa số: lấy tích chia cho thừa số kia.', 'Step 2: A missing factor: divide the product by the other factor.'),
        L('Bước 3: Tìm số bị chia: lấy thương nhân với số chia. Tìm số chia: lấy số bị chia chia cho thương.', 'Step 3: The dividend: multiply the quotient by the divisor. The divisor: divide the dividend by the quotient.'),
        L('Bước 4: Thử lại bằng cách thay số vừa tìm vào dấu ?.', 'Step 4: Check by putting your number in place of the ?.'),
      ],
      tip: L('Với ? : 5 = 8, số cần tìm là số bị chia nên phải nhân: 8 × 5 = 40, không phải 8 : 5.', 'In ? : 5 = 8 the missing number is the dividend, so you multiply: 8 × 5 = 40, not 8 : 5.'),
      guide: rng => {
        const t = R(rng, 0, 2), b = R(rng, 3, 9), q0 = R(rng, 2, 9), q = q0 === b ? (b % 8) + 2 : q0, e = nc(t, q, b);
        return G(L(`Tìm số thích hợp thay cho dấu ?:\n${e.expr}`, `Find the number that replaces the ?:\n${e.expr}`), [
          step(L(`Trong phép tính ${e.expr}, số cần tìm gọi là gì?`, `In ${e.expr}, what is the missing number called?`), ch(rng, NC_NAME[t], NC_NAME.filter((z, k) => k !== t)), L(`Số cần tìm là ${NC_name[t]}.`, `The missing number is ${NC_name[t]}.`), L('Thừa số × thừa số = tích. Số bị chia : số chia = thương.', 'Factor × factor = product. Dividend : divisor = quotient.')),
          step(L(`Muốn tìm ${NC_name[t]}, em làm thế nào?`, `How do you find ${NC_name[t]}?`), ch(rng, NC_RULE[t], [NC_WRONG[t]]), `${NC_RULE[t]}: ${e.calc}.`),
          step(`${e.calc} = ?`, num(e.x), `? = ${e.calc} = ${F(e.x)}.`),
          step(L(`Thử lại: ${e.chk} = ?`, `Check: ${e.chk} = ?`), num(e.chkV), L(`${e.chk} = ${F(e.chkV)}. Đúng với đề bài.`, `${e.chk} = ${F(e.chkV)}. It matches the problem.`)),
        ], L(`Đáp số: ${F(e.x)}.`, `Answer: ${F(e.x)}.`));
      },
      practice: (rng, i) => {
        const find = L('Tìm số thích hợp thay cho dấu ?:\n', 'Find the number that replaces the ?:\n');
        const b = R(rng, 2, 9), q0 = R(rng, 2, 9), q = q0 === b ? (b % 8) + 2 : q0, p = q * b, w = DT.name(rng);
        if (i < 4) { const t = i < 3 ? i : R(rng, 0, 2), e = nc(t, q, b); return Q(find + e.expr, num(e.x), L(`Số cần tìm là ${NC_name[t]}. ${NC_RULE[t]}: ${e.calc} = ${F(e.x)}.`, `The missing number is ${NC_name[t]}. ${NC_RULE[t]}: ${e.calc} = ${F(e.x)}.`), { hint: NC_RULE[t] + '.' }); }
        if (i === 4) {
          const t = R(rng, 0, 1), e = nc(t, q, b);
          const pr = t === 0 ? L(`${w} nghĩ ra một số. Gấp số đó lên ${b} lần thì được ${p}. Tìm số ${w} đã nghĩ.`, `${w} thinks of a number. ${b} times that number is ${p}. Find ${w}'s number.`) : L(`${w} nghĩ ra một số. Lấy số đó chia cho ${b} thì được ${q}. Tìm số ${w} đã nghĩ.`, `${w} thinks of a number. That number divided by ${b} is ${q}. Find ${w}'s number.`);
          return Q(pr, num(e.x), L(`Viết thành: ${e.expr}. ${NC_RULE[t]}: ${e.calc} = ${F(e.x)}.`, `Write it as: ${e.expr}. ${NC_RULE[t]}: ${e.calc} = ${F(e.x)}.`), { hint: L('Viết lại thành phép tính có dấu ?.', 'Write it as a calculation with a ?.') });
        }
        if (i === 5) {
          const t = R(rng, 0, 2), e = nc(t, q, b);
          const pr = [L(`Tích của hai số là ${p}. Một thừa số là ${b}. Tìm thừa số kia.`, `The product of two numbers is ${p}. One factor is ${b}. Find the other factor.`), L(`Thương của hai số là ${q}, số chia là ${b}. Tìm số bị chia.`, `The quotient of two numbers is ${q} and the divisor is ${b}. Find the dividend.`), L(`Số bị chia là ${p}, thương là ${q}. Tìm số chia.`, `The dividend is ${p} and the quotient is ${q}. Find the divisor.`)][t];
          return Q(pr, num(e.x), `${NC_RULE[t]}: ${e.calc} = ${F(e.x)}.`, { hint: NC_RULE[t] + '.' });
        }
        if (i === 6) {
          const t = R(rng, 1, 2), e = nc(t, q, b);
          const pr = t === 1 ? L(`Cô giáo chia đều một số quyển vở cho ${b} bạn, mỗi bạn được ${q} quyển. Hỏi cô giáo có tất cả bao nhiêu quyển vở?`, `The teacher shares some exercise books equally between ${b} children. Each child gets ${q} books. How many exercise books does the teacher have altogether?`) : L(`Có ${p} quả cam xếp đều vào các đĩa, mỗi đĩa ${q} quả. Hỏi xếp được mấy đĩa cam?`, `${p} oranges are put equally onto plates, ${q} oranges on each plate. How many plates of oranges are there?`);
          return Q(pr, num(e.x, t === 1 ? L('quyển vở', 'exercise books') : L('đĩa', 'plates')), L(`Viết thành: ${e.expr}. ${e.calc} = ${F(e.x)}.`, `Write it as: ${e.expr}. ${e.calc} = ${F(e.x)}.`), { hint: t === 1 ? L('Số bị chia = thương × số chia.', 'Dividend = quotient × divisor.') : L('Số chia = số bị chia : thương.', 'Divisor = dividend : quotient.') });
        }
        if (i >= 8) { const bq = DT.bank(rng, ['g3-tim-thanh-phan']); if (bq) return bq; }
        const t = R(rng, 0, 1), b2 = R(rng, 2, 6), q2 = R(rng, 11, Math.floor(99 / b2) > 11 ? Math.floor(99 / b2) : 12), e = nc(t, q2, b2);
        return Q(find + e.expr, num(e.x), L(`Số cần tìm là ${NC_name[t]}. ${NC_RULE[t]}: ${e.calc} = ${F(e.x)}.`, `The missing number is ${NC_name[t]}. ${NC_RULE[t]}: ${e.calc} = ${F(e.x)}.`), { hint: NC_RULE[t] + '.' });
      },
    },

    {
      id: 'g3-dt-mot-phan-may', sem: 1, icon: '🍰', lesson: 'g3-c2-b14',
      title: L('Tìm một phần mấy của một số', 'Finding a unit fraction of a number'),
      spot: L('Bài toán có “1/2 số …”, “1/3 số …”, “1/5 số …” và hỏi phần đó là bao nhiêu.', 'The problem has "1/2 of …", "1/3 of …" or "1/5 of …" and asks how much that part is.'),
      steps: [
        L('Bước 1: 1/3 của một số nghĩa là chia số đó thành 3 phần bằng nhau rồi lấy 1 phần.', 'Step 1: 1/3 of a number means: split the number into 3 equal parts and take 1 part.'),
        L('Bước 2: Lấy số đó chia cho số phần.', 'Step 2: Divide the number by the number of parts.'),
        L('Bước 3: Viết câu lời giải, phép tính và đáp số.', 'Step 3: Write the answer sentence, the calculation and the answer.'),
      ],
      tip: L('1/4 của 20 không phải là 20 − 4 hay 20 × 4. Em lấy 20 : 4 = 5.', '1/4 of 20 is not 20 − 4 or 20 × 4. Work out 20 : 4 = 5.'),
      guide: rng => {
        const n = R(rng, 2, 6), q0 = R(rng, 2, 9), q = q0 === n ? q0 + 1 : q0, t = n * q, st = partStory(rng, t, n);
        return G(L(st.vi, st.en), [
          step(L(`Tìm 1/${n} của ${t} nghĩa là chia ${t} thành mấy phần bằng nhau?`, `Finding 1/${n} of ${t} means splitting ${t} into how many equal parts?`), num(n), L(`Chia ${t} thành ${n} phần bằng nhau rồi lấy 1 phần.`, `Split ${t} into ${n} equal parts and take 1 part.`), L(`Nhìn số ở dưới gạch ngang của 1/${n}.`, `Look at the number under the line in 1/${n}.`)),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${t} : ${n}`, [`${t} × ${n}`, `${t} ${M} ${n}`]), L(`Chia thành ${n} phần bằng nhau thì làm phép chia: ${t} : ${n}.`, `Splitting into ${n} equal parts means divide: ${t} : ${n}.`)),
          step(`${t} : ${n} = ?`, num(q), `${st.sol}: ${t} : ${n} = ${q} (${st.u}).`, L(`Nhẩm bảng nhân ${n}: ${n} × ? = ${t}.`, `Use the ${n} times table: ${n} × ? = ${t}.`)),
        ], L(`Đáp số: ${q} ${st.u}.`, `Answer: ${q} ${st.u}.`), vz('tape', { bars: [{ label: st.lab, parts: n, units: n, value: String(t), shade: 1 }] }));
      },
      practice: (rng, i) => {
        const n = i < 2 ? R(rng, 2, 5) : R(rng, 2, 9), q = i === 5 ? R(rng, 11, Math.max(12, Math.floor(96 / n))) : R(rng, 2, 9), t = n * q, w = DT.name(rng);
        const hint = L(`Tìm 1/${n} của ${t}: lấy ${t} : ${n}.`, `To find 1/${n} of ${t}, work out ${t} : ${n}.`);
        const tape = lab => vz('tape', { bars: [{ label: lab, parts: n, units: n, value: String(t) }] });
        if (i < 2) { const it = P(rng, [['quả cam', 'oranges', '🍊'], ['cái kẹo', 'sweets', '🍬'], ['bông hoa', 'flowers', '🌸'], ['quả táo', 'apples', '🍎']]); return Q(L(`1/${n} của ${t} ${it[0]} là bao nhiêu ${it[0]}?`, `What is 1/${n} of ${t} ${it[1]}?`), num(q, L(it[0], it[1])), `${t} : ${n} = ${q} (${L(it[0], it[1])}).`, { hint, visual: vz('share', { total: t, groups: n, emoji: it[2] }) }); }
        if (i < 4 || i === 5) { const st = partStory(rng, t, n); return Q(L(st.vi, st.en), num(q, st.u), `${st.sol}: ${t} : ${n} = ${q} (${st.u}).`, { hint, visual: tape(st.lab) }); }
        if (i === 4) { const u = P(rng, ['kg', 'l', 'm', 'cm']); return Q(L(`Tìm số thích hợp:\n1/${n} của ${t} ${u} là ? ${u}`, `Find the missing number:\n1/${n} of ${t} ${u} is ? ${u}`), num(q, u), `${t} : ${n} = ${q} (${u}).`, { hint, visual: tape('') }); }
        if (i === 6) {
          const m = P(rng, [12, 24, 30, 36, 60].filter(z => z % 2 === 0 && z % 3 === 0)), [d1, d2] = U.sample(rng, [2, 3, 6], 2), big = Math.min(d1, d2);
          return Q(L(`Số nào lớn hơn: 1/${d1} của ${m} hay 1/${d2} của ${m}?`, `Which is greater: 1/${d1} of ${m} or 1/${d2} of ${m}?`), ch(rng, L(`1/${big} của ${m}`, `1/${big} of ${m}`), [L(`1/${Math.max(d1, d2)} của ${m}`, `1/${Math.max(d1, d2)} of ${m}`), L('Hai số bằng nhau', 'They are equal')]), L(`1/${d1} của ${m} là ${m} : ${d1} = ${m / d1}. 1/${d2} của ${m} là ${m} : ${d2} = ${m / d2}. Chia thành càng ít phần thì mỗi phần càng lớn.`, `1/${d1} of ${m} is ${m} : ${d1} = ${m / d1}. 1/${d2} of ${m} is ${m} : ${d2} = ${m / d2}. The fewer the parts, the bigger each part.`), { hint: L('Tính từng số rồi so sánh.', 'Work out each one, then compare.') });
        }
        if (i === 9) {
          return Q(L(`${w} đã đọc được ${q} trang sách, bằng 1/${n} số trang của quyển sách. Hỏi quyển sách có bao nhiêu trang?`, `${w} has read ${q} pages. That is 1/${n} of the pages of the book. How many pages does the book have?`), num(t, L('trang', 'pages')), L(`Quyển sách gồm ${n} phần bằng nhau, mỗi phần ${q} trang: ${q} × ${n} = ${t} (trang).`, `The book is ${n} equal parts of ${q} pages each: ${q} × ${n} = ${t} (pages).`), { hint: L(`1/${n} quyển sách là ${q} trang. Cả quyển gồm ${n} phần như thế.`, `1/${n} of the book is ${q} pages. The whole book is ${n} parts like that.`), visual: vz('tape', { bars: [{ label: '', parts: n, units: n, value: '?', shade: 1 }] }) });
        }
        // two steps: the part, then what is left
        const c = P(rng, [
          [`Một cửa hàng có ${t} kg gạo, đã bán 1/${n} số gạo đó. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, `A shop has ${t} kg of rice and sells 1/${n} of it. How many kilograms of rice does the shop have left?`, 'kg', L('Đã bán', 'Sold')],
          [`${w} có ${t} viên bi, ${w} cho bạn 1/${n} số bi đó. Hỏi ${w} còn lại bao nhiêu viên bi?`, `${w} has ${t} marbles and gives 1/${n} of them to a friend. How many marbles does ${w} have left?`, L('viên bi', 'marbles'), L('Đã cho', 'Given')],
          [`Quãng đường dài ${t} km. Ô tô đã đi được 1/${n} quãng đường. Hỏi ô tô còn phải đi bao nhiêu ki-lô-mét nữa?`, `A journey is ${t} km long. A car has gone 1/${n} of the way. How many more kilometres does it have to go?`, 'km', L('Đã đi', 'Done')]]);
        return Q(L(c[0], c[1]), num(t - q, c[2]), L(`${c[3]}: ${t} : ${n} = ${q} (${c[2]}). Còn lại: ${t} ${M} ${q} = ${t - q} (${c[2]}).`, `${c[3]}: ${t} : ${n} = ${q} (${c[2]}). Left: ${t} ${M} ${q} = ${t - q} (${c[2]}).`), { hint: L(`Bước 1: tìm 1/${n} của ${t}. Bước 2: lấy ${t} trừ đi phần đó.`, `Step 1: find 1/${n} of ${t}. Step 2: take that part away from ${t}.`), visual: vz('tape', { bars: [{ label: '', parts: n, units: n, value: String(t), shade: 1 }] }) });
      },
    },

    {
      id: 'g3-dt-gap-len', sem: 1, icon: '⏫', lesson: 'g3-c4-b24',
      title: L('Gấp một số lên một số lần', 'Making a number several times bigger'),
      spot: L('Bài toán có chữ “gấp … lần”: số thứ hai gấp 3 lần, dài gấp 4 lần, nặng gấp 5 lần số thứ nhất.', 'The problem says "… times as many (as long, as heavy)": the second amount is 3, 4 or 5 times the first.'),
      steps: [
        L('Bước 1: Vẽ sơ đồ: số bé là 1 phần, số lớn gồm nhiều phần như thế.', 'Step 1: Draw a bar model: the small amount is 1 part and the big amount is several parts like it.'),
        L('Bước 2: Muốn gấp một số lên nhiều lần, ta lấy số đó nhân với số lần.', 'Step 2: To make a number several times bigger, multiply it by the number of times.'),
        L('Bước 3: Viết câu lời giải, phép tính và đáp số.', 'Step 3: Write the answer sentence, the calculation and the answer.'),
      ],
      tip: L('“Gấp 3 lần” khác “nhiều hơn 3”. Gấp 3 lần thì nhân với 3; nhiều hơn 3 thì cộng 3.', '"3 times as many" is not "3 more". 3 times as many: multiply by 3. 3 more: add 3.'),
      guide: rng => {
        const k = R(rng, 2, 6), a0 = R(rng, 3, 9), a = a0 === k ? a0 + 1 : a0, r = a * k, st = gapStory(rng, a, k);
        const mul = L('Phép nhân', 'Multiplication');
        return G(L(st.vi, st.en), [
          step(L(`“Gấp ${k} lần” thì em làm phép tính gì?`, `"${k} times as much": which operation do you use?`), ch(rng, mul, [L('Phép cộng', 'Addition'), L('Phép chia', 'Division')]), L(`Số lớn gồm ${k} phần, mỗi phần bằng ${a}. Gấp lên ${k} lần thì nhân với ${k}.`, `The big amount is ${k} parts of ${a} each. ${k} times as much means multiply by ${k}.`), L('Gấp lên nhiều lần: lấy số đó nhân với số lần.', 'Several times bigger: multiply by the number of times.')),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} × ${k}`, [`${a} + ${k}`]), L(`Phép tính: ${a} × ${k}.`, `The calculation: ${a} × ${k}.`), L('“Gấp lên” khác “thêm”.', '"Times as much" is not "more".')),
          step(`${a} × ${k} = ?`, num(r), `${st.sol}: ${a} × ${k} = ${r} (${st.u}).`),
        ], L(`Đáp số: ${r} ${st.u}.`, `Answer: ${r} ${st.u}.`), tapeK(st.la, String(a), st.lb, k, '?'));
      },
      practice: (rng, i) => {
        const k = R(rng, 2, i < 2 ? 5 : 9), a = i < 4 ? R(rng, 2, 9) : R(rng, 3, Math.max(4, Math.min(30, Math.floor(99 / k)))), r = a * k, [x, y] = two(rng);
        const hint = L(`Gấp lên ${k} lần thì nhân với ${k}.`, `${k} times as much means multiply by ${k}.`);
        if (i < 4) { const st = gapStory(rng, a, k); return Q(L(st.vi, st.en), num(r, st.u), `${st.sol}: ${a} × ${k} = ${r} (${st.u}).`, { hint, visual: tapeK(st.la, String(a), st.lb, k, '?') }); }
        if (i === 4) return Q(L(`Gấp ${a} lên ${k} lần thì được bao nhiêu?`, `Make ${a} ${U.readEN(k)} times bigger. What do you get?`), num(r), `${a} × ${k} = ${r}.`, { hint, visual: tapeK(L('Số đã cho', 'Number'), String(a), L('Gấp lên', 'Times bigger'), k, '?') });
        if (i === 5) return Q(L(`Gấp ${a} lên ${k} lần, và thêm ${k} vào ${a}. Hai kết quả lần lượt là:`, `Make ${a} ${U.readEN(k)} times bigger, and add ${k} to ${a}. The two answers, in order, are:`), ch(rng, L(`${r} và ${a + k}`, `${r} and ${a + k}`), [L(`${a + k} và ${r}`, `${a + k} and ${r}`), L(`${r} và ${r + k}`, `${r} and ${r + k}`), L(`${r + k} và ${a + k}`, `${r + k} and ${a + k}`)]), L(`Gấp lên: ${a} × ${k} = ${r}. Thêm: ${a} + ${k} = ${a + k}.`, `Times bigger: ${a} × ${k} = ${r}. Add: ${a} + ${k} = ${a + k}.`), { hint: L('Gấp lên: nhân. Thêm: cộng.', 'Times bigger: multiply. Add: plus.') });
        if (i === 6) return Q(L(`Một số gấp lên ${k} lần thì được ${r}. Tìm số đó.`, `A number made ${k} times bigger is ${r}. Find the number.`), num(a), L(`? × ${k} = ${r}, nên ? = ${r} : ${k} = ${a}.`, `? × ${k} = ${r}, so ? = ${r} : ${k} = ${a}.`), { hint: L(`Lấy ${r} chia cho ${k}.`, `Divide ${r} by ${k}.`), visual: tapeK(L('Số đó', 'The number'), '?', L('Gấp lên', 'Times bigger'), k, String(r)) });
        if (i === 9) {   // the same two steps with three-digit numbers (nhân số có ba chữ số, Bài 36)
          const k3 = R(rng, 2, 4), a3 = R(rng, 105, Math.floor(990 / (k3 + 1))), b3 = a3 * k3, all3 = R(rng, 0, 1) === 1;
          const head = L(`Kho thứ nhất có ${a3} kg gạo. Số gạo ở kho thứ hai gấp ${k3} lần số gạo ở kho thứ nhất. `, `The first store has ${a3} kg of rice. The second store has ${k3} times as much rice as the first. `);
          return Q(head + (all3 ? L('Hỏi cả hai kho có bao nhiêu ki-lô-gam gạo?', 'How many kilograms of rice do the two stores have altogether?') : L('Hỏi kho thứ hai có nhiều hơn kho thứ nhất bao nhiêu ki-lô-gam gạo?', 'How many more kilograms of rice does the second store have than the first?')), num(all3 ? a3 + b3 : b3 - a3, 'kg'),
            all3 ? L(`Kho thứ hai có: ${a3} × ${k3} = ${b3} (kg). Cả hai kho có: ${a3} + ${b3} = ${a3 + b3} (kg).`, `Second store: ${a3} × ${k3} = ${b3} (kg). Both stores: ${a3} + ${b3} = ${a3 + b3} (kg).`) : L(`Kho thứ hai có: ${a3} × ${k3} = ${b3} (kg). Kho thứ hai nhiều hơn: ${b3} ${M} ${a3} = ${b3 - a3} (kg).`, `Second store: ${a3} × ${k3} = ${b3} (kg). It has more by: ${b3} ${M} ${a3} = ${b3 - a3} (kg).`), { hint: L('Bước 1: tìm số gạo ở kho thứ hai.', 'Step 1: find how much rice the second store has.'), visual: vz('tape', { bars: [{ label: L('Kho 1', 'Store 1'), parts: 1, units: 1, value: `${a3} kg` }, { label: L('Kho 2', 'Store 2'), parts: k3, units: k3, value: '?' }] }) });
        }
        const k2 = R(rng, 2, 5), a2 = R(rng, 4, Math.floor(90 / (k2 + 1))), b2 = a2 * k2, all = i === 7;
        return Q(all ? L(`${x} có ${a2} nhãn vở. Số nhãn vở của ${y} gấp ${k2} lần số nhãn vở của ${x}. Hỏi cả hai bạn có bao nhiêu nhãn vở?`, `${x} has ${a2} book labels. ${y} has ${k2} times as many book labels as ${x}. How many book labels do the two friends have altogether?`) : L(`${x} có ${a2} nhãn vở. Số nhãn vở của ${y} gấp ${k2} lần số nhãn vở của ${x}. Hỏi ${y} có nhiều hơn ${x} bao nhiêu nhãn vở?`, `${x} has ${a2} book labels. ${y} has ${k2} times as many book labels as ${x}. How many more book labels does ${y} have than ${x}?`), num(all ? a2 + b2 : b2 - a2, L('nhãn vở', 'book labels')),
          all ? L(`Số nhãn vở của ${y}: ${a2} × ${k2} = ${b2}. Cả hai bạn: ${a2} + ${b2} = ${a2 + b2} (nhãn vở).`, `${y}: ${a2} × ${k2} = ${b2}. Both: ${a2} + ${b2} = ${a2 + b2} (book labels).`) : L(`Số nhãn vở của ${y}: ${a2} × ${k2} = ${b2}. ${y} nhiều hơn ${x}: ${b2} ${M} ${a2} = ${b2 - a2} (nhãn vở).`, `${y}: ${a2} × ${k2} = ${b2}. ${y} has more by: ${b2} ${M} ${a2} = ${b2 - a2} (book labels).`), { hint: L(`Bước 1: tìm số nhãn vở của ${y}.`, `Step 1: find how many book labels ${y} has.`), visual: vz('tape', { bars: [{ label: x, parts: 1, units: 1, value: String(a2) }, { label: y, parts: k2, units: k2, value: '?' }] }) });
      },
    },

    {
      id: 'g3-dt-chia-co-du', sem: 1, icon: '🍬', lesson: 'g3-c4-b25',
      title: L('Phép chia có dư', 'Division with a remainder'),
      spot: L('Chia đều mà không hết, còn thừa lại một ít. Bài hỏi thương, số dư, “nhiều nhất” được mấy, “còn thừa” mấy.', 'Sharing equally leaves some over. The problem asks for the quotient, the remainder, "the greatest number" or "how many are left over".'),
      steps: [
        L('Bước 1: Tìm trong bảng nhân của số chia: tích lớn nhất không vượt quá số bị chia.', 'Step 1: In the times table of the divisor, find the biggest product that is not more than the dividend.'),
        L('Bước 2: Số lần nhân đó là thương.', 'Step 2: The number you multiplied by is the quotient.'),
        L('Bước 3: Lấy số bị chia trừ đi tích để tìm số dư.', 'Step 3: Take the product away from the dividend to find the remainder.'),
        L('Bước 4: Kiểm tra: số dư phải bé hơn số chia.', 'Step 4: Check: the remainder must be smaller than the divisor.'),
      ],
      tip: L('Số dư bao giờ cũng bé hơn số chia. Nếu số dư bằng hoặc lớn hơn số chia thì còn chia tiếp được.', 'The remainder is always smaller than the divisor. If it is equal or bigger, you can still share out more.'),
      guide: rng => {
        const b = R(rng, 3, 8), q = R(rng, 2, 8), r = R(rng, 1, b - 1), a = b * q + r, st = duStory(rng, a, b);
        return G(L(st.vi, st.en), [
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} : ${b}`, [`${a} ${M} ${b}`, `${a} × ${b}`]), L(`Chia đều thì làm phép chia: ${a} : ${b}.`, `Sharing equally means divide: ${a} : ${b}.`)),
          step(L(`${b} nhân với mấy thì được số gần ${a} nhất mà không vượt quá ${a}?`, `${b} times what gives the number closest to ${a} without going over ${a}?`), num(q), L(`${b} × ${q} = ${b * q} (còn ${b} × ${q + 1} = ${b * (q + 1)} thì lớn hơn ${a}). Thương là ${q}.`, `${b} × ${q} = ${b * q} (and ${b} × ${q + 1} = ${b * (q + 1)} is more than ${a}). The quotient is ${q}.`), L(`Nhẩm bảng nhân ${b}: ${b} × ${q - 1} = ${b * (q - 1)}, ${b} × ${q} = ${b * q}, ${b} × ${q + 1} = ${b * (q + 1)}.`, `Use the ${b} times table: ${b} × ${q - 1} = ${b * (q - 1)}, ${b} × ${q} = ${b * q}, ${b} × ${q + 1} = ${b * (q + 1)}.`)),
          step(L(`Còn thừa: ${a} ${M} ${b * q} = ?`, `Left over: ${a} ${M} ${b * q} = ?`), num(r), L(`${a} ${M} ${b * q} = ${r}. Vậy ${a} : ${b} = ${q} (dư ${r}).`, `${a} ${M} ${b * q} = ${r}. So ${a} : ${b} = ${q} (remainder ${r}).`)),
          step(L(`Số dư ${r} so với số chia ${b} phải như thế nào?`, `How must the remainder ${r} compare with the divisor ${b}?`), ch(rng, L('Bé hơn số chia', 'Smaller than the divisor'), [L('Lớn hơn số chia', 'Bigger than the divisor'), L('Bằng số chia', 'Equal to the divisor')]), L(`${r} < ${b}: số dư bé hơn số chia, đúng.`, `${r} < ${b}: the remainder is smaller than the divisor. Correct.`)),
        ], L(`Đáp số: mỗi ${st.one[0]} ${q} ${uk(st.it, q)}, còn thừa ${r} ${uk(st.it, r)}.`, `Answer: ${q} ${uk(st.it, q)} for each ${st.one[1]}, ${r} left over.`), vz('columnCalc', { a, b, op: ':', reveal: 'none' }));
      },
      practice: (rng, i) => {
        const b = R(rng, 2, 9), q = R(rng, i < 2 ? 2 : 3, 9), r = R(rng, 1, b - 1), a = b * q + r;
        const fr = (x, y) => L(`${x} (dư ${y})`, `${x} (remainder ${y})`);
        const ex = L(`${b} × ${q} = ${b * q}; ${a} ${M} ${b * q} = ${r}. Vậy ${a} : ${b} = ${q} (dư ${r}).`, `${b} × ${q} = ${b * q}; ${a} ${M} ${b * q} = ${r}. So ${a} : ${b} = ${q} (remainder ${r}).`);
        const hint = L(`Nhẩm bảng nhân ${b}: tích lớn nhất không vượt quá ${a}.`, `Use the ${b} times table: the biggest product that is not more than ${a}.`);
        const col = vz('columnCalc', { a, b, op: ':', reveal: 'none' });
        if (i === 0) return Q(L(`Tìm thương của phép chia có dư:\n${a} : ${b} = ? (dư ${r})`, `Find the quotient of this division with a remainder:\n${a} : ${b} = ? (remainder ${r})`), num(q), ex, { hint, visual: col });
        if (i === 1) return Q(L(`Tìm số dư của phép chia:\n${a} : ${b} = ${q} (dư ?)`, `Find the remainder:\n${a} : ${b} = ${q} (remainder ?)`), num(r), ex, { hint: L(`Lấy ${a} trừ đi ${b} × ${q}.`, `Take ${b} × ${q} away from ${a}.`), visual: col });
        if (i === 2) return Q(`${a} : ${b} = ?`, ch(rng, fr(q, r), [fr(q + 1, r), fr(q - 1, r + b), fr(q, r + 1 < b ? r + 1 : r === 1 ? b : r - 1)]), ex, { hint, visual: col });
        if (i === 3) { const w = DT.name(rng), exa = b * R(rng, 2, 9), d = [1, 2, 3].map(() => { const bb = R(rng, 2, 9); return `${bb * R(rng, 2, 9) + R(rng, 1, bb - 1)} : ${bb}`; }); return Q(L(`${w} viết các phép chia sau lên bảng. Phép chia nào là phép chia hết (không có dư)?`, `${w} writes these divisions on the board. Which one has no remainder?`), ch(rng, `${exa} : ${b}`, d), L(`${exa} : ${b} = ${exa / b}, không dư.`, `${exa} : ${b} = ${exa / b}, with no remainder.`), { hint: L('Phép chia hết khi số bị chia có trong bảng nhân của số chia.', 'There is no remainder when the dividend is in the times table of the divisor.') }); }
        if (i === 4 || i === 5) { const st = duStory(rng, a, b); return i === 4 ? Q(st.qEach, num(q, uk(st.it, q)), ex + L(` Mỗi ${st.one[0]} được nhiều nhất ${q} ${uk(st.it, q)}.`, ` Each ${st.one[1]} gets at most ${q} ${uk(st.it, q)}.`), { hint, visual: col }) : Q(st.qLeft, num(r, uk(st.it, r)), ex + L(` Còn thừa ${r} ${uk(st.it, r)}.`, ` ${r} ${uk(st.it, r)} left over.`), { hint, visual: col }); }
        if (i === 6) return Q(L(`Trong phép chia có dư với số chia là ${b}, số dư lớn nhất có thể là bao nhiêu?`, `In a division with a remainder and a divisor of ${b}, what is the biggest possible remainder?`), num(b - 1), L(`Số dư luôn bé hơn số chia nên số dư lớn nhất là ${b} ${M} 1 = ${b - 1}.`, `The remainder is always smaller than the divisor, so the biggest remainder is ${b} ${M} 1 = ${b - 1}.`), { hint: L('Số dư luôn bé hơn số chia.', 'The remainder is always smaller than the divisor.') });
        if (i === 9) { const bq = DT.bank(rng, ['g3-phep-chia-co-du']); if (bq) return bq; }
        if (i === 7) {
          const c = P(rng, [[`Có ${a} người cần qua sông, mỗi chuyến thuyền chở được ${b} người. Hỏi cần ít nhất mấy chuyến thuyền để chở hết số người đó?`, `${a} people need to cross a river. A boat carries ${b} people each trip. What is the smallest number of trips needed to carry them all?`, L('chuyến', 'trips')], [`Có ${a} quả trứng xếp vào các khay, mỗi khay xếp được ${b} quả. Hỏi cần ít nhất mấy cái khay để xếp hết số trứng đó?`, `${a} eggs are put on trays. A tray holds ${b} eggs. What is the smallest number of trays needed for all the eggs?`, L('khay', 'trays')], [`Lớp học có ${a} bạn, mỗi bàn ngồi được ${b} bạn. Hỏi cần ít nhất mấy cái bàn để cả lớp đều có chỗ ngồi?`, `A class has ${a} children. ${b} children can sit at each desk. What is the smallest number of desks needed so that everyone has a seat?`, L('cái bàn', 'desks')]]);
          return Q(L(c[0], c[1]), num(q + 1, c[2]), L(`${a} : ${b} = ${q} (dư ${r}). Còn dư ${r} nên cần thêm 1 nữa: ${q} + 1 = ${q + 1} (${c[2]}).`, `${a} : ${b} = ${q} (remainder ${r}). ${r} left over need 1 more: ${q} + 1 = ${q + 1} (${c[2]}).`), { hint: L('Phần còn dư cũng cần thêm một chỗ nữa.', 'The ones left over need one more as well.'), visual: col });
        }
        return Q(L(`Tìm số bị chia:\n? : ${b} = ${q} (dư ${r})`, `Find the dividend:\n? : ${b} = ${q} (remainder ${r})`), num(a), L(`Số bị chia = thương × số chia + số dư: ${q} × ${b} + ${r} = ${b * q} + ${r} = ${a}.`, `Dividend = quotient × divisor + remainder: ${q} × ${b} + ${r} = ${b * q} + ${r} = ${a}.`), { hint: L('Lấy thương nhân với số chia rồi cộng với số dư.', 'Multiply the quotient by the divisor, then add the remainder.') });
      },
    },

    {
      id: 'g3-dt-giam-di', sem: 1, icon: '⏬', lesson: 'g3-c4-b27',
      title: L('Giảm một số đi một số lần', 'Making a number several times smaller'),
      spot: L('Bài toán có chữ “giảm đi … lần”: số thứ hai bằng số thứ nhất giảm đi 3 lần, 4 lần, 5 lần.', 'The problem says "… times smaller": the second amount is the first amount made 3, 4 or 5 times smaller.'),
      steps: [
        L('Bước 1: Vẽ sơ đồ: số lớn gồm nhiều phần bằng nhau, số bé là 1 phần.', 'Step 1: Draw a bar model: the big amount is several equal parts and the small amount is 1 part.'),
        L('Bước 2: Muốn giảm một số đi nhiều lần, ta lấy số đó chia cho số lần.', 'Step 2: To make a number several times smaller, divide it by the number of times.'),
        L('Bước 3: Viết câu lời giải, phép tính và đáp số.', 'Step 3: Write the answer sentence, the calculation and the answer.'),
      ],
      tip: L('“Giảm đi 3 lần” (chia cho 3) khác “giảm đi 3 đơn vị” (trừ đi 3).', '"3 times smaller" (divide by 3) is not the same as "3 less" (subtract 3).'),
      guide: rng => {
        const k = R(rng, 2, 6), q0 = R(rng, 3, 9), q = q0 === k ? q0 + 1 : q0, a = q * k, st = giamStory(rng, a, k);
        return G(L(st.vi, st.en), [
          step(L(`“Giảm đi ${k} lần” thì em làm phép tính gì?`, `"${k} times smaller": which operation do you use?`), ch(rng, L('Phép chia', 'Division'), [L('Phép trừ', 'Subtraction'), L('Phép nhân', 'Multiplication')]), L(`Số lớn gồm ${k} phần bằng nhau, số bé là 1 phần. Giảm đi ${k} lần thì chia cho ${k}.`, `The big amount is ${k} equal parts and the small amount is 1 part. ${k} times smaller means divide by ${k}.`), L('Giảm đi nhiều lần: lấy số đó chia cho số lần.', 'Several times smaller: divide by the number of times.')),
          step(L('Em chọn phép tính nào?', 'Which calculation do you choose?'), ch(rng, `${a} : ${k}`, [`${a} ${M} ${k}`]), L(`Phép tính: ${a} : ${k}.`, `The calculation: ${a} : ${k}.`), L('“Giảm đi … lần” khác “bớt đi”.', '"Times smaller" is not "take away".')),
          step(`${a} : ${k} = ?`, num(q), `${st.sol}: ${a} : ${k} = ${q} (${st.u}).`, L(`Nhẩm bảng nhân ${k}: ${k} × ? = ${a}.`, `Use the ${k} times table: ${k} × ? = ${a}.`)),
        ], L(`Đáp số: ${q} ${st.u}.`, `Answer: ${q} ${st.u}.`), vz('tape', { bars: [{ label: st.la, parts: k, units: k, value: String(a) }, { label: st.lb, parts: 1, units: 1, value: '?' }] }));
      },
      practice: (rng, i) => {
        const k = R(rng, 2, i < 2 ? 5 : 9), q = i < 4 ? R(rng, 2, 9) : R(rng, 3, Math.max(4, Math.min(24, Math.floor(99 / k)))), a = q * k, w = DT.name(rng);
        const hint = L(`Giảm đi ${k} lần thì chia cho ${k}.`, `${k} times smaller means divide by ${k}.`);
        const tape = (la, lb, top, bot) => vz('tape', { bars: [{ label: la, parts: k, units: k, value: top }, { label: lb, parts: 1, units: 1, value: bot }] });
        if (i < 4) { const st = giamStory(rng, a, k); return Q(L(st.vi, st.en), num(q, st.u), `${st.sol}: ${a} : ${k} = ${q} (${st.u}).`, { hint, visual: tape(st.la, st.lb, String(a), '?') }); }
        if (i === 4) return Q(L(`Giảm ${a} đi ${k} lần thì được bao nhiêu?`, `Make ${a} ${U.readEN(k)} times smaller. What do you get?`), num(q), `${a} : ${k} = ${q}.`, { hint, visual: tape(L('Lúc đầu', 'At first'), L('Sau khi giảm', 'After'), String(a), '?') });
        if (i === 5) return Q(L(`Số ${a} giảm đi ${k} lần, và số ${a} giảm đi ${k} đơn vị. Hai kết quả lần lượt là:`, `Make ${a} ${U.readEN(k)} times smaller, and take ${k} away from ${a}. The two answers, in order, are:`), ch(rng, L(`${q} và ${a - k}`, `${q} and ${a - k}`), [L(`${a - k} và ${q}`, `${a - k} and ${q}`), L(`${q} và ${a + k}`, `${q} and ${a + k}`), L(`${a * k} và ${a - k}`, `${a * k} and ${a - k}`)]), L(`Giảm đi ${k} lần: ${a} : ${k} = ${q}. Giảm đi ${k} đơn vị: ${a} ${M} ${k} = ${a - k}.`, `${k} times smaller: ${a} : ${k} = ${q}. ${k} less: ${a} ${M} ${k} = ${a - k}.`), { hint: L('Giảm đi nhiều lần: chia. Giảm đi một số đơn vị: trừ.', 'Times smaller: divide. Take away: subtract.') });
        if (i === 6) return Q(L(`Một số giảm đi ${k} lần thì được ${q}. Tìm số đó.`, `A number made ${k} times smaller is ${q}. Find the number.`), num(a), L(`? : ${k} = ${q}, nên ? = ${q} × ${k} = ${a}.`, `? : ${k} = ${q}, so ? = ${q} × ${k} = ${a}.`), { hint: L(`Lấy ${q} nhân với ${k}.`, `Multiply ${q} by ${k}.`), visual: tape(L('Số đó', 'The number'), L('Sau khi giảm', 'After'), '?', String(q)) });
        if (i === 9) {   // the same two steps with three-digit numbers (chia số có ba chữ số, Bài 37)
          const k3 = R(rng, 2, 4), q3 = R(rng, 105, Math.floor(990 / (k3 + 1))), a3 = q3 * k3, all3 = R(rng, 0, 1) === 1;
          const head = L(`Buổi sáng cửa hàng bán được ${a3} m vải. Số mét vải bán được buổi chiều bằng số mét vải buổi sáng giảm đi ${k3} lần. `, `A shop sells ${a3} m of cloth in the morning. In the afternoon it sells that amount made ${U.readEN(k3)} times smaller. `);
          return Q(head + (all3 ? L('Hỏi cả ngày cửa hàng bán được bao nhiêu mét vải?', 'How many metres of cloth does it sell in the whole day?') : L('Hỏi buổi sáng cửa hàng bán được nhiều hơn buổi chiều bao nhiêu mét vải?', 'How many more metres does it sell in the morning than in the afternoon?')), num(all3 ? a3 + q3 : a3 - q3, 'm'),
            all3 ? L(`Buổi chiều bán được: ${a3} : ${k3} = ${q3} (m). Cả ngày bán được: ${a3} + ${q3} = ${a3 + q3} (m).`, `Afternoon: ${a3} : ${k3} = ${q3} (m). Whole day: ${a3} + ${q3} = ${a3 + q3} (m).`) : L(`Buổi chiều bán được: ${a3} : ${k3} = ${q3} (m). Buổi sáng nhiều hơn: ${a3} ${M} ${q3} = ${a3 - q3} (m).`, `Afternoon: ${a3} : ${k3} = ${q3} (m). The morning is more by: ${a3} ${M} ${q3} = ${a3 - q3} (m).`), { hint: L('Bước 1: tìm số mét vải bán buổi chiều.', 'Step 1: find how many metres are sold in the afternoon.'), visual: vz('tape', { bars: [{ label: L('Sáng', 'Morning'), parts: k3, units: k3, value: `${a3} m` }, { label: L('Chiều', 'Afternoon'), parts: 1, units: 1, value: '?' }] }) });
        }
        const k2 = R(rng, 2, 5), q2 = R(rng, 4, Math.floor(96 / k2)), a2 = q2 * k2, gave = i === 7;
        return Q(gave ? L(`${w} có ${a2} viên bi. Sau khi cho bạn, số bi của ${w} giảm đi ${k2} lần. Hỏi ${w} đã cho bạn bao nhiêu viên bi?`, `${w} has ${a2} marbles. After giving some to a friend, ${w}'s number of marbles is ${k2} times smaller. How many marbles did ${w} give away?`) : L(`Buổi sáng cửa hàng bán được ${a2} l dầu. Số dầu bán được buổi chiều bằng số dầu buổi sáng giảm đi ${k2} lần. Hỏi cả ngày cửa hàng bán được bao nhiêu lít dầu?`, `A shop sells ${a2} l of oil in the morning. In the afternoon it sells that amount made ${U.readEN(k2)} times smaller. How many litres of oil does it sell in the whole day?`), num(gave ? a2 - q2 : a2 + q2, gave ? L('viên bi', 'marbles') : 'l'),
          gave ? L(`Số bi còn lại: ${a2} : ${k2} = ${q2}. Số bi đã cho: ${a2} ${M} ${q2} = ${a2 - q2} (viên bi).`, `Marbles left: ${a2} : ${k2} = ${q2}. Given away: ${a2} ${M} ${q2} = ${a2 - q2} (marbles).`) : L(`Buổi chiều: ${a2} : ${k2} = ${q2} (l). Cả ngày: ${a2} + ${q2} = ${a2 + q2} (l).`, `Afternoon: ${a2} : ${k2} = ${q2} (l). Whole day: ${a2} + ${q2} = ${a2 + q2} (l).`), { hint: gave ? L('Bước 1: tìm số bi còn lại.', 'Step 1: find how many marbles are left.') : L('Bước 1: tìm số dầu bán buổi chiều.', 'Step 1: find how much oil is sold in the afternoon.'), visual: vz('tape', { bars: [{ label: '', parts: k2, units: k2, value: String(a2) }, { label: '', parts: 1, units: 1, value: '?' }] }) });
      },
    },

    {
      id: 'g3-dt-hai-buoc', sem: 1, icon: '👣', lesson: 'g3-c4-b28',
      title: L('Bài toán giải bằng hai bước tính', 'Two-step word problems'),
      spot: L('Muốn trả lời câu hỏi của bài toán, em phải tìm một số chưa biết trước đã. Bài toán cần hai phép tính.', 'To answer the question you must first find a number that is not given. The problem needs two calculations.'),
      steps: [
        L('Bước 1: Đọc kĩ đề. Bài toán hỏi gì? Muốn tìm nó, em cần biết những gì?', 'Step 1: Read carefully. What does the problem ask? What do you need to know to find it?'),
        L('Bước 2: Tìm số chưa biết trước (bước tính thứ nhất).', 'Step 2: Find the unknown number first (the first calculation).'),
        L('Bước 3: Dùng kết quả đó để tìm số bài toán hỏi (bước tính thứ hai).', 'Step 3: Use that result to find what the problem asks (the second calculation).'),
        L('Bước 4: Mỗi bước tính viết một câu lời giải. Cuối cùng viết đáp số.', 'Step 4: Write an answer sentence for each calculation. Write the final answer at the end.'),
      ],
      tip: L('Đừng dừng lại sau bước tính thứ nhất. Em đọc lại câu hỏi xem đã trả lời đúng điều bài toán hỏi chưa.', 'Do not stop after the first calculation. Read the question again: have you answered what the problem asks?'),
      guide: rng => {
        const c = twoStep(rng, R(rng, 0, 3));
        return G(L(c.vi, c.en), [
          step(L('Muốn trả lời câu hỏi của bài toán, trước hết em phải tìm gì?', 'To answer the question, what must you find first?'), ch(rng, c.first, c.wrongFirst), L(`Trước hết phải tìm: ${lc1(c.first)}.`, `First we must find: ${lc1(c.first)}.`), L('Số nào trong bài chưa được cho sẵn nhưng cần dùng để tính?', 'Which number is not given but is needed for the calculation?')),
          step(L('Bước tính thứ nhất: em chọn phép tính nào?', 'First calculation: which one do you choose?'), ch(rng, c.e1, [c.w1]), L(`Bước 1: ${c.e1}.`, `Step 1: ${c.e1}.`)),
          step(`${c.e1} = ?`, num(c.v1), `${c.s1}: ${c.e1} = ${c.v1} (${c.u}).`),
          step(L(`Bước tính thứ hai: ${c.e2} = ?`, `Second calculation: ${c.e2} = ?`), num(c.v2), `${c.s2}: ${c.e2} = ${c.v2} (${c.u}).`),
        ], L(`Đáp số: ${c.v2} ${c.u}.`, `Answer: ${c.v2} ${c.u}.`), c.visual);
      },
      practice: (rng, i) => {
        if (i >= 7) { const q = DT.bank(rng, i === 7 ? ['g3-gap-giam-hai-buoc'] : i === 8 ? ['g3-tuoi-hai-buoc'] : ['g3-gap-giam-hai-buoc', 'g3-tuoi-hai-buoc']); if (q) return q; }
        const c = twoStep(rng, i < 4 ? i : i === 4 ? 4 : i === 5 ? 5 : R(rng, 0, 5));
        const ex = `${c.s1}: ${c.e1} = ${c.v1} (${c.u}). ${c.s2}: ${c.e2} = ${c.v2} (${c.u}).`;
        if (i === 6) return Q(L(c.vi, c.en) + L('\nBước tính thứ nhất là phép tính nào?', '\nWhich is the first calculation?'), ch(rng, c.e1, [c.w1, c.e2]), ex, { hint: L(`Trước hết phải tìm: ${lc1(c.first)}.`, `First find: ${lc1(c.first)}.`), visual: c.visual });
        return Q(L(c.vi, c.en), num(c.v2, c.u), ex, { hint: L(`Bước 1: tìm ${lc1(c.first)}.`, `Step 1: find ${lc1(c.first)}.`), visual: c.visual });
      },
    },

    {
      id: 'g3-dt-bieu-thuc', sem: 1, icon: '🧮', lesson: 'g3-c6-b38',
      title: L('Tính giá trị của biểu thức', 'Working out the value of an expression'),
      spot: L('Bài cho một dãy tính có hai phép tính (có thể có dấu ngoặc) và bảo em “Tính giá trị của biểu thức”.', 'The problem gives a calculation with two operations (sometimes with brackets) and says "Work out the value of the expression".'),
      steps: [
        L('Bước 1: Chỉ có cộng, trừ (hoặc chỉ có nhân, chia): tính từ trái sang phải.', 'Step 1: Only + and − (or only × and :): work from left to right.'),
        L('Bước 2: Có cả cộng, trừ và nhân, chia: làm nhân, chia trước; cộng, trừ sau.', 'Step 2: With +, − and ×, : together: do × and : first, then + and −.'),
        L('Bước 3: Có dấu ngoặc ( ): tính trong ngoặc trước.', 'Step 3: With brackets ( ): work out the brackets first.'),
      ],
      tip: L('Đừng cứ tính từ trái sang phải. 40 + 5 × 3 = 40 + 15 = 55, không phải 45 × 3 = 135.', 'Do not always go from left to right. 40 + 5 × 3 = 40 + 15 = 55, not 45 × 3 = 135.'),
      guide: rng => {
        const e = expr(rng, R(rng, 0, 5), false);
        return G(L(`Tính giá trị của biểu thức:\n${e.s}`, `Work out the value of the expression:\n${e.s}`), [
          step(L(`Trong biểu thức ${e.s}, em thực hiện phép tính nào trước?`, `In ${e.s}, which calculation do you do first?`), ch(rng, e.first, [e.wrong]), e.rule, L('Xem biểu thức có những phép tính nào và có dấu ngoặc không.', 'See which operations the expression has and whether it has brackets.')),
          step(`${e.first} = ?`, num(e.v1), `${e.s} = ${e.s2}`),
          step(`${e.s2} = ?`, num(e.v), `${e.s} = ${e.s2} = ${e.v}.`),
        ], L(`Đáp số: ${e.v}.`, `Answer: ${e.v}.`));
      },
      practice: (rng, i) => {
        if (i >= 7) { const q = DT.bank(rng, i === 7 ? ['g3-gia-tri-bieu-thuc'] : i === 8 ? ['g3-chon-bieu-thuc'] : ['g3-gia-tri-bieu-thuc', 'g3-chon-bieu-thuc']); if (q) return q; }
        const k = i === 0 ? R(rng, 0, 1) : i === 1 ? 2 : i === 2 ? 3 : i === 3 ? R(rng, 4, 5) : i === 5 ? P(rng, [2, 4]) : R(rng, 0, 5), e = expr(rng, k, i >= 4);
        const ex = `${e.s} = ${e.s2} = ${e.v}.`;
        if (i === 5 && e.bad != null && e.bad !== e.v) {
          const w = DT.name(rng);
          return Q(L(`Bạn ${w} tính: ${e.s} = ${F(e.bad)}.\nBạn ấy làm sai thứ tự. Giá trị đúng của biểu thức là bao nhiêu?`, `${w} worked out: ${e.s} = ${F(e.bad)}.\n${w} did the steps in the wrong order. What is the correct value?`), num(e.v), `${e.rule} ${ex}`, { hint: e.rule });
        }
        if (i === 6) { const c = Math.max(0, e.v + P(rng, [-10, -1, 0, 1, 10])); return Q(L(`So sánh: ${e.s} … ${c}`, `Compare: ${e.s} … ${c}`), cmp(e.v, c), L(`${ex} Mà ${e.v} ${sign(e.v, c)} ${c}.`, `${ex} And ${e.v} ${sign(e.v, c)} ${c}.`), { hint: e.rule, visual: vz('compare', { left: e.s, right: String(c) }) }); }
        return Q(L(`Tính giá trị của biểu thức:\n${e.s}`, `Work out the value of the expression:\n${e.s}`), num(e.v), `${e.rule} ${ex}`, { hint: e.rule });
      },
    },

    {
      id: 'g3-dt-gap-may-lan', sem: 1, icon: '📐', lesson: 'g3-c6-b39',
      title: L('So sánh số lớn gấp mấy lần số bé', 'How many times as much is the larger number?'),
      spot: L('Bài toán cho hai số và hỏi: số lớn gấp mấy lần số bé? (dài gấp mấy lần, nặng gấp mấy lần, nhiều gấp mấy lần)', 'The problem gives two numbers and asks: how many times the smaller number is the larger one? (how many times as long, as heavy, as many)'),
      steps: [
        L('Bước 1: Tìm số lớn và số bé.', 'Step 1: Find the larger number and the smaller number.'),
        L('Bước 2: Lấy số lớn chia cho số bé.', 'Step 2: Divide the larger number by the smaller number.'),
        L('Bước 3: Viết đáp số kèm chữ “lần”.', 'Step 3: Write the answer with the word "times".'),
      ],
      tip: L('“Gấp mấy lần” thì chia. “Hơn bao nhiêu” thì trừ. 12 gấp 3 lần 4, nhưng 12 hơn 4 là 8.', '"How many times" means divide. "How many more" means subtract. 12 is 3 times 4, but 12 is 8 more than 4.'),
      guide: rng => {
        const b = R(rng, 2, 9), k0 = R(rng, 2, 9), k = k0 === b ? (b % 8) + 2 : k0, a = b * k, st = lanStory(rng, a, b);
        return G(L(st.vi, st.en), [
          step(L(`Số nào là số lớn: ${a} hay ${b}?`, `Which is the larger number: ${a} or ${b}?`), ch(rng, a, [b]), L(`Số lớn là ${a}, số bé là ${b}.`, `The larger number is ${a} and the smaller number is ${b}.`)),
          step(L('Muốn biết số lớn gấp mấy lần số bé, em chọn phép tính nào?', 'To find how many times the smaller number the larger one is, which calculation do you choose?'), ch(rng, `${a} : ${b}`, [`${a} ${M} ${b}`, `${a} + ${b}`]), L(`Lấy số lớn chia cho số bé: ${a} : ${b}.`, `Divide the larger number by the smaller number: ${a} : ${b}.`), L('Gấp mấy lần: chia. Hơn bao nhiêu: trừ.', 'How many times: divide. How many more: subtract.')),
          step(`${a} : ${b} = ?`, num(k), `${st.sol}: ${a} : ${b} = ${k} (${L('lần', 'times')}).`, L(`Nhẩm bảng nhân ${b}: ${b} × ? = ${a}.`, `Use the ${b} times table: ${b} × ? = ${a}.`)),
        ], L(`Đáp số: ${k} lần.`, `Answer: ${k} times.`), vz('tape', { bars: [{ label: st.la, parts: k, units: k, value: String(a) }, { label: st.lb, parts: 1, units: 1, value: String(b) }] }));
      },
      practice: (rng, i) => {
        if (i >= 8) { const q = DT.bank(rng, ['g3-gap-may-lan']); if (q) return q; }
        const b = R(rng, 2, 9), k0 = R(rng, 2, i < 2 ? 5 : 9), k = k0 === b ? (b % 8) + 2 : k0, a = b * k, T = L('lần', 'times');
        const hint = L('Lấy số lớn chia cho số bé.', 'Divide the larger number by the smaller number.');
        const tape = (la, lb) => vz('tape', { bars: [{ label: la, parts: k, units: k, value: String(a) }, { label: lb, parts: 1, units: 1, value: String(b) }] });
        if (i < 4) { const st = lanStory(rng, a, b); return Q(L(st.vi, st.en), num(k, T), `${st.sol}: ${a} : ${b} = ${k} (${T}).`, { hint, visual: tape(st.la, st.lb) }); }
        if (i === 4) return Q(L(`Số ${a} gấp mấy lần số ${b}?`, `How many times ${b} is ${a}?`), num(k, T), L(`${a} : ${b} = ${k}. Vậy ${a} gấp ${k} lần ${b}.`, `${a} : ${b} = ${k}. So ${a} is ${k} times ${b}.`), { hint, visual: tape(L('Số lớn', 'Larger'), L('Số bé', 'Smaller')) });
        if (i === 5) {
          const st = lanStory(rng, a, b), times = R(rng, 0, 1) === 1;
          return Q(times ? L(st.vi, st.en) + L('\nEm chọn phép tính đúng:', '\nChoose the right calculation:') : L(`Số lớn là ${a}, số bé là ${b}. Số lớn hơn số bé bao nhiêu đơn vị?\nEm chọn phép tính đúng:`, `The larger number is ${a} and the smaller number is ${b}. How much more is the larger number?\nChoose the right calculation:`), ch(rng, times ? `${a} : ${b} = ${k}` : `${a} ${M} ${b} = ${a - b}`, [times ? `${a} ${M} ${b} = ${a - b}` : `${a} : ${b} = ${k}`, `${a} + ${b} = ${a + b}`]), times ? L(`Gấp mấy lần thì chia: ${a} : ${b} = ${k} (lần).`, `"How many times" means divide: ${a} : ${b} = ${k} (times).`) : L(`Hơn bao nhiêu thì trừ: ${a} ${M} ${b} = ${a - b}.`, `"How much more" means subtract: ${a} ${M} ${b} = ${a - b}.`), { hint: L('Gấp mấy lần: chia. Hơn bao nhiêu: trừ.', 'How many times: divide. How many more: subtract.') });
        }
        if (i === 6) {
          const [kid, kk] = P(rng, [[6, 5], [6, 6], [6, 7], [7, 4], [7, 5], [7, 6], [8, 4], [8, 5], [9, 3], [9, 4], [9, 5]]), w = DT.name(rng);   // a grown-up of 27 to 45
          const who = P(rng, [['mẹ', 'mum'], ['bố', 'dad'], ['cô giáo', 'teacher']]);
          return Q(L(`Năm nay ${w} ${kid} tuổi, ${who[0]} của ${w} ${kid * kk} tuổi. Hỏi năm nay tuổi ${who[0]} gấp mấy lần tuổi ${w}?`, `This year ${w} is ${kid} years old and ${w}'s ${who[1]} is ${kid * kk}. How many times ${w}'s age is the ${who[1]}'s age this year?`), num(kk, T), `${kid * kk} : ${kid} = ${kk} (${T}).`, { hint });
        }
        // units to change inside the problem: 4 m and 8 dm
        const [sm, kk] = P(rng, [[2, 5], [4, 5], [5, 2], [5, 4], [5, 6], [5, 8], [8, 5]]), small = sm * kk, m = small / 10;   // m big units = sm × kk small units
        const [ub, us] = P(rng, [['m', 'dm'], ['dm', 'cm'], ['cm', 'mm']]), th = P(rng, [['Sợi dây đỏ', 'sợi dây xanh', 'The red string', 'the blue string'], ['Băng giấy đỏ', 'băng giấy xanh', 'The red strip', 'the blue strip'], ['Đoạn thẳng AB', 'đoạn thẳng CD', 'Line segment AB', 'line segment CD']]);
        return Q(L(`${th[0]} dài ${m} ${ub}, ${th[1]} dài ${sm} ${us}. Hỏi ${lc1(th[0])} dài gấp mấy lần ${th[1]}?`, `${th[2]} is ${m} ${ub} long and ${th[3]} is ${sm} ${us} long. How many times as long as ${th[3]} is ${lc1(th[2])}?`), num(kk, T), L(`Đổi: ${m} ${ub} = ${small} ${us}. ${small} : ${sm} = ${kk} (lần).`, `Change: ${m} ${ub} = ${small} ${us}. ${small} : ${sm} = ${kk} (times).`), { hint: L('Đổi về cùng một đơn vị đo rồi mới chia.', 'Change to the same unit first, then divide.') });
      },
    },

    // ================= HỌC KÌ II =================
    {
      id: 'g3-dt-lam-tron', sem: 2, icon: '🎯', lesson: 'g3-c8-b48',
      title: L('Làm tròn số', 'Rounding numbers'),
      spot: L('Bài bảo em “làm tròn số … đến hàng chục (hàng trăm, hàng nghìn, hàng chục nghìn)” hoặc hỏi “khoảng bao nhiêu”.', 'The problem says "round … to the nearest ten (hundred, thousand, ten thousand)" or asks "about how many".'),
      steps: [
        L('Bước 1: Tìm hàng cần làm tròn đến.', 'Step 1: Find the place you are rounding to.'),
        L('Bước 2: Xét chữ số ở hàng ngay bên phải hàng đó.', 'Step 2: Look at the digit just to the right of that place.'),
        L('Bước 3: Chữ số đó bé hơn 5 thì làm tròn xuống; từ 5 trở lên thì làm tròn lên.', 'Step 3: If that digit is less than 5, round down. If it is 5 or more, round up.'),
        L('Bước 4: Các chữ số bên phải hàng làm tròn đều thành 0.', 'Step 4: All the digits to the right of the rounding place become 0.'),
      ],
      tip: L('Làm tròn đến hàng trăm thì xét chữ số hàng chục, không phải hàng đơn vị. 3472 → 3500 vì 7 lớn hơn 5.', 'To round to the nearest hundred, look at the tens digit, not the ones digit. 3472 → 3500 because 7 is more than 5.'),
      guide: rng => {
        const p = P(rng, [10, 100]), n = pickN(rng, p), r = roundTo(n, p), d = Math.floor(n / (p / 10)) % 10, up = d >= 5, lo = Math.floor(n / p) * p;
        const UP = L('Làm tròn lên', 'Round up'), DOWN = L('Làm tròn xuống', 'Round down');
        return G(L(`Làm tròn số ${F(n)} đến ${RP[p]}.`, `Round ${F(n)} to the nearest ${RP[p]}.`), [
          step(L(`Làm tròn đến ${RP[p]} thì em xét chữ số ở hàng nào?`, `To round to the nearest ${RP[p]}, which digit do you look at?`), ch(rng, LOOK[p], Object.values(LOOK).filter(z => z !== LOOK[p]).slice(0, 2)), L(`Ta xét chữ số ${look[p]}: đó là chữ số ${d}.`, `We look at the ${look[p]} digit: it is ${d}.`), L('Xét chữ số ở hàng ngay bên phải hàng cần làm tròn.', 'Look at the digit just to the right of the rounding place.')),
          step(L(`Chữ số ${look[p]} là ${d}. Em làm tròn lên hay làm tròn xuống?`, `The ${look[p]} digit is ${d}. Do you round up or round down?`), ch(rng, up ? UP : DOWN, [up ? DOWN : UP]), up ? L(`${d} ${d === 5 ? 'bằng' : 'lớn hơn'} 5 nên làm tròn lên.`, `${d} is ${d === 5 ? 'equal to' : 'more than'} 5, so we round up.`) : L(`${d} bé hơn 5 nên làm tròn xuống.`, `${d} is less than 5, so we round down.`), L('Bé hơn 5: làm tròn xuống. Từ 5 trở lên: làm tròn lên.', 'Less than 5: round down. 5 or more: round up.')),
          step(L(`Số ${F(n)} ở giữa ${F(lo)} và ${F(lo + p)}. Làm tròn đến ${RP[p]} được số nào?`, `${F(n)} is between ${F(lo)} and ${F(lo + p)}. What is it rounded to the nearest ${RP[p]}?`), num(r), L(`Làm tròn số ${F(n)} đến ${RP[p]} được ${F(r)}.`, `${F(n)} rounded to the nearest ${RP[p]} is ${F(r)}.`)),
        ], L(`Đáp số: ${F(r)}.`, `Answer: ${F(r)}.`), vz('numberLine', { min: lo, max: lo + p, step: p / 10, labelEvery: 10, point: Math.floor(n / (p / 10)) * (p / 10) }));
      },
      practice: (rng, i) => {
        if (i === 9) { const q = DT.bank(rng, ['g3-lam-tron-sau-khi-tinh']); if (q) return q; }
        const p = i < 2 ? 10 : i < 4 ? 100 : i === 4 ? 1000 : i === 5 ? 10000 : P(rng, [10, 100, 1000]), n = i === 5 ? R(rng, 11000, 88999) : pickN(rng, p), r = roundTo(n, p), d = Math.floor(n / (p / 10)) % 10, lo = Math.floor(n / p) * p;
        const ex = L(`Chữ số ${look[p]} là ${d}, ${d >= 5 ? 'từ 5 trở lên nên làm tròn lên' : 'bé hơn 5 nên làm tròn xuống'}: ${F(n)} → ${F(r)}.`, `The ${look[p]} digit is ${d}, ${d >= 5 ? '5 or more, so round up' : 'less than 5, so round down'}: ${F(n)} → ${F(r)}.`);
        const hint = L(`Xét chữ số ${look[p]}.`, `Look at the ${look[p]} digit.`);
        if (i < 6) return i % 2 === 0 ? Q(L(`Làm tròn số ${F(n)} đến ${RP[p]}.`, `Round ${F(n)} to the nearest ${RP[p]}.`), num(r), ex, { hint }) : Q(L(`Làm tròn số ${F(n)} đến ${RP[p]} ta được số nào?`, `What is ${F(n)} rounded to the nearest ${RP[p]}?`), ch(rng, r, [r === lo ? lo + p : lo, roundTo(n, p * 10) === r ? r + p : roundTo(n, p * 10), Math.floor(n / (p / 10)) * (p / 10)].filter(z => z > 0)), ex, { hint });
        if (i === 6) {
          const c = P(rng, [[`Một sân vận động có ${F(n)} khán giả. Làm tròn đến ${RP[p]} thì sân vận động có khoảng bao nhiêu khán giả?`, `There are ${F(n)} people in a stadium. Rounded to the nearest ${RP[p]}, about how many people are there?`], [`Một thư viện có ${F(n)} quyển sách. Làm tròn đến ${RP[p]} thì thư viện có khoảng bao nhiêu quyển sách?`, `A library has ${F(n)} books. Rounded to the nearest ${RP[p]}, about how many books does it have?`], [`Quãng đường dài ${F(n)} m. Làm tròn đến ${RP[p]} thì quãng đường dài khoảng bao nhiêu mét?`, `A road is ${F(n)} m long. Rounded to the nearest ${RP[p]}, about how many metres long is it?`]]);
          return Q(L(c[0], c[1]), num(r), ex, { hint });
        }
        if (i === 7) {
          const ok = lo + R(rng, 5, 9) * (p / 10) + (p > 10 ? R(rng, 0, p / 10 - 1) : 0), target = lo + p;
          const bad = [lo + R(rng, 1, 4) * (p / 10), target + R(rng, 5, 9) * (p / 10), lo - R(rng, 1, 4) * (p / 10)].filter(z => z > 0 && roundTo(z, p) !== target);
          return Q(L(`Số nào dưới đây làm tròn đến ${RP[p]} thì được ${F(target)}?`, `Which of these numbers is ${F(target)} when rounded to the nearest ${RP[p]}?`), ch(rng, ok, bad), L(`${F(ok)} có chữ số ${look[p]} là ${Math.floor(ok / (p / 10)) % 10} nên làm tròn lên thành ${F(target)}.`, `${F(ok)} has ${Math.floor(ok / (p / 10)) % 10} as its ${look[p]} digit, so it rounds up to ${F(target)}.`), { hint: L('Làm tròn từng số rồi so với số đã cho.', 'Round each number and compare it with the number given.') });
        }
        const t = R(rng, 12, 98) * 10, big = R(rng, 0, 1) === 1;
        return big ? Q(L(`Tìm số lớn nhất mà khi làm tròn đến hàng chục thì được ${t}.`, `Find the greatest number that is ${t} when rounded to the nearest ten.`), num(t + 4), L(`Các số ${t + 1}, ${t + 2}, ${t + 3}, ${t + 4} làm tròn xuống thành ${t}; ${t + 5} làm tròn lên thành ${t + 10}. Số lớn nhất là ${t + 4}.`, `${t + 1}, ${t + 2}, ${t + 3} and ${t + 4} round down to ${t}; ${t + 5} rounds up to ${t + 10}. The greatest is ${t + 4}.`), { hint: L('Chữ số hàng đơn vị bé hơn 5 thì làm tròn xuống.', 'A ones digit less than 5 rounds down.') })
          : Q(L(`Tìm số bé nhất mà khi làm tròn đến hàng chục thì được ${t}.`, `Find the smallest number that is ${t} when rounded to the nearest ten.`), num(t - 5), L(`Các số từ ${t - 5} đến ${t - 1} làm tròn lên thành ${t}; ${t - 6} làm tròn xuống thành ${t - 10}. Số bé nhất là ${t - 5}.`, `The numbers from ${t - 5} to ${t - 1} round up to ${t}; ${t - 6} rounds down to ${t - 10}. The smallest is ${t - 5}.`), { hint: L('Chữ số hàng đơn vị từ 5 trở lên thì làm tròn lên.', 'A ones digit of 5 or more rounds up.') });
      },
    },

    {
      id: 'g3-dt-chu-vi', sem: 2, icon: '🔲', lesson: 'g3-c9-b50',
      title: L('Chu vi hình chữ nhật, hình vuông', 'Perimeter of a rectangle and of a square'),
      spot: L('Bài hỏi “chu vi”, “rào xung quanh”, “viền quanh”, “đi một vòng quanh” một hình chữ nhật hoặc hình vuông.', 'The problem asks for the "perimeter", a "fence around", an "edge around" or "one walk around" a rectangle or a square.'),
      steps: [
        L('Bước 1: Hình chữ nhật: lấy chiều dài cộng chiều rộng (cùng đơn vị đo).', 'Step 1: Rectangle: add the length and the width (in the same unit).'),
        L('Bước 2: Rồi nhân tổng đó với 2.', 'Step 2: Then multiply that sum by 2.'),
        L('Bước 3: Hình vuông: lấy độ dài một cạnh nhân với 4.', 'Step 3: Square: multiply the side length by 4.'),
      ],
      tip: L('Chu vi là độ dài đường bao quanh hình, đơn vị là cm, m. Đừng nhầm với diện tích (dài × rộng, đơn vị cm²).', 'The perimeter is the distance all the way round, in cm or m. Do not mix it up with the area (length × width, in cm²).'),
      guide: rng => {
        if (R(rng, 0, 2) === 0) {
          const c = P(rng, SQS), a = R(rng, c.lo, c.hi), p = a * 4;
          return G(L(`Một ${c.vi} có cạnh dài ${a} ${c.u}. Tính chu vi của ${c.vi.replace(' hình vuông', '')} đó.`, `A ${c.en} has sides ${a} ${c.u} long. Work out its perimeter.`), [
            step(L('Muốn tính chu vi hình vuông, em chọn cách nào?', 'How do you find the perimeter of a square?'), ch(rng, P_SQ, [A_SQ, L('Cạnh + 4', 'Side + 4')]), L('Hình vuông có 4 cạnh bằng nhau. Chu vi hình vuông = độ dài cạnh × 4.', 'A square has 4 equal sides. Perimeter of a square = side length × 4.')),
            step(`${a} × 4 = ?`, num(p, c.u), L(`Chu vi là: ${a} × 4 = ${p} (${c.u}).`, `Perimeter: ${a} × 4 = ${p} (${c.u}).`)),
          ], L(`Đáp số: ${p} ${c.u}.`, `Answer: ${p} ${c.u}.`), vz('shape', { kind: 'square', dims: { a, unit: c.u }, showDims: true }));
        }
        const c = P(rng, RECTS), [a, b] = rectDims(rng, c), s = a + b, p = s * 2;
        return G(L(`Một ${c.vi} có chiều dài ${a} ${c.u}, chiều rộng ${b} ${c.u}. Tính chu vi của ${c.vi.replace(' hình chữ nhật', '')} đó.`, `A ${c.en} is ${a} ${c.u} long and ${b} ${c.u} wide. Work out its perimeter.`), [
          step(L('Muốn tính chu vi hình chữ nhật, em chọn cách nào?', 'How do you find the perimeter of a rectangle?'), ch(rng, P_RECT, [A_RECT, L('Chiều dài + chiều rộng', 'Length + width')]), L('Chu vi hình chữ nhật = (chiều dài + chiều rộng) × 2.', 'Perimeter of a rectangle = (length + width) × 2.'), L('Hình chữ nhật có 2 chiều dài và 2 chiều rộng.', 'A rectangle has 2 lengths and 2 widths.')),
          step(L(`Tính trong ngoặc trước: ${a} + ${b} = ?`, `Work out the brackets first: ${a} + ${b} = ?`), num(s), `${a} + ${b} = ${s}.`),
          step(`${s} × 2 = ?`, num(p, c.u), L(`Chu vi là: (${a} + ${b}) × 2 = ${p} (${c.u}).`, `Perimeter: (${a} + ${b}) × 2 = ${p} (${c.u}).`)),
        ], L(`Đáp số: ${p} ${c.u}.`, `Answer: ${p} ${c.u}.`), vz('shape', { kind: 'rect', dims: { a, b, unit: c.u }, showDims: true }));
      },
      practice: (rng, i) => {
        const hR = L('Chu vi hình chữ nhật = (dài + rộng) × 2.', 'Perimeter of a rectangle = (length + width) × 2.'), hS = L('Chu vi hình vuông = cạnh × 4.', 'Perimeter of a square = side × 4.');
        if (i === 0 || i === 3) { const c = P(rng, RECTS), [a, b] = rectDims(rng, c, i === 0), u = i === 0 ? 'cm' : c.u, p = (a + b) * 2; return Q(i === 0 ? L(`Tính chu vi hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm.`, `Work out the perimeter of a rectangle ${a} cm long and ${b} cm wide.`) : L(`Một ${c.vi} có chiều dài ${a} ${u}, chiều rộng ${b} ${u}. Tính chu vi của ${c.vi.replace(' hình chữ nhật', '')} đó.`, `A ${c.en} is ${a} ${u} long and ${b} ${u} wide. Work out its perimeter.`), num(p, u), `(${a} + ${b}) × 2 = ${a + b} × 2 = ${p} (${u}).`, { hint: hR, visual: i === 0 ? vz('areaGrid', { w: a, h: b, unit: 'cm', showPerimeter: true }) : vz('shape', { kind: 'rect', dims: { a, b, unit: u }, showDims: true }) }); }
        if (i === 1) { const c = P(rng, SQS), a = R(rng, c.lo, c.hi); return Q(L(`Một ${c.vi} có cạnh dài ${a} ${c.u}. Tính chu vi của ${c.vi.replace(' hình vuông', '')} đó.`, `A ${c.en} has sides ${a} ${c.u} long. Work out its perimeter.`), num(a * 4, c.u), `${a} × 4 = ${a * 4} (${c.u}).`, { hint: hS, visual: vz('shape', { kind: 'square', dims: { a, unit: c.u }, showDims: true }) }); }
        if (i === 2) { const a = R(rng, 3, 9), b = R(rng, 3, 9), c = R(rng, Math.abs(a - b) + 1, a + b - 1); return Q(L(`Tính chu vi hình tam giác có độ dài ba cạnh là ${a} cm, ${b} cm và ${c} cm.`, `Work out the perimeter of a triangle with sides of ${a} cm, ${b} cm and ${c} cm.`), num(a + b + c, 'cm'), `${a} + ${b} + ${c} = ${a + b + c} (cm).`, { hint: L('Chu vi của một hình là tổng độ dài các cạnh.', 'The perimeter of a shape is the total length of its sides.'), visual: vz('shape', { kind: 'triangle', dims: { a, b, c }, showDims: true }) }); }
        if (i === 4) { const c = P(rng, SQS), a = R(rng, c.lo, c.hi), p = a * 4; return Q(L(`Một ${c.vi} có chu vi ${p} ${c.u}. Tính độ dài cạnh của ${c.vi.replace(' hình vuông', '')} đó.`, `A ${c.en} has a perimeter of ${p} ${c.u}. Work out the length of its side.`), num(a, c.u), L(`Cạnh hình vuông = chu vi : 4 = ${p} : 4 = ${a} (${c.u}).`, `Side of a square = perimeter : 4 = ${p} : 4 = ${a} (${c.u}).`), { hint: L('Hình vuông có 4 cạnh bằng nhau: lấy chu vi chia cho 4.', 'A square has 4 equal sides: divide the perimeter by 4.') }); }
        if (i === 5) { const [a, b] = rectDims(rng, RECTS[0]), p = (a + b) * 2; return Q(L(`Bác Tư rào xung quanh một mảnh vườn hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Hỏi hàng rào dài bao nhiêu mét?`, `Uncle Tư puts a fence all the way round a rectangular garden ${a} m long and ${b} m wide. How many metres long is the fence?`), num(p, 'm'), L(`Hàng rào dài bằng chu vi mảnh vườn: (${a} + ${b}) × 2 = ${p} (m).`, `The fence is as long as the perimeter of the garden: (${a} + ${b}) × 2 = ${p} (m).`), { hint: L('Rào xung quanh là tính chu vi.', 'A fence all the way round means the perimeter.'), visual: vz('shape', { kind: 'rect', dims: { a, b, unit: 'm' }, showDims: true }) }); }
        if (i === 6) { const adm = R(rng, 2, 5), a = adm * 10, b = R(rng, 8, a - 2), p = (a + b) * 2; return Q(L(`Một tấm bìa hình chữ nhật có chiều dài ${adm} dm, chiều rộng ${b} cm. Tính chu vi tấm bìa đó theo xăng-ti-mét.`, `A rectangular piece of card is ${adm} dm long and ${b} cm wide. Work out its perimeter in centimetres.`), num(p, 'cm'), L(`Đổi: ${adm} dm = ${a} cm. Chu vi: (${a} + ${b}) × 2 = ${p} (cm).`, `Change: ${adm} dm = ${a} cm. Perimeter: (${a} + ${b}) × 2 = ${p} (cm).`), { hint: L('Đổi về cùng một đơn vị đo trước khi tính.', 'Change to the same unit before you calculate.') }); }
        if (i === 7) { const c = P(rng, RECTS), [a, b] = rectDims(rng, c), d = a - b, p = (a + b) * 2; return Q(L(`Một ${c.vi} có chiều dài ${a} ${c.u}, chiều rộng ngắn hơn chiều dài ${d} ${c.u}. Tính chu vi của ${c.vi.replace(' hình chữ nhật', '')} đó.`, `A ${c.en} is ${a} ${c.u} long. Its width is ${d} ${c.u} shorter than its length. Work out its perimeter.`), num(p, c.u), L(`Chiều rộng: ${a} ${M} ${d} = ${b} (${c.u}). Chu vi: (${a} + ${b}) × 2 = ${p} (${c.u}).`, `Width: ${a} ${M} ${d} = ${b} (${c.u}). Perimeter: (${a} + ${b}) × 2 = ${p} (${c.u}).`), { hint: L('Bước 1: tìm chiều rộng.', 'Step 1: find the width.') }); }
        if (i === 8) { const c = P(rng, RECTS), [a, b] = rectDims(rng, c), p = (a + b) * 2; return Q(L(`Một ${c.vi} có chu vi ${p} ${c.u}, chiều dài ${a} ${c.u}. Tính chiều rộng của ${c.vi.replace(' hình chữ nhật', '')} đó.`, `A ${c.en} has a perimeter of ${p} ${c.u} and is ${a} ${c.u} long. Work out its width.`), num(b, c.u), L(`Chiều dài + chiều rộng = ${p} : 2 = ${a + b} (${c.u}). Chiều rộng: ${a + b} ${M} ${a} = ${b} (${c.u}).`, `Length + width = ${p} : 2 = ${a + b} (${c.u}). Width: ${a + b} ${M} ${a} = ${b} (${c.u}).`), { hint: L('Chu vi chia cho 2 thì được tổng của chiều dài và chiều rộng.', 'The perimeter divided by 2 gives the length plus the width.') }); }
        const side = R(rng, 6, 30), a = R(rng, side + 1, 2 * side - 2), b = 2 * side - a, p = side * 4, w = DT.name(rng);
        return Q(L(`Bạn ${w} uốn một sợi dây thép vừa đủ thành hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Nếu uốn sợi dây đó thành hình vuông thì cạnh hình vuông dài bao nhiêu xăng-ti-mét?`, `${w} bends a piece of wire into a rectangle ${a} cm long and ${b} cm wide, using all the wire. If the same wire is bent into a square, how many centimetres long is each side?`), num(side, 'cm'), L(`Sợi dây dài bằng chu vi hình chữ nhật: (${a} + ${b}) × 2 = ${p} (cm). Cạnh hình vuông: ${p} : 4 = ${side} (cm).`, `The wire is as long as the perimeter of the rectangle: (${a} + ${b}) × 2 = ${p} (cm). Side of the square: ${p} : 4 = ${side} (cm).`), { hint: L('Bước 1: tính độ dài sợi dây (chu vi hình chữ nhật).', 'Step 1: find the length of the wire (the perimeter of the rectangle).') });
      },
    },

    {
      id: 'g3-dt-dien-tich', sem: 2, icon: '🟩', lesson: 'g3-c9-b52',
      title: L('Diện tích hình chữ nhật, hình vuông', 'Area of a rectangle and of a square'),
      spot: L('Bài hỏi “diện tích” của một hình chữ nhật hoặc hình vuông: mặt bàn, tấm bìa, viên gạch, mảnh vườn rộng bao nhiêu.', 'The problem asks for the "area" of a rectangle or a square: how much surface a table top, a card, a tile or a garden covers.'),
      steps: [
        L('Bước 1: Hình chữ nhật: lấy chiều dài nhân với chiều rộng (cùng đơn vị đo).', 'Step 1: Rectangle: multiply the length by the width (in the same unit).'),
        L('Bước 2: Hình vuông: lấy độ dài một cạnh nhân với chính nó.', 'Step 2: Square: multiply the side length by itself.'),
        L('Bước 3: Viết đơn vị diện tích: cm² (xăng-ti-mét vuông).', 'Step 3: Write the unit of area: cm² (square centimetres).'),
      ],
      tip: L('Diện tích dùng đơn vị cm², còn chu vi dùng cm. Hình vuông cạnh 5 cm có diện tích 5 × 5 = 25 (cm²), không phải 5 × 4.', 'Area is in cm², perimeter is in cm. A square with 5 cm sides has an area of 5 × 5 = 25 (cm²), not 5 × 4.'),
      guide: rng => {
        const sq = R(rng, 0, 2) === 0, a = sq ? R(rng, 3, 9) : R(rng, 4, 12), b = sq ? a : R(rng, 2, Math.min(9, a - 1)), s = a * b, w = DT.name(rng);
        return G(sq ? L(`${w} có một tấm bìa hình vuông cạnh ${a} cm. Tính diện tích tấm bìa đó.`, `${w} has a square piece of card with sides ${a} cm long. Work out its area.`) : L(`${w} có một tấm bìa hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính diện tích tấm bìa đó.`, `${w} has a rectangular piece of card ${a} cm long and ${b} cm wide. Work out its area.`), [
          step(sq ? L('Muốn tính diện tích hình vuông, em chọn cách nào?', 'How do you find the area of a square?') : L('Muốn tính diện tích hình chữ nhật, em chọn cách nào?', 'How do you find the area of a rectangle?'), sq ? ch(rng, A_SQ, [P_SQ, L('Cạnh + cạnh', 'Side + side')]) : ch(rng, A_RECT, [P_RECT, L('Chiều dài + chiều rộng', 'Length + width')]), sq ? L('Diện tích hình vuông = cạnh × cạnh.', 'Area of a square = side × side.') : L('Diện tích hình chữ nhật = chiều dài × chiều rộng.', 'Area of a rectangle = length × width.'), L('Diện tích là số ô vuông 1 cm² phủ kín hình.', 'The area is the number of 1 cm² squares that cover the shape.')),
          step(`${a} × ${b} = ?`, num(s), L(`Diện tích tấm bìa là: ${a} × ${b} = ${s} (cm²).`, `Area of the card: ${a} × ${b} = ${s} (cm²).`)),
          step(L(`Sau số ${s}, em viết đơn vị nào?`, `Which unit do you write after ${s}?`), ch(rng, 'cm²', ['cm', 'm']), L('Diện tích đo bằng xăng-ti-mét vuông, viết là cm².', 'Area is measured in square centimetres, written cm².')),
        ], L(`Đáp số: ${s} cm².`, `Answer: ${s} cm².`), vz('areaGrid', { w: a, h: b, unit: 'cm', fill: true }));
      },
      practice: (rng, i) => {
        const hR = L('Diện tích hình chữ nhật = dài × rộng.', 'Area of a rectangle = length × width.'), hS = L('Diện tích hình vuông = cạnh × cạnh.', 'Area of a square = side × side.');
        const a = i < 2 ? R(rng, 3, 9) : R(rng, 6, 30), b = R(rng, 2, Math.min(9, a - 1));
        const grid = (w, h) => (w <= 10 ? vz('areaGrid', { w, h, unit: 'cm', fill: true }) : vz('shape', { kind: 'rect', dims: { a: w, b: h }, showDims: true }));
        if (i === 0 || i === 2) return Q(L(`Tính diện tích hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm.`, `Work out the area of a rectangle ${a} cm long and ${b} cm wide.`), num(a * b, 'cm²'), `${a} × ${b} = ${a * b} (cm²).`, { hint: hR, visual: grid(a, b) });
        if (i === 1) { const s = R(rng, 2, 9); return Q(L(`Tính diện tích hình vuông có cạnh ${s} cm.`, `Work out the area of a square with sides ${s} cm long.`), num(s * s, 'cm²'), `${s} × ${s} = ${s * s} (cm²).`, { hint: hS, visual: vz('areaGrid', { w: s, h: s, unit: 'cm', fill: true }) }); }
        // lớp 3 multiplies by a one-digit number only, so a square has sides up to 9 cm
        if (i === 3) { const c = P(rng, [['Một tờ giấy màu hình vuông', 'A square sheet of coloured paper', true], ['Một tấm thiệp hình chữ nhật', 'A rectangular greetings card', false], ['Một nhãn vở hình chữ nhật', 'A rectangular book label', false], ['Một chiếc khăn tay hình chữ nhật', 'A rectangular handkerchief', false]]); const s = R(rng, 5, 9); return c[2] ? Q(L(`${c[0]} có cạnh ${s} cm. Tính diện tích tờ giấy đó.`, `${c[1]} has sides ${s} cm long. Work out its area.`), num(s * s, 'cm²'), `${s} × ${s} = ${s * s} (cm²).`, { hint: hS, visual: vz('areaGrid', { w: s, h: s, unit: 'cm', fill: true }) }) : Q(L(`${c[0]} có chiều dài ${a} cm, chiều rộng ${b} cm. Tính diện tích của nó.`, `${c[1]} is ${a} cm long and ${b} cm wide. Work out its area.`), num(a * b, 'cm²'), `${a} × ${b} = ${a * b} (cm²).`, { hint: hR, visual: grid(a, b) }); }
        if (i === 4) return Q(L(`Hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Diện tích của hình đó là:`, `A rectangle is ${a} cm long and ${b} cm wide. Its area is:`), ch(rng, `${a * b} cm²`, [`${(a + b) * 2} cm²`, `${a + b} cm²`, `${a * b} cm`]), L(`Diện tích = dài × rộng = ${a} × ${b} = ${a * b} (cm²). Còn (${a} + ${b}) × 2 = ${(a + b) * 2} là chu vi (cm).`, `Area = length × width = ${a} × ${b} = ${a * b} (cm²). (${a} + ${b}) × 2 = ${(a + b) * 2} is the perimeter (cm).`), { hint: L('Diện tích: nhân, đơn vị cm². Chu vi: (dài + rộng) × 2, đơn vị cm.', 'Area: multiply, in cm². Perimeter: (length + width) × 2, in cm.'), visual: grid(a, b) });
        if (i === 5) { const adm = R(rng, 2, 4), aa = adm * 10, bb = R(rng, 3, 9); return Q(L(`Một tấm bìa hình chữ nhật có chiều dài ${adm} dm, chiều rộng ${bb} cm. Tính diện tích tấm bìa đó theo xăng-ti-mét vuông.`, `A rectangular piece of card is ${adm} dm long and ${bb} cm wide. Work out its area in square centimetres.`), num(aa * bb, 'cm²'), L(`Đổi: ${adm} dm = ${aa} cm. Diện tích: ${aa} × ${bb} = ${aa * bb} (cm²).`, `Change: ${adm} dm = ${aa} cm. Area: ${aa} × ${bb} = ${aa * bb} (cm²).`), { hint: L('Đổi về cùng một đơn vị đo trước khi nhân.', 'Change to the same unit before you multiply.') }); }
        if (i === 6) return Q(L(`Một hình chữ nhật có diện tích ${a * b} cm², chiều rộng ${b} cm. Tính chiều dài hình chữ nhật đó.`, `A rectangle has an area of ${a * b} cm² and is ${b} cm wide. Work out its length.`), num(a, 'cm'), L(`Chiều dài = diện tích : chiều rộng = ${a * b} : ${b} = ${a} (cm).`, `Length = area : width = ${a * b} : ${b} = ${a} (cm).`), { hint: L('Chiều dài × chiều rộng = diện tích. Tìm thừa số chưa biết.', 'Length × width = area. Find the missing factor.') });
        if (i === 9) {   // two steps: the width first, then the area
          const len = R(rng, 12, 30), d = R(rng, len - 9, len - 2), wd = len - d;
          return Q(L(`Một hình chữ nhật có chiều dài ${len} cm, chiều rộng ngắn hơn chiều dài ${d} cm. Tính diện tích hình chữ nhật đó.`, `A rectangle is ${len} cm long. Its width is ${d} cm shorter than its length. Work out its area.`), num(len * wd, 'cm²'), L(`Chiều rộng: ${len} ${M} ${d} = ${wd} (cm). Diện tích: ${len} × ${wd} = ${len * wd} (cm²).`, `Width: ${len} ${M} ${d} = ${wd} (cm). Area: ${len} × ${wd} = ${len * wd} (cm²).`), { hint: L('Bước 1: tìm chiều rộng.', 'Step 1: find the width.') });
        }
        if (i === 7) { const k = R(rng, 2, 4), w = R(rng, 3, 9), len = w * k; return Q(L(`Một hình chữ nhật có chiều rộng ${w} cm, chiều dài gấp ${k} lần chiều rộng. Tính diện tích hình chữ nhật đó.`, `A rectangle is ${w} cm wide. Its length is ${k} times its width. Work out its area.`), num(len * w, 'cm²'), L(`Chiều dài: ${w} × ${k} = ${len} (cm). Diện tích: ${len} × ${w} = ${len * w} (cm²).`, `Length: ${w} × ${k} = ${len} (cm). Area: ${len} × ${w} = ${len * w} (cm²).`), { hint: L('Bước 1: tìm chiều dài.', 'Step 1: find the length.') }); }
        const s = R(rng, 3, 9), p = s * 4;
        return Q(L(`Một hình vuông có chu vi ${p} cm. Tính diện tích hình vuông đó.`, `A square has a perimeter of ${p} cm. Work out its area.`), num(s * s, 'cm²'), L(`Cạnh hình vuông: ${p} : 4 = ${s} (cm). Diện tích: ${s} × ${s} = ${s * s} (cm²).`, `Side: ${p} : 4 = ${s} (cm). Area: ${s} × ${s} = ${s * s} (cm²).`), { hint: L('Bước 1: tìm cạnh hình vuông (chu vi : 4).', 'Step 1: find the side of the square (perimeter : 4).') });
      },
    },

    {
      id: 'g3-dt-thoi-gian', sem: 2, icon: '⏱️', lesson: 'g3-c13-b66',
      title: L('Tính khoảng thời gian (giờ, phút)', 'Working out how long something takes (hours and minutes)'),
      spot: L('Bài toán cho giờ bắt đầu và giờ kết thúc, hỏi kéo dài bao nhiêu phút; hoặc cho giờ bắt đầu và thời gian, hỏi giờ kết thúc.', 'The problem gives the start time and the end time and asks how many minutes it lasts, or gives the start time and how long it lasts and asks for the end time.'),
      steps: [
        L('Bước 1: Nhớ: 1 giờ = 60 phút.', 'Step 1: Remember: 1 hour = 60 minutes.'),
        L('Bước 2: Cùng một giờ: lấy số phút lúc kết thúc trừ số phút lúc bắt đầu.', 'Step 2: Inside the same hour: take the start minutes away from the end minutes.'),
        L('Bước 3: Qua giờ mới: tính số phút đến giờ đúng, rồi cộng với số phút sau giờ đúng.', 'Step 3: Across an hour: find the minutes up to the o\'clock, then add the minutes after it.'),
      ],
      tip: L('Từ 7 giờ 40 phút đến 8 giờ 10 phút không phải là 40 − 10. Em đếm: đến 8 giờ là 20 phút, thêm 10 phút nữa là 30 phút.', 'From 7:40 to 8:10 is not 40 − 10. Count: 20 minutes up to 8:00, then 10 more minutes makes 30 minutes.'),
      guide: rng => {
        const h = R(rng, 6, 10), m1 = P(rng, [35, 40, 45, 50, 55]), m2 = P(rng, [5, 10, 15, 20, 25]), to = 60 - m1, tot = to + m2, w = DT.name(rng);
        const act = P(rng, [[`${w} đi từ nhà lúc ${hm(h, m1)} và đến trường lúc ${hm(h + 1, m2)}. Hỏi ${w} đi từ nhà đến trường hết bao nhiêu phút?`, `${w} leaves home at ${hm(h, m1)} and gets to school at ${hm(h + 1, m2)}. How many minutes does it take ${w} to get to school?`], [`Buổi tập bơi của ${w} bắt đầu lúc ${hm(h, m1)} và kết thúc lúc ${hm(h + 1, m2)}. Hỏi buổi tập bơi kéo dài bao nhiêu phút?`, `${w}'s swimming lesson starts at ${hm(h, m1)} and ends at ${hm(h + 1, m2)}. How many minutes does the lesson last?`], [`Bộ phim hoạt hình bắt đầu lúc ${hm(h, m1)} và kết thúc lúc ${hm(h + 1, m2)}. Hỏi bộ phim dài bao nhiêu phút?`, `A cartoon starts at ${hm(h, m1)} and ends at ${hm(h + 1, m2)}. How many minutes long is it?`]]);
        return G(L(act[0], act[1]), [
          step(L('Một giờ có bao nhiêu phút?', 'How many minutes are there in an hour?'), ch(rng, mins(60), [mins(100), mins(30), mins(24)]), L('1 giờ = 60 phút.', '1 hour = 60 minutes.')),
          step(L(`Từ ${hm(h, m1)} đến ${hm(h + 1, 0)} là bao nhiêu phút?`, `How many minutes is it from ${hm(h, m1)} to ${hm(h + 1, 0)}?`), num(to), L(`60 ${M} ${m1} = ${to} (phút).`, `60 ${M} ${m1} = ${to} (minutes).`), L(`Lấy 60 trừ đi ${m1}.`, `Take ${m1} away from 60.`)),
          step(L(`Từ ${hm(h + 1, 0)} đến ${hm(h + 1, m2)} là bao nhiêu phút?`, `How many minutes is it from ${hm(h + 1, 0)} to ${hm(h + 1, m2)}?`), num(m2), L(`Từ ${hm(h + 1, 0)} đến ${hm(h + 1, m2)} là ${m2} phút.`, `From ${hm(h + 1, 0)} to ${hm(h + 1, m2)} is ${m2} minutes.`)),
          step(L(`Tất cả: ${to} + ${m2} = ?`, `Altogether: ${to} + ${m2} = ?`), num(tot), L(`Khoảng thời gian là: ${to} + ${m2} = ${tot} (phút).`, `Time taken: ${to} + ${m2} = ${tot} (minutes).`)),
        ], L(`Đáp số: ${tot} phút.`, `Answer: ${tot} minutes.`), vz('clock', { h, m: m1 }));
      },
      practice: (rng, i) => {
        if (i >= 7) { const q = DT.bank(rng, i === 7 ? ['g3-khoang-thoi-gian'] : i === 8 ? ['g3-thoi-diem-ket-thuc'] : ['g3-khoang-thoi-gian', 'g3-thoi-diem-ket-thuc']); if (q) return q; }
        const h = R(rng, 6, 10), w = DT.name(rng), MIN = L('phút', 'minutes');
        if (i < 2) {
          const m1 = R(rng, 0, 6) * 5, m2 = m1 + R(rng, 2, Math.floor((55 - m1) / 5)) * 5;
          return Q(L(`${w} bắt đầu làm bài lúc ${hm(h, m1)} và làm xong lúc ${hm(h, m2)}. Hỏi ${w} làm bài trong bao nhiêu phút?`, `${w} starts homework at ${hm(h, m1)} and finishes at ${hm(h, m2)}. How many minutes does ${w} take?`), num(m2 - m1, MIN), L(`Cùng trong ${h} giờ: ${m2} ${M} ${m1} = ${m2 - m1} (phút).`, `Inside the same hour: ${m2} ${M} ${m1} = ${m2 - m1} (minutes).`), { hint: L('Lấy số phút lúc xong trừ số phút lúc bắt đầu.', 'Take the start minutes away from the end minutes.'), visual: vz('clock', { h, m: m1 }) });
        }
        if (i < 4) {
          const m1 = P(rng, [35, 40, 45, 50, 55]), m2 = P(rng, [5, 10, 15, 20, 25]), to = 60 - m1;
          return Q(L(`Xe buýt rời bến lúc ${hm(h, m1)} và đến trường lúc ${hm(h + 1, m2)}. Hỏi xe buýt đi từ bến đến trường hết bao nhiêu phút?`, `A bus leaves the station at ${hm(h, m1)} and reaches the school at ${hm(h + 1, m2)}. How many minutes does the journey take?`), num(to + m2, MIN), L(`Đến ${hm(h + 1, 0)}: 60 ${M} ${m1} = ${to} (phút). Thêm ${m2} phút nữa: ${to} + ${m2} = ${to + m2} (phút).`, `Up to ${hm(h + 1, 0)}: 60 ${M} ${m1} = ${to} (minutes). Then ${m2} more: ${to} + ${m2} = ${to + m2} (minutes).`), { hint: L(`Tính số phút đến ${hm(h + 1, 0)} trước.`, `Find the minutes up to ${hm(h + 1, 0)} first.`), visual: vz('clock', { h, m: m1 }) });
        }
        if (i === 4 || i === 5) {
          const m1 = R(rng, 1, 5) * 5, d = R(rng, 2, Math.floor((55 - m1) / 5)) * 5, m2 = m1 + d, end = i === 4;
          return Q(end ? L(`${w} bắt đầu tập đàn lúc ${hm(h, m1)} và tập trong ${d} phút. Hỏi ${w} tập đàn xong lúc mấy giờ?`, `${w} starts piano practice at ${hm(h, m1)} and practises for ${d} minutes. At what time does ${w} finish?`) : L(`${w} đọc sách trong ${d} phút và đọc xong lúc ${hm(h, m2)}. Hỏi ${w} bắt đầu đọc sách lúc mấy giờ?`, `${w} reads for ${d} minutes and finishes at ${hm(h, m2)}. At what time did ${w} start reading?`), timeCh(rng, h, end ? m2 : m1), end ? L(`${m1} + ${d} = ${m2}. ${w} tập xong lúc ${hm(h, m2)}.`, `${m1} + ${d} = ${m2}. ${w} finishes at ${hm(h, m2)}.`) : L(`${m2} ${M} ${d} = ${m1}. ${w} bắt đầu lúc ${hm(h, m1)}.`, `${m2} ${M} ${d} = ${m1}. ${w} started at ${hm(h, m1)}.`), { hint: end ? L('Giờ kết thúc = giờ bắt đầu + thời gian.', 'End time = start time + how long.') : L('Giờ bắt đầu = giờ kết thúc − thời gian.', 'Start time = end time − how long.'), visual: vz('clock', { h, m: end ? m1 : m2 }) });
        }
        const k = P(rng, [5, 10, 15, 20, 25]);
        return Q(L(`Đồng hồ chỉ ${h} giờ kém ${k} phút. Lúc đó là ${h - 1} giờ bao nhiêu phút?`, `The clock shows ${k} minutes to ${h}. How many minutes past ${h - 1} is that?`), num(60 - k, MIN), L(`Còn ${k} phút nữa thì đến ${h} giờ: 60 ${M} ${k} = ${60 - k}. Lúc đó là ${hm(h - 1, 60 - k)}.`, `There are ${k} minutes to go until ${h} o'clock: 60 ${M} ${k} = ${60 - k}. The time is ${hm(h - 1, 60 - k)}.`), { hint: L(`“Kém ${k} phút” nghĩa là còn ${k} phút nữa mới đến giờ đúng.`, `"${k} minutes to" means ${k} minutes are left before the o'clock.`), visual: vz('clock', { h: h - 1, m: 60 - k }) });
      },
    },

    {
      id: 'g3-dt-tien', sem: 2, icon: '💵', lesson: 'g3-c13-b68',
      title: L('Bài toán về tiền Việt Nam: mua hàng, trả lại tiền', 'Money problems: buying things and getting change'),
      spot: L('Bài toán có giá tiền của các món hàng (đồng), hỏi phải trả bao nhiêu tiền hoặc được trả lại bao nhiêu tiền.', 'The problem gives the prices of things (in dong) and asks how much to pay or how much change you get.'),
      steps: [
        L('Bước 1: Tính số tiền mua hàng: giá một món × số món, hoặc cộng giá các món.', 'Step 1: Find the cost: price of one × how many, or add the prices.'),
        L('Bước 2: Tiền trả lại = tiền đưa cho người bán − tiền mua hàng.', 'Step 2: Change = money given to the shopkeeper − cost.'),
        L('Bước 3: Viết đáp số kèm chữ “đồng”.', 'Step 3: Write the answer with the word "dong".'),
      ],
      tip: L('Đừng lấy tiền đưa trừ giá của một món khi mua nhiều món. Phải tính tổng số tiền mua hàng trước.', 'When you buy several things, do not take away the price of just one. Find the total cost first.'),
      guide: rng => {
        const g = P(rng, GOODS), price = P(rng, g[3]), k = R(rng, 2, 5), cost = price * k, note = noteFor(cost), back = note - cost, w = DT.name(rng);
        return G(L(`${w} mua ${k} ${g[0]}, mỗi ${g[0].split(' ')[0]} giá ${F(price)} đồng. ${w} đưa cho cô bán hàng tờ ${F(note)} đồng. Hỏi cô bán hàng phải trả lại ${w} bao nhiêu tiền?`, `${w} buys ${k} ${g[2]} at ${F(price)} dong each. ${w} gives the shopkeeper a ${F(note)} dong note. How much change does ${w} get?`), [
          step(L('Muốn biết tiền trả lại, trước hết em phải tìm gì?', 'To find the change, what must you find first?'), ch(rng, L(`Số tiền mua ${k} ${g[0]}`, `The cost of ${k} ${g[2]}`), [L(`Giá của 1 ${g[0]}`, `The price of ${g[1]}`), L('Số tờ tiền đã đưa', 'The number of notes given')]), L(`Trước hết phải tìm số tiền mua ${k} ${g[0]}.`, `First we must find the cost of ${k} ${g[2]}.`)),
          step(L(`Số tiền mua ${k} ${g[0]}: ${F(price)} × ${k} = ?`, `Cost of ${k} ${g[2]}: ${F(price)} × ${k} = ?`), num(cost, D), L(`Số tiền mua ${k} ${g[0]} là: ${F(price)} × ${k} = ${F(cost)} (đồng).`, `Cost of ${k} ${g[2]}: ${F(price)} × ${k} = ${F(cost)} (dong).`), L(`Nhẩm: ${price / 1000} nghìn × ${k}.`, `Think: ${price / 1000} thousand × ${k}.`)),
          step(L(`Tiền trả lại: ${F(note)} ${M} ${F(cost)} = ?`, `Change: ${F(note)} ${M} ${F(cost)} = ?`), num(back, D), L(`Cô bán hàng phải trả lại số tiền là: ${F(note)} ${M} ${F(cost)} = ${F(back)} (đồng).`, `Change: ${F(note)} ${M} ${F(cost)} = ${F(back)} (dong).`)),
        ], L(`Đáp số: ${F(back)} đồng.`, `Answer: ${F(back)} dong.`), vz('money', { notes: [note] }));
      },
      practice: (rng, i) => {
        if (i >= 7) { const q = DT.bank(rng, i === 7 ? ['g3-tien-hai-buoc'] : i === 8 ? ['g3-khuyen-mai'] : ['g3-tien-hai-buoc', 'g3-khuyen-mai']); if (q) return q; }
        const [g, h] = U.sample(rng, GOODS, 2), p1 = P(rng, g[3]), p2 = P(rng, h[3]), w = DT.name(rng), k = R(rng, 2, 5), one = g[0].split(' ')[0];
        if (i === 0) return Q(L(`${w} mua một ${g[0]} giá ${F(p1)} đồng và một ${h[0]} giá ${F(p2)} đồng. Hỏi ${w} phải trả tất cả bao nhiêu tiền?`, `${w} buys ${g[1]} for ${F(p1)} dong and ${h[1]} for ${F(p2)} dong. How much does ${w} pay altogether?`), num(p1 + p2, D), `${F(p1)} + ${F(p2)} = ${F(p1 + p2)} (${D}).`, { hint: L('Cộng giá tiền hai món hàng.', 'Add the two prices.') });
        if (i === 1) { const note = noteFor(p1); return Q(L(`${w} mua một ${g[0]} giá ${F(p1)} đồng. ${w} đưa cho cô bán hàng tờ ${F(note)} đồng. Hỏi cô bán hàng trả lại ${w} bao nhiêu tiền?`, `${w} buys ${g[1]} for ${F(p1)} dong and gives the shopkeeper a ${F(note)} dong note. How much change does ${w} get?`), num(note - p1, D), `${F(note)} ${M} ${F(p1)} = ${F(note - p1)} (${D}).`, { hint: L('Tiền trả lại = tiền đưa − giá tiền.', 'Change = money given − price.'), visual: vz('money', { notes: [note] }) }); }
        if (i === 2) return Q(L(`Mỗi ${g[0]} giá ${F(p1)} đồng. Hỏi mua ${k} ${g[0]} như thế hết bao nhiêu tiền?`, `${cap(g[1])} costs ${F(p1)} dong. How much do ${k} ${g[2]} cost?`), num(p1 * k, D), `${F(p1)} × ${k} = ${F(p1 * k)} (${D}).`, { hint: L('Giá một món × số món.', 'Price of one × how many.') });
        if (i === 3) { const big = P(rng, [10000, 20000, 50000]), small = P(rng, big === 50000 ? [5000, 10000] : big === 20000 ? [2000, 5000, 10000] : [1000, 2000, 5000]); return Q(L(`${w} đổi một tờ ${F(big)} đồng lấy các tờ ${F(small)} đồng. Hỏi ${w} nhận được mấy tờ ${F(small)} đồng?`, `${w} changes one ${F(big)} dong note for ${F(small)} dong notes. How many ${F(small)} dong notes does ${w} get?`), num(big / small, L('tờ', 'notes')), L(`${F(big)} : ${F(small)} = ${big / small} (tờ). Thử lại: ${F(small)} × ${big / small} = ${F(big)}.`, `${F(big)} : ${F(small)} = ${big / small} (notes). Check: ${F(small)} × ${big / small} = ${F(big)}.`), { hint: L(`Mấy tờ ${F(small)} đồng thì được ${F(big)} đồng?`, `How many ${F(small)} dong notes make ${F(big)} dong?`), visual: vz('money', { notes: [big] }) }); }
        if (i === 4) { const cost = p1 * k, note = noteFor(cost); return Q(L(`${w} mua ${k} ${g[0]}, mỗi ${one} giá ${F(p1)} đồng. ${w} đưa cho cô bán hàng tờ ${F(note)} đồng. Hỏi cô bán hàng phải trả lại ${w} bao nhiêu tiền?`, `${w} buys ${k} ${g[2]} at ${F(p1)} dong each and gives the shopkeeper a ${F(note)} dong note. How much change does ${w} get?`), num(note - cost, D), L(`Tiền mua hàng: ${F(p1)} × ${k} = ${F(cost)} (đồng). Tiền trả lại: ${F(note)} ${M} ${F(cost)} = ${F(note - cost)} (đồng).`, `Cost: ${F(p1)} × ${k} = ${F(cost)} (dong). Change: ${F(note)} ${M} ${F(cost)} = ${F(note - cost)} (dong).`), { hint: L('Bước 1: tính số tiền mua hàng.', 'Step 1: find the cost.'), visual: vz('money', { notes: [note] }) }); }
        if (i === 5) { const cost = p1 + p2, note = noteFor(cost); return Q(L(`Mẹ mua một ${g[0]} giá ${F(p1)} đồng và một ${h[0]} giá ${F(p2)} đồng. Mẹ đưa cho cô bán hàng tờ ${F(note)} đồng. Hỏi cô bán hàng phải trả lại mẹ bao nhiêu tiền?`, `Mum buys ${g[1]} for ${F(p1)} dong and ${h[1]} for ${F(p2)} dong. She gives the shopkeeper a ${F(note)} dong note. How much change does Mum get?`), num(note - cost, D), L(`Tiền mua hàng: ${F(p1)} + ${F(p2)} = ${F(cost)} (đồng). Tiền trả lại: ${F(note)} ${M} ${F(cost)} = ${F(note - cost)} (đồng).`, `Cost: ${F(p1)} + ${F(p2)} = ${F(cost)} (dong). Change: ${F(note)} ${M} ${F(cost)} = ${F(note - cost)} (dong).`), { hint: L('Bước 1: tính tổng số tiền mua hàng.', 'Step 1: find the total cost.'), visual: vz('money', { notes: [note] }) }); }
        const total = p1 * k + p2;
        return Q(L(`${w} mua ${k} ${g[0]}, mỗi ${one} giá ${F(p1)} đồng, và một ${h[0]} giá ${F(p2)} đồng. Hỏi ${w} phải trả tất cả bao nhiêu tiền?`, `${w} buys ${k} ${g[2]} at ${F(p1)} dong each, and ${h[1]} for ${F(p2)} dong. How much does ${w} pay altogether?`), num(total, D), L(`Tiền mua ${k} ${g[0]}: ${F(p1)} × ${k} = ${F(p1 * k)} (đồng). Tất cả: ${F(p1 * k)} + ${F(p2)} = ${F(total)} (đồng).`, `Cost of ${k} ${g[2]}: ${F(p1)} × ${k} = ${F(p1 * k)} (dong). Altogether: ${F(p1 * k)} + ${F(p2)} = ${F(total)} (dong).`), { hint: L(`Bước 1: tính số tiền mua ${k} ${g[0]}.`, `Step 1: find the cost of ${k} ${g[2]}.`) });
      },
    },
  ]);
})();
