/* ============================================================
   kepler.js — TASK-15: поля введення та повзунки для кожного закону
   Підключається ПІСЛЯ app.js. Пише значення в спільний стан S
   і кличе emit(): на це реагує галактика (galaxy.js).
   ============================================================ */
(() => {
  if (!window.CosmicUI) { console.error('kepler.js: підключіть app.js перед цим файлом'); return; }
  const {S, T, PL, $, esc, emit} = window.CosmicUI, K = T.kepler;

  /* Межі: [мін, макс, крок] */
  const LIM = {e: [0, .9, .01], a: [.3, 5, .01], speed: [.1, 5, .1], theta: [0, 360, 1], n: [1, 12, 1],
               dt: [1, 365, 1], a1: [.3, 10, .01], a2: [.3, 10, .01]};

  const fld = (k, label, unit, slider = true) => { const [m, M, st] = LIM[k];
    return `<div class="f"><div class="fr"><span>${esc(label)}</span><span class="n"><input type="number" inputmode="decimal" data-n="${k}" min="${m}" max="${M}" step="${st}" value="${S[k]}">${unit ? `<i>${esc(unit)}</i>` : ''}</span></div>${slider ? `<input type="range" data-r="${k}" min="${m}" max="${M}" step="${st}" value="${S[k]}" aria-label="${esc(label)}">` : ''}</div>`; };
  const tog = (k, label) => `<label class="fr tg"><span>${esc(label)}</span><input type="checkbox" data-t="${k}" ${S[k] ? 'checked' : ''}></label>`;
  const sel = k => `<select data-p="${k}">${Object.keys(PL).map(n => `<option ${S[k] === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`;

  const duo = t => `<div class="card"><h3>${t}</h3><div class="f">${K.planet1}${sel('p1')}</div><div class="f">${K.planet2}${sel('p2')}</div>${fld('a1', K.r1, K.au)}${fld('a2', K.r2, K.au)}<button class="go" data-go>${K.calc}</button></div>`;

  function render() {
    const hint = `<div class="fr" style="font-size:10px;color:var(--mu)"><span>${K.eHintMin}</span><span>${K.eHintMax}</span></div>`;
    $('#set').innerHTML = `<div class="cap">${esc(T.settings.replace('{n}', S.law))}</div>` + ({
      1: `<div class="card"><h3>${K.orbitShape} · ${esc(S.focus)}</h3>${fld('e', K.eccentricity, '')}${hint}${fld('a', K.semiMajor, K.au)}${fld('speed', K.timeSpeed, 'x')}${tog('sec', K.sectors)}</div>` + duo(K.twoShort),
      2: `<div class="card"><h3>${K.equalAreas} · ${esc(S.focus)}</h3>${fld('theta', K.theta, K.deg)}${fld('e', K.e2, '')}${fld('n', K.count, '', false)}${fld('dt', K.dt, K.days, false)}${tog('hl', K.highlight)}</div>`,
      3: duo(K.twoPlanets)
    })[S.law];
  }

  const set = $('#set');
  /* Друк у полі й рух повзунка */
  set.addEventListener('input', e => {
    const t = e.target, k = t.dataset.n || t.dataset.r; if (!k) return;
    const v = parseFloat(String(t.value).replace(',', '.')), [m, M] = LIM[k];
    const ok = Number.isFinite(v) && v >= m && v <= M && (k === 'e' || v > 0);
    if (t.dataset.n) { t.parentElement.classList.toggle('bad', !ok); if (!ok) return; }
    S[k] = v;
    set.querySelectorAll(`[data-n="${k}"],[data-r="${k}"]`).forEach(x => { if (x !== t) x.value = v; });
    if (k === 'a1' || k === 'a2' || (S.law === 1 && (k === 'e' || k === 'a'))) S.res = null;          // радіус змінився — старий розрахунок застарів
    emit();
  });
  /* Кінець редагування (притискаємо до меж), перемикачі, списки планет */
  set.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.n) { const k = t.dataset.n, [m, M] = LIM[k]; let v = parseFloat(String(t.value).replace(',', '.'));
      v = Number.isFinite(v) ? Math.min(M, Math.max(m, v)) : S[k]; S[k] = Math.round(v * 100) / 100;
      set.querySelectorAll(`[data-n="${k}"],[data-r="${k}"]`).forEach(x => x.value = S[k]);
      t.parentElement.classList.remove('bad'); emit(); }
    if (t.dataset.t) { S[t.dataset.t] = t.checked; emit(); }
    if (t.dataset.p) { const k = t.dataset.p; S[k] = t.value; S[k === 'p1' ? 'a1' : 'a2'] = PL[t.value]; S.res = null; render(); emit(); }
  });
  set.addEventListener('click', e => { if (e.target.dataset.go !== undefined) window.dispatchEvent(new Event('kepler:calc')); });

  /* Клік по планеті в галактиці змінює S.focus — оновлюємо поля */
  window.addEventListener('galaxy:focus', render);

  window.CosmicKepler = {render};
  render();
})();
