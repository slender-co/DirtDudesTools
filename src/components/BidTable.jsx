import React from 'react';
import { useBid } from '../context/BidContext';
import {
  getQty, getMaterial, getLabor, getEquip, getLineTotal,
  isAutoLabor, isAutoEquip, getRate,
  sectionMaterial, sectionLabor, sectionEquip, sectionTotal,
  grandMaterial, grandLabor, grandEquip, grandTotal,
  evaluateFormula,
} from '../utils/calculations';
import { currency, num } from '../utils/formatters';
import { BID_TABLE_COL_KEYS } from '../data/defaults';

/** Column keys in table order: fixed then custom then total, notes */
function getOrderedColKeys(customCols) {
  const fixed = BID_TABLE_COL_KEYS.filter(k => k !== 'total' && k !== 'notes');
  return [...fixed.slice(0, 12), ...customCols.map(c => c.id), 'total', 'notes'];
}

/** Tiny discrete toggle: include in PDF (hidden in print) */
function ExportColToggle({ colKey, visible, onToggle }) {
  return (
    <span
      className="export-toggle no-print"
      role="button"
      tabIndex={0}
      onClick={e => { e.preventDefault(); onToggle(); }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      title={visible ? 'Included in PDF (click to exclude)' : 'Excluded from PDF (click to include)'}
      style={{ marginLeft: 2, fontSize: 9, color: visible ? 'var(--gray-400)' : 'var(--gray-300)', cursor: 'pointer', userSelect: 'none' }}
      aria-label={visible ? 'Included in PDF' : 'Excluded from PDF'}
    >
      {visible ? '▣' : '▢'}
    </span>
  );
}

/** Row-level PDF include toggle (discrete, no-print) */
function ExportRowToggle({ hiddenFromExport, onToggle }) {
  return (
    <span
      className="export-toggle no-print"
      role="button"
      tabIndex={0}
      onClick={e => { e.preventDefault(); onToggle(); }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      title={hiddenFromExport ? 'Excluded from PDF (click to include)' : 'Included in PDF (click to exclude)'}
      style={{ marginLeft: 2, fontSize: 9, color: hiddenFromExport ? 'var(--red)' : 'var(--gray-400)', cursor: 'pointer', userSelect: 'none' }}
      aria-label={hiddenFromExport ? 'Excluded from PDF' : 'Included in PDF'}
    >
      {hiddenFromExport ? '▢' : '▣'}
    </span>
  );
}

export default function BidTable() {
  const { state, dispatch } = useBid();
  const { sections, rates, controls, customCols, exportColumnVisibility } = state;
  const controlsOrLength = controls;
  const colKeys = getOrderedColKeys(customCols);
  const colVisible = (key) => exportColumnVisibility?.[key] !== false;

  const laborRates = rates.filter(r => r.cat === 'labor');
  const equipRates = rates.filter(r => r.cat === 'equip');

  const totalCols = 14 + customCols.length;

  let rowNum = 0;

  const toggleCol = (key) => dispatch({ type: 'SET_EXPORT_COLUMN_VISIBLE', colKey: key, value: !colVisible(key) });
  const toggleRow = (itemId, current) => dispatch({ type: 'UPDATE_ITEM', itemId, field: 'hiddenFromExport', value: !current });

  return (
    <>
    <table>
      <thead>
        <tr>
          <th data-col="del" className={!colVisible('del') ? 'hide-in-export' : ''} style={{ width: 20 }}>
            <ExportColToggle colKey="del" visible={colVisible('del')} onToggle={() => toggleCol('del')} />
          </th>
          <th data-col="num" className={!colVisible('num') ? 'hide-in-export' : ''} style={{ width: 24 }}>#</th>
          <th data-col="desc" className={!colVisible('desc') ? 'hide-in-export' : ''} style={{ minWidth: 140 }}>
            Description
            <ExportColToggle colKey="desc" visible={colVisible('desc')} onToggle={() => toggleCol('desc')} />
          </th>
          <th data-col="qty" className={`c ${!colVisible('qty') ? 'hide-in-export' : ''}`} style={{ width: 42 }}>
            Qty<ExportColToggle colKey="qty" visible={colVisible('qty')} onToggle={() => toggleCol('qty')} />
          </th>
          <th data-col="unit" className={`c ${!colVisible('unit') ? 'hide-in-export' : ''}`} style={{ width: 30 }}>
            U<ExportColToggle colKey="unit" visible={colVisible('unit')} onToggle={() => toggleCol('unit')} />
          </th>
          <th data-col="uc" className={`r mc ${!colVisible('uc') ? 'hide-in-export' : ''}`} style={{ width: 68 }}>
            Unit Cost<ExportColToggle colKey="uc" visible={colVisible('uc')} onToggle={() => toggleCol('uc')} />
          </th>
          <th data-col="material" className={`r mc ${!colVisible('material') ? 'hide-in-export' : ''}`} style={{ width: 76 }}>
            Material $<ExportColToggle colKey="material" visible={colVisible('material')} onToggle={() => toggleCol('material')} />
          </th>
          <th data-col="days" className={`c dc ${!colVisible('days') ? 'hide-in-export' : ''}`} style={{ width: 42 }}>
            Days<ExportColToggle colKey="days" visible={colVisible('days')} onToggle={() => toggleCol('days')} />
          </th>
          <th data-col="resource" className={`dc ${!colVisible('resource') ? 'hide-in-export' : ''}`} style={{ width: 100 }}>
            Resource<ExportColToggle colKey="resource" visible={colVisible('resource')} onToggle={() => toggleCol('resource')} />
          </th>
          <th data-col="count" className={`c dc ${!colVisible('count') ? 'hide-in-export' : ''}`} style={{ width: 32 }}>
            #<ExportColToggle colKey="count" visible={colVisible('count')} onToggle={() => toggleCol('count')} />
          </th>
          <th data-col="labor" className={`r lc ${!colVisible('labor') ? 'hide-in-export' : ''}`} style={{ width: 66 }}>
            Labor $<ExportColToggle colKey="labor" visible={colVisible('labor')} onToggle={() => toggleCol('labor')} />
          </th>
          <th data-col="equip" className={`r ec ${!colVisible('equip') ? 'hide-in-export' : ''}`} style={{ width: 66 }}>
            Equip $<ExportColToggle colKey="equip" visible={colVisible('equip')} onToggle={() => toggleCol('equip')} />
          </th>
          {customCols.map(col => (
            <th key={col.id} data-col={col.id} className={`r ${!colVisible(col.id) ? 'hide-in-export' : ''}`} style={{ width: 70 }}>
              {col.name}<ExportColToggle colKey={col.id} visible={colVisible(col.id)} onToggle={() => toggleCol(col.id)} />
            </th>
          ))}
          <th data-col="total" className={`r ${!colVisible('total') ? 'hide-in-export' : ''}`} style={{ width: 78 }}>
            Total<ExportColToggle colKey="total" visible={colVisible('total')} onToggle={() => toggleCol('total')} />
          </th>
          <th data-col="notes" className={!colVisible('notes') ? 'hide-in-export' : ''} style={{ minWidth: 120 }}>
            Notes<ExportColToggle colKey="notes" visible={colVisible('notes')} onToggle={() => toggleCol('notes')} />
          </th>
        </tr>
      </thead>
      <tbody>
        {sections.map(sec => {
          const sm = sectionMaterial(sec, controlsOrLength);
          const sl = sectionLabor(sec, rates);
          const se = sectionEquip(sec, rates);
          const st = sectionTotal(sec, controlsOrLength, rates);

          return (
            <React.Fragment key={sec.id}>
              {/* Section header — editable title + delete */}
              <tr>
                <td colSpan={totalCols} style={{ padding: 0 }}>
                  <div className="sh">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                      <input
                        className="sh-edit"
                        value={sec.title}
                        onChange={e => dispatch({ type: 'UPDATE_SECTION_TITLE', sectionId: sec.id, title: e.target.value })}
                      />
                      <button
                        className="sh-del"
                        onClick={() => dispatch({ type: 'DELETE_SECTION', sectionId: sec.id })}
                        title="Delete section"
                      >✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="sb2">
                        <span>Mat: {currency(sm)}</span>
                        <span>Lab: {currency(sl)}</span>
                        <span>Eq: {currency(se)}</span>
                      </div>
                      <span className="st">{currency(st)}</span>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Line items */}
              {sec.items.map(item => {
                rowNum++;
                const q = getQty(item, controlsOrLength);
                const mat = getMaterial(item, controlsOrLength);
                const lab = getLabor(item, rates);
                const eq = getEquip(item, rates);
                const tot = getLineTotal(item, controlsOrLength, rates);
                const autoLab = isAutoLabor(item, rates);
                const autoEq = isAutoEquip(item, rates);
                const rateObj = item.rateId ? getRate(rates, item.rateId) : null;

                const hiddenFromExport = item.hiddenFromExport === true;
                return (
                  <tr key={item.id} className={hiddenFromExport ? 'hide-in-export' : ''}>
                    <td data-col="del" className={`c ${!colVisible('del') ? 'hide-in-export' : ''}`}>
                      <button className="db" onClick={() => dispatch({ type: 'DELETE_ROW', itemId: item.id })}>✕</button>
                      <ExportRowToggle hiddenFromExport={hiddenFromExport} onToggle={() => toggleRow(item.id, hiddenFromExport)} />
                    </td>
                    <td data-col="num" className={`c n ${!colVisible('num') ? 'hide-in-export' : ''}`}>{rowNum}</td>
                    <td data-col="desc" className={!colVisible('desc') ? 'hide-in-export' : ''}>
                      <input className="et" value={item.desc}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'desc', value: e.target.value })} />
                    </td>

                    {/* Qty — click to cycle mode */}
                    <td data-col="qty" className={`c n ${!colVisible('qty') ? 'hide-in-export' : ''}`} style={{ cursor: 'pointer' }}
                      onClick={() => dispatch({ type: 'CYCLE_QTY_MODE', itemId: item.id })}
                      title="Click to cycle: Primary (from project basis) → LS (1) → Manual (EA)">
                      {item.qtyMode === 'manual' ? (
                        <input className="ei ei-s" type="number" value={item.manualQty || 0}
                          onClick={e => e.stopPropagation()}
                          onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'manualQty', value: parseFloat(e.target.value) || 0 })} />
                      ) : item.qtyMode === 'lf' ? num(q) : '1'}
                    </td>

                    <td data-col="unit" className={`c ${!colVisible('unit') ? 'hide-in-export' : ''}`}>
                      <select
                        className="rs"
                        value={item.unit || 'LS'}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM_UNIT', itemId: item.id, value: e.target.value })}
                        style={{ fontSize: 10, padding: '2px 4px', minWidth: 42 }}
                      >
                        <option value="LF">LF</option>
                        <option value="SF">SF</option>
                        <option value="CY">CY</option>
                        <option value="LS">LS</option>
                        <option value="EA">EA</option>
                      </select>
                    </td>

                    {/* Unit Cost */}
                    <td data-col="uc" className={`r ${!colVisible('uc') ? 'hide-in-export' : ''}`}>
                      <input className="ei" type="number" step="0.01" value={item.uc}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'uc', value: parseFloat(e.target.value) || 0 })} />
                    </td>
                    <td data-col="material" className={`r n ${!colVisible('material') ? 'hide-in-export' : ''}`}>{currency(mat)}</td>

                    {/* Duration */}
                    <td data-col="days" className={`c ${!colVisible('days') ? 'hide-in-export' : ''}`}>
                      <input className="ei ei-s qi" type="number" step="0.1" value={item.dur || 0}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'dur', value: parseFloat(e.target.value) || 0 })} />
                    </td>

                    {/* Resource dropdown */}
                    <td data-col="resource" className={!colVisible('resource') ? 'hide-in-export' : ''}>
                      <select className="rs" value={item.rateId || ''}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'rateId', value: e.target.value })}>
                        <option value="">— Manual —</option>
                        {laborRates.length > 0 && (
                          <optgroup label="Labor">
                            {laborRates.map(r => (
                              <option key={r.id} value={r.id}>{r.name} ({currency(r.rate)}{r.unit})</option>
                            ))}
                          </optgroup>
                        )}
                        {equipRates.length > 0 && (
                          <optgroup label="Equipment">
                            {equipRates.map(r => (
                              <option key={r.id} value={r.id}>{r.name} ({currency(r.rate)}{r.unit})</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </td>

                    {/* Count */}
                    <td data-col="count" className={`c ${!colVisible('count') ? 'hide-in-export' : ''}`}>
                      <input className="ei ei-s qi" type="number" step="1" value={item.rateCt || 0}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'rateCt', value: parseFloat(e.target.value) || 0 })} />
                    </td>

                    {/* Labor $ */}
                    <td data-col="labor" className={`r ${!colVisible('labor') ? 'hide-in-export' : ''}`}>
                      {autoLab ? (
                        <span className="n" style={{ color: 'var(--green)' }}
                          title={`Auto: ${rateObj?.name} × ${item.dur}d × ${item.rateCt}`}>
                          {currency(lab)}<span className="auto-tag">auto</span>
                        </span>
                      ) : (
                        <input className="ei li" type="number" step="1" value={item.labor || 0}
                          onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'labor', value: parseFloat(e.target.value) || 0 })} />
                      )}
                    </td>

                    {/* Equip $ */}
                    <td data-col="equip" className={`r ${!colVisible('equip') ? 'hide-in-export' : ''}`}>
                      {autoEq ? (
                        <span className="n" style={{ color: 'var(--amber)' }}
                          title={`Auto: ${rateObj?.name} × ${item.dur}d × ${item.rateCt}`}>
                          {currency(eq)}<span className="auto-tag">auto</span>
                        </span>
                      ) : (
                        <input className="ei" type="number" step="1" value={item.equip || 0}
                          style={{ background: 'var(--amber-pale)' }}
                          onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'equip', value: parseFloat(e.target.value) || 0 })} />
                      )}
                    </td>

                    {/* Custom columns */}
                    {customCols.map(col => {
                      const val = item.custom?.[col.id] ?? (col.type === 'text' ? '' : 0);
                      const hide = !colVisible(col.id) ? ' hide-in-export' : '';
                      if (col.type === 'formula') {
                        return <td key={col.id} data-col={col.id} className={`r n${hide}`} style={{ color: 'var(--blue)' }}>{currency(evaluateFormula(col.formula, item, controlsOrLength, rates, customCols))}</td>;
                      }
                      if (col.type === 'currency' || col.type === 'number') {
                        return (
                          <td key={col.id} data-col={col.id} className={`r${hide}`}>
                            <input className="ei" type="number" step="0.01" value={val}
                              onChange={e => dispatch({ type: 'UPDATE_ITEM_CUSTOM', itemId: item.id, colId: col.id, value: parseFloat(e.target.value) || 0 })} />
                          </td>
                        );
                      }
                      return (
                        <td key={col.id} data-col={col.id} className={hide}>
                          <input className="et" value={val}
                            onChange={e => dispatch({ type: 'UPDATE_ITEM_CUSTOM', itemId: item.id, colId: col.id, value: e.target.value })} />
                        </td>
                      );
                    })}

                    <td data-col="total" className={`r n ${!colVisible('total') ? 'hide-in-export' : ''}`} style={{ fontWeight: 400 }}>{currency(tot)}</td>
                    <td data-col="notes" className={!colVisible('notes') ? 'hide-in-export' : ''}>
                      <input className="et" value={item.notes}
                        style={{ color: 'var(--gray-400)', fontSize: 9 }}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'notes', value: e.target.value })} />
                    </td>
                  </tr>
                );
              })}

              {/* Add row */}
              <tr>
                <td colSpan={totalCols} style={{ padding: 0 }}>
                  <button className="ar" onClick={() => dispatch({ type: 'ADD_ROW', sectionId: sec.id })}>
                    + Add Row
                  </button>
                </td>
              </tr>
            </React.Fragment>
          );
        })}

        {/* Add section button */}
        <tr>
          <td colSpan={totalCols} style={{ padding: 0 }}>
            <button type="button" className="ar ar-section" onClick={() => dispatch({ type: 'ADD_SECTION' })}>
              + Add Section
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    {/* Totals in their own section (always all items; not aligned to table columns) */}
    <BidTotalsSection sections={sections} controls={controlsOrLength} rates={rates} customCols={customCols} />
  </>
  );
}

function BidTotalsSection({ sections, controls, rates, customCols }) {
  const gt = grandTotal(sections, controls, rates);
  return (
    <div className="bid-totals-section">
      {sections.map(sec => {
        const st = sectionTotal(sec, controls, rates);
        return (
          <div key={sec.id} className="bid-totals-row">
            <span className="bid-totals-label">{sec.title}</span>
            <span className="bid-totals-value">{currency(st)}</span>
          </div>
        );
      })}
      <div className="bid-totals-row bid-totals-grand">
        <span className="bid-totals-label">Total</span>
        <span className="bid-totals-value">{currency(gt)}</span>
      </div>
    </div>
  );
}
