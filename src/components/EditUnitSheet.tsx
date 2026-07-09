import { useState } from 'react';
import type { OwnedUnit, Project, StatusId } from '../types';
import { Sheet } from './Sheet';
import { BasedToggle, ProjectSelect, QtyStepper, StatusPicker } from './FormBits';
import { IconTrash } from './icons';

interface Props {
  unit: OwnedUnit;
  projects: Project[];
  onClose: () => void;
  onSave: (id: string, patch: Partial<OwnedUnit>) => void;
  onDelete: (id: string) => void;
}

export function EditUnitSheet({ unit, projects, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(unit.name);
  const [projectId, setProjectId] = useState(unit.projectId);
  const [quantity, setQuantity] = useState(unit.quantity);
  const [status, setStatus] = useState<StatusId>(unit.status);
  const [based, setBased] = useState(unit.based);
  const [notes, setNotes] = useState(unit.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() {
    onSave(unit.id, {
      name: name.trim() || unit.name,
      projectId,
      quantity: Math.max(1, quantity),
      status,
      based,
      notes: notes.trim(),
    });
    onClose();
  }

  return (
    <Sheet
      title="Edit unit"
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
                onDelete(unit.id);
                onClose();
              }}
            >
              <IconTrash style={{ width: 16, height: 16 }} /> Delete for good
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn--danger"
              style={{ flex: '0 0 auto' }}
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete unit"
            >
              <IconTrash style={{ width: 18, height: 18 }} />
            </button>
            <button className="btn btn--primary" onClick={save}>
              Save changes
            </button>
          </>
        )
      }
    >
      <div className="field">
        <label>Unit</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <p style={{ margin: '6px 2px 0', fontSize: '0.76rem', color: 'var(--faint)' }}>
          {unit.faction}
          {unit.role !== 'Other' ? ` · ${unit.role}` : ''}
        </p>
      </div>

      {projects.length > 1 && (
        <div className="field">
          <label>Army</label>
          <ProjectSelect value={projectId} projects={projects} onChange={setProjectId} />
        </div>
      )}

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
        <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Sheet>
  );
}
