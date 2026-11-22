# Toán ISA — shared contract (lead ↔ content agent ↔ visuals agent)

iPad math practice app (PWA, plain HTML/JS, no build step, no network, no libraries) for one child,
Vietnamese curriculum **GDPT 2018, textbook series "Kết nối tri thức với cuộc sống" (KNTT), Toán 2–5**
(the nationally unified series from school year 2026–2027). UI text for the child is Vietnamese;
code comments are English.

## Files and owners

| File | Owner |
|---|---|
| `index.html`, `css/app.css`, `js/core.js`, `js/util.js`, `manifest.webmanifest`, `sw.js`, `icons/*` | lead |
| `js/visuals.js` (+ optional `visuals-gallery.html` for self-test) | visuals agent |
| `js/content/lop2.js`, `lop3.js`, `lop4.js`, `lop5.js` | content agent |

Never edit a file you do not own. Need something from another owner? Write it in your final report.

Load order: `util.js` → `visuals.js` → `content/lop2..5.js` → `core.js`.

## Look (ISA UI)

Teal → cyan gradients (`#12A39E` → `#5CE4D3`), rounded white cards (radius 20–28 px, soft shadow),
orange primary accent `#F47A2A`, soft flat illustrated style, friendly and calm (not neon).
Supporting colours: ink `#1E3A4C`, sun `#FFC93C`, berry `#FF6B8A`, leaf `#5BC85B`, sky `#4DA3FF`,
purple `#9B7BFF`, cream `#FFF8EC`. Font: system (`-apple-system, "SF Pro Rounded", "Nunito", sans-serif`).
Mascot: the original **ISA rover** (orange rounded body with a white "ISA" plate, white dome head,
dark visor band with two round cyan eyes, two treads with hub wheels, antenna with an orange ball).
No third-party characters.

Target: iPad landscape and portrait (1024×768 … 1366×1024 CSS px), touch only. Tap targets ≥ 56 px.

## Globals (from `util.js`)

`U.makeRng(seed)`, `U.rand(rng,a,b)`, `U.pick`, `U.shuffle`, `U.sample`, `U.round(x,n)`,
`U.fmt(n)` (VN format: `12 345`, `3,5`; 4-digit numbers ungrouped), `U.parseNum(str)`,
`U.gcd`, `U.lcm`, `U.simplify(n,d)`, `U.choices(rng, correct, distractors, format?)`,
`U.near(rng, v, spread, count)`, `U.NAMES`.
Signs: `+ − × :` (use the real minus `−` U+2212 and `×`, division is `:`), decimal comma, `<`, `>`, `=`.

## Visuals API (`js/visuals.js` defines `window.V`)

```js
const el = V.render(type, params, ctx);   // returns an HTMLElement (usually a <div class="viz"> holding an <svg>)
// ctx (optional): { interactive: bool, onChange: (value) => void, size: 'sm'|'md'|'lg', theme: 'paper'|'board' }
// theme 'board' (user request): practice questions sit on a green chalkboard → transparent background,
// chalk colours (white, yellow, pink, blue, green, orange), chalk texture, font "Patrick Hand"/"Chalkboard SE".
// interactive visuals expose el.getValue()  (and may also call ctx.onChange)
V.types   // array of supported type names (for the gallery and for checks)
```

Every visual: pure SVG/DOM built in code (emoji allowed as SVG <text> for objects like 🍎🐟🍬),
scales to its container width (viewBox + width:100%), max height ≈ 320 px for `md`,
works in light background (white card), animates in gently (CSS / SMIL / requestAnimationFrame,
respect `prefers-reduced-motion`), labels in Vietnamese with VN number format (`U.fmt`).
Unknown type → returns a small placeholder div, never throws.

### Required types and params

