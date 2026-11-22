/* Toán ISA — Ôn tập & Kiểm tra, Lớp 1 (Thông tư 27/2020/TT-BGDĐT: lớp 1 có 2 bài kiểm tra định kì,
 * cuối học kì I và cuối năm học). Blueprints (ma trận) built from the lessons in lop1.js.
 * Ma trận used (usual practice of khối 1 for Toán): ~10 câu, 35 phút, 3 mức ≈ 50% / 30% / 20%,
 * trắc nghiệm 6 điểm / tự luận 4 điểm. Tap-to-answer lessons get an exam(rng, level) in lop1.js.
 */
(function () {
  'use strict';
  window.EXAMS = window.EXAMS || [];

  // ---------- CUỐI HỌC KÌ I: chủ đề 1–4 (SGK tập 1) ----------
  // Mức 1: câu 1,2,3,4,5,7 = 5 đ · Mức 2: câu 6,8,9 = 3 đ · Mức 3: câu 10 = 2 đ
  EXAMS.push({
    grade: 1,
    term: 'cuoi-hk1',
    title: 'Đề kiểm tra cuối học kì I',
    minutes: 35,
    papers: 10,
    parts: [{
      title: 'PHẦN I. TRẮC NGHIỆM',
      note: 'Khoanh vào chữ đặt trước câu trả lời đúng.',
      items: [
        { pick: ['g1-c1-b1', 'g1-c1-b2'], level: 1, points: 1, form: 'choice' },      // đếm, đọc, viết số đến 10
        { lesson: 'g1-c1-b4', level: 1, points: 0.5, form: 'choice' },                  // so sánh số
        { lesson: 'g1-c1-b5', level: 1, points: 0.5, form: 'choice' },                  // mấy và mấy
        { lesson: 'g1-c2-b7', level: 1, points: 1, form: 'choice' },                    // hình phẳng
        { lesson: 'g1-c3-b10', level: 1, points: 1, form: 'choice' },                   // phép cộng trong phạm vi 10
        { lesson: 'g1-c3-b11', level: 2, points: 1, form: 'choice' },                   // phép trừ trong phạm vi 10
        { pick: ['g1-c4-b14', 'g1-c4-b15'], level: 1, points: 1, form: 'choice' },     // hình khối, vị trí
      ],
    }, {
      title: 'PHẦN II. TỰ LUẬN',
      items: [
        { lesson: 'g1-c3-b12', level: 2, points: 1, form: 'input', label: 'Tính' },
        { lesson: 'g1-c1-b4', level: 2, points: 1, form: 'as-is', label: 'Điền dấu >, <, =' },
        { pick: ['g1-c3-b10', 'g1-c3-b11'], level: 3, points: 2, form: 'input', label: 'Viết phép tính thích hợp' },
      ],
    }],
  });

  // ---------- CUỐI NĂM: cả năm, trọng tâm học kì II (chủ đề 6–9) ----------
  // Mức 1: câu 1,4,5,6,8,9 = 5 đ · Mức 2: câu 2,3,7,10 = 3 đ · Mức 3: câu 11 = 2 đ
  EXAMS.push({
    grade: 1,
    term: 'cuoi-nam',
    title: 'Đề kiểm tra cuối năm học',
    minutes: 35,
    papers: 10,
    parts: [{
      title: 'PHẦN I. TRẮC NGHIỆM',
      note: 'Khoanh vào chữ đặt trước câu trả lời đúng.',
      items: [
        { lesson: 'g1-c6-b21', level: 1, points: 0.5, form: 'choice' },                  // số có hai chữ số
        { lesson: 'g1-c6-b22', level: 2, points: 0.5, form: 'choice' },                  // so sánh số có hai chữ số
        { lesson: 'g1-c6-b23', level: 2, points: 0.5, form: 'choice' },                  // số liền trước, liền sau
        { pick: ['g1-c3-b10', 'g1-c3-b11', 'g1-c3-b12'], level: 1, points: 0.5, form: 'choice' }, // + − trong phạm vi 10
        { pick: ['g1-c7-b25', 'g1-c7-b26'], level: 1, points: 1, form: 'choice' },      // độ dài, cm
        { lesson: 'g1-c9-b34', level: 1, points: 1, form: 'choice' },                    // xem giờ đúng
        { pick: ['g1-c9-b35', 'g1-c9-b36'], level: 2, points: 1, form: 'choice' },      // ngày trong tuần, lịch
        { pick: ['g1-c2-b7', 'g1-c4-b14'], level: 1, points: 1, form: 'choice' },       // hình phẳng, hình khối
      ],
    }, {
      title: 'PHẦN II. TỰ LUẬN',
      items: [
        { pick: ['g1-c8-b29', 'g1-c8-b31'], level: 1, points: 1, form: 'input', label: 'Đặt tính rồi tính' },
        { pick: ['g1-c8-b30', 'g1-c8-b32'], level: 2, points: 1, form: 'input', label: 'Đặt tính rồi tính' },
        { pick: ['g1-c8-b29', 'g1-c8-b30', 'g1-c8-b31', 'g1-c8-b32'], level: 3, points: 2, form: 'input', label: 'Giải bài toán' },
      ],
    }],
  });
})();
