import type { RosterFaction } from '../types';
import raw from './units.json';

/**
 * Bundled Warhammer 40,000 roster (faction -> datasheet names).
 *
 * Derived from a community 10th-edition datasheet dump. 11th edition (June 2026)
 * kept existing codexes/datasheets valid rather than resetting the roster, so
 * these names are the current 11th-edition model roster, plus the new Armageddon
 * launch-box kits. Swap this JSON to refresh the data — nothing else depends on
 * the source edition.
 */
export const ROSTER: RosterFaction[] = raw as RosterFaction[];

export const FACTIONS: string[] = ROSTER.map((f) => f.faction);

export interface FlatRosterUnit {
  name: string;
  role: string;
  faction: string;
}

/** Every roster unit flattened, for search. */
export const ALL_UNITS: FlatRosterUnit[] = ROSTER.flatMap((f) =>
  f.units.map((u) => ({ name: u.name, role: u.role, faction: f.faction })),
);
