import React from 'react';
import { useBid } from '../context/BidContext';
import { grandTotal, actualPLF, actualPSF } from '../utils/calculations';
import { num } from '../utils/formatters';

export default function Header() {
  const { state, dispatch } = useBid();
  const { header, controls, sections, rates } = state;
  const { wallLength, wallHeight, romPLF } = controls;

  const gt  = grandTotal(sections, wallLength, rates);
  const plf = actualPLF(sections, wallLength, rates);
  const psf = actualPSF(sections, wallLength, wallHeight, rates);
  const plfD = plf - romPLF;
  const tag = plfD > 1 ? `(+$${plfD.toFixed(0)} over)` : plfD < -1 ? `(-$${Math.abs(plfD).toFixed(0)} under)` : '(on target)';

  return (
    <div className="header">
      <input
        className="hdr-edit title"
        value={header.title}
        onChange={e => dispatch({ type: 'SET_HEADER', payload: { title: e.target.value } })}
      />
      <div className="hdr-auto">
        {wallHeight}'-0" CIP Concrete | {num(wallLength)} LF | <b>${plf.toFixed(0)} PLF</b> / ${psf.toFixed(0)} PSF {tag}
      </div>
      <input
        className="hdr-edit scope"
        value={header.scope}
        onChange={e => dispatch({ type: 'SET_HEADER', payload: { scope: e.target.value } })}
        style={{ marginTop: 4 }}
      />
    </div>
  );
}
