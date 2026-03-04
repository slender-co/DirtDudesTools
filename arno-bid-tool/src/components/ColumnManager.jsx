import React, { useState } from 'react';
import { useBid } from '../context/BidContext';
import { useToast } from '../App';

export default function ColumnManager() {
  const { state, dispatch } = useBid();
  const showToast = useToast();
  const { customCols } = state;

  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [formula, setFormula] = useState('');

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

  // Core columns (non-removable)
  const coreLabels = ['#', 'Desc', 'Qty', 'Unit', 'Unit Cost', 'Material $', 'Days', 'Resource', '#', 'Labor $', 'Equip $', 'Total', 'Notes'];

  return (
    <div className="cm">
      <h4>Custom Columns</h4>

      {/* Column chips */}
      <div className="cmg">
        {coreLabels.map((label, i) => (
          <div key={i} className="cc co"><span>{label}</span></div>
        ))}
        {customCols.map(col => (
          <div key={col.id} className="cc cu">
            <span>{col.name}</span>
            <button className="cd2" onClick={() => dispatch({ type: 'DELETE_CUSTOM_COL', colId: col.id })}>✕</button>
          </div>
        ))}
      </div>

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
