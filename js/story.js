/* Toán ISA — "Chuyện kể Toán học": a flip book of short stories from the history of mathematics (user, 2026-11-23:
 * "1 thẻ animation về lịch sử toán học kiểu lật sách tò mò cho các em thích học toán tìm hiểu").
 * Renamed "Lịch sử Toán học" (v61); book frame, corner-curl turns, a speaker on every page and text that fits its
 * page on a tablet (v62–v63); on a phone one page at a time, two columns when held sideways (v64).
 * Content: js/content/lichsu.js (window.STORIES). Each story is one spread: a moving picture on the left page, the
 * story, a "Đố em" question and a link to the lesson on the right page. Pages turn with a 3D flip (tap the arrows,
 * swipe, or the ← → keys). API: Story.open(api) — api gives the app's own helpers (h, screen, topbar, speak…).
 */
(function () {
  'use strict';
  const L = U.L;
  const CSS = `
.bk-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px; padding: 0 18px calc(14px + var(--safe-b, 0px)); }
/* a real-looking book (user, 2026-11-24): a hard cover board behind the pages, a spine in the middle, a stack of
   paper edges on the outer sides and a deep shadow in the fold */
.bk-book { position: relative; flex: 1; min-height: 0; perspective: 2200px; margin: 12px 16px 20px; }
.bk-book::before { content: ''; position: absolute; inset: -12px -16px -20px; border-radius: 18px; background: linear-gradient(160deg, #13797A, #0C5A60 55%, #08454B);
  box-shadow: 0 16px 34px rgba(0, 30, 40, .38), inset 0 0 0 2px rgba(255, 255, 255, .14), inset 0 0 0 6px rgba(0, 0, 0, .08); }
.bk-book::after { content: ''; position: absolute; left: 50%; top: -12px; bottom: -20px; width: 18px; transform: translateX(-50%); border-radius: 4px;
  background: linear-gradient(90deg, #063A40, #0E6064 50%, #063A40); }
.bk-spread { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; z-index: 1; }
.bk-page { position: relative; min-width: 0; min-height: 0; background: #FFFDF7; overflow: hidden; display: flex; flex-direction: column; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.bk-l { border-radius: 10px 2px 2px 10px; transform-origin: right center;
  box-shadow: inset -34px 0 30px -26px rgba(90, 60, 20, .42), -1px 1px 0 #E3D5B6, -3px 3px 0 #FBF5E6, -4px 4px 0 #DED0B0, -6px 6px 0 #F8F0DD, -7px 7px 0 #D2C19C, -8px 9px 12px rgba(0, 20, 30, .25); }
.bk-r { border-radius: 2px 10px 10px 2px; transform-origin: left center;
  box-shadow: inset 34px 0 30px -26px rgba(90, 60, 20, .42), 1px 1px 0 #E3D5B6, 3px 3px 0 #FBF5E6, 4px 4px 0 #DED0B0, 6px 6px 0 #F8F0DD, 7px 7px 0 #D2C19C, 8px 9px 12px rgba(0, 20, 30, .25); }
.bk-l { background: linear-gradient(90deg, #FBF3DF, #FFFDF7 18%, #FFFDF7 82%, #EADCBC); }
.bk-r { background: linear-gradient(270deg, #FBF3DF, #FFFDF7 18%, #FFFDF7 82%, #EADCBC); }
/* turning forward: the right page lifts to the spine, then the new left page comes down from it */
.bk-spread.out-next { z-index: 2; pointer-events: none; }
/* a turn (user, 2026-11-24 "lật cái góc trang giấy"): first the bottom corner of the page curls up — the page is cut
   along a fold line and its back (.bk-curl) lies over it, showing the next page underneath — then the page swings
   over. --c (the curl size) is set on the page from its own size. */
.bk-spread.out-next .bk-r { animation: bkOutR .95s ease-in-out forwards, bkCutR .95s ease-out forwards; }
.bk-spread.out-next .bk-l { animation: bkHide .95s linear forwards; }
.bk-spread.in-next .bk-l { animation: bkInL .95s ease-out both; }
.bk-spread.out-prev { z-index: 2; pointer-events: none; }
.bk-spread.out-prev .bk-l { animation: bkOutL .95s ease-in-out forwards, bkCutL .95s ease-out forwards; }
.bk-spread.out-prev .bk-r { animation: bkHide .95s linear forwards; }
.bk-spread.in-prev .bk-r { animation: bkInR .95s ease-out both; }
@keyframes bkOutR { 0%, 34% { transform: rotateY(0); } 68%, 100% { transform: rotateY(-90deg); } }
@keyframes bkOutL { 0%, 34% { transform: rotateY(0); } 68%, 100% { transform: rotateY(90deg); } }
@keyframes bkInL { 0%, 68% { transform: rotateY(90deg); } 100% { transform: rotateY(0); } }
@keyframes bkInR { 0%, 68% { transform: rotateY(-90deg); } 100% { transform: rotateY(0); } }
@keyframes bkHide { 0%, 67% { opacity: 1; } 68%, 100% { opacity: 0; } }
@keyframes bkCutR {
  0% { -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 100%); clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 100%); }
  34%, 100% { -webkit-clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--c)), calc(100% - var(--c)) 100%, 0 100%); clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--c)), calc(100% - var(--c)) 100%, 0 100%); } }
@keyframes bkCutL {
  0% { -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 100%); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 100%); }
  34%, 100% { -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, var(--c) 100%, 0 calc(100% - var(--c))); clip-path: polygon(0 0, 100% 0, 100% 100%, var(--c) 100%, 0 calc(100% - var(--c))); } }
.bk-curl { position: absolute; bottom: 0; width: 0; height: 0; z-index: 6; pointer-events: none; filter: drop-shadow(-3px -3px 5px rgba(60, 40, 10, .3)); animation: bkCurl .95s ease-out forwards; }
.bk-curl i { position: absolute; inset: 0; }
.bk-curl.r { right: 0; }
.bk-curl.r i { -webkit-clip-path: polygon(100% 0, 0 100%, 0 0); clip-path: polygon(100% 0, 0 100%, 0 0); background: linear-gradient(135deg, #FFFFFF 4%, #F6EEDA 30%, #E2D2AC 47%, #C9B386 50%); }
.bk-curl.l { left: 0; filter: drop-shadow(3px -3px 5px rgba(60, 40, 10, .3)); }
.bk-curl.l i { -webkit-clip-path: polygon(0 0, 100% 100%, 100% 0); clip-path: polygon(0 0, 100% 100%, 100% 0); background: linear-gradient(225deg, #FFFFFF 4%, #F6EEDA 30%, #E2D2AC 47%, #C9B386 50%); }
@keyframes bkCurl { 0% { width: 0; height: 0; } 34%, 100% { width: var(--c); height: var(--c); } }
/* a small dog-ear on the outer bottom corner of a paper page: it wiggles now and then, a tap turns the page */
.bk-ear { position: absolute; bottom: 0; width: 38px; height: 38px; z-index: 4; border: 0; padding: 0; cursor: pointer; animation: bkEar 4s ease-in-out infinite; }
.bk-ear.f { right: 0; transform-origin: right bottom; background: linear-gradient(to bottom right, #FFFFFF 0%, #F1E6CB 44%, #C9B386 50%, #E9DCBC 50%, #F5ECD6 100%); border-radius: 8px 0 8px 0; }
.bk-ear.b { left: 0; transform-origin: left bottom; background: linear-gradient(to bottom left, #FFFFFF 0%, #F1E6CB 44%, #C9B386 50%, #E9DCBC 50%, #F5ECD6 100%); border-radius: 0 8px 0 8px; }
@keyframes bkEar { 0%, 70%, 100% { transform: scale(1); } 80% { transform: scale(1.45); } 90% { transform: scale(1.1); } }
/* left page: the picture */
.bk-when { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; padding: 16px 18px 0 22px; }
.bk-chip { font: 800 14px var(--font, sans-serif); color: #7A5600; background: #FFF1C9; border-radius: 12px; padding: 5px 10px; }
.bk-chip.where { color: #0E6E6A; background: #DDF5F2; }
.bk-art { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 8px 18px 18px 22px; color: #1E3A4C; font: 800 18px var(--font, sans-serif); text-align: center; }
.bk-art > svg { max-width: 100%; max-height: 100%; }
.bk-art > div { transform-origin: center; }
.bk-art svg { width: 100%; height: 100%; max-height: 340px; overflow: visible; }
.bk-pageno { position: absolute; bottom: 8px; font: 700 13px var(--font, sans-serif); color: #B39B6B; }
.bk-l .bk-pageno { left: 50px; } .bk-r .bk-pageno { right: 50px; }
/* right page: the story */
.bk-text { --k: 1; flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 18px 24px 30px 22px; display: flex; flex-direction: column; gap: calc(10px * var(--k)); }
.bk-flow { display: flex; flex-direction: column; gap: calc(10px * var(--k)); }
.bk-title { display: flex; align-items: flex-start; gap: 10px; }
.bk-title h2 { flex: 1; margin: 0; font: 900 calc(25px * var(--k, 1))/1.2 var(--font, sans-serif); color: #C25412; }
.bk-say { flex: none; width: 46px; height: 46px; border: 0; border-radius: 50%; background: #E9F8F7; color: #0E8C88; font-size: 22px; display: grid; place-items: center; cursor: pointer; box-shadow: 0 3px 0 #BFE6E2; }
.bk-say.speaking { background: #0E8C88; color: #fff; }
.bk-text p { margin: 0; font: 600 calc(19px * var(--k))/1.45 var(--font, sans-serif); color: #1E3A4C; }
.bk-ask { margin-top: 4px; border-radius: 18px; background: #FFF6DB; padding: calc(12px * var(--k)) 14px; display: flex; flex-direction: column; gap: calc(8px * var(--k)); }
.bk-ask b { font: 900 calc(17px * var(--k)) var(--font, sans-serif); color: #7A5600; }
.bk-ask .q { font: 700 calc(18px * var(--k))/1.4 var(--font, sans-serif); color: #1E3A4C; }
.bk-ask .a { font: 700 calc(18px * var(--k))/1.4 var(--font, sans-serif); color: #13693E; background: #E3F7EC; border-radius: 12px; padding: 8px 10px; animation: bkPop .35s ease both; }
.bk-row { display: flex; flex-wrap: wrap; gap: 8px; }
@keyframes bkPop { from { transform: scale(.85); opacity: 0; } to { transform: none; opacity: 1; } }
/* cover and contents */
.bk-cover { align-items: center; justify-content: center; text-align: center; gap: 12px; padding: 22px; color: #fff; background: linear-gradient(150deg, #12A39E, #0C7C8A 60%, #0B6477); }
.bk-cover.bk-l { box-shadow: inset -18px 0 26px -18px rgba(0, 0, 0, .4), 0 8px 22px rgba(0, 40, 50, .22); }
.bk-cover .big { font-size: 84px; line-height: 1; animation: bkFloat 3.2s ease-in-out infinite; }
.bk-cover h2 { margin: 0; font: 900 32px/1.15 var(--font, sans-serif); }
.bk-cover p { margin: 0; font: 600 17px/1.45 var(--font, sans-serif); opacity: .95; max-width: 360px; }
@keyframes bkFloat { 50% { transform: translateY(-8px) rotate(-4deg); } }
.bk-cover.cv { padding: 18px 16px; justify-content: stretch; background: radial-gradient(circle at 30% 18%, #22505F, #14323F 55%, #0C232D); }
.cv-grid { flex: 1; min-height: 0; width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr);
  grid-template-areas: "a b c" "t t t" "d e f"; gap: 12px 8px; }
.cv-a { grid-area: a; } .cv-b { grid-area: b; } .cv-c { grid-area: c; } .cv-d { grid-area: d; } .cv-e { grid-area: e; } .cv-f { grid-area: f; }
.cv-v { min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 6px 4px; border: 0; border-radius: 16px; background: none; color: #fff; cursor: pointer; }
.cv-v:active { background: rgba(255, 255, 255, .1); }
.cv-v svg { flex: 0 1 auto; width: 100%; max-width: 128px; min-height: 0; max-height: 100%; overflow: visible; }
.cv-v span { font: 800 11.5px/1.25 var(--font, sans-serif); letter-spacing: .6px; text-transform: uppercase; text-align: center; opacity: .92; }
.cv-t { grid-area: t; text-align: center; padding: 10px 4px 12px; border-top: 2px solid rgba(255, 255, 255, .6); border-bottom: 2px solid rgba(255, 255, 255, .6); }
.cv-t small { display: block; font: 800 12px var(--font, sans-serif); letter-spacing: 3px; text-transform: uppercase; color: #5CE4D3; }
.bk-cover .cv-t h2 { margin: 4px 0 2px; font: 900 46px/1 var(--font, sans-serif); letter-spacing: 1px; text-transform: uppercase; }
.cv-t h2 b { display: block; font-size: 24px; letter-spacing: 7px; color: #FFD27A; margin-bottom: 2px; }
.bk-cover .cv-t p { margin: 6px auto 0; font: 700 14px/1.3 var(--font, sans-serif); opacity: .85; }
.cv-p1, .cv-p2, .cv-p3, .cv-p4 { animation: cvBlink 4s ease-in-out infinite; }
.cv-p2 { animation-delay: 1s; } .cv-p3 { animation-delay: 2s; } .cv-p4 { animation-delay: 3s; }
@keyframes cvBlink { 0%, 30%, 100% { opacity: 1; } 12% { opacity: .25; } }
.cv-sun { transform-box: fill-box; transform-origin: center; animation: bkSpin 10s linear infinite; }
.cv-shadow { animation: cvShadow 4s ease-in-out infinite; transform-box: fill-box; transform-origin: left center; }
@keyframes cvShadow { 0%, 100% { transform: scaleX(.4); } 50% { transform: scaleX(1); } }
.cv-bead { animation: cvBead 3s ease-in-out infinite; }
@keyframes cvBead { 0%, 15% { transform: translateX(0); } 45%, 75% { transform: translateX(18px); } 100% { transform: translateX(0); } }
.cv-dot { transform-box: fill-box; transform-origin: center; animation: cvDot 3s ease-in-out infinite; }
@keyframes cvDot { 0%, 60%, 100% { transform: scale(1); } 20% { transform: scale(1.35); } }
.ba-spin.cv-rev { animation-direction: reverse; }
/* contents: a plain list as in a printed book — number, title, a dotted leader and the page */
.bk-toc { display: flex; flex-direction: column; }
.bk-toc button { display: flex; align-items: center; gap: 6px; text-align: left; padding: 4px 2px; border: 0; border-radius: 6px; background: none; box-shadow: none; font: 700 16px/1.3 var(--font, sans-serif); color: #1E3A4C; min-height: 36px; cursor: pointer; }
.bk-toc button:active { background: rgba(244, 122, 42, .1); }
.bk-toc .no { flex: none; font-weight: 900; color: #C25412; min-width: 22px; }
.bk-toc .ic { font-size: 17px; flex: none; }
.bk-toc .t { flex: 0 1 auto; min-width: 0; }
.bk-toc .ok { color: #1E9E5A; font-weight: 900; }
.bk-toc .dots { flex: 1 1 14px; min-width: 14px; align-self: flex-end; margin-bottom: 9px; border-bottom: 2px dotted #CDBB90; }
.bk-toc .pg { flex: none; min-width: 22px; text-align: right; font-weight: 800; color: #9C8455; }
.bk-sub { margin: -4px 0 4px; font: 700 14px var(--font, sans-serif); color: #9C8455; }
.cv-t .bk-say { margin: 8px auto 0; width: auto; height: 38px; padding: 0 14px; gap: 6px; display: inline-flex; align-items: center; font: 800 14px var(--font, sans-serif); background: rgba(255, 255, 255, .16); color: #fff; }
.cv-t .bk-say.speaking { background: #F47A2A; }
.bk-when .bk-say { margin-left: auto; width: 40px; height: 40px; font-size: 19px; }
/* nav */
.bk-nav { display: flex; align-items: center; gap: 12px; }
.bk-nav .mid { flex: 1; text-align: center; color: #fff; font: 800 16px var(--font, sans-serif); }
.bk-nav .btn[disabled] { opacity: .35; }
/* pictures */
.ba-pop { animation: bkPop .45s ease both; }
.ba-tiles { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-items: stretch; }
.ba-tile { min-width: 74px; padding: 10px 8px; border-radius: 16px; background: #fff; box-shadow: inset 0 0 0 2px #EADFC6, 0 4px 0 #EADFC6; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ba-tile .s { font: 900 38px/1 var(--font, sans-serif); color: #C25412; min-height: 40px; display: grid; place-items: center; }
.ba-tile .s svg { width: 44px; height: 44px; }
.ba-tile .v { font: 800 15px var(--font, sans-serif); color: #5B7083; }
.ba-tiles.big .ba-tile { min-width: 84px; padding: 14px 10px; }
.ba-tiles.big .ba-tile .s { font-size: 52px; min-height: 56px; }
.ba-tiles.big .ba-tile .s svg { width: 56px; height: 56px; }
.ba-tiles.big .ba-tile .v { font-size: 18px; }
.ba-col { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.ba-note { font: 800 20px var(--font, sans-serif); color: #1E3A4C; }
.ba-big { font: 900 54px/1.1 var(--font, sans-serif); color: #1E3A4C; letter-spacing: 2px; }
.ba-glow { color: #F47A2A; display: inline-block; animation: bkGlow 1.6s ease-in-out infinite; }
@keyframes bkGlow { 50% { transform: scale(1.35); text-shadow: 0 0 18px rgba(244, 122, 42, .6); } }
.ba-wave span { display: inline-block; animation: bkWave 1.8s ease-in-out infinite; }
@keyframes bkWave { 50% { transform: translateY(-12px); color: #F47A2A; } }
.ba-draw { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: bkDraw 2.2s ease forwards; }
@keyframes bkDraw { to { stroke-dashoffset: 0; } }
.ba-spin { transform-box: fill-box; transform-origin: center; animation: bkSpin 6s linear infinite; }
@keyframes bkSpin { to { transform: rotate(360deg); } }
.ba-roll { animation: bkRoll 5s ease-in-out infinite; }
@keyframes bkRoll { 0%, 8% { transform: translateX(0) rotate(0); } 70%, 100% { transform: translateX(188.5px) rotate(360deg); } }
.ba-rollbar { transform-origin: left center; transform-box: fill-box; animation: bkRollBar 5s ease-in-out infinite; }
@keyframes bkRollBar { 0%, 8% { transform: scaleX(0); } 70%, 100% { transform: scaleX(1); } }
.ba-a { animation: bkAB 7s ease-in-out infinite; }
.ba-b { animation: bkAB 7s ease-in-out infinite; animation-delay: -3.5s; }
@keyframes bkAB { 0%, 42% { opacity: 1; } 50%, 92% { opacity: 0; } 100% { opacity: 1; } }
.ba-bob { animation: bkBob 3s ease-in-out infinite; }
@keyframes bkBob { 50% { transform: translateY(4px); } }
.ba-bead { animation: bkBead 3.6s ease-in-out infinite; }
@keyframes bkBead { 0%, 20% { transform: translateY(0); } 40%, 80% { transform: translateY(-46px); } 100% { transform: translateY(0); } }
.ba-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; width: min(100%, 360px); }
.ba-grid i { font: 800 18px var(--font, sans-serif); font-style: normal; border-radius: 10px; padding: 7px 0; background: #fff; box-shadow: inset 0 0 0 2px #EADFC6; transition: all .4s; }
.ba-grid i.out { opacity: .22; text-decoration: line-through; transform: scale(.85); }
.ba-grid i.prime { background: #FFE9A8; box-shadow: inset 0 0 0 2px #F4B400; color: #7A5600; transform: scale(1.08); }
.ba-dice { font-size: 64px; display: inline-block; animation: bkDice 2.4s ease-in-out infinite; }
.ba-dice + .ba-dice { animation-delay: -.8s; }
@keyframes bkDice { 0%, 100% { transform: rotate(-12deg) translateY(0); } 50% { transform: rotate(18deg) translateY(-14px); } }
.ba-mail { font-size: 40px; display: inline-block; animation: bkMail 3.4s ease-in-out infinite; }
@keyframes bkMail { 0%, 100% { transform: translateX(-70px); } 50% { transform: translateX(70px); } }
.ba-lamps { display: flex; gap: 14px; justify-content: center; }
.ba-lamp { width: 74px; padding: 10px 0; border-radius: 16px; background: #2B3A4A; color: #6B7C8F; font: 900 30px var(--font, sans-serif); transition: all .25s; }
.ba-lamp .l { font-size: 34px; filter: grayscale(1) brightness(.6); transition: all .25s; display: block; }
.ba-lamp.on { background: #FFF1C9; color: #C25412; box-shadow: 0 0 22px rgba(255, 201, 60, .8); }
.ba-lamp.on .l { filter: none; }
.ba-dog { animation: bkDog 6s ease-in-out infinite; }
@keyframes bkDog { 0%, 6% { transform: translateX(0); } 78%, 100% { transform: translateX(-270px); } }
.ba-hare { animation: bkHare 6s ease-in-out infinite; }
@keyframes bkHare { 0%, 6% { transform: translateX(0); } 78%, 100% { transform: translateX(-140px); } }
.ba-wheel { width: 66px; height: 78px; border-radius: 50% / 22%; background: #fff; box-shadow: inset 0 0 0 4px #B9793A, 0 4px 0 #7A4A22; font: 900 44px/78px var(--font, sans-serif); color: #1E3A4C; text-align: center; }
.ba-wheel.tick { animation: bkTick .4s ease; }
@keyframes bkTick { from { transform: translateY(-14px); opacity: .3; } }
@media (orientation: portrait), (max-width: 760px) {
  .bk-wrap { padding: 0 12px calc(10px + var(--safe-b, 0px)); }
  .bk-spread { grid-template-columns: 1fr; grid-template-rows: minmax(0, 38%) minmax(0, 1fr); gap: 8px; }
  .bk-book { margin: 8px 6px 14px; }
  .bk-book::before { inset: -8px -8px -14px; }
  .bk-book::after { display: none; }
  .bk-l, .bk-r { border-radius: 10px; transform-origin: center; box-shadow: 0 1px 0 #E3D5B6, 0 3px 0 #FBF5E6, 0 4px 0 #DED0B0, 0 6px 0 #F8F0DD, 0 7px 0 #D2C19C, 0 9px 12px rgba(0, 20, 30, .25); }
  .bk-l { background: #FFFDF7; } .bk-r { background: #FFFDF7; }
  .bk-spread.cover { grid-template-rows: minmax(0, 46%) minmax(0, 1fr); }
  /* a wide, short cover: the title in the middle, two drawings on each side */
  .bk-cover.cv { padding: 10px 12px; }
  .cv-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); grid-template-areas: "a t d" "b t e"; gap: 4px 8px; }
  .cv-c, .cv-f { display: none; }
  .cv-t { align-self: center; padding: 8px 2px; }
  .bk-cover .cv-t h2 { font-size: 36px; } .cv-t h2 b { font-size: 19px; letter-spacing: 5px; }
  .cv-v { gap: 3px; padding: 2px; } .cv-v span { font-size: 10.5px; }
  .bk-art svg { max-height: 100%; }
  .bk-when { padding: 10px 14px 0; } .bk-art { padding: 4px 14px 12px; }
  .bk-text { padding: 14px 16px 26px; }
  .bk-cover .big { font-size: 56px; } .bk-cover h2 { font-size: 24px; } .bk-cover p { font-size: 15px; }
  .ba-big { font-size: 40px; } .ba-tile { min-width: 58px; padding: 7px 5px; } .ba-tile .s { font-size: 28px; min-height: 30px; } .ba-tile .s svg { width: 32px; height: 32px; }
  .ba-tiles.big .ba-tile { min-width: 58px; padding: 7px 5px; } .ba-tiles.big .ba-tile .s { font-size: 30px; min-height: 32px; } .ba-tiles.big .ba-tile .s svg { width: 34px; height: 34px; } .ba-tiles.big .ba-tile .v { font-size: 14px; }
  .ba-tiles { gap: 6px; } .ba-col { gap: 8px; }
  .ba-dice { font-size: 44px; } .ba-lamp { width: 60px; }
}
@media (max-width: 640px) {
  .bk-title h2 { font-size: calc(21px * var(--k, 1)); } .bk-text p { font-size: calc(17px * var(--k)); } .bk-ask .q, .bk-ask .a { font-size: calc(16px * var(--k)); }
  .bk-spread:not(.cover) { grid-template-rows: minmax(0, 30%) minmax(0, 1fr); }
  .bk-cover .cv-t h2 { font-size: 24px; letter-spacing: 0; white-space: nowrap; } .cv-t h2 b { font-size: 15px; letter-spacing: 3px; white-space: normal; } .cv-t small { font-size: 10px; letter-spacing: 1.5px; }
  .bk-cover .cv-t p { font-size: 12px; }
  .ba-grid i { font-size: 15px; padding: 5px 0; } .ba-note { font-size: 16px; }
}
/* a phone (user, 2026-11-24: the book did not read well on an iPhone): one page at a time — the cover, the contents,
   then each story's picture page and its story page. .wide = a phone held sideways. */
.bk-ptitle { display: none; }
.bk-wrap.one { padding: 0 10px calc(8px + var(--safe-b, 0px)); gap: 8px; }
.bk-wrap.one .bk-book { margin: 6px 10px 12px 6px; }
.bk-wrap.one .bk-book::before { inset: -6px -10px -12px -6px; }
body:has(.bk-wrap.one) .topbar .sub { display: none; }
.bk-wrap.one .bk-text p { line-height: 1.4; }
.bk-wrap.one .bk-book::after { display: none; }
.bk-wrap.one .bk-spread { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); gap: 0; }
.bk-wrap.one .bk-page { border-radius: 4px 10px 10px 4px; transform-origin: left center;
  box-shadow: inset 16px 0 16px -14px rgba(90, 60, 20, .35), 1px 1px 0 #E3D5B6, 3px 3px 0 #FBF5E6, 4px 4px 0 #DED0B0, 6px 6px 0 #F8F0DD, 7px 7px 0 #D2C19C, 8px 9px 12px rgba(0, 20, 30, .25); }
.bk-wrap.one .bk-page:not(.bk-cover) { background: linear-gradient(270deg, #F6ECD4, #FFFDF7 8%, #FFFDF7 94%, #F1E6CC); }
.bk-wrap.one .bk-text { padding: 10px 16px 28px; }
.bk-wrap.one .bk-ptitle { display: block; padding: 8px 18px 0 22px; text-align: center; font: 900 21px/1.2 var(--font, sans-serif); color: #C25412; }
/* turning: forward, the page lifts its corner and swings off to the left; back, the page before comes down over it */
.bk-wrap.one .bk-spread.out-next .bk-page { animation: bkOutR .95s ease-in-out forwards, bkCutR .95s ease-out forwards; }
.bk-wrap.one .bk-spread.in-next .bk-page, .bk-wrap.one .bk-spread.out-prev .bk-page { animation: none; }
.bk-wrap.one .bk-spread.in-prev { z-index: 3; }
.bk-wrap.one .bk-spread.in-prev .bk-page { animation: bkBack .7s ease-out both; }
@keyframes bkBack { from { transform: rotateY(-90deg); } to { transform: rotateY(0); } }
/* upright: the cover keeps its tall layout, three drawings above the title and three below */
.bk-wrap.one:not(.wide) .cv-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr); grid-template-areas: "a b c" "t t t" "d e f"; gap: 10px 6px; }
.bk-wrap.one:not(.wide) .cv-c, .bk-wrap.one:not(.wide) .cv-f { display: flex; }
.bk-wrap.one:not(.wide) .bk-cover .cv-t h2 { font-size: 34px; letter-spacing: 1px; }
.bk-wrap.one:not(.wide) .cv-t h2 b { font-size: 19px; letter-spacing: 5px; }
.bk-wrap.one:not(.wide) .bk-cover .cv-t p { font-size: 14px; }
.bk-wrap.one:not(.wide) .cv-v span { font-size: 11px; }
/* sideways: the cover is one row, and the story page is set in two columns like an open book */
/* sideways the screen is short: the buttons move to the sides of the book (☰ ◀ book ▶) so the book keeps the height */
.bk-wrap.wide { flex-direction: row; align-items: center; gap: 8px; padding: 0 max(10px, env(safe-area-inset-right, 0px)) calc(6px + var(--safe-b, 0px)) max(10px, env(safe-area-inset-left, 0px)); }
.bk-wrap.wide .bk-book { align-self: stretch; order: 0; }
.bk-wrap.wide .bk-nav { display: contents; }
.bk-wrap.wide .bk-nav .mid { display: none; }
.bk-wrap.wide .bk-nav .btn { flex: none; order: -1; }
.bk-wrap.wide .bk-nav .btn:last-child { order: 1; }
.bk-wrap.wide .bk-cover.cv { padding: 8px 12px; }
.bk-wrap.wide .cv-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); grid-template-areas: "a b t d e"; gap: 6px; }
.bk-wrap.wide .cv-c, .bk-wrap.wide .cv-f { display: none; }
.bk-wrap.wide .cv-t { align-self: center; padding: 8px 2px; }
.bk-wrap.wide .bk-cover .cv-t h2 { font-size: 30px; } .bk-wrap.wide .cv-t h2 b { font-size: 17px; letter-spacing: 4px; }
.bk-wrap.wide .bk-when { padding-top: 10px; } .bk-wrap.wide .bk-ptitle { padding-top: 4px; font-size: 19px; } .bk-wrap.wide .bk-art { padding-bottom: 10px; }
.bk-wrap.wide .bk-text { padding: 12px 22px 30px; }
.bk-wrap.wide .bk-text.cols .bk-flow { display: block; column-count: 2; column-gap: 44px; column-rule: 2px solid #F0E6CF; }
.bk-wrap.wide .bk-text.cols .bk-flow > * + * { margin-top: calc(10px * var(--k)); }
.bk-wrap.wide .bk-text.cols .bk-ask, .bk-wrap.wide .bk-text.cols .bk-title { break-inside: avoid; -webkit-column-break-inside: avoid; }
@media (prefers-reduced-motion: reduce) {
  .bk-spread * { animation-duration: .01s !important; animation-iteration-count: 1 !important; }
  .ba-draw { stroke-dashoffset: 0; }
}
`;
  // pg = the page on screen: 0 the cover, 1 the contents, 2k story k's picture, 2k + 1 its story. A tablet shows the
  // spread of two pages (pg is then always even); a phone shows one page at a time (one = true).
  let api = null, pg = 0, one = false, timers = [], busy = false, bookEl = null, wrapEl = null, navMid = null, prevBtn = null, nextBtn = null, tocBtn = null;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const stories = () => window.STORIES || [];
  const total = () => stories().length;            // spread 0 is the cover, spreads 1…total are the stories
  const lastPage = () => total() * 2 + 1;
  const isPhone = () => Math.min(window.innerWidth, window.innerHeight) <= 500;
  const shown = p => (one ? p : Math.floor(p / 2));   // what is on screen for page p: that page, or its spread
  const clearTimers = () => { timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = []; };
  const readMap = () => { const S = api.state(); if (!S.stories || typeof S.stories !== 'object') S.stories = {}; return S.stories; };

  /* ---------- the moving pictures (original drawings: simple shapes, emoji and CSS motion) ---------- */
  // the book writes every number of four or more digits in groups of three, as its stories do (U.fmt leaves four digits together)
  const num = n => String(n).replace(/\B(?=(\d{3})+$)/g, ' ');
  const tile = (sym, val, delay) => `<div class="ba-tile ba-pop" style="animation-delay:${delay || 0}s"><div class="s">${sym}</div><div class="v">${val}</div></div>`;
  const EG = {   // Egyptian number signs, drawn simply
    1: '<svg viewBox="0 0 44 44"><path d="M22 6v32" stroke="#C25412" stroke-width="6" stroke-linecap="round"/></svg>',
    10: '<svg viewBox="0 0 44 44"><path d="M9 38V22a13 13 0 0 1 26 0v16" fill="none" stroke="#C25412" stroke-width="6" stroke-linecap="round"/></svg>',
    100: '<svg viewBox="0 0 44 44"><path d="M30 40c-14 0-22-8-22-18s7-16 15-16 12 6 12 12-4 10-9 10-7-3-7-7 2-5 5-5" fill="none" stroke="#C25412" stroke-width="5" stroke-linecap="round"/></svg>',
    1000: '<svg viewBox="0 0 44 44"><path d="M22 40V22M22 22c-8-2-12-8-12-16 5 1 9 4 12 9 3-5 7-8 12-9 0 8-4 14-12 16zM22 22V6M14 40h16" fill="none" stroke="#C25412" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const ART = {
    tally() {
      let marks = '';
      for (let k = 0; k < 15; k++) { const x = 70 + k * 15 + Math.floor(k / 5) * 14; marks += `<path class="ba-pop" style="animation-delay:${0.3 + k * 0.18}s" d="M${x} 86v34" stroke="#7A4A22" stroke-width="4" stroke-linecap="round"/>`; }
      return `<svg viewBox="0 0 400 260"><g><rect x="40" y="70" width="320" height="64" rx="32" fill="#F6E7C8" stroke="#D9BF8C" stroke-width="4"/><circle cx="46" cy="84" r="20" fill="#F6E7C8" stroke="#D9BF8C" stroke-width="4"/><circle cx="46" cy="120" r="20" fill="#F6E7C8" stroke="#D9BF8C" stroke-width="4"/><circle cx="354" cy="84" r="20" fill="#F6E7C8" stroke="#D9BF8C" stroke-width="4"/><circle cx="354" cy="120" r="20" fill="#F6E7C8" stroke="#D9BF8C" stroke-width="4"/><rect x="44" y="74" width="312" height="56" rx="28" fill="#F6E7C8"/>${marks}</g>
        <g class="ba-pop" style="animation-delay:3.2s" stroke="#1E3A4C" stroke-width="6" stroke-linecap="round"><path d="M150 180v50M168 180v50M186 180v50M204 180v50M138 226l80-42"/></g>
        <text class="ba-pop" style="animation-delay:3.6s" x="250" y="216" font-size="34" font-weight="900" fill="#C25412">= 5</text></svg>`;
    },
    egypt() {
      const row = (signs, n) => `<div class="ba-tile ba-pop" style="animation-delay:1.8s;flex-direction:row;gap:2px"><div class="s" style="display:flex">${signs}</div></div><div class="ba-note ba-pop" style="animation-delay:2.2s;align-self:center">= ${n}</div>`;
      return `<div class="ba-col"><div class="ba-tiles big">${tile(EG[1], '1', .1)}${tile(EG[10], '10', .4)}${tile(EG[100], '100', .7)}${tile(EG[1000], num(1000), 1)}</div>
        <div class="ba-tiles">${row(EG[10] + EG[10] + EG[1] + EG[1] + EG[1], 23)}</div></div>`;
    },
    clock60() {
      let ticks = '';
      for (let k = 0; k < 60; k++) { const a = k * 6 * Math.PI / 180, r1 = k % 5 ? 92 : 84, x1 = 130 + r1 * Math.sin(a), y1 = 130 - r1 * Math.cos(a), x2 = 130 + 100 * Math.sin(a), y2 = 130 - 100 * Math.cos(a); ticks += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${k % 5 ? '#9DB1BD' : '#1E3A4C'}" stroke-width="${k % 5 ? 2 : 4}" stroke-linecap="round"/>`; }
      return `<svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="112" fill="#fff" stroke="#12A39E" stroke-width="8"/>${ticks}
        <g style="transform-origin:130px 130px;animation:bkSpin 8s linear infinite"><path d="M130 130V44" stroke="#F47A2A" stroke-width="6" stroke-linecap="round"/></g>
        <path d="M130 130l34 22" stroke="#1E3A4C" stroke-width="8" stroke-linecap="round"/><circle cx="130" cy="130" r="8" fill="#1E3A4C"/>
        <text x="130" y="196" text-anchor="middle" font-size="26" font-weight="900" fill="#C25412">60</text></svg>`;
    },
    roman() {
      const R = [['I', 1], ['V', 5], ['X', 10], ['L', 50], ['C', 100], ['D', 500], ['M', 1000]];
      return `<div class="ba-col"><div class="ba-tiles big">${R.map(([s, v], k) => tile(s, num(v), .1 + k * .25)).join('')}</div><div class="ba-note ba-pop" style="animation-delay:2.2s">VI = 6 &nbsp;·&nbsp; IV = 4</div></div>`;
    },
    zero() {
      const z = '<span class="ba-glow">0</span>';
      return `<div class="ba-col"><div class="ba-big ba-pop">15</div><div class="ba-big ba-pop" style="animation-delay:.5s">1${z}5</div><div class="ba-big ba-pop" style="animation-delay:1s">15${z}</div></div>`;
    },
    digits() {
      const d = '0123456789'.split('').map((c, k) => `<span style="animation-delay:${k * .12}s">${c}</span>`).join(' ');
      return `<div class="ba-col"><div class="ba-big ba-wave" style="font-size:52px;letter-spacing:0">${d}</div>
        <div class="ba-tiles">${tile('🇮🇳', L('Ấn Độ', 'India'), .2)}<div class="ba-note" style="align-self:center">→</div>${tile('🕌', L('Bát-đa', 'Baghdad'), .9)}<div class="ba-note" style="align-self:center">→</div>${tile('🏰', L('Châu Âu', 'Europe'), 1.6)}</div></div>`;
    },
    signs() {
      return `<div class="ba-tiles big">${tile('+', '1489', .1)}${tile('−', '1489', .5)}${tile('=', '1557', 1)}${tile('×', '1631', 1.5)}${tile('÷', '1659', 2)}</div>`;
    },
    fraction() {
      return `<svg viewBox="0 0 400 250"><circle cx="110" cy="120" r="80" fill="#fff" stroke="#D9BF8C" stroke-width="4"/>
        <path class="ba-pop" style="animation-delay:.3s" d="M110 120V40a80 80 0 0 1 0 160z" fill="#F4B76B" stroke="#C98A3C" stroke-width="3"/>
        <path class="ba-pop" style="animation-delay:1.1s" d="M110 120v80a80 80 0 0 1-80-80z" fill="#F7D48F" stroke="#C98A3C" stroke-width="3"/>
        <text class="ba-pop" style="animation-delay:.5s" x="230" y="96" font-size="34" font-weight="900" fill="#C25412">1/2</text>
        <text class="ba-pop" style="animation-delay:1.3s" x="230" y="146" font-size="34" font-weight="900" fill="#C98A3C">+ 1/4</text>
        <text class="ba-pop" style="animation-delay:2s" x="230" y="200" font-size="34" font-weight="900" fill="#1E3A4C">= 3/4</text></svg>`;
    },
    decimal() {
      let bar = '';
      for (let k = 0; k < 10; k++) bar += `<rect class="ba-pop" style="animation-delay:${1 + k * .08}s" x="${40 + k * 32}" y="150" width="30" height="46" rx="6" fill="${k < 5 ? '#5CE4D3' : '#fff'}" stroke="#12A39E" stroke-width="3"/>`;
      return `<svg viewBox="0 0 400 240"><text x="200" y="110" text-anchor="middle" font-size="96" font-weight="900" fill="#1E3A4C">3<tspan class="ba-glow" fill="#F47A2A">,</tspan>5</text>${bar}
        <text class="ba-pop" style="animation-delay:2s" x="200" y="228" text-anchor="middle" font-size="22" font-weight="800" fill="#0E6E6A">0,5 = 5/10</text></svg>`;
    },
    shapes() {
      return `<svg viewBox="0 0 400 240" fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        <path class="ba-draw" d="M70 190L130 70l60 120z" stroke="#F47A2A"/>
        <rect class="ba-draw" style="animation-delay:.8s" x="215" y="80" width="110" height="110" stroke="#12A39E"/>
        <circle class="ba-draw" style="animation-delay:1.6s" cx="130" cy="140" r="0" stroke="none"/>
        <circle class="ba-draw" style="animation-delay:1.6s" cx="270" cy="135" r="38" stroke="#7C5CE0"/>
        <path class="ba-draw" style="animation-delay:2.4s" d="M40 215h320" stroke="#1E3A4C" stroke-width="4"/></svg>`;
    },
    pi() {
      // a wheel of diameter 60 rolls once: it travels π × 60 = 188,5
      return `<svg viewBox="0 0 400 240"><path d="M60 170h300" stroke="#1E3A4C" stroke-width="4" stroke-linecap="round"/>
        ${[0, 1, 2, 3].map(k => `<path d="M${90 + k * 60} 162v16" stroke="#1E3A4C" stroke-width="3"/><text x="${90 + k * 60}" y="200" text-anchor="middle" font-size="20" font-weight="800" fill="#5B7083">${k}</text>`).join('')}
        <rect class="ba-rollbar" x="90" y="166" width="188.5" height="8" rx="4" fill="#F47A2A"/>
        <g class="ba-roll" style="transform-origin:90px 138px"><circle cx="90" cy="138" r="30" fill="#DDF5F2" stroke="#12A39E" stroke-width="6"/><path d="M90 138V108M90 138l26 15M90 138l-26 15" stroke="#12A39E" stroke-width="4" stroke-linecap="round"/><circle cx="90" cy="108" r="5" fill="#F47A2A"/></g>
        <text x="200" y="62" text-anchor="middle" font-size="46" font-weight="900" fill="#C25412">π ≈ 3,14</text></svg>`;
    },
    metre() {
      return `<svg viewBox="0 0 400 250"><circle cx="150" cy="125" r="92" fill="#BFE9F5" stroke="#3FA7C9" stroke-width="5"/>
        <path d="M58 125h184" stroke="#3FA7C9" stroke-width="3" stroke-dasharray="6 6"/><path d="M110 70c20-14 46-4 50 18s-22 30-44 26-22-32-6-44zM176 150c16-6 30 6 26 22s-26 16-32 4 0-22 6-26z" fill="#8FD6A0"/>
        <path class="ba-draw" d="M150 33a92 92 0 0 1 92 92" stroke="#F47A2A" stroke-width="9" fill="none" stroke-linecap="round"/>
        <circle cx="150" cy="33" r="8" fill="#F47A2A"/><circle cx="242" cy="125" r="8" fill="#F47A2A"/>
        <text class="ba-pop" style="animation-delay:2.2s" x="262" y="70" font-size="20" font-weight="800" fill="#1E3A4C">${num(10000000)} m</text>
        <text class="ba-pop" style="animation-delay:2.6s" x="262" y="200" font-size="40" font-weight="900" fill="#C25412">📏 1 m</text></svg>`;
    },
    elephant() {
      return `<svg viewBox="0 0 400 250"><rect x="0" y="150" width="400" height="100" fill="#BFE9F5"/><path d="M0 150q25-10 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0" fill="none" stroke="#3FA7C9" stroke-width="4"/>
        <g class="ba-bob"><path d="M90 128h220l-26 58H116z" fill="#B9793A" stroke="#7A4A22" stroke-width="5" stroke-linejoin="round"/>
          <path d="M100 150h200" stroke="#F47A2A" stroke-width="5" stroke-dasharray="10 6"/>
          <text class="ba-a" x="200" y="122" text-anchor="middle" font-size="86">🐘</text>
          <text class="ba-b" x="200" y="118" text-anchor="middle" font-size="46">🪨🪨🪨</text></g>
        <text class="ba-a" x="200" y="236" text-anchor="middle" font-size="22" font-weight="800" fill="#1E3A4C">${L('Đánh dấu mực nước', 'Mark the water level')}</text>
        <text class="ba-b" x="200" y="236" text-anchor="middle" font-size="22" font-weight="800" fill="#1E3A4C">${L('Chất đá đến đúng vạch', 'Load stones up to the mark')}</text></svg>`;
    },
    gauss() {
      const xs = [40, 80, 120, 280, 320, 360], ns = ['1', '2', '3', '98', '99', '100'];
      return `<svg viewBox="0 0 400 250">${ns.map((n, k) => `<text x="${xs[k]}" y="130" text-anchor="middle" font-size="30" font-weight="900" fill="#1E3A4C">${n}</text>`).join('')}
        <text x="200" y="130" text-anchor="middle" font-size="30" font-weight="900" fill="#9DB1BD">…</text>
        <path class="ba-draw" style="animation-delay:.6s" d="M40 100C40 10, 360 10, 360 100" fill="none" stroke="#F47A2A" stroke-width="5" stroke-linecap="round"/>
        <path class="ba-draw" style="animation-delay:1.5s" d="M80 100C80 36, 320 36, 320 100" fill="none" stroke="#12A39E" stroke-width="5" stroke-linecap="round"/>
        <path class="ba-draw" style="animation-delay:2.4s" d="M120 100C120 62, 280 62, 280 100" fill="none" stroke="#7C5CE0" stroke-width="5" stroke-linecap="round"/>
        <text class="ba-pop" style="animation-delay:3.2s" x="200" y="190" text-anchor="middle" font-size="28" font-weight="900" fill="#C25412">1 + 100 = 2 + 99 = 101</text>
        <text class="ba-pop" style="animation-delay:3.8s" x="200" y="230" text-anchor="middle" font-size="28" font-weight="900" fill="#1E3A4C">50 × 101 = ${num(5050)}</text></svg>`;
    },
    abacus() {
      let rods = '';
      [0, 1, 2, 3].forEach(r => {
        const x = 90 + r * 74;
        rods += `<path d="M${x} 40v180" stroke="#7A4A22" stroke-width="5"/>`;
        for (let b = 0; b < 4; b++) rods += `<ellipse class="${b < (r % 3) + 1 ? 'ba-bead' : ''}" style="animation-delay:${r * .5}s" cx="${x}" cy="${200 - b * 26}" rx="26" ry="12" fill="${['#F47A2A', '#12A39E', '#7C5CE0', '#F4B400'][r]}" stroke="rgba(0,0,0,.2)" stroke-width="2"/>`;
      });
      return `<svg viewBox="0 0 400 250"><rect x="40" y="26" width="320" height="208" rx="16" fill="#FFF3D9" stroke="#B9793A" stroke-width="10"/><path d="M40 92h320" stroke="#B9793A" stroke-width="8"/>${rods}</svg>`;
    },
    sieve(root) {
      const g = el('div', 'ba-grid');
      const cells = {};
      for (let n = 2; n <= 29; n++) { const c = el('i', '', String(n)); cells[n] = c; g.append(c); }
      const run = () => {
        Object.values(cells).forEach(c => { c.className = ''; });
        let t = 600;
        for (const p of [2, 3, 5]) {
          timers.push(setTimeout(() => cells[p].classList.add('prime'), t)); t += 500;
          for (let m = p * 2; m <= 29; m += p) { const mm = m; timers.push(setTimeout(() => { if (!cells[mm].classList.contains('prime')) cells[mm].classList.add('out'); }, t)); t += 140; }
          t += 400;
        }
        timers.push(setTimeout(() => { for (let n = 2; n <= 29; n++) if (!cells[n].classList.contains('out')) cells[n].classList.add('prime'); }, t));
        timers.push(setTimeout(run, t + 5000));
      };
      run();
      root.append(g);
    },
    dice() {
      return `<div class="ba-col"><div><span class="ba-dice">🎲</span> <span class="ba-dice">🎲</span></div>
        <div class="ba-tiles" style="align-items:center">${tile('👨‍🎓', 'Pascal', .2)}<span class="ba-mail">✉️</span>${tile('👨‍⚖️', 'Fermat', .5)}</div></div>`;
    },
    binary(root) {
      const box = el('div', 'ba-col');
      const lamps = el('div', 'ba-lamps');
      const ls = [4, 2, 1].map(() => { const l = el('div', 'ba-lamp', '<span class="l">💡</span><span class="b">0</span>'); lamps.append(l); return l; });
      const note = el('div', 'ba-note', '0');
      box.append(lamps, note);
      let n = 0;
      const show = () => { [4, 2, 1].forEach((v, k) => { const on = (n & v) > 0; ls[k].classList.toggle('on', on); ls[k].querySelector('.b').textContent = on ? '1' : '0'; }); note.textContent = `${[4, 2, 1].map(v => ((n & v) ? 1 : 0)).join('')} = ${n}`; };
      show();
      timers.push(setInterval(() => { n = (n + 1) % 8; show(); }, 1300));
      root.append(box);
    },
    /* --- stories added from Cajori's "A History of Mathematics" --- */
    shadow() {
      // the sun is on the left: when the stick's shadow is as long as the stick, the pyramid's shadow (from its centre) is as long as it is high
      return `<svg viewBox="0 0 400 250"><circle class="ba-bob" cx="44" cy="44" r="24" fill="#FFD23F"/>
        <path d="M10 200h380" stroke="#D9BF8C" stroke-width="4" stroke-linecap="round"/>
        <path d="M60 200L130 80l70 120z" fill="#F4C987" stroke="#C98A3C" stroke-width="4" stroke-linejoin="round"/><path d="M130 80v120" stroke="#C98A3C" stroke-width="3" stroke-dasharray="6 6"/>
        <path class="ba-draw" d="M130 209h120" fill="none" stroke="#5B7083" stroke-width="8" stroke-linecap="round"/>
        <path d="M310 200v-50" stroke="#7A4A22" stroke-width="7" stroke-linecap="round"/>
        <path class="ba-draw" style="animation-delay:.8s" d="M310 209h50" fill="none" stroke="#5B7083" stroke-width="8" stroke-linecap="round"/>
        <text class="ba-pop" style="animation-delay:1.8s" x="335" y="238" text-anchor="middle" font-size="18" font-weight="800" fill="#1E3A4C">${L('bóng = gậy', 'shadow = stick')}</text>
        <text class="ba-pop" style="animation-delay:2.6s" x="180" y="238" text-anchor="middle" font-size="18" font-weight="800" fill="#C25412">${L('bóng = chiều cao', 'shadow = height')}</text></svg>`;
    },
    figurate() {
      const C = ['#F47A2A', '#12A39E', '#7C5CE0', '#F4B400'];
      let tri = '', sq = '';
      for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) tri += `<circle class="ba-pop" style="animation-delay:${(.2 + r * .5).toFixed(1)}s" cx="${100 - r * 15 + c * 30}" cy="${44 + r * 28}" r="11" fill="${C[r]}"/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const k = Math.max(r, c); sq += `<circle class="ba-pop" style="animation-delay:${(.2 + k * .5).toFixed(1)}s" cx="${255 + c * 30}" cy="${44 + r * 28}" r="11" fill="${C[k]}"/>`; }
      return `<svg viewBox="0 0 400 250">${tri}${sq}
        <text class="ba-pop" style="animation-delay:2.4s" x="100" y="178" text-anchor="middle" font-size="20" font-weight="800" fill="#1E3A4C">1 · 3 · 6 · 10</text>
        <text class="ba-pop" style="animation-delay:2.4s" x="300" y="178" text-anchor="middle" font-size="20" font-weight="800" fill="#1E3A4C">1 · 4 · 9 · 16</text>
        <text class="ba-pop" style="animation-delay:3s" x="200" y="228" text-anchor="middle" font-size="26" font-weight="900" fill="#C25412">1 + 3 + 5 + 7 = 16</text></svg>`;
    },
    king() {
      return `<div class="ba-col"><div class="ba-tiles big">${tile('👑', L('Nhà vua', 'The king'), .1)}${tile('🧒', L('Học trò', 'A pupil'), .5)}</div>
        <div class="ba-tiles">${tile('📐', L('Bước 1', 'Step 1'), 1.2)}${tile('📏', L('Bước 2', 'Step 2'), 1.6)}${tile('✏️', L('Bước 3', 'Step 3'), 2)}</div>
        <div class="ba-note ba-pop" style="animation-delay:2.6s">${L('Ai cũng phải học từng bước', 'Everyone learns step by step')}</div></div>`;
    },
    sphere() {
      return `<svg viewBox="0 0 400 250"><ellipse cx="150" cy="196" rx="74" ry="16" fill="#DDF5F2" stroke="#12A39E" stroke-width="4"/>
        <circle class="ba-pop" style="animation-delay:.8s" cx="150" cy="124" r="72" fill="#FFD9B8" stroke="#F47A2A" stroke-width="5"/>
        <ellipse class="ba-pop" style="animation-delay:.8s" cx="150" cy="124" rx="72" ry="18" fill="none" stroke="#F47A2A" stroke-width="3" stroke-dasharray="6 6"/>
        <path class="ba-draw" d="M76 52v144M224 52v144" fill="none" stroke="#12A39E" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="150" cy="52" rx="74" ry="16" fill="none" stroke="#12A39E" stroke-width="5"/>
        <text class="ba-pop" style="animation-delay:1.8s" x="318" y="108" text-anchor="middle" font-size="24" font-weight="800" fill="#1E3A4C">${L('Quả cầu', 'Sphere')}</text>
        <text class="ba-pop" style="animation-delay:2.4s" x="318" y="158" text-anchor="middle" font-size="44" font-weight="900" fill="#C25412">= 2/3</text>
        <text class="ba-pop" style="animation-delay:2.4s" x="318" y="190" text-anchor="middle" font-size="20" font-weight="800" fill="#0E6E6A">${L('hình trụ', 'of the cylinder')}</text></svg>`;
    },
    sand() {
      const zeros = Array.from({ length: 12 }, (_, k) => `<span style="animation-delay:${(k * .1).toFixed(1)}s">0</span>`).join('');
      return `<div class="ba-col"><div class="ba-big" style="font-size:64px">⏳</div>
        <div class="ba-big ba-wave" style="font-size:34px;letter-spacing:0">1${zeros}…</div>
        <div class="ba-note ba-pop" style="animation-delay:1s">${L('Số 1 và 63 chữ số 0', 'A 1 followed by 63 zeros')}</div></div>`;
    },
    lifebar() {
      // the 84 years of the riddle, 4 units for a year: 14 + 7 + 12 + 5 + 42 + 4
      const yrs = L('năm', 'years');
      const P = [[14, '#FFD23F', '1/6'], [7, '#F4A259', '1/12'], [12, '#F47A2A', '1/7'], [5, '#8FD6A0', yrs], [42, '#5CE4D3', '1/2'], [4, '#B7A6F0', yrs]];
      let x = 32, out = '';
      P.forEach(([y, c, lab], k) => {
        const w = y * 4, up = k % 2 === 0, mx = x + w / 2;
        out += `<g class="ba-pop" style="animation-delay:${(.3 + k * .6).toFixed(1)}s"><rect x="${x}" y="100" width="${w}" height="46" fill="${c}" stroke="#fff" stroke-width="2"/>
          <text x="${mx}" y="${up ? 90 : 168}" text-anchor="middle" font-size="17" font-weight="800" fill="#5B7083">${lab}</text>
          <text x="${mx}" y="${up ? 68 : 192}" text-anchor="middle" font-size="20" font-weight="900" fill="#1E3A4C">${y}</text></g>`;
        x += w;
      });
      return `<svg viewBox="0 0 400 250">${out}<text class="ba-pop" style="animation-delay:4s" x="200" y="236" text-anchor="middle" font-size="24" font-weight="900" fill="#C25412">14 + 7 + 12 + 5 + 42 + 4 = 84</text></svg>`;
    },
    shares() {
      const who = [['👦', '#5CE4D3', 4], ['👩', '#FFD23F', 2], ['👧', '#F7A8C4', 1]];
      let x = 32, out = '', k = 0;
      who.forEach(([e, c, n], g) => {
        for (let j = 0; j < n; j++, k++) out += `<rect class="ba-pop" style="animation-delay:${(.3 + k * .25).toFixed(2)}s" x="${x + j * 48}" y="100" width="46" height="56" rx="8" fill="${c}" stroke="rgba(0,0,0,.15)" stroke-width="2"/>`;
        const d = (2.2 + g * .4).toFixed(1), mx = x + n * 24 - 1;
        out += `<text class="ba-pop" style="animation-delay:${d}s" x="${mx}" y="84" text-anchor="middle" font-size="38">${e}</text><text class="ba-pop" style="animation-delay:${d}s" x="${mx}" y="190" text-anchor="middle" font-size="26" font-weight="900" fill="#1E3A4C">${n}</text>`;
        x += n * 48;
      });
      return `<svg viewBox="0 0 400 250">${out}<text class="ba-pop" style="animation-delay:3.6s" x="200" y="234" text-anchor="middle" font-size="22" font-weight="800" fill="#C25412">4 + 2 + 1 = 7 ${L('phần', 'parts')}</text></svg>`;
    },
    inverse() {
      const box = (x, y, t, c, d) => `<g class="ba-pop" style="animation-delay:${d}s"><rect x="${x - 34}" y="${y - 28}" width="68" height="56" rx="14" fill="#fff" stroke="${c}" stroke-width="4"/><text x="${x}" y="${y + 10}" text-anchor="middle" font-size="28" font-weight="900" fill="#1E3A4C">${t}</text></g>`;
      const arr = (x, y, t, c, d, back) => `<g class="ba-pop" style="animation-delay:${d}s"><path d="${back ? `M${x + 30} ${y}h-60m12-9l-12 9 12 9` : `M${x - 30} ${y}h60m-12-9l12 9-12 9`}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="${x}" y="${y - 16}" text-anchor="middle" font-size="22" font-weight="900" fill="${c}">${t}</text></g>`;
      return `<svg viewBox="0 0 400 250">${box(50, 70, '?', '#12A39E', .1)}${arr(125, 70, '× 3', '#12A39E', .5)}${box(200, 70, '…', '#12A39E', .9)}${arr(275, 70, '+ 6', '#12A39E', 1.3)}${box(350, 70, '30', '#12A39E', 1.7)}
        ${box(350, 180, '30', '#F47A2A', 2.4)}${arr(275, 180, '− 6', '#F47A2A', 2.8, true)}${box(200, 180, '24', '#F47A2A', 3.2)}${arr(125, 180, ': 3', '#F47A2A', 3.6, true)}${box(50, 180, '8', '#F47A2A', 4)}</svg>`;
    },
    chase() {
      // both run to the left (the way the emoji face); the dog gains 2 at every leap
      return `<svg viewBox="0 0 400 250"><path d="M10 150h380" stroke="#8FD6A0" stroke-width="8" stroke-linecap="round"/>
        <g class="ba-hare"><text x="190" y="140" text-anchor="middle" font-size="46">🐇</text><text x="190" y="84" text-anchor="middle" font-size="22" font-weight="900" fill="#12A39E">7</text></g>
        <g class="ba-dog"><text x="350" y="142" text-anchor="middle" font-size="54">🐕</text><text x="350" y="80" text-anchor="middle" font-size="22" font-weight="900" fill="#F47A2A">9</text></g>
        <text class="ba-pop" style="animation-delay:.6s" x="200" y="196" text-anchor="middle" font-size="26" font-weight="900" fill="#1E3A4C">9 − 7 = 2</text>
        <text class="ba-pop" style="animation-delay:1.6s" x="200" y="234" text-anchor="middle" font-size="26" font-weight="900" fill="#C25412">150 : 2 = 75</text></svg>`;
    },
    sevens() {
      return `<div class="ba-col"><div class="ba-tiles big">${tile('👵', '7', .1)}${tile('🐴', '49', .6)}${tile('👝', '343', 1.1)}${tile('🍞', num(2401), 1.6)}</div>
        <div class="ba-note ba-pop" style="animation-delay:2.2s">7 → 7 × 7 → 7 × 7 × 7 …</div></div>`;
    },
    pascaline(root) {
      // three number wheels count up; at 99 + 1 the carry runs to the left
      const box = el('div', 'ba-col');
      const row = el('div', 'ba-lamps');
      const ws = [0, 1, 2].map(() => { const w = el('div', 'ba-wheel', '0'); row.append(w); return w; });
      const note = el('div', 'ba-note', '');
      note.style.cssText = 'min-width:290px;min-height:28px;text-align:center';
      box.append(el('div', 'ba-big', '<span class="ba-spin" style="display:inline-block">⚙️</span>'), row, note);
      let n = 96;
      const show = () => {
        const s = String(n).padStart(3, '0');
        ws.forEach((w, k) => { if (w.textContent !== s[k]) { w.textContent = s[k]; w.classList.remove('tick'); void w.offsetWidth; w.classList.add('tick'); } });
        note.textContent = n === 100 ? L('99 + 1 = 100: nhớ sang trái!', '99 + 1 = 100: carry to the left!') : '+ 1';
      };
      show();
      timers.push(setInterval(() => { n = n >= 103 ? 96 : n + 1; show(); }, 1400));
      root.append(box);
    },
  };
  function artOf(kind) {
    const box = el('div', 'bk-art');
    const fn = ART[kind];
    if (!fn) { box.textContent = '📖'; return box; }
    const out = fn(box);
    if (typeof out === 'string') box.innerHTML = out;
    // pictures made of tiles are scaled to the page (down on phones, up a little on tablets); drawings (svg) fit by themselves
    const fit = () => {
      const c = box.firstElementChild;
      if (!c || c.tagName.toLowerCase() === 'svg') return;
      c.style.transform = ''; c.style.flex = 'none';
      const cs = getComputedStyle(box);
      const bw = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), bh = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const s = Math.min(1.7, bw / Math.max(1, c.scrollWidth), bh / Math.max(1, c.scrollHeight));   // grows a little on a roomy page
      if (s < 0.99 || s > 1.08) c.style.transform = `scale(${s.toFixed(3)})`;
    };
    requestAnimationFrame(() => requestAnimationFrame(fit));
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
    return box;
  }

  /* ---------- pages ---------- */
  // Cover (user, 2026-11-24): "Lịch sử Toán học", a dark cover with white line drawings of calculations around a
  // big title. Each drawing belongs to one story and opens it. Our own drawings, not taken from any book cover.
  const W = 'fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const COVER_ART = [
    { id: 'dau-phep-tinh', cap: L('Dấu phép tính ra đời', 'Where the signs came from'),
      svg: `<g ${W}><path class="cv-p1" d="M12 18h16M20 10v16"/><path class="cv-p2" d="M52 18h16"/><path class="cv-p3" d="M13 39l14 14M27 39L13 53"/><path class="cv-p4" d="M52 46h16"/></g><g class="cv-p4" fill="#fff"><circle cx="60" cy="39" r="2.6"/><circle cx="60" cy="53" r="2.6"/></g>` },
    { id: 'thales', cap: L('Đo kim tự tháp bằng cái bóng', 'A pyramid measured by its shadow'),
      svg: `<g ${W}><path d="M2 54h76"/><path d="M8 54L32 16l24 38"/><path d="M20 35h24" stroke-width="2" opacity=".6"/><path d="M66 54V42"/><path class="cv-shadow" d="M66 54h12" stroke="#FFD27A"/></g><g class="cv-sun" ${W} stroke="#FFD27A"><circle cx="66" cy="13" r="5"/><path d="M66 3v2M66 21v2M56 13h2M74 13h2"/></g>` },
    { id: 'so-pi', cap: L('Số π bí ẩn', 'The mystery of π'),
      svg: `<g ${W}><circle cx="40" cy="34" r="24"/><path d="M16 34h48" stroke-dasharray="3 5"/></g><g class="ba-spin" style="transform-origin:40px 34px;transform-box:view-box"><circle cx="40" cy="10" r="3.5" fill="#FFD27A"/></g><text x="40" y="28" text-anchor="middle" fill="#FFD27A" font-size="20" font-weight="900" font-family="Georgia, serif">π</text><text x="40" y="52" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">3,14…</text>` },
    { id: 'ban-tinh', cap: L('Bàn tính của người xưa', 'The abacus of long ago'),
      svg: `<g ${W}><rect x="6" y="8" width="68" height="50" rx="5"/><path d="M6 21h68M6 33h68M6 45h68" stroke-width="2"/></g><g fill="#fff"><circle cx="16" cy="21" r="4.5"/><circle cx="26" cy="21" r="4.5"/><circle cx="64" cy="21" r="4.5"/><circle cx="16" cy="33" r="4.5"/><circle cx="54" cy="33" r="4.5"/><circle cx="64" cy="33" r="4.5"/><circle cx="64" cy="45" r="4.5"/></g><circle class="cv-bead" cx="26" cy="45" r="4.5" fill="#FFD27A"/>` },
    { id: 'so-xep-hinh', cap: L('Những con số biết xếp hình', 'Numbers that make shapes'),
      svg: `<g fill="#fff">${[[40, 10], [33, 22], [47, 22], [26, 34], [40, 34], [54, 34], [19, 46], [33, 46], [47, 46], [61, 46]].map(([x, y], i) => `<circle class="cv-dot" style="animation-delay:${(i * 0.15).toFixed(2)}s" cx="${x}" cy="${y}" r="4.5"/>`).join('')}</g><text x="40" y="62" text-anchor="middle" fill="#FFD27A" font-size="9" font-weight="900">1 · 3 · 6 · 10</text>` },
    { id: 'may-cong', cap: L('Cỗ máy biết làm tính', 'A machine that adds'),
      svg: `<g class="ba-spin"><circle cx="30" cy="30" r="15" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="5 4.4"/><circle cx="30" cy="30" r="9" ${W}/><circle cx="30" cy="30" r="2.5" fill="#fff"/></g><g class="ba-spin cv-rev"><circle cx="55" cy="46" r="11" fill="none" stroke="#FFD27A" stroke-width="6" stroke-dasharray="4.3 3.9"/><circle cx="55" cy="46" r="6" fill="none" stroke="#FFD27A" stroke-width="3"/></g>` },
  ];
  // The story fits its page (user, 2026-11-24: no scrolling if it can be helped): the text sizes are scaled down
  // step by step (--k) until nothing overflows, never below 70 %; past that the page still scrolls.
  function fitText(box) {
    if (!box.isConnected) return;
    // never smaller than about 15 px for the story lines (19 px on a tablet, 17 px on a phone at k = 1)
    const kMin = window.innerWidth <= 640 ? 0.88 : 0.79;
    // a phone held sideways sets the story in two even columns (.bk-flow); what still does not fit scrolls
    box.classList.toggle('cols', !!box.closest('.bk-wrap.wide'));
    let k = 1;
    box.style.setProperty('--k', '1');
    while (box.scrollHeight > box.clientHeight + 1 && k > kMin) { k = Math.round((k - 0.03) * 100) / 100; box.style.setProperty('--k', String(k)); }
  }
  function autoFit(box) {
    requestAnimationFrame(() => fitText(box));
    setTimeout(() => fitText(box), 60);   // also when frames are held back (a page in the background)
    if ('ResizeObserver' in window) { let w = 0, hgt = 0; new ResizeObserver(([e]) => { const r = e.contentRect; if (Math.abs(r.width - w) > 1 || Math.abs(r.height - hgt) > 1) { w = r.width; hgt = r.height; fitText(box); } }).observe(box); }
  }
  // the dog-ear in the outer bottom corner: a tap turns the page that way
  function ear(step) {
    const b = el('button', 'bk-ear ' + (step > 0 ? 'f' : 'b')); b.type = 'button';
    b.setAttribute('aria-label', step > 0 ? L('Trang sau', 'Next page') : L('Trang trước', 'Previous page'));
    b.onclick = e => { e.stopPropagation(); turn(step); };
    return b;
  }
  // every page has its own speaker (user, 2026-11-24): it reads what is on that page; a second tap stops it
  function speaker(textOf, label) {
    const b = el('button', 'bk-say', label ? `🔊 ${label}` : '🔊'); b.type = 'button';
    b.setAttribute('aria-label', L('Nghe đọc trang này', 'Read this page aloud'));
    b.onclick = () => {
      if (b.classList.contains('speaking')) { api.stopSpeech(true); b.classList.remove('speaking'); return; }
      api.speak(textOf().replace(/\s*→\s*/g, ', ').replace(/π/g, L('pi', 'pi')), b);
    };
    return b;
  }
  function coverSpread() {
    const sp = el('div', 'bk-spread cover');
    const left = el('div', 'bk-page bk-l bk-cover cv');
    const grid = el('div', 'cv-grid');
    COVER_ART.forEach((v, n) => {
      const k = stories().findIndex(s => s.id === v.id);
      const b = el('button', 'cv-v cv-' + 'abcdef'[n], `<svg viewBox="0 0 80 64" aria-hidden="true">${v.svg}</svg><span>${v.cap}</span>`);
      b.type = 'button'; b.setAttribute('aria-label', v.cap);
      if (k >= 0) b.onclick = () => { api.sfx.tap(); goPage((k + 1) * 2); }; else b.disabled = true;
      grid.append(b);
    });
    const sub = L(`${total()} câu chuyện từ thời cổ đại đến nay`, `${total()} stories from ancient times to today`);
    const band = el('div', 'cv-t', `<small>${L('Toán ISA kể chuyện', 'Toán ISA tells')}</small><h2><b>${L('Lịch sử', 'The history of')}</b>${L('Toán học', 'Maths')}</h2><p>${sub}</p>`);
    band.append(speaker(() => [L('Lịch sử Toán học', 'The history of Maths'), sub,
      L('Bé chạm vào một hình để đọc chuyện của hình đó', 'Tap a picture to read its story'), ...COVER_ART.map(v => v.cap)].join('. '), L('Nghe', 'Listen')));
    grid.append(band);
    left.append(grid);
    const right = el('div', 'bk-page bk-r');
    const body = el('div', 'bk-text');
    const read = readMap(), done = stories().filter(s => read[s.id]).length;
    const head = el('div', 'bk-title', `<h2>${L('Mục lục', 'Contents')}</h2>`);
    head.append(speaker(() => [L('Mục lục', 'Contents')].concat(stories().map((s, k) => `${L('Chuyện', 'Story')} ${k + 1}: ${s.title}`)).join('. ')));
    body.append(head, el('div', 'bk-sub', L(`Đã đọc ${done}/${total()} chuyện`, `${done} of ${total()} stories read`)));
    const toc = el('div', 'bk-toc');
    stories().forEach((s, k) => {
      const b = el('button', '', `<span class="no">${k + 1}.</span><span class="ic">${s.icon}</span><span class="t">${s.title}${read[s.id] ? ' <span class="ok">✓</span>' : ''}</span><span class="dots"></span><span class="pg">${k * 2 + 1}</span>`);
      b.type = 'button'; b.onclick = () => { api.sfx.tap(); goPage((k + 1) * 2); };
      toc.append(b);
    });
    body.append(toc);
    right.append(body, ear(1));
    sp.append(left, right);
    return sp;
  }
  function storySpread(k) {
    const s = stories()[k - 1];
    const sp = el('div', 'bk-spread');
    const left = el('div', 'bk-page bk-l');
    const when = el('div', 'bk-when', `<span class="bk-chip">🕰️ ${s.when}</span><span class="bk-chip where">📍 ${s.where}</span>`);
    when.append(speaker(() => `${L('Chuyện', 'Story')} ${k}: ${s.title}. ${s.when}. ${L('Ở', 'In')} ${s.where}.`));
    // on a phone the picture page stands alone, so it also shows the story's title
    left.append(when, el('div', 'bk-ptitle', `${s.icon} ${s.title}`), artOf(s.art), el('div', 'bk-pageno', String(k * 2 - 1)), ear(-1));
    const right = el('div', 'bk-page bk-r');
    const body = el('div', 'bk-text');
    const head = el('div', 'bk-title', `<h2>${s.icon} ${s.title}</h2>`);
    let answered = false;
    head.append(speaker(() => [s.title].concat(s.text, L('Đố em', 'Can you tell?') + ': ' + s.ask, answered ? L('Đáp án', 'Answer') + ': ' + s.answer : []).join('. ')));
    const flow = el('div', 'bk-flow'); body.append(flow); flow.append(head);
    s.text.forEach(t => flow.append(el('p', '', t)));
    const ask = el('div', 'bk-ask');
    ask.append(el('b', '', L('❓ Đố em', '❓ Can you tell?')), el('div', 'q', s.ask));
    const show = el('button', 'btn small', L('Xem đáp án', 'Show the answer')); show.type = 'button';
    show.onclick = () => { api.sfx.good(); answered = true; show.replaceWith(el('div', 'a', '✓ ' + s.answer)); requestAnimationFrame(() => fitText(body)); };
    ask.append(show);
    flow.append(ask);
    const row = el('div', 'bk-row');
    if (s.lesson && api.hasLesson(s.lesson)) {
      const b = el('button', 'btn small teal', L('📘 Học bài này', '📘 Learn this')); b.type = 'button';
      b.onclick = () => { api.sfx.tap(); close(); api.startLesson(s.lesson); };
      row.append(b);
    }
    if (row.children.length) flow.append(row);
    right.append(body, el('div', 'bk-pageno', String(k * 2)));
    if (k < total()) right.append(ear(1));
    sp.append(left, right);
    autoFit(body);
    // the first time a story is opened it counts as read and earns a star
    const read = readMap();
    if (!read[s.id]) { read[s.id] = 1; api.state().coins += 1; api.save(); }
    return sp;
  }
  // what page p shows: its spread on a tablet; on a phone that page alone, with its own dog-ears
  function pageOf(p) {
    const s = Math.floor(p / 2), sp = s === 0 ? coverSpread() : storySpread(s);
    if (!one) return sp;
    sp.classList.add('one');
    sp.children[p % 2 ? 0 : 1].remove();
    const page = sp.firstElementChild;
    page.querySelectorAll(':scope > .bk-ear').forEach(e => e.remove());
    if (p > 0) page.append(ear(-1));
    if (p < lastPage()) page.append(ear(1));
    return sp;
  }

  function setNav() {
    const s = Math.floor(pg / 2);
    navMid.textContent = s > 0 ? `${L('Chuyện', 'Story')} ${s}/${total()}` : one && pg === 1 ? L('Mục lục', 'Contents') : L('Bìa sách', 'Cover');
    prevBtn.disabled = pg === 0;
    nextBtn.disabled = one ? pg === lastPage() : s === total();
    // a phone has no room for words on the buttons (they broke over two lines): arrows and the contents sign
    prevBtn.textContent = one ? '◀' : L('◀ Trang trước', '◀ Back');
    tocBtn.textContent = one ? '☰' : L('☰ Mục lục', '☰ Contents');
    nextBtn.textContent = one ? '▶' : pg === 0 ? L('Mở sách ▶', 'Open the book ▶') : L('Trang sau ▶', 'Next ▶');
  }
  const turn = step => goPage(one ? pg + step : pg + 2 * step);
  function goPage(to) {
    if (!one) to = Math.floor(to / 2) * 2;       // a spread starts on its left page
    if (busy || !bookEl || to < 0 || to > lastPage() || shown(to) === shown(pg)) return;
    api.stopSpeech();
    busy = true;
    const dir = to > pg ? 'next' : 'prev';
    const old = bookEl.querySelector('.bk-spread');
    clearTimers();
    pg = to;
    const neu = pageOf(pg);
    neu.classList.add('in-' + dir);
    bookEl.prepend(neu);                       // under the page that is turning
    if (old) {
      // the corner curls first: its size follows the page (a little under half of its shorter side).
      // On a phone only a forward turn curls: going back, the page before comes down over this one.
      const page = one ? (dir === 'next' ? old.querySelector('.bk-page') : null) : old.querySelector(dir === 'next' ? '.bk-r' : '.bk-l');
      if (page) {
        page.style.setProperty('--c', Math.round(Math.min(page.clientWidth, page.clientHeight) * 0.42) + 'px');
        const curl = el('div', 'bk-curl ' + (dir === 'next' ? 'r' : 'l')); curl.append(el('i'));
        page.append(curl);
      }
      old.classList.add('out-' + dir);
    }
    try { api.sfx.tap(); } catch (e) { /* no sound */ }
    setNav();
    setTimeout(() => { if (old) old.remove(); neu.classList.remove('in-' + dir); busy = false; }, 980);
  }
  // turning the phone (or resizing a window) switches between one page and the spread, on the same page
  function onResize() {
    if (!bookEl || !bookEl.isConnected) { window.removeEventListener('resize', onResize); return; }
    const o = isPhone(), w = o && window.innerWidth > window.innerHeight;
    const was = wrapEl.classList.contains('wide');
    wrapEl.classList.toggle('wide', w);
    if (o === one && w === was) return;
    if (o !== one) { one = o; wrapEl.classList.toggle('one', one); if (!one) pg = Math.floor(pg / 2) * 2; }
    clearTimers(); busy = false;
    bookEl.replaceChildren(pageOf(pg));
    setNav();
  }
  function close() { clearTimers(); api.stopSpeech(); window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); bookEl = null; }
  function onKey(e) {
    if (!bookEl || !bookEl.isConnected) { window.removeEventListener('keydown', onKey); return; }
    if (e.key === 'ArrowRight') turn(1); else if (e.key === 'ArrowLeft') turn(-1);
  }

  // startAt: the story to open at (0 = the cover)
  function open(a, startAt) {
    api = a;
    if (!document.getElementById('story-css')) { const st = el('style'); st.id = 'story-css'; st.textContent = CSS; document.head.append(st); }
    clearTimers(); busy = false;
    one = isPhone();
    pg = Math.max(0, Math.min(total(), startAt | 0)) * 2;
    wrapEl = el('div', 'bk-wrap' + (one ? ' one' : '') + (one && window.innerWidth > window.innerHeight ? ' wide' : ''));
    bookEl = el('div', 'bk-book');
    prevBtn = el('button', 'btn small ghost'); prevBtn.type = 'button'; prevBtn.onclick = () => turn(-1);
    prevBtn.setAttribute('aria-label', L('Trang trước', 'Previous page'));
    nextBtn = el('button', 'btn small'); nextBtn.type = 'button'; nextBtn.onclick = () => turn(1);
    nextBtn.setAttribute('aria-label', L('Trang sau', 'Next page'));
    tocBtn = el('button', 'btn small ghost'); tocBtn.type = 'button'; tocBtn.onclick = () => goPage(one ? 1 : 0);
    tocBtn.setAttribute('aria-label', L('Mục lục', 'Contents'));
    navMid = el('div', 'mid');
    const nav = el('div', 'bk-nav');
    nav.append(prevBtn, tocBtn, navMid, nextBtn);
    wrapEl.append(bookEl, nav);
    // swipe to turn the page
    let sx = null, sy = 0;
    bookEl.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    bookEl.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) turn(dx < 0 ? 1 : -1); });
    api.screen(api.topbar(L('Lịch sử Toán học', 'History of Maths'), L('Lật từng trang để khám phá', 'Turn the pages to explore'), api.homeBtn(close), []), wrapEl);
    bookEl.append(pageOf(pg));                 // after the screen is up, so the story text can measure itself
    setNav();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
  }
  window.Story = { open };
})();
