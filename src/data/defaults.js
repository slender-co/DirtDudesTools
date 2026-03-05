/**
 * DEFAULT DATA — 374 Arno Way Retaining Wall Bid
 * ================================================
 * All default values for the bid tool. This is the single source of truth
 * for initial state. When "Reset to Defaults" is triggered, the app
 * rehydrates from deep copies of these arrays/objects.
 *
 * DATA MODEL OVERVIEW:
 *   - rates[]       → Labor & equipment rate cards (feed Resource dropdowns)
 *   - sections[]    → Bid sections, each containing line items
 *   - plfItems[]    → PLF cost-component breakdown (wall stem vs footing)
 *   - noteSections[] → Editable notes organized by section
 *
 * LINE ITEM FIELDS:
 *   id        – unique identifier
 *   desc      – description text
 *   unit      – display unit (LF, LS, EA)
 *   uc        – unit cost (material, per-unit)
 *   qtyMode   – "lf" (auto from wall length), "ls" (lump sum=1), "manual"
 *   manualQty – only used when qtyMode === "manual"
 *   dur       – duration in days (fractional OK: 0.5 = half day)
 *   rateId    – references a rate card id (or "" for manual entry)
 *   rateCt    – count of workers/units for this resource
 *   labor     – manual labor $ (used when rateId is empty)
 *   equip     – manual equipment $ (used when rateId is empty)
 *   notes     – free text
 *   custom    – {} object for user-added custom column values
 */

// ─── RATE CARDS ────────────────────────────────────────────────────
// cat: "labor" | "equip"
// rate: dollars per unit (typically per day)
// unit: display label ("/day", "/pour", etc.)
export const defaultRates = [
  { id: 'lr1', name: 'Laborer',              cat: 'labor', rate: 250,  unit: '/day',  notes: 'General labor' },
  { id: 'lr2', name: 'Skilled Laborer',      cat: 'labor', rate: 350,  unit: '/day',  notes: 'Experienced' },
  { id: 'lr3', name: 'Foreman',              cat: 'labor', rate: 450,  unit: '/day',  notes: 'Crew lead' },
  { id: 'lr4', name: 'Concrete Finisher',    cat: 'labor', rate: 400,  unit: '/day',  notes: 'Pour & finish' },
  { id: 'lr5', name: 'Iron Worker (Rebar)',   cat: 'labor', rate: 500,  unit: '/day',  notes: 'Tie & place' },
  { id: 'lr6', name: 'Carpenter (Forms)',     cat: 'labor', rate: 450,  unit: '/day',  notes: 'Set, strip, clean' },
  { id: 'er1', name: 'Mini Excavator',       cat: 'equip', rate: 1500, unit: '/day',  notes: 'CAT 305 or equiv' },
  { id: 'er2', name: 'Skidsteer',            cat: 'equip', rate: 1200, unit: '/day',  notes: 'Bobcat S650 or equiv' },
  { id: 'er3', name: 'Concrete Pump (Line)', cat: 'equip', rate: 1500, unit: '/pour', notes: 'Per pump event' },
  { id: 'er4', name: 'Plate Compactor',      cat: 'equip', rate: 250,  unit: '/day',  notes: 'Wacker or equiv' },
  { id: 'er5', name: 'Dump Truck (10-yd)',   cat: 'equip', rate: 800,  unit: '/day',  notes: 'Haul & dump' },
  { id: 'er6', name: 'Generator',            cat: 'equip', rate: 150,  unit: '/day',  notes: 'Job site power' },
  { id: 'er7', name: 'Water Truck',          cat: 'equip', rate: 600,  unit: '/day',  notes: 'Dust/compaction' },
];

// Helper to create a line item with all required fields
const item = (id, desc, unit, uc, notes, qtyMode = 'lf', dur = 0, rateId = '', rateCt = 0) => ({
  id, desc, unit, uc, notes, qtyMode, dur, rateId, rateCt,
  labor: 0, equip: 0, manualQty: 0, custom: {},
  hiddenFromExport: false,
});

/** Column keys for Line items table (fixed + custom ids). Used for export visibility. */
export const BID_TABLE_COL_KEYS = ['del', 'num', 'desc', 'qty', 'unit', 'uc', 'material', 'days', 'resource', 'count', 'labor', 'equip', 'total', 'notes'];

