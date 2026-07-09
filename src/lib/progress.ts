import type { OwnedUnit, StatusId } from '../types';
import { STATUSES } from '../data/statuses';

export interface Progress {
  /** Number of unit entries in each status. */
  byStatus: Map<StatusId, number>;
  /** Total models owned (sum of quantities) — shown as an info stat. */
  models: number;
  /** Weighted completion 0..100, counted by unit entry (not by model). */
  pct: number;
}

/** Weighted completion across a set of units, each unit entry counted equally. */
export function computeProgress(units: OwnedUnit[]): Progress {
  const byStatus = new Map<StatusId, number>();
  let models = 0;
  let weighted = 0;
  for (const u of units) {
    models += Math.max(1, u.quantity);
    byStatus.set(u.status, (byStatus.get(u.status) ?? 0) + 1);
  }
  for (const s of STATUSES) weighted += (byStatus.get(s.id) ?? 0) * s.progress;
  const pct = units.length ? Math.round((weighted / units.length) * 100) : 0;
  return { byStatus, models, pct };
}