| type | params | interactive value |
|---|---|---|
| `blocks` | `{thousands?, hundreds, tens, ones}` base-10 blocks (khối nghìn/tấm trăm/thanh chục/khối đơn vị) | — |
| `placeValue` | `{number, columns?:['Trăm nghìn',...]}` bảng hàng–lớp with digits | — |
| `numberLine` | `{min, max, step, labelEvery?, marks?:[n], hops?:[{from,to,label?}], point?:n, unknown?:n}` tia số, rover hops | `{interactive}` tap a tick → value (number) |
| `objects` | `{groups:[{emoji, count}], crossOut?:n}` count / add / take away (crossed-out items for subtraction) | — |
| `array` | `{rows, cols, emoji?}` rows × cols for multiplication | — |
| `share` | `{total, groups, emoji?, plateLabel?}` chia đều vào đĩa (animated dealing) | — |
| `columnCalc` | `{a, b, op:'+'|'−'|'×'|':' , reveal?:'none'|'steps'|'all'}` đặt tính rồi tính, carries shown, long division layout for `:` | — |
| `fraction` | `{num, den, shape:'bar'|'pie'|'rect', color?}` | `{interactive}` tap parts to shade → number of shaded parts |
| `fractionCompare` | `{a:[n,d], b:[n,d]}` two bars aligned | — |
| `clock` | `{h, m, digital?:bool}` analog clock | `{interactive}` drag hands → `{h, m}` (minute snaps to 5, hour follows) |
| `calendar` | `{year, month, highlight?:[day]}` tờ lịch tháng (Monday-first row: Thứ Hai … Chủ nhật) | — |
| `money` | `{notes:[1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000]}` simplified, ORIGINAL-design VN-style notes (colour per value, big number + "đồng"), not copies of real banknotes | — |
| `ruler` | `{length, unit:'cm'|'mm'|'dm', object?:'pencil'|'ribbon'|...}` object lying on a ruler | — |
| `scale` | `{left:[{label, kg}], right:[{label, kg}]}` cân đĩa; tilts by weight | — |
| `jug` | `{capacity, amount, unit:'l'|'ml'}` ca/bình with water level | — |
| `thermometer` | `{value, min?, max?}` °C | — |
| `shape` | `{kind:'square'|'rect'|'triangle'|'circle'|'quad'|'parallelogram'|'rhombus'|'trapezoid'|'polyline', dims?:{a,b,h,r,...}, showDims?:bool, showHeight?:bool, label?}` | — |
| `shapeSet` | `{items:[kind...]}` several shapes in a row (for "tìm hình…") | `{interactive}` tap to select → array of indexes |
| `solid` | `{kind:'cube'|'box'|'cylinder'|'sphere', dims?}` khối lập phương, hộp chữ nhật, khối trụ, khối cầu | — |
| `areaGrid` | `{w, h, unit:'cm', showPerimeter?:bool, fill?:bool}` unit squares + perimeter walk | — |
| `angle` | `{deg, protractor?:bool, label?}` góc nhọn/vuông/tù/bẹt | — |
| `lines` | `{kind:'parallel'|'perpendicular'|'intersect'}` | — |
| `cubes` | `{l, w, h}` isometric unit cubes stack (thể tích) | — |
| `barChart` | `{title?, labels:[], values:[], unit?}` biểu đồ cột | — |
| `pictograph` | `{rows:[{label, count}], emoji, each?:n}` biểu đồ tranh | — |
| `pieChart` | `{labels:[], percents:[]}` biểu đồ hình quạt tròn | — |
| `dataTable` | `{headers:[], rows:[[...]]}` bảng số liệu | — |
| `tape` | `{bars:[{label, parts?:n, units?:n, value?:string, color?}], total?:string, diff?:string}` **sơ đồ đoạn thẳng** (tổng–hiệu, tổng–tỉ, hiệu–tỉ, "gấp lên", "một phần mấy"); bars aligned left, unit segments equal length, braces with labels like "?" or "120" | — |
| `average` | `{values:[]}` towers of blocks that level out to the mean (animated) | — |
| `decimalGrid` | `{value}` 10×10 grid, value in hundredths of 1 (e.g. 0,37) | `{interactive}` tap to shade → number of hundredths |
| `percent` | `{percent}` 100-square grid shaded | — |
| `motion` | `{speed, unit:'km/giờ'|'m/giây', time?, distance?, vehicle?:'car'|'bike'|'boat'|'walk'}` road with moving vehicle, distance marks | — |
| `mapScale` | `{scale:1000, mapCm}` a little map strip with "Tỉ lệ 1 : 1000" | — |
| `chance` | `{items:[{color, count}]}` a bag / box of balls | — |
| `roman` | `{value}` roman numeral built from sticks (I V X, lớp 3: 1–20) | — |
| `compare` | `{left, right}` two piles / numbers with crocodile mouth for < > = | — |

Visuals agent may add extra types; list them in `V.types` and in the final report.

## Content format (`js/content/lopN.js`)

```js
window.CURRICULUM = window.CURRICULUM || [];
CURRICULUM.push({
  grade: 2,
  title: 'Lớp 2',
  book: 'Kết nối tri thức với cuộc sống',
  topics: [{
    id: 'g2-c1',              // stable id, never renamed (progress is saved by id)
    title: 'Ôn tập và bổ sung', // chủ đề name as in KNTT
    semester: 1,              // 1 = Học kì 1 (SGK tập 1), 2 = Học kì 2 (SGK tập 2) — required (user request)
    icon: '🔢',               // one emoji
    lessons: [{
      id: 'g2-c1-b1',          // stable id
      title: 'Ôn tập các số đến 100',
      book: 'Bài 1',           // KNTT lesson number, so the parent can match the textbook
      story: 'Rô-bốt ISA đi chợ cùng bạn Mai…',   // 1 short sentence hook, warm, Vietnamese context
      learn: [                 // 2–4 explore cards shown before practice
        { text: 'Số 45 gồm 4 chục và 5 đơn vị.', visual: { type: 'blocks', params: { tens: 4, ones: 5 } } },
      ],
      gen(rng, i) { /* i = question index 0..9; difficulty grows with i */ return question; },
    }],
  }],
});
```

