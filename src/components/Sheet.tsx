import { useEffect, type ReactNode } from 'react';
import { IconClose } from './icons';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Bottom-sheet (mobile) / centered dialog (desktop) shell. */
export function Sheet({ title, onClose, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet__grab" />
        <div className="sheet__head">
          <span className="sheet__title">{title}</span>
          <button className="iconbtn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__foot">{footer}</div>}
      </div>
    </div>
  );
}
