import { useMemo, useState } from 'react';
import type { OwnedUnit, Project, StatusId } from '../types';
import { STATUSES, STATUS_ORDER, nextStatus } from '../data/statuses';
import { ProgressSummary } from './ProgressSummary';
import { UnitCard } from './UnitCard';
import { IconBack, IconPlus, IconSearch, IconSettings } from './icons';

type Filter = StatusId | 'all';

interface Props {
  project: Project;
  units: OwnedUnit[];
  onBack: () => void;
  onSetStatus: (id: string, status: StatusId) => void;
  onAddUnit: () => void;
  onEditUnit: (u: OwnedUnit) => void;
  onOpenSettings: () => void;
}

export function ProjectView({
  project,
  units,
  onBack,
  onSetStatus,
  onAddUnit,
  onEditUnit,
  onOpenSettings,
}: Props) {
  // Search and status filter are transient in-page state — deliberately NOT
  // part of browser history, so they never create back-button steps.
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const mine = useMemo(() => units.filter((u) => u.projectId === project.id), [units, project.id]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = mine.filter((u) => {
      if (filter !== 'all' && u.status !== filter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.faction.toLowerCase().includes(q))
        return false;
      return true;
    });

    // Group by source faction only when the army mixes factions (allies).
    const factions = new Set(filtered.map((u) => u.faction));
    const multi = factions.size > 1;

    const map = new Map<string, OwnedUnit[]>();
    for (const u of filtered) {
      const key = multi ? u.faction : '';
      const bucket = map.get(key);
      if (bucket) bucket.push(u);
      else map.set(key, [u]);
    }

    const rank = (u: OwnedUnit) => STATUS_ORDER.indexOf(u.status);
    return {
      multi,
      sections: [...map.entries()]
        .map(([name, list]) => ({
          name,
          list: list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [mine, query, filter]);

  return (
    <div className="app">
      <header className="topbar topbar--project">
        <button className="backbtn" onClick={onBack} aria-label="Back to armies">
          <IconBack />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="proj__title">{project.name}</h1>
          <p className="proj__sub">{project.faction}</p>
        </div>
        <button className="iconbtn" onClick={onOpenSettings} aria-label="Army settings">
          <IconSettings />
        </button>
      </header>

      {mine.length > 0 && <ProgressSummary units={mine} />}

      {mine.length > 0 && (
        <>
          <div className="controls">
            <div className="search">
              <IconSearch />
              <input
                placeholder="Search this army…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
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

      {mine.length === 0 && (
        <div className="empty">
          <IconSearch />
          <h2>No units yet</h2>
          <p>
            Add the units you own for {project.name}. The picker is filtered to {project.faction} —
            switch to all factions to add allies.
          </p>
        </div>
      )}

      {mine.length > 0 && groups.sections.length === 0 && (
        <div className="empty">
          <IconSearch />
          <h2>Nothing matches</h2>
          <p>Try a different search or clear the status filter.</p>
        </div>
      )}

      {groups.sections.map((g) => (
        <section key={g.name || 'all'}>
          {groups.multi && (
            <div className="group__head">
              <span className="group__title">{g.name}</span>
              <span className="group__meta">
                {g.list.reduce((n, u) => n + Math.max(1, u.quantity), 0)} models
              </span>
              <span className="group__line" />
            </div>
          )}
          {g.list.map((u) => (
            <UnitCard
              key={u.id}
              unit={u}
              showFaction={groups.multi}
              onOpen={onEditUnit}
              onAdvance={(unit) => {
                const nx = nextStatus(unit.status);
                if (nx) onSetStatus(unit.id, nx);
              }}
            />
          ))}
        </section>
      ))}

      <button className="fab" onClick={onAddUnit}>
        <IconPlus /> Add unit
      </button>
    </div>
  );
}
