import { useCallback, useEffect, useState } from 'react';

/**
 * Which modal sheet (if any) is open. Sheets are history entries too, so the
 * browser/OS back button closes them before leaving the screen.
 */
export type SheetState =
  | { kind: 'addProject' }
  | { kind: 'addUnit'; projectId: string }
  | { kind: 'editUnit'; unitId: string }
  | { kind: 'editProject'; projectId: string };

/** The app's navigable location: which army screen, and which sheet over it. */
export interface NavLoc {
  projectId: string | null;
  sheet: SheetState | null;
}

const HOME: NavLoc = { projectId: null, sheet: null };

/**
 * Drives navigation through the browser History API so native back/forward
 * (and the Android/mobile back gesture) move between screens and close sheets.
 *
 * Only genuine destinations go through here — screens and modal sheets. In-page
 * state such as search, status filters and status changes stays local and does
 * NOT create history entries, so it never clutters the back stack.
 */
export function useNav() {
  const [loc, setLoc] = useState<NavLoc>(HOME);

  useEffect(() => {
    // Anchor the first entry so the initial state is restorable.
    history.replaceState({ nav: HOME }, '');
    const onPop = (e: PopStateEvent) => {
      const next = (e.state?.nav as NavLoc | undefined) ?? HOME;
      setLoc(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** Navigate to a new location, adding a history entry. */
  const push = useCallback((next: NavLoc) => {
    history.pushState({ nav: next }, '');
    setLoc(next);
  }, []);

  /** Replace the current location without adding a history entry. */
  const replace = useCallback((next: NavLoc) => {
    history.replaceState({ nav: next }, '');
    setLoc(next);
  }, []);

  /** Go back one entry — same as the browser/OS back button. */
  const back = useCallback(() => history.back(), []);

  return { loc, push, replace, back };
}
