/* Toán ISA — "Giấy nháp" drawer: a pull-out ô-li sheet the child can write on with a finger or Apple Pencil
 * during practice and exams, then tuck away and carry on (user request).
 * API: Scratch.attach(key) shows the pull tab (a new key starts a clean sheet), Scratch.detach() hides it.
 */
(function () {
  'use strict';
  const CSS = `
.scr-root[hidden] { display: none; }
.scr-handle {
  position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 46;
  width: 54px; min-height: 132px; border-radius: 20px 0 0 20px; padding: 12px 0;
  background: #FFF8EC; color: #1E3A4C; box-shadow: -4px 6px 18px rgba(0, 40, 50, .25), inset 0 0 0 2px #F1E1C4;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  font: 800 16px/1.1 var(--font, sans-serif); touch-action: none; cursor: grab;
}
.scr-handle .scr-ic { font-size: 26px; }
.scr-handle .scr-tx { writing-mode: vertical-rl; letter-spacing: 1px; }
.scr-handle::before { content: ""; position: absolute; left: 8px; top: 50%; width: 4px; height: 34px; margin-top: -17px; border-radius: 2px; background: #E2CFA9; }
.scr-tip {
  position: fixed; right: 64px; top: 50%; transform: translateY(-50%); z-index: 46; pointer-events: none;
  background: #fff; color: #1E3A4C; font: 800 17px var(--font, sans-serif); padding: 10px 14px; border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 40, 50, .22); animation: scrTip 3.4s ease forwards;
}
.scr-tip::after { content: ""; position: absolute; right: -9px; top: 50%; margin-top: -9px; border: 9px solid transparent; border-right: 0; border-left-color: #fff; }
@keyframes scrTip { 0% { opacity: 0; transform: translate(10px, -50%); } 10%, 80% { opacity: 1; transform: translate(0, -50%); } 100% { opacity: 0; } }
.scr-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(560px, 48vw); z-index: 47;
  background: #FFFDF7; box-shadow: -10px 0 30px rgba(0, 40, 50, .28); border-radius: 26px 0 0 26px;
  display: flex; flex-direction: column; transform: translateX(105%); transition: transform .32s cubic-bezier(.3, 1.2, .5, 1);
  padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);
}
.scr-panel.open { transform: none; }
.scr-panel.dragging { transition: none; }
.scr-head { display: flex; align-items: center; gap: 8px; padding: 12px 14px 10px; border-bottom: 2px dashed #F1E1C4; flex-wrap: wrap; }
.scr-title { flex: 1; min-width: 180px; font: 900 21px var(--font, sans-serif); color: #E05A7A; }
.scr-btn {
  min-width: 48px; height: 48px; padding: 0 12px; border-radius: 16px; background: #F3F7F8; color: #1E3A4C;
  font: 800 16px var(--font, sans-serif); display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: inset 0 0 0 2px #E1EAEC; touch-action: manipulation;
}
.scr-btn.on { background: #FFF1E7; box-shadow: inset 0 0 0 3px #F47A2A; }
.scr-btn.close { background: #F47A2A; color: #fff; box-shadow: 0 4px 0 #D9611A; }
.scr-dot { width: 22px; height: 22px; border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(0, 0, 0, .12); }
.scr-tools { display: flex; gap: 8px; padding: 8px 14px; flex-wrap: wrap; }
.scr-tools .sep { width: 2px; background: #EFE4CF; margin: 4px 2px; }
.scr-sheet {
  position: relative; flex: 1; min-height: 0; margin: 0 12px 12px; border-radius: 14px; overflow: hidden;
  background-color: #fff;
  /* Vietnamese ô li: big squares with fine lines inside, plus a red margin line */
  background-image:
    linear-gradient(90deg, transparent 46px, #F4A6B3 46px, #F4A6B3 48px, transparent 48px),
    linear-gradient(#B9D3F0 1px, transparent 1px),
    linear-gradient(90deg, #B9D3F0 1px, transparent 1px),
    linear-gradient(#E3EEF9 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px, 10px 10px;
  box-shadow: inset 0 0 0 2px #EDE3CF;
}
.scr-sheet canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
@media (orientation: portrait), (max-width: 900px) {
  .scr-handle { top: auto; bottom: 0; right: 50%; transform: translateX(50%); width: 150px; min-height: 50px; border-radius: 20px 20px 0 0; flex-direction: row; padding: 0 12px; }
  .scr-handle .scr-tx { writing-mode: horizontal-tb; }
  .scr-handle::before { left: 50%; top: 6px; width: 34px; height: 4px; margin: 0 0 0 -17px; }
  .scr-tip { right: 50%; top: auto; bottom: 62px; transform: translateX(50%); animation-name: scrTipB; }
  .scr-tip::after { right: 50%; top: auto; bottom: -9px; margin: 0 -9px 0 0; border: 9px solid transparent; border-bottom: 0; border-top-color: #fff; }
  @keyframes scrTipB { 0% { opacity: 0; } 10%, 80% { opacity: 1; } 100% { opacity: 0; } }
  .scr-panel { top: auto; left: 0; width: auto; height: min(66vh, 720px); border-radius: 26px 26px 0 0; transform: translateY(105%); box-shadow: 0 -10px 30px rgba(0, 40, 50, .28); }
}
@media (prefers-reduced-motion: reduce) { .scr-panel { transition: none; } .scr-tip { animation: none; opacity: 0; } }
`;
  const COLORS = [['#1D4ED8', 'Bút xanh'], ['#E0313B', 'Bút đỏ'], ['#1F2933', 'Bút đen']];
  const bottomMode = () => matchMedia('(orientation: portrait), (max-width: 900px)').matches;

  let root, panel, handle, sheet, canvas, ctx;
  let key = null, isOpen = false, tipShown = false;
  let strokes = [], cur = null, penSeen = false;
  const tool = { color: COLORS[0][0], erase: false };
  const btns = {};

  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build() {
    if (root) return;
    const st = el('style'); st.id = 'scratch-css'; st.textContent = CSS; document.head.append(st);
    root = el('div', 'scr-root'); root.hidden = true;
    handle = el('button', 'scr-handle', '<span class="scr-ic">✏️</span><span class="scr-tx">Nháp</span>');
    handle.setAttribute('aria-label', 'Giấy nháp');
    panel = el('div', 'scr-panel');
    const head = el('div', 'scr-head');
    head.append(el('div', 'scr-title', 'Giấy nháp nè bé yêu 💕'));
    const close = el('button', 'scr-btn close', 'Thu lại ✓'); close.onclick = () => setOpen(false);
    head.append(close);
    const tools = el('div', 'scr-tools');
    for (const [c, name] of COLORS) {
      const b = el('button', 'scr-btn', `<span class="scr-dot" style="background:${c}"></span>`);
      b.setAttribute('aria-label', name);
      b.onclick = () => { tool.color = c; tool.erase = false; paintTools(); };
      btns[c] = b; tools.append(b);
    }
    btns.erase = el('button', 'scr-btn', '🧽 Tẩy'); btns.erase.onclick = () => { tool.erase = true; paintTools(); };
    tools.append(btns.erase, el('div', 'sep'));
    const undo = el('button', 'scr-btn', '↶'); undo.setAttribute('aria-label', 'Hoàn tác');
    undo.onclick = () => { strokes.pop(); redraw(); };
    const clear = el('button', 'scr-btn', '🗒️ Trang mới'); clear.onclick = () => { strokes = []; redraw(); };
    tools.append(undo, clear);
    sheet = el('div', 'scr-sheet');
    canvas = el('canvas'); sheet.append(canvas);
    panel.append(head, tools, sheet);
    root.append(handle, panel);
    document.body.append(root);
    ctx = canvas.getContext('2d');
    paintTools();
    bindDraw();
    bindHandle();
    new ResizeObserver(() => { if (isOpen) fit(); }).observe(sheet);
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) setOpen(false); });
  }
  function paintTools() {
    for (const [c] of COLORS) btns[c].classList.toggle('on', !tool.erase && tool.color === c);
    btns.erase.classList.toggle('on', tool.erase);
  }

  /* ---------- canvas ---------- */
  function fit() {
    const r = sheet.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }
  function drawStroke(s) {
    const p = s.pts;
    if (!p.length) return;
    ctx.save();
    ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = s.color; ctx.fillStyle = s.color;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (p.length === 1) {
      ctx.beginPath(); ctx.arc(p[0][0], p[0][1], width(s, p[0][2]) / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      for (let i = 1; i < p.length; i++) {
        const a = p[i - 1], b = p[i];
        const m0 = i > 1 ? [(p[i - 2][0] + a[0]) / 2, (p[i - 2][1] + a[1]) / 2] : a;
        const m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        ctx.lineWidth = width(s, b[2]);
        ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.quadraticCurveTo(a[0], a[1], m1[0], m1[1]); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function width(s, pressure) {
    if (s.erase) return 34;
    const base = 3.6;
    return s.pen ? base * (0.55 + (pressure || 0.5) * 1.1) : base;
  }
  function redraw() {
    if (!ctx) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore();
    for (const s of strokes) drawStroke(s);
  }
  function pos(e) { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, e.pressure]; }
  function bindDraw() {
    canvas.addEventListener('pointerdown', e => {
      if (e.pointerType === 'pen') penSeen = true;
      if (penSeen && e.pointerType === 'touch') return;      // palm rejection once an Apple Pencil is in use
      if (cur) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or lost pointer */ }
      cur = { id: e.pointerId, color: tool.color, erase: tool.erase, pen: e.pointerType === 'pen', pts: [pos(e)] };
      strokes.push(cur);
      drawStroke({ ...cur });
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', e => {
      if (!cur || e.pointerId !== cur.id) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs) cur.pts.push(pos(ev));
      // draw only the newest segments
      const n = cur.pts.length;
      drawStroke({ ...cur, pts: cur.pts.slice(Math.max(0, n - evs.length - 2)) });
      e.preventDefault();
    });
    const end = e => { if (cur && e.pointerId === cur.id) { cur = null; } };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  /* ---------- open / close, tap or drag the tab ---------- */
  function setOpen(v) {
    isOpen = v;
    panel.classList.remove('dragging');
    panel.style.transform = '';
    panel.classList.toggle('open', v);
    handle.style.visibility = v ? 'hidden' : '';
    if (v) requestAnimationFrame(fit);
  }
  function bindHandle() {
    let start = null, moved = false;
    handle.addEventListener('pointerdown', e => {
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or lost pointer */ }
      start = { x: e.clientX, y: e.clientY }; moved = false;
    });
    handle.addEventListener('pointermove', e => {
      if (!start) return;
      const b = bottomMode();
      const d = b ? start.y - e.clientY : start.x - e.clientX;       // how far the sheet is pulled out
      if (Math.abs(d) > 8) moved = true;
      if (!moved) return;
      const r = panel.getBoundingClientRect();
      const size = b ? r.height : r.width;
      const out = Math.max(0, Math.min(size, d));
      panel.classList.add('dragging');
      panel.style.transform = b ? `translateY(${size - out}px)` : `translateX(${size - out}px)`;
    });
    const up = e => {
      if (!start) return;
      const b = bottomMode();
      const d = b ? start.y - e.clientY : start.x - e.clientX;
      start = null;
      if (!moved) return setOpen(!isOpen);
      const size = b ? panel.getBoundingClientRect().height : panel.getBoundingClientRect().width;
      setOpen(d > size * 0.25);
    };
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', () => { start = null; setOpen(isOpen); });
  }

  function attach(k) {
    build();
    if (k !== key) { key = k; strokes = []; redraw(); }
    root.hidden = false;
    document.body.classList.add('scratch-on');   // portrait: the app keeps room above the bottom "Nháp" tab
    if (!tipShown) {
      tipShown = true;
      const tip = el('div', 'scr-tip', 'Giấy nháp nè bé yêu! ✏️');
      root.append(tip);
      setTimeout(() => tip.remove(), 3600);
    }
  }
  function detach() {
    if (!root) return;
    if (isOpen) setOpen(false);
    root.hidden = true;
    document.body.classList.remove('scratch-on');
  }
  window.Scratch = { attach, detach, isOpen: () => isOpen };
})();