// ─── BLANK TEMPLATE (one section, one row — for new projects & reset) ─
/** Section id for contingency/allowance; when controls.contingencyOn is false, excluded from totals. */
export const CONTINGENCY_SECTION_ID = 'contingency';

export const blankSections = [
  {
    id: 'sec1',
    title: '1. NEW SECTION',
    items: [item('r1', '(new item)', 'LS', 0, '', 'ls', 0, '', 0)],
  },
  {
    id: CONTINGENCY_SECTION_ID,
    title: 'Contingency / Allowance',
    items: [],
  },
];

/** Empty rates for blank bid — add rates in Rates tab; they populate Line items Resource dropdown. */
export const blankRates = [];

/** Empty cost allocation for blank bid — add rows in Breakdown tab; they use bid total/target. */
export const blankPLF = [];

export const blankNotes = [
  { id: 'ns1', title: 'Notes', items: [{ id: 'n1', text: '' }] },
];

// ─── BID SECTIONS (full demo template — kept for reference) ───────────
export const defaultSections = [
  {
    id: 'demo',
    title: '1. DEMOLITION',
    items: [
      item('d1', 'Saw-cut, break, load existing wall',   'LF', 25,   "Remove 2.5'-3.5' wall", 'lf'),
      item('d2', 'Demo debris haul-off & dump fees',      'LS', 2500, 'To approved facility',   'ls'),
      item('d3', 'Demo crew',                             'LS', 0,    '',                        'ls', 2, 'lr1', 1),
      item('d4', 'Excavator (demo)',                      'LS', 0,    '',                        'ls', 2, 'er1', 1),
      item('d5', 'Skidsteer (demo)',                      'LS', 0,    '',                        'ls', 2, 'er2', 1),
    ],
  },
  {
    id: 'earth',
    title: '2. EARTHWORK',
    items: [
      item('e1', 'Footing trench excavation',               'LF', 18,   '3.5\'-4.0\' W × 12" D', 'lf'),
      item('e2', 'Grading & site prep',                     'LF', 12,   'Fine grade, compact subgrade', 'lf'),
      item('e3', 'Trench spoil haul-off',                   'LS', 1000, 'To approved facility',   'ls'),
      item('e4', 'Backfill & compaction (90% D1557)',       'LF', 20,   '6-8" lifts',             'lf'),
      item('e5', 'Earthwork crew',                          'LS', 0,    '',                        'ls', 3, 'lr1', 1),
      item('e6', 'Mini Excavator (earthwork)',              'LS', 0,    '',                        'ls', 3, 'er1', 1),
      item('e7', 'Skidsteer (earthwork)',                   'LS', 0,    '',                        'ls', 3, 'er2', 1),
    ],
  },
  {
    id: 'ftg',
    title: '3. CONCRETE FOOTING (Type II, 2500 psi)',
    items: [
      item('f1', 'Continuous spread footing material', 'LF', 100,  '$100 PLF — concrete + rebar + forming', 'lf'),
      item('f2', 'Footing crew',                       'LS', 0,    'Form, tie, pour',        'ls', 2, 'lr2', 2),
      item('f3', 'Concrete pump (footing pour)',        'LS', 0,    '',                        'ls', 1, 'er3', 1),
    ],
  },
  {
    id: 'wall',
    title: '4. RETAINING WALL (6\'-0" CIP Concrete)',
    items: [
      item('w1', 'CIP wall material — 6\' ht',   'LF', 300,  '$50 PSF × 6 FT = $300 PLF', 'lf'),
      item('w2', 'Iron worker crew (rebar)',       'LS', 0,    'Tie & place — footing + stem', 'ls', 3, 'lr5', 2),
      item('w3', 'Carpenter crew (formwork)',       'LS', 0,    'Set, strip, clean — stem both sides', 'ls', 3, 'lr6', 2),
      item('w4', 'Concrete finisher (stem pour)',   'LS', 0,    '',                        'ls', 1, 'lr4', 2),
      item('w5', 'Concrete pump (stem pour)',       'LS', 0,    '',                        'ls', 1, 'er3', 1),
    ],
  },
  {
    id: 'drain',
    title: '5. SUBDRAINAGE (Petra RW-1/RW-2)',
    items: [
      item('dr1', 'Subdrain pipe (4" PVC Sch 40)', 'LF', 8,    'Perfs down, 1% grade',    'lf'),
      item('dr2', 'Drain rock (3/4"-1.5")',        'LF', 15,   '1 CF/FT min',             'lf'),
      item('dr3', 'Filter fabric (Mirafi 140N)',    'LF', 3,    'Wrap gravel',             'lf'),
      item('dr4', 'Moisture barrier',              'LF', 6,    'Fill side of wall',        'lf'),
      item('dr5', 'Solid outlet pipe',             'LS', 1500, 'To daylight',              'ls'),
      item('dr6', 'Drain crew',                    'LS', 0,    '',                          'ls', 1, 'lr1', 1),
    ],
  },
  {
    id: 'misc',
    title: '6. MISCELLANEOUS',
    items: [
      item('m1', 'Fine grading & cleanup',          'LF', 8,    'Site restoration',        'lf'),
      item('m2', 'Mobilization & demobilization',   'LS', 3500, 'Equipment + staging',     'ls'),
      item('m3', 'Erosion control / BMPs',           'LS', 1000, 'During construction',     'ls'),
      item('m4', 'Utility locate (DigAlert/811)',    'LS', 500,  'Hand dig near utilities', 'ls'),
    ],
  },
  {
    id: 'eng',
    title: '7. ENGINEERING, PERMITS & INSPECTIONS',
    items: [
      item('en1', 'Structural engineering',        'LS', 3500, 'Stamped plans',           'ls'),
      item('en2', 'Geotech observation & testing', 'LS', 2500, 'Per Petra',               'ls'),
      item('en3', 'City permits & plan check',     'LS', 2000, 'City of LA',              'ls'),
      item('en4', 'Special inspections',           'LS', 2000, '3 per CBC',               'ls'),
      item('en5', 'Survey / staking',              'LS', 1500, 'Layout',                   'ls'),
    ],
  },
  {
    id: 'allow',
    title: '8. ALLOWANCES & CONTINGENCIES',
    items: [
      item('a1', 'Shoring / temp support',        'LS', 2500, 'If needed',                'ls'),
      item('a2', 'Unforeseen conditions',          'LS', 3000, 'Rock, utilities, soil',    'ls'),
      item('a3', 'Wall cap / finish',              'LS', 1500, 'Optional',                 'ls'),
      item('a4', 'Traffic control',                'LS', 750,  'If ROW impact',            'ls'),
      item('a5', 'GC / supervision / insurance',   'LS', 2500, 'GL, WC, overhead',         'ls'),
    ],
  },
];

