export type StatusId =
  | 'unbought'
  | 'unbuilt'
  | 'building'
  | 'built'
  | 'priming'
  | 'primed'
  | 'painting'
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
  /** True for the "actively being worked on" states (building/priming/painting). */
  wip?: boolean;
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

/** An army / project the user is collecting. Top-level grouping. */
export interface Project {
  id: string;
  name: string;
  /** Primary faction — used to filter the datasheet picker by default. */
  faction: string;
  createdAt: number;
  updatedAt: number;
}

/** A unit the user owns and is tracking, belonging to one project/army. */
export interface OwnedUnit {
  id: string;
  name: string;
  /** Source faction from the roster (or 'Custom'). May differ from the
   *  project's faction for allied units (e.g. Knights in an Ad Mech army). */
  faction: string;
  role: string;
  /** The army/project this unit belongs to. */
  projectId: string;
  status: StatusId;
  /** Independent of the workflow — a mini can be based at any stage. */
  based: boolean;
  quantity: number;
  notes: string;
  addedAt: number;
  updatedAt: number;
}
