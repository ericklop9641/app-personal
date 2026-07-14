/* ============================================================
   Sensia — lógica de la app (sin dependencias, datos locales)
   Toda la información se guarda SOLO en este dispositivo
   (localStorage). Nada se envía a ningún servidor: privacidad total.
   ============================================================ */

const DB_KEY = 'sensia.v1';
const DAY_MS = 86400000;

const store = {
  load() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; }
    catch { return {}; }
  },
  save(d) { localStorage.setItem(DB_KEY, JSON.stringify(d)); }
};

let DB = store.load();

// Estado inicial
if (!DB.startDate) {
  DB = {
    startDate: todayKey(),
    days: {},        // { 'YYYY-MM-DD': { tasks:{}, checkin:{}, journal:[] } }
    why: '',
    lastRelapse: null
  };
  store.save(DB);
}

// ---------- utilidades de fecha ----------
function todayKey(offset = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setTime(d.getTime() + offset * DAY_MS);
  return d.toISOString().slice(0, 10);
}
function daysSinceStart() {
  const start = new Date(DB.startDate + 'T00:00:00');
  const now = new Date(todayKey() + 'T00:00:00');
  return Math.floor((now - start) / DAY_MS);
}
function currentDayNumber() {
  return Math.min(90, daysSinceStart() + 1);
}
function dayRecord(key) {
  if (!DB.days[key]) DB.days[key] = { tasks: {}, checkin: null, journal: [] };
  return DB.days[key];
}
function fmtDate(key) {
  const d = new Date(key + 'T00:00:00');
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ---------- helpers de UI ----------
const view = document.getElementById('view');
function h(html) { return html; }
function esc(s) { return (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

let toastTimer;
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function haptic() { if (navigator.vibrate) navigator.vibrate(12); }

// ============================================================
//  VISTA: HOY
// ============================================================
function renderToday() {
  const dn = currentDayNumber();
  const day = PROGRAM[dn - 1];
  const key = todayKey();
  const rec = dayRecord(key);
  const total = day.tasks.length;
  const done = day.tasks.filter((_, i) => rec.tasks[i]).length;
  const pct = Math.round((done / total) * 100);

  const streak = computeCleanStreak();
  const phase = PHASES.find(p => p.id === day.phase);

  const circ = 2 * Math.PI * 82;
  const offset = circ * (1 - done / total);

  view.innerHTML = h(`
    <div class="hero">
      <div class="eyebrow">Fase ${day.phase} · ${esc(day.phaseName)}</div>
      <div class="ring-wrap">
        <svg width="190" height="190" viewBox="0 0 190 190">
          <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/>
          </linearGradient></defs>
          <circle class="ring-bg" cx="95" cy="95" r="82"></circle>
          <circle class="ring-fg" cx="95" cy="95" r="82" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"></circle>
        </svg>
        <div class="ring-center">
          <div class="ring-day">DÍA</div>
          <div class="ring-num">${dn}</div>
          <div class="ring-total">${done}/${total} tareas · ${pct}%</div>
        </div>
      </div>
      <div class="phase-bar">
        ${PHASES.map(p => {
          const w = p.id < day.phase ? 100 : p.id > day.phase ? 0
            : Math.round(((dn - p.range[0] + 1) / (p.range[1] - p.range[0] + 1)) * 100);
          return `<div class="phase-seg"><i style="width:${w}%"></i></div>`;
        }).join('')}
      </div>
    </div>

    <div class="card tight" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div class="small muted">Racha limpia</div>
        <div style="font-size:26px;font-weight:800">${streak} ${streak === 1 ? 'día' : 'días'} 🔥</div>
      </div>
      <button class="btn ghost small" id="checkinBtn">${rec.checkin ? '✓ Check-in' : 'Check-in'}</button>
    </div>

    ${day.milestone ? `
    <div class="card" style="border-color:${phase.color}">
      <div class="chip" style="background:${phase.color}22;border-color:${phase.color}55;color:#fff;margin-bottom:10px">
        <span class="dot" style="background:${phase.color}"></span> Hito del día
      </div>
      <h3>${esc(day.milestone.title)}</h3>
      <p class="muted" style="margin-top:6px;font-size:14.5px">${esc(day.milestone.body)}</p>
    </div>` : ''}

    <div class="card">
      <h2>Plan de hoy</h2>
      <div id="taskList">
        ${day.tasks.map((t, i) => `
          <div class="task ${rec.tasks[i] ? 'done' : ''}" data-i="${i}">
            <div class="checkbox"><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg></div>
            <div class="task-label">${esc(t)}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="chip" style="margin-bottom:12px"><span class="dot" style="background:var(--accent)"></span> Ciencia de hoy</div>
      <h3>${esc(day.science.t)}</h3>
      <p class="muted" style="margin-top:6px;font-size:14.5px">${esc(day.science.d)}</p>
    </div>

    <div class="card">
      <div class="chip" style="margin-bottom:12px"><span class="dot" style="background:var(--accent-2)"></span> Práctica · ${day.practice.min} min</div>
      <h3>${esc(day.practice.t)}</h3>
      <p class="muted" style="margin-top:6px;font-size:14.5px">${esc(day.practice.d)}</p>
    </div>

    <div class="card">
      <h3 style="margin-bottom:8px">Reflexión de hoy</h3>
      <p class="muted small" style="margin-bottom:12px">${esc(day.journal)}</p>
      <button class="btn ghost small" id="quickJournal">Escribir en el diario</button>
    </div>

    <div class="pill-note">Tus datos se guardan solo en este iPhone. Añade la app a la pantalla de inicio para usarla como una app nativa (Compartir → “Añadir a inicio”).</div>
  `);

  // eventos
  document.querySelectorAll('.task').forEach(el => {
    el.addEventListener('click', () => {
      const i = +el.dataset.i;
      rec.tasks[i] = !rec.tasks[i];
      store.save(DB);
      haptic();
      renderToday();
      if (Object.keys(rec.tasks).filter(k => rec.tasks[k]).length === total) {
        setTimeout(() => toast('¡Día completado! Bien hecho 🎉'), 200);
      }
    });
  });
  document.getElementById('checkinBtn').onclick = () => openCheckin(key);
  document.getElementById('quickJournal').onclick = () => { switchTab('journal'); setTimeout(() => document.getElementById('journalInput')?.focus(), 100); };
}

// ---------- Check-in diario (modal simple en la vista) ----------
function openCheckin(key) {
  const rec = dayRecord(key);
  const c = rec.checkin || {};
  view.innerHTML = h(`
    <div class="eyebrow">Check-in diario</div>
    <h1>¿Cómo estuvo tu día?</h1>
    <p class="muted small" style="margin-top:6px">Honesto y sin juicio. Esto entrena tu autoconciencia.</p>

    <div class="card">
      <div class="field">
        <label>¿Viste pornografía o erótica hoy?</label>
        <div class="segmented" data-k="porn">
          <button data-v="no" class="${c.porn==='no'?'sel':''}">No</button>
          <button data-v="si" class="${c.porn==='si'?'sel':''}">Sí</button>
        </div>
      </div>
      <div class="field">
        <label>¿Hubo masturbación compulsiva?</label>
        <div class="segmented" data-k="mast">
          <button data-v="no" class="${c.mast==='no'?'sel':''}">No</button>
          <button data-v="si" class="${c.mast==='si'?'sel':''}">Sí</button>
        </div>
      </div>
      <div class="field">
        <label>Intensidad de impulsos (1 nada · 5 muy fuerte)</label>
        <div class="scale" data-k="urge">
          ${[1,2,3,4,5].map(v=>`<button data-v="${v}" class="${c.urge==v?'sel':''}">${v}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Ánimo (1 bajo · 5 alto)</label>
        <div class="scale" data-k="mood">
          ${[1,2,3,4,5].map(v=>`<button data-v="${v}" class="${c.mood==v?'sel':''}">${v}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Energía (1 baja · 5 alta)</label>
        <div class="scale" data-k="energy">
          ${[1,2,3,4,5].map(v=>`<button data-v="${v}" class="${c.energy==v?'sel':''}">${v}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Conexión con tu pareja hoy (1 baja · 5 alta)</label>
        <div class="scale" data-k="bond">
          ${[1,2,3,4,5].map(v=>`<button data-v="${v}" class="${c.bond==v?'sel':''}">${v}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="spacer"></div>
    <button class="btn" id="saveCheckin">Guardar check-in</button>
    <div class="spacer"></div>
    <button class="btn ghost" id="backToday">Volver</button>
  `);

  const draft = Object.assign({}, c);
  view.querySelectorAll('[data-k]').forEach(group => {
    const k = group.dataset.k;
    group.querySelectorAll('button').forEach(b => {
      b.onclick = () => {
        group.querySelectorAll('button').forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
        draft[k] = b.dataset.v;
        haptic();
      };
    });
  });
  document.getElementById('saveCheckin').onclick = () => {
    rec.checkin = draft;
    // registrar recaída para la racha
    if (draft.porn === 'si' || draft.mast === 'si') DB.lastRelapse = key;
    store.save(DB);
    toast('Check-in guardado ✓');
    switchTab('today');
  };
  document.getElementById('backToday').onclick = () => switchTab('today');
}

// ============================================================
//  VISTA: PROGRESO
// ============================================================
function renderProgress() {
  const dn = currentDayNumber();
  const streak = computeCleanStreak();
  const stats = computeStats();

  // calendario de los últimos 35 días
  let cal = '';
  for (let i = 34; i >= 0; i--) {
    const key = todayKey(-i);
    const rec = DB.days[key];
    const dayN = daysSinceStartFrom(key) + 1;
    let cls = 'cal-cell';
    if (key === todayKey()) cls += ' today';
    if (rec && rec.checkin && (rec.checkin.porn === 'si' || rec.checkin.mast === 'si')) cls += ' relapse';
    else if (rec && (rec.checkin || allTasksDone(rec, dayN))) cls += ' done';
    cal += `<div class="${cls}">${dayN >= 1 && dayN <= 90 ? dayN : ''}</div>`;
  }

  view.innerHTML = h(`
    <div class="eyebrow">Tu evolución</div>
    <h1>Progreso</h1>

    <div class="stat-grid">
      <div class="stat"><div class="num">${streak}</div><div class="lbl">Racha limpia (días)</div></div>
      <div class="stat"><div class="num">${dn}/90</div><div class="lbl">Día del programa</div></div>
      <div class="stat"><div class="num">${stats.cleanDays}</div><div class="lbl">Días limpios totales</div></div>
      <div class="stat"><div class="num">${stats.checkins}</div><div class="lbl">Check-ins hechos</div></div>
    </div>

    <div class="card">
      <h2>Últimos 35 días</h2>
      <div class="cal">${cal}</div>
      <div style="display:flex;gap:14px;margin-top:14px;flex-wrap:wrap">
        <span class="chip"><span class="dot" style="background:var(--accent)"></span> Registrado</span>
        <span class="chip"><span class="dot" style="background:var(--danger)"></span> Recaída</span>
        <span class="chip"><span class="dot" style="background:var(--faint)"></span> Sin datos</span>
      </div>
    </div>

    <div class="card">
      <h2>Tendencias (media reciente)</h2>
      ${trendRow('Ánimo', stats.mood)}
      ${trendRow('Energía', stats.energy)}
      ${trendRow('Conexión con tu pareja', stats.bond)}
      ${trendRow('Intensidad de impulsos', stats.urge, true)}
      <p class="muted small" style="margin-top:14px">A medida que el sistema de recompensa se recalibra, lo habitual es ver el ánimo, la energía y la conexión subir, y los impulsos bajar. Dale semanas.</p>
    </div>

    <div class="card">
      <h3>Tu porqué</h3>
      <p class="muted small" style="margin:6px 0 12px">Léelo cuando flaquees. La motivación intrínseca sostiene el cambio.</p>
      <textarea id="whyInput" rows="3" placeholder="Ej. Quiero estar presente y disfrutar plenamente con mi pareja...">${esc(DB.why)}</textarea>
      <div class="spacer"></div>
      <button class="btn ghost small" id="saveWhy">Guardar</button>
    </div>

    <div class="divider"></div>
    <button class="btn ghost" id="resetBtn">Reiniciar programa desde hoy</button>
    <div class="spacer"></div>
  `);

  document.getElementById('saveWhy').onclick = () => {
    DB.why = document.getElementById('whyInput').value.trim();
    store.save(DB); toast('Guardado ✓');
  };
  document.getElementById('resetBtn').onclick = () => {
    if (confirm('¿Reiniciar el programa desde el día 1 con la fecha de hoy? Se conservan tus datos anteriores en el diario.')) {
      DB.startDate = todayKey();
      store.save(DB); toast('Programa reiniciado');
      switchTab('today');
    }
  };
}

function trendRow(label, val, invert) {
  const v = val || 0;
  const w = Math.round((v / 5) * 100);
  const grad = invert
    ? 'linear-gradient(90deg,#34d399,#fbbf24)'
    : 'linear-gradient(90deg,var(--accent),var(--accent-2))';
  return `<div style="margin-top:12px">
    <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px">
      <span class="muted">${label}</span><span style="font-weight:700">${v ? v.toFixed(1) : '—'}</span>
    </div>
    <div class="phase-seg" style="height:8px"><i style="width:${w}%;background:${grad}"></i></div>
  </div>`;
}

// ============================================================
//  VISTA: IMPULSO (urge surfing + respiración guiada)
// ============================================================
let breathState = null;
function renderPanic() {
  stopBreath();
  view.innerHTML = h(`
    <div class="eyebrow">Estás a salvo</div>
    <h1>Surfea el impulso</h1>
    <p class="muted" style="margin-top:8px;font-size:15px">Un impulso es una ola: sube, rompe y baja. No tienes que luchar contra él ni cederle. Solo respira y obsérvalo hasta que pase. Rara vez dura más de 20 minutos.</p>

    <div class="card">
      <div class="breath-wrap">
        <div class="breath-orb" id="orb"><span id="orbTxt">Empezar</span></div>
        <div class="breath-count" id="breathCount">Pulsa para respirar conmigo</div>
      </div>
      <button class="btn" id="breathBtn">Iniciar respiración guiada</button>
    </div>

    <div class="card">
      <h3>Mientras la ola baja</h3>
      <div style="margin-top:10px">
        ${[
          'Nombra la emoción real debajo del impulso: ¿aburrimiento, estrés, soledad, cansancio?',
          '¿Dónde sientes el impulso en el cuerpo? Obsérvalo con curiosidad, sin actuar.',
          'Cambia de contexto: sal de la habitación, bebe agua fría, mueve el cuerpo 2 minutos.',
          'Recuerda tu porqué. Esto es exactamente el momento que estás entrenando.'
        ].map(t => `<p class="muted" style="font-size:14.5px;padding:9px 0;border-bottom:1px solid var(--line)">• ${esc(t)}</p>`).join('')}
      </div>
    </div>

    ${DB.why ? `<div class="pill-note"><strong style="color:var(--txt)">Tu porqué:</strong> ${esc(DB.why)}</div>` : ''}

    <div class="spacer"></div>
    <button class="btn ghost" id="passedBtn">La ola pasó 🌊 Lo logré</button>
  `);

  document.getElementById('breathBtn').onclick = toggleBreath;
  document.getElementById('orb').onclick = toggleBreath;
  document.getElementById('passedBtn').onclick = () => {
    stopBreath();
    toast('Cada ola que surfeas te hace más fuerte 💪');
    switchTab('today');
  };
}

function toggleBreath() {
  if (breathState) stopBreath();
  else startBreath();
}
function startBreath() {
  const orb = document.getElementById('orb');
  const txt = document.getElementById('orbTxt');
  const count = document.getElementById('breathCount');
  const btn = document.getElementById('breathBtn');
  if (btn) btn.textContent = 'Detener';
  // ciclo 4-7-8 (en ms): inhala 4, retén 7, exhala 8
  const cycle = [
    { label: 'Inhala', cls: 'in', ms: 4000 },
    { label: 'Retén', cls: '', ms: 7000 },
    { label: 'Exhala', cls: 'out', ms: 8000 }
  ];
  let idx = 0, rounds = 0;
  function step() {
    const s = cycle[idx];
    orb.classList.remove('in', 'out');
    if (s.cls) orb.classList.add(s.cls);
    txt.textContent = s.label;
    count.textContent = `Ronda ${rounds + 1} · ${s.label} ${Math.round(s.ms/1000)}s`;
    haptic();
    breathState = setTimeout(() => {
      idx++;
      if (idx >= cycle.length) { idx = 0; rounds++; }
      step();
    }, s.ms);
  }
  step();
}
function stopBreath() {
  if (breathState) { clearTimeout(breathState); breathState = null; }
  const orb = document.getElementById('orb');
  const txt = document.getElementById('orbTxt');
  const btn = document.getElementById('breathBtn');
  const count = document.getElementById('breathCount');
  if (orb) orb.classList.remove('in', 'out');
  if (txt) txt.textContent = 'Empezar';
  if (btn) btn.textContent = 'Iniciar respiración guiada';
  if (count) count.textContent = 'Pulsa para respirar conmigo';
}

// ============================================================
//  VISTA: APRENDER
// ============================================================
function renderLearn() {
  view.innerHTML = h(`
    <div class="eyebrow">Psicoeducación</div>
    <h1>Aprender</h1>
    <p class="muted" style="margin-top:8px;font-size:15px">Entender qué te pasa quita culpa y da control. Contenido basado en sexología y neurociencia.</p>
    ${LIBRARY.map(a => `
      <details class="accordion">
        <summary>${esc(a.title)}</summary>
        <div class="body">${esc(a.body)}</div>
      </details>`).join('')}
    <div class="pill-note">Esta app es una herramienta de autoayuda basada en evidencia, no un tratamiento médico. Si el malestar persiste, un sexólogo o psicólogo especializado puede acelerar mucho tu progreso. La disfunción eréctil también puede tener causas físicas: vale la pena una revisión médica.</div>
    <div class="spacer"></div>
  `);
}

// ============================================================
//  VISTA: DIARIO
// ============================================================
function renderJournal() {
  const key = todayKey();
  const rec = dayRecord(key);
  const dn = currentDayNumber();
  const prompt = PROGRAM[dn - 1].journal;

  // recopilar todas las entradas
  const all = [];
  Object.keys(DB.days).sort().reverse().forEach(k => {
    (DB.days[k].journal || []).forEach(e => all.push({ k, ...e }));
  });

  view.innerHTML = h(`
    <div class="eyebrow">Diario privado</div>
    <h1>Diario</h1>
    <div class="card">
      <p class="muted small" style="margin-bottom:10px">✍️ ${esc(prompt)}</p>
      <textarea id="journalInput" rows="4" placeholder="Escribe lo que quieras..."></textarea>
      <div class="spacer"></div>
      <button class="btn" id="saveJournal">Guardar entrada</button>
    </div>
    ${all.length ? `<h2 style="margin-top:24px">Entradas anteriores</h2>` : '<p class="muted" style="margin-top:20px">Aún no hay entradas. Escribir cada día refuerza la autoconciencia y el compromiso.</p>'}
    ${all.map(e => `
      <div class="entry">
        <div class="date">${fmtDate(e.k)}</div>
        <div class="text">${esc(e.text)}</div>
      </div>`).join('')}
    <div class="spacer"></div>
  `);

  document.getElementById('saveJournal').onclick = () => {
    const val = document.getElementById('journalInput').value.trim();
    if (!val) { toast('Escribe algo primero'); return; }
    rec.journal.push({ text: val, ts: Date.now() });
    store.save(DB);
    toast('Entrada guardada ✓');
    renderJournal();
  };
}

// ============================================================
//  Cálculos de estadísticas
// ============================================================
function daysSinceStartFrom(key) {
  const start = new Date(DB.startDate + 'T00:00:00');
  const d = new Date(key + 'T00:00:00');
  return Math.floor((d - start) / DAY_MS);
}
function isRelapseDay(key) {
  const rec = DB.days[key];
  return rec && rec.checkin && (rec.checkin.porn === 'si' || rec.checkin.mast === 'si');
}
function computeCleanStreak() {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const key = todayKey(-i);
    if (new Date(key) < new Date(DB.startDate)) break;
    if (isRelapseDay(key)) break;
    // solo cuenta si hay actividad registrada, o es un día pasado sin recaída dentro del programa
    streak++;
  }
  return streak;
}
function allTasksDone(rec, dayN) {
  if (!rec || dayN < 1 || dayN > 90) return false;
  const total = PROGRAM[dayN - 1].tasks.length;
  const done = Object.keys(rec.tasks || {}).filter(k => rec.tasks[k]).length;
  return done >= total;
}
function computeStats() {
  const keys = Object.keys(DB.days);
  let cleanDays = 0, checkins = 0;
  const recent = { mood: [], energy: [], bond: [], urge: [] };
  const cutoff = todayKey(-13); // últimas 2 semanas para tendencias
  keys.forEach(k => {
    const c = DB.days[k].checkin;
    if (c) {
      checkins++;
      if (c.porn !== 'si' && c.mast !== 'si') cleanDays++;
      if (k >= cutoff) {
        ['mood', 'energy', 'bond', 'urge'].forEach(m => { if (c[m]) recent[m].push(+c[m]); });
      }
    }
  });
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  return {
    cleanDays, checkins,
    mood: avg(recent.mood), energy: avg(recent.energy),
    bond: avg(recent.bond), urge: avg(recent.urge)
  };
}

// ============================================================
//  Navegación
// ============================================================
const TABS = { today: renderToday, progress: renderProgress, panic: renderPanic, learn: renderLearn, journal: renderJournal };
function switchTab(tab) {
  stopBreath();
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab && tab !== 'panic'));
  window.scrollTo(0, 0);
  (TABS[tab] || renderToday)();
}
document.querySelectorAll('#tabbar button').forEach(b => {
  b.addEventListener('click', () => { haptic(); switchTab(b.dataset.tab); });
});

// arranque
switchTab('today');

// service worker (offline)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
