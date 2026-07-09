#!/usr/bin/env python3
"""Rebuild the bundled 40K roster from the BSData 11th-edition catalogues.

Fetches each faction catalogue from https://github.com/BSData/wh40k-11e (raw),
extracts the datasheets (top-level unit/model entries that carry a "Faction:"
category), derives a role from the category tags, and maps BSData's names onto
the faction labels the app uses.

Usage:  python3 scripts/build_roster.py
Writes: units_new.json  (review, then copy over src/data/units.json)

Requires network access to raw.githubusercontent.com and `curl` on PATH.
"""
import json, subprocess, urllib.parse, os, collections

BASE = 'https://raw.githubusercontent.com/BSData/wh40k-11e/main/'
TMP = '/tmp/.bs_one.json'

# (filename, faction-label-in-app). Main + Library files that share a faction
# map to the same label and get merged.
FILES = [
    ('Imperium - Adepta Sororitas.json', 'Adepta Sororitas'),
    ('Imperium - Adeptus Custodes.json', 'Adeptus Custodes'),
    ('Imperium - Adeptus Mechanicus.json', 'Adeptus Mechanicus'),
    ('Imperium - Agents of the Imperium.json', 'Agents of the Imperium'),
    ('Imperium - Astra Militarum.json', 'Astra Militarum'),
    ('Imperium - Astra Militarum - Library.json', 'Astra Militarum'),
    ('Imperium - Space Marines.json', 'Adeptus Astartes'),
    ('Imperium - Black Templars.json', 'Adeptus Astartes, Black Templars'),
    ('Imperium - Blood Angels.json', 'Adeptus Astartes, Blood Angels'),
    ('Imperium - Dark Angels.json', 'Adeptus Astartes, Dark Angels'),
    ('Imperium - Deathwatch.json', 'Adeptus Astartes, Deathwatch'),
    ('Imperium - Imperial Fists.json', 'Adeptus Astartes, Imperial Fists'),
    ('Imperium - Iron Hands.json', 'Adeptus Astartes, Iron Hands'),
    ('Imperium - Raven Guard.json', 'Adeptus Astartes, Raven Guard'),
    ('Imperium - Salamanders.json', 'Adeptus Astartes, Salamanders'),
    ('Imperium - Space Wolves.json', 'Adeptus Astartes, Space Wolves'),
    ('Imperium - Ultramarines.json', 'Adeptus Astartes, Ultramarines'),
    ('Imperium - White Scars.json', 'Adeptus Astartes, White Scars'),
    ('Imperium - Grey Knights.json', 'Grey Knights'),
    ('Imperium - Imperial Knights.json', 'Imperial Knights'),
    ('Imperium - Imperial Knights - Library.json', 'Imperial Knights'),
    ('Chaos - Chaos Space Marines.json', 'Heretic Astartes'),
    ('Chaos - Death Guard.json', 'Death Guard'),
    ('Chaos - Thousand Sons.json', 'Thousand Sons'),
    ('Chaos - World Eaters.json', 'World Eaters'),
    ("Chaos - Emperor's Children.json", "Emperor's Children"),
    ('Chaos - Chaos Daemons.json', 'Legiones Daemonica'),
    ('Chaos - Chaos Daemons Library.json', 'Legiones Daemonica'),
    ('Chaos - Chaos Knights.json', 'Chaos Knights'),
    ('Chaos - Chaos Knights Library.json', 'Chaos Knights'),
    ('Aeldari - Craftworlds.json', 'Aeldari'),
    ('Aeldari - Aeldari Library.json', 'Aeldari'),
    ('Aeldari - Drukhari.json', 'Drukhari'),
    ('Genestealer Cults.json', 'Genestealer Cults'),
    ('Leagues of Votann.json', 'Leagues of Votann'),
    ('Necrons.json', 'Necrons'),
    ('Orks.json', 'Orks'),
    ("T'au Empire.json", "T'au Empire"),
    ('Tyranids.json', 'Tyranids'),
    ('Library - Tyranids.json', 'Tyranids'),
    ('Unaligned Forces.json', 'Unaligned Forces'),
]

ROLE_PRIORITY = ['Epic Hero', 'Character', 'Battleline', 'Dedicated Transport',
                 'Fortification', 'Monster', 'Vehicle']

def role_of(cats):
    for r in ROLE_PRIORITY:
        if r in cats:
            return r
    return 'Other'

def resolve_faction(fname, default_faction, cats):
    # The Aeldari library bundles Asuryani/Harlequins/Ynnari (=> Aeldari) and
    # Drukhari together, tagged by Faction category. Split Drukhari out.
    if fname == 'Aeldari - Aeldari Library.json':
        return 'Drukhari' if 'Faction: Drukhari' in cats else 'Aeldari'
    return default_faction

# faction -> { name -> role }
acc = collections.OrderedDict()

for fname, faction in FILES:
    url = BASE + urllib.parse.quote(fname)
    r = subprocess.run(['curl', '-sL', url, '-o', TMP], capture_output=True)
    try:
        cat = json.load(open(TMP))['catalogue']
    except Exception as e:
        print('SKIP (parse/fetch fail):', fname, e)
        continue
    entries = cat.get('sharedSelectionEntries', []) + cat.get('selectionEntries', [])
    n = 0
    for e in entries:
        if e.get('type') not in ('unit', 'model'):
            continue
        cats = [cl.get('name', '') for cl in e.get('categoryLinks', [])]
        if not any(c.startswith('Faction:') for c in cats):
            continue  # not a datasheet (wargear/option/etc.)
        name = e['name'].strip()
        role = role_of(cats)
        d = acc.setdefault(resolve_faction(fname, faction, cats), {})
        # keep a non-Other role if we already saw the name
        if name not in d or (d[name] == 'Other' and role != 'Other'):
            d[name] = role
        n += 1
    print(f'{fname:48s} -> {faction:34s} (+{n})')

os.remove(TMP)

# Build final structure, drop empty factions, sort
out = []
total = 0
for faction, units in acc.items():
    if not units:
        continue
    lst = [{'name': nm, 'role': rl} for nm, rl in units.items()]
    lst.sort(key=lambda u: u['name'])
    out.append({'faction': faction, 'units': lst})
    total += len(lst)

out.sort(key=lambda b: b['faction'])
json.dump(out, open('units_new.json', 'w'), ensure_ascii=False, indent=0)
print('\nFACTIONS:', len(out), 'UNITS:', total)
for b in out:
    print(f"  {b['faction']:36s} {len(b['units'])}")
