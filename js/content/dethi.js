/* Toán ISA — "Ôn tập & Kiểm tra": blueprints of periodic tests (đề kiểm tra định kì) for lớp 2–5.
 * Thông tư 27/2020/TT-BGDĐT: lớp 1–3 → cuối HK1, cuối năm; lớp 4–5 → giữa HK1, cuối HK1, giữa HK2, cuối năm.
 * Three levels (Mức 1 nhận biết – Mức 2 kết nối – Mức 3 vận dụng). Ma trận used here (common practice in
 * KNTT-based đề of schools / Phòng GD):
 *   lớp 2–3: 14 câu — Trắc nghiệm 8 câu × 0,5 = 4 điểm; Tự luận 6 điểm. Mức 1/2/3 = 4 / 4 / 2 điểm (40/40/20 %).
 *   lớp 4–5: 14 câu — Trắc nghiệm 8 câu × 0,5 = 4 điểm; Tự luận 6 điểm. Mức 1/2/3 = 3 / 5 / 2 điểm (30/50/20 %).
 *   Time: lớp 2 → 35 phút; lớp 3–5 → 40 phút.
 * Lessons whose generator has an `exam(rng, level)` (column-calculation lessons) give "Đặt tính rồi tính" at Mức 1
 * and a word problem ("bài toán có lời văn") at Mức 2–3.
 */
