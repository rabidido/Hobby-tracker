import { useMemo } from 'react';
import type { OwnedUnit } from '../types';
import { STATUSES } from '../data/statuses';
import { computeProgress } from '../lib/progress';

export function ProgressSummary({ units }: { units: OwnedUnit[] }) {
  const { byStatus, models, pct } = useMemo(() => computeProgress(units), [units]);

  return (
    <section className="summary" aria-label="Collection progress">
      <div className="summary__top">
        <div className="summary__pct">
          {pct}
          <small>% complete</small>
        </div>
        <div className="summary__label">
          <div>
            <span className="summary__count">{units.length}</span> unit{units.length === 1 ? '' : 's'}
          </div>
          <div>
            <span className="summary__count">{models}</span> model{models === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="bar" role="img" aria-label={`${pct}% complete`}>
        {STATUSES.map((s) => {
          const n = byStatus.get(s.id) ?? 0;
          if (!n) return null;
          return (
            <div
              key={s.id}
              className={`bar__seg ${s.wip ? 'bar__seg--wip' : ''}`}
              style={{ flexGrow: n, backgroundColor: s.color }}
              title={`${s.label}: ${n}`}
            />
          );
        })}
        {!models && <div className="bar__seg" style={{ flexGrow: 1 }} />}
      </div>

      <div className="legend">
        {STATUSES.map((s) => (
          <div className="legend__item" key={s.id}>
            <span
              className={`legend__dot ${s.wip ? 'is-wip' : ''}`}
              style={{ backgroundColor: s.color }}
            />
            {s.label}
            <span className="legend__n">{byStatus.get(s.id) ?? 0}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
