import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State that transparently persists to localStorage. Writes are debounced by the
 * browser's normal event loop; reads happen once on mount. Falls back to the
 * initial value when storage is unavailable (e.g. private mode) or corrupt.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Keep a ref so the setter identity stays stable across renders.
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      /* storage full or blocked — nothing we can do, keep working in-memory */
    }
  }, [value]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next);
  }, []);

  return [value, update] as const;
}
