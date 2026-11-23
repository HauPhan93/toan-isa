# Toán ISA — ngân hàng bài nâng cao (contract for the content agents)

The **Đề nâng cao** (challenge test, 20 câu / 30 phút) used to be the standard test one mức higher, so its problems
were still one-step sums (user: "các bài toán ở bộ đề nâng cao chưa nâng cao"). It now takes its hardest questions
from a bank of advanced problems, one file per grade: `js/content/nangcao-lop1.js` … `nangcao-lop5.js`.
The framework is `js/content/nangcao.js` (read it first: entry format and helpers). The paper wiring is in core.js
(`shapeBlueprint`, `buildPaper`): a nâng cao paper takes 4 trắc nghiệm, the 4 "Đặt tính rồi tính" and 4–6 tự luận
from the bank, choosing the entries the child has met least.

## What "nâng cao" means here (researched 2026-11-23, the user asked to follow the education authorities)

- **Thông tư 27/2020, Mức 3:** "Vận dụng các nội dung đã học để giải quyết một số vấn đề mới hoặc đưa ra những phản
  hồi hợp lý trong học tập và cuộc sống." Harder by how the problem is put, **never by content of a later grade**.
- **Công văn 3898/BGDĐT-GDTH:** "không kiểm tra, đánh giá vượt quá yêu cầu cần đạt". No trick / contest puzzles.
- **Steps of a word problem (CT GDPT 2018 yêu cầu cần đạt):** lớp 1 one calculation; **lớp 2 one step (the user's
  decision — make it harder through conditions and wording, not a second step)**; lớp 3 up to 2 steps; lớp 4 up to
  3 steps; lớp 5 up to 4 steps.
- **What makes real school mức 3 questions harder** (about 25 KNTT school papers read): conditions ("số lớn nhất có ba
  chữ số khác nhau…"), working backwards ("…… : 6 = 3 051 (dư 3)", "còn lại 2800 con… đã bán bao nhiêu"), units to
  convert inside the problem, convenient calculation (pairs making round numbers, a common factor in lớp 5), real-life
  contexts (shopping and change, offers, yield per m², savings interest), two topics together (area + fraction + yield),
  data in a short table.
- **Avoid (beyond the grade or contest-style):** lớp 2 two-step problems and multiplication before học kì II / beyond
  tables 2 and 5; lớp 3 tổng–hiệu, trung bình cộng, rút về đơn vị (KNTT lớp 4 Bài 25, 46, 47) and the distributive
  property (lớp 4); lớp 4 tổng–tỉ / hiệu–tỉ (lớp 5 Bài 38–39), "giả thiết tạm", divisibility rules; lớp 5 two moving
  objects (gặp nhau, đuổi nhau, xuôi/ngược dòng), tỉ lệ nghịch; sums of long sequences by formula in any grade.

## Which test a problem belongs to (`from`)

A paper covers (core.js `scopeLessons`): `giua-hk1` = the first half of học kì I's lessons (rounded up), `cuoi-hk1` =
all of học kì I, `giua-hk2` = the first half of học kì II, `cuoi-nam` = the whole year. Lớp 1–3 have only `cuoi-hk1`
and `cuoi-nam`; lớp 4–5 have all four. Set `from` to the **first** test whose scope contains every lesson the problem
needs (look at `semester` and the lesson order in `js/content/lopN.js`). Numbers too: lớp 1 up to 100, lớp 2 up to
1000 (học kì I only to 100), lớp 3 up to 100 000 (học kì I mostly within 1000), lớp 4 lớp triệu.

## Rules for the bank files

1. Only edit your own `js/content/nangcao-lopN.js`. Use the helpers on `NC` (`NC.Q`, `NC.num`, `NC.ch`, `NC.fr`,
   `NC.dt`, `NC.L`, `NC.F`, `NC.R`, `NC.P`, `NC.name`, `NC.names`, `NC.M` for the minus sign "−").
2. Every string the child sees is bilingual: `NC.L(vietnamese, english)`. Vietnamese as in the SGK (KNTT), warm and
   plain, addressing the child as "bé"/"em" only where the lessons do; English simple British English (I18N.md).
   Vietnamese names stay (An, Mai…), money "đồng" → "dong". Maths notation as in the SGK in both languages:
   `NC.F(12345)` → 12 345, `NC.F(3.5)` → 3,5, signs + − × :.
3. Compute every number first, then write both strings from the same numbers. Never call `rng` inside `NC.L(...)`.
4. The answer must be exactly right for every seed. Prefer a **number answer** (`NC.num(v, unit)`): a trắc nghiệm slot
   turns it into A B C D by itself. Give your own `NC.ch(rng, correct, [distractors])` only where plausible wrong
   answers matter (e.g. the result of a common mistake). Whole numbers, or decimals with at most 3 places (lớp 5).
5. `explain` is the full lời giải, step by step ("Số tròn chục nhỏ nhất có hai chữ số là 10. 43 − 10 = 33."), so a
   parent can teach from it. A short `hint` is welcome.
6. `kinds`: `'dt'` entries are only "Đặt tính rồi tính" made with `NC.dt(a, b, op, result)` — exact results only
   (no remainder; in lớp 5 a decimal quotient is fine), harder than the lessons' own (borrowing across 0, a 0 in the
   quotient, more carries, more digits) but within the grade's limits. Other entries are `['tn', 'tl']` (both) unless
   the question only works with options (then `['tn']`) or only as a written answer (then `['tl']`).
7. Variety: each entry must give many different problems (the test page warns under 15 different prompts in 300
   runs). Vary names, contexts, numbers and the form of the question inside an entry where it is natural.
8. `lesson`: the KNTT lesson id (from `lopN.js`) to suggest for review when the answer is wrong.
9. No pictures are required. If you add one, use a visual type that exists (`V.types`) with the same params the
   lessons use for it.

## Check your work

The preview server runs at `http://localhost:8130`. With the built-in browser tools open **your own tab**
(`tabs_create`, pass its tabId to every call, never touch other tabs, never `resize_window`, close it at the end):

- `http://localhost:8130/test-nangcao.html?grade=N` and `…?grade=N&lang=en` — **0 errors** in both.
- `…?grade=N&samples=1` (and `&lang=en`) — read three samples of every entry: is the problem correct, within the
  grade, genuinely harder than the standard lessons, worded naturally in both languages, and the lời giải right?
- `…?show=ID` — twelve samples of one entry.