// ─── PLF COST BREAKDOWN ───────────────────────────────────────────
export const defaultPLF = [
  { id: 'pc1', label: 'Concrete — Stem',       group: 'wall', pct: 15,    color: '#2563eb' },
  { id: 'pc2', label: 'Rebar — Stem',          group: 'wall', pct: 9,     color: '#3b82f6' },
  { id: 'pc3', label: 'Formwork — Stem',       group: 'wall', pct: 18,    color: '#60a5fa' },
  { id: 'pc4', label: 'Labor — Stem',          group: 'wall', pct: 33,    color: '#93c5fd' },
  { id: 'pc5', label: 'Concrete — Footing',    group: 'ftg',  pct: 6.25,  color: '#d97706' },
  { id: 'pc6', label: 'Rebar — Footing',       group: 'ftg',  pct: 3,     color: '#f59e0b' },
  { id: 'pc7', label: 'Forming / Excavation',  group: 'ftg',  pct: 4.5,   color: '#fbbf24' },
  { id: 'pc8', label: 'Labor — Footing',       group: 'ftg',  pct: 11.25, color: '#fcd34d' },
];

// ─── EDITABLE NOTES ────────────────────────────────────────────────
export const defaultNotes = [
  {
    id: 'ns1',
    title: 'Key Assumptions & References',
    items: [
      { id: 'n1',  text: 'Wall Type: CIP (cast-in-place) concrete — NOT CMU. Design TBD by SE.' },
      { id: 'n2',  text: 'Pricing per CE/builder: $50 PSF wall + $100 PLF footing = $400 PLF total ROM.' },
      { id: 'n3',  text: 'Footing TBD by SE — assumed 3.5\'-4.0\' W × 12" D.' },
      { id: 'n4',  text: 'Geotech: Petra (J.N. 25-367) governs soil & subdrain requirements.' },
      { id: 'n5',  text: 'Wall not designed to support surcharge loads (per CBC note 7).' },
      { id: 'n6',  text: 'Seismic lateral earth pressures not required — walls ≤6\' per Petra p.20.' },
      { id: 'n7',  text: 'Corrosivity: 1,938 ohm-cm — highly corrosive soil. Consult corrosion eng. if needed.' },
      { id: 'n8',  text: 'La Habra standard: 30 psf active; Petra site = 40 psf on-site (33% higher) — 30 psf w/ imported fill.' },
      { id: 'n9',  text: 'Concrete cure time: minimum 24-48 hrs before stripping forms or loading wall.' },
      { id: 'n10', text: 'Compaction testing by Petra geotech mandatory during backfill phase.' },
      { id: 'n11', text: 'All allowances ROM — subject to adjustment based on field conditions.' },
      { id: 'n12', text: 'All work to conform to 2025 CBC and City of Los Angeles requirements.' },
      { id: 'n13', text: '3 inspections per CBC: (1) Footing, (2) Rebar/pre-pour & drainage, (3) Final.' },
      { id: 'n14', text: 'Cleanouts required for concrete pours over 5\' in height per CBC note 8.' },
    ],
  },
  {
    id: 'ns2',
    title: 'Exclusions',
    items: [
      { id: 'n15', text: 'House pads, foundation work, pool, utilities, flatwork, landscape, fencing, electrical/lighting.' },
      { id: 'n16', text: 'Work beyond retaining wall footprint — grading beyond wall zone.' },
      { id: 'n17', text: 'Retaining walls on neighboring properties or outside project boundary.' },
      { id: 'n18', text: 'Any work requiring separate permits beyond retaining wall permit.' },
    ],
  },
  {
    id: 'ns3',
    title: 'Project Info',
    items: [
      { id: 'n19', text: 'Project: 374 Arno Way, Pacific Palisades, CA 90272' },
      { id: 'n20', text: 'Client: Christopherson Builders' },
      { id: 'n21', text: 'Geotech: Petra Geosciences, J.N. 25-367, Feb 5, 2026' },
      { id: 'n22', text: 'Earth Pressures: Per Petra — active 30 pcf (imported fill) / 40 pcf (on-site)' },
      { id: 'n23', text: 'Soil Bearing: 1,500 psf allowable (per Petra)' },
      { id: 'n24', text: 'Compaction: 90% ASTM D1557, 6-8" lifts' },
      { id: 'n25', text: 'Rebar: ASTM A615, Grade 40 — per engineered design TBD' },
      { id: 'n26', text: "Concrete: Type II cement, min f'c = 2,500 psi" },
      { id: 'n27', text: 'Subdrain: 4" PVC Sch 40/SDR-35, perfs down, 1% gradient (per Petra RW-1/RW-2)' },
    ],
  },
];

// ─── DEFAULT CONTROLS (universal: LF, SF, CY, or LS) ────────────────
// primaryUnit: 'LF' | 'SF' | 'CY' | 'LS' — drives how line-item quantities and "per unit" are calculated
// useWallMode: when true, show height and use length×height for area (wall-style bids)
// secondaryQty: height in FT — only used when useWallMode && primaryUnit === 'LF'
export const defaultControls = {
  primaryQty: 100,
  primaryUnit: 'LF',
  secondaryQty: 0,
  useWallMode: false,      // turn on for wall bids: enables height and area = length × height
  romTarget: 400,
  contingencyOn: true,    // when true, contingency/allowance section is included in bid totals
};

// ─── DEFAULT HEADER ────────────────────────────────────────────────
export const defaultHeader = {
  title: 'Untitled Bid',
  scope: '',               // Scope of work — describe what this bid covers (dirt, demo, concrete, etc.)
};
