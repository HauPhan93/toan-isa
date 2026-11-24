/* Toán ISA — "Học dạng toán": the kinds of problem of each grade, taught step by step (user, 2026-11-23).
 * Content: js/content/dangtoan-lopN.js (window.DT). Screens here:
 *   1. the list — a grade switch on top, the kinds of that grade by học kì;
 *   2. one kind — ① Hiểu dạng toán (how to recognise it, the method, a common mistake),
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
      L('Chưa hiểu dạng nào thì bấm vào dạng đó: ISA chỉ cách nhận biết, cùng em làm từng bước rồi cho em tự luyện.', 'Tap a kind you are not sure about: ISA shows how to spot it, works through it with you step by step, then lets you practise.')));
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

  function learnCard(k) {
    const h = api.h;
    const say = h('button', { class: 'say-btn', 'aria-label': L('Nghe đọc', 'Listen'), html: api.SPEAKER_SVG });
    say.onclick = () => api.speak([k.title, k.spot].concat(k.steps, k.tip ? [k.tip] : []).join('. '), say);
    const ol = h('ol', null, ...k.steps.map(s => h('li', null, h('span', null, s.replace(/^(Bước|Step)\s*\d+\s*[:.]\s*/i, '')))));
    return h('div', { class: 'card dk-card' },
      h('div', { style: { display: 'flex', gap: '12px', alignItems: 'flex-start' } }, h('h2', { style: { flex: '1' } }, `${k.icon || '🧩'} ${k.title}`), say),
      h('div', { class: 'dk-box dk-spot' }, h('b', { class: 'lbl' }, L('🔎 Nhận biết', '🔎 How to spot it')), k.spot),
      h('div', { class: 'dk-box dk-how' }, h('b', { class: 'lbl' }, L('🪜 Cách làm', '🪜 What to do')), ol),
      k.tip ? h('div', { class: 'dk-box dk-tip' }, h('b', { class: 'lbl' }, L('💡 Lưu ý', '💡 Watch out')), k.tip) : null,
      h('div', { class: 'dk-actions' },
        h('button', { class: 'btn', onclick: () => { api.sfx.tap(); showKind(k.id, 1); } }, L('Cùng làm một ví dụ ▶', 'Work through an example ▶')),
        h('button', { class: 'btn teal', onclick: () => { api.sfx.tap(); startPractice(k); } }, L('Tự luyện 10 câu ✏️', 'Practise 10 questions ✏️')),
        k.lesson && api.hasLesson(k.lesson) ? h('button', { class: 'btn ghost', onclick: () => { api.sfx.tap(); api.startLesson(k.lesson); } }, L('📘 Xem bài trong sách', '📘 See the lesson')) : null));
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
