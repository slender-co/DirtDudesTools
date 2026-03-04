import React from 'react';
import { useBid } from '../context/BidContext';
import {
  grandTotal, grandMaterial, grandLabor, grandEquip,
  sectionTotal, sectionMaterial, sectionLabor, sectionEquip, sectionDuration,
  totalDuration, getBidMetrics, wallFootingPLF,
} from '../utils/calculations';
import { currency, num } from '../utils/formatters';

export default function Summary() {
  const { state } = useBid();
  const { sections, rates, controls } = state;
  const romTarget = controls.romTarget ?? 0;
  const primaryUnit = controls.primaryUnit ?? 'LF';
  const basis = getBidMetrics(sections, controls, rates);

  const gt = grandTotal(sections, controls, rates);
  const tm = grandMaterial(sections, controls);
  const tl = grandLabor(sections, rates);
  const te = grandEquip(sections, rates);
  const td = totalDuration(sections);
  const { perUnit, unitLabel, basisQty } = basis;
  const rom = !basis.basis.isLumpSum && basisQty > 0 ? basisQty * romTarget : 0;
  const wPerUnit = wallFootingPLF(sections, controls, rates);

  return (
    <div className="bp">
      <div className="sc">
        <Card label="Bid total" value={currency(gt)} sub={`${sections.length} sections`} className="hi" />
        <Card label="Material" value={currency(tm)} sub={gt ? `${(tm/gt*100).toFixed(1)}%` : '0%'} className="mc2" />
        <Card label="Labor" value={currency(tl)} sub={gt ? `${(tl/gt*100).toFixed(1)}%` : '0%'} className="lc2" />
        <Card label="Equipment" value={currency(te)} sub={gt ? `${(te/gt*100).toFixed(1)}%` : '0%'} className="ec2" />
        {perUnit != null && (
          <>
            <Card label={`Actual $ / ${unitLabel}`} value={currency(perUnit)} sub={romTarget ? `vs $${romTarget} target` : ''} />
            <Card label="Target baseline" value={currency(rom)} sub={basisQty ? `${num(basisQty)} ${unitLabel} × $${romTarget}` : ''} />
            <Card label="Variance vs target" value={currency(gt - rom)}
              sub={rom ? `${gt > rom ? 'Over' : 'Under'} by ${Math.abs((gt - rom) / rom * 100).toFixed(1)}%` : ''}
              className={gt > rom ? 'wa' : ''} />
          </>
        )}
        {(controls.useWallMode && primaryUnit === 'LF' && wPerUnit > 0) && (
          <Card label="Wall+footing $/LF" value={currency(wPerUnit)} sub="Sections named wall/ftg only" />
        )}
        <Card label="Est. duration" value={`${td.toFixed(1)}d`} sub="Sum of section peaks" />
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>
          Material / Labor / Equipment split
        </div>
      </div>
      <div className="splb">
        {gt > 0 && <>
          <div className="sg" style={{ width: `${tm/gt*100}%`, background: 'var(--blue)' }}>
            {tm/gt > 0.08 && `Mat ${Math.round(tm/gt*100)}%`}
          </div>
          <div className="sg" style={{ width: `${tl/gt*100}%`, background: 'var(--green)' }}>
            {tl/gt > 0.08 && `Lab ${Math.round(tl/gt*100)}%`}
          </div>
          <div className="sg" style={{ width: `${te/gt*100}%`, background: 'var(--amber)' }}>
            {te/gt > 0.08 && `Eq ${Math.round(te/gt*100)}%`}
          </div>
        </>}
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Section</th>
              <th className="r">Material</th><th className="r">Labor</th><th className="r">Equip</th>
              <th className="r">Days</th><th className="r">Total</th><th className="r">%</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec, i) => {
              const st = sectionTotal(sec, controls, rates);
              const sd = sectionDuration(sec);
              return (
                <tr key={sec.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--gray-50)' }}>
                  <td className="c n">{i + 1}</td>
                  <td>{sec.title}</td>
                  <td className="r n">{currency(sectionMaterial(sec, controls))}</td>
                  <td className="r n">{currency(sectionLabor(sec, rates))}</td>
                  <td className="r n">{currency(sectionEquip(sec, rates))}</td>
                  <td className="r n">{sd > 0 ? `${sd.toFixed(1)}d` : '—'}</td>
                  <td className="r n" style={{ fontWeight: 400 }}>{currency(st)}</td>
                  <td className="r n">{gt ? `${(st/gt*100).toFixed(1)}%` : '0%'}</td>
                </tr>
              );
            })}
            <tr className="sr">
              <td></td><td>TOTAL</td>
              <td className="r n">{currency(tm)}</td>
              <td className="r n">{currency(tl)}</td>
              <td className="r n">{currency(te)}</td>
              <td className="r n">{td.toFixed(1)}d</td>
              <td className="r n" style={{ fontSize: 12, fontWeight: 400 }}>{currency(gt)}</td>
              <td className="r n">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, sub, className = '' }) {
  return (
    <div className={`cd ${className}`}>
      <div className="cl">{label}</div>
      <div className="cv">{value}</div>
      <div className="cs">{sub}</div>
    </div>
  );
}
