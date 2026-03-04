import React from 'react';

/**
 * INFO / GLOSSARY TAB
 * Static reference content — every abbreviation, column, and concept
 * explained for anyone who wasn't part of the original build process.
 */
export default function InfoGlossary() {
  return (
    <div className="bp" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, color: 'var(--navy)', marginBottom: 4 }}>Bid Tool Guide & Glossary</h3>
        <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.7 }}>
          This reference covers every abbreviation, column, and concept used throughout the tool.
          Intended for anyone reviewing or editing the bid who wasn't part of the original build process.
        </p>
      </div>

      <Section title="Controls Bar — Top of Page">
        <D term="Wall Length (LF)">Total linear footage of the retaining wall being bid. LF = Linear Feet. This drives the quantity for all line items set to "LF" qty mode.</D>
        <D term="Wall Height (FT)">Height of the retaining wall in feet. Used to calculate PSF (Price per Square Foot) metrics.</D>
        <D term="Actual PLF">Your real cost per linear foot based on the total bid ÷ wall length. Updates live as you edit any pricing.</D>
        <D term="Actual PSF">Your real cost per square foot based on total bid ÷ (wall length × wall height).</D>
        <D term="ROM Target">Rough Order of Magnitude. The small editable number beneath each badge. This is your planning estimate — for comparison only. The delta text shows how your actual bid compares.</D>
        <D term="Base Bid Total">Sum of all line items across all sections: Material + Labor + Equipment for every row.</D>
      </Section>

      <Section title="Bid Table — Column Definitions">
        <D term="#">Sequential row number. Auto-assigned.</D>
        <D term="Description">Text field describing the scope item. Fully editable.</D>
        <D term="Qty">Quantity for this line item. Click to cycle: LF (auto from Wall Length), LS (Lump Sum = 1), or EA (Each — manual entry).</D>
        <D term="Unit">Unit of measurement — LF, LS, or EA. Click to cycle.</D>
        <D term="Unit Cost">Material unit cost in dollars. For LF items, this is cost per linear foot of material only (no labor/equipment). Material $ = Qty × Unit Cost.</D>
        <D term="Material $">Calculated: Qty × Unit Cost. Raw material cost for this line item.</D>
        <D term="Days">Duration in working days. Supports fractions (0.5 = half day). Used to calculate auto labor/equipment costs when a Resource is assigned.</D>
        <D term="Resource">Dropdown populated from the Rates tab. Select a labor role or equipment type to auto-calculate cost. Set to "— Manual —" to type Labor $ or Equip $ directly.</D>
        <D term="# (Count)">Number of workers or equipment units. E.g., 2 iron workers × 3 days × $500/day = $3,000.</D>
        <D term="Labor $">Either auto-calculated (Rate × Days × Count when a labor resource is assigned) or manually entered.</D>
        <D term="Equip $">Same logic as Labor $ but for equipment resources.</D>
        <D term="Line Total">Material $ + Labor $ + Equip $ for this row.</D>
        <D term="Notes">Free-form text for specifications, references, or context.</D>
      </Section>

      <Section title="Qty Mode Reference">
        <D term="LF (Linear Foot)">Quantity auto-populates from Wall Length. For items that scale with wall length.</D>
        <D term="LS (Lump Sum)">Quantity = 1. For fixed-cost items (mobilization, permits, crew labor days, etc.).</D>
        <D term="EA (Each)">Manual quantity entry. For items with custom counts.</D>
      </Section>

      <Section title="Rates Tab">
        <D term="Rate Card">A named resource with a daily rate. Two categories: Labor (green) and Equipment (amber).</D>
        <D term="Day Rate">Cost per day. Fractional days supported: 0.8 days × $250/day = $200.</D>
        <D term="Auto-calc Formula">Rate × Days × Count = Labor $ or Equip $. Shows purple "auto" tag.</D>
      </Section>

      <Section title="PLF Breakdown Tab">
        <D term="PLF">Price per Linear Foot. Industry-standard metric for retaining wall pricing.</D>
        <D term="Wall Stem">Vertical portion of the wall above the footing. Includes concrete, rebar, formwork, and labor.</D>
        <D term="Footing">Horizontal concrete base the wall sits on. Transfers wall loads into soil.</D>
        <D term="Balance Indicator">Percentages must total 100%. Green = balanced. Red = needs adjustment.</D>
      </Section>

      <Section title="Summary Tab">
        <D term="Material / Labor / Equipment Split">Stacked bar showing percentage of total bid in each cost category.</D>
        <D term="Est. Duration">Sum of peak duration from each section. Rough project timeline.</D>
        <D term="ROM Baseline">Wall Length × ROM PLF Target. The "should-cost" comparison number.</D>
        <D term="Variance">Actual bid total minus ROM baseline. Positive = over budget.</D>
      </Section>

      <Section title="Abbreviations Quick Reference">
        <D term="CIP">Cast-In-Place. Concrete poured on-site into forms.</D>
        <D term="CMU">Concrete Masonry Unit. Block wall construction (NOT used on this project).</D>
        <D term="PLF">Price per Linear Foot ($/LF).</D>
        <D term="PSF">Price per Square Foot ($/SF).</D>
        <D term="ROM">Rough Order of Magnitude. A planning-level cost estimate.</D>
        <D term="LF">Linear Feet.</D>
        <D term="LS">Lump Sum. A fixed total price.</D>
        <D term="EA">Each. A per-unit count.</D>
        <D term="CY">Cubic Yard. Volume measure (27 cubic feet).</D>
        <D term="SF">Square Foot/Feet.</D>
        <D term="SE">Structural Engineer.</D>
        <D term="CBC">California Building Code (2025 edition).</D>
        <D term="ROW">Right of Way. Public roadway or access area.</D>
        <D term="GL">General Liability (insurance).</D>
        <D term="WC">Workers' Compensation (insurance).</D>
        <D term="GC">General Contractor.</D>
        <D term="BMP">Best Management Practice. Erosion/pollution controls.</D>
        <D term="SWPPP">Stormwater Pollution Prevention Plan.</D>
        <D term="ASTM">American Society for Testing and Materials.</D>
        <D term="D1557">ASTM test method for soil compaction (Modified Proctor).</D>
        <D term="SDR-35">Standard Dimension Ratio pipe rating for subdrain spec.</D>
        <D term="pcf">Pounds per Cubic Foot. Unit for soil/earth pressure.</D>
        <D term="psf">Pounds per Square Foot. Unit for soil bearing capacity.</D>
        <D term="psi">Pounds per Square Inch. Unit for concrete strength (f'c).</D>
        <D term="f'c">Specified compressive strength of concrete. Min 2,500 psi on this project.</D>
        <D term="ohm-cm">Ohm-centimeters. Soil resistivity. Lower = more corrosive.</D>
      </Section>

      <Section title="Tool Features">
        <D term="Save / Load">Stores all data in browser local storage. Persists between sessions.</D>
        <D term="Export Snapshot">Downloads a standalone HTML file with all data baked in. Shareable, no internet required.</D>
        <D term="Reset to Defaults">Wipes all edits. Cannot be undone.</D>
        <D term="Print / PDF">Opens browser print dialog. Select "Save as PDF" for a static document.</D>
        <D term="Custom Columns">Add columns via Column Manager. Types: Text, Number, Currency ($), or Formula.</D>
        <D term="Add / Delete Rows">"+ Add Row" to insert. ✕ to remove. Cannot delete last item in a section.</D>
        <D term="Color Coding">Blue = Material. Green = Labor. Amber = Equipment. Purple = Duration/Resource.</D>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="ns" style={{ marginBottom: 20 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function D({ term, children }) {
  return (
    <div className="ni">
      <b>{term}</b> — {children}
    </div>
  );
}
