/**
 * BID CONTEXT — Central State Management
 * =======================================
 * Uses React Context + useReducer for predictable state updates.
 * All components read from this context; all mutations dispatch actions.
 *
 * STATE SHAPE:
 *   header     – { title, scope }
 *   controls   – { wallLength, wallHeight, romPLF, romPSF }
 *   sections   – [ { id, title, items: [...] } ]
 *   rates      – [ { id, name, cat, rate, unit, notes } ]
 *   plf        – [ { id, label, group, pct, color } ]
 *   notes      – [ { id, title, items: [ { id, text } ] } ]
 *   customCols – [ { id, name, type, formula } ]
 *   dirty      – boolean (unsaved changes)
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  defaultRates, defaultSections, defaultPLF,
  defaultNotes, defaultControls, defaultHeader,
  blankSections, blankNotes,
} from '../data/defaults';
import { uid } from '../utils/formatters';
import {
  getProjectsList,
  saveProjectsList,
  getProjectData,
  saveProjectData,
  getCurrentProjectId,
  setCurrentProjectId as persistCurrentProjectId,
  getProjectSavedTime,
} from '../utils/projectsStorage';

// Deep-clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj));

/** Full template (all demo sections) — used only as fallback */
function getDefaultBidState(overrides = {}) {
  return {
    header:     overrides.header ?? clone(defaultHeader),
    controls:   clone(defaultControls),
    sections:   clone(defaultSections),
    rates:      clone(defaultRates),
    plf:        clone(defaultPLF),
    notes:      clone(defaultNotes),
    customCols: [],
    dirty: false,
  };
}

/** Blank template: one section, one row. Same columns; rates/plf kept for dropdowns. */
function getBlankBidState(headerOverrides = {}) {
  return {
    header:     { ...clone(defaultHeader), ...headerOverrides },
    controls:   clone(defaultControls),
    sections:   clone(blankSections),
    rates:      clone(defaultRates),
    plf:        clone(defaultPLF),
    notes:      clone(blankNotes),
    customCols: [],
    dirty: false,
  };
}

// ─── REDUCER ──────────────────────────────────────────────────────

