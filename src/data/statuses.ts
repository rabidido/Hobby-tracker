import type { StatusDef, StatusId } from '../types';

/**
 * The hobby pipeline. Each of the three phases — build, prime, paint — has a
 * work-in-progress state (`wip: true`) that sits just before its "done" state,
 * so a unit can be marked as actively being built, primed or painted.
 *
 * "Based" is deliberately NOT in here — a model can be based at any point, so
 * it's tracked as an independent flag on each unit.
 */
export const STATUSES: StatusDef[] = [
  { id: 'unbought', label: 'Unbought', short: 'Wishlist', color: '#6b7280', progress: 0 },
  { id: 'unbuilt', label: 'Unbuilt', short: 'On sprue', color: '#a8443a', progress: 0.05 },
  { id: 'building', label: 'Building', short: 'Building', color: '#cf6a34', progress: 0.17, wip: true },
  { id: 'built', label: 'Built', short: 'Built', color: '#d9903f', progress: 0.33 },
  { id: 'priming', label: 'Priming', short: 'Priming', color: '#6f88b0', progress: 0.42, wip: true },
  { id: 'primed', label: 'Primed', short: 'Primed', color: '#93aacb', progress: 0.5 },
  { id: 'painting', label: 'Painting', short: 'Painting', color: '#d9a441', progress: 0.72, wip: true },
  { id: 'painted', label: 'Painted', short: 'Painted', color: '#5aa469', progress: 1 },
];

export const STATUS_MAP: Record<StatusId, StatusDef> = STATUSES.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<StatusId, StatusDef>,
);

export const STATUS_ORDER: StatusId[] = STATUSES.map((s) => s.id);

/** Next status in the pipeline, or null if already painted. */
export function nextStatus(id: StatusId): StatusId | null {
  const i = STATUS_ORDER.indexOf(id);
  return i >= 0 && i < STATUS_ORDER.length - 1 ? STATUS_ORDER[i + 1] : null;
}

/** Map any legacy/unknown status id onto a current one. The old single
 *  'in_progress' state meant "actively painting", so it becomes 'painting'. */
export function normalizeStatus(id: string): StatusId {
  if (id === 'in_progress') return 'painting';
  return (STATUS_ORDER as string[]).includes(id) ? (id as StatusId) : 'unbuilt';
}
