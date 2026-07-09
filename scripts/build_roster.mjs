#!/usr/bin/env node
/**
 * Rebuild the bundled 40K roster from the BSData 11th-edition catalogues.
 *
 * Fetches each faction catalogue from https://github.com/BSData/wh40k-11e (raw),
 * extracts the datasheets (top-level unit/model entries that carry a "Faction:"
 * category), derives a role from the category tags, and maps BSData's names onto
 * the faction labels the app uses.
 *
 * Usage:  node scripts/build_roster.mjs
 * Writes: units_new.json  (review, then copy over src/data/units.json)
 *
 * Requires `curl` on PATH (used so the fetch honours any HTTPS proxy).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const BASE = 'https://raw.githubusercontent.com/BSData/wh40k-11e/main/';
const TMP = '/tmp/.bs_one.json';

// [filename, faction-label-in-app]. Main + Library files that share a faction
// map to the same label and get merged.
const FILES = [
  ['Imperium - Adepta Sororitas.json', 'Adepta Sororitas'],
  ['Imperium - Adeptus Custodes.json', 'Adeptus Custodes'],
  ['Imperium - Adeptus Mechanicus.json', 'Adeptus Mechanicus'],
  ['Imperium - Agents of the Imperium.json', 'Agents of the Imperium'],
  ['Imperium - Astra Militarum.json', 'Astra Militarum'],
  ['Imperium - Astra Militarum - Library.json', 'Astra Militarum'],
  ['Imperium - Space Marines.json', 'Adeptus Astartes'],
  ['Imperium - Black Templars.json', 'Adeptus Astartes, Black Templars'],
  ['Imperium - Blood Angels.json', 'Adeptus Astartes, Blood Angels'],
  ['Imperium - Dark Angels.json', 'Adeptus Astartes, Dark Angels'],
  ['Imperium - Deathwatch.json', 'Adeptus Astartes, Deathwatch'],
  ['Imperium - Imperial Fists.json', 'Adeptus Astartes, Imperial Fists'],
  ['Imperium - Iron Hands.json', 'Adeptus Astartes, Iron Hands'],
  ['Imperium - Raven Guard.json', 'Adeptus Astartes, Raven Guard'],
  ['Imperium - Salamanders.json', 'Adeptus Astartes, Salamanders'],
  ['Imperium - Space Wolves.json', 'Adeptus Astartes, Space Wolves'],
  ['Imperium - Ultramarines.json', 'Adeptus Astartes, Ultramarines'],
  ['Imperium - White Scars.json', 'Adeptus Astartes, White Scars'],
  ['Imperium - Grey Knights.json', 'Grey Knights'],
  ['Imperium - Imperial Knights.json', 'Imperial Knights'],
  ['Imperium - Imperial Knights - Library.json', 'Imperial Knights'],
  ['Chaos - Chaos Space Marines.json', 'Heretic Astartes'],
  ['Chaos - Death Guard.json', 'Death Guard'],
  ['Chaos - Thousand Sons.json', 'Thousand Sons'],
  ['Chaos - World Eaters.json', 'World Eaters'],
  ["Chaos - Emperor's Children.json", "Emperor's Children"],
  ['Chaos - Chaos Daemons.json', 'Legiones Daemonica'],
  ['Chaos - Chaos Daemons Library.json', 'Legiones Daemonica'],
  ['Chaos - Chaos Knights.json', 'Chaos Knights'],
  ['Chaos - Chaos Knights Library.json', 'Chaos Knights'],
  ['Aeldari - Craftworlds.json', 'Aeldari'],
  ['Aeldari - Aeldari Library.json', 'Aeldari'],
  ['Aeldari - Drukhari.json', 'Drukhari'],
  ['Genestealer Cults.json', 'Genestealer Cults'],
  ['Leagues of Votann.json', 'Leagues of Votann'],
  ['Necrons.json', 'Necrons'],
  ['Orks.json', 'Orks'],
  ["T'au Empire.json", "T'au Empire"],
  ['Tyranids.json', 'Tyranids'],
  ['Library - Tyranids.json', 'Tyranids'],
  ['Unaligned Forces.json', 'Unaligned Forces'],
];

const ROLE_PRIORITY = [
  'Epic Hero',
  'Character',
  'Battleline',
  'Dedicated Transport',
  'Fortification',
  'Monster',
  'Vehicle',
];

const roleOf = (cats) => ROLE_PRIORITY.find((r) => cats.includes(r)) ?? 'Other';

const minOf = (node) => {
  const c = (node.constraints ?? []).find((x) => x.type === 'min');
  return c ? Number(c.value) : 0;
};

// Default size of a model-bearing group: its own `min`, or (e.g. a "Boss Nob"
// group with no group min) the sum of its child models' `min` constraints.
function groupModels(g) {
  const gmin = minOf(g);
  if (gmin > 0) return gmin;
  let s = 0;
  for (const se of g.selectionEntries ?? []) if (se.type === 'model') s += minOf(se);
  return s;
}

// Some units (e.g. Gretchin) encode size only as text in a "Unit Composition"
// group of upgrade options, like "1 Runtherd and 10 Gretchin". Sum the numbers
// in the first option as a best-effort default.
function compositionModels(entry) {
  for (const g of entry.selectionEntryGroups ?? []) {
    const kids = g.selectionEntries ?? [];
    if (kids.length && kids.every((se) => se.type === 'upgrade')) {
      const nums = (kids[0].name ?? '').match(/\d+/g);
      if (nums) return nums.reduce((a, b) => a + Number(b), 0);
    }
  }
  return 0;
}

/**
 * Default model count for a datasheet. Single-model datasheets are 1; for
 * multi-model units it's the sum of the starting sizes of the groups that hold
 * models, falling back to composition text, then 1.
 */
