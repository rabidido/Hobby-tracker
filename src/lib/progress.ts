import type { OwnedUnit, StatusId } from '../types';
import { STATUSES } from '../data/statuses';

export interface Progress {
  byStatus: Map<StatusId, number>;
  models: number;
  /** Weighted completion 0..100. */
  pct: number;
}

/** Weighted completion across a set of units, counted by model. */
export function computeProgress(units: OwnedUnit[]): Progress {
  const byStatus = new Map<StatusId, number>();
  let models = 0;
  let weighted = 0;
  for (const u of units) {
    const q = Math.max(1, u.quantity);
    models += q;
    byStatus.set(u.status, (byStatus.get(u.status) ?? 0) + q);
  }
  for (const s of STATUSES) weighted += (byStatus.get(s.id) ?? 0) * s.progress;
  const pct = models ? Math.round((weighted / models) * 100) : 0;
  return { byStatus, models, pct };
}
