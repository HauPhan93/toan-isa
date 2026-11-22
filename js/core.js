/* Toán ISA — app shell: state, screens, lesson player (chalkboard), keypad, speech, sounds. */
(function () {
  'use strict';

  const APP = document.getElementById('app');
  const QUESTIONS_PER_LESSON = 10;
  const STORE_KEY = 'toanisa.v1';
  const APP_VERSION = 'v45';   // keep in step with VERSION in sw.js; shown in Góc phụ huynh

  const GRADE_INFO = {
    1: { color: '#F0A500', icon: '🐣', desc: 'Số đến 100 · Cộng, trừ trong phạm vi 10 · Hình, giờ, lịch' },
    2: { color: '#3FB54A', icon: '🌱', desc: 'Số đến 1000 · Phép nhân, phép chia đầu tiên · Đồng hồ, tiền' },
    3: { color: '#3A8EF0', icon: '🚀', desc: 'Số đến 100 000 · Bảng nhân chia · Chu vi, diện tích' },
    4: { color: '#8A63F0', icon: '🦄', desc: 'Số lớp triệu · Phân số · Góc, đường thẳng' },
    5: { color: '#F2547D', icon: '🌏', desc: 'Số thập phân · Tỉ số phần trăm · Hình khối, vận tốc' },
  };

  // The blank in a prompt: "??", "…", "...", "__", or a lone "?" right after "=". The last form needs a regex
  // lookbehind, which Safari before 16.4 (iOS 15: iPhone 6s, 7) cannot even parse — a literal would stop the
  // whole app from loading there, so it is built at run time with a plain fallback.
  let BLANK_RE, BLANK_RE1;
  try { BLANK_RE = new RegExp('\\?\\?+|…|\\.\\.\\.|_{2,}|(?<==\\s*)\\?(?!\\?)', 'g'); BLANK_RE1 = new RegExp(BLANK_RE.source); }
  catch (e) { BLANK_RE = /\?\?+|…|\.\.\.|_{2,}/g; BLANK_RE1 = /\?\?+|…|\.\.\.|_{2,}/; }

  /* ------------------------------------------------------------------ state */
  const defaults = () => ({
    name: '', grade: null, coins: 0,
    stars: {}, best: {}, plays: {},
    daily: { date: '', count: 0, goal: 20 },
    exams: {},
    seen: {},      // per grade: questions and kinds of question already met in papers (see rememberPaper)
    totals: { answered: 0, correct: 0, seconds: 0 },
    settings: { voice: true, sound: true, autoRead: false, voiceStyle: 'cute' },
  });
  let S = load();
  // Voice choices saved while the voice list was still being worked out (iPad picked "Linh nhẹ" by a confusing
  // label) are dropped once, so every device starts on the clearest voice; a new pick is kept as usual.
  if ((S.settings.voicePick || 0) < 2) { delete S.settings.voiceName; S.settings.voicePick = 2; save(); }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(defaults(), JSON.parse(raw));
    } catch (e) { /* private mode: run without storage */ }
    return defaults();
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  function today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function daily() { if (S.daily.date !== today()) S.daily = { date: today(), count: 0, goal: S.daily.goal || 20 }; return S.daily; }

  /* -------------------------------------------------------------- curriculum */
  const GRADES = (window.CURRICULUM || []).slice().sort((a, b) => a.grade - b.grade);
  const LESSONS = new Map();   // id -> {lesson, topic, grade}
  for (const g of GRADES) for (const t of g.topics) for (const l of t.lessons) LESSONS.set(l.id, { lesson: l, topic: t, grade: g });
  const gradeOf = n => GRADES.find(g => g.grade === n);
  function lessonList(g) { const out = []; for (const t of g.topics) for (const l of t.lessons) out.push(l); return out; }
  // Học kì: content sets topic.semester (1 = SGK tập 1, 2 = tập 2). Fallback when it is missing:
  // the chủ đề number in the id ('g2-c8') against the first chủ đề of tập 2 in KNTT.
  const HK2_FROM_CHUDE = { 1: 6, 2: 8, 3: 8, 4: 8, 5: 7 };
  function semesterOf(t, g) {
    if (t.semester === 1 || t.semester === 2) return t.semester;
    const m = /-c(\d+)/.exec(t.id || '');
    return m && Number(m[1]) >= (HK2_FROM_CHUDE[g.grade] || 99) ? 2 : 1;
  }
  const topicsOf = (g, sem) => g.topics.filter(t => !sem || semesterOf(t, g) === sem);
  function semLessons(g, sem) { const out = []; for (const t of topicsOf(g, sem)) for (const l of t.lessons) out.push(l); return out; }
  function lessonSem(id) { const r = LESSONS.get(id); return r ? semesterOf(r.topic, r.grade) : 1; }
  function gradeStats(g, sem) {
    const ls = sem ? semLessons(g, sem) : lessonList(g);
    const done = ls.filter(l => (S.stars[l.id] || 0) > 0).length;
    const stars = ls.reduce((s, l) => s + (S.stars[l.id] || 0), 0);
    return { total: ls.length, done, stars, max: ls.length * 3 };
  }

  /* ------------------------------------------------------------------ helpers */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') { for (const [p, val] of Object.entries(v)) { if (p.startsWith('--')) el.style.setProperty(p, val); else el.style[p] = val; } }
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  // one keyboard handler at a time (the practice screen sets it; every new screen clears it)
  let keyHandler = null;
  document.addEventListener('keydown', e => { if (keyHandler) keyHandler(e); });
  function screen(...kids) { keyHandler = null; if (window.Scratch) Scratch.detach(); APP.innerHTML = ''; const s = h('div', { class: 'screen' }, ...kids); APP.append(s); return s; }
  function toast(msg) { const t = h('div', { class: 'toast' }, msg); document.body.append(t); setTimeout(() => t.remove(), 1800); }
  const starsText = n => '⭐'.repeat(n) + '☆'.repeat(3 - n);
  function starSpans(n) { const w = h('span', { class: 'ls' }); for (let i = 0; i < 3; i++) w.append(h('span', { class: i < n ? '' : 'star-off' }, '⭐')); return w; }

  const HAS_V = !!(window.V && typeof V.render === 'function');
  function viz(spec, ctx) {
    if (!spec || !spec.type || !HAS_V) return null;   // no visuals library: show the text only
    try { const el = V.render(spec.type, spec.params || {}, ctx || {}); fitViz(el, spec, ctx || {}); return el; }
    catch (e) { console.error('visual failed', spec, e); }
    return null;
  }
  // Centre every picture on what it actually shows: once the picture is on screen, its viewBox is fitted to
  // the drawn content (plus a margin), so a layout drawn in a corner — a short division, a tape, an angle —
  // sits in the middle of the board. Never zooms in more than 1.6×. Pictures that grow while the child works
  // (interactive, step-by-step) keep their frame.
  function fitViz(el, spec, ctx) {
    const svg = el && el.querySelector(':scope > svg');
    if (!svg || spec.type === 'mascot' || ctx.interactive || (spec.params && spec.params.reveal === 'steps')) return;
    let tries = 0;
    const run = () => {
      if (!svg.isConnected) { if (tries++ < 120) requestAnimationFrame(run); return; }
      const g = svg.querySelector(':scope > g'), vb = svg.viewBox.baseVal;
      if (!g || !vb || !vb.width) return;
      svg.classList.add('viz-measure');               // measure the final layout, not mid-animation
      let bb; try { bb = g.getBBox(); } catch (e) { bb = null; }
      svg.classList.remove('viz-measure');
      if (!bb || bb.width < 4 || bb.height < 4) return;
      const pad = Math.max(10, Math.min(vb.width, vb.height) * 0.05);
      let w = bb.width + 2 * pad, hgt = bb.height + 2 * pad;
      const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      w = Math.max(w, vb.width / 1.6); hgt = Math.max(hgt, vb.height / 1.6);   // zoom in at most 1.6×
      // already centred and tight: leave it
      if (Math.abs(cx - (vb.x + vb.width / 2)) < vb.width * 0.03 && Math.abs(cy - (vb.y + vb.height / 2)) < vb.height * 0.03 && w > vb.width * 0.9 && hgt > vb.height * 0.9) return;
      svg.setAttribute('viewBox', `${(cx - w / 2).toFixed(1)} ${(cy - hgt / 2).toFixed(1)} ${w.toFixed(1)} ${hgt.toFixed(1)}`);
      svg.setAttribute('width', Math.round(w)); svg.setAttribute('height', Math.round(hgt));
    };
    requestAnimationFrame(run);
  }
  function mascot(mood) {
    if (window.V && V.types && V.types.includes('mascot')) {
      try { return V.render('mascot', { mood: mood || 'happy' }, {}); } catch (e) { /* fall through */ }
    }
    return h('div', { html: fallbackRover(mood) });
  }
  // While the child slides across the cards ("rà chọn"), the card's icon (🐣 🌱 🚀 …) spins away and the ISA
  // rover pops in on that same spot with a short line; moving on spins ISA away and the icon back. A tap makes
  // ISA jump and say the tap line, then the app moves on. ISA only ever takes the icon's place, so no text is covered.
  // With "Giảm chuyển động" switched on, ISA still comes out — the stylesheet turns the spin into an instant change.
  const Peek = (() => {
    let cur = null, hideT = null, lastSound = 0, sayT = null;
    const iconOf = card => card.querySelector(':scope > .gicon') || card.querySelector('.topic-icon');
    const peekOf = card => card.querySelector(':scope > .peek');
    function place(card, pk) {
      const icon = iconOf(card);
      const cr = card.getBoundingClientRect();
      const ir = icon ? icon.getBoundingClientRect() : { left: cr.right - 70, top: cr.top + 14, width: 56, height: 56 };
      const big = icon && icon.classList.contains('gicon');
      const size = big ? 62 : 54;                                  // ISA width in px (about the icon's size)
      const cx = ir.left - cr.left + ir.width / 2, cy = ir.top - cr.top + ir.height / 2;
      const bot = pk.querySelector('.peek-bot'), say = pk.querySelector('.peek-say');
      bot.style.width = size + 'px';
      bot.style.left = Math.round(cx - size / 2) + 'px';
      bot.style.top = Math.max(2, Math.round(cy - size * 0.6)) + 'px';
      bot.style.left = Math.min(Math.round(cr.width - size - 4), Math.round(cx - size / 2)) + 'px';
      const rightSide = cx > cr.width / 2;
      if (rightSide) {                                              // grade cards: icon top-right → bubble on its left
        say.classList.add('to-right');
        say.style.right = Math.round(cr.width - (cx - size / 2) + 2) + 'px';
        say.style.left = 'auto';
      } else {                                                      // exam cards: icon left of the title → bubble at the far right of the head
        say.classList.add('to-left');
        say.style.right = '16px';
        say.style.left = 'auto';
      }
      say.style.top = Math.max(4, Math.round(cy - 18)) + 'px';
      // never cover the card's own text: fall back to a short line when the bubble would touch it
      // measure the glyphs, not the block boxes (a block spans the whole card width)
      const texts = [...card.querySelectorAll('.gnum, .glabel, .gdesc, .topic-title, .topic-meta')].map(e => { const rg = document.createRange(); rg.selectNodeContents(e); return rg.getBoundingClientRect(); });
      // use the bubble's laid-out size (it is still scaled down for its pop-in animation here)
      const hits = () => {
        const w = say.offsetWidth, hgt = say.offsetHeight;
        const right = cr.left + cr.width - parseFloat(say.style.right || 0), top = cr.top + parseFloat(say.style.top || 0);
        const box = say.classList.contains('to-right') ? { left: right - w, right, top, bottom: top + hgt }
          : { left: cr.right - 16 - w, right: cr.right - 16, top, bottom: top + hgt };
        return texts.some(t => box.left < t.right + 2 && box.right > t.left - 2 && box.top < t.bottom && box.bottom > t.top);
      };
      if (hits()) say.textContent = card.dataset.peekShort || 'Nè!';
      if (hits()) say.textContent = 'Nè!';
      if (hits()) say.style.display = 'none';
    }
    function up(card) {
      clearTimeout(hideT);
      if (cur === card) return;
      if (cur) down(cur);
      cur = card;
      let pk = peekOf(card);
      if (pk) pk.remove();
      pk = h('div', { class: 'peek', 'aria-hidden': 'true' },
        h('div', { class: 'peek-bot' }, mascot('happy')),
        h('div', { class: 'peek-say' }, card.dataset.peek || 'Chọn mình nhé!'));
      card.append(pk);
      place(card, pk);
      const icon = iconOf(card);
      if (icon) { icon.classList.remove('icon-in'); icon.classList.add('icon-out'); }
      requestAnimationFrame(() => pk.classList.add('up'));
      card.classList.add('peek-on');
      const now = Date.now();
      if (now - lastSound > 180) { lastSound = now; sfx.peek(); }
      // ISA says the card's line ("Bé ơi, lớp 1 nè!") once the finger rests on it a moment,
      // so a fast slide across several cards doesn't start and cut off a string of words.
      clearTimeout(sayT);
      const line = card.dataset.say;
      if (line) sayT = setTimeout(() => { if (cur === card && !card.classList.contains('peek-go')) speakOrQueue(line); }, 380);
    }
    function down(card) {
      clearTimeout(sayT);
      card.classList.remove('peek-on');
      if (cur === card) cur = null;
      const pk = peekOf(card);
      if (pk && pk.classList.contains('go')) return;
      const icon = iconOf(card);
      if (icon && icon.classList.contains('icon-out')) { icon.classList.remove('icon-out'); icon.classList.add('icon-in'); }
      if (!pk) return;
      pk.classList.remove('up'); pk.classList.add('down');
      setTimeout(() => { if (pk.classList.contains('down')) pk.remove(); }, 380);
    }
    // After a tap, ISA stays out this long (a finger that keeps resting or sliding keeps ISA out anyway).
    const HOLD_MS = 3200;
    const hold = () => { clearTimeout(hideT); hideT = setTimeout(() => { if (cur) down(cur); }, HOLD_MS); };
    function bind(container, selector) {
      const find = (x, y) => { const t = document.elementFromPoint(x, y); const c = t && t.closest(selector); return c && container.contains(c) ? c : null; };
      const track = (x, y) => { const c = find(x, y); if (c) up(c); else if (cur && container.contains(cur)) down(cur); };
      container.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') track(e.clientX, e.clientY); });
      container.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch' && cur) down(cur); });
      // touch: touchmove keeps firing while the finger slides (even when the page scrolls)
      container.addEventListener('touchstart', e => { const t = e.touches[0]; track(t.clientX, t.clientY); }, { passive: true });
      container.addEventListener('touchmove', e => { const t = e.touches[0]; track(t.clientX, t.clientY); }, { passive: true });
      container.addEventListener('touchend', hold, { passive: true });
      // A plain tap or click on the card (its icon, its text — not a button inside it) also brings ISA out:
      // some phones and in-app browsers send no touch events, only pointer events and a click.
      container.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') track(e.clientX, e.clientY); });
      container.addEventListener('click', e => {
        const c = find(e.clientX, e.clientY);
        if (!c || (e.target.closest && e.target.closest('button, a'))) return;
        up(c);
        if (e.pointerType !== 'mouse') hold();   // a mouse leaves the card by itself (pointerleave)
      });
    }
    return { up, down, bind };
  })();
  // Tap: ISA (already out, or popping in now) jumps and says the tap line, then the app moves on.
  function peekThen(card, go, say) {
    if (!card || card.classList.contains('peek-go')) return;
    Peek.up(card);
    const pk = card.querySelector(':scope > .peek');
    card.classList.add('peek-go');
    if (pk) {
      pk.classList.add('go');
      const bot = pk.querySelector('.peek-bot'); bot.innerHTML = ''; bot.append(mascot('cheer'));
      if (say) pk.querySelector('.peek-say').textContent = say;
    }
    sfx.peek();
    // Move on once ISA has finished the line (at least 0.7 s for the jump, at most 3.5 s in case the
    // device never reports the end); without a voice, after the 0.7 s jump as before.
    const t0 = Date.now();
    let moved = false;
    const moveOn = () => {
      if (moved) return; moved = true;
      setTimeout(go, Math.max(0, 700 - (Date.now() - t0)) + 120);
    };
    const u = say ? speak(say, null, 220) : null;   // after the chime, so it doesn't cover the first word
    if (u) {
      keepLineUntil = Date.now() + 4000;
      u.onend = u.onerror = moveOn;
      setTimeout(moveOn, 3500);
    } else setTimeout(go, 700);
  }

  // Original ISA rover, used until/unless visuals.js provides the mascot.
  function fallbackRover(mood) {
    const arms = mood === 'cheer'
      ? '<path d="M38 112 L18 78" stroke="#8DA2AE" stroke-width="9" stroke-linecap="round"/><path d="M162 112 L182 78" stroke="#8DA2AE" stroke-width="9" stroke-linecap="round"/>'
      : '<path d="M38 118 L20 138" stroke="#8DA2AE" stroke-width="9" stroke-linecap="round"/><path d="M162 118 L180 138" stroke="#8DA2AE" stroke-width="9" stroke-linecap="round"/>';
    const eyes = mood === 'oops'
      ? '<path d="M78 66 l10 6 M88 66 l-10 6 M112 66 l10 6 M122 66 l-10 6" stroke="#5CE4D3" stroke-width="4" stroke-linecap="round"/>'
      : '<circle cx="83" cy="69" r="7" fill="#5CE4D3"/><circle cx="117" cy="69" r="7" fill="#5CE4D3"/><circle cx="85" cy="67" r="2.2" fill="#fff"/><circle cx="119" cy="67" r="2.2" fill="#fff"/>';
    return `<svg viewBox="0 0 200 200" width="100%" role="img" aria-label="Rô-bốt ISA">
      <line x1="100" y1="30" x2="100" y2="12" stroke="#8DA2AE" stroke-width="4"/><circle cx="100" cy="10" r="7" fill="#F47A2A"/>
      ${arms}
      <rect x="40" y="96" width="120" height="66" rx="24" fill="#F47A2A"/>
      <rect x="72" y="112" width="56" height="26" rx="8" fill="#fff"/>
      <text x="100" y="131" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="18" fill="#F47A2A">ISA</text>
      <path d="M58 70 a42 40 0 0 1 84 0 v14 a10 10 0 0 1 -10 10 h-64 a10 10 0 0 1 -10 -10z" fill="#fff"/>
      <rect x="64" y="56" width="72" height="26" rx="13" fill="#1E3A4C"/>${eyes}
      <path d="M36 166 h52 l-6 22 h-40z" fill="#4A5B66"/><circle cx="62" cy="177" r="6" fill="#B9C6CD"/>
      <path d="M112 166 h52 l-6 22 h-40z" fill="#4A5B66"/><circle cx="138" cy="177" r="6" fill="#B9C6CD"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------ sound */
  let AC = null;
  function tone(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.18) {
    if (!S.settings.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      freqs.forEach((f, i) => {
        const o = AC.createOscillator(), g = AC.createGain();
        const t0 = AC.currentTime + i * gap;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.05);
      });
    } catch (e) { /* no audio */ }
  }
  const sfx = {
    tap: () => tone([660], 0.06, 'triangle', 0, 0.08),
    good: () => tone([523, 659, 784, 1047], 0.16, 'triangle', 0.08),
    bad: () => tone([300, 220], 0.18, 'sawtooth', 0.12, 0.08),
    win: () => tone([523, 659, 784, 659, 784, 1047, 1319], 0.18, 'triangle', 0.11),
    peek: () => tone([392, 587, 880], 0.11, 'triangle', 0.07, 0.12),
  };

  /* ------------------------------------------------------------------ speech */
  let viVoice = null;
  // ISA's voice: the device's Vietnamese voice, raised and slowed a little for "Dễ thương" (the default).
  const VOICE_STYLES = {
    cute: { name: 'Dễ thương', pitch: 1.25, rate: 0.88 },   // higher pitch blurred the first consonant ("Bé" heard as "mớ")
    normal: { name: 'Bình thường', pitch: 1, rate: 0.92 },
  };
  // Which Vietnamese voice: the one the parent picked in Góc phụ huynh, else the clearest one on the device.
  // (Windows lists the old "Microsoft An" first; it swallows the first sound — "Bé ơi" heard as "mớ ơi" —
  // so natural/online voices like HoaiMy, Google Tiếng Việt or Linh come first.)
  // iPhone/iPad name every voice just "Linh"; only the system ID tells them apart:
  // ….super-compact.vi-VN.Linh ("nhẹ") · ….compact.vi-VN.Linh ("chuẩn") · ….enhanced… (Nâng cao) · ….premium… (Cao cấp).
  // Safari only offers websites the two built-in ones (seen on the user's iPhone), never the downloaded voices.
  const voiceTag = v => {
    const s = (v.name || '') + ' ' + (v.voiceURI || '');
    return /Premium|Cao cấp/i.test(s) ? 'Cao cấp' : /Enhanced|Nâng cao/i.test(s) ? 'Nâng cao'
      : /super-compact/i.test(s) ? 'nhẹ' : /compact/i.test(s) ? 'chuẩn' : '';
  };
  // iPadOS Safari reports itself as a Mac; a Mac with a touch screen is an iPad
  const IS_IPAD = /iPad/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  const voiceRank = v => {
    const n = v.name || '', tag = voiceTag(v);
    if (/HoaiMy|Hoài My/i.test(n)) return 0;
    if (/Natural|Online|Neural/i.test(n)) return 1;
    // User tests on real devices: on the iPhone "Linh chuẩn" (compact) says "Bé" clearly and sounds more
    // natural; on the iPad the same voice still says "mớ" while "Linh nhẹ" (super-compact) is clear.
    if (tag === 'chuẩn' || (/Linh/i.test(n) && !tag)) return IS_IPAD ? 3 : 2;
    if (tag === 'nhẹ') return IS_IPAD ? 2 : 3;
    if (tag === 'Cao cấp') return 4;
    if (tag === 'Nâng cao') return 4;
    if (/Google|Siri/i.test(n)) return 5;
    if (/\bAn\b/.test(n)) return 9;
    return 6;
  };
  // Only the natural online voices (Edge: HoaiMy, NamMinh) stay clear when ISA raises the pitch for "Dễ thương".
  // Phone, iPad and old Windows voices garble the first word ("Bé ơi" → "mớ ơi"), so they speak at their natural pitch.
  const voiceId = v => v.voiceURI || v.name;   // two voices can share a name ("Linh"), never a voiceURI
  const isPlainVoice = v => !!v && voiceRank(v) > 1;
  const viVoices = () => speechSynthesis.getVoices().filter(v => /^vi/i.test(v.lang)).sort((a, b) => voiceRank(a) - voiceRank(b));
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = viVoices();
    viVoice = vs.find(v => voiceId(v) === S.settings.voiceName) || vs.find(v => v.name === S.settings.voiceName) || vs[0] || null;
    // Without a Vietnamese voice the device would read Vietnamese text with a foreign accent:
    // stay silent and hide the read-aloud buttons instead.
    document.body.classList.toggle('no-voice', !viVoice);
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  else document.body.classList.add('no-voice');
  function speakable(t) {
    return String(t)
      // icons are for the eyes only: never read them aloud (user request)
      .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}️‍⃣✓✗]/gu, ' ')
      .replace(/(\d)\s*\/\s*(\d)/g, '$1 phần $2')
      .replace(/(\d)[\s\u202F](?=\d{3}\b)/g, '$1')
      .replace(/×/g, ' nhân ').replace(/(\d)\s*:\s*(\d)/g, '$1 chia $2').replace(/\s:\s/g, ' chia ')
      .replace(/=\s*\?+/g, ' bằng bao nhiêu')
      .replace(/ô \?/g, 'ô trống')
      .replace(/(\d)\s*\?\?\s*(?=\d)/g, '$1, so với ')                      // "2 + 9 ?? 8 + 8" (chọn dấu)
      .replace(/[−-](?=\s*[\d?])/g, ' trừ ').replace(/\+/g, ' cộng ').replace(/=/g, ' bằng ')
      // a lone "?" standing for a number: "8 + ? = 17" → "8 cộng mấy bằng 17" (a question mark ending a sentence stays)
      .replace(/((?:cộng|trừ|nhân|chia|bằng)\s*)\?(?!\?)/g, '$1 mấy ').replace(/(^|\s)\?(?=\s*(?:cộng|trừ|nhân|chia|bằng))/g, '$1mấy')
      .replace(/</g, ' bé hơn ').replace(/>/g, ' lớn hơn ')
      .replace(/\?\?|…|\.\.\./g, ' bao nhiêu ')
      .replace(/km²/g, ' ki-lô-mét vuông').replace(/dm²/g, ' đề-xi-mét vuông').replace(/cm²/g, ' xăng-ti-mét vuông').replace(/mm²/g, ' mi-li-mét vuông').replace(/m²/g, ' mét vuông')
      .replace(/dm³/g, ' đề-xi-mét khối').replace(/cm³/g, ' xăng-ti-mét khối').replace(/m³/g, ' mét khối')
      .replace(/\bkm\b/g, ' ki-lô-mét').replace(/\bdm\b/g, ' đề-xi-mét').replace(/\bcm\b/g, ' xăng-ti-mét').replace(/\bmm\b/g, ' mi-li-mét')
      .replace(/\bkg\b/g, ' ki-lô-gam').replace(/\bml\b/g, ' mi-li-lít').replace(/°C/g, ' độ C').replace(/%/g, ' phần trăm')
      .replace(/\n/g, '. ');
  }
  // The built-in Vietnamese voice of most iPhones and iPads says the word "bé" as "mớ", whatever the wording,
  // speed or spelling (user tests on an iPad and several iPhones; only one newer iPhone reads it right), and
  // Safari gives websites no other voice. So ISA does not send "bé" to the voice:
  //   · "bé" meaning small (số bé, bé hơn, bé nhất — every use in the lessons) is read as "nhỏ";
  //   · "bé" as ISA's word for the child (Bé ơi, bé thử lại nhé) is read as the word chosen in Góc phụ huynh,
  //     "bạn" unless the parent picks another one (user request: "ưu tiên đọc là bạn"), on every device.
  // The text on screen stays "bé". Picking "bé" there reads everything as written.
  const KID_WORDS = ['bạn', 'con', 'em', 'bé'];
  const kidWord = () => (KID_WORDS.includes(S.settings.kidWord) ? S.settings.kidWord : 'bạn');
  const KID_SMALL = /((?:số|đáy|tích|tổng|hiệu|thương|phần|hình|góc|cạnh|đoạn|từ|đến|hay|vị|mặt|quả|tròn|nhọn|chục|nhiên) )([Bb]é)(?![\p{L}])/giu;
  const KID_CALL = /(^|[^\p{L}])([Bb]é)(?= (?:ơi|làm|hãy|cố|cứ|đã|còn|muốn|đọc|xem|ôn|chạm|bấm|thử|được|tiến|tên)(?![\p{L}]))/gu;
  const KID_CALL2 = /((?:bên|[Cc]hào) )([Bb]é)(?![\p{L}])/gu;
  const KID_REST = /(^|[^\p{L}])([Bb]é)(?![\p{L}])/gu;
  function kidSpeech(t, word) {
    const w = word || kidWord();
    if (w === 'bé') return t;
    const put = to => (m, a, b) => a + (b[0] === 'B' ? to[0].toUpperCase() + to.slice(1) : to);
    return t.replace(KID_SMALL, put('nhỏ')).replace(KID_CALL, put(w)).replace(KID_CALL2, put(w)).replace(KID_REST, put('nhỏ'));
  }
  // ---- ISA's recorded lines ----
  // js/isa-voice.js lists the lines that have a recorded clip (made with tools/make_isa_voice.py). Such a line is
  // played from its file, so it sounds the same — and says "bé" correctly — on every device. Everything else
  // (questions, hints, the child's name) is still read by the device's own voice.
  const VOICE_CLIPS = (window.ISA_VOICE && window.ISA_VOICE.clips) || {};
  const CLIP_DIR = (window.ISA_VOICE && window.ISA_VOICE.dir) || 'audio/isa/';
  const CLIP_KEYS = Object.keys(VOICE_CLIPS).sort((a, b) => b.length - a.length);   // longest line first
  const clipEl = CLIP_KEYS.length && typeof Audio !== 'undefined' ? new Audio() : null;
  // A very short silent sound: played once inside the first tap, it lets iPhone/iPad play the clips later on.
  const SILENT_WAV = 'data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
  // Clips are fetched as files (the service worker keeps them for offline use) and played from memory:
  // Safari refuses media that a service worker answers without byte ranges.
  const clipUrls = new Map();
  function clipUrl(file) {
    if (!clipUrls.has(file)) {
      clipUrls.set(file, fetch(CLIP_DIR + file).then(r => { if (!r.ok) throw new Error('clip ' + r.status); return r.blob(); })
        .then(b => URL.createObjectURL(b)).catch(e => { clipUrls.delete(file); throw e; }));
    }
    return clipUrls.get(file);
  }
  if (clipEl) setTimeout(() => new Set(Object.values(VOICE_CLIPS)).forEach(f => clipUrl(f).catch(() => {})), 1500);
  // Split a line into recorded clips and free text for the device voice: clips at the start, at most one
  // stretch of free text, clips at the end ("Chưa đúng, bé thử lại nhé." + hint · "Chào Na!" + recorded rest).
  function clipSegments(text) {
    if (!clipEl) return null;
    let rest = String(text).trim();
    const head = [], tail = [];
    while (rest) {
      const k = CLIP_KEYS.find(x => rest === x || rest.startsWith(x + ' '));
      if (!k) break;
      head.push({ clip: VOICE_CLIPS[k], text: k });
      rest = rest.slice(k.length).trim();
    }
    while (rest) {
      const k = CLIP_KEYS.find(x => rest.endsWith(' ' + x));
      if (!k) break;
      tail.unshift({ clip: VOICE_CLIPS[k], text: k });
      rest = rest.slice(0, -k.length).trim();
    }
    if (!head.length && !tail.length) return null;
    return [...head, ...(rest ? [{ text: rest }] : []), ...tail];
  }
  function stopClip() { if (clipEl) { clipEl.onended = clipEl.onerror = null; try { clipEl.pause(); } catch (e) { /* ignore */ } } }
  function playClip(file, done, fail) {
    let over = false, t = 0;
    const end = ok => { if (over) return; over = true; clearTimeout(t); clipEl.onended = clipEl.onerror = null; (ok ? done : fail)(); };
    // never hang on a file that cannot load: after 9 s go on (as played if any sound came out)
    t = setTimeout(() => end(clipEl.currentTime > 0), 9000);
    clipUrl(file).then(url => {
      if (over) return;
      clipEl.onended = () => end(true);
      clipEl.onerror = () => end(false);
      clipEl.src = url;
      const pr = clipEl.play();
      if (pr && pr.catch) pr.catch(() => end(false));
    }, () => end(false));
  }
  let speakBtn = null;   // the 🔊 button that shows "speaking"
  function setSpeakBtn(btn) { if (speakBtn && speakBtn !== btn) speakBtn.classList.remove('speaking'); speakBtn = btn || null; if (btn) btn.classList.add('speaking'); }
  function makeUtterance(text) {
    // NFC: precomposed Vietnamese letters (é = U+00E9, not e + U+0301), which every voice reads correctly
    // no leading comma: on iPhone/iPad it made "Bé" come out as "mớ" (user test, way 3)
    const u = new SpeechSynthesisUtterance(kidSpeech(speakable(text)).trim().normalize('NFC'));
    u.lang = 'vi-VN'; if (viVoice) u.voice = viVoice;
    const st = VOICE_STYLES[S.settings.voiceStyle] || VOICE_STYLES.cute;
    // Phone, iPad and old Windows voices garble the first word ("Bé" → "mớ") when slowed down or raised:
    // they speak at their natural pitch and speed. Edge's natural voices keep the "Dễ thương" style.
    const plain = isPlainVoice(viVoice);
    u.pitch = plain ? 1 : st.pitch; u.rate = plain ? 1 : st.rate;
    return u;
  }
  let lastUtter = null;   // kept so the browser cannot drop an utterance before it has finished
  function canTTS() { if (!('speechSynthesis' in window)) return false; if (!viVoice) pickVoice(); return !!viVoice; }
  // Read one stretch of free text with the device voice, then go on.
  function ttsPart(text, cb) {
    if (!canTTS()) return cb();
    const u = lastUtter = makeUtterance(text);
    let over = false;
    u.onend = u.onerror = () => { if (!over) { over = true; cb(); } };
    speechSynthesis.speak(u);
  }
  function speak(text, btn, delay = 0) {
    if (!S.settings.voice || !text) return;
    const segs = clipSegments(text);
    if (!segs) {
      // no recorded part: the device voice reads the whole line
      if (!canTTS()) return;
      // Cutting off a line and starting the next one straight away makes many voices swallow the first
      // sound: after a cut, wait a moment before the new line.
      const busy = speechSynthesis.speaking || speechSynthesis.pending, gen = ++speechGen;
      speechSynthesis.cancel(); stopClip();
      const u = lastUtter = makeUtterance(text);
      setSpeakBtn(btn);
      if (btn) u.onend = u.onerror = () => btn.classList.remove('speaking');
      const wait = Math.max(delay, busy ? 150 : 0);
      if (wait) setTimeout(() => { if (gen === speechGen) speechSynthesis.speak(u); }, wait); else speechSynthesis.speak(u);
      return u;
    }
    // recorded clips, with the device voice for any free text in between
    const gen = ++speechGen;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    stopClip();
    setSpeakBtn(btn);
    const ctl = { onend: null, onerror: null };   // same hooks as an utterance (peekThen waits on onend)
    let i = 0;
    const next = () => {
      if (gen !== speechGen) return;
      if (i >= segs.length) { if (btn) btn.classList.remove('speaking'); if (ctl.onend) ctl.onend(); return; }
      const sg = segs[i++];
      if (sg.clip) playClip(sg.clip, next, () => { if (gen === speechGen) ttsPart(sg.text, next); });
      else ttsPart(sg.text, next);
    };
    if (delay) setTimeout(next, delay); else next();
    return ctl;
  }
  // A card tap's line ("Làm đề nào!") keeps playing while the next screen opens; the back button still cuts it.
  let keepLineUntil = 0;
  let speechGen = 0;   // a line waiting to start is dropped when another line or a stop comes first
  function stopSpeech(force) { if (!force && Date.now() < keepLineUntil) return; keepLineUntil = 0; speechGen++; if ('speechSynthesis' in window) speechSynthesis.cancel(); stopClip(); setSpeakBtn(null); }
  // iPad/iPhone Safari stays silent until the first speech is started inside a tap (touchend/click).
  // Lines asked for before that (ISA on the card under the finger) wait and are spoken on the first tap's touchend.
  let speechUnlocked = !/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) || !('ontouchend' in document);
  let queuedLine = null;
  function speakOrQueue(text) { if (speechUnlocked) speak(text); else queuedLine = text; }
  function unlockSpeech() {
    if (speechUnlocked) return;
    speechUnlocked = true;
    document.removeEventListener('touchend', unlockSpeech, true);
    document.removeEventListener('click', unlockSpeech, true);
    if (clipEl) { try { clipEl.src = SILENT_WAV; const pr = clipEl.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* ignore */ } }
    if (queuedLine) { speak(queuedLine); queuedLine = null; return; }
    if (!('speechSynthesis' in window) || speechSynthesis.speaking) return;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0; u.lang = 'vi-VN';
    speechSynthesis.speak(u);
  }
  if (!speechUnlocked) {
    document.addEventListener('touchend', unlockSpeech, true);
    document.addEventListener('click', unlockSpeech, true);
  }

  /* ------------------------------------------------------------------ confetti */
  function confetti(n = 70) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = h('div', { class: 'confetti' });
    const cols = ['#F47A2A', '#FFC93C', '#5CE4D3', '#FF6B8A', '#5BC85B', '#4DA3FF', '#9B7BFF'];
    for (let i = 0; i < n; i++) {
      const c = h('i');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = cols[i % cols.length];
      c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      c.style.setProperty('--rot', (Math.random() * 900 - 450) + 'deg');
      c.style.animationDelay = Math.random() * 0.4 + 's';
      c.style.animationDuration = 1.2 + Math.random() * 1 + 's';
      box.append(c);
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 2800);
  }

  /* ================================================================== screens */
  function topbar(title, sub, left, right) {
    return h('div', { class: 'topbar' },
      left || null,
      h('div', { class: 'title' }, title, sub ? h('div', { class: 'sub' }, sub) : null),
      ...(right || []));
  }
  const coinPill = () => h('div', { class: 'pill' }, h('span', { class: 'e' }, '⭐'), String(S.coins));
  const homeBtn = () => h('button', { class: 'icon-btn', 'aria-label': 'Trang chủ', onclick: () => { sfx.tap(); showHome(); } }, '🏠');
  const backBtn = fn => h('button', { class: 'icon-btn', 'aria-label': 'Quay lại', onclick: () => { sfx.tap(); stopSpeech(true); fn(); } }, '←');
  const parentBtn = () => h('button', { class: 'icon-btn', 'aria-label': 'Góc phụ huynh', onclick: () => { sfx.tap(); parentGate(); } }, '⚙️');

  /* ---------- home ---------- */
  function showHome() {
    stopSpeech();
    if (!S.name && !S.askedName) return askName();
    const hi = `Chào ${S.name || 'bé'}!`;   // only the home greeting uses the child's name (user request)
    const d = daily();
    const pct = Math.min(1, d.count / d.goal);
    const ring = `<svg class="ring" viewBox="0 0 54 54"><circle cx="27" cy="27" r="22" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="7"/>
      <circle cx="27" cy="27" r="22" fill="none" stroke="#FFC93C" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(138.2 * pct).toFixed(1)} 200" transform="rotate(-90 27 27)"/></svg>`;
    const greet = d.count >= d.goal ? 'Hôm nay bé đã làm đủ mục tiêu rồi nhé!' : 'Hôm nay bé cố gắng học tốt nhé!';
    const grades = h('div', { class: 'grades' });
    for (const n of [1, 2, 3, 4, 5]) {
      const g = gradeOf(n), info = GRADE_INFO[n];
      const st = g ? gradeStats(g) : { total: 0, done: 0, stars: 0, max: 0 };
      // one card per grade, split into two choices: Học kì 1 / Học kì 2 (user request)
      const semBtn = sem => {
        const ss = g ? gradeStats(g, sem) : { total: 0, done: 0, stars: 0 };
        const ready = ss.total > 0;
        return h('button', { class: 'sem-btn' + (ready ? '' : ' soon'), onclick: () => {
            sfx.tap();
            if (!ready) return toast(`Lớp ${n} – Học kì ${sem} đang được soạn…`);
            peekThen(card, () => { S.grade = n; S.sem = sem; save(); showMap(n, sem); }, 'Đi thôi!');
          } },
          h('div', { class: 'sem-name' }, 'Học kì ' + sem),
          h('div', { class: 'bar' }, h('i', { style: { width: (ss.total ? ss.done / ss.total * 100 : 0) + '%' } })),
          h('div', { class: 'sem-stat' }, ready ? `${ss.done}/${ss.total} bài · ⭐ ${ss.stars}` : 'Sắp có'));
      };
      const card = h('div', { class: 'grade-card', 'data-peek': `Lớp ${n} nè!`, 'data-say': `Bé ơi, lớp ${n} nè!`, 'data-peek-short': `Lớp ${n}!`, style: { '--gc': info.color } },
        h('div', { class: 'island' }), h('div', { class: 'gicon' }, info.icon),
        h('div', null, h('div', { class: 'gnum' }, n), h('div', { class: 'glabel' }, 'Lớp ' + n), h('div', { class: 'gdesc' }, info.desc)),
        h('div', { class: 'sem-row' }, semBtn(1), semBtn(2)));
      grades.append(card);
    }
    // 6th card: Ôn tập & Kiểm tra (bộ đề theo mẫu của Bộ GD&ĐT)
    const nExams = [1, 2, 3, 4, 5].reduce((s, n) => s + (gradeOf(n) ? termsFor(n).length : 0), 0);
    const doneExams = Object.keys(S.exams || {}).length;
    grades.append(h('button', { class: 'grade-card review-card', 'data-peek': 'Ôn tập nè!', 'data-say': 'Bé ơi, ôn tập nè!', 'data-peek-short': 'Làm đề!', style: { '--gc': '#0E8C88' }, onclick: e => { sfx.tap(); peekThen(e.currentTarget, showExamHome, 'Làm đề nào!'); } },
      h('div', { class: 'island' }), h('div', { class: 'gicon' }, '📝'),
      h('div', null, h('div', { class: 'gnum' }, '✓'), h('div', { class: 'glabel' }, 'Ôn tập'),
        h('div', { class: 'gdesc' }, `Kiểm tra giữa kì, cuối kì · Đề theo mẫu Bộ GD&ĐT` + (doneExams ? ` · đã làm ${doneExams} đề` : ''))),
      h('span', { class: 'btn small review-go' }, 'Vào làm đề ▶')));
    const m = h('div', { class: 'mascot-wrap' }, mascot('happy'));
    screen(
      topbar('Toán ISA', 'Kết nối tri thức với cuộc sống', null, [coinPill(), parentBtn()]),
      h('div', { class: 'home' },
        h('div', { class: 'hero' },
          h('div', { class: 'speech' }, `${hi} ${greet}`),
          m,
          h('div', null, h('h1', null, hi), h('p', null, greet),
            h('div', { class: 'daily', html: ring + `<div>Mục tiêu hôm nay<br><b>${Math.min(d.count, d.goal)}/${d.goal} câu</b></div>` }))),
        grades));
    m.addEventListener('click', () => speak(`${hi} ${greet}`));
    Peek.bind(grades, '.grade-card');
  }


  function askName() {
    const input = h('input', { class: 'text-input', placeholder: 'Tên của bé', maxlength: 16, autocomplete: 'off' });
    const go = () => { const v = input.value.trim(); if (!v) { input.focus(); return; } S.name = v; S.askedName = true; save(); sfx.good(); showHome(); };
    const skip = () => { S.askedName = true; save(); showHome(); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    screen(
      topbar('Toán ISA', 'Kết nối tri thức với cuộc sống'),
      h('div', { class: 'result' },
        h('div', { class: 'card result-card' },
          h('div', { class: 'mascot-wrap' }, mascot('cheer')),
          h('h2', null, 'Xin chào! Mình là Rô-bốt ISA'),
          h('p', null, 'Bé tên là gì nhỉ?'),
          input,
          h('div', { class: 'result-actions' },
            h('button', { class: 'btn ghost', onclick: skip }, 'Bỏ qua'),
            h('button', { class: 'btn', onclick: go }, 'Bắt đầu 🚀')))));
    setTimeout(() => input.focus(), 300);
  }

  /* ---------- map ---------- */
  function showMap(n, sem) {
    stopSpeech();
    const g = gradeOf(n); if (!g) return showHome();
    sem = sem === 2 ? 2 : sem === 1 ? 1 : (S.grade === n && S.sem) || 1;
    if (S.grade !== n || S.sem !== sem) { S.grade = n; S.sem = sem; save(); }
    const info = GRADE_INFO[n];
    const all = semLessons(g, sem);
    const next = all.find(l => !(S.stars[l.id] > 0));
    const st = gradeStats(g, sem);
    const sc = h('div', { class: 'scroll' });
    if (!all.length) sc.append(h('section', { class: 'card topic' }, h('div', { class: 'topic-title' }, `Học kì ${sem} của lớp ${n} đang được soạn…`)));
    for (const t of topicsOf(g, sem)) {
      const doneT = t.lessons.filter(l => S.stars[l.id] > 0).length;
      const grid = h('div', { class: 'lessons' });
      for (const l of t.lessons) {
        const s = S.stars[l.id] || 0;
        grid.append(h('button', { class: 'lesson-tile' + (s ? ' done' : '') + (next === l ? ' next' : ''), onclick: () => { sfx.tap(); startLesson(l.id); } },
          h('div', { class: 'lb' }, l.book || ''), h('div', { class: 'lt' }, l.title), starSpans(s)));
      }
      sc.append(h('section', { class: 'card topic', style: { '--gc': info.color } },
        h('div', { class: 'topic-head' }, h('div', { class: 'topic-icon' }, t.icon || '📘'),
          h('div', null, h('div', { class: 'topic-title' }, t.title), h('div', { class: 'topic-meta' }, `${doneT}/${t.lessons.length} bài đã học`))),
        grid));
    }
    const tabs = h('div', { class: 'sem-tabs', style: { '--gc': info.color } },
      [1, 2].map(k => h('button', { class: 'sem-tab' + (k === sem ? ' on' : ''), onclick: () => { if (k !== sem) { sfx.tap(); showMap(n, k); } } }, 'Học kì ' + k)));
    screen(topbar(`Lớp ${n} · Học kì ${sem} ${info.icon}`, `${st.done}/${st.total} bài · ⭐ ${st.stars}/${st.max}`, homeBtn(), [tabs, coinPill(), parentBtn()]), sc);
    const el = sc.querySelector('.next');
    if (el) setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
  }

  /* ---------- lesson: learn phase ---------- */
  function startLesson(id) {
    const rec = LESSONS.get(id); if (!rec) return;
    const L = rec.lesson;
    if (L.learn && L.learn.length) showLearn(rec, 0); else showPractice(rec);
  }

  function showLearn(rec, k) {
    stopSpeech();
    const L = rec.lesson, n = rec.grade.grade, cards = L.learn;
    const c = cards[k];
    const sayBtn = h('button', { class: 'say-btn', 'aria-label': 'Đọc to' }, '🔊');
    sayBtn.onclick = () => speak(c.speak || c.text, sayBtn);
    const dots = h('div', { class: 'dots' }, cards.map((_, i) => h('i', { class: i === k ? 'on' : '' })));
    const last = k === cards.length - 1;
    // mode 'learn': explore cards show the worked picture (e.g. the crocodile in `compare`), not the question form
    const vEl = viz(c.visual, { size: 'lg', theme: 'paper', mode: 'learn' });
    screen(
      topbar(L.title, `${L.book || ''} · Lớp ${n} · Khám phá ${k + 1}/${cards.length}`, backBtn(() => showMap(n, lessonSem(L.id))),
        [h('button', { class: 'btn ghost small', onclick: () => { sfx.tap(); showPractice(rec); } }, 'Luyện tập ngay ▶')]),
      h('div', { class: 'player' },
        k === 0 && L.story ? h('div', { class: 'story' }, h('div', { class: 'mini-mascot' }, mascot('happy')), L.story) : null,
        h('div', { class: 'card learn-card' },
          h('div', { class: 'qhead' }, h('div', { class: 'learn-tag' }, '💡 Khám phá'), h('div', { style: { flex: 1 } }), sayBtn),
          h('div', { class: 'learn-text' + ((c.text || '').length > 90 ? ' long' : '') }, c.text || ''),
          h('div', { class: 'learn-viz' }, vEl),
          h('div', { class: 'learn-nav' },
            h('button', { class: 'btn ghost small', disabled: k === 0, onclick: () => { sfx.tap(); showLearn(rec, k - 1); } }, '◀ Trước'),
            dots,
            last ? h('button', { class: 'btn', onclick: () => { sfx.tap(); showPractice(rec); } }, 'Luyện tập ✏️')
              : h('button', { class: 'btn teal', onclick: () => { sfx.tap(); showLearn(rec, k + 1); } }, 'Tiếp ▶')))));
    if (S.settings.autoRead) speak(c.speak || c.text, sayBtn);
  }

  /* ---------- lesson: practice on the chalkboard ---------- */
  function showPractice(rec, startAt) {
    stopSpeech();
    const L = rec.lesson, n = rec.grade.grade;
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const run = { rec, i: Math.min(Math.max(startAt | 0, 0), QUESTIONS_PER_LESSON - 1), score: 0, results: [], t0: Date.now(), seed, timer: null };
    renderQuestion(run);
  }

  // A fraction answer that simplifies to a whole number (24/12 = 2/1) is asked as the whole number,
  // and "= 2/1" at the end of a working becomes "= 2" — except where the lesson asks for the form n/1.
  function tidyQuestion(q) {
    if (!q || !q.answer) return q;
    const keep = /mẫu số (là )?1(?!\d)|đảo ngược/.test(q.prompt);
    if (keep) return q;
    const A = q.answer;
    if (A.kind === 'fraction' && A.den === 1) {
      const unit = A.unit;
      q.answer = unit ? { kind: 'number', value: A.num, unit } : { kind: 'number', value: A.num };
    }
    const fix = t => (typeof t === 'string' ? t.replace(/= (\d+)\/1(?![\d\/])/g, '= $1') : t);
    q.explain = fix(q.explain); q.hint = fix(q.hint);
    return q;
  }

  function makeQuestion(run) {
    const L = run.rec.lesson;
    for (let attempt = 0; attempt < 12; attempt++) {
      try {
        const q = tidyQuestion(L.gen(U.makeRng(run.seed + run.i * 7919 + attempt * 104729), run.i));
        // a question answered on the picture needs the visuals library
        if (q && q.prompt && q.answer && (HAS_V || q.answer.kind !== 'visual')) return q;
      } catch (e) { console.error('generator failed', L.id, e); }
    }
    return { prompt: 'Câu này đang được sửa, bé bấm "Câu tiếp" nhé!', answer: { kind: 'choice', options: ['Câu tiếp'], correct: 0 }, explain: '' };
  }

  function fmtTime(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  function renderQuestion(run) {
    stopSpeech();
    clearInterval(run.timer);
    const L = run.rec.lesson, n = run.rec.grade.grade;
    const q = makeQuestion(run);
    const A = q.answer;
    let tries = 0, finished = false;

    // progress dots
    const dots = h('div', { class: 'progress-dots' });
    for (let k = 0; k < QUESTIONS_PER_LESSON; k++) {
      const r = run.results[k];
      dots.append(h('i', { class: k === run.i ? 'cur' : r === 1 ? 'ok' : r === 0.5 ? 'half' : r === 0 ? 'no' : '' }));
    }

    // chalkboard
    const timeEl = h('div', { class: 'bc chalk' }, fmtTime(Date.now() - run.t0));
    run.timer = setInterval(() => { timeEl.textContent = fmtTime(Date.now() - run.t0); }, 1000);
    const scoreEl = h('div', { class: 'br chalk' }, 'Điểm: ' + fmtScore(run.score));
    const sayBtn = h('button', { class: 'say-btn', 'aria-label': 'Đọc đề' }, '🔊');
    sayBtn.onclick = () => speak(q.speak || q.prompt, sayBtn);
    let visualEl = null;
    let visualValue;
    if (q.visual) {
      visualEl = viz(q.visual, {
        size: 'md', theme: 'board', interactive: A.kind === 'visual',
        onChange: v => { visualValue = v; if (A.kind === 'visual') checkBtn.disabled = false; },
      });
    }
    const slot = h('span', { class: 'slot empty' }, '??');
    const boardAnswer = h('div', { class: 'board-answer chalk' });
    // The blank in the prompt ("7 + 7 = ??", "45 … 54", "= ?") becomes the chalk answer slot itself.
    const qtext = h('div', { class: 'qtext chalk' + (q.prompt.length > 80 ? ' long' : '') });
    const slotKinds = A.kind === 'number' || A.kind === 'choice' || A.kind === 'text';
    const blank = slotKinds ? q.prompt.match(BLANK_RE) : null;
    if (blank && blank.length === 1) {
      const at = q.prompt.search(BLANK_RE1);
      const after = q.prompt.slice(at + blank[0].length);
      qtext.append(q.prompt.slice(0, at), slot);
      // the unit is shown after the slot unless the prompt already writes it there ("6 tấn = ?? kg")
      if (A.kind === 'number' && A.unit && !after.trim().startsWith(A.unit)) qtext.append(h('span', { class: 'unit' }, A.unit));
      qtext.append(after);
    } else {
      qtext.textContent = q.prompt;
      if (slotKinds) {
        boardAnswer.append(slot);
        if (A.kind === 'number' && A.unit) boardAnswer.append(h('span', { class: 'unit' }, A.unit));
      }
    }
    const big = !q.visual && q.prompt.length <= 22;
    const fr = { num: '', den: '', part: 'num' };
    const frNum = h('span', { class: 'empty act' }, '?'), frDen = h('span', { class: 'empty' }, '?');
    if (A.kind === 'fraction') boardAnswer.append(h('span', { class: 'bfrac' }, frNum, h('hr'), frDen));
    const tick = h('div', { class: 'tick' });
    tick.style.display = 'none';
    const board = h('div', { class: 'board' + (big ? ' big' : '') },
      h('div', { class: 'board-head' }, h('div', { class: 'bl chalk' }, `Câu ${run.i + 1}/${QUESTIONS_PER_LESSON}`), timeEl, scoreEl),
      h('div', { class: 'qhead' }, qtext, sayBtn),
      h('div', { class: 'qvisual' }, visualEl),
      boardAnswer.childNodes.length ? boardAnswer : null,
      tick,
      h('div', { class: 'board-tray' }));

    // answer pane
    const feedback = h('div', { class: 'feedback' });
    const checkBtn = h('button', { class: 'btn', disabled: true }, 'Bé đã xong ✓');
    const nextBtn = h('button', { class: 'btn teal' }, run.i === QUESTIONS_PER_LESSON - 1 ? 'Xem kết quả 🏆' : 'Câu tiếp ▶');
    nextBtn.style.display = 'none';
    const pane = h('div', { class: 'card answer-card' });
    let input = '';
    const bi = A.kind === 'number' && visualEl && visualEl.boxInput ? visualEl.boxInput : null;   // đặt tính boxes
    let colMode = bi ? (S.settings.colMode === 'type' ? 'type' : 'box') : 'type';

    function setSlot(text) { slot.textContent = text === '' ? '??' : text; slot.classList.toggle('empty', text === ''); }
    function refreshFraction() {
      frNum.textContent = fr.num || '?'; frDen.textContent = fr.den || '?';
      frNum.classList.toggle('empty', !fr.num); frDen.classList.toggle('empty', !fr.den);
      frNum.classList.toggle('act', fr.part === 'num'); frDen.classList.toggle('act', fr.part === 'den');
      checkBtn.disabled = !(fr.num && fr.den);
    }

    let qKeys = null;   // computer keyboard for this question (set after the screen is drawn)
    if (A.kind === 'choice' || A.kind === 'text') {
      const sym = A.kind === 'text' && A.options.every(o => String(o).length <= 2);
      const long = A.options.some(o => String(o).length > 14);
      pane.append(h('div', { class: 'answer-label' }, 'Chọn đáp án'));
      const grid = h('div', { class: 'choices' + (sym ? ' sym' : '') + (long ? ' col1' : '') });
      A.options.forEach((o, idx) => {
        const b = h('button', { class: 'choice' + (String(o).length > 8 ? ' txt' : '') }, String(o));
        b.onclick = () => {
          if (finished || b.classList.contains('wrong')) return;
          sfx.tap();
          grid.querySelectorAll('.choice').forEach(x => x.classList.remove('sel'));
          b.classList.add('sel');
          setSlot(String(o));
          judge(idx === A.correct, () => { b.classList.remove('sel'); b.classList.add(idx === A.correct ? 'right' : 'wrong'); },
            () => { const rb = grid.children[A.correct]; if (rb) rb.classList.add('right'); });
        };
        grid.append(b);
      });
      pane.append(grid);
      // keyboard: 1, 2, 3 … picks an option; Enter goes on once answered
      qKeys = e => {
        if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
        const k = Number(e.key);
        if (k >= 1 && k <= A.options.length && !finished) { e.preventDefault(); grid.children[k - 1].click(); }
        else if (e.key === 'Enter' && finished) { e.preventDefault(); nextBtn.click(); }
      };
    } else if (A.kind === 'number' || A.kind === 'fraction') {
      const isFr = A.kind === 'fraction';
      const label = h('div', { class: 'answer-label' }, isFr ? 'Viết phân số' : 'Nhập số');
      pane.append(label);
      // How the child enters the number (remembered):
      //  đặt tính questions: ✍️ Điền vào ô (keypad → boxes, units first) · ⌨️ Gõ số (whole number) · ✏️ Viết tay (write each digit → boxes)
      //  other questions:    ⌨️ Bàn phím · ✏️ Viết tay
      // A computer keyboard works in every mode (digits, Backspace, comma, Enter).
      let commaKey = null;
      const hasHand = !!window.Hand;
      const toBoxes = () => bi && (inMode === 'box' || inMode === 'hand');
      function press(k) {
        if (finished) return;
        if (toBoxes()) { if (k === '⌫') bi.back(); else if (/^\d$/.test(k)) bi.type(k); return; }
        if (isFr) {
          if (k === '⇅') fr.part = fr.part === 'num' ? 'den' : 'num';
          else if (k === '⌫') fr[fr.part] = fr[fr.part].slice(0, -1);
          else if (/^\d$/.test(k) && fr[fr.part].length < 4) { fr[fr.part] += k; }
          refreshFraction();
          return;
        }
        if (k === '⌫') input = input.slice(0, -1);
        else if (k === ',') { if (!input.includes(',')) input = (input || '0') + ','; }
        else if (/^\d$/.test(k) && input.replace(',', '').length < 9) input = (input === '0' ? '' : input) + k;
        else return;
        setSlot(prettyInput(input));
        if (bi) bi.fill(input);   // typing mode: mirror the number into the boxes, right-aligned
        checkBtn.disabled = input === '' || input.endsWith(',');
      }
      const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', isFr ? '⇅' : ',', '0', '⌫'];
      const pad = h('div', { class: 'keypad' });
      for (const k of keys) {
        const b = h('button', { class: 'key' + (k === '⌫' || k === '⇅' || k === ',' ? ' fn' : '') }, k === '⇅' ? 'Tử/Mẫu' : k);
        if (k === ',') commaKey = b;
        b.onclick = () => { if (finished) return; sfx.tap(); press(k); };
        pad.append(b);
      }
      // handwriting pad (finger, Apple Pencil or mouse); a wrong guess is fixed by tapping the right digit
      const handPad = hasHand ? Hand.pad({
        comma: !isFr && !bi, onComma: () => press(','),
        onDigit: d => { sfx.tap(); press(d); },
        onFix: d => { sfx.tap(); press('⌫'); press(d); },
        onBack: () => press('⌫'),
      }) : null;
      if (isFr && handPad) handPad.prepend(h('div', { class: 'hand-note' }, 'Chạm vào tử số hoặc mẫu số trên bảng để chọn chỗ viết.'));
      const modes = bi ? [['box', '✍️ Điền vào ô'], ['type', '⌨️ Gõ số']] : [['keys', '⌨️ Bàn phím']];
      if (handPad) modes.push(['hand', '✏️ Viết tay']);
      const saved = bi ? S.settings.colMode : S.settings.numMode;
      let inMode = modes.some(m => m[0] === saved) ? saved : modes[0][0];
      const modeBtns = modes.map(([m, t]) => h('button', { class: 'cm-btn', onclick: () => { if (!finished) { sfx.tap(); setMode(m); } } }, t));
      function setMode(m) {
        inMode = m;
        if (bi) { colMode = m; S.settings.colMode = m; } else S.settings.numMode = m;
        save();
        modeBtns.forEach((b, i) => b.classList.toggle('on', modes[i][0] === m));
        pad.style.display = m === 'hand' ? 'none' : '';
        if (handPad) { handPad.style.display = m === 'hand' ? '' : 'none'; handPad.clear(); }
        label.textContent = m === 'box' ? 'Chạm vào ô rồi điền chữ số (bắt đầu từ hàng đơn vị)'
          : m === 'hand' ? (bi ? 'Viết từng chữ số, bắt đầu từ hàng đơn vị (chạm ô để chọn chỗ viết)' : isFr ? 'Viết phân số' : 'Viết số')
          : isFr ? 'Viết phân số' : 'Nhập số';
        if (bi) { bi.enable(toBoxes()); bi.clear(); boardAnswer.classList.toggle('in-boxes', toBoxes()); }
        if (!isFr) { input = ''; setSlot(''); checkBtn.disabled = true; }
        if (commaKey) commaKey.style.visibility = toBoxes() ? 'hidden' : '';
      }
      if (bi) bi.onChange(v => { if (!toBoxes()) return; input = v; setSlot(prettyInput(v)); checkBtn.disabled = !v; });
      if (modes.length > 1) pane.append(h('div', { class: 'col-mode' + (modes.length === 3 ? ' three' : '') }, ...modeBtns));
      pane.append(pad);
      if (handPad) pane.append(handPad);
      setTimeout(() => setMode(inMode), 0);
      // computer keyboard
      qKeys = e => {
        if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
        if (/^\d$/.test(e.key)) { e.preventDefault(); press(e.key); }
        else if (e.key === 'Backspace') { e.preventDefault(); press('⌫'); }
        else if ((e.key === ',' || e.key === '.') && !isFr) press(',');
        else if ((e.key === '/' || e.key === 'Tab') && isFr) { e.preventDefault(); press('⇅'); }
        else if (e.key === 'Enter') { e.preventDefault(); if (!finished && !checkBtn.disabled) checkBtn.click(); else if (finished) nextBtn.click(); }
      };
      if (isFr) {
        frNum.onclick = () => { fr.part = 'num'; refreshFraction(); };
        frDen.onclick = () => { fr.part = 'den'; refreshFraction(); };
      }
    } else if (A.kind === 'visual') {
      pane.append(h('div', { class: 'answer-label' }, 'Làm trên bảng'),
        h('div', { style: { fontSize: '18px', fontWeight: 700, color: 'var(--ink-2)' } }, 'Bé chạm hoặc kéo trên hình trên bảng, rồi bấm "Bé đã xong" nhé.'));
      if (visualEl && typeof visualEl.getValue === 'function') {
        // some visuals start with a valid value already (e.g. a clock) — allow checking at once
        checkBtn.disabled = false;
      }
    }

    const showsCheck = A.kind !== 'choice' && A.kind !== 'text';
    pane.append(h('div', { style: { flex: 1 } }), feedback, h('div', { class: 'actions' }, showsCheck ? checkBtn : null, nextBtn));

    checkBtn.onclick = () => {
      if (finished) return;
      if (A.kind === 'number') {
        const v = U.parseNum(input);
        const ok = Math.abs(v - A.value) < 1e-9;
        judge(ok, () => { slot.classList.add(ok ? 'right' : 'wrong'); if (bi) bi.mark(ok ? null : 'wrong'); },
          () => { setSlot(U.fmt(A.value)); slot.classList.remove('wrong'); slot.classList.add('right'); if (bi) { bi.fill(U.fmt(A.value)); bi.mark(null); } });
      } else if (A.kind === 'fraction') {
        const a = Number(fr.num), b = Number(fr.den);
        let ok = b > 0 && Math.abs(a / b - A.num / A.den) < 1e-9;
        if (ok && A.simplest) ok = U.gcd(a, b) === 1;
        judge(ok, () => {}, () => { fr.num = String(A.num); fr.den = String(A.den); fr.part = ''; refreshFraction(); });
      } else if (A.kind === 'visual') {
        let v = visualValue;
        if (visualEl && typeof visualEl.getValue === 'function') v = visualEl.getValue();
        let ok = false; try { ok = !!A.check(v); } catch (e) { ok = false; }
        judge(ok, () => {}, () => {});
      }
    };
    nextBtn.onclick = () => {
      sfx.tap(); clearInterval(run.timer);
      run.i++;
      if (run.i >= QUESTIONS_PER_LESSON) finishLesson(run); else renderQuestion(run);
    };

    function judge(ok, mark, reveal) {
      tries++;
      mark();
      if (ok) {
        const pts = tries === 1 ? 1 : 0.5;
        settle(pts);
        sfx.good(); if (tries === 1) confetti(40);
        showTick(true);
        showFeedback('good', tries === 1 ? pick(['Đúng rồi bé ơi!', 'Đúng rồi bé ơi! 🎉', 'Đúng rồi bé ơi! Bé làm tiếp nhé!']) : 'Đúng rồi bé ơi! Lần sau bé làm ngay từ đầu nhé!', q.explain);
        speak('Đúng rồi bé ơi!');
      } else if (tries === 1) {
        sfx.bad();
        showFeedback('hint', 'Chưa đúng, bé thử lại nhé!', q.hint || '', q.hintVisual);
        speak('Chưa đúng, bé thử lại nhé. ' + (q.hint || ''));
        // allow another try
        if (A.kind === 'number') { input = ''; setTimeout(() => { setSlot(''); slot.classList.remove('wrong'); checkBtn.disabled = true; if (bi) { bi.mark(null); bi.clear(); } }, 700); }
        if (A.kind === 'fraction') { fr.num = ''; fr.den = ''; fr.part = 'num'; setTimeout(refreshFraction, 700); }
      } else {
        sfx.bad();
        reveal();
        settle(0);
        showTick(false);
        showFeedback('bad', 'Mình cùng xem lời giải nhé:', q.explain || '', q.hintVisual);
      }
    }
    function settle(pts) {
      finished = true;
      if (bi) bi.enable(false);
      run.score += pts; run.results[run.i] = pts;
      scoreEl.textContent = 'Điểm: ' + fmtScore(run.score);
      const d = daily(); d.count++; S.totals.answered++; if (pts === 1) S.totals.correct++; save();
      checkBtn.style.display = 'none'; nextBtn.style.display = '';
      const cur = dots.children[run.i]; if (cur) cur.className = pts === 1 ? 'ok' : pts ? 'half' : 'no';
    }
    function showTick(ok) { tick.textContent = ok ? '✓' : '✗'; tick.className = 'tick chalk ' + (ok ? 'ok' : 'no'); tick.style.display = ''; }
    function showFeedback(kind, title, text, hv) {
      feedback.className = 'feedback show ' + kind;
      feedback.innerHTML = '';
      const body = h('div', { class: 'fx' }, h('b', null, title), text ? '\n' + text : '');
      if (hv) { const e = viz(hv, { size: 'sm', theme: 'paper' }); if (e) body.append(h('div', { class: 'fviz' }, e)); }
      feedback.append(h('div', { class: 'fe' }, kind === 'good' ? '🎉' : kind === 'hint' ? '💡' : '📝'), body);
      // phones: the answer card may scroll, so bring the message into view
      requestAnimationFrame(() => { const c = feedback.parentElement; if (c && c.scrollHeight > c.clientHeight) feedback.scrollIntoView({ block: 'nearest' }); });
    }

    screen(
      topbar(L.title, `${L.book || ''} · Lớp ${n}`, backBtn(() => { clearInterval(run.timer); showMap(n, lessonSem(L.id)); }), []),
      h('div', { class: 'player' },
        h('div', { class: 'topbar', style: { padding: '0' } }, dots),
        h('div', { class: 'stage' }, board, h('div', { class: 'answer-pane' }, pane))));
    if (window.Scratch) Scratch.attach('practice:' + run.seed);   // giấy nháp, kept for the whole run
    keyHandler = qKeys;
    if (S.settings.autoRead) speak(q.speak || q.prompt, sayBtn);
  }
  function prettyInput(s) {
    if (!s) return '';
    const [i, d] = s.split(',');
    const ii = i.length > 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, U.NBSP) : i;
    return d != null ? ii + ',' + d : ii;
  }
  const fmtScore = x => U.fmt(x);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- result ---------- */
  // Spoken encouragement by score (out of 10), shared by lessons and exams (user request).
  const CHEERS = {
    top: ['Bé làm rất tốt!', 'Bé làm rất tốt! Bé cứ chăm chỉ như vậy nhé!', 'Bé làm rất tốt! Mình học tiếp bài sau nhé!'],
    good: ['Bé làm tốt lắm! Bé hãy cố gắng thêm chút nữa nhé!', 'Bé làm tốt lắm! Cố gắng thêm một chút là bé được 10 điểm nhé!'],
    ok: ['Bé hãy cố gắng nhé! Mình xem lại các câu sai cùng nhau nha.', 'Bé hãy cố gắng nhé! Làm lại một lần nữa là bé tiến bộ ngay.'],
    low: ['Không sao đâu! Bé cố gắng lên vào lần kế tiếp nhé!', 'Bé cố gắng lên vào lần kế tiếp nhé! ISA luôn ở bên bé.'],
  };
  const cheerBand = s => (s >= 9 ? 'top' : s >= 7 ? 'good' : s >= 5 ? 'ok' : 'low');
  const cheerFor = s => U.pick(Math.random, CHEERS[cheerBand(s)]);

  function finishLesson(run) {
    clearInterval(run.timer);
    const L = run.rec.lesson, n = run.rec.grade.grade;
    const sc = run.score;
    const stars = sc >= 9 ? 3 : sc >= 7 ? 2 : sc >= 5 ? 1 : 0;
    const prevStars = S.stars[L.id] || 0;
    S.stars[L.id] = Math.max(prevStars, stars);
    S.best[L.id] = Math.max(S.best[L.id] || 0, sc);
    S.plays[L.id] = (S.plays[L.id] || 0) + 1;
    const earned = Math.round(sc) + (stars === 3 ? 5 : 0);
    S.coins += earned;
    S.totals.seconds += Math.round((Date.now() - run.t0) / 1000);
    save();
    if (stars >= 2) { sfx.win(); confetti(110); } else sfx.good();
    const all = lessonList(run.rec.grade);
    const idx = all.indexOf(L);
    const nextL = all[idx + 1];
    const msg = cheerFor(sc * 10 / QUESTIONS_PER_LESSON);
    const bs = h('div', { class: 'big-stars' });
    for (let k = 0; k < 3; k++) bs.append(h('span', { class: k < stars ? '' : 'star-off' }, '⭐'));
    screen(
      topbar(L.title, `${L.book || ''} · Lớp ${n}`, homeBtn(), [coinPill()]),
      h('div', { class: 'result' },
        h('div', { class: 'card result-card' },
          h('div', { class: 'mascot-wrap' }, mascot(stars >= 2 ? 'cheer' : stars === 1 ? 'happy' : 'think')),
          h('h2', null, msg),
          bs,
          h('p', null, `Đúng ${U.fmt(sc)}/${QUESTIONS_PER_LESSON} câu · thời gian ${fmtTime(Date.now() - run.t0)} · +${earned} ⭐`),
          h('div', { class: 'result-actions' },
            h('button', { class: 'btn ghost', onclick: () => { sfx.tap(); showPractice(run.rec); } }, '↻ Làm lại'),
            stars === 0 && L.learn && L.learn.length ? h('button', { class: 'btn teal', onclick: () => { sfx.tap(); showLearn(run.rec, 0); } }, '💡 Xem lại') : null,
            nextL ? h('button', { class: 'btn', onclick: () => { sfx.tap(); startLesson(nextL.id); } }, 'Bài tiếp ▶') : null,
            h('button', { class: 'btn ghost', onclick: () => { sfx.tap(); showMap(n, lessonSem(L.id)); } }, '🗺️ Bản đồ')))));
    setTimeout(() => speak(msg), 600);   // after the result sound
  }

  /* ---------- parent corner ---------- */
  function sheet(...kids) {
    const bg = h('div', { class: 'sheet-bg' });
    const card = h('div', { class: 'card sheet' }, ...kids);
    bg.append(card);
    bg.addEventListener('click', e => { if (e.target === bg) bg.remove(); });
    document.body.append(bg);
    return { bg, card, close: () => bg.remove() };
  }
  // Parent corner opens straight away (user: no sum to get in); "Xóa tiến độ" inside still asks to confirm.
  function parentGate() { parentCorner(); }
  function parentCorner() {
    const T = S.totals;
    const toggle = (key, label) => {
      const t = h('button', { class: 'toggle' + (S.settings[key] ? ' on' : ''), 'aria-label': label });
      t.onclick = () => { S.settings[key] = !S.settings[key]; t.classList.toggle('on', S.settings[key]); save(); };
      return h('div', { class: 'row' }, h('div', { class: 'grow' }, label), t);
    };
    const curStyle = VOICE_STYLES[S.settings.voiceStyle] ? S.settings.voiceStyle : 'cute';
    const styleRow = h('div', { class: 'row' }, h('div', { class: 'grow' }, 'Giọng ISA',
        isPlainVoice(viVoice) ? h('div', { class: 'voice-note' }, 'Giọng của máy này bị méo chữ khi nâng cao giọng, nên ISA đọc ở giọng tự nhiên cho rõ chữ.') : null),
      ...Object.entries(VOICE_STYLES).map(([k, v]) => h('button', {
        class: 'btn small ' + (curStyle === k ? '' : 'ghost'),
        onclick: () => { S.settings.voiceStyle = k; save(); sh.close(); parentCorner(); speak('Chào bé! Mình là Rô-bốt ISA. 3 cộng 4 bằng 7.'); },
      }, v.name)),
      h('button', { class: 'btn ghost small', onclick: () => speak('Bé ơi, lớp 1 nè! Mình là Rô-bốt ISA. 3 cộng 4 bằng 7.') }, '🔊 Nghe thử'));
    // every Vietnamese voice on this device, clearest first; a tap picks it and plays the test line
    // short button names that still tell the voices apart: "Linh" · "Linh Nâng cao" · "Linh Cao cấp" · "HoaiMy"
    const voiceShort = v => {
      const n = v.name;
      const base = n.replace(/^Microsoft\s+|^Google\s+/i, '').replace(/\s*[-–]\s*Vietnamese.*$/i, '').replace(/\s*\(.*?\)\s*/g, ' ')
        .replace(/\s*\b(Online|Natural|Enhanced|Premium)\b/gi, '').trim() || n;
      const tag = voiceTag(v);
      return tag ? `${base} ${tag}` : base;
    };
    const vlist = 'speechSynthesis' in window ? viVoices() : [];
    const voiceRow = vlist.length ? h('div', { class: 'row voice-row' }, h('div', { class: 'grow' }, 'Giọng máy', vlist.length > 1 ? h('div', { class: 'voice-note' }, 'Nghe chưa rõ (ví dụ "Bé" thành "mớ")? Chọn giọng khác.') : null),
      ...vlist.map((v, i) => {
        // same short name twice (e.g. two "Linh" on one device): number them so each button is distinct
        const nm = voiceShort(v), dup = vlist.filter(w => voiceShort(w) === nm);
        const label = (dup.length > 1 ? `${nm} ${dup.indexOf(v) + 1}` : nm) + (i === 0 && vlist.length > 1 ? ' ⭐' : '');
        return h('button', {
          class: 'btn small ' + (viVoice && voiceId(viVoice) === voiceId(v) ? '' : 'ghost'), title: v.name,
          onclick: () => { S.settings.voiceName = voiceId(v); save(); pickVoice(); sh.close(); parentCorner(); speak('Bé ơi, lớp 1 nè! Mình là Rô-bốt ISA.'); },
        }, label);
      }),
      vlist.length > 1 ? h('div', { class: 'voice-note', style: { flexBasis: '100%' } }, '⭐ = giọng rõ nhất trên máy này') : null) : null;
    const kidRow = h('div', { class: 'row voice-row' },
      h('div', { class: 'grow' }, 'Khi đọc, ISA gọi bé là'),
      ...KID_WORDS.map(w => h('button', {
        class: 'btn small ' + (kidWord() === w ? '' : 'ghost'),
        onclick: () => { S.settings.kidWord = w; save(); sh.close(); parentCorner(); speak('Bé ơi, lớp 1 nè! 3 bé hơn 5.'); },
      }, w)));
    const nameIn = h('input', { class: 'text-input', value: S.name || '', placeholder: 'Tên của bé', maxlength: 16 });
    nameIn.addEventListener('change', () => { S.name = nameIn.value.trim(); S.askedName = true; save(); });
    const goalSel = h('div', { class: 'row' }, h('div', { class: 'grow' }, 'Mục tiêu mỗi ngày'),
      ...[10, 20, 30, 50].map(v => h('button', { class: 'btn small ' + (daily().goal === v ? '' : 'ghost'), onclick: () => { S.daily.goal = v; save(); sh.close(); parentCorner(); } }, v + ' câu')));
    const gradeRows = GRADES.map(g => {
      const st = gradeStats(g);
      return h('div', { class: 'row' }, h('div', { class: 'grow' }, `Lớp ${g.grade}: ${st.done}/${st.total} bài · ⭐ ${st.stars}/${st.max}`),
        h('div', { class: 'bar', style: { width: '180px', '--gc': GRADE_INFO[g.grade].color } }, h('i', { style: { width: (st.total ? st.done / st.total * 100 : 0) + '%' } })));
    });
    const weak = [];
    for (const [id, best] of Object.entries(S.best)) { const r = LESSONS.get(id); if (r && best < 7) weak.push({ r, best }); }
    weak.sort((a, b) => a.best - b.best);
    // "Đặt lại ứng dụng" for parents (user request): each choice asks once more before it acts.
    const confirmRow = (label, btnText, ask, act) => {
      const row = h('div', { class: 'row reset-row' });
      const draw = () => {
        row.innerHTML = '';
        row.append(h('div', { class: 'grow' }, label), h('button', { class: 'btn ghost small', onclick: () => {
          row.innerHTML = '';
          row.append(h('div', { class: 'grow reset-ask' }, ask),
            h('button', { class: 'btn ghost small', onclick: draw }, 'Hủy'),
            h('button', { class: 'btn small danger', onclick: act }, 'Đồng ý'));
        } }, btnText));
      };
      draw();
      return row;
    };
    const resetProgress = confirmRow('Xóa tiến độ học (giữ cài đặt)', 'Xóa tiến độ',
      'Xóa hết sao, điểm và các đề đã làm? Không thể hoàn tác.',
      () => { S = Object.assign(defaults(), { name: S.name, askedName: S.askedName, settings: S.settings, daily: { date: '', count: 0, goal: S.daily.goal || 20 } }); save(); sh.close(); toast('Đã xóa tiến độ học'); showHome(); });
    const resetAll = confirmRow('Đặt lại toàn bộ ứng dụng như lúc mới cài', 'Đặt lại',
      'Xóa tiến độ, cài đặt và nét chữ bé đã dạy cho ISA, rồi mở lại ứng dụng? Không thể hoàn tác.',
      async () => {
        stopSpeech(true);
        try { Object.keys(localStorage).filter(k => k.startsWith('toanisa')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* private mode */ }
        // drop the offline copy only when online, so the app can download a fresh one straight away
        if (navigator.onLine && window.caches) { try { for (const k of await caches.keys()) await caches.delete(k); } catch (e) { /* ignore */ } }
        location.reload();
      });
    const sh = sheet(
      h('h2', null, '👨‍👩‍👧 Góc phụ huynh'),
      h('div', { class: 'stat-grid' },
        h('div', { class: 'stat' }, h('b', null, T.answered), h('span', null, 'câu đã làm')),
        h('div', { class: 'stat' }, h('b', null, T.answered ? Math.round(T.correct / T.answered * 100) + '%' : '–'), h('span', null, 'đúng ngay lần đầu')),
        h('div', { class: 'stat' }, h('b', null, Math.round(T.seconds / 60)), h('span', null, 'phút luyện tập')),
        h('div', { class: 'stat' }, h('b', null, S.coins), h('span', null, 'sao tích lũy'))),
      h('h3', null, 'Tiến độ theo lớp (SGK Kết nối tri thức)'), ...gradeRows,
      h('h3', null, 'Bài cần ôn thêm'),
      weak.length ? h('div', null, ...weak.slice(0, 8).map(w => h('div', { class: 'row weak' },
        h('div', { class: 'grow' }, `Lớp ${w.r.grade.grade} · ${w.r.lesson.book || ''} · ${w.r.lesson.title}`), h('b', null, U.fmt(w.best) + '/10'),
        h('button', { class: 'btn small', onclick: () => { sh.close(); startLesson(w.r.lesson.id); } }, 'Ôn')))) : h('p', null, 'Chưa có bài nào dưới 7 điểm. 👍'),
      h('h3', null, 'Cài đặt'),
      toggle('voice', 'Giọng đọc tiếng Việt' + (viVoice ? '' : ' (máy này chưa có giọng tiếng Việt nên app không đọc)')), voiceRow, kidRow, styleRow, toggle('autoRead', 'Tự đọc đề bài'), toggle('sound', 'Âm thanh'), goalSel,
      h('div', { class: 'row' }, h('div', { style: { width: '120px' } }, 'Tên bé'), nameIn),
      h('h3', null, 'Đặt lại ứng dụng'), resetProgress, resetAll,
      h('div', { class: 'result-actions', style: { marginTop: '14px' } }, h('button', { class: 'btn', onclick: () => { sh.close(); showHome(); } }, 'Xong')),
      h('p', { class: 'app-ver' }, `Toán ISA ${APP_VERSION}` + (viVoice ? ` · giọng: ${viVoice.name}${voiceTag(viVoice) ? ' ' + voiceTag(viVoice) : ''}` : '') + (CLIP_KEYS.length ? ` · ${CLIP_KEYS.length} câu thu sẵn` : '')));
  }


  /* ================================================================== exams (Ôn tập & Kiểm tra) */
  // Periodic tests per Thông tư 27/2020: lớp 1–3 cuối HK1 + cuối năm; lớp 4–5 also giữa HK1 + giữa HK2.
  const TERMS = {
    'giua-hk1': { name: 'Giữa học kì I', title: 'BÀI KIỂM TRA GIỮA HỌC KÌ I' },
    'cuoi-hk1': { name: 'Cuối học kì I', title: 'BÀI KIỂM TRA CUỐI HỌC KÌ I' },
    'giua-hk2': { name: 'Giữa học kì II', title: 'BÀI KIỂM TRA GIỮA HỌC KÌ II' },
    'cuoi-nam': { name: 'Cuối năm học', title: 'BÀI KIỂM TRA CUỐI NĂM HỌC' },
  };
  const termsFor = n => (n >= 4 ? ['giua-hk1', 'cuoi-hk1', 'giua-hk2', 'cuoi-nam'] : ['cuoi-hk1', 'cuoi-nam']);
  const EXAM_DATA = window.EXAMS || [];
  // Two kinds of paper per kì — Đề thường and Đề nâng cao. There is no list of numbered papers: a tap on the kì
  // builds a new paper on the same ma trận every time (user request). One mark record per kì and kind (paper
  // number 1); the numbered papers of earlier versions (1…20) still count towards the best mark.
  const OLD_PAPERS = 20;
  const MODE_NAME = { thuong: 'Đề thường', nc: 'Đề nâng cao' };
  const examMode = m => (m === 'nc' ? 'nc' : 'thuong');
  const examKey = (n, term, no, mode) => `${n}-${term}${mode === 'nc' ? '-nc' : ''}-${no}`;
  const paperName = (no, mode, term) => (/^cd-/.test(term || '') ? (mode === 'nc' ? 'Phiếu ôn tập nâng cao' : 'Phiếu ôn tập') : MODE_NAME[examMode(mode)]);
  // best mark and number of attempts for a kì (or chủ đề) in one kind, or in both when mode is omitted
  function examRecord(n, term, mode) {
    let best = -1, tries = 0;
    for (const m of mode ? [examMode(mode)] : ['thuong', 'nc']) for (let k = 1; k <= OLD_PAPERS; k++) {
      const r = S.exams[examKey(n, term, k, m)];
      if (r) { best = Math.max(best, r.best ?? -1); tries += r.tries || 1; }
    }
    return { best, tries };
  }
  function schoolYear() { const d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? `${y} – ${y + 1}` : `${y - 1} – ${y}`; }
  function strHash(s) { let x = 2166136261; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; }

  function scopeLessons(g, term) {
    const hk1 = semLessons(g, 1), hk2 = semLessons(g, 2);
    if (term === 'giua-hk1') return hk1.slice(0, Math.max(1, Math.ceil(hk1.length / 2)));
    if (term === 'cuoi-hk1') return hk1;
    if (term === 'giua-hk2') return hk2.slice(0, Math.max(1, Math.ceil(hk2.length / 2)));
    return hk2.concat(hk1);
  }
  // Default blueprint, used until the content agents deliver the official-style ma trận for a grade/term:
  // 6 trắc nghiệm × 0,5 đ (Mức 1-1-1-2-2-3) + 4 tự luận (2 + 2 + 2 + 1 đ, Mức 1-2-2-3) = 10 đ.
  function autoBlueprint(g, term) {
    const scope = scopeLessons(g, term).map(l => l.id);
    if (!scope.length) return null;
    const hk2Only = term === 'cuoi-nam' ? semLessons(g, 2).map(l => l.id) : scope;
    const tn = [1, 1, 1, 2, 2, 3].map((lv, k) => ({ pick: k < 4 ? scope : hk2Only.length ? hk2Only : scope, level: lv, points: 0.5, form: 'choice' }));
    const tl = [[1, 2], [2, 2], [2, 2], [3, 1]].map(([lv, pt]) => ({ pick: hk2Only.length ? hk2Only : scope, level: lv, points: pt, form: 'input' }));
    return {
      grade: g.grade, term, auto: true, title: TERMS[term].title, minutes: g.grade <= 2 ? 35 : 40, papers: 10,
      parts: [
        { title: 'PHẦN I. TRẮC NGHIỆM', note: 'Khoanh vào chữ đặt trước câu trả lời đúng.', items: tn },
        { title: 'PHẦN II. TỰ LUẬN', note: 'Viết kết quả vào chỗ chấm.', items: tl },
      ],
    };
  }
  // ---- Phiếu ôn tập theo chủ đề (user request): a short sheet on one chủ đề ----
  // Its "term" is 'cd-' + the chủ đề code of the topic id ('g3-c2' → 'cd-c2'), so marks, deep links and the paper
  // screen work as for a kì. 10 câu × 1 điểm: 6 trắc nghiệm (mức 1-1-1-2-2-2) + 4 tự luận (mức 2-2-3-3).
  const isSheet = term => /^cd-/.test(term || '');
  const topicCode = t => { const m = /-(c\d+)$/.exec(t.id || (t.lessons[0] && t.lessons[0].id.replace(/-b\d+.*$/, '')) || ''); return m ? m[1] : ''; };
  const topicOfTerm = (g, term) => g.topics.find(t => t.lessons.length && 'cd-' + topicCode(t) === term);
  function topicBlueprint(g, term) {
    const t = topicOfTerm(g, term);
    if (!t) return null;
    const ids = t.lessons.map(l => l.id);
    const slot = (level, form) => ({ pick: ids, level, points: 1, form });
    return {
      grade: g.grade, term, sheet: true, topic: t, lessonIds: ids, title: 'Phiếu ôn tập', minutes: g.grade <= 2 ? 20 : 25,
      parts: [
        { title: 'PHẦN I. TRẮC NGHIỆM', note: 'Khoanh vào chữ đặt trước câu trả lời đúng (hoặc làm theo yêu cầu của câu hỏi).', items: [1, 1, 1, 2, 2, 2].map(lv => slot(lv, 'choice')) },
        { title: 'PHẦN II. TỰ LUẬN', items: [2, 2, 3, 3].map(lv => slot(lv, 'as-is')) },
      ],
    };
  }
  function blueprintFor(n, term) {
    const g = gradeOf(n); if (!g) return null;
    if (isSheet(term)) return topicBlueprint(g, term);
    return EXAM_DATA.find(e => e.grade === n && e.term === term) || autoBlueprint(g, term);
  }
  // Names that differ between a kì's paper and a chủ đề sheet
  const termName = (n, term) => { if (!isSheet(term)) return TERMS[term].name; const g = gradeOf(n), t = g && topicOfTerm(g, term); return t ? t.title : 'Ôn tập theo chủ đề'; };
  const backToList = (n, term) => (isSheet(term) ? showTopicList(n) : showExamHome());

  function choiceFromAnswer(rng, q) {
    const A = q.answer;
    if (A.kind === 'choice' || A.kind === 'text') return A;
    if (A.kind === 'number') {
      const v = A.value, unit = A.unit ? ' ' + A.unit : '';
      let ds;
      if (!Number.isInteger(v)) ds = [v * 10, v / 10, U.round(v + 0.1, 4), U.round(v - 0.1, 4), U.round(v + 1, 4)];
      else {
        const spread = v < 20 ? 3 : v < 200 ? 12 : Math.max(10, Math.round(v * 0.08));
        ds = U.near(rng, v, spread, 3).concat(v >= 10 ? [v + 10, v - 10] : [], v >= 100 ? [v + 100, v - 100] : []);
      }
      ds = ds.filter(x => x >= 0 && x !== v);
      return U.choices(rng, v, ds, x => U.fmt(x) + unit);
    }
    if (A.kind === 'fraction') {
      const n = A.num, d = A.den;
      return U.choices(rng, `${n}/${d}`, [`${d}/${n}`, `${n + 1}/${d}`, `${n}/${d + 1}`, `${Math.max(1, n - 1)}/${d + 1}`, `${n + 2}/${d}`]);
    }
    return null;   // visual answers stay as they are
  }

  const DT_LABEL = 'Đặt tính rồi tính', BT_LABEL = 'Giải bài toán';
  // The lessons a grade's blueprints use for "Đặt tính rồi tính" / "Giải bài toán": its column-calculation family.
  const calcFamily = new Map();
  function calcLessons(n) {
    if (!calcFamily.has(n)) {
      const ids = new Set();
      for (const bp of EXAM_DATA) if (bp.grade === n) for (const part of bp.parts) for (const it of part.items) {
        if (it.label === DT_LABEL || it.label === BT_LABEL) (it.lesson ? [it.lesson] : it.pick || []).forEach(id => ids.add(id));
      }
      calcFamily.set(n, ids);
    }
    return calcFamily.get(n);
  }
  // The lessons one slot of the ma trận may draw from: the blueprint's own lesson(s) ("base") plus, so that papers
  // differ while staying on the kì's content, lessons of the same chủ đề inside the kì's scope ("extra").
  // A slot with its own instruction ("Tính giá trị của biểu thức"…) keeps to its own lessons.
  function slotPool(bp, it, scope) {
    const base = (it.lesson ? [it.lesson] : it.pick || []).filter(id => LESSONS.has(id));
    let extra = [];
    if (it.label === DT_LABEL || it.label === BT_LABEL) {
      extra = [...calcLessons(bp.grade)].filter(id => scope.has(id) && LESSONS.has(id) && typeof LESSONS.get(id).lesson.exam === 'function');
    } else if (!it.label) {
      const topics = new Set(base.map(id => LESSONS.get(id).topic));
      extra = [...scope].filter(id => LESSONS.has(id) && topics.has(LESSONS.get(id).topic));
    }
    extra = extra.filter(id => !base.includes(id));
    // "wide": any other lesson the kì covers (for the cuối năm paper: of học kì II), used now and then by an
    // unlabelled slot so that, over many papers, every lesson of the kì turns up
    let wide = [];
    if (!it.label) {
      const g = gradeOf(bp.grade);
      const main = bp.term === 'cuoi-nam' && g ? new Set(semLessons(g, 2).map(l => l.id)) : scope;
      wide = [...main].filter(id => LESSONS.has(id) && !base.includes(id) && !extra.includes(id));
    }
    return { base, extra, wide };
  }

  // What the child has already met, per grade: exact questions (not given again while others exist) and kinds of
  // question (the more often met, the less often chosen). Filled when a paper is opened (user: "biết bé đã làm
  // các câu hỏi nào rồi để không bị xào trúng").
  const SEEN_Q_MAX = 1500, SEEN_KIND_MAX = 900;
  function seenOf(n) {
    if (!S.seen || typeof S.seen !== 'object') S.seen = {};
    const k = String(n);
    if (!S.seen[k] || !Array.isArray(S.seen[k].q)) S.seen[k] = { q: [], s: {} };
    return S.seen[k];
  }
  // A question is its words plus its picture: "Hình nào là hình tròn?" with other shapes is another question.
  const qId = q => q.prompt + (q.visual ? '|' + JSON.stringify(q.visual) : '');
  const qSig = q => strHash(qId(q));
  const kindSig = (id, q) => String(strHash(id + '|' + q.prompt.replace(/\d+(?:[.,]\d+)*/g, '#')));
  function rememberPaper(n, parts) {
    const sn = seenOf(n);
    for (const part of parts) for (const it of part.items) {
      sn.q.push(qSig(it.q));
      const k = kindSig(it.lessonId, it.q);
      sn.s[k] = (sn.s[k] || 0) + 1;
    }
    if (sn.q.length > SEEN_Q_MAX) sn.q = sn.q.slice(-SEEN_Q_MAX);
    const keys = Object.keys(sn.s);
    if (keys.length > SEEN_KIND_MAX) for (const k of keys) { sn.s[k] = Math.floor(sn.s[k] / 2); if (!sn.s[k]) delete sn.s[k]; }
    save();
  }

  // Build one paper from a blueprint. The ma trận stays (parts, points, mức); each slot takes a lesson from its
  // pool and, among a few candidates, the question the child has met least. opts.seed makes each attempt a new
  // paper; opts.mode 'nc' (Đề nâng cao) moves every slot except "Đặt tính rồi tính" one mức up.
  function buildPaper(bp, no, opts) {
    opts = opts || {};
    const mode = examMode(opts.mode);
    const rng = U.makeRng(strHash(String(opts.seed != null ? opts.seed : examKey(bp.grade, bp.term, no, mode) + '#paper')));
    const g = gradeOf(bp.grade);
    const scope = new Set(bp.lessonIds || (g ? scopeLessons(g, bp.term).map(l => l.id) : []));
    const sn = opts.memory === false ? { q: [], s: {} } : seenOf(bp.grade);
    const metQ = new Set(sn.q);
    const seen = new Set(), used = new Map();
    const parts = [];
    for (const part of bp.parts) {
      const isTN = /TRẮC NGHIỆM/i.test(part.title);
      let items = [];
      for (const it of part.items) {
        const pool = slotPool(bp, it, scope);
        const lv = Math.min(3, (it.level || 2) + (mode === 'nc' && it.label !== DT_LABEL ? 1 : 0));
        let best = null, valid = 0;
        for (let tries = 0; tries < 16 && valid < 6; tries++) {
          // mostly the blueprint's own lesson, often a neighbour of the same chủ đề, now and then (trắc nghiệm
          // only) another lesson of the kì
          const r = rng();
          const src = isTN && pool.wide.length && r < 0.18 ? pool.wide
            : pool.extra.length && (r < 0.58 || !pool.base.length) ? pool.extra
            : pool.base.length ? pool.base : pool.extra.length ? pool.extra : pool.wide;
          const fromExtra = src !== pool.base;
          const id = src.length ? U.pick(rng, src) : null;
          const rec = id && LESSONS.get(id);
          if (!rec) continue;
          const L = rec.lesson;
          const qr = U.makeRng(Math.floor(rng() * 4294967295));
          const i = lv === 1 ? U.rand(qr, 0, 3) : lv === 2 ? U.rand(qr, 4, 6) : U.rand(qr, 7, 9);
          let q;
          try { q = tidyQuestion(typeof L.exam === 'function' ? L.exam(qr, lv) : L.gen(qr, i)); } catch (e) { console.error('exam gen', id, e); continue; }
          if (!q || !q.prompt || !q.answer || seen.has(qId(q))) continue;
          if (q.answer.kind === 'visual' && !HAS_V) continue;
          valid++;
          let answer = q.answer;
          // a trắc nghiệm slot always offers A B C D, also for a question borrowed from a neighbouring lesson
          if (it.form === 'choice' || (fromExtra && isTN)) answer = choiceFromAnswer(qr, q) || q.answer;
          const cost = (metQ.has(qSig(q)) ? 1e6 : 0) + (sn.s[kindSig(id, q)] || 0) * 100 + (used.get(id) || 0) * 40 + rng();
          if (!best || cost < best.cost) best = { cost, q, answer, id };
          if (cost < 1) break;   // a kind of question never met, from a lesson not yet in this paper
        }
        // A small chủ đề can run out of new questions at one mức: then take one at any mức rather than drop the slot
        for (let tries = 0; tries < 40 && !best; tries++) {
          const src = pool.base.length ? pool.base : pool.extra.length ? pool.extra : pool.wide;
          const id = src.length ? U.pick(rng, src) : null;
          const rec = id && LESSONS.get(id);
          if (!rec) break;
          const L = rec.lesson, qr = U.makeRng(Math.floor(rng() * 4294967295));
          let q;
          try { q = tidyQuestion(typeof L.exam === 'function' && tries % 2 === 0 ? L.exam(qr, U.rand(qr, 1, 3)) : L.gen(qr, U.rand(qr, 0, 9))); } catch (e) { continue; }
          if (!q || !q.prompt || !q.answer || seen.has(qId(q)) || (q.answer.kind === 'visual' && !HAS_V)) continue;
          best = { cost: 0, q, answer: it.form === 'choice' ? choiceFromAnswer(qr, q) || q.answer : q.answer, id };
        }
        if (best) {
          seen.add(qId(best.q)); used.set(best.id, (used.get(best.id) || 0) + 1);
          items.push({ q: best.q, answer: best.answer, points: it.points || 1, level: lv, label: it.label || '', lessonId: best.id });
        }
      }
      if (isTN) items = U.shuffle(rng, items);   // the order of the trắc nghiệm questions changes too
      parts.push({ title: part.title, note: part.note || '', items });
    }
    let num = 0;
    for (const part of parts) for (const it of part.items) it.no = ++num;
    return parts;
  }
  const roundScore = x => Math.floor(x + 0.5);   // Thông tư 27: no decimal marks; 0,5 rounds up

  /* ---------- exam home: lớp → kì ---------- */
  function showExamHome() {
    stopSpeech();
    const mode = examMode(S.settings.examMode);
    // Đề thường ⇄ Đề nâng cao: chosen here first, then the child picks lớp and kì (user's rule); remembered
    const swap = h('div', { class: 'col-mode exam-mode' }, ...['thuong', 'nc'].map(m => h('button', {
      class: 'cm-btn' + (m === mode ? ' on' : ''),
      onclick: () => { if (m === mode) return; sfx.tap(); S.settings.examMode = m; save(); showExamHome(); },
    }, (m === 'nc' ? '🚀 ' : '📝 ') + MODE_NAME[m])));
    const wrap = h('div', { class: 'scroll' });
    const grid = h('div', { class: 'exam-grades' });
    for (const n of [1, 2, 3, 4, 5]) {
      const g = gradeOf(n), info = GRADE_INFO[n];
      const terms = h('div', { class: 'exam-terms' });
      for (const term of termsFor(n)) {
        const bp = g ? blueprintFor(n, term) : null;
        const best = bp ? examRecord(n, term, mode).best : -1;
        const nQ = bp ? bp.parts.reduce((t, part) => t + part.items.length, 0) : 0;
        // one tap on the kì → the start panel → a new paper (no list of papers)
        terms.append(h('button', { class: 'exam-term' + (bp ? '' : ' soon'), onclick: e => { sfx.tap(); if (!bp) return toast(`Đề lớp ${n} đang được soạn…`); peekThen(e.currentTarget.closest('.exam-grade'), () => confirmStart(n, term), 'Cố lên nào!'); } },
          h('span', { class: 'et-name' }, TERMS[term].name),
          h('span', { class: 'et-best' }, bp ? (best >= 0 ? `Cao nhất: ${best} điểm` : `${nQ} câu · ${bp.minutes} phút`) : 'Sắp có')));
      }
      if (g) {
        const tps = g.topics.filter(t => t.lessons.length && topicCode(t));
        const bestT = Math.max(-1, ...tps.map(t => examRecord(n, 'cd-' + topicCode(t), mode).best));
        terms.append(h('button', { class: 'exam-term wide', onclick: e => { sfx.tap(); peekThen(e.currentTarget.closest('.exam-grade'), () => showTopicList(n), 'Cố lên nào!'); } },
          h('span', { class: 'et-name' }, '📚 Ôn tập theo chủ đề'),
          h('span', { class: 'et-best' }, bestT >= 0 ? `Cao nhất: ${bestT} điểm` : `${tps.length} chủ đề`)));
      }
      grid.append(h('section', { class: 'card exam-grade', 'data-peek': `Lớp ${n} nè!`, 'data-say': `Bé ơi, đề lớp ${n} nè!`, style: { '--gc': info.color } },
        h('div', { class: 'topic-head' }, h('div', { class: 'topic-icon' }, info.icon), h('div', null, h('div', { class: 'topic-title' }, 'Lớp ' + n), h('div', { class: 'topic-meta' }, n >= 4 ? 'Giữa kì, cuối kì và ôn tập theo chủ đề' : 'Cuối học kì I, cuối năm và ôn tập theo chủ đề'))),
        terms));
    }
    wrap.append(h('div', { class: 'exam-intro' }, h('div', { class: 'mini-mascot' }, mascot('happy')),
      h('div', null, h('b', null, 'Ôn tập & Kiểm tra'), h('div', null, 'Đề kiểm tra định kì môn Toán theo mẫu đề của Bộ GD&ĐT (Thông tư 27): Phần I Trắc nghiệm, Phần II Tự luận, chấm thang điểm 10. Chọn đề thường hoặc đề nâng cao, rồi bấm vào một kì là có ngay một đề mới.'))),
      h('div', { class: 'exam-swap' }, swap), grid);
    screen(topbar('Ôn tập & Kiểm tra 📝', 'Chọn lớp và kì kiểm tra', homeBtn(), [coinPill(), parentBtn()]), wrap);
    Peek.bind(grid, '.exam-grade');
  }

  // Ôn tập theo chủ đề: one tile per chủ đề, in the order of the book; a tap opens the start panel
  function showTopicList(n) {
    stopSpeech();
    const g = gradeOf(n); if (!g) return showExamHome();
    const mode = examMode(S.settings.examMode);
    const info = GRADE_INFO[n];
    const sc = h('div', { class: 'scroll' });
    let k = 0;
    for (const sem of [1, 2]) {
      const list = h('div', { class: 'lessons exam-papers' });
      for (const t of topicsOf(g, sem)) {
        if (!t.lessons.length || !topicCode(t)) continue;
        k++;
        const term = 'cd-' + topicCode(t), rec = examRecord(n, term, mode);
        list.append(h('button', { class: 'lesson-tile' + (rec.best >= 0 ? ' done' : ''), onclick: () => { sfx.tap(); confirmStart(n, term); } },
          h('div', { class: 'lb' }, `${t.icon || '📘'} Chủ đề ${k}`), h('div', { class: 'lt' }, t.title),
          h('div', { class: 'paper-score' }, rec.best >= 0 ? `Điểm cao nhất: ${rec.best}/10` : `${t.lessons.length} bài`)));
      }
      if (!list.children.length) continue;
      sc.append(h('section', { class: 'card topic', style: { '--gc': info.color } },
        h('div', { class: 'topic-head' }, h('div', { class: 'topic-icon' }, '📚'),
          h('div', null, h('div', { class: 'topic-title' }, `Học kì ${sem} · Lớp ${n}`),
            h('div', { class: 'topic-meta' }, `${mode === 'nc' ? 'Phiếu nâng cao' : 'Phiếu thường'} · bấm vào một chủ đề để làm phiếu 10 câu; mỗi lần là một phiếu mới`))),
        list));
    }
    screen(topbar(`Lớp ${n} · Ôn tập theo chủ đề`, `${mode === 'nc' ? 'Phiếu nâng cao' : 'Phiếu thường'} · chọn một chủ đề để ôn`, backBtn(showExamHome), [coinPill()]), sc);
  }

  // The start panel of a kì's paper or a chủ đề sheet, in the kind chosen on the Ôn tập & Kiểm tra screen.
  function confirmStart(n, term, mode) {
    const bp = blueprintFor(n, term); if (!bp) return;
    mode = examMode(mode || S.settings.examMode);
    const nQ = bp.parts.reduce((t, part) => t + part.items.length, 0);
    const kind = m => (bp.sheet ? (m === 'nc' ? 'Phiếu nâng cao' : 'Phiếu thường') : MODE_NAME[m]);
    const rec = examRecord(n, term, mode);
    const sh = sheet(
      h('h2', null, `${bp.sheet ? '📚' : '📝'} ${termName(n, term)}`),
      h('p', { style: { fontSize: '19px', fontWeight: 600 } }, `${bp.sheet ? 'Phiếu ôn tập' : 'Đề kiểm tra'} · Lớp ${n} · ${nQ} câu · ${bp.minutes} phút`),
      h('div', { class: 'exam-kind' + (mode === 'nc' ? ' nc' : '') }, (mode === 'nc' ? '🚀 ' : '📝 ') + kind(mode)),
      h('p', null, (mode === 'nc' ? 'Đề nâng cao có nhiều câu vận dụng hơn. ' : '') + `Mỗi lần làm là một ${bp.sheet ? 'phiếu' : 'đề'} mới: ISA xáo câu hỏi trong nội dung ${bp.sheet ? 'của chủ đề' : 'của kì này'} và tránh những câu bé đã gặp.`),
      rec.best >= 0 ? h('p', { class: 'exam-rec' }, `Điểm cao nhất: ${rec.best}/10 · đã làm ${rec.tries} lần`) : null,
      h('p', null, 'Bé đọc kĩ từng câu, làm xong hết thì bấm "Nộp bài". Đồng hồ sẽ đếm ngược, hết giờ bài tự nộp.'),
      h('div', { class: 'result-actions', style: { marginTop: '14px' } },
        h('button', { class: 'btn ghost small', onclick: () => sh.close() }, 'Để sau'),
        h('button', { class: 'btn', onclick: () => { sh.close(); startExam(n, term, 1, mode); } }, 'Bắt đầu làm bài ✏️')));
  }

  /* ---------- the paper ---------- */
  let examTimer = null;
  function startExam(n, term, no, mode, seed) {
    stopSpeech(); clearInterval(examTimer);
    mode = examMode(mode);
    const bp = blueprintFor(n, term);
    // every attempt is a new paper; the questions it shows are remembered so later papers avoid them
    no = 1;   // one mark record per kì and kind
    const parts = buildPaper(bp, no, { mode, seed: seed != null ? seed : `${examKey(n, term, no, mode)}#${Date.now()}#${Math.random()}` });
    rememberPaper(n, parts);
    const all = parts.flatMap(p => p.items);
    const total = all.reduce((s, it) => s + it.points, 0);
    const t0 = Date.now(), limit = (bp.minutes || 40) * 60000;
    let submitted = false;

    const clock = h('div', { class: 'pill exam-clock' }, '⏱ ', h('span', null, fmtTime(limit)));
    const submitBtn = h('button', { class: 'btn small' }, 'Nộp bài ✓');
    const scoreBox = h('div', { class: 'ep-score' }, h('div', { class: 'ep-lbl' }, 'Điểm'), h('div', { class: 'ep-num' }, ''));
    const commentBox = h('div', { class: 'ep-comment' }, h('div', { class: 'ep-lbl' }, 'Nhận xét của giáo viên'), h('div', { class: 'ep-cmt' }, ''));
    const paper = h('div', { class: 'exam-paper' },
      h('div', { class: 'ep-head' },
        h('div', { class: 'ep-school' }, h('div', null, 'TRƯỜNG TIỂU HỌC ISA'), h('div', null, 'Họ và tên: ................'), h('div', null, `Lớp: ${n}`)),
        h('div', { class: 'ep-title' }, h('div', { class: 'ep-t1' }, bp.title || TERMS[term].title), bp.sheet ? h('div', { class: 'ep-t2' }, termName(n, term)) : null, h('div', null, `NĂM HỌC ${schoolYear()}`),
          h('div', { class: 'ep-t2' }, `Môn: Toán – Lớp ${n}`), h('div', { class: 'ep-t3' }, `Thời gian làm bài: ${bp.minutes} phút` + (mode === 'nc' ? ' · Nâng cao' : '')))),
      h('div', { class: 'ep-boxes' }, scoreBox, commentBox));

    const states = [];
    for (const part of parts) {
      const pts = part.items.reduce((s, it) => s + it.points, 0);
      paper.append(h('div', { class: 'ep-part' }, /điểm/i.test(part.title) ? part.title : `${part.title} (${U.fmt(pts)} điểm)`));
      if (part.note) paper.append(h('div', { class: 'ep-note' }, part.note));
      for (const it of part.items) states.push(renderItem(it, paper));
    }
    paper.append(h('div', { class: 'ep-end' }, '— HẾT —'));

    // bottom keypad shared by every "input" câu
    const pad = makeExamPad();

    function renderItem(it, host) {
      const A = it.answer, q = it.q;
      const st = { it, sel: null, input: '', fr: { num: '', den: '', part: 'num' }, vEl: null, el: null, mark: null };
      const head = h('div', { class: 'ep-q' }, h('b', null, `Câu ${it.no} `), h('span', { class: 'ep-pts' }, `(${U.fmt(it.points)} điểm)`), h('b', null, ': '),
        it.label && !q.prompt.toLowerCase().startsWith(it.label.toLowerCase().replace(/[.:]\s*$/, '')) ? h('span', { class: 'ep-label' }, it.label + '. ') : null, h('span', { class: 'ep-prompt' }, q.prompt));
      const box = h('div', { class: 'ep-item' }, head);
      if (q.visual) {
        st.vEl = viz(q.visual, { size: 'md', theme: 'paper', interactive: A.kind === 'visual' });
        if (st.vEl) box.append(h('div', { class: 'ep-viz' }, st.vEl));
      }
      const ans = h('div', { class: 'ep-ans' });
      if (A.kind === 'choice' || A.kind === 'text') {
        const letters = 'ABCDEF';
        A.options.forEach((o, k) => {
          const b = h('button', { class: 'ep-opt' }, h('span', { class: 'ep-letter' }, letters[k] + '.'), h('span', null, ' ' + o));
          b.onclick = () => { if (submitted) return; sfx.tap(); st.sel = k; ans.querySelectorAll('.ep-opt').forEach(x => x.classList.toggle('on', x === b)); };
          ans.append(b);
        });
      } else if (A.kind === 'number' || A.kind === 'fraction') {
        const slot = h('button', { class: 'ep-slot empty' }, '…………');
        slot.onclick = () => { if (!submitted) pad.open(st, slot); };
        st.slot = slot;
        ans.append(h('span', { class: 'ep-say' }, 'Trả lời: '), slot);
        if (A.unit) ans.append(h('span', { class: 'ep-unit' }, A.unit));
      } else if (A.kind === 'visual') {
        ans.append(h('span', { class: 'ep-say' }, 'Bé làm trực tiếp trên hình.'));
      }
      box.append(ans);
      st.el = box;
      host.append(box);
      return st;
    }

    function isAnswered(st) {
      const A = st.it.answer;
      if (A.kind === 'choice' || A.kind === 'text') return st.sel != null;
      if (A.kind === 'number') return st.input !== '';
      if (A.kind === 'fraction') return st.fr.num !== '' && st.fr.den !== '';
      return true;
    }
    function isRight(st) {
      const A = st.it.answer;
      if (A.kind === 'choice' || A.kind === 'text') return st.sel === A.correct;
      if (A.kind === 'number') return Math.abs(U.parseNum(st.input) - A.value) < 1e-9;
      if (A.kind === 'fraction') {
        const a = Number(st.fr.num), b = Number(st.fr.den);
        let ok = b > 0 && Math.abs(a / b - A.num / A.den) < 1e-9;
        if (ok && A.simplest) ok = U.gcd(a, b) === 1;
        return ok;
      }
      if (A.kind === 'visual') { try { return !!A.check(st.vEl && st.vEl.getValue ? st.vEl.getValue() : undefined); } catch (e) { return false; } }
      return false;
    }
    function correctText(A) {
      if (A.kind === 'choice' || A.kind === 'text') return 'ABCDEF'[A.correct] + '. ' + A.options[A.correct];
      if (A.kind === 'number') return U.fmt(A.value) + (A.unit ? ' ' + A.unit : '');
      if (A.kind === 'fraction') return `${A.num}/${A.den}`;
      return '';
    }

    function submit(auto) {
      if (submitted) return;
      submitted = true; clearInterval(examTimer); pad.close();
      let got = 0;
      for (const st of states) {
        const ok = isRight(st);
        if (ok) got += st.it.points;
        st.el.classList.add(ok ? 'right' : 'wrong');
        const A = st.it.answer;
        if (A.kind === 'choice' || A.kind === 'text') {
          const opts = st.el.querySelectorAll('.ep-opt');
          if (opts[A.correct]) opts[A.correct].classList.add('correct');
          if (st.sel != null && st.sel !== A.correct && opts[st.sel]) opts[st.sel].classList.add('miss');
        }
        st.el.append(h('div', { class: 'ep-review ' + (ok ? 'ok' : 'no') },
          h('b', null, ok ? `✓ Đúng · +${U.fmt(st.it.points)} điểm` : `✗ Chưa đúng · 0 điểm`),
          !ok && correctText(A) ? h('div', null, 'Đáp án: ' + correctText(A)) : null,
          st.it.q.explain ? h('div', { class: 'ep-explain' }, st.it.q.explain) : null));
      }
      const raw = U.round(got * 10 / (total || 10), 2);
      const final = roundScore(raw);
      scoreBox.querySelector('.ep-num').textContent = final;
      const cmt = final >= 9 ? 'Hoàn thành tốt, bé làm rất tốt!' : final >= 7 ? 'Bài làm tốt, cố gắng thêm chút nữa nhé.' : final >= 5 ? 'Hoàn thành. Bé xem lại các câu sai nhé.' : 'Bé ôn lại các bài sau rồi làm lại đề nhé.';
      commentBox.querySelector('.ep-cmt').textContent = cmt;
      const key = examKey(n, term, no, mode);
      const prev = S.exams[key] || {};
      S.exams[key] = { best: Math.max(prev.best ?? 0, final), last: final, raw, at: Date.now(), tries: (prev.tries || 0) + 1 };
      S.coins += final; S.totals.seconds += Math.round((Date.now() - t0) / 1000);
      save();
      if (final >= 9) { sfx.win(); confetti(110); } else sfx.good();
      const cheer = cheerFor(final);
      setTimeout(() => speak(cheer), 600);   // after the result sound
      // weak lessons from this paper → quick links to practise
      const weak = [...new Set(states.filter(st => st.el.classList.contains('wrong')).map(st => st.it.lessonId))].map(id => LESSONS.get(id)).filter(Boolean);
      const summary = h('div', { class: 'card exam-summary' },
        h('div', { class: 'mini-mascot' }, mascot(final >= 7 ? 'cheer' : 'think')),
        h('div', { class: 'es-body' },
          h('div', { class: 'es-score' }, `${final}`, h('small', null, '/10 điểm')),
          h('div', { class: 'es-cheer' }, cheer),
          h('div', null, auto ? 'Hết giờ, bài đã tự nộp. ' : '', `${cmt} (đúng ${U.fmt(got)}/${U.fmt(total)} điểm` + (raw !== final ? `, làm tròn ${U.fmt(raw)} → ${final}` : '') + `) · +${final} ⭐`),
          weak.length ? h('div', { class: 'es-weak' }, 'Nên ôn lại: ', ...weak.slice(0, 4).map(r => h('button', { class: 'chip', onclick: () => { sfx.tap(); startLesson(r.lesson.id); } }, `${r.lesson.book || ''} ${r.lesson.title}`))) : null,
          h('div', { class: 'result-actions', style: { justifyContent: 'flex-start' } },
            h('button', { class: 'btn small', onclick: () => { sfx.tap(); startExam(n, term, 1, mode); } }, bp.sheet ? '↻ Làm phiếu mới' : '↻ Làm đề mới'),
            h('button', { class: 'btn ghost small', onclick: () => { sfx.tap(); backToList(n, term); } }, bp.sheet ? 'Chọn chủ đề khác' : 'Về Ôn tập & Kiểm tra'))));
      sc.prepend(summary);
      sc.scrollTo({ top: 0, behavior: 'smooth' });
      submitBtn.style.display = 'none';
      clock.querySelector('span').textContent = fmtTime(Date.now() - t0);
      clock.firstChild.textContent = '⏱ đã làm ';
    }

    submitBtn.onclick = () => {
      const left = states.filter(st => !isAnswered(st)).length;
      if (!left) return submit(false);
      const sh = sheet(h('h2', null, 'Nộp bài?'), h('p', { style: { fontSize: '19px' } }, `Bé còn ${left} câu chưa làm. Bé muốn nộp bài luôn không?`),
        h('div', { class: 'result-actions', style: { marginTop: '14px' } },
          h('button', { class: 'btn ghost small', onclick: () => sh.close() }, 'Làm tiếp'),
          h('button', { class: 'btn small', onclick: () => { sh.close(); submit(false); } }, 'Nộp bài')));
    };
    const quit = () => {
      if (submitted) { clearInterval(examTimer); pad.close(); return backToList(n, term); }
      const sh = sheet(h('h2', null, 'Thoát bài kiểm tra?'), h('p', { style: { fontSize: '19px' } }, 'Bài làm sẽ không được lưu.'),
        h('div', { class: 'result-actions', style: { marginTop: '14px' } },
          h('button', { class: 'btn ghost small', onclick: () => sh.close() }, 'Làm tiếp'),
          h('button', { class: 'btn small', onclick: () => { sh.close(); clearInterval(examTimer); pad.close(); backToList(n, term); } }, 'Thoát')));
    };
    const sc = h('div', { class: 'scroll exam-scroll' }, paper);
    screen(topbar(`Lớp ${n} · ${termName(n, term)}`, paperName(no, mode, term), backBtn(quit), [clock, submitBtn]), sc);
    if (window.Scratch) Scratch.attach('exam:' + t0);   // giấy nháp for this sitting
    examTimer = setInterval(() => {
      const left = limit - (Date.now() - t0);
      clock.querySelector('span').textContent = fmtTime(Math.max(0, left));
      clock.classList.toggle('warn', left < 5 * 60000);
      if (left <= 0) submit(true);
    }, 1000);
  }

  // Bottom number pad for the exam's "Trả lời: ……" slots.
  function makeExamPad() {
    let st = null, slot = null;
    const disp = h('div', { class: 'display' });
    const keysEl = h('div', { class: 'keypad' });
    const panel = h('div', { class: 'exam-pad card' }, h('div', { class: 'ep-pad-row' }, disp, h('button', { class: 'btn small teal', onclick: () => close() }, 'Xong')), keysEl);
    panel.hidden = true;
    document.body.append(panel);
    function show() {
      const A = st.it.answer;
      disp.innerHTML = '';
      if (A.kind === 'fraction') {
        const nu = h('span', { class: st.fr.part === 'num' ? 'act' : '' }, st.fr.num || '?'), de = h('span', { class: st.fr.part === 'den' ? 'act' : '' }, st.fr.den || '?');
        nu.onclick = () => { st.fr.part = 'num'; show(); }; de.onclick = () => { st.fr.part = 'den'; show(); };
        disp.append(h('span', { class: 'frac-display' }, nu, h('hr'), de));
        slot.textContent = st.fr.num || st.fr.den ? `${st.fr.num || '?'}/${st.fr.den || '?'}` : '…………';
      } else {
        disp.append(st.input ? prettyInput(st.input) : h('span', { class: 'ph' }, '?'));
        if (A.unit) disp.append(h('span', { class: 'unit' }, A.unit));
        slot.textContent = st.input ? prettyInput(st.input) : '…………';
      }
      slot.classList.toggle('empty', slot.textContent === '…………');
    }
    function build() {
      const isFr = st.it.answer.kind === 'fraction';
      keysEl.innerHTML = '';
      for (const k of ['7', '8', '9', '4', '5', '6', '1', '2', '3', isFr ? '⇅' : ',', '0', '⌫']) {
        keysEl.append(h('button', { class: 'key' + (k === '⌫' || k === '⇅' || k === ',' ? ' fn' : ''), onclick: () => {
          sfx.tap();
          if (isFr) {
            if (k === '⇅') st.fr.part = st.fr.part === 'num' ? 'den' : 'num';
            else if (k === '⌫') st.fr[st.fr.part] = st.fr[st.fr.part].slice(0, -1);
            else if (st.fr[st.fr.part].length < 4) st.fr[st.fr.part] += k;
          } else if (k === '⌫') st.input = st.input.slice(0, -1);
          else if (k === ',') { if (!st.input.includes(',')) st.input = (st.input || '0') + ','; }
          else if (st.input.replace(',', '').length < 9) st.input = (st.input === '0' ? '' : st.input) + k;
          show();
        } }, k === '⇅' ? 'Tử/Mẫu' : k));
      }
    }
    function open(s, sl) {
      if (slot) slot.classList.remove('editing');
      st = s; slot = sl; slot.classList.add('editing');
      build(); show(); panel.hidden = false;
      setTimeout(() => slot.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
    }
    function close() { panel.hidden = true; if (slot) slot.classList.remove('editing'); }
    return { open, close, remove: () => panel.remove() };
  }

  /* ------------------------------------------------------------------ boot */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline cache unavailable */ });
  }
  // Allow deep link for testing: #lesson=<id> or #grade=<n>
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('lesson') && LESSONS.has(hash.get('lesson'))) { startLesson(hash.get('lesson')); }
  else if (hash.get('practice') && LESSONS.has(hash.get('practice'))) { showPractice(LESSONS.get(hash.get('practice')), Number(hash.get('q')) || 0); }
  else if (hash.get('exam')) { const [gn, t1, t2, a, b] = hash.get('exam').split('-'); startExam(Number(gn), t1 + '-' + t2, Number(a === 'nc' ? b : a) || 1, a === 'nc' ? 'nc' : 'thuong'); }
  else if (hash.get('exams') != null) { showExamHome(); }
  else if (hash.get('grade') && gradeOf(Number(hash.get('grade')))) { showMap(Number(hash.get('grade')), Number(hash.get('hk')) || 1); }
  else showHome();

  window.ToanISA = { state: () => S, startLesson, showHome, showMap, showExamHome, startExam, buildPaper, blueprintFor, rememberPaper, slotPool, scopeLessons, showTopicList };
})();
