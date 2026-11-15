/* ============================================================
   app.js — інтерфейс Cosmic Dynamics
   Усі тексти беруться з texts.js
   ============================================================ */
(() => {
  //ПЕРЕВІРКА, ЧИ ПІДКЛЮЧЕНО texts.js
  if (!window.TEXTS) {
    document.body.textContent =
      'Помилка: не знайдено texts.js. Підключіть його перед app.js.';
    return;
  }
  const T = window.TEXTS;

  // НАЛАШТУВАННЯ (не тексти)
  const CONFIG = {
    startDate: Date.UTC(2024, 10, 20, 14, 32),
    placeholder: 'green'            // 'green' = зелена картинка, 'none' = порожньо
  };

  /* Захист від випадкових символів < > & у текстах */
  const esc = s => String(s).replace(/[&<>"]/g,
    c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));

  document.title = T.pageTitle;
  const meta = document.querySelector('meta[name="viewport"]') || document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
  if (!meta.parentNode) document.head.appendChild(meta);

  // СТИЛІ
  const style = document.createElement('style');
  style.textContent = `
  :root{--bg:#070d1a;--panel:#0e1829;--panel2:#121f35;--line:#22334f;--text:#e6eefc;--muted:#8fa3c4;--accent:#4fd1c5;--accent2:#3b82f6;
    color-scheme:dark;box-sizing:border-box;font-family:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;
    padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
  *,*::before,*::after{box-sizing:inherit}
  html,body{height:100%;margin:0;background:var(--bg);color:var(--text)}
  button{font:inherit;color:inherit;cursor:pointer}

  .app{height:100%;display:grid;grid-template-columns:56px 250px 1fr;min-height:0}

  .rail{background:var(--panel);border-right:1px solid var(--line);display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0}
  .rail button{width:38px;height:38px;border-radius:10px;border:0;background:none;color:var(--muted);font-size:18px}
  .rail button.on{background:var(--accent2);color:#fff}
  .rail .logo{font-size:24px;margin-bottom:6px}
  .rail .bottom{margin-top:auto}

  .side{background:var(--panel);border-right:1px solid var(--line);padding:14px 12px;overflow:auto;display:flex;flex-direction:column;gap:12px}
  .brand{font-weight:700;letter-spacing:.06em;font-size:15px}
  .brand b{color:var(--accent)}
  .search{width:100%;padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}
  .grp{background:var(--panel2);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .grp>button{width:100%;display:flex;justify-content:space-between;padding:10px 12px;background:none;border:0;font-weight:600}
  .grp ul{list-style:none;margin:0;padding:0 6px 8px;display:none}
  .grp.open ul{display:block}
  .grp li button{width:100%;text-align:left;padding:8px 10px;border:0;border-radius:8px;background:none;color:var(--muted);font-size:14px}
  .grp li button:hover{background:#1b2c49;color:var(--text)}
  .grp li button.on{background:#1b2c49;color:var(--accent)}
  .nav button{display:block;width:100%;text-align:left;padding:10px 8px;border:0;background:none;color:var(--muted)}
  .nav button:hover{color:var(--text)}

  .main{display:flex;flex-direction:column;min-width:0;min-height:0;padding:16px;gap:12px}
  .head{display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap}
  .head h1{margin:0;font-size:20px;font-weight:600}
  .head .right{display:flex;align-items:center;gap:14px;color:var(--muted);font-size:13px}
  .avatar{width:28px;height:28px;border-radius:50%;background:var(--accent2);display:inline-grid;place-items:center;color:#fff;font-size:12px;font-weight:600}
  .burger{display:none;border:1px solid var(--line);background:var(--panel2);border-radius:8px;padding:6px 10px}

  .stage{position:relative;flex:1;min-height:260px;border:1px solid var(--line);border-radius:14px;overflow:hidden;
    background:radial-gradient(ellipse at 50% 45%,#10213d,#060b16 70%)}
  #planet-area{position:absolute;inset:0;display:grid;place-items:center}
  #planet-area .green{width:70%;height:70%;border-radius:12px;background:#2e9e4f;display:grid;place-items:center;color:#eaffef;font-size:14px}

  .hud{position:absolute;right:12px;bottom:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;
    max-width:calc(100% - 24px);background:rgba(10,18,32,.82);border:1px solid var(--line);border-radius:12px;padding:6px 8px;backdrop-filter:blur(6px)}
  .hud button{border:0;background:none;padding:6px 9px;border-radius:8px;font-size:13px;color:var(--muted)}
  .hud button.on{background:#24385c;color:#fff}
  .hud input{width:90px;accent-color:var(--accent)}
  .hud .sp{font-size:13px;color:var(--muted)}
  .zoomtag{position:absolute;right:12px;bottom:68px;display:flex;gap:6px}
  .zoomtag button{border:1px solid var(--line);background:rgba(10,18,32,.82);border-radius:8px;padding:5px 9px;font-size:13px}

  .info{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--muted)}
  .info div{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
  .info b{color:var(--text);margin-left:6px}
  .foot{font-size:12px;color:var(--muted)}

  @media (max-width:820px){
    .app{grid-template-columns:1fr}
    .rail{display:none}
    .side{position:fixed;z-index:5;left:0;top:0;bottom:0;width:260px;transform:translateX(-100%);transition:transform .2s}
    .side.show{transform:none}
    .burger{display:inline-block}
    .main{padding:10px}
    .head h1{font-size:16px}
  }
  @media (prefers-reduced-motion:reduce){.side{transition:none}}`;
  document.head.appendChild(style);

  // РОЗМІТКА (усі тексти з T)
  const menuItems = (items, attr, firstOn) => items.map((it, i) =>
    `<li><button class="item${firstOn && i === 0 ? ' on' : ''}" data-${attr}="${esc(it.value)}">${esc(it.label)}</button></li>`
  ).join('');

  document.body.innerHTML = `
  <div class="app">
    <nav class="rail" aria-label="${esc(T.sectionsAria)}">
      <div class="logo">🪐</div>
      <button>▦</button><button class="on">◍</button><button>➶</button><button>⧖</button><button>▤</button>
      <button class="bottom">⎋</button>
    </nav>

    <aside class="side" id="side">
      <div class="brand">${esc(T.brandFirst)} <b>${esc(T.brandSecond)}</b></div>
      <input class="search" placeholder="${esc(T.searchPlaceholder)}" aria-label="${esc(T.searchAria)}">

      <div class="grp open"><button>${esc(T.keplerGroup)} <span>⌄</span></button>
        <ul>${menuItems(T.keplerItems, 'kepler', true)}</ul></div>

      <div class="grp open"><button>${esc(T.lagrangeGroup)} <span>⌄</span></button>
        <ul>${menuItems(T.lagrangeItems, 'lpoint', false)}</ul></div>

      <div class="nav">${T.navItems.map(n => `<button>${esc(n)}</button>`).join('')}</div>
    </aside>

    <main class="main">
      <div class="head">
        <div style="display:flex;gap:10px;align-items:center">
          <button class="burger" id="burger" aria-label="${esc(T.menuAria)}">☰</button>
          <h1>${esc(T.title)}</h1>
        </div>
        <div class="right">
          <span>${esc(T.simulationDate)} <span id="date">—</span></span>
          <span class="avatar" id="avatar"></span><span>${esc(T.userName)}</span>
        </div>
      </div>

      <div class="stage" id="stage">
        <div id="planet-area"></div>
        <div class="zoomtag">
          <button id="zin" aria-label="${esc(T.zoomInAria)}">＋</button>
          <button id="zout" aria-label="${esc(T.zoomOutAria)}">－</button>
        </div>
        <div class="hud">
          <button id="play" class="on">❚❚</button>
          <span class="sp">${esc(T.speed)}</span>
          <input type="range" id="speed" min="0.1" max="5" step="0.1" value="1">
          <button id="b2d">${esc(T.view2d)}</button>
          <button id="b3d" class="on">${esc(T.view3d)}</button>
          <button id="blabels" class="on">${esc(T.showLabels)}</button>
          <button id="bfocus">${esc(T.focusOnEarth)}</button>
        </div>
      </div>

      <div class="info">
        <div>${esc(T.keplerFocusLabel)}<b id="kf">${esc(T.keplerFocusDefault)}</b></div>
        <div>${esc(T.lpointFocusLabel)}<b id="lf">${esc(T.lpointFocusDefault)}</b></div>
      </div>
      <div class="foot">${esc(T.copyright)}</div>
    </main>
  </div>`;

  const $ = id => document.getElementById(id);
  $('avatar').textContent = T.userName.split(' ').map(w => w[0]).join('');

  // ОБЛАСТЬ ПЛАНЕТ (заглушка)
  /* Сюди 3D-розробник підключить Three.js:
     CosmicUI.mountPlanetArea(контейнер) або просто CosmicUI.stage */
  function mountPlanetArea(el) {
    el.innerHTML = '';
    if (CONFIG.placeholder === 'green') {
      const g = document.createElement('div');
      g.className = 'green';
      g.textContent = T.planetAreaPlaceholder;
      el.appendChild(g);
    }
  }
  mountPlanetArea($('planet-area'));

  //СТАН ІНТЕРФЕЙСУ
  const state = {playing: true, speed: 1, view: '3d', labels: true, focusEarth: false, zoom: 1, simTime: 0};
  const setOn = (el, on) => el.classList.toggle('on', !!on);

  $('play').onclick = e => {
    state.playing = !state.playing;
    e.target.textContent = state.playing ? '❚❚' : '▶';
    setOn(e.target, state.playing);
  };
  $('speed').oninput = e => state.speed = +e.target.value;
  $('b2d').onclick = () => { state.view = '2d'; setOn($('b2d'), 1); setOn($('b3d'), 0); };
  $('b3d').onclick = () => { state.view = '3d'; setOn($('b3d'), 1); setOn($('b2d'), 0); };
  $('blabels').onclick = e => { state.labels = !state.labels; setOn(e.target, state.labels); };
  $('bfocus').onclick = e => { state.focusEarth = !state.focusEarth; setOn(e.target, state.focusEarth); };
  $('zin').onclick = () => state.zoom = Math.min(5, state.zoom * 1.25);
  $('zout').onclick = () => state.zoom = Math.max(.5, state.zoom / 1.25);

  //БІЧНЕ МЕНЮ
  document.querySelectorAll('.grp>button').forEach(b =>
    b.onclick = () => b.parentElement.classList.toggle('open'));

  document.querySelectorAll('.item').forEach(b => b.onclick = () => {
    document.querySelectorAll('.item').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    if (b.dataset.kepler) $('kf').textContent = b.dataset.kepler;
    if (b.dataset.lpoint) $('lf').textContent = b.dataset.lpoint;
    $('side').classList.remove('show');
  });
  $('burger').onclick = () => $('side').classList.toggle('show');

  // ДАТА СИМУЛЯЦІЇ
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (state.playing) state.simTime += dt * 0.1 * state.speed;       // у роках
    const d = new Date(CONFIG.startDate + state.simTime * 365.25 * 864e5);
    $('date').textContent = d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* Публічний доступ для команди (3D, бекенд) */
  window.CosmicUI = {state, config: CONFIG, texts: T, mountPlanetArea, stage: $('planet-area')};
})();