function defaultModels(entry) {
  if (entry.type === 'model') return 1;
  let total = 0;
  const visit = (node) => {
    for (const g of node.selectionEntryGroups ?? []) {
      if ((g.selectionEntries ?? []).some((se) => se.type === 'model')) total += groupModels(g);
      else visit(g); // group of groups
    }
  };
  visit(entry);
  for (const se of entry.selectionEntries ?? []) {
    if (se.type === 'model') total += minOf(se) || 1;
  }
  if (total > 0) return total;
  return compositionModels(entry) || 1;
}

// The Aeldari library bundles Asuryani/Harlequins/Ynnari (=> Aeldari) and
// Drukhari together, tagged by Faction category. Split Drukhari out.
function resolveFaction(fname, def, cats) {
  if (fname === 'Aeldari - Aeldari Library.json') {
    return cats.includes('Faction: Drukhari') ? 'Drukhari' : 'Aeldari';
  }
  return def;
}

/** faction -> Map(name -> role), insertion-ordered. */
const acc = new Map();

for (const [fname, faction] of FILES) {
  const url = BASE + encodeURIComponent(fname);
  let cat;
  try {
    execFileSync('curl', ['-sL', url, '-o', TMP]);
    cat = JSON.parse(readFileSync(TMP, 'utf8')).catalogue;
  } catch (e) {
    console.log('SKIP (fetch/parse fail):', fname, e.message);
    continue;
  }
  const entries = [...(cat.sharedSelectionEntries ?? []), ...(cat.selectionEntries ?? [])];
  let n = 0;
  for (const e of entries) {
    if (e.type !== 'unit' && e.type !== 'model') continue;
    const cats = (e.categoryLinks ?? []).map((cl) => cl.name ?? '');
    if (!cats.some((c) => c.startsWith('Faction:'))) continue; // not a datasheet
    const name = (e.name ?? '').trim();
    const role = roleOf(cats);
    const models = defaultModels(e);
    const fac = resolveFaction(fname, faction, cats);
    if (!acc.has(fac)) acc.set(fac, new Map());
    const d = acc.get(fac);
    // keep a non-Other role if we already saw this name
    if (!d.has(name) || (d.get(name).role === 'Other' && role !== 'Other')) {
      d.set(name, { role, models });
    }
    n++;
  }
  console.log(`${fname.padEnd(48)} -> ${faction.padEnd(34)} (+${n})`);
}

rmSync(TMP, { force: true });

// Build final structure, drop empty factions, sort.
const out = [];
let total = 0;
for (const [faction, units] of acc) {
  if (units.size === 0) continue;
  const list = [...units].map(([name, { role, models }]) => ({ name, role, models }));
  list.sort((a, b) => a.name.localeCompare(b.name));
  out.push({ faction, units: list });
  total += list.length;
}
out.sort((a, b) => a.faction.localeCompare(b.faction));

writeFileSync('units_new.json', JSON.stringify(out, null, 0), 'utf8');
console.log(`\nFACTIONS: ${out.length}  UNITS: ${total}`);
for (const b of out) console.log(`  ${b.faction.padEnd(36)} ${b.units.length}`);
