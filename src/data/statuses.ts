import type { StatusDef, StatusId } from '../types';

/**
 * The linear hobby workflow. "Based" is deliberately NOT in here — a model can
 * be based at any point, so it's tracked as an independent flag on each unit.
 */
export const STATUSES: StatusDef[] = [
  { id: 'unbought', label: 'Unbought', short: 'Wishlist', color: '#6b7280', progress: 0 },
  { id: 'unbuilt', label: 'Unbuilt', short: 'On sprue', color: '#b4453a', progress: 0.05 },
  { id: 'built', label: 'Built', short: 'Built', color: '#c97b3c', progress: 0.3 },
  { id: 'primed', label: 'Primed', short: 'Primed', color: '#7a93b8', progress: 0.5 },
  { id: 'in_progress', label: 'In Progress', short: 'Painting', color: '#d9a441', progress: 0.75 },
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

/** Next status in the workflow, or null if already painted. */
export function nextStatus(id: StatusId): StatusId | null {
  const i = STATUS_ORDER.indexOf(id);
  return i >= 0 && i < STATUS_ORDER.length - 1 ? STATUS_ORDER[i + 1] : null;
}
