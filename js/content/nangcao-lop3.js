/* Toán ISA — bài nâng cao lớp 3 (Đề nâng cao). Contract: NANGCAO.md.
 * Mức 3 "vận dụng" (Thông tư 27) inside what lớp 3 has learnt (CT 2018 + KNTT):
 *   học kì I  — numbers within 1000, tables 2–9, × / : by a one-digit number, gấp / giảm một số lần, gấp mấy lần,
 *               expressions with two operations, hình tròn / trung điểm, khối lập phương, mm, g, ml;
 *   học kì II — numbers to 100 000, + − × : (× / : by one digit), perimeter and area (cm²), money, time, months,
 *               rounding, data tables, chance.
 * Word problems have at most two steps. No tổng–hiệu, trung bình cộng, rút về đơn vị, distributive property.
 * Types follow real KNTT lớp 3 school papers (gấp / giảm + a second step, ages, arrow chains, pairing sums,
 * missing numbers in × / :, faces of a box, remainders, "…… : 6 = 3 051 (dư 3)", shopping and change, offers). */
(function () {
  'use strict';
  const L = NC.L, F = NC.F, R = NC.R, P = NC.P, Q = NC.Q, num = NC.num, M = NC.M;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const digits = n => String(n).split('').map(Number);
  // the first value of gen() that passes ok(), or the fallback (keeps every seed valid)
  function find(gen, ok, fallback) { for (let t = 0; t < 400; t++) { const v = gen(); if (ok(v)) return v; } return fallback; }
  const LAN = L('lần', 'times');
  const TUOI = L('tuổi', 'years');

  /* ---------- column calculations: carries and the written steps (SGK wording) ---------- */
  function mulCarries(a, b) {
    const ds = digits(a).reverse(); let c = 0, n = 0;
    ds.forEach((d, j) => { const p = b * d + c; if (j < ds.length - 1 && p >= 10) n++; c = Math.floor(p / 10); });
    return n;
  }
  function addCarries(a, b) {
    let c = 0, n = 0;
    while (a || b) { const s = a % 10 + b % 10 + c; c = s >= 10 ? 1 : 0; n += c; a = Math.floor(a / 10); b = Math.floor(b / 10); }
    return n;
  }
  // borrows (n) and borrows at a 0 of the minuend (z)
  function subBorrows(a, b) {
    let c = 0, n = 0, z = 0;
    while (a) { const x = a % 10, y = b % 10 + c; if (x < y) { c = 1; n++; if (x === 0) z++; } else c = 0; a = Math.floor(a / 10); b = Math.floor(b / 10); }
    return { n, z };
  }
  // steps of a division with a remainder that is not 0 (the last step excluded)
  function remSteps(a, b) {
    const ds = digits(a); let k = 1, cur = ds[0], n = 0;
    if (cur < b && ds.length > 1) { k = 2; cur = ds[0] * 10 + ds[1]; }
    let r = cur % b;
    for (; k < ds.length; k++) { if (r) n++; cur = r * 10 + ds[k]; r = cur % b; }
    return n;
  }
  function mulSteps(a, b) {
    const ds = digits(a).reverse(), vi = [], en = []; let c = 0;
    ds.forEach((d, j) => {
      const last = j === ds.length - 1, p = b * d + c;
      let sv = `${b} × ${d} = ${b * d}`, se = sv;
      if (c) { sv += `, thêm ${c} bằng ${p}`; se += `, add ${c} to make ${p}`; }
      if (!last && p >= 10) { sv += `, viết ${p % 10} nhớ ${Math.floor(p / 10)}`; se += `, write ${p % 10} and carry ${Math.floor(p / 10)}`; }
      else { sv += `, viết ${p}`; se += `, write ${p}`; }
      vi.push(sv); en.push(se); c = Math.floor(p / 10);
    });
    return L(`${vi.join('; ')}.\nVậy ${F(a)} × ${b} = ${F(a * b)}.`, `${en.join('; ')}.\nSo ${F(a)} × ${b} = ${F(a * b)}.`);
  }
  function addSteps(a, b) {
    const x = digits(a).reverse(), y = digits(b).reverse(), vi = [], en = []; let c = 0;
    x.forEach((xd, j) => {
      const yd = y[j], last = j === x.length - 1, s = xd + (yd || 0) + c;
      let sv, se;
      if (yd != null) { sv = se = `${xd} + ${yd} = ${xd + yd}`; if (c) { sv += `, thêm 1 bằng ${s}`; se += `, add 1 to make ${s}`; } }
      else if (c) { sv = `${xd} thêm 1 bằng ${s}`; se = `${xd} add 1 makes ${s}`; }
      else { vi.push(`hạ ${xd}`); en.push(`bring down ${xd}`); return; }
      if (!last && s >= 10) { sv += `, viết ${s % 10} nhớ 1`; se += `, write ${s % 10} and carry 1`; c = 1; }
      else { sv += `, viết ${s}`; se += `, write ${s}`; c = 0; }
      vi.push(sv); en.push(se);
    });
    return L(`${vi.join('; ')}.\nVậy ${F(a)} + ${F(b)} = ${F(a + b)}.`, `${en.join('; ')}.\nSo ${F(a)} + ${F(b)} = ${F(a + b)}.`);
  }
  function subSteps(a, b) {
    const x = digits(a).reverse(), y = digits(b).reverse(), vi = [], en = []; let c = 0;
    x.forEach((xd, j) => {
      const yd = y[j];
      if (yd == null && !c) { vi.push(`hạ ${xd}`); en.push(`bring down ${xd}`); return; }
      const yy = (yd || 0) + c;
      let sv = '', se = '';
      if (c && yd != null) { sv = `${yd} thêm 1 bằng ${yy}; `; se = `${yd} add 1 makes ${yy}; `; }
      if (xd >= yy) { sv += `${xd} ${M} ${yy} = ${xd - yy}, viết ${xd - yy}`; se += `${xd} ${M} ${yy} = ${xd - yy}, write ${xd - yy}`; c = 0; }
      else {
        const d = xd + 10 - yy;
        sv += `${xd} không trừ được ${yy}, lấy ${xd + 10} ${M} ${yy} = ${d}, viết ${d} nhớ 1`;
        se += `you cannot take ${yy} from ${xd}, so ${xd + 10} ${M} ${yy} = ${d}, write ${d} and carry 1`; c = 1;
      }
      vi.push(sv); en.push(se);
    });
    return L(`${vi.join('; ')}.\nVậy ${F(a)} ${M} ${F(b)} = ${F(a - b)}.`, `${en.join('; ')}.\nSo ${F(a)} ${M} ${F(b)} = ${F(a - b)}.`);
  }
  function divSteps(a, b) {
    const ds = digits(a), vi = [], en = [];
    let k = 1, cur = ds[0];
    if (cur < b && ds.length > 1) {
      k = 2; cur = ds[0] * 10 + ds[1];
      vi.push(`${ds[0]} bé hơn ${b} nên lấy ${cur} chia cho ${b}`); en.push(`${ds[0]} is smaller than ${b}, so divide ${cur} by ${b}`);
    }
    const step = () => {
      const q = Math.floor(cur / b), r = cur % b;
      vi.push(`${cur} : ${b} = ${q}${r ? ` (dư ${r})` : ''}, viết ${q}`); en.push(`${cur} : ${b} = ${q}${r ? ` (remainder ${r})` : ''}, write ${q}`);
      return r;
    };
    let r = step();
    for (; k < ds.length; k++) {
      const d = ds[k]; cur = r * 10 + d;
      vi.push(r ? `hạ ${d} được ${cur}` : `hạ ${d}`); en.push(r ? `bring down ${d} to make ${cur}` : `bring down ${d}`);
      r = step();
    }
    return L(`${vi.join('; ')}.\nVậy ${F(a)} : ${b} = ${F(a / b)}.`, `${en.join('; ')}.\nSo ${F(a)} : ${b} = ${F(a / b)}.`);
  }

  /* ---------- time and calendar ---------- */
  const tS = (h, m) => L(m ? `${h} giờ ${m} phút` : `${h} giờ`, m ? `${h}:${String(m).padStart(2, '0')}` : `${h} o'clock`);
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  const WD = U.EN ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateS = (d, m, y) => L(`ngày ${d} tháng ${m} năm ${y}`, `${d} ${MONTHS[m]} ${y}`);

  /* ---------- the four operations of an arrow chain (gấp / giảm / thêm / bớt) ---------- */
  const OPS = {
    gap: k => ({ f: v => v * k, ok: v => v * k <= 999, vi: `gấp lên ${k} lần`, en: `make it ${k} times bigger`, en3: `makes it ${k} times bigger`, sym: `× ${k}`, inv: `: ${k}`, back: v => v / k, mult: true }),
    giam: k => ({ f: v => v / k, ok: v => v % k === 0, vi: `giảm đi ${k} lần`, en: `make it ${k} times smaller`, en3: `makes it ${k} times smaller`, sym: `: ${k}`, inv: `× ${k}`, back: v => v * k, mult: true }),
    them: m => ({ f: v => v + m, ok: v => v + m <= 999, vi: `thêm ${m}`, en: `add ${m}`, en3: `adds ${m}`, sym: `+ ${m}`, inv: `${M} ${m}`, back: v => v - m }),
    bot: m => ({ f: v => v - m, ok: v => v - m > 0, vi: `bớt đi ${m}`, en: `take away ${m}`, en3: `takes away ${m}`, sym: `${M} ${m}`, inv: `+ ${m}`, back: v => v + m }),
  };
  function makeOp(rng, type) { return OPS[type](type === 'gap' || type === 'giam' ? R(rng, 2, 9) : R(rng, 2, 30) * (R(rng, 0, 2) ? 1 : 5)); }

  NC.add(3, [
    /* ================= Học kì I · Đặt tính rồi tính ================= */
    { // three-digit × one digit with several carries (or a 0 that gets a carry): 187 × 5, 108 × 9
      id: 'g3-dt-nhan-ba-chu-so', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g3-c6-b36',
      gen: rng => {
        const [a, b] = find(() => { const b = R(rng, 3, 9); return [R(rng, 102, Math.floor(999 / b)), b]; },
          ([a, b]) => a * b <= 999 && (mulCarries(a, b) >= 2 || (String(a)[1] === '0' && mulCarries(a, b) >= 1)), [187, 5]);
        return NC.dt(a, b, '×', a * b, mulSteps(a, b));
      },
    },
    { // three-digit : one digit with a 0 in the quotient: 720 : 6, 636 : 6, 540 : 6
      id: 'g3-dt-chia-co-chu-so-0', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g3-c6-b37',
      gen: rng => {
        const [q, b] = find(() => { const b = R(rng, 3, 9); return [R(rng, Math.ceil(100 / b), Math.floor(999 / b)), b]; },
          ([q, b]) => String(q).includes('0') && q % 100 !== 0 && q * b >= 100, [106, 6]);
        return NC.dt(q * b, b, ':', q, divSteps(q * b, b));
      },
    },
    { // three-digit : one digit with a remainder to carry at two steps: 972 : 4, 952 : 8, 256 : 4
      id: 'g3-dt-chia-ba-chu-so', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g3-c6-b37',
      gen: rng => {
        const [q, b] = find(() => { const b = R(rng, 3, 9); return [R(rng, Math.ceil(100 / b), Math.floor(999 / b)), b]; },
          ([q, b]) => !String(q).includes('0') && remSteps(q * b, b) >= (digits(q * b)[0] < b ? 1 : 2), [243, 4]);
        return NC.dt(q * b, b, ':', q, divSteps(q * b, b));
      },
    },
    { // three-digit subtraction borrowing across a 0 in the tens: 802 − 358, 705 − 268
      id: 'g3-dt-tru-qua-so-0', from: 'cuoi-hk1', kinds: ['dt'], lesson: 'g3-c1-b2',
      gen: rng => {
        const [a, b] = find(() => {
          const H = R(rng, 3, 9), u = R(rng, 0, 7), v = R(rng, u + 1, 9), t = R(rng, 0, 9), h = R(rng, 1, H - 1);
          return [H * 100 + u, h * 100 + t * 10 + v];
        }, ([a, b]) => a - b >= 100, [802, 358]);
        return NC.dt(a, b, M, a - b, subSteps(a, b));
      },
    },

    /* ================= Học kì I · trắc nghiệm / tự luận ================= */
    { // gấp / giảm một số lần, then a sum or a difference (two steps)
      id: 'g3-gap-giam-hai-buoc', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c4-b28',
      gen: rng => {
        const gap = R(rng, 0, 1) === 1, sum = R(rng, 0, 1) === 1, k = R(rng, 2, 9);
        let A, B;
        if (gap) { A = R(rng, 12, Math.floor(999 / (k + 1))); B = A * k; }
        else { B = R(rng, Math.max(12, Math.ceil(100 / k)), Math.floor(999 / (k + 1))); A = B * k; }
        const ans = sum ? A + B : Math.abs(A - B), big = Math.max(A, B), small = Math.min(A, B);
        const c = R(rng, 0, 3);
        let vi, en, u, s1, s2;
        if (c === 0) {
          vi = `Xe thứ nhất chở được ${A} bao xi măng. ` + (gap ? `Số bao xi măng xe thứ hai chở được gấp ${k} lần số bao của xe thứ nhất.` : `Số bao xi măng xe thứ hai chở được bằng số bao của xe thứ nhất giảm đi ${k} lần.`)
            + (sum ? ' Hỏi cả hai xe chở được bao nhiêu bao xi măng?' : ` Hỏi xe thứ ${gap ? 'hai' : 'nhất'} chở được nhiều hơn xe thứ ${gap ? 'nhất' : 'hai'} bao nhiêu bao xi măng?`);
          en = `The first lorry carries ${A} bags of cement. ` + (gap ? `The second lorry carries ${k} times as many bags as the first lorry.` : `The number of bags on the second lorry is the number on the first lorry made ${k} times smaller.`)
            + (sum ? ' How many bags of cement do the two lorries carry altogether?' : ` How many more bags does the ${gap ? 'second' : 'first'} lorry carry than the ${gap ? 'first' : 'second'} lorry?`);
          u = L('bao', 'bags'); s1 = L('Số bao xi măng xe thứ hai chở được là', 'The second lorry carries');
          s2 = sum ? L('Số bao xi măng cả hai xe chở được là', 'The two lorries carry altogether') : L(`Xe thứ ${gap ? 'hai' : 'nhất'} chở nhiều hơn xe thứ ${gap ? 'nhất' : 'hai'} là`, `The ${gap ? 'second' : 'first'} lorry carries this many more`);
        } else if (c === 1) {
          vi = `Kho thứ nhất có ${A} kg gạo. Số gạo ở kho thứ hai ` + (gap ? `gấp ${k} lần số gạo ở kho thứ nhất.` : `bằng số gạo ở kho thứ nhất giảm đi ${k} lần.`)
            + (sum ? ' Hỏi cả hai kho có bao nhiêu ki-lô-gam gạo?' : ` Hỏi kho thứ ${gap ? 'hai' : 'nhất'} có nhiều hơn kho thứ ${gap ? 'nhất' : 'hai'} bao nhiêu ki-lô-gam gạo?`);
          en = `The first storehouse has ${A} kg of rice. ` + (gap ? `The second storehouse has ${k} times as much rice as the first.` : `The amount of rice in the second storehouse is the amount in the first made ${k} times smaller.`)
            + (sum ? ' How many kilograms of rice do the two storehouses have altogether?' : ` How many more kilograms of rice does the ${gap ? 'second' : 'first'} storehouse have than the ${gap ? 'first' : 'second'}?`);
          u = 'kg'; s1 = L('Số gạo ở kho thứ hai là', 'The second storehouse has');
          s2 = sum ? L('Số gạo cả hai kho có là', 'The two storehouses have altogether') : L(`Kho thứ ${gap ? 'hai' : 'nhất'} có nhiều hơn kho thứ ${gap ? 'nhất' : 'hai'} là`, `The ${gap ? 'second' : 'first'} storehouse has this much more`);
        } else if (c === 2) {
          vi = `Buổi sáng cửa hàng bán được ${A} m vải. Số mét vải bán được buổi chiều ` + (gap ? `gấp ${k} lần số mét vải bán được buổi sáng.` : `bằng số mét vải bán được buổi sáng giảm đi ${k} lần.`)
            + (sum ? ' Hỏi cả ngày cửa hàng bán được bao nhiêu mét vải?' : ` Hỏi buổi ${gap ? 'chiều' : 'sáng'} cửa hàng bán được nhiều hơn buổi ${gap ? 'sáng' : 'chiều'} bao nhiêu mét vải?`);
          en = `In the morning a shop sells ${A} m of cloth. ` + (gap ? `In the afternoon it sells ${k} times as much cloth as in the morning.` : `The amount of cloth it sells in the afternoon is the morning's amount made ${k} times smaller.`)
            + (sum ? ' How many metres of cloth does the shop sell in the whole day?' : ` How many more metres of cloth does the shop sell in the ${gap ? 'afternoon' : 'morning'} than in the ${gap ? 'morning' : 'afternoon'}?`);
          u = 'm'; s1 = L('Buổi chiều cửa hàng bán được là', 'In the afternoon the shop sells');
          s2 = sum ? L('Số mét vải cả ngày cửa hàng bán được là', 'In the whole day the shop sells') : L(`Buổi ${gap ? 'chiều' : 'sáng'} bán được nhiều hơn buổi ${gap ? 'sáng' : 'chiều'} là`, `The shop sells this much more in the ${gap ? 'afternoon' : 'morning'}`);
        } else {
          vi = `Trường Tiểu học Hòa Bình trồng được ${A} cây. Số cây trường Tiểu học Kim Đồng trồng được ` + (gap ? `gấp ${k} lần số cây của trường Hòa Bình.` : `bằng số cây của trường Hòa Bình giảm đi ${k} lần.`)
            + (sum ? ' Hỏi cả hai trường trồng được bao nhiêu cây?' : ` Hỏi trường ${gap ? 'Kim Đồng' : 'Hòa Bình'} trồng được nhiều hơn trường ${gap ? 'Hòa Bình' : 'Kim Đồng'} bao nhiêu cây?`);
          en = `Hòa Bình Primary School planted ${A} trees. ` + (gap ? `Kim Đồng Primary School planted ${k} times as many trees as Hòa Bình school.` : `The number of trees Kim Đồng Primary School planted is Hòa Bình's number made ${k} times smaller.`)
            + (sum ? ' How many trees did the two schools plant altogether?' : ` How many more trees did ${gap ? 'Kim Đồng' : 'Hòa Bình'} school plant than ${gap ? 'Hòa Bình' : 'Kim Đồng'} school?`);
          u = L('cây', 'trees'); s1 = L('Số cây trường Kim Đồng trồng được là', 'Kim Đồng school planted');
          s2 = sum ? L('Số cây cả hai trường trồng được là', 'The two schools planted altogether') : L(`Trường ${gap ? 'Kim Đồng' : 'Hòa Bình'} trồng nhiều hơn trường ${gap ? 'Hòa Bình' : 'Kim Đồng'} là`, `${gap ? 'Kim Đồng' : 'Hòa Bình'} school planted this many more`);
        }
        const op = gap ? '×' : ':', calc2 = sum ? `${A} + ${B} = ${ans}` : `${big} ${M} ${small} = ${ans}`;
        return Q(L(vi, en), u === 'kg' || u === 'm' ? num(ans, u) : num(ans),
          L(`Bước 1: ${s1}: ${A} ${op} ${k} = ${B} (${u}).\nBước 2: ${s2}: ${calc2} (${u}).`, `Step 1: ${s1}: ${A} ${op} ${k} = ${B} (${u}).\nStep 2: ${s2}: ${calc2} (${u}).`),
          { hint: L(gap ? `Gấp ${k} lần thì nhân với ${k}. Tìm số thứ hai trước.` : `Giảm đi ${k} lần thì chia cho ${k}. Tìm số thứ hai trước.`, gap ? `${k} times as many means multiply by ${k}. Find the second amount first.` : `${k} times smaller means divide by ${k}. Find the second amount first.`) });
      },
    },
    { // ages in two steps: "Năm nay mẹ 35 tuổi, mẹ hơn con 25 tuổi. Tổng số tuổi…"
      id: 'g3-tuoi-hai-buoc', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c4-b28',
      gen: rng => {
        const x = NC.name(rng), f = R(rng, 0, 3);
        if (f === 0) {
          const c = R(rng, 5, 12), d = R(rng, 22, 33), m = c + d;
          return Q(L(`Năm nay mẹ ${x} ${m} tuổi, mẹ hơn ${x} ${d} tuổi. Hỏi năm nay tổng số tuổi của hai mẹ con là bao nhiêu?`, `This year ${x}'s mum is ${m} years old. She is ${d} years older than ${x}. What is the total of their two ages this year?`),
            num(m + c, TUOI),
            L(`Bước 1: Năm nay ${x} có số tuổi là: ${m} ${M} ${d} = ${c} (tuổi).\nBước 2: Tổng số tuổi của hai mẹ con là: ${m} + ${c} = ${m + c} (tuổi).`, `Step 1: ${x}'s age this year: ${m} ${M} ${d} = ${c} (years).\nStep 2: the total of their ages: ${m} + ${c} = ${m + c} (years).`),
            { hint: L(`Tìm tuổi của ${x} trước.`, `First find ${x}'s age.`) });
        }
        if (f === 1) {
          const [c, k] = find(() => [R(rng, 5, 9), R(rng, 4, 7)], ([c, k]) => c * k >= 26 && c * k <= 50, [7, 5]), d = c * k;
          return Q(L(`Năm nay ${x} ${c} tuổi, tuổi bố gấp ${k} lần tuổi ${x}. Hỏi bố hơn ${x} bao nhiêu tuổi?`, `This year ${x} is ${c} years old. Dad's age is ${k} times ${x}'s age. How many years older than ${x} is Dad?`),
            num(d - c, TUOI),
            L(`Bước 1: Tuổi bố là: ${c} × ${k} = ${d} (tuổi).\nBước 2: Bố hơn ${x} số tuổi là: ${d} ${M} ${c} = ${d - c} (tuổi).`, `Step 1: Dad's age: ${c} × ${k} = ${d} (years).\nStep 2: Dad is older by ${d} ${M} ${c} = ${d - c} (years).`),
            { hint: L('Tìm tuổi bố trước.', 'First find Dad\'s age.') });
        }
        if (f === 2) {
          const [c, k] = find(() => [R(rng, 6, 10), R(rng, 6, 9)], ([c, k]) => c * k >= 55 && c * k <= 81, [8, 8]), g = c * k, n = R(rng, 2, 6);
          return Q(L(`Năm nay ${x} ${c} tuổi, tuổi ông gấp ${k} lần tuổi ${x}. Hỏi ${n} năm nữa ông bao nhiêu tuổi?`, `This year ${x} is ${c} years old. Grandpa's age is ${k} times ${x}'s age. How old will Grandpa be in ${n} years' time?`),
            num(g + n, TUOI),
            L(`Bước 1: Năm nay ông có số tuổi là: ${c} × ${k} = ${g} (tuổi).\nBước 2: ${n} năm nữa ông có số tuổi là: ${g} + ${n} = ${g + n} (tuổi).`, `Step 1: Grandpa's age this year: ${c} × ${k} = ${g} (years).\nStep 2: in ${n} years' time: ${g} + ${n} = ${g + n} (years).`),
            { hint: L(`Mỗi năm qua đi, ai cũng thêm 1 tuổi.`, 'Every year, everyone gets 1 year older.') });
        }
        const [c, k] = find(() => [R(rng, 6, 10), R(rng, 6, 9)], ([c, k]) => c * k >= 50 && c * k <= 81, [9, 7]), g = c * k;
        return Q(L(`Năm nay bà ${g} tuổi, tuổi ${x} bằng tuổi bà giảm đi ${k} lần. Hỏi bà hơn ${x} bao nhiêu tuổi?`, `This year Grandma is ${g} years old. ${x}'s age is Grandma's age made ${k} times smaller. How many years older than ${x} is Grandma?`),
          num(g - c, TUOI),
          L(`Bước 1: Năm nay ${x} có số tuổi là: ${g} : ${k} = ${c} (tuổi).\nBước 2: Bà hơn ${x} số tuổi là: ${g} ${M} ${c} = ${g - c} (tuổi).`, `Step 1: ${x}'s age: ${g} : ${k} = ${c} (years).\nStep 2: Grandma is older by ${g} ${M} ${c} = ${g - c} (years).`),
          { hint: L(`Tìm tuổi của ${x} trước.`, `First find ${x}'s age.`) });
      },
    },
    { // which expression has this value? (order of operations and brackets with the same numbers)
      id: 'g3-chon-bieu-thuc', from: 'cuoi-hk1', kinds: ['tn'], lesson: 'g3-c6-b38',
      gen: rng => {
        const fam = R(rng, 0, 2);
        const build = () => {
          if (fam === 0) {
            const a = R(rng, 12, 99), b = R(rng, 2, 7), c = R(rng, 2, 9 - b);
            return [[`${a} + ${b} × ${c}`, a + b * c, `${a} + ${b * c}`], [`(${a} + ${b}) × ${c}`, (a + b) * c, `${a + b} × ${c}`],
              [`${a} × ${b} + ${c}`, a * b + c, `${a * b} + ${c}`], [`${a} × (${b} + ${c})`, a * (b + c), `${a} × ${b + c}`]];
          }
          if (fam === 1) {
            const [b, c, l] = P(rng, [[2, 2, 4], [2, 3, 30], [2, 4, 24], [3, 2, 30], [3, 3, 18], [4, 2, 24]]);
            const a = l * R(rng, Math.ceil(100 / l), Math.floor(999 / l));
            return [[`${a} : ${b} × ${c}`, a / b * c, `${a / b} × ${c}`], [`${a} : (${b} × ${c})`, a / (b * c), `${a} : ${b * c}`],
              [`${a} : ${b} + ${c}`, a / b + c, `${a / b} + ${c}`], [`${a} : (${b} + ${c})`, a / (b + c), `${a} : ${b + c}`]];
          }
          const c = R(rng, 2, 9), a = c * R(rng, Math.ceil(100 / c), Math.floor(999 / c)), b = c * R(rng, 2, 9);
          return [[`${a} ${M} ${b} : ${c}`, a - b / c, `${a} ${M} ${b / c}`], [`(${a} ${M} ${b}) : ${c}`, (a - b) / c, `${a - b} : ${c}`],
            [`${a} : ${c} ${M} ${b}`, a / c - b, `${a / c} ${M} ${b}`], [`${a} ${M} ${b} ${M} ${c}`, a - b - c, `${a - b} ${M} ${c}`]];
        };
        const opts = find(build, o => o.every(e => Number.isInteger(e[1]) && e[1] >= 0 && e[1] <= 999) && new Set(o.map(e => e[1])).size === 4,
          [['48 : 2 × 3', 72, '24 × 3'], ['48 : (2 × 3)', 8, '48 : 6'], ['48 : 2 + 3', 27, '24 + 3'], ['48 : (2 + 3)', 9.6, '']].slice(0, 3));
        const right = opts[R(rng, 0, opts.length - 1)];
        return Q(L(`Biểu thức nào dưới đây có giá trị bằng ${right[1]}?`, `Which expression has a value of ${right[1]}?`),
          NC.ch(rng, right[0], opts.filter(e => e !== right).map(e => e[0])),
          L(`${opts.map(e => `${e[0]} = ${e[2]} = ${e[1]}`).join('\n')}\nVậy biểu thức có giá trị bằng ${right[1]} là ${right[0]}.`, `${opts.map(e => `${e[0]} = ${e[2]} = ${e[1]}`).join('\n')}\nSo the expression with a value of ${right[1]} is ${right[0]}.`),
          { hint: L('Có ngoặc thì tính trong ngoặc trước. Không có ngoặc: nhân, chia trước; cộng, trừ sau; chỉ có nhân, chia thì tính từ trái sang phải.', 'Work out brackets first. Without brackets, do × and : before + and −; with only × and :, work from left to right.') });
      },
    },
    { // the value of an expression with three-digit numbers and two operations
      id: 'g3-gia-tri-bieu-thuc', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c6-b38',
      gen: rng => {
        const t = R(rng, 0, 7);
        const BR = L('Có ngoặc thì tính trong ngoặc trước.', 'Work out the brackets first.');
        const MD = L('Nhân, chia trước; cộng, trừ sau.', 'Do × and : first, then + and −.');
        const LR = L('Chỉ có nhân và chia: tính từ trái sang phải.', 'Only × and :, so work from left to right.');
        let s, mid, v, rule;
        if (t === 0) { const c = R(rng, 2, 9), q = R(rng, Math.ceil(100 / c), Math.floor(900 / c)), d = q * c, b = R(rng, 11, 999 - d); s = `(${d + b} ${M} ${b}) : ${c}`; mid = `${d} : ${c}`; v = q; rule = BR; }
        else if (t === 1) { const c = R(rng, 2, 9), a = R(rng, 101, Math.floor(999 / c)), p = a * c, b = R(rng, 11, p - 1); s = `${a} × ${c} ${M} ${b}`; mid = `${p} ${M} ${b}`; v = p - b; rule = MD; }
        else if (t === 2) { const c = R(rng, 2, 9), q = R(rng, Math.max(12, Math.ceil(100 / c)), Math.floor(800 / c)), a = R(rng, 11, 999 - q); s = `${a} + ${q * c} : ${c}`; mid = `${a} + ${q}`; v = a + q; rule = MD; }
        else if (t === 3) { const c = R(rng, 2, 9), sm = R(rng, 30, Math.floor(999 / c)), a = R(rng, 11, sm - 11); s = `(${a} + ${sm - a}) × ${c}`; mid = `${sm} × ${c}`; v = sm * c; rule = BR; }
        else if (t === 4) { const c = R(rng, 2, 9), q = R(rng, Math.ceil(100 / c), Math.min(499, Math.floor(999 / c))), d = R(rng, 2, Math.min(9, Math.floor(999 / q))); s = `${q * c} : ${c} × ${d}`; mid = `${q} × ${d}`; v = q * d; rule = LR; }
        else if (t === 5) { const c = R(rng, 2, 9), b = R(rng, 12, Math.floor(900 / c)), p = b * c, a = R(rng, p + 1, 999); s = `${a} ${M} ${b} × ${c}`; mid = `${a} ${M} ${p}`; v = a - p; rule = MD; }
        else if (t === 6) { const d = R(rng, 2, 9), c = R(rng, 10, 60), q = R(rng, Math.ceil(100 / d), Math.floor(999 / d)); s = `${q * d} : (${c + d} ${M} ${c})`; mid = `${q * d} : ${d}`; v = q; rule = BR; }
        else { const d = R(rng, 2, 9), c = R(rng, 10, 60), a = R(rng, Math.max(12, Math.ceil(100 / d)), Math.floor(999 / d)); s = `${a} × (${c + d} ${M} ${c})`; mid = `${a} × ${d}`; v = a * d; rule = BR; }
        return Q(L(`Tính giá trị của biểu thức:\n${s}`, `Work out the value of the expression:\n${s}`), num(v),
          L(`${rule}\n${s} = ${mid} = ${v}.`, `${rule}\n${s} = ${mid} = ${v}.`), { hint: rule });
      },
    },
    { // arrow chains (gấp / giảm / thêm / bớt) forwards, and working backwards to the start
      id: 'g3-chuoi-phep-tinh', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c4-b27',
      gen: rng => {
        const TYPES = [['gap', 'giam'], ['giam', 'gap'], ['gap', 'bot'], ['gap', 'them'], ['giam', 'them'], ['giam', 'bot'], ['them', 'gap'], ['bot', 'giam'], ['them', 'giam'], ['bot', 'gap']];
        const back = R(rng, 0, 1) === 1;
        const [s, o1, o2] = find(() => { const [t1, t2] = P(rng, TYPES); return [R(rng, 2, back ? 120 : 99), makeOp(rng, t1), makeOp(rng, t2)]; },
          ([s, o1, o2]) => o1.ok(s) && o2.ok(o1.f(s)) && o2.f(o1.f(s)) >= 2 && o2.f(o1.f(s)) <= 999 && o1.f(s) !== s,
          [6, OPS.gap(5), OPS.giam(6)]);
        const v1 = o1.f(s), v2 = o2.f(v1);
        const hint = L('Gấp lên là nhân, giảm đi một số lần là chia, thêm là cộng, bớt là trừ.', 'Times bigger: multiply. Times smaller: divide. Add: plus. Take away: minus.');
        if (!back) {
          return Q(L(`Điền số thích hợp vào ô ?:\n${s} → ${o1.vi} → … → ${o2.vi} → ?`, `Find the number that goes in the box ?:\n${s} → ${o1.en} → … → ${o2.en} → ?`), num(v2),
            L(`${s} ${o1.sym} = ${v1}; ${v1} ${o2.sym} = ${v2}.\nSố cần điền là ${v2}.`, `${s} ${o1.sym} = ${v1}; ${v1} ${o2.sym} = ${v2}.\nThe missing number is ${v2}.`), { hint });
        }
        const x = NC.name(rng);
        return Q(L(`${x} nghĩ ra một số. Đem số đó ${o1.vi} rồi ${o2.vi} thì được ${v2}. Hỏi ${x} đã nghĩ ra số nào?`, `${x} thinks of a number. ${x} ${o1.en3}, then ${o2.en3}, and gets ${v2}. What number did ${x} think of?`), num(s),
          L(`Tính ngược từ cuối lên: ${v2} ${o2.inv} = ${v1}; ${v1} ${o1.inv} = ${s}.\nThử lại: ${s} ${o1.sym} = ${v1}; ${v1} ${o2.sym} = ${v2}.`, `Work backwards from the end: ${v2} ${o2.inv} = ${v1}; ${v1} ${o1.inv} = ${s}.\nCheck: ${s} ${o1.sym} = ${v1}; ${v1} ${o2.sym} = ${v2}.`),
          { hint: L('Đi ngược lại: nhân thì đổi thành chia, cộng thì đổi thành trừ.', 'Work backwards: undo × with :, and undo + with −.') });
      },
    },
    { // convenient calculation by pairing only: 37 + 46 + 63 + 54, 268 + 145 − 68, 2 × 7 × 5
      id: 'g3-tinh-thuan-tien', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c1-b2',
      gen: rng => {
        const f = R(rng, 0, 4), notRound = lo => hi => find(() => R(rng, lo, hi), v => v % 10 !== 0, lo + 1);
        const T = L('Tính bằng cách thuận tiện:', 'Work out in a convenient way:');
        const H = L('Ghép các số có tổng (hoặc hiệu) là số tròn chục, tròn trăm.', 'Group numbers that make a whole number of tens or hundreds.');
        if (f === 0) {
          const S1 = P(rng, [100, 100, 200]), S2 = P(rng, [100, 200, 300]);
          const p = notRound(11)(S1 - 11), q = find(() => notRound(11)(S2 - 11), v => v !== p && v !== S1 - p, 46);
          const terms = R(rng, 0, 1) ? [p, q, S1 - p, S2 - q] : [p, q, S2 - q, S1 - p], s = terms.join(' + ');
          return Q(`${T}\n${s}`, num(S1 + S2), L(`${s} = (${p} + ${S1 - p}) + (${q} + ${S2 - q}) = ${S1} + ${S2} = ${S1 + S2}.`, `${s} = (${p} + ${S1 - p}) + (${q} + ${S2 - q}) = ${S1} + ${S2} = ${S1 + S2}.`), { hint: H });
        }
        if (f === 1) {
          const S = P(rng, [100, 200, 300, 400]), a = notRound(11)(S - 11), b = R(rng, 12, 500);
          const s = `${a} + ${b} + ${S - a}`;
          return Q(`${T}\n${s}`, num(S + b), `${s} = (${a} + ${S - a}) + ${b} = ${S} + ${b} = ${S + b}.`, { hint: H });
        }
        if (f === 2) {
          const c = R(rng, 12, 99), a = c + R(rng, 1, 6) * 100, b = R(rng, 15, 400);
          const s = `${a} + ${b} ${M} ${c}`;
          return Q(`${T}\n${s}`, num(a - c + b), `${s} = (${a} ${M} ${c}) + ${b} = ${a - c} + ${b} = ${a - c + b}.`, { hint: H });
        }
        if (f === 3) {
          const S = P(rng, [100, 200, 300]), b = notRound(11)(S - 11), a = S + R(rng, 1, 6) * 100 + R(rng, 0, 1) * 50;
          const s = `${a} ${M} ${b} ${M} ${S - b}`;
          return Q(`${T}\n${s}`, num(a - S), `${s} = ${a} ${M} (${b} + ${S - b}) = ${a} ${M} ${S} = ${a - S}.`, { hint: L('Trừ đi hai số liên tiếp bằng trừ đi tổng của chúng.', 'Taking away two numbers is the same as taking away their sum.') });
        }
        const k = R(rng, 3, 9), ord = P(rng, [[2, k, 5], [5, k, 2], [k, 2, 5], [2, 5, k]]), s = ord.join(' × ');
        return Q(`${T}\n${s}`, num(10 * k), `${s} = (2 × 5) × ${k} = 10 × ${k} = ${10 * k}.`, { hint: L('Ghép 2 × 5 = 10 trước.', 'Do 2 × 5 = 10 first.') });
      },
    },
    { // missing numbers in × and : with three-digit numbers, some after a first calculation
      id: 'g3-tim-thanh-phan', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c2-b13',
      gen: rng => {
        const f = R(rng, 0, 5), T = L('Tìm số thích hợp thay cho dấu ?:', 'Find the missing number:');
        const DD = L('Muốn tìm số bị chia, ta lấy thương nhân với số chia.', 'To find the dividend, multiply the quotient by the divisor.');
        const TS = L('Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số kia.', 'To find a missing factor, divide the product by the other factor.');
        const SC = L('Muốn tìm số chia, ta lấy số bị chia chia cho thương.', 'To find the divisor, divide the dividend by the quotient.');
        if (f === 0) { const b = R(rng, 3, 9), q = R(rng, 101, Math.floor(999 / b)); return Q(`${T}\n? : ${b} = ${q}`, num(q * b), L(`${DD}\n? = ${q} × ${b} = ${q * b}.`, `${DD}\n? = ${q} × ${b} = ${q * b}.`), { hint: DD }); }
        if (f === 1) { const b = R(rng, 3, 9), x = R(rng, Math.max(21, Math.ceil(100 / b)), Math.floor(999 / b)); return Q(`${T}\n${b} × ? = ${x * b}`, num(x), L(`${TS}\n? = ${x * b} : ${b} = ${x}.`, `${TS}\n? = ${x * b} : ${b} = ${x}.`), { hint: TS }); }
        if (f === 2) { const d = R(rng, 2, 9), x = R(rng, Math.ceil(100 / d), Math.floor(999 / d)); return Q(`${T}\n${x * d} : ? = ${d}`, num(x), L(`${SC}\n? = ${x * d} : ${d} = ${x}.`, `${SC}\n? = ${x * d} : ${d} = ${x}.`), { hint: SC }); }
        if (f === 3) {
          const b = R(rng, 3, 9), x = R(rng, 12, Math.floor(980 / b)), t = x * b, c = R(rng, t + 10, 999), e = c - t;
          return Q(`${T}\n? × ${b} = ${c} ${M} ${e}`, num(x), L(`Tính vế phải trước: ${c} ${M} ${e} = ${t}.\n? × ${b} = ${t}, ? = ${t} : ${b} = ${x}.`, `Work out the right-hand side first: ${c} ${M} ${e} = ${t}.\n? × ${b} = ${t}, so ? = ${t} : ${b} = ${x}.`), { hint: TS });
        }
        if (f === 4) {
          const b = R(rng, 2, 9), t = R(rng, 25, Math.floor(999 / b)), c = R(rng, 10, t - 10);
          return Q(`${T}\n? : ${b} = ${c} + ${t - c}`, num(t * b), L(`Tính vế phải trước: ${c} + ${t - c} = ${t}.\n? : ${b} = ${t}, ? = ${t} × ${b} = ${t * b}.`, `Work out the right-hand side first: ${c} + ${t - c} = ${t}.\n? : ${b} = ${t}, so ? = ${t} × ${b} = ${t * b}.`), { hint: DD });
        }
        const b = R(rng, 2, 9), q = R(rng, 11, Math.floor(900 / b)), t = q * b, a = R(rng, 10, 999 - t);
        return Q(`${T}\n(? ${M} ${a}) : ${b} = ${q}`, num(t + a),
          L(`Số trong ngoặc là số bị chia: ? ${M} ${a} = ${q} × ${b} = ${t}.\nVậy ? = ${t} + ${a} = ${t + a}.`, `The brackets are the dividend: ? ${M} ${a} = ${q} × ${b} = ${t}.\nSo ? = ${t} + ${a} = ${t + a}.`),
          { hint: L('Coi cả ngoặc là số bị chia.', 'Treat the whole bracket as the dividend.') });
      },
    },
    { // a cube has 6 faces, 12 edges and 8 vertices — in a counting problem with a second step
      id: 'g3-mat-canh-dinh-khoi', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c3-b21',
      gen: rng => {
        const f = R(rng, 0, 5), x = NC.name(rng);
        if (f === 0) {
          const n = R(rng, 7, 16);
          return Q(L(`Để dán kín tất cả các mặt của ${n} hộp giấy hình lập phương, mỗi mặt dán một tờ giấy màu, thì cần bao nhiêu tờ giấy màu?`, `Each face of a cube-shaped paper box is covered with one sheet of coloured paper. How many sheets are needed to cover all the faces of ${n} boxes?`),
            num(n * 6), L(`Mỗi hộp hình lập phương có 6 mặt.\nSố tờ giấy màu cần là: ${n} × 6 = ${n * 6} (tờ).`, `A cube has 6 faces.\nSheets needed: ${n} × 6 = ${n * 6} (sheets).`), { hint: L('Khối lập phương có mấy mặt?', 'How many faces does a cube have?') });
        }
        if (f === 1) {
          const n = R(rng, 3, 12), e = R(rng, 2, 99 - 6 * n > 25 ? 25 : 99 - 6 * n), T = 6 * n + e;
          return Q(L(`${x} có ${T} tờ giấy màu. ${x} dán kín các mặt của ${n} hộp giấy hình lập phương, mỗi mặt một tờ. Hỏi ${x} còn lại bao nhiêu tờ giấy màu?`, `${x} has ${T} sheets of coloured paper. ${x} covers all the faces of ${n} cube-shaped boxes, one sheet on each face. How many sheets does ${x} have left?`),
            num(e), L(`Bước 1: Mỗi hộp có 6 mặt. Số tờ đã dán là: ${n} × 6 = ${6 * n} (tờ).\nBước 2: Số tờ còn lại là: ${T} ${M} ${6 * n} = ${e} (tờ).`, `Step 1: each box has 6 faces. Sheets used: ${n} × 6 = ${6 * n} (sheets).\nStep 2: sheets left: ${T} ${M} ${6 * n} = ${e} (sheets).`),
            { hint: L('Khối lập phương có 6 mặt.', 'A cube has 6 faces.') });
        }
        if (f === 2) {
          const n = R(rng, 4, 15), r = R(rng, 1, 5), T = 6 * n + r;
          return Q(L(`${x} có ${T} tờ giấy màu. Mỗi mặt của một hộp giấy hình lập phương cần dán một tờ. Hỏi ${x} dán kín được nhiều nhất bao nhiêu hộp?`, `${x} has ${T} sheets of coloured paper. Each face of a cube-shaped box needs one sheet. What is the largest number of boxes ${x} can cover completely?`),
            num(n), L(`Mỗi hộp cần 6 tờ. ${T} : 6 = ${n} (dư ${r}).\n${x} dán kín được nhiều nhất ${n} hộp, còn thừa ${r} tờ.`, `Each box needs 6 sheets. ${T} : 6 = ${n} (remainder ${r}).\n${x} can cover at most ${n} boxes, with ${r} ${r === 1 ? 'sheet' : 'sheets'} left over.`),
            { hint: L('Chia số tờ giấy cho số mặt của một hộp.', 'Divide the sheets by the number of faces of one box.') });
        }
        if (f === 3) {
          const n = R(rng, 2, 8);
          return Q(L(`${x} dùng que tính làm khung hình lập phương, mỗi cạnh là một que tính. Hỏi làm ${n} khung như thế cần bao nhiêu que tính?`, `${x} makes cube frames out of sticks, one stick for each edge. How many sticks are needed to make ${n} frames?`),
            num(12 * n), L(`Khối lập phương có 12 cạnh.\nSố que tính cần là: 12 × ${n} = ${12 * n} (que).`, `A cube has 12 edges.\nSticks needed: 12 × ${n} = ${12 * n} (sticks).`), { hint: L('Khối lập phương có mấy cạnh?', 'How many edges does a cube have?') });
        }
        if (f === 4) {
          const n = R(rng, 3, 12);
          return Q(L(`Cô giáo gắn một hạt cườm vào mỗi đỉnh của ${n} khối hộp chữ nhật. Hỏi cô cần bao nhiêu hạt cườm?`, `The teacher sticks one bead on each vertex (corner) of ${n} cuboids. How many beads does she need?`),
            num(8 * n), L(`Khối hộp chữ nhật có 8 đỉnh.\nSố hạt cườm cần là: 8 × ${n} = ${8 * n} (hạt).`, `A cuboid has 8 vertices.\nBeads needed: 8 × ${n} = ${8 * n} (beads).`), { hint: L('Khối hộp chữ nhật có mấy đỉnh?', 'How many vertices does a cuboid have?') });
        }
        const n = R(rng, 2, 7), e = R(rng, 3, 15);
        return Q(L(`${x} làm ${n} khung hình lập phương bằng que tính (mỗi cạnh một que) thì còn thừa ${e} que tính. Hỏi lúc đầu ${x} có bao nhiêu que tính?`, `${x} makes ${n} cube frames out of sticks (one stick for each edge) and has ${e} sticks left over. How many sticks did ${x} have at the start?`),
          num(12 * n + e), L(`Bước 1: Khối lập phương có 12 cạnh. Số que đã dùng là: 12 × ${n} = ${12 * n} (que).\nBước 2: Lúc đầu ${x} có: ${12 * n} + ${e} = ${12 * n + e} (que).`, `Step 1: a cube has 12 edges. Sticks used: 12 × ${n} = ${12 * n} (sticks).\nStep 2: at the start ${x} had ${12 * n} + ${e} = ${12 * n + e} (sticks).`),
          { hint: L('Khối lập phương có 12 cạnh.', 'A cube has 12 edges.') });
      },
    },
    { // remainders: the largest remainder, the dividend from quotient and remainder, the number of boxes needed
      id: 'g3-phep-chia-co-du', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c4-b25',
      gen: rng => {
        const f = R(rng, 0, 3);
        if (f === 0) {
          const b = R(rng, 3, 9), q = R(rng, 12, Math.floor((1000 - b) / b)), a = q * b + b - 1;
          return Q(L(`Trong một phép chia có số chia là ${b}, thương là ${q} và số dư là số dư lớn nhất có thể. Tìm số bị chia.`, `In a division, the divisor is ${b}, the quotient is ${q} and the remainder is the largest remainder possible. Find the dividend.`),
            num(a), L(`Số dư luôn bé hơn số chia, nên số dư lớn nhất là ${b} ${M} 1 = ${b - 1}.\nSố bị chia là: ${q} × ${b} + ${b - 1} = ${q * b} + ${b - 1} = ${a}.`, `The remainder is always smaller than the divisor, so the largest remainder is ${b} ${M} 1 = ${b - 1}.\nThe dividend is ${q} × ${b} + ${b - 1} = ${q * b} + ${b - 1} = ${a}.`),
            { hint: L('Số bị chia = thương × số chia + số dư.', 'Dividend = quotient × divisor + remainder.') });
        }
        if (f === 1) {
          const b = R(rng, 3, 9), r = R(rng, 1, b - 1), q = R(rng, 12, Math.floor((999 - r) / b)), a = q * b + r;
          return Q(L(`Tìm số bị chia:\n? : ${b} = ${q} (dư ${r})`, `Find the dividend:\n? : ${b} = ${q} (remainder ${r})`), num(a),
            L(`Số bị chia = thương × số chia + số dư.\n? = ${q} × ${b} + ${r} = ${q * b} + ${r} = ${a}.`, `Dividend = quotient × divisor + remainder.\n? = ${q} × ${b} + ${r} = ${q * b} + ${r} = ${a}.`),
            { hint: L('Lấy thương nhân với số chia rồi cộng số dư.', 'Multiply the quotient by the divisor, then add the remainder.') });
        }
        const b = R(rng, 4, 9), q = R(rng, Math.ceil(100 / b), Math.floor(400 / b)), r = R(rng, 1, b - 1), N = q * b + r;
        if (f === 2) {
          const [vi, en, u, uE] = P(rng, [
            [`Có ${N} học sinh đi tham quan bằng thuyền, mỗi thuyền chở được ${b} bạn. Hỏi cần ít nhất bao nhiêu chiếc thuyền để chở hết các bạn?`, `${N} pupils go on a boat trip, and each boat can carry ${b} pupils. What is the smallest number of boats needed to carry all the pupils?`, 'thuyền', 'boats'],
            [`Có ${N} quả trứng, xếp vào các khay, mỗi khay ${b} quả. Hỏi cần ít nhất bao nhiêu cái khay để xếp hết số trứng đó?`, `There are ${N} eggs to put in trays, with ${b} eggs in each tray. What is the smallest number of trays needed for all the eggs?`, 'khay', 'trays'],
            [`Có ${N} quyển sách, xếp lên các ngăn tủ, mỗi ngăn ${b} quyển. Hỏi cần ít nhất bao nhiêu ngăn tủ để xếp hết số sách đó?`, `There are ${N} books to put on shelves, with ${b} books on each shelf. What is the smallest number of shelves needed for all the books?`, 'ngăn', 'shelves']]);
          return Q(L(vi, en), num(q + 1),
            L(`${N} : ${b} = ${q} (dư ${r}).\nXếp đủ ${q} ${u} thì còn thừa ${r}, cần thêm 1 ${u} nữa.\nSố ${u} cần ít nhất là: ${q} + 1 = ${q + 1} (${u}).`, `${N} : ${b} = ${q} (remainder ${r}).\n${q} full ${uE} leave ${r} over, which need 1 more.\nThe smallest number of ${uE}: ${q} + 1 = ${q + 1}.`),
            { hint: L('Phần còn thừa cũng cần chỗ.', 'What is left over needs a place too.') });
        }
        return Q(L(`Cô bán hàng xếp ${N} quả cam vào các hộp, mỗi hộp ${b} quả. Hỏi cô xếp được nhiều nhất bao nhiêu hộp đầy cam?`, `A shopkeeper puts ${N} oranges into boxes, with ${b} oranges in each box. What is the largest number of full boxes she can make?`),
          num(q), L(`${N} : ${b} = ${q} (dư ${r}).\nCô xếp được nhiều nhất ${q} hộp đầy, còn thừa ${r} quả cam.`, `${N} : ${b} = ${q} (remainder ${r}).\nShe can fill at most ${q} boxes, with ${r} ${r === 1 ? 'orange' : 'oranges'} left over.`),
          { hint: L('Số quả còn thừa không đủ một hộp.', 'The oranges left over are not enough for a box.') });
      },
    },
    { // "gấp mấy lần" after a first step, or of a number given by a condition
      id: 'g3-gap-may-lan', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c6-b39',
      gen: rng => {
        const f = R(rng, 0, 3);
        if (f === 0) {
          const a = R(rng, 3, 9), k = R(rng, 2, 9), d = a * (k - 1);   // lớp 3: divide by a one-digit number
          return Q(L(`Đàn gà có ${a} con gà trống, số gà mái nhiều hơn số gà trống ${d} con. Hỏi số gà mái gấp mấy lần số gà trống?`, `A flock has ${a} cockerels. There are ${d} more hens than cockerels. How many times as many hens as cockerels are there?`),
            num(k, LAN), L(`Bước 1: Số gà mái là: ${a} + ${d} = ${a * k} (con).\nBước 2: ${a * k} : ${a} = ${k} (lần).`, `Step 1: number of hens: ${a} + ${d} = ${a * k}.\nStep 2: ${a * k} : ${a} = ${k} (times).`),
            { hint: L('Tìm số gà mái trước, rồi lấy số lớn chia cho số bé.', 'Find the number of hens first, then divide the larger number by the smaller.') });
        }
        if (f === 1) {
          const x = NC.name(rng), [c, k] = find(() => [R(rng, 4, 9), R(rng, 4, 8)], ([c, k]) => c * k >= 25 && c * k <= 48, [6, 5]), d = c * (k - 1);
          return Q(L(`Năm nay ${x} ${c} tuổi, mẹ hơn ${x} ${d} tuổi. Hỏi tuổi mẹ gấp mấy lần tuổi ${x}?`, `This year ${x} is ${c} years old, and Mum is ${d} years older than ${x}. How many times as old as ${x} is Mum?`),
            num(k, LAN), L(`Bước 1: Tuổi mẹ là: ${c} + ${d} = ${c * k} (tuổi).\nBước 2: ${c * k} : ${c} = ${k} (lần).`, `Step 1: Mum's age: ${c} + ${d} = ${c * k} (years).\nStep 2: ${c * k} : ${c} = ${k} (times).`),
            { hint: L('Tìm tuổi mẹ trước.', 'Find Mum\'s age first.') });
        }
        if (f === 2) {
          const [v, vi, en, ds] = P(rng, [
            [99, 'số lớn nhất có hai chữ số', 'the largest 2-digit number', [3, 9]],
            [90, 'số tròn chục lớn nhất có hai chữ số', 'the largest 2-digit multiple of ten', [2, 3, 5, 6, 9]],
            [98, 'số lớn nhất có hai chữ số khác nhau', 'the largest 2-digit number with different digits', [2, 7]],
            [999, 'số lớn nhất có ba chữ số', 'the largest 3-digit number', [3, 9]],
            [900, 'số tròn trăm lớn nhất có ba chữ số', 'the largest 3-digit multiple of a hundred', [2, 3, 4, 5, 6, 9]],
            [100, 'số bé nhất có ba chữ số', 'the smallest 3-digit number', [2, 4, 5]],
            [102, 'số bé nhất có ba chữ số khác nhau', 'the smallest 3-digit number with all different digits', [2, 3, 6]],
            [987, 'số lớn nhất có ba chữ số khác nhau', 'the largest 3-digit number with all different digits', [3, 7]]]);
          const b = P(rng, ds), k = v / b;
          return Q(L(`${cap(vi)} gấp mấy lần số ${b}?`, `How many times ${b} is ${en}?`), num(k, LAN),
            L(`${cap(vi)} là ${v}.\n${v} : ${b} = ${k}. Vậy ${v} gấp ${k} lần ${b}.`, `${cap(en)} is ${v}.\n${v} : ${b} = ${k}. So ${v} is ${k} times ${b}.`),
            { hint: L('Tìm số đó trước, rồi lấy số lớn chia cho số bé.', 'Find the number first, then divide the larger number by the smaller.') });
        }
        const c = R(rng, 2, 9), k = R(rng, 2, 9), a = c * (k + 1);
        return Q(L(`Một sợi dây dài ${a} m. Người ta cắt đi ${c} m. Hỏi phần dây còn lại dài gấp mấy lần phần dây đã cắt đi?`, `A rope is ${a} m long. ${c} m is cut off. How many times as long as the piece cut off is the rope that is left?`),
          num(k, LAN), L(`Bước 1: Phần dây còn lại dài: ${a} ${M} ${c} = ${c * k} (m).\nBước 2: ${c * k} : ${c} = ${k} (lần).`, `Step 1: the rope left: ${a} ${M} ${c} = ${c * k} (m).\nStep 2: ${c * k} : ${c} = ${k} (times).`),
          { hint: L('Tìm phần dây còn lại trước.', 'First find how much rope is left.') });
      },
    },
    { // millilitres: 1 l = 1000 ml inside a two-step problem
      id: 'g3-mi-li-lit', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c5-b32',
      gen: rng => {
        const f = R(rng, 0, 2), x = NC.name(rng);
        if (f === 0) {
          const [a, b, k] = find(() => [R(rng, 20, 80) * 10, R(rng, 5, 30) * 10, R(rng, 2, 9)], ([a, b, k]) => a + b <= 1000 && (a + b) % k === 0 && (a + b) / k >= 50, [400, 200, 3]);
          return Q(L(`Mẹ pha một bình nước chanh gồm ${a} ml nước lọc và ${b} ml nước cốt chanh, rồi rót đều vào ${k} cốc. Hỏi mỗi cốc có bao nhiêu mi-li-lít nước chanh?`, `Mum makes a jug of lemonade from ${a} ml of water and ${b} ml of lemon juice, then pours it equally into ${k} glasses. How many millilitres of lemonade are in each glass?`),
            num((a + b) / k, 'ml'), L(`Bước 1: Bình nước chanh có: ${a} + ${b} = ${a + b} (ml).\nBước 2: Mỗi cốc có: ${a + b} : ${k} = ${(a + b) / k} (ml).`, `Step 1: the jug holds ${a} + ${b} = ${a + b} (ml).\nStep 2: each glass has ${a + b} : ${k} = ${(a + b) / k} (ml).`),
            { hint: L('Tìm cả bình có bao nhiêu mi-li-lít trước.', 'First find how many millilitres are in the whole jug.') });
        }
        if (f === 1) {
          const k = R(rng, 2, 9), q = R(rng, Math.max(20, Math.ceil(100 / k)), Math.floor(990 / (k + 1))), A = q * k;
          const sum = R(rng, 0, 1) === 1, ans = sum ? A + q : A - q, Avi = `${A} ml`;
          return Q(L(`Can thứ nhất có ${Avi} dầu ăn. Số dầu ăn ở can thứ hai bằng số dầu ăn ở can thứ nhất giảm đi ${k} lần. Hỏi ${sum ? 'cả hai can có bao nhiêu mi-li-lít dầu ăn' : 'can thứ nhất có nhiều hơn can thứ hai bao nhiêu mi-li-lít dầu ăn'}?`, `The first can holds ${Avi} of cooking oil. The amount of oil in the second can is the amount in the first can made ${k} times smaller. ${sum ? 'How many millilitres of oil do the two cans hold altogether' : 'How many more millilitres of oil does the first can hold than the second'}?`),
            num(ans, 'ml'),
            L(`Bước 1: Can thứ hai có: ${A} : ${k} = ${q} (ml).\nBước 2: ${sum ? `Cả hai can có: ${A} + ${q}` : `Can thứ nhất nhiều hơn: ${A} ${M} ${q}`} = ${ans} (ml).`, `Step 1: the second can holds ${A} : ${k} = ${q} (ml).\nStep 2: ${sum ? `both cans hold ${A} + ${q}` : `the first can holds ${A} ${M} ${q}`} = ${ans} (ml)${sum ? '' : ' more'}.`),
            { hint: L('Giảm đi một số lần thì chia. Tìm số dầu ở can thứ hai trước.', 'Times smaller means divide. First find the oil in the second can.') });
        }
        const c = R(rng, 8, 14) * 10;
        return Q(L(`Một hộp nước cam có 1 l. Mỗi ngày ${x} uống ${c} ml nước cam. Hỏi sau 1 tuần, hộp nước cam còn lại bao nhiêu mi-li-lít?`, `A carton holds 1 l of orange juice. ${x} drinks ${c} ml of orange juice every day. How many millilitres of juice are left in the carton after 1 week?`),
          num(1000 - 7 * c, 'ml'), L(`Đổi: 1 l = 1000 ml; 1 tuần = 7 ngày.\nBước 1: Trong 1 tuần ${x} uống: ${c} × 7 = ${7 * c} (ml).\nBước 2: Còn lại: 1000 ${M} ${7 * c} = ${1000 - 7 * c} (ml).`, `1 l = 1000 ml and 1 week = 7 days.\nStep 1: in 1 week ${x} drinks ${c} × 7 = ${7 * c} (ml).\nStep 2: left: 1000 ${M} ${7 * c} = ${1000 - 7 * c} (ml).`),
          { hint: L('1 tuần có 7 ngày; 1 l = 1000 ml.', '1 week has 7 days; 1 l = 1000 ml.') });
      },
    },
    { // grams: 1 kg = 1000 g inside a two-step problem
      id: 'g3-gam', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c5-b31',
      gen: rng => {
        const f = R(rng, 0, 3);
        if (f === 0) {
          const [a, k] = find(() => [R(rng, 5, 40) * 10, R(rng, 2, 9)], ([a, k]) => (1000 - a) % k === 0, [100, 6]), w = 1000 - a;
          return Q(L(`Một hộp bánh nặng 1 kg, trong đó vỏ hộp nặng ${a} g. Số bánh trong hộp được chia đều thành ${k} gói. Hỏi mỗi gói bánh nặng bao nhiêu gam?`, `A box of biscuits weighs 1 kg, and the empty box weighs ${a} g. The biscuits are shared equally into ${k} packs. How many grams does each pack weigh?`),
            num(w / k, 'g'), L(`Đổi: 1 kg = 1000 g.\nBước 1: Số bánh nặng: 1000 ${M} ${a} = ${w} (g).\nBước 2: Mỗi gói nặng: ${w} : ${k} = ${w / k} (g).`, `1 kg = 1000 g.\nStep 1: the biscuits weigh 1000 ${M} ${a} = ${w} (g).\nStep 2: each pack weighs ${w} : ${k} = ${w / k} (g).`),
            { hint: L('Đổi 1 kg ra gam, rồi bớt vỏ hộp.', 'Change 1 kg to grams, then take away the box.') });
        }
        if (f === 1) {
          const k = R(rng, 2, 6), a = R(rng, 8, Math.floor(200 / (k + 1))) * 5;
          return Q(L(`Gói kẹo nặng ${a} g, gói bánh nặng gấp ${k} lần gói kẹo. Hỏi cả hai gói nặng bao nhiêu gam?`, `A bag of sweets weighs ${a} g. A packet of cakes weighs ${k} times as much as the bag of sweets. How many grams do the two weigh altogether?`),
            num(a * (k + 1), 'g'), L(`Bước 1: Gói bánh nặng: ${a} × ${k} = ${a * k} (g).\nBước 2: Cả hai gói nặng: ${a} + ${a * k} = ${a * (k + 1)} (g).`, `Step 1: the packet of cakes weighs ${a} × ${k} = ${a * k} (g).\nStep 2: together they weigh ${a} + ${a * k} = ${a * (k + 1)} (g).`),
            { hint: L('Tìm cân nặng gói bánh trước.', 'First find how much the packet of cakes weighs.') });
        }
        if (f === 2) {
          const a = R(rng, 10, 50) * 10, b = R(rng, 5, Math.min(40, 95 - a / 10)) * 10;
          return Q(L(`Mẹ mua 1 kg đường. Mẹ dùng ${a} g đường để làm bánh và ${b} g đường để pha nước chanh. Hỏi mẹ còn lại bao nhiêu gam đường?`, `Mum buys 1 kg of sugar. She uses ${a} g to make a cake and ${b} g to make lemonade. How many grams of sugar does Mum have left?`),
            num(1000 - a - b, 'g'), L(`Đổi: 1 kg = 1000 g.\nBước 1: Mẹ đã dùng: ${a} + ${b} = ${a + b} (g).\nBước 2: Mẹ còn lại: 1000 ${M} ${a + b} = ${1000 - a - b} (g).`, `1 kg = 1000 g.\nStep 1: Mum uses ${a} + ${b} = ${a + b} (g).\nStep 2: she has 1000 ${M} ${a + b} = ${1000 - a - b} (g) left.`),
            { hint: L('1 kg = 1000 g.', '1 kg = 1000 g.') });
        }
        const A = R(rng, 30, 50) * 10, d = R(rng, 5, 25) * 10;
        return Q(L(`Quả xoài nặng ${A} g, quả cam nhẹ hơn quả xoài ${d} g. Hỏi cả hai quả nặng bao nhiêu gam?`, `A mango weighs ${A} g. An orange is ${d} g lighter than the mango. How many grams do the two fruits weigh altogether?`),
          num(2 * A - d, 'g'), L(`Bước 1: Quả cam nặng: ${A} ${M} ${d} = ${A - d} (g).\nBước 2: Cả hai quả nặng: ${A} + ${A - d} = ${2 * A - d} (g).`, `Step 1: the orange weighs ${A} ${M} ${d} = ${A - d} (g).\nStep 2: together they weigh ${A} + ${A - d} = ${2 * A - d} (g).`),
          { hint: L('Tìm cân nặng quả cam trước.', 'First find how much the orange weighs.') });
      },
    },
    { // millimetres: cm ↔ mm inside a two-step problem
      id: 'g3-mi-li-met', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c5-b30',
      gen: rng => {
        const f = R(rng, 0, 3), x = NC.name(rng);
        if (f === 0) {
          const c = R(rng, 3, 15), d = find(() => R(rng, 5, 10 * c - 5), v => v % 10 !== 0, 7);
          return Q(L(`Đoạn thẳng AB dài ${c} cm. Đoạn thẳng CD ngắn hơn đoạn thẳng AB ${d} mm. Hỏi đoạn thẳng CD dài bao nhiêu mi-li-mét?`, `Line AB is ${c} cm long. Line CD is ${d} mm shorter than line AB. How many millimetres long is line CD?`),
            num(10 * c - d, 'mm'), L(`Bước 1: Đổi ${c} cm = ${10 * c} mm.\nBước 2: Đoạn thẳng CD dài: ${10 * c} ${M} ${d} = ${10 * c - d} (mm).`, `Step 1: ${c} cm = ${10 * c} mm.\nStep 2: line CD is ${10 * c} ${M} ${d} = ${10 * c - d} (mm) long.`),
            { hint: L('1 cm = 10 mm. Đổi về cùng đơn vị trước.', '1 cm = 10 mm. Change to the same unit first.') });
        }
        if (f === 1) {
          const [e, k] = find(() => [R(rng, 2, 9), R(rng, 2, 20)], ([e, k]) => (e * k) % 10 === 0 && e * k <= 150, [5, 8]), c = e * k / 10;
          return Q(L(`Đoạn thẳng AB dài ${c} cm, đoạn thẳng CD dài ${e} mm. Hỏi đoạn thẳng AB dài gấp mấy lần đoạn thẳng CD?`, `Line AB is ${c} cm long and line CD is ${e} mm long. How many times as long as line CD is line AB?`),
            num(k, LAN), L(`Bước 1: Đổi ${c} cm = ${10 * c} mm.\nBước 2: ${10 * c} : ${e} = ${k} (lần).`, `Step 1: ${c} cm = ${10 * c} mm.\nStep 2: ${10 * c} : ${e} = ${k} (times).`),
            { hint: L('Đổi về cùng đơn vị mi-li-mét trước.', 'Change both lengths to millimetres first.') });
        }
        if (f === 2) {
          const [c, n, s] = find(() => [R(rng, 10, 50), R(rng, 2, 6), R(rng, 15, 60)], ([c, n, s]) => 10 * c - n * s >= 10, [30, 4, 45]);
          return Q(L(`Sợi ruy băng dài ${c} cm. ${x} cắt ra ${n} đoạn, mỗi đoạn dài ${s} mm. Hỏi sợi ruy băng còn lại dài bao nhiêu mi-li-mét?`, `A ribbon is ${c} cm long. ${x} cuts off ${n} pieces, each ${s} mm long. How many millimetres of ribbon are left?`),
            num(10 * c - n * s, 'mm'), L(`Đổi: ${c} cm = ${10 * c} mm.\nBước 1: ${x} đã cắt: ${s} × ${n} = ${n * s} (mm).\nBước 2: Còn lại: ${10 * c} ${M} ${n * s} = ${10 * c - n * s} (mm).`, `${c} cm = ${10 * c} mm.\nStep 1: ${x} cuts off ${s} × ${n} = ${n * s} (mm).\nStep 2: left: ${10 * c} ${M} ${n * s} = ${10 * c - n * s} (mm).`),
            { hint: L('1 cm = 10 mm.', '1 cm = 10 mm.') });
        }
        const [a, k] = find(() => [R(rng, 12, 45), R(rng, 2, 6)], ([a, k]) => (a * k) % 10 === 0, [15, 4]);
        return Q(L(`Con sâu dài ${a} mm, con rết dài gấp ${k} lần con sâu. Hỏi con rết dài bao nhiêu xăng-ti-mét?`, `A caterpillar is ${a} mm long. A centipede is ${k} times as long as the caterpillar. How many centimetres long is the centipede?`),
          num(a * k / 10, 'cm'), L(`Bước 1: Con rết dài: ${a} × ${k} = ${a * k} (mm).\nBước 2: Đổi ${a * k} mm = ${a * k / 10} cm.`, `Step 1: the centipede is ${a} × ${k} = ${a * k} (mm) long.\nStep 2: ${a * k} mm = ${a * k / 10} cm.`),
          { hint: L('10 mm = 1 cm.', '10 mm = 1 cm.') });
      },
    },
    { // circles and midpoints with lengths in cm and mm
      id: 'g3-hinh-tron-trung-diem', from: 'cuoi-hk1', kinds: ['tn', 'tl'], lesson: 'g3-c3-b17',
      gen: rng => {
        const f = R(rng, 0, 2);
        if (f === 0) {
          const c = R(rng, 1, 5), m = R(rng, 1, 9), r = 10 * c + m;
          return Q(L(`Hình tròn tâm O có bán kính ${c} cm ${m} mm. Hỏi đường kính của hình tròn dài bao nhiêu mi-li-mét?`, `A circle with centre O has a radius of ${c} cm ${m} mm. How many millimetres long is its diameter?`),
            num(2 * r, 'mm'), L(`Bước 1: Đổi ${c} cm ${m} mm = ${r} mm.\nBước 2: Đường kính gấp 2 lần bán kính: ${r} × 2 = ${2 * r} (mm).`, `Step 1: ${c} cm ${m} mm = ${r} mm.\nStep 2: the diameter is 2 times the radius: ${r} × 2 = ${2 * r} (mm).`),
            { hint: L('Đường kính gấp 2 lần bán kính.', 'The diameter is 2 times the radius.'), visual: { type: 'shape', params: { kind: 'circle', label: 'O' } } });
        }
        if (f === 1) {
          const c = R(rng, 2, 19);
          return Q(L(`Hình tròn tâm O có bán kính OA dài ${c} cm. M là trung điểm của đoạn thẳng OA. Hỏi đoạn thẳng OM dài bao nhiêu mi-li-mét?`, `A circle with centre O has a radius OA of ${c} cm. M is the midpoint of the line segment OA. How many millimetres long is OM?`),
            num(5 * c, 'mm'), L(`Bước 1: Đổi ${c} cm = ${10 * c} mm.\nBước 2: M là trung điểm của OA nên OM = ${10 * c} : 2 = ${5 * c} (mm).`, `Step 1: ${c} cm = ${10 * c} mm.\nStep 2: M is the midpoint of OA, so OM = ${10 * c} : 2 = ${5 * c} (mm).`),
            { hint: L('Trung điểm chia đoạn thẳng thành hai phần bằng nhau.', 'The midpoint splits a line segment into two equal parts.') });
        }
        const c = R(rng, 3, 12) * 2;
        return Q(L(`Đoạn thẳng AB dài ${c} cm, M là trung điểm của AB. Vẽ hình tròn tâm M, bán kính MA. Hỏi đường kính của hình tròn đó dài bao nhiêu mi-li-mét?`, `Line AB is ${c} cm long and M is its midpoint. A circle is drawn with centre M and radius MA. How many millimetres long is the diameter of the circle?`),
          num(10 * c, 'mm'), L(`Bước 1: Bán kính MA = ${c} : 2 = ${c / 2} (cm), nên đường kính = ${c / 2} × 2 = ${c} (cm). (Đường kính chính là đoạn AB.)\nBước 2: Đổi ${c} cm = ${10 * c} mm.`, `Step 1: the radius MA = ${c} : 2 = ${c / 2} (cm), so the diameter = ${c / 2} × 2 = ${c} (cm). (The diameter is the line AB itself.)\nStep 2: ${c} cm = ${10 * c} mm.`),
          { hint: L('Bán kính là MA. Đường kính gấp 2 lần bán kính.', 'The radius is MA. The diameter is 2 times the radius.') });
      },
    },

    /* ================= Cuối năm · Đặt tính rồi tính ================= */
    { // five-digit addition with three or more carries
      id: 'g3-dt-cong-nam-chu-so', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g3-c12-b63',
      gen: rng => {
        const [a, b] = find(() => { const a = R(rng, 10000, 89999); return [a, R(rng, 1000, Math.min(69999, 99999 - a))]; },
          ([a, b]) => a + b <= 99999 && addCarries(a, b) >= 3, [46857, 37465]);
        return NC.dt(a, b, '+', a + b, addSteps(a, b));
      },
    },
    { // five-digit subtraction borrowing across zeros: 20 006 − 9 856, 40 300 − 18 527
      id: 'g3-dt-tru-nam-chu-so', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g3-c12-b64',
      gen: rng => {
        const [a, b] = find(() => {
          let a = R(rng, 2, 9);
          for (let j = 0; j < 4; j++) a = a * 10 + (R(rng, 0, 9) < 6 ? 0 : R(rng, 1, 9));
          return [a, R(rng, 1000, Math.max(1000, a - 10000))];
        }, ([a, b]) => { const z = String(a).slice(1).split('').filter(d => d === '0').length, s = subBorrows(a, b); return z >= 2 && s.n >= 2 && s.z >= 1 && a - b >= 10000; }, [20006, 9856]);
        return NC.dt(a, b, M, a - b, subSteps(a, b));
      },
    },
    { // five-digit × one digit with several carries: 16 659 × 3
      id: 'g3-dt-nhan-nam-chu-so', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g3-c14-b70',
      gen: rng => {
        const [a, b] = find(() => { const b = R(rng, 2, 9); return [R(rng, 10000, Math.floor(99999 / b)), b]; },
          ([a, b]) => a * b <= 99999 && (mulCarries(a, b) >= 3 || (String(a).slice(1).includes('0') && mulCarries(a, b) >= 2)), [16659, 3]);
        return NC.dt(a, b, '×', a * b, mulSteps(a, b));
      },
    },
    { // five-digit : one digit, exact, with a 0 in the quotient: 36 024 : 6, 45 270 : 9
      id: 'g3-dt-chia-nam-chu-so', from: 'cuoi-nam', kinds: ['dt'], lesson: 'g3-c14-b71',
      gen: rng => {
        const [q, b] = find(() => { const b = R(rng, 3, 9); return [R(rng, Math.ceil(10000 / b), Math.floor(99999 / b)), b]; },
          ([q, b]) => String(q).includes('0') && q % 1000 !== 0 && remSteps(q * b, b) >= 1, [6004, 6]);
        return NC.dt(q * b, b, ':', q, divSteps(q * b, b));
      },
    },

    /* ================= Cuối năm · trắc nghiệm / tự luận ================= */
    { // missing numbers with large numbers: "…… : 6 = 3 051 (dư 3)"
      id: 'g3-tim-thanh-phan-so-lon', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c14-b71',
      gen: rng => {
        const f = R(rng, 0, 4), T = L('Tìm số thích hợp thay cho dấu ?:', 'Find the missing number:');
        if (f === 0) {
          const b = R(rng, 3, 9), r = R(rng, 1, b - 1), q = R(rng, 1000, Math.floor((99999 - r) / b)), a = q * b + r;
          return Q(L(`${T}\n? : ${b} = ${F(q)} (dư ${r})`, `${T}\n? : ${b} = ${F(q)} (remainder ${r})`), num(a),
            L(`Số bị chia = thương × số chia + số dư.\n? = ${F(q)} × ${b} + ${r} = ${F(q * b)} + ${r} = ${F(a)}.`, `Dividend = quotient × divisor + remainder.\n? = ${F(q)} × ${b} + ${r} = ${F(q * b)} + ${r} = ${F(a)}.`),
            { hint: L('Lấy thương nhân với số chia rồi cộng số dư.', 'Multiply the quotient by the divisor, then add the remainder.') });
        }
        if (f === 1) {
          const b = R(rng, 2, 9), x = R(rng, 1000, Math.floor(99999 / b));
          return Q(`${T}\n${b} × ? = ${F(x * b)}`, num(x), L(`Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số kia.\n? = ${F(x * b)} : ${b} = ${F(x)}.`, `To find a missing factor, divide the product by the other factor.\n? = ${F(x * b)} : ${b} = ${F(x)}.`));
        }
        if (f === 2) {
          const d = R(rng, 2, 9), x = R(rng, 1000, Math.floor(99999 / d));
          return Q(`${T}\n${F(x * d)} : ? = ${d}`, num(x), L(`Muốn tìm số chia, ta lấy số bị chia chia cho thương.\n? = ${F(x * d)} : ${d} = ${F(x)}.`, `To find the divisor, divide the dividend by the quotient.\n? = ${F(x * d)} : ${d} = ${F(x)}.`));
        }
        if (f === 3) {
          const b = R(rng, 2, 9), x = R(rng, 1000, Math.floor(90000 / b)), t = x * b, c = R(rng, t + 100, 99999), e = c - t;
          return Q(`${T}\n? × ${b} = ${F(c)} ${M} ${F(e)}`, num(x), L(`Tính vế phải trước: ${F(c)} ${M} ${F(e)} = ${F(t)}.\n? × ${b} = ${F(t)}, ? = ${F(t)} : ${b} = ${F(x)}.`, `Work out the right-hand side first: ${F(c)} ${M} ${F(e)} = ${F(t)}.\n? × ${b} = ${F(t)}, so ? = ${F(t)} : ${b} = ${F(x)}.`));
        }
        const b = R(rng, 2, 9), t = R(rng, 1200, Math.floor(99999 / b)), c = R(rng, 1000, t - 100);
        return Q(`${T}\n? : ${b} = ${F(c)} + ${F(t - c)}`, num(t * b), L(`Tính vế phải trước: ${F(c)} + ${F(t - c)} = ${F(t)}.\n? : ${b} = ${F(t)}, ? = ${F(t)} × ${b} = ${F(t * b)}.`, `Work out the right-hand side first: ${F(c)} + ${F(t - c)} = ${F(t)}.\n? : ${b} = ${F(t)}, so ? = ${F(t)} × ${b} = ${F(t * b)}.`));
      },
    },
    { // numbers given by conditions: "hiệu của số lớn nhất có 5 chữ số khác nhau và số bé nhất có ba chữ số"
      id: 'g3-so-theo-dieu-kien', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c11-b59',
      gen: rng => {
        if (R(rng, 0, 2) > 0) {
          const BIG = [[99999, 'số lớn nhất có năm chữ số', 'the largest 5-digit number'], [98765, 'số lớn nhất có năm chữ số khác nhau', 'the largest 5-digit number with all different digits'],
            [99000, 'số tròn nghìn lớn nhất có năm chữ số', 'the largest 5-digit multiple of 1000'], [90000, 'số tròn chục nghìn lớn nhất có năm chữ số', 'the largest 5-digit multiple of 10 000'],
            [10000, 'số bé nhất có năm chữ số', 'the smallest 5-digit number'], [10234, 'số bé nhất có năm chữ số khác nhau', 'the smallest 5-digit number with all different digits'],
            [99900, 'số tròn trăm lớn nhất có năm chữ số', 'the largest 5-digit multiple of 100']];
          const SMALL = [[100, 'số bé nhất có ba chữ số', 'the smallest 3-digit number'], [999, 'số lớn nhất có ba chữ số', 'the largest 3-digit number'],
            [1000, 'số bé nhất có bốn chữ số', 'the smallest 4-digit number'], [9999, 'số lớn nhất có bốn chữ số', 'the largest 4-digit number'],
            [1023, 'số bé nhất có bốn chữ số khác nhau', 'the smallest 4-digit number with all different digits'], [9876, 'số lớn nhất có bốn chữ số khác nhau', 'the largest 4-digit number with all different digits'],
            [102, 'số bé nhất có ba chữ số khác nhau', 'the smallest 3-digit number with all different digits'], [987, 'số lớn nhất có ba chữ số khác nhau', 'the largest 3-digit number with all different digits'],
            [99, 'số lớn nhất có hai chữ số', 'the largest 2-digit number'], [10, 'số bé nhất có hai chữ số', 'the smallest 2-digit number']];
          const big = P(rng, BIG), small = P(rng, SMALL), sum = big[0] + small[0] <= 99999 && R(rng, 0, 2) === 0;
          const v = sum ? big[0] + small[0] : big[0] - small[0];
          return Q(L(sum ? `Tìm tổng của ${big[1]} và ${small[1]}.` : `Tìm hiệu của ${big[1]} và ${small[1]}.`, sum ? `Find the sum of ${big[2]} and ${small[2]}.` : `Find the difference between ${big[2]} and ${small[2]}.`), num(v),
            L(`${cap(big[1])} là ${F(big[0])}.\n${cap(small[1])} là ${F(small[0])}.\n${sum ? 'Tổng' : 'Hiệu'}: ${F(big[0])} ${sum ? '+' : M} ${F(small[0])} = ${F(v)}.`, `${cap(big[2])} is ${F(big[0])}.\n${cap(small[2])} is ${F(small[0])}.\n${sum ? 'Sum' : 'Difference'}: ${F(big[0])} ${sum ? '+' : M} ${F(small[0])} = ${F(v)}.`),
            { hint: L('Viết từng số ra trước rồi mới tính.', 'Write each number in digits first, then calculate.') });
        }
        const ds = U.sample(rng, [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 6).filter((d, j, a) => a.indexOf(d) === j).slice(0, 5);
        while (ds.length < 5) ds.push([1, 2, 3, 4, 5, 6, 7, 8, 9].find(d => !ds.includes(d)));
        const desc = ds.slice().sort((a, b) => b - a), asc = ds.slice().sort((a, b) => a - b);
        const first = asc.find(d => d > 0), minD = [first].concat(asc.filter((d, j) => j !== asc.indexOf(first)));
        const max = Number(desc.join('')), min = Number(minD.join('')), askMin = R(rng, 0, 2) === 0;
        const list = L(ds.join(', '), ds.slice(0, 4).join(', ') + ' and ' + ds[4]);
        const minWhy = ds.includes(0) ? L(`Số bé nhất: chữ số 0 không được đứng đầu, nên viết chữ số bé nhất khác 0 (${first}) trước, rồi các chữ số còn lại từ bé đến lớn: ${F(min)}.`, `Smallest: 0 cannot be the first digit, so start with the smallest digit that is not 0 (${first}), then the other digits from smallest to largest: ${F(min)}.`)
          : L(`Số bé nhất: viết các chữ số từ bé đến lớn: ${F(min)}.`, `Smallest: write the digits from smallest to largest: ${F(min)}.`);
        if (askMin) {
          return Q(L(`Dùng cả năm chữ số ${list} (mỗi chữ số dùng một lần), viết số bé nhất có năm chữ số.`, `Use all five digits ${list} (each digit once) to make the smallest 5-digit number.`), num(min), minWhy,
            { hint: L('Chữ số 0 không đứng đầu một số.', 'A number cannot start with 0.') });
        }
        return Q(L(`Dùng cả năm chữ số ${list} (mỗi chữ số dùng một lần) để viết các số có năm chữ số. Tìm hiệu của số lớn nhất và số bé nhất viết được.`, `Use all five digits ${list} (each digit once) to make 5-digit numbers. Find the difference between the largest and the smallest number you can make.`),
          num(max - min), L(`Số lớn nhất: viết các chữ số từ lớn đến bé: ${F(max)}.\n${minWhy}\nHiệu: ${F(max)} ${M} ${F(min)} = ${F(max - min)}.`, `Largest: write the digits from largest to smallest: ${F(max)}.\n${minWhy}\nDifference: ${F(max)} ${M} ${F(min)} = ${F(max - min)}.`),
          { hint: L('Chữ số 0 không đứng đầu một số.', 'A number cannot start with 0.') });
      },
    },
    { // money in two steps: change, a price from two totals, savings, a bill of two kinds
      id: 'g3-tien-hai-buoc', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c13-b68',
      gen: rng => {
        const f = R(rng, 0, 3), x = NC.name(rng), D = L('đồng', 'dong');
        if (f === 0) {
          const it = P(rng, [['quyển vở', 'exercise books', 'quyển', 'each', 10, 24], ['cái bút bi', 'ballpoint pens', 'cái', 'each', 6, 14], ['hộp sữa', 'cartons of milk', 'hộp', 'each', 12, 20], ['ki-lô-gam cam', 'kilograms of oranges', 'ki-lô-gam', 'a kilogram', 30, 60]]);
          const [n, p] = find(() => [R(rng, 2, 5), R(rng, it[4], it[5]) * 500], ([n, p]) => n * p < 100000, [3, 8000]), t = n * p;
          const notes = [20000, 50000, 100000].filter(v => v > t), note = notes[notes.length > 1 && R(rng, 0, 2) === 0 ? 1 : 0];
          return Q(L(`${x} mua ${n} ${it[0]}, mỗi ${it[2]} giá ${F(p)} đồng. ${x} đưa cho cô bán hàng tờ ${F(note)} đồng. Hỏi cô bán hàng phải trả lại ${x} bao nhiêu tiền?`, `${x} buys ${n} ${it[1]} at ${F(p)} dong ${it[3]}. ${x} pays with a ${F(note)} dong note. How much change does ${x} get?`),
            num(note - t, D), L(`Bước 1: Số tiền phải trả là: ${F(p)} × ${n} = ${F(t)} (đồng).\nBước 2: Số tiền được trả lại là: ${F(note)} ${M} ${F(t)} = ${F(note - t)} (đồng).`, `Step 1: the cost is ${F(p)} × ${n} = ${F(t)} (dong).\nStep 2: the change is ${F(note)} ${M} ${F(t)} = ${F(note - t)} (dong).`),
            { hint: L('Tìm số tiền phải trả trước.', 'First find how much it costs.') });
        }
        if (f === 1) {
          const pp = R(rng, 6, 16) * 500, bp = R(rng, 10, 24) * 500, three = R(rng, 0, 1) === 1, np = three ? 3 : 2, t1 = np * pp + bp, t2 = pp + bp;
          const askBook = !three;
          return Q(L(`Mua ${np} cái bút và 1 quyển vở hết ${F(t1)} đồng. Mua 1 cái bút và 1 quyển vở như thế hết ${F(t2)} đồng. Hỏi ${askBook ? 'một quyển vở' : 'một cái bút'} giá bao nhiêu tiền?`, `${np} pens and 1 exercise book cost ${F(t1)} dong. 1 pen and 1 exercise book of the same kind cost ${F(t2)} dong. How much does one ${askBook ? 'exercise book' : 'pen'} cost?`),
            num(askBook ? bp : pp, D),
            three ? L(`Lần đầu mua nhiều hơn lần sau 2 cái bút.\nBước 1: Giá 2 cái bút là: ${F(t1)} ${M} ${F(t2)} = ${F(2 * pp)} (đồng).\nBước 2: Giá 1 cái bút là: ${F(2 * pp)} : 2 = ${F(pp)} (đồng).`, `The first time you buy 2 more pens.\nStep 1: 2 pens cost ${F(t1)} ${M} ${F(t2)} = ${F(2 * pp)} (dong).\nStep 2: 1 pen costs ${F(2 * pp)} : 2 = ${F(pp)} (dong).`)
              : L(`Lần đầu mua nhiều hơn lần sau 1 cái bút.\nBước 1: Giá 1 cái bút là: ${F(t1)} ${M} ${F(t2)} = ${F(pp)} (đồng).\nBước 2: Giá 1 quyển vở là: ${F(t2)} ${M} ${F(pp)} = ${F(bp)} (đồng).`, `The first time you buy 1 more pen.\nStep 1: 1 pen costs ${F(t1)} ${M} ${F(t2)} = ${F(pp)} (dong).\nStep 2: 1 exercise book costs ${F(t2)} ${M} ${F(pp)} = ${F(bp)} (dong).`),
            { hint: L('So sánh hai lần mua: lần đầu mua nhiều hơn mấy cái bút?', 'Compare the two lists: how many more pens are bought the first time?') });
        }
        if (f === 2) {
          const p = P(rng, [1000, 2000, 3000, 4000, 5000]), q = R(rng, 2, 7 * p / 500 - 2) * 500;
          return Q(L(`Mỗi ngày ${x} bỏ vào lợn đất ${F(p)} đồng. Sau 1 tuần, ${x} lấy hết số tiền đó mua một quyển truyện giá ${F(q)} đồng. Hỏi ${x} còn lại bao nhiêu tiền?`, `Every day ${x} puts ${F(p)} dong into a piggy bank. After 1 week, ${x} takes out all the money and buys a storybook for ${F(q)} dong. How much money does ${x} have left?`),
            num(7 * p - q, D), L(`1 tuần có 7 ngày.\nBước 1: Sau 1 tuần ${x} có: ${F(p)} × 7 = ${F(7 * p)} (đồng).\nBước 2: ${x} còn lại: ${F(7 * p)} ${M} ${F(q)} = ${F(7 * p - q)} (đồng).`, `1 week has 7 days.\nStep 1: after 1 week ${x} has ${F(p)} × 7 = ${F(7 * p)} (dong).\nStep 2: ${x} has ${F(7 * p)} ${M} ${F(q)} = ${F(7 * p - q)} (dong) left.`),
            { hint: L('1 tuần có 7 ngày.', '1 week has 7 days.') });
        }
        const fr = P(rng, [['nho', 'grapes', 50, 90], ['táo', 'apples', 30, 60], ['xoài', 'mangoes', 25, 50]]);
        const [n, p, q] = find(() => [R(rng, 2, 4), R(rng, fr[2], fr[3]) * 1000, R(rng, 15, 40) * 1000], ([n, p, q]) => n * p + q <= 99000, [2, 35000, 20000]);
        return Q(L(`Mẹ mua ${n} kg ${fr[0]}, mỗi ki-lô-gam giá ${F(p)} đồng, và một bó hoa giá ${F(q)} đồng. Hỏi mẹ phải trả tất cả bao nhiêu tiền?`, `Mum buys ${n} kg of ${fr[1]} at ${F(p)} dong a kilogram and a bunch of flowers for ${F(q)} dong. How much does Mum pay altogether?`),
          num(n * p + q, D), L(`Bước 1: Tiền mua ${fr[0]} là: ${F(p)} × ${n} = ${F(n * p)} (đồng).\nBước 2: Mẹ phải trả tất cả: ${F(n * p)} + ${F(q)} = ${F(n * p + q)} (đồng).`, `Step 1: the ${fr[1]} cost ${F(p)} × ${n} = ${F(n * p)} (dong).\nStep 2: altogether Mum pays ${F(n * p)} + ${F(q)} = ${F(n * p + q)} (dong).`),
          { hint: L(`Tìm tiền mua ${fr[0]} trước.`, `First find the cost of the ${fr[1]}.`) });
      },
    },
    { // shop offers: "mua 5 tặng 1", a discount on each item
      id: 'g3-khuyen-mai', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c13-b68',
      gen: rng => {
        const f = R(rng, 0, 3), x = NC.name(rng), b = R(rng, 2, 5);
        const offerVi = `Một cửa hàng kem có chương trình "mua ${b} tặng 1": cứ mua ${b} cốc kem thì được tặng thêm 1 cốc.`;
        const offerEn = `An ice-cream shop has an offer, "buy ${b}, get 1 free": for every ${b} cups you buy, you get 1 more cup free.`;
        if (f === 0) {
          const m = R(rng, 2, 9), pay = m * b;
          return Q(L(`${offerVi} Lớp của ${x} mua và trả tiền ${pay} cốc kem. Hỏi lớp của ${x} nhận được tất cả bao nhiêu cốc kem?`, `${offerEn} ${x}'s class pays for ${pay} cups. How many cups of ice cream does the class get altogether?`),
            num(pay + m, L('cốc', 'cups')), L(`Bước 1: Số cốc được tặng là: ${pay} : ${b} = ${m} (cốc).\nBước 2: Lớp nhận được tất cả: ${pay} + ${m} = ${pay + m} (cốc).`, `Step 1: free cups: ${pay} : ${b} = ${m} (cups).\nStep 2: altogether: ${pay} + ${m} = ${pay + m} (cups).`),
            { hint: L(`Cứ ${b} cốc mua thì có 1 cốc tặng.`, `Every ${b} cups bought give 1 free cup.`) });
        }
        if (f === 1) {
          const m = R(rng, 2, 8), n = m * (b + 1);
          return Q(L(`${offerVi} Lớp của ${x} cần ${n} cốc kem. Hỏi lớp chỉ phải trả tiền bao nhiêu cốc?`, `${offerEn} ${x}'s class needs ${n} cups of ice cream. How many cups does the class have to pay for?`),
            num(n - m, L('cốc', 'cups')), L(`Cứ ${b + 1} cốc thì có ${b} cốc phải trả tiền và 1 cốc được tặng.\nBước 1: ${n} : ${b + 1} = ${m}, nên được tặng ${m} cốc.\nBước 2: Số cốc phải trả tiền là: ${n} ${M} ${m} = ${n - m} (cốc).`, `In every ${b + 1} cups, ${b} are paid for and 1 is free.\nStep 1: ${n} : ${b + 1} = ${m}, so ${m} cups are free.\nStep 2: cups to pay for: ${n} ${M} ${m} = ${n - m} (cups).`),
            { hint: L(`Mỗi nhóm ${b + 1} cốc có 1 cốc được tặng.`, `Each group of ${b + 1} cups has 1 free cup.`) });
        }
        if (f === 2) {
          const p = R(rng, 5, 15) * 1000;
          return Q(L(`Mỗi cốc kem giá ${F(p)} đồng. ${offerVi} Nhóm của ${x} cần ${b + 1} cốc kem. Hỏi nhóm phải trả bao nhiêu tiền?`, `A cup of ice cream costs ${F(p)} dong. ${offerEn} ${x}'s group needs ${b + 1} cups. How much does the group have to pay?`),
            num(b * p, L('đồng', 'dong')), L(`Mua ${b} cốc thì được tặng 1 cốc, đủ ${b + 1} cốc. Nhóm chỉ trả tiền ${b} cốc.\nSố tiền phải trả là: ${F(p)} × ${b} = ${F(b * p)} (đồng).`, `Buying ${b} cups gives 1 free cup, which makes ${b + 1} cups. The group pays for only ${b} cups.\nCost: ${F(p)} × ${b} = ${F(b * p)} (dong).`),
            { hint: L('Có phải trả tiền cốc được tặng không?', 'Do you pay for the free cup?') });
        }
        const [p, d, n] = find(() => [R(rng, 30, 95) * 1000, R(rng, 2, 10) * 1000, R(rng, 2, 3)], ([p, d, n]) => (p - d) * n <= 99999, [60000, 5000, 2]);
        return Q(L(`Một chiếc áo giá ${F(p)} đồng. Hôm nay cửa hàng giảm giá ${F(d)} đồng cho mỗi chiếc áo. Mẹ mua ${n} chiếc áo. Hỏi mẹ phải trả bao nhiêu tiền?`, `A shirt costs ${F(p)} dong. Today the shop takes ${F(d)} dong off the price of each shirt. Mum buys ${n} shirts. How much does Mum pay?`),
          num((p - d) * n, L('đồng', 'dong')), L(`Bước 1: Giá một chiếc áo hôm nay là: ${F(p)} ${M} ${F(d)} = ${F(p - d)} (đồng).\nBước 2: Mẹ phải trả: ${F(p - d)} × ${n} = ${F((p - d) * n)} (đồng).`, `Step 1: today one shirt costs ${F(p)} ${M} ${F(d)} = ${F(p - d)} (dong).\nStep 2: Mum pays ${F(p - d)} × ${n} = ${F((p - d) * n)} (dong).`),
          { hint: L('Tìm giá một chiếc áo sau khi giảm trước.', 'First find the new price of one shirt.') });
      },
    },
    { // two-step problems with large numbers: "4 khu, mỗi khu 1 500 con… còn lại 2800 con. Đã bán bao nhiêu?"
      id: 'g3-bai-toan-so-lon', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c14-b70',
      gen: rng => {
        const f = R(rng, 0, 4);
        if (f === 0) {
          const k = R(rng, 3, 6), per = R(rng, 80, 250) * 10, total = k * per, left = R(rng, 1, Math.floor(total / 100) - 1) * 100;
          return Q(L(`Một trang trại có ${k} khu chăn nuôi, mỗi khu có ${F(per)} con gà. Sau khi bán một số gà, trang trại còn lại ${F(left)} con gà. Hỏi trang trại đã bán bao nhiêu con gà?`, `A farm has ${k} sections, with ${F(per)} chickens in each section. After selling some chickens, the farm has ${F(left)} chickens left. How many chickens did the farm sell?`),
            num(total - left), L(`Bước 1: Lúc đầu trang trại có: ${F(per)} × ${k} = ${F(total)} (con gà).\nBước 2: Trang trại đã bán: ${F(total)} ${M} ${F(left)} = ${F(total - left)} (con gà).`, `Step 1: at first the farm has ${F(per)} × ${k} = ${F(total)} (chickens).\nStep 2: it sold ${F(total)} ${M} ${F(left)} = ${F(total - left)} (chickens).`),
            { hint: L('Tìm số gà lúc đầu trước.', 'First find how many chickens there were at the start.') });
        }
        if (f === 1) {
          const k = R(rng, 2, 6), each = R(rng, 1200, Math.floor(99999 / k)), m = R(rng, 100, each - 100);
          return Q(L(`Có ${F(k * each)} quyển sách được chia đều cho ${k} thư viện xã. Thư viện xã Tân Lập đã cho mượn ${F(m)} quyển trong số sách được chia. Hỏi thư viện xã Tân Lập còn lại bao nhiêu quyển sách đó?`, `${F(k * each)} books are shared equally between ${k} village libraries. The Tân Lập library has lent out ${F(m)} of the books it was given. How many of those books are still in the Tân Lập library?`),
            num(each - m), L(`Bước 1: Mỗi thư viện được chia: ${F(k * each)} : ${k} = ${F(each)} (quyển).\nBước 2: Thư viện Tân Lập còn lại: ${F(each)} ${M} ${F(m)} = ${F(each - m)} (quyển).`, `Step 1: each library gets ${F(k * each)} : ${k} = ${F(each)} (books).\nStep 2: Tân Lập still has ${F(each)} ${M} ${F(m)} = ${F(each - m)} (books).`),
            { hint: L('Tìm số sách mỗi thư viện được chia trước.', 'First find how many books each library gets.') });
        }
        if (f === 2) {
          const k = R(rng, 2, 5), a = R(rng, 1000, Math.floor(99999 / (k + 1))), sum = R(rng, 0, 1) === 1, ans = sum ? a * (k + 1) : a * (k - 1);
          return Q(L(`Tháng thứ nhất một nhà máy may được ${F(a)} chiếc áo. Số áo tháng thứ hai may được gấp ${k} lần tháng thứ nhất. Hỏi ${sum ? 'cả hai tháng nhà máy may được bao nhiêu chiếc áo' : 'tháng thứ hai nhà máy may được nhiều hơn tháng thứ nhất bao nhiêu chiếc áo'}?`, `In the first month a factory makes ${F(a)} shirts. In the second month it makes ${k} times as many shirts as in the first month. ${sum ? 'How many shirts does the factory make in the two months altogether' : 'How many more shirts does it make in the second month than in the first'}?`),
            num(ans), L(`Bước 1: Tháng thứ hai may được: ${F(a)} × ${k} = ${F(a * k)} (chiếc áo).\nBước 2: ${sum ? `Cả hai tháng: ${F(a)} + ${F(a * k)}` : `Nhiều hơn: ${F(a * k)} ${M} ${F(a)}`} = ${F(ans)} (chiếc áo).`, `Step 1: second month: ${F(a)} × ${k} = ${F(a * k)} (shirts).\nStep 2: ${sum ? `both months: ${F(a)} + ${F(a * k)}` : `more: ${F(a * k)} ${M} ${F(a)}`} = ${F(ans)} (shirts).`),
            { hint: L('Tìm số áo tháng thứ hai trước.', 'First find the shirts made in the second month.') });
        }
        if (f === 3) {
          const k = R(rng, 2, 9), q = R(rng, 1000, Math.floor(99999 / k)), T = q * k;
          return Q(L(`Một kho có ${F(T)} kg gạo. Người ta đã chuyển đi 1/${k} số gạo đó. Hỏi kho còn lại bao nhiêu ki-lô-gam gạo?`, `A storehouse has ${F(T)} kg of rice. 1/${k} of the rice has been taken away. How many kilograms of rice are left in the storehouse?`),
            num(T - q, 'kg'), L(`Bước 1: Số gạo đã chuyển đi là: ${F(T)} : ${k} = ${F(q)} (kg).\nBước 2: Kho còn lại: ${F(T)} ${M} ${F(q)} = ${F(T - q)} (kg).`, `Step 1: rice taken away: ${F(T)} : ${k} = ${F(q)} (kg).\nStep 2: left: ${F(T)} ${M} ${F(q)} = ${F(T - q)} (kg).`),
            { hint: L(`Tìm 1/${k} số gạo: lấy số gạo chia cho ${k}.`, `To find 1/${k} of the rice, divide by ${k}.`) });
        }
        const k = R(rng, 3, 9), e = R(rng, 120, 2000), s = R(rng, 500, 9000);
        return Q(L(`Sau khi bán ${F(s)} con vịt, số vịt còn lại của trang trại được nhốt đều vào ${k} chuồng, mỗi chuồng ${F(e)} con. Hỏi lúc đầu trang trại có bao nhiêu con vịt?`, `After selling ${F(s)} ducks, a farm puts the ducks that are left equally into ${k} pens, with ${F(e)} ducks in each pen. How many ducks did the farm have at the start?`),
          num(k * e + s), L(`Bước 1: Số vịt còn lại là: ${F(e)} × ${k} = ${F(k * e)} (con).\nBước 2: Lúc đầu trang trại có: ${F(k * e)} + ${F(s)} = ${F(k * e + s)} (con).`, `Step 1: ducks left: ${F(e)} × ${k} = ${F(k * e)}.\nStep 2: at the start: ${F(k * e)} + ${F(s)} = ${F(k * e + s)} (ducks).`),
          { hint: L('Tìm số vịt còn lại trước, rồi tính ngược lại.', 'First find how many ducks are left, then work backwards.') });
      },
    },
    { // rectangle and square: one side given by gấp / hơn, squares put together, a fence with a gate
      id: 'g3-chu-vi-dien-tich', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c9-b52',
      gen: rng => {
        const f = R(rng, 0, 5), area = R(rng, 0, 1) === 1;
        const ask = L(area ? 'diện tích' : 'chu vi', area ? 'area' : 'perimeter');
        if (f === 0 || f === 1) {
          let a, b, vi1, en1, s1;
          if (f === 0) { b = R(rng, 2, 9); const k = R(rng, 2, 4); a = b * k; vi1 = `Một hình chữ nhật có chiều rộng ${b} cm, chiều dài gấp ${k} lần chiều rộng.`; en1 = `A rectangle is ${b} cm wide, and its length is ${k} times its width.`; s1 = L(`Chiều dài: ${b} × ${k} = ${a} (cm).`, `length: ${b} × ${k} = ${a} (cm).`); }
          else { b = R(rng, 2, 9); const d = R(rng, 3, 15); a = b + d; vi1 = `Một hình chữ nhật có chiều dài ${a} cm, chiều rộng ngắn hơn chiều dài ${d} cm.`; en1 = `A rectangle is ${a} cm long, and its width is ${d} cm less than its length.`; s1 = L(`Chiều rộng: ${a} ${M} ${d} = ${b} (cm).`, `width: ${a} ${M} ${d} = ${b} (cm).`); }
          const v = area ? a * b : (a + b) * 2;
          return Q(L(`${vi1} Tính ${ask} hình chữ nhật đó.`, `${en1} Work out the ${ask} of the rectangle.`), num(v, area ? 'cm²' : 'cm'),
            L(`Bước 1: ${s1}\nBước 2: ${area ? `Diện tích: ${a} × ${b} = ${v} (cm²).` : `Chu vi: (${a} + ${b}) × 2 = ${v} (cm).`}`, `Step 1: ${s1}\nStep 2: ${area ? `area: ${a} × ${b} = ${v} (cm²).` : `perimeter: (${a} + ${b}) × 2 = ${v} (cm).`}`),
            { hint: L(area ? 'Diện tích = chiều dài × chiều rộng.' : 'Chu vi = (chiều dài + chiều rộng) × 2.', area ? 'Area = length × width.' : 'Perimeter = (length + width) × 2.') });
        }
        if (f === 2) {
          const [a, w] = find(() => [R(rng, 6, 20), R(rng, 2, 9)], ([a, w]) => w < a && (a + w) % 2 === 0, [9, 5]), Pr = (a + w) * 2;
          return Q(L(`Một hình vuông có chu vi bằng chu vi của hình chữ nhật có chiều dài ${a} cm, chiều rộng ${w} cm. Tính độ dài cạnh hình vuông.`, `A square has the same perimeter as a rectangle that is ${a} cm long and ${w} cm wide. Work out the side length of the square.`),
            num(Pr / 4, 'cm'), L(`Bước 1: Chu vi hình chữ nhật: (${a} + ${w}) × 2 = ${Pr} (cm).\nBước 2: Cạnh hình vuông: ${Pr} : 4 = ${Pr / 4} (cm).`, `Step 1: perimeter of the rectangle: (${a} + ${w}) × 2 = ${Pr} (cm).\nStep 2: side of the square: ${Pr} : 4 = ${Pr / 4} (cm).`),
            { hint: L('Cạnh hình vuông = chu vi : 4.', 'Side of a square = perimeter : 4.') });
        }
        if (f === 3) {
          const n = R(rng, 2, 4), s = R(rng, 2, 9), v = area ? n * s * s : (n * s + s) * 2;
          return Q(L(`Ghép ${n} hình vuông bằng nhau, mỗi hình có cạnh ${s} cm, xếp thành một hàng để được một hình chữ nhật. Tính ${ask} hình chữ nhật đó.`, `${n} equal squares, each with sides of ${s} cm, are put side by side in a row to make a rectangle. Work out the ${ask} of the rectangle.`),
            num(v, area ? 'cm²' : 'cm'),
            area ? L(`Bước 1: Diện tích một hình vuông: ${s} × ${s} = ${s * s} (cm²).\nBước 2: Diện tích hình chữ nhật: ${s * s} × ${n} = ${v} (cm²).`, `Step 1: area of one square: ${s} × ${s} = ${s * s} (cm²).\nStep 2: area of the rectangle: ${s * s} × ${n} = ${v} (cm²).`)
              : L(`Bước 1: Chiều dài hình chữ nhật: ${s} × ${n} = ${n * s} (cm), chiều rộng ${s} cm.\nBước 2: Chu vi: (${n * s} + ${s}) × 2 = ${v} (cm).`, `Step 1: the rectangle is ${s} × ${n} = ${n * s} (cm) long and ${s} cm wide.\nStep 2: perimeter: (${n * s} + ${s}) × 2 = ${v} (cm).`),
            { hint: L('Vẽ hình ra nháp để thấy chiều dài và chiều rộng.', 'Draw it on rough paper to see the length and the width.') });
        }
        if (f === 4) {
          const a = R(rng, 12, 40), w = R(rng, 5, a - 2), g = R(rng, 1, 3), v = (a + w) * 2 - g;
          return Q(L(`Một mảnh vườn hình chữ nhật có chiều dài ${a} m, chiều rộng ${w} m. Người ta rào xung quanh mảnh vườn, chừa lại một lối vào rộng ${g} m. Hỏi hàng rào dài bao nhiêu mét?`, `A rectangular garden is ${a} m long and ${w} m wide. A fence is put all the way round it, leaving a gap of ${g} m for a gate. How many metres long is the fence?`),
            num(v, 'm'), L(`Bước 1: Chu vi mảnh vườn: (${a} + ${w}) × 2 = ${(a + w) * 2} (m).\nBước 2: Hàng rào dài: ${(a + w) * 2} ${M} ${g} = ${v} (m).`, `Step 1: perimeter of the garden: (${a} + ${w}) × 2 = ${(a + w) * 2} (m).\nStep 2: the fence: ${(a + w) * 2} ${M} ${g} = ${v} (m).`),
            { hint: L('Tính chu vi rồi bớt phần lối vào.', 'Work out the perimeter, then take away the gate.') });
        }
        const w = R(rng, 2, 15), a = R(rng, w + 1, 30), Pr = (a + w) * 2;
        return Q(L(`Một hình chữ nhật có chu vi ${Pr} cm, chiều rộng ${w} cm. Tính chiều dài hình chữ nhật đó.`, `A rectangle has a perimeter of ${Pr} cm and a width of ${w} cm. Work out its length.`),
          num(a, 'cm'), L(`Bước 1: Nửa chu vi (chiều dài + chiều rộng): ${Pr} : 2 = ${a + w} (cm).\nBước 2: Chiều dài: ${a + w} ${M} ${w} = ${a} (cm).`, `Step 1: half the perimeter (length + width): ${Pr} : 2 = ${a + w} (cm).\nStep 2: length: ${a + w} ${M} ${w} = ${a} (cm).`),
          { hint: L('Chiều dài + chiều rộng = chu vi : 2.', 'Length + width = perimeter : 2.') });
      },
    },
    { // rounding after a calculation
      id: 'g3-lam-tron-sau-khi-tinh', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c11-b61',
      gen: rng => {
        const f = R(rng, 0, 3), rnd = (n, p) => Math.floor((n + p / 2) / p) * p;
        const PL = [[100, 'hàng trăm', 'hundred'], [1000, 'hàng nghìn', 'thousand'], [10000, 'hàng chục nghìn', 'ten thousand']];
        const rule = L('Xét chữ số ngay sau hàng cần làm tròn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.', 'Look at the next digit to the right: if it is less than 5, round down; if it is 5 or more, round up.');
        if (f === 0) {
          const [p, pv, pe] = P(rng, PL), sub = R(rng, 0, 1) === 1;
          const [a, b] = find(() => sub ? [R(rng, 30000, 99999), R(rng, 1000, 60000)] : [R(rng, 10000, 70000), R(rng, 1000, 29000)],
            ([a, b]) => (sub ? a - b >= 1000 : a + b <= 99000) && (sub ? a - b : a + b) % p !== 0, [23456, 18279]);
          const v = sub ? a - b : a + b, r = rnd(v, p);
          return Q(L(`Tính ${F(a)} ${sub ? M : '+'} ${F(b)} rồi làm tròn kết quả đến ${pv}.`, `Work out ${F(a)} ${sub ? M : '+'} ${F(b)}, then round the answer to the nearest ${pe}.`), num(r),
            L(`Bước 1: ${F(a)} ${sub ? M : '+'} ${F(b)} = ${F(v)}.\nBước 2: Làm tròn ${F(v)} đến ${pv} được ${F(r)}.`, `Step 1: ${F(a)} ${sub ? M : '+'} ${F(b)} = ${F(v)}.\nStep 2: ${F(v)} rounded to the nearest ${pe} is ${F(r)}.`), { hint: rule });
        }
        if (f === 1) {
          const S = R(rng, 200, 600) * 100 + R(rng, 0, 99), s = R(rng, 5000, S - 1000), v = S - s, r = rnd(v, 100);
          return Q(L(`Một sân vận động có ${F(S)} chỗ ngồi. Trận bóng đá hôm qua có ${F(s)} khán giả, mỗi người ngồi một chỗ. Hỏi số chỗ còn trống, làm tròn đến hàng trăm, là bao nhiêu?`, `A stadium has ${F(S)} seats. Yesterday ${F(s)} people came to a football match, one person in each seat. How many seats were empty? Round your answer to the nearest hundred.`),
            num(r), L(`Bước 1: Số chỗ còn trống: ${F(S)} ${M} ${F(s)} = ${F(v)} (chỗ).\nBước 2: Làm tròn ${F(v)} đến hàng trăm được ${F(r)}.`, `Step 1: empty seats: ${F(S)} ${M} ${F(s)} = ${F(v)}.\nStep 2: ${F(v)} rounded to the nearest hundred is ${F(r)}.`), { hint: rule });
        }
        if (f === 2) {
          const [it1, it2] = P(rng, [[['một cái bánh sinh nhật', 'a birthday cake', 150, 600], ['một túi kẹo', 'a bag of sweets', 50, 250]], [['một quyển truyện', 'a storybook', 150, 450], ['một hộp bút màu', 'a box of colouring pens', 120, 350]], [['một con gà', 'a chicken', 300, 700], ['một bó rau', 'a bunch of greens', 50, 150]]]);
          const a = R(rng, it1[2], it1[3]) * 100, b = R(rng, it2[2], it2[3]) * 100, v = a + b, r = rnd(v, 1000);
          return Q(L(`Mẹ mua ${it1[0]} giá ${F(a)} đồng và ${it2[0]} giá ${F(b)} đồng. Làm tròn tổng số tiền mẹ phải trả đến hàng nghìn.`, `Mum buys ${it1[1]} for ${F(a)} dong and ${it2[1]} for ${F(b)} dong. Round the total cost to the nearest thousand dong.`),
            num(r, L('đồng', 'dong')), L(`Bước 1: Tổng số tiền: ${F(a)} + ${F(b)} = ${F(v)} (đồng).\nBước 2: Làm tròn ${F(v)} đến hàng nghìn được ${F(r)} đồng.`, `Step 1: total: ${F(a)} + ${F(b)} = ${F(v)} (dong).\nStep 2: ${F(v)} rounded to the nearest thousand is ${F(r)} dong.`), { hint: rule });
        }
        const n = find(() => R(rng, 10000, 94999), v => v % 1000 !== 0 && rnd(v, 1000) !== rnd(v, 10000), 34718), A = rnd(n, 1000), B = rnd(n, 10000), v = Math.abs(A - B);
        return Q(L(`Làm tròn số ${F(n)} đến hàng nghìn được số A, làm tròn số ${F(n)} đến hàng chục nghìn được số B. Tìm hiệu của số lớn hơn và số bé hơn trong hai số A và B.`, `Round ${F(n)} to the nearest thousand to get A, and to the nearest ten thousand to get B. Find the difference between the larger and the smaller of A and B.`),
          num(v), L(`Bước 1: A = ${F(A)}; B = ${F(B)}.\nBước 2: ${F(Math.max(A, B))} ${M} ${F(Math.min(A, B))} = ${F(v)}.`, `Step 1: A = ${F(A)}; B = ${F(B)}.\nStep 2: ${F(Math.max(A, B))} ${M} ${F(Math.min(A, B))} = ${F(v)}.`), { hint: rule });
      },
    },
    { // what time does it end / start? (start + duration crossing the hour, and backwards)
      id: 'g3-thoi-diem-ket-thuc', from: 'cuoi-nam', kinds: ['tn'], lesson: 'g3-c13-b66',
      gen: rng => {
        const x = NC.name(rng), back = R(rng, 0, 2) === 0, h = P(rng, [6, 7, 8, 9, 10, 2, 3, 4, 5]);
        if (!back) {
          const [m, d] = find(() => [R(rng, 6, 11) * 5, R(rng, 2, 11) * 5], ([m, d]) => m + d >= 65 && m + d <= 115, [45, 35]), e = m + d - 60, to = 60 - m;
          const T1 = tS(h, m), ans = tS(h + 1, e);
          const [vi, en] = P(rng, [
            [`${x} bắt đầu làm bài tập lúc ${T1}. ${x} làm bài trong ${d} phút. Hỏi ${x} làm xong bài lúc mấy giờ?`, `${x} starts homework at ${T1} and works for ${d} minutes. What time does ${x} finish?`],
            [`Một bộ phim hoạt hình bắt đầu chiếu lúc ${T1} và dài ${d} phút. Hỏi bộ phim kết thúc lúc mấy giờ?`, `A cartoon film starts at ${T1} and lasts ${d} minutes. What time does the film end?`],
            [`Xe buýt rời bến lúc ${T1}, đi ${d} phút thì đến trường. Hỏi xe buýt đến trường lúc mấy giờ?`, `A bus leaves the bus station at ${T1} and takes ${d} minutes to reach the school. What time does the bus get to the school?`],
            [`Buổi tập bơi của ${x} bắt đầu lúc ${T1} và kéo dài ${d} phút. Hỏi buổi tập bơi kết thúc lúc mấy giờ?`, `${x}'s swimming lesson starts at ${T1} and lasts ${d} minutes. What time does it end?`]]);
          return Q(L(vi, en), NC.ch(rng, ans, [tS(h, e), tS(h + 1, e + 5 <= 55 ? e + 5 : e - 5), tS(h + 1, (m + d) % 60 === 0 ? 5 : m), tS(h + 2, e)]),
            L(`Từ ${T1} đến ${h + 1} giờ là ${to} phút.\nCòn lại: ${d} ${M} ${to} = ${e} (phút).\nVậy lúc đó là ${ans}.`, `From ${T1} to ${h + 1} o'clock is ${to} minutes.\nThat leaves ${d} ${M} ${to} = ${e} minutes.\nSo the time is ${ans}.`),
            { hint: L(`Tính xem còn bao nhiêu phút nữa thì đến ${h + 1} giờ.`, `Work out how many minutes it is until ${h + 1} o'clock.`) });
        }
        const [e, d] = find(() => [R(rng, 1, 5) * 5, R(rng, 3, 11) * 5], ([e, d]) => d - e >= 5 && d - e <= 55, [10, 35]), m = 60 - (d - e);
        const T2 = tS(h + 1, e), ans = tS(h, m);
        const [vi, en] = P(rng, [
          [`Một bộ phim dài ${d} phút và kết thúc lúc ${T2}. Hỏi bộ phim bắt đầu lúc mấy giờ?`, `A film lasts ${d} minutes and ends at ${T2}. What time did it start?`],
          [`Xe buýt đến trường lúc ${T2}. Xe đã đi ${d} phút từ bến xe. Hỏi xe buýt rời bến lúc mấy giờ?`, `A bus gets to the school at ${T2}. It took ${d} minutes from the bus station. What time did it leave the station?`],
          [`${x} làm bài tập trong ${d} phút và làm xong lúc ${T2}. Hỏi ${x} bắt đầu làm bài lúc mấy giờ?`, `${x} does homework for ${d} minutes and finishes at ${T2}. What time did ${x} start?`]]);
        return Q(L(vi, en), NC.ch(rng, ans, [tS(h + 1, m), tS(h, m + 5 <= 55 ? m + 5 : m - 5), tS(h, d - e === e ? 5 : e), tS(h - 1, m)]),
          L(`Từ ${h + 1} giờ đến ${T2} là ${e} phút.\nCòn phải lùi thêm: ${d} ${M} ${e} = ${d - e} (phút) trước ${h + 1} giờ.\n${h + 1} giờ kém ${d - e} phút là ${ans}.`, `From ${h + 1} o'clock to ${T2} is ${e} minutes.\nWe still go back ${d} ${M} ${e} = ${d - e} minutes before ${h + 1} o'clock.\n${d - e} minutes to ${h + 1} is ${ans}.`),
          { hint: L(`Lùi về ${h + 1} giờ trước.`, `Go back to ${h + 1} o'clock first.`) });
      },
    },
    { // how long did it take? (crossing the hour; or from morning to afternoon in hours)
      id: 'g3-khoang-thoi-gian', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c13-b66',
      gen: rng => {
        const x = NC.name(rng);
        if (R(rng, 0, 3) === 0) {
          const h1 = R(rng, 6, 9), h2 = R(rng, 2, 5), v = 12 - h1 + h2;
          return Q(L(`Bác ${x} làm việc ở xưởng từ ${h1} giờ sáng đến ${h2} giờ chiều (kể cả giờ nghỉ trưa). Hỏi bác ở xưởng bao nhiêu giờ?`, `${x}'s uncle is at the workshop from ${h1} in the morning until ${h2} in the afternoon (with the lunch break). How many hours is he at the workshop?`),
            num(v, L('giờ', 'hours')), L(`Từ ${h1} giờ sáng đến 12 giờ trưa là: 12 ${M} ${h1} = ${12 - h1} (giờ).\nTừ 12 giờ trưa đến ${h2} giờ chiều là ${h2} giờ.\nTất cả: ${12 - h1} + ${h2} = ${v} (giờ).`, `From ${h1} in the morning to 12 noon: 12 ${M} ${h1} = ${12 - h1} (hours).\nFrom 12 noon to ${h2} in the afternoon: ${h2} hours.\nAltogether: ${12 - h1} + ${h2} = ${v} (hours).`),
            { hint: L('Tính đến 12 giờ trưa trước.', 'Count up to 12 noon first.') });
        }
        const h = P(rng, [6, 7, 8, 9, 10, 2, 3, 4]), [m1, m2] = find(() => [R(rng, 6, 11) * 5, R(rng, 1, 7) * 5], ([m1, m2]) => 60 - m1 + m2 <= 60, [45, 20]);
        const v = 60 - m1 + m2, T1 = tS(h, m1), T2 = tS(h + 1, m2);
        const [vi, en] = P(rng, [
          [`Tiết học bắt đầu lúc ${T1} và kết thúc lúc ${T2}. Hỏi tiết học kéo dài bao nhiêu phút?`, `A lesson starts at ${T1} and ends at ${T2}. How many minutes long is the lesson?`],
          [`${x} đi từ nhà lúc ${T1} và đến nhà bà ngoại lúc ${T2}. Hỏi ${x} đi hết bao nhiêu phút?`, `${x} leaves home at ${T1} and gets to Grandma's house at ${T2}. How many minutes does the journey take?`],
          [`Bộ phim bắt đầu lúc ${T1} và kết thúc lúc ${T2}. Hỏi bộ phim dài bao nhiêu phút?`, `A film starts at ${T1} and ends at ${T2}. How many minutes long is the film?`]]);
        return Q(L(vi, en), num(v, L('phút', 'minutes')),
          L(`Từ ${T1} đến ${h + 1} giờ là ${60 - m1} phút.\nTừ ${h + 1} giờ đến ${T2} là ${m2} phút.\nTất cả: ${60 - m1} + ${m2} = ${v} (phút).`, `From ${T1} to ${h + 1} o'clock is ${60 - m1} minutes.\nFrom ${h + 1} o'clock to ${T2} is ${m2} minutes.\nAltogether: ${60 - m1} + ${m2} = ${v} (minutes).`),
          { hint: L(`Tính đến ${h + 1} giờ trước.`, `Count up to ${h + 1} o'clock first.`) });
      },
    },
    { // the day of the week after a whole month or some days (weeks of 7 days)
      id: 'g3-thu-trong-tuan', from: 'cuoi-nam', kinds: ['tn'], lesson: 'g3-c13-b66',
      gen: rng => {
        const y = P(rng, [2026, 2027]);
        const opts = a => [WD[(a + 1) % 7], WD[(a + 6) % 7], WD[(a + 2) % 7], WD[(a + 5) % 7]];
        if (R(rng, 0, 1) === 0) {
          const m = R(rng, 1, 11), n = daysIn(y, m), wd = new Date(y, m - 1, 1).getDay(), a = new Date(y, m, 1).getDay(), r = n - 28;
          return Q(L(`${cap(dateS(1, m, y))} là ${WD[wd]}. Hỏi ${dateS(1, m + 1, y)} là thứ mấy?`, `${dateS(1, m, y)} is a ${WD[wd]}. What day of the week is ${dateS(1, m + 1, y)}?`),
            NC.ch(rng, WD[a], (r ? [WD[wd]] : []).concat(opts(a))),
            r ? L(`Tháng ${m} có ${n} ngày = 4 tuần và ${r} ngày.\nTừ ${WD[wd]} đếm thêm ${r} ngày được ${WD[a]}.`, `${MONTHS[m]} has ${n} days = 4 weeks and ${r} ${r === 1 ? 'day' : 'days'}.\nCount on ${r} ${r === 1 ? 'day' : 'days'} from ${WD[wd]}: ${WD[a]}.`)
              : L(`Tháng ${m} có 28 ngày, đúng 4 tuần, nên ngày 1 tháng ${m + 1} cũng là ${WD[wd]}.`, `${MONTHS[m]} has 28 days, exactly 4 weeks, so 1 ${MONTHS[m + 1]} is also a ${WD[wd]}.`),
            { hint: L('Tháng đó có bao nhiêu ngày? 1 tuần có 7 ngày.', 'How many days are in that month? A week has 7 days.') });
        }
        const m = R(rng, 1, 12), d = R(rng, 1, 10), d2 = d + R(rng, 8, 20), wd = new Date(y, m - 1, d).getDay(), a = new Date(y, m - 1, d2).getDay();
        const diff = d2 - d, w = Math.floor(diff / 7), r = diff % 7;
        return Q(L(`${cap(dateS(d, m, y))} là ${WD[wd]}. Hỏi ${dateS(d2, m, y)} là thứ mấy?`, `${dateS(d, m, y)} is a ${WD[wd]}. What day of the week is ${dateS(d2, m, y)}?`),
          NC.ch(rng, WD[a], (r ? [WD[wd]] : []).concat(opts(a))),
          r ? L(`Từ ngày ${d} đến ngày ${d2} là ${d2} ${M} ${d} = ${diff} ngày = ${w} tuần và ${r} ngày.\nTừ ${WD[wd]} đếm thêm ${r} ngày được ${WD[a]}.`, `From ${d} ${MONTHS[m]} to ${d2} ${MONTHS[m]} is ${d2} ${M} ${d} = ${diff} days = ${w} ${w === 1 ? 'week' : 'weeks'} and ${r} ${r === 1 ? 'day' : 'days'}.\nCount on ${r} ${r === 1 ? 'day' : 'days'} from ${WD[wd]}: ${WD[a]}.`)
            : L(`Từ ngày ${d} đến ngày ${d2} là ${diff} ngày, đúng ${w} tuần, nên vẫn là ${WD[wd]}.`, `From ${d} ${MONTHS[m]} to ${d2} ${MONTHS[m]} is ${diff} days, exactly ${w} weeks, so it is also a ${WD[wd]}.`),
          { hint: L('Cứ 7 ngày thì lại đến thứ đó.', 'Every 7 days it is the same day of the week again.') });
      },
    },
    { // chance when taking several balls at once: certain / possible / impossible
      id: 'g3-kha-nang-lay-nhieu', from: 'cuoi-nam', kinds: ['tn'], lesson: 'g3-c15-b74',
      gen: rng => {
        const want = R(rng, 0, 2), OPT = ['Chắc chắn', 'Có thể', 'Không thể'], OPT_EN = ['certain', 'possible', 'impossible'];
        const judge = (r, b, k, ev) => {
          if (ev === 0) return k > b ? 0 : 1;              // at least one red
          if (ev === 1) return k > r ? 0 : 1;              // at least one blue
          if (ev === 2) return k > r ? 2 : 1;              // all red
          if (ev === 3) return k > b ? 2 : 1;              // all blue
          return k > r && k > b ? 0 : 1;                   // both colours
        };
        const [r, b, k, ev] = find(() => { const r = R(rng, 1, 5), b = R(rng, 1, 5); return [r, b, R(rng, 2, Math.min(5, r + b)), R(rng, 0, 4)]; }, v => judge(...v) === want, [3, 2, 3, 0]);
        const ans = judge(r, b, k, ev);
        const EVV = [`có ít nhất một quả bóng đỏ`, `có ít nhất một quả bóng xanh`, `cả ${k} quả đều là bóng đỏ`, `cả ${k} quả đều là bóng xanh`, `có cả bóng đỏ và bóng xanh`];
        const allK = k === 2 ? "both" : `all ${k}`;
        const EVE = [`at least one of them is red`, `at least one of them is blue`, `${allK} balls are red`, `${allK} balls are blue`, `there are both red and blue balls`];
        const why = [
          [L(`Hộp chỉ có ${b} quả bóng xanh mà lấy ra ${k} quả, nên chắc chắn có quả bóng đỏ.`, `The box has only ${b} blue ${b === 1 ? 'ball' : 'balls'} and you take ${k}, so at least one must be red.`), null, null],
          [L(`Hộp chỉ có ${r} quả bóng đỏ mà lấy ra ${k} quả, nên chắc chắn có quả bóng xanh.`, `The box has only ${r} red ${r === 1 ? 'ball' : 'balls'} and you take ${k}, so at least one must be blue.`), null, null],
          [null, null, L(`Hộp chỉ có ${r} quả bóng đỏ, không đủ ${k} quả.`, `The box has only ${r} red ${r === 1 ? 'ball' : 'balls'}, not enough for ${k}.`)],
          [null, null, L(`Hộp chỉ có ${b} quả bóng xanh, không đủ ${k} quả.`, `The box has only ${b} blue ${b === 1 ? 'ball' : 'balls'}, not enough for ${k}.`)],
          [L(`Mỗi màu có ít hơn ${k} quả, nên ${k} quả lấy ra không thể cùng một màu: chắc chắn có cả hai màu.`, `Each colour has fewer than ${k} balls, so the ${k} balls cannot all be one colour: there must be both colours.`), null, null]][ev][ans]
          || [
            L(`Hộp có ${b} quả bóng xanh nên có thể lấy được ${k} quả đều là bóng xanh, nhưng cũng có thể lấy được quả bóng đỏ.`, `The box has ${b} blue balls, so ${allK} could be blue, but you could also get a red one.`),
            L(`Hộp có ${r} quả bóng đỏ nên có thể lấy được ${k} quả đều là bóng đỏ, nhưng cũng có thể lấy được quả bóng xanh.`, `The box has ${r} red balls, so ${allK} could be red, but you could also get a blue one.`),
            L(`Hộp có ${r} quả bóng đỏ nên có thể lấy được ${k} quả đều là bóng đỏ, nhưng cũng có thể lấy được quả bóng xanh.`, `The box has ${r} red balls, so ${allK} could be red, but you could also get a blue one.`),
            L(`Hộp có ${b} quả bóng xanh nên có thể lấy được ${k} quả đều là bóng xanh, nhưng cũng có thể lấy được quả bóng đỏ.`, `The box has ${b} blue balls, so ${allK} could be blue, but you could also get a red one.`),
            k <= r ? L(`Có thể lấy được cả hai màu, nhưng cũng có thể lấy được ${k} quả đều là bóng đỏ (hộp có ${r} quả bóng đỏ).`, `You could get both colours, but ${allK} could also be red (the box has ${r} red balls).`)
              : L(`Có thể lấy được cả hai màu, nhưng cũng có thể lấy được ${k} quả đều là bóng xanh (hộp có ${b} quả bóng xanh).`, `You could get both colours, but ${allK} could also be blue (the box has ${b} blue balls).`)][ev];
        return Q(L(`Trong hộp có ${r} quả bóng đỏ và ${b} quả bóng xanh. Không nhìn vào hộp, lấy ra cùng lúc ${k} quả bóng. Khả năng "${EVV[ev]}" là:`, `A box has ${r} red ${r === 1 ? 'ball' : 'balls'} and ${b} blue ${b === 1 ? 'ball' : 'balls'}. Without looking, you take out ${k} balls at the same time. "${cap(EVE[ev])}" is:`),
          { kind: 'choice', options: U.EN ? OPT_EN : OPT, correct: ans }, why,
          { hint: L('Thử nghĩ cách lấy "xấu nhất": lấy hết bóng của một màu trước.', 'Think of the worst case: take all the balls of one colour first.'), visual: { type: 'chance', params: { items: [{ color: '#E84A4A', count: r }, { color: '#4DA3FF', count: b }] } } });
      },
    },
    { // a short data table with a two-step question
      id: 'g3-bang-so-lieu-hai-buoc', from: 'cuoi-nam', kinds: ['tn', 'tl'], lesson: 'g3-c15-b73',
      gen: rng => {
        const ctx = R(rng, 0, 1) === 0
          ? { g: L('Xã', 'Commune'), names: (U.EN ? ['Commune A', 'Commune B', 'Commune C', 'Commune D'] : ['Xã A', 'Xã B', 'Xã C', 'Xã D']), row: L('Số cây', 'Trees'), intro: L('Bảng dưới đây cho biết số cây bốn xã trồng được trong Tết trồng cây.', 'The table shows how many trees four communes planted at the spring tree-planting festival.'), v: 'trồng được', th: 'cây', thE: 'trees', vE: 'plant', gE: 'commune', gEs: 'communes', gv: 'xã' }
          : { g: L('Trường', 'School'), names: (U.EN ? ['School A', 'School B', 'School C', 'School D'] : ['Trường A', 'Trường B', 'Trường C', 'Trường D']), row: L('Số sách', 'Books'), intro: L('Bảng dưới đây cho biết số quyển sách bốn trường quyên góp được.', 'The table shows how many books four schools collected for charity.'), v: 'quyên góp được', th: 'quyển sách', thE: 'books', vE: 'collect', gE: 'school', gEs: 'schools', gv: 'trường' };
        const vals = find(() => [0, 0, 0, 0].map(() => R(rng, 1200, 4800)), v => new Set(v).size === 4, [2350, 4120, 1875, 3060]);
        const visual = { type: 'dataTable', params: { headers: [ctx.g].concat(ctx.names), rows: [[ctx.row].concat(vals)] } };
        const N = ctx.names, f = R(rng, 0, 2);
        if (f === 0) {
          const hi = vals.indexOf(Math.max(...vals)), lo = vals.indexOf(Math.min(...vals)), v = vals[hi] - vals[lo];
          return Q(L(`${ctx.intro}\n${cap(ctx.gv)} ${ctx.v} nhiều ${ctx.th} nhất ${ctx.v} nhiều hơn ${ctx.gv} ${ctx.v} ít ${ctx.th} nhất bao nhiêu ${ctx.th}?`, `${ctx.intro}\nHow many more ${ctx.thE} did the ${ctx.gE} with the most ${ctx.thE} ${ctx.vE} than the ${ctx.gE} with the fewest?`),
            num(v), L(`Bước 1: Nhiều nhất là ${N[hi]}: ${vals[hi]} ${ctx.th}; ít nhất là ${N[lo]}: ${vals[lo]} ${ctx.th}.\nBước 2: ${vals[hi]} ${M} ${vals[lo]} = ${v} (${ctx.th}).`, `Step 1: the most is ${N[hi]} with ${vals[hi]}; the fewest is ${N[lo]} with ${vals[lo]}.\nStep 2: ${vals[hi]} ${M} ${vals[lo]} = ${v} (${ctx.thE}).`),
            { visual, hint: L('Tìm số lớn nhất và số bé nhất trong bảng trước.', 'First find the largest and the smallest numbers in the table.') });
        }
        if (f === 1) {
          const [i, j, c] = find(() => U.sample(rng, [0, 1, 2, 3], 3), ([i, j, c]) => vals[i] + vals[j] > vals[c], [0, 1, 2]), s = vals[i] + vals[j], v = s - vals[c];
          return Q(L(`${ctx.intro}\nCả ${N[i]} và ${N[j]} ${ctx.v} nhiều hơn ${N[c]} bao nhiêu ${ctx.th}?`, `${ctx.intro}\nHow many more ${ctx.thE} did ${N[i]} and ${N[j]} ${ctx.vE} together than ${N[c]}?`),
            num(v), L(`Bước 1: ${N[i]} và ${N[j]} ${ctx.v}: ${vals[i]} + ${vals[j]} = ${s} (${ctx.th}).\nBước 2: Nhiều hơn ${N[c]}: ${s} ${M} ${vals[c]} = ${v} (${ctx.th}).`, `Step 1: ${N[i]} and ${N[j]} together: ${vals[i]} + ${vals[j]} = ${s} (${ctx.thE}).\nStep 2: more than ${N[c]}: ${s} ${M} ${vals[c]} = ${v} (${ctx.thE}).`),
            { visual, hint: L(`Tìm tổng của ${N[i]} và ${N[j]} trước.`, `First find the total for ${N[i]} and ${N[j]}.`) });
        }
        const srt = vals.map((v, k) => [v, k]).sort((p, q) => q[0] - p[0]), [a, b] = srt, v = a[0] + b[0];
        return Q(L(`${ctx.intro}\nHai ${ctx.gv} ${ctx.v} nhiều ${ctx.th} nhất ${ctx.v} tất cả bao nhiêu ${ctx.th}?`, `${ctx.intro}\nHow many ${ctx.thE} did the two ${ctx.gEs} with the most ${ctx.thE} ${ctx.vE} altogether?`),
          num(v), L(`Bước 1: Hai ${ctx.gv} ${ctx.v} nhiều nhất là ${N[a[1]]} (${a[0]}) và ${N[b[1]]} (${b[0]}).\nBước 2: ${a[0]} + ${b[0]} = ${v} (${ctx.th}).`, `Step 1: the two ${ctx.gEs} with the most are ${N[a[1]]} (${a[0]}) and ${N[b[1]]} (${b[0]}).\nStep 2: ${a[0]} + ${b[0]} = ${v} (${ctx.thE}).`),
          { visual, hint: L('Tìm hai số lớn nhất trong bảng.', 'Find the two largest numbers in the table.') });
      },
    },
  ]);
})();
