import React, { useState, useCallback, createContext, useContext } from 'react';
import { useBid } from './context/BidContext';
import { exportHTML } from './utils/storage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ControlsBar from './components/ControlsBar';
import BidTable from './components/BidTable';
import RatesPanel from './components/RatesPanel';
import PLFBreakdown from './components/PLFBreakdown';
import Summary from './components/Summary';
import NotesTab from './components/NotesTab';
import InfoGlossary from './components/InfoGlossary';
import ColumnManager from './components/ColumnManager';
import ProjectsPage from './components/ProjectsPage';

// ─── Toast Context ─────────────────────────────────────────────────
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

/** Tabs shown in main content (excludes Projects — that’s the sidebar page) */
const CONTENT_TABS = [
  { id: 'bid',   label: 'Line items' },
  { id: 'rates', label: 'Rates' },
  { id: 'plf',   label: 'Breakdown' },
  { id: 'sum',   label: 'Summary' },
  { id: 'notes', label: 'Notes' },
  { id: 'info',  label: 'Info / Glossary' },
];

export default function App() {
  const { state, save, reset, getSavedTime, currentProjectId } = useBid();
  const [activeTab, setActiveTab] = useState('projects');
  const [toast, setToast] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('bid-tool-theme') === 'dark'; } catch { return false; }
  });
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('bid-tool-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  }, []);

  const showToast = useCallback((message, type = '') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSave = () => {
    if (save()) showToast('Saved', 'success');
    else showToast('Save failed', '');
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

  const savedTime = getSavedTime();
  const statusText = currentProjectId
    ? (state.dirty
        ? (savedTime ? `Saving… (last: ${savedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${savedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })})` : 'Unsaved')
        : (savedTime ? `Saved: ${savedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${savedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Auto-saved'))
    : 'Select a project';

  return (
    <ToastContext.Provider value={showToast}>
      <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(v => !v)} />
        <div className={`main-theme ${darkMode ? 'theme-dark' : 'theme-light'}`} data-theme={darkMode ? 'dark' : 'light'}>
        <main className="main">
          <TopBar
            onSave={handleSave}
            onExport={handleExport}
            onResetClick={() => setShowResetModal(true)}
            statusText={statusText}
            statusOk={!state.dirty && !!savedTime}
            showLoad={false}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(v => !v)}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          <div className="main-content">
            {activeTab === 'projects' ? (
              <ProjectsPage onOpenProject={setActiveTab} />
            ) : !currentProjectId ? (
              <div className="select-project-prompt">
                <p>Select a project from the <strong>Projects</strong> page to view and edit its breakdown, rates, summary, and notes.</p>
                <button type="button" className="btn-primary" onClick={() => setActiveTab('projects')}>Open Projects</button>
              </div>
            ) : (
              <>
                <div className="no-print"><Header /></div>
                <div className="no-print"><ControlsBar /></div>

                <div className="tabs-wrap no-print">
                  <div className="tabs">
                    {CONTENT_TABS.map(tab => (
                      <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'bid' && (
                  <div className="bp printable-content" data-print-title={state.header?.title}>
                    <div className="print-only-title">{state.header?.title || 'Bid'}</div>
                    <BidTable />
                    <ColumnManager />
                  </div>
                )}
                {activeTab === 'rates' && (
                  <div className="printable-content" data-print-title={state.header?.title}>
                    <div className="print-only-title">{state.header?.title || 'Rates'}</div>
                    <RatesPanel />
                  </div>
                )}
                {activeTab === 'plf' && (
                  <div className="printable-content" data-print-title={state.header?.title}>
                    <div className="print-only-title">{state.header?.title || 'Breakdown'}</div>
                    <PLFBreakdown />
                  </div>
                )}
                {activeTab === 'sum' && (
                  <div className="printable-content" data-print-title={state.header?.title}>
                    <div className="print-only-title">{state.header?.title || 'Summary'}</div>
                    <Summary />
                  </div>
                )}
                {activeTab === 'notes' && (
                  <div className="printable-content" data-print-title={state.header?.title}>
                    <div className="print-only-title">{state.header?.title || 'Notes'}</div>
                    <NotesTab />
                  </div>
                )}
                {activeTab === 'info' && (
                  <div className="printable-content" data-print-title={state.header?.title}>
                    <div className="print-only-title">{state.header?.title || 'Info'}</div>
                    <InfoGlossary />
                  </div>
                )}

                <button className="prb no-print" onClick={() => window.print()}>🖨 Print / PDF</button>
              </>
            )}
          </div>
        </main>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast show ${toast.type}`}>{toast.message}</div>
      )}

      {/* Reset modal */}
      {showResetModal && (
        <div className="mo show" onClick={() => setShowResetModal(false)}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <h3>Reset to Defaults?</h3>
            <p>Clears this project to a blank breakdown (one section, one row). Project name and address are kept. You can add sections and rows again.</p>
            <div className="mb">
              <button className="cl2" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="cf" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