function bidReducer(state, action) {
  switch (action.type) {

    // ── HEADER ─────────────────────────────
    case 'SET_HEADER':
      return { ...state, header: { ...state.header, ...action.payload }, dirty: true };

    // ── CONTROLS ───────────────────────────
    case 'SET_CONTROL':
      return {
        ...state,
        controls: { ...state.controls, [action.field]: action.value },
        dirty: true,
      };

    // ── LINE ITEM UPDATES ──────────────────
    case 'UPDATE_ITEM': {
      const sections = state.sections.map(sec => ({
        ...sec,
        items: sec.items.map(item =>
          item.id === action.itemId ? { ...item, [action.field]: action.value } : item
        ),
      }));
      return { ...state, sections, dirty: true };
    }

    case 'UPDATE_ITEM_CUSTOM': {
      const sections = state.sections.map(sec => ({
        ...sec,
        items: sec.items.map(item =>
          item.id === action.itemId
            ? { ...item, custom: { ...item.custom, [action.colId]: action.value } }
            : item
        ),
      }));
      return { ...state, sections, dirty: true };
    }

    case 'CYCLE_QTY_MODE': {
      const modes = ['lf', 'ls', 'manual'];
      const units = { lf: 'LF', ls: 'LS', manual: 'EA' };
      const sections = state.sections.map(sec => ({
        ...sec,
        items: sec.items.map(item => {
          if (item.id !== action.itemId) return item;
          const nextIdx = (modes.indexOf(item.qtyMode) + 1) % 3;
          const nextMode = modes[nextIdx];
          return {
            ...item,
            qtyMode: nextMode,
            unit: units[nextMode],
            manualQty: nextMode === 'manual' && !item.manualQty ? 0 : item.manualQty,
          };
        }),
      }));
      return { ...state, sections, dirty: true };
    }

    // ── ROW ADD/DELETE ─────────────────────
    case 'ADD_ROW': {
      const customDefaults = {};
      state.customCols.forEach(col => {
        customDefaults[col.id] = col.type === 'text' ? '' : 0;
      });
      const sections = state.sections.map(sec => {
        if (sec.id !== action.sectionId) return sec;
        return {
          ...sec,
          items: [...sec.items, {
            id: uid('r'),
            desc: '(new item)',
            unit: 'LS',
            uc: 0,
            notes: '',
            qtyMode: 'ls',
            dur: 0,
            rateId: '',
            rateCt: 0,
            labor: 0,
            equip: 0,
            manualQty: 0,
            custom: customDefaults,
          }],
        };
      });
      return { ...state, sections, dirty: true };
    }

    case 'DELETE_ROW': {
      const sections = state.sections.map(sec => {
        const idx = sec.items.findIndex(i => i.id === action.itemId);
        if (idx === -1) return sec;
        if (sec.items.length <= 1) return sec; // Keep at least one
        return { ...sec, items: sec.items.filter(i => i.id !== action.itemId) };
      });
      return { ...state, sections, dirty: true };
    }

    // ── SECTION ADD/DELETE/RENAME ──────
    case 'ADD_SECTION': {
      const n = state.sections.length + 1;
      const customDefaults = {};
      state.customCols.forEach(col => {
        customDefaults[col.id] = col.type === 'text' ? '' : 0;
      });
      const newSec = {
        id: uid('sec'),
        title: n + '. NEW SECTION',
        items: [{
          id: uid('r'), desc: '(new item)', unit: 'LS', uc: 0, notes: '',
          qtyMode: 'ls', dur: 0, rateId: '', rateCt: 0,
          labor: 0, equip: 0, manualQty: 0, custom: customDefaults,
        }],
      };
      return { ...state, sections: [...state.sections, newSec], dirty: true };
    }

    case 'DELETE_SECTION': {
      if (state.sections.length <= 1) return state;
      return {
        ...state,
        sections: state.sections.filter(s => s.id !== action.sectionId),
        dirty: true,
      };
    }

    case 'UPDATE_SECTION_TITLE': {
      const sections = state.sections.map(sec =>
        sec.id === action.sectionId ? { ...sec, title: action.title } : sec
      );
      return { ...state, sections, dirty: true };
    }

    // ── RATES ──────────────────────────────
    case 'UPDATE_RATE': {
      const rates = state.rates.map(r =>
        r.id === action.rateId ? { ...r, [action.field]: action.value } : r
      );
      return { ...state, rates, dirty: true };
    }

    case 'ADD_RATE': {
      const newRate = {
        id: uid(action.cat === 'labor' ? 'lr' : 'er'),
        name: 'New ' + (action.cat === 'labor' ? 'Role' : 'Equipment'),
        cat: action.cat,
        rate: 0,
        unit: '/day',
        notes: '',
      };
      return { ...state, rates: [...state.rates, newRate], dirty: true };
    }

    case 'DELETE_RATE': {
      const rates = state.rates.filter(r => r.id !== action.rateId);
      // Clear rateId from any items that referenced it
      const sections = state.sections.map(sec => ({
        ...sec,
        items: sec.items.map(item =>
          item.rateId === action.rateId ? { ...item, rateId: '' } : item
        ),
      }));
      return { ...state, rates, sections, dirty: true };
    }

    // ── PLF ────────────────────────────────
    case 'UPDATE_PLF': {
      const plf = state.plf.map(p =>
        p.id === action.plfId ? { ...p, pct: action.pct } : p
      );
      return { ...state, plf, dirty: true };
    }

    // ── NOTES ──────────────────────────────
    case 'UPDATE_NOTE_SECTION_TITLE': {
      const notes = state.notes.map(sec =>
        sec.id === action.sectionId ? { ...sec, title: action.title } : sec
      );
      return { ...state, notes, dirty: true };
    }

    case 'UPDATE_NOTE': {
      const notes = state.notes.map(sec =>
        sec.id === action.sectionId
          ? {
              ...sec,
              items: sec.items.map(n =>
                n.id === action.noteId ? { ...n, text: action.text } : n
              ),
            }
          : sec
      );
      return { ...state, notes, dirty: true };
    }

    case 'ADD_NOTE': {
      const notes = state.notes.map(sec =>
        sec.id === action.sectionId
          ? { ...sec, items: [...sec.items, { id: uid('n'), text: '(new note)' }] }
          : sec
      );
      return { ...state, notes, dirty: true };
    }

    case 'DELETE_NOTE': {
      const notes = state.notes.map(sec =>
        sec.id === action.sectionId
          ? { ...sec, items: sec.items.filter(n => n.id !== action.noteId) }
          : sec
      );
      return { ...state, notes, dirty: true };
    }

    case 'ADD_NOTE_SECTION': {
      return {
        ...state,
        notes: [...state.notes, {
          id: uid('ns'),
          title: 'NEW SECTION',
          items: [{ id: uid('n'), text: '(new note)' }],
        }],
        dirty: true,
      };
    }

    case 'DELETE_NOTE_SECTION': {
      if (state.notes.length <= 1) return state;
      return {
        ...state,
        notes: state.notes.filter(sec => sec.id !== action.sectionId),
        dirty: true,
      };
    }

    // ── CUSTOM COLUMNS ────────────────────
    case 'ADD_CUSTOM_COL': {
      const col = {
        id: uid('c'),
        name: action.name,
        type: action.colType,
        formula: action.colType === 'formula' ? action.formula : '',
      };
      // Add default value to all existing items
      const sections = state.sections.map(sec => ({
        ...sec,
        items: sec.items.map(item => ({
          ...item,
          custom: { ...item.custom, [col.id]: action.colType === 'text' ? '' : 0 },
        })),
      }));
      return {
        ...state,
        customCols: [...state.customCols, col],
        sections,
        dirty: true,
      };
    }

    case 'DELETE_CUSTOM_COL': {
      const customCols = state.customCols.filter(c => c.id !== action.colId);
      const sections = state.sections.map(sec => ({
        ...sec,
        items: sec.items.map(item => {
          const custom = { ...item.custom };
          delete custom[action.colId];
          return { ...item, custom };
        }),
      }));
      return { ...state, customCols, sections, dirty: true };
    }

    // ── SAVE/LOAD/RESET ───────────────────
    case 'MARK_SAVED':
      return { ...state, dirty: false };

    case 'LOAD_STATE':
      return { ...action.state, dirty: false };

    case 'RESET':
      return {
        header:     clone(defaultHeader),
        controls:   clone(defaultControls),
        sections:   clone(defaultSections),
        rates:      clone(defaultRates),
        plf:        clone(defaultPLF),
        notes:      clone(defaultNotes),
        customCols: [],
        dirty: false,
      };

    default:
      return state;
  }
}

