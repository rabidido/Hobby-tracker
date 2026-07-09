import { useMemo, useState } from 'react';
import type { Project, StatusId } from '../types';
import type { NewUnit } from '../hooks/useCollection';
import { ALL_UNITS, type FlatRosterUnit } from '../data/roster';
import { Sheet } from './Sheet';
import { BasedToggle, QtyStepper, StatusPicker } from './FormBits';
import { IconSearch } from './icons';

interface Props {
  project: Project;
  onClose: () => void;
  onAdd: (projectId: string, u: NewUnit) => void;
}

const MAX_RESULTS = 40;

export function AddUnitSheet({ project, onClose, onAdd }: Props) {
  // If the army has no single source faction, start in "all factions" mode.
  const factionKnown = project.faction !== 'Custom' && project.faction !== 'Mixed';

  const [query, setQuery] = useState('');
  const [allFactions, setAllFactions] = useState(!factionKnown);
  const [picked, setPicked] = useState<FlatRosterUnit | null>(null);

  // details form state
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<StatusId>('unbuilt');
  const [based, setBased] = useState(false);
  const [notes, setNotes] = useState('');

  const pool = useMemo(
    () => (allFactions ? ALL_UNITS : ALL_UNITS.filter((u) => u.faction === project.faction)),
    [allFactions, project.faction],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pool.slice(0, MAX_RESULTS);
    const starts: FlatRosterUnit[] = [];
    const contains: FlatRosterUnit[] = [];
    for (const u of pool) {
      const n = u.name.toLowerCase();
      if (n.startsWith(q)) starts.push(u);
      else if (n.includes(q) || u.faction.toLowerCase().includes(q)) contains.push(u);
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [query, pool]);

  function chooseCustom() {
    const name = query.trim();
    if (!name) return;
    setPicked({ name, role: 'Other', faction: factionKnown ? project.faction : 'Custom' });
  }

  function submit() {
    if (!picked) return;
    onAdd(project.id, {
      name: picked.name,
      faction: picked.faction,
      role: picked.role,
      status,
      based,
      quantity: Math.max(1, quantity),
      notes: notes.trim(),
    });
    onClose();
  }

  if (!picked) {
    return (
      <Sheet title={`Add to ${project.name}`} onClose={onClose}>
        {factionKnown && (
          <div className="segrow" role="tablist" aria-label="Filter datasheets">
            <button
              role="tab"
              aria-selected={!allFactions}
              className={`seg ${!allFactions ? 'on' : ''}`}
              onClick={() => setAllFactions(false)}
            >
              {project.faction}
            </button>
            <button
              role="tab"
              aria-selected={allFactions}
              className={`seg ${allFactions ? 'on' : ''}`}
              onClick={() => setAllFactions(true)}
            >
              All factions
            </button>
          </div>
        )}

        <div className="search" style={{ margin: '12px 0' }}>
          <IconSearch />
          <input
            autoFocus
            placeholder={allFactions ? 'Search all datasheets…' : `Search ${project.faction}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="picklist">
          {results.map((u) => (
            <button
              className="pickitem"
              key={`${u.faction}:${u.name}`}
              onClick={() => setPicked(u)}
            >
              <span>
                <div className="pickitem__name">{u.name}</div>
                <div className="pickitem__meta">{u.faction}</div>
              </span>
              {u.role !== 'Other' && <span className="pickitem__role">{u.role}</span>}
            </button>
          ))}
          {results.length === 0 && (
            <p style={{ color: 'var(--muted)', padding: '8px 4px', fontSize: '0.9rem' }}>
              No datasheet matches{query.trim() ? ` “${query.trim()}”` : ''}
              {!allFactions ? ` in ${project.faction}` : ''}.
              {!allFactions && (
                <>
                  {' '}
                  <button
                    className="linkbtn"
                    onClick={() => setAllFactions(true)}
                  >
                    Search all factions
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        {query.trim() && (
          <button className="pickcustom" onClick={chooseCustom}>
            Add <b>“{query.trim()}”</b> as a custom entry →
          </button>
        )}
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Unit details"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn--ghost" onClick={() => setPicked(null)}>
            Back
          </button>
          <button className="btn btn--primary" onClick={submit}>
            Add to {project.name}
          </button>
        </>
      }
    >
      <div className="field">
        <label>Unit</label>
        <input
          className="input"
          value={picked.name}
          onChange={(e) => setPicked({ ...picked, name: e.target.value })}
        />
        <p style={{ margin: '6px 2px 0', fontSize: '0.76rem', color: 'var(--faint)' }}>
          {picked.faction}
          {picked.role !== 'Other' ? ` · ${picked.role}` : ''}
        </p>
      </div>

      <div className="field">
        <label>Models in this entry</label>
        <QtyStepper value={quantity} onChange={setQuantity} />
      </div>

      <div className="field">
        <label>Status</label>
        <StatusPicker value={status} onChange={setStatus} />
      </div>

      <div className="field">
        <BasedToggle value={based} onChange={setBased} />
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea
          className="input"
          value={notes}
          placeholder="Paint scheme, kitbash ideas, sub-unit…"
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Sheet>
  );
}
