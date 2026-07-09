import { useMemo, useState } from 'react';
import type { OwnedUnit, StatusId } from './types';
import { useCollection } from './hooks/useCollection';
import { STATUSES, STATUS_ORDER, nextStatus } from './data/statuses';
import { ProgressSummary } from './components/ProgressSummary';
import { UnitCard } from './components/UnitCard';
import { AddUnitSheet } from './components/AddUnitSheet';
import { EditUnitSheet } from './components/EditUnitSheet';
import { IconGroup, IconLayers, IconPlus, IconSearch, IconSkull } from './components/icons';

type GroupBy = 'army' | 'faction';
type Filter = StatusId | 'all';

export default function App() {
  const { units, armies, add, update, remove, setStatus } = useCollection();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('army');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<OwnedUnit | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = units.filter((u) => {
      if (filter !== 'all' && u.status !== filter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.army.toLowerCase().includes(q)) return false;
      return true;
    });

    const map = new Map<string, OwnedUnit[]>();
    for (const u of filtered) {
      const key = groupBy === 'army' ? u.army : u.faction;
      const bucket = map.get(key);
      if (bucket) bucket.push(u);
      else map.set(key, [u]);
    }

    const rank = (u: OwnedUnit) => STATUS_ORDER.indexOf(u.status);
    return [...map.entries()]
      .map(([name, list]) => ({
        name,
        list: list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [units, query, filter, groupBy]);

  const hasUnits = units.length > 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <IconSkull className="brand__mark" />
          <div>
            <h1 className="brand__title">Hobby Tracker</h1>
            <p className="brand__sub">Sprue to painted · 40K</p>
          </div>
        </div>
      </header>

      {hasUnits && <ProgressSummary units={units} />}

      {hasUnits && (
        <>
          <div className="controls">
            <div className="search">
              <IconSearch />
              <input
                placeholder="Search your collection…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              className={`iconbtn ${groupBy === 'faction' ? 'active' : ''}`}
              onClick={() => setGroupBy((g) => (g === 'army' ? 'faction' : 'army'))}
              aria-label={`Group by ${groupBy === 'army' ? 'faction' : 'army'}`}
              title={`Grouping by ${groupBy}`}
            >
              {groupBy === 'army' ? <IconGroup /> : <IconLayers />}
            </button>
          </div>

          <div className="filterrow">
            <button
              className={`chip ${filter === 'all' ? 'on' : ''}`}
              style={filter === 'all' ? { background: 'var(--surface-3)' } : undefined}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s.id}
                className={`chip ${filter === s.id ? 'on' : ''}`}
                style={
                  filter === s.id
                    ? { background: `color-mix(in srgb, ${s.color} 26%, transparent)` }
                    : undefined
                }
                onClick={() => setFilter((f) => (f === s.id ? 'all' : s.id))}
              >
                <span className="chip__dot" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}

      {!hasUnits && (
        <div className="empty">
          <IconSkull />
          <h2>Your muster roll is empty</h2>
          <p>
            Add the units you own and track each one from unbought all the way to fully painted.
            Everything is saved on this device.
          </p>
        </div>
      )}

      {hasUnits && groups.length === 0 && (
        <div className="empty">
          <IconSearch />
          <h2>Nothing matches</h2>
          <p>Try a different search or clear the status filter.</p>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.name}>
          <div className="group__head">
            <span className="group__title">{g.name}</span>
            <span className="group__meta">
              {g.list.reduce((n, u) => n + Math.max(1, u.quantity), 0)} models
            </span>
            <span className="group__line" />
          </div>
          {g.list.map((u) => (
            <UnitCard
              key={u.id}
              unit={u}
              showFaction={groupBy === 'army'}
              onOpen={setEditing}
              onAdvance={(unit) => {
                const nx = nextStatus(unit.status);
                if (nx) setStatus(unit.id, nx);
              }}
            />
          ))}
        </section>
      ))}

      <button className="fab" onClick={() => setAddOpen(true)}>
        <IconPlus /> Add unit
      </button>

      {addOpen && <AddUnitSheet armies={armies} onClose={() => setAddOpen(false)} onAdd={add} />}
      {editing && (
        <EditUnitSheet
          unit={editing}
          armies={armies}
          onClose={() => setEditing(null)}
          onSave={update}
          onDelete={remove}
        />
      )}
    </div>
  );
}
