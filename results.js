/* ============================================================
   results.js — TASK-16: розрахунки сервера на сторінці
   Підключається ПІСЛЯ kepler.js.
   1 закон: перигелій/афелій над малюнком; 2 закон: блок «Розрахунок»;
   3 закон: «Розрахунок» + покроковий блок під галактикою.
   ============================================================ */
(() => {
  const {S, T, $, h} = window.CosmicUI, R = T.results, K = T.kepler;
  const API = window.COSMIC_API || 'http://localhost:8000';
  const f2 = v => (+v).toFixed(2);
  let ell = null, tm;

  /* Запит; новий запит того ж виду скасовує старий */
  const ac = {};
  async function api(key, path, p) {
    ac[key]?.abort(); ac[key] = new AbortController();
    const r = await fetch(API + path + '?' + new URLSearchParams(p), {signal: ac[key].signal});
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  const fail = err => { if (err.name === 'AbortError') return; console.error(err);
    $('#calc').hidden = false; $('#calc').replaceChildren(h('p', '', R.err)); };

  const cap = () => $('#cap2').textContent = S.law === 1 && ell
    ? `${R.peri}: ${f2(ell.perihelion_au)} ${K.au} · ${R.aph}: ${f2(ell.aphelion_au)} ${K.au}` : '';

  function calc2(d) {
    const c = $('#calc'); c.hidden = false;
    c.replaceChildren(h('div', '', R.title), h('p', 'cy', d.formula_text || ''), h('p', '', R.formula2),
      h('p', '', `${R.area}: ${f2(d.sector_area_au2)} а.о.² · ${R.dist}: ${f2(d.distance_r_au)} ${K.au}`),
      h('p', '', d.explanation || ''));
  }
  function calc3() {
    const r = S.res, c = $('#calc'), T1 = r.planet1.period_years, T2 = r.planet2.period_years; c.hidden = false;
    c.replaceChildren(h('div', '', R.title), h('p', 'cy', R.formula3),
      h('p', '', `T₁ = √(${f2(S.a1)}³) ≈ ${f2(T1)} ${R.years}`), h('p', '', `T₂ = √(${f2(S.a2)}³) ≈ ${f2(T2)} ${R.years}`),
      h('p', '', `T₂² / a₂³ = ${f2(T2 * T2 / S.a2 ** 3)} ✓`), h('p', '', r.comparison || ''));
  }

  /* Рядок кроку від сервера → [заголовок, формула]: перенос рядка або перша двокрапка відділяє заголовок */
  const split = s => { s = String(s); const nl = s.indexOf('\n');
    if (nl > 0) return [s.slice(0, nl).trim(), s.slice(nl + 1).trim()];
    const j = s.indexOf(':'); return j > 0 && j < 80 ? [s.slice(0, j).trim(), s.slice(j + 1).trim()] : ['', s.trim()]; };
  /* Формула: числа до останнього «=» підсвічуємо, як у макеті */
  const fml = txt => { const d = h('div', 'fml'), parts = txt.split('=').map(x => x.trim());
    parts.forEach((p, i) => { if (i) d.append(' = ');
      if (i < parts.length - 1) p.split(/(\d+(?:[.,]\d+)?)/).forEach(x => /^\d/.test(x) ? d.append(h('span', 'hl', x)) : d.append(x));
      else d.append(p); });
    return d; };

  /* Покроковий блок: з'являється в 1-му (після кнопки) і в 3-му законі */
  function steps() {
    const box = $('#steps'), r = S.res; box.hidden = S.law === 2 || (S.law === 1 && !r); if (box.hidden) return;
    if (!r) { box.replaceChildren(h('h2', '', R.stepsTitle), h('div', 'chk', R.wait)); return; }
    const P = [r.planet1, r.planet2], len = Math.max(P[0].steps.length, P[1].steps.length), cur = S.cur;
    const col = (p, i) => {
      const w = h('div'), hd = h('div', 'ch');
      hd.append(h('span', '', `${R.planet} ${i + 1} · ${i ? S.p2 : S.p1}`), h('span', '', `a${i ? '₂' : '₁'} = ${f2(i ? S.a2 : S.a1)} ${K.au}`));
      w.append(hd);
      p.steps.forEach((s, k) => {
        const [ti, fo] = split(s);
        const st = h('div', 'st ' + (k < cur ? 'done' : k === cur ? 'cur' : 'fut')), b = h('div');
        st.append(h('span', 'c', k < cur ? '✓' : k + 1)); if (ti) b.append(h('small', '', ti)); b.append(fml(fo));
        st.append(b); w.append(st);
      });
      return w;
    };
    const cols = h('div', 'cols'); cols.append(col(P[0], 0), col(P[1], 1));
    const done = cur >= len;
    const chk = h('div', 'chk' + (done ? ' ok' : ''), done ? `${R.check} ✓  ${r.comparison || ''}` : R.checkWait);
    const ft = h('div', 'ft'), btns = h('div');
    const mk = (t, c, fn) => { const b = h('button', c, t); b.onclick = () => { fn(); steps(); }; return b; };
    if (done) btns.append(mk(R.restart, 'go', () => S.cur = 0));
    else btns.append(mk(R.back, 'ghost', () => S.cur = Math.max(0, cur - 1)), mk(R.all, 'ghost', () => S.cur = len), mk(R.next, 'go', () => S.cur = cur + 1));
    const pr = h('span', 'dots'), at = Math.min(cur + 1, len);
    for (let i = 0; i < len; i++) pr.append(h('i', i < at ? 'on' : ''));
    pr.append(h('em', '', R.step.replace('{i}', at).replace('{n}', len)));
    ft.append(pr, btns);
    box.replaceChildren(h('h2', '', R.stepsTitle), cols, chk, ft);
  }

  /* Реакція на зміни: з паузою 250 мс, щоб не засипати сервер під час руху повзунка */
  addEventListener('kepler:state', () => { clearTimeout(tm); tm = setTimeout(async () => {
    try {
      if (S.law === 1) ell = await api('e', '/api/kepler/ellipse', {a: S.a, e: S.e});
      cap();
      if (S.law === 2) calc2(await api('s', '/api/kepler/second-law', {angle_deg: S.theta, e: S.e, sectors: S.n, days: S.dt, a: S.a}));
      else if (S.law === 3 && S.res) calc3(); else $('#calc').hidden = true;
      steps();
    } catch (err) { fail(err); }
  }, 250); });

  /* Кнопка «Розрахувати період» (3 закон) */
  addEventListener('kepler:calc', async () => {
    S.cur = 0;
    try { S.res = await api('p', '/api/kepler/periods', {a1: S.a1, a2: S.a2}); calc3(); steps();
      window.dispatchEvent(new CustomEvent('kepler:state'));      // галактика покаже дві планети
      $('#steps').scrollIntoView({behavior: 'smooth', block: 'nearest'}); }
    catch (err) { fail(err); }
  });

  window.dispatchEvent(new CustomEvent('kepler:state'));
})();
