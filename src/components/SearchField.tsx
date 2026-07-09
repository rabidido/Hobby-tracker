import type { CSSProperties } from 'react';
import { IconClose, IconSearch } from './icons';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  style?: CSSProperties;
}

/**
 * Search input hardened for mobile (esp. iOS Safari):
 * - type=search + enterKeyHint give a proper "Search" return key
 * - autocapitalize/autocorrect/spellcheck off so unit names aren't mangled
 * - 16px font (set in CSS) avoids the focus-zoom
 * - a custom clear button that keeps focus (mousedown preventDefault)
 */
export function SearchField({ value, onChange, placeholder, autoFocus, style }: Props) {
  return (
    <div className="search" style={style}>
      <IconSearch />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search__clear"
          aria-label="Clear search"
          // Keep the input focused (and the keyboard up) when clearing.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange('')}
        >
          <IconClose />
        </button>
      )}
    </div>
  );
}