Question object returned by `gen`:

```js
{
  prompt: 'Có bao nhiêu quả táo?',          // short, child-friendly; \n allowed
  speak?: 'text for read-aloud',             // default = prompt
  visual?: { type, params },                 // shown with the question (strongly preferred: make it visual)
  answer:
      { kind: 'choice', options: ['12', '13', '14', '15'], correct: 1 }   // use U.choices
    | { kind: 'number', value: 345, unit?: 'cm' }        // on-screen keypad; decimals typed with ","
    | { kind: 'fraction', num: 3, den: 4, simplest?: bool } // keypad in fraction mode; equal value accepted unless simplest
    | { kind: 'text', options: ['<', '>', '='], correct: 0 } // same as choice but big symbol buttons
    | { kind: 'visual', check: (value) => boolean }       // the question's visual is interactive (ctx.interactive=true)
  hint: 'Gợi ý ngắn',                         // shown after 1st wrong try
  hintVisual?: { type, params },
  explain: 'Lời giải ngắn: 45 + 23 = 68.',    // shown after the answer
}
```

Rules for generators: deterministic for a given rng; never produce invalid maths (no remainder unless the
lesson is about remainders, no negative results, results inside the grade's number range); vary the
question form inside a lesson (not 10 copies of the same sentence); word problems use Vietnamese
everyday contexts (chợ, vườn, lớp học, Tết, bánh chưng, đi xe buýt…) and `U.NAMES`.

## Exams — "Ôn tập & Kiểm tra" (user request: bộ đề theo format đề của Bộ GD&ĐT)

Periodic tests per Thông tư 27/2020/TT-BGDĐT: lớp 1–3 → `cuoi-hk1`, `cuoi-nam`; lớp 4–5 → `giua-hk1`, `cuoi-hk1`,
`giua-hk2`, `cuoi-nam`. Each exam is a BLUEPRINT (đề cấu trúc / ma trận); the app turns it into many papers
("Đề số 1, 2, 3 …", one seed each) by calling the lesson generators. Files: `js/content/dethi.js` (grades 2–5) and
`js/content/dethi-lop1.js` (grade 1), each pushing to `window.EXAMS`. Load order: after the lesson files.

```js
window.EXAMS = window.EXAMS || [];
EXAMS.push({
  grade: 3,
  term: 'cuoi-hk1',                    // giua-hk1 | cuoi-hk1 | giua-hk2 | cuoi-nam
  title: 'Đề kiểm tra cuối học kì I',   // printed as the paper's heading
  minutes: 40,                          // countdown
  papers: 6,                            // how many "Đề số" to offer
  parts: [{
    title: 'PHẦN I. TRẮC NGHIỆM',
    note: 'Khoanh vào chữ đặt trước câu trả lời đúng.',
    items: [
      // lesson: a lesson id; level 1|2|3 (Mức 1 nhận biết, 2 kết nối, 3 vận dụng); points; form:
      //  'choice' → the app shows the question as A. B. C. D. (number answers are turned into 4 options)
      //  'input'  → the child types the result (keypad); 'as-is' → keep the generator's own answer kind
      { lesson: 'g3-c2-b14', level: 1, points: 0.5, form: 'choice' },
      { pick: ['g3-c1-b2', 'g3-c1-b3'], level: 2, points: 1, form: 'choice' }, // pick: one of these lessons at random
    ],
  }, {
    title: 'PHẦN II. TỰ LUẬN',
    items: [ { lesson: 'g3-c4-b20', level: 2, points: 2, form: 'input', label: 'Đặt tính rồi tính' } ],
  }],
});
```
Rules: points of all items sum to 10; level maps to the generator index i (1 → 0–3, 2 → 4–6, 3 → 7–9);
every lesson id must exist in that grade's file; only lessons taught before that test (giữa kì = first half of the
semester, cuối kì = the whole semester, cuối năm = whole year with weight on HK2); proportions of Mức 1/2/3 and of
trắc nghiệm/tự luận follow the usual Thông tư 27 practice (state in the report what you used); optional `label`
is printed as the câu's instruction (e.g. "Đặt tính rồi tính", "Giải bài toán"). Score shown on the 10-point scale,
rounded as Thông tư 27 says (0,5 rounds up).
