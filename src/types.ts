export type StatusId =
  | 'unbought'
  | 'unbuilt'
  | 'built'
  | 'primed'
  | 'in_progress'
  | 'painted';

export interface StatusDef {
  id: StatusId;
  label: string;
  /** Short label for compact chips. */
  short: string;
  /** Accent colour (used for chips, bars, dots). */
  color: string;
  /** Progress weight 0..1 used for the "completion" metric. */
  progress: number;
}

/** A unit from the bundled roster. */
export interface RosterUnit {
  name: string;
  role: string;
}

export interface RosterFaction {
  faction: string;
  units: RosterUnit[];
}

/** A unit the user owns and is tracking. */
export interface OwnedUnit {
  id: string;
  name: string;
  /** Source faction from the roster (or 'Custom'). */
  faction: string;
  role: string;
  /** User-defined army / collection grouping. Defaults to the faction. */
  army: string;
  status: StatusId;
  /** Independent of the workflow — a mini can be based at any stage. */
  based: boolean;
  quantity: number;
  notes: string;
  addedAt: number;
  updatedAt: number;
}
