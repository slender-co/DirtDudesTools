import React from 'react';
import { useBid } from '../context/BidContext';
import { currency, num } from '../utils/formatters';

export default function PLFBreakdown() {
  const { state, dispatch } = useBid();
  const { plf, controls } = state;
  const primaryQty = controls.primaryQty ?? controls.wallLength ?? 0;
  const romTarget = controls.romTarget ?? controls.romPLF ?? 0;
  const unitLabel = (controls.primaryUnit ?? 'LF') === 'LF' ? 'LF' : (controls.primaryUnit ?? '');

  const totalPct = plf.reduce((s, i) => s + i.pct, 0);
  const wallPct  = plf.filter(i => i.group === 'wall').reduce((s, i) => s + i.pct, 0);
  const ftgPct   = plf.filter(i => i.group === 'ftg').reduce((s, i) => s + i.pct, 0);
  const balanced = Math.abs(totalPct - 100) < 0.01;

  const groups = {
    wall: { label: `Wall Stem (${currency((wallPct / 100) * romTarget)}/${unitLabel || 'LF'})`, items: plf.filter(i => i.group === 'wall') },
    ftg:  { label: `Footing (${currency((ftgPct / 100) * romTarget)}/${unitLabel || 'LF'})`,    items: plf.filter(i => i.group === 'ftg') },
  };

  return (
    <div className="bp" style={{ paddingTop: 16 }}>
      {/* Summary cards */}
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

      {/* Stacked bar */}
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

      {/* Detail table */}
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
                  const projCost = perUnit * primaryQty;
                  return (
                    <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : 'var(--gray-50)' }}>
                      <td><span className="pd" style={{ background: item.color }}></span>{item.label}</td>
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
              <td className="r n" style={{ fontWeight: 400 }}>{currency(romTarget * primaryQty)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
