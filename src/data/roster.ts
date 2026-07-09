import type { RosterFaction } from '../types';
import raw from './units.json';

/**
 * Bundled Warhammer 40,000 roster (faction -> datasheet names).
 *
 * Extracted from the community-maintained BSData 11th-edition catalogues
 * (https://github.com/BSData/wh40k-11e) — the open-source army-builder data
 * project, not derived from Wahapedia. Legends datasheets are included and
 * tagged "[Legends]". To refresh, re-run scripts/build_roster.mjs and replace
 * this JSON — nothing else depends on the source.
 */
export const ROSTER: RosterFaction[] = raw as RosterFaction[];

export const FACTIONS: string[] = ROSTER.map((f) => f.faction);

export interface FlatRosterUnit {
  name: string;
  role: string;
  faction: string;
  models: number;
}

/** Every roster unit flattened, for search. */
export const ALL_UNITS: FlatRosterUnit[] = ROSTER.flatMap((f) =>
  f.units.map((u) => ({ name: u.name, role: u.role, faction: f.faction, models: u.models })),
);
