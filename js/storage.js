'use strict';

const DEFAULT_JYSELLE_WHY = "I want to work out to look good on our wedding day in Spain by September 22, 2027. I want to feel confident and beautiful when I look at myself and when I slip on my wedding dress. I want to feel like I love my body again. Something I want to work towards not only for looks but to make sure that my health is my priority.";
const DEFAULT_JYSELLE_ANCHORS = ["Confident & beautiful in my dress", "Love my body again", "Health is my priority"];

function emptyState() {
  return {
    version: 1,
    created: new Date().toISOString(),
    kyle: {},
    jyselle: {},
    review: { kyle: {}, jyselle: {} },
    jyselleWhy: DEFAULT_JYSELLE_WHY,
    jyselleAnchors: DEFAULT_JYSELLE_ANCHORS.slice(),
    welcomed: false,
    lastExport: null
  };
}

let STATE = emptyState();
let storageAvailable = true;
let saveTimer = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      STATE = Object.assign(emptyState(), parsed);
      if (!STATE.review) STATE.review = { kyle: {}, jyselle: {} };
      if (!STATE.review.kyle) STATE.review.kyle = {};
      if (!STATE.review.jyselle) STATE.review.jyselle = {};
    }
  } catch (e) {
    console.warn('Could not load state:', e);
    storageAvailable = false;
  }
}

function saveState() {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    flashSaveStatus('All changes saved');
  } catch (e) {
    console.warn('Could not save state:', e);
    flashSaveStatus('Save failed — export your data');
    storageAvailable = false;
  }
}

function flashSaveStatus(msg) {
  const el = document.getElementById('saveStatus');
  if (!el) return;
  el.textContent = msg;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { el.textContent = 'All changes saved'; }, 2000);
}

function showDataStatus(msg, isError) {
  const el = document.getElementById('dataStatus');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? 'var(--warm)' : 'var(--accent)';
  setTimeout(() => { el.textContent = ''; }, 5000);
}

function exportData() {
  const exportPayload = Object.assign({}, STATE, { exported_at: new Date().toISOString() });
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStamp = todayYMD();
  a.href = url;
  a.download = `the-system-backup-${dateStamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  STATE.lastExport = new Date().toISOString();
  saveState();
  renderBackupNudge();
  showDataStatus(`Backup downloaded: the-system-backup-${dateStamp}.json`);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.kyle || !imported.jyselle) {
        showDataStatus('Import failed: file does not look like a valid backup.', true);
        return;
      }
      if (!confirm('Replace your current data with the imported backup? Current data will be lost. (Consider exporting first.)')) return;
      STATE = Object.assign(emptyState(), imported);
      if (!STATE.review.kyle) STATE.review.kyle = {};
      if (!STATE.review.jyselle) STATE.review.jyselle = {};
      saveState();
      renderPanel('kyle');
      renderPanel('jyselle');
      renderBackupNudge();
      showDataStatus(`Backup restored from ${file.name}.`);
    } catch (err) {
      showDataStatus('Import failed: file is not valid JSON.', true);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function resetAll() {
  if (!confirm('Reset all check-ins and reviews for both Kyle and Jyselle? This cannot be undone — consider exporting first.')) return;
  STATE = emptyState();
  saveState();
  renderPanel('kyle');
  renderPanel('jyselle');
  renderBackupNudge();
  showDataStatus('All data reset.');
}

function daysSinceLastExport() {
  if (!STATE.lastExport) return null;
  const then = new Date(STATE.lastExport);
  if (isNaN(then.getTime())) return null;
  const ms = Date.now() - then.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
