import React from 'react';
import { useBid } from '../context/BidContext';
import { grandTotal, getBidMetrics } from '../utils/calculations';
import { currency } from '../utils/formatters';

const UNIT_OPTIONS = [
  { value: 'LF', label: 'Linear feet (LF)' },
  { value: 'SF', label: 'Square feet (SF)' },
  { value: 'CY', label: 'Cubic yards (CY)' },
  { value: 'LS', label: 'Lump sum (LS)' },
];

export default function ControlsBar() {
  const { state, dispatch } = useBid();
  const { controls, sections, rates } = state;
  const primaryQty = controls.primaryQty ?? controls.wallLength ?? 0;
  const primaryUnit = controls.primaryUnit ?? 'LF';
  const secondaryQty = controls.secondaryQty ?? controls.wallHeight ?? 0;
  const romTarget = controls.romTarget ?? 0;

  const gt = grandTotal(sections, controls, rates);
  const metrics = getBidMetrics(sections, controls, rates);
  const { perUnit, unitLabel, basis } = metrics;
  const isLumpSum = basis.isLumpSum;

  const delta = perUnit != null && romTarget > 0 ? perUnit - romTarget : 0;
  const deltaColor = delta > romTarget * 0.02 ? 'var(--red)' : delta < -romTarget * 0.02 ? 'var(--green)' : 'var(--navy)';

  const setCtrl = (field, value) => dispatch({ type: 'SET_CONTROL', field, value });

  return (
    <div className="controls">
      <div className="cg">
        <label>Quantity</label>
        <input
          type="number"
          value={primaryQty}
          step={primaryUnit === 'CY' ? 0.1 : 0.01}
          min={0}
          onChange={e => setCtrl('primaryQty', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="cg">
        <label>Unit</label>
        <select
          value={primaryUnit}
          onChange={e => setCtrl('primaryUnit', e.target.value)}
          style={{ width: 140, padding: '5px 7px', border: '1px solid var(--gray-300)', borderRadius: 4, fontFamily: 'var(--font-sans)', fontSize: 13 }}
        >
          {UNIT_OPTIONS.map(u => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>
      {(primaryUnit === 'LF' || primaryUnit === 'SF') && (
        <div className="cg">
          <label>{primaryUnit === 'LF' ? 'Height (FT)' : 'Secondary'}</label>
          <input
            type="number"
            value={secondaryQty}
            step={0.5}
            min={0}
            onChange={e => setCtrl('secondaryQty', parseFloat(e.target.value) || 0)}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
        {!isLumpSum && (
          <div className="metric-badge" style={{ background: 'var(--blue-pale)', borderColor: 'var(--blue-light)' }}>
            <div className="metric-label" style={{ color: 'var(--blue)' }}>Actual $ / {unitLabel}</div>
            <div className="metric-value" style={{ color: deltaColor }}>{perUnit != null ? currency(perUnit) : '—'}</div>
            <div className="metric-rom">
              Target: $<input
                type="number"
                value={romTarget}
                step={1}
                onChange={e => setCtrl('romTarget', parseFloat(e.target.value) || 0)}
                className="rom-input"
                style={{ width: 48 }}
              />
            </div>
            <div className="metric-delta" style={{ color: Math.abs(delta) < 1 ? 'var(--green)' : delta > 0 ? 'var(--red)' : 'var(--green)' }}>
              {romTarget > 0 && (Math.abs(delta) < 1 ? 'On target' : delta > 0 ? `+$${delta.toFixed(0)} over` : `-$${Math.abs(delta).toFixed(0)} under`)}
            </div>
          </div>
        )}

        <div style={{ borderLeft: '2px solid var(--gray-300)', paddingLeft: 12, textAlign: 'right' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bid total
          </div>
          <div style={{ fontSize: 22, fontWeight: 400, color: 'var(--navy)', fontFamily: 'var(--font-mono)' }}>
            {currency(gt)}
          </div>
        </div>
      </div>
    </div>
  );
}
