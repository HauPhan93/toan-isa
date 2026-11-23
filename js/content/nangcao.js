/* Toán ISA — ngân hàng bài nâng cao for "Đề nâng cao" (user, 2026-11-23: "các bài toán ở bộ đề nâng cao chưa nâng
 * cao"). Mức 3 of Thông tư 27: "vận dụng các nội dung đã học để giải quyết một số vấn đề mới" — harder by the way the
 * problem is put (conditions, working backwards, units to convert, convenient calculation, real-life contexts,
 * two topics together, more steps up to the grade's limit), never by content of a later grade. Contract: NANGCAO.md.
 *
 * Each grade file (nangcao-lopN.js) calls NC.add(grade, [entries]). An entry:
 *   { id: 'g3-tuoi', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c4-b28', gen: rng => q }
 *   from   — the first periodic test whose content covers it ('giua-hk1' < 'cuoi-hk1' < 'giua-hk2' < 'cuoi-nam';
 *            lớp 1–3 have only 'cuoi-hk1' and 'cuoi-nam')
 *   kinds  — 'tn' (trắc nghiệm: a number answer becomes A B C D by itself, or give a choice answer),
 *            'tl' (tự luận: the child writes the answer), 'dt' (a harder "Đặt tính rồi tính")
 *   lesson — the lesson to suggest for review when the child gets it wrong
 *   gen    — returns q = { prompt, answer, explain, hint?, visual? } built with the helpers below
 */
(function () {
  'use strict';
  const NC = window.NC = window.NC || { items: [] };
  NC.TERM_ORDER = { 'giua-hk1': 1, 'cuoi-hk1': 2, 'giua-hk2': 3, 'cuoi-nam': 4 };
  NC.add = (grade, list) => list.forEach(e => NC.items.push(Object.assign({ grade }, e)));
  // entries of a grade that a paper of this term may use, of one kind
  NC.pool = (grade, term, kind) => {
    const t = NC.TERM_ORDER[term] || 4;
    return NC.items.filter(e => e.grade === grade && (NC.TERM_ORDER[e.from] || 1) <= t && (e.kinds || []).includes(kind));
  };

  /* ---------- helpers for the grade files ---------- */
  NC.L = U.L;                                   // L(vi, en)
  NC.F = x => U.fmt(x);                         // 12 345 · 3,5 (SGK notation, both languages)
  NC.R = U.rand;                                // R(rng, a, b) integer a..b
  NC.P = U.pick;                                // P(rng, list)
  NC.name = rng => U.pick(rng, U.NAMES);
  NC.names = (rng, k) => U.sample(rng, U.NAMES, k || 2);
  NC.num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });
  NC.ch = (rng, correct, distractors, format) => U.choices(rng, correct, distractors, format);
  NC.fr = (num, den) => ({ kind: 'fraction', num, den });
  NC.col = (a, b, op) => ({ type: 'columnCalc', params: { a, b, op, reveal: 'none' } });
  NC.Q = (prompt, answer, explain, extra) => {
    const q = { prompt, answer, explain: explain || '' };
    return Object.assign(q, extra || {});
  };
  // "Đặt tính rồi tính" in the same form as the lessons' own (the column picture under the sum)
  NC.dt = (a, b, op, result, explain) => NC.Q(NC.L(`Đặt tính rồi tính:\n${NC.F(a)} ${op} ${NC.F(b)}`, `Set out and calculate:\n${NC.F(a)} ${op} ${NC.F(b)}`),
    NC.num(result), explain || `${NC.F(a)} ${op} ${NC.F(b)} = ${NC.F(result)}.`,
    // the column picture draws whole-number division only when it comes out exactly
    op !== ':' || (Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(result)) ? { visual: NC.col(a, b, op) } : {});
  NC.M = '−';   // the minus sign used in prompts (U+2212), as in the lessons
})();
