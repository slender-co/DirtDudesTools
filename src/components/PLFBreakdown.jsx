import React from 'react';
import { useBid } from '../context/BidContext';
import { sectionTotal } from '../utils/calculations';
import { currency } from '../utils/formatters';

export default function PLFBreakdown() {
  const { state, dispatch } = useBid();
  const { plf, controls, sections, rates } = state;
  const primaryQty = controls.primaryQty ?? controls.wallLength ?? 0;
  const romTarget = controls.romTarget ?? controls.romPLF ?? 0;
  const primaryUnit = controls.primaryUnit ?? 'LF';
  const unitLabel = primaryUnit === 'LS' ? '' : primaryUnit;
  const useWallMode = controls.useWallMode ?? false;
  const contingencySec = sections.find(s => s.id === 'contingency');
  const contingencyTotal = contingencySec ? sectionTotal(contingencySec, controls, rates) : 0;
  const contingencyOn = controls.contingencyOn !== false;

  const totalPct = plf.reduce((s, i) => s + i.pct, 0);
  const wallPct  = plf.filter(i => i.group === 'wall').reduce((s, i) => s + i.pct, 0);
  const ftgPct   = plf.filter(i => i.group === 'ftg').reduce((s, i) => s + i.pct, 0);
  const balanced = Math.abs(totalPct - 100) < 0.01;

  const groups = {
    wall: { label: `Wall Stem (${currency((wallPct / 100) * romTarget)}/${unitLabel || 'LF'})`, items: plf.filter(i => i.group === 'wall') },
    ftg:  { label: `Footing (${currency((ftgPct / 100) * romTarget)}/${unitLabel || 'LF'})`,    items: plf.filter(i => i.group === 'ftg') },
  };

  const isEmpty = plf.length === 0;

  // Empty state: no cost allocation yet — add rows to break down target $/unit (driven by Line items / controls).
  if (isEmpty) {
    return (
      <div className="bp" style={{ paddingTop: 16 }}>
        {contingencySec && (
          <div style={{ padding: '0 16px 14px' }}>
            <div className={`cd cd-contingency ${!contingencyOn ? 'cd-contingency-off' : ''}`}>
              <div className="cl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Contingency / Allowance
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 400, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={contingencyOn}
                    onChange={e => dispatch({ type: 'SET_CONTROL', field: 'contingencyOn', value: e.target.checked })}
                  />
                  Include in totals
                </label>
              </div>
              <div className="cv">{currency(contingencyTotal)}</div>
              <div className="cs">{contingencyOn ? 'Included in bid total' : 'Excluded from bid total'}</div>
            </div>
          </div>
        )}
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <p style={{ marginBottom: 12 }}>No cost allocation yet. Add components below to break down your target $/{unitLabel || 'unit'}.</p>
          <p style={{ fontSize: 12, marginBottom: 16 }}>Summary and Line items totals will drive the numbers here as you build the bid.</p>
          <button
            type="button"
            className="ar ar-section"
            style={{ display: 'inline-block', width: 'auto', padding: '10px 20px' }}
            onClick={() => dispatch({ type: 'ADD_PLF' })}
          >
            + Add cost component
          </button>
        </div>
      </div>
    );
  }

  // Wall mode: show Wall Stem / Footing cards and grouped table. Otherwise: single cost allocation.
  return (
    <div className="bp" style={{ paddingTop: 16 }}>
      {contingencySec && (
        <div style={{ padding: '0 16px 14px' }}>
          <div className={`cd cd-contingency ${!contingencyOn ? 'cd-contingency-off' : ''}`}>
            <div className="cl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Contingency / Allowance
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 400, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={contingencyOn}
                  onChange={e => dispatch({ type: 'SET_CONTROL', field: 'contingencyOn', value: e.target.checked })}
                />
                Include in totals
              </label>
            </div>
            <div className="cv">{currency(contingencyTotal)}</div>
            <div className="cs">{contingencyOn ? 'Included in bid total' : 'Excluded from bid total'}</div>
          </div>
        </div>
      )}
      {useWallMode ? (
        <>
          <div style={{ padding: '0 16px 10px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="cd" style={{ flex: 1, minWidth: 140, borderColor: 'var(--blue)' }}>
              <div className="cl">Wall Stem</div>
              <div className="cv">{currency((wallPct / 100) * romTarget)}</div>
              <div className="cs">{wallPct.toFixed(1)}%</div>
            </div>
            <div className="cd" style={{ flex: 1, minWidth: 140, borderColor: 'var(--amber)' }}>
              <div className="cl">Footing</div>
              <div className="cv">{currency((ftgPct / 100) * romTarget)}</div>
              <div className="cs">{ftgPct.toFixed(1)}%</div>
            </div>
            <div className="cd" style={{
              flex: 1, minWidth: 140,
              borderColor: balanced ? 'var(--green)' : 'var(--red)',
              background: balanced ? 'var(--green-bg)' : 'var(--red-bg)',
            }}>
              <div className="cl">Total %</div>
              <div className="cv" style={{ color: balanced ? 'var(--green)' : 'var(--red)' }}>{totalPct.toFixed(2)}%</div>
              <div className="cs" style={{ color: balanced ? 'var(--green)' : 'var(--red)' }}>
                {balanced ? 'Balanced' : 'Adjust to 100%'}
              </div>
            </div>
          </div>
          <div className="pb">
            {plf.map(item => {
              const w = (item.pct / (totalPct || 1)) * 100;
              return (
                <div key={item.id} className="sg" style={{ width: `${w}%`, background: item.color }}>
                  {item.pct >= 5 && <span>{item.pct.toFixed(1)}%</span>}
                </div>
              );
            })}
          </div>
          <div className="pt2">
            <table>
              <thead>
                <tr>
                  <th>Scope</th>
                  <th className="c" style={{ width: 70 }}>%</th>
                  <th className="r" style={{ width: 70 }}>$/{unitLabel || 'LF'}</th>
                  <th className="r" style={{ width: 100 }}>Project $</th>
                </tr>
              </thead>
              <tbody>
                {['wall', 'ftg'].map(groupKey => (
                  <React.Fragment key={groupKey}>
                    <tr className="pgh"><td colSpan={4}>{groups[groupKey].label}</td></tr>
                    {groups[groupKey].items.map((item, idx) => {
                      const perUnit = (item.pct / 100) * romTarget;
                      const projCost = primaryUnit === 'LS' ? perUnit : perUnit * primaryQty;
                      return (
                        <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : 'var(--gray-50)' }}>
                          <td>
                            <span className="pd" style={{ background: item.color }}></span>
                            <input className="et" value={item.label} style={{ width: 140, marginLeft: 4 }}
                              onChange={e => dispatch({ type: 'UPDATE_PLF', plfId: item.id, field: 'label', value: e.target.value })} />
                            <button type="button" className="db" style={{ marginLeft: 4 }} onClick={() => dispatch({ type: 'DELETE_PLF', plfId: item.id })} title="Remove">✕</button>
                          </td>
                          <td className="c">
                            <input className="pi" type="number" step="0.25" value={item.pct}
                              onChange={e => dispatch({ type: 'UPDATE_PLF', plfId: item.id, pct: parseFloat(e.target.value) || 0 })} />%
                          </td>
                          <td className="r n">{currency(perUnit)}</td>
                          <td className="r n">{currency(projCost)}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
                <tr style={{ background: 'var(--navy)', color: '#fff' }}>
                  <td style={{ fontWeight: 700 }}>TOTAL</td>
                  <td className="c" style={{ fontWeight: 400 }}>{totalPct.toFixed(2)}%</td>
                  <td className="r n" style={{ fontWeight: 400 }}>{currency(romTarget)}</td>
                  <td className="r n" style={{ fontWeight: 400 }}>{currency(primaryUnit === 'LS' ? romTarget : romTarget * primaryQty)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            <button type="button" className="ar" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => dispatch({ type: 'ADD_PLF' })}>
              + Add cost component
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: '0 16px 10px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="cd" style={{
              flex: 1, minWidth: 140,
              borderColor: balanced ? 'var(--green)' : 'var(--red)',
              background: balanced ? 'var(--green-bg)' : 'var(--red-bg)',
            }}>
              <div className="cl">Cost allocation</div>
              <div className="cv" style={{ color: balanced ? 'var(--green)' : 'var(--red)' }}>{totalPct.toFixed(2)}%</div>
              <div className="cs" style={{ color: balanced ? 'var(--green)' : 'var(--red)' }}>
                {balanced ? 'Balanced' : 'Adjust to 100%'}
              </div>
            </div>
          </div>
          <div className="pb">
            {plf.map(item => {
              const w = (item.pct / (totalPct || 1)) * 100;
              return (
                <div key={item.id} className="sg" style={{ width: `${w}%`, background: item.color }}>
                  {item.pct >= 5 && <span>{item.pct.toFixed(1)}%</span>}
                </div>
              );
            })}
          </div>
          <div className="pt2">
            <table>
              <thead>
                <tr>
                  <th>Scope</th>
                  <th className="c" style={{ width: 70 }}>%</th>
                  <th className="r" style={{ width: 70 }}>{unitLabel ? `$/${unitLabel}` : '$'}</th>
                  <th className="r" style={{ width: 100 }}>Project $</th>
                </tr>
              </thead>
              <tbody>
                {plf.map((item, idx) => {
                  const perUnit = (item.pct / 100) * romTarget;
                  const projCost = primaryUnit === 'LS' ? perUnit : perUnit * primaryQty;
                  return (
                    <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : 'var(--gray-50)' }}>
                      <td>
                        <span className="pd" style={{ background: item.color }}></span>
                        <input className="et" value={item.label} style={{ width: 140, marginLeft: 4 }}
                          onChange={e => dispatch({ type: 'UPDATE_PLF', plfId: item.id, field: 'label', value: e.target.value })} />
                        <button type="button" className="db" style={{ marginLeft: 4 }} onClick={() => dispatch({ type: 'DELETE_PLF', plfId: item.id })} title="Remove">✕</button>
                      </td>
                      <td className="c">
                        <input className="pi" type="number" step="0.25" value={item.pct}
                          onChange={e => dispatch({ type: 'UPDATE_PLF', plfId: item.id, pct: parseFloat(e.target.value) || 0 })} />%
                      </td>
                      <td className="r n">{currency(perUnit)}</td>
                      <td className="r n">{currency(projCost)}</td>
                    </tr>
                  );
                })}
                <tr style={{ background: 'var(--navy)', color: '#fff' }}>
                  <td style={{ fontWeight: 700 }}>TOTAL</td>
                  <td className="c" style={{ fontWeight: 400 }}>{totalPct.toFixed(2)}%</td>
                  <td className="r n" style={{ fontWeight: 400 }}>{currency(romTarget)}</td>
                  <td className="r n" style={{ fontWeight: 400 }}>{currency(primaryUnit === 'LS' ? romTarget : romTarget * primaryQty)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            <button type="button" className="ar" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => dispatch({ type: 'ADD_PLF' })}>
              + Add cost component
            </button>
          </div>
        </>
      )}
    </div>
  );
}
