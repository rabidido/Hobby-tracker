import { useCallback, useEffect, useState } from 'react';
import type { OwnedUnit, Project, StatusId } from '../types';

const KEY_V2 = 'wh40k-hobby-tracker:v2';
const KEY_V1 = 'wh40k-hobby-tracker:v1';

interface State {
  projects: Project[];
  units: OwnedUnit[];
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Old (v1) units were a flat array keyed by a free-text `army` string. Turn
 *  each distinct army into a Project and re-point its units. */
function migrateV1(oldUnits: Array<Record<string, unknown>>): State {
  const projects: Project[] = [];
  const byName = new Map<string, Project>();
  const factionVotes = new Map<string, Map<string, number>>();
  const now = Date.now();

  const units: OwnedUnit[] = oldUnits.map((u) => {
    const armyName = String(u.army ?? u.faction ?? 'My Army');
    let project = byName.get(armyName);
    if (!project) {
      project = { id: makeId(), name: armyName, faction: 'Custom', createdAt: now, updatedAt: now };
      byName.set(armyName, project);
      projects.push(project);
      factionVotes.set(project.id, new Map());
    }
    const faction = String(u.faction ?? 'Custom');
    const votes = factionVotes.get(project.id)!;
    votes.set(faction, (votes.get(faction) ?? 0) + 1);

    return {
      id: String(u.id ?? makeId()),
      name: String(u.name ?? 'Unit'),
      faction,
      role: String(u.role ?? 'Other'),
      projectId: project.id,
      status: (u.status as StatusId) ?? 'unbuilt',
      based: Boolean(u.based),
      quantity: Number(u.quantity) || 1,
      notes: String(u.notes ?? ''),
      addedAt: Number(u.addedAt) || now,
      updatedAt: Number(u.updatedAt) || now,
    };
  });

  // Set each project's faction to the most common faction among its units.
  for (const p of projects) {
    const votes = factionVotes.get(p.id)!;
    let best = 'Custom';
    let max = -1;
    for (const [f, n] of votes) if (n > max) ((max = n), (best = f));
    p.faction = best;
  }

  return { projects, units };
}

function loadState(): State {
  try {
    const raw2 = localStorage.getItem(KEY_V2);
    if (raw2) {
      const parsed = JSON.parse(raw2) as State;
      if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.units)) return parsed;
    }
    const raw1 = localStorage.getItem(KEY_V1);
    if (raw1) {
      const arr = JSON.parse(raw1);
      if (Array.isArray(arr) && arr.length) return migrateV1(arr);
    }
  } catch {
    /* fall through to empty */
  }
  return { projects: [], units: [] };
}

export type NewUnit = Pick<
  OwnedUnit,
  'name' | 'faction' | 'role' | 'status' | 'quantity' | 'notes' | 'based'
>;

export function useCollection() {
  const [state, setState] = useState<State>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_V2, JSON.stringify(state));
    } catch {
      /* storage full/blocked — keep working in memory */
    }
  }, [state]);

  const { projects, units } = state;

  // --- Projects ---
  const addProject = useCallback((name: string, faction: string): string => {
    const now = Date.now();
    const project: Project = { id: makeId(), name: name.trim() || 'My Army', faction, createdAt: now, updatedAt: now };
    setState((s) => ({ ...s, projects: [...s.projects, project] }));
    return project.id;
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setState((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      units: s.units.filter((u) => u.projectId !== id),
    }));
  }, []);

  // --- Units ---
  const addUnit = useCallback((projectId: string, u: NewUnit) => {
    const now = Date.now();
    const unit: OwnedUnit = { ...u, id: makeId(), projectId, addedAt: now, updatedAt: now };
    setState((s) => ({ ...s, units: [unit, ...s.units] }));
  }, []);

  const updateUnit = useCallback((id: string, patch: Partial<OwnedUnit>) => {
    setState((s) => ({
      ...s,
      units: s.units.map((u) => (u.id === id ? { ...u, ...patch, updatedAt: Date.now() } : u)),
    }));
  }, []);

  const removeUnit = useCallback((id: string) => {
    setState((s) => ({ ...s, units: s.units.filter((u) => u.id !== id) }));
  }, []);

  const setStatus = useCallback(
    (id: string, status: StatusId) => updateUnit(id, { status }),
    [updateUnit],
  );

  return {
    projects,
    units,
    addProject,
    updateProject,
    removeProject,
    addUnit,
    updateUnit,
    removeUnit,
    setStatus,
  };
}
