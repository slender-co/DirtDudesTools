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

export default function BidTable() {
  const { state, dispatch } = useBid();
  const { sections, rates, controls, customCols } = state;
  const { wallLength } = controls;

  // Build resource dropdown options
  const laborRates = rates.filter(r => r.cat === 'labor');
  const equipRates = rates.filter(r => r.cat === 'equip');

  const totalCols = 14 + customCols.length;

  let rowNum = 0;

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: 20 }}></th>
          <th style={{ width: 24 }}>#</th>
          <th style={{ minWidth: 140 }}>Description</th>
          <th className="c" style={{ width: 42 }}>Qty</th>
          <th className="c" style={{ width: 30 }}>U</th>
          <th className="r mc" style={{ width: 68 }}>Unit Cost</th>
          <th className="r mc" style={{ width: 76 }}>Material $</th>
          <th className="c dc" style={{ width: 42 }}>Days</th>
          <th className="dc" style={{ width: 100 }}>Resource</th>
          <th className="c dc" style={{ width: 32 }}>#</th>
          <th className="r lc" style={{ width: 66 }}>Labor $</th>
          <th className="r ec" style={{ width: 66 }}>Equip $</th>
          {customCols.map(col => (
            <th key={col.id} className="r" style={{ width: 70 }}>{col.name}</th>
          ))}
          <th className="r" style={{ width: 78 }}>Total</th>
          <th style={{ minWidth: 120 }}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {sections.map(sec => {
          const sm = sectionMaterial(sec, wallLength);
          const sl = sectionLabor(sec, rates);
          const se = sectionEquip(sec, rates);
          const st = sectionTotal(sec, wallLength, rates);

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
                const q = getQty(item, wallLength);
                const mat = getMaterial(item, wallLength);
                const lab = getLabor(item, rates);
                const eq = getEquip(item, rates);
                const tot = getLineTotal(item, wallLength, rates);
                const autoLab = isAutoLabor(item, rates);
                const autoEq = isAutoEquip(item, rates);
                const rateObj = item.rateId ? getRate(rates, item.rateId) : null;

                return (
                  <tr key={item.id}>
                    <td className="c">
                      <button className="db" onClick={() => dispatch({ type: 'DELETE_ROW', itemId: item.id })}>✕</button>
                    </td>
                    <td className="c n">{rowNum}</td>
                    <td>
                      <input className="et" value={item.desc}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'desc', value: e.target.value })} />
                    </td>

                    {/* Qty — click to cycle mode */}
                    <td className="c n" style={{ cursor: 'pointer' }}
                      onClick={() => dispatch({ type: 'CYCLE_QTY_MODE', itemId: item.id })}
                      title="Click to cycle: LF → LS → Manual">
                      {item.qtyMode === 'manual' ? (
                        <input className="ei ei-s" type="number" value={item.manualQty || 0}
                          onClick={e => e.stopPropagation()}
                          onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'manualQty', value: parseFloat(e.target.value) || 0 })} />
                      ) : item.qtyMode === 'lf' ? num(q) : '1'}
                    </td>

                    <td className="c" style={{ cursor: 'pointer', fontSize: 9, color: 'var(--gray-400)' }}
                      onClick={() => dispatch({ type: 'CYCLE_QTY_MODE', itemId: item.id })}>
                      {item.unit || 'LS'}
                    </td>

                    {/* Unit Cost */}
                    <td className="r">
                      <input className="ei" type="number" step="0.01" value={item.uc}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'uc', value: parseFloat(e.target.value) || 0 })} />
                    </td>
                    <td className="r n">{currency(mat)}</td>

                    {/* Duration */}
                    <td className="c">
                      <input className="ei ei-s qi" type="number" step="0.1" value={item.dur || 0}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'dur', value: parseFloat(e.target.value) || 0 })} />
                    </td>

                    {/* Resource dropdown */}
                    <td>
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
                    <td className="c">
                      <input className="ei ei-s qi" type="number" step="1" value={item.rateCt || 0}
                        onChange={e => dispatch({ type: 'UPDATE_ITEM', itemId: item.id, field: 'rateCt', value: parseFloat(e.target.value) || 0 })} />
                    </td>

                    {/* Labor $ */}
                    <td className="r">
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
                    <td className="r">
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
                      if (col.type === 'formula') {
                        return <td key={col.id} className="r n" style={{ color: 'var(--blue)' }}>{currency(evaluateFormula(col.formula, item, wallLength, rates, customCols))}</td>;
                      }
                      if (col.type === 'currency' || col.type === 'number') {
                        return (
                          <td key={col.id} className="r">
                            <input className="ei" type="number" step="0.01" value={val}
                              onChange={e => dispatch({ type: 'UPDATE_ITEM_CUSTOM', itemId: item.id, colId: col.id, value: parseFloat(e.target.value) || 0 })} />
                          </td>
                        );
                      }
                      return (
                        <td key={col.id}>
                          <input className="et" value={val}
                            onChange={e => dispatch({ type: 'UPDATE_ITEM_CUSTOM', itemId: item.id, colId: col.id, value: e.target.value })} />
                        </td>
                      );
                    })}

                    <td className="r n" style={{ fontWeight: 400 }}>{currency(tot)}</td>
                    <td>
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

              {/* Subtotal row */}
              <tr className="sr">
                <td></td><td></td><td>SUBTOTAL</td><td></td><td></td><td></td>
                <td className="r n">{currency(sm)}</td>
                <td></td><td></td><td></td>
                <td className="r n">{currency(sl)}</td>
                <td className="r n">{currency(se)}</td>
                {customCols.map(col => {
                  if (col.type === 'formula' || col.type === 'currency') {
                    const colTotal = sec.items.reduce((sum, item) =>
                      sum + (col.type === 'formula'
                        ? evaluateFormula(col.formula, item, wallLength, rates, customCols)
                        : (parseFloat(item.custom?.[col.id]) || 0)), 0);
                    return <td key={col.id} className="r n">{currency(colTotal)}</td>;
                  }
                  return <td key={col.id}></td>;
                })}
                <td className="r n" style={{ fontSize: 11 }}>{currency(st)}</td>
                <td></td>
              </tr>
            </React.Fragment>
          );
        })}

        {/* Grand total row */}
        <GrandTotalRow wallLength={wallLength} rates={rates} sections={sections} customCols={customCols} />

        {/* Add section button */}
        <tr>
          <td colSpan={totalCols} style={{ padding: 0 }}>
            <button className="ar" onClick={() => dispatch({ type: 'ADD_SECTION' })}
              style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', padding: '6px 12px', fontSize: 11 }}>
              + Add Section
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function GrandTotalRow({ wallLength, rates, sections, customCols }) {
  const tm = grandMaterial(sections, wallLength);
  const tl = grandLabor(sections, rates);
  const te = grandEquip(sections, rates);
  const gt = grandTotal(sections, wallLength, rates);

  return (
    <tr style={{ background: 'var(--navy)' }}>
      <td style={{ background: 'var(--navy)' }}></td>
      <td colSpan={5} style={{ color: '#fff', fontWeight: 700, fontSize: 12, textAlign: 'right', padding: '8px 6px' }}>TOTAL</td>
      <td className="r" style={{ color: '#93c5fd', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{currency(tm)}</td>
      <td colSpan={3} style={{ background: 'var(--navy)' }}></td>
      <td className="r" style={{ color: '#bbf7d0', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{currency(tl)}</td>
      <td className="r" style={{ color: '#fde68a', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{currency(te)}</td>
      {customCols.map(c => <td key={c.id} style={{ background: 'var(--navy)' }}></td>)}
      <td className="r" style={{ color: '#fff', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{currency(gt)}</td>
      <td style={{ background: 'var(--navy)' }}></td>
    </tr>
  );
}
