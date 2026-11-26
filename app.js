/* ============================================================
   app.js — каркас сайту, стилі, спільний стан і міст до HTMLPage3
   Підключається ПІСЛЯ texts.js. Малює розмітку з макета.
   Галактика — це ваш HTMLPage3.html у блоці <iframe>.
   Сайт надсилає їй стан S через postMessage, а вона повідомляє про клік по планеті.
   ============================================================ */
(() => {
  if (!window.TEXTS) { document.body.textContent = 'Помилка: підключіть texts.js перед app.js.'; return; }
  const T = window.TEXTS;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
  const $ = s => document.querySelector(s);
  const h = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

  /* ===== СТИЛІ (за макетом Figma) ===== */
  const style = document.createElement('style');
  style.textContent = `
:root{--side:#1d1c2c;--main:#2d2250;--btn:#5d5a78;--panel:#3b3858;--inp:#26307a;--cy:#7ffcf4;--tx:#eef1fb;--mu:#a9a8c4;--cv:#0d1726;color-scheme:dark;box-sizing:border-box;font-family:"Segoe UI",system-ui,sans-serif;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
*{box-sizing:inherit}[hidden]{display:none!important}
html,body{height:100%;margin:0;background:var(--main);color:var(--tx)}
button,select,input{font:inherit}
.app{height:100%;display:grid;grid-template-columns:232px 1fr}
.side{background:var(--side);overflow:auto;padding:0 12px 14px}
.brand{padding:18px 4px;font-weight:700;font-size:14px}.brand b{color:var(--cy)}
.bt{display:flex;justify-content:space-between;width:100%;border:0;border-radius:8px;background:var(--btn);padding:10px 12px;font-weight:600;font-size:13px;margin-bottom:12px;color:var(--tx);cursor:pointer}
.laws{background:var(--panel);border-radius:8px;padding:10px 12px;margin:-2px 0 14px;display:flex;flex-direction:column;gap:6px}
.laws button{background:none;border:0;text-align:left;color:var(--mu);font-size:13px;padding:2px 0;cursor:pointer;border-bottom:2px solid transparent;width:max-content}
.laws button.on{color:#fff;border-color:#3d7fa8}
.cap{font-size:11px;color:var(--mu);margin:8px 2px 6px}
.card{background:var(--panel);border-radius:10px;padding:10px;margin-bottom:10px;display:flex;flex-direction:column;gap:10px;font-size:12px}
.card h3{margin:0;font-size:12px}
.f{display:flex;flex-direction:column;gap:6px;color:var(--mu)}
.fr{display:flex;justify-content:space-between;align-items:center;gap:8px}
.n{display:flex;align-items:center;gap:3px;background:var(--inp);border:1px solid #4a56b0;border-radius:4px;padding:2px 4px}
.n input{width:52px;background:none;border:0;color:#fff;outline:0;font-size:12px}
.n.bad{border-color:#ff6b6b}.n i{font-size:9px;font-style:normal;color:var(--mu)}
input[type=range]{width:100%;accent-color:var(--cy)}
select{background:var(--inp);color:#fff;border:1px solid #4a56b0;border-radius:6px;padding:7px;width:100%}
.tg input{appearance:none;width:42px;height:22px;border-radius:11px;background:#4b4a6c;position:relative;cursor:pointer;margin:0;flex:none}
.tg input::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}
.tg input:checked{background:var(--cy)}.tg input:checked::after{transform:translateX(20px)}
.go{border:0;background:var(--cy);color:#06211f;font-weight:700;border-radius:6px;padding:9px 12px;cursor:pointer;font-size:12px}
.ghost{background:none;border:1px solid #6d6a92;color:var(--tx);border-radius:6px;padding:7px 12px;cursor:pointer;font-size:12px}
.calc .cy{color:var(--cy);font-weight:600}.calc p{margin:0;line-height:1.45}
.main{display:flex;flex-direction:column;min-width:0;min-height:0}
.bar{height:44px;flex:none;border-bottom:1px solid #4a3f78}
.work{flex:1;min-height:0;padding:18px;display:flex;flex-direction:column;gap:14px;overflow:auto}
.cv{flex:1;min-height:240px;background:#000010;border-radius:6px;position:relative;overflow:hidden}
.cap2{z-index:2;position:absolute;left:12px;top:10px;font-size:12px;color:var(--mu)}
.steps h2{margin:0 0 10px;font-size:17px}
.cv:has(+ .steps:not([hidden])){flex:0 0 40%;min-height:220px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.ch{display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px}.ch span:last-child{color:var(--cy)}
.st{display:flex;gap:10px;align-items:center;border:1px solid #5a4f8c;background:#241b45;border-radius:8px;padding:8px 10px;margin-bottom:8px;font-size:13px}
.st small{display:block;font-size:11px;color:var(--mu);margin-bottom:3px}
.st .c{flex:none;width:22px;height:22px;border-radius:50%;background:#55507f;display:grid;place-items:center;font-size:11px}
.st.done .c{background:var(--cy);color:#06211f;font-weight:700}
.st.cur{border-color:var(--cy)}.st.cur .c{background:var(--cy);color:#06211f;font-weight:700}
.st.fut{opacity:.45}
.chk{border:1px solid #5a4f8c;border-radius:8px;padding:9px 12px;font-size:13px;color:var(--mu);margin-top:4px}
.chk.ok{border-color:#2fbf5f;background:#14502d;color:#7dff9f}
.ft{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:11px;color:var(--mu);gap:8px;flex-wrap:wrap}
.ft div{display:flex;gap:8px}
@media(max-width:800px){.app{grid-template-columns:1fr;grid-template-rows:auto 1fr;height:auto;min-height:100%}.side{max-height:46vh}.cols{grid-template-columns:1fr}}
.hl{color:var(--cy);font-weight:600}.fml{font-size:13px}
.dots{display:flex;align-items:center;gap:4px}.dots i{width:7px;height:7px;border-radius:50%;background:#55507f}
.dots i.on{background:var(--cy)}.dots em{font-style:normal;margin-left:6px}
.cv iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}`;
  document.head.appendChild(style);

  /* Радіуси орбіт у а.о. для списків планет (назви збігаються з HTMLPage3) */
  const PL = {'Меркурій': .39, 'Венера': .72, 'Земля': 1, 'Марс': 1.52, 'Юпітер': 5.2};

  /* ЄДИНИЙ СТАН. Початкові e та a беруться від Землі з вашої галактики (e=0.12, a=10 → 1 а.о.) */
  const S = {
    law: 1, focus: 'Земля', e: .12, a: 1, speed: 1, sec: true,          // 1-й закон
    theta: 120, n: 4, dt: 30, hl: true,                                  // 2-й закон
    p1: 'Земля', p2: 'Марс', a1: 1, a2: 1.52, res: null, cur: 0          // 3-й закон
  };
  const emit = () => window.dispatchEvent(new CustomEvent('kepler:state'));   // «щось змінилось»

  document.title = T.pageTitle;
  document.body.innerHTML = `
  <div class="app">
    <aside class="side">
      <div class="brand">${esc(T.brandFirst)} <b>${esc(T.brandSecond)}</b></div>
      <button class="bt" id="tl">${esc(T.lawsGroup)} <span>^</span></button>
      <div class="laws" id="laws"></div>
      <button class="bt">${esc(T.tour)} <span>&gt;</span></button>
      <button class="bt">${esc(T.configs)} <span>&gt;</span></button>
      <div id="set"></div>
      <div class="card calc" id="calc" hidden></div>
    </aside>
    <main class="main"><div class="bar"></div>
      <div class="work">
        <div class="cv" id="cv">
          <iframe id="gal" src="HTMLPage3.html" title="${esc(T.galaxyTitle)}"></iframe>
          <div class="cap2" id="cap2"></div>
        </div>
        <section class="steps" id="steps" hidden></section>
      </div>
    </main>
  </div>`;

  /* ===== МІСТ ДО ГАЛАКТИКИ (HTMLPage3.html) ===== */
  const frame = $('#gal');
  const post = () => frame.contentWindow && frame.contentWindow.postMessage(
    {type: 'state', state: JSON.parse(JSON.stringify(S))}, '*');       // копія стану для галактики
  window.addEventListener('kepler:state', post);                       // будь-яка зміна → у галактику
  window.addEventListener('message', e => {
    if (e.source !== frame.contentWindow) return;
    const m = e.data || {};
    if (m.type === 'ready') post();                                    // галактика завантажилась
    if (m.type === 'focus' && S.law !== 3) {                           // клік по планеті
      S.focus = m.name; S.e = m.e; S.a = m.a;
      window.dispatchEvent(new Event('galaxy:focus'));                 // панель оновить поля
      emit();
    }
  });

  /* ===== Список законів ===== */
  function renderLaws() {
    $('#laws').replaceChildren(...T.laws.map((t, i) => {
      const b = h('button', S.law === i + 1 ? 'on' : '', t); b.dataset.law = i + 1; return b;
    }));
  }
  $('#laws').onclick = e => {
    const l = +e.target.dataset.law; if (!l) return;
    S.law = l; S.cur = 0; renderLaws();
    window.CosmicKepler.render();            // нові налаштування для цього закону
    emit();                                  // галактика й розрахунки перебудовуються
  };
  $('#tl').onclick = () => $('#laws').hidden = !$('#laws').hidden;
  renderLaws();

  window.CosmicUI = {S, T, PL, $, h, esc, emit};
})();
