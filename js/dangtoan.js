/* Toán ISA — "Học dạng toán": the kinds of problem of each grade, taught step by step (user, 2026-11-23).
 * Content: js/content/dangtoan-lopN.js (window.DT). Screens here:
 *   1. the list — a grade switch on top, the kinds of that grade by học kì;
 *   2. one kind — ① Hiểu dạng toán (ISA works one example on a chalkboard scene by scene: the problem, the diagram,
 *                    each step written in chalk, the answer, then the method and a common mistake — v77),
 *                 ② Cùng làm từng bước (a worked example the child completes one step at a time),
 *                 ③ Tự luyện (ten questions in the app's practice player).
 * API: Kinds.open(api, grade?, kindId?) — api gives the app's own helpers (h, screen, topbar, viz, practice…).
 */
(function () {
  'use strict';
  const L = U.L;
  const CSS = `
.dk-wrap { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 0 20px calc(22px + var(--safe-b, 0px)); }
.dk-in { max-width: 980px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
.dk-intro { display: flex; align-items: center; gap: 14px; color: #fff; font-size: 17px; font-weight: 600; }
.dk-intro b { font-size: 22px; display: block; }
.dk-intro .mini-mascot { width: 70px; flex: none; }
.dk-sec { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.dk-sec h3 { margin: 0; font-size: 18px; font-weight: 900; color: var(--ink-2); }
.dk-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
.dk-tile { display: flex; align-items: center; gap: 12px; text-align: left; padding: 10px 12px; border-radius: 18px; background: #F3F7F8; box-shadow: inset 0 0 0 2px #E1EAEC; min-height: 68px; }
.dk-tile:active { transform: translateY(2px); }
.dk-tile.done { background: #E3F7EC; box-shadow: inset 0 0 0 2px #A9E2C2; }
.dk-tile .ic { flex: none; width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; font-size: 26px; background: #fff; }
.dk-tile .tt { flex: 1; min-width: 0; font-size: 17px; font-weight: 800; color: var(--ink); line-height: 1.2; }
.dk-tile .st { flex: none; font-size: 13px; font-weight: 800; color: #B7791F; white-space: nowrap; }
.dk-empty { padding: 22px; text-align: center; font-size: 18px; font-weight: 700; color: var(--ink-2); }
/* one kind */
.dk-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; padding: 5px; border-radius: 20px; background: rgba(255, 255, 255, .28); }
.dk-tab { min-height: 48px; border-radius: 15px; font-size: 16px; font-weight: 800; color: #fff; padding: 0 6px; line-height: 1.15; }
.dk-tab.on { background: #fff; color: var(--teal-d, #0E8C88); box-shadow: 0 2px 6px rgba(0, 40, 50, .15); }
.dk-card { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.dk-card h2 { margin: 0; font-size: 24px; font-weight: 900; color: var(--ink); line-height: 1.2; }
.dk-box { border-radius: 18px; padding: 12px 14px; font-size: 19px; font-weight: 600; line-height: 1.45; color: var(--ink); }
.dk-box b.lbl { display: block; font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px; }
.dk-spot { background: #E9F8F7; } .dk-spot b.lbl { color: #0E6E6A; }
.dk-how { background: #F3F0FF; } .dk-how b.lbl { color: #5B3FC4; }
.dk-tip { background: #FFF6DB; } .dk-tip b.lbl { color: #7A5600; }
.dk-how ol { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; counter-reset: dk; }
.dk-how li { display: flex; gap: 10px; align-items: flex-start; counter-increment: dk; }
.dk-how li::before { content: counter(dk); flex: none; width: 30px; height: 30px; border-radius: 50%; background: #7C5CE0; color: #fff; font-weight: 900; font-size: 16px; display: grid; place-items: center; margin-top: 1px; }
.dk-actions { display: flex; flex-wrap: wrap; gap: 10px; }
/* the guided example */
.dk-prob { background: #FFFDF7; box-shadow: inset 0 0 0 2px #EADFC6; border-radius: 18px; padding: 14px 16px; font-size: 20px; font-weight: 700; line-height: 1.45; color: var(--ink); white-space: pre-line; }
.dk-viz { display: flex; justify-content: center; }
.dk-viz > .viz { width: 100%; max-width: 560px; }
.dk-steps { display: flex; flex-direction: column; gap: 10px; }
.dk-step { border-radius: 18px; padding: 12px 14px; background: #F3F7F8; box-shadow: inset 0 0 0 2px #E1EAEC; display: flex; flex-direction: column; gap: 10px; animation: screenIn .3s ease both; }
.dk-step.cur { background: #fff; box-shadow: inset 0 0 0 3px var(--orange, #F47A2A); }
.dk-step.ok { background: #E3F7EC; box-shadow: inset 0 0 0 2px #A9E2C2; }
.dk-step.helped { background: #FFF6DB; box-shadow: inset 0 0 0 2px #F1D48A; }
.dk-ask { display: flex; gap: 10px; align-items: flex-start; font-size: 19px; font-weight: 800; line-height: 1.35; color: var(--ink); }
.dk-ask .no { flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--orange, #F47A2A); color: #fff; font-weight: 900; display: grid; place-items: center; }
.dk-step.ok .no { background: #2FB36B; } .dk-step.helped .no { background: #D69E2E; }
.dk-say { font-size: 18px; font-weight: 700; color: #13693E; white-space: pre-line; }
.dk-step.helped .dk-say { color: #7A5600; }
.dk-hint { font-size: 17px; font-weight: 700; color: #8E1F25; background: #FDE8E9; border-radius: 12px; padding: 8px 10px; }
.dk-opts { display: flex; flex-wrap: wrap; gap: 10px; }
.dk-opt { flex: 1 1 140px; min-height: 56px; padding: 8px 12px; border-radius: 16px; background: #F2FAFA; box-shadow: inset 0 0 0 3px #D6EFED, 0 4px 0 #D6EFED; font-size: 20px; font-weight: 800; color: var(--ink); }
.dk-opt.wrong { background: #FDE8E9; box-shadow: inset 0 0 0 3px var(--bad, #E5484D); animation: shake .4s; }
.dk-in-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dk-disp { min-width: 150px; min-height: 56px; padding: 0 14px; border-radius: 16px; background: #F2FAFA; box-shadow: inset 0 0 0 3px #D6EFED; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 30px; font-weight: 900; color: var(--ink); }
.dk-disp.wrong { box-shadow: inset 0 0 0 3px var(--bad, #E5484D); animation: shake .4s; }
.dk-disp .ph { color: #B4CBCF; } .dk-disp .unit { font-size: 18px; color: var(--ink-2); font-weight: 800; }
.dk-keys { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; max-width: 520px; }
.dk-keys .key { height: 50px; font-size: 24px; }
.dk-done { border-radius: 18px; padding: 14px 16px; background: #DDF5E6; color: #13693E; font-size: 21px; font-weight: 900; text-align: center; animation: screenIn .3s ease both; }
/* ① ISA teaches the kind on a chalkboard, scene by scene (user, 2026-11-24: "cách làm cần có hoạt ảnh và hướng dẫn
   chứ ko phải text khô khan") */
.dl-top { display: flex; align-items: center; gap: 10px; }
.dl-top h2 { flex: 1; }
.dl-auto { flex: none; min-height: 44px; padding: 0 14px; border-radius: 14px; font-size: 15px; font-weight: 800; background: #E9F8F7; color: #0E6E6A; box-shadow: inset 0 0 0 2px #BFE6E2; }
.dl-auto.on { background: #0E8C88; color: #fff; box-shadow: none; }
.dl-board { position: relative; min-height: 260px; border-radius: 20px; padding: 16px 20px 22px; border: 10px solid var(--wood, #B9793A);
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, .25), inset 0 0 50px rgba(0, 0, 0, .35), 0 0 0 3px var(--wood-d, #8A5527);
  background: radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, .07), transparent 55%), linear-gradient(170deg, #356A57 0%, var(--board, #2E5B4B) 45%, var(--board-d, #234639) 100%);
  color: var(--chalk, #F4F7F2); font-family: var(--chalk-font, sans-serif); display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
.dl-tag { align-self: flex-start; font: 800 14px var(--font, sans-serif); letter-spacing: .5px; text-transform: uppercase; color: #1E3A4C; background: var(--chalk-y, #FFE58A); border-radius: 10px; padding: 3px 10px; animation: bkPopIn .35s ease both; }
.dl-prob { font-size: 24px; line-height: 1.4; text-shadow: 0 0 1px rgba(255, 255, 255, .5); white-space: pre-line; }
.dl-prob.small { font-size: 17px; opacity: .75; }
.dl-n { display: inline-block; color: var(--chalk-y, #FFE58A); font-weight: 700; animation: dlNum .5s ease both; }
.dl-prob.small .dl-n { animation: none; }
@keyframes dlNum { 0% { transform: scale(1); } 45% { transform: scale(1.55); text-shadow: 0 0 14px rgba(255, 229, 138, .9); } 100% { transform: scale(1); } }
.dl-q { background: linear-gradient(var(--chalk-p, #FFB3C1), var(--chalk-p, #FFB3C1)) 0 100% / 0 3px no-repeat; padding-bottom: 2px; animation: dlLine 1s ease forwards; }
.dl-prob.small .dl-q { animation: none; background-size: 100% 2px; }
@keyframes dlLine { to { background-size: 100% 3px; } }
.dl-viz { display: flex; justify-content: center; animation: bkPopIn .4s ease both; }
.dl-viz > .viz { width: 100%; max-width: 520px; }
.dl-lines { display: flex; flex-direction: column; gap: 6px; }
.dl-line { font-size: 23px; line-height: 1.35; white-space: pre-line; }
.dl-line.old { opacity: .6; font-size: 19px; }
.dl-line .w { display: inline-block; opacity: 0; animation: dlWord .35s ease forwards; }
@keyframes dlWord { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.dl-line .ans { color: var(--chalk-g, #B8F0A8); font-weight: 700; }
.dl-done { align-self: center; margin-top: 4px; font-size: 30px; color: #1E3A4C; background: var(--chalk-g, #B8F0A8); border-radius: 14px; padding: 6px 18px; transform: rotate(-3deg); animation: dlStamp .5s cubic-bezier(.3, 1.6, .5, 1) both; }
@keyframes dlStamp { from { transform: scale(2.2) rotate(-12deg); opacity: 0; } to { transform: scale(1) rotate(-3deg); opacity: 1; } }
.dl-steps { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
.dl-steps li { display: flex; gap: 10px; align-items: flex-start; font-size: 21px; line-height: 1.35; opacity: 0; animation: dlWord .45s ease forwards; }
.dl-steps li b { flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--chalk-y, #FFE58A); color: #1E3A4C; font: 900 17px/32px var(--font, sans-serif); text-align: center; }
.dl-isa { display: flex; align-items: flex-end; gap: 10px; }
.dl-isa .mini-mascot { width: 86px; flex: none; }
.dl-isa .mini-mascot.hop { animation: dlHop .5s ease; }
@keyframes dlHop { 30% { transform: translateY(-12px) rotate(-4deg); } 60% { transform: translateY(0) rotate(2deg); } }
.dl-bubble { position: relative; flex: 1; min-width: 0; margin-bottom: 18px; background: #fff; border-radius: 20px; padding: 12px 16px; font-size: 19px; font-weight: 700; line-height: 1.4; color: var(--ink); box-shadow: var(--shadow); animation: bkPopIn .3s ease both; }
.dl-bubble::before { content: ''; position: absolute; left: -12px; bottom: 16px; border: 10px solid transparent; border-right: 14px solid #fff; border-left: 0; }
.dl-bubble.tip { background: #FFF6DB; } .dl-bubble.tip::before { border-right-color: #FFF6DB; }
.dl-nav { display: flex; align-items: center; gap: 10px; }
.dl-dots { flex: 1; display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; }
.dl-dots i { width: 10px; height: 10px; border-radius: 50%; background: #D6E4E7; transition: all .25s; }
.dl-dots i.on { width: 26px; border-radius: 6px; background: var(--orange, #F47A2A); }
.dl-dots i.seen { background: #9ED9D4; }
.dl-next.pulse { animation: dlPulse 1.6s ease-in-out infinite; }
@keyframes dlPulse { 50% { transform: scale(1.06); box-shadow: 0 0 0 6px rgba(244, 122, 42, .25); } }
@keyframes bkPopIn { from { transform: scale(.9); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .dl-board *, .dl-isa *, .dl-next { animation-duration: .01s !important; animation-iteration-count: 1 !important; } }
@media (max-width: 640px) {
  .dl-board { min-height: 220px; padding: 12px 14px 16px; border-width: 8px; }
  .dl-prob { font-size: 20px; } .dl-prob.small { font-size: 15px; } .dl-line { font-size: 19px; } .dl-line.old { font-size: 16px; }
  .dl-steps li { font-size: 18px; } .dl-done { font-size: 24px; }
  .dl-isa .mini-mascot { width: 64px; } .dl-bubble { font-size: 16px; padding: 10px 12px; }
  .dl-auto { font-size: 13px; padding: 0 10px; }
}
@media (max-width: 640px) {
  .dk-wrap { padding: 0 12px calc(16px + var(--safe-b, 0px)); }
  .dk-tab { font-size: 13px; min-height: 44px; }
  .dk-card { padding: 14px; } .dk-card h2 { font-size: 20px; }
  .dk-box, .dk-ask { font-size: 17px; } .dk-prob { font-size: 18px; } .dk-say { font-size: 16px; }
  .dk-keys .key { height: 44px; font-size: 21px; } .dk-list { grid-template-columns: 1fr; }
  .dk-intro { font-size: 15px; } .dk-intro b { font-size: 19px; } .dk-intro .mini-mascot { width: 54px; }
}
`;
  let api = null;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const kindsOf = n => (window.DT ? DT.of(n) : []);
  const doneMap = () => { const S = api.state(); if (!S.kinds || typeof S.kinds !== 'object') S.kinds = {}; return S.kinds; };
  const starsOf = k => (api.state().stars || {})['dt:' + k.id] || 0;
  const lessonName = k => { const r = k.lesson && api.lessonOf(k.lesson); return r ? `${r.lesson.book || ''} · ${r.lesson.title}` : ''; };
  function css() { if (!document.getElementById('kinds-css')) { const st = el('style'); st.id = 'kinds-css'; st.textContent = CSS; document.head.append(st); } }

  /* ---------- 1. the list ---------- */
  function showList(n) {
    css(); api.stopSpeech();
    const S = api.state();
    n = [1, 2, 3, 4, 5].includes(n) ? n : ([1, 2, 3, 4, 5].includes(S.kindGrade) ? S.kindGrade : ([1, 2, 3, 4, 5].includes(S.grade) ? S.grade : 1));
    S.kindGrade = n; api.save();
    const h = api.h;
    const tabs = h('div', { class: 'sem-tabs exam-tabs', style: { '--gc': '#7C5CE0' } }, ...[1, 2, 3, 4, 5].map(g => h('button', { class: 'sem-tab' + (g === n ? ' on' : ''), onclick: () => { if (g !== n) { api.sfx.tap(); showList(g); } } }, api.G(g))));
    const wrap = el('div', 'dk-wrap'), inn = el('div', 'dk-in');
    const intro = el('div', 'dk-intro');
    intro.append(h('div', { class: 'mini-mascot' }, api.mascot('happy')), h('div', null, h('b', null, L('Học dạng toán', 'Kinds of problem')),
      L('Bé cần biết bài toán nào thì chọn nhé, ISA sẽ cùng bé học tập!', 'Pick the kind of problem you want to know, and ISA will learn it with you!')));
    inn.append(intro);
    const all = kindsOf(n), done = doneMap();
    if (!all.length) inn.append(h('div', { class: 'card dk-empty' }, L(`Các dạng toán lớp ${n} đang được soạn…`, `The Grade ${n} kinds are coming soon…`)));
    for (const sem of [1, 2]) {
      const ks = all.filter(k => k.sem === sem);
      if (!ks.length) continue;
      const list = el('div', 'dk-list');
      ks.forEach(k => {
        const st = starsOf(k);
        const b = h('button', { class: 'dk-tile' + (done[k.id] || st ? ' done' : ''), onclick: () => { api.sfx.tap(); showKind(k.id, 0); } },
          h('span', { class: 'ic' }, k.icon || '🧩'), h('span', { class: 'tt' }, k.title), h('span', { class: 'st' }, st ? '⭐'.repeat(st) : done[k.id] ? '✓' : ''));
        list.append(b);
      });
      inn.append(h('section', { class: 'card dk-sec' }, h('h3', null, `${L('Học kì', 'Term')} ${sem} · ${ks.length} ${L('dạng toán', ks.length === 1 ? 'kind' : 'kinds')}`), list));
    }
    wrap.append(inn);
    api.screen(api.topbar(L('Học dạng toán', 'Kinds of problem'), L('Chọn lớp, rồi chọn dạng toán em muốn học', 'Choose a grade, then the kind you want to learn'), api.homeBtn(), [tabs]), wrap);
  }

  /* ---------- 2. one kind ---------- */
  function showKind(id, tab) {
    css(); api.stopSpeech();
    const k = window.DT && DT.get(id);
    if (!k) return showList();
    const h = api.h;
    const names = [L('① Hiểu dạng toán', '① Understand'), L('② Cùng làm từng bước', '② Step by step'), L('③ Tự luyện', '③ Practise')];
    const tabs = h('div', { class: 'dk-tabs' }, ...names.map((t, i) => h('button', { class: 'dk-tab' + (i === tab ? ' on' : ''), onclick: () => { api.sfx.tap(); if (i === 2) startPractice(k); else if (i !== tab) showKind(id, i); } }, t)));
    const wrap = el('div', 'dk-wrap'), inn = el('div', 'dk-in');
    inn.append(tabs, tab === 1 ? guideCard(k) : learnCard(k));
    wrap.append(inn);
    api.screen(api.topbar(`${k.icon || '🧩'} ${k.title}`, `${api.G(k.grade)}${lessonName(k) ? ' · ' + lessonName(k) : ''}`, api.backBtn(() => showList(k.grade)), []), wrap);
  }
  const startPractice = k => api.practice(k, () => showKind(k.id, 0));

  /* ① ISA teaches the kind on a chalkboard with one fresh example, scene by scene: read the problem (the numbers
     light up, the question is underlined) → the diagram → each step (ISA asks, the line of the solution is written
     in chalk word by word) → the answer stamped → "Ghi nhớ" (the method appears step by step) with the common
     mistake. Each scene is read aloud when the child moves to it; "Tự chạy" lets ISA go on by itself. */
  const stripNo = s => String(s).replace(/^(Bước|Step)\s*\d+\s*[:.]\s*/i, '');
  // chalk text with the numbers lit up one after another, and the question sentence underlined
  function chalkProblem(text, small) {
    const box = el('div', 'dl-prob' + (small ? ' small' : ''));
    const s = String(text), qAt = Math.max(s.lastIndexOf('Hỏi'), s.lastIndexOf('How'), s.lastIndexOf('What'));
    const body = qAt > 0 && /[?？]\s*$/.test(s) ? s.slice(0, qAt) : s, q = body === s ? '' : s.slice(qAt);
    let n = 0;
    // a number lights up only when it stands alone: the 4 of "lớp 4A" is part of a name, not a given
    const letter = c => !!c && /[\p{L}\d]/u.test(c);
    const fill = (into, part, delay0) => {
      const re = /\d+(?:[ .,]\d+)*/g;
      let at = 0, m;
      while ((m = re.exec(part))) {
        if (letter(part[m.index - 1]) || letter(part[m.index + m[0].length])) continue;
        if (m.index > at) into.append(document.createTextNode(part.slice(at, m.index)));
        const sp = el('span', 'dl-n', m[0]); sp.style.animationDelay = (delay0 + 0.35 * n++).toFixed(2) + 's'; into.append(sp);
        at = m.index + m[0].length;
      }
      if (at < part.length) into.append(document.createTextNode(part.slice(at)));
    };
    fill(box, body, 0.3);
    if (q) { const qs = el('span', 'dl-q'); qs.style.animationDelay = (0.4 + 0.35 * n).toFixed(2) + 's'; fill(qs, q, 0.4 + 0.35 * n); box.append(qs); }
    return box;
  }
  // one line of the solution, written word by word; the result after the last "=" is shown in green
  function chalkLine(text, old) {
    const line = el('div', 'dl-line' + (old ? ' old' : ''));
    const s = String(text), eq = s.lastIndexOf('= ');
    const words = s.split(/( +)/);
    let pos = 0, w = 0, unit = false;
    words.forEach(t => {
      const start = pos; pos += t.length;
      if (/^ +$/.test(t)) { line.append(document.createTextNode(t)); return; }
      if (/^\(/.test(t)) unit = true;                 // "(viên bi)" after the result stays plain chalk
      const sp = el('span', 'w' + (eq >= 0 && start > eq && !unit ? ' ans' : ''), t);
      if (old) sp.style.animation = 'none', sp.style.opacity = '1'; else sp.style.animationDelay = (0.25 + 0.12 * w++).toFixed(2) + 's';
      line.append(sp);
    });
    return line;
  }
  function learnCard(k) {
    const h = api.h;
    let g = null;
    try { g = k.guide(U.makeRng((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0)); } catch (e) { g = null; }
    let pic = null;
    if (g && g.visual) { try { pic = api.viz(g.visual, { size: 'md', theme: 'board' }); } catch (e) { pic = null; } }
    // the scenes: what ISA says, what the board shows, how ISA looks, what is read aloud
    const scenes = [];
    if (g && Array.isArray(g.steps)) {
      scenes.push({ mood: 'happy', tag: L('🔎 Đọc đề', '🔎 Read it'), bubble: L('Nhận ra dạng toán này: ', 'How to spot this kind: ') + k.spot,
        board: b => b.append(chalkProblem(g.prompt)), read: g.prompt + '. ' + k.spot });
      if (pic) scenes.push({ mood: 'happy', tag: L('✏️ Vẽ sơ đồ', '✏️ Draw it'), bubble: L('Mình vẽ sơ đồ cho dễ nhìn nhé!', 'Let\'s draw a diagram so it is easy to see!'),
        board: b => { b.append(chalkProblem(g.prompt, true)); const v = el('div', 'dl-viz'); v.append(pic); b.append(v); } });
      g.steps.forEach((st, i) => scenes.push({ mood: i === 0 ? 'think' : 'happy', tag: `${L('Bước', 'Step')} ${i + 1}`, bubble: st.ask,
        board: b => { b.append(chalkProblem(g.prompt, true)); const ls = el('div', 'dl-lines'); g.steps.slice(0, i + 1).forEach((p, j) => ls.append(chalkLine(p.say, j < i))); b.append(ls); },
        read: st.ask + '. ' + st.say }));
      scenes.push({ mood: 'cheer', tag: L('🎉 Đáp số', '🎉 Answer'), bubble: L('Xong rồi! Bé thấy dễ không nào?', 'Done! Easy, wasn\'t it?'),
        board: b => { const ls = el('div', 'dl-lines'); g.steps.forEach(p => ls.append(chalkLine(p.say, true))); b.append(ls, el('div', 'dl-done', g.done)); },
        read: L('Xong rồi! ', 'Done! ') + g.done });
    }
    scenes.push({ mood: 'think', tip: true, tag: L('🪜 Ghi nhớ cách làm', '🪜 Remember'), bubble: k.tip ? '💡 ' + k.tip : L('Bé nhớ các bước này nhé!', 'Remember these steps!'),
      board: b => { const ol = el('ol', 'dl-steps'); k.steps.forEach((s, i) => { const li = el('li'); li.style.animationDelay = (0.3 + 0.6 * i).toFixed(2) + 's'; li.append(el('b', null, String(i + 1)), el('span', null, stripNo(s))); ol.append(li); }); b.append(ol); },
      read: L('Ghi nhớ cách làm. ', 'Remember. ') + k.steps.map(stripNo).join('. ') + (k.tip ? '. ' + k.tip : '') });

    let cur = -1, auto = false, autoT = null;
    const seen = new Set();
    const board = el('div', 'dl-board'), isaBox = h('div', { class: 'mini-mascot' }), bubble = el('div', 'dl-bubble');
    const dots = el('div', 'dl-dots');
    scenes.forEach(() => dots.append(el('i')));
    const prev = h('button', { class: 'btn small ghost', 'aria-label': L('Cảnh trước', 'Back') }, '◀');
    const next = h('button', { class: 'btn small dl-next pulse' }, L('Tiếp ▶', 'Next ▶'));
    const autoBtn = h('button', { class: 'dl-auto' }, L('▶ Tự chạy', '▶ Play'));
    const card = h('div', { class: 'card dk-card' });
    const stopAuto = () => { auto = false; clearTimeout(autoT); autoBtn.classList.remove('on'); autoBtn.textContent = L('▶ Tự chạy', '▶ Play'); };
    function show(i) {
      if (!card.isConnected && cur >= 0) return;
      clearTimeout(autoT);
      cur = Math.max(0, Math.min(scenes.length - 1, i)); seen.add(cur);
      const sc = scenes[cur];
      board.innerHTML = ''; board.append(el('div', 'dl-tag', sc.tag)); sc.board(board);
      isaBox.innerHTML = ''; isaBox.append(api.mascot(sc.mood)); isaBox.classList.remove('hop'); void isaBox.offsetWidth; isaBox.classList.add('hop');
      bubble.className = 'dl-bubble' + (sc.tip ? ' tip' : ''); bubble.textContent = sc.bubble; void bubble.offsetWidth;
      [...dots.children].forEach((d, j) => { d.className = j === cur ? 'on' : seen.has(j) ? 'seen' : ''; });
      prev.disabled = cur === 0;
      const last = cur === scenes.length - 1;
      next.textContent = last ? L('Cùng làm ▶', 'Try it ▶') : L('Tiếp ▶', 'Next ▶');
      // read the scene; when playing by itself, go on once it has been read (or after a pause without a voice)
      const text = sc.read || sc.bubble;
      const u = api.speak(text.replace(/\s*→\s*/g, ', '));
      const goOn = () => { if (!auto || !card.isConnected) return; if (last) return stopAuto(); autoT = setTimeout(() => show(cur + 1), 900); };
      if (auto) {
        if (u && 'onend' in u) { const was = u.onend; u.onend = e => { if (was) was(e); goOn(); }; autoT = setTimeout(goOn, Math.max(9000, text.length * 110)); }
        else autoT = setTimeout(goOn, Math.max(3500, text.length * 65));
      }
    }
    prev.onclick = () => { api.sfx.tap(); stopAuto(); show(cur - 1); };
    next.onclick = () => { api.sfx.tap(); stopAuto(); if (cur === scenes.length - 1) showKind(k.id, 1); else show(cur + 1); };
    autoBtn.onclick = () => {
      api.sfx.tap();
      if (auto) { stopAuto(); api.stopSpeech(true); return; }
      auto = true; autoBtn.classList.add('on'); autoBtn.textContent = L('⏸ Dừng', '⏸ Pause');
      show(cur === scenes.length - 1 ? 0 : cur);
    };
    card.append(
      h('div', { class: 'dl-top' }, h('h2', null, `${k.icon || '🧩'} ${k.title}`), autoBtn),
      board,
      h('div', { class: 'dl-isa' }, isaBox, bubble),
      h('div', { class: 'dl-nav' }, prev, dots, next),
      h('div', { class: 'dk-actions' },
        h('button', { class: 'btn ghost', onclick: () => { api.sfx.tap(); stopAuto(); showKind(k.id, 1); } }, L('Bé cùng làm một ví dụ ▶', 'Work through an example ▶')),
        h('button', { class: 'btn teal', onclick: () => { api.sfx.tap(); stopAuto(); startPractice(k); } }, L('Tự luyện 10 câu ✏️', 'Practise 10 questions ✏️')),
        k.lesson && api.hasLesson(k.lesson) ? h('button', { class: 'btn ghost', onclick: () => { api.sfx.tap(); stopAuto(); api.startLesson(k.lesson); } }, L('📘 Xem bài trong sách', '📘 See the lesson')) : null));
    show(0);
    return card;
  }

  // a small number pad for one step
  function numberInput(A, onCheck) {
    const h = api.h;
    let input = '';
    const disp = el('div', 'dk-disp');
    const draw = () => { disp.innerHTML = ''; disp.append(input ? document.createTextNode(api.prettyInput(input)) : el('span', 'ph', '?')); if (A.unit) disp.append(el('span', 'unit', A.unit)); check.disabled = !input; };
    const check = h('button', { class: 'btn small', disabled: true, onclick: () => onCheck(Math.abs(U.parseNum(input) - A.value) < 1e-9, disp, () => { input = ''; draw(); }) }, L('Kiểm tra ✓', 'Check ✓'));
    const keys = el('div', 'dk-keys keypad');
    for (const c of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ',', '⌫']) {
      keys.append(h('button', { class: 'key' + (c === ',' || c === '⌫' ? ' fn' : ''), onclick: () => {
        api.sfx.tap(); disp.classList.remove('wrong');
        if (c === '⌫') input = input.slice(0, -1);
        else if (c === ',') { if (!input.includes(',')) input = (input || '0') + ','; }
        else if (input.replace(',', '').length < 9) input = (input === '0' ? '' : input) + c;
        draw();
      } }, c));
    }
    draw();
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, h('div', { class: 'dk-in-row' }, disp, check), keys);
  }

  function guideCard(k) {
    const h = api.h;
    let g;
    try { g = k.guide(U.makeRng((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0)); } catch (e) { console.error('guide', k.id, e); g = null; }
    if (!g || !Array.isArray(g.steps)) return h('div', { class: 'card dk-card' }, h('div', { class: 'dk-empty' }, L('Ví dụ này chưa sẵn sàng.', 'This example is not ready.')));
    const card = h('div', { class: 'card dk-card' }, h('h2', null, L('Cùng làm từng bước', 'Let\'s do it step by step')), h('div', { class: 'dk-prob' }, g.prompt));
    if (g.visual) { let v = null; try { v = api.viz(g.visual, { size: 'md', theme: 'paper' }); } catch (e) { v = null; } if (v) card.append(h('div', { class: 'dk-viz' }, v)); }
    const steps = el('div', 'dk-steps');
    card.append(steps);
    let helped = 0;
    const finish = () => {
      doneMap()[k.id] = 1; api.save();
      api.sfx.good();
      card.append(h('div', { class: 'dk-done' }, '🎉 ' + g.done),
        h('div', { class: 'dk-actions' },
          h('button', { class: 'btn ghost', onclick: () => { api.sfx.tap(); showKind(k.id, 1); } }, L('↻ Ví dụ khác', '↻ Another example')),
          h('button', { class: 'btn', onclick: () => { api.sfx.tap(); startPractice(k); } }, L('Tự luyện 10 câu ▶', 'Practise 10 questions ▶'))));
      const last = card.lastElementChild; if (last && last.scrollIntoView) setTimeout(() => last.scrollIntoView({ block: 'end', behavior: 'smooth' }), 80);
    };
    const showStep = i => {
      if (i >= g.steps.length) return finish();
      const st = g.steps[i], A = st.answer;
      let tries = 0;
      const row = el('div', 'dk-step cur');
      const ask = h('div', { class: 'dk-ask' }, h('span', { class: 'no' }, String(i + 1)), h('span', null, st.ask));
      const work = el('div');
      const hint = el('div', 'dk-hint'); hint.hidden = true;
      const settle = ok => {
        row.classList.remove('cur'); row.classList.add(ok ? 'ok' : 'helped');
        work.remove(); hint.remove();
        row.append(h('div', { class: 'dk-say' }, (ok ? '✓ ' : '👉 ') + st.say));
        if (!ok) helped++;
        setTimeout(() => showStep(i + 1), 350);
      };
      const wrong = (mark, reset) => {
        tries++; api.sfx.bad && api.sfx.bad();
        if (mark) { mark.classList.remove('wrong'); void mark.offsetWidth; mark.classList.add('wrong'); }
        if (tries >= 2) return settle(false);          // shown how, then on to the next step
        hint.textContent = '💡 ' + (st.hint || L('Chưa đúng, em đọc lại đề rồi thử lần nữa nhé.', 'Not quite. Read the problem again and have another go.'));
        hint.hidden = false;
        if (reset) setTimeout(reset, 450);
      };
      if (A.kind === 'choice' || A.kind === 'text') {
        const opts = el('div', 'dk-opts');
        A.options.forEach((o, j) => opts.append(h('button', { class: 'dk-opt', onclick: e => { api.sfx.tap(); if (j === A.correct) { api.sfx.good(); settle(true); } else wrong(e.currentTarget); } }, o)));
        work.append(opts);
      } else {
        work.append(numberInput(A, (ok, disp, reset) => { if (ok) { api.sfx.good(); settle(true); } else wrong(disp, reset); }));
      }
      row.append(ask, work, hint);
      steps.append(row);
      if (i > 0 && row.scrollIntoView) setTimeout(() => row.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
    };
    showStep(0);
    return card;
  }

  window.Kinds = { open: (a, n, id) => { api = a; if (id && window.DT && DT.get(id)) showKind(id, 0); else showList(n); } };
})();
