'use strict';

/* === DATE HELPERS === */
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function todayYMD() { return ymd(new Date()); }
function startOfWeek(d) {
  // Week starts Monday
  const out = new Date(d);
  const day = out.getDay();
  const diff = (day === 0) ? -6 : 1 - day;
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}
function weekKey(d) { return ymd(startOfWeek(d)); }
function dayLetter(d) { return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]; }

/* === STATE-DERIVED HELPERS === */
function isStrengthDayDate(d) {
  const dow = d.getDay();
  return dow === 1 || dow === 4;
}
function isFloorMet(person, dateStr) {
  const day = STATE[person][dateStr] || {};
  return ITEMS[person].filter(i => i.floor).every(i => day[i.id]);
}
function isFullDay(person, dateStr) {
  const day = STATE[person][dateStr] || {};
  const dt = new Date(dateStr + 'T12:00:00');
  return ITEMS[person].filter(i => i.type !== 'strength' || isStrengthDayDate(dt)).every(i => day[i.id]);
}
function calcStreak(person) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (isFloorMet(person, ymd(d))) streak++;
    else if (i === 0) continue; // today not yet met — don't break the streak
    else break;
  }
  return streak;
}
function missedYesterday(person) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return !isFloorMet(person, ymd(y));
}

/* === HTML ESCAPE — for any user-entered text rendered into innerHTML === */
function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* === RENDER: TODAY + WEEK + REVIEW PANEL === */
function renderPanel(person) {
  const panel = document.getElementById('panel-' + person);
  if (!panel) return;

  const today = todayYMD();
  const dayState = STATE[person][today] || {};
  const todayDate = new Date();
  const dow = todayDate.getDay();
  const isStrengthDay = isStrengthDayDate(todayDate);
  const items = ITEMS[person].filter(i => i.type !== 'strength' || isStrengthDay);
  const floorMet = isFloorMet(person, today);
  const streak = calcStreak(person);
  const missed = missedYesterday(person);
  const dateStr = todayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const weekStart = startOfWeek(todayDate);
  let weekHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const ds = ymd(d);
    const isToday = (ds === today);
    const isFuture = d > todayDate && !isToday;
    const floor = !isFuture && isFloorMet(person, ds);
    const full = !isFuture && isFullDay(person, ds);
    let cls = 'day-cell';
    if (isToday) cls += ' today';
    if (full) cls += ' full';
    else if (floor) cls += ' floor-met';
    weekHTML += `<div class="${cls}" aria-label="${dayLetter(d)} ${d.getDate()}${isToday ? ' (today)' : ''}"><div class="day-letter">${dayLetter(d)}</div><div class="day-num">${d.getDate()}</div></div>`;
  }

  let warningHTML = '';
  if (missed && !floorMet) {
    warningHTML = `<div class="miss-warning show">${COPY[person].missWarning}</div>`;
  }

  let checksHTML = '';
  items.forEach(item => {
    const done = !!dayState[item.id];
    checksHTML += `
      <button type="button" class="check-row ${done ? 'done' : ''}" data-action="toggle-item" data-person="${person}" data-id="${item.id}" aria-pressed="${done}">
        <span class="check-box" aria-hidden="true"></span>
        <span class="check-content">
          <span class="check-label">${escapeHTML(item.label)}</span>
          <span class="check-cue">${escapeHTML(item.cue)}</span>
        </span>
        ${item.floor ? '<span class="check-bonus">floor</span>' : ''}
      </button>
    `;
  });

  let strengthHTML = '';
  if (isStrengthDay) {
    const session = STRENGTH_SESSIONS[person][dow];
    const strengthState = dayState.strength_exercises || {};
    const allDone = session.exercises.every(ex => strengthState[ex.id]);
    let exHTML = '';
    session.exercises.forEach(ex => {
      const done = !!strengthState[ex.id];
      exHTML += `
        <button type="button" class="ex-row ${done ? 'done' : ''}" data-action="toggle-exercise" data-person="${person}" data-id="${ex.id}" aria-pressed="${done}">
          <span class="ex-mini-check" aria-hidden="true"></span>
          <span class="ex-content">
            <span class="ex-name">${escapeHTML(ex.name)}</span>
            <span class="ex-detail">${escapeHTML(ex.detail)}</span>
          </span>
        </button>
      `;
    });
    strengthHTML = `
      <div class="strength-inline">
        <div class="strength-inline-header">
          <h4>Today's session: <em>${escapeHTML(session.name)}</em></h4>
          ${allDone ? '<span class="badge">complete</span>' : ''}
        </div>
        <div class="strength-inline-note">Warm-up: ${escapeHTML(session.warmup)}</div>
        ${exHTML}
      </div>
    `;
  }

  const wk = weekKey(todayDate);
  const reviewState = (STATE.review[person] && STATE.review[person][wk]) || {};

  panel.innerHTML = `
    ${PRINCIPLES_HTML}
    ${warningHTML}
    <div class="today-card">
      <div class="today-header">
        <div class="today-date">Today, <em>${escapeHTML(dateStr)}</em></div>
        <div class="today-phase">${COPY[person].phaseTag}</div>
      </div>
      <div class="floor-banner">
        <div class="floor-banner-text">
          ${floorMet ? COPY[person].floorMet : COPY[person].floorPending}
        </div>
        <div class="floor-status">${floorMet ? '✓ Done' : 'Pending'}</div>
      </div>
      <div class="checks-section-title">Today's stack</div>
      ${checksHTML}
      ${strengthHTML}
    </div>

    <div class="week-strip">
      <div class="week-strip-title">
        <h3>This week</h3>
        <div class="streak-display"><strong>${streak}</strong>day floor streak</div>
      </div>
      <div class="week-grid">${weekHTML}</div>
      <div class="week-grid-legend">
        Light green = floor met &nbsp;·&nbsp; Dark = full stack done &nbsp;·&nbsp; Outlined = today
      </div>
    </div>

    <div class="review-section">
      <h3>Sunday <em>review</em></h3>
      <p class="sub">${COPY[person].reviewSub}</p>
      <div class="review-q">
        <label for="review-${person}-worked">What worked this week?</label>
        <textarea id="review-${person}-worked" data-action="save-review" data-person="${person}" data-key="worked" placeholder="${escapeHTML(COPY[person].workedPlaceholder)}">${escapeHTML(reviewState.worked || '')}</textarea>
      </div>
      <div class="review-q">
        <label for="review-${person}-broke">What broke down? (no blame — just data)</label>
        <textarea id="review-${person}-broke" data-action="save-review" data-person="${person}" data-key="broke" placeholder="${escapeHTML(COPY[person].brokePlaceholder)}">${escapeHTML(reviewState.broke || '')}</textarea>
      </div>
      <div class="review-q">
        <label for="review-${person}-tweak">One small tweak for next week</label>
        <textarea id="review-${person}-tweak" data-action="save-review" data-person="${person}" data-key="tweak" placeholder="${escapeHTML(COPY[person].tweakPlaceholder)}">${escapeHTML(reviewState.tweak || '')}</textarea>
      </div>
    </div>
  `;
}

