import React from 'react';
import { useBid } from '../context/BidContext';
import {
  grandTotal, grandMaterial, grandLabor, grandEquip,
  sectionTotal, sectionMaterial, sectionLabor, sectionEquip, sectionDuration,
  totalDuration, actualPLF, actualPSF, wallFootingPLF,
} from '../utils/calculations';
import { currency, num } from '../utils/formatters';

export default function Summary() {
  const { state } = useBid();
  const { sections, rates, controls } = state;
  const { wallLength, wallHeight, romPLF, romPSF } = controls;

  const gt = grandTotal(sections, wallLength, rates);
  const tm = grandMaterial(sections, wallLength);
  const tl = grandLabor(sections, rates);
  const te = grandEquip(sections, rates);
  const td = totalDuration(sections);
  const rom = wallLength * romPLF;
  const aPlf = actualPLF(sections, wallLength, rates);
  const aPsf = actualPSF(sections, wallLength, wallHeight, rates);
  const wPlf = wallFootingPLF(sections, wallLength, rates);

  return (
    <div className="bp">
      {/* Summary cards */}
      <div className="sc">
        <Card label="Bid Total" value={currency(gt)} sub={`${sections.length} sections`} className="hi" />
        <Card label="Material" value={currency(tm)} sub={gt ? `${(tm/gt*100).toFixed(1)}%` : '0%'} className="mc2" />
        <Card label="Labor" value={currency(tl)} sub={gt ? `${(tl/gt*100).toFixed(1)}%` : '0%'} className="lc2" />
        <Card label="Equipment" value={currency(te)} sub={gt ? `${(te/gt*100).toFixed(1)}%` : '0%'} className="ec2" />
        <Card label="Actual PLF (Full Bid)" value={currency(aPlf)} sub={`vs $${romPLF} ROM target`} />
        <Card label="Actual PSF (Full Bid)" value={currency(aPsf)} sub={`vs $${romPSF} ROM target`} />
        <Card label="Wall+Footing PLF" value={currency(wPlf)} sub="Sec 3+4 only — construction core" />
        <Card label="Est. Duration" value={`${td.toFixed(1)}d`} sub="Sum of section peaks" />
        <Card label="ROM Baseline" value={currency(rom)} sub={`${num(wallLength)} LF × $${romPLF}`} />
        <Card label="Variance vs ROM" value={currency(gt - rom)}
          sub={`${gt > rom ? 'Over' : 'Under'} by ${rom ? Math.abs((gt - rom) / rom * 100).toFixed(1) : '0'}%`}
          className={gt > rom ? 'wa' : ''} />
      </div>

      {/* Split bar */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>
          Material / Labor / Equipment Split
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

      {/* Section breakdown table */}
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
              const st = sectionTotal(sec, wallLength, rates);
              const sd = sectionDuration(sec);
              return (
                <tr key={sec.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--gray-50)' }}>
                  <td className="c n">{i + 1}</td>
                  <td>{sec.title}</td>
                  <td className="r n">{currency(sectionMaterial(sec, wallLength))}</td>
                  <td className="r n">{currency(sectionLabor(sec, rates))}</td>
                  <td className="r n">{currency(sectionEquip(sec, rates))}</td>
                  <td className="r n">{sd > 0 ? `${sd.toFixed(1)}d` : '—'}</td>
                  <td className="r n" style={{ fontWeight: 600 }}>{currency(st)}</td>
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
              <td className="r n" style={{ fontSize: 12 }}>{currency(gt)}</td>
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