(function () {
  'use strict';
  window.EXAMS = window.EXAMS || [];

  const TITLES = {
    'giua-hk1': 'Đề kiểm tra giữa học kì I',
    'cuoi-hk1': 'Đề kiểm tra cuối học kì I',
    'giua-hk2': 'Đề kiểm tra giữa học kì II',
    'cuoi-nam': 'Đề kiểm tra cuối năm học',
  };
  const ref = r => (Array.isArray(r) ? { pick: r } : { lesson: r });

  /* tn: 8 entries [lessonOrPickList, level, form?]  (form default 'choice', 0,5 điểm each)
   * tl: entries {r, level, points, form?, label?}  (form default 'as-is') */
  function blueprint(grade, term, tn, tl) {
    const parts = [
      {
        title: 'PHẦN I. TRẮC NGHIỆM (4 điểm)',
        note: 'Khoanh vào chữ đặt trước câu trả lời đúng (hoặc làm theo yêu cầu của câu hỏi).',
        items: tn.map(([r, level, form]) => Object.assign(ref(r), { level, points: 0.5, form: form || 'choice' })),
      },
      {
        title: 'PHẦN II. TỰ LUẬN (6 điểm)',
        items: tl.map(x => Object.assign(ref(x.r), { level: x.level, points: x.points, form: x.form || 'as-is' }, x.label ? { label: x.label } : {})),
      },
    ];
    const sum = parts.reduce((s, p) => s + p.items.reduce((t, it) => t + it.points, 0), 0);
    if (Math.abs(sum - 10) > 1e-9 && window.console) console.warn('dethi: points ≠ 10', grade, term, sum);
    window.EXAMS.push({ grade, term, title: TITLES[term], minutes: grade === 2 ? 35 : 40, papers: 6, parts });
  }
  const DT = 'Đặt tính rồi tính';
  const BT = 'Giải bài toán';

  // Tự luận frames
  // lớp 2–3: đặt tính 2 × 0,75 (M1) · 1 câu M2 (1 đ) · bài toán M2 (1,5 đ) · 2 câu M3 (1 đ)
  const tl23 = (dt1, dt2, m2, bt, m3a, m3b, lab) => [
    { r: dt1, level: 1, points: 0.75, form: 'input', label: DT },
    { r: dt2, level: 1, points: 0.75, form: 'input', label: DT },
    Object.assign({ r: m2, level: 2, points: 1 }, lab && lab.m2 ? { label: lab.m2 } : {}),
    { r: bt, level: 2, points: 1.5, label: BT },
    Object.assign({ r: m3a, level: 3, points: 1 }, lab && lab.m3a ? { label: lab.m3a } : {}),
    Object.assign({ r: m3b, level: 3, points: 1 }, lab && lab.m3b ? { label: lab.m3b } : {}),
  ];
  // lớp 4–5: đặt tính 2 × 0,5 (M1) · 2 câu M2 (1 đ) · bài toán M2 (1,5 đ) · 1 câu M3 (1,5 đ)
  const tl45 = (dt1, dt2, m2a, m2b, bt, m3, lab) => [
    { r: dt1, level: 1, points: 0.5, form: 'input', label: lab && lab.dt ? lab.dt : DT },
    { r: dt2, level: 1, points: 0.5, form: 'input', label: lab && lab.dt ? lab.dt : DT },
    Object.assign({ r: m2a, level: 2, points: 1 }, lab && lab.m2a ? { label: lab.m2a } : {}),
    Object.assign({ r: m2b, level: 2, points: 1 }, lab && lab.m2b ? { label: lab.m2b } : {}),
    { r: bt, level: 2, points: 1.5, label: BT },
    Object.assign({ r: m3, level: 3, points: 1.5 }, lab && lab.m3 ? { label: lab.m3 } : {}),
  ];

  // ======================= LỚP 2 =======================
  blueprint(2, 'cuoi-hk1', [
    ['g2-c1-b1', 1], ['g2-c1-b3', 1], [['g2-c2-b8', 'g2-c2-b12'], 1], ['g2-c3-b15', 1], ['g2-c6-b30', 1],
    ['g2-c1-b4', 2], [['g2-c4-b19', 'g2-c4-b22'], 2], ['g2-c5-b25', 2],
  ], tl23('g2-c4-b20', 'g2-c4-b23', ['g2-c2-b7', 'g2-c2-b11'], ['g2-c2-b13', 'g2-c2-b9'], 'g2-c6-b29', ['g2-c5-b26', 'g2-c3-b16'], { m2: 'Tính' }));

  blueprint(2, 'cuoi-nam', [
    ['g2-c10-b51', 1], [['g2-c10-b53', 'g2-c10-b50'], 1], [['g2-c8-b39', 'g2-c8-b40'], 1], [['g2-c8-b43', 'g2-c8-b44'], 1], ['g2-c11-b55', 1],
    ['g2-c10-b52', 2], ['g2-c11-b56', 2], [['g2-c13-b65', 'g2-c13-b66'], 2],
  ], tl23('g2-c12-b60', 'g2-c12-b62', ['g2-c8-b37', 'g2-c8-b41'], ['g2-c12-b59', 'g2-c12-b61', 'g2-c4-b20'], 'g2-c12-b62', ['g2-c8-b42', 'g2-c11-b55']));

  // ======================= LỚP 3 =======================
  blueprint(3, 'cuoi-hk1', [
    ['g3-c1-b1', 1], [['g3-c2-b9', 'g3-c2-b10', 'g3-c2-b11', 'g3-c2-b12'], 1], ['g3-c3-b17', 1], [['g3-c5-b30', 'g3-c5-b31', 'g3-c5-b32'], 1], ['g3-c5-b33', 1],
    ['g3-c4-b25', 2], [['g3-c4-b24', 'g3-c4-b27'], 2], ['g3-c6-b39', 2],
  ], tl23('g3-c6-b36', 'g3-c6-b37', 'g3-c6-b38', 'g3-c4-b28', ['g3-c2-b13', 'g3-c1-b3'], ['g3-c3-b21', 'g3-c2-b14'], { m2: 'Tính giá trị của biểu thức' }));

  blueprint(3, 'cuoi-nam', [
    [['g3-c8-b45', 'g3-c11-b59'], 1], [['g3-c8-b46', 'g3-c11-b60'], 1], ['g3-c8-b47', 1], [['g3-c8-b48', 'g3-c11-b61'], 1], ['g3-c13-b68', 1],
    ['g3-c9-b50', 2], ['g3-c9-b52', 2], [['g3-c15-b73', 'g3-c15-b74'], 2],
  ], tl23(['g3-c12-b63', 'g3-c10-b54'], ['g3-c14-b71', 'g3-c14-b70'], 'g3-c13-b66', ['g3-c12-b64', 'g3-c14-b70', 'g3-c10-b57'], 'g3-c6-b38', 'g3-c13-b68'));

  // ======================= LỚP 4 =======================
  blueprint(4, 'giua-hk1', [
    ['g4-c1-b1', 1], ['g4-c1-b3', 1], [['g4-c3-b10', 'g4-c3-b11'], 1], ['g4-c2-b8', 1],
    ['g4-c3-b12', 2], ['g4-c3-b14', 2], [['g4-c3-b13', 'g4-c3-b15'], 2],
    ['g4-c2-b7', 3],
  ], tl45('g4-c1-b2', 'g4-c1-b2', 'g4-c1-b4', 'g4-c3-b11', 'g4-c1-b5', 'g4-c1-b5', { m2a: 'Tính giá trị của biểu thức' }));

  blueprint(4, 'cuoi-hk1', [
    [['g4-c3-b12', 'g4-c3-b10'], 1], ['g4-c4-b17', 1], ['g4-c4-b19', 1], ['g4-c6-b27', 1],
    ['g4-c4-b18', 2], ['g4-c1-b3', 2], ['g4-c3-b14', 2],
    ['g4-c2-b8', 3],
  ], tl45('g4-c5-b22', 'g4-c5-b23', 'g4-c5-b24', 'g4-c6-b31', 'g4-c5-b25', ['g4-c5-b25', 'g4-c1-b5'], { m2a: 'Tính bằng cách thuận tiện' }));

  blueprint(4, 'giua-hk2', [
    ['g4-c8-b41', 1], ['g4-c8-b40', 1], ['g4-c9-b49', 1], ['g4-c9-b50', 1],
    ['g4-c8-b42', 2], ['g4-c8-b46', 2], ['g4-c9-b51', 2],
    ['g4-c8-b47', 3],
  ], tl45('g4-c8-b43', 'g4-c8-b44', ['g4-c8-b38', 'g4-c8-b39'], 'g4-c8-b42', 'g4-c8-b47', 'g4-c8-b46', { m2b: 'Tính bằng cách thuận tiện', m3: BT }));

  blueprint(4, 'cuoi-nam', [
    ['g4-c10-b55', 1], ['g4-c10-b58', 1], ['g4-c10-b56', 1, 'as-is'], ['g4-c8-b41', 1],
    ['g4-c10-b57', 2], ['g4-c12-b65', 2], ['g4-c9-b50', 2],
    ['g4-c10-b54', 3, 'as-is'],
  ], tl45(['g4-c8-b43', 'g4-c8-b38'], ['g4-c8-b44', 'g4-c8-b39'], 'g4-c11-b60', ['g4-c11-b61', 'g4-c12-b63', 'g4-c12-b64'], ['g4-c12-b65', 'g4-c8-b47'], ['g4-c5-b25', 'g4-c8-b46'], { m2a: 'Tính', m2b: 'Tính', m3: BT }));

  // ======================= LỚP 5 =======================
  blueprint(5, 'giua-hk1', [
    ['g5-c1-b1', 1], ['g5-c1-b4', 1, 'as-is'], ['g5-c2-b10', 1, 'as-is'], ['g5-c2-b11', 1],
    ['g5-c2-b12', 2], ['g5-c2-b13', 2], ['g5-c1-b7', 2, 'as-is'],
    ['g5-c1-b3', 3, 'as-is'],
  ], tl45('g5-c1-b2', 'g5-c1-b2', 'g5-c1-b6', 'g5-c1-b5', 'g5-c1-b2', 'g5-c1-b6', { m2a: 'Tính', m2b: 'Tính' }));

  blueprint(5, 'cuoi-hk1', [
    ['g5-c2-b11', 1], ['g5-c3-b15', 1], ['g5-c3-b16', 1], ['g5-c4-b23', 1],
    ['g5-c2-b12', 2], ['g5-c5-b25', 2], ['g5-c5-b27', 2],
    ['g5-c5-b26', 3],
  ], tl45(['g5-c4-b19', 'g5-c4-b20'], ['g5-c4-b21', 'g5-c4-b22'], 'g5-c4-b23', 'g5-c5-b26', ['g5-c4-b21', 'g5-c4-b22'], 'g5-c5-b27', { m2a: 'Tính nhẩm', m3: BT }));

  blueprint(5, 'giua-hk2', [
    ['g5-c7-b36', 1, 'as-is'], ['g5-c8-b46', 1], ['g5-c8-b47', 1], ['g5-c8-b45', 1],
    ['g5-c7-b37', 2], ['g5-c7-b40', 2], ['g5-c7-b41', 2],
    ['g5-c7-b39', 3],
  ], tl45('g5-c7-b40', 'g5-c7-b41', 'g5-c7-b37', 'g5-c8-b46', 'g5-c7-b38', 'g5-c7-b39', { dt: 'Tính', m3: BT }));

  blueprint(5, 'cuoi-nam', [
    ['g5-c9-b49', 1], ['g5-c10-b56', 1], ['g5-c11-b64', 1], ['g5-c7-b36', 1, 'as-is'],
    ['g5-c9-b52', 2], ['g5-c10-b57', 2], ['g5-c11-b65', 2, 'as-is'],
    ['g5-c9-b53', 3],
  ], tl45(['g5-c4-b19', 'g5-c4-b20'], ['g5-c4-b21', 'g5-c4-b22'], 'g5-c10-b58', ['g5-c9-b50', 'g5-c9-b51'], ['g5-c10-b59', 'g5-c10-b60'], ['g5-c10-b60', 'g5-c7-b38', 'g5-c7-b41'], { m3: BT }));
})();
