/* Toán ISA — "Học dạng toán": the kinds of problem of each grade, taught step by step (user, 2026-11-23: "thiếu 1 thẻ
 * để dạy các thể loại bài toán theo lớp, nếu các bé chưa hiểu để các bé có thể tương tác học").
 * Framework for the grade files dangtoan-lopN.js; the screens are in js/dangtoan.js. Contract: DANGTOAN.md.
 *
 * A kind of problem ("dạng toán"):
 *   { id: 'g4-dt-tong-hieu', sem: 1, icon: '⚖️', lesson: 'g4-c5-b25',
 *     title:  L('Tìm hai số khi biết tổng và hiệu', '…'),
 *     spot:   L('Nhận biết: …', '…'),            // how to recognise it (1–2 sentences)
 *     steps:  [L('Bước 1: …', '…'), …],           // the method, 2–4 short steps
 *     tip:    L('Dễ nhầm: …', '…'),               // optional: a common mistake
 *     guide:  rng => ({ prompt, visual?, steps: [{ ask, answer, unit?, say, hint? } …], done }),
 *             // a worked example the child completes one step at a time; a step's answer is a number
 *             // (DT.num(v)) or a choice (DT.ch(rng, correct, [wrong…])); `say` is shown once the step is right
 *     practice: (rng, i) => q }                   // i = 0…9, getting harder; q as in the lessons (DT.Q)
 */
(function () {
  'use strict';
  const DT = window.DT = window.DT || { items: [] };
  DT.add = (grade, list) => list.forEach(e => DT.items.push(Object.assign({ grade }, e)));
  DT.of = grade => DT.items.filter(e => e.grade === grade);
  DT.get = id => DT.items.find(e => e.id === id);

  /* ---------- helpers for the grade files (the same as the bank's) ---------- */
  DT.L = U.L;
  DT.F = x => U.fmt(x);
  DT.R = U.rand;
  DT.P = U.pick;
  DT.M = '−';
  DT.name = rng => U.pick(rng, U.NAMES);
  DT.names = (rng, k) => U.sample(rng, U.NAMES, k || 2);
  DT.num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });
  DT.ch = (rng, correct, distractors, format) => U.choices(rng, correct, distractors, format);
  DT.fr = (num, den) => ({ kind: 'fraction', num, den });
  DT.vz = (type, params) => ({ type, params });
  DT.Q = (prompt, answer, explain, extra) => Object.assign({ prompt, answer, explain: explain || '' }, extra || {});
  // one step of a guided example
  DT.step = (ask, answer, say, hint) => Object.assign({ ask, answer, say }, hint ? { hint } : {});
  // a mức 3 problem from the advanced bank (nangcao-lopN.js), for the last practice questions.
  // keep(q): optional test that the problem still uses this kind's own technique (a bank kind can mix
  // several operations); after a few misses the caller falls back to its own hard problem.
  DT.bank = (rng, ids, keep) => {
    const pool = ((window.NC && NC.items) || []).filter(e => ids.includes(e.id));
    if (!pool.length) return null;
    for (let t = 0; t < (keep ? 12 : 1); t++) {
      const q = U.pick(rng, pool).gen(rng);
      if (!keep || keep(q)) return q;
    }
    return null;
  };
  // the problem has a division sign (" : " between numbers, not the colon after "biết:")
  DT.hasDivision = q => / : /.test(q.prompt || '');
})();
