import React from 'react';
import { useBid } from '../context/BidContext';
import { grandTotal, getBidMetrics } from '../utils/calculations';
import { num } from '../utils/formatters';

export default function Header() {
  const { state, dispatch } = useBid();
  const { header, controls, sections, rates } = state;

  const gt = grandTotal(sections, controls, rates);
  const metrics = getBidMetrics(sections, controls, rates);
  const { perUnit, unitLabel, basisQty, basis } = metrics;
  const romTarget = controls.romTarget ?? 0;
  const delta = perUnit != null && romTarget > 0 ? perUnit - romTarget : 0;
  const tag = delta > 1 ? `(+$${delta.toFixed(0)} over)` : delta < -1 ? `(-$${Math.abs(delta).toFixed(0)} under)` : '(on target)';

  const basisLabel = basis.isLumpSum
    ? 'Lump sum'
    : `${num(basisQty)} ${unitLabel}`;

  return (
    <div className="header">
      <input
        className="hdr-edit title"
        value={header.title}
        onChange={e => dispatch({ type: 'SET_HEADER', payload: { title: e.target.value } })}
      />
      <div className="hdr-auto">
        {basisLabel}
        {perUnit != null && (
          <> · <b>${perUnit.toFixed(0)} / {unitLabel}</b>{romTarget > 0 && <> {tag}</>}</>
        )}
        {!basis.isLumpSum && basis.useWallMode && basis.secondaryQty > 0 && basis.primaryUnit === 'LF' && (
          <> · {basis.secondaryQty}′ height (area: {num(basis.area)} SF)</>
        )}
      </div>
      <div className="scope-section">
        <label className="scope-label">Scope of work</label>
        <textarea
          className="scope-input"
          value={header.scope}
          onChange={e => dispatch({ type: 'SET_HEADER', payload: { scope: e.target.value } })}
          placeholder="Describe what this bid covers — e.g. dirt, demo, concrete, footings, rebar, underground, utilities…"
          rows={3}
        />
      </div>
    </div>
  );
}
