# Hobby Tracker · Warhammer 40,000

A mobile-first web app for tracking your Warhammer 40,000 miniature collection —
from the sprue all the way to fully painted. No account, no backend: everything
lives in your browser's `localStorage`.

## Features

- **Add units from a bundled roster** — search ~900 official datasheets across 33
  factions, or type a custom entry for kitbashes and proxies.
- **Hobby workflow** — move each unit through
  `Unbought → Unbuilt → Built → Primed → In Progress → Painted`. Tap a card's
  status button to advance it a stage.
- **Based** is an independent toggle — a model can be based at any stage, so it's
  tracked separately from the linear workflow.
- **Per-unit details** — model count, notes, and a custom army/collection
  grouping (e.g. "My Ultramarines") on top of the source faction.
- **Progress at a glance** — a weighted completion bar and per-status counts for
  your whole collection.
- **Group & filter** — group by your armies or by source faction, filter by
  status, and search by name.
- **Offline & private** — state is persisted locally; nothing leaves your device.

## Tech

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) +
  [Vite](https://vite.dev)
- No UI framework — a small hand-rolled CSS design system (grimdark + Imperial
  gold), mobile-first with safe-area handling.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Data

Unit names live in [`src/data/units.json`](src/data/units.json) as a simple
`{ faction, units: [{ name, role }] }` list, imported via
[`src/data/roster.ts`](src/data/roster.ts).

The roster is derived from a community 10th-edition datasheet dump. 11th edition
(June 2026) kept existing codexes and datasheets valid rather than resetting the
roster, so these names are the current 11th-edition model roster, plus the new
Armageddon launch-box kits. To refresh the data, replace `units.json` — nothing
else depends on the source edition.

*This is an unofficial fan project. Warhammer 40,000 and all associated names are
trademarks of Games Workshop. No GW rules content or points values are included —
only publicly known unit names.*
