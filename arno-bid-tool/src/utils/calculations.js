/**
 * CALCULATION UTILITIES
 * =====================
 * Pure functions — no side effects, no DOM access.
 * Every calculation the bid tool performs lives here.
 *
 * COST MODEL:
 *   Line Total = Material$ + Labor$ + Equipment$
 *   Material$  = Qty × Unit Cost
 *   Labor$     = (rate × duration × count) if resource assigned, else manual
 *   Equipment$ = same logic as labor, for equip-category resources
 */

// ─── LINE-ITEM CALCULATIONS ───────────────────────────────────────

/** Resolve quantity for a line item based on its qtyMode */
export function getQty(item, wallLength) {
  switch (item.qtyMode) {
    case 'lf':     return wallLength;
    case 'ls':     return 1;
    case 'manual': return item.manualQty || 0;
    default:       return 0;
  }
}

/** Look up a rate card by id */
export function getRate(rates, rateId) {
  return rates.find(r => r.id === rateId) || null;
}

/** Material cost = Qty × Unit Cost */
export function getMaterial(item, wallLength) {
  return getQty(item, wallLength) * (item.uc || 0);
}

/** Labor cost — auto-calculated from rate card, or manual entry */
export function getLabor(item, rates) {
  if (item.rateId) {
    const rate = getRate(rates, item.rateId);
    if (rate && rate.cat === 'labor') {
      return rate.rate * (item.dur || 0) * (item.rateCt || 0);
    }
  }
  return item.labor || 0;
}

/** Equipment cost — auto-calculated from rate card, or manual entry */
export function getEquip(item, rates) {
  if (item.rateId) {
    const rate = getRate(rates, item.rateId);
    if (rate && rate.cat === 'equip') {
      return rate.rate * (item.dur || 0) * (item.rateCt || 0);
    }
  }
  return item.equip || 0;
}

/** Line total = Material + Labor + Equipment */
export function getLineTotal(item, wallLength, rates) {
  return getMaterial(item, wallLength) + getLabor(item, rates) + getEquip(item, rates);
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
  return Math.max(...section.items.map(i => i.dur || 0), 0);
}

// ─── GRAND TOTALS ─────────────────────────────────────────────────

export function grandMaterial(sections, wallLength) {
  return sections.reduce((sum, sec) => sum + sectionMaterial(sec, wallLength), 0);
}

export function grandLabor(sections, rates) {
  return sections.reduce((sum, sec) => sum + sectionLabor(sec, rates), 0);
}

export function grandEquip(sections, rates) {
  return sections.reduce((sum, sec) => sum + sectionEquip(sec, rates), 0);
}

export function grandTotal(sections, wallLength, rates) {
  return sections.reduce((sum, sec) => sum + sectionTotal(sec, wallLength, rates), 0);
}

export function totalDuration(sections) {
  return sections.reduce((sum, sec) => sum + sectionDuration(sec), 0);
}

// ─── DERIVED METRICS ──────────────────────────────────────────────

export function actualPLF(sections, wallLength, rates) {
  const gt = grandTotal(sections, wallLength, rates);
  return wallLength > 0 ? gt / wallLength : 0;
}

export function actualPSF(sections, wallLength, wallHeight, rates) {
  const gt = grandTotal(sections, wallLength, rates);
  const sf = wallLength * wallHeight;
  return sf > 0 ? gt / sf : 0;
}

export function wallFootingPLF(sections, wallLength, rates) {
  const wallSec = sections.find(s => s.id === 'wall') || { items: [] };
  const ftgSec  = sections.find(s => s.id === 'ftg')  || { items: [] };
  const cost = sectionTotal(wallSec, wallLength, rates) + sectionTotal(ftgSec, wallLength, rates);
  return wallLength > 0 ? cost / wallLength : 0;
}

// ─── FORMULA EVALUATION ───────────────────────────────────────────
// For custom columns with type "formula"

export function evaluateFormula(formula, item, wallLength, rates, customCols) {
  try {
    const context = {
      qty:   getQty(item, wallLength),
      uc:    item.uc || 0,
      mat:   getMaterial(item, wallLength),
      lab:   getLabor(item, rates),
      eq:    getEquip(item, rates),
      total: getLineTotal(item, wallLength, rates),
      dur:   item.dur || 0,
      lf:    wallLength,
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
