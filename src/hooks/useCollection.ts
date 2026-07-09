import { useCallback, useMemo } from 'react';
import type { OwnedUnit, StatusId } from '../types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'wh40k-hobby-tracker:v1';

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type NewUnit = Pick<
  OwnedUnit,
  'name' | 'faction' | 'role' | 'army' | 'status' | 'quantity' | 'notes' | 'based'
>;

export function useCollection() {
  const [units, setUnits] = useLocalStorage<OwnedUnit[]>(STORAGE_KEY, []);

  const add = useCallback(
    (u: NewUnit) => {
      const now = Date.now();
      const unit: OwnedUnit = { ...u, id: makeId(), addedAt: now, updatedAt: now };
      setUnits((prev) => [unit, ...prev]);
    },
    [setUnits],
  );

  const update = useCallback(
    (id: string, patch: Partial<OwnedUnit>) => {
      setUnits((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...patch, updatedAt: Date.now() } : u)),
      );
    },
    [setUnits],
  );

  const remove = useCallback(
    (id: string) => {
      setUnits((prev) => prev.filter((u) => u.id !== id));
    },
    [setUnits],
  );

  const setStatus = useCallback(
    (id: string, status: StatusId) => update(id, { status }),
    [update],
  );

  const toggleBased = useCallback(
    (id: string) =>
      setUnits((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, based: !u.based, updatedAt: Date.now() } : u,
        ),
      ),
    [setUnits],
  );

  /** Existing army names, most-used first — used to suggest groupings. */
  const armies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of units) counts.set(u.army, (counts.get(u.army) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [units]);

  return { units, armies, add, update, remove, setStatus, toggleBased };
}
