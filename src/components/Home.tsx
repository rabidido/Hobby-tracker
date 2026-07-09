import { useMemo } from 'react';
import type { OwnedUnit, Project } from '../types';
import { STATUSES } from '../data/statuses';
import { computeProgress } from '../lib/progress';
import { ProgressSummary } from './ProgressSummary';
import { IconArrowRight, IconPlus, IconSkull } from './icons';

interface Props {
  projects: Project[];
  units: OwnedUnit[];
  onOpen: (id: string) => void;
  onAddProject: () => void;
}

export function Home({ projects, units, onOpen, onAddProject }: Props) {
  const unitsByProject = useMemo(() => {
    const map = new Map<string, OwnedUnit[]>();
    for (const u of units) {
      const bucket = map.get(u.projectId);
      if (bucket) bucket.push(u);
      else map.set(u.projectId, [u]);
    }
    return map;
  }, [units]);

  const ordered = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );

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

      {units.length > 0 && <ProgressSummary units={units} />}

      <div className="sectionhead">
        <span className="sectionhead__title">Your armies</span>
        <span className="sectionhead__meta">{projects.length}</span>
      </div>

      {projects.length === 0 ? (
        <div className="empty">
          <IconSkull />
          <h2>No armies yet</h2>
          <p>
            Start a project for each army you collect, then track every unit from unbought to
            painted. Everything is saved on this device.
          </p>
        </div>
      ) : (
        <div className="projectlist">
          {ordered.map((p) => {
            const list = unitsByProject.get(p.id) ?? [];
            const { byStatus, models, pct } = computeProgress(list);
            return (
              <button className="projectcard" key={p.id} onClick={() => onOpen(p.id)}>
                <div className="projectcard__top">
                  <div style={{ minWidth: 0 }}>
                    <div className="projectcard__name">{p.name}</div>
                    <div className="projectcard__meta">
                      {p.faction} · {list.length} unit{list.length === 1 ? '' : 's'} · {models} model
                      {models === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div className="projectcard__pct">
                    {pct}
                    <small>%</small>
                  </div>
                </div>
                <div className="bar" style={{ marginTop: 12 }}>
                  {STATUSES.map((s) => {
                    const n = byStatus.get(s.id) ?? 0;
                    if (!n) return null;
                    return (
                      <div
                        key={s.id}
                        className={`bar__seg ${s.wip ? 'bar__seg--wip' : ''}`}
                        style={{ flexGrow: n, backgroundColor: s.color }}
                      />
                    );
                  })}
                  {!models && <div className="bar__seg" style={{ flexGrow: 1 }} />}
                </div>
                <span className="projectcard__go" aria-hidden>
                  <IconArrowRight />
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button className="fab" onClick={onAddProject}>
        <IconPlus /> New army
      </button>
    </div>
  );
}
