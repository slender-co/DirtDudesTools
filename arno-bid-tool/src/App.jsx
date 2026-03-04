import React, { useState, useCallback, createContext, useContext } from 'react';
import { useBid } from './context/BidContext';
import { grandTotal, actualPLF, actualPSF } from './utils/calculations';
import { currency } from './utils/formatters';
import { exportHTML, getSavedTime, hasSavedData } from './utils/storage';
import Header from './components/Header';
import ControlsBar from './components/ControlsBar';
import BidTable from './components/BidTable';
import RatesPanel from './components/RatesPanel';
import PLFBreakdown from './components/PLFBreakdown';
import Summary from './components/Summary';
import NotesTab from './components/NotesTab';
import InfoGlossary from './components/InfoGlossary';
import ColumnManager from './components/ColumnManager';

// ─── Toast Context ─────────────────────────────────────────────────
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const TABS = [
  { id: 'bid',   label: 'Full Bid' },
  { id: 'rates', label: 'Rates' },
  { id: 'plf',   label: 'PLF Breakdown' },
  { id: 'sum',   label: 'Summary' },
  { id: 'notes', label: 'Notes' },
  { id: 'info',  label: 'Info / Glossary' },
];

export default function App() {
  const { state, save, load, reset, dispatch } = useBid();
  const [activeTab, setActiveTab] = useState('bid');
  const [toast, setToast] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Toast helper
  const showToast = useCallback((message, type = '') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Save / Load / Export / Reset handlers
  const handleSave = () => {
    if (save()) showToast('Saved', 'success');
    else showToast('Save failed', '');
  };

  const handleLoad = () => {
    if (load()) showToast('Loaded', 'info');
    else showToast('No saved data', '');
  };

  const handleExport = () => {
    exportHTML({
      header: state.header,
      controls: state.controls,
      sections: state.sections,
      rates: state.rates,
      plf: state.plf,
      notes: state.notes,
      customCols: state.customCols,
    }, state.header.title);
    showToast('Exported', 'success');
  };

  const handleReset = () => {
    setShowResetModal(false);
    reset();
    showToast('Reset to defaults', 'info');
  };

  // Status text
  const savedTime = getSavedTime();
  const statusText = state.dirty
    ? (savedTime ? `Unsaved (${savedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${savedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })})` : 'Unsaved')
    : (savedTime ? `Saved: ${savedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${savedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'No saved data');

  return (
    <ToastContext.Provider value={showToast}>
      <div className="container">
        <Header />

        {/* Save bar */}
        <div className="save-bar">
          <button className="sb p" onClick={handleSave}>💾 Save</button>
          <button className="sb s" onClick={handleLoad}>📂 Load</button>
          <button className="sb s" onClick={handleExport}>⬇ Export</button>
          <button className="sb d" onClick={() => setShowResetModal(true)}>↩ Reset</button>
          <span className={`ss ${!state.dirty && savedTime ? 'ok' : ''}`}>{statusText}</span>
        </div>

        <ControlsBar />

        {/* Tab bar */}
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'bid' && (
          <div className="bp">
            <BidTable />
            <ColumnManager />
          </div>
        )}
        {activeTab === 'rates' && <RatesPanel />}
        {activeTab === 'plf'   && <PLFBreakdown />}
        {activeTab === 'sum'   && <Summary />}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'info'  && <InfoGlossary />}

        <button className="prb" onClick={() => window.print()}>🖨 Print / PDF</button>

        {/* Toast */}
        {toast && (
          <div className={`toast show ${toast.type}`}>{toast.message}</div>
        )}

        {/* Reset modal */}
        {showResetModal && (
          <div className="mo show" onClick={() => setShowResetModal(false)}>
            <div className="md" onClick={e => e.stopPropagation()}>
              <h3>Reset to Defaults?</h3>
              <p>Erases all edits, rates, custom columns, and saved data.</p>
              <div className="mb">
                <button className="cl2" onClick={() => setShowResetModal(false)}>Cancel</button>
                <button className="cf" onClick={handleReset}>Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
