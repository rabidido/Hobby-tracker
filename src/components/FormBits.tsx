import type { StatusId } from '../types';
import { STATUSES } from '../data/statuses';
import { IconDisc } from './icons';

export function QtyStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="qtyrow">
      <button
        type="button"
        className="qtybtn"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        className="qtyval input"
        style={{ background: 'transparent', border: 'none' }}
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
          onChange(Number.isFinite(n) && n > 0 ? n : 1);
        }}
        aria-label="Quantity"
      />
      <button
        type="button"
        className="qtybtn"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export function StatusPicker({
  value,
  onChange,
}: {
  value: StatusId;
  onChange: (s: StatusId) => void;
}) {
  return (
    <div className="statuspick">
      {STATUSES.map((s) => (
        <button
          type="button"
          key={s.id}
          className={s.id === value ? 'on' : ''}
          onClick={() => onChange(s.id)}
        >
          <span className="legend__dot" style={{ background: s.color }} />
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function BasedToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button type="button" className="toggle" onClick={() => onChange(!value)}>
      <span className="toggle__text">
        <b style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconDisc className="mini" style={{ width: 15, height: 15, color: '#b98cff' }} /> Based
        </b>
        <span>Bases finished — can be done at any stage</span>
      </span>
      <span className={`switch ${value ? 'on' : ''}`} aria-pressed={value} role="switch" />
    </button>
  );
}

export function ProjectSelect({
  value,
  projects,
  onChange,
}: {
  value: string;
  projects: { id: string; name: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {projects.map((p) => (
        <option value={p.id} key={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
