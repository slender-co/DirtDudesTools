/**
 * STORAGE UTILITIES
 * =================
 * localStorage persistence + HTML export.
 */

const STORAGE_KEY = 'arno_bid_v6';

/** Save full state to localStorage */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      savedAt: new Date().toISOString(),
    }));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

/** Load state from localStorage (returns null if none) */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Migration: ensure all items have required fields
    if (state.sections) {
      state.sections.forEach(sec => {
        sec.items.forEach(item => {
          if (item.dur === undefined)    item.dur = 0;
          if (item.rateId === undefined) item.rateId = '';
          if (item.rateCt === undefined) item.rateCt = 0;
          if (item.labor === undefined)  item.labor = 0;
          if (item.equip === undefined)  item.equip = 0;
          if (!item.custom)              item.custom = {};
        });
      });
    }
    return state;
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
}

/** Check if saved data exists */
export function hasSavedData() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/** Get saved timestamp (or null) */
export function getSavedTime() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return state.savedAt ? new Date(state.savedAt) : null;
  } catch {
    return null;
  }
}

/** Clear saved data */
export function clearSaved() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export as standalone HTML file.
 * Embeds current state JSON into a <script> that writes to localStorage on open,
 * then downloads the entire current page HTML.
 */
export function exportHTML(state, title) {
  const stateJson = JSON.stringify(state);
  const embedScript = `<script>try{localStorage.setItem('${STORAGE_KEY}',${JSON.stringify(stateJson)});}catch(e){}<\/script>`;
  const html = document.documentElement.outerHTML.replace('</body>', embedScript + '</body>');
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (title || 'bid_export').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)
    + '_' + new Date().toISOString().slice(0, 10) + '.html';
  a.click();
  URL.revokeObjectURL(url);
}
