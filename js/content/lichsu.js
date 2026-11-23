/* Toán ISA — "Chuyện kể Toán học": short stories from the history of mathematics for the flip book (js/story.js).
 * User request (2026-11-23): a curiosity book "kiểu lật sách" so children who like maths can find out where it comes
 * from. Original texts written for 6–11-year-olds from well-known facts of the history of mathematics, fact-checked on
 * 2026-11-23 against MacTutor, Wikipedia and Vietnamese sources (the user named
 * W. P. Berlinghoff's books as the inspiration; nothing is copied from them). Facts were checked against public
 * sources (MacTutor History of Mathematics, encyclopaedias); what is only a legend is told as "tương truyền".
 * On 2026-11-24 the user sent a Vietnamese translation of F. Cajori, "A History of Mathematics" (1894): the first 18
 * stories were checked against it and 11 more were written from it (see the note above them).
 *
 * A story: { id, icon, when, where, title, art (a picture made by story.js), text: [paragraphs], ask, answer, lesson? }
 * Every string is U.L(vietnamese, english). Maths notation as in the SGK (3,14; 1 000 000).
 */
(function () {
  'use strict';
  const L = U.L;
  window.STORIES = [
    {
      id: 'vach-dem', icon: '🦴', art: 'tally',
      when: L('Khoảng 20 000 năm trước', 'About 20,000 years ago'), where: L('Châu Phi', 'Africa'),
      title: L('Đếm bằng vạch khắc', 'Counting with notches'),
      text: [
        L('Ngày xưa chưa có chữ số. Muốn nhớ mình có bao nhiêu con vật, người ta khắc lên xương hoặc gỗ: mỗi con một vạch.', 'Long ago there were no written numbers. To remember how many animals they had, people cut marks in bone or wood: one mark for each animal.'),
        L('Ở Ishango (châu Phi), người ta tìm được một khúc xương có rất nhiều vạch khắc xếp thành từng nhóm. Nó đã khoảng 20 000 năm tuổi!', 'At Ishango, in Africa, a bone was found with many notches cut in groups. It is about 20,000 years old!'),
        L('Ngày nay em vẫn đếm kiểu ấy khi gạch 4 vạch rồi gạch chéo 1 vạch cho đủ 5.', 'You still count this way today when you draw four lines and cross them with a fifth to make 5.'),
      ],
      ask: L('Gạch 4 vạch rồi gạch chéo 1 vạch là được một bó mấy?', 'Four lines crossed by one more make a bundle of how many?'),
      answer: L('Một bó 5. Đếm theo bó 5 nhanh hơn đếm từng vạch.', 'A bundle of 5. Counting in fives is quicker than counting every line.'),
    },
    {
      id: 'ai-cap', icon: '🏺', art: 'egypt',
      when: L('Khoảng 5 000 năm trước', 'About 5,000 years ago'), where: L('Ai Cập', 'Egypt'),
      title: L('Chữ số bằng hình vẽ', 'Numbers written as pictures'),
      text: [
        L('Người Ai Cập cổ viết số bằng hình vẽ: một vạch là 1, một hình vòng cung là 10, một cuộn dây là 100, một bông sen là 1 000.', 'The ancient Egyptians wrote numbers with pictures: a stroke was 1, an arch was 10, a coil of rope was 100 and a lotus flower was 1,000.'),
        L('Muốn viết 23, họ vẽ 2 vòng cung và 3 vạch. Muốn viết 300, họ vẽ 3 cuộn dây.', 'To write 23 they drew 2 arches and 3 strokes. To write 300 they drew 3 coils of rope.'),
        L('Cách viết này dễ hiểu nhưng rất dài: số 999 cần tới 27 hình vẽ!', 'This way is easy to understand but very long: 999 needs 27 pictures!'),
      ],
      ask: L('Người Ai Cập vẽ 1 cuộn dây, 2 vòng cung và 4 vạch. Đó là số mấy?', 'An Egyptian draws 1 coil of rope, 2 arches and 4 strokes. Which number is it?'),
      answer: L('100 + 20 + 4 = 124.', '100 + 20 + 4 = 124.'),
    },
    {
      id: 'so-60', icon: '🕰️', art: 'clock60',
      when: L('Khoảng 4 000 năm trước', 'About 4,000 years ago'), where: L('Babylon (nay thuộc I-rắc)', 'Babylon (in today\'s Iraq)'),
      title: L('Vì sao 1 giờ có 60 phút?', 'Why does an hour have 60 minutes?'),
      text: [
        L('Người Babylon viết số bằng que nhọn ấn lên đất sét ướt. Họ không đếm theo chục như chúng ta mà đếm theo 60.', 'The Babylonians wrote numbers by pressing a pointed stick into wet clay. They did not count in tens as we do. They counted in sixties.'),
        L('Số 60 rất tiện: nó chia hết cho 2, 3, 4, 5 và 6, nên chia phần rất dễ.', 'The number 60 is very handy: it divides exactly by 2, 3, 4, 5 and 6, so sharing is easy.'),
        L('Vì thế đến tận bây giờ, 1 giờ vẫn có 60 phút và 1 phút vẫn có 60 giây.', 'That is why, even today, an hour has 60 minutes and a minute has 60 seconds.'),
      ],
      ask: L('Nửa giờ là bao nhiêu phút? Một phần tư giờ là bao nhiêu phút?', 'How many minutes are there in half an hour? In a quarter of an hour?'),
      answer: L('Nửa giờ là 30 phút, một phần tư giờ là 15 phút. Số 60 chia rất đẹp!', 'Half an hour is 30 minutes and a quarter of an hour is 15 minutes. 60 shares out nicely!'),
      lesson: 'g2-c6-b30',
    },
    {
      id: 'la-ma', icon: '🏛️', art: 'roman',
      when: L('Khoảng 2 000 năm trước', 'About 2,000 years ago'), where: L('La Mã (nay thuộc I-ta-li-a)', 'Rome (in today\'s Italy)'),
      title: L('Chữ số La Mã', 'Roman numerals'),
      text: [
        L('Người La Mã dùng chữ cái để viết số: I là 1, V là 5, X là 10, L là 50, C là 100, D là 500, M là 1 000.', 'The Romans used letters to write numbers: I is 1, V is 5, X is 10, L is 50, C is 100, D is 500 and M is 1,000.'),
        L('Chữ nhỏ đứng sau thì cộng thêm: VI là 6. Chữ nhỏ đứng trước thì bớt đi: IV là 4.', 'A smaller letter after a bigger one is added: VI is 6. A smaller letter before a bigger one is taken away: IV is 4.'),
        L('Chữ số La Mã không có số 0 và rất khó đặt tính. Nhưng em vẫn gặp chúng trên mặt đồng hồ và khi viết thế kỉ.', 'Roman numerals have no zero and are hard to calculate with. But you still see them on clock faces and, in Viet Nam, when writing centuries.'),
      ],
      ask: L('Số XIV là số mấy?', 'Which number is XIV?'),
      answer: L('X là 10, IV là 4. XIV là 14.', 'X is 10 and IV is 4. XIV is 14.'),
      lesson: 'g3-c8-b47',
    },
    {
      id: 'so-0', icon: '⭕', art: 'zero',
      when: L('Khoảng 1 400 năm trước', 'About 1,400 years ago'), where: L('Ấn Độ', 'India'),
      title: L('Số 0: không có gì mà rất quan trọng', 'Zero: nothing, yet so important'),
      text: [
        L('Rất lâu, người ta không coi "không có gì" là một con số. Người Babylon và người Maya chỉ dùng một kí hiệu để giữ chỗ trống.', 'For a very long time, people did not think of "nothing" as a number. The Babylonians and the Maya only used a sign to hold an empty place.'),
        L('Ở Ấn Độ, số 0 trở thành một con số thật sự. Năm 628, nhà toán học Brahmagupta viết ra các quy tắc tính với số 0.', 'In India, zero became a real number. In the year 628, the mathematician Brahmagupta wrote down rules for calculating with zero.'),
        L('Nhờ số 0, ta phân biệt được 15, 105 và 150 chỉ bằng vị trí của các chữ số.', 'Thanks to zero, we can tell 15, 105 and 150 apart just by where the digits stand.'),
      ],
      ask: L('Một số cộng với 0 thì được mấy? Một số trừ đi chính nó thì được mấy?', 'What do you get when you add 0 to a number? And when you take a number away from itself?'),
      answer: L('Cộng với 0 thì vẫn là số đó. Trừ đi chính nó thì bằng 0. Brahmagupta đã viết đúng như vậy.', 'Adding 0 leaves the number as it is. Taking a number from itself gives 0. That is just what Brahmagupta wrote.'),
    },
    {
      id: 'chu-so', icon: '🔢', art: 'digits',
      when: L('Khoảng 1 200 năm trước', 'About 1,200 years ago'), where: L('Ấn Độ → Bát-đa → châu Âu', 'India → Baghdad → Europe'),
      title: L('Mười chữ số đi vòng quanh thế giới', 'Ten digits travel round the world'),
      text: [
        L('Mười chữ số 0, 1, 2, …, 9 em dùng hằng ngày ra đời ở Ấn Độ. Chỉ với 10 chữ số, ta viết được mọi số, dù lớn đến đâu.', 'The ten digits 0, 1, 2, …, 9 that you use every day were born in India. With only 10 digits we can write any number, however big.'),
        L('Khoảng năm 820, ở thành Bát-đa, nhà toán học Al-Khwarizmi viết sách dạy cách tính bằng các chữ số này. Từ "algorithm" (nghĩa là thuật toán) trong tiếng Anh bắt nguồn từ tên của ông.', 'Around the year 820, in the city of Baghdad, the mathematician Al-Khwarizmi wrote a book on how to calculate with these digits. The word "algorithm" comes from his name.'),
        L('Năm 1202, Fibonacci giới thiệu rộng rãi cách viết số ấy ở châu Âu qua một cuốn sách nổi tiếng. Dần dần cả thế giới cùng dùng.', 'In 1202, Fibonacci made this way of writing numbers widely known in Europe through a famous book. Little by little the whole world came to use it.'),
      ],
      ask: L('Với ba chữ số 1, 2, 3 (mỗi chữ số dùng một lần), em viết được số lớn nhất là số nào?', 'With the three digits 1, 2 and 3 (each used once), what is the greatest number you can write?'),
      answer: L('321. Chữ số lớn nhất đứng ở hàng trăm.', '321. The greatest digit goes in the hundreds place.'),
    },
    {
      id: 'dau-phep-tinh', icon: '➕', art: 'signs',
      when: L('Khoảng 500 năm trước', 'About 500 years ago'), where: L('Châu Âu', 'Europe'),
      title: L('Dấu + − = có từ bao giờ?', 'When did + − = appear?'),
      text: [
        L('Ngày xưa người ta viết phép tính bằng chữ, rất dài. Dấu + và dấu − xuất hiện trong một cuốn sách in năm 1489 của Johannes Widmann, người Đức.', 'Long ago, calculations were written out in words, which took a long time. The signs + and − appeared in a printed book in 1489, by Johannes Widmann from Germany.'),
        L('Năm 1557, ông Robert Recorde nghĩ ra dấu =. Ông chọn hai vạch song song vì "không có hai thứ gì bằng nhau hơn thế".', 'In 1557, Robert Recorde invented the sign =. He chose two parallel lines because "no two things can be more equal".'),
        L('Dấu × ra đời năm 1631, dấu ÷ năm 1659. Ở Việt Nam, ta viết phép chia bằng dấu hai chấm (:).', 'The sign × came in 1631 and the sign ÷ in 1659. In Viet Nam, division is written with a colon (:).'),
      ],
      ask: L('Trong các dấu + − = ×, dấu nào "trẻ" nhất?', 'Of the signs + − = ×, which one is the "youngest"?'),
      answer: L('Dấu × (năm 1631). Dấu + và − "già" nhất (năm 1489).', 'The sign × (1631). The signs + and − are the "oldest" (1489).'),
    },
    {
      id: 'phan-so', icon: '🍞', art: 'fraction',
      when: L('Khoảng 3 600 năm trước', 'About 3,600 years ago'), where: L('Ai Cập', 'Egypt'),
      title: L('Chia bánh ở Ai Cập cổ', 'Sharing bread in ancient Egypt'),
      text: [
        L('Một cuộn giấy cói rất cổ của Ai Cập, do thầy kí Ahmes chép lại, có nhiều bài toán chia bánh mì cho thợ.', 'A very old Egyptian papyrus, copied out by the scribe Ahmes, has many problems about sharing loaves of bread among workers.'),
        L('Người Ai Cập thích dùng những phân số có tử số là 1, như 1/2, 1/3, 1/4.', 'The Egyptians liked fractions with 1 on top, such as 1/2, 1/3 and 1/4.'),
        L('Muốn nói 3/4 cái bánh, họ nói "một nửa và một phần tư": 3/4 = 1/2 + 1/4.', 'To say 3/4 of a loaf, they said "a half and a quarter": 3/4 = 1/2 + 1/4.'),
      ],
      ask: L('Một nửa cái bánh và một phần tư cái bánh, phần nào lớn hơn?', 'Half a loaf or a quarter of a loaf: which is bigger?'),
      answer: L('Một nửa lớn hơn. Chia càng nhiều phần thì mỗi phần càng nhỏ.', 'A half is bigger. The more parts you share into, the smaller each part is.'),
      lesson: 'g4-c9-b49',
    },
    {
      id: 'so-thap-phan', icon: '💶', art: 'decimal',
      when: L('Năm 1585', 'In 1585'), where: L('Hà Lan', 'The Netherlands'),
      title: L('Dấu phẩy nhỏ, công dụng lớn', 'A small comma that does a big job'),
      text: [
        L('Ông Simon Stevin sinh ở Bruges (nay thuộc Bỉ), làm kĩ sư ở Hà Lan. Thời ấy, tính tiền và đo đạc bằng phân số rất vất vả.', 'Simon Stevin was born in Bruges (in today\'s Belgium) and worked as an engineer in the Netherlands. In those days, working out money and measurements with fractions was hard work.'),
        L('Năm 1585, ông viết một cuốn sách mỏng tên là "Phần mười", dạy mọi người chia đơn vị thành 10, 100, 1 000 phần bằng nhau và tính như số tự nhiên.', 'In 1585 he wrote a little book called "The Tenth". It taught people to split a unit into 10, 100 or 1,000 equal parts and to calculate as with whole numbers.'),
        L('Sau này cách viết gọn lại thành số thập phân có dấu phẩy, như 3,5 mét hay 12,75 ki-lô-gam.', 'Later the writing became simpler: decimal numbers with a comma, such as 3,5 metres or 12,75 kilograms.'),
      ],
      ask: L('Số 0,5 bằng phân số nào quen thuộc?', 'Which well-known fraction is equal to 0,5?'),
      answer: L('0,5 = 5/10 = 1/2, tức là một nửa.', '0,5 = 5/10 = 1/2, that is, a half.'),
      lesson: 'g5-c2-b10',
    },
    {
      id: 'hinh-hoc', icon: '📐', art: 'shapes',
      when: L('Khoảng 2 300 năm trước', 'About 2,300 years ago'), where: L('Hy Lạp và Ai Cập', 'Greece and Egypt'),
      title: L('Hình học: "đo đất"', 'Geometry: "measuring the earth"'),
      text: [
        L('Từ "geometria" (hình học) trong tiếng Hy Lạp có nghĩa là "đo đất". Tương truyền, mỗi năm sông Nin dâng nước làm mất bờ ruộng, người Ai Cập phải đo lại ruộng bằng dây.', 'In Greek, the word "geometry" means "measuring the earth". The story goes that each year the River Nile flooded and washed away the edges of the fields, so the Egyptians measured them again with ropes.'),
        L('Khoảng 2 300 năm trước, ở thành A-lếch-xan-đri-a, ông Euclid gom những hiểu biết về điểm, đường thẳng, tam giác, hình tròn vào bộ sách "Cơ sở".', 'About 2,300 years ago, in the city of Alexandria, Euclid gathered what was known about points, lines, triangles and circles into a set of books called the "Elements".'),
        L('Bộ sách ấy được dùng để dạy hình học suốt hơn 2 000 năm.', 'Those books were used to teach geometry for more than 2,000 years.'),
      ],
      ask: L('Hình vuông có mấy cạnh bằng nhau và mấy góc vuông?', 'How many equal sides and how many right angles does a square have?'),
      answer: L('4 cạnh bằng nhau và 4 góc vuông.', '4 equal sides and 4 right angles.'),
    },
    {
      id: 'so-pi', icon: '🥧', art: 'pi',
      when: L('Khoảng 2 250 năm trước', 'About 2,250 years ago'), where: L('Xi-ra-cu-xơ (Hy Lạp cổ), Trung Quốc', 'Syracuse (ancient Greece), China'),
      title: L('Số π bí ẩn', 'The mysterious number π'),
      text: [
        L('Lấy một cái bánh xe lăn đúng một vòng. Quãng đường lăn được luôn dài gấp hơn 3 lần đường kính bánh xe một chút. Số "hơn 3 một chút" ấy gọi là π (đọc là "pi").', 'Roll a wheel exactly once round. The distance it rolls is always a little more than 3 times as long as the wheel is wide. That "little more than 3" is called π (say "pie").'),
        L('Nhà toán học Hy Lạp Archimedes tính được π nằm giữa 3 10/71 và 3 1/7. Ông Tổ Xung Chi ở Trung Quốc tính ra 3,1415926, chính xác nhất thế giới suốt gần 1 000 năm.', 'The Greek mathematician Archimedes worked out that π lies between 3 10/71 and 3 1/7. Zu Chongzhi in China reached 3,1415926, the most exact value in the world for nearly 1,000 years.'),
        L('Các chữ số của π kéo dài mãi không hết. Ở lớp 5, em dùng π = 3,14.', 'The digits of π go on for ever. In Grade 5 you use π = 3,14.'),
      ],
      ask: L('Bánh xe có đường kính 1 mét lăn một vòng thì đi được khoảng bao nhiêu mét?', 'A wheel 1 metre wide rolls once round. About how many metres does it travel?'),
      answer: L('Khoảng 3,14 mét.', 'About 3,14 metres.'),
      lesson: 'g5-c5-b27',
    },
    {
      id: 'met', icon: '📏', art: 'metre',
      when: L('Khoảng 230 năm trước', 'About 230 years ago'), where: L('Pháp', 'France'),
      title: L('Cái mét ra đời', 'How the metre was born'),
      text: [
        L('Ngày xưa mỗi vùng đo một kiểu: bằng gang tay, bằng bước chân, bằng thước riêng. Mua bán rất dễ nhầm.', 'Long ago each place measured in its own way: in hand spans, in steps, with its own rulers. Buying and selling was easy to get wrong.'),
        L('Cuối thế kỉ 18, nước Pháp quyết định làm một đơn vị chung cho mọi người: mét. Một mét được lấy bằng một phần mười triệu quãng đường từ Bắc Cực đến Xích đạo.', 'At the end of the 18th century, France decided to make one unit for everyone: the metre. One metre was taken as one ten-millionth of the distance from the North Pole to the Equator.'),
        L('Hai nhà khoa học đã đi đo suốt mấy năm trời. Ngày nay hầu hết các nước đều dùng mét, ki-lô-gam và lít.', 'Two scientists spent several years measuring. Today almost every country uses metres, kilograms and litres.'),
      ],
      ask: L('1 mét bằng bao nhiêu xăng-ti-mét?', 'How many centimetres are there in 1 metre?'),
      answer: L('1 m = 100 cm. Các đơn vị đo cứ gấp hoặc kém nhau 10, 100, 1 000 lần nên rất dễ đổi.', '1 m = 100 cm. The units are 10, 100 or 1,000 times bigger or smaller than each other, so they are easy to change.'),
      lesson: 'g2-c11-b55',
    },
    {
      id: 'luong-the-vinh', icon: '🐘', art: 'elephant',
      when: L('Thế kỉ 15', 'The 15th century'), where: L('Việt Nam', 'Viet Nam'),
      title: L('Trạng Lường cân voi', 'Trạng Lường weighs an elephant'),
      text: [
        L('Ông Lương Thế Vinh đỗ Trạng nguyên năm 1463. Ông rất giỏi tính toán, đo lường nên được gọi là Trạng Lường. Tương truyền ông soạn sách "Đại thành toán pháp" để dạy mọi người làm tính.', 'Lương Thế Vinh came first in the royal examination of 1463. He was so good at calculating and measuring that people called him Trạng Lường. He is said to have written the book "Đại thành toán pháp" to teach people how to calculate.'),
        L('Tương truyền, có lần ông được hỏi: làm sao cân một con voi? Ông cho voi xuống thuyền, đánh dấu mực nước, rồi dắt voi lên.', 'The story goes that he was once asked how to weigh an elephant. He led the elephant onto a boat, marked the water level, then led the elephant off.'),
        L('Sau đó ông chất đá xuống thuyền đến đúng vạch dấu. Cân từng viên đá rồi cộng lại là biết voi nặng bao nhiêu!', 'Then he loaded stones onto the boat up to the same mark. Weigh each stone, add them up, and you know how heavy the elephant is!'),
      ],
      ask: L('Vì sao cân đá lại biết được voi nặng bao nhiêu?', 'Why does weighing the stones tell us how heavy the elephant is?'),
      answer: L('Vì thuyền chìm đến cùng một vạch thì đá trên thuyền nặng bằng con voi.', 'Because when the boat sinks to the same mark, the stones weigh the same as the elephant.'),
    },
    {
      id: 'gauss', icon: '💡', art: 'gauss',
      when: L('Khoảng 240 năm trước', 'About 240 years ago'), where: L('Đức', 'Germany'),
      title: L('Cậu bé Gauss cộng thật nhanh', 'Young Gauss adds very fast'),
      text: [
        L('Người ta kể rằng thầy giáo ra cho cả lớp một bài thật dài: cộng tất cả các số từ 1 đến 100.', 'People tell that a teacher gave the class a very long sum: add all the numbers from 1 to 100.'),
        L('Cậu bé Carl Gauss nhìn một lúc rồi viết ngay đáp số. Cậu ghép số đầu với số cuối: 1 + 100 = 101, 2 + 99 = 101, 3 + 98 = 101…', 'Young Carl Gauss looked for a moment, then wrote the answer straight away. He paired the first number with the last: 1 + 100 = 101, 2 + 99 = 101, 3 + 98 = 101…'),
        L('Có 50 cặp như thế, nên tổng là 50 × 101 = 5 050. Lớn lên, Gauss trở thành một trong những nhà toán học giỏi nhất mọi thời.', 'There are 50 such pairs, so the total is 50 × 101 = 5,050. Gauss grew up to be one of the greatest mathematicians of all time.'),
      ],
      ask: L('Em thử ghép cặp như Gauss để tính 1 + 2 + 3 + … + 10.', 'Try pairing like Gauss to work out 1 + 2 + 3 + … + 10.'),
      answer: L('Có 5 cặp, mỗi cặp bằng 11 (1 + 10, 2 + 9, …). Tổng là 5 × 11 = 55.', 'There are 5 pairs, each making 11 (1 + 10, 2 + 9, …). The total is 5 × 11 = 55.'),
    },
    {
      id: 'ban-tinh', icon: '🧮', art: 'abacus',
      when: L('Từ hàng nghìn năm trước', 'For thousands of years'), where: L('Châu Á và nhiều nơi khác', 'Asia and many other places'),
      title: L('Bàn tính: máy tính của người xưa', 'The abacus: the calculator of long ago'),
      text: [
        L('Trước khi có máy tính, người ta tính bằng bàn tính: những hạt gỗ xâu trên các thanh, mỗi thanh là một hàng: đơn vị, chục, trăm…', 'Before there were calculators, people used the abacus: wooden beads on rods, with one rod for each place: ones, tens, hundreds…'),
        L('Gạt hạt về phía thanh ngang là thêm, gạt ra xa là bớt. Khi đủ 10 ở một hàng thì đổi thành 1 ở hàng bên trái, giống hệt khi em đặt tính có nhớ.', 'Push beads towards the bar to add and away from it to take away. When a rod reaches 10, it is swapped for 1 on the rod to the left, just like carrying when you add in columns.'),
        L('Người gạt bàn tính giỏi có thể tính nhanh đến mức từng thắng cả máy tính chạy điện trong một cuộc thi năm 1946.', 'A skilled abacus user can be so fast that one beat an electric calculator in a contest in 1946.'),
      ],
      ask: L('10 hạt ở hàng đơn vị đổi được mấy hạt ở hàng chục?', '10 beads on the ones rod are swapped for how many beads on the tens rod?'),
      answer: L('1 hạt. 10 đơn vị bằng 1 chục.', '1 bead. 10 ones make 1 ten.'),
    },
    {
      id: 'sang-nguyen-to', icon: '🔍', art: 'sieve',
      when: L('Khoảng 2 200 năm trước', 'About 2,200 years ago'), where: L('A-lếch-xan-đri-a (Ai Cập)', 'Alexandria (Egypt)'),
      title: L('Cái sàng của Eratosthenes', 'The sieve of Eratosthenes'),
      text: [
        L('Có những số chỉ chia hết cho 1 và chính nó, như 2, 3, 5, 7, 11. Chúng được gọi là số nguyên tố.', 'Some numbers can be divided exactly only by 1 and by themselves, such as 2, 3, 5, 7 and 11. They are called prime numbers.'),
        L('Ông Eratosthenes nghĩ ra một cách tìm rất vui, như dùng cái sàng: viết các số ra, gạch hết các số chia hết cho 2 (trừ số 2), rồi cho 3, cho 5, cho 7…', 'Eratosthenes thought of a fun way to find them, like using a sieve: write the numbers out, cross out everything that 2 divides (except 2 itself), then do the same for 3, for 5, for 7…'),
        L('Những số còn lại trên sàng chính là số nguyên tố. Ông cũng là người đo được Trái Đất to chừng nào chỉ bằng bóng nắng!', 'The numbers left in the sieve are the primes. He was also the man who measured how big the Earth is, using only shadows!'),
      ],
      ask: L('Trong các số từ 1 đến 10, những số nào là số nguyên tố?', 'Which of the numbers from 1 to 10 are prime numbers?'),
      answer: L('2, 3, 5 và 7. (Số 1 không được tính là số nguyên tố.)', '2, 3, 5 and 7. (The number 1 does not count as a prime.)'),
    },
    {
      id: 'xac-suat', icon: '🎲', art: 'dice',
      when: L('Năm 1654', 'In 1654'), where: L('Pháp', 'France'),
      title: L('Những lá thư về trò xúc xắc', 'Letters about a game of dice'),
      text: [
        L('Một người bạn thích chơi xúc xắc hỏi nhà toán học Blaise Pascal: nếu ván chơi phải dừng giữa chừng thì chia phần thưởng thế nào cho công bằng?', 'A friend who liked dice games asked the mathematician Blaise Pascal: if a game has to stop half-way, how should the prize be shared fairly?'),
        L('Pascal viết thư bàn với ông Pierre de Fermat. Hai ông tính xem mỗi người còn bao nhiêu khả năng thắng.', 'Pascal wrote letters to Pierre de Fermat about it. The two of them worked out how likely each player was to win.'),
        L('Từ những lá thư ấy, môn toán về "khả năng xảy ra" ra đời. Nhờ nó, người ta dự báo được thời tiết ngày mai có thể mưa hay không.', 'Out of those letters came the mathematics of "chance". Thanks to it, people can forecast whether it may rain tomorrow.'),
      ],
      ask: L('Gieo một con xúc xắc, có thể ra mặt 7 chấm không?', 'When you roll a die, can it show 7 dots?'),
      answer: L('Không thể. Xúc xắc chỉ có các mặt từ 1 đến 6 chấm.', 'It is impossible. A die only has faces with 1 to 6 dots.'),
      lesson: 'g2-c13-b66',
    },
    {
      id: 'nhi-phan', icon: '💻', art: 'binary',
      when: L('Năm 1703', 'In 1703'), where: L('Đức', 'Germany'),
      title: L('Chỉ cần 0 và 1', 'Only 0 and 1 are needed'),
      text: [
        L('Nhà toán học Leibniz viết về một cách đếm chỉ dùng hai chữ số 0 và 1. Đếm 1, rồi hết chữ số nên phải "nhớ" sang hàng bên trái: 10, 11, 100…', 'The mathematician Leibniz wrote about a way of counting that uses only two digits, 0 and 1. Count 1, then the digits run out, so you carry to the place on the left: 10, 11, 100…'),
        L('Hồi ấy ít ai thấy nó có ích. Nhưng khoảng 240 năm sau, máy tính ra đời và chỉ hiểu hai trạng thái: tắt (0) và bật (1).', 'At the time few people saw the use of it. But about 240 years later computers arrived, and they understand only two states: off (0) and on (1).'),
        L('Mọi trò chơi, bức ảnh, bài hát trong máy tính bảng của em đều được ghi bằng những dãy số 0 và 1 rất dài.', 'Every game, photo and song on your tablet is stored as very long rows of 0s and 1s.'),
      ],
      ask: L('Có 3 bóng đèn, mỗi bóng chỉ bật hoặc tắt. Em xếp được bao nhiêu kiểu khác nhau?', 'There are 3 lamps, each either on or off. How many different patterns can you make?'),
      answer: L('8 kiểu: 2 × 2 × 2 = 8.', '8 patterns: 2 × 2 × 2 = 8.'),
    },

    /* ---- Stories whose facts come from Florian Cajori, "A History of Mathematics" (1894; the user sent a Vietnamese
     * translation on 2026-11-24). Retold in our own words for children; each passage was read in the book, and what
     * historians now date differently (Thales, Diophantus) follows today's dating. Legends are told as legends. ---- */
    {
      id: 'thales', icon: '🔺', art: 'shadow',
      when: L('Khoảng 2 600 năm trước', 'About 2,600 years ago'), where: L('Ai Cập', 'Egypt'),
      title: L('Đo kim tự tháp bằng cái bóng', 'Measuring a pyramid by its shadow'),
      text: [
        L('Kim tự tháp ở Ai Cập cao vút. Không ai trèo lên đỉnh để thả dây đo được. Ông Thales, một nhà thông thái Hy Lạp, đến thăm Ai Cập và nghĩ ra một cách rất khéo.', 'The pyramids of Egypt are very tall. Nobody could climb to the top and let down a rope to measure them. Thales, a wise man from Greece, visited Egypt and thought of a clever way.'),
        L('Tương truyền, ông cắm một cây gậy thẳng đứng trên mặt đất rồi chờ. Đến lúc bóng của cây gậy dài đúng bằng cây gậy, ông đo ngay bóng của kim tự tháp.', 'The story goes that he stood a stick upright in the ground and waited. At the moment when the stick\'s shadow was exactly as long as the stick, he measured the shadow of the pyramid.'),
        L('Lúc ấy bóng dài bao nhiêu thì kim tự tháp cao bấy nhiêu! Người xưa kể rằng nhà vua Ai Cập đã vô cùng kinh ngạc.', 'At that moment the pyramid was as high as its shadow was long! People of old said the king of Egypt was amazed.'),
      ],
      ask: L('Lúc cây gậy cao 1 m có bóng dài 1 m, một cái cây có bóng dài 6 m. Cái cây cao bao nhiêu mét?', 'When a stick 1 m tall has a shadow 1 m long, a tree has a shadow 6 m long. How tall is the tree?'),
      answer: L('6 m. Lúc đó vật nào cũng có bóng dài bằng chiều cao của nó.', '6 m. At that moment every shadow is as long as the thing is tall.'),
    },
    {
      id: 'so-xep-hinh', icon: '🔵', art: 'figurate',
      when: L('Khoảng 2 500 năm trước', 'About 2,500 years ago'), where: L('Hy Lạp', 'Greece'),
      title: L('Những con số biết xếp hình', 'Numbers that make shapes'),
      text: [
        L('Ông Pythagoras và các học trò rất mê những con số. Họ chia các số thành số chẵn và số lẻ, rồi xếp sỏi thành hình để xem mỗi số "trông" ra sao.', 'Pythagoras and his pupils loved numbers. They sorted numbers into even and odd, and laid out pebbles in shapes to see what each number "looked" like.'),
        L('Xếp sỏi thành hình tam giác, họ được các "số tam giác": 1, 3, 6, 10… Xếp thành hình vuông, họ được các "số vuông": 1, 4, 9, 16…', 'Pebbles laid in triangles gave the "triangular numbers": 1, 3, 6, 10… Laid in squares they gave the "square numbers": 1, 4, 9, 16…'),
        L('Họ còn thấy một điều lạ: cộng các số lẻ liên tiếp, bắt đầu từ 1, thì luôn được một số vuông. 1 + 3 = 4, rồi 1 + 3 + 5 = 9.', 'They also found something strange: add the odd numbers in order, starting from 1, and you always get a square number. 1 + 3 = 4, then 1 + 3 + 5 = 9.'),
      ],
      ask: L('1 + 3 + 5 + 7 bằng bao nhiêu? Số sỏi ấy xếp được hình vuông mỗi cạnh mấy viên?', 'What is 1 + 3 + 5 + 7? That many pebbles make a square with how many on each side?'),
      answer: L('16. Xếp được hình vuông mỗi cạnh 4 viên, vì 4 × 4 = 16.', '16. They make a square with 4 on each side, because 4 × 4 = 16.'),
      lesson: 'g4-c1-b3',
    },
    {
      id: 'duong-rieng', icon: '👑', art: 'king',
      when: L('Khoảng 2 300 năm trước', 'About 2,300 years ago'), where: L('A-lếch-xan-đri-a (Ai Cập)', 'Alexandria (Egypt)'),
      title: L('Không có đường riêng cho nhà vua', 'No special road for the king'),
      text: [
        L('Vua Ptolemy học hình học với ông Euclid và thấy khó quá. Người ta kể rằng vua hỏi: "Có cách nào học dễ hơn không?"', 'King Ptolemy studied geometry with Euclid and found it very hard. People tell that the king asked: "Is there an easier way to learn it?"'),
        L('Euclid đáp: "Thưa bệ hạ, không có con đường riêng nào dành cho vua để đến với hình học." Vua hay dân, ai cũng phải học từng bước một.', 'Euclid answered: "Sire, there is no royal road to geometry." King or not, everyone has to learn it step by step.'),
        L('Người xưa còn truyền lại một câu đố, cho là của Euclid. La và lừa cùng chở các bao hàng. La nói: "Bạn đưa tôi 1 bao thì tôi chở gấp đôi bạn. Tôi đưa bạn 1 bao thì hai ta chở bằng nhau."', 'An old riddle is also said to be Euclid\'s. A mule and a donkey were carrying sacks. The mule said: "Give me 1 sack and I shall carry twice as many as you. If I give you 1 sack, we shall carry the same."'),
      ],
      ask: L('Đáp số là: la chở 7 bao, lừa chở 5 bao. Em thử lại xem có đúng với lời của la không?', 'The answer is: the mule carries 7 sacks and the donkey 5. Can you check it against what the mule said?'),
      answer: L('Lừa đưa la 1 bao: la 8 bao, lừa 4 bao, gấp đôi. La đưa lừa 1 bao: mỗi con 6 bao, bằng nhau. Đúng rồi!', 'The donkey gives 1 sack: mule 8, donkey 4, twice as many. The mule gives 1 sack: 6 each, the same. It is right!'),
    },
    {
      id: 'archimedes', icon: '⚪', art: 'sphere',
      when: L('Khoảng 2 200 năm trước', 'About 2,200 years ago'), where: L('Xi-ra-cu-xơ (Hy Lạp cổ)', 'Syracuse (ancient Greece)'),
      title: L('Archimedes và những hình tròn trên cát', 'Archimedes and his circles in the sand'),
      text: [
        L('Archimedes mê toán đến mức ở đâu ông cũng vẽ hình, vẽ ngay trên cát.', 'Archimedes loved mathematics so much that he drew figures wherever he was, even in the sand.'),
        L('Tương truyền, khi quân La Mã tràn vào thành phố, ông vẫn đang mải nghĩ một bài toán. Thấy một người lính bước tới, ông chỉ kêu lên: "Đừng làm hỏng các hình tròn của ta!"', 'The story goes that when Roman soldiers poured into his city, he was still deep in a problem. Seeing a soldier come near, he only cried: "Do not spoil my circles!"'),
        L('Phát hiện ông tự hào nhất là: quả cầu nằm vừa khít trong một hình trụ thì chiếm đúng 2/3 hình trụ ấy. Hình quả cầu trong hình trụ được khắc lên mộ ông.', 'The discovery he was proudest of: a ball that fits exactly inside a cylinder takes up exactly 2/3 of that cylinder. A ball inside a cylinder was carved on his tomb.'),
      ],
      ask: L('Một hình trụ chứa được 30 lít nước. Quả cầu nằm vừa khít trong hình trụ ấy chứa được bao nhiêu lít?', 'A cylinder holds 30 litres of water. How many litres does the ball that fits exactly inside it hold?'),
      answer: L('20 lít, vì 2/3 của 30 là 20.', '20 litres, because 2/3 of 30 is 20.'),
      lesson: 'g3-c3-b17',
    },
    {
      id: 'dem-cat', icon: '⏳', art: 'sand',
      when: L('Khoảng 2 250 năm trước', 'About 2,250 years ago'), where: L('Xi-ra-cu-xơ (Hy Lạp cổ)', 'Syracuse (ancient Greece)'),
      title: L('Đếm cát cả vũ trụ', 'Counting the sand of the universe'),
      text: [
        L('Thời Archimedes, nhiều người tin rằng cát nhiều vô kể, không số nào đếm nổi. Cách viết số của người Hy Lạp hồi đó cũng không viết được những số thật lớn.', 'In the days of Archimedes, many people believed that grains of sand were beyond counting. The Greek way of writing numbers could not even write very big ones.'),
        L('Archimedes viết hẳn một cuốn sách gửi nhà vua để chứng tỏ điều ngược lại. Ông nghĩ ra cách gọi tên những số cực lớn, rồi tính xem cần bao nhiêu hạt cát để lấp đầy cả vũ trụ mà người thời ấy biết.', 'Archimedes wrote a whole book for the king to show they were wrong. He invented a way to name huge numbers, then worked out how many grains of sand would fill the whole universe as people then knew it.'),
        L('Kết quả: ít hơn một số viết bằng chữ số 1 và 63 chữ số 0 theo sau. Số lớn đến đâu cũng viết ra được!', 'The result: fewer than a number written as 1 followed by 63 zeros. However big a number is, it can be written!'),
      ],
      ask: L('Số 1 000 000 (một triệu) có mấy chữ số 0?', 'How many zeros are there in 1 000 000 (one million)?'),
      answer: L('6 chữ số 0. Số của Archimedes có tới 63 chữ số 0!', '6 zeros. The number of Archimedes has 63 zeros!'),
      lesson: 'g4-c3-b10',
    },
    {
      id: 'tuoi-diophantus', icon: '🧓', art: 'lifebar',
      when: L('Khoảng 1 800 năm trước', 'About 1,800 years ago'), where: L('A-lếch-xan-đri-a (Ai Cập)', 'Alexandria (Egypt)'),
      title: L('Câu đố về tuổi của Diophantus', 'The riddle of Diophantus\'s age'),
      text: [
        L('Diophantus là một nhà toán học nổi tiếng ở A-lếch-xan-đri-a. Không ai biết rõ về đời ông, nhưng người xưa để lại một câu đố về tuổi của ông.', 'Diophantus was a famous mathematician in Alexandria. Nobody knows much about his life, but people of old left a riddle about his age.'),
        L('Câu đố kể: ông sống 1/6 cuộc đời là trẻ nhỏ, 1/12 cuộc đời là thiếu niên, thêm 1/7 cuộc đời nữa thì lấy vợ. 5 năm sau, ông có một người con trai.', 'The riddle says: he was a child for 1/6 of his life and a youth for 1/12 of it, and after 1/7 more he married. 5 years later he had a son.'),
        L('Người con sống được bằng nửa số tuổi của cha. Con mất được 4 năm thì ông qua đời. Giải câu đố này, ta biết ông thọ 84 tuổi.', 'The son lived half as long as his father. 4 years after the son died, Diophantus died too. Solve the riddle and you find that he lived to 84.'),
      ],
      ask: L('Ông thọ 84 tuổi. Vậy 1/6 cuộc đời ông là bao nhiêu năm?', 'He lived to 84. How many years is 1/6 of his life?'),
      answer: L('84 : 6 = 14 năm. Thử lại cả câu đố: 14 + 7 + 12 + 5 + 42 + 4 = 84.', '84 : 6 = 14 years. Check the whole riddle: 14 + 7 + 12 + 5 + 42 + 4 = 84.'),
      lesson: 'g4-c12-b65',
    },
    {
      id: 'chia-gia-tai', icon: '⚖️', art: 'shares',
      when: L('Khoảng 1 900 năm trước', 'About 1,900 years ago'), where: L('La Mã (nay thuộc I-ta-li-a)', 'Rome (in today\'s Italy)'),
      title: L('Chia gia tài cho cặp song sinh', 'Sharing between twins'),
      text: [
        L('Ở La Mã có một bài toán nổi tiếng. Một người cha sắp có con viết lời dặn: nếu sinh con trai thì con trai được 2/3 tài sản, mẹ được 1/3. Nếu sinh con gái thì con gái được 1/3, mẹ được 2/3.', 'Rome had a famous problem. A father whose child was not yet born wrote his will: if it is a boy, the son gets 2/3 of what I own and the mother 1/3. If it is a girl, the daughter gets 1/3 and the mother 2/3.'),
        L('Nhưng rồi người mẹ sinh đôi: một trai, một gái! Chia thế nào cho đúng lời dặn?', 'But then the mother had twins: a boy and a girl! How could the will be followed?'),
        L('Vị luật gia Julianus tìm ra cách. Theo lời dặn, con trai được gấp đôi mẹ, mẹ được gấp đôi con gái. Vậy chia tài sản thành 7 phần bằng nhau: con trai 4 phần, mẹ 2 phần, con gái 1 phần.', 'The lawyer Julianus found a way. By the will, the son gets twice as much as the mother, and the mother twice as much as the daughter. So share everything into 7 equal parts: 4 for the son, 2 for the mother, 1 for the daughter.'),
      ],
      ask: L('Nếu gia tài là 700 đồng vàng thì mỗi người được bao nhiêu đồng?', 'If there are 700 gold coins, how many does each one get?'),
      answer: L('Mỗi phần là 100 đồng: con trai 400, mẹ 200, con gái 100. (Đó là luật ngày xưa. Ngày nay con trai và con gái được chia bằng nhau.)', 'Each part is 100 coins: son 400, mother 200, daughter 100. (That was the law long ago. Today sons and daughters get equal shares.)'),
    },
    {
      id: 'tinh-nguoc', icon: '🔄', art: 'inverse',
      when: L('Khoảng 1 500 năm trước', 'About 1,500 years ago'), where: L('Ấn Độ', 'India'),
      title: L('Tính ngược như người Ấn Độ', 'Working backwards, the Indian way'),
      text: [
        L('Các nhà toán học Ấn Độ xưa viết sách bằng thơ. Vì thế bài toán của họ nghe như câu đố vui: có đàn ong, có hoa sen, có cô bé mắt sáng.', 'The mathematicians of old India wrote their books in verse. So their problems sound like playful riddles, with swarms of bees, lotus flowers and a girl with bright eyes.'),
        L('Họ rất thích cách "tính ngược". Ông Aryabhata dặn: phép nhân đổi thành phép chia, phép chia đổi thành phép nhân; thêm đổi thành bớt, bớt đổi thành thêm.', 'They were fond of "working backwards". Aryabhata gave the rule: multiplying turns into dividing and dividing into multiplying; adding turns into taking away and taking away into adding.'),
        L('Ví dụ: nghĩ một số, nhân với 3 rồi cộng 6 thì được 30. Đi ngược lại từ 30: bớt 6 còn 24, chia cho 3 được 8. Số đã nghĩ là 8.', 'For example: think of a number, multiply it by 3 and add 6 to get 30. Go backwards from 30: take away 6 to get 24, divide by 3 to get 8. The number was 8.'),
      ],
      ask: L('Nghĩ một số, nhân với 2 rồi cộng 4 thì được 20. Số đó là số nào?', 'Think of a number, multiply it by 2 and add 4 to get 20. What is the number?'),
      answer: L('Số 8. Tính ngược: 20 − 4 = 16, rồi 16 : 2 = 8.', 'It is 8. Working backwards: 20 − 4 = 16, then 16 : 2 = 8.'),
      lesson: 'g3-c2-b13',
    },
    {
      id: 'cho-duoi-tho', icon: '🐕', art: 'chase',
      when: L('Hơn 1 000 năm trước', 'More than 1,000 years ago'), where: L('Châu Âu', 'Europe'),
      title: L('Chó đuổi thỏ', 'The dog and the hare'),
      text: [
        L('Hơn 1 000 năm trước, ở châu Âu có một tập toán đố tên là "Những bài toán làm trí óc nhanh nhạy". Nhiều người cho rằng thầy Alcuin, người dạy học trong cung vua Sác-lơ-ma-nhơ, đã soạn ra nó.', 'More than 1,000 years ago, Europe had a book of puzzles called "Problems to sharpen the young". Many think it was written by Alcuin, a teacher at the court of King Charlemagne.'),
        L('Một bài kể: chó đuổi thỏ. Thỏ chạy trước chó 150 bàn chân (người xưa đo độ dài bằng bàn chân). Mỗi lần nhảy, chó nhảy xa 9 bàn chân, còn thỏ chỉ nhảy xa 7 bàn chân.', 'One puzzle: a dog chases a hare. The hare starts 150 feet ahead (people then measured in feet). At each leap the dog goes 9 feet, but the hare only 7 feet.'),
        L('Mỗi lần nhảy, chó gần thỏ thêm 9 − 7 = 2 bàn chân. Vậy sau 150 : 2 = 75 lần nhảy thì chó đuổi kịp thỏ.', 'At each leap the dog gets 9 − 7 = 2 feet closer. So after 150 : 2 = 75 leaps the dog catches the hare.'),
      ],
      ask: L('Nếu thỏ chỉ chạy trước chó 20 bàn chân thì sau mấy lần nhảy chó đuổi kịp thỏ?', 'If the hare starts only 20 feet ahead, after how many leaps does the dog catch it?'),
      answer: L('20 : 2 = 10 lần nhảy.', '20 : 2 = 10 leaps.'),
      lesson: 'g5-c10-b59',
    },
    {
      id: 'bay-ba-cu', icon: '👵', art: 'sevens',
      when: L('Năm 1202', 'In 1202'), where: L('Pi-sa (I-ta-li-a)', 'Pisa (Italy)'),
      title: L('Bảy bà cụ đi Rô-ma', 'Seven old women on the road to Rome'),
      text: [
        L('Fibonacci là con một thương gia ở thành Pi-sa. Từ bé, cậu được cha cho học làm tính. Lớn lên, ông đi buôn nhiều nơi và học toán của nhiều dân tộc. Năm 1202, ông viết một cuốn sách lớn có rất nhiều bài toán.', 'Fibonacci was the son of a merchant from Pisa. As a boy he was sent to learn to calculate. Later he travelled as a trader and learned the mathematics of many peoples. In 1202 he wrote a big book full of problems.'),
        L('Có một bài rất vui: 7 bà cụ đi Rô-ma. Mỗi bà dắt 7 con la, mỗi con la chở 7 cái bao, mỗi bao đựng 7 ổ bánh mì…', 'One of them is great fun: 7 old women are going to Rome. Each has 7 mules, each mule carries 7 sacks, each sack holds 7 loaves…'),
        L('Số lượng cứ gấp lên 7 lần: 7, 49, 343, 2 401… Điều lạ là một cuộn giấy cói Ai Cập, viết trước đó gần 3 000 năm, cũng có bài toán giống hệt, với 7 ngôi nhà, 7 con mèo, 7 con chuột!', 'The numbers grow 7 times each time: 7, 49, 343, 2 401… The strange thing is that an Egyptian papyrus, written nearly 3,000 years earlier, has just the same problem, with 7 houses, 7 cats and 7 mice!'),
      ],
      ask: L('7 bà cụ, mỗi bà dắt 7 con la. Có tất cả bao nhiêu con la? Mỗi con la chở 7 cái bao thì có tất cả bao nhiêu cái bao?', '7 old women with 7 mules each. How many mules are there? Each mule carries 7 sacks: how many sacks are there?'),
      answer: L('7 × 7 = 49 con la. 49 × 7 = 343 cái bao.', '7 × 7 = 49 mules. 49 × 7 = 343 sacks.'),
      lesson: 'g3-c2-b10',
    },
    {
      id: 'may-cong', icon: '⚙️', art: 'pascaline',
      when: L('Năm 1642', 'In 1642'), where: L('Pháp', 'France'),
      title: L('Cỗ máy biết làm tính của Pascal', 'Pascal\'s calculating machine'),
      text: [
        L('Cậu bé Blaise Pascal mê hình học từ nhỏ. Người ta kể rằng mới 12 tuổi, cậu đã lấy than vẽ hình tròn, hình tam giác lên nền nhà để tự tìm hiểu.', 'Young Blaise Pascal loved geometry from an early age. People tell that at 12 he drew circles and triangles on the floor with charcoal to find things out for himself.'),
        L('Cha cậu làm nghề thu thuế, ngày nào cũng phải cộng những cột số thật dài. Năm 19 tuổi, Pascal chế ra một cỗ máy biết làm tính để giúp cha.', 'His father was a tax collector and had long columns of numbers to add every day. At 19, Pascal built a machine that could calculate, to help his father.'),
        L('Máy có các bánh xe ghi số từ 0 đến 9. Khi một bánh xe quay hết một vòng, nó đẩy bánh xe bên trái nhích lên 1, giống hệt khi em cộng có nhớ!', 'The machine had wheels marked 0 to 9. When one wheel went all the way round, it pushed the wheel on its left on by 1, just like carrying when you add!'),
      ],
      ask: L('Bánh xe hàng đơn vị đang chỉ số 9, bánh xe hàng chục chỉ số 0. Cộng thêm 1 thì máy hiện số nào?', 'The ones wheel shows 9 and the tens wheel shows 0. Add 1: which number does the machine show?'),
      answer: L('Số 10. Bánh xe hàng đơn vị quay về 0, bánh xe hàng chục nhích lên 1.', '10. The ones wheel goes back to 0 and the tens wheel moves on to 1.'),
    },
  ];
})();
