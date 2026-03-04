import React, { useState } from 'react';
import { useBid } from '../context/BidContext';
import { useToast } from '../App';
import { BID_TABLE_COL_KEYS } from '../data/defaults';

/** Display labels for standard table columns (same order as BID_TABLE_COL_KEYS) */
const COL_LABELS = {
  del: 'Del', num: '#', desc: 'Desc', qty: 'Qty', unit: 'Unit', uc: 'Unit Cost',
  material: 'Material $', days: 'Days', resource: 'Resource', count: '#', labor: 'Labor $', equip: 'Equip $',
  total: 'Total', notes: 'Notes',
};

export default function ColumnManager() {
  const { state, dispatch } = useBid();
  const showToast = useToast();
  const { customCols, exportColumnVisibility } = state;

  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [formula, setFormula] = useState('');

  const colVisible = (key) => exportColumnVisibility?.[key] !== false;
  const toggleCol = (key) => dispatch({ type: 'SET_EXPORT_COLUMN_VISIBLE', colKey: key, value: !colVisible(key) });

  const handleAdd = () => {
    if (!name.trim()) { showToast('Enter a column name', ''); return; }
    dispatch({
      type: 'ADD_CUSTOM_COL',
      name: name.trim(),
      colType: type,
      formula: type === 'formula' ? formula.trim() : '',
    });
    setName('');
    setFormula('');
    showToast(`"${name.trim()}" column added`, 'success');
  };

  return (
    <div className="cm">
      <h4>Show / hide columns</h4>
      <p className="cm-hint">Click a column to show or hide it in the Line items table. New projects start with all columns on.</p>

      {/* Toggleable standard columns */}
      <div className="cmg">
        {BID_TABLE_COL_KEYS.map(key => (
          <button
            key={key}
            type="button"
            className={`cc co ${colVisible(key) ? 'cc-on' : 'cc-off'}`}
            onClick={() => toggleCol(key)}
            title={colVisible(key) ? 'Hide column' : 'Show column'}
          >
            {COL_LABELS[key] ?? key}
          </button>
        ))}
        {customCols.map(col => (
          <div key={col.id} className="cc cu">
            <span>{col.name}</span>
            <button className="cd2" onClick={() => dispatch({ type: 'DELETE_CUSTOM_COL', colId: col.id })}>✕</button>
          </div>
        ))}
      </div>

      <h4 style={{ marginTop: 18 }}>Add custom column</h4>

      {/* Add column form */}
      <div className="acf">
        <div className="fg">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Markup" style={{ width: 100 }} />
        </div>
        <div className="fg">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="currency">Currency</option>
            <option value="formula">Formula</option>
          </select>
        </div>
        {type === 'formula' && (
          <div className="fg">
            <label>Formula</label>
            <input value={formula} onChange={e => setFormula(e.target.value)} placeholder="{mat}*0.1" style={{ width: 160 }} />
          </div>
        )}
        <button onClick={handleAdd}>+ Add</button>
      </div>

      {type === 'formula' && (
        <div className="fh">
          Variables: {'{qty}'} {'{uc}'} {'{mat}'}=material$ {'{lab}'}=labor$ {'{eq}'}=equip$ {'{total}'} {'{dur}'} {'{lf}'}
        </div>
      )}
    </div>
  );
}
