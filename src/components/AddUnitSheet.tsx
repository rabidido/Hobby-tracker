import { useMemo, useState } from 'react';
import type { StatusId } from '../types';
import type { NewUnit } from '../hooks/useCollection';
import { ALL_UNITS, type FlatRosterUnit } from '../data/roster';
import { Sheet } from './Sheet';
import { ArmyField, BasedToggle, QtyStepper, StatusPicker } from './FormBits';
import { IconSearch } from './icons';

interface Props {
  armies: string[];
  onClose: () => void;
  onAdd: (u: NewUnit) => void;
}

const MAX_RESULTS = 40;

export function AddUnitSheet({ armies, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<FlatRosterUnit | null>(null);

  // details form state
  const [army, setArmy] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<StatusId>('unbuilt');
  const [based, setBased] = useState(false);
  const [notes, setNotes] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_UNITS.slice(0, MAX_RESULTS);
    const starts: FlatRosterUnit[] = [];
    const contains: FlatRosterUnit[] = [];
    for (const u of ALL_UNITS) {
      const n = u.name.toLowerCase();
      if (n.startsWith(q)) starts.push(u);
      else if (n.includes(q) || u.faction.toLowerCase().includes(q)) contains.push(u);
      if (starts.length >= MAX_RESULTS) break;
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [query]);

  function choose(u: FlatRosterUnit) {
    setPicked(u);
    setArmy(u.faction);
  }

  function chooseCustom() {
    const name = query.trim();
    if (!name) return;
    const custom: FlatRosterUnit = { name, role: 'Other', faction: 'Custom' };
    setPicked(custom);
    setArmy('Custom');
  }

  function submit() {
    if (!picked) return;
    onAdd({
      name: picked.name,
      faction: picked.faction,
      role: picked.role,
      army: army.trim() || picked.faction,
      status,
      based,
      quantity: Math.max(1, quantity),
      notes: notes.trim(),
    });
    onClose();
  }

  if (!picked) {
    return (
      <Sheet title="Add a unit" onClose={onClose}>
        <div className="search" style={{ marginBottom: 12 }}>
          <IconSearch />
          <input
            autoFocus
            placeholder="Search 900+ datasheets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="picklist">
          {results.map((u) => (
            <button className="pickitem" key={`${u.faction}:${u.name}`} onClick={() => choose(u)}>
              <span>
                <div className="pickitem__name">{u.name}</div>
                <div className="pickitem__meta">{u.faction}</div>
              </span>
              {u.role !== 'Other' && <span className="pickitem__role">{u.role}</span>}
            </button>
          ))}
          {results.length === 0 && (
            <p style={{ color: 'var(--muted)', padding: '8px 4px', fontSize: '0.9rem' }}>
              No datasheet matches “{query}”.
            </p>
          )}
        </div>

        {query.trim() && (
          <button className="pickcustom" onClick={chooseCustom}>
            Can’t find it? Add <b>“{query.trim()}”</b> as a custom entry →
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
            Add to collection
          </button>
        </>
      }
    >
      <div className="field">
        <label>Unit</label>
        <input className="input" value={picked.name} onChange={(e) => setPicked({ ...picked, name: e.target.value })} />
        <p style={{ margin: '6px 2px 0', fontSize: '0.76rem', color: 'var(--faint)' }}>
          {picked.faction}
          {picked.role !== 'Other' ? ` · ${picked.role}` : ''}
        </p>
      </div>

      <div className="field">
        <label>Army / collection</label>
        <ArmyField value={army} onChange={setArmy} suggestions={[...new Set([...armies, picked.faction])]} />
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
