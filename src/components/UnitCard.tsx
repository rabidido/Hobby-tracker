import type { OwnedUnit } from '../types';
import { STATUS_MAP, nextStatus } from '../data/statuses';
import { IconArrowRight, IconDisc, IconNote } from './icons';

interface Props {
  unit: OwnedUnit;
  onOpen: (u: OwnedUnit) => void;
  onAdvance: (u: OwnedUnit) => void;
  showFaction: boolean;
}

export function UnitCard({ unit, onOpen, onAdvance, showFaction }: Props) {
  const status = STATUS_MAP[unit.status];
  const next = nextStatus(unit.status);
  const nextDef = next ? STATUS_MAP[next] : null;

  return (
    <div
      className="card"
      style={{ ['--status' as string]: status.color }}
      onClick={() => onOpen(unit)}
    >
      <div className="card__body">
        <div className="card__name">
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {unit.name}
          </span>
          {unit.quantity > 1 && <span className="card__qty">×{unit.quantity}</span>}
        </div>
        <div className="card__sub">
          {showFaction && <span>{unit.faction}</span>}
          {unit.based && (
            <span className="card__based">
              <IconDisc className="mini" /> Based
            </span>
          )}
          {unit.notes.trim() && (
            <span className="card__notes">
              <IconNote className="mini" /> Note
            </span>
          )}
        </div>
      </div>

      <button
        className="statusbtn"
        onClick={(e) => {
          e.stopPropagation();
          if (nextDef) onAdvance(unit);
          else onOpen(unit);
        }}
        aria-label={
          nextDef ? `Advance ${unit.name} to ${nextDef.label}` : `${unit.name} is painted`
        }
      >
        <span className="statusbtn__label">
          {status.wip && <span className="wipdot" style={{ background: status.color }} />}
          {status.label}
        </span>
        {nextDef && (
          <span className="statusbtn__hint">
            {nextDef.short} <IconArrowRight />
          </span>
        )}
      </button>
    </div>
  );
}
