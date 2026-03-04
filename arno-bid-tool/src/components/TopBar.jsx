import React from 'react';

export default function TopBar({
  onSave,
  onLoad,
  onExport,
  onResetClick,
  statusText,
  statusOk,
}) {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="topbar-search-icon" aria-hidden>⌕</span>
        <input type="text" className="topbar-search-input" placeholder="Search here" readOnly aria-label="Search" />
      </div>
      <div className="topbar-actions">
        <button type="button" className="topbar-icon-btn" onClick={onSave} title="Save">💾</button>
        <button type="button" className="topbar-icon-btn" onClick={onLoad} title="Load">📂</button>
        <button type="button" className="topbar-icon-btn" onClick={onExport} title="Export">⬇</button>
        <button type="button" className="topbar-icon-btn topbar-icon-btn-danger" onClick={onResetClick} title="Reset">↩</button>
        <span className={`topbar-status ${statusOk ? 'ok' : ''}`}>{statusText}</span>
      </div>
    </header>
  );
}
