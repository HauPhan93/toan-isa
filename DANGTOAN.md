# Toán ISA — "Học dạng toán" (contract for the content agents)

A new home card (user, 2026-11-23): "thiếu 1 thẻ để dạy các thể loại bài toán theo lớp, nếu các bé chưa hiểu để các
bé có thể tương tác học". For each grade it lists the **kinds of problem** (dạng toán) of the SGK Kết nối tri thức.
A child who does not understand a kind opens it and:

1. **Hiểu dạng toán** — reads how to recognise it (`spot`), the method in 2–4 short steps (`steps`) and a common
   mistake (`tip`);
2. **Cùng làm từng bước** — completes a worked example one step at a time (`guide`): each step asks one small
   thing, the child answers (a number or a choice), and the step's explanation (`say`) appears when it is right;
3. **Tự luyện** — does 10 practice questions that get harder (`practice`), in the app's usual practice player
   (chalkboard, handwriting, hints, stars).

Framework and entry format: `js/content/dangtoan.js` (read it first). Grade files: `js/content/dangtoan-lopN.js`.

## What to write

For your grade, the kinds of problem a child must master, in the order of the book, each tied to its KNTT lesson
(`lesson`, ids from `js/content/lopN.js`) and semester (`sem` 1 or 2). Cover the word-problem kinds first (they are
what children get stuck on), then the important calculation kinds. Typically 8–12 kinds per grade, e.g.

- lớp 1: thêm – bớt (viết phép tính thích hợp), tìm số còn thiếu, so sánh số, đếm thêm, xem giờ đúng, đo độ dài…
- lớp 2: nhiều hơn – ít hơn, tìm số hạng / số bị trừ / số trừ, bài toán nhân – chia (bảng 2, 5), đường gấp khúc,
  ngày – giờ, tiền, khối lượng – dung tích…
- lớp 3: gấp lên / giảm đi một số lần, so sánh số lớn gấp mấy lần số bé, bài toán hai bước, tính giá trị biểu thức,
  chia có dư, chu vi – diện tích hình chữ nhật / hình vuông, tiền, thời gian…
- lớp 4: tìm hai số khi biết tổng và hiệu, trung bình cộng, rút về đơn vị, tính thuận tiện, bài toán ba bước,
  đổi đơn vị đo, phân số của một số, cộng – trừ – nhân – chia phân số, chu vi – diện tích…
- lớp 5: tổng – tỉ, hiệu – tỉ, tỉ số phần trăm (tìm tỉ số %, tìm giá trị % của một số), tỉ lệ bản đồ, diện tích
  tam giác / hình thang / hình tròn, thể tích, số đo thời gian, vận tốc – quãng đường – thời gian…

Stay inside the grade (CT GDPT 2018 + KNTT): lớp 2 word problems have one step, lớp 3 up to two, lớp 4 up to
three, lớp 5 up to four. Nothing from a later grade (see NANGCAO.md "Avoid").

## Rules

1. Only edit your own `js/content/dangtoan-lopN.js`. Use the helpers on `DT` (`DT.L`, `DT.F`, `DT.R`, `DT.P`,
   `DT.M`, `DT.name(s)`, `DT.num`, `DT.ch`, `DT.fr`, `DT.vz`, `DT.Q`, `DT.step`, `DT.bank`).
2. Every string is bilingual: `DT.L(vietnamese, english)`. Vietnamese as in the SGK, warm and plain, short
   sentences a child can read alone; English simple British English (I18N.md). Vietnamese names stay, "đồng" →
   "dong". SGK notation in both languages (`DT.F(12345)` → 12 345, `DT.F(3.5)` → 3,5; signs + − × :).
3. `title` is the name teachers use ("Bài toán về nhiều hơn", "Tìm hai số khi biết tổng và hiệu"). `icon` one emoji.
4. `spot`: how the child recognises the kind — the words or the shape of the problem ("Bài toán cho biết tổng của
   hai số và cho biết số này hơn số kia bao nhiêu."). `steps`: the method as the SGK teaches it, numbered by you
   ("Bước 1: …"), each one short. `tip`: one typical mistake and how to avoid it.
5. `guide(rng)`: a fresh worked example each time. `prompt` is a complete problem; `steps` (2–5) lead the child
   through it in the order of the method. A step's `ask` is one small question with **one** answer:
   - a number → `DT.num(value, unit?)` (whole numbers; decimals only in lớp 5, at most 3 places; no fractions here);
   - or a choice → `DT.ch(rng, correct, [wrong, …])` with 2–4 short options (e.g. which operation: "45 + 12" /
     "45 − 12"; which is the greater number). Use a choice for "what do we do?" steps and a number for "work it out".
   `say` is the line of the lời giải for that step ("Số lớn là: (57 + 33) : 2 = 45 (tuổi)"), shown when the step is
   right. `hint` (optional) is shown after a wrong answer. `done` is the final "Đáp số: …". Compute every number
   first; never call `rng` inside `DT.L(...)`. A `visual` (tape diagram etc.) is welcome when the lessons use one
   for this kind — copy the params from the lesson (`DT.vz('tape', {...})`).
6. `practice(rng, i)`: i = 0…9. i 0–3 the plain form, i 4–6 a variation (other context, the question turned
   round), i 7–9 the hardest still inside the grade — you may return a problem of the advanced bank there:
   `DT.bank(rng, ['g4-tuoi', 'g4-tong-hieu']) || <your own>` (ids in `js/content/nangcao-lopN.js`). Each q is
   `DT.Q(prompt, answer, explain, { hint, visual })` with a number / choice / fraction answer and a step-by-step
   `explain`. Every answer must be right for every seed, and each i must give many different problems.
7. Comments in English. Do not commit.

## Check your work

Preview server: `http://localhost:8130`. With the built-in browser tools open **your own tab** (`tabs_create`, pass
its tabId to every call, never touch other tabs, never `resize_window`, close it at the end):

- `http://localhost:8130/test-dangtoan.html?grade=N` and `…&lang=en` — **0 errors**.
- `…?grade=N&samples=1` (and `&lang=en`) prints, for every kind, the texts, two guided examples and practice
  questions at i = 0, 5, 9: read them all. Is the method the SGK's? Does each step follow from the one before? Is
  everything correct, natural in both languages and inside the grade?