/* === RENDER: WHY BLOCK === */
function renderJyselleWhy() {
  const quoteEl = document.getElementById('jyselleWhy');
  const anchorsEl = document.getElementById('jyselleAnchors');
  if (!quoteEl) return;
  if (STATE.jyselleWhy && STATE.jyselleWhy.trim()) {
    quoteEl.textContent = '"' + STATE.jyselleWhy.trim() + '"';
    quoteEl.classList.remove('why-quote-empty');
  } else {
    quoteEl.textContent = '[Tap "Edit Jyselle\'s why" below to write it in her own words]';
    quoteEl.classList.add('why-quote-empty');
  }
  if (anchorsEl) {
    anchorsEl.innerHTML = '';
    (STATE.jyselleAnchors || []).forEach(a => {
      if (a && a.trim()) {
        const span = document.createElement('span');
        span.className = 'why-anchor';
        span.textContent = a.trim();
        anchorsEl.appendChild(span);
      }
    });
  }
}

/* === RENDER: RUNWAY (weeks/days to wedding) === */
function setRunway() {
  const now = new Date();
  const days = Math.round((WEDDING_DATE - now) / (1000 * 60 * 60 * 24));
  const weeks = Math.round(days / 7);
  const weeksEl = document.getElementById('runwayWeeks');
  const daysEl = document.getElementById('runwayDays');
  if (weeksEl) weeksEl.textContent = `~${weeks} weeks`;
  if (daysEl) daysEl.textContent = `~${days} days`;
}

/* === RENDER: BACKUP NUDGE (30+ days) === */
function renderBackupNudge() {
  const el = document.getElementById('backupNudge');
  if (!el) return;
  const days = daysSinceLastExport();
  if (days != null && days >= 30) {
    el.innerHTML = `<strong>Backup reminder.</strong> Last backup: ${days} days ago — consider exporting.`;
    el.classList.add('show');
  } else {
    el.classList.remove('show');
    el.innerHTML = '';
  }
}
