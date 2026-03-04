import React from 'react';
import { useBid } from '../context/BidContext';
import { grandTotal, actualPLF, actualPSF } from '../utils/calculations';
import { currency } from '../utils/formatters';

export default function ControlsBar() {
  const { state, dispatch } = useBid();
  const { controls, sections, rates } = state;
  const { wallLength, wallHeight, romPLF, romPSF } = controls;

  const gt  = grandTotal(sections, wallLength, rates);
  const plf = actualPLF(sections, wallLength, rates);
  const psf = actualPSF(sections, wallLength, wallHeight, rates);
  const plfD = plf - romPLF;
  const psfD = psf - romPSF;

  const plfColor = plf > romPLF * 1.02 ? 'var(--red)' : plf < romPLF * 0.98 ? 'var(--green)' : 'var(--navy)';
  const psfColor = psf > romPSF * 1.02 ? 'var(--red)' : psf < romPSF * 0.98 ? 'var(--green)' : 'var(--navy)';

  const setCtrl = (field, value) => dispatch({ type: 'SET_CONTROL', field, value });

  return (
    <div className="controls">
      <div className="cg">
        <label>Wall Length (LF)</label>
        <input type="number" value={wallLength} step="0.01"
          onChange={e => setCtrl('wallLength', parseFloat(e.target.value) || 0)} />
      </div>
      <div className="cg">
        <label>Wall Height (FT)</label>
        <input type="number" value={wallHeight} step="0.5"
          onChange={e => setCtrl('wallHeight', parseFloat(e.target.value) || 0)} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Actual PLF badge */}
        <div className="metric-badge" style={{ background: 'var(--blue-pale)', borderColor: 'var(--blue-light)' }}>
          <div className="metric-label" style={{ color: 'var(--blue)' }}>Actual PLF</div>
          <div className="metric-value" style={{ color: plfColor }}>{currency(plf)}</div>
          <div className="metric-rom">
            ROM: $<input type="number" value={romPLF} step="1"
              onChange={e => setCtrl('romPLF', parseFloat(e.target.value) || 0)}
              className="rom-input" style={{ width: 40 }} />
          </div>
          <div className="metric-delta" style={{ color: Math.abs(plfD) < 1 ? 'var(--green)' : plfD > 0 ? 'var(--red)' : 'var(--green)' }}>
            {Math.abs(plfD) < 1 ? 'On target' : plfD > 0 ? `+$${plfD.toFixed(0)} over` : `-$${Math.abs(plfD).toFixed(0)} under`}
          </div>
        </div>

        {/* Actual PSF badge */}
        <div className="metric-badge" style={{ background: 'var(--green-bg)', borderColor: 'var(--green-light)' }}>
          <div className="metric-label" style={{ color: 'var(--green)' }}>Actual PSF</div>
          <div className="metric-value" style={{ color: psfColor }}>{currency(psf)}</div>
          <div className="metric-rom">
            ROM: $<input type="number" value={romPSF} step="1"
              onChange={e => setCtrl('romPSF', parseFloat(e.target.value) || 0)}
              className="rom-input" style={{ width: 34 }} />
          </div>
          <div className="metric-delta" style={{ color: Math.abs(psfD) < 1 ? 'var(--green)' : psfD > 0 ? 'var(--red)' : 'var(--green)' }}>
            {Math.abs(psfD) < 1 ? 'On target' : psfD > 0 ? `+$${psfD.toFixed(0)} over` : `-$${Math.abs(psfD).toFixed(0)} under`}
          </div>
        </div>

        {/* Grand total */}
        <div style={{ borderLeft: '2px solid var(--gray-300)', paddingLeft: 12, textAlign: 'right' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Base Bid Total
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', fontFamily: "'JetBrains Mono', monospace" }}>
            {currency(gt)}
          </div>
        </div>
      </div>
    </div>
  );
}
