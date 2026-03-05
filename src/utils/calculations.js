/**
 * CALCULATION UTILITIES
 * =====================
 * Universal basis: LF, SF, CY, or LS. Line items use qtyMode (primary / ls / manual)
 * and unit (LF, SF, CY, LS, EA) to resolve quantity from project controls.
 */

// ─── HELPERS ──────────────────────────────────────────────────────

/** Coerce to number for calculations; empty string / null / undefined → 0 (fixes "stuck 0" when user clears field) */
function toNum(v) {
  if (v === '' || v == null) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

// ─── BASIS HELPERS ────────────────────────────────────────────────

/** Normalize controls: support legacy (wallLength/wallHeight) and new (primaryQty/primaryUnit).
 *  Height (secondaryQty) is only used for area when useWallMode is true (wall-style bids). */
export function getBasis(controls) {
  const c = controls || {};
  const primaryQty = toNum(c.primaryQty ?? c.wallLength);
  const primaryUnit = c.primaryUnit ?? 'LF';
  const secondaryQty = toNum(c.secondaryQty ?? c.wallHeight);
  const useWallMode = c.useWallMode ?? false;
  const length = primaryUnit === 'LF' ? primaryQty : 0;
  const areaFromLengthHeight = primaryUnit === 'LF' && useWallMode && secondaryQty ? primaryQty * secondaryQty : 0;
  return {
    primaryQty,
    primaryUnit,
    secondaryQty,
    useWallMode,
    length,
    area: primaryUnit === 'SF' ? primaryQty : areaFromLengthHeight,
    volume: primaryUnit === 'CY' ? primaryQty : 0,
    isLumpSum: primaryUnit === 'LS',
  };
}

/** Resolve quantity for a line item. controls can be legacy (number = wallLength) or full controls object.
 *  When qtyMode is 'lf' and unit is LF/SF/CY, item.basisQtyOverride (if set) overrides the project basis for that row. */
export function getQty(item, controlsOrWallLength) {
  const controls = typeof controlsOrWallLength === 'object' ? controlsOrWallLength : { wallLength: controlsOrWallLength, primaryQty: controlsOrWallLength, primaryUnit: 'LF' };
  const basis = getBasis(controls);
  const mode = item.qtyMode || 'lf';

  if (mode === 'ls') return 1;
  if (mode === 'manual') return Number(item.manualQty) || 0;

  // 'lf' or 'primary': use project basis by line-item unit; per-row override when set
  const unit = (item.unit || 'LS').toUpperCase();
  const override = item.basisQtyOverride !== undefined && item.basisQtyOverride !== '' ? toNum(item.basisQtyOverride) : null;
  if (unit === 'LF') return override != null ? override : (basis.length || 0);
  if (unit === 'SF') return override != null ? override : (basis.area || 0);
  if (unit === 'CY') return override != null ? override : (basis.volume || 0);
  if (unit === 'LS' || unit === 'EA') return 1;
  return override != null ? override : (basis.length || 0);
}

/** Look up a rate card by id */
export function getRate(rates, rateId) {
  return rates.find(r => r.id === rateId) || null;
}

/** Material cost = Qty × Unit Cost */
export function getMaterial(item, controlsOrWallLength) {
  return getQty(item, controlsOrWallLength) * toNum(item.uc);
}

/** Labor cost — auto-calculated from rate card, or manual entry */
export function getLabor(item, rates) {
  if (item.rateId) {
    const rate = getRate(rates, item.rateId);
    if (rate && rate.cat === 'labor') {
      return toNum(rate.rate) * toNum(item.dur) * toNum(item.rateCt);
    }
  }
  return toNum(item.labor);
}

/** Equipment cost — auto-calculated from rate card, or manual entry */
export function getEquip(item, rates) {
  if (item.rateId) {
    const rate = getRate(rates, item.rateId);
    if (rate && rate.cat === 'equip') {
      return toNum(rate.rate) * toNum(item.dur) * toNum(item.rateCt);
    }
  }
  return toNum(item.equip);
}

/** Line total = Material + Labor + Equipment */
export function getLineTotal(item, controlsOrWallLength, rates) {
  return getMaterial(item, controlsOrWallLength) + getLabor(item, rates) + getEquip(item, rates);
}

/** Check if a line item has auto-calculated labor (resource assigned + labor cat) */
export function isAutoLabor(item, rates) {
  if (!item.rateId) return false;
  const rate = getRate(rates, item.rateId);
  return rate && rate.cat === 'labor';
}

/** Check if a line item has auto-calculated equipment */
export function isAutoEquip(item, rates) {
  if (!item.rateId) return false;
  const rate = getRate(rates, item.rateId);
  return rate && rate.cat === 'equip';
}

// ─── SECTION AGGREGATES ───────────────────────────────────────────

export function sectionMaterial(section, wallLength) {
  return section.items.reduce((sum, item) => sum + getMaterial(item, wallLength), 0);
}

export function sectionLabor(section, rates) {
  return section.items.reduce((sum, item) => sum + getLabor(item, rates), 0);
}

export function sectionEquip(section, rates) {
  return section.items.reduce((sum, item) => sum + getEquip(item, rates), 0);
}

export function sectionTotal(section, wallLength, rates) {
  return section.items.reduce((sum, item) => sum + getLineTotal(item, wallLength, rates), 0);
}

/** Peak duration within a section (max of any single item's duration) */
export function sectionDuration(section) {
  return Math.max(...section.items.map(i => toNum(i.dur)), 0);
}

// ─── GRAND TOTALS ─────────────────────────────────────────────────
/** Sections to include in totals: exclude contingency section when contingencyOn is false. */
function effectiveSections(sections, controls) {
  const c = typeof controls === 'object' && controls ? controls : {};
  return sections.filter(sec => sec.id !== 'contingency' || c.contingencyOn !== false);
}

export function grandMaterial(sections, controlsOrWallLength) {
  const controls = typeof controlsOrWallLength === 'object' ? controlsOrWallLength : {};
  return effectiveSections(sections, controls).reduce((sum, sec) => sum + sectionMaterial(sec, controlsOrWallLength), 0);
}

export function grandLabor(sections, rates, controls) {
  const c = typeof controls === 'object' ? controls : {};
  return effectiveSections(sections, c).reduce((sum, sec) => sum + sectionLabor(sec, rates), 0);
}

export function grandEquip(sections, rates, controls) {
  const c = typeof controls === 'object' ? controls : {};
  return effectiveSections(sections, c).reduce((sum, sec) => sum + sectionEquip(sec, rates), 0);
}

export function grandTotal(sections, controlsOrWallLength, rates) {
  const controls = typeof controlsOrWallLength === 'object' ? controlsOrWallLength : {};
  return effectiveSections(sections, controls).reduce((sum, sec) => sum + sectionTotal(sec, controlsOrWallLength, rates), 0);
}

export function totalDuration(sections) {
  return sections.reduce((sum, sec) => sum + sectionDuration(sec), 0);
}

// ─── DERIVED METRICS (unit-agnostic) ───────────────────────────────

/** Returns { total, perUnit, unitLabel, basisQty } for header/summary. When LS, perUnit is null. */
export function getBidMetrics(sections, controls, rates) {
  const basis = getBasis(controls);
  const total = grandTotal(sections, controls, rates);
  let perUnit = null;
  let basisQty = 0;
  if (!basis.isLumpSum && basis.primaryUnit === 'LF' && basis.length > 0) {
    perUnit = total / basis.length;
    basisQty = basis.length;
  } else if (!basis.isLumpSum && basis.primaryUnit === 'SF' && basis.area > 0) {
    perUnit = total / basis.area;
    basisQty = basis.area;
  } else if (!basis.isLumpSum && basis.primaryUnit === 'CY' && basis.volume > 0) {
    perUnit = total / basis.volume;
    basisQty = basis.volume;
  }
  return { total, perUnit, unitLabel: basis.primaryUnit, basisQty, basis };
}

/** Legacy: actual $/LF when basis is linear. */
export function actualPLF(sections, controlsOrWallLength, rates) {
  const controls = typeof controlsOrWallLength === 'number' ? { wallLength: controlsOrWallLength, primaryQty: controlsOrWallLength, primaryUnit: 'LF' } : controlsOrWallLength;
  const { perUnit } = getBidMetrics(sections, controls, rates);
  return perUnit ?? 0;
}

/** Legacy: actual $/SF when basis is area. */
export function actualPSF(sections, controlsOrWallLength, wallHeight, rates) {
  const c = typeof controlsOrWallLength === 'object' ? controlsOrWallLength : { wallLength: controlsOrWallLength, wallHeight, primaryQty: controlsOrWallLength, primaryUnit: 'LF', secondaryQty: wallHeight };
  const basis = getBasis(c);
  const total = grandTotal(sections, c, rates);
  const area = basis.area || (basis.length * (c.wallHeight ?? c.secondaryQty ?? 0));
  return area > 0 ? total / area : 0;
}

/** Cost per primary unit for a subset of sections. */
export function wallFootingPLF(sections, controlsOrWallLength, rates) {
  const controls = typeof controlsOrWallLength === 'number' ? { primaryQty: controlsOrWallLength, primaryUnit: 'LF' } : controlsOrWallLength;
  const wallSec = sections.find(s => s.id === 'wall') || { items: [] };
  const ftgSec  = sections.find(s => s.id === 'ftg')  || { items: [] };
  const cost = sectionTotal(wallSec, controls, rates) + sectionTotal(ftgSec, controls, rates);
  const basis = getBasis(controls);
  const qty = basis.primaryUnit === 'LF' ? basis.length : basis.area || basis.volume || 1;
  return qty > 0 ? cost / qty : 0;
}

// ─── FORMULA EVALUATION ───────────────────────────────────────────
// For custom columns with type "formula"

export function evaluateFormula(formula, item, controlsOrWallLength, rates, customCols) {
  try {
    const controls = typeof controlsOrWallLength === 'number' ? { primaryQty: controlsOrWallLength, primaryUnit: 'LF' } : controlsOrWallLength;
    const basis = getBasis(controls);
    const context = {
      qty:   getQty(item, controls),
      uc:    toNum(item.uc),
      mat:   getMaterial(item, controls),
      lab:   getLabor(item, rates),
      eq:    getEquip(item, rates),
      total: getLineTotal(item, controls, rates),
      dur:   toNum(item.dur),
      lf:    basis.length,
      sf:    basis.area,
      cy:    basis.volume,
    };

    // Add custom column values to context
    if (customCols) {
      customCols.forEach(col => {
        context['col_' + col.id] = parseFloat(item.custom?.[col.id]) || 0;
      });
    }

    // Replace {variable} placeholders with values
    const expression = formula.replace(/\{(\w+)\}/g, (_, key) =>
      context[key] !== undefined ? context[key] : 0
    );

    // Evaluate safely (no access to global scope)
    return Function('"use strict"; return (' + expression + ')')();
  } catch {
    return 0;
  }
}
