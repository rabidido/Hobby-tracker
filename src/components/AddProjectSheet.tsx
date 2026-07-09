import { useState } from 'react';
import { FACTIONS } from '../data/roster';
import { Sheet } from './Sheet';

interface Props {
  onClose: () => void;
  onCreate: (name: string, faction: string) => void;
}

const MIXED = 'Custom / Mixed';

export function AddProjectSheet({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [faction, setFaction] = useState(FACTIONS[0] ?? MIXED);

  function create() {
    onCreate(name.trim() || 'My Army', faction === MIXED ? 'Mixed' : faction);
    onClose();
  }

  return (
    <Sheet
      title="New army"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={!name.trim()} onClick={create}>
            Create army
          </button>
        </>
      }
    >
      <div className="field">
        <label>Army name</label>
        <input
          className="input"
          autoFocus
          placeholder="e.g. My Ultramarines, Speed Freeks…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && create()}
        />
      </div>

      <div className="field">
        <label>Primary faction</label>
        <select className="input" value={faction} onChange={(e) => setFaction(e.target.value)}>
          {FACTIONS.map((f) => (
            <option value={f} key={f}>
              {f}
            </option>
          ))}
          <option value={MIXED}>{MIXED}</option>
        </select>
        <p style={{ margin: '7px 2px 0', fontSize: '0.76rem', color: 'var(--faint)' }}>
          The datasheet picker filters to this faction by default — you can switch to all factions
          to add allies.
        </p>
      </div>
    </Sheet>
  );
}