// ─── CONTEXT ──────────────────────────────────────────────────────

const BidContext = createContext(null);

const AUTO_SAVE_DELAY_MS = 600;

export function BidProvider({ children }) {
  const [state, dispatch] = useReducer(bidReducer, null, () => getDefaultBidState());
  const [projects, setProjects] = React.useState([]);
  const [currentProjectId, setCurrentProjectIdState] = React.useState(null);
  const autoSaveTimerRef = useRef(null);

  // Load projects list and current project on mount
  useEffect(() => {
    setProjects(getProjectsList());
    const storedCurrent = getCurrentProjectId();
    if (storedCurrent) setCurrentProjectIdState(storedCurrent);
  }, []);

  // When currentProjectId is set, load that project's data
  useEffect(() => {
    if (!currentProjectId) {
      dispatch({ type: 'LOAD_STATE', state: getBlankBidState() });
      return;
    }
    const data = getProjectData(currentProjectId);
    if (data && data.sections && data.sections.length > 0) {
      dispatch({
        type: 'LOAD_STATE',
        state: {
          header:     data.header     || clone(defaultHeader),
          controls:   data.controls   || clone(defaultControls),
          sections:   data.sections   || clone(blankSections),
          rates:      data.rates      || clone(defaultRates),
          plf:        data.plf        || clone(defaultPLF),
          notes:      data.notes      || clone(blankNotes),
          customCols: data.customCols || [],
        },
      });
    } else {
      dispatch({ type: 'LOAD_STATE', state: getBlankBidState() });
    }
  }, [currentProjectId]);

  // Auto-save when state (bid data) changes and we have a current project
  useEffect(() => {
    if (!currentProjectId || !state.dirty) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const pid = currentProjectId;
    const payload = {
      header: state.header,
      controls: state.controls,
      sections: state.sections,
      rates: state.rates,
      plf: state.plf,
      notes: state.notes,
      customCols: state.customCols,
    };
    autoSaveTimerRef.current = setTimeout(() => {
      if (saveProjectData(pid, payload)) {
        dispatch({ type: 'MARK_SAVED' });
        const list = getProjectsList();
        const updated = list.map(p => p.id === pid ? { ...p, updatedAt: new Date().toISOString() } : p);
        saveProjectsList(updated);
        setProjects(updated);
      }
      autoSaveTimerRef.current = null;
    }, AUTO_SAVE_DELAY_MS);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [state.header, state.controls, state.sections, state.rates, state.plf, state.notes, state.customCols, state.dirty, currentProjectId]);

  const setCurrentProject = useCallback((id) => {
    persistCurrentProjectId(id || null);
    setCurrentProjectIdState(id || null);
  }, []);

  const createProject = useCallback((metadata) => {
    const id = uid('proj');
    const now = new Date().toISOString();
    const project = {
      id,
      name: metadata.name || 'Untitled Project',
      address: metadata.address || '',
      client: metadata.client || '',
      color: metadata.color || 'slate',
      createdAt: now,
      updatedAt: now,
    };
    const initialBidState = getBlankBidState({
      title: metadata.name || 'Untitled Project',
      scope: metadata.address || '',
    });
    saveProjectData(id, initialBidState);
    const currentList = getProjectsList();
    const newList = [...currentList, project];
    saveProjectsList(newList);
    setProjects(newList);
    persistCurrentProjectId(id);
    setCurrentProjectIdState(id);
    dispatch({ type: 'LOAD_STATE', state: initialBidState });
    return id;
  }, []);

  const save = useCallback(() => {
    if (!currentProjectId) return false;
    const success = saveProjectData(currentProjectId, {
      header: state.header,
      controls: state.controls,
      sections: state.sections,
      rates: state.rates,
      plf: state.plf,
      notes: state.notes,
      customCols: state.customCols,
    });
    if (success) {
      dispatch({ type: 'MARK_SAVED' });
      const list = getProjectsList();
      const updated = list.map(p => p.id === currentProjectId ? { ...p, updatedAt: new Date().toISOString() } : p);
      saveProjectsList(updated);
      setProjects(updated);
    }
    return success;
  }, [state, currentProjectId]);

  const reset = useCallback(() => {
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    const header = project
      ? { title: project.name || 'Untitled Project', scope: project.address || '' }
      : {};
    const blankState = getBlankBidState(header);
    dispatch({ type: 'LOAD_STATE', state: blankState });
    saveProjectData(currentProjectId, {
      header: blankState.header,
      controls: blankState.controls,
      sections: blankState.sections,
      rates: blankState.rates,
      plf: blankState.plf,
      notes: blankState.notes,
      customCols: blankState.customCols,
    });
  }, [currentProjectId, projects]);

  const getSavedTime = useCallback(() => getProjectSavedTime(currentProjectId), [currentProjectId]);

  return (
    <BidContext.Provider
      value={{
        state,
        dispatch,
        projects,
        currentProjectId,
        setCurrentProject,
        createProject,
        save,
        reset,
        getSavedTime,
      }}
    >
      {children}
    </BidContext.Provider>
  );
}

/** Hook to access bid state and dispatch */
export function useBid() {
  const ctx = useContext(BidContext);
  if (!ctx) throw new Error('useBid must be used within BidProvider');
  return ctx;
}
