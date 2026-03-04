# 374 Arno Way — Retaining Wall Bid Tool

**React + Vite** implementation of the interactive retaining wall bid tool for Christopherson Builders.

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. Hot-reload enabled.

## Build for Production

```bash
npm run build
npm run preview   # preview the build locally
```

Output goes to `dist/`.

---

## Project Structure

```
arno-bid-tool/
├── index.html                  # Vite entry HTML
├── package.json
├── vite.config.js
├── README.md
│
└── src/
    ├── main.jsx                # React root mount
    ├── App.jsx                 # Layout, tabs, save/load/export, toast
    │
    ├── context/
    │   └── BidContext.jsx      # Central state (useReducer + Context)
    │                           # All mutations go through dispatch()
    │
    ├── data/
    │   └── defaults.js         # Default rates, sections, PLF, notes, controls
    │                           # Single source of truth for initial/reset state
    │
    ├── utils/
    │   ├── calculations.js     # Pure math functions — no DOM, no side effects
    │   ├── formatters.js       # Currency, number, percentage formatting
    │   └── storage.js          # localStorage save/load + HTML export
    │
    ├── components/
    │   ├── Header.jsx          # Editable title, scope, auto-generated subtitle
    │   ├── ControlsBar.jsx     # Wall length/height inputs, PLF/PSF badges, grand total
    │   ├── BidTable.jsx        # Full bid grid — sections, line items, all inputs
    │   ├── ColumnManager.jsx   # Custom column add/remove UI
    │   ├── RatesPanel.jsx      # Labor & equipment rate cards
    │   ├── PLFBreakdown.jsx    # PLF cost-component stacked bar + detail table
    │   ├── Summary.jsx         # Dashboard cards, split bar, section breakdown
    │   ├── NotesTab.jsx        # Editable notes organized by section
    │   └── InfoGlossary.jsx    # Glossary of every abbreviation & column definition
    │
    └── styles/
        └── index.css           # All styles — organized by section with comments
```

## Architecture

### State Management

All state lives in `BidContext.jsx` using React's `useReducer` + `createContext`. Every component reads from context; every mutation dispatches an action.

**State shape:**
```js
{
  header:     { title, scope },
  controls:   { wallLength, wallHeight, romPLF, romPSF },
  sections:   [{ id, title, items: [{ id, desc, uc, labor, equip, ... }] }],
  rates:      [{ id, name, cat, rate, unit, notes }],
  plf:        [{ id, label, group, pct, color }],
  notes:      [{ id, title, items: [{ id, text }] }],
  customCols: [{ id, name, type, formula }],
  dirty:      boolean,
}
```

### Calculation Flow

All math lives in `utils/calculations.js` as pure functions:

```
User edits input → dispatch(UPDATE_ITEM) → state updates →
  components re-render → calculations recompute from new state →
  PLF/PSF badges, totals, summary all reflect new values
```

Key functions:
- `getLineTotal(item, wallLength, rates)` → Material + Labor + Equipment
- `grandTotal(sections, wallLength, rates)` → Sum of all sections
- `actualPLF(sections, wallLength, rates)` → Grand total ÷ wall length
- `actualPSF(sections, wallLength, wallHeight, rates)` → Grand total ÷ wall area

### Cost Model (per line item)

| Component  | Auto-calc                          | Manual         |
|------------|------------------------------------|----------------|
| Material $ | Qty × Unit Cost                    | Always auto    |
| Labor $    | Rate × Duration × Count (if labor resource) | Direct entry   |
| Equip $    | Rate × Duration × Count (if equip resource) | Direct entry   |
| Line Total | Material + Labor + Equipment       | Always auto    |

### Qty Modes

| Mode   | Unit | Behavior                                    |
|--------|------|---------------------------------------------|
| `lf`   | LF   | Auto-fills from Wall Length control          |
| `ls`   | LS   | Fixed at 1 (lump sum)                       |
| `manual`| EA  | User enters any quantity                    |

Click the Qty or Unit cell to cycle through modes.

---

## Extending in Cursor

### Adding a new tab

1. Create `src/components/MyNewTab.jsx`
2. Add to `TABS` array in `App.jsx`
3. Add render condition in the tab content section

### Section management

Sections can be added, deleted, and renamed directly in the bid table:
- **Rename**: Click the section title text to edit inline
- **Delete**: ✕ button on each section header (can't delete last section)
- **Add**: "+ Add Section" button at bottom of bid table
- Actions: `ADD_SECTION`, `DELETE_SECTION`, `UPDATE_SECTION_TITLE` in BidContext

### Adding a new field to line items

1. Add default value in `data/defaults.js` → `item()` helper
2. Add `UPDATE_ITEM` case handles it automatically (it's generic by field name)
3. Add migration in `utils/storage.js` → `loadState()` for existing saved data
4. Add column in `BidTable.jsx`

### Adding a new calculation

1. Add pure function in `utils/calculations.js`
2. Import and use in any component that needs it

### Styling

All CSS is in `src/styles/index.css`, organized by section with clear headers. The design uses CSS custom properties (`:root` variables) for the full color palette — change one variable to update everywhere.

**Color system:**
- Blue = Material
- Green = Labor
- Amber = Equipment
- Purple = Duration / Resource
- Navy = Headers / structural

---

## Data Persistence

- **Save/Load**: `localStorage` with key `arno_bid_v6`
- **Export**: Downloads standalone HTML with state embedded
- **Reset**: Clears storage, restores defaults from `data/defaults.js`

## Project Info

- **Project**: 374 Arno Way, Pacific Palisades, CA 90272
- **Client**: Christopherson Builders
- **Wall**: 76.85 LF × 6' CIP concrete retaining wall
- **Geotech**: Petra Geosciences, J.N. 25-367
- **Code**: 2025 CBC, City of Los Angeles
