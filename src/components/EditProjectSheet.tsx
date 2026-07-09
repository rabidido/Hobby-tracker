import { useState } from 'react';
import type { Project } from '../types';
import { FACTIONS } from '../data/roster';
import { Sheet } from './Sheet';
import { IconTrash } from './icons';

const MIXED = 'Mixed';

interface Props {
  project: Project;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export function EditProjectSheet({ project, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(project.name);
  const [faction, setFaction] = useState(project.faction);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() {
    onSave(project.id, { name: name.trim() || project.name, faction });
    onClose();
  }

  return (
    <Sheet
      title="Army settings"
      onClose={onClose}
      footer={
        confirmDelete ? (
          <>
            <button className="btn btn--ghost" onClick={() => setConfirmDelete(false)}>
              Keep
            </button>
            <button
              className="btn btn--danger"
              onClick={() => {
                onDelete(project.id);
                onClose();
              }}
            >
              <IconTrash style={{ width: 16, height: 16 }} /> Delete army & its units
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn--danger"
              style={{ flex: '0 0 auto' }}
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete army"
            >
              <IconTrash style={{ width: 18, height: 18 }} />
            </button>
            <button className="btn btn--primary" onClick={save}>
              Save
            </button>
          </>
        )
      }
    >
      <div className="field">
        <label>Army name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Primary faction</label>
        <select className="input" value={faction} onChange={(e) => setFaction(e.target.value)}>
          {FACTIONS.map((f) => (
            <option value={f} key={f}>
              {f}
            </option>
          ))}
          <option value={MIXED}>Custom / Mixed</option>
        </select>
      </div>
    </Sheet>
  );
}
