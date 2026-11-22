/* Toán ISA — visual + manipulative library.
 * Defines window.V = { render(type, params, ctx), types }.
 * ctx: { interactive?: bool, onChange?: fn(value), size?: 'sm'|'md'|'lg', theme?: 'light'|'board', chalk?: bool }
 * Every visual is SVG/DOM built in code; never throws (bad params -> small placeholder).
 * Theme: colours come from the palette K, chosen per render ('light' white card, 'board' green chalkboard).
 */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const FONT = '-apple-system, "SF Pro Rounded", "Nunito", "Segoe UI", sans-serif';
  const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

  const BASE = {
    teal: '#12A39E', cyan: '#5CE4D3', orange: '#F47A2A', ink: '#1E3A4C', sun: '#FFC93C',
    berry: '#FF6B8A', leaf: '#5BC85B', sky: '#4DA3FF', purple: '#9B7BFF', cream: '#FFF8EC',
  };
  const LIGHT = Object.assign({}, BASE, {
    theme: 'light', paper: '#FFFFFF', sub: '#5C7686', line: '#C9D6DE', faint: '#EEF4F6',
    grey: '#9AA9B3', wood: '#F2C46D', shadow: 'rgba(30,58,76,.12)', glass: '#EEF8FB',
  });
  const BOARD = {
    theme: 'board', teal: '#B8F0A8', cyan: '#9FD8FF', orange: '#FFC08A', ink: '#F4F7F2', sun: '#FFE58A',
    berry: '#FFB3C1', leaf: '#B8F0A8', sky: '#9FD8FF', purple: '#D9C8FF', cream: 'rgba(244,247,242,.07)',
    paper: 'rgba(244,247,242,.04)', sub: 'rgba(244,247,242,.78)', line: 'rgba(244,247,242,.38)',
    faint: 'rgba(244,247,242,.10)', grey: 'rgba(244,247,242,.6)', wood: '#FFE58A', shadow: 'rgba(0,0,0,0)',
    glass: 'rgba(159,216,255,.08)',
  };
  let K = LIGHT;               // current palette (set at the start of every render; renderers are synchronous)
  const isBoard = () => K.theme === 'board';
  const PALK = ['teal', 'orange', 'sky', 'berry', 'leaf', 'purple', 'sun'];
  const pal = i => K[PALK[((i % PALK.length) + PALK.length) % PALK.length]];

  /* ---------- colour helpers (theme aware) ---------- */
  function hexRgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return isFinite(n) && h.length === 6 ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : null;
  }
  function mix(c1, c2, t) {
    const a = hexRgb(c1), b = hexRgb(c2);
    if (!a || !b) return c1;
    const m = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return '#' + m.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function rgba(c, a) { const r = hexRgb(c); return r ? `rgba(${r[0]},${r[1]},${r[2]},${a})` : c; }
  /** Main fill of a coloured surface. */
  const solid = c => (isBoard() ? rgba(c, 0.5) : c);
  /** Light tint fill (s: 0..1 strength). */
  const tint = (c, s) => (isBoard() ? rgba(c, 0.1 + 0.4 * (s == null ? 0.3 : s)) : mix('#FFFFFF', c, s == null ? 0.3 : s));
  /** Stroke for a coloured surface. */
  const edge = c => (isBoard() ? c : mix(c, '#1E3A4C', 0.28));
  /** Text drawn on top of a solid fill. */
  const onSolid = () => (isBoard() ? K.ink : '#FFFFFF');

  /* ---------- small utils ---------- */
  const fmt = (n, d) => (window.U && typeof U.fmt === 'function' ? U.fmt(n, d) : String(n));
  /** i18n: U.L(vi, en) with a Vietnamese fallback when util.js is missing. (Not named L: many renderers use a local L.) */
  const LL = (vi, en) => (window.U && typeof U.L === 'function' ? U.L(vi, en) : vi);
  const isEN = () => !!(window.U && U.EN);
  /** English only: font size that keeps text s inside maxW (Vietnamese keeps its size unchanged). */
  const fitSize = (s, size, maxW) => (isEN() && tw(s, size) > maxW ? Math.max(10, Math.floor(size * maxW / tw(s, size))) : size);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const num = (v, def) => { const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v); return v != null && v !== '' && isFinite(n) ? n : def; };
  const int = (v, def, lo, hi) => clamp(Math.round(num(v, def)), lo, hi);
  const r6 = x => Math.round(x * 1e6) / 1e6;
  const arr = v => (Array.isArray(v) ? v : []);
  const isStr = v => typeof v === 'string';
  const label = (v, unit) => (v == null ? '' : isStr(v) ? v : fmt(v) + (unit ? ' ' + unit : ''));
  const EMOJI_RE = /\p{Extended_Pictographic}/u;
  const isEmoji = s => isStr(s) && s.length <= 8 && EMOJI_RE.test(s);
  let UID = 0;
  const uid = p => 'viz' + (p || '') + (++UID);
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function seeded(seed) { let a = (seed >>> 0) || 7; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }

  /* ---------- SVG building ---------- */
  function mk(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'text') n.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else n.setAttribute(k, v);
    }
    if (parent) parent.appendChild(n);
    return n;
  }
  /** Text, centred on (x, y) by default. */
  function T(p, x, y, s, o) {
    o = o || {};
    return mk('text', {
      x, y, 'text-anchor': o.anchor || 'middle', 'dominant-baseline': 'central',
      'font-size': o.size || 16, 'font-weight': o.weight || 700, fill: o.fill || K.ink,
      class: o.cls, opacity: o.opacity, transform: o.transform, 'letter-spacing': o.ls, text: String(s),
    }, p);
  }
  /** Emoji as SVG text. */
  function E(p, x, y, s, size, o) {
    o = o || {};
    return mk('text', {
      x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size || 32,
      'font-family': EMOJI_FONT, class: 'viz-emo' + (o.cls ? ' ' + o.cls : ''), opacity: o.opacity, text: s,
    }, p);
  }
  /** Group with an entrance animation class. Never put a transform attribute on it (CSS would override it). */
  function A(p, cls, delay, extra) {
    const g = mk('g', { class: cls }, p);
    if (delay) g.style.animationDelay = Math.round(delay) + 'ms';
    if (extra) Object.assign(g.style, extra);
    return g;
  }
  const G = (p, tr) => mk('g', tr ? { transform: tr } : null, p);
  function line(p, x1, y1, x2, y2, stroke, w, o) {
    o = o || {};
    return mk('line', { x1, y1, x2, y2, stroke: stroke || K.ink, 'stroke-width': w || 2, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash, opacity: o.opacity, class: o.cls }, p);
  }
  function path(p, d, fill, stroke, w, o) {
    o = o || {};
    return mk('path', { d, fill: fill || 'none', stroke: stroke || 'none', 'stroke-width': w || 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': o.dash, opacity: o.opacity, class: o.cls, pathLength: o.pl }, p);
  }
  function rect(p, x, y, w, h, rx, fill, stroke, sw, o) {
    o = o || {};
    return mk('rect', { x, y, width: Math.max(0, w), height: Math.max(0, h), rx: rx || 0, fill: fill || 'none', stroke: stroke || 'none', 'stroke-width': sw || 0, 'stroke-dasharray': o.dash, opacity: o.opacity, class: o.cls }, p);
  }
  function circle(p, cx, cy, r, fill, stroke, sw, o) {
    o = o || {};
    return mk('circle', { cx, cy, r, fill: fill || 'none', stroke: stroke || 'none', 'stroke-width': sw || 0, opacity: o.opacity, class: o.cls, 'stroke-dasharray': o.dash }, p);
  }
  /** Stacked fraction n/d centred at (x, y). */
  function fracText(p, x, y, n, d, size, fill) {
    size = size || 24; fill = fill || K.ink;
    const w = Math.max(String(n).length, String(d).length) * size * 0.62 + 8;
    T(p, x, y - size * 0.62, n, { size, fill });
    line(p, x - w / 2, y, x + w / 2, y, fill, Math.max(2, size / 10));
    T(p, x, y + size * 0.66, d, { size, fill });
  }
  /** Horizontal curly brace from x1 to x2 at y. dir -1 = tip up, +1 = tip down. Returns tip y. */
  function hBrace(p, x1, x2, y, dir, stroke, depth) {
    const h = (depth || 8) * dir, m = (x1 + x2) / 2, q = Math.min(12, Math.abs(x2 - x1) / 4);
    path(p, `M${x1},${y} Q${x1},${y + h} ${x1 + q},${y + h} L${m - q},${y + h} Q${m},${y + h} ${m},${y + 2 * h} Q${m},${y + h} ${m + q},${y + h} L${x2 - q},${y + h} Q${x2},${y + h} ${x2},${y}`, 'none', stroke || K.ink, 2.2);
    return y + 2 * h;
  }
  /** Vertical brace from y1 to y2 at x, tip to the right (dir +1) or left (-1). Returns tip x. */
  function vBrace(p, x, y1, y2, dir, stroke, depth) {
    const h = (depth || 8) * dir, m = (y1 + y2) / 2, q = Math.min(12, Math.abs(y2 - y1) / 4);
    path(p, `M${x},${y1} Q${x + h},${y1} ${x + h},${y1 + q} L${x + h},${m - q} Q${x + h},${m} ${x + 2 * h},${m} Q${x + h},${m} ${x + h},${m + q} L${x + h},${y2 - q} Q${x + h},${y2} ${x},${y2}`, 'none', stroke || K.ink, 2.2);
    return x + 2 * h;
  }
  /** Approximate text width. */
  const tw = (s, size) => String(s).length * size * 0.56;

  /* ---------- animation helpers ---------- */
  function whenLive(node, fn) {
    let n = 0;
    const chk = () => { if (node.isConnected) fn(); else if (n++ < 1200) requestAnimationFrame(chk); };
    requestAnimationFrame(chk);
  }
  function tween(dur, step, done) {
    if (reduced() || dur <= 0) { step(1); if (done) done(); return; }
    let t0 = null;
    const f = t => {
      if (t0 == null) t0 = t;
      const pr = Math.min(1, (t - t0) / dur);
      step(pr);
      if (pr < 1) requestAnimationFrame(f); else if (done) done();
    };
    requestAnimationFrame(f);
  }
  function later(ms, fn) { if (reduced()) fn(); else setTimeout(fn, ms); }
  /** Run async steps in sequence: each is fn(next). */
  function chain(list, i) {
    i = i || 0;
    if (i >= list.length) return;
    list[i](() => chain(list, i + 1));
  }
  const setXY = (node, x, y, extra) => { node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` + (extra || ''); };

  /* ---------- CSS (injected once) ---------- */
  const CSS = `
.viz{position:relative;width:100%;margin:0 auto;color:#1E3A4C;font-family:${FONT};-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}
.viz>svg{display:block;width:100%;height:auto;margin:0 auto;overflow:visible}
.viz-sm>svg{max-height:180px}.viz-md>svg{max-height:320px}.viz-lg>svg{max-height:420px}
.viz text{font-family:${FONT};paint-order:stroke}
.viz text.viz-emo{font-family:${EMOJI_FONT};font-weight:400}
.viz-board{color:#F4F7F2}
.viz-board text{font-family:"Patrick Hand","Chalkboard SE","Chalkboard",var(--font,${FONT});font-weight:400!important;letter-spacing:.3px}
.viz-board text.viz-emo{font-family:${EMOJI_FONT}}
.viz-touch{touch-action:none;cursor:pointer}
.viz-tap{cursor:pointer}
.viz-ph{display:flex;align-items:center;justify-content:center;min-height:64px;border:2px dashed #C9D6DE;border-radius:16px;color:#5C7686;font:600 15px ${FONT};padding:10px;text-align:center}
.viz-board .viz-ph,.viz-ph.viz-board{border-color:rgba(244,247,242,.4);color:#F4F7F2}
.viz-mascot{display:inline-block;width:auto;line-height:0}
.viz-mascot>svg{width:auto;max-height:none;overflow:visible}
.viz-steps{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:8px}
.viz-cap{min-height:24px;font:600 17px/1.35 ${FONT};color:#1E3A4C;text-align:center;max-width:560px;padding:0 8px}
.viz-board .viz-cap{color:#F4F7F2;font-family:"Patrick Hand","Chalkboard SE",var(--font,${FONT});font-size:19px;font-weight:400}
.viz-btn{min-height:52px;min-width:150px;padding:0 24px;border:0;border-radius:26px;background:#F47A2A;color:#fff;font:700 18px ${FONT};box-shadow:0 4px 0 #C95D17;cursor:pointer;touch-action:manipulation}
.viz-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #C95D17}
.viz-board .viz-btn{background:rgba(255,192,138,.18);color:#FFE58A;border:2px solid #FFC08A;box-shadow:none;font-family:"Patrick Hand","Chalkboard SE",var(--font,${FONT});font-weight:400;font-size:20px}
.viz-table{border-collapse:separate;border-spacing:0;margin:4px auto;font:600 17px ${FONT};color:#1E3A4C;border-radius:16px;overflow:hidden;box-shadow:0 0 0 2px #12A39E}
.viz-table th{background:#12A39E;color:#fff;padding:10px 16px;font-weight:700}
.viz-table td{padding:9px 16px;text-align:center;background:#fff;border-top:1px solid #DCEBEA}
.viz-table tr:nth-child(even) td{background:#F1FAF9}
.viz-table td:first-child{font-weight:700;text-align:left}
.viz-board .viz-table{color:#F4F7F2;box-shadow:0 0 0 2px rgba(244,247,242,.7);font-family:"Patrick Hand","Chalkboard SE",var(--font,${FONT});font-weight:400;font-size:20px}
.viz-board .viz-table th{background:rgba(244,247,242,.12);color:#FFE58A;font-weight:400;border-bottom:2px solid rgba(244,247,242,.6)}
.viz-board .viz-table td{background:transparent!important;border-top:1px solid rgba(244,247,242,.3)}
.viz-board .viz-table td:first-child{font-weight:400;color:#FFE58A}
@keyframes viz-pop{0%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
.viz-pop{transform-box:fill-box;transform-origin:center;animation:viz-pop .5s cubic-bezier(.3,1.3,.5,1) both}
@keyframes viz-drop{0%{opacity:0;transform:translateY(-46px)}55%{opacity:1;transform:translateY(3px)}75%{transform:translateY(-4px)}100%{opacity:1;transform:none}}
.viz-drop{animation:viz-drop .6s ease-out both}
@keyframes viz-fade{from{opacity:0}to{opacity:1}}
.viz-fade{animation:viz-fade .6s ease both}
@keyframes viz-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.viz-rise{animation:viz-rise .5s ease-out both}
@keyframes viz-gy{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.viz-gy{transform-box:fill-box;transform-origin:50% 100%;animation:viz-gy .8s cubic-bezier(.2,.9,.3,1) both}
@keyframes viz-gx{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.viz-gx{transform-box:fill-box;transform-origin:0 50%;animation:viz-gx .8s cubic-bezier(.2,.9,.3,1) both}
@keyframes viz-slide{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:none}}
.viz-slide{animation:viz-slide .9s cubic-bezier(.2,.9,.3,1) both}
@keyframes viz-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.viz-draw{stroke-dasharray:1 1;animation:viz-draw 1.4s ease-in-out both}
@keyframes viz-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.viz-bob{animation:viz-bob 3.2s ease-in-out infinite}
@keyframes viz-wave{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
.viz-wave{animation:viz-wave .9s ease-in-out infinite}
@keyframes viz-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
.viz-blink{transform-box:fill-box;transform-origin:center;animation:viz-blink 4.5s ease-in-out infinite}
@keyframes viz-pulse{0%,100%{opacity:1}50%{opacity:.55}}
.viz-pulse{animation:viz-pulse 1.6s ease-in-out infinite}
.viz-sel{transition:opacity .2s}
@media (prefers-reduced-motion:reduce){.viz *{animation:none!important;transition:none!important}}
`;
  function injectCss() {
    if (document.getElementById('viz-css')) return;
    const s = document.createElement('style');
    s.id = 'viz-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- root / svg ---------- */
  function sizeOf(ctx) { return ctx && (ctx.size === 'sm' || ctx.size === 'lg') ? ctx.size : 'md'; }
  /** Create the svg inside root with a viewBox; in board theme add the chalk filter on a content group. Returns the content group. */
  function svgIn(root, w, h, o) {
    o = o || {};
    w = Math.max(10, Math.round(w)); h = Math.max(10, Math.round(h));
    const svg = mk('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: 'img', 'aria-label': o.aria || '' });
    root.appendChild(svg);
    root._svg = svg;
    let g = mk('g', null, svg);
    if (isBoard() && root._chalk !== false) {
      const id = uid('chalk');
      const f = mk('filter', { id, x: '-5%', y: '-5%', width: '110%', height: '110%' }, mk('defs', null, svg));
      mk('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.85', numOctaves: 1, seed: 3, result: 'n' }, f);
      mk('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 1.6, xChannelSelector: 'R', yChannelSelector: 'G' }, f);
      g.setAttribute('filter', `url(#${id})`);
    }
    return g;
  }
  function placeholder(msg, board) {
    injectCss();
    const d = document.createElement('div');
    d.className = 'viz viz-ph' + (board ? ' viz-board' : '');
    d.textContent = msg || LL('Hình minh hoạ', 'Picture');
    return d;
  }
  function emit(ctx, root, v) {
    if (ctx && typeof ctx.onChange === 'function') { try { ctx.onChange(v); } catch (e) { console.warn('[V] onChange', e); } }
  }
  /** Map a pointer event to SVG user coordinates. */
  function svgPt(svg, e) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const r = pt.matrixTransform(m.inverse());
    return { x: r.x, y: r.y };
  }

  const R = {};   // renderers: R[type](params, ctx, root)

  /* =====================================================================
   * mascot — the original ISA rover
   * ===================================================================== */
  function drawRover(p, mood, animate) {
    const L = LIGHT;          // the rover always keeps its own colours
    const g = mk('g', null, p);
    mk('ellipse', { cx: 100, cy: 213, rx: 64, ry: 7, fill: '#1E3A4C', opacity: 0.12 }, g);
    const bob = animate ? A(g, 'viz-bob') : mk('g', null, g);
    // antenna
    line(bob, 100, 30, 100, 12, '#8A9BA6', 4);
    circle(bob, 100, 10, 7.5, mood === 'cheer' ? L.sun : L.orange, '#FFFFFF', 2);
    // arms (behind body)
    const armAng = { happy: [32, -32], think: [30, -138], cheer: [150, -150], oops: [12, -12] }[mood] || [32, -32];
    [[50, armAng[0]], [150, armAng[1]]].forEach(([sx, ang], i) => {
      const og = G(bob, `translate(${sx},128) rotate(${ang})`);
      const ig = mk('g', { class: animate && mood === 'cheer' ? 'viz-wave' : null }, og);
      if (animate && mood === 'cheer') { ig.style.transformOrigin = '0px 0px'; ig.style.animationDelay = (i * 0.25) + 's'; }
      line(ig, 0, 0, 0, 27, '#9AA9B3', 9);
      path(ig, 'M-7,27 Q-10,37 -3,40 M7,27 Q10,37 3,40', 'none', '#7F909B', 5);
    });
    // treads
    [[42, 98], [102, 158]].forEach(([x0, x1]) => {
      path(bob, `M${x0},177 L${x1},177 L${x1 - 7},205 L${x0 + 7},205 Z`, '#3E5566', '#3E5566', 8);
      for (let i = 0; i < 3; i++) {
        const cx = x0 + 12 + i * ((x1 - x0 - 24) / 2);
        circle(bob, cx, 191, 8.5, '#C9D6DE');
        circle(bob, cx, 191, 3, '#3E5566');
      }
    });
    // neck + body
    rect(bob, 88, 92, 24, 16, 4, '#B7C4CC');
    rect(bob, 48, 104, 104, 76, 22, '#E0651A');
    rect(bob, 48, 104, 104, 66, 22, L.orange);
    rect(bob, 58, 110, 34, 8, 4, '#FFFFFF', null, 0, { opacity: 0.3 });
    rect(bob, 70, 124, 60, 28, 9, '#FFFFFF');
    mk('text', { x: 100, y: 139, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 17, 'font-weight': 800, fill: L.teal, 'letter-spacing': 1.5, 'font-family': FONT, text: 'ISA' }, bob);
    // head
    path(bob, 'M54,92 L54,72 A46,44 0 0 1 146,72 L146,92 Q146,99 139,99 L61,99 Q54,99 54,92 Z', '#FFFFFF', '#D3DFE5', 2.5);
    path(bob, 'M66,46 Q78,36 94,34', 'none', '#E9F1F4', 5);
    rect(bob, 62, 56, 76, 28, 14, L.ink);
    const eyes = mk('g', { class: animate && (mood === 'happy' || mood === 'think') ? 'viz-blink' : null }, bob);
    const cy = L.cyan;
    if (mood === 'cheer') {
      path(eyes, 'M79,74 Q86,62 93,74 M107,74 Q114,62 121,74', 'none', cy, 4.5);
    } else if (mood === 'oops') {
      path(eyes, 'M80,66 L91,74 M80,74 L91,66 M109,66 L120,74 M109,74 L120,66', 'none', cy, 3.5);
    } else if (mood === 'think') {
      circle(eyes, 90, 67, 5.5, cy); circle(eyes, 118, 67, 5.5, cy);
      circle(eyes, 92, 65, 1.8, '#FFFFFF'); circle(eyes, 120, 65, 1.8, '#FFFFFF');
    } else {
      circle(eyes, 86, 70, 6.5, cy); circle(eyes, 114, 70, 6.5, cy);
      circle(eyes, 88.5, 67.5, 2, '#FFFFFF'); circle(eyes, 116.5, 67.5, 2, '#FFFFFF');
    }
    // mouth
    if (mood === 'oops') circle(bob, 100, 91, 3.2, 'none', L.ink, 2.4);
    else if (mood === 'think') line(bob, 94, 91, 106, 90, L.ink, 2.4);
    else path(bob, mood === 'cheer' ? 'M91,88 Q100,97 109,88' : 'M93,89 Q100,94 107,89', 'none', L.ink, 2.6);
    // extras
    if (mood === 'think') {
      circle(bob, 156, 50, 3.5, '#FFFFFF', '#C9D6DE', 1.5);
      circle(bob, 166, 37, 5, '#FFFFFF', '#C9D6DE', 1.5);
      circle(bob, 181, 20, 10, '#FFFFFF', '#C9D6DE', 1.5);
      mk('text', { x: 181, y: 21, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 13, 'font-weight': 800, fill: L.teal, 'font-family': FONT, text: '?' }, bob);
    } else if (mood === 'cheer') {
      [[30, 58, 1], [170, 52, 0.8], [162, 92, 0.6]].forEach(([x, y, s]) => path(bob, star(x, y, 9 * s, 4 * s), L.sun, '#FFFFFF', 1.2));
    } else if (mood === 'oops') {
      path(bob, 'M153,52 Q147,62 153,66 Q159,62 153,52 Z', L.sky, '#FFFFFF', 1.2);
    }
    return g;
  }
  function star(cx, cy, R1, r1, n) {
    n = n || 5;
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r1 : R1, a = -Math.PI / 2 + i * Math.PI / n;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  R.mascot = (p, ctx, root) => {
    const mood = ['happy', 'think', 'cheer', 'oops'].includes(p.mood) ? p.mood : 'happy';
    const sz = p.size != null ? p.size : ctx.size;
    const px = typeof sz === 'number' ? clamp(sz, 24, 800) : ({ sm: 72, md: 140, lg: 220 }[sz] || 140);
    root.classList.remove('viz-board');
    const svg = mk('svg', { viewBox: '0 0 200 224', width: 200, height: 224, role: 'img', 'aria-label': LL('Rô-bốt ISA', 'ISA the robot') }, root);
    svg.style.height = px + 'px';
    drawRover(svg, mood, true);
  };

  /* =====================================================================
   * blocks — base-10 blocks
   * ===================================================================== */
  function unitGrid(g, x, y, cols, rows, u, color) {
    rect(g, x + 3, y + 3, cols * u, rows * u, 2, isBoard() ? 'none' : K.shadow);
    rect(g, x, y, cols * u, rows * u, 2, solid(color), edge(color), 1.6);
    const ec = edge(color);
    for (let i = 1; i < cols; i++) line(g, x + i * u, y, x + i * u, y + rows * u, ec, 0.9, { opacity: 0.55 });
    for (let j = 1; j < rows; j++) line(g, x, y + j * u, x + cols * u, y + j * u, ec, 0.9, { opacity: 0.55 });
  }
  function thousandCube(g, x, y, s, color) {
    // front face s×s at (x, y+d), depth offset
    const d = s * 0.32, f = y + d;
    const top = tint(color, 0.55), side = isBoard() ? rgba(color, 0.25) : mix(color, '#1E3A4C', 0.18);
    path(g, `M${x},${f} L${x + d},${y} L${x + s + d},${y} L${x + s},${f} Z`, top, edge(color), 1.6);
    path(g, `M${x + s},${f} L${x + s + d},${y} L${x + s + d},${y + s} L${x + s},${f + s} Z`, side, edge(color), 1.6);
    unitGrid(g, x, f, 10, 10, s / 10, color);
    const ec = edge(color);
    for (let i = 1; i < 10; i++) {
      const t = i / 10;
      line(g, x + s * t, f, x + s * t + d, y, ec, 0.7, { opacity: 0.5 });
      line(g, x + s + d * t, f - d * t, x + s + d * t, f - d * t + s, ec, 0.7, { opacity: 0.5 });
    }
  }
  R.blocks = (p, ctx, root) => {
    const cnt = [int(p.thousands, 0, 0, 12), int(p.hundreds, 0, 0, 15), int(p.tens, 0, 0, 20), int(p.ones, 0, 0, 30)];
    const names = ['nghìn', 'trăm', 'chục', 'đơn vị'];
    const NAMES_EN = [['thousand', 'thousands'], ['hundred', 'hundreds'], ['ten', 'tens'], ['one', 'ones']];
    const cols = [K.purple, K.sky, K.leaf, K.sun];
    const u = 9, S = 90;
    const groups = [];
    cnt.forEach((c, k) => {
      if (!c) return;
      let w, h, items = [];
      if (k === 0) {
        const per = 3, cs = 64, d = cs * 0.32, rows = Math.ceil(c / per);
        w = Math.min(c, per) * (cs + d + 8); h = rows * (cs + d + 8);
        for (let i = 0; i < c; i++) items.push({ x: (i % per) * (cs + d + 8), y: h - (Math.floor(i / per) + 1) * (cs + d + 8), draw: (g, x, y) => thousandCube(g, x, y, cs, cols[0]) });
      } else if (k === 1) {
        const step = c <= 3 ? S + 10 : Math.max(18, Math.min(40, 260 / (c - 1)));
        w = S + (c - 1) * step + 3; h = S + 3;
        for (let i = 0; i < c; i++) items.push({ x: i * step, y: 0, draw: (g, x, y) => unitGrid(g, x, y, 10, 10, u, cols[1]) });
      } else if (k === 2) {
        const per = 10, step = u + 6, rows = Math.ceil(c / per);
        w = Math.min(c, per) * step; h = rows * (S + 12) - 12 + 3;
        for (let i = 0; i < c; i++) items.push({ x: (i % per) * step, y: Math.floor(i / per) * (S + 12), draw: (g, x, y) => unitGrid(g, x, y, 1, 10, u, cols[2]) });
      } else {
        const per = 5, step = u + 6, rows = Math.ceil(c / per);
        w = Math.min(c, per) * step; h = rows * step;
        for (let i = 0; i < c; i++) items.push({ x: (i % per) * step, y: h - (Math.floor(i / per) + 1) * step, draw: (g, x, y) => unitGrid(g, x, y, 1, 1, u, cols[3]) });
      }
      groups.push({ k, c, w, h, items });
    });
    if (!groups.length) groups.push({ k: 3, c: 0, w: 60, h: 20, items: [] });
    const gap = 40, labH = p.labels ? 34 : 6;
    const contentW = groups.reduce((s, g) => s + g.w, 0) + gap * (groups.length - 1);
    const H = Math.max(...groups.map(g => g.h)) + 24 + labH;
    const W = Math.max(contentW + 40, 320);
    const g0 = svgIn(root, W, H, { aria: LL('Khối biểu diễn số', 'Base-ten blocks') });
    let x = (W - contentW) / 2, n = 0;
    const base = H - labH;
    groups.forEach(gr => {
      gr.items.forEach(it => {
        const ag = A(g0, 'viz-drop', 80 + n++ * Math.max(25, 90 - n * 2));
        it.draw(ag, x + it.x, base - gr.h + it.y);
      });
      if (p.labels) T(g0, x + gr.w / 2, base + 18, `${gr.c} ${isEN() ? NAMES_EN[gr.k][gr.c === 1 ? 0 : 1] : names[gr.k]}`, { size: 16, fill: K.sub });
      x += gr.w + gap;
    });
  };

  /* =====================================================================
   * placeValue — bảng hàng / lớp
   * ===================================================================== */
  R.placeValue = (p, ctx, root) => {
    const HDR_VI = ['Đơn vị', 'Chục', 'Trăm', 'Nghìn', 'Chục nghìn', 'Trăm nghìn', 'Triệu', 'Chục triệu', 'Trăm triệu'];
    const DEC_VI = ['Phần mười', 'Phần trăm', 'Phần nghìn'];
    const HDR_EN = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten thousands', 'Hundred thousands', 'Millions', 'Ten millions', 'Hundred millions'];
    const DEC_EN = ['Tenths', 'Hundredths', 'Thousandths'];
    const HDR = isEN() ? HDR_EN : HDR_VI, DEC = isEN() ? DEC_EN : DEC_VI;
    // English: column names passed in Vietnamese by content are translated (unknown names are kept)
    const colName = c => {
      if (!isEN()) return c;
      const k = c.trim().toLowerCase(), f = a => a.findIndex(x => x.toLowerCase() === k);
      const i = f(HDR_VI), j = f(DEC_VI);
      return i >= 0 ? HDR_EN[i] : j >= 0 ? DEC_EN[j] : c;
    };
    let s = isStr(p.number) ? p.number.replace(/[\s  ]/g, '').replace('.', ',') : String(r6(Math.abs(num(p.number, 0)))).replace('.', ',');
    if (!/^\d+(,\d+)?$/.test(s)) s = '0';
    let [ip, dp] = s.split(',');
    dp = (dp || '').slice(0, 3);
    let hdr;
    if (Array.isArray(p.columns) && p.columns.length) hdr = p.columns.map(String).map(colName);
    else hdr = HDR.slice(0, Math.min(9, Math.max(ip.length, 1))).reverse();
    const nI = hdr.length, nD = dp.length;
    const digits = ip.padStart(nI, ' ').slice(-nI).split('').concat(dp.split(''));
    const allH = hdr.concat(DEC.slice(0, nD));
    const N = allH.length, cw = N > 7 ? 78 : 92, hh = 62, dh = 72;
    const showClass = !p.columns && nI >= 4;
    const top = showClass ? 40 : 0;
    const TW = N * cw + (nD ? 24 : 0), W = Math.max(TW + 20, 500), H = top + hh + dh + 8;
    const g = svgIn(root, W, H, { aria: LL('Bảng hàng', 'Place value table') });
    const x0 = (W - TW) / 2;
    const colX = i => x0 + i * cw + (nD && i >= nI ? 24 : 0);
    const clsCol = i => {            // colour per class (lớp) from the right
      if (i >= nI) return K.sky;
      const fromR = nI - 1 - i;
      return [K.teal, K.orange, K.purple][Math.floor(fromR / 3) % 3];
    };
    const hl = p.highlight != null ? int(p.highlight, -1, -10, 20) : null;
    if (showClass) {
      const names = isEN() ? ['Ones class', 'Thousands class', 'Millions class'] : ['Lớp đơn vị', 'Lớp nghìn', 'Lớp triệu'];
      for (let c = 0; c * 3 < nI; c++) {
        const r = nI - 1 - c * 3, l = Math.max(0, r - 2);
        const col = [K.teal, K.orange, K.purple][c % 3];
        rect(g, colX(l) + 3, 4, (r - l + 1) * cw - 6, top - 10, 12, tint(col, 0.35), edge(col), 1.5);
        const bw = (r - l + 1) * cw - 14;
        const nm = isEN() && tw(names[c], 16) > bw ? names[c].replace(' class', '') : names[c];   // narrow box: "Thousands"
        T(g, (colX(l) + colX(r) + cw) / 2, 4 + (top - 10) / 2, nm, { size: fitSize(nm, 16, bw), fill: isBoard() ? col : edge(col) });
      }
    }
    for (let i = 0; i < N; i++) {
      const x = colX(i), col = clsCol(i);
      const isHl = hl != null && i < nI && nI - 1 - i === hl;
      rect(g, x, top, cw, hh, 0, isHl ? tint(K.sun, 0.75) : tint(col, 0.22), K.line, 1.5);
      rect(g, x, top + hh, cw, dh, 0, isHl ? tint(K.sun, 0.45) : K.paper, K.line, 1.5);
      const words = allH[i].split(' ');
      if (allH[i].length > 7 && words.length > 1) {
        const h1 = words.slice(0, Math.ceil(words.length / 2)).join(' '), h2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        const fs2 = Math.min(fitSize(h1, 16, cw - 4), fitSize(h2, 16, cw - 4));
        T(g, x + cw / 2, top + hh / 2 - 10, h1, { size: fs2, fill: K.ink });
        T(g, x + cw / 2, top + hh / 2 + 11, h2, { size: fs2, fill: K.ink });
      } else T(g, x + cw / 2, top + hh / 2, allH[i], { size: fitSize(allH[i], 16, cw - 4), fill: K.ink });
      const d = digits[i];
      if (d && d !== ' ' && !p.hide) {
        const ag = A(g, 'viz-pop', 200 + i * 110);
        T(ag, x + cw / 2, top + hh + dh / 2, d, { size: 40, weight: 800, fill: isBoard() ? col : edge(col) });
      }
    }
    rect(g, x0, top, colX(N - 1) + cw - x0, hh + dh, 14, 'none', isBoard() ? K.ink : K.teal, 3);
    if (nD) {   // decimal comma between the parts
      line(g, colX(nI) - 12, top + 6, colX(nI) - 12, top + hh - 6, isBoard() ? K.ink : K.teal, 2, { dash: '4 4' });
      T(g, colX(nI) - 12, top + hh + dh / 2 + 6, ',', { size: 48, weight: 800, fill: K.orange });
    }
  };

  /* =====================================================================
   * numberLine — tia số with hopping rover; interactive tap → value
   * ===================================================================== */
  function roverAt(p, scale) {
    const outer = mk('g', null, p);
    outer.style.transition = 'transform .35s cubic-bezier(.3,1.3,.5,1)';
    const inner = G(outer, `scale(${scale}) translate(-100,-208)`);
    drawRover(inner, 'happy', false);
    return outer;
  }
  R.numberLine = (p, ctx, root) => {
    let min = num(p.min, 0), max = num(p.max, 10), step = num(p.step, 1);
    if (!(max > min)) max = min + 10;
    if (!(step > 0)) step = 1;
    let n = Math.round((max - min) / step);
    if (n > 200) { n = 100; step = (max - min) / 100; }
    if (n < 1) n = 1;
    const val = i => r6(min + i * step);
    const hops = arr(p.hops).filter(h => h && isFinite(num(h.from, NaN)) && isFinite(num(h.to, NaN))).slice(0, 10);
    const inter = !!ctx.interactive;
    const W = 700, x0 = 36, x1 = W - 52;
    const dx = (x1 - x0) / n;
    const X = v => x0 + ((v - min) / (max - min)) * (x1 - x0);
    const arcH = h => clamp(Math.abs(X(num(h.to)) - X(num(h.from))) * 0.42, 24, 82);
    const maxArc = hops.length ? Math.max(...hops.map(arcH)) : 0;
    const roverH = 52;
    const topPad = hops.length ? maxArc + 34 : (inter || p.point != null || p.unknown != null ? roverH + 26 : 24);
    const ly = topPad + 10, H = ly + 52;
    const g = svgIn(root, W, H, { aria: LL('Tia số', 'Number line') });
    // label interval (in ticks)
    let L;
    const le = num(p.labelEvery, 0);
    const labelled = i => {
      if (le > 0) { const q = (val(i) - min) / le; return Math.abs(q - Math.round(q)) < 1e-6; }
      return i % L === 0;
    };
    if (!(le > 0)) { L = [1, 2, 5, 10, 20, 25, 50, 100].find(k => n / k <= 10) || Math.ceil(n / 10); }
    // line + arrow
    const lc = K.ink;
    line(g, x0 - 16, ly, x1 + 34, ly, lc, 3);
    path(g, `M${x1 + 26},${ly - 8} L${x1 + 38},${ly} L${x1 + 26},${ly + 8}`, 'none', lc, 3);
    for (let i = 0; i <= n; i++) {
      const x = x0 + i * dx, lab = labelled(i);
      line(g, x, ly - (lab ? 10 : 6), x, ly + (lab ? 10 : 6), lc, lab ? 2.6 : 1.8);
      if (lab) T(g, x, ly + 30, fmt(val(i)), { size: n > 14 && String(fmt(val(i))).length > 3 ? 16 : 20, fill: K.ink });
    }
    arr(p.marks).forEach((m, i) => {
      const v = num(m, NaN);
      if (!isFinite(v)) return;
      const ag = A(g, 'viz-pop', 300 + i * 80);
      circle(ag, X(v), ly, 7, K.berry, isBoard() ? 'none' : '#FFFFFF', 2);
    });
    const bubble = (gp, x, y, txt, col) => {
      const w = Math.max(34, tw(txt, 18) + 18);
      rect(gp, x - w / 2, y - 16, w, 30, 15, isBoard() ? 'none' : col, isBoard() ? col : 'none', 2);
      path(gp, `M${x - 6},${y + 13} L${x},${y + 21} L${x + 6},${y + 13}`, isBoard() ? 'none' : col, isBoard() ? col : 'none', 2);
      T(gp, x, y - 1, txt, { size: 18, fill: isBoard() ? col : '#FFFFFF', weight: 800 });
    };
    if (p.unknown != null && isFinite(num(p.unknown, NaN)) && !hops.length) {
      const ag = A(g, 'viz-pop', 500);
      bubble(ag, X(num(p.unknown)), ly - 34, '?', K.berry);
      circle(ag, X(num(p.unknown)), ly, 6, K.berry);
    }
    if (p.point != null && isFinite(num(p.point, NaN)) && !inter && !hops.length) {
      const ag = A(g, 'viz-pop', 400);
      circle(ag, X(num(p.point)), ly, 8, K.orange, isBoard() ? 'none' : '#FFFFFF', 2.5);
      bubble(ag, X(num(p.point)), ly - 34, fmt(num(p.point)), K.orange);
    }
    // hops
    if (hops.length) {
      const segs = hops.map(h => {
        const xa = X(num(h.from)), xb = X(num(h.to)), hh = arcH(h), xm = (xa + xb) / 2;
        const pth = path(g, `M${xa},${ly - 4} Q${xm},${ly - 4 - 2 * hh} ${xb},${ly - 4}`, 'none', K.orange, 3, { pl: 1, dash: '1 1' });
        pth.style.strokeDashoffset = 1;
        const lg = mk('g', { opacity: 0 }, g);
        const dir = xb >= xa ? 1 : -1;
        path(lg, `M${xb - 7 * dir},${ly - 16} L${xb},${ly - 5} L${xb + 3 * dir},${ly - 18}`, 'none', K.orange, 3);
        if (h.label != null) {
          const t = String(h.label), w = tw(t, 17) + 16;
          rect(lg, xm - w / 2, ly - 4 - hh - 30, w, 26, 13, isBoard() ? 'none' : tint(K.orange, 0.25), isBoard() ? K.orange : 'none', 1.5);
          T(lg, xm, ly - 4 - hh - 17, t, { size: 17, fill: isBoard() ? K.orange : edge(K.orange) });
        }
        return { xa, xb, hh, pth, lg };
      });
      const rv = roverAt(g, 0.25);
      rv.style.transition = 'none';
      setXY(rv, segs[0].xa, ly - 4);
      if (p.unknown != null && isFinite(num(p.unknown, NaN))) {
        const ag = A(g, 'viz-pop', 300);
        bubble(ag, X(num(p.unknown)), ly + 0 - 2 * Math.max(...segs.map(s => s.hh)) - 4, '?', K.berry);
      }
      const steps = segs.map(s => next => tween(750, t => {
        const e = ease(t), u = 1 - e;
        const x = u * u * s.xa + 2 * u * e * ((s.xa + s.xb) / 2) + e * e * s.xb;
        const y = u * u * (ly - 4) + 2 * u * e * (ly - 4 - 2 * s.hh) + e * e * (ly - 4);
        setXY(rv, x, y);
        s.pth.style.strokeDashoffset = 1 - e;
        if (t > 0.85) s.lg.setAttribute('opacity', 1);
      }, () => { s.lg.setAttribute('opacity', 1); later(160, next); }));
      whenLive(root, () => later(500, () => chain(steps)));
    }
    // interactive
    let value = inter && p.point != null && isFinite(num(p.point, NaN)) ? num(p.point) : null;
    if (inter) {
      const marker = mk('g', { opacity: value == null ? 0 : 1 }, g);
      marker.style.transition = 'transform .25s ease';
      circle(marker, 0, ly, 11, K.orange, isBoard() ? 'none' : '#FFFFFF', 3);
      const rv = roverAt(g, 0.25);
      rv.setAttribute('opacity', value == null ? 0.0 : 1);
      const place = v => {
        const x = X(v);
        marker.style.transform = `translate(${x}px,0px)`;
        marker.setAttribute('opacity', 1);
        setXY(rv, x, ly - 12);
        rv.setAttribute('opacity', 1);
      };
      if (value != null) place(value);
      const hit = rect(g, 0, 0, W, H, 0, 'transparent', null, 0, { cls: 'viz-touch' });
      let down = false;
      const pick = e => {
        const pt = svgPt(root._svg, e);
        const i = clamp(Math.round((pt.x - x0) / dx), 0, n), v = val(i);
        if (v !== value) { value = v; place(v); emit(ctx, root, v); }
      };
      hit.addEventListener('pointerdown', e => { down = true; try { hit.setPointerCapture(e.pointerId); } catch (er) { /* */ } pick(e); e.preventDefault(); });
      hit.addEventListener('pointermove', e => { if (down) pick(e); });
      const up = () => { down = false; };
      hit.addEventListener('pointerup', up); hit.addEventListener('pointercancel', up);
      root.getValue = () => value;
    }
  };

  /* =====================================================================
   * objects — groups of emoji, optional crossed-out items
   * ===================================================================== */
  R.objects = (p, ctx, root) => {
    let groups = arr(p.groups).slice(0, 6);
    if (!groups.length) groups = [{ emoji: p.emoji || '🍎', count: p.count != null ? p.count : 5 }];
    groups = groups.map(gr => ({ emoji: String((gr && gr.emoji) || '🍎'), count: int(gr && gr.count, 0, 0, 60), label: gr && gr.label }));
    const total = groups.reduce((s, gr) => s + gr.count, 0);
    const cross = int(p.crossOut, 0, 0, total);
    const big = total > 30;
    const cell = big ? 38 : 48, per = groups.length === 1 && groups[0].count > 10 ? 10 : 5;
    const pad = 12, gap = p.op ? 56 : 28, maxRowW = 760;
    const boxes = groups.map(gr => {
      const c = Math.max(1, Math.min(per, gr.count)), r = Math.max(1, Math.ceil(gr.count / per));
      return { w: c * cell + pad * 2, h: r * cell + pad * 2 };
    });
    // flow layout
    const rows = [[]];
    let rw = 0;
    boxes.forEach((b, i) => {
      if (rows[rows.length - 1].length && rw + gap + b.w > maxRowW) { rows.push([]); rw = 0; }
      rows[rows.length - 1].push(i); rw += (rw ? gap : 0) + b.w;
    });
    const labH = groups.some(gr => gr.label != null) ? 30 : 0;
    const rowInfo = rows.map(r => ({ idx: r, w: r.reduce((s, i) => s + boxes[i].w, 0) + gap * (r.length - 1), h: Math.max(...r.map(i => boxes[i].h)) + labH }));
    const W = Math.max(300, Math.max(...rowInfo.map(r => r.w)) + 24);
    const H = rowInfo.reduce((s, r) => s + r.h, 0) + 18 * (rowInfo.length - 1) + 16;
    const g = svgIn(root, W, H, { aria: LL('Đồ vật', 'Objects') });
    let y = 8, k = 0, globalIdx = 0;
    const crossFrom = total - cross;
    rowInfo.forEach(r => {
      let x = (W - r.w) / 2;
      r.idx.forEach((i, j) => {
        const b = boxes[i], gr = groups[i];
        const by = y + (r.h - labH - b.h) / 2;
        rect(g, x, by, b.w, b.h, 20, K.cream, isBoard() ? K.line : '#F1E3C8', 2, isBoard() ? { dash: '6 5' } : null);
        for (let t = 0; t < gr.count; t++) {
          const cx = x + pad + (t % per) * cell + cell / 2, cy = by + pad + Math.floor(t / per) * cell + cell / 2;
          const ag = A(g, 'viz-pop', 120 + k++ * Math.max(30, 110 - total * 2));
          const crossed = globalIdx >= crossFrom;
          E(ag, cx, cy, gr.emoji, cell * 0.72, { opacity: crossed ? 0.45 : null });
          if (crossed) {
            const cg = A(g, 'viz-fade', 900 + (globalIdx - crossFrom) * 140);
            line(cg, cx - cell * 0.36, cy + cell * 0.36, cx + cell * 0.36, cy - cell * 0.36, K.berry, 5);
          }
          globalIdx++;
        }
        if (gr.label != null) T(g, x + b.w / 2, by + b.h + 16, label(gr.label), { size: 17, fill: K.sub });
        if (p.op && j < r.idx.length - 1) T(g, x + b.w + gap / 2, y + (r.h - labH) / 2, p.op === '-' ? '−' : String(p.op), { size: 36, weight: 800, fill: K.orange });
        x += b.w + gap;
      });
      y += r.h + 18;
    });
  };

  /* =====================================================================
   * array — rows × cols
   * ===================================================================== */
  R.array = (p, ctx, root) => {
    const rows = int(p.rows, 3, 1, 12), cols = int(p.cols, 4, 1, 12);
    const emoji = String(p.emoji || '🍎');
    const cell = Math.min(50, 560 / cols, 300 / rows);
    const W = cols * cell + 40, H = rows * cell + 30;
    const g = svgIn(root, Math.max(W, 260), H, { aria: LL('Mảng', 'Array') });
    const x0 = (Math.max(W, 260) - cols * cell) / 2, y0 = 15;
    rect(g, x0 - 10, y0 - 8, cols * cell + 20, rows * cell + 16, 18, K.cream, isBoard() ? K.line : '#F1E3C8', 2);
    for (let r = 0; r < rows; r++) {
      if (r % 2 === 0) rect(g, x0 - 4, y0 + r * cell + 2, cols * cell + 8, cell - 4, (cell - 4) / 2, tint(K.cyan, 0.25));
      for (let c = 0; c < cols; c++) {
        const ag = A(g, 'viz-pop', 120 + r * 200 + c * 45);
        E(ag, x0 + c * cell + cell / 2, y0 + r * cell + cell / 2, emoji, cell * 0.7);
      }
    }
  };

  /* =====================================================================
   * share — deal candies one by one onto plates
   * ===================================================================== */
  R.share = (p, ctx, root) => {
    const total = int(p.total, 12, 0, 60), ng = int(p.groups, 3, 1, 10);
    const emoji = String(p.emoji || '🍬');
    const q = Math.floor(total / ng), rem = total - q * ng;
    const W = 700, isz = total > 30 ? 26 : total > 20 ? 32 : 38;
    // pile (basket) at top
    const pcols = Math.min(total || 1, total > 24 ? 15 : 12), prow = Math.max(1, Math.ceil(total / pcols));
    const pileW = pcols * isz + 30, pileH = prow * isz + 22;
    const plateW = Math.min(190, (W - 20) / ng - 12);
    const scols = Math.max(1, Math.min(Math.max(q, 1), Math.floor((plateW - 30) / 34)));
    const srows = Math.max(1, Math.ceil(q / scols));
    const ssz = Math.min(38, (plateW - 30) / scols);
    const plateH = srows * ssz + 34;
    const platesY = pileH + 46;
    const labH = p.plateLabel ? 28 : 6;
    const H = platesY + plateH + labH + 8;
    const g = svgIn(root, W, H, { aria: LL('Chia đều', 'Sharing equally') });
    const px0 = (W - pileW) / 2;
    rect(g, px0, 8, pileW, pileH, 18, isBoard() ? 'none' : tint(K.sun, 0.35), isBoard() ? K.sun : mix(K.sun, '#C98A00', 0.3), 2, isBoard() ? { dash: '7 5' } : null);
    const pilePos = i => ({ x: px0 + 15 + (i % pcols) * isz + isz / 2, y: 8 + 11 + Math.floor(i / pcols) * isz + isz / 2 });
    const gap = (W - ng * plateW) / (ng + 1);
    const plates = [];
    for (let k = 0; k < ng; k++) {
      const cx = gap + k * (plateW + gap) + plateW / 2, cy = platesY + plateH / 2;
      const ag = A(g, 'viz-rise', 100 + k * 90);
      mk('ellipse', { cx, cy: cy + 4, rx: plateW / 2, ry: plateH / 2, fill: isBoard() ? 'none' : K.shadow }, ag);
      mk('ellipse', { cx, cy, rx: plateW / 2, ry: plateH / 2, fill: isBoard() ? 'none' : '#FFFFFF', stroke: isBoard() ? K.ink : K.cyan, 'stroke-width': 3 }, ag);
      mk('ellipse', { cx, cy, rx: plateW / 2 - 10, ry: plateH / 2 - 8, fill: 'none', stroke: isBoard() ? K.line : tint(K.cyan, 0.5), 'stroke-width': 2 }, ag);
      if (p.plateLabel) {
        const s = String(p.plateLabel);
        T(g, cx, platesY + plateH + 16, s.includes('{n}') ? s.replace('{n}', k + 1) : `${s} ${k + 1}`, { size: 16, fill: K.sub });
      }
      plates.push({ cx, cy });
    }
    const slot = (k, j) => {
      const pl = plates[k], c = j % scols, r = Math.floor(j / scols);
      const rowsHere = srows;
      return { x: pl.cx - (scols * ssz) / 2 + c * ssz + ssz / 2, y: pl.cy - (rowsHere * ssz) / 2 + r * ssz + ssz / 2 };
    };
    const items = [];
    for (let i = 0; i < total; i++) {
      const it = mk('g', null, g);
      const pos = pilePos(i);
      setXY(it, pos.x, pos.y);
      E(it, 0, 0, emoji, isz * 0.82);
      items.push({ node: it, pos });
    }
    const dealt = q * ng;
    const order = [];
    for (let k = 0; k < dealt; k++) order.push({ item: items[total - 1 - k], plate: k % ng, j: Math.floor(k / ng) });
    const finish = () => order.forEach(o => { const s = slot(o.plate, o.j); setXY(o.item.node, s.x, s.y, ` scale(${ssz / isz})`); });
    if (reduced()) { finish(); return; }
    const per = clamp(3600 / Math.max(1, dealt), 110, 380);
    whenLive(root, () => later(700, () => {
      order.forEach((o, k) => setTimeout(() => {
        const a = o.item.pos, b = slot(o.plate, o.j), sc = ssz / isz;
        tween(420, t => {
          const e = easeOut(t);
          const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e - Math.sin(Math.PI * e) * 40;
          setXY(o.item.node, x, y, ` scale(${1 + (sc - 1) * e})`);
        });
      }, k * per));
    }));
    if (rem && p.showRest !== false) {
      // leftover candies stay in the basket; small hint label appears afterwards
      const lg = A(g, 'viz-fade', 900 + dealt * per);
      T(lg, px0 + pileW + 12, 8 + pileH / 2, LL('còn lại', 'left over'), { size: 15, fill: K.sub, anchor: 'start' });
    }
  };

  /* =====================================================================
   * columnCalc — đặt tính rồi tính (+ − × and long division)
   * ===================================================================== */
  function splitNum(x) {
    const s = String(r6(Math.abs(x)));
    if (/e/i.test(s)) throw new Error('number too large');
    const [i, d] = s.split('.');
    return { i, d: d || '' };
  }
  /** Stage manager: group 0 = always shown; 1..n revealed per reveal mode. */
  function stager(root, g, reveal, captions, intro) {
    const groups = [];
    const S = s => {
      if (!groups[s]) { groups[s] = mk('g', null, g); if (s > 0 && reveal !== 'all') groups[s].style.display = 'none'; }
      return groups[s];
    };
    const finish = n => {
      if (reveal !== 'steps' || n < 1) return;
      let cur = 0;
      const box = document.createElement('div');
      box.className = 'viz-steps';
      const cap = document.createElement('div');
      cap.className = 'viz-cap';
      cap.textContent = intro || LL('Bấm “Bước tiếp” để tính từng bước.', 'Tap “Next step” to work it out one step at a time.');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'viz-btn';
      btn.textContent = LL('Bước tiếp ▶', 'Next step ▶');
      btn.addEventListener('click', () => {
        if (cur >= n) {
          cur = 0;
          for (let s = 1; s < groups.length; s++) if (groups[s]) groups[s].style.display = 'none';
          cap.textContent = intro || LL('Bấm “Bước tiếp” để tính từng bước.', 'Tap “Next step” to work it out one step at a time.');
          btn.textContent = LL('Bước tiếp ▶', 'Next step ▶');
          return;
        }
        cur++;
        const gr = groups[cur];
        if (gr) { gr.style.display = ''; gr.setAttribute('class', 'viz-fade'); }
        cap.textContent = captions[cur] || '';
        if (cur >= n) btn.textContent = LL('Làm lại ↺', 'Start again ↺');
      });
      box.appendChild(cap); box.appendChild(btn);
      root.appendChild(box);
      root.getValue = () => cur;
    };
    return { S, finish };
  }

  R.columnCalc = (p, ctx, root) => {
    const op = { '+': '+', '-': '−', '−': '−', 'x': '×', 'X': '×', '*': '×', '×': '×', ':': ':', '/': ':', '÷': ':' }[String(p.op || '+')] || '+';
    const reveal = ['none', 'steps', 'all'].includes(p.reveal) ? p.reveal : 'all';
    const a = num(p.a, NaN), b = num(p.b, NaN);
    if (!isFinite(a) || !isFinite(b) || a < 0 || b < 0) throw new Error('bad numbers');
    if (op === ':') return divCalc(p, ctx, root, a, b, reveal);
    const CW = 31, RH = 50, FS = 34;   // digit columns close together, as written in a notebook
    const resCol = isBoard() ? K.sun : K.teal, carryCol = K.orange;
    const box = (gp, x, y) => rect(gp, x - CW / 2 + 3, y - RH / 2 + 5, CW - 6, RH - 10, 8, tint(K.sky, 0.12), K.sky, 2, { dash: '5 4' });
    const captions = [''];
    let model;
    if (op === '+' || op === '−') {
      const A1 = splitNum(a), B1 = splitNum(b), D = Math.max(A1.d.length, B1.d.length);
      const sa = A1.i + A1.d, sb = B1.i + B1.d, shA = D - A1.d.length, shB = D - B1.d.length;
      const Ai = Math.round(a * Math.pow(10, D)), Bi = Math.round(b * Math.pow(10, D));
      const res = op === '+' ? Ai + Bi : Ai - Bi;
      if (res < 0) throw new Error('negative');
      const rs = String(res).padStart(D + 1, '0');
      const dg = (s, sh, c) => (c < sh || c - sh >= s.length ? null : Number(s[s.length - 1 - (c - sh)]));
      const len = Math.max(sa.length + shA, sb.length + shB);
      const cells = [];   // {row, c, ch, stage, kind}
      let carry = 0;
      for (let c = 0; c < len; c++) {
        const va = dg(sa, shA, c), vb = dg(sb, shB, c), st = c + 1, last = c === len - 1;
        const ta = va == null ? 0 : va, tb = vb == null ? 0 : vb;
        if (op === '+') {
          const x = ta + tb + carry, w = last ? String(x) : String(x % 10), nc = x >= 10 ? 1 : 0;
          let cap;
          if (isEN()) {
            if (va != null && vb != null) cap = `${ta} + ${tb} = ${ta + tb}` + (carry ? `, plus 1 carried makes ${x}` : '') + `, write ${w}` + (nc && !last ? ' and carry 1' : '') + '.';
            else if (carry) cap = `${va != null ? ta : tb} plus 1 carried makes ${x}, write ${w}` + (nc && !last ? ' and carry 1' : '') + '.';
            else cap = `Bring down ${va != null ? ta : tb}.`;
          } else if (va != null && vb != null) cap = `${ta} cộng ${tb} bằng ${ta + tb}` + (carry ? `, thêm 1 bằng ${x}` : '') + `, viết ${w}` + (nc && !last ? ' nhớ 1' : '') + '.';
          else if (carry) cap = `${va != null ? ta : tb} thêm 1 bằng ${x}, viết ${w}` + (nc && !last ? ' nhớ 1' : '') + '.';
          else cap = `Hạ ${va != null ? ta : tb}.`;
          captions.push(cap);
          w.split('').reverse().forEach((ch, k) => cells.push({ row: 2, c: c + k, ch, stage: st }));
          if (nc && !last) cells.push({ row: -1, c: c + 1, ch: '1', stage: st, kind: 'carry' });
          carry = nc;
        } else {
          const sub = tb + carry;
          let r, nb = 0;
          if (ta < sub) { r = ta + 10 - sub; nb = 1; } else r = ta - sub;
          let cap;
          if (vb != null || carry) {
            cap = isEN()
              ? (carry && vb != null ? `${tb} plus 1 carried makes ${sub}; ` : '') +
                (ta < sub ? `${ta} is smaller than ${sub}, so take ${ta + 10} − ${sub} = ${r}` : `${ta} − ${sub} = ${r}`)
              : (carry && vb != null ? `${tb} thêm 1 bằng ${sub}; ` : '') +
                (ta < sub ? `${ta} không trừ được ${sub}, lấy ${ta + 10} trừ ${sub} bằng ${r}` : `${ta} trừ ${sub} bằng ${r}`);
          } else cap = LL(`Hạ ${ta}`, `Bring down ${ta}`);
          const leadingZero = c >= String(res).length && c >= D + 1 && r === 0;
          cap += leadingZero ? LL(' (không cần viết số 0 ở đầu).', ' (no need to write a 0 at the front).')
            : (vb != null || carry ? LL(`, viết ${r}` + (nb ? ' nhớ 1' : '') + '.', `, write ${r}` + (nb ? ' and carry 1' : '') + '.') : '.');
          captions.push(cap);
          if (!leadingZero) cells.push({ row: 2, c, ch: String(r), stage: st });
          if (nb) cells.push({ row: -2, c: c + 1, ch: '1', stage: st, kind: 'carry' });
          carry = nb;
        }
      }
      let nSt = len;
      if (D > 0) { nSt++; captions.push(LL('Viết dấu phẩy ở kết quả thẳng cột với các dấu phẩy ở trên.', 'Write the decimal comma in the answer, in line with the commas above.')); }
      for (let k = 0; k < sa.length; k++) cells.push({ row: 0, c: shA + k, ch: sa[sa.length - 1 - k], stage: 0 });
      for (let k = 0; k < sb.length; k++) cells.push({ row: 1, c: shB + k, ch: sb[sb.length - 1 - k], stage: 0 });
      const commas = [];
      if (A1.d.length) commas.push({ row: 0, at: D, stage: 0 });
      if (B1.d.length) commas.push({ row: 1, at: D, stage: 0 });
      if (D > 0) commas.push({ row: 2, at: D, stage: nSt });
      const resLen = Math.max(String(res).length, D + 1);
      // the answer box is as wide as the longest possible result (one more column for +), not the actual result,
      // so its length never gives away how many digits the answer has
      const cols = Math.max(op === '+' ? len + 1 : len, D + 1);
      const boxes = [];
      for (let c = 0; c < cols; c++) boxes.push({ row: 2, c });
      model = { cells, commas, boxes, nSt, rows: 3, lines: [1], opRows: [0, 1], opSym: op, N: Math.max(len, resLen, cols, ...cells.map(c => c.c + 1)) };
    } else {
      // multiplication
      const A1 = splitNum(a), B1 = splitNum(b), dA = A1.d.length, dB = B1.d.length;
      const sa = (A1.i + A1.d).replace(/^0+(?=\d)/, ''), sbDisp = B1.i + B1.d;
      const Ai = Number(sa), Bi = Number(sbDisp);
      const sb = String(Bi);
      const sbD = sbDisp.replace(/^0+(?=\d)/, '');
      const prodAll = Ai * Bi, DD = dA + dB;
      const fs = String(prodAll).padStart(DD + 1, '0');
      const cells = [], boxes = [];
      for (let k = 0; k < sa.length; k++) cells.push({ row: 0, c: k, ch: sa[sa.length - 1 - k], stage: 0 });
      for (let k = 0; k < sbD.length; k++) cells.push({ row: 1, c: k, ch: sbD[sbD.length - 1 - k], stage: 0 });
      let st = 0;
      const rowOf = (bk, rowIdx, shift, prefix) => {
        let carry = 0;
        for (let c = 0; c < sa.length; c++) {
          const da = Number(sa[sa.length - 1 - c]), last = c === sa.length - 1;
          const x = da * bk + carry, w = last ? String(x) : String(x % 10), nc = Math.floor(x / 10);
          st++;
          captions.push((c === 0 && prefix ? prefix : '') + (isEN()
            ? `${bk} × ${da} = ${da * bk}` + (carry ? `, plus ${carry} carried makes ${x}` : '') + `, write ${w}` + (!last && nc ? ` and carry ${nc}` : '') + '.'
            : `${bk} nhân ${da} bằng ${da * bk}` + (carry ? `, thêm ${carry} bằng ${x}` : '') + `, viết ${w}` + (!last && nc ? ` nhớ ${nc}` : '') + '.'));
          w.split('').reverse().forEach((ch, k) => { cells.push({ row: rowIdx, c: shift + c + k, ch, stage: st }); });
          if (!last && nc && rowIdx === 2 && sb.length === 1) cells.push({ row: -1, c: c + 1, ch: String(nc), stage: st, kind: 'carry' });
          carry = nc;
        }
        for (let c = 0; c < sa.length + 1; c++) boxes.push({ row: rowIdx, c: shift + c });   // never the actual length
      };
      let rows, lines;
      if (sb.length === 1) {
        rowOf(Bi, 2, 0, '');
        rows = 3; lines = [1];
        // fix boxes: padded final may need leading zero digits for decimals
        for (let c = String(Ai * Bi).length; c < fs.length; c++) cells.push({ row: 2, c, ch: '0', stage: st });
        for (let c = sa.length + 1; c < fs.length; c++) boxes.push({ row: 2, c });
      } else {
        const m = sb.length;
        for (let k = 0; k < m; k++) rowOf(Number(sb[m - 1 - k]), 2 + k, k, LL(`Lượt ${k + 1} (nhân với ${sb[m - 1 - k]}): `, `Row ${k + 1} (multiply by ${sb[m - 1 - k]}): `));
        st++;
        captions.push(LL(`Cộng các tích riêng, được ${String(prodAll)}.`, `Add the rows together: ${String(prodAll)}.`));
        const fr = 2 + m;
        for (let c = 0; c < fs.length; c++) cells.push({ row: fr, c, ch: fs[fs.length - 1 - c], stage: st });
        for (let c = 0; c < Math.max(fs.length, sa.length + sb.length); c++) boxes.push({ row: fr, c });   // n × m digits → at most n + m
        rows = fr + 1; lines = [1, fr - 1];
      }
      const commas = [];
      if (dA) commas.push({ row: 0, at: dA, stage: 0 });
      if (dB) commas.push({ row: 1, at: dB, stage: 0 });
      if (DD) { st++; captions.push(LL(`Hai thừa số có tất cả ${DD} chữ số ở phần thập phân, ta dùng dấu phẩy tách ra ${DD} chữ số ở tích kể từ phải sang trái.`,
        `The factors have ${DD} decimal place${DD === 1 ? '' : 's'} altogether, so count ${DD} digit${DD === 1 ? '' : 's'} from the right of the product and put the comma there.`)); commas.push({ row: rows - 1, at: DD, stage: st }); }
      const N = Math.max(...cells.map(c => c.c), ...boxes.map(b => b.c)) + 1;
      model = { cells, commas, boxes, nSt: st, rows, lines, opRows: [0, 1], opSym: '×', N, plusRows: sb.length > 1 ? [2, rows - 2] : null };
    }
    // ---- draw ----
    const N = model.N;
    const left = 64, topPad = 34;
    const W = left + N * CW + 26, H = topPad + model.rows * RH + 14;
    const Wv = Math.max(W, 400), off = (Wv - W) / 2;
    const g = svgIn(root, Wv, H, { aria: LL('Đặt tính', 'Column calculation') });
    const xR = off + left + N * CW;
    const cx = c => xR - c * CW - CW / 2;
    const ry = r => topPad + r * RH + RH / 2;
    const stg = stager(root, g, reveal, captions);
    if (reveal === 'steps') { const bg = stg.S(0); longBoxes(model.boxes).forEach(rw => rect(bg, cx(rw.hi) - CW / 2 + 3, ry(rw.row) - RH / 2 + 5, (rw.hi - rw.lo + 1) * CW - 6, RH - 10, 10, tint(K.sky, 0.12), K.sky, 2, { dash: '5 4' })); }
    if (reveal === 'none') root.boxInput = boxInput(root, stg.S(0), model, { cx, ry, CW, RH, FS, resCol, box });
    model.cells.forEach(c => {
      const gp = stg.S(c.stage);
      if (c.kind === 'carry') {
        if (c.row === -1) T(gp, cx(c.c), ry(0) - RH / 2 - 6, c.ch, { size: 17, fill: K.orange, weight: 800 });
        else T(gp, cx(c.c) + CW * 0.45, ry(1) + 15, c.ch, { size: 15, fill: K.orange, weight: 800 });
        return;
      }
      T(gp, cx(c.c), ry(c.row), c.ch, { size: FS, weight: 700, fill: c.row >= 2 ? resCol : K.ink });
    });
    model.commas.forEach(cm => T(stg.S(cm.stage), xR - cm.at * CW, ry(cm.row) + 10, ',', { size: FS, weight: 800, fill: cm.row >= 2 ? resCol : K.ink }));
    // operator(s) and lines
    T(stg.S(0), off + left - 26, (ry(model.opRows[0]) + ry(model.opRows[1])) / 2, model.opSym, { size: 32, weight: 700, fill: K.orange });
    if (model.plusRows) T(stg.S(0), off + left - 26, (ry(model.plusRows[0]) + ry(model.plusRows[1])) / 2, '+', { size: 30, weight: 700, fill: K.orange });
    model.lines.forEach(r => line(stg.S(0), off + left - 40, ry(r) + RH / 2, xR + 6, ry(r) + RH / 2, K.ink, 2.6));
    stg.finish(model.nSt);
  };

  /**
   * Fill-in boxes for đặt tính (reveal 'none'): the child taps a box and types its digit, in any order;
   * by default the cursor starts at the units box of the answer row and moves left after each digit
   * (the way the sum is worked out). The host (app) drives it through root.boxInput:
   *   type(d) · back() · select(i) · clear() · fill(str) · fillRow(str) · value() → "1234" / "12,5" / "" (incomplete)
   *   onChange(fn) · onSelect(fn(row)) · enable(on) · mark('right'|'wrong'|null)
   * Boxes of partial-product rows (long multiplication) can be filled too; only the last row is the answer.
   */
  /** Answer rows of a column layout: [{row, lo, hi}] (lowest and highest column of each row). */
  function longBoxes(boxes) {
    const by = {};
    for (const b of boxes) { const r = by[b.row] || (by[b.row] = { row: b.row, lo: b.c, hi: b.c }); r.lo = Math.min(r.lo, b.c); r.hi = Math.max(r.hi, b.c); }
    return Object.values(by);
  }
  function boxInput(root, gp, model, o) {
    const ansRow = Math.max(...model.boxes.map(b => b.row));
    const cm = model.commas.find(c => c.row === ansRow);
    const ink = o.resCol, sel = K.orange, idle = K.sky, fillTint = tint(K.sky, 0.12), bad = K.berry;
    // one long box per row (its length never shows how many digits the answer has); inside it every column
    // is a tap target, and an orange caret marks the column the next digit goes into
    const rowBox = {};
    longBoxes(model.boxes).forEach(rw => {
      rowBox[rw.row] = rect(gp, o.cx(rw.hi) - o.CW / 2 + 3, o.ry(rw.row) - o.RH / 2 + 5, (rw.hi - rw.lo + 1) * o.CW - 6, o.RH - 10, 10, fillTint, idle, 2, { dash: '5 4' });
    });
    const slots = model.boxes.map((bx, i) => {
      const x = o.cx(bx.c), y = o.ry(bx.row);
      const g = mk('g', { class: 'viz-cbox', style: { cursor: 'pointer' } }, gp);
      const r = line(g, x - o.CW * 0.32, y + o.RH * 0.32, x + o.CW * 0.32, y + o.RH * 0.32, sel, 3.5);
      const t = T(g, x, y, '', { size: o.FS, weight: 700, fill: ink });
      rect(g, x - o.CW / 2, y - o.RH / 2, o.CW, o.RH, 0, 'transparent');   // full-cell hit area
      g.addEventListener('pointerdown', e => { if (!enabled) return; e.preventDefault(); select(i); if (selCb) selCb(bx.row); });
      return { row: bx.row, c: bx.c, r, t, ch: '' };
    });
    // decimals: the answer row's comma is drawn in place (the app adds it to the value too)
    if (cm) T(gp, (o.cx(cm.at - 1) + o.cx(cm.at)) / 2, o.ry(ansRow) + 10, ',', { size: o.FS, weight: 800, fill: ink });
    let cur = -1, enabled = true, cb = null, selCb = null;
    const unitsOf = row => slots.findIndex(s => s.row === row && s.c === Math.min(...slots.filter(z => z.row === row).map(z => z.c)));
    function paint() {
      const curRow = enabled && slots[cur] ? slots[cur].row : null;
      for (const row in rowBox) {
        const on = String(curRow) === row;
        rowBox[row].setAttribute('stroke', on ? sel : idle);
        rowBox[row].setAttribute('stroke-width', on ? 3 : 2);
        rowBox[row].setAttribute('stroke-dasharray', on ? '' : '5 4');
      }
      slots.forEach((s, i) => {
        s.r.style.display = enabled && i === cur ? '' : 'none';
        s.t.textContent = s.ch;
      });
    }
    function select(i) { cur = i; paint(); }
    function next() {   // move left (towards higher places) in the same row
      const s = slots[cur]; if (!s) return;
      const j = slots.findIndex(z => z.row === s.row && z.c === s.c + 1);
      if (j >= 0) cur = j;
    }
    function value() {
      const row = slots.filter(s => s.row === ansRow).sort((a, b) => b.c - a.c).map(s => s.ch);
      while (row.length && row[0] === '') row.shift();
      if (!row.length || row.includes('')) return '';
      let str = row.join('');
      if (cm) { str = str.padStart(cm.at + 1, '0'); str = str.slice(0, str.length - cm.at) + ',' + str.slice(str.length - cm.at); }
      return str.replace(/^0+(?=\d)/, '');
    }
    const changed = () => { paint(); if (cb) cb(value()); };
    const api = {
      type(d) { if (!enabled || !/^\d$/.test(d)) return; if (cur < 0) cur = unitsOf(ansRow); slots[cur].ch = d; next(); changed(); },
      back() {
        if (!enabled) return;
        if (cur < 0) cur = unitsOf(ansRow);
        if (slots[cur].ch) slots[cur].ch = '';
        else { const s = slots[cur]; const j = slots.findIndex(z => z.row === s.row && z.c === s.c - 1); if (j >= 0) { cur = j; slots[j].ch = ''; } }
        changed();
      },
      select(i) { select(i); },
      clear() { slots.forEach(s => { s.ch = ''; }); cur = unitsOf(ansRow); changed(); },
      fill(str) {   // write a number right-aligned into the answer row (used to mirror typing and to show the answer)
        const digits = String(str || '').replace(/[^\d]/g, '');
        const row = slots.filter(s => s.row === ansRow).sort((a, b) => a.c - b.c);
        row.forEach((s, k) => { s.ch = k < digits.length ? digits[digits.length - 1 - k] : ''; });
        paint();
      },
      // a whole number written at once (handwriting): right-aligned into the row the child is on
      fillRow(str) {
        if (!enabled) return;
        if (cur < 0) cur = unitsOf(ansRow);
        const rowNo = slots[cur] ? slots[cur].row : ansRow;
        const digits = String(str || '').replace(/[^\d]/g, '');
        const row = slots.filter(s => s.row === rowNo).sort((a, b) => a.c - b.c);
        row.forEach((s, k) => { s.ch = k < digits.length ? digits[digits.length - 1 - k] : ''; });
        cur = row.length ? slots.indexOf(row[Math.min(digits.length, row.length - 1)]) : cur;
        changed();
      },
      value,
      onChange(fn) { cb = fn; },
      onSelect(fn) { selCb = fn; },
      enable(on) { enabled = !!on; paint(); },
      mark(m) { slots.filter(s => s.row === ansRow).forEach(s => s.t.setAttribute('fill', m === 'wrong' ? bad : ink)); },
      hasComma: !!cm,
    };
    cur = unitsOf(ansRow);
    paint();
    return api;
  }

  function divCalc(p, ctx, root, a, b, reveal) {
    const CW = 29, RH = 46, FS = 32;
    const resCol = isBoard() ? K.sun : K.teal;
    if (a !== Math.floor(a) || b !== Math.floor(b) || b < 1) {
      const g = svgIn(root, 300, 80);
      T(g, 150, 40, `${fmt(a)} : ${fmt(b)}`, { size: 34 });
      return;
    }
    const full = !p.short;
    const ds = String(a).split('').map(Number), n = ds.length;
    let pos = 0, cur = 0;
    while (pos < n) { cur = cur * 10 + ds[pos]; pos++; if (cur >= b) break; }
    const steps = [{ cur, end: pos - 1, brought: null }];
    for (;;) {
      const st = steps[steps.length - 1];
      st.q = Math.floor(st.cur / b); st.prod = st.q * b; st.rem = st.cur - st.prod;
      if (pos >= n) break;
      steps.push({ cur: st.rem * 10 + ds[pos], end: pos, brought: ds[pos] });
      pos++;
    }
    const Q = Number(steps.map(s => s.q).join('')), lastRem = steps[steps.length - 1].rem;
    const captions = [''];
    const rows = [];          // {cells:[{i,ch,stage}], prod?:bool, stage}
    let curRow = null;
    steps.forEach((st, k) => {
      const s = k + 1, last = k === steps.length - 1;
      let cap;
      if (isEN()) {
        cap = k === 0 ? `${String(st.cur).length > 1 ? `Start with ${st.cur}. ` : ''}${st.cur} divided by ${b} is ${st.q}, write ${st.q}.` : `Bring down ${st.brought} to make ${st.cur}; ${st.cur} divided by ${b} is ${st.q}, write ${st.q}.`;
        if (st.q > 0) cap += ` ${st.q} × ${b} = ${st.prod}; ${st.cur} − ${st.prod} = ${st.rem}.`;
        if (last) cap += ` So ${fmt(a)} : ${fmt(b)} = ${fmt(Q)}` + (lastRem ? ` remainder ${lastRem}` : '') + '.';
      } else {
        cap = k === 0 ? `${String(st.cur).length > 1 ? 'Lấy ' : ''}${st.cur} chia ${b} được ${st.q}, viết ${st.q}.` : `Hạ ${st.brought}, được ${st.cur}; ${st.cur} chia ${b} được ${st.q}, viết ${st.q}.`;
        if (st.q > 0) cap += ` ${st.q} nhân ${b} bằng ${st.prod}; ${st.cur} trừ ${st.prod} bằng ${st.rem}.`;
        if (last) cap += ` Vậy ${fmt(a)} : ${fmt(b)} = ${fmt(Q)}` + (lastRem ? ` (dư ${lastRem})` : '') + '.';
      }
      captions.push(cap);
      if (k > 0 && curRow) curRow.cells.push({ i: st.end, ch: String(st.brought), stage: s });
      if (st.q > 0 || k === 0) {
        if (full) {
          const ps = String(st.prod);
          const curLen = String(st.cur).length;
          rows.push({ cells: ps.split('').map((ch, j) => ({ i: st.end - ps.length + 1 + j, ch, stage: s })), prod: true, stage: s, start: Math.min(st.end - ps.length + 1, st.end - curLen + 1), end: st.end });
        }
        const rsx = String(st.rem);
        curRow = { cells: rsx.split('').map((ch, j) => ({ i: st.end - rsx.length + 1 + j, ch, stage: s })) };
        rows.push(curRow);
      }
    });
    const qlen = steps.length, blen = String(b).length;
    // the answer box is as long as the dividend (the quotient never has more digits), so it never tells how many digits the quotient has
    const qCols = reveal === 'all' ? qlen : Math.max(qlen, n);
    const x0 = 46, rightW = Math.max(blen, qCols) * CW + 36;
    const barX = x0 + n * CW + 12;
    const W = barX + rightW + 10, topPad = 10;
    const rStep = RH * 0.9;
    const H = topPad + RH + rows.length * rStep + 14;
    const g = svgIn(root, Math.max(W, 400), Math.max(H, topPad + 2 * RH + 14), { aria: LL('Phép chia', 'Division') });
    const cx = i => x0 + i * CW + CW / 2;
    const y0 = topPad + RH / 2;
    const ry = r => y0 + (r + 1) * rStep;
    const stg = stager(root, g, reveal, captions);
    const base = stg.S(0);
    ds.forEach((d, i) => T(base, cx(i), y0, d, { size: FS }));
    String(b).split('').forEach((d, j) => T(base, barX + 18 + j * CW + CW / 2, y0, d, { size: FS }));
    line(base, barX, y0 - RH / 2 + 2, barX, y0 + RH * 1.45, K.ink, 2.6);
    line(base, barX, y0 + RH / 2, barX + rightW - 8, y0 + RH / 2, K.ink, 2.6);
    const qx = j => barX + 18 + j * CW + CW / 2;
    if (reveal !== 'all') rect(base, qx(0) - CW / 2 + 3, y0 + RH - RH / 2 + 7, qCols * CW - 6, RH - 10, 10, tint(K.sky, 0.12), K.sky, 2, { dash: '5 4' });
    steps.forEach((st, k) => T(stg.S(k + 1), qx(k), y0 + RH + 2, st.q, { size: FS, fill: resCol }));
    rows.forEach((r, ri) => {
      const y = ry(ri);
      r.cells.forEach(c => T(stg.S(c.stage), cx(c.i), y, c.ch, { size: FS, fill: r.prod ? K.sub : K.ink }));
      if (r.prod) {
        const gp = stg.S(r.stage);
        T(gp, cx(r.start) - CW * 0.62, y - rStep * 0.5, '−', { size: 24, fill: K.orange });
        line(gp, cx(r.start) - CW / 2 + 2, y + RH * 0.42, cx(r.end) + CW / 2 - 2, y + RH * 0.42, K.ink, 2);
      }
    });
    stg.finish(steps.length);
  }

  /* =====================================================================
   * fraction — bar / pie / rect; interactive: tap parts → shaded count
   * ===================================================================== */
  function sectorPath(cx, cy, r, a0, a1) {
    if (a1 - a0 >= 359.999) return `M${cx - r},${cy} A${r},${r} 0 1 1 ${cx + r},${cy} A${r},${r} 0 1 1 ${cx - r},${cy} Z`;
    const p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
    return `M${cx},${cy} L${p0.x.toFixed(2)},${p0.y.toFixed(2)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1.x.toFixed(2)},${p1.y.toFixed(2)} Z`;
  }
  /** Angle in degrees, 0 = 12 o'clock, clockwise. */
  function polar(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }
  function factorRect(d) { let r = Math.floor(Math.sqrt(d)); while (r > 1 && d % r) r--; return [r, d / r]; }

  R.fraction = (p, ctx, root) => {
    const den = int(p.den, 4, 1, 24), shape = ['bar', 'pie', 'rect'].includes(p.shape) ? p.shape : 'bar';
    let shaded = int(p.num, 0, 0, den);
    const col = p.color && K[p.color] ? K[p.color] : (isStr(p.color) && p.color[0] === '#' ? p.color : K.orange);
    const inter = !!ctx.interactive;
    const showL = !!p.label;
    const on = new Array(den).fill(false).map((_, i) => i < shaded);
    const parts = [];
    let W, H, g;
    const style = (el, k) => {
      el.setAttribute('fill', on[k] ? solid(col) : (isBoard() ? 'rgba(244,247,242,.04)' : '#FFFFFF'));
    };
    const strokeC = isBoard() ? K.ink : K.ink, sw = 3;
    if (shape === 'pie') {
      W = showL ? 420 : 300; H = 280;
      g = svgIn(root, W, H, { aria: LL('Phân số', 'Fraction') });
      const cx = 150, cy = 140, r = 118;
      if (!isBoard()) circle(g, cx, cy + 5, r, K.shadow);
      for (let k = 0; k < den; k++) {
        const ag = A(g, 'viz-pop', 80 + k * 70);
        parts.push(path(ag, sectorPath(cx, cy, r, (360 / den) * k, (360 / den) * (k + 1)), '#fff', strokeC, sw));
      }
      if (showL) fracText(g, 350, 140, shaded, den, 40);
    } else if (shape === 'rect') {
      const [rr, cc] = factorRect(den);
      const cs = Math.min(70, 400 / cc, 220 / rr);
      W = cc * cs + 40 + (showL ? 120 : 0); H = rr * cs + 40;
      g = svgIn(root, Math.max(W, 240), H, { aria: LL('Phân số', 'Fraction') });
      const x0 = 20 + (Math.max(W, 240) - W) / 2;
      if (!isBoard()) rect(g, x0 + 4, 24, cc * cs, rr * cs, 10, K.shadow);
      for (let k = 0; k < den; k++) {
        const r = Math.floor(k / cc), c = k % cc;
        const ag = A(g, 'viz-pop', 80 + k * 50);
        parts.push(rect(ag, x0 + c * cs, 20 + r * cs, cs, cs, 0, '#fff', strokeC, sw));
      }
      rect(g, x0, 20, cc * cs, rr * cs, 6, 'none', strokeC, 3.5);
      if (showL) fracText(g, x0 + cc * cs + 60, H / 2, shaded, den, 40);
    } else {
      const bw = 560, bh = 76;
      W = bw + 40 + (showL ? 110 : 0); H = bh + 44;
      g = svgIn(root, W, H, { aria: LL('Phân số', 'Fraction') });
      const pw = bw / den;
      if (!isBoard()) rect(g, 24, 26, bw, bh, 12, K.shadow);
      for (let k = 0; k < den; k++) {
        const ag = A(g, 'viz-rise', 60 + k * 60);
        parts.push(rect(ag, 20 + k * pw, 20, pw, bh, 0, '#fff', strokeC, sw));
      }
      rect(g, 20, 20, bw, bh, 8, 'none', strokeC, 3.5);
      if (showL) fracText(g, 20 + bw + 60, 20 + bh / 2, shaded, den, 36);
    }
    parts.forEach(style);
    if (inter) {
      parts.forEach((el, k) => {
        el.classList.add('viz-tap');
        el.style.touchAction = 'manipulation';
        el.addEventListener('pointerdown', e => {
          e.preventDefault();
          on[k] = !on[k];
          style(el, k);
          shaded = on.filter(Boolean).length;
          emit(ctx, root, shaded);
        });
      });
      root.getValue = () => on.filter(Boolean).length;
    }
  };

  /* =====================================================================
   * fractionCompare — two bars aligned
   * ===================================================================== */
  R.fractionCompare = (p, ctx, root) => {
    const fa = arr(p.a).length === 2 ? p.a : [1, 2], fb = arr(p.b).length === 2 ? p.b : [1, 3];
    const fr = [fa, fb].map(f => { const d = int(f[1], 2, 1, 24); return [int(f[0], 0, 0, d * 3), d]; });
    const W = 680, bw = 530, bh = 62, x0 = 120;
    const H = 2 * bh + 70;
    const g = svgIn(root, W, H, { aria: LL('So sánh phân số', 'Comparing fractions') });
    const cols = [K.orange, K.sky];
    fr.forEach(([n, d], i) => {
      const y = 18 + i * (bh + 34), pw = bw / d;
      fracText(g, 56, y + bh / 2, n, d, 30);
      const ag = A(g, 'viz-rise', 100 + i * 250);
      for (let k = 0; k < d; k++) rect(ag, x0 + k * pw, y, pw, bh, 0, k < n ? solid(cols[i]) : K.paper, K.ink, 2.5);
      rect(ag, x0, y, bw, bh, 6, 'none', K.ink, 3);
    });
    const dg = A(g, 'viz-fade', 900);
    fr.forEach(([n, d], i) => {
      const x = x0 + bw * Math.min(1, n / d);
      line(dg, x, 8, x, H - 8, cols[i], 2.5, { dash: '6 5' });
    });
  };

  /* =====================================================================
   * clock — analog (+ digital); interactive drag hands → {h, m}
   * ===================================================================== */
  R.clock = (p, ctx, root) => {
    const inter = !!ctx.interactive;
    let h24 = int(p.h, 3, 0, 24), m = int(p.m, 0, 0, 59);
    if (inter) m = Math.round(m / 5) * 5 % 60;
    const pm = h24 >= 13 || (h24 === 12 && false);
    let h = ((h24 % 12) + 12) % 12 || 12;       // 1..12
    const dig = !!p.digital;
    const W = 300, H = dig ? 384 : 300, cx = 150, cy = 150, Rr = 136;
    const g = svgIn(root, W, H, { aria: LL('Đồng hồ', 'Clock') });
    if (!isBoard()) circle(g, cx, cy + 6, Rr, K.shadow);
    circle(g, cx, cy, Rr, isBoard() ? 'none' : K.teal, isBoard() ? K.ink : 'none', isBoard() ? 4 : 0);
    circle(g, cx, cy, Rr - 12, isBoard() ? 'rgba(244,247,242,.04)' : '#FFFFFF', isBoard() ? K.line : 'none', 1.5);
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      const p0 = polar(cx, cy, Rr - 16, i * 6), p1 = polar(cx, cy, Rr - (big ? 30 : 22), i * 6);
      line(g, p0.x, p0.y, p1.x, p1.y, big ? K.ink : K.grey, big ? 3.2 : 1.5);
    }
    for (let i = 1; i <= 12; i++) {
      const pt = polar(cx, cy, Rr - 50, i * 30);
      T(g, pt.x, pt.y + 1, i, { size: 26, weight: 800, fill: isBoard() ? K.ink : K.ink });
    }
    const hourHand = mk('g', null, g), minHand = mk('g', null, g);
    line(hourHand, cx, cy + 12, cx, cy - 60, K.ink, 10);
    line(minHand, cx, cy + 16, cx, cy - 100, K.orange, 6);
    circle(g, cx, cy, 9, K.sun, K.ink, 2.5);
    let digT = null;
    if (dig) {
      rect(g, 60, 312, 180, 60, 16, isBoard() ? 'none' : K.ink, isBoard() ? K.ink : 'none', 2.5);
      digT = T(g, 150, 343, '', { size: 36, weight: 800, fill: isBoard() ? K.sun : K.cyan, ls: 2 });
    }
    const angs = () => ({ ha: ((h % 12) + m / 60) * 30, ma: m * 6 });
    const draw = (ha, ma) => {
      hourHand.setAttribute('transform', `rotate(${ha.toFixed(2)} ${cx} ${cy})`);
      minHand.setAttribute('transform', `rotate(${ma.toFixed(2)} ${cx} ${cy})`);
      if (digT) {
        const hh = pm ? (h % 12) + 12 : h;
        digT.textContent = `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    };
    const fin = angs();
    if (reduced() || inter) draw(fin.ha, fin.ma);
    else {
      draw(0, 0);
      whenLive(root, () => later(250, () => tween(1000, t => { const e = easeOut(t); draw(fin.ha * e, fin.ma * e); })));
    }
    if (inter) {
      const hit = circle(g, cx, cy, Rr + 4, 'transparent', null, 0, { cls: 'viz-touch' });
      let drag = null, lastM = m;
      const angOf = e => { const pt = svgPt(root._svg, e); return { a: ((Math.atan2(pt.x - cx, cy - pt.y) * 180 / Math.PI) + 360) % 360, r: Math.hypot(pt.x - cx, pt.y - cy) }; };
      const diff = (x, y) => { const d = Math.abs(x - y) % 360; return d > 180 ? 360 - d : d; };
      const update = e => {
        const { a } = angOf(e);
        if (drag === 'm') {
          const nm = Math.round(a / 30) * 5 % 60;
          if (nm === lastM) return;
          if (lastM >= 45 && nm <= 15) h = h % 12 + 1;
          else if (lastM <= 15 && nm >= 45) h = (h + 10) % 12 + 1;
          m = nm; lastM = nm;
        } else {
          let tot = Math.round((a / 360 * 720) / 5) * 5 % 720;
          const nh = Math.floor(tot / 60) || 12, nm = tot % 60;
          if (nh === h && nm === m) return;
          h = nh; m = nm; lastM = nm;
        }
        const an = angs(); draw(an.ha, an.ma);
        emit(ctx, root, { h, m });
      };
      hit.addEventListener('pointerdown', e => {
        e.preventDefault();
        const { a, r } = angOf(e), an = angs();
        const dm = diff(a, an.ma), dh = diff(a, an.ha);
        drag = (r < Rr * 0.55 && dh < 35) || (dh < dm && dh < 30 && r < Rr * 0.75) ? 'h' : 'm';
        try { hit.setPointerCapture(e.pointerId); } catch (er) { /* */ }
        update(e);
      });
      hit.addEventListener('pointermove', e => { if (drag) update(e); });
      const up = () => { drag = null; };
      hit.addEventListener('pointerup', up); hit.addEventListener('pointercancel', up);
      root.getValue = () => ({ h, m });
    }
  };

  /* =====================================================================
   * calendar — tờ lịch tháng, Monday first
   * ===================================================================== */
  R.calendar = (p, ctx, root) => {
    const now = new Date();
    const year = int(p.year, now.getFullYear(), 1900, 2200), month = int(p.month, now.getMonth() + 1, 1, 12);
    const days = new Date(year, month, 0).getDate();
    const first = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const rows = Math.ceil((first + days) / 7);
    const hl = new Set(arr(p.highlight).map(Number));
    const marks = p.marks && typeof p.marks === 'object' ? p.marks : {};
    const cw = 88, ch = 50, x0 = 10, hH = 58, wH = 40;
    const W = 7 * cw + 20, H = hH + wH + rows * ch + 16;
    const g = svgIn(root, W, H, { aria: LL('Lịch tháng', 'Monthly calendar') });
    if (!isBoard()) rect(g, x0 + 3, 8, 7 * cw, H - 14, 18, K.shadow);
    rect(g, x0, 4, 7 * cw, H - 14, 18, isBoard() ? 'none' : '#FFFFFF', isBoard() ? K.ink : K.line, 2);
    path(g, `M${x0},${4 + hH} L${x0},22 Q${x0},4 ${x0 + 18},4 L${x0 + 7 * cw - 18},4 Q${x0 + 7 * cw},4 ${x0 + 7 * cw},22 L${x0 + 7 * cw},${4 + hH} Z`, isBoard() ? 'none' : K.teal);
    // rings
    [0.22, 0.78].forEach(t => { if (!isBoard()) { circle(g, x0 + 7 * cw * t, 4, 7, '#FFFFFF', K.ink, 2); } });
    const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    T(g, x0 + 3.5 * cw, 4 + hH / 2 + 2, LL(`Tháng ${month} năm ${year}`, `${MONTHS_EN[month - 1]} ${year}`), { size: 26, weight: 800, fill: isBoard() ? K.sun : '#FFFFFF' });
    if (isBoard()) line(g, x0, 4 + hH, x0 + 7 * cw, 4 + hH, K.ink, 2);
    const WD = isEN() ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
    const wy = 4 + hH;
    rect(g, x0, wy, 7 * cw, wH, 0, isBoard() ? 'rgba(244,247,242,.06)' : K.cream);
    WD.forEach((d, i) => T(g, x0 + i * cw + cw / 2, wy + wH / 2, d, { size: isEN() ? 14 : 15, weight: 800, fill: i === 6 ? (isBoard() ? K.berry : '#E04B6A') : K.ink }));
    line(g, x0, wy + wH, x0 + 7 * cw, wy + wH, K.line, 1.5);
    for (let d = 1; d <= days; d++) {
      const idx = first + d - 1, r = Math.floor(idx / 7), c = idx % 7;
      const x = x0 + c * cw + cw / 2, y = wy + wH + r * ch + ch / 2 + 2;
      const ag = A(g, 'viz-pop', 60 + d * 18);
      const isH = hl.has(d);
      if (isH) circle(ag, x, y, 21, isBoard() ? 'none' : K.orange, isBoard() ? K.orange : 'none', 3);
      T(ag, x, y, d, { size: 22, weight: isH ? 800 : 700, fill: isH ? (isBoard() ? K.orange : '#FFFFFF') : (c === 6 ? (isBoard() ? K.berry : '#E04B6A') : K.ink) });
      if (marks[d]) E(ag, x + 27, y - 12, String(marks[d]), 20);
    }
    for (let r = 1; r < rows; r++) line(g, x0 + 10, wy + wH + r * ch, x0 + 7 * cw - 10, wy + wH + r * ch, K.faint, 1.2);
  };

  /* =====================================================================
   * money — original simplified notes (colour per value) and coins
   * ===================================================================== */
  const NOTE_COL = { 100: '#C9B48A', 200: '#C9B48A', 500: '#D8C27A', 1000: '#D9B88F', 2000: '#A7B8D8', 5000: '#86CFC6', 10000: '#E9C764', 20000: '#7DB2E3', 50000: '#EE9DBB', 100000: '#86C98A', 200000: '#E59E6E', 500000: '#68C1D2' };
  function drawNote(g, x, y, v, k) {
    const w = 220, h = 104;
    const base = NOTE_COL[v] || pal(k);
    const fillC = isBoard() ? rgba(base, 0.55) : base;
    const ink = isBoard() ? '#FFFFFF' : '#1E3A4C';
    if (!isBoard()) rect(g, x + 3, y + 4, w, h, 14, K.shadow);
    rect(g, x, y, w, h, 14, fillC, isBoard() ? '#FFFFFF' : mix(base, '#1E3A4C', 0.25), 2);
    rect(g, x + 7, y + 7, w - 14, h - 14, 9, 'none', '#FFFFFF', 1.6, { opacity: 0.7 });
    // wave pattern
    path(g, `M${x + 10},${y + h - 24} q 25,-12 50,0 t 50,0 t 50,0 t 50,0`, 'none', '#FFFFFF', 2, { opacity: 0.45 });
    path(g, `M${x + 10},${y + h - 16} q 25,-12 50,0 t 50,0 t 50,0 t 50,0`, 'none', '#FFFFFF', 2, { opacity: 0.3 });
    // emblem: lotus-like flower of petals
    const ex = x + 46, ey = y + 46;
    circle(g, ex, ey, 29, '#FFFFFF', null, 0, { opacity: 0.4 });
    for (let i = 0; i < 6; i++) mk('ellipse', { cx: ex, cy: ey - 12, rx: 6.5, ry: 13, fill: '#FFFFFF', opacity: 0.75, transform: `rotate(${i * 60} ${ex} ${ey})` }, g);
    circle(g, ex, ey, 6, mix(base, '#1E3A4C', 0.2));
    mk('text', { x: x + 86, y: y + 21, 'font-size': 10, 'font-weight': 800, 'letter-spacing': 1.4, fill: ink, opacity: 0.65, 'dominant-baseline': 'central', text: LL('TIỀN HỌC TẬP', 'PLAY MONEY') }, g);
    const s = fmt(v);
    T(g, x + w - 16, y + 50, s, { size: s.length > 6 ? 30 : 34, weight: 800, fill: ink, anchor: 'end' });
    T(g, x + w - 16, y + 78, LL('đồng', 'dong'), { size: 17, weight: 700, fill: ink, anchor: 'end' });
    return { w, h };
  }
  function drawCoin(g, cx, cy, v) {
    const base = NOTE_COL[v] || '#D8C27A';
    if (!isBoard()) circle(g, cx + 2, cy + 3, 40, K.shadow);
    circle(g, cx, cy, 40, isBoard() ? rgba(base, 0.5) : base, isBoard() ? '#FFFFFF' : mix(base, '#1E3A4C', 0.3), 2.5);
    circle(g, cx, cy, 32, 'none', '#FFFFFF', 1.6, { opacity: 0.7 });
    T(g, cx, cy - 4, fmt(v), { size: 22, weight: 800, fill: isBoard() ? '#FFFFFF' : '#1E3A4C' });
    T(g, cx, cy + 16, LL('đồng', 'dong'), { size: 12, fill: isBoard() ? '#FFFFFF' : '#1E3A4C' });
  }
  R.money = (p, ctx, root) => {
    const notes = arr(p.notes).map(v => int(v, 0, 0, 1e7)).filter(v => v > 0).slice(0, 16);
    if (!notes.length) notes.push(10000);
    const per = notes.length <= 3 ? notes.length : notes.length === 4 ? 2 : notes.length <= 9 ? 3 : 4;
    const cw = 240, chh = 124;
    const rows = Math.ceil(notes.length / per);
    const W = per * cw + 20, H = rows * chh + 16;
    const g = svgIn(root, W, H, { aria: LL('Tiền', 'Money') });
    notes.forEach((v, i) => {
      const r = Math.floor(i / per), c = i % per;
      const inRow = Math.min(per, notes.length - r * per);
      const x = 10 + (W - 20 - inRow * cw) / 2 + c * cw + 10, y = 10 + r * chh;
      const rot = ((i * 37) % 7) - 3;
      const og = G(g, `rotate(${rot} ${x + 110} ${y + 52})`);
      const ag = A(og, 'viz-drop', 100 + i * 140);
      if (v < 1000) drawCoin(ag, x + 110, y + 52, v);
      else drawNote(ag, x, y, v, i);
    });
  };

  /* =====================================================================
   * ruler — object lying on a ruler
   * ===================================================================== */
  function drawObject(g, kind, x1, x2, yc, k) {
    const L = x2 - x1, h = 30;
    const out = isBoard() ? K.ink : '#1E3A4C';
    if (kind === 'pencil') {
      const er = Math.min(26, L * 0.14), tip = Math.min(40, L * 0.2);
      rect(g, x1, yc - h / 2, er, h, 6, solid(K.berry), out, 2);
      rect(g, x1 + er - 4, yc - h / 2, 10, h, 0, isBoard() ? 'none' : '#C9D6DE', out, 2);
      path(g, `M${x1 + er + 6},${yc - h / 2} L${x2 - tip},${yc - h / 2} L${x2 - tip},${yc + h / 2} L${x1 + er + 6},${yc + h / 2} Z`, solid(K.sun), out, 2);
      line(g, x1 + er + 8, yc, x2 - tip - 2, yc, isBoard() ? K.sun : '#E6A817', 2, { opacity: 0.8 });
      path(g, `M${x2 - tip},${yc - h / 2} L${x2},${yc} L${x2 - tip},${yc + h / 2} Z`, isBoard() ? 'none' : '#F6D7A7', out, 2);
      path(g, `M${x2 - tip * 0.32},${yc - h * 0.16} L${x2},${yc} L${x2 - tip * 0.32},${yc + h * 0.16} Z`, out, out, 1.5);
    } else if (kind === 'crayon') {
      const tip = Math.min(30, L * 0.18);
      path(g, `M${x1 + 6},${yc - h / 2} L${x2 - tip},${yc - h / 2} L${x2 - tip},${yc + h / 2} L${x1 + 6},${yc + h / 2} Q${x1},${yc + h / 2} ${x1},${yc} Q${x1},${yc - h / 2} ${x1 + 6},${yc - h / 2} Z`, solid(K.sky), out, 2);
      rect(g, x1 + L * 0.2, yc - h / 2, L * 0.45, h, 0, isBoard() ? 'none' : '#FFFFFF', out, 1.5, { opacity: 0.85 });
      T(g, x1 + L * 0.2 + L * 0.225, yc, LL('BÚT SÁP', 'CRAYON'), { size: 11, weight: 800, fill: K.sky });
      path(g, `M${x2 - tip},${yc - h / 2 + 4} L${x2},${yc} L${x2 - tip},${yc + h / 2 - 4} Z`, solid(K.sky), out, 2);
    } else if (kind === 'ribbon') {
      path(g, `M${x1},${yc - h / 2 + 2} L${x2},${yc - h / 2 + 2} L${x2 - 10},${yc} L${x2},${yc + h / 2 - 2} L${x1},${yc + h / 2 - 2} L${x1 + 10},${yc} Z`, solid(K.berry), out, 2);
      line(g, x1 + 14, yc - 5, x2 - 14, yc - 5, '#FFFFFF', 2, { opacity: 0.6, dash: '6 6' });
    } else if (kind === 'nail') {
      rect(g, x1, yc - 16, 8, 32, 3, isBoard() ? 'none' : '#9AA9B3', out, 2);
      path(g, `M${x1 + 8},${yc - 5} L${x2 - 16},${yc - 5} L${x2},${yc} L${x2 - 16},${yc + 5} L${x1 + 8},${yc + 5} Z`, isBoard() ? 'none' : '#B7C4CC', out, 2);
    } else if (kind === 'leaf') {
      path(g, `M${x1},${yc} Q${(x1 + x2) / 2},${yc - 34} ${x2},${yc} Q${(x1 + x2) / 2},${yc + 34} ${x1},${yc} Z`, solid(K.leaf), out, 2);
      line(g, x1, yc, x2 - 4, yc, out, 1.5, { opacity: 0.6 });
    } else if (kind === 'eraser') {
      rect(g, x1, yc - 18, L, 36, 8, solid(K.berry), out, 2);
      rect(g, x1 + L * 0.5, yc - 18, L * 0.5, 36, 0, solid(K.sky), out, 2);
    } else {
      rect(g, x1, yc - 9, L, 18, 9, solid(pal(k + 1)), out, 2);
    }
  }
  R.ruler = (p, ctx, root) => {
    const unit = ['cm', 'mm', 'dm'].includes(p.unit) ? p.unit : 'cm';
    const len = Math.max(0, num(p.length, 5)), start = Math.max(0, num(p.start, 0));
    // everything in cm internally
    const toCm = v => (unit === 'mm' ? v / 10 : unit === 'dm' ? v * 10 : v);
    const lenCm = toCm(len), stCm = toCm(start);
    const rulerCm = unit === 'dm' ? Math.max(20, Math.ceil((lenCm + stCm) / 10) * 10 + 5) : Math.max(10, Math.ceil(lenCm + stCm + 1));
    const W = 720, rx0 = 20, rw = W - 40, pad = 22;
    const ppc = (rw - pad * 2) / rulerCm;
    const X = cm => rx0 + pad + cm * ppc;
    const ry = 92, rh = 74, H = ry + rh + 12;
    const g = svgIn(root, W, H, { aria: LL('Thước', 'Ruler') });
    if (!isBoard()) rect(g, rx0 + 3, ry + 4, rw, rh, 12, K.shadow);
    rect(g, rx0, ry, rw, rh, 12, isBoard() ? 'rgba(255,229,138,.1)' : '#FFE08A', isBoard() ? K.sun : '#E0A82E', 2.5);
    const tc = isBoard() ? K.ink : '#5A4A1E';
    const mmOk = ppc / 10 >= 3 && unit !== 'dm';
    for (let mm = 0; mm <= rulerCm * 10; mm++) {
      const x = X(mm / 10);
      if (mm % 10 === 0) {
        const cm = mm / 10, big = unit === 'dm' ? cm % 10 === 0 : true;
        line(g, x, ry, x, ry + (big ? 30 : 20), tc, big ? 2.4 : 1.6);
        if (unit === 'dm') { if (cm % 10 === 0) T(g, x, ry + 46, cm === 0 ? '0' : `${cm / 10} dm`, { size: 19, fill: tc }); }
        else if (ppc >= 24 || cm % 2 === 0) T(g, x, ry + 46, cm, { size: ppc < 30 ? 15 : 18, fill: tc });
      } else if (mm % 5 === 0 && (mmOk || unit === 'dm' ? false : ppc >= 16)) line(g, x, ry, x, ry + 15, tc, 1.4);
      else if (mmOk) line(g, x, ry, x, ry + (mm % 5 === 0 ? 16 : 10), tc, mm % 5 === 0 ? 1.4 : 1);
    }
    T(g, rx0 + 10, ry + rh - 11, 'cm', { size: 14, fill: tc, anchor: 'start' });
    const obj = String(p.object || 'pencil');
    const og = A(g, 'viz-slide', 250);
    drawObject(og, obj, X(stCm), X(stCm + lenCm), 52, 0);
    const gg = A(g, 'viz-fade', 1100);
    [stCm, stCm + lenCm].forEach(v => line(gg, X(v), 70, X(v), ry, K.orange, 2, { dash: '4 4' }));
  };

  /* =====================================================================
   * scale — cân đĩa; beam tilts by weight
   * ===================================================================== */
  function panItems(g, items, cx, baseY) {
    // items sit on the pan: emoji labels big, otherwise a weight block with text
    const ws = items.map(it => (isEmoji(it.label) ? 70 : Math.max(66, tw(label(it.label != null ? it.label : it.kg + ' kg'), 19) + 24)));
    const tot = ws.reduce((s, w) => s + w, 0) + 4 * (items.length - 1);
    const sc = tot > 196 ? 196 / tot : 1;
    let x = cx - (tot * sc) / 2;
    items.forEach((it, i) => {
      const w = ws[i] * sc, mx = x + w / 2;
      const ag = A(g, 'viz-drop', 100 + i * 150);
      const lab = it.label != null ? String(it.label) : fmt(num(it.kg, 0)) + ' kg';
      if (isEmoji(lab)) E(ag, mx, baseY - 32 * sc, lab, 64 * sc);
      else {
        const bh = 54 * sc;
        path(ag, `M${mx - w / 2 + 6},${baseY} L${mx - w / 2 + 12},${baseY - bh} L${mx + w / 2 - 12},${baseY - bh} L${mx + w / 2 - 6},${baseY} Z`, isBoard() ? 'none' : '#4F6575', isBoard() ? K.ink : 'none', 2);
        path(ag, `M${mx - 7},${baseY - bh} Q${mx},${baseY - bh - 12} ${mx + 7},${baseY - bh}`, 'none', isBoard() ? K.ink : '#4F6575', 4);
        T(ag, mx, baseY - bh / 2, lab, { size: 19 * Math.max(sc, 0.75), weight: 800, fill: isBoard() ? K.sun : '#FFFFFF' });
      }
      x += w + 4 * sc;
    });
  }
  R.scale = (p, ctx, root) => {
    const L = arr(p.left).slice(0, 6), Rt = arr(p.right).slice(0, 6);
    const sum = a => a.reduce((s, it) => s + Math.max(0, num(it && it.kg, 0)), 0);
    const sl = sum(L), sr = sum(Rt);
    let ang = 0;
    if (sl !== sr) ang = clamp(((sr - sl) / Math.max(sl, sr, 1)) * 22, -13, 13), ang = Math.sign(ang) * Math.max(6, Math.abs(ang));
    const W = 640, H = 360, px = 320, py = 100, BL = 205;
    const g = svgIn(root, W, H, { aria: LL('Cân đĩa', 'Balance scale') });
    const metal = isBoard() ? 'none' : K.teal;
    // stand
    path(g, `M${px - 14},${py} L${px + 14},${py} L${px + 24},${H - 40} L${px - 24},${H - 40} Z`, metal, isBoard() ? K.ink : 'none', 2.5);
    rect(g, px - 90, H - 42, 180, 24, 12, isBoard() ? 'none' : mix(K.teal, '#1E3A4C', 0.3), isBoard() ? K.ink : 'none', 2.5);
    const beam = mk('g', null, g);
    rect(beam, px - BL - 8, py - 6, 2 * BL + 16, 12, 6, isBoard() ? 'none' : '#3E5566', isBoard() ? K.ink : 'none', 2.5);
    const pans = [L, Rt].map((items, side) => {
      const pg = mk('g', null, g);
      const pw = 210, drop = 125;
      line(pg, 0, 0, -pw / 2 + 8, drop, K.grey, 2);
      line(pg, 0, 0, pw / 2 - 8, drop, K.grey, 2);
      const inner = mk('g', null, pg);
      panItems(inner, items.map(it => it || {}), 0, drop - 2);
      path(pg, `M${-pw / 2},${drop} Q0,${drop + 46} ${pw / 2},${drop} Z`, isBoard() ? 'rgba(244,247,242,.08)' : '#C9D6DE', isBoard() ? K.ink : '#9AA9B3', 2.5);
      circle(pg, 0, 0, 5, K.orange);
      return pg;
    });
    circle(g, px, py, 10, K.orange, isBoard() ? K.ink : '#FFFFFF', 3);
    const set = a => {
      beam.setAttribute('transform', `rotate(${a.toFixed(2)} ${px} ${py})`);
      const r = a * Math.PI / 180;
      pans[0].setAttribute('transform', `translate(${(px - BL * Math.cos(r)).toFixed(2)},${(py - BL * Math.sin(r)).toFixed(2)})`);
      pans[1].setAttribute('transform', `translate(${(px + BL * Math.cos(r)).toFixed(2)},${(py + BL * Math.sin(r)).toFixed(2)})`);
    };
    set(0);
    if (reduced()) set(ang);
    else whenLive(root, () => later(800, () => tween(1500, t => set(t >= 1 ? ang : ang * (1 - Math.exp(-5 * t) * Math.cos(9 * t))))));
  };

  /* =====================================================================
   * jug — ca / bình with water level
   * ===================================================================== */
  function niceStep(range, maxTicks) {
    const raw = range / maxTicks, p10 = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * p10 >= raw) return m * p10;
    return 10 * p10;
  }
  R.jug = (p, ctx, root) => {
    const unit = p.unit === 'ml' ? 'ml' : 'l';
    const cap = Math.max(0.1, num(p.capacity, unit === 'ml' ? 1000 : 2));
    const amt = clamp(num(p.amount, cap / 2), 0, cap);
    const W = 340, H = 330;
    const g = svgIn(root, W, H, { aria: LL('Ca nước', 'Measuring jug') });
    const top = 44, bot = 300, fullY = 64;
    const jugPath = 'M92,44 L232,44 L224,284 Q222,300 206,300 L118,300 Q102,300 100,284 Z';
    const cid = uid('clip');
    mk('path', { d: jugPath }, mk('clipPath', { id: cid }, mk('defs', null, g)));
    if (!isBoard()) mk('path', { d: jugPath, fill: K.shadow, transform: 'translate(4,5)' }, g);
    path(g, 'M230,84 C292,84 292,212 226,214', 'none', isBoard() ? K.ink : '#B9D7E2', 14);
    path(g, jugPath, isBoard() ? 'rgba(159,216,255,.06)' : '#F2FAFD', 'none');
    // viz-nobox: the water is a tall block clipped to the jug; the picture's frame is measured without it
    const wg = mk('g', { 'clip-path': `url(#${cid})`, class: 'viz-nobox' }, g);
    const water = mk('g', null, wg);
    const wcol = isBoard() ? 'rgba(159,216,255,.42)' : 'rgba(77,163,255,.55)';
    // the water is alive (user: "lít nước thì cho động đậy"): the surface rocks gently, two ripples run across
    // it in opposite directions and a few bubbles rise; all of it stops with "Giảm chuyển động"
    const still = reduced();
    const bob = mk('g', null, water);
    rect(bob, 60, 0, 220, 400, 0, wcol);
    const wave = (d, col, from, to, dur) => {
      const wv = path(bob, d, col, 'none');
      if (!still) mk('animateTransform', { attributeName: 'transform', type: 'translate', from, to, dur, repeatCount: 'indefinite' }, wv);
    };
    const crest = x0 => `M${x0},0` + ' q 20,-8 40,0 t 40,0'.repeat(1) + ' t 40,0'.repeat(9);
    wave(crest(0), isBoard() ? 'rgba(159,216,255,.6)' : 'rgba(77,163,255,.75)', '0 0', '-80 0', '2.6s');
    wave(crest(-40), isBoard() ? 'rgba(159,216,255,.28)' : 'rgba(77,163,255,.35)', '-80 1', '0 1', '3.4s');
    if (!still) mk('animateTransform', { attributeName: 'transform', type: 'translate', values: '0 0; 0 2.2; 0 0; 0 -1.6; 0 0', dur: '3.2s', repeatCount: 'indefinite' }, bob);
    path(g, jugPath, 'none', isBoard() ? K.ink : '#8FBFD0', 4);
    path(g, 'M92,44 L76,34 L96,60', isBoard() ? 'none' : '#F2FAFD', isBoard() ? K.ink : '#8FBFD0', 3.5);
    path(g, 'M112,70 L108,270', 'none', '#FFFFFF', 6, { opacity: isBoard() ? 0.15 : 0.7 });
    // graduations
    let step = niceStep(cap, 6);
    const minor = step / 2;
    const Y = v => bot - 12 - (v / cap) * (bot - 12 - fullY);
    const tc = isBoard() ? K.ink : '#2F5A70';
    for (let v = minor; v <= cap + 1e-9; v = r6(v + minor)) {
      const major = Math.abs(v / step - Math.round(v / step)) < 1e-6, y = Y(v);
      line(g, 196, y, major ? 222 : 210, y, tc, major ? 2.6 : 1.6);
      if (major) T(g, 192, y, `${fmt(r6(v))} ${unit}`, { size: 15, weight: 800, fill: tc, anchor: 'end' });
    }
    const finalY = Y(amt);
    if (!still && bot - 14 - finalY > 40) {
      [[128, 5, '2.8s', '1.8s'], [158, 3.5, '3.6s', '2.7s'], [176, 4.5, '3.1s', '3.5s']].forEach(([x, r, dur, delay]) => {
        const b = circle(wg, x, bot - 14, r, 'none', isBoard() ? 'rgba(244,247,242,.55)' : 'rgba(255,255,255,.9)', 1.8);
        b.setAttribute('opacity', '0');
        mk('animate', { attributeName: 'cy', from: bot - 14, to: finalY + 8, dur, begin: delay, repeatCount: 'indefinite' }, b);
        mk('animate', { attributeName: 'opacity', values: '0;0.9;0.9;0', keyTimes: '0;0.15;0.8;1', dur, begin: delay, repeatCount: 'indefinite' }, b);
      });
    }
    const setLevel = y => water.setAttribute('transform', `translate(0,${y.toFixed(2)})`);
    setLevel(bot);
    if (reduced()) setLevel(finalY);
    else whenLive(root, () => later(300, () => tween(1400, t => setLevel(bot + (finalY - bot) * easeOut(t)))));
  };

  /* =====================================================================
   * thermometer — °C
   * ===================================================================== */
  R.thermometer = (p, ctx, root) => {
    const v = num(p.value, 25);
    let mn = p.min != null ? num(p.min, 0) : Math.min(0, Math.floor((v - 5) / 10) * 10);
    let mx = p.max != null ? num(p.max, 50) : Math.max(50, Math.ceil((v + 5) / 10) * 10);
    if (mx <= mn) mx = mn + 50;
    const W = 260, H = 360, cx = 150, t0 = 40, t1 = 280;
    const g = svgIn(root, W, H, { aria: LL('Nhiệt kế', 'Thermometer') });
    const Y = x => t1 - ((x - mn) / (mx - mn)) * (t1 - t0);
    const red = isBoard() ? K.berry : '#F0506E';
    rect(g, cx - 17, t0 - 22, 34, t1 - t0 + 50, 17, isBoard() ? 'none' : '#FFFFFF', isBoard() ? K.ink : '#B7C4CC', 3);
    circle(g, cx, t1 + 40, 30, isBoard() ? 'none' : '#FFFFFF', isBoard() ? K.ink : '#B7C4CC', 3);
    circle(g, cx, t1 + 40, 22, isBoard() ? rgba(K.berry, 0.6) : red);
    const liq = rect(g, cx - 7, Y(mn), 14, t1 + 30 - Y(mn), 7, isBoard() ? rgba(K.berry, 0.6) : red);
    const range = mx - mn;
    const tick = range <= 60 ? 1 : range <= 120 ? 2 : 5, lab = range <= 30 ? 5 : 10;
    const tc = K.ink;
    for (let x = Math.ceil(mn / tick) * tick; x <= mx + 1e-9; x = r6(x + tick)) {
      const y = Y(x), big = Math.abs(x / lab - Math.round(x / lab)) < 1e-6, mid = !big && Math.abs(x / (lab / 2) - Math.round(x / (lab / 2))) < 1e-6;
      line(g, cx - 22, y, cx - 22 - (big ? 18 : mid ? 12 : 7), y, tc, big ? 2.4 : 1.3);
      if (big) T(g, cx - 48, y, fmt(x), { size: 17, anchor: 'end', fill: tc });
    }
    T(g, cx + 34, t0 - 10, '°C', { size: 20, anchor: 'start', fill: K.ink });
    if (p.showValue) {
      const ag = A(g, 'viz-fade', 1500);
      T(ag, cx + 34, Y(v), `${fmt(v)}°C`, { size: 20, anchor: 'start', fill: isBoard() ? K.berry : red });
    }
    const set = x => { const y = Y(x); liq.setAttribute('y', y.toFixed(2)); liq.setAttribute('height', Math.max(0, t1 + 30 - y).toFixed(2)); };
    set(mn);
    if (reduced()) set(clamp(v, mn, mx));
    else whenLive(root, () => later(300, () => tween(1300, t => set(mn + (clamp(v, mn, mx) - mn) * easeOut(t)))));
  };

  /* =====================================================================
   * shape — plane figures with dims / height / vertex letters
   * ===================================================================== */
  function dimVal(d, k, def) { const v = d && d[k]; return isFinite(num(v, NaN)) && num(v) > 0 ? num(v) : def; }
  function dimLab(d, k, def, unit) { const v = d && d[k]; if (v == null) return label(def, unit); return isStr(v) && !isFinite(num(v, NaN)) ? v : label(num(v), unit); }
  /** Unit geometry for a kind: returns {pts:[[x,y]] (y up), closed, extra}. */
  function shapeGeom(kind, d) {
    d = d || {};
    switch (kind) {
      case 'square': { const a = dimVal(d, 'a', 4); return { pts: [[0, 0], [a, 0], [a, a], [0, a]], right: [0, 1, 2, 3], sides: [['a', 0]], ticks: true }; }
      case 'rect': { const a = dimVal(d, 'a', 6), b = dimVal(d, 'b', 4); return { pts: [[0, 0], [a, 0], [a, b], [0, b]], right: [0, 1, 2, 3], sides: [['a', 0], ['b', 1]] }; }
      case 'triangle': {
        if (d.a && d.b && d.c && !d.h) {
          const a = dimVal(d, 'a', 6), b = dimVal(d, 'b', 5), c = dimVal(d, 'c', 4);
          let x = (a * a + b * b - c * c) / (2 * a), y2 = b * b - x * x;
          if (!(y2 > 0)) { x = a * 0.4; y2 = (a * 0.6) * (a * 0.6); }
          return { pts: [[0, 0], [a, 0], [x, Math.sqrt(y2)]], sides: [['a', 0], ['c', 1], ['b', 2]] };
        }
        const a = dimVal(d, 'a', 6), h = dimVal(d, 'h', 4), off = d.x != null ? num(d.x, a * 0.35) : a * 0.35;
        return { pts: [[0, 0], [a, 0], [off, h]], sides: [['a', 0]], height: { from: 2, foot: [off, 0], key: 'h' } };
      }
      case 'rtriangle': { const a = dimVal(d, 'a', 6), b = dimVal(d, 'b', 4); return { pts: [[0, 0], [a, 0], [0, b]], right: [0], sides: [['a', 0], ['b', 2], ['c', 1]] }; }
      case 'quad': { const s = 1; return { pts: [[0, 0], [6.2 * s, 0], [5.2 * s, 3.4 * s], [0.8 * s, 2.8 * s]], sides: [['a', 0], ['b', 1], ['c', 2], ['d', 3]] }; }
      case 'parallelogram': {
        const a = dimVal(d, 'a', 6), h = dimVal(d, 'h', 3), b = dimVal(d, 'b', 0);
        const s = b > h ? Math.sqrt(b * b - h * h) : a * 0.3;
        return { pts: [[0, 0], [a, 0], [a + s, h], [s, h]], sides: [['a', 0], ['b', 1]], height: { from: 3, foot: [s, 0], key: 'h' } };
      }
      case 'rhombus': {
        const d1 = dimVal(d, 'd1', 0), d2 = dimVal(d, 'd2', 0), a = dimVal(d, 'a', 4);
        const m = d1 || a * 1.6, n = d2 || a * 1.2;
        return { pts: [[0, n / 2], [m / 2, 0], [m, n / 2], [m / 2, n]], sides: d1 ? [] : [['a', 0]], diag: d1 ? [['d1', [0, n / 2], [m, n / 2]], ['d2', [m / 2, 0], [m / 2, n]]] : null, ticks: true };
      }
      case 'trapezoid': {
        const a = dimVal(d, 'a', 7), b = dimVal(d, 'b', 4), h = dimVal(d, 'h', 3.4), off = (a - b) * 0.35;
        return { pts: [[0, 0], [a, 0], [off + b, h], [off, h]], sides: [['a', 0], ['b', 2]], height: { from: 3, foot: [off, 0], key: 'h' } };
      }
      case 'pentagon': case 'hexagon': {
        const n = kind === 'pentagon' ? 5 : 6, pts = [];
        for (let i = 0; i < n; i++) { const t = -Math.PI / 2 + i * 2 * Math.PI / n + (n === 6 ? Math.PI / 6 : 0); pts.push([3 + 3 * Math.cos(t), 3 - 3 * Math.sin(t)]); }
        return { pts, sides: [] };
      }
      case 'polyline': {
        const sides = arr(d.sides).length ? d.sides : arr(d.segments).length ? d.segments : [3, 4, 3];
        const pts = [[0, 0]];
        let x = 0, y = 0;
        sides.forEach((s, i) => { const L = Math.max(0.5, num(s, 3)), t = (i % 2 ? -1 : 1) * (Math.PI / 5.5); x += L * Math.cos(t); y += L * Math.sin(t); pts.push([x, y]); });
        return { pts, open: true, sides: sides.map((s, i) => [i, i]), polySides: sides };
      }
      default: return null;
    }
  }
  /** Draw a shape fitted into box (bx,by,bw,bh). Returns the screen points. */
  function drawShapeIn(g, kind, dims, bx, by, bw, bh, o) {
    o = o || {};
    const col = o.color || K.teal;
    if (kind === 'circle' || kind === 'oval' || kind === 'semicircle') {
      const cx = bx + bw / 2, cy = by + bh / 2, r = Math.min(bw, bh) / 2;
      const node = kind === 'oval' ? mk('ellipse', { cx, cy, rx: Math.min(bw / 2, r * 1.5), ry: r * 0.7 }, g)
        : kind === 'semicircle' ? mk('path', { d: `M${cx - r},${cy + r * 0.4} A${r},${r} 0 0 1 ${cx + r},${cy + r * 0.4} Z` }, g)
          : mk('circle', { cx, cy, r }, g);
      node.setAttribute('fill', o.noFill ? 'none' : tint(col, 0.3));
      node.setAttribute('stroke', isBoard() ? col : edge(col));
      node.setAttribute('stroke-width', o.sw || 3.5);
      return { cx, cy, r, circle: true };
    }
    const geo = shapeGeom(kind, dims);
    if (!geo) return null;
    const xs = geo.pts.map(q => q[0]), ys = geo.pts.map(q => q[1]);
    const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
    const s = Math.min(bw / Math.max(mxx - mnx, 0.01), bh / Math.max(mxy - mny, 0.01));
    const ox = bx + (bw - (mxx - mnx) * s) / 2, oy = by + (bh + (mxy - mny) * s) / 2;
    const P = q => [ox + (q[0] - mnx) * s, oy - (q[1] - mny) * s];
    const pts = geo.pts.map(P);
    const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + (geo.open ? '' : ' Z');
    if (!geo.open && !o.noFill) {
      const fg = o.animate ? A(g, 'viz-fade', 900) : g;
      path(fg, d, tint(col, 0.3));
    }
    path(g, d, 'none', isBoard() ? col : edge(col), o.sw || 3.5, o.animate ? { pl: 1, cls: 'viz-draw' } : null);
    if (geo.open) pts.forEach(q => circle(g, q[0], q[1], 4.5, isBoard() ? K.ink : edge(col)));
    return { pts, geo, P, s, d };
  }
  function rightMark(g, P0, P1, P2, size, stroke) {
    // right-angle mark at P0 between rays to P1 and P2
    const u = (A1, B) => { const dx = B[0] - A1[0], dy = B[1] - A1[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
    const a = u(P0, P1), b = u(P0, P2), s = size || 14;
    path(g, `M${P0[0] + a[0] * s},${P0[1] + a[1] * s} L${P0[0] + (a[0] + b[0]) * s},${P0[1] + (a[1] + b[1]) * s} L${P0[0] + b[0] * s},${P0[1] + b[1] * s}`, 'none', stroke || K.ink, 2);
  }
  R.shape = (p, ctx, root) => {
    const kind = String(p.kind || 'square');
    const dims = p.dims || {};
    const unit = dims.unit || 'cm';
    const showDims = p.showDims != null ? !!p.showDims : p.dims != null;
    const W = 460, H = 320, pad = 58;
    const g = svgIn(root, W, H + (p.label && !/^[A-Z]+$/.test(p.label) ? 30 : 0), { aria: LL('Hình', 'Shape') });
    const col = p.color && K[p.color] ? K[p.color] : K.teal;
    const res = drawShapeIn(g, kind, dims, pad, pad - 14, W - 2 * pad, H - 2 * pad + 10, { color: col, animate: true });
    if (!res) throw new Error('unknown kind');
    const lc = isBoard() ? K.sun : K.ink;
    const lg = A(g, 'viz-fade', 1300);
    if (res.circle) {
      circle(lg, res.cx, res.cy, 4.5, K.ink);
      T(lg, res.cx - 12, res.cy + 14, (p.label && p.label.length === 1) ? p.label : 'O', { size: 18 });
      if (showDims || dims.r || dims.d) {
        if (dims.d) {
          line(lg, res.cx - res.r, res.cy, res.cx + res.r, res.cy, K.orange, 3);
          T(lg, res.cx + res.r / 2, res.cy - 16, `d = ${dimLab(dims, 'd', 6, unit)}`, { size: 18, fill: lc });
        } else {
          line(lg, res.cx, res.cy, res.cx + res.r, res.cy, K.orange, 3);
          T(lg, res.cx + res.r / 2, res.cy - 16, `r = ${dimLab(dims, 'r', 3, unit)}`, { size: 18, fill: lc });
        }
      }
      return;
    }
    const { pts, geo } = res;
    const n = pts.length;
    const cxm = pts.reduce((s, q) => s + q[0], 0) / n, cym = pts.reduce((s, q) => s + q[1], 0) / n;
    (geo.right || []).forEach(i => rightMark(lg, pts[i], pts[(i + 1) % n], pts[(i + n - 1) % n], 14, K.ink));
    if (geo.ticks) for (let i = 0; i < n; i++) {
      const a1 = pts[i], b1 = pts[(i + 1) % n], mx = (a1[0] + b1[0]) / 2, my = (a1[1] + b1[1]) / 2;
      const dx = b1[0] - a1[0], dy = b1[1] - a1[1], L = Math.hypot(dx, dy);
      line(lg, mx - dy / L * 7, my + dx / L * 7, mx + dy / L * 7, my - dx / L * 7, K.ink, 2.2);
    }
    if (showDims) {
      (geo.sides || []).forEach(([key, i]) => {
        const a1 = pts[i], b1 = pts[(i + 1) % n];
        if (!b1) return;
        const mx = (a1[0] + b1[0]) / 2, my = (a1[1] + b1[1]) / 2;
        const dx = b1[0] - a1[0], dy = b1[1] - a1[1], L = Math.hypot(dx, dy) || 1;
        let nx = dy / L, ny = -dx / L;
        if (geo.open) { nx = -Math.abs(nx) * 0 + nx; ny = ny; if (ny > 0) { nx = -nx; ny = -ny; } }
        else if ((mx + nx - cxm) * nx + (my + ny - cym) * ny < 0) { nx = -nx; ny = -ny; }
        const txt = geo.polySides ? label(isStr(geo.polySides[i]) ? geo.polySides[i] : num(geo.polySides[i], 0), unit) : dimLab(dims, key, '', unit);
        if (!txt) return;
        T(lg, mx + nx * 24, my + ny * 22, txt, { size: 21, fill: lc });
      });
      if (geo.diag) geo.diag.forEach(([key, q1, q2]) => {
        const A1 = res.P(q1), B1 = res.P(q2);
        line(lg, A1[0], A1[1], B1[0], B1[1], K.orange, 2.4, { dash: '7 5' });
        const mx = (A1[0] + B1[0]) / 2, my = (A1[1] + B1[1]) / 2;
        T(lg, mx + (key === 'd2' ? 14 : 0), my + (key === 'd1' ? -14 : 30), dimLab(dims, key, '', unit), { size: 17, fill: lc, anchor: key === 'd2' ? 'start' : 'middle' });
      });
    }
    if (geo.height && (p.showHeight || (showDims && dims.h != null && kind !== 'rect'))) {
      const top = pts[geo.height.from], foot = res.P(geo.height.foot);
      line(lg, top[0], top[1], foot[0], foot[1], K.orange, 2.6, { dash: '7 5' });
      rightMark(lg, foot, top, [foot[0] + 10, foot[1]], 11, K.orange);
      if (dims.h != null) T(lg, top[0] + 8, (top[1] + foot[1]) / 2, `h = ${dimLab(dims, 'h', '', unit)}`, { size: 20, fill: lc, anchor: 'start' });
    }
    if (p.label) {
      const L = String(p.label);
      if (/^[A-Z]+$/.test(L) && L.length === n) {
        pts.forEach((q, i) => {
          const dx = q[0] - cxm, dy = q[1] - cym, Ln = Math.hypot(dx, dy) || 1;
          T(lg, q[0] + dx / Ln * 18, q[1] + dy / Ln * 18, L[i], { size: 20, fill: K.ink });
        });
      } else T(lg, W / 2, H + 10, L, { size: 18, fill: K.sub });
    }
  };

  /* =====================================================================
   * shapeSet — several shapes; interactive: tap to select → [indexes]
   * ===================================================================== */
  R.shapeSet = (p, ctx, root) => {
    const items = arr(p.items).slice(0, 12).map(it => (isStr(it) ? { kind: it } : it || {}));
    if (!items.length) items.push({ kind: 'square' }, { kind: 'circle' }, { kind: 'triangle' });
    const n = items.length, per = n <= 4 ? n : n <= 8 ? Math.ceil(n / 2) : 4, rows = Math.ceil(n / per);
    const cs = 132, W = per * cs + 16, H = rows * cs + 12;
    const g = svgIn(root, Math.max(W, 300), H, { aria: LL('Các hình', 'Shapes') });
    const x0 = (Math.max(W, 300) - per * cs) / 2;
    const inter = !!ctx.interactive;
    const sel = new Set();
    const cells = items.map((it, i) => {
      const r = Math.floor(i / per), c = i % per, x = x0 + c * cs, y = 6 + r * cs;
      const og = G(g, it.rot ? `rotate(${num(it.rot, 0)} ${x + cs / 2} ${y + cs / 2})` : null);
      const ag = A(og, 'viz-pop', 100 + i * 110);
      const ring = rect(ag, x + 6, y + 6, cs - 12, cs - 12, 22, isBoard() ? 'none' : K.paper, isBoard() ? K.line : K.faint, 2, isBoard() ? { dash: '6 6' } : null);
      const col = it.color && K[it.color] ? K[it.color] : pal(i);
      const k = String(it.kind || 'square');
      const bw = k === 'rect' || k === 'parallelogram' || k === 'trapezoid' || k === 'oval' ? 92 : 76;
      const dims = k === 'rect' ? { a: 6, b: 3.6 } : it.dims;
      drawShapeIn(ag, k, dims, x + (cs - bw) / 2, y + (cs - 76) / 2, bw, 76, { color: col, sw: 3.5 });
      const badge = mk('g', { opacity: 0 }, ag);
      circle(badge, x + cs - 22, y + 22, 13, K.orange, isBoard() ? 'none' : '#FFFFFF', 2);
      path(badge, `M${x + cs - 28},${y + 22} L${x + cs - 23},${y + 27} L${x + cs - 15},${y + 17}`, 'none', '#FFFFFF', 3);
      return { ring, badge, x, y };
    });
    if (inter) {
      cells.forEach((c, i) => {
        const hit = rect(g, c.x + 4, c.y + 4, cs - 8, cs - 8, 22, 'transparent', null, 0, { cls: 'viz-tap' });
        hit.addEventListener('pointerdown', e => {
          e.preventDefault();
          if (sel.has(i)) sel.delete(i); else sel.add(i);
          const on = sel.has(i);
          c.ring.setAttribute('stroke', on ? K.orange : (isBoard() ? K.line : K.faint));
          c.ring.setAttribute('stroke-width', on ? 4.5 : 2);
          c.ring.setAttribute('stroke-dasharray', on ? 'none' : (isBoard() ? '6 6' : 'none'));
          if (!isBoard()) c.ring.setAttribute('fill', on ? tint(K.orange, 0.12) : K.paper);
          c.badge.setAttribute('opacity', on ? 1 : 0);
          emit(ctx, root, [...sel].sort((a1, b1) => a1 - b1));
        });
      });
      root.getValue = () => [...sel].sort((a1, b1) => a1 - b1);
    }
  };

  /* =====================================================================
   * solid — cube, box, cylinder, sphere
   * ===================================================================== */
  R.solid = (p, ctx, root) => {
    const kind = String(p.kind || 'cube'), d = p.dims || {}, unit = d.unit || 'cm';
    const showD = p.showDims != null ? !!p.showDims : p.dims != null;
    const W = 400, H = 300;
    const g = svgIn(root, W, H, { aria: LL('Hình khối', '3D shape') });
    const col = p.color && K[p.color] ? K[p.color] : (kind === 'cylinder' ? K.orange : kind === 'sphere' ? K.berry : K.sky);
    const ec = isBoard() ? col : edge(col);
    const ag = A(g, 'viz-pop', 100);
    const lg = A(g, 'viz-fade', 800);
    const lc = isBoard() ? K.sun : K.ink;
    if (kind === 'cube' || kind === 'box') {
      let l = dimVal(d, kind === 'cube' ? 'a' : 'l', kind === 'cube' ? 4 : 6), w = dimVal(d, 'w', kind === 'cube' ? l : 3), h = dimVal(d, 'h', kind === 'cube' ? l : 3.5);
      if (kind === 'cube') { w = l; h = l; }
      const k = 0.5, ang = Math.PI / 6;
      const dx = w * k * Math.cos(ang), dy = w * k * Math.sin(ang);
      const s = Math.min(280 / (l + dx), 220 / (h + dy));
      const fw = l * s, fh = h * s, ox = (W - (fw + dx * s)) / 2, oy = (H + fh + dy * s) / 2 - fh - 10 + dy * s;
      const F = [[ox, oy], [ox + fw, oy], [ox + fw, oy + fh], [ox, oy + fh]];
      const off = [dx * s, -dy * s];
      const B = F.map(q => [q[0] + off[0], q[1] + off[1]]);
      const poly = pts => pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + 'Z';
      // hidden edges
      const hc = isBoard() ? K.line : mix(col, '#FFFFFF', 0.2);
      [[B[3], B[0]], [B[3], B[2]], [B[3], F[3]]].forEach(([a1, b1]) => line(ag, a1[0], a1[1], b1[0], b1[1], hc, 2, { dash: '6 5' }));
      path(ag, poly([F[0], B[0], B[1], F[1]]), tint(col, 0.45), ec, 3);
      path(ag, poly([F[1], B[1], B[2], F[2]]), isBoard() ? rgba(col, 0.22) : mix(col, '#1E3A4C', 0.12), ec, 3);
      path(ag, poly(F), tint(col, 0.7), ec, 3);
      if (showD) {
        T(lg, (F[2][0] + F[3][0]) / 2, F[3][1] + 20, dimLab(d, kind === 'cube' ? 'a' : 'l', '', unit), { size: 18, fill: lc });
        if (kind === 'box') {
          T(lg, (F[2][0] + B[2][0]) / 2 + 26, (F[2][1] + B[2][1]) / 2 + 6, dimLab(d, 'w', '', unit), { size: 18, fill: lc, anchor: 'start' });
          T(lg, F[0][0] - 12, (F[0][1] + F[3][1]) / 2, dimLab(d, 'h', '', unit), { size: 18, fill: lc, anchor: 'end' });
        }
      }
    } else if (kind === 'cylinder') {
      const r = dimVal(d, 'r', 2), h = dimVal(d, 'h', 4);
      const s = Math.min(240 / (2 * r), 200 / h);
      const rx = r * s, ry = rx * 0.3, hh = h * s, cx = W / 2, ty = (H - hh) / 2;
      path(ag, `M${cx - rx},${ty} L${cx - rx},${ty + hh} A${rx},${ry} 0 0 0 ${cx + rx},${ty + hh} L${cx + rx},${ty} Z`, tint(col, 0.55), ec, 3);
      path(ag, `M${cx - rx},${ty + hh} A${rx},${ry} 0 0 1 ${cx + rx},${ty + hh}`, 'none', isBoard() ? K.line : mix(col, '#FFFFFF', 0.2), 2, { dash: '6 5' });
      mk('ellipse', { cx, cy: ty, rx, ry, fill: tint(col, 0.3), stroke: ec, 'stroke-width': 3 }, ag);
      rect(ag, cx - rx + 10, ty + 8, 10, hh - 10, 5, '#FFFFFF', null, 0, { opacity: isBoard() ? 0.1 : 0.35 });
      if (showD) {
        line(lg, cx, ty, cx + rx, ty, K.orange, 2.5); circle(lg, cx, ty, 3.5, K.ink);
        T(lg, cx + rx / 2, ty - 14, `r = ${dimLab(d, 'r', '', unit)}`, { size: 17, fill: lc });
        T(lg, cx + rx + 12, ty + hh / 2, `h = ${dimLab(d, 'h', '', unit)}`, { size: 17, fill: lc, anchor: 'start' });
      }
    } else {
      const r = 110, cx = W / 2, cy = H / 2;
      const gid = uid('rg');
      const gr = mk('radialGradient', { id: gid, cx: '35%', cy: '30%', r: '75%' }, mk('defs', null, g));
      mk('stop', { offset: '0%', 'stop-color': isBoard() ? 'rgba(255,255,255,.25)' : '#FFFFFF' }, gr);
      mk('stop', { offset: '100%', 'stop-color': isBoard() ? rgba(col, 0.35) : mix(col, '#FFFFFF', 0.2) }, gr);
      circle(ag, cx, cy, r, `url(#${gid})`, ec, 3);
      path(ag, `M${cx - r},${cy} A${r},${r * 0.28} 0 0 1 ${cx + r},${cy}`, 'none', isBoard() ? K.line : mix(col, '#1E3A4C', 0.1), 2, { dash: '6 5' });
      path(ag, `M${cx - r},${cy} A${r},${r * 0.28} 0 0 0 ${cx + r},${cy}`, 'none', ec, 2.4);
      if (showD) { line(lg, cx, cy, cx + r, cy, K.orange, 2.5); circle(lg, cx, cy, 4, K.ink); T(lg, cx + r / 2, cy - 14, `r = ${dimLab(d, 'r', '', unit)}`, { size: 17, fill: lc }); }
    }
  };

  /* =====================================================================
   * areaGrid — unit squares + perimeter walk
   * ===================================================================== */
  R.areaGrid = (p, ctx, root) => {
    const w = int(p.w, 5, 1, 24), h = int(p.h, 3, 1, 16), unit = String(p.unit || 'cm');
    const c = Math.min(46, 520 / w, 230 / h);
    const W = w * c + 150, H = h * c + 96;
    const g = svgIn(root, W, H, { aria: LL('Ô vuông', 'Squares grid') });
    const x0 = 70, y0 = 40;
    const fillOn = p.fill !== false;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (fillOn) {
        const ag = A(g, 'viz-pop', 100 + Math.min(k * 28, 2200));
        rect(ag, x0 + i * c + 2, y0 + j * c + 2, c - 4, c - 4, 4, tint(K.cyan, 0.55));
      }
    }
    for (let i = 0; i <= w; i++) line(g, x0 + i * c, y0, x0 + i * c, y0 + h * c, K.line, 1.4);
    for (let j = 0; j <= h; j++) line(g, x0, y0 + j * c, x0 + w * c, y0 + j * c, K.line, 1.4);
    rect(g, x0, y0, w * c, h * c, 3, 'none', isBoard() ? K.ink : K.teal, 3);
    const lc = isBoard() ? K.sun : K.ink;
    T(g, x0 + w * c / 2, y0 - 18, `${w} ${unit}`, { size: 18, fill: lc });
    T(g, x0 - 12, y0 + h * c / 2, `${h} ${unit}`, { size: 18, fill: lc, anchor: 'end' });
    // legend 1 unit²
    rect(g, x0 + w * c + 22, y0 + h * c - c * 0.6, c * 0.6, c * 0.6, 3, tint(K.cyan, 0.55), isBoard() ? K.ink : K.teal, 1.5);
    T(g, x0 + w * c + 26 + c * 0.6, y0 + h * c - c * 0.3, `1 ${unit}²`, { size: 16, anchor: 'start', fill: K.sub });
    if (p.showPerimeter) {
      const d = `M${x0},${y0} L${x0 + w * c},${y0} L${x0 + w * c},${y0 + h * c} L${x0},${y0 + h * c} Z`;
      const pp = path(g, d, 'none', K.orange, 5, { pl: 1, cls: 'viz-draw' });
      pp.style.animationDuration = '2.4s';
      pp.style.animationDelay = '0.6s';
      const dot = mk('g', null, g);
      circle(dot, 0, 0, 9, K.orange, isBoard() ? 'none' : '#FFFFFF', 3);
      const P = 2 * (w + h) * c;
      const at = t => {
        let s = t * P;
        if (s <= w * c) return [x0 + s, y0]; s -= w * c;
        if (s <= h * c) return [x0 + w * c, y0 + s]; s -= h * c;
        if (s <= w * c) return [x0 + w * c - s, y0 + h * c]; s -= w * c;
        return [x0, y0 + h * c - s];
      };
      setXY(dot, x0, y0);
      whenLive(root, () => later(600, () => tween(2400, t => { const q = at(ease(t)); setXY(dot, q[0], q[1]); })));
      T(g, x0 + w * c / 2, y0 + h * c + 26, LL('Chu vi: đi một vòng quanh hình', 'Perimeter: once round the shape'), { size: 15, fill: K.sub });
    }
  };

  /* =====================================================================
   * angle — góc with optional protractor
   * ===================================================================== */
  R.angle = (p, ctx, root) => {
    const deg = clamp(num(p.deg, 60), 0, 360);
    const W = 400, H = deg > 180 ? 360 : 250;
    const g = svgIn(root, W, H, { aria: LL('Góc', 'Angle') });
    const wide = deg > 90 || p.protractor;
    const ox = wide ? 200 : 110, oy = deg > 180 ? 180 : 218, L = wide ? 168 : 200;
    const Lr = L;
    if (p.protractor) {
      const R1 = 150;
      path(g, `M${ox - R1},${oy} A${R1},${R1} 0 0 1 ${ox + R1},${oy} Z`, isBoard() ? 'rgba(159,216,255,.08)' : 'rgba(77,163,255,.12)', isBoard() ? K.sky : '#7FB8E6', 2);
      for (let a = 0; a <= 180; a++) {
        const big = a % 10 === 0, mid = a % 5 === 0, r0 = R1, r1 = R1 - (big ? 16 : mid ? 11 : 6);
        const t = a * Math.PI / 180;
        line(g, ox + r0 * Math.cos(t), oy - r0 * Math.sin(t), ox + r1 * Math.cos(t), oy - r1 * Math.sin(t), isBoard() ? K.sky : '#3D7DB8', big ? 1.8 : 1);
        if (big && a % 30 === 0) T(g, ox + (R1 - 30) * Math.cos(t), oy - (R1 - 30) * Math.sin(t), a, { size: 13, fill: isBoard() ? K.sky : '#3D7DB8' });
      }
    }
    const rc = isBoard() ? K.ink : K.ink;
    line(g, ox, oy, ox + Lr, oy, rc, 3.5);
    const ray = mk('g', null, g);
    line(ray, ox, oy, ox + Lr, oy, K.teal, 3.5);
    const arc = path(g, '', 'none', K.orange, 3);
    const isRight = Math.abs(deg - 90) < 0.01;
    const lg = A(g, 'viz-fade', 1100);
    circle(g, ox, oy, 5, K.ink);
    const setA = a => {
      ray.setAttribute('transform', `rotate(${(-a).toFixed(2)} ${ox} ${oy})`);
      const r = 36, t = a * Math.PI / 180;
      if (isRight && a >= 89.9) { arc.setAttribute('d', `M${ox + 22},${oy} L${ox + 22},${oy - 22} L${ox},${oy - 22}`); return; }
      arc.setAttribute('d', a <= 0.1 ? '' : `M${ox + r},${oy} A${r},${r} 0 ${a > 180 ? 1 : 0} 0 ${(ox + r * Math.cos(t)).toFixed(2)},${(oy - r * Math.sin(t)).toFixed(2)}`);
    };
    setA(0);
    if (reduced()) setA(deg); else whenLive(root, () => later(300, () => tween(1100, t => setA(deg * easeOut(t)))));
    const t = deg * Math.PI / 180;
    const lab = isStr(p.label) ? p.label : '';
    if (lab.length === 3) {
      T(lg, ox + Lr + 14, oy + 16, lab[0], { size: 20 });
      T(lg, ox - 12, oy + 18, lab[1], { size: 20 });
      T(lg, ox + (Lr + 16) * Math.cos(t), oy - (Lr + 16) * Math.sin(t), lab[2], { size: 20 });
    } else if (lab.length === 1) T(lg, ox - 12, oy + 18, lab, { size: 20 });
    if (p.showDeg) T(lg, ox + 60 * Math.cos(t / 2), oy - 60 * Math.sin(t / 2), `${fmt(deg)}°`, { size: 17, fill: isBoard() ? K.orange : edge(K.orange) });
  };

  /* =====================================================================
   * lines — parallel / perpendicular / intersect
   * ===================================================================== */
  R.lines = (p, ctx, root) => {
    const kind = ['parallel', 'perpendicular', 'intersect'].includes(p.kind) ? p.kind : 'parallel';
    const labs = arr(p.labels).length ? p.labels.map(String) : null;
    const W = 440, H = 260;
    const g = svgIn(root, W, H, { aria: LL('Đường thẳng', 'Lines') });
    const L1 = K.teal, L2 = K.orange;
    const seg = (x1, y1, x2, y2, c, dl) => { const pp = path(g, `M${x1},${y1} L${x2},${y2}`, 'none', c, 3.5, { pl: 1, cls: 'viz-draw' }); pp.style.animationDelay = dl + 'ms'; return pp; };
    const lg = A(g, 'viz-fade', 1300);
    const pt = (x, y, s, dx, dy) => { circle(lg, x, y, 5, K.ink); T(lg, x + (dx || 0), y + (dy || -18), s, { size: 20 }); };
    if (kind === 'parallel') {
      seg(30, 96, 410, 70, L1, 0); seg(30, 196, 410, 170, L2, 300);
      const ln = labs || ['A', 'B', 'C', 'D'];
      pt(90, 92, ln[0]); pt(350, 74, ln[1]); pt(90, 192, ln[2], 0, 22); pt(350, 174, ln[3], 0, 22);
      [[220, 83], [220, 183]].forEach(([x, y]) => path(lg, `M${x - 6},${y - 7} L${x + 4},${y - 0.7} L${x - 6},${y + 6}`, 'none', K.ink, 2.4));
    } else if (kind === 'perpendicular') {
      seg(40, 160, 400, 160, L1, 0); seg(220, 20, 220, 240, L2, 300);
      rightMark(lg, [220, 160], [250, 160], [220, 130], 18, K.ink);
      const ln = labs || ['A', 'B', 'C', 'D', 'O'];
      pt(220, 40, ln[0], 18, 0); pt(220, 225, ln[1], 18, 0); pt(60, 160, ln[2], 0, 22); pt(380, 160, ln[3], 0, 22);
      T(lg, 206, 178, ln[4] || 'O', { size: 20 });
    } else {
      seg(40, 200, 400, 60, L1, 0); seg(60, 50, 380, 220, L2, 300);
      const ln = labs || ['A', 'B', 'C', 'D', 'O'];
      // intersection of the two lines
      const x = (() => { const m1 = (60 - 200) / 360, b1 = 200 - m1 * 40, m2 = (220 - 50) / 320, b2 = 50 - m2 * 60; return (b2 - b1) / (m1 - m2); })();
      const y = 200 + (60 - 200) / 360 * (x - 40);
      pt(70, 188, ln[0], 0, 22); pt(370, 72, ln[1]); pt(90, 66, ln[2]); pt(350, 204, ln[3], 0, 22);
      circle(lg, x, y, 5, K.ink); T(lg, x, y - 22, ln[4] || 'O', { size: 20 });
    }
  };

  /* =====================================================================
   * cubes — isometric stack of unit cubes (thể tích)
   * ===================================================================== */
  R.cubes = (p, ctx, root) => {
    const l = int(p.l, 3, 1, 10), w = int(p.w, 2, 1, 10), h = int(p.h, 2, 1, 10);
    const cos = Math.cos(Math.PI / 6), sin = 0.5;
    const s = Math.min(46, 420 / ((l + w) * cos), 270 / ((l + w) * sin + h));
    const ex = [s * cos, s * sin], ey = [-s * cos, s * sin], ez = [0, -s];
    const W = (l + w) * s * cos + 80, H = (l + w) * s * sin + h * s + 60;
    const g = svgIn(root, Math.max(W, 260), H, { aria: LL('Hình lập phương nhỏ', 'Unit cubes') });
    const ox = (Math.max(W, 260) - (l + w) * s * cos) / 2 + w * s * cos, oy = 30 + h * s;
    const P = (i, j, k) => [ox + i * ex[0] + j * ey[0], oy + i * ex[1] + j * ey[1] + k * ez[1]];
    const list = [];
    for (let k = 0; k < h; k++) for (let j = 0; j < w; j++) for (let i = 0; i < l; i++) list.push([i, j, k]);
    list.sort((a1, b1) => (a1[0] + a1[1] + a1[2]) - (b1[0] + b1[1] + b1[2]) || a1[2] - b1[2]);
    const top = isBoard() ? 'rgba(159,216,255,.35)' : '#C9F5EE', lf = isBoard() ? 'rgba(159,216,255,.2)' : K.cyan, rt = isBoard() ? 'rgba(184,240,168,.25)' : K.teal;
    const st = isBoard() ? K.ink : '#0E7F7B';
    const poly = pts => pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + 'Z';
    list.forEach(([i, j, k]) => {
      const ag = A(g, 'viz-drop', 100 + k * 420 + (i + j) * 45);
      const a0 = P(i, j, k + 1), a1 = P(i + 1, j, k + 1), a2 = P(i + 1, j + 1, k + 1), a3 = P(i, j + 1, k + 1);
      const b1 = P(i + 1, j, k), b2 = P(i + 1, j + 1, k), b3 = P(i, j + 1, k);
      path(ag, poly([a0, a1, a2, a3]), top, st, 1.4);
      path(ag, poly([a3, a2, b2, b3]), lf, st, 1.4);
      path(ag, poly([a2, a1, b1, b2]), rt, st, 1.4);
    });
    if (p.showDims) {
      const lg = A(g, 'viz-fade', 800 + h * 420);
      const lc = isBoard() ? K.sun : K.ink;
      const q1 = P(l / 2, w, 0), q2 = P(l, w / 2, 0), q3 = P(l, 0, h / 2);
      T(lg, q1[0] + 14, q1[1] + 20, String(p.l != null && isStr(p.l) ? p.l : l), { size: 18, fill: lc });
      T(lg, q2[0] + 14, q2[1] - 0, '', { size: 18 });
      const qw = P(0, w / 2, 0);
      T(lg, qw[0] - 18, qw[1] + 18, String(w), { size: 18, fill: lc });
      T(lg, q3[0] + 18, q3[1] - 6 + s * 0.4, String(h), { size: 18, fill: lc, anchor: 'start' });
    }
  };

  /* =====================================================================
   * compare — two numbers / piles with a crocodile mouth  (< > =)
   * ===================================================================== */
  function drawCroc(g, cx, cy, sign) {
    const green = isBoard() ? K.leaf : '#5BC85B', dark = isBoard() ? K.leaf : '#3E9E44';
    const fillG = isBoard() ? rgba(K.leaf, 0.25) : green;
    if (sign === '=') {
      rect(g, cx - 34, cy - 20, 68, 14, 7, fillG, dark, 2.5);
      rect(g, cx - 34, cy + 6, 68, 14, 7, fillG, dark, 2.5);
      return;
    }
    const dir = sign === '<' ? -1 : 1;      // mouth opens toward the bigger side: '<' opens right (dir -1 → hinge on the left)
    const hx = cx + dir * 30;               // hinge x
    const ox = cx - dir * 38;               // open end x
    const upper = `M${hx},${cy - 6} L${ox},${cy - 42} L${ox + dir * 10},${cy - 50} L${hx + dir * 14},${cy - 16} Q${hx + dir * 16},${cy - 2} ${hx},${cy - 6} Z`;
    const lower = `M${hx},${cy + 6} L${ox},${cy + 42} L${ox + dir * 10},${cy + 50} L${hx + dir * 14},${cy + 16} Q${hx + dir * 16},${cy + 2} ${hx},${cy + 6} Z`;
    // teeth
    for (let i = 1; i <= 3; i++) {
      const t = i / 4.2, x = hx + (ox - hx) * t, yu = cy - 6 + (-36) * t, yl = cy + 6 + 36 * t;
      path(g, `M${x - 5},${yu + 1} L${x + dir * 2},${yu + 11} L${x + 6},${yu + 3} Z`, isBoard() ? 'none' : '#FFFFFF', isBoard() ? K.ink : '#D9E6EA', 1);
      path(g, `M${x - 5},${yl - 1} L${x + dir * 2},${yl - 11} L${x + 6},${yl - 3} Z`, isBoard() ? 'none' : '#FFFFFF', isBoard() ? K.ink : '#D9E6EA', 1);
    }
    path(g, upper, fillG, dark, 2.5);
    path(g, lower, fillG, dark, 2.5);
    circle(g, hx + dir * 6, cy - 22, 7, isBoard() ? 'none' : '#FFFFFF', dark, 2);
    circle(g, hx + dir * 6 - dir * 1.5, cy - 22, 3, isBoard() ? K.ink : '#1E3A4C');
  }
  /** Value of a number or a tiny expression string like "45 312", "17 + 22", "3 × 4", "2,5". NaN if unknown. */
  function evalSimple(v) {
    if (typeof v === 'number') return v;
    const s = String(v == null ? '' : v).replace(/[\s  ]/g, '').replace(/,/g, '.');
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    const m = s.match(/^(\d+(?:\.\d+)?)([+\-−×x*:\/])(\d+(?:\.\d+)?)$/);
    if (!m) return NaN;
    const a = Number(m[1]), b = Number(m[3]);
    switch (m[2]) { case '+': return a + b; case '-': case '−': return a - b; case '×': case 'x': case '*': return a * b; default: return b ? a / b : NaN; }
  }
  R.compare = (p, ctx, root) => {
    const side = v => {
      if (v && typeof v === 'object' && !Array.isArray(v)) return { kind: 'pile', emoji: String(v.emoji || '🍎'), count: int(v.count, 0, 0, 30), val: int(v.count, 0, 0, 30) };
      if (typeof v === 'number') return { kind: 'num', text: fmt(v), val: v };
      const n = evalSimple(v);
      return { kind: 'num', text: String(v == null ? '?' : v), val: n };
    };
    const L = side(p.left), Rr = side(p.right);
    let sign = p.sign && ['<', '>', '='].includes(p.sign) ? p.sign : null;
    if (!sign && isFinite(L.val) && isFinite(Rr.val)) sign = L.val < Rr.val ? '<' : L.val > Rr.val ? '>' : '=';
    const W = 640, H = 200, g = svgIn(root, W, H, { aria: LL('So sánh', 'Comparing') });
    const drawSide = (s, cx, delay) => {
      const ag = A(g, 'viz-pop', delay);
      if (s.kind === 'pile') {
        const per = 5, cell = 42, rows = Math.max(1, Math.ceil(s.count / per)), cols = Math.max(1, Math.min(per, s.count));
        const bw = cols * cell + 24, bh = rows * cell + 20;
        rect(ag, cx - bw / 2, H / 2 - bh / 2, bw, bh, 18, K.cream, isBoard() ? K.line : '#F1E3C8', 2, isBoard() ? { dash: '6 5' } : null);
        for (let i = 0; i < s.count; i++) E(ag, cx - (cols * cell) / 2 + (i % per) * cell + cell / 2, H / 2 - (rows * cell) / 2 + Math.floor(i / per) * cell + cell / 2, s.emoji, 34);
      } else {
        const fs = Math.min(48, 210 / Math.max(1, s.text.length * 0.56)), bw = Math.min(250, Math.max(130, tw(s.text, fs) + 44));
        if (!isBoard()) rect(ag, cx - bw / 2 + 3, H / 2 - 48 + 5, bw, 96, 22, K.shadow);
        rect(ag, cx - bw / 2, H / 2 - 48, bw, 96, 22, isBoard() ? 'none' : '#FFFFFF', isBoard() ? K.ink : K.teal, 3);
        T(ag, cx, H / 2 + 2, s.text, { size: fs, weight: 800, fill: K.ink });
      }
    };
    drawSide(L, 150, 100);
    drawSide(Rr, 490, 250);
    const mg = A(g, 'viz-pop', 600);
    const show = p.show != null ? !!p.show : (ctx.reveal === true || ctx.mode === 'learn');
    if (show && sign) drawCroc(G(mg, 'translate(320,' + (H / 2) + ') scale(1.3) translate(-320,' + (-H / 2) + ')'), 320, H / 2, sign);
    else {
      circle(mg, 320, H / 2, 36, isBoard() ? 'none' : tint(K.sun, 0.5), isBoard() ? K.sun : mix(K.sun, '#C98A00', 0.3), 3, { dash: '7 5' });
      T(mg, 320, H / 2 + 2, '?', { size: 40, weight: 800, fill: isBoard() ? K.sun : '#B07A00' });
    }
  };

  /* =====================================================================
   * tape — sơ đồ đoạn thẳng
   * ===================================================================== */
  R.tape = (p, ctx, root) => {
    const bars = arr(p.bars).slice(0, 4).map((b, i) => {
      b = b || {};
      const hasUnits = b.units != null && num(b.units, 0) > 0;
      const parts = b.parts != null ? int(b.parts, 1, 1, 30) : (hasUnits ? 0 : 1);
      const units = hasUnits ? num(b.units, 1) : Math.max(parts, 1);
      return { label: b.label != null ? String(b.label) : '', parts, units, value: b.value, color: b.color && K[b.color] ? K[b.color] : (isStr(b.color) && b.color[0] === '#' ? b.color : pal(i === 0 ? 0 : i === 1 ? 1 : i + 1)), shade: int(b.shade, 0, 0, parts), braces: arr(b.braces) };
    });
    if (!bars.length) bars.push({ label: '', parts: 3, units: 3, color: K.teal, shade: 0, braces: [] });
    const n = bars.length;
    const fs = 22;
    const labW = Math.max(30, ...bars.map(b => tw(b.label ? b.label + (/:$/.test(b.label) ? '' : ':') : '', fs))) + 16;
    const totalW = p.total != null ? Math.max(70, tw(label(p.total), fs) + 30) : 16;
    const W = 720, maxU = Math.max(...bars.map(b => b.units));
    const u = Math.min(200, (W - labW - 8 - totalW - 14) / maxU);
    const x0 = Math.max(0, (W - (labW + 8 + maxU * u + totalW + 14)) / 2) + labW + 8;
    const bh = 22, gap = 64;
    const hasTop = bars[0].value != null || bars[0].braces.some(b => b.side !== 'below');
    const hasBot = (n > 1 && bars[n - 1].value != null) || bars[n - 1].braces.some(b => b.side === 'below');
    const top = hasTop ? 56 : 14;
    const H = top + n * bh + (n - 1) * gap + (hasBot ? 56 : 16);
    const g = svgIn(root, W, H, { aria: LL('Sơ đồ đoạn thẳng', 'Bar model') });
    const by = i => top + i * (bh + gap);
    const lc = isBoard() ? K.sun : K.ink;
    const tickC = K.ink;
    bars.forEach((b, i) => {
      const y = by(i), len = b.units * u;
      T(g, x0 - 12, y + bh / 2, b.label ? (/:$/.test(b.label) ? b.label : b.label + ':') : '', { size: fs, anchor: 'end', fill: K.ink });
      const ag = A(g, 'viz-gx', 150 + i * 300);
      rect(ag, x0, y, len, bh, 4, tint(b.color, 0.35), 'none');
      // parts: if units < parts the parts divide the bar evenly, otherwise each part is one unit
      const pw = b.parts && b.units < b.parts ? len / b.parts : u;
      for (let k = 0; k < b.shade; k++) rect(ag, x0 + k * pw, y, pw, bh, 0, solid(b.color));
      rect(ag, x0, y, len, bh, 4, 'none', isBoard() ? b.color : edge(b.color), 2.6);
      for (let k = 1; k <= b.parts; k++) {
        const x = x0 + k * pw;
        if (x < x0 + len - 0.5) line(ag, x, y - 5, x, y + bh + 5, tickC, 2.4);
      }
      line(ag, x0, y - 8, x0, y + bh + 8, tickC, 3);
      line(ag, x0 + len, y - 8, x0 + len, y + bh + 8, tickC, 3);
    });
    const lg = A(g, 'viz-fade', 250 + n * 300);
    const braceLbl = (x1, x2, y, dir, txt) => {
      const tip = hBrace(lg, x1 + 2, x2 - 2, y, dir, lc);
      T(lg, (x1 + x2) / 2, tip + dir * 14, label(txt), { size: fs, fill: lc });
    };
    bars.forEach((b, i) => {
      const y = by(i), len = b.units * u;
      const dir = i === 0 ? -1 : (i === n - 1 ? 1 : -1);
      if (b.value != null) braceLbl(x0, x0 + len, dir < 0 ? y - 8 : y + bh + 8, dir, b.value);
      b.braces.forEach(br => {
        const d2 = br.side === 'below' ? 1 : -1;
        const f = num(br.from, 0), t = num(br.to, 1);
        braceLbl(x0 + f * u, x0 + t * u, d2 < 0 ? y - 8 : y + bh + 8, d2, br.label != null ? br.label : '?');
      });
    });
    if (p.diff != null && n >= 2) {
      const a0 = bars[0].units, a1 = bars[1].units;
      if (Math.abs(a0 - a1) > 1e-9) {
        const longI = a0 > a1 ? 0 : 1, shortU = Math.min(a0, a1), longU = Math.max(a0, a1);
        const xs = x0 + shortU * u, xl = x0 + longU * u;
        const ys = by(1 - longI), yl = by(longI);
        line(lg, xs, ys + (longI === 0 ? 0 : bh), xs, yl + (longI === 0 ? bh : 0), tickC, 2, { dash: '5 5' });
        const dir = longI === 0 ? 1 : -1;
        braceLbl(xs, xl, dir > 0 ? yl + bh + 8 : yl - 8, dir, p.diff);
      }
    }
    if (p.total != null) {
      const xr = x0 + maxU * u + 12;
      const tip = vBrace(lg, xr, by(0) - 4, by(n - 1) + bh + 4, 1, lc, 9);
      T(lg, tip + 8, (by(0) + by(n - 1) + bh) / 2, label(p.total), { size: fs, fill: lc, anchor: 'start' });
    }
  };

  /* =====================================================================
   * barChart
   * ===================================================================== */
  R.barChart = (p, ctx, root) => {
    const labels = arr(p.labels).map(String), values = arr(p.values).map(v => Math.max(0, num(v, 0)));
    const n = Math.max(1, Math.min(12, values.length));
    const W = 640, title = p.title ? 36 : 6, H = 300 + title;
    const g = svgIn(root, W, H, { aria: LL('Biểu đồ cột', 'Bar chart') });
    if (p.title) T(g, W / 2, 20, String(p.title), { size: 22, fill: K.ink });
    const x0 = 70, x1 = W - 20, y0 = title + 26, y1 = H - 46;
    const mx = Math.max(1, ...values);
    const st = niceStep(mx, 5), top = Math.ceil(mx / st) * st;
    const Y = v => y1 - (v / top) * (y1 - y0);
    for (let v = 0; v <= top + 1e-9; v = r6(v + st)) {
      line(g, x0, Y(v), x1, Y(v), v === 0 ? K.ink : K.line, v === 0 ? 2.5 : 1.2, v === 0 ? null : { dash: '5 5' });
      T(g, x0 - 10, Y(v), fmt(v), { size: 17, anchor: 'end', fill: K.sub });
    }
    line(g, x0, y0 - 10, x0, y1, K.ink, 2.5);
    if (p.unit) T(g, x0 - 6, y0 - 18, `(${p.unit})`, { size: 14, anchor: 'end', fill: K.sub });
    const slot = (x1 - x0) / n, bw = Math.min(70, slot * 0.58);
    values.slice(0, n).forEach((v, i) => {
      const cx = x0 + slot * i + slot / 2, col = pal(i);
      const ag = A(g, 'viz-gy', 150 + i * 140);
      const y = Y(v), r = Math.min(10, bw / 2, (y1 - y) / 2);
      path(ag, `M${cx - bw / 2},${y1} L${cx - bw / 2},${y + r} Q${cx - bw / 2},${y} ${cx - bw / 2 + r},${y} L${cx + bw / 2 - r},${y} Q${cx + bw / 2},${y} ${cx + bw / 2},${y + r} L${cx + bw / 2},${y1} Z`, solid(col), isBoard() ? col : 'none', 2.5);
      if (p.showValues !== false) { const vg = A(g, 'viz-fade', 800 + i * 140); T(vg, cx, y - 15, fmt(v), { size: 20, fill: K.ink }); }
      const lab = labels[i] || '';
      if (lab.length > 10 && lab.includes(' ')) {
        const w = lab.split(' '), h1 = w.slice(0, Math.ceil(w.length / 2)).join(' '), h2 = w.slice(Math.ceil(w.length / 2)).join(' ');
        T(g, cx, y1 + 17, h1, { size: 17, fill: K.ink }); T(g, cx, y1 + 37, h2, { size: 17, fill: K.ink });
      } else T(g, cx, y1 + 22, lab, { size: 19, fill: K.ink });
    });
  };

  /* =====================================================================
   * pictograph — count = real quantity; each icon stands for `each`
   * ===================================================================== */
  R.pictograph = (p, ctx, root) => {
    const rows = arr(p.rows).slice(0, 8).map(r => ({ label: String((r && r.label) || ''), count: Math.max(0, num(r && r.count, 0)) }));
    const emoji = String(p.emoji || '⭐'), each = Math.max(0.0001, num(p.each, 1));
    const icons = rows.map(r => r.count / each);
    const maxI = Math.max(1, ...icons.map(Math.ceil));
    const labW = Math.max(60, ...rows.map(r => tw(r.label, 18))) + 24;
    const isz = Math.min(42, (660 - labW) / maxI);
    const rh = Math.max(46, isz + 8), legend = each !== 1 || p.unit ? 40 : 6;
    const W = labW + maxI * isz + 30, H = rows.length * rh + legend + 10;
    const g = svgIn(root, Math.max(W, 360), H, { aria: LL('Biểu đồ tranh', 'Pictogram') });
    rows.forEach((r, i) => {
      const y = 6 + i * rh;
      rect(g, 4, y + 2, Math.max(W, 360) - 8, rh - 4, 12, i % 2 ? 'none' : K.cream);
      T(g, labW - 14, y + rh / 2, r.label, { size: 18, anchor: 'end', fill: K.ink });
      const full = Math.floor(icons[i] + 1e-9), frac = icons[i] - full;
      for (let k = 0; k < full + (frac > 0.01 ? 1 : 0); k++) {
        const ag = A(g, 'viz-pop', 100 + i * 160 + k * 60);
        const x = labW + k * isz + isz / 2, cy = y + rh / 2;
        if (k === full) {
          const cid = uid('half');
          rect(mk('clipPath', { id: cid }, mk('defs', null, ag)), x - isz / 2, cy - isz / 2, isz * frac, isz);
          const hg = mk('g', { 'clip-path': `url(#${cid})` }, ag);
          E(hg, x, cy, emoji, isz * 0.8);
        } else E(ag, x, cy, emoji, isz * 0.8);
      }
    });
    line(g, labW - 4, 6, labW - 4, 6 + rows.length * rh, K.line, 2);
    if (legend > 6) {
      const y = H - 22;
      E(g, 30, y, emoji, 26);
      T(g, 50, y, `= ${fmt(each)}${p.unit ? ' ' + p.unit : ''}`, { size: 18, anchor: 'start', fill: K.ink });
    }
  };

  /* =====================================================================
   * pieChart
   * ===================================================================== */
  R.pieChart = (p, ctx, root) => {
    const labels = arr(p.labels).map(String), per = arr(p.percents).map(v => Math.max(0, num(v, 0)));
    const n = Math.min(8, per.length);
    const W = 620, H = 300, cx = 150, cy = 150, r = 128;
    const g = svgIn(root, W, H, { aria: LL('Biểu đồ hình quạt', 'Pie chart') });
    if (!isBoard()) circle(g, cx, cy + 5, r, K.shadow);
    const tot = per.slice(0, n).reduce((s, v) => s + v, 0) || 1;
    const secs = [];
    for (let i = 0; i < n; i++) secs.push(path(g, '', solid(pal(i)), isBoard() ? pal(i) : '#FFFFFF', 3));
    const labG = A(g, 'viz-fade', 1300);
    let acc = 0;
    const ang = per.slice(0, n).map(v => { const a0 = acc; acc += (v / tot) * 360; return [a0, acc]; });
    ang.forEach(([a0, a1], i) => {
      if (per[i] / tot >= 0.07) { const m = polar(cx, cy, r * 0.64, (a0 + a1) / 2); T(labG, m.x, m.y, `${fmt(per[i])}%`, { size: 18, fill: onSolid(), weight: 800 }); }
      const ly = 44 + i * 40;
      const ag = A(g, 'viz-rise', 200 + i * 120);
      rect(ag, 320, ly - 11, 22, 22, 6, solid(pal(i)), isBoard() ? pal(i) : 'none', 2);
      T(ag, 354, ly, `${labels[i] || ''}: ${fmt(per[i])}%`, { size: 20, anchor: 'start', fill: K.ink });
    });
    const set = t => ang.forEach(([a0, a1], i) => secs[i].setAttribute('d', a1 * t - a0 * t > 0.05 ? sectorPath(cx, cy, r, a0 * t, a1 * t) : ''));
    set(0);
    if (reduced()) set(1); else whenLive(root, () => later(200, () => tween(1100, t => set(easeOut(t)))));
  };

  /* =====================================================================
   * dataTable — HTML table
   * ===================================================================== */
  R.dataTable = (p, ctx, root) => {
    const t = document.createElement('table');
    t.className = 'viz-table';
    const cell = v => (typeof v === 'number' ? fmt(v) : String(v == null ? '' : v));
    const headers = arr(p.headers);
    if (headers.length) {
      const tr = document.createElement('tr');
      headers.forEach(h => { const th = document.createElement('th'); th.textContent = cell(h); tr.appendChild(th); });
      t.appendChild(tr);
    }
    arr(p.rows).slice(0, 30).forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.className = 'viz-rise';
      tr.style.animationDelay = (100 + i * 90) + 'ms';
      arr(r).forEach(v => { const td = document.createElement('td'); td.textContent = cell(v); tr.appendChild(td); });
      t.appendChild(tr);
    });
    root.style.overflowX = 'auto';
    root.appendChild(t);
  };

  /* =====================================================================
   * chance — a box of balls
   * ===================================================================== */
  const COLOR_NAMES = { red: 'berry', 'đỏ': 'berry', blue: 'sky', xanh: 'sky', 'xanh dương': 'sky', green: 'leaf', 'xanh lá': 'leaf', yellow: 'sun', 'vàng': 'sun', orange: 'orange', cam: 'orange', purple: 'purple', 'tím': 'purple', pink: 'berry', 'hồng': 'berry', teal: 'teal' };
  function colorOf(c) {
    if (!c) return K.teal;
    const s = String(c).toLowerCase();
    if (K[s]) return K[s];
    if (COLOR_NAMES[s]) return K[COLOR_NAMES[s]];
    if (s === 'white' || s === 'trắng') return isBoard() ? '#F4F7F2' : '#FFFFFF';
    if (s === 'black' || s === 'đen') return isBoard() ? '#C9D6DE' : '#33475B';
    if (s[0] === '#') return s;
    return K.teal;
  }
  R.chance = (p, ctx, root) => {
    const items = arr(p.items).slice(0, 6).map(it => ({ color: colorOf(it && it.color), count: int(it && it.count, 0, 0, 30) }));
    const balls = [];
    items.forEach(it => { for (let i = 0; i < it.count; i++) balls.push(it.color); });
    const rng = seeded(balls.length * 31 + items.length * 7 + 3);
    for (let i = balls.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [balls[i], balls[j]] = [balls[j], balls[i]]; }
    const W = 420, H = 300;
    const g = svgIn(root, W, H, { aria: LL('Hộp bóng', 'Box of balls') });
    const bx = 70, bw = 280, byTop = 70, byBot = 280;
    if (!isBoard()) rect(g, bx + 4, byTop + 6, bw, byBot - byTop, 22, K.shadow);
    rect(g, bx, byTop, bw, byBot - byTop, 22, isBoard() ? 'rgba(244,247,242,.05)' : '#F2FAFD', isBoard() ? K.ink : '#9FC7D6', 3.5);
    const r = balls.length > 20 ? 16 : balls.length > 10 ? 21 : 26, per = Math.floor((bw - 20) / (2 * r + 2));
    balls.forEach((c, i) => {
      const row = Math.floor(i / per), col = i % per;
      const inRow = Math.min(per, balls.length - row * per);
      const x = bx + bw / 2 - (inRow * (2 * r + 2)) / 2 + col * (2 * r + 2) + r + 1 + (row % 2 ? r * 0.3 : 0) + (rng() - 0.5) * 3;
      const y = byBot - 12 - r - row * (2 * r - 3);
      const ag = A(g, 'viz-drop', 150 + i * 80);
      circle(ag, x, y, r, solid(c), isBoard() ? c : edge(c), 2);
      circle(ag, x - r * 0.35, y - r * 0.35, r * 0.28, '#FFFFFF', null, 0, { opacity: isBoard() ? 0.3 : 0.6 });
    });
    // lid opening
    rect(g, bx - 10, byTop - 14, bw + 20, 18, 9, isBoard() ? 'none' : mix(K.teal, '#FFFFFF', 0.3), isBoard() ? K.ink : 'none', 2.5);
    rect(g, bx + 8, byTop + 10, 12, byBot - byTop - 30, 6, '#FFFFFF', null, 0, { opacity: isBoard() ? 0.08 : 0.5 });
  };

  /* =====================================================================
   * average — towers level out to the mean
   * ===================================================================== */
  R.average = (p, ctx, root) => {
    const vals = arr(p.values).slice(0, 8).map(v => Math.max(0, num(v, 0)));
    if (!vals.length) vals.push(2, 4, 6);
    const n = vals.length, sum = vals.reduce((s, v) => s + v, 0), mean = sum / n;
    const labels = arr(p.labels).map(String);
    const blockMode = vals.every(v => Number.isInteger(v) && v <= 15);
    const W = Math.max(380, n * 90 + 80), H = 320;
    const g = svgIn(root, W, H, { aria: LL('Trung bình cộng', 'Average') });
    const base = H - 44, x0 = (W - n * 90) / 2 + 45;
    line(g, x0 - 50, base, x0 + (n - 1) * 90 + 50, base, K.ink, 3);
    labels.forEach((l, i) => i < n && T(g, x0 + i * 90, base + 22, l, { size: 16, fill: K.sub }));
    const mx = Math.max(1, ...vals);
    const doLevel = p.level !== false;
    const meanLine = mk('g', { opacity: 0 }, g);
    meanLine.style.transition = 'opacity .6s';
    if (blockMode) {
      const bs = Math.min(34, (base - 40) / mx);
      const towers = vals.map(() => []);
      vals.forEach((v, i) => {
        for (let k = 0; k < v; k++) {
          const b = mk('g', null, g);
          rect(b, -bs * 0.45, -bs + 2, bs * 0.9, bs - 3, 6, solid(pal(i)), isBoard() ? pal(i) : edge(pal(i)), 1.8);
          setXY(b, x0 + i * 90, base - k * bs);
          b.style.opacity = 0;
          b.style.transition = 'opacity .3s';
          setTimeout(() => { b.style.opacity = 1; }, reduced() ? 0 : 100 + i * 120 + k * 50);
          towers[i].push(b);
        }
      });
      const my = base - mean * bs;
      line(meanLine, x0 - 50, my, x0 + (n - 1) * 90 + 50, my, K.orange, 2.5, { dash: '8 6' });
      if (p.showMean) T(meanLine, x0 + (n - 1) * 90 + 52, my - 14, LL(`TB: ${fmt(r6(mean))}`, `Average: ${fmt(r6(mean))}`), { size: 16, anchor: 'end', fill: K.orange });
      // moves: tallest → shortest until levelled (diff ≤ 1)
      const h = vals.slice(), moves = [];
      for (let guard = 0; guard < 80; guard++) {
        let hi = 0, lo = 0;
        h.forEach((v, i) => { if (v > h[hi]) hi = i; if (v < h[lo]) lo = i; });
        if (h[hi] - h[lo] <= 1) break;
        moves.push([hi, lo, h[hi] - 1, h[lo]]); h[hi]--; h[lo]++;
      }
      const run = () => {
        const per = clamp(4200 / Math.max(1, moves.length), 380, 700);
        const steps = moves.map(([from, to, kFrom, kTo]) => next => {
          const b = towers[from].pop(); towers[to].push(b);
          const ax = x0 + from * 90, ay = base - kFrom * bs, bx2 = x0 + to * 90, by2 = base - kTo * bs, lift = Math.min(ay, by2) - 40;
          tween(per, t => {
            const e = ease(t);
            const x = ax + (bx2 - ax) * e;
            const y = (1 - e) * (1 - e) * ay + 2 * (1 - e) * e * lift + e * e * by2;
            setXY(b, x, y);
          }, () => setTimeout(next, 60));
        });
        steps.push(next => { meanLine.setAttribute('opacity', 1); next(); });
        chain(steps);
      };
      if (!doLevel) meanLine.setAttribute('opacity', p.showMean ? 1 : 0);
      else if (reduced()) {
        moves.forEach(([from, to, kFrom, kTo]) => { const b = towers[from].pop(); towers[to].push(b); setXY(b, x0 + to * 90, base - kTo * bs); });
        meanLine.setAttribute('opacity', 1);
      } else whenLive(root, () => later(1100 + sum * 30, run));
    } else {
      const sc = (base - 50) / mx, bw = 56;
      const bars = vals.map((v, i) => {
        const r = rect(g, x0 + i * 90 - bw / 2, base - v * sc, bw, v * sc, 8, solid(pal(i)), isBoard() ? pal(i) : 'none', 2);
        const t = T(g, x0 + i * 90, base - v * sc - 14, fmt(v), { size: 16, fill: K.ink });
        return { r, t, v };
      });
      const my = base - mean * sc;
      line(meanLine, x0 - 50, my, x0 + (n - 1) * 90 + 50, my, K.orange, 2.5, { dash: '8 6' });
      if (p.showMean) T(meanLine, x0 + (n - 1) * 90 + 52, my - 14, LL(`TB: ${fmt(r6(mean))}`, `Average: ${fmt(r6(mean))}`), { size: 16, anchor: 'end', fill: K.orange });
      const set = e => bars.forEach(b => { const v = b.v + (mean - b.v) * e; b.r.setAttribute('y', base - v * sc); b.r.setAttribute('height', v * sc); b.t.setAttribute('y', base - v * sc - 14); b.t.setAttribute('opacity', 1 - e); });
      if (!doLevel) meanLine.setAttribute('opacity', p.showMean ? 1 : 0);
      else if (reduced()) { set(1); meanLine.setAttribute('opacity', 1); }
      else whenLive(root, () => later(1300, () => tween(1600, t => set(ease(t)), () => meanLine.setAttribute('opacity', 1))));
    }
  };

  /* =====================================================================
   * decimalGrid / percent — 10×10 grids
   * ===================================================================== */
  function hundredGrid(g, x0, y0, cs, count, col, cells) {
    for (let c = 0; c < 10; c++) for (let r = 0; r < 10; r++) {
      const k = c * 10 + r;    // column-major: whole columns are tenths
      const on = k < count;
      const el = rect(g, x0 + c * cs, y0 + r * cs, cs, cs, 0, on ? solid(col) : (isBoard() ? 'rgba(244,247,242,.03)' : '#FFFFFF'), K.line, 1.2);
      if (cells) cells[k] = el;
    }
    rect(g, x0, y0, 10 * cs, 10 * cs, 3, 'none', isBoard() ? K.ink : K.ink, 2.6);
  }
  R.decimalGrid = (p, ctx, root) => {
    const inter = !!ctx.interactive;
    const total = int(Math.round(num(p.value, 0) * 100), 0, 0, inter ? 100 : 300);
    const ng = inter ? 1 : Math.max(1, Math.ceil(total / 100));
    const cs = 29, gw = 10 * cs;
    const W = ng * gw + (ng - 1) * 24 + 24, H = gw + (p.showLabel ? 50 : 20);
    const g = svgIn(root, Math.max(W, 320), H, { aria: LL('Lưới 100 ô', 'Hundred square') });
    const x0 = (Math.max(W, 320) - (ng * gw + (ng - 1) * 24)) / 2;
    const col = p.color && K[p.color] ? K[p.color] : K.sky;
    const cells = [];
    for (let i = 0; i < ng; i++) {
      const ag = A(g, 'viz-pop', 100 + i * 200);
      hundredGrid(ag, x0 + i * (gw + 24), 10, cs, clamp(total - i * 100, 0, 100), col, inter ? cells : null);
    }
    if (p.showLabel) T(g, Math.max(W, 320) / 2, gw + 34, fmt(total / 100), { size: 22, fill: K.ink });
    if (inter) {
      const on = cells.map((_, k) => k < total);
      const paint = (k, v) => {
        if (k < 0 || k > 99 || on[k] === v) return false;
        on[k] = v;
        cells[k].setAttribute('fill', v ? solid(col) : (isBoard() ? 'rgba(244,247,242,.03)' : '#FFFFFF'));
        return true;
      };
      const hit = rect(g, x0, 10, gw, gw, 0, 'transparent', null, 0, { cls: 'viz-touch' });
      let mode = null;
      let last = null;
      const cellAt = pt => { const c = Math.floor((pt.x - x0) / cs), r = Math.floor((pt.y - 10) / cs); return c < 0 || c > 9 || r < 0 || r > 9 ? -1 : c * 10 + r; };
      const at = e => { last = svgPt(root._svg, e); return cellAt(last); };
      hit.addEventListener('pointerdown', e => {
        e.preventDefault();
        const k = at(e); if (k < 0) return;
        mode = !on[k];
        try { hit.setPointerCapture(e.pointerId); } catch (er) { /* */ }
        if (paint(k, mode)) emit(ctx, root, on.filter(Boolean).length);
      });
      hit.addEventListener('pointermove', e => {
        if (mode == null) return;
        const a = last || svgPt(root._svg, e), b = svgPt(root._svg, e);
        last = b;
        const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (cs / 3)));
        let ch = false;
        for (let i = 1; i <= n; i++) { const k = cellAt({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n }); if (k >= 0 && paint(k, mode)) ch = true; }
        if (ch) emit(ctx, root, on.filter(Boolean).length);
      });
      const up = () => { mode = null; };
      hit.addEventListener('pointerup', up); hit.addEventListener('pointercancel', up);
      root.getValue = () => on.filter(Boolean).length;
    }
  };
  R.percent = (p, ctx, root) => {
    const pc = int(p.percent, 0, 0, 100);
    const cs = 29, gw = 10 * cs, W = gw + 40, H = gw + (p.showLabel ? 50 : 20);
    const g = svgIn(root, Math.max(W, 320), H, { aria: LL('Phần trăm', 'Percentage') });
    const ag = A(g, 'viz-pop', 100);
    hundredGrid(ag, (Math.max(W, 320) - gw) / 2, 10, cs, pc, p.color && K[p.color] ? K[p.color] : K.orange);
    if (p.showLabel) T(g, Math.max(W, 320) / 2, gw + 34, `${pc}%`, { size: 24, fill: K.ink });
  };

  /* =====================================================================
   * motion — road with a moving vehicle
   * ===================================================================== */
  R.motion = (p, ctx, root) => {
    const unit0 = isStr(p.unit) && p.unit.includes('/') ? p.unit : 'km/giờ';
    // English: Vietnamese time words in the unit become symbols (km/giờ → km/h, m/phút → m/min, m/giây → m/s)
    const unit = isEN() ? unit0.replace(/giờ/g, 'h').replace(/phút/g, 'min').replace(/giây/g, 's') : unit0;
    const [du, tu] = unit.split('/');
    const veh = ['car', 'bike', 'boat', 'walk'].includes(p.vehicle) ? p.vehicle : 'car';
    const emo = { car: '🚗', bike: '🚲', boat: '⛵', walk: '🚶' }[veh];
    const flip = veh === 'car' || veh === 'walk';
    const time = num(p.time, NaN);
    const W = 600, H = 250, ax = 46, bxp = 554, ry = 150;
    const g = svgIn(root, W, H, { aria: LL('Chuyển động', 'Motion') });
    if (veh === 'boat') {
      rect(g, 20, ry - 4, W - 40, 44, 22, isBoard() ? 'rgba(159,216,255,.15)' : '#BFE3FF', isBoard() ? K.sky : 'none', 2);
      for (let x = 50; x < W - 40; x += 60) path(g, `M${x},${ry + 18} q 10,-7 20,0 t 20,0`, 'none', isBoard() ? K.sky : '#FFFFFF', 2, { opacity: 0.8 });
    } else {
      rect(g, 20, ry - 4, W - 40, 44, 22, isBoard() ? 'rgba(244,247,242,.06)' : (veh === 'walk' ? '#E9D9B8' : '#5B6B75'), isBoard() ? K.ink : 'none', 2);
      line(g, 40, ry + 18, W - 40, ry + 18, isBoard() ? K.line : '#FFFFFF', 3, { dash: '18 14' });
    }
    // flags A, B
    [[ax, 'A'], [bxp, 'B']].forEach(([x, s]) => {
      line(g, x, ry - 4, x, ry - 58, K.ink, 3);
      path(g, `M${x},${ry - 58} L${x + 26},${ry - 50} L${x},${ry - 42} Z`, s === 'A' ? K.orange : K.leaf, isBoard() ? 'none' : 'none');
      T(g, x, ry + 62, s, { size: 22, fill: K.ink });
    });
    const lc = isBoard() ? K.sun : K.ink;
    if (isFinite(time) && time > 0 && time <= 12) {
      const full = Math.floor(time + 1e-9), seg = (bxp - ax) / time;
      for (let i = 1; i <= full; i++) {
        const x = ax + i * seg;
        if (i < time - 1e-9) line(g, x, ry - 10, x, ry + 46, K.ink, 2.4);
        T(g, x - seg / 2, ry + 62, `1 ${tu}`, { size: 18, fill: K.sub });
      }
      if (time - full > 1e-9) T(g, ax + full * seg + (time - full) * seg / 2, ry + 62, `${fmt(r6(time - full))} ${tu}`, { size: 18, fill: K.sub });
    }
    const dLab = p.distance != null ? label(p.distance, isStr(p.distance) ? '' : du) : null;
    if (dLab) { const tip = hBrace(g, ax, bxp, ry - 70, -1, lc); T(g, (ax + bxp) / 2, tip - 14, dLab, { size: 22, fill: lc }); }
    const vtxt = p.speed != null ? `${label(p.speed)} ${isStr(p.speed) ? '' : unit}`.trim() : '';
    const tg = A(g, 'viz-fade', 300);
    if (vtxt) {
      const w = tw('v = ' + vtxt, 20) + 24;
      rect(tg, 14, 8, w, 34, 17, isBoard() ? 'none' : tint(K.sky, 0.3), isBoard() ? K.sky : 'none', 2);
      T(tg, 14 + w / 2, 25, 'v = ' + vtxt, { size: 20, fill: K.ink });
    }
    if (isFinite(time)) T(tg, W - 14, 25, `t = ${fmt(time)} ${tu}`, { size: 20, anchor: 'end', fill: K.ink });
    const trail = line(g, ax, ry + 18, ax, ry + 18, K.orange, 5);
    const car = mk('g', null, g);
    const ce = E(car, 0, 0, emo, 54);
    if (flip) ce.setAttribute('transform', 'scale(-1,1)');
    const yv = veh === 'boat' ? ry - 2 : ry + 2;
    const place = x => { setXY(car, x, yv); trail.setAttribute('x2', x); };
    place(ax);
    if (reduced()) place(bxp); else whenLive(root, () => later(600, () => tween(3000, t => place(ax + (bxp - ax) * ease(t)))));
  };

  /* =====================================================================
   * mapScale — little map with scale legend
   * ===================================================================== */
  R.mapScale = (p, ctx, root) => {
    const sc = int(p.scale, 1000, 1, 1e9), cm = clamp(num(p.mapCm, 5), 0.5, 20);
    const W = 640, H = 250;
    const g = svgIn(root, W, H, { aria: LL('Bản đồ tỉ lệ', 'Scale map') });
    rect(g, 10, 10, W - 20, H - 20, 20, isBoard() ? 'rgba(244,247,242,.04)' : '#FBF4E2', isBoard() ? K.ink : '#E8D9B0', 2.5);
    mk('ellipse', { cx: 520, cy: 62, rx: 80, ry: 30, fill: isBoard() ? 'rgba(184,240,168,.15)' : '#CDEBC0' }, g);
    mk('ellipse', { cx: 520, cy: 190, rx: 90, ry: 30, fill: isBoard() ? 'rgba(184,240,168,.15)' : '#CDEBC0' }, g);
    path(g, 'M70,12 C40,80 110,150 64,238', 'none', isBoard() ? 'rgba(159,216,255,.5)' : '#A9D6FF', 16);
    E(g, 500, 58, '🌳', 26); E(g, 540, 66, '🌳', 22); E(g, 470, 186, '🌳', 24);
    const ppc = Math.min(60, 460 / cm), x1 = (W - cm * ppc) / 2, x2 = x1 + cm * ppc, y = 128;
    E(g, x1, y - 36, '🏠', 42); E(g, x2, y - 36, '🏫', 42);
    const ag = A(g, 'viz-fade', 300);
    line(ag, x1, y, x2, y, K.orange, 4);
    for (let i = 0; i <= Math.floor(cm + 1e-9); i++) line(ag, x1 + i * ppc, y - 7, x1 + i * ppc, y + 7, K.ink, 2);
    line(ag, x2, y - 9, x2, y + 9, K.ink, 2.5);
    T(ag, (x1 + x2) / 2, y + 26, `${fmt(cm)} cm`, { size: 22, fill: isBoard() ? K.sun : K.ink });
    const txt = LL(`Tỉ lệ 1 : ${fmt(sc)}`, `Scale 1 : ${fmt(sc)}`), w = tw(txt, 21) + 28;
    rect(g, W - 24 - w, H - 64, w, 40, 12, isBoard() ? 'none' : '#FFFFFF', K.ink, 2);
    T(g, W - 24 - w / 2, H - 44, txt, { size: 21, fill: K.ink });
    if (p.real != null) T(g, 30, H - 44, LL(`Thực tế: ${label(p.real)}`, `In real life: ${label(p.real)}`), { size: 21, anchor: 'start', fill: K.ink });
  };

  /* =====================================================================
   * roman — numerals built from sticks (que tính)
   * ===================================================================== */
  function toRoman(n) {
    const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = '';
    map.forEach(([v, r]) => { while (n >= v) { s += r; n -= v; } });
    return s;
  }
  R.roman = (p, ctx, root) => {
    const v = int(p.value, 1, 1, 3999), rs = toRoman(v);
    const SW = { I: 34, V: 66, X: 70, L: 56 };
    const Hs = 110;
    const widths = rs.split('').map(c => SW[c] || 60);
    const totW = widths.reduce((s, w) => s + w, 0) + 14 * (rs.length - 1);
    const W = Math.max(260, totW + 60), H = Hs + 40 + (p.showValue || p.showText ? 40 : 0);
    const g = svgIn(root, W, H, { aria: LL('Số La Mã', 'Roman numerals') });
    const stickC = isBoard() ? K.orange : K.orange, headC = isBoard() ? K.sun : K.berry;
    let x = (W - totW) / 2, k = 0;
    const stick = (gp, x1, y1, x2, y2) => {
      line(gp, x1, y1, x2, y2, isBoard() ? 'rgba(0,0,0,0)' : mix(stickC, '#1E3A4C', 0.3), 12);
      line(gp, x1, y1, x2, y2, isBoard() ? stickC : stickC, 9);
      circle(gp, x1, y1, 6, headC);
    };
    const top = 20, bot = top + Hs;
    rs.split('').forEach((c, i) => {
      const w = widths[i];
      const ag = A(g, 'viz-drop', 150 + k++ * 180);
      if (c === 'I') stick(ag, x + w / 2, top, x + w / 2, bot);
      else if (c === 'V') { stick(ag, x + 4, top, x + w / 2, bot); stick(ag, x + w - 4, top, x + w / 2, bot); }
      else if (c === 'X') { stick(ag, x + 4, top, x + w - 4, bot); stick(ag, x + w - 4, top, x + 4, bot); }
      else if (c === 'L') { stick(ag, x + 8, top, x + 8, bot); stick(ag, x + w, bot, x + 8, bot); }
      else T(ag, x + w / 2, (top + bot) / 2, c, { size: 90, weight: 800, fill: stickC });
      x += w + 14;
    });
    const parts = [];
    if (p.showText) parts.push(rs);
    if (p.showValue) parts.push(`= ${v}`);
    if (parts.length) { const lg = A(g, 'viz-fade', 400 + k * 180); T(lg, W / 2, bot + 34, parts.join(' '), { size: 26, fill: K.ink }); }
  };

  /*__MORE_TYPES__*/

  /* =====================================================================
   * public API
   * ===================================================================== */
  function render(type, params, ctx) {
    ctx = ctx && typeof ctx === 'object' ? ctx : {};
    const board = ctx.theme === 'board';
    try { injectCss(); } catch (e) { /* no document head */ }
    const fn = Object.prototype.hasOwnProperty.call(R, type) ? R[type] : null;
    if (!fn) return placeholder(LL('Hình minh hoạ', 'Picture'), board);
    const prevK = K;
    K = board && type !== 'mascot' ? BOARD : LIGHT;
    try {
      const root = document.createElement('div');
      root.className = `viz viz-${type} viz-${sizeOf(ctx)}` + (board && type !== 'mascot' ? ' viz-board' : '');
      root._chalk = ctx.chalk;
      fn(params && typeof params === 'object' ? params : {}, ctx, root);
      return root;
    } catch (e) {
      if (window.console) console.warn('[V] render failed:', type, params, e);
      return placeholder(LL('Hình minh hoạ', 'Picture'), board);
    } finally {
      K = prevK;
    }
  }

  window.V = { render, types: Object.keys(R) };
})();
