import React from 'react';
import { useBid } from '../context/BidContext';
import { useToast } from '../App';

export default function RatesPanel() {
  const { state, dispatch } = useBid();
  const showToast = useToast();
  const { rates } = state;
  const laborRates = rates.filter(r => r.cat === 'labor');
  const equipRates = rates.filter(r => r.cat === 'equip');

  const updateRate = (id, field, value) => {
    const rateValue = field === 'rate' ? (value === '' ? '' : (parseFloat(value) || 0)) : value;
    dispatch({ type: 'UPDATE_RATE', rateId: id, field, value: rateValue });
  };

  const hasRates = rates.length > 0;

  return (
    <div className="rates-panel">
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, color: 'var(--navy)', marginBottom: 4 }}>Resource Rate Cards</h3>
        <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {hasRates
            ? 'Define labor and equipment day-rates here. They populate the Resource dropdown in Line items. Fractional days supported — 0.8 days × $250/day = $200.'
            : 'No rates yet. Add labor and equipment rates below — they’ll appear in the Line items Resource dropdown and Summary will reflect costs as you assign them.'}
        </p>
      </div>

      <div className="rates-grid">
        {/* Labor rates */}
        <div className="rate-section">
          <div className="rate-section-head labor">
            Labor Rates <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>({laborRates.length})</span>
          </div>
          {laborRates.map(r => (
            <div key={r.id} className="rate-row">
              <input className="rn" value={r.name} onChange={e => updateRate(r.id, 'name', e.target.value)} />
              <input className="rr" type="number" step="1" value={r.rate === '' || r.rate == null ? '' : r.rate} onChange={e => updateRate(r.id, 'rate', e.target.value)} />
              <input className="ru" value={r.unit} onChange={e => updateRate(r.id, 'unit', e.target.value)} />
              <button className="db" onClick={() => dispatch({ type: 'DELETE_RATE', rateId: r.id })}>✕</button>
            </div>
          ))}
          <div className="rate-add">
            <button onClick={() => { dispatch({ type: 'ADD_RATE', cat: 'labor' }); showToast('Labor rate added', 'success'); }}>
              + Add Labor Rate
            </button>
          </div>
        </div>

        {/* Equipment rates */}
        <div className="rate-section">
          <div className="rate-section-head equip">
            Equipment Rates <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>({equipRates.length})</span>
          </div>
          {equipRates.map(r => (
            <div key={r.id} className="rate-row">
              <input className="rn" value={r.name} onChange={e => updateRate(r.id, 'name', e.target.value)} />
              <input className="rr" type="number" step="1" value={r.rate === '' || r.rate == null ? '' : r.rate} onChange={e => updateRate(r.id, 'rate', e.target.value)} />
              <input className="ru" value={r.unit} onChange={e => updateRate(r.id, 'unit', e.target.value)} />
              <button className="db" onClick={() => dispatch({ type: 'DELETE_RATE', rateId: r.id })}>✕</button>
            </div>
          ))}
          <div className="rate-add">
            <button onClick={() => { dispatch({ type: 'ADD_RATE', cat: 'equip' }); showToast('Equipment rate added', 'success'); }}>
              + Add Equipment Rate
            </button>
          </div>
        </div>
      </div>

      <div className="rate-summary">
        <h4>How It Works</h4>
        <div className="rs-item">1. Define rates above → they appear in the <b>Resource</b> dropdown on each bid row.</div>
        <div className="rs-item">2. On a bid row, select a resource, set <b>Duration</b> (days) and <b>Count</b> (# workers/units).</div>
        <div className="rs-item">3. <b>Auto-calc:</b> Rate × Duration × Count → fills Labor $ or Equip $ automatically.</div>
        <div className="rs-item">4. Fractional days work: 0.5 days × $250 Laborer × 2 workers = $250.</div>
        <div className="rs-item">5. Set Resource to <b>"— Manual —"</b> to type Labor $ or Equip $ directly.</div>
      </div>
    </div>
  );
}
