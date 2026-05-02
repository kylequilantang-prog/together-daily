'use strict';

/* === STATE MUTATIONS (event handlers) === */
function toggleItem(person, itemId) {
  const today = todayYMD();
  if (!STATE[person][today]) STATE[person][today] = {};
  STATE[person][today][itemId] = !STATE[person][today][itemId];
  saveState();
  renderPanel(person);
}

function toggleExercise(person, exId) {
  const today = todayYMD();
  if (!STATE[person][today]) STATE[person][today] = {};
  if (!STATE[person][today].strength_exercises) STATE[person][today].strength_exercises = {};
  STATE[person][today].strength_exercises[exId] = !STATE[person][today].strength_exercises[exId];
  const dow = new Date().getDay();
  const session = STRENGTH_SESSIONS[person] && STRENGTH_SESSIONS[person][dow];
  if (session) {
    const allDone = session.exercises.every(ex => STATE[person][today].strength_exercises[ex.id]);
    STATE[person][today]['strength'] = allDone;
  }
  saveState();
  renderPanel(person);
}

function saveReview(person, key, value) {
  const wk = weekKey(new Date());
  if (!STATE.review[person]) STATE.review[person] = {};
  if (!STATE.review[person][wk]) STATE.review[person][wk] = {};
  STATE.review[person][wk][key] = value;
  saveState();
}

/* === TABS === */
function activateTab(name) {
  document.querySelectorAll('.tab').forEach(t => {
    const isActive = t.dataset.tab === name;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    t.setAttribute('tabindex', isActive ? '0' : '-1');
  });
  document.querySelectorAll('.panel').forEach(p => {
    p.classList.toggle('active', p.id === 'panel-' + name);
  });
}

function bindTabs() {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      // Left/Right arrow navigation between tabs
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const idx = tabs.indexOf(tab);
      const next = e.key === 'ArrowLeft'
        ? (idx - 1 + tabs.length) % tabs.length
        : (idx + 1) % tabs.length;
      activateTab(tabs[next].dataset.tab);
      tabs[next].focus();
    });
  });
}

/* === EVENT DELEGATION (check rows, exercise rows, review textareas) === */
function bindDelegatedHandlers() {
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'toggle-item') {
      toggleItem(el.dataset.person, el.dataset.id);
    } else if (action === 'toggle-exercise') {
      toggleExercise(el.dataset.person, el.dataset.id);
    } else if (action === 'edit-jyselle-why') {
      openWhyModal();
    }
  });

  // Save review text on blur (event delegation via focusout, which bubbles)
  document.body.addEventListener('focusout', (e) => {
    const el = e.target;
    if (el.tagName !== 'TEXTAREA' || el.dataset.action !== 'save-review') return;
    saveReview(el.dataset.person, el.dataset.key, el.value);
  });
}

/* === DATA TAB BUTTONS === */
function bindDataActions() {
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importData);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
}

/* === MODAL: edit Jyselle's why === */
function openWhyModal() {
  const backdrop = document.getElementById('whyModal');
  const whyInput = document.getElementById('whyModalText');
  const anchorsInput = document.getElementById('whyModalAnchors');
  whyInput.value = STATE.jyselleWhy || '';
  anchorsInput.value = (STATE.jyselleAnchors || []).join(', ');
  backdrop.classList.add('show');
  // Focus the first textarea on open
  setTimeout(() => whyInput.focus(), 50);
}

function closeWhyModal() {
  document.getElementById('whyModal').classList.remove('show');
}

function saveWhyModal() {
  const whyInput = document.getElementById('whyModalText');
  const anchorsInput = document.getElementById('whyModalAnchors');
  STATE.jyselleWhy = whyInput.value.trim();
  STATE.jyselleAnchors = anchorsInput.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  saveState();
  renderPanel('jyselle');
  closeWhyModal();
}

function bindWhyModal() {
  document.getElementById('whyModalCancel').addEventListener('click', closeWhyModal);
  document.getElementById('whyModalSave').addEventListener('click', saveWhyModal);
  // Click backdrop to dismiss
  document.getElementById('whyModal').addEventListener('click', (e) => {
    if (e.target.id === 'whyModal') closeWhyModal();
  });
  // Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('whyModal');
    if (modal.classList.contains('show')) closeWhyModal();
    const welcome = document.getElementById('welcomeOverlay');
    if (welcome.classList.contains('show')) dismissWelcome();
  });
}

/* === WELCOME OVERLAY (first-run only) === */
function maybeShowWelcome() {
  if (STATE.welcomed) return;
  document.getElementById('welcomeOverlay').classList.add('show');
}

function dismissWelcome() {
  document.getElementById('welcomeOverlay').classList.remove('show');
  STATE.welcomed = true;
  saveState();
}

function bindWelcome() {
  document.getElementById('welcomeDismiss').addEventListener('click', dismissWelcome);
  document.getElementById('welcomeOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'welcomeOverlay') dismissWelcome();
  });
}

/* === INIT === */
function init() {
  loadState();
  setRunway();
  renderPanel('kyle');
  renderPanel('jyselle');
  renderBackupNudge();

  bindTabs();
  bindDelegatedHandlers();
  bindDataActions();
  bindWhyModal();
  bindWelcome();

  maybeShowWelcome();

  // Reveal page now that everything's wired and rendered
  document.documentElement.classList.remove('loading');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